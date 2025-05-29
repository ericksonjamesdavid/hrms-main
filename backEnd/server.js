import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection, initializeDatabase } from "./config/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "./config/database.js"; // Import the pool

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware to debug routes
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${
      req.path
    } - Origin: ${req.get("Origin")}`
  );
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "HRMS API is running",
    timestamp: new Date().toISOString(),
    database: "MySQL",
  });
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.execute(
      "SELECT id, password FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Registration route
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user already exists
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    await pool.execute("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Database test endpoint
app.get("/test-db", async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.status(200).json({
        status: "success",
        message: "Database connection successful",
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database test failed",
      error: error.message,
    });
  }
});

// Add a route to create demo user
app.post("/api/create-demo-user", async (req, res) => {
  try {
    const email = "admin@hrms.com";
    const password = "password123";

    // Check if demo user already exists
    const [rows] = await pool.execute("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(200).json({ message: "Demo user already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert demo user
    await pool.execute("INSERT INTO users (email, password) VALUES (?, ?)", [
      email,
      hashedPassword,
    ]);

    res.status(201).json({ message: "Demo user created successfully" });
  } catch (error) {
    console.error("Create demo user error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Employee Management Routes

// Get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, email, department, position, phone, address, 
             hire_date, salary, status, created_at, updated_at 
      FROM employees 
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single employee
app.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute("SELECT * FROM employees WHERE id = ?", [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new employee
app.post("/api/employees", async (req, res) => {
  try {
    const {
      name,
      email,
      department,
      position,
      phone,
      address,
      hire_date,
      salary,
    } = req.body;

    // Validate required fields
    if (!name || !email || !department || !position) {
      return res.status(400).json({
        message: "Name, email, department, and position are required",
      });
    }

    // Check if employee email already exists
    const [existingEmployee] = await pool.execute(
      "SELECT id FROM employees WHERE email = ?",
      [email]
    );

    if (existingEmployee.length > 0) {
      return res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    }

    // Insert new employee
    const [result] = await pool.execute(
      `
      INSERT INTO employees (name, email, department, position, phone, address, hire_date, salary, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `,
      [
        name,
        email,
        department,
        position,
        phone || null,
        address || null,
        hire_date || new Date(),
        salary || null,
      ]
    );

    // Get the created employee
    const [newEmployee] = await pool.execute(
      "SELECT * FROM employees WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Employee added successfully",
      employee: newEmployee[0],
    });
  } catch (error) {
    console.error("Add employee error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(400)
        .json({ message: "Employee with this email already exists" });
    } else {
      res.status(500).json({ message: "Server error" });
    }
  }
});

// Update employee
app.put("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      department,
      position,
      phone,
      address,
      hire_date,
      salary,
      status,
    } = req.body;

    // Check if employee exists
    const [existingEmployee] = await pool.execute(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (existingEmployee.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Update employee
    await pool.execute(
      `
      UPDATE employees 
      SET name = ?, email = ?, department = ?, position = ?, phone = ?, 
          address = ?, hire_date = ?, salary = ?, status = ?
      WHERE id = ?
    `,
      [
        name,
        email,
        department,
        position,
        phone,
        address,
        hire_date,
        salary,
        status,
        id,
      ]
    );

    // Get updated employee
    const [updatedEmployee] = await pool.execute(
      "SELECT * FROM employees WHERE id = ?",
      [id]
    );

    res.json({
      message: "Employee updated successfully",
      employee: updatedEmployee[0],
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete employee
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if employee exists
    const [existingEmployee] = await pool.execute(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (existingEmployee.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Delete employee
    await pool.execute("DELETE FROM employees WHERE id = ?", [id]);

    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete employee error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Attendance Management Routes

// Get attendance for a specific date
app.get("/api/attendance/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        a.id as attendance_id,
        a.employee_id,
        a.date,
        a.check_in,
        a.check_out,
        a.status,
        a.hours_worked,
        a.notes,
        e.name as employee_name,
        e.department,
        e.position
      FROM attendance a
      JOIN employees e ON a.employee_id = e.id
      WHERE a.date = ?
      ORDER BY e.name
    `,
      [date]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all employees with their attendance status for a specific date
app.get("/api/attendance/full/:date", async (req, res) => {
  try {
    const { date } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        e.id as employee_id,
        e.name,
        e.department,
        e.position,
        e.status as employee_status,
        COALESCE(a.id, null) as attendance_id,
        COALESCE(a.check_in, null) as check_in,
        COALESCE(a.check_out, null) as check_out,
        COALESCE(a.status, 'Not Marked') as attendance_status,
        COALESCE(a.hours_worked, 0) as hours_worked,
        COALESCE(a.notes, '') as notes
      FROM employees e
      LEFT JOIN attendance a ON e.id = a.employee_id AND a.date = ?
      WHERE e.status = 'Active'
      ORDER BY e.name
    `,
      [date]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get full attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark attendance for a single employee
app.post("/api/attendance", async (req, res) => {
  try {
    const { employee_id, date, check_in, check_out, status, notes } = req.body;

    // Validate required fields
    if (!employee_id || !date || !status) {
      return res.status(400).json({
        message: "Employee ID, date, and status are required",
      });
    }

    // Calculate hours worked
    let hours_worked = 0;
    if (check_in && check_out && status !== "Absent") {
      const checkInTime = new Date(`2000-01-01 ${check_in}`);
      const checkOutTime = new Date(`2000-01-01 ${check_out}`);
      hours_worked = (checkOutTime - checkInTime) / (1000 * 60 * 60); // Convert to hours
    }

    // Check if attendance already exists for this employee and date
    const [existing] = await pool.execute(
      "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
      [employee_id, date]
    );

    if (existing.length > 0) {
      // Update existing attendance
      await pool.execute(
        `
        UPDATE attendance 
        SET check_in = ?, check_out = ?, status = ?, hours_worked = ?, notes = ?
        WHERE employee_id = ? AND date = ?
      `,
        [check_in, check_out, status, hours_worked, notes, employee_id, date]
      );

      res.json({ message: "Attendance updated successfully" });
    } else {
      // Insert new attendance record
      await pool.execute(
        `
        INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
        [employee_id, date, check_in, check_out, status, hours_worked, notes]
      );

      res.status(201).json({ message: "Attendance marked successfully" });
    }
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Bulk mark attendance for multiple employees
app.post("/api/attendance/bulk", async (req, res) => {
  try {
    const { date, attendanceRecords } = req.body;

    if (!date || !attendanceRecords || !Array.isArray(attendanceRecords)) {
      return res.status(400).json({
        message: "Date and attendance records array are required",
      });
    }

    // Begin transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      for (const record of attendanceRecords) {
        const { employee_id, check_in, check_out, status, notes } = record;

        // Calculate hours worked
        let hours_worked = 0;
        if (check_in && check_out && status !== "Absent") {
          const checkInTime = new Date(`2000-01-01 ${check_in}`);
          const checkOutTime = new Date(`2000-01-01 ${check_out}`);
          hours_worked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
        }

        // Check if attendance exists
        const [existing] = await connection.execute(
          "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
          [employee_id, date]
        );

        if (existing.length > 0) {
          // Update existing
          await connection.execute(
            `
            UPDATE attendance 
            SET check_in = ?, check_out = ?, status = ?, hours_worked = ?, notes = ?
            WHERE employee_id = ? AND date = ?
          `,
            [
              check_in,
              check_out,
              status,
              hours_worked,
              notes,
              employee_id,
              date,
            ]
          );
        } else {
          // Insert new
          await connection.execute(
            `
            INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
            [
              employee_id,
              date,
              check_in,
              check_out,
              status,
              hours_worked,
              notes,
            ]
          );
        }
      }

      await connection.commit();
      connection.release();

      res.json({ message: "Bulk attendance marked successfully" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Bulk mark attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get attendance statistics for a date range
app.get("/api/attendance/stats/:startDate/:endDate", async (req, res) => {
  try {
    const { startDate, endDate } = req.params;

    const [stats] = await pool.execute(
      `
      SELECT 
        COUNT(CASE WHEN status = 'Present' THEN 1 END) as present_count,
        COUNT(CASE WHEN status = 'Absent' THEN 1 END) as absent_count,
        COUNT(CASE WHEN status = 'Late' THEN 1 END) as late_count,
        COUNT(CASE WHEN status = 'Half Day' THEN 1 END) as half_day_count,
        COUNT(*) as total_records,
        AVG(hours_worked) as average_hours,
        (SELECT COUNT(*) FROM employees WHERE status = 'Active') as total_active_employees
      FROM attendance 
      WHERE date BETWEEN ? AND ?
    `,
      [startDate, endDate]
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("Get attendance stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete attendance record
app.delete("/api/attendance/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute("DELETE FROM attendance WHERE id = ?", [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.json({ message: "Attendance record deleted successfully" });
  } catch (error) {
    console.error("Delete attendance error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "HRMS Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      database_test: "/test-db",
    },
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Start server
const startServer = async () => {
  try {
    console.log("🚀 Starting HRMS Backend Server...");
    console.log("=".repeat(50));

    // Test database connection
    console.log("\n📊 Testing Database Connection:");
    const dbConnected = await testConnection();

    if (dbConnected) {
      console.log("\n🏗️  Setting up database:");
      await initializeDatabase();

      // Automatically create demo user on startup
      console.log("\n👤 Setting up demo user:");
      try {
        const email = "admin@hrms.com";
        const password = "password123";

        const [rows] = await pool.execute(
          "SELECT id FROM users WHERE email = ?",
          [email]
        );
        if (rows.length === 0) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await pool.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [email, hashedPassword]
          );
          console.log("✅ Demo user created successfully");
        } else {
          console.log("✅ Demo user already exists");
        }
      } catch (error) {
        console.error("❌ Demo user setup failed:", error.message);
      }
    } else {
      console.log(
        "\n⚠️  Database connection failed, but server will start anyway"
      );
      console.log(
        "   You can fix the database issue and test again via /test-db endpoint"
      );
    }

    // Start listening
    app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`✅ HRMS API Server running on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Database test: http://localhost:${PORT}/test-db`);
      console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(
        `🔑 JWT Secret configured: ${process.env.JWT_SECRET ? "Yes" : "No"}`
      );
      console.log("\nAvailable API routes:");
      console.log("  POST /api/login");
      console.log("  POST /api/register");
      console.log("  GET  /api/employees");
      console.log("  POST /api/employees");
      console.log("  GET  /api/employees/:id");
      console.log("  PUT  /api/employees/:id");
      console.log("  DELETE /api/employees/:id");
      console.log("  GET  /api/attendance/full/:date");
      console.log("  GET  /api/attendance/:date");
      console.log("  POST /api/attendance");
      console.log("  POST /api/attendance/bulk");
      console.log("  GET  /api/attendance/stats/:startDate/:endDate");
      console.log("  DELETE /api/attendance/:id");
      console.log("  POST /api/create-demo-user");
      console.log("  GET  /test-db");
      console.log("  GET  /health");
      console.log("=".repeat(50));
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Received SIGINT. Graceful shutdown...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Received SIGTERM. Graceful shutdown...");
  process.exit(0);
});

startServer();

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

// Leave Request Management Routes

// Get all leave requests with employee details
app.get("/api/leave-requests", async (req, res) => {
  try {
    const { status, employee_id } = req.query;

    let query = `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
    `;

    const conditions = [];
    const params = [];

    if (status && status !== "All") {
      conditions.push("lr.status = ?");
      params.push(status);
    }

    if (employee_id) {
      conditions.push("lr.employee_id = ?");
      params.push(employee_id);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY lr.created_at DESC";

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Get leave requests error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single leave request
app.get("/api/leave-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.department,
        e.position,
        e.email
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.id = ?
    `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get leave request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create new leave request
app.post("/api/leave-requests", async (req, res) => {
  try {
    const { employee_id, leave_type, start_date, end_date, reason } = req.body;

    // Validate required fields
    if (!employee_id || !leave_type || !start_date || !end_date || !reason) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Calculate days requested
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days_requested = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (days_requested <= 0) {
      return res.status(400).json({
        message: "End date must be after start date",
      });
    }

    // Check if employee exists
    const [employeeCheck] = await pool.execute(
      "SELECT id FROM employees WHERE id = ?",
      [employee_id]
    );

    if (employeeCheck.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Insert leave request
    const [result] = await pool.execute(
      `
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason) 
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [employee_id, leave_type, start_date, end_date, days_requested, reason]
    );

    // Get the created leave request with employee details
    const [newRequest] = await pool.execute(
      `
      SELECT 
        lr.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM leave_requests lr
      JOIN employees e ON lr.employee_id = e.id
      WHERE lr.id = ?
    `,
      [result.insertId]
    );

    res.status(201).json({
      message: "Leave request created successfully",
      leave_request: newRequest[0],
    });
  } catch (error) {
    console.error("Create leave request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update leave request status (approve/reject)
app.put("/api/leave-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Check if leave request exists
    const [existingRequest] = await pool.execute(
      "SELECT * FROM leave_requests WHERE id = ?",
      [id]
    );

    if (existingRequest.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update leave request
      await connection.execute(
        `
        UPDATE leave_requests 
        SET status = ?, admin_notes = ?, reviewed_by_admin = TRUE, reviewed_date = CURRENT_DATE
        WHERE id = ?
      `,
        [status, admin_notes || null, id]
      );

      // If approved, update leave balance
      if (status === "Approved") {
        const request = existingRequest[0];

        // Check if leave balance exists for this employee and leave type
        const [balanceCheck] = await connection.execute(
          `
          SELECT * FROM leave_balances 
          WHERE employee_id = ? AND leave_type = ? AND year = YEAR(CURRENT_DATE)
        `,
          [request.employee_id, request.leave_type]
        );

        if (balanceCheck.length === 0) {
          // Create initial balance if it doesn't exist
          await connection.execute(
            `
            INSERT INTO leave_balances (employee_id, leave_type, allocated_days, used_days) 
            VALUES (?, ?, 20, ?)
          `,
            [request.employee_id, request.leave_type, request.days_requested]
          );
        } else {
          // Update existing balance
          await connection.execute(
            `
            UPDATE leave_balances 
            SET used_days = used_days + ?
            WHERE employee_id = ? AND leave_type = ? AND year = YEAR(CURRENT_DATE)
          `,
            [request.days_requested, request.employee_id, request.leave_type]
          );
        }
      }

      await connection.commit();
      connection.release();

      // Get updated leave request
      const [updatedRequest] = await pool.execute(
        `
        SELECT 
          lr.*,
          e.name as employee_name,
          e.department,
          e.position
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        WHERE lr.id = ?
      `,
        [id]
      );

      res.json({
        message: `Leave request ${status.toLowerCase()} successfully`,
        leave_request: updatedRequest[0],
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Update leave request status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave balances for an employee
app.get("/api/leave-balances/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;
    const { year } = req.query;
    const currentYear = year || new Date().getFullYear();

    const [rows] = await pool.execute(
      `
      SELECT 
        lb.*,
        e.name as employee_name
      FROM leave_balances lb
      JOIN employees e ON lb.employee_id = e.id
      WHERE lb.employee_id = ? AND lb.year = ?
    `,
      [employee_id, currentYear]
    );

    res.json(rows);
  } catch (error) {
    console.error("Get leave balances error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get leave statistics
app.get("/api/leave-requests/stats", async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_count,
        COUNT(*) as total_requests,
        COUNT(CASE WHEN leave_type = 'Annual' THEN 1 END) as annual_leave_count,
        COUNT(CASE WHEN leave_type = 'Sick' THEN 1 END) as sick_leave_count,
        SUM(CASE WHEN status = 'Approved' THEN days_requested ELSE 0 END) as total_approved_days
      FROM leave_requests 
      WHERE YEAR(applied_date) = YEAR(CURRENT_DATE)
    `);

    res.json(stats[0]);
  } catch (error) {
    console.error("Get leave stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete leave request
app.delete("/api/leave-requests/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if leave request exists
    const [existingRequest] = await pool.execute(
      "SELECT * FROM leave_requests WHERE id = ?",
      [id]
    );

    if (existingRequest.length === 0) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // If it was approved, need to adjust leave balance
    if (existingRequest[0].status === "Approved") {
      await pool.execute(
        `
        UPDATE leave_balances 
        SET used_days = used_days - ?
        WHERE employee_id = ? AND leave_type = ? AND year = YEAR(?)
      `,
        [
          existingRequest[0].days_requested,
          existingRequest[0].employee_id,
          existingRequest[0].leave_type,
          existingRequest[0].start_date,
        ]
      );
    }

    // Delete leave request
    await pool.execute("DELETE FROM leave_requests WHERE id = ?", [id]);

    res.json({ message: "Leave request deleted successfully" });
  } catch (error) {
    console.error("Delete leave request error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Payroll Management Routes

// Get payroll settings for an employee
app.get("/api/payroll-settings/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;

    const [rows] = await pool.execute(
      `
      SELECT 
        ps.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM payroll_settings ps
      JOIN employees e ON ps.employee_id = e.id
      WHERE ps.employee_id = ?
      ORDER BY ps.effective_from DESC
      LIMIT 1
    `,
      [employee_id]
    );

    if (rows.length === 0) {
      // Return default settings if none exist
      const [employee] = await pool.execute(
        "SELECT name, department, position FROM employees WHERE id = ?",
        [employee_id]
      );

      if (employee.length === 0) {
        return res.status(404).json({ message: "Employee not found" });
      }

      return res.json({
        employee_id: parseInt(employee_id),
        hourly_rate: 15.0,
        overtime_rate: 22.5,
        regular_hours_per_day: 8.0,
        working_days_per_month: 22,
        bonus: 0.0,
        deductions: 0.0,
        employee_name: employee[0].name,
        department: employee[0].department,
        position: employee[0].position,
      });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Get payroll settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update payroll settings for an employee
app.put("/api/payroll-settings/:employee_id", async (req, res) => {
  try {
    const { employee_id } = req.params;
    const {
      hourly_rate,
      overtime_rate,
      regular_hours_per_day,
      working_days_per_month,
      bonus,
      deductions,
    } = req.body;

    // Check if employee exists
    const [employeeCheck] = await pool.execute(
      "SELECT id FROM employees WHERE id = ?",
      [employee_id]
    );

    if (employeeCheck.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Insert or update payroll settings
    await pool.execute(
      `
      INSERT INTO payroll_settings 
      (employee_id, hourly_rate, overtime_rate, regular_hours_per_day, working_days_per_month, bonus, deductions)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      hourly_rate = VALUES(hourly_rate),
      overtime_rate = VALUES(overtime_rate),
      regular_hours_per_day = VALUES(regular_hours_per_day),
      working_days_per_month = VALUES(working_days_per_month),
      bonus = VALUES(bonus),
      deductions = VALUES(deductions),
      effective_from = CURRENT_DATE,
      updated_at = CURRENT_TIMESTAMP
    `,
      [
        employee_id,
        hourly_rate,
        overtime_rate,
        regular_hours_per_day,
        working_days_per_month,
        bonus,
        deductions,
      ]
    );

    res.json({ message: "Payroll settings updated successfully" });
  } catch (error) {
    console.error("Update payroll settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Calculate payroll for a specific period
app.post("/api/payroll/calculate", async (req, res) => {
  try {
    const { employee_id, start_date, end_date } = req.body;

    if (!employee_id || !start_date || !end_date) {
      return res.status(400).json({
        message: "Employee ID, start date, and end date are required",
      });
    }

    // Get employee payroll settings
    const [settingsRows] = await pool.execute(
      `
      SELECT * FROM payroll_settings 
      WHERE employee_id = ? 
      ORDER BY effective_from DESC 
      LIMIT 1
    `,
      [employee_id]
    );

    let settings;
    if (settingsRows.length === 0) {
      // Use default settings
      settings = {
        hourly_rate: 15.0,
        overtime_rate: 22.5,
        regular_hours_per_day: 8.0,
        bonus: 0.0,
        deductions: 0.0,
      };
    } else {
      settings = settingsRows[0];
    }

    // Get attendance data for the period
    const [attendanceRows] = await pool.execute(
      `
      SELECT 
        date,
        hours_worked,
        status
      FROM attendance 
      WHERE employee_id = ? 
        AND date BETWEEN ? AND ?
        AND status IN ('Present', 'Late', 'Half Day')
      ORDER BY date
    `,
      [employee_id, start_date, end_date]
    );

    // Calculate total hours
    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let workingDays = 0;

    attendanceRows.forEach((record) => {
      const hoursWorked = parseFloat(record.hours_worked) || 0;
      totalHours += hoursWorked;
      workingDays++;

      if (hoursWorked <= settings.regular_hours_per_day) {
        regularHours += hoursWorked;
      } else {
        regularHours += settings.regular_hours_per_day;
        overtimeHours += hoursWorked - settings.regular_hours_per_day;
      }
    });

    // Calculate pay
    const regularPay = regularHours * settings.hourly_rate;
    const overtimePay = overtimeHours * settings.overtime_rate;
    const grossPay = regularPay + overtimePay + settings.bonus;
    const netPay = grossPay - settings.deductions;

    // Check if payroll record already exists
    const [existingRecord] = await pool.execute(
      `
      SELECT id FROM payroll_records 
      WHERE employee_id = ? AND pay_period_start = ? AND pay_period_end = ?
    `,
      [employee_id, start_date, end_date]
    );

    if (existingRecord.length > 0) {
      // Update existing record
      await pool.execute(
        `
        UPDATE payroll_records 
        SET 
          regular_hours = ?,
          overtime_hours = ?,
          total_hours = ?,
          hourly_rate = ?,
          overtime_rate = ?,
          regular_pay = ?,
          overtime_pay = ?,
          gross_pay = ?,
          bonus = ?,
          deductions = ?,
          net_pay = ?,
          status = 'Calculated'
        WHERE id = ?
      `,
        [
          regularHours,
          overtimeHours,
          totalHours,
          settings.hourly_rate,
          settings.overtime_rate,
          regularPay,
          overtimePay,
          grossPay,
          settings.bonus,
          settings.deductions,
          netPay,
          existingRecord[0].id,
        ]
      );
    } else {
      // Insert new record
      await pool.execute(
        `
        INSERT INTO payroll_records 
        (employee_id, pay_period_start, pay_period_end, regular_hours, overtime_hours, 
         total_hours, hourly_rate, overtime_rate, regular_pay, overtime_pay, 
         gross_pay, bonus, deductions, net_pay, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Calculated')
      `,
        [
          employee_id,
          start_date,
          end_date,
          regularHours,
          overtimeHours,
          totalHours,
          settings.hourly_rate,
          settings.overtime_rate,
          regularPay,
          overtimePay,
          grossPay,
          settings.bonus,
          settings.deductions,
          netPay,
        ]
      );
    }

    // Get the complete payroll record with employee details
    const [payrollRecord] = await pool.execute(
      `
      SELECT 
        pr.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM payroll_records pr
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.employee_id = ? AND pr.pay_period_start = ? AND pr.pay_period_end = ?
    `,
      [employee_id, start_date, end_date]
    );

    res.json({
      message: "Payroll calculated successfully",
      payroll: payrollRecord[0],
      attendance_summary: {
        working_days: workingDays,
        total_hours: totalHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
      },
    });
  } catch (error) {
    console.error("Calculate payroll error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all payroll records
app.get("/api/payroll", async (req, res) => {
  try {
    const { employee_id, status, start_date, end_date } = req.query;

    let query = `
      SELECT 
        pr.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM payroll_records pr
      JOIN employees e ON pr.employee_id = e.id
    `;

    const conditions = [];
    const params = [];

    if (employee_id) {
      conditions.push("pr.employee_id = ?");
      params.push(employee_id);
    }

    if (status && status !== "All") {
      conditions.push("pr.status = ?");
      params.push(status);
    }

    if (start_date && end_date) {
      conditions.push("pr.pay_period_start >= ? AND pr.pay_period_end <= ?");
      params.push(start_date, end_date);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY pr.pay_period_start DESC, e.name";

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Get payroll records error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update payroll record status
app.put("/api/payroll/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!["Calculated", "Approved", "Paid"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updateFields = ["status = ?", "notes = ?"];
    const updateParams = [status, notes || null];

    if (status === "Approved") {
      updateFields.push("approved_at = CURRENT_TIMESTAMP");
    } else if (status === "Paid") {
      updateFields.push("paid_at = CURRENT_TIMESTAMP");
    }

    await pool.execute(
      `
      UPDATE payroll_records 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `,
      [...updateParams, id]
    );

    // Get updated record
    const [updatedRecord] = await pool.execute(
      `
      SELECT 
        pr.*,
        e.name as employee_name,
        e.department,
        e.position
      FROM payroll_records pr
      JOIN employees e ON pr.employee_id = e.id
      WHERE pr.id = ?
    `,
      [id]
    );

    res.json({
      message: `Payroll ${status.toLowerCase()} successfully`,
      payroll: updatedRecord[0],
    });
  } catch (error) {
    console.error("Update payroll status error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get payroll statistics
app.get("/api/payroll/stats", async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    const [stats] = await pool.execute(
      `
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'Draft' THEN 1 END) as draft_count,
        COUNT(CASE WHEN status = 'Calculated' THEN 1 END) as calculated_count,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'Paid' THEN 1 END) as paid_count,
        SUM(CASE WHEN status IN ('Approved', 'Paid') THEN gross_pay ELSE 0 END) as total_gross_pay,
        SUM(CASE WHEN status IN ('Approved', 'Paid') THEN net_pay ELSE 0 END) as total_net_pay,
        SUM(CASE WHEN status IN ('Approved', 'Paid') THEN total_hours ELSE 0 END) as total_hours_paid,
        AVG(CASE WHEN status IN ('Approved', 'Paid') THEN net_pay ELSE NULL END) as average_net_pay
      FROM payroll_records 
      WHERE YEAR(pay_period_start) = ? AND MONTH(pay_period_start) = ?
    `,
      [currentYear, currentMonth]
    );

    res.json(stats[0]);
  } catch (error) {
    console.error("Get payroll stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete payroll record
app.delete("/api/payroll/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.execute(
      "DELETE FROM payroll_records WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payroll record not found" });
    }

    res.json({ message: "Payroll record deleted successfully" });
  } catch (error) {
    console.error("Delete payroll error:", error);
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
      console.log("  GET  /api/leave-requests");
      console.log("  GET  /api/leave-requests/:id");
      console.log("  POST /api/leave-requests");
      console.log("  PUT  /api/leave-requests/:id/status");
      console.log("  GET  /api/leave-balances/:employee_id");
      console.log("  GET  /api/leave-requests/stats");
      console.log("  DELETE /api/leave-requests/:id");
      console.log("  GET  /api/payroll-settings/:employee_id");
      console.log("  PUT  /api/payroll-settings/:employee_id");
      console.log("  POST /api/payroll/calculate");
      console.log("  GET  /api/payroll");
      console.log("  PUT  /api/payroll/:id/status");
      console.log("  GET  /api/payroll/stats");
      console.log("  DELETE /api/payroll/:id");
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

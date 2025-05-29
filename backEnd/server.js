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
const allowedOrigins =
  process.env.FRONTEND_URL === "*"
    ? true // Allow all origins in development
    : process.env.FRONTEND_URL.split(",").map((url) => url.trim());

app.use(
  cors({
    origin: allowedOrigins,
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
    app.listen(PORT, "0.0.0.0", () => {
      console.log("\n" + "=".repeat(50));
      console.log(`✅ HRMS API Server running on port ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`🌐 Network URL: http://0.0.0.0:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🔧 Database test: http://localhost:${PORT}/test-db`);
      console.log(`🎯 CORS Origins: ${process.env.FRONTEND_URL}`);
      console.log(
        `🔑 JWT Secret configured: ${process.env.JWT_SECRET ? "Yes" : "No"}`
      );
      console.log("\nAvailable API routes:");
      console.log("  POST /api/login");
      console.log("  POST /api/register");
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

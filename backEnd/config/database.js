import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "jameserickson0411",
  database: process.env.DB_NAME || "hrms_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async () => {
  try {
    console.log("🔍 Testing database connection...");
    console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
    console.log(`Database: ${dbConfig.database}`);
    console.log(`User: ${dbConfig.user}`);

    const connection = await pool.getConnection();
    console.log("✅ Database connected successfully!");

    // Test a simple query
    const [rows] = await connection.execute("SELECT 1 as test");
    console.log("✅ Database query test successful:", rows[0]);

    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);

    // Provide specific troubleshooting
    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Connection refused. Possible solutions:");
      console.error("   1. Make sure MySQL server is running");
      console.error("   2. Check if MySQL is running on port 3306");
      console.error("   3. Verify MySQL service is started");
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n💡 Access denied. Possible solutions:");
      console.error("   1. Check username and password in .env file");
      console.error("   2. Make sure the user has proper permissions");
      console.error("   3. Try creating a dedicated MySQL user for the app");
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("\n💡 Database doesn't exist. Solution:");
      console.error("   1. Create the database in MySQL Workbench:");
      console.error("      CREATE DATABASE hrms_db;");
    }

    return false;
  }
};

// Initialize basic table structure (including users table)
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database tables...");
    const connection = await pool.getConnection();

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        department VARCHAR(100) NOT NULL,
        position VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        hire_date DATE,
        salary DECIMAL(10,2),
        status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status ENUM('Present', 'Absent', 'Late', 'Half Day', 'Holiday') NOT NULL,
        hours_worked DECIMAL(4,2) DEFAULT 0,
        notes TEXT,
        marked_by_admin BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_date (employee_id, date)
      )
    `);

    console.log("✅ Users table initialized successfully");
    console.log("✅ Employees table initialized successfully");
    console.log("✅ Attendance table initialized successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
};

export default pool;

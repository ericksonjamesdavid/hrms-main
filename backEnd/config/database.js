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

    // Create leave_requests table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        leave_type ENUM('Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency', 'Unpaid') NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_requested INT NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        reviewed_by_admin BOOLEAN DEFAULT FALSE,
        admin_notes TEXT,
        applied_date DATE DEFAULT (CURRENT_DATE),
        reviewed_date DATE NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create leave_balances table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_balances (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        leave_type ENUM('Annual', 'Sick', 'Personal', 'Maternity', 'Paternity', 'Emergency', 'Unpaid') NOT NULL,
        allocated_days INT DEFAULT 0,
        used_days INT DEFAULT 0,
        remaining_days INT GENERATED ALWAYS AS (allocated_days - used_days) STORED,
        year YEAR DEFAULT (YEAR(CURRENT_DATE)),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_leave_year (employee_id, leave_type, year)
      )
    `);

    // Create payroll_settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 15.00,
        overtime_rate DECIMAL(10,2) NOT NULL DEFAULT 22.50,
        regular_hours_per_day DECIMAL(4,2) DEFAULT 8.00,
        working_days_per_month INT DEFAULT 22,
        bonus DECIMAL(10,2) DEFAULT 0.00,
        deductions DECIMAL(10,2) DEFAULT 0.00,
        effective_from DATE DEFAULT (CURRENT_DATE),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
      )
    `);

    // Create payroll_records table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payroll_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        pay_period_start DATE NOT NULL,
        pay_period_end DATE NOT NULL,
        regular_hours DECIMAL(6,2) DEFAULT 0.00,
        overtime_hours DECIMAL(6,2) DEFAULT 0.00,
        total_hours DECIMAL(6,2) DEFAULT 0.00,
        hourly_rate DECIMAL(10,2) NOT NULL,
        overtime_rate DECIMAL(10,2) NOT NULL,
        regular_pay DECIMAL(10,2) DEFAULT 0.00,
        overtime_pay DECIMAL(10,2) DEFAULT 0.00,
        gross_pay DECIMAL(10,2) DEFAULT 0.00,
        bonus DECIMAL(10,2) DEFAULT 0.00,
        deductions DECIMAL(10,2) DEFAULT 0.00,
        net_pay DECIMAL(10,2) DEFAULT 0.00,
        status ENUM('Draft', 'Calculated', 'Approved', 'Paid') DEFAULT 'Draft',
        generated_by_admin BOOLEAN DEFAULT TRUE,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approved_at TIMESTAMP NULL,
        paid_at TIMESTAMP NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY unique_employee_period (employee_id, pay_period_start, pay_period_end)
      )
    `);

    console.log("✅ Users table initialized successfully");
    console.log("✅ Employees table initialized successfully");
    console.log("✅ Attendance table initialized successfully");
    console.log("✅ Leave requests table initialized successfully");
    console.log("✅ Leave balances table initialized successfully");
    console.log("✅ Payroll settings table initialized successfully");
    console.log("✅ Payroll records table initialized successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    return false;
  }
};

export default pool;

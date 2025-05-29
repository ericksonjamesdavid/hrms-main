// Always use localhost for backend API calls since each developer runs their own backend
const API_BASE_URL = "http://localhost:5000";

// API service for authentication
export const authAPI = {
  // Login function
  login: async (email, password) => {
    try {
      console.log("Attempting login to:", `${API_BASE_URL}/api/login`);

      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login response status:", response.status);

      const data = await response.json();
      console.log("Login response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store token in localStorage
      localStorage.setItem("token", data.token);
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Network error occurred");
    }
  },

  // Register function
  register: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      throw new Error(error.message || "Network error occurred");
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem("token");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      // Basic token validation (check if it's expired)
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Test server connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      console.log("Server health check:", data);
      return response.ok;
    } catch (error) {
      console.error("Server connection test failed:", error);
      return false;
    }
  },
};

// API service for employee management
export const employeeAPI = {
  // Get all employees
  getAll: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }

      return await response.json();
    } catch (error) {
      console.error("Get employees error:", error);
      throw error;
    }
  },

  // Get single employee
  getById: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employee");
      }

      return await response.json();
    } catch (error) {
      console.error("Get employee error:", error);
      throw error;
    }
  },

  // Add new employee
  create: async (employeeData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add employee");
      }

      return data;
    } catch (error) {
      console.error("Add employee error:", error);
      throw error;
    }
  },

  // Update employee
  update: async (id, employeeData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update employee");
      }

      return data;
    } catch (error) {
      console.error("Update employee error:", error);
      throw error;
    }
  },

  // Delete employee
  delete: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete employee");
      }

      return data;
    } catch (error) {
      console.error("Delete employee error:", error);
      throw error;
    }
  },
};

// API service for attendance management
export const attendanceAPI = {
  // Get attendance for a specific date
  getByDate: async (date) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/attendance/${date}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch attendance");
      }

      return await response.json();
    } catch (error) {
      console.error("Get attendance error:", error);
      throw error;
    }
  },

  // Get all employees with attendance status for a date
  getFullAttendance: async (date) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/attendance/full/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch full attendance");
      }

      return await response.json();
    } catch (error) {
      console.error("Get full attendance error:", error);
      throw error;
    }
  },

  // Mark attendance for single employee
  markAttendance: async (attendanceData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/attendance`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to mark attendance");
      }

      return data;
    } catch (error) {
      console.error("Mark attendance error:", error);
      throw error;
    }
  },

  // Bulk mark attendance
  bulkMarkAttendance: async (date, attendanceRecords) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/attendance/bulk`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ date, attendanceRecords }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to bulk mark attendance");
      }

      return data;
    } catch (error) {
      console.error("Bulk mark attendance error:", error);
      throw error;
    }
  },

  // Get attendance statistics
  getStats: async (startDate, endDate) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/attendance/stats/${startDate}/${endDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Get attendance stats error:", error);
      throw error;
    }
  },

  // Delete attendance record
  delete: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/attendance/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete attendance");
      }

      return data;
    } catch (error) {
      console.error("Delete attendance error:", error);
      throw error;
    }
  },
};

// API service for leave request management
export const leaveRequestAPI = {
  // Get all leave requests
  getAll: async (status = null) => {
    try {
      const token = localStorage.getItem("token");
      const url = status
        ? `${API_BASE_URL}/api/leave-requests?status=${status}`
        : `${API_BASE_URL}/api/leave-requests`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      return await response.json();
    } catch (error) {
      console.error("Get leave requests error:", error);
      throw error;
    }
  },

  // Get single leave request
  getById: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave request");
      }

      return await response.json();
    } catch (error) {
      console.error("Get leave request error:", error);
      throw error;
    }
  },

  // Create new leave request
  create: async (leaveRequestData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/leave-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leaveRequestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create leave request");
      }

      return data;
    } catch (error) {
      console.error("Create leave request error:", error);
      throw error;
    }
  },

  // Update leave request status
  updateStatus: async (id, status, admin_notes = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/leave-requests/${id}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, admin_notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update leave request");
      }

      return data;
    } catch (error) {
      console.error("Update leave request error:", error);
      throw error;
    }
  },

  // Get leave balances for employee
  getBalances: async (employeeId, year = null) => {
    try {
      const token = localStorage.getItem("token");
      const url = year
        ? `${API_BASE_URL}/api/leave-balances/${employeeId}?year=${year}`
        : `${API_BASE_URL}/api/leave-balances/${employeeId}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave balances");
      }

      return await response.json();
    } catch (error) {
      console.error("Get leave balances error:", error);
      throw error;
    }
  },

  // Get leave statistics
  getStats: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch leave statistics");
      }

      return await response.json();
    } catch (error) {
      console.error("Get leave stats error:", error);
      throw error;
    }
  },

  // Delete leave request
  delete: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/leave-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete leave request");
      }

      return data;
    } catch (error) {
      console.error("Delete leave request error:", error);
      throw error;
    }
  },
};

// API service for payroll management
export const payrollAPI = {
  // Get all payroll records
  getAll: async (filters = {}) => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      Object.keys(filters).forEach((key) => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const url = queryParams.toString()
        ? `${API_BASE_URL}/api/payroll?${queryParams}`
        : `${API_BASE_URL}/api/payroll`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payroll records");
      }

      return await response.json();
    } catch (error) {
      console.error("Get payroll records error:", error);
      throw error;
    }
  },

  // Calculate payroll for an employee
  calculate: async (employee_id, start_date, end_date) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/payroll/calculate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee_id, start_date, end_date }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to calculate payroll");
      }

      return data;
    } catch (error) {
      console.error("Calculate payroll error:", error);
      throw error;
    }
  },

  // Update payroll status
  updateStatus: async (id, status, notes = "") => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/payroll/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, notes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update payroll status");
      }

      return data;
    } catch (error) {
      console.error("Update payroll status error:", error);
      throw error;
    }
  },

  // Get payroll statistics
  getStats: async (year = null, month = null) => {
    try {
      const token = localStorage.getItem("token");
      const queryParams = new URLSearchParams();

      if (year) queryParams.append("year", year);
      if (month) queryParams.append("month", month);

      const url = queryParams.toString()
        ? `${API_BASE_URL}/api/payroll/stats?${queryParams}`
        : `${API_BASE_URL}/api/payroll/stats`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payroll stats");
      }

      return await response.json();
    } catch (error) {
      console.error("Get payroll stats error:", error);
      throw error;
    }
  },

  // Delete payroll record
  delete: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/payroll/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete payroll record");
      }

      return data;
    } catch (error) {
      console.error("Delete payroll error:", error);
      throw error;
    }
  },

  // Get payroll settings for an employee
  getSettings: async (employee_id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/payroll-settings/${employee_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payroll settings");
      }

      return await response.json();
    } catch (error) {
      console.error("Get payroll settings error:", error);
      throw error;
    }
  },

  // Update payroll settings for an employee
  updateSettings: async (employee_id, settings) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/payroll-settings/${employee_id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update payroll settings");
      }

      return data;
    } catch (error) {
      console.error("Update payroll settings error:", error);
      throw error;
    }
  },
};

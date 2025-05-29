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

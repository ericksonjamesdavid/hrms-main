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

// Import necessary components from React Router for routing
import {
  BrowserRouter as Router, // Main router component
  Routes, // Component to define a set of routes
  Route, // Component to define a single route
  Navigate, // Component to redirect to a different route
} from "react-router-dom";
import { useState, useEffect } from "react"; // Importing useState and useEffect hooks for managing component state and side effects
import Layout from "@/components/Layout"; // Importing the main layout component
import Dashboard from "@/pages/Dashboard"; // Importing the Dashboard page
import Employees from "@/pages/Employees"; // Importing the Employees page
import Attendance from "@/pages/Attendance"; // Importing the Attendance page
import LeaveRequests from "@/pages/LeaveRequests"; // Importing the Leave Requests page
import Payroll from "@/pages/Payroll"; // Importing the Payroll page
import Login from "@/pages/Login"; // Importing the Login page
import { authAPI } from "@/services/api"; // Import the API service

// Main App component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication status
  const [isLoading, setIsLoading] = useState(true); // Add loading state for initial auth check

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Test server connection first
        const serverOnline = await authAPI.testConnection();
        if (!serverOnline) {
          console.warn("Server is not reachable");
        }

        const isAuth = authAPI.isAuthenticated();
        setIsAuthenticated(isAuth);
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Protected Route Component to restrict access to certain routes
  const ProtectedRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" replace />; // Redirect to login if not authenticated
  };

  return (
    <Router>
      {" "}
      {/* Wrapping the application in the Router component */}
      <Routes>
        {" "}
        {/* Defining the application routes */}
        {/* Login Route */}
        <Route
          path="/login" // Path for the login page
          element={
            isAuthenticated ? ( // Check if user is authenticated
              <Navigate to="/dashboard" replace /> // Redirect to dashboard if authenticated
            ) : (
              <Login onLogin={handleLogin} /> // Pass handleLogin instead of inline function
            )
          }
        />
        {/* Protected Routes */}
        <Route
          path="/" // Base path for protected routes
          element={
            <ProtectedRoute>
              {" "}
              {/* Wrapping protected routes in the ProtectedRoute component */}
              <Layout onLogout={handleLogout} />{" "}
              {/* Pass logout handler to Layout */}
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />{" "}
          {/* Redirect to dashboard on base path */}
          <Route path="dashboard" element={<Dashboard />} />{" "}
          {/* Route for Dashboard page */}
          <Route path="employees" element={<Employees />} />{" "}
          {/* Route for Employees page */}
          <Route path="attendance" element={<Attendance />} />{" "}
          {/* Route for Attendance page */}
          <Route path="leave-requests" element={<LeaveRequests />} />{" "}
          {/* Route for Leave Requests page */}
          <Route path="payroll" element={<Payroll />} />{" "}
          {/* Route for Payroll page */}
        </Route>
        {/* Redirect all unknown routes to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />{" "}
        {/* Catch-all route to redirect to login */}
      </Routes>
    </Router>
  );
}

export default App; // Exporting the App component as the default export

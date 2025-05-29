// Import necessary dependencies from React and React Router
import { useState } from "react"; // Importing useState hook for managing component state
import { useNavigate } from "react-router-dom"; // Importing useNavigate for programmatic navigation

// Import custom UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importing card components for layout
import { Button } from "@/components/ui/button"; // Importing button component

// Import icons from Lucide React
import { Eye, EyeOff, User, Lock, Building2 } from "lucide-react"; // Importing icons for UI elements

// Define the Login component
export default function Login({ onLogin }) {
  // Initialize state variables for showPassword, email, password, and isLoading
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [email, setEmail] = useState(""); // State to hold the email input
  const [password, setPassword] = useState(""); // State to hold the password input
  const [isLoading, setIsLoading] = useState(false); // State to indicate loading status during login

  // Get the navigate function from React Router for navigation
  const navigate = useNavigate();

  // Define the handleLogin function to handle form submission
  const handleLogin = async (e) => {
    // Prevent default form submission behavior
    e.preventDefault();

    // Set isLoading to true to display the loading animation
    setIsLoading(true);

    // Simulate API call delay (replace with actual API call)
    setTimeout(() => {
      // Set isLoading to false after the delay
      setIsLoading(false);

      // Call the authentication callback passed as a prop
      onLogin();

      // Navigate to the dashboard after successful login
      navigate("/dashboard");
    }, 1000); // Simulated delay of 1 second
  };

  // Return the JSX for the Login component
  return (
    // Container element with gradient background
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4"
    style={{
        backgroundImage: "url('src/assets/background.jpg')", // set the backgroung image
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}>
      {/* Max-width container for the login form */}
      <div className="w-full max-w-md">
        {/* Header section with logo and welcome message */}
        <div className="text-center mb-8">
          <div
  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-600 to-green-700 rounded-2xl mb-4"
  style={{ boxShadow: '0 0 10px 4px rgba(255, 255, 255, 0.12)' }}
>
  <Building2 className="w-8 h-8 text-white" /> {/* Logo icon */}
</div>
          <h1 className="text-3xl font-bold bg-black bg-clip-text text-transparent">
            Welcome To Human Resource Management System {/* Main title */}
          </h1>
          <p className="text-gray-800 mt-2">Sign in to your HRMS account</p> {/* Subtitle */}
        </div>

        {/* Login card with form and buttons */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Sign In {/* Title for the login form */}
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access the system {/* Description */}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Login form with email and password fields */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email field with icon and input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address {/* Label for email input */}
                </label>
                <div className="relative">
                  <User  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /> {/* User icon */}
                  <input
                    type="email" // Input type for email
                    value={email} // Binding the input value to the email state
                    onChange={(e) => setEmail(e.target.value)} // Updating the email state on input change
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="admin@hrms.com" // Placeholder text for email input
                    required // Making the field required
                  />
                </div>
              </div>

              {/* Password field with icon, input, and show password button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password {/* Label for password input */}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /> {/* Lock icon */}
                  <input
                    type={showPassword ? "text" : "password"} // Toggle between text and password input types
                    value={password} // Binding the input value to the password state
                    onChange={(e) => setPassword(e.target.value)} // Updating the password state on input change
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password" // Placeholder text for password input
                    required // Making the field required
                  />
                  {/* Button to toggle password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)} // Toggle showPassword state
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" /> // Icon for hiding password
                    ) : (
                      <Eye className="w-4 h-4" /> // Icon for showing password
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me and forgot password links */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox" // Checkbox for "Remember me" option
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    Remember me {/* Label for the checkbox */}
                  </span>
                </label>
                <button
                  type="button" // Button for forgot password
                  className="text-sm text-green-500 hover:text-green-700 transition-colors"
                >
                  Forgot password? {/* Link for password recovery */}
                </button>
              </div>

              {/* Login button with loading animation */}
              <Button
                type="submit" // Submit button for the form
                disabled={isLoading} // Disable button while loading
                className="w-full bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
              >
                {isLoading ? ( // Conditional rendering for loading state
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> {/* Loading spinner */}
                    <span>Signing in...</span> {/* Loading text */}
                  </div>
                ) : (
                  "Sign In" // Default button text
                )}
              </Button>
            </form>

            {/* Demo credentials section for testing */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-green-200">
              <p className="text-xs font-medium text-green-900 mb-2">
                Demo Credentials: {/* Label for demo credentials */}
              </p>
              <div className="space-y-1 text-xs text-green-900">
                <p>
                  <span className="font-medium">Email:</span> admin@hrms.com {/* Demo email */}
                </p>
                <p>
                  <span className="font-medium">Password:</span> password123 {/* Demo password */}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer section with contact administrator link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-900">
            Don't have an account?{" "}
            <button className="text-green-900 hover:text-white font-medium transition-colors">
              Contact Administrator {/* Link to contact administrator */}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// Import necessary dependencies from React
import { useState } from "react"; // Importing useState hook for managing component state

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
import {
  DollarSign,
  Download,
  Calculator,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Search,
} from "lucide-react"; // Importing icons for UI elements

// Sample payroll data for employees
const payrollData = [
  {
    id: 1,
    name: "John Doe",
    employeeId: "EMP001",
    department: "Engineering",
    position: "Senior Developer",
    baseSalary: 85000,
    allowances: 5000,
    deductions: 3200,
    netSalary: 86800,
    status: "Processed", // Status of the payroll
    avatar: "JD", // Initials for the avatar
  },
  {
    id: 2,
    name: "Jane Smith",
    employeeId: "EMP002",
    department: "Marketing",
    position: "Marketing Manager",
    baseSalary: 75000,
    allowances: 4500,
    deductions: 2800,
    netSalary: 76700,
    status: "Processed",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    employeeId: "EMP003",
    department: "HR",
    position: "HR Specialist",
    baseSalary: 65000,
    allowances: 3000,
    deductions: 2500,
    netSalary: 65500,
    status: "Pending", // Status of the payroll
    avatar: "MJ",
  },
];

// Statistics for payroll management
const stats = [
  {
    name: "Total Payroll",
    value: "$847,260", // Total payroll amount
    icon: DollarSign, // Icon for the statistic
    color: "green", // Color for the statistic
    change: "+3.2%", // Change percentage from the previous period
  },
  {
    name: "Employees Paid",
    value: "232", // Number of employees paid
    icon: Users,
    color: "blue",
    change: "+1.5%",
  },
  {
    name: "Pending Payroll",
    value: "13", // Number of pending payrolls
    icon: Calendar,
    color: "yellow",
    change: "-0.8%",
  },
  {
    name: "Average Salary",
    value: "$3,650", // Average salary amount
    icon: TrendingUp,
    color: "purple",
    change: "+2.1%",
  },
];

// Mapping of color variants for statistics
const colorVariants = {
  green: "from-green-500 to-green-600",
  blue: "from-blue-500 to-blue-600",
  yellow: "from-yellow-500 to-yellow-600",
  purple: "from-purple-500 to-purple-600",
};

// Main Payroll component
export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term for filtering payroll data
  const [selectedMonth, setSelectedMonth] = useState("2024-01"); // State to hold the selected month for payroll

  // Filtering payroll data based on search term
  const filteredPayroll = payrollData.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || // Check if name includes search term
      employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) || // Check if employee ID includes search term
      employee.department.toLowerCase().includes(searchTerm.toLowerCase()) // Check if department includes search term
  );

  return (
    <div className="space-y-6">
      {/* Header section for Payroll Management */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Payroll Management {/* Main title */}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage employee salaries and payroll processing {/* Subtitle */}
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Button to export payroll data */}
            <Button variant="outline" className="bg-white/50 backdrop-blur-sm">
              <Download className="w-4 h-4 mr-2" />
              Export Payroll
            </Button>
            {/* Button to process payroll */}
            <Button className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500">
              <Calculator className="w-4 h-4 mr-2" />
              Process Payroll
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid displaying various payroll statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon; // Assigning the icon component to a variable
          return (
            <Card
              key={stat.name} // Unique key for each statistic card
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name} {/* Displaying the name of the statistic */}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${
                    colorVariants[stat.color] // Applying gradient color based on the statistic's color
                  } shadow-lg`}
                >
                  <Icon className="h-4 w-4 text-white" /> {/* Displaying the icon */}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value} {/* Displaying the value of the statistic */}
                </div>
                <p className="text-xs text-green-600 font-medium">
                  {stat.change} from last month {/* Displaying change percentage */}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter section */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /> {/* Search icon */}
              <input
                type="text" // Input field for searching payroll data
                placeholder="Search by name, employee ID, or department..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={searchTerm} // Binding the input value to the searchTerm state
                onChange={(e) => setSearchTerm(e.target.value)} // Updating the searchTerm state on input change
              />
            </div>
            {/* Input field for selecting the month */}
            <input
              type="month"
              value={selectedMonth} // Binding the selected month to the selectedMonth state
              onChange={(e) => setSelectedMonth(e.target.value)} // Updating the selectedMonth state on input change
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {/* Button to apply filters */}
            <Button variant="outline" className="bg-white/50 backdrop-blur-sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table displaying employee payroll details */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-green-600 to-green-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" /> {/* Dollar sign icon */}
            </div>
            <span>Employee Payroll</span> {/* Title for the payroll table */}
          </CardTitle>
          <CardDescription>
            Monthly salary breakdown for all employees {/* Description of the table */}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full"> {/* Table for displaying payroll data */}
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee {/* Column header for employee name */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Base Salary {/* Column header for base salary */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Allowances {/* Column header for allowances */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions {/* Column header for deductions */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Salary {/* Column header for net salary */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status {/* Column header for payroll status */}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions {/* Column header for action buttons */}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayroll.map((employee) => ( // Mapping through filtered payroll data
                  <tr
                    key={employee.id} // Unique key for each employee row
                    className="hover:bg-gray-50/50 transition-colors" // Hover effect for rows
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {employee.avatar} {/* Displaying employee initials */}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name} {/* Displaying employee name */}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employeeId} {/* Displaying employee ID */}
                          </div>
                          <div className="text-xs text-gray-400">
                            {employee.department} {/* Displaying employee department */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${employee.baseSalary.toLocaleString()} {/* Displaying base salary */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +${employee.allowances.toLocaleString()} {/* Displaying allowances */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                      -${employee.deductions.toLocaleString()} {/* Displaying deductions */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      ${employee.netSalary.toLocaleString()} {/* Displaying net salary */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.status === "Processed"
                            ? "bg-green-100 text-green-800" // Styling for processed status
                            : "bg-yellow-100 text-yellow-800" // Styling for pending status
                        }`}
                      >
                        {employee.status} {/* Displaying payroll status */}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Button to view details of the payroll */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/50"
                        >
                          View Details
                        </Button>
                        {employee.status === "Pending" && ( // Conditional rendering for processing button
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Process {/* Button to process pending payroll */}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

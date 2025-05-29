import { useState } from "react"; // Importing useState hook from React
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importing UI components for cards
import { Button } from "@/components/ui/button"; // Importing Button component
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
} from "lucide-react"; // Importing icons from lucide-react

// Sample attendance data for employees
const attendanceData = [
  {
    id: 1,
    name: "Erickson",
    date: "2024-01-15",
    checkIn: "09:00 AM",
    checkOut: "06:00 PM",
    status: "Present",
    hours: "9h 0m",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Ashley",
    date: "2024-01-15",
    checkIn: "08:45 AM",
    checkOut: "05:30 PM",
    status: "Present",
    hours: "8h 45m",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Thea love Janril",
    date: "2024-01-15",
    checkIn: "09:15 AM",
    checkOut: "06:15 PM",
    status: "Late",
    hours: "9h 0m",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Rotchen",
    date: "2024-01-15",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
    hours: "0h 0m",
    avatar: "SW",
  },
  {
    id: 5,
    name: "David Chen",
    date: "2024-01-15",
    checkIn: "08:30 AM",
    checkOut: "04:30 PM",
    status: "Half Day",
    hours: "8h 0m",
    avatar: "DC",
  },
];

// Sample statistics data for attendance
const stats = [
  {
    name: "Present Today",
    value: "185",
    icon: CheckCircle,
    color: "green",
    percentage: "94%",
  },
  {
    name: "Absent",
    value: "12",
    icon: XCircle,
    color: "red",
    percentage: "6%",
  },
  {
    name: "Late Arrivals",
    value: "8",
    icon: AlertTriangle,
    color: "yellow",
    percentage: "4%",
  },
  {
    name: "Average Hours",
    value: "8.5h",
    icon: Clock,
    color: "blue",
    percentage: "+0.5h",
  },
];

// Color variants for statistics cards
const colorVariants = {
  green: "from-green-500 to-green-600",
  red: "from-red-500 to-red-600",
  yellow: "from-yellow-500 to-yellow-600",
  blue: "from-blue-500 to-blue-600",
};

// Status colors for attendance records
const statusColors = {
  Present: "bg-green-100 text-green-800",
  Absent: "bg-red-100 text-red-800",
  Late: "bg-yellow-100 text-yellow-800",
  "Half Day": "bg-blue-100 text-blue-800",
};

// Main Attendance component
export default function Attendance() {
  // State to manage the selected date for attendance
  const [selectedDate, setSelectedDate] = useState("2024-01-15");

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Attendance Management
            </h1>
            <p className="mt-2 text-gray-600">
              Track and manage employee attendance records
            </p>
          </div>
          <div className="flex space-x-3">
            {/* Export Button */}
            <Button variant="outline" className="bg-white/50 backdrop-blur-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            {/* Mark Attendance Button */}
            <Button className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500">
              <Calendar className="w-4 h-4 mr-2" />
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon; // Get the icon component
          return (
            <Card
              key={stat.name}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${
                    colorVariants[stat.color]
                  } shadow-lg`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-gray-500">
                  {stat.percentage} of total employees
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Date Filter and Attendance Table Section */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-green-600 to-green-600 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span>Daily Attendance</span>
              </CardTitle>
              <CardDescription>
                Employee attendance for selected date
              </CardDescription>
            </div>
            <div className="flex space-x-3">
              {/* Date Input for selecting attendance date */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} // Update selected date
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Filter Button */}
              <Button
                variant="outline"
                className="bg-white/50 backdrop-blur-sm"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-sm font-bold text-white">
                            {record.avatar} {/* Display avatar initials */}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {record.name} {/* Display employee name */}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.date} {/* Display attendance date */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkIn} {/* Display check-in time */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.checkOut} {/* Display check-out time */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.hours} {/* Display total hours worked */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          statusColors[record.status] // Apply status color
                        }`}
                      >
                        {record.status} {/* Display attendance status */}
                      </span>
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

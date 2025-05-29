import { useState, useEffect } from "react"; // Add useEffect
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
  Search,
} from "lucide-react"; // Importing icons from lucide-react
import { attendanceAPI } from "@/services/api"; // Import attendance API

// Enhanced Modal for marking individual attendance
const AttendanceModal = ({
  isOpen,
  onClose,
  onSubmit,
  employee = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    check_in: "",
    check_out: "",
    status: "Present",
    notes: "",
  });

  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        check_in: employee.check_in || "",
        check_out: employee.check_out || "",
        status:
          employee.attendance_status === "Not Marked"
            ? "Present"
            : employee.attendance_status,
        notes: employee.notes || "",
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      employee_id: employee.employee_id,
      ...formData,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          Mark Attendance - {employee?.name}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
              <option value="Half Day">Half Day</option>
              <option value="Holiday">Holiday</option>
            </select>
          </div>

          {formData.status !== "Absent" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check In Time
                </label>
                <input
                  type="time"
                  value={formData.check_in}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      check_in: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Check Out Time
                </label>
                <input
                  type="time"
                  value={formData.check_out}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      check_out: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Load attendance data when date changes
  useEffect(() => {
    loadAttendanceData();
  }, [selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Load full attendance data (all employees with their status)
      const data = await attendanceAPI.getFullAttendance(selectedDate);
      setAttendanceData(data);

      // Load stats for current month
      const currentMonth = selectedDate.substring(0, 7);
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-31`;
      const statsData = await attendanceAPI.getStats(startDate, endDate);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load attendance:", error);
      setError("Failed to load attendance data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAttendance = async (attendanceData) => {
    try {
      setIsSubmitting(true);
      await attendanceAPI.markAttendance({
        ...attendanceData,
        date: selectedDate,
      });

      setIsModalOpen(false);
      setSelectedEmployee(null);
      await loadAttendanceData();
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkMarkPresent = async () => {
    try {
      const absentEmployees = attendanceData.filter(
        (emp) =>
          emp.attendance_status === "Not Marked" ||
          emp.attendance_status === "Absent"
      );

      if (absentEmployees.length === 0) {
        alert("All employees are already marked present!");
        return;
      }

      if (
        !window.confirm(`Mark ${absentEmployees.length} employees as present?`)
      ) {
        return;
      }

      const bulkData = absentEmployees.map((emp) => ({
        employee_id: emp.employee_id,
        check_in: "09:00",
        check_out: "17:00",
        status: "Present",
        notes: "Bulk marked by admin",
      }));

      await attendanceAPI.bulkMarkAttendance(selectedDate, bulkData);
      await loadAttendanceData();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const openAttendanceModal = (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "0h 0m";
    const start = new Date(`2000-01-01 ${checkIn}`);
    const end = new Date(`2000-01-01 ${checkOut}`);
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Calculate today's stats from data
  const todayStats = {
    present: attendanceData.filter((emp) => emp.attendance_status === "Present")
      .length,
    absent: attendanceData.filter((emp) => emp.attendance_status === "Absent")
      .length,
    late: attendanceData.filter((emp) => emp.attendance_status === "Late")
      .length,
    notMarked: attendanceData.filter(
      (emp) => emp.attendance_status === "Not Marked"
    ).length,
    total: attendanceData.length,
  };

  // Get unique departments from attendance data
  const departments = [
    "All",
    ...new Set(attendanceData.map((emp) => emp.department)),
  ];

  // Filter attendance data based on selected department and search term
  const filteredAttendanceData = attendanceData.filter((record) => {
    const matchesDepartment =
      selectedDepartment === "All" || record.department === selectedDepartment;
    const matchesSearch =
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDepartment && matchesSearch;
  });

  // Calculate filtered stats
  const filteredStats = {
    present: filteredAttendanceData.filter(
      (emp) => emp.attendance_status === "Present"
    ).length,
    absent: filteredAttendanceData.filter(
      (emp) => emp.attendance_status === "Absent"
    ).length,
    late: filteredAttendanceData.filter(
      (emp) => emp.attendance_status === "Late"
    ).length,
    notMarked: filteredAttendanceData.filter(
      (emp) => emp.attendance_status === "Not Marked"
    ).length,
    total: filteredAttendanceData.length,
  };

  const statsData = [
    {
      name: "Present Today",
      value: filteredStats.present.toString(),
      icon: CheckCircle,
      color: "green",
      percentage: `${
        Math.round((filteredStats.present / filteredStats.total) * 100) || 0
      }%`,
    },
    {
      name: "Absent",
      value: filteredStats.absent.toString(),
      icon: XCircle,
      color: "red",
      percentage: `${
        Math.round((filteredStats.absent / filteredStats.total) * 100) || 0
      }%`,
    },
    {
      name: "Late Arrivals",
      value: filteredStats.late.toString(),
      icon: AlertTriangle,
      color: "yellow",
      percentage: `${
        Math.round((filteredStats.late / filteredStats.total) * 100) || 0
      }%`,
    },
    {
      name: "Not Marked",
      value: filteredStats.notMarked.toString(),
      icon: Clock,
      color: "blue",
      percentage: `${
        Math.round((filteredStats.notMarked / filteredStats.total) * 100) || 0
      }%`,
    },
  ];

  // Department color mapping for visual distinction
  const departmentColors = {
    Engineering: "bg-blue-100 text-blue-800",
    Marketing: "bg-purple-100 text-purple-800",
    HR: "bg-green-100 text-green-800",
    Finance: "bg-yellow-100 text-yellow-800",
    Sales: "bg-red-100 text-red-800",
    Operations: "bg-indigo-100 text-indigo-800",
  };

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
              {selectedDepartment !== "All" && (
                <span className="ml-2 text-blue-600 font-medium">
                  - {selectedDepartment} Department
                </span>
              )}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="bg-white/50 backdrop-blur-sm"
              onClick={handleBulkMarkPresent}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Present
            </Button>
            <Button variant="outline" className="bg-white/50 backdrop-blur-sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Department Filter Buttons */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Filter by Department
              </h3>
              <div className="text-sm text-gray-500">
                Showing {filteredAttendanceData.length} of{" "}
                {attendanceData.length} employees
              </div>
            </div>

            {/* Department Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {departments.map((dept) => (
                <Button
                  key={dept}
                  variant={selectedDepartment === dept ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDepartment(dept)}
                  className={`transition-all duration-200 ${
                    selectedDepartment === dept
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-white/50 backdrop-blur-sm hover:bg-white/80"
                  }`}
                >
                  {dept}
                  {dept !== "All" && (
                    <span className="ml-1 text-xs opacity-75">
                      (
                      {
                        attendanceData.filter((emp) => emp.department === dept)
                          .length
                      }
                      )
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* Search and Advanced Filters */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees by name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 sm:w-48"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === "All" ? "All Departments" : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid Section - Updated to show filtered stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                  {selectedDepartment !== "All" && (
                    <div className="text-xs text-gray-500 mt-1">
                      {selectedDepartment}
                    </div>
                  )}
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
                  {stat.percentage} of{" "}
                  {selectedDepartment === "All" ? "total" : selectedDepartment}{" "}
                  employees
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
                Employee attendance for {selectedDate}
                {selectedDepartment !== "All" &&
                  ` - ${selectedDepartment} Department`}
              </CardDescription>
            </div>
            <div className="flex space-x-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="outline"
                className="bg-white/50 backdrop-blur-sm"
                onClick={() => {
                  setSelectedDepartment("All");
                  setSearchTerm("");
                }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredAttendanceData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                No employees found
              </div>
              <p className="text-gray-500">
                {searchTerm || selectedDepartment !== "All"
                  ? "Try adjusting your filters or search terms"
                  : "No employees available for this date"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAttendanceData.map((record) => (
                    <tr
                      key={record.employee_id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {record.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.position}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            departmentColors[record.department] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.check_in)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.check_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {calculateHours(record.check_in, record.check_out)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.attendance_status === "Present"
                              ? "bg-green-100 text-green-800"
                              : record.attendance_status === "Absent"
                              ? "bg-red-100 text-red-800"
                              : record.attendance_status === "Late"
                              ? "bg-yellow-100 text-yellow-800"
                              : record.attendance_status === "Half Day"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.attendance_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAttendanceModal(record)}
                          className="bg-white/50 hover:bg-white/80"
                        >
                          {record.attendance_status === "Not Marked"
                            ? "Mark"
                            : "Edit"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
          setError("");
        }}
        onSubmit={handleMarkAttendance}
        employee={selectedEmployee}
        isLoading={isSubmitting}
      />
    </div>
  );
}

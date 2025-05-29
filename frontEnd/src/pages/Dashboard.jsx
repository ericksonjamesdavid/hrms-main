import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Eye,
  ArrowRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import {
  employeeAPI,
  attendanceAPI,
  leaveRequestAPI,
  payrollAPI,
} from "@/services/api";

// Mapping of color variants to gradient classes for styling
const colorVariants = {
  blue: "from-blue-500 to-blue-600",
  green: "from-green-500 to-green-600",
  yellow: "from-yellow-500 to-yellow-600",
  purple: "from-purple-500 to-purple-600",
  red: "from-red-500 to-red-600",
  indigo: "from-indigo-500 to-indigo-600",
};

// Main Dashboard component
export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    employees: { total: 0, active: 0, onLeave: 0 },
    attendance: { present: 0, absent: 0, late: 0, total: 0 },
    leaveRequests: { pending: 0, approved: 0, rejected: 0, total: 0 },
    payroll: { totalPayroll: 0, recordsCount: 0, pending: 0 },
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get current date
      const today = new Date().toISOString().split("T")[0];
      const currentMonth = today.substring(0, 7);
      const startOfMonth = `${currentMonth}-01`;
      const endOfMonth = `${currentMonth}-31`;

      // Fetch all data in parallel
      const [
        employeesData,
        attendanceData,
        leaveRequestsData,
        payrollData,
        attendanceStats,
      ] = await Promise.all([
        employeeAPI.getAll(),
        attendanceAPI.getFullAttendance(today),
        leaveRequestAPI.getAll(),
        payrollAPI.getStats(),
        attendanceAPI.getStats(startOfMonth, endOfMonth).catch(() => null),
      ]);

      // Process employees data
      const activeEmployees = employeesData.filter(
        (emp) => emp.status === "Active"
      );
      const onLeaveEmployees = employeesData.filter(
        (emp) => emp.status === "On Leave"
      );

      // Process attendance data for today
      const presentToday = attendanceData.filter(
        (emp) => emp.attendance_status === "Present"
      );
      const absentToday = attendanceData.filter(
        (emp) => emp.attendance_status === "Absent"
      );
      const lateToday = attendanceData.filter(
        (emp) => emp.attendance_status === "Late"
      );

      // Process leave requests data
      const pendingLeaves = leaveRequestsData.filter(
        (req) => req.status === "Pending"
      );
      const approvedLeaves = leaveRequestsData.filter(
        (req) => req.status === "Approved"
      );
      const rejectedLeaves = leaveRequestsData.filter(
        (req) => req.status === "Rejected"
      );

      setDashboardData({
        employees: {
          total: employeesData.length,
          active: activeEmployees.length,
          onLeave: onLeaveEmployees.length,
        },
        attendance: {
          present: presentToday.length,
          absent: absentToday.length,
          late: lateToday.length,
          total: attendanceData.length,
        },
        leaveRequests: {
          pending: pendingLeaves.length,
          approved: approvedLeaves.length,
          rejected: rejectedLeaves.length,
          total: leaveRequestsData.length,
        },
        payroll: {
          totalPayroll: payrollData.total_net_pay || 0,
          recordsCount: payrollData.total_records || 0,
          pending: payrollData.calculated_count || 0,
        },
      });

      // Generate recent activities
      const activities = generateRecentActivities(
        employeesData,
        leaveRequestsData,
        payrollData,
        attendanceData
      );
      setRecentActivities(activities);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivities = (
    employees,
    leaveRequests,
    payroll,
    attendance
  ) => {
    const activities = [];

    // Recent leave requests
    const recentLeaves = leaveRequests
      .filter((req) => req.status === "Pending")
      .slice(0, 2);

    recentLeaves.forEach((leave) => {
      activities.push({
        text: `${
          leave.employee_name
        } submitted ${leave.leave_type.toLowerCase()} leave request`,
        time: formatTimeAgo(leave.applied_date),
        color: "blue",
        type: "leave",
      });
    });

    // Recent employees added
    const recentEmployees = employees
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 1);

    recentEmployees.forEach((emp) => {
      activities.push({
        text: `${emp.name} joined as ${emp.position}`,
        time: formatTimeAgo(emp.created_at),
        color: "green",
        type: "employee",
      });
    });

    // Attendance summary for today
    if (attendance.length > 0) {
      const presentCount = attendance.filter(
        (emp) => emp.attendance_status === "Present"
      ).length;
      activities.push({
        text: `${presentCount} employees marked present today`,
        time: "Today",
        color: "green",
        type: "attendance",
      });
    }

    // Payroll information
    if (payroll.calculated_count > 0) {
      activities.push({
        text: `${payroll.calculated_count} payroll records pending approval`,
        time: "This month",
        color: "yellow",
        type: "payroll",
      });
    }

    // Fill with default activities if not enough
    while (activities.length < 4) {
      activities.push({
        text: "System running smoothly",
        time: "Today",
        color: "purple",
        type: "system",
      });
    }

    return activities.slice(0, 4);
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const calculateAttendancePercentage = () => {
    if (dashboardData.attendance.total === 0) return 0;
    return Math.round(
      (dashboardData.attendance.present / dashboardData.attendance.total) * 100
    );
  };

  // Dynamic stats based on real data
  const stats = [
    {
      name: "Total Employees",
      value: dashboardData.employees.total.toString(),
      icon: Users,
      change: `${dashboardData.employees.active} active`,
      changeType: "positive",
      color: "blue",
    },
    {
      name: "Present Today",
      value: dashboardData.attendance.present.toString(),
      icon: CheckCircle,
      change: `${calculateAttendancePercentage()}% attendance`,
      changeType: "positive",
      color: "green",
    },
    {
      name: "Pending Leaves",
      value: dashboardData.leaveRequests.pending.toString(),
      icon: Clock,
      change: `${dashboardData.leaveRequests.total} total requests`,
      changeType:
        dashboardData.leaveRequests.pending > 5 ? "negative" : "neutral",
      color: "yellow",
    },
    {
      name: "Monthly Payroll",
      value: formatCurrency(dashboardData.payroll.totalPayroll),
      icon: DollarSign,
      change: `${dashboardData.payroll.recordsCount} records`,
      changeType: "positive",
      color: "purple",
    },
  ];

  const quickActions = [
    {
      title: "Add New Employee",
      desc: "Create a new employee record",
      icon: Users,
      color: "blue",
      onClick: () => navigate("/employees"),
    },
    {
      title: "Mark Attendance",
      desc: "Update today's attendance",
      icon: Calendar,
      color: "green",
      onClick: () => navigate("/attendance"),
    },
    {
      title: "Review Leave Requests",
      desc: `${dashboardData.leaveRequests.pending} pending requests`,
      icon: FileText,
      color: "yellow",
      onClick: () => navigate("/leave-requests"),
      badge:
        dashboardData.leaveRequests.pending > 0
          ? dashboardData.leaveRequests.pending
          : null,
    },
    {
      title: "Process Payroll",
      desc: "Calculate monthly payroll",
      icon: DollarSign,
      color: "purple",
      onClick: () => navigate("/payroll"),
      badge:
        dashboardData.payroll.pending > 0
          ? dashboardData.payroll.pending
          : null,
    },
    {
      title: "View Reports",
      desc: "Generate HR analytics",
      icon: BarChart3,
      color: "indigo",
      onClick: () => alert("Reports feature coming soon!"),
    },
    {
      title: "System Settings",
      desc: "Configure HR system",
      icon: Clock,
      color: "red",
      onClick: () => alert("Settings feature coming soon!"),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white/70 rounded-xl p-6 shadow-lg animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Welcome back! Here's what's happening with your team today.
            </p>
          </div>
          <Button
            onClick={() => loadDashboardData()}
            variant="outline"
            className="bg-white/50 backdrop-blur-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.name}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm cursor-pointer"
              onClick={() => {
                if (stat.name === "Total Employees") navigate("/employees");
                else if (stat.name === "Present Today") navigate("/attendance");
                else if (stat.name === "Pending Leaves")
                  navigate("/leave-requests");
                else if (stat.name === "Monthly Payroll") navigate("/payroll");
              }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.name}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-r ${
                    colorVariants[stat.color]
                  } shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp
                    className={`h-3 w-3 ${
                      stat.changeType === "positive"
                        ? "text-green-500"
                        : stat.changeType === "negative"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  />
                  <p
                    className={`text-xs font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-red-400 to-red-500 rounded-lg">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span>Recent Activities</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadDashboardData()}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>Latest activities in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors cursor-pointer"
                  onClick={() => {
                    if (activity.type === "leave") navigate("/leave-requests");
                    else if (activity.type === "employee")
                      navigate("/employees");
                    else if (activity.type === "attendance")
                      navigate("/attendance");
                    else if (activity.type === "payroll") navigate("/payroll");
                  }}
                >
                  <div
                    className={`w-2 h-2 bg-gradient-to-r ${
                      colorVariants[activity.color]
                    } rounded-full mr-3 flex-shrink-0`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.text}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const ActionIcon = action.icon;
                return (
                  <button
                    key={index}
                    className="w-full group relative"
                    onClick={action.onClick}
                  >
                    <div className="flex items-center p-4 rounded-xl border border-gray-200 hover:border-gray-300 bg-white/50 hover:bg-white/80 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                      <div
                        className={`p-2 rounded-lg bg-gradient-to-r ${
                          colorVariants[action.color]
                        } shadow-sm flex-shrink-0`}
                      >
                        <ActionIcon className="h-4 w-4 text-white" />
                      </div>
                      <div className="ml-3 text-left flex-1 min-w-0">
                        <p className="font-medium text-gray-900 group-hover:text-gray-700 text-sm truncate">
                          {action.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {action.desc}
                        </p>
                      </div>
                      {action.badge && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {action.badge}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card
          className="shadow-lg border-0 bg-white/70 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate("/attendance")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              Today's Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {calculateAttendancePercentage()}%
                </div>
                <p className="text-xs text-gray-500">
                  {dashboardData.attendance.present} of{" "}
                  {dashboardData.attendance.total} present
                </p>
              </div>
              <div className="text-right text-sm">
                <div className="text-yellow-600">
                  {dashboardData.attendance.late} late
                </div>
                <div className="text-red-600">
                  {dashboardData.attendance.absent} absent
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-lg border-0 bg-white/70 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate("/leave-requests")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="w-4 h-4 mr-2 text-blue-500" />
              Leave Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Pending</span>
                <span className="font-medium">
                  {dashboardData.leaveRequests.pending}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Approved</span>
                <span className="font-medium">
                  {dashboardData.leaveRequests.approved}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">Rejected</span>
                <span className="font-medium">
                  {dashboardData.leaveRequests.rejected}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-lg border-0 bg-white/70 backdrop-blur-sm cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          onClick={() => navigate("/payroll")}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-purple-500" />
              Payroll Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData.payroll.totalPayroll)}
              </div>
              <div className="text-sm text-gray-600">
                {dashboardData.payroll.recordsCount} records this month
              </div>
              {dashboardData.payroll.pending > 0 && (
                <div className="text-sm text-yellow-600">
                  {dashboardData.payroll.pending} pending approval
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

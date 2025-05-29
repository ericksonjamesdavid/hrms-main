import { useState, useEffect } from "react"; // Importing React hooks for state and effect management
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importing UI components for card layout
import { Button } from "@/components/ui/button"; // Importing button component
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Trash2,
} from "lucide-react"; // Importing icons from lucide-react
import { leaveRequestAPI, employeeAPI } from "@/services/api"; // Importing API services for leave requests and employees

// Enhanced Modal for adding leave requests
const LeaveRequestModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    leave_type: "Annual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [errors, setErrors] = useState({});
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      // Reset form
      setFormData({
        employee_id: "",
        leave_type: "Annual",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data.filter((emp) => emp.status === "Active"));
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = "Employee is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (!formData.reason.trim()) newErrors.reason = "Reason is required";

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          Add New Leave Request
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleChange}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.employee_id ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} - {emp.department}
                </option>
              ))}
            </select>
            {errors.employee_id && (
              <p className="text-red-500 text-sm mt-1">{errors.employee_id}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type *
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Annual">Annual Leave</option>
              <option value="Sick">Sick Leave</option>
              <option value="Personal">Personal Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
              <option value="Emergency">Emergency Leave</option>
              <option value="Unpaid">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.start_date && (
                <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.end_date ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.end_date && (
                <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows={4}
              className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.reason ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Please provide a reason for the leave request..."
            />
            {errors.reason && (
              <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
            )}
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Create Leave Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Review Modal for approving/rejecting leave requests
const ReviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  leaveRequest = null,
  isLoading = false,
}) => {
  const [status, setStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (isOpen && leaveRequest) {
      setStatus("");
      setAdminNotes("");
    }
  }, [isOpen, leaveRequest]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!status) return;
    onSubmit(leaveRequest.id, status, adminNotes);
  };

  if (!isOpen || !leaveRequest) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          Review Leave Request
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">
            {leaveRequest.employee_name}
          </h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Department:</strong> {leaveRequest.department}
            </p>
            <p>
              <strong>Leave Type:</strong> {leaveRequest.leave_type}
            </p>
            <p>
              <strong>Dates:</strong> {leaveRequest.start_date} to{" "}
              {leaveRequest.end_date}
            </p>
            <p>
              <strong>Days:</strong> {leaveRequest.days_requested} days
            </p>
            <p>
              <strong>Reason:</strong> {leaveRequest.reason}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decision *
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Approved"
                  checked={status === "Approved"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2"
                />
                <span className="text-green-600">Approve</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="Rejected"
                  checked={status === "Rejected"}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mr-2"
                />
                <span className="text-red-600">Reject</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional notes for the employee..."
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
              disabled={isLoading || !status}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Leave Requests component
export default function LeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadLeaveRequests();
    loadStats();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [leaveRequests, statusFilter, searchTerm]);

  const loadLeaveRequests = async () => {
    try {
      setIsLoading(true);
      const data = await leaveRequestAPI.getAll();
      setLeaveRequests(data);
      setError("");
    } catch (error) {
      console.error("Failed to load leave requests:", error);
      setError("Failed to load leave requests. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await leaveRequestAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  const filterRequests = () => {
    let filtered = leaveRequests;

    if (statusFilter !== "All") {
      filtered = filtered.filter((req) => req.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (req) =>
          req.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleCreateLeaveRequest = async (requestData) => {
    try {
      setIsSubmitting(true);
      await leaveRequestAPI.create(requestData);
      setIsModalOpen(false);
      await loadLeaveRequests();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewRequest = async (id, status, adminNotes) => {
    try {
      setIsSubmitting(true);
      await leaveRequestAPI.updateStatus(id, status, adminNotes);
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      await loadLeaveRequests();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this leave request?")
    ) {
      return;
    }

    try {
      await leaveRequestAPI.delete(id);
      await loadLeaveRequests();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setIsReviewModalOpen(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLeaveTypeColor = (leaveType) => {
    const colors = {
      Annual: "bg-blue-100 text-blue-800",
      Sick: "bg-red-100 text-red-800",
      Personal: "bg-purple-100 text-purple-800",
      Maternity: "bg-pink-100 text-pink-800",
      Paternity: "bg-indigo-100 text-indigo-800",
      Emergency: "bg-orange-100 text-orange-800",
      Unpaid: "bg-gray-100 text-gray-800",
    };
    return colors[leaveType] || "bg-gray-100 text-gray-800";
  };

  const colorVariants = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
  };

  const statsData = stats
    ? [
        {
          name: "Pending Requests",
          value: stats.pending_count?.toString() || "0",
          icon: Clock,
          color: "yellow",
          percentage: `${Math.round(
            (stats.pending_count / (stats.total_requests || 1)) * 100
          )}%`,
        },
        {
          name: "Approved",
          value: stats.approved_count?.toString() || "0",
          icon: CheckCircle,
          color: "green",
          percentage: `${Math.round(
            (stats.approved_count / (stats.total_requests || 1)) * 100
          )}%`,
        },
        {
          name: "Rejected",
          value: stats.rejected_count?.toString() || "0",
          icon: XCircle,
          color: "red",
          percentage: `${Math.round(
            (stats.rejected_count / (stats.total_requests || 1)) * 100
          )}%`,
        },
        {
          name: "Total Days",
          value: stats.total_approved_days?.toString() || "0",
          icon: Calendar,
          color: "blue",
          percentage: "Approved",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Leave Requests
            </h1>
            <p className="mt-2 text-gray-600">
              Manage employee leave requests and approvals
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Leave Request
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
                  {stat.percentage} of total requests
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter Section */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by employee name, department, or leave type..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <Button
              variant="outline"
              className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80"
              onClick={() => {
                setStatusFilter("All");
                setSearchTerm("");
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <span>Leave Requests</span>
          </CardTitle>
          <CardDescription>
            Showing {filteredRequests.length} of {leaveRequests.length} requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                No leave requests found
              </div>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your filters"
                  : "No leave requests have been submitted yet"}
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
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {request.employee_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLeaveTypeColor(
                            request.leave_type
                          )}`}
                        >
                          {request.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDate(request.start_date)}</div>
                          <div className="text-gray-500">
                            to {formatDate(request.end_date)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.days_requested}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.applied_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {request.status === "Pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReviewModal(request)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRequest(request.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
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

      {/* Modals */}
      <LeaveRequestModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setError("");
        }}
        onSubmit={handleCreateLeaveRequest}
        isLoading={isSubmitting}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedRequest(null);
          setError("");
        }}
        onSubmit={handleReviewRequest}
        leaveRequest={selectedRequest}
        isLoading={isSubmitting}
      />
    </div>
  );
}

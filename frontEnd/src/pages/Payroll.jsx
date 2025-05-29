// Import necessary dependencies from React
import { useState, useEffect } from "react"; // Importing useState and useEffect hooks for managing component state and side effects

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
  Calculator,
  DollarSign,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Settings,
  Eye,
  Trash2,
  Download,
} from "lucide-react"; // Importing icons for UI elements

// Importing API services for payroll and employee data
import { payrollAPI, employeeAPI } from "@/services/api";

// Modal for payroll calculation
const CalculatePayrollModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    employee_id: "",
    start_date: "",
    end_date: "",
  }); // State to hold form data for payroll calculation
  const [errors, setErrors] = useState({}); // State to hold validation errors
  const [employees, setEmployees] = useState([]); // State to hold the list of employees

  // Effect to load employees and set default dates when the modal is opened
  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      // Set default dates (current month)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setFormData({
        employee_id: "",
        start_date: startOfMonth.toISOString().split("T")[0],
        end_date: endOfMonth.toISOString().split("T")[0],
      });
      setErrors({});
    }
  }, [isOpen]);

  // Function to load all employees from the API
  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getAll();
      setEmployees(data.filter((emp) => emp.status === "Active")); // Only active employees
    } catch (error) {
      console.error("Failed to load employees:", error);
    }
  };

  // Handler for form field changes
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

  // Function to validate the form fields
  const validateForm = () => {
    const newErrors = {};
    if (!formData.employee_id) newErrors.employee_id = "Employee is required";
    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    return newErrors;
  };

  // Handler for form submission
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
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold mb-6 text-gray-900">
          Calculate Payroll
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pay Period Start *
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
                Pay Period End *
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

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Payroll will be calculated based on actual
              hours worked from attendance records during this period.
            </p>
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
              {isLoading ? "Calculating..." : "Calculate Payroll"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Payroll Details Modal
const PayrollDetailsModal = ({ isOpen, onClose, payroll = null }) => {
  if (!isOpen || !payroll) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Payroll Details - {payroll.employee_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Info */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Employee Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Name:</strong> {payroll.employee_name}
                </div>
                <div>
                  <strong>Department:</strong> {payroll.department}
                </div>
                <div>
                  <strong>Position:</strong> {payroll.position}
                </div>
                <div>
                  <strong>Pay Period:</strong>{" "}
                  {formatDate(payroll.pay_period_start)} -{" "}
                  {formatDate(payroll.pay_period_end)}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Hours Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Regular Hours:</span>
                  <span className="font-medium">{payroll.regular_hours}h</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Hours:</span>
                  <span className="font-medium">{payroll.overtime_hours}h</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>
                    <strong>Total Hours:</strong>
                  </span>
                  <span className="font-bold">{payroll.total_hours}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pay Breakdown */}
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Pay Breakdown
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Hourly Rate:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.hourly_rate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Rate:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.overtime_rate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Pay:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.regular_pay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime Pay:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.overtime_pay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.bonus)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>
                    <strong>Gross Pay:</strong>
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payroll.gross_pay)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Deductions & Net Pay
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gross Pay:</span>
                  <span className="font-medium">
                    {formatCurrency(payroll.gross_pay)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(payroll.deductions)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span>
                    <strong>Net Pay:</strong>
                  </span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(payroll.net_pay)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Status & Dates
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span
                    className={`font-medium px-2 py-1 rounded text-xs ${
                      payroll.status === "Paid"
                        ? "bg-green-100 text-green-800"
                        : payroll.status === "Approved"
                        ? "bg-blue-100 text-blue-800"
                        : payroll.status === "Calculated"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {payroll.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Generated:</span>
                  <span className="font-medium">
                    {formatDate(payroll.generated_at)}
                  </span>
                </div>
                {payroll.approved_at && (
                  <div className="flex justify-between">
                    <span>Approved:</span>
                    <span className="font-medium">
                      {formatDate(payroll.approved_at)}
                    </span>
                  </div>
                )}
                {payroll.paid_at && (
                  <div className="flex justify-between">
                    <span>Paid:</span>
                    <span className="font-medium">
                      {formatDate(payroll.paid_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {payroll.notes && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-sm text-gray-700">{payroll.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Payroll component
export default function Payroll() {
  const [payrollRecords, setPayrollRecords] = useState([]); // State to hold all payroll records
  const [filteredRecords, setFilteredRecords] = useState([]); // State to hold filtered payroll records
  const [stats, setStats] = useState(null); // State to hold payroll statistics
  const [isLoading, setIsLoading] = useState(true); // State to manage loading state
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false); // State to manage calculate modal visibility
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // State to manage details modal visibility
  const [selectedPayroll, setSelectedPayroll] = useState(null); // State to hold the selected payroll for details
  const [isSubmitting, setIsSubmitting] = useState(false); // State to manage form submission state
  const [error, setError] = useState(""); // State to hold error messages
  const [statusFilter, setStatusFilter] = useState("All"); // State to hold the selected status filter
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term for filtering payroll records

  // Load payroll records and statistics on component mount
  useEffect(() => {
    loadPayrollRecords();
    loadStats();
  }, []);

  // Filter records whenever payrollRecords, statusFilter, or searchTerm changes
  useEffect(() => {
    filterRecords();
  }, [payrollRecords, statusFilter, searchTerm]);

  // Function to load all payroll records from the API
  const loadPayrollRecords = async () => {
    try {
      setIsLoading(true);
      const data = await payrollAPI.getAll();
      setPayrollRecords(data);
      setError("");
    } catch (error) {
      console.error("Failed to load payroll records:", error);
      setError("Failed to load payroll records. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to load payroll statistics from the API
  const loadStats = async () => {
    try {
      const data = await payrollAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  // Function to filter payroll records based on status and search term
  const filterRecords = () => {
    let filtered = payrollRecords;

    if (statusFilter !== "All") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.employee_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          record.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecords(filtered);
  };

  // Handler for calculating payroll
  const handleCalculatePayroll = async (formData) => {
    try {
      setIsSubmitting(true);
      await payrollAPI.calculate(
        formData.employee_id,
        formData.start_date,
        formData.end_date
      );
      setIsCalculateModalOpen(false);
      await loadPayrollRecords();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for updating payroll status
  const handleUpdateStatus = async (id, status) => {
    try {
      await payrollAPI.updateStatus(id, status);
      await loadPayrollRecords();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  // Handler for deleting a payroll record
  const handleDeleteRecord = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this payroll record?")
    ) {
      return;
    }

    try {
      await payrollAPI.delete(id);
      await loadPayrollRecords();
      await loadStats();
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  // Function to open the details modal for a specific payroll record
  const openDetailsModal = (payroll) => {
    setSelectedPayroll(payroll);
    setIsDetailsModalOpen(true);
  };

  // Formatting function for currency values
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Formatting function for date values
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to get the status color class based on the status value
  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Approved":
        return "bg-blue-100 text-blue-800";
      case "Calculated":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Mapping of color variants for statistics
  const colorVariants = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    purple: "from-purple-500 to-purple-600",
  };

  // Preparing data for statistics cards
  const statsData = stats
    ? [
        {
          name: "Total Payroll",
          value: formatCurrency(stats.total_net_pay),
          icon: DollarSign,
          color: "green",
          percentage: `${stats.total_records} records`,
        },
        {
          name: "Pending Approval",
          value: stats.calculated_count?.toString() || "0",
          icon: AlertTriangle,
          color: "yellow",
          percentage: "Need review",
        },
        {
          name: "Paid Records",
          value: stats.paid_count?.toString() || "0",
          icon: CheckCircle,
          color: "blue",
          percentage: "Completed",
        },
        {
          name: "Total Hours",
          value: Math.round(stats.total_hours_paid || 0).toString(),
          icon: Clock,
          color: "purple",
          percentage: "Hours paid",
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
              Payroll Management
            </h1>
            <p className="mt-2 text-gray-600">
              Calculate and manage employee payroll based on worked hours
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsCalculateModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Payroll
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
                <p className="text-xs text-gray-500">{stat.percentage}</p>
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
                placeholder="Search by employee name or department..."
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
              <option value="Draft">Draft</option>
              <option value="Calculated">Calculated</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
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

      {/* Payroll Records List */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-600 rounded-lg">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
            <span>Payroll Records</span>
          </CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {payrollRecords.length} records
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">
                No payroll records found
              </div>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "All"
                  ? "Try adjusting your filters"
                  : "Start by calculating payroll for employees"}
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
                      Pay Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gross Pay
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Pay
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
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-blue-400 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {record.employee_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {record.employee_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {record.department}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDate(record.pay_period_start)}</div>
                          <div className="text-gray-500">
                            to {formatDate(record.pay_period_end)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{record.total_hours}h total</div>
                          <div className="text-gray-500">
                            {record.overtime_hours}h OT
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(record.gross_pay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        {formatCurrency(record.net_pay)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            record.status
                          )}`}
                        >
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetailsModal(record)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>

                        {record.status === "Calculated" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(record.id, "Approved")
                            }
                            className="bg-green-50 hover:bg-green-100 text-green-600"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}

                        {record.status === "Approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleUpdateStatus(record.id, "Paid")
                            }
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600"
                          >
                            <DollarSign className="w-3 h-3 mr-1" />
                            Mark Paid
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
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
      <CalculatePayrollModal
        isOpen={isCalculateModalOpen}
        onClose={() => {
          setIsCalculateModalOpen(false);
          setError("");
        }}
        onSubmit={handleCalculatePayroll}
        isLoading={isSubmitting}
      />

      <PayrollDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPayroll(null);
        }}
        payroll={selectedPayroll}
      />
    </div>
  );
}

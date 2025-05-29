import { useState } from "react"; // Importing useState hook from React for managing state
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Importing UI components for card layout
import { Button } from "@/components/ui/button"; // Importing button component
import { Plus, Search, Edit, Trash2, Filter, MoreVertical } from "lucide-react"; // Importing icons from lucide-react

// Sample employee data
const employees = [
  {
    id: 1,
    name: "John Doe",
    email: "john@company.com",
    department: "Engineering",
    position: "Senior Developer",
    status: "Active",
    avatar: "JD", // Initials for the avatar
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@company.com",
    department: "Marketing",
    position: "Marketing Manager",
    status: "Active",
    avatar: "JS",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@company.com",
    department: "HR",
    position: "HR Specialist",
    status: "Active",
    avatar: "MJ",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah@company.com",
    department: "Finance",
    position: "Accountant",
    status: "On Leave",
    avatar: "SW",
  },
  {
    id: 5,
    name: "David Chen",
    email: "david@company.com",
    department: "Engineering",
    position: "Frontend Developer",
    status: "Active",
    avatar: "DC",
  },
  {
    id: 6,
    name: "Lisa Rodriguez",
    email: "lisa@company.com",
    department: "Marketing",
    position: "Content Specialist",
    status: "Active",
    avatar: "LR",
  },
];

// Modal component for adding a new employee
const Modal = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, department, position }); // Pass the new employee data to the parent
    onClose(); // Close the modal after submission
  };

  if (!isOpen) return null; // Don't render the modal if it's not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Add New Employee</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Employees component
export default function Employees() {
  const [searchTerm, setSearchTerm] = useState(""); // State to hold the search term
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility
  const [employeeList, setEmployeeList] = useState(employees); // State to manage employee list

  // Function to handle adding a new employee
  const handleAddEmployee = (newEmployee) => {
    setEmployeeList([...employeeList, { id: employeeList.length + 1, ...newEmployee, status: "Active", avatar: newEmployee.name.charAt(0) }]); // Add new employee to the list
  };

  // Filtering employees based on the search term
  const filteredEmployees = employeeList.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header section for the Employees page */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Employees {/* Title of the page */}
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your employee records and information {/* Subtitle */}
            </p>
          </div>
          {/* Button to add a new employee */}
          <Button
            onClick={() => setIsModalOpen(true)} // Open the modal on button click
            className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-500 hover:to-green-500 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              {/* Search icon */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              {/* Input field for searching employees */}
              <input
                type="text"
                placeholder="Search employees by name, email, or department..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                value={searchTerm} // Binding the input value to the searchTerm state
                onChange={(e) => setSearchTerm(e.target.value)} // Updating the searchTerm state on input change
              />
            </div>
            {/* Filter button */}
            <Button
              variant="outline"
              className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-white/80"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card
            key={employee.id} // Unique key for each employee card
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg bg-white/70 backdrop-blur-sm"
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  {/* Avatar display */}
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {employee.avatar} {/* Displaying employee initials */}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {employee.name} {/* Displaying employee name */}
                    </CardTitle>
                    <p className="text-sm text-gray-500">{employee.position}</p> {/* Displaying employee position */}
                  </div>
                </div>
                {/* More options button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {/* Displaying employee email */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employee.email}
                  </span>
                </div>
                {/* Displaying employee department */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Department</span>
                  <span className="text-sm font-medium text-gray-900">
                    {employee.department}
                  </span>
                </div>
                {/* Displaying employee status with conditional styling */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      employee.status === "Active"
                        ? "bg-green-100 text-green-800" // Green for active status
                        : "bg-yellow-100 text-yellow-800" // Yellow for on leave status
                    }`}
                  >
                    {employee.status} {/* Displaying employee status */}
                  </span>
                </div>
              </div>

              {/* Action buttons for editing and deleting employee */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/50 hover:bg-white/80"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit {/* Edit button */}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-white/50 hover:bg-white/80 text-red-600 hover:text-red-700 border-red-200"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete {/* Delete button */}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State when no employees match the search criteria */}
      {filteredEmployees.length === 0 && (
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No employees found {/* Message when no employees are found */}
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search criteria or add a new employee. {/* Suggestion for user action */}
            </p>
            {/* Button to add a new employee */}
            <Button
              onClick={() => setIsModalOpen(true)} // Open the modal on button click
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal for adding a new employee */}
      <Modal
        isOpen={isModalOpen} // Pass the modal open state
        onClose={() => setIsModalOpen(false)} // Close modal function
        onSubmit={handleAddEmployee} // Function to handle adding a new employee
      />
    </div>
  );
}

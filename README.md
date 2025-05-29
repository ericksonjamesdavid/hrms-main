# Human Resource Management System (HRMS)

A comprehensive HR Management System built with React.js frontend and Node.js backend with MySQL database.

## 🚀 Features

- **Employee Management**: Add, edit, delete, and manage employee records
- **Attendance Tracking**: Mark daily attendance with check-in/out times
- **Leave Management**: Submit and approve/reject leave requests
- **Payroll Processing**: Calculate and process employee salaries
- **Dashboard Analytics**: Overview of key HR metrics and statistics
- **Responsive Design**: Modern UI with Shadcn UI components

## 🛠️ Tech Stack

### Frontend

- **React.js** - UI Library
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component Library
- **React Router** - Navigation
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MySQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password Hashing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **MySQL Server** (version 8.0 or higher)
- **MySQL Workbench** (optional, for database management)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hrms.git
cd hrms
```

### 2. Backend Setup

#### Navigate to Backend Directory

```bash
cd backEnd
```

#### Install Dependencies

```bash
npm install
```

#### Setup Environment Variables

1. Copy the environment example file:

```bash
cp .env.example .env
```

2. Update the `.env` file with your MySQL configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hrms_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

#### Create MySQL Database

1. Open MySQL Workbench or connect via command line
2. Create a new database:

```sql
CREATE DATABASE hrms_db;
```

#### Start Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

#### Seed Sample Data (Optional)

```bash
npm run seed
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd ../frontEnd
```

#### Install Dependencies

```bash
npm install --legacy-peer-deps
```

#### Start Development Server

```bash
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 🗄️ Database Schema

The system automatically creates the following tables:

### employees

- Employee information and personal details
- Salary and position information
- Status tracking

### attendance

- Daily attendance records
- Check-in/out times
- Work hours calculation

### leave_requests

- Leave applications
- Approval workflow
- Leave type categorization

### payroll

- Salary calculations
- Allowances and deductions
- Processing status

## 🔧 API Endpoints

### Employee Management

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Management

- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/stats` - Get attendance statistics

### Leave Management

- `GET /api/leave-requests` - Get leave requests
- `POST /api/leave-requests` - Submit leave request
- `PUT /api/leave-requests/:id/approve` - Approve leave
- `PUT /api/leave-requests/:id/reject` - Reject leave
- `GET /api/leave-requests/stats` - Get leave statistics

### Payroll Management

- `GET /api/payroll` - Get payroll records
- `POST /api/payroll/process` - Process payroll
- `GET /api/payroll/stats` - Get payroll statistics

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics

## 🔒 Environment Variables

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=hrms_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

## 🚦 Running the Application

### Development Mode

1. **Start Backend** (Terminal 1):

```bash
cd backEnd
npm run dev
```

2. **Start Frontend** (Terminal 2):

```bash
cd frontEnd
npm run dev
```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Production Mode

1. **Build Frontend**:

```bash
cd frontEnd
npm run build
```

2. **Start Backend**:

```bash
cd backEnd
npm start
```

## 📱 Features Overview

### Dashboard

- Employee count and statistics
- Attendance overview
- Leave request summary
- Payroll totals
- Recent activity feed

### Employee Management

- Add new employees with complete details
- Search and filter employees
- Update employee information
- Manage employee status

### Attendance System

- Mark daily attendance
- Track check-in/out times
- Calculate work hours
- Attendance reports and statistics

### Leave Management

- Submit leave requests
- Approve/reject workflow
- Track leave balances
- Leave history and reports

### Payroll Processing

- Calculate monthly salaries
- Manage allowances and deductions
- Process bulk payroll
- Generate pay slips

## 🎨 UI Components

The frontend uses Shadcn UI components for a modern, consistent design:

- Cards for data display
- Tables for data listing
- Forms for data input
- Buttons with variants
- Icons from Lucide React

## 🔧 Development

### Backend Structure

```
backEnd/
├── config/
│   └── database.js
├── routes/
│   ├── employees.js
│   ├── attendance.js
│   ├── leaveRequests.js
│   ├── payroll.js
│   └── dashboard.js
├── scripts/
│   └── seedData.js
├── server.js
└── .env
```

### Frontend Structure

```
frontEnd/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── Layout.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── Attendance.jsx
│   │   ├── LeaveRequests.jsx
│   │   └── Payroll.jsx
│   ├── lib/
│   │   └── utils.js
│   └── App.jsx
└── package.json
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**

   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database `hrms_db` exists

2. **Port Already in Use**

   - Change port in `.env` file
   - Kill process using the port: `npx kill-port 5000`

3. **CORS Issues**

   - Verify `FRONTEND_URL` in backend `.env`
   - Check if both servers are running

4. **Package Installation Issues**
   - Use `--legacy-peer-deps` flag for frontend
   - Clear npm cache: `npm cache clean --force`

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Create an issue on GitHub
- chat molang si Carl Andrei

## 🙏 Acknowledgments

- Shadcn UI for beautiful components
- Lucide React for icons
- Tailwind CSS for styling
- Express.js community
- React.js community

---

**Made with ❤️ for efficient HR Management**

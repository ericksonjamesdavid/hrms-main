# Human Resource Management System (HRMS)

A comprehensive HR Management System built with React.js frontend and Node.js backend with MySQL database.

**Created by: Erickson James David**

## 🚀 Features

### 📊 Dashboard

- **Real-time Analytics**: Live employee statistics and attendance rates
- **Interactive Overview**: Quick access to all modules with notification badges
- **Recent Activities**: Dynamic activity feed based on system events
- **Quick Actions**: One-click access to common HR tasks

### 👥 Employee Management

- **Complete Employee Records**: Comprehensive employee database with personal details
- **Department Organization**: Track employees by departments and positions
- **Status Management**: Active, Inactive, and On Leave status tracking
- **Search & Filter**: Advanced filtering by department, position, and status
- **Salary Information**: Employee compensation tracking

### ⏰ Attendance System

- **Daily Attendance Tracking**: Mark attendance with check-in/out times
- **Automatic Hour Calculation**: Real-time work hours computation
- **Bulk Attendance**: Mark attendance for multiple employees simultaneously
- **Attendance Statistics**: Monthly and daily attendance reports
- **Status Categories**: Present, Absent, Late, Half Day tracking

### 📝 Leave Management

- **Leave Request Workflow**: Submit, review, approve/reject leave requests
- **Multiple Leave Types**: Annual, Sick, Personal, Maternity, Paternity, Emergency, Unpaid
- **Leave Balance Tracking**: Automatic leave balance calculation
- **Approval System**: Admin review and approval workflow
- **Leave Statistics**: Comprehensive leave analytics and reporting

### 💰 Payroll Processing

- **Hours-Based Calculation**: Automatic payroll calculation from attendance records
- **Overtime Management**: Separate rates for regular and overtime hours
- **Payroll Workflow**: Draft → Calculated → Approved → Paid status progression
- **Deductions & Bonuses**: Configurable salary adjustments
- **Pay Slip Generation**: Detailed payroll records with breakdowns

### 🎨 Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Glass-morphism Design**: Modern backdrop-blur effects and transparency
- **Interactive Elements**: Hover effects, animations, and smooth transitions
- **Dark/Light Theme Support**: Consistent styling across all components
- **Accessibility**: Screen reader friendly and keyboard navigation

## 🛠️ Tech Stack

### Frontend

- **React.js 18** - Modern UI Library with Hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - High-quality component library
- **React Router DOM** - Client-side routing
- **Lucide React** - Beautiful icon library
- **JavaScript ES6+** - Modern JavaScript features

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Minimal web framework
- **MySQL 8.0** - Relational database
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## 📋 Prerequisites

Before running this application, ensure you have:

- **Node.js** (version 16.0.0 or higher)
- **npm** (version 8.0.0 or higher) or **yarn**
- **MySQL Server** (version 8.0 or higher)
- **MySQL Workbench** (recommended for database management)
- **Git** (for version control)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ericksondavid/hrms.git
cd hrms-main
```

### 2. Database Setup

#### Install and Start MySQL Server

1. **Download MySQL Server** from [official website](https://dev.mysql.com/downloads/mysql/)
2. **Install MySQL Workbench** for database management
3. **Start MySQL Service**:
   - Windows: Start MySQL service from Services
   - macOS: `brew services start mysql`
   - Linux: `sudo systemctl start mysql`

#### Create Database

1. Open MySQL Workbench or connect via command line
2. Create the database:

```sql
CREATE DATABASE hrms_db;
```

3. (Optional) Create dedicated user:

```sql
CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON hrms_db.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend Setup

#### Navigate to Backend Directory

```bash
cd backEnd
```

#### Install Dependencies

```bash
npm install
```

#### Environment Configuration

1. Create environment file:

```bash
cp .env.example .env
```

2. Configure your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=jameserickson0411
DB_NAME=hrms_db

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration (Generate a secure secret)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important Security Notes:**

- Replace `JWT_SECRET` with a strong, unique secret (minimum 32 characters)
- Use environment-specific database credentials
- Never commit `.env` files to version control

#### Start Backend Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

**Expected Output:**

```
🚀 Starting HRMS Backend Server...
📊 Testing Database Connection...
✅ Database connected successfully!
🏗️ Setting up database:
✅ Users table initialized successfully
✅ Employees table initialized successfully
✅ Attendance table initialized successfully
✅ Leave requests table initialized successfully
✅ Leave balances table initialized successfully
✅ Payroll settings table initialized successfully
✅ Payroll records table initialized successfully
👤 Setting up demo user:
✅ Demo user created successfully
✅ HRMS API Server running on port 5000
```

### 4. Frontend Setup

#### Navigate to Frontend Directory

```bash
cd ../frontEnd
```

#### Install Dependencies

```bash
# Use legacy-peer-deps flag to resolve dependency conflicts
npm install --legacy-peer-deps
```

#### Environment Configuration (Optional)

Create `.env` file for frontend configuration:

```env
VITE_API_BASE_URL=http://localhost:5000
```

#### Start Development Server

```bash
npm run dev
```

**Expected Output:**

```
VITE v4.4.5 ready in 800 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

## 🔐 Demo Credentials

The system automatically creates a demo admin account:

- **Email**: `admin@hrms.com`
- **Password**: `password123`

**Security Note**: Change these credentials in production!

## 🗄️ Database Schema

The system automatically creates the following tables:

### Core Tables

1. **users** - Authentication and user management
2. **employees** - Employee personal and professional information
3. **attendance** - Daily attendance records with hours tracking
4. **leave_requests** - Leave applications and approval workflow
5. **leave_balances** - Employee leave balance tracking
6. **payroll_settings** - Individual employee payroll configuration
7. **payroll_records** - Calculated payroll data and payment tracking

### Key Features

- **Foreign Key Constraints**: Ensures data integrity
- **Automatic Timestamps**: Created and updated timestamps
- **Unique Constraints**: Prevents duplicate records
- **Generated Columns**: Automatic calculations (e.g., remaining leave days)
- **Enum Fields**: Standardized status values

## 🔧 API Endpoints

### Authentication

- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `POST /api/create-demo-user` - Create demo user

### Employee Management

- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create new employee
- `GET /api/employees/:id` - Get employee by ID
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attendance Management

- `GET /api/attendance/full/:date` - Get full attendance for date
- `GET /api/attendance/:date` - Get attendance records for date
- `POST /api/attendance` - Mark single attendance
- `POST /api/attendance/bulk` - Bulk mark attendance
- `GET /api/attendance/stats/:startDate/:endDate` - Attendance statistics
- `DELETE /api/attendance/:id` - Delete attendance record

### Leave Management

- `GET /api/leave-requests` - Get leave requests (with filters)
- `GET /api/leave-requests/:id` - Get specific leave request
- `POST /api/leave-requests` - Submit leave request
- `PUT /api/leave-requests/:id/status` - Approve/reject leave
- `GET /api/leave-balances/:employee_id` - Get leave balances
- `GET /api/leave-requests/stats` - Leave statistics
- `DELETE /api/leave-requests/:id` - Delete leave request

### Payroll Management

- `GET /api/payroll-settings/:employee_id` - Get payroll settings
- `PUT /api/payroll-settings/:employee_id` - Update payroll settings
- `POST /api/payroll/calculate` - Calculate payroll for period
- `GET /api/payroll` - Get payroll records (with filters)
- `PUT /api/payroll/:id/status` - Update payroll status
- `GET /api/payroll/stats` - Payroll statistics
- `DELETE /api/payroll/:id` - Delete payroll record

### System

- `GET /health` - Health check endpoint
- `GET /test-db` - Database connection test

## 🚦 Running the Application

### Development Mode (Recommended)

1. **Terminal 1 - Backend**:

```bash
cd backEnd
npm run dev
```

2. **Terminal 2 - Frontend**:

```bash
cd frontEnd
npm run dev
```

3. **Access Points**:
   - **Frontend Application**: http://localhost:5173
   - **Backend API**: http://localhost:5000
   - **Health Check**: http://localhost:5000/health
   - **Database Test**: http://localhost:5000/test-db

### Production Deployment

1. **Build Frontend**:

```bash
cd frontEnd
npm run build
```

2. **Start Production Server**:

```bash
cd backEnd
NODE_ENV=production npm start
```

## 📱 Application Features Walkthrough

### 🏠 Dashboard

- **Live Statistics**: Real-time employee, attendance, and payroll data
- **Quick Actions**: Direct navigation to key functions
- **Recent Activities**: System activity feed
- **Summary Cards**: At-a-glance metrics

### 👥 Employee Module

- **Add Employees**: Complete employee onboarding
- **Search & Filter**: Find employees quickly
- **Department Management**: Organize by departments
- **Status Tracking**: Monitor employee status

### ⏰ Attendance Module

- **Daily Tracking**: Mark attendance with times
- **Bulk Operations**: Process multiple employees
- **Hour Calculation**: Automatic work hour computation
- **Reporting**: Attendance analytics and trends

### 📝 Leave Module

- **Request Submission**: Employee leave applications
- **Approval Workflow**: Manager review process
- **Balance Tracking**: Automatic leave balance management
- **Types Support**: Multiple leave categories

### 💰 Payroll Module

- **Auto Calculation**: Hours-based payroll computation
- **Overtime Support**: Separate overtime rates
- **Approval Process**: Review before payment
- **Detailed Records**: Complete payroll history

## 🎨 UI Components & Design

### Design System

- **Glass-morphism**: Modern backdrop-blur effects
- **Color Scheme**: Professional blue, green, yellow, purple palette
- **Typography**: Clean, readable font hierarchy
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle depth and elevation

### Interactive Elements

- **Hover Effects**: Smooth transitions and feedback
- **Loading States**: Skeleton loaders and spinners
- **Form Validation**: Real-time input validation
- **Notifications**: Success, error, and info messages
- **Modal Dialogs**: Clean popup interfaces

### Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Perfect for tablet interactions
- **Desktop Experience**: Full-featured desktop interface
- **Touch Friendly**: Large touch targets

## 🔧 Development & Customization

### Backend Structure

```
backEnd/
├── config/
│   └── database.js          # Database configuration and setup
├── server.js                # Main server file with all routes
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables
└── .env.example           # Environment template
```

### Frontend Structure

```
frontEnd/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   └── Layout.jsx       # Main layout wrapper
│   ├── pages/
│   │   ├── Dashboard.jsx    # Dashboard with analytics
│   │   ├── Employees.jsx    # Employee management
│   │   ├── Attendance.jsx   # Attendance tracking
│   │   ├── LeaveRequests.jsx # Leave management
│   │   └── Payroll.jsx      # Payroll processing
│   ├── services/
│   │   └── api.js           # API service functions
│   ├── lib/
│   │   └── utils.js         # Utility functions
│   ├── assets/             # Images and static files
│   └── App.jsx             # Main application component
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite build configuration
└── index.html              # HTML template
```

### Customization Options

#### Adding New Features

1. **Create API endpoints** in `server.js`
2. **Add database tables** in `database.js`
3. **Create frontend pages** in `src/pages/`
4. **Add navigation links** in `Layout.jsx`
5. **Update API services** in `api.js`

#### Styling Customization

- **Colors**: Modify `colorVariants` in components
- **Fonts**: Update Tailwind config
- **Spacing**: Adjust Tailwind classes
- **Animations**: Add custom CSS transitions

#### Database Modifications

- **New Tables**: Add to `initializeDatabase()` function
- **Schema Changes**: Update existing table definitions
- **Relationships**: Add foreign key constraints

## 🐛 Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues

```bash
# Error: ER_ACCESS_DENIED_ERROR
# Solution: Check MySQL credentials
mysql -u root -p
# Test connection manually
```

#### Port Conflicts

```bash
# Error: EADDRINUSE: address already in use
# Solution: Change port or kill process
npx kill-port 5000
# Or change PORT in .env file
```

#### CORS Errors

```bash
# Error: CORS policy blocked
# Solution: Verify FRONTEND_URL in backend .env
FRONTEND_URL=http://localhost:5173
```

#### Package Installation Errors

```bash
# Frontend dependency conflicts
npm install --legacy-peer-deps --force

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### MySQL Service Issues

```bash
# Windows: Start MySQL service
net start mysql

# macOS: Using Homebrew
brew services start mysql

# Linux: Using systemctl
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Performance Optimization

#### Backend Optimization

- **Database Indexing**: Add indexes for frequently queried columns
- **Connection Pooling**: Already configured for optimal performance
- **Query Optimization**: Use efficient SQL queries
- **Caching**: Implement Redis for frequently accessed data

#### Frontend Optimization

- **Code Splitting**: Implement lazy loading for routes
- **Image Optimization**: Compress and optimize images
- **Bundle Analysis**: Use Vite bundle analyzer
- **Memoization**: Use React.memo for expensive components

## 📊 System Requirements

### Minimum Requirements

- **RAM**: 4GB
- **Storage**: 2GB free space
- **CPU**: Dual-core processor
- **Network**: Internet connection for package installation

### Recommended Requirements

- **RAM**: 8GB or higher
- **Storage**: 5GB free space
- **CPU**: Quad-core processor
- **Network**: Stable broadband connection

### Browser Support

- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

## 🔒 Security Considerations

### Authentication & Authorization

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Session Management**: Automatic token expiration
- **CORS Protection**: Configured origin restrictions

### Database Security

- **SQL Injection Prevention**: Parameterized queries
- **Data Validation**: Input sanitization
- **Access Control**: Role-based permissions
- **Backup Strategy**: Regular database backups

### Production Security

- **Environment Variables**: Secure credential management
- **HTTPS**: SSL/TLS encryption
- **Rate Limiting**: API request throttling
- **Input Validation**: Client and server-side validation

## 📈 Future Enhancements

### Planned Features

- **Reports & Analytics**: Advanced reporting dashboard
- **Email Notifications**: Automated email alerts
- **Mobile App**: React Native mobile application
- **Role-Based Access**: Multiple user roles and permissions
- **Integration APIs**: Third-party service integrations
- **Advanced Payroll**: Tax calculations and compliance
- **Document Management**: Employee document storage
- **Performance Reviews**: Employee evaluation system

### Technical Improvements

- **TypeScript**: Type safety for better development
- **Testing**: Unit and integration test coverage
- **CI/CD Pipeline**: Automated deployment
- **Docker**: Containerized deployment
- **Microservices**: Service-oriented architecture

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to branch**: `git push origin feature/AmazingFeature`
5. **Open Pull Request**

### Contribution Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting
- Include screenshots for UI changes

## 📞 Support & Contact

For support, questions, or collaboration opportunities:

- **GitHub Issues**: [Create an issue](https://github.com/ericksondavid/hrms/issues)
- **Email**: ericksondavid@example.com
- **LinkedIn**: [Erickson James David](https://linkedin.com/in/ericksondavid)

## 🙏 Acknowledgments

### Special Thanks

- **Shadcn UI** - For beautiful, accessible components
- **Tailwind CSS** - For utility-first styling approach
- **Lucide React** - For comprehensive icon library
- **Vite** - For lightning-fast development experience
- **Express.js Community** - For robust backend framework
- **React.js Community** - For powerful frontend library
- **MySQL** - For reliable database management

### Inspiration

This project was inspired by the need for efficient HR management in modern organizations and the desire to create a comprehensive, user-friendly solution for businesses of all sizes.

---

**Created with ❤️ by Erickson James David**

_A modern, comprehensive Human Resource Management System designed for efficiency, scalability, and user experience._

---

### Version History

- **v1.0.0** - Initial release with core HR modules
- **v1.1.0** - Enhanced dashboard and payroll system
- **v1.2.0** - Improved UI/UX and responsive design
- **Current** - Feature-complete HRMS with modern tech stack

### Last Updated

December 2024

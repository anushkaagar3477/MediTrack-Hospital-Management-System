# 🏥 MediTrack - Hospital Management System

A modern, comprehensive hospital management system designed to streamline patient care, appointment scheduling, and healthcare administration. MediTrack provides an intuitive interface for managing patient records, doctor information, and medical appointments.

## 📋 Project Overview

MediTrack is a full-stack web application that helps hospitals and healthcare facilities manage their operations efficiently. The system includes features for patient registration, appointment booking, doctor management, and a comprehensive dashboard for monitoring hospital activities.

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling and responsive design
- **JavaScript (Vanilla)** - Client-side interactivity and DOM manipulation
- **Features**:
  - User authentication (Login & Registration)
  - Interactive dashboard with navigation
  - Real-time updates and live clock
  - Responsive UI for multiple screen sizes

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web server framework (implied)
- **RESTful API** - For seamless frontend-backend communication

### Architecture
- **Frontend**: Static HTML/CSS/JS web application
- **Backend**: Node.js server for API endpoints and business logic
- **Communication**: RESTful API with JSON data format

## ✨ Features

### User Management
- 🔐 **User Registration** - Create new accounts with email and password
- 🔑 **User Login** - Secure authentication system
- 👤 **Profile Management** - User account management

### Dashboard
- 📊 **Dashboard View** - Overview of hospital statistics and key metrics
- 👥 **Patients Management** - View, add, and manage patient records
- 📅 **Appointments** - Schedule and track medical appointments
- 👨‍⚕️ **Doctors Directory** - Manage doctor information and specializations
- ⏰ **Live Time Display** - Real-time clock on the dashboard
- 🚪 **Secure Logout** - User session management

## 📁 Project Structure

```
hospital-project/
├── frontend/
│   ├── login.html          # User login page
│   ├── register.html       # User registration page
│   ├── dashboard.html      # Main dashboard interface
│   └── style.css           # Styling for all pages
├── backend/
│   └── server.js           # Node.js server entry point
└── README.md               # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-project
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the backend server**
   ```bash
   node server.js
   ```
   The server will run on `http://localhost:3000` (or configured port)

4. **Open the frontend**
   - Navigate to the `frontend` folder
   - Open `login.html` in your web browser
   - Or serve using a local server

## 📖 Usage

1. **Register** - Create a new account with your email and password
2. **Login** - Access the system with your credentials
3. **Dashboard** - Manage all hospital operations from the main dashboard
4. **Navigation** - Use the sidebar to navigate between different modules

## 🔄 Workflow

```
User Registration → User Login → Dashboard Access → Module Selection
                                 ├── Patients
                                 ├── Appointments
                                 └── Doctors
```

## 🔒 Security Features

- User authentication with email and password
- Session management with secure logout
- Password strength validation
- Secure REST API communication

## 📈 Future Enhancements

- Database integration (MySQL, MongoDB, PostgreSQL)
- Advanced appointment scheduling with notifications
- Medical records digitization
- Billing and payment processing
- SMS/Email notifications
- Report generation
- Mobile app development
- User role-based access control

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👥 Authors

- **Development Team** - Hospital Management Solutions

## 📞 Support

For support, please reach out to the development team or create an issue in the repository.

---

**Note**: This is a frontend-focused prototype. Database connectivity and backend API endpoints should be implemented before production deployment.

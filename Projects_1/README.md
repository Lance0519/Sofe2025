# Clinic Appointment System

A comprehensive web-based platform designed to streamline appointment scheduling and clinic operations with role-based access for Patients, Clinic Staff, and Administrators.

## Features

### For Patients
- **Account Management**
  - Create account and secure login
  - Password recovery functionality
  - Update profile information

- **Appointment Management**
  - View available doctors and their schedules
  - Select service types
  - Book appointments with preferred doctors
  - Reschedule appointments
  - Cancel appointments
  - View appointment history

### For Clinic Staff
- **Booking Management**
  - Create bookings for patients
  - View all appointments
  - Confirm, modify, or cancel appointments
  - Filter appointments (all, pending, confirmed, today)

- **Schedule Management**
  - Update clinic schedules
  - Add doctor schedules
  - Ensure bookings align with doctor availability

### For Administrators
- **Full System Control**
  - Create and manage staff accounts
  - Manage doctor information
  - Oversee all appointments
  - Edit website services
  - Add, update, or remove services
  - Manage doctor schedules
  - View system statistics

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Storage**: LocalStorage for data persistence
- **Styling**: Custom CSS with modern design principles

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation

1. Clone or download the project to your local machine
2. Navigate to the project directory
3. Open `home/index.html` in your web browser

### Demo Credentials

#### Patient Account
- Username: `patient`
- Password: `patient123`

#### Staff Account
- Username: `staff`
- Password: `staff123`

#### Admin Account
- Username: `admin`
- Password: `admin123`

## Project Structure

```
clinic-appointment-system/
├── about/              # About page
│   ├── about.html
│   ├── about.css
│   └── about.js
├── assets/             # Static assets
│   ├── fonts/
│   └── images/
├── book/               # Appointment booking
│   ├── book.html
│   ├── book.css
│   └── book.js
├── common/             # Shared utilities
│   ├── common.css      # Common styles
│   ├── common.js       # Authentication & utilities
│   └── storage.js      # Data management
├── contact/            # Contact page
│   ├── contact.html
│   ├── contact.css
│   └── contact.js
├── dashboard/          # Role-based dashboards
│   ├── admin.html
│   ├── admin.css
│   ├── admin.js
│   ├── patient.html
│   ├── patient.css
│   ├── patient.js
│   ├── staff.html
│   ├── staff.css
│   └── staff.js
├── home/               # Home page
│   ├── index.html
│   ├── home.css
│   └── home.js
├── login/              # Authentication
│   ├── login.html
│   ├── login.css
│   └── login.js
└── services/           # Services page
    ├── services.html
    ├── services.css
    └── services.js
```

## Key Features Explained

### Authentication System
- Secure login with role-based access control
- Session management using sessionStorage
- Password recovery functionality
- New patient registration

### Data Management
- All data stored in localStorage
- Pre-populated with sample data
- CRUD operations for all entities
- Real-time data synchronization

### Appointment Booking Flow
1. Select a medical service
2. Choose a preferred doctor
3. Pick date and time from available slots
4. Review and confirm booking
5. Receive confirmation

### Schedule Management
- Doctor schedules by day of week
- Time slot generation (30-minute intervals)
- Conflict prevention (no double booking)
- Real-time availability checking

## User Workflows

### Patient Workflow
1. Register or login to patient account
2. Browse services and doctors
3. Book appointment
4. View upcoming appointments
5. Manage (reschedule/cancel) appointments
6. View appointment history

### Staff Workflow
1. Login to staff account
2. View dashboard with statistics
3. Create appointments for patients
4. Manage existing appointments
5. Update doctor schedules
6. View filtered appointments

### Admin Workflow
1. Login to admin account
2. View system statistics
3. Create staff accounts
4. Manage doctors and services
5. Oversee all appointments
6. Manage schedules

## Customization

### Adding New Services
1. Login as admin
2. Navigate to Services tab
3. Click "Add Service"
4. Fill in service details (name, description, duration, price)
5. Submit to add

### Adding New Doctors
1. Login as admin
2. Navigate to Doctors tab
3. Click "Add Doctor"
4. Enter doctor information
5. Add schedules for the doctor

### Creating Staff Accounts
1. Login as admin
2. Navigate to Staff Management tab
3. Click "Create Staff Account"
4. Enter credentials and information
5. Submit to create

## Data Schema

### Users
- id, username, password, role, email, fullName

### Patients (extends Users)
- phone, dateOfBirth, address

### Doctors
- id, name, specialty, available

### Services
- id, name, description, duration, price

### Appointments
- id, patientId, doctorId, serviceId, date, time, status, notes, createdAt

### Schedules
- id, doctorId, day, startTime, endTime

## Security Considerations

**Note**: This is a demonstration project. For production use:
- Implement proper backend authentication
- Use secure password hashing
- Add HTTPS encryption
- Implement proper session management
- Add input validation and sanitization
- Implement rate limiting
- Add CSRF protection

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Known Limitations

- Data stored in localStorage (cleared when browser cache is cleared)
- No backend server (all operations are client-side)
- No email notifications (simulated)
- No payment processing
- No real-time updates across multiple sessions

## Future Enhancements

- Backend API integration
- Real email notifications
- SMS reminders
- Payment processing
- Medical records management
- Prescription management
- Video consultation integration
- Mobile app version
- Multi-language support

## Support

For questions or issues, please use the contact form in the application or reach out through the contact page.

## License

This project is created for educational and demonstration purposes.

## Author

Built with ❤️ for efficient healthcare management

---

**Last Updated**: October 2025


// Common utilities and authentication

const Auth = {
    // Login function
    login(username, password) {
        const user = Storage.getUserByUsername(username);
        if (user && user.password === password) {
            Storage.setCurrentUser(user);
            return { success: true, user };
        }
        return { success: false, message: 'Invalid username or password' };
    },

    // Logout function
    logout() {
        Storage.logout();
        window.location.href = '../login/login.html';
    },

    // Check if user is authenticated
    isAuthenticated() {
        return Storage.getCurrentUser() !== null;
    },

    // Get current user
    getCurrentUser() {
        return Storage.getCurrentUser();
    },

    // Check user role
    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.role === role;
    },

    // Require authentication
    requireAuth(allowedRoles = []) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = '../login/login.html';
            return false;
        }
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            alert('You do not have permission to access this page');
            this.redirectToDashboard(user.role);
            return false;
        }
        return true;
    },

    // Redirect to appropriate dashboard
    redirectToDashboard(role) {
        switch(role) {
            case 'admin':
                window.location.href = '../dashboard/admin.html';
                break;
            case 'staff':
                window.location.href = '../dashboard/staff.html';
                break;
            case 'patient':
                window.location.href = '../dashboard/patient.html';
                break;
            default:
                window.location.href = '../login/login.html';
        }
    },

    // Register new patient
    register(userData) {
        const existingUser = Storage.getUserByUsername(userData.username);
        if (existingUser) {
            return { success: false, message: 'Username already exists' };
        }
        
        const newUser = Storage.createUser({
            ...userData,
            role: 'patient'
        });
        
        return { success: true, user: newUser };
    },

    // Password recovery
    recoverPassword(email) {
        const users = Storage.getAllUsers();
        const user = users.find(u => u.email === email);
        if (user) {
            // In a real app, this would send an email
            // For demo purposes, we'll just show the password
            return { success: true, message: `Your password is: ${user.password}`, password: user.password };
        }
        return { success: false, message: 'Email not found' };
    }
};

// Utility functions
const Utils = {
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    // Format time
    formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    },

    // Generate time slots
    generateTimeSlots(startTime, endTime, interval = 30) {
        const slots = [];
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        let currentHour = startHour;
        let currentMinute = startMinute;
        
        while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
            slots.push(timeString);
            
            currentMinute += interval;
            if (currentMinute >= 60) {
                currentHour += Math.floor(currentMinute / 60);
                currentMinute = currentMinute % 60;
            }
        }
        
        return slots;
    },

    // Get day of week from date
    getDayOfWeek(dateString) {
        const date = new Date(dateString);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    },

    // Check if date is in the past
    isPastDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    },

    // Validate email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate phone
    validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]+$/;
        return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
    },

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Confirm dialog
    confirm(message) {
        return window.confirm(message);
    },

    // Get appointment status badge class
    getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'badge-warning',
            'confirmed': 'badge-success',
            'cancelled': 'badge-danger',
            'completed': 'badge-info'
        };
        return statusMap[status] || 'badge-secondary';
    },

    // Sort appointments by date and time
    sortAppointments(appointments) {
        return appointments.sort((a, b) => {
            const dateA = new Date(a.date + ' ' + a.time);
            const dateB = new Date(b.date + ' ' + b.time);
            return dateB - dateA;
        });
    },

    // Get future appointments
    getFutureAppointments(appointments) {
        const now = new Date();
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date + ' ' + apt.time);
            return aptDate >= now;
        });
    },

    // Get past appointments
    getPastAppointments(appointments) {
        const now = new Date();
        return appointments.filter(apt => {
            const aptDate = new Date(apt.date + ' ' + apt.time);
            return aptDate < now;
        });
    }
};

// Navigation helper
function setupNavigation() {
    const user = Auth.getCurrentUser();
    const navElement = document.querySelector('.user-nav');
    
    if (navElement && user) {
        navElement.innerHTML = `
            <span class="user-name">Welcome, ${user.fullName}</span>
            <button onclick="Auth.logout()" class="btn-logout">Logout</button>
        `;
    }
    
    // Update Login button to Dashboard button if user is logged in
    updateLoginButton(user);
}

// Update Login button to Dashboard button based on login status
function updateLoginButton(user) {
    const nav = document.querySelector('nav ul');
    if (!nav) return;
    
    const loginLink = nav.querySelector('a[href="../login/login.html"]') || 
                     nav.querySelector('a[href="login/login.html"]') ||
                     nav.querySelector('a[href="../login/login.html"].btn-primary');
    
    if (loginLink && user) {
        const listItem = loginLink.parentElement;
        const dashboardPath = user.role === 'admin' ? 'admin' : 
                            user.role === 'staff' ? 'staff' : 'patient';
        
        // Determine the correct path based on current location
        let dashboardUrl = '';
        if (window.location.pathname.includes('/dashboard/')) {
            dashboardUrl = `${dashboardPath}.html`;
        } else if (window.location.pathname.includes('/home/')) {
            dashboardUrl = `../dashboard/${dashboardPath}.html`;
        } else {
            dashboardUrl = `../dashboard/${dashboardPath}.html`;
        }
        
        listItem.innerHTML = `
            <a href="${dashboardUrl}" class="btn btn-primary">Dashboard</a>
        `;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
});


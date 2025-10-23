// Login page functionality

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const forgotPasswordForm = document.getElementById('forgotPasswordForm');

// Form switching
document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    forgotPasswordForm.style.display = 'none';
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
});

document.getElementById('showForgotPassword').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
});

document.getElementById('backToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';
});

// Login form submission
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const result = Auth.login(username, password);
    
    if (result.success) {
        Utils.showNotification('Login successful!', 'success');
        setTimeout(() => {
            Auth.redirectToDashboard(result.user.role);
        }, 1000);
    } else {
        Utils.showNotification(result.message, 'error');
    }
});

// Registration form submission
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const fullName = document.getElementById('regFullName').value;
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const dateOfBirth = document.getElementById('regDOB').value;
    const address = document.getElementById('regAddress').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        Utils.showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 6) {
        Utils.showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    if (!Utils.validateEmail(email)) {
        Utils.showNotification('Please enter a valid email', 'error');
        return;
    }
    
    if (!Utils.validatePhone(phone)) {
        Utils.showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    const userData = {
        fullName,
        username,
        email,
        phone,
        dateOfBirth,
        address,
        password
    };
    
    const result = Auth.register(userData);
    
    if (result.success) {
        Utils.showNotification('Registration successful! Please login.', 'success');
        setTimeout(() => {
            registerForm.reset();
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        }, 1500);
    } else {
        Utils.showNotification(result.message, 'error');
    }
});

// Forgot password form submission
forgotPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
    if (!Utils.validateEmail(email)) {
        Utils.showNotification('Please enter a valid email', 'error');
        return;
    }
    
    const result = Auth.recoverPassword(email);
    
    if (result.success) {
        alert(`Password recovery successful!\n\n${result.message}`);
        Utils.showNotification('Check the alert for your password', 'success');
        forgotPasswordForm.reset();
    } else {
        Utils.showNotification(result.message, 'error');
    }
});

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = Auth.getCurrentUser();
    if (currentUser) {
        Auth.redirectToDashboard(currentUser.role);
    }
});


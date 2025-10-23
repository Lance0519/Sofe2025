// Public Booking Page - Customer Side

document.addEventListener('DOMContentLoaded', () => {
    // Check if health screening was passed
    const screeningPassed = sessionStorage.getItem('healthScreeningPassed');
    if (!screeningPassed) {
        // Show health screening modal
        showHealthScreeningModal();
    }
    
    // Load services
    loadServicesDisplay();
    loadProcedureDropdown();
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Handle procedure selection to update price
    document.getElementById('dentalProcedure').addEventListener('change', updatePrice);
    
    // Handle form submission
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Handle health screening form submission
    document.getElementById('healthScreeningForm').addEventListener('submit', handleHealthScreeningSubmit);
});

// Show health screening modal
function showHealthScreeningModal() {
    const modal = document.getElementById('healthScreeningModal');
    modal.classList.add('show');
}

// Close health screening modal
function closeHealthScreeningModal() {
    const modal = document.getElementById('healthScreeningModal');
    modal.classList.remove('show');
}

// Go back from health screening
function goBackFromScreening() {
    if (confirm('Are you sure you want to go back? You will need to complete the health screening to book an appointment.')) {
        sessionStorage.removeItem('healthScreeningPassed');
        window.location.href = '../dashboard/patient.html';
    }
}

// Handle health screening submission
function handleHealthScreeningSubmit(e) {
    e.preventDefault();
    
    // Get all answers
    const answers = {
        q1: document.querySelector('input[name="q1"]:checked').value,
        q2: document.querySelector('input[name="q2"]:checked').value,
        q3: document.querySelector('input[name="q3"]:checked').value,
        q4: document.querySelector('input[name="q4"]:checked').value,
        q5: document.querySelector('input[name="q5"]:checked').value
    };
    
    // Check if any answer is "yes"
    const hasSymptoms = Object.values(answers).some(answer => answer === 'yes');
    
    if (hasSymptoms) {
        // User has symptoms - show warning
        alert('⚠️ Health Screening Alert\n\nBased on your responses, we recommend that you stay at home and contact your health care provider.\n\nFor your safety and the safety of others, please reschedule your appointment once you have recovered.\n\nFor urgent dental concerns, please call the clinic directly.');
        
        // Optionally redirect to contact page
        if (confirm('Would you like to go to our contact page to get in touch with us?')) {
            window.location.href = '../contact/contact.html';
        } else {
            // Reset form and close modal
            document.getElementById('healthScreeningForm').reset();
            closeHealthScreeningModal();
        }
    } else {
        // All answers are "no" - proceed to booking
        sessionStorage.setItem('healthScreeningPassed', 'true');
        sessionStorage.setItem('screeningDate', new Date().toISOString());
        
        // Show success message
        alert('✅ Health Screening Passed\n\nThank you for completing the health screening.\n\nYou may now proceed with your booking.');
        
        // Close modal
        closeHealthScreeningModal();
    }
}

// Load and display services in the grid
function loadServicesDisplay() {
    const services = Storage.getServices();
    const container = document.getElementById('servicesList');
    
    // Display first 6 services
    const displayServices = services.slice(0, 6);
    
    container.innerHTML = displayServices.map(service => `
        <div class="service-card">
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <div class="price">${service.price}</div>
        </div>
    `).join('');
}

// Populate procedure dropdown
function loadProcedureDropdown() {
    const services = Storage.getServices();
    const select = document.getElementById('dentalProcedure');
    
    const consultationOption = '<option value="consultation">Consultation (₱500 only, free with any dental procedure)</option>';
    const serviceOptions = services.map(s => 
        `<option value="${s.id}" data-price="${s.price}">${s.name} - ${s.price}</option>`
    ).join('');
    
    select.innerHTML = '<option value="">Select Procedure</option>' + consultationOption + serviceOptions;
}

// Update price display based on selected procedure
function updatePrice() {
    const select = document.getElementById('dentalProcedure');
    const priceDisplay = document.getElementById('priceValue');
    
    if (select.value === 'consultation') {
        priceDisplay.textContent = '₱500';
    } else if (select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const price = selectedOption.dataset.price || selectedOption.text.split(' - ')[1] || '₱500';
        priceDisplay.textContent = price.includes('₱') ? price.split(' ')[0] : price;
    } else {
        priceDisplay.textContent = '₱500';
    }
}

// Handle booking form submission
function handleBookingSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('customerName').value,
        age: document.getElementById('customerAge').value,
        contact: document.getElementById('customerContact').value,
        procedure: document.getElementById('dentalProcedure').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('preferredTime').value,
        paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value
    };
    
    // Validate contact number format
    if (!isValidPhoneNumber(formData.contact)) {
        alert('Please enter a valid Philippine mobile number (e.g., 09123456789)');
        return;
    }
    
    // Check if user is logged in
    const currentUser = Storage.getCurrentUser();
    
    if (!currentUser) {
        // Not logged in - prompt to login or register
        if (confirm('You need to have an account to book an appointment. Would you like to login or create an account now?')) {
            // Save booking data to session storage
            sessionStorage.setItem('pendingBooking', JSON.stringify(formData));
            // Redirect to login page
            window.location.href = '../login/login.html';
        }
        return;
    }
    
    // User is logged in - create appointment
    createAppointment(formData, currentUser);
}

// Create appointment
function createAppointment(formData, user) {
    // Get service details
    let serviceId, serviceName;
    
    if (formData.procedure === 'consultation') {
        // Create a consultation service if it doesn't exist
        const services = Storage.getServices();
        const consultService = services.find(s => s.name.toLowerCase().includes('consultation'));
        if (consultService) {
            serviceId = consultService.id;
            serviceName = consultService.name;
        } else {
            // Use first service as fallback
            serviceId = services[0]?.id || 'srv001';
            serviceName = 'Consultation';
        }
    } else {
        serviceId = formData.procedure;
        const service = Storage.getServiceById(serviceId);
        serviceName = service ? service.name : 'Unknown Service';
    }
    
    // Get first available doctor
    const doctors = Storage.getDoctors();
    const availableDoctor = doctors.find(d => d.available) || doctors[0];
    
    if (!availableDoctor) {
        alert('Sorry, no dentists are currently available. Please contact the clinic directly.');
        return;
    }
    
    // Create appointment object
    const appointmentData = {
        patientId: user.id,
        doctorId: availableDoctor.id,
        serviceId: serviceId,
        date: formData.date,
        time: formData.time,
        notes: `Age: ${formData.age}, Contact: ${formData.contact}, Payment: ${formData.paymentMethod}`,
        status: 'pending',
        createdBy: user.id
    };
    
    try {
        Storage.createAppointment(appointmentData);
        
        // Clear health screening status after successful booking
        sessionStorage.removeItem('healthScreeningPassed');
        sessionStorage.removeItem('screeningDate');
        
        // Show success message
        alert(`🎉 Appointment Booked Successfully!\n\nService: ${serviceName}\nDentist: ${availableDoctor.name}\nDate: ${formatDate(formData.date)}\nTime: ${formatTime(formData.time)}\n\nWe'll confirm your appointment shortly. Check your dashboard for updates.`);
        
        // Reset form
        document.getElementById('bookingForm').reset();
        document.getElementById('priceValue').textContent = '₱500';
        
        // Optionally redirect to patient dashboard
        if (confirm('Would you like to view your appointments now?')) {
            window.location.href = '../dashboard/patient.html';
        }
    } catch (error) {
        console.error('Error creating appointment:', error);
        alert('Sorry, there was an error booking your appointment. Please try again or contact the clinic directly.');
    }
}

// Validate Philippine phone number
function isValidPhoneNumber(phone) {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');
    // Check if it's a valid Philippine mobile number (09XXXXXXXXX or 639XXXXXXXXX)
    return /^(09|639)\d{9}$/.test(cleaned);
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Format time for display
function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${displayHour}:${minutes || '00'} ${ampm}`;
}

// Check for pending booking after login
window.addEventListener('load', () => {
    const pendingBooking = sessionStorage.getItem('pendingBooking');
    if (pendingBooking) {
        const formData = JSON.parse(pendingBooking);
        const currentUser = Storage.getCurrentUser();
        
        if (currentUser) {
            // Auto-fill the form with pending booking data
            document.getElementById('customerName').value = formData.name;
            document.getElementById('customerAge').value = formData.age;
            document.getElementById('customerContact').value = formData.contact;
            document.getElementById('dentalProcedure').value = formData.procedure;
            document.getElementById('appointmentDate').value = formData.date;
            document.getElementById('preferredTime').value = formData.time;
            document.querySelector(`input[name="paymentMethod"][value="${formData.paymentMethod}"]`).checked = true;
            
            updatePrice();
            
            // Clear pending booking
            sessionStorage.removeItem('pendingBooking');
            
            // Show message
            alert('Welcome back! Please review your booking details and click "Book Now" to confirm.');
        }
    }
});

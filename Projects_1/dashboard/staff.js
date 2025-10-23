// Staff dashboard functionality

let currentUser = null;
let currentFilter = 'all';

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Require staff authentication
    if (!Auth.requireAuth(['staff'])) {
        return;
    }
    
    currentUser = Auth.getCurrentUser();
    
    // Update UI with user info
    document.getElementById('userName').textContent = `Welcome, ${currentUser.fullName}`;
    
    // Load dashboard data
    loadStatistics();
    loadAppointments();
    loadSchedules();
    populateDropdowns();
    
    // Set minimum date for appointment creation
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // Setup filter buttons
    setupFilters();
    
    // Auto-refresh every 5 seconds to sync with new appointments
    setInterval(() => {
        loadStatistics();
        loadAppointments();
    }, 5000);
    
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
        if (e.key === 'clinicData' || e.key === 'lastDataUpdate') {
            loadStatistics();
            loadAppointments();
            loadSchedules();
            loadStaffPatients();
            loadClinicSchedule();
        }
    });
    
    // Listen for custom data update events (same-tab sync)
    window.addEventListener('clinicDataUpdated', () => {
        loadStatistics();
        loadAppointments();
        loadSchedules();
        loadStaffPatients();
    });
});

// Show/hide sections
function showSection(sectionName) {
    const appointmentsSection = document.getElementById('appointmentsSection');
    const clinicScheduleSection = document.getElementById('clinicScheduleSection');
    const schedulesSection = document.getElementById('schedulesSection');
    const patientsSection = document.getElementById('patientsSection');
    
    // Hide all sections
    appointmentsSection.style.display = 'none';
    clinicScheduleSection.style.display = 'none';
    schedulesSection.style.display = 'none';
    patientsSection.style.display = 'none';
    
    // Show selected section
    if (sectionName === 'appointments') {
        appointmentsSection.style.display = 'block';
        appointmentsSection.scrollIntoView({ behavior: 'smooth' });
        loadAppointments();
    } else if (sectionName === 'clinicSchedule') {
        clinicScheduleSection.style.display = 'block';
        clinicScheduleSection.scrollIntoView({ behavior: 'smooth' });
        loadClinicSchedule();
    } else if (sectionName === 'schedules') {
        schedulesSection.style.display = 'block';
        schedulesSection.scrollIntoView({ behavior: 'smooth' });
        loadSchedules();
    } else if (sectionName === 'patients') {
        patientsSection.style.display = 'block';
        patientsSection.scrollIntoView({ behavior: 'smooth' });
        loadStaffPatients();
    } else {
        appointmentsSection.style.display = 'block';
        appointmentsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Load statistics
function loadStatistics() {
    const appointments = Storage.getAppointments();
    const patients = Storage.getPatients();
    
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(apt => apt.date === today).length;
    const pending = appointments.filter(apt => apt.status === 'pending').length;
    const confirmed = appointments.filter(apt => apt.status === 'confirmed').length;
    
    document.getElementById('todayAppointments').textContent = todayAppointments;
    document.getElementById('pendingAppointments').textContent = pending;
    document.getElementById('confirmedAppointments').textContent = confirmed;
    document.getElementById('totalPatients').textContent = patients.length;
}

// Setup filters
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            loadAppointments();
        });
    });
}

// Load appointments
function loadAppointments() {
    let appointments = Storage.getAppointments();
    
    // Apply filters
    const today = new Date().toISOString().split('T')[0];
    
    switch(currentFilter) {
        case 'pending':
            appointments = appointments.filter(apt => apt.status === 'pending');
            break;
        case 'confirmed':
            appointments = appointments.filter(apt => apt.status === 'confirmed');
            break;
        case 'today':
            appointments = appointments.filter(apt => apt.date === today);
            break;
    }
    
    appointments = Utils.sortAppointments(appointments);
    
    const container = document.getElementById('appointmentsList');
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">📅</div>
                <p>No appointments found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <div class="appointment-row appointment-row-header">
            <div>Patient</div>
            <div>Doctor</div>
            <div>Date</div>
            <div>Time</div>
            <div>Actions</div>
        </div>
    ` + appointments.map(apt => {
        const patient = Storage.getPatientById(apt.patientId);
        const doctor = Storage.getDoctorById(apt.doctorId);
        const service = Storage.getServiceById(apt.serviceId);
        
        return `
            <div class="appointment-row">
                <div class="appointment-patient">
                    ${patient ? patient.fullName : 'Unknown'}
                    <br>
                    <small style="color: var(--text-color); font-weight: normal;">
                        ${service ? service.name : 'N/A'}
                    </small>
                    <br>
                    <span class="badge ${Utils.getStatusBadgeClass(apt.status)}">${apt.status.toUpperCase()}</span>
                </div>
                <div>${doctor ? doctor.name : 'Unknown'}</div>
                <div class="appointment-datetime">${Utils.formatDate(apt.date)}</div>
                <div class="appointment-datetime">${Utils.formatTime(apt.time)}</div>
                <div class="appointment-actions">
                    ${apt.status === 'pending' ? 
                        `<button onclick="confirmAppointment('${apt.id}')" class="btn btn-success btn-xs">Confirm</button>` : ''}
                    <button onclick="changeAppointmentDentist('${apt.id}')" class="btn btn-primary btn-xs" title="Assign/Change Dentist">👨‍⚕️ Dentist</button>
                    <button onclick="editAppointmentStatus('${apt.id}')" class="btn btn-warning btn-xs">Edit</button>
                    <button onclick="cancelAppointment('${apt.id}')" class="btn btn-danger btn-xs">Cancel</button>
                </div>
            </div>
        `;
    }).join('');
}

// Confirm appointment
function confirmAppointment(appointmentId) {
    Storage.updateAppointment(appointmentId, { status: 'confirmed' });
    Utils.showNotification('Appointment confirmed!', 'success');
    loadStatistics();
    loadAppointments();
    triggerDataSync();
}

// Edit appointment status
function editAppointmentStatus(appointmentId) {
    const newStatus = prompt('Enter new status (pending/confirmed/completed/cancelled):');
    if (newStatus && ['pending', 'confirmed', 'completed', 'cancelled'].includes(newStatus.toLowerCase())) {
        Storage.updateAppointment(appointmentId, { status: newStatus.toLowerCase() });
        Utils.showNotification('Appointment status updated!', 'success');
        loadStatistics();
        loadAppointments();
        triggerDataSync();
    } else if (newStatus) {
        Utils.showNotification('Invalid status', 'error');
    }
}

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (!Utils.confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    Storage.updateAppointment(appointmentId, { status: 'cancelled' });
    Utils.showNotification('Appointment cancelled', 'info');
    loadStatistics();
    loadAppointments();
    triggerDataSync();
}

// Change appointment dentist
function changeAppointmentDentist(appointmentId) {
    const appointment = Storage.getAppointmentById(appointmentId);
    if (!appointment) {
        Utils.showNotification('Appointment not found', 'error');
        return;
    }
    
    // Store appointment ID
    document.getElementById('changeDentistAppointmentId').value = appointmentId;
    
    // Populate dentist dropdown
    const doctors = Storage.getDoctors();
    const dentistSelect = document.getElementById('changeDentistSelect');
    dentistSelect.innerHTML = '<option value="">Select Dentist</option>' +
        doctors.map(d => `<option value="${d.id}" ${d.id === appointment.doctorId ? 'selected' : ''}>${d.name} - ${d.specialty} ${!d.available ? '(Unavailable)' : ''}</option>`).join('');
    
    // Show current assignment info
    const currentDoctor = Storage.getDoctorById(appointment.doctorId);
    const patient = Storage.getPatientById(appointment.patientId);
    const service = Storage.getServiceById(appointment.serviceId);
    
    document.getElementById('changeDentistInfo').innerHTML = `
        <div style="background: #1a1a1a; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; border-left: 3px solid #D4AF37;">
            <p style="margin: 0.25rem 0;"><strong>Patient:</strong> ${patient ? patient.fullName : 'Unknown'}</p>
            <p style="margin: 0.25rem 0;"><strong>Service:</strong> ${service ? service.name : 'N/A'}</p>
            <p style="margin: 0.25rem 0;"><strong>Date:</strong> ${Utils.formatDate(appointment.date)} at ${Utils.formatTime(appointment.time)}</p>
            <p style="margin: 0.25rem 0;"><strong>Current Dentist:</strong> ${currentDoctor ? currentDoctor.name : 'Not assigned'}</p>
        </div>
    `;
    
    // Open modal
    document.getElementById('changeDentistModal').classList.add('active');
}

function closeChangeDentistModal() {
    document.getElementById('changeDentistModal').classList.remove('active');
    document.getElementById('changeDentistForm').reset();
}

// Handle change dentist form submission
document.getElementById('changeDentistForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const appointmentId = document.getElementById('changeDentistAppointmentId').value;
    const newDoctorId = document.getElementById('changeDentistSelect').value;
    
    if (!newDoctorId) {
        Utils.showNotification('Please select a dentist', 'error');
        return;
    }
    
    const newDoctor = Storage.getDoctorById(newDoctorId);
    
    // Update appointment with new dentist
    Storage.updateAppointment(appointmentId, { doctorId: newDoctorId });
    
    Utils.showNotification(`Dentist updated to ${newDoctor ? newDoctor.name : 'selected dentist'}!`, 'success');
    closeChangeDentistModal();
    loadStatistics();
    loadAppointments();
    triggerDataSync();
});

// Load schedules
function loadSchedules() {
    const doctors = Storage.getDoctors();
    const container = document.getElementById('schedulesList');
    
    if (doctors.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">🦷</div>
                <p>No dentists found</p>
                <small>Please add dentists first in the Admin Dashboard</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = doctors.map(doctor => {
        const schedules = Storage.getSchedulesByDoctor(doctor.id);
        
        return `
            <div class="schedule-card">
                <div class="schedule-header">
                    <div class="schedule-doctor">${doctor.name} - ${doctor.specialty}</div>
                    ${schedules.length === 0 ? `
                        <button onclick="showAddScheduleModalForDoctor('${doctor.id}')" class="btn btn-primary btn-xs">
                            ➕ Add Schedule
                        </button>
                    ` : ''}
                </div>
                <div class="schedule-days">
                    ${schedules.length > 0 ? schedules.map(sch => `
                        <div class="schedule-day">
                            <div class="schedule-day-name">${sch.day}</div>
                            <div class="schedule-time">${Utils.formatTime(sch.startTime)} - ${Utils.formatTime(sch.endTime)}</div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <button onclick="editSchedule('${sch.id}')" class="btn btn-warning btn-xs">Edit</button>
                                <button onclick="deleteSchedule('${sch.id}')" class="btn btn-danger btn-xs">Delete</button>
                            </div>
                        </div>
                    `).join('') : '<p style="color: var(--text-color); margin: 1rem 0;">No schedules set for this dentist</p>'}
                </div>
            </div>
        `;
    }).join('');
}

// Edit schedule
function editSchedule(scheduleId) {
    const schedule = Storage.getScheduleById(scheduleId);
    if (!schedule) {
        Utils.showNotification('Schedule not found', 'error');
        return;
    }
    
    const doctor = Storage.getDoctorById(schedule.doctorId);
    
    document.getElementById('editScheduleId').value = scheduleId;
    document.getElementById('editScheduleDoctorName').value = doctor ? `${doctor.name} - ${doctor.specialty}` : 'Unknown';
    document.getElementById('editScheduleDay').value = schedule.day;
    document.getElementById('editScheduleStartTime').value = schedule.startTime;
    document.getElementById('editScheduleEndTime').value = schedule.endTime;
    
    document.getElementById('editScheduleModal').classList.add('active');
}

function closeEditScheduleModal() {
    document.getElementById('editScheduleModal').classList.remove('active');
    document.getElementById('editScheduleForm').reset();
}

// Delete schedule
function deleteSchedule(scheduleId) {
    if (!Utils.confirm('Are you sure you want to delete this schedule?')) {
        return;
    }
    
    Storage.deleteSchedule(scheduleId);
    Utils.showNotification('Schedule deleted', 'info');
    loadSchedules();
    triggerDataSync();
}

// Populate dropdowns
function populateDropdowns() {
    // Populate patients
    const patients = Storage.getPatients();
    const patientSelect = document.getElementById('appointmentPatient');
    patientSelect.innerHTML = '<option value="">Select Patient</option>' +
        patients.map(p => `<option value="${p.id}">${p.fullName} - ${p.email}</option>`).join('');
    
    // Populate doctors for schedule modal and appointment doctor selection
    const doctors = Storage.getDoctors();
    const scheduleDoctor = document.getElementById('scheduleDoctor');
    if (scheduleDoctor) {
        scheduleDoctor.innerHTML = '<option value="">Select Dentist</option>' +
            doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('');
    }
    
    // Populate doctors for appointment creation
    const appointmentDoctor = document.getElementById('appointmentDoctor');
    if (appointmentDoctor) {
        appointmentDoctor.innerHTML = '<option value="">Auto-assign available dentist</option>' +
            doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty} ${!d.available ? '(Unavailable)' : ''}</option>`).join('');
    }
    
    // Populate services with prices
    const services = Storage.getServices();
    const serviceSelect = document.getElementById('appointmentService');
    serviceSelect.innerHTML = '<option value="">Select Service</option>' +
        '<option value="consultation">Consultation (₱500 only, free with any dental procedure)</option>' +
        services.map(s => `<option value="${s.id}" data-price="${s.price}">${s.name} - ${s.price}</option>`).join('');
}

// Toggle between registered and walk-in patient
function togglePatientType() {
    const patientType = document.querySelector('input[name="patientType"]:checked').value;
    const existingSection = document.getElementById('existingPatientSection');
    const walkinSection = document.getElementById('walkinPatientSection');
    const patientSelect = document.getElementById('appointmentPatient');
    
    if (patientType === 'existing') {
        existingSection.style.display = 'block';
        walkinSection.style.display = 'none';
        patientSelect.required = true;
        // Clear walk-in fields
        document.getElementById('walkinName').required = false;
        document.getElementById('walkinAge').required = false;
        document.getElementById('walkinContact').required = false;
    } else {
        existingSection.style.display = 'none';
        walkinSection.style.display = 'block';
        patientSelect.required = false;
        // Make walk-in fields required
        document.getElementById('walkinName').required = true;
        document.getElementById('walkinAge').required = true;
        document.getElementById('walkinContact').required = true;
    }
}

// Update service price display
function updateServicePrice() {
    const select = document.getElementById('appointmentService');
    const priceDisplay = document.getElementById('appointmentPrice');
    
    if (select.value === 'consultation') {
        priceDisplay.textContent = '₱500';
    } else if (select.value) {
        const selectedOption = select.options[select.selectedIndex];
        const price = selectedOption.dataset.price || '₱500';
        priceDisplay.textContent = price.includes('₱') ? price.split(' ')[0] : price;
    } else {
        priceDisplay.textContent = '₱500';
    }
}

// Create appointment modal
function showCreateAppointmentModal() {
    // Populate dropdowns first
    populateDropdowns();
    
    // Reset to existing patient by default
    document.querySelector('input[name="patientType"][value="existing"]').checked = true;
    togglePatientType();
    
    // Set default price
    document.getElementById('appointmentPrice').textContent = '₱500';
    
    document.getElementById('createAppointmentModal').classList.add('active');
}

function closeCreateAppointmentModal() {
    document.getElementById('createAppointmentModal').classList.remove('active');
    document.getElementById('createAppointmentForm').reset();
    
    // Reset to existing patient view
    document.querySelector('input[name="patientType"][value="existing"]').checked = true;
    togglePatientType();
}

// Create appointment form submission
document.getElementById('createAppointmentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const patientType = document.querySelector('input[name="patientType"]:checked').value;
    let patientId;
    let patientName;
    let additionalNotes = document.getElementById('appointmentNotes').value || '';
    
    // Get assigned doctor or auto-assign
    const selectedDoctorId = document.getElementById('appointmentDoctor').value;
    let doctorId;
    
    if (selectedDoctorId) {
        // Use the manually selected doctor
        doctorId = selectedDoctorId;
    } else {
        // Auto-assign first available doctor
        const doctors = Storage.getDoctors();
        const availableDoctor = doctors.find(d => d.available) || doctors[0];
        
        if (!availableDoctor) {
            Utils.showNotification('No dentists available. Please add a dentist first.', 'error');
            return;
        }
        doctorId = availableDoctor.id;
    }
    
    const assignedDoctor = Storage.getDoctorById(doctorId);
    
    // Handle patient type
    if (patientType === 'existing') {
        patientId = document.getElementById('appointmentPatient').value;
        if (!patientId) {
            Utils.showNotification('Please select a patient', 'error');
            return;
        }
        const patient = Storage.getPatientById(patientId);
        patientName = patient ? patient.fullName : 'Unknown';
    } else {
        // Walk-in patient
        const walkinName = document.getElementById('walkinName').value;
        const walkinAge = document.getElementById('walkinAge').value;
        const walkinContact = document.getElementById('walkinContact').value;
        const walkinEmail = document.getElementById('walkinEmail').value;
        
        if (!walkinName || !walkinAge || !walkinContact) {
            Utils.showNotification('Please fill in all walk-in patient information', 'error');
            return;
        }
        
        // Create a temporary patient ID for walk-ins
        patientId = 'walkin_' + Date.now();
        patientName = walkinName;
        
        // Add walk-in info to notes
        additionalNotes = `WALK-IN PATIENT\nName: ${walkinName}\nAge: ${walkinAge}\nContact: ${walkinContact}${walkinEmail ? `\nEmail: ${walkinEmail}` : ''}\n\n${additionalNotes}`;
    }
    
    // Get service info
    const serviceSelect = document.getElementById('appointmentService');
    let serviceId = serviceSelect.value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (!serviceId) {
        Utils.showNotification('Please select a service', 'error');
        return;
    }
    
    // Handle consultation service
    if (serviceId === 'consultation') {
        const services = Storage.getServices();
        const consultService = services.find(s => s.name.toLowerCase().includes('consultation'));
        serviceId = consultService ? consultService.id : services[0]?.id || 'srv001';
    }
    
    const service = Storage.getServiceById(serviceId);
    const serviceName = service ? service.name : 'Consultation';
    
    // Create appointment
    const appointmentData = {
        patientId: patientId,
        doctorId: doctorId,
        serviceId: serviceId,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        notes: `Payment: ${paymentMethod}\n${additionalNotes}`,
        status: 'confirmed',
        createdBy: currentUser.id
    };
    
    Storage.createAppointment(appointmentData);
    
    // Show success message
    const appointmentDate = Utils.formatDate(appointmentData.date);
    const appointmentTime = Utils.formatTime(appointmentData.time);
    
    Utils.showNotification(
        `Appointment created for ${patientName}!\n${serviceName} with ${assignedDoctor.name}\n${appointmentDate} at ${appointmentTime}`,
        'success'
    );
    
    closeCreateAppointmentModal();
    loadStatistics();
    loadAppointments();
    triggerDataSync();
});

// Add schedule modal
function showAddScheduleModal() {
    populateDropdowns(); // Populate the doctor dropdown
    document.getElementById('addScheduleModal').classList.add('active');
}

function showAddScheduleModalForDoctor(doctorId) {
    populateDropdowns();
    document.getElementById('scheduleDoctor').value = doctorId;
    document.getElementById('addScheduleModal').classList.add('active');
}

function closeAddScheduleModal() {
    document.getElementById('addScheduleModal').classList.remove('active');
    document.getElementById('addScheduleForm').reset();
}

// Add schedule form submission
document.getElementById('addScheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const startTime = document.getElementById('scheduleStartTime').value;
    const endTime = document.getElementById('scheduleEndTime').value;
    
    if (startTime >= endTime) {
        Utils.showNotification('End time must be after start time', 'error');
        return;
    }
    
    const scheduleData = {
        doctorId: document.getElementById('scheduleDoctor').value,
        day: document.getElementById('scheduleDay').value,
        startTime: startTime,
        endTime: endTime
    };
    
    Storage.createSchedule(scheduleData);
    Utils.showNotification('Schedule added successfully!', 'success');
    closeAddScheduleModal();
    loadSchedules();
    triggerDataSync();
});

// Edit schedule form submission
document.getElementById('editScheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const scheduleId = document.getElementById('editScheduleId').value;
    const startTime = document.getElementById('editScheduleStartTime').value;
    const endTime = document.getElementById('editScheduleEndTime').value;
    
    if (startTime >= endTime) {
        Utils.showNotification('End time must be after start time', 'error');
        return;
    }
    
    const updates = {
        day: document.getElementById('editScheduleDay').value,
        startTime: startTime,
        endTime: endTime
    };
    
    Storage.updateSchedule(scheduleId, updates);
    Utils.showNotification('Schedule updated successfully!', 'success');
    closeEditScheduleModal();
    loadSchedules();
    triggerDataSync();
});

// Refresh data manually
function refreshData() {
    loadStatistics();
    loadAppointments();
    loadSchedules();
    Utils.showNotification('Data refreshed', 'success');
}

// Create Patient Modal Functions
function showCreatePatientModal() {
    document.getElementById('createPatientModal').classList.add('active');
}

function closeCreatePatientModal() {
    document.getElementById('createPatientModal').classList.remove('active');
    document.getElementById('createPatientForm').reset();
}

// Create patient form submission
document.getElementById('createPatientForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('newPatientUsername').value;
    
    // Check if username already exists
    if (Storage.getUserByUsername(username)) {
        Utils.showNotification('Username already exists. Please choose a different username.', 'error');
        return;
    }
    
    const patientData = {
        fullName: document.getElementById('newPatientName').value,
        username: username,
        email: document.getElementById('newPatientEmail').value,
        phone: document.getElementById('newPatientPhone').value,
        dateOfBirth: document.getElementById('newPatientDOB').value,
        address: document.getElementById('newPatientAddress').value,
        password: document.getElementById('newPatientPassword').value,
        role: 'patient'
    };
    
    // Validate email
    if (!Utils.validateEmail(patientData.email)) {
        Utils.showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Validate phone
    if (!Utils.validatePhone(patientData.phone)) {
        Utils.showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    Storage.createUser(patientData);
    Utils.showNotification(`Patient account created successfully for ${patientData.fullName}!`, 'success');
    closeCreatePatientModal();
    loadStatistics();
    loadStaffPatients();
    populateDropdowns();
    triggerDataSync();
});

// Load and manage clinic schedule
function loadClinicSchedule() {
    const clinicSchedule = Storage.getClinicSchedule();
    const container = document.getElementById('clinicScheduleManager');
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    container.innerHTML = days.map(day => {
        const daySchedule = clinicSchedule[day] || { isOpen: false, startTime: '09:00', endTime: '18:00' };
        
        return `
            <div class="clinic-schedule-card">
                <div class="clinic-schedule-header">
                    <h3>${day}</h3>
                    <label class="toggle-switch">
                        <input type="checkbox" ${daySchedule.isOpen ? 'checked' : ''} 
                               onchange="toggleClinicDay('${day}', this.checked)">
                        <span class="toggle-slider"></span>
                    </label>
                    <span class="toggle-label">${daySchedule.isOpen ? 'Open' : 'Closed'}</span>
                </div>
                ${daySchedule.isOpen ? `
                    <div class="clinic-schedule-times">
                        <div class="time-input-group">
                            <label>Opening Time</label>
                            <input type="time" value="${daySchedule.startTime}" 
                                   onchange="updateClinicTime('${day}', 'startTime', this.value)"
                                   class="form-control">
                        </div>
                        <div class="time-input-group">
                            <label>Closing Time</label>
                            <input type="time" value="${daySchedule.endTime}" 
                                   onchange="updateClinicTime('${day}', 'endTime', this.value)"
                                   class="form-control">
                        </div>
                    </div>
                    <div class="clinic-schedule-summary">
                        ${Utils.formatTime(daySchedule.startTime)} - ${Utils.formatTime(daySchedule.endTime)}
                    </div>
                ` : `
                    <div class="clinic-schedule-closed">Clinic is closed on ${day}s</div>
                `}
            </div>
        `;
    }).join('');
}

function toggleClinicDay(day, isOpen) {
    const clinicSchedule = Storage.getClinicSchedule();
    clinicSchedule[day].isOpen = isOpen;
    Storage.updateClinicSchedule(clinicSchedule);
    Utils.showNotification(`${day} ${isOpen ? 'opened' : 'closed'}`, 'success');
    loadClinicSchedule();
    triggerDataSync();
}

function updateClinicTime(day, timeType, value) {
    const clinicSchedule = Storage.getClinicSchedule();
    clinicSchedule[day][timeType] = value;
    Storage.updateClinicSchedule(clinicSchedule);
    Utils.showNotification(`${day} hours updated`, 'success');
    loadClinicSchedule();
    triggerDataSync();
}

// Load staff patients list
function loadStaffPatients() {
    const patients = Storage.getPatients();
    const container = document.getElementById('staffPatientsList');
    
    if (patients.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">👥</div>
                <p>No patients found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = patients.map(p => {
        const appointments = Storage.getAppointmentsByPatient(p.id);
        const upcomingAppts = Utils.getFutureAppointments(appointments).filter(a => a.status !== 'cancelled');
        
        return `
            <div class="patient-profile-card">
                <div class="patient-card-header">
                    <div class="patient-avatar">👤</div>
                    <div class="patient-header-info">
                        <h3>${p.fullName}</h3>
                        <p class="patient-id">ID: ${p.id}</p>
                    </div>
                    ${upcomingAppts.length > 0 ? `
                        <span class="patient-badge">
                            ${upcomingAppts.length} upcoming
                        </span>
                    ` : ''}
                </div>
                <div class="patient-card-body">
                    <div class="patient-info-grid">
                        <div class="patient-info-item">
                            <span class="info-icon">📧</span>
                            <div class="info-content">
                                <span class="info-label">Email</span>
                                <span class="info-value">${p.email}</span>
                            </div>
                        </div>
                        <div class="patient-info-item">
                            <span class="info-icon">📱</span>
                            <div class="info-content">
                                <span class="info-label">Phone</span>
                                <span class="info-value">${p.phone || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="patient-info-item">
                            <span class="info-icon">🎂</span>
                            <div class="info-content">
                                <span class="info-label">Date of Birth</span>
                                <span class="info-value">${p.dateOfBirth ? Utils.formatDate(p.dateOfBirth) : 'N/A'}</span>
                            </div>
                        </div>
                        <div class="patient-info-item">
                            <span class="info-icon">📍</span>
                            <div class="info-content">
                                <span class="info-label">Address</span>
                                <span class="info-value">${p.address || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="patient-card-actions">
                    <button onclick="viewPatientProfile('${p.id}')" class="btn btn-primary">
                        📋 View Full Profile
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// View all appointments for a patient
function viewPatientAllAppointments(patientId) {
    const patient = Storage.getPatientById(patientId);
    if (!patient) {
        Utils.showNotification('Patient not found', 'error');
        return;
    }
    
    // Open the patient profile modal which shows all appointments
    viewPatientProfile(patientId);
    
    // Auto-scroll to medical history section after modal opens
    setTimeout(() => {
        const medicalSection = document.querySelector('#patientMedicalHistory');
        if (medicalSection) {
            medicalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 300);
}

// View patient profile
function viewPatientProfile(patientId) {
    const patient = Storage.getPatientById(patientId);
    if (!patient) {
        Utils.showNotification('Patient not found', 'error');
        return;
    }
    
    // Set current patient ID
    const currentPatientIdInput = document.getElementById('currentPatientId');
    if (currentPatientIdInput) {
        currentPatientIdInput.value = patientId;
    }
    
    // Update modal title
    const profileTitle = document.getElementById('patientProfileTitle');
    if (profileTitle) {
        profileTitle.textContent = `Patient Profile - ${patient.fullName}`;
    }
    
    // Populate personal information
    const fullNameInput = document.getElementById('patientFullName');
    const emailInput = document.getElementById('patientEmail');
    
    if (fullNameInput) fullNameInput.value = patient.fullName || '';
    if (emailInput) emailInput.value = patient.email || '';
    document.getElementById('patientPhone').value = patient.phone || '';
    document.getElementById('patientDOB').value = patient.dateOfBirth || '';
    document.getElementById('patientAddress').value = patient.address || '';
    
    // Load session images
    loadPatientSessionImages(patientId);
    
    // Load medical history
    loadPatientMedicalHistory(patientId);
    
    // Populate dropdowns for medical history modal
    populateMedicalHistoryDropdowns();
    
    // Show modal
    document.getElementById('patientProfileModal').classList.add('active');
}

function closePatientProfileModal() {
    document.getElementById('patientProfileModal').classList.remove('active');
}

// Update patient information
document.getElementById('patientInfoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const patientId = document.getElementById('currentPatientId').value;
    const updates = {
        fullName: document.getElementById('patientFullName').value,
        email: document.getElementById('patientEmail').value,
        phone: document.getElementById('patientPhone').value,
        dateOfBirth: document.getElementById('patientDOB').value,
        address: document.getElementById('patientAddress').value
    };
    
    Storage.updateUser(patientId, updates);
    Utils.showNotification('Patient profile updated successfully!', 'success');
    loadStaffPatients();
    
    // Update modal title
    document.getElementById('patientProfileTitle').textContent = `Patient Profile - ${updates.fullName}`;
});

// Load patient session images
function loadPatientSessionImages(patientId) {
    const sessionImages = Storage.getSessionImagesByPatient(patientId);
    const container = document.getElementById('patientSessionImages');
    
    if (sessionImages.length === 0) {
        container.innerHTML = `
            <div class="no-data" style="padding: 2rem;">
                <p style="color: var(--text-color);">No treatment photos uploaded yet</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    sessionImages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    container.innerHTML = sessionImages.map(img => `
        <div class="session-image-card">
            <div class="session-image-thumb">
                <img src="${img.imageUrl}" alt="${img.label}" onclick="viewSessionImageFullscreen('${img.id}')">
            </div>
            <div class="session-image-info">
                <h4>${img.sessionTitle || 'Treatment Session'}</h4>
                <p><strong>Date:</strong> ${Utils.formatDate(img.date)}</p>
                <p><strong>Type:</strong> ${img.type}</p>
                <p><strong>Procedure:</strong> ${img.procedure}</p>
                <p><strong>Dentist:</strong> Dr. ${img.dentist}</p>
                ${img.label ? `<p><strong>Label:</strong> ${img.label}</p>` : ''}
                ${img.description ? `<p><strong>Notes:</strong> ${img.description}</p>` : ''}
            </div>
            <div class="session-image-actions">
                <button onclick="deleteSessionImage('${img.id}')" class="btn btn-danger btn-xs">Delete</button>
            </div>
        </div>
    `).join('');
}

// Show upload session image modal
function showUploadSessionImageModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;
    
    // Populate procedure dropdown with services
    const services = Storage.getServices();
    const procedureSelect = document.getElementById('sessionProcedure');
    procedureSelect.innerHTML = '<option value="">Select Procedure</option>' +
        services.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
    
    // Populate dentist dropdown
    const doctors = Storage.getDoctors();
    const dentistSelect = document.getElementById('sessionDentist');
    dentistSelect.innerHTML = '<option value="">Select Dentist</option>' +
        doctors.map(d => `<option value="${d.name}">${d.name} - ${d.specialty}</option>`).join('');
    
    document.getElementById('uploadSessionImageModal').classList.add('active');
}

function closeUploadSessionImageModal() {
    document.getElementById('uploadSessionImageModal').classList.remove('active');
    document.getElementById('uploadSessionImageForm').reset();
}

// Upload session image
document.getElementById('uploadSessionImageForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const patientId = document.getElementById('currentPatientId').value;
    const fileInput = document.getElementById('sessionImageFile');
    const file = fileInput.files[0];
    
    if (!file) {
        Utils.showNotification('Please select an image file', 'error');
        return;
    }
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = function(event) {
        const imageData = {
            patientId: patientId,
            sessionTitle: document.getElementById('sessionTitle').value,
            date: document.getElementById('sessionDate').value,
            procedure: document.getElementById('sessionProcedure').value,
            dentist: document.getElementById('sessionDentist').value,
            type: document.getElementById('sessionPhotoType').value,
            label: document.getElementById('sessionPhotoLabel').value,
            description: document.getElementById('sessionDescription').value,
            imageUrl: event.target.result,
            sessionId: 'sess' + Date.now()
        };
        
        Storage.createSessionImage(imageData);
        Utils.showNotification('Session photo uploaded successfully!', 'success');
        closeUploadSessionImageModal();
        loadPatientSessionImages(patientId);
    };
    
    reader.readAsDataURL(file);
});

// View session image fullscreen
function viewSessionImageFullscreen(imageId) {
    const image = Storage.getSessionImageById(imageId);
    if (!image) return;
    
    // Create a simple fullscreen viewer
    const viewer = document.createElement('div');
    viewer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; cursor: pointer;';
    viewer.innerHTML = `<img src="${image.imageUrl}" style="max-width: 90%; max-height: 90%; object-fit: contain;">`;
    viewer.onclick = () => document.body.removeChild(viewer);
    document.body.appendChild(viewer);
}

// Delete session image
function deleteSessionImage(imageId) {
    if (!Utils.confirm('Are you sure you want to delete this treatment photo?')) {
        return;
    }
    
    const patientId = document.getElementById('currentPatientId').value;
    Storage.deleteSessionImage(imageId);
    Utils.showNotification('Session photo deleted', 'info');
    loadPatientSessionImages(patientId);
}

// Trigger data sync across all dashboards
function triggerDataSync() {
    // Dispatch a custom event that other dashboards can listen to
    window.dispatchEvent(new CustomEvent('clinicDataUpdated', {
        detail: { timestamp: Date.now() }
    }));
    
    // Also update localStorage to trigger storage event in other tabs
    localStorage.setItem('lastDataUpdate', Date.now().toString());
}

// Load patient medical history
function loadPatientMedicalHistory(patientId) {
    const appointments = Storage.getAppointmentsByPatient(patientId);
    const medicalHistory = Storage.getMedicalHistoryByPatient(patientId);
    
    // Combine appointments (completed/past) and manual medical history
    const allRecords = [];
    
    // Add appointments as medical records
    appointments.forEach(apt => {
        if (apt.status === 'completed' || (apt.status === 'confirmed' && new Date(apt.date) < new Date())) {
            const doctor = Storage.getDoctorById(apt.doctorId);
            const service = Storage.getServiceById(apt.serviceId);
            
            allRecords.push({
                id: apt.id,
                type: 'appointment',
                date: apt.date,
                time: apt.time,
                service: service ? service.name : 'N/A',
                doctor: doctor ? doctor.name : 'Unknown',
                specialty: doctor ? doctor.specialty : '',
                treatment: apt.treatment || 'Standard consultation and treatment provided',
                remarks: apt.remarks || 'No additional remarks recorded',
                status: apt.status
            });
        }
    });
    
    // Add manual medical history
    medicalHistory.forEach(record => {
        const doctor = Storage.getDoctorById(record.doctorId);
        const service = Storage.getServiceById(record.serviceId);
        
        allRecords.push({
            id: record.id,
            type: 'manual',
            date: record.date,
            time: record.time,
            service: service ? service.name : record.serviceName || 'N/A',
            doctor: doctor ? doctor.name : record.doctorName || 'Unknown',
            specialty: doctor ? doctor.specialty : '',
            treatment: record.treatment,
            remarks: record.remarks || 'No remarks',
            status: 'completed'
        });
    });
    
    // Sort by date (newest first)
    allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('patientMedicalHistory');
    
    if (allRecords.length === 0) {
        container.innerHTML = `
            <div class="no-data" style="padding: 2rem;">
                <p style="color: var(--text-color);">No medical history records found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = allRecords.map(record => `
        <div class="medical-record-card">
            <div class="medical-record-header">
                <div>
                    <h4>${record.service}</h4>
                    <p style="color: var(--text-color); font-size: 0.9rem;">
                        Dr. ${record.doctor}${record.specialty ? ' - ' + record.specialty : ''}
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: bold;">${Utils.formatDate(record.date)}</p>
                    <p style="color: var(--text-color); font-size: 0.9rem;">${Utils.formatTime(record.time)}</p>
                </div>
            </div>
            <div class="medical-record-body">
                <div style="margin-bottom: 0.5rem;">
                    <strong>Treatment Notes:</strong>
                    <p style="margin: 0.25rem 0; color: var(--text-color);">${record.treatment}</p>
                </div>
                <div>
                    <strong>Remarks:</strong>
                    <p style="margin: 0.25rem 0; color: var(--text-color);">${record.remarks}</p>
                </div>
            </div>
            <div class="medical-record-actions">
                <button onclick="editMedicalHistoryRecord('${record.id}', '${record.type}')" class="btn btn-warning btn-xs">Edit</button>
                ${record.type === 'manual' ? `<button onclick="deleteMedicalHistoryRecord('${record.id}')" class="btn btn-danger btn-xs">Delete</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Populate medical history dropdowns
function populateMedicalHistoryDropdowns() {
    const services = Storage.getServices();
    const doctors = Storage.getDoctors();
    
    const serviceSelect = document.getElementById('medHistoryService');
    const doctorSelect = document.getElementById('medHistoryDoctor');
    
    serviceSelect.innerHTML = '<option value="">Select Service</option>' +
        services.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>' +
        doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('');
}

// Show add medical history modal
function showAddMedicalHistoryModal() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('medHistoryDate').value = today;
    document.getElementById('addMedicalHistoryModal').classList.add('active');
}

function closeAddMedicalHistoryModal() {
    document.getElementById('addMedicalHistoryModal').classList.remove('active');
    document.getElementById('addMedicalHistoryForm').reset();
}

// Add medical history record
document.getElementById('addMedicalHistoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const patientId = document.getElementById('currentPatientId').value;
    const recordData = {
        patientId: patientId,
        serviceId: document.getElementById('medHistoryService').value,
        doctorId: document.getElementById('medHistoryDoctor').value,
        date: document.getElementById('medHistoryDate').value,
        time: document.getElementById('medHistoryTime').value,
        treatment: document.getElementById('medHistoryTreatment').value,
        remarks: document.getElementById('medHistoryRemarks').value
    };
    
    Storage.createMedicalHistory(recordData);
    Utils.showNotification('Medical history record added successfully!', 'success');
    closeAddMedicalHistoryModal();
    loadPatientMedicalHistory(patientId);
});

// Edit medical history record
function editMedicalHistoryRecord(recordId, recordType) {
    let record;
    let doctor, service;
    
    if (recordType === 'appointment') {
        record = Storage.getAppointmentById(recordId);
        doctor = Storage.getDoctorById(record.doctorId);
        service = Storage.getServiceById(record.serviceId);
        
        document.getElementById('editMedHistoryId').value = recordId;
        document.getElementById('editMedHistoryService').value = service ? service.name : 'N/A';
        document.getElementById('editMedHistoryDoctor').value = doctor ? doctor.name : 'Unknown';
        document.getElementById('editMedHistoryDate').value = Utils.formatDate(record.date);
        document.getElementById('editMedHistoryTime').value = Utils.formatTime(record.time);
        document.getElementById('editMedHistoryTreatment').value = record.treatment || 'Standard consultation and treatment provided';
        document.getElementById('editMedHistoryRemarks').value = record.remarks || '';
        
        // Store type for later
        document.getElementById('editMedHistoryId').setAttribute('data-type', 'appointment');
    } else {
        record = Storage.getMedicalHistoryById(recordId);
        doctor = Storage.getDoctorById(record.doctorId);
        service = Storage.getServiceById(record.serviceId);
        
        document.getElementById('editMedHistoryId').value = recordId;
        document.getElementById('editMedHistoryService').value = service ? service.name : 'N/A';
        document.getElementById('editMedHistoryDoctor').value = doctor ? doctor.name : 'Unknown';
        document.getElementById('editMedHistoryDate').value = Utils.formatDate(record.date);
        document.getElementById('editMedHistoryTime').value = Utils.formatTime(record.time);
        document.getElementById('editMedHistoryTreatment').value = record.treatment;
        document.getElementById('editMedHistoryRemarks').value = record.remarks || '';
        
        document.getElementById('editMedHistoryId').setAttribute('data-type', 'manual');
    }
    
    document.getElementById('editMedicalHistoryModal').classList.add('active');
}

function closeEditMedicalHistoryModal() {
    document.getElementById('editMedicalHistoryModal').classList.remove('active');
}

// Update medical history record
document.getElementById('editMedicalHistoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const recordId = document.getElementById('editMedHistoryId').value;
    const recordType = document.getElementById('editMedHistoryId').getAttribute('data-type');
    const patientId = document.getElementById('currentPatientId').value;
    
    const updates = {
        treatment: document.getElementById('editMedHistoryTreatment').value,
        remarks: document.getElementById('editMedHistoryRemarks').value
    };
    
    if (recordType === 'appointment') {
        Storage.updateAppointment(recordId, updates);
    } else {
        Storage.updateMedicalHistory(recordId, updates);
    }
    
    Utils.showNotification('Medical history record updated successfully!', 'success');
    closeEditMedicalHistoryModal();
    loadPatientMedicalHistory(patientId);
});

// Delete medical history record
function deleteMedicalHistoryRecord(recordId) {
    if (!Utils.confirm('Are you sure you want to delete this medical history record?')) {
        return;
    }
    
    const patientId = document.getElementById('currentPatientId').value;
    Storage.deleteMedicalHistory(recordId);
    Utils.showNotification('Medical history record deleted', 'info');
    loadPatientMedicalHistory(patientId);
}


// Admin dashboard functionality

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Require admin authentication
    if (!Auth.requireAuth(['admin'])) {
        return;
    }
    
    currentUser = Auth.getCurrentUser();
    
    // Update UI with user info
    document.getElementById('userName').textContent = `Welcome, ${currentUser.fullName}`;
    
    // Load dashboard data
    loadStatistics();
    loadStaff();
    loadDoctors();
    loadServices();
    loadSchedules();
    loadAppointments();
    
    // Setup tabs
    setupTabs();
    
    // Auto-refresh every 5 seconds to sync with new appointments
    setInterval(() => {
        loadStatistics();
        loadAppointments();
    }, 5000);
    
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
        if (e.key === 'clinicData' || e.key === 'lastDataUpdate') {
            loadStatistics();
            loadStaff();
            loadDoctors();
            loadServices();
            loadSchedules();
            loadAppointments();
            loadPatients();
            loadPromos();
        }
    });
    
    // Listen for custom data update events (same-tab sync)
    window.addEventListener('clinicDataUpdated', () => {
        loadStatistics();
        loadAppointments();
        loadPatients();
    });
});

// Setup tabs
function setupTabs() {
    console.log('Setting up tabs...');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('Found tab buttons:', tabButtons.length);
    console.log('Found tab contents:', tabContents.length);
    
    if (tabButtons.length === 0) {
        console.error('No tab buttons found! Check HTML structure.');
        return;
    }
    
    tabButtons.forEach((btn, index) => {
        console.log(`Setting up tab ${index}:`, btn.dataset.tab);
        
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tab clicked:', btn.dataset.tab);
            
            // Remove active class from all
            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab + 'Tab';
            const tabElement = document.getElementById(tabId);
            
            console.log('Looking for tab element:', tabId);
            
            if (tabElement) {
                tabElement.classList.add('active');
                console.log('Tab element activated:', tabId);
                
                // Reload data when switching tabs
                const tabName = btn.dataset.tab;
                console.log('Loading data for:', tabName);
                
                switch(tabName) {
                    case 'staff':
                        loadStaff();
                        break;
                    case 'doctors':
                        loadDoctors();
                        break;
                    case 'services':
                        loadServices();
                        break;
                    case 'schedules':
                        loadSchedules();
                        break;
                    case 'appointments':
                        loadAppointments();
                        break;
                    case 'patients':
                        loadPatients();
                        break;
                    default:
                        console.warn('Unknown tab:', tabName);
                }
            } else {
                console.error('Tab element not found:', tabId);
            }
        });
    });
    
    console.log('Tab setup complete!');
}

// Load statistics
function loadStatistics() {
    const appointments = Storage.getAppointments();
    const patients = Storage.getPatients();
    const doctors = Storage.getDoctors();
    const services = Storage.getServices();
    
    document.getElementById('totalAppointments').textContent = appointments.length;
    document.getElementById('totalPatients').textContent = patients.length;
    document.getElementById('totalDoctors').textContent = doctors.length;
    document.getElementById('totalServices').textContent = services.length;
}

// Load staff
function loadStaff() {
    const data = Storage.getData();
    const staff = data.users.filter(u => u.role === 'staff');
    
    const container = document.getElementById('staffList');
    
    if (staff.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">👥</div>
                <p>No staff accounts found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = staff.map(s => `
        <div class="data-card">
            <div class="data-info">
                <h3>${s.fullName}</h3>
                <div class="data-details">
                    <div class="data-detail-item">
                        <span class="data-detail-label">Username:</span>
                        <span>${s.username}</span>
                    </div>
                    <div class="data-detail-item">
                        <span class="data-detail-label">Email:</span>
                        <span>${s.email}</span>
                    </div>
                </div>
            </div>
            <div class="data-actions">
                <button onclick="deleteStaff('${s.id}')" class="btn btn-danger btn-xs">Delete</button>
            </div>
        </div>
    `).join('');
}

// Load doctors
function loadDoctors() {
    try {
        const doctors = Storage.getDoctors();
        const container = document.getElementById('doctorsList');
        
        if (!container) {
            console.error('doctorsList container not found');
            return;
        }
        
        console.log('Loading doctors:', doctors.length);
        
        if (doctors.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">🦷</div>
                    <p>No dentists found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = doctors.map(d => `
            <div class="data-card">
                <div class="data-info">
                    <h3>${d.name}</h3>
                    <div class="data-details">
                        <div class="data-detail-item">
                            <span class="data-detail-label">Specialty:</span>
                            <span>${d.specialty}</span>
                        </div>
                        <div class="data-detail-item">
                            <span class="data-detail-label">Status:</span>
                            <span class="badge ${d.available ? 'badge-success' : 'badge-danger'}">
                                ${d.available ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="data-actions">
                    <button onclick="toggleDoctorAvailability('${d.id}')" class="btn btn-warning btn-xs">
                        Toggle Availability
                    </button>
                    <button onclick="deleteDoctor('${d.id}')" class="btn btn-danger btn-xs">Delete</button>
                </div>
            </div>
        `).join('');
        console.log('Doctors loaded successfully');
    } catch (error) {
        console.error('Error loading doctors:', error);
    }
}

// Load services
function loadServices() {
    try {
        const services = Storage.getServices();
        const container = document.getElementById('servicesList');
        
        if (!container) {
            console.error('servicesList container not found');
            return;
        }
        
        console.log('Loading services:', services.length);
        
        if (services.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <div class="no-data-icon">💼</div>
                    <p>No services found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = services.map(s => `
            <div class="data-card">
                <div class="data-info">
                    <h3>${s.name}</h3>
                    <div class="data-details">
                        <div class="data-detail-item">
                            <span class="data-detail-label">Duration:</span>
                            <span>${s.duration}</span>
                        </div>
                        <div class="data-detail-item">
                            <span class="data-detail-label">Price:</span>
                            <span>${s.price}</span>
                        </div>
                    </div>
                    <p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-color);">${s.description}</p>
                </div>
                <div class="data-actions">
                    <button onclick="editService('${s.id}')" class="btn btn-warning btn-xs">Edit</button>
                    <button onclick="deleteService('${s.id}')" class="btn btn-danger btn-xs">Delete</button>
                </div>
            </div>
        `).join('');
        console.log('Services loaded successfully');
    } catch (error) {
        console.error('Error loading services:', error);
    }
}

// Load schedules
function loadSchedules() {
    try {
        const doctors = Storage.getDoctors();
        const container = document.getElementById('schedulesList');
        
        if (!container) {
            console.error('schedulesList container not found');
            return;
        }
        
        console.log('Loading schedules for', doctors.length, 'doctors');
        
        container.innerHTML = doctors.map(doctor => {
            const schedules = Storage.getSchedulesByDoctor(doctor.id);
            
            return `
                <div class="schedule-group">
                    <div class="schedule-group-header">
                        <div class="schedule-doctor-name">${doctor.name} - ${doctor.specialty}</div>
                    </div>
                    <div class="schedule-items">
                        ${schedules.length > 0 ? schedules.map(sch => `
                            <div class="schedule-item">
                                <div class="schedule-day">${sch.day}</div>
                                <div class="schedule-time">${Utils.formatTime(sch.startTime)} - ${Utils.formatTime(sch.endTime)}</div>
                                <button onclick="deleteSchedule('${sch.id}')" class="btn btn-danger btn-xs">Delete</button>
                            </div>
                        `).join('') : '<p style="color: var(--text-color);">No schedules set</p>'}
                    </div>
                </div>
            `;
        }).join('');
        console.log('Schedules loaded successfully');
    } catch (error) {
        console.error('Error loading schedules:', error);
    }
}

// Filter state for appointments
let appointmentFilter = 'all';

// Load appointments with filtering and sorting
function loadAppointments() {
    try {
        let appointments = Storage.getAppointments();
        const container = document.getElementById('appointmentsList');
        
        if (!container) {
            console.error('appointmentsList container not found');
            return;
        }
        
        // Apply filters
        if (appointmentFilter !== 'all') {
            if (appointmentFilter === 'today') {
                const today = new Date().toDateString();
                appointments = appointments.filter(apt => 
                    new Date(apt.date).toDateString() === today
                );
            } else {
                appointments = appointments.filter(apt => apt.status === appointmentFilter);
            }
        }
        
        // Sort appointments
        appointments = Utils.sortAppointments(appointments);
        
        console.log('Loading appointments:', appointments.length);
        
        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="filter-buttons" style="margin-bottom: 1rem;">
                    <button class="filter-btn ${appointmentFilter === 'all' ? 'active' : ''}" onclick="filterAppointments('all')">All</button>
                    <button class="filter-btn ${appointmentFilter === 'pending' ? 'active' : ''}" onclick="filterAppointments('pending')">Pending</button>
                    <button class="filter-btn ${appointmentFilter === 'confirmed' ? 'active' : ''}" onclick="filterAppointments('confirmed')">Confirmed</button>
                    <button class="filter-btn ${appointmentFilter === 'completed' ? 'active' : ''}" onclick="filterAppointments('completed')">Completed</button>
                    <button class="filter-btn ${appointmentFilter === 'today' ? 'active' : ''}" onclick="filterAppointments('today')">Today</button>
                </div>
                <div class="no-data">
                    <div class="no-data-icon">📅</div>
                    <p>No appointments found</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div class="filter-buttons" style="margin-bottom: 1rem;">
                <button class="filter-btn ${appointmentFilter === 'all' ? 'active' : ''}" onclick="filterAppointments('all')">All</button>
                <button class="filter-btn ${appointmentFilter === 'pending' ? 'active' : ''}" onclick="filterAppointments('pending')">Pending</button>
                <button class="filter-btn ${appointmentFilter === 'confirmed' ? 'active' : ''}" onclick="filterAppointments('confirmed')">Confirmed</button>
                <button class="filter-btn ${appointmentFilter === 'completed' ? 'active' : ''}" onclick="filterAppointments('completed')">Completed</button>
                <button class="filter-btn ${appointmentFilter === 'today' ? 'active' : ''}" onclick="filterAppointments('today')">Today</button>
            </div>
            <div class="appointment-row appointment-row-header">
                <div>Patient</div>
                <div>Service</div>
                <div>Doctor</div>
                <div>Date & Time</div>
                <div>Status</div>
                <div>Actions</div>
            </div>
        ` + appointments.map(apt => {
            const patient = Storage.getPatientById(apt.patientId);
            const doctor = Storage.getDoctorById(apt.doctorId);
            const service = Storage.getServiceById(apt.serviceId);
            
            // Check if this is a walk-in patient
            const isWalkin = apt.patientId && apt.patientId.startsWith('walkin_');
            const patientName = isWalkin ? 
                (apt.notes && apt.notes.includes('WALK-IN PATIENT') ? 
                    apt.notes.split('\n')[1].replace('Name: ', '') : 
                    'Walk-in Patient') :
                (patient ? patient.fullName : 'Unknown');
            
            return `
                <div class="appointment-row">
                    <div>
                        ${patientName}
                        ${isWalkin ? '<span class="badge badge-info" style="margin-left: 0.5rem; font-size: 0.7rem;">WALK-IN</span>' : ''}
                    </div>
                    <div>${service ? service.name : 'N/A'}</div>
                    <div>${doctor ? doctor.name : 'Unknown'}</div>
                    <div>
                        <div>${Utils.formatDate(apt.date)}</div>
                        <div style="font-size: 0.85rem; color: var(--text-color);">${Utils.formatTime(apt.time)}</div>
                    </div>
                    <div>
                        <span class="badge ${Utils.getStatusBadgeClass(apt.status)}">${apt.status.toUpperCase()}</span>
                    </div>
                    <div>
                        <button onclick="editAppointmentStatus('${apt.id}')" class="btn btn-warning btn-xs" title="Change Status">📝</button>
                        <button onclick="viewAppointmentDetails('${apt.id}')" class="btn btn-primary btn-xs" title="View Details">👁️</button>
                        <button onclick="deleteAppointment('${apt.id}')" class="btn btn-danger btn-xs" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        }).join('');
        console.log('Appointments loaded successfully');
    } catch (error) {
        console.error('Error loading appointments:', error);
    }
}

// Filter appointments
function filterAppointments(filter) {
    appointmentFilter = filter;
    loadAppointments();
}

// Edit appointment status
function editAppointmentStatus(appointmentId) {
    const appointment = Storage.getAppointmentById(appointmentId);
    if (!appointment) {
        Utils.showNotification('Appointment not found', 'error');
        return;
    }
    
    const newStatus = prompt('Enter new status (pending/confirmed/completed/cancelled):', appointment.status);
    if (newStatus && ['pending', 'confirmed', 'completed', 'cancelled'].includes(newStatus.toLowerCase())) {
        Storage.updateAppointment(appointmentId, { status: newStatus.toLowerCase() });
        Utils.showNotification('Appointment status updated', 'success');
        loadAppointments();
        loadStatistics();
        triggerDataSync();
    } else if (newStatus) {
        Utils.showNotification('Invalid status. Use: pending, confirmed, completed, or cancelled', 'error');
    }
}

// View appointment details
function viewAppointmentDetails(appointmentId) {
    const appointment = Storage.getAppointmentById(appointmentId);
    if (!appointment) {
        Utils.showNotification('Appointment not found', 'error');
        return;
    }
    
    const patient = Storage.getPatientById(appointment.patientId);
    const doctor = Storage.getDoctorById(appointment.doctorId);
    const service = Storage.getServiceById(appointment.serviceId);
    
    const isWalkin = appointment.patientId && appointment.patientId.startsWith('walkin_');
    
    let details = `📅 APPOINTMENT DETAILS\n\n`;
    details += `Patient: ${isWalkin ? 'Walk-in Patient' : (patient ? patient.fullName : 'Unknown')}\n`;
    details += `Service: ${service ? service.name : 'N/A'}\n`;
    details += `Doctor: ${doctor ? doctor.name : 'Unknown'}\n`;
    details += `Date: ${Utils.formatDate(appointment.date)}\n`;
    details += `Time: ${Utils.formatTime(appointment.time)}\n`;
    details += `Status: ${appointment.status.toUpperCase()}\n`;
    if (appointment.notes) {
        details += `\nNotes:\n${appointment.notes}`;
    }
    
    alert(details);
}

// Delete appointment
function deleteAppointment(appointmentId) {
    if (!Utils.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
        return;
    }
    
    Storage.deleteAppointment(appointmentId);
    Utils.showNotification('Appointment deleted successfully', 'info');
    loadAppointments();
    loadStatistics();
    triggerDataSync();
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

// Create staff modal
function showCreateStaffModal() {
    document.getElementById('createStaffModal').classList.add('active');
}

function closeCreateStaffModal() {
    document.getElementById('createStaffModal').classList.remove('active');
    document.getElementById('createStaffForm').reset();
}

document.getElementById('createStaffForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const staffData = {
        fullName: document.getElementById('staffName').value,
        username: document.getElementById('staffUsername').value,
        email: document.getElementById('staffEmail').value,
        password: document.getElementById('staffPassword').value,
        role: 'staff'
    };
    
    const existing = Storage.getUserByUsername(staffData.username);
    if (existing) {
        Utils.showNotification('Username already exists', 'error');
        return;
    }
    
    Storage.createUser(staffData);
    Utils.showNotification('Staff account created successfully!', 'success');
    closeCreateStaffModal();
    loadStaff();
});

// Delete staff
function deleteStaff(staffId) {
    if (!Utils.confirm('Are you sure you want to delete this staff account?')) {
        return;
    }
    
    Storage.deleteUser(staffId);
    Utils.showNotification('Staff account deleted', 'info');
    loadStaff();
}

// Create doctor modal
function showCreateDoctorModal() {
    document.getElementById('createDoctorModal').classList.add('active');
}

function closeCreateDoctorModal() {
    document.getElementById('createDoctorModal').classList.remove('active');
    document.getElementById('createDoctorForm').reset();
}

document.getElementById('createDoctorForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const doctorData = {
        name: document.getElementById('doctorName').value,
        specialty: document.getElementById('doctorSpecialty').value,
        available: document.getElementById('doctorAvailable').value === 'true'
    };
    
    Storage.createDoctor(doctorData);
    Utils.showNotification('Dentist added successfully!', 'success');
    closeCreateDoctorModal();
    loadDoctors();
    triggerDataSync();
    loadSchedules();
    populateScheduleDoctors();
});

// Toggle doctor availability
function toggleDoctorAvailability(doctorId) {
    const doctor = Storage.getDoctorById(doctorId);
    Storage.updateDoctor(doctorId, { available: !doctor.available });
    Utils.showNotification('Dentist availability updated', 'success');
    loadDoctors();
    triggerDataSync();
}

// Delete doctor
function deleteDoctor(doctorId) {
    if (!Utils.confirm('Are you sure you want to delete this dentist? This will also remove their schedules.')) {
        return;
    }
    
    Storage.deleteDoctor(doctorId);
    // Delete associated schedules
    const schedules = Storage.getSchedulesByDoctor(doctorId);
    schedules.forEach(sch => Storage.deleteSchedule(sch.id));
    
    Utils.showNotification('Dentist deleted', 'info');
    loadDoctors();
    triggerDataSync();
    loadSchedules();
    populateScheduleDoctors();
}

// Create service modal
function showCreateServiceModal() {
    document.getElementById('createServiceModal').classList.add('active');
}

function closeCreateServiceModal() {
    document.getElementById('createServiceModal').classList.remove('active');
    document.getElementById('createServiceForm').reset();
}

document.getElementById('createServiceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const serviceData = {
        name: document.getElementById('serviceName').value,
        description: document.getElementById('serviceDescription').value,
        duration: document.getElementById('serviceDuration').value,
        price: document.getElementById('servicePrice').value
    };
    
    Storage.createService(serviceData);
    Utils.showNotification('Service added successfully!', 'success');
    closeCreateServiceModal();
    loadServices();
    triggerDataSync();
    loadStatistics();
});

// Edit service
function editService(serviceId) {
    const service = Storage.getServiceById(serviceId);
    const newName = prompt('Enter service name:', service.name);
    if (!newName) return;
    
    const newDescription = prompt('Enter description:', service.description);
    if (!newDescription) return;
    
    const newDuration = prompt('Enter duration:', service.duration);
    if (!newDuration) return;
    
    const newPrice = prompt('Enter price:', service.price);
    if (!newPrice) return;
    
    Storage.updateService(serviceId, {
        name: newName,
        description: newDescription,
        duration: newDuration,
        price: newPrice
    });
    
    Utils.showNotification('Service updated successfully!', 'success');
    loadServices();
}

// Delete service
function deleteService(serviceId) {
    if (!Utils.confirm('Are you sure you want to delete this service?')) {
        return;
    }
    
    Storage.deleteService(serviceId);
    Utils.showNotification('Service deleted', 'info');
    loadServices();
    triggerDataSync();
    loadStatistics();
}

// Create schedule modal
function showCreateScheduleModal() {
    populateScheduleDoctors();
    document.getElementById('createScheduleModal').classList.add('active');
}

function closeCreateScheduleModal() {
    document.getElementById('createScheduleModal').classList.remove('active');
    document.getElementById('createScheduleForm').reset();
}

function populateScheduleDoctors() {
    const doctors = Storage.getDoctors();
    const select = document.getElementById('scheduleDoctor');
    select.innerHTML = '<option value="">Select Doctor</option>' +
        doctors.map(d => `<option value="${d.id}">${d.name} - ${d.specialty}</option>`).join('');
}

document.getElementById('createScheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const scheduleData = {
        doctorId: document.getElementById('scheduleDoctor').value,
        day: document.getElementById('scheduleDay').value,
        startTime: document.getElementById('scheduleStartTime').value,
        endTime: document.getElementById('scheduleEndTime').value
    };
    
    Storage.createSchedule(scheduleData);
    Utils.showNotification('Schedule added successfully!', 'success');
    closeCreateScheduleModal();
    loadSchedules();
    triggerDataSync();
});

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

// Refresh all data manually
function refreshAllData() {
    loadStatistics();
    loadStaff();
    loadDoctors();
    loadServices();
    loadSchedules();
    loadAppointments();
    Utils.showNotification('All data refreshed', 'success');
}

// Manual tab switching function (backup for inline onclick)
function switchTab(tabName) {
    console.log('Manual switch to tab:', tabName);
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Remove active class from all
    tabButtons.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    // Find and activate the clicked button
    const clickedButton = document.querySelector(`[data-tab="${tabName}"]`);
    if (clickedButton) {
        clickedButton.classList.add('active');
    }
    
    // Activate the tab content
    const tabId = tabName + 'Tab';
    const tabElement = document.getElementById(tabId);
    
    if (tabElement) {
        tabElement.classList.add('active');
        
        // Load data for the tab
        switch(tabName) {
            case 'staff':
                loadStaff();
                break;
            case 'doctors':
                loadDoctors();
                break;
            case 'services':
                loadServices();
                break;
            case 'promos':
                loadPromos();
                break;
            case 'schedules':
                loadSchedules();
                break;
            case 'appointments':
                loadAppointments();
                break;
            case 'patients':
                loadPatients();
                break;
        }
        
        Utils.showNotification(`Switched to ${tabName} tab`, 'info');
    } else {
        console.error('Tab element not found:', tabId);
    }
}

// Promo Management Functions
function loadPromos() {
    const promos = Storage.getPromos();
    const container = document.getElementById('promosList');
    
    if (promos.length === 0) {
        container.innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">🎉</div>
                <p>No promotions found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = promos.map(promo => `
        <div class="data-card">
            <div class="data-info">
                <h3>${promo.title}</h3>
                <div class="data-details">
                    <div class="data-detail-item">
                        <span class="data-detail-label">Discount:</span>
                        <span>${promo.discount}</span>
                    </div>
                    <div class="data-detail-item">
                        <span class="data-detail-label">Price:</span>
                        <span>${promo.promoPrice || promo.price}</span>
                    </div>
                    ${promo.validUntil ? `
                        <div class="data-detail-item">
                            <span class="data-detail-label">Valid Until:</span>
                            <span>${Utils.formatDate(promo.validUntil)}</span>
                        </div>
                    ` : ''}
                    <div class="data-detail-item" style="grid-column: 1 / -1;">
                        <span class="data-detail-label">Description:</span>
                        <span>${promo.description}</span>
                    </div>
                </div>
            </div>
            <div class="data-actions">
                <button onclick="editPromo('${promo.id}')" class="btn btn-warning btn-xs">Edit</button>
                <button onclick="deletePromo('${promo.id}')" class="btn btn-danger btn-xs">Delete</button>
            </div>
        </div>
    `).join('');
}

function showCreatePromoModal() {
    document.getElementById('createPromoModal').classList.add('active');
}

function closeCreatePromoModal() {
    document.getElementById('createPromoModal').classList.remove('active');
    document.getElementById('createPromoForm').reset();
}

document.getElementById('createPromoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const promoData = {
        title: document.getElementById('promoTitle').value,
        description: document.getElementById('promoDescription').value,
        discount: document.getElementById('promoDiscount').value,
        validUntil: document.getElementById('promoValidUntil').value,
        originalPrice: document.getElementById('promoOriginalPrice').value,
        promoPrice: document.getElementById('promoPrice').value
    };
    
    Storage.createPromo(promoData);
    Utils.showNotification('Promotion created successfully!', 'success');
    closeCreatePromoModal();
    loadPromos();
    triggerDataSync();
});

function editPromo(promoId) {
    const promo = Storage.getPromoById(promoId);
    if (!promo) {
        Utils.showNotification('Promotion not found', 'error');
        return;
    }
    
    document.getElementById('editPromoId').value = promo.id;
    document.getElementById('editPromoTitle').value = promo.title;
    document.getElementById('editPromoDescription').value = promo.description;
    document.getElementById('editPromoDiscount').value = promo.discount || '';
    document.getElementById('editPromoValidUntil').value = promo.validUntil || '';
    document.getElementById('editPromoOriginalPrice').value = promo.originalPrice || '';
    document.getElementById('editPromoPrice').value = promo.promoPrice || promo.price || '';
    
    document.getElementById('editPromoModal').classList.add('active');
}

function closeEditPromoModal() {
    document.getElementById('editPromoModal').classList.remove('active');
    document.getElementById('editPromoForm').reset();
}

document.getElementById('editPromoForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const promoId = document.getElementById('editPromoId').value;
    const updates = {
        title: document.getElementById('editPromoTitle').value,
        description: document.getElementById('editPromoDescription').value,
        discount: document.getElementById('editPromoDiscount').value,
        validUntil: document.getElementById('editPromoValidUntil').value,
        originalPrice: document.getElementById('editPromoOriginalPrice').value,
        promoPrice: document.getElementById('editPromoPrice').value
    };
    
    Storage.updatePromo(promoId, updates);
    Utils.showNotification('Promotion updated successfully!', 'success');
    closeEditPromoModal();
    loadPromos();
    triggerDataSync();
});

function deletePromo(promoId) {
    if (!Utils.confirm('Are you sure you want to delete this promotion?')) {
        return;
    }
    
    Storage.deletePromo(promoId);
    Utils.showNotification('Promotion deleted', 'info');
    loadPromos();
    triggerDataSync();
}

// Load patients list
function loadPatients() {
    const patients = Storage.getPatients();
    const container = document.getElementById('patientsList');
    
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
function viewAllPatientAppointments(patientId) {
    const patient = Storage.getPatientById(patientId);
    if (!patient) {
        Utils.showNotification('Patient not found', 'error');
        return;
    }
    
    // Just open the patient profile modal which shows all appointments
    viewPatientProfile(patientId);
}

// View patient profile
function viewPatientProfile(patientId) {
    const patient = Storage.getPatientById(patientId);
    if (!patient) {
        Utils.showNotification('Patient not found', 'error');
        return;
    }
    
    // Set current patient ID
    document.getElementById('currentPatientId').value = patientId;
    
    // Update modal title
    document.getElementById('patientProfileTitle').textContent = `Patient Profile - ${patient.fullName}`;
    
    // Populate personal information
    document.getElementById('patientFullName').value = patient.fullName;
    document.getElementById('patientEmail').value = patient.email;
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
    loadPatients();
    
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


// Patient dashboard functionality

let currentUser = null;

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Require patient authentication
    if (!Auth.requireAuth(['patient'])) {
        return;
    }
    
    currentUser = Auth.getCurrentUser();
    
    // Update UI with user info
    document.getElementById('userName').textContent = `Welcome, ${currentUser.fullName}`;
    
    // Load dashboard data
    loadUpcomingAppointments();
    loadAppointmentHistory();
    loadProfile();
    loadSessionImages();
    loadPatientChart();
    
    // Auto-refresh every 5 seconds to sync with appointment updates
    setInterval(() => {
        loadUpcomingAppointments();
        loadAppointmentHistory();
    }, 5000);
    
    // Listen for storage changes (multi-tab sync)
    window.addEventListener('storage', (e) => {
        if (e.key === 'clinicData' || e.key === 'lastDataUpdate') {
            // Reload current user data first
            const updatedUser = Storage.getUserById(currentUser.id);
            if (updatedUser) {
                currentUser = updatedUser;
                Storage.setCurrentUser(currentUser);
            }
            
            loadUpcomingAppointments();
            loadAppointmentHistory();
            loadSessionImages();
            loadPatientChart();
            loadProfile();
        }
    });
    
    // Listen for custom data update events (same-tab sync)
    window.addEventListener('clinicDataUpdated', () => {
        // Reload current user data first
        const updatedUser = Storage.getUserById(currentUser.id);
        if (updatedUser) {
            currentUser = updatedUser;
            Storage.setCurrentUser(currentUser);
        }
        
        loadUpcomingAppointments();
        loadAppointmentHistory();
        loadSessionImages();
        loadPatientChart();
    });
    
    // Auto-refresh session images and chart every 10 seconds when in profile section
    setInterval(() => {
        const profileSection = document.getElementById('profileSection');
        if (profileSection && profileSection.style.display !== 'none') {
            loadSessionImages();
            loadPatientChart();
        }
    }, 10000);
});

// Show/hide sections
function showSection(sectionName) {
    const sections = {
        upcoming: document.getElementById('upcomingSection'),
        history: document.getElementById('historySection'),
        profile: document.getElementById('profileSection')
    };
    
    // Don't hide upcoming and history by default - only hide profile
    if (sectionName === 'profile') {
        // Hide upcoming and history, show profile
        sections.upcoming.style.display = 'none';
        sections.history.style.display = 'none';
        sections.profile.style.display = 'block';
        sections.profile.scrollIntoView({ behavior: 'smooth' });
    } else {
        // For upcoming and history, just scroll to them
        sections.upcoming.style.display = 'block';
        sections.history.style.display = 'block';
        sections.profile.style.display = 'none';
        
        if (sections[sectionName]) {
            sections[sectionName].scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Load upcoming appointments
function loadUpcomingAppointments() {
    const appointments = Storage.getAppointmentsByPatient(currentUser.id);
    const futureAppointments = Utils.getFutureAppointments(appointments)
        .filter(apt => apt.status !== 'cancelled');
    
    const container = document.getElementById('upcomingAppointments');
    
    if (futureAppointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <div class="no-appointments-icon">📅</div>
                <p>No upcoming appointments</p>
                <a href="../book/book.html" class="btn btn-primary mt-2">Book an Appointment</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = futureAppointments.map(apt => {
        const doctor = Storage.getDoctorById(apt.doctorId);
        const service = Storage.getServiceById(apt.serviceId);
        
        return `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h3>${doctor ? doctor.name : 'Unknown Dentist'}</h3>
                    <div class="appointment-details">
                        <div class="detail-item">
                            <span class="detail-icon">📅</span>
                            <span>${Utils.formatDate(apt.date)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🕐</span>
                            <span>${Utils.formatTime(apt.time)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">💼</span>
                            <span>${service ? service.name : 'N/A'}</span>
                        </div>
                    </div>
                    <span class="badge ${Utils.getStatusBadgeClass(apt.status)}">${apt.status.toUpperCase()}</span>
                </div>
                <div class="appointment-actions">
                    <button onclick="openRescheduleModal('${apt.id}')" class="btn btn-warning btn-small">Reschedule</button>
                    <button onclick="cancelAppointment('${apt.id}')" class="btn btn-danger btn-small">Cancel</button>
                </div>
            </div>
        `;
    }).join('');
}

// Load appointment history
function loadAppointmentHistory() {
    const appointments = Storage.getAppointmentsByPatient(currentUser.id);
    const pastAppointments = Utils.getPastAppointments(appointments);
    
    const container = document.getElementById('appointmentHistory');
    
    if (pastAppointments.length === 0) {
        container.innerHTML = `
            <div class="no-appointments">
                <div class="no-appointments-icon">📋</div>
                <p>No appointment history</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pastAppointments.map(apt => {
        const doctor = Storage.getDoctorById(apt.doctorId);
        const service = Storage.getServiceById(apt.serviceId);
        
        return `
            <div class="appointment-card">
                <div class="appointment-info">
                    <h3>${doctor ? doctor.name : 'Unknown Dentist'}</h3>
                    <div class="appointment-details">
                        <div class="detail-item">
                            <span class="detail-icon">📅</span>
                            <span>${Utils.formatDate(apt.date)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">🕐</span>
                            <span>${Utils.formatTime(apt.time)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon">💼</span>
                            <span>${service ? service.name : 'N/A'}</span>
                        </div>
                    </div>
                    <span class="badge ${Utils.getStatusBadgeClass(apt.status)}">${apt.status.toUpperCase()}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Load profile
function loadProfile() {
    // Refresh current user data from storage
    const latestUser = Storage.getUserById(currentUser.id);
    if (latestUser) {
        currentUser = latestUser;
    }
    
    document.getElementById('profileName').value = currentUser.fullName || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileDOB').value = currentUser.dateOfBirth || '';
    document.getElementById('profileAddress').value = currentUser.address || '';
}

// Load session images (treatment documentation uploaded by staff/admin)
function loadSessionImages() {
    // Get session images for this patient from localStorage
    const sessionImages = Storage.getSessionImagesByPatient(currentUser.id) || [];
    
    const gallery = document.getElementById('sessionImagesGallery');
    const emptyMessage = document.getElementById('emptySessionImages');
    const imageCount = document.getElementById('sessionImageCount');
    
    // Update count
    imageCount.textContent = `${sessionImages.length} Image${sessionImages.length !== 1 ? 's' : ''}`;
    
    if (sessionImages.length === 0) {
        gallery.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    // Show gallery
    emptyMessage.style.display = 'none';
    gallery.style.display = 'block';
    
    // Sort by date (newest first)
    sessionImages.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Group images by session
    const sessionGroups = {};
    sessionImages.forEach(img => {
        const sessionKey = `${img.sessionId || img.date}`;
        if (!sessionGroups[sessionKey]) {
            sessionGroups[sessionKey] = {
                date: img.date,
                sessionTitle: img.sessionTitle || 'Treatment Session',
                procedure: img.procedure || 'Dental Procedure',
                dentist: img.dentist || 'Staff',
                images: []
            };
        }
        sessionGroups[sessionKey].images.push(img);
    });
    
    // Render session groups
    gallery.innerHTML = Object.values(sessionGroups).map(session => `
        <div class="session-image-item">
            <div class="session-image-header">
                <div class="session-image-title">
                    <h4>📋 ${session.sessionTitle}</h4>
                    <span class="session-date-badge">📅 ${Utils.formatDate(session.date)}</span>
                </div>
            </div>
            
            <div class="session-image-grid">
                ${session.images.map((img, index) => `
                    <div class="session-photo-container" onclick="openImageViewer('${img.id}')">
                        <div class="session-photo-wrapper">
                            <img src="${img.imageUrl}" alt="${img.label}" class="session-photo">
                            <div class="photo-overlay">
                                <span class="photo-label">${img.label || 'Treatment Photo'}</span>
                            </div>
                        </div>
                        <span class="photo-type-badge">${img.type || 'Before'}</span>
                    </div>
                `).join('')}
            </div>
            
            ${session.images[0].description ? `
                <div class="session-image-description">
                    <span class="description-label">📝 Notes:</span>
                    <p class="description-text">${session.images[0].description}</p>
                </div>
            ` : ''}
            
            <div class="session-meta-info">
                <div class="meta-item">
                    <span class="meta-label">Procedure</span>
                    <span class="meta-value">${session.procedure}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Dentist</span>
                    <span class="meta-value">Dr. ${session.dentist}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Photos</span>
                    <span class="meta-value">${session.images.length} image${session.images.length !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Open image viewer modal
function openImageViewer(imageId) {
    const sessionImages = Storage.getSessionImagesByPatient(currentUser.id) || [];
    const image = sessionImages.find(img => img.id === imageId);
    
    if (!image) return;
    
    document.getElementById('imageViewerTitle').textContent = image.sessionTitle || 'Treatment Session Photo';
    document.getElementById('viewerImage').src = image.imageUrl;
    
    document.getElementById('imageViewerDetails').innerHTML = `
        <div class="viewer-detail-row">
            <span class="viewer-detail-label">Photo Type:</span>
            <span class="viewer-detail-value">${image.type || 'Treatment'}</span>
        </div>
        <div class="viewer-detail-row">
            <span class="viewer-detail-label">Label:</span>
            <span class="viewer-detail-value">${image.label || 'N/A'}</span>
        </div>
        <div class="viewer-detail-row">
            <span class="viewer-detail-label">Date:</span>
            <span class="viewer-detail-value">${Utils.formatDate(image.date)}</span>
        </div>
        <div class="viewer-detail-row">
            <span class="viewer-detail-label">Procedure:</span>
            <span class="viewer-detail-value">${image.procedure || 'N/A'}</span>
        </div>
        <div class="viewer-detail-row">
            <span class="viewer-detail-label">Dentist:</span>
            <span class="viewer-detail-value">Dr. ${image.dentist || 'Staff'}</span>
        </div>
        ${image.description ? `
            <div class="viewer-detail-row">
                <span class="viewer-detail-label">Notes:</span>
                <span class="viewer-detail-value">${image.description}</span>
            </div>
        ` : ''}
    `;
    
    document.getElementById('imageViewerModal').classList.add('active');
}

// Close image viewer
function closeImageViewer() {
    document.getElementById('imageViewerModal').classList.remove('active');
}

// Refresh session images manually
function refreshSessionImages() {
    loadSessionImages();
    Utils.showNotification('Treatment photos refreshed!', 'success');
}

// Refresh patient chart manually
function refreshPatientChart() {
    loadPatientChart();
    Utils.showNotification('Medical history refreshed!', 'success');
}

// Load patient chart (medical history)
function loadPatientChart() {
    const appointments = Storage.getAppointmentsByPatient(currentUser.id);
    
    // Filter completed appointments
    const completedAppointments = appointments.filter(apt => 
        apt.status === 'completed' || 
        (apt.status === 'confirmed' && new Date(apt.date) < new Date())
    );
    
    const chartList = document.getElementById('patientChartList');
    const emptyMessage = document.getElementById('emptyChartMessage');
    const chartCount = document.getElementById('chartCount');
    
    // Update count
    chartCount.textContent = `${completedAppointments.length} Record${completedAppointments.length !== 1 ? 's' : ''}`;
    
    if (completedAppointments.length === 0) {
        chartList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    // Show chart records
    emptyMessage.style.display = 'none';
    chartList.style.display = 'block';
    
    // Sort by date (newest first)
    completedAppointments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    chartList.innerHTML = completedAppointments.map(apt => {
        const doctor = Storage.getDoctorById(apt.doctorId);
        const service = Storage.getServiceById(apt.serviceId);
        const formattedDate = Utils.formatDate(apt.date);
        const formattedTime = Utils.formatTime(apt.time);
        
        // Generate remarks (this would normally come from staff/admin notes)
        const remarks = apt.remarks || 'No additional remarks recorded';
        const treatment = apt.treatment || 'Standard consultation and treatment provided';
        const status = apt.status === 'completed' ? 'completed' : 'completed';
        
        return `
            <div class="chart-record">
                <div class="chart-record-header">
                    <div class="chart-record-title">
                        <h4>${service ? service.name : 'General Consultation'}</h4>
                    <div class="chart-record-subtitle">
                        Dr. ${doctor ? doctor.name : 'Unknown Dentist'} - ${doctor ? doctor.specialty : 'General Dentistry'}
                        </div>
                    </div>
                    <div class="chart-record-date">
                        📅 ${formattedDate}<br>
                        🕐 ${formattedTime}
                    </div>
                </div>
                
                <div class="chart-record-details">
                    <div class="chart-detail-item">
                        <span class="chart-detail-label">Service Type</span>
                        <span class="chart-detail-value">${service ? service.name : 'N/A'}</span>
                    </div>
                    <div class="chart-detail-item">
                        <span class="chart-detail-label">Duration</span>
                        <span class="chart-detail-value">${service ? service.duration : '30'} minutes</span>
                    </div>
                    <div class="chart-detail-item">
                        <span class="chart-detail-label">Status</span>
                        <span class="chart-status-badge chart-status-${status}">✓ ${status}</span>
                    </div>
                </div>
                
                <div class="chart-record-remarks">
                    <span class="chart-record-remarks-label">📝 Treatment Notes & Remarks:</span>
                    <div class="chart-record-remarks-text">${remarks}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Update profile
document.getElementById('profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const updates = {
        fullName: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        dateOfBirth: document.getElementById('profileDOB').value,
        address: document.getElementById('profileAddress').value
    };
    
    // Validate email and phone
    if (!Utils.validateEmail(updates.email)) {
        Utils.showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (!Utils.validatePhone(updates.phone)) {
        Utils.showNotification('Please enter a valid phone number', 'error');
        return;
    }
    
    Storage.updateUser(currentUser.id, updates);
    Object.assign(currentUser, updates);
    Storage.setCurrentUser(currentUser);
    
    document.getElementById('userName').textContent = `Welcome, ${currentUser.fullName}`;
    
    Utils.showNotification('Profile updated successfully!', 'success');
    
    // Reload session images and patient chart in case data changed
    loadSessionImages();
    loadPatientChart();
    
    // Stay in profile section - just show success, don't redirect
    showSection('profile');
});

// Reschedule appointment
function openRescheduleModal(appointmentId) {
    const appointment = Storage.getAppointmentById(appointmentId);
    if (!appointment) return;
    
    document.getElementById('rescheduleAppointmentId').value = appointmentId;
    document.getElementById('rescheduleDate').value = appointment.date;
    document.getElementById('rescheduleDate').min = new Date().toISOString().split('T')[0];
    
    // Load available time slots
    loadTimeSlots(appointment.doctorId, appointment.date);
    
    document.getElementById('rescheduleModal').classList.add('active');
}

function closeRescheduleModal() {
    document.getElementById('rescheduleModal').classList.remove('active');
    document.getElementById('rescheduleForm').reset();
}

function loadTimeSlots(doctorId, date) {
    const dayOfWeek = Utils.getDayOfWeek(date);
    const timeSelect = document.getElementById('rescheduleTime');
    
    // Check clinic opening hours first
    const clinicSchedule = Storage.getClinicSchedule();
    const clinicDay = clinicSchedule[dayOfWeek];
    
    if (!clinicDay || !clinicDay.isOpen) {
        timeSelect.innerHTML = '<option value="">Clinic is closed on ' + dayOfWeek + 's</option>';
        return;
    }
    
    // Check doctor's schedule
    const schedules = Storage.getSchedulesByDoctor(doctorId);
    const doctorSchedule = schedules.find(s => s.day === dayOfWeek);
    
    if (!doctorSchedule) {
        timeSelect.innerHTML = '<option value="">Dentist not available on ' + dayOfWeek + 's</option>';
        return;
    }
    
    // Find the overlapping time between clinic hours and doctor's schedule
    const clinicStart = clinicDay.startTime;
    const clinicEnd = clinicDay.endTime;
    const doctorStart = doctorSchedule.startTime;
    const doctorEnd = doctorSchedule.endTime;
    
    // Get the latest start time and earliest end time
    const actualStart = clinicStart > doctorStart ? clinicStart : doctorStart;
    const actualEnd = clinicEnd < doctorEnd ? clinicEnd : doctorEnd;
    
    // Check if there's any overlap
    if (actualStart >= actualEnd) {
        timeSelect.innerHTML = '<option value="">No available slots (clinic hours conflict)</option>';
        return;
    }
    
    // Generate time slots based on the overlapping period
    const slots = Utils.generateTimeSlots(actualStart, actualEnd);
    
    if (slots.length === 0) {
        timeSelect.innerHTML = '<option value="">No available slots</option>';
        return;
    }
    
    timeSelect.innerHTML = '<option value="">Select time</option>' +
        slots.map(slot => `<option value="${slot}">${Utils.formatTime(slot)}</option>`).join('');
}

document.getElementById('rescheduleDate').addEventListener('change', (e) => {
    const appointmentId = document.getElementById('rescheduleAppointmentId').value;
    const appointment = Storage.getAppointmentById(appointmentId);
    if (appointment) {
        loadTimeSlots(appointment.doctorId, e.target.value);
    }
});

document.getElementById('rescheduleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const appointmentId = document.getElementById('rescheduleAppointmentId').value;
    const newDate = document.getElementById('rescheduleDate').value;
    const newTime = document.getElementById('rescheduleTime').value;
    
    if (!newTime) {
        Utils.showNotification('Please select a time slot', 'error');
        return;
    }
    
    Storage.updateAppointment(appointmentId, {
        date: newDate,
        time: newTime,
        status: 'pending'
    });
    
    Utils.showNotification('Appointment rescheduled successfully! Your appointment is now pending confirmation.', 'success');
    closeRescheduleModal();
    loadUpcomingAppointments();
    
    // Trigger sync so staff/admin see the change
    window.dispatchEvent(new CustomEvent('clinicDataUpdated', {
        detail: { timestamp: Date.now() }
    }));
    localStorage.setItem('lastDataUpdate', Date.now().toString());
});

// Cancel appointment
function cancelAppointment(appointmentId) {
    if (!Utils.confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    Storage.updateAppointment(appointmentId, { status: 'cancelled' });
    Utils.showNotification('Appointment cancelled', 'info');
    loadUpcomingAppointments();
    loadAppointmentHistory();
}

// Refresh appointments manually
function refreshAppointments() {
    loadUpcomingAppointments();
    loadAppointmentHistory();
    Utils.showNotification('Appointments refreshed', 'success');
}


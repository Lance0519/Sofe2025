// Storage management for Clinic Appointment System

const Storage = {
    // Initialize default data
    init() {
        if (!localStorage.getItem('clinicData')) {
            const defaultData = {
                users: [
                    {
                        id: 'admin001',
                        username: 'admin',
                        password: 'admin123',
                        role: 'admin',
                        email: 'admin@clinic.com',
                        fullName: 'System Administrator'
                    },
                    {
                        id: 'staff001',
                        username: 'staff',
                        password: 'staff123',
                        role: 'staff',
                        email: 'staff@clinic.com',
                        fullName: 'Jane Smith'
                    }
                ],
                patients: [
                    {
                        id: 'pat001',
                        username: 'patient',
                        password: 'patient123',
                        role: 'patient',
                        email: 'patient@example.com',
                        fullName: 'John Doe',
                        phone: '555-0100',
                        dateOfBirth: '1990-01-01',
                        address: '123 Main St'
                    }
                ],
                doctors: [
                    { id: 'doc001', name: 'Dr. Maria Cruz', specialty: 'General Dentistry', available: true },
                    { id: 'doc002', name: 'Dr. Carlos Santos', specialty: 'Orthodontics', available: true },
                    { id: 'doc003', name: 'Dr. Ana Reyes', specialty: 'Oral Surgery', available: true },
                    { id: 'doc004', name: 'Dr. Jose Mendoza', specialty: 'Prosthodontics', available: true },
                    { id: 'doc005', name: 'Dr. Isabella Torres', specialty: 'Cosmetic Dentistry', available: true }
                ],
                services: [
                    { id: 'srv001', name: 'Metallic Braces', description: 'Traditional metal braces for teeth alignment', duration: '60 mins', price: '₱25,000 - ₱40,000' },
                    { id: 'srv002', name: 'Ceramic Braces', description: 'Tooth-colored braces for a more aesthetic look', duration: '60 mins', price: '₱35,000 - ₱50,000' },
                    { id: 'srv003', name: 'Veneers', description: 'Thin shells to improve tooth appearance', duration: '90 mins', price: '₱8,000 - ₱15,000 per tooth' },
                    { id: 'srv004', name: 'Fixed Bridge', description: 'Permanent dental bridge to replace missing teeth', duration: '60 mins', price: '₱15,000 - ₱25,000' },
                    { id: 'srv005', name: 'Jacket Crown', description: 'Full coverage crown for damaged teeth', duration: '45 mins', price: '₱8,000 - ₱12,000' },
                    { id: 'srv006', name: 'Oral Surgery', description: 'Surgical procedures for dental issues', duration: '90 mins', price: '₱5,000 - ₱20,000' },
                    { id: 'srv007', name: 'Restoration', description: 'Dental fillings and tooth restoration', duration: '30 mins', price: '₱1,500 - ₱3,000' },
                    { id: 'srv008', name: 'Dentures', description: 'Complete or partial removable dentures', duration: '60 mins', price: '₱15,000 - ₱30,000' },
                    { id: 'srv009', name: 'Flexi Dentures', description: 'Flexible, comfortable partial dentures', duration: '60 mins', price: '₱18,000 - ₱35,000' },
                    { id: 'srv010', name: 'Root Canal', description: 'Treatment for infected tooth pulp', duration: '90 mins', price: '₱5,000 - ₱12,000' },
                    { id: 'srv011', name: 'Teeth Whitening', description: 'Professional teeth bleaching service', duration: '60 mins', price: '₱8,000 - ₱15,000' },
                    { id: 'srv012', name: 'Panoramic X-Ray', description: 'Full mouth X-ray imaging', duration: '15 mins', price: '₱800 - ₱1,500' },
                    { id: 'srv013', name: 'Periapical X-Ray', description: 'Detailed X-ray of specific tooth', duration: '10 mins', price: '₱300 - ₱500' },
                    { id: 'srv014', name: 'Tooth Extraction', description: 'Removal of damaged or problematic teeth', duration: '30 mins', price: '₱1,000 - ₱5,000' }
                ],
                appointments: [],
                medicalHistory: [],
                promos: [],
                clinicSchedule: {
                    Monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Saturday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
                    Sunday: { isOpen: false, startTime: '09:00', endTime: '18:00' }
                },
                schedules: [
                    { id: 'sch001', doctorId: 'doc001', day: 'Monday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch002', doctorId: 'doc001', day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch003', doctorId: 'doc001', day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch004', doctorId: 'doc001', day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch005', doctorId: 'doc001', day: 'Friday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch006', doctorId: 'doc002', day: 'Monday', startTime: '10:00', endTime: '16:00' },
                    { id: 'sch007', doctorId: 'doc002', day: 'Wednesday', startTime: '10:00', endTime: '16:00' },
                    { id: 'sch008', doctorId: 'doc002', day: 'Friday', startTime: '10:00', endTime: '16:00' },
                    { id: 'sch009', doctorId: 'doc003', day: 'Monday', startTime: '08:00', endTime: '14:00' },
                    { id: 'sch010', doctorId: 'doc003', day: 'Tuesday', startTime: '08:00', endTime: '14:00' },
                    { id: 'sch011', doctorId: 'doc003', day: 'Thursday', startTime: '08:00', endTime: '14:00' },
                    { id: 'sch012', doctorId: 'doc004', day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch013', doctorId: 'doc004', day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch014', doctorId: 'doc004', day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                    { id: 'sch015', doctorId: 'doc005', day: 'Monday', startTime: '11:00', endTime: '18:00' },
                    { id: 'sch016', doctorId: 'doc005', day: 'Wednesday', startTime: '11:00', endTime: '18:00' },
                    { id: 'sch017', doctorId: 'doc005', day: 'Friday', startTime: '11:00', endTime: '18:00' }
                ]
            };
            localStorage.setItem('clinicData', JSON.stringify(defaultData));
        }
    },

    // Get all data
    getData() {
        return JSON.parse(localStorage.getItem('clinicData'));
    },

    // Save all data
    saveData(data) {
        localStorage.setItem('clinicData', JSON.stringify(data));
    },

    // User management
    getAllUsers() {
        const data = this.getData();
        return [...data.users, ...data.patients];
    },

    getUserById(id) {
        const users = this.getAllUsers();
        return users.find(u => u.id === id);
    },

    getUserByUsername(username) {
        const users = this.getAllUsers();
        return users.find(u => u.username === username);
    },

    createUser(user) {
        const data = this.getData();
        user.id = 'user' + Date.now();
        if (user.role === 'patient') {
            data.patients.push(user);
        } else {
            data.users.push(user);
        }
        this.saveData(data);
        return user;
    },

    updateUser(userId, updates) {
        const data = this.getData();
        let user = data.users.find(u => u.id === userId);
        if (user) {
            Object.assign(user, updates);
        } else {
            user = data.patients.find(u => u.id === userId);
            if (user) Object.assign(user, updates);
        }
        this.saveData(data);
        return user;
    },

    deleteUser(userId) {
        const data = this.getData();
        data.users = data.users.filter(u => u.id !== userId);
        data.patients = data.patients.filter(u => u.id !== userId);
        this.saveData(data);
    },

    // Patient management
    getPatients() {
        const data = this.getData();
        return data.patients;
    },

    getPatientById(id) {
        const data = this.getData();
        return data.patients.find(p => p.id === id);
    },

    // Doctor management
    getDoctors() {
        const data = this.getData();
        return data.doctors;
    },

    getDoctorById(id) {
        const data = this.getData();
        return data.doctors.find(d => d.id === id);
    },

    createDoctor(doctor) {
        const data = this.getData();
        doctor.id = 'doc' + Date.now();
        data.doctors.push(doctor);
        this.saveData(data);
        return doctor;
    },

    updateDoctor(doctorId, updates) {
        const data = this.getData();
        const doctor = data.doctors.find(d => d.id === doctorId);
        if (doctor) {
            Object.assign(doctor, updates);
            this.saveData(data);
        }
        return doctor;
    },

    deleteDoctor(doctorId) {
        const data = this.getData();
        data.doctors = data.doctors.filter(d => d.id !== doctorId);
        this.saveData(data);
    },

    // Service management
    getServices() {
        const data = this.getData();
        return data.services;
    },

    getServiceById(id) {
        const data = this.getData();
        return data.services.find(s => s.id === id);
    },

    createService(service) {
        const data = this.getData();
        service.id = 'srv' + Date.now();
        data.services.push(service);
        this.saveData(data);
        return service;
    },

    updateService(serviceId, updates) {
        const data = this.getData();
        const service = data.services.find(s => s.id === serviceId);
        if (service) {
            Object.assign(service, updates);
            this.saveData(data);
        }
        return service;
    },

    deleteService(serviceId) {
        const data = this.getData();
        data.services = data.services.filter(s => s.id !== serviceId);
        this.saveData(data);
    },

    // Appointment management
    getAppointments() {
        const data = this.getData();
        return data.appointments;
    },

    getAppointmentById(id) {
        const data = this.getData();
        return data.appointments.find(a => a.id === id);
    },

    getAppointmentsByPatient(patientId) {
        const data = this.getData();
        return data.appointments.filter(a => a.patientId === patientId);
    },

    getAppointmentsByDoctor(doctorId) {
        const data = this.getData();
        return data.appointments.filter(a => a.doctorId === doctorId);
    },

    createAppointment(appointment) {
        const data = this.getData();
        appointment.id = 'apt' + Date.now();
        appointment.createdAt = new Date().toISOString();
        data.appointments.push(appointment);
        this.saveData(data);
        return appointment;
    },

    updateAppointment(appointmentId, updates) {
        const data = this.getData();
        const appointment = data.appointments.find(a => a.id === appointmentId);
        if (appointment) {
            Object.assign(appointment, updates);
            this.saveData(data);
        }
        return appointment;
    },

    deleteAppointment(appointmentId) {
        const data = this.getData();
        data.appointments = data.appointments.filter(a => a.id !== appointmentId);
        this.saveData(data);
    },

    // Session Images Management (for treatment documentation)
    getSessionImages() {
        const data = this.getData();
        return data.sessionImages || [];
    },

    getSessionImagesByPatient(patientId) {
        const data = this.getData();
        const sessionImages = data.sessionImages || [];
        return sessionImages.filter(img => img.patientId === patientId);
    },

    getSessionImageById(imageId) {
        const data = this.getData();
        const sessionImages = data.sessionImages || [];
        return sessionImages.find(img => img.id === imageId);
    },

    createSessionImage(imageData) {
        const data = this.getData();
        if (!data.sessionImages) {
            data.sessionImages = [];
        }
        const newImage = {
            id: 'img' + Date.now(),
            uploadedAt: new Date().toISOString(),
            ...imageData
        };
        data.sessionImages.push(newImage);
        this.saveData(data);
        return newImage;
    },

    updateSessionImage(imageId, updates) {
        const data = this.getData();
        const sessionImages = data.sessionImages || [];
        const image = sessionImages.find(img => img.id === imageId);
        if (image) {
            Object.assign(image, updates);
            this.saveData(data);
        }
        return image;
    },

    deleteSessionImage(imageId) {
        const data = this.getData();
        if (data.sessionImages) {
            data.sessionImages = data.sessionImages.filter(img => img.id !== imageId);
            this.saveData(data);
        }
    },

    // Schedule management
    getSchedules() {
        const data = this.getData();
        return data.schedules;
    },

    getSchedulesByDoctor(doctorId) {
        const data = this.getData();
        return data.schedules.filter(s => s.doctorId === doctorId);
    },

    getScheduleById(scheduleId) {
        const data = this.getData();
        return data.schedules.find(s => s.id === scheduleId);
    },

    createSchedule(schedule) {
        const data = this.getData();
        schedule.id = 'sch' + Date.now();
        data.schedules.push(schedule);
        this.saveData(data);
        return schedule;
    },

    updateSchedule(scheduleId, updates) {
        const data = this.getData();
        const schedule = data.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            Object.assign(schedule, updates);
            this.saveData(data);
        }
        return schedule;
    },

    deleteSchedule(scheduleId) {
        const data = this.getData();
        data.schedules = data.schedules.filter(s => s.id !== scheduleId);
        this.saveData(data);
    },

    // Medical History management
    getMedicalHistory() {
        const data = this.getData();
        return data.medicalHistory || [];
    },

    getMedicalHistoryByPatient(patientId) {
        const data = this.getData();
        const medicalHistory = data.medicalHistory || [];
        return medicalHistory.filter(record => record.patientId === patientId);
    },

    getMedicalHistoryById(recordId) {
        const data = this.getData();
        const medicalHistory = data.medicalHistory || [];
        return medicalHistory.find(record => record.id === recordId);
    },

    createMedicalHistory(record) {
        const data = this.getData();
        if (!data.medicalHistory) {
            data.medicalHistory = [];
        }
        const newRecord = {
            id: 'med' + Date.now(),
            createdAt: new Date().toISOString(),
            ...record
        };
        data.medicalHistory.push(newRecord);
        this.saveData(data);
        return newRecord;
    },

    updateMedicalHistory(recordId, updates) {
        const data = this.getData();
        if (!data.medicalHistory) {
            data.medicalHistory = [];
        }
        const record = data.medicalHistory.find(r => r.id === recordId);
        if (record) {
            Object.assign(record, updates);
            this.saveData(data);
        }
        return record;
    },

    deleteMedicalHistory(recordId) {
        const data = this.getData();
        if (data.medicalHistory) {
            data.medicalHistory = data.medicalHistory.filter(r => r.id !== recordId);
            this.saveData(data);
        }
    },

    // Promo management
    getPromos() {
        const data = this.getData();
        return data.promos || [];
    },

    getPromoById(id) {
        const data = this.getData();
        const promos = data.promos || [];
        return promos.find(p => p.id === id);
    },

    createPromo(promo) {
        const data = this.getData();
        if (!data.promos) {
            data.promos = [];
        }
        promo.id = 'promo' + Date.now();
        promo.createdAt = new Date().toISOString();
        data.promos.push(promo);
        this.saveData(data);
        return promo;
    },

    updatePromo(promoId, updates) {
        const data = this.getData();
        if (!data.promos) {
            data.promos = [];
        }
        const promo = data.promos.find(p => p.id === promoId);
        if (promo) {
            Object.assign(promo, updates);
            this.saveData(data);
        }
        return promo;
    },

    deletePromo(promoId) {
        const data = this.getData();
        if (data.promos) {
            data.promos = data.promos.filter(p => p.id !== promoId);
            this.saveData(data);
        }
    },

    // Clinic Schedule management
    getClinicSchedule() {
        const data = this.getData();
        return data.clinicSchedule || {
            Monday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Tuesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Wednesday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Thursday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Friday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Saturday: { isOpen: true, startTime: '09:00', endTime: '18:00' },
            Sunday: { isOpen: false, startTime: '09:00', endTime: '18:00' }
        };
    },

    updateClinicSchedule(schedule) {
        const data = this.getData();
        data.clinicSchedule = schedule;
        this.saveData(data);
        return schedule;
    },

    // Session management
    setCurrentUser(user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
    },

    getCurrentUser() {
        const user = sessionStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    logout() {
        sessionStorage.removeItem('currentUser');
    }
};

// Initialize storage on load
Storage.init();


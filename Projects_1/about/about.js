// About page functionality

document.addEventListener('DOMContentLoaded', () => {
    loadTeam();
});

function loadTeam() {
    const doctors = Storage.getDoctors();
    const container = document.getElementById('teamGrid');
    
    container.innerHTML = doctors.map(doctor => `
        <div class="team-member">
            <div class="member-avatar">👨‍⚕️</div>
            <h3>${doctor.name}</h3>
            <div class="member-specialty">${doctor.specialty}</div>
            <div class="member-bio">
                Dedicated healthcare professional committed to providing excellent patient care and treatment.
            </div>
        </div>
    `).join('');
}


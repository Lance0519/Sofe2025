// Services page functionality

const serviceIcons = {
    'General Consultation': '🩺',
    'Cardiology': '❤️',
    'Pediatric': '👶',
    'Orthopedic': '🦴',
    'Dermatology': '✨',
    'Lab Tests': '🔬',
    'X-Ray': '📷',
    'Physical Therapy': '💪'
};

document.addEventListener('DOMContentLoaded', () => {
    loadServices();
    loadPromos();
});

function loadPromos() {
    const promos = Storage.getPromos();
    const promosSection = document.getElementById('promosSection');
    const container = document.getElementById('promosList');
    
    if (promos.length === 0) {
        promosSection.style.display = 'none';
        return;
    }
    
    promosSection.style.display = 'block';
    
    container.innerHTML = promos.map(promo => `
        <div class="promo-card">
            <div class="promo-badge">${promo.discount || 'Special Offer'}</div>
            <div class="promo-content">
                <h3>${promo.title}</h3>
                <p class="promo-description">${promo.description}</p>
                ${promo.originalPrice ? `
                    <div class="promo-pricing">
                        <span class="original-price">${promo.originalPrice}</span>
                        <span class="promo-price">${promo.promoPrice}</span>
                    </div>
                ` : `
                    <div class="promo-pricing">
                        <span class="promo-price">${promo.price || promo.promoPrice}</span>
                    </div>
                `}
                ${promo.validUntil ? `
                    <div class="promo-validity">Valid until: ${Utils.formatDate(promo.validUntil)}</div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function loadServices() {
    const services = Storage.getServices();
    const container = document.getElementById('servicesList');
    
    container.innerHTML = services.map(service => {
        // Try to match icon based on service name
        let icon = '🏥'; // default icon
        for (const [key, value] of Object.entries(serviceIcons)) {
            if (service.name.includes(key)) {
                icon = value;
                break;
            }
        }
        
        return `
            <div class="service-card">
                <div class="service-icon">${icon}</div>
                <h3>${service.name}</h3>
                <p>${service.description}</p>
                <div class="service-meta">
                    <div class="service-meta-item">
                        <span class="meta-label">Duration</span>
                        <span class="meta-value">${service.duration}</span>
                    </div>
                    <div class="service-meta-item">
                        <span class="meta-label">Price</span>
                        <span class="meta-value service-price">${service.price}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


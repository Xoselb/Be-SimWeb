// =============================================
// CONTACT PAGE JAVASCRIPT
// =============================================

// Partículas animadas
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 150; // Aumentado de 50 a 150
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 25 + 's';
        particle.style.animationDuration = (18 + Math.random() * 12) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Contact Functions
function makeCall() {
    window.location.href = 'tel:+32495579278';
    showNotification('📞 Appel en cours...');
}

function sendEmail() {
    window.location.href = 'mailto:ebracingevents@gmail.com?subject=Contact%20EB%20Racing&body=Bonjour%20EB%20Racing,%0A%0AJe%20souhaite%20obtenir%20plus%20d%27informations.%0A%0ACordialement';
    showNotification('✉️ Ouverture du client email...');
}

function openMaps() {
    window.open('https://maps.google.com/?q=RUE+DE+LA+MAÎTRISE+4+1400+Nivelles+Belgique', '_blank');
    showNotification('📍 Ouverture de Google Maps...');
}

// Notification System mejorado
function showNotification(message) {
    const toast = document.getElementById('notificationToast');
    toast.textContent = message;
    toast.className = 'notification-toast show';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// Form Submission con animación mejorada
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = this.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span>⏳ Envoi en cours...</span>';
    submitBtn.disabled = true;
    submitBtn.style.transform = 'scale(0.95)';
    
    // Simulate form submission
    setTimeout(() => {
        showNotification('✅ Message envoyé avec succès! Nous vous contacterons bientôt.');
        this.reset();
        submitBtn.innerHTML = '<span>✅ Envoyé!</span>';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.transform = 'scale(1)';
        }, 2000);
    }, 2000);
});

// Animación al hacer scroll mejorada
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observar elementos para animación
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    
    const animatedElements = document.querySelectorAll('.method-card, .form-container, .section-header');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });
});

// Efecto parallax sutil en el hero
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroContent = document.querySelector('.hero-content');
    
    if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

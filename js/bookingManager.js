// Local Booking Manager - Replaces Odoo booking functionality
class BookingManager {
    constructor() {
        this.bookings = this.loadBookingsFromStorage();
        this.initializeEventListeners();
    }

    // Load bookings from localStorage
    loadBookingsFromStorage() {
        const savedBookings = localStorage.getItem('bookings');
        return savedBookings ? JSON.parse(savedBookings) : [];
    }

    // Save bookings to localStorage
    saveBookingsToStorage() {
        localStorage.setItem('bookings', JSON.stringify(this.bookings));
    }

    // Initialize event listeners for booking forms
    initializeEventListeners() {
        // Find all booking forms
        const bookingForms = document.querySelectorAll('.booking-form');
        bookingForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleBookingSubmit(form);
            });
        });

        // Find all booking buttons
        const bookingButtons = document.querySelectorAll('.booking-btn');
        bookingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBookingClick(button);
            });
        });
    }

    // Handle booking form submission
    handleBookingSubmit(form) {
        const formData = new FormData(form);
        const booking = {
            id: Date.now().toString(),
            service: formData.get('service'),
            date: formData.get('date'),
            time: formData.get('time'),
            participants: formData.get('participants'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.addBooking(booking);
        this.showNotification('Réservation envoyée avec succès!', 'success');
        form.reset();
    }

    // Handle booking button clicks
    handleBookingClick(button) {
        const service = button.dataset.service;
        const date = button.dataset.date;
        const time = button.dataset.time;

        if (service && date && time) {
            this.quickBook(service, date, time);
        } else {
            this.showBookingModal(button);
        }
    }

    // Quick booking for predefined slots
    quickBook(service, date, time) {
        if (!window.auth || !window.auth.isAuthenticated()) {
            this.showNotification('Veuillez vous connecter pour réserver', 'error');
            return;
        }

        const user = window.auth.getCurrentUser();
        const booking = {
            id: Date.now().toString(),
            service: service,
            date: date,
            time: time,
            participants: 1,
            name: user.name || user.email,
            email: user.email,
            phone: user.phone || '',
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        this.addBooking(booking);
        this.showNotification('Réservation confirmée!', 'success');
    }

    // Show booking modal
    showBookingModal(button) {
        const service = button.dataset.service;
        const modal = this.createBookingModal(service);
        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);

        // Handle modal close
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        // Handle form submission
        const form = modal.querySelector('.booking-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmit(form);
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });
    }

    // Create booking modal HTML
    createBookingModal(service) {
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Réserver - ${service}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="booking-form">
                        <input type="hidden" name="service" value="${service}">
                        
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" name="date" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Heure</label>
                            <input type="time" name="time" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Participants</label>
                            <select name="participants" required>
                                <option value="1">1 personne</option>
                                <option value="2">2 personnes</option>
                                <option value="3">3 personnes</option>
                                <option value="4">4 personnes</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Nom</label>
                            <input type="text" name="name" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required>
                        </div>
                        
                        <div class="form-group">
                            <label>Téléphone</label>
                            <input type="tel" name="phone" required>
                        </div>
                        
                        <button type="submit" class="btn-primary">Réserver</button>
                    </form>
                </div>
            </div>
        `;
        return modal;
    }

    // Add booking
    addBooking(booking) {
        this.bookings.push(booking);
        this.saveBookingsToStorage();
        this.updateBookingsUI();
    }

    // Update bookings UI
    updateBookingsUI() {
        const bookingsContainer = document.querySelector('.bookings-list');
        if (bookingsContainer) {
            this.renderBookings(bookingsContainer);
        }
    }

    // Render bookings
    renderBookings(container) {
        const userBookings = this.getUserBookings();
        
        if (userBookings.length === 0) {
            container.innerHTML = '<p>Aucune réservation trouvée</p>';
            return;
        }

        container.innerHTML = userBookings.map(booking => `
            <div class="booking-item">
                <div class="booking-info">
                    <h4>${booking.service}</h4>
                    <p>Date: ${new Date(booking.date).toLocaleDateString('fr-FR')}</p>
                    <p>Heure: ${booking.time}</p>
                    <p>Participants: ${booking.participants}</p>
                    <span class="status ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-actions">
                    <button class="btn-cancel" data-id="${booking.id}">Annuler</button>
                </div>
            </div>
        `).join('');

        // Add cancel button listeners
        container.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', () => {
                this.cancelBooking(btn.dataset.id);
            });
        });
    }

    // Get user bookings
    getUserBookings() {
        if (!window.auth || !window.auth.isAuthenticated()) {
            return [];
        }
        
        const user = window.auth.getCurrentUser();
        return this.bookings.filter(booking => booking.email === user.email);
    }

    // Cancel booking
    cancelBooking(bookingId) {
        this.bookings = this.bookings.filter(b => b.id !== bookingId);
        this.saveBookingsToStorage();
        this.updateBookingsUI();
        this.showNotification('Réservation annulée', 'info');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Get available time slots
    getAvailableTimeSlots(date, service) {
        // Generate available time slots (mock data)
        const slots = [];
        for (let hour = 9; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                slots.push(time);
            }
        }
        return slots;
    }
}

// Export for use in other files
window.BookingManager = BookingManager;

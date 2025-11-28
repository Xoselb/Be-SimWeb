// Advanced Booking System with VIP Simulators and User Roles
class AdvancedBookingSystem {
    constructor() {
        this.simulators = this.initializeSimulators();
        this.bookings = this.loadBookingsFromStorage();
        this.currentUser = null;
        this.businessHours = this.initializeBusinessHours();
        this.initializeEventListeners();
        this.loadCurrentUser();
    }

    // Initialize business hours
    initializeBusinessHours() {
        return {
            weekdays: { // Lunes a Viernes
                open: 16, // 16:00
                close: 24 // 00:00 (medianoche)
            },
            weekends: { // Sábado a Domingo
                open: 14, // 14:00
                close: 26 // 02:00 (2 AM del día siguiente)
            },
            holidays: {
                closed: true // Cerrado días festivos
            }
        };
    }

    // Check if a date/time is within business hours
    isWithinBusinessHours(date, time) {
        const dayOfWeek = date.getDay(); // 0 = Domingo, 6 = Sábado
        const hour = parseInt(time.split(':')[0]);
        const minute = parseInt(time.split(':')[1]);
        const totalMinutes = hour * 60 + minute;
        
        // Check if it's a holiday (simplified - you could add a holiday calendar)
        if (this.isHoliday(date)) {
            return false;
        }
        
        // Weekday hours (Monday-Friday = 1-5)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            const openMinutes = this.businessHours.weekdays.open * 60;
            const closeMinutes = this.businessHours.weekdays.close * 60;
            return totalMinutes >= openMinutes && totalMinutes < closeMinutes;
        }
        
        // Weekend hours (Saturday-Sunday = 0,6)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            const openMinutes = this.businessHours.weekends.open * 60;
            const closeMinutes = this.businessHours.weekends.close * 60;
            return totalMinutes >= openMinutes && totalMinutes < closeMinutes;
        }
        
        return false;
    }

    // Check if date is a holiday (simplified implementation)
    isHoliday(date) {
        // This is a simplified version - you could add specific holiday dates
        // For now, we'll assume no holidays except major ones
        const month = date.getMonth() + 1; // 1-12
        const day = date.getDate();
        
        // Example: Christmas, New Year, etc. (you can expand this)
        const holidays = [
            { month: 1, day: 1 },   // New Year
            { month: 12, day: 25 },  // Christmas
            // Add more holidays as needed
        ];
        
        return holidays.some(holiday => holiday.month === month && holiday.day === day);
    }

    // Get available time slots for a specific date
    getAvailableTimeSlots(date, simulatorId) {
        const allSlots = this.generateAllTimeSlots(date);
        const bookings = this.getBookingsForSimulator(simulatorId, date);
        
        return allSlots.filter(slot => {
            // Check if within business hours
            if (!this.isWithinBusinessHours(date, slot.time)) {
                return false;
            }
            
            // Check if already booked
            const isBooked = this.isTimeSlotBooked(simulatorId, date, slot.time, bookings);
            return !isBooked;
        });
    }

    // Generate all possible time slots for a date
    generateAllTimeSlots(date) {
        const slots = [];
        const dayOfWeek = date.getDay();
        
        // Get opening hours for this day
        let openHour, closeHour;
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            openHour = this.businessHours.weekdays.open;
            closeHour = this.businessHours.weekdays.close;
        } else {
            openHour = this.businessHours.weekends.open;
            closeHour = this.businessHours.weekends.close;
        }
        
        // Generate hourly slots
        for (let hour = openHour; hour < closeHour; hour++) {
            // Handle overnight closing for weekends (e.g., 2 AM = 26)
            const displayHour = hour >= 24 ? hour - 24 : hour;
            const timeString = `${displayHour.toString().padStart(2, '0')}:00`;
            slots.push({ time: timeString, available: true });
        }
        
        return slots;
    }

    // Initialize simulators (1 VIP + 9 normal)
    initializeSimulators() {
        return {
            1: { id: 1, name: 'Simulador VIP 1', type: 'vip', price: 50, features: ['Pantalla 4K', 'Silla premium', 'Audio surround'] },
            2: { id: 2, name: 'Simulador 2', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            3: { id: 3, name: 'Simulador 3', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            4: { id: 4, name: 'Simulador 4', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            5: { id: 5, name: 'Simulador 5', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            6: { id: 6, name: 'Simulador 6', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            7: { id: 7, name: 'Simulador 7', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            8: { id: 8, name: 'Simulador 8', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            9: { id: 9, name: 'Simulador 9', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] },
            10: { id: 10, name: 'Simulador 10', type: 'normal', price: 25, features: ['Pantalla HD', 'Silla estándar'] }
        };
    }

    // Load current user
    loadCurrentUser() {
        if (window.auth && window.auth.isAuthenticated()) {
            this.currentUser = window.auth.getCurrentUser();
            this.updateUIForUserRole();
        }
    }

    // Get user role
    getUserRole() {
        if (!this.currentUser) return 'guest';
        
        // Check for owner role first
        if (this.currentUser.role === 'owner' || this.currentUser.role === 'propriétaire') return 'owner';
        
        // Check for VIP membership
        if (this.currentUser.membership === 'vip' || this.currentUser.role === 'premium') return 'vip';
        
        // Check for regular membership
        if (this.currentUser.membership === 'member' || this.currentUser.role === 'utilisateur') return 'member';
        
        return 'guest';
    }

    // Update UI based on user role
    updateUIForUserRole() {
        const role = this.getUserRole();
        
        // Show/hide VIP simulator
        const vipSimulator = document.querySelector('[data-simulator="1"]');
        if (vipSimulator) {
            if (role === 'vip' || role === 'owner') {
                vipSimulator.style.display = 'block';
                vipSimulator.classList.remove('vip-restricted');
            } else {
                vipSimulator.style.display = 'none';
                vipSimulator.classList.add('vip-restricted');
            }
        }

        // Show admin panel for owners
        const adminPanel = document.getElementById('admin-panel');
        if (adminPanel) {
            adminPanel.style.display = role === 'owner' ? 'block' : 'none';
        }

        // Update booking display
        this.renderBookings();
    }

    // Initialize event listeners
    initializeEventListeners() {
        // Booking buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('booking-btn')) {
                this.handleBookingClick(e.target);
            }
            
            if (e.target.classList.contains('cancel-booking-btn')) {
                this.cancelBooking(e.target.dataset.bookingId);
            }
            
            if (e.target.classList.contains('edit-booking-btn')) {
                this.editBooking(e.target.dataset.bookingId);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('booking-form')) {
                e.preventDefault();
                this.handleBookingSubmit(e.target);
            }
        });

        // Simulator selection
        document.addEventListener('change', (e) => {
            if (e.target.id === 'simulator-select') {
                this.updateAvailableTimeSlots(e.target.value);
            }
        });

        // Date selection
        document.addEventListener('change', (e) => {
            if (e.target.id === 'booking-date') {
                this.updateSimulatorAvailability(e.target.value);
            }
        });
    }

    // Handle booking button click
    handleBookingClick(button) {
        // First, check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showNotification('Veuillez vous connecter pour réserver', 'error');
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '../auth/login.html?redirect=' + encodeURIComponent(window.location.href);
            }, 1500);
            return;
        }

        const simulatorId = button.dataset.simulator;
        const date = button.dataset.date;
        const time = button.dataset.time;
        
        if (this.canBookSimulator(simulatorId)) {
            this.showBookingModal(simulatorId, date, time);
        } else {
            const role = this.getUserRole();
            if (role === 'guest') {
                this.showNotification('Veuillez vous connecter pour réserver', 'error');
                setTimeout(() => {
                    window.location.href = '../auth/login.html?redirect=' + encodeURIComponent(window.location.href);
                }, 1500);
            } else {
                this.showNotification('Ce simulateur est réservé aux membres VIP', 'error');
            }
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return window.auth && window.auth.isAuthenticated();
    }

    // Check if user can book simulator
    canBookSimulator(simulatorId) {
        const role = this.getUserRole();
        const simulator = this.simulators[simulatorId];
        
        if (simulator.type === 'vip' && role !== 'vip' && role !== 'owner') {
            return false;
        }
        
        return role !== 'guest';
    }

    // Show booking modal
    showBookingModal(simulatorId, date = null, time = null) {
        const simulator = this.simulators[simulatorId];
        const role = this.getUserRole();
        
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Réserver - ${simulator.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="simulator-info">
                        <h4>${simulator.name}</h4>
                        <p>Type: ${simulator.type === 'vip' ? 'VIP' : 'Standard'}</p>
                        <p>Prix: ${simulator.price}€/heure</p>
                        <div class="features">
                            ${simulator.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="business-hours-info">
                        <h4><i class="fas fa-clock"></i> Horaires d'ouverture</h4>
                        <div class="hours-grid">
                            <div class="hours-item">
                                <strong>Lun-Ven:</strong> 16h - 00h
                            </div>
                            <div class="hours-item">
                                <strong>Sam-Dim:</strong> 14h - 02h
                            </div>
                            <div class="hours-item holiday">
                                <strong>Fermé:</strong> Jours fériés
                            </div>
                        </div>
                        <p class="hours-note">Les réservations ne sont possibles que pendant les heures d'ouverture.</p>
                    </div>
                    
                    <form class="booking-form">
                        <input type="hidden" name="simulatorId" value="${simulatorId}">
                        
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" name="date" id="booking-date" required 
                                   min="${new Date().toISOString().split('T')[0]}"
                                   ${date ? `value="${date}"` : ''}>
                        </div>
                        
                        <div class="form-group">
                            <label>Simulateur</label>
                            <select name="simulatorId" id="simulator-select" required>
                                ${this.getAvailableSimulatorsForRole().map(sim => 
                                    `<option value="${sim.id}" ${sim.id == simulatorId ? 'selected' : ''}>
                                        ${sim.name} - ${sim.type === 'vip' ? 'VIP' : 'Standard'} (${sim.price}€/h)
                                    </option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Heure de début</label>
                            <select name="time" id="time-select" required>
                                <option value="">Sélectionner une heure</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Durée</label>
                            <select name="duration" required>
                                <option value="1">1 heure</option>
                                <option value="2">2 heures</option>
                                <option value="3">3 heures</option>
                            </select>
                        </div>
                        
                        <div class="price-estimate">
                            <p>Total estimé: <span id="price-display">${simulator.price}€</span></p>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Réserver</button>
                            <button type="button" class="btn-secondary close-modal-btn">Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);

        // Initialize time slots
        if (date) {
            this.updateAvailableTimeSlots(simulatorId, date);
        }

        // Handle modal events
        this.setupModalEventListeners(modal, simulatorId);
    }

    // Setup modal event listeners
    setupModalEventListeners(modal, simulatorId) {
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Date change
        const dateInput = modal.querySelector('#booking-date');
        dateInput.addEventListener('change', (e) => {
            this.updateAvailableTimeSlots(simulatorId, e.target.value);
        });

        // Simulator change
        const simulatorSelect = modal.querySelector('#simulator-select');
        simulatorSelect.addEventListener('change', (e) => {
            const newSimulatorId = e.target.value;
            const date = dateInput.value;
            this.updateAvailableTimeSlots(newSimulatorId, date);
            this.updatePriceDisplay(newSimulatorId);
        });

        // Duration change
        const durationSelect = modal.querySelector('select[name="duration"]');
        durationSelect.addEventListener('change', () => {
            this.updatePriceDisplay(simulatorSelect.value);
        });

        // Form submission
        const form = modal.querySelector('.booking-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBookingSubmit(form);
        });
    }

    // Update price display
    updatePriceDisplay(simulatorId) {
        const simulator = this.simulators[simulatorId];
        const durationSelect = document.querySelector('select[name="duration"]');
        const priceDisplay = document.getElementById('price-display');
        
        if (simulator && durationSelect && priceDisplay) {
            const duration = parseInt(durationSelect.value);
            const total = simulator.price * duration;
            priceDisplay.textContent = `${total}€`;
        }
    }

    // Get available simulators for user role
    getAvailableSimulatorsForRole() {
        const role = this.getUserRole();
        return Object.values(this.simulators).filter(sim => {
            if (sim.type === 'vip') {
                return role === 'vip' || role === 'owner';
            }
            return true;
        });
    }

    // Update available time slots
    updateAvailableTimeSlots(simulatorId, date) {
        const timeSelect = document.getElementById('time-select');
        if (!timeSelect) return;

        const availableSlots = this.getAvailableTimeSlots(simulatorId, date);
        
        timeSelect.innerHTML = '<option value="">Sélectionner une heure</option>';
        
        availableSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot.time;
            option.textContent = `${slot.time} ${slot.available ? '' : '(Occupé)'}`;
            option.disabled = !slot.available;
            timeSelect.appendChild(option);
        });

        // Update price display
        this.updatePriceDisplay(simulatorId);
    }

    // Get available time slots for a simulator
    getAvailableTimeSlots(simulatorId, date) {
        if (!date) return [];

        const slots = [];
        const bookings = this.getBookingsForSimulator(simulatorId, date);
        
        // Generate slots from 9:00 to 22:00 (last booking at 19:00 for 3h sessions)
        for (let hour = 9; hour <= 19; hour++) {
            for (let minute = 0; minute < 60; minute += 60) { // Hourly slots
                const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                // Check if this time slot is available
                const isAvailable = !this.isTimeSlotBooked(simulatorId, date, time, bookings);
                
                slots.push({
                    time: time,
                    available: isAvailable
                });
            }
        }

        return slots;
    }

    // Check if time slot is booked
    isTimeSlotBooked(simulatorId, date, startTime, bookings) {
        return bookings.some(booking => {
            if (booking.simulatorId != simulatorId || booking.date !== date) {
                return false;
            }

            const bookingStart = booking.time;
            const bookingEnd = this.addHoursToTime(booking.time, booking.duration);
            const requestedEnd = this.addHoursToTime(startTime, 3); // Max duration check

            return (startTime < bookingEnd && requestedEnd > bookingStart);
        });
    }

    // Add hours to time string
    addHoursToTime(time, hours) {
        const [h, m] = time.split(':').map(Number);
        const totalMinutes = h * 60 + m + (hours * 60);
        const endHour = Math.floor(totalMinutes / 60);
        const endMinute = totalMinutes % 60;
        return `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
    }

    // Get bookings for simulator
    getBookingsForSimulator(simulatorId, date) {
        return this.bookings.filter(booking => 
            booking.simulatorId == simulatorId && 
            booking.date === date &&
            booking.status !== 'cancelled'
        );
    }

    // Handle booking form submission
    handleBookingSubmit(form) {
        // Double-check authentication before processing
        if (!this.isAuthenticated()) {
            this.showNotification('Session expirée. Veuillez vous reconnecter', 'error');
            const modal = form.closest('.booking-modal');
            this.closeModal(modal);
            setTimeout(() => {
                window.location.href = '../auth/login.html?redirect=' + encodeURIComponent(window.location.href);
            }, 1500);
            return;
        }

        const formData = new FormData(form);
        const booking = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            userName: this.currentUser.name || this.currentUser.email,
            userEmail: this.currentUser.email,
            simulatorId: formData.get('simulatorId'),
            date: formData.get('date'),
            time: formData.get('time'),
            duration: parseInt(formData.get('duration')),
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };

        // Validate booking
        if (!this.validateBooking(booking)) {
            return;
        }

        // Add booking
        this.addBooking(booking);
        
        // Close modal
        const modal = form.closest('.booking-modal');
        this.closeModal(modal);

        // Show success message
        this.showNotification('Réservation confirmée avec succès!', 'success');
    }

    // Validate booking
    validateBooking(booking) {
        // Check if booking date is within business hours
        const bookingDate = new Date(booking.date);
        if (!this.isWithinBusinessHours(bookingDate, booking.time)) {
            const dayName = bookingDate.toLocaleDateString('fr-FR', { weekday: 'long' });
            const dayOfWeek = bookingDate.getDay();
            
            let hoursText = '';
            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                hoursText = '16h - 00h';
            } else {
                hoursText = '14h - 02h';
            }
            
            this.showNotification(`Le local est fermé le ${dayName} à cette heure. Horaires: ${hoursText}`, 'error');
            return false;
        }

        // Check if time slot is still available
        const bookings = this.getBookingsForSimulator(booking.simulatorId, booking.date);
        if (this.isTimeSlotBooked(booking.simulatorId, booking.date, booking.time, bookings)) {
            this.showNotification('Ce créneau horaire n\'est plus disponible', 'error');
            return false;
        }

        // Check if user can book this simulator
        if (!this.canBookSimulator(booking.simulatorId)) {
            this.showNotification('Vous ne pouvez pas réserver ce simulateur', 'error');
            return false;
        }

        return true;
    }

    // Add booking
    addBooking(booking) {
        this.bookings.push(booking);
        this.saveBookingsToStorage();
        this.renderBookings();
    }

    // Cancel booking
    cancelBooking(bookingId) {
        const role = this.getUserRole();
        const booking = this.bookings.find(b => b.id === bookingId);
        
        if (!booking) return;

        // Check permissions
        if (role !== 'owner' && booking.userId !== this.currentUser.id) {
            this.showNotification('Vous ne pouvez pas annuler cette réservation', 'error');
            return;
        }

        booking.status = 'cancelled';
        booking.cancelledAt = new Date().toISOString();
        booking.cancelledBy = this.currentUser.id;
        
        this.saveBookingsToStorage();
        this.renderBookings();
        this.showNotification('Réservation annulée', 'info');
    }

    // Edit booking
    editBooking(bookingId) {
        const role = this.getUserRole();
        const booking = this.bookings.find(b => b.id === bookingId);
        
        if (!booking) return;

        // Check permissions
        if (role !== 'owner' && booking.userId !== this.currentUser.id) {
            this.showNotification('Vous ne pouvez pas modifier cette réservation', 'error');
            return;
        }

        // Show edit modal
        this.showEditBookingModal(booking);
    }

    // Show edit booking modal
    showEditBookingModal(booking) {
        const modal = document.createElement('div');
        modal.className = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Modifier la réservation</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="edit-booking-form">
                        <input type="hidden" name="bookingId" value="${booking.id}">
                        
                        <div class="booking-info">
                            <p><strong>Réservation actuelle:</strong></p>
                            <p>${this.simulators[booking.simulatorId].name}</p>
                            <p>${booking.date} à ${booking.time} (${booking.duration}h)</p>
                        </div>
                        
                        <div class="form-group">
                            <label>Nouvelle date</label>
                            <input type="date" name="newDate" required 
                                   value="${booking.date}"
                                   min="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="form-group">
                            <label>Nouvelle heure</label>
                            <select name="newTime" required id="new-time-select">
                                <option value="${booking.time}" selected>${booking.time}</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Nouvelle durée</label>
                            <select name="newDuration" required>
                                <option value="1" ${booking.duration == 1 ? 'selected' : ''}>1 heure</option>
                                <option value="2" ${booking.duration == 2 ? 'selected' : ''}>2 heures</option>
                                <option value="3" ${booking.duration == 3 ? 'selected' : ''}>3 heures</option>
                            </select>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Mettre à jour</button>
                            <button type="button" class="btn-secondary close-modal-btn">Annuler</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Show modal
        setTimeout(() => modal.classList.add('show'), 100);

        // Update available time slots
        this.updateAvailableTimeSlots(booking.simulatorId, booking.date);

        // Setup event listeners
        this.setupEditModalEventListeners(modal, booking);
    }

    // Setup edit modal event listeners
    setupEditModalEventListeners(modal, booking) {
        // Close modal
        modal.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal(modal);
        });
        
        modal.querySelector('.close-modal-btn').addEventListener('click', () => {
            this.closeModal(modal);
        });

        // Date change
        const dateInput = modal.querySelector('input[name="newDate"]');
        dateInput.addEventListener('change', (e) => {
            this.updateAvailableTimeSlots(booking.simulatorId, e.target.value);
        });

        // Form submission
        const form = modal.querySelector('.edit-booking-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditBookingSubmit(form, modal);
        });
    }

    // Handle edit booking submission
    handleEditBookingSubmit(form, modal) {
        const formData = new FormData(form);
        const bookingId = formData.get('bookingId');
        const booking = this.bookings.find(b => b.id === bookingId);
        
        if (!booking) return;

        // Create updated booking
        const updatedBooking = {
            ...booking,
            date: formData.get('newDate'),
            time: formData.get('newTime'),
            duration: parseInt(formData.get('newDuration')),
            modifiedAt: new Date().toISOString(),
            modifiedBy: this.currentUser.id
        };

        // Validate new booking
        if (!this.validateBooking(updatedBooking)) {
            return;
        }

        // Update booking
        const index = this.bookings.findIndex(b => b.id === bookingId);
        this.bookings[index] = updatedBooking;
        
        this.saveBookingsToStorage();
        this.renderBookings();
        
        this.closeModal(modal);
        this.showNotification('Réservation mise à jour avec succès!', 'success');
    }

    // Render bookings
    renderBookings() {
        const bookingsContainer = document.getElementById('bookings-list');
        if (!bookingsContainer) return;

        const role = this.getUserRole();
        let bookingsToShow = this.bookings;

        // Filter bookings based on role
        if (role === 'owner') {
            // Owners see all bookings
        } else if (this.currentUser) {
            // Other users see only their bookings
            bookingsToShow = this.bookings.filter(b => b.userId === this.currentUser.id);
        } else {
            bookingsToShow = [];
        }

        if (bookingsToShow.length === 0) {
            bookingsContainer.innerHTML = '<p>Aucune réservation trouvée</p>';
            return;
        }

        bookingsContainer.innerHTML = bookingsToShow.map(booking => {
            const simulator = this.simulators[booking.simulatorId];
            const canEdit = role === 'owner' || booking.userId === this.currentUser.id;
            
            return `
                <div class="booking-item ${booking.status}">
                    <div class="booking-info">
                        <h4>${simulator.name}</h4>
                        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Heure:</strong> ${booking.time} (${booking.duration}h)</p>
                        <p><strong>Client:</strong> ${booking.userName}</p>
                        <p><strong>Email:</strong> ${booking.userEmail}</p>
                        <p><strong>Prix:</strong> ${simulator.price * booking.duration}€</p>
                        <span class="status ${booking.status}">${this.getStatusText(booking.status)}</span>
                    </div>
                    <div class="booking-actions">
                        ${canEdit ? `
                            <button class="edit-booking-btn" data-booking-id="${booking.id}">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="cancel-booking-btn" data-booking-id="${booking.id}">
                                <i class="fas fa-times"></i> Annuler
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Get status text
    getStatusText(status) {
        const statusTexts = {
            'confirmed': 'Confirmé',
            'cancelled': 'Annulé',
            'completed': 'Terminé'
        };
        return statusTexts[status] || status;
    }

    // Close modal
    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    // Load bookings from storage
    loadBookingsFromStorage() {
        const savedBookings = localStorage.getItem('advanced_bookings');
        return savedBookings ? JSON.parse(savedBookings) : [];
    }

    // Save bookings to storage
    saveBookingsToStorage() {
        localStorage.setItem('advanced_bookings', JSON.stringify(this.bookings));
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Export for use in other files
window.AdvancedBookingSystem = AdvancedBookingSystem;

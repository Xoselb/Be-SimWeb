// Configuration
const STORAGE_KEY = 'userReservations';
const OPENING_HOUR = 10; // 10:00 AM
const CLOSING_HOUR = 22; // 10:00 PM
const SATURDAY = 6; // JavaScript's getDay() returns 6 for Saturday
const TIME_SLOT_INTERVAL = 30; // minutes

// DOM Elements
let newReservationBtn;
let reservationModal;
let closeModalBtn;
let cancelReservationBtn;
let reservationForm;
let reservationsList;
let reservationTimeSelect;
let reservationDateInput;
let simulatorTypeSelect;
let durationSelect;

// Initialize the application
function initReservations() {
    // Get DOM elements
    newReservationBtn = document.getElementById('newReservationBtn');
    reservationModal = document.getElementById('reservationModal');
    closeModalBtn = document.querySelector('.close-modal');
    cancelReservationBtn = document.getElementById('cancelReservationBtn');
    reservationForm = document.getElementById('reservationForm');
    reservationsList = document.getElementById('reservationsList');
    reservationTimeSelect = document.getElementById('reservationTime');
    reservationDateInput = document.getElementById('reservationDate');
    simulatorTypeSelect = document.getElementById('simulatorType');
    durationSelect = document.getElementById('duration');

    // Set minimum date to today
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    reservationDateInput.min = `${yyyy}-${mm}-${dd}`;

    // Set default date to today
    reservationDateInput.value = `${yyyy}-${mm}-${dd}`;

    // Event listeners
    newReservationBtn.addEventListener('click', openReservationModal);
    closeModalBtn.addEventListener('click', closeReservationModal);
    cancelReservationBtn.addEventListener('click', closeReservationModal);
    reservationForm.addEventListener('submit', handleReservationSubmit);
    
    // Update time slots when date or duration changes
    reservationDateInput.addEventListener('change', updateTimeSlots);
    durationSelect.addEventListener('change', updateTimeSlots);
    simulatorTypeSelect.addEventListener('change', updateTimeSlots);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === reservationModal) {
            closeReservationModal();
        }
    });

    // Load and display reservations
    displayReservations();
}

// Open reservation modal
function openReservationModal() {
    // Reset form
    reservationForm.reset();
    
    // Set default values
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    reservationDateInput.value = `${yyyy}-${mm}-${dd}`;
    
    // Update time slots
    updateTimeSlots();
    
    // Show modal
    reservationModal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Set focus on first form element
    simulatorTypeSelect.focus();
}

// Close reservation modal
function closeReservationModal() {
    reservationModal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset form validation
    reservationForm.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
}

// Update available time slots based on selected date and duration
function updateTimeSlots() {
    const date = new Date(reservationDateInput.value);
    const day = date.getDay();
    const duration = parseInt(durationSelect.value);
    const simulatorType = simulatorTypeSelect.value;
    
    // Clear existing options
    reservationTimeSelect.innerHTML = '<option value="">Sélectionnez une heure</option>';
    
    if (!simulatorType) {
        reservationTimeSelect.disabled = true;
        return;
    }
    
    // Check if the selected date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
        reservationTimeSelect.innerHTML = '<option value="">Date invalide</option>';
        reservationTimeSelect.disabled = true;
        return;
    }
    
    // Get existing reservations for the selected date and simulator
    const reservations = getReservations();
    const dateStr = formatDate(date);
    const dateReservations = reservations.filter(r => 
        r.date === dateStr && r.simulator === simulatorType
    );
    
    // Generate time slots
    const timeSlots = generateTimeSlots(date, duration, dateReservations);
    
    // Add time slots to select
    if (timeSlots.length === 0) {
        reservationTimeSelect.innerHTML = '<option value="">Aucun créneau disponible</option>';
    } else {
        timeSlots.forEach(slot => {
            const option = document.createElement('option');
            option.value = slot;
            option.textContent = slot;
            reservationTimeSelect.appendChild(option);
        });
    }
    
    reservationTimeSelect.disabled = false;
}

// Generate available time slots
function generateTimeSlots(date, duration, existingReservations) {
    const slots = [];
    const day = date.getDay();
    const isWeekend = day === 0 || day === SATURDAY;
    
    // Opening hours
    let openHour = isWeekend ? OPENING_HOUR : OPENING_HOUR;
    let closeHour = isWeekend ? CLOSING_HOUR : CLOSING_HOUR;
    
    // Current time
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    // Start time for today (current time + 1 hour)
    let startHour = isToday ? now.getHours() + 1 : openHour;
    startHour = Math.max(startHour, openHour);
    
    // End time (closing hour minus duration in hours)
    const endHour = closeHour - Math.ceil(duration / 60);
    
    // Generate time slots
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += TIME_SLOT_INTERVAL) {
            // Skip if the slot would go past closing time
            const endTime = new Date(date);
            endTime.setHours(hour, minute + duration, 0, 0);
            
            const closingTime = new Date(date);
            closingTime.setHours(closeHour, 0, 0, 0);
            
            if (endTime > closingTime) continue;
            
            // Format time
            const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            
            // Check for conflicts with existing reservations
            const slotStart = new Date(date);
            slotStart.setHours(hour, minute, 0, 0);
            
            const slotEnd = new Date(slotStart.getTime() + duration * 60000);
            
            const hasConflict = existingReservations.some(reservation => {
                const resStart = new Date(`${reservation.date}T${reservation.time}`);
                const resEnd = new Date(resStart.getTime() + reservation.duration * 60000);
                
                return (
                    (slotStart >= resStart && slotStart < resEnd) ||
                    (slotEnd > resStart && slotEnd <= resEnd) ||
                    (slotStart <= resStart && slotEnd >= resEnd)
                );
            });
            
            if (!hasConflict) {
                slots.push(timeStr);
            }
        }
    }
    
    return slots;
}

// Handle form submission
function handleReservationSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const simulator = simulatorTypeSelect.value;
    const date = reservationDateInput.value;
    const time = reservationTimeSelect.value;
    const duration = parseInt(durationSelect.value);
    
    // Validate form
    if (!simulator || !date || !time || !duration) {
        showNotification('Veuillez remplir tous les champs', 'error');
        return;
    }
    
    // Check if user has VIP access for VIP simulators
    const isVipSimulator = simulatorTypeSelect.options[simulatorTypeSelect.selectedIndex].dataset.vip === 'true';
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    if (isVipSimulator && (!user || !user.isVip)) {
        showNotification('Accès VIP requis pour ce simulateur', 'error');
        return;
    }
    
    // Create reservation object
    const reservation = {
        id: Date.now().toString(),
        simulator,
        date,
        time,
        duration,
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    // Save reservation
    saveReservation(reservation);
    
    // Show success message
    showNotification('Réservation effectuée avec succès !', 'success');
    
    // Close modal and update display
    closeReservationModal();
    displayReservations();
}

// Save reservation to local storage
function saveReservation(reservation) {
    const reservations = getReservations();
    reservations.push(reservation);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
}

// Get all reservations from local storage
function getReservations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

// Display reservations in the UI
function displayReservations() {
    const reservations = getReservations();
    
    // Sort by date and time (newest first)
    reservations.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });
    
    // Clear existing content
    reservationsList.innerHTML = '';
    
    if (reservations.length === 0) {
        // Show empty state
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-calendar-plus"></i>
            <h3>Aucune réservation</h3>
            <p>Vous n'avez pas encore de réservation.</p>
            <button id="newReservationEmptyBtn" class="btn btn-primary">
                <i class="fas fa-plus"></i> Nouvelle Réservation
            </button>
        `;
        reservationsList.appendChild(emptyState);
        
        // Add event listener to the new reservation button in empty state
        document.getElementById('newReservationEmptyBtn')?.addEventListener('click', openReservationModal);
        return;
    }
    
    // Group reservations by date
    const reservationsByDate = groupBy(reservations, 'date');
    
    // Create HTML for each date group
    for (const [date, dateReservations] of Object.entries(reservationsByDate)) {
        const dateHeader = document.createElement('h3');
        dateHeader.className = 'reservation-date';
        dateHeader.textContent = formatDisplayDate(date);
        reservationsList.appendChild(dateHeader);
        
        // Create a container for this date's reservations
        const dateContainer = document.createElement('div');
        dateContainer.className = 'reservations-date-group';
        
        // Add each reservation
        dateReservations.forEach(reservation => {
            const reservationElement = createReservationElement(reservation);
            dateContainer.appendChild(reservationElement);
        });
        
        reservationsList.appendChild(dateContainer);
    }
}

// Create HTML for a single reservation
function createReservationElement(reservation) {
    const element = document.createElement('div');
    element.className = 'reservation-card';
    element.dataset.id = reservation.id;
    
    // Format date and time
    const startTime = reservation.time;
    const endTime = calculateEndTime(reservation.time, reservation.duration);
    const date = new Date(reservation.date);
    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    const dayNumber = date.getDate();
    const month = date.toLocaleDateString('fr-FR', { month: 'long' });
    
    // Get simulator name
    const simulatorNames = {
        'f1': 'Formule 1 (Standard)',
        'gt3': 'GT3 (Standard)',
        'f1_vip': 'F1 Pro (VIP)',
        'gt3_vip': 'GT3 Pro (VIP)',
        'rallye': 'Rallye',
        'f1_2023': 'F1 2023'
    };
    
    const simulatorName = simulatorNames[reservation.simulator] || reservation.simulator;
    
    element.innerHTML = `
        <div class="reservation-header">
            <span class="reservation-simulator">${simulatorName}</span>
            <span class="reservation-status ${reservation.status}">${formatStatus(reservation.status)}</span>
        </div>
        <div class="reservation-body">
            <div class="reservation-detail">
                <span>Date</span>
                <span>${dayName} ${dayNumber} ${month}</span>
            </div>
            <div class="reservation-detail">
                <span>Heure</span>
                <span>${startTime} - ${endTime}</span>
            </div>
            <div class="reservation-detail">
                <span>Durée</span>
                <span>${formatDuration(reservation.duration)}</span>
            </div>
        </div>
        <div class="reservation-actions">
            <button class="btn btn-danger btn-cancel" data-id="${reservation.id}">
                <i class="fas fa-times"></i> Annuler
            </button>
        </div>
    `;
    
    // Add event listener to cancel button
    element.querySelector('.btn-cancel').addEventListener('click', (e) => {
        e.stopPropagation();
        cancelReservation(reservation.id);
    });
    
    return element;
}

// Cancel a reservation
function cancelReservation(reservationId) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
        return;
    }
    
    const reservations = getReservations();
    const updatedReservations = reservations.filter(r => r.id !== reservationId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReservations));
    showNotification('Réservation annulée', 'success');
    displayReservations();
}

// Helper function to group array of objects by a property
function groupBy(array, property) {
    return array.reduce((result, item) => {
        const key = item[property];
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
}

// Format date as YYYY-MM-DD
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Format date for display (e.g., "Lundi 15 janvier")
function formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Aujourd\'hui';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Demain';
    } else {
        return date.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    }
}

// Format duration in minutes to human-readable format
function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
        return `${minutes} min`;
    } else if (mins === 0) {
        return `${hours} h`;
    } else {
        return `${hours} h ${mins} min`;
    }
}

// Calculate end time based on start time and duration
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().substring(0, 5);
}

// Format status for display
function formatStatus(status) {
    const statusMap = {
        'pending': 'En attente',
        'confirmed': 'Confirmée',
        'cancelled': 'Annulée',
        'completed': 'Terminée'
    };
    
    return statusMap[status] || status;
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Hide after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// Make initReservations available globally
window.initReservations = initReservations;
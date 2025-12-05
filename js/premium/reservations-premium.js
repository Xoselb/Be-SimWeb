// Configuration and constants
const CONFIG = {
  STORAGE_KEY: 'ebReservations',
  API_ENDPOINT: '/api/reservations',
  OPENING_HOUR: 10,
  CLOSING_HOUR: 22,
  TIME_SLOT_INTERVAL: 30,
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 5000,
  PARTICLE_COUNT: 50
};

// Pricing configuration
const PRICING = {
  normal: { base: 40 },
  vip: { base: 75 }
};

// State management
class ReservationManager {
  constructor() {
    this.reservations = [];
    this.filteredReservations = [];
    this.currentView = 'grid';
    this.filters = {
      status: 'all',
      simulator: 'all',
      period: 'all',
      search: ''
    };
    this.selectedSimulator = null;
    this.user = null;
    this.isLoading = false;
    this.particles = [];
  }

  // Initialize the application
  async init() {
    try {
      await this.loadUser();
      await this.loadReservations();
      this.initializeUI();
      this.bindEvents();
      this.startAnimations();
      this.updateStats();
      console.log('Premium reservations dashboard initialized');
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      this.showNotification('Erreur lors du chargement du tableau de bord', 'error');
    }
  }

  // Load user data
  async loadUser() {
    try {
      const userData = localStorage.getItem('currentUser');
      console.log('Loading user data:', userData ? 'Found' : 'Not found');
      
      if (userData) {
        this.user = JSON.parse(userData);
        console.log('User loaded:', this.user);
        this.renderUserMenu();
      } else {
        console.log('No user found, checking for demo mode...');
        // For demo purposes, create a demo user if none exists
        const demoUser = {
          id: 'demo-user',
          name: 'Utilisateur Demo',
          email: 'demo@ebsimracing.com',
          isVip: true,
          avatar: '/assets/images/default-avatar.png'
        };
        
        // Only create demo user in development/local environment
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          console.log('Creating demo user for development');
          this.user = demoUser;
          localStorage.setItem('currentUser', JSON.stringify(demoUser));
          this.renderUserMenu();
        } else {
          // Redirect to login if not authenticated and not in demo mode
          console.log('Redirecting to login...');
          window.location.href = '../auth/login.html';
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      window.location.href = '../auth/login.html';
    }
  }

  // Render user menu in header
  renderUserMenu() {
    const userSection = document.getElementById('userSection');
    if (!userSection || !this.user) return;

    userSection.innerHTML = `
      <div class="user-menu">
        <div class="user-avatar-wrapper" id="userMenuBtn">
          <img src="${this.user.avatar || '/assets/images/default-avatar.png'}" 
               alt="Avatar" class="user-avatar">
          <div class="user-status-indicator ${this.user.isVip ? 'vip' : 'standard'}"></div>
        </div>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-info">
            <div class="user-name">${this.user.name || 'Utilisateur'}</div>
            <div class="user-email">${this.user.email || ''}</div>
            <div class="user-membership ${this.user.isVip ? 'vip' : 'standard'}">
              ${this.user.isVip ? '<i class="fas fa-crown"></i> Membre VIP' : 'Membre Standard'}
            </div>
          </div>
          <div class="user-nav">
            <a href="perfil.html" class="user-nav-item">
              <i class="fas fa-user"></i> Mon Profil
            </a>
            <a href="mes-reservations.html" class="user-nav-item active">
              <i class="fas fa-calendar-alt"></i> Mes Réservations
            </a>
            <a href="../../shop/cart.html" class="user-nav-item">
              <i class="fas fa-shopping-cart"></i> Mon Panier
            </a>
            <a href="parametres.html" class="user-nav-item">
              <i class="fas fa-cog"></i> Paramètres
            </a>
            <div class="user-divider"></div>
            <a href="#" id="logoutBtn" class="user-nav-item logout">
              <i class="fas fa-sign-out-alt"></i> Déconnexion
            </a>
          </div>
        </div>
      </div>
    `;

    // Bind user menu events
    this.bindUserMenuEvents();
  }

  // Load reservations from storage or API
  async loadReservations() {
    this.isLoading = true;
    this.showLoadingState();

    try {
      // Try to load from localStorage first
      const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (stored) {
        this.reservations = JSON.parse(stored);
      } else {
        // Initialize with sample data for demo
        this.reservations = this.generateSampleReservations();
        this.saveReservations();
      }

      this.filteredReservations = [...this.reservations];
      this.renderReservations();
      this.updateStats();
    } catch (error) {
      console.error('Failed to load reservations:', error);
      this.showNotification('Erreur lors du chargement des réservations', 'error');
    } finally {
      this.isLoading = false;
      this.hideLoadingState();
    }
  }

  // Generate sample reservations for demo
  generateSampleReservations() {
    const now = new Date();
    const sampleReservations = [];

    // Upcoming reservation - normal simulator
    const upcomingDate = new Date(now);
    upcomingDate.setDate(now.getDate() + 2);
    sampleReservations.push({
      id: '1',
      simulator: 'normal',
      simulatorId: '3',
      date: this.formatDate(upcomingDate),
      time: '14:00',
      duration: 90,
      status: 'confirmed',
      participants: 2,
      specialRequests: 'Session avec coaching',
      price: 60,
      createdAt: now.toISOString()
    });

    // Today's reservation - VIP simulator
    sampleReservations.push({
      id: '2',
      simulator: 'vip',
      simulatorId: '10',
      date: this.formatDate(now),
      time: '16:00',
      duration: 60,
      status: 'confirmed',
      participants: 1,
      price: 75,
      createdAt: now.toISOString()
    });

    // Completed reservation - normal simulator
    const completedDate = new Date(now);
    completedDate.setDate(now.getDate() - 7);
    sampleReservations.push({
      id: '3',
      simulator: 'normal',
      simulatorId: '1',
      date: this.formatDate(completedDate),
      time: '10:00',
      duration: 120,
      status: 'completed',
      participants: 1,
      price: 80,
      createdAt: completedDate.toISOString()
    });

    return sampleReservations;
  }

  // Initialize UI components
  initializeUI() {
    // Set minimum date for reservation
    const dateInput = document.getElementById('reservationDate');
    if (dateInput) {
      const today = new Date();
      const minDate = today.toISOString().split('T')[0];
      dateInput.min = minDate;
      dateInput.value = minDate;
    }

    // Initialize view toggle
    this.initializeViewToggle();

    // Initialize filters
    this.initializeFilters();

    // Initialize modal
    this.initializeModal();

    // Initialize search
    this.initializeSearch();

    // Initialize particles
    this.initializeParticles();
  }

  // Bind all event listeners
  bindEvents() {
    // New reservation button
    const newBtn = document.getElementById('newReservationBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => this.openReservationModal());
    }

    // Calendar view button
    const calendarBtn = document.getElementById('calendarViewBtn');
    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => this.toggleCalendarView());
    }

    // Empty state button
    const emptyBtn = document.getElementById('emptyStateNewBtn');
    if (emptyBtn) {
      emptyBtn.addEventListener('click', () => this.openReservationModal());
    }

    // Form submission
    const form = document.getElementById('reservationForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleReservationSubmit(e));
    }

    // Simulator card selection
    this.bindSimulatorCards();

    // Price calculation
    this.bindPriceCalculation();

    // Time slot updates
    this.bindTimeSlotUpdates();
  }

  // Bind user menu events
  bindUserMenuEvents() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
      });

      document.addEventListener('click', () => {
        userDropdown.classList.remove('show');
      });

      userDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  // Initialize view toggle
  initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.switchView(view);
        
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // Switch between grid and list view
  switchView(view) {
    this.currentView = view;
    const grid = document.getElementById('reservationsGrid');
    
    if (view === 'list') {
      grid.classList.add('list-view');
    } else {
      grid.classList.remove('list-view');
    }
    
    this.renderReservations();
  }

  // Initialize filters
  initializeFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const simulatorFilter = document.getElementById('simulatorFilter');
    const periodFilter = document.getElementById('periodFilter');
    const resetBtn = document.getElementById('resetFiltersBtn');

    [statusFilter, simulatorFilter, periodFilter].forEach(filter => {
      if (filter) {
        filter.addEventListener('change', () => this.applyFilters());
      }
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetFilters());
    }
  }

  // Apply filters to reservations
  applyFilters() {
    const statusFilter = document.getElementById('statusFilter');
    const simulatorFilter = document.getElementById('simulatorFilter');
    const periodFilter = document.getElementById('periodFilter');
    const searchInput = document.getElementById('searchInput');

    this.filters.status = statusFilter?.value || 'all';
    this.filters.simulator = simulatorFilter?.value || 'all';
    this.filters.period = periodFilter?.value || 'all';
    this.filters.search = searchInput?.value || '';

    this.filteredReservations = this.reservations.filter(reservation => {
      // Status filter
      if (this.filters.status !== 'all' && reservation.status !== this.filters.status) {
        return false;
      }

      // Simulator filter
      if (this.filters.simulator !== 'all' && reservation.simulator !== this.filters.simulator) {
        return false;
      }

      // Period filter
      if (this.filters.period !== 'all' && !this.matchesPeriodFilter(reservation)) {
        return false;
      }

      // Search filter
      if (this.filters.search && !this.matchesSearch(reservation)) {
        return false;
      }

      return true;
    });

    this.renderReservations();
  }

  // Check if reservation matches period filter
  matchesPeriodFilter(reservation) {
    const reservationDate = new Date(reservation.date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (this.filters.period) {
      case 'today':
        return reservationDate.toDateString() === today.toDateString();
      case 'week':
        const weekFromNow = new Date(today);
        weekFromNow.setDate(today.getDate() + 7);
        return reservationDate >= today && reservationDate <= weekFromNow;
      case 'month':
        return reservationDate.getMonth() === now.getMonth() && 
               reservationDate.getFullYear() === now.getFullYear();
      case 'future':
        return reservationDate >= today;
      default:
        return true;
    }
  }

  // Check if reservation matches search
  matchesSearch(reservation) {
    const search = this.filters.search.toLowerCase();
    const simulatorName = reservation.simulator === 'vip' ? 
      'simulateur vip' : 
      `simulateur ${reservation.simulatorId}`;
    
    return simulatorName.toLowerCase().includes(search) ||
           reservation.status.toLowerCase().includes(search) ||
           reservation.date.includes(search);
  }

  // Reset all filters
  resetFilters() {
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('simulatorFilter').value = 'all';
    document.getElementById('periodFilter').value = 'all';
    document.getElementById('searchInput').value = '';

    this.filters = {
      status: 'all',
      simulator: 'all',
      period: 'all',
      search: ''
    };

    this.filteredReservations = [...this.reservations];
    this.renderReservations();
  }

  // Initialize search functionality
  initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => this.applyFilters(), 300);
      });
    }
  }

  // Render reservations in the grid
  renderReservations() {
    const grid = document.getElementById('reservationsGrid');
    const emptyState = document.getElementById('emptyState');

    if (!grid) return;

    if (this.filteredReservations.length === 0) {
      grid.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    emptyState.style.display = 'none';

    // Sort reservations by date and time
    const sortedReservations = [...this.filteredReservations].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });

    grid.innerHTML = sortedReservations.map(reservation => 
      this.createReservationCard(reservation)
    ).join('');

    // Bind card events
    this.bindCardEvents();
  }

  // Create reservation card HTML
  createReservationCard(reservation) {
    const getSimulatorName = (type, id) => {
      if (type === 'vip') return 'Simulateur VIP';
      return `Simulateur ${id}`;
    };

    const simulatorName = getSimulatorName(reservation.simulator, reservation.simulatorId);
    const endTime = this.calculateEndTime(reservation.time, reservation.duration);
    const isVip = reservation.simulator === 'vip';

    return `
      <div class="reservation-card ${isVip ? 'vip' : ''}" data-id="${reservation.id}">
        <div class="reservation-header">
          <div class="reservation-simulator">
            ${isVip ? '<i class="fas fa-crown vip-icon"></i>' : ''}
            ${simulatorName}
          </div>
          <div class="reservation-status ${reservation.status}">
            ${this.formatStatus(reservation.status)}
          </div>
        </div>
        <div class="reservation-body">
          <div class="reservation-detail">
            <span><i class="fas fa-calendar"></i> Date</span>
            <span>${this.formatDisplayDate(reservation.date)}</span>
          </div>
          <div class="reservation-detail">
            <span><i class="fas fa-clock"></i> Heure</span>
            <span>${reservation.time} - ${endTime}</span>
          </div>
          <div class="reservation-detail">
            <span><i class="fas fa-hourglass-half"></i> Durée</span>
            <span>${this.formatDuration(reservation.duration)}</span>
          </div>
          <div class="reservation-detail">
            <span><i class="fas fa-users"></i> Participants</span>
            <span>${reservation.participants || 1}</span>
          </div>
          ${reservation.price ? `
            <div class="reservation-detail price">
              <span><i class="fas fa-tag"></i> Prix</span>
              <span>${reservation.price.toFixed(2)}€</span>
            </div>
          ` : ''}
        </div>
        <div class="reservation-actions">
          ${reservation.status === 'confirmed' ? `
            <button class="btn-edit" data-id="${reservation.id}">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="btn-cancel" data-id="${reservation.id}">
              <i class="fas fa-times"></i> Annuler
            </button>
          ` : ''}
          ${reservation.status === 'completed' ? `
            <button class="btn-rebook" data-id="${reservation.id}">
              <i class="fas fa-redo"></i> Réserver à nouveau
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Bind card events
  bindCardEvents() {
    // Edit buttons
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-edit').dataset.id;
        this.editReservation(id);
      });
    });

    // Cancel buttons
    document.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-cancel').dataset.id;
        this.cancelReservation(id);
      });
    });

    // Rebook buttons
    document.querySelectorAll('.btn-rebook').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.btn-rebook').dataset.id;
        this.rebookReservation(id);
      });
    });
  }

  // Update statistics
  updateStats() {
    const totalEl = document.getElementById('totalReservations');
    const upcomingEl = document.getElementById('upcomingReservations');
    const completedEl = document.getElementById('completedSessions');

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const total = this.reservations.length;
    const upcoming = this.reservations.filter(r => {
      const reservationDate = new Date(r.date);
      return reservationDate >= today && r.status === 'confirmed';
    }).length;
    const completed = this.reservations.filter(r => r.status === 'completed').length;

    this.animateNumber(totalEl, total);
    this.animateNumber(upcomingEl, upcoming);
    this.animateNumber(completedEl, completed);
  }

  // Animate number counting
  animateNumber(element, target) {
    if (!element) return;
    
    const duration = 1000;
    const start = parseInt(element.textContent) || 0;
    const increment = (target - start) / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.round(current);
      }
    }, 16);
  }

  // Initialize modal
  initializeModal() {
    const modal = document.getElementById('reservationModal');
    const closeBtn = document.getElementById('modalClose');
    const cancelBtn = document.getElementById('cancelBtn');
    const backdrop = document.getElementById('modalBackdrop');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeReservationModal());
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.closeReservationModal());
    }

    if (backdrop) {
      backdrop.addEventListener('click', () => this.closeReservationModal());
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        this.closeReservationModal();
      }
    });
  }

  // Open reservation modal
  openReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (!modal) return;

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Reset form
    const form = document.getElementById('reservationForm');
    if (form) {
      form.reset();
      this.selectedSimulator = null;
      this.updatePriceSummary();
    }

    // Focus first element
    const firstInput = modal.querySelector('input, select, button');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  // Close reservation modal
  closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    if (!modal) return;

    modal.classList.remove('show');
    document.body.style.overflow = '';
    
    // Reset simulator selection
    document.querySelectorAll('.simulator-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  // Bind simulator card selection
  bindSimulatorCards() {
    document.querySelectorAll('.simulator-card').forEach(card => {
      card.addEventListener('click', () => {
        // Remove previous selection
        document.querySelectorAll('.simulator-card').forEach(c => {
          c.classList.remove('selected');
        });

        // Add selection to clicked card
        card.classList.add('selected');
        
        // Update hidden input with simulator type and ID
        const simulatorType = card.dataset.simulator;
        const simulatorId = card.dataset.id;
        this.selectedSimulator = simulatorType;
        this.selectedSimulatorId = simulatorId;
        
        // Store both type and ID
        document.getElementById('simulatorType').value = JSON.stringify({
          type: simulatorType,
          id: simulatorId
        });

        // Check VIP access
        if (simulatorType === 'vip' && !this.user?.isVip) {
          this.showNotification('Accès VIP requis pour ce simulateur', 'warning');
          card.classList.remove('selected');
          this.selectedSimulator = null;
          this.selectedSimulatorId = null;
          document.getElementById('simulatorType').value = '';
          return;
        }

        // Update time slots
        this.updateTimeSlots();
        
        // Update price
        this.updatePriceSummary();
      });
    });
  }

  // Bind price calculation
  bindPriceCalculation() {
    const duration = document.getElementById('duration');
    const participants = document.getElementById('participants');

    [duration, participants].forEach(element => {
      if (element) {
        element.addEventListener('change', () => this.updatePriceSummary());
      }
    });
  }

  // Update price summary
  updatePriceSummary() {
    const basePriceEl = document.getElementById('basePrice');
    const durationPriceEl = document.getElementById('durationPrice');
    const discountRowEl = document.getElementById('discountRow');
    const discountAmountEl = document.getElementById('discountAmount');
    const totalPriceEl = document.getElementById('totalPrice');

    if (!this.selectedSimulator) {
      basePriceEl.textContent = '0€';
      durationPriceEl.textContent = '0€';
      discountRowEl.style.display = 'none';
      totalPriceEl.textContent = '0€';
      return;
    }

    const duration = parseInt(document.getElementById('duration')?.value || 60);
    const participants = parseInt(document.getElementById('participants')?.value || 1);
    
    let basePrice = PRICING[this.selectedSimulator]?.base || 40;
    const durationMultiplier = duration / 60;
    const participantMultiplier = participants;
    let totalPrice = basePrice * durationMultiplier * participantMultiplier;

    // Apply VIP discount
    let discount = 0;
    if (this.user?.isVip && this.selectedSimulator !== 'vip') {
      discount = totalPrice * 0.1; // 10% VIP discount
      totalPrice -= discount;
      discountRowEl.style.display = 'flex';
      discountAmountEl.textContent = `-${discount.toFixed(2)}€`;
    } else {
      discountRowEl.style.display = 'none';
    }

    basePriceEl.textContent = `${basePrice.toFixed(2)}€`;
    durationPriceEl.textContent = `${(basePrice * durationMultiplier).toFixed(2)}€`;
    totalPriceEl.textContent = `${totalPrice.toFixed(2)}€`;
  }

  // Bind time slot updates
  bindTimeSlotUpdates() {
    const dateInput = document.getElementById('reservationDate');
    const durationSelect = document.getElementById('duration');

    [dateInput, durationSelect].forEach(element => {
      if (element) {
        element.addEventListener('change', () => this.updateTimeSlots());
      }
    });
  }

  // Update available time slots
  updateTimeSlots() {
    const dateInput = document.getElementById('reservationDate');
    const timeSelect = document.getElementById('reservationTime');
    const duration = parseInt(document.getElementById('duration')?.value || 60);

    if (!dateInput?.value || !this.selectedSimulator) {
      timeSelect.innerHTML = '<option value="">Sélectionnez une date et un simulateur</option>';
      return;
    }

    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      timeSelect.innerHTML = '<option value="">Date invalide</option>';
      return;
    }

    // Generate available time slots
    const timeSlots = this.generateTimeSlots(selectedDate, duration);
    
    timeSelect.innerHTML = '<option value="">Sélectionnez une heure</option>';
    timeSlots.forEach(slot => {
      const option = document.createElement('option');
      option.value = slot;
      option.textContent = slot;
      timeSelect.appendChild(option);
    });
  }

  // Generate time slots for a date
  generateTimeSlots(date, duration) {
    const slots = [];
    const day = date.getDay();
    const isWeekend = day === 0 || day === 6;
    
    const openHour = CONFIG.OPENING_HOUR;
    const closeHour = CONFIG.CLOSING_HOUR;
    
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    let startHour = isToday ? now.getHours() + 1 : openHour;
    startHour = Math.max(startHour, openHour);
    
    const endHour = closeHour - Math.ceil(duration / 60);

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += CONFIG.TIME_SLOT_INTERVAL) {
        const endTime = new Date(date);
        endTime.setHours(hour, minute + duration, 0, 0);
        
        const closingTime = new Date(date);
        closingTime.setHours(closeHour, 0, 0, 0);
        
        if (endTime > closingTime) continue;
        
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        // Check for conflicts with existing reservations
        const hasConflict = this.reservations.some(reservation => {
          if (reservation.date !== this.formatDate(date) || 
              reservation.simulator !== this.selectedSimulator ||
              reservation.status === 'cancelled') {
            return false;
          }

          const resStart = new Date(`${reservation.date}T${reservation.time}`);
          const resEnd = new Date(resStart.getTime() + reservation.duration * 60000);
          
          const slotStart = new Date(date);
          slotStart.setHours(hour, minute, 0, 0);
          
          const slotEnd = new Date(slotStart.getTime() + duration * 60000);
          
          return (slotStart >= resStart && slotStart < resEnd) ||
                 (slotEnd > resStart && slotEnd <= resEnd) ||
                 (slotStart <= resStart && slotEnd >= resEnd);
        });
        
        if (!hasConflict) {
          slots.push(timeStr);
        }
      }
    }
    
    return slots;
  }

  // Handle reservation form submission
  async handleReservationSubmit(e) {
    e.preventDefault();
    
    if (!this.selectedSimulator) {
      this.showNotification('Veuillez sélectionner un simulateur', 'error');
      return;
    }

    const formData = new FormData(e.target);
    let simulatorData;
    
    try {
      simulatorData = JSON.parse(formData.get('simulator'));
    } catch {
      simulatorData = {
        type: this.selectedSimulator,
        id: this.selectedSimulatorId || 'unknown'
      };
    }

    const reservation = {
      id: Date.now().toString(),
      simulator: simulatorData.type,
      simulatorId: simulatorData.id,
      date: formData.get('date'),
      time: formData.get('time'),
      duration: parseInt(formData.get('duration')),
      participants: parseInt(formData.get('participants')),
      specialRequests: formData.get('specialRequests'),
      status: 'confirmed',
      price: this.calculatePrice(),
      createdAt: new Date().toISOString()
    };

    try {
      this.reservations.push(reservation);
      this.saveReservations();
      this.closeReservationModal();
      this.applyFilters();
      this.updateStats();
      this.showNotification('Réservation effectuée avec succès!', 'success');
    } catch (error) {
      console.error('Failed to create reservation:', error);
      this.showNotification('Erreur lors de la création de la réservation', 'error');
    }
  }

  // Calculate reservation price
  calculatePrice() {
    const duration = parseInt(document.getElementById('duration')?.value || 60);
    const participants = parseInt(document.getElementById('participants')?.value || 1);
    
    let basePrice = PRICING[this.selectedSimulator]?.base || 40;
    const durationMultiplier = duration / 60;
    let totalPrice = basePrice * durationMultiplier * participants;

    // Apply VIP discount
    if (this.user?.isVip && !this.selectedSimulator.includes('vip')) {
      totalPrice *= 0.9; // 10% discount
    }

    return totalPrice;
  }

  // Edit reservation
  editReservation(id) {
    const reservation = this.reservations.find(r => r.id === id);
    if (!reservation) return;

    // Populate form with reservation data
    this.selectedSimulator = reservation.simulator;
    document.getElementById('simulatorType').value = reservation.simulator;
    document.getElementById('reservationDate').value = reservation.date;
    document.getElementById('duration').value = reservation.duration;
    document.getElementById('participants').value = reservation.participants;
    document.getElementById('specialRequests').value = reservation.specialRequests || '';

    // Select simulator card
    document.querySelectorAll('.simulator-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.simulator === reservation.simulator);
    });

    // Update time slots and price
    this.updateTimeSlots();
    this.updatePriceSummary();

    // Set time
    setTimeout(() => {
      const timeSelect = document.getElementById('reservationTime');
      if (timeSelect) {
        timeSelect.value = reservation.time;
      }
    }, 100);

    this.openReservationModal();
  }

  // Cancel reservation
  async cancelReservation(id) {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
      return;
    }

    try {
      const reservation = this.reservations.find(r => r.id === id);
      if (reservation) {
        reservation.status = 'cancelled';
        this.saveReservations();
        this.applyFilters();
        this.updateStats();
        this.showNotification('Réservation annulée avec succès', 'success');
      }
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      this.showNotification('Erreur lors de l\'annulation', 'error');
    }
  }

  // Rebook reservation
  rebookReservation(id) {
    const reservation = this.reservations.find(r => r.id === id);
    if (!reservation) return;

    // Create new reservation based on the old one
    this.selectedSimulator = reservation.simulator;
    document.getElementById('simulatorType').value = reservation.simulator;
    document.getElementById('duration').value = reservation.duration;
    document.getElementById('participants').value = reservation.participants;
    document.getElementById('specialRequests').value = reservation.specialRequests || '';

    // Select simulator card
    document.querySelectorAll('.simulator-card').forEach(card => {
      card.classList.toggle('selected', card.dataset.simulator === reservation.simulator);
    });

    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservationDate').value = today;

    this.updateTimeSlots();
    this.updatePriceSummary();
    this.openReservationModal();
  }

  // Toggle calendar view (placeholder for future implementation)
  toggleCalendarView() {
    this.showNotification('Vue calendrier bientôt disponible', 'info');
  }

  // Save reservations to storage
  saveReservations() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.reservations));
  }

  // Show loading state
  showLoadingState() {
    const grid = document.getElementById('reservationsGrid');
    if (grid) {
      grid.innerHTML = `
        <div class="loading-state">
          <div class="loading-spinner"></div>
          <p>Chargement de vos réservations...</p>
        </div>
      `;
    }
  }

  // Hide loading state
  hideLoadingState() {
    // Loading state is hidden when reservations are rendered
  }

  // Show notification
  showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');
    const notificationIcon = notification.querySelector('.notification-icon i');

    if (!notification || !notificationText) return;

    // Set message
    notificationText.textContent = message;

    // Set icon and color based on type
    const iconClasses = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle'
    };

    const bgColors = {
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)',
      info: 'var(--info)'
    };

    notificationIcon.className = iconClasses[type] || iconClasses.success;
    notification.querySelector('.notification-icon').style.background = `${bgColors[type] || bgColors.success}20`;
    notificationIcon.style.color = bgColors[type] || bgColors.success;

    // Show notification
    notification.classList.add('show');

    // Hide after delay
    setTimeout(() => {
      notification.classList.remove('show');
    }, CONFIG.NOTIFICATION_DURATION);
  }

  // Initialize particles animation
  initializeParticles() {
    const container = document.getElementById('heroParticles');
    if (!container) return;

    for (let i = 0; i < CONFIG.PARTICLE_COUNT; i++) {
      this.createParticle(container);
    }
  }

  // Create a single particle
  createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 1}px;
      height: ${Math.random() * 4 + 1}px;
      background: rgba(255, 242, 0, ${Math.random() * 0.5 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float ${Math.random() * 10 + 10}s linear infinite;
    `;

    container.appendChild(particle);
    this.particles.push(particle);
  }

  // Start animations
  startAnimations() {
    // Add floating animation to particles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0% { transform: translateY(0px) translateX(0px); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
      }
      
      .particle {
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Logout user
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    window.location.href = '../../auth/login.html';
  }

  // Utility methods
  formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDisplayDate(dateStr) {
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

  formatDuration(minutes) {
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

  formatStatus(status) {
    const statusMap = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      cancelled: 'Annulée',
      completed: 'Terminée'
    };
    
    return statusMap[status] || status;
  }

  calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate.getTime() + duration * 60000);
    return endDate.toTimeString().substring(0, 5);
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing reservations dashboard...');
  
  // Prevent any automatic redirects during initialization
  window.addEventListener('beforeunload', (e) => {
    console.log('Preventing automatic redirect during initialization');
    e.preventDefault();
    e.returnValue = '';
  });
  
  try {
    // Check if enhanced manager is available, use it instead
    const ManagerClass = window.EnhancedReservationManager || ReservationManager;
    console.log('Using manager class:', ManagerClass.name);
    
    const reservationManager = new ManagerClass();
    reservationManager.init().then(() => {
      console.log('Dashboard initialized successfully');
      // Remove the beforeunload listener after successful initialization
      window.removeEventListener('beforeunload', this);
    }).catch(error => {
      console.error('Failed to initialize dashboard:', error);
    });

    // Make it globally available for debugging
    window.reservationManager = reservationManager;
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReservationManager;
}

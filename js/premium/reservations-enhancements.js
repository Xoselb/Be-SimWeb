// Enhanced reservation manager with additional premium features
class EnhancedReservationManager extends ReservationManager {
  constructor() {
    super();
    this.calendarView = false;
    this.selectedDate = null;
    this.analytics = null;
    this.fabOpen = false;
    this.detailsPanel = null;
  }

  // Initialize enhanced features
  async init() {
    await super.init();
    this.initializeEnhancedFeatures();
    this.loadAnalytics();
    this.initializeCalendar();
    this.initializeFAB();
    this.initializeDetailsPanel();
  }

  // Initialize enhanced UI components
  initializeEnhancedFeatures() {
    this.addAnalyticsSection();
    this.addAdvancedSearch();
    this.addQuickStats();
  }

  // Add analytics section to dashboard
  addAnalyticsSection() {
    const dashboard = document.querySelector('.premium-dashboard');
    if (!dashboard) return;

    const analyticsHTML = `
      <div class="analytics-container">
        <h2 style="color: var(--text-primary); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-md);">
          <i class="fas fa-chart-line" style="color: var(--primary-gold);"></i>
          Analytics & Statistiques
        </h2>
        <div class="chart-container">
          <div class="chart-bars" id="chartBars">
            <!-- Chart bars will be generated dynamically -->
          </div>
        </div>
        <div class="progress-stats">
          <div class="progress-ring">
            <svg width="120" height="120">
              <circle class="progress-ring-circle" 
                      stroke="rgba(255, 242, 0, 0.2)" 
                      stroke-width="8" 
                      fill="transparent" 
                      r="52" 
                      cx="60" 
                      cy="60"/>
              <circle class="progress-ring-circle" 
                      id="progressCircle"
                      stroke="var(--primary-gold)" 
                      stroke-width="8" 
                      fill="transparent" 
                      r="52" 
                      cx="60" 
                      cy="60"
                      stroke-dasharray="326.73"
                      stroke-dashoffset="326.73"/>
            </svg>
          </div>
          <span class="progress-value" id="progressValue">0%</span>
          <span class="progress-label">Taux de complétion</span>
        </div>
      </div>
    `;

    // Insert after filters section
    const filters = document.querySelector('.premium-filters');
    if (filters) {
      filters.insertAdjacentHTML('afterend', analyticsHTML);
    }
  }

  // Add advanced search functionality
  addAdvancedSearch() {
    const dashboard = document.querySelector('.premium-dashboard');
    if (!dashboard) return;

    const searchHTML = `
      <div class="advanced-search">
        <h3 style="color: var(--text-primary); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-md);">
          <i class="fas fa-search-plus" style="color: var(--primary-gold);"></i>
          Recherche Avancée
        </h3>
        <div class="search-filters-row">
          <div class="search-input-group">
            <i class="fas fa-search"></i>
            <input type="text" id="advancedSearchInput" placeholder="Rechercher par simulateur, date, statut...">
          </div>
          <div class="date-range-picker">
            <input type="date" id="dateFrom" placeholder="Du">
            <span style="color: var(--text-secondary);">au</span>
            <input type="date" id="dateTo" placeholder="Au">
          </div>
        </div>
      </div>
    `;

    // Insert before filters
    const filters = document.querySelector('.premium-filters');
    if (filters) {
      filters.insertAdjacentHTML('beforebegin', searchHTML);
      this.bindAdvancedSearch();
    }
  }

  // Add quick stats cards
  addQuickStats() {
    const heroStats = document.querySelector('.hero-stats');
    if (!heroStats) return;

    const additionalStats = `
      <div class="stat-item">
        <span class="stat-number" id="totalRevenue">0€</span>
        <span class="stat-label">Revenus Totaux</span>
      </div>
      <div class="stat-item">
        <span class="stat-number" id="avgSessionTime">0h</span>
        <span class="stat-label">Durée Moyenne</span>
      </div>
    `;

    heroStats.insertAdjacentHTML('beforeend', additionalStats);
  }

  // Load and display analytics
  loadAnalytics() {
    this.updateChart();
    this.updateProgressRing();
    this.updateQuickStats();
  }

  // Update chart with reservation data
  updateChart() {
    const chartBars = document.getElementById('chartBars');
    if (!chartBars) return;

    // Generate last 7 days data
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const data = this.generateChartData();

    chartBars.innerHTML = days.map((day, index) => `
      <div class="chart-bar" style="height: ${data[index]}%;" data-value="${data[index]}">
        <span class="chart-bar-label">${day}</span>
        <span class="chart-bar-value">${data[index]}%</span>
      </div>
    `).join('');
  }

  // Generate chart data
  generateChartData() {
    // Simulate data for demonstration
    return Array.from({ length: 7 }, () => Math.floor(Math.random() * 80) + 20);
  }

  // Update progress ring
  updateProgressRing() {
    const progressCircle = document.getElementById('progressCircle');
    const progressValue = document.getElementById('progressValue');
    
    if (!progressCircle || !progressValue) return;

    const completed = this.reservations.filter(r => r.status === 'completed').length;
    const total = this.reservations.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (percentage / 100) * circumference;

    progressCircle.style.strokeDashoffset = offset;
    progressValue.textContent = `${percentage}%`;
  }

  // Update quick statistics
  updateQuickStats() {
    const revenueEl = document.getElementById('totalRevenue');
    const avgTimeEl = document.getElementById('avgSessionTime');

    if (revenueEl) {
      const totalRevenue = this.reservations
        .filter(r => r.status !== 'cancelled')
        .reduce((sum, r) => sum + (r.price || 0), 0);
      this.animateNumber(revenueEl, totalRevenue, '€');
    }

    if (avgTimeEl) {
      const completedReservations = this.reservations.filter(r => r.status === 'completed');
      if (completedReservations.length > 0) {
        const avgMinutes = completedReservations.reduce((sum, r) => sum + r.duration, 0) / completedReservations.length;
        const hours = Math.floor(avgMinutes / 60);
        const minutes = Math.round(avgMinutes % 60);
        avgTimeEl.textContent = minutes > 0 ? `${hours}h${minutes}` : `${hours}h`;
      }
    }
  }

  // Initialize calendar view
  initializeCalendar() {
    const calendarBtn = document.getElementById('calendarViewBtn');
    if (calendarBtn) {
      calendarBtn.addEventListener('click', () => this.toggleCalendarView());
    }
  }

  // Toggle calendar view
  toggleCalendarView() {
    this.calendarView = !this.calendarView;
    
    if (this.calendarView) {
      this.showCalendarView();
    } else {
      this.hideCalendarView();
    }
  }

  // Show calendar view
  showCalendarView() {
    const grid = document.getElementById('reservationsGrid');
    if (!grid) return;

    const calendarHTML = `
      <div class="calendar-container">
        <div class="calendar-header">
          <h2 style="color: var(--text-primary);">Vue Calendrier</h2>
          <div class="calendar-nav">
            <button id="prevMonth"><i class="fas fa-chevron-left"></i></button>
            <span id="currentMonth" style="color: var(--text-primary); font-weight: 600;">Décembre 2025</span>
            <button id="nextMonth"><i class="fas fa-chevron-right"></i></button>
          </div>
        </div>
        <div class="calendar-grid" id="calendarGrid">
          <!-- Calendar will be generated here -->
        </div>
      </div>
    `;

    grid.innerHTML = calendarHTML;
    this.generateCalendar();
    this.bindCalendarEvents();
  }

  // Hide calendar view
  hideCalendarView() {
    this.renderReservations();
  }

  // Generate calendar
  generateCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Add weekday headers
    let calendarHTML = weekdays.map(day => 
      `<div class="calendar-weekday">${day}</div>`
    ).join('');

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Add empty cells for days before month starts
    const startDay = firstDay.getDay() || 7;
    for (let i = 1; i < startDay; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = this.formatDate(date);
      const isToday = date.toDateString() === today.toDateString();
      const reservations = this.reservations.filter(r => r.date === dateStr);
      
      let classes = 'calendar-day';
      if (isToday) classes += ' today';
      if (reservations.length > 0) classes += ' has-reservation';

      calendarHTML += `
        <div class="${classes}" data-date="${dateStr}">
          <span class="calendar-day-number">${day}</span>
          ${reservations.length > 0 ? `<span class="calendar-day-reservation-count">${reservations.length}</span>` : ''}
        </div>
      `;
    }

    calendarGrid.innerHTML = calendarHTML;
  }

  // Bind calendar events
  bindCalendarEvents() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const calendarDays = document.querySelectorAll('.calendar-day:not(.empty)');

    prevBtn?.addEventListener('click', () => this.navigateCalendar(-1));
    nextBtn?.addEventListener('click', () => this.navigateCalendar(1));

    calendarDays.forEach(day => {
      day.addEventListener('click', () => {
        const date = day.dataset.date;
        this.showDateReservations(date);
      });
    });
  }

  // Navigate calendar months
  navigateCalendar(direction) {
    // Implementation for month navigation
    console.log('Navigate calendar:', direction);
  }

  // Show reservations for specific date
  showDateReservations(date) {
    const dateReservations = this.reservations.filter(r => r.date === date);
    console.log('Reservations for', date, dateReservations);
    // Could show in modal or details panel
  }

  // Initialize floating action button
  initializeFAB() {
    const fabHTML = `
      <div class="quick-actions-fab">
        <div class="fab-menu" id="fabMenu">
          <div class="fab-item" data-action="export">
            <i class="fas fa-download"></i>
            <span class="fab-tooltip">Exporter les données</span>
          </div>
          <div class="fab-item" data-action="print">
            <i class="fas fa-print"></i>
            <span class="fab-tooltip">Imprimer</span>
          </div>
          <div class="fab-item" data-action="refresh">
            <i class="fas fa-sync-alt"></i>
            <span class="fab-tooltip">Actualiser</span>
          </div>
        </div>
        <button class="fab-main" id="fabMain">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', fabHTML);
    this.bindFABEvents();
  }

  // Bind FAB events
  bindFABEvents() {
    const fabMain = document.getElementById('fabMain');
    const fabMenu = document.getElementById('fabMenu');
    const fabItems = document.querySelectorAll('.fab-item');

    fabMain?.addEventListener('click', () => {
      this.fabOpen = !this.fabOpen;
      fabMain.classList.toggle('active', this.fabOpen);
      fabMenu.classList.toggle('show', this.fabOpen);
    });

    fabItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleFABAction(action);
      });
    });
  }

  // Handle FAB actions
  handleFABAction(action) {
    switch (action) {
      case 'export':
        this.exportReservations();
        break;
      case 'print':
        this.printReservations();
        break;
      case 'refresh':
        this.refreshData();
        break;
    }
  }

  // Export reservations data
  exportReservations() {
    const data = {
      reservations: this.reservations,
      exportDate: new Date().toISOString(),
      user: this.user
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.showNotification('Données exportées avec succès', 'success');
  }

  // Print reservations
  printReservations() {
    window.print();
    this.showNotification('Impression lancée', 'info');
  }

  // Refresh data
  async refreshData() {
    await this.loadReservations();
    this.loadAnalytics();
    this.showNotification('Données actualisées', 'success');
  }

  // Initialize details panel
  initializeDetailsPanel() {
    const panelHTML = `
      <div class="reservation-details-panel" id="detailsPanel">
        <div class="panel-header">
          <h2 class="panel-title">Détails de la Réservation</h2>
          <button class="panel-close" id="panelClose">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="panel-content" id="panelContent">
          <!-- Details will be populated dynamically -->
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
    this.bindDetailsPanelEvents();
  }

  // Bind details panel events
  bindDetailsPanelEvents() {
    const panelClose = document.getElementById('panelClose');
    const panel = document.getElementById('detailsPanel');

    panelClose?.addEventListener('click', () => {
      panel.classList.remove('show');
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('show')) {
        panel.classList.remove('show');
      }
    });
  }

  // Show reservation details
  showReservationDetails(reservationId) {
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (!reservation) return;

    const panel = document.getElementById('detailsPanel');
    const panelContent = document.getElementById('panelContent');

    const detailsHTML = `
      <div class="detail-section">
        <h3><i class="fas fa-info-circle"></i> Informations Générales</h3>
        <div class="detail-item">
          <span class="detail-label">ID Réservation</span>
          <span class="detail-value">#${reservation.id}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Statut</span>
          <span class="detail-value">${this.formatStatus(reservation.status)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Date de création</span>
          <span class="detail-value">${new Date(reservation.createdAt).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div class="detail-section">
        <h3><i class="fas fa-car"></i> Détails de la Session</h3>
        <div class="detail-item">
          <span class="detail-label">Simulateur</span>
          <span class="detail-value">${this.getSimulatorName(reservation.simulator)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Date</span>
          <span class="detail-value">${this.formatDisplayDate(reservation.date)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Heure</span>
          <span class="detail-value">${reservation.time} - ${this.calculateEndTime(reservation.time, reservation.duration)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Durée</span>
          <span class="detail-value">${this.formatDuration(reservation.duration)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Participants</span>
          <span class="detail-value">${reservation.participants || 1}</span>
        </div>
      </div>

      ${reservation.price ? `
        <div class="detail-section">
          <h3><i class="fas fa-tag"></i> Tarification</h3>
          <div class="detail-item">
            <span class="detail-label">Prix total</span>
            <span class="detail-value" style="color: var(--primary-gold);">${reservation.price.toFixed(2)}€</span>
          </div>
        </div>
      ` : ''}

      ${reservation.specialRequests ? `
        <div class="detail-section">
          <h3><i class="fas fa-comment"></i> Demandes Spéciales</h3>
          <p style="color: var(--text-secondary); line-height: 1.6;">${reservation.specialRequests}</p>
        </div>
      ` : ''}

      <div class="detail-section">
        <h3><i class="fas fa-tools"></i> Actions</h3>
        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
          ${reservation.status === 'confirmed' ? `
            <button class="premium-btn primary" onclick="reservationManager.editReservation('${reservation.id}')">
              <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="premium-btn outline" onclick="reservationManager.cancelReservation('${reservation.id}')">
              <i class="fas fa-times"></i> Annuler
            </button>
          ` : ''}
          ${reservation.status === 'completed' ? `
            <button class="premium-btn primary" onclick="reservationManager.rebookReservation('${reservation.id}')">
              <i class="fas fa-redo"></i> Réserver à nouveau
            </button>
          ` : ''}
        </div>
      </div>
    `;

    panelContent.innerHTML = detailsHTML;
    panel.classList.add('show');
  }

  // Get simulator name
  getSimulatorName(simulator) {
    const names = {
      f1: 'Formule 1',
      gt3: 'GT3',
      rallye: 'Rallye',
      f1_vip: 'F1 Pro (VIP)',
      gt3_vip: 'GT3 Pro (VIP)'
    };
    return names[simulator] || simulator;
  }

  // Bind advanced search events
  bindAdvancedSearch() {
    const searchInput = document.getElementById('advancedSearchInput');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    let searchTimeout;
    searchInput?.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.performAdvancedSearch(), 300);
    });

    [dateFrom, dateTo].forEach(input => {
      input?.addEventListener('change', () => this.performAdvancedSearch());
    });
  }

  // Perform advanced search
  performAdvancedSearch() {
    const searchInput = document.getElementById('advancedSearchInput');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');

    const searchTerm = searchInput?.value.toLowerCase() || '';
    const fromDate = dateFrom?.value;
    const toDate = dateTo?.value;

    this.filteredReservations = this.reservations.filter(reservation => {
      // Search term filter
      if (searchTerm && !this.matchesAdvancedSearch(reservation, searchTerm)) {
        return false;
      }

      // Date range filter
      if (fromDate && reservation.date < fromDate) {
        return false;
      }
      if (toDate && reservation.date > toDate) {
        return false;
      }

      return true;
    });

    this.renderReservations();
  }

  // Check if reservation matches advanced search
  matchesAdvancedSearch(reservation, searchTerm) {
    const simulatorName = this.getSimulatorName(reservation.simulator).toLowerCase();
    const status = this.formatStatus(reservation.status).toLowerCase();
    const date = this.formatDisplayDate(reservation.date).toLowerCase();

    return simulatorName.includes(searchTerm) ||
           status.includes(searchTerm) ||
           date.includes(searchTerm) ||
           reservation.id.includes(searchTerm);
  }

  // Enhanced card click handler
  bindCardEvents() {
    super.bindCardEvents();
    
    // Add click to show details
    document.querySelectorAll('.reservation-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't trigger if clicking on action buttons
        if (e.target.closest('.reservation-actions')) return;
        
        const id = card.dataset.id;
        this.showReservationDetails(id);
      });
    });
  }
}

// Enhanced initialization will be handled by the main file
// This prevents conflicts and ensures proper loading order

// Make EnhancedReservationManager globally available
window.EnhancedReservationManager = EnhancedReservationManager;

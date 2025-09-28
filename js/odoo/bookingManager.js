import OdooService from './odooService.js';

class BookingManager {
    constructor() {
        this.bookingForm = document.getElementById('booking-form');
        this.modal = document.getElementById('booking-modal');
        this.initializeEventListeners();
        this.initializeModal();
    }

    initializeEventListeners() {
        // Prevenir el comportamiento predeterminado de los botones de reserva
        document.querySelectorAll('a[href*="#contact"], .reserve-btn').forEach(button => {
            button.addEventListener('click', (e) => this.handleReserveButtonClick(e, button));
        });

        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));
        }

        // Inicializar selectores de fecha
        this.initializeDatePickers();
    }

    initializeModal() {
        // Configurar el botón de cierre del modal
        const closeBtn = this.modal?.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeBookingModal());
        }
        
        // Cerrar al hacer clic fuera del modal
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeBookingModal();
                }
            });
        }
    }

    async handleReserveButtonClick(event, button) {
        event.preventDefault();
        event.stopPropagation();
        
        // Obtener información del vehículo
        const card = button.closest('.car-card');
        if (card) {
            const vehicleName = card.querySelector('h3')?.textContent.trim() || 'Vehículo';
            const vehicleId = card.id || 'default-vehicle';
            this.openBookingModal(vehicleName, vehicleId);
        } else {
            this.openBookingModal('Vehículo', 'default-vehicle');
        }
    }

    initializeDatePickers() {
        // Inicializar datepickers (usando flatpickr como ejemplo)
        if (window.flatpickr) {
            flatpickr("input[type='date']", {
                minDate: 'today',
                dateFormat: 'Y-m-d',
                disable: [
                    function(date) {
                        // Deshabilitar días no disponibles
                        // Implementar lógica de disponibilidad
                        return false;
                    }
                ]
            });
        }
    }

    openBookingModal(vehicleName, vehicleId) {
        console.log('Abriendo modal para:', vehicleName, vehicleId);
        const modal = document.getElementById('booking-modal');
        const vehicleDisplay = document.getElementById('vehicle-display');
        const vehicleInput = document.getElementById('selected-vehicle');
        
        if (modal) {
            if (vehicleDisplay && vehicleInput) {
                vehicleDisplay.value = vehicleName;
                vehicleInput.value = vehicleId;
            }
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            console.log('Modal mostrado');
        } else {
            console.error('No se encontró el elemento #booking-modal');
        }
    }
    
    closeBookingModal() {
        const modal = document.getElementById('booking-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }
    
    async handleBookingSubmit(event) {
        event.preventDefault();
        
        try {
            // Validar formulario
            if (!this.bookingForm.checkValidity()) {
                event.stopPropagation();
                this.bookingForm.classList.add('was-validated');
                return;
            }

            const formData = new FormData(this.bookingForm);
            const bookingData = this.prepareBookingData(formData);
            
            // Validar datos
            const validationResult = this.validateBookingData(bookingData);
            if (!validationResult.isValid) {
                this.showError(validationResult.message);
                return;
            }

            // Mostrar indicador de carga
            this.showLoading(true);

            // Crear líneas de pedido
            const orderLines = this.createOrderLines(bookingData);

            // Crear orden en Odoo
            const order = await OdooService.createOrder(bookingData, orderLines);
            
            if (order) {
                this.showSuccess('¡Reserva realizada con éxito!');
                this.bookingForm.reset();
                this.closeBookingModal();
                // Opcional: Redirigir a página de confirmación
                // window.location.href = `/reserva-confirmada.html?order=${order.id}`;
            }
        } catch (error) {
            console.error('Error al procesar la reserva:', error);
            this.showError('Error al procesar la reserva. Por favor, inténtalo de nuevo.');
        } finally {
            this.showLoading(false);
        }
    }

    prepareBookingData(formData) {
        const packageOption = document.querySelector('input[name="package"]:checked')?.closest('.package-option');
        
        return {
            name: formData.get('name')?.trim(),
            email: formData.get('email')?.trim().toLowerCase(),
            phone: formData.get('phone')?.trim(),
            date: formData.get('date'),
            time: formData.get('time'),
            vehicle: formData.get('vehicle'),
            vehicle_name: document.getElementById('vehicle-display')?.value || 'Vehículo',
            package: formData.get('package'),
            payment_method: formData.get('payment-method'),
            notes: formData.get('notes')?.trim(),
            package_name: packageOption?.querySelector('.package-name')?.textContent?.trim() || '',
            package_price: packageOption?.querySelector('.package-price')?.textContent?.trim() || ''
        };
    }

    validateBookingData(data) {
        // Validar campos requeridos
        const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'vehicle', 'package', 'payment_method'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            return {
                isValid: false,
                message: 'Por favor, completa todos los campos obligatorios.'
            };
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            return {
                isValid: false,
                message: 'Por favor, introduce un correo electrónico válido.'
            };
        }

        // Validar fecha futura
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            return {
                isValid: false,
                message: 'Por favor, selecciona una fecha futura.'
            };
        }

        return { isValid: true };
    }

    createOrderLines(bookingData) {
        return [
            [0, 0, {
                'product_id': this.getProductId(bookingData.vehicle, bookingData.package),
                'name': `${bookingData.vehicle_name} - ${this.getPackageName(bookingData.package)}`,
                'product_uom_qty': 1,
                'price_unit': this.calculatePrice(bookingData.vehicle, bookingData.package)
            }]
        ];
    }

    getProductId(vehicleId, packageType) {
        // Mapear vehículo y paquete a IDs de producto en Odoo
        // Esto debe coincidir con tu catálogo en Odoo
        const productMap = {
            // Mapeo de vehículos
            'c1': {
                'basic': 1,
                'premium': 2
            },
            'funcup': {
                'basic': 3,
                'premium': 4
            },
            'porsche-718': {
                'basic': 5,
                'premium': 6
            }
        };
        
        return productMap[vehicleId]?.[packageType] || 1;
    }

    getPackageName(packageType) {
        const packages = {
            'basic': 'Básico (30 min)',
            'premium': 'Premium (1h + instructor)'
        };
        return packages[packageType] || 'Paquete Estándar';
    }

    calculatePrice(vehicleId, packageType) {
        // Precios por vehículo y paquete
        const prices = {
            'c1': { 
                'basic': 199, 
                'premium': 349 
            },
            'funcup': { 
                'basic': 249, 
                'premium': 449 
            },
            'porsche-718': { 
                'basic': 349, 
                'premium': 599 
            }
        };

        return prices[vehicleId]?.[packageType] || 0;
    }

    showLoading(show) {
        const loader = document.getElementById('loading-indicator');
        const submitButton = this.bookingForm?.querySelector('button[type="submit"]');
        
        if (loader) {
            loader.style.display = show ? 'flex' : 'none';
        }
        
        if (submitButton) {
            submitButton.disabled = show;
            submitButton.innerHTML = show 
                ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...' 
                : 'Confirmar reserva';
        }
    }

    showError(message) {
        // Eliminar mensajes anteriores
        this.clearMessages();
        
        // Crear elemento de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger mt-3';
        errorDiv.role = 'alert';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
        `;
        
        // Insertar antes del botón de envío
        const submitButton = this.bookingForm?.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.parentNode.insertBefore(errorDiv, submitButton);
        } else {
            this.bookingForm?.appendChild(errorDiv);
        }
        
        // Hacer scroll al mensaje
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showSuccess(message) {
        // Limpiar el formulario
        this.bookingForm?.reset();
        this.bookingForm?.classList.remove('was-validated');
        
        // Mostrar mensaje de éxito
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success mt-3';
        successDiv.role = 'alert';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
        `;
        
        // Insertar después del formulario
        this.bookingForm?.parentNode.insertBefore(successDiv, this.bookingForm.nextSibling);
        
        // Hacer scroll al mensaje
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    clearMessages() {
        // Eliminar mensajes anteriores
        const existingAlerts = this.bookingForm?.parentNode.querySelectorAll('.alert');
        existingAlerts?.forEach(alert => alert.remove());
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.bookingManager = new BookingManager();
        console.log('BookingManager inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar BookingManager:', error);
    }
});

export default BookingManager;

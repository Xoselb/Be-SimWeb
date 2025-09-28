class PaymentManager {
    constructor() {
        this.form = document.getElementById('payment-form');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        if (this.form) {
            this.form.addEventListener('submit', this.handlePaymentSubmit.bind(this));
        }
    }
    
    async handlePaymentSubmit(event) {
        event.preventDefault();
        
        const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;
        const params = new URLSearchParams(window.location.search);
        
        // Obtener datos del formulario
        const paymentData = {
            name: params.get('nombre'),
            email: params.get('email'),
            phone: params.get('telefono'),
            date: params.get('fecha_reserva'),
            vehicle: params.get('vehiculo'),
            package: params.get('paquete'),
            price: params.get('precio'),
            payment_method: paymentMethod,
            notes: params.get('notas') || ''
        };
        
        // Validar datos de pago según el método seleccionado
        if (paymentMethod === 'card') {
            paymentData.card_number = document.getElementById('card-number').value;
            paymentData.card_name = document.getElementById('card-name').value;
            paymentData.card_expiry = document.getElementById('expiry-date').value;
            paymentData.card_cvv = document.getElementById('cvv').value;
            
            if (!this.validateCardData(paymentData)) {
                return;
            }
        }
        
        // Mostrar carga
        this.showLoading(true);
        
        try {
            // Enviar datos a Odoo
            const response = await this.sendToOdoo(paymentData);
            
            if (response.success) {
                // Redirigir a página de confirmación
                window.location.href = `confirmacion.html?order_id=${response.order_id}`;
            } else {
                throw new Error(response.message || 'Error al procesar el pago');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al procesar el pago: ' + error.message);
            this.showLoading(false);
        }
    }
    
    validateCardData(data) {
        // Validar número de tarjeta (solo formato básico)
        const cardNumber = data.card_number.replace(/\s+/g, '');
        if (!/^\d{13,19}$/.test(cardNumber)) {
            alert('Por favor, introduce un número de tarjeta válido');
            return false;
        }
        
        // Validar fecha de caducidad
        if (!/^\d{2}\/\d{2}$/.test(data.card_expiry)) {
            alert('Por favor, introduce una fecha de caducidad válida (MM/AA)');
            return false;
        }
        
        // Validar CVV
        if (!/^\d{3,4}$/.test(data.card_cvv)) {
            alert('Por favor, introduce un CVV válido');
            return false;
        }
        
        return true;
    }
    
    async sendToOdoo(bookingData) {
        // URL de tu backend que se conecta a Odoo
        const odooEndpoint = 'https://tudominio.com/api/odoo/booking';
        
        try {
            const response = await fetch(odooEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookingData)
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error al enviar a Odoo:', error);
            throw error;
        }
    }
    
    showLoading(show) {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = show ? 'block' : 'none';
        }
        
        const submitButton = this.form?.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = show;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PaymentManager();
});

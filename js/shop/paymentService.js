// Payment Service - Real PayPal Integration
class PaymentService {
    constructor() {
        this.baseUrl = '/api/payments'; // For future backend integration
        this.supportedMethods = ['paypal', 'bancontact', 'card'];
        // PayPal configuration - PRODUCTION MODE
        this.paypalClientId = 'YOUR_PRODUCTION_PAYPAL_CLIENT_ID'; // Replace with your production client ID
        this.paypalEnvironment = 'production'; // Changed from 'sandbox' to 'production'
    }

    // Process payment
    async processPayment(paymentData) {
        try {
            if (paymentData.method === 'paypal') {
                return await this.processPayPalPayment(paymentData);
            } else {
                return await this.processOtherPayment(paymentData);
            }
        } catch (error) {
            console.error('Payment processing error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Process PayPal payment with real API
    async processPayPalPayment(paymentData) {
        try {
            // Load PayPal SDK if not already loaded
            await this.loadPayPalSDK();
            
            // Create PayPal order
            const paypalOrder = await paypal.Buttons({
                createOrder: async (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: paymentData.amount.toString(),
                                currency_code: 'EUR'
                            },
                            description: `Order ${paymentData.orderId} - EB Simracing`
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    // Capture the payment
                    const payment = await actions.order.capture();
                    
                    // Save payment record
                    const paymentRecord = {
                        id: payment.id,
                        orderId: paymentData.orderId,
                        amount: paymentData.amount,
                        method: 'paypal',
                        status: 'completed',
                        createdAt: new Date().toISOString(),
                        customerInfo: paymentData.customerInfo,
                        paypalDetails: payment
                    };
                    
                    this.savePaymentToStorage(paymentRecord);
                    
                    return {
                        success: true,
                        paymentId: payment.id,
                        status: 'completed',
                        redirectUrl: this.getRedirectUrl('paypal', payment.id)
                    };
                },
                onError: (err) => {
                    console.error('PayPal payment error:', err);
                    throw new Error('PayPal payment failed: ' + err.message);
                },
                onCancel: (data) => {
                    throw new Error('Payment cancelled by user');
                }
            });
            
            // Trigger PayPal checkout
            await paypalOrder.render('#paypal-button-container');
            
            // Return pending status while waiting for PayPal completion
            return {
                success: true,
                pending: true,
                message: 'Please complete payment in PayPal popup'
            };
            
        } catch (error) {
            console.error('PayPal processing error:', error);
            throw error;
        }
    }

    // Load PayPal SDK
    async loadPayPalSDK() {
        if (window.paypal) {
            return; // Already loaded
        }
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${this.paypalClientId}&currency=EUR`;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load PayPal SDK'));
            document.head.appendChild(script);
        });
    }

    // Process other payment methods (Bancontact, Card)
    async processOtherPayment(paymentData) {
        // For other methods, you would integrate with Stripe, Mollie, etc.
        // For now, keeping the existing logic but marked for real integration
        
        const payment = {
            id: this.generatePaymentId(),
            orderId: paymentData.orderId,
            amount: paymentData.amount,
            method: paymentData.method,
            status: 'processing',
            createdAt: new Date().toISOString(),
            customerInfo: paymentData.customerInfo
        };

        // Save payment to localStorage for demo purposes
        this.savePaymentToStorage(payment);

        // For production, integrate with real payment providers
        // Bancontact: Mollie API
        // Card: Stripe API
        
        return {
            success: true,
            paymentId: payment.id,
            status: payment.status,
            redirectUrl: this.getRedirectUrl(payment.method, payment.id)
        };
    }

    // Generate unique payment ID
    generatePaymentId() {
        return 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save payment to localStorage
    savePaymentToStorage(payment) {
        const payments = this.getPaymentsFromStorage();
        payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(payments));
    }

    // Get payments from localStorage
    getPaymentsFromStorage() {
        const savedPayments = localStorage.getItem('payments');
        return savedPayments ? JSON.parse(savedPayments) : [];
    }

    // Get redirect URL based on payment method
    getRedirectUrl(method, paymentId) {
        const baseUrl = window.location.origin;
        
        switch (method) {
            case 'paypal':
                return `${baseUrl}/order-confirmation.html?payment_id=${paymentId}&method=paypal`;
            case 'bancontact':
                return `${baseUrl}/order-confirmation.html?payment_id=${paymentId}&method=bancontact`;
            case 'card':
                return `${baseUrl}/order-confirmation.html?payment_id=${paymentId}&method=card`;
            default:
                return `${baseUrl}/order-confirmation.html?payment_id=${paymentId}`;
        }
    }

    // Get payment status
    async getPaymentStatus(paymentId) {
        const payments = this.getPaymentsFromStorage();
        const payment = payments.find(p => p.id === paymentId);
        
        if (!payment) {
            throw new Error('Payment not found');
        }

        return {
            id: payment.id,
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            createdAt: payment.createdAt,
            completedAt: payment.completedAt
        };
    }

    // Validate payment data
    validatePaymentData(paymentData) {
        const requiredFields = ['orderId', 'amount', 'method', 'customerInfo'];
        
        for (const field of requiredFields) {
            if (!paymentData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        if (!this.supportedMethods.includes(paymentData.method)) {
            throw new Error(`Unsupported payment method: ${paymentData.method}`);
        }

        if (paymentData.amount <= 0) {
            throw new Error('Invalid payment amount');
        }

        return true;
    }

    // Create PayPal payment (real API)
    async createPayPalPayment(paymentData) {
        return await this.processPayPalPayment(paymentData);
    }

    // Create Bancontact payment (for future integration with Mollie)
    async createBancontactPayment(paymentData) {
        // TODO: Integrate with Mollie API for Bancontact
        return this.processPayment({
            ...paymentData,
            method: 'bancontact'
        });
    }

    // Create Card payment (for future integration with Stripe)
    async createCardPayment(paymentData) {
        // TODO: Integrate with Stripe API for card payments
        return this.processPayment({
            ...paymentData,
            method: 'card'
        });
    }

    // Refund payment (for future implementation)
    async refundPayment(paymentId, reason) {
        try {
            const payments = this.getPaymentsFromStorage();
            const paymentIndex = payments.findIndex(p => p.id === paymentId);
            
            if (paymentIndex === -1) {
                throw new Error('Payment not found');
            }

            const payment = payments[paymentIndex];
            
            if (payment.status !== 'completed') {
                throw new Error('Cannot refund payment that is not completed');
            }

            // For PayPal refunds, you would use PayPal API
            if (payment.method === 'paypal' && payment.paypalDetails) {
                // TODO: Implement PayPal refund API call
                // const refund = await paypal.captureRefund(payment.paypalDetails.id);
            }

            // Update payment status to refunded
            payments[paymentIndex].status = 'refunded';
            payments[paymentIndex].refundedAt = new Date().toISOString();
            payments[paymentIndex].refundReason = reason;
            
            localStorage.setItem('payments', JSON.stringify(payments));

            return {
                success: true,
                refundId: 'refund_' + Date.now(),
                amount: payment.amount
            };

        } catch (error) {
            console.error('Refund error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Get payment history for a customer
    getCustomerPaymentHistory(customerEmail) {
        const payments = this.getPaymentsFromStorage();
        return payments.filter(payment => 
            payment.customerInfo && payment.customerInfo.email === customerEmail
        );
    }

    // Check if PayPal SDK is loaded
    isPayPalLoaded() {
        return typeof window.paypal !== 'undefined';
    }

    // Initialize PayPal button
    async initializePayPalButton(containerId, paymentData) {
        try {
            await this.loadPayPalSDK();
            
            const buttons = paypal.Buttons({
                createOrder: async (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: paymentData.amount.toString(),
                                currency_code: 'EUR'
                            },
                            description: `Order ${paymentData.orderId} - EB Simracing`
                        }]
                    });
                },
                onApprove: async (data, actions) => {
                    const payment = await actions.order.capture();
                    return payment;
                },
                onError: (err) => {
                    console.error('PayPal button error:', err);
                    throw err;
                }
            });
            
            buttons.render(`#${containerId}`);
            return true;
        } catch (error) {
            console.error('Failed to initialize PayPal button:', error);
            return false;
        }
    }
}

// Export for use in other files
window.PaymentService = PaymentService;

class CartService {
    constructor() {
        this.baseUrl = '/api/cart';
        this.cart = [];
        this.currentUser = null;
        this.loadCartFromStorage();
        this.setupAuthListener();
    }

    // Configurar listener para cambios de autenticación
    setupAuthListener() {
        document.addEventListener('auth:login', (user) => {
            this.currentUser = user;
            this.loadCartFromServer();
        });
        
        document.addEventListener('auth:logout', () => {
            this.currentUser = null;
            this.cart = [];
            this.loadCartFromStorage();
        });
    }

    // Obtener usuario actual
    getCurrentUser() {
        if (!this.currentUser) {
            try {
                this.currentUser = window.auth && window.auth.getCurrentUser ? window.auth.getCurrentUser() : null;
            } catch (e) {
                console.log('Error obteniendo usuario:', e);
            }
        }
        return this.currentUser;
    }

    // Cargar carrito desde localStorage (para invitados)
    loadCartFromStorage() {
        const user = this.getCurrentUser();
        
        if (!user) {
            // Carrito de invitado
            const savedCart = localStorage.getItem('guest_cart');
            this.cart = savedCart ? JSON.parse(savedCart) : [];
        } else {
            // Si hay usuario, cargar desde servidor
            this.loadCartFromServer();
        }
        
        return this.cart;
    }

    // Cargar carrito desde el servidor (para usuarios autenticados)
    async loadCartFromServer() {
        const user = this.getCurrentUser();
        if (!user) return;

        try {
            // Usar localStorage en lugar de API
            const savedCart = localStorage.getItem(`cart_${user.id}`);
            this.cart = savedCart ? JSON.parse(savedCart) : [];
            console.log('✅ Carrito cargado desde localStorage:', this.cart);
            
            // Notificar a la UI
            this.notifyCartUpdate();
        } catch (error) {
            console.error('❌ Error cargando carrito:', error);
            this.cart = [];
        }
    }

    // Sincronizar carrito con el servidor
    async syncCartWithServer() {
        const user = this.getCurrentUser();
        if (!user) return;

        try {
            const response = await fetch(`${this.baseUrl}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token || 'guest-token'}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    items: this.cart
                })
            });

            if (response.ok) {
                console.log('✅ Carrito sincronizado con servidor');
            } else {
                console.error('❌ Error sincronizando carrito');
            }
        } catch (error) {
            console.error('❌ Error sincronizando con servidor:', error);
        }
    }

    // Guardar carrito
    saveCartToStorage() {
        const user = this.getCurrentUser();
        
        if (!user) {
            // Guardar carrito de invitado
            localStorage.setItem('guest_cart', JSON.stringify(this.cart));
        } else {
            // Guardar en localStorage como backup y sincronizar con servidor
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(this.cart));
            this.syncCartWithServer();
        }
        
        // Notificar a la UI
        this.notifyCartUpdate();
    }

    // Notificar cambios en el carrito
    notifyCartUpdate() {
        const event = new CustomEvent('cart:updated', {
            detail: {
                cart: this.cart,
                total: this.getTotal(),
                count: this.getItemCount()
            }
        });
        document.dispatchEvent(event);
    }

    // Añadir ítem al carrito
    async addItem(item) {
        const existingItem = this.cart.find(cartItem => 
            cartItem.id === item.id && 
            cartItem.type === item.type &&
            JSON.stringify(cartItem.options) === JSON.stringify(item.options)
        );

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            this.cart.push({
                ...item,
                quantity: item.quantity || 1,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCartToStorage();
        console.log('✅ Ítem añadido al carrito:', item);
    }

    // Eliminar ítem del carrito
    removeItem(itemId, itemOptions = {}) {
        this.cart = this.cart.filter(cartItem => 
            !(cartItem.id === itemId && 
              JSON.stringify(cartItem.options || {}) === JSON.stringify(itemOptions))
        );
        
        this.saveCartToStorage();
        console.log('✅ Ítem eliminado del carrito');
    }

    // Actualizar cantidad de ítem
    updateQuantity(itemId, quantity, itemOptions = {}) {
        const item = this.cart.find(cartItem => 
            cartItem.id === itemId && 
            JSON.stringify(cartItem.options || {}) === JSON.stringify(itemOptions)
        );
        
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId, itemOptions);
            } else {
                item.quantity = quantity;
                this.saveCartToStorage();
            }
        }
    }

    // Obtener total del carrito
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Obtener cantidad de ítems
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Limpiar carrito
    clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        console.log('✅ Carrito vaciado');
    }

    // Fusionar carrito de invitado con el del usuario
    async mergeGuestCart() {
        const user = this.getCurrentUser();
        if (!user) return;

        try {
            const guestCart = localStorage.getItem('guest_cart');
            const guestItems = guestCart ? JSON.parse(guestCart) : [];

            if (guestItems.length > 0) {
                // Añadir ítems del carrito de invitado al carrito actual
                guestItems.forEach(item => {
                    this.addItem(item);
                });

                // Limpiar carrito de invitado
                localStorage.removeItem('guest_cart');
                
                console.log('✅ Carrito de invitado fusionado');
            }
        } catch (error) {
            console.error('❌ Error fusionando carrito de invitado:', error);
        }
    }

    // Obtener carrito para checkout
    getCheckoutData() {
        const user = this.getCurrentUser();
        
        return {
            userId: user ? user.id : null,
            items: this.cart,
            total: this.getTotal(),
            itemCount: this.getItemCount(),
            timestamp: new Date().toISOString()
        };
    }

    // Procesar checkout
    async processCheckout(checkoutData) {
        try {
            const user = this.getCurrentUser();
            const response = await fetch(`${this.baseUrl}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user ? user.token : 'guest-token'}`
                },
                body: JSON.stringify({
                    ...checkoutData,
                    ...this.getCheckoutData()
                })
            });

            if (response.ok) {
                const result = await response.json();
                
                // Limpiar carrito después de checkout exitoso
                this.clearCart();
                
                console.log('✅ Checkout procesado:', result);
                return result;
            } else {
                throw new Error('Error procesando checkout');
            }
        } catch (error) {
            console.error('❌ Error en checkout:', error);
            throw error;
        }
    }
}

// Crear instancia global
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 CartService: Inicializando...');
    
    try {
        if (window.cartService) {
            console.log('🛒 CartService: Ya existe instancia');
            return;
        }
        
        window.cartService = new CartService();
        console.log('✅ CartService: Instancia creada correctamente');
        console.log('🛒 CartService: Items iniciales:', window.cartService.cart.length);
        
        // Disparar evento de inicialización
        document.dispatchEvent(new CustomEvent('cart:service-ready'));
        
    } catch (error) {
        console.error('❌ CartService: Error en inicialización:', error);
    }
});

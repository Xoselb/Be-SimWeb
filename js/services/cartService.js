class CartService {
    constructor() {
        this.baseUrl = '/api/cart';
        this.cart = [];
        this.loadCartFromStorage();
    }

    // Cargar carrito desde localStorage
    loadCartFromStorage() {
        const user = window.auth.getCurrentUser();
        const cartKey = user ? `cart_${user.id}` : 'guest_cart';
        const savedCart = localStorage.getItem(cartKey);
        this.cart = savedCart ? JSON.parse(savedCart) : [];
        return this.cart;
    }

    // Guardar carrito en localStorage
    saveCartToStorage() {
        const user = window.auth.getCurrentUser();
        const cartKey = user ? `cart_${user.id}` : 'guest_cart';
        localStorage.setItem(cartKey, JSON.stringify(this.cart));
        
        // Si el usuario está autenticado, sincronizar con el servidor
        if (user) {
            this.syncCartWithServer();
        }
    }

    // Sincronizar carrito con el servidor
    async syncCartWithServer() {
        try {
            const user = window.auth.getCurrentUser();
            if (!user) return;

            const response = await fetch(`${this.baseUrl}/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ items: this.cart })
            });

            if (!response.ok) {
                throw new Error('Error al sincronizar el carrito');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al sincronizar el carrito:', error);
            // Guardar en cola para intentar más tarde
            this.queueCartForSync();
            throw error;
        }
    }

    // Guardar en cola para sincronización posterior
    queueCartForSync() {
        const pendingSync = JSON.parse(localStorage.getItem('pending_cart_sync') || '[]');
        pendingSync.push({
            timestamp: new Date().toISOString(),
            userId: window.auth.getCurrentUser()?.id,
            items: [...this.cart]
        });
        localStorage.setItem('pending_cart_sync', JSON.stringify(pendingSync));
    }

    // Procesar la cola de sincronización
    async processSyncQueue() {
        const pendingSync = JSON.parse(localStorage.getItem('pending_cart_sync') || '[]');
        if (pendingSync.length === 0) return;

        const user = window.auth.getCurrentUser();
        if (!user) return;

        const successfulSyncs = [];
        
        for (const sync of pendingSync) {
            try {
                await this.syncCartWithServer();
                successfulSyncs.push(sync.timestamp);
            } catch (error) {
                console.error(`Error sincronizando carrito (${sync.timestamp}):`, error);
            }
        }

        // Eliminar solo las sincronizaciones exitosas
        const updatedQueue = pendingSync.filter(sync => 
            !successfulSyncs.includes(sync.timestamp)
        );
        
        localStorage.setItem('pending_cart_sync', JSON.stringify(updatedQueue));
    }

    // Cargar carrito del servidor
    async loadCartFromServer() {
        try {
            const user = window.auth.getCurrentUser();
            if (!user) return this.loadCartFromStorage();

            const response = await fetch(`${this.baseUrl}`, {
                headers: {
                    'Authorization': `Bearer ${user.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al cargar el carrito');
            }

            const data = await response.json();
            this.cart = data.items || [];
            this.saveCartToStorage();
            return this.cart;
        } catch (error) {
            console.error('Error al cargar el carrito:', error);
            return this.loadCartFromStorage();
        }
    }

    // Añadir producto al carrito
    async addItem(product, quantity = 1, options = {}) {
        const existingItemIndex = this.cart.findIndex(item => 
            item.id === product.id && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (existingItemIndex >= 0) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity,
                options,
                addedAt: new Date().toISOString()
            });
        }

        this.saveCartToStorage();
        return this.cart;
    }

    // Actualizar cantidad de un producto
    async updateQuantity(itemId, newQuantity, options = {}) {
        const itemIndex = this.cart.findIndex(item => 
            item.id === itemId && 
            JSON.stringify(item.options) === JSON.stringify(options)
        );

        if (itemIndex >= 0) {
            if (newQuantity <= 0) {
                this.cart.splice(itemIndex, 1);
            } else {
                this.cart[itemIndex].quantity = newQuantity;
            }
            this.saveCartToStorage();
        }

        return this.cart;
    }

    // Eliminar producto del carrito
    async removeItem(itemId, options = {}) {
        this.cart = this.cart.filter(item => 
            !(item.id === itemId && 
              JSON.stringify(item.options) === JSON.stringify(options))
        );
        this.saveCartToStorage();
        return this.cart;
    }

    // Vaciar el carrito
    async clearCart() {
        this.cart = [];
        this.saveCartToStorage();
        return this.cart;
    }

    // Obtener el total del carrito
    getTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Obtener la cantidad de ítems en el carrito
    getItemCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    // Fusionar carrito de invitado con el del usuario al hacer login
    async mergeGuestCart() {
        const user = window.auth.getCurrentUser();
        if (!user) return;

        const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        if (guestCart.length === 0) return;

        // Cargar carrito actual del usuario
        await this.loadCartFromServer();

        // Fusionar ítems del carrito de invitado
        for (const guestItem of guestCart) {
            await this.addItem(guestItem, guestItem.quantity, guestItem.options);
        }

        // Limpiar carrito de invitado
        localStorage.removeItem('guest_cart');
        
        // Sincronizar con el servidor
        await this.syncCartWithServer();
        
        return this.cart;
    }
}

// Crear instancia global
document.addEventListener('DOMContentLoaded', () => {
    window.cartService = new CartService();
    
    // Si el usuario está autenticado, cargar su carrito del servidor
    if (window.auth.isAuthenticated()) {
        window.cartService.loadCartFromServer();
    }
});

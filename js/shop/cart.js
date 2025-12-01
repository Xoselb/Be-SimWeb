class ShoppingCartUI {
    constructor() {
        this.cartService = window.cartService;
        this.currentUser = null;
        this.initializeEventListeners();
        this.setupAuthListeners();
        this.updateCartUI();
    }

    // Inicializar event listeners
    initializeEventListeners() {
        // Cerrar carrito
        document.addEventListener('click', (e) => {
            if (e.target.closest('.cart-icon') || e.target.closest('.cart-dropdown')) return;
            const cartDropdown = document.getElementById('cart-dropdown');
            if (cartDropdown) cartDropdown.classList.remove('show');
        });

        // Botón de checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }

        // Listener para actualizaciones del carrito
        document.addEventListener('cart:updated', (e) => {
            this.updateCartUI();
        });
    }

    // Configurar listeners para cambios de autenticación
    setupAuthListeners() {
        document.addEventListener('auth:login', (user) => {
            this.onUserLogin(user);
        });
        
        document.addEventListener('auth:logout', () => {
            this.onUserLogout();
        });

        // Verificar estado inicial de autenticación
        this.checkInitialAuthState();
    }

    // Verificar estado inicial de autenticación
    checkInitialAuthState() {
        try {
            this.currentUser = window.auth && window.auth.getCurrentUser ? window.auth.getCurrentUser() : null;
            if (this.currentUser) {
                console.log('✅ Usuario detectado:', this.currentUser.email);
                this.updateCartUI();
            }
        } catch (e) {
            console.log('Error verificando autenticación inicial:', e);
        }
    }

    // Manejar inicio de sesión de usuario
    async onUserLogin(user) {
        this.currentUser = user;
        console.log('✅ Usuario conectado:', user.email);
        
        try {
            // Fusionar carrito de invitado con el del usuario
            await this.cartService.mergeGuestCart();
            // Actualizar la UI
            this.updateCartUI();
            this.showNotification('Panier synchronisé avec votre compte', 'success');
        } catch (error) {
            console.error('Error al sincronizar carrito:', error);
            this.showNotification('Erreur lors de la synchronisation du panier', 'error');
        }
    }

    // Manejar cierre de sesión
    onUserLogout() {
        this.currentUser = null;
        console.log('✅ Usuario desconectado');
        this.updateCartUI();
        this.showNotification('Vous êtes déconnecté', 'info');
    }

    // Actualizar la interfaz del carrito
    updateCartUI() {
        const cart = this.cartService.cart;
        const cartCount = document.querySelector('.cart-count');
        const cartCountHeader = document.querySelector('.cart-count-header');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Actualizar contador
        const itemCount = this.cartService.getItemCount();
        if (cartCount) cartCount.textContent = itemCount;
        if (cartCountHeader) cartCountHeader.textContent = itemCount;

        // Actualizar total
        const total = this.cartService.getTotal();
        if (cartTotal) cartTotal.textContent = `${total.toFixed(2)} €`;

        // Actualizar items del carrito
        if (cartItems) {
            this.renderCartItems(cart);
        }

        // Actualizar estado del botón de checkout
        if (checkoutBtn) {
            checkoutBtn.disabled = cart.length === 0;
            if (cart.length === 0) {
                checkoutBtn.textContent = 'Panier vide';
            } else {
                checkoutBtn.textContent = 'Finaliser la commande';
            }
        }

        // Mostrar información del usuario en el carrito
        this.updateUserInfo();
    }

    // Actualizar información del usuario en el carrito
    updateUserInfo() {
        const userSection = document.querySelector('.cart-user-info');
        
        if (this.currentUser) {
            if (!userSection) {
                this.createUserInfoSection();
            }
            this.updateUserInfoContent();
        } else {
            if (userSection) {
                userSection.remove();
            }
        }
    }

    // Crear sección de información del usuario
    createUserInfoSection() {
        const cartDropdown = document.getElementById('cart-dropdown');
        const cartHeader = cartDropdown.querySelector('.cart-header');
        
        const userSection = document.createElement('div');
        userSection.className = 'cart-user-info';
        userSection.innerHTML = `
            <div class="user-info-content">
                <div class="user-avatar-small">
                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="Avatar">
                </div>
                <div class="user-details">
                    <div class="user-name">${this.currentUser.name || 'Usuario'}</div>
                    <div class="user-email">${this.currentUser.email}</div>
                </div>
            </div>
        `;
        
        cartHeader.appendChild(userSection);
    }

    // Actualizar contenido de información del usuario
    updateUserInfoContent() {
        const userSection = document.querySelector('.cart-user-info');
        if (userSection && this.currentUser) {
            const userName = userSection.querySelector('.user-name');
            const userEmail = userSection.querySelector('.user-email');
            
            if (userName) userName.textContent = this.currentUser.name || 'Usuario';
            if (userEmail) userEmail.textContent = this.currentUser.email;
        }
    }

    // Renderizar items del carrito
    renderCartItems(cart) {
        const cartItemsContainer = document.getElementById('cart-items');
        
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                    <a href="/pages/shop/merch.html" class="btn-secondary">Commencer vos achats</a>
                </div>
            `;
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${item.image || '/assets/images/default-product.png'}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p class="cart-item-type">${item.type || 'Produit'}</p>
                    ${item.options ? this.renderItemOptions(item.options) : ''}
                    <div class="cart-item-price">
                        <span class="price">${item.price.toFixed(2)} €</span>
                        <span class="quantity">× ${item.quantity}</span>
                    </div>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button class="btn-quantity decrease" data-item-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="btn-quantity increase" data-item-id="${item.id}">+</button>
                    </div>
                    <button class="btn-remove" data-item-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Añadir event listeners a los botones
        this.attachItemEventListeners();
    }

    // Renderizar opciones del item
    renderItemOptions(options) {
        if (!options || Object.keys(options).length === 0) return '';
        
        return `
            <div class="item-options">
                ${Object.entries(options).map(([key, value]) => 
                    `<span class="option">${key}: ${value}</span>`
                ).join('')}
            </div>
        `;
    }

    // Adjuntar event listeners a los items
    attachItemEventListeners() {
        // Botones de cantidad
        document.querySelectorAll('.btn-quantity').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = btn.dataset.itemId;
                const isIncrease = btn.classList.contains('increase');
                const item = this.cartService.cart.find(i => i.id === itemId);
                
                if (item) {
                    const newQuantity = isIncrease ? item.quantity + 1 : item.quantity - 1;
                    this.cartService.updateQuantity(itemId, newQuantity, item.options || {});
                }
            });
        });

        // Botones de eliminar
        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = btn.dataset.itemId;
                const item = this.cartService.cart.find(i => i.id === itemId);
                
                if (item && confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                    this.cartService.removeItem(itemId, item.options || {});
                }
            });
        });
    }

    // Manejar checkout
    async handleCheckout() {
        if (this.cartService.cart.length === 0) {
            this.showNotification('Votre panier est vide', 'warning');
            return;
        }

        if (!this.currentUser) {
            this.showNotification('Veuillez vous connecter pour finaliser votre commande', 'warning');
            // Redirigir al login
            setTimeout(() => {
                window.location.href = '/pages/auth/login.html';
            }, 2000);
            return;
        }

        try {
            // Redirigir a la página de checkout
            window.location.href = '/pages/shop/checkout.html';
        } catch (error) {
            console.error('Error en checkout:', error);
            this.showNotification('Erreur lors du traitement de la commande', 'error');
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'info') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close">×</button>
        `;

        // Añadir al DOM
        document.body.appendChild(notification);

        // Mostrar con animación
        setTimeout(() => notification.classList.add('show'), 100);

        // Cerrar automáticamente
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Event listener para cerrar manualmente
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        });
    }

    // Obtener ícono para notificación
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }
}

// Crear instancia global
document.addEventListener('DOMContentLoaded', () => {
    console.log('🛒 ShoppingCartUI: Inicializando...');
    
    // Esperar a que CartService esté listo
    function initializeCartUI() {
        try {
            if (!window.cartService) {
                console.log('🛒 ShoppingCartUI: Esperando CartService...');
                setTimeout(initializeCartUI, 100);
                return;
            }
            
            if (window.cartUI) {
                console.log('🛒 ShoppingCartUI: Ya existe instancia');
                return;
            }
            
            window.cartUI = new ShoppingCartUI();
            console.log('✅ ShoppingCartUI: Instancia creada correctamente');
            
            // Configurar event listener del carrito
            const cartIcon = document.getElementById('cart-icon');
            if (cartIcon) {
                cartIcon.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    const cartDropdown = document.getElementById('cart-dropdown');
                    if (cartDropdown) {
                        cartDropdown.classList.toggle('show');
                        console.log('🛒 Carrito dropdown toggled');
                    }
                });
                console.log('✅ ShoppingCartUI: Event listener configurado');
            } else {
                console.error('❌ ShoppingCartUI: No se encontró cart-icon');
            }
            
        } catch (error) {
            console.error('❌ ShoppingCartUI: Error en inicialización:', error);
        }
    }
    
    // Inicializar después de un pequeño retraso para asegurar que el DOM esté listo
    setTimeout(initializeCartUI, 200);
});

// Función global para añadir productos de prueba
window.addToCartTest = async function(productId = 1) {
    console.log('🛒 Añadiendo producto de prueba:', productId);
    
    if (!window.cartService) {
        console.error('❌ CartService no disponible');
        return false;
    }
    
    const testProducts = [
        { id: 1, name: 'T-shirt EB Racing', price: 29.99, image: '/assets/images/tshirt.jpg' },
        { id: 2, name: 'Casquette EB Racing', price: 19.99, image: '/assets/images/cap.jpg' },
        { id: 3, name: 'Veste EB Racing', price: 89.99, image: '/assets/images/jacket.jpg' },
        { id: 4, name: 'Mug EB Racing', price: 12.99, image: '/assets/images/mug.jpg' }
    ];
    
    const product = testProducts[productId - 1] || testProducts[0];
    
    try {
        await window.cartService.addItem({
            ...product,
            type: 'merchandise'
        });
        
        console.log('✅ Producto añadido:', product.name);
        return true;
    } catch (error) {
        console.error('❌ Error añadiendo producto:', error);
        return false;
    }
};

// Exponer función para debugging
console.log('🛒 Carrito listo. Usa addToCartTest(1-4) para añadir productos de prueba');

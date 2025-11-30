class ShoppingCartUI {
    constructor() {
        this.cartService = window.cartService;
        this.initializeEventListeners();
        this.updateCartUI();
        this.setupAuthListeners();
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
    }

    // Configurar listeners para cambios de autenticación
    setupAuthListeners() {
        document.addEventListener('auth:login', () => this.onUserLogin());
        document.addEventListener('auth:logout', () => this.onUserLogout());
    }

    // Manejar inicio de sesión de usuario
    async onUserLogin() {
        try {
            // Fusionar carrito de invitado con el del usuario
            await this.cartService.mergeGuestCart();
            // Actualizar la UI
            this.updateCartUI();
            this.showNotification('Panier synchronisé avec votre compte');
        } catch (error) {
            console.error('Error al sincronizar carrito:', error);
            this.showNotification('Erreur lors de la synchronisation du panier', 'error');
        }
    }

    // Manejar cierre de sesión
    onUserLogout() {
        this.updateCartUI();
    }

    // Añadir ítem al carrito
    async addItem(product, quantity = 1, size = null, color = null) {
        try {
            const options = {};
            if (size) options.size = size;
            if (color) options.color = color;
            
            await this.cartService.addItem(product, quantity, options);
            this.updateCartUI();
            this.showNotification('Produit ajouté au panier');
            return true;
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            this.showNotification('Erreur lors de l\'ajout au panier', 'error');
            return false;
        }
    }

    // Actualizar cantidad de un ítem
    async updateQuantity(index, newQuantity) {
        try {
            const item = this.cartService.cart[index];
            if (!item) return;
            
            await this.cartService.updateQuantity(item.id, newQuantity, item.options);
            this.updateCartUI();
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
            this.showNotification('Erreur lors de la mise à jour de la quantité', 'error');
        }
    }

    // Eliminar ítem del carrito
    async removeItem(index) {
        try {
            const item = this.cartService.cart[index];
            if (!item) return;
            
            await this.cartService.removeItem(item.id, item.options);
            this.updateCartUI();
            this.showNotification('Produit supprimé du panier');
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            this.showNotification('Erreur lors de la suppression du produit', 'error');
        }
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }, 100);
    }

    // Actualizar la interfaz del carrito
    updateCartUI() {
        const cartDropdown = document.getElementById('cart-dropdown');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCountElements = document.querySelectorAll('.cart-count');
        
        if (!cartItemsContainer) return;

        const cart = this.cartService ? this.cartService.cart : [];
        const itemCount = this.cartService ? this.cartService.getItemCount() : 0;
        const total = this.cartService ? this.cartService.getTotal() : 0;

        // Actualizar contador del carrito
        cartCountElements.forEach(el => {
            el.textContent = itemCount;
            el.style.display = itemCount > 0 ? 'flex' : 'none';
        });

        // Actualizar lista de productos
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">Votre panier est vide</div>';
            if (cartTotal) cartTotal.textContent = '0.00 €';
            return;
        }

        cartItemsContainer.innerHTML = cart.map((item, index) => {
            // Construir opciones del producto (tamaño, color, etc.)
            const optionsHtml = [];
            if (item.options) {
                if (item.options.size) {
                    optionsHtml.push(`<div class="cart-item-option">Taille: ${item.options.size}</div>`);
                }
                if (item.options.color) {
                    optionsHtml.push(`<div class="cart-item-option">Couleur: ${item.options.color}</div>`);
                }
            }

            return `
            <div class="cart-item" data-item-id="${item.id}" data-options='${JSON.stringify(item.options || {})}'>
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" loading="lazy">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    ${optionsHtml.join('')}
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" data-index="${index}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn" data-index="${index}" data-action="increase">+</button>
                    </div>
                </div>
                <div class="cart-item-price">
                    ${(item.price * item.quantity).toFixed(2)} €
                    <button class="remove-item" data-index="${index}" aria-label="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>`;
        }).join('');

        // Actualizar total
        if (cartTotal) {
            cartTotal.textContent = `${total.toFixed(2)} €`;
        }

        // Event listeners para botones de cantidad
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.target.closest('.quantity-btn');
                const index = parseInt(btn.dataset.index);
                const action = btn.dataset.action;
                const item = cart[index];
                
                if (!item) return;
                
                const currentQty = item.quantity;
                const newQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
                
                this.updateQuantity(index, newQty);
            });
        });

        // Event listeners para botones de eliminar
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-item').dataset.index);
                this.removeItem(index);
            });
        });
    }

    // Manejar el proceso de pago
    async handleCheckout() {
        try {
            if (this.cartService.cart.length === 0) {
                this.showNotification('Votre panier est vide', 'error');
                return;
            }

            // Redirigir a la página de checkout
            window.location.href = 'cart.html';
            
        } catch (error) {
            console.error('Error en checkout:', error);
            this.showNotification('Erreur lors du paiement', 'error');
        }
    }

    // Mostrar notificaciones
    showNotification(message, type = 'success') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        // Colores según tipo
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
        };
        
        notification.style.background = colors[type] || colors.success;
        
        document.body.appendChild(notification);
        
        // Mostrar animación
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Inicializar la UI del carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global del carrito
    if (!window.cart) {
        window.cart = new ShoppingCartUI();
        console.log('ShoppingCartUI initialized');
    }

    // Verificar que cartService esté disponible
    if (!window.cartService) {
        console.error('cartService not found. Make sure cartService.js is loaded before cart.js');
        return;
    }

    // Alternar visibilidad del carrito
    const cartIcon = document.getElementById('cart-icon');
    const cartDropdown = document.getElementById('cart-dropdown');
    
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            cartDropdown.classList.toggle('show');
        });
    } else {
        console.log('Cart elements not found - this is normal on checkout page:', { cartIcon, cartDropdown });
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (cartDropdown && cartDropdown.classList.contains('show')) {
            if (!cartDropdown.contains(e.target) && !cartIcon.contains(e.target)) {
                cartDropdown.classList.remove('show');
            }
        }
    });

    // Sincronizar carrito si el usuario acaba de iniciar sesión
    if (window.auth && window.auth.isAuthenticated()) {
        window.cartService.loadCartFromServer().then(() => {
            window.cart.updateCartUI();
        });
    } else {
        // Actualizar UI del carrito incluso si no está autenticado
        window.cart.updateCartUI();
    }

    // Función de prueba para añadir productos (solo para desarrollo)
    window.testAddToCart = async function(productId = 1) {
        if (window.productsService) {
            const product = window.productsService.getProductById(productId);
            if (product && window.cart) {
                await window.cart.addItem(product, 1, 'M', 'Negro');
                console.log(`Added ${product.name} to cart`);
            } else {
                console.error('Product or cart not found');
            }
        } else {
            console.error('Products service not initialized');
        }
    };

    // Exponer función de prueba en la consola
    console.log('Cart initialized. Use testAddToCart(productId) to add a test product (1-4).');
});

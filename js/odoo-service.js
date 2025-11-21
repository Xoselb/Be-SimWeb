class OdooService {
    constructor() {
        this.baseUrl = 'https://eb-racing-events.odoo.com';
        this.db = 'Eb racing events';
        this.username = 'api_integration';
        this.password = 'Larroy2007'; // Recuerda usar variables de entorno en producción
        this.sessionId = null;
    }

    async authenticate() {
        try {
            const response = await fetch(`${this.baseUrl}/web/session/authenticate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    params: {
                        db: this.db,
                        login: this.username,
                        password: this.password
                    }
                })
            });
            
            const data = await response.json();
            
            if (data.result && data.result.uid) {
                this.sessionId = data.result.session_id;
                return true;
            } else {
                console.error('Error de autenticación:', data);
                return false;
            }
        } catch (error) {
            console.error('Error al conectar con Odoo:', error);
            return false;
        }
    }

    async getProducts() {
        // Mock data for the T-shirt product
        const mockProducts = [
            {
                id: 6, // ID from the URL: t-shirt-eb-simracing-6
                name: 'T-shirt EB SimRacing',
                description: 'T-shirt officielle EB SimRacing - 100% coton de haute qualité',
                price: 29.99,
                image: 'https://eb-racing-events.odoo.com/web/image/product.template/6/image_1024',
                sizes: ['S', 'M', 'L', 'XL', 'XXL'],
                colors: ['Noir'],
                productUrl: 'https://eb-racing-events.odoo.com/shop/t-shirt-eb-simracing-6'
            }
        ];
        
        try {
            // In a real implementation, you would fetch from the API like this:
            /*
            if (!this.sessionId) {
                const authenticated = await this.authenticate();
                if (!authenticated) return [];
            }

            const response = await fetch(`${this.baseUrl}/api/product.template`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Openerp-Session-Id': this.sessionId
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener productos');
            }

            const data = await response.json();
            return data || [];
            */
            
            // For now, return mock data
            return mockProducts;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            // Return mock data even if there's an error
            return mockProducts;
        }
    }
    
    renderProducts(products, container) {
        if (!container) return;
        
        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" loading="lazy">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price.toFixed(2)} €</div>
                    
                    ${product.sizes ? `
                        <div class="product-options">
                            <select class="product-size" data-product-id="${product.id}">
                                <option value="">Sélectionnez une taille</option>
                                ${product.sizes.map(size => 
                                    `<option value="${size}">Taille ${size}</option>`
                                ).join('')}
                            </select>
                        </div>
                    ` : ''}
                    
                    <button class="add-to-cart" data-product='${JSON.stringify(product).replace(/'/g, '&#39;')}'>
                        <i class="fas fa-shopping-cart"></i> Ajouter au panier
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for add to cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const product = JSON.parse(e.target.closest('.add-to-cart').dataset.product);
                const sizeSelect = e.target.closest('.product-card').querySelector('.product-size');
                const size = sizeSelect ? sizeSelect.value : null;
                
                if (product.sizes && !size) {
                    alert('Veuillez sélectionner une taille');
                    return;
                }
                
                // Add to cart
                if (window.cart) {
                    window.cart.addItem(product, 1, size, null);
                    
                    // Show added to cart feedback
                    const originalText = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
                    button.classList.add('added');
                    
                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.classList.remove('added');
                    }, 2000);
                }
            });
        });
    }
}

// Initialize Odoo service and cart
const odooService = new OdooService();

// Initialize the shop when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing EB Simracing Shop...');
    
    try {
        // Get the products container
        const productsContainer = document.querySelector('.products-grid');
        
        // Show loading state
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="loading">Chargement des produits...</div>';
        }
        
        // Try to connect to Odoo (will fallback to mock data if it fails)
        const connected = await odooService.authenticate();
        console.log(connected ? '✅ Connected to Odoo' : '⚠️ Using mock data');
        
        // Get products (will use mock data if API fails)
        const products = await odooService.getProducts();
        console.log('Products loaded:', products);
        
        // Render products
        if (productsContainer && products.length > 0) {
            odooService.renderProducts(products, productsContainer);
        } else if (productsContainer) {
            productsContainer.innerHTML = '<div class="no-products">Aucun produit disponible pour le moment.</div>';
        }
    } catch (error) {
        console.error('Error initializing shop:', error);
        const productsContainer = document.querySelector('.products-grid');
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="error">Erreur lors du chargement des produits. Veuillez réessayer plus tard.</div>';
        }
    }
});

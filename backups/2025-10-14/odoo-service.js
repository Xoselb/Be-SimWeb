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
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-details">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price.toFixed(2)} €</div>
                    
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Ajouter au panier
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Ejemplo de uso
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
            
            // Add event listeners to Add to Cart buttons
            document.querySelectorAll('.add-to-cart').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.closest('.add-to-cart').dataset.productId;
                    
                    // Redirect to Odoo cart with the selected product
                    const product = products.find(p => p.id === parseInt(productId));
                    if (product) {
                        // Add to cart and redirect to checkout
                        const addToCartUrl = `${product.productUrl}?add=1`;
                        window.location.href = addToCartUrl + '#cart';
                    }
                });
            });
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

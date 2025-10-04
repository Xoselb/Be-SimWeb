// Configuración de la tienda Odoo
const ODOO_CONFIG = {
    baseUrl: 'https://eb-racing-events.odoo.com',
    debug: true
};

// Clase principal de la tienda
class OdooStore {
    constructor() {
        this.products = [];
        this.init();
    }

    async init() {
        try {
            // Mostrar loader
            this.showLoader();
            
            // Obtener productos
            await this.fetchProducts();
            
            // Renderizar productos
            this.renderProducts();
            
        } catch (error) {
            console.error('Error al cargar los productos:', error);
            this.showError('No se pudieron cargar los productos. Por favor, intente más tarde.');
        } finally {
            // Ocultar loader
            this.hideLoader();
        }
    }

    async fetchProducts() {
        // Datos del producto T-shirt con enlace directo a la página de pago
        this.products = [
            {
                id: 6,
                name: 'T-shirt EB Simracing',
                description: 'Camiseta oficial de EB Simracing - 100% algodón - Color negro con logo bordado',
                price: 29.99,
                currency: '€',
                image: 'https://eb-racing-events.odoo.com/website/image/product.template/5/image_1024',
                url: 'https://eb-racing-events.odoo.com/shop/product/t-shirt-eb-simracing-5',
                category: 'Ropa'
            },
            // Agregar más productos según sea necesario
        ];
    }

    renderProducts() {
        const productsContainer = document.querySelector('.products-grid');
        if (!productsContainer) return;

        // Limpiar contenedor
        productsContainer.innerHTML = '';

        // Renderizar cada producto
        this.products.forEach(product => {
            const productElement = this.createProductElement(product);
            productsContainer.appendChild(productElement);
        });
    }

    createProductElement(product) {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Asegurarse de que la URL sea absoluta
        const productUrl = product.url.startsWith('http') ? 
            product.url : 
            `https://eb-racing-events.odoo.com${product.url}`;
            
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.image}');"></div>
            <div class="product-info">
                ${product.category ? `<div class="product-category">${product.category}</div>` : ''}
                <h3 class="product-title">${product.name}</h3>
                ${product.description ? `<div class="product-description">${product.description}</div>` : ''}
                <div class="product-price">${product.price.toFixed(2)} ${product.currency || '€'}</div>
                <a href="${productUrl}" class="btn-add-to-cart" target="_blank">
                    Comprar Ahora
                </a>
            </div>
        `;

        return productCard;
    }

    showLoader() {
        let loader = document.getElementById('loading-indicator');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'loading-indicator';
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            loader.innerHTML = `
                <div style="color: white; text-align: center;">
                    <div class="spinner"></div>
                    <p>Cargando productos...</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
    }

    hideLoader() {
        const loader = document.getElementById('loading-indicator');
        if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #ffebee;
            color: #c62828;
            padding: 15px;
            margin: 20px;
            border-radius: 4px;
            text-align: center;
        `;
        
        const container = document.querySelector('.odoo-container') || document.body;
        container.prepend(errorDiv);
    }
}

// Inicializar la tienda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.odooStore = new OdooStore();
});

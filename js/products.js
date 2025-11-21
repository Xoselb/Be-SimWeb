// products.js - Catálogo de productos para EB Simracing

class ProductsService {
    constructor() {
        this.products = this.generateProducts();
    }

    generateProducts() {
        return [
            {
                id: 1,
                name: "Miniatura Casco Evan Becerra",
                description: "Modelo a escala 1:18 del casco de carreras con base de exhibición",
                price: 109.99,
                image: "/img/EVAN.JPG",
                category: "decoration",
                stock: 25,
                featured: true
            },
            {
                id: 2,
                name: "Veste officielle EB RACING",
                description: "Chaqueta de EB Racing",
                price: 59.99,
                image: "/img/merch/Veste_EBRACING.jpg",
                category: "clothing",
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: ["Negro", "Amarillo"],
                stock: 75,
                featured: true
            },
            {
                id: 3,
                name: "Sudadera Championship",
                description: "Sudadera con capucha y diseño exclusivo del campeonato",
                price: 49.99,
                image: "/img/Aurora_Interactive.png",
                category: "clothing",
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: ["Gris Oscuro", "Negro", "Azul"],
                stock: 35,
                featured: true
            },
            {
                id: 4,
                name: "Taza Pilot's Choice",
                description: "Taza de cerámica con diseño de circuito y logo del equipo",
                price: 12.99,
                image: "/img/Aurora_Interactive.png",
                category: "accessories",
                sizes: ["Única"],
                colors: ["Blanco", "Negro"],
                stock: 100,
                featured: true
            }
        ];
    }

    getAllProducts() {
        return this.products;
    }

    getProductById(id) {
        return this.products.find(product => product.id === parseInt(id));
    }

    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    getFeaturedProducts() {
        return this.products.filter(product => product.featured);
    }

    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
}

class ProductsUI {
    constructor() {
        this.productsService = new ProductsService();
        this.cartUI = window.cart;
        this.initializeProducts();
    }

    initializeProducts() {
        this.renderProducts();
        this.attachEventListeners();
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;

        const products = this.productsService.getAllProducts();
        
        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        console.log('Creating product card for:', product.name, 'colors:', product.colors);
        
        const sizeOptions = product.sizes && (product.sizes.length > 1 || (product.sizes.length === 1 && product.sizes[0] !== "Única"))
            ? `<div class="product-options">
                <label for="size-${product.id}">Talla:</label>
                <div class="size-selector" id="size-selector-${product.id}">
                    ${product.sizes.map(size => `<button class="size-option" data-size="${size}">${size}</button>`).join('')}
                </div>
               </div>`
            : '';

        const colorOptions = product.colors && (product.colors.length > 1 || (product.colors.length === 1 && product.colors[0] !== "Único"))
            ? `<div class="product-options">
                <label for="color-${product.id}">Color:</label>
                <div class="color-selector" id="color-selector-${product.id}">
                    ${product.colors.map(color => `<div class="color-option" data-color="${color}" title="${color}"></div>`).join('')}
                </div>
               </div>`
            : '';

        console.log('Color options HTML:', colorOptions);

        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                    ${product.featured ? '<span class="featured-badge">Destacado</span>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-price">${product.price.toFixed(2)} €</div>
                    ${sizeOptions}
                    ${colorOptions}
                    <div class="product-stock">Stock: ${product.stock} unidades</div>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Añadir al carrito
                    </button>
                </div>
            </div>
        `;
    }

    attachEventListeners() {
        // Event listeners para botones de talla
        document.querySelectorAll('.size-option').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.closest('.product-card').dataset.productId;
                this.handleSizeSelection(productId, e.target.dataset.size);
            });
        });

        // Event listeners para muestras de color
        document.querySelectorAll('.color-option').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                const productId = e.target.closest('.product-card').dataset.productId;
                this.handleColorSelection(productId, e.target.dataset.color);
            });
        });

        // Event listeners para botones de añadir al carrito
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart-btn').dataset.productId);
                this.handleAddToCart(productId);
            });
        });

        // Seleccionar primeras opciones por defecto
        this.selectDefaultOptions();
    }

    handleSizeSelection(productId, selectedSize) {
        const sizeSelector = document.getElementById(`size-selector-${productId}`);
        const sizeOptions = sizeSelector.querySelectorAll('.size-option');
        
        sizeOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.size === selectedSize) {
                option.classList.add('selected');
            }
        });
    }

    handleColorSelection(productId, selectedColor) {
        const colorSelector = document.getElementById(`color-selector-${productId}`);
        const colorOptions = colorSelector.querySelectorAll('.color-option');
        
        colorOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.color === selectedColor) {
                option.classList.add('selected');
            }
        });
    }

    selectDefaultOptions() {
        document.querySelectorAll('.product-card').forEach(card => {
            const productId = card.dataset.productId;
            
            // Seleccionar primera talla disponible
            const firstSizeOption = card.querySelector('.size-option');
            if (firstSizeOption) {
                this.handleSizeSelection(productId, firstSizeOption.dataset.size);
            }
            
            // Seleccionar primer color disponible
            const firstColorOption = card.querySelector('.color-option');
            if (firstColorOption) {
                this.handleColorSelection(productId, firstColorOption.dataset.color);
            }
        });
    }

    async handleAddToCart(productId) {
        try {
            const product = this.productsService.getProductById(productId);
            if (!product) {
                console.error('Producto no encontrado:', productId);
                return;
            }

            // Obtener opciones seleccionadas de los nuevos selectores
            const selectedSizeElement = document.querySelector(`#size-selector-${productId} .size-option.selected`);
            const selectedColorElement = document.querySelector(`#color-selector-${productId} .color-option.selected`);
            
            const options = {};
            if (selectedSizeElement && selectedSizeElement.dataset.size !== 'Única') {
                options.size = selectedSizeElement.dataset.size;
            }
            if (selectedColorElement && selectedColorElement.dataset.color) {
                options.color = selectedColorElement.dataset.color;
            }

            // Añadir loading state al botón
            const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
            const originalContent = button.innerHTML;
            button.classList.add('loading');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Añadiendo...';
            button.disabled = true;

            // Añadir al carrito
            if (this.cartUI) {
                const success = await this.cartUI.addItem(product, 1, options.size, options.color);
                if (success) {
                    this.animateAddToCart(productId);
                }
            } else {
                console.error('Cart UI not initialized');
            }

            // Restaurar botón
            setTimeout(() => {
                button.classList.remove('loading');
                button.innerHTML = originalContent;
                button.disabled = false;
            }, 500);

        } catch (error) {
            console.error('Error al añadir producto al carrito:', error);
            
            // Restaurar botón en caso de error
            const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart-btn`);
            if (button) {
                button.classList.remove('loading');
                button.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
                button.disabled = false;
            }
        }
    }

    animateAddToCart(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const button = productCard.querySelector('.add-to-cart-btn');
        
        // Animación del botón
        button.innerHTML = '<i class="fas fa-check"></i> ¡Añadido!';
        button.classList.add('added');
        
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
            button.classList.remove('added');
        }, 2000);

        // Animación del contador del carrito
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 300);
        }
    }
}

// Inicializar el sistema de productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia global del servicio de productos
    window.productsService = new ProductsService();
    
    // Crear instancia de la UI de productos
    window.productsUI = new ProductsUI();
    
    console.log('Products initialized with', window.productsService.getAllProducts().length, 'products');
});

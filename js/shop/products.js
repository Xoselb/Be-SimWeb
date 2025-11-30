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
        this.filteredProducts = [];
        this.currentFilters = {
            search: '',
            category: '',
            price: '',
            sort: 'name'
        };
        this.currentView = 'grid';
        this.initializeProducts();
    }

    initializeProducts() {
        this.renderProducts();
        this.attachEventListeners();
        this.initializeFilters();
        this.updateResultsCount();
    }

    renderProducts() {
        const container = document.getElementById('products-grid');
        const noResults = document.getElementById('noResults');
        if (!container) return;

        const products = this.getFilteredAndSortedProducts();
        
        if (products.length === 0) {
            container.style.display = 'none';
            noResults.style.display = 'block';
        } else {
            container.style.display = '';
            noResults.style.display = 'none';
            container.innerHTML = products.map(product => this.createProductCard(product)).join('');
        }
        
        this.updateResultsCount();
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
                    <button class="quick-view-btn" data-product-id="${product.id}">
                        <i class="fas fa-eye"></i> Vue rapide
                    </button>
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

    initializeFilters() {
        // This method is called but will be handled by FilterManager
    }

    getFilteredAndSortedProducts() {
        let products = this.productsService.getAllProducts();
        
        // Apply search filter
        if (this.currentFilters.search) {
            products = this.productsService.searchProducts(this.currentFilters.search);
        }
        
        // Apply category filter
        if (this.currentFilters.category) {
            products = products.filter(product => product.category === this.currentFilters.category);
        }
        
        // Apply price filter
        if (this.currentFilters.price) {
            products = products.filter(product => {
                const price = product.price;
                switch (this.currentFilters.price) {
                    case '0-25':
                        return price <= 25;
                    case '25-50':
                        return price > 25 && price <= 50;
                    case '50-100':
                        return price > 50 && price <= 100;
                    case '100+':
                        return price > 100;
                    default:
                        return true;
                }
            });
        }
        
        // Apply sorting
        products = this.sortProducts(products, this.currentFilters.sort);
        
        return products;
    }

    sortProducts(products, sortBy) {
        const sorted = [...products];
        switch (sortBy) {
            case 'name':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'featured':
                return sorted.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
            default:
                return sorted;
        }
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const count = this.getFilteredAndSortedProducts().length;
            resultsCount.textContent = count;
        }
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

        // Event listeners para botones de vista rápida
        document.querySelectorAll('.quick-view-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.quick-view-btn').dataset.productId);
                this.openQuickView(productId);
            });
        });

        // Seleccionar primeras opciones por defecto
        this.selectDefaultOptions();
    }

    openQuickView(productId) {
        const product = this.productsService.getProductById(productId);
        if (!product) return;

        window.quickViewManager.open(product);
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
    
    // Initialize FilterManager
    window.filterManager = new FilterManager(window.productsUI);
    
    // Initialize QuickViewManager
    window.quickViewManager = new QuickViewManager();
    
    // Initialize CustomDropdownManager
    window.customDropdownManager = new CustomDropdownManager();
});

// Filtering and Search Functionality
class FilterManager {
    constructor(productsUI) {
        this.productsUI = productsUI;
        this.initializeFilters();
    }

    initializeFilters() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                searchClear.style.display = e.target.value ? 'block' : 'none';
            });
        }
        
        if (searchClear) {
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                this.handleSearch('');
            });
        }

        // Filter dropdowns
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        const sortFilter = document.getElementById('sortFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleFilter('category', e.target.value);
            });
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', (e) => {
                this.handleFilter('price', e.target.value);
            });
        }
        
        if (sortFilter) {
            sortFilter.addEventListener('change', (e) => {
                this.handleFilter('sort', e.target.value);
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }

        // Mobile filters toggle
        const filtersToggle = document.getElementById('filtersToggle');
        const filtersContent = document.getElementById('filtersContent');
        
        if (filtersToggle && filtersContent) {
            filtersToggle.addEventListener('click', () => {
                filtersContent.classList.toggle('show');
            });
        }

        // View toggle
        this.initializeViewToggle();
    }

    initializeViewToggle() {
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.handleViewChange(btn.dataset.view);
            });
        });
    }

    handleViewChange(view) {
        const productsGrid = document.getElementById('products-grid');
        if (view === 'list') {
            productsGrid.classList.add('list-view');
        } else {
            productsGrid.classList.remove('list-view');
        }
        this.productsUI.currentView = view;
    }

    handleSearch(query) {
        this.productsUI.currentFilters.search = query;
        this.productsUI.renderProducts();
        this.updateActiveFilters();
    }

    handleFilter(type, value) {
        this.productsUI.currentFilters[type] = value;
        this.productsUI.renderProducts();
        this.updateActiveFilters();
    }

    clearAllFilters() {
        this.productsUI.currentFilters = {
            search: '',
            category: '',
            price: '',
            sort: 'name'
        };
        
        // Reset form elements
        document.getElementById('searchInput').value = '';
        document.getElementById('searchClear').style.display = 'none';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('sortFilter').value = 'name';
        
        this.productsUI.renderProducts();
        this.updateActiveFilters();
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        const filters = [];
        
        if (this.productsUI.currentFilters.search) {
            filters.push({ type: 'search', value: this.productsUI.currentFilters.search, label: `Recherche: ${this.productsUI.currentFilters.search}` });
        }
        
        if (this.productsUI.currentFilters.category) {
            const categoryLabel = document.querySelector(`#categoryFilter option[value="${this.productsUI.currentFilters.category}"]`).textContent;
            filters.push({ type: 'category', value: this.productsUI.currentFilters.category, label: `Catégorie: ${categoryLabel}` });
        }
        
        if (this.productsUI.currentFilters.price) {
            const priceLabel = document.querySelector(`#priceFilter option[value="${this.productsUI.currentFilters.price}"]`).textContent;
            filters.push({ type: 'price', value: this.productsUI.currentFilters.price, label: `Prix: ${priceLabel}` });
        }
        
        if (filters.length === 0) {
            activeFiltersContainer.innerHTML = '';
        } else {
            activeFiltersContainer.innerHTML = filters.map(filter => `
                <div class="active-filter-tag">
                    ${filter.label}
                    <button onclick="window.filterManager.removeFilter('${filter.type}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `).join('');
        }
    }

    removeFilter(type) {
        this.productsUI.currentFilters[type] = type === 'sort' ? 'name' : '';
        
        // Update form element
        if (type === 'search') {
            document.getElementById('searchInput').value = '';
            document.getElementById('searchClear').style.display = 'none';
        } else {
            const element = document.getElementById(`${type}Filter`);
            if (element) element.value = this.productsUI.currentFilters[type];
        }
        
        this.productsUI.renderProducts();
        this.updateActiveFilters();
    }
}

// Quick View Modal Functionality
class QuickViewManager {
    constructor() {
        this.currentProduct = null;
        this.initializeModal();
    }

    initializeModal() {
        const modal = document.getElementById('quickViewModal');
        const closeBtn = document.getElementById('quickViewClose');
        const closeBtn2 = document.getElementById('quickViewCloseBtn');
        const addToCartBtn = document.getElementById('quickViewAddToCart');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }
        
        if (closeBtn2) {
            closeBtn2.addEventListener('click', () => this.close());
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.close();
                }
            });
        }

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => this.handleAddToCart());
        }

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                this.close();
            }
        });
    }

    open(product) {
        this.currentProduct = product;
        this.populateModal(product);
        
        const modal = document.getElementById('quickViewModal');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        const modal = document.getElementById('quickViewModal');
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Reset form
        setTimeout(() => {
            this.resetModal();
        }, 300);
    }

    populateModal(product) {
        document.getElementById('quickViewImage').src = product.image;
        document.getElementById('quickViewImage').alt = product.name;
        document.getElementById('quickViewTitle').textContent = product.name;
        document.getElementById('quickViewDescription').textContent = product.description;
        document.getElementById('quickViewPrice').textContent = `${product.price.toFixed(2)} €`;

        // Populate options
        const optionsContainer = document.getElementById('quickViewOptions');
        let optionsHTML = '';

        if (product.sizes && product.sizes.length > 0 && !(product.sizes.length === 1 && product.sizes[0] === "Única")) {
            optionsHTML += `
                <div class="product-options">
                    <label>Talla:</label>
                    <div class="size-selector" id="quickViewSizeSelector">
                        ${product.sizes.map(size => `<button class="size-option" data-size="${size}">${size}</button>`).join('')}
                    </div>
                </div>
            `;
        }

        if (product.colors && product.colors.length > 0 && !(product.colors.length === 1 && product.colors[0] === "Único")) {
            optionsHTML += `
                <div class="product-options">
                    <label>Color:</label>
                    <div class="color-selector" id="quickViewColorSelector">
                        ${product.colors.map(color => `<div class="color-option" data-color="${color}" title="${color}"></div>`).join('')}
                    </div>
                </div>
            `;
        }

        optionsContainer.innerHTML = optionsHTML;

        // Attach event listeners for new options
        this.attachQuickViewEventListeners();
        
        // Select first options by default
        this.selectDefaultQuickViewOptions();
    }

    attachQuickViewEventListeners() {
        // Size options
        document.querySelectorAll('#quickViewSizeSelector .size-option').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('#quickViewSizeSelector .size-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Color options
        document.querySelectorAll('#quickViewColorSelector .color-option').forEach(swatch => {
            swatch.addEventListener('click', (e) => {
                document.querySelectorAll('#quickViewColorSelector .color-option').forEach(opt => opt.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });
    }

    selectDefaultQuickViewOptions() {
        const firstSize = document.querySelector('#quickViewSizeSelector .size-option');
        if (firstSize) {
            firstSize.classList.add('selected');
        }

        const firstColor = document.querySelector('#quickViewColorSelector .color-option');
        if (firstColor) {
            firstColor.classList.add('selected');
        }
    }

    async handleAddToCart() {
        if (!this.currentProduct) return;

        const selectedSizeElement = document.querySelector('#quickViewSizeSelector .size-option.selected');
        const selectedColorElement = document.querySelector('#quickViewColorSelector .color-option.selected');
        
        const options = {};
        if (selectedSizeElement && selectedSizeElement.dataset.size !== 'Única') {
            options.size = selectedSizeElement.dataset.size;
        }
        if (selectedColorElement && selectedColorElement.dataset.color) {
            options.color = selectedColorElement.dataset.color;
        }

        const button = document.getElementById('quickViewAddToCart');
        const originalContent = button.innerHTML;
        button.classList.add('loading');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Añadiendo...';
        button.disabled = true;

        try {
            if (window.cart) {
                const success = await window.cart.addItem(this.currentProduct, 1, options.size, options.color);
                if (success) {
                    button.innerHTML = '<i class="fas fa-check"></i> ¡Añadido!';
                    button.classList.add('added');
                    
                    setTimeout(() => {
                        this.close();
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setTimeout(() => {
                button.classList.remove('loading', 'added');
                button.innerHTML = originalContent;
                button.disabled = false;
            }, 1000);
        }
    }

    resetModal() {
        document.getElementById('quickViewImage').src = '';
        document.getElementById('quickViewTitle').textContent = '';
        document.getElementById('quickViewDescription').textContent = '';
        document.getElementById('quickViewPrice').textContent = '';
        document.getElementById('quickViewOptions').innerHTML = '';
        
        const button = document.getElementById('quickViewAddToCart');
        button.classList.remove('loading', 'added');
        button.innerHTML = '<i class="fas fa-shopping-cart"></i> Añadir al carrito';
        button.disabled = false;
        
        this.currentProduct = null;
    }
}

// Custom Dropdown Manager
class CustomDropdownManager {
    constructor() {
        this.initializeDropdowns();
    }

    initializeDropdowns() {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            this.setupDropdown(dropdown);
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.custom-dropdown')) {
                this.closeAllDropdowns();
            }
        });
    }

    setupDropdown(dropdown) {
        const select = dropdown.querySelector('select');
        const dropdownOptions = dropdown.querySelector('.dropdown-options');
        
        if (!select || !dropdownOptions) return;

        // Create custom options from select options
        const options = Array.from(select.options).map(option => ({
            value: option.value,
            text: option.textContent,
            selected: option.selected
        }));

        // Populate custom dropdown
        dropdownOptions.innerHTML = options.map(option => `
            <div class="dropdown-option ${option.selected ? 'selected' : ''}" data-value="${option.value}">
                ${option.text}
            </div>
        `).join('');

        // Handle dropdown container click (not select click)
        dropdown.addEventListener('click', (e) => {
            if (!e.target.closest('select')) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleDropdown(dropdown);
            }
        });

        // Prevent select from opening native dropdown
        select.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Handle custom option clicks
        dropdownOptions.addEventListener('click', (e) => {
            const option = e.target.closest('.dropdown-option');
            if (option) {
                this.selectOption(dropdown, option.dataset.value);
            }
        });

        // Handle focus/blur - remove focus handling since we're using click
        select.addEventListener('focus', (e) => {
            e.preventDefault();
        });
        
        select.addEventListener('blur', () => {
            setTimeout(() => this.closeDropdown(dropdown), 150);
        });
    }

    toggleDropdown(dropdown) {
        const isOpen = dropdown.querySelector('.dropdown-options').classList.contains('show');
        if (isOpen) {
            this.closeDropdown(dropdown);
        } else {
            this.openDropdown(dropdown);
        }
    }

    openDropdown(dropdown) {
        this.closeAllDropdowns();
        dropdown.querySelector('.dropdown-options').classList.add('show');
    }

    closeDropdown(dropdown) {
        dropdown.querySelector('.dropdown-options').classList.remove('show');
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown-options.show').forEach(options => {
            options.classList.remove('show');
        });
    }

    selectOption(dropdown, value) {
        const select = dropdown.querySelector('select');
        const dropdownOptions = dropdown.querySelector('.dropdown-options');
        
        // Update select
        select.value = value;
        
        // Update custom options
        dropdownOptions.querySelectorAll('.dropdown-option').forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.value === value) {
                option.classList.add('selected');
            }
        });

        // Trigger change event
        select.dispatchEvent(new Event('change'));
        
        // Close dropdown
        this.closeDropdown(dropdown);
    }
}

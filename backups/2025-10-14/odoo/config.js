// Configuración de conexión con Odoo
const OdooConfig = {
    // Estos valores se reemplazarán con los reales
    BASE_URL: 'TU_URL_ODOO',
    DB: 'TU_BASE_DE_DATOS',
    USERNAME: 'USUARIO_API',
    PASSWORD: 'CONTRASEÑA_API',
    
    // Endpoints de la API
    ENDPOINTS: {
        AUTH: '/web/session/authenticate',
        SEARCH_READ: '/web/dataset/search_read',
        CREATE: '/web/dataset/call_kw',
        PRODUCTS: '/web/dataset/call_kw/product.product/search_read',
        CREATE_ORDER: '/web/dataset/call_kw/sale.order/create',
        CONFIRM_ORDER: '/web/dataset/call_kw/sale.order/action_confirm'
    },
    
    // Modelos de Odoo
    MODELS: {
        PRODUCT: 'product.product',
        SALE_ORDER: 'sale.order',
        PARTNER: 'res.partner'
    }
};

export default OdooConfig;

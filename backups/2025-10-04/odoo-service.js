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
        if (!this.sessionId) {
            const authenticated = await this.authenticate();
            if (!authenticated) return [];
        }

        try {
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
        } catch (error) {
            console.error('Error al obtener productos:', error);
            return [];
        }
    }
}

// Ejemplo de uso
const odooService = new OdooService();

// Para probar la conexión
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Probando conexión con Odoo...');
    const connected = await odooService.authenticate();
    if (connected) {
        console.log('✅ Conexión exitosa con Odoo');
        const products = await odooService.getProducts();
        console.log('Productos:', products);
    } else {
        console.error('❌ No se pudo conectar con Odoo');
    }
});

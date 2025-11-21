// Clase para manejar la autenticación con Odoo
class OdooAuth {
    constructor() {
        this.baseUrl = 'https://eb-racing-events.odoo.com/odoo';
        this.db = 'eb-racing-events';
        this.username = 'xoselito2007@gmail.com';
        this.password = 'Larroy2007';
        this.uid = null;
        this.sessionId = localStorage.getItem('odoo_session_id') || null;
    }

    async authenticate() {
        try {
            console.log('Iniciando autenticación con JSON-RPC...');
            
            // Usar el endpoint JSON-RPC para autenticación
            const response = await fetch(`${this.baseUrl}/jsonrpc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        service: 'common',
                        method: 'login',
                        args: [
                            this.db,
                            this.username,
                            this.password,
                            {}
                        ]
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.error) {
                console.error('Error en la respuesta:', data.error);
                return false;
            }
            
            if (data.result) {
                // Para el endpoint JSON-RPC, el resultado directo es el UID
                this.uid = data.result;
                // No tenemos session_id en la respuesta JSON-RPC, así que usamos un valor temporal
                this.sessionId = 'jsonrpc-' + Date.now();
                localStorage.setItem('odoo_session_id', this.sessionId);
                console.log('Autenticación exitosa. UID:', this.uid);
                return true;
            }
            
            console.error('Respuesta inesperada del servidor');
            return false;
            
        } catch (error) {
            console.error('Error en la autenticación:', error);
            return false;
        }
    }

    isAuthenticated() {
        return this.uid !== null && this.sessionId !== null;
    }

    logout() {
        return fetch(`${this.baseUrl}/web/session/destroy`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Openerp-Session-Id': this.sessionId
            }
        })
        .catch(error => console.error('Error al cerrar sesión:', error))
        .finally(() => {
            this.uid = null;
            this.sessionId = null;
            localStorage.removeItem('odoo_session_id');
        });
    }
}

// Crear instancia global
var odooAuth = new OdooAuth();

// Hacer odooAuth disponible globalmente
if (typeof window !== 'undefined') {
    window.odooAuth = odooAuth;
}

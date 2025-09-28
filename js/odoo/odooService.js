import OdooConfig from './config.js';

class OdooService {
    constructor() {
        this.uid = null;
        this.sessionId = null;
    }

    async authenticate() {
        try {
            const response = await fetch(`${OdooConfig.BASE_URL}${OdooConfig.ENDPOINTS.AUTH}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'call',
                    params: {
                        db: OdooConfig.DB,
                        login: OdooConfig.USERNAME,
                        password: OdooConfig.PASSWORD
                    }
                })
            });

            const data = await response.json();
            
            if (data.result && data.result.uid) {
                this.uid = data.result.uid;
                this.sessionId = data.result.session_id;
                return true;
            } else {
                throw new Error('Authentication failed');
            }
        } catch (error) {
            console.error('Error authenticating with Odoo:', error);
            throw error;
        }
    }

    async searchRead(model, domain = [], fields = [], limit = 10, offset = 0) {
        if (!this.uid) await this.authenticate();

        const response = await fetch(`${OdooConfig.BASE_URL}${OdooConfig.ENDPOINTS.SEARCH_READ}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Openerp-Session-Id': this.sessionId
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    model: model,
                    domain: domain,
                    fields: fields,
                    limit: limit,
                    offset: offset
                }
            })
        });

        return await response.json();
    }

    async createOrder(partnerData, orderLines) {
        if (!this.uid) await this.authenticate();

        // 1. Crear o buscar el partner
        const partner = await this.findOrCreatePartner(partnerData);
        
        // 2. Crear la orden de venta
        const orderData = {
            partner_id: partner.id,
            order_line: orderLines,
            // Agregar más campos según sea necesario
        };

        const response = await fetch(`${OdooConfig.BASE_URL}${OdooConfig.ENDPOINTS.CREATE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Openerp-Session-Id': this.sessionId
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    model: OdooConfig.MODELS.SALE_ORDER,
                    method: 'create',
                    args: [orderData],
                    kwargs: {}
                }
            })
        });

        const result = await response.json();
        
        if (result.result) {
            // Confirmar la orden
            await this.confirmOrder(result.result);
            return result.result;
        }
        
        return null;
    }

    async findOrCreatePartner(partnerData) {
        // Implementar lógica para buscar o crear un partner
        // Esto es un ejemplo básico
        return { id: 1 }; // Reemplazar con la lógica real
    }

    async confirmOrder(orderId) {
        // Implementar confirmación de orden
    }
}

export default new OdooService();

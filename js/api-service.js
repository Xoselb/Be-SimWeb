// API Service para EB Racing Database
class EBRacingAPI {
    constructor() {
        this.baseURL = '/api'; // Cambiar por vuestro endpoint real
        this.headers = {
            'Content-Type': 'application/json',
            // Añadir aquí headers de autenticación si es necesario
            // 'Authorization': 'Bearer token',
            // 'X-API-Key': 'api-key'
        };
    }

    // Obtener configuraciones del usuario
    async getUserSettings(userId) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/settings`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Error obteniendo configuraciones');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API getUserSettings:', error);
            throw error;
        }
    }

    // Guardar configuración individual
    async saveUserSetting(userId, settingKey, settingValue) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/settings`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    setting_key: settingKey,
                    setting_value: settingValue
                })
            });
            
            if (!response.ok) throw new Error('Error guardando configuración');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API saveUserSetting:', error);
            throw error;
        }
    }

    // Actualizar múltiples configuraciones
    async updateUserSettings(userId, settings) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/settings/bulk`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify({
                    settings: settings
                })
            });
            
            if (!response.ok) throw new Error('Error actualizando configuraciones');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API updateUserSettings:', error);
            throw error;
        }
    }

    // Obtener perfil completo del usuario
    async getUserProfile(userId) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/profile`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Error obteniendo perfil');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API getUserProfile:', error);
            throw error;
        }
    }

    // Actualizar perfil del usuario
    async updateUserProfile(userId, profileData) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/profile`, {
                method: 'PUT',
                headers: this.headers,
                body: JSON.stringify(profileData)
            });
            
            if (!response.ok) throw new Error('Error actualizando perfil');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API updateUserProfile:', error);
            throw error;
        }
    }

    // Registrar actividad del usuario
    async logUserActivity(userId, action, details = {}) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/activity`, {
                method: 'POST',
                headers: this.headers,
                body: JSON.stringify({
                    action: action,
                    details: details,
                    timestamp: new Date().toISOString()
                })
            });
            
            if (!response.ok) throw new Error('Error registrando actividad');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API logUserActivity:', error);
            throw error;
        }
    }

    // Exportar todos los datos del usuario
    async exportUserData(userId) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/export`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Error exportando datos');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API exportUserData:', error);
            throw error;
        }
    }

    // Obtener estadísticas del usuario
    async getUserStats(userId) {
        try {
            const response = await fetch(`${this.baseURL}/users/${userId}/stats`, {
                method: 'GET',
                headers: this.headers
            });
            
            if (!response.ok) throw new Error('Error obteniendo estadísticas');
            
            return await response.json();
        } catch (error) {
            console.error('Error en API getUserStats:', error);
            throw error;
        }
    }

    // Configurar endpoint y autenticación
    configure(baseURL, authHeaders = {}) {
        this.baseURL = baseURL;
        this.headers = {
            'Content-Type': 'application/json',
            ...authHeaders
        };
    }
}

// Instancia global
window.EBRacingAPI = new EBRacingAPI();

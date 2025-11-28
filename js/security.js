/**
 * security.js - Sistema de seguridad centralizado
 * Proporciona funciones de seguridad comunes para toda la aplicación
 */

class SecurityManager {
    constructor() {
        this.tokenKey = 'auth_token';
        this.userKey = 'auth_user';
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas
    }

    // Sanitizar entrada de usuario
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '') // Eliminar tags HTML
            .replace(/javascript:/gi, '') // Eliminar protocolos javascript
            .replace(/on\w+\s*=/gi, ''); // Eliminar event handlers
    }

    // Validar email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar contraseña (mínimo 8 caracteres, 1 mayúscula, 1 número)
    validatePassword(password) {
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        return passwordRegex.test(password);
    }

    // Generar token seguro
    generateSecureToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Verificar si el token es válido y no ha expirado
    isTokenValid() {
        const token = localStorage.getItem(this.tokenKey);
        const user = localStorage.getItem(this.userKey);
        
        if (!token || !user) return false;
        
        try {
            const userData = JSON.parse(user);
            const loginTime = userData.loginTime || 0;
            const now = Date.now();
            
            // Verificar si la sesión ha expirado
            if (now - loginTime > this.sessionTimeout) {
                this.logout();
                return false;
            }
            
            return true;
        } catch (e) {
            this.logout();
            return false;
        }
    }

    // Guardar sesión de forma segura
    saveSession(token, user) {
        const userData = {
            ...user,
            loginTime: Date.now(),
            lastActivity: Date.now()
        };
        
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
    }

    // Cerrar sesión de forma segura
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
        
        // Limpiar otros datos sensibles
        Object.keys(localStorage).forEach(key => {
            if (key.includes('password') || key.includes('token') || key.includes('cart_')) {
                localStorage.removeItem(key);
            }
        });
        
        window.location.href = '../../index.html';
    }

    // Obtener usuario actual
    getCurrentUser() {
        try {
            const user = localStorage.getItem(this.userKey);
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }

    // Verificar CSRF (implementación básica)
    generateCSRFToken() {
        return this.generateSecureToken();
    }

    // Verificar si la solicitud es del mismo origen
    verifyOrigin(request) {
        return request.origin === window.location.origin;
    }

    // Rate limiting simple
    static createRateLimiter(maxRequests = 5, windowMs = 60000) {
        const requests = [];
        
        return function() {
            const now = Date.now();
            const windowStart = now - windowMs;
            
            // Eliminar solicitudes fuera de la ventana de tiempo
            while (requests.length > 0 && requests[0] < windowStart) {
                requests.shift();
            }
            
            if (requests.length >= maxRequests) {
                return false; // Demasiadas solicitudes
            }
            
            requests.push(now);
            return true;
        };
    }
}

// Instancia global
window.security = new SecurityManager();

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
}

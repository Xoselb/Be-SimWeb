/**
 * auth.js - Sistema de autenticación seguro
 * Compatible con el sistema de seguridad centralizado
 */

window.auth = {
    isAuthenticated: function() {
        return window.security ? window.security.isTokenValid() : false;
    },
    
    getCurrentUser: function() {
        return window.security ? window.security.getCurrentUser() : null;
    },
    
    logout: function() {
        if (window.security) {
            window.security.logout();
        } else {
            // Fallback
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            window.location.href = '../../index.html';
        }
    },
    
    handleLogin: function(email, password) {
        // Función dummy - el login real se maneja en index.js
        console.log('handleLogin dummy llamado - usar el sistema de login en index.js');
        return false;
    },
    
    // Nuevas funciones de seguridad
    validateCredentials: function(email, password) {
        if (!window.security) return false;
        
        return window.security.validateEmail(email) && 
               window.security.validatePassword(password);
    },
    
    sanitizeInput: function(input) {
        return window.security ? window.security.sanitizeInput(input) : input;
    }
};

console.log('auth.js seguro cargado con sistema de seguridad centralizado');

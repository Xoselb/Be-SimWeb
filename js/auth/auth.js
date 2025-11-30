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
        return new Promise((resolve, reject) => {
            // Validar credenciales
            if (!this.validateCredentials(email, password)) {
                reject(new Error('Credenciales inválidas'));
                return;
            }

            // Simular autenticación (en producción sería una llamada API)
            setTimeout(() => {
                console.log('Intentando login con:', email, password);
                
                // Verificar usuario de prueba
                if (email === 'test@example.com' && password === 'Test123!') {
                    // Usuario válido - crear sesión
                    const user = {
                        id: 1,
                        email: email,
                        firstName: 'Test',
                        lastName: 'User',
                        name: 'Test User'
                    };
                    
                    const token = window.security.generateSecureToken();
                    console.log('Token generado:', token);
                    console.log('Usuario a guardar:', user);
                    
                    window.security.saveSession(token, user);
                    
                    console.log('Sesión guardada. Verificando...');
                    console.log('Token en localStorage:', localStorage.getItem('auth_token'));
                    console.log('Usuario en localStorage:', localStorage.getItem('auth_user'));
                    console.log('¿Está autenticado?', window.auth.isAuthenticated());
                    
                    resolve({
                        success: true,
                        user: user,
                        token: token
                    });
                } else {
                    // Verificar si hay usuarios guardados en localStorage
                    const storedUser = localStorage.getItem(email);
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            if (userData.password === password) {
                                const user = {
                                    id: userData.id || Date.now(),
                                    email: userData.email,
                                    firstName: userData.nombre || userData.firstName || 'Usuario',
                                    lastName: userData.lastName || 'Registrado',
                                    name: userData.nombre || userData.firstName || 'Usuario'
                                };
                                
                                const token = window.security.generateSecureToken();
                                window.security.saveSession(token, user);
                                
                                resolve({
                                    success: true,
                                    user: user,
                                    token: token
                                });
                                return;
                            }
                        } catch (e) {
                            console.error('Error al leer usuario guardado:', e);
                        }
                    }
                    
                    reject(new Error('Email o contraseña incorrectos'));
                }
            }, 1000); // Simular delay de red
        });
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

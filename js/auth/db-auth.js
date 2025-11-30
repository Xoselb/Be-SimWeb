// db-auth.js - Sistema de autenticación con base de datos real
// Reemplaza al auth.js original cuando se usa base de datos

class DatabaseAuth {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';
        this.token = localStorage.getItem('auth_token');
        this.user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    }

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        if (!this.token || !this.user) {
            return false;
        }
        
        // Verificar si el token ha expirado (simple validación)
        try {
            const payload = JSON.parse(atob(this.token.split('.')[1]));
            const now = Date.now() / 1000;
            return payload.exp > now;
        } catch (e) {
            return false;
        }
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.user;
    }

    // Login con base de datos
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Guardar token y usuario
                this.token = data.data.token;
                this.user = data.data.user;
                
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Registro con base de datos
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                // Guardar token y usuario
                this.token = data.data.token;
                this.user = data.data.user;
                
                localStorage.setItem('auth_token', this.token);
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                
                return data.data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    // Obtener perfil desde base de datos
    async getProfile() {
        try {
            const response = await fetch(`${this.baseURL}/auth/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                this.user = data.data.user;
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                return data.data.user;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            throw error;
        }
    }

    // Actualizar perfil en base de datos
    async updateProfile(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (data.success) {
                this.user = data.data.user;
                localStorage.setItem('auth_user', JSON.stringify(this.user));
                return data.data.user;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    }

    // Cambiar contraseña
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseURL}/auth/change-password`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();

            if (data.success) {
                return data;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            throw error;
        }
    }

    // Logout
    async logout() {
        try {
            if (this.token) {
                await fetch(`${this.baseURL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json',
                    }
                });
            }
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            // Limpiar datos locales
            this.token = null;
            this.user = null;
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            
            // Redirigir
            window.location.href = '/index.html';
        }
    }

    // Validar credenciales (compatibilidad con código existente)
    validateCredentials(email, password) {
        // Validación básica del cliente
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
        
        return emailRegex.test(email) && passwordRegex.test(password);
    }

    // Sanitizar entrada
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .trim()
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '');
    }
}

// Crear instancia global
window.auth = new DatabaseAuth();

// Para compatibilidad con código existente
window.auth.handleLogin = function(email, password) {
    return this.login(email, password);
};

console.log('Database Auth System cargado');

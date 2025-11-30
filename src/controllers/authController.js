// authController.js - Controlador de autenticación para base de datos
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/database');

class AuthController {
    // Registro de usuario
    async register(req, res) {
        try {
            const { firstName, lastName, email, password, phone, address } = req.body;

            // Validaciones
            if (!firstName || !lastName || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos obligatorios son requeridos'
                });
            }

            // Verificar si el usuario ya existe
            let existingUser;
            if (db.type === 'mongodb') {
                existingUser = await db.getModel('User').findOne({ email });
            } else {
                const users = await db.query(
                    'SELECT id FROM users WHERE email = ?',
                    [email]
                );
                existingUser = users.length > 0;
            }

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Encriptar contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear usuario
            let newUser;
            if (db.type === 'mongodb') {
                newUser = await db.getModel('User').create({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword,
                    phone,
                    address
                });
            } else {
                const result = await db.query(
                    `INSERT INTO users (first_name, last_name, email, password, phone, address) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [firstName, lastName, email, hashedPassword, phone, address]
                );
                
                // Obtener usuario creado
                const users = await db.query(
                    'SELECT * FROM users WHERE id = ?',
                    [result.insertId || result[0].id]
                );
                newUser = users[0];
            }

            // Generar token
            const token = jwt.sign(
                { userId: newUser.id || newUser._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Crear sesión
            await this.createSession(newUser.id || newUser._id, token, req);

            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    user: {
                        id: newUser.id || newUser._id,
                        firstName: newUser.firstName || newUser.first_name,
                        lastName: newUser.lastName || newUser.last_name,
                        email: newUser.email,
                        phone: newUser.phone,
                        address: newUser.address
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el registro',
                error: error.message
            });
        }
    }

    // Login de usuario
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validaciones
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos'
                });
            }

            // Buscar usuario
            let user;
            if (db.type === 'mongodb') {
                user = await db.getModel('User').findOne({ email });
            } else {
                const users = await db.query(
                    'SELECT * FROM users WHERE email = ? AND is_active = true',
                    [email]
                );
                user = users[0];
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(
                password,
                user.password
            );

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Actualizar último login
            if (db.type === 'mongodb') {
                await db.getModel('User').findByIdAndUpdate(
                    user._id,
                    { lastLogin: new Date() }
                );
            } else {
                await db.query(
                    'UPDATE users SET last_login = NOW() WHERE id = ?',
                    [user.id]
                );
            }

            // Generar token
            const token = jwt.sign(
                { userId: user.id || user._id },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Crear sesión
            await this.createSession(user.id || user._id, token, req);

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    user: {
                        id: user.id || user._id,
                        firstName: user.firstName || user.first_name,
                        lastName: user.lastName || user.last_name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        avatar: user.avatar
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error en el login',
                error: error.message
            });
        }
    }

    // Obtener perfil de usuario
    async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            let user;
            if (db.type === 'mongodb') {
                user = await db.getModel('User').findById(userId).select('-password');
            } else {
                const users = await db.query(
                    'SELECT id, first_name, last_name, email, phone, address, avatar, created_at FROM users WHERE id = ?',
                    [userId]
                );
                user = users[0];
            }

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id || user._id,
                        firstName: user.firstName || user.first_name,
                        lastName: user.lastName || user.last_name,
                        email: user.email,
                        phone: user.phone,
                        address: user.address,
                        avatar: user.avatar
                    }
                }
            });
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo perfil',
                error: error.message
            });
        }
    }

    // Actualizar perfil de usuario
    async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { firstName, lastName, phone, address } = req.body;

            let updatedUser;
            if (db.type === 'mongodb') {
                updatedUser = await db.getModel('User').findByIdAndUpdate(
                    userId,
                    { firstName, lastName, phone, address },
                    { new: true }
                ).select('-password');
            } else {
                await db.query(
                    'UPDATE users SET first_name = ?, last_name = ?, phone = ?, address = ?, updated_at = NOW() WHERE id = ?',
                    [firstName, lastName, phone, address, userId]
                );

                const users = await db.query(
                    'SELECT id, first_name, last_name, email, phone, address, avatar FROM users WHERE id = ?',
                    [userId]
                );
                updatedUser = users[0];
            }

            res.json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: {
                    user: {
                        id: updatedUser.id || updatedUser._id,
                        firstName: updatedUser.firstName || updatedUser.first_name,
                        lastName: updatedUser.lastName || updatedUser.last_name,
                        email: updatedUser.email,
                        phone: updatedUser.phone,
                        address: updatedUser.address,
                        avatar: updatedUser.avatar
                    }
                }
            });
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Error actualizando perfil',
                error: error.message
            });
        }
    }

    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Validaciones
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva son requeridas'
                });
            }

            // Obtener usuario
            let user;
            if (db.type === 'mongodb') {
                user = await db.getModel('User').findById(userId);
            } else {
                const users = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
                user = users[0];
            }

            // Verificar contraseña actual
            const isValidPassword = await bcrypt.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual incorrecta'
                });
            }

            // Encriptar nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar contraseña
            if (db.type === 'mongodb') {
                await db.getModel('User').findByIdAndUpdate(userId, { password: hashedPassword });
            } else {
                await db.query('UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?', [hashedPassword, userId]);
            }

            res.json({
                success: true,
                message: 'Contraseña cambiada exitosamente'
            });
        } catch (error) {
            console.error('Error cambiando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error cambiando contraseña',
                error: error.message
            });
        }
    }

    // Logout
    async logout(req, res) {
        try {
            const token = req.headers.authorization?.replace('Bearer ', '');
            
            if (token) {
                // Invalidar sesión
                if (db.type === 'mongodb') {
                    await db.getModel('Session').findOneAndUpdate(
                        { token, isActive: true },
                        { isActive: false }
                    );
                } else {
                    await db.query('UPDATE sessions SET is_active = false WHERE token = ?', [token]);
                }
            }

            res.json({
                success: true,
                message: 'Logout exitoso'
            });
        } catch (error) {
            console.error('Error en logout:', error);
            res.status(500).json({
                success: false,
                message: 'Error en logout',
                error: error.message
            });
        }
    }

    // Crear sesión
    async createSession(userId, token, req) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        if (db.type === 'mongodb') {
            await db.getModel('Session').create({
                userId,
                token,
                expiresAt,
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip
            });
        } else {
            await db.query(
                'INSERT INTO sessions (user_id, token, expires_at, user_agent, ip_address) VALUES (?, ?, ?, ?, ?)',
                [userId, token, expiresAt, req.headers['user-agent'], req.ip]
            );
        }
    }

    // Middleware de autenticación
    static authenticate(req, res, next) {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
    }
}

module.exports = new AuthController();

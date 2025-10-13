const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/config');
const { pool } = require('../utils/db');
const logger = require('../utils/logger');
const AppError = require('../utils/appError');

/**
 * Controlador para el registro de usuarios
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función de middleware de Express
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validar datos de entrada
    if (!email || !password || !firstName || !lastName) {
      return next(new AppError('Por favor, proporcione todos los campos requeridos', 400));
    }

    // Verificar si el usuario ya existe
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (existingUsers.length > 0) {
      return next(new AppError('El correo electrónico ya está en uso', 400));
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario en la base de datos
    const [result] = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName]
    );

    // Generar token JWT
    const token = jwt.sign(
      { userId: result.insertId, email, role: 'user' },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Configurar opciones de la cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + config.auth.cookie.maxAge
      ),
      httpOnly: config.auth.cookie.httpOnly,
      secure: config.app.env === 'production',
      sameSite: config.auth.cookie.sameSite,
      domain: config.app.env === 'production' ? config.auth.cookie.domain : undefined,
      path: '/',
    };

    // Enviar respuesta
    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente',
      data: {
        user: {
          id: result.insertId,
          email,
          firstName,
          lastName
        },
        token
      }
    });
  } catch (error) {
    logger.error('Error en el registro de usuario:', error);
    next(new AppError('Error al registrar el usuario', 500));
  }
};

/**
 * Controlador para el inicio de sesión de usuarios
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función de middleware de Express
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      return next(new AppError('Por favor, proporcione correo electrónico y contraseña', 400));
    }

    // Verificar si el usuario existe
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Correo electrónico o contraseña incorrectos', 401));
    }

    // Verificar si el usuario está activo
    if (user.is_active === 0) {
      return next(new AppError('Su cuenta ha sido desactivada. Por favor, contacte al administrador.', 403));
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role || 'user' },
      config.auth.jwtSecret,
      { expiresIn: config.auth.jwtExpiresIn }
    );

    // Configurar opciones de la cookie
    const cookieOptions = {
      expires: new Date(
        Date.now() + config.auth.cookie.maxAge
      ),
      httpOnly: config.auth.cookie.httpOnly,
      secure: config.app.env === 'production',
      sameSite: config.auth.cookie.sameSite,
      domain: config.app.env === 'production' ? config.auth.cookie.domain : undefined,
      path: '/',
    };

    // Configurar la cookie de autenticación
    res.cookie('token', token, cookieOptions);

    // Eliminar la contraseña de la respuesta
    user.password = undefined;

    // Enviar respuesta
    res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('Error en el inicio de sesión:', error);
    next(new AppError('Error al iniciar sesión', 500));
  }
};

/**
 * Controlador para cerrar sesión
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 */
const logout = (req, res) => {
  // Limpiar la cookie de autenticación
  res.clearCookie('token');
  
  res.status(200).json({
    status: 'success',
    message: 'Sesión cerrada exitosamente'
  });
};

/**
 * Controlador para verificar la autenticación
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 */
const verifyAuth = (req, res) => {
  // Si llegamos aquí, el token es válido y el usuario está autenticado
  res.status(200).json({
    status: 'success',
    message: 'Token válido',
    data: {
      user: req.user
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  verifyAuth
};

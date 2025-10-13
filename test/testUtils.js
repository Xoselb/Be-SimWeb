const jwt = require('jsonwebtoken');
const db = require('../server/db');
const bcrypt = require('bcrypt');

/**
 * Genera un token JWT para pruebas
 * @param {number} userId - ID del usuario
 * @param {string} email - Email del usuario
 * @returns {string} Token JWT
 */
const generateTestToken = (userId, email) => {
  return jwt.sign(
    { 
      userId, 
      email,
      // Asegurarse de que el token tenga todos los campos necesarios
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hora de expiración
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

/**
 * Crea un usuario de prueba en la base de datos
 * @param {Object} userData - Datos del usuario (opcionales)
 * @returns {Promise<Object>} Usuario creado
 */
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test123!',
    firstName: 'Test',
    lastName: 'User'
  };
  
  const user = { ...defaultUser, ...userData };
  
  try {
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    // Insertar usuario en la base de datos
    const [result] = await db.pool.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [user.email, hashedPassword, user.firstName, user.lastName]
    );
    
    // Obtener el usuario recién creado
    const [users] = await db.pool.query(
      `SELECT 
        id, 
        email, 
        first_name as firstName, 
        last_name as lastName,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users 
      WHERE id = ?`,
      [result.insertId]
    );
    
    if (!users.length) {
      throw new Error('No se pudo crear el usuario de prueba');
    }
    
    // Generar token para el usuario
    const token = generateTestToken(users[0].id, users[0].email);
    
    return {
      ...users[0],
      password: user.password, // Devolver la contraseña en texto plano para pruebas
      token
    };
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    throw error;
  }
};

/**
 * Obtiene un usuario por su ID
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} Usuario encontrado
 */
const getUserById = async (userId) => {
  try {
    const [users] = await db.pool.query(
      `SELECT 
        id, 
        email, 
        first_name as firstName, 
        last_name as lastName,
        created_at as createdAt,
        updated_at as updatedAt
      FROM users 
      WHERE id = ?`,
      [userId]
    );
    
    return users[0] || null;
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    throw error;
  }
};

module.exports = {
  generateTestToken,
  createTestUser,
  getUserById
};

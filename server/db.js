const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'esimracing_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(DB_CONFIG);

console.log('Configuración de la base de datos:', {
    ...DB_CONFIG,
    password: DB_CONFIG.password ? '***' : '(vacía)'
});

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Conexión a la base de datos exitosa');
        connection.release();
        return true;
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        return false;
    }
}

// Crear la tabla de usuarios si no existe
async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();
        console.log('Conectado a la base de datos MySQL');
        
        await connection.query(`CREATE DATABASE IF NOT EXISTS esimracing_db`);
        await connection.query(`USE esimracing_db`);
        
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                country VARCHAR(50) NOT NULL,
                birthdate DATE NOT NULL,
                street VARCHAR(100) NOT NULL,
                street_number VARCHAR(20) NOT NULL,
                accept_terms BOOLEAN NOT NULL DEFAULT FALSE,
                accept_marketing BOOLEAN NOT NULL DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        
        connection.release();
        console.log('Base de datos inicializada correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    }
}

module.exports = {
    pool,
    initializeDatabase,
    testConnection
};
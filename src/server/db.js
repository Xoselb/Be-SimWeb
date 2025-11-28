const mysql = require('mysql2/promise');

// [CAMBIAR] Configuración de la base de datos de producción
// ======================================================
// Asegúrate de configurar estas variables de entorno en el servidor de producción
// en el archivo .env o en el sistema de gestión de configuración de tu empresa

// Usar configuración de test si estamos en entorno de prueba
const isTest = process.env.NODE_ENV === 'test';
const dbName = isTest ? (process.env.TEST_DB_NAME || 'test_esimracing_db') : (process.env.DB_NAME || 'esimracing_db');

const DB_CONFIG = {
    // [CAMBIAR] Configuración del servidor de base de datos de producción
    host: process.env.DB_HOST || '127.0.0.1', // [CAMBIAR] IP o hostname del servidor de BD en producción
    user: process.env.DB_USER || 'root',      // [CAMBIAR] Usuario de la base de datos
    password: process.env.DB_PASSWORD || '',  // [CAMBIAR] Contraseña segura
    // database: dbName,                         // [CAMBIAR] Nombre de la base de datos - se conectará sin BD primero
    
    // Configuración del pool de conexiones
    waitForConnections: true,
    connectionLimit: 10,                      // [CAMBIAR] Ajustar según la carga esperada
    queueLimit: 0,                            // [CAMBIAR] Límite de conexiones en cola
    
    // Configuración de la conexión
    multipleStatements: true,                 // [CAMBIAR] Desactivar en producción si no es necesario
    connectTimeout: 30000,                    // 30 segundos de tiempo de espera
    charset: 'utf8mb4',                       // [CAMBIAR] Asegurar compatibilidad con caracteres especiales
    timezone: 'local',                        // [CAMBIAR] Ajustar según la zona horaria del servidor
    debug: isTest,                            // Solo habilitar en desarrollo/pruebas
    namedPlaceholders: true,                  // Habilitar placeholders con nombre
    
    // [CAMBIAR] Configuración de SSL para producción (recomendado)
    // ssl: {
    //   rejectUnauthorized: true,
    //   ca: fs.readFileSync('/ruta/al/certificado-ca.pem'),
    //   key: fs.readFileSync('/ruta/a/la/clave-privada.pem'),
    //   cert: fs.readFileSync('/ruta/al/certificado.pem')
    // }
};

// Crear el pool de conexiones (sin base de datos específica para inicialización)
const initPool = mysql.createPool(DB_CONFIG);

// Pool para la base de datos específica (se creará después de la inicialización)
let dbPool = null;

// Registrar eventos del pool
initPool.on('acquire', (connection) => {
    if (isTest) {
        console.log('Conexión adquirida del pool');
    }
});

initPool.on('release', (connection) => {
    if (isTest) {
        console.log('Conexión liberada al pool');
    }
});

console.log(`Configuración de la base de datos (${isTest ? 'TEST' : 'PRODUCCIÓN'}):`, {
    ...DB_CONFIG,
    password: DB_CONFIG.password ? '***' : '(vacía)'
});

// Función para probar la conexión
async function testConnection() {
    try {
        const connection = await initPool.getConnection();
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
        const connection = await initPool.getConnection();
        console.log('Conectado a MySQL sin base de datos específica');
        
        // Crear la base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
        console.log(`Base de datos '${dbName}' creada o verificada`);
        
        // Liberar la conexión de inicialización
        connection.release();
        
        // Ahora crear el pool para la base de datos específica
        const dbConfig = { ...DB_CONFIG, database: dbName };
        dbPool = mysql.createPool(dbConfig);
        
        // Conectar a la base de datos específica y crear la tabla
        const dbConnection = await dbPool.getConnection();
        
        await dbConnection.query(`
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
        
        dbConnection.release();
        console.log('Base de datos y tabla users inicializadas correctamente');
        return true;
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    }
}

module.exports = {
    pool: () => dbPool || initPool, // Devuelve dbPool si está inicializado, sino initPool
    initializeDatabase,
    testConnection
};
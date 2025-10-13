// Configuración global para las pruebas
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.NODE_ENV = 'test';

// Configuración de base de datos para pruebas
process.env.DB_HOST = '127.0.0.1'; // Usar 127.0.0.1 en lugar de localhost
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.TEST_DB_NAME = 'test_esimracing_db';

// Importar el módulo de base de datos después de configurar las variables de entorno
const db = require('./server/db');

// Configurar el tiempo de espera global para las pruebas
jest.setTimeout(30000); // 30 segundos

// Funciones de utilidad para las pruebas
const testUtils = {
  // Inicializar la base de datos de prueba
  initializeTestDatabase: async () => {
    try {
      console.log('Inicializando base de datos de prueba...');
      
      // Crear la base de datos si no existe
      await db.pool.query(`
        CREATE DATABASE IF NOT EXISTS \`${process.env.TEST_DB_NAME}\`
        CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
      `);
      
      // Usar la base de datos de prueba
      await db.pool.query(`USE \`${process.env.TEST_DB_NAME}\`;`);
      
      // Crear tablas necesarias para pruebas
      await db.pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      await db.pool.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          token VARCHAR(512) NOT NULL,
          expires_at DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log('✅ Base de datos de prueba inicializada correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar la base de datos de prueba:', error);
      throw error;
    }
  },
  
  // Limpiar la base de datos de prueba
  clearTestDatabase: async () => {
    try {
      await db.pool.query('SET FOREIGN_KEY_CHECKS = 0');
      await db.pool.query('TRUNCATE TABLE sessions');
      await db.pool.query('TRUNCATE TABLE users');
      await db.pool.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log('🧹 Base de datos de prueba limpiada');
    } catch (error) {
      console.error('❌ Error al limpiar la base de datos de prueba:', error);
      throw error;
    }
  },
  
  // Cerrar la conexión a la base de datos
  closeDatabase: async () => {
    try {
      await db.pool.end();
      console.log('🔌 Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('❌ Error al cerrar la conexión a la base de datos:', error);
      throw error;
    }
  }
};

// Configuración global de Jest
beforeAll(async () => {
  try {
    await testUtils.initializeTestDatabase();
  } catch (error) {
    console.error('Error en beforeAll:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  try {
    await testUtils.clearTestDatabase();
  } catch (error) {
    console.error('Error en afterEach:', error);
  }
});

afterAll(async () => {
  try {
    await testUtils.clearTestDatabase();
    await testUtils.closeDatabase();
  } catch (error) {
    console.error('Error en afterAll:', error);
  }
});

// Hacer las utilidades disponibles globalmente
global.testUtils = testUtils;

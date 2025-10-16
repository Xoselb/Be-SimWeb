// Configuración global para las pruebas
process.env.JWT_SECRET = 'test-secret-key-for-jest';
process.env.NODE_ENV = 'test';

// Configuración de base de datos para pruebas
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.TEST_DB_NAME = 'test_esimracing_db';

// Configurar el tiempo de espera global para las pruebas
jest.setTimeout(30000); // 30 segundos

// Funciones de utilidad para las pruebas
const testUtils = {
  // Inicializar la base de datos de prueba
  initializeTestDatabase: async () => {
    try {
      // Importar dinámicamente para asegurar que las variables de entorno estén configuradas
      const { sequelize } = require('../../server/db');
      
      // Sincronizar la base de datos (crear tablas)
      await sequelize.sync({ force: true });
      
      // Aquí podrías agregar datos de prueba iniciales
      // await User.create({ ... });
      
      console.log('✅ Base de datos de prueba inicializada');
    } catch (error) {
      console.error('❌ Error al inicializar la base de datos de prueba:', error);
      throw error;
    }
  },

  // Limpiar la base de datos de prueba
  clearTestDatabase: async () => {
    try {
      const { sequelize } = require('../../server/db');
      
      // Eliminar todas las tablas
      await sequelize.sync({ force: true });
      
      console.log('🧹 Base de datos de prueba limpiada');
    } catch (error) {
      console.error('Error al limpiar la base de datos de prueba:', error);
      throw error;
    }
  },

  // Cerrar la conexión a la base de datos
  closeDatabase: async () => {
    try {
      const { sequelize } = require('../../server/db');
      await sequelize.close();
      console.log('🔌 Conexión a la base de datos cerrada');
    } catch (error) {
      console.error('Error al cerrar la conexión a la base de datos:', error);
      throw error;
    }
  }
};

// Hacer las utilidades disponibles globalmente en las pruebas
global.testUtils = testUtils;

// Configuración global de Jest
beforeAll(async () => {
  try {
    // Inicializar la base de datos antes de todas las pruebas
    await testUtils.initializeTestDatabase();
  } catch (error) {
    console.error('Error en beforeAll:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  // Limpiar la base de datos después de cada prueba
  await testUtils.clearTestDatabase();
});

afterAll(async () => {
  // Cerrar la conexión a la base de datos después de todas las pruebas
  await testUtils.closeDatabase();
});

// Configuración de consola para pruebas
console.log = () => {}; // Silenciar console.log
console.error = () => {}; // Silenciar console.error

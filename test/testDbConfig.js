// Configuración de la base de datos de prueba
const testDbConfig = {
  host: process.env.DB_HOST || '127.0.0.1', // Usar 127.0.0.1 en lugar de localhost para evitar problemas con IPv6
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.TEST_DB_NAME || 'test_esimracing_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true, // Permitir múltiples sentencias SQL
  connectTimeout: 30000, // 30 segundos de tiempo de espera para la conexión
  charset: 'utf8mb4',
  timezone: 'local'
};

console.log('Configuración de la base de datos de prueba:', {
  ...testDbConfig,
  password: testDbConfig.password ? '[hidden]' : '(vacía)'
});

module.exports = testDbConfig;

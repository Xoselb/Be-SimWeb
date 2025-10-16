const path = require('path');

module.exports = {
  testEnvironment: 'node',                    // Entorno de pruebas (Node.js)
  testMatch: ['**/__tests__/**/*.test.js'],   // Patrón para encontrar archivos de prueba
  collectCoverage: true,                      // Habilitar generación de cobertura
  coverageDirectory: path.join(__dirname, '../../coverage'),  // Directorio de cobertura
  coverageReporters: ['text', 'lcov', 'html'], // Formatos de reporte
  setupFilesAfterEnv: [path.join(__dirname, 'jest.setup.js')], // Archivo de configuración
  testTimeout: 30000,                         // Tiempo de espera para las pruebas (30s)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'           // Mapeo de rutas para imports
  },
  // Ignorar node_modules y carpetas de cobertura
  testPathIgnorePatterns: [
    '/node_modules/',
    '/coverage/'
  ]
};

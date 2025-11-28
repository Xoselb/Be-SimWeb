#!/usr/bin/env node
'use strict';

/**
 * Módulo principal de la aplicación Eb_SimWeb
 * @module index
 */

// Cargar variables de entorno
require('dotenv').config();

// Verificar variables de entorno requeridas
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET'
];

// Verificar variables de entorno faltantes
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error(`Error: Faltan las siguientes variables de entorno requeridas: ${missingVars.join(', ')}`);
  process.exit(1);
}

// Importar la aplicación
const { startServer } = require('./src/app');

// Iniciar el servidor
startServer().catch(error => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});

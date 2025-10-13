const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

// Importar configuraciones
const config = require('../config/config');
const { connectDB } = require('./utils/db');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const apiRoutes = require('./routes/api.routes');

// Inicializar la aplicación Express
const app = express();

// Configuración de middleware básicos
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Configuración de seguridad
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

// Configuración de CORS
app.use(cors(config.cors));

// Configuración de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 peticiones por ventana
  message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo más tarde.'
});
app.use('/api/', limiter);

// Configuración de logs en desarrollo
if (config.app.env === 'development') {
  app.use(morgan('dev'));
} else {
  // Logging en producción
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', apiRoutes);

// Ruta de verificación de estado
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'El servidor está funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: config.app.env,
    version: config.app.version
  });
});

// Manejo de rutas no encontradas
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `No se pudo encontrar ${req.originalUrl} en este servidor.`
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB();
    
    // Iniciar el servidor
    const server = app.listen(config.app.port, () => {
      logger.info(`Servidor ejecutándose en modo ${config.app.env} en el puerto ${config.app.port}`);
    });

    // Manejo de errores no capturados
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Apagando...');
      logger.error(err.name, err.message);
      
      server.close(() => {
        process.exit(1);
      });
    });

    // Manejo de excepciones no capturadas
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! 💥 Apagando...');
      logger.error(err.name, err.message);
      
      process.exit(1);
    });

    // Manejo de la señal SIGTERM
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM RECIBIDO. Apagando el servidor...');
      server.close(() => {
        logger.info('💥 Proceso terminado');
      });
    });

    return server;
  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };

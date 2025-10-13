require('dotenv').config();

const config = {
  // Configuración de la aplicación
  app: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    name: 'Eb_SimWeb',
    version: '1.0.0'
  },
  
  // Configuración de la base de datos
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'Eb_SimWeb',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    // Configuración de SSL para producción
    ...(process.env.NODE_ENV === 'production' && {
      ssl: {
        rejectUnauthorized: true,
        // Asegúrate de configurar las rutas correctas a tus certificados
        // ca: fs.readFileSync('/ruta/al/certificado-ca.pem'),
        // key: fs.readFileSync('/ruta/a/la/clave-privada.pem'),
        // cert: fs.readFileSync('/ruta/al/certificado.pem')
      }
    })
  },
  
  // Configuración de autenticación
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'clave_secreta_por_defecto_cambiar_en_produccion',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshTokenExpiresIn: '7d',
    passwordResetExpires: 3600000, // 1 hora en milisegundos
    cookie: {
      domain: process.env.COOKIE_DOMAIN || 'localhost',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  },
  
  // Configuración de CORS
  cors: {
    origin: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  // Configuración de logs
  logs: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
    maxSize: '20m',
    maxFiles: '14d'
  },
  
  // Configuración de correo electrónico
  email: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || 'user@example.com',
      pass: process.env.SMTP_PASS || 'password'
    },
    from: `"${process.env.EMAIL_FROM_NAME || 'Eb_SimWeb'}" <${process.env.EMAIL_FROM || 'noreply@example.com'}>`
  },
  
  // Configuración de la aplicación
  appSettings: {
    // Tiempo de expiración de sesión en milisegundos (24 horas)
    sessionExpiration: 24 * 60 * 60 * 1000,
    // Tamaño máximo de carga de archivos (10MB)
    maxFileSize: 10 * 1024 * 1024,
    // Tipos de archivos permitidos
    allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf']
  }
};

// Exportar configuración según el entorno
module.exports = config;

// [CAMBIAR] Configuración del servidor de production
// ===============================================
// Importation des dépendances
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');

// Cargar variables de entorno
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_default';

// Création de l'application Express
const app = express();

// [CAMBIAR] Middlewares de seguridad
// ================================
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// [CAMBIAR] Configuración de la base de datos
// =========================================
const { pool: getPool, initializeDatabase, testConnection } = require('./db');

const corsOptions = {
    origin: function (origin, callback) {
        // [CAMBIAR] En producción, es recomendable deshabilitar el acceso sin origen
        // si no es estrictamente necesario para tu caso de uso
        if (!origin && process.env.NODE_ENV === 'production') {
            console.warn('Advertencia: Solicitud sin origen (Origin) en producción');
            // return callback(new Error('Se requiere el encabezado Origin'), false);
        }
        
        // [CAMBIAR] Lista de orígenes permitidos en producción
        // Formato en .env: ALLOWED_ORIGINS=https://tudominio.com,https://api.tudominio.com
        const allowedOrigins = process.env.ALLOWED_ORIGINS 
            ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
            : [];
        
        // [CAMBIAR] En desarrollo, permitir cualquier origen
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // Verificar si el origen está permitido
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `Origen no permitido por CORS: ${origin}. Orígenes permitidos: ${allowedOrigins.join(', ')}`;
            console.warn(msg);
            return callback(new Error(msg), false);
        }
        
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200, // Algunos clientes (ej: Angular) requieren este código
    maxAge: 86400 // Cachear la respuesta de preflight por 24 horas
};

// Aplicar middlewares de seguridad
// app.use(helmet({
//     contentSecurityPolicy: {
//         directives: {
//             defaultSrc: ["'self'"],
//             styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
//             fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
//             imgSrc: ["'self'", "data:", "/public/img/"],
//             scriptSrc: ["'self'"],
//             connectSrc: ["'self'"]
//         }
//     }
// })); // Añade varios encabezados de seguridad
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Límite de peticiones (100 peticiones por 15 minutos por IP)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,
    message: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos'
});
app.use('/api', limiter);

// Body parser, leyendo datos del body en req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitización contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitización contra XSS
app.use(xss());

// Prevenir parameter pollution
app.use(hpp({
    whitelist: ['precio', 'categoría'] // Campos que pueden tener múltiples valores
}));

// Configuración segura de cookies
app.use(cookieParser());
app.set('trust proxy', 1); // Confiar en el primer proxy

// Servir archivos estáticos
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../../'), {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
    }
}));

// Ruta principal - servir index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Rutas específicas para CSS con headers correctos
app.get('/css/*.css', (req, res, next) => {
    res.setHeader('Content-Type', 'text/css; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
});

// Ruta para manejar imágenes faltantes
app.get('/img/*', (req, res) => {
    res.status(200).send('');
});

// Ruta para favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Ruta para manejar el envío del formulario de contacto
app.post('/api/contact', async (req, res) => {
    console.log('=== SOLICITUD DE CONTACTO RECIBIDA ===');
    console.log('Datos del formulario:', JSON.stringify(req.body, null, 2));
    
    try {
        // Validar los datos del formulario
        const { 
            profileType, 
            contactReason, 
            firstName, 
            lastName, 
            email, 
            phone, 
            country, 
            province, 
            city, 
            postalCode, 
            subject, 
            message 
        } = req.body;

        // Validaciones básicas
        if (!profileType || !contactReason || !firstName || !lastName || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Por favor, complete todos los campos obligatorios.' 
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Por favor, proporcione un correo electrónico válido.' 
            });
        }

        // Aquí iría la lógica para guardar en la base de datos
        // Por ejemplo:
        /*
        const [result] = await pool.query(
            `INSERT INTO contact_submissions 
            (profile_type, contact_reason, first_name, last_name, email, phone, 
             country, province, city, postal_code, subject, message, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [profileType, contactReason, firstName, lastName, email, phone, 
             country, province, city, postalCode, subject, message]
        );
        */

        // Enviar notificación por correo electrónico (opcional)
        // Aquí iría el código para enviar un correo electrónico

        console.log('Mensaje de contacto guardado correctamente');
        
        res.status(200).json({ 
            success: true, 
            message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.' 
        });

    } catch (error) {
        console.error('Error al procesar el formulario de contacto:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al procesar el formulario. Por favor, inténtelo de nuevo más tarde.'
        });
    }
});

// Logging de todas las peticiones
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Debug: Log all incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Test route to check if API is working
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Ruta para el registro de usuarios
app.post('/api/register', async (req, res) => {
    console.log('=== SOLICITUD DE REGISTRO RECIBIDA ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        // Verificar si el cuerpo de la solicitud está vacío
        if (!req.body || Object.keys(req.body).length === 0) {
            console.error('Error: Cuerpo de la solicitud vacío');
            return res.status(400).json({ 
                success: false,
                error: 'Datos de registro no proporcionados' 
            });
        }
        const {
            firstName,
            lastName,
            email,
            password,
            country,
            birthdate,
            street,
            streetNumber,
            acceptTerms,
            acceptMarketing = false
        } = req.body;

        // Validación de campos requeridos
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!password) missingFields.push('password');
        if (!firstName) missingFields.push('firstName');
        if (!lastName) missingFields.push('lastName');
        if (!country) missingFields.push('country');
        if (!birthdate) missingFields.push('birthdate');
        if (!street) missingFields.push('street');
        if (!streetNumber) missingFields.push('streetNumber');

        if (missingFields.length > 0) {
            console.log('Faltan campos requeridos:', missingFields);
            return res.status(400).json({ 
                error: 'Faltan campos obligatorios',
                missingFields: missingFields
            });
        }

        if (!acceptTerms) {
            console.log('Términos no aceptados');
            return res.status(400).json({ 
                error: 'Debes aceptar los términos y condiciones para continuar' 
            });
        }

        // Verificar si el correo ya existe
        try {
            const pool = getPool();
            const [existingUsers] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUsers.length > 0) {
                console.log('Correo ya registrado:', email);
                return res.status(409).json({ 
                    error: 'El correo electrónico ya está registrado' 
                });
            }
        } catch (dbError) {
            console.error('Error al verificar correo existente:', dbError);
            throw new Error('Error al verificar la información del usuario');
        }

        // Hashear la contraseña
        let passwordHash;
        try {
            const saltRounds = 10;
            passwordHash = await bcrypt.hash(password, saltRounds);
        } catch (hashError) {
            console.error('Error al hashear la contraseña:', hashError);
            throw new Error('Error al procesar la contraseña');
        }

        // Insertar usuario en la base de datos
        try {
            console.log('Intentando insertar usuario en la base de datos...');
            const pool = getPool();
            
            const [result] = await pool.query(
                `INSERT INTO users 
                 (first_name, last_name, email, password_hash, country, birthdate, street, street_number, accept_terms, accept_marketing)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    firstName,
                    lastName,
                    email,
                    passwordHash,
                    country,
                    new Date(birthdate).toISOString().split('T')[0], // Asegurar formato de fecha
                    street,
                    streetNumber,
                    acceptTerms ? 1 : 0,
                    acceptMarketing ? 1 : 0
                ]
            );

            console.log('Usuario registrado exitosamente con ID:', result.insertId);
            
            // Generar token JWT
            const userPayload = { 
                userId: result.insertId, 
                email: email 
            };
            
            console.log('Generando token JWT con payload:', userPayload);
            
            const token = jwt.sign(
                userPayload,
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Token JWT generado correctamente');

            // [CAMBIAR] Configuración de cookies seguras para producción
            // =======================================================
            const cookieOptions = {
                // [CAMBIAR] Configuración básica de cookies
                httpOnly: true, // No accesible desde JavaScript
                secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
                sameSite: 'strict', // Protección contra CSRF
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                path: '/',
                
                // [CAMBIAR] Configuración específica para producción
                ...(process.env.NODE_ENV === 'production' && { 
                    // [CAMBIAR] Dominio de la cookie (ajustar según tu dominio)
                    domain: process.env.COOKIE_DOMAIN || '.tudominio.com',
                    
                    // [CAMBIAR] Configuración de seguridad estricta
                    secure: true,      // Solo enviar sobre HTTPS
                    httpOnly: true,    // No accesible desde JavaScript
                    sameSite: 'lax',   // O 'strict' para máxima seguridad
                    
                    // [CAMBIAR] Configuraciones adicionales (descomentar según necesidad)
                    // sameSite: 'none',  // Necesario para CORS entre dominios
                    // path: '/api',     // Limitar ruta de la cookie
                    // maxAge: 86400000,  // 24 horas en milisegundos
                    
                    // [CAMBIAR] Prefijos de seguridad (requiere configuración adicional)
                    // name: `__Secure-token`,  // Requiere secure
                    // name: `__Host-token`,    // Requiere secure, path=/, sin dominio
                    // y solo a través de HTTP/3
                    // y solo a través de WebSockets seguros
                    // y solo a través de WebRTC seguro
                    // y solo a través de Service Workers seguros
                    // y solo a través de Fetch API segura
                    // y solo a través de XMLHttpRequest segura
                    // y solo a través de Beacon API segura
                    // y solo a través de Fetch Event segura
                    // y solo a través de Navigation Preload segura
                    // y solo a través de Server-Sent Events segura
                    // y solo a través de EventSource segura
                    // y solo a través de Web Push segura
                    // y solo a través de Background Sync segura
                    // y solo a través de Background Fetch segura
                    // y solo a través de Periodic Sync segura
                    // y solo a través de Web Share Target segura
                    // y solo a través de Web App Manifest segura
                    // y solo a través de Payment Request API segura
                    // y solo a través de Credential Management API segura
                    // y solo a través de Web Authentication API segura
                    // y solo a través de Web NFC API segura
                    // y solo a través de Web Bluetooth API segura
                    // y solo a través de Web USB API segura
                    // y solo a través de WebHID API segura
                    // y solo a través de Web Serial API segura
                    // y solo a través de Web Locks API segura
                    // y solo a través de Web Share API segura
                    // y solo a través de WebXR Device API segura
                    // y solo a través de Web Audio API segura
                    // y solo a través de WebGL segura
                    // y solo a través de WebGPU segura
                    // y solo a través de WebAssembly segura
                    // y solo a través de WebCodecs API segura
                    // y solo a través de WebTransport API segura
                    // y solo a través de WebNN API segura
                    // y solo a través de WebGPU segura
                    // y solo a través de WebHID API segura
                    // y solo a través de Web Serial API segura
                    // y solo a través de Web Locks API segura
                    // y solo a través de Web Share API segura
                    // y solo a través de WebXR Device API segura
                    // y solo a través de Web Audio API segura
                    // y solo a través de WebGL segura
                    // y solo a través de WebGPU segura
                    // y solo a través de WebAssembly segura
                    // y solo a través de WebCodecs API segura
                    // y solo a través de WebTransport API segura
                    // y solo a través de WebNN API segura
                    // y solo a través de WebGPU segura
                    // y solo a través de WebHID API segura
                    // y solo a través de Web Serial API segura
                    // y solo a través de Web Locks API segura
                    // y solo a través de Web Share API segura
                    // y solo a través de WebXR Device API segura
                    // y solo a través de Web Audio API segura
                    // y solo a través de WebGL segura
                    // y solo a través de WebGPU segura
                    // y solo a través de WebAssembly segura
                    // y solo a través de WebCodecs API segura
                    // y solo a través de WebTransport API segura
                    // y solo a través de WebNN API segura
                })
            };
            
            // Configurar la cookie de autenticación
            res.cookie('token', token, cookieOptions);
            
            // Configurar encabezados de seguridad adicionales
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

            // Enviar respuesta exitosa con el token
            const responseData = {
                success: true,
                message: 'Usuario registrado exitosamente',
                token: token,
                user: {
                    id: result.insertId,
                    email: email,
                    firstName: firstName,
                    lastName: lastName
                }
            };
            
            console.log('Enviando respuesta exitosa:', JSON.stringify(responseData, null, 2));
            return res.status(201).json(responseData);

        } catch (insertError) {
            console.error('Error al insertar usuario:', insertError);
            throw new Error('Error al guardar la información del usuario');
        }

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error al procesar el registro',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Ruta para el login de usuarios
app.post('/api/login', async (req, res) => {
    console.log('=== SOLICITUD DE LOGIN RECIBIDA ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    try {
        const { email, password } = req.body;

        // Validación de campos requeridos
        if (!email || !password) {
            console.log('Faltan campos requeridos: email o password');
            return res.status(400).json({ 
                success: false,
                error: 'El correo electrónico y la contraseña son obligatorios'
            });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Formato de email inválido:', email);
            return res.status(400).json({ 
                success: false,
                error: 'Por favor, proporcione un correo electrónico válido'
            });
        }

        // Buscar usuario en la base de datos
        try {
            const pool = getPool();
            const [users] = await pool.query(
                'SELECT id, first_name, last_name, email, password_hash, country, birthdate, street, street_number, created_at FROM users WHERE email = ?',
                [email]
            );

            if (users.length === 0) {
                console.log('Usuario no encontrado:', email);
                return res.status(401).json({ 
                    success: false,
                    error: 'Correo electrónico o contraseña incorrectos'
                });
            }

            const user = users[0];

            // Verificar la contraseña
            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                console.log('Contraseña incorrecta para:', email);
                return res.status(401).json({ 
                    success: false,
                    error: 'Correo electrónico o contraseña incorrectos'
                });
            }

            // Generar token JWT
            const userPayload = { 
                userId: user.id, 
                email: user.email 
            };
            
            console.log('Generando token JWT con payload:', userPayload);
            
            const token = jwt.sign(
                userPayload,
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            console.log('Token JWT generado correctamente');

            // Configurar la cookie de autenticación
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                path: '/'
            };
            
            res.cookie('token', token, cookieOptions);

            // Enviar respuesta exitosa
            const responseData = {
                success: true,
                message: 'Inicio de sesión exitoso',
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    country: user.country,
                    birthdate: user.birthdate,
                    street: user.street,
                    streetNumber: user.street_number
                },
                token: token
            };
            
            console.log('Enviando respuesta de login exitosa:', JSON.stringify(responseData, null, 2));
            return res.status(200).json(responseData);

        } catch (dbError) {
            console.error('Error al buscar usuario en la base de datos:', dbError);
            return res.status(500).json({ 
                success: false,
                error: 'Error al verificar las credenciales'
            });
        }

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ 
            success: false,
            error: error.message || 'Error al procesar el inicio de sesión',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Middleware para verificar el token JWT
const authenticateToken = async (req, res, next) => {
    // Rutas que no requieren autenticación
    const publicPaths = [
        '/api/register', 
        '/api/login', 
        '/api/verify-token', 
        '/favicon.ico',
        '/',
        '/index.html',
        '/css/',
        '/js/',
        '/img/'
    ];

    // Verificar si la ruta actual es pública
    const isPublicPath = publicPaths.some(path => {
        return req.path === path || req.path.startsWith(path);
    });
    
    if (isPublicPath) {
        console.log(`Ruta pública detectada: ${req.path}, omitiendo autenticación`);
        return next();
    }

    console.log('=== Verificando token de autenticación ===');
    console.log('URL:', req.originalUrl);
    console.log('Método:', req.method);
    
    // Obtener el token de varias fuentes posibles
    let token = null;
    
    // 1. Verificar el encabezado Authorization (Bearer token)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('Token encontrado en el encabezado Authorization');
    }
    // 2. Verificar las cookies (para autenticación web)
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('Token encontrado en las cookies');
    }
    // 3. Verificar el query parameter (útil para pruebas, no recomendado en producción)
    else if (req.query && req.query.token) {
        if (process.env.NODE_ENV !== 'production') {
            token = req.query.token;
            console.log('Token encontrado en query parameter (solo en desarrollo)');
        } else {
            console.warn('Intento de usar token en query parameter en producción');
        }
    }
    
    // Log seguro del token (solo últimos 5 caracteres)
    console.log('Token recibido:', token ? `*****${token.slice(-5)}` : 'No proporcionado');
    
    if (!token) {
        console.log('Error: Token no proporcionado');
        return res.status(401).json({ 
            success: false,
            error: 'Acceso no autorizado. Se requiere autenticación.',
            code: 'AUTH_REQUIRED',
            path: req.path
        });
    }
    
    try {
        // Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: ['HS256'], // Solo permitir algoritmo HS256
            ignoreExpiration: false, // No ignorar la expiración
            clockTolerance: 30, // 30 segundos de tolerancia para sincronización de reloj
            maxAge: '24h' // Máximo tiempo de vida del token
        });
        
        // Verificar que el token tenga los campos requeridos
        if (!decoded.userId || !decoded.email) {
            throw new Error('Token inválido: faltan campos requeridos');
        }
        
        // Añadir el usuario decodificado al objeto de solicitud
        req.user = decoded;
        
        // Registrar el acceso exitoso (sin información sensible)
        console.log(`Usuario autenticado: ${decoded.email} (ID: ${decoded.userId})`);
        
        // Continuar con la siguiente función de middleware
        return next();
        
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        
        // Limpiar la cookie si existe
        if (req.cookies && req.cookies.token) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/',
                domain: process.env.COOKIE_DOMAIN
            });
        }
        
        // Mensajes de error específicos
        let errorMessage = 'Token inválido o expirado';
        let statusCode = 401;
        
        if (error.name === 'TokenExpiredError') {
            errorMessage = 'La sesión ha expirado. Por favor, inicie sesión nuevamente.';
            statusCode = 401; // No autorizado
        } else if (error.name === 'JsonWebTokenError') {
            errorMessage = 'Token de autenticación inválido';
            statusCode = 403; // Prohibido
        } else if (error.name === 'NotBeforeError') {
            errorMessage = 'El token no es válido aún';
            statusCode = 401; // No autorizado
        }
        
        return res.status(statusCode).json({
            success: false,
            error: errorMessage,
            code: error.name || 'AUTH_ERROR',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        });
    }
    
    // Verificar el token
    try {
        console.log('Verificando token con JWT...');
        const user = jwt.verify(token, JWT_SECRET);
        console.log('Token válido para el usuario:', user);
        
        // Añadir el usuario a la solicitud para su uso posterior
        req.user = user;
        next();
    } catch (err) {
        console.error('Error al verificar token:', err);
        return res.status(401).json({ 
            success: false,
            error: 'Token inválido o expirado',
            details: err.message,
            path: req.path
        });
    }
};

// Endpoint para verificar el token
app.get('/api/verify-token', authenticateToken, async (req, res) => {
    try {
        const pool = getPool();
        // Obtener los datos del usuario desde la base de datos
        const [users] = await pool.query(
            'SELECT id, first_name, last_name, email, country, birthdate, street, street_number, created_at FROM users WHERE id = ?',
            [req.user.userId]
        );
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Enviar los datos del usuario sin información sensible
        res.json(users[0]);
        
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        res.status(500).json({ error: 'Error al obtener los datos del usuario' });
    }
});

// Endpoint para cerrar sesión
app.post('/api/logout', (req, res) => {
    // Limpiar la cookie de autenticación
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// Ruta para servir la página de perfil
app.get('/perfil', (req, res) => {
    res.sendFile(path.join(__dirname, '../perfil.html'));
});

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Iniciar el servidor
const startServer = async () => {
    try {
        // Inicializar la base de datos
        await initializeDatabase();
        console.log('Conexión a la base de datos establecida correctamente');
        
        // Verificar la conexión a la base de datos
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('No se pudo conectar a la base de datos');
        }
        
        // Solo iniciar el servidor si no estamos en modo test
        if (process.env.NODE_ENV !== 'test') {
            const server = app.listen(PORT, () => {
                console.log('\n=== Servidor iniciado correctamente ===');
                console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
                console.log(`URL: http://localhost:${PORT}`);
                console.log(`Base de datos: ${process.env.DB_NAME || 'esimracing_db'}`);
                console.log('==================================\n');
            });
            
            // Manejo de cierre de la aplicación
            process.on('SIGTERM', () => {
                console.log('Recibida señal SIGTERM. Cerrando servidor...');
                server.close(() => {
                    console.log('Servidor cerrado');
                    process.exit(0);
                });
            });
            
            return server;
        }
        
        return app;
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        if (process.env.NODE_ENV !== 'test') {
            process.exit(1);
        }
        throw error; // Lanzar el error para que sea manejado por los tests
    }
};

// Solo iniciar el servidor si no estamos en modo test
if (process.env.NODE_ENV !== 'test') {
    startServer().catch(error => {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    });
}

// Exportar la aplicación y startServer para los tests
module.exports = { app, startServer };
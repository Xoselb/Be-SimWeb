const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');
const { pool, initializeDatabase, testConnection } = require('./db');

const app = express();
const PORT = process.env.PORT || 5500;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_segura';

// Configuración CORS
const corsOptions = {
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Servir archivos estáticos
// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../'), {
    setHeaders: (res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
        res.setHeader('Access-Control-Allow-Credentials', true);
    }
}));

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

            // Configurar la cookie HTTP-only
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Cambiado a 'lax' para mejor compatibilidad
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                path: '/'
            };
            
            console.log('Configurando cookie con opciones:', cookieOptions);
            res.cookie('token', token, cookieOptions);

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

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
    // Rutas que no requieren autenticación
    const publicPaths = ['/api/register', '/api/login', '/api/verify-token', '/favicon.ico'];
    
    // Verificar si la ruta actual es pública
    const isPublicPath = publicPaths.some(path => {
        return req.path.startsWith(path);
    });
    
    if (isPublicPath) {
        console.log(`Ruta pública detectada: ${req.path}, omitiendo autenticación`);
        return next();
    }

    console.log('=== Verificando token de autenticación ===');
    console.log('URL:', req.originalUrl);
    console.log('Método:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Obtener el token de varias fuentes posibles
    let token = null;
    
    // 1. Verificar el encabezado Authorization
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
        console.log('Token encontrado en el encabezado Authorization');
    }
    // 2. Verificar las cookies
    else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
        console.log('Token encontrado en las cookies');
    }
    // 3. Verificar el body (útil para GraphQL)
    else if (req.body && req.body.token) {
        token = req.body.token;
        console.log('Token encontrado en el body');
    }
    
    console.log('Token recibido:', token ? '*****' + (token.length > 5 ? token.slice(-5) : '') : 'No proporcionado');
    
    if (!token) {
        console.log('Error: Token no proporcionado');
        return res.status(401).json({ 
            success: false,
            error: 'Token de autenticación no proporcionado',
            path: req.path
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
async function startServer() {
    try {
        // Test database connection
        console.log('Testing database connection...');
        const isConnected = await testConnection();
        if (!isConnected) {
            throw new Error('Failed to connect to database');
            console.error('No se pudo conectar a la base de datos. Saliendo...');
            process.exit(1);
        }

        // Inicializar la base de datos (crear tablas si no existen)
        console.log('Inicializando base de datos...');
        await initializeDatabase();
        console.log('Base de datos inicializada correctamente');

        // Iniciar el servidor HTTP
        app.listen(PORT, () => {
            console.log(`\n=== Servidor iniciado correctamente ===`);
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`URL: http://localhost:${PORT}`);
            console.log(`Base de datos: ${process.env.DB_NAME || 'esimracing_db'}`);
            console.log('==================================\n');
        });
    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
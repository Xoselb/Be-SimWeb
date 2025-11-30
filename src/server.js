// server.js - Servidor principal con base de datos
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('../config/database');

// Importar rutas
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../../')));
app.use('/css', express.static(path.join(__dirname, '../../css')));
app.use('/js', express.static(path.join(__dirname, '../../js')));
app.use('/img', express.static(path.join(__dirname, '../../img')));

// Rutas de API
app.use('/api/auth', authRoutes);

// Rutas de páginas organizadas
app.use('/pages/auth', express.static(path.join(__dirname, '../../pages/auth')));
app.use('/pages/shop', express.static(path.join(__dirname, '../../pages/shop')));
app.use('/pages/user', express.static(path.join(__dirname, '../../pages/user')));
app.use('/pages/simulation', express.static(path.join(__dirname, '../../pages/simulation')));
app.use('/pages/events', express.static(path.join(__dirname, '../../pages/events')));
app.use('/pages/info', express.static(path.join(__dirname, '../../pages/info')));

// Mantener compatibilidad con rutas antiguas (redirecciones)
app.get('/login.html', (req, res) => res.redirect('/pages/auth/login.html'));
app.get('/register.html', (req, res) => res.redirect('/pages/auth/register.html'));
app.get('/perfil.html', (req, res) => res.redirect('/pages/user/perfil.html'));
app.get('/cart.html', (req, res) => res.redirect('/pages/shop/cart.html'));
app.get('/merch.html', (req, res) => res.redirect('/pages/shop/merch.html'));
app.get('/contacto.html', (req, res) => res.redirect('/pages/info/contacto.html'));
app.get('/galerie.html', (req, res) => res.redirect('/pages/info/galerie.html'));

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Iniciar servidor
async function startServer() {
    try {
        // Conectar a base de datos
        await db.connect();
        
        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📊 Base de datos: ${db.type}`);
            console.log(`🌍 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
        });
    } catch (error) {
        console.error('❌ Error iniciando servidor:', error);
        process.exit(1);
    }
}

// Manejar cierre graceful
process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando servidor...');
    await db.disconnect();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🛑 Cerrando servidor...');
    await db.disconnect();
    process.exit(0);
});

startServer();

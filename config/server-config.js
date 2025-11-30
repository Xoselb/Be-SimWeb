/**
 * Configuración del servidor para la nueva estructura organizada
 */

const express = require('express');
const path = require('path');

const app = express();

// Servir archivos estáticos con las nuevas rutas
app.use('/assets/styles', express.static(path.join(__dirname, 'assets/styles')));
app.use('/assets/scripts', express.static(path.join(__dirname, 'assets/scripts')));
app.use('/assets/images', express.static(path.join(__dirname, 'assets/images')));
app.use('/assets/fonts', express.static(path.join(__dirname, 'assets/fonts')));

// Servir páginas organizadas
app.use('/pages/auth', express.static(path.join(__dirname, 'pages/auth')));
app.use('/pages/shop', express.static(path.join(__dirname, 'pages/shop')));
app.use('/pages/user', express.static(path.join(__dirname, 'pages/user')));
app.use('/pages/simulation', express.static(path.join(__dirname, 'pages/simulation')));
app.use('/pages/events', express.static(path.join(__dirname, 'pages/events')));
app.use('/pages/info', express.static(path.join(__dirname, 'pages/info')));

// Mantener compatibilidad con rutas antiguas (redirecciones)
app.get('/login.html', (req, res) => res.redirect('/pages/auth/login.html'));
app.get('/register.html', (req, res) => res.redirect('/pages/auth/register.html'));
app.get('/perfil.html', (req, res) => res.redirect('/pages/user/perfil.html'));
app.get('/cart.html', (req, res) => res.redirect('/pages/shop/cart.html'));
app.get('/merch.html', (req, res) => res.redirect('/pages/shop/merch.html'));
app.get('/contacto.html', (req, res) => res.redirect('/pages/info/contacto.html'));
app.get('/galerie.html', (req, res) => res.redirect('/pages/info/galerie.html'));

// API routes (sin cambios)
app.use('/api', require('./src/server'));

// Página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all para SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

module.exports = app;

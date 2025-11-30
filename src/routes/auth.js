// auth.js - Rutas de autenticación
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', authController.AuthController.authenticate, authController.getProfile);
router.put('/profile', authController.AuthController.authenticate, authController.updateProfile);
router.put('/change-password', authController.AuthController.authenticate, authController.changePassword);
router.post('/logout', authController.AuthController.authenticate, authController.logout);

module.exports = router;

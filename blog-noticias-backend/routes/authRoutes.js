const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');

// Ruta para registrarse: POST /api/auth/register
router.post('/register', registrarUsuario);

// Ruta para iniciar sesión: POST /api/auth/login
router.post('/login', loginUsuario);

module.exports = router;
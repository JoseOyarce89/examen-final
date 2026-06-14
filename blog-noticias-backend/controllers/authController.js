const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTRO DE USUARIOS
const registrarUsuario = async (req, res) => {
    const { nombre, email, password } = req.body;

    // Validación básica de campos vacíos
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar si el email ya está registrado
        const usuarioExiste = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (usuarioExiste.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Encriptar la contraseña (Sintaxis y seguridad)
        const salt = await bcrypt.genSalt(10);
        const passwordEncriptada = await bcrypt.hash(password, salt);

        // Insertar el nuevo usuario en la base de datos
        const nuevoUsuario = await pool.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, fecha_registro',
            [nombre, email, passwordEncriptada]
        );

        res.status(201).json({
            mensaje: 'Usuario registrado con éxito.',
            usuario: nuevoUsuario.rows[0]
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

// 2. LOGIN DE USUARIOS
const loginUsuario = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingresa email y contraseña.' });
    }

    try {
        // Buscar al usuario por email
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (resultado.rows.length === 0) {
            return res.status(400).json({ error: 'Credenciales inválidas (usuario no encontrado).' });
        }

        const usuario = resultado.rows[0];

        // Comparar la contraseña ingresada con la encriptada en la BD
        const passwordCorrecta = await bcrypt.compare(password, usuario.password);
        if (!passwordCorrecta) {
            return res.status(400).json({ error: 'Credenciales inválidas (contraseña incorrecta).' });
        }

        // Crear el Token de sesión (JWT) para que el Frontend sepa quién está logueado
        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // El token expira en un día
        );

        res.json({
            mensaje: 'Login exitoso.',
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

module.exports = {
    registrarUsuario,
    loginUsuario
};
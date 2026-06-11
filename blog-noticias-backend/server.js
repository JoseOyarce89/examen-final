const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// Enlazar Rutas de la API
app.use('/api/auth', authRoutes); // <-- Aquí conectamos el login y registro
app.use('/api/noticias', noticiaRoutes); // <-- 2. Conectamos las rutas de noticias

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ mensaje: "¡Bienvenido a la API del Blog de Noticias!" });
});

// Configuración del puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
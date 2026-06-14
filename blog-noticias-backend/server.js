const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const noticiaRoutes = require('./routes/noticiaRoutes');

const app = express();

// Middlewares obligatorios
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend de manera prioritaria
app.use(express.static(path.join(__dirname, '../blog-noticias-frontend')));

// Enlazar Rutas de la API
app.use('/api/auth', authRoutes); 
app.use('/api/noticias', noticiaRoutes); 

// OJO: Quitamos la ruta de prueba app.get('/') para que cargue automáticamente el index.html

// Configuración del puerto (Render asignará uno automáticamente, si no usa el 5000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
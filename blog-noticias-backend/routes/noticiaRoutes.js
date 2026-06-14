const express = require('express');
const router = express.Router();
const { crearNoticia, obtenerNoticias, obtenerNoticiaPorId } = require('../controllers/noticiaController');
const { agregarComentario, registrarReaccion } = require('../controllers/comboController'); // <-- Importamos lo nuevo

// --- Rutas de Noticias ---
router.post('/', crearNoticia);
router.get('/', obtenerNoticias);
router.get('/:id', obtenerNoticiaPorId);

// --- Rutas de Interacción (Nuevas) ---
router.post('/comentarios', agregarComentario); // POST /api/noticias/comentarios
router.post('/reacciones', registrarReaccion);  // POST /api/noticias/reacciones

module.exports = router;
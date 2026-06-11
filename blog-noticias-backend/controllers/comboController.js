const pool = require('../config/db');

// 1. AGREGAR UN COMENTARIO (Requerimiento: Escribir comentarios)
const agregarComentario = async (req, res) => {
    const { texto, noticia_id, usuario_id } = req.body;

    if (!texto || !noticia_id || !usuario_id) {
        return res.status(400).json({ error: 'El texto del comentario y los IDs son obligatorios.' });
    }

    try {
        const nuevoComentario = await pool.query(
            `INSERT INTO comentarios (texto, noticia_id, usuario_id) 
             VALUES ($1, $2, $3) 
             RETURNING *`,
            [texto, noticia_id, usuario_id]
        );

        res.status(201).json({
            mensaje: 'Comentario publicado con éxito.',
            comentario: nuevoComentario.rows[0]
        });
    } catch (error) {
        console.error('Error al comentar:', error);
        res.status(500).json({ error: 'Error interno al publicar el comentario.' });
    }
};

// 2. DAR LIKE O DISLIKE (Requerimiento: Sistema de likes / Evitar duplicados)
const registrarReaccion = async (req, res) => {
    const { noticia_id, usuario_id, tipo } = req.body; // 'tipo' debe ser 'like' o 'dislike'

    if (!noticia_id || !usuario_id || !tipo) {
        return res.status(400).json({ error: 'Campos incompletos para procesar la reacción.' });
    }

    if (tipo !== 'like' && tipo !== 'dislike') {
        return res.status(400).json({ error: 'El tipo de reacción debe ser "like" o "dislike".' });
    }

    try {
        // Buscamos si el usuario ya reaccionó antes a esta misma noticia
        const reaccionPrevia = await pool.query(
            'SELECT * FROM reacciones WHERE noticia_id = $1 AND usuario_id = $2',
            [noticia_id, usuario_id]
        );

        if (reaccionPrevia.rows.length > 0) {
            // Si la reacción es del mismo tipo, se la quitamos (efecto "desmarcar")
            if (reaccionPrevia.rows[0].tipo === tipo) {
                await pool.query(
                    'DELETE FROM reacciones WHERE noticia_id = $1 AND usuario_id = $2',
                    [noticia_id, usuario_id]
                );
                return res.json({ mensaje: 'Reacción eliminada correctamente.' });
            } else {
                // Si es de tipo contrario (ej: antes dislike y ahora apretó like), la actualizamos
                const actualizacion = await pool.query(
                    'UPDATE reacciones SET tipo = $1 WHERE noticia_id = $2 AND usuario_id = $3 RETURNING *',
                    [tipo, noticia_id, usuario_id]
                );
                return res.json({ mensaje: `Cambiado a ${tipo} con éxito.`, reaccion: actualizacion.rows[0] });
            }
        }

        // Si no existía ninguna reacción, la creamos de cero
        const nuevaReaccion = await pool.query(
            'INSERT INTO reacciones (noticia_id, usuario_id, tipo) VALUES ($1, $2, $3) RETURNING *',
            [noticia_id, usuario_id, tipo]
        );

        res.status(201).json({
            mensaje: `Se registró tu ${tipo} con éxito.`,
            reaccion: nuevaReaccion.rows[0]
        });

    } catch (error) {
        console.error('Error en el sistema de reacciones:', error);
        res.status(500).json({ error: 'Error al procesar la reacción.' });
    }
};

module.exports = {
    agregarComentario,
    registrarReaccion
};
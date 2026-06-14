const pool = require('../config/db');

// 1. CREAR UNA NOTICIA
const crearNoticia = async (req, res) => {
    const { titulo, texto, imagen_url, autor, categoria_id, usuario_id } = req.body;

    // VALIDACIONES DE REQUERIMIENTOS EXIGIDOS:
    if (!titulo || !texto || !autor || !categoria_id || !usuario_id) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben estar completos.' });
    }
    if (titulo.length > 60) {
        return res.status(400).json({ error: 'El título no puede superar los 60 caracteres.' });
    }
    if (texto.length > 4000) {
        return res.status(400).json({ error: 'El texto de la noticia no puede superar los 4000 caracteres.' });
    }
    if (autor.length > 40) {
        return res.status(400).json({ error: 'El nombre del autor no puede superar los 40 caracteres.' });
    }

    try {
        const nuevaNoticia = await pool.query(
            `INSERT INTO noticias (titulo, texto, imagen_url, autor, categoria_id, usuario_id) 
             VALUES ($1, $2, $3, $4, $5, $6) 
             RETURNING *`,
            [titulo, texto, imagen_url, autor, categoria_id, usuario_id]
        );

        res.status(201).json({
            mensaje: 'Noticia publicada con éxito.',
            noticia: nuevaNoticia.rows[0]
        });
    } catch (error) {
        console.error('Error al crear noticia:', error);
        res.status(500).json({ error: 'Error interno al publicar la noticia.' });
    }
};

// 2. LISTAR NOTICIAS (Con ordenamiento por defecto, filtros por categoría y orden inverso)
const obtenerNoticias = async (req, res) => {
    const { categoria, orden } = req.query; 
    // 'categoria' será el ID de la categoría (opcional)
    // 'orden' puede ser 'ASC' o 'DESC'. Por pauta, por defecto es 'DESC' (de la última hacia atrás)

    let direccionOrden = 'DESC';
    if (orden === 'ASC' || orden === 'asc') {
        direccionOrden = 'ASC';
    }

    try {
        let consulta = `
            SELECT n.*, c.nombre AS categoria_nombre,
                   (SELECT COUNT(*) FROM reacciones WHERE noticia_id = n.id AND tipo = 'like') AS likes,
                   (SELECT COUNT(*) FROM reacciones WHERE noticia_id = n.id AND tipo = 'dislike') AS dislikes
            FROM noticias n
            LEFT JOIN categorias c ON n.categoria_id = c.id
        `;
        
        const parametros = [];

        // Si el usuario filtra por categoría en el Navbar
        if (categoria) {
            consulta += ` WHERE n.categoria_id = $1`;
            parametros.push(categoria);
        }

        // Aplicamos el orden por fecha (Requerimiento C: de la última noticia hacia atrás u orden inverso)
        consulta += ` ORDER BY n.fecha ${direccionOrden}, n.id ${direccionOrden}`;

        const resultado = await pool.query(consulta, parametros);
        res.json(resultado.rows);

    } catch (error) {
        console.error('Error al obtener noticias:', error);
        res.status(500).json({ error: 'Error al cargar las noticias.' });
    }
};

// 3. OBTENER DETALLE DE UNA NOTICIA POR SU ID (Requerimiento D)
const obtenerNoticiaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        // Trae la noticia con los contadores de likes/dislikes
        const noticiaQuery = `
            SELECT n.*, c.nombre AS categoria_nombre,
                   (SELECT COUNT(*) FROM reacciones WHERE noticia_id = n.id AND tipo = 'like') AS likes,
                   (SELECT COUNT(*) FROM reacciones WHERE noticia_id = n.id AND tipo = 'dislike') AS dislikes
            FROM noticias n
            LEFT JOIN categorias c ON n.categoria_id = c.id
            WHERE n.id = $1
        `;
        const noticiaRes = await pool.query(noticiaQuery, [id]);

        if (noticiaRes.rows.length === 0) {
            return res.status(404).json({ error: 'La noticia no existe.' });
        }

        // Trae los comentarios asociados a la noticia
        const comentariosQuery = `
            SELECT com.*, u.nombre AS usuario_nombre 
            FROM comentarios com
            JOIN usuarios u ON com.usuario_id = u.id
            WHERE com.noticia_id = $1
            ORDER BY com.fecha DESC
        `;
        const comentariosRes = await pool.query(comentariosQuery, [id]);

        // Trae el listado de usuarios que dieron LIKE y DISLIKE (Requerimiento de pauta)
        const reaccionesQuery = `
            SELECT r.tipo, u.nombre AS usuario_nombre
            FROM reacciones r
            JOIN usuarios u ON r.usuario_id = u.id
            WHERE r.noticia_id = $1
        `;
        const reaccionesRes = await pool.query(reaccionesQuery, [id]);

        // Separamos quién dio like y quién dislike de forma ordenada
        const usuariosLike = reaccionesRes.rows.filter(r => r.tipo === 'like').map(r => r.usuario_nombre);
        const usuariosDislike = reaccionesRes.rows.filter(r => r.tipo === 'dislike').map(r => r.usuario_nombre);

        res.json({
            noticia: noticiaRes.rows[0],
            comentarios: comentariosRes.rows,
            detalles_reacciones: {
                usuarios_like: usuariosLike,
                usuarios_dislike: usuariosDislike
            }
        });

    } catch (error) {
        console.error('Error al obtener el detalle:', error);
        res.status(500).json({ error: 'Error al obtener el detalle de la noticia.' });
    }
};

module.exports = {
    crearNoticia,
    obtenerNoticias,
    obtenerNoticiaPorId
};
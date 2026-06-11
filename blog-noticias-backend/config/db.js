const { Pool } = require('pg');
require('dotenv').config();

// Configuramos el pool usando las variables del archivo .env
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Probamos la conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Error al conectar a la base de datos:', err.stack);
    } else {
        console.log('✅ Conexión exitosa a PostgreSQL establecida correctamente.');
    }
});

module.exports = pool;
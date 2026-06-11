const API_URL = 'http://localhost:5000/api/noticias';
let categoriaActual = '';
let ordenActual = 'DESC';

// Ejecutar automáticamente al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarNoticias();
    configurarNavbarUsuario();
});

// FUNCIÓN PRINCIPAL PARA OBTENER Y MOSTRAR LAS NOTICIAS
async function cargarNoticias() {
    const contenedor = document.getElementById('contenedor-noticias');
    
    try {
        // Construimos la URL con los parámetros correspondientes (?categoria=X&orden=Y)
        let url = `${API_URL}?orden=${ordenActual}`;
        if (categoriaActual) {
            url += `&categoria=${categoriaActual}`;
        }

        const respuesta = await fetch(url);
        const noticias = await respuesta.json();

        // Limpiar el contenedor
        contenedor.innerHTML = '';

        if (noticias.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center py-5">
                    <p class="text-muted fs-4">No hay noticias disponibles en esta categoría.</p>
                </div>`;
            return;
        }

        // REPETICIÓN (Sentencias repetitivas requeridas por la pauta)
        noticias.forEach(noticia => {
            // Formatear la fecha de la noticia de forma legible
            const fechaFormateada = new Date(noticia.fecha).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            // Creamos la tarjeta (Card) usando Bootstrap
            const tarjetaHTML = `
                <div class="col">
                    <div class="card h-100 shadow-sm border-0">
                        <img src="${noticia.imagen_url || 'https://picsum.photos/400/200'}" class="card-img-top" alt="${noticia.titulo}">
                        <div class="card-body d-flex flex-column">
                            <span class="badge bg-primary mb-2 align-self-start">${noticia.categoria_nombre || 'General'}</span>
                            <h5 class="card-title fw-bold">
                                <a href="detalle.html?id=${noticia.id}" class="text-decoration-none text-dark link-primary">
                                    ${noticia.titulo}
                                </a>
                            </h5>
                            <p class="card-text text-muted flex-grow-1">
                                ${noticia.texto.substring(0, 120)}...
                            </p>
                        </div>
                        <div class="card-footer bg-white border-top-0 d-flex justify-content-between text-muted small">
                            <span><i class="bi bi-person-fill"></i> ${noticia.autor}</span>
                            <span><i class="bi bi-calendar3"></i> ${fechaFormateada}</span>
                        </div>
                        <div class="card-footer bg-light d-flex justify-content-around border-top text-center py-2">
                            <span class="text-success fw-bold small"><i class="bi bi-hand-thumbs-up-fill"></i> ${noticia.likes} Likes</span>
                            <span class="text-danger fw-bold small"><i class="bi bi-hand-thumbs-down-fill"></i> ${noticia.dislikes} Dislikes</span>
                        </div>
                    </div>
                </div>
            `;
            contenedor.innerHTML += tarjetaHTML;
        });

    } catch (error) {
        console.error('Error al conectar con la API:', error);
        contenedor.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="alert alert-danger" role="alert">
                    ❌ No se pudo conectar con el servidor. Asegúrate de tener corriendo tu backend Node.js en el puerto 5000.
                </div>
            </div>`;
    }
}

// FUNCIÓN PARA FILTRAR POR CATEGORÍA DESDE EL NAVBAR
function filtrarPorCategoria(idCategoria) {
    categoriaActual = idCategoria;
    
    // Cambiar dinámicamente el título visual de la sección
    const titulos = { 1: 'Tecnología', 2: 'Deportes', 3: 'Espectáculos', 4: 'Internacional', 5: 'Política' };
    document.getElementById('titulo-seccion').innerText = `Categoría: ${titulos[idCategoria]}`;
    
    cargarNoticias();
}

// FUNCIÓN PARA INVERTIR EL ORDEN (ASC / DESC)
function cambiarOrden(nuevoOrden) {
    ordenActual = nuevoOrden;
    cargarNoticias();
}

// FUNCIÓN AUXILIAR PARA DETERMINAR SI EL USUARIO YA ESTÁ LOGUEADO (Para el Navbar)
function configurarNavbarUsuario() {
    const usuarioJson = localStorage.getItem('usuario');
    const authButtons = document.getElementById('auth-buttons');
    
    if (usuarioJson) {
        const usuario = JSON.parse(usuarioJson);
        authButtons.innerHTML = `
            <span class="navbar-text text-white me-3">Hola, <strong>${usuario.nombre}</strong></span>
            <button onclick="cerrarSesion()" class="btn btn-outline-danger btn-sm">Salir</button>
        `;
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.reload();
}
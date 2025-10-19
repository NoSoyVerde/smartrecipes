$(document).ready(function() {
    // Ahora usamos la API pública de YTS (https://yts.mx/) que no requiere clave.
    // Endpoint de búsqueda: https://yts.mx/api/v2/list_movies.json?query_term=...
    // Endpoint de detalles: https://yts.mx/api/v2/movie_details.json?movie_id=...

    const $movieForm = $('#movie-form');
    const $movieInput = $('#movie-input');
    const $errorMsg = $('#error-msg');
    const $movieList = $('#movie-list');
    const $movieDetails = $('#movie-details');

    // Toggle búsqueda avanzada
    $('#toggle-advanced').on('click', function() { $('#advanced-form').toggleClass('hidden'); });

    $movieForm.on('submit', function(e) {
        e.preventDefault();
        const titulo = $movieInput.val().trim();
        const year = $('#filter-year').val().trim();
        const minRating = $('#filter-rating').val().trim();
        if(!validarTitulo(titulo)) {
            $errorMsg.text('Título inválido. Evite caracteres extraños.');
            return;
        }
        $errorMsg.text('');
        showSpinner(true);
        // Usar promesas + async/await
        buscarPeliculasAsync(titulo, { year, minRating })
            .then(movies => {
                renderMovies(movies);
                showSpinner(false);
            })
            .catch(err => {
                showSpinner(false);
                $errorMsg.text(err.message || 'Error en la búsqueda');
            });
    });

    // Versión basada en Promise/async para buscar películas
    function buscarPeliculasAsync(titulo, filters = {}) {
        const url = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(titulo)}`;
        return new Promise((resolve, reject) => {
            $.ajax({ url, method: 'GET', dataType: 'json' })
                .done(resp => {
                    if(resp && resp.status === 'ok' && resp.data && resp.data.movie_count > 0) {
                        let movies = resp.data.movies || [];
                        // aplicar filtros opcionales
                        if(filters.year) movies = movies.filter(m => String(m.year) === String(filters.year));
                        if(filters.minRating) movies = movies.filter(m => (m.rating || 0) >= parseFloat(filters.minRating));
                        resolve(movies);
                    } else {
                        reject(new Error('No se encontraron resultados.'));
                    }
                })
                .fail(() => reject(new Error('Error en la conexión con la API.')));
        });
    }

    // Renderizar lista de películas con animación
    function renderMovies(movies) {
        $movieList.empty();
        $movieDetails.empty();
        movies.forEach(movie => {
            const title = movie.title || movie.title_long || 'Sin título';
            const year = movie.year || '';
            const poster = movie.medium_cover_image || movie.large_cover_image || 'https://via.placeholder.com/70x100?text=No+Image';
            const $li = crearElemento('li', 'movie-item', '');
            const $img = $('<img>').attr('src', poster).attr('alt', title).css({width: '70px', height: '100px', 'object-fit': 'cover', 'border-radius': '4px'});
            const $meta = crearElemento('div', 'movie-meta', `${title} (${year})`);
            $li.append($img).append($meta).addClass('fade-in');
            $li.on('click', () => mostrarDetallesAsync(movie.id, function(err, data) { // ejemplo de callback
                if(err) { $errorMsg.text(err.message); return; }
                renderDetails(data);
            }));
            $movieList.append($li);
        });
    }

    // Versión async/Promise para detalles (retorna Promise)
    function mostrarDetallesAsync(id, callback) {
        const url = `https://yts.mx/api/v2/movie_details.json?movie_id=${encodeURIComponent(id)}&with_images=true&with_cast=true`;
        // Si se pasó callback, usar patrón callback; además devolvemos Promise
        const p = new Promise((resolve, reject) => {
            $.ajax({ url, method: 'GET', dataType: 'json' })
            .done(resp => {
                if(resp && resp.status === 'ok' && resp.data && resp.data.movie) {
                    resolve(resp.data.movie);
                } else {
                    reject(new Error('No se pudieron obtener detalles.'));
                }
            })
            .fail(() => reject(new Error('Error al obtener detalles de la película.')));
        });
        if(typeof callback === 'function') {
            p.then(data => callback(null, data)).catch(err => callback(err));
        }
        return p;
    }

    // Render de detalles (recibe movie object de YTS)
    function renderDetails(m) {
        const poster = m.large_cover_image || m.medium_cover_image || 'https://via.placeholder.com/200x300?text=No+Image';
        $movieDetails.html(`
            <div class="card fade-in">
                <h2>${m.title} <small class="small">(${m.year})</small></h2>
                <div style="display:flex;gap:1rem;align-items:flex-start">
                    <img src="${poster}" alt="${m.title}" style="width:150px;height:auto;border-radius:6px">
                    <div>
                        <p><strong>Género:</strong> ${m.genres ? m.genres.join(', ') : 'N/A'}</p>
                        <p><strong>Rating:</strong> ${m.rating || 'N/A'}</p>
                        <p><strong>Duración:</strong> ${m.runtime ? m.runtime + ' min' : 'N/A'}</p>
                        <p><strong>Sinopsis:</strong> ${m.description_full || m.summary || 'N/A'}</p>
                    </div>
                </div>
            </div>
        `);
    }

    // Spinner helpers
    function showSpinner(on) { if(on) { $('#spinner').removeClass('hidden'); } else { $('#spinner').addClass('hidden'); } }
});

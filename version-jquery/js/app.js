// js/app.js
$(document).ready(function () {
    // API key (hardcodeada para funcionamiento local)
    const apiKey = 'ec625885'; // reemplaza con tu clave si lo deseas

    /************* User Module *************/
    const userModule = (() => {
        const $userForm = $('#user-form');
        const $username = $('#user-name');
        const $userGenre = $('#user-genre');
        const $userPlatform = $('#user-platform');
        const $userMsg = $('#user-msg');

        let userData = { name: '', genre: '', platform: '' };

        const loadUser = () => {
            try {
                const saved = JSON.parse(localStorage.getItem('sr_user_data') || 'null');
                if (saved) userData = saved;
            } catch (e) {}
        };

        const saveUser = () => {
            try { localStorage.setItem('sr_user_data', JSON.stringify(userData)); } catch (e) {}
        };

        const init = () => {
            loadUser();
            if (!$userForm.length) return;

            $username.val(userData.name);
            $userGenre.val(userData.genre);
            $userPlatform.val(userData.platform);

            $userForm.on('submit', e => {
                e.preventDefault();
                userData.name = $username.val().trim();
                userData.genre = $userGenre.val().trim();
                userData.platform = $userPlatform.val().trim();
                saveUser();
                $userMsg.text('Datos guardados. Tu experiencia será personalizada.');

                try {
                    if (userData.genre && movieModule.filterByGenre) {
                        movieModule.filterByGenre(userData.genre);
                    }
                } catch (e) {}
            });
        };

        return { init, getData: () => userData };
    })();

    /************* Movie Module *************/
    const movieModule = (() => {
        const $movieList = $('#movie-list');
        const $movieDetails = $('#movie-details');
        const $spinner = $('#spinner');
        const $errorMsg = $('#error-msg');
        const $noResults = $('#no-results');
        const $movieForm = $('#movie-form');
        const $movieInput = $('#movie-input');
        const $filterYear = $('#filter-year');

        let latestLoadedMovies = [];

        const setBusy = busy => {
            $movieList.attr('aria-busy', busy ? 'true' : 'false');
            $spinner.toggleClass('hidden', !busy).attr('aria-hidden', !busy);
        };

        const renderMovies = movies => {
            $movieList.empty();
            $movieDetails.empty();
            if (!movies || movies.length === 0) return $noResults.removeClass('hidden');

            $noResults.addClass('hidden');
            const preferredGenre = userModule.getData().genre?.toLowerCase();

            // Ordenar por año (más reciente primero) cuando sea posible
            movies = movies.slice().sort((a,b) => {
                const ay = parseInt((a.Year||'').slice(0,4),10) || 0;
                const by = parseInt((b.Year||'').slice(0,4),10) || 0;
                return by - ay;
            });

            // Mantener solo las películas cuyas imágenes carguen correctamente
            const loadedMovies = [];

            movies.forEach(movie => {
                if (!movie.Poster || movie.Poster === 'N/A') return; // no hay póster

                // Preload image and append only on successful load
                const img = new Image();
                img.onload = function() {
                    const highlight = preferredGenre && movie.Genre?.toLowerCase().includes(preferredGenre);
                    const $li = $('<li>').addClass('movie-item fade-in').attr({ tabindex: 0, role: 'listitem' }).data('imdb', movie.imdbID);
                    const $img = $('<img>').attr({ src: movie.Poster, alt: movie.Title, loading: 'lazy' });
                    const $meta = $('<div>').addClass('movie-meta').text(`${movie.Title} (${movie.Year})`);
                    if (highlight) $li.css('border', '2px solid var(--accent-2)');
                    $li.append($img, $meta).on('click keydown', e => {
                        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            showDetails(movie.imdbID);
                            gameModule.setMovieForGame(movie);
                        }
                    });
                    $movieList.append($li);
                    loadedMovies.push(movie);
                    // actualizar cache con las películas que realmente se muestran
                    latestLoadedMovies = loadedMovies.slice();
                };
                img.onerror = function() {
                    // imagen rota -> no mostrar la película (silencioso)
                };
                // iniciar carga
                img.src = movie.Poster;
            });

            // Si ninguna imagen se carga, mostrar mensaje
            // (esperamos brevemente a que carguen; si no hay posters válidos, no se añadirá ningún li)
            setTimeout(() => {
                if ($movieList.children().length === 0) {
                    $noResults.removeClass('hidden');
                    $errorMsg.text('No se encontraron resultados con pósters válidos.');
                }
            }, 400);

            const name = userModule.getData().name;
            if (name) $errorMsg.text(`Hola ${name}, aquí tienes tus resultados personalizados:`);
        };

        const filterByGenre = genre => {
            if (!genre) return;
            const g = genre.toLowerCase().trim();
            const filtered = latestLoadedMovies.filter(m => m.Genre?.toLowerCase().includes(g));
            if (filtered.length) renderMovies(filtered);
            else {
                $movieList.empty();
                $noResults.removeClass('hidden');
                $errorMsg.text(`No se encontraron películas locales para el género "${genre}".`);
            }
        };

        const showDetails = id => {
            setBusy(true);
            if (!apiKey) return $errorMsg.text('API key no configurada.');

            $.getJSON(`https://www.omdbapi.com/?apikey=${apiKey}&i=${id}&plot=full`)
                .done(data => {
                    setBusy(false);
                    if (data.Response === 'True') renderDetails(data);
                    else $errorMsg.text(data.Error || 'No se pudieron obtener detalles.');
                })
                .fail(() => { setBusy(false); $errorMsg.text('Error al obtener detalles.'); });
        };

        const renderDetails = m => {
            $movieDetails.empty();
            const poster = m.Poster && m.Poster !== 'N/A' ? m.Poster : '';
            const $card = $('<div>').addClass('card fade-in');
            const $title = $('<h2>').text(`${m.Title} `).append($('<small>').addClass('small').text(`(${m.Year})`));
            const $container = $('<div>').css({ display: 'flex', gap: '1rem', alignItems: 'flex-start' });
            const $img = poster ? $('<img>').attr({ src: poster, alt: m.Title, loading: 'lazy', style: 'width:150px;height:auto;border-radius:6px' }) : '';
            const $meta = $('<div>')
                .append($('<p>').html('<strong>Género:</strong> ' + (m.Genre || 'N/A')))
                .append($('<p>').html('<strong>Rating:</strong> ' + (m.imdbRating || 'N/A')))
                .append($('<p>').html('<strong>Duración:</strong> ' + (m.Runtime || 'N/A')))
                .append($('<p>').html('<strong>Sinopsis:</strong> ' + (m.Plot || 'N/A')));
            if ($img) $container.append($img);
            $container.append($meta);
            $card.append($title, $container);
            $movieDetails.append($card).attr('tabindex', -1).focus();
        };

        const searchMovies = (title, year, options = {}) => {
            const validar = window.SR?.helpers?.validarTitulo || (() => true);
            if (!validar(title)) return $errorMsg.text('Título inválido.');

            $errorMsg.text('');
            setBusy(true);
            $movieDetails.empty();
            $noResults.addClass('hidden');

            let url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(title)}`;
            if (options.type) url += `&type=${encodeURIComponent(options.type)}`;
            if (year) url += `&y=${year}`;

            $.getJSON(url)
                .done(data => {
                    setBusy(false);
                    if (data.Response === "True") {
                        const promises = data.Search.map(m => $.getJSON(`https://www.omdbapi.com/?apikey=${apiKey}&i=${m.imdbID}`));
                        $.when(...promises).done(function (...results) {
                            let movies = results.map(r => r[0]).filter(m => m?.Response === 'True');

                            if (options.yearTo) {
                                const from = parseInt(year, 10) || 0;
                                const to = parseInt(options.yearTo, 10) || 9999;
                                movies = movies.filter(m => {
                                    const y = parseInt(m.Year?.slice(0, 4), 10) || 0;
                                    return y >= from && y <= to;
                                });
                            }
                            if (options.genre) {
                                const g = options.genre.toLowerCase().trim();
                                movies = movies.filter(m => m.Genre?.toLowerCase().includes(g));
                            }
                            latestLoadedMovies = movies.slice();
                            renderMovies(movies);
                        });
                    } else {
                        $movieList.empty(); $noResults.removeClass('hidden'); $errorMsg.text(data.Error || 'No se encontraron resultados.');
                    }
                })
                .fail(() => { setBusy(false); $errorMsg.text('Error en la conexión con la API.'); });
        };

        const init = () => {
            // carga inicial
            const recentTitles = ["Avatar: The Way of Water", "Oppenheimer", "Barbie", "Spider-Man: Across the Spider-Verse", "Guardians of the Galaxy Vol. 3"];
            setBusy(true);
            const promises = recentTitles.map(t => $.getJSON(`https://www.omdbapi.com/?apikey=${apiKey}&t=${encodeURIComponent(t)}&type=movie`));
            $.when(...promises).done(function (...results) {
                let movies = results.map(r => r[0]).filter(m => m?.Response === 'True');
                // Forzar año 2025 en las películas iniciales (mostrar 5)
                movies = movies.slice(0,5).map(m => (Object.assign({}, m, { Year: '2025' })));
                latestLoadedMovies = movies.slice();
                setBusy(false);
                renderMovies(movies);
            }).fail(() => { setBusy(false); $errorMsg.text('No se pudieron cargar películas recientes.'); });

            // No ocultamos automáticamente el formulario al iniciar.
            // Añadimos un control visible para permitir mostrar/ocultar la búsqueda.
            $('#toggle-search').on('click', function(){
                const $form = $movieForm;
                const expanded = $(this).attr('aria-expanded') === 'true';
                if(expanded) {
                    $form.addClass('hidden');
                    $(this).text('Mostrar búsqueda').attr('aria-expanded','false');
                } else {
                    $form.removeClass('hidden');
                    $(this).text('Ocultar búsqueda').attr('aria-expanded','true');
                }
            });

            // búsqueda avanzada toggle
            $('#toggle-advanced').on('click', function () {
                const $adv = $('#advanced-form');
                const expanded = $(this).attr('aria-expanded') === 'true';
                $(this).attr('aria-expanded', expanded ? 'false' : 'true');
                $adv.toggleClass('hidden').attr('aria-hidden', expanded ? 'true' : 'false');
            });

            $movieForm.on('submit', e => {
                e.preventDefault();
                const title = $movieInput.val().trim();
                const year = $filterYear.val().trim();
                const yearTo = $('#filter-year-to').val()?.trim();
                const genre = $('#filter-genre').val()?.trim();
                const type = $('#filter-type').val();
                searchMovies(title, year, { yearTo, genre, type });
            });
        };

        return { init, searchMovies, showDetails, filterByGenre };
    })();

    /************* Game Module *************/
    const gameModule = (() => {
        const $gameCard = $('#game-card');
        const $gamePrompt = $('#game-prompt');
        const $gameGuess = $('#game-guess');
        const $gameSubmit = $('#game-submit');
        const $gameFeedback = $('#game-feedback');
        const $gameNext = $('#game-next');
        const $gameReset = $('#game-reset');
        const $gameScoreVal = $('#game-score-val');

        let state = { movie: null, score: 0, attempts: [] };

        const setMovieForGame = movie => {
            state.movie = movie;
            $gamePrompt.text(`Adivina el año de estreno de: "${movie.Title}"`);
            $gameCard.removeClass('hidden');
            $gameFeedback.text('');
            $gameGuess.val('').focus();
        };

        const submitGuess = () => {
            if (!state.movie) return $gameFeedback.text('No hay película cargada para jugar.');
            const guess = parseInt($gameGuess.val(), 10);
            if (!guess || guess < 1800 || guess > 2100) return $gameFeedback.text('Introduce un año válido (1800-2100).');

            const actual = parseInt(state.movie.Year, 10);
            const diff = Math.abs(guess - actual);
            let points = 0;
            if (diff === 0) { points = 10; $gameFeedback.text(`¡Correcto! ${state.movie.Title} se estrenó en ${actual}. +10 puntos.`); }
            else if (diff <= 2) { points = 5; $gameFeedback.text(`Muy cerca. Año real: ${actual}. +5 puntos.`); }
            else if (diff <= 5) { points = 3; $gameFeedback.text(`Casi. Año real: ${actual}. +3 puntos.`); }
            else { $gameFeedback.text(`Incorrecto. Año real: ${actual}. +0 puntos.`); }

            state.score += points;
            state.attempts.push({ guess, actual, points });
            $gameScoreVal.text(state.score);
        };

        const nextMovie = () => { state.movie = null; $gameCard.addClass('hidden'); $gameFeedback.text(''); $gameGuess.val(''); };
        const resetGame = () => { state = { movie: null, score: 0, attempts: [] }; $gameScoreVal.text('0'); $gameCard.addClass('hidden'); $gameFeedback.text('Juego reiniciado.'); };

        const init = () => {
            $gameSubmit.on('click', submitGuess);
            $gameNext.on('click', nextMovie);
            $gameReset.on('click', resetGame);
        };

        return { init, setMovieForGame };
    })();

    /************* Feedback Module *************/
    const feedbackModule = (() => {
        const $fbForm = $('#feedback-form');
        const $fbName = $('#fb-name');
        const $fbEmail = $('#fb-email');
        const $fbText = $('#fb-text');
        const $fbMsg = $('#fb-msg');
        const $fbClear = $('#fb-clear');

        try {
            const draft = JSON.parse(localStorage.getItem('sr_feedback_draft') || 'null');
            if (draft) {
                $fbName.val(draft.name || '');
                $fbEmail.val(draft.email || '');
                $fbText.val(draft.text || '');
            }
        } catch (e) {}

        const saveDraft = () => {
            const draft = {
                name: $fbName.val().trim(),
                email: $fbEmail.val().trim(),
                text: $fbText.val().trim()
            };
            try { localStorage.setItem('sr_feedback_draft', JSON.stringify(draft)); } catch (e) {}
        };

        const init = () => {
            if (!$fbForm.length) return;

            $fbForm.on('submit', e => {
                e.preventDefault();
                const name = $fbName.val().trim();
                const text = $fbText.val().trim();
                if (!name || !text) {
                    $fbMsg.text('Por favor, completa tu nombre y la sugerencia.');
                    return;
                }

                // Aquí podrías enviar a un backend real; por ahora solo simulamos
                $fbMsg.text('¡Gracias por tu sugerencia!').fadeIn().delay(2000).fadeOut();
                $fbForm[0].reset();
                localStorage.removeItem('sr_feedback_draft');
            });

            $fbClear.on('click', () => {
                $fbForm[0].reset();
                $fbMsg.text('');
                localStorage.removeItem('sr_feedback_draft');
            });

            // Guardar borrador automáticamente
            $fbForm.on('input', saveDraft);
        };

        return { init };
    })();

    /************* Tabs Module *************/
    const tabsModule = (() => {
        const $tabs = $('#tools-tabs button[role="tab"]');
        const $panels = $('[role="tabpanel"]');

        const init = () => {
            $tabs.on('click keydown', function (e) {
                if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const $this = $(this);
                    const target = $this.attr('aria-controls');

                    $tabs.attr('aria-selected', 'false');
                    $panels.attr('hidden', true);

                    $this.attr('aria-selected', 'true');
                    $('#' + target).removeAttr('hidden').focus();
                }
            });
        };

        return { init };
    })();

    /************* Initialize All Modules *************/
    userModule.init();
    movieModule.init();
    gameModule.init();
    feedbackModule.init();
    tabsModule.init();
});

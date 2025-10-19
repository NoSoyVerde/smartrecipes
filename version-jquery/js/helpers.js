// Helpers compartidos
// validarTitulo: admite letras (incluidas tildes), números, espacios y puntuación común hasta 100 caracteres
function validarTitulo(titulo) {
    const regex = /^[\p{L}0-9\s:\-\'.,()]{1,100}$/u;
    return regex.test(titulo);
}

// crearElemento: atajo para crear elemento jQuery con clases y texto
function crearElemento(tag, clases = "", texto = "") {
    const $el = $('<' + tag + '>');
    if (clases) $el.addClass(clases);
    if (texto) $el.text(texto);
    return $el;
}

// Exportar utilidades a window para depuración manual
window._helpers = { validarTitulo, crearElemento };

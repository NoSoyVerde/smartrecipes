/**
 * Obtiene la lista de favoritos desde localStorage
 * @returns {Array} - array de recetas favoritas
 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    console.warn("Error leyendo favoritos desde localStorage");
    return [];
  }
}

/**
 * Guarda una receta en favoritos
 * @param {Object} recipe - objeto receta a guardar
 */
export function saveFavorite(recipe) {
  if (!recipe || !recipe.idMeal) return;
  const favs = getFavorites();
  if (!favs.find(f => f.idMeal === recipe.idMeal)) {
    favs.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favs));
  }
}

/**
 * Elimina una receta de favoritos por su ID
 * @param {string} idMeal - ID de la receta a eliminar
 */
export function removeFavorite(idMeal) {
  if (!idMeal) return;
  const favs = getFavorites().filter(r => r.idMeal !== idMeal);
  localStorage.setItem("favorites", JSON.stringify(favs));
}

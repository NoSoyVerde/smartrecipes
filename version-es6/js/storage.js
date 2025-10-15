export function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

export function saveFavorite(recipe) {
  const favs = getFavorites();
  if (!favs.find(f => f.idMeal === recipe.idMeal)) {
    favs.push(recipe);
    localStorage.setItem("favorites", JSON.stringify(favs));
  }
}

export function removeFavorite(idMeal) {
  const favs = getFavorites().filter(r => r.idMeal !== idMeal);
  localStorage.setItem("favorites", JSON.stringify(favs));
}

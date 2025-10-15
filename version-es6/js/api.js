/**
 * Obtiene recetas de la API TheMealDB
 * @param {string|null} query - nombre de la receta para buscar
 * @param {number} count - número de recetas aleatorias si query es null
 * @returns {Array} - array de recetas
 */
export async function fetchRecipes(query = null, count = 6) {
  const recipes = [];

  try {
    if (query) {
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Error cargando recetas");
      const data = await res.json();
      return data.meals || [];
    } else {
      const fetchedIds = new Set();
      for (let i = 0; i < count; i++) {
        let attempt = 0;
        let meal = null;
        while (attempt < 10 && !meal) {
          const res = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");
          if (!res.ok) throw new Error("Error cargando recetas aleatorias");
          const data = await res.json();
          if (data.meals && data.meals[0] && !fetchedIds.has(data.meals[0].idMeal)) {
            meal = data.meals[0];
            fetchedIds.add(meal.idMeal);
            recipes.push(meal);
          }
          attempt++;
        }
      }
      return recipes;
    }
  } catch (err) {
    console.error("Error en fetchRecipes:", err);
    return [];
  }
}

export async function fetchRecipes(query = "chicken") {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
  if (!res.ok) throw new Error("Error cargando recetas");
  const data = await res.json();
  return data.meals || [];
}

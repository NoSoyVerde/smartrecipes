import { fetchRecipes } from "./api.js";
import { renderRecipes, renderFavorites, renderContactForm } from "./ui.js";
import { setTheme, showLoader } from "./utils.js";

setTheme();

async function loadHome() {
  const app = document.getElementById("app");
  if (!app) return;

  // Crear contenedor de recetas si no existe
  let recipesContainer = document.getElementById("recipes-container");
  if (!recipesContainer) {
    recipesContainer = document.createElement("div");
    recipesContainer.id = "recipes-container";
    recipesContainer.className = "recipes-grid";
    app.innerHTML = "";
    app.appendChild(recipesContainer);
  }

  // Crear select de categorías si no existe
  let categorySelect = document.getElementById("category-select");
  if (!categorySelect) {
    categorySelect = document.createElement("select");
    categorySelect.id = "category-select";
    categorySelect.innerHTML = `<option value="">Todas las categorías</option>`;
    document.querySelector("nav").appendChild(categorySelect);
  }

  const categories = ["Beef", "Chicken", "Dessert", "Lamb", "Miscellaneous", "Pasta", "Pork", "Seafood", "Side", "Starter", "Vegan", "Vegetarian", "Breakfast", "Goat"];
  categories.forEach(cat => {
    if (!Array.from(categorySelect.options).some(o => o.value === cat)) {
      categorySelect.innerHTML += `<option value="${cat}">${cat}</option>`;
    }
  });

  async function loadRecipes(query = null, category = null) {
    showLoader("recipes-container");
    try {
      let recipes = await fetchRecipes(query);
      if (category) recipes = recipes.filter(r => r.strCategory === category);
      renderRecipes(recipes, "recipes-container");
    } catch (err) {
      recipesContainer.innerHTML = "<p>Error cargando recetas 😔</p>";
      console.error(err);
    }
  }

  categorySelect.addEventListener("change", e => {
    const selectedCategory = e.target.value || null;
    loadRecipes(null, selectedCategory);
  });

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  // Mostrar barra de búsqueda y categorías
  searchInput.style.display = "inline-block";
  searchBtn.style.display = "inline-block";
  categorySelect.style.display = "inline-block";

  const handleSearch = () => {
    const query = searchInput.value.trim();
    const category = categorySelect.value || null;
    loadRecipes(query, category);
  };

  searchBtn.addEventListener("click", handleSearch);
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  });

  // Cargar recetas aleatorias al inicio
  loadRecipes();
}

function router() {
  const page = location.hash.slice(1) || "home";
  const app = document.getElementById("app");
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const categorySelect = document.getElementById("category-select");

  if (page === "home") {
    if (searchInput) searchInput.style.display = "inline-block";
    if (searchBtn) searchBtn.style.display = "inline-block";
    if (categorySelect) categorySelect.style.display = "inline-block";

    // Asegurarse de que exista contenedor de recetas
    let recipesContainer = document.getElementById("recipes-container");
    if (!recipesContainer) {
      recipesContainer = document.createElement("div");
      recipesContainer.id = "recipes-container";
      recipesContainer.className = "recipes-grid";
      app.innerHTML = "";
      app.appendChild(recipesContainer);
    } else {
      recipesContainer.className = "recipes-grid";
    }

    loadHome();
  } else {
    if (searchInput) searchInput.style.display = "none";
    if (searchBtn) searchBtn.style.display = "none";
    if (categorySelect) categorySelect.style.display = "none";

    if (page === "favorites") {
      app.innerHTML = "";
      const favContainer = document.createElement("div");
      favContainer.className = "recipes-grid";
      favContainer.id = "recipes-container";
      app.appendChild(favContainer);
      renderFavorites();
    } else if (page === "contact") {
      app.innerHTML = "";
      renderContactForm();
    }
  }

  // Activar enlace de navegación
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  const link = document.querySelector(`[href="#${page}"]`);
  if (link) link.classList.add("active");
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", router);

import { fetchRecipes } from "./api.js";
import { renderRecipes, renderFavorites, renderContactForm } from "./ui.js";
import { setTheme } from "./utils.js";

setTheme();

async function loadHome() {
  const recipesContainer = document.getElementById("recipes-container");
  if (!recipesContainer) return;

  async function loadRecipes(query = null) {
    recipesContainer.innerHTML = "<p>Cargando recetas...</p>";
    try {
      const recipes = await fetchRecipes(query);
      renderRecipes(recipes, "recipes-container");
    } catch (err) {
      recipesContainer.innerHTML = "<p>Error cargando recetas 😔</p>";
      console.error(err);
    }
  }

  const searchBtn = document.getElementById("search-btn");
  const searchInput = document.getElementById("search-input");

  // Mostrar la barra de búsqueda
  searchInput.style.display = "inline-block";
  searchBtn.style.display = "inline-block";

  const handleSearch = () => {
    const query = searchInput.value.trim();
    if (query) loadRecipes(query);
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

  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const main = document.getElementById("app");

  // Mostrar u ocultar barra de búsqueda según página
  if (page === "home") {
    if (searchInput) searchInput.style.display = "inline-block";
    if (searchBtn) searchBtn.style.display = "inline-block";
    main.innerHTML = `<div id="recipes-container"></div>`;
    loadHome();
  } else {
    if (searchInput) searchInput.style.display = "none";
    if (searchBtn) searchBtn.style.display = "none";
    if (page === "favorites") renderFavorites();
    else if (page === "contact") renderContactForm();
  }

  // Activar enlace actual
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  const link = document.querySelector(`[href="#${page}"]`);
  if (link) link.classList.add("active");
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", router);

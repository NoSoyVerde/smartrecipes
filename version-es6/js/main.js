import { fetchRecipes } from "./api.js";
import { renderRecipes, renderFavorites, renderContactForm } from "./ui.js";
import { setTheme } from "./utils.js";

setTheme();

async function loadHome() {
  const recipes = await fetchRecipes("pasta");
  renderRecipes(recipes);
}

function router() {
  const page = location.hash.slice(1) || "home";
  document.querySelectorAll(".nav-link").forEach(a => a.classList.remove("active"));
  document.querySelector(`[href="#${page}"]`).classList.add("active");

  if (page === "home") loadHome();
  else if (page === "favorites") renderFavorites();
  else if (page === "contact") renderContactForm();
}

window.addEventListener("hashchange", router);
document.addEventListener("DOMContentLoaded", router);

import { saveFavorite, getFavorites, removeFavorite } from "./storage.js";

/**
 * Renderiza recetas en un contenedor específico
 * @param {Array} list - array de recetas
 * @param {string} containerId - id del contenedor donde renderizar
 */
export function renderRecipes(list, containerId = "app") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = "<p>No se encontraron recetas 😔</p>";
    return;
  }

  container.innerHTML = list.map(r => `
    <div class="recipe">
      <h3>${r.strMeal}</h3>
      <img src="${r.strMealThumb}" alt="${r.strMeal}" width="150"/>
      <p><strong>Categoría:</strong> ${r.strCategory || "Desconocida"}</p>
      <p><strong>Área:</strong> ${r.strArea || "Desconocida"}</p>
      <p><strong>Instrucciones:</strong> ${r.strInstructions ? r.strInstructions.slice(0, 100) + "..." : "No disponible"}</p>
      <button data-id="${r.idMeal}" class="fav-btn">❤️ Añadir a favoritos</button>
    </div>
  `).join("");

  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const recipe = list.find(r => r.idMeal === e.target.dataset.id);
      if (recipe) {
        saveFavorite(recipe);
        e.target.textContent = "✅ Favorito añadido";
        e.target.disabled = true;
        alert(`Receta "${recipe.strMeal}" añadida a favoritos ✅`);
      }
    });
  });
}

/**
 * Renderiza la lista de recetas favoritas
 */
export function renderFavorites() {
  const favs = getFavorites();
  const app = document.getElementById("app");
  if (favs.length === 0) {
    app.innerHTML = "<p>No tienes favoritos aún.</p>";
    return;
  }

  app.innerHTML = favs.map(f => `
    <div class="recipe">
      <h3>${f.strMeal}</h3>
      <img src="${f.strMealThumb}" alt="${f.strMeal}" width="150"/>
      <p><strong>Categoría:</strong> ${f.strCategory || "Desconocida"}</p>
      <p><strong>Área:</strong> ${f.strArea || "Desconocida"}</p>
      <button data-id="${f.idMeal}" class="remove-btn">🗑️ Eliminar</button>
    </div>
  `).join("");

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      removeFavorite(e.target.dataset.id);
      renderFavorites();
    });
  });
}

/**
 * Renderiza el formulario de contacto
 */
export function renderContactForm() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Contacto</h2>
    <form id="contact-form">
      <input type="text" id="name" placeholder="Nombre" required><br>
      <input type="email" id="email" placeholder="Email" required><br>
      <input type="tel" id="phone" placeholder="Teléfono"><br>
      <textarea id="msg" placeholder="Mensaje"></textarea><br>
      <button>Enviar</button>
    </form>
  `;
  const form = document.getElementById("contact-form");

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^(?:\+34)?\s?\d{9}$/;

    if (!emailRe.test(email)) return alert("Email no válido");
    if (phone && !phoneRe.test(phone)) return alert("Teléfono no válido");

    alert("Formulario enviado correctamente ✅");
    form.reset();
  });
}

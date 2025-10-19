// ui.js - Versión completa adaptada a la nueva rejilla y "leer más"

import { saveFavorite, getFavorites, removeFavorite } from "./storage.js";
import { showToast } from "./utils.js";

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

  // Construir HTML con lazy-loading y atributos accesibles
  container.innerHTML = list.map(r => {
    // Obtener ingredientes y cantidades
    let ingredients = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = r[`strIngredient${i}`];
      const measure = r[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients += `<li>${ingredient} - ${measure || ""}</li>`;
      }
    }

    return `
    <div class="recipe">
      <h3>${r.strMeal}</h3>
      <img loading="lazy" src="${r.strMealThumb}" alt="Imagen de ${r.strMeal}" width="150"/>
      <p><strong>Categoría:</strong> ${r.strCategory || "Desconocida"}</p>
      <p><strong>Área:</strong> ${r.strArea || "Desconocida"}</p>
      <p class="instructions-preview">${r.strInstructions ? r.strInstructions.slice(0, 100) + "..." : "No disponible"}</p>
      <button class="read-more-btn" data-id="${r.idMeal}" aria-expanded="false">Leer más</button>
      <ul class="ingredients-list" style="display:none;" aria-hidden="true">${ingredients}</ul>
      <button data-id="${r.idMeal}" class="fav-btn" aria-pressed="false">❤️ Añadir a favoritos</button>
    </div>
    `;
  }).join("");

  // Favoritos: delegado por data-id y lista de recetas en closure
  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id;
      const recipe = list.find(r => r.idMeal === id);
      if (!recipe) return;

      saveFavorite(recipe);
      e.currentTarget.textContent = "✅ Favorito añadido";
      e.currentTarget.disabled = true;
      e.currentTarget.classList.add("disabled");
      e.currentTarget.setAttribute('aria-pressed', 'true');
      showToast(`Receta "${recipe.strMeal}" añadida a favoritos ✅`);
    });
  });

  // Read more toggle: usar data-id para localizar receta
  container.querySelectorAll(".read-more-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.currentTarget.dataset.id;
      const recipe = list.find(r => r.idMeal === id);
      if (!recipe) return;

      const parent = e.currentTarget.closest(".recipe");
      const instructionsEl = parent.querySelector(".instructions-preview");
      const ingList = parent.querySelector(".ingredients-list");

      const expanded = e.currentTarget.getAttribute('aria-expanded') === 'true';
      if (expanded) {
        instructionsEl.textContent = recipe.strInstructions ? recipe.strInstructions.slice(0,100) + "..." : "No disponible";
        e.currentTarget.textContent = "Leer más";
        e.currentTarget.setAttribute('aria-expanded', 'false');
        ingList.style.display = 'none';
        ingList.setAttribute('aria-hidden', 'true');
      } else {
        instructionsEl.textContent = recipe.strInstructions || "No disponible";
        e.currentTarget.textContent = "Leer menos";
        e.currentTarget.setAttribute('aria-expanded', 'true');
        ingList.style.display = 'block';
        ingList.setAttribute('aria-hidden', 'false');
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

  app.innerHTML = `<div class="recipes-grid">` + favs.map(f => {
    // Ingredientes
    let ingredients = "";
    for (let i = 1; i <= 20; i++) {
      const ingredient = f[`strIngredient${i}`];
      const measure = f[`strMeasure${i}`];
      if (ingredient && ingredient.trim() !== "") {
        ingredients += `<li>${ingredient} - ${measure || ""}</li>`;
      }
    }

    return `
    <div class="recipe">
      <h3>${f.strMeal}</h3>
      <img src="${f.strMealThumb}" alt="${f.strMeal}" width="150"/>
      <p><strong>Categoría:</strong> ${f.strCategory || "Desconocida"}</p>
      <p><strong>Área:</strong> ${f.strArea || "Desconocida"}</p>
      <ul class="ingredients-list">${ingredients}</ul>
      <button data-id="${f.idMeal}" class="remove-btn">🗑️ Eliminar</button>
    </div>
    `;
  }).join("") + `</div>`;

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      removeFavorite(e.target.dataset.id);
      renderFavorites();
    });
  });
}

export function renderContactForm() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Contacto</h2>
    <form id="contact-form">
      <input type="text" id="name" placeholder="Nombre" required><br>
      <input type="email" id="email" placeholder="Email" required><br>

      <input type="tel" id="phone" placeholder="Número con prefijo, ej: +34 612345678" required><br>

      <textarea id="msg" placeholder="Mensaje"></textarea><br>
      <button>Enviar</button>
    </form>
    <div id="contact-feedback" style="margin-top:1em;"></div>
  `;

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-feedback");
  const phoneInput = document.getElementById("phone");

  const cookingTips = [
    "Usa ingredientes frescos siempre que sea posible.",
    "Mide los ingredientes con precisión para mejores resultados.",
    "Sazona los alimentos gradualmente y prueba constantemente.",
    "Mantén limpias las superficies de trabajo y utensilios.",
    "Controla la temperatura al cocinar para evitar quemar alimentos.",
    "Prepara todos los ingredientes antes de empezar.",
    "Lee la receta completa antes de comenzar.",
    "No sobrecargues la sartén para cocinar de manera uniforme."
  ];

  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const phone = phoneInput.value.trim();
    const msg = form.msg.value.trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Validar formato: +prefijo (1-3 dígitos) espacio número de 6-15 dígitos
    const phoneRe = /^\+([1-9]\d{0,2})\s\d{6,15}$/;

    if (!emailRe.test(email)) return showToast("Email no válido ❌");
    if (!phoneRe.test(phone)) return showToast("Número no válido ❌ (ej: +34 612345678)");

    const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];

    feedback.innerHTML = `
      <p>¡Gracias, <strong>${name}</strong>!</p>
      <p>Hemos recibido tu mensaje: "<em>${msg || "No escribiste nada 😅"}</em>"</p>
      <p>Te contactaremos en <strong>${email}</strong> o al número <strong>${phone}</strong>.</p>
      <p><strong>Consejo de cocina:</strong> ${randomTip}</p>
    `;

    showToast("Formulario enviado correctamente ✅");
    form.reset();
  });
}

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
      <img src="${r.strMealThumb}" alt="${r.strMeal}" width="150"/>
      <p><strong>Categoría:</strong> ${r.strCategory || "Desconocida"}</p>
      <p><strong>Área:</strong> ${r.strArea || "Desconocida"}</p>
      <p class="instructions-preview">${r.strInstructions ? r.strInstructions.slice(0, 100) + "..." : "No disponible"}</p>
      <button class="read-more-btn">Leer más</button>
      <ul class="ingredients-list" style="display:none;">${ingredients}</ul>
      <button data-id="${r.idMeal}" class="fav-btn">❤️ Añadir a favoritos</button>
    </div>
    `;
  }).join("");

  // Botón favoritos
  container.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const recipe = list.find(r => r.idMeal === e.target.dataset.id);
      if (recipe) {
        saveFavorite(recipe);
        e.target.textContent = "✅ Favorito añadido";
        e.target.disabled = true;
        e.target.classList.add("disabled");
        showToast(`Receta "${recipe.strMeal}" añadida a favoritos ✅`);
      }
    });
  });

  // Botón leer más
  container.querySelectorAll(".read-more-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const parent = e.target.closest(".recipe");
      const fullInstructions = list.find(r => r.strMeal === parent.querySelector("h3").textContent).strInstructions;
      const instructionsEl = parent.querySelector(".instructions-preview");
      if (instructionsEl.textContent.length > 120) {
        instructionsEl.textContent = fullInstructions;
        e.target.textContent = "Leer menos";
      } else {
        instructionsEl.textContent = fullInstructions.slice(0,100) + "...";
        e.target.textContent = "Leer más";
      }

      // Mostrar u ocultar ingredientes
      const ingList = parent.querySelector(".ingredients-list");
      if (ingList.style.display === "none") ingList.style.display = "block";
      else ingList.style.display = "none";
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

/**
 * Renderiza el formulario de contacto con select de país y consejos objetivos
 */
export async function renderContactForm() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h2>Contacto</h2>
    <form id="contact-form">
      <input type="text" id="name" placeholder="Nombre" required><br>
      <input type="email" id="email" placeholder="Email" required><br>

      <select id="country-select" required>
        <option value="">Selecciona tu país</option>
      </select>
      <input type="tel" id="phone" placeholder="Número de teléfono"><br>

      <textarea id="msg" placeholder="Mensaje"></textarea><br>
      <button>Enviar</button>
    </form>
    <div id="contact-feedback" style="margin-top:1em;"></div>
  `;

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-feedback");
  const countrySelect = document.getElementById("country-select");
  const phoneInput = document.getElementById("phone");

  // Cargar países y prefijos desde la API
  try {
    const res = await fetch("https://restcountries.com/v3.1/all");
    const data = await res.json();
    data.sort((a,b)=>a.name.common.localeCompare(b.name.common));
    data.forEach(c => {
      if(c.idd?.root && c.idd?.suffixes?.length){
        const code = `${c.idd.root}${c.idd.suffixes[0]}`;
        countrySelect.innerHTML += `<option value="${code}">+${code} ${c.name.common}</option>`;
      }
    });
  } catch (err) {
    console.error("Error cargando países:", err);
  }

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
    const countryCode = countrySelect.value;
    const phone = phoneInput.value.trim();
    const msg = form.msg.value.trim();

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^\d{6,15}$/;

    if (!emailRe.test(email)) return showToast("Email no válido ❌");
    if (!countryCode) return showToast("Selecciona un país ✅");
    if (!phoneRe.test(phone)) return showToast("Número no válido ❌");

    const fullPhone = `+${countryCode} ${phone}`;
    const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)];

    feedback.innerHTML = `
      <p>¡Gracias, <strong>${name}</strong>!</p>
      <p>Hemos recibido tu mensaje: "<em>${msg || "No escribiste nada 😅"}</em>"</p>
      <p>Te contactaremos en <strong>${email}</strong> o al número <strong>${fullPhone}</strong>.</p>
      <p><strong>Consejo de cocina:</strong> ${randomTip}</p>
    `;

    showToast("Formulario enviado correctamente ✅");
    form.reset();
  });
}

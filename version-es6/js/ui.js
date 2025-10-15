import { saveFavorite, getFavorites, removeFavorite } from "./storage.js";

export function renderRecipes(list) {
  const app = document.getElementById("app");
  app.innerHTML = list.map(r => `
    <div class="recipe">
      <h3>${r.strMeal}</h3>
      <img src="${r.strMealThumb}" width="150"/>
      <button data-id="${r.idMeal}" class="fav-btn">❤️ Favorito</button>
    </div>
  `).join("");

  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const recipe = list.find(r => r.idMeal === e.target.dataset.id);
      saveFavorite(recipe);
      alert("Receta añadida a favoritos ✅");
    });
  });
}

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
import { saveFavorite, getFavorites, removeFavorite } from "./storage.js";

export function renderRecipes(list) {
  const app = document.getElementById("app");
  app.innerHTML = list.map(r => `
    <div class="recipe">
      <h3>${r.strMeal}</h3>
      <img src="${r.strMealThumb}" width="150"/>
      <button data-id="${r.idMeal}" class="fav-btn">❤️ Favorito</button>
    </div>
  `).join("");

  document.querySelectorAll(".fav-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const recipe = list.find(r => r.idMeal === e.target.dataset.id);
      saveFavorite(recipe);
      alert("Receta añadida a favoritos ✅");
    });
  });
}

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
    const email = form.email.value;
    const phone = form.phone.value;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^(?:\+34)?\s?\d{9}$/;

    if (!emailRe.test(email)) return alert("Email no válido");
    if (phone && !phoneRe.test(phone)) return alert("Teléfono no válido");
    alert("Formulario enviado correctamente ✅");
    form.reset();
  });
}

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
    const email = form.email.value;
    const phone = form.phone.value;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRe = /^(?:\+34)?\s?\d{9}$/;

    if (!emailRe.test(email)) return alert("Email no válido");
    if (phone && !phoneRe.test(phone)) return alert("Teléfono no válido");
    alert("Formulario enviado correctamente ✅");
    form.reset();
  });
}

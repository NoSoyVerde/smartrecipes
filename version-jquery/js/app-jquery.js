$(document).ready(function() {
  const app = $("#app");

  function loadRecipes(query="chicken") {
    $.ajax({
      url: `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`,
      success: function(data) {
        const meals = data.meals || [];
        app.html(meals.map(r => `
          <div class="recipe">
            <h3>${r.strMeal}</h3>
            <img src="${r.strMealThumb}" width="150">
            <button class="fav-btn" data-id="${r.idMeal}">❤️ Favorito</button>
          </div>
        `).join(""));

        $(".fav-btn").on("click", function() {
          const id = $(this).data("id");
          const recipe = meals.find(r => r.idMeal == id);
          let favs = JSON.parse(localStorage.getItem("favorites")) || [];
          if (!favs.find(f => f.idMeal === id)) {
            favs.push(recipe);
            localStorage.setItem("favorites", JSON.stringify(favs));
          }
          alert("Receta añadida ✅");
        });
      },
      error: function() {
        app.html("<p>Error al cargar recetas</p>");
      }
    });
  }

  function loadFavorites() {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favs.length) return app.html("<p>No hay favoritos.</p>");
    app.html(favs.map(f => `
      <div class="recipe">
        <h3>${f.strMeal}</h3>
        <button class="remove-btn" data-id="${f.idMeal}">🗑️ Eliminar</button>
      </div>
    `).join(""));
    $(".remove-btn").on("click", function() {
      const id = $(this).data("id");
      const newFavs = favs.filter(f => f.idMeal != id);
      localStorage.setItem("favorites", JSON.stringify(newFavs));
      loadFavorites();
    });
  }

  function loadContact() {
    app.html(`
      <h2>Contacto</h2>
      <form id="contact-form">
        <input id="email" placeholder="Email" required><br>
        <input id="phone" placeholder="Teléfono"><br>
        <button>Enviar</button>
      </form>
    `);

    $("#contact-form").on("submit", function(e) {
      e.preventDefault();
      const email = $("#email").val();
      const phone = $("#phone").val();
     const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRe = /^(?:\+34)?\s?\d{9}$/;
      if (!emailRe.test(email)) return alert("Email no válido");
      if (phone && !phoneRe.test(phone)) return alert("Teléfono no válido");
      alert("Formulario enviado correctamente ✅");
    });
  }

  function router() {
    const page = location.hash.slice(1) || "home";
    $(".nav-link").removeClass("active");
    $(`a[href="#${page}"]`).addClass("active");

    if (page === "home") loadRecipes();
    else if (page === "favorites") loadFavorites();
    else if (page === "contact") loadContact();
  }

  $("#theme-toggle").on("click", function() {
    const current = $("body").attr("data-theme") || "light";
    const newTheme = current === "light" ? "dark" : "light";
    $("body").attr("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  });

  $(window).on("hashchange", router);
  router();
});

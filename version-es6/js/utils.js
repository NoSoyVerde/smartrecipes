/**
 * Gestiona el tema claro/oscuro y lo guarda en localStorage
 */
export function setTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;

  const body = document.body;
  const current = localStorage.getItem("theme") || "light";
  body.dataset.theme = current;

  const updateButtonIcon = () => {
    btn.textContent = body.dataset.theme === "light" ? "🌙" : "☀️";
  };

  updateButtonIcon();

  btn.addEventListener("click", () => {
    body.dataset.theme = body.dataset.theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", body.dataset.theme);
    updateButtonIcon();
  });
}

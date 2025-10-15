export function setTheme() {
  const btn = document.getElementById("theme-toggle");
  const body = document.body;
  const current = localStorage.getItem("theme") || "light";
  body.dataset.theme = current;

  btn.addEventListener("click", () => {
    const newTheme = body.dataset.theme === "light" ? "dark" : "light";
    body.dataset.theme = newTheme;
    localStorage.setItem("theme", newTheme);
  });
}

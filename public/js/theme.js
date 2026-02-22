(function () {
  const KEY = "swapcircle_theme";
  const btnId = "themeToggle";

  function apply(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme !== "dark");

    const btn = document.getElementById(btnId);
    if (btn) btn.textContent = theme === "dark" ? "Light mode" : "Dark mode";
  }

  function init() {
    const saved = localStorage.getItem(KEY) || "light";
    apply(saved);

    const btn = document.getElementById(btnId);
    if (!btn) return;

    btn.addEventListener("click", () => {
      const next = document.body.classList.contains("theme-dark") ? "light" : "dark";
      localStorage.setItem(KEY, next);
      apply(next);
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();

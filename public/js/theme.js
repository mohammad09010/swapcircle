(function () {
  const storageKey = "swapcircle-theme";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const toggle = document.getElementById("themeToggle");
    if (toggle) toggle.textContent = theme === "dark" ? "☀" : "☾";
  }

  window.addEventListener("DOMContentLoaded", () => {
    const savedTheme = window.localStorage.getItem(storageKey) || "light";
    applyTheme(savedTheme);

    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    toggle.addEventListener("click", () => {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      window.localStorage.setItem(storageKey, next);
      applyTheme(next);
    });
  });
})();

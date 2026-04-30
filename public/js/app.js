// SwapCircle client-side helpers (Sprint 4)
// Sprint 3 had a UI-only swap modal. Sprint 4 replaced that with a real
// server-rendered form, so this file now only handles the lightweight
// progressive-enhancement bits: image gallery and the toast.

function getToast() {
  return document.getElementById("toast");
}

function showToast(message) {
  const toast = getToast();
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast._timer);
  showToast._timer = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

function setupGallery() {
  const mainImage = document.querySelector(".detail-main-image");
  if (!mainImage) return;
  document.querySelectorAll(".detail-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.querySelectorAll(".detail-thumb").forEach((node) => node.classList.remove("active"));
      thumb.classList.add("active");
      const src = thumb.getAttribute("data-gallery");
      if (src) mainImage.src = src;
    });
  });
}

function setupItemImagePreview() {
  const input = document.getElementById("item_images");
  const preview = document.getElementById("imagePreview");

  if (!input || !preview) return;

  input.addEventListener("change", () => {
    preview.innerHTML = "";

    const files = Array.from(input.files || []);

    if (files.length > 5) {
      input.value = "";
      showToast("Please upload a maximum of 5 images.");
      return;
    }

    files.forEach((file, index) => {
      const card = document.createElement("div");
      card.className = "upload-preview-card";

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = `Selected item image ${index + 1}`;

      const label = document.createElement("span");
      label.textContent = index === 0 ? "Cover" : `Image ${index + 1}`;

      card.appendChild(img);
      card.appendChild(label);
      preview.appendChild(card);
    });
  });
}

// Auto-confirm destructive actions to protect against double-clicks
function setupConfirmForms() {
  document.querySelectorAll("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const message = form.getAttribute("data-confirm") || "Are you sure?";
      if (!window.confirm(message)) event.preventDefault();
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  setupGallery();
  setupConfirmForms();
  setupItemImagePreview();
});

window.showToast = showToast;

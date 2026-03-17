let currentSwap = null;

function getDialog() {
  return document.getElementById("swapDialog");
}

function getToast() {
  return document.getElementById("toast");
}

function openSwapModal(itemId, itemTitle) {
  currentSwap = { itemId, itemTitle };
  const dialog = getDialog();
  if (!dialog) return;

  const heading = dialog.querySelector(".swap-dialog-copy");
  if (heading) {
    heading.textContent = `Select the item you'd like to offer for \"${itemTitle}\". This remains a UI-only Sprint 3 demo.`;
  }

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  }
}

function closeSwapModal() {
  const dialog = getDialog();
  if (dialog && dialog.open) dialog.close();
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

function confirmSwap() {
  const selectedItem = document.getElementById("demoSwapItem");
  const offered = selectedItem ? selectedItem.value : "your item";
  const title = currentSwap?.itemTitle || "this listing";
  closeSwapModal();
  showToast(`Swap request sent for ${title} using ${offered} (demo only).`);
}

function setupFavorites() {
  document.querySelectorAll(".favorite-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      button.classList.toggle("active");
      button.textContent = button.classList.contains("active") ? "♥" : "♡";
    });
  });
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

window.addEventListener("DOMContentLoaded", () => {
  setupFavorites();
  setupGallery();

  const dialog = getDialog();
  if (dialog) {
    dialog.addEventListener("click", (event) => {
      const rect = dialog.querySelector(".swap-dialog-card")?.getBoundingClientRect();
      if (!rect) return;
      const inDialog =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;
      if (!inDialog) closeSwapModal();
    });
  }
});

window.openSwapModal = openSwapModal;
window.closeSwapModal = closeSwapModal;
window.confirmSwap = confirmSwap;

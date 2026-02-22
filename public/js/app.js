let currentSwap = null;

function openSwapModal(itemId, itemTitle) {
  currentSwap = { itemId, itemTitle };

  const dlg = document.getElementById("swapDialog");
  const txt = document.getElementById("swapText");
  if (txt) {
    txt.textContent =
      `You’re about to request a swap for: "${itemTitle}". ` +
      `This is a UI-only demo (no message is actually sent).`;
  }
  if (dlg && typeof dlg.showModal === "function") dlg.showModal();
}

function closeSwapModal() {
  const dlg = document.getElementById("swapDialog");
  if (dlg && typeof dlg.close === "function") dlg.close();
  currentSwap = null;
}

function confirmSwap() {
  const title = currentSwap?.itemTitle || "this item";
  closeSwapModal();
  alert(`Swap request sent for "${title}" (demo UI only).`);
}

window.openSwapModal = openSwapModal;
window.closeSwapModal = closeSwapModal;
window.confirmSwap = confirmSwap;

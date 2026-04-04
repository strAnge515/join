function openAddContactModal() {
  document.getElementById("addContactOverlay").classList.add("active");
}

function closeAddContactModal(event) {
  const overlay = document.getElementById("addContactOverlay");

  if (!event || event.target === overlay) {
    overlay.classList.remove("active");
  }
}
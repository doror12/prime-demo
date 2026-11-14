// Common navigation used across all pages.
const adminButton = document.querySelector("#adminOpen");
const modal = document.querySelector("#modal");
const closeButton = document.querySelector(".close");

if (adminButton) {
  adminButton.addEventListener("click", () => {
    window.location.href = "/admin.html";
  });
}

if (modal && closeButton) {
  closeButton.addEventListener("click", () => modal.close());
}

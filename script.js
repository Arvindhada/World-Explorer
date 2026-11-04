// ==========================================================
// WORLD-EXPLORER PROJECT
// Is file mein project ka saara JavaScript logic aayega.
// ==========================================================


// 1. HTML Elements ko JavaScript se connect karna

// Mobile menu button aur mobile nav
const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const mobileMenu = document.querySelector("#mobileMenu");


// 2. Mobile Menu Toggle
// Chhoti screen par hamburger button se menu khulta/band hota hai.

mobileMenuBtn.addEventListener("click", () => {
  // Abhi menu khula hai ya band, ye pata karna
  const isOpen = !mobileMenu.classList.contains("hidden");

  // hidden ↔ flex toggle
  mobileMenu.classList.toggle("hidden", isOpen);
  mobileMenu.classList.toggle("flex", !isOpen);

  // Screen reader ko batao menu khula hai ya nahi
  mobileMenuBtn.setAttribute("aria-expanded", String(!isOpen));

  // Icon badlo: ☰ ↔ ✕
  mobileMenuBtn.textContent = isOpen ? "☰" : "✕";
});


// Mobile menu ke kisi link par click ho to menu band kar dena

mobileMenu.addEventListener("click", (event) => {
  if (!event.target.closest("a")) return;

  mobileMenu.classList.add("hidden");
  mobileMenu.classList.remove("flex");
  mobileMenuBtn.setAttribute("aria-expanded", "false");
  mobileMenuBtn.textContent = "☰";
});

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


// 3. Search Elements

// Search box aur search button
const searchInput = document.querySelector("#searchInput");
const searchButton = document.querySelector("#searchBtn");


// 4. Search Box ke Events

// Search button click hone par filter chalana
searchButton.addEventListener("click", () => applyFilters(true));

// Search box mein Enter press karne par bhi turant filter
searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyFilters(true);
  }
});


// 5. Dashboard Statistics Elements
// Total countries, screen par dikhne wali countries aur favorites ki count.

const totalCountriesEl = document.querySelector("#totalCountries");
const showingCountriesEl = document.querySelector("#showingCountries");
const favoriteCountEl = document.querySelector("#favoriteCount");


// 6. Sort aur Favorites dropdowns

const sortFilter = document.querySelector("#sortFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");


// 7. Footer ka year current rakho

const yearEl = document.querySelector("#year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// 8. API URL
// Yahan se hum countries ka data API ke through laate hain.

const API_URL =
  "https://countries.dev/countries?fields=name,capital,region,population,flags";


// 9. Country cards dikhane wala container

const container = document.querySelector("#countryContainer");


// 10. Data Store karne ke liye state

// API se aane wale saare countries
let allCountries = [];

// User ke favorite countries
let favoriteCountries = [];

// Kaunsa region active hai ("all" = sab)
let activeRegion = "all";


// 11. Population format karna
// Example: 1000000 = 1.0 M

function formatPopulation(num) {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + " B";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + " M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(0) + " K";
  }
  return String(num);
}


// 12. Region normalize karna
// API mein "Polar", "Antarctic" aur "Antarctic Ocean" jaise alag region
// naam aate hain. Unhe ek hi naam mein laate hain.

const KNOWN_REGIONS = ["Asia", "Europe", "Africa", "Americas", "Oceania"];

function normalizeRegion(region) {
  if (!region) return "Unknown";
  return KNOWN_REGIONS.includes(region) ? region : "Antarctic";
}


// 13. Dashboard Statistics Update Karna

function updateStatistics(shownCount) {
  totalCountriesEl.textContent = allCountries.length;
  showingCountriesEl.textContent = shownCount;
  favoriteCountEl.textContent = favoriteCountries.length;
}


// 14. Filter chalana
// Abhi data aane par sirf statistics update hoti hai.
// Search aur region filter aage ke dinon mein judega.

function applyFilters() {
  updateStatistics(allCountries.length);
}


// 15. API se Countries ka Data Lana
// async ka matlab function asynchronous kaam karega.
// await API response ka wait karega.

async function fetchCountries() {
  const response = await fetch(API_URL);
  const data = await response.json();

  // API data ko apne required format mein convert karna
  allCountries = data.map((country) => {
    const rawPopulation = Number(country.population) || 0;

    return {
      name: String(country.name ?? "Unknown"),

      // Capital missing ho to N/A (Antarctica jaise cases)
      capital: country.capital || "N/A",

      region: normalizeRegion(country.region),

      // Card ke liye halka PNG flag
      flag: country.flags?.png || country.flags?.svg || "",

      // Popup ke liye sharper SVG flag
      flagLarge: country.flags?.svg || country.flags?.png || "",

      population: formatPopulation(rawPopulation),

      // Sorting ke liye original numeric population
      rawPopulation,
    };
  });

  // Countries ko initially A-Z order mein arrange karna
  allCountries.sort((a, b) => a.name.localeCompare(b.name));

  applyFilters(true);
}


// 16. Project Initialize Karna
// JavaScript load hote hi API se countries fetch karo.

fetchCountries();

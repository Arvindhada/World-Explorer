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

// List ka heading — Favorites mode mein text badalta hai
const listHeadingEl = document.querySelector("#listHeading");


// 6. Sort aur Favorites dropdowns

const sortFilter = document.querySelector("#sortFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");

// Region filter ke pills wala wrapper
const regionPills = document.querySelector("#regionPills");


// 7. Footer ka year current rakho

const yearEl = document.querySelector("#year");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// 8. API URL
// Yahan se hum countries ka data API ke through laate hain.

const API_URL =
  "https://countries.dev/countries?fields=name,capital,region,population,flags";


// 9. Country cards, Comparison aur Modal ke elements

const container = document.querySelector("#countryContainer");

// Do countries compare karne wala box

const comparisonContainer = document.querySelector("#comparisonContainer");

// Country details ka popup, uska content aur close button

const countryModal = document.querySelector("#countryModal");
const modalDetails = document.querySelector("#modalDetails");
const closeModalBtn = document.querySelector("#closeModal");


// 10. Data Store karne ke liye state

// API se aane wale saare countries
let allCountries = [];

// User ke favorite countries
let favoriteCountries = loadFavorites();

// Kaunsa region active hai ("all" = sab)
let activeRegion = "all";

// Compare ke liye select ki hui countries (maximum 2)
let selectedCountries = [];

// Compare limit ka message
let compareMessage = "";

// Popup band hone par focus wapas kahan bhejna hai
let lastFocusedElement = null;


// 11. Tailwind Button Classes
// Ek jagah rakhne se button ke states manage karna easy hota hai.

const BTN_FAVORITE_ON =
  "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100";

const BTN_FAVORITE_OFF = "bg-gray-900 text-white hover:bg-gray-800";

const BTN_COMPARE_ON = "bg-violet-600 text-white hover:bg-violet-700";

const BTN_COMPARE_OFF =
  "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-100";

const BTN_BASE =
  "rounded-lg px-3 py-2 text-sm font-semibold transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2";


// 12. Browser se purane favorites load karna

function loadFavorites() {
  try {
    // localStorage sirf text store karta hai,
    // JSON.parse us text ko wapas array bana deta hai.
    const saved = JSON.parse(localStorage.getItem("favoriteCountries"));
    return Array.isArray(saved) ? saved : [];
  } catch {
    // Saved data kharab ho to empty array se start karenge
    return [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem("favoriteCountries", JSON.stringify(favoriteCountries));
  } catch {
    // Private mode ya quota full — app crash nahi hona chahiye
    console.warn("Favorites save nahi ho paye.");
  }
}


// 13. Population format karna
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


// 14. Region normalize karna
// API mein "Polar", "Antarctic" aur "Antarctic Ocean" jaise alag region
// naam aate hain. Unhe ek hi naam mein laate hain.

const KNOWN_REGIONS = ["Asia", "Europe", "Africa", "Americas", "Oceania"];

function normalizeRegion(region) {
  if (!region) return "Unknown";
  return KNOWN_REGIONS.includes(region) ? region : "Antarctic";
}


// 15. Chhota safety helper
// API ka data innerHTML mein ja raha hai, isliye special characters
// escape karna zaroori hai.

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[character];
  });
}


// 16. Card ke andar ki ek info line

function infoRow(label, value) {
  return `
    <div class="flex items-baseline justify-between gap-3">
      <dt class="shrink-0 text-gray-400">${label}</dt>
      <dd class="truncate text-right font-medium text-gray-700" title="${escapeHtml(value)}">${escapeHtml(value)}</dd>
    </div>
  `;
}


// 17. Ek Country Card ka HTML

function cardHTML(country) {
  const safeName = escapeHtml(country.name);
  const isFavorite = favoriteCountries.includes(country.name);
  const isComparing = selectedCountries.includes(country.name);

  // Flag na mile to emoji fallback dikhana
  const flagMarkup = country.flag
    ? `<img
         src="${escapeHtml(country.flag)}"
         alt="Flag of ${safeName}"
         class="h-full w-full object-cover"
       >`
    : `<div class="flex h-full w-full items-center justify-center text-3xl">🌐</div>`;

  return `
    <article class="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div class="h-36 shrink-0 overflow-hidden bg-gray-100">
        ${flagMarkup}
      </div>

      <div class="flex-1 p-4">
        <h3 class="mb-3 line-clamp-2 text-base font-bold leading-snug text-gray-900">
          ${safeName}
        </h3>

        <dl class="space-y-1.5 text-sm">
          ${infoRow("Capital", country.capital)}
          ${infoRow("Region", country.region)}
          ${infoRow("Population", country.population)}
        </dl>
      </div>

      <div class="flex flex-col gap-2 p-4 pt-0">
        <button
          type="button"
          data-name="${safeName}"
          class="favorite-btn ${BTN_BASE} w-full ${isFavorite ? BTN_FAVORITE_ON : BTN_FAVORITE_OFF}"
        >
          ${isFavorite ? "❤️ Remove Favorite" : "🤍 Add Favorite"}
        </button>

        <div class="flex gap-2">
          <button
            type="button"
            data-name="${safeName}"
            class="details-btn ${BTN_BASE} flex-1 bg-sky-600 text-white hover:bg-sky-700"
          >
            View Details
          </button>

          <button
            type="button"
            data-name="${safeName}"
            class="compare-btn ${BTN_BASE} flex-1 ${isComparing ? BTN_COMPARE_ON : BTN_COMPARE_OFF}"
          >
            ${isComparing ? "✓ Comparing" : "Compare"}
          </button>
        </div>
      </div>
    </article>
  `;
}


// 18. Country Cards Render Karna

function renderCards(countries) {
  // Heading: Favorites mode mein alag dikhta hai
  listHeadingEl.textContent =
    favoritesFilter.value === "favorites"
      ? "\u2764\uFE0F Your Favorites"
      : "\u{1F30D} Popular Countries";

  // Comparison box hamesha refresh ho
  updateComparison();

  if (countries.length === 0) {
    container.innerHTML = emptyStateHTML();
    updateStatistics(0);
    return;
  }

  container.innerHTML = countries.map(cardHTML).join("");
  updateStatistics(countries.length);
}


// 19. Dashboard Statistics Update Karna

function updateStatistics(shownCount) {
  totalCountriesEl.textContent = allCountries.length;
  showingCountriesEl.textContent = shownCount;
  favoriteCountEl.textContent = favoriteCountries.length;
}


// 20. Empty State (kuch na mile to)

function emptyStateHTML() {
  // Agar filter "Favorites Only" par hai to alag message
  const favoritesOnly = favoritesFilter.value === "favorites";

  const icon = favoritesOnly ? "💔" : "🧭";
  const title = favoritesOnly ? "No favorites yet" : "No countries found";
  const hint = favoritesOnly
    ? "Tap the \u{1F90D} Add Favorite button on any country card to save it here."
    : "Try a different spelling, or clear the region and favorites filters.";

  return `
    <div class="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <span class="text-4xl">${icon}</span>
      <p class="text-base font-semibold text-gray-600">${title}</p>
      <p class="max-w-sm text-sm text-gray-400">${hint}</p>
      <button
        type="button"
        id="resetFiltersBtn"
        class="mt-1 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95"
      >
        ${favoritesOnly ? "Show all countries" : "Reset filters"}
      </button>
    </div>
  `;
}


// 21. Countries ko Sort Karna
// Dropdown ki value ke hisaab se list ka order badalta hai.

function sortCountries(countries) {
  const sorted = [...countries];

  if (sortFilter.value === "az") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortFilter.value === "za") {
    sorted.sort((a, b) => b.name.localeCompare(a.name));
  } else if (sortFilter.value === "populationHigh") {
    sorted.sort((a, b) => b.rawPopulation - a.rawPopulation);
  } else if (sortFilter.value === "populationLow") {
    sorted.sort((a, b) => a.rawPopulation - b.rawPopulation);
  }

  return sorted;
}


// 22. Filter chalana
// Search text country ke naam, capital aur region — teeno mein dhoonda jata hai.

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedFavorite = favoritesFilter.value;

  const result = allCountries.filter((country) => {
    // Naam, capital aur region ek hi string mein jod kar search karna
    const haystack =
      `${country.name} ${country.capital} ${country.region}`.toLowerCase();

    const matchesSearch = haystack.includes(searchText);
    const matchesRegion =
      activeRegion === "all" || country.region === activeRegion;
    const matchesFavorite =
      selectedFavorite !== "favorites" ||
      favoriteCountries.includes(country.name);

    return matchesSearch && matchesRegion && matchesFavorite;
  });

  renderCards(sortCountries(result));
}


// 23. Favorite Add / Remove

function toggleFavorite(countryName) {
  if (favoriteCountries.includes(countryName)) {
    favoriteCountries = favoriteCountries.filter((name) => name !== countryName);
  } else {
    favoriteCountries.push(countryName);
  }

  saveFavorites();

  // Cards aur statistics refresh karna
  applyFilters();
}


// 24. Region Pills ka Active State
// Jo region select hai uske pill ko green banate hain, baaki white.

function paintRegionPills() {
  regionPills.querySelectorAll(".region-btn").forEach((button) => {
    const isActive = button.dataset.region === activeRegion;

    button.classList.toggle("bg-green-600", isActive);
    button.classList.toggle("text-white", isActive);
    button.classList.toggle("shadow-sm", isActive);

    button.classList.toggle("bg-white", !isActive);
    button.classList.toggle("text-gray-600", !isActive);
    button.classList.toggle("border", !isActive);
    button.classList.toggle("border-gray-200", !isActive);
    button.classList.toggle("hover:border-green-400", !isActive);
    button.classList.toggle("hover:text-green-600", !isActive);
  });
}


// 25. Country Details Popup Dikhana

function openDetails(countryName) {
  const country = allCountries.find((item) => item.name === countryName);

  if (!country) return;

  // Focus wapas karne ke liye yaad rakhna
  lastFocusedElement = document.activeElement;

  modalDetails.innerHTML = `
    <div class="relative h-44 bg-gray-100">
      ${
        country.flagLarge
          ? `<img
               src="${escapeHtml(country.flagLarge)}"
               alt="Flag of ${escapeHtml(country.name)}"
               class="h-full w-full object-cover"
             >`
          : `<div class="flex h-full w-full items-center justify-center text-5xl">🌐</div>`
      }

      <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>

      <h2
        id="modalTitle"
        class="absolute inset-x-5 bottom-4 text-xl font-extrabold leading-tight text-white drop-shadow"
      >
        ${escapeHtml(country.name)}
      </h2>
    </div>

    <dl class="space-y-3 p-5 text-sm">
      <div class="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
        <dt class="text-gray-400">Capital</dt>
        <dd class="text-right font-semibold text-gray-800">${escapeHtml(country.capital)}</dd>
      </div>

      <div class="flex items-center justify-between gap-4 border-b border-gray-100 pb-2">
        <dt class="text-gray-400">Region</dt>
        <dd class="text-right font-semibold text-gray-800">${escapeHtml(country.region)}</dd>
      </div>

      <div class="flex items-center justify-between gap-4">
        <dt class="text-gray-400">Population</dt>
        <dd class="text-right font-semibold text-gray-800">${escapeHtml(country.population)}</dd>
      </div>
    </dl>
  `;

  // Popup dikhana
  countryModal.classList.remove("hidden");
  countryModal.classList.add("flex");

  // Background scroll lock
  document.body.classList.add("overflow-hidden");

  // Keyboard user ka focus popup ke andar le jao
  closeModalBtn.focus();
}


// 26. Popup Band Karna

function closeDetails() {
  if (countryModal.classList.contains("hidden")) return;

  countryModal.classList.add("hidden");
  countryModal.classList.remove("flex");

  document.body.classList.remove("overflow-hidden");

  // Focus wapas usi button par jahan se popup khula tha
  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
}


// 27. Popup Close — button, backdrop aur Escape key

closeModalBtn.addEventListener("click", closeDetails);

countryModal.addEventListener("click", (event) => {
  // Click popup ke bahar (backdrop par) hua
  if (event.target === countryModal) {
    closeDetails();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDetails();
  }
});


// 28. Popup ke andar focus trap (keyboard accessibility)

countryModal.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;

  const focusable = countryModal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();

  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});


// 29. Country Comparison Add / Remove

function toggleCompare(countryName) {
  if (selectedCountries.includes(countryName)) {
    selectedCountries = selectedCountries.filter((name) => name !== countryName);
    compareMessage = "";

  } else {
    // Maximum 2 countries hi compare kar sakte hain
    if (selectedCountries.length >= 2) {
      compareMessage = "You can compare only 2 countries. Remove one first.";
      updateComparison();
      return;
    }

    selectedCountries.push(countryName);
    compareMessage = "";
  }

  applyFilters();
}


// 30. Comparison Table Update Karna

function updateComparison() {
  // selectedCountries ka order maintain karna zaroori hai
  const comparisonData = selectedCountries
    .map((name) => allCountries.find((country) => country.name === name))
    .filter(Boolean);

  // Kuch select nahi hai to placeholder dikhao
  // (isse "Compare" nav link bhi kaam karta hai)
  if (comparisonData.length === 0) {
    comparisonContainer.innerHTML = `
      <div class="rounded-2xl border-2 border-dashed border-gray-200 bg-white/60 p-8 text-center">
        <p class="mb-1 text-2xl">⚖️</p>
        <h2 class="text-base font-bold text-gray-700">Country Comparison</h2>
        <p class="mt-1 text-sm text-gray-400">
          Use the <span class="font-semibold text-violet-600">Compare</span> button on any two cards to see them side by side.
        </p>
      </div>
    `;
    return;
  }

  // Selected countries ke remove chips
  const chips = comparisonData
    .map(
      (country) => `
        <button
          type="button"
          data-name="${escapeHtml(country.name)}"
          class="remove-compare-btn inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
        >
          ${escapeHtml(country.name)}
          <span aria-hidden="true">✕</span>
        </button>
      `
    )
    .join("");

  let bodyHTML = "";

  if (comparisonData.length < 2) {
    // Sirf ek country select hui hai
    bodyHTML = `
      <p class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Select one more country to compare.
      </p>
    `;

  } else {
    const first = comparisonData[0];
    const second = comparisonData[1];

    // Zyada population wala green highlight hoga
    const firstWins = first.rawPopulation > second.rawPopulation;
    const secondWins = second.rawPopulation > first.rawPopulation;

    bodyHTML = `
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-center text-sm">
          <thead>
            <tr class="bg-gray-50">
              <th class="w-1/4 border border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-500">Details</th>
              <th class="border border-gray-200 px-3 py-2.5 font-bold text-gray-800">${escapeHtml(first.name)}</th>
              <th class="border border-gray-200 px-3 py-2.5 font-bold text-gray-800">${escapeHtml(second.name)}</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Flag</td>
              <td class="border border-gray-200 px-3 py-2.5">
                <img src="${escapeHtml(first.flag)}" alt="" class="mx-auto h-12 w-20 rounded object-cover">
              </td>
              <td class="border border-gray-200 px-3 py-2.5">
                <img src="${escapeHtml(second.flag)}" alt="" class="mx-auto h-12 w-20 rounded object-cover">
              </td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Capital</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${escapeHtml(first.capital)}</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${escapeHtml(second.capital)}</td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Region</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${escapeHtml(first.region)}</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${escapeHtml(second.region)}</td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Population</td>
              <td class="border border-gray-200 px-3 py-2.5 ${firstWins ? "bg-green-50 font-bold text-green-700" : "text-gray-700"}">
                ${escapeHtml(first.population)}
              </td>
              <td class="border border-gray-200 px-3 py-2.5 ${secondWins ? "bg-green-50 font-bold text-green-700" : "text-gray-700"}">
                ${escapeHtml(second.population)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  comparisonContainer.innerHTML = `
    <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800">⚖️ Country Comparison</h2>

        <button
          type="button"
          id="clearCompareBtn"
          class="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
        >
          Clear all
        </button>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">${chips}</div>

      ${
        compareMessage
          ? `<p class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">${escapeHtml(compareMessage)}</p>`
          : ""
      }

      ${bodyHTML}
    </div>
  `;
}


// 31. Comparison Box ke Buttons

comparisonContainer.addEventListener("click", (event) => {
  const removeBtn = event.target.closest(".remove-compare-btn");

  if (removeBtn) {
    toggleCompare(removeBtn.dataset.name);
    return;
  }

  if (event.target.closest("#clearCompareBtn")) {
    selectedCountries = [];
    compareMessage = "";
    applyFilters();
  }
});


// 32. Search Debounce
// Har key stroke par 250 countries filter karne ki zaroorat nahi —
// 250ms ruk kar chalate hain.

let searchTimer = null;

function scheduleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => applyFilters(true), 250);
}

// Search box mein type karte hi (debounced) search
searchInput.addEventListener("input", scheduleSearch);

// Region pills — click hote hi us region ki countries dikhao
regionPills.addEventListener("click", (event) => {
  const button = event.target.closest(".region-btn");

  if (!button) return;

  activeRegion = button.dataset.region || "all";

  paintRegionPills();
  applyFilters(true);
});

// Sorting dropdown
sortFilter.addEventListener("change", () => applyFilters(true));

// Favorites dropdown
favoritesFilter.addEventListener("change", () => applyFilters(true));

// Pehli baar active pill sahi dikhe
paintRegionPills();


// 33. Country Card Buttons Handle Karna
// Event Delegation: parent container par ek listener,
// saare buttons usi se handle ho jaate hain.

container.addEventListener("click", (event) => {
  const button = event.target.closest("button");

  if (!button) return;

  // Empty state ka reset button
  if (button.id === "resetFiltersBtn") {
    searchInput.value = "";
    favoritesFilter.value = "all";
    sortFilter.value = "default";
    activeRegion = "all";
    paintRegionPills();
    applyFilters(true);
    return;
  }

  // Favorite button click hua
  if (button.classList.contains("favorite-btn")) {
    toggleFavorite(button.dataset.name);

  // Details button click hua
  } else if (button.classList.contains("details-btn")) {
    openDetails(button.dataset.name);

  // Compare button click hua
  } else if (button.classList.contains("compare-btn")) {
    toggleCompare(button.dataset.name);
  }
});


// 34. Loading Skeleton
// API ka jawab aane tak grey pulsing cards dikhte hain.

function skeletonHTML() {
  return Array.from({ length: 8 })
    .map(
      () => `<div class="h-72 animate-pulse rounded-2xl bg-gray-200/80"></div>`
    )
    .join("");
}


// 35. API Error Dikhana
// Internet na ho ya API fail ho to user ko Retry ka option milta hai.

function showError() {
  container.innerHTML = `
    <div class="col-span-full flex flex-col items-center gap-3 py-16 text-center">
      <span class="text-4xl">⚠️</span>
      <p class="text-base font-semibold text-gray-600">Unable to load countries</p>
      <p class="max-w-sm text-sm text-gray-400">
        Check your internet connection and try again.
      </p>
      <button
        type="button"
        id="retryBtn"
        class="mt-1 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95"
      >
        Retry
      </button>
    </div>
  `;

  // Retry click hone par API dobara call karna
  const retryBtn = container.querySelector("#retryBtn");

  if (retryBtn) {
    retryBtn.addEventListener("click", fetchCountries);
  }
}


// 36. API se Countries ka Data Lana
// async ka matlab function asynchronous kaam karega.
// await API response ka wait karega.

async function fetchCountries() {
  // API load hone tak loading skeleton dikhana
  container.innerHTML = skeletonHTML();

  // API request mein error aaye to catch handle karega
  try {
    const response = await fetch(API_URL);

    // Check karna response successful hai ya nahi
    if (!response.ok) {
      throw new Error("Failed to fetch countries");
    }

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

  } catch (error) {
    // Developer ke liye console mein actual error
    console.error("Error loading countries:", error);

    // User ko friendly error message
    showError();
  }
}


// 37. Nav ke "Favorites" link
// Click karne par list apne aap "Favorites Only" mode mein aa jati hai
// (jaise dropdown se All Countries ko Favorites Only karte hain).

document.querySelectorAll("[data-show-favorites]").forEach((link) => {
  link.addEventListener("click", () => {
    favoritesFilter.value = "favorites";
    applyFilters(true);
  });
});


// 38. Project Initialize Karna
// JavaScript load hote hi API se countries fetch karo.

fetchCountries();

// =========================================================
// WORLD EXPLORER - script.js
// API se countries laate hain, cards banate hain, search,
// region filter, sort, favorites, compare aur detail page
// sab yahan handle hota hai.
// Simple JavaScript - koi framework nahi.
// =========================================================


// ---------------------------------------------------------
// 1. Select Elements
// ---------------------------------------------------------

const countryContainer = document.querySelector("#countryContainer");
const comparisonContainer = document.querySelector("#comparisonContainer");

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");

const regionPills = document.querySelector("#regionPills");
const sortFilter = document.querySelector("#sortFilter");
const favoritesFilter = document.querySelector("#favoritesFilter");
const listHeading = document.querySelector("#listHeading");

const totalCountriesEl = document.querySelector("#totalCountries");
const showingCountriesEl = document.querySelector("#showingCountries");
const favoriteCountEl = document.querySelector("#favoriteCount");

const countryPage = document.querySelector("#countryPage");
const countryPageContent = document.querySelector("#countryPageContent");
const backToExploreBtn = document.querySelector("#backToExploreBtn");

const exploreSection = document.querySelector("#explore");
const mainContent = document.querySelector("#mainContent");
const footer = document.querySelector("#footer");

const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
const mobileMenu = document.querySelector("#mobileMenu");

const yearEl = document.querySelector("#year");


// ---------------------------------------------------------
// 2. Global Data
// ---------------------------------------------------------

// API se aaya pura data yahan save hota hai
let countries = [];

// Favorites browser ki memory se wapas laao
let favorites = JSON.parse(localStorage.getItem("favoriteCountries")) || [];

// Kaunsa region select hai ("all" = sab regions)
let selectedRegion = "all";

// Header nav me kaunsa tab active hai ("explore" ya "favorites")
let activeNav = "explore";

// Compare ke liye chuni hui countries (maximum 2)
let compareCountries = [];

// Compare ki limit ka message
let compareMessage = "";

// Detail page par abhi kaunsi country khuli hai
let activeCountry = "";

// Detail page se wapas aane par yahi scroll position dikhani hai
let oldScroll = 0;


// API URL - jitne fields chahiye utne hi maangte hain
// limit=50 matlab API se sirf 50 countries aayengi (60 chahiye to limit=60)
const API_URL =
  "https://countries.dev/countries?fields=name,nativeName,capital,region,subregion,population,area,demonym,languages,currencies,flags,latlng,timezones,alpha3Code,callingCodes,topLevelDomain&limit=50";


// ---------------------------------------------------------
// 3. Country ki value nikalne wale chhote functions
// ---------------------------------------------------------

function getCountryName(country) {
  return country.name || "Unknown Country";
}

function getCapital(country) {
  return country.capital || "Not Available";
}

function getFlag(country) {
  return country.flags?.svg || country.flags?.png || "";
}

function getRegion(country) {
  const region = country.region || "";

  if (
    region === "Asia" ||
    region === "Europe" ||
    region === "Africa" ||
    region === "Americas" ||
    region === "Oceania"
  ) {
    return region;
  }

  // API me "Polar" / "Antarctic Ocean" jaise naam aate hain,
  // unhe ek hi pill (Antarctic) me dikhate hain.
  if (region === "") {
    return "Unknown";
  }

  return "Antarctic";
}

function getPopulation(country) {
  if (country.population === null || country.population === undefined) {
    return "Not Available";
  }

  return Number(country.population).toLocaleString("en-IN");
}

function getArea(country) {
  const area = Number(country.area);

  if (!area || area === 0) {
    return "Not Available";
  }

  return area.toLocaleString("en-IN") + " km²";
}

function getLanguages(country) {
  const names = [];

  if (country.languages) {
    for (let i = 0; i < country.languages.length; i++) {
      names.push(country.languages[i].name);
    }
  }

  if (names.length === 0) {
    return "Not Available";
  }

  return names.join(", ");
}

function getCurrencies(country) {
  const names = [];

  if (country.currencies) {
    for (let i = 0; i < country.currencies.length; i++) {
      const currency = country.currencies[i];
      const symbol = currency.symbol || currency.code;
      names.push(currency.name + " (" + symbol + ")");
    }
  }

  if (names.length === 0) {
    return "Not Available";
  }

  return names.join(", ");
}

function getCallingCode(country) {
  if (!country.callingCodes || country.callingCodes.length === 0) {
    return "Not Available";
  }

  return "+" + country.callingCodes[0];
}

function getDomain(country) {
  if (!country.topLevelDomain || country.topLevelDomain.length === 0) {
    return "Not Available";
  }

  return country.topLevelDomain.join(", ");
}

function getTimezones(country) {
  if (!country.timezones || country.timezones.length === 0) {
    return "Not Available";
  }

  return country.timezones.join(", ");
}

function getLatitude(country) {
  if (!country.latlng || country.latlng.length < 2) {
    return "Not Available";
  }

  const value = country.latlng[0];
  let direction = "N";

  if (value < 0) {
    direction = "S";
  }

  return Math.abs(value).toFixed(2) + "° " + direction;
}

function getLongitude(country) {
  if (!country.latlng || country.latlng.length < 2) {
    return "Not Available";
  }

  const value = country.latlng[1];
  let direction = "E";

  if (value < 0) {
    direction = "W";
  }

  return Math.abs(value).toFixed(2) + "° " + direction;
}

// Naam se pura country object dhoondhna
function findCountry(countryName) {
  for (let i = 0; i < countries.length; i++) {
    if (getCountryName(countries[i]) === countryName) {
      return countries[i];
    }
  }

  return null;
}


// ---------------------------------------------------------
// 4. Stats Cards Update
// ---------------------------------------------------------

function updateStats(shownCount) {
  totalCountriesEl.textContent = countries.length;
  showingCountriesEl.textContent = shownCount;
  favoriteCountEl.textContent = favorites.length;
}


// ---------------------------------------------------------
// 5. Loading Skeleton
// ---------------------------------------------------------

function showSkeleton() {
  countryContainer.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const box = document.createElement("div");
    box.className = "h-72 animate-pulse rounded-2xl bg-gray-200/80";
    countryContainer.append(box);
  }
}


// ---------------------------------------------------------
// 6. Country Cards Banana
// ---------------------------------------------------------

function displayCountries(countryList) {

  // Compare wala box har baar refresh ho
  displayCompare();

  // Favorites mode me heading badal do
  if (favoritesFilter.value === "favorites") {
    listHeading.textContent = "❤️ Your Favorites";
  } else {
    listHeading.textContent = "🌍 Popular Countries";
  }

  countryContainer.innerHTML = "";

  // Koi country na mile to empty state
  if (countryList.length === 0) {
    showEmptyState();
    updateStats(0);
    return;
  }

  for (let i = 0; i < countryList.length; i++) {

    const country = countryList[i];
    const name = getCountryName(country);
    const flag = getFlag(country);

    const isFavorite = favorites.includes(name);
    const isComparing = compareCountries.includes(name);

    // Flag ka HTML
    let flagHTML = "";

    if (flag !== "") {
      flagHTML = `
        <img
          src="${flag}"
          alt="${name} flag"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        >
      `;
    } else {
      flagHTML = `
        <div class="flex h-full w-full items-center justify-center text-3xl">🌐</div>
      `;
    }

    // Favorite button ka style
    let favoriteClass = "bg-gray-900 text-white hover:bg-gray-800";
    let favoriteText = "🤍 Add Favorite";

    if (isFavorite) {
      favoriteClass = "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100";
      favoriteText = "❤️ Remove Favorite";
    }

    // Compare button ka style
    let compareClass = "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-100";
    let compareText = "Compare";

    if (isComparing) {
      compareClass = "bg-violet-600 text-white hover:bg-violet-700";
      compareText = "✓ Comparing";
    }

    const card = document.createElement("div");
    card.className = "group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-green-200 hover:shadow-xl";

    card.innerHTML = `
      <div class="h-36 shrink-0 overflow-hidden bg-gray-100">
        ${flagHTML}
      </div>

      <div class="flex-1 p-4">

        <h3 class="mb-3 line-clamp-2 text-base font-bold leading-snug text-gray-900">
          ${name}
        </h3>

        <div class="space-y-1.5 text-sm">

          <div class="flex items-baseline justify-between gap-3">
            <span class="shrink-0 text-gray-400">Capital</span>
            <span class="truncate text-right font-medium text-gray-700">${getCapital(country)}</span>
          </div>

          <div class="flex items-baseline justify-between gap-3">
            <span class="shrink-0 text-gray-400">Region</span>
            <span class="truncate text-right font-medium text-gray-700">${getRegion(country)}</span>
          </div>

          <div class="flex items-baseline justify-between gap-3">
            <span class="shrink-0 text-gray-400">Population</span>
            <span class="truncate text-right font-medium text-gray-700">${getPopulation(country)}</span>
          </div>

        </div>
      </div>

      <div class="flex flex-col gap-2 p-4 pt-0">

        <button
          type="button"
          class="favorite_btn w-full rounded-lg px-3 py-2 text-sm font-semibold transition active:scale-[0.98] ${favoriteClass}"
        >
          ${favoriteText}
        </button>

        <div class="flex gap-2">

          <button
            type="button"
            class="details_btn flex-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 active:scale-[0.98]"
          >
            View Details
          </button>

          <button
            type="button"
            class="compare_btn flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition active:scale-[0.98] ${compareClass}"
          >
            ${compareText}
          </button>

        </div>
      </div>
    `;

    // Favorite Button
    const favoriteBtn = card.querySelector(".favorite_btn");

    favoriteBtn.addEventListener("click", function () {
      toggleFavorite(name);
    });

    // View Details Button
    const detailsBtn = card.querySelector(".details_btn");

    detailsBtn.addEventListener("click", function () {
      showDetails(country);
    });

    // Compare Button
    const compareBtn = card.querySelector(".compare_btn");

    compareBtn.addEventListener("click", function () {
      addToCompare(name);
    });

    countryContainer.append(card);
  }

  updateStats(countryList.length);
}


// ---------------------------------------------------------
// 7. Empty State
// ---------------------------------------------------------

function showEmptyState() {
  const favoritesOnly = favoritesFilter.value === "favorites";

  let icon = "🧭";
  let title = "No countries found";
  let hint = "Try a different spelling, or clear the region and favorites filters.";
  let buttonText = "Reset filters";

  if (favoritesOnly) {
    icon = "💔";
    title = "No favorites yet";
    hint = "Tap the 🤍 Add Favorite button on any country card to save it here.";
    buttonText = "Show all countries";
  }

  countryContainer.innerHTML = `
    <div class="col-span-full flex flex-col items-center gap-3 py-16 text-center">

      <span class="text-4xl">${icon}</span>
      <p class="text-base font-semibold text-gray-600">${title}</p>
      <p class="max-w-sm text-sm text-gray-400">${hint}</p>

      <button
        type="button"
        id="resetBtn"
        class="mt-1 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-95"
      >
        ${buttonText}
      </button>

    </div>
  `;

  const resetBtn = document.querySelector("#resetBtn");

  resetBtn.addEventListener("click", function () {
    searchInput.value = "";
    sortFilter.value = "default";
    favoritesFilter.value = "all";
    selectedRegion = "all";
    activeNav = "explore";
    paintRegionPills();
    paintNav();
    filterCountries();
  });
}


// ---------------------------------------------------------
// 8. Region Pills aur Nav ka Color
// ---------------------------------------------------------

function paintRegionPills() {
  const buttons = regionPills.querySelectorAll(".region-btn");

  buttons.forEach(function (button) {

    if (button.dataset.region === selectedRegion) {
      button.className = "region-btn px-4 py-2 rounded-full font-medium text-sm flex items-center gap-1.5 transition-all bg-green-600 text-white shadow-sm";
    } else {
      button.className = "region-btn px-4 py-2 rounded-full font-medium text-sm flex items-center gap-1.5 transition-all bg-white text-gray-600 border border-gray-200 hover:border-green-400 hover:text-green-600";
    }

  });
}

// Header ke nav me active tab ka color (Explore / Favorites)
function paintNav() {
  const links = document.querySelectorAll("[data-nav]");

  links.forEach(function (link) {

    const isMobile = link.closest("#mobileMenu") !== null;
    const isActive = link.dataset.nav === activeNav;

    // Mobile menu ke links ka style alag aur simple hai
    if (isMobile) {
      if (isActive) {
        link.className = "text-green-700 font-semibold text-sm";
      } else {
        link.className = "text-gray-500 text-sm";
      }
      return;
    }

    if (isActive) {
      link.className = "flex items-center gap-1.5 text-green-700 font-semibold text-sm border-b-2 border-green-600 pb-0.5";
    } else {
      link.className = "flex items-center gap-1.5 text-gray-500 hover:text-green-600 text-sm font-medium transition";
    }

  });
}


// ---------------------------------------------------------
// 9. Search + Region + Favorites + Sort (sab ek jagah)
// ---------------------------------------------------------

function filterCountries() {

  let list = [...countries];

  // 1. Search - naam, capital aur region teeno me dhoondo
  const text = searchInput.value.toLowerCase().trim();

  if (text !== "") {
    list = list.filter(function (country) {
      const name = (country.name || "").toLowerCase();
      const capital = (country.capital || "").toLowerCase();
      const region = (country.region || "").toLowerCase();

      return name.includes(text) || capital.includes(text) || region.includes(text);
    });
  }

  // 2. Region Filter
  if (selectedRegion !== "all") {
    list = list.filter(function (country) {
      return getRegion(country) === selectedRegion;
    });
  }

  // 3. Favorites Only
  if (favoritesFilter.value === "favorites") {
    list = list.filter(function (country) {
      return favorites.includes(getCountryName(country));
    });
  }

  // 4. Sorting
  const sort = sortFilter.value;

  if (sort === "az") {
    list.sort(function (a, b) {
      return getCountryName(a).localeCompare(getCountryName(b));
    });
  } else if (sort === "za") {
    list.sort(function (a, b) {
      return getCountryName(b).localeCompare(getCountryName(a));
    });
  } else if (sort === "populationHigh") {
    list.sort(function (a, b) {
      return Number(b.population) - Number(a.population);
    });
  } else if (sort === "populationLow") {
    list.sort(function (a, b) {
      return Number(a.population) - Number(b.population);
    });
  }

    // API se jo aayi hai wahi dikhao
    displayCountries(list);
}


// ---------------------------------------------------------
// 10. Favorite Add / Remove
// ---------------------------------------------------------

function toggleFavorite(countryName) {

  if (favorites.includes(countryName)) {
    favorites = favorites.filter(function (name) {
      return name !== countryName;
    });
  } else {
    favorites.push(countryName);
  }

  localStorage.setItem("favoriteCountries", JSON.stringify(favorites));

  // Cards dobara banao
  filterCountries();

  // Detail page khula ho to usko bhi refresh karo
  if (activeCountry !== "") {
    const country = findCountry(activeCountry);

    if (country) {
      countryPageContent.innerHTML = detailsHTML(country);
      attachPageFavoriteButton();
    }
  }
}


// ---------------------------------------------------------
// 11. Country Detail Page
// ---------------------------------------------------------

function detailsHTML(country) {

  const name = getCountryName(country);
  const flag = getFlag(country);

  // Flag ka HTML
  let flagHTML = "";

  if (flag !== "") {
    flagHTML = `<img src="${flag}" alt="${name} flag" class="h-full w-full object-cover">`;
  } else {
    flagHTML = `<div class="flex h-full w-full items-center justify-center text-5xl">🌐</div>`;
  }

  // Basic Information cards
  const infoList = [
    { icon: "🏛️", label: "Capital", value: getCapital(country) },
    { icon: "👥", label: "Population", value: getPopulation(country) },
    { icon: "📐", label: "Area", value: getArea(country) },
    { icon: "🗣️", label: "Languages", value: getLanguages(country) },
    { icon: "💰", label: "Currency", value: getCurrencies(country) },
    { icon: "🔠", label: "Country Code", value: country.alpha3Code || "Not Available" },
  ];

  let infoHTML = "";

  for (let i = 0; i < infoList.length; i++) {
    infoHTML += `
      <div class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">

        <div class="flex items-center gap-2">
          <span class="text-lg">${infoList[i].icon}</span>
          <p class="text-xs font-semibold text-gray-400">${infoList[i].label}</p>
        </div>

        <p class="mt-2 break-words text-base font-bold text-gray-900">
          ${infoList[i].value}
        </p>

      </div>
    `;
  }

  // General Details rows
  const generalList = [
    { label: "Native Name", value: country.nativeName || "Not Available" },
    { label: "Demonym", value: country.demonym || "Not Available" },
    { label: "Calling Code", value: getCallingCode(country) },
    { label: "Top Level Domain", value: getDomain(country) },
  ];

  let generalHTML = "";

  for (let i = 0; i < generalList.length; i++) {
    generalHTML += `
      <div class="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">

        <span class="shrink-0 text-sm text-gray-400">${generalList[i].label}</span>

        <span class="text-right text-sm font-semibold text-gray-800">
          ${generalList[i].value}
        </span>

      </div>
    `;
  }

  // Geography rows
  const geographyList = [
    { label: "Subregion", value: country.subregion || "Not Available" },
    { label: "Latitude", value: getLatitude(country) },
    { label: "Longitude", value: getLongitude(country) },
    { label: "Timezones", value: getTimezones(country) },
  ];

  let geographyHTML = "";

  for (let i = 0; i < geographyList.length; i++) {
    geographyHTML += `
      <div class="flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">

        <span class="shrink-0 text-sm text-gray-400">${geographyList[i].label}</span>

        <span class="text-right text-sm font-semibold text-gray-800">
          ${geographyList[i].value}
        </span>

      </div>
    `;
  }

  // Page ka favorite button
  let favoriteClass = "bg-gray-900 text-white hover:bg-gray-800";
  let favoriteText = "🤍 Add to Favorites";

  if (favorites.includes(name)) {
    favoriteClass = "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-100";
    favoriteText = "❤️ Remove from Favorites";
  }

  return `
    <!-- Banner -->
    <div class="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">

      <div class="flex flex-col gap-5 sm:flex-row sm:items-center">

        <div class="h-28 w-44 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-100">
          ${flagHTML}
        </div>

        <div class="min-w-0">

          <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-green-600">
            Country Profile
          </p>

          <h1 class="mt-1 text-2xl font-extrabold leading-tight text-gray-900 sm:text-3xl">
            ${name}
          </h1>

          <p class="mt-1 text-sm text-gray-400">
            ${country.nativeName || "Not Available"}
          </p>

          <div class="mt-3 flex flex-wrap items-center gap-2">

            <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              ${getRegion(country)}
            </span>

            <span class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              ${country.subregion || "Not Available"}
            </span>

          </div>

          <button
            type="button"
            class="page_favorite_btn mt-4 rounded-full px-5 py-2 text-sm font-semibold transition active:scale-95 ${favoriteClass}"
          >
            ${favoriteText}
          </button>

        </div>
      </div>
    </div>

    <!-- Basic Information -->
    <div class="mt-8">

      <p class="text-[11px] font-bold uppercase tracking-[0.2em] text-green-600">
        Country Overview
      </p>

      <h2 class="mb-4 mt-1 text-xl font-extrabold text-gray-900">
        Basic Information
      </h2>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        ${infoHTML}
      </div>
    </div>

    <!-- General Details + Geography -->
    <div class="mt-6 grid gap-5 lg:grid-cols-2">

      <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 class="mb-2 flex items-center gap-2 text-base font-bold text-gray-800">
          ℹ️ General Details
        </h3>
        <div>${generalHTML}</div>
      </div>

      <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <h3 class="mb-2 flex items-center gap-2 text-base font-bold text-gray-800">
          🌐 Geography
        </h3>
        <div>${geographyHTML}</div>
      </div>

    </div>
  `;
}

// Detail page ke favorite button par click
function attachPageFavoriteButton() {
  const button = countryPageContent.querySelector(".page_favorite_btn");

  if (!button) return;

  button.addEventListener("click", function () {
    toggleFavorite(activeCountry);
  });
}

function showDetails(country) {
  activeCountry = getCountryName(country);

  countryPageContent.innerHTML = detailsHTML(country);
  attachPageFavoriteButton();

  // Scroll position yaad rakho
  oldScroll = window.scrollY;

  // Explore wala hissa chhupao, detail page dikhao
  exploreSection.classList.add("hidden");
  mainContent.classList.add("hidden");
  footer.classList.add("hidden");
  countryPage.classList.remove("hidden");

  document.title = activeCountry + " — World Explorer";

  window.scrollTo(0, 0);
}

function hideDetails() {
  if (countryPage.classList.contains("hidden")) return;

  activeCountry = "";

  countryPage.classList.add("hidden");
  exploreSection.classList.remove("hidden");
  mainContent.classList.remove("hidden");
  footer.classList.remove("hidden");

  document.title = "World Explorer — Discover Every Country";

  window.scrollTo(0, oldScroll);
}


// ---------------------------------------------------------
// 12. Compare Countries
// ---------------------------------------------------------

function addToCompare(countryName) {

  // Pehle se select hai to hata do
  if (compareCountries.includes(countryName)) {
    compareCountries = compareCountries.filter(function (name) {
      return name !== countryName;
    });

    compareMessage = "";
  } else if (compareCountries.length >= 2) {
    // Do se zyada compare nahi kar sakte
    compareMessage = "You can compare only 2 countries. Remove one first.";
  } else {
    compareCountries.push(countryName);
    compareMessage = "";
  }

  filterCountries();
}

function displayCompare() {

  // Kuch select nahi hai to placeholder
  if (compareCountries.length === 0) {
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

  // Selected countries ke chips
  let chipsHTML = "";

  for (let i = 0; i < compareCountries.length; i++) {
    chipsHTML += `
      <button
        type="button"
        data-name="${compareCountries[i]}"
        class="remove_chip inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-red-50 hover:text-red-600"
      >
        ${compareCountries[i]}
        <span>✕</span>
      </button>
    `;
  }

  let bodyHTML = "";

  if (compareCountries.length < 2) {

    bodyHTML = `
      <p class="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        Select one more country to compare.
      </p>
    `;

  } else {

    const first = findCountry(compareCountries[0]);
    const second = findCountry(compareCountries[1]);

    // Zyada population wali country green highlight hogi
    let firstWin = false;
    let secondWin = false;

    if (Number(first.population) > Number(second.population)) {
      firstWin = true;
    }

    if (Number(second.population) > Number(first.population)) {
      secondWin = true;
    }

    let firstPopulationClass = "text-gray-700";
    let secondPopulationClass = "text-gray-700";

    if (firstWin) {
      firstPopulationClass = "bg-green-50 font-bold text-green-700";
    }

    if (secondWin) {
      secondPopulationClass = "bg-green-50 font-bold text-green-700";
    }

    bodyHTML = `
      <div class="overflow-x-auto">

        <table class="w-full border-collapse text-center text-sm">

          <thead>
            <tr class="bg-gray-50">
              <th class="w-1/4 border border-gray-200 px-3 py-2.5 text-left font-semibold text-gray-500">Details</th>
              <th class="border border-gray-200 px-3 py-2.5 font-bold text-gray-800">${getCountryName(first)}</th>
              <th class="border border-gray-200 px-3 py-2.5 font-bold text-gray-800">${getCountryName(second)}</th>
            </tr>
          </thead>

          <tbody>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Flag</td>
              <td class="border border-gray-200 px-3 py-2.5">
                <img src="${getFlag(first)}" alt="" class="mx-auto h-12 w-20 rounded object-cover">
              </td>
              <td class="border border-gray-200 px-3 py-2.5">
                <img src="${getFlag(second)}" alt="" class="mx-auto h-12 w-20 rounded object-cover">
              </td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Capital</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${getCapital(first)}</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${getCapital(second)}</td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Region</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${getRegion(first)}</td>
              <td class="border border-gray-200 px-3 py-2.5 text-gray-700">${getRegion(second)}</td>
            </tr>

            <tr>
              <td class="border border-gray-200 px-3 py-2.5 text-left font-medium text-gray-500">Population</td>
              <td class="border border-gray-200 px-3 py-2.5 ${firstPopulationClass}">${getPopulation(first)}</td>
              <td class="border border-gray-200 px-3 py-2.5 ${secondPopulationClass}">${getPopulation(second)}</td>
            </tr>

          </tbody>
        </table>

      </div>
    `;
  }

  comparisonContainer.innerHTML = `
    <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">

      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">

        <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800">
          ⚖️ Country Comparison
        </h2>

        <button
          type="button"
          id="clearCompare"
          class="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
        >
          Clear all
        </button>

      </div>

      <div class="mb-4 flex flex-wrap gap-2">${chipsHTML}</div>

      ${compareMessage ? `<p class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">${compareMessage}</p>` : ""}

      ${bodyHTML}
    </div>
  `;

  // Chip hatane wale buttons
  const removeButtons = comparisonContainer.querySelectorAll(".remove_chip");

  removeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      addToCompare(button.dataset.name);
    });
  });

  // Clear all button
  const clearCompareBtn = comparisonContainer.querySelector("#clearCompare");

  if (clearCompareBtn) {
    clearCompareBtn.addEventListener("click", function () {
      compareCountries = [];
      compareMessage = "";
      filterCountries();
    });
  }
}


// ---------------------------------------------------------
// 13. API Error Dikhana
// ---------------------------------------------------------

function showError() {
  countryContainer.innerHTML = `
    <div class="col-span-full flex flex-col items-center gap-3 py-16 text-center">

      <span class="text-4xl">⚠️</span>

      <p class="text-base font-semibold text-gray-600">
        Unable to load countries
      </p>

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

  const retryBtn = document.querySelector("#retryBtn");

  retryBtn.addEventListener("click", function () {
    loadCountries();
  });
}


// ---------------------------------------------------------
// 14. API se Countries ka Data Lana
// ---------------------------------------------------------

async function loadCountries() {
  showSkeleton();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error("API request failed: " + response.status);
    }

    const data = await response.json();

    countries = data;

    if (!Array.isArray(countries)) {
      throw new Error("Countries data array nahi mila.");
    }

    // Shuru me A-Z order
    countries.sort(function (a, b) {
      return getCountryName(a).localeCompare(getCountryName(b));
    });

    filterCountries();

  } catch (error) {
    console.error("Error:", error);
    showError();
  }
}


// ---------------------------------------------------------
// 15. Events (Search, Filter, Sort, Nav)
// ---------------------------------------------------------

// Search button
searchBtn.addEventListener("click", function () {
  filterCountries();
});

// Search box me Enter
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    filterCountries();
  }
});

// Region pills
const regionButtons = regionPills.querySelectorAll(".region-btn");

regionButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    selectedRegion = button.dataset.region;
    paintRegionPills();
    filterCountries();
  });
});

// Sort dropdown
sortFilter.addEventListener("change", function () {
  filterCountries();
});

// Favorites dropdown
favoritesFilter.addEventListener("change", function () {

  // Dropdown badla to nav ka highlight bhi saath badle
  if (favoritesFilter.value === "favorites") {
    activeNav = "favorites";
  } else {
    activeNav = "explore";
  }

  paintNav();
  filterCountries();
});

// Explore tab - saari countries dikhao aur favorites filter hata do
function showExploreList() {
  activeNav = "explore";
  favoritesFilter.value = "all";
  paintNav();
  filterCountries();
}

// Favorites tab - sirf favorites dikhao
function showFavoritesList() {
  activeNav = "favorites";
  favoritesFilter.value = "favorites";
  paintNav();
  filterCountries();
}

// Mobile menu ko band karo
function closeMobileMenu() {
  mobileMenu.classList.add("hidden");
  mobileMenu.classList.remove("flex");
  mobileMenuBtn.setAttribute("aria-expanded", "false");
}

// Nav ke "Explore" link
const exploreLinks = document.querySelectorAll("[data-show-explore]");

exploreLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    showExploreList();
    closeMobileMenu();
  });
});

// Nav ke "Favorites" link
const favoriteLinks = document.querySelectorAll("[data-show-favorites]");

favoriteLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    showFavoritesList();
    closeMobileMenu();
  });
});

// Mobile menu ke baaki links (Compare / About) bhi menu band karein
mobileMenu.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    closeMobileMenu();
  });
});

// Detail page khula ho to header / footer ke link se wapas explore
const navLinks = document.querySelectorAll("header a, footer a");

navLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    hideDetails();
  });
});

// Back to Explore button
backToExploreBtn.addEventListener("click", function () {
  hideDetails();
});

// Mobile menu
mobileMenuBtn.addEventListener("click", function () {
  mobileMenu.classList.toggle("hidden");
  mobileMenu.classList.toggle("flex");

  if (mobileMenu.classList.contains("hidden")) {
    mobileMenuBtn.setAttribute("aria-expanded", "false");
  } else {
    mobileMenuBtn.setAttribute("aria-expanded", "true");
  }
});

// Footer ka year
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}


// ---------------------------------------------------------
// 16. Project Start
// ---------------------------------------------------------

paintRegionPills();
paintNav();
loadCountries();

# 🌍 World Explorer

A lightweight, single-page web app to explore every country on the planet — search, filter, sort, compare and save your favorites.

Live data comes from the free [countries.dev](https://countries.dev) API (250 countries), and the whole UI is built with **Tailwind CSS only** — there is no custom stylesheet and no build step.

---

## ✨ Features

| Feature | Description |
| --- | --- |
| 🔍 Real-time search | Type a country, capital or region. Debounced by 250 ms, plus Enter for instant search. |
| 🌐 Region filter | All Regions, Asia, Europe, Africa, Americas, Oceania and Antarctic pills. |
| ↕️ Sorting | Name A → Z, Z → A, and population high → low / low → high. |
| ⚖️ Comparison | Pick any two countries and see flags, capitals, regions and population side by side. The larger population is highlighted. |
| ❤️ Favorites | Save countries with one click. Favorites persist in `localStorage` and the **Favorites** nav link jumps straight to your list. |
| 📄 Country detail page | “View Details” opens a full page with the flag, native name, basic information, general details, geography, map links and bordering countries. |
| 📄 Pagination | 50 countries render at a time with a "Show more" button, so the page stays fast. |
| 🦴 Loading & error states | Shimmer skeleton cards while loading, and a retry button if the API fails. |

## ♿ Accessibility

- Escape closes the detail page, and focus rings stay visible on every link and button.
- Live region (`aria-live="polite"`) announces the visible country count.
- Every action button has a visible `focus-visible` ring.

## 🛠️ Tech Stack

- **HTML5** — semantic markup
- **Tailwind CSS** (Play CDN) — all styling, including the config for the Inter font
- **Vanilla JavaScript** (ES6+) — no framework, no dependencies
- **Google Fonts** — Inter
- **localStorage** — favorites persistence

## 📁 Project Structure

```
WORLD-EXPLORER/
├── index.html   # Structure, layout and Tailwind CDN setup
├── script.js    # API, state, rendering and all interactions
└── README.md
```

`script.js` is organised into numbered sections so each part is easy to find:

1. API URL and configuration
2. DOM element references
3. State (`allCountries`, `favoriteCountries`, `selectedCountries`, filters)
4. Helpers — `formatPopulation`, `normalizeRegion`, `escapeHtml`, `infoRow`
5. Rendering — `cardHTML`, `renderCards`, `updateStatistics`, `skeletonHTML`, `loadMoreHTML`
6. Filtering — `sortCountries`, `applyFilters`
7. Interactions — favorites, detail page, comparison
8. Data loading — `fetchCountries`

## 🚀 Run Locally

No installation needed.

```bash
# Option 1: open the file directly
open index.html

# Option 2 (recommended): serve it so fetch() works everywhere
python3 -m http.server 5500
# then visit http://localhost:5500
```

## 🔌 API

```
GET https://countries.dev/countries?fields=name,nativeName,capital,region,subregion,population,area,populationDensity,demonym,languages,currencies,flags,latlng,timezones,borders,alpha2Code,alpha3Code,callingCodes,topLevelDomain,independent,regionalBlocs,maps,altSpellings
```

Returns an array of 250 countries:

```json
{
  "name": "India",
  "capital": "New Delhi",
  "region": "Asia",
  "population": 1417173173,
  "flags": { "png": "...", "svg": "..." }
}
```

The app normalises the data into this shape:

```js
{
  name, nativeName, capital, region, subregion, demonym,
  flag, flagLarge, population /* formatted */, rawPopulation,
  areaText, densityText, languages, currencies, latlng,
  timezones, borders, alpha3, callingCode, tld,
  independent, blocs, altSpellings, maps
}
```

`flag` (PNG) is used in the cards for speed, `flagLarge` (SVG) on the detail page for sharpness, and `rawPopulation` is kept for correct numeric sorting.

## 📝 Notes

- Region names are normalised so countries reported under "Polar", "Antarctic" or "Antarctic Ocean" all fall under **Antarctic**.
- Every value coming from the API is passed through `escapeHtml()` before it reaches `innerHTML`.
- The whole detail page is rendered into one container (`#countryPageContent`), so there is no duplicated markup.

---

Built with care, one day at a time. 🌱

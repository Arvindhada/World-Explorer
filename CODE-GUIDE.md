# 📘 WORLD EXPLORER — CODE STUDY GUIDE

> Presentation ki taiyari ke liye. Har topic me **HTML + JavaScript dono saath** padhenge,
> kyunki feature HTML se shuru hota hai aur JS se chalta hai.

Files: `index.html` (268 lines) + `script.js` (1219 lines, 39 numbered sections)

---

## 1. Padhne ka tareeka (har topic me 6 step)

| Step | Kya hoga |
| --- | --- |
| **1. Behaviour** | Pehle screen par kya hota hai — click, type, scroll. Bina code dekhe. |
| **2. HTML ka hissa** | Kaunsa tag, kaunsa `id`, kaunsi `class`, kaunsa `data-*` attribute, aur **kyun**. |
| **3. JS ka hissa** | Selector → variable → function → event listener. Line-by-line. |
| **4. Data flow** | Ek line ka flow: user action → JS → state badla → HTML dobara bana. |
| **5. "Change karna ho to"** | Kis file ki kis line me kya badalna hai. |
| **6. Viva Q&A** | 3 sawaal + jawab (jo presentation me puchhe ja sakte hain). |

---

## 2. Syllabus (18 modules)

| # | Module | HTML (index.html) | JS (script.js) | Commit |
| --- | --- | --- | --- | --- |
| 1 | Project setup, Tailwind CDN, script tag | 1–30, 240 | §1, §7, §39 | Day 01–02 |
| 2 | Header + mobile menu toggle | 33–87 | §2 | Day 03 |
| 3 | Hero + search box (UI) | 90–118 | §3, §4 | Day 04 |
| 4 | API se data lana (data pipeline) | — | §8, §37 | Day 06 |
| 5 | Loading skeleton + error retry | — | §34, §36 | Day 07 |
| 6 | Country card banana (HTML template) | 206–209 | §11, §17 | Day 08 |
| 7 | Cards render karna + button delegation | — | §18, §33 | Day 08 |
| 8 | Dashboard statistics bar (3 stat cards) | 175–204 | §5, §19 | Day 05 |
| 9 | Search logic + debounce | — | §32, §4, §22 | Day 09 |
| 10 | Sorting (A–Z, population) | 160–166 | §21 | Day 11 |
| 11 | Region pills filter | 120–145 | §24, §22 | Day 11 |
| 12 | **"Show more 50" pagination** | 206–209 | §10, §35, §33, §39 | Day 17 |
| 13 | Favorites (localStorage) | 52, 82, 168–172, 256 | §12, §23, §38 | Day 14 |
| 14 | Empty state + reset filters | — | §20, §33 | Day 10, 14 |
| 15 | Compare do countries | 212 | §29, §30, §31 | Day 12 |
| 16 | Full country detail page | 216–233 | §25, §26, §27, §28 | Day 13 |
| 17 | Helpers: escapeHtml, formatPopulation, region normalize | — | §13, §14, §15, §16 | Day 05–08 |
| 18 | Presentation Q&A (poore project ke sawaal) | — | — | — |

**Padhne ka order:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18

> Module 4 pehle kyun? Kyunki data na ho to card/filter/compare kuch bhi samajh nahi aayega.
> Module 12 (Show more) 4, 6, 7, 11 ke baad hi samajh aayega — wahi pehla sawaal hai.

---

## 3. Glossary (ye shabd presentation me aayenge)

| Term | Matlab |
| --- | --- |
| **DOM** | Browser ne HTML ko jo tree bana diya, JS usi ko badalta hai. |
| **Selector** | `document.querySelector("#searchInput")` — HTML ka element dhoondhna. |
| **State** | Wo variables jisme app ki current sthiti hoti hai (`allCountries`, `favoriteCountries`, `visibleCount`). |
| **Render** | State se dobara HTML banana (`innerHTML = ...`). |
| **Event listener** | "Jab ye ho to ye karo" — `click`, `input`, `change`, `keydown`. |
| **Event delegation** | 50 buttons pe alag listener nahi, parent par ek listener + `event.target.closest(...)`. |
| **Debounce** | Type karte waqt har key pe kaam na karo — 250ms ruk kar ek baar karo. |
| **Template literal** | Backtick `` ` `` wali string jisme `${}` se value daal sakte hain. |
| **Hoisting** | `function` declaration file me neeche likhi ho to bhi upar se call ho jati hai. |
| **localStorage** | Browser ki chhoti memory (text only) — favorites yahan save hote hain. |
| **ARIA** | Screen reader ke liye label (`aria-label`, `aria-expanded`, `aria-live`). |

---

## 4. "Yahan change karna hai" — quick map

| Agar ye badalna ho | To yahan jao |
| --- | --- |
| Ek baar me kitni countries dikhein (50 → 25) | `script.js` §10 → `PAGE_SIZE` |
| Search ki speed (250ms) | `script.js` §32 → `setTimeout(..., 250)` |
| Search kis field pe chale | `script.js` §22 → `haystack` line |
| Naya region pill | `index.html` 120–145 (button) + data same rahe to JS me kuch nahi |
| Naya sort option | `index.html` 164–170 (option) + `script.js` §21 (if branch) |
| Card me naya field (currency) | `script.js` §37 (map) + §17 (template) + §16 (infoRow) |
| Detail page me naya field | `script.js` §26 (`generalRows` ya `geographyRows`) |
| Compare me naya row | `script.js` §30 (table ke `<tr>`) |
| Favorites ka limit | `script.js` §23 (`toggleFavorite`) |
| Card ka design/colour | `script.js` §17 (`cardHTML`) — Tailwind class |
| Buttons ka common style | `script.js` §11 (`BTN_BASE`) |

---

## 5. Viva ke 12 sawaal (jinke jawab tayyar rahenge)

1. Data API se aata hai ya file se? — API, `fetch()` se, `async/await`.
2. 250 cards ek saath kyun nahi dikhate? — Slow, isliye `PAGE_SIZE = 50`.
3. "Show more" par purane cards gayab kyun nahi hote? — `visibleCount` badhta hai, `slice(0, visibleCount)`.
4. Favorites reload ke baad kaise bache rehte hain? — `localStorage` + `loadFavorites()`.
5. Ek hi listener 50 buttons kaise handle karta hai? — Event delegation (`closest`).
6. Search me debounce kyun? — Har key pe 250 filter na chale.
7. `rawPopulation` alag kyun? — `population` formatted string hai ("1.4 B"), sorting ke liye number chahiye.
8. `escapeHtml()` kyun? — API se aaya text `innerHTML` me ja raha hai → XSS se bachne ke liye.
9. Compare me 2 se zyada kyun nahi? — Design limit, `compareMessage` se error dikhta hai.
10. Detail page alag HTML file hai? — Nahi, wahi page hai; explore section `hidden` ho jata hai aur `#countryPage` dikh jata hai.
11. Detail page se wapas kaise aate hain? — Back button, Escape key, ya header/footer ka koi bhi link.
12. `filteredCountries` aur `allCountries` me farak? — `allCountries` = API ka pura data, `filteredCountries` = filter+sort ke baad.

---

## 6. Progress tracker

| Module | Topic | Status |
| --- | --- | --- |
| 1 | Setup + HTML↔JS connection | ⬜ |
| 2 | Mobile menu | ⬜ |
| 3 | Search UI | ⬜ |
| 4 | API data | ⬜ |
| 5 | Skeleton + error | ⬜ |
| 6 | Card template | ⬜ |
| 7 | Render + delegation | ⬜ |
| 8 | Stats bar | ⬜ |
| 9 | Search + debounce | ⬜ |
| 10 | Sorting | ⬜ |
| 11 | Region pills | ⬜ |
| 12 | Show more 50 | ⬜ |
| 13 | Favorites | ⬜ |
| 14 | Empty state | ⬜ |
| 15 | Compare | ⬜ |
| 16 | Detail page | ⬜ |
| 17 | Helpers | ⬜ |
| 18 | Q&A | ⬜ |

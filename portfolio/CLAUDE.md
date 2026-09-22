# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A static personal portfolio site (plain HTML/CSS/JS, no build tooling, no package.json). It is served directly by GitHub Pages. `index.html` is a single-page app: one document containing every "view" as a hidden `<section class="view">`, shown/hidden via JS rather than routing.

Note: this `portfolio/` directory is a subfolder of the larger `taekyung00.github.io` GitHub Pages repo, which also contains unrelated coursework directories (`hw1`–`hw8`, `DT`, `p5js`, `final_project_port`) as siblings one level up. Keep changes scoped to `portfolio/` unless explicitly asked to touch the rest of the repo.

## Running locally

No build step. Serve the directory with any static file server, e.g.:

```
python -m http.server 8000
```

then open `http://localhost:8000`. There is no lint, test, or build command — verify changes by loading the page in a browser.

## Architecture

### View switching (`js/index.js`)
- All views live in `index.html` as sibling `<section id="...">` elements with class `view`; the active one gets class `active` and `<body data-view="...">` is kept in sync.
- Navigation is via a radial "node" menu on the home view. The ring layout is **derived, not hardcoded**: a top-level block in `js/index.js` writes `--n` (node count) onto `.node-nav` and `--i` (DOM index) onto each `.node-btn`, and CSS computes `--angle: calc(360deg / var(--n) * var(--i) - 90deg)`. DOM order is clockwise placement order, starting at 12 o'clock. All nodes share one orbit radius (`--node-radius`), so the ring is a true circle.
- `#home` is **never deactivated**. It stays `.active` at `z-index: 50` as a transparent navigation layer above the detail views, with `pointer-events: none` and `auto` re-enabled only on `.center-plate`, `.node-btn` and `.lang-toggle-container`. Detail views render their card underneath it.

### The hub — three states
`.center-plate` (the "Jean" name plate) plus `<nav class="node-nav">` are wrapped in one `.hub` element. The **same DOM** serves as both the home ring and the corner menu; only a transform differs, which is what makes the states morph into each other for free. State lives in `body[data-hub]`:

| state | screen |
|---|---|
| `home` | plate centred, full-size node ring |
| `parked` | a page card is open; only the plate remains, shrunk to the corner **opposite** the opened node. Other nodes get `--dist: 0` so they collapse *into* the plate |
| `menu` | the ring re-emerges around the parked plate. The open page's node keeps its slot but gets `.is-current` (dimmed, non-clickable) so the others never re-space |

Transitions: node click → `parked`; plate click → `menu`; plate click again → `home`; clicking anything that is **not** the plate or a node → closes the menu; clicking another node in the menu → goes straight to that page without passing through home.

`setHub()`/`hubPark()` in `js/index.js` compute the parked corner, reusing `nodeAngle()` and `axisSign()`. The hub scale is `--hub-scale-parked`; `hubPark()` clamps it further if the ring would not fit the short axis.

### Transition animation
Opening a node animates the page card **from the node's position and size** to its resting place (`flipCardIn()`), so it reads as the node becoming the page rather than a panel sliding in. Every duration is a `--dur-*` token in `tokens.css` read via `cssMs()` — never hardcode a timing.

Two traps worth remembering:
- `--node-radius` is registered with `@property` **because** `getComputedStyle` otherwise returns the literal string `min(345px, 39vmin)` and `parseFloat` gives `NaN`.
- Release the `isAnimating` lock from a plain `setTimeout`, not inside `requestAnimationFrame`. The old code did the latter, which could leave the UI permanently locked after the first transition.

### Styling — three files, one source of truth
- **`css/tokens.css`** holds every color, font, shadow and transition duration as a `:root` custom property. Nothing else in the codebase contains a color literal, so a palette change is a single-file edit. Both the home page and the project pages load it **first**, before their own stylesheet.
- **`css/style.css`** is home-screen layout only. Its `:root` keeps just `--node-radius`; every home dimension (node diameter, node font, the centre name plate, title/subtitle, gaps) is a `calc()` ratio of it, so the whole home screen scales from one line. It is px-based so browser zoom actually resizes it, capped at `39vmin` so the node ring can never overflow the viewport height.
- **`css/portfolio-page.css`** is shared by all `portfolio/*.html` detail pages. These used to carry ~150 lines of identical inline `<style>` each; don't reintroduce per-page styles.
- Animation durations live in `tokens.css` as `--dur-*`. `js/index.js` reads them with `cssMs()` for its `setTimeout`s and passes `var(--dur-…)` straight into inline `transition` strings, so timing is never hardcoded in two places.
- `index.html` cache-busts with `?v=N` on both CSS and JS — bump it when shipping changes, since GitHub Pages caches aggressively.
- `external/normalize.css` is a vendored reset; don't hand-edit it.

### Text content and i18n
- English is authored **in `index.html`** as the element's own content. On load, `js/index.js` reads every `[data-i18n]` element's `innerHTML` into the `en` table — so English exists in exactly one place and can't drift.
- Korean lives in the `ko` object in `js/index.js`. Adding a string means: put it in the HTML with a `data-i18n` key, then add the Korean. A missing key logs an `[i18n]` console warning.

### Tabs inside a card
The Skills card shows one description at a time behind a pill-shaped segmented control. This is a **markup convention, not per-card code**: wrap in `[data-tabs]`, give each `<button role="tab">` an `aria-controls` pointing at a `role="tabpanel"` id, mark the initial pair with `aria-selected="true"` / `.is-active`. `js/index.js` wires every `[data-tabs]` on load (click + Left/Right arrows). Panels are stacked in one grid cell (`.tabs__panel { grid-area: 1/1 }`) so the container is as tall as the tallest panel and the card height never jumps on tab or language switch — keep that if you restyle it. The Game Projects card reuses the same controller with a different skin (`.project-switch`: two pills joined by a line, one lit).

### Table of contents inside a scrolling panel
Game Projects has a left-hand TOC per project. It is **generated**, not authored: `buildToc()` fills `[data-toc]` from every `.project__section[id] > h4` inside the sibling `[data-toc-scroller]`, wires click-to-scroll (`scrollTo` within the scroller, `preventDefault` so the hash never moves the page) and a scroll-spy that marks the current section (bottom of the scroller = last section). It runs at the end of `updateLanguage()` because the labels are copied from the headings. Adding a section is one `<section class="project__section" id="…"><h4>…</h4>…</section>`; the TOC follows.

### Detail card sizing
`layoutCard()` in `js/index.js` sizes each card from a **bumper box**: the viewport minus the per-direction bumpers (`--bumper-t/r/b/l`) minus the strip occupied by the parked Jean plate. Within that box:
- default — the card fills the box **width**; height follows content and only scrolls past the box height
- `data-card-ratio="16/9"` on a `<section>` — the card becomes the largest box of that ratio that fits, height included
- `data-card-fill` on a `<section>` — the card takes the full box height regardless of content. Use it when scrolling should happen *inside* the card (Game Projects: `.project__scroll` scrolls, the card itself doesn't). The vertical flex chain `.card-scroll--fill > .tabs__panels--fill > .tabs__panel > .project` needs `min-height: 0` on every link or the inner scroller never shrinks. Also keep a tall card **off the 12/6 o'clock ring slots**: the plate parks on the opposite edge and steals ~150px of card height there, whereas a corner slot leaves the full box height (this is why Game Projects sits before Graphics in the ring)

Bumpers are read **from the view element**, not the root, so a single `<section>` can override `--bumper-*` for itself. Scrolling lives on the inner `.card-scroll`, inset by `--card-inset`, because a scrollbar on the rounded card escapes its corners — the inset must stay above `r - r/√2`.

Cards grow wide, so prose containers (`.about-me__body`, `.resume-section`, `.section__subtitle`) are capped at `--text-measure`; grids (`.portfolio-grid`, `.services`) are deliberately left full-width.

### Graphics demo pages (`portfolio/*.html`)
- `01_hello`, `02_meshes`, `05_shadow`, `06_value`, `07_gradient` are the project detail pages, linked from the "Graphics" view's `.portfolio-grid`. They share `css/portfolio-page.css`. The Graphics card opens them in a **new tab** (`target="_blank"`), and they deliberately carry **no** link back to the portfolio — closing the tab is the way back. A same-tab round trip would reload the SPA at the hub home rather than at the Graphics card, which is what the old `← Taekyung Ho` button did; don't reintroduce it. (`03_fog` and `04_toon` were deleted — they were unfilled template copies with broken styling and placeholder contact details.)
- The grid is ordered by **build date**, not file number (Gradient Noise 2026-06-09 comes before Value Noise 2026-06-15). Each item carries a caption: the title (same string as the detail page's `<h1>`, English only) and a `<time>` whose visible text is the only i18n'd part (`proj-date-*` keys). Thumbnails are 480×480; `.portfolio__img` is a square box with `object-fit: contain`, so a thumbnail of any ratio is letterboxed rather than cropped. Column count comes from `auto-fill` on the card width — don't reintroduce viewport media queries, the card is narrower than the viewport.
- Each embeds a live demo via `<iframe>` pointing at a local sibling file (`quad_demo.html`, `meshes_demo.html`, `shadow_demo.html`, `value_demo.html`, `gradient_demo.html`).
- **Known incomplete state**: those `*_demo.html` targets are empty (0-byte) placeholders, so no iframe currently renders anything. Tracked in `TODO.txt` ("그래픽 데모 수정하기").

## Other notes
- `TODO.txt` and `README.md` (a Korean "AI agent guide") track outstanding work items and a duplicate description of the directory/node layout; `README.md` also documents the node-position table this file summarizes above.
- `docs/` holds the downloadable résumé/cover letter/transcript assets linked from the Resume view, plus `docs/1098/` (the 10..9..8.. GDD and technical spec linked from Game Projects) — treat these as user-supplied content, not something to regenerate. The GDD filename contains `..` inside a segment; that is not a dot-segment and serves fine.

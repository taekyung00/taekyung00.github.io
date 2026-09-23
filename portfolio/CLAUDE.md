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

then open `http://localhost:8000`. There is no lint, test, or build command — verify changes by loading the page in a browser. `file://` works too for most of it (history is written against `location.pathname`, so `pushState` does not throw), but the graphics demos need a real origin.

The closest thing to a test suite is the **browser console**: `updateLanguage()` warns `[i18n] '<lang>' 번역 누락: <key>` for every `data-i18n` key missing from the `ko` table, and `nodeRadiusPx()` warns `[hub] --node-radius 를 읽지 못했습니다` if `@property` registration breaks. After a change, toggle EN↔KO on every card and watch for those. Also worth exercising by hand, since each has broken before: open a card from a deep link (`#games/dt`) on a cold load, browser back/forward through several cards, and resize the window with a card open.

## Architecture

### View switching (`js/index.js`)
- All views live in `index.html` as sibling `<section id="...">` elements with class `view`; the active one gets class `active` and `<body data-view="...">` is kept in sync.
- Navigation is via a radial "node" menu on the home view. The ring layout is **derived, not hardcoded**: a top-level block in `js/index.js` writes `--n` (node count) onto `.node-nav` and `--i` (DOM index) onto each `.node-btn`, and CSS computes `--angle: calc(360deg / var(--n) * var(--i) - 90deg)`. DOM order is clockwise placement order, starting at 12 o'clock. All nodes share one orbit radius (`--node-radius`), so the ring is a true circle.
- Current DOM/ring order is `about` (12 o'clock), `skills`, `games`, `projects` (6 o'clock), `sns`, `resume`. Reordering the buttons re-places the ring, the parked corner and the transition direction all at once — but see the 12/6 o'clock caveat under *Detail card sizing* before moving a tall card there.
- Adding or removing a node is three edits: the `<button class="node-btn" data-target="X">` inside `<nav class="node-nav">`, a matching `<section id="X" class="view">`, and the Korean strings in `ko`. `VIEW_IDS` (and therefore which hashes are valid) is built from the buttons, so nothing else needs touching.
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

### History and deep links
The open card **is** the URL hash: `#about`, `#games`, and `#games/dt` when a `[data-tabs]` inside the card has a non-default tab selected (tab button id minus `tab-`). Home is no hash. Rules in `js/index.js`:
- Opening a card (`openNode`) and going home (`goHome`) `pushState`; opening/closing the Jean menu does not (transient UI). Switching a tab only `replaceState`s the current entry.
- `popstate` → `readHash()` → `navigateTo(view, tab, { push: false })`. Browser buttons, ⌘[ / Alt+←, mouse side buttons and trackpad swipes all arrive as `popstate`, so nothing else is needed for them.
- If a `popstate` lands while a transition is running, the request is parked in `pendingNav` and applied by `release()` when the lock clears — never dropped, or the URL and the view would diverge.
- On load, a hash restores the card **instantly**: `withoutMotion()` adds `body.no-motion` (all transitions off) for one reflow so the plate doesn't fly from the centre. An unknown hash resolves to home and the URL is normalised.
- Home's URL is `location.pathname + location.search` (same document, hash removed), which is why `pushState` also works on `file://`.
- Every outbound link (demos, PDFs, LinkedIn/GitHub, press kit) opens in the **same tab** on purpose: back returns to `index.html#<card>` and the card is restored. Don't reintroduce `target="_blank"`; the `↗` mark means "leaves the portfolio", not "new tab".

### Transition animation
Opening a node animates the page card **from the node's position and size** to its resting place (`flipCardIn()`), so it reads as the node becoming the page rather than a panel sliding in. Every duration is a `--dur-*` token in `tokens.css` read via `cssMs()` — never hardcode a timing.

Two traps worth remembering:
- `--node-radius` is registered with `@property` **because** `getComputedStyle` otherwise returns the literal string `min(345px, 39vmin)` and `parseFloat` gives `NaN`.
- Release the `isAnimating` lock from a plain `setTimeout`, not inside `requestAnimationFrame`. The old code did the latter, which could leave the UI permanently locked after the first transition.

### Styling — three files, one source of truth
- **`css/tokens.css`** holds every color, font, shadow and transition duration as a `:root` custom property. Nothing else in the codebase contains a color literal, so a palette change is a single-file edit. Both the home page and the project pages load it **first**, before their own stylesheet.

#### Theme — light "Liquid Glass"
White translucent surfaces over a soft gradient, near-black text, a muted ocean-blue accent. (Developed on branch `portfolio_theme`, now merged into `main`.)
- **Material lives in one rule.** A single selector list near the top of `style.css` gives every surface (`.content-wrapper`, `.node-btn`, `.center-plate`, `.toggle-switch`, `.tabs__list`, `.project-switch__pill`, `.skill-tags li`, `.portfolio__item`) the same `background` + `backdrop-filter: blur() saturate()` + rim `box-shadow`. To make a new surface glass, add its selector there — don't re-declare the material. Values are the `--glass-*` tokens. `saturate` is not decoration: blur alone renders as a grey haze, the saturation is what keeps the colour behind it alive.
- **Colour roles flipped**, so two tokens were renamed: `--clr-light` → `--clr-text-strong` (near-black, for headings/bold) and `--clr-dark` → `--clr-on-accent` (white, for text on a blue fill). `--clr-white` is for things that must be literally white regardless of theme (the toggle knob).
- **The accent is a set of four tokens, not one colour.** `--clr-accent` (#1b5e9c) is the *fill* — white sits on it at 6.7:1; `--clr-accent-soft` (#1a5992) is the darker variant for small text **on** glass; `--clr-accent-2` ends the name-plate gradient; `--clr-accent-glow` is the translucent halo. Changing one without the others breaks contrast. The hue was chosen by trying nine families (blue, teal, forest, graphite, plum, burgundy, bronze…) live on the real cards and reading the measured ratios, not by eye alone — if you revisit it, keep white-on-fill and small-text-on-glass at ≥ 4.5:1 and re-check `.is-current` (its 10% tint is the tightest case).
- **Hairlines use `--clr-border`** (dark, translucent), not `--glass-border` (white). A white divider is invisible on this theme; the white rim is only for the outer edge of a glass surface.
- **The background is a still gradient** (`--clr-bg-gradient`, painted by `body`). An animated version with drifting colour blobs was built and rejected — it was livelier but too loud behind the content. If you try something like it again, note that a big `filter: blur()` layer looks catastrophic (30fps) under headless software rasterization and is free (60fps) on a real GPU; measure on hardware before optimizing.
- The Jean plate has **no accent outline** — it's the same glass as the nodes, distinguished by its rounded-square shape and the gradient name. The blue tint and glow appear only on hover in `parked`/`menu`, where the plate is actually a button.
- **`css/style.css`** is home-screen layout only. Its `:root` keeps just `--node-radius`; every home dimension (node diameter, node font, the centre name plate, title/subtitle, gaps) is a `calc()` ratio of it, so the whole home screen scales from one line. It is px-based so browser zoom actually resizes it, capped at `39vmin` so the node ring can never overflow the viewport height.
- **`css/portfolio-page.css`** is shared by all `portfolio/*.html` detail pages. These used to carry ~150 lines of identical inline `<style>` each; don't reintroduce per-page styles.
- Animation durations live in `tokens.css` as `--dur-*`. `js/index.js` reads them with `cssMs()` for its `setTimeout`s and passes `var(--dur-…)` straight into inline `transition` strings, so timing is never hardcoded in two places.
- `index.html` cache-busts with `?v=N` on both CSS and JS — bump it when shipping changes, since GitHub Pages caches aggressively. The `portfolio/*.html` detail pages carry their **own, independent** counter (currently `?v=9` against `index.html`'s `?v=44`), so a `tokens.css` edit needs both bumped or the detail pages keep serving the old palette.
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

The computed width is clamped to `--card-min-width`. Without it the bumpers, which only ever grow via `Math.max`, drive `box.w` negative below a 685px viewport — and a negative `--card-width` is *accepted* (the property is registered `<length>`), only failing later at `width`, where it falls back to `auto` and the card silently collapses to min-content somewhere off screen. See *Mobile*.

Bumpers are read **from the view element**, not the root, so a single `<section>` can override `--bumper-*` for itself. Scrolling lives on the inner `.card-scroll`, inset by `--card-inset`, because a scrollbar on the rounded card escapes its corners — the inset must stay above `r - r/√2`.

Cards grow wide, so prose containers (`.about-me__body`, `.resume-section`, `.section__subtitle`) are capped at `--text-measure`; grids (`.portfolio-grid`, `.services`) are deliberately left full-width.

### Graphics demo pages (`portfolio/*.html`)
- `01_hello`, `02_meshes`, `05_shadow`, `06_value`, `07_gradient` are the project detail pages, linked from the "Graphics" view's `.portfolio-grid`. They share `css/portfolio-page.css`. The Graphics card opens them in the **same tab**, and they deliberately carry **no** link back to the portfolio — the browser's back button returns to `index.html#projects`, which restores the Graphics card (see *History and deep links*). The old `← Taekyung Ho` button reloaded the SPA at the hub home instead; don't reintroduce it. (`03_fog` and `04_toon` were deleted — they were unfilled template copies with broken styling and placeholder contact details.)
- The grid is ordered by **build date**, not file number (Gradient Noise 2026-06-09 comes before Value Noise 2026-06-15). Each item carries a caption: the title (same string as the detail page's `<h1>`, English only) and a `<time>` whose visible text is the only i18n'd part (`proj-date-*` keys). Thumbnails are 480×480; `.portfolio__img` is a square box with `object-fit: contain`, so a thumbnail of any ratio is letterboxed rather than cropped. Column count comes from `auto-fill` on the card width — don't reintroduce viewport media queries, the card is narrower than the viewport.
- Each embeds a live demo via `<iframe>` pointing at a local sibling file (`quad_demo.html`, `meshes_demo.html`, `shadow_demo.html`, `value_demo.html`, `gradient_demo.html`), with a `?start=<name>` query the build reads.
- Those `*_demo.html` files are **generated Emscripten/WebGL builds from the CS250 C++ project, committed whole** — 2–3 MB each (~14 MB total), minified, everything inlined. They are not written by hand and must not be hand-edited or reformatted; to change a demo, rebuild it and replace the file. They also need a real HTTP origin, which is why the pages carry the "open this from a local web server" hint.
- Thumbnails `img/portfolio_thumbnails/03_fog.jpg` and `04_toon.jpg` are orphans — the pages that used them were deleted and nothing references them.

### Mobile
The breakpoint exists in **exactly one place**: a media query in `tokens.css` that sets `--mobile: 1` on `:root`. JS reads it with the existing `cssNum()` helper (`isMobile()`), the same way `cssMs()` reads `--dur-*` — never add a `matchMedia` copy of the condition, or the two will drift. The query is `(max-width: 700px), (max-height: 500px)`; the second half is not redundant, it is how a landscape phone (844px **wide**, 390px tall) is caught.

- **The ring survives on a phone** — `min(345px, 39vmin)` already caps it at 90.5% of the half-vmin. What did not survive was the nodes inside it (48.7px with 7.3px labels at 390px). Mobile re-tunes two ratios only: `--node-radius: 34vmin` and `--node-size` 0.32 → 0.56, giving 74.3px nodes with 12.6px labels. There is room because the nodes sit `2πR/6` = 139px apart on the arc.
- **The card goes full-bleed and the plate floats over it.** Mobile bumpers drop to `12px + env(safe-area-inset-*)`, `layoutCard()` skips the plate-strip widening entirely, and every card fills the box height. `hubPark()` forces the vertical sign to *bottom* on mobile (thumb reach, and one predictable occlusion zone). `layoutCard()` writes `--plate-clear`, which `.card-scroll` adds to its bottom padding so content is never hidden under the plate.
- **`viewport-fit=cover` is required** in the viewport meta or every `env(safe-area-inset-*)` resolves to 0 and the mobile bumpers are meaningless.
- **Touch**: every decorative `:hover` is wrapped in `@media (hover: hover)` — unwrapped, a tapped node keeps the accent fill and a tapped thumbnail stays lifted until the next tap. `.plate-hint` is the opposite case: hover was its *only* reveal, so `@media (hover: none)` shows it permanently, otherwise the Jean plate is a silent button on a phone. The JS hover handlers are guarded by `canHover()` because `mouseleave` may never arrive on touch.
- A separate `(min-width: 701px) and (max-width: 1100px)` block shrinks only the horizontal bumpers. The 330/355px desktop values were eyeballed at `R = 345`, and left a 339px card on a 1024px screen. It must stay **before** the mobile query so a 900×480 window gets the mobile treatment.

Two traps, both of which already bit once here:
- **`--bumper-*` are registered with `@property`** for the same reason as `--node-radius`: the moment mobile made them `calc(12px + env(...))`, an unregistered property handed `getComputedStyle` the literal `calc(...)` string and `parseFloat` returned `NaN`, which propagated into `--card-width: NaNpx` and re-created the exact collapse the work was meant to fix. Any token JS reads with `cssNum()` must be registered if its value is ever non-literal.
- **The `min-height: 0` flex/grid chain has a horizontal twin.** `.tabs__panels--fill .tabs__panel` and `.project` also need `min-width: 0`, or the panel's automatic minimum size is pinned to the widest unshrinkable descendant (the `max-width: 58ch` hero image, ~447px) and a 366px card overflows by 102px. The `.cmp-table` is deliberately *not* shrunk — it sits in a `.table-scroll` wrapper and scrolls sideways, because squeezing a 4-column table to 320px makes it unreadable rather than narrow.

### Link previews (Open Graph)
`index.html` declares `og:*` / `twitter:card` in `<head>`. Without them a scraper picks an arbitrary `<img>` from the document — it used to grab a game screenshot. Two rules: `og:image` must be an **absolute** URL (`https://taekyung00.github.io/portfolio/...`, relative paths are ignored by most scrapers), and the image is **1200×630**. `img/og-image.png` is a placeholder rendered from the site's own tokens; replacing it means dropping a new file at the same path and size, no markup change. Scrapers cache aggressively, so a changed image won't show until their cache expires or is refreshed (KakaoTalk is the stubbornest). The `portfolio/*.html` detail pages have no OG tags and no images, so they preview without a picture.

## `README.md` — the Korean agent guide

`README.md` is a second, Korean-language guide covering the same ground as this file (directory tree, the node-position table, a "what do I edit to change X" lookup table). It carries **one standing instruction**: after finishing a piece of work, prepend a row to its `## 📑 변경 이력` (changelog) table — date, files touched, what changed and why. Follow it; the table is the project's only running history beyond git, and several entries record *rejected* approaches that are worth not repeating.

Parts of it have drifted, so prefer this file where the two disagree:
- its directory tree still lists `docs/Cover_Letter/`, which was deleted (commit `4c046e2`)
- one changelog row says the Graphics demos open in a new tab; that was reverted the same day — they open in the **same tab** (see *History and deep links*)

## Other notes
- **Comments in this codebase are written in Korean**, in every file (`index.html`, `js/index.js`, all three stylesheets), and they are unusually dense — they record *why* a thing is the way it is, often naming the approach that failed. Match that when you add code: Korean comments, and explain the reasoning rather than restating the line. Identifiers, i18n keys, CSS tokens and technical terms stay English.
- There is no `TODO.txt` in this directory despite older references to one; outstanding work lives in the README changelog and in git.
- `data-card-ratio` is implemented in `layoutCard()` but no section currently uses it — it is a supported capability, not a live layout.
- `docs/` holds the downloadable résumé/transcript assets linked from the Resume view, plus `docs/1098/` (the 10..9..8.. GDD and technical spec linked from Game Projects) — treat these as user-supplied content, not something to regenerate. The GDD filename contains `..` inside a segment; that is not a dot-segment and serves fine.

## Deploying

GitHub Pages serves `main` directly — pushing to `main` is the deploy, with no build or CI step in between, so an untested commit is a live site. The `portfolio_theme` branch still exists locally but was merged in `b3683dd`; the Liquid Glass theme is on `main`.

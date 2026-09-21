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
- Two things follow from a node's angle and must not be hardcoded again: the corner the expand/collapse animation flies to (`getTargetCornerTranslation`) and the `opposite-*` position class applied to that view's back button. Both are the *opposite* compass direction from the node, snapped to one of 8 slots by `axisSign`.

### Adding or removing a node
Only three edits, all additive — angles, transition corners and back-button placement recalculate themselves:
1. Add/remove a `<button class="node-btn" data-target="X">` in `<nav class="node-nav">` (position in the list = position on the ring).
2. Add/remove the matching `<section id="X" class="view">`, including a `<button class="home-back-btn">` (no position class — JS assigns it).
3. Write the English label in the HTML itself and add the Korean to the `ko` object in `js/index.js`. A missing Korean key logs an `[i18n]` console warning rather than silently falling back.

The 8 `opposite-*` classes cover 8 compass directions, so past 8 nodes two views can share a back-button slot.

### Transition animation
Clicking a node or a `.home-back-btn` doesn't just toggle visibility — it drives a multi-stage transform animation (shrink/expand via `--tx`/`--ty`/`--scale` CSS vars, plus an `expanding-node` class that scales a button until it covers the screen). Every duration involved is a `--dur-*` token in `tokens.css`; the JS reads them rather than repeating the numbers, so retiming the sequence is a token edit.

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

### Graphics demo pages (`portfolio/*.html`)
- `01_hello`, `02_meshes`, `05_shadow`, `06_value`, `07_gradient` are the project detail pages, linked from the "Graphics" view's `.portfolio-grid`. They share `css/portfolio-page.css` and each starts with a `.home-link` back to `../index.html`. (`03_fog` and `04_toon` were deleted — they were unfilled template copies with broken styling and placeholder contact details.)
- Each embeds a live demo via `<iframe>` pointing at a local sibling file (`quad_demo.html`, `meshes_demo.html`, `shadow_demo.html`, `value_demo.html`, `gradient_demo.html`).
- **Known incomplete state**: those `*_demo.html` targets are empty (0-byte) placeholders, so no iframe currently renders anything. Tracked in `TODO.txt` ("그래픽 데모 수정하기").

## Other notes
- `TODO.txt` and `README.md` (a Korean "AI agent guide") track outstanding work items and a duplicate description of the directory/node layout; `README.md` also documents the node-position table this file summarizes above.
- `docs/` holds the downloadable résumé/cover letter/transcript assets linked from the Resume view — treat these as user-supplied content, not something to regenerate.

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
3. Add/remove the `data-i18n` keys in **both** `translations.en` and `translations.ko`. A missing key logs an `[i18n]` console warning rather than silently falling back.

The 8 `opposite-*` classes cover 8 compass directions, so past 8 nodes two views can share a back-button slot.
- Clicking a node or a `.home-back-btn` doesn't just toggle visibility — it drives a multi-stage transform animation (shrink/expand via `--tx`/`--ty`/`--scale` CSS vars, an `expanding-node` class that scales a button to cover the screen) timed with `setTimeout`s that must stay in sync with the CSS transition durations (`--transition-slow` / `--transition-fast` in `css/style.css`). When editing this animation, the JS timeouts and CSS transition durations must be changed together or the crossfade breaks.

### i18n
- Translated strings are **not** in the HTML; they live inline in `js/index.js` as `translations.en` / `translations.ko` objects, keyed by the string used in each element's `data-i18n="..."` attribute.
- To add or change copy: add/update the `data-i18n` attribute on the HTML element, then add matching entries to **both** `translations.en` and `translations.ko`. `updateLanguage()` sets `innerHTML` (not `textContent`), so translation strings may include inline tags like `<b>`/`<br>`.

### Styling (`css/style.css`)
- Single stylesheet; theme values (colors, fonts, shadows, transition timing) are CSS custom properties on `:root`.
- `index.html` loads it with a cache-busting query string (`css/style.css?v=3`) — bump this version when shipping CSS changes, since GitHub Pages/browsers otherwise cache the file aggressively.
- `external/normalize.css` is a vendored reset; don't hand-edit it.

### Graphics demo pages (`portfolio/*.html`)
- `portfolio/01_hello.html` through `07_gradient.html` are standalone, self-contained detail pages (each has its own inline `<style>`) describing individual graphics/coursework projects (WebGL/OpenGL, C++). They're linked from the "Graphics" view's `.portfolio-grid` in `index.html`.
- Several of these embed a live demo via `<iframe>`, pointing either to a local sibling file (`quad_demo.html`, `meshes_demo.html`, `shadow_demo.html`, `value_demo.html`, `gradient_demo.html`) or to `../webgl/<Project>/graphics_fun.html`.
- **Known incomplete state**: the local `*_demo.html` iframe targets currently exist as empty (0-byte) placeholder files, and the referenced `../webgl/` directory does not exist yet in the repo. This is a known gap, tracked in `TODO.txt` ("그래픽 데모 수정하기" — fix graphics demos). Don't assume these iframes currently render anything.

## Other notes
- `TODO.txt` and `README.md` (a Korean "AI agent guide") track outstanding work items and a duplicate description of the directory/node layout; `README.md` also documents the node-position table this file summarizes above.
- `docs/` holds the downloadable résumé/cover letter/transcript assets linked from the Resume view — treat these as user-supplied content, not something to regenerate.

# ZYRAVANTH 2
**INFINITE GALAXIES. INFINITE WORLDS. INFINITE IDENTITIES.**

A static, browser-based cosmic explorer with three phases: galaxies → planets → profiles.

## Run locally
Because this project uses JavaScript modules, run it through a local static server rather than opening `index.html` directly.

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

No backend, account, database, or per-entity API request is required.

## Project structure
- `index.html` — semantic application shell and overlays.
- `style.css` — responsive cosmic interface, accessibility, reduced-motion behavior.
- `script.js` — application state, interactions, navigation, infinite generation UI.
- `modules/identifiers.js` — exact decimal-string IDs, URL parsing and URL construction.
- `modules/naming.js` — deterministic hashing, seed generation, naming vocabulary.
- `modules/generators.js` — pure deterministic galaxy, planet, and profile generators.
- `modules/artwork.js` — locally generated SVG artwork.
- `modules/search.js` — separate, phase-scoped search routines.
- `modules/infinite-scroll.js` — observer-driven continuous stream.
- `modules/virtualization.js` — reusable logical-list windowing helper.
- `modules/router.js` — history and deep-link routing.
- `modules/navigation.js` — breadcrumb hierarchy.
- `modules/storage.js` — local preferences and intro dismissal.

## Identity and infinity model
Entity IDs are canonical decimal strings and are never converted to JavaScript `Number` for identity. Each generator derives a deterministic seed from the full parent context and ID. No complete universe dataset is stored. The stream generates batches on demand and does not impose a total-item cap.

A finite browser cannot exhaustively search an infinite set or hold infinite DOM nodes. Exact decimal IDs resolve directly; name/metadata searches scan a deterministic candidate sequence incrementally and explicitly report that discovery is ongoing. The `VirtualWindow` module provides a reusable virtualization helper; the current card view also uses `content-visibility` and a lightweight generated batch strategy. Very long sessions can still be improved further by wiring full list window recycling into the active explorer for stricter DOM bounds.

## Routes
- `/galaxies`
- `/galaxy/<galaxyId>`
- `/galaxy/<galaxyId>/planet/<planetId>`
- `/galaxy/<galaxyId>/planet/<planetId>/profile/<profileId>`

Static hosts must be configured to serve `index.html` for deep paths (SPA fallback). GitHub Pages users can add a suitable 404 fallback if they need direct refresh support for nested paths.

## Notes
- SVG art is generated locally and reproducibly.
- Preferences are stored locally where available.
- Keyboard shortcut `/` opens the current phase's search; `Escape` closes overlays.
- Third-party Google Fonts are optional; system fallbacks are included.
- This package is a working frontend implementation, not a claim that mathematical infinity or exhaustive search of an infinite universe is physically possible.

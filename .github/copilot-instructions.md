<!-- .github/copilot-instructions.md -->
# Copilot instructions — icha-senpai.github.io

This file contains concise, actionable guidance for AI coding agents working on this repository (static personal site + small tooling). Refer to the named files for examples.

- Repo type: static website (plain HTML/CSS/JS) with a small Node.js utility for image optimization.
- Key runtime pages: `index.html`, `commodity-table.html`, `star-citizen.html`, `twitch.html`.

Essential knowledge (big picture)
- No single bundler/build pipeline: most libraries are loaded from CDNs in HTML (Handsontable, HyperFormula, Bootstrap, DOMPurify). Agents should not assume a webpack/rollup build step.
- UI logic split between page HTML and small, focused JS files in repo root: `commodity-init.js` (initialization) and `commodity-table.js` (toolbar/UX helpers). When changing behavior, update the appropriate file rather than editing inlined HTML unless it’s purely presentational.
- Image optimization is handled offline via `scripts/optimize-images.js` and `package.json` script `optimize-images` (runs with Node and the `sharp` dependency). Generated outputs are placed in `images/optimized/`.

Important files and why they matter (quick lookup)
- `commodity-table.html` — page layout, CDN includes, FOUC patterns, and where the Handsontable container lives (`#hot-container`).
- `commodity-init.js` — builds the Handsontable data model, options, column/row formulas, and dispatches the custom `hot-ready` event. Use this to understand table shape and indexes (totals row, hidden rows).
- `commodity-table.js` — UI helpers for the table toolbar, show/hide logic for columns/rows, event listeners for `hot-ready`, and small accessibility helpers (aria-live, toast). Agents should preserve event names and the `container.handsontableInstance` convention.
- `scripts/optimize-images.js` + `package.json` — image generation workflow. Run with `npm run optimize-images` (requires Node and `sharp`).
- `resources/sheet.css` and `css/custom.css` — primary styles. The repo intentionally centralizes styling here rather than inline in JS.

Project-specific conventions and patterns
- Initialization/event contract: the table initializer dispatches a `hot-ready` event (custom). Other scripts (toolbar, helpers) use that event instead of polling. Preserve that event name and the `container.handsontableInstance` attachment when editing or adding table-related code.
- FOUC / reveal pattern: pages use `body.fouc-hidden` and remove it only after critical initialization (see `revealWhenReady()` in `commodity-init.js`). Do not remove or change the timing without checking the visible result in a browser.
- Handsontable details to respect:
  - Totals row is at 0-based index 123 (row 124 in sheet terms).
  - Extra data rows are 0-based indices 14-122 and are hidden by default via `hiddenRows`.
  - Extra columns E and F correspond to indices 4 and 5 and are toggled via the `hiddenColumns` plugin.
  - The autocomplete column (col 0) uses a centralized `commodityOptions` array in `commodity-init.js` and a special NONE_LABEL (em-dash) mapping — preserve that normalization logic when changing autocomplete behavior.
- Accessibility cues: `#hot-aria-live` is used for polite announcements. Toolbar buttons include `aria-pressed`; keep these attributes when refactoring toolbar markup.

Developer workflows and commands
- Regenerate responsive images (writes to `images/optimized/`):
  - Ensure Node is installed and run: `npm run optimize-images`.
  - Note: `sharp` has native bindings; on Windows CI or machines you may need build tools or use a Node runtime that supplies prebuilt binaries.
- Preview pages: there is no dev server configured. For local testing, open `commodity-table.html` in a browser or run a simple static server from the repo root (examples: `npx http-server` or `python -m http.server`). Ensure the browser has network access for CDN scripts.

Debugging and tests
- There is no automated test suite in the repo. Use the browser console and the following patterns seen in source:
  - `console.error(...)` is used sparingly; follow existing patterns for quiet failure handling.
  - `hot-ready` timing issues are handled by a 3s fallback in `commodity-init.js`; reproduce race conditions by throttling script loads in dev tools.

Editing guidance / safe-local changes
- Prefer small, focused edits: change `commodity-init.js` to adjust table columns/rows/formulas; change `commodity-table.js` to adjust toolbar UX and ARIA announcements.
- When changing the table shape (row/column counts or indices), update both `commodity-init.js` (data generation, hiddenRows config, totals formulas) and any code in `commodity-table.js` that references hard-coded indices (e.g., 4,5, 14, 123).
- Don't inline large data lists into HTML; the repo centralizes the commodity list in `commodity-init.js`.

If you update this file
- Keep this document short and code-centric. Add short examples (file paths and line hints) rather than general recommendations.

If anything above is unclear or you'd like me to expand a section (for example: example PR checklist, more commands for Windows sharp setup, or a dev-server task), tell me which area and I will iterate.

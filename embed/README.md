# Commodity Table Embed

This folder contains a self-contained embed of the "Multi Contract Cargo Tracker" Handsontable from this repository.

Files

- `commodity-embed.html` — standalone HTML file that loads Handsontable, HyperFormula and DOMPurify from CDNs and initializes the table and toolbar. Drop this file on any static host and iframe or link to it.

- `commodity-embed.mjs` — ES module that exports `initCommodityEmbed(rootOrSelector, options)` and will dynamically load required libraries if needed.
- `commodity-embed.umd.js` — UMD build that exposes `initCommodityEmbed` on `window` for non-module environments (falls back to fetching the `.mjs` file when necessary).

How to use

- Host `commodity-embed.html` on any static web server (GitHub Pages, Netlify, S3, etc.).

- To embed in another site via iframe:

```html
<iframe src="https://your-host.example.com/path/to/commodity-embed.html" width="100%" height="800" style="border:0"></iframe>
```

- Or link users directly to the page.

Module / direct integration (no iframe) — ES module (recommended)

1. Add the module to your page (modern browsers):

```html
<script type="module">
  import initCommodityEmbed from "/embed/commodity-embed.mjs";
  // initialize inside an element with id 'icha-commodity-root' (script will create it if missing)
  initCommodityEmbed('#icha-commodity-root').then(({root, hot}) => {
    // hot is the Handsontable instance; do what you need with it
    console.log('Commodity embed initialized', hot);
  });
</script>
```

1. If you prefer to include the module via a module script tag and not import, you can do:

```html
<script type="module" src="/embed/commodity-embed.mjs"></script>
```

UMD (legacy/non-module) usage

Include the UMD script and call the initializer exposed on `window`:

```html
<script src="/embed/commodity-embed.umd.js"></script>
<script>
  // initCommodityEmbed returns a Promise
  initCommodityEmbed('#icha-commodity-root').then(({root, hot}) => console.log('ready', hot));
</script>
```

Customization

- The embed pulls Handsontable, HyperFormula and DOMPurify from jsDelivr. If you prefer self-hosting or pinning different versions, edit the top of `commodity-embed.html` and replace the CDN URLs.

- To change columns, rows, or the commodity list, edit the inlined initializer in `commodity-embed.html` and update `hotHeader`, `hotRows`, `extraRows`, or `commodityOptions`.

- When using the module or UMD initializer, you can pass `options` to `initCommodityEmbed(rootOrSelector, options)`. Example options:

```js
{
  commodityOptions: [/* custom list */],
  root: '#my-root',
  autoLoadLibs: true // set to false if your page already loads Handsontable/HyperFormula/DOMPurify
}
```

Quick copy / upload checklist (drag-and-drop friendly)

If you just want to upload a small set of files to a static host (GitHub Pages, Netlify, S3, etc.) and have the embed work by copying the files into a single folder, follow this checklist.

- [ ] Files to copy into a new folder on your host (recommended folder name: `embed`):
  - `commodity-embed.html` (required) — the single-page embed. This file will load Handsontable, HyperFormula and DOMPurify from CDNs by default.
  - Optional (for offline or no-CDN setups — place these in the same folder as `commodity-embed.html`):
    - `purify.min.js` (DOMPurify)
    - `handsontable.min.js` (Handsontable runtime)
    - `handsontable.min.css` (Handsontable styles)
    - `hyperformula.full.min.js` (HyperFormula runtime)

- [ ] Upload the folder to your static host. Example final paths (if you used `embed/`):
  - `https://your-site.example.com/embed/commodity-embed.html`
  - If you included the optional local libs, their URLs should be:
    - `https://your-site.example.com/embed/purify.min.js`
    - `https://your-site.example.com/embed/handsontable.min.js`
    - `https://your-site.example.com/embed/handsontable.min.css`
    - `https://your-site.example.com/embed/hyperformula.full.min.js`

- [ ] Test by opening the `commodity-embed.html` URL in a browser. It will:
  - prefer the local files (`./purify.min.js`, `./handsontable.min.js`, etc.) if present in the same folder,
  - otherwise fall back to CDN copies automatically.

Quick checklist summary (copy these files):

```text
embed/
  commodity-embed.html        # required
  purify.min.js               # optional, local DOMPurify (falls back to CDN if missing)
  handsontable.min.js         # optional, local Handsontable (falls back to CDN if missing)
  handsontable.min.css        # optional, local CSS (falls back to CDN if missing)
  hyperformula.full.min.js    # optional, local HyperFormula (falls back to CDN if missing)
```

Notes

- If you only upload `commodity-embed.html` the page will still work but requires network access to the CDNs. This is the simplest approach.
- If you want a single JS file that inlines Handsontable/HyperFormula (no CDN usage), tell me and I will produce a single bundled file — note this increases the download size significantly and may require a license check for Handsontable.
- The `commodity-embed.mjs` and `commodity-embed.umd.js` files in this folder are alternate integration options if you want to embed the table directly in your site instead of using an iframe.

Licensing and notes

- Handsontable is used under its non-commercial evaluation license for this project. If you plan to use the embed for commercial purposes, review Handsontable's licensing terms.

- HyperFormula is distributed under its own license. Check the project pages for terms.

- The embed intentionally keeps styling minimal to make it easy to integrate into other sites; the original site styles are in `css/custom.css`.

Security

- The embed runs entirely in the browser and does not send data offsite. If you add server-side synchronization, ensure you protect user data appropriately.

Multiple instances / persistence

- The ES module initializer returns the created `root` and `hot` instance and supports initializing multiple instances on the same page by calling `initCommodityEmbed` with different root selectors.
- Persistence is not included by default. If you'd like autosave/load to `localStorage` (per-origin), I can add an option `storageKey` to enable automatic save/load.

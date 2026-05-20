# Quick drag-and-drop upload instructions

This repository contains the full site. To make it easy to upload to a new static host (GitHub Pages, Netlify, S3, etc.) in a copy/paste friendly way, use the following guidance.

Recommended folder layout to upload (copy these top-level folders/files):

```text
home/index.html
about/index.html
star-citizen/index.html
twitch/index.html
commodity-table/index.html
commodity-table/commodity-init.js
commodity-table/commodity-table.js
commodity-table/README-local-libs.txt
css/custom.css
resources/sheet.css
images/ (entire folder)
site.webmanifest
package.json (optional)
```

Notes:

- Each page is organized in its own folder (home/, about/, star-citizen/, twitch/, commodity-table/) and references shared assets using relative paths (../css, ../images). Upload the entire set together so relative links work.
- The commodity page will use CDN-hosted Handsontable/HyperFormula/DOMPurify if the local vendor files are not present. To avoid CDN requests, add the vendor files to the `commodity-table/` folder as explained in `commodity-table/README-local-libs.txt`.
- If you want a single-file JS bundle that inlines Handsontable & HyperFormula (no CDN), request it explicitly — I can produce one but it will be large and may require license confirmation for Handsontable.

Verification:

- After uploading, open one of the index files (for example):

```text
https://your-host.example.com/home/index.html
```

to confirm the site loads.

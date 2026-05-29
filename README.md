# Savant Search — Developer Card Detector

A Chrome (Manifest V3) extension that detects developer/freelancer cards on
**Upwork** and **LinkedIn** search results and logs the parsed data to the
browser console.

## Load it

1. Open `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked** and select this folder.
4. Visit an Upwork talent search or a LinkedIn people search.
5. Open DevTools → **Console**. Detected cards print as:

   ```
   [Savant Search] Upwork developer card { name, title, rate, skills, profileUrl, … }
   [Savant Search] LinkedIn developer card { name, title, location, profileUrl }
   ```

The extension watches for DOM changes, so cards loaded via scroll/pagination
are picked up automatically, and each card is logged only once.

## Files

| File | Purpose |
|------|---------|
| `manifest.json`  | Extension config + content-script registration. |
| `src/common.js`  | Shared helpers: dedup, mutation observer, console logging. |
| `src/upwork.js`  | Upwork freelancer-tile parser. |
| `src/linkedin.js`| LinkedIn entity-result parser. |
| `icons/`         | Toolbar icons. |

## Notes

- Both sites change their markup often. Selectors are deliberately broad and
  fall back across known variants; if cards stop appearing, update the
  `CARD_SELECTORS` / `pick()` lists in the relevant `src/*.js` file.
- Currently output-only (console). Next step would be sending parsed cards to a
  background service worker or a popup UI.

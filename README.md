# Pathology WSI Viewer

A browser **whole-slide image (WSI) viewer** for digital pathology, with ROI
annotation, serial-section overlay & alignment, ML-prediction review, and
specimen tracking. Built with **React + TypeScript + OpenSeadragon**.

🔗 **Live demo:** https://bonnieso.github.io/pathology-wsi-viewer/
*(enable GitHub Pages → "GitHub Actions" after the first push; see below)*

> ⚠️ **All imagery is procedurally generated and all specimens/predictions are
> synthetic.** No real, patient, or proprietary data is used anywhere.

---

## Why

Digital-pathology workflows need to render enormous microscopy images in the
browser and let scientists annotate them, compare serial sections, and review
model output — without downloading gigapixel files. This demo implements that
front end end-to-end:

- **Gigapixel rendering in the browser.** OpenSeadragon does deep-zoom tiled
  rendering; a custom [`syntheticTileSource`](src/lib/syntheticTileSource.ts)
  simulates a **65,536 × 65,536 (~4.3 gigapixel)** slide by drawing tissue-like
  tiles on the fly — so the whole thing deploys as a static site with zero image
  assets. (Swap in a real DZI/IIIF tile source and nothing else changes.)
- **ROI annotation.** Draw polygon and rectangle regions; they're stored in
  **image-pixel coordinates** (not screen pixels) so they stay put through
  pan/zoom, and **export to GeoJSON** — the format QuPath and most WSI tools
  exchange.
- **Serial-section overlay & alignment.** Overlay a second stain of the same
  section and align it by hand (opacity, shift, rotate) — the common task of
  comparing adjacent sections acquired on different instruments.
- **ML-prediction review.** Model predictions are surfaced in a review queue with
  confidence; a scientist **accepts** (→ becomes an annotation) or **rejects**
  each — the human-in-the-loop pattern for scaling annotation.
- **Specimen tracking.** A table following specimens from collection → analysis.

## Tech

React 18 · TypeScript · Vite · OpenSeadragon · Vitest · GitHub Actions (build,
test, deploy to Pages). No UI framework — plain CSS.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (GeoJSON export)
npm run build      # production build to dist/
```

## Deploy (GitHub Pages)

The included workflow (`.github/workflows/deploy.yml`) builds, tests, and
publishes on every push to `main`. One-time setup: **Settings → Pages → Source →
GitHub Actions**. The app's base path is `/pathology-wsi-viewer/` (set in
`vite.config.ts`; override with `VITE_BASE=/` for a root/Vercel deploy).

## Plugging in a real slide

The viewer is source-agnostic. Replace the synthetic tile source in
[`src/components/Viewer.tsx`](src/components/Viewer.tsx) with any OpenSeadragon
tile source — a Deep Zoom (`.dzi`) URL, an IIIF `info.json`, or a tile server —
and the annotation, overlay, ML-review, and export layers work unchanged.

## Structure

```
src/
  components/Viewer.tsx        # OpenSeadragon + SVG annotation overlay + alignment
  components/ControlsPanel.tsx # tools, class, overlay sliders, export
  components/RoiPanel.tsx      # annotation list (select / locate / delete)
  components/MlPanel.tsx       # prediction review queue (accept / reject / locate)
  components/SpecimenTable.tsx # specimen tracking
  lib/syntheticTileSource.ts   # procedural gigapixel tile source
  lib/geojson.ts               # ROI → GeoJSON export (+ unit tests)
  lib/colors.ts                # per-class categorical colors
  data/                        # synthetic specimens + predictions
```

## License

MIT — see [LICENSE](LICENSE).

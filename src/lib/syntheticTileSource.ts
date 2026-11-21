/**
 * A procedural OpenSeadragon tile source.
 *
 * Instead of shipping a real (huge, proprietary) whole-slide image, this draws
 * tissue-like tiles on the fly on a <canvas> and returns them as data URLs. It
 * lets the demo simulate an arbitrarily large pyramidal slide — e.g.
 * 65536 × 65536 ≈ 4.3 "gigapixels" — with zero image assets and no external
 * dependencies, so it deploys as a static site and works offline.
 *
 * The pattern (a custom tile source with a `getTileUrl` that generates content)
 * is exactly how you'd back OpenSeadragon with a real tile server or an
 * on-the-fly renderer.
 */

export interface SyntheticTileSourceOptions {
  width?: number;
  height?: number;
  tileSize?: number;
  /** Base hue (0-360). ~330 reads as H&E pink; ~30 as IHC/DAB brown. */
  hue?: number;
  /** Changes the cell layout so two sources look like different sections. */
  seed?: number;
}

// Deterministic PRNG so every tile renders identically on each request.
function mulberry32(a: number): () => number {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash3(level: number, x: number, y: number, seed: number): number {
  return (
    (level * 73856093) ^ (x * 19349663) ^ (y * 83492791) ^ (seed * 2654435761)
  );
}

export function makeSyntheticTileSource(opts: SyntheticTileSourceOptions = {}) {
  const width = opts.width ?? 65536;
  const height = opts.height ?? 65536;
  const tileSize = opts.tileSize ?? 256;
  const hue = opts.hue ?? 330;
  const seed = opts.seed ?? 1;

  // One reusable offscreen canvas for tile rendering.
  const canvas = document.createElement("canvas");
  canvas.width = tileSize;
  canvas.height = tileSize;
  const ctx = canvas.getContext("2d")!;

  return {
    width,
    height,
    tileSize,
    tileOverlap: 0,
    minLevel: 0,
    getTileUrl(level: number, x: number, y: number): string {
      const rand = mulberry32(hash3(level, x, y, seed));

      // Background "tissue" wash, slightly varied per tile.
      const bgL = 90 + rand() * 6;
      ctx.fillStyle = `hsl(${hue}, 45%, ${bgL}%)`;
      ctx.fillRect(0, 0, tileSize, tileSize);

      // Denser "cells" at higher levels so zooming reveals detail.
      const cellCount = 12 + Math.floor(level * 2.5);
      for (let i = 0; i < cellCount; i++) {
        const cx = rand() * tileSize;
        const cy = rand() * tileSize;
        const r = 2 + rand() * 6;
        const l = 35 + rand() * 25;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * (0.7 + rand() * 0.6), rand() * Math.PI, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${hue}, 55%, ${l}%)`;
        ctx.globalAlpha = 0.65;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Faint tile border makes the tiling (and deep-zoom) visible up close.
      ctx.strokeStyle = "rgba(0,0,0,0.05)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, tileSize - 1, tileSize - 1);

      return canvas.toDataURL("image/png");
    },
  };
}

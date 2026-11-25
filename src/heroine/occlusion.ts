import type { Polygon } from "../game/furniture";
import type { Rect } from "./atlas";
/** Positive scanline bands support both Canvas and WebGL without inverted masks. */
export function visibleBands(
  polygons: Polygon[],
  rects: Rect[] = [],
  width = 1280,
  height = 720,
): Rect[] {
  const result: Rect[] = [];
  let previous = new Map<string, Rect>();
  for (let y = 0; y < height; y++) {
    const cuts: [number, number][] = [];
    for (const r of rects)
      if (y + 0.5 >= r.y && y + 0.5 < r.y + r.height)
        cuts.push([r.x, r.x + r.width]);
    for (const points of polygons) {
      const xs: number[] = [];
      const scan = y + 0.5;
      for (let i = 0; i < points.length; i++) {
        const a = points[i],
          b = points[(i + 1) % points.length];
        if ((a.y <= scan && b.y > scan) || (b.y <= scan && a.y > scan))
          xs.push(a.x + ((scan - a.y) * (b.x - a.x)) / (b.y - a.y));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2)
        cuts.push([
          Math.max(0, Math.floor(xs[i])),
          Math.min(width, Math.ceil(xs[i + 1])),
        ]);
    }
    cuts.sort((a, b) => a[0] - b[0]);
    let end = 0;
    const spans: [number, number][] = [];
    for (const [a, b] of cuts) {
      if (a > end) spans.push([end, Math.min(a, width)]);
      end = Math.max(end, b);
    }
    if (end < width) spans.push([end, width]);
    const next = new Map<string, Rect>();
    for (const [x, r] of spans) {
      if (r <= x) continue;
      const key = `${x}:${r}`;
      const old = previous.get(key);
      const band = old ?? { x, y, width: r - x, height: 0 };
      band.height++;
      if (!old) result.push(band);
      next.set(key, band);
    }
    previous = next;
  }
  return result;
}

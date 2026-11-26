import type Phaser from "phaser";
import { heroine, validateHeroineManifest } from "./assets";
import {
  groundContactX,
  atlasCell,
  silhouetteBounds,
  registeredFrames,
  type Rect,
} from "./atlas";
const frameBounds = new Map<string, Rect>();
export function heroineFrameBounds(name: string) {
  return frameBounds.get(`heroine-${name}`);
}
const normalized = new Map<string, HTMLCanvasElement>();
export function preloadHeroine(scene: Phaser.Scene) {
  for (const atlas of heroine.atlases)
    if (!scene.textures.exists(`heroine-source-${atlas.id}`))
      scene.load.image(`heroine-source-${atlas.id}`, atlas.src);
}
export function createHeroineTextures(scene: Phaser.Scene) {
  validateHeroineManifest();
  for (const atlas of heroine.atlases) {
    const sourceKey = `heroine-source-${atlas.id}`;
    if (!scene.textures.exists(sourceKey))
      throw Error(`Heroine artwork is missing: ${atlas.src}.`);
    const image = scene.textures
      .get(sourceKey)
      .getSourceImage() as HTMLImageElement;
    const groups = new Map<
      string,
      {
        name: string;
        height: number;
        canvas: HTMLCanvasElement;
        bounds: Rect;
        groundX?: number;
      }[]
    >();
    for (const f of atlas.frames) {
      const key = `heroine-${f.name}`;
      if (normalized.has(key)) continue;
      const cell = atlasCell(
        image.width,
        image.height,
        atlas.columns,
        atlas.rows,
        f.column,
        f.row,
      );
      const scratch = document.createElement("canvas");
      scratch.width = cell.width;
      scratch.height = cell.height;
      const ctx = scratch.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(
        image,
        cell.x,
        cell.y,
        cell.width,
        cell.height,
        0,
        0,
        cell.width,
        cell.height,
      );
      const bounds = silhouetteBounds(
        ctx.getImageData(0, 0, cell.width, cell.height).data,
        cell.width,
        cell.height,
      );
      const entries = groups.get(f.group) ?? [];
      entries.push({
        name: key,
        height: f.height,
        canvas: scratch,
        bounds,
        ...(atlas.id === "observatory-telescope"
          ? {
              groundX: groundContactX(
                ctx.getImageData(0, 0, cell.width, cell.height).data,
                cell.width,
                bounds,
              ),
            }
          : {}),
      });
      groups.set(f.group, entries);
    }
    for (const entries of groups.values()) {
      const placements = registeredFrames(
        entries.map((f) => f.bounds),
        entries[0].height,
        heroine.canvas,
        entries.every((f) => f.groundX !== undefined)
          ? entries.map((f) => f.groundX!)
          : undefined,
      );
      entries.forEach((f, i) => {
        const canvas = document.createElement("canvas");
        canvas.width = heroine.canvas.width;
        canvas.height = heroine.canvas.height;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = false;
        const b = f.bounds,
          d = placements[i];
        ctx.drawImage(
          f.canvas,
          b.x,
          b.y,
          b.width,
          b.height,
          d.x,
          d.y,
          d.width,
          d.height,
        );
        normalized.set(f.name, canvas);
        frameBounds.set(f.name, d);
      });
    }
    for (const f of atlas.frames) {
      const key = `heroine-${f.name}`;
      if (!scene.textures.exists(key))
        scene.textures.addCanvas(key, normalized.get(key)!);
    }
  }
}

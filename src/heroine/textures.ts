import type Phaser from "phaser";
import { heroine, validateHeroineManifest } from "./assets";
import { atlasCell, silhouetteBounds, anchoredFrame } from "./atlas";
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
    for (const f of atlas.frames) {
      const key = `heroine-${f.name}`;
      if (scene.textures.exists(key)) continue;
      if (!normalized.has(key)) {
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
        const destination = anchoredFrame(bounds, f.height, heroine.canvas);
        const canvas = document.createElement("canvas");
        canvas.width = heroine.canvas.width;
        canvas.height = heroine.canvas.height;
        const target = canvas.getContext("2d")!;
        target.imageSmoothingEnabled = false;
        target.drawImage(
          scratch,
          bounds.x,
          bounds.y,
          bounds.width,
          bounds.height,
          destination.x,
          destination.y,
          destination.width,
          destination.height,
        );
        normalized.set(key, canvas);
      }
      scene.textures.addCanvas(key, normalized.get(key)!);
    }
  }
}

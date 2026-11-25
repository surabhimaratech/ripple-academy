import manifest from "../../public/art/heroine/animations.json";
export const heroine = manifest;
export const frameNames = new Set(
  heroine.atlases.flatMap((a) => a.frames.map((f) => f.name)),
);
export function validateHeroineManifest() {
  const { width, height, footX, footY } = heroine.canvas;
  if (footX < 0 || footY < 0 || footX >= width || footY >= height)
    throw Error("Heroine foot anchor is outside the canvas.");
  const names = heroine.atlases.flatMap((a) => a.frames.map((f) => f.name));
  if (new Set(names).size !== names.length)
    throw Error("Duplicate heroine frame name.");
  for (const a of heroine.atlases)
    for (const f of a.frames) {
      if (
        f.row < 0 ||
        f.row >= a.rows ||
        f.column < 0 ||
        f.column >= a.columns ||
        f.height > footY ||
        f.height <= 0
      )
        throw Error(`Invalid heroine frame ${f.name}.`);
    }
  for (const clip of Object.values(heroine.clips))
    if (clip.frameMs <= 0 || clip.frames.some((f) => !frameNames.has(f)))
      throw Error("Invalid heroine animation.");
  return true;
}

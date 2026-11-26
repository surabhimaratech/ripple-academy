import type Phaser from "phaser";
import { atlasCell, silhouetteBounds } from "../heroine/atlas";
import { observatoryProps } from "./observatory";
export function preloadObservatory(s: Phaser.Scene) {
  for (const name of ["architecture", "sky", "furniture", "details", "chest"])
    if (!s.textures.exists(`obs-${name}`))
      s.load.image(`obs-${name}`, `/art/rooms/observatory/${name}-v1.png`);
}
function prepare(s: Phaser.Scene, sheet: string, columns = 2, rows = 2) {
  const source = s.textures.get(sheet).getSourceImage() as HTMLImageElement;
  for (let i = 0; i < columns * rows; i++) {
    const key = `${sheet}-${i}`;
    if (s.textures.exists(key)) continue;
    const c = atlasCell(
      source.width,
      source.height,
      columns,
      rows,
      i % columns,
      Math.floor(i / columns),
    );
    const canvas = document.createElement("canvas");
    canvas.width = c.width;
    canvas.height = c.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(source, c.x, c.y, c.width, c.height, 0, 0, c.width, c.height);
    const b = silhouetteBounds(
      ctx.getImageData(0, 0, c.width, c.height).data,
      c.width,
      c.height,
    );
    s.textures.addCanvas(key, canvas)?.setFilter(1);
    s.textures.get(key).add("trim", 0, b.x, b.y, b.width, b.height);
  }
}
export function paintObservatory(
  s: Phaser.Scene,
  reduced: boolean,
): Phaser.Tweens.Tween[] {
  prepare(s, "obs-furniture");
  prepare(s, "obs-details");
  prepare(s, "obs-chest", 1, 1);
  s.add.image(850, 135, "obs-sky").setDisplaySize(1000, 430).setDepth(-10);
  s.add
    .image(640, 360, "obs-architecture")
    .setDisplaySize(1280, 720)
    .setDepth(0);
  const shadows = s.add.graphics().setDepth(1);
  for (const p of observatoryProps) {
    if (p.depth >= 0) {
      shadows
        .fillStyle(0x08131c, 0.25)
        .fillEllipse(p.x, p.y - 3, p.w * 0.8, 12);
      s.add
        .image(p.x, p.y, `obs-${p.sheet}-${p.cell}`, "trim")
        .setOrigin(0.5, 1)
        .setDisplaySize(p.w, p.h)
        .setDepth(p.depth);
    }
    if ("foreground" in p) {
      const f = p.foreground,
        frame = s.textures.get(`obs-${p.sheet}-${p.cell}`).get("trim");
      s.add
        .image(p.x, p.y, `obs-${p.sheet}-${p.cell}`, "trim")
        .setOrigin(0.5, 1)
        .setDisplaySize(p.w, p.h)
        .setCrop(
          frame.width * f.x,
          frame.height * f.y,
          frame.width * f.w,
          frame.height * f.h,
        )
        .setDepth(p.frontDepth);
    }
  }
  s.add
    .text(245, 432, "ILLUSTRATIVE DATA", {
      fontFamily: "monospace",
      fontSize: "9px",
      color: "#a8d3d5",
      backgroundColor: "#10222b",
      padding: { x: 5, y: 3 },
    })
    .setDepth(558);
  const ambient: Phaser.Tweens.Tween[] = [];
  if (!reduced) {
    for (const [x, y] of [
      [790, 55],
      [1030, 113],
      [890, 164],
      [1120, 63],
    ]) {
      const star = s.add.rectangle(x, y, 2, 2, 0xe3f1ff, 0.35).setDepth(-5);
      ambient.push(
        s.tweens.add({
          targets: star,
          alpha: 0.8,
          yoyo: true,
          repeat: -1,
          duration: 3300 + x,
          delay: y * 40,
        }),
      );
    }
  }
  return ambient;
}

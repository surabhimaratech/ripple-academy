import type Phaser from "phaser";
import { atlasCell, silhouetteBounds } from "../heroine/atlas";
import { cafeProps } from "./cafe";
export function preloadCafe(s: Phaser.Scene) {
  for (const name of ["base", "furniture", "props"])
    if (!s.textures.exists(`cafe-${name}`))
      s.load.image(`cafe-${name}`, `/art/rooms/happy-cafe/${name}-v1.png`);
}
/** Trim transparent gutters once. No furniture pixels are erased or redrawn. */
function cells(s: Phaser.Scene, sheet: string) {
  const source = s.textures.get(sheet).getSourceImage() as HTMLImageElement;
  for (let i = 0; i < 4; i++) {
    const key = `${sheet}-${i}`;
    if (s.textures.exists(key)) continue;
    const c = atlasCell(
      source.width,
      source.height,
      2,
      2,
      i % 2,
      Math.floor(i / 2),
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
    // Texture frame is shared by both the complete furniture and its foreground crop.
    s.textures.addCanvas(key, canvas)?.setFilter(1); // Phaser NEAREST; keep pixel edges crisp.
    const target = s.textures.get(key);
    target.add("trim", 0, b.x, b.y, b.width, b.height);
  }
}
export function paintCafe(
  s: Phaser.Scene,
  reduced: boolean,
): Phaser.Tweens.Tween[] {
  cells(s, "cafe-furniture");
  cells(s, "cafe-props");
  s.add.image(640, 360, "cafe-base").setDisplaySize(1280, 720).setDepth(0);
  const shadows = s.add.graphics().setDepth(1);
  for (const p of cafeProps) {
    shadows.fillStyle(0x35271f, 0.2).fillEllipse(p.x, p.y - 4, p.w * 0.9, 15);
    s.add
      .image(p.x, p.y, `cafe-furniture-${p.cell}`, "trim")
      .setOrigin(0.5, 1)
      .setDisplaySize(p.w, p.h)
      .setDepth(p.depth);
    if ("foreground" in p && p.foreground) {
      const tex = s.textures.get(`cafe-furniture-${p.cell}`).get("trim");
      const f = p.foreground;
      s.add
        .image(p.x, p.y, `cafe-furniture-${p.cell}`, "trim")
        .setOrigin(0.5, 1)
        .setDisplaySize(p.w, p.h)
        .setCrop(
          tex.width * f.x,
          tex.height * f.y,
          tex.width * f.w,
          tex.height * f.h,
        )
        .setDepth(p.id === "counter" ? 561 : 589);
    }
  }
  // Handheld mugs/books remain in approved heroine frames. Tabletop objects are independent.
  s.add
    .image(887, 466, "cafe-props-0", "trim")
    .setDisplaySize(28, 23)
    .setDepth(592);
  s.add
    .image(906, 465, "cafe-props-1", "trim")
    .setDisplaySize(34, 20)
    .setDepth(592);
  s.add
    .image(1081, 427, "cafe-props-2", "trim")
    .setDisplaySize(33, 22)
    .setDepth(549);
  s.add
    .image(1245, 719, "cafe-props-3", "trim")
    .setOrigin(0.5, 1)
    .setDisplaySize(132, 216)
    .setDepth(1000);
  const menu = s.add
    .text(478, 225, "MENU\n\nBrowse rewards\n\nE · Open menu", {
      fontFamily: "Georgia",
      fontSize: "14px",
      color: "#f1e1bc",
      backgroundColor: "#354538",
      padding: { x: 14, y: 12 },
      align: "center",
    })
    .setOrigin(0.5)
    .setDepth(2);
  menu.setStroke("#354538", 1);
  const ambient: Phaser.Tweens.Tween[] = [];
  if (!reduced) {
    for (let i = 0; i < 3; i++) {
      const steam = s.add
        .text(887 + i * 3, 443 - i * 7, "∿", {
          fontSize: "18px",
          color: "#fff4dd",
        })
        .setAlpha(0.15)
        .setDepth(595);
      ambient.push(
        s.tweens.add({
          targets: steam,
          y: steam.y - 18,
          alpha: 0,
          duration: 2600 + i * 400,
          delay: i * 650,
          repeat: -1,
        }),
      );
    }
  }
  return ambient;
}

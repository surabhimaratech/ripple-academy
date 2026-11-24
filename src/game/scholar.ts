import Phaser from "phaser";
export type Facing = "down" | "up" | "left" | "right";
/** 48×64 pixel sprite frames: auburn braid, brass barrette, blouse, waistcoat, skirt and satchel. */
export function createScholarTextures(scene: Phaser.Scene) {
  for (const facing of ["down", "up", "left", "right"] as Facing[])
    for (let frame = 0; frame < 14; frame++) {
      const key = `scholar-${facing}-${frame}`;
      if (scene.textures.exists(key)) continue;
      const g = scene.add.graphics();
      const p = (x: number, y: number, w: number, h: number, c: number) =>
        g.fillStyle(c).fillRect(x, y, w, h);
      const skin = 0xe1b28d,
        hair = 0x6b3e3d,
        lightHair = 0xa5644e,
        outline = 0x282836,
        cream = 0xe4d6b5,
        vest = 0x3e5354,
        skirt = 0x625068;
      const step = frame === 1 ? -3 : frame === 3 ? 3 : 0;
      const side = facing === "left" || facing === "right";
      const back = facing === "up";
      p(
        16,
        frame === 4 || frame === 10 || frame === 11 ? 46 : 49,
        7,
        frame === 4 || frame === 10 || frame === 11 ? 9 : 11 + step,
        outline,
      );
      p(
        26,
        frame === 4 || frame === 10 || frame === 11 ? 46 : 49,
        7,
        frame === 4 || frame === 10 || frame === 11 ? 9 : 11 - step,
        outline,
      );
      p(
        13,
        frame === 4 || frame === 10 || frame === 11 ? 53 : 58 + step,
        10,
        4,
        0x332d37,
      );
      p(
        26,
        frame === 4 || frame === 10 || frame === 11 ? 53 : 58 - step,
        11,
        4,
        0x332d37,
      );
      p(
        14,
        frame === 4 || frame === 10 || frame === 11 ? 53 : 58 + step,
        8,
        1,
        0xb38a64,
      );
      p(
        27,
        frame === 4 || frame === 10 || frame === 11 ? 53 : 58 - step,
        8,
        1,
        0xb38a64,
      );
      p(12, 28, 25, 24, outline);
      p(14, 30, 21, 22, skirt);
      p(17, 33, 2, 17, 0x857080);
      p(31, 34, 2, 16, 0x443d53);
      p(13, 49, 23, 3, 0x90727d);
      p(12, 22, 26, 15, outline);
      p(14, 23, 22, 12, cream);
      p(13, 26, 7, 14, cream);
      p(31, 26, 7, 14, cream);
      p(14, 37, 5, 5, skin);
      p(32, 37, 5, 5, skin);
      p(19, 26, 12, 13, vest);
      p(20, 26, 3, 12, 0x6e8276);
      p(25, 29, 2, 2, 0xcfac74);
      p(25, 34, 2, 2, 0xcfac74);
      p(19, 38, 13, 3, 0x9f805c);
      p(15, 4, 21, 23, outline);
      p(12, 10, 26, 17, hair);
      p(16, 2, 17, 6, hair);
      p(17, 7, 17, 17, skin);
      p(14, 6, 6, 20, hair);
      p(15, 5, 5, 14, lightHair);
      p(31, 7, 5, 18, hair);
      p(30, 6, 4, 8, lightHair);
      p(18, 4, 14, 5, hair);
      p(18, 7, 6, 4, hair);
      if (back) {
        p(17, 6, 17, 19, hair);
        p(17, 7, 3, 15, lightHair);
        p(23, 18, 7, 22, hair);
        for (let i = 0; i < 5; i++)
          p(23 + (i % 2), 19 + i * 4, 5, 3, lightHair);
        p(24, 38, 5, 3, 0xd5ae70);
      } else if (side) {
        const eyeX = facing === "left" ? 18 : 29;
        p(eyeX, 14, 2, 3, 0x342b37);
        p(facing === "left" ? 15 : 34, 17, 3, 3, skin);
        p(facing === "left" ? 30 : 15, 18, 6, 18, hair);
        for (let i = 0; i < 4; i++)
          p(facing === "left" ? 31 : 16, 20 + i * 4, 4, 3, lightHair);
        p(facing === "left" ? 30 : 15, 34, 6, 3, 0xd2ad71);
      } else {
        p(21, 14, 2, 3, 0x332c39);
        p(29, 14, 2, 3, 0x332c39);
        p(20, 19, 4, 2, 0xcb8e7c);
        p(29, 19, 4, 2, 0xcb8e7c);
        p(25, 22, 3, 1, 0x965e5b);
        p(33, 19, 5, 20, hair);
        for (let i = 0; i < 5; i++)
          p(33 + (i % 2), 19 + i * 4, 4, 3, lightHair);
        p(33, 37, 5, 3, 0xd2ad71);
      }
      p(side && facing === "left" ? 31 : 15, 9, 5, 2, 0xe2bd7d);
      p(22, 24, 8, 4, cream);
      p(25, 26, 3, 4, 0x8c6774);
      // Cross-body leather bag with brass clasp.
      if (!back) {
        for (let i = 0; i < 18; i++) p(17 + i, 27 + i, 2, 2, 0xa8805b);
        p(30, 39, 10, 9, 0x352e37);
        p(31, 39, 8, 7, 0x9b7450);
        p(34, 41, 2, 3, 0xe5bd7a);
      }
      // Activity frames reuse the same silhouette, clothing and directional palette.
      if ([5, 6, 10].includes(frame)) {
        p(12, 29, 23, 14, 0x372f3b);
        p(14, 30, 9, 11, 0xe4d3ae);
        p(24, 30, 9, 11, 0xc8b48f);
        p(23, 30, 1, 12, 0x89725f);
        p(11, 34, 4, 6, skin);
        p(33, 34, 4, 6, skin);
        p(16, 33, 5, 1, 0x9b8b77);
        p(26, 34, 5, 1, 0x9b8b77);
        if (frame === 6) {
          p(23, 28, 9, 13, 0xf0dfb8);
          p(23, 28, 2, 13, 0xa18c72);
        }
      }
      if (frame === 7) {
        p(10, 21, 5, 11, cream);
        p(11, 14, 4, 8, skin);
        p(13, 11, 5, 5, skin);
      }
      if (frame === 8) {
        p(4, 23, 11, 5, cream);
        p(0, 17, 5, 9, cream);
        p(0, 12, 4, 7, skin);
        p(34, 23, 10, 5, cream);
        p(42, 17, 5, 9, cream);
        p(44, 12, 4, 7, skin);
      }
      if (frame === 9) {
        p(31, 15, 6, 19, cream);
        p(31, 12, 5, 6, skin);
        p(32, 9, 9, 13, 0x926476);
        p(34, 10, 2, 10, 0xd2b785);
      }
      if (frame === 11) {
        p(11, 23, 8, 7, cream);
        p(8, 19, 5, 7, skin);
        p(8, 10, 2, 12, 0xe8dab8);
        p(10, 7, 3, 9, 0xe8dab8);
        p(28, 25, 7, 6, cream);
        p(31, 24, 5, 4, skin);
      }
      if (frame === 12) {
        p(12, 23, 8, 10, cream);
        p(28, 23, 8, 10, cream);
        p(12, 22, 7, 5, skin);
        p(29, 22, 7, 5, skin);
        p(14, 21, 3, 2, skin);
        p(31, 21, 3, 2, skin);
      }
      if (frame === 13) {
        p(13, 28, 23, 14, 0x3c3545);
        p(15, 28, 9, 12, 0xe0d0ac);
        p(25, 28, 9, 12, 0xc8b590);
        p(12, 32, 4, 7, skin);
        p(34, 32, 4, 7, skin);
      }
      g.generateTexture(key, 48, 64);
      g.destroy();
    }
}

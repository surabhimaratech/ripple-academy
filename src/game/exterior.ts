import Phaser from "phaser";
import type { Interior, Location } from "../domain/sessions";
import {
  localTimeOfDay,
  parallaxTarget,
  easeParallax,
  type TimeOfDay,
} from "./atmosphere";
const palettes = {
  morning: {
    sky: 0x99899e,
    haze: 0xe0c3aa,
    mountain: 0x77778b,
    far: 0x9b8c9b,
    stone: 0x9b817b,
    shade: 0x615365,
    roof: 0x566075,
    grass: 0x4c6a60,
    window: 0xddd3b2,
  },
  afternoon: {
    sky: 0x4f6b87,
    haze: 0xc1b1ad,
    mountain: 0x596b83,
    far: 0x7a8196,
    stone: 0x8e8285,
    shade: 0x4c4b62,
    roof: 0x34455f,
    grass: 0x3f6058,
    window: 0xe0cca0,
  },
  twilight: {
    sky: 0x534d70,
    haze: 0xb48e93,
    mountain: 0x3c435e,
    far: 0x625b77,
    stone: 0x817b87,
    shade: 0x515167,
    roof: 0x353e57,
    grass: 0x3d585d,
    window: 0xe4b978,
  },
  night: {
    sky: 0x202a45,
    haze: 0x62617e,
    mountain: 0x252f49,
    far: 0x3d4563,
    stone: 0x5d6177,
    shade: 0x363d57,
    roof: 0x2c354d,
    grass: 0x304b51,
    window: 0xf0c789,
  },
};
export function transition(
  scene: Phaser.Scene,
  next: Location,
  reduced: boolean,
) {
  if (scene.scene.key === next) return;
  if (reduced) {
    scene.scene.start(next);
    return;
  }
  if (scene.cameras.main.fadeEffect.isRunning) return;
  scene.cameras.main.fadeOut(260, 24, 27, 39);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () =>
    scene.scene.start(next),
  );
}
/** Six overscanned, independently rendered pixel-art layers; decorative motion never affects saved state. */
export class UniversityExterior extends Phaser.Scene {
  private layers: Phaser.GameObjects.Container[] = [];
  private animate: ((t: number) => void)[] = [];
  private clock = 0;
  private pointer = { x: 0, y: 0 };
  private eased = { x: 0, y: 0 };
  private lastMove = 0;
  private reduced = false;
  private intensity = 0.6;
  private hovered = "";
  private label!: Phaser.GameObjects.Text;
  private mode: TimeOfDay = "night";
  constructor() {
    super("university");
  }
  create() {
    this.layers = [];
    this.animate = [];
    this.clock = 0;
    this.reduced = !!this.registry.get("reduced");
    this.intensity = Number(this.registry.get("parallax") ?? 0.6);
    const setting = this.registry.get("day") ?? "system";
    this.mode =
      setting === "system" ? localTimeOfDay(new Date().getHours()) : setting;
    const p = palettes[this.mode];
    let seed = 14631;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    this.layers = Array.from({ length: 6 }, () => this.add.container());
    let g = this.add.graphics();
    this.layers[0].add(g);
    const r = (x: number, y: number, w: number, h: number, c: number, a = 1) =>
      g.fillStyle(c, a).fillRect(Math.round(x), Math.round(y), w, h);
    const poly = (xy: number[], c: number, a = 1) =>
      g.fillStyle(c, a).fillPoints(
        Array.from({ length: xy.length / 2 }, (_, i) => ({
          x: xy[i * 2],
          y: xy[i * 2 + 1],
        })),
        true,
      );
    const ellipse = (
      x: number,
      y: number,
      w: number,
      h: number,
      c: number,
      a = 1,
    ) => g.fillStyle(c, a).fillEllipse(x, y, w, h);
    const line = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      c: number,
      a = 1,
    ) => g.lineStyle(2, c, a).lineBetween(x, y, x2, y2);
    r(-80, -80, 1440, 880, p.sky);
    for (let i = 0; i < 8; i++)
      r(-80, 285 + i * 25, 1440, 26, p.haze, 0.026 + i * 0.009);
    const night = this.mode === "night" || this.mode === "twilight";
    for (let i = 0; i < 87; i++) {
      const x = rand() * 1390 - 50,
        y = rand() * 310 - 15;
      const star = this.add.rectangle(
        x,
        y,
        i % 9 === 0 ? 3 : 2,
        i % 9 === 0 ? 3 : 2,
        0xe8dfca,
        night ? 0.55 : 0.1,
      );
      this.layers[0].add(star);
      this.animate.push((t) => {
        star.alpha =
          (night ? 0.48 : 0.08) +
          Math.sin(t * 0.6 + i * 2.7) * (night ? 0.25 : 0.03);
      });
    }
    if (night) {
      ellipse(947, 124, 94, 94, 0xd2d0ca, 0.06);
      ellipse(947, 124, 71, 71, 0xd2d0ca, 0.08);
      ellipse(947, 124, 49, 49, 0xe7ddc2);
      ellipse(958, 116, 45, 45, p.sky);
    } else {
      ellipse(975, 135, 100, 100, 0xf1d7ac, 0.08);
      ellipse(975, 135, 42, 42, 0xe7d1ad);
    }
    g = this.add.graphics();
    this.layers[1].add(g);
    poly(
      [
        -70, 475, -70, 300, 12, 255, 88, 286, 193, 175, 290, 282, 384, 203, 501,
        285, 611, 166, 720, 252, 853, 150, 957, 275, 1080, 173, 1194, 267, 1350,
        195, 1350, 495,
      ],
      p.far,
    );
    poly(
      [
        -70, 499, -70, 371, 49, 304, 155, 361, 268, 268, 387, 380, 482, 289,
        609, 386, 743, 272, 899, 378, 1006, 291, 1134, 370, 1277, 288, 1350,
        324, 1350, 516,
      ],
      p.mountain,
    );
    for (const [x, y] of [
      [193, 175],
      [611, 166],
      [853, 150],
      [1080, 173],
    ])
      poly(
        [x - 18, y + 24, x, y, x + 29, y + 37, x + 6, y + 23, x - 3, y + 30],
        p.haze,
        0.22,
      );
    g = this.add.graphics();
    this.layers[2].add(g);
    for (let j = 0; j < 5; j++) {
      const cloud = this.add.graphics();
      this.layers[2].add(cloud);
      const x = -80 + j * 306,
        y = 72 + ((j * 53) % 140);
      for (let i = 0; i < 7; i++)
        cloud
          .fillStyle(p.haze, 0.035 + (j % 2) * 0.015)
          .fillRect(x + i * 28, y + (i % 3) * 5, 94, 12 + (i % 2) * 8);
      this.animate.push(
        (t) => (cloud.x = Math.round(Math.sin(t * 0.035 + j) * 24)),
      );
    }
    for (let j = 0; j < 3; j++) {
      const mist = this.add.rectangle(
        190 + j * 460,
        435 + j * 19,
        600,
        24,
        p.haze,
        0.05,
      );
      this.layers[2].add(mist);
      this.animate.push((t) => {
        mist.x = 190 + j * 460 + Math.sin(t * 0.025 + j) * 30;
      });
    }
    g = this.add.graphics();
    this.layers[3].add(g);
    const block = (x: number, y: number, w: number, h: number) => {
      r(x + 8, y + 8, w, h, 0x1c263c, 0.5);
      r(x, y, w, h, p.stone);
      r(x, y, 10, h, p.shade);
      r(x + w - 10, y, 10, h, p.shade);
      for (let yy = y + 8; yy < y + h - 4; yy += 13)
        for (let xx = x + 10; xx < x + w - 10; xx += 26) {
          const offset = (Math.floor((yy - y) / 13) % 2) * 12;
          r(xx + offset, yy, 21, 1, p.shade, 0.28);
          if (rand() < 0.17) r(xx + offset, yy + 3, 9, 4, p.haze, 0.1);
        }
      r(x - 5, y - 5, w + 10, 8, p.haze, 0.5);
      r(x + 4, y + 2, w - 8, 3, p.haze, 0.36);
      r(x - 6, y + h, w + 12, 9, p.shade);
    };
    const roof = (x: number, y: number, w: number, h: number) => {
      poly([x - 9, y + h, x + w * 0.5, y, x + w + 9, y + h], p.roof);
      line(x - 9, y + h, x + w * 0.5, y, p.haze, 0.6);
      line(x + w * 0.5, y, x + w + 9, y + h, p.haze, 0.4);
      for (let row = 1; row < Math.floor(h / 7); row++) {
        const yy = y + row * 7;
        const start = x + w * 0.5 - (row * 7 * w) / (h * 2),
          end = x + w * 0.5 + (row * 7 * w) / (h * 2);
        for (let xx = start + 2; xx < end - 7; xx += 14)
          r(xx, yy, 10, 1, p.stone, 0.24);
      }
      r(x - 12, y + h, w + 24, 6, 0x30364b);
      r(x - 10, y + h, w + 20, 2, p.haze, 0.45);
    };
    const window = (x: number, y: number, w: number, h: number, lit = true) => {
      poly(
        [
          x - 3,
          y + h,
          x - 3,
          y + 8,
          x + w * 0.5,
          y - 5,
          x + w + 3,
          y + 8,
          x + w + 3,
          y + h,
        ],
        p.shade,
      );
      poly(
        [
          x,
          y + h - 2,
          x,
          y + 8,
          x + w * 0.5,
          y - 1,
          x + w,
          y + 8,
          x + w,
          y + h - 2,
        ],
        lit ? p.window : 0x36425a,
      );
      r(x + w / 2 - 1, y + 6, 2, h - 7, p.shade);
      r(x, y + h * 0.57, w, 2, p.shade);
      r(x - 5, y + h, w + 10, 3, p.haze, 0.65);
      if (lit) {
        const glow = this.add.rectangle(
          x + w / 2,
          y + h * 0.5,
          w - 4,
          h - 7,
          p.window,
          0.15,
        );
        this.layers[3].add(glow);
        this.animate.push(
          (t) => (glow.alpha = 0.1 + Math.sin(t * 0.8 + x * 0.1) * 0.055),
        );
      }
    };
    const gable = (x: number, y: number, w: number, h: number) => {
      block(x, y + h * 0.35, w, h * 0.65);
      roof(x, y, w, h * 0.36);
      window(x + w / 2 - 8, y + h * 0.48, 16, 24, night);
    };
    // West library: a buttressed, many-gabled hall, leaded windows and an ivy-covered stair tower.
    block(228, 287, 438, 217);
    roof(220, 207, 454, 99);
    for (let i = 0; i < 5; i++) {
      const x = 254 + i * 78;
      gable(x, 248, 52, 72);
      window(x + 8, 351, 31, 68, night || i % 2 === 0);
      r(x + 2, 343, 44, 4, p.haze, 0.5);
      r(x + 3, 428, 40, 8, p.shade);
    }
    for (const x of [228, 318, 408, 498, 588, 654]) {
      r(x, 325, 12, 180, p.shade);
      r(x + 3, 327, 5, 177, p.haze, 0.42);
      poly([x - 5, 470, x + 17, 470, x + 23, 510, x - 11, 510], p.shade);
      r(x - 9, 508, 30, 5, p.stone);
    }
    block(151, 236, 90, 264);
    roof(140, 140, 112, 100);
    r(183, 124, 5, 28, p.haze);
    poly([185, 113, 192, 126, 179, 126], p.window);
    for (let y = 267; y < 470; y += 59)
      window(179, y, 30, 40, night || y === 385);
    r(145, 484, 103, 8, p.haze, 0.6);
    block(424, 195, 99, 118);
    roof(416, 115, 115, 85);
    window(458, 222, 30, 47, true);
    r(447, 279, 56, 5, p.shade);
    r(456, 174, 35, 11, p.stone);
    r(472, 99, 4, 21, p.haze);
    poly([474, 87, 483, 102, 466, 102], p.window);
    // Main entrance: recessed portal, carved stone bands and a book-and-star relief.
    block(405, 409, 129, 103);
    poly(
      [420, 511, 420, 452, 428, 432, 469, 416, 511, 432, 519, 452, 519, 511],
      p.shade,
    );
    poly(
      [429, 511, 429, 453, 437, 441, 469, 429, 503, 441, 510, 453, 510, 511],
      0x29344a,
    );
    r(440, 455, 60, 56, 0x51434a);
    for (let x = 446; x < 498; x += 9) r(x, 457, 2, 54, 0x83665a);
    r(468, 456, 3, 55, p.haze, 0.5);
    r(484, 481, 3, 6, p.window);
    r(452, 403, 35, 4, p.haze);
    r(459, 394, 21, 7, p.window);
    poly([468, 385, 472, 390, 468, 395, 464, 390], p.window);
    for (let i = 0; i < 5; i++)
      r(398 - i * 6, 512 + i * 6, 143 + i * 12, 6, [p.shade, p.stone][i % 2]);
    // An intimate eastern study wing: timber gables, dormer windows, chimney and a vine-covered balcony.
    block(752, 359, 257, 156);
    roof(741, 279, 280, 85);
    for (let i = 0; i < 3; i++) {
      const x = 775 + i * 74;
      gable(x, 300, 49, 66);
      window(x + 6, 399, 30, 43, true);
      window(x + 11, 465, 23, 33, night);
    }
    for (const x of [755, 833, 912, 997]) r(x, 366, 5, 144, 0x49404d);
    r(750, 448, 260, 6, 0x4c3d47);
    r(745, 451, 270, 3, p.haze, 0.5);
    r(812, 443, 130, 9, p.shade);
    r(814, 453, 128, 12, p.stone);
    for (let x = 819; x < 940; x += 11) r(x, 449, 3, 23, p.shade);
    r(969, 299, 20, 48, p.shade);
    r(966, 295, 26, 7, p.haze, 0.6);
    // A sheltered connecting arcade with six narrow arches.
    block(661, 401, 91, 106);
    for (let i = 0; i < 4; i++) {
      const x = 670 + i * 20;
      poly([x, 493, x, 435, x + 7, 427, x + 14, 435, x + 14, 493], 0x2c3549);
      r(x + 1, 492, 13, 3, p.haze, 0.4);
    }
    roof(659, 375, 95, 29);
    // Observatory: a copper dome, slit, balcony, polygonal base and narrow star windows.
    block(1060, 272, 102, 229);
    poly(
      [
        1054, 273, 1054, 233, 1063, 207, 1081, 188, 1112, 179, 1142, 188, 1160,
        207, 1170, 233, 1170, 273,
      ],
      0x587574,
    );
    for (let i = 0; i < 8; i++)
      r(
        1058 + i * 14,
        220 + (i < 4 ? 3 - i : i - 4) * -7,
        4,
        53 + (i % 3) * 5,
        0x78958b,
        0.7,
      );
    poly([1107, 183, 1116, 183, 1116, 270, 1107, 270], 0x26364b);
    r(1052, 269, 120, 9, p.haze, 0.7);
    r(1045, 280, 134, 9, p.shade);
    for (let x = 1051; x < 1175; x += 12) r(x, 279, 3, 24, p.haze, 0.55);
    r(1110, 158, 3, 24, p.haze);
    line(1098, 166, 1126, 166, p.haze);
    for (let y = 316; y < 469; y += 62) window(1095, y, 31, 42, night);
    r(1052, 497, 120, 11, p.shade);
    // A small covered passage toward the observatory.
    block(1008, 435, 53, 69);
    roof(1002, 406, 66, 34);
    window(1024, 453, 16, 28, true);
    // Ivy uses distinct small leaves, avoiding featureless facade silhouettes.
    for (const [x, y, length] of [
      [241, 302, 151],
      [647, 343, 137],
      [753, 381, 108],
      [1003, 363, 137],
      [1159, 305, 180],
    ])
      for (let i = 0; i < length / 7; i++) {
        const xx = x + Math.sin(i * 0.8) * 7,
          yy = y + i * 7;
        r(xx, yy, 2, 9, 0x415b55);
        r(xx - 6, yy + 3, 7, 5, i % 2 ? 0x64816b : 0x466957);
        r(xx + 1, yy + 7, 7, 4, i % 2 ? 0x466957 : 0x789077);
      }
    // Chimney smoke drifts independently from the building parallax.
    for (let i = 0; i < 6; i++) {
      const puff = this.add.rectangle(
        979,
        287 - i * 8,
        13 + i * 3,
        8,
        0xb8b2bd,
        0.12 - i * 0.012,
      );
      this.layers[3].add(puff);
      this.animate.push((t) => {
        const phase = (t * 0.18 + i / 6) % 1;
        puff.y = 291 - phase * 75;
        puff.x = 979 + Math.sin(phase * 3 + i) * 9;
        puff.alpha = (1 - phase) * 0.14;
      });
    }
    g = this.add.graphics();
    this.layers[4].add(g);
    r(-80, 541, 1440, 259, p.grass);
    poly(
      [
        -80, 513, 208, 492, 347, 533, 614, 530, 824, 510, 1120, 510, 1360, 537,
        1360, 585, -80, 585,
      ],
      p.grass,
    );
    poly([418, 536, 548, 536, 776, 800, 255, 800], 0x8d8182);
    poly([429, 540, 536, 540, 734, 800, 298, 800], 0xb2a293);
    for (let row = 0; row < 13; row++) {
      const y = 544 + row * 15;
      const left = 422 - row * 8,
        w = 124 + row * 18;
      r(left, y, w, 1, p.shade, 0.6);
      for (let x = left + 6 + (row % 2) * 16; x < left + w - 8; x += 33)
        r(x, y + 1, 1, 13, p.shade, 0.35);
    }
    // Low courtyard walls and planted beds.
    for (const [x, w] of [
      [-30, 367],
      [762, 557],
    ]) {
      r(x, 562, w, 20, 0x3b4856);
      r(x - 3, 556, w + 6, 7, p.stone);
      r(x + 3, 560, w - 6, 2, p.haze, 0.65);
      for (let bx = x + 14; bx < x + w - 10; bx += 37)
        r(bx, 565, 25, 1, p.haze, 0.15);
    }
    const tree = (x: number, y: number, size: number) => {
      r(x - 5 * size, y - 70 * size, 10 * size, 72 * size, 0x463e49);
      line(x, y - 47 * size, x - 29 * size, y - 83 * size, 0x554a50);
      line(x, y - 46 * size, x + 31 * size, y - 95 * size, 0x554a50);
      for (let i = 0; i < 77; i++) {
        const dx = (rand() - 0.5) * 100 * size,
          dy = rand() * 62 * size;
        r(
          x + dx - 9 * size,
          y - 132 * size + dy,
          (13 + rand() * 13) * size,
          (7 + rand() * 9) * size,
          [0x2b4b50, 0x355b58, 0x4b6a60, 0x647b69][i % 4],
        );
        r(
          x + dx - 6 * size,
          y - 133 * size + dy,
          7 * size,
          2 * size,
          0x829179,
          0.3,
        );
      }
    };
    tree(88, 595, 1.1);
    tree(1208, 588, 1.25);
    tree(711, 556, 0.7);
    tree(310, 562, 0.55);
    for (let i = 0; i < 70; i++) {
      const x = rand() * 1350 - 35,
        y = 584 + rand() * 155;
      if (x > 315 && x < 720) continue;
      r(x, y, 4, 2, 0x98a083, 0.4);
      if (i % 7 === 0) {
        r(x, y - 3, 2, 3, 0xb5a2a3, 0.65);
        r(x + 2, y - 3, 2, 2, 0xd2be9b, 0.6);
      }
    }
    const lantern = (x: number, y: number) => {
      r(x - 3, y - 54, 6, 56, 0x343b49);
      r(x - 8, y - 70, 16, 20, 0x283345);
      r(x - 5, y - 67, 10, 14, 0xe5c48a);
      r(x - 8, y - 53, 16, 4, 0x9e855f);
      poly([x - 11, y - 70, x, y - 79, x + 11, y - 70], 0x384151);
      for (let i = 4; i > 0; i--)
        ellipse(x, y - 58, 27 + i * 19, 23 + i * 14, p.window, 0.007);
      const flame = this.add.rectangle(x, y - 60, 7, 11, p.window, 0.85);
      this.layers[4].add(flame);
      this.animate.push(
        (t) => (flame.alpha = 0.75 + Math.sin(t * 3.7 + x) * 0.12),
      );
    };
    for (const [x, y] of [
      [357, 581],
      [769, 610],
      [232, 625],
      [1046, 584],
      [124, 523],
      [1154, 520],
    ])
      lantern(x, y);
    // Benches, a stone fountain and courtyard steps.
    for (const x of [174, 892]) {
      r(x, 611, 112, 10, 0x453f48);
      r(x + 8, 621, 7, 21, 0x72685d);
      r(x + 98, 621, 7, 21, 0x72685d);
      r(x - 2, 593, 116, 8, 0x927b62);
      r(x, 602, 112, 4, 0x8b735d);
    }
    ellipse(888, 564, 134, 29, p.shade);
    ellipse(888, 557, 137, 25, p.stone);
    ellipse(888, 552, 118, 18, 0x486071);
    r(880, 518, 16, 35, p.stone);
    ellipse(888, 517, 47, 14, p.haze, 0.6);
    r(885, 501, 6, 18, p.stone);
    r(887, 495, 2, 7, p.window, 0.7);
    g = this.add.graphics();
    this.layers[5].add(g);
    for (let i = 0; i < 15; i++) {
      const x = -25 + i * 20;
      poly(
        [x, 799, x + 20, 657 - (i % 4) * 12, x + 43, 799],
        i % 2 ? 0x304d4c : 0x243e45,
      );
      poly(
        [1280 - x, 799, 1260 - x, 651 - (i % 4) * 15, 1237 - x, 799],
        i % 2 ? 0x314c4a : 0x233c44,
      );
    }
    for (let i = 0; i < 18; i++) {
      const x = rand() * 1280,
        y = 570 + rand() * 165;
      const firefly = this.add.rectangle(
        x,
        y,
        2,
        2,
        night ? 0xe7d898 : 0xd3ba8f,
        0.45,
      );
      this.layers[5].add(firefly);
      this.animate.push((t) => {
        firefly.x = x + Math.sin(t * 0.45 + i) * 13;
        firefly.y = y + Math.cos(t * 0.3 + i * 2) * 9;
        firefly.alpha = 0.25 + Math.sin(t * 0.9 + i) * 0.22;
      });
    }
    const owl = this.add.graphics();
    this.layers[2].add(owl);
    owl
      .fillStyle(0x2c3248)
      .fillRect(-4, -2, 8, 5)
      .fillRect(-17, -5, 13, 3)
      .fillRect(4, -5, 13, 3)
      .fillRect(-8, -3, 16, 3);
    this.animate.push((t) => {
      const phase = (t + 17) % 78;
      owl.visible = phase < 7;
      if (owl.visible) {
        owl.x = -30 + (phase / 7) * 1340;
        owl.y = 135 + Math.sin(phase * 0.7) * 13;
        owl.scaleY = 0.6 + Math.sin(t * 6) * 0.3;
      }
    });
    this.label = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia",
        fontSize: "23px",
        color: "#ffe2ac",
        backgroundColor: "#292633",
        padding: { x: 15, y: 10 },
        align: "center",
      })
      .setDepth(50)
      .setOrigin(0.5)
      .setVisible(false);
    const destinations: {
      id: Interior;
      label: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }[] = [
      {
        id: "grand-library",
        label: "Grand Library",
        x: 440,
        y: 364,
        w: 414,
        h: 240,
      },
      {
        id: "personal-study",
        label: "Personal Study",
        x: 880,
        y: 420,
        w: 250,
        h: 185,
      },
      {
        id: "observatory",
        label: "Observatory",
        x: 1112,
        y: 333,
        w: 125,
        h: 320,
      },
    ];
    for (const d of destinations) {
      const highlight = this.add.graphics();
      const outline =
        d.id === "observatory"
          ? [
              1054, 501, 1054, 237, 1065, 207, 1081, 188, 1112, 179, 1142, 188,
              1160, 207, 1170, 237, 1170, 501,
            ]
          : d.id === "personal-study"
            ? [
                752, 515, 752, 364, 741, 364, 881, 279, 1021, 364, 1009, 364,
                1009, 515,
              ]
            : [
                228, 504, 228, 306, 220, 306, 447, 207, 674, 306, 666, 306, 666,
                504,
              ];
      highlight
        .fillStyle(0xffdca2, 0.075)
        .fillPoints(
          Array.from({ length: outline.length / 2 }, (_, i) => ({
            x: outline[i * 2],
            y: outline[i * 2 + 1],
          })),
          true,
        )
        .setVisible(false);
      this.layers[3].add(highlight);
      const zone = this.add
        .zone(d.x, d.y, d.w, d.h)
        .setInteractive({ useHandCursor: true });
      this.layers[3].add(zone);
      zone.on("pointerover", () => {
        this.hovered = d.id;
        highlight.visible = true;
        this.label
          .setText(d.label)
          .setPosition(d.x, Math.min(550, d.y + d.h / 2 + 20))
          .setVisible(true);
      });
      zone.on("pointerout", () => {
        this.hovered = "";
        highlight.visible = false;
        this.label.visible = false;
      });
      zone.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        if (pointer.event?.target === this.game.canvas)
          this.game.events.emit("university-go", d.id);
      });
    }
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      this.pointer = {
        x: (pointer.worldX - 640) / 640,
        y: (pointer.worldY - 360) / 360,
      };
      this.lastMove = this.clock;
    });
    this.input.on("gameout", () => {
      this.pointer = { x: 0, y: 0 };
      this.lastMove = this.clock - 7;
    });
    const navigate = (next: Location) => transition(this, next, this.reduced);
    const motion = (v: boolean) => (this.reduced = v);
    const intensity = (v: number) => (this.intensity = v);
    const day = () => this.scene.restart();
    this.game.events.on("world-location", navigate);
    this.game.events.on("room-motion", motion);
    this.game.events.on("world-parallax", intensity);
    this.game.events.on("world-day", day);
    this.events.once("shutdown", () => {
      this.game.events.off("world-location", navigate);
      this.game.events.off("room-motion", motion);
      this.game.events.off("world-parallax", intensity);
      this.game.events.off("world-day", day);
    });
    if (!this.reduced) this.cameras.main.fadeIn(450, 24, 27, 39);
    const desired = this.registry.get("location") ?? "university";
    if (desired !== "university")
      this.time.delayedCall(0, () => this.scene.start(desired));
  }
  update(_time: number, delta: number) {
    const dt = Math.min(delta / 1000, 0.05);
    if (!this.reduced) this.clock += dt;
    const target = parallaxTarget(
      this.pointer,
      this.clock,
      this.clock - this.lastMove,
      this.intensity,
      this.reduced,
    );
    this.eased = easeParallax(this.eased, target, dt);
    this.layers.forEach((layer, i) =>
      layer.setPosition(
        Math.round(
          this.eased.x * [0.7, 1.5, 2.5, 3.5, 5, 8][i] * this.intensity,
        ),
        Math.round(this.eased.y * [0.4, 0.7, 1, 1.5, 2, 3][i] * this.intensity),
      ),
    );
    if (!this.reduced) this.animate.forEach((fn) => fn(this.clock));
    if (
      this.registry.get("day") === "system" &&
      localTimeOfDay(new Date().getHours()) !== this.mode
    )
      this.scene.restart();
  }
}

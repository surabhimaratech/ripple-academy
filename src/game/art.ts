import Phaser from "phaser";
/** Original, deterministic procedural pixel artwork. No image downloads. */
export function paintLibrary(scene: Phaser.Scene, reduced: boolean) {
  const ambient: Phaser.Tweens.Tween[] = [];
  let seed = 417;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  let g = scene.add.graphics();
  const r = (x: number, y: number, w: number, h: number, c: number, a = 1) =>
    g.fillStyle(c, a).fillRect(Math.round(x), Math.round(y), w, h);
  const poly = (points: number[], c: number, a = 1) => {
    g.fillStyle(c, a).fillPoints(
      Array.from({ length: points.length / 2 }, (_, i) => ({
        x: points[i * 2],
        y: points[i * 2 + 1],
      })),
      true,
    );
  };
  const line = (
    x: number,
    y: number,
    x2: number,
    y2: number,
    c: number,
    a = 1,
  ) => g.lineStyle(2, c, a).lineBetween(x, y, x2, y2);
  const ellipse = (
    x: number,
    y: number,
    w: number,
    h: number,
    c: number,
    a = 1,
  ) => g.fillStyle(c, a).fillEllipse(x, y, w, h);
  const animate = (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
    const t = scene.tweens.add(config);
    if (reduced) t.pause();
    ambient.push(t);
  };
  r(0, 0, 1280, 720, 0x171925);
  r(0, 24, 1280, 350, 0x302c3a);
  // Uneven blocks, recessed wall panels and timber vaults.
  for (let y = 28; y < 362; y += 27)
    for (let x = -50; x < 1280; x += 74) {
      r(
        x + (y % 54 ? 34 : 0),
        y,
        71,
        24,
        [0x34303e, 0x36313e, 0x322e3b, 0x3a3340][Math.floor(random() * 4)],
      );
      r(x + 4, y + 2, 58, 1, 0x594451, 0.25);
    }
  for (const x of [16, 236, 441, 807, 1030, 1250]) {
    r(x - 9, 22, 26, 352, 0x211e2b);
    r(x - 5, 23, 16, 345, 0x644b48);
    r(x - 3, 32, 4, 330, 0x85604e);
    r(x - 15, 27, 39, 15, 0x9a7455);
    r(x - 15, 351, 40, 17, 0x9b7352);
  }
  poly([0, 0, 1280, 0, 1280, 34, 0, 34], 0x181923);
  r(0, 26, 1280, 5, 0x9c7351);
  r(0, 34, 1280, 7, 0x4f3940);
  for (const x of [0, 430, 860]) {
    poly(
      [x, 34, x + 210, 116, x + 420, 34, x + 420, 50, x + 210, 133, x, 50],
      0x211e2b,
    );
    line(x, 41, x + 210, 124, 0x765346);
    line(x + 210, 124, x + 420, 41, 0x765346);
  }
  const pointed = (x: number, y: number, w: number, h: number, c: number) =>
    poly(
      [
        x,
        y + h,
        x,
        y + w * 0.34,
        x + w * 0.12,
        y + w * 0.14,
        x + w * 0.5,
        y,
        x + w * 0.88,
        y + w * 0.14,
        x + w,
        y + w * 0.34,
        x + w,
        y + h,
      ],
      c,
    );
  const window = (x: number, y: number, w: number, h: number, moon = false) => {
    pointed(x - 10, y - 12, w + 20, h + 24, 0x1b1b2a);
    pointed(x - 4, y - 6, w + 8, h + 12, 0x928176);
    pointed(x, y, w, h, 0x4d5068);
    pointed(x + 8, y + 9, w - 16, h - 17, 0x202c47);
    // The painted night is contained inside the panes.
    for (let i = 0; i < 22; i++) {
      const sx = x + 20 + random() * (w - 40),
        sy = y + w * 0.47 + random() * (h - w * 0.5 - 12);
      r(sx, sy, 2, 2, 0xc3cbcf, 0.65);
      if (i % 7 === 0) {
        r(sx - 2, sy + 1, 6, 1, 0xc3cbcf, 0.3);
      }
    }
    if (moon) {
      g.fillStyle(0xa9b5c6, 0.08).fillCircle(x + w * 0.63, y + 87, 38);
      g.fillStyle(0xbcc4cf, 0.16).fillCircle(x + w * 0.63, y + 87, 28);
      g.fillStyle(0xe4dcc6).fillCircle(x + w * 0.63, y + 87, 21);
      g.fillStyle(0x202c47).fillCircle(x + w * 0.63 + 10, y + 81, 18);
    }
    // Distant silhouettes and misted rain-lit glass.
    for (let i = 0; i < 7; i++) {
      const sx = x + 9 + (i * (w - 18)) / 7;
      const sh = 11 + random() * 20;
      r(sx, y + h - sh - 10, (w - 18) / 7, sh, 0x283144);
      poly(
        [
          sx - 2,
          y + h - sh - 10,
          sx + w / 7 / 2,
          y + h - sh - 26,
          sx + w / 7,
          y + h - sh - 10,
        ],
        0x283144,
      );
    }
    for (let i = 0; i < 15; i++) {
      const sx = x + 17 + random() * (w - 34),
        sy = y + w * 0.48 + random() * (h - w * 0.5 - 35);
      const rain = scene.add.rectangle(sx, sy, 1, 6, 0x9fbbcf, 0.2);
      animate({
        targets: rain,
        y: sy + 17,
        alpha: 0.05,
        duration: 1000 + random() * 1600,
        repeat: -1,
      });
    }
    r(x + w / 2 - 4, y + 13, 8, h - 14, 0x968071);
    r(x + 8, y + h * 0.62, w - 16, 6, 0x968071);
    r(x + 9, y + h * 0.63, w - 18, 2, 0xb49a82);
    r(x + 2, y + h - 4, w - 4, 5, 0x614e56);
    r(x - 16, y + h + 3, w + 32, 9, 0xb19377);
    r(x - 10, y + h + 12, w + 20, 7, 0x564650);
    if (w > 200) {
      r(x + w * 0.25, y + 65, 4, h - 65, 0x6e6973);
      r(x + w * 0.75, y + 65, 4, h - 65, 0x6e6973);
    }
    // Cool moonlight spills over the warm planks.
    poly(
      [
        x + 10,
        y + h + 19,
        x + w - 10,
        y + h + 19,
        x + w + 90,
        518,
        x + 30,
        518,
      ],
      0xa1b4cf,
      0.035,
    );
  };
  window(460, 63, 340, 263, true);
  window(254, 90, 151, 226);
  window(849, 99, 154, 215);
  const book = (x: number, y: number, w: number, h: number, c: number) => {
    r(x, y, w, h, 0x191e28);
    r(x + 1, y + 1, w - 2, h - 2, c);
    r(x + 2, y + 2, 2, h - 4, 0xffffff, 0.13);
    r(x + 2, y + 5, w - 4, 2, 0xd1b580, 0.7);
    r(x + 2, y + h - 7, w - 4, 1, 0xd1b580, 0.6);
    if (w > 9) r(x + w / 2, y + h * 0.45, 2, 5, 0xe4c794, 0.4);
  };
  const shelf = (x: number, y: number, w: number, h: number, rows: number) => {
    r(x - 10, y - 8, w + 20, h + 22, 0x1d202a);
    r(x - 6, y - 11, w + 12, 11, 0xa47b54);
    r(x - 12, y - 15, w + 24, 5, 0x5f4440);
    r(x, y, w, h, 0x2a232c);
    r(x + 6, y + 5, w - 12, h - 10, 0x171e27);
    for (let row = 0; row < rows; row++) {
      const bottom = y + ((row + 1) * h) / rows - 8;
      const colors = [
        0x65716d, 0x946450, 0x725473, 0x797b8a, 0xa1845e, 0x4f6669, 0x9c756e,
      ];
      let bx = x + 9;
      while (bx < x + w - 15) {
        const bw = 6 + Math.floor(random() * 10),
          bh = 20 + Math.floor(random() * (h / rows - 27));
        if (random() < 0.14 && bx < x + w - 43) {
          const count = 2 + Math.floor(random() * 3);
          for (let k = 0; k < count; k++) {
            r(
              bx,
              bottom - 6 - k * 7,
              29 + k * 2,
              6,
              colors[(row + k) % colors.length],
            );
            r(bx + 2, bottom - 5 - k * 7, 24, 2, 0xc6af87);
          }
          bx += 36;
        } else {
          book(
            bx,
            bottom - bh,
            bw,
            bh,
            colors[Math.floor(random() * colors.length)],
          );
          bx += bw + 2;
        }
      }
      r(x + 3, bottom + 1, w - 6, 7, 0x926744);
      r(x + 3, bottom + 2, w - 6, 2, 0xba895a);
      r(x + 7, bottom + 8, w - 14, 3, 0x151c25, 0.8);
    }
    for (const dx of [0, w - 7]) {
      r(x + dx, y, 7, h + 6, 0x73513d);
      r(x + dx + 2, y, 2, h + 6, 0xb48a58);
    }
    r(x - 8, y + h + 5, w + 16, 12, 0x8e6546);
    r(x, y + h + 17, w, 6, 0x251f2b);
  };
  shelf(41, 113, 170, 242, 4);
  shelf(1045, 73, 86, 282, 5);
  // A botanical painting and a full-height paneled door reserve the next chapter.
  r(813, 157, 24, 64, 0x171e27);
  r(816, 160, 18, 58, 0xb18e58);
  r(820, 164, 10, 50, 0x223d3e);
  r(824, 179, 2, 27, 0xa3a07c);
  for (let i = 0; i < 4; i++) r(820 + (i % 2) * 6, 182 + i * 5, 4, 3, 0x829077);
  r(1145, 61, 88, 58, 0x1c1e2a);
  r(1149, 65, 80, 50, 0xb18a5c);
  r(1154, 70, 70, 40, 0x3a4655);
  poly([1154, 110, 1170, 89, 1185, 102, 1203, 79, 1224, 108], 0x7e827b);
  r(1212, 77, 6, 6, 0xd3c39f);
  r(1157, 103, 64, 4, 0x4a6668);
  pointed(1140, 138, 96, 245, 0x171c27);
  pointed(1145, 143, 86, 236, 0xa78c6d);
  pointed(1151, 151, 74, 226, 0x6d5150);
  pointed(1157, 157, 62, 218, 0x443540);
  for (let x = 1161; x < 1215; x += 12) r(x, 188, 2, 185, 0x765152);
  r(1162, 207, 51, 69, 0x322e3a);
  r(1166, 211, 43, 61, 0x594348);
  r(1162, 290, 51, 68, 0x322e3a);
  r(1166, 294, 43, 60, 0x594348);
  r(1202, 281, 5, 10, 0xd3b879);
  r(1168, 232, 39, 15, 0x202735);
  r(1173, 237, 29, 2, 0xae9877);
  r(1138, 379, 100, 7, 0xb29a7e);
  // Floor: staggered planks with knots, grain and nail heads.
  r(0, 368, 1280, 352, 0x2a2731);
  for (let row = 0; row < 18; row++) {
    const y = 373 + row * 20;
    for (let col = -1; col < 10; col++) {
      const x = col * 147 + (row % 2 ? 73 : 0);
      r(
        x,
        y,
        145,
        18,
        [0x61483f, 0x654a41, 0x5c4340, 0x6b4e43, 0x59423e][
          Math.floor(random() * 5)
        ],
      );
      r(x + 2, y, 140, 1, 0xa17858, 0.4);
      for (let j = 0; j < 3; j++) {
        const gx = x + 8 + random() * 98;
        const gy = y + 4 + random() * 10;
        r(gx, gy, 12 + Math.floor(random() * 34), 1, 0x342f33, 0.45);
      }
      r(x + 5, y + 4, 2, 2, 0x2a2931, 0.6);
      if (random() < 0.2) ellipse(x + 67, y + 11, 13, 4, 0x352d32, 0.45);
    }
  }
  // Moonlight crosses the floor after the boards are painted.
  poly([470, 374, 788, 374, 1006, 619, 590, 619], 0x9db3d0, 0.055);
  poly([265, 374, 393, 374, 445, 465, 307, 465], 0xa5b6cc, 0.04);
  for (const [x, y, w, h] of [
    [632, 413, 360, 100],
    [287, 493, 180, 75],
    [151, 494, 180, 100],
  ]) {
    ellipse(x, y, w, h, 0xe6a568, 0.025);
    ellipse(x, y, w * 0.7, h * 0.7, 0xf4b776, 0.025);
  }
  r(0, 359, 1280, 8, 0x191e29);
  r(0, 367, 1280, 6, 0xb18b64);
  // Long velvet curtains frame the central window in irregular folds.
  for (const [x, flip] of [
    [439, 1],
    [806, -1],
  ]) {
    poly(
      [
        x,
        52,
        x + flip * 22,
        58,
        x + flip * 29,
        281,
        x + flip * 4,
        321,
        x - flip * 14,
        325,
        x - flip * 10,
        180,
      ],
      0x4e354b,
    );
    line(x + flip * 6, 65, x + flip * 15, 285, 0x785068);
    r(x - 8, 270, 25, 6, 0xb38d5d);
  }
  // A richly woven rug with stepped edges, diamonds and tiny embroidery.
  r(378, 470, 496, 179, 0x2b2433);
  r(383, 474, 486, 170, 0xba8665);
  r(390, 480, 472, 158, 0x4e354b);
  r(399, 489, 454, 140, 0x927064);
  r(404, 494, 444, 130, 0x5c4056);
  r(416, 505, 420, 108, 0x64475e);
  for (let x = 394; x < 863; x += 12) {
    r(x, 466, 2, 8, 0xc69a78);
    r(x, 645, 2, 8, 0xc69a78);
  }
  for (let x = 411; x < 842; x += 22) {
    poly([x, 495, x + 5, 501, x, 507, x - 5, 501], 0xd3a779);
    poly([x, 612, x + 5, 618, x, 624, x - 5, 618], 0xd3a779);
  }
  for (const x of [468, 625, 782]) {
    poly([x, 521, x + 46, 558, x, 599, x - 46, 558], 0x9d746e);
    poly([x, 530, x + 32, 558, x, 589, x - 32, 558], 0x49384e);
    poly([x, 542, x + 16, 558, x, 575, x - 16, 558], 0xc19a79);
    r(x - 3, 552, 6, 12, 0x6d595f);
  }
  const plant = (x: number, y: number, size = 1) => {
    ellipse(x, y + 4, 40 * size, 10 * size, 0x1b2230, 0.4);
    r(x - 13 * size, y - 26 * size, 26 * size, 25 * size, 0x986c54);
    r(x - 17 * size, y - 30 * size, 34 * size, 7 * size, 0xc0926a);
    r(x - 9 * size, y - 22 * size, 5 * size, 19 * size, 0xc08b5b);
    for (let i = 0; i < 8; i++) {
      const dx = (i % 2 ? 1 : -1) * (8 + random() * 17) * size,
        dy = (34 + i * 6) * size;
      line(x, y - 27 * size, x + dx, y - dy, 0x526452);
      poly(
        [
          x + dx,
          y - dy,
          x + dx + (i % 2 ? 10 : -10) * size,
          y - dy - 6 * size,
          x + dx + 7 * size,
          y - dy - 15 * size,
          x + dx - 4 * size,
          y - dy - 12 * size,
        ],
        i % 2 ? 0x6d8062 : 0x839177,
      );
    }
  };
  plant(395, 388, 1.2);
  plant(864, 350, 0.75);
  plant(64, 590, 1.5);
  plant(1228, 509, 1.2);
  const candle = (x: number, y: number) => {
    r(x - 9, y, 20, 4, 0x9b784d);
    r(x - 3, y - 6, 7, 8, 0xceb076);
    r(x - 2, y - 28, 5, 24, 0xe6d2a1);
    r(x + 3, y - 27, 2, 7, 0xa38b6c);
    for (let i = 5; i > 0; i--)
      ellipse(x, y - 26, 16 + i * 17, 13 + i * 13, 0xe8a269, 0.009 * (6 - i));
    const glow = scene.add.circle(x, y - 30, 18, 0xffcc83, 0.055);
    const flame = scene.add.rectangle(x, y - 32, 4, 8, 0xffd88e);
    scene.add.rectangle(x, y - 31, 2, 4, 0xffefd1);
    animate({
      targets: [flame, glow],
      alpha: 0.5,
      duration: 420 + random() * 340,
      yoyo: true,
      repeat: -1,
    });
  };
  const openBook = (x: number, y: number) => {
    poly(
      [
        x,
        y + 3,
        x + 21,
        y,
        x + 42,
        y + 3,
        x + 42,
        y + 20,
        x + 21,
        y + 17,
        x,
        y + 20,
      ],
      0x3e2a35,
    );
    poly(
      [x + 2, y + 1, x + 20, y - 2, x + 20, y + 14, x + 2, y + 17],
      0xe0c59a,
    );
    poly(
      [x + 22, y - 2, x + 40, y + 1, x + 40, y + 17, x + 22, y + 14],
      0xcbb68d,
    );
    for (let i = 0; i < 4; i++) {
      r(x + 5, y + 3 + i * 3, 12, 1, 0x9e8c77);
      r(x + 25, y + 3 + i * 3, 11, 1, 0x9e8c77);
    }
    r(x + 20, y - 1, 2, 18, 0x86705e);
    r(x + 24, y + 16, 3, 8, 0x8b5665);
  };
  g = scene.add.graphics().setDepth(526);
  // The reading nook: a tufted chair, footstool, tea and a scattered stack.
  ellipse(158, 520, 166, 37, 0x1d2330, 0.38);
  r(108, 442, 88, 65, 0x261f2c);
  r(111, 429, 80, 65, 0x3e3445);
  r(118, 420, 66, 60, 0x765967);
  r(123, 424, 56, 48, 0x8b6975);
  for (const [x, y] of [
    [132, 437],
    [166, 437],
    [148, 458],
  ]) {
    r(x, y, 3, 3, 0x4d3b4c);
    r(x - 2, y - 1, 7, 1, 0x9c7a83);
  }
  r(100, 472, 21, 42, 0x503e50);
  r(184, 472, 21, 42, 0x503e50);
  r(103, 469, 17, 9, 0xad8182);
  r(185, 469, 17, 9, 0xad8182);
  r(120, 478, 63, 27, 0x9b7782);
  r(124, 481, 55, 8, 0xb68c91);
  r(112, 510, 8, 16, 0xa48059);
  r(185, 510, 8, 16, 0xa48059);
  g = scene.add.graphics().setDepth(561);
  r(126, 534, 64, 16, 0x684c5d);
  r(132, 550, 7, 11, 0x342c34);
  r(179, 550, 7, 11, 0x342c34);
  r(129, 532, 58, 7, 0xa17a83);
  g = scene.add.graphics().setDepth(534);
  // Side table with tea, candle and a closed novel.
  ellipse(289, 506, 100, 21, 0x242431, 0.4);
  r(267, 493, 7, 41, 0x3a2f32);
  r(310, 493, 7, 41, 0x3a2f32);
  ellipse(291, 486, 100, 32, 0x342731);
  ellipse(291, 481, 100, 30, 0xa47b55);
  ellipse(291, 479, 88, 23, 0xb89365);
  r(277, 470, 22, 9, 0xe5cfa8);
  r(281, 468, 15, 5, 0x705143);
  r(298, 473, 6, 5, 0xe5cfa8);
  book(258, 460, 12, 22, 0x63777a);
  candle(315, 474);
  const steam = scene.add
    .text(282, 449, "⌇", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#d3c2ae",
    })
    .setAlpha(0.35);
  animate({ targets: steam, y: 440, alpha: 0.05, duration: 2600, repeat: -1 });
  g = scene.add.graphics().setDepth(454);
  // Writing desk, carved legs, brass handles and papers.
  ellipse(632, 430, 270, 35, 0x242331, 0.45);
  r(518, 394, 14, 60, 0x3d2b31);
  r(725, 394, 14, 60, 0x3d2b31);
  r(521, 396, 5, 54, 0x98704c);
  r(727, 396, 5, 54, 0x98704c);
  r(508, 367, 244, 52, 0x4f3735);
  r(516, 377, 228, 37, 0x72503c);
  for (const x of [525, 640]) {
    r(x, 382, 101, 25, 0x503b35);
    r(x + 3, 384, 95, 2, 0x99724c);
    r(x + 41, 394, 18, 4, 0xd4b777);
  }
  r(499, 359, 262, 15, 0xbb905e);
  r(503, 356, 254, 6, 0xd0a66b);
  r(508, 349, 244, 8, 0x876249);
  openBook(572, 334);
  // Rolled parchment, ink pot, quill and a brass lamp.
  r(636, 339, 42, 12, 0xd8bb8b);
  r(632, 338, 6, 14, 0xa88969);
  r(673, 338, 6, 14, 0xefdaa8);
  r(643, 341, 24, 2, 0x9e8268);
  r(689, 337, 12, 13, 0x303c48);
  r(691, 333, 8, 5, 0x777274);
  line(696, 337, 714, 302, 0xd9c99e);
  poly([700, 327, 701, 312, 716, 297, 713, 313], 0xd9d2b7);
  r(695, 347, 6, 1, 0xb49a6c);
  candle(541, 351);
  candle(724, 351);
  g = scene.add.graphics().setDepth(473);
  // Desk chair, placed behind the heroine when seated.
  r(608, 416, 50, 44, 0x382d37);
  r(614, 419, 38, 30, 0x6b596c);
  r(614, 455, 5, 18, 0x9e7852);
  r(649, 455, 5, 18, 0x9e7852);
  g = scene.add.graphics().setDepth(521);
  // Right loveseat, an abandoned scarf, and a little oval portrait.
  ellipse(1027, 510, 196, 32, 0x20232d, 0.4);
  r(946, 437, 154, 58, 0x3b3442);
  r(955, 420, 135, 67, 0x456061);
  r(960, 425, 125, 54, 0x5a7270);
  r(968, 431, 2, 43, 0x718681);
  r(1018, 429, 2, 42, 0x3f595d);
  r(1075, 431, 2, 43, 0x718681);
  r(936, 464, 24, 42, 0x324b50);
  r(1084, 464, 28, 42, 0x324b50);
  r(939, 459, 19, 10, 0x7a8c80);
  r(1087, 459, 22, 10, 0x7a8c80);
  r(960, 477, 123, 26, 0x6c8279);
  r(1019, 478, 3, 23, 0x354f53);
  r(943, 506, 8, 15, 0x9b7b53);
  r(1096, 506, 8, 15, 0x9b7b53);
  r(1062, 448, 17, 56, 0x98777d);
  r(1067, 450, 3, 53, 0xc0978e);
  for (let x = 1062; x < 1079; x += 3) r(x, 502, 1, 9, 0xb99487);
  g = scene.add.graphics().setDepth(613);
  // Personal chest: metal-bound walnut, gems and a folded blanket nearby.
  ellipse(1018, 610, 146, 25, 0x1f2330, 0.4);
  r(964, 573, 108, 35, 0x3a2b30);
  r(964, 563, 108, 16, 0x6f503c);
  r(970, 556, 96, 8, 0x896345);
  r(978, 552, 80, 4, 0xa47f54);
  r(966, 581, 104, 3, 0xc19960);
  for (const x of [976, 1053]) {
    r(x, 557, 7, 49, 0x8f805a);
    r(x + 1, 559, 2, 45, 0xc2b17c);
  }
  r(1010, 576, 16, 16, 0xd0b479);
  r(1016, 581, 4, 7, 0x38323b);
  r(966, 606, 7, 7, 0x2a2631);
  r(1064, 606, 7, 7, 0x2a2631);
  r(1114, 563, 42, 10, 0x756283);
  r(1118, 553, 40, 10, 0xa08489);
  r(1120, 555, 35, 2, 0xc5a19c);
  r(1134, 542, 23, 11, 0x4d6f71);
  r(1136, 543, 19, 3, 0xc8b68d);
  g = scene.add.graphics().setDepth(406);
  // Brass telescope decoration and a tiny globed atlas stand (no new room).
  r(898, 364, 5, 38, 0xb08c5b);
  line(900, 385, 885, 406, 0xb08c5b);
  line(900, 385, 916, 406, 0xb08c5b);
  ellipse(900, 352, 30, 31, 0x364c59);
  ellipse(900, 352, 22, 29, 0x5f7977);
  r(890, 346, 8, 9, 0xa69c73);
  r(902, 355, 8, 10, 0x899474);
  g.lineStyle(2, 0xc09d68).strokeEllipse(900, 352, 39, 36);
  g = scene.add.graphics().setDepth(0);
  // Candles, wall sconces and a few firefly-like dust motes.
  for (const [x, y] of [
    [226, 227],
    [424, 209],
    [829, 209],
    [1027, 183],
    [1180, 263],
  ]) {
    r(x - 6, y - 3, 12, 15, 0x8f7753);
    r(x - 12, y + 8, 24, 5, 0xb39463);
    candle(x, y);
  }
  if (!reduced)
    for (let i = 0; i < 28; i++) {
      const x = 140 + random() * 990,
        y = 160 + random() * 450;
      const dust = scene.add.rectangle(x, y, 2, 2, 0xefcc92, 0.22);
      animate({
        targets: dust,
        y: y - 22,
        alpha: 0.6,
        duration: 3200 + random() * 2600,
        yoyo: true,
        repeat: -1,
      });
    }
  // Foreground shelves, hanging ivy and scattered books give the room depth.
  const foreground = scene.add.graphics().setDepth(900);
  const f = (x: number, y: number, w: number, h: number, c: number) =>
    foreground.fillStyle(c).fillRect(x, y, w, h);
  f(-14, 652, 230, 68, 0x1a202b);
  f(-14, 649, 234, 11, 0x8d6648);
  f(4, 665, 209, 55, 0x312935);
  for (let i = 0; i < 15; i++) {
    const h = 23 + random() * 22;
    f(10 + i * 13, 714 - h, 9, h, [0x4b6366, 0x6a495c, 0x97785b][i % 3]);
    f(11 + i * 13, 717 - h, 7, 2, 0xb49a6b);
  }
  f(0, 708, 217, 8, 0x6c4d3d);
  f(1172, 655, 108, 65, 0x242731);
  f(1170, 652, 110, 10, 0x8a6349);
  for (let i = 0; i < 7; i++) {
    f(
      1180 + i * 14,
      677,
      9,
      39 - (i % 3) * 5,
      [0x775b6b, 0x5c7371, 0x947251][i % 3],
    );
    f(1181 + i * 14, 683, 7, 2, 0xb7a173);
  }
  for (let i = 0; i < 19; i++) {
    const x = 18 + i * 7,
      y = 32 + Math.sin(i * 0.6) * 16 + i * 4;
    f(x, y, 9, 6, i % 2 ? 0x536752 : 0x718367);
    f(x + 2, y - 4, 5, 5, 0x718367);
  }
  for (let i = 0; i < 15; i++) {
    const x = 1270 - i * 5,
      y = 18 + i * 9;
    f(x, y, 9, 7, i % 2 ? 0x455b51 : 0x64775c);
  }
  // Soft vignette built from stepped translucent bands, keeping the artwork pixel based.
  for (let i = 0; i < 6; i++) {
    r(0, i * 5, 1280, 5, 0x111722, 0.045 * (6 - i));
    r(0, 720 - (i + 1) * 4, 1280, 4, 0x111722, 0.05 * (6 - i));
  }
  return ambient;
}

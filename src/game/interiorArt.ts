import Phaser from "phaser";
/** Shared original pixel drawing vocabulary for the two new intimate rooms. */
export function paintInterior(
  scene: Phaser.Scene,
  kind: "personal-study" | "observatory",
  reduced: boolean,
) {
  const ambient: Phaser.Tweens.Tween[] = [];
  let g = scene.add.graphics();
  let seed = 2027;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
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
  const e = (x: number, y: number, w: number, h: number, c: number, a = 1) =>
    g.fillStyle(c, a).fillEllipse(x, y, w, h);
  const line = (x: number, y: number, x2: number, y2: number, c: number) =>
    g.lineStyle(2, c).lineBetween(x, y, x2, y2);
  const animate = (config: Phaser.Types.Tweens.TweenBuilderConfig) => {
    const t = scene.tweens.add(config);
    if (reduced) t.pause();
    ambient.push(t);
  };
  r(0, 0, 1280, 720, 0x20232f);
  r(0, 24, 1280, 344, kind === "personal-study" ? 0x3c3340 : 0x303749);
  for (let y = 30; y < 365; y += 29)
    for (let x = -30; x < 1280; x += 74) {
      r(
        x + (y % 58 ? 35 : 0),
        y,
        71,
        26,
        [0x403742, 0x39333f, 0x453942][Math.floor(rand() * 3)],
      );
      r(x + 5, y + 3, 60, 1, 0x7c5b57, 0.25);
    }
  const book = (x: number, y: number, w: number, h: number, c: number) => {
    r(x, y, w, h, 0x252534);
    r(x + 1, y + 1, w - 2, h - 2, c);
    r(x + 2, y + 5, w - 4, 2, 0xd2b687);
    r(x + 2, y + h - 6, w - 4, 1, 0xbca478);
    r(x + 2, y + 2, 1, h - 3, 0xd8c0a0, 0.3);
  };
  const shelf = (x: number, y: number, w: number, h: number) => {
    r(x - 7, y - 8, w + 14, h + 20, 0x211e2b);
    r(x - 10, y - 11, w + 20, 9, 0xa17b55);
    r(x, y, w, h, 0x171e29);
    for (let row = 0; row < 4; row++) {
      const bottom = y + ((row + 1) * h) / 4 - 5;
      let bx = x + 9;
      while (bx < x + w - 13) {
        const bw = 6 + Math.floor(rand() * 10),
          bh = 20 + Math.floor(rand() * (h / 4 - 28));
        book(
          bx,
          bottom - bh,
          bw,
          bh,
          [0x7d6179, 0x7c867c, 0x9c7758, 0x546c79, 0xa07e7c][
            Math.floor(rand() * 5)
          ],
        );
        bx += bw + 2;
      }
      r(x, bottom, w, 6, 0xa17a50);
      r(x, bottom + 2, w, 1, 0xcd9b65);
    }
    r(x, y, 6, h, 0xb08a5d);
    r(x + w - 6, y, 6, h, 0x8d674c);
    r(x - 5, y + h, w + 10, 10, 0x956d4c);
  };
  const window = (x: number, y: number, w: number, h: number) => {
    poly(
      [
        x - 10,
        y + h + 10,
        x - 10,
        y + 40,
        x + w / 2,
        y - 15,
        x + w + 10,
        y + 40,
        x + w + 10,
        y + h + 10,
      ],
      0x211e2e,
    );
    poly(
      [x, y + h, x, y + 45, x + w / 2, y, x + w, y + 45, x + w, y + h],
      0x8d8191,
    );
    poly(
      [
        x + 9,
        y + h - 9,
        x + 9,
        y + 49,
        x + w / 2,
        y + 12,
        x + w - 9,
        y + 49,
        x + w - 9,
        y + h - 9,
      ],
      0x202e4d,
    );
    for (let i = 0; i < 34; i++) {
      const sx = x + 19 + rand() * (w - 38),
        sy = y + 64 + rand() * (h - 85);
      r(sx, sy, 2, 2, 0xd8d8c9, 0.7);
    }
    e(x + w * 0.73, y + 88, 36, 36, 0xddd6bc);
    e(x + w * 0.73 + 10, y + 82, 34, 34, 0x202e4d);
    r(x + w / 2 - 3, y + 16, 6, h - 16, 0xa08d8d);
    r(x + 9, y + h * 0.66, w - 18, 5, 0xa08d8d);
    r(x - 13, y + h, w + 26, 10, 0xb99c7c);
    r(x - 8, y + h + 10, w + 16, 8, 0x675566);
  };
  if (kind === "personal-study") {
    window(435, 69, 385, 256);
    shelf(44, 104, 169, 245);
    shelf(1041, 87, 166, 255);
    r(265, 126, 117, 148, 0xb4936c);
    r(272, 133, 103, 134, 0x4d4853);
    for (let i = 0; i < 5; i++) {
      r(
        282 + (i % 2) * 43,
        149 + Math.floor(i / 2) * 35,
        31,
        24,
        i % 2 ? 0xcabda2 : 0xa99aa0,
      );
      r(287 + (i % 2) * 43, 155 + Math.floor(i / 2) * 35, 21, 2, 0x6f6a70);
    }
    r(292, 294, 63, 28, 0x644c51);
    r(299, 301, 49, 14, 0xd3b785);
  } else {
    window(285, 32, 710, 298);
    shelf(1040, 106, 170, 243);
    r(43, 95, 193, 227, 0x967953);
    r(50, 102, 179, 213, 0x29364d);
    for (let i = 0; i < 30; i++) {
      const x = 63 + rand() * 150,
        y = 115 + rand() * 178;
      r(x, y, 2, 2, 0xd9c79c);
      if (i % 4 === 0) line(x, y, x + 9, y - 13, 0x9f9a93);
    }
    g.lineStyle(2, 0xa8a5ab, 0.6).strokeCircle(138, 206, 64);
    g.lineStyle(1, 0xa8a5ab, 0.4).strokeCircle(138, 206, 45);
    r(70, 290, 132, 2, 0xa99783);
  }
  for (const x of [18, 235, 418, 832, 1024, 1247]) {
    r(x, 29, 12, 338, 0x251f2d);
    r(x + 3, 31, 4, 333, 0x8c6550);
    r(x - 5, 32, 22, 9, 0xb18a59);
  }
  r(0, 21, 1280, 10, 0x9f7954);
  r(0, 32, 1280, 6, 0x3f303b);
  r(0, 368, 1280, 352, 0x302b35);
  for (let row = 0; row < 18; row++)
    for (let col = -1; col < 10; col++) {
      const x = col * 145 + (row % 2 ? 70 : 0),
        y = 373 + row * 20;
      r(
        x,
        y,
        143,
        18,
        [0x60463e, 0x6b4c42, 0x59433d, 0x725244][Math.floor(rand() * 4)],
      );
      r(x + 3, y + 1, 136, 1, 0xae825d, 0.3);
      for (let j = 0; j < 3; j++)
        r(
          x + 8 + rand() * 70,
          y + 4 + rand() * 10,
          12 + rand() * 46,
          1,
          0x392c33,
          0.5,
        );
    }
  r(0, 359, 1280, 9, 0x24232d);
  r(0, 368, 1280, 5, 0xb28a64);
  r(365, 507, 494, 151, 0xb29272);
  r(372, 514, 480, 137, kind === "personal-study" ? 0x51445b : 0x344c60);
  r(381, 523, 462, 119, 0x9e7c75);
  r(387, 529, 450, 107, kind === "personal-study" ? 0x6c526d : 0x465e70);
  for (let x = 397; x < 832; x += 24) {
    poly([x, 533, x + 5, 540, x, 547, x - 5, 540], 0xd3b589);
    poly([x, 619, x + 5, 626, x, 633, x - 5, 626], 0xd3b589);
  }
  for (const x of [460, 610, 760]) {
    poly([x, 551, x + 31, 583, x, 615, x - 31, 583], 0xb69a87);
    poly([x, 560, x + 22, 583, x, 607, x - 22, 583], 0x4c435c);
    r(x - 3, 577, 6, 13, 0xcfbb96);
  }
  const openBook = (x: number, y: number) => {
    poly(
      [
        x,
        y,
        x + 22,
        y - 4,
        x + 45,
        y,
        x + 45,
        y + 18,
        x + 22,
        y + 14,
        x,
        y + 18,
      ],
      0xd6c39e,
    );
    r(x + 21, y - 3, 2, 20, 0x867462);
    for (let i = 0; i < 4; i++) {
      r(x + 4, y + 2 + i * 3, 12, 1, 0x9e8b77);
      r(x + 27, y + 2 + i * 3, 12, 1, 0x9e8b77);
    }
  };
  const candle = (x: number, y: number) => {
    r(x - 8, y, 18, 4, 0xb18b58);
    r(x - 2, y - 22, 5, 22, 0xe6d0a0);
    for (let i = 4; i > 0; i--)
      e(x, y - 21, 40 + i * 20, 30 + i * 15, 0xe7ad76, 0.014);
    const flame = scene.add
      .rectangle(x, y - 27, 4, 8, 0xffd696)
      .setDepth(g.depth + 1);
    animate({
      targets: flame,
      alpha: 0.5,
      duration: 400 + rand() * 320,
      yoyo: true,
      repeat: -1,
    });
  };
  const chair = (x: number, y: number) => {
    g = scene.add.graphics().setDepth(y + 88);
    e(x + 43, y + 80, 125, 28, 0x222531, 0.4);
    r(x, y + 5, 86, 73, 0x443647);
    r(x + 7, y - 6, 72, 67, 0x806475);
    r(x + 13, y, 60, 49, 0x9a7c8b);
    for (const dx of [24, 56]) r(x + dx, y + 18, 3, 3, 0x514252);
    r(x - 7, y + 48, 20, 33, 0x60495c);
    r(x + 74, y + 48, 20, 33, 0x60495c);
    r(x + 13, y + 52, 61, 25, 0xa68b98);
    r(x + 1, y + 81, 7, 17, 0xa1845f);
    r(x + 79, y + 81, 7, 17, 0xa1845f);
  };
  if (kind === "personal-study") {
    g = scene.add.graphics().setDepth(454);
    e(553, 437, 282, 35, 0x252430, 0.4);
    r(431, 390, 13, 64, 0x7f5b43);
    r(702, 390, 13, 64, 0x7f5b43);
    r(420, 355, 305, 63, 0x73513e);
    r(414, 350, 318, 14, 0xc29a67);
    for (const x of [438, 578]) {
      r(x, 377, 124, 30, 0x4c3938);
      r(x + 46, 389, 23, 4, 0xc4a56e);
    }
    r(531, 307, 80, 45, 0x222734);
    r(535, 311, 72, 35, 0x42596c);
    for (let i = 0; i < 6; i++) {
      r(
        541 + (i % 2) * 9,
        317 + i * 4,
        18 + rand() * 30,
        2,
        i % 2 ? 0xc2afce : 0x8fbbad,
      );
    }
    poly([531, 352, 611, 352, 628, 365, 515, 365], 0x7e8490);
    for (let x = 532; x < 610; x += 8) r(x, 356, 5, 2, 0x343e50);
    r(566, 361, 19, 3, 0xa6a7ad);
    openBook(640, 335);
    r(456, 331, 41, 23, 0xcab79d);
    r(460, 335, 31, 2, 0x8c7b72);
    r(461, 342, 21, 2, 0x8c7b72);
    r(695, 329, 12, 20, 0x55465f);
    line(701, 334, 716, 307, 0xe2d1ae);
    r(477, 320, 7, 29, 0xc7a365);
    r(465, 343, 32, 5, 0xb49360);
    poly([455, 319, 464, 292, 496, 292, 507, 319], 0xbca478);
    poly([458, 319, 506, 319, 523, 352, 441, 352], 0xf1cf88, 0.065);
    r(469, 292, 25, 3, 0xe4c68e);
    g = scene.add.graphics().setDepth(473);
    r(529, 416, 48, 42, 0x3d3444);
    r(535, 420, 36, 29, 0x718482);
    r(533, 458, 5, 16, 0x9e7e55);
    r(568, 458, 5, 16, 0x9e7e55);
    chair(110, 431);
    g = scene.add.graphics().setDepth(590);
    e(1042, 576, 265, 34, 0x252430, 0.5);
    r(927, 420, 230, 139, 0x543e42);
    r(919, 405, 16, 166, 0xa9825e);
    r(1149, 405, 16, 166, 0xa9825e);
    r(927, 422, 228, 13, 0xc09b73);
    r(939, 435, 198, 109, 0xd1bea5);
    r(943, 443, 190, 39, 0xeee0bf);
    r(948, 447, 76, 26, 0xb2a6b8);
    r(1050, 447, 76, 26, 0xafa3b6);
    r(937, 480, 203, 70, 0x6b5b76);
    for (let x = 943; x < 1135; x += 21) {
      r(x, 486, 3, 55, 0xa68c9e);
      r(x, 504, 18, 3, 0x938196);
    }
    r(927, 550, 229, 12, 0x99704f);
    r(922, 561, 11, 24, 0x4c3b3d);
    r(1150, 561, 10, 24, 0x4c3b3d);
    r(1167, 454, 43, 45, 0x795640);
    r(1170, 453, 38, 5, 0xb79160);
    candle(1188, 451);
    r(1102, 584, 37, 10, 0x8e7080);
    r(1106, 575, 34, 9, 0xba9c91);
    g = scene.add.graphics().setDepth(622);
    r(966, 587, 102, 30, 0x684a3e);
    r(972, 578, 90, 13, 0x9e7952);
    r(971, 594, 92, 3, 0xc2a169);
    for (const x of [978, 1052]) r(x, 582, 6, 34, 0xb3a072);
    r(1010, 592, 14, 13, 0xcaae76);
    r(1016, 596, 3, 6, 0x3b343c);
  } else {
    g = scene.add.graphics().setDepth(484);
    e(643, 477, 193, 33, 0x242837, 0.5);
    line(638, 364, 583, 482, 0xa28c67);
    line(640, 365, 707, 482, 0xa28c67);
    line(640, 365, 644, 492, 0xa28c67);
    line(640, 397, 596, 455, 0x4b4e58);
    line(640, 398, 693, 456, 0x4b4e58);
    r(626, 354, 26, 30, 0xa98f65);
    g.lineStyle(5, 0xceb384).lineBetween(548, 252, 747, 350);
    poly([544, 232, 771, 329, 752, 364, 524, 273], 0x617781);
    poly([546, 239, 762, 332, 755, 345, 540, 256], 0x9bacac);
    poly([527, 231, 552, 241, 535, 278, 510, 267], 0xd0b991);
    poly([516, 238, 541, 247, 529, 270, 509, 260], 0x26374c);
    r(761, 340, 25, 15, 0x353c50);
    r(786, 342, 9, 12, 0xc7ab80);
    r(629, 344, 22, 10, 0x897a64);
    g = scene.add.graphics().setDepth(478);
    r(195, 424, 14, 58, 0x795940);
    r(392, 424, 14, 58, 0x795940);
    r(184, 397, 232, 43, 0x6b503f);
    r(178, 391, 244, 12, 0xba9462);
    r(203, 409, 195, 23, 0x513e3e);
    r(288, 420, 20, 3, 0xd2b47c);
    openBook(260, 374);
    r(335, 369, 46, 20, 0xd7c7a0);
    for (let i = 0; i < 6; i++)
      r(343 + rand() * 29, 374 + rand() * 10, 2, 2, 0x6c7184);
    candle(218, 385);
    r(386, 375, 12, 14, 0x343c51);
    line(391, 375, 406, 347, 0xdad4b2);
    chair(79, 497);
    g = scene.add.graphics().setDepth(620);
    r(983, 579, 93, 34, 0x634b42);
    r(981, 572, 97, 11, 0xa48762);
    r(993, 575, 6, 37, 0xb5a477);
    r(1060, 575, 6, 37, 0xb5a477);
    r(1023, 580, 14, 14, 0xd2be89);
    r(1029, 583, 3, 6, 0x3d3542);
    g = scene.add.graphics().setDepth(0);
    g.lineStyle(2, 0xbaa98a, 0.35).strokeCircle(641, 139, 154);
    g.lineStyle(1, 0xbaa98a, 0.3).strokeEllipse(641, 139, 430, 180);
    for (let i = 0; i < 7; i++) {
      const star = scene.add.rectangle(
        401 + i * 67,
        122 + ((i * 39) % 130),
        3,
        3,
        0xf0d6a0,
        0.6,
      );
      animate({
        targets: star,
        alpha: 0.15,
        duration: 1800 + i * 150,
        yoyo: true,
        repeat: -1,
      });
    }
  }
  g = scene.add.graphics().setDepth(0);
  for (const [x, y] of [
    [237, 219],
    [846, 224],
    [1027, 196],
  ])
    candle(x, y);
  for (let i = 0; i < 22; i++) {
    const dust = scene.add.rectangle(
      90 + rand() * 1100,
      140 + rand() * 460,
      2,
      2,
      0xdfcda6,
      0.2,
    );
    animate({
      targets: dust,
      y: dust.y - 17,
      alpha: 0.45,
      duration: 3500 + rand() * 3000,
      yoyo: true,
      repeat: -1,
    });
  }
  g = scene.add.graphics().setDepth(900);
  r(-10, 660, 234, 60, 0x252735);
  r(-10, 656, 240, 9, 0x957050);
  for (let i = 0; i < 15; i++) {
    r(
      8 + i * 14,
      675,
      10,
      44 - (i % 3) * 8,
      [0x617577, 0x8e6c71, 0x877859][i % 3],
    );
    r(9 + i * 14, 680, 8, 2, 0xc9ad7e);
  }
  r(1163, 663, 120, 57, 0x272a35);
  r(1158, 659, 124, 9, 0x88674d);
  return ambient;
}

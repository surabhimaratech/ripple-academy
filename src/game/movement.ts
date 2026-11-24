export interface Point {
  x: number;
  y: number;
}
export interface Obstacle {
  x: number;
  y: number;
  w: number;
  h: number;
}
export const bounds = { left: 48, right: 1232, top: 370, bottom: 665 };
export const obstacles: Obstacle[] = [
  { x: 507, y: 369, w: 245, h: 64 },
  { x: 93, y: 449, w: 125, h: 77 },
  { x: 244, y: 468, w: 90, h: 40 },
  { x: 938, y: 443, w: 180, h: 73 },
  { x: 959, y: 568, w: 114, h: 42 },
  { x: 375, y: 347, w: 45, h: 60 },
  { x: 608, y: 416, w: 50, h: 57 },
  { x: 126, y: 534, w: 64, h: 27 },
  { x: 40, y: 550, w: 45, h: 50 },
  { x: 1205, y: 472, w: 50, h: 45 },
  { x: 883, y: 340, w: 34, h: 66 },
  { x: 0, y: 652, w: 216, h: 68 },
  { x: 1170, y: 652, w: 110, h: 68 },
];
export const objects = [
  {
    id: "quests",
    x: 629,
    y: 490,
    label: "Writing desk",
    action: "Sit & open quest journal",
  },
  {
    id: "discovery",
    x: 150,
    y: 380,
    label: "Curiosity shelves",
    action: "Open discovery notebook",
  },
  {
    id: "keepsakes",
    x: 1016,
    y: 620,
    label: "Personal chest",
    action: "Open keepsake chest",
  },
  {
    id: "door",
    x: 1169,
    y: 377,
    label: "University door",
    action: "Read the door plaque",
  },
  {
    id: "chair",
    x: 156,
    y: 575,
    label: "Reading nook",
    action: "Sit for a quiet moment",
  },
  {
    id: "globe",
    x: 900,
    y: 424,
    label: "Atlas globe",
    action: "Examine the globe",
  },
  {
    id: "window",
    x: 799,
    y: 390,
    label: "Moonlit window",
    action: "Look at the stars",
  },
] as const;
export type Interaction = (typeof objects)[number]["id"];
export function nearestObject(p: Point) {
  let best: (typeof objects)[number] | null = null;
  let distance = 96;
  for (const o of objects) {
    const d = Math.hypot(o.x - p.x, o.y - p.y);
    if (d < distance) {
      best = o;
      distance = d;
    }
  }
  return best;
}
export function canStand(
  p: Point,
  blocks: Obstacle[] = obstacles,
  area = bounds,
) {
  return (
    p.x >= area.left &&
    p.x <= area.right &&
    p.y >= area.top &&
    p.y <= area.bottom &&
    !blocks.some(
      (o) =>
        p.x + 12 > o.x &&
        p.x - 12 < o.x + o.w &&
        p.y + 5 > o.y &&
        p.y - 7 < o.y + o.h,
    )
  );
}
export function move(
  p: Point,
  direction: Point,
  dt: number,
  blocks: Obstacle[] = obstacles,
  speed = 150,
  area = bounds,
): Point {
  const length = Math.hypot(direction.x, direction.y);
  if (!length) return p;
  const distance = speed * Math.min(Math.max(dt, 0), 0.05);
  const dx = (direction.x / length) * distance,
    dy = (direction.y / length) * distance;
  // Small axis-separated steps prevent tunnelling and allow sliding at furniture edges.
  const result = { ...p };
  for (let i = 0; i < 4; i++) {
    if (canStand({ x: result.x + dx / 4, y: result.y }, blocks, area))
      result.x += dx / 4;
    if (canStand({ x: result.x, y: result.y + dy / 4 }, blocks, area))
      result.y += dy / 4;
  }
  return result;
}

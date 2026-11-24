import { it, expect } from "vitest";
import { bounds, move, canStand, nearestObject, objects } from "./movement";
it("keeps walking within room boundaries", () => {
  let p = { x: bounds.left, y: 600 };
  for (let i = 0; i < 100; i++) p = move(p, { x: -1, y: 1 }, 0.05);
  expect(p.x).toBeGreaterThanOrEqual(bounds.left);
  expect(p.y).toBeLessThanOrEqual(bounds.bottom);
});
it("normalizes diagonal speed and caps long frames", () => {
  const start = { x: 600, y: 600 };
  const straight = move(start, { x: 1, y: 0 }, 0.02, []);
  const diagonal = move(start, { x: 1, y: 1 }, 0.02, []);
  expect(Math.hypot(diagonal.x - start.x, diagonal.y - start.y)).toBeCloseTo(
    straight.x - start.x,
  );
  expect(move(start, { x: 1, y: 0 }, 30, []).x - start.x).toBeCloseTo(7.5);
});
it("stops at furniture and slides along its edge", () => {
  const blocks = [{ x: 600, y: 400, w: 100, h: 100 }];
  const p = move({ x: 585, y: 450 }, { x: 1, y: 1 }, 0.05, blocks);
  expect(p.x).toBeLessThanOrEqual(588);
  expect(p.y).toBeGreaterThan(450);
  expect(canStand(p, blocks)).toBe(true);
});
it("finds contextual objects only within reach", () => {
  expect(nearestObject({ x: 630, y: 450 })?.id).toBe("quests");
  expect(nearestObject({ x: 630, y: 640 })).toBeNull();
  for (const o of objects) expect(nearestObject(o)?.id).toBe(o.id);
});
it("all interaction points are reachable without intersecting furniture", () => {
  for (const o of objects) expect(canStand(o), o.id).toBe(true);
});

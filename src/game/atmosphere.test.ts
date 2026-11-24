import { it, expect } from "vitest";
import { localTimeOfDay, parallaxTarget, easeParallax } from "./atmosphere";
it("provides local morning, afternoon, twilight and nighttime boundaries", () => {
  expect([5, 6, 10, 11, 16, 17, 19, 20, 23].map(localTimeOfDay)).toEqual([
    "night",
    "morning",
    "morning",
    "afternoon",
    "afternoon",
    "twilight",
    "twilight",
    "night",
    "night",
  ]);
});
it("disables all parallax for reduced motion or zero intensity", () => {
  expect(parallaxTarget({ x: 1, y: 1 }, 100, 20, 0.6, true)).toEqual({
    x: 0,
    y: 0,
  });
  expect(parallaxTarget({ x: 1, y: 1 }, 100, 20, 0, false)).toEqual({
    x: 0,
    y: 0,
  });
});
it("smoothly interpolates and clamps pointer movement while limiting idle drift", () => {
  const target = parallaxTarget({ x: 8, y: -9 }, 0, 0, 1, false);
  expect(target).toEqual({ x: 1, y: -1 });
  const step = easeParallax({ x: 0, y: 0 }, target, 0.033);
  expect(step.x).toBeGreaterThan(0);
  expect(step.x).toBeLessThan(0.1);
  for (let i = 0; i < 100; i++) {
    const idle = parallaxTarget({ x: 1, y: 1 }, i, 10, 1, false);
    expect(Math.abs(idle.x)).toBeLessThanOrEqual(0.32);
    expect(Math.abs(idle.y)).toBeLessThanOrEqual(0.18);
  }
});

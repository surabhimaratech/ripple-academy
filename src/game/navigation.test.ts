import { describe, it, expect } from "vitest";
import { Navigation } from "./navigation";
import { libraryRoom, libraryActivities } from "./room";
const nav = new Navigation(libraryRoom.bounds, libraryRoom.obstacles);
describe("room navigation", () => {
  it("connects every activity to every other activity without crossing furniture", () => {
    for (const from of libraryActivities)
      for (const to of libraryActivities) {
        const route = nav.path(from.point, to.point);
        expect(route, `${from.id} → ${to.id}`).not.toBeNull();
        let previous = from.point;
        for (const point of route!) {
          expect(nav.clear(previous, point)).toBe(true);
          previous = point;
        }
        expect(previous).toEqual(to.point);
      }
  });
  it("routes around the armchair instead of cutting through its footprint", () => {
    const start = { x: 75, y: 475 },
      end = { x: 235, y: 520 };
    expect(nav.clear(start, end)).toBe(false);
    const route = nav.path(start, end);
    expect(route).not.toBeNull();
    expect(route!.length).toBeGreaterThan(1);
    let prior = start;
    for (const p of route!) {
      expect(nav.clear(prior, p)).toBe(true);
      prior = p;
    }
  });
  it("rejects out-of-bounds and solid destinations", () => {
    expect(nav.path({ x: 642, y: 564 }, { x: 600, y: 400 })).toBeNull();
    expect(nav.path({ x: 642, y: 564 }, { x: 30, y: 500 })).toBeNull();
  });
  it("cannot pass diagonal corners of padded furniture", () => {
    const small = new Navigation(
      { left: 0, right: 100, top: 0, bottom: 100 },
      [{ x: 40, y: 40, w: 20, h: 20 }],
      8,
    );
    expect(small.clear({ x: 20, y: 30 }, { x: 80, y: 70 })).toBe(false);
    const route = small.path({ x: 20, y: 30 }, { x: 80, y: 70 });
    expect(route).not.toBeNull();
    let previous = { x: 20, y: 30 };
    for (const point of route!) {
      expect(small.clear(previous, point)).toBe(true);
      previous = point;
    }
  });
});

import { it, expect } from "vitest";
import { ScholarBehavior } from "./behavior";
import { roomDefinitions } from "./rooms";
import { studyFurniture, windowVantage } from "./furniture";
import { placementFor, frameForPlacement } from "../heroine/presentation";
import { visibleBands } from "../heroine/occlusion";
import { frameNames } from "../heroine/assets";
const d = roomDefinitions["personal-study"];
function occupied(id = "study-read") {
  const b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession(id);
  for (let i = 0; i < 1800; i++) b.step(1 / 30);
  return b;
}
it("keeps book, page-turn, looking-up, rest and tea fixed to one occupied chair", () => {
  const b = occupied();
  const first = placementFor(d.id, b);
  expect(first.key).toBe("study-armchair");
  for (const id of ["study-tea", "study-rest", "study-read"]) {
    b.setSession(id);
    const p = placementFor(d.id, b);
    expect(b.moving).toBe(false);
    expect(b.path).toEqual([]);
    expect(b.settling).toBe(0);
    expect([p.x, p.y, p.scale, p.foreground]).toEqual([
      first.x,
      first.y,
      first.scale,
      first.foreground,
    ]);
  }
  for (const [frame, t] of [
    ["read-seated", 0],
    ["read-page", 11.5],
    ["read-seated", 14.5],
    ["rest", 15],
    ["tea-hold", 0],
    ["tea-sip", 3],
  ] as const)
    expect(frameNames.has(frameForPlacement(frame, first, t))).toBe(true);
  expect(frameForPlacement("read-seated", first, 14.5)).toBe("study-look-up");
  expect(b.takeEvents()).toEqual([]);
});
it("walks on accessible floor, settles locally, and finishes standing before manual departure", () => {
  for (const id of ["code", "study-read"]) {
    const b = new ScholarBehavior(d.config, () => 0.5, d.start);
    b.setSession(id);
    let settled = false;
    for (let i = 0; i < 1800; i++) {
      b.step(1 / 30);
      expect(b.nav.valid(b.position)).toBe(true);
      if (b.settling > 0) {
        settled = true;
        const p = placementFor(d.id, b);
        expect(p.transition?.kind).toBe("arrive");
        expect(frameNames.has(frameForPlacement("rest", p))).toBe(true);
      }
    }
    expect(settled).toBe(true);
    const seated = placementFor(d.id, b);
    const floor = { ...b.position };
    b.manual({ x: 1, y: 0 }, 1 / 30);
    expect(b.position).toEqual(floor);
    expect(placementFor(d.id, b).transition?.kind).toBe("leave");
    let last = placementFor(d.id, b);
    for (let i = 0; i < 36; i++) {
      b.manual({ x: 1, y: 0 }, 1 / 30);
      const p = placementFor(d.id, b);
      expect(Math.hypot(p.x - last.x, p.y - last.y)).toBeLessThan(12);
      last = p;
    }
    expect(b.departingActivity).toBeUndefined();
    expect(b.nav.valid(b.position)).toBe(true);
    expect(Math.hypot(seated.x - floor.x, seated.y - floor.y)).toBeGreaterThan(
      0,
    );
  }
});
it("keeps desk typing, thinking, consulting and writing on the same chair, and honors reduced motion", () => {
  const b = occupied("code");
  const p = placementFor(d.id, b);
  for (const frame of [
    "type-a",
    "type-b",
    "think-work",
    "consult-a",
    "consult-b",
    "write-a",
    "write-b",
  ])
    expect(frameNames.has(frameForPlacement(frame, p))).toBe(true);
  b.setSession("study-write");
  expect(placementFor(d.id, b)).toEqual(p);
  b.settling = 1;
  const reduced = placementFor(d.id, b, true);
  expect(reduced.transition).toBeUndefined();
  expect([reduced.x, reduced.y]).toEqual([p.x, p.y]);
});
it("keeps window observation on the floor facing the actual window, not the cabinet", () => {
  const b = occupied("study-window");
  expect(b.position).toEqual(windowVantage.point);
  expect(b.facing).toBe("up");
  const p = placementFor(d.id, b);
  expect([p.x, p.y]).toEqual([b.position.x, b.position.y]);
  expect(frameForPlacement("window-thought", p)).toBe("window");
});
it("keeps celebration and pause/resume compatible with furniture entry and exit", () => {
  const b = occupied();
  const p = placementFor(d.id, b);
  b.celebrate(0.2);
  expect(placementFor(d.id, b).key).toBe(p.key);
  expect(frameForPlacement("celebrate", p)).toBe("study-look-up");
  for (let i = 0; i < 10; i++) b.step(1 / 30);
  expect(placementFor(d.id, b).key).toBe(p.key);
  b.setSession("study-read", true);
  expect(b.departure).toBeGreaterThan(0);
  for (let i = 0; i < 60; i++) b.step(1 / 30);
  expect(b.departure).toBe(0);
  expect(b.state).toBe("idle");
});
it("builds positive, nonoverlapping Canvas-compatible bands around polygon foregrounds", () => {
  const polygon = [
    { x: 2, y: 2 },
    { x: 8, y: 2 },
    { x: 8, y: 8 },
    { x: 2, y: 8 },
  ];
  const bands = visibleBands([polygon], [], 10, 10);
  expect(bands.reduce((n, r) => n + r.width * r.height, 0)).toBe(64);
  for (let y = 0; y < 10; y++)
    for (let x = 0; x < 10; x++) {
      const count = bands.filter(
        (r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height,
      ).length;
      expect(count).toBe(x >= 2 && x < 8 && y >= 2 && y < 8 ? 0 : 1);
    }
  for (const anchor of Object.values(studyFurniture))
    expect(
      new ScholarBehavior(d.config, () => 0.5, d.start).nav.path(
        d.start,
        anchor.approach,
      ),
    ).not.toBeNull();
});

it("reverses an interrupted sit-down from its current contact rather than jumping to the fully seated pose", () => {
  const b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession("study-read");
  for (let i = 0; i < 1000 && !b.settling; i++) b.step(1 / 30);
  for (let i = 0; i < 12; i++) b.step(1 / 30);
  expect(b.settling).toBeGreaterThan(0);
  const before = placementFor(d.id, b);
  b.manual({ x: 1, y: 0 }, 1 / 30);
  const after = placementFor(d.id, b);
  expect(Math.hypot(before.x - after.x, before.y - after.y)).toBeLessThan(8);
  expect(after.transition?.kind).toBe("leave");
  for (let i = 0; i < 60; i++) b.manual({ x: 1, y: 0 }, 1 / 30);
  expect(b.departure).toBe(0);
  expect(b.nav.valid(b.position)).toBe(true);
});

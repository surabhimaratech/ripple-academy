import { it, expect } from "vitest";
import { workSample, telescopeSample, chartFrame } from "./programs";
import { animationCatalog, previewFrame } from "./catalog";
import { frameNames } from "./assets";
import { registeredFrames } from "./atlas";
import { placementFor, visibleRegions, furniture } from "./presentation";
import { roomDefinitions } from "../game/rooms";
import { ScholarBehavior } from "../game/behavior";
it("keeps work microphases unhurried, deterministic, reversible and still in reduced motion", () => {
  expect(workSample(0, false).phase).toBe("typing");
  expect(workSample(18, false).phase).toBe("thinking");
  expect(workSample(23, false).phase).toBe("typing");
  expect(workSample(30, false).phase).toBe("consulting");
  expect(workSample(66, false)).toEqual(workSample(30, false));
  for (const t of [0, 18, 30, 35])
    expect(workSample(t, true).frame).toBe("type-a");
  expect(telescopeSample(23, false).frame).toBe("telescope-adjust");
  expect(telescopeSample(23, true).frame).toBe("telescope-a");
  expect(chartFrame(15, false)).toBe("consult-a");
  expect(chartFrame(15, true)).toBe("write-a");
});
it("offers every animation and raw-frame-compatible still selection without missing assets", () => {
  for (const entry of animationCatalog)
    for (const time of [0, entry.duration * 0.4, entry.duration * 0.9])
      for (const reduced of [false, true]) {
        expect(
          frameNames.has(previewFrame(entry, time, reduced)),
          entry.id,
        ).toBe(true);
      }
  for (const id of [
    "work",
    "consult",
    "think",
    "tea",
    "sleep",
    "stretch",
    "adjust",
    "charts",
    "examine",
  ])
    expect(animationCatalog.some((e) => e.id === id)).toBe(true);
});
it("registers related frames with a common scale, fixed baseline and no hand-driven recentering", () => {
  const b = [
    { x: 10, y: 2, width: 30, height: 100 },
    { x: 10, y: 2, width: 40, height: 100 },
  ];
  const [a, c] = registeredFrames(b, 100, {
    width: 96,
    height: 144,
    footX: 48,
    footY: 136,
  });
  expect(a.x).toBe(c.x);
  expect(a.height).toBe(c.height);
  expect(c.y + c.height).toBe(136);
  expect(c.width - a.width).toBe(10);
});
it("subtracts furniture as positive, non-overlapping visible mask regions for Canvas and WebGL", () => {
  const cuts = [
    { x: 20, y: 20, width: 40, height: 20 },
    { x: 40, y: 30, width: 40, height: 30 },
  ];
  const regions = visibleRegions(cuts, 100, 100);
  const area = regions.reduce((sum, r) => sum + r.width * r.height, 0);
  expect(area).toBe(8200);
  for (const r of regions)
    for (const c of cuts)
      expect(
        Math.min(r.x + r.width, c.x + c.width) <= Math.max(r.x, c.x) ||
          Math.min(r.y + r.height, c.y + c.height) <= Math.max(r.y, c.y),
      ).toBe(true);
  expect(visibleRegions([], 100, 100)).toEqual([
    { x: 0, y: 0, width: 100, height: 100 },
  ]);
});
it("uses fixed desk/chair/bed contact anchors without moving navigation positions", () => {
  const d = roomDefinitions["personal-study"];
  const b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession("code");
  for (let i = 0; i < 500; i++) b.step(1 / 30);
  const before = { ...b.position },
    place = placementFor(d.id, b);
  expect(place).toMatchObject({ x: 550, y: 398, key: "personal-study:desk" });
  expect(place.occluders).toEqual([furniture["personal-study"].desk]);
  expect(b.position).toEqual(before);
  const sleep = d.config.activities.find((a) => a.pose === "sleep")!;
  const sleeping = placementFor(d.id, {
    ...b,
    position: sleep.point,
    activity: sleep,
    state: "idle",
    moving: false,
    pose: "sleep",
    offsetY: 0,
  });
  expect(sleeping.occluders).toEqual([furniture["personal-study"].blanket]);
  expect(sleeping.depth).toBeGreaterThan(590);
});
it("queues a short post-session stretch without rewards and lets manual input cancel it", () => {
  for (const manual of [false, true]) {
    const d = roomDefinitions["personal-study"],
      b = new ScholarBehavior(d.config, () => 0.5, d.start);
    b.setSession("code");
    for (let i = 0; i < 500; i++) b.step(1 / 30);
    b.setSession(undefined);
    expect(b.state).toBe("idle");
    if (manual) b.manual({ x: 1, y: 0 }, 0.03);
    for (let i = 0; i < 250; i++) b.step(1 / 30);
    if (!manual) expect(b.activity?.id).toBe("study-stretch");
    else expect(b.state).toBe("player-controlled");
    expect(b.takeEvents()).toEqual([]);
  }
});

it("renews an activity at the same desk without a standing/walking flash", () => {
  const d = roomDefinitions["personal-study"],
    b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession("code");
  for (let i = 0; i < 500; i++) b.step(1 / 30);
  const point = { ...b.position };
  for (let i = 0; i < 6000; i++) {
    b.step(1 / 30);
    expect(b.state).toBe("writing");
    expect(b.position).toEqual(point);
    expect(b.moving).toBe(false);
  }
  expect(b.takeEvents()).toEqual([]);
});

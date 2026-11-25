import { it, expect } from "vitest";
import { RewardSequence, rewardSteps } from "./rewardSequence";
import { ScholarBehavior } from "./behavior";
import { cafeConfig, cafeStart } from "./cafe";
for (const kind of ["coffee", "pastry", "book", "celebrate"] as const)
  it(`${kind} presentation reaches furniture safely and emits no transaction/menu events`, () => {
    const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart),
      s = new RewardSequence("test", kind),
      seen = new Set<string>();
    for (let i = 0; i < 6000 && !s.done; i++) {
      s.step(b, 1 / 30);
      b.step(1 / 30);
      if (b.activity) seen.add(b.activity.id);
      expect(b.nav.valid(b.position)).toBe(true);
    }
    expect(s.done).toBe(true);
    expect(b.takeEvents()).toEqual([]);
    for (const step of rewardSteps(kind))
      expect(seen.has(step.activity)).toBe(true);
  });
it("manual override pauses sequence; skip is idempotent and releases the seat", () => {
  const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart),
    s = new RewardSequence("test", "coffee");
  s.step(b, 0.03);
  b.manual({ x: 0, y: 1 }, 0.03);
  for (let i = 0; i < 200; i++) {
    s.step(b, 0.03);
    b.step(0.03);
  }
  expect(s.activity).toBe("cafe-order");
  expect(s.done).toBe(false);
  s.skip(b);
  s.skip(b);
  expect(s.done).toBe(true);
});
it("explicit reward animation works in manual-only mode and can be paused by manual input", () => {
  const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart);
  b.setAutonomous(false);
  const s = new RewardSequence("manual", "book");
  for (let i = 0; i < 6000 && !s.done; i++) {
    s.step(b, 1 / 30);
    b.step(1 / 30);
  }
  expect(s.done).toBe(true);
  expect(b.autonomous).toBe(false);
  expect(b.takeEvents()).toEqual([]);
});
it("counter interaction opens the menu once on arrival; autonomy cannot open or spend", () => {
  const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart);
  b.useObject("cafe-menu");
  const events: string[] = [];
  for (let i = 0; i < 1500; i++) {
    b.step(1 / 30);
    events.push(...b.takeEvents());
    expect(b.nav.valid(b.position)).toBe(true);
  }
  expect(events).toEqual(["cafe-menu"]);
});
it("ten minutes of autonomous café activities stay collision-safe and produce no events", () => {
  let seed = 13;
  const random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const b = new ScholarBehavior(cafeConfig, random, cafeStart),
    seen = new Set<string>();
  let engaged = 0;
  for (let i = 0; i < 18000; i++) {
    b.step(1 / 30);
    expect(b.nav.valid(b.position)).toBe(true);
    if (b.activity) {
      seen.add(b.activity.id);
      engaged++;
    }
  }
  expect(seen.size).toBeGreaterThan(4);
  expect(engaged).toBeGreaterThan(12000);
  expect(b.takeEvents()).toEqual([]);
  expect(seen.has("cafe-order")).toBe(false);
  expect(seen.has("cafe-wait")).toBe(false);
});

import { describe, it, expect } from "vitest";
import { ScholarBehavior, MANUAL_SECONDS } from "./behavior";
import { libraryRoom, libraryActivities } from "./room";
function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
function advance(b: ScholarBehavior, seconds: number) {
  for (let t = 0; t < seconds - 1e-6; t += 1 / 30)
    b.step(Math.min(1 / 30, seconds - t));
}
function arrive(b: ScholarBehavior) {
  for (let i = 0; i < 2000 && b.path.length; i++) b.step(1 / 30);
  expect(b.path).toHaveLength(0);
}
describe("scholar state machine", () => {
  it("starts idle, chooses an activity and arrives without opening a menu autonomously", () => {
    const b = new ScholarBehavior(libraryRoom, () => 0.5);
    advance(b, 6);
    expect(b.state).toBe("walking-to-object");
    arrive(b);
    expect(["reading", "writing", "sitting", "observing", "idle"]).toContain(
      b.state,
    );
    expect(b.takeEvents()).toEqual([]);
    expect(b.remaining).toBeGreaterThan(14);
  });
  it("manual movement overrides autonomy, with a fresh 20-second quiet period after every key", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(3));
    advance(b, 10);
    b.manual({ x: 1, y: 0 }, 0.02);
    expect(b.state).toBe("player-controlled");
    expect(b.manualRemaining).toBe(MANUAL_SECONDS);
    advance(b, 19);
    expect(b.state).toBe("player-controlled");
    b.manual({ x: -1, y: 0 }, 0.02);
    advance(b, 19.9);
    expect(b.state).toBe("player-controlled");
    advance(b, 0.2);
    expect(["walking-to-object", "wandering"]).toContain(b.state);
  });
  it("manual-only mode never autonomously chooses an activity", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(1));
    b.setAutonomous(false);
    const p = { ...b.position };
    advance(b, 600);
    expect(b.position).toEqual(p);
    expect(b.state).toBe("player-controlled");
    expect(b.useObject("globe")).toBe(true);
    arrive(b);
    expect(b.state).toBe("observing");
    expect(b.takeEvents()).toEqual(["globe"]);
    advance(b, 70);
    expect(b.state).toBe("player-controlled");
  });
  it("clicked furniture is approached before its one interaction event, without teleporting", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(5));
    const start = { ...b.position };
    expect(b.useObject("quests")).toBe(true);
    expect(b.position).toEqual(start);
    expect(b.takeEvents()).toEqual([]);
    arrive(b);
    expect(b.position).toEqual(
      libraryActivities.find((a) => a.id === "write")!.point,
    );
    expect(b.state).toBe("writing");
    expect(b.takeEvents()).toEqual(["quests"]);
    advance(b, 1);
    expect(b.takeEvents()).toEqual([]);
  });
  it("floor clicks use collision-safe paths and inaccessible clicks leave the plan unchanged", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(5));
    expect(b.walkTo({ x: 840, y: 620 })).toBe(true);
    const route = structuredClone(b.path);
    expect(b.walkTo({ x: 560, y: 400 })).toBe(false);
    expect(b.path).toEqual(route);
    arrive(b);
    expect(b.position.x).toBe(840);
    expect(b.position.y).toBe(620);
    expect(b.state).toBe("player-controlled");
  });
  it("celebration resumes an interrupted activity with its remaining engagement time", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(5));
    b.useObject("quests");
    arrive(b);
    advance(b, 3);
    const before = {
      remaining: b.remaining,
      position: { ...b.position },
      activity: b.activity,
    };
    b.celebrate();
    advance(b, 2);
    expect(b.state).toBe("celebrating");
    expect(b.position).toEqual(before.position);
    advance(b, 0.9);
    expect(b.state).toBe("writing");
    expect(b.activity).toEqual(before.activity);
    expect(b.remaining).toBeCloseTo(before.remaining, 0);
    expect(b.takeEvents()).toEqual(["quests"]);
  });
  it("celebrations can interrupt a walk; repeated celebrations preserve the original route", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(5));
    b.walkTo({ x: 150, y: 380 });
    advance(b, 1);
    const route = structuredClone(b.path),
      p = { ...b.position };
    b.celebrate();
    advance(b, 1);
    b.celebrate();
    advance(b, 2.9);
    expect(b.path.length).toBeGreaterThan(0);
    expect(b.path[b.path.length - 1]).toEqual(route[route.length - 1]);
    expect(Math.hypot(b.position.x - p.x, b.position.y - p.y)).toBeLessThan(20);
  });
  it("manual movement can take priority over a celebration", () => {
    const b = new ScholarBehavior(libraryRoom);
    b.celebrate();
    b.manual({ x: 1, y: 0 }, 0.03);
    expect(b.state).toBe("player-controlled");
    advance(b, 5);
    expect(b.state).toBe("player-controlled");
  });
  it("limits large time deltas instead of simulating offline time", () => {
    const b = new ScholarBehavior(libraryRoom, () => 0.5);
    const remaining = b.remaining;
    b.step(600);
    expect(b.remaining).toBeCloseTo(remaining - 0.05);
    expect(b.state).toBe("idle");
  });
  it("thoughts are infrequent, can be disabled, and do not immediately repeat", () => {
    const b = new ScholarBehavior(libraryRoom, seeded(33));
    let last = "",
      previousText = "",
      count = 0;
    const seen: string[] = [];
    for (let t = 0; t < 600; t += 1 / 30) {
      b.step(1 / 30);
      const text = b.thought?.text ?? "";
      if (text && text !== last) {
        expect(text).not.toBe(previousText);
        previousText = text;
        count++;
        seen.push(text);
      }
      last = text;
    }
    expect(count).toBeGreaterThan(1);
    expect(count).toBeLessThan(12);
    b.setThoughts(false);
    advance(b, 180);
    expect(b.thought).toBeNull();
    expect(seen.length).toBe(count);
  });
  it.each([1, 13, 27, 103])(
    "a seeded ten-minute session stays collision-safe, varies its day and spends more time engaged than walking (seed %i)",
    (seed) => {
      const b = new ScholarBehavior(libraryRoom, seeded(seed));
      let walking = 0,
        engaged = 0;
      const activities = new Set<string>();
      for (let t = 0; t < 600; t += 1 / 30) {
        b.step(1 / 30);
        expect(b.nav.valid(b.position)).toBe(true);
        if (b.path.length) walking++;
        else engaged++;
        if (b.activity) activities.add(b.activity.id);
        expect(b.takeEvents()).toEqual([]);
      }
      expect(engaged).toBeGreaterThan(walking * 1.5);
      expect(activities.size).toBeGreaterThanOrEqual(5);
    },
  );
});

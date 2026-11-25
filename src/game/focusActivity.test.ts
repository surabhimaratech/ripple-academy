import { it, expect } from "vitest";
import { focusPlan } from "./focusActivity";
import { reduceFocus } from "../domain/focus";
import { ScholarBehavior } from "./behavior";
import { roomDefinitions } from "./rooms";
it("routes each explicit focus intent to a reachable workstation, suppresses wandering and pauses calmly", () => {
  const d = roomDefinitions["personal-study"];
  for (const [activity, target] of [
    ["system-design", "study-write"],
    ["ai-engineering", "code"],
    ["outreach", "code"],
    ["reading", "study-read"],
    ["writing", "study-write"],
  ] as const) {
    const focus = reduceFocus(undefined, {
      type: "focusStart",
      id: "one",
      now: 1000,
      phase: "focus",
      activity,
      objective: "Real work",
    }).current!;
    const plan = focusPlan(d.id, focus)!;
    expect(plan.activity).toBe(target);
    const b = new ScholarBehavior(d.config, () => 0.5, d.start);
    b.setSession(plan.activity, plan.paused);
    for (let i = 0; i < 3000; i++) {
      b.step(1 / 30);
      expect(b.nav.valid(b.position)).toBe(true);
    }
    expect(b.activity?.id).toBe(target);
    expect(b.takeEvents()).toEqual([]);
    b.setSession(plan.activity, true);
    const position = { ...b.position };
    for (let i = 0; i < 100; i++) b.step(1 / 30);
    expect(b.position).toEqual(position);
    expect(focusPlan("grand-library", focus)).toBeUndefined();
    expect(focusPlan(d.id, { ...focus, status: "ready" })).toBeUndefined();
    expect(focusPlan(d.id, { ...focus, status: "paused" })).toEqual({
      activity: target,
      paused: true,
    });
    expect(focusPlan(d.id, { ...focus, phase: "short-break" })).toEqual({
      activity: "study-tea",
      paused: false,
    });
  }
});

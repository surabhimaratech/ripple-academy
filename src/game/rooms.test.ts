import { it, expect } from "vitest";
import { roomDefinitions } from "./rooms";
import { ScholarBehavior } from "./behavior";
import { Navigation } from "./navigation";
it("every room has reachable session furniture and mutually connected activities", () => {
  for (const definition of Object.values(roomDefinitions)) {
    const nav = new Navigation(
      definition.config.bounds,
      definition.config.obstacles,
    );
    expect(nav.valid(definition.start), definition.id).toBe(true);
    expect(
      definition.config.activities.some(
        (a) => a.id === definition.sessionActivity,
      ),
    ).toBe(true);
    for (const activity of definition.config.activities) {
      expect(
        nav.path(definition.start, activity.point),
        `${definition.id}: ${activity.id}`,
      ).not.toBeNull();
      for (const other of definition.config.activities)
        expect(nav.path(activity.point, other.point)).not.toBeNull();
    }
  }
});
it("an explicit activity directs each room without opening menus or awarding rewards", () => {
  for (const definition of Object.values(roomDefinitions)) {
    const b = new ScholarBehavior(
      definition.config,
      () => 0.5,
      definition.start,
    );
    b.setSession(definition.sessionActivity);
    for (let i = 0; i < 1200; i++) b.step(1 / 30);
    expect(b.activity?.id).toBe(definition.sessionActivity);
    expect(b.takeEvents()).toEqual([]);
    expect(b.nav.valid(b.position)).toBe(true);
  }
});
it("pause/resume/finish change companion behavior without interfering with manual override", () => {
  const d = roomDefinitions["personal-study"],
    b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession("code");
  for (let i = 0; i < 300; i++) b.step(1 / 30);
  expect(b.state).toBe("writing");
  b.setSession("code", true);
  const point = { ...b.position };
  for (let i = 0; i < 300; i++) b.step(1 / 30);
  expect(b.position).toEqual(point);
  expect(b.label).toContain("break");
  b.setSession("code");
  b.manual({ x: 1, y: 0 }, 0.03);
  expect(b.state).toBe("player-controlled");
  for (let i = 0; i < 1000; i++) b.step(1 / 30);
  expect(b.activity?.id).toBe("code");
  b.setSession(undefined);
  expect(b.state).toBe("idle");
});

it("reading sessions select a book first and longer sessions can consult related materials", () => {
  const d = roomDefinitions["grand-library"];
  const b = new ScholarBehavior(d.config, () => 0.1, d.start);
  b.setSession(d.sessionActivity, false, d.sessionVariations, d.sessionIntro);
  for (let i = 0; i < 1000 && b.path.length; i++) b.step(1 / 30);
  expect(b.activity?.id).toBe("browse");
  const seen = new Set<string>();
  for (let i = 0; i < 18000; i++) {
    b.step(1 / 30);
    if (b.activity) seen.add(b.activity.id);
    expect(b.nav.valid(b.position)).toBe(true);
  }
  expect(seen.has("armchair-book") || seen.has("window-book")).toBe(true);
  expect(b.takeEvents()).toEqual([]);
});
it("a paused session in another room does not freeze this room", () => {
  const d = roomDefinitions["personal-study"];
  const b = new ScholarBehavior(d.config, () => 0.5, d.start);
  b.setSession(undefined, true);
  for (let i = 0; i < 900; i++) b.step(1 / 30);
  expect(b.activity).toBeTruthy();
  expect(b.label).not.toContain("session break");
});

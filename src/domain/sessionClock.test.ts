import { it, expect } from "vitest";
import { SessionClock } from "./sessionClock";
import type { ActivitySession } from "./sessions";
const session: ActivitySession = {
  id: "s",
  runId: "r",
  title: "Reading",
  room: "grand-library",
  categoryId: "reading",
  phase: "running",
  elapsedMs: 10000,
  startedAt: "2026-11-24T00:00:00Z",
};
it("uses monotonic open-app time and pauses exactly at the committed elapsed amount", () => {
  let now = 0;
  const clock = new SessionClock(() => now);
  clock.sync(session);
  now = 3000;
  expect(clock.read()).toBe(13000);
  clock.sync({ ...session, phase: "paused", elapsedMs: 13000 });
  now = 600000;
  expect(clock.read()).toBe(13000);
  clock.sync({ ...session, phase: "running", runId: "new", elapsedMs: 13000 });
  now += 2000;
  expect(clock.read()).toBe(15000);
});
it("does not add closed or offline time on a newly opened clock", () => {
  const clock = new SessionClock(() => 999999999);
  clock.sync(session);
  expect(clock.read()).toBe(10000);
});
it("max-merges other-tab checkpoints without double-counting or rewinding a running clock", () => {
  let now = 0;
  const clock = new SessionClock(() => now);
  clock.sync(session);
  now = 3000;
  clock.sync({ ...session, elapsedMs: 12000 });
  expect(clock.read()).toBe(13000);
  clock.sync({ ...session, elapsedMs: 15000 });
  expect(clock.read()).toBe(15000);
  now += 1000;
  expect(clock.read()).toBe(16000);
});
it("resets the running anchor when importing an older snapshot with identical IDs", () => {
  let now = 0;
  const clock = new SessionClock(() => now);
  clock.sync(session);
  now = 30000;
  expect(clock.read()).toBe(40000);
  clock.sync(session, 1);
  expect(clock.read()).toBe(10000);
  now += 2000;
  expect(clock.read()).toBe(12000);
});

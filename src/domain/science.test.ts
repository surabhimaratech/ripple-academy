import { it, expect } from "vitest";
import { apply, initialState } from "./model";
import { parseSave, serializeSave, validateSave } from "./save";
import { scienceIntent, scienceKinds, observationDetails } from "./science";
import { focusPlan } from "../game/focusActivity";
const at = "2026-11-26T10:00:00.000Z",
  later = "2026-11-26T10:00:30.000Z";
const start = (timed = true) =>
  apply(
    initialState(),
    {
      type: "startSession",
      id: "science-session",
      runId: "run",
      categoryId: "science-data-analysis",
      objective: "Inspect a user-chosen light curve",
      experiment: "My experiment",
      targetMinutes: timed ? 25 : undefined,
    },
    at,
  );
it("science timed sessions start one existing Pomodoro atomically and retain explicit metadata", () => {
  const s = start();
  expect(s.focus?.current).toMatchObject({
    id: "focus:science-session",
    room: "observatory",
    activity: "data-analysis",
    sessionId: "science-session",
    durationMs: 1500000,
    status: "running",
  });
  expect(s.sessions?.[0]).toMatchObject({
    objective: "Inspect a user-chosen light curve",
    experiment: "My experiment",
    room: "observatory",
  });
  expect(focusPlan("observatory", s.focus?.current)?.activity).toBe(
    "observatory-code",
  );
  expect(focusPlan("personal-study", s.focus?.current)).toBeUndefined();
  expect([s.xp, s.gold]).toEqual([0, 0]);
  expect(
    apply(
      s,
      {
        type: "startSession",
        id: "science-session",
        runId: "again",
        categoryId: "science-data-analysis",
        targetMinutes: 25,
      },
      later,
    ),
  ).toEqual(s);
});
it("untimed exploration does not create or replace a timer", () => {
  expect(start(false).focus).toBeUndefined();
  const original = apply(
    initialState(),
    {
      type: "focusStart",
      id: "study",
      now: Date.parse(at),
      phase: "focus",
      activity: "reading",
      objective: "Read",
    },
    at,
  );
  const s = apply(
    original,
    {
      type: "startSession",
      id: "science",
      runId: "r",
      categoryId: "science-stargazing",
    },
    at,
  );
  expect(s.focus).toEqual(original.focus);
  expect(() =>
    apply(
      original,
      {
        type: "startSession",
        id: "timed",
        runId: "r",
        categoryId: "science-data-analysis",
        targetMinutes: 25,
      },
      at,
    ),
  ).toThrow();
  expect(original.sessions).toBeUndefined();
});
it("session pause/resume/finish drive the linked existing timer; finished retries do not reset a later timer", () => {
  let s = start();
  s = apply(
    s,
    {
      type: "pauseSession",
      id: "science-session",
      runId: "run",
      elapsedMs: 30000,
    },
    later,
  );
  expect(s.focus?.current?.status).toBe("paused");
  expect(s.focus?.current?.remainingMs).toBe(1470000);
  s = apply(
    s,
    { type: "resumeSession", id: "science-session", runId: "run2" },
    later,
  );
  expect(s.focus?.current?.status).toBe("running");
  s = apply(
    s,
    {
      type: "finishSession",
      id: "science-session",
      runId: "run2",
      elapsedMs: 40000,
      notes: "My own notes",
      completeQuest: false,
    },
    later,
  );
  expect(s.sessions?.[0].phase).toBe("finished");
  expect(s.focus?.current?.status).toBe("ready");
  expect(s.focus?.history).toHaveLength(0);
  s = apply(
    s,
    {
      type: "focusStart",
      id: "next",
      now: Date.parse(later),
      phase: "focus",
      activity: "reading",
      room: "observatory",
      objective: "Read",
    },
    later,
  );
  expect(
    apply(
      s,
      {
        type: "finishSession",
        id: "science-session",
        runId: "run2",
        elapsedMs: 40000,
        notes: "retry",
        completeQuest: false,
      },
      later,
    ).focus,
  ).toEqual(s.focus);
});
it("focus controls pause/resume their linked active-time session without adding elapsed time twice", () => {
  let s = start();
  s = apply(
    s,
    {
      type: "focusPause",
      id: "focus:science-session",
      now: Date.parse(later),
      sessionElapsedMs: 30000,
    },
    later,
  );
  expect(s.sessions?.[0]).toMatchObject({ phase: "paused", elapsedMs: 30000 });
  s = apply(
    s,
    {
      type: "focusResume",
      id: "focus:science-session",
      now: Date.parse(later),
    },
    later,
  );
  expect(s.sessions?.[0].phase).toBe("running");
  expect(s.sessions?.[0].elapsedMs).toBe(30000);
});
it("focus interval completion records context but never completes or double-rewards a quest", () => {
  let s = apply(
    initialState(),
    {
      type: "saveQuest",
      quest: {
        id: "q",
        title: "Real astronomy work",
        subject: "Science",
        room: "observatory",
        activity: "data-analysis",
        xp: 10,
        gold: 5,
      },
    },
    at,
  );
  s = apply(
    s,
    {
      type: "startSession",
      id: "s",
      runId: "r",
      categoryId: "science-data-analysis",
      questId: "q",
      targetMinutes: 1,
    },
    at,
  );
  s = apply(
    s,
    { type: "focusTick", id: "focus:s", now: Date.parse(at) + 60000 },
    "2026-11-26T10:01:00Z",
  );
  expect(s.quests.find((q) => q.id === "q")?.completed).toBeUndefined();
  expect([s.xp, s.gold]).toEqual([0, 0]);
  expect(s.focus?.history[0]).toMatchObject({
    room: "observatory",
    sessionId: "s",
    activity: "data-analysis",
  });
  s = apply(
    s,
    {
      type: "finishSession",
      id: "s",
      runId: "r",
      elapsedMs: 60000,
      notes: "Finished",
      completeQuest: true,
    },
    later,
  );
  s = apply(s, { type: "complete", id: "q" }, later);
  expect([s.xp, s.gold]).toEqual([10, 5]);
});
it("science journal entries round-trip metadata and deletion never changes rewards or sessions", () => {
  let s = start(false);
  s = apply(
    s,
    {
      type: "saveDiscovery",
      discovery: {
        id: "entry",
        title: "My notes",
        body: "User-entered observations only",
        at,
        observation: {
          observedAt: at,
          category: "data-analysis",
          results: "Period estimate: 2 days (my measurement)",
          sourceUrl: "https://example.org/paper",
          localReference: "/local/analysis.csv",
          sessionId: "science-session",
          questId: "previous-quest",
          courseId: "project",
          nextSteps: "Check my result",
        },
      },
    },
    at,
  );
  expect(parseSave(serializeSave(s))).toEqual(s);
  const before = s;
  s = apply(s, { type: "deleteDiscovery", id: "entry" }, later);
  expect(s.sessions).toEqual(before.sessions);
  expect([s.xp, s.gold]).toEqual([0, 0]);
});
it("rejects unsafe source URLs, malformed dates and oversized metadata", () => {
  const base = { observedAt: at, category: "observation" };
  for (const bad of [
    { sourceUrl: "javascript:alert(1)" },
    { sourceUrl: "file:///private/file" },
    { sourceUrl: "https://name:secret@example.org" },
    { observedAt: "wrong" },
    { category: "invented" },
    { results: "x".repeat(4001) },
  ])
    expect(() => observationDetails({ ...base, ...bad })).toThrow();
  expect(() =>
    validateSave({
      ...initialState(),
      discoveries: [
        {
          id: "x",
          title: "x",
          body: "",
          at,
          observation: { ...base, sourceUrl: "data:text/html,hello" },
        },
      ],
    }),
  ).toThrow();
});
it("optional category collection preserves custom names/mappings and adds missing IDs once", () => {
  const custom = {
    ...initialState(),
    categories: [
      {
        id: "science-data-analysis",
        title: "My custom name",
        room: "observatory" as const,
      },
    ],
  };
  const s = apply(custom, { type: "addScienceCategories" }, at);
  expect(s.categories?.[0].title).toBe("My custom name");
  expect(s.categories).toHaveLength(6);
  expect(apply(s, { type: "addScienceCategories" }, at).categories).toEqual(
    s.categories,
  );
});
it.each(scienceKinds)(
  "maps explicit %s to a valid Observatory focus activity",
  (kind) => {
    const s = apply(
      initialState(),
      {
        type: "focusStart",
        id: kind,
        now: Date.parse(at),
        phase: "focus",
        activity: kind,
        room: "observatory",
        objective: "User activity",
      },
      at,
    );
    expect(focusPlan("observatory", s.focus?.current)?.activity).toBeTruthy();
    expect(scienceIntent(`science-${kind}`)).toBe(kind);
    expect(parseSave(serializeSave(s))).toEqual(s);
  },
);

it("stale timer controls cannot resume a different paused scientific session", () => {
  const s = apply(
    start(),
    {
      type: "pauseSession",
      id: "science-session",
      runId: "run",
      elapsedMs: 1000,
    },
    later,
  );
  expect(
    apply(
      s,
      { type: "focusResume", id: "an-older-timer", now: Date.parse(later) },
      later,
    ),
  ).toEqual(s);
  expect(
    apply(
      s,
      {
        type: "focusPause",
        id: "an-older-timer",
        now: Date.parse(later),
        sessionElapsedMs: 50000,
      },
      later,
    ),
  ).toEqual(s);
});

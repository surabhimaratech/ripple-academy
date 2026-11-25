import { describe, it, expect } from "vitest";
import { apply } from "./model";
import { legacyState as initialState } from "./legacyFixture";
import { categories, activeSession, academicRank } from "./sessions";
import { serializeSave, parseSave, validateSave } from "./save";
const start = {
  type: "startSession" as const,
  id: "s",
  runId: "run",
  categoryId: "coding",
  questId: "reading",
};
describe("real-world sessions", () => {
  it("maps defaults to the correct room and snapshots an activity when starting", () => {
    const old = initialState();
    expect(categories(old).find((c) => c.id === "coding")?.room).toBe(
      "personal-study",
    );
    expect(categories(old).find((c) => c.id === "reading")?.room).toBe(
      "grand-library",
    );
    expect(categories(old).find((c) => c.id === "physics")?.room).toBe(
      "observatory",
    );
    const s = apply(old, start, "2026-11-24");
    expect(activeSession(s)).toMatchObject({
      title: "Coding",
      room: "personal-study",
      phase: "running",
      elapsedMs: 0,
    });
    expect(s.xp).toBe(0);
    expect(s.gold).toBe(0);
  });
  it("supports configurable activities without rewriting existing sessions", () => {
    let s = apply(initialState(), start);
    s = apply(s, {
      type: "saveCategory",
      category: { id: "coding", title: "Gentle coding", room: "grand-library" },
    });
    expect(activeSession(s)?.room).toBe("personal-study");
    expect(categories(s).find((c) => c.id === "coding")?.room).toBe(
      "grand-library",
    );
  });
  it("checkpoints max-merge elapsed time instead of adding duplicate tab time", () => {
    let s = apply(initialState(), start);
    s = apply(s, {
      type: "checkpointSession",
      id: "s",
      runId: "run",
      elapsedMs: 10000,
    });
    s = apply(s, {
      type: "checkpointSession",
      id: "s",
      runId: "run",
      elapsedMs: 10000,
    });
    s = apply(s, {
      type: "checkpointSession",
      id: "s",
      runId: "run",
      elapsedMs: 9000,
    });
    expect(activeSession(s)?.elapsedMs).toBe(10000);
  });
  it("pauses, ignores paused checkpoints, resumes with a new run and rejects stale controls", () => {
    let s = apply(initialState(), start);
    s = apply(s, {
      type: "pauseSession",
      id: "s",
      runId: "run",
      elapsedMs: 12000,
    });
    s = apply(s, {
      type: "checkpointSession",
      id: "s",
      runId: "run",
      elapsedMs: 20000,
    });
    expect(activeSession(s)?.elapsedMs).toBe(12000);
    s = apply(s, { type: "resumeSession", id: "s", runId: "next" });
    s = apply(s, {
      type: "checkpointSession",
      id: "s",
      runId: "run",
      elapsedMs: 30000,
    });
    expect(activeSession(s)?.elapsedMs).toBe(12000);
    expect(() =>
      apply(s, {
        type: "finishSession",
        id: "s",
        runId: "run",
        elapsedMs: 40000,
        completeQuest: true,
        notes: "",
      }),
    ).toThrow(/another window/);
  });
  it("finishes a session and its quest atomically, without duplicate XP on retry or separate quest completion", () => {
    let s = apply(initialState(), start);
    const finish = {
      type: "finishSession" as const,
      id: "s",
      runId: "run",
      elapsedMs: 25000,
      completeQuest: true,
      notes: "A thoughtful chapter.",
    };
    s = apply(s, finish);
    s = apply(s, finish);
    s = apply(s, { type: "complete", id: "reading" });
    expect([s.xp, s.gold]).toEqual([40, 15]);
    expect(s.sessions?.[0]).toMatchObject({
      phase: "finished",
      notes: finish.notes,
      elapsedMs: 25000,
    });
    expect(s.sessions?.[0].finishedAt).toBeTruthy();
    expect(activeSession(s)).toBeUndefined();
  });
  it("does not reward a quest already completed before its session ends", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, start);
    s = apply(s, {
      type: "finishSession",
      id: "s",
      runId: "run",
      elapsedMs: 5000,
      completeQuest: true,
      notes: "",
    });
    expect([s.xp, s.gold]).toEqual([40, 15]);
  });
  it("can record sessions without completing a quest or awarding anything", () => {
    let s = apply(initialState(), { ...start, questId: undefined });
    s = apply(s, {
      type: "finishSession",
      id: "s",
      runId: "run",
      elapsedMs: 20000,
      completeQuest: false,
      notes: "",
    });
    expect([s.xp, s.gold]).toEqual([0, 0]);
    expect(s.sessions?.[0].phase).toBe("finished");
  });
  it("undo reverses a session-completed quest exactly once and session retry cannot re-award it", () => {
    let s = apply(initialState(), start);
    const finish = {
      type: "finishSession" as const,
      id: "s",
      runId: "run",
      elapsedMs: 10000,
      completeQuest: true,
      notes: "",
    };
    s = apply(s, finish);
    s = apply(s, { type: "undo", id: "reading" });
    s = apply(s, finish);
    expect([s.xp, s.gold]).toEqual([0, 0]);
    expect(s.quests[0].completed).toBeUndefined();
  });
  it("rejects simultaneous active sessions, invalid timers and unknown mappings", () => {
    const s = apply(initialState(), start);
    expect(() => apply(s, { ...start, id: "another" })).toThrow(
      /current session/,
    );
    expect(() =>
      apply(initialState(), { ...start, categoryId: "unknown" }),
    ).toThrow();
    expect(() =>
      apply(initialState(), { ...start, targetMinutes: 0 }),
    ).toThrow();
    expect(() =>
      apply(initialState(), { ...start, targetMinutes: 2.5 }),
    ).toThrow();
  });
  it("preserves session history and mappings through JSON round-trip without changing old saves", () => {
    const old = initialState();
    expect(parseSave(serializeSave(old))).toEqual(old);
    let s = apply(old, { ...start, targetMinutes: 25 });
    s = apply(s, {
      type: "saveCourse",
      course: {
        id: "c",
        title: "A course of my own",
        subject: "Curiosity",
        room: "personal-study",
        description: "A quiet intention.",
        active: true,
      },
    });
    expect(parseSave(serializeSave(s))).toEqual(s);
  });
  it("validates imported session data and prevents multiple unfinished sessions", () => {
    const s = apply(initialState(), start);
    expect(() =>
      validateSave({ ...s, sessions: [{ ...s.sessions![0], elapsedMs: -1 }] }),
    ).toThrow();
    expect(() =>
      validateSave({
        ...s,
        sessions: [s.sessions![0], { ...s.sessions![0], id: "two" }],
      }),
    ).toThrow(/one session/);
    expect(() =>
      validateSave({
        ...s,
        categories: [{ id: "a", title: "A", room: "dungeon" }],
      }),
    ).toThrow();
  });
  it("personal curriculum is editable, archivable and removable without changing balances", () => {
    let s = apply(initialState(), {
      type: "saveCourse",
      course: {
        id: "c",
        title: "Physics",
        subject: "Science",
        room: "observatory",
        description: "Look closer.",
        active: true,
      },
    });
    s = apply(s, {
      type: "saveCourse",
      course: { ...s.courses![0], active: false },
    });
    expect(s.courses).toHaveLength(1);
    expect(s.courses![0].active).toBe(false);
    s = apply(s, { type: "deleteCourse", id: "c" });
    expect(s.courses).toEqual([]);
    expect([s.xp, s.gold]).toEqual([0, 0]);
  });
  it("academic titles derive from XP without introducing another economy", () => {
    expect(academicRank(0)).toBe("Curious scholar");
    expect(academicRank(100)).toBe("Inquisitive scholar");
    expect(academicRank(400)).toBe("Independent scholar");
  });
});

import "fake-indexeddb/auto";
import { describe, it, expect } from "vitest";
import { initialState, apply } from "./model";
import { defaultFocus, reduceFocus, remaining, validateFocus } from "./focus";
import { parseQuestCollection, starterQuests } from "./questDetails";
import { serializeSave, parseSave, validateSave } from "./save";
import { legacyState } from "./legacyFixture";
import { Repository } from "../persistence/repository";
const start = {
  type: "focusStart" as const,
  id: "first",
  now: 100000,
  phase: "focus" as const,
  activity: "system-design" as const,
  objective: "Explain tradeoffs",
  questId: "starter-systems",
};
const tick = (id: string, now: number) => ({
  type: "focusTick" as const,
  id,
  now,
});
describe("timestamp focus clock", () => {
  it("defaults to 25/5/15, pauses exactly, resumes after reload and resets without awards", () => {
    let f = reduceFocus(undefined, start);
    expect(f.settings).toMatchObject({
      focus: 25,
      "short-break": 5,
      "long-break": 15,
    });
    expect(remaining(f.current, 110000)).toBe(1490000);
    f = reduceFocus(f, { type: "focusPause", id: "first", now: 110000 });
    expect(remaining(f.current, 99999999)).toBe(1490000);
    f = validateFocus(JSON.parse(JSON.stringify(f)));
    f = reduceFocus(f, { type: "focusResume", id: "first", now: 2000000 });
    expect(remaining(f.current, 2001000)).toBe(1489000);
    f = reduceFocus(f, { type: "focusReset", id: "first", now: 2001000 });
    expect(f.current).toMatchObject({ status: "ready", remainingMs: 1500000 });
    expect(f.history).toEqual([]);
  });
  it("reconciles a hidden or closed tab once, records original deadline, waits for a break", () => {
    let f = reduceFocus(undefined, start);
    f = reduceFocus(f, tick("first", 99999999));
    expect(f.history).toHaveLength(1);
    expect(f.history[0].endedAt).toBe(1600000);
    expect(f.current).toMatchObject({
      phase: "short-break",
      status: "ready",
      remainingMs: 300000,
    });
    expect(reduceFocus(f, tick("first", 99999999))).toEqual(f);
  });
  it("auto advances only one interval on return and selects a long break each fourth focus", () => {
    let f = defaultFocus();
    f.settings.autoAdvance = true;
    f.cycles = 3;
    f = reduceFocus(f, start);
    f = reduceFocus(f, tick("first", 99999999));
    expect(f.current).toMatchObject({
      phase: "long-break",
      status: "running",
      deadline: 100899999,
    });
    expect(f.history).toHaveLength(1);
    const id = f.current!.id;
    f = reduceFocus(f, tick(id, 100899999));
    expect(f.current?.phase).toBe("focus");
    expect(f.cycles).toBe(4);
  });
  it("ignores stale pause/reset commands after expiry and rejects invalid durations/imports", () => {
    const f = reduceFocus(
      reduceFocus(undefined, start),
      tick("first", 1600000),
    );
    expect(
      reduceFocus(f, { type: "focusPause", id: "first", now: 1600001 }),
    ).toEqual(f);
    for (const duration of [0, 1.5, 241, NaN])
      expect(() =>
        reduceFocus(f, {
          type: "focusSettings",
          settings: { ...f.settings, focus: duration },
        }),
      ).toThrow();
    expect(() =>
      validateFocus({
        ...f,
        current: { ...f.current, status: "running", deadline: undefined },
      }),
    ).toThrow();
  });
});
describe("real-world quests and additive saves", () => {
  it("starts new scholars with exactly three actionable quests totaling 35 XP and 11 gold", () => {
    const s = initialState();
    expect(s.quests).toHaveLength(3);
    expect(s.quests.reduce((n, q) => n + q.xp, 0)).toBe(35);
    expect(s.quests.reduce((n, q) => n + q.gold, 0)).toBe(11);
    expect([s.xp, s.gold]).toEqual([0, 0]);
    expect(s.quests.map((q) => q.title)).toEqual([
      "Architect of Systems",
      "The Art of Artificial Intelligence",
      "Letters Beyond the Gates",
    ]);
  });
  it("leaves old saves intact and optionally adds the collection only once", () => {
    const old = legacyState();
    delete old.starterCollectionAdded;
    expect(validateSave(old)).toEqual(old);
    const next = apply(old, {
      type: "importQuests",
      quests: starterQuests(),
      starter: true,
    });
    expect(next.quests.slice(0, 3)).toEqual(old.quests);
    expect(next.quests).toHaveLength(6);
    expect(
      apply(next, {
        type: "importQuests",
        quests: starterQuests(),
        starter: true,
      }),
    ).toEqual(next);
  });
  it("records multiple timers but requires explicit exactly-once completion, and undo uses snapshot", () => {
    let s = apply(initialState(), start);
    s = apply(s, tick("first", 1600000));
    s = apply(s, { ...start, id: "second", now: 1700000 });
    s = apply(s, tick("second", 3200000));
    expect(s.focus?.history).toHaveLength(2);
    expect(s.quests[0].completed).toBeUndefined();
    expect([s.xp, s.gold]).toEqual([0, 0]);
    s = apply(s, { type: "complete", id: "starter-systems" });
    s = apply(s, { type: "complete", id: "starter-systems" });
    expect([s.xp, s.gold]).toEqual([15, 5]);
    s = apply(s, {
      type: "saveQuest",
      quest: {
        ...s.quests[0],
        xp: 100,
        gold: 100,
        notes: "Good tradeoff discussion",
      },
    });
    s = apply(s, { type: "undo", id: "starter-systems" });
    s = apply(s, { type: "undo", id: "starter-systems" });
    expect([s.xp, s.gold]).toEqual([0, 0]);
    expect(s.focus?.history).toHaveLength(2);
    expect(parseSave(serializeSave(s))).toEqual(s);
  });
  it("previews structured imports with field errors and never imports completed awards", () => {
    const envelope = (quests: unknown[]) =>
      JSON.stringify({ format: "ripple-academy-quests", version: 1, quests });
    const q = {
      title: "A useful experiment",
      objective: "Explain one architecture",
      category: "Systems",
      xp: 8,
      gold: 2,
      subtasks: ["Sketch alternatives"],
      room: "personal-study",
      activity: "system-design",
    };
    const parsed = parseQuestCollection(envelope([q]), [], () => "new");
    expect(parsed[0].subtasks?.[0].done).toBe(false);
    expect(
      apply(initialState(), { type: "importQuests", quests: parsed }).xp,
    ).toBe(0);
    for (const bad of [
      { ...q, xp: -1 },
      { ...q, completed: {} },
      { ...q, room: "kitchen" },
      { ...q, subtasks: [4] },
    ])
      expect(() =>
        parseQuestCollection(envelope([q, bad]), [], () => crypto.randomUUID()),
      ).toThrow(/Quest 2:/);
    expect(() =>
      parseQuestCollection(envelope([{ ...q, id: "exists" }]), ["exists"]),
    ).toThrow(/Duplicate/);
    expect(() =>
      parseQuestCollection(
        envelope([q, { ...q, id: "repeat" }, { ...q, id: "repeat" }]),
      ),
    ).toThrow(/Quest 3:/);
  });
  it("rolls back an entire bulk operation when one quest is invalid", async () => {
    const r = new Repository(crypto.randomUUID());
    const old = await r.transact();
    await expect(
      r.transact({
        type: "importQuests",
        quests: [
          { ...old.quests[0], id: "good" },
          { ...old.quests[0], id: "bad", xp: -1 },
        ],
      }),
    ).rejects.toThrow();
    expect(await r.transact()).toEqual(old);
    await r.close();
  });
  it("serializes concurrent expiry/completion across tabs and persists focus through restart", async () => {
    const name = crypto.randomUUID();
    let a = new Repository(name);
    const b = new Repository(name);
    await a.transact(start);
    await Promise.all([
      a.transact(tick("first", 1600000)),
      b.transact(tick("first", 1600000)),
    ]);
    let saved = await a.transact();
    expect(saved.focus?.history).toHaveLength(1);
    expect(saved.xp).toBe(0);
    await Promise.all([
      a.transact({ type: "complete", id: "starter-systems" }),
      b.transact({ type: "complete", id: "starter-systems" }),
    ]);
    await a.close();
    a = new Repository(name);
    saved = await a.transact();
    expect([saved.xp, saved.gold]).toEqual([15, 5]);
    expect(saved.focus?.history).toHaveLength(1);
    await a.transact({ type: "undo", id: "starter-systems" });
    expect((await a.transact()).xp).toBe(0);
    await a.close();
    await b.close();
  });
});

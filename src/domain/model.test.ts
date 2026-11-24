import { describe, it, expect } from "vitest";
import { apply, initialState, progression } from "./model";
describe("progression and quests", () => {
  it("calculates level boundaries", () => {
    expect(progression(0)).toEqual({ level: 1, current: 0, needed: 100 });
    expect(progression(99).level).toBe(1);
    expect(progression(100)).toEqual({ level: 2, current: 0, needed: 300 });
    expect(progression(400).level).toBe(3);
  });
  it("awards exactly once and reverses exactly once", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, { type: "complete", id: "reading" });
    expect([s.xp, s.gold]).toEqual([40, 15]);
    s = apply(s, { type: "undo", id: "reading" });
    s = apply(s, { type: "undo", id: "reading" });
    expect([s.xp, s.gold]).toEqual([0, 0]);
    s = apply(s, { type: "complete", id: "reading" });
    expect(s.xp).toBe(40);
  });
  it("undo uses original award after editing", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, {
      type: "saveQuest",
      quest: { ...s.quests[0], xp: 900, gold: 900 },
    });
    s = apply(s, { type: "undo", id: "reading" });
    expect([s.xp, s.gold]).toEqual([0, 0]);
  });
  it("keeps earned rewards when deleting a quest", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, { type: "deleteQuest", id: "reading" });
    expect(s.xp).toBe(40);
    expect(s.quests).toHaveLength(2);
  });
  it("validates rewards and names", () => {
    expect(() =>
      apply(initialState(), {
        type: "saveReward",
        reward: { id: "x", title: "", cost: 3 },
      }),
    ).toThrow();
    expect(() =>
      apply(initialState(), {
        type: "saveQuest",
        quest: { id: "x", title: "x", subject: "x", xp: -1, gold: 2 },
      }),
    ).toThrow();
  });
});
describe("shop", () => {
  it("blocks insufficient gold without changing state", () => {
    const s = initialState();
    expect(() =>
      apply(s, { type: "redeem", id: "coffee", redemptionId: "1" }),
    ).toThrow();
    expect(s.gold).toBe(0);
    expect(s.history).toHaveLength(0);
  });
  it("deducts cost, records snapshot and ignores duplicate redemption IDs", () => {
    let s = { ...initialState(), gold: 100 };
    s = apply(
      s,
      { type: "redeem", id: "coffee", redemptionId: "1" },
      "2026-01-01",
    );
    s = apply(s, { type: "redeem", id: "coffee", redemptionId: "1" });
    expect(s.gold).toBe(70);
    expect(s.history).toEqual([
      {
        id: "1",
        title: "Coffee at a favorite café",
        cost: 30,
        at: "2026-01-01",
      },
    ]);
  });
  it("undo after spending fully reverses gold and blocks new purchases", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, {
      type: "saveReward",
      reward: { id: "small", title: "Treat", cost: 15 },
    });
    s = apply(s, { type: "redeem", id: "small", redemptionId: "a" });
    s = apply(s, { type: "undo", id: "reading" });
    expect(s.gold).toBe(-15);
    expect(s.xp).toBe(0);
    expect(s.history).toHaveLength(1);
    expect(() =>
      apply(s, { type: "redeem", id: "small", redemptionId: "b" }),
    ).toThrow();
  });
});

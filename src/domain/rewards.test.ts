import { it, expect } from "vitest";
import { apply, initialState } from "./model";
import { parseSave, serializeSave, validateSave } from "./save";
const at = "2026-11-25T12:00:00.000Z";
function ready(gold = 20) {
  return apply({ ...initialState(), gold }, { type: "addCafeStarters" }, at);
}
function pending(gold = 20) {
  return apply(
    ready(gold),
    {
      type: "prepareRedemption",
      id: "cafe-starter-coffee",
      intentId: "ticket",
    },
    at,
  );
}
it("adds optional editable starter rewards once without replacing custom or legacy rewards", () => {
  const old = initialState();
  const s = apply(old, { type: "addCafeStarters" }, at);
  expect(s.rewards.slice(0, 3)).toEqual(old.rewards);
  expect(s.rewards).toHaveLength(9);
  const edited = apply(
    s,
    {
      type: "saveReward",
      reward: {
        id: "cafe-starter-coffee",
        title: "My coffee",
        cost: 7,
        kind: "coffee",
      },
    },
    at,
  );
  expect(apply(edited, { type: "addCafeStarters" }, at).rewards).toEqual(
    edited.rewards,
  );
});
it("confirmation survives reload and repeated confirmations deduct once with XP unchanged", () => {
  const s = parseSave(serializeSave(pending()));
  expect(s.gold).toBe(20);
  const paid = apply(s, { type: "confirmRedemption", id: "ticket" }, at);
  const again = apply(
    parseSave(serializeSave(paid)),
    { type: "confirmRedemption", id: "ticket" },
    at,
  );
  expect(again.gold).toBe(15);
  expect(again.xp).toBe(s.xp);
  expect(again.history).toHaveLength(1);
  expect(again.history[0]).toMatchObject({
    kind: "coffee",
    cost: 5,
    visualPending: true,
  });
});
it("insufficient funds and changed prices do not charge or consume confirmation", () => {
  const s = pending(0);
  expect(() =>
    apply(s, { type: "confirmRedemption", id: "ticket" }, at),
  ).toThrow("more gold");
  expect(s.history).toHaveLength(0);
  const changed = apply(
    pending(),
    {
      type: "saveReward",
      reward: {
        id: "cafe-starter-coffee",
        title: "Coffee of your choice",
        cost: 7,
        kind: "coffee",
      },
    },
    at,
  );
  expect(() =>
    apply(changed, { type: "confirmRedemption", id: "ticket" }, at),
  ).toThrow("changed");
});
it("cancel refunds the immutable snapshot exactly once, even if reward edited or removed", () => {
  let s = apply(pending(), { type: "confirmRedemption", id: "ticket" }, at);
  s = apply(s, { type: "deleteReward", id: "cafe-starter-coffee" }, at);
  s = apply(s, { type: "cancelRedemption", id: "ticket" }, at);
  expect(s.gold).toBe(20);
  expect(s.history[0].cancelledAt).toBe(at);
  expect(apply(s, { type: "cancelRedemption", id: "ticket" }, at).gold).toBe(
    20,
  );
  expect(
    apply(s, { type: "enjoyRedemption", id: "ticket" }, at).history[0]
      .enjoyedAt,
  ).toBeUndefined();
  expect(parseSave(serializeSave(s)).gold).toBe(20);
});
it("enjoyed rewards cannot be refunded and visual completion never marks real-world enjoyment", () => {
  let s = apply(pending(), { type: "confirmRedemption", id: "ticket" }, at);
  s = apply(s, { type: "finishRewardVisual", id: "ticket" }, at);
  expect(s.history[0].enjoyedAt).toBeUndefined();
  expect(s.gold).toBe(15);
  s = apply(s, { type: "enjoyRedemption", id: "ticket" }, at);
  expect(apply(s, { type: "cancelRedemption", id: "ticket" }, at).gold).toBe(
    15,
  );
});
it("validates new fields and preserves old history without inferring usage", () => {
  const legacy = {
    ...initialState(),
    history: [{ id: "old", title: "A book", cost: 3, at }],
  };
  expect(validateSave(legacy)).toEqual(legacy);
  const paid = apply(
    pending(),
    { type: "confirmRedemption", id: "ticket" },
    at,
  );
  for (const bad of [
    { kind: "unsafe" },
    { visualPending: "yes" },
    { enjoyedAt: at, cancelledAt: at },
    { cancelledAt: at, visualPending: true },
  ])
    expect(() =>
      validateSave({ ...paid, history: [{ ...paid.history[0], ...bad }] }),
    ).toThrow();
});
it("refund and quest undo compose correctly in either order, including negative gold", () => {
  let s = ready(0);
  s = apply(
    s,
    {
      type: "saveQuest",
      quest: {
        id: "q",
        title: "Real effort",
        subject: "Learning",
        xp: 15,
        gold: 5,
      },
    },
    at,
  );
  s = apply(s, { type: "complete", id: "q" }, at);
  s = apply(
    s,
    { type: "prepareRedemption", id: "cafe-starter-coffee", intentId: "t" },
    at,
  );
  s = apply(s, { type: "confirmRedemption", id: "t" }, at);
  s = apply(s, { type: "undo", id: "q" }, at);
  expect(s.gold).toBe(-5);
  expect(s.xp).toBe(0);
  s = apply(s, { type: "cancelRedemption", id: "t" }, at);
  expect(s.gold).toBe(0);
  expect(validateSave(s).gold).toBe(0);
});
it("preserves the active focus timer exactly through purchase, usage and refund actions", () => {
  const original = apply(ready(), {
    type: "focusStart",
    phase: "focus",
    activity: "ai-engineering",
    objective: "A quiet interval",
    id: "f",
    now: 1000,
  });
  let s = apply(
    original,
    {
      type: "prepareRedemption",
      id: "cafe-starter-coffee",
      intentId: "timer-safe",
    },
    at,
  );
  s = apply(s, { type: "confirmRedemption", id: "timer-safe" }, at);
  s = apply(s, { type: "cancelRedemption", id: "timer-safe" }, at);
  expect(s.focus).toEqual(original.focus);
});

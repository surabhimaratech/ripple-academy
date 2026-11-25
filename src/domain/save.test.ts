import { describe, it, expect } from "vitest";
import { apply } from "./model";
import { legacyState as initialState } from "./legacyFixture";
import { parseSave, serializeSave, validateSave } from "./save";
import { unlockedKeepsakes } from "./keepsakes";
describe("save files", () => {
  it("imports pre-Ripple envelopes and exports the new identity without changing progress", () => {
    const state = apply(initialState(), { type: "complete", id: "reading" });
    const old = JSON.stringify({ format: "magical-university-save", state });
    expect(parseSave(old)).toEqual(state);
    const exported = serializeSave(parseSave(old));
    expect(JSON.parse(exported).format).toBe("ripple-academy-save");
    expect(parseSave(exported)).toEqual(state);
  });
  it("round trips legacy v1 saves without rewriting balances or IDs", () => {
    const legacy = initialState();
    expect(parseSave(serializeSave(legacy))).toEqual(legacy);
    expect(validateSave(legacy)).toEqual(legacy);
  });
  it("preserves completed reward snapshots, history and undo after import", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    s = apply(s, {
      type: "saveQuest",
      quest: { ...s.quests[0], xp: 999, gold: 999 },
    });
    s = apply(s, {
      type: "saveReward",
      reward: { id: "t", title: "Treat", cost: 15 },
    });
    s = apply(s, { type: "redeem", id: "t", redemptionId: "claim" });
    const imported = parseSave(serializeSave(s));
    expect(apply(imported, { type: "complete", id: "reading" }).xp).toBe(40);
    const undo = apply(imported, { type: "undo", id: "reading" });
    expect([undo.xp, undo.gold]).toEqual([0, -15]);
    expect(validateSave(undo)).toEqual(undo);
  });
  it.each([
    { version: 2 },
    { xp: -1 },
    { gold: NaN },
    { quests: [] },
    { quests: [{ ...initialState().quests[0], xp: 1.5 }] },
    { quests: [{ ...initialState().quests[0], gold: -1 }] },
    {
      quests: [
        {
          ...initialState().quests[0],
          completed: { xp: 40, gold: 15, at: "not-a-date" },
        },
      ],
    },
    { rewards: [{ id: "bad", title: " ", cost: 1 }] },
    { history: [{ id: "x", title: "Coffee", cost: 2, at: "not-a-date" }] },
    { keepsakes: ["invented"] },
    { discoveries: [{ id: "x", title: "X", body: [], at: "2026-01-01" }] },
  ])("rejects invalid import data (%j)", (patch) => {
    const bad = { ...initialState(), ...patch };
    if (
      "quests" in patch &&
      Array.isArray(patch.quests) &&
      patch.quests.length === 0
    )
      bad.xp = -1;
    expect(() => validateSave(bad)).toThrow();
  });
  it("rejects duplicate IDs, unsupported envelopes, malformed JSON and large files", () => {
    const s = initialState();
    s.quests.push(s.quests[0]);
    expect(() => validateSave(s)).toThrow(/Duplicate/);
    expect(() => parseSave("{")).toThrow(/JSON/);
    expect(() => parseSave(" ".repeat(5 * 1024 * 1024 + 1))).toThrow(/5 MB/);
    expect(() =>
      validateSave({ format: "other", state: initialState() }),
    ).toThrow(/format/);
  });
  it("rejects snapshots that could cause negative XP or unmatched gold on undo", () => {
    const s = apply(initialState(), { type: "complete", id: "reading" });
    expect(() => validateSave({ ...s, xp: 0 })).toThrow(/Balances/);
    expect(() => validateSave({ ...s, gold: 0 })).toThrow(/Balances/);
  });
  it("strips unknown and prototype-looking properties", () => {
    const s = JSON.parse(JSON.stringify(initialState()));
    s.quests[0].html = "<script/>";
    const clean = validateSave({ ...s, unexpected: "x" });
    expect(clean).not.toHaveProperty("unexpected");
    expect(clean.quests[0]).not.toHaveProperty("html");
  });
});
describe("discoveries and keepsakes", () => {
  it("creates, edits and deletes notes without awarding currencies", () => {
    let s = apply(initialState(), {
      type: "saveDiscovery",
      discovery: {
        id: "a",
        title: "A thought",
        body: "Look closer",
        at: "2026-01-01",
      },
    });
    expect([s.xp, s.gold]).toEqual([0, 0]);
    expect(s.discoveries).toHaveLength(1);
    s = apply(s, {
      type: "saveDiscovery",
      discovery: { ...s.discoveries![0], body: "Updated" },
    });
    expect(s.discoveries).toHaveLength(1);
    expect(s.discoveries![0].body).toBe("Updated");
    s = apply(s, { type: "deleteDiscovery", id: "a" });
    expect(s.discoveries).toEqual([]);
    expect(unlockedKeepsakes(s)).toContain("curious-mind");
  });
  it("retains earned keepsakes through completion undo and round trip", () => {
    let s = apply(initialState(), { type: "complete", id: "reading" });
    expect(unlockedKeepsakes(s)).toContain("first-page");
    s = apply(s, { type: "undo", id: "reading" });
    expect(s.xp).toBe(0);
    expect(unlockedKeepsakes(parseSave(serializeSave(s)))).toContain(
      "first-page",
    );
  });
  it("derives keepsakes for existing progress without a migration", () => {
    const s = initialState();
    s.xp = 100;
    expect(unlockedKeepsakes(s)).toContain("growing-light");
  });
});

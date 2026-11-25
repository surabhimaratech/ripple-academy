import { rewardKinds, type RewardKind } from "./rewards";
import { validateFocus } from "./focus";
import { questDetails } from "./questDetails";
import {
  validRoom,
  type ActivityCategory,
  type Course,
  type ActivitySession,
} from "./sessions";
import type { State, Quest, Reward, Redemption, Discovery } from "./model";
import { keepsakes } from "./keepsakes";
export const MAX_SAVE_BYTES = 5 * 1024 * 1024;
function record(v: unknown): Record<string, unknown> {
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw Error("Expected a save object.");
  return v as Record<string, unknown>;
}
function text(v: unknown, name: string, max = 120): string {
  if (typeof v !== "string" || !v.trim() || v.length > max)
    throw Error(`Invalid ${name}.`);
  return v;
}
function number(
  v: unknown,
  name: string,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
): number {
  if (typeof v !== "number" || !Number.isSafeInteger(v) || v < min || v > max)
    throw Error(`Invalid ${name}.`);
  return v;
}
function date(v: unknown): string {
  const s = text(v, "date", 64);
  if (!Number.isFinite(Date.parse(s))) throw Error("Invalid save date.");
  return s;
}
function list<T>(v: unknown, parse: (x: Record<string, unknown>) => T): T[] {
  if (!Array.isArray(v) || v.length > 10000) throw Error("Invalid save list.");
  const result = v.map((x) => parse(record(x)));
  const ids = result.map((x) => (x as { id: string }).id);
  if (new Set(ids).size !== ids.length) throw Error("Duplicate IDs in save.");
  return result;
}
const id = (v: unknown) => text(v, "ID", 128);
const rewardAmount = (v: unknown) => number(v, "reward amount", 0, 1000000);
function kind(v: unknown): RewardKind {
  if (!rewardKinds.includes(v as RewardKind))
    throw Error("Invalid reward presentation.");
  return v as RewardKind;
}
export function validateSave(input: unknown): State {
  let v = record(input);
  if ("format" in v) {
    if (
      !["magical-university-save", "ripple-academy-save"].includes(
        String(v.format),
      )
    )
      throw Error("Unrecognized save format.");
    v = record(v.state);
  }
  if (v.version !== 1) throw Error("This save version is not supported.");
  const quests = list<Quest>(v.quests, (q) => {
    const item: Quest = {
      ...questDetails(q),
      id: id(q.id),
      title: text(q.title, "quest title"),
      subject: text(q.subject, "subject"),
      xp: rewardAmount(q.xp),
      gold: rewardAmount(q.gold),
    };
    if (q.completed !== undefined) {
      const c = record(q.completed);
      item.completed = {
        xp: rewardAmount(c.xp),
        gold: rewardAmount(c.gold),
        at: date(c.at),
      };
    }
    return item;
  });
  const rewards = list<Reward>(v.rewards, (r) => ({
    id: id(r.id),
    title: text(r.title, "reward title"),
    cost: rewardAmount(r.cost),
    ...(r.kind !== undefined ? { kind: kind(r.kind) } : {}),
  }));
  const history = list<Redemption>(v.history, (h) => {
    if (h.enjoyedAt !== undefined && h.cancelledAt !== undefined)
      throw Error("A cancelled reward cannot be enjoyed.");
    if (h.visualPending !== undefined && typeof h.visualPending !== "boolean")
      throw Error("Invalid reward visual state.");
    if (h.cancelledAt !== undefined && h.visualPending === true)
      throw Error("Cancelled reward cannot have a pending visual.");
    return {
      id: id(h.id),
      title: text(h.title, "redemption title"),
      cost: rewardAmount(h.cost),
      at: date(h.at),
      ...(h.kind !== undefined ? { kind: kind(h.kind) } : {}),
      ...(h.visualPending !== undefined
        ? { visualPending: h.visualPending as boolean }
        : {}),
      ...(h.enjoyedAt !== undefined ? { enjoyedAt: date(h.enjoyedAt) } : {}),
      ...(h.cancelledAt !== undefined
        ? { cancelledAt: date(h.cancelledAt) }
        : {}),
    };
  });
  const result: State = {
    version: 1,
    xp: number(v.xp, "XP"),
    gold: number(v.gold, "gold", Number.MIN_SAFE_INTEGER),
    quests,
    rewards,
    history,
  };
  if (v.cafeStartersAdded !== undefined) {
    if (typeof v.cafeStartersAdded !== "boolean")
      throw Error("Invalid café starter flag.");
    result.cafeStartersAdded = v.cafeStartersAdded;
  }
  if (v.redemptionIntent !== undefined) {
    const i = record(v.redemptionIntent);
    result.redemptionIntent = {
      id: id(i.id),
      rewardId: id(i.rewardId),
      title: text(i.title, "reward title"),
      cost: rewardAmount(i.cost),
      kind: kind(i.kind),
      at: date(i.at),
    };
    if (history.some((h) => h.id === result.redemptionIntent!.id))
      throw Error("Confirmation already redeemed.");
  }
  if (v.focus !== undefined) result.focus = validateFocus(v.focus);
  if (v.starterCollectionAdded !== undefined) {
    if (typeof v.starterCollectionAdded !== "boolean")
      throw Error("Invalid starter collection flag.");
    result.starterCollectionAdded = v.starterCollectionAdded;
  }
  if (v.discoveries !== undefined)
    result.discoveries = list<Discovery>(v.discoveries, (d) => {
      if (typeof d.body !== "string" || d.body.length > 10000)
        throw Error("Invalid discovery text.");
      return {
        id: id(d.id),
        title: text(d.title, "discovery title"),
        body: d.body,
        at: date(d.at),
      };
    });
  if (v.keepsakes !== undefined) {
    if (
      !Array.isArray(v.keepsakes) ||
      v.keepsakes.some((x) => !keepsakes.some((k) => k.id === x)) ||
      new Set(v.keepsakes).size !== v.keepsakes.length
    )
      throw Error("Invalid keepsakes.");
    result.keepsakes = [...v.keepsakes] as string[];
  }
  if (v.categories !== undefined)
    result.categories = list<ActivityCategory>(v.categories, (c) => {
      if (!validRoom(c.room)) throw Error("Invalid activity room.");
      return {
        id: id(c.id),
        title: text(c.title, "activity title"),
        room: c.room,
      };
    });
  if (v.courses !== undefined)
    result.courses = list<Course>(v.courses, (c) => {
      if (
        !validRoom(c.room) ||
        typeof c.active !== "boolean" ||
        typeof c.description !== "string" ||
        c.description.length > 10000
      )
        throw Error("Invalid course.");
      return {
        id: id(c.id),
        title: text(c.title, "course title"),
        subject: text(c.subject, "course subject"),
        room: c.room,
        description: c.description,
        active: c.active,
      };
    });
  if (v.sessions !== undefined) {
    result.sessions = list<ActivitySession>(v.sessions, (x) => {
      if (
        !validRoom(x.room) ||
        !["running", "paused", "finished"].includes(x.phase as string)
      )
        throw Error("Invalid session.");
      const value: ActivitySession = {
        id: id(x.id),
        categoryId: id(x.categoryId),
        title: text(x.title, "session title"),
        room: x.room,
        phase: x.phase as ActivitySession["phase"],
        elapsedMs: number(x.elapsedMs, "session time", 0, 31536000000),
        runId: id(x.runId),
        startedAt: date(x.startedAt),
      };
      if (x.questId !== undefined) value.questId = id(x.questId);
      if (x.courseId !== undefined) value.courseId = id(x.courseId);
      if (x.targetMinutes !== undefined)
        value.targetMinutes = number(x.targetMinutes, "focus minutes", 1, 1440);
      if (x.notes !== undefined) {
        if (typeof x.notes !== "string" || x.notes.length > 10000)
          throw Error("Invalid session notes.");
        value.notes = x.notes;
      }
      if (x.finishedAt !== undefined) value.finishedAt = date(x.finishedAt);
      if (value.phase === "finished" && !value.finishedAt)
        throw Error("Finished session is missing its date.");
      return value;
    });
    if (result.sessions.filter((x) => x.phase !== "finished").length > 1)
      throw Error("Only one session can be active.");
  }
  // Deleted quests can retain earnings. Active snapshots must still be reversible.
  const activeXP = quests.reduce((n, q) => n + (q.completed?.xp ?? 0), 0);
  const activeGold = quests.reduce((n, q) => n + (q.completed?.gold ?? 0), 0);
  const spent = history.reduce((n, h) => n + (h.cancelledAt ? 0 : h.cost), 0);
  if (result.xp < activeXP || result.gold < activeGold - spent)
    throw Error("Balances do not match the completion and redemption records.");
  return result;
}
export function parseSave(json: string): State {
  if (new TextEncoder().encode(json).length > MAX_SAVE_BYTES)
    throw Error("Save files must be smaller than 5 MB.");
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw Error("This file is not valid JSON.");
  }
  return validateSave(value);
}
export function serializeSave(state: State): string {
  return JSON.stringify(
    {
      format: "ripple-academy-save",
      exportedAt: new Date().toISOString(),
      state: validateSave(state),
    },
    null,
    2,
  );
}

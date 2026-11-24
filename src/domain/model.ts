import {
  reduceSessions,
  type SessionAction,
  type ActivityCategory,
  type Course,
  type ActivitySession,
} from "./sessions";
import { unlockedKeepsakes } from "./keepsakes";
export interface Quest {
  id: string;
  title: string;
  subject: string;
  xp: number;
  gold: number;
  completed?: { xp: number; gold: number; at: string };
}
export interface Reward {
  id: string;
  title: string;
  cost: number;
}
export interface Redemption {
  id: string;
  title: string;
  cost: number;
  at: string;
}
export interface Discovery {
  id: string;
  title: string;
  body: string;
  at: string;
}
export interface State {
  version: 1;
  categories?: ActivityCategory[];
  courses?: Course[];
  sessions?: ActivitySession[];
  discoveries?: Discovery[];
  keepsakes?: string[];
  xp: number;
  gold: number;
  quests: Quest[];
  rewards: Reward[];
  history: Redemption[];
}
export const initialState = (): State => ({
  version: 1,
  xp: 0,
  gold: 0,
  quests: [
    {
      id: "reading",
      title: "Read a chapter of something wonderful",
      subject: "Literature",
      xp: 40,
      gold: 15,
    },
    {
      id: "curiosity",
      title: "Follow a thread of curiosity",
      subject: "Discovery",
      xp: 30,
      gold: 10,
    },
    {
      id: "create",
      title: "Make a little time to create",
      subject: "Creative arts",
      xp: 50,
      gold: 20,
    },
  ],
  rewards: [
    { id: "coffee", title: "Coffee at a favorite café", cost: 30 },
    { id: "book", title: "A new book for the shelf", cost: 80 },
    { id: "movie", title: "A cozy movie night", cost: 40 },
  ],
  history: [],
});
export function progression(xp: number) {
  const level = Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1;
  const floor = 100 * (level - 1) ** 2;
  const next = 100 * level ** 2;
  return { level, current: xp - floor, needed: next - floor };
}
export function amount(n: number) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 1000000)
    throw Error("Use a whole number between 0 and 1,000,000.");
  return n;
}
export function title(s: string) {
  if (!s.trim() || s.trim().length > 120)
    throw Error("Please enter a title of 1–120 characters.");
  return s.trim();
}
export type Action =
  | SessionAction
  | { type: "saveDiscovery"; discovery: Discovery }
  | { type: "deleteDiscovery"; id: string }
  | { type: "saveQuest"; quest: Quest }
  | { type: "deleteQuest"; id: string }
  | { type: "complete" | "undo"; id: string }
  | { type: "saveReward"; reward: Reward }
  | { type: "deleteReward"; id: string }
  | { type: "redeem"; id: string; redemptionId: string };
export function apply(
  state: State,
  action: Action,
  at = new Date().toISOString(),
): State {
  const s = structuredClone(state);
  reduceSessions(s, action as SessionAction, at, (id) => {
    const q = s.quests.find((x) => x.id === id);
    if (q && !q.completed) {
      q.completed = { xp: q.xp, gold: q.gold, at };
      s.xp += q.xp;
      s.gold += q.gold;
    }
  });
  // Keep earned mementos through undo; old saves derive them lazily.
  s.keepsakes = unlockedKeepsakes(s);
  if (action.type === "saveDiscovery") {
    const d = action.discovery;
    if (d.body.length > 10000)
      throw Error("Keep each discovery under 10,000 characters.");
    const note = { ...d, title: title(d.title), at };
    s.discoveries = (s.discoveries ?? []).some((x) => x.id === d.id)
      ? s.discoveries!.map((x) => (x.id === d.id ? note : x))
      : [note, ...(s.discoveries ?? [])];
  }
  if (action.type === "deleteDiscovery")
    s.discoveries = (s.discoveries ?? []).filter((x) => x.id !== action.id);
  if (action.type === "saveQuest") {
    const q = action.quest;
    const old = s.quests.find((x) => x.id === q.id);
    const value = {
      ...q,
      title: title(q.title),
      subject: title(q.subject),
      xp: amount(q.xp),
      gold: amount(q.gold),
      completed: old?.completed,
    };
    s.quests = old
      ? s.quests.map((x) => (x.id === q.id ? value : x))
      : [...s.quests, value];
  }
  if (action.type === "deleteQuest")
    s.quests = s.quests.filter((q) => q.id !== action.id);
  if (action.type === "complete" || action.type === "undo") {
    const q = s.quests.find((q) => q.id === action.id);
    if (!q) return s;
    if (action.type === "complete" && !q.completed) {
      q.completed = { xp: q.xp, gold: q.gold, at };
      s.xp += q.xp;
      s.gold += q.gold;
    } else if (action.type === "undo" && q.completed) {
      s.xp -= q.completed.xp;
      s.gold -= q.completed.gold;
      delete q.completed;
    }
  }
  if (action.type === "saveReward") {
    const r = {
      ...action.reward,
      title: title(action.reward.title),
      cost: amount(action.reward.cost),
    };
    s.rewards = s.rewards.some((x) => x.id === r.id)
      ? s.rewards.map((x) => (x.id === r.id ? r : x))
      : [...s.rewards, r];
  }
  if (action.type === "deleteReward")
    s.rewards = s.rewards.filter((r) => r.id !== action.id);
  if (action.type === "redeem") {
    if (s.history.some((h) => h.id === action.redemptionId)) return s;
    const r = s.rewards.find((r) => r.id === action.id);
    if (!r) throw Error("This reward is no longer available.");
    if (s.gold < r.cost)
      throw Error("A little more gold is needed for this reward.");
    s.gold -= r.cost;
    s.history.unshift({
      id: action.redemptionId,
      title: r.title,
      cost: r.cost,
      at,
    });
  }
  if (!Number.isSafeInteger(s.xp) || !Number.isSafeInteger(s.gold))
    throw Error("Balance limit reached.");
  s.keepsakes = unlockedKeepsakes(s);
  return s;
}

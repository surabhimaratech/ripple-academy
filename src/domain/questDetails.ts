import { scienceKinds } from "./science";
import type { Quest } from "./model";
import { validRoom } from "./sessions";
export const starterQuests = (): Quest[] => [
  {
    id: "starter-systems",
    title: "Architect of Systems",
    objective: "Complete one system design practice session.",
    subject: "System Design",
    xp: 15,
    gold: 5,
    estimatedMinutes: 60,
    room: "personal-study",
    activity: "system-design",
    priority: "normal",
    subtasks: [
      "Work through one system design problem",
      "Explain architecture and important trade-offs",
      "Identify weaknesses and areas for improvement",
    ].map((title, i) => ({ id: `systems-${i}`, title, done: false })),
  },
  {
    id: "starter-ai",
    title: "The Art of Artificial Intelligence",
    objective: "Prepare an interview-ready explanation of Asterisk.",
    subject: "Applied AI",
    xp: 10,
    gold: 3,
    estimatedMinutes: 45,
    room: "personal-study",
    activity: "ai-engineering",
    priority: "normal",
    subtasks: [
      "Explain the motivation and problem Asterisk solves",
      "Explain its architecture and LLM integration",
      "Discuss concept extraction, Sidequests and research provenance",
      "Explain technical decisions, limitations and future improvements",
      "Practice a concise verbal explanation",
    ].map((title, i) => ({ id: `ai-${i}`, title, done: false })),
  },
  {
    id: "starter-letters",
    title: "Letters Beyond the Gates",
    objective:
      "Send all planned recruiter and hiring-manager outreach and follow-ups.",
    subject: "Career Advancement",
    xp: 10,
    gold: 3,
    room: "personal-study",
    activity: "outreach",
    priority: "normal",
  },
];
export function questDetails(input: Record<string, unknown>): Partial<Quest> {
  const result: Partial<Quest> = {};
  for (const key of ["objective", "description", "notes"] as const)
    if (input[key] !== undefined) {
      if (
        typeof input[key] !== "string" ||
        input[key].length > (key === "objective" ? 120 : 10000)
      )
        throw Error(`Invalid quest ${key}.`);
      result[key] = input[key];
    }
  if (input.courseId !== undefined) {
    if (
      typeof input.courseId !== "string" ||
      !input.courseId ||
      input.courseId.length > 128
    )
      throw Error("Invalid quest project.");
    result.courseId = input.courseId;
  }
  if (input.priority !== undefined) {
    if (!["low", "normal", "high"].includes(String(input.priority)))
      throw Error("Invalid quest priority.");
    result.priority = input.priority as Quest["priority"];
  }
  if (input.room !== undefined) {
    if (!validRoom(input.room)) throw Error("Invalid quest room.");
    result.room = input.room;
  }
  if (input.activity !== undefined) {
    if (
      ![
        ...scienceKinds,
        "system-design",
        "ai-engineering",
        "outreach",
        "reading",
        "writing",
      ].includes(String(input.activity))
    )
      throw Error("Invalid quest activity.");
    result.activity = input.activity as Quest["activity"];
  }
  if (input.estimatedMinutes !== undefined) {
    if (
      !Number.isSafeInteger(input.estimatedMinutes) ||
      Number(input.estimatedMinutes) < 1 ||
      Number(input.estimatedMinutes) > 1440
    )
      throw Error("Estimated duration must be 1–1440 minutes.");
    result.estimatedMinutes = Number(input.estimatedMinutes);
  }
  if (input.subtasks !== undefined) {
    if (!Array.isArray(input.subtasks) || input.subtasks.length > 100)
      throw Error("Use at most 100 checklist items.");
    result.subtasks = input.subtasks.map((s: unknown) => {
      const v = s as { id: string; title: string; done: boolean };
      if (
        !v ||
        typeof v.id !== "string" ||
        !v.id ||
        v.id.length > 128 ||
        typeof v.title !== "string" ||
        !v.title.trim() ||
        v.title.length > 240 ||
        typeof v.done !== "boolean"
      )
        throw Error("Invalid checklist item.");
      return { id: v.id, title: v.title, done: v.done };
    });
    if (
      new Set(result.subtasks.map((s) => s.id)).size !== result.subtasks.length
    )
      throw Error("Duplicate checklist IDs.");
  }
  return result;
}
export function parseQuestCollection(
  json: string,
  existingIds: string[] = [],
  makeId: () => string = () => crypto.randomUUID(),
): Quest[] {
  if (new TextEncoder().encode(json).length > 250000)
    throw Error("Quest collections must be under 250 KB.");
  const data = JSON.parse(json);
  if (
    data?.format !== "ripple-academy-quests" ||
    data.version !== 1 ||
    !Array.isArray(data.quests) ||
    !data.quests.length ||
    data.quests.length > 100
  )
    throw Error(
      "Expected a ripple-academy-quests version 1 collection with 1–100 quests.",
    );
  const ids = new Set(existingIds);
  return data.quests.map((q: Record<string, unknown>, i: number) => {
    try {
      if (!q || typeof q !== "object" || "completed" in q)
        throw Error("Imported quests must be uncompleted.");
      for (const k of ["title", "objective", "category"])
        if (
          typeof q[k] !== "string" ||
          !String(q[k]).trim() ||
          String(q[k]).length > 120
        )
          throw Error(`Invalid ${k}.`);
      for (const k of ["xp", "gold"])
        if (
          !Number.isSafeInteger(q[k]) ||
          Number(q[k]) < 0 ||
          Number(q[k]) > 1000000
        )
          throw Error(`Invalid ${k}.`);
      const id = q.id === undefined ? makeId() : q.id;
      if (typeof id !== "string" || !id || id.length > 128 || ids.has(id))
        throw Error("Duplicate or invalid ID.");
      ids.add(id);
      if (q.subtasks !== undefined && !Array.isArray(q.subtasks))
        throw Error("subtasks must be a list of strings.");
      const raw = {
        ...q,
        subtasks:
          q.subtasks === undefined
            ? undefined
            : (q.subtasks as unknown[]).map((title, j) => ({
                id: `${j}`,
                title,
                done: false,
              })),
      };
      return {
        id,
        title: String(q.title),
        subject: String(q.category),
        xp: Number(q.xp),
        gold: Number(q.gold),
        ...questDetails(raw),
      };
    } catch (e) {
      throw Error(
        `Quest ${i + 1}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  });
}

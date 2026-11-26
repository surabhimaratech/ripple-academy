import { scienceCategories, sessionDetails } from "./science";
import type { State } from "./model";
export type Interior =
  "grand-library" | "personal-study" | "observatory" | "happy-cafe";
export type Location = Interior | "university";
export const roomNames: Record<Location, string> = {
  university: "Ripple Academy",
  "grand-library": "Grand Library",
  "personal-study": "Personal Study",
  observatory: "Observatory",
  "happy-cafe": "Happy Café",
};
export interface ActivityCategory {
  id: string;
  title: string;
  room: Interior;
}
export interface Course {
  id: string;
  title: string;
  subject: string;
  room: Interior;
  description: string;
  active: boolean;
}
export interface ActivitySession {
  id: string;
  categoryId: string;
  title: string;
  room: Interior;
  questId?: string;
  courseId?: string;
  phase: "running" | "paused" | "finished";
  elapsedMs: number;
  runId: string;
  startedAt: string;
  finishedAt?: string;
  targetMinutes?: number;
  objective?: string;
  experiment?: string;
  notes?: string;
}
export const defaultCategories: ActivityCategory[] = [
  { id: "coding", title: "Coding", room: "personal-study" },
  { id: "engineering", title: "Engineering", room: "personal-study" },
  { id: "interview", title: "Interview preparation", room: "personal-study" },
  { id: "journaling", title: "Journaling", room: "personal-study" },
  { id: "reading", title: "Reading & literature", room: "grand-library" },
  { id: "history", title: "History", room: "grand-library" },
  { id: "astronomy", title: "Astronomy", room: "observatory" },
  { id: "physics", title: "Physics", room: "observatory" },
  ...scienceCategories,
];
export function categories(s: State) {
  return s.categories ?? defaultCategories;
}
export function activeSession(s: State) {
  return s.sessions?.find((x) => x.phase !== "finished");
}
export function academicRank(xp: number) {
  return xp >= 900
    ? "Lifelong explorer"
    : xp >= 400
      ? "Independent explorer"
      : xp >= 100
        ? "Inquisitive explorer"
        : "Curious explorer";
}
export type SessionAction =
  | { type: "saveCategory"; category: ActivityCategory }
  | { type: "deleteCategory"; id: string }
  | { type: "saveCourse"; course: Course }
  | { type: "deleteCourse"; id: string }
  | {
      type: "startSession";
      id: string;
      categoryId: string;
      questId?: string;
      courseId?: string;
      targetMinutes?: number;
      objective?: string;
      experiment?: string;
      runId: string;
    }
  | {
      type: "checkpointSession" | "pauseSession";
      id: string;
      runId: string;
      elapsedMs: number;
    }
  | { type: "resumeSession"; id: string; runId: string }
  | {
      type: "finishSession";
      id: string;
      runId: string;
      elapsedMs: number;
      notes: string;
      completeQuest: boolean;
    };
function name(s: string) {
  if (!s.trim() || s.length > 120)
    throw Error("Please enter a title of 1–120 characters.");
  return s.trim();
}
export function validRoom(room: unknown): room is Interior {
  return [
    "grand-library",
    "personal-study",
    "observatory",
    "happy-cafe",
  ].includes(room as string);
}
function elapsed(n: number) {
  if (!Number.isSafeInteger(n) || n < 0 || n > 31536000000)
    throw Error("Session time is outside the supported range.");
  return n;
}
/** Mutates only the already-cloned transaction state; quest awards use the same completion function. */
export function reduceSessions(
  s: State,
  a: SessionAction,
  at: string,
  complete: (id: string) => void,
) {
  if (a.type === "saveCategory") {
    if (!validRoom(a.category.room)) throw Error("Choose a university room.");
    const value = { ...a.category, title: name(a.category.title) };
    s.categories = categories(s).some((c) => c.id === value.id)
      ? categories(s).map((c) => (c.id === value.id ? value : c))
      : [...categories(s), value];
  }
  if (a.type === "deleteCategory") {
    if (activeSession(s)?.categoryId === a.id)
      throw Error("Finish the current session before removing its category.");
    s.categories = categories(s).filter((c) => c.id !== a.id);
  }
  if (a.type === "saveCourse") {
    if (!validRoom(a.course.room)) throw Error("Choose a university room.");
    if (a.course.description.length > 10000)
      throw Error("Keep course notes under 10,000 characters.");
    const value = {
      ...a.course,
      title: name(a.course.title),
      subject: name(a.course.subject),
    };
    s.courses = (s.courses ?? []).some((c) => c.id === value.id)
      ? s.courses!.map((c) => (c.id === value.id ? value : c))
      : [...(s.courses ?? []), value];
  }
  if (a.type === "deleteCourse")
    s.courses = (s.courses ?? []).filter((c) => c.id !== a.id);
  if (a.type === "startSession") {
    if (s.sessions?.some((x) => x.id === a.id)) return;
    if (activeSession(s))
      throw Error("Finish the current session before starting another.");
    const category = categories(s).find((c) => c.id === a.categoryId);
    if (!category) throw Error("Choose an activity category.");
    if (a.questId && !s.quests.some((q) => q.id === a.questId))
      throw Error("This quest is no longer available.");
    if (a.courseId && !s.courses?.some((c) => c.id === a.courseId))
      throw Error("This course is no longer available.");
    if (
      a.targetMinutes !== undefined &&
      (!Number.isInteger(a.targetMinutes) ||
        a.targetMinutes < 1 ||
        a.targetMinutes > 1440)
    )
      throw Error("Use a focus timer between 1 and 1,440 minutes.");
    s.sessions = [
      {
        id: a.id,
        categoryId: category.id,
        title: category.title,
        room: category.room,
        questId: a.questId,
        courseId: a.courseId,
        phase: "running",
        elapsedMs: 0,
        runId: a.runId,
        startedAt: at,
        targetMinutes: a.targetMinutes,
        ...sessionDetails(a as unknown as Record<string, unknown>),
      },
      ...(s.sessions ?? []),
    ];
  }
  if (
    a.type === "checkpointSession" ||
    a.type === "pauseSession" ||
    a.type === "finishSession"
  ) {
    const session = s.sessions?.find((x) => x.id === a.id);
    if (!session) {
      if (a.type === "checkpointSession") return;
      throw Error("Session not found.");
    }
    if (session.phase === "finished") return;
    if (session.runId !== a.runId) {
      if (a.type === "checkpointSession") return;
      throw Error(
        "This session changed in another window. Refresh its controls and try again.",
      );
    }
    // Absolute elapsed checkpoints max-merge; simultaneous tabs cannot add time twice.
    if (a.type === "checkpointSession" && session.phase !== "running") return;
    session.elapsedMs = Math.max(session.elapsedMs, elapsed(a.elapsedMs));
    if (a.type === "pauseSession") session.phase = "paused";
    if (a.type === "finishSession") {
      if (a.notes.length > 10000)
        throw Error("Keep completion notes under 10,000 characters.");
      session.phase = "finished";
      session.finishedAt = at;
      session.notes = a.notes;
      if (a.completeQuest && session.questId) complete(session.questId);
    }
  }
  if (a.type === "resumeSession") {
    const session = s.sessions?.find((x) => x.id === a.id);
    if (!session || session.phase === "finished")
      throw Error("Only an unfinished session can be resumed.");
    if (session.phase === "running") return;
    session.phase = "running";
    session.runId = a.runId;
  }
}

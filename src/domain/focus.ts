import { validRoom, type Interior } from "./sessions";
import { scienceKinds, type ScienceKind } from "./science";
/** Wall-clock Pomodoro, deliberately independent of activity-session accounting and rewards. */
export type FocusPhase = "focus" | "short-break" | "long-break";
export type FocusActivity =
  | ScienceKind
  | "system-design"
  | "ai-engineering"
  | "outreach"
  | "reading"
  | "writing";
export interface FocusSettings {
  focus: number;
  "short-break": number;
  "long-break": number;
  autoAdvance: boolean;
  chime: boolean;
}
export interface FocusSegment {
  id: string;
  phase: FocusPhase;
  status: "running" | "paused" | "ready";
  durationMs: number;
  remainingMs: number;
  deadline?: number;
  startedAt?: number;
  questId?: string;
  objective: string;
  activity: FocusActivity;
  room?: Interior;
  sessionId?: string;
  courseId?: string;
}
export interface FocusRecord {
  id: string;
  phase: FocusPhase;
  durationMs: number;
  endedAt: number;
  questId?: string;
  objective: string;
  room?: Interior;
  sessionId?: string;
  courseId?: string;
  activity?: FocusActivity;
}
export interface FocusState {
  settings: FocusSettings;
  current?: FocusSegment;
  history: FocusRecord[];
  cycles: number;
}
export type FocusAction =
  | {
      type: "focusStart";
      id: string;
      now: number;
      phase: FocusPhase;
      questId?: string;
      objective: string;
      activity: FocusActivity;
      room?: Interior;
      sessionId?: string;
      courseId?: string;
      durationMinutes?: number;
    }
  | {
      type: "focusPause" | "focusResume" | "focusReset" | "focusTick";
      id: string;
      now: number;
      sessionElapsedMs?: number;
    }
  | { type: "focusSettings"; settings: FocusSettings };
export const defaultFocus = (): FocusState => ({
  settings: {
    focus: 25,
    "short-break": 5,
    "long-break": 15,
    autoAdvance: false,
    chime: false,
  },
  history: [],
  cycles: 0,
});
export function remaining(segment: FocusSegment | undefined, now: number) {
  return segment
    ? Math.min(
        segment.durationMs,
        Math.max(
          0,
          segment.status === "running"
            ? segment.deadline! - now
            : segment.remainingMs,
        ),
      )
    : 0;
}
export function validateFocus(input: unknown): FocusState {
  const f = structuredClone(input) as FocusState;
  const integer = (n: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) =>
    typeof n === "number" && Number.isSafeInteger(n) && n >= min && n <= max;
  const text = (s: unknown, max = 120) =>
    typeof s === "string" && s.length <= max;
  const phase = (s: unknown) =>
    ["focus", "short-break", "long-break"].includes(String(s));
  if (
    !f ||
    !f.settings ||
    !Array.isArray(f.history) ||
    f.history.length > 10000 ||
    !integer(f.cycles)
  )
    throw Error("Invalid focus save.");
  for (const p of ["focus", "short-break", "long-break"] as const)
    if (!integer(f.settings[p], 1, 240))
      throw Error("Focus durations must be whole minutes from 1 to 240.");
  if (
    typeof f.settings.autoAdvance !== "boolean" ||
    typeof f.settings.chime !== "boolean"
  )
    throw Error("Invalid focus settings.");
  const ids = new Set<string>();
  for (const h of f.history) {
    if (
      !h ||
      !text(h.id, 128) ||
      !h.id ||
      ids.has(h.id) ||
      !phase(h.phase) ||
      !integer(h.durationMs, 60000, 14400000) ||
      !integer(h.endedAt) ||
      !text(h.objective) ||
      (h.questId !== undefined && (!text(h.questId, 128) || !h.questId))
    )
      throw Error("Invalid focus history.");
    ids.add(h.id);
  }
  const c = f.current;
  if (
    c &&
    (!text(c.id, 128) ||
      !c.id ||
      ids.has(c.id) ||
      !phase(c.phase) ||
      !["ready", "paused", "running"].includes(c.status) ||
      !integer(c.durationMs, 60000, 14400000) ||
      !integer(c.remainingMs, 0, c.durationMs) ||
      !text(c.objective) ||
      ![
        ...scienceKinds,
        "system-design",
        "ai-engineering",
        "outreach",
        "reading",
        "writing",
      ].includes(c.activity) ||
      (c.questId !== undefined && (!text(c.questId, 128) || !c.questId)) ||
      (c.startedAt !== undefined && !integer(c.startedAt)) ||
      (c.status === "running" &&
        (!integer(c.deadline) || !integer(c.startedAt))) ||
      (c.status !== "running" && c.deadline !== undefined))
  )
    throw Error("Invalid active focus timer.");
  for (const context of [...f.history, ...(c ? [c] : [])]) {
    if (
      "activity" in context &&
      context.activity !== undefined &&
      ![
        ...scienceKinds,
        "system-design",
        "ai-engineering",
        "outreach",
        "reading",
        "writing",
      ].includes(context.activity)
    )
      throw Error("Invalid focus activity.");
    if (context.room !== undefined && !validRoom(context.room))
      throw Error("Invalid focus room.");
    for (const key of ["sessionId", "courseId"] as const)
      if (
        context[key] !== undefined &&
        (!text(context[key], 128) || !context[key])
      )
        throw Error("Invalid focus link.");
  }
  return f;
}
export function reduceFocus(
  value: FocusState | undefined,
  action: FocusAction,
): FocusState {
  const f = structuredClone(value ?? defaultFocus());
  if (action.type === "focusSettings") {
    f.settings = action.settings;
    return validateFocus(f);
  }
  if (!Number.isSafeInteger(action.now) || action.now < 0)
    throw Error("Invalid timer timestamp.");
  const c = f.current;
  if (action.type === "focusStart") {
    if (c && c.status !== "ready")
      throw Error("Reset the current timer before starting another.");
    if (
      action.durationMinutes !== undefined &&
      (!Number.isInteger(action.durationMinutes) ||
        action.durationMinutes < 1 ||
        action.durationMinutes > 240)
    )
      throw Error("Focus duration must be 1–240 minutes.");
    const duration =
      (action.durationMinutes ?? f.settings[action.phase]) * 60000;
    f.current = {
      ...(action.room !== undefined ? { room: action.room } : {}),
      ...(action.sessionId !== undefined
        ? { sessionId: action.sessionId }
        : {}),
      ...(action.courseId !== undefined ? { courseId: action.courseId } : {}),
      id: action.id,
      phase: action.phase,
      status: "running",
      durationMs: duration,
      remainingMs: duration,
      deadline: action.now + duration,
      startedAt: action.now,
      questId: action.questId,
      objective: action.objective.trim().slice(0, 120),
      activity: action.activity,
    };
  } else if (c && c.id === action.id) {
    if (c.status === "running" && remaining(c, action.now) === 0) {
      f.history.unshift({
        id: c.id,
        phase: c.phase,
        durationMs: c.durationMs,
        endedAt: c.deadline!,
        questId: c.questId,
        objective: c.objective,
        ...(c.room ? { room: c.room } : {}),
        ...(c.room === "observatory" ? { activity: c.activity } : {}),
        ...(c.sessionId ? { sessionId: c.sessionId } : {}),
        ...(c.courseId ? { courseId: c.courseId } : {}),
      });
      if (c.phase === "focus") f.cycles++;
      const next: FocusPhase =
        c.phase === "focus"
          ? f.cycles % 4 === 0
            ? "long-break"
            : "short-break"
          : "focus";
      // Start one next phase at reconciliation, never manufacture unattended cycles.
      f.current = {
        ...c,
        id: `next:${f.history.length}:${action.now}:${next}`,
        phase: next,
        status: f.settings.autoAdvance ? "running" : "ready",
        durationMs: f.settings[next] * 60000,
        remainingMs: f.settings[next] * 60000,
        deadline: f.settings.autoAdvance
          ? action.now + f.settings[next] * 60000
          : undefined,
        startedAt: undefined,
      };
      if (f.settings.autoAdvance) f.current.startedAt = action.now;
    } else if (action.type === "focusPause" && c.status === "running") {
      c.remainingMs = remaining(c, action.now);
      c.status = "paused";
      delete c.deadline;
    } else if (action.type === "focusResume" && c.status !== "running") {
      c.status = "running";
      c.deadline = action.now + c.remainingMs;
      c.startedAt ??= action.now;
    } else if (action.type === "focusReset") {
      c.status = "ready";
      c.remainingMs = c.durationMs;
      delete c.deadline;
    }
  }
  return validateFocus(f);
}

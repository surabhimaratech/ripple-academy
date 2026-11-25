import type { FocusSegment } from "../domain/focus";
import type { Interior } from "../domain/sessions";
/** Explicit Study focus intent takes priority over ambient and legacy activity plans. */
export function focusPlan(room: Interior, focus?: FocusSegment) {
  if (room !== "personal-study" || !focus || focus.status === "ready")
    return undefined;
  const activity =
    focus.phase !== "focus"
      ? "study-tea"
      : focus.activity === "reading"
        ? "study-read"
        : ["writing", "system-design"].includes(focus.activity)
          ? "study-write"
          : "code";
  return { activity, paused: focus.status === "paused" };
}

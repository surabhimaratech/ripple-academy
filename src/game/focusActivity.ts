import { scienceActivity, scienceIntent } from "../domain/science";
import type { FocusSegment } from "../domain/focus";
import type { Interior } from "../domain/sessions";
/** Explicit Study focus intent takes priority over ambient and legacy activity plans. */
export function focusPlan(room: Interior, focus?: FocusSegment) {
  if (
    !focus ||
    focus.status === "ready" ||
    room !== (focus.room ?? "personal-study")
  )
    return undefined;
  if (room === "observatory")
    return {
      activity:
        focus.phase !== "focus"
          ? "observatory-rest"
          : scienceActivity(scienceIntent(focus.activity)),
      paused: focus.status === "paused",
    };
  if (room !== "personal-study") return undefined;
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

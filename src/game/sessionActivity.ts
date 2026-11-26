import { scienceActivity, scienceIntent } from "../domain/science";
import type { ActivitySession } from "../domain/sessions";
import type { RoomDefinition } from "./rooms";
/** Mirror explicit activity intent while honoring the saved category's chosen room. */
export function sessionPlan(
  room: RoomDefinition,
  session: ActivitySession | undefined,
) {
  if (!session || session.room !== room.id) return undefined;
  if (room.id === "observatory")
    return {
      activity:
        session.categoryId === "astronomy"
          ? "telescope"
          : scienceActivity(
              scienceIntent(`${session.categoryId} ${session.title}`),
            ),
      variations: [],
      intro: undefined,
    };
  const intent = `${session.categoryId} ${session.title}`.toLowerCase();
  const writing = /journal|writing|notebook|research notes/.test(intent);
  const reading = /reading|literature|history/.test(intent);
  const desired = writing
    ? (
        {
          "grand-library": "write",
          "personal-study": "study-write",
          observatory: "charts",
          "happy-cafe": "cafe-read",
        } as const
      )[room.id]
    : reading
      ? (
          {
            "grand-library": "armchair-book",
            "personal-study": "study-read",
            observatory: "observatory-read",
            "happy-cafe": "cafe-read",
          } as const
        )[room.id]
      : room.sessionActivity;
  const activity = room.config.activities.some((a) => a.id === desired)
    ? desired
    : room.sessionActivity;
  return {
    activity,
    variations: writing ? [] : room.sessionVariations,
    intro: writing ? undefined : room.sessionIntro,
  };
}

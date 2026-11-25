import { roomDefinitions } from "../game/rooms";
import type { Interior } from "../domain/sessions";
import type { AnimationEntry } from "../heroine/catalog";
/** Enumerate real room activities, independent of hand-picked animation demonstration clips. */
export function interactionEntry(room: Interior, id: string): AnimationEntry {
  const activity = roomDefinitions[room].config.activities.find(
    (a) => a.id === id,
  );
  if (!activity) throw Error(`Unknown activity in ${room}: ${id}`);
  return {
    id: `interaction:${room}:${id}`,
    label: activity.label,
    room,
    activity: id,
    pose: activity.pose,
    state: activity.state,
    facing: activity.facing,
    duration: 60,
  };
}

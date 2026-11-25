import type { Interior } from "../domain/sessions";
import type { HeroinePose } from "./animation";
import { heroineFrame } from "./animation";
import { loopFrame } from "./programs";
export interface AnimationEntry {
  id: string;
  label: string;
  room: Interior;
  activity: string;
  pose: HeroinePose["pose"];
  duration: number;
  clip?: Parameters<typeof loopFrame>[0];
  frame?: string;
  facing?: HeroinePose["facing"];
  moving?: boolean;
  state?: HeroinePose["state"];
}
const entry = (e: AnimationEntry) => e;
export const animationCatalog: AnimationEntry[] = [
  ...(["down", "right", "up", "left"] as const).flatMap((facing) => [
    entry({
      id: `idle-${facing}`,
      label: `Idle & blink · ${facing}`,
      room: "grand-library",
      activity: "idle",
      pose: "idle",
      duration: 7.3,
      facing,
    }),
    entry({
      id: `walk-${facing}`,
      label: `Walk · ${facing}`,
      room: "grand-library",
      activity: "idle",
      pose: "idle",
      duration: 0.68,
      facing,
      moving: true,
    }),
  ]),
  entry({
    id: "work",
    label: "Working · type → think → consult book",
    room: "personal-study",
    activity: "code",
    pose: "code",
    duration: 36,
  }),
  entry({
    id: "typing",
    label: "Typing · alternating hands",
    room: "personal-study",
    activity: "code",
    pose: "code",
    duration: 1.3,
    clip: "typing",
  }),
  entry({
    id: "think",
    label: "Thinking at the desk",
    room: "personal-study",
    activity: "code",
    pose: "code",
    duration: 4,
    frame: "think-work",
  }),
  entry({
    id: "consult",
    label: "Consulting a book at the desk",
    room: "personal-study",
    activity: "code",
    pose: "code",
    duration: 3.2,
    clip: "consulting",
  }),
  entry({
    id: "write",
    label: "Writing notebook notes",
    room: "personal-study",
    activity: "study-write",
    pose: "write",
    duration: 1.8,
  }),
  entry({
    id: "charts",
    label: "Studying celestial charts / notes",
    room: "observatory",
    activity: "charts",
    pose: "write",
    duration: 24,
  }),
  entry({
    id: "seated-reading",
    label: "Seated reading & page turn",
    room: "grand-library",
    activity: "armchair-book",
    pose: "seated-read",
    duration: 16,
  }),
  entry({
    id: "book",
    label: "Standing with an open book",
    room: "grand-library",
    activity: "window-book",
    pose: "read",
    duration: 6,
  }),
  entry({
    id: "telescope",
    label: "Telescope · observe & adjust",
    room: "observatory",
    activity: "telescope",
    pose: "globe",
    duration: 30,
  }),
  entry({
    id: "adjust",
    label: "Adjusting the telescope",
    room: "observatory",
    activity: "telescope",
    pose: "globe",
    duration: 4,
    frame: "telescope-adjust",
  }),
  entry({
    id: "browse",
    label: "Browsing / selecting a book",
    room: "grand-library",
    activity: "browse",
    pose: "browse",
    duration: 14,
  }),
  entry({
    id: "reach",
    label: "Reaching for a book",
    room: "grand-library",
    activity: "browse",
    pose: "browse",
    duration: 3,
    frame: "browse",
  }),
  entry({
    id: "examine",
    label: "Examining a keepsake",
    room: "grand-library",
    activity: "chest",
    pose: "examine",
    duration: 8,
  }),
  entry({
    id: "window",
    label: "Thoughtful window observation",
    room: "personal-study",
    activity: "study-window",
    pose: "observe",
    duration: 22,
    facing: "up",
  }),
  entry({
    id: "tea",
    label: "Sipping tea / coffee",
    room: "personal-study",
    activity: "study-tea",
    pose: "tea",
    duration: 8.8,
  }),
  entry({
    id: "rest",
    label: "Relaxing in an armchair",
    room: "grand-library",
    activity: "chair",
    pose: "sit",
    duration: 8,
  }),
  entry({
    id: "sleep",
    label: "Sleeping beneath the quilt",
    room: "personal-study",
    activity: "study-sleep",
    pose: "sleep",
    duration: 7.2,
  }),
  entry({
    id: "stretch",
    label: "Gentle post-study stretch",
    room: "personal-study",
    activity: "study-stretch",
    pose: "stretch",
    duration: 6.4,
  }),
  entry({
    id: "celebrate",
    label: "A quiet celebration",
    room: "grand-library",
    activity: "idle",
    pose: "idle",
    state: "celebrating",
    duration: 2.8,
  }),
];
export function previewPose(e: AnimationEntry, time: number): HeroinePose {
  return {
    facing: e.facing ?? "up",
    moving: !!e.moving,
    engaged: e.activity !== "idle",
    pose: e.pose,
    activityId: e.activity,
    state:
      e.state ??
      (e.moving
        ? "player-controlled"
        : e.activity === "idle"
          ? "idle"
          : "writing"),
    clock: time,
    activityTime: time,
  };
}
export function previewFrame(
  e: AnimationEntry,
  time: number,
  reduced: boolean,
) {
  return (
    e.frame ??
    (e.clip
      ? loopFrame(e.clip, reduced ? 0 : time)
      : heroineFrame(previewPose(e, time), reduced))
  );
}

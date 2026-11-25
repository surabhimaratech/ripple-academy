import { studyFurniture, windowVantage } from "./furniture";
import { paintStudy } from "./studyArt";
import type Phaser from "phaser";
import { paintLibrary } from "./art";
import { paintInterior } from "./interiorArt";
import { libraryRoom, objectHits } from "./room";
import { bounds, type Interaction } from "./movement";
import type { Activity, RoomConfig } from "./behavior";
import type { Interior } from "../domain/sessions";
export interface RoomDefinition {
  id: Interior;
  title: string;
  config: RoomConfig;
  hits: typeof objectHits;
  start: { x: number; y: number };
  sessionActivity: string;
  sessionVariations?: string[];
  sessionIntro?: string;
  paint: (s: Phaser.Scene, reduced: boolean) => Phaser.Tweens.Tween[];
}
const make = (a: Activity) => a;
const study: RoomConfig = {
  afterSessionActivity: "study-stretch",
  bounds: { left: 35, right: 1235, top: 520, bottom: 695 },
  obstacles: [
    ...studyFurniture.desk.solids,
    ...studyFurniture.armchair.solids,
    { x: 918, y: 350, w: 362, h: 247 },
    { x: 0, y: 640, w: 175, h: 80 },
    { x: 1170, y: 640, w: 110, h: 80 },
  ],
  wanderPoints: [
    { x: 380, y: 640 },
    { x: 820, y: 660 },
    { x: 945, y: 625 },
  ],
  activities: [
    make({
      id: "code",
      furniture: studyFurniture.desk.id,
      state: "writing",
      label: "Working quietly at her laptop",
      point: studyFurniture.desk.approach,
      facing: "up",
      pose: "code",
      offsetY: -42,
      seconds: [38, 65],
      weight: 3,
      object: "workstation",
      thoughts: [
        "A little closer to understanding.",
        "Perhaps a fresh approach.",
      ],
    }),
    make({
      id: "study-write",
      furniture: studyFurniture.desk.id,
      state: "writing",
      label: "Writing in her notebook",
      point: studyFurniture.desk.approach,
      facing: "up",
      pose: "write",
      offsetY: -42,
      seconds: [35, 60],
      weight: 1.8,
      thoughts: ["A thought worth keeping.", "A page of her own."],
    }),
    make({
      id: "study-books",
      state: "reading",
      label: "Consulting the study books",
      point: { x: 320, y: 610 },
      facing: "up",
      pose: "browse",
      seconds: [23, 40],
      weight: 1.8,
      object: "discovery",
      thoughts: ["A useful idea for the next page."],
    }),
    make({
      id: "study-read",
      furniture: studyFurniture.armchair.id,
      state: "reading",
      label: "Reading in her favorite chair",
      point: studyFurniture.armchair.approach,
      facing: "down",
      pose: "seated-read",
      offsetY: -50,
      seconds: [35, 55],
      weight: 2,
      object: "chair",
      thoughts: ["One more chapter…"],
    }),
    make({
      id: "study-window",
      furniture: studyFurniture.desk.id,
      offsetY: -42,
      state: "observing",
      label: "Watching the sunset from her desk",
      point: windowVantage.point,
      facing: "up",
      pose: "observe",
      seconds: [22, 35],
      weight: 1.2,
      object: "window",
      thoughts: ["A good day for a little curiosity."],
    }),
    make({
      id: "study-chest",
      state: "observing",
      label: "Looking through personal mementos",
      point: { x: 1016, y: 630 },
      facing: "up",
      pose: "observe",
      seconds: [18, 28],
      weight: 0.7,
      object: "keepsakes",
      thoughts: ["Little things worth keeping."],
    }),
    make({
      id: "study-tea",
      furniture: studyFurniture.armchair.id,
      state: "sitting",
      label: "Sipping tea in her armchair",
      point: studyFurniture.armchair.approach,
      facing: "down",
      pose: "tea",
      offsetY: -50,
      seconds: [28, 45],
      weight: 1.2,
      thoughts: ["A small, quiet pleasure."],
    }),
    make({
      id: "study-stretch",
      state: "idle",
      label: "A gentle stretch after studying",
      point: { x: 812, y: 650 },
      facing: "down",
      pose: "stretch",
      seconds: [7, 11],
      weight: 0.8,
      thoughts: [],
    }),
    make({
      id: "study-rest",
      furniture: studyFurniture.armchair.id,
      state: "sitting",
      label: "Resting comfortably in her armchair",
      point: studyFurniture.armchair.approach,
      offsetY: -50,
      facing: "down",
      pose: "rest",
      seconds: [15, 26],
      weight: 1,
      thoughts: ["Perhaps a cup of tea."],
    }),
  ],
};
const observatory: RoomConfig = {
  bounds,
  obstacles: [
    { x: 575, y: 390, w: 130, h: 97 },
    { x: 184, y: 397, w: 232, h: 81 },
    { x: 73, y: 497, w: 100, h: 96 },
    { x: 981, y: 572, w: 97, h: 44 },
    { x: 0, y: 656, w: 230, h: 64 },
    { x: 1158, y: 659, w: 125, h: 61 },
  ],
  wanderPoints: [
    { x: 470, y: 610 },
    { x: 850, y: 620 },
    { x: 839, y: 430 },
  ],
  activities: [
    make({
      id: "telescope",
      state: "observing",
      label: "Observing the heavens through the telescope",
      point: { x: 753, y: 468 },
      facing: "up",
      pose: "globe",

      seconds: [35, 60],
      weight: 3,
      object: "globe",
      thoughts: ["I wonder what’s beyond those stars."],
    }),
    make({
      id: "charts",
      state: "writing",
      label: "Recording observations in her star atlas",
      point: { x: 298, y: 505 },
      facing: "up",
      pose: "write",
      offsetY: -26,
      seconds: [28, 48],
      weight: 2.4,
      object: "quests",
      thoughts: ["A small observation, carefully kept."],
    }),
    make({
      id: "astronomy-books",
      state: "reading",
      label: "Browsing the astronomy shelves",
      point: { x: 1100, y: 380 },
      facing: "up",
      pose: "browse",
      seconds: [22, 40],
      weight: 1.6,
      object: "discovery",
      thoughts: ["There is always more to discover."],
    }),
    make({
      id: "observatory-read",
      state: "reading",
      label: "Reading beneath the stars",
      point: { x: 123, y: 620 },
      facing: "down",
      pose: "seated-read",
      offsetY: -48,
      seconds: [30, 50],
      weight: 1.7,
      object: "chair",
      thoughts: ["One more chapter…"],
    }),
    make({
      id: "sky",
      state: "observing",
      label: "Following a distant constellation",
      point: { x: 851, y: 390 },
      facing: "up",
      pose: "observe",
      seconds: [25, 42],
      weight: 1.4,
      object: "window",
      thoughts: ["So many questions in the quiet sky."],
    }),
    make({
      id: "observatory-chest",
      state: "observing",
      label: "Admiring the collected curiosities",
      point: { x: 1030, y: 635 },
      facing: "up",
      pose: "observe",
      seconds: [16, 26],
      weight: 0.5,
      object: "keepsakes",
      thoughts: ["A little collection of beginnings."],
    }),
  ],
};
export const roomDefinitions: Record<Interior, RoomDefinition> = {
  "grand-library": {
    id: "grand-library",
    title: "The Grand Library",
    config: libraryRoom,
    hits: objectHits,
    start: { x: 642, y: 564 },
    sessionActivity: "armchair-book",
    sessionIntro: "browse",
    sessionVariations: ["window-book", "browse"],
    paint: paintLibrary,
  },
  "personal-study": {
    id: "personal-study",
    title: "Your Personal Study",
    config: study,
    start: { x: 700, y: 650 },
    sessionActivity: "code",
    sessionVariations: ["study-books"],
    paint: paintStudy,
    hits: [
      { id: "workstation", x: 641, y: 350, w: 225, h: 110 },
      { id: "focus-clock", x: 820, y: 324, w: 92, h: 100 },
      { id: "quests", x: 1190, y: 234, w: 145, h: 190 },
      { id: "chalkboard", x: 1015, y: 220, w: 195, h: 190 },
      { id: "discovery", x: 135, y: 230, w: 210, h: 240 },
      { id: "chair", x: 145, y: 445, w: 245, h: 210 },
      { id: "window", x: 650, y: 185, w: 370, h: 270 },
    ],
  },
  observatory: {
    id: "observatory",
    title: "The Observatory",
    config: observatory,
    start: { x: 800, y: 590 },
    sessionActivity: "telescope",
    sessionVariations: ["charts", "astronomy-books"],
    paint: (s, r) => paintInterior(s, "observatory", r),
    hits: [
      { id: "globe", x: 665, y: 337, w: 276, h: 223 },
      { id: "quests", x: 299, y: 414, w: 244, h: 92 },
      { id: "discovery", x: 1122, y: 232, w: 173, h: 244 },
      { id: "chair", x: 121, y: 548, w: 110, h: 125 },
      { id: "window", x: 881, y: 211, w: 198, h: 230 },
      { id: "keepsakes", x: 1030, y: 598, w: 107, h: 62 },
    ],
  },
};
export function nearestInteraction(
  definition: RoomDefinition,
  p: { x: number; y: number },
) {
  return definition.config.activities
    .filter((a): a is Activity & { object: Interaction } => !!a.object)
    .map((a) => ({ id: a.object, point: a.point, label: a.label }))
    .filter((a) => Math.hypot(a.point.x - p.x, a.point.y - p.y) < 96)
    .sort(
      (a, b) =>
        Math.hypot(a.point.x - p.x, a.point.y - p.y) -
        Math.hypot(b.point.x - p.x, b.point.y - p.y),
    )[0];
}

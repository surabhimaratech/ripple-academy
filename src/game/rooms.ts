import { observatoryConfig, observatoryStart } from "./observatory";
import { paintObservatory, preloadObservatory } from "./observatoryArt";
import { cafeConfig, cafeStart } from "./cafe";
import { paintCafe, preloadCafe } from "./cafeArt";
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
  preload?: (s: Phaser.Scene) => void;
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
export const roomDefinitions: Record<Interior, RoomDefinition> = {
  "happy-cafe": {
    id: "happy-cafe",
    title: "Happy Café",
    config: cafeConfig,
    start: cafeStart,
    sessionActivity: "cafe-relax",
    paint: paintCafe,
    preload: preloadCafe,
    hits: [
      { id: "cafe-menu", x: 378, y: 445, w: 360, h: 230 },
      { id: "cafe-menu", x: 478, y: 225, w: 128, h: 110 },
      { id: "cafe-gifts", x: 1140, y: 385, w: 220, h: 318 },
      { id: "chair", x: 758, y: 487, w: 132, h: 190 },
      { id: "window", x: 860, y: 250, w: 370, h: 240 },
      { id: "door", x: 76, y: 370, w: 130, h: 300 },
    ],
  },
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
    config: observatoryConfig,
    start: observatoryStart,
    sessionActivity: "telescope",
    sessionVariations: ["celestial-charts", "astronomy-books"],
    paint: paintObservatory,
    preload: preloadObservatory,
    hits: [
      { id: "globe", x: 825, y: 310, w: 350, h: 310 },
      { id: "workstation", x: 310, y: 416, w: 480, h: 240 },
      { id: "science-charts", x: 480, y: 250, w: 130, h: 190 },
      { id: "discovery", x: 155, y: 250, w: 180, h: 180 },
      { id: "lunar-globe", x: 1140, y: 400, w: 270, h: 260 },
      { id: "armillary", x: 1050, y: 395, w: 65, h: 90 },
      { id: "keepsakes", x: 1140, y: 503, w: 155, h: 105 },
      { id: "chair", x: 125, y: 568, w: 240, h: 265 },
      { id: "science-journal", x: 1070, y: 630, w: 480, h: 200 },
      { id: "window", x: 985, y: 220, w: 200, h: 200 },
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

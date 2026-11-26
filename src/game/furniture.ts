import { observatoryFurniture } from "./observatory";
import { cafeSeat } from "./cafe";
import type { Point, Obstacle } from "./movement";
export type Polygon = Point[];
export interface FurnitureAnchor {
  id: string;
  approach: Point;
  exit: Point;
  contact: Point;
  scale: number;
  seat: Point;
  facing: "up" | "down" | "left" | "right";
  solids: Obstacle[];
  foreground: Polygon[];
  frames: Record<string, string>;
  shadow: {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
  }[];
}
const polygon = (...points: number[][]): Polygon =>
  points.map(([x, y]) => ({ x, y }));
/** Coordinates are in the unchanged 1280×720 Study illustration, never screen pixels. */
export const studyFurniture: Record<string, FurnitureAnchor> = {
  desk: {
    id: "study-desk",
    approach: { x: 785, y: 610 },
    exit: { x: 785, y: 610 },
    contact: { x: 670, y: 545 },
    seat: { x: 675, y: 455 },
    scale: 2.2,
    facing: "up",
    solids: [
      { x: 390, y: 350, w: 520, h: 198 },
      { x: 574, y: 345, w: 172, h: 235 },
    ],
    foreground: [
      polygon([393, 384], [910, 384], [910, 404], [393, 404]),
      polygon([393, 401], [534, 401], [534, 548], [393, 548]),
      polygon([768, 401], [909, 401], [909, 548], [768, 548]),
      polygon(
        [654, 363],
        [678, 352],
        [715, 350],
        [737, 363],
        [723, 482],
        [644, 482],
      ),
      polygon([644, 475], [655, 475], [653, 570], [645, 571]),
      polygon([718, 475], [728, 474], [742, 566], [732, 566]),
    ],
    frames: {
      celebrate: "study-think",
      window: "study-think",
      "window-thought": "study-think",
      "type-a": "study-type-a",
      "type-b": "study-type-b",
      "think-work": "study-think",
      "consult-a": "study-consult-a",
      "consult-b": "study-consult-b",
      "write-a": "study-write-a",
      "write-b": "study-write-b",
    },
    shadow: [{ x: 660, y: 554, width: 58, height: 9, alpha: 0.23 }],
  },
  armchair: {
    id: "study-armchair",
    approach: { x: 210, y: 660 },
    exit: { x: 210, y: 660 },
    contact: { x: 174, y: 625 },
    seat: { x: 153, y: 510 },
    scale: 2.2,
    facing: "down",
    solids: [{ x: 0, y: 350, w: 270, h: 286 }],
    foreground: [
      polygon([0, 487], [29, 480], [62, 485], [88, 505], [76, 637], [0, 640]),
      polygon(
        [192, 485],
        [219, 486],
        [256, 498],
        [263, 513],
        [252, 526],
        [190, 511],
      ),
      polygon([78, 524], [112, 528], [116, 539], [82, 550]),
      polygon([223, 522], [262, 519], [261, 534], [223, 546]),
    ],
    frames: {
      celebrate: "study-look-up",
      "read-seated": "study-read",
      "read-page": "study-page",
      rest: "study-rest",
      "tea-hold": "study-tea",
      "tea-sip": "study-sip",
    },
    shadow: [
      { x: 153, y: 513, width: 80, height: 12, alpha: 0.22 },
      { x: 192, y: 625, width: 42, height: 7, alpha: 0.18 },
    ],
  },
};
/** The window is behind the solid workstation; reflection uses its reachable chair. */
export const windowVantage = {
  point: studyFurniture.desk.approach,
  target: { x: 650, y: 210 },
  mode: "seated" as const,
};
export function furnitureForActivity(id?: string) {
  if (
    [
      "observatory-code",
      "observatory-think",
      "charts",
      "galaxy-chart",
    ].includes(id ?? "")
  )
    return observatoryFurniture.desk;
  if (["observatory-read", "observatory-rest"].includes(id ?? ""))
    return observatoryFurniture.armchair;
  if (
    [
      "cafe-drink",
      "cafe-pastry",
      "cafe-read",
      "cafe-relax",
      "cafe-window",
    ].includes(id ?? "")
  )
    return cafeSeat;
  return id === "code" || id === "study-write" || id === "study-window"
    ? studyFurniture.desk
    : ["study-read", "study-tea", "study-rest"].includes(id ?? "")
      ? studyFurniture.armchair
      : undefined;
}
/** Perspective changes continuously on floor; seated proportions are separately registered to furniture. */
export function studyFloorScale(y: number) {
  return 2.25 + Math.max(0, Math.min(1, (y - 520) / 175)) * 0.35;
}

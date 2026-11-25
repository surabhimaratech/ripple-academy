import type { Interior } from "../domain/sessions";
import type { Point } from "../game/movement";
import type { ScholarBehavior } from "../game/behavior";
import type { Rect } from "./atlas";
export interface Placement {
  scale?: number;
  x: number;
  y: number;
  depth: number;
  key: string;
  occluders: Rect[];
}
const box = (x: number, y: number, width: number, height: number): Rect => ({
  x,
  y,
  width,
  height,
});
/** Existing furniture coordinates only. Masks affect the character, never repaint the rooms. */
export const furniture = {
  "personal-study": {
    desk: box(393, 385, 516, 160),
    chairArms: [box(0, 487, 46, 116), box(214, 487, 50, 116)],
  },
  "grand-library": {
    desk: box(499, 369, 262, 85),
    chairArms: [box(100, 472, 21, 42), box(184, 472, 21, 42)],
  },
  observatory: {
    desk: box(178, 403, 244, 75),
    chairArms: [box(72, 545, 20, 34), box(153, 545, 20, 34)],
  },
};
export function placementFor(
  room: Interior,
  b: Pick<
    ScholarBehavior,
    "position" | "activity" | "state" | "moving" | "pose" | "offsetY"
  >,
): Placement {
  const engaged =
    !!b.activity &&
    !b.moving &&
    !["walking-to-object", "wandering", "player-controlled"].includes(b.state);
  const base: Placement = {
    ...b.position,
    scale: room === "personal-study" ? 1.4 : 1,
    depth: b.position.y,
    key: "standing",
    occluders: [],
  };
  if (!engaged) return base;
  const id = b.activity!.id;
  if (b.pose === "code" || b.pose === "write") {
    const x =
      room === "personal-study"
        ? b.pose === "code"
          ? 648
          : 560
        : room === "grand-library"
          ? 632
          : 280;
    return {
      x,
      y: room === "personal-study" ? 426 : room === "observatory" ? 435 : 398,
      scale: room === "personal-study" ? 1.4 : 1,
      depth: b.position.y,
      key: `${room}:desk`,
      occluders: [furniture[room].desk],
    };
  }
  if (id === "telescope")
    return { x: 768, y: 446, depth: 483, key: "telescope", occluders: [] };
  if (b.offsetY || b.pose === "tea")
    return {
      ...base,
      x: room === "personal-study" ? 128 : b.position.x,
      y: room === "personal-study" ? 580 : b.position.y + b.offsetY,
      key: `chair:${room}`,
      occluders: furniture[room].chairArms,
    };
  return { ...base, key: `floor:${b.pose}` };
}
export function posePhase(frame: string) {
  if (frame.startsWith("type-")) return "typing";
  if (frame.startsWith("consult-")) return "consulting";
  if (frame === "think-work") return "thinking";
  if (frame === "telescope-adjust") return "adjusting";
  if (frame.startsWith("telescope-")) return "eyepiece";
  if (frame.startsWith("write-")) return "writing";
  if (frame === "read-seated" || frame === "read-page") return "seated-reading";
  if (frame === "read-standing") return "standing-reading";
  if (frame === "browse") return "shelf-reach";
  if (frame.startsWith("tea-")) return "tea";
  if (frame.startsWith("sleep-")) return "sleep";
  if (frame.startsWith("stretch-")) return "stretch";
  if (
    ["window", "window-thought", "rest", "examine", "celebrate"].includes(frame)
  )
    return frame;
  return "";
}
export function seatedActivity(
  room: Interior,
  id: string,
  point: Point,
  pose: ScholarBehavior["pose"],
  offsetY = 0,
): Placement {
  return placementFor(room, {
    position: point,
    activity: { id } as ScholarBehavior["activity"],
    state: "writing",
    moving: false,
    pose,
    offsetY,
  });
}

/** Positive mask regions work in both Canvas and WebGL (inverted masks do not). */
export function visibleRegions(
  cuts: Rect[],
  width = 1280,
  height = 720,
): Rect[] {
  let regions = [{ x: 0, y: 0, width, height }];
  for (const cut of cuts)
    regions = regions.flatMap((r) => {
      const x = Math.max(r.x, cut.x),
        y = Math.max(r.y, cut.y),
        right = Math.min(r.x + r.width, cut.x + cut.width),
        bottom = Math.min(r.y + r.height, cut.y + cut.height);
      if (right <= x || bottom <= y) return [r];
      return [
        { x: r.x, y: r.y, width: r.width, height: y - r.y },
        { x: r.x, y: bottom, width: r.width, height: r.y + r.height - bottom },
        { x: r.x, y, width: x - r.x, height: bottom - y },
        { x: right, y, width: r.x + r.width - right, height: bottom - y },
      ].filter((part) => part.width > 0 && part.height > 0);
    });
  return regions;
}

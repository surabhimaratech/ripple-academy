import {
  furnitureForActivity,
  studyFloorScale,
  type Polygon,
  type FurnitureAnchor,
} from "../game/furniture";
import type { Interior } from "../domain/sessions";
import type { Point } from "../game/movement";
import type { ScholarBehavior } from "../game/behavior";
import type { Rect } from "./atlas";
export interface Placement {
  scale?: number;
  foreground?: Polygon[];
  frames?: Record<string, string>;
  tint?: number;
  shadows?: {
    x: number;
    y: number;
    width: number;
    height: number;
    alpha: number;
  }[];
  seat?: Point;
  transition?: {
    kind: "arrive" | "leave";
    progress: number;
    furniture: string;
  };
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
  > &
    Partial<
      Pick<ScholarBehavior, "departure" | "departingActivity" | "settling">
    >,
  reduced = false,
): Placement {
  const engaged =
    !!b.activity &&
    !b.moving &&
    !["walking-to-object", "wandering", "player-controlled"].includes(b.state);
  const base: Placement = {
    ...b.position,
    scale: room === "personal-study" ? studyFloorScale(b.position.y) : 1,
    depth: b.position.y,
    key: "standing",
    occluders: [],
  };
  if (room === "personal-study" && b.departingActivity && b.departure) {
    const old = furnitureForActivity(b.departingActivity.id);
    if (old)
      return furniturePlacement(
        old,
        b.position.y,
        "leave",
        reduced ? 1 : 1 - b.departure / 1.2,
      );
  }
  if (!engaged) return base;
  if (room === "personal-study" && b.activity?.id === "study-window")
    return {
      ...base,
      key: "study-window",
      frames: { "window-thought": "window" },
      tint: 0xfff6eb,
    };
  const id = b.activity!.id;
  const anchor = room === "personal-study" && furnitureForActivity(id);
  if (anchor)
    return furniturePlacement(
      anchor,
      b.position.y,
      "arrive",
      reduced ? 1 : 1 - (b.settling ?? 0) / 1.2,
    );

  if (room !== "personal-study" && (b.pose === "code" || b.pose === "write")) {
    return {
      x: room === "grand-library" ? 632 : 280,
      y: room === "grand-library" ? 398 : 435,
      depth: b.position.y,
      key: `${room}:desk`,
      occluders: [furniture[room].desk],
    };
  }
  if (id === "telescope")
    return { x: 768, y: 446, depth: 483, key: "telescope", occluders: [] };
  if (room !== "personal-study" && (b.offsetY || b.pose === "tea"))
    return {
      ...base,
      x: b.position.x,
      y: b.position.y + b.offsetY,
      key: `chair:${room}`,
      occluders: furniture[room].chairArms,
    };
  return { ...base, key: `floor:${b.pose}` };
}
export function posePhase(frame: string) {
  if (frame.startsWith("study-stand")) return "transition-standing";
  if (frame.startsWith("study-bend")) return "transition-bending";
  if (frame.startsWith("study-type")) return "typing";
  if (frame.startsWith("study-consult")) return "consulting";
  if (frame.startsWith("study-write")) return "writing";
  if (frame === "study-think") return "thinking";
  if (frame.startsWith("study-")) return "seated";
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

/** Room-specific art stays out of behavior and reward logic; legacy rooms retain their approved frames. */
export function frameForPlacement(
  frame: string,
  p: Placement,
  activityTime = 0,
  reduced = false,
): string {
  if (p.transition) {
    const { kind, progress, furniture } = p.transition;
    const t = kind === "arrive" ? progress : 1 - progress;
    const side = furniture === "study-armchair" ? "front" : "rear";
    if (t < 0.3) return `study-stand-${side}`;
    if (t < 0.8) return `study-bend-${side}`;
    if (kind === "leave")
      return furniture === "study-armchair" ? "study-rest" : "study-think";
  }
  if (p.key === "study-armchair" && frame === "read-seated" && !reduced) {
    const t = activityTime % 16;
    if (t > 14 && t < 15.5) return "study-look-up";
    if (t > 6.5 && t < 6.7) return "study-read-blink";
  }
  if (
    p.key === "study-armchair" &&
    frame === "rest" &&
    !reduced &&
    activityTime % 20 > 14
  )
    return "study-rest-eyes";
  return p.frames?.[frame] ?? frame;
}

function furniturePlacement(
  anchor: FurnitureAnchor,
  depth: number,
  kind: "arrive" | "leave",
  progress: number,
): Placement {
  const p = Math.max(0, Math.min(1, progress));
  const t = kind === "arrive" ? p : 1 - p;
  const ease = t * t * (3 - 2 * t);
  const floor = kind === "arrive" ? anchor.approach : anchor.exit;
  return {
    x: floor.x + (anchor.contact.x - floor.x) * ease,
    y: floor.y + (anchor.contact.y - floor.y) * ease,
    scale:
      studyFloorScale(floor.y) +
      (anchor.scale - studyFloorScale(floor.y)) * ease,
    depth,
    key: anchor.id,
    occluders: [],
    foreground: anchor.foreground,
    frames: anchor.frames,
    tint: 0xfff6eb,
    shadows:
      t < 1
        ? [
            {
              x: floor.x + (anchor.contact.x - floor.x) * ease,
              y: floor.y + (anchor.contact.y - floor.y) * ease,
              width: 46,
              height: 8,
              alpha: 0.18,
            },
          ]
        : anchor.shadow,
    seat: anchor.seat,
    transition:
      kind === "leave" || p < 1
        ? { kind, progress: p, furniture: anchor.id }
        : undefined,
  };
}

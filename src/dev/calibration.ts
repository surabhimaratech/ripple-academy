import type { Placement } from "../heroine/presentation";
export interface Calibration {
  x: number;
  y: number;
  scale: number;
}
export const neutralCalibration: Calibration = { x: 0, y: 0, scale: 1 };
/** Development-only, render-only offsets. Never mutate room definitions or saved progress. */
export function calibratePlacement(p: Placement, c: Calibration): Placement {
  return { ...p, x: p.x + c.x, y: p.y + c.y, scale: (p.scale ?? 1) * c.scale };
}
export function calibrationRecord(
  room: string,
  activity: string,
  p: Placement,
) {
  return JSON.stringify(
    {
      format: "ripple-furniture-calibration",
      version: 1,
      room,
      activity,
      contact: { x: p.x, y: p.y, scale: p.scale ?? 1, depth: p.depth },
      occluders: p.occluders,
      foreground: p.foreground,
      seat: p.seat,
    },
    null,
    2,
  );
}

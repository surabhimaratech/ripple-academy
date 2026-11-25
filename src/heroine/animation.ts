import type { Facing, Pose, BehaviorState } from "../game/behavior";
import { heroine } from "./assets";
import { workSample, telescopeSample, loopFrame, chartFrame } from "./programs";
export interface HeroinePose {
  facing: Facing;
  moving: boolean;
  engaged: boolean;
  pose: Pose;
  activityId?: string;
  state: BehaviorState;
  clock: number;
  activityTime: number;
}
function clip(name: keyof typeof heroine.clips, time: number) {
  const c = heroine.clips[name];
  return c.frames[Math.floor((time * 1000) / c.frameMs) % c.frames.length];
}
/** Pure visual selection. Never changes behavior, position, sessions or rewards. */
export function heroineFrame(p: HeroinePose, reduced: boolean): string {
  if (p.state === "celebrating")
    return reduced ? `idle-${p.facing}` : "celebrate";
  if (p.moving)
    return reduced ? `idle-${p.facing}` : clip(`walk-${p.facing}`, p.clock);
  if (p.engaged) {
    if (p.activityId === "telescope")
      return telescopeSample(p.activityTime, reduced).frame;
    if (p.pose === "code") return workSample(p.activityTime, reduced).frame;
    if (p.pose === "pastry")
      return reduced
        ? "cafe-pastry-a"
        : p.activityTime % 16 < 4
          ? loopFrame("tea", p.activityTime)
          : loopFrame("pastry", p.activityTime - 4);
    if (p.pose === "tea")
      return reduced ? "tea-hold" : loopFrame("tea", p.activityTime);
    if (p.pose === "sleep")
      return reduced ? "sleep-a" : loopFrame("sleeping", p.activityTime);
    if (p.pose === "stretch")
      return reduced ? "stretch-a" : loopFrame("stretch", p.activityTime);
    if (p.pose === "examine" || p.activityId?.includes("chest"))
      return "examine";
    if (p.pose === "write")
      return p.activityId === "charts"
        ? chartFrame(p.activityTime, reduced)
        : reduced
          ? "write-a"
          : clip("writing", p.activityTime);
    if (p.pose === "seated-read")
      return !reduced && p.activityTime % 16 > 11 && p.activityTime % 16 < 12
        ? "read-page"
        : "read-seated";
    if (p.pose === "read") return "read-standing";
    if (p.pose === "browse")
      return reduced || p.activityTime % 14 < 3 ? "browse" : "read-standing";
    if (p.pose === "sit" || p.pose === "rest") return "rest";
    if (p.pose === "observe" || p.pose === "globe")
      return p.facing === "up"
        ? !reduced && p.activityTime % 22 > 16
          ? "window-thought"
          : "window"
        : `idle-${p.facing}`;
  }
  return !reduced && p.clock % 7.3 > 7.12
    ? `blink-${p.facing}`
    : `idle-${p.facing}`;
}

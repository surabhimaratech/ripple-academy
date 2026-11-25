import { heroine } from "./assets";
export interface Sample {
  frame: string;
  phase: string;
  label: string;
}
export function loopFrame(
  name: keyof typeof heroine.clips,
  time: number,
): string {
  const clip = heroine.clips[name];
  return clip.frames[
    Math.floor((Math.max(0, time) * 1000) / clip.frameMs) % clip.frames.length
  ];
}
export function workSample(time: number, reduced: boolean): Sample {
  if (reduced) return { frame: "type-a", phase: "desk", label: "Typing" };
  const t = Math.max(0, time) % 36;
  if (t < 16 || (t >= 20 && t < 27))
    return {
      frame: loopFrame("typing", t),
      phase: "typing",
      label: "Typing at her laptop",
    };
  if (t < 20 || t >= 34)
    return {
      frame: "think-work",
      phase: "thinking",
      label: "Pausing to think",
    };
  return {
    frame: loopFrame("consulting", t - 27),
    phase: "consulting",
    label: "Consulting an open book",
  };
}
export function telescopeSample(time: number, reduced: boolean): Sample {
  const adjust = !reduced && time % 30 >= 22 && time % 30 < 26;
  return {
    frame: adjust
      ? "telescope-adjust"
      : reduced
        ? "telescope-a"
        : loopFrame("telescope", time),
    phase: adjust ? "adjusting" : "eyepiece",
    label: adjust ? "Adjusting the telescope" : "Looking through the telescope",
  };
}
export function chartFrame(time: number, reduced: boolean) {
  const t = Math.max(0, time) % 24;
  return reduced
    ? "write-a"
    : t >= 14 && t < 18
      ? loopFrame("consulting", t - 14)
      : loopFrame("writing", t);
}

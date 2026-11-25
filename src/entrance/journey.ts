/** All cinematic poses are derived from scroll, so reversing scroll reverses the story. */
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export function cue(progress: number, start: number, end: number) {
  const t = clamp((progress - start) / (end - start));
  return t * t * (3 - 2 * t);
}
export function journeyFrame(progress: number, reduced = false, intensity = 1) {
  const p = clamp(progress);
  const still = reduced || intensity <= 0;
  const approach = cue(p, 0.12, 0.4);
  return {
    progress: p,
    approach: still ? 0 : approach * clamp(intensity),
    title: 1 - cue(p, 0.045, 0.2),
    exterior: 1 - cue(p, 0.34, 0.4),
    courtyard: cue(p, 0.34, 0.4),
    courtyardScale: still ? 1 : 1.09 - cue(p, 0.4, 0.72) * 0.09,
    gate: still ? 0 : cue(p, 0.27, 0.37) * (1 - cue(p, 0.605, 0.68)),
    gateAngle: still ? 0 : cue(p, 0.4, 0.6) * 103,
    gateScale: still
      ? 1
      : 0.55 + cue(p, 0.27, 0.4) * 0.45 + cue(p, 0.57, 0.68) * 0.65,
    gateX: still ? 0 : (1 - cue(p, 0.27, 0.4)) * 14,
    light: still ? 0 : Math.sin(cue(p, 0.4, 0.62) * Math.PI) * 0.65,
    welcome: cue(p, 0.615, 0.66),
    progressInfo: cue(p, 0.64, 0.69),
    chapters: cue(p, 0.67, 0.72),
  };
}
export type JourneyFrame = ReturnType<typeof journeyFrame>;
export const initialFrame = () => journeyFrame(0);
/** First four stages occupy the sticky travel; the fifth is normal document scrolling. */
export function journeyProgress(
  scrollY: number,
  top: number,
  trackHeight: number,
  viewport: number,
  wingsHeight: number,
) {
  const travel = Math.max(1, trackHeight - viewport);
  const relative = Math.max(0, scrollY - top);
  return relative <= travel
    ? clamp(relative / travel) * 0.8
    : 0.8 + clamp((relative - travel) / Math.max(1, wingsHeight)) * 0.2;
}
export function layerCamera(role: string, approach: number) {
  const near =
    role === "foreground"
      ? 1.7
      : role === "forest"
        ? 1.25
        : role === "lake"
          ? 0.72
          : role === "architecture"
            ? 0.85
            : role === "atmosphere"
              ? 0.15
              : role === "mountains"
                ? 0.1
                : 0.02;
  return {
    scale: 1 + approach * near,
    x: -650 * approach * Math.min(near, 1),
    y: role === "foreground" ? approach * 180 : -130 * approach * near,
  };
}

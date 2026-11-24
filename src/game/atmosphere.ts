export type TimeOfDay = "morning" | "afternoon" | "twilight" | "night";
export function localTimeOfDay(hour: number): TimeOfDay {
  return hour >= 6 && hour < 11
    ? "morning"
    : hour >= 11 && hour < 17
      ? "afternoon"
      : hour >= 17 && hour < 20
        ? "twilight"
        : "night";
}
export function parallaxTarget(
  pointer: { x: number; y: number },
  seconds: number,
  idleSeconds: number,
  intensity: number,
  reduced: boolean,
) {
  if (reduced || intensity === 0) return { x: 0, y: 0 };
  return idleSeconds > 6
    ? { x: Math.sin(seconds * 0.09) * 0.32, y: Math.cos(seconds * 0.07) * 0.18 }
    : {
        x: Math.max(-1, Math.min(1, pointer.x)),
        y: Math.max(-1, Math.min(1, pointer.y)),
      };
}
export function easeParallax(
  current: { x: number; y: number },
  target: { x: number; y: number },
  dt: number,
) {
  const blend = 1 - Math.exp(-Math.min(Math.max(dt, 0), 0.05) * 1.6);
  return {
    x: current.x + (target.x - current.x) * blend,
    y: current.y + (target.y - current.y) * blend,
  };
}

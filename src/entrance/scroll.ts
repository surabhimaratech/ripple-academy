import type { State } from "../domain/model";
import { activeSession, validRoom, type Interior } from "../domain/sessions";
export function scrollProgress(
  scrollY: number,
  sectionTop: number,
  sectionHeight: number,
  viewportHeight: number,
) {
  return Math.max(
    0,
    Math.min(
      1,
      (scrollY - sectionTop) / Math.max(1, sectionHeight - viewportHeight),
    ),
  );
}
export function layerOffset(
  progress: number,
  depth: number,
  height: number,
  intensity: number,
  reduced: boolean,
) {
  return reduced || intensity <= 0 || progress <= 0
    ? 0
    : -Math.max(0, Math.min(1, progress)) *
        depth *
        height *
        Math.max(0, Math.min(1, intensity));
}
export function interpolate(current: number, target: number, dt: number) {
  return (
    current +
    (target - current) * (1 - Math.exp(-Math.min(Math.max(dt, 0), 0.1) * 8))
  );
}
export function resumeDestination(
  state: State | undefined,
  lastRoom: string,
): Interior {
  return (
    (state && activeSession(state)?.room) ||
    (validRoom(lastRoom)
      ? lastRoom
      : (state?.sessions?.[0]?.room ?? "grand-library"))
  );
}

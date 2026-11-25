import { useEffect, useRef, useState } from "react";
import { initialFrame, journeyFrame, journeyProgress } from "./journey";
import { interpolate } from "./scroll";

export function useJourney(reduced: boolean, intensity: number) {
  const track = useRef<HTMLElement>(null);
  const frame = useRef(initialFrame());
  const [arrivalAccessible, setArrivalAccessible] = useState(true);
  const [controlsAccessible, setControlsAccessible] = useState(false);
  const [groundsAccessible, setGroundsAccessible] = useState(false);
  useEffect(() => {
    const element = track.current!;
    const wings = element.nextElementSibling as HTMLElement;
    let raf = 0,
      last = 0,
      current = frame.current.progress,
      disposed = false;
    const target = () =>
      journeyProgress(
        window.scrollY,
        element.offsetTop,
        element.offsetHeight,
        innerHeight,
        wings.offsetHeight,
      );
    const paint = (now: number) => {
      raf = 0;
      if (disposed || document.hidden) return;
      const goal = target();
      current = reduced
        ? goal
        : interpolate(current, goal, last ? (now - last) / 1000 : 0.05);
      last = now;
      if (Math.abs(current - goal) < 0.00008) current = goal;
      const f = journeyFrame(current, reduced, intensity);
      frame.current = f;
      for (const [name, value] of Object.entries(f))
        element.style.setProperty(`--${name}`, String(value));
      element.style.setProperty("--gate-rotation", `${f.gateAngle}deg`);
      element.style.setProperty("--gate-x", `${f.gateX}%`);
      element.style.setProperty(
        "--title-y",
        `${reduced ? 0 : -50 * (1 - f.title)}px`,
      );
      setGroundsAccessible(current >= 0.615);
      setControlsAccessible(current >= 0.7);
      setArrivalAccessible(current < 0.2);
      if (current !== goal) raf = requestAnimationFrame(paint);
    };
    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(paint);
    };
    const visibility = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
      if (!document.hidden) {
        current = target();
        wake();
      }
    };
    const resize = new ResizeObserver(wake);
    resize.observe(element);
    resize.observe(wings);
    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    wake();
    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resize.disconnect();
      window.removeEventListener("scroll", wake);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [reduced, intensity]);
  return {
    track,
    frame,
    groundsAccessible,
    arrivalAccessible,
    controlsAccessible,
  };
}

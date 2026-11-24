import { useEffect, useRef, useState } from "react";
export function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
export function remember(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Preferences remain usable in memory if storage is blocked. */
  }
}
export function useMotion() {
  const [mode, setMode] = useState(preference("university-motion", "system"));
  const [system, setSystem] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystem(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  return {
    reduced: mode === "reduced" || (mode === "system" && system),
    mode,
    setMode: (next: string) => {
      setMode(next);
      remember("university-motion", next);
    },
  };
}
export function useAnimatedNumber(target: number, reduced: boolean) {
  const [value, setValue] = useState(target);
  const latest = useRef(value);
  useEffect(() => {
    if (reduced) {
      latest.current = target;
      setValue(target);
      return;
    }
    const start = performance.now(),
      from = latest.current;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 750);
      latest.current = Math.round(from + (target - from) * (1 - (1 - t) ** 3));
      setValue(latest.current);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);
  return value;
}
let audio: AudioContext | undefined;
export function prepareChime() {
  try {
    audio ??= new AudioContext();
    void audio.resume().catch(() => {});
  } catch {
    /* Sound is optional. */
  }
}
export function chime(levelUp: boolean) {
  if (!audio) return;
  const context = audio;
  const notes = levelUp
    ? [523.25, 659.25, 783.99, 1046.5]
    : [659.25, 783.99, 987.77];
  notes.forEach((hz, i) => {
    const oscillator = context.createOscillator(),
      gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = hz;
    const at = context.currentTime + i * 0.105;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(0.045, at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, at + 0.38);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(at);
    oscillator.stop(at + 0.4);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  });
}

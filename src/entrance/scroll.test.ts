import { describe, expect, it } from "vitest";
import { apply } from "../domain/model";
import { legacyState as initialState } from "../domain/legacyFixture";
import {
  scrollProgress,
  layerOffset,
  interpolate,
  resumeDestination,
} from "./scroll";

describe("cinematic scrolling", () => {
  it("uses the natural document range and clamps before and after a section", () => {
    expect(scrollProgress(0, 100, 1500, 900)).toBe(0);
    expect(scrollProgress(400, 100, 1500, 900)).toBe(0.5);
    expect(scrollProgress(2000, 100, 1500, 900)).toBe(1);
    expect(scrollProgress(100, 100, 900, 900)).toBe(0);
  });
  it("moves near layers farther while respecting off and reduced motion", () => {
    expect(Math.abs(layerOffset(0.5, 0.2, 1000, 0.6, false))).toBeGreaterThan(
      Math.abs(layerOffset(0.5, 0.05, 1000, 0.6, false)),
    );
    expect(layerOffset(1, 0.2, 1000, 0, false)).toBe(0);
    expect(layerOffset(1, 0.2, 1000, 1, true)).toBe(0);
    expect(layerOffset(10, 0.2, 1000, 5, false)).toBe(-200);
  });
  it("interpolates without overshoot or a jump after a suspended frame", () => {
    expect(interpolate(0, 1, 0)).toBe(0);
    expect(interpolate(0, 1, 0.016)).toBeGreaterThan(0);
    expect(interpolate(0, 1, 60)).toBeLessThan(1);
    expect(interpolate(1, 0, 0.016)).toBeGreaterThan(0);
    expect(interpolate(0, 1, -1)).toBe(0);
  });
});
describe("returning scholar shortcut", () => {
  it("falls back safely for a new or invalid remembered destination", () => {
    expect(resumeDestination(undefined, "university")).toBe("grand-library");
    expect(resumeDestination(initialState(), "observatory")).toBe(
      "observatory",
    );
  });
  it("prioritizes an active activity over the last room without changing the save", () => {
    const state = apply(initialState(), {
      type: "startSession",
      id: "s",
      runId: "r",
      categoryId: "coding",
    });
    const before = JSON.stringify(state);
    expect(resumeDestination(state, "observatory")).toBe("personal-study");
    const paused = apply(state, {
      type: "pauseSession",
      id: "s",
      runId: "r",
      elapsedMs: 0,
    });
    expect(resumeDestination(paused, "grand-library")).toBe("personal-study");
    expect(JSON.stringify(state)).toBe(before);
  });
});

import { describe, it, expect } from "vitest";
import { cue, journeyFrame, journeyProgress, layerCamera } from "./journey";

describe("five-stage arrival timeline", () => {
  it("maps native sticky travel to 0–80% and ordinary wings scrolling to 80–100%", () => {
    expect(journeyProgress(100, 100, 4500, 900, 900)).toBe(0);
    expect(journeyProgress(1900, 100, 4500, 900, 900)).toBe(0.4);
    expect(journeyProgress(3700, 100, 4500, 900, 900)).toBe(0.8);
    expect(journeyProgress(4600, 100, 4500, 900, 900)).toBe(1);
    expect(journeyProgress(0, 100, 4500, 900, 900)).toBe(0);
    expect(journeyProgress(10000, 100, 4500, 900, 900)).toBe(1);
  });
  it("fades the identity before opening gates and delays progress until inside", () => {
    expect(journeyFrame(0)).toMatchObject({
      title: 1,
      courtyard: 0,
      gate: 0,
      gateAngle: 0,
      welcome: 0,
    });
    expect(journeyFrame(0.2).title).toBe(0);
    expect(journeyFrame(0.4)).toMatchObject({
      gate: 1,
      gateAngle: 0,
      welcome: 0,
      chapters: 0,
    });
    expect(journeyFrame(0.6).gateAngle).toBe(103);
    expect(journeyFrame(0.6).welcome).toBe(0);
    expect(journeyFrame(0.74)).toMatchObject({
      gate: 0,
      welcome: 1,
      progressInfo: 1,
      chapters: 1,
    });
  });
  it("reverses exactly without depending on elapsed time or previous scroll direction", () => {
    const forward = [0.4, 0.45, 0.5, 0.55, 0.6].map(
      (p) => journeyFrame(p).gateAngle,
    );
    const reverse = [0.6, 0.55, 0.5, 0.45, 0.4]
      .map((p) => journeyFrame(p).gateAngle)
      .reverse();
    expect(reverse).toEqual(forward);
    expect(forward).toEqual([...forward].sort((a, b) => a - b));
    expect(forward[2]).toBeCloseTo(51.5);
  });
  it("keeps a complete background throughout the transition, with no opacity holes", () => {
    for (let i = 0; i <= 1000; i++) {
      const f = journeyFrame(i / 1000);
      expect(f.exterior + f.courtyard).toBeCloseTo(1);
      for (const key of [
        "title",
        "exterior",
        "courtyard",
        "gate",
        "welcome",
        "progressInfo",
        "chapters",
      ] as const) {
        expect(f[key]).toBeGreaterThanOrEqual(0);
        expect(f[key]).toBeLessThanOrEqual(1);
      }
    }
  });
  it("removes zoom, door rotation and spill in reduced motion or parallax Off while preserving access", () => {
    for (const f of [journeyFrame(0.5, true), journeyFrame(0.5, false, 0)]) {
      expect(f).toMatchObject({
        approach: 0,
        gate: 0,
        gateAngle: 0,
        courtyardScale: 1,
        light: 0,
      });
    }
    expect(journeyFrame(0.74, true)).toMatchObject({
      courtyard: 1,
      welcome: 1,
      chapters: 1,
    });
  });
  it("uses different camera transforms for distant and near layers", () => {
    const sky = layerCamera("sky", 1),
      castle = layerCamera("architecture", 1),
      foreground = layerCamera("foreground", 1);
    expect(sky.scale).toBeLessThan(castle.scale);
    expect(castle.scale).toBeLessThan(foreground.scale);
    expect(castle.x).not.toBe(foreground.x);
    expect(foreground.y).toBeGreaterThan(0);
    expect(layerCamera("architecture", 0)).toMatchObject({ scale: 1 });
  });
  it("clamps cues and timeline endpoints outside the scroll range", () => {
    expect(cue(-1, 0.4, 0.6)).toBe(0);
    expect(cue(2, 0.4, 0.6)).toBe(1);
    expect(journeyFrame(-100)).toEqual(journeyFrame(0));
    expect(journeyFrame(100)).toEqual(journeyFrame(1));
  });
});

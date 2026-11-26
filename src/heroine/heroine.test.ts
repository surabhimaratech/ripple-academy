import { describe, it, expect } from "vitest";
import { heroine, frameNames, validateHeroineManifest } from "./assets";
import { atlasCell, silhouetteBounds, anchoredFrame } from "./atlas";
import { heroineFrame, type HeroinePose } from "./animation";
const idle: HeroinePose = {
  facing: "down",
  moving: false,
  engaged: false,
  pose: "idle",
  state: "idle",
  clock: 0,
  activityTime: 0,
};
describe("canonical heroine artwork pipeline", () => {
  it("validates unique frame names, clip references and common foot anchors", () => {
    expect(validateHeroineManifest()).toBe(true);
    expect(frameNames.size).toBe(70);
    expect(heroine.canvas).toMatchObject({
      width: 96,
      height: 144,
      footX: 48,
      footY: 136,
    });
  });
  it("partitions fractional atlas cells with no gaps or overlap", () => {
    const cells = Array.from({ length: 4 }, (_, column) =>
      atlasCell(1254, 1254, 4, 4, column, 0),
    );
    expect(cells.reduce((n, c) => n + c.width, 0)).toBe(1254);
    expect(cells[0].x + cells[0].width).toBe(cells[1].x);
    expect(cells[3].x + cells[3].width).toBe(1254);
  });
  it("ignores isolated alpha specks while retaining the main figure", () => {
    const pixels = new Uint8ClampedArray(30 * 40 * 4);
    for (let y = 8; y <= 30; y++)
      for (let x = 10; x <= 20; x++) pixels[(y * 30 + x) * 4 + 3] = 255;
    pixels[(39 * 30 + 29) * 4 + 3] = 255;
    const bounds = silhouetteBounds(pixels, 30, 40);
    expect(bounds.y + bounds.height).toBeLessThan(39);
    expect(bounds.x).toBeLessThanOrEqual(10);
    expect(bounds.x + bounds.width).toBeGreaterThan(20);
    expect(() => silhouetteBounds(new Uint8ClampedArray(160), 5, 8)).toThrow(
      /silhouette/,
    );
  });
  it("aligns different silhouettes to the same foot baseline without stretching", () => {
    for (const b of [
      { x: 2, y: 6, width: 100, height: 250 },
      { x: 8, y: 1, width: 180, height: 230 },
    ]) {
      const d = anchoredFrame(b, 112, heroine.canvas);
      expect(d.y + d.height).toBe(heroine.canvas.footY);
      expect(
        Math.abs(d.x + d.width / 2 - heroine.canvas.footX),
      ).toBeLessThanOrEqual(0.5);
      expect(d.width / b.width).toBeCloseTo(d.height / b.height, 1);
      expect(d.x).toBeGreaterThanOrEqual(0);
    }
  });
  it("uses distinct directional walking art, blink and reduced-motion stills", () => {
    for (const facing of ["up", "down", "left", "right"] as const) {
      expect(heroineFrame({ ...idle, facing, clock: 7.2 }, false)).toBe(
        `blink-${facing}`,
      );
      expect(
        heroineFrame({ ...idle, facing, moving: true, clock: 0.18 }, false),
      ).toBe(`walk-a-${facing}`);
      expect(
        heroineFrame({ ...idle, facing, moving: true, clock: 0.52 }, false),
      ).toBe(`walk-b-${facing}`);
      expect(
        heroineFrame({ ...idle, facing, moving: true, clock: 7.2 }, true),
      ).toBe(`idle-${facing}`);
    }
  });
  it("selects supplied activity poses and preserves still activities in reduced motion", () => {
    expect(
      heroineFrame(
        { ...idle, engaged: true, pose: "seated-read", activityTime: 11.5 },
        false,
      ),
    ).toBe("read-page");
    expect(
      heroineFrame(
        { ...idle, engaged: true, pose: "seated-read", activityTime: 11.5 },
        true,
      ),
    ).toBe("read-seated");
    expect(
      heroineFrame(
        { ...idle, engaged: true, pose: "code", activityTime: 0.7 },
        false,
      ),
    ).toBe("type-b");
    expect(
      heroineFrame(
        { ...idle, engaged: true, pose: "write", activityTime: 1 },
        false,
      ),
    ).toBe("write-b");
    expect(
      heroineFrame(
        {
          ...idle,
          engaged: true,
          pose: "globe",
          activityId: "telescope",
          activityTime: 2.3,
        },
        false,
      ),
    ).toBe("telescope-b");
    expect(
      heroineFrame(
        { ...idle, engaged: true, pose: "observe", facing: "up" },
        true,
      ),
    ).toBe("window");
    expect(heroineFrame({ ...idle, engaged: true, pose: "rest" }, true)).toBe(
      "rest",
    );
  });
  it("keeps celebration and manual movement visual without mutating behavior inputs", () => {
    const input = { ...idle, state: "celebrating" as const };
    expect(heroineFrame(input, false)).toBe("celebrate");
    expect(heroineFrame(input, true)).toBe("idle-down");
    expect(input).toEqual({ ...idle, state: "celebrating" });
  });
});

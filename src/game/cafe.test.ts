import { it, expect } from "vitest";
import { ScholarBehavior } from "./behavior";
import { cafeConfig, cafeStart, cafeSeat, cafeProps } from "./cafe";
import { placementFor, frameForPlacement } from "../heroine/presentation";
import { frameNames } from "../heroine/assets";
it("all seated café activities share a stable satchel-free contact behind the original furniture fronts", () => {
  const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart);
  b.setSession("cafe-drink");
  for (let i = 0; i < 1500; i++) b.step(1 / 30);
  const first = placementFor("happy-cafe", b);
  for (const id of [
    "cafe-read",
    "cafe-pastry",
    "cafe-relax",
    "cafe-window",
    "cafe-drink",
  ]) {
    b.setSession(id);
    const p = placementFor("happy-cafe", b);
    expect([p.x, p.y, p.scale, p.depth]).toEqual([
      first.x,
      first.y,
      first.scale,
      first.depth,
    ]);
    expect(b.settling).toBe(0);
    expect(p.seat).toEqual(cafeSeat.seat);
    expect(p.depth).toBeLessThan(589);
    expect(p.depth).toBeLessThan(
      cafeProps.find((p) => p.id === "window-table")!.depth,
    );
  }
  expect(frameForPlacement("idle-down", first)).toBe("study-look-up");
  for (const f of ["read-seated", "read-page", "tea-hold", "tea-sip", "rest"])
    expect(frameForPlacement(f, first)).toMatch(/^study-/);
});
it("counter gestures use registered rear-facing artwork instead of a front-facing examine pose", () => {
  const b = new ScholarBehavior(cafeConfig, () => 0.5, cafeStart);
  b.setSession("cafe-order");
  for (let i = 0; i < 600; i++) b.step(1 / 30);
  const p = placementFor("happy-cafe", b);
  expect(p.key).toBe("cafe-counter");
  expect(b.facing).toBe("up");
  expect(frameForPlacement("examine", p, 0)).toBe("cafe-order-a");
  expect(frameForPlacement("examine", p, 2)).toBe("cafe-order-b");
  expect(frameNames.has(frameForPlacement("examine", p, 2))).toBe(true);
  expect(frameForPlacement("examine", p, 2, true)).toBe("cafe-order-a");
});

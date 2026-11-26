import { it, expect } from "vitest";
import {
  observatoryConfig,
  observatoryStart,
  telescopeContact,
  observatoryFurniture,
} from "./observatory";
import { ScholarBehavior } from "./behavior";
import { placementFor, frameForPlacement } from "../heroine/presentation";
import { groundContactX, registeredFrames } from "../heroine/atlas";

it("every Observatory activity can enter, hold, leave, and resume after manual input", () => {
  for (const activity of observatoryConfig.activities) {
    const b = new ScholarBehavior(
      observatoryConfig,
      () => 0.5,
      observatoryStart,
    );
    b.setSession(activity.id);
    for (let i = 0; i < 1800; i++) {
      b.step(1 / 30);
      expect(b.nav.valid(b.position), activity.id).toBe(true);
    }
    expect(b.activity?.id).toBe(activity.id);
    expect(b.takeEvents()).toEqual([]);
    b.manual({ x: 1, y: 0 }, 0.1);
    expect(b.state).toBe("player-controlled");
    for (let i = 0; i < 1800; i++) {
      b.step(1 / 30);
      expect(b.nav.valid(b.position), activity.id).toBe(true);
    }
    expect(b.activity?.id).toBe(activity.id);
    expect(b.takeEvents()).toEqual([]);
  }
});
it("telescope observation and adjustment share a grounded eye and control registration", () => {
  for (const id of ["telescope", "telescope-adjustment"]) {
    const activity = observatoryConfig.activities.find((a) => a.id === id)!;
    const p = placementFor("observatory", {
      activity,
      position: activity.point,
      state: activity.state,
      moving: false,
      pose: activity.pose,
      offsetY: 0,
    });
    expect(p.key).toBe("obs-telescope");
    expect(
      Math.hypot(
        p.x +
          telescopeContact.eyeOffset.x * p.scale! -
          telescopeContact.eyepiece.x,
        p.y +
          telescopeContact.eyeOffset.y * p.scale! -
          telescopeContact.eyepiece.y,
      ),
    ).toBeLessThan(1);
    expect(
      Math.hypot(
        p.x +
          telescopeContact.handOffset.x * p.scale! -
          telescopeContact.control.x,
        p.y +
          telescopeContact.handOffset.y * p.scale! -
          telescopeContact.control.y,
      ),
    ).toBeLessThan(1);
    for (const frame of [
      "obs-observe-a",
      "obs-observe-b",
      "obs-adjust-a",
      "obs-adjust-b",
    ])
      expect(frameForPlacement(frame, p)).toBe(frame);
  }
});
it("desk and armchair activity changes keep identical settled contacts and satchel-free frames", () => {
  for (const ids of [
    ["observatory-code", "observatory-think", "charts", "galaxy-chart"],
    ["observatory-read", "observatory-rest"],
  ]) {
    const poses = ids.map((id) => {
      const activity = observatoryConfig.activities.find((a) => a.id === id)!;
      return placementFor("observatory", {
        activity,
        position: activity.point,
        state: activity.state,
        moving: false,
        pose: activity.pose,
        offsetY: 0,
      });
    });
    for (const p of poses)
      expect([p.x, p.y, p.scale, p.seat]).toEqual([
        poses[0].x,
        poses[0].y,
        poses[0].scale,
        poses[0].seat,
      ]);
  }
  expect(Object.values(observatoryFurniture.desk.frames)).toContain(
    "study-type-a",
  );
  expect(Object.values(observatoryFurniture.armchair.frames)).toContain(
    "study-read",
  );
});
it("standing frame registration follows boots while changing hands cannot shift the feet", () => {
  const rgba = new Uint8ClampedArray(20 * 30 * 4);
  for (let y = 27; y < 30; y++)
    for (let x = 7; x <= 11; x++) rgba[(y * 20 + x) * 4 + 3] = 255;
  const x = groundContactX(rgba, 20, { x: 0, y: 0, width: 20, height: 30 });
  expect(x).toBe(9);
  const frames = registeredFrames(
    [
      { x: 1, y: 0, width: 16, height: 30 },
      { x: 0, y: 0, width: 18, height: 30 },
    ],
    112,
    { width: 96, height: 144, footX: 48, footY: 136 },
    [x, x],
  );
  expect(frames[0].y + frames[0].height).toBe(136);
  expect(frames[1].y + frames[1].height).toBe(136);
  expect(
    Math.abs(
      frames[0].x +
        ((x - 1) * frames[0].width) / 16 -
        (frames[1].x + (x * frames[1].width) / 18),
    ),
  ).toBeLessThan(1);
});

import { it, expect } from "vitest";
import { interactionEntry } from "./interactions";
import { roomDefinitions } from "../game/rooms";
import { ScholarBehavior } from "../game/behavior";
import { placementFor, frameForPlacement } from "../heroine/presentation";
import { heroineFrame } from "../heroine/animation";
import { frameNames } from "../heroine/assets";
it("can directly trigger every configured room activity without unrelated wandering or menu events", () => {
  for (const room of Object.values(roomDefinitions))
    for (const activity of room.config.activities) {
      const entry = interactionEntry(room.id, activity.id);
      expect(entry.room).toBe(room.id);
      expect(entry.activity).toBe(activity.id);
      expect(entry.facing).toBe(activity.facing);
      const b = new ScholarBehavior(room.config, () => 0.5, room.start);
      b.setSession(entry.activity);
      for (let i = 0; i < 1500; i++) {
        b.step(1 / 30);
        expect(b.nav.valid(b.position)).toBe(true);
      }
      expect(b.activity?.id, `${room.id}/${activity.id}`).toBe(activity.id);
      expect(b.takeEvents()).toEqual([]);
      const pose = {
        facing: b.facing,
        moving: b.moving,
        engaged: true,
        pose: b.pose,
        activityId: activity.id,
        state: b.state,
        clock: 50,
        activityTime: b.engaged,
      };
      expect(
        frameNames.has(
          frameForPlacement(
            heroineFrame(pose, false),
            placementFor(room.id, b),
            b.engaged,
          ),
        ),
      ).toBe(true);
    }
});
it("rejects cross-room or missing activity identifiers", () => {
  expect(() => interactionEntry("personal-study", "telescope")).toThrow(
    /Unknown activity/,
  );
  expect(() => interactionEntry("grand-library", "not-an-activity")).toThrow(
    /Unknown activity/,
  );
});

import { it, expect } from "vitest";
import { roomDefinitions } from "./rooms";
import { sessionPlan } from "./sessionActivity";
import { apply, initialState } from "../domain/model";
import { activeSession } from "../domain/sessions";
it.each([
  ["coding", "personal-study", "code"],
  ["interview", "personal-study", "code"],
  ["reading", "grand-library", "armchair-book"],
  ["astronomy", "observatory", "telescope"],
  ["journaling", "personal-study", "study-write"],
] as const)(
  "explicit %s mirrors the right room/pose without granting rewards",
  (categoryId, room, activity) => {
    const state = apply(initialState(), {
      type: "startSession",
      id: "s",
      runId: "r",
      categoryId,
    });
    const session = activeSession(state)!;
    expect(session.room).toBe(room);
    expect(sessionPlan(roomDefinitions[room], session)?.activity).toBe(
      activity,
    );
    expect([state.xp, state.gold]).toEqual([0, 0]);
    expect(
      sessionPlan(
        roomDefinitions[
          room === "observatory" ? "personal-study" : "observatory"
        ],
        session,
      ),
    ).toBeUndefined();
  },
);
it("honors a custom room mapping for writing and keeps paused sessions eligible for the existing pause controller", () => {
  const state = apply(initialState(), {
    type: "startSession",
    id: "s",
    runId: "r",
    categoryId: "astronomy",
  });
  const session = {
    ...activeSession(state)!,
    categoryId: "journal",
    title: "Research notes",
    phase: "paused" as const,
  };
  expect(sessionPlan(roomDefinitions.observatory, session)).toEqual({
    activity: "charts",
    variations: [],
    intro: undefined,
  });
});

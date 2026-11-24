import type { State } from "./model";
export const keepsakes = [
  {
    id: "first-page",
    name: "The first page",
    item: "Brass ink bottle",
    icon: "ink",
    description: "Complete your first quest. A beginning worth keeping.",
  },
  {
    id: "curious-mind",
    name: "A curious mind",
    item: "Pressed fern",
    icon: "fern",
    description: "Write your first discovery in the notebook.",
  },
  {
    id: "small-steps",
    name: "Small steps",
    item: "Embroidered bookmark",
    icon: "bookmark",
    description: "Have three completed quests in your journal.",
  },
  {
    id: "growing-light",
    name: "A growing light",
    item: "Moonstone paperweight",
    icon: "moon",
    description: "Reach scholar level 2 (100 total XP).",
  },
] as const;
export function unlockedKeepsakes(s: State): string[] {
  const ids = new Set(s.keepsakes ?? []);
  const completed = s.quests.filter((q) => q.completed).length;
  if (completed >= 1) ids.add("first-page");
  if ((s.discoveries?.length ?? 0) > 0) ids.add("curious-mind");
  if (completed >= 3) ids.add("small-steps");
  if (s.xp >= 100) ids.add("growing-light");
  return [...ids];
}

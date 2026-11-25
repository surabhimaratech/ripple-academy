import type { State, Reward } from "./model";
export const rewardKinds = ["coffee", "pastry", "book", "celebrate"] as const;
export type RewardKind = (typeof rewardKinds)[number];
export interface RedemptionIntent {
  id: string;
  rewardId: string;
  title: string;
  cost: number;
  kind: RewardKind;
  at: string;
}
export type RewardAction =
  | { type: "addCafeStarters" }
  | { type: "prepareRedemption"; id: string; intentId: string }
  | { type: "dismissRedemption"; id: string }
  | { type: "confirmRedemption"; id: string }
  | {
      type: "enjoyRedemption" | "cancelRedemption" | "finishRewardVisual";
      id: string;
    };
export const cafeStarters: Reward[] = [
  {
    id: "cafe-starter-coffee",
    title: "Coffee of your choice",
    cost: 5,
    kind: "coffee",
  },
  {
    id: "cafe-starter-pastry",
    title: "Coffee and pastry",
    cost: 8,
    kind: "pastry",
  },
  {
    id: "cafe-starter-movie",
    title: "Movie evening",
    cost: 10,
    kind: "celebrate",
  },
  {
    id: "cafe-starter-takeout",
    title: "Favorite takeout",
    cost: 15,
    kind: "celebrate",
  },
  { id: "cafe-starter-book", title: "New book", cost: 25, kind: "book" },
  {
    id: "cafe-starter-treat",
    title: "Special personal treat",
    cost: 50,
    kind: "celebrate",
  },
];
/** Only explicit actions touch money. Activity/animation code never calls this reducer. */
export function reduceRewards(s: State, a: RewardAction, at: string) {
  if (a.type === "addCafeStarters" && !s.cafeStartersAdded) {
    const ids = new Set(s.rewards.map((r) => r.id));
    s.rewards.push(
      ...structuredClone(cafeStarters.filter((r) => !ids.has(r.id))),
    );
    s.cafeStartersAdded = true;
  }
  if (a.type === "prepareRedemption") {
    if (s.redemptionIntent)
      throw Error("Finish or cancel the current confirmation first.");
    if (s.history.some((h) => h.id === a.intentId)) return;
    const r = s.rewards.find((r) => r.id === a.id);
    if (!r) throw Error("This reward is no longer available.");
    s.redemptionIntent = {
      id: a.intentId,
      rewardId: r.id,
      title: r.title,
      cost: r.cost,
      kind: r.kind ?? "celebrate",
      at,
    };
  }
  if (a.type === "dismissRedemption" && s.redemptionIntent?.id === a.id)
    delete s.redemptionIntent;
  if (a.type === "confirmRedemption") {
    if (s.history.some((h) => h.id === a.id)) return;
    const intent = s.redemptionIntent;
    if (!intent || intent.id !== a.id)
      throw Error("Please select the reward again.");
    const r = s.rewards.find((r) => r.id === intent.rewardId);
    if (
      !r ||
      r.title !== intent.title ||
      r.cost !== intent.cost ||
      (r.kind ?? "celebrate") !== intent.kind
    )
      throw Error(
        "This reward changed. Cancel this confirmation and select it again.",
      );
    if (s.gold < intent.cost)
      throw Error("A little more gold is needed for this reward.");
    s.gold -= intent.cost;
    s.history.unshift({
      id: intent.id,
      title: intent.title,
      cost: intent.cost,
      at,
      kind: intent.kind,
      visualPending: true,
    });
    delete s.redemptionIntent;
  }
  if (
    a.type === "enjoyRedemption" ||
    a.type === "cancelRedemption" ||
    a.type === "finishRewardVisual"
  ) {
    const h = s.history.find((h) => h.id === a.id);
    if (!h) return;
    if (a.type === "enjoyRedemption" && !h.cancelledAt && !h.enjoyedAt)
      h.enjoyedAt = at;
    if (a.type === "finishRewardVisual") h.visualPending = false;
    if (a.type === "cancelRedemption" && !h.cancelledAt && !h.enjoyedAt) {
      h.cancelledAt = at;
      h.visualPending = false;
      s.gold += h.cost;
    }
  }
}

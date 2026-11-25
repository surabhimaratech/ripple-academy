import type { RewardKind } from "../domain/rewards";
import type { ScholarBehavior } from "./behavior";
export function rewardSteps(
  kind: RewardKind,
): { activity: string; seconds: number }[] {
  if (kind === "book")
    return [
      { activity: "cafe-gifts", seconds: 3 },
      { activity: "cafe-read", seconds: 8 },
    ];
  if (kind === "celebrate") return [{ activity: "cafe-arrive", seconds: 3 }];
  return [
    { activity: "cafe-order", seconds: 2 },
    { activity: "cafe-wait", seconds: 2 },
    {
      activity: kind === "pastry" ? "cafe-pastry" : "cafe-drink",
      seconds: kind === "pastry" ? 13 : 8,
    },
  ];
}
/** Active-time presentation only. No economy, persistence, wall clock or browser dependencies. */
export class RewardSequence {
  private index = 0;
  private elapsed = 0;
  private started = false;
  done = false;
  constructor(
    readonly id: string,
    readonly kind: RewardKind,
  ) {}
  get activity() {
    return rewardSteps(this.kind)[this.index]?.activity;
  }
  step(b: ScholarBehavior, dt: number) {
    if (this.done) return;
    if (!this.started) {
      b.setSession(this.activity);
      if (this.kind === "celebrate") b.celebrate(2.8);
      this.started = true;
    }
    // Walking, settling, celebration and manual overrides do not consume activity time.
    if (
      b.activity?.id !== this.activity ||
      b.moving ||
      b.settling > 0 ||
      b.departure > 0 ||
      b.manualRemaining > 0 ||
      b.state === "celebrating"
    )
      return;
    this.elapsed += Math.max(0, Math.min(0.05, dt));
    if (this.elapsed >= rewardSteps(this.kind)[this.index].seconds) {
      this.index++;
      this.elapsed = 0;
      this.started = false;
      if (!this.activity) {
        this.done = true;
        b.setSession(undefined);
      }
    }
  }
  skip(b: ScholarBehavior) {
    if (!this.done) {
      this.done = true;
      b.setSession(undefined);
    }
  }
}

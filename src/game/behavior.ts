import type { Point, Interaction, Obstacle } from "./movement";
import { Navigation, type RoomBounds } from "./navigation";
export type Facing = "down" | "up" | "left" | "right";
export type BehaviorState =
  | "idle"
  | "wandering"
  | "walking-to-object"
  | "reading"
  | "writing"
  | "sitting"
  | "observing"
  | "celebrating"
  | "player-controlled";
export type Pose =
  | "idle"
  | "browse"
  | "read"
  | "seated-read"
  | "code"
  | "write"
  | "sit"
  | "observe"
  | "globe"
  | "rest"
  | "tea"
  | "sleep"
  | "stretch"
  | "examine";
export interface Activity {
  id: string;
  state: "idle" | "reading" | "writing" | "sitting" | "observing";
  label: string;
  point: Point;
  facing: Facing;
  pose: Pose;
  offsetY?: number;
  furniture?: string;
  seconds: [number, number];
  weight: number;
  object?: Interaction;
  thoughts: string[];
}
export interface RoomConfig {
  afterSessionActivity?: string;
  bounds: RoomBounds;
  obstacles: Obstacle[];
  activities: Activity[];
  wanderPoints: Point[];
}
interface Snapshot {
  departingActivity?: Activity;
  settling: number;
  state: BehaviorState;
  activity?: Activity;
  remaining: number;
  path: Point[];
  arrival?: Interaction;
  manualRemaining: number;
  departure: number;
  engaged: number;
  targetActivity?: Activity;
}
export const MANUAL_SECONDS = 20;
/** Active-time only. Never imports game rendering, persistence, XP, gold or wall-clock timers. */
export class ScholarBehavior {
  readonly nav: Navigation;
  position: Point;
  facing: Facing = "down";
  state: BehaviorState = "idle";
  activity?: Activity;
  remaining = 5;
  manualRemaining = 0;
  autonomous = true;
  thoughtsEnabled = true;
  thought: { text: string; remaining: number } | null = null;
  path: Point[] = [];
  hasBook = false;
  engaged = 0;
  moving = false;
  settling = 0;
  departure = 0;
  departingActivity?: Activity;
  private targetActivity?: Activity;
  private arrival?: Interaction;
  private events: Interaction[] = [];
  private resume?: Snapshot;
  private recent: string[] = [];
  private thoughtIn = 48;
  private lastThought = "";
  private sessionActivity?: string;
  private afterSession?: string;
  private sessionPaused = false;
  private sessionVariations: string[] = [];
  private sessionIntro?: string;
  private sessionRound = 0;
  constructor(
    readonly room: RoomConfig,
    private random: () => number = Math.random,
    start: Point = { x: 642, y: 564 },
  ) {
    this.nav = new Navigation(room.bounds, room.obstacles);
    if (!this.nav.valid(start))
      throw Error("Scholar must start on accessible floor.");
    this.position = { ...start };
    this.remaining = this.range(4, 7);
  }
  private range(a: number, b: number) {
    return a + this.random() * (b - a);
  }
  get pose(): Pose {
    return this.activity?.pose ?? "idle";
  }
  get offsetY() {
    return this.activity?.offsetY ?? 0;
  }
  get label() {
    if (this.state === "celebrating") return "Celebrating your accomplishment";
    if (this.sessionPaused && this.manualRemaining <= 0)
      return "Taking a quiet session break";
    if (this.state === "player-controlled")
      return this.autonomous
        ? "Following your lead"
        : "Taking her time · manual mode";
    if (this.state === "wandering") return "Wandering through the room";
    if (this.state === "walking-to-object")
      return `On her way · ${this.targetActivity?.label.toLowerCase() ?? "a quiet spot"}`;
    return this.activity?.label ?? "Settling into a quiet corner";
  }
  setSession(
    id?: string,
    paused = false,
    variations: string[] = [],
    intro?: string,
  ) {
    const finished = !!this.sessionActivity && !id;
    paused = !!id && paused;
    if (this.sessionActivity === id && this.sessionPaused === paused) return;
    if (this.sessionActivity !== id) {
      this.sessionRound = 0;
      this.sessionIntro = intro;
    }
    this.sessionVariations = variations;
    this.sessionActivity = id;
    this.sessionPaused = paused;
    if (id && !paused) {
      this.afterSession = undefined;
      this.manualRemaining = 0;
      this.choose();
    } else if (id && paused) {
      this.leaveFurniture();
      this.activity = undefined;
      this.path = [];
      this.state = "idle";
      this.remaining = 5;
    } else if (!id) {
      this.leaveFurniture();
      this.activity = undefined;
      this.path = [];
      this.state = "idle";
      this.remaining = 3;
      if (finished && this.autonomous && this.manualRemaining <= 0)
        this.afterSession = this.room.afterSessionActivity;
    }
  }
  takeEvents() {
    const result = this.events;
    this.events = [];
    return result;
  }
  setAutonomous(enabled: boolean) {
    this.autonomous = enabled;
    if (!enabled && this.manualRemaining === 0) {
      this.leaveFurniture();
      this.path = [];
      this.activity = undefined;
      this.targetActivity = undefined;
      this.state = "player-controlled";
      this.resume = undefined;
      this.thought = null;
    }
    if (
      enabled &&
      this.state === "player-controlled" &&
      this.manualRemaining === 0
    )
      this.remaining = 1;
  }
  setThoughts(enabled: boolean) {
    this.thoughtsEnabled = enabled;
    if (!enabled) this.thought = null;
  }
  private leaveFurniture() {
    if (this.activity?.furniture) {
      this.departingActivity = this.activity;
      this.departure = Math.max(0.05, 1.2 - this.settling);
      this.settling = 0;
    } else if (this.activity?.offsetY) this.departure = 0.8;
  }
  private control() {
    this.afterSession = undefined;
    this.manualRemaining = MANUAL_SECONDS;
    this.resume = undefined;
    this.thought = null;
    this.leaveFurniture();
    this.activity = undefined;
    this.targetActivity = undefined;
    this.arrival = undefined;
    this.path = [];
    this.state = "player-controlled";
  }
  manual(direction: Point, dt: number) {
    this.control();
    if (this.departure > 0) {
      this.departure = Math.max(0, this.departure - dt);
      if (!this.departure) this.departingActivity = undefined;
      this.moving = false;
      return;
    }
    const next = this.nav.step(this.position, direction, dt);
    this.face(next);
    this.moving =
      Math.hypot(next.x - this.position.x, next.y - this.position.y) > 0.01;
    this.position = next;
  }
  walkTo(goal: Point, interaction?: Interaction): boolean {
    const activity = interaction
      ? this.room.activities.find((a) => a.object === interaction)
      : undefined;
    const destination = activity?.point ?? goal;
    const route = this.nav.path(this.position, destination);
    if (!route) return false;
    this.control();
    this.path = route;
    this.targetActivity = activity;
    this.arrival = interaction;
    this.state = activity ? "walking-to-object" : "wandering";
    return true;
  }
  useObject(id: Interaction) {
    const activity = this.room.activities.find((a) => a.object === id);
    return activity ? this.walkTo(activity.point, id) : false;
  }
  celebrate(seconds = 2.8) {
    if (this.state !== "celebrating")
      this.resume = {
        state: this.state,
        activity: this.activity,
        remaining: this.remaining,
        path: this.path.map((p) => ({ ...p })),
        arrival: this.arrival,
        manualRemaining: this.manualRemaining,
        departure: this.departure,
        departingActivity: this.departingActivity,
        settling: this.settling,
        engaged: this.engaged,
        targetActivity: this.targetActivity,
      };
    this.state = "celebrating";
    this.remaining = seconds;
    this.moving = false;
    this.thought = null;
  }
  private face(next: Point) {
    const dx = next.x - this.position.x,
      dy = next.y - this.position.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 0.01)
      this.facing = dx < 0 ? "left" : "right";
    else if (Math.abs(dy) > 0.01) this.facing = dy < 0 ? "up" : "down";
  }
  private choose() {
    if (this.sessionActivity && !this.sessionPaused) {
      const selected =
        this.sessionRound === 0 && this.sessionIntro
          ? this.sessionIntro
          : this.sessionRound > 0 &&
              this.sessionVariations.length &&
              this.random() < 0.28
            ? this.sessionVariations[
                Math.floor(this.random() * this.sessionVariations.length)
              ]
            : this.sessionActivity;
      this.sessionRound++;
      const next =
        this.room.activities.find((a) => a.id === selected) ??
        this.room.activities.find((a) => a.id === this.sessionActivity);
      if (next) {
        const route = this.nav.path(this.position, next.point);
        if (route) {
          if (
            (this.activity?.id === next.id ||
              (!!next.furniture &&
                this.activity?.furniture === next.furniture)) &&
            Math.hypot(
              this.position.x - next.point.x,
              this.position.y - next.point.y,
            ) < 0.5
          ) {
            this.activity = next;
            this.state = next.state;
            this.remaining = this.range(...next.seconds) + 0.9;
            this.engaged = 0;
            this.moving = false;
            return;
          }
          this.leaveFurniture();
          this.activity = undefined;
          this.targetActivity = next;
          this.path = route;
          this.state = "walking-to-object";
          return;
        }
      }
    }

    if (!this.autonomous) {
      this.state = "player-controlled";
      this.activity = undefined;
      return;
    }
    if (this.afterSession) {
      const next = this.room.activities.find((a) => a.id === this.afterSession);
      this.afterSession = undefined;
      const path = next && this.nav.path(this.position, next.point);
      if (next && path) {
        this.activity = undefined;
        this.targetActivity = next;
        this.path = path;
        this.state = "walking-to-object";
        return;
      }
    }
    const choices = this.room.activities.map((activity) => ({
      activity,
      weight:
        activity.weight *
        (this.recent.includes(activity.id) ? 0.12 : 1) *
        (this.hasBook && activity.pose.includes("read") ? 1.7 : 1),
    }));
    const total = choices.reduce((n, c) => n + c.weight, 0) + 0.6;
    let pick = this.random() * total;
    if (pick < 0.6) {
      const goal =
        this.room.wanderPoints[
          Math.floor(this.random() * this.room.wanderPoints.length)
        ];
      const path = this.nav.path(this.position, goal);
      if (path) {
        this.leaveFurniture();
        this.activity = undefined;
        this.path = path;
        this.state = "wandering";
        this.targetActivity = undefined;
        return;
      }
    }
    pick -= 0.6;
    let next = choices[choices.length - 1]?.activity;
    for (const choice of choices) {
      pick -= choice.weight;
      if (pick <= 0) {
        next = choice.activity;
        break;
      }
    }
    if (!next) {
      this.remaining = 5;
      return;
    }
    const path = this.nav.path(this.position, next.point);
    if (!path) {
      this.activity = undefined;
      this.state = "idle";
      this.remaining = 4;
      return;
    }
    if (
      (this.activity?.id === next.id ||
        (!!next.furniture && this.activity?.furniture === next.furniture)) &&
      Math.hypot(
        this.position.x - next.point.x,
        this.position.y - next.point.y,
      ) < 0.5
    ) {
      this.activity = next;
      this.state = next.state;
      this.remaining = this.range(...next.seconds) + 0.9;
      this.engaged = 0;
      this.moving = false;
      return;
    }
    this.leaveFurniture();
    this.activity = undefined;
    this.targetActivity = next;
    this.path = path;
    this.state = "walking-to-object";
  }
  step(dt: number) {
    dt = Math.min(Math.max(dt, 0), 0.05);
    this.moving = false;
    if (!dt) return;
    if (this.state === "celebrating") {
      this.remaining -= dt;
      if (this.remaining <= 0) {
        if (this.resume) {
          Object.assign(this, this.resume);
          this.resume = undefined;
        } else {
          this.state = "idle";
          this.remaining = 2;
        }
      }
      return;
    }
    this.manualRemaining = Math.max(0, this.manualRemaining - dt);
    if (this.departure > 0) {
      this.departure = Math.max(0, this.departure - dt);
      if (!this.departure) this.departingActivity = undefined;
      return;
    }
    if (this.sessionPaused && this.manualRemaining <= 0) {
      this.moving = false;
      return;
    }
    if (this.thought) {
      this.thought.remaining -= dt;
      if (this.thought.remaining <= 0) this.thought = null;
    }
    this.thoughtIn -= dt;
    if (this.path.length) {
      const target = this.path[0];
      const distance = Math.hypot(
        target.x - this.position.x,
        target.y - this.position.y,
      );
      const travel = (this.manualRemaining > 0 ? 135 : 88) * dt;
      const t = distance ? Math.min(1, travel / distance) : 1;
      const next = {
        x: this.position.x + (target.x - this.position.x) * t,
        y: this.position.y + (target.y - this.position.y) * t,
      };
      if (!this.nav.clear(this.position, next)) {
        this.path = [];
        this.state = "idle";
        this.activity = undefined;
        this.remaining = 3;
        return;
      }
      this.face(next);
      this.moving = distance > 0.01;
      this.position = next;
      if (t === 1) this.path.shift();
      if (this.path.length) return;
      if (this.targetActivity) {
        this.activity = this.targetActivity;
        this.targetActivity = undefined;
        this.state = this.activity.state;
        this.moving = false;
        this.facing = this.activity.facing;
        this.remaining = this.range(...this.activity.seconds) + 0.9;
        this.engaged = 0;
        this.settling = this.activity.furniture ? 1.2 : 0;
        this.recent = [this.activity.id, ...this.recent].slice(0, 3);
        if (this.activity.pose === "browse") this.hasBook = true;
        if (this.arrival) {
          this.events.push(this.arrival);
          this.arrival = undefined;
        }
      } else {
        this.state = this.manualRemaining > 0 ? "player-controlled" : "idle";
        this.remaining = this.range(6, 12);
        this.activity = undefined;
      }
      return;
    }
    if (this.state === "player-controlled") {
      if (this.autonomous && this.manualRemaining <= 0) this.choose();
      return;
    }
    this.settling = Math.max(0, this.settling - dt);
    this.engaged += dt;
    this.remaining -= dt;
    if (
      this.activity &&
      this.thoughtsEnabled &&
      this.thoughtIn <= 0 &&
      this.engaged > 5
    ) {
      const candidates = this.activity.thoughts.filter(
        (t) => t !== this.lastThought,
      );
      if (candidates.length) {
        const text = candidates[Math.floor(this.random() * candidates.length)];
        this.thought = { text, remaining: 5 };
        this.lastThought = text;
      }
      this.thoughtIn = this.range(55, 95);
    }
    if (this.remaining <= 0 && this.manualRemaining <= 0) this.choose();
  }
}

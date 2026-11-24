import type { ActivitySession } from "./sessions";
/** A monotonic UI clock. It never infers elapsed time from a persisted wall-clock date. */
export class SessionClock {
  private anchor = { id: "", runId: "", phase: "paused", elapsed: 0, start: 0 };
  private epoch = 0;
  constructor(private now: () => number = () => performance.now()) {}
  read() {
    const a = this.anchor;
    return Math.round(
      a.elapsed + (a.phase === "running" ? this.now() - a.start : 0),
    );
  }
  sync(session: ActivitySession | undefined, epoch = 0) {
    const reset = this.epoch !== epoch;
    this.epoch = epoch;
    const now = this.now();
    if (!session) {
      this.anchor = {
        id: "",
        runId: "",
        phase: "paused",
        elapsed: 0,
        start: now,
      };
      return;
    }
    const a = this.anchor;
    if (
      reset ||
      a.id !== session.id ||
      a.runId !== session.runId ||
      a.phase !== session.phase
    ) {
      this.anchor = {
        id: session.id,
        runId: session.runId,
        phase: session.phase,
        elapsed: session.elapsedMs,
        start: now,
      };
    } else if (session.elapsedMs > this.read()) {
      a.elapsed = session.elapsedMs;
      a.start = now;
    }
  }
}

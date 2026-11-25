import { useEffect, useState } from "react";
import {
  defaultFocus,
  remaining,
  type FocusActivity,
  type FocusPhase,
} from "../domain/focus";
import type { Action, State } from "../domain/model";
export const focusActivities: { id: FocusActivity; label: string }[] = [
  { id: "system-design", label: "System Design" },
  { id: "ai-engineering", label: "AI / coding / interview preparation" },
  { id: "outreach", label: "Recruiter outreach" },
  { id: "reading", label: "Reading" },
  { id: "writing", label: "Journaling / notes" },
];
export function countdown(ms: number) {
  const seconds = Math.ceil(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function useFocusNow() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => setNow(Date.now());
    const visibility = () => {
      clearInterval(timer);
      update();
      if (!document.hidden) timer = setInterval(update, 1000);
    };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return Math.max(now, Date.now());
}
type Props = {
  state: State;
  act: (a: Action, m: string) => Promise<unknown>;
  busy: boolean;
  now: number;
};
export function FocusControls({
  state,
  act,
  busy,
  now,
}: {
  state: State;
  act: Props["act"];
  busy: boolean;
  now: number;
}) {
  const c = state.focus?.current;
  if (!c) return <span>No timer running</span>;
  return (
    <div className="focus-controls">
      <strong className="focus-countdown" aria-label="Time remaining">
        {countdown(remaining(c, now))}
      </strong>
      <span>
        {c.phase.replace("-", " ")} · {c.status}
      </span>
      <button
        disabled={busy}
        onClick={() =>
          void act(
            {
              type: c.status === "running" ? "focusPause" : "focusResume",
              id: c.id,
              now: Date.now(),
            },
            c.status === "running" ? "Focus paused." : "Timer running.",
          )
        }
      >
        {c.status === "running"
          ? "Pause"
          : c.status === "ready"
            ? "Start"
            : "Resume"}
      </button>
      <button
        disabled={busy}
        onClick={() =>
          void act(
            { type: "focusReset", id: c.id, now: Date.now() },
            "Timer reset. No rewards changed.",
          )
        }
      >
        Reset
      </button>
    </div>
  );
}
export function FocusPage({
  state,
  act,
  busy,
  now,
  selected,
  enter,
}: { selected?: string; enter: () => void } & Props) {
  const f = state.focus ?? defaultFocus();
  const c = f.current;
  const [questId, setQuestId] = useState(selected ?? c?.questId ?? "");
  const [activity, setActivity] = useState<FocusActivity>(
    state.quests.find((q) => q.id === selected)?.activity ??
      c?.activity ??
      "ai-engineering",
  );
  const [objective, setObjective] = useState("");
  useEffect(() => {
    if (selected) {
      setQuestId(selected);
      setActivity(
        state.quests.find((q) => q.id === selected)?.activity ??
          "ai-engineering",
      );
    }
  }, [selected]);
  async function start(phase: FocusPhase) {
    const q = state.quests.find((q) => q.id === questId);
    await act(
      {
        type: "focusStart",
        id: crypto.randomUUID(),
        now: Date.now(),
        phase,
        questId: q?.id,
        objective: q?.objective ?? q?.title ?? objective,
        activity,
      },
      phase === "focus"
        ? "A little space to concentrate."
        : "Rest is freely yours.",
    );
  }
  return (
    <div className="study-focus-page">
      <p className="care-note">
        One quiet interval at a time. Completing a timer records the interval;
        complete your real-world quest separately.
      </p>
      <FocusControls {...{ state, act, busy, now }} />
      <button onClick={enter}>Enter Focus Mode</button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void start("focus");
        }}
      >
        <label>
          Associated quest
          <select
            value={questId}
            onChange={(e) => {
              setQuestId(e.target.value);
              setActivity(
                state.quests.find((q) => q.id === e.target.value)?.activity ??
                  "ai-engineering",
              );
            }}
          >
            <option value="">Unlinked focus session</option>
            {state.quests
              .filter((q) => !q.completed)
              .map((q) => (
                <option value={q.id} key={q.id}>
                  {q.title}
                </option>
              ))}
          </select>
        </label>
        {!questId && (
          <label>
            Current objective
            <input
              maxLength={120}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
            />
          </label>
        )}
        <label>
          Work activity
          <select
            value={activity}
            onChange={(e) => setActivity(e.target.value as FocusActivity)}
          >
            {focusActivities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </label>
        <div className="entry-actions">
          <button
            className="primary"
            disabled={busy || (!!c && c.status !== "ready")}
          >
            Start focus
          </button>
          <button
            type="button"
            disabled={busy || (!!c && c.status !== "ready")}
            onClick={() => void start("short-break")}
          >
            Short break
          </button>
          <button
            type="button"
            disabled={busy || (!!c && c.status !== "ready")}
            onClick={() => void start("long-break")}
          >
            Long break
          </button>
        </div>
        {c && c.status !== "ready" && (
          <p>
            Pause or reset the current timer before selecting another interval.
          </p>
        )}
      </form>
      <details>
        <summary>Timer settings</summary>
        <form
          key={JSON.stringify(f.settings)}
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void act(
              {
                type: "focusSettings",
                settings: {
                  focus: Number(d.get("focus")),
                  "short-break": Number(d.get("short-break")),
                  "long-break": Number(d.get("long-break")),
                  autoAdvance: d.has("autoAdvance"),
                  chime: d.has("chime"),
                },
              },
              "Timer settings saved. Current interval is unchanged.",
            );
          }}
        >
          {(["focus", "short-break", "long-break"] as const).map((p) => (
            <label key={p}>
              {p.replace("-", " ")} minutes
              <input
                name={p}
                type="number"
                min={1}
                max={240}
                step={1}
                defaultValue={f.settings[p]}
                required
              />
            </label>
          ))}
          <label className="check-label">
            <input
              type="checkbox"
              name="autoAdvance"
              defaultChecked={f.settings.autoAdvance}
            />
            Automatically start the next interval
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              name="chime"
              defaultChecked={f.settings.chime}
            />
            Gentle interval chime (also respects master mute)
          </label>
          <button disabled={busy}>Save timer settings</button>
        </form>
      </details>
      <h3>Completed intervals</h3>
      {f.history.length === 0 ? (
        <p>No completed intervals yet.</p>
      ) : (
        f.history.slice(0, 30).map((h) => (
          <article key={h.id} className="entry">
            <strong>
              {h.phase.replace("-", " ")} · {Math.round(h.durationMs / 60000)}{" "}
              min
            </strong>
            <p>{h.objective || "A quiet interval"}</p>
            <small>{new Date(h.endedAt).toLocaleString()}</small>
          </article>
        ))
      )}
    </div>
  );
}
export function StudyClock({
  state,
  now,
  open,
}: {
  state: State;
  now: number;
  open: () => void;
}) {
  const c = state.focus?.current;
  return (
    <svg
      className="study-clock-layer"
      viewBox="0 0 1280 720"
      preserveAspectRatio="xMidYMid slice"
      aria-label="Study focus clock"
    >
      <foreignObject x="777" y="276" width="86" height="82">
        <button
          className="study-clock-face"
          aria-label="Open focus timer controls"
          onClick={open}
        >
          <small>{c?.phase === "focus" ? "FOCUS" : c ? "REST" : "FOCUS"}</small>
          <strong>
            {countdown(
              c
                ? remaining(c, now)
                : (state.focus?.settings.focus ?? 25) * 60000,
            )}
          </strong>
          <span>{c?.status === "running" ? "Ⅱ" : "▶"}</span>
        </button>
      </foreignObject>
    </svg>
  );
}

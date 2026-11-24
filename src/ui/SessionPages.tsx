import { SessionClock } from "../domain/sessionClock";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  categories,
  activeSession,
  roomNames,
  type Interior,
  type ActivitySession,
  type Course,
} from "../domain/sessions";
import type { State, Action } from "../domain/model";
export function timeLabel(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
/** Local active-time anchor. Reload uses only committed elapsed time, never closed/offline time. */
export function useSessionClock(
  session: ActivitySession | undefined,
  resetToken = 0,
) {
  const ref = useRef<SessionClock | undefined>(undefined);
  ref.current ??= new SessionClock();
  const [, render] = useState(0);
  useEffect(() => {
    ref.current!.sync(session, resetToken);
    render((x) => x + 1);
  }, [
    session?.id,
    session?.runId,
    session?.phase,
    session?.elapsedMs,
    resetToken,
  ]);
  useEffect(() => {
    if (session?.phase !== "running") return;
    const id = setInterval(() => {
      if (!document.hidden) render((x) => x + 1);
    }, 500);
    return () => clearInterval(id);
  }, [session?.id, session?.phase]);
  return {
    elapsedMs: session ? ref.current.read() : 0,
    read: () => ref.current!.read(),
  };
}

type Props = {
  state: State;
  busy: boolean;
  act: (a: Action, m: string) => Promise<unknown>;
  go: (room: Interior) => void;
  elapsed: number;
  finish: () => void;
};
export function SessionPage({ state, busy, act, go, elapsed, finish }: Props) {
  const [timer, setTimer] = useState(false);
  const catalog = categories(state),
    current = activeSession(state);
  async function start(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget),
      categoryId = String(data.get("category")),
      category = catalog.find((c) => c.id === categoryId);
    if (!category) return;
    const success = await act(
      {
        type: "startSession",
        id: crypto.randomUUID(),
        categoryId,
        runId: crypto.randomUUID(),
        questId: String(data.get("quest")) || undefined,
        courseId: String(data.get("course")) || undefined,
        targetMinutes: timer ? Number(data.get("minutes")) : undefined,
      },
      `A little time for ${category.title.toLowerCase()}.`,
    );
    if (success) go(category.room);
  }
  return (
    <div className="session-page">
      <p className="folio-intro">
        Choose what you’re doing in the real world. Your scholar will keep you
        company.
      </p>
      {current ? (
        <section className="current-session-page">
          <span className="eyebrow">
            {current.phase === "paused" ? "PAUSED" : "IN PROGRESS"}
          </span>
          <h3>{current.title}</h3>
          <p>
            {timeLabel(elapsed)} · {roomNames[current.room]}
          </p>
          <button className="primary" onClick={() => go(current.room)}>
            Return to her room
          </button>
          <div className="entry-actions">
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                void act(
                  current.phase === "running"
                    ? {
                        type: "pauseSession",
                        id: current.id,
                        runId: current.runId,
                        elapsedMs: elapsed,
                      }
                    : {
                        type: "resumeSession",
                        id: current.id,
                        runId: crypto.randomUUID(),
                      },
                  current.phase === "running"
                    ? "Session paused. Take your time."
                    : "Your session has resumed.",
                )
              }
            >
              {current.phase === "running" ? "Pause" : "Resume"}
            </button>
            <button className="complete" onClick={finish}>
              Finish session
            </button>
          </div>
        </section>
      ) : (
        <form onSubmit={start}>
          <label>
            Real-world activity
            <select name="category" required>
              {catalog.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} · {roomNames[c.room]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Associated quest (optional)
            <select name="quest">
              <option value="">No quest — just the pleasure of doing it</option>
              {state.quests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                  {q.completed ? " (already completed)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label>
            Course (optional)
            <select name="course">
              <option value="">No course</option>
              {state.courses
                ?.filter((c) => c.active)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
          </label>
          <label className="check-label">
            <input
              type="checkbox"
              checked={timer}
              onChange={(e) => setTimer(e.target.checked)}
            />
            Use an optional focus timer
          </label>
          {timer && (
            <label>
              Focus minutes
              <input
                name="minutes"
                type="number"
                min="1"
                max="1440"
                step="1"
                required
                defaultValue={25}
              />
            </label>
          )}
          <p className="care-note">
            Untimed is welcome. A timer is an invitation, never a deadline. Only
            real-world quest completion earns rewards.
          </p>
          <button className="primary" disabled={busy || !catalog.length}>
            Begin activity
          </button>
        </form>
      )}
      <details className="mapping-settings">
        <summary>Activity categories & room mappings</summary>
        <p className="small-note">
          Choose where your scholar accompanies each activity. Existing sessions
          keep their original room.
        </p>
        {catalog.map((c) => (
          <form
            className="category-row"
            key={c.id}
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void act(
                {
                  type: "saveCategory",
                  category: {
                    id: c.id,
                    title: String(f.get("title")),
                    room: String(f.get("room")) as Interior,
                  },
                },
                "Activity mapping saved.",
              );
            }}
          >
            <label className="sr-only" htmlFor={`category-${c.id}`}>
              Name for {c.title}
            </label>
            <input
              id={`category-${c.id}`}
              name="title"
              maxLength={120}
              required
              defaultValue={c.title}
            />
            <RoomSelect
              name="room"
              value={c.room}
              label={`Room for ${c.title}`}
            />
            <div className="entry-actions">
              <button className="complete" disabled={busy}>
                Save mapping
              </button>
              <button
                type="button"
                className="text-button"
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "Remove this activity category? Session history is kept.",
                    )
                  )
                    void act(
                      { type: "deleteCategory", id: c.id },
                      "Activity category removed.",
                    );
                }}
              >
                Remove
              </button>
            </div>
          </form>
        ))}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget,
              f = new FormData(form);
            if (
              await act(
                {
                  type: "saveCategory",
                  category: {
                    id: crypto.randomUUID(),
                    title: String(f.get("title")),
                    room: String(f.get("room")) as Interior,
                  },
                },
                "Your activity has a home.",
              )
            )
              form.reset();
          }}
        >
          <h3>A category of your own</h3>
          <label>
            Activity name
            <input name="title" maxLength={120} required />
          </label>
          <RoomSelect name="room" value="grand-library" />
          <button className="secondary" disabled={busy}>
            Add activity category
          </button>
        </form>
      </details>
      <h3 className="section-title">Your past sessions</h3>
      {!state.sessions?.some((s) => s.phase === "finished") ? (
        <p className="empty">
          Your finished sessions will be recorded here, with no judgement about
          their length.
        </p>
      ) : (
        state.sessions
          .filter((s) => s.phase === "finished")
          .map((s) => (
            <article className="entry" key={s.id}>
              <span className="subject">
                {new Date(s.finishedAt!).toLocaleString()}
              </span>
              <h3>{s.title}</h3>
              <p>
                {timeLabel(s.elapsedMs)} · {roomNames[s.room]}
              </p>
              {s.notes && <p className="discovery-body">{s.notes}</p>}
            </article>
          ))
      )}
    </div>
  );
}
export function RoomSelect({
  name,
  value,
  label = "University room",
}: {
  name: string;
  value: Interior;
  label?: string;
}) {
  return (
    <label>
      {label}
      <select name={name} defaultValue={value}>
        {(["grand-library", "personal-study", "observatory"] as Interior[]).map(
          (id) => (
            <option key={id} value={id}>
              {roomNames[id]}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
export function CurriculumPage({
  state,
  busy,
  act,
  go,
}: {
  state: State;
  busy: boolean;
  act: Props["act"];
  go: Props["go"];
}) {
  const [editing, setEditing] = useState<Course | null | undefined>(undefined);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (
      await act(
        {
          type: "saveCourse",
          course: {
            id: editing?.id ?? crypto.randomUUID(),
            title: String(f.get("title")),
            subject: String(f.get("subject")),
            room: String(f.get("room")) as Interior,
            description: String(f.get("description")),
            active: f.get("active") === "on",
          },
        },
        "Your personal curriculum has been saved.",
      )
    )
      setEditing(undefined);
  }
  return (
    <div className="curriculum-page">
      <p className="folio-intro">
        An education shaped by your own curiosity. Keep a few courses, questions
        and intentions close.
      </p>
      {editing !== undefined ? (
        <form onSubmit={save} key={editing?.id ?? "new"}>
          <label>
            Course title
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={editing?.title}
            />
          </label>
          <label>
            Subject
            <input
              name="subject"
              required
              maxLength={120}
              defaultValue={editing?.subject}
            />
          </label>
          <RoomSelect name="room" value={editing?.room ?? "grand-library"} />
          <label>
            What would you like to explore?
            <textarea
              name="description"
              rows={5}
              maxLength={10000}
              defaultValue={editing?.description}
            />
          </label>
          <label className="check-label">
            <input
              name="active"
              type="checkbox"
              defaultChecked={editing?.active ?? true}
            />
            Keep in current courses
          </label>
          <div className="entry-actions">
            <button className="primary" disabled={busy}>
              Save course
            </button>
            <button
              type="button"
              className="text-button"
              onClick={() => setEditing(undefined)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button className="primary" onClick={() => setEditing(null)}>
          + Add a course
        </button>
      )}
      {!state.courses?.length && editing === undefined && (
        <p className="empty">A blank page for the things you want to learn.</p>
      )}
      {state.courses?.map((c) => (
        <article className="entry" key={c.id}>
          <span className="subject">
            {c.subject} · {c.active ? "Current" : "Resting"}
          </span>
          <h3>{c.title}</h3>
          <p className="discovery-body">{c.description}</p>
          <button className="secondary" onClick={() => go(c.room)}>
            Visit {roomNames[c.room]}
          </button>
          <div className="entry-actions">
            <button className="text-button" onClick={() => setEditing(c)}>
              Edit
            </button>
            <button
              className="text-button"
              disabled={busy}
              onClick={() => {
                if (confirm("Remove this course? Past sessions will be kept."))
                  void act(
                    { type: "deleteCourse", id: c.id },
                    "Course removed.",
                  );
              }}
            >
              Remove
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
export function FinishSessionDialog({
  session,
  elapsed,
  busy,
  close,
  act,
  questCompleted,
}: {
  session: ActivitySession | undefined;
  elapsed: number;
  busy: boolean;
  close: () => void;
  act: Props["act"];
  questCompleted: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (session) ref.current?.showModal();
    else ref.current?.close();
  }, [session?.id]);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClose={close}
      aria-labelledby="finish-title"
    >
      {session && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            if (
              await act(
                {
                  type: "finishSession",
                  id: session.id,
                  runId: session.runId,
                  elapsedMs: elapsed,
                  notes: String(f.get("notes")),
                  completeQuest: f.get("complete") === "on",
                },
                "A little time, well spent. Your session has been recorded.",
              )
            )
              close();
          }}
        >
          <div className="dialog-heading">
            <div>
              <span className="eyebrow">A MOMENT TO REFLECT</span>
              <h2 id="finish-title">Finish {session.title.toLowerCase()}</h2>
            </div>
            <button
              className="close-button"
              type="button"
              aria-label="Close session reflection"
              onClick={close}
            >
              ×
            </button>
          </div>
          <p>
            {timeLabel(elapsed)} · {roomNames[session.room]}
          </p>
          <label>
            A few completion notes (optional)
            <textarea name="notes" rows={4} maxLength={10000} />
          </label>
          {session.questId && !questCompleted ? (
            <label className="check-label">
              <input type="checkbox" name="complete" defaultChecked />
              Complete the associated real-world quest
            </label>
          ) : (
            <p className="care-note">
              {questCompleted
                ? "The associated quest is already complete. No duplicate rewards will be awarded."
                : "The session itself awards no XP or gold. Your time is still worth keeping."}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="text-button" onClick={close}>
              Keep going
            </button>
            <button className="primary" disabled={busy}>
              Finish & record
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

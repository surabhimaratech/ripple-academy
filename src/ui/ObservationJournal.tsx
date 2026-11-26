import { useState, type FormEvent } from "react";
import type { State, Action, Discovery } from "../domain/model";
import {
  scienceKinds,
  scienceLabels,
  type ScienceKind,
} from "../domain/science";
const localDate = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
};
export function ObservationJournal({
  state,
  busy,
  act,
  projects,
}: {
  state: State;
  busy: boolean;
  act: (a: Action, m: string) => Promise<unknown>;
  projects: () => void;
}) {
  const [editing, setEditing] = useState<Discovery | null | undefined>();
  const [deleting, setDeleting] = useState<string>();
  const [problem, setProblem] = useState("");
  const entries = (state.discoveries ?? []).filter((d) => d.observation);
  const o = editing?.observation;
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const get = (key: string) => String(f.get(key) ?? "").trim();
    const date = new Date(get("observedAt"));
    if (!Number.isFinite(date.getTime())) {
      setProblem("Choose a valid observation date.");
      return;
    }
    const optional = (key: string) => get(key) || undefined;
    if (
      await act(
        {
          type: "saveDiscovery",
          discovery: {
            id: editing?.id ?? crypto.randomUUID(),
            title: get("title"),
            body: get("body"),
            at: editing?.at ?? new Date().toISOString(),
            observation: {
              observedAt: date.toISOString(),
              category: get("category") as ScienceKind,
              objective: optional("objective"),
              experiment: optional("experiment"),
              results: optional("results"),
              sourceUrl: optional("sourceUrl"),
              localReference: optional("localReference"),
              nextSteps: optional("nextSteps"),
              questId: optional("questId"),
              sessionId: optional("sessionId"),
              courseId: optional("courseId"),
            },
          },
        },
        "Observation saved. No rewards were awarded.",
      )
    ) {
      setEditing(undefined);
      setProblem("");
    }
  }
  return (
    <section className="observation-journal">
      <p>
        Keep a brief record of your own observations and experiments. No
        findings are generated or verified by Ripple.
      </p>
      <div className="entry-actions">
        <button
          disabled={busy}
          onClick={() => {
            setEditing(null);
            setProblem("");
          }}
        >
          + New observation
        </button>
        <button onClick={projects}>Scientific projects</button>
      </div>
      {editing !== undefined && (
        <form
          onSubmit={save}
          key={editing?.id ?? "new"}
          className="observation-form"
        >
          <label>
            Observation title
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={editing?.title}
            />
          </label>
          <label>
            Date and time
            <input
              name="observedAt"
              type="datetime-local"
              required
              defaultValue={localDate(
                o?.observedAt ?? new Date().toISOString(),
              )}
            />
          </label>
          <label>
            Activity category
            <select name="category" defaultValue={o?.category ?? "observation"}>
              {scienceKinds.map((k) => (
                <option key={k} value={k}>
                  {scienceLabels[k]}
                </option>
              ))}
            </select>
          </label>
          <label>
            Project / experiment name
            <input
              name="experiment"
              maxLength={240}
              defaultValue={o?.experiment}
            />
          </label>
          <label>
            Objective
            <input
              name="objective"
              maxLength={240}
              defaultValue={o?.objective}
            />
          </label>
          <label>
            Brief observations
            <textarea
              name="body"
              rows={4}
              maxLength={10000}
              defaultValue={editing?.body}
            />
          </label>
          <label>
            Numerical results (optional, include units)
            <textarea
              name="results"
              rows={2}
              maxLength={4000}
              defaultValue={o?.results}
            />
          </label>
          <label>
            Questions / next steps
            <textarea
              name="nextSteps"
              rows={2}
              maxLength={4000}
              defaultValue={o?.nextSteps}
            />
          </label>
          <label>
            Source URL (optional)
            <input
              name="sourceUrl"
              type="url"
              maxLength={2048}
              defaultValue={o?.sourceUrl}
            />
          </label>
          <label>
            Local file reference (text only)
            <input
              name="localReference"
              maxLength={2048}
              defaultValue={o?.localReference}
            />
          </label>
          <p className="small-note">
            Local paths are stored as text. Ripple does not read or upload the
            file.
          </p>
          <label>
            Associated quest
            <select name="questId" defaultValue={o?.questId ?? ""}>
              {o?.questId && !state.quests?.some((q) => q.id === o.questId) && (
                <option value={o.questId}>Previously linked quest</option>
              )}
              <option value="">No quest</option>
              {state.quests.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Associated activity session
            <select name="sessionId" defaultValue={o?.sessionId ?? ""}>
              {o?.sessionId &&
                !state.sessions?.some((q) => q.id === o.sessionId) && (
                  <option value={o.sessionId}>Previously linked session</option>
                )}
              <option value="">No session</option>
              {state.sessions
                ?.filter((s) => s.room === "observatory")
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {new Date(s.startedAt).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </label>
          <label>
            Scientific project
            <select name="courseId" defaultValue={o?.courseId ?? ""}>
              {o?.courseId &&
                !state.courses?.some((q) => q.id === o.courseId) && (
                  <option value={o.courseId}>Previously linked project</option>
                )}
              <option value="">Ungrouped</option>
              {state.courses
                ?.filter((c) => c.room === "observatory")
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
            </select>
          </label>
          {problem && <p role="alert">{problem}</p>}
          <div className="entry-actions">
            <button className="primary" disabled={busy}>
              Save observation
            </button>
            <button type="button" onClick={() => setEditing(undefined)}>
              Cancel editing
            </button>
          </div>
        </form>
      )}
      {!entries.length && editing === undefined && (
        <p className="empty">
          A fresh page for a question, an experiment or a night beneath the
          stars.
        </p>
      )}
      {entries.map((d) => {
        const meta = d.observation!;
        return (
          <article className="entry" key={d.id}>
            <span className="subject">
              {new Date(meta.observedAt).toLocaleString()} ·{" "}
              {scienceLabels[meta.category]}
            </span>
            <h3>{d.title}</h3>
            {meta.experiment && <p>{meta.experiment}</p>}
            {meta.objective && <p>Objective: {meta.objective}</p>}
            <p className="discovery-body">{d.body}</p>
            {meta.results && (
              <p className="discovery-body">
                Results (user recorded): {meta.results}
              </p>
            )}
            {meta.nextSteps && (
              <p className="discovery-body">Next: {meta.nextSteps}</p>
            )}
            {meta.sourceUrl && (
              <p>
                <a href={meta.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>
              </p>
            )}
            {meta.localReference && (
              <p>Local reference: {meta.localReference}</p>
            )}
            {meta.courseId && (
              <p>
                Project:{" "}
                {state.courses?.find((c) => c.id === meta.courseId)?.title ??
                  "Previously linked project"}
              </p>
            )}
            {meta.questId && (
              <p>
                Quest:{" "}
                {state.quests.find((q) => q.id === meta.questId)?.title ??
                  "Previously linked quest"}
              </p>
            )}
            {meta.sessionId && (
              <p>
                Session:{" "}
                {state.sessions?.find((s) => s.id === meta.sessionId)?.title ??
                  "Previously linked session"}
              </p>
            )}
            <div className="entry-actions">
              <button disabled={busy} onClick={() => setEditing(d)}>
                Edit observation
              </button>
              <button disabled={busy} onClick={() => setDeleting(d.id)}>
                Delete observation
              </button>
            </div>
            {deleting === d.id && (
              <section aria-label="Confirm observation deletion">
                <p>
                  Delete this observation? Quest rewards and activity history
                  stay unchanged.
                </p>
                <button
                  disabled={busy}
                  onClick={async () => {
                    if (
                      await act(
                        { type: "deleteDiscovery", id: d.id },
                        "Observation removed.",
                      )
                    )
                      setDeleting(undefined);
                  }}
                >
                  Confirm delete observation
                </button>
                <button onClick={() => setDeleting(undefined)}>
                  Keep observation
                </button>
              </section>
            )}
          </article>
        );
      })}
    </section>
  );
}

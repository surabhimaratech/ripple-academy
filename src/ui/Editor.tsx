import type { Course } from "../domain/sessions";
import { scienceKinds, scienceLabels } from "../domain/science";
import { useEffect, useRef, type FormEvent } from "react";
import type { Editor as EditorValue } from "./Folio";
import type { FocusActivity } from "../domain/focus";
import type { Interior } from "../domain/sessions";
import type { RewardKind } from "../domain/rewards";
import type { Action } from "../domain/model";
export function EditorDialog({
  editor,
  courses,
  defaultRoom = "personal-study",
  busy,
  error,
  close,
  act,
}: {
  editor: EditorValue | null;
  courses?: Course[];
  defaultRoom?: Interior;
  busy: boolean;
  error: string;
  close: () => void;
  act: (a: Action, m: string) => Promise<unknown>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (editor) {
      opener.current = document.activeElement as HTMLElement;
      ref.current?.showModal();
      ref.current?.querySelector("input")?.focus();
    } else {
      ref.current?.close();
      opener.current?.focus();
    }
  }, [editor]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editor) return;
    const f = new FormData(e.currentTarget);
    const id = editor.value?.id ?? crypto.randomUUID(),
      title = String(f.get("title"));
    const action: Action =
      editor.kind === "quest"
        ? {
            type: "saveQuest",
            quest: {
              ...editor.value,
              id,
              title,
              objective: String(f.get("objective")),
              description: String(f.get("description")),
              priority: String(f.get("priority")) as "low" | "normal" | "high",
              estimatedMinutes: f.get("estimatedMinutes")
                ? Number(f.get("estimatedMinutes"))
                : undefined,
              room: String(f.get("room")) as Interior,
              courseId: String(f.get("courseId") ?? "") || undefined,
              activity: String(f.get("activity")) as FocusActivity,
              subtasks: String(f.get("subtasks"))
                .split("\n")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((title, i) => ({
                  id: editor.value?.subtasks?.[i]?.id ?? crypto.randomUUID(),
                  title,
                  done:
                    editor.value?.subtasks?.[i]?.title === title
                      ? editor.value.subtasks[i].done
                      : false,
                })),
              subject: String(f.get("subject")),
              xp: Number(f.get("xp")),
              gold: Number(f.get("gold")),
            },
          }
        : editor.kind === "reward"
          ? {
              type: "saveReward",
              reward: {
                ...editor.value,
                id,
                title,
                cost: Number(f.get("cost")),
                kind: String(f.get("kind")) as RewardKind,
              },
            }
          : {
              type: "saveDiscovery",
              discovery: {
                id,
                title,
                body: String(f.get("body")),
                at: new Date().toISOString(),
              },
            };
    if (
      await act(
        action,
        editor.kind === "discovery"
          ? "A new thought, safely tucked away."
          : "Your journal has been saved.",
      )
    )
      close();
  }
  return (
    <dialog
      ref={ref}
      className="editor-dialog"
      aria-labelledby="editor-title"
      onCancel={close}
      onClose={() => {
        if (editor) close();
      }}
    >
      {editor && (
        <form onSubmit={save}>
          <div className="dialog-heading">
            <div>
              <span className="eyebrow">A PAGE OF YOUR OWN</span>
              <h2 id="editor-title">
                {editor.value ? "Edit" : "New"} {editor.kind}
              </h2>
            </div>
            <button
              type="button"
              className="close-button"
              aria-label="Close editor"
              onClick={close}
            >
              ×
            </button>
          </div>
          <label>
            Title
            <input
              name="title"
              required
              maxLength={120}
              defaultValue={editor.value?.title}
            />
          </label>
          {editor.kind === "quest" ? (
            <>
              <label>
                Practical objective
                <input
                  name="objective"
                  maxLength={120}
                  defaultValue={
                    editor.value?.objective ?? editor.value?.title ?? ""
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  maxLength={10000}
                  defaultValue={editor.value?.description}
                />
              </label>
              <label>
                Checklist (one item per line)
                <textarea
                  name="subtasks"
                  defaultValue={editor.value?.subtasks
                    ?.map((t) => t.title)
                    .join("\n")}
                />
              </label>
              <div className="form-row">
                <label>
                  Priority
                  <select
                    name="priority"
                    defaultValue={editor.value?.priority ?? "normal"}
                  >
                    <option>low</option>
                    <option>normal</option>
                    <option>high</option>
                  </select>
                </label>
                <label>
                  Estimated minutes
                  <input
                    name="estimatedMinutes"
                    type="number"
                    min={1}
                    max={1440}
                    defaultValue={editor.value?.estimatedMinutes}
                  />
                </label>
              </div>
              <label>
                Associated room
                <select
                  name="room"
                  defaultValue={editor.value?.room ?? defaultRoom}
                >
                  <option value="personal-study">Personal Study</option>
                  <option value="grand-library">Grand Library</option>
                  <option value="observatory">Observatory</option>
                </select>
              </label>
              <label>
                Course / scientific project
                <select
                  name="courseId"
                  defaultValue={editor.value?.courseId ?? ""}
                >
                  <option value="">Ungrouped</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Activity
                <select
                  name="activity"
                  defaultValue={
                    editor.value?.activity ??
                    (defaultRoom === "observatory"
                      ? "astronomy-learning"
                      : "ai-engineering")
                  }
                >
                  {scienceKinds.map((k) => (
                    <option key={k} value={k}>
                      {scienceLabels[k]}
                    </option>
                  ))}
                  <option value="system-design">System Design</option>
                  <option value="ai-engineering">AI / coding</option>
                  <option value="outreach">Recruiter outreach</option>
                  <option value="reading">Reading</option>
                  <option value="writing">Journaling / notes</option>
                </select>
              </label>
              <p className="care-note">
                Suggested XP / gold: small 3–5 / 1; standard 8–10 / 2–3;
                substantial 12–15 / 4–5; major 20–25 / 6–8.
              </p>
              <label>
                Subject
                <input
                  name="subject"
                  required
                  maxLength={120}
                  defaultValue={editor.value?.subject ?? "Personal growth"}
                />
              </label>
              <div className="form-row">
                <label>
                  XP reward
                  <input
                    name="xp"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    required
                    defaultValue={editor.value?.xp ?? 8}
                  />
                </label>
                <label>
                  Gold reward
                  <input
                    name="gold"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    required
                    defaultValue={editor.value?.gold ?? 2}
                  />
                </label>
              </div>
              {editor.value?.completed && (
                <p className="care-note">
                  The original award stays intact for undo. Edited amounts apply
                  to the next completion.
                </p>
              )}
            </>
          ) : editor.kind === "reward" ? (
            <>
              <label>
                Celebration in Happy Café
                <select
                  name="kind"
                  defaultValue={editor.value?.kind ?? "celebrate"}
                >
                  <option value="celebrate">A simple celebration</option>
                  <option value="coffee">Coffee / tea</option>
                  <option value="pastry">Coffee and pastry</option>
                  <option value="book">Book</option>
                </select>
              </label>
              <label>
                Gold cost
                <input
                  name="cost"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  required
                  defaultValue={editor.value?.cost ?? 30}
                />
              </label>
            </>
          ) : (
            <label>
              Your discovery
              <textarea
                name="body"
                rows={6}
                maxLength={10000}
                defaultValue={editor.value?.body ?? ""}
              />
            </label>
          )}
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
          <div className="dialog-actions">
            <button type="button" className="text-button" onClick={close}>
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              Save {editor.kind}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}

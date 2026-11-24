import { useEffect, useRef, type FormEvent } from "react";
import type { Editor as EditorValue } from "./Folio";
import type { Action } from "../domain/model";
export function EditorDialog({
  editor,
  busy,
  error,
  close,
  act,
}: {
  editor: EditorValue | null;
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
              id,
              title,
              subject: String(f.get("subject")),
              xp: Number(f.get("xp")),
              gold: Number(f.get("gold")),
            },
          }
        : editor.kind === "reward"
          ? {
              type: "saveReward",
              reward: { id, title, cost: Number(f.get("cost")) },
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
                    defaultValue={editor.value?.xp ?? 30}
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
                    defaultValue={editor.value?.gold ?? 10}
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

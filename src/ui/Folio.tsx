import { RewardMenu, RewardHistory } from "./RewardMenu";
import { QuestTools } from "./QuestTools";
import { HeroinePortrait } from "./HeroinePortrait";
import { academicRank } from "../domain/sessions";
import { progression } from "../domain/model";
import { useState } from "react";
import type { State, Action, Quest, Reward, Discovery } from "../domain/model";
import { keepsakes, unlockedKeepsakes } from "../domain/keepsakes";
export type Tab =
  | "focus"
  | "sessions"
  | "curriculum"
  | "quests"
  | "shop"
  | "history"
  | "discovery"
  | "keepsakes"
  | "save";
export type Editor =
  | { kind: "quest"; value?: Quest }
  | { kind: "reward"; value?: Reward }
  | { kind: "discovery"; value?: Discovery };
export const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "focus", label: "Focus timer", icon: "◴" },
  { id: "sessions", label: "Activities", icon: "✦" },
  { id: "curriculum", label: "Curriculum", icon: "▥" },
  { id: "quests", label: "Quest journal", icon: "▤" },
  { id: "shop", label: "Reward shop", icon: "◈" },
  { id: "discovery", label: "Discoveries", icon: "✧" },
  { id: "keepsakes", label: "Keepsake chest", icon: "♧" },
  { id: "history", label: "History", icon: "◷" },
  { id: "save", label: "Save & settings", icon: "⚙" },
];
export function FolioContent({
  tab,
  state,
  busy,
  act,
  edit,
  focus,
  onRedeemed,
}: {
  onRedeemed?: () => void;
  focus?: (id: string) => void;
  tab: Tab;
  state: State;
  busy: boolean;
  act: (a: Action, message: string) => Promise<unknown>;
  edit: (e: Editor) => void;
}) {
  const [completed, setCompleted] = useState(false);
  const unlocked = unlockedKeepsakes(state);
  if (tab === "quests")
    return (
      <>
        <div className="folio-intro">
          <p>Small adventures. Real-world magic.</p>
          <button
            className="primary"
            disabled={busy}
            onClick={() => edit({ kind: "quest" })}
          >
            + New quest
          </button>
        </div>
        <QuestTools state={state} busy={busy} act={act} />
        <div className="filters" aria-label="Quest status">
          <button aria-pressed={!completed} onClick={() => setCompleted(false)}>
            In progress ({state.quests.filter((q) => !q.completed).length})
          </button>
          <button aria-pressed={completed} onClick={() => setCompleted(true)}>
            Completed ({state.quests.filter((q) => q.completed).length})
          </button>
        </div>
        <div className="entries">
          {state.quests.filter((q) => !!q.completed === completed).length ===
            0 && (
            <p className="empty">
              {completed
                ? "Your completed adventures will be kept here."
                : "A fresh page. Add a quest whenever you feel ready."}
            </p>
          )}
          {state.quests
            .filter((q) => !!q.completed === completed)
            .map((q) => (
              <article className="entry" key={q.id}>
                <div className="entry-heading">
                  <span className="subject">{q.subject}</span>
                  <span className="reward-values">
                    {q.completed?.xp ?? q.xp} XP · ◈{" "}
                    {q.completed?.gold ?? q.gold}
                  </span>
                </div>
                <h3>{q.title}</h3>
                {q.objective && <p>{q.objective}</p>}
                {q.description && <p>{q.description}</p>}
                <small>
                  {q.priority ?? "normal"} priority
                  {q.estimatedMinutes
                    ? ` · ~${q.estimatedMinutes} minutes`
                    : ""}
                  {q.room ? ` · ${q.room.replaceAll("-", " ")}` : ""} ·{" "}
                  {
                    (state.focus?.history ?? []).filter(
                      (h) => h.phase === "focus" && h.questId === q.id,
                    ).length
                  }{" "}
                  focus intervals
                </small>
                {q.subtasks?.map((item) => (
                  <label className="check-label" key={item.id}>
                    <input
                      type="checkbox"
                      checked={item.done}
                      disabled={busy || !!q.completed}
                      onChange={() =>
                        void act(
                          {
                            type: "saveQuest",
                            quest: {
                              ...q,
                              subtasks: q.subtasks!.map((x) =>
                                x.id === item.id ? { ...x, done: !x.done } : x,
                              ),
                            },
                          },
                          "Checklist updated.",
                        )
                      }
                    />
                    {item.title}
                  </label>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void act(
                      {
                        type: "saveQuest",
                        quest: {
                          ...q,
                          notes: String(
                            new FormData(e.currentTarget).get("notes"),
                          ),
                        },
                      },
                      "Notes saved.",
                    );
                  }}
                >
                  <label>
                    Completion / reflection notes
                    <textarea
                      name="notes"
                      rows={2}
                      maxLength={10000}
                      defaultValue={q.notes ?? ""}
                    />
                  </label>
                  <button disabled={busy}>Save notes</button>
                </form>
                <div className="entry-actions">
                  {!q.completed && (
                    <button disabled={busy} onClick={() => focus?.(q.id)}>
                      Focus on quest
                    </button>
                  )}
                  <button
                    disabled={busy}
                    onClick={() =>
                      void act(
                        {
                          type: "saveQuest",
                          quest: {
                            ...q,
                            id: crypto.randomUUID(),
                            completed: undefined,
                            subtasks: q.subtasks?.map((t) => ({
                              ...t,
                              done: false,
                            })),
                            notes: "",
                          },
                        },
                        "Quest duplicated without rewards.",
                      )
                    }
                  >
                    Duplicate
                  </button>
                </div>
                <div className="entry-actions">
                  <button
                    className="complete"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        { type: q.completed ? "undo" : "complete", id: q.id },
                        q.completed
                          ? "Completion undone. The original rewards have been reversed."
                          : "Quest complete. A small step, beautifully taken.",
                      )
                    }
                  >
                    {q.completed ? "Undo completion" : "Complete quest"}
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => edit({ kind: "quest", value: q })}
                  >
                    Edit
                  </button>
                  <button
                    className="text-button"
                    disabled={busy}
                    onClick={() => {
                      if (
                        confirm(
                          "Delete this quest? Earned rewards will be kept. Undo completion first to reverse them.",
                        )
                      )
                        void act(
                          { type: "deleteQuest", id: q.id },
                          "Quest removed.",
                        );
                    }}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
        </div>
      </>
    );
  if (tab === "shop")
    return (
      <RewardMenu
        state={state}
        busy={busy}
        act={act}
        edit={edit}
        onRedeemed={onRedeemed}
      />
    );
  if (tab === "history")
    return <RewardHistory state={state} busy={busy} act={act} />;
  if (tab === "discovery")
    return (
      <>
        <div className="folio-intro">
          <p>A thought, a question, a new fascination.</p>
          <button
            className="primary"
            disabled={busy}
            onClick={() => edit({ kind: "discovery" })}
          >
            + Add discovery
          </button>
        </div>
        {!state.discoveries?.length && (
          <div className="empty illustration-empty">
            <span>✧</span>
            <p>What caught your curiosity today?</p>
            <p>
              Keep a note about a book, an idea, or something you’d like to
              explore. No points needed.
            </p>
          </div>
        )}
        {state.discoveries?.map((d) => (
          <article className="entry" key={d.id}>
            <span className="subject">
              {new Date(d.at).toLocaleDateString()}
            </span>
            <h3>{d.title}</h3>
            <p className="discovery-body">{d.body}</p>
            <div className="entry-actions">
              <button
                className="text-button"
                disabled={busy}
                onClick={() => edit({ kind: "discovery", value: d })}
              >
                Edit
              </button>
              <button
                className="text-button"
                disabled={busy}
                onClick={() => {
                  if (confirm("Remove this discovery note?"))
                    void act(
                      { type: "deleteDiscovery", id: d.id },
                      "Discovery removed.",
                    );
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
      </>
    );
  if (tab === "keepsakes")
    return (
      <>
        <section className="scholar-profile" aria-label="Your profile">
          <HeroinePortrait />
          <div>
            <span className="eyebrow">YOUR JOURNEY</span>
            <h3>{academicRank(state.xp)}</h3>
            <p>
              Level {progression(state.xp).level} · {state.xp} XP
            </p>
            <p>◈ {state.gold} gold</p>
            <small>Through curiosity, to the stars.</small>
          </div>
        </section>
        <p className="folio-intro">
          Small reminders of the person you’re becoming. Once earned, a keepsake
          is yours to keep.
        </p>
        <div className="collection-count">
          {unlocked.length} / {keepsakes.length} keepsakes found
        </div>
        {keepsakes.map((k) => (
          <article
            className={`keepsake ${unlocked.includes(k.id) ? "unlocked" : "locked"}`}
            key={k.id}
          >
            <div className={`pixel-keepsake ${k.icon}`} aria-hidden="true" />
            <div>
              <span className="subject">
                {unlocked.includes(k.id) ? k.item : "Waiting to be found"}
              </span>
              <h3>{k.name}</h3>
              <p>{k.description}</p>
            </div>
          </article>
        ))}
      </>
    );
  return null;
}

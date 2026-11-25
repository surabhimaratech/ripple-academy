import { useState } from "react";
import type { State, Quest, Action } from "../domain/model";
import { starterQuests, parseQuestCollection } from "../domain/questDetails";
type Props = {
  state: State;
  busy: boolean;
  act: (a: Action, m: string) => Promise<unknown>;
};
export function QuestTools({ state, busy, act }: Props) {
  const [json, setJson] = useState(""),
    [preview, setPreview] = useState<Quest[]>(),
    [error, setError] = useState("");
  return (
    <details className="quest-tools">
      <summary>Quick add, templates & import</summary>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget,
            d = new FormData(form);
          if (
            await act(
              {
                type: "saveQuest",
                quest: {
                  id: crypto.randomUUID(),
                  title: String(d.get("title")),
                  objective: String(d.get("title")),
                  subject: "Personal growth",
                  xp: 8,
                  gold: 2,
                },
              },
              "Quest added.",
            )
          )
            form.reset();
        }}
      >
        <label>
          Quick quest
          <input
            name="title"
            maxLength={120}
            required
            placeholder="One real-world objective"
          />
        </label>
        <button disabled={busy}>Quick add · 8 XP / 2 gold</button>
      </form>
      {!state.starterCollectionAdded && (
        <button
          disabled={busy}
          onClick={() =>
            void act(
              {
                type: "importQuests",
                quests: starterQuests().filter(
                  (q) => !state.quests.some((x) => x.id === q.id),
                ),
                starter: true,
              },
              "Starter collection added. Existing quests kept.",
            )
          }
        >
          Add starter collection · 35 XP / 11 gold total
        </button>
      )}
      <label>
        Quest template
        <select
          defaultValue=""
          onChange={(e) => {
            const q = starterQuests().find((q) => q.id === e.target.value);
            if (q)
              void act(
                { type: "saveQuest", quest: { ...q, id: crypto.randomUUID() } },
                "Template added.",
              );
            e.target.value = "";
          }}
        >
          <option value="">Choose a template…</option>
          {starterQuests().map((q) => (
            <option key={q.id} value={q.id}>
              {q.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Bulk quest JSON
        <textarea
          rows={5}
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setPreview(undefined);
            setError("");
          }}
          placeholder='{"format":"ripple-academy-quests","version":1,"quests":[…]}'
        />
      </label>
      <button
        disabled={busy}
        onClick={() => {
          try {
            setPreview(
              parseQuestCollection(
                json,
                state.quests.map((q) => q.id),
              ),
            );
            setError("");
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
            setPreview(undefined);
          }
        }}
      >
        Validate & preview
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {preview && (
        <div>
          <p>
            {preview.length} quests · {preview.reduce((n, q) => n + q.xp, 0)} XP
            / {preview.reduce((n, q) => n + q.gold, 0)} gold available on
            completion
          </p>
          <ul>
            {preview.map((q) => (
              <li key={q.id}>
                <strong>{q.title}</strong> — {q.objective}
              </li>
            ))}
          </ul>
          <button
            disabled={busy}
            onClick={async () => {
              if (
                await act(
                  { type: "importQuests", quests: preview },
                  "Quest collection added.",
                )
              ) {
                setPreview(undefined);
                setJson("");
              }
            }}
          >
            Import these quests
          </button>
        </div>
      )}
    </details>
  );
}

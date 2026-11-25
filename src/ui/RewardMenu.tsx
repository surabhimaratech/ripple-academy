import { useEffect, useRef, useState } from "react";
import type { State, Action } from "../domain/model";
import type { Editor } from "./Folio";
export function RewardMenu({
  state,
  busy,
  act,
  edit,
  onRedeemed,
}: {
  state: State;
  busy: boolean;
  act: (a: Action, m: string) => Promise<unknown>;
  edit: (e: Editor) => void;
  onRedeemed?: () => void;
}) {
  const i = state.redemptionIntent;
  const confirmation = useRef<HTMLElement>(null);
  useEffect(() => {
    if (i) confirmation.current?.focus();
  }, [i?.id]);
  return (
    <section className="cafe-menu" aria-label="Happy Café reward menu">
      <span className="eyebrow">HAPPY CAFÉ</span>
      <h3>A little something to enjoy.</h3>
      <p>◈ {state.gold} gold · Your XP and level stay yours.</p>
      <p className="care-note">
        Visiting, reading and relaxing are free. Meals, rest and essential
        self-care never need gold.
      </p>
      {i && (
        <section
          ref={confirmation}
          tabIndex={-1}
          className="reward-confirmation"
          aria-label="Confirm reward redemption"
        >
          <h3>{i.title}</h3>
          <p>Price: {i.cost} gold</p>
          <p>Balance after redemption: {state.gold - i.cost} gold</p>
          <p>Redeem now and enjoy in real life whenever you like.</p>
          <button
            disabled={busy || state.gold < i.cost}
            className="primary"
            onClick={async () => {
              if (
                await act(
                  { type: "confirmRedemption", id: i.id },
                  "A little treat for yourself. Enjoy!",
                )
              )
                onRedeemed?.();
            }}
          >
            Confirm redemption
          </button>
          <button
            disabled={busy}
            onClick={() =>
              void act(
                { type: "dismissRedemption", id: i.id },
                "Confirmation cancelled. No gold spent.",
              )
            }
          >
            Keep my gold
          </button>
          {state.gold < i.cost && (
            <p>A little more gold is needed for this optional treat.</p>
          )}
        </section>
      )}
      {!state.cafeStartersAdded && (
        <section className="starter-menu">
          <p>
            Would you like a few ideas? Add six editable rewards, from a 5-gold
            coffee to a special personal treat.
          </p>
          <button
            disabled={busy}
            onClick={() =>
              void act(
                { type: "addCafeStarters" },
                "Starter menu added. Your existing rewards are unchanged.",
              )
            }
          >
            Add optional starter menu
          </button>
        </section>
      )}
      <button disabled={busy} onClick={() => edit({ kind: "reward" })}>
        + New reward
      </button>
      {[...state.rewards]
        .sort((a, b) => a.cost - b.cost)
        .map((r) => (
          <article className="entry" key={r.id}>
            <div className="entry-heading">
              <span className="subject">
                {r.kind === "coffee" || r.kind === "pastry"
                  ? "CAFÉ TREAT"
                  : r.kind === "book"
                    ? "BOOKS & GIFTS"
                    : "PERSONAL REWARD"}
              </span>
              <span className="reward-values">◈ {r.cost} gold</span>
            </div>
            <h3>{r.title}</h3>
            <div className="entry-actions">
              <button
                disabled={busy || !!i || state.gold < r.cost}
                onClick={() =>
                  void act(
                    {
                      type: "prepareRedemption",
                      id: r.id,
                      intentId: crypto.randomUUID(),
                    },
                    "Review your reward before spending gold.",
                  )
                }
              >
                {state.gold < r.cost
                  ? `${r.cost - state.gold} more gold to save`
                  : "Choose reward"}
              </button>
              <button
                disabled={busy}
                onClick={() => edit({ kind: "reward", value: r })}
              >
                Edit
              </button>
              <button
                disabled={busy}
                onClick={() => {
                  if (
                    confirm(
                      "Remove this reward? Redemption history will be kept.",
                    )
                  )
                    void act(
                      { type: "deleteReward", id: r.id },
                      "Reward removed.",
                    );
                }}
              >
                Delete
              </button>
            </div>
          </article>
        ))}
    </section>
  );
}
export function RewardHistory({
  state,
  busy,
  act,
}: {
  state: State;
  busy: boolean;
  act: (a: Action, m: string) => Promise<unknown>;
}) {
  const [cancelling, setCancelling] = useState<string>();
  return (
    <>
      <p>
        Redeemed now, enjoyed whenever you choose. Marking a reward enjoyed is
        optional.
      </p>
      {!state.history.length && (
        <p className="empty">Your redeemed rewards will appear here.</p>
      )}
      {state.history.map((h) => (
        <article className="entry" key={h.id}>
          <span className="subject">{new Date(h.at).toLocaleString()}</span>
          <h3>{h.title}</h3>
          <p>
            ◈ {h.cost} gold ·{" "}
            {h.cancelledAt
              ? "Cancelled · refunded"
              : h.enjoyedAt
                ? "Enjoyed"
                : "Redeemed · saved for later"}
          </p>
          {!h.enjoyedAt && !h.cancelledAt && (
            <div className="entry-actions">
              <button
                disabled={busy}
                onClick={() =>
                  void act(
                    { type: "enjoyRedemption", id: h.id },
                    "Enjoyed, and remembered.",
                  )
                }
              >
                Mark enjoyed
              </button>
              <button disabled={busy} onClick={() => setCancelling(h.id)}>
                Cancel & refund
              </button>
              {cancelling === h.id && (
                <section aria-label="Confirm refund">
                  <p>
                    Cancel {h.title} and return {h.cost} gold?
                  </p>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      if (
                        await act(
                          { type: "cancelRedemption", id: h.id },
                          "Redemption cancelled. Gold refunded once.",
                        )
                      )
                        setCancelling(undefined);
                    }}
                  >
                    Confirm refund
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => setCancelling(undefined)}
                  >
                    Keep reward
                  </button>
                </section>
              )}
            </div>
          )}
        </article>
      ))}
    </>
  );
}

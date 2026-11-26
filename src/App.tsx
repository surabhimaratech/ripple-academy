import { ObservationJournal } from "./ui/ObservationJournal";
import {
  FocusPage,
  FocusControls,
  StudyClock,
  useFocusNow,
} from "./ui/FocusStudy";
import { remaining } from "./domain/focus";
import {
  activeSession,
  categories,
  academicRank,
  roomNames,
  type Location,
  type Interior,
} from "./domain/sessions";
import {
  SessionPage,
  CurriculumPage,
  FinishSessionDialog,
  useSessionClock,
  timeLabel,
} from "./ui/SessionPages";
import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
  type ChangeEvent,
} from "react";
import type { Celebration } from "./game/Library";
import { HeroinePortrait } from "./ui/HeroinePortrait";
import { Entrance } from "./entrance/Entrance";
import { resumeDestination } from "./entrance/scroll";
const Library = lazy(() =>
  import("./game/Library").then((module) => ({ default: module.Library })),
);
import { progression, type State, type Action } from "./domain/model";
import { parseSave, serializeSave, MAX_SAVE_BYTES } from "./domain/save";
import { Repository } from "./persistence/repository";
import { FolioContent, tabs, type Tab, type Editor } from "./ui/Folio";
import { EditorDialog } from "./ui/Editor";
import {
  preference,
  remember,
  useMotion,
  useAnimatedNumber,
  prepareChime,
  chime,
} from "./ui/preferences";
import type { Interaction } from "./game/movement";
const repository = new Repository();
const channel =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("library-save")
    : null;
export default function App() {
  const [state, setState] = useState<State>();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [focusQuest, setFocusQuest] = useState<string>();
  const now = useFocusNow();
  const [tab, setTab] = useState<Tab | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [pendingImport, setPendingImport] = useState<State | null>(null);
  const [pastedSave, setPastedSave] = useState("");
  const [muted, setMuted] = useState(
    () => preference("university-muted", "true") !== "false",
  );
  const motion = useMotion();
  const [location, setLocation] = useState<Location>("university");
  const [day, setDay] = useState(() => preference("university-day", "system"));
  const [parallax, setParallax] = useState(() =>
    Number(preference("university-parallax", "0.6")),
  );
  const [finishing, setFinishing] = useState(false);
  const rewardVisual = state?.history.find(
    (h) => h.visualPending && !h.cancelledAt,
  );
  const currentSession = state ? activeSession(state) : undefined;
  const [clockEpoch, setClockEpoch] = useState(0);
  const clock = useSessionClock(currentSession, clockEpoch);
  function visit(next: Location) {
    if (next !== "university") remember("ripple-last-room", next);
    setLocation(next);
    setFocusMode(false);
    setTab(null);
    setPendingImport(null);
    setAmbient(false);
  }
  const resumeRoom = resumeDestination(
    state,
    preference("ripple-last-room", ""),
  );
  useEffect(() => {
    document.title =
      location === "university"
        ? "Ripple Academy"
        : "%s · Ripple Academy".replace("%s", roomNames[location]);
    window.scrollTo(0, 0);
  }, [location]);
  useEffect(() => {
    if (location !== "university" || !tab) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || document.querySelector("dialog[open]")) return;
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".folio button, .folio input, .folio select, .folio textarea, .folio a[href], .folio summary, .folio [tabindex]",
        ),
      ).filter(
        (element) =>
          !element.matches(":disabled") &&
          element.tabIndex >= 0 &&
          element.getClientRects().length > 0,
      );
      const first = elements[0],
        last = elements[elements.length - 1];
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !elements.includes(document.activeElement as HTMLElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !elements.includes(document.activeElement as HTMLElement))
      ) {
        e.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trap);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", trap);
    };
  }, [location, tab]);
  function changeDay(next: string) {
    setDay(next);
    remember("university-day", next);
  }
  function changeParallax(next: number) {
    setParallax(next);
    remember("university-parallax", String(next));
  }
  useEffect(() => {
    if (!currentSession || currentSession.phase !== "running") return;
    const session = currentSession;
    const checkpoint = () => {
      void repository
        .transact({
          type: "checkpointSession",
          id: session.id,
          runId: session.runId,
          elapsedMs: clock.read(),
        })
        .then((next) => {
          setState(next);
          channel?.postMessage("saved");
        })
        .catch((e) => setError(String(e)));
    };
    const id = setInterval(checkpoint, 10000);
    window.addEventListener("pagehide", checkpoint);
    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", checkpoint);
    };
  }, [currentSession?.id, currentSession?.runId, currentSession?.phase]);

  const [autonomous, setAutonomous] = useState(
    () => preference("university-autonomy", "true") !== "false",
  );
  const [thoughts, setThoughts] = useState(
    () => preference("university-thoughts", "true") !== "false",
  );
  const [ambient, setAmbient] = useState(false);
  function toggleAutonomy() {
    setAutonomous((value) => {
      remember("university-autonomy", String(!value));
      return !value;
    });
  }
  function toggleThoughts() {
    setThoughts((value) => {
      remember("university-thoughts", String(!value));
      return !value;
    });
  }
  function enterAmbient() {
    setTab(null);
    setPendingImport(null);
    setAmbient(true);
  }

  const lock = useRef(false);
  const folioHeading = useRef<HTMLHeadingElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const menuOpener = useRef<HTMLElement | null>(null);
  const [levelNotice, setLevelNotice] = useState("");
  const shownGold = useAnimatedNumber(state?.gold ?? 0, motion.reduced);
  const shownXP = useAnimatedNumber(state?.xp ?? 0, motion.reduced);
  const actual = progression(state?.xp ?? 0),
    shown = progression(shownXP);
  useEffect(() => {
    repository
      .transact()
      .then(setState)
      .catch((e) => setError(String(e)));
    const refresh = (event?: Event | MessageEvent) => {
      const restored = !!event && "data" in event && event.data === "restored";
      repository
        .transact()
        .then((next) => {
          setState(next);
          if (restored) setClockEpoch((n) => n + 1);
        })
        .catch((e) => setError(String(e)));
    };
    if (channel) channel.onmessage = refresh;
    window.addEventListener("focus", refresh);
    return () => {
      if (channel) channel.onmessage = null;
      window.removeEventListener("focus", refresh);
    };
  }, []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6500);
    return () => clearTimeout(timer);
  }, [message]);
  useEffect(() => {
    if (!levelNotice) return;
    const timer = setTimeout(() => setLevelNotice(""), 5000);
    return () => clearTimeout(timer);
  }, [levelNotice]);
  useEffect(() => {
    if (tab) {
      folioHeading.current?.focus({ preventScroll: true });
    } else if (menuOpener.current) {
      menuOpener.current.focus({ preventScroll: true });
    }
  }, [tab]);
  function open(next: Tab) {
    if (next === "shop" && location !== "happy-cafe") visit("happy-cafe");
    setAmbient(false);
    if (!tab) menuOpener.current = document.activeElement as HTMLElement;
    setTab(next);
    setError("");
  }
  function closeMenu() {
    setTab(null);
    setPendingImport(null);
  }
  useEffect(() => {
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !editor) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [editor]);
  async function commit(
    operation: () => Promise<State>,
    success: string,
    action?: Action,
  ) {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const next = await operation();
      const awardedQuest =
        action?.type === "complete"
          ? action.id
          : action?.type === "finishSession" && action.completeQuest
            ? state?.sessions?.find((x) => x.id === action.id)?.questId
            : undefined;
      if (awardedQuest) {
        const q = next.quests.find((q) => q.id === awardedQuest);
        const previous = state?.quests.find((q) => q.id === awardedQuest);
        if (q?.completed && !previous?.completed) {
          const levelUp = progression(next.xp).level > actual.level;
          setCelebration({
            xp: q.completed.xp,
            gold: q.completed.gold,
            key: Date.now(),
            levelUp,
            level: progression(next.xp).level,
          });
          if (!muted) chime(levelUp);
          if (levelUp)
            setLevelNotice(
              `Level ${progression(next.xp).level} · Your curiosity is growing`,
            );
        }
      }
      setState(next);
      setMessage(success);
      if (!action) setClockEpoch((n) => n + 1);
      channel?.postMessage(action ? "saved" : "restored");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function act(action: Action, success: string) {
    if (
      !muted &&
      (action.type === "complete" ||
        action.type === "finishSession" ||
        action.type === "focusStart" ||
        action.type === "focusResume")
    )
      prepareChime();
    if (
      (action.type === "focusPause" || action.type === "focusResume") &&
      currentSession?.id === state?.focus?.current?.sessionId
    )
      action = { ...action, sessionElapsedMs: clock.read() };
    const result = await commit(
      () => repository.transact(action),
      success,
      action,
    );
    if (
      result &&
      (action.type === "focusStart" || action.type === "focusResume") &&
      location !==
        (action.type === "focusStart"
          ? (action.room ?? "personal-study")
          : (state?.focus?.current?.room ?? "personal-study"))
    )
      visit(
        action.type === "focusStart"
          ? (action.room ?? "personal-study")
          : (state?.focus?.current?.room ?? "personal-study"),
      );
    return result;
  }
  const timer = state?.focus?.current;
  const reconcilePending = useRef(false);
  const lastFocusRecord = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (
      !timer ||
      timer.status !== "running" ||
      remaining(timer, now) > 0 ||
      reconcilePending.current
    )
      return;
    reconcilePending.current = true;
    void act(
      { type: "focusTick", id: timer.id, now: Date.now() },
      "Interval complete. Choose your next quiet chapter.",
    ).finally(() => {
      reconcilePending.current = false;
    });
  }, [timer?.id, timer?.status, now]);
  useEffect(() => {
    const id = state?.focus?.history[0]?.id;
    if (
      id &&
      lastFocusRecord.current !== undefined &&
      id !== lastFocusRecord.current &&
      state?.focus?.settings.chime &&
      !muted
    )
      chime(false);
    if (state) lastFocusRecord.current = id ?? "";
  }, [!!state, state?.focus?.history[0]?.id]);
  function enterFocus() {
    visit(
      timer?.room ??
        (location === "observatory" ? "observatory" : "personal-study"),
    );
    setFocusMode(true);
  }
  function focusQuestNow(id: string) {
    setFocusQuest(id);
    visit(
      state?.quests.find((q) => q.id === id)?.room === "observatory"
        ? "observatory"
        : "personal-study",
    );
    open("focus");
  }
  function interact(id: Interaction) {
    if (location === "observatory") {
      if (id === "workstation") {
        open("sessions");
        return;
      }
      if (id === "science-journal") {
        open("observations");
        return;
      }
      if (id === "science-charts") {
        open("sessions");
        return;
      }
    }
    if (id === "cafe-menu" || id === "cafe-gifts") {
      open("shop");
      return;
    }
    if (
      location === "personal-study" &&
      ["workstation", "focus-clock", "chalkboard", "chair"].includes(id)
    ) {
      if (id === "chalkboard")
        setFocusQuest(
          state?.quests.find(
            (q) => q.activity === "system-design" && !q.completed,
          )?.id,
        );
      open("focus");
    } else if (location === "personal-study" && id === "window") {
      open("discovery");
      setMessage(
        "A quiet moment to reflect. Write down anything worth keeping.",
      );
    } else if (id === "quests" || id === "discovery" || id === "keepsakes")
      open(id);
    else if (id === "door") visit("university");
    else if (id === "chair")
      setMessage(
        "A quiet seat, freely yours. Press a movement key to stand when you’re ready.",
      );
  }
  function toggleMute() {
    const next = !muted;
    setMuted(next);
    remember("university-muted", String(next));
    if (!next) {
      prepareChime();
      chime(false);
    }
  }
  async function exportSave() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      const latest = await repository.transact(
        currentSession?.phase === "running"
          ? {
              type: "checkpointSession",
              id: currentSession.id,
              runId: currentSession.runId,
              elapsedMs: clock.read(),
            }
          : undefined,
      );
      setState(latest);
      const blob = new Blob([serializeSave(latest)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ripple-academy-save-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage("Your save has been exported. Keep it somewhere safe.");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function chooseImport(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    setError("");
    setPendingImport(null);
    try {
      if (selected.size > MAX_SAVE_BYTES)
        throw Error("Save files must be smaller than 5 MB.");
      setPendingImport(parseSave(await selected.text()));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div
      className={`app ${location === "university" ? "cinematic-app" : ""} ${motion.reduced ? "reduced-motion" : ""} ${ambient ? "ambient-view" : ""} ${focusMode ? "study-focus-mode" : ""} ${location === "personal-study" ? "study-room" : location === "happy-cafe" ? "cafe-room" : location === "observatory" ? "observatory-room" : ""}`}
    >
      <a
        className="skip-link"
        href={location === "university" ? "#academic-wings" : "#game-menu"}
      >
        Skip to academy navigation
      </a>
      <header className="game-header university-header">
        <div className="university">
          <span className="crest" aria-hidden="true">
            <img src="/ripple-mark.svg" alt="" />
          </span>
          <span>
            RIPPLE ACADEMY<small>Through curiosity, to the stars.</small>
          </span>
        </div>
        <div className="location-title">
          <span>☾</span>
          <h1>
            {location === "university" ? "Ripple Academy" : roomNames[location]}
          </h1>
          <span>☾</span>
        </div>
        <div className="header-controls">
          <button
            className="autonomy-toggle"
            aria-pressed={autonomous}
            onClick={toggleAutonomy}
          >
            {autonomous ? "Autonomous movement" : "Manual control"}
          </button>
          <button className="ambient-toggle" onClick={enterAmbient}>
            Ambient view
          </button>
          <button
            className="sound-button"
            onClick={toggleMute}
            aria-pressed={!muted}
            title={muted ? "Enable gentle reward sounds" : "Mute reward sounds"}
          >
            {muted ? "♫ Off" : "♫ On"}
          </button>
          <button onClick={() => open("save")} className="save-status">
            {busy ? "Saving…" : state ? "Saved locally" : "Opening save…"}
          </button>
        </div>
        <nav className="room-navigation" aria-label="University destinations">
          {(
            [
              "university",
              "grand-library",
              "personal-study",
              "observatory",
              "happy-cafe",
            ] as Location[]
          ).map((id) => (
            <button
              key={id}
              aria-pressed={location === id}
              onClick={() => visit(id)}
            >
              {roomNames[id]}
            </button>
          ))}
        </nav>
      </header>
      {location === "university" && (
        <Entrance
          state={state}
          reduced={motion.reduced}
          intensity={parallax}
          resume={resumeRoom}
          visit={visit}
          open={open}
          day={day}
        />
      )}
      {location === "university" && tab && (
        <button
          className="entrance-folio-scrim"
          aria-label="Close the journal"
          onClick={closeMenu}
        />
      )}
      <div
        className="game-stage"
        role={location === "university" ? undefined : "main"}
      >
        {location !== "university" && (
          <Suspense
            fallback={
              <div className="room-loading" role="status">
                Lighting the candles…
              </div>
            }
          >
            <Library
              rewardVisual={
                location === "happy-cafe" && !tab ? rewardVisual : undefined
              }
              onRewardVisualDone={(id) => {
                void act(
                  { type: "finishRewardVisual", id },
                  "A little treat for yourself. Enjoy!",
                );
              }}
              celebration={celebration}
              blocked={!!tab || !!editor || finishing}
              reduced={motion.reduced}
              autonomous={autonomous}
              thoughts={thoughts}
              onInteract={interact}
              location={location}
              session={currentSession}
              focus={state?.focus?.current}
              parallax={parallax}
              day={day}
              onNavigate={visit}
            />
          </Suspense>
        )}
        {location === "observatory" && !tab && (
          <div className="observatory-shortcuts">
            <button onClick={() => open("sessions")}>
              Scientific activity
            </button>
            <button onClick={() => open("observations")}>
              Observation journal
            </button>
            <button onClick={() => open("focus")}>Focus timer</button>
            <small>Illustrative displays · no live observations</small>
          </div>
        )}
        {location === "happy-cafe" && !tab && (
          <div className="cafe-shortcuts">
            <button onClick={() => open("shop")}>
              {state?.redemptionIntent
                ? "Continue reward confirmation"
                : "Browse the café menu"}
            </button>
            <button onClick={() => open("history")}>Rewards for later</button>
            {rewardVisual && (
              <button
                disabled={busy}
                onClick={() =>
                  void act(
                    { type: "finishRewardVisual", id: rewardVisual.id },
                    "Visual skipped. Your reward is saved for later.",
                  )
                }
              >
                Skip reward animation
              </button>
            )}
            <small>Visiting and relaxing are always free.</small>
          </div>
        )}
        {location === "personal-study" && state && (
          <StudyClock state={state} now={now} open={() => open("focus")} />
        )}
        {(location === "personal-study" ||
          (location === "observatory" &&
            state?.focus?.current?.room === "observatory" &&
            (state.focus.current.status !== "ready" || focusMode))) &&
          state &&
          !tab && (
            <section className="study-focus-strip" aria-label="Focus session">
              <div>
                {state.focus?.current?.questId && (
                  <span className="focus-quest-title">
                    {state.quests.find(
                      (q) => q.id === state.focus?.current?.questId,
                    )?.title ?? "Your focus quest"}
                  </span>
                )}
                <strong>
                  {state.focus?.current?.objective || "A study of your own"}
                </strong>
                <FocusControls state={state} act={act} busy={busy} now={now} />
              </div>
              <button onClick={() => open("focus")}>Focus controls</button>
              <button
                onClick={() => (focusMode ? setFocusMode(false) : enterFocus())}
              >
                {focusMode ? "Exit Focus Mode" : "Focus Mode"}
              </button>
            </section>
          )}
        <section
          className={`rpg-hud ${celebration ? "has-earned" : ""}`}
          aria-label="Your progress"
        >
          <div className="hud-portrait" aria-hidden="true">
            <HeroinePortrait decorative />
          </div>
          <div className="hud-details">
            <div className="hud-name">
              <strong>{academicRank(state?.xp ?? 0)}</strong>
              <span>LV. {actual.level}</span>
            </div>
            <div
              className="xp-track"
              role="progressbar"
              aria-label="Experience toward next level"
              aria-valuemin={0}
              aria-valuemax={actual.needed}
              aria-valuenow={actual.current}
            >
              <div
                style={{ width: `${(shown.current / shown.needed) * 100}%` }}
              />
            </div>
            <div className="hud-numbers">
              <span>
                {actual.current} / {actual.needed} XP
              </span>
              <strong aria-label={`${state?.gold ?? 0} gold`}>
                <span aria-hidden="true">
                  ◈ {shownGold.toLocaleString()} gold
                </span>
              </strong>
            </div>
          </div>
        </section>

        {currentSession && (
          <section
            className="session-indicator"
            aria-label="Current activity session"
          >
            <div>
              <strong>{currentSession.title}</strong>
              <span>
                {timeLabel(clock.elapsedMs)}
                {currentSession.targetMinutes &&
                currentSession.room !== "observatory"
                  ? ` / ${currentSession.targetMinutes}:00`
                  : ""}{" "}
                ·{" "}
                {currentSession.phase === "paused"
                  ? "Paused"
                  : currentSession.targetMinutes &&
                      currentSession.room !== "observatory" &&
                      clock.elapsedMs >= currentSession.targetMinutes * 60000
                    ? "Focus time reached — finish whenever you’re ready"
                    : "At your own pace"}
              </span>
            </div>
            <div className="session-controls">
              <button
                aria-label={
                  currentSession.phase === "running"
                    ? "Pause activity session"
                    : "Resume activity session"
                }
                onClick={() =>
                  void act(
                    currentSession.phase === "running"
                      ? {
                          type: "pauseSession",
                          id: currentSession.id,
                          runId: currentSession.runId,
                          elapsedMs: clock.read(),
                        }
                      : {
                          type: "resumeSession",
                          id: currentSession.id,
                          runId: crypto.randomUUID(),
                        },
                    currentSession.phase === "running"
                      ? "Session paused."
                      : "Session resumed.",
                  )
                }
              >
                {currentSession.phase === "running" ? "Pause" : "Resume"}
              </button>
              <button onClick={() => setFinishing(true)}>Finish</button>
              {location !== currentSession.room && (
                <button onClick={() => visit(currentSession.room)}>
                  Return to room
                </button>
              )}
            </div>
          </section>
        )}
        {levelNotice && (
          <div className="level-notice" role="status">
            ✦ {levelNotice} ✦
          </div>
        )}
        {error && !tab && (
          <div className="world-error" role="alert">
            {error}
            <button onClick={() => open("save")}>Open save settings</button>
          </div>
        )}
        {tab && (
          <aside
            id="folio"
            className="folio"
            aria-label={tabs.find((t) => t.id === tab)?.label}
            role={location === "university" ? "dialog" : undefined}
            aria-modal={location === "university" ? true : undefined}
          >
            <div className="folio-binding" />
            <div className="folio-top">
              <div>
                <span className="eyebrow">JOURNAL</span>
                <h2 tabIndex={-1} ref={folioHeading}>
                  {tabs.find((t) => t.id === tab)?.label}
                </h2>
              </div>
              <button
                className="close-button"
                aria-label="Close journal"
                onClick={closeMenu}
              >
                ×
              </button>
            </div>
            <div className="folio-tabs" aria-label="Journal pages">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  aria-pressed={tab === t.id}
                  aria-label={t.label}
                  title={t.label}
                  onClick={() => open(t.id)}
                >
                  {t.icon}
                </button>
              ))}
            </div>
            <div className="folio-scroll">
              {error && (
                <p role="alert" className="error">
                  {error}
                </p>
              )}
              {!state ? (
                <p>
                  Opening your saved journal…{" "}
                  <button
                    className="text-button"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </p>
              ) : tab === "observations" ? (
                <ObservationJournal
                  state={state}
                  busy={busy}
                  act={act}
                  projects={() => open("curriculum")}
                />
              ) : tab === "focus" ? (
                <FocusPage
                  state={state}
                  busy={busy}
                  act={act}
                  now={now}
                  room={
                    location === "observatory"
                      ? "observatory"
                      : "personal-study"
                  }
                  selected={focusQuest}
                  enter={enterFocus}
                />
              ) : tab === "sessions" ? (
                <SessionPage
                  room={location !== "university" ? location : undefined}
                  state={state}
                  busy={busy}
                  act={act}
                  go={visit}
                  elapsed={clock.elapsedMs}
                  finish={() => setFinishing(true)}
                />
              ) : tab === "curriculum" ? (
                <CurriculumPage
                  room={location === "observatory" ? "observatory" : undefined}
                  state={state}
                  busy={busy}
                  act={act}
                  go={visit}
                />
              ) : tab === "save" ? (
                <div className="save-menu">
                  <p className="folio-intro">
                    Your Ripple Academy journal lives on this device. Keep a
                    copy close.
                  </p>
                  <section>
                    <h3>Life at Ripple Academy</h3>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={autonomous}
                        onChange={toggleAutonomy}
                      />
                      Autonomous activities
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={thoughts}
                        onChange={toggleThoughts}
                      />
                      Occasional thought bubbles
                    </label>
                    <p className="small-note">
                      Manual movement takes the lead. She resumes her day after
                      about 20 seconds without movement. Activities never earn
                      XP or gold.
                    </p>
                    <button className="secondary" onClick={enterAmbient}>
                      Enjoy ambient view
                    </button>
                  </section>
                  <section>
                    <h3>Sound & atmosphere</h3>
                    <label>
                      Entrance atmosphere
                      <select
                        value={day}
                        onChange={(e) => changeDay(e.target.value)}
                      >
                        <option value="system">Follow local time of day</option>
                        <option value="morning">Morning</option>
                        <option value="afternoon">Afternoon</option>
                        <option value="twilight">Twilight</option>
                        <option value="night">Nighttime</option>
                      </select>
                    </label>
                    <label>
                      Scroll parallax
                      <select
                        value={parallax}
                        onChange={(e) => changeParallax(Number(e.target.value))}
                      >
                        <option value={0}>Off</option>
                        <option value={0.3}>Very gentle</option>
                        <option value={0.6}>Gentle</option>
                        <option value={1}>Full</option>
                      </select>
                    </label>
                    <label className="check-label">
                      <input
                        type="checkbox"
                        checked={!muted}
                        onChange={toggleMute}
                      />
                      Gentle reward chimes
                    </label>
                    <label>
                      Motion
                      <select
                        value={motion.mode}
                        onChange={(e) => motion.setMode(e.target.value)}
                      >
                        <option value="system">Follow system preference</option>
                        <option value="reduced">Reduced motion</option>
                        <option value="full">Ambient animation</option>
                      </select>
                    </label>
                    <p className="small-note">
                      Reduced motion keeps walking controls, with still poses
                      and quiet, static celebrations.
                    </p>
                  </section>
                  <section>
                    <h3>Your save book</h3>
                    <p>
                      Export a JSON copy before moving browsers or clearing
                      storage.
                    </p>
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => void exportSave()}
                    >
                      Export save
                    </button>
                    <button
                      className="secondary"
                      disabled={busy}
                      onClick={() => file.current?.click()}
                    >
                      Choose JSON to import
                    </button>
                    <input
                      className="sr-only"
                      type="file"
                      accept=".json,application/json"
                      ref={file}
                      onChange={chooseImport}
                      aria-label="Import JSON save"
                    />
                    <details className="paste-import">
                      <summary>Import from pasted JSON</summary>
                      <label>
                        Save JSON
                        <textarea
                          rows={5}
                          maxLength={MAX_SAVE_BYTES}
                          value={pastedSave}
                          onChange={(e) => setPastedSave(e.target.value)}
                          spellCheck={false}
                        />
                      </label>
                      <button
                        className="secondary"
                        disabled={busy || !pastedSave.trim()}
                        onClick={() => {
                          setError("");
                          setPendingImport(null);
                          try {
                            setPendingImport(parseSave(pastedSave));
                          } catch (e) {
                            setError(
                              e instanceof Error ? e.message : String(e),
                            );
                          }
                        }}
                      >
                        Review pasted save
                      </button>
                    </details>
                    {pendingImport && (
                      <div className="import-preview">
                        <h4>Review this save</h4>
                        <p>
                          Level {progression(pendingImport.xp).level} ·{" "}
                          {pendingImport.xp} XP · {pendingImport.gold} gold
                        </p>
                        <p>
                          {pendingImport.quests.length} quests ·{" "}
                          {pendingImport.history.length} redemptions ·{" "}
                          {pendingImport.discoveries?.length ?? 0} discoveries
                        </p>
                        <p>
                          Import replaces your current journal. A recovery copy
                          of your current progress will be saved on this device
                          first.
                        </p>
                        <div className="dialog-actions">
                          <button
                            className="text-button"
                            onClick={() => setPendingImport(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="primary"
                            disabled={busy}
                            onClick={async () => {
                              if (
                                await commit(
                                  () => repository.restore(pendingImport),
                                  "Your save has been imported. The previous journal is kept as a recovery copy.",
                                )
                              )
                                setPendingImport(null);
                            }}
                          >
                            Import this save
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      className="text-button recovery"
                      disabled={busy}
                      onClick={() => {
                        if (
                          confirm(
                            "Restore the journal saved before your last import? Your current journal will become the recovery copy.",
                          )
                        )
                          void commit(
                            () => repository.recover(),
                            "Previous journal restored.",
                          );
                      }}
                    >
                      Restore pre-import save
                    </button>
                    <p className="small-note">
                      The browser, profile and localhost port identify your
                      save. No data is sent to a server.
                    </p>
                  </section>
                  <section>
                    <h3>Library controls</h3>
                    <p>
                      Click the room to focus it. Use WASD or arrow keys to
                      wander. Press E or Space near an object to interact. Click
                      objects directly, or use the command bar below.
                    </p>
                    <p>
                      Esc closes the journal. Manual input pauses while menus
                      are open; autonomous activities continue.
                    </p>
                  </section>
                </div>
              ) : (
                <FolioContent
                  tab={tab}
                  state={state}
                  busy={busy}
                  act={act}
                  onRedeemed={closeMenu}
                  focus={focusQuestNow}
                  edit={(next) => {
                    setError("");
                    setEditor(next);
                  }}
                />
              )}
            </div>
            <div className="folio-footer">
              <span>✧</span> No hurry. Your next chapter is yours.
            </div>
          </aside>
        )}
      </div>
      <nav className="command-bar" id="game-menu" aria-label="Game menus">
        {tabs
          .filter((t) =>
            [
              "focus",
              "sessions",
              "quests",
              "shop",
              "curriculum",
              "history",
              "save",
            ].includes(t.id),
          )
          .map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? "selected" : ""}
              aria-pressed={tab === t.id}
              aria-controls="folio"
              onClick={() => {
                if (tab === t.id) closeMenu();
                else open(t.id);
              }}
            >
              <span className="command-icon" aria-hidden="true">
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
      </nav>
      {ambient && (
        <button className="ambient-exit" onClick={() => setAmbient(false)}>
          Return to menus
        </button>
      )}
      <div className="toast" role="status" key={message}>
        {message}
      </div>
      <FinishSessionDialog
        session={finishing ? currentSession : undefined}
        elapsed={clock.elapsedMs}
        busy={busy}
        close={() => setFinishing(false)}
        act={act}
        questCompleted={
          !!state?.quests.find((q) => q.id === currentSession?.questId)
            ?.completed
        }
      />
      <EditorDialog
        editor={editor}
        courses={state?.courses}
        defaultRoom={
          location === "observatory" ? "observatory" : "personal-study"
        }
        busy={busy}
        error={error}
        close={() => setEditor(null)}
        act={act}
      />
    </div>
  );
}

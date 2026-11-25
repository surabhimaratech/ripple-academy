import { useEffect, useState } from "react";
import {
  academicRank,
  activeSession,
  roomNames,
  type Interior,
} from "../domain/sessions";
import type { State } from "../domain/model";
import { progression } from "../domain/model";
import type { Tab } from "../ui/Folio";
import { Panorama } from "./Panorama";
import { HeroinePortrait } from "../ui/HeroinePortrait";
import { RoomPreview } from "./RoomPreview";
import { entranceArt } from "./assets";
import { useJourney } from "./useJourney";
import { localTimeOfDay } from "../game/atmosphere";
const wings = [
  {
    id: "happy-cafe",
    label: "Happy Café",
    tag: "A LITTLE PLEASURE",
    description: "Coffee, small treats, and an afternoon of your own.",
  },
  {
    id: "grand-library",
    label: "Grand Library",
    tag: "FOR THE CURIOUS MIND",
    description: "Old books, candlelight, and one more chapter.",
  },
  {
    id: "personal-study",
    label: "Personal Study",
    tag: "A LITTLE SPACE OF YOUR OWN",
    description: "An open notebook. An idea becoming something.",
  },
  {
    id: "observatory",
    label: "Observatory",
    tag: "FOR ALL THE UNANSWERED QUESTIONS",
    description: "Look a little closer. There is a universe to discover.",
  },
] as const;
export function Entrance({
  state,
  reduced,
  intensity,
  resume,
  visit,
  open,
  day,
}: {
  state: State | undefined;
  reduced: boolean;
  intensity: number;
  resume: Interior;
  visit: (room: Interior) => void;
  open: (tab: Tab) => void;
  day: string;
}) {
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    if (reduced) root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, [reduced]);
  const [hidden, setHidden] = useState(document.hidden);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", change);
    return () => document.removeEventListener("visibilitychange", change);
  }, []);
  const [hour, setHour] = useState(new Date().getHours());
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) setHour(new Date().getHours());
    }, 60000);
    return () => clearInterval(timer);
  }, []);
  const journey = useJourney(reduced, intensity);
  const atmosphere = day === "system" ? localTimeOfDay(hour) : day;
  const p = progression(state?.xp ?? 0),
    current = state ? activeSession(state) : undefined;
  const activeQuests = state?.quests.filter((q) => !q.completed) ?? [];
  return (
    <main
      data-atmosphere={atmosphere}
      className={`ripple-entrance ${reduced ? "still" : ""} ${hidden ? "is-paused" : ""}`}
    >
      <nav className="arrival-nav" aria-label="Ripple Academy entrance">
        <a href="#arrival" className="ripple-wordmark">
          <img src="/ripple-mark.svg" alt="" />
          <span>
            RIPPLE<span>ACADEMY</span>
          </span>
        </a>
        <div>
          <a href="#grounds">The grounds</a>
          <a href="#academic-wings">Skip to Academic Wings</a>
          <button className="returning-link" onClick={() => visit(resume)}>
            {current
              ? `Resume ${current.title.toLowerCase()}`
              : `Resume ${roomNames[resume]}`}
          </button>
          <button
            className="entrance-settings"
            aria-label="Ripple Academy settings"
            onClick={() => open("save")}
          >
            Settings
          </button>
        </div>
      </nav>
      <section
        className="arrival-section cinematic-journey"
        ref={journey.track}
        id="arrival"
        aria-labelledby="arrival-title"
      >
        <span
          className="journey-anchor approach-anchor"
          id="approach"
          aria-hidden="true"
        />
        <span
          className="journey-anchor gates-anchor"
          id="gates"
          aria-hidden="true"
        />
        <span
          className="journey-anchor grounds-anchor"
          id="grounds"
          aria-hidden="true"
        />
        <div className="arrival-sticky cinematic-viewport">
          <div className="journey-exterior">
            <Panorama
              reduced={reduced}
              intensity={intensity}
              journey={journey.frame}
            />
          </div>
          <div className="journey-courtyard" aria-hidden="true">
            <img
              className="courtyard-art"
              src={entranceArt.courtyard}
              alt=""
              width="1536"
              height="1024"
            />
            <div className="grounds-mist" />
          </div>
          <div className="journey-gates" aria-hidden="true">
            <div className="gate-assembly">
              <div className="gate-light" />
              <div className="gate-leaves">
                <div className="gate-leaf gate-left">
                  <img src={entranceArt.gates.doors} alt="" />
                </div>
                <div className="gate-leaf gate-right">
                  <img src={entranceArt.gates.doors} alt="" />
                </div>
              </div>
              <img
                className="gate-surround"
                src={entranceArt.gates.surround}
                alt=""
              />
            </div>
          </div>
          <div className="arrival-vignette" />
          <div className="arrival-identity" inert={!journey.arrivalAccessible}>
            <img
              className="arrival-mark"
              src="/ripple-mark.svg"
              alt="Ripple Academy celestial dolphin emblem"
            />
            <p className="arrival-eyebrow">A UNIVERSITY OF YOUR OWN</p>
            <h1 id="arrival-title">
              Ripple
              <br />
              <span>Academy</span>
            </h1>
            <p className="academy-motto">Through curiosity, to the stars.</p>
            <a className="academy-enter" href="#approach">
              Enter the Academy
            </a>
          </div>
          <a
            className="scroll-invitation"
            href="#approach"
            inert={!journey.arrivalAccessible}
          >
            <span>THE NEXT CHAPTER AWAITS</span>
            <span className="scroll-line" aria-hidden="true" />
          </a>
          <span className="arrival-aside">A place to become yourself.</span>
          <div
            className="grounds-section journey-welcome"
            aria-labelledby="grounds-title"
            inert={!journey.groundsAccessible}
          >
            <div className="grounds-shade" />
            <div className="grounds-copy">
              <span className="entrance-section-label">
                I. &nbsp; WITHIN THE GROUNDS
              </span>
              <div className="welcome-heading">
                <HeroinePortrait className="courtyard-portrait" />
                <h2 id="grounds-title">
                  Welcome back,
                  <br />
                  <em>explorer.</em>
                </h2>
              </div>
              <p className="grounds-introduction">
                A quiet place for the person you’re becoming.
                <br />
                There is no hurry. Your next chapter is yours.
              </p>
              <div className="grounds-progress" aria-label="Your progress">
                <span>
                  {academicRank(state?.xp ?? 0)}
                  <small>Level {p.level}</small>
                </span>
                <span>
                  {state?.xp ?? 0}
                  <small>experience</small>
                </span>
                <span>
                  ◈ {state?.gold ?? 0}
                  <small>gold</small>
                </span>
              </div>
              <div className="grounds-xp">
                <progress
                  aria-label="Experience toward next level"
                  max={p.needed}
                  value={p.current}
                />
                <span>
                  {p.current} / {p.needed} XP to the next chapter
                </span>
              </div>
              <div
                className="grounds-actions"
                inert={!journey.controlsAccessible}
              >
                <button
                  className="academy-enter"
                  onClick={() => open("sessions")}
                >
                  Begin a real-world activity
                </button>
                <button
                  className="grounds-text-link"
                  onClick={() => visit("happy-cafe")}
                >
                  Visit Happy Café · always free
                </button>
                <button
                  className="grounds-text-link"
                  onClick={() => visit(resume)}
                >
                  Continue in {roomNames[resume]}
                </button>
              </div>
              <div
                className="personal-chapters"
                inert={!journey.controlsAccessible}
              >
                <div>
                  <button
                    className="chapter-heading"
                    onClick={() => open("quests")}
                  >
                    Your quest journal <span>{activeQuests.length} open</span>
                  </button>
                  {activeQuests.slice(0, 2).map((q) => (
                    <button
                      className="chapter-line"
                      key={q.id}
                      onClick={() => open("quests")}
                    >
                      {q.title}
                    </button>
                  ))}
                </div>
                <div>
                  <button
                    className="chapter-heading"
                    onClick={() => open("curriculum")}
                  >
                    Your personal curriculum
                  </button>
                  {state?.courses?.some((c) => c.active) ? (
                    state.courses
                      .filter((c) => c.active)
                      .slice(0, 2)
                      .map((c) => (
                        <button
                          className="chapter-line"
                          key={c.id}
                          onClick={() => open("curriculum")}
                        >
                          {c.title}
                        </button>
                      ))
                  ) : (
                    <button
                      className="chapter-line quiet"
                      onClick={() => open("curriculum")}
                    >
                      Make room for what you’d like to learn.
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="grounds-caption">
              <img src="/ripple-mark.svg" alt="" />
              <span>
                Small beginnings.
                <br />
                Extraordinary possibilities.
              </span>
            </div>
          </div>
        </div>
      </section>
      <section
        className="wings-section"
        id="academic-wings"
        aria-labelledby="wings-title"
      >
        <div className="wings-heading">
          <span className="entrance-section-label">
            II. &nbsp; YOUR ACADEMIC WINGS
          </span>
          <h2 id="wings-title">Find your quiet corner.</h2>
          <p>A quiet corner for every part of your day.</p>
        </div>
        <div className="wing-grid">
          {wings.map((w) => (
            <button
              className="wing-door"
              aria-label={`Enter ${w.label}`}
              key={w.id}
              onClick={() => visit(w.id)}
            >
              <RoomPreview room={w.id} title={w.label} />
              <span className="wing-tag">{w.tag}</span>
              <span className="wing-name">{w.label}</span>
              <span className="wing-description">{w.description}</span>
              <span className="wing-enter">Enter {w.label}</span>
            </button>
          ))}
        </div>
        <div className="wings-shortcuts">
          <button onClick={() => open("sessions")}>Activities</button>
          <button onClick={() => open("quests")}>Quest journal</button>
          <button onClick={() => open("shop")}>Personal rewards</button>
          <button onClick={() => open("curriculum")}>Curriculum</button>
          <button onClick={() => open("discovery")}>Discoveries</button>
          <button onClick={() => open("keepsakes")}>Keepsakes</button>
          <button onClick={() => open("history")}>History</button>
          <button onClick={() => open("save")}>Save & settings</button>
        </div>
        <footer className="arrival-footer">
          <img src="/ripple-mark.svg" alt="" />
          <span>
            RIPPLE ACADEMY<small>Through curiosity, to the stars.</small>
          </span>
          <span className="footer-promise">
            Your own pace. Your own becoming.
          </span>
        </footer>
      </section>
    </main>
  );
}

import { RewardSequence } from "../game/rewardSequence";
import { rewardKinds, type RewardKind } from "../domain/rewards";
import { cafeProps } from "../game/cafe";
import { interactionEntry } from "./interactions";
import { Navigation } from "../game/navigation";
import { furnitureForActivity } from "../game/furniture";
import { ScholarBehavior } from "../game/behavior";
import { heroineFrame } from "../heroine/animation";
import {
  calibratePlacement,
  calibrationRecord,
  neutralCalibration,
} from "./calibration";
import { baselinePlacementFor } from "./baseline";
import { preloadStudy } from "../game/studyArt";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import {
  animationCatalog,
  previewPose,
  previewFrame,
} from "../heroine/catalog";
import { heroine, frameNames } from "../heroine/assets";
import { preloadHeroine, heroineFrameBounds } from "../heroine/textures";
import { ScholarView } from "../game/scholarView";
import { roomDefinitions } from "../game/rooms";
import {
  placementFor,
  frameForPlacement,
  type Placement,
} from "../heroine/presentation";
import type { Interior } from "../domain/sessions";
import "./preview.css";

export default function HeroinePreview() {
  const params = new URLSearchParams(location.search);
  const initialRoom: Interior = [
    "grand-library",
    "personal-study",
    "observatory",
    "happy-cafe",
  ].includes(params.get("room") ?? "")
    ? (params.get("room") as Interior)
    : "personal-study";
  const [interactionMode, setInteractionMode] = useState(
    params.has("activity") || params.get("interaction") === "1",
  );
  const [interactionRoom, setInteractionRoom] = useState<Interior>(initialRoom);
  const [interactionId, setInteractionId] = useState(
    roomDefinitions[initialRoom].config.activities.some(
      (a) => a.id === params.get("activity"),
    )
      ? params.get("activity")!
      : roomDefinitions[initialRoom].sessionActivity,
  );
  const [sequenceKind, setSequenceKind] = useState<RewardKind>(
    rewardKinds.includes(params.get("sequence") as RewardKind)
      ? (params.get("sequence") as RewardKind)
      : "coffee",
  );
  const [sequenceKey, setSequenceKey] = useState(0);
  const [sequenceEnabled, setSequenceEnabled] = useState(
    initialRoom === "happy-cafe" &&
      rewardKinds.includes(params.get("sequence") as RewardKind),
  );
  const [holdActivity, setHoldActivity] = useState(
    params.get("trigger") === "1",
  );
  const [inspector, setInspector] = useState("");
  const [calibration, setCalibration] = useState(neutralCalibration);
  const [baseline, setBaseline] = useState(params.get("baseline") === "1");
  const [navigation, setNavigation] = useState(
    params.get("interaction") === "1" && params.get("nav") !== "0",
  );
  const [contact, setContact] = useState("");
  const [selected, setSelected] = useState(params.get("animation") ?? "work");
  const [context, setContext] = useState(params.get("context") ?? "matching");
  const [phase, setPhase] = useState("activity");
  const [phaseProgress, setPhaseProgress] = useState(0.5);
  const [replay, setReplay] = useState(params.get("trigger") === "1");
  const [replayKey, setReplayKey] = useState(0);
  const [replayStatus, setReplayStatus] = useState("");
  const [playing, setPlaying] = useState(!params.has("still")),
    [reduced, setReduced] = useState(
      params.get("reduced") === "1" ||
        matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [guides, setGuides] = useState(params.get("guides") !== "0"),
    [occlusion, setOcclusion] = useState(true),
    [raw, setRaw] = useState("");
  const [zoom, setZoom] = useState(Number(params.get("zoom") ?? 2)),
    [time, setTime] = useState(Number(params.get("t") ?? 0)),
    [frame, setFrame] = useState("");
  const host = useRef<HTMLDivElement>(null),
    game = useRef<Phaser.Game | undefined>(undefined);
  const catalogEntry =
    animationCatalog.find((e) => e.id === selected) ?? animationCatalog[8];
  const entry = interactionMode
    ? interactionEntry(interactionRoom, interactionId)
    : catalogEntry;
  const options = useRef({
    sequenceKind,
    sequenceKey,
    sequenceEnabled,
    holdActivity,
    phase,
    phaseProgress,
    replay,
    replayKey,
    calibration,
    baseline,
    navigation,
    entry,
    context,
    playing,
    reduced,
    guides,
    occlusion,
    raw,
    zoom,
    time,
  });
  options.current = {
    sequenceKind,
    sequenceKey,
    sequenceEnabled,
    holdActivity,
    phase,
    phaseProgress,
    replay,
    replayKey,
    calibration,
    baseline,
    navigation,
    entry,
    context,
    playing,
    reduced,
    guides,
    occlusion,
    raw,
    zoom,
    time,
  };
  const scrub = useRef<number | null>(null);
  useEffect(() => {
    let alive = true;
    const oldTitle = document.title;
    document.title = "Heroine studio · Ripple Academy";
    class Preview extends Phaser.Scene {
      private view!: ScholarView;
      private guide!: Phaser.GameObjects.Graphics;
      private elapsed = Number(params.get("t") ?? 0);
      private rewardSequence?: RewardSequence;
      private sequenceKey = -1;
      private simulation?: ScholarBehavior;
      private simulationKey = "";
      private simulationTime = 0;
      private leaving = false;
      private room = "";
      private lastEntry = "";
      private lastReport = 0;
      private routeKey = "";
      private route: { x: number; y: number }[] = [];
      preload() {
        preloadHeroine(this);
        const o = options.current;
        const room = o.entry.studioOnly
          ? "studio"
          : o.context === "matching"
            ? o.entry.room
            : o.context;
        if (room === "personal-study") preloadStudy(this);
        roomDefinitions[room as Interior]?.preload?.(this);
      }
      create() {
        const o = options.current,
          room = o.entry.studioOnly
            ? "studio"
            : o.context === "matching"
              ? o.entry.room
              : o.context;
        this.cameras.main.setBounds(0, 0, 1280, 720);
        this.room = room;
        this.lastEntry = o.entry.id;
        if (room === "studio") {
          const g = this.add.graphics().setDepth(-1);
          for (let x = 0; x < 1280; x += 32)
            for (let y = 0; y < 720; y += 32)
              g.fillStyle((x + y) % 64 === 0 ? 0x22313e : 0x1b2733).fillRect(
                x,
                y,
                32,
                32,
              );
        } else roomDefinitions[room as Interior].paint(this, true);
        this.view = new ScholarView(this, o.entry.room);
        this.guide = this.add.graphics().setDepth(1900);
        this.game.events.emit("preview-ready");
      }
      update(_now: number, delta: number) {
        const o = options.current,
          room = o.entry.studioOnly
            ? "studio"
            : o.context === "matching"
              ? o.entry.room
              : o.context;
        if (room !== this.room) {
          this.scene.restart();
          return;
        }
        if (this.lastEntry !== o.entry.id) {
          this.elapsed = 0;
          this.lastEntry = o.entry.id;
        }
        if (scrub.current !== null) {
          this.elapsed = scrub.current;
          scrub.current = null;
        } else if (o.playing && !document.hidden)
          this.elapsed =
            (this.elapsed + Math.min(delta / 1000, 0.05)) % o.entry.duration;
        const d = roomDefinitions[o.entry.room];
        const activity = d.config.activities.find(
          (a) => a.id === o.entry.activity,
        );
        const simKey = `${o.entry.id}:${o.replayKey}`;
        if (
          o.replay &&
          (!this.simulation ||
            this.simulationKey !== simKey ||
            (this.simulationTime > 24 && !o.holdActivity))
        ) {
          this.simulation = new ScholarBehavior(d.config, () => 0.5, d.start);
          this.simulation.setSession(o.entry.activity);
          this.simulationKey = simKey;
          this.simulationTime = 0;
          this.leaving = false;
        }
        if (
          o.sequenceEnabled &&
          d.id === "happy-cafe" &&
          this.sequenceKey !== o.sequenceKey
        ) {
          this.simulation = new ScholarBehavior(d.config, () => 0.5, d.start);
          this.rewardSequence = new RewardSequence(
            `preview-${o.sequenceKey}`,
            o.sequenceKind,
          );
          this.sequenceKey = o.sequenceKey;
        }
        if (!o.sequenceEnabled && this.rewardSequence) {
          this.rewardSequence = undefined;
          this.simulation = undefined;
        }
        if (!o.replay && !o.sequenceEnabled) this.simulation = undefined;
        if (this.simulation && o.playing) {
          this.simulationTime += Math.min(delta / 1000, 0.05);
          if (
            !o.sequenceEnabled &&
            this.simulation.engaged > 6 &&
            !this.leaving &&
            !o.holdActivity
          ) {
            this.simulation.walkTo(d.start);
            this.leaving = true;
          }
          this.rewardSequence?.step(
            this.simulation,
            Math.min(delta / 1000, 0.05),
          );
          this.simulation.step(Math.min(delta / 1000, 0.05));
        }
        const model = this.simulation ?? {
          settling: o.phase === "arrive" ? 1.2 * (1 - o.phaseProgress) : 0,
          departure:
            o.phase === "leave"
              ? Math.max(0.00001, 1.2 * (1 - o.phaseProgress))
              : 0,
          departingActivity: o.phase === "leave" ? activity : undefined,
          position: activity?.point ?? d.start,
          activity,
          state: previewPose(o.entry, this.elapsed).state,
          moving: !!o.entry.moving,
          pose: o.entry.pose,
          offsetY: activity?.offsetY ?? 0,
        };
        let placement: Placement = (
          o.baseline ? baselinePlacementFor : placementFor
        )(o.entry.room, model, o.reduced);
        placement = calibratePlacement(placement, o.calibration);
        if (room === "studio")
          placement = {
            x: 640,
            y: 470,
            depth: 600,
            key: o.entry.id,
            occluders: [],
          };
        if (!o.occlusion)
          placement = { ...placement, occluders: [], foreground: [] };
        const sim = this.simulation;
        const pose = sim
          ? {
              facing: sim.facing,
              moving: sim.moving,
              engaged: !!sim.activity,
              pose: sim.pose,
              activityId: sim.activity?.id,
              state: sim.state,
              clock: this.simulationTime,
              activityTime: sim.engaged,
            }
          : previewPose(o.entry, this.elapsed);
        const name =
          o.raw ||
          (sim
            ? heroineFrame(pose, o.reduced)
            : previewFrame(o.entry, this.elapsed, o.reduced));
        const displayedFrame = frameForPlacement(
          name,
          placement,
          pose.activityTime,
          o.reduced,
        );
        const silhouette = heroineFrameBounds(displayedFrame),
          spriteScale = placement.scale ?? 1;
        const spriteBounds = silhouette
          ? {
              x:
                placement.x +
                (silhouette.x - heroine.canvas.footX) * spriteScale,
              y:
                placement.y +
                (silhouette.y - heroine.canvas.footY) * spriteScale,
              width: silhouette.width * spriteScale,
              height: silhouette.height * spriteScale,
            }
          : undefined;
        this.view.render(pose, placement, delta / 1000, o.reduced, name);
        const cameraAnchor =
          (room === "personal-study" || room === "happy-cafe") && !o.replay
            ? furnitureForActivity(o.entry.activity)
            : undefined;
        this.cameras.main
          .setZoom(o.zoom)
          .centerOn(
            o.zoom > 1 ? (cameraAnchor?.contact.x ?? placement.x) : 640,
            o.zoom > 1
              ? cameraAnchor
                ? cameraAnchor.contact.y - 58 * cameraAnchor.scale
                : placement.y -
                  (o.entry.room === "personal-study"
                    ? 58 * (placement.scale ?? 1)
                    : 55)
              : 360,
          );
        this.guide.clear();
        if (o.guides) {
          this.guide
            .lineStyle(1, 0x8bdccf, 0.8)
            .strokeRect(
              placement.x - 48 * (placement.scale ?? 1),
              placement.y - 136 * (placement.scale ?? 1),
              96 * (placement.scale ?? 1),
              144 * (placement.scale ?? 1),
            );
          this.guide
            .lineStyle(2, 0xeed191)
            .lineBetween(
              placement.x - 10,
              placement.y,
              placement.x + 10,
              placement.y,
            )
            .lineBetween(
              placement.x,
              placement.y - 10,
              placement.x,
              placement.y + 10,
            );
          if (spriteBounds)
            this.guide
              .lineStyle(1, 0xc3d786, 1)
              .strokeRect(
                spriteBounds.x,
                spriteBounds.y,
                spriteBounds.width,
                spriteBounds.height,
              );
          this.guide.lineStyle(1, 0xf39887, 0.75);
          for (const r of placement.occluders)
            this.guide.strokeRect(r.x, r.y, r.width, r.height);
          for (const polygon of placement.foreground ?? [])
            this.guide.strokePoints(polygon, true);
          if (placement.seat)
            this.guide
              .lineStyle(2, 0xf4cb77)
              .strokeCircle(placement.seat.x, placement.seat.y, 5);
        }
        if (o.navigation && room !== "studio") {
          this.guide
            .lineStyle(1, 0xf3e8cf, 0.8)
            .strokeRect(model.position.x - 12, model.position.y - 7, 24, 12);
          const area = d.config.bounds;
          this.guide
            .lineStyle(2, 0x9badf0, 0.9)
            .strokeRect(
              area.left,
              area.top,
              area.right - area.left,
              area.bottom - area.top,
            );
          this.guide.lineStyle(1, 0xf39887, 0.7);
          for (const r of d.config.obstacles)
            this.guide.strokePoints(
              [
                { x: r.x, y: r.y },
                { x: r.x + r.w, y: r.y },
                { x: r.x + r.w, y: r.y + r.h },
                { x: r.x, y: r.y + r.h },
              ],
              true,
            );
          if (d.id === "happy-cafe")
            for (const prop of cafeProps) {
              this.guide
                .lineStyle(2, 0xf5cd85)
                .strokeCircle(prop.propAnchor.x, prop.propAnchor.y, 6);
              if ("foreground" in prop && prop.foreground) {
                const f = prop.foreground;
                this.guide
                  .lineStyle(1, 0xf39887)
                  .strokeRect(
                    prop.x - prop.w / 2 + f.x * prop.w,
                    prop.y - prop.h + f.y * prop.h,
                    f.w * prop.w,
                    f.h * prop.h,
                  );
              }
            }
          this.guide.fillStyle(0x8ed5c8, 0.9);
          for (const a of d.config.activities) {
            this.guide
              .fillStyle(0x8ed5c8, 0.9)
              .fillCircle(a.point.x, a.point.y, 4);
            const p = placementFor(d.id, {
              position: a.point,
              activity: a,
              state: a.state,
              moving: false,
              pose: a.pose,
              offsetY: a.offsetY ?? 0,
            });
            if (p.seat)
              this.guide
                .lineStyle(2, 0xf4cb77, 0.85)
                .strokeCircle(p.seat.x, p.seat.y, 5);
            if (p.x !== a.point.x || p.y !== a.point.y)
              this.guide.lineStyle(1, 0xf4cb77, 0.7).strokeCircle(p.x, p.y, 5);
            else
              this.guide
                .lineStyle(1, 0xaebcf3, 0.9)
                .strokeRect(a.point.x - 6, a.point.y - 6, 12, 12);
          }
          const routeKey = `${d.id}:${o.entry.activity}`;
          if (this.routeKey !== routeKey) {
            this.routeKey = routeKey;
            this.route = activity
              ? (new Navigation(d.config.bounds, d.config.obstacles).path(
                  d.start,
                  activity.point,
                ) ?? [])
              : [];
          }
          this.guide
            .lineStyle(2, 0x8ed5c8, 0.7)
            .strokePoints([d.start, ...(this.simulation?.path ?? this.route)]);
          this.guide
            .lineStyle(1, 0x8ed5c8, 0.7)
            .lineBetween(
              model.position.x,
              model.position.y,
              placement.x,
              placement.y,
            );
        }
        const currentActivity =
          this.rewardSequence && !this.rewardSequence.done
            ? d.config.activities.find(
                (a) => a.id === this.rewardSequence?.activity,
              )
            : (this.simulation?.activity ?? activity);
        if (_now - this.lastReport > 100) {
          this.lastReport = _now;
          if (alive) {
            setInspector(
              `Room: ${d.title} · Activity: ${currentActivity?.id ?? o.entry.activity} · State: ${model.state} · Facing: ${pose.facing} · Scale: ${(placement.scale ?? 1).toFixed(2)} · Contact: ${placement.key} · Transition: ${placement.transition?.kind ?? "none"} · Blend: ${this.view.blending ? "transitioning" : "settled"}`,
            );
            setReplayStatus(
              this.rewardSequence?.done
                ? "Reward preview complete · no save or gold changes"
                : this.simulation
                  ? `${this.simulation.label} · ${this.simulation.departure ? "standing up" : this.simulation.settling ? "settling into seat" : this.leaving ? "departure" : "approach / activity"}`
                  : "",
            );
            setContact(
              calibrationRecord(
                o.entry.room,
                currentActivity?.id ?? o.entry.activity,
                placement,
                {
                  walkableBounds: d.config.bounds,
                  collisionPolygons: d.config.obstacles.map((r) => [
                    { x: r.x, y: r.y },
                    { x: r.x + r.w, y: r.y },
                    { x: r.x + r.w, y: r.y + r.h },
                    { x: r.x, y: r.y + r.h },
                  ]),
                  approach: currentActivity?.point,
                  standingAnchor: currentActivity?.point,
                  exit: furnitureForActivity(currentActivity?.id)?.exit,
                  foregroundTextureCuts:
                    d.id === "happy-cafe"
                      ? cafeProps.filter((p) => "foreground" in p)
                      : undefined,
                  propAnchors:
                    d.id === "happy-cafe"
                      ? cafeProps.map((p) => ({
                          id: p.id,
                          anchor: p.propAnchor,
                          depth: p.depth,
                        }))
                      : undefined,
                  seatedAnchor: placement.seat,
                  orientation: pose.facing,
                  state: model.state,
                  animation: displayedFrame,
                  spriteBounds,
                },
              ),
            );
            setTime(this.elapsed);
            setFrame(displayedFrame);
          }
        }
      }
    }
    const instance = new Phaser.Game({
      type: params.get("renderer") === "canvas" ? Phaser.CANVAS : Phaser.AUTO,
      parent: host.current!,
      width: 1280,
      height: 720,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: "#1b2733",
      scene: [Preview],
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      fps: { target: 30 },
      audio: { noAudio: true },
      banner: false,
    });
    game.current = instance;
    const visibility = () => {
      if (document.hidden) instance.loop.sleep();
      else instance.loop.wake();
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      alive = false;
      document.title = oldTitle;
      document.removeEventListener("visibilitychange", visibility);
      instance.destroy(true);
    };
  }, []);
  return (
    <main className="animation-lab">
      <header>
        <div>
          <span>RIPPLE ACADEMY · DEVELOPMENT ONLY</span>
          <h1>Heroine animation studio</h1>
        </div>
        <a href="/">Return to the academy</a>
      </header>
      <div className="lab-layout">
        <aside>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={interactionMode}
              onChange={(e) => {
                setInteractionMode(e.target.checked);
                setReplay(false);
                setRaw("");
                setPhase("activity");
              }}
            />
            Room interaction calibration
          </label>
          {interactionMode && (
            <section className="room-interaction-controls">
              <label>
                Room
                <select
                  value={interactionRoom}
                  onChange={(e) => {
                    const room = e.target.value as Interior;
                    setInteractionRoom(room);
                    setInteractionId(roomDefinitions[room].sessionActivity);
                    setReplay(false);
                    setRaw("");
                    setContext("matching");
                    setPhase("activity");
                  }}
                >
                  {Object.values(roomDefinitions).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </label>
              {interactionRoom === "happy-cafe" && (
                <section>
                  <p>Reward sequence preview · no saves or gold</p>
                  <label>
                    Reward presentation
                    <select
                      value={sequenceKind}
                      onChange={(e) =>
                        setSequenceKind(e.target.value as RewardKind)
                      }
                    >
                      <option value="coffee">Coffee</option>
                      <option value="pastry">Coffee and pastry</option>
                      <option value="book">Book</option>
                      <option value="celebrate">Celebration</option>
                    </select>
                  </label>
                  <button
                    onClick={() => {
                      setSequenceKey((n) => n + 1);
                      setSequenceEnabled(true);
                      setReplay(false);
                      setPlaying(true);
                      setZoom(1);
                    }}
                  >
                    Preview reward sequence
                  </button>
                  <button
                    onClick={() => {
                      setSequenceEnabled(false);
                      setReplay(false);
                    }}
                  >
                    Stop reward preview
                  </button>
                </section>
              )}
              <label>
                Room activity
                <select
                  value={interactionId}
                  onChange={(e) => {
                    setInteractionId(e.target.value);
                    setReplay(false);
                    setRaw("");
                    setPhase("activity");
                  }}
                >
                  {roomDefinitions[interactionRoom].config.activities.map(
                    (a) => (
                      <option key={a.id} value={a.id}>
                        {a.label}
                      </option>
                    ),
                  )}
                </select>
              </label>
              <button
                onClick={() => {
                  setSequenceEnabled(false);
                  setHoldActivity(true);
                  setReplayKey((n) => n + 1);
                  setReplay(true);
                  setPlaying(true);
                  setContext("matching");
                  setRaw("");
                  setPhase("activity");
                  setNavigation(true);
                  setGuides(true);
                  setZoom(1);
                }}
              >
                Trigger selected activity
              </button>
            </section>
          )}
          {!interactionMode && (
            <label>
              Animation
              <select
                value={selected}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setRaw("");
                  scrub.current = 0;
                }}
              >
                {animationCatalog.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.label}
                  </option>
                ))}
              </select>
            </label>
          )}
          <details open={params.has("calibration")}>
            <summary>Interaction calibration</summary>
            <label className="lab-check">
              <input
                type="checkbox"
                checked={baseline}
                onChange={(e) => setBaseline(e.target.checked)}
              />
              Compare original 2.4 contacts
            </label>
            <label className="lab-check">
              <input
                type="checkbox"
                checked={navigation}
                onChange={(e) => setNavigation(e.target.checked)}
              />
              Collision & approach guides
            </label>
            {(["x", "y", "scale"] as const).map((k) => (
              <label key={k}>
                Contact {k}
                <input
                  aria-label={`Contact ${k}`}
                  type="number"
                  step={k === "scale" ? 0.05 : 1}
                  min={k === "scale" ? 0.1 : -500}
                  max={k === "scale" ? 4 : 500}
                  value={calibration[k]}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (Number.isFinite(v))
                      setCalibration((c) => ({ ...c, [k]: v }));
                  }}
                />
              </label>
            ))}
            <button onClick={() => setCalibration(neutralCalibration)}>
              Reset calibration offsets
            </button>
            <label>
              Transition phase
              <select
                value={phase}
                onChange={(e) => {
                  setPhase(e.target.value);
                  setReplay(false);
                  setPlaying(false);
                }}
              >
                <option value="activity">Occupied activity</option>
                <option value="arrive">Approach / sit down</option>
                <option value="leave">Stand up / leave</option>
              </select>
            </label>
            <label>
              Transition progress
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={phaseProgress}
                onChange={(e) => setPhaseProgress(Number(e.target.value))}
              />
            </label>
            <label>
              Calibration JSON
              <textarea readOnly rows={6} value={contact} />
            </label>
            <p>
              Offsets affect this preview only. Teal dots are reachable floor
              approaches; the connecting line is a furniture contact, not a walk
              through an obstacle. Compare matching room and transparent studio
              at fixed timeline positions before accepting changes.
            </p>
          </details>
          <label>
            Context
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
            >
              <option value="matching">Matching room / furniture</option>
              <option value="studio">Transparent-art inspection grid</option>
            </select>
          </label>
          <label>
            Raw frame (optional)
            <select
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setPlaying(false);
                setContext("studio");
              }}
            >
              <option value="">Use animation</option>
              {[...frameNames].map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </label>
          <label>
            Zoom
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            >
              <option value={1}>Room scale</option>
              <option value={2}>2× character detail</option>
              <option value={3}>3× character detail</option>
            </select>
          </label>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={reduced}
              onChange={(e) => setReduced(e.target.checked)}
            />
            Reduced-motion still
          </label>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={occlusion}
              onChange={(e) => setOcclusion(e.target.checked)}
            />
            Foreground occlusion
          </label>
          <label className="lab-check">
            <input
              type="checkbox"
              checked={guides}
              onChange={(e) => setGuides(e.target.checked)}
            />
            Canvas, foot anchor & mask guides
          </label>
          <button onClick={() => setPlaying(!playing)}>
            {playing ? "Pause playback" : "Play animation"}
          </button>
          <label>
            Timeline · {time.toFixed(2)} / {entry.duration}s
            <input
              type="range"
              min="0"
              max={entry.duration}
              step="0.05"
              value={time}
              onChange={(e) => {
                setPlaying(false);
                const t = Number(e.target.value);
                scrub.current = t;
                setTime(t);
              }}
            />
          </label>
          <div className="lab-step">
            <button
              onClick={() => {
                setPlaying(false);
                scrub.current = Math.max(0, time - 0.17);
              }}
            >
              − frame
            </button>
            <button
              onClick={() => {
                setPlaying(false);
                scrub.current = (time + 0.17) % entry.duration;
              }}
            >
              + frame
            </button>
          </div>
          <output aria-label="Current sprite frame">{frame}</output>
          <p>
            Gold cross: fixed contact anchor. Teal: common{" "}
            {heroine.canvas.width} × {heroine.canvas.height} canvas. Coral:
            foreground masks. Lavender: walking boundary / standing anchors;
            teal dots: approaches; gold circles: seated contacts; lime: visible
            sprite bounds.
          </p>
          <p>
            This studio does not mount the game application, open saved
            progress, or award XP/gold. Room art is unchanged.
          </p>
        </aside>
        <section className="lab-stage" aria-label="Animation preview">
          <div className="lab-replay">
            <button
              onClick={() => {
                setReplayKey((n) => n + 1);
                setReplay(true);
                setHoldActivity(false);
                setZoom(1);
                setPlaying(true);
                setNavigation(true);
              }}
            >
              Replay approach → sit → activity → leave
            </button>
            <button disabled={!replay} onClick={() => setReplay(false)}>
              Return to pose calibration
            </button>
            <output>{replayStatus}</output>
          </div>
          <output className="lab-inspector" aria-label="Interaction details">
            {inspector}
          </output>
          <div ref={host} className="lab-canvas" />
          <p>
            {entry.label} ·{" "}
            {raw
              ? "Single supplied frame"
              : "Shared production renderer and animation timing"}
          </p>
        </section>
      </div>
    </main>
  );
}

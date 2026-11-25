import { preloadStudy } from "../game/studyArt";
import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import {
  animationCatalog,
  previewPose,
  previewFrame,
} from "../heroine/catalog";
import { heroine, frameNames } from "../heroine/assets";
import { preloadHeroine } from "../heroine/textures";
import { ScholarView } from "../game/scholarView";
import { roomDefinitions } from "../game/rooms";
import { placementFor, type Placement } from "../heroine/presentation";
import type { Interior } from "../domain/sessions";
import "./preview.css";

export default function HeroinePreview() {
  const params = new URLSearchParams(location.search);
  const [selected, setSelected] = useState(params.get("animation") ?? "work");
  const [context, setContext] = useState(params.get("context") ?? "matching");
  const [playing, setPlaying] = useState(true),
    [reduced, setReduced] = useState(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [guides, setGuides] = useState(true),
    [occlusion, setOcclusion] = useState(true),
    [raw, setRaw] = useState("");
  const [zoom, setZoom] = useState(2),
    [time, setTime] = useState(0),
    [frame, setFrame] = useState("");
  const host = useRef<HTMLDivElement>(null),
    game = useRef<Phaser.Game | undefined>(undefined);
  const entry =
    animationCatalog.find((e) => e.id === selected) ?? animationCatalog[8];
  const options = useRef({
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
      private elapsed = 0;
      private room = "";
      private lastEntry = "";
      private lastReport = 0;
      preload() {
        preloadHeroine(this);
        const o = options.current;
        const room = o.entry.studioOnly
          ? "studio"
          : o.context === "matching"
            ? o.entry.room
            : o.context;
        if (room === "personal-study") preloadStudy(this);
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
        const model = {
          position: activity?.point ?? d.start,
          activity,
          state: previewPose(o.entry, this.elapsed).state,
          moving: !!o.entry.moving,
          pose: o.entry.pose,
          offsetY: activity?.offsetY ?? 0,
        };
        let placement: Placement = placementFor(o.entry.room, model);
        if (room === "studio")
          placement = {
            x: 640,
            y: 470,
            depth: 600,
            key: o.entry.id,
            occluders: [],
          };
        if (!o.occlusion) placement = { ...placement, occluders: [] };
        const pose = previewPose(o.entry, this.elapsed),
          name = o.raw || previewFrame(o.entry, this.elapsed, o.reduced);
        this.view.render(pose, placement, delta / 1000, o.reduced, name);
        this.cameras.main
          .setZoom(o.zoom)
          .centerOn(
            o.zoom > 1 ? placement.x : 640,
            o.zoom > 1 ? placement.y - 55 : 360,
          );
        this.guide.clear();
        if (o.guides) {
          this.guide
            .lineStyle(1, 0x8bdccf, 0.8)
            .strokeRect(placement.x - 48, placement.y - 136, 96, 144);
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
          this.guide.lineStyle(1, 0xf39887, 0.75);
          for (const r of placement.occluders)
            this.guide.strokeRect(r.x, r.y, r.width, r.height);
        }
        if (_now - this.lastReport > 100) {
          this.lastReport = _now;
          if (alive) {
            setTime(this.elapsed);
            setFrame(name);
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
            foreground masks.
          </p>
          <p>
            This studio does not mount the game application, open saved
            progress, or award XP/gold. Room art is unchanged.
          </p>
        </aside>
        <section className="lab-stage" aria-label="Animation preview">
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

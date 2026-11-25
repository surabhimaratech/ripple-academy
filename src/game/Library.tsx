import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { type Interaction } from "./movement";
import {
  roomDefinitions,
  nearestInteraction,
  type RoomDefinition,
} from "./rooms";
import { transition } from "./exterior";
import type { Location, ActivitySession } from "../domain/sessions";
import { ScholarBehavior } from "./behavior";
import { ScholarView } from "./scholarView";
export interface Celebration {
  xp: number;
  gold: number;
  key: number;
  levelUp: boolean;
  level: number;
}
interface Status {
  label: string;
  state: string;
  manual: number;
}
class GrandLibrary extends Phaser.Scene {
  private heroine!: Phaser.GameObjects.Sprite;
  private view!: ScholarView;
  private behavior!: ScholarBehavior;
  private prompt!: Phaser.GameObjects.Text;
  private thought!: Phaser.GameObjects.Text;
  private keys = new Set<string>();
  private blocked = false;
  private reduced = false;
  private clock = 0;
  private ambient: Phaser.Tweens.Tween[] = [];
  private lastPrompt = "";
  private lastStatus = "";
  private effects = new Set<Phaser.GameObjects.GameObject>();
  constructor(private definition: RoomDefinition) {
    super(definition.id);
  }
  create() {
    this.reduced = !!this.registry.get("reduced");
    this.blocked = !!this.registry.get("blocked");
    this.ambient = this.definition.paint(this, this.reduced);
    const cached = this.registry.get(`behavior:${this.definition.id}`) as
      ScholarBehavior | undefined;
    this.behavior =
      cached ??
      new ScholarBehavior(
        this.definition.config,
        Math.random,
        this.definition.start,
      );
    this.registry.set(`behavior:${this.definition.id}`, this.behavior);
    this.behavior.setAutonomous(this.registry.get("autonomous") !== false);
    this.behavior.setThoughts(this.registry.get("thoughts") !== false);
    this.view = new ScholarView(this);
    this.heroine = this.view.sprite;
    this.prompt = this.add
      .text(0, 0, "", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#f2dcad",
        backgroundColor: "#262330",
        padding: { x: 12, y: 9 },
        stroke: "#262330",
        strokeThickness: 2,
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(1200)
      .setVisible(false);
    this.thought = this.add
      .text(0, 0, "", {
        fontFamily: "Georgia",
        fontSize: "17px",
        color: "#eadcc8",
        backgroundColor: "#302b3bed",
        padding: { x: 13, y: 10 },
        wordWrap: { width: 235 },
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(1190)
      .setVisible(false);
    for (const hit of this.definition.hits) {
      this.add
        .zone(hit.x, hit.y, hit.w, hit.h)
        .setInteractive({ useHandCursor: true })
        .on(
          "pointerdown",
          (
            _p: Phaser.Input.Pointer,
            _x: number,
            _y: number,
            e: Phaser.Types.Input.EventData,
          ) => {
            e.stopPropagation();
            if (!this.blocked && _p.event?.target === this.game.canvas)
              this.behavior.useObject(hit.id);
          },
        );
    }
    this.input.on(
      "pointerdown",
      (
        pointer: Phaser.Input.Pointer,
        over: Phaser.GameObjects.GameObject[],
      ) => {
        if (
          !this.blocked &&
          !over.length &&
          pointer.event?.target === this.game.canvas
        )
          this.behavior.walkTo({ x: pointer.worldX, y: pointer.worldY });
      },
    );
    const input = (key: string, down: boolean) => {
      if (down) {
        if (
          (key === "e" || key === " ") &&
          !this.keys.has(key) &&
          !this.blocked
        ) {
          const object = nearestInteraction(
            this.definition,
            this.behavior.position,
          );
          if (object) this.behavior.useObject(object.id);
        }
        this.keys.add(key);
      } else this.keys.delete(key);
    };
    const clear = () => this.keys.clear();
    const blocked = (value: boolean) => {
      this.blocked = value;
      clear();
    };
    const motion = (value: boolean) => {
      this.reduced = value;
      if (value) {
        for (const effect of this.effects) {
          this.tweens.killTweensOf(effect);
          effect.destroy();
        }
        this.effects.clear();
      }
      this.ambient.forEach((t) => (value ? t.pause() : t.resume()));
    };
    const autonomy = (value: boolean) => this.behavior.setAutonomous(value);
    const thoughts = (value: boolean) => this.behavior.setThoughts(value);
    const session = () => {
      const active = this.registry.get("session") as
        ActivitySession | undefined;
      this.behavior.setSession(
        active?.room === this.definition.id
          ? this.definition.sessionActivity
          : undefined,
        active?.room === this.definition.id && active?.phase === "paused",
        this.definition.sessionVariations,
        this.definition.sessionIntro,
      );
    };
    const navigate = (next: Location) => transition(this, next, this.reduced);
    this.game.events.on("world-location", navigate);
    this.game.events.on("world-session", session);
    session();
    if (!this.reduced) this.cameras.main.fadeIn(450, 24, 27, 39);
    const events: [string, (...args: any[]) => void][] = [
      ["room-key", input],
      ["room-blur", clear],
      ["room-blocked", blocked],
      ["room-motion", motion],
      ["room-autonomy", autonomy],
      ["room-thoughts", thoughts],
    ];
    for (const [name, listener] of events) this.game.events.on(name, listener);
    this.game.events.on("celebrate", this.celebrate, this);
    this.events.once("shutdown", () => {
      this.game.events.off("world-location", navigate);
      this.game.events.off("world-session", session);
      for (const [name, listener] of events)
        this.game.events.off(name, listener);
      this.game.events.off("celebrate", this.celebrate, this);
    });
  }
  update(_time: number, delta: number) {
    if (!this.behavior) return;
    const dt = Math.min(delta / 1000, 0.05);
    this.clock += dt;
    const dx =
      Number(this.keys.has("d") || this.keys.has("arrowright")) -
      Number(this.keys.has("a") || this.keys.has("arrowleft"));
    const dy =
      Number(this.keys.has("s") || this.keys.has("arrowdown")) -
      Number(this.keys.has("w") || this.keys.has("arrowup"));
    if (!this.blocked && (dx || dy)) this.behavior.manual({ x: dx, y: dy }, dt);
    else this.behavior.step(dt);
    this.view.update(this.behavior, dt, this.reduced);
    for (const id of this.behavior.takeEvents())
      this.game.events.emit("room-interact", id);
    const object = nearestInteraction(this.definition, this.behavior.position);
    const label = object ? `[E] ${object.label}` : "";
    this.prompt
      .setText(label)
      .setVisible(
        !this.blocked && !!label && this.behavior.manualRemaining > 0,
      );
    if (object)
      this.prompt.setPosition(
        Math.min(1090, Math.max(190, object.point.x)),
        object.point.y - 110,
      );
    if (label !== this.lastPrompt) {
      this.lastPrompt = label;
      this.game.events.emit(
        "room-prompt",
        label || "Click the floor to walk · WASD / arrows · E to interact",
      );
    }
    const thought = this.behavior.thought;
    this.thought.setVisible(!!thought && !this.prompt.visible);
    if (thought)
      this.thought
        .setText(thought.text)
        .setPosition(
          Math.min(1125, Math.max(155, this.heroine.x)),
          this.heroine.y - 109,
        );
    const status = {
      label: this.behavior.label,
      state: this.behavior.state,
      manual: Math.ceil(this.behavior.manualRemaining),
    };
    const key = JSON.stringify(status);
    if (key !== this.lastStatus) {
      this.lastStatus = key;
      this.game.events.emit("room-status", status);
    }
  }
  celebrate(event: Celebration) {
    this.behavior.celebrate();
    const { xp, gold, levelUp } = event;
    const x = this.heroine.x,
      y = this.heroine.y - 95;
    const text = this.add
      .text(x, y, `+${xp} XP  ·  +${gold} gold`, {
        fontFamily: "monospace",
        fontSize: "23px",
        color: "#ffe3a2",
        stroke: "#242337",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setDepth(1500);
    this.effects.add(text);
    text.once("destroy", () => this.effects.delete(text));
    this.heroine.setTint(0xffe8bb);
    this.time.delayedCall(1100, () => this.heroine.clearTint());
    if (this.reduced) {
      this.time.delayedCall(2200, () => text.destroy());
      return;
    }
    this.tweens.add({
      targets: text,
      y: y - 65,
      alpha: 0,
      duration: 2400,
      onComplete: () => text.destroy(),
    });
    for (let i = 0; i < 11; i++) {
      const coin = this.add
        .graphics()
        .setPosition(x, this.heroine.y - 45)
        .setDepth(1400);
      this.effects.add(coin);
      coin.once("destroy", () => this.effects.delete(coin));
      coin.fillStyle(0x7d553d).fillRect(-7, -9, 14, 18);
      coin.fillStyle(0xf0c76e).fillRect(-6, -8, 12, 15);
      coin.fillStyle(0xffe6a2).fillRect(-3, -6, 3, 10);
      coin.fillStyle(0xc08a42).fillRect(3, -5, 2, 9);
      this.tweens.add({
        targets: coin,
        x: x + (i - 5) * 18,
        y: this.heroine.y - 110 - Math.sin(i) * 25,
        duration: 480 + i * 35,
        ease: "Cubic.Out",
        onComplete: () => {
          this.tweens.add({
            targets: coin,
            y: coin.y - 45,
            alpha: 0,
            scaleX: 0.15,
            duration: 600,
            onComplete: () => coin.destroy(),
          });
        },
      });
    }
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const star = this.add
        .text(x, y + 40, "✦", {
          fontSize: levelUp ? "25px" : "16px",
          color: i % 2 ? "#dcbbf1" : "#ffdda0",
        })
        .setDepth(1400);
      this.effects.add(star);
      star.once("destroy", () => this.effects.delete(star));
      this.tweens.add({
        targets: star,
        x: x + Math.cos(angle) * (levelUp ? 155 : 85),
        y: y + 40 + Math.sin(angle) * 85,
        alpha: 0,
        duration: 1700,
        onComplete: () => star.destroy(),
      });
    }
    if (levelUp) {
      const halo = this.add
        .graphics()
        .setPosition(x, this.heroine.y - 40)
        .setDepth(1300);
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        halo
          .fillStyle(i % 2 ? 0xdac4ed : 0xf4d294, 0.9)
          .fillRect(
            Math.round(Math.cos(a) * 36),
            Math.round(Math.sin(a) * 36),
            3,
            3,
          );
      }
      this.effects.add(halo);
      halo.once("destroy", () => this.effects.delete(halo));
      this.tweens.add({
        targets: halo,
        scale: 3,
        alpha: 0,
        duration: 1900,
        onComplete: () => halo.destroy(),
      });
    }
  }
}
export const locations = roomDefinitions;
export function Library({
  celebration,
  blocked,
  reduced,
  autonomous,
  thoughts,
  onInteract,
  location,
  session,
  parallax,
  day,
  onNavigate,
}: {
  celebration: Celebration | null;
  blocked: boolean;
  reduced: boolean;
  autonomous: boolean;
  thoughts: boolean;
  onInteract: (id: Interaction) => void;
  location: Location;
  session: ActivitySession | undefined;
  parallax: number;
  day: string;
  onNavigate: (id: Location) => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    game = useRef<Phaser.Game | undefined>(undefined);
  const callback = useRef(onInteract);
  callback.current = onInteract;
  const navigationCallback = useRef(onNavigate);
  navigationCallback.current = onNavigate;
  const [prompt, setPrompt] = useState(
    "Click the floor to walk · WASD / arrows · E to interact",
  );
  const [status, setStatus] = useState<Status>({
    label: "Settling into a quiet corner",
    state: "idle",
    manual: 0,
  });
  useEffect(() => {
    const instance = new Phaser.Game({
      type: Phaser.AUTO,
      parent: host.current!,
      width: 1280,
      height: 720,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: "#21202b",
      scene: Object.values(roomDefinitions)
        .sort((a, b) => (a.id === location ? -1 : b.id === location ? 1 : 0))
        .map((def) => new GrandLibrary(def)),
      scale: {
        mode: Phaser.Scale.ENVELOP,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      fps: { target: 30, forceSetTimeOut: true },
      audio: { noAudio: true },
      callbacks: {
        preBoot: (g) => {
          g.registry.set("reduced", reduced);
          g.registry.set("blocked", blocked);
          g.registry.set("autonomous", autonomous);
          g.registry.set("thoughts", thoughts);
          g.registry.set("location", location);
          g.registry.set("session", session);
          g.registry.set("parallax", parallax);
          g.registry.set("day", day);
        },
      },
    });
    game.current = instance;
    instance.events.on("room-interact", (id: Interaction) =>
      callback.current(id),
    );
    instance.events.on("room-prompt", setPrompt);
    instance.events.on("room-status", setStatus);
    instance.events.on("university-go", (id: Location) =>
      navigationCallback.current(id),
    );
    const visibility = () => {
      instance.events.emit("room-blur");
      if (document.hidden) {
        instance.scene
          .getScenes(true)
          .forEach((scene) => instance.scene.pause(scene.scene.key));
        instance.loop.sleep();
      } else {
        instance.loop.wake();
        instance.scene
          .getScenes(false)
          .filter((scene) => scene.scene.isPaused())
          .forEach((scene) => instance.scene.resume(scene.scene.key));
      }
    };
    const resize = new ResizeObserver((entries) => {
      const size = entries[0]?.contentRect;
      if (instance.isBooted && size && size.width > 0 && size.height > 0)
        instance.scale.setParentSize(size.width, size.height);
    });
    resize.observe(host.current!);
    document.addEventListener("visibilitychange", visibility);
    instance.events.once(Phaser.Core.Events.READY, () => {
      if (document.hidden) visibility();
    });
    return () => {
      resize.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      instance.destroy(true);
    };
  }, []);
  useEffect(() => {
    game.current?.registry.set("blocked", blocked);
    game.current?.events.emit("room-blocked", blocked);
  }, [blocked]);
  useEffect(() => {
    game.current?.registry.set("reduced", reduced);
    game.current?.events.emit("room-motion", reduced);
  }, [reduced]);
  useEffect(() => {
    game.current?.registry.set("autonomous", autonomous);
    game.current?.events.emit("room-autonomy", autonomous);
  }, [autonomous]);
  useEffect(() => {
    game.current?.registry.set("thoughts", thoughts);
    game.current?.events.emit("room-thoughts", thoughts);
  }, [thoughts]);

  useEffect(() => {
    game.current?.registry.set("location", location);
    game.current?.events.emit("world-location", location);
  }, [location]);
  useEffect(() => {
    game.current?.registry.set("session", session);
    game.current?.events.emit("world-session");
  }, [session?.id, session?.runId, session?.phase]);
  useEffect(() => {
    game.current?.registry.set("parallax", parallax);
    game.current?.events.emit("world-parallax", parallax);
  }, [parallax]);
  useEffect(() => {
    game.current?.registry.set("day", day);
    game.current?.events.emit("world-day");
  }, [day]);
  useEffect(() => {
    if (celebration) game.current?.events.emit("celebrate", celebration);
  }, [celebration]);
  return (
    <>
      <div
        className="library"
        ref={host}
        tabIndex={0}
        role="region"
        aria-label={
          location === "university"
            ? "Explore your university"
            : `Explore ${roomDefinitions[location].title}`
        }
        aria-describedby="room-controls"
        onPointerDown={() => {
          if (!blocked) host.current?.focus();
        }}
        onBlur={() => game.current?.events.emit("room-blur")}
        onKeyDown={(e) => {
          const key = e.key.toLowerCase();
          if (
            [
              "w",
              "a",
              "s",
              "d",
              "arrowup",
              "arrowdown",
              "arrowleft",
              "arrowright",
              "e",
              " ",
            ].includes(key) &&
            !blocked
          ) {
            e.preventDefault();
            game.current?.events.emit("room-key", key, true);
          }
        }}
        onKeyUp={(e) =>
          game.current?.events.emit("room-key", e.key.toLowerCase(), false)
        }
      />
      {location !== "university" && (
        <div className="activity-indicator" data-state={status.state}>
          <span aria-hidden="true">✧</span>
          <div>
            <strong>{status.label}</strong>
            <small>
              {!autonomous
                ? "Manual-only mode"
                : status.manual
                  ? `Following your lead · autonomy in ${status.manual}s`
                  : "At her own pace"}
            </small>
          </div>
        </div>
      )}
      {location !== "university" && (
        <div className="room-controls" id="room-controls">
          <span className="keycap">W A S D</span>
          <span>
            {blocked
              ? "The scholar continues her day while you use the folio."
              : prompt}
          </span>
        </div>
      )}
    </>
  );
}

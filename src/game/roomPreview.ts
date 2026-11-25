import { preloadStudy } from "./studyArt";
import Phaser from "phaser";
import { roomDefinitions } from "./rooms";
import { preloadHeroine } from "../heroine/textures";
import { ScholarView } from "./scholarView";
import { ScholarBehavior } from "./behavior";
import type { Interior } from "../domain/sessions";
const previews = new Map<Interior, Promise<string>>();
let queue: Promise<unknown> = Promise.resolve();
/** Snapshot the actual original room painters once, then destroy the preview engine. No save access. */
export function renderRoomPreview(id: Interior): Promise<string> {
  if (previews.has(id)) return previews.get(id)!;
  const task = queue.then(
    () =>
      new Promise<string>((resolve, reject) => {
        const host = document.createElement("div");
        host.className = "preview-render-host";
        document.body.append(host);
        let game: Phaser.Game;
        let finished = false;
        const cleanup = () => {
          game?.destroy(true);
          host.remove();
        };
        const timeout = setTimeout(() => {
          if (!finished) {
            finished = true;
            cleanup();
            reject(Error("Room preview timed out."));
          }
        }, 12000);
        class Preview extends Phaser.Scene {
          constructor() {
            super(`preview-${id}`);
          }
          preload() {
            preloadHeroine(this);
            roomDefinitions[id].preload?.(this);
            if (id === "personal-study") preloadStudy(this);
          }
          create() {
            try {
              const d = roomDefinitions[id];
              d.paint(this, true);
              const scholar = new ScholarBehavior(d.config, () => 0.5, d.start);
              new ScholarView(this, d.id).update(scholar, 0, true);
              this.game.events.once(Phaser.Core.Events.POST_RENDER, () => {
                (
                  this.game.renderer as Phaser.Renderer.Canvas.CanvasRenderer
                ).snapshot((image) => {
                  if (finished) return;
                  finished = true;
                  clearTimeout(timeout);
                  if (image instanceof HTMLImageElement) resolve(image.src);
                  else reject(Error("Preview could not render."));
                  queueMicrotask(cleanup);
                });
              });
            } catch (e) {
              finished = true;
              clearTimeout(timeout);
              cleanup();
              reject(e);
            }
          }
        }
        game = new Phaser.Game({
          type: Phaser.CANVAS,
          parent: host,
          width: 1280,
          height: 720,
          pixelArt: true,
          backgroundColor: "#171b27",
          scene: [Preview],
          audio: { noAudio: true },
          fps: { target: 30, forceSetTimeOut: true },
          banner: false,
        });
      }),
  );
  queue = task.catch(() => {});
  previews.set(id, task);
  return task;
}

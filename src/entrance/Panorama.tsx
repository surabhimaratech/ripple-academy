import { useEffect, useRef, useState } from "react";
import { entranceArt } from "./assets";
import { scrollProgress, layerOffset, interpolate } from "./scroll";
function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(Error(`Artwork could not load: ${src}`));
    image.src = src;
  });
}
export function Panorama({
  reduced,
  intensity,
}: {
  reduced: boolean;
  intensity: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const options = useRef({ reduced, intensity });
  options.current = { reduced, intensity };
  const wake = useRef<() => void>(() => {});
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const canvas = ref.current!,
      ctx = canvas.getContext("2d", { alpha: false })!;
    let disposed = false,
      frame = 0,
      visible = true,
      last = 0,
      lastDraw = 0,
      elapsed = 0,
      current = 0;
    let images: HTMLImageElement[] = [];
    const section = canvas.closest("section")!;
    const draw = (now: number) => {
      frame = 0;
      if (disposed || document.hidden || !visible || !images.length) return;
      const opt = options.current;
      const dt = last ? Math.min((now - last) / 1000, 0.06) : 0;
      last = now;
      if (!opt.reduced) elapsed += dt;
      const target = scrollProgress(
        window.scrollY,
        section.offsetTop,
        section.offsetHeight,
        window.innerHeight,
      );
      current = opt.reduced ? target : interpolate(current, target, dt || 0.05);
      if (now - lastDraw > 48 || opt.reduced) {
        lastDraw = now;
        const width = canvas.clientWidth,
          height = canvas.clientHeight;
        if (
          canvas.width !== Math.round(width) ||
          canvas.height !== Math.round(height)
        ) {
          canvas.width = Math.round(width);
          canvas.height = Math.round(height);
        }
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "#091922";
        ctx.fillRect(0, 0, width, height);
        const scale = Math.max(width / 1600, height / 1000);
        ctx.save();
        ctx.translate(width / 2, height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-800, -500);
        const water = ctx.createLinearGradient(0, 750, 0, 1100);
        water.addColorStop(0, "#1c3440");
        water.addColorStop(1, "#071722");
        ctx.fillStyle = water;
        ctx.fillRect(-300, -100, 2200, 1400);
        for (let i = 0; i < entranceArt.layers.length; i++) {
          const layer = entranceArt.layers[i];
          const [x, y, w, h] = layer.box;
          const offset = layerOffset(
            current,
            layer.depth,
            1000,
            opt.intensity,
            opt.reduced,
          );
          const drift =
            layer.id === "atmosphere" && !opt.reduced
              ? Math.sin(elapsed * 0.025) * 14
              : 0;
          ctx.drawImage(images[i], x + drift, y + offset, w, h);
          if (layer.id === "lake") {
            const architecture = entranceArt.layers.find(
              (l) => l.id === "architecture",
            )!;
            const [ax, ay, aw, ah] = architecture.box;
            const horizon = 852 + offset;
            ctx.save();
            ctx.beginPath();
            ctx.rect(-250, horizon, 2100, 500);
            ctx.clip();
            ctx.translate(0, horizon);
            ctx.scale(1, -0.32);
            ctx.globalAlpha = 0.18;
            ctx.drawImage(images[3], ax, ay - 852, aw, ah);
            ctx.restore();
            const fade = ctx.createLinearGradient(0, horizon, 0, 1100);
            fade.addColorStop(0, "rgba(7,23,34,0)");
            fade.addColorStop(1, "rgba(7,23,34,.95)");
            ctx.fillStyle = fade;
            ctx.fillRect(-250, horizon, 2100, 500);
            for (let j = 0; j < 28; j++) {
              const phase = opt.reduced ? j * 0.6 : elapsed * 0.22 + j * 0.6;
              const ry = horizon + 12 + j * 7 + Math.sin(phase) * 2;
              ctx.strokeStyle =
                j % 5 === 0 ? "rgba(203,178,121,.18)" : "rgba(172,192,192,.12)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              const rx = 500 + ((j * 113) % 830);
              ctx.moveTo(rx + Math.sin(phase) * 5, ry);
              ctx.lineTo(rx + 12 + ((j * 17) % 77), ry);
              ctx.stroke();
            }
          }
        }
        // Independent, sparse window/lantern warmth over the original painted facade.
        if (!opt.reduced) {
          const [ax, ay, aw, ah] = entranceArt.layers[3].box;
          const off = layerOffset(current, 0.1, 1000, opt.intensity, false);
          for (const [x, y] of [
            [915, 215],
            [1000, 447],
            [305, 448],
            [665, 394],
            [1340, 448],
            [993, 643],
          ]) {
            const px = ax + (x / 1536) * aw,
              py = ay + (y / 1024) * ah + off;
            const glow = ctx.createRadialGradient(px, py, 0, px, py, 13);
            glow.addColorStop(
              0,
              `rgba(239,194,119,${0.055 + Math.sin(elapsed * 1.3 + x) * 0.014})`,
            );
            glow.addColorStop(1, "rgba(239,194,119,0)");
            ctx.fillStyle = glow;
            ctx.fillRect(px - 13, py - 13, 26, 26);
          }
        }
        // Tiny owl and fireflies belong to the environment, not the progression system.
        if (!opt.reduced) {
          const phase = (elapsed + 17) % 83;
          if (phase < 6) {
            const x = -40 + (phase / 6) * 1680,
              y = 170 + Math.sin(phase) * 16,
              wing = 5 + Math.sin(elapsed * 7) * 4;
            ctx.fillStyle = "#91a2aa";
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.moveTo(x - 9, y - wing);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 9, y - wing);
            ctx.lineTo(x + 3, y + 3);
            ctx.lineTo(x - 3, y + 3);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
          for (let j = 0; j < 10; j++) {
            const x = 70 + ((j * 163) % 1480) + Math.sin(elapsed * 0.2 + j) * 6,
              y = 820 + ((j * 31) % 140) + Math.cos(elapsed * 0.3 + j) * 4;
            ctx.globalAlpha = 0.2 + Math.sin(elapsed + j) * 0.15;
            ctx.fillStyle = "#d4ba7c";
            ctx.fillRect(x, y, 2, 2);
          }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
      }
      if (!opt.reduced) frame = requestAnimationFrame(draw);
    };
    const schedule = () => {
      if (!frame && !disposed && !document.hidden && visible) {
        last = 0;
        frame = requestAnimationFrame(draw);
      }
    };
    wake.current = schedule;
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      } else schedule();
    };
    const scrolling = () => {
      if (options.current.reduced) schedule();
    };
    const resize = new ResizeObserver(schedule);
    resize.observe(canvas);
    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        }
      },
      { threshold: 0 },
    );
    observer.observe(section);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", scrolling, { passive: true });
    Promise.all(entranceArt.layers.map((l) => loadImage(l.src)))
      .then((result) => {
        if (!disposed) {
          images = result;
          schedule();
        }
      })
      .catch(() => {
        if (!disposed) setFailed(true);
      });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", scrolling);
    };
  }, []);
  useEffect(() => wake.current(), [reduced, intensity]);
  return (
    <>
      <canvas
        ref={ref}
        className="arrival-panorama"
        aria-label="Ripple Academy: an interconnected moonlit Gothic university rising above a forest lake, with warm windows, spires and a copper observatory dome."
        role="img"
      />
      {failed && (
        <p className="art-fallback">
          The academy artwork could not load. You can still enter through the
          academic wings below.
        </p>
      )}
    </>
  );
}

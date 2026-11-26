export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
/** Fractional source dimensions are partitioned without overlapping or dropping pixels. */
export function atlasCell(
  width: number,
  height: number,
  columns: number,
  rows: number,
  column: number,
  row: number,
): Rect {
  const x = Math.floor((column * width) / columns),
    y = Math.floor((row * height) / rows);
  return {
    x,
    y,
    width: Math.floor(((column + 1) * width) / columns) - x,
    height: Math.floor(((row + 1) * height) / rows) - y,
  };
}
/** Ignore isolated generator specks when finding the character's actual silhouette. */
export function silhouetteBounds(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): Rect {
  const seen = new Uint8Array(width * height),
    queue = new Int32Array(width * height);
  let largest = 0,
    best: Rect | undefined;
  for (let start = 0; start < seen.length; start++) {
    if (seen[start] || rgba[start * 4 + 3] < 48) continue;
    let head = 0,
      tail = 1,
      minX = width,
      minY = height,
      maxX = 0,
      maxY = 0;
    queue[0] = start;
    seen[start] = 1;
    while (head < tail) {
      const i = queue[head++],
        x = i % width,
        y = Math.floor(i / width);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
      for (const n of [
        x > 0 ? i - 1 : -1,
        x < width - 1 ? i + 1 : -1,
        y > 0 ? i - width : -1,
        y < height - 1 ? i + width : -1,
      ]) {
        if (n >= 0 && !seen[n] && rgba[n * 4 + 3] >= 48) {
          seen[n] = 1;
          queue[tail++] = n;
        }
      }
    }
    if (tail > largest) {
      largest = tail;
      best = {
        x: minX,
        y: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };
    }
  }
  if (!best || largest < 12)
    throw Error("Heroine frame has no usable transparent silhouette.");
  // Retain fine disconnected hair and quill detail close to the main silhouette.
  const x = Math.max(0, best.x - 3),
    y = Math.max(0, best.y - 3);
  return {
    x,
    y,
    width: Math.min(width, best.x + best.width + 3) - x,
    height: Math.min(height, best.y + best.height + 3) - y,
  };
}
export function anchoredFrame(
  bounds: Rect,
  targetHeight: number,
  canvas: { width: number; height: number; footX: number; footY: number },
) {
  const scale = Math.min(
    targetHeight / bounds.height,
    (canvas.width - 8) / bounds.width,
  );
  const width = Math.round(bounds.width * scale),
    height = Math.round(bounds.height * scale);
  return {
    x: Math.round(canvas.footX - width / 2),
    y: canvas.footY - height,
    width,
    height,
  };
}

/** One scale and horizontal reference for a related loop; hands cannot recenter the whole body. */
export function registeredFrames(
  bounds: Rect[],
  targetHeight: number,
  canvas: { width: number; height: number; footX: number; footY: number },
  groundX?: number[],
): Rect[] {
  const left = Math.min(...bounds.map((b) => b.x)),
    right = Math.max(...bounds.map((b) => b.x + b.width));
  const scale = Math.min(
    targetHeight / Math.max(...bounds.map((b) => b.height)),
    (canvas.width - 8) /
      (groundX
        ? Math.max(...bounds.map((b, i) => groundX[i] - b.x)) +
          Math.max(...bounds.map((b, i) => b.x + b.width - groundX[i]))
        : right - left),
  );
  const center = (left + right) / 2;
  return bounds.map((b, i) => ({
    x: Math.round(canvas.footX + (b.x - (groundX?.[i] ?? center)) * scale),
    y: canvas.footY - Math.round(b.height * scale),
    width: Math.round(b.width * scale),
    height: Math.round(b.height * scale),
  }));
}

/** Register newly authored standing frames by their boots, not the changing hand silhouette. */
export function groundContactX(
  rgba: Uint8ClampedArray,
  width: number,
  bounds: Rect,
) {
  let mass = 0,
    sum = 0;
  for (
    let y = Math.floor(bounds.y + bounds.height * 0.92);
    y < bounds.y + bounds.height;
    y++
  )
    for (let x = bounds.x; x < bounds.x + bounds.width; x++) {
      const alpha = rgba[(y * width + x) * 4 + 3];
      if (alpha >= 128) {
        mass += alpha;
        sum += x * alpha;
      }
    }
  if (!mass) throw Error("Sprite has no grounded foot contact.");
  return sum / mass;
}

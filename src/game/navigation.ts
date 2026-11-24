import { canStand, move, type Point, type Obstacle, bounds } from "./movement";
export type RoomBounds = typeof bounds;
export class Navigation {
  private nodes: Point[] = [];
  private neighbors: number[][] = [];
  constructor(
    readonly area: RoomBounds,
    readonly solids: Obstacle[],
    readonly spacing = 16,
  ) {
    const indices = new Map<string, number>();
    for (let y = area.top; y <= area.bottom; y += spacing)
      for (let x = area.left; x <= area.right; x += spacing) {
        if (this.valid({ x, y })) {
          indices.set(`${x},${y}`, this.nodes.length);
          this.nodes.push({ x, y });
        }
      }
    this.neighbors = this.nodes.map((p) => {
      const result: number[] = [];
      for (const dx of [-spacing, 0, spacing])
        for (const dy of [-spacing, 0, spacing]) {
          if (!dx && !dy) continue;
          const index = indices.get(`${p.x + dx},${p.y + dy}`);
          if (index !== undefined && this.clear(p, this.nodes[index]))
            result.push(index);
        }
      return result;
    });
  }
  valid(p: Point) {
    return canStand(p, this.solids, this.area);
  }
  clear(a: Point, b: Point) {
    const count = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 2);
    for (let i = 0; i <= count; i++) {
      const t = count ? i / count : 0;
      if (!this.valid({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }))
        return false;
    }
    return true;
  }
  step(p: Point, direction: Point, dt: number, speed = 150) {
    return move(p, direction, dt, this.solids, speed, this.area);
  }
  path(start: Point, goal: Point): Point[] | null {
    if (!this.valid(start) || !this.valid(goal)) return null;
    if (this.clear(start, goal)) return [{ ...goal }];
    const nearest = (p: Point) =>
      this.nodes
        .map((n, i) => ({ i, d: Math.hypot(n.x - p.x, n.y - p.y) }))
        .sort((a, b) => a.d - b.d)
        .find((n) => this.clear(p, this.nodes[n.i]))?.i;
    const from = nearest(start),
      to = nearest(goal);
    if (from === undefined || to === undefined) return null;
    const open = new Set([from]),
      previous = new Map<number, number>(),
      cost = new Map([[from, 0]]);
    while (open.size) {
      let current = -1,
        best = Infinity;
      for (const i of open) {
        const n = this.nodes[i];
        const score = cost.get(i)! + Math.hypot(n.x - goal.x, n.y - goal.y);
        if (score < best) {
          best = score;
          current = i;
        }
      }
      if (current === to) {
        const path = [this.nodes[to]];
        let n = to;
        while (previous.has(n)) {
          n = previous.get(n)!;
          path.unshift(this.nodes[n]);
        }
        path.push({ ...goal });
        const smooth: Point[] = [];
        let anchor = start;
        for (let i = 0; i < path.length;) {
          let j = i;
          while (j + 1 < path.length && this.clear(anchor, path[j + 1])) j++;
          smooth.push({ ...path[j] });
          anchor = path[j];
          i = j + 1;
        }
        return smooth;
      }
      open.delete(current);
      for (const next of this.neighbors[current]) {
        const p = this.nodes[current],
          q = this.nodes[next];
        const proposed = cost.get(current)! + Math.hypot(p.x - q.x, p.y - q.y);
        if (proposed < (cost.get(next) ?? Infinity)) {
          cost.set(next, proposed);
          previous.set(next, current);
          open.add(next);
        }
      }
    }
    return null;
  }
}

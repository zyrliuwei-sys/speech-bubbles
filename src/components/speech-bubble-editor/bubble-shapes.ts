/**
 * Bubble shape generators.
 *
 * Each builder returns { fills, strokes } — arrays of SVG path `d` strings.
 * The SAME strings feed both the on-screen `<path d>` preview and the exported
 * canvas via `new Path2D(d)`, so what you see is what you get.
 *
 * All coordinates are in local box pixels with the box origin at (0,0) and size
 * (w, h). The tail tip (when present) is expressed in the same local space and
 * may lie outside the box.
 */

import type { BubbleType } from './types';

export interface BubbleShape {
  /** Closed sub-paths to fill (drawn first, unioned by overlapping fills). */
  fills: string[];
  /** Open/closed sub-paths to stroke (outlines). */
  strokes: string[];
}

const r2 = (n: number) => Math.round(n * 100) / 100;

/** A rounded rectangle path. */
export function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  rad: number
): string {
  const r = Math.max(0, Math.min(rad, w / 2, h / 2));
  const xr = x + w;
  const yb = y + h;
  return [
    `M${r2(x + r)},${r2(y)}`,
    `H${r2(xr - r)}`,
    `A${r2(r)},${r2(r)} 0 0 1 ${r2(xr)},${r2(y + r)}`,
    `V${r2(yb - r)}`,
    `A${r2(r)},${r2(r)} 0 0 1 ${r2(xr - r)},${r2(yb)}`,
    `H${r2(x + r)}`,
    `A${r2(r)},${r2(r)} 0 0 1 ${r2(x)},${r2(yb - r)}`,
    `V${r2(y + r)}`,
    `A${r2(r)},${r2(r)} 0 0 1 ${r2(x + r)},${r2(y)}`,
    'Z',
  ].join(' ');
}

/** A full circle as a path (works with Path2D and <path>). */
export function circlePath(cx: number, cy: number, r: number): string {
  const rr = r2(r);
  return `M${r2(cx - rr)},${r2(cy)} a ${rr},${rr} 0 1 0 ${r2(rr * 2)},0 a ${rr},${rr} 0 1 0 ${r2(-rr * 2)},0 Z`;
}

/** Where a ray from the box center through the tip exits the rectangle. */
function edgeExit(w: number, h: number, tipX: number, tipY: number) {
  const cx = w / 2;
  const cy = h / 2;
  let dx = tipX - cx;
  let dy = tipY - cy;
  const dist = Math.hypot(dx, dy) || 1;
  if (dist < 1) {
    // Default: point the tail downward.
    dx = 0;
    dy = 1;
  }
  const ux = dx / (Math.hypot(dx, dy) || 1);
  const uy = dy / (Math.hypot(dx, dy) || 1);
  const ts: number[] = [];
  if (ux !== 0) ts.push(((ux > 0 ? w : 0) - cx) / ux);
  if (uy !== 0) ts.push(((uy > 0 ? h : 0) - cy) / uy);
  let s = Math.min(...ts.filter((t) => t > 0));
  if (!isFinite(s) || s <= 0) s = Math.min(w, h) / 2;
  return { ex: cx + ux * s, ey: cy + uy * s };
}

/** Triangle tail for a speech bubble + the two outer sides (no base, to avoid a seam). */
function speechTail(w: number, h: number, tipX: number, tipY: number) {
  const { ex, ey } = edgeExit(w, h, tipX, tipY);
  const ux = tipX - w / 2;
  const uy = tipY - h / 2;
  const len = Math.hypot(ux, uy) || 1;
  // Perpendicular unit vector along the edge.
  const px = -uy / len;
  const py = ux / len;
  const baseW = Math.max(10, Math.min(w, h) * 0.16);
  const b1x = ex + px * baseW;
  const b1y = ey + py * baseW;
  const b2x = ex - px * baseW;
  const b2y = ey - py * baseW;
  return {
    tri: `M${r2(b1x)},${r2(b1y)} L${r2(tipX)},${r2(tipY)} L${r2(b2x)},${r2(b2y)} Z`,
    sides: `M${r2(b1x)},${r2(b1y)} L${r2(tipX)},${r2(tipY)} L${r2(b2x)},${r2(b2y)}`,
  };
}

/** Thought-bubble tail: a few shrinking circles from the edge toward the tip. */
function thoughtTail(
  w: number,
  h: number,
  tipX: number,
  tipY: number
): string[] {
  const { ex, ey } = edgeExit(w, h, tipX, tipY);
  const steps = 3;
  const out: string[] = [];
  const base = Math.max(6, Math.min(w, h) * 0.07);
  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 0.6);
    const x = ex + (tipX - ex) * t;
    const y = ey + (tipY - ey) * t;
    const rad = base * (1 - (i - 1) * 0.22);
    out.push(circlePath(x, y, rad));
  }
  return out;
}

/** Cloud (scalloped) outline for a thought bubble. */
function thoughtCloud(w: number, h: number, bumps = 9): string {
  const cx = w / 2;
  const cy = h / 2;
  const a = w / 2;
  const b = h / 2;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < bumps; i++) {
    const ang = (i / bumps) * Math.PI * 2;
    pts.push({ x: cx + a * Math.cos(ang), y: cy + b * Math.sin(ang) });
  }
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const p = pts[i % bumps];
    if (i === 0) {
      d += `M${r2(p.x)},${r2(p.y)}`;
    } else {
      const prev = pts[(i - 1) % bumps];
      const chord = Math.hypot(p.x - prev.x, p.y - prev.y);
      const rr = chord * 0.92; // > chord/2 → bulges outward
      d += ` A${r2(rr)},${r2(rr)} 0 0 1 ${r2(p.x)},${r2(p.y)}`;
    }
  }
  return d + ' Z';
}

/** Spiky starburst for a shout bubble. */
function shoutBurst(
  w: number,
  h: number,
  spikes = 14,
  innerFrac = 0.68
): string {
  const cx = w / 2;
  const cy = h / 2;
  const a = w / 2;
  const b = h / 2;
  const N = spikes * 2;
  let d = '';
  for (let i = 0; i <= N; i++) {
    const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
    const rad = i % 2 === 0 ? 1 : innerFrac;
    const x = cx + a * rad * Math.cos(ang);
    const y = cy + b * rad * Math.sin(ang);
    d += i === 0 ? `M${r2(x)},${r2(y)}` : ` L${r2(x)},${r2(y)}`;
  }
  return d + ' Z';
}

/** Classic 5-point star — great as a hollow emphasis frame. */
function star(w: number, h: number, points = 5, innerFrac = 0.5): string {
  return shoutBurst(w, h, points, innerFrac);
}

/** A heart outline, fit to the box. */
function heart(w: number, h: number): string {
  const X = (n: number) => r2(n * w);
  const Y = (n: number) => r2(n * h);
  return [
    `M${X(0.5)},${Y(0.3)}`,
    `C${X(0.4)},${Y(0.05)} ${X(0)},${Y(0.08)} ${X(0)},${Y(0.4)}`,
    `C${X(0)},${Y(0.68)} ${X(0.32)},${Y(0.85)} ${X(0.5)},${Y(0.98)}`,
    `C${X(0.68)},${Y(0.85)} ${X(1)},${Y(0.68)} ${X(1)},${Y(0.4)}`,
    `C${X(1)},${Y(0.08)} ${X(0.6)},${Y(0.05)} ${X(0.5)},${Y(0.3)}`,
    'Z',
  ].join(' ');
}

/** A smooth ellipse. */
function oval(w: number, h: number): string {
  const cx = r2(w / 2);
  const cy = r2(h / 2);
  const rx = r2(w / 2);
  const ry = r2(h / 2);
  return `M${cx},${r2(cy - ry)} A${rx},${ry} 0 1 0 ${cx},${r2(cy + ry)} A${rx},${ry} 0 1 0 ${cx},${r2(cy - ry)} Z`;
}

/** A plain sharp-cornered rectangle (a box frame). */
function box(w: number, h: number): string {
  return roundedRect(0, 0, w, h, 0);
}

export function buildBubbleShape(
  type: BubbleType,
  w: number,
  h: number,
  tail?: { x: number; y: number } | null
): BubbleShape {
  switch (type) {
    case 'speech': {
      const rect = roundedRect(0, 0, w, h, Math.min(w, h) * 0.16);
      if (!tail) return { fills: [rect], strokes: [rect] };
      const { tri, sides } = speechTail(w, h, tail.x, tail.y);
      return { fills: [rect, tri], strokes: [rect, sides] };
    }
    case 'thought': {
      const cloud = thoughtCloud(w, h);
      if (!tail) return { fills: [cloud], strokes: [cloud] };
      const dots = thoughtTail(w, h, tail.x, tail.y);
      return { fills: [cloud, ...dots], strokes: [cloud, ...dots] };
    }
    case 'shout': {
      const burst = shoutBurst(w, h);
      return { fills: [burst], strokes: [burst] };
    }
    case 'star': {
      const s = star(w, h);
      return { fills: [s], strokes: [s] };
    }
    case 'heart': {
      const ht = heart(w, h);
      return { fills: [ht], strokes: [ht] };
    }
    case 'oval': {
      const o = oval(w, h);
      return { fills: [o], strokes: [o] };
    }
    case 'square': {
      const b = box(w, h);
      return { fills: [b], strokes: [b] };
    }
    case 'caption':
    default:
      return { fills: [], strokes: [] };
  }
}

/** Word-wrap text to a max pixel width using the current canvas font. */
export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const out: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (paragraph === '') {
      out.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let cur = '';
    for (const word of words) {
      const test = cur ? `${cur} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && cur) {
        out.push(cur);
        cur = word;
      } else {
        cur = test;
      }
    }
    if (cur) out.push(cur);
  }
  return out.length ? out : [''];
}

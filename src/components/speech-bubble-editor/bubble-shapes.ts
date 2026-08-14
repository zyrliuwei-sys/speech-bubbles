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

/**
 * A single closed outline for a speech bubble whose tail tip is at (tipX, tipY):
 * a rounded rectangle with the tail's two base points cut into ONE edge and
 * joined through the tip. Drawing body + tail as one continuous path means there
 * is never a 断边 (gap) where the tail meets the body — at any tail angle. The
 * same string is used for both fill and stroke so the outline can't drift.
 */
function speechOutline(
  w: number,
  h: number,
  rad: number,
  tipX: number,
  tipY: number
): string {
  const r = Math.max(0, Math.min(rad, w / 2, h / 2));

  // Rounded-rect perimeter stations in clockwise order. `conn` is the connector
  // FROM that station to the next: 'L' = straight edge, 'A' = corner arc.
  const nodes = [
    { x: r, y: 0, conn: 'L' as const }, // 0 → top edge
    { x: w - r, y: 0, conn: 'A' as const }, // 1 → top-right arc
    { x: w, y: r, conn: 'L' as const }, // 2 → right edge
    { x: w, y: h - r, conn: 'A' as const }, // 3 → bottom-right arc
    { x: w - r, y: h, conn: 'L' as const }, // 4 → bottom edge
    { x: r, y: h, conn: 'A' as const }, // 5 → bottom-left arc
    { x: 0, y: h - r, conn: 'L' as const }, // 6 → left edge
    { x: 0, y: r, conn: 'A' as const }, // 7 → top-left arc
  ];

  // The four straight edges, each with its clockwise-forward unit vector and the
  // axis range that keeps base points on the flat part (off the corner arcs).
  const edges = [
    { k: 0, axis: 'x' as const, fixed: 0, lo: r, hi: w - r, dx: 1, dy: 0 }, // top
    { k: 2, axis: 'y' as const, fixed: w, lo: r, hi: h - r, dx: 0, dy: 1 }, // right
    { k: 4, axis: 'x' as const, fixed: h, lo: r, hi: w - r, dx: -1, dy: 0 }, // bottom
    { k: 6, axis: 'y' as const, fixed: 0, lo: r, hi: h - r, dx: 0, dy: -1 }, // left
  ];

  // Where the center→tip ray crosses the bounding rectangle.
  const { ex, ey } = edgeExit(w, h, tipX, tipY);

  // Pick the edge the exit sits on (nearest bounding line by perpendicular dist).
  let edge = edges[0];
  let bestD = Infinity;
  for (const e of edges) {
    const d = e.axis === 'x' ? Math.abs(ey - e.fixed) : Math.abs(ex - e.fixed);
    if (d < bestD) {
      bestD = d;
      edge = e;
    }
  }

  // Tail base point on the chosen edge, clamped to its straight portion.
  const along = Math.max(
    edge.lo,
    Math.min(edge.hi, edge.axis === 'x' ? ex : ey)
  );
  const baseX = edge.axis === 'x' ? along : edge.fixed;
  const baseY = edge.axis === 'x' ? edge.fixed : along;

  // Two base vertices spaced ±halfBase along the edge (clockwise / counter),
  // each clamped to the corner stations so they stay on the flat edge.
  const half = Math.max(10, Math.min(w, h) * 0.16) / 2;
  const clamp = (v: number) => Math.max(edge.lo, Math.min(edge.hi, v));
  const e1v =
    edge.axis === 'x' ? clamp(baseX + edge.dx * half) : baseX + edge.dx * half;
  const e1y =
    edge.axis === 'y' ? clamp(baseY + edge.dy * half) : baseY + edge.dy * half;
  const e0v =
    edge.axis === 'x' ? clamp(baseX - edge.dx * half) : baseX - edge.dx * half;
  const e0y =
    edge.axis === 'y' ? clamp(baseY - edge.dy * half) : baseY - edge.dy * half;
  const e1 = {
    x: edge.axis === 'x' ? e1v : baseX,
    y: edge.axis === 'x' ? baseY : e1y,
  };
  const e0 = {
    x: edge.axis === 'x' ? e0v : baseX,
    y: edge.axis === 'x' ? baseY : e0y,
  };

  const k = edge.k;
  const at = (i: number) => nodes[((i % 8) + 8) % 8];

  // Detour from e0 out to the tip and back to e1, then the rest of the
  // perimeter clockwise (e1 → station k+1 → … → station k → e0), closed.
  const parts: string[] = [
    `M${r2(e0.x)},${r2(e0.y)}`,
    `L${r2(tipX)},${r2(tipY)}`,
    `L${r2(e1.x)},${r2(e1.y)}`,
    `L${r2(at(k + 1).x)},${r2(at(k + 1).y)}`,
  ];
  for (let j = k + 1; j <= k + 7; j++) {
    const node = at(j);
    const nxt = at(j + 1);
    parts.push(
      node.conn === 'L'
        ? `L${r2(nxt.x)},${r2(nxt.y)}`
        : `A${r2(r)},${r2(r)} 0 0 1 ${r2(nxt.x)},${r2(nxt.y)}`
    );
  }
  parts.push(`L${r2(e0.x)},${r2(e0.y)}`, 'Z');
  return parts.join(' ');
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

/**
 * Animal paw print: a big pad (rounded shape, ~50% of the box width, sitting
 * in the lower 2/3) and four small toe beans arranged in a gentle arc above
 * it. Stroked AND filled so it reads as a single silhouette. Used for
 * dog / cat / pet / "动物" prompts — the friendly default when the user
 * types an animal word but no specific animal shape exists.
 *
 * Geometry is in box-local space (0..w, 0..h) and resizes with the bubble.
 */
function pawPrint(
  w: number,
  h: number
): { fills: string[]; strokes: string[] } {
  const cx = w / 2;
  const cy = h * 0.62; // pad center, slightly below midline
  const padR = Math.min(w, h) * 0.28; // big pad radius
  // Pad as a single rounded blob (three overlapping circles give a
  // three-lobed outline; two gives a peanut. Three looks more like a pad).
  const padPath = [
    `M${r2(cx - padR * 0.95)},${r2(cy + padR * 0.15)}`,
    `A${r2(padR * 0.95)},${r2(padR * 0.95)} 0 0 1 ${r2(cx + padR * 0.95)},${r2(cy + padR * 0.15)}`,
    `A${r2(padR * 0.7)},${r2(padR * 1.0)} 0 0 1 ${r2(cx)},${r2(cy - padR * 0.85)}`,
    `A${r2(padR * 0.7)},${r2(padR * 1.0)} 0 0 1 ${r2(cx - padR * 0.95)},${r2(cy + padR * 0.15)}`,
    'Z',
  ].join(' ');
  // Four toes: two outer (slightly lower) and two inner (slightly higher).
  const toeR = padR * 0.32;
  const toeY = cy - padR * 0.95;
  const toes = [
    { x: cx - padR * 0.95, y: toeY + toeR * 0.4 },
    { x: cx - padR * 0.38, y: toeY - toeR * 0.2 },
    { x: cx + padR * 0.38, y: toeY - toeR * 0.2 },
    { x: cx + padR * 0.95, y: toeY + toeR * 0.4 },
  ].map((t) => circlePath(t.x, t.y, toeR));
  // One outline for the whole paw (pad + toes) so the stroke never breaks
  // at the pad/toe junctions when the bubble is exported.
  return {
    fills: [padPath, ...toes],
    strokes: [padPath, ...toes],
  };
}

/**
 * Cat head silhouette: round head + two pointy triangular ears on top.
 * One continuous path so the export stroke never breaks at the ear/head
 * junction. The path traces clockwise: left ear tip → inner valley →
 * right ear tip → right side of head → bottom of head → left side → close.
 */
function catHead(w: number, h: number): string {
  // Head occupies the lower ~70% of the box; ears poke up into the top ~30%.
  const headCY = h * 0.62;
  const headRX = w * 0.4;
  const headRY = h * 0.32;
  const cx = w / 2;
  // Ear vertices (clockwise from left tip).
  const earInnerY = h * 0.28; // where ears meet the head
  const leftEarTipX = w * 0.18;
  const leftEarTipY = h * 0.06;
  const leftEarBaseX = w * 0.36;
  const rightEarBaseX = w * 0.64;
  const rightEarTipX = w * 0.82;
  const rightEarTipY = h * 0.06;
  // Trace the cat silhouette clockwise from the left ear tip.
  return [
    `M${r2(leftEarTipX)},${r2(leftEarTipY)}`,
    // Down to inner-left of left ear, then up-right to the dip between ears.
    `L${r2(leftEarBaseX)},${r2(earInnerY)}`,
    `L${r2(cx)},${r2(h * 0.22)}`,
    // Then to inner-right of right ear, then up to the right ear tip.
    `L${r2(rightEarBaseX)},${r2(earInnerY)}`,
    `L${r2(rightEarTipX)},${r2(rightEarTipY)}`,
    // Curve down the right side of the head and around the bottom.
    `C${r2(cx + headRX * 1.05)},${r2(h * 0.32)} ${r2(cx + headRX)},${r2(headCY - headRY * 0.2)} ${r2(cx + headRX)},${r2(headCY)}`,
    `A${r2(headRX)},${r2(headRY)} 0 0 1 ${r2(cx - headRX)},${r2(headCY)}`,
    // Curve up the left side back to the left ear base.
    `C${r2(cx - headRX)},${r2(headCY - headRY * 0.2)} ${r2(cx - headRX * 1.05)},${r2(h * 0.32)} ${r2(leftEarBaseX)},${r2(earInnerY)}`,
    'Z',
  ].join(' ');
}

/**
 * Dog head silhouette: round head + two floppy round ears that droop down
 * from the sides. The head and each ear are separate sub-paths so the
 * floppy curve reads correctly without trying to make one continuous
 * outline (the inner ear is hollow).
 */
function dogHead(w: number, h: number): { fills: string[]; strokes: string[] } {
  const cx = w / 2;
  const headCY = h * 0.55;
  const headRX = w * 0.32;
  const headRY = h * 0.3;
  // Head as a single circle.
  const head = circlePath(cx, headCY, Math.max(headRX, headRY));
  // Floppy ears: ovals attached to the upper-side of the head, drooping
  // down past the head's mid-line.
  const earRX = w * 0.14;
  const earRY = h * 0.26;
  const leftEar = ellipse(w * 0.18, headCY - h * 0.05, earRX, earRY);
  const rightEar = ellipse(
    w - w * 0.18 - earRX * 2,
    headCY - h * 0.05,
    earRX,
    earRY
  );
  return {
    fills: [head, leftEar, rightEar],
    strokes: [head, leftEar, rightEar],
  };
}

/**
 * Bear head silhouette: big round head + two small round ears on TOP of the
 * head (not drooping on the sides like the dog, not pointy like the cat).
 * The face is slightly wider than tall, like a teddy bear / panda. The
 * ears are small circles that overlap the top of the head, so they read as
 * one continuous silhouette.
 */
function bearHead(
  w: number,
  h: number
): { fills: string[]; strokes: string[] } {
  const cx = w / 2;
  // Head: a wide oval, slightly squashed (teddy-bear proportions).
  const headCY = h * 0.6;
  const headRX = w * 0.38;
  const headRY = h * 0.32;
  const head = circlePath(cx, headCY, Math.max(headRX, headRY));
  // Two small round ears sitting on top of the head, slightly outside the
  // head's outline so they pop above the silhouette.
  const earR = Math.min(w, h) * 0.16;
  const earCY = h * 0.18;
  const leftEar = circlePath(cx - headRX * 0.7, earCY, earR);
  const rightEar = circlePath(cx + headRX * 0.7, earCY, earR);
  // Inner ear "patches" — small filled circles in slightly different
  // position so the ears read as ears and not just bumps. Filled but NOT
  // stroked (they're interior detail, not part of the outline).
  const innerR = earR * 0.5;
  const leftInner = circlePath(cx - headRX * 0.7, earCY, innerR);
  const rightInner = circlePath(cx + headRX * 0.7, earCY, innerR);
  return {
    // Order matters: inner patches first, then head, then ears on top so
    // the outline overlaps correctly when stroked. The fill uses the same
    // union so there's no visible seam at the ear/head junction.
    fills: [leftInner, rightInner, head, leftEar, rightEar],
    strokes: [head, leftEar, rightEar],
  };
}

/** An ellipse at (x,y) with given radii — used for dog ears. Different
 *  signature from `oval(w, h)` (which fits to a box) so it gets its own name. */
function ellipse(x: number, y: number, rx: number, ry: number): string {
  return `M${r2(x + rx)},${r2(y + ry / 2)} A${r2(rx)},${r2(ry)} 0 1 0 ${r2(x + rx)},${r2(y - ry / 2)} A${r2(rx)},${r2(ry)} 0 1 0 ${r2(x + rx)},${r2(y + ry / 2)} Z`;
}

export function buildBubbleShape(
  type: BubbleType,
  w: number,
  h: number,
  tail?: { x: number; y: number } | null
): BubbleShape {
  switch (type) {
    case 'speech': {
      const rad = Math.min(w, h) * 0.16;
      if (!tail) {
        const rect = roundedRect(0, 0, w, h, rad);
        return { fills: [rect], strokes: [rect] };
      }
      // Body + tail as one continuous closed outline — no 断边 at any tail angle.
      const outline = speechOutline(w, h, rad, tail.x, tail.y);
      return { fills: [outline], strokes: [outline] };
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
    case 'paw': {
      return pawPrint(w, h);
    }
    case 'cat': {
      const d = catHead(w, h);
      return { fills: [d], strokes: [d] };
    }
    case 'dog': {
      return dogHead(w, h);
    }
    case 'bear': {
      return bearHead(w, h);
    }
    case 'caption':
    default:
      return { fills: [], strokes: [] };
  }
}

/**
 * Text layout constants shared by the on-screen preview and the exported PNG so
 * both surfaces render text identically.
 */
export const TEXT_LINE_HEIGHT = 1.25;
export const TEXT_PAD_X_FRAC = 0.6; // × fontSize
export const TEXT_PAD_Y_FRAC = 0.45; // × fontSize

export interface TextLayout {
  /** Canvas-broken lines (the exact strings to render, one per line). */
  lines: string[];
  /** Total content height including top + bottom padding, in px. */
  height: number;
  padX: number;
  padY: number;
  lineHeight: number;
}

/**
 * Lay out bubble text using CANVAS metrics so the on-screen preview and the
 * exported PNG wrap identically. The browser's HTML layout engine and canvas
 * `measureText` disagree on borderline wraps (e.g. the default "Say something!"
 * fits on one line in the DOM but two via canvas) — when the preview sized its
 * box from the DOM and the export drew text via canvas, the exported box could
 * be the wrong height by a whole line and the text overflowed its bubble.
 * Running both surfaces through this single function makes them agree.
 */
export function layoutBubbleText(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  fontWeight: number,
  fontSizePx: number,
  boxWidthPx: number
): TextLayout {
  const padX = fontSizePx * TEXT_PAD_X_FRAC;
  const padY = fontSizePx * TEXT_PAD_Y_FRAC;
  const lineHeight = fontSizePx * TEXT_LINE_HEIGHT;
  const innerW = Math.max(10, boxWidthPx - padX * 2);
  ctx.save();
  ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
  const lines = wrapLines(ctx, text || ' ', innerW);
  ctx.restore();
  return {
    lines,
    height: lines.length * lineHeight + padY * 2,
    padX,
    padY,
    lineHeight,
  };
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

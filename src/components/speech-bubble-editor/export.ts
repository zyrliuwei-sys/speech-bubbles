/**
 * Render an editor scene to a canvas at the image's native resolution and
 * trigger a PNG download. Shared by the editor and any "quick export" surface.
 */

import { buildBubbleShape, wrapLines } from './bubble-shapes';
import type { Bubble, EditorImage } from './types';

export interface RenderOptions {
  image: EditorImage;
  bubbles: Bubble[];
  /** true = full native resolution; false = cap longest side at 1280px. */
  hd: boolean;
  /** Draw a faint Speech Bubbles watermark in the corner. */
  watermark: boolean;
  watermarkText?: string;
}

const FREE_MAX_SIDE = 1280;

export function renderToCanvas(opts: RenderOptions): HTMLCanvasElement {
  const { image, bubbles, hd, watermark } = opts;

  const longest = Math.max(image.naturalWidth, image.naturalHeight) || 1;
  const targetLongest = hd ? longest : Math.min(FREE_MAX_SIDE, longest);
  const scale = targetLongest / longest;
  const W = Math.max(1, Math.round(image.naturalWidth * scale));
  const H = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Draw the underlying photo. We pass an HTMLImageElement in via opts for the
  // live editor, but accept a preloaded image through a side channel: callers
  // ensure `image.el` is set before calling. To keep this pure, the editor
  // preloads an HTMLImageElement and attaches it.
  const el = (image as EditorImage & { el?: HTMLImageElement }).el;
  if (el) {
    ctx.drawImage(el, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
  }

  for (const b of bubbles) {
    const boxW = b.w * W;
    const boxH = b.h * W; // h is stored relative to width
    const cx = b.x * W;
    const cy = b.y * H;
    const left = cx - boxW / 2;
    const top = cy - boxH / 2;
    const fontSize = b.fontSize * W;
    const strokeWidthPx = Math.max(1, b.strokeWidth * W);

    ctx.save();
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const hasTail = b.type === 'speech' || b.type === 'thought';
    const tail = hasTail
      ? { x: b.tailX * W - left, y: b.tailY * H - top }
      : null;

    const shape = buildBubbleShape(b.type, boxW, boxH, tail);

    // Fill (union of sub-paths).
    ctx.fillStyle = b.fill;
    for (const d of shape.fills) {
      ctx.fill(new Path2D(d));
    }
    // Stroke (outlines).
    ctx.strokeStyle = b.stroke;
    ctx.lineWidth = strokeWidthPx;
    for (const d of shape.strokes) {
      ctx.stroke(new Path2D(d));
    }

    // Text.
    const padX = fontSize * 0.6;
    const padY = fontSize * 0.45;
    ctx.font = `${b.fontWeight} ${fontSize}px ${b.fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';

    const innerW = Math.max(10, boxW - padX * 2);
    const lines = wrapLines(ctx, b.text || '', innerW);
    const lineHeight = fontSize * 1.25;
    const blockH = lines.length * lineHeight;
    let baselineY = top + (boxH - blockH) / 2 + fontSize * 0.92;

    for (const line of lines) {
      const measured = ctx.measureText(line).width;
      let tx: number;
      if (b.align === 'center') tx = left + (boxW - measured) / 2;
      else if (b.align === 'right') tx = left + boxW - padX - measured;
      else tx = left + padX;

      // Caption text floats over the photo — give it an outline for contrast.
      if (b.type === 'caption') {
        ctx.lineWidth = fontSize * 0.14;
        ctx.strokeStyle = b.stroke;
        ctx.strokeText(line, tx, baselineY);
      }
      ctx.fillStyle = b.color;
      ctx.fillText(line, tx, baselineY);
      baselineY += lineHeight;
    }

    ctx.restore();
  }

  if (watermark) {
    const text = opts.watermarkText || 'Speech Bubbles';
    const size = Math.max(14, Math.round(W * 0.022));
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.font = `600 ${size}px Inter, ui-sans-serif, system-ui, sans-serif`;
    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'right';
    const pad = size * 0.6;
    const tw = ctx.measureText(text).width;
    const bx = W - pad;
    const by = H - pad;
    // pill background
    ctx.fillStyle = 'rgba(37, 99, 235, 0.92)';
    const pillW = tw + size * 1.1;
    const pillH = size * 1.5;
    roundRectPath(
      ctx,
      bx - pillW + size * 0.2,
      by - pillH + size * 0.2,
      pillW,
      pillH,
      pillH / 2
    );
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, bx, by - size * 0.25);
    ctx.restore();
  }

  return canvas;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, 'image/png');
}

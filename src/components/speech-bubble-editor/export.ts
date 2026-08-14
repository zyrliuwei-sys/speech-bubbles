/**
 * Render an editor scene to a canvas at the image's native resolution and
 * trigger a PNG download. Shared by the editor and any "quick export" surface.
 */

import { buildBubbleShape, layoutBubbleText } from './bubble-shapes';
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

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = src;
  });
}

/**
 * Ensure every font referenced by the bubbles is actually loaded before we
 * paint to the canvas — otherwise the exported PNG silently falls back to a
 * default face. @fontsource CSS only fetches a face on first use, so we trigger
 * each (weight, family) pair explicitly via `document.fonts.load`.
 */
async function ensureFontsLoaded(bubbles: Bubble[]): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  const specs = new Set<string>();
  for (const b of bubbles) {
    if (b.imageSrc) continue;
    const first = b.fontFamily
      .split(',')[0]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');
    if (first) specs.add(`${b.fontWeight}|${first}`);
  }
  await Promise.all(
    [...specs].map((s) => {
      const [weight, family] = s.split('|');
      return document.fonts.load(`${weight} 64px "${family}"`).catch(() => {});
    })
  );
  await document.fonts.ready;
}

export async function renderToCanvas(
  opts: RenderOptions
): Promise<HTMLCanvasElement> {
  const { image, bubbles, hd, watermark } = opts;

  // Preload any image-bubble stickers (transparent PNGs dragged onto the
  // canvas) so we can composite them at native resolution, and ensure every
  // text font is loaded so the canvas doesn't paint a fallback face.
  const bubbleImages: Record<string, HTMLImageElement> = {};
  await Promise.all([
    ensureFontsLoaded(bubbles),
    ...bubbles
      .filter((b) => b.imageSrc)
      .map(async (b) => {
        const el = await loadImage(b.imageSrc!);
        if (el) bubbleImages[b.id] = el;
      }),
  ]);

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

  // Draw the underlying photo. Callers (the live editor) preload an
  // `HTMLImageElement` and pass it via `image.el` so we can paint at native
  // resolution without a second decode. If it's missing, fall back to a
  // blank canvas (the export still completes instead of failing).
  if (image.el) {
    ctx.drawImage(image.el, 0, 0, W, H);
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
  }

  for (const b of bubbles) {
    const boxW = b.w * W;
    const cx = b.x * W;
    const cy = b.y * H;

    // Image sticker bubble — composite the transparent PNG, skip vector/text.
    const imgEl = b.imageSrc ? bubbleImages[b.id] : undefined;
    if (imgEl) {
      const boxH = b.h * W;
      ctx.drawImage(imgEl, cx - boxW / 2, cy - boxH / 2, boxW, boxH);
      continue;
    }

    const fontSize = b.fontSize * W;
    const strokeWidthPx = Math.max(1, b.strokeWidth * W);

    // Lay out the text with canvas metrics to get the line breaks for drawing.
    const layout = layoutBubbleText(
      ctx,
      b.text,
      b.fontFamily,
      b.fontWeight,
      fontSize,
      boxW
    );
    // IMPORTANT: read the box height the on-screen preview already measured and
    // synced to `b.h` — do NOT remeasure here. The preview sizes auto-height
    // boxes from this same canvas metric and writes it back to `b.h`, so using
    // `b.h * W` lands the exported box on the exact pixels the user positioned.
    // Remasuring (`layout.height`) can disagree if a font finished loading
    // between the preview pass and this export pass, and the box would then
    // shift — the 「导出框乱 / 位置跑掉」 bug. b.h is the single source of truth.
    const boxH = b.h * W;
    const left = cx - boxW / 2;
    const top = cy - boxH / 2;

    ctx.save();
    // Path data is in box-local coordinates (0..boxW, 0..boxH). The fill /
    // stroke below draws those paths onto the current canvas origin, so we
    // must translate to (left, top) before painting — otherwise the bubble
    // lands at the canvas origin while the text (which uses left/top directly)
    // sits at the bubble's center. That's the 「气泡跑到左上角」 bug.
    ctx.translate(left, top);
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

    ctx.restore();

    // Text — draw the canvas-broken lines (identical to the preview render).
    // Text is drawn OUTSIDE the translated frame so tx/baselineY are in
    // canvas coordinates (left/top already include the bubble offset).
    const { lines, padX, lineHeight } = layout;
    ctx.font = `${b.fontWeight} ${fontSize}px ${b.fontFamily}`;
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    const blockH = lines.length * lineHeight;
    // Vertically center the text block the same way CSS line boxes do, so the
    // text sits where it does in the on-screen preview. The first line's
    // baseline is half-leading + font-ascent below the block top — taken from
    // the font's actual metrics (not a hardcoded fraction) so it's correct for
    // every font and weight.
    const fm = ctx.measureText(lines[0] || ' ');
    const fontAsc = fm.fontBoundingBoxAscent || fontSize * 0.8;
    const fontDsc = fm.fontBoundingBoxDescent || fontSize * 0.2;
    const halfLeading = (lineHeight - (fontAsc + fontDsc)) / 2;
    let baselineY = top + (boxH - blockH) / 2 + halfLeading + fontAsc;

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
/**
 * Save a blob as a direct browser download (`suggestedName` sets the filename).
 *
 * We intentionally do NOT use the File System Access API's "Save As" picker
 * (`showSaveFilePicker`): `createWritable()` creates/truncates the destination
 * file to 0 bytes, and if `write()`/`close()` then fails the user is left with
 * an empty, unopenable file — the original "下载打不开" bug. A plain blob-URL
 * download is reliable across every browser (Chrome, Firefox, Safari, mobile,
 * in-app WebViews) and is what an image tool is expected to do.
 */
export function saveBlobFallback(blob: Blob, suggestedName: string): boolean {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

/**
 * Browser-native "Save As" picker (Chrome/Edge on HTTPS) with a graceful
 * fallback to a plain blob download. Used by the AI result download button
 * — the picker is preferred because the user can pick the destination folder.
 *
 * AbortError (user cancelled the picker) is handled silently — the caller's
 * toast doesn't fire. Any other failure (lost user activation, etc.) falls
 * through to `saveBlobFallback` so the file still lands somewhere.
 */
export async function saveBlobWithPicker(
  blob: Blob,
  suggestedName: string
): Promise<boolean> {
  const picker = (
    window as unknown as {
      showSaveFilePicker?: (opts: {
        suggestedName?: string;
        types?: { description?: string; accept: Record<string, string[]> }[];
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    }
  ).showSaveFilePicker;

  if (picker) {
    try {
      const handle = await picker({
        suggestedName,
        types: [
          { description: 'PNG image', accept: { 'image/png': ['.png'] } },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return true;
    } catch (e: unknown) {
      // AbortError = user clicked Cancel — don't fall back to a silent download.
      if ((e as { name?: string })?.name === 'AbortError') return false;
      // Any other failure (e.g. lost user activation) → legacy download below.
    }
  }

  return saveBlobFallback(blob, suggestedName);
}

/** Promise-wrapper around canvas.toBlob. Returns null on a tainted canvas.
 *  `quality` (0..1) is only used for lossy formats (image/jpeg, image/webp). */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type = 'image/png',
  quality?: number
): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob((blob) => resolve(blob), type, quality)
  );
}

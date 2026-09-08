import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Cat,
  Circle,
  Cloud,
  Copy,
  Dog,
  Download,
  Heart,
  Loader2,
  MessageCircle,
  Plus,
  PlusCircle,
  Sparkles,
  Square,
  Star,
  Trash2,
  Type,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { tDynamic } from '@/core/i18n/dynamic';
import { Link } from '@/core/i18n/navigation';
import { apiGet, apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  buildBubbleShape,
  layoutBubbleText,
  type TextLayout,
} from './bubble-shapes';
import {
  canvasToBlob,
  renderToCanvas,
  saveBlobFallback,
  saveBlobWithPicker,
} from './export';
import {
  defaultBubble,
  FONT_OPTIONS,
  type Bubble,
  type BubbleType,
  type EditorImage,
  type FontGroupId,
} from './types';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// The previous KEYWORD_SHAPE_MAP + detectBubbleShape was removed: the user
// wants the "Add bubble" input to satisfy ANY shape or category, not just the
// fixed list (cat/dog/bear/star/heart/...). The right-hand input now goes
// straight to nano-banana-2-lite for any prompt. The toolbar below the stage
// still has 8 instant local shape buttons (Speech/Thought/Shout/.../Bear)
// for the classic cases where the user doesn't want to wait for AI.

/**
 * WeChat's in-app browser (and many other in-app WebViews) block/ignore blob
 * downloads and the File System Access API, so a normal "download" silently
 * produces a corrupt or empty file. Detect it so we can fall back to showing
 * the rendered image for the user to long-press → Save Image (微信长按保存).
 */
function isWeChatBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

/** Convert an image src (blob: or data: URL) into a base64 data URL. */
async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Decode a data: URL into a Blob without awaiting fetch, so the Save As
 *  picker keeps the click's transient user activation. */
function dataUrlToBlob(dataUrl: string): Blob | null {
  const match = /^data:([^;]+)?(;base64)?,(.*)$/s.exec(dataUrl);
  if (!match) return null;
  const mime = match[1] || 'image/png';
  try {
    const data = match[2]
      ? Uint8Array.from(atob(match[3]), (c) => c.charCodeAt(0))
      : new TextEncoder().encode(decodeURIComponent(match[3]));
    return new Blob([data], { type: mime });
  } catch {
    return null;
  }
}

/** Save a generated bubble PNG via the browser's "Save As" dialog. */
async function downloadDataUrl(dataUrl: string, filename: string) {
  const blob = dataUrlToBlob(dataUrl);
  if (blob) {
    await saveBlobWithPicker(blob, filename);
    return;
  }
  // Last-resort fallback for malformed data URLs.
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Force an AI image into a transparent PNG sticker — the editor's iron rule:
 * no matter the prompt, every generated bubble is a transparent PNG. Flood-
 * removes the uniform background (sampled from the borders, expanding through
 * connected pixels within a color tolerance) and re-encodes as PNG with an
 * alpha channel. If the model already returned transparency, it's kept and
 * just re-encoded. Returns a `data:image/png` URL or throws on decoding failure.
 */
async function makeTransparentPng(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = dataUrl;
  });
  if (!img) throw new Error(m['editor.bubble_panel.failed']());

  // Cap the working size — pixel ops on a 4K image are slow and unnecessary.
  const maxDim = 1024;
  const ow = img.naturalWidth || img.width;
  const oh = img.naturalHeight || img.height;
  const scale = Math.min(1, maxDim / Math.max(ow, oh));
  const w = Math.max(1, Math.round(ow * scale));
  const h = Math.max(1, Math.round(oh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error(m['editor.bubble_panel.failed']());
  ctx.drawImage(img, 0, 0, w, h);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, w, h);
  } catch {
    throw new Error(m['editor.bubble_panel.failed']());
  }
  const px = imageData.data;

  // Remove chroma everywhere, including the enclosed opening of the frame.
  let keyed = 0;
  for (let i = 0; i < px.length; i += 4) {
    const chroma = Math.min(px[i], px[i + 2]) - px[i + 1];
    if (chroma > 65 && px[i] > 120 && px[i + 2] > 120) {
      px[i + 3] = Math.round(px[i + 3] * Math.max(0, 1 - (chroma - 65) / 70));
      keyed++;
    }
  }
  if (keyed > w * h * 0.05) {
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL('image/png');
  }

  // If most border pixels are already transparent, the model honored the
  // transparency request — just re-encode as PNG.
  let borderTotal = 0;
  let borderTransparent = 0;
  const countBorder = (x: number, y: number) => {
    borderTotal++;
    if (px[(y * w + x) * 4 + 3] < 16) borderTransparent++;
  };
  for (let x = 0; x < w; x++) {
    countBorder(x, 0);
    countBorder(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    countBorder(0, y);
    countBorder(w - 1, y);
  }
  if (borderTransparent / borderTotal > 0.25) {
    return canvas.toDataURL('image/png');
  }

  // Background seed = average RGB of the opaque border pixels.
  let sr = 0;
  let sg = 0;
  let sb = 0;
  let n = 0;
  const add = (x: number, y: number) => {
    const i = (y * w + x) * 4;
    if (px[i + 3] < 200) return;
    sr += px[i];
    sg += px[i + 1];
    sb += px[i + 2];
    n++;
  };
  for (let x = 0; x < w; x++) {
    add(x, 0);
    add(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    add(0, y);
    add(w - 1, y);
  }
  if (n === 0) return canvas.toDataURL('image/png');
  sr /= n;
  sg /= n;
  sb /= n;

  const tol = 44; // within → background (remove)
  const tol2 = 92; // within → feather the fringe
  const dist = (i: number) => {
    const dr = px[i] - sr;
    const dg = px[i + 1] - sg;
    const db = px[i + 2] - sb;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  // Flood fill from every border pixel through background-colored (or already
  // transparent) neighbors. Connectivity preserves interior highlights that
  // happen to match the background color.
  const removed = new Uint8Array(w * h);
  const stack: number[] = [];
  const seed = (x: number, y: number) => {
    const p = y * w + x;
    if (removed[p]) return;
    const i = p * 4;
    if (px[i + 3] < 200 || dist(i) < tol) {
      removed[p] = 1;
      stack.push(p);
    }
  };
  for (let x = 0; x < w; x++) {
    seed(x, 0);
    seed(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    seed(0, y);
    seed(w - 1, y);
  }
  while (stack.length) {
    const p = stack.pop() as number;
    const x = p % w;
    const y = (p / w) | 0;
    const candidates = [
      x > 0 ? p - 1 : -1,
      x < w - 1 ? p + 1 : -1,
      y > 0 ? p - w : -1,
      y < h - 1 ? p + w : -1,
    ];
    for (const q of candidates) {
      if (q < 0 || removed[q]) continue;
      const qi = q * 4;
      if (px[qi + 3] < 200 || dist(qi) < tol) {
        removed[q] = 1;
        stack.push(q);
      }
    }
  }

  // Apply removal, feathering kept pixels whose color still drifts toward the
  // background (the anti-aliased fringe around the bubble's outline).
  for (let p = 0; p < w * h; p++) {
    const i = p * 4;
    if (removed[p]) {
      px[i + 3] = 0;
      continue;
    }
    const d = dist(i);
    if (d < tol2) {
      const a = Math.round(((d - tol) / (tol2 - tol)) * 255);
      px[i + 3] = Math.max(0, Math.min(255, a));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}

const BUBBLE_TYPES: {
  type: BubbleType;
  icon: typeof MessageCircle;
  key: string;
}[] = [
  { type: 'speech', icon: MessageCircle, key: 'editor.bubble.speech' },
  { type: 'thought', icon: Cloud, key: 'editor.bubble.thought' },
  { type: 'shout', icon: Zap, key: 'editor.bubble.shout' },
  { type: 'caption', icon: Type, key: 'editor.bubble.caption' },
  { type: 'star', icon: Star, key: 'editor.bubble.star' },
  { type: 'heart', icon: Heart, key: 'editor.bubble.heart' },
  { type: 'oval', icon: Circle, key: 'editor.bubble.oval' },
  { type: 'square', icon: Square, key: 'editor.bubble.square' },
  { type: 'paw', icon: Cat, key: 'editor.bubble.paw' },
  { type: 'cat', icon: Cat, key: 'editor.bubble.cat' },
  { type: 'dog', icon: Dog, key: 'editor.bubble.dog' },
  { type: 'bear', icon: Dog, key: 'editor.bubble.bear' },
];

export interface SpeechBubbleEditorProps {
  /** Hide the side panel (e.g. when embedded as a read-only showcase). */
  compact?: boolean;
}

export function SpeechBubbleEditor({
  compact = false,
}: SpeechBubbleEditorProps) {
  const { data: session } = useSession();
  const [creditDialog, setCreditDialog] = useState<'login' | 'payment' | null>(
    null
  );
  const [image, setImage] = useState<EditorImage | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [box, setBox] = useState({ w: 0, h: 0 }); // rendered image box in px

  const stageAreaRef = useRef<HTMLDivElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live render size in a ref so pointer-drag math never goes stale.
  const sizeRef = useRef({ renderW: 0, renderH: 0 });
  sizeRef.current = { renderW: box.w, renderH: box.h };

  const selected = useMemo(
    () => bubbles.find((b) => b.id === selectedId) ?? null,
    [bubbles, selectedId]
  );

  const updateBubble = useCallback((id: string, patch: Partial<Bubble>) => {
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  // --- "Add bubble" panel (AI-driven) -------------------------------------
  // The single right-side input. Whatever the user types — "cat", "neon cloud
  // with sparks", "logo with a hat", anything — goes to nano-banana-2-lite via
  // /api/editor/generate, the result comes back as a transparent PNG and
  // drops on the canvas. Local keyword matching was removed: the user said
  // they want "any shape / category", which the fixed-shape list can't cover.
  // The toolbar below the stage still has 8 instant local shape buttons for
  // the classic cases where the user doesn't want to wait ~30s for AI.
  const [ai, setAi] = useState<{
    status: 'idle' | 'creating' | 'polling';
    prompt: string;
    useImage: boolean;
    error?: string;
  }>({ status: 'idle', prompt: '', useImage: false });
  const [aiResults, setAiResults] = useState<
    { id: string; dataUrl: string; prompt: string }[]
  >([]);
  const [aiElapsed, setAiElapsed] = useState(0);
  const genRunId = useRef(0);

  // Drop visual state (file drag) — unchanged.
  const dragDepth = useRef(0);
  const [dropActive, setDropActive] = useState(false);

  const loadImageFromUrl = useCallback((url: string) => {
    const el = new Image();
    el.onload = () => {
      setImage({
        src: url,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      });
    };
    el.onerror = () => toast.error(m['editor.error.load']());
    el.src = url;
  }, []);

  /**
   * Drop a generated AI bubble onto the canvas as a movable, resizable sticker.
   * The aspect ratio comes from the decoded image; width defaults to 30% of
   * the canvas so a 1024×1024 AI result lands at a useful size out of the
   * box. `onError` falls back to setting it as the canvas background — same
   * behavior as the old flow so a broken AI result still becomes a photo.
   */
  const addImageBubble = useCallback(
    (dataUrl: string, x = 0.5, y = 0.5) => {
      const el = new Image();
      el.onload = () => {
        const aspect =
          el.naturalWidth > 0 && el.naturalHeight > 0
            ? el.naturalHeight / el.naturalWidth
            : 1;
        const w = 0.3;
        const b: Bubble = {
          ...defaultBubble('image', x, y),
          imageSrc: dataUrl,
          w,
          h: w * aspect,
        };
        if (!image) {
          const blank = document.createElement('canvas');
          blank.width = 1024;
          blank.height = 1024;
          setImage({
            src: blank.toDataURL('image/png'),
            naturalWidth: 1024,
            naturalHeight: 1024,
          });
        }
        setBubbles((prev) => [...prev, b]);
        setSelectedId(b.id);
      };
      el.onerror = () => loadImageFromUrl(dataUrl);
      el.src = dataUrl;
    },
    [loadImageFromUrl, image]
  );

  const queryClient = useQueryClient();
  const generateMutation = useMutation({
    mutationFn: (body: { prompt: string; imageDataUrl?: string }) =>
      apiPost<{ taskId: string; warning?: string }>(
        '/api/editor/generate',
        body
      ),
  });

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  /** AI generation: POST to start, GET to poll, then drop the transparent PNG
   *  on the canvas as a sticker. `genRunId` cancels a stale in-flight loop if
   *  the user fires another request. */
  async function handleGenerateAi() {
    const prompt = ai.prompt.trim();
    if (!prompt || ai.status !== 'idle') return;
    if (!session?.user) {
      setCreditDialog('login');
      return;
    }

    const runId = ++genRunId.current;
    setAi((s) => ({ ...s, status: 'creating', error: undefined }));
    setAiElapsed(0);
    const tick = window.setInterval(() => setAiElapsed((n) => n + 1), 1000);

    try {
      // Image-to-image: send the current image as a base64 reference. If it
      // can't be read, fall back to text-to-image.
      let imageDataUrl: string | undefined;
      if (ai.useImage && image) {
        imageDataUrl = (await urlToDataUrl(image.src)) ?? undefined;
      }

      let taskId: string;
      try {
        const res = await generateMutation.mutateAsync({
          prompt,
          imageDataUrl,
        });
        taskId = res.taskId;
        if (res.warning) toast.info(res.warning);
      } catch (e: any) {
        if (runId !== genRunId.current) return;
        if (
          e?.message === 'INSUFFICIENT_CREDITS' ||
          e?.message === 'AUTH_REQUIRED'
        ) {
          setCreditDialog(e.message === 'AUTH_REQUIRED' ? 'login' : 'payment');
          setAi((s) => ({ ...s, status: 'idle', error: undefined }));
          return;
        }
        const msg = e?.message || m['editor.bubble_panel.failed']();
        setAi((s) => ({ ...s, status: 'idle', error: msg }));
        toast.error(msg);
        return;
      }
      if (runId !== genRunId.current) return;

      setAi((s) => ({ ...s, status: 'polling' }));

      const maxAttempts = 150; // Allow for upstream queueing (about five minutes).
      for (let i = 0; i < maxAttempts; i++) {
        await sleep(2000);
        if (runId !== genRunId.current) return;
        try {
          const r = await queryClient.fetchQuery({
            queryKey: ['editor-generation', taskId],
            staleTime: 0,
            queryFn: () =>
              apiGet<{ status: string; imageDataUrl?: string; error?: string }>(
                `/api/editor/generate?taskId=${encodeURIComponent(taskId)}`
              ),
          });
          if (r.status === 'success' && r.imageDataUrl) {
            if (runId !== genRunId.current) return;
            // Iron rule: every AI result lands as a transparent PNG sticker.
            let transparent: string;
            try {
              transparent = await makeTransparentPng(r.imageDataUrl);
            } catch {
              setAi((s) => ({
                ...s,
                status: 'idle',
                error: m['editor.bubble_panel.failed'](),
              }));
              return;
            }
            if (runId !== genRunId.current) return;
            addImageBubble(transparent);
            setAiResults((prev) =>
              [
                {
                  id: Math.random().toString(36).slice(2, 10),
                  dataUrl: transparent,
                  prompt,
                },
                ...prev,
              ].slice(0, 12)
            );
            setAi((s) => ({ ...s, status: 'idle', error: undefined }));
            toast.success(m['editor.bubble_panel.success']());
            return;
          }
          if (r.status === 'failed') {
            if (runId !== genRunId.current) return;
            const msg = r.error || m['editor.bubble_panel.failed']();
            setAi((s) => ({ ...s, status: 'idle', error: msg }));
            toast.error(msg);
            return;
          }
        } catch {
          // Transient poll error — keep going.
        }
      }
      if (runId !== genRunId.current) return;
      const msg = m['editor.bubble_panel.timeout']();
      setAi((s) => ({ ...s, status: 'idle', error: msg }));
      toast.error(msg);
    } finally {
      window.clearInterval(tick);
    }
  }

  // --- Stage sizing ---------------------------------------------------------
  const recomputeBox = useCallback(() => {
    const area = stageAreaRef.current;
    if (!area || !image) {
      setBox({ w: 0, h: 0 });
      return;
    }
    const cw = area.clientWidth;
    const ch = area.clientHeight;
    const imgAspect = image.naturalWidth / image.naturalHeight || 1;
    const boxAspect = cw / ch || 1;
    let renderW: number;
    let renderH: number;
    if (imgAspect > boxAspect) {
      renderW = cw;
      renderH = cw / imgAspect;
    } else {
      renderH = ch;
      renderW = ch * imgAspect;
    }
    setBox({ w: Math.round(renderW), h: Math.round(renderH) });
  }, [image]);

  useLayoutEffect(() => {
    recomputeBox();
    const area = stageAreaRef.current;
    if (!area) return;
    const ro = new ResizeObserver(() => recomputeBox());
    ro.observe(area);
    return () => ro.disconnect();
  }, [recomputeBox]);

  // --- Upload ---------------------------------------------------------------
  const loadImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(m['editor.error.unsupported']());
      return;
    }
    const url = URL.createObjectURL(file);
    const el = new Image();
    el.onload = () => {
      setImage({
        src: url,
        naturalWidth: el.naturalWidth,
        naturalHeight: el.naturalHeight,
      });
    };
    el.onerror = () => toast.error(m['editor.error.load']());
    el.src = url;
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) loadImageFile(f);
    e.target.value = '';
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragDepth.current = 0;
    setDropActive(false);
    // Drag a generated AI bubble onto the canvas → add it as an editable
    // sticker on top of the photo (or as the canvas image if there's no photo).
    const aiImg = e.dataTransfer.getData('application/x-ai-image');
    if (aiImg) {
      if (image) {
        const layer = layerRef.current;
        const { renderW, renderH } = sizeRef.current;
        let x = 0.5;
        let y = 0.5;
        if (layer && renderW > 0 && renderH > 0) {
          const r = layer.getBoundingClientRect();
          x = clamp((e.clientX - r.left) / renderW);
          y = clamp((e.clientY - r.top) / renderH);
        }
        addImageBubble(aiImg, x, y);
      } else {
        loadImageFromUrl(aiImg);
      }
      return;
    }
    // Otherwise, a file dropped from the OS.
    const f = e.dataTransfer.files?.[0];
    if (f) loadImageFile(f);
  };

  // --- Bubble ops -----------------------------------------------------------
  const addBubble = (type: BubbleType) => {
    const b = defaultBubble(type);
    setBubbles((prev) => [...prev, b]);
    setSelectedId(b.id);
  };

  const deleteBubble = (id: string) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateBubble = (id: string) => {
    const src = bubbles.find((b) => b.id === id);
    if (!src) return;
    const copy: Bubble = {
      ...src,
      id: `${src.id}_cp_${Math.random().toString(36).slice(2, 6)}`,
      x: clamp(src.x + 0.04),
      y: clamp(src.y + 0.04),
    };
    setBubbles((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const moveLayer = (id: string, dir: 'front' | 'back') => {
    setBubbles((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      if (dir === 'front') next.push(item);
      else next.unshift(item);
      return next;
    });
  };

  // --- Pointer dragging -----------------------------------------------------
  const dragRef = useRef<null | {
    mode: 'move' | 'resize' | 'resize-w' | 'tail' | 'scale';
    id: string;
    startX: number;
    startY: number;
    orig: Bubble;
    layerRect: DOMRect;
  }>(null);

  const onDragMove = useCallback(
    (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const { renderW, renderH } = sizeRef.current;
      if (!renderW || !renderH) return;
      if (d.mode === 'move') {
        const dx = (e.clientX - d.startX) / renderW;
        const dy = (e.clientY - d.startY) / renderH;
        updateBubble(d.id, {
          x: clamp(d.orig.x + dx),
          y: clamp(d.orig.y + dy),
        });
      } else if (d.mode === 'resize') {
        // Vertical-only resize: drag up/down changes the bubble's HEIGHT; the
        // width stays fixed. `h` is stored as a ratio of the image WIDTH, so the
        // pixel delta is scaled by renderW to match what the user sees.
        const dy = (e.clientY - d.startY) / renderW;
        const newH = clamp(d.orig.h + dy, 0.04, 2);
        if (d.orig.type === 'image') {
          updateBubble(d.id, { h: newH }); // width fixed, aspect ratio unlocked
        } else {
          // First manual resize flips off auto-height so the value sticks
          // (otherwise the content-measure loop would override it next tick).
          updateBubble(d.id, { h: newH, autoH: false });
        }
      } else if (d.mode === 'resize-w') {
        // Horizontal-only resize: drag left/right changes the bubble's WIDTH
        // (横向拉大放小). The box is positioned by its center, so changing `w`
        // grows it symmetrically on both sides. Text keeps its font size and
        // reflows; auto-height bubbles re-measure their height to fit.
        const dx = (e.clientX - d.startX) / renderW;
        const newW = clamp(d.orig.w + dx, 0.05, 1.5);
        updateBubble(d.id, { w: newW });
      } else if (d.mode === 'scale') {
        // Uniform (proportional) scaling around the bubble's center — drag a
        // corner handle and width, height, font size and stroke all scale
        // together, so the bubble grows or shrinks as one unit (等比放大缩小).
        // `k` is the ratio of the pointer's current distance from the center to
        // its distance at drag start; because the handle sits on the corner,
        // this keeps the corner under the cursor.
        const cx = d.layerRect.left + d.orig.x * renderW;
        const cy = d.layerRect.top + d.orig.y * renderH;
        const startDist = Math.hypot(d.startX - cx, d.startY - cy);
        if (startDist < 1) return;
        const k = clamp(
          Math.hypot(e.clientX - cx, e.clientY - cy) / startDist,
          0.2,
          5
        );
        const newW = clamp(d.orig.w * k, 0.05, 1.5);
        const kEff = newW / d.orig.w; // honor the width clamp exactly
        if (d.orig.type === 'image') {
          updateBubble(d.id, { w: newW, h: d.orig.h * kEff });
        } else {
          const patch: Partial<Bubble> = {
            w: newW,
            fontSize: d.orig.fontSize * kEff,
            strokeWidth: d.orig.strokeWidth * kEff,
          };
          // Only manual-height bubbles store an explicit h; auto-height
          // bubbles recompute it from the (now scaled) text content.
          if (!d.orig.autoH) patch.h = d.orig.h * kEff;
          updateBubble(d.id, patch);
        }
      } else {
        const tx = clamp((e.clientX - d.layerRect.left) / renderW);
        const ty = clamp((e.clientY - d.layerRect.top) / renderH);
        updateBubble(d.id, { tailX: tx, tailY: ty });
      }
    },
    [updateBubble]
  );

  const onDragUp = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener('pointermove', onDragMove);
    window.removeEventListener('pointerup', onDragUp);
  }, [onDragMove]);

  const startDrag = (
    e: React.PointerEvent,
    mode: 'move' | 'resize' | 'resize-w' | 'tail' | 'scale',
    bubble: Bubble
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedId(bubble.id);
    const layer = layerRef.current;
    dragRef.current = {
      mode,
      id: bubble.id,
      startX: e.clientX,
      startY: e.clientY,
      orig: bubble,
      layerRect: layer ? layer.getBoundingClientRect() : new DOMRect(),
    };
    window.addEventListener('pointermove', onDragMove);
    window.addEventListener('pointerup', onDragUp);
  };

  // --- Keyboard delete ------------------------------------------------------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable
      )
        return;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        deleteBubble(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // --- Download (freemium gating) ------------------------------------------
  const exportMutation = useMutation({
    mutationFn: () =>
      apiPost<{ hd: boolean; watermark: boolean; credits: number }>(
        '/api/editor/export',
        {}
      ),
  });
  const [downloading, setDownloading] = useState(false);
  /**
   * Rendered image shown in the long-press overlay. Used only in in-app
   * WebViews (WeChat) where a direct download can't be triggered — the user
   * long-presses the image to save it via the WebView's native menu.
   */
  const [preview, setPreview] = useState<{
    url: string;
    blob: Blob;
    watermark: boolean;
  } | null>(null);

  async function handleDownload() {
    if (!image || !imgRef.current || downloading) return;

    setDownloading(true);
    try {
      let hd = false;
      let watermark = true;

      if (session?.user) {
        try {
          const res = await exportMutation.mutateAsync();
          hd = res.hd;
          watermark = res.watermark;
        } catch {
          hd = false;
          watermark = true;
        }
      }

      const canvas = await renderToCanvas({
        image: { ...image, el: imgRef.current ?? undefined },
        bubbles,
        hd,
        watermark,
      });

      // Encode once as JPG, then open a preview the user confirms and saves
      // from. JPG is safe here — the photo is drawn first, so the canvas is
      // fully opaque and there's no transparency to lose.
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      // A null/empty blob means the canvas was tainted (cross-origin image) or
      // rendering produced no pixels — never hand the user a 0-byte file they
      // can't open. Surface a clear error instead.
      if (!blob || blob.size === 0) {
        toast.error(m['editor.error.export']());
        return;
      }

      // Show the rendered JPG; the user saves from the preview. Revoke any
      // previous preview URL so we don't leak object URLs across re-opens.
      setPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev.url);
        return { url: URL.createObjectURL(blob), blob, watermark };
      });

      // WeChat (and similar in-app WebViews) can't trigger a real download —
      // blob/data URLs are blocked or corrupted. The long-press hint in the
      // overlay is their only reliable save path (微信长按保存).
      if (isWeChatBrowser()) {
        toast.info(m['editor.save.wechat_tip']());
      }
    } finally {
      setDownloading(false);
    }
  }

  const closePreview = () => {
    setPreview((p) => {
      if (p) URL.revokeObjectURL(p.url);
      return null;
    });
  };

  const savePreview = () => {
    if (!preview) return;
    // Direct download as speech-bubbles.jpg. No "Save As" dialog — see the
    // note on saveBlobFallback for why the File System Access picker was
    // dropped (it could leave a 0-byte, unopenable file behind).
    if (!saveBlobFallback(preview.blob, 'speech-bubbles.jpg')) {
      toast.error(m['editor.error.export']());
      return;
    }
    if (preview.watermark) {
      toast.info(m['editor.toast.free']());
    } else {
      toast.success(m['editor.toast.hd']());
    }
    closePreview();
  };

  // --- Render ---------------------------------------------------------------
  const layerOffset = useMemo(() => {
    if (!box.w || !box.h) return { x: 0, y: 0 };
    const area = stageAreaRef.current;
    if (!area) return { x: 0, y: 0 };
    return {
      x: Math.max(0, (area.clientWidth - box.w) / 2),
      y: Math.max(0, (area.clientHeight - box.h) / 2),
    };
  }, [box]);

  return (
    <div
      className={cn('flex h-full w-full flex-col gap-4 lg:flex-row lg:gap-6')}
    >
      <Dialog
        open={creditDialog !== null}
        onOpenChange={(open) => {
          if (!open) setCreditDialog(null);
        }}
      >
        <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
          <Sparkles className="text-primary size-8" />
          <DialogTitle>
            {creditDialog === 'login'
              ? m['editor.credits.login_title']()
              : m['editor.credits.payment_title']()}
          </DialogTitle>
          <DialogDescription>
            {creditDialog === 'login'
              ? m['editor.credits.login_description']()
              : m['editor.credits.payment_description']()}
          </DialogDescription>
          <Link
            href={creditDialog === 'login' ? '/sign-in' : '/pricing'}
            className={cn(buttonVariants(), 'w-full')}
          >
            {creditDialog === 'login'
              ? m['editor.credits.login_action']()
              : m['editor.credits.payment_action']()}
          </Link>
        </DialogContent>
      </Dialog>
      {/* Stage */}
      <div className="flex min-h-[360px] flex-1 flex-col">
        <div
          ref={stageAreaRef}
          className={cn(
            'bg-muted/40 relative flex flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed transition-colors',
            dropActive && 'border-primary ring-primary/30 ring-4'
          )}
          onDragOver={(e) => e.preventDefault()}
          onDragEnter={(e) => {
            e.preventDefault();
            dragDepth.current++;
            setDropActive(true);
          }}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDropActive(false);
          }}
          onDrop={onDrop}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setSelectedId(null);
          }}
          style={{ minHeight: 360 }}
        >
          {!image ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:bg-muted flex w-full max-w-md flex-col items-center gap-3 rounded-xl px-6 py-12 text-center transition-colors"
            >
              <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-full">
                <Upload className="size-6" />
              </span>
              <span className="text-base font-medium">
                {m['editor.upload.title']()}
              </span>
              <span className="text-muted-foreground text-sm">
                {m['editor.upload.hint']()}
              </span>
            </button>
          ) : (
            <div
              ref={layerRef}
              className="absolute"
              style={{
                left: layerOffset.x,
                top: layerOffset.y,
                width: box.w,
                height: box.h,
              }}
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) setSelectedId(null);
              }}
            >
              <img
                ref={imgRef}
                src={image.src}
                alt=""
                draggable={false}
                className="pointer-events-none block rounded-sm select-none"
                style={{ width: box.w, height: box.h }}
              />

              {bubbles.map((b) => (
                <BubbleView
                  key={b.id}
                  bubble={b}
                  renderW={box.w}
                  renderH={box.h}
                  selected={b.id === selectedId}
                  editing={editingId === b.id}
                  onSelect={() => setSelectedId(b.id)}
                  onStartEdit={() => setEditingId(b.id)}
                  onEndEdit={() =>
                    setEditingId((id) => (id === b.id ? null : id))
                  }
                  onTextChange={(text) => updateBubble(b.id, { text })}
                  onStartDrag={startDrag}
                  onDuplicate={duplicateBubble}
                  onDelete={deleteBubble}
                  onMeasure={(ratio) => {
                    if (Math.abs(ratio - b.h) > 0.002)
                      updateBubble(b.id, { h: ratio });
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />

        {/* Toolbar */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-4" />
            {image ? m['editor.change_image']() : m['editor.upload.button']()}
          </Button>
          <div className="bg-border mx-1 h-5 w-px" />
          {BUBBLE_TYPES.map(({ type, icon: Icon, key }) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              disabled={!image}
              onClick={() => addBubble(type)}
            >
              <Icon className="size-4" />
              <span className="hidden sm:inline">{tDynamic(key)}</span>
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={!image || downloading}
            >
              <Download className="size-4" />
              {m['editor.download']()}
            </Button>
          </div>
        </div>
      </div>

      {/* Side panel — single AI-driven input. The user types whatever shape or
          category they want, we call nano-banana-2-lite via /api/editor/generate,
          drop the transparent PNG on the canvas. The toolbar below the stage
          still has the 8 instant local shape buttons for classic cases. */}
      {!compact && (
        <aside className="bg-card w-full shrink-0 space-y-4 overflow-y-auto rounded-2xl border p-4 lg:w-80">
          <BubblePanel
            ai={ai}
            elapsed={aiElapsed}
            results={aiResults}
            hasImage={!!image}
            onPromptChange={(prompt) => setAi((s) => ({ ...s, prompt }))}
            onUseImageChange={(useImage) => setAi((s) => ({ ...s, useImage }))}
            onGenerate={handleGenerateAi}
          />
          <div className="border-t" />
          {!selected ? (
            <div className="text-muted-foreground space-y-3 py-6 text-center text-sm">
              <Plus className="mx-auto size-6 opacity-50" />
              <p>{m['editor.panel.empty']()}</p>
            </div>
          ) : (
            <BubbleControls
              bubble={selected}
              onChange={(patch) => updateBubble(selected.id, patch)}
              onDuplicate={() => duplicateBubble(selected.id)}
              onDelete={() => deleteBubble(selected.id)}
              onLayer={(dir) => moveLayer(selected.id, dir)}
            />
          )}
          <p className="text-muted-foreground mt-4 text-center text-xs">
            {m['editor.panel.tip']()}
          </p>
        </aside>
      )}

      {/* Export preview — shows the rendered JPG; save from here. WeChat & other
          in-app WebViews that can't trigger a real download long-press the image
          to save it via the WebView's native menu. Tap the backdrop or ✕ to
          dismiss. */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
          onClick={closePreview}
        >
          <button
            type="button"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
            aria-label="Close"
          >
            <X className="size-6" />
          </button>
          <img
            src={preview.url}
            alt="Speech Bubbles export"
            className="max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div
            className="mt-4 flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <Button onClick={savePreview}>
              <Download className="size-4" />
              {m['editor.download']()}
            </Button>
          </div>
          {isWeChatBrowser() && (
            <p className="mt-3 text-center text-sm text-white/90">
              {m['editor.save.long_press_hint']()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bubble view (inline preview)
// ---------------------------------------------------------------------------

interface BubbleViewProps {
  bubble: Bubble;
  renderW: number;
  renderH: number;
  selected: boolean;
  editing: boolean;
  onSelect: () => void;
  onStartEdit: () => void;
  onEndEdit: () => void;
  onTextChange: (text: string) => void;
  onStartDrag: (
    e: React.PointerEvent,
    mode: 'move' | 'resize' | 'resize-w' | 'tail' | 'scale',
    bubble: Bubble
  ) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  /** Report the measured height (ratio of width) back so export matches preview. */
  onMeasure: (ratio: number) => void;
}

/**
 * Shared offscreen 2D context used to measure bubble text with canvas metrics.
 * The preview MUST size/​wrap text with the same `measureText` the export uses,
 * or the two surfaces diverge on borderline wraps (see `layoutBubbleText`).
 */
let textMeasureCtx: CanvasRenderingContext2D | null = null;
function getTextMeasureCtx(): CanvasRenderingContext2D | null {
  if (!textMeasureCtx) {
    const c = document.createElement('canvas');
    textMeasureCtx = c.getContext('2d');
  }
  return textMeasureCtx;
}

function BubbleView({
  bubble,
  renderW,
  renderH,
  selected,
  editing,
  onSelect,
  onStartEdit,
  onEndEdit,
  onTextChange,
  onStartDrag,
  onDuplicate,
  onDelete,
  onMeasure,
}: BubbleViewProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Bump once the bubble's font has actually loaded. @fontsource faces load
  // asynchronously, so the first layout pass measures with a fallback face and
  // wraps to a different line count than the exported PNG (which waits for
  // fonts). Re-measuring on load keeps the preview's box height == the export's,
  // so a bubble stays put between preview and export (不再「框乱/位置跑掉」).
  const [fontLoadTick, bumpFontLoadTick] = useState(0);

  // Focus + auto-grow the inline editor once when editing starts.
  useEffect(() => {
    const ta = taRef.current;
    if (!ta || !editing) return;
    ta.focus();
    ta.select();
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [editing]);

  const isImage = !!bubble.imageSrc;
  const boxW = bubble.w * renderW;
  const fontPx = bubble.fontSize * renderW;

  // Trigger the layout memo to re-run once the primary font face is available.
  useEffect(() => {
    if (isImage || typeof document === 'undefined' || !document.fonts) return;
    const first = bubble.fontFamily
      .split(',')[0]
      ?.trim()
      .replace(/^['"]|['"]$/g, '');
    if (!first) return;
    let alive = true;
    document.fonts
      .load(`${bubble.fontWeight} 64px "${first}"`)
      .then(() => {
        if (alive) bumpFontLoadTick((v) => v + 1);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [isImage, bubble.fontFamily, bubble.fontWeight]);

  // Text layout via CANVAS metrics — the SAME source of truth the exported PNG
  // uses. The old code measured height from the DOM (offsetHeight), but the
  // browser's HTML layout and canvas measureText disagree on borderline wraps,
  // so the preview and the export could wrap the same text to a different
  // number of lines and the exported box ended up the wrong height. Running
  // both through layoutBubbleText makes them wrap and size identically.
  const textLayout: TextLayout | null = useMemo(() => {
    if (isImage) return null;
    const ctx = getTextMeasureCtx();
    if (!ctx) return null;
    return layoutBubbleText(
      ctx,
      bubble.text,
      bubble.fontFamily,
      bubble.fontWeight,
      fontPx,
      boxW
    );
    // boxW derives from bubble.w + renderW; fontPx from bubble.fontSize + renderW.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isImage,
    bubble.text,
    bubble.fontFamily,
    bubble.fontWeight,
    bubble.fontSize,
    bubble.w,
    renderW,
    fontLoadTick,
  ]);

  const measuredH = textLayout?.height ?? bubble.h * renderW;
  // Render the canvas-broken lines verbatim (white-space: pre) so the on-screen
  // text wraps exactly like the export, instead of letting CSS re-wrap.
  const displayText = textLayout
    ? textLayout.lines.join('\n')
    : bubble.text || ' ';

  // Keep bubble.h (ratio of width) in sync with the canvas-measured height, so
  // manual-height and image bubbles (which read b.h in the export) stay correct.
  useEffect(() => {
    if (bubble.autoH && renderW > 0 && textLayout) {
      onMeasure(textLayout.height / renderW);
    }
    // onMeasure identity is stable; we track the layout drivers only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textLayout, bubble.autoH, renderW]);

  const boxH = isImage
    ? bubble.h * renderW
    : bubble.autoH
      ? measuredH || bubble.h * renderW || boxW * 0.3
      : bubble.h * renderW;
  const strokePx = bubble.strokeWidth * renderW;
  const padX = fontPx * 0.6;
  const padY = fontPx * 0.45;

  const hasTail = bubble.type === 'speech' || bubble.type === 'thought';
  const tail = hasTail
    ? {
        x: bubble.tailX * renderW - (bubble.x * renderW - boxW / 2),
        y: bubble.tailY * renderH - (bubble.y * renderH - boxH / 2),
      }
    : null;

  const shape = buildBubbleShape(bubble.type, boxW, boxH, tail);

  return (
    <>
      {/* Tail handle (image coordinates) */}
      {selected && hasTail && (
        <div
          className="border-primary bg-background absolute z-20 size-4 cursor-grab rounded-full border-2 shadow"
          style={{
            left: bubble.tailX * renderW - 8,
            top: bubble.tailY * renderH - 8,
          }}
          onPointerDown={(e) => onStartDrag(e, 'tail', bubble)}
          title="Drag tail"
        />
      )}

      <div
        ref={wrapRef}
        className={cn('absolute z-10', editing ? 'cursor-text' : 'cursor-move')}
        style={{
          left: bubble.x * renderW - boxW / 2,
          top: bubble.y * renderH - boxH / 2,
          width: boxW,
          // Fixed height once the user has manually resized vertically; before
          // that the height is content-driven (no explicit height here).
          ...(bubble.autoH ? {} : { height: boxH }),
        }}
        onPointerDown={(e) => {
          if (editing) return; // let clicks place the caret, not drag
          onSelect();
          onStartDrag(e, 'move', bubble);
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (!isImage && !editing) {
            onSelect();
            onStartEdit();
          }
        }}
      >
        {isImage ? (
          <img
            src={bubble.imageSrc}
            width={boxW}
            height={boxH}
            alt=""
            draggable={false}
            className="pointer-events-none select-none"
            style={{ objectFit: 'contain' }}
          />
        ) : (
          <>
            {/* Shape */}
            <svg
              width={boxW}
              height={boxH}
              viewBox={`0 0 ${boxW} ${boxH}`}
              className="absolute inset-0"
              style={{ overflow: 'visible' }}
            >
              {shape.fills.map((d, i) => (
                <path key={`f${i}`} d={d} fill={bubble.fill} />
              ))}
              {shape.strokes.map((d, i) => (
                <path
                  key={`s${i}`}
                  d={d}
                  fill="none"
                  stroke={bubble.stroke}
                  strokeWidth={strokePx}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Text (or inline editor — double-click a bubble to edit in place) */}
            {editing ? (
              <textarea
                ref={taRef}
                value={bubble.text}
                rows={1}
                onChange={(e) => onTextChange(e.target.value)}
                onInput={(e) => {
                  const ta = e.currentTarget;
                  ta.style.height = 'auto';
                  ta.style.height = `${ta.scrollHeight}px`;
                }}
                onBlur={onEndEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    e.preventDefault();
                    (e.currentTarget as HTMLTextAreaElement).blur();
                  }
                }}
                className="relative w-full resize-none overflow-hidden border-0 bg-transparent p-0 outline-none"
                style={{
                  padding: `${padY}px ${padX}px`,
                  fontFamily: bubble.fontFamily,
                  fontSize: fontPx,
                  fontWeight: bubble.fontWeight,
                  color: bubble.color,
                  textAlign: bubble.align,
                  lineHeight: 1.25,
                }}
              />
            ) : bubble.autoH ? (
              <div
                className="relative whitespace-pre"
                style={{
                  padding: `${padY}px ${padX}px`,
                  fontFamily: bubble.fontFamily,
                  fontSize: fontPx,
                  fontWeight: bubble.fontWeight,
                  color: bubble.color,
                  textAlign: bubble.align,
                  lineHeight: 1.25,
                  userSelect: 'none',
                }}
              >
                {displayText}
              </div>
            ) : (
              // Manual height: vertically center the text inside the fixed box.
              <div
                className="absolute inset-0 flex items-center"
                style={{
                  fontFamily: bubble.fontFamily,
                  fontSize: fontPx,
                  fontWeight: bubble.fontWeight,
                  color: bubble.color,
                  lineHeight: 1.25,
                  userSelect: 'none',
                }}
              >
                <div
                  className="w-full whitespace-pre"
                  style={{
                    padding: `0 ${padX}px`,
                    textAlign: bubble.align,
                  }}
                >
                  {displayText}
                </div>
              </div>
            )}
          </>
        )}

        {/* Selection frame + handles */}
        {selected && (
          <>
            <div className="border-primary pointer-events-none absolute -inset-1 rounded-[4px] border-2" />
            {/* Corner handles — drag to scale the bubble proportionally (等比). */}
            {(
              [
                ['-top-1.5 -left-1.5', 'cursor-nwse-resize'],
                ['-top-1.5 -right-1.5', 'cursor-nesw-resize'],
                ['-bottom-1.5 -left-1.5', 'cursor-nesw-resize'],
                ['-bottom-1.5 -right-1.5', 'cursor-nwse-resize'],
              ] as const
            ).map(([pos, cursor]) => (
              <div
                key={pos}
                className={cn(
                  'bg-primary border-background absolute size-3 rounded-sm border-2',
                  pos,
                  cursor
                )}
                onPointerDown={(e) => onStartDrag(e, 'scale', bubble)}
                title="Scale proportionally"
              />
            ))}
            {/* Edge handles — drag to resize one axis only. */}
            {(
              [
                [
                  '-left-1.5 top-1/2 -translate-y-1/2',
                  'cursor-ew-resize',
                  'resize-w',
                ],
                [
                  '-right-1.5 top-1/2 -translate-y-1/2',
                  'cursor-ew-resize',
                  'resize-w',
                ],
              ] as const
            ).map(([pos, cursor, mode]) => (
              <div
                key={pos}
                className={cn(
                  'bg-primary border-background absolute size-3 rounded-sm border-2',
                  pos,
                  cursor
                )}
                onPointerDown={(e) => onStartDrag(e, mode, bubble)}
                title="Resize width"
              />
            ))}
            {/* Resize handle (vertical — drag to change height) */}
            <div
              className="bg-primary border-background absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 cursor-ns-resize rounded-sm border-2"
              onPointerDown={(e) => onStartDrag(e, 'resize', bubble)}
              title="Resize height"
            />
            {/* Quick actions */}
            <div className="bg-background absolute -top-9 right-0 flex items-center gap-0.5 rounded-md border p-0.5 shadow-sm">
              <button
                className="hover:bg-muted rounded p-1"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(bubble.id);
                }}
                title="Duplicate"
              >
                <Copy className="size-3.5" />
              </button>
              <button
                className="hover:bg-muted text-destructive rounded p-1"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(bubble.id);
                }}
                title="Delete"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// "Add bubble" panel — what the user types becomes the new bubble's text.
// Clicking Add drops a classic editable speech bubble on the canvas.
// ---------------------------------------------------------------------------
// "Add bubble" panel — the single input box. The user types whatever bubble
// shape or category they want ("cat", "shouting sun", "neon cloud", "cute
// rabbit", "logo with a hat" — anything). Clicking Add calls
// /api/editor/generate (Kie nano-banana-2-lite), drops the transparent PNG
// on the canvas. The toolbar below the stage still has 8 instant local
// shape buttons for the classic cases where the user doesn't want to wait
// ~30s for an AI round-trip.
// ---------------------------------------------------------------------------

interface BubblePanelProps {
  ai: {
    status: 'idle' | 'creating' | 'polling';
    prompt: string;
    useImage: boolean;
    error?: string;
  };
  elapsed: number;
  results: { id: string; dataUrl: string; prompt: string }[];
  hasImage: boolean;
  onPromptChange: (v: string) => void;
  onUseImageChange: (v: boolean) => void;
  onGenerate: () => void;
}

function BubblePanel({
  ai,
  elapsed,
  results,
  hasImage,
  onPromptChange,
  onUseImageChange,
  onGenerate,
}: BubblePanelProps) {
  const busy = ai.status !== 'idle';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-4" />
        <span className="text-sm font-medium">
          {m['editor.bubble_panel.title']()}
        </span>
      </div>
      <textarea
        value={ai.prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={3}
        maxLength={2000}
        aria-label={m['editor.bubble_panel.title']()}
        disabled={busy}
        placeholder={m['editor.bubble_panel.placeholder']()}
        className="border-input bg-background focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-60"
      />
      {hasImage && (
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={ai.useImage}
            disabled={busy}
            onChange={(e) => onUseImageChange(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          {m['editor.bubble_panel.use_image']()}
        </label>
      )}
      <Button
        size="sm"
        className="w-full gap-1.5"
        onClick={onGenerate}
        disabled={busy || !ai.prompt.trim()}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {busy
          ? m['editor.bubble_panel.generating']({ seconds: elapsed })
          : m['editor.bubble_panel.add']()}
      </Button>
      <p className="text-muted-foreground text-xs">
        {m['editor.credits.cost']()}
      </p>
      {ai.error && <p className="text-destructive text-xs">{ai.error}</p>}

      {/* Results gallery — drag a result onto the canvas to use it elsewhere,
          or hover and click download. The latest result is auto-dropped on
          the canvas by handleGenerateAi. */}
      {results.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-muted-foreground text-xs font-medium">
            {m['editor.bubble_panel.results']()}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="group relative aspect-square overflow-hidden rounded-md border"
                title={r.prompt}
              >
                <img
                  src={r.dataUrl}
                  alt={r.prompt}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/x-ai-image', r.dataUrl);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  className="h-full w-full cursor-grab object-contain p-1 active:cursor-grabbing"
                />
                <button
                  type="button"
                  className="bg-background/80 absolute top-1 right-1 rounded p-1 opacity-0 shadow-sm transition group-hover:opacity-100"
                  onClick={() => downloadDataUrl(r.dataUrl, `ai-${r.id}.png`)}
                  title={m['editor.bubble_panel.download']()}
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {m['editor.bubble_panel.drag_hint']()}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// AiPanel was merged into BubblePanel above — the user wants a single
// "Add bubble" input that goes straight to nano-banana-2-lite for any
// shape or category. Removed.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Side-panel controls
// ---------------------------------------------------------------------------

interface BubbleControlsProps {
  bubble: Bubble;
  onChange: (patch: Partial<Bubble>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onLayer: (dir: 'front' | 'back') => void;
}

function BubbleControls({
  bubble,
  onChange,
  onDuplicate,
  onDelete,
  onLayer,
}: BubbleControlsProps) {
  // Font <optgroup> labels — resolved per-render so they follow the active locale.
  const fontGroupLabels: Record<FontGroupId, string> = {
    standard: m['editor.controls.font_standard'](),
    cartoon: m['editor.controls.font_cartoon'](),
  };

  // Image (AI) sticker bubbles have no text/shape/style — only arrange/delete.
  if (bubble.type === 'image') {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          {m['editor.controls.image_bubble']()}
        </p>
        <div className="border-t pt-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLayer('front')}
            >
              {m['editor.controls.bring_front']()}
            </Button>
            <Button variant="outline" size="sm" onClick={() => onLayer('back')}>
              {m['editor.controls.send_back']()}
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" onClick={onDuplicate}>
              <Copy className="size-4" />
              {m['editor.controls.duplicate']()}
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="size-4" />
              {m['editor.controls.delete']()}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-foreground text-sm font-medium">
          {m['editor.controls.text']()}
        </label>
        <textarea
          value={bubble.text}
          onChange={(e) => onChange({ text: e.target.value })}
          rows={3}
          className="border-input bg-background focus-visible:ring-ring mt-2 w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2"
          placeholder={m['editor.controls.text_placeholder']()}
        />
      </div>

      <Field label={m['editor.controls.type']()}>
        <div className="grid grid-cols-4 gap-1">
          {BUBBLE_TYPES.map(({ type, icon: Icon }) => (
            <button
              key={type}
              className={cn(
                'flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors',
                bubble.type === type
                  ? 'border-primary text-primary bg-primary/10'
                  : 'hover:bg-muted'
              )}
              onClick={() => onChange({ type })}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </Field>

      <Field label={m['editor.controls.font']()}>
        <select
          value={bubble.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value })}
          className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm"
        >
          {FONT_OPTIONS.map((g) => (
            <optgroup key={g.id} label={fontGroupLabels[g.id]}>
              {g.options.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>

      <RangeField
        label={m['editor.controls.size']()}
        min={0.02}
        max={0.14}
        step={0.002}
        value={bubble.fontSize}
        onChange={(v) => onChange({ fontSize: v })}
      />

      <div className="grid grid-cols-3 gap-2">
        <Field label={m['editor.controls.weight']()}>
          <select
            value={bubble.fontWeight}
            onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
            className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-sm"
          >
            {[400, 500, 600, 700, 800, 900].map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </Field>
        <ColorField
          label={m['editor.controls.text_color']()}
          value={bubble.color}
          onChange={(v) => onChange({ color: v })}
        />
        {(bubble.type === 'caption' || bubble.type === 'shout') && (
          <ColorField
            label={m['editor.controls.outline']()}
            value={bubble.stroke}
            onChange={(v) => onChange({ stroke: v })}
          />
        )}
      </div>

      <Field label={m['editor.controls.align']()}>
        <div className="grid grid-cols-3 gap-1">
          {(
            [
              ['left', AlignLeft],
              ['center', AlignCenter],
              ['right', AlignRight],
            ] as const
          ).map(([val, Icon]) => (
            <button
              key={val}
              className={cn(
                'flex items-center justify-center rounded-md border p-2 transition-colors',
                bubble.align === val
                  ? 'border-primary bg-primary/10'
                  : 'hover:bg-muted'
              )}
              onClick={() => onChange({ align: val })}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </Field>

      {bubble.type !== 'caption' && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
              {m['editor.controls.fill']()}
            </label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={bubble.fill !== 'transparent'}
                  onChange={(e) =>
                    onChange({
                      fill: e.target.checked ? '#ffffff' : 'transparent',
                    })
                  }
                  className="accent-[var(--primary)]"
                />
                {m['editor.controls.solid_fill']()}
              </label>
              {bubble.fill !== 'transparent' && (
                <input
                  type="color"
                  value={normalizeColor(bubble.fill)}
                  onChange={(e) => onChange({ fill: e.target.value })}
                  className="border-input bg-background size-7 cursor-pointer rounded border p-0.5"
                />
              )}
            </div>
          </div>
          <ColorField
            label={m['editor.controls.border']()}
            value={bubble.stroke}
            onChange={(v) => onChange({ stroke: v })}
          />
        </div>
      )}

      {bubble.type !== 'caption' && (
        <RangeField
          label={m['editor.controls.border_width']()}
          min={0.001}
          max={0.02}
          step={0.001}
          value={bubble.strokeWidth}
          onChange={(v) => onChange({ strokeWidth: v })}
        />
      )}

      <div className="border-t pt-3">
        <label className="text-muted-foreground block text-xs">
          {bubble.type === 'speech' || bubble.type === 'thought'
            ? m['editor.controls.tail_hint']()
            : m['editor.controls.layer_hint']()}
        </label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={() => onLayer('front')}>
            {m['editor.controls.bring_front']()}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onLayer('back')}>
            {m['editor.controls.send_back']()}
          </Button>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="size-4" />
            {m['editor.controls.duplicate']()}
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="size-4" />
            {m['editor.controls.delete']()}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

function RangeField({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--primary)]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-muted-foreground mb-1.5 block text-xs font-medium">
        {label}
      </label>
      <div className="border-input bg-background flex items-center gap-2 rounded-md border px-2 py-1">
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
        />
      </div>
    </div>
  );
}

/** Color inputs only accept #rrggbb; keep the stored value compatible. */
function normalizeColor(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    return (
      '#' +
      v
        .slice(1)
        .split('')
        .map((c) => c + c)
        .join('')
    );
  }
  return '#000000';
}

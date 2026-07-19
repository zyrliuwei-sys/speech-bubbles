'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Cloud,
  Copy,
  Download,
  Loader2,
  MessageCircle,
  Plus,
  Sparkles,
  Trash2,
  Type,
  Upload,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import { apiGet, apiPost } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Button } from '@/components/ui/button';

import { buildBubbleShape } from './bubble-shapes';
import { downloadCanvas, renderToCanvas } from './export';
import {
  defaultBubble,
  FONT_OPTIONS,
  type Bubble,
  type BubbleType,
  type EditorImage,
} from './types';

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

/** Trigger a browser download for a data URL. */
function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Force an AI image into a transparent PNG sticker — the editor's iron rule.
 * Flood-removes the uniform background (sampled from the borders, expanding
 * through connected pixels within a color tolerance) and re-encodes as PNG with
 * an alpha channel. If the model already returned transparency, it's kept and
 * just re-encoded. Always returns a `data:image/png` URL. On any failure it
 * falls back to the original so generation never breaks.
 */
async function makeTransparentPng(dataUrl: string): Promise<string> {
  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    el.src = dataUrl;
  });
  if (!img) return dataUrl;

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
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, w, h);

  let imageData: ImageData;
  try {
    imageData = ctx.getImageData(0, 0, w, h);
  } catch {
    return dataUrl; // cross-origin taint — can't read pixels
  }
  const px = imageData.data;

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

  // Background seed = average RGB of the (opaque) border pixels.
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
  // transparent) neighbors. Connectivity is what preserves interior highlights
  // that happen to match the background color.
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
];

export interface SpeechBubbleEditorProps {
  /** Hide the side panel (e.g. when embedded as a read-only showcase). */
  compact?: boolean;
}

export function SpeechBubbleEditor({
  compact = false,
}: SpeechBubbleEditorProps) {
  const { data: session } = useSession();
  const [image, setImage] = useState<EditorImage | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  // --- AI generation (kie nano-banana-2-lite) ------------------------------
  const [ai, setAi] = useState<{
    status: 'idle' | 'creating' | 'polling';
    prompt: string;
    useImage: boolean;
    error?: string;
  }>({ status: 'idle', prompt: '', useImage: true });
  const genRunId = useRef(0);
  const dragDepth = useRef(0);

  // Generated AI images, newest first. Each is downloadable or draggable onto
  // the canvas to use as the background.
  const [aiResults, setAiResults] = useState<
    { id: string; dataUrl: string; prompt: string }[]
  >([]);
  const [dropActive, setDropActive] = useState(false);
  const [aiElapsed, setAiElapsed] = useState(0);

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

  async function handleGenerate() {
    const prompt = ai.prompt.trim();
    if (!prompt || ai.status !== 'idle') return;

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
      // No reference image → text-to-image bubble generation. The server wraps
      // the prompt to force a 3D cartoon bubble; here we guarantee the result
      // is a transparent PNG (iron rule) regardless of model cooperation.
      const wasBubbleGen = !imageDataUrl;

      let taskId: string;
      try {
        const res = await apiPost<{ taskId: string }>('/api/editor/generate', {
          prompt,
          imageDataUrl,
        });
        taskId = res.taskId;
      } catch (e: any) {
        if (runId !== genRunId.current) return;
        const msg = e?.message || m['editor.ai.failed']();
        setAi((s) => ({ ...s, status: 'idle', error: msg }));
        toast.error(msg);
        return;
      }
      if (runId !== genRunId.current) return;

      setAi((s) => ({ ...s, status: 'polling' }));

      const maxAttempts = 60; // ~2 minutes
      for (let i = 0; i < maxAttempts; i++) {
        await sleep(2000);
        if (runId !== genRunId.current) return;
        try {
          const r = await apiGet<{
            status: string;
            imageDataUrl?: string;
            error?: string;
          }>(`/api/editor/generate?taskId=${encodeURIComponent(taskId)}`);
          if (r.status === 'success' && r.imageDataUrl) {
            if (runId !== genRunId.current) return;
            let finalUrl = r.imageDataUrl;
            if (wasBubbleGen) {
              try {
                finalUrl = await makeTransparentPng(r.imageDataUrl);
              } catch {
                finalUrl = r.imageDataUrl; // never let post-processing break it
              }
            }
            if (runId !== genRunId.current) return;
            setAiResults((prev) =>
              [
                {
                  id: Math.random().toString(36).slice(2, 10),
                  dataUrl: finalUrl,
                  prompt,
                },
                ...prev,
              ].slice(0, 12)
            );
            setAi((s) => ({ ...s, status: 'idle', error: undefined }));
            toast.success(m['editor.ai.success']());
            return;
          }
          if (r.status === 'failed') {
            if (runId !== genRunId.current) return;
            const msg = r.error || m['editor.ai.failed']();
            setAi((s) => ({ ...s, status: 'idle', error: msg }));
            toast.error(msg);
            return;
          }
        } catch {
          // Transient poll error — keep going.
        }
      }
      if (runId !== genRunId.current) return;
      const msg = m['editor.ai.timeout']();
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
    // Drag a generated AI result onto the canvas → use as background.
    const aiImg = e.dataTransfer.getData('application/x-ai-image');
    if (aiImg) {
      loadImageFromUrl(aiImg);
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
    mode: 'move' | 'resize' | 'tail';
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
        const dx = (e.clientX - d.startX) / renderW;
        updateBubble(d.id, { w: clamp(d.orig.w + dx, 0.08, 0.98) });
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
    mode: 'move' | 'resize' | 'tail',
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

  async function handleDownload() {
    if (!image || !imgRef.current) return;
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

    const canvas = renderToCanvas({
      image: { ...image, el: imgRef.current },
      bubbles,
      hd,
      watermark,
    });
    downloadCanvas(canvas, 'speech-bubbles.png');

    if (watermark) {
      toast.info(m['editor.toast.free']());
    } else {
      toast.success(m['editor.toast.hd']());
    }
  }

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
                  onSelect={() => setSelectedId(b.id)}
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
              <span className="hidden sm:inline">{m[key]()}</span>
            </Button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={!image || exportMutation.isPending}
            >
              <Download className="size-4" />
              {m['editor.download']()}
            </Button>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {!compact && (
        <aside className="bg-card w-full shrink-0 space-y-4 overflow-y-auto rounded-2xl border p-4 lg:w-80">
          <AiPanel
            hasImage={!!image}
            state={ai}
            elapsed={aiElapsed}
            results={aiResults}
            onPromptChange={(prompt) => setAi((s) => ({ ...s, prompt }))}
            onUseImageChange={(useImage) => setAi((s) => ({ ...s, useImage }))}
            onGenerate={handleGenerate}
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
  onSelect: () => void;
  onStartDrag: (
    e: React.PointerEvent,
    mode: 'move' | 'resize' | 'tail',
    bubble: Bubble
  ) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  /** Report the measured height (ratio of width) back so export matches preview. */
  onMeasure: (ratio: number) => void;
}

function BubbleView({
  bubble,
  renderW,
  renderH,
  selected,
  onSelect,
  onStartDrag,
  onDuplicate,
  onDelete,
  onMeasure,
}: BubbleViewProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [measuredH, setMeasuredH] = useState(bubble.h * renderW);

  // Keep bubble.h (ratio of width) in sync with the rendered height.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const h = el.offsetHeight;
      setMeasuredH(h);
      if (renderW > 0) onMeasure(h / renderW);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
    // onMeasure identity is stable enough; we intentionally track text/font/size drivers.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bubble.text,
    bubble.fontSize,
    bubble.fontFamily,
    bubble.fontWeight,
    renderW,
  ]);

  const boxW = bubble.w * renderW;
  const boxH = measuredH || bubble.h * renderW || boxW * 0.3;
  const fontPx = bubble.fontSize * renderW;
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
        className="absolute z-10 cursor-move"
        style={{
          left: bubble.x * renderW - boxW / 2,
          top: bubble.y * renderH - boxH / 2,
          width: boxW,
        }}
        onPointerDown={(e) => {
          onSelect();
          onStartDrag(e, 'move', bubble);
        }}
      >
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

        {/* Text */}
        <div
          className="relative break-words whitespace-pre-wrap"
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
          {bubble.text || ' '}
        </div>

        {/* Selection frame + handles */}
        {selected && (
          <>
            <div className="border-primary pointer-events-none absolute -inset-1 rounded-[4px] border-2" />
            {/* Resize handle */}
            <div
              className="bg-primary border-background absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize rounded-sm border-2"
              onPointerDown={(e) => onStartDrag(e, 'resize', bubble)}
              title="Resize"
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
// AI panel (kie nano-banana-2-lite)
// ---------------------------------------------------------------------------

interface AiPanelProps {
  hasImage: boolean;
  state: {
    status: 'idle' | 'creating' | 'polling';
    prompt: string;
    useImage: boolean;
    error?: string;
  };
  elapsed: number;
  results: { id: string; dataUrl: string; prompt: string }[];
  onPromptChange: (v: string) => void;
  onUseImageChange: (v: boolean) => void;
  onGenerate: () => void;
}

function AiPanel({
  hasImage,
  state,
  elapsed,
  results,
  onPromptChange,
  onUseImageChange,
  onGenerate,
}: AiPanelProps) {
  const busy = state.status !== 'idle';
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="text-primary size-4" />
        <span className="text-sm font-medium">{m['editor.ai.title']()}</span>
      </div>
      <textarea
        value={state.prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={3}
        disabled={busy}
        placeholder={m['editor.ai.prompt_placeholder']()}
        className="border-input bg-background focus-visible:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 disabled:opacity-60"
      />
      {hasImage && (
        <label className="text-muted-foreground flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={state.useImage}
            disabled={busy}
            onChange={(e) => onUseImageChange(e.target.checked)}
            className="accent-[var(--primary)]"
          />
          {m['editor.ai.use_image']()}
        </label>
      )}
      <Button
        size="sm"
        className="w-full gap-1.5"
        onClick={onGenerate}
        disabled={busy || !state.prompt.trim()}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Sparkles className="size-4" />
        )}
        {busy ? m['editor.ai.generating']() : m['editor.ai.generate']()}
      </Button>
      {busy && (
        <p className="text-muted-foreground text-xs">
          {m['editor.ai.polling']()} ({elapsed}s)
        </p>
      )}
      {state.error && <p className="text-destructive text-xs">{state.error}</p>}
      <p className="text-muted-foreground text-xs">{m['editor.ai.hint']()}</p>

      {/* Results gallery */}
      {results.length > 0 && (
        <div className="space-y-2 border-t pt-3">
          <div className="text-muted-foreground text-xs font-medium">
            {m['editor.ai.results']()}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {results.map((r) => (
              <div
                key={r.id}
                className="checker-bg group relative aspect-square overflow-hidden rounded-md border"
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
                  title={m['editor.ai.download']()}
                >
                  <Download className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground text-xs">
            {m['editor.ai.drag_hint']()}
          </p>
        </div>
      )}
    </div>
  );
}

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
          {FONT_OPTIONS.map((f) => (
            <option key={f.label} value={f.value}>
              {f.label}
            </option>
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
          <ColorField
            label={m['editor.controls.fill']()}
            value={bubble.fill}
            onChange={(v) => onChange({ fill: v })}
          />
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

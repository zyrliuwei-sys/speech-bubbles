import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createFileRoute } from '@tanstack/react-router';

import { KieProvider } from '@/core/ai/kie';
import { AIMediaType, AITaskStatus } from '@/core/ai/types';
import { envConfigs } from '@/config';
import { getAllConfigs } from '@/modules/config/service';
import { getStorage } from '@/modules/storage/service';
import { md5 } from '@/lib/hash';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';
import { respData, respErr } from '@/lib/resp';

/**
 * Kie image model used by the Speech Bubbles editor for AI generation /
 * image editing. nano-banana-2-lite = Google Gemini image model exposed via
 * https://kie.ai. It requires `input.aspect_ratio` and (for edits) uses
 * `input.image_urls` with publicly-reachable URLs — base64 is rejected.
 */
const EDITOR_AI_MODEL = 'nano-banana-2-lite';
const EDITOR_AI_ASPECT = 'auto';

type GenStatus = 'pending' | 'processing' | 'success' | 'failed';

function mapStatus(s: AITaskStatus): GenStatus {
  switch (s) {
    case AITaskStatus.PROCESSING:
      return 'processing';
    case AITaskStatus.SUCCESS:
      return 'success';
    case AITaskStatus.FAILED:
    case AITaskStatus.CANCELED:
      return 'failed';
    default:
      return 'pending';
  }
}

async function getKieProvider(): Promise<KieProvider | null> {
  const configs = await getAllConfigs();
  const apiKey = configs.kie_api_key;
  if (!apiKey) return null;
  return new KieProvider({ apiKey });
}

/** Fetch a remote image and re-serve it as a base64 data URL so the client
 *  can draw it to canvas without cross-origin taint. */
async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const ct = r.headers.get('content-type') || 'image/png';
    const b64 = Buffer.from(new Uint8Array(buf)).toString('base64');
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}

function extFromMime(ct: string): string {
  return (
    {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/avif': 'avif',
    }[ct] || ''
  );
}

/** A URL Kie's servers can actually fetch — not a localhost/private host. */
function isPubliclyReachable(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return (
      h !== 'localhost' &&
      !h.startsWith('127.') &&
      h !== '0.0.0.0' &&
      h !== '::1'
    );
  } catch {
    return false;
  }
}

/**
 * Host a base64 data URL so Kie can fetch it: upload to R2 when configured,
 * otherwise persist under public/uploads and return an absolute app URL.
 * Returns null if it can't be made publicly reachable.
 */
async function hostReferenceImage(dataUrl: string): Promise<string | null> {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl);
  if (!m) return null;
  const ct = m[1];
  const buf = Buffer.from(m[2], 'base64');
  // Cap the size — this endpoint is open (no auth), so an unbounded write to
  // public/uploads (or R2) would let a client fill disk/storage. Mirrors the
  // upload-image route's INLINE_MAX_BYTES guard.
  const maxBytes = (Number(envConfigs.inline_image_max_kb) || 10240) * 1024;
  if (buf.length > maxBytes) {
    throw new Error(
      `Reference image is too large (${Math.round(buf.length / 1024)}KB). Use a smaller image.`
    );
  }
  const ext = extFromMime(ct) || 'bin';
  const key = `${md5(new Uint8Array(buf))}.${ext}`;

  const storage = await getStorage();
  if (storage) {
    const r = await storage.uploadFile({
      body: buf,
      key,
      contentType: ct,
      disposition: 'inline',
    });
    return r.success && r.url ? r.url : null;
  }

  // No object storage — write to public/uploads and serve from app_url.
  // Only useful when the app is publicly hosted (kie can't reach localhost).
  const base = (envConfigs.app_url || '').replace(/\/$/, '');
  if (!base || !isPubliclyReachable(base)) return null;
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, key), buf);
  return `${base}/uploads/${key}`;
}

/**
 * POST /api/editor/generate
 * Body: { prompt: string, imageDataUrl?: string }
 * Text-to-image when no image is supplied; image-to-image otherwise. Returns
 * the async task's taskId.
 */
async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 4000,
    keyPrefix: 'editor-ai-gen',
  });
  if (limited) return limited;

  try {
    const provider = await getKieProvider();
    if (!provider) return respErr('AI is not configured');

    const body = await request.json().catch(() => null);
    const prompt = (body as any)?.prompt?.toString().trim();
    const imageDataUrl = (body as any)?.imageDataUrl?.toString();
    if (!prompt) return respErr('Prompt is required');

    // For image editing, host the reference image so Kie can fetch it. If
    // hosting isn't possible (localhost / no storage / too large), fall back to
    // plain text-to-image instead of failing — generation should always produce
    // a result.
    let refUrl: string | null = null;
    let warning: string | undefined;
    if (imageDataUrl) {
      try {
        refUrl = await hostReferenceImage(imageDataUrl);
      } catch (e: any) {
        warning = e?.message;
      }
      if (!refUrl && !warning) {
        warning =
          'Could not use your image as a reference (configure R2 storage in admin settings or run on a public URL). Generated a new image instead.';
      }
    }

    const result = await provider.generate({
      params: {
        mediaType: AIMediaType.IMAGE,
        model: EDITOR_AI_MODEL,
        prompt,
        options: {
          aspect_ratio: EDITOR_AI_ASPECT,
          ...(refUrl ? { image_urls: [refUrl] } : {}),
        },
      },
    });

    return respData({ taskId: result.taskId, warning });
  } catch (e: any) {
    console.error('editor generate failed:', e);
    return respErr(e?.message || 'Failed to start generation');
  }
}

/**
 * GET /api/editor/generate?taskId=...
 * Polls the Kie task. On success returns the generated image as a data URL.
 */
async function GET({ request }: { request: Request }) {
  try {
    const provider = await getKieProvider();
    if (!provider) return respErr('AI is not configured');

    const taskId = new URL(request.url).searchParams.get('taskId');
    if (!taskId) return respErr('taskId is required');

    let status: GenStatus;
    let result;
    try {
      result = await provider.query({ taskId, mediaType: AIMediaType.IMAGE });
      status = mapStatus(result.taskStatus);
    } catch {
      // Task not registered yet, transient upstream blip, or an intermediate
      // status the provider doesn't map — treat as still processing so the
      // client keeps polling instead of erroring out into a silent timeout.
      return respData({ status: 'pending' as GenStatus });
    }

    if (status === 'success') {
      const firstUrl = result?.taskInfo?.images?.find(
        (i) => i.imageUrl
      )?.imageUrl;
      const dataUrl = firstUrl ? await fetchAsDataUrl(firstUrl) : null;
      if (!dataUrl) {
        return respData({
          status: 'failed' as GenStatus,
          error: 'No image returned',
        });
      }
      return respData({ status, imageDataUrl: dataUrl });
    }

    return respData({
      status,
      error:
        status === 'failed'
          ? result?.taskInfo?.errorMessage || 'Generation failed'
          : undefined,
    });
  } catch (e: any) {
    console.error('editor generate poll failed:', e);
    return respErr(e?.message || 'Failed to query generation');
  }
}

export const Route = createFileRoute('/api/editor/generate')({
  server: {
    handlers: { POST, GET },
  },
});

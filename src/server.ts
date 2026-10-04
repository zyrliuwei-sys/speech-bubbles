import handler from '@tanstack/react-start/server-entry';

import { paraglideMiddleware } from './paraglide/server.js';

// On Cloudflare Workers, stash the binding env (D1, ASSETS, …) on globalThis
// so synchronous code paths (e.g. the db() singleton with DATABASE_PROVIDER=d1)
// can reach bindings without threading the request context through every call.
// The specifier is kept non-literal so bundlers leave the import to runtime;
// outside workerd the import rejects and we just move on.
const CF_WORKERS_MODULE = 'cloudflare:workers';
let cfEnvPromise: Promise<void> | null = null;

function ensureCloudflareEnv(): Promise<void> {
  if (!cfEnvPromise) {
    cfEnvPromise = import(/* @vite-ignore */ CF_WORKERS_MODULE)
      .then((mod) => {
        (globalThis as any).__CF_ENV__ = mod.env;
      })
      .catch(() => {
        // Not running on Cloudflare Workers — nothing to stash.
      });
  }
  return cfEnvPromise;
}

// Retired legacy URLs (old tool pages and blog posts). They are permanently
// gone, so answer with a real 410 before the router runs — never a soft 404 or a 200 SPA shell. Matched with or without
// the /zh locale prefix and a trailing slash.
const GONE_PATH =
  /^(?:\/zh)?\/(?:editor|pricing|ai-livestream|blog|api\/editor)(?:\/.*)?$/;

// The blog is live again: its index and current posts (src/content/posts)
// are served normally; any other /blog/* URL is a retired post and stays 410.
const BLOG_PATH = /^(?:\/zh)?\/blog(?:\/([^/]+))?$/;
const LIVE_POST_SLUGS = new Set(
  Object.keys(import.meta.glob('/src/content/posts/*.en.mdx')).map((path) =>
    path.replace(/^.*\/(.+)\.en\.mdx$/, '$1')
  )
);

function isLiveBlogPath(path: string): boolean {
  const match = BLOG_PATH.exec(path);
  return !!match && (!match[1] || LIVE_POST_SLUGS.has(match[1]));
}

const GONE_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>410 Gone</title></head>
<body style="font-family:system-ui,sans-serif;max-width:32rem;margin:15vh auto;padding:0 16px">
<h1>410 Gone</h1><p>This page has been permanently removed.</p>
<p><a href="/">Back to the homepage</a></p></body></html>`;

function goneResponse(req: Request): Response | null {
  const { pathname } = new URL(req.url);
  const path = pathname.replace(/\/+$/, '') || '/';
  if (!GONE_PATH.test(path) || isLiveBlogPath(path)) return null;
  return new Response(req.method === 'HEAD' ? null : GONE_HTML, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// Custom server entry — wraps every request in Paraglide's middleware so
// getLocale() resolves per-request (AsyncLocalStorage) during SSR.
export default {
  async fetch(req: Request): Promise<Response> {
    const gone = goneResponse(req);
    if (gone) return gone;
    await ensureCloudflareEnv();
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};

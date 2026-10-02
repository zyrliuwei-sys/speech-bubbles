import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { CATEGORIES, SITES } from '@/config/sites';
import { TOPICS } from '@/config/topics';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

const STATIC_PATHS = ['', '/submit', '/privacy-policy', '/terms-of-service'];

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: string;
  priority: number;
  /** English-only content: list just the base-locale URL, no alternates. */
  baseLocaleOnly?: boolean;
};

function urlFor(path: string, locale: string): string {
  return localizeUrl(
    `${envConfigs.app_url.replace(/\/+$/, '')}${path || '/'}`,
    {
      locale: locale as (typeof locales)[number],
    }
  ).href;
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return entities[character];
  });
}

function entryXml(e: Entry, locale: (typeof locales)[number]): string {
  const alternates = e.baseLocaleOnly
    ? ''
    : locales
        .map(
          (loc) =>
            `    <xhtml:link rel="alternate" hreflang="${loc}" href="${escapeXml(urlFor(e.path, loc))}"/>`
        )
        .join('\n');
  return [
    '  <url>',
    `    <loc>${escapeXml(urlFor(e.path, locale))}</loc>`,
    alternates,
    e.lastModified
      ? `    <lastmod>${escapeXml(e.lastModified)}</lastmod>`
      : null,
    `    <changefreq>${e.changeFrequency}</changefreq>`,
    `    <priority>${e.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = STATIC_PATHS.map((path) => ({
          path,
          changeFrequency: 'weekly',
          priority: path === '' ? 1 : 0.8,
        }));

        for (const c of CATEGORIES) {
          entries.push({
            path: `/category/${c.slug}`,
            changeFrequency: 'weekly',
            priority: 0.7,
          });
        }
        for (const t of TOPICS) {
          entries.push({
            path: `/game/${t.slug}`,
            lastModified: t.updatedAt,
            baseLocaleOnly: true,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
        for (const s of SITES) {
          entries.push({
            path: `/site/${s.slug}`,
            changeFrequency: 'monthly',
            priority: 0.5,
          });
        }
        try {
          const { listSubmittedSites } =
            await import('@/modules/submissions/service');
          for (const s of await listSubmittedSites()) {
            entries.push({
              path: `/site/${s.slug}`,
              lastModified: new Date(s.createdAt).toISOString(),
              changeFrequency: 'monthly',
              priority: 0.4,
            });
          }
        } catch {
          // Database not configured/reachable — curated sites still listed.
        }

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.flatMap((entry) => {
            const entryLocales: readonly (typeof locales)[number][] =
              entry.baseLocaleOnly
                ? [baseLocale as (typeof locales)[number]]
                : locales;
            return entryLocales.map((locale) => entryXml(entry, locale));
          }),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: { 'Content-Type': 'application/xml; charset=utf-8' },
        });
      },
    },
  },
});

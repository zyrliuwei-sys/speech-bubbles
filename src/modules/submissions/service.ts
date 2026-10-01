import { and, count, desc, eq, gte, like, or } from 'drizzle-orm';

import { db } from '@/core/db';
import { submittedSite, type SubmittedSite } from '@/config/db/schema';
import { isCategorySlug, siteDomain, SITES } from '@/config/sites';
import { getUuid } from '@/lib/hash';

/** Max free submissions per user per rolling 24 hours. */
export const DAILY_SUBMISSION_LIMIT = 5;

/**
 * Error codes returned to the client, which maps them to translated text.
 * Keep in sync with SUBMIT_ERRORS in src/routes/submit.tsx.
 */
export type SubmissionErrorCode =
  | 'invalid_name'
  | 'invalid_url'
  | 'invalid_category'
  | 'invalid_tagline'
  | 'duplicate'
  | 'daily_limit';

export class SubmissionError extends Error {
  constructor(public code: SubmissionErrorCode) {
    super(code);
  }
}

export interface SubmissionInput {
  userId: string;
  name: string;
  url: string;
  category: string;
  tagline: string;
}

/** Only absolute http(s) URLs with a real hostname; never javascript: etc. */
function normalizeUrl(raw: string): URL | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (!url.hostname.includes('.')) return null;
    url.hash = '';
    return url;
  } catch {
    return null;
  }
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return base || 'game';
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  const taken = new Set(SITES.map((s) => s.slug));
  const rows = await db()
    .select({ slug: submittedSite.slug })
    .from(submittedSite)
    .where(
      // base is [a-z0-9-] only, so it can't inject LIKE wildcards
      or(eq(submittedSite.slug, base), like(submittedSite.slug, `${base}-%`))
    );
  for (const r of rows) taken.add(r.slug);
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}

export async function countRecentSubmissions(userId: string): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [row] = await db()
    .select({ n: count() })
    .from(submittedSite)
    .where(
      and(eq(submittedSite.userId, userId), gte(submittedSite.createdAt, since))
    );
  return Number(row?.n ?? 0);
}

/** Validate and publish a submission immediately (no review step). */
export async function createSubmittedSite(
  input: SubmissionInput
): Promise<SubmittedSite> {
  const name = input.name.trim().replace(/\s+/g, ' ');
  const tagline = input.tagline.trim().replace(/\s+/g, ' ');
  if (name.length < 2 || name.length > 60) {
    throw new SubmissionError('invalid_name');
  }
  if (tagline.length < 10 || tagline.length > 120) {
    throw new SubmissionError('invalid_tagline');
  }
  if (!isCategorySlug(input.category)) {
    throw new SubmissionError('invalid_category');
  }
  const url = normalizeUrl(input.url);
  if (!url) throw new SubmissionError('invalid_url');

  const domain = siteDomain(url.href);
  if (SITES.some((s) => siteDomain(s.url) === domain)) {
    throw new SubmissionError('duplicate');
  }
  const [existing] = await db()
    .select({ id: submittedSite.id })
    .from(submittedSite)
    .where(eq(submittedSite.domain, domain))
    .limit(1);
  if (existing) throw new SubmissionError('duplicate');

  if ((await countRecentSubmissions(input.userId)) >= DAILY_SUBMISSION_LIMIT) {
    throw new SubmissionError('daily_limit');
  }

  try {
    const [row] = await db()
      .insert(submittedSite)
      .values({
        id: getUuid(),
        slug: await uniqueSlug(name),
        name,
        url: url.href,
        domain,
        category: input.category,
        tagline,
        userId: input.userId,
      })
      .returning();
    return row;
  } catch (error) {
    // Lost a race on the unique domain/slug index — same site submitted twice
    if (/unique|duplicate/i.test(String((error as Error)?.message))) {
      throw new SubmissionError('duplicate');
    }
    throw error;
  }
}

/** Newest first; the directory shows every published submission. */
export async function listSubmittedSites(
  limit = 500
): Promise<SubmittedSite[]> {
  return db()
    .select()
    .from(submittedSite)
    .orderBy(desc(submittedSite.createdAt))
    .limit(limit);
}

export async function getSubmittedSiteBySlug(
  slug: string
): Promise<SubmittedSite | undefined> {
  const [row] = await db()
    .select()
    .from(submittedSite)
    .where(eq(submittedSite.slug, slug))
    .limit(1);
  return row;
}

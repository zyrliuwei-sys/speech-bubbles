import { createServerFn } from '@tanstack/react-start';

import type { SubmittedSite } from '@/config/db/schema';
import type { CategorySlug, Site } from '@/config/sites';

// Database access stays behind server functions (dynamic import keeps drizzle
// out of the client bundle).

function toSite(row: SubmittedSite): Site {
  return {
    slug: row.slug,
    name: row.name,
    url: row.url,
    category: row.category as CategorySlug,
    badge: 'new',
    // Submitters write one tagline; show it in every locale.
    tagline: { en: row.tagline, zh: row.tagline },
    submitted: true,
  };
}

/** Every user-submitted site, newest first. Empty if the DB is unreachable. */
export const getSubmittedSitesFn = createServerFn().handler(
  async (): Promise<Site[]> => {
    try {
      const { listSubmittedSites } =
        await import('@/modules/submissions/service');
      return (await listSubmittedSites()).map(toSite);
    } catch (error) {
      console.error('load submitted sites failed:', error);
      return [];
    }
  }
);

export const getSubmittedSiteFn = createServerFn()
  .inputValidator((slug: string) => slug)
  .handler(async ({ data: slug }): Promise<Site | null> => {
    try {
      const { getSubmittedSiteBySlug } =
        await import('@/modules/submissions/service');
      const row = await getSubmittedSiteBySlug(slug);
      return row ? toSite(row) : null;
    } catch (error) {
      console.error('load submitted site failed:', error);
      return null;
    }
  });

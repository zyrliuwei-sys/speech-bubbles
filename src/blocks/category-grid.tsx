import { Link } from '@/core/i18n/navigation';
import { CATEGORIES, SITES } from '@/config/sites';
import { m } from '@/paraglide/messages.js';

import { categoryHref, categoryLabel } from './nav-i18n';

/** "Browse by category" chip cloud with per-category site counts. */
export function CategoryGrid({ id }: { id?: string }) {
  return (
    <section id={id} className="scroll-mt-6">
      <h2 className="mb-6 text-center text-lg font-bold">
        {m['landing.categories.title']()}
      </h2>
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORIES.map((c) => {
          const count = SITES.filter((s) => s.category === c.slug).length;
          return (
            <Link
              key={c.slug}
              href={categoryHref(c.slug)}
              className="bg-card hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors"
            >
              <span aria-hidden>{c.emoji}</span>
              {categoryLabel(c.slug)}
              <span className="text-muted-foreground text-xs tabular-nums">
                {count}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

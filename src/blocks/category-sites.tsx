import { ArrowLeft } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { CATEGORIES, SITES, type CategorySlug } from '@/config/sites';
import { m } from '@/paraglide/messages.js';
import { SiteCard } from '@/components/nav/site-card';

import { CategoryGrid } from './category-grid';
import { categoryLabel, siteCardProps } from './nav-i18n';

export function CategorySites({ slug }: { slug: CategorySlug }) {
  const sites = SITES.filter((s) => s.category === slug);
  const name = categoryLabel(slug);
  const emoji = CATEGORIES.find((c) => c.slug === slug)?.emoji;

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:py-10">
      <Link
        href="/#sites"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        {m['landing.home.sites_title']()}
      </Link>

      <header className="mt-8 text-center">
        <p className="text-4xl" aria-hidden>
          {emoji}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {m['landing.category.page_title']({ name })}
        </h1>
        <p className="text-muted-foreground mt-3">
          {m['landing.category.page_desc']({ name, count: sites.length })}
        </p>
      </header>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sites.map((s) => (
          <SiteCard key={s.slug} {...siteCardProps(s)} />
        ))}
      </div>

      <div className="mt-16">
        <CategoryGrid />
      </div>
    </div>
  );
}

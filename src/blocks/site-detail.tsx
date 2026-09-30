import { ArrowLeft, ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { siteDomain, SITES, type Site } from '@/config/sites';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SiteBadge } from '@/components/nav/site-badge';
import { SiteCard } from '@/components/nav/site-card';
import { SiteIcon } from '@/components/nav/site-icon';
import { buttonVariants } from '@/components/ui/button';

import {
  categoryHref,
  categoryLabel,
  localized,
  siteBadge,
  siteCardProps,
} from './nav-i18n';

export function SiteDetail({ site }: { site: Site }) {
  const domain = siteDomain(site.url);
  const badge = siteBadge(site);
  const similar = SITES.filter(
    (s) => s.category === site.category && s.slug !== site.slug
  ).slice(0, 6);
  const category = categoryLabel(site.category);

  return (
    <div className="mx-auto max-w-[900px] px-4 py-8 sm:py-10">
      <Link
        href={categoryHref(site.category)}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        {category}
      </Link>

      <section className="bg-card mt-6 flex flex-col gap-6 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-center gap-4">
          <SiteIcon
            domain={domain}
            name={site.name}
            className="size-16 rounded-2xl"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {site.name}
              </h1>
              {badge && <SiteBadge tone={badge.tone} label={badge.label} />}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{domain}</p>
            <p className="mt-2">{localized(site.tagline)}</p>
          </div>
        </div>
        <a
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: 'lg' }), 'h-11 gap-1.5 px-5')}
        >
          {m['landing.topic.visit']()}
          <ArrowUpRight className="size-4" />
        </a>
      </section>

      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="text-muted-foreground mb-3 px-1 font-semibold">
            {m['landing.site.similar']({ name: category })}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <SiteCard key={s.slug} {...siteCardProps(s)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

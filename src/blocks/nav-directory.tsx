import { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';

import { useSession } from '@/core/auth/client';
import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { CATEGORIES, siteDomain, SITES } from '@/config/sites';
import { TOPIC_GROUPS, TOPICS } from '@/config/topics';
import { matchesQuery } from '@/lib/search';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { BrandMark } from '@/components/brand-mark';
import { SiteCard } from '@/components/nav/site-card';
import { TopicCard } from '@/components/nav/topic-card';
import { buttonVariants } from '@/components/ui/button';

import { CategoryGrid } from './category-grid';
import {
  categoryLabel,
  siteCardProps,
  siteSearchText,
  topicGroupLabel,
  topicHref,
  topicSearchText,
} from './nav-i18n';
import { SponsorRails } from './sponsor-rails';

/** Homepage body: hero + search, keyword topics, site directory, categories. */
export function NavDirectory() {
  const [query, setQuery] = useState('');
  const { data: session } = useSession();

  const topicSections = useMemo(
    () =>
      TOPIC_GROUPS.map((g) => ({
        id: `topics-${g.slug}`,
        emoji: g.emoji,
        title: topicGroupLabel(g.slug),
        topics: TOPICS.filter(
          (t) => t.group === g.slug && matchesQuery(topicSearchText(t), query)
        ),
      })).filter((s) => s.topics.length > 0),
    [query]
  );

  const siteSections = useMemo(
    () =>
      CATEGORIES.map((c) => ({
        id: `sites-${c.slug}`,
        emoji: c.emoji,
        title: categoryLabel(c.slug),
        sites: SITES.filter(
          (s) => s.category === c.slug && matchesQuery(siteSearchText(s), query)
        ),
      })).filter((s) => s.sites.length > 0),
    [query]
  );

  const tabs = [
    ...topicSections.map((s) => ({ id: s.id, label: s.title })),
    ...(siteSections.length
      ? [{ id: 'sites', label: m['landing.home.sites_title']() }]
      : []),
  ];

  const subLinks = [
    { href: '#directory', label: m['landing.nav.directory']() },
    { href: '#categories', label: m['landing.nav.categories']() },
    session?.user
      ? { href: '/settings', label: m['common.nav.profile']() }
      : { href: '/sign-in', label: m['common.nav.sign_in']() },
  ];

  const empty = topicSections.length === 0 && siteSections.length === 0;

  return (
    <>
      <SponsorRails />

      <div className="mx-auto max-w-[900px] px-4 pb-16">
        {/* Hero */}
        <section className="pt-10 pb-10 text-center sm:pt-14">
          <Link href="/" className="inline-block text-2xl">
            <BrandMark
              name={envConfigs.app_name}
              iconClassName="size-8"
              className="gap-2.5"
            />
          </Link>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl">
            {m['landing.home.headline']()}
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-base text-balance sm:text-lg">
            {m['landing.home.subtitle']({
              topics: TOPICS.length,
              sites: SITES.length,
            })}
          </p>

          <form
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              document
                .getElementById('directory')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <label className="bg-card focus-within:ring-ring/50 flex h-11 shrink-0 items-center gap-2.5 rounded-lg border px-3 focus-within:ring-2 sm:flex-1">
              <Search className="text-muted-foreground size-4 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={m['landing.home.search_placeholder']()}
                aria-label={m['landing.home.search_label']()}
                className="placeholder:text-muted-foreground h-full w-full bg-transparent text-sm outline-none"
              />
            </label>
            <Link
              href="/submit"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-11 gap-1.5 px-5'
              )}
            >
              <Plus className="size-4" />
              {m['landing.home.submit']()}
            </Link>
          </form>

          <nav className="text-muted-foreground mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm">
            {subLinks.map((l, i) => (
              <span key={l.href} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden>·</span>}
                {l.href.startsWith('#') ? (
                  <a href={l.href} className="hover:text-foreground">
                    {l.label}
                  </a>
                ) : (
                  <Link href={l.href} className="hover:text-foreground">
                    {l.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        </section>

        <div id="directory" className="scroll-mt-4">
          {/* Section tabs */}
          {tabs.length > 1 && (
            <nav className="bg-background/85 sticky top-0 z-20 -mx-4 mb-2 overflow-x-auto px-4 py-3 backdrop-blur">
              <div className="flex w-max gap-1.5">
                {tabs.map((t) => (
                  <a
                    key={t.id}
                    href={`#${t.id}`}
                    className="bg-card hover:bg-muted rounded-full border px-3 py-1 text-sm whitespace-nowrap transition-colors"
                  >
                    {t.label}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {empty && (
            <p className="text-muted-foreground py-16 text-center text-sm">
              {m['landing.home.empty']()}
            </p>
          )}

          {topicSections.map((s) => (
            <section key={s.id} id={s.id} className="mt-8 scroll-mt-16">
              <SectionTitle
                emoji={s.emoji}
                title={s.title}
                count={s.topics.length}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {s.topics.map((t) => (
                  <TopicCard
                    key={t.slug}
                    href={topicHref(t)}
                    title={t.keyword}
                    game={t.game}
                    summary={t.summary}
                    domain={siteDomain(t.site.url)}
                  />
                ))}
              </div>
            </section>
          ))}

          {siteSections.length > 0 && (
            <div id="sites" className="mt-14 scroll-mt-16">
              <h2 className="text-xl font-bold tracking-tight">
                {m['landing.home.sites_title']()}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {m['landing.home.sites_desc']()}
              </p>
              {siteSections.map((s) => (
                <section key={s.id} id={s.id} className="mt-6 scroll-mt-16">
                  <SectionTitle
                    emoji={s.emoji}
                    title={s.title}
                    count={s.sites.length}
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {s.sites.map((site) => (
                      <SiteCard key={site.slug} {...siteCardProps(site)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>

        <div className="mt-16">
          <CategoryGrid id="categories" />
        </div>

        {/* Bottom CTA */}
        <section className="mt-20 text-center">
          <h2 className="mx-auto max-w-xl text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            {m['landing.home.bottom_title']()}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm">
            {m['landing.home.bottom_desc']()}
          </p>
          <Link
            href="/submit"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-6 h-11 gap-1.5 px-5'
            )}
          >
            <Plus className="size-4" />
            {m['landing.home.submit']()}
          </Link>
        </section>
      </div>
    </>
  );
}

function SectionTitle({
  emoji,
  title,
  count,
}: {
  emoji: string;
  title: string;
  count: number;
}) {
  return (
    <h3 className="text-muted-foreground mb-3 flex items-center gap-2 px-1 font-semibold">
      <span aria-hidden>{emoji}</span>
      {title}
      <span className="text-xs font-normal tabular-nums">{count}</span>
    </h3>
  );
}

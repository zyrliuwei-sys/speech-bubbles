import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Plus, Search } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { CATEGORIES, siteDomain, SITES } from '@/config/sites';
import { getTopic, TOPIC_GROUPS, TOPICS } from '@/config/topics';
import { matchesQuery } from '@/lib/search';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SiteCard } from '@/components/nav/site-card';
import { SiteIcon } from '@/components/nav/site-icon';
import { TONES } from '@/components/nav/tones';
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
  topicTitle,
  topicTone,
} from './nav-i18n';

// Hand-picked for the hero panel and the quick-search chips.
const TRENDING = [
  'control-resonant-last-taxi',
  'silver-light-genshin',
  'aion-2-classes',
  'ea-fc-27-lite',
  'burger-king-fc-27',
  'ride-a-pet-volcano',
];
const POPULAR_QUERIES = [
  'minecraft cape',
  'codes',
  'gta vi',
  'genshin',
  'release date',
];

const LAST_UPDATED = TOPICS.reduce(
  (max, t) => (t.updatedAt > max ? t.updatedAt : max),
  ''
);

/** Homepage body: hero, sidebar-indexed topic directory, site directory. */
export function NavDirectory() {
  const [query, setQuery] = useState('');
  const directoryRef = useRef<HTMLDivElement>(null);

  const topicSections = useMemo(
    () =>
      TOPIC_GROUPS.map((g) => ({
        id: `topics-${g.slug}`,
        group: g.slug,
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

  const trending = TRENDING.map(getTopic).filter((t) => t !== undefined);
  const empty = topicSections.length === 0 && siteSections.length === 0;

  const runSearch = (q: string) => {
    setQuery(q);
    directoryRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] [mask-image:linear-gradient(to_bottom,black,transparent)] [background-size:22px_22px]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-14 lg:py-20">
          <div>
            <p className="bg-card text-muted-foreground inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs">
              <span className="bg-brand size-1.5 rounded-full" />
              {m['landing.home.eyebrow']({
                date: LAST_UPDATED,
                topics: TOPICS.length,
              })}
            </p>
            <h1 className="font-display mt-5 text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-6xl">
              {m['landing.home.headline']()}
            </h1>
            <p className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty">
              {m['landing.home.subtitle']({
                topics: TOPICS.length,
                sites: SITES.length,
              })}
            </p>

            <form
              className="mt-8 max-w-xl"
              onSubmit={(e) => {
                e.preventDefault();
                runSearch(query);
              }}
            >
              <label className="bg-card focus-within:border-primary focus-within:ring-primary/15 flex h-14 items-center gap-3 rounded-2xl border-2 pr-2 pl-4 shadow-sm transition-colors focus-within:ring-4">
                <Search className="text-muted-foreground size-5 shrink-0" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={m['landing.home.search_placeholder']()}
                  aria-label={m['landing.home.search_label']()}
                  className="placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent text-base outline-none"
                />
                <button
                  type="submit"
                  className={cn(buttonVariants(), 'h-10 rounded-xl px-4')}
                >
                  <ArrowRight className="size-4" />
                </button>
              </label>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground font-mono text-xs uppercase">
                {m['landing.home.popular']()}
              </span>
              {POPULAR_QUERIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => runSearch(q)}
                  className="hover:border-primary hover:text-primary bg-card rounded-full border px-3 py-1 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Trending panel */}
          <div className="bg-ink text-ink-foreground rounded-3xl p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.5)]">
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="font-display text-sm font-semibold">
                {m['landing.home.trending']()}
              </p>
              <span className="text-ink-muted font-mono text-[11px]">
                {LAST_UPDATED}
              </span>
            </div>
            <ol>
              {trending.map((t, i) => (
                <li key={t.slug}>
                  <Link
                    href={topicHref(t)}
                    className="group flex items-center gap-4 rounded-2xl px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    <span className="text-ink-muted w-6 font-mono text-sm tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <SiteIcon
                      domain={siteDomain(t.site.url)}
                      name={t.game}
                      className="size-8 rounded-lg"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {topicTitle(t)}
                      </span>
                      <span className="text-ink-muted flex items-center gap-1.5 truncate text-xs">
                        <span
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            TONES[topicTone(t.group)].dot
                          )}
                        />
                        {t.game}
                      </span>
                    </span>
                    <ArrowRight className="text-ink-muted size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Directory */}
      <div
        id="directory"
        ref={directoryRef}
        className="mx-auto max-w-7xl scroll-mt-16 px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-12 lg:py-14"
      >
        {/* Sidebar (desktop) / chip bar (mobile) */}
        <aside className="bg-background/90 sticky top-16 z-20 -mx-4 mb-6 border-b px-4 py-3 backdrop-blur lg:top-24 lg:mx-0 lg:mb-0 lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <p className="text-muted-foreground mb-3 hidden font-mono text-[11px] tracking-wider uppercase lg:block">
            {m['landing.home.sidebar_topics']()}
          </p>
          <nav className="flex gap-1.5 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-visible">
            {topicSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="hover:bg-muted flex shrink-0 items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors lg:rounded-lg lg:border-0 lg:px-2.5"
              >
                <span
                  className={cn(
                    'size-2 rounded-full',
                    TONES[topicTone(s.group)].dot
                  )}
                />
                <span className="lg:flex-1">{s.title}</span>
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {s.topics.length}
                </span>
              </a>
            ))}
            {siteSections.length > 0 && (
              <a
                href="#sites"
                className="hover:bg-muted flex shrink-0 items-center gap-2.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors lg:mt-4 lg:rounded-lg lg:border-0 lg:border-t lg:px-2.5 lg:pt-4"
              >
                <span className="bg-primary size-2 rounded-full" />
                <span className="lg:flex-1">
                  {m['landing.home.sites_title']()}
                </span>
                <span className="text-muted-foreground font-mono text-xs tabular-nums">
                  {siteSections.reduce((n, s) => n + s.sites.length, 0)}
                </span>
              </a>
            )}
          </nav>
        </aside>

        <div className="min-w-0">
          <header className="mb-8">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              {m['landing.home.topics_title']()}
            </h2>
            <p className="text-muted-foreground mt-2">
              {m['landing.home.topics_desc']()}
            </p>
          </header>

          {empty && (
            <p className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-sm">
              {m['landing.home.empty']()}
            </p>
          )}

          {topicSections.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="mb-12 scroll-mt-32 lg:scroll-mt-24"
            >
              <h3 className="mb-4 flex items-center gap-3">
                <span
                  className={cn(
                    'size-3 rounded-sm',
                    TONES[topicTone(s.group)].dot
                  )}
                />
                <span className="font-display text-xl font-semibold tracking-tight">
                  {s.title}
                </span>
                <span className="text-muted-foreground font-mono text-xs">
                  {s.topics.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {s.topics.map((t) => (
                  <TopicCard
                    key={t.slug}
                    href={topicHref(t)}
                    title={topicTitle(t)}
                    game={t.game}
                    summary={t.summary}
                    domain={siteDomain(t.site.url)}
                    tone={topicTone(t.group)}
                  />
                ))}
              </div>
            </section>
          ))}

          {siteSections.length > 0 && (
            <section
              id="sites"
              className="mt-16 scroll-mt-32 border-t pt-12 lg:scroll-mt-24"
            >
              <h2 className="font-display text-3xl font-bold tracking-tight">
                {m['landing.home.sites_title']()}
              </h2>
              <p className="text-muted-foreground mt-2">
                {m['landing.home.sites_desc']()}
              </p>
              <div className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2">
                {siteSections.map((s) => (
                  <div key={s.id} id={s.id}>
                    <h3 className="text-muted-foreground mb-2 flex items-center gap-2 px-2.5 font-mono text-xs tracking-wider uppercase">
                      <span aria-hidden>{s.emoji}</span>
                      {s.title}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2">
                      {s.sites.map((site) => (
                        <SiteCard key={site.slug} {...siteCardProps(site)} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-16">
            <CategoryGrid id="categories" />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="bg-ink text-ink-foreground relative overflow-hidden rounded-3xl px-6 py-12 sm:px-12 sm:py-14">
          <div
            aria-hidden
            className="bg-primary/40 pointer-events-none absolute -top-24 -right-16 size-72 rounded-full blur-3xl"
          />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display max-w-lg text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {m['landing.home.bottom_title']()}
              </h2>
              <p className="text-ink-muted mt-2 text-sm">
                {m['landing.home.bottom_desc']()}
              </p>
            </div>
            <Link
              href="/submit"
              className="text-ink inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-white px-5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
            >
              <Plus className="size-4" />
              {m['landing.home.submit']()}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

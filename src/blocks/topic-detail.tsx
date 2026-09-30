import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { siteDomain } from '@/config/sites';
import { TOPICS, type Topic } from '@/config/topics';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { SiteIcon } from '@/components/nav/site-icon';
import { TopicCard } from '@/components/nav/topic-card';
import { buttonVariants } from '@/components/ui/button';

import { topicGroupLabel, topicHref } from './nav-i18n';

export function TopicDetail({ topic }: { topic: Topic }) {
  const domain = siteDomain(topic.site.url);
  const related = TOPICS.filter(
    (t) => t.group === topic.group && t.slug !== topic.slug
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8 sm:py-10">
      <Link
        href={`/#topics-${topic.group}`}
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        {topicGroupLabel(topic.group)}
      </Link>

      <header className="mt-6">
        <p className="text-muted-foreground text-sm">{topic.game}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight first-letter:uppercase sm:text-4xl">
          {topic.keyword}
        </h1>
        <p className="mt-4 text-lg leading-relaxed">{topic.summary}</p>
        <p className="text-muted-foreground mt-3 text-xs">
          {m['landing.topic.updated']({ date: topic.updatedAt })}
        </p>
      </header>

      {/* Matched site */}
      <a
        href={topic.site.url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-card group mt-8 flex items-center gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-md sm:p-5"
      >
        <SiteIcon domain={domain} name={topic.site.name} className="size-12" />
        <span className="min-w-0 flex-1">
          <span className="text-muted-foreground block text-[11px] tracking-wider uppercase">
            {m['landing.topic.best_site']()}
          </span>
          <span className="block truncate font-bold group-hover:underline">
            {topic.site.name}
          </span>
          <span className="text-muted-foreground block truncate text-xs">
            {domain}
          </span>
        </span>
        <span className={cn(buttonVariants(), 'hidden gap-1.5 sm:inline-flex')}>
          {m['landing.topic.visit']()}
          <ArrowUpRight className="size-4" />
        </span>
        <ArrowUpRight className="size-5 shrink-0 sm:hidden" />
      </a>

      <article className="mt-10 space-y-8">
        {topic.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold tracking-tight">{s.heading}</h2>
            <p className="text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
              {s.body}
            </p>
          </section>
        ))}
      </article>

      {topic.links && topic.links.length > 0 && (
        <section className="mt-10">
          <h2 className="font-bold">{m['landing.topic.links']()}</h2>
          <ul className="mt-3 space-y-2">
            {topic.links.map((l) => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground text-muted-foreground inline-flex items-center gap-1.5 text-sm underline underline-offset-4"
                >
                  {l.name}
                  <ExternalLink className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {topic.aliases.length > 0 && (
        <section className="mt-10">
          <h2 className="text-muted-foreground text-sm font-semibold">
            {m['landing.topic.aliases']()}
          </h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {topic.aliases.map((a) => (
              <span
                key={a}
                className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs"
              >
                {a}
              </span>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-muted-foreground mb-3 font-semibold">
            {m['landing.topic.related']({
              group: topicGroupLabel(topic.group),
            })}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {related.map((t) => (
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
      )}
    </div>
  );
}

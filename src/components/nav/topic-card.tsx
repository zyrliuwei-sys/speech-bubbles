import { ArrowUpRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

import { SiteIcon } from './site-icon';
import { TONES, type Tone } from './tones';

export interface TopicCardProps {
  href: string;
  title: string;
  game: string;
  summary: string;
  /** Domain of the matched site — drives the favicon and footer label. */
  domain: string;
  tone: Tone;
  className?: string;
}

/** Card linking to an internal keyword detail page. */
export function TopicCard({
  href,
  title,
  game,
  summary,
  domain,
  tone,
  className,
}: TopicCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-card group relative flex flex-col overflow-hidden rounded-2xl border p-5 pl-6 transition-all duration-200',
        "before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-['']",
        'hover:border-foreground/20 hover:-translate-y-0.5 hover:shadow-[0_10px_30px_-12px_rgb(0_0_0/0.25)]',
        TONES[tone].bar,
        className
      )}
    >
      <p
        className={cn(
          'font-mono text-[11px] font-medium tracking-wide uppercase',
          TONES[tone].text
        )}
      >
        {game}
      </p>
      <h3 className="font-display mt-1.5 text-lg leading-snug font-semibold tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
        {summary}
      </p>
      <div className="mt-auto flex items-center gap-2 pt-4">
        <SiteIcon
          domain={domain}
          name={game}
          className="size-5 rounded-md border-0 shadow-none"
        />
        <span className="text-muted-foreground truncate font-mono text-xs">
          {domain}
        </span>
        <ArrowUpRight className="text-muted-foreground group-hover:text-primary ml-auto size-4 shrink-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </Link>
  );
}

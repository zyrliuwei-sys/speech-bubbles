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

/** Card linking to an internal keyword detail page, with a flat tinted cover. */
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
        'bg-card group flex flex-col overflow-hidden rounded-2xl border transition-[border-color,transform] duration-200',
        'hover:border-foreground/25 hover:-translate-y-0.5',
        className
      )}
    >
      {/* Cover */}
      <div
        className={cn(
          'flex h-24 shrink-0 items-center gap-3 px-5',
          TONES[tone].cover
        )}
      >
        <SiteIcon
          domain={domain}
          name={game}
          className="size-11 rounded-xl border-0 bg-white shadow-sm"
        />
        <span className="font-display line-clamp-2 text-base leading-tight font-semibold">
          {game}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg leading-snug font-semibold tracking-tight">
          {title}
        </h3>
        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">
          {summary}
        </p>
        <div className="mt-auto flex items-center gap-2 pt-4">
          <span className="text-muted-foreground truncate font-mono text-xs">
            {domain}
          </span>
          <ArrowUpRight className="text-muted-foreground group-hover:text-foreground ml-auto size-4 shrink-0 transition-colors" />
        </div>
      </div>
    </Link>
  );
}

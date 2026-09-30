import { ChevronRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

import { SiteIcon } from './site-icon';

export interface TopicCardProps {
  href: string;
  title: string;
  game: string;
  summary: string;
  /** Domain of the matched site — drives the favicon. */
  domain: string;
  className?: string;
}

/** Card linking to an internal keyword detail page. */
export function TopicCard({
  href,
  title,
  game,
  summary,
  domain,
  className,
}: TopicCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        'bg-card group flex gap-3 rounded-xl border p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <SiteIcon domain={domain} name={game} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1">
          <span className="truncate font-bold group-hover:underline first-letter:uppercase">
            {title}
          </span>
        </span>
        <span className="text-muted-foreground block truncate text-xs">
          {game}
        </span>
        <span className="text-muted-foreground/90 mt-1.5 line-clamp-2 text-xs leading-relaxed">
          {summary}
        </span>
      </span>
      <ChevronRight className="text-muted-foreground group-hover:text-foreground mt-0.5 size-4 shrink-0" />
    </Link>
  );
}

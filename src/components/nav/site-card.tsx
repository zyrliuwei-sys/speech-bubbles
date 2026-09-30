import { ArrowUpRight, Info } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

import { SiteBadge, type SiteBadgeTone } from './site-badge';
import { SiteIcon } from './site-icon';

export interface SiteCardProps {
  name: string;
  url: string;
  domain: string;
  tagline: string;
  badge?: { tone: SiteBadgeTone; label: string };
  /** Internal detail page; rendered as a small secondary link. */
  detail?: { href: string; label: string };
  className?: string;
}

/** Directory card — the whole card opens the external site in a new tab. */
export function SiteCard({
  name,
  url,
  domain,
  tagline,
  badge,
  detail,
  className,
}: SiteCardProps) {
  return (
    <div
      className={cn(
        'bg-card group relative rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-md',
        className
      )}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3.5"
      >
        <SiteIcon domain={domain} name={name} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate font-bold group-hover:underline">
              {name}
            </span>
            {badge && <SiteBadge tone={badge.tone} label={badge.label} />}
          </span>
          <span className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
            {tagline}
          </span>
        </span>
        <ArrowUpRight className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 transition-colors" />
      </a>
      {detail && (
        <Link
          href={detail.href}
          aria-label={detail.label}
          title={detail.label}
          className="text-muted-foreground hover:text-foreground absolute top-1.5 right-1.5 hidden rounded p-0.5 group-hover:block focus-visible:block"
        >
          <Info className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

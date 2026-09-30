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
  /** Internal detail page; the name links there, the tile opens the site. */
  detail?: { href: string; label: string };
  className?: string;
}

/** Compact directory tile — opens the external site in a new tab. */
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
        'group hover:bg-card hover:border-border relative flex items-center gap-3 rounded-xl border border-transparent p-2.5 transition-colors',
        className
      )}
    >
      <SiteIcon domain={domain} name={name} className="size-9 rounded-lg" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-semibold after:absolute after:inset-0 after:content-['']"
          >
            {name}
          </a>
          {badge && <SiteBadge tone={badge.tone} label={badge.label} />}
        </div>
        <p className="text-muted-foreground truncate text-xs">{tagline}</p>
      </div>
      {detail ? (
        <Link
          href={detail.href}
          aria-label={`${detail.label}: ${name}`}
          title={detail.label}
          className="text-muted-foreground hover:text-foreground relative z-10 hidden rounded-md p-1 group-hover:block focus-visible:block"
        >
          <Info className="size-4" />
        </Link>
      ) : (
        <ArrowUpRight className="text-muted-foreground size-4 opacity-0 group-hover:opacity-100" />
      )}
    </div>
  );
}

import { Megaphone } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';

import { SiteIcon } from './site-icon';

export interface SponsorItem {
  url: string;
  domain: string;
  title: string;
  subtitle: string;
  /** Tailwind classes for the pastel card background. */
  tint: string;
}

/**
 * Fixed column of featured sites pinned to the viewport edge. Only shown on
 * wide screens where the centered content leaves room on both sides.
 */
export function SponsorRail({
  side,
  items,
  footer,
}: {
  side: 'left' | 'right';
  items: SponsorItem[];
  footer?: { label: string; href: string };
}) {
  return (
    <aside
      className={cn(
        'fixed top-4 bottom-4 z-10 hidden w-[200px] flex-col gap-4 min-[1360px]:flex',
        side === 'left' ? 'left-4' : 'right-4'
      )}
    >
      {items.map((item) => (
        <a
          key={item.url}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex min-h-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border px-4 text-center transition-transform hover:-translate-y-0.5',
            item.tint
          )}
        >
          <SiteIcon
            domain={item.domain}
            name={item.title}
            className="mb-1 size-9 rounded-lg"
          />
          <p className="text-sm font-bold">{item.title}</p>
          <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
            {item.subtitle}
          </p>
        </a>
      ))}
      {footer && (
        <Link
          href={footer.href}
          className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-1.5 text-xs"
        >
          <Megaphone className="size-3.5" />
          {footer.label}
        </Link>
      )}
    </aside>
  );
}

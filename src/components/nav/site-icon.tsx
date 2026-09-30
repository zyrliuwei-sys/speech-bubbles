import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Site favicon on a white tile; falls back to the site's initial when the
 * favicon can't be loaded.
 */
export function SiteIcon({
  domain,
  name,
  className,
}: {
  domain: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <span
      aria-hidden
      className={cn(
        'bg-card inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border shadow-xs',
        className
      )}
    >
      {failed ? (
        <span className="text-muted-foreground text-lg font-bold uppercase">
          {name.slice(0, 1)}
        </span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          loading="lazy"
          width={64}
          height={64}
          className="size-3/5 object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

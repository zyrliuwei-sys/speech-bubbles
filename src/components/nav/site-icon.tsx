import { useState } from 'react';

import { cn } from '@/lib/utils';

/**
 * Site favicon, edge to edge with rounded corners; falls back to the site's initial when the
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
        'inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl',
        className
      )}
    >
      {failed ? (
        <span className="bg-muted text-muted-foreground flex size-full items-center justify-center text-lg font-bold uppercase">
          {name.slice(0, 1)}
        </span>
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt=""
          loading="lazy"
          width={64}
          height={64}
          className="size-full object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

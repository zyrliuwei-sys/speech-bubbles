import { Gamepad2 } from 'lucide-react';

import { cn } from '@/lib/utils';

/** App logo glyph — brand-colored gamepad next to the app name. */
export function BrandMark({
  name,
  className,
  iconClassName,
}: {
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Gamepad2
        className={cn('text-brand size-6 shrink-0', iconClassName)}
        strokeWidth={2.25}
      />
      <span className="font-display font-bold tracking-tight">{name}</span>
    </span>
  );
}

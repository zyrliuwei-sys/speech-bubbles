import { cn } from '@/lib/utils';

export type SiteBadgeTone = 'hot' | 'new' | 'free';

const TONES: Record<SiteBadgeTone, string> = {
  hot: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  new: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  free: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
};

export function SiteBadge({
  tone,
  label,
  className,
}: {
  tone: SiteBadgeTone;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-none font-bold tracking-wide uppercase',
        TONES[tone],
        className
      )}
    >
      {label}
    </span>
  );
}

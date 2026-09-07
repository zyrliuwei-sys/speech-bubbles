import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { cn } from '@/lib/utils';

export interface FooterColumn {
  title: string;
  /** external: open in a new tab. Off-site (http) hrefs always open in a new tab. */
  links: { label: string; href: string; external?: boolean }[];
}

/** Off-site URLs render as plain <a>; internal paths use the locale-aware Link. */
const isExternalHref = (href: string) => /^https?:\/\//.test(href);

export function SiteFooter({
  tagline,
  columns,
  copyright,
}: {
  tagline?: string;
  columns?: FooterColumn[];
  copyright?: string;
}) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-white text-black dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-6xl px-4 pt-12 pb-6 sm:px-6 sm:pt-16">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-20">
          {tagline && (
            <p className="max-w-md font-serif text-3xl leading-[1.15] tracking-tight text-black italic sm:text-4xl dark:text-neutral-100">
              {tagline}
            </p>
          )}

          {columns && columns.length > 0 && (
            <div
              className={cn(
                'grid gap-x-8 gap-y-10 sm:gap-x-16 lg:min-w-sm',
                columns.length <= 2
                  ? 'grid-cols-2'
                  : columns.length === 3
                    ? 'grid-cols-2 sm:grid-cols-3'
                    : columns.length === 4
                      ? 'grid-cols-2 sm:grid-cols-4'
                      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
              )}
            >
              {columns.map((col) => (
                <div key={col.title} className="space-y-5">
                  <p className="text-[13px] font-semibold tracking-wide text-black dark:text-neutral-100">
                    {col.title}
                  </p>
                  <ul className="space-y-2">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        {isExternalHref(link.href) ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-700 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-neutral-100"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            target={link.external ? '_blank' : undefined}
                            className="text-sm text-neutral-700 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-neutral-100"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-3 border-t border-neutral-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {copyright ||
              `© ${year} ${envConfigs.app_name}. All rights reserved.`}
          </span>
        </div>
      </div>
    </footer>
  );
}

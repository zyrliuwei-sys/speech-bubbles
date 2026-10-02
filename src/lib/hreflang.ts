import { envConfigs } from '@/config';
import { baseLocale, locales, localizeUrl } from '@/paraglide/runtime.js';

// head() also runs on the client during hydration, where app_url can fall back
// to the localhost default; prefer the live origin there so links match SSR.
function origin(): string {
  return (
    (typeof window !== 'undefined' && window.location?.origin) ||
    envConfigs.app_url ||
    ''
  ).replace(/\/+$/, '');
}

/** hreflang alternates (+ x-default) pairing this page's locale versions. */
export function hreflangLinks(path: string) {
  const urlFor = (loc: (typeof locales)[number]) =>
    localizeUrl(`${origin()}${path || '/'}`, { locale: loc }).href;
  return [
    ...locales.map((loc) => ({
      rel: 'alternate',
      hrefLang: loc,
      href: urlFor(loc),
    })),
    { rel: 'alternate', hrefLang: 'x-default', href: urlFor(baseLocale) },
  ];
}

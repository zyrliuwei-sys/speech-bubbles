import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getSubmittedSitesFn } from '@/lib/submitted-sites';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { NavDirectory } from '@/blocks/nav-directory';

function HomePage() {
  const { submitted } = Route.useLoaderData();
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <NavDirectory extraSites={submitted} />
      </main>
      <Footer />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => ({
    locale: getLocale(),
    submitted: await getSubmittedSitesFn(),
  }),
  head: ({ loaderData }) => {
    const locale = (loaderData?.locale ?? 'en') as (typeof locales)[number];
    const origin =
      (typeof window !== 'undefined' && window.location?.origin) ||
      envConfigs.app_url ||
      '';
    const urlFor = (loc: (typeof locales)[number]) =>
      localizeUrl(`${origin}/`, { locale: loc }).href;
    const title = m['landing.seo.title']({}, { locale });
    const description = m['landing.seo.description']({}, { locale });
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: urlFor(locale) },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: HomePage,
});

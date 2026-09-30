import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';

import { HomePage } from './index';

/** Alias entry point that renders the homepage; canonical points to `/`. */
export const Route = createFileRoute('/ai-livestream')({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const title = m['landing.seo.title']({}, { locale: locale as any });
    const description = m['landing.seo.description'](
      {},
      { locale: locale as any }
    );
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
      ],
      links: [
        {
          rel: 'canonical',
          href: localizeUrl(`${envConfigs.app_url}/`, { locale: locale as any })
            .href,
        },
      ],
    };
  },
  component: AiLivestreamPage,
});

function AiLivestreamPage() {
  const { locale } = Route.useLoaderData();
  return <HomePage locale={locale} />;
}

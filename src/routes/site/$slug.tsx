import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getSite } from '@/config/sites';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { SiteDetail } from '@/blocks/site-detail';

export const Route = createFileRoute('/site/$slug')({
  loader: ({ params }) => {
    const site = getSite(params.slug);
    if (!site) throw notFound();
    return { locale: getLocale(), slug: site.slug };
  },
  head: ({ loaderData }) => {
    const site = loaderData && getSite(loaderData.slug);
    if (!loaderData || !site) return {};
    const locale = loaderData.locale;
    const description = locale === 'zh' ? site.tagline.zh : site.tagline.en;
    return {
      meta: [
        {
          title: `${m['landing.site.meta_title']({ name: site.name }, { locale })} | ${envConfigs.app_name}`,
        },
        { name: 'description', content: description },
      ],
      links: [
        {
          rel: 'canonical',
          href: localizeUrl(`${envConfigs.app_url}/site/${site.slug}`, {
            locale,
          }).href,
        },
      ],
    };
  },
  component: SitePage,
});

function SitePage() {
  const { slug } = Route.useLoaderData();
  const site = getSite(slug)!;
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <SiteDetail site={site} />
      </main>
      <Footer />
    </div>
  );
}

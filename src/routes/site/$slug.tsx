import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getSite } from '@/config/sites';
import { getSubmittedSiteFn } from '@/lib/submitted-sites';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { SiteDetail } from '@/blocks/site-detail';

export const Route = createFileRoute('/site/$slug')({
  loader: async ({ params }) => {
    const site =
      getSite(params.slug) ?? (await getSubmittedSiteFn({ data: params.slug }));
    if (!site) throw notFound();
    return { locale: getLocale(), site };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const site = loaderData.site;
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
  const { site } = Route.useLoaderData();
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

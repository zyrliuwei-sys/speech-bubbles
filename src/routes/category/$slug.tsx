import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { isCategorySlug, SITES } from '@/config/sites';
import { m } from '@/paraglide/messages.js';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
import { CategorySites } from '@/blocks/category-sites';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { categoryLabel } from '@/blocks/nav-i18n';

export const Route = createFileRoute('/category/$slug')({
  loader: ({ params }) => {
    if (!isCategorySlug(params.slug)) throw notFound();
    const locale = getLocale();
    const slug = params.slug;
    const name = categoryLabel(slug);
    const count = SITES.filter((s) => s.category === slug).length;
    return {
      locale,
      slug,
      title: m['landing.category.page_title']({ name }, { locale }),
      description: m['landing.category.page_desc']({ name, count }, { locale }),
    };
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: [
            { title: `${loaderData.title} | ${envConfigs.app_name}` },
            { name: 'description', content: loaderData.description },
          ],
          links: [
            {
              rel: 'canonical',
              href: localizeUrl(
                `${envConfigs.app_url}/category/${loaderData.slug}`,
                { locale: loaderData.locale }
              ).href,
            },
          ],
        }
      : {},
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <CategorySites slug={slug} />
      </main>
      <Footer />
    </div>
  );
}

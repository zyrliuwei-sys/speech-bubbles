import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { Blog } from '@/blocks/blog';
import { BlogSeoContent } from '@/blocks/blog-seo-content';
import { CTA } from '@/blocks/cta';
import { FAQ } from '@/blocks/faq';
import { Features } from '@/blocks/features';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Hero } from '@/blocks/hero';
import { HowItWorks } from '@/blocks/how-it-works';
import { Pricing } from '@/blocks/pricing';
import { Showcase } from '@/blocks/showcase';
import { SupportWidget } from '@/blocks/support-widget';
import { Testimonials } from '@/blocks/testimonials';
import { TryIt } from '@/blocks/try-it';
import { WhyChoose } from '@/blocks/why-choose';
import { getBlogPostsFn } from '@/content/posts/server';

export const Route = createFileRoute('/blog/')({
  loader: async () => {
    const locale = getLocale();
    const posts = await getBlogPostsFn({ data: { locale } });
    return { locale, posts };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/blog`, { locale: loc as any }).href;
    return {
      meta: [
        { title: m['blog.seo.title']({}, { locale: locale as any }) },
        {
          name: 'description',
          content: m['blog.seo.description']({}, { locale: locale as any }),
        },
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
  component: BlogPage,
});

function BlogPage() {
  const { posts } = Route.useLoaderData();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main>
        <Hero />
        <Showcase />
        <TryIt />
        <WhyChoose />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Blog posts={posts} />
        <CTA />
        <BlogSeoContent />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { CTA } from '@/blocks/cta';
import { FAQ } from '@/blocks/faq';
import { Features } from '@/blocks/features';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { Hero } from '@/blocks/hero';
import { HowItWorks } from '@/blocks/how-it-works';
import { Pricing } from '@/blocks/pricing';
import { SeoContent } from '@/blocks/seo-content';
import { Showcase } from '@/blocks/showcase';
import { SupportWidget } from '@/blocks/support-widget';
import { Testimonials } from '@/blocks/testimonials';
import { TryIt } from '@/blocks/try-it';
import { WhyChoose } from '@/blocks/why-choose';

const FAQ_KEYS = [
  'signup',
  'watermark',
  'formats',
  'mobile',
  'privacy',
] as const;

/** WebSite + FAQPage structured data (JSON-LD) for rich-result eligibility. */
function buildJsonLd(locale: string, origin: string) {
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: envConfigs.app_name,
    url: origin,
    description: m['landing.seo.description']({}, { locale: locale as any }),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url: origin,
    mainEntity: FAQ_KEYS.map((k) => ({
      '@type': 'Question',
      name: m[`landing.faq.${k}.question` as const](
        {},
        { locale: locale as any }
      ),
      acceptedAnswer: {
        '@type': 'Answer',
        text: m[`landing.faq.${k}.answer` as const](
          {},
          { locale: locale as any }
        ),
      },
    })),
  };

  return [website, faqPage];
}

function JsonLd({ data }: { data: unknown[] }) {
  return (
    <>
      {data.map((d, i) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }}
          key={i}
          type="application/ld+json"
        />
      ))}
    </>
  );
}

function HomePage() {
  const { locale } = Route.useLoaderData();
  const origin =
    (typeof window !== 'undefined' && window.location?.origin) ||
    envConfigs.app_url ||
    '';

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <JsonLd data={buildJsonLd(locale, origin)} />
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
        <CTA />
        <SeoContent />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

export const Route = createFileRoute('/')({
  loader: async () => {
    return { locale: getLocale() };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const origin =
      (typeof window !== 'undefined' && window.location?.origin) ||
      envConfigs.app_url ||
      '';
    const urlFor = (loc: string) =>
      localizeUrl(`${origin}/`, { locale: loc as any }).href;
    const title = m['landing.seo.title']({}, { locale: locale as any });
    const description = m['landing.seo.description'](
      {},
      { locale: locale as any }
    );
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        // Open Graph (page-specific)
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: origin || envConfigs.app_url },
        { property: 'og:locale', content: locale === 'zh' ? 'zh_CN' : 'en_US' },
        // Twitter / X
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

import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getTopic } from '@/config/topics';
import { getLocale } from '@/paraglide/runtime.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { topicTitle } from '@/blocks/nav-i18n';
import { TopicDetail } from '@/blocks/topic-detail';

export const Route = createFileRoute('/game/$slug')({
  loader: ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();
    return { locale: getLocale(), slug: topic.slug };
  },
  head: ({ loaderData }) => {
    const topic = loaderData && getTopic(loaderData.slug);
    if (!loaderData || !topic) return {};
    const title = `${topicTitle(topic)} — ${topic.game}`;
    return {
      meta: [
        { title: `${title} | ${envConfigs.app_name}` },
        { name: 'description', content: topic.summary },
        {
          name: 'keywords',
          content: [topic.keyword, ...topic.aliases].join(', '),
        },
        { property: 'og:title', content: title },
        { property: 'og:description', content: topic.summary },
        { property: 'og:type', content: 'article' },
      ],
      // Topic content is English-only, so /zh/game/* is a duplicate of the
      // English page; point every locale's canonical at the English URL.
      links: [
        { rel: 'canonical', href: `${envConfigs.app_url}/game/${topic.slug}` },
      ],
      scripts: topic.faq?.length
        ? [
            {
              type: 'application/ld+json',
              children: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: topic.faq.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              }),
            },
          ]
        : [],
    };
  },
  component: TopicPage,
});

function TopicPage() {
  const { slug } = Route.useLoaderData();
  const topic = getTopic(slug)!;
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <TopicDetail topic={topic} />
      </main>
      <Footer />
    </div>
  );
}

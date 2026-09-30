import { createFileRoute, notFound } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { getTopic } from '@/config/topics';
import { getLocale, localizeUrl } from '@/paraglide/runtime.js';
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
      links: [
        {
          rel: 'canonical',
          href: localizeUrl(`${envConfigs.app_url}/game/${topic.slug}`, {
            locale: loaderData.locale,
          }).href,
        },
      ],
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

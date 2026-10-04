import { createFileRoute, notFound } from '@tanstack/react-router';
import { MDXProvider } from '@mdx-js/react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { mdxComponents } from '@/components/mdx-components';
import { formatPostDate, getPost, getPostContent } from '@/content/posts';

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return { slug: post.slug };
  },
  head: ({ loaderData }) => {
    const post = loaderData && getPost(loaderData.slug);
    if (!post) return {};
    const url = `${envConfigs.app_url}/blog/${post.slug}`;
    const image = post.cover ? `${envConfigs.app_url}${post.cover}` : undefined;
    return {
      meta: [
        { title: `${post.title} | ${envConfigs.app_name}` },
        { name: 'description', content: post.description },
        { property: 'og:title', content: post.title },
        { property: 'og:description', content: post.description },
        { property: 'og:type', content: 'article' },
        ...(image ? [{ property: 'og:image', content: image }] : []),
      ],
      links: [{ rel: 'canonical', href: url }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            ...(image ? { image } : {}),
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useLoaderData();
  const post = getPost(slug)!;
  const Content = getPostContent(slug)!;

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-12 md:px-8 md:py-16">
        <article className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="size-4" />
            {m['blog.back']()}
          </Link>

          <header className="border-border mt-8 mb-6 border-b pb-6">
            {post.tag && (
              <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
                {post.tag}
              </p>
            )}
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {post.title}
            </h1>
            <p className="text-muted-foreground mt-3">{post.description}</p>
            <p className="text-muted-foreground mt-4 inline-flex items-center gap-1.5 text-sm">
              <Calendar className="size-4" />
              {formatPostDate(post.date)}
            </p>
          </header>

          {post.cover && (
            <img
              src={post.cover}
              alt={post.title}
              width={1600}
              height={900}
              className="border-border mb-8 w-full rounded-2xl border"
            />
          )}

          <div className="text-foreground/90 text-[15px] leading-7">
            <MDXProvider components={mdxComponents}>
              <Content />
            </MDXProvider>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

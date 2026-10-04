import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { Footer } from '@/blocks/footer';
import { Header } from '@/blocks/header';
import { BlogCard } from '@/components/blog-card';
import { formatPostDate, getPosts } from '@/content/posts';

export const Route = createFileRoute('/blog/')({
  head: () => ({
    meta: [
      { title: `${m['blog.title']()} | ${envConfigs.app_name}` },
      { name: 'description', content: m['blog.description']() },
    ],
    // Posts are English-only, so every locale points at the English list.
    links: [{ rel: 'canonical', href: `${envConfigs.app_url}/blog` }],
  }),
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const posts = getPosts();

  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 px-4 py-12 md:px-8 md:py-16">
        <div className="mx-auto max-w-5xl">
          <header className="mb-10">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {m['blog.title']()}
            </h1>
            <p className="text-muted-foreground mt-3 max-w-2xl">
              {m['blog.description']()}
            </p>
          </header>
          {posts.length === 0 ? (
            <p className="text-muted-foreground">{m['blog.empty']()}</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  title={post.title}
                  description={post.description}
                  image={post.cover}
                  date={formatPostDate(post.date)}
                  authorName={post.tag}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

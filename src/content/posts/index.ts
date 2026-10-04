import type { ComponentType } from 'react';

/**
 * Blog posts, written as MDX files in this directory: `<slug>.en.mdx`.
 * Every file exports `meta` (see BlogPostMeta); dropping in a new file is
 * all it takes to publish a post — the list, routes and sitemap pick it up.
 * Posts are English-only, like the game topic pages.
 */
export type BlogPostMeta = {
  title: string;
  description: string;
  /** ISO date, e.g. '2026-10-04' */
  date: string;
  /** Public image path shown on the card and at the top of the post. */
  cover?: string;
  /** Short label shown on the card, e.g. 'AI tools'. */
  tag?: string;
};

type PostModule = {
  default: ComponentType;
  meta: BlogPostMeta;
};

export type BlogPost = BlogPostMeta & { slug: string };

const postModules = import.meta.glob<PostModule>('/src/content/posts/*.mdx', {
  eager: true,
});

const SLUG_RE = /\/src\/content\/posts\/(.+)\.en\.mdx$/;

const POSTS: BlogPost[] = Object.entries(postModules)
  .flatMap(([path, mod]) => {
    const slug = SLUG_RE.exec(path)?.[1];
    return slug ? [{ ...mod.meta, slug }] : [];
  })
  .sort((a, b) => b.date.localeCompare(a.date));

/** All posts, newest first. */
export function getPosts(): BlogPost[] {
  return POSTS;
}

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getPostContent(slug: string): ComponentType | undefined {
  return postModules[`/src/content/posts/${slug}.en.mdx`]?.default;
}

export function formatPostDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}

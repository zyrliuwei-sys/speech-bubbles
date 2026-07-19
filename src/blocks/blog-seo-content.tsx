import { tDynamic } from '@/core/i18n/dynamic';

/**
 * Free / no-sign-up SEO copy for the /blog landing page. Same structure as the
 * homepage's SeoContent block, but the copy targets "free" and "no sign up".
 * Keys live in messages/{en,zh}.json under `blog.seo.*`.
 */
const SECTIONS: { type: 'h2' | 'h3' | 'p'; key: string }[] = [
  { type: 'h2', key: 'blog.seo.s1.h' },
  { type: 'p', key: 'blog.seo.s1.p1' },
  { type: 'h2', key: 'blog.seo.s2.h' },
  { type: 'p', key: 'blog.seo.s2.p1' },
  { type: 'h2', key: 'blog.seo.s3.h' },
  { type: 'p', key: 'blog.seo.s3.p1' },
  { type: 'h3', key: 'blog.seo.s3a.h' },
  { type: 'p', key: 'blog.seo.s3a.p1' },
  { type: 'h2', key: 'blog.seo.s4.h' },
  { type: 'p', key: 'blog.seo.s4.p1' },
  { type: 'h2', key: 'blog.seo.s5.h' },
  { type: 'p', key: 'blog.seo.s5.p1' },
  { type: 'h2', key: 'blog.seo.s_uc.h' },
  { type: 'p', key: 'blog.seo.s_uc.p1' },
  { type: 'h2', key: 'blog.seo.s_fm.h' },
  { type: 'p', key: 'blog.seo.s_fm.p1' },
  { type: 'h2', key: 'blog.seo.s6.h' },
  { type: 'p', key: 'blog.seo.s6.p1' },
  { type: 'h2', key: 'blog.seo.s7.h' },
  { type: 'p', key: 'blog.seo.s7.p1' },
  { type: 'h2', key: 'blog.seo.s8.h' },
  { type: 'p', key: 'blog.seo.s8.p1' },
];

export function BlogSeoContent() {
  let paraIndex = 0;
  return (
    <section className="border-border border-t px-4 py-20 sm:py-24">
      <article className="mx-auto max-w-3xl">
        {SECTIONS.map((s, i) => {
          if (s.type === 'h2') {
            return (
              <h2
                key={i}
                className="mt-14 mb-4 font-serif text-2xl font-normal tracking-tight first:mt-0 sm:text-3xl"
              >
                {tDynamic(s.key)}
              </h2>
            );
          }
          if (s.type === 'h3') {
            return (
              <h3 key={i} className="mt-8 mb-3 text-lg font-medium sm:text-xl">
                {tDynamic(s.key)}
              </h3>
            );
          }
          paraIndex += 1;
          const lead = paraIndex === 1;
          return (
            <p
              key={i}
              className={
                lead
                  ? 'text-foreground/80 mb-5 text-base leading-relaxed sm:text-lg'
                  : 'text-muted-foreground mb-5 leading-relaxed'
              }
            >
              {tDynamic(s.key)}
            </p>
          );
        })}
      </article>
    </section>
  );
}

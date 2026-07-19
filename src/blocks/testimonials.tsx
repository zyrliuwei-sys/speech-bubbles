import { Star } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';

const ITEMS = [
  'item_1',
  'item_2',
  'item_3',
  'item_4',
  'item_5',
  'item_6',
] as const;

const AVATAR_GRADIENTS = [
  'from-rose-400 to-orange-400',
  'from-sky-400 to-indigo-400',
  'from-emerald-400 to-teal-400',
  'from-violet-400 to-fuchsia-400',
  'from-amber-400 to-rose-400',
  'from-cyan-400 to-blue-400',
];

export function Testimonials() {
  return (
    <section className="border-border bg-muted/30 border-t px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-14 text-center">
          <div className="text-primary mb-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.testimonials.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            {m['landing.testimonials.subtitle']()}
          </p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((key, i) => {
            const name = tDynamic(`landing.testimonials.${key}.name`);
            return (
              <Reveal key={key} delay={(i % 3) * 80}>
                <figure className="bg-card flex h-full flex-col rounded-2xl border p-6">
                  <blockquote className="text-foreground/90 text-sm leading-relaxed">
                    “{tDynamic(`landing.testimonials.${key}.quote`)}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-full bg-gradient-to-br ${AVATAR_GRADIENTS[i]} text-sm font-semibold text-white`}
                    >
                      {name.slice(0, 1)}
                    </span>
                    <span className="leading-tight">
                      <span className="block text-sm font-medium">{name}</span>
                      <span className="text-muted-foreground text-xs">
                        {tDynamic(`landing.testimonials.${key}.role`)}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

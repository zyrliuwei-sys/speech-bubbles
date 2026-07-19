import { Hand, Palette, ShieldCheck, type LucideIcon } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';

const ITEMS: { key: string; icon: LucideIcon }[] = [
  { key: 'item_1', icon: Hand },
  { key: 'item_2', icon: Palette },
  { key: 'item_3', icon: ShieldCheck },
];

export function WhyChoose() {
  return (
    <section className="border-border border-t px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-14 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.why.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            {m['landing.why.subtitle']()}
          </p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {ITEMS.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 80}>
              <div className="bg-card hover:border-primary/30 group h-full rounded-2xl border p-6 transition-colors">
                <div className="bg-primary/10 text-primary mb-4 inline-flex size-11 items-center justify-center rounded-xl">
                  <Icon className="size-5" strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 font-medium">
                  {tDynamic(`landing.why.${key}.title`)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {tDynamic(`landing.why.${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

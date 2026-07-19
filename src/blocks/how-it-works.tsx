import {
  Download,
  MessageSquarePlus,
  Upload,
  type LucideIcon,
} from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';

const STEPS: { key: string; icon: LucideIcon }[] = [
  { key: 'step_1', icon: Upload },
  { key: 'step_2', icon: MessageSquarePlus },
  { key: 'step_3', icon: Download },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-14 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.how.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            {m['landing.how.subtitle']()}
          </p>
        </Reveal>
        <div className="relative grid gap-8 md:grid-cols-3">
          {STEPS.map(({ key, icon: Icon }, i) => (
            <Reveal key={key} delay={i * 90}>
              <div className="relative flex flex-col items-center text-center">
                <div className="bg-background border-primary/20 text-primary mb-5 flex size-16 items-center justify-center rounded-2xl border shadow-sm">
                  <Icon className="size-7" strokeWidth={1.75} />
                </div>
                <span className="text-muted-foreground/60 absolute -top-3 text-5xl font-bold">
                  {i + 1}
                </span>
                <h3 className="mb-2 font-medium">
                  {tDynamic(`landing.how.${key}.title`)}
                </h3>
                <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                  {tDynamic(`landing.how.${key}.description`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

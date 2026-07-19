import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';
import { buttonVariants } from '@/components/ui/button';

export function CTA() {
  return (
    <section className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12 sm:py-20">
            {/* decorative bubbles */}
            <svg
              className="pointer-events-none absolute -top-6 -right-6 size-40 opacity-20"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <path
                d="M20 15 h60 a10 10 0 0 1 10 10 v30 a10 10 0 0 1 -10 10 H50 l-18 14 v-14 H20 a10 10 0 0 1 -10 -10 V25 a10 10 0 0 1 10 -10 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
            <h2 className="mx-auto max-w-3xl font-serif text-4xl leading-[1.1] font-normal tracking-tight sm:text-5xl">
              {m['landing.cta.headline']()}
            </h2>
            <p className="text-primary-foreground/85 mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg">
              {m['landing.cta.subheadline']()}
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/editor"
                className={cn(
                  buttonVariants({ size: 'lg' }),
                  'bg-background text-primary hover:bg-background/90 h-12 gap-2 rounded-full px-8 text-base'
                )}
              >
                {m['landing.cta.button']()}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

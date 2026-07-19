import { ArrowRight } from 'lucide-react';

import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';
import { buildBubbleShape } from '@/components/speech-bubble-editor/bubble-shapes';
import { buttonVariants } from '@/components/ui/button';
import { DotPattern } from '@/components/ui/dot-pattern';

function HeroScene() {
  // Compose sample bubbles with the editor's own shape paths — meta & on-brand.
  const speech = buildBubbleShape('speech', 250, 92, { x: 70, y: 210 });
  const thought = buildBubbleShape('thought', 175, 92, { x: 360, y: 150 });
  const shout = buildBubbleShape('shout', 165, 120);

  const Bubble = ({
    shape,
    fill,
    stroke,
    strokeW = 3,
  }: {
    shape: { fills: string[]; strokes: string[] };
    fill: string;
    stroke: string;
    strokeW?: number;
  }) => (
    <>
      {shape.fills.map((d, i) => (
        <path key={`f${i}`} d={d} fill={fill} />
      ))}
      {shape.strokes.map((d, i) => (
        <path
          key={`s${i}`}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeW}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </>
  );

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="bg-primary/5 shadow-primary/10 overflow-hidden rounded-3xl border p-3 shadow-xl sm:p-4">
        <svg
          viewBox="0 0 640 460"
          className="h-auto w-full"
          role="img"
          aria-label="A photo with speech bubbles added"
        >
          <defs>
            <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="50%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>
            <clipPath id="hb-clip">
              <rect x="0" y="0" width="640" height="460" rx="20" />
            </clipPath>
          </defs>

          <g clipPath="url(#hb-clip)">
            {/* "photo" backdrop */}
            <rect x="0" y="0" width="640" height="460" fill="url(#hb-sky)" />
            <circle cx="500" cy="120" r="60" fill="#FFF8E1" opacity="0.85" />
            <path
              d="M0 330 Q 160 270 320 320 T 640 300 V460 H0 Z"
              fill="#7C3AED"
              opacity="0.55"
            />
            <path
              d="M0 380 Q 200 330 420 370 T 640 360 V460 H0 Z"
              fill="#4338CA"
              opacity="0.7"
            />

            {/* speech bubble */}
            <g transform="translate(40,40)">
              <Bubble shape={speech} fill="#FFFFFF" stroke="#111827" />
              <text
                x="125"
                y="42"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="26"
                fontWeight="700"
                fill="#111827"
              >
                Add bubbles
              </text>
              <text
                x="125"
                y="72"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
                fontSize="26"
                fontWeight="700"
                fill="#111827"
              >
                to any photo!
              </text>
            </g>

            {/* thought bubble */}
            <g transform="translate(360,24)">
              <Bubble shape={thought} fill="#FFFFFF" stroke="#111827" />
              <text
                x="87"
                y="55"
                textAnchor="middle"
                fontFamily="'Comic Sans MS', cursive"
                fontSize="24"
                fontWeight="600"
                fill="#111827"
              >
                So easy!
              </text>
            </g>

            {/* shout bubble */}
            <g transform="translate(430,270)">
              <Bubble
                shape={shout}
                fill="#FBBF24"
                stroke="#111827"
                strokeW={4}
              />
              <text
                x="82"
                y="74"
                textAnchor="middle"
                fontFamily="Impact, sans-serif"
                fontSize="44"
                fontWeight="800"
                fill="#111827"
              >
                WOW!
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* floating accent */}
      <div className="bg-background absolute -bottom-4 -left-4 hidden rounded-xl border px-3 py-2 text-xs shadow-lg sm:block">
        <span className="text-muted-foreground">Export</span>{' '}
        <span className="text-foreground font-semibold">PNG · HD</span>
      </div>
    </div>
  );
}

export function Hero() {
  const chips = [
    m['landing.why.item_3.title'](),
    m['landing.faq.signup.question']().replace(/\?$/, ''),
    m['landing.pricing.description']().split('.')[0],
  ];

  return (
    <section className="relative isolate overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]',
          'text-foreground/10'
        )}
      />
      <div className="relative mx-auto max-w-3xl space-y-7 text-center">
        <Reveal>
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            {m['landing.hero.badge']()}
          </span>
        </Reveal>
        <Reveal delay={60}>
          <h1 className="text-foreground font-serif text-5xl leading-[1.05] font-normal tracking-tight sm:text-6xl lg:text-7xl">
            {m['landing.hero.headline']()}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed sm:text-xl">
            {m['landing.hero.subheadline']()}
          </p>
        </Reveal>
        <Reveal delay={180}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/editor"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'h-12 gap-2 rounded-full px-8 text-base'
              )}
            >
              {m['landing.hero.cta']()}
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/pricing"
              className={cn(
                buttonVariants({ variant: 'outline', size: 'lg' }),
                'h-12 rounded-full px-8 text-base'
              )}
            >
              {m['landing.hero.secondary']()}
            </Link>
          </div>
        </Reveal>
        <Reveal delay={240}>
          <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs">
            {chips.map((chip, i) => (
              <span key={i} className="flex items-center gap-3">
                {i > 0 && <span className="bg-border size-1 rounded-full" />}
                {chip}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <Reveal delay={120} className="mt-14">
        <HeroScene />
      </Reveal>
    </section>
  );
}

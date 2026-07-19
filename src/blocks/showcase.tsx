import { ArrowRight } from 'lucide-react';

import { tDynamic } from '@/core/i18n/dynamic';
import { Link } from '@/core/i18n/navigation';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';
import { buildBubbleShape } from '@/components/speech-bubble-editor/bubble-shapes';
import { buttonVariants } from '@/components/ui/button';

/**
 * Showcase — a masonry "gallery wall" of speech-bubble creations.
 *
 * Each card is a self-contained SVG scene built from the editor's own
 * `buildBubbleShape` paths, so the showcase is literally "what the tool
 * makes", rendered in the product's visual language: comic outlines, candy
 * gradient backdrops, and hand-lettered text. Emoji subjects stand in for
 * photos — universal, crisp, and instantly readable in any locale.
 */

type Cat = 'meme' | 'chat' | 'comic' | 'caption' | 'thought' | 'reaction';

type SceneSpec =
  | {
      kind: 'shout';
      bg: string;
      cat: Cat;
      big: string;
      emoji: string;
      accent?: string;
    }
  | { kind: 'stack'; bg: string; cat: Cat; lines: string[] }
  | { kind: 'cloud'; bg: string; cat: Cat; text: string; emoji: string }
  | {
      kind: 'duo';
      bg: string;
      cat: Cat;
      left: { t: string; e: string };
      right: { t: string; e: string };
    }
  | {
      kind: 'meme';
      bg: string;
      cat: Cat;
      top: string;
      bottom: string;
      emoji: string;
    }
  | { kind: 'caption'; bg: string; cat: Cat; text: string; emoji: string };

const SCENES: SceneSpec[] = [
  {
    kind: 'shout',
    bg: 'from-amber-200 to-pink-300',
    cat: 'reaction',
    big: 'WOW',
    emoji: '🤯',
    accent: '#FBBF24',
  },
  {
    kind: 'stack',
    bg: 'from-indigo-200 to-violet-300',
    cat: 'chat',
    lines: ['u up? 🌙', 'yeah, u?', 'game? 🎮'],
  },
  {
    kind: 'cloud',
    bg: 'from-emerald-200 to-sky-300',
    cat: 'thought',
    text: 'pizza? 🍕',
    emoji: '🤔',
  },
  {
    kind: 'meme',
    bg: 'from-rose-300 to-amber-300',
    cat: 'meme',
    top: 'ME',
    bottom: 'ALSO ME',
    emoji: '😴',
  },
  {
    kind: 'duo',
    bg: 'from-sky-200 to-cyan-300',
    cat: 'comic',
    left: { t: "i'm hungry", e: '😋' },
    right: { t: 'again?! 😑', e: '😼' },
  },
  {
    kind: 'caption',
    bg: 'from-orange-200 to-amber-300',
    cat: 'caption',
    text: 'sunday vibes ☕',
    emoji: '🌅',
  },
  {
    kind: 'shout',
    bg: 'from-pink-300 to-fuchsia-300',
    cat: 'reaction',
    big: 'LOL',
    emoji: '😂',
    accent: '#F472B6',
  },
  {
    kind: 'cloud',
    bg: 'from-violet-200 to-indigo-300',
    cat: 'thought',
    text: 'one more ep…',
    emoji: '🥱',
  },
  {
    kind: 'stack',
    bg: 'from-teal-200 to-blue-300',
    cat: 'chat',
    lines: ['did u eat?', 'yes mom 😅', 'REALLY??'],
  },
  {
    kind: 'duo',
    bg: 'from-cyan-200 to-sky-300',
    cat: 'comic',
    left: { t: 'love u 💛', e: '🐶' },
    right: { t: 'u more!', e: '🐱' },
  },
  {
    kind: 'meme',
    bg: 'from-lime-200 to-emerald-300',
    cat: 'meme',
    top: 'NO WIFI',
    bottom: 'WHY ME',
    emoji: '😰',
  },
  {
    kind: 'caption',
    bg: 'from-fuchsia-200 to-pink-300',
    cat: 'caption',
    text: 'deadline who? 🕒',
    emoji: '💻',
  },
];

// Subtle per-card tilt for a "pinned to a wall" collage feel; straightens on hover.
const ROT = [-1.2, 0.8, -0.6, 1.1, -0.9, 0.5, -1, 0.9, -0.7, 0.6, -1.1, 0.7];

const RATIO: Record<SceneSpec['kind'], string> = {
  shout: 'aspect-square',
  stack: 'aspect-[3/4]',
  cloud: 'aspect-[6/5]',
  duo: 'aspect-square',
  meme: 'aspect-square',
  caption: 'aspect-[16/10]',
};

const CAT_CLASS: Record<Cat, string> = {
  meme: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
  chat: 'bg-sky-500/15 text-sky-700 dark:text-sky-300',
  comic: 'bg-violet-500/15 text-violet-700 dark:text-violet-300',
  caption: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  thought: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
  reaction: 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
};

function B({
  shape,
  fill = '#fff',
  stroke = '#111827',
  sw = 3,
}: {
  shape: { fills: string[]; strokes: string[] };
  fill?: string;
  stroke?: string;
  sw?: number;
}) {
  return (
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
          strokeWidth={sw}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

function Scene({ s }: { s: SceneSpec }) {
  switch (s.kind) {
    case 'shout': {
      const burst = buildBubbleShape('shout', 170, 132);
      return (
        <svg
          viewBox="0 0 300 300"
          className="h-full w-full"
          role="img"
          aria-label={s.big}
        >
          <g transform="translate(65,45)">
            <B shape={burst} fill={s.accent ?? '#FBBF24'} sw={5} />
          </g>
          <text
            x="150"
            y="111"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="Impact, 'Arial Black', sans-serif"
            fontSize="46"
            fontWeight="800"
            fill="#111827"
          >
            {s.big}
          </text>
          <text
            x="150"
            y="238"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="58"
          >
            {s.emoji}
          </text>
        </svg>
      );
    }
    case 'stack': {
      const rows = s.lines;
      const ys = [50, 160, 270];
      const h = 58;
      return (
        <svg
          viewBox="0 0 300 400"
          className="h-full w-full"
          role="img"
          aria-label={rows.join(' ')}
        >
          {rows.map((ln, i) => {
            const left = i % 2 === 0;
            const x = left ? 20 : 50;
            const tail = left ? { x: 55, y: 92 } : { x: 175, y: 92 };
            const shape = buildBubbleShape('speech', 230, h, tail);
            return (
              <g key={i} transform={`translate(${x},${ys[i]})`}>
                <B shape={shape} />
                <text
                  x={115}
                  y={29}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontFamily="Inter, sans-serif"
                  fontSize="17"
                  fontWeight="600"
                  fill="#111827"
                >
                  {ln}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }
    case 'cloud': {
      const cloud = buildBubbleShape('thought', 180, 84, { x: 50, y: 150 });
      return (
        <svg
          viewBox="0 0 300 260"
          className="h-full w-full"
          role="img"
          aria-label={s.text}
        >
          <g transform="translate(60,30)">
            <B shape={cloud} />
          </g>
          <text
            x="150"
            y="72"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Comic Sans MS', 'Comic Sans', cursive"
            fontSize="18"
            fontWeight="600"
            fill="#111827"
          >
            {s.text}
          </text>
          <text
            x="150"
            y="200"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="62"
          >
            {s.emoji}
          </text>
        </svg>
      );
    }
    case 'duo': {
      const lb = buildBubbleShape('speech', 150, 58, { x: 40, y: 96 });
      const rb = buildBubbleShape('speech', 150, 58, { x: 110, y: 96 });
      const txt = (x: number, t: string) => (
        <text
          x={x}
          y={69}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Inter, sans-serif"
          fontSize="15"
          fontWeight="600"
          fill="#111827"
        >
          {t}
        </text>
      );
      return (
        <svg
          viewBox="0 0 300 300"
          className="h-full w-full"
          role="img"
          aria-label={`${s.left.t} ${s.right.t}`}
        >
          <g transform="translate(20,40)">
            <B shape={lb} />
          </g>
          {txt(95, s.left.t)}
          <g transform="translate(130,40)">
            <B shape={rb} />
          </g>
          {txt(205, s.right.t)}
          <text
            x="85"
            y="228"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="52"
          >
            {s.left.e}
          </text>
          <text
            x="215"
            y="228"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="52"
          >
            {s.right.e}
          </text>
        </svg>
      );
    }
    case 'meme': {
      const cap = (y: number, v: string) => (
        <text
          x="150"
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Impact, 'Arial Black', sans-serif"
          fontSize="34"
          fontWeight="800"
          fill="#fff"
          stroke="#000"
          strokeWidth={3}
          strokeLinejoin="round"
          style={{ paintOrder: 'stroke' }}
        >
          {v}
        </text>
      );
      return (
        <svg
          viewBox="0 0 300 300"
          className="h-full w-full"
          role="img"
          aria-label={`${s.top} ${s.bottom}`}
        >
          {cap(42, s.top)}
          <text
            x="150"
            y="155"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="78"
          >
            {s.emoji}
          </text>
          {cap(262, s.bottom)}
        </svg>
      );
    }
    case 'caption': {
      return (
        <svg
          viewBox="0 0 320 200"
          className="h-full w-full"
          role="img"
          aria-label={s.text}
        >
          <text
            x="160"
            y="78"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="62"
          >
            {s.emoji}
          </text>
          <g transform="translate(30,140)">
            <rect width="260" height="44" rx="12" fill="#111827" />
            <text
              x="130"
              y="22"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="Inter, sans-serif"
              fontSize="17"
              fontWeight="600"
              fill="#fff"
            >
              {s.text}
            </text>
          </g>
        </svg>
      );
    }
  }
}

function SceneCard({ s, i }: { s: SceneSpec; i: number }) {
  const catLabel = tDynamic('landing.showcase.cat.' + s.cat);
  return (
    <Reveal
      as="li"
      delay={(i % 4) * 70}
      className="mb-5 block w-full break-inside-avoid"
    >
      <div
        className="[transform:rotate(var(--rot))] transition-transform duration-300 hover:[transform:rotate(0deg)]"
        style={
          {
            ['--rot' as string]: `${ROT[i % ROT.length]}deg`,
          } as React.CSSProperties
        }
      >
        <Link
          href="/editor"
          aria-label={catLabel}
          className="group block focus-visible:outline-none"
        >
          <article className="bg-card overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div
              className={cn(
                'relative overflow-hidden bg-gradient-to-br',
                RATIO[s.kind],
                s.bg
              )}
            >
              {/* paper-grain vignette for depth */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.12))]" />
              <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-[1.04]">
                <Scene s={s} />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 px-3.5 py-3">
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
                  CAT_CLASS[s.cat]
                )}
              >
                {catLabel}
              </span>
              <span className="text-muted-foreground text-xs tabular-nums">
                #{String(i + 1).padStart(2, '0')}
              </span>
            </div>
          </article>
        </Link>
      </div>
    </Reveal>
  );
}

export function Showcase() {
  return (
    <section className="relative px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl space-y-4 text-center">
          <span className="bg-primary/10 text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
            {m['landing.showcase.badge']()}
          </span>
          <h2 className="text-foreground font-serif text-4xl leading-tight font-normal tracking-tight sm:text-5xl">
            {m['landing.showcase.title']()}
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {m['landing.showcase.subtitle']()}
          </p>
        </Reveal>

        <ul className="mt-12 list-none columns-1 gap-5 p-0 sm:columns-2 lg:columns-3 xl:columns-4">
          {SCENES.map((s, i) => (
            <SceneCard key={i} s={s} i={i} />
          ))}
        </ul>

        <Reveal delay={120} className="mt-12 flex justify-center">
          <Link
            href="/editor"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'h-12 gap-2 rounded-full px-8 text-base'
            )}
          >
            {m['landing.showcase.cta']()}
            <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

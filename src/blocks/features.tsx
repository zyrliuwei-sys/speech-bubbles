import { tDynamic } from '@/core/i18n/dynamic';
import { cn } from '@/lib/utils';
import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';
import { buildBubbleShape } from '@/components/speech-bubble-editor/bubble-shapes';

const DEEP = ['deep_1', 'deep_2', 'deep_3'] as const;

type Shape = { fills: string[]; strokes: string[] };

function MiniBubble({
  shape,
  fill,
  stroke,
  strokeW = 3,
}: {
  shape: Shape;
  fill: string;
  stroke: string;
  strokeW?: number;
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
          strokeWidth={strokeW}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </>
  );
}

function Panel({
  children,
  gradient,
}: {
  children: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] overflow-hidden rounded-2xl border',
        gradient
      )}
    >
      <svg viewBox="0 0 400 300" className="h-full w-full">
        {children}
      </svg>
    </div>
  );
}

function Scene1() {
  const speech = buildBubbleShape('speech', 170, 70, { x: 40, y: 150 });
  const thought = buildBubbleShape('thought', 130, 70, { x: 260, y: 120 });
  return (
    <Panel gradient="bg-gradient-to-br from-sky-100 to-indigo-100">
      <g transform="translate(30,40)">
        <MiniBubble shape={speech} fill="#fff" stroke="#111827" />
        <text
          x="85"
          y="44"
          textAnchor="middle"
          fontFamily="Inter,sans-serif"
          fontSize="20"
          fontWeight="700"
          fill="#111827"
        >
          Hello!
        </text>
      </g>
      <g transform="translate(230,30)">
        <MiniBubble shape={thought} fill="#fff" stroke="#111827" />
        <text
          x="65"
          y="44"
          textAnchor="middle"
          fontFamily="'Comic Sans MS',cursive"
          fontSize="18"
          fontWeight="600"
          fill="#111827"
        >
          Hmm...
        </text>
      </g>
    </Panel>
  );
}

function Scene2() {
  const shout = buildBubbleShape('shout', 130, 100);
  return (
    <Panel gradient="bg-gradient-to-br from-amber-100 to-rose-100">
      <g transform="translate(250,40)">
        <MiniBubble shape={shout} fill="#FBBF24" stroke="#111827" strokeW={4} />
        <text
          x="65"
          y="62"
          textAnchor="middle"
          fontFamily="Impact,sans-serif"
          fontSize="32"
          fontWeight="800"
          fill="#111827"
        >
          POW!
        </text>
      </g>
      <text
        x="40"
        y="220"
        fontFamily="Impact,sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="#111827"
        stroke="#fff"
        strokeWidth="6"
        paintOrder="stroke"
      >
        Caption
      </text>
      <text
        x="40"
        y="220"
        fontFamily="Impact,sans-serif"
        fontSize="34"
        fontWeight="800"
        fill="#111827"
      >
        Caption
      </text>
    </Panel>
  );
}

function Scene3() {
  const a = buildBubbleShape('speech', 150, 64, { x: 30, y: 130 });
  const b = buildBubbleShape('speech', 120, 56, { x: 250, y: 100 });
  return (
    <Panel gradient="bg-gradient-to-br from-violet-100 to-emerald-100">
      <g transform="translate(30,60)">
        <MiniBubble shape={a} fill="#DBEAFE" stroke="#2563EB" />
        <text
          x="75"
          y="40"
          textAnchor="middle"
          fontFamily="Inter,sans-serif"
          fontSize="18"
          fontWeight="700"
          fill="#1E3A8A"
        >
          Layer 1
        </text>
      </g>
      <g transform="translate(160,130)">
        <MiniBubble shape={b} fill="#FCE7F3" stroke="#DB2777" />
        <text
          x="60"
          y="36"
          textAnchor="middle"
          fontFamily="'Libre Baskerville',serif"
          fontSize="16"
          fontWeight="700"
          fill="#9D174D"
        >
          Layer 2
        </text>
      </g>
    </Panel>
  );
}

const SCENES = [Scene1, Scene2, Scene3];

export function Features() {
  return (
    <section id="features" className="px-4 py-20 sm:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.features.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl">
            {m['landing.features.description']()}
          </p>
        </Reveal>

        <div className="space-y-16 sm:space-y-24">
          {DEEP.map((key, i) => {
            const Scene = SCENES[i];
            return (
              <Reveal key={key}>
                <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
                  <div className={cn(i % 2 === 1 && 'md:order-2')}>
                    <Scene />
                  </div>
                  <div className={cn(i % 2 === 1 && 'md:order-1')}>
                    <h3 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
                      {tDynamic(`landing.features.${key}.title`)}
                    </h3>
                    <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
                      {tDynamic(`landing.features.${key}.description`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

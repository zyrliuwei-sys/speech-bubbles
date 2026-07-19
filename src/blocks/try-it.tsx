import { m } from '@/paraglide/messages.js';
import { Reveal } from '@/components/reveal';
import { SpeechBubbleEditor } from '@/components/speech-bubble-editor';

export function TryIt() {
  return (
    <section id="try-it" className="px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-8 text-center">
          <h2 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            {m['landing.try_it.title']()}
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl">
            {m['landing.try_it.subtitle']()}
          </p>
        </Reveal>
        <Reveal>
          <div className="bg-card h-[560px] overflow-hidden rounded-3xl border p-3 sm:h-[600px] sm:p-4">
            <SpeechBubbleEditor />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

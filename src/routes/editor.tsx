import { createFileRoute } from '@tanstack/react-router';

import { envConfigs } from '@/config';
import { m } from '@/paraglide/messages.js';
import { getLocale, locales, localizeUrl } from '@/paraglide/runtime.js';
import { SiteHeader } from '@/components/site-header';
import { SpeechBubbleEditor } from '@/components/speech-bubble-editor';

function EditorPage() {
  return (
    <div className="bg-background text-foreground flex h-[100dvh] flex-col">
      <SiteHeader
        navLinks={[
          { href: '/editor', label: m['editor.title']() },
          { href: '/#features', label: m['landing.nav.features']() },
          { href: '/pricing', label: m['landing.nav.pricing']() },
        ]}
      />
      <main className="flex min-h-0 flex-1 flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="font-serif text-2xl font-normal tracking-tight sm:text-3xl">
              {m['editor.title']()}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm">
              {m['editor.subtitle']()}
            </p>
          </div>
        </div>
        <div className="bg-card min-h-0 flex-1 overflow-hidden rounded-2xl border p-3 sm:p-4">
          <SpeechBubbleEditor />
        </div>
      </main>
    </div>
  );
}

export const Route = createFileRoute('/editor')({
  head: () => {
    const locale = getLocale();
    const urlFor = (loc: string) =>
      localizeUrl(`${envConfigs.app_url}/editor`, { locale: loc as any }).href;
    return {
      meta: [
        { title: `${m['editor.title']()} · ${envConfigs.app_name}` },
        {
          name: 'description',
          content: m['editor.subtitle']({}, { locale: locale as any }),
        },
      ],
      links: [
        { rel: 'canonical', href: urlFor(locale) },
        ...locales.map((loc) => ({
          rel: 'alternate',
          hrefLang: loc,
          href: urlFor(loc),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: EditorPage,
});

import { getSite, siteDomain } from '@/config/sites';
import { m } from '@/paraglide/messages.js';
import { SponsorRail, type SponsorItem } from '@/components/nav/sponsor-rail';

import { localized } from './nav-i18n';

// Featured slots shown in the fixed side rails on wide screens.
const LEFT = ['poki', 'steam', 'fandom', 'nexus-mods', 'howlongtobeat'];
const RIGHT = [
  'crazygames',
  'epic-games-store',
  'krunker',
  'steamdb',
  'lichess',
];
const TINTS = [
  'bg-sky-50 border-sky-100 dark:bg-sky-500/10 dark:border-sky-500/20',
  'bg-lime-50 border-lime-100 dark:bg-lime-500/10 dark:border-lime-500/20',
  'bg-rose-50 border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20',
  'bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20',
  'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20',
];

function toItems(slugs: string[], offset: number): SponsorItem[] {
  return slugs.flatMap((slug, i) => {
    const s = getSite(slug);
    if (!s) return [];
    return [
      {
        url: s.url,
        domain: siteDomain(s.url),
        title: s.name,
        subtitle: localized(s.tagline),
        tint: TINTS[(i + offset) % TINTS.length],
      },
    ];
  });
}

export function SponsorRails() {
  return (
    <>
      <SponsorRail side="left" items={toItems(LEFT, 0)} />
      <SponsorRail
        side="right"
        items={toItems(RIGHT, 2)}
        footer={{ label: m['landing.sponsor.advertise'](), href: '/submit' }}
      />
    </>
  );
}

import {
  CATEGORIES,
  siteDomain,
  type CategorySlug,
  type Localized,
  type Site,
} from '@/config/sites';
import type { Topic, TopicGroup } from '@/config/topics';
import { m } from '@/paraglide/messages.js';
import { getLocale } from '@/paraglide/runtime.js';
import type { SiteBadgeTone } from '@/components/nav/site-badge';
import type { SiteCardProps } from '@/components/nav/site-card';

// Shared i18n wiring for the directory blocks: maps catalog data to the props
// the `components/nav/*` primitives expect.

const CATEGORY_LABELS: Record<CategorySlug, () => string> = {
  'web-games': () => m['landing.category.web_games'](),
  io: () => m['landing.category.io'](),
  puzzle: () => m['landing.category.puzzle'](),
  stores: () => m['landing.category.stores'](),
  cloud: () => m['landing.category.cloud'](),
  guides: () => m['landing.category.guides'](),
  news: () => m['landing.category.news'](),
  mods: () => m['landing.category.mods'](),
  deals: () => m['landing.category.deals'](),
  tools: () => m['landing.category.tools'](),
};

const BADGE_LABELS: Record<SiteBadgeTone, () => string> = {
  hot: () => m['landing.badge.hot'](),
  new: () => m['landing.badge.new'](),
  free: () => m['landing.badge.free'](),
};

export const categoryLabel = (slug: CategorySlug) => CATEGORY_LABELS[slug]();

export function localized(text: Localized): string {
  return getLocale() === 'zh' ? text.zh : text.en;
}

export function siteBadge(site: Site) {
  return site.badge
    ? { tone: site.badge, label: BADGE_LABELS[site.badge]() }
    : undefined;
}

export const siteHref = (site: Site) => `/site/${site.slug}`;
export const categoryHref = (slug: CategorySlug) => `/category/${slug}`;

export function siteCardProps(site: Site): SiteCardProps {
  return {
    name: site.name,
    url: site.url,
    domain: siteDomain(site.url),
    tagline: localized(site.tagline),
    badge: siteBadge(site),
    detail: { href: siteHref(site), label: m['landing.site.details']() },
  };
}

/** Text the search box matches against for a site. */
export function siteSearchText(site: Site): string {
  return [
    site.name,
    siteDomain(site.url),
    site.tagline.en,
    site.tagline.zh,
    categoryLabel(site.category),
    site.badge ? BADGE_LABELS[site.badge]() : '',
  ].join(' ');
}

export function categoriesWithLabels() {
  return CATEGORIES.map((c) => ({ ...c, label: categoryLabel(c.slug) }));
}

// ---------------------------------------------------------------------------
// Keyword topics
// ---------------------------------------------------------------------------

const TOPIC_GROUP_LABELS: Record<TopicGroup, () => string> = {
  roblox: () => m['landing.group.roblox'](),
  minecraft: () => m['landing.group.minecraft'](),
  genshin: () => m['landing.group.genshin'](),
  pc: () => m['landing.group.pc'](),
  indie: () => m['landing.group.indie'](),
  other: () => m['landing.group.other'](),
};

export const topicGroupLabel = (g: TopicGroup) => TOPIC_GROUP_LABELS[g]();
export const topicHref = (t: Topic) => `/game/${t.slug}`;

export function topicSearchText(t: Topic): string {
  return [
    t.keyword,
    ...t.aliases,
    t.game,
    t.summary,
    topicGroupLabel(t.group),
  ].join(' ');
}

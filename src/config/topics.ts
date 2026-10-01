import { TOPIC_DATA } from './topics-data';
import { TOPIC_FAQ } from './topics-faq';

/**
 * Keyword detail pages ("topics"). Each topic targets one search intent;
 * near-identical keyword variants live in `aliases` instead of getting their
 * own thin page. Content is English-first (the keywords are English).
 */

export type TopicGroup =
  | 'roblox'
  | 'minecraft'
  | 'genshin'
  | 'pc'
  | 'indie'
  | 'other';

export interface TopicSection {
  heading: string;
  body: string;
}

export interface Topic {
  slug: string;
  /** Primary keyword — used as the page H1 and card title. */
  keyword: string;
  aliases: string[];
  group: TopicGroup;
  /** The game (or product) the keyword is about. */
  game: string;
  /** One or two sentences: what the keyword refers to. */
  summary: string;
  sections: TopicSection[];
  /** Best matching site to send the visitor to. */
  site: { name: string; url: string };
  /** Optional extra references (wiki, store page, official post). */
  links?: { name: string; url: string }[];
  /**
   * Question-style searches answered directly. Each `q` is the phrase people
   * type into Google, so keep it verbatim; also emitted as FAQPage JSON-LD.
   */
  faq?: { q: string; a: string }[];
  updatedAt: string;
}

export const TOPIC_GROUPS: { slug: TopicGroup; emoji: string }[] = [
  { slug: 'roblox', emoji: '🟥' },
  { slug: 'minecraft', emoji: '⛏️' },
  { slug: 'genshin', emoji: '🌬️' },
  { slug: 'pc', emoji: '🎮' },
  { slug: 'indie', emoji: '✨' },
  { slug: 'other', emoji: '🔎' },
];

export const TOPICS: Topic[] = TOPIC_DATA.map((t) =>
  TOPIC_FAQ[t.slug] ? { ...t, faq: TOPIC_FAQ[t.slug] } : t
);

export function getTopic(slug: string): Topic | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

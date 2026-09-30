/**
 * Every whitespace-separated term in `query` must match `haystack`.
 * Latin terms match word prefixes ("io" ≠ "Riot"); CJK has no word breaks,
 * so those fall back to substring matching.
 */
export function matchesQuery(haystack: string, query: string): boolean {
  const terms = query
    .toLowerCase()
    .replace(/["“”]/g, '')
    .split(/\s+/)
    .filter(Boolean);
  if (terms.length === 0) return true;
  const text = haystack.toLowerCase();
  const words = text.split(/[^\p{L}\p{N}]+/u);
  return terms.every((t) =>
    /\p{Script=Han}/u.test(t)
      ? text.includes(t)
      : words.some((w) => w.startsWith(t))
  );
}

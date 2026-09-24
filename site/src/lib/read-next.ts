/**
 * "Read next" on a quiz's own page: always three articles.
 *
 * An article names the quizzes it belongs beside in its own front matter, and a quiz's page
 * reads that list backwards, so the two link both ways with no second list to keep in step.
 * Those come first, newest first and then by id, so two articles published on the same day
 * come out in the same order on every machine that builds the site.
 *
 * Some quizzes have only one article of their own (the gifts test, the figure quiz), and a
 * shelf with one book on it looked like a card that failed to load. So the row is always
 * filled to three from the other published articles. The fill is shuffled with a seed made
 * from the quiz's slug: the same quiz gets the same fill on every build, and two quizzes get
 * different ones. It is not "related" and does not pretend to be; the owner asked for three,
 * with the most relevant first.
 *
 * Pure on purpose: the page passes in the collection, so the rule can be tested without Astro.
 */

/** What the rule reads of an article: the collection entry's id and three front-matter fields. */
export interface ReadNextEntry {
  id: string;
  data: { draft: boolean; quizzes: string[]; published: Date };
}

/** Every quiz page shows exactly this many (scripts/quiz-page-test.mjs holds the built pages to it). */
export const READ_NEXT_COUNT = 3;

/** FNV-1a: a string to a 32-bit seed, the same on every machine. */
function seedOf(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: a small seeded generator, so a build never depends on Math.random. */
function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function readNextFor<T extends ReadNextEntry>(
  articles: readonly T[],
  quizSlug: string,
  count: number = READ_NEXT_COUNT
): T[] {
  const live = articles.filter(a => !a.data.draft);
  const own = live
    .filter(a => a.data.quizzes.includes(quizSlug))
    .sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf() || a.id.localeCompare(b.id));
  // The rest in a fixed order first (plain code-point order, which no locale can change), so
  // the shuffle starts from the same list wherever it runs.
  const rest = live
    .filter(a => !a.data.quizzes.includes(quizSlug))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const next = seeded(seedOf(quizSlug));
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [rest[i], rest[j]] = [rest[j]!, rest[i]!];
  }
  return [...own, ...rest].slice(0, count);
}

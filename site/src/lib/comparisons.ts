/**
 * The tradition comparison pages, as data.
 *
 * Twelve hand-written pairs — "Lutheran vs Reformed", "Calvinism vs Arminianism" — each one
 * a JSON file in src/data/comparisons/. A file is the whole page: the answer, the common
 * ground, the differences, the story, the sources. Nothing about a pair is written in a
 * template, so a thirteenth pair is a file and not a code change.
 *
 * WHAT THIS FILE IS FOR is the validation. The pages draw REAL positions from the audited
 * Compass data, and the one way that can go wrong is a file naming a tradition or an axis
 * that does not exist: the page would render with a marker missing, or with a heading
 * linking to a 404, and nothing on screen would look broken. So every file is checked here,
 * at build time, and a bad one FAILS THE BUILD with a message naming the file and the field.
 * A half-drawn comparison is worse than no comparison.
 *
 * It builds with whatever subset of the twelve exists: the routes, the hub, the nav and the
 * blocks on the Compass and tradition pages are all built from what loaded, never from a
 * list typed somewhere. A file whose name starts with an underscore is ignored, so a draft
 * left in the folder cannot reach the site.
 */
import { theologyCompass } from './quizzes/theology-compass';
import type { Outcome, QuizGroup } from './engine/types';

/** Comparisons are drawn on the Compass's rails, so they belong to the Compass. */
export const COMPARE_QUIZ = theologyCompass;

export interface ComparisonDifference {
  /** An axis SLUG (grace, table, gifts, kingdom, authority, worship). */
  axis: string;
  heading: string;
  /** What side A holds, in its own vocabulary. */
  a: string;
  /** The same for side B. */
  b: string;
  /** The difference in everyday words, one sentence. */
  plain: string;
}

export interface ComparisonBeyond {
  heading: string;
  text: string;
}

export interface ComparisonSource {
  title: string;
  side: 'a' | 'b' | 'both';
  note: string;
}

export interface Comparison {
  slug: string;
  /** Tradition slugs, as published at /tradition/<slug>/. */
  a: string;
  b: string;
  labelA: string;
  labelB: string;
  h1: string;
  searchTitle: string;
  description: string;
  /** Forty to fifty words answering the h1, quotable on its own. */
  answer: string;
  /** Which family each marker draws, and who else wears the label. */
  drawn: string;
  common: string[];
  differences: ComparisonDifference[];
  beyond_the_compass: ComparisonBeyond[];
  story: string[];
  on_a_sunday: string;
  did_you_know: string;
  sources: ComparisonSource[];
}

/* ------------------------------------------------------------------ validation */

const AXES = new Map<string, QuizGroup>(theologyCompass.groups.map(g => [g.slug, g]));
const TRADITIONS = new Map<string, Outcome>(theologyCompass.outcomes.map(o => [o.slug, o]));

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

class ComparisonError extends Error {}

function check(file: string, ok: unknown, what: string): asserts ok {
  if (!ok) throw new ComparisonError(`src/data/comparisons/${file}: ${what}`);
}

function str(file: string, value: unknown, field: string): string {
  check(file, typeof value === 'string' && value.trim().length > 0, `${field} is missing or empty`);
  return (value as string).trim();
}

function list(file: string, value: unknown, field: string, min: number, max: number): unknown[] {
  check(file, Array.isArray(value), `${field} must be a list`);
  const arr = value as unknown[];
  check(file, arr.length >= min && arr.length <= max,
    `${field} has ${arr.length} items (${min} to ${max})`);
  return arr;
}

/**
 * One file, validated into a Comparison.
 *
 * The two length rules are here rather than left to the SEO guard because the guard reads
 * built HTML and reports a path: a failure there says "/compare/x/ description 178
 * characters" long after the file that caused it has scrolled away. Caught here it names
 * the file. The bands match the guard's own (a description of 50 to 160, an answer of 30 to
 * 70 words), so nothing can pass one and fail the other; 40 to 50 words is the target a
 * writer aims at, and the wider band is where a passage has stopped being a snippet.
 */
function validate(file: string, raw: unknown): Comparison {
  check(file, raw && typeof raw === 'object', 'is not a JSON object');
  const d = raw as Record<string, unknown>;

  const slug = str(file, d.slug, 'slug');
  check(file, `${slug}.json` === file, `slug "${slug}" does not match the file name`);

  const a = str(file, d.a, 'a');
  const b = str(file, d.b, 'b');
  check(file, TRADITIONS.has(a), `a: "${a}" is not a tradition in compass.json`);
  check(file, TRADITIONS.has(b), `b: "${b}" is not a tradition in compass.json`);
  check(file, a !== b, 'a and b are the same tradition');

  const searchTitle = str(file, d.searchTitle, 'searchTitle');
  check(file, searchTitle.length <= 65, `searchTitle is ${searchTitle.length} characters (max 65)`);

  const description = str(file, d.description, 'description');
  check(file, description.length >= 50 && description.length <= 160,
    `description is ${description.length} characters (50 to 160)`);
  check(file, /[.?!…][)\]"'”’]?$/.test(description),
    'description does not end on a full stop, a question mark or an ellipsis');

  const answer = str(file, d.answer, 'answer');
  const n = words(answer);
  check(file, n >= 30 && n <= 70, `answer is ${n} words (40 to 50 is the target)`);

  const common = list(file, d.common, 'common', 1, 8).map((p, i) => str(file, p, `common[${i}]`));
  const story = list(file, d.story, 'story', 1, 6).map((p, i) => str(file, p, `story[${i}]`));

  const differences = list(file, d.differences, 'differences', 1, 6).map((item, i) => {
    check(file, item && typeof item === 'object', `differences[${i}] is not an object`);
    const raw = item as Record<string, unknown>;
    const axis = str(file, raw.axis, `differences[${i}].axis`);
    check(file, AXES.has(axis),
      `differences[${i}].axis: "${axis}" is not an axis slug (${[...AXES.keys()].join(', ')})`);
    return {
      axis,
      heading: str(file, raw.heading, `differences[${i}].heading`),
      a: str(file, raw.a, `differences[${i}].a`),
      b: str(file, raw.b, `differences[${i}].b`),
      plain: str(file, raw.plain, `differences[${i}].plain`)
    };
  });
  const seen = new Set<string>();
  for (const diff of differences) {
    check(file, !seen.has(diff.axis), `two differences both claim the ${diff.axis} axis`);
    seen.add(diff.axis);
  }

  const beyond = (d.beyond_the_compass === undefined ? [] : list(file, d.beyond_the_compass, 'beyond_the_compass', 0, 3))
    .map((item, i) => {
      check(file, item && typeof item === 'object', `beyond_the_compass[${i}] is not an object`);
      const raw = item as Record<string, unknown>;
      return {
        heading: str(file, raw.heading, `beyond_the_compass[${i}].heading`),
        text: str(file, raw.text, `beyond_the_compass[${i}].text`)
      };
    });

  const sources = list(file, d.sources, 'sources', 1, 8).map((item, i) => {
    check(file, item && typeof item === 'object', `sources[${i}] is not an object`);
    const raw = item as Record<string, unknown>;
    const side = str(file, raw.side, `sources[${i}].side`);
    check(file, side === 'a' || side === 'b' || side === 'both',
      `sources[${i}].side is "${side}" (a, b or both)`);
    return {
      title: str(file, raw.title, `sources[${i}].title`),
      side: side as 'a' | 'b' | 'both',
      note: str(file, raw.note, `sources[${i}].note`)
    };
  });

  return {
    slug,
    a,
    b,
    labelA: str(file, d.labelA, 'labelA'),
    labelB: str(file, d.labelB, 'labelB'),
    h1: str(file, d.h1, 'h1'),
    searchTitle,
    description,
    answer,
    drawn: str(file, d.drawn, 'drawn'),
    common,
    differences,
    beyond_the_compass: beyond,
    story,
    on_a_sunday: str(file, d.on_a_sunday, 'on_a_sunday'),
    did_you_know: str(file, d.did_you_know, 'did_you_know'),
    sources
  };
}

/* ------------------------------------------------------------------ the set */

const files = import.meta.glob<Record<string, unknown>>('../data/comparisons/*.json', {
  eager: true,
  import: 'default'
});

function load(): Comparison[] {
  const out: Comparison[] = [];
  for (const [path, raw] of Object.entries(files)) {
    const file = path.slice(path.lastIndexOf('/') + 1);
    // A draft or a scratch file left in the folder is not a page.
    if (file.startsWith('_')) continue;
    out.push(validate(file, raw));
  }
  /*
   * TWO PAGES MAY DRAW THE SAME TWO TRADITIONS, and two of the twelve do.
   *
   * "Calvinism vs Arminianism" and "Methodist vs Presbyterian" both put the Reformed and
   * the Wesleyan sketches on the rails, because they are two different questions people
   * type: one asks about a disagreement, the other about two denominations, and the labels,
   * the answer and the story differ accordingly. So sameness of the pair is not an error,
   * and the check that used to be here refused a build over an editorial decision. Sameness
   * of the SLUG is impossible: it is the file name.
   *
   * What keeps the two from competing with each other is that each links to the other — the
   * "other comparisons" block puts a page sharing BOTH traditions first — and that each
   * carries its own searchTitle and description, which the guard checks are unique.
   */
  // Alphabetical by slug, so the hub and every list come out in the same order on every
  // machine that builds the site. The hub re-sorts into its own groups from here.
  return out.sort((x, y) => x.slug.localeCompare(y.slug));
}

export const COMPARISONS: Comparison[] = load();

/* ------------------------------------------------------------------ helpers */

export const compareHref = (slug: string) => `/compare/${slug}/`;

export const getComparison = (slug: string | undefined): Comparison | undefined =>
  COMPARISONS.find(c => c.slug === slug);

/** Every comparison that draws this tradition, for the block on its own page. */
export const comparisonsFor = (traditionSlug: string): Comparison[] =>
  COMPARISONS.filter(c => c.a === traditionSlug || c.b === traditionSlug);

/**
 * The others, for the foot of a comparison page: the ones sharing a tradition with this
 * pair first, because a reader who has just read about Lutherans is most likely to want the
 * other Lutheran page, then the rest in the set's own order.
 */
export function otherComparisons(c: Comparison, limit = 6): Comparison[] {
  const rest = COMPARISONS.filter(o => o.slug !== c.slug);
  const shares = (o: Comparison) => o.a === c.a || o.a === c.b || o.b === c.a || o.b === c.b;
  return [...rest.filter(shares), ...rest.filter(o => !shares(o))].slice(0, limit);
}

/** The tradition record behind a side, for its name and its audited position vector. */
export const traditionOf = (slug: string): Outcome => {
  const found = TRADITIONS.get(slug);
  if (!found) throw new ComparisonError(`no tradition "${slug}" in compass.json`);
  return found;
};

/** The axis a difference is about, for its name, its two poles and its own page. */
export const axisOf = (slug: string): QuizGroup => {
  const found = AXES.get(slug);
  if (!found) throw new ComparisonError(`no axis "${slug}" on the Theology Compass`);
  return found;
};

/** Every tradition drawn by at least one comparison, in the Compass's own order. */
export const comparedTraditions = (): Outcome[] => {
  const used = new Set(COMPARISONS.flatMap(c => [c.a, c.b]));
  return theologyCompass.outcomes.filter(o => used.has(o.slug));
};

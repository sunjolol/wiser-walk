/**
 * The quiz registry. Adding a quiz means adding one import and one array entry —
 * every route, the codec, the result page and the share card pick it up from here.
 */
import type { Quiz, Sheet } from './types';
import { outcomePathBase } from './types';
import { theologyCompass } from '../quizzes/theology-compass';
import { sevenDeadlySins } from '../quizzes/seven-deadly-sins';
import { bibleFigure } from '../quizzes/bible-figure';
import { spiritualGifts } from '../quizzes/spiritual-gifts';

export const QUIZZES: Quiz[] = [theologyCompass, sevenDeadlySins, bibleFigure, spiritualGifts];

/** Live quizzes only: what the hub lists and what search engines are invited to index. */
export const liveQuizzes = () => QUIZZES.filter(q => q.status === 'live');

export const getQuiz = (slug: string | undefined): Quiz | undefined =>
  QUIZZES.find(q => q.slug === slug);

/** Convenience wrappers so pages never reach past the quiz into its strategy. */
export const scoreQuiz = (quiz: Quiz, sheet: Sheet) => quiz.strategy.score(quiz, sheet);
export const resultFor = (quiz: Quiz, values: number[]) => quiz.strategy.result(quiz, values);
export const encodeFor = (quiz: Quiz, values: number[]) => quiz.strategy.encode(quiz, values);
export const decodeFor = (quiz: Quiz, code: string) => quiz.strategy.decode(quiz, code);
export const shareTextFor = (quiz: Quiz, values: number[], origin: string) =>
  quiz.strategy.shareText(quiz, values, origin);

/**
 * URLs are built in urls.ts and nowhere else, and re-exported here so that every page
 * keeps importing its URLs from one module. They live one file down because a quiz data
 * file needs them too, and a quiz importing the registry that imports the quiz is a cycle.
 *
 * The two-person overlay's URLs live in compare.ts beside the rules they encode, and are
 * re-exported for the same reason.
 */
export { quizHref, groupHref, resultHref, outcomeHref } from './urls';
export {
  MAX_CODES, CODE_SEPARATOR, parseCodes, compare, compareHref, inviteHref
} from './compare';
export type {
  BipolarComparison, BipolarPairRow, Comparison, UnipolarComparison, UnipolarPairRow
} from './compare';

/**
 * Sanity checks that would otherwise only surface as a wrong result. Called at module
 * load so a malformed quiz fails the build rather than shipping.
 */
function validate(quiz: Quiz): void {
  const where = `quiz "${quiz.slug}"`;
  if (!quiz.items.length) throw new Error(`${where} has no items`);
  if (!quiz.groups.length) throw new Error(`${where} has no groups`);

  quiz.items.forEach(item => {
    if (item.group < 0 || item.group >= quiz.groups.length) {
      throw new Error(`${where}: item ${item.n} points at group ${item.group}`);
    }
  });

  quiz.groups.forEach((g, i) => {
    const dirs = quiz.items.filter(it => it.group === i).map(it => it.direction);
    if (!dirs.length) throw new Error(`${where}: group "${g.key}" has no items`);
    if (!dirs.includes(1) || !dirs.includes(-1)) {
      throw new Error(`${where}: group "${g.key}" lacks both keyings — acquiescence bias`);
    }
  });

  // The radix must match the items-per-group, or codes decode to unreachable scores.
  const counts = quiz.groups.map((_, i) => quiz.items.filter(it => it.group === i).length);
  const expected = counts[0]! * 4 + 1;
  if (new Set(counts).size === 1 && quiz.config.radix !== expected) {
    throw new Error(
      `${where}: radix ${quiz.config.radix} does not match ${counts[0]} items per group (expected ${expected})`
    );
  }

  // The declared shape must match the data. A bipolar axis missing a pole would render a
  // named position facing an anonymous blank; a unipolar category carrying poles would
  // invite the renderer to draw a centre that a ranking does not have.
  quiz.groups.forEach(g => {
    const poles = Boolean(g.left || g.right);
    if (quiz.strategy.shape === 'bipolar') {
      if (!g.left || !g.right) {
        throw new Error(`${where}: bipolar group "${g.key}" is missing a pole name`);
      }
      if (!g.bands || g.bands.length !== 5) {
        throw new Error(`${where}: bipolar group "${g.key}" needs five band adjectives`);
      }
    } else if (poles || g.bands) {
      throw new Error(
        `${where}: unipolar group "${g.key}" carries bipolar fields (left/right/bands). ` +
        'A ranking has no poles and no centre.'
      );
    }
  });

  // Slugs are the URL identity, so they must exist, be URL-safe, and be unique. A group
  // whose slug collided with another's would silently publish one axis over the other.
  const seen = new Set<string>();
  quiz.groups.forEach(g => {
    if (!g.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug)) {
      throw new Error(`${where}: group "${g.key}" has an unusable slug ${JSON.stringify(g.slug)}`);
    }
    if (seen.has(g.slug)) throw new Error(`${where}: two groups share the slug "${g.slug}"`);
    seen.add(g.slug);
  });
}

/**
 * Result codes must not be interchangeable between quizzes. A code prefix is what keeps
 * them apart, so prefixes must be unique, and at most one quiz may go without one — the
 * Compass, whose permalinks predate the prefix and are the only copy of a reader's result.
 */
function validateCodePrefixes(quizzes: Quiz[]): void {
  const seen = new Map<string, string>();
  const bare: string[] = [];
  quizzes.forEach(q => {
    const p = q.codePrefix?.toUpperCase() ?? '';
    if (!p) { bare.push(q.slug); return; }
    const prior = seen.get(p);
    if (prior) throw new Error(`quizzes "${prior}" and "${q.slug}" share the code prefix "${p}"`);
    seen.set(p, q.slug);
  });
  if (bare.length > 1) {
    throw new Error(
      `these quizzes have no code prefix: ${bare.join(', ')}. Only one may go without, ` +
      'or their result codes become interchangeable and a wrong URL invents a result.'
    );
  }
}

/**
 * An outcome page lives at /<base>/<slug>/, where the base belongs to the quiz. Two quizzes
 * that share a base must not share a slug, or one would overwrite the other's page; two
 * quizzes with different bases may both have a "john" without colliding.
 */
function validateOutcomeSlugs(quizzes: Quiz[]): void {
  const owner = new Map<string, string>();
  quizzes.forEach(q => {
    const base = outcomePathBase(q);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base)) {
      throw new Error(`quiz "${q.slug}" has an unusable outcome path base ${JSON.stringify(base)}`);
    }
    const seen = new Set<string>();
    q.outcomes.forEach(o => {
      if (!o.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.slug)) {
        throw new Error(`quiz "${q.slug}": outcome "${o.name}" has an unusable slug ${JSON.stringify(o.slug)}`);
      }
      if (seen.has(o.slug)) {
        throw new Error(`quiz "${q.slug}": two outcomes share the slug "${o.slug}"`);
      }
      seen.add(o.slug);

      const path = `${base}/${o.slug}`;
      const prior = owner.get(path);
      if (prior && prior !== q.slug) {
        throw new Error(
          `outcome slug "${o.slug}" is claimed by both "${prior}" and "${q.slug}" — ` +
          `one would overwrite the other at /${path}/`
        );
      }
      owner.set(path, q.slug);
    });
  });
}

/**
 * A bipolar quiz matches a reader to its outcomes by distance, so every outcome needs a
 * position of the right width. A missing coordinate would be read as 50 and the figure
 * would be quietly placed at the centre of an axis nobody argued about.
 */
function validateOutcomePositions(quiz: Quiz): void {
  if (quiz.strategy.shape !== 'bipolar') return;
  quiz.outcomes.forEach(o => {
    if (!Array.isArray(o.position) || o.position.length !== quiz.groups.length) {
      throw new Error(
        `quiz "${quiz.slug}": outcome "${o.slug}" has ${o.position?.length ?? 0} coordinates ` +
        `for ${quiz.groups.length} groups`
      );
    }
    o.position.forEach((v, i) => {
      if (!Number.isFinite(v) || v < 0 || v > 100) {
        throw new Error(`quiz "${quiz.slug}": outcome "${o.slug}" has ${v} on group ${i}`);
      }
    });
  });
}

QUIZZES.forEach(validate);
QUIZZES.forEach(validateOutcomePositions);
validateOutcomeSlugs(QUIZZES);
validateCodePrefixes(QUIZZES);

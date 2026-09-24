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
import { whichPsalm } from '../quizzes/which-psalm';
import { whichEarlyChristian } from '../quizzes/which-early-christian';
import { personality } from '../quizzes/personality';

/*
 * The order is the order the menus, /quizzes/, /me/ and "Keep going" (NextUp, which offers the
 * first few) list them in. The Christian Personality Test, the newest, stands second, straight
 * after the flagship, as it leads the home page's rail: at the end of the list it would rarely
 * be offered under a finished result.
 */
export const QUIZZES: Quiz[] = [
  theologyCompass, personality, sevenDeadlySins, bibleFigure, spiritualGifts, whichPsalm, whichEarlyChristian
];

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
  // A reading asks its own questions and names one situation; it has no statements to key
  // and no groups to rank, and its rules are checked by the engine test instead.
  if (quiz.strategy.shape === 'reading') {
    if (quiz.items.length || quiz.groups.length) throw new Error(`${where}: a reading carries no items or groups`);
    if (!quiz.outcomes.length) throw new Error(`${where}: a reading needs the psalms it can print as outcomes`);
    return;
  }
  // A personality portrait asks its own 72 questions on its own runner and carries its answers in
  // its own code (strategies/personality.ts), so it has no items or groups in the engine's sense.
  // What must hold is the eight types and the prefix its codes are bound by; the questions, the
  // scoring and the codes are checked by the data build and the engine test.
  if (quiz.strategy.shape === 'personality') {
    if (quiz.items.length || quiz.groups.length) throw new Error(`${where}: a personality portrait carries no items or groups`);
    if (quiz.outcomes.length !== 8) throw new Error(`${where}: a personality portrait names eight types, not ${quiz.outcomes.length}`);
    if (quiz.codePrefix !== 'PQ') throw new Error(`${where}: personality codes are bound by the prefix PQ, not ${quiz.codePrefix}`);
    return;
  }
  // Kindred spirits compare each statement on its own with what each person held: one statement
  // per group, a value that is the answer itself, so there is nothing to key both ways and no sum
  // for a radix to follow from. What must hold instead is that every statement is its own group,
  // in order, and that the code carries one base-5 digit for each. The people's positions and
  // lines are checked by the build script and the engine test.
  if (quiz.strategy.shape === 'kindred') {
    if (!quiz.items.length || quiz.items.length !== quiz.groups.length) {
      throw new Error(`${where}: kindred spirits need one statement per group`);
    }
    quiz.items.forEach((item, i) => {
      if (item.group !== i) throw new Error(`${where}: statement ${item.n} is not group ${i}`);
    });
    if (quiz.config.radix !== 5) throw new Error(`${where}: kindred spirits code five answers, not radix ${quiz.config.radix}`);
    if (quiz.groups.some(g => g.left || g.right || g.bands)) {
      throw new Error(`${where}: a kindred spirits question carries no poles or bands`);
    }
    if (!quiz.outcomes.length) throw new Error(`${where}: kindred spirits need the people they can name`);
    const seen = new Set<string>();
    quiz.groups.forEach(g => {
      if (!g.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(g.slug) || seen.has(g.slug)) {
        throw new Error(`${where}: question "${g.key}" has an unusable or repeated slug ${JSON.stringify(g.slug)}`);
      }
      seen.add(g.slug);
    });
    return;
  }
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

/**
 * An outcome that declares an evidence mask must still be matchable.
 *
 * The mask exists so that a coordinate nobody argued for is not counted against a reader.
 * Taken far enough that leaves an outcome measured on one or two axes, which is worse than
 * the problem it fixes: a figure placed by two verses would be named as somebody's closest
 * on the strength of two verses. The floor is four of six by default, and a quiz may raise
 * it. A figure that cannot clear it is repaired from the text or taken off the roster —
 * never quietly kept and never silently hidden, because both leave a page on the site
 * claiming a result the arithmetic will not give.
 */
function validateOutcomeMasks(quiz: Quiz): void {
  if (quiz.strategy.shape !== 'bipolar') return;
  const floor = quiz.config.minShownAxes ?? 4;
  quiz.outcomes.forEach(o => {
    if (!o.mask) return;
    if (o.mask.length !== quiz.groups.length) {
      throw new Error(
        `quiz "${quiz.slug}": outcome "${o.slug}" has a ${o.mask.length}-axis mask ` +
        `for ${quiz.groups.length} groups`
      );
    }
    const shown = o.mask.filter(m => m === 'shown').length;
    if (shown < floor) {
      throw new Error(
        `quiz "${quiz.slug}": outcome "${o.slug}" is placed on only ${shown} of ` +
        `${quiz.groups.length} axes (floor ${floor}). Add evidence that is really in the ` +
        'source, or take the outcome off the list.'
      );
    }
  });
}

QUIZZES.forEach(validate);
QUIZZES.forEach(validateOutcomePositions);
QUIZZES.forEach(validateOutcomeMasks);
validateOutcomeSlugs(QUIZZES);
validateCodePrefixes(QUIZZES);

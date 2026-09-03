/**
 * The quiz registry. Adding a quiz means adding one import and one array entry —
 * every route, the codec, the result page and the share card pick it up from here.
 */
import type { Outcome, Quiz, QuizGroup, Sheet } from './types';
import { theologyCompass } from '../quizzes/theology-compass';
import { sevenDeadlySins } from '../quizzes/seven-deadly-sins';

export const QUIZZES: Quiz[] = [theologyCompass, sevenDeadlySins];

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
 * URLs are built HERE and nowhere else.
 *
 * A group carries both a `key` (its identity in the audited source) and a `slug` (its
 * identity in a URL), and on the Compass they differ: the axis keyed `spirit` is published
 * at /axis/theology-compass/gifts/, and `tradition` at .../authority/. Any page that
 * reached for `key` would 404 on two of six axes. These helpers make that mistake
 * unavailable rather than merely discouraged.
 */
export const quizHref = (quiz: Quiz) => `/q/${quiz.slug}/`;
export const groupHref = (quiz: Quiz, group: QuizGroup) => `/axis/${quiz.slug}/${group.slug}/`;
export const resultHref = (quiz: Quiz, code: string) => `/r/${quiz.slug}/${code}/`;
/** Outcome pages are not namespaced by quiz yet; validate() enforces that they can't collide. */
export const outcomeHref = (outcome: Outcome) => `/tradition/${outcome.slug}/`;

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
 * Outcome pages live at a site-wide /tradition/<slug>/, so a slug reused by a second quiz
 * would overwrite the first quiz's page. Checked across the whole registry, not per quiz.
 */
function validateOutcomeSlugs(quizzes: Quiz[]): void {
  const owner = new Map<string, string>();
  quizzes.forEach(q =>
    q.outcomes.forEach(o => {
      const prior = owner.get(o.slug);
      if (prior && prior !== q.slug) {
        throw new Error(
          `outcome slug "${o.slug}" is claimed by both "${prior}" and "${q.slug}" — ` +
          'one would overwrite the other at /tradition/<slug>/'
        );
      }
      owner.set(o.slug, q.slug);
    })
  );
}

QUIZZES.forEach(validate);
validateOutcomeSlugs(QUIZZES);

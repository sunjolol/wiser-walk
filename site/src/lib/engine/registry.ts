/**
 * The quiz registry. Adding a quiz means adding one import and one array entry —
 * every route, the codec, the result page and the share card pick it up from here.
 */
import type { Quiz, Sheet } from './types';
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
}

QUIZZES.forEach(validate);

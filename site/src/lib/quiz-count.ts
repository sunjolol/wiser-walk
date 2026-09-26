/**
 * What a quiz card counts beside its minutes: the questions a reader will actually answer.
 *
 * The owner, 2026-09-25: "most people judge whether to take a test by the number of
 * questions", and counts of what a quiz can name ("22 early Christians", "53 situations",
 * "25 figures") read as a bigger job than it is and can scare a reader off. One rule, used by
 * every card that counts (home, /quizzes/, /me/, next-up rooms, and the way-in cards on the
 * reference pages), so no two cards for one quiz ever disagree.
 *
 * The statement quizzes count their statements. The Christian Personality Test and the Psalm
 * quiz run their own questions, outside `items`: the test its 72, the Psalm quiz its core
 * questions (a follow-up is asked only when an answer needs one, as its start box says).
 */
import type { Quiz } from './engine/types';
import { READING } from './strategies/reading';
import { ITEMS as PERSONALITY_ITEMS } from './strategies/personality';

export const countFact = (q: Quiz): string =>
  q.strategy.shape === 'reading'
    ? `${READING.core.length} questions`
    : q.strategy.shape === 'personality'
      ? `${PERSONALITY_ITEMS.length} questions`
      : `${q.items.length} statements`;

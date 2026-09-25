/**
 * URLs are built HERE and nowhere else.
 *
 * This used to live in registry.ts, and for pages it still does: registry.ts re-exports
 * every function below, so nothing that imports its URLs from the registry changes. It was
 * split out because a QUIZ needs to build a URL too — the spiritual-gifts draft links to
 * the Compass's Gifts axis — and a quiz importing the registry that imports the quiz is a
 * cycle whose symptom is an undefined function at module-init time, i.e. a link that reads
 * "undefined" only in the built output.
 *
 * A group carries both a `key` (its identity in the audited source) and a `slug` (its
 * identity in a URL), and on the Compass they differ: the axis keyed `spirit` is published
 * at /axis/theology-compass/gifts/, and `tradition` at .../authority/. Any page that
 * reached for `key` would 404 on two of six axes. These helpers make that mistake
 * unavailable rather than merely discouraged.
 */
import type { Outcome, Quiz, QuizGroup } from './types';
import { outcomePathBase } from './types';
import { hasMoved } from '../saints/moved';

export const quizHref = (quiz: Quiz) => `/q/${quiz.slug}/`;
export const groupHref = (quiz: Quiz, group: QuizGroup) => `/axis/${quiz.slug}/${group.slug}/`;
export const resultHref = (quiz: Quiz, code: string) => `/r/${quiz.slug}/${code}/`;

/**
 * An outcome's own page. The SEGMENT belongs to the quiz, not to the site: the Compass's
 * outcomes are traditions and publish at /tradition/<slug>/, and the figure quiz's are
 * people and publish at /figure/<slug>/. A quiz that says nothing keeps /tradition/, so
 * every Compass URL is the one it has always been.
 *
 * The registry's validateOutcomeSlugs() enforces that two quizzes sharing a base cannot
 * share a slug.
 */
export const outcomeHref = (quiz: Quiz, outcome: Outcome) =>
  quiz.slug === 'which-early-christian' && hasMoved(outcome.slug)
    ? `/saints/${outcome.slug}/` // his page is in the Saints hub now (lib/saints/moved.ts)
    : `/${outcomePathBase(quiz)}/${outcome.slug}/`;

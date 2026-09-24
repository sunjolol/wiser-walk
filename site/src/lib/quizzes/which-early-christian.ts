/**
 * Which early Christian thinks like you? And which would argue with you?
 *
 * Quiz #4, and the first on the fourth result shape (see strategies/kindred.ts). The reader
 * agrees or disagrees with 23 real positions early Christians held, put in plain words with no
 * names, and meets two people from the early Church at the end: the one whose recorded positions
 * sit nearest, and the one who would argue, each with the real line that shows why. Nearest by
 * position, never a percentage.
 *
 * The statements, every person's positions and the lines that prove them are data, generated
 * from design/quiz-ideas/fathers/ (see scripts/build-early-christian-data.mjs). This file only
 * names the quiz. The owner played the draft-4 tap-through and approved it ("Love this! ...
 * change nothing else"); every line it shows was checked against its source before it went
 * live (design/quiz-ideas/fathers/VERIFY.md).
 *
 * ONE STATEMENT PER GROUP. The engine's contract is a value from 0 to 100 per group, and here a
 * group is one of the 23 questions: its key is the statement's id ('war'), its slug the question
 * page's (/early-church-on/war/), its name the topic. So the codec, the runner and the result
 * link stay generic: the value is the answer, (answer + 2) x 25, one base-5 digit in the code.
 * Nothing is keyed both ways, because nothing is summed along a group: the registry's kindred
 * branch checks this shape instead.
 *
 * The outcomes are the 22 people, each with a page at /early-christian/<slug>/.
 */
import type { Outcome, Quiz, QuizGroup, QuizItem } from '../engine/types';
import { kindred, PEOPLE, PEOPLE_KEYS, STATEMENTS } from '../strategies/kindred';

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const groups: QuizGroup[] = STATEMENTS.map(s => ({ key: s.id, slug: s.slug, name: capital(s.topic) }));

const items: QuizItem[] = STATEMENTS.map((s, i) => ({ n: i + 1, text: s.text, group: i, direction: 1 }));

const outcomes: Outcome[] = PEOPLE_KEYS.map(k => ({ name: PEOPLE[k]!.name, slug: PEOPLE[k]!.slug, who: PEOPLE[k]!.who }));

export const whichEarlyChristian: Quiz = {
  slug: 'which-early-christian',
  // "And which would argue with you?" is printed directly under the title on the quiz's start
  // page (the owner's ruling, 2026-09-23). The home and /quizzes/ cards show the title alone
  // (the owner, 2026-09-23, later): no card on a picture carries a line under its title.
  title: 'Which early Christian thinks like you?',
  tagline: 'And which would argue with you?',
  // A search result's words: 160 characters at most (scripts/seo-test.mjs).
  description:
    'Agree or disagree with 23 opinions real early Christians held. Then meet the one who ' +
    'thinks most like you, and the one who would argue with you.',
  // The approved preview's own words, on the start page.
  intro:
    '23 opinions about money, anger, grief, God and more. Agree or disagree with each one. At the ' +
    'end you meet two people from the early Church: the one who thinks most like you, and the one ' +
    'who would argue.',
  icon: 'users',
  minutes: 4,
  status: 'live',
  items,
  groups,
  outcomes,
  strategy: kindred,
  // One base-5 digit per statement: strongly disagree, disagree, not sure, agree, strongly agree.
  config: { radix: 5 },
  shareTitle: 'My kindred spirit in the early Church',
  codePrefix: 'EC',
  // Thirteen characters is too long to send comfortably, so the reader is handed six.
  shortLinks: true,
  groupNoun: 'question',
  groupNounPlural: 'questions',
  outcomeNoun: 'early Christian',
  outcomeNounPlural: 'early Christians',
  outcomePathBase: 'early-christian',
  // The engine's default speaks of traditions and their adherents, which is false here.
  outcomeScopeNote:
    'Each person is compared with you only on the questions they are on record on. ' +
    'Nearest by position, never by a percentage.',
  hideOutcomeScore: true,
  // A page for two people's results side by side is a later idea (the brief, 2026-09-23).
  comparable: false
};

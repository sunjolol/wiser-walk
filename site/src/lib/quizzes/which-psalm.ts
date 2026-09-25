/**
 * Which Psalm are you living right now?
 *
 * The owner's favourite of the ten ideas put to him on 2026-09-23, and the first quiz on the
 * third result shape (see strategies/reading.ts). Every result is one situation St Athanasius
 * of Alexandria named in his Letter to Marcellinus (4th century), read in his Greek, and his
 * advice for it is a psalm, printed in full on the result page from the Berean Standard Bible.
 * Where his letter names no psalm for what someone is going through (a death, an illness, a
 * decision), the quiz says so and gives the psalm he named for what it is doing to them.
 *
 * The questions, the situations and the rules are data (src/data/which-psalm.json, generated
 * from design/quiz-ideas/psalm/). This file only names the quiz. The owner played the
 * tap-through and said it was "phenomenal and very powerful" and ready to ship once the
 * follow-up questions sat straight after the question that calls for them (2026-09-23).
 *
 * No items and no groups: nothing here is agreed or disagreed with, and nothing is ranked.
 * The outcomes are the psalms a result can print, each with its own page at /psalm/<n>/.
 */
import type { Outcome, Quiz } from '../engine/types';
import { reading, READING } from '../strategies/reading';

const numbers = new Set<number>();
for (const o of Object.values(READING.outcomes)) {
  numbers.add(o.psalm);
  (o.set ?? []).forEach(n => numbers.add(n));
  o.also.forEach(n => numbers.add(parseInt(String(n), 10)));
}

const outcomes: Outcome[] = [...numbers]
  .sort((a, b) => a - b)
  .map(n => ({ name: `Psalm ${n}`, slug: String(n) }));

export const whichPsalm: Quiz = {
  slug: 'which-psalm',
  title: 'Which Psalm are you living right now?',
  tagline: 'A few honest taps about your life right now, and the psalm an early Church Father gave for exactly that.',
  menu: 'The psalm St Athanasius gave for where you are.',
  description:
    'Answer a few honest questions about your life right now. Then read the psalm St Athanasius ' +
    'gave for exactly that in the 300s, and why he gave it.',
  intro:
    'A few quick, honest taps about your life right now. Then read the psalm an early Church ' +
    'Father gave for exactly that, and why he gave it.',
  icon: 'book',
  minutes: 3,
  status: 'live',
  items: [],
  groups: [],
  outcomes,
  strategy: reading,
  config: {},
  shareTitle: 'The Psalm I’m living right now',
  codePrefix: 'PS',
  outcomeNoun: 'psalm',
  outcomeNounPlural: 'psalms',
  outcomePathBase: 'psalm',
  hideOutcomeScore: true,
  comparable: false
};

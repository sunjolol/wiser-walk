/**
 * The Christian Personality Test.
 *
 * Quiz #1 of the owner's build order, and the first on the fifth result shape (see
 * strategies/personality.ts). Seventy-two quick choices, drawn from St Gregory the Great's
 * Pastoral Rule (Book III) and Moralia, then a ten-page portrait: one of eight types, the
 * leanings around it, what the reader might not have noticed, how their anger works, how they
 * speak, how to help them, where the fight is for them now (a private page, only on the device
 * that took it), their best quality and its counterfeit, and their line in the Body (St John
 * Cassian). The owner took the tap-through preview and said "it's ready, push it live"
 * (2026-09-24).
 *
 * The name is his ruling of 2026-09-24: "Christian Personality Test", everywhere a reader sees
 * it. The address stays /q/personality/ ("keep the url we have, it's simple and works").
 *
 * Everything the questions and the scoring need is data generated from
 * design/quiz-ideas/personality/ (items.mjs, results.mjs, score.mjs) by
 * scripts/build-personality-data.mjs. This file only names the test. It has no items or groups
 * in the engine's sense: the test runs on its own runner, and its code carries its own answers.
 *
 * The outcomes are the eight types, keyed as the design keys them. Each has its own page at
 * /personality-type/<key>/, with all eight at /personality-type/ (pages/personality-type/).
 */
import type { Outcome, Quiz } from '../engine/types';
import { personality as strategy, TYPES, TYPE_KEYS } from '../strategies/personality';

const outcomes: Outcome[] = TYPE_KEYS.map(k => ({ name: TYPES[k]!.name, slug: k, who: TYPES[k]!.tagline }));

export const personality: Quiz = {
  slug: 'personality',
  title: 'Christian Personality Test',
  // The approved preview's lede, cut to its second half for the places a quiz shows one line.
  tagline: 'A ten-page portrait of who you are, what trips you up, and where you fit.',
  menu: 'Your type, what trips you up, and where you fit.',
  // A search result's words: 160 characters at most (scripts/seo-test.mjs).
  description:
    'A free Christian personality test: 72 quick choices, then a ten-page portrait of who you are, ' +
    'built on St Gregory the Great and the desert fathers.',
  // The approved preview's own words, on the start page.
  intro:
    'Seventy-two quick choices. Then a ten-page portrait of who you are, what trips you up, and where you fit.',
  icon: 'sparkle',
  minutes: 15,
  status: 'live',
  items: [],
  groups: [],
  outcomes,
  strategy,
  config: {},
  shareTitle: 'Christian Personality Test',
  codePrefix: 'PQ',
  // Thirty-eight characters is far too long to send, so the reader is handed six.
  shortLinks: true,
  outcomeNoun: 'type',
  outcomeNounPlural: 'types',
  outcomePathBase: 'personality-type',
  // Eight types, and nothing on the page is a number against a person.
  hideOutcomeScore: true,
  // Two people's portraits side by side is not something this test offers.
  comparable: false
};

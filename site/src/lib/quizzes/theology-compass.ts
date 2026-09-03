/**
 * The Theology Compass as data on the generic engine.
 *
 * Everything substantive comes from src/data/compass.json, which is generated from
 * the audited source by scripts/build-data.mjs. Never hand-edit that file — change
 * audit/compass-data.revised.json and rerun `npm run data`.
 */
import data from '../../data/compass.json';
import { bipolar } from '../strategies/bipolar';
import type { Quiz, QuizGroup, QuizItem, Outcome } from '../engine/types';

/**
 * Axis emoji live here rather than in the audited data: they are presentation, not
 * doctrine. Keyed by axis key so reordering the axes upstream cannot mis-assign them.
 */
const EMOJI: Record<string, string> = {
  grace: '⚖️',
  table: '🍞',
  spirit: '🔥',
  kingdom: '👑',
  tradition: '📜',
  worship: '🎵'
};

const groups: QuizGroup[] = data.axes.map(a => ({
  key: a.key,
  slug: a.slug,
  name: a.name,
  emoji: EMOJI[a.key],
  left: a.left,
  right: a.right,
  bands: a.bands,
  summary: a.summary,
  history: a.history,
  passages: a.passages,
  readMore: a.readMore
}));

const items: QuizItem[] = data.statements.map(s => ({
  n: s.n,
  text: s.text,
  group: s.axisIndex,
  direction: s.direction as 1 | -1
}));

const outcomes: Outcome[] = data.traditions.map(t => ({
  name: t.name,
  slug: t.slug,
  position: t.position
}));

export const theologyCompass: Quiz = {
  slug: 'theology-compass',
  title: 'Theology Compass',
  tagline: 'Place yourself on six axes of Christian belief.',
  description:
    'Eighteen statements place you on six axes of Christian belief, then show which ' +
    'traditions sit nearest. Every position is described in words its own holders ' +
    'would accept, and the whole instrument has been through an adversarial fairness audit.',
  emoji: '🧭',
  minutes: 3,
  status: 'live',
  items,
  groups,
  outcomes,
  strategy: bipolar,
  config: {
    radix: data.scoring.radix,
    maxDistance: data.scoring.maxDistance,
    tieUnits: data.scoring.tieUnits,
    hedgeUnits: data.scoring.hedgeUnits,
    centerUnits: data.scoring.centerUnits
  },
  shareTitle: 'My Theology Compass'
};

// The audit's answer sheets deliberately live in src/data/compass-audit.json, not here:
// this module is bundled into the browser for the quiz runner, and they are build-time
// only. Pages that need them import that file directly.

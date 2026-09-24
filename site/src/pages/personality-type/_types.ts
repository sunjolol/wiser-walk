/**
 * What the Christian Personality Test's type pages share: /personality-type/ and
 * /personality-type/<key>/.
 *
 * These are the test's reference floor. Someone who searched "Christian personality types" or
 * met a type on a friend's result lands here, so each page says what the type is before it
 * offers the test. Every word is the test's own: src/data/personality.json, generated from
 * design/quiz-ideas/personality/results.mjs, which the owner approved in the report. This file
 * picks the words a type page prints and composes them exactly as the report's page 2 does
 * (components/PersonalityResult.astro). It writes no claim of its own.
 *
 * A type page is the same for everyone, so it prints only what belongs to the type: nothing a
 * person answered, no leanings, anger, speech, help card, private page, virtue or line, and no
 * count of how many people have the type.
 *
 * SERVER ONLY. It imports the report's words, about 90 KB. Pages import it in their front
 * matter; a <script> must never import it. The underscore keeps Astro from treating this file
 * as a route.
 */
import full from '../../data/personality.json';
import { TYPE_KEYS } from '../../lib/strategies/personality';
import { focusOf, typeHref } from '../../lib/personality-art';

export interface Quote { q: string; cite: string }
export interface Kin { who: string; img: string; text: string; src: string; partial?: boolean }
export interface FullType {
  name: string; tagline: string; portrait: string; ink: string; art: string;
  disposition: string; makeup: string; opposite: string;
  kindred: Kin[]; kindredNote?: string; gregoryLine?: Quote;
}
export interface Disposition {
  word: string; trapWho: string;
  trap: { name: string; quote: Quote; plain: string };
  bring: string[]; cost: string[]; trapCost: string;
  grace: { text: string; quote: Quote };
}
export interface Makeup { word: string; bring: string; cost: string; text: string; quote: Quote }
export interface Opposites {
  people: Record<string, { who: string; img: string }>;
  story: string; src?: string; quote?: Quote;
}
export interface Credit { key: string; line: string; page: string; files: string[] }
interface Report {
  TYPES: Record<string, FullType>;
  DISPOSITIONS: Record<string, Disposition>;
  MAKEUPS: Record<string, Makeup>;
  OPPOSITES: Record<string, Opposites>;
  BOATS: { body: Quote };
  TRAP_LEAD: string;
  CREDITS: Credit[];
  PICTURES: Record<string, { width: number; height: number }>;
}

export const R = full as unknown as Report;

/** The eight in the design's order: two by two, each temper quiet and then restless. */
export const ORDER: string[] = TYPE_KEYS;

export const typeOf = (key: string): FullType => {
  const t = R.TYPES[key];
  if (!t) throw new Error(`personality types: no type ${key}`);
  return t;
};
export const dispositionOf = (t: FullType) => R.DISPOSITIONS[t.disposition]!;
export const makeupOf = (t: FullType) => R.MAKEUPS[t.makeup]!;

export { focusOf, typeHref };

/** "Cheerful · Quiet": the type's two words, as the result page's grid prints them. */
export const wordsOf = (t: FullType) => `${dispositionOf(t).word} · ${makeupOf(t).word}`;

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ---------------------------------------------------------------- pictures */

export type Pic = { src: string; width: number; height: number };

/**
 * A picture by its path under /img/personality/, with its size, and noted as shown so the page's
 * credits name it. Each page makes its own `shown` set.
 */
export const picturer = (shown: Set<string>) => (file: string): Pic | null => {
  const src = `/img/personality/${file}`;
  const size = R.PICTURES[src];
  if (!size) return null;
  shown.add(file);
  return { src, width: size.width, height: size.height };
};

/** The credits for the pictures a page shows, in the data's order. */
export const creditsFor = (shown: Set<string>): Credit[] =>
  R.CREDITS.filter(c => c.files.some(f => shown.has(f)));

/**
 * A painting's own credit, for the small line under a band: its title, painter and date, without
 * the licence ("The Wedding Dance, Pieter Bruegel the Elder, c. 1566"). The whole line prints in
 * the credits at the foot.
 */
export const paintingOf = (t: FullType): string => {
  const c = R.CREDITS.find(x => x.files.includes(`art/${t.art}.jpg`));
  return c ? c.line.split('. Wikimedia Commons')[0]! : '';
};

/* ---------------------------------------------------------------- the words, as page 2 composes them */

/** What the type brings: the temper's, then the mind's. */
export const bringsOf = (t: FullType): string[] => [...dispositionOf(t).bring, makeupOf(t).bring];

/** What it costs: the temper's, its trap's cost, then the mind's. */
export const costsOf = (t: FullType): string[] =>
  [...dispositionOf(t).cost, dispositionOf(t).trapCost, makeupOf(t).cost];

/**
 * Gregory's trap sentence, naming all four tempers with this one's last, as page 2 prints it
 * (the owner preferred the whole of Gregory's list).
 */
export const trapLeadOf = (t: FullType): string => {
  const own = t.disposition;
  const order = Object.keys(R.DISPOSITIONS).filter(k => k !== own).concat([own]);
  return R.TRAP_LEAD + ' ' + order.map((k, i) => {
    const d = R.DISPOSITIONS[k]!;
    return 'For ' + d.trapWho + (i === order.length - 1 ? ', it’s ' : ' it’s ') + d.trap.name + '.';
  }).join(' ');
};

/**
 * A type and its opposite: the two real people who were opposites (Barnabas and Paul, Martha
 * and Mary...), their story, and the line that goes with it, or the desert fathers' line where a
 * pair has none of its own (page 2 does the same).
 */
export const oppositeOf = (key: string) => {
  const t = typeOf(key);
  const pair = R.OPPOSITES[[key, t.opposite].sort().join('-')] ?? null;
  return {
    key: t.opposite,
    o: typeOf(t.opposite),
    pair,
    mine: pair?.people[key] ?? null,
    them: pair?.people[t.opposite] ?? null,
    quote: pair?.quote ?? R.BOATS.body
  };
};

/** The words the start page uses for Gregory's two sortings (PersonalityRunner.astro, typesLead). */
export const sortingLead = (): string => {
  const orList = (xs: string[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} or ${xs[xs.length - 1]}` : xs.join(''));
  const tempers = Object.values(R.DISPOSITIONS).map(d => d.word.toLowerCase());
  const minds = Object.values(R.MAKEUPS).map(m => m.word.toLowerCase());
  return [
    'St Gregory the Great sorted people twice.',
    `Once by temper: ${orList(tempers)}.`,
    `Once by mind: ${orList(minds)}.`,
    'The eight types are the two together.'
  ].join(' ');
};

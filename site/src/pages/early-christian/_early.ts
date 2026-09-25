/**
 * What the early Christians' pages share: /early-christian/<slug>/ (until each moves to /saints/),
 * /early-church-on/ and /early-church-on/<topic>/. The list of everyone that was /early-christian/
 * is the Saints hub now (/saints/, 2026-09-25); the old address redirects there.
 *
 * These are the search pages of "Which early Christian thinks like you?". Someone who types
 * "what did Augustine believe" or "what did the early Christians say about war" lands here
 * without ever having heard of the quiz, so every page answers its own title first and offers
 * the quiz last. Every line, work, recorder, date and story is the quiz's own data
 * (src/data/which-early-christian.json, generated from design/quiz-ideas/fathers/ and checked
 * against its sources in VERIFY.md). This file arranges it and writes no claim of its own.
 *
 * SERVER ONLY. It imports the full content file, about 88 KB of lines. Pages import it in their
 * front matter, where it is read at build time; a <script> must never import it (see
 * strategies/kindred.ts, "THE DATA").
 *
 * The underscore keeps Astro from treating this file as a route.
 */
import full from '../../data/which-early-christian.json';
import type { EarlyChristian, KindredData, KindredLine, KindredStatement } from '../../lib/strategies/kindred';
import { hasMoved } from '../../lib/saints/moved';

export const EC = full as unknown as KindredData;

/** The 23 statements, in play order, which is the order the result code stores them in. */
export const STATEMENTS: KindredStatement[] = EC.statements;

/** Everyone, oldest first, as the Saints hub lists them. */
export const OLDEST_FIRST: string[] = EC.oldestFirst;

export const personOf = (key: string): EarlyChristian => {
  const p = EC.people[key];
  if (!p) throw new Error(`early Christians: no person ${key}`);
  return p;
};

/** A person's page: in the Saints hub once his full page is written (lib/saints/moved.ts). */
export const personHref = (p: Pick<EarlyChristian, 'slug'>) =>
  hasMoved(p.slug) ? `/saints/${p.slug}/` : `/early-christian/${p.slug}/`;
export const questionHref = (s: Pick<KindredStatement, 'slug'>) => `/early-church-on/${s.slug}/`;

/** "he" or "she", and "his" or "hers", so no page has to guess. Macrina is the one "she". */
export const he = (p: Pick<EarlyChristian, 'she'>) => (p.she ? 'she' : 'he');
export const hers = (p: Pick<EarlyChristian, 'she'>) => (p.she ? 'hers' : 'his');

/** A topic at the start of a line: "Laughter", "The poor". */
export const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Where a line comes from, as the result page prints it: the work, who recorded it where the
 * person did not write it down, and "Our translation" where the words are ours.
 */
export const sourceOf = (c: KindredLine) =>
  `${c.work}${c.by ? `, ${c.by}` : ''}${c.own ? '. Our translation' : ''}`;

/** What stands in for a line that is on record but not shown: "On record in City of God." */
export const onRecord = (c: KindredLine) => `On record in ${c.work}${c.by ? `, ${c.by}` : ''}.`;

/**
 * Where each portrait's face is, for a crop that is taller than the picture. Most portraits are
 * tall and the face is near the top, which the default keeps. Three are wide: Caravaggio's
 * Jerome writes at the right of his table (the left is the skull), Boethius teaches in the
 * middle of a manuscript initial, and the Lactantius mural is a head and shoulders.
 */
const FACE: Record<string, string> = {
  jerome: '82% 40%',
  boethius: '50% 42%',
  lactantius: '46% 34%'
};
export const faceOf = (key: string) => FACE[key] ?? '50% 12%';

/**
 * What a portrait shows, for its alt text: its credit without the licence and the
 * photographer ("Fresco of Augustine, the oldest known portrait of him, c. 550-600"). The whole
 * credit still prints under the picture wherever the picture is the subject.
 */
export const pictureOf = (p: Pick<EarlyChristian, 'portrait'>) =>
  p.portrait.credit.split('. Wikimedia Commons')[0]!.replace(/\. Photo by [^.]*$/, '');

/**
 * THE QUESTION PAGES' TITLES. Each is the question a person would type, answered by the page
 * it heads: "What did the early Christians say about war?". Most follow that one pattern; three
 * read more naturally as their own question, and those are the ones people ask that way ("did
 * the early Christians believe everyone would be saved", "how did the early Christians read the
 * Bible"). The noun is chosen for search where the quiz's topic word is its own ("pagan
 * wisdom" rather than "learning from outsiders"), and never claims more than the statement.
 *
 * Every title stays inside 65 characters (scripts/seo-test.mjs). A statement added to the quiz
 * without a title here fails the build.
 */
const ABOUT = (x: string): [string, string] => [`What did the early Christians say about ${x}?`, x];
/** Each title, and the words in it the band sets in its second ink. */
const TITLES: Record<string, [string, string]> = {
  laugh: ABOUT('laughter'),
  quiet: ABOUT('silence'),
  learning: ABOUT('pagan wisdom'),
  anger: ABOUT('anger'),
  alone: ABOUT('solitude'),
  rich: ABOUT('being rich'),
  tell: ABOUT('correcting others'),
  tears: ABOUT('grief'),
  lie: ABOUT('lying'),
  surplus: ABOUT('the poor'),
  nature: ABOUT('nature'),
  calm: ABOUT('emotions'),
  body: ABOUT('the body'),
  dreams: ['Did the early Christians think God speaks through dreams?', 'dreams'],
  miracles: ABOUT('miracles'),
  mystery: ABOUT('the mystery of God'),
  deeper: ['How did the early Christians read the Bible?', 'the Bible'],
  calling: ABOUT('family and calling'),
  pure: ABOUT('church discipline'),
  war: ABOUT('war'),
  rulers: ABOUT('church and state'),
  effort: ABOUT('grace and effort'),
  all: ['Did the early Christians think everyone would be saved?', 'everyone']
};
const titled = (s: Pick<KindredStatement, 'id'>) => {
  const t = TITLES[s.id];
  if (!t) throw new Error(`/early-church-on/: no title for the statement ${s.id}`);
  return t;
};
export const titleOf = (s: Pick<KindredStatement, 'id'>) => titled(s)[0];
export const titleInkOf = (s: Pick<KindredStatement, 'id'>) => titled(s)[1];

/** One person's place on one statement, for a question page. */
export interface Stand {
  key: string;
  p: EarlyChristian;
  c: KindredLine;
}

/**
 * Who stood on each side of one statement, oldest first on both sides. A person with no record
 * on it is on neither side and is not listed: the quiz never guesses a position.
 */
export function sidesOf(id: string): { agree: Stand[]; disagree: Stand[] } {
  const agree: Stand[] = [], disagree: Stand[] = [];
  for (const key of OLDEST_FIRST) {
    const p = personOf(key);
    const c = p.cells[id];
    if (!c) continue;
    (c.v > 0 ? agree : disagree).push({ key, p, c });
  }
  return { agree, disagree };
}

/**
 * The few names a sentence can hold: the ones who held the side strongly first, then the rest,
 * each group oldest first, and "and 4 others" for whoever does not fit. Full names, because
 * three of the twenty-two are called Gregory.
 */
export function namesFor(side: Stand[], most = 2): string {
  const strong = side.filter(s => Math.abs(s.c.v) === 2);
  const rest = side.filter(s => Math.abs(s.c.v) !== 2);
  const order = [...strong, ...rest];
  const shown = order.slice(0, side.length === most + 1 ? most + 1 : most).map(s => s.p.name);
  const more = side.length - shown.length;
  if (!more) return shown.length > 1 ? `${shown.slice(0, -1).join(', ')} and ${shown.at(-1)}` : shown[0] ?? '';
  return `${shown.join(', ')} and ${more} ${more === 1 ? 'other' : 'others'}`;
}

/**
 * The band's answer to a question page's title, in plain short sentences, counted off the data:
 * who would say yes to the statement and who would say no. "Yes" and "no" are to the statement
 * as the quiz words it, which the page prints in full straight under the band.
 */
export function answerFor(id: string): string {
  const { agree, disagree } = sidesOf(id);
  const all = agree.length + disagree.length;
  if (!disagree.length) return `They agreed. All ${all} on record would say yes to the statement below.`;
  if (!agree.length) return `They agreed. All ${all} on record would say no to the statement below.`;
  const few = agree.length < disagree.length ? agree : disagree;
  const many = few === agree ? disagree : agree;
  const yes = few === agree ? 'no' : 'yes';
  if (few.length === 1) {
    return `Nearly all agreed. ${namesFor(many)} would say ${yes} to the statement below. ` +
      `Only ${few[0]!.p.name} would say ${yes === 'yes' ? 'no' : 'yes'}.`;
  }
  return `They did not agree. ${namesFor(agree)} would say yes to the statement below. ` +
    `${namesFor(disagree)} would say no.`;
}

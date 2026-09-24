/**
 * Mine: the reader's own result, found on this device, for a page that is not their result.
 *
 * The owner, 2026-09-23: when someone comes from a result, the in-depth pages (a tradition,
 * a figure, an axis, a psalm) should show "my answer against theirs, just like the main
 * results"; someone browsing without a result sees those pages exactly as they were. The
 * pages are static and the same for everyone, so the reader's part can only be drawn in the
 * browser, from what this device already holds:
 *
 *   ww:took:<slug>   sessionStorage. The result this tab has just finished: the runner writes
 *                    it on the way to the result page. It wins, because it is the one the
 *                    reader has just been looking at.
 *   ww.shelf.v1      localStorage. Every result finished on this device (lib/shelf.ts). The
 *                    newest one for the quiz is used when this tab finished nothing.
 *
 * A code is decoded here with the quiz's codec numbers (radix, slots, prefix), which the page
 * prints. Only engine/codec.ts and engine/links.ts are imported, and neither holds any data.
 * shelf.ts and the registry are NOT, and must not be: shelf.ts imports the registry, and the
 * registry is every quiz on the site, which is not for a phone to download to draw one marker.
 * The shelf's key is copied below for the same reason account/session.ts copies it.
 *
 * Same three rules as shelf.ts. Nothing throws: storage can be blocked, full, or hand-edited
 * to nonsense. Nothing is trusted: a code is used only if it decodes for this quiz. Nothing is
 * sent: it is the reader's device and nowhere else. Storage is an argument, so every function
 * can be tested against a fake.
 */
import { makeCodec } from './engine/codec';
import { publicCodeSync } from './engine/links';
import type { LinkQuiz } from './engine/links';

/** lib/shelf.ts's key, copied rather than imported (see above). */
export const SHELF_KEY = 'ww.shelf.v1';

/** The runner's tab-scoped note: pages/q/[quiz].astro and components/ReadingRunner.astro. */
export const TOOK_PREFIX = 'ww:took:';

/** The one method this file needs from a Storage. A fake with it is enough to test. */
export interface MineStore {
  getItem(key: string): string | null;
}

/** Where to look. Each is a getter, because touching localStorage can itself throw. */
export interface MineStores {
  session: () => MineStore | null;
  local: () => MineStore | null;
}

const BROWSER: MineStores = {
  session: () => (typeof sessionStorage === 'undefined' ? null : sessionStorage),
  local: () => (typeof localStorage === 'undefined' ? null : localStorage)
};

function read(get: () => MineStore | null, key: string): string | null {
  try {
    return get()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** One finished result: the code as the shelf spells it, and when it was finished. */
export interface Found {
  /** Canonical and upper case, exactly as the shelf and the result page's own view hold it. */
  code: string;
  at: Date;
}

/**
 * Turns a stored string into the canonical code, or null where this quiz cannot read it.
 * Every stored value passes through one of these before it is believed.
 */
export type Accept = (raw: string) => string | null;

/** This quiz's results on the shelf that `accept` believes, newest first. */
function shelfFor(quiz: string, accept: Accept, get: () => MineStore | null): Found[] {
  let data: unknown;
  try {
    data = JSON.parse(read(get, SHELF_KEY) ?? 'null');
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: Found[] = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const e = item as Record<string, unknown>;
    if (e.quiz !== quiz || typeof e.code !== 'string' || typeof e.at !== 'string') continue;
    const code = accept(e.code);
    const when = Date.parse(e.at);
    if (!code || !Number.isFinite(when)) continue;
    out.push({ code, at: new Date(when) });
  }
  return out.sort((a, b) => b.at.getTime() - a.at.getTime());
}

/**
 * The reader's latest result for one quiz, or null when this device holds none.
 *
 * The tab's own note first; its date is the shelf's entry for the same code, because the
 * runner writes both at once. Where the shelf could not be written (storage blocked, or full)
 * the note still stands, and it was finished just now.
 */
export function latestFor(
  quiz: string,
  accept: Accept,
  stores: MineStores = BROWSER,
  now: Date = new Date()
): Found | null {
  const shelf = shelfFor(quiz, accept, stores.local);
  const took = read(stores.session, TOOK_PREFIX + quiz);
  const code = took ? accept(took) : null;
  if (code) return { code, at: shelf.find(e => e.code === code)?.at ?? now };
  return shelf[0] ?? null;
}

/** What the page prints about its quiz's codes: the numbers makeCodec is built from. */
export interface CodecNumbers {
  radix: number;
  slots: number;
  prefix: string;
}

/** A result that decodes, with the scores it carries. */
export interface Mine extends Found {
  /** One 0..100 value per group, in the quiz's own order, as the result page reads them. */
  values: number[];
  /** Reachable positions per group, minus one: the rails' step count. */
  steps: number;
}

/**
 * The reader's latest result for a quiz scored on groups (every quiz but the Psalm quiz),
 * decoded, or null.
 *
 * A code is believed only if it decodes for this quiz. Both stores hold the canonical code
 * (the runner writes the code the codec made, never the shorter one a link shows), so that is
 * the only form accepted here.
 */
export function mineFor(
  quiz: string,
  numbers: CodecNumbers,
  stores: MineStores = BROWSER,
  now: Date = new Date()
): Mine | null {
  let codec: ReturnType<typeof makeCodec>;
  try {
    codec = makeCodec(numbers.radix, numbers.slots, numbers.prefix);
  } catch {
    return null;
  }
  const accept: Accept = raw => {
    const code = String(raw).trim().toUpperCase();
    return codec.decode(code) ? code : null;
  };
  const found = latestFor(quiz, accept, stores, now);
  const values = found ? codec.decode(found.code) : null;
  if (!found || !values) return null;
  return { ...found, values, steps: Math.max(1, numbers.radix - 1) };
}

/** Which reachable position a value is (0..steps): the integer the rails draw from. */
export const stepOf = (value: number, steps: number): number =>
  Math.max(0, Math.min(steps, Math.round((value * steps) / 100)));

/**
 * The day in words, the site's way round: "23 September". The year is added only when it
 * is not this year, because "23 September" from two years ago would read as this week.
 */
export function dayOf(at: Date, now: Date = new Date()): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
  if (at.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  try {
    return new Intl.DateTimeFormat('en-GB', opts).format(at);
  } catch {
    return at.toDateString();
  }
}

/**
 * The reader's result page, by the code a person sees (engine/links.ts): the shorter form
 * where the quiz has one without a network. A quiz with six-character links keeps the long
 * code here, which always opens the result, and its result page makes the short one itself.
 * `link` is the two facts publicCodeSync needs, printed by the page.
 */
export const resultHref = (quiz: string, code: string, link: LinkQuiz = {}): string =>
  `/r/${quiz}/${publicCodeSync(link, code)}/`;

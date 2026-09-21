/**
 * The daily set: today's ten, and what the device remembers of it.
 *
 * Both games already hand out the same ten lines to everyone on a given UTC day. What was
 * missing was everything that turns that into a habit: a counted result, a streak, a number
 * for the day, and a way straight back in. The games write what happened; this file is how
 * the rest of the site reads it.
 *
 * THE CONTRACT. One key per game, holding one object per UTC day:
 *
 *   "sls.daily"  Sounds Like Scripture
 *   "wsi.daily"  Who Said It?
 *
 *   { "v": 1, "days": { "20260921": {
 *       "n": 1, "score": 1240, "marks": "1101111011", "fast": "0010100000", "canon": "p"
 *   } } }
 *
 *   marks  ten characters, one per line in the order they were asked, 1 = right
 *   fast   the same ten, 1 = answered under three seconds
 *   canon  Sounds Like Scripture only: which Bible the player chose
 *
 * Three rules, the same three the shelf holds to:
 *
 *   nothing throws     storage can be blocked, full, or hand-edited to nonsense. Every read
 *                      is wrapped, and anything that will not parse starts empty rather than
 *                      taking a page down with it.
 *   nothing is trusted a day is only counted if its key is a real date and its value is an
 *                      object. A number typed into storage by hand must not be able to draw
 *                      a streak nobody walked.
 *   nothing is sent    it is the reader's device and nowhere else. Accounts come later and
 *                      will sync exactly this shape, which is why the shape is written down.
 *
 * ONLY THE FIRST COMPLETED RUN of a day is recorded; playing the same ten again is practice
 * and never overwrites it. A streak counts days played, which is knowledge, never devotion:
 * there are no reminders, no league table, and a broken streak simply shows its new number.
 *
 * Every function takes its storage as an argument so it can be exercised headlessly against
 * a fake object; browser callers leave it out and get localStorage.
 */

/** Versioned: a future shape change gets its own version rather than mangling this one. */
export const DAILY_V = 1;

/** Which key holds which game. The games write these; the site only reads them. */
export const DAILY_KEYS: Record<string, string> = {
  'sounds-like-scripture': 'sls.daily',
  'who-said-it': 'wsi.daily'
};

/** The games that keep a daily, in the order the site shows them. */
export const DAILY_GAMES: string[] = Object.keys(DAILY_KEYS);

/** Ten lines a run, so ten marks. */
export const RUN_LENGTH = 10;

/** Years of days, small enough that the whole log parses instantly. */
export const DAILY_CAP = 400;

/** Day #1 is 2026-09-21, UTC. Everything else counts from here. */
export const DAY_ONE_KEY = '20260921';

const DAY_MS = 86_400_000;
const DAY_ONE = Date.UTC(2026, 8, 21);

export interface DailyRecord {
  /** The day's number, counted from day one. Always derived from the key; see dayNumber. */
  n: number;
  /** The game's own score for that run, in its own points. */
  score: number;
  /** Ten characters, 1 = right, in the order the lines were asked. */
  marks: string;
  /** The same ten, 1 = answered under three seconds. */
  fast: string;
  /** Sounds Like Scripture only: the Bible the player chose. */
  canon?: 'p' | 'c' | 'o';
}

/** The slice of Storage this file uses. A fake with these three methods is enough to test. */
export interface DailyStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage, or null where it is blocked, absent, or on the server. */
export function browserStore(): DailyStore | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** The storage key for a game, or null for a game that keeps no daily. */
export function dailyKeyFor(game: string): string | null {
  return DAILY_KEYS[game] ?? null;
}

/* ------------------------------------------------------------------ days and numbers */

const pad = (n: number) => String(n).padStart(2, '0');

/** A moment as its UTC day, "yyyymmdd". The seed the games already use. */
export function dayKey(when: Date | number = new Date()): string {
  const d = when instanceof Date ? when : new Date(when);
  const t = d.getTime();
  if (!Number.isFinite(t)) return '';
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

/**
 * The UTC midnight a key stands for, or NaN.
 *
 * The round-trip is the check: "20260231" parses as 2 March and so is not the day it
 * claims to be, and a day that does not exist is dropped rather than quietly moved.
 */
export function keyTime(key: string): number {
  if (typeof key !== 'string' || !/^\d{8}$/.test(key)) return NaN;
  const y = Number(key.slice(0, 4));
  const m = Number(key.slice(4, 6));
  const d = Number(key.slice(6, 8));
  const t = Date.UTC(y, m - 1, d);
  return dayKey(t) === key ? t : NaN;
}

/** True where a string is a real UTC day. */
export const isDayKey = (key: string): boolean => Number.isFinite(keyTime(key));

/** The key `days` on from one, or '' if the start is not a day. */
export function shiftKey(key: string, days: number): string {
  const t = keyTime(key);
  if (!Number.isFinite(t)) return '';
  return dayKey(t + days * DAY_MS);
}

/**
 * Which day of the set this is: whole UTC days since 2026-09-21, plus one.
 *
 * Always computed, never read back from storage. The games write the number they printed;
 * deriving it from the key instead means a hand-edited or synced record can never make the
 * page announce a day the calendar does not agree with. Days before the first are 0 or less
 * and the pages simply do not print a number for them.
 */
export function dayNumber(when: Date | number | string = new Date()): number {
  const t = typeof when === 'string' ? keyTime(when) : dayStart(when);
  if (!Number.isFinite(t)) return 0;
  return Math.round((t - DAY_ONE) / DAY_MS) + 1;
}

/** The UTC midnight that begins a moment's day. */
function dayStart(when: Date | number): number {
  const key = dayKey(when);
  return key ? keyTime(key) : NaN;
}

/** How long until the next ten, in milliseconds. */
export function msToNextDay(now: Date | number = new Date()): number {
  const t = now instanceof Date ? now.getTime() : now;
  if (!Number.isFinite(t)) return 0;
  const start = dayStart(t);
  if (!Number.isFinite(start)) return 0;
  return start + DAY_MS - t;
}

/**
 * "5h 12m", the way the strip prints a countdown. Under an hour it drops the hours, and
 * in the last minute it says so in words rather than printing "0m" - which is the same
 * sentence the games print, so the strip and the game never disagree.
 */
export function countdownWords(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  return m > 0 ? `${m}m` : 'under a minute';
}

/* ------------------------------------------------------------------------ the record */

const CANONS = new Set(['p', 'c', 'o']);

/** Ten characters of 1 and 0, and nothing else. Anything odd comes back as ''. */
function tidyMarks(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const kept = raw.replace(/[^01]/g, '');
  return kept.slice(0, RUN_LENGTH);
}

/**
 * One day's value, made safe.
 *
 * The presence of a well-formed key holding an object IS the record: the day was finished.
 * A missing score is a zero, missing marks are no marks, and neither is invented.
 */
function tidyRecord(key: string, raw: unknown): DailyRecord | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const score = Number(r.score);
  const canon = typeof r.canon === 'string' ? r.canon.toLowerCase() : '';
  return {
    n: dayNumber(key),
    score: Number.isFinite(score) && score > 0 ? Math.round(score) : 0,
    marks: tidyMarks(r.marks),
    fast: tidyMarks(r.fast),
    ...(CANONS.has(canon) ? { canon: canon as 'p' | 'c' | 'o' } : {})
  };
}

/** A game's whole log: day key to record, capped, with anything unreadable left out. */
export type DailyLog = Record<string, DailyRecord>;

/** A stored string, parsed into days. Never throws; nonsense comes back as {}. */
export function parseDaily(raw: string | null): DailyLog {
  if (!raw) return {};
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  const wrap = data as Record<string, unknown>;
  if (Number(wrap.v) !== DAILY_V) return {};
  const days = wrap.days;
  if (!days || typeof days !== 'object' || Array.isArray(days)) return {};

  const out: DailyLog = {};
  // yyyymmdd sorts as a string exactly as it sorts as a date, so the newest 400 are the
  // last 400 keys. Older days are dropped on the way in rather than counted and thrown.
  const keys = Object.keys(days as Record<string, unknown>)
    .filter(isDayKey)
    .sort();
  for (const key of keys.slice(-DAILY_CAP)) {
    const rec = tidyRecord(key, (days as Record<string, unknown>)[key]);
    if (rec) out[key] = rec;
  }
  return out;
}

/** Everything one game has kept on this device. */
export function readDaily(game: string, store: DailyStore | null = browserStore()): DailyLog {
  const key = dailyKeyFor(game);
  if (!key || !store) return {};
  try {
    return parseDaily(store.getItem(key));
  } catch {
    return {};
  }
}

/** Write a log back. Returns false where storage refused it (private mode, quota). */
export function saveDaily(
  game: string,
  log: DailyLog,
  store: DailyStore | null = browserStore()
): boolean {
  const key = dailyKeyFor(game);
  if (!key || !store) return false;
  const days: Record<string, DailyRecord> = {};
  for (const k of Object.keys(log).filter(isDayKey).sort().slice(-DAILY_CAP)) days[k] = log[k];
  try {
    store.setItem(key, JSON.stringify({ v: DAILY_V, days }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Record a finished run of a day's ten, and hand back the log as it now stands.
 *
 * The first completed run of a day is the record. A second run of the same ten is practice:
 * it is not a second attempt at today, and overwriting the first with it would let anyone
 * grind a day until it looked good. Each game writes its own copy of this rule as it plays;
 * this is the same rule, written once, for anything on the site that has to write one.
 */
export function recordDay(
  game: string,
  record: Partial<DailyRecord> & { marks?: string },
  when: Date | number | string = new Date(),
  store: DailyStore | null = browserStore()
): DailyLog {
  const key = typeof when === 'string' ? when : dayKey(when);
  if (!isDayKey(key)) return readDaily(game, store);
  const log = readDaily(game, store);
  if (log[key]) return log;
  const rec = tidyRecord(key, record);
  if (!rec) return log;
  const next: DailyLog = { ...log, [key]: rec };
  saveDaily(game, next, store);
  return next;
}

/** Today's record for one game, or null where today has not been played. */
export function todayFor(
  game: string,
  store: DailyStore | null = browserStore(),
  now: Date | number = new Date()
): DailyRecord | null {
  return readDaily(game, store)[dayKey(now)] ?? null;
}

/** How many of the ten were right. */
export const rightCount = (marks: string): number =>
  (typeof marks === 'string' ? marks : '').split('').filter(c => c === '1').length;

/* ---------------------------------------------------------------------- the streaks */

/**
 * Consecutive days, ending today or yesterday.
 *
 * Yesterday still counts because a day is not over until it is: somebody who played at
 * 23:50 and comes back at 00:10 has not broken anything. A run that ended before yesterday
 * is over, and the number is simply 0 — the page says what it is and nothing about it.
 */
function streakOf(days: Set<string>, now: Date | number = new Date()): number {
  const today = dayKey(now);
  if (!isDayKey(today)) return 0;
  const yesterday = shiftKey(today, -1);
  let at = days.has(today) ? today : days.has(yesterday) ? yesterday : '';
  if (!at) return 0;
  let run = 0;
  while (at && days.has(at)) {
    run++;
    at = shiftKey(at, -1);
  }
  return run;
}

/** The longest run of consecutive days anywhere in what is kept. */
function bestOf(days: Set<string>): number {
  const keys = [...days].filter(isDayKey).sort();
  let best = 0;
  let run = 0;
  let prev = '';
  for (const key of keys) {
    run = prev && shiftKey(prev, 1) === key ? run + 1 : 1;
    if (run > best) best = run;
    prev = key;
  }
  return best;
}

/** Every day one game has kept. */
const daysOf = (game: string, store: DailyStore | null): Set<string> =>
  new Set(Object.keys(readDaily(game, store)));

/** Every day either game has kept: a day counts if either daily was finished. */
function siteDays(store: DailyStore | null): Set<string> {
  const all = new Set<string>();
  for (const game of DAILY_GAMES) for (const key of daysOf(game, store)) all.add(key);
  return all;
}

/** One game's current streak, in days. */
export function streakFor(
  game: string,
  store: DailyStore | null = browserStore(),
  now: Date | number = new Date()
): number {
  return streakOf(daysOf(game, store), now);
}

/** One game's longest streak ever, in days. */
export function bestStreakFor(
  game: string,
  store: DailyStore | null = browserStore()
): number {
  return bestOf(daysOf(game, store));
}

/** The streak across the whole site: a day counts if either daily was finished. */
export function siteStreak(
  store: DailyStore | null = browserStore(),
  now: Date | number = new Date()
): number {
  return streakOf(siteDays(store), now);
}

/** The site's longest streak ever, across both games. */
export function bestSiteStreak(store: DailyStore | null = browserStore()): number {
  return bestOf(siteDays(store));
}

/** "3 days", "1 day". Plain, and never congratulated. */
export const dayWords = (n: number): string => `${n} ${n === 1 ? 'day' : 'days'}`;

/* ------------------------------------------------------------------- the last stretch */

export interface DaySlot {
  key: string;
  /** The day's number, or 0 for a day before the set began. */
  n: number;
  /** What was played that day, or null. */
  record: DailyRecord | null;
  today: boolean;
}

/**
 * The last `count` days for one game, oldest first, today last.
 *
 * Every day in the stretch is returned, played or not, because the row on /me/ has to show
 * the gaps as well as the days: a row of marks that quietly leaves the empty days out is a
 * picture of a habit nobody has.
 */
export function recentDays(
  game: string,
  count = 7,
  store: DailyStore | null = browserStore(),
  now: Date | number = new Date()
): DaySlot[] {
  const log = readDaily(game, store);
  const today = dayKey(now);
  if (!isDayKey(today)) return [];
  const out: DaySlot[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const key = shiftKey(today, -i);
    out.push({ key, n: dayNumber(key), record: log[key] ?? null, today: i === 0 });
  }
  return out;
}

/**
 * The shelf: finished results, kept on the reader's own device.
 *
 * Finding an old result used to be impossible. A result lives in its own URL and nowhere
 * else, so a reader who closed the tab had lost it. This keeps a short list of what they
 * finished — the quiz, the result code and when — in one versioned localStorage key, and
 * /me/ renders it back through the engine.
 *
 * Three rules hold the whole file together:
 *
 *   nothing throws     storage can be blocked, full, or hand-edited to nonsense. Every read
 *                      and write is wrapped, and a shelf that cannot be parsed starts empty
 *                      rather than taking the page down with it.
 *   nothing is trusted an entry is only kept if it has the shape of an entry, and only shown
 *                      if its code still DECODES for its quiz. Junk in storage must not be
 *                      able to render a result that nobody ever had.
 *   nothing is sent    it is the reader's device and nowhere else.
 *
 * The functions below take their storage as an argument so they can be tested headlessly
 * against a fake object; browser callers leave it out and get localStorage.
 */
import { getQuiz, decodeFor } from './engine/registry';

/** Versioned: a future shape change gets its own key rather than mangling this one. */
export const SHELF_KEY = 'ww.shelf.v1';

/** Enough for years of taking quizzes, small enough that the whole list parses instantly. */
export const SHELF_CAP = 200;

/**
 * Two saves of the same result inside a minute are one finish, not two.
 *
 * The runner saves on the way to the result page, and a reader who lands there, goes back
 * and finishes again immediately has not taken the quiz twice. An hour later they have.
 */
export const SAME_RUN_MS = 60_000;

export interface ShelfEntry {
  /** The quiz's slug, as the registry spells it. */
  quiz: string;
  /** The result code, uppercase, exactly as it appears in the result URL. */
  code: string;
  /** When it was finished, as an ISO string. */
  at: string;
}

/** The slice of Storage this file uses. A fake with these three methods is enough to test. */
export interface ShelfStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage, or null where it is blocked, absent, or on the server. */
export function browserStore(): ShelfStore | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

const TIDY = (s: unknown) => (typeof s === 'string' ? s.trim() : '');

/**
 * One raw value from storage, made safe or dropped.
 *
 * A date that does not parse is not repaired to "now": a made-up date is a lie about when
 * somebody took a quiz, and the entry is worth less than the honesty.
 */
function tidyEntry(raw: unknown): ShelfEntry | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  const quiz = TIDY(e.quiz);
  const code = TIDY(e.code).toUpperCase();
  const at = TIDY(e.at);
  if (!quiz || !code || !at) return null;
  const when = Date.parse(at);
  if (!Number.isFinite(when)) return null;
  return { quiz, code, at: new Date(when).toISOString() };
}

/** Newest first. Pure, so the order is the same however the list reached us. */
const byNewest = (a: ShelfEntry, b: ShelfEntry) => Date.parse(b.at) - Date.parse(a.at);

/** A stored string, parsed into entries. Never throws; nonsense comes back as []. */
export function parseShelf(raw: string | null): ShelfEntry[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const out: ShelfEntry[] = [];
  for (const item of data) {
    const entry = tidyEntry(item);
    if (entry) out.push(entry);
  }
  return out.sort(byNewest).slice(0, SHELF_CAP);
}

/** Everything on the shelf, newest first. */
export function listResults(store: ShelfStore | null = browserStore()): ShelfEntry[] {
  if (!store) return [];
  try {
    return parseShelf(store.getItem(SHELF_KEY));
  } catch {
    return [];
  }
}

/** Write the list back. Returns false where storage refused it (private mode, quota). */
export function saveShelf(
  entries: ShelfEntry[],
  store: ShelfStore | null = browserStore()
): boolean {
  if (!store) return false;
  try {
    store.setItem(SHELF_KEY, JSON.stringify(entries.slice(0, SHELF_CAP)));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add a finished result, and hand back the shelf as it now stands.
 *
 * `when` is injectable so the dedupe window can be tested without waiting a minute.
 */
export function addResult(
  quiz: string,
  code: string,
  when: Date | string = new Date(),
  store: ShelfStore | null = browserStore()
): ShelfEntry[] {
  const entry = tidyEntry({
    quiz,
    code,
    at: typeof when === 'string' ? when : when.toISOString()
  });
  if (!entry) return listResults(store);

  const at = Date.parse(entry.at);
  const kept = listResults(store).filter(
    e =>
      !(
        e.quiz === entry.quiz &&
        e.code === entry.code &&
        Math.abs(Date.parse(e.at) - at) < SAME_RUN_MS
      )
  );
  const next = [entry, ...kept].sort(byNewest).slice(0, SHELF_CAP);
  saveShelf(next, store);
  return next;
}

/** The most recent result for each quiz, keyed by slug. */
export function latestPerQuiz(
  store: ShelfStore | null = browserStore()
): Map<string, ShelfEntry> {
  const out = new Map<string, ShelfEntry>();
  for (const entry of listResults(store)) {
    if (!out.has(entry.quiz)) out.set(entry.quiz, entry);
  }
  return out;
}

/** Every result for one quiz, newest first. */
export function historyFor(
  quiz: string,
  store: ShelfStore | null = browserStore()
): ShelfEntry[] {
  return listResults(store).filter(e => e.quiz === quiz);
}

/**
 * Take one result off the shelf.
 *
 * `at` narrows it to a single finish where a reader has the same code twice; without it,
 * every copy of that result goes.
 */
export function removeResult(
  quiz: string,
  code: string,
  at: string | null = null,
  store: ShelfStore | null = browserStore()
): ShelfEntry[] {
  const want = TIDY(code).toUpperCase();
  const next = listResults(store).filter(
    e => !(e.quiz === quiz && e.code === want && (!at || e.at === at))
  );
  saveShelf(next, store);
  return next;
}

/** Everything, gone. The reader asks for this; nothing else calls it. */
export function clearShelf(store: ShelfStore | null = browserStore()): void {
  if (!store) return;
  try {
    store.removeItem(SHELF_KEY);
  } catch {
    /* blocked storage has nothing to clear */
  }
}

/**
 * Two shelves, made one. Pure: it touches no storage and belongs to no device.
 *
 * An account makes this necessary. A reader signs in on a phone that holds nine results and
 * an account that holds fourteen, and the honest answer is all of them — a sync must never
 * be able to lose a result somebody finished. So the merge is a union, and the only things
 * that leave are the ones that were never two results in the first place.
 *
 *   tombstones   a result the reader asked to delete, given here as the entry it deleted.
 *                It wins over both sides: otherwise the other device would push it back and
 *                the delete button would look broken.
 *   the same run the rule `addResult` already applies, applied across devices. Two saves of
 *                one finish inside SAME_RUN_MS are one finish, and the EARLIER is kept,
 *                because that is when they actually finished; the later one is the round
 *                trip, not the moment.
 *
 * The cap is the device's, not the account's. When the account holds more than SHELF_CAP,
 * /me/ says so out loud rather than quietly pretending the rest never happened.
 */
export function mergeShelves(
  local: ShelfEntry[],
  remote: ShelfEntry[],
  tombstones: ShelfEntry[] = []
): ShelfEntry[] {
  const tidy = (list: unknown): ShelfEntry[] => {
    if (!Array.isArray(list)) return [];
    const out: ShelfEntry[] = [];
    for (const item of list) {
      const entry = tidyEntry(item);
      if (entry) out.push(entry);
    }
    return out;
  };

  const sameRun = (a: ShelfEntry, b: ShelfEntry) =>
    a.quiz === b.quiz &&
    a.code === b.code &&
    Math.abs(Date.parse(a.at) - Date.parse(b.at)) < SAME_RUN_MS;

  const gone = tidy(tombstones);
  const all = [...tidy(local), ...tidy(remote)]
    .filter(e => !gone.some(t => sameRun(t, e)))
    // Oldest first, so the entry kept out of each run is the earliest one.
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));

  const kept: ShelfEntry[] = [];
  for (const entry of all) {
    if (kept.some(k => sameRun(k, entry))) continue;
    kept.push(entry);
  }
  return kept.sort(byNewest).slice(0, SHELF_CAP);
}

/**
 * Can this entry still be turned back into a result?
 *
 * The quiz must exist and the code must decode for it. A code from a quiz that has since
 * changed shape, or a line somebody typed into storage by hand, is dropped rather than
 * shown: the page would otherwise print a headline for a result nobody ever had.
 */
export function isReadable(entry: ShelfEntry): boolean {
  const quiz = getQuiz(entry.quiz);
  if (!quiz) return false;
  try {
    return Boolean(decodeFor(quiz, entry.code));
  } catch {
    return false;
  }
}

/** The shelf, newest first, with anything unreadable left out. What /me/ renders. */
export function readableResults(store: ShelfStore | null = browserStore()): ShelfEntry[] {
  return listResults(store).filter(isReadable);
}

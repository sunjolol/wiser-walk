/**
 * The shelf, kept in step with the account.
 *
 * The device stays the source of truth. /me/ paints from localStorage first, every time,
 * signed in or not, so the page is exactly as fast as it is today and works with the network
 * off. Only then does this file run, and a failure here is silent: a reader who is offline
 * sees their results, because their results are genuinely there.
 *
 * It talks to PostgREST with plain `fetch` and the token supabase-js already wrote into
 * storage. That is the whole reason the SDK is not loaded on /me/: 56 KB on a phone to add a
 * header to a GET is not a trade worth making. The SDK is pulled in only when the stored
 * token is inside a minute of expiry, because refresh and its ten-second rotation window are
 * genuinely fiddly and the SDK owns them.
 *
 * Every function resolves. Storage and fetch are arguments with defaults, the way shelf.ts
 * does it, so the whole file can be driven headlessly against a fake of each.
 */
import { SUPABASE_KEY, SUPABASE_URL } from './config';
import { QUEUE_KEY, clearSignedIn, markSignedIn, storedSession } from './session';
import { SYNCED_GAME_KEYS, mergeGame, sameJson } from './merge';
import type { Stamped } from './merge';
import {
  browserStore,
  clearShelf,
  listResults,
  mergeShelves,
  removeResult,
  saveShelf
} from '../shelf';
import type { ShelfEntry, ShelfStore } from '../shelf';
import type { Done } from './client';

/** How many live results are pulled down in one go. Above this, /me/ says what is not shown. */
const REMOTE_LIMIT = 400;

/**
 * How many deletions are pulled down.
 *
 * A tombstone only has work to do while another device still holds the result it deleted, so
 * the recent ones are the ones that matter. "Clear everywhere" writes one per result and
 * also clears the device that asked, so the long tail here is not resurrectable anyway.
 */
const TOMBSTONE_LIMIT = 200;

/** A queued result is a few dozen bytes; fifty is more offline finishes than anyone has. */
const QUEUE_CAP = 50;

/** A token with less than this left is not worth spending a round trip on. */
const FRESH_MS = 60_000;

/** A sync must never be the reason a page feels stuck. */
const DEADLINE_MS = 8000;

/**
 * What this device last agreed with the account about each game key.
 *
 * Game values carry no timestamp on the device — the games write a bare number — so without
 * this there is no way to tell a canon the reader just changed here from one that has sat
 * unchanged for a month, and "later wins" would mean "whichever device syncs last wins".
 * Storing the value we last settled on, with the time, makes the question answerable: if what
 * is in storage now differs from what we recorded, it changed since, and it is as new as it
 * gets.
 */
export const STAMP_KEY = 'ww.acct.games';

export interface SyncDeps {
  store?: ShelfStore | null;
  fetch?: typeof globalThis.fetch;
  url?: string;
  key?: string;
  now?: () => number;
  /** The refresh path, injectable so a test never has to load the SDK. */
  refresh?: () => Promise<Auth | null>;
}

interface Auth {
  accessToken: string;
  userId: string;
  email: string;
}

/**
 * A token, and whether it came from a refresh.
 *
 * The difference is the whole of "is this person actually signed out". A stored token can be
 * refused for being stale; one the SDK has just minted and the server still refuses is a
 * session that is genuinely over, and only then may the header's hint be taken away.
 */
interface Held extends Auth {
  refreshed: boolean;
}

interface Wired {
  store: ShelfStore | null;
  fetch: typeof globalThis.fetch;
  url: string;
  key: string;
  now: () => number;
  refresh: () => Promise<Auth | null>;
}

function wire(deps: SyncDeps = {}): Wired {
  return {
    store: deps.store === undefined ? browserStore() : deps.store,
    // Bound on purpose: a bare `globalThis.fetch` handed around detaches from `window` and
    // browsers refuse to call it.
    fetch: deps.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init)),
    url: deps.url ?? SUPABASE_URL,
    key: deps.key ?? SUPABASE_KEY,
    now: deps.now ?? (() => Date.now()),
    refresh: deps.refresh ?? refreshThroughSdk
  };
}

/**
 * The one place the SDK is worth its weight. client.ts owns it, and the import is dynamic so
 * that nothing here pulls it into a page that only ever reads a fresh token.
 */
async function refreshThroughSdk(): Promise<Auth | null> {
  try {
    const { currentToken } = await import('./client');
    return await currentToken();
  } catch {
    return null;
  }
}

async function authFor(w: Wired): Promise<Held | null> {
  const stored = storedSession(w.store);
  if (stored && stored.expiresAt - w.now() > FRESH_MS) {
    return { accessToken: stored.accessToken, userId: stored.userId, email: stored.email, refreshed: false };
  }
  const fresh = await w.refresh();
  return fresh ? { ...fresh, refreshed: true } : null;
}

/** One PostgREST call, with a deadline. Never throws: the caller gets a Response or null. */
async function rest(
  w: Wired,
  token: string,
  path: string,
  init: RequestInit = {}
): Promise<Response | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), DEADLINE_MS);
  try {
    return await w.fetch(`${w.url}/rest/v1/${path}`, {
      ...init,
      headers: {
        // The publishable key says which project; the bearer says who. The key is never the
        // bearer — it is not a JWT, and the platform rejects it as one.
        apikey: w.key,
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        ...((init.headers as Record<string, string> | undefined) ?? {})
      },
      signal: ac.signal
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

const landed = (res: Response | null): res is Response => Boolean(res && res.status >= 200 && res.status < 300);

/**
 * A refusal that will be a refusal again tomorrow.
 *
 * Retrying costs nothing when the answer might change — a token to refresh (401, 403), a
 * timeout (408), a rate limit (429) — so those are kept. Every other 4xx means the server has
 * looked at what we sent and will not have it, and re-sending it on every page load for ever
 * is a loop nobody is ever told about.
 */
const permanent = (res: Response | null): res is Response =>
  Boolean(res && res.status >= 400 && res.status < 500 && ![401, 403, 408, 429].includes(res.status));

/**
 * Is this the account's row ceiling, rather than some other refusal?
 *
 * The trigger in schema.sql raises a check violation, which PostgREST hands back as 400 with
 * its SQLSTATE and the sentence the trigger wrote. Both are matched, because a Postgres
 * error code is the stable half and the message is the readable half.
 */
async function saysFull(res: Response | null): Promise<boolean> {
  if (!res) return false;
  try {
    const body = (await res.json()) as { code?: unknown; message?: unknown } | null;
    if (!body || typeof body !== 'object') return false;
    if (body.code === '23514') return true;
    return typeof body.message === 'string' && /already holds \d+ results/i.test(body.message);
  } catch {
    return false;
  }
}

async function rowsOf(res: Response | null): Promise<Record<string, unknown>[]> {
  if (!landed(res)) return [];
  try {
    const body = await res.json();
    return Array.isArray(body) ? (body as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}

/** `0-199/431` — the true total, whatever the page size was. */
function countFrom(res: Response | null): number | undefined {
  if (!landed(res)) return undefined;
  const range = res.headers?.get?.('content-range') ?? '';
  const total = Number(range.split('/')[1]);
  return Number.isFinite(total) ? total : undefined;
}

/**
 * The server's column is `taken_at`; the shelf's field is `at`. One translation, here.
 *
 * The instant is respelled the way the shelf spells it, because Postgres hands back
 * `2026-09-20T10:00:00+00:00` for what the browser wrote as `2026-09-20T10:00:00.000Z`, and
 * `removeResult` matches on the string. An unparseable date is left alone for the caller's
 * guard to reject rather than repaired into a lie about when somebody took a quiz.
 */
const asEntry = (row: Record<string, unknown>): ShelfEntry => {
  const at = String(row.taken_at ?? '');
  const when = Date.parse(at);
  return {
    quiz: String(row.quiz ?? ''),
    code: String(row.code ?? '').toUpperCase(),
    at: Number.isFinite(when) ? new Date(when).toISOString() : at
  };
};

/** Identity of a finish: the quiz, the code and the instant, however the instant was spelled. */
const keyOf = (e: ShelfEntry) => `${e.quiz}|${e.code.toUpperCase()}|${Date.parse(e.at)}`;

const sameList = (a: ShelfEntry[], b: ShelfEntry[]) =>
  a.length === b.length && a.every((e, i) => keyOf(e) === keyOf(b[i]));

const rowFor = (userId: string, e: ShelfEntry) => ({
  user_id: userId,
  quiz: e.quiz,
  code: e.code,
  taken_at: e.at
});

// ------------------------------------------------------------------- the queue

function readRaw(store: ShelfStore | null, key: string): string | null {
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function writeRaw(store: ShelfStore | null, key: string, value: string): void {
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    /* blocked or full: the result is already on the shelf, which is what matters */
  }
}

function readQueue(store: ShelfStore | null): ShelfEntry[] {
  const raw = readRaw(store, QUEUE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter(e => e && typeof e === 'object')
      .map(e => asEntry({ quiz: (e as ShelfEntry).quiz, code: (e as ShelfEntry).code, taken_at: (e as ShelfEntry).at }))
      .filter(e => e.quiz && e.code && Number.isFinite(Date.parse(e.at)));
  } catch {
    return [];
  }
}

function writeQueue(store: ShelfStore | null, entries: ShelfEntry[]): void {
  if (!entries.length) {
    if (!store) return;
    try {
      store.removeItem(QUEUE_KEY);
    } catch {
      /* nothing to clear */
    }
    return;
  }
  writeRaw(store, QUEUE_KEY, JSON.stringify(entries.slice(-QUEUE_CAP)));
}

/**
 * Remember a finished result for pushing later. Storage only, no network.
 *
 * The quiz runner navigates to the result page the instant a quiz ends, and a fetch started
 * in that moment is cancelled by the navigation. So the runner writes here, and the layout's
 * post-paint script flushes it on the next page — which is usually the result page, a few
 * hundred milliseconds later.
 */
export function queueResult(
  entry: { quiz: string; code: string; at: string },
  store: ShelfStore | null = browserStore()
): void {
  const one = asEntry({ quiz: entry?.quiz, code: entry?.code, taken_at: entry?.at });
  if (!one.quiz || !one.code || !Number.isFinite(Date.parse(one.at))) return;
  const queue = readQueue(store).filter(e => keyOf(e) !== keyOf(one));
  writeQueue(store, [...queue, one]);
}

/**
 * Push whatever is waiting. Cleared on success, and on a refusal that will not change.
 *
 * A failed flush must leave the queue exactly as it found it, or an offline finish is lost
 * for good. But "for ever" is the other way to get this wrong: an account at its row ceiling
 * refuses the same batch on every page load, silently, and nothing would ever empty it. So a
 * permanent 4xx empties the queue too. Those results are still on the device and still in
 * their own URLs; the queue is only the list of things to try.
 */
export async function flushQueue(deps: SyncDeps = {}): Promise<void> {
  const w = wire(deps);
  if (!w.url || !w.key) return;
  const queue = readQueue(w.store);
  if (!queue.length) return;
  try {
    const auth = await authFor(w);
    if (!auth) return;
    const res = await rest(w, auth.accessToken, 'results?on_conflict=user_id,quiz,code,taken_at', {
      method: 'POST',
      headers: { prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify(queue.map(e => rowFor(auth.userId, e)))
    });
    if (landed(res) || permanent(res)) writeQueue(w.store, []);
  } catch {
    /* silent by design: the queue survives and the next page tries again */
  }
}

// -------------------------------------------------------------------- the sync

/**
 * Bring the device and the account into agreement, in both directions.
 *
 * `changed` says whether anything on the device moved, so /me/ knows to repaint rather than
 * repainting on principle. `serverTotal` is the account's own count of live results, exactly
 * as the server reported it and with nothing added to it, which is how the page can say
 * "200 shown, 431 saved to your account" honestly. `full` says the account would not take
 * any more, so /me/ can say that once instead of leaving somebody to wonder.
 */
export async function syncNow(
  deps: SyncDeps = {}
): Promise<{ ok: boolean; changed: boolean; serverTotal?: number; full?: boolean }> {
  const w = wire(deps);
  if (!w.url || !w.key) return { ok: false, changed: false };

  const readBoth = (token: string) =>
    Promise.all([
      rest(
        w,
        token,
        `results?select=quiz,code,taken_at&deleted_at=is.null&order=taken_at.desc&limit=${REMOTE_LIMIT}`,
        { headers: { prefer: 'count=exact' } }
      ),
      rest(
        w,
        token,
        `results?select=quiz,code,taken_at&deleted_at=not.is.null&order=taken_at.desc&limit=${TOMBSTONE_LIMIT}`
      )
    ]);

  try {
    let auth = await authFor(w);
    if (!auth) return { ok: false, changed: false };

    let [liveRes, goneRes] = await readBoth(auth.accessToken);

    // A stored token can be refused for being a few minutes past its moment. That is worth
    // one refresh and one more try before anybody is told anything.
    if (liveRes?.status === 401 && !auth.refreshed) {
      const again = await w.refresh();
      if (again) {
        auth = { ...again, refreshed: true };
        [liveRes, goneRes] = await readBoth(auth.accessToken);
      }
    }
    if (liveRes?.status === 401 && auth.refreshed) {
      // The server has answered, and the answer is that this session is over: signed out
      // elsewhere, or the account deleted from another device. The header must stop saying
      // otherwise. A silent network and a 5xx never reach here, and never should: somebody
      // in a tunnel has not signed out.
      clearSignedIn(w.store);
    }
    if (!landed(liveRes)) return { ok: false, changed: false };

    const remote = (await rowsOf(liveRes)).map(asEntry);
    const tombstones = (await rowsOf(goneRes)).map(asEntry);
    const counted = countFrom(liveRes);

    const local = listResults(w.store);
    const merged = mergeShelves(local, remote, tombstones);
    let changed = false;
    if (!sameList(local, merged)) {
      saveShelf(merged, w.store);
      changed = true;
    }

    // Everything the account is missing goes up in one request. Entries the merge collapsed
    // away are not sent: the account keeps what it keeps, and the device's view of one finish
    // is the earliest save of it.
    const held = new Set(remote.map(keyOf));
    const missing = merged.filter(e => !held.has(keyOf(e)));
    let full = false;
    if (missing.length) {
      const res = await rest(w, auth.accessToken, 'results?on_conflict=user_id,quiz,code,taken_at', {
        method: 'POST',
        headers: { prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify(missing.map(e => rowFor(auth.userId, e)))
      });
      if (landed(res)) {
        for (const e of missing) held.add(keyOf(e));
      } else if (permanent(res)) {
        full = await saysFull(res);
      }
    }
    // Anything the account now holds has no business sitting in the queue.
    const queue = readQueue(w.store);
    const waiting = queue.filter(e => !held.has(keyOf(e)));
    if (waiting.length !== queue.length) writeQueue(w.store, waiting);

    if (await syncGames(w, auth)) changed = true;

    // The header's hint is written forward on every successful sync, so a reader who keeps
    // coming back never sees it go stale and never sees the mark flip.
    if (auth.email) markSignedIn(auth.email, w.store);

    // Nothing is added to the server's own number. Results the account already held outside
    // the window we read are not new, and counting them again made the one line on /me/ whose
    // job is honesty about the gap overstate it.
    const out: { ok: boolean; changed: boolean; serverTotal?: number; full?: boolean } = {
      ok: true,
      changed,
      serverTotal: counted
    };
    if (full) out.full = true;
    return out;
  } catch {
    return { ok: false, changed: false };
  }
}

/**
 * How many live results the account holds, asked on its own.
 *
 * /account/ prints this under "Results saved", and it must be the account's number rather
 * than the device's: the shelf stops at 200 and the account goes on to 2,000. `null` means we
 * could not ask, which the page says in its own words rather than guessing.
 *
 * It is a head request in everything but name: `limit=1` and `count=exact` bring back the
 * total in a header and at most one row.
 */
export async function countResults(deps: SyncDeps = {}): Promise<number | null> {
  const w = wire(deps);
  if (!w.url || !w.key) return null;
  try {
    const auth = await authFor(w);
    if (!auth) return null;
    const res = await rest(w, auth.accessToken, 'results?select=quiz&deleted_at=is.null&limit=1', {
      headers: { prefer: 'count=exact' }
    });
    const total = countFrom(res);
    return total === undefined ? null : total;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------- game stats

type Stamps = Record<string, { v: string | null; t: number }>;

function readStamps(w: Wired): Stamps {
  const raw = readRaw(w.store, STAMP_KEY);
  if (!raw) return {};
  try {
    const data = JSON.parse(raw);
    return data && typeof data === 'object' && !Array.isArray(data) ? (data as Stamps) : {};
  } catch {
    return {};
  }
}

/** What is in storage under a game's own key, parsed the way the game wrote it. */
function readGame(w: Wired, key: string): { raw: string | null; value: unknown } {
  const raw = readRaw(w.store, key);
  if (raw === null) return { raw: null, value: undefined };
  try {
    return { raw, value: JSON.parse(raw) };
  } catch {
    return { raw, value: undefined };
  }
}

async function syncGames(w: Wired, auth: Auth): Promise<boolean> {
  const res = await rest(
    w,
    auth.accessToken,
    `game_stats?select=key,value,updated_at&key=in.(${SYNCED_GAME_KEYS.join(',')})`
  );
  if (!landed(res)) return false;

  const rows = await rowsOf(res);
  const stamps = readStamps(w);
  const nextStamps: Stamps = { ...stamps };
  const push: Record<string, unknown>[] = [];
  const now = w.now();
  let changed = false;

  for (const key of SYNCED_GAME_KEYS) {
    const here = readGame(w, key);
    const row = rows.find(r => r.key === key);
    const remoteAt = row ? Date.parse(String(row.updated_at ?? '')) : 0;

    // Unchanged since the last time we agreed? Then it is as old as that agreement. Changed
    // since? Then the reader changed it here, and it is as new as anything can be.
    const stamp = stamps[key];
    const localAt = stamp && stamp.v === here.raw && Number.isFinite(stamp.t) ? stamp.t : now;

    const local: Stamped | null = here.value === undefined ? null : { value: here.value, updatedAt: localAt };
    const remote: Stamped | null = row
      ? { value: row.value, updatedAt: Number.isFinite(remoteAt) ? remoteAt : 0 }
      : null;

    const merged = mergeGame(key, local, remote);
    if (!merged) continue;

    const rawMerged = JSON.stringify(merged.value);
    if (rawMerged !== here.raw) {
      writeRaw(w.store, key, rawMerged);
      changed = true;
    }
    if (!row || !sameJson(merged.value, row.value)) {
      push.push({ user_id: auth.userId, key, value: merged.value, updated_at: new Date(now).toISOString() });
    }
    nextStamps[key] = { v: rawMerged, t: merged.updatedAt || now };
  }

  if (push.length) {
    await rest(w, auth.accessToken, 'game_stats?on_conflict=user_id,key', {
      method: 'POST',
      headers: { prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(push)
    });
  }
  writeRaw(w.store, STAMP_KEY, JSON.stringify(nextStamps));
  return changed;
}

// ---------------------------------------------------------------- deleting things

const gone = (code: string, say: string): Done => ({ ok: false, code, say });

/**
 * Clear everything, account first.
 *
 * The order is the opposite of the obvious one and it matters: clear the device first and
 * fail server-side, and the next sync pulls it all back and the button looks broken. So
 * nothing on the device is touched until the account has actually said yes.
 *
 * A row is not deleted but marked. The tombstone is what tells the reader's other phone that
 * these are gone rather than missing.
 */
export async function clearEverywhere(deps: SyncDeps = {}): Promise<Done> {
  const w = wire(deps);
  if (!w.url || !w.key) return gone('off', 'Accounts are not switched on yet.');
  try {
    const auth = await authFor(w);
    if (!auth) return gone('nosession', 'You are not signed in on this device.');

    const res = await rest(w, auth.accessToken, 'results?deleted_at=is.null', {
      method: 'PATCH',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({ deleted_at: new Date(w.now()).toISOString() })
    });
    if (!landed(res)) {
      return res
        ? gone('unknown', 'We could not clear your account just now. Nothing has been changed, so do try again.')
        : gone('offline', 'We could not reach your account. Check your connection and try again.');
    }

    clearShelf(w.store);
    writeQueue(w.store, []);
    return { ok: true };
  } catch {
    return gone('offline', 'We could not reach your account. Check your connection and try again.');
  }
}

/** One result, gone from both. Same order, same reason. */
export async function removeEverywhere(
  entry: { quiz: string; code: string; at: string },
  deps: SyncDeps = {}
): Promise<Done> {
  const w = wire(deps);
  const one = asEntry({ quiz: entry?.quiz, code: entry?.code, taken_at: entry?.at });
  if (!one.quiz || !one.code || !Number.isFinite(Date.parse(one.at))) {
    return gone('unknown', 'That result could not be found.');
  }
  if (!w.url || !w.key) return gone('off', 'Accounts are not switched on yet.');

  try {
    const auth = await authFor(w);
    if (!auth) return gone('nosession', 'You are not signed in on this device.');

    const where =
      `results?quiz=eq.${encodeURIComponent(one.quiz)}` +
      `&code=eq.${encodeURIComponent(one.code)}` +
      `&taken_at=eq.${encodeURIComponent(one.at)}`;
    const res = await rest(w, auth.accessToken, where, {
      method: 'PATCH',
      headers: { prefer: 'return=minimal' },
      body: JSON.stringify({ deleted_at: new Date(w.now()).toISOString() })
    });
    if (!landed(res)) {
      return res
        ? gone('unknown', 'We could not remove that just now. Nothing has been changed, so do try again.')
        : gone('offline', 'We could not reach your account. Check your connection and try again.');
    }

    removeResult(one.quiz, one.code, one.at, w.store);
    writeQueue(w.store, readQueue(w.store).filter(e => keyOf(e) !== keyOf(one)));
    return { ok: true };
  } catch {
    return gone('offline', 'We could not reach your account. Check your connection and try again.');
  }
}

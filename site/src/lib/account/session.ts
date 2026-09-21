/**
 * What the browser knows about the account, without loading anything.
 *
 * Four keys live in localStorage, and this file is the only place that knows their shapes:
 *
 *   ww.auth        the session itself, written and refreshed by supabase-js. We read it, we
 *                  never write it. Reading it is what lets a page make one authenticated
 *                  request without paying 56 KB for the SDK first.
 *   ww.acct.v1     a sixty-byte mirror of "somebody is signed in, and it is this address".
 *                  The pre-paint script in the head reads it to set the header's state before
 *                  first paint, which a CDN-cached static page cannot do any other way.
 *   ww.acct.queue  results finished while offline or on the way out of the quiz runner,
 *                  waiting to be pushed. Owned by sync.ts; the key is named here so that they
 *                  all live together.
 *   ww.acct.synced when this browser last agreed with the account, so /me/ can say it in
 *                  words. Written by the layout's flush and by /me/ itself, which spell it
 *                  out as a literal because they are inline scripts; it is named here so that
 *                  deleting an account has one list to clear and cannot miss one.
 *
 * Same three rules as shelf.ts, and for the same reasons: nothing throws, nothing is
 * trusted, and every function takes its storage as an argument so it can be tested against
 * a fake object.
 */
import type { ShelfStore } from '../shelf';

/**
 * localStorage, or null where it is blocked.
 *
 * Copied from shelf.ts rather than imported, and the five lines are worth the duplication:
 * shelf.ts imports the quiz engine, so importing one runtime value from it here would drag
 * the 141 KB engine chunk in behind anything that wanted a key name. This file has to stay
 * importable by the cheapest script on the site.
 */
function browserStore(): ShelfStore | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

/** The session, as supabase-js stores it. Named by us through `storageKey`. */
export const AUTH_KEY = 'ww.auth';

/** The header's hint. Versioned, so a shape change gets its own key. */
export const HINT_KEY = 'ww.acct.v1';

/** Results waiting to be pushed to the account. */
export const QUEUE_KEY = 'ww.acct.queue';

/** When this browser and the account were last in agreement, as an ISO string. */
export const SYNCED_AT_KEY = 'ww.acct.synced';

/**
 * How long the hint is believed, in seconds.
 *
 * It is a claim about the past, not a session: somebody who signs out on another device is
 * still "in" here until this browser next talks to the server. Sixty days keeps the header
 * honest for anyone who actually returns, and stops a browser that was used once in 2026
 * from insisting for ever. Every successful sync writes it forward.
 */
const HINT_TTL_S = 60 * 24 * 60 * 60;

/** Who the header thinks is signed in. */
export interface AccountHint {
  email: string;
}

/** Enough of a session to make one authenticated request. */
export interface StoredSession {
  accessToken: string;
  userId: string;
  /** Empty where the session holds no address, which is rare but not impossible. */
  email: string;
  /** Epoch milliseconds, so it compares straight against `Date.now()`. */
  expiresAt: number;
}

const TIDY = (s: unknown) => (typeof s === 'string' ? s.trim() : '');

/** One stored string, parsed. Never throws; nonsense comes back as null. */
function parse(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** A read that survives blocked storage, a hostile getItem and a missing key alike. */
function get(store: ShelfStore | null, key: string): string | null {
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function put(store: ShelfStore | null, key: string, value: string): void {
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    /* private mode, or a full quota. The site works without the hint. */
  }
}

function drop(store: ShelfStore | null, key: string): void {
  if (!store) return;
  try {
    store.removeItem(key);
  } catch {
    /* blocked storage has nothing to clear */
  }
}

/**
 * The header's hint, or null.
 *
 * `{ e, x }` rather than `{ email, expires }` because this is parsed in the critical path of
 * first paint, on a phone, before anything else runs.
 */
export function readHint(store: ShelfStore | null = browserStore()): AccountHint | null {
  const data = parse(get(store, HINT_KEY));
  if (!data || typeof data !== 'object') return null;
  const hint = data as Record<string, unknown>;
  const email = TIDY(hint.e);
  if (!email) return null;
  const until = typeof hint.x === 'number' && Number.isFinite(hint.x) ? hint.x : 0;
  if (until && until * 1000 < Date.now()) return null;
  return { email };
}

/** Say that this browser has an account, and whose. Called on every successful sync too. */
export function markSignedIn(email: string, store: ShelfStore | null = browserStore()): void {
  const e = TIDY(email);
  if (!e) return;
  put(store, HINT_KEY, JSON.stringify({ e, x: Math.floor(Date.now() / 1000) + HINT_TTL_S }));
}

/** Forget the hint. The shelf is untouched: those results are this device's, signed in or not. */
export function clearSignedIn(store: ShelfStore | null = browserStore()): void {
  drop(store, HINT_KEY);
}

/**
 * The stored session, if there is one worth using.
 *
 * supabase-js writes the session object straight into its storage key; older versions
 * wrapped it as `{ currentSession }`, and a browser that has been through an upgrade can
 * still be holding one, so both shapes are read. A session missing its token or its user is
 * not a session, and saying so here is what makes sync.ts's "is this fresh enough" check a
 * one-liner.
 */
export function storedSession(store: ShelfStore | null = browserStore()): StoredSession | null {
  const data = parse(get(store, AUTH_KEY));
  if (!data || typeof data !== 'object') return null;
  const outer = data as Record<string, unknown>;
  const inner =
    outer.currentSession && typeof outer.currentSession === 'object'
      ? (outer.currentSession as Record<string, unknown>)
      : outer;

  const accessToken = TIDY(inner.access_token);
  const user = inner.user && typeof inner.user === 'object' ? (inner.user as Record<string, unknown>) : null;
  const userId = TIDY(user?.id);
  if (!accessToken || !userId) return null;

  // Supabase counts expiry in epoch seconds. A session with no usable expiry reads as long
  // expired, which sends the caller to the SDK for a refresh rather than at a server with a
  // token that may already be dead.
  const seconds = typeof inner.expires_at === 'number' && Number.isFinite(inner.expires_at) ? inner.expires_at : 0;

  return { accessToken, userId, email: TIDY(user?.email), expiresAt: seconds * 1000 };
}

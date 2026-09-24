/**
 * The code a person SEES, and the code the site KEEPS.
 *
 * Every result has one canonical code. It is what the codec makes, what the device shelf
 * and the accounts table hold, and what `encodeFor` and `decodeFor` speak. It never changes.
 *
 * The code in a link someone sees or sends is the PUBLIC code, and it is as short as it
 * can honestly be. There are three kinds:
 *
 *   same    The Compass and the Psalm quiz. Their codes are already short, so the public
 *           code is the canonical one.
 *   strip   A quiz whose code is a prefix and six characters (the sins, the figures). Six
 *           characters are what the codec needs for these, and the first of them is always
 *           a padding zero. The public code swaps the prefix and that zero for the prefix's
 *           first letter: S02H4YP becomes S2H4YP, BF00Z57V becomes B0Z57V.
 *   short   A quiz flagged `shortLinks` (the gifts, sixteen characters). Its public code is
 *           six characters kept in Supabase (table short_links) that point at the long one.
 *           It is made when the reader finishes, by POST /api/short.
 *
 * WHY NOT JUST DROP THE PREFIX. The prefix is what stops one quiz reading another quiz's
 * code (see makeCodec): the Compass, the sins and the figures all count to about 4.8
 * million, so a bare six-character code is a valid result under all three. Keeping one
 * letter in the place of the padding zero keeps the binding. A Compass code always starts
 * with that zero, so no public code of another quiz is ever a Compass code, and each quiz
 * reads only its own letter. The engine test checks every pair.
 *
 * Old links keep working for ever: the canonical code is always accepted, alongside the
 * public one.
 *
 * This file is imported by pages and by browser scripts alike, so it holds no quiz data
 * and reaches no registry. The Supabase parts run on the server only; the browser parts
 * talk to /api/short and never see a key.
 */
import type { Quiz } from './types';
import type { Env } from '../email/env';
import { projectUrl } from '../account/checks';

/** A short code: six capitals or digits. What the table's own check allows. */
export const SHORT_RE = /^[0-9A-Z]{6}$/;

/**
 * The characters a short code is made of. No vowels, and none of the digits that pass for
 * one (0, 1, 3, 4), so a code can never spell a word. A link someone posts under their own
 * name should not be able to say something rude by chance. 26 characters still make about
 * 309 million codes.
 */
export const SHORT_ALPHABET = '256789BCDFGHJKLMNPQRSTVWXZ';

/** How long the runner waits for a short link before it goes to the long one. */
export const MINT_TIMEOUT_MS = 1500;

/** How long a result page waits on Supabase to look a short link up. */
const LOOKUP_TIMEOUT_MS = 2500;

/** Salts tried after a code is taken by another result. Needing even two is rare. */
const MAX_SALT = 8;

/** Any `fetch`. Passed in so the Supabase parts can be driven from a test with no network. */
export type Fetcher = typeof fetch;

/** What publicCodeSync needs to know about a quiz. A whole Quiz will do; so will these two. */
export interface LinkQuiz {
  codePrefix?: string;
  shortLinks?: boolean;
}

const up = (raw: unknown) => String(raw ?? '').trim().toUpperCase();

/** The prefix, when this quiz's public code swaps it for one letter. '' when it does not. */
function stripPrefix(quiz: LinkQuiz): string {
  return quiz.shortLinks ? '' : (quiz.codePrefix ?? '').toUpperCase();
}

// ------------------------------------------------------------ both sides

/**
 * The public code for a canonical code, with no network.
 *
 * Strips where the quiz strips, and returns the canonical code otherwise. For a `shortLinks`
 * quiz that is the long code: its short code has to be asked for (requestShortCode).
 */
export function publicCodeSync(quiz: LinkQuiz, code: string): string {
  const c = up(code);
  const p = stripPrefix(quiz);
  if (!p || !c.startsWith(p)) return c;
  const body = c.slice(p.length);
  // Only a body of exactly six that starts with its padding zero. Anything else stays long.
  return body.length === 6 && body[0] === '0' ? p[0] + body.slice(1) : c;
}

/**
 * The canonical code behind a canonical or a stripped code, or null. No network.
 *
 * Re-encoded from the decoded values, so what comes back is exactly the code the codec
 * makes, whatever case arrived in the URL.
 */
export function resolveCodeSync(quiz: Quiz, raw: string): string | null {
  const c = up(raw);
  if (!c || c.length > 96) return null;
  const direct = quiz.strategy.decode(quiz, c);
  if (direct) return quiz.strategy.encode(quiz, direct);

  const p = stripPrefix(quiz);
  if (p && c.length === 6 && c[0] === p[0]) {
    const values = quiz.strategy.decode(quiz, p + '0' + c.slice(1));
    if (values) return quiz.strategy.encode(quiz, values);
  }
  return null;
}

/**
 * The code a page's own links should print, given the code its URL arrived with.
 *
 * A page opened by its short link keeps that link. Anything else prints its public code,
 * which for a `shortLinks` quiz is still the long one until a short one is made.
 */
export function linkCodeFor(quiz: LinkQuiz, raw: string, canonical: string): string {
  const c = up(raw);
  if (quiz.shortLinks && c !== canonical && SHORT_RE.test(c)) return c;
  return publicCodeSync(quiz, canonical);
}

// ------------------------------------------------------------ the server: Supabase

type Lookup =
  | { state: 'found'; quiz: string; full: string }
  | { state: 'none' }
  | { state: 'down' };

/** A request with a deadline. Never throws: the caller gets a Response or null. */
async function ask(fetchImpl: Fetcher, url: string, init: RequestInit, timeoutMs: number) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { ...init, signal: ac.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The project and the secret key, or null when either is missing. */
function access(env: Env): { base: string; secret: string } | null {
  const base = projectUrl(env);
  const secret = (env.SUPABASE_SECRET_KEY ?? '').trim();
  return base && secret ? { base, secret } : null;
}

/**
 * One short code's row. 'down' covers everything that is not an answer: no key, no table,
 * a paused project, a timeout. Every caller treats it as "no short link today".
 */
async function lookUp(code: string, env: Env, fetchImpl: Fetcher): Promise<Lookup> {
  const to = access(env);
  if (!to) return { state: 'down' };
  // The secret key goes on the apikey header and never as a bearer token (see checks.ts).
  const res = await ask(
    fetchImpl,
    `${to.base}/rest/v1/short_links?code=eq.${encodeURIComponent(code)}&select=quiz,long_code&limit=1`,
    { headers: { apikey: to.secret, accept: 'application/json' } },
    LOOKUP_TIMEOUT_MS
  );
  if (!res || res.status !== 200) return { state: 'down' };
  const rows = (await res.json().catch(() => null)) as { quiz?: unknown; long_code?: unknown }[] | null;
  if (!Array.isArray(rows)) return { state: 'down' };
  const row = rows[0];
  if (!row) return { state: 'none' };
  return typeof row.quiz === 'string' && typeof row.long_code === 'string'
    ? { state: 'found', quiz: row.quiz, full: row.long_code }
    : { state: 'down' };
}

/**
 * The canonical code behind any public form, or null.
 *
 * The canonical code, the stripped code, and for a `shortLinks` quiz a short code looked
 * up in the table. A short code must belong to THIS quiz and its long code must still
 * decode, so a row can never open a result under the wrong quiz. With no table or no key,
 * a short code finds nothing and the page says the link is not valid; every other form
 * works without Supabase at all.
 */
export async function resolveCode(
  quiz: Quiz,
  raw: string,
  env: Env,
  fetchImpl: Fetcher = fetch
): Promise<string | null> {
  const sync = resolveCodeSync(quiz, raw);
  if (sync) return sync;

  const c = up(raw);
  if (!quiz.shortLinks || !SHORT_RE.test(c)) return null;
  const row = await lookUp(c, env, fetchImpl);
  if (row.state !== 'found' || row.quiz !== quiz.slug) return null;
  const values = quiz.strategy.decode(quiz, row.full);
  return values ? quiz.strategy.encode(quiz, values) : null;
}

/**
 * The short code for a result, before anyone has asked whether it is free.
 *
 * Deterministic: SHA-256 of "quiz:code", read as a number, written in SHORT_ALPHABET. The
 * same result always asks for the same code first, so two tabs finishing the same result
 * meet on one row. A salt gives the next code to try when that one is taken.
 */
export async function shortCodeFor(slug: string, full: string, salt = 0): Promise<string> {
  const text = salt ? `${slug}:${full}:${salt}` : `${slug}:${full}`;
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
  // Five bytes: 2^40 fits a double exactly, and is thousands of times the 26^6 codes.
  let n = 0;
  for (let i = 0; i < 5; i++) n = n * 256 + hash[i]!;
  const base = SHORT_ALPHABET.length;
  let out = '';
  for (let i = 0; i < 6; i++) {
    out = SHORT_ALPHABET[n % base] + out;
    n = Math.floor(n / base);
  }
  return out;
}

/**
 * The short code for a canonical code: the row that already holds it, or a new one.
 *
 * Null whenever it cannot be done, and the caller then uses the long code. That is the
 * whole failure plan: before the owner runs the SQL, with no key, or with Supabase asleep,
 * every result simply keeps its long link.
 */
export async function mintShortCode(
  quiz: Quiz,
  code: string,
  env: Env,
  fetchImpl: Fetcher = fetch
): Promise<string | null> {
  if (!quiz.shortLinks) return null;
  const values = quiz.strategy.decode(quiz, up(code));
  if (!values) return null;
  const full = quiz.strategy.encode(quiz, values);
  const to = access(env);
  if (!to) return null;

  for (let salt = 0; salt < MAX_SALT; salt++) {
    const short = await shortCodeFor(quiz.slug, full, salt);
    const mine = (r: Lookup) => r.state === 'found' && r.quiz === quiz.slug && r.full === full;

    const seen = await lookUp(short, env, fetchImpl);
    if (seen.state === 'down') return null;
    if (mine(seen)) return short;
    if (seen.state === 'found') continue; // another result has it: try the next salt

    const res = await ask(
      fetchImpl,
      `${to.base}/rest/v1/short_links`,
      {
        method: 'POST',
        headers: {
          apikey: to.secret,
          'content-type': 'application/json',
          accept: 'application/json',
          prefer: 'return=minimal'
        },
        body: JSON.stringify({ code: short, quiz: quiz.slug, long_code: full })
      },
      LOOKUP_TIMEOUT_MS
    );
    if (!res) return null;
    if (res.status === 201 || res.status === 200 || res.status === 204) return short;
    if (res.status !== 409) return null;

    // Taken between the look and the write: most likely by this same result from another
    // tab, which is fine. Look once more before moving on.
    const again = await lookUp(short, env, fetchImpl);
    if (again.state === 'down') return null;
    if (mine(again)) return short;
  }
  return null;
}

// ------------------------------------------------------------ the browser: /api/short

/**
 * Ask the site for a result's short code. Null on anything but a clean answer in time,
 * and the caller uses the long code.
 */
export async function requestShortCode(
  slug: string,
  code: string,
  timeoutMs = MINT_TIMEOUT_MS
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetch('/api/short', {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ quiz: slug, code }),
      signal: ac.signal
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { short?: unknown };
    return typeof body?.short === 'string' && SHORT_RE.test(body.short) ? body.short : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The long code behind a short one, for the runner's ?with=. Null when it is not known. */
export async function requestFullCode(
  slug: string,
  short: string,
  timeoutMs = LOOKUP_TIMEOUT_MS
): Promise<string | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const q = new URLSearchParams({ quiz: slug, code: short });
    const res = await fetch(`/api/short?${q}`, { headers: { accept: 'application/json' }, signal: ac.signal });
    if (!res.ok) return null;
    const body = (await res.json()) as { full?: unknown };
    return typeof body?.full === 'string' ? body.full : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

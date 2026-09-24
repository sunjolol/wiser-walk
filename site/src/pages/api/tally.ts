import type { APIRoute } from 'astro';
import { readEnv, type Env } from '../../lib/email/env';
import { projectUrl } from '../../lib/account/checks';
import { getQuiz } from '../../lib/engine/registry';
import { EXAMPLE_CODE, TYPE_KEYS, typeOfCode } from '../../lib/strategies/personality';

/**
 * "How common is your type?" for the Christian Personality Test.
 *
 * GET ?quiz=personality   { total, types: { hearth: n, ... } }: how many finished results there are,
 *                         and how many of each type. The result page asks after it has loaded and
 *                         shows nothing until there are 50 (the owner's rule; population numbers are
 *                         allowed, a percentage between two people never is).
 *
 * WHAT IS COUNTED. Every finished test mints one short link (the runner asks /api/short), and the
 * table short_links is unique on (quiz, long_code), so a result is one row however often it is
 * opened, and a retake with the very same answers counts once. The long code carries the public
 * answers, so the type is worked out here exactly as the result page works it out. Nothing about
 * a person is read: a row is a quiz, a code and a date. The example on the start page is left
 * out (anyone who opens it mints its row).
 *
 * It pages through with PostgREST's Range header, a thousand rows at a time, and stops after two
 * hundred pages. Any failure (no key, no table, a sleeping project, a slow page) answers
 * { total: null } with status 200, and the page says only that the numbers are not ready.
 */
export const prerender = false;

/** Rows per request: PostgREST's usual ceiling on Supabase. */
export const PAGE_SIZE = 1000;
/** Requests at most: 200,000 results, far past the numbers this is for. */
export const MAX_PAGES = 200;
/** One request's deadline, and the whole count's. */
const PAGE_TIMEOUT_MS = 2500;
const TOTAL_TIMEOUT_MS = 9000;

type Fetcher = typeof fetch;

export interface Tally {
  total: number | null;
  types?: Record<string, number>;
}

/**
 * The count for a personality quiz, or { total: null } on any failure. Exported so the engine
 * test can drive it with a fake PostgREST and small pages.
 */
export async function tallyFor(
  slug: string,
  env: Env,
  fetchImpl: Fetcher = fetch,
  pageSize = PAGE_SIZE,
  maxPages = MAX_PAGES
): Promise<Tally> {
  const base = projectUrl(env);
  const secret = (env.SUPABASE_SECRET_KEY ?? '').trim();
  if (!base || !secret) return { total: null };

  const types: Record<string, number> = Object.fromEntries(TYPE_KEYS.map(k => [k, 0]));
  let total = 0;
  const started = Date.now();
  // Ordered by the primary key, so no row moves between pages while they are read.
  const url = `${base}/rest/v1/short_links?quiz=eq.${encodeURIComponent(slug)}&select=long_code&order=code.asc`;

  for (let page = 0; page < maxPages; page++) {
    if (Date.now() - started > TOTAL_TIMEOUT_MS) return { total: null };
    const from = page * pageSize;
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), PAGE_TIMEOUT_MS);
    let rows: unknown;
    try {
      // The secret key goes on the apikey header and never as a bearer token (see checks.ts).
      const res = await fetchImpl(url, {
        headers: { apikey: secret, accept: 'application/json', 'range-unit': 'items', range: `${from}-${from + pageSize - 1}` },
        signal: ac.signal
      });
      // A range that starts past the last row: there is nothing more to read.
      if (res.status === 416) break;
      if (res.status !== 200 && res.status !== 206) return { total: null };
      rows = await res.json();
    } catch {
      return { total: null };
    } finally {
      clearTimeout(timer);
    }
    if (!Array.isArray(rows)) return { total: null };
    for (const row of rows as Array<{ long_code?: unknown }>) {
      const code = typeof row?.long_code === 'string' ? row.long_code.toUpperCase() : '';
      if (!code || code === EXAMPLE_CODE) continue;
      const type = typeOfCode(code);
      if (!type || !(type in types)) continue;
      types[type]!++;
      total++;
    }
    if (rows.length < pageSize) break;
  }
  return { total, types };
}

const json = (status: number, body: unknown, cache: string) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache }
  });

export const GET: APIRoute = async ({ url, locals }) => {
  const slug = url.searchParams.get('quiz') ?? '';
  const quiz = getQuiz(slug);
  if (!quiz || quiz.strategy.shape !== 'personality') {
    return json(400, { total: null, error: 'That quiz keeps no tally.' }, 'no-store');
  }
  const tally = await tallyFor(quiz.slug, readEnv(locals));
  // A failure is kept a minute, so a sleeping project is not asked on every page view.
  if (tally.total === null) return json(200, { total: null }, 'public, s-maxage=60');
  return json(200, tally, 'public, s-maxage=600, stale-while-revalidate=3600');
};

/** Anything else, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });

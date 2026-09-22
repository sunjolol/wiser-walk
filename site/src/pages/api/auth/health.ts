import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { readEnv } from '../../../lib/email/env';
import {
  BUILT_KEY,
  BUILT_URL,
  LOG_KEEP_DAYS,
  TOMBSTONE_KEEP_DAYS,
  bearerFrom,
  projectUrl,
  runChecks
} from '../../../lib/account/checks';

/**
 * Two jobs, one route.
 *
 * GET               every setup check, as JSON, for /account/setup/ to print in plain
 *                   words. It works even when nothing else does, because saying what is
 *                   missing is its whole purpose.
 * GET ?ping=1       the daily keep-alive. A free Supabase project with no traffic for a
 *                   week is PAUSED, and a paused project answers every request with 540:
 *                   sign-in dies for everybody at once and only the owner can restart it.
 *                   So once a day this does one real database read, which is what counts
 *                   as activity, and sweeps two tables while it is there.
 *
 * THE REPORT IS PUBLIC, DELIBERATELY. The owner needs it before anything works, including
 * before there is an account to sign in with, so there is nobody to check it against. Three
 * things make that affordable rather than reckless, and all three are load-bearing:
 *
 *   it is cached      two minutes at the edge, so a loop cannot fan one request out into
 *                     four outbound ones against Supabase and the email provider. The page
 *                     itself is read once, by one person, a handful of times in an evening.
 *   it says little    nothing finer than today / in the last week / not yet, and never the
 *                     reason a provider refused us. See checks.ts, which is where a leak
 *                     would actually be written.
 *   the ping is not   it is no-store, it is throttled, and it takes a secret when there is
 *                     one to take.
 */
export const prerender = false;

/**
 * One real keep-alive per warm instance, per ten minutes.
 *
 * The cron runs it once a day; anything more is somebody holding down refresh, and a
 * cheap 200 is a better answer than a select and two deletes. Module state, so it lasts as
 * long as the instance does: a cold start starts it again, which is the right failure
 * direction for a keep-alive.
 */
export const PING_EVERY_MS = 10 * 60_000;

let lastPingMs = 0;

/**
 * What the pages were BUILT with, which is not the same as what the function can read now.
 *
 * PUBLIC_ values are baked into the pages when the site is built, so keys pasted into the
 * hosting panel afterwards are invisible to the browser until a redeploy. Read literally,
 * because that is the only spelling the build replaces, and compared against the runtime
 * value in checks.ts to produce the one line that says "press Redeploy".
 */
const BUILT_SUPABASE_URL = String(import.meta.env.PUBLIC_SUPABASE_URL ?? '').trim();
const BUILT_SUPABASE_KEY = String(import.meta.env.PUBLIC_SUPABASE_KEY ?? '').trim();

/**
 * The report is cacheable; everything else on this route is not. Thirty seconds, not the
 * two minutes it was: the setup page is read straight after changes made in Supabase,
 * which no redeploy clears, and a stale line reads as a fix that did not work.
 */
const REPORT_CACHE = 'public, s-maxage=30, max-age=0';

const json = (status: number, body: unknown, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache }
  });

/** Constant time, and false rather than a throw when the lengths differ. */
function sameSecret(given: string, want: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

async function ping(base: string, secret: string): Promise<{ read: boolean; trimmed: boolean }> {
  if (!base || !secret) return { read: false, trimmed: false };
  const headers = { apikey: secret, 'content-type': 'application/json', accept: 'application/json' };

  // The read is the whole point of the job: a select is what Supabase counts as activity.
  const read = await fetch(`${base}/rest/v1/auth_email_log?select=webhook_id&limit=1`, { headers })
    .then(r => r.status === 200)
    .catch(() => false);

  const sweep = (path: string) =>
    fetch(`${base}/rest/v1/${path}`, { method: 'DELETE', headers: { ...headers, prefer: 'return=minimal' } })
      .then(r => r.ok)
      .catch(() => false);

  const before = (days: number) => encodeURIComponent(new Date(Date.now() - days * 86_400_000).toISOString());

  // Two tables that only ever grow, swept together. `deleted_at=lt.<date>` cannot match a
  // null, so a result somebody still has is in no danger from the second sweep: only the
  // markers left behind by "clear my results" are old enough and dated enough to match.
  const [log, tombstones] = await Promise.all([
    sweep(`auth_email_log?at=lt.${before(LOG_KEEP_DAYS)}`),
    sweep(`results?deleted_at=lt.${before(TOMBSTONE_KEEP_DAYS)}`)
  ]);

  return { read, trimmed: log && tombstones };
}

export const GET: APIRoute = async ({ request, locals }) => {
  const env = readEnv(locals);
  const url = new URL(request.url);

  if (url.searchParams.get('ping') === '1') {
    // Vercel sends `Authorization: Bearer <CRON_SECRET>` on its own cron calls. Unset, the
    // keep-alive stays open: a keep-alive that quietly stops working is a worse outcome
    // than one a stranger can trigger, and the throttle below bounds what that costs. Set,
    // anybody without it is told the route is not there, rather than that they found it.
    const gate = (env.CRON_SECRET ?? '').trim();
    if (gate && !sameSecret(bearerFrom(request), gate)) {
      return new Response('Not Found', { status: 404, headers: { 'cache-control': 'no-store' } });
    }

    // Claimed before the work, not after, so two calls arriving together cannot both run.
    const now = Date.now();
    if (now - lastPingMs < PING_EVERY_MS) return json(200, { ok: true, skipped: true });
    lastPingMs = now;

    const out = await ping(projectUrl(env), (env.SUPABASE_SECRET_KEY ?? '').trim());
    return json(200, { ok: out.read, ...out });
  }

  const checks = await runChecks(fetch, {
    ...env,
    [BUILT_URL]: BUILT_SUPABASE_URL,
    [BUILT_KEY]: BUILT_SUPABASE_KEY
  });

  return json(
    200,
    {
      ok: checks.every(c => c.state === 'ok'),
      at: new Date().toISOString(),
      checks
    },
    REPORT_CACHE
  );
};

/** Anything but GET, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });

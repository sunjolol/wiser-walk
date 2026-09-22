import type { APIRoute } from 'astro';
import { createHash } from 'node:crypto';
import { readEnv } from '../../../lib/email/env';
import { accountsReady, projectUrl } from '../../../lib/account/checks';
import { headersFrom, readPayload, verifyWebhook } from '../../../lib/account/hook';
import { renderAuthEmail } from '../../../lib/account/emails';
import { sendTransactional } from '../../../lib/email/send';

/**
 * Supabase asking us to send somebody their sign-in email.
 *
 * This is the only route on the site that a stranger's ability to sign in depends on, and
 * it runs on a stopwatch: Supabase gives the whole invocation FIVE SECONDS, cold start
 * included, retries included. It retries a 429 or a 503 only when the answer carries a
 * `retry-after`, and then at once, under a NEW webhook id. Everything here is arranged
 * around that.
 *
 *   it imports almost nothing      a big dependency graph is spent before our first line.
 *   the send gets 3.5s             leaving room for a cold start and the log write.
 *   the log gets the scraps        a quarter of a second to say whether this one has
 *                                  already gone, and a sixth of a second afterwards to
 *                                  write the row. Failing to reach the log never stops an
 *                                  email going out, and never delays the answer: a missing
 *                                  line on a setup page is a far smaller harm than a
 *                                  person who cannot sign in because Supabase gave up
 *                                  waiting on us while we filed our own paperwork.
 *   a busy provider answers 503    with `retry-after`, so Supabase tries again, but only
 *                                  while there is time left for another go. The provider
 *                                  is handed a key made from the token, which is the same
 *                                  on every retry, so a retry can never be a second email.
 *   a refused provider answers 200 with an error Supabase shows the reader, plus a log row
 *                                  saying why, because retrying a permanent failure three
 *                                  times just burns the budget.
 *
 * The arithmetic has to hold when every one of those waits is spent: 250 + 3500 + 150 is
 * 3.9 seconds, which leaves a second of the five for a cold start.
 *
 * It is authenticated by the Standard Webhooks signature and by nothing else. There is no
 * origin check, because Supabase is not a browser and has no origin to check.
 *
 * WHAT SUPABASE READS BACK (supabase/auth, internal/hooks/hookserrors). On a 200 it looks
 * for `{ error: { http_code, message } }` and ignores every other field. An `error` in that
 * shape with a message fails the call that asked for the email, with our message; anything
 * else, including an `error` that is a plain string, counts as handled. Every refusal here
 * was a plain string until 2026-09-22, so a permanent failure used to tell the reader to
 * check an inbox that nothing was coming to.
 */
export const prerender = false;

/** Supabase caps its own payload at 20KB. This is slack, not a policy. */
const MAX_BODY = 32_768;

/**
 * Three deadlines for the log, because the log costs a different amount at each point.
 *
 * It is a convenience throughout: it never gets to be the reason an email did not go, and
 * it never gets to be the reason Supabase gave up waiting on us.
 *
 *   LOG_TIMEOUT_MS        the branches where nothing is being sent, so the budget is ours.
 *   LOG_READ_TIMEOUT_MS   asked before the send, out of the same five seconds the send
 *                         needs. Worth a quarter of a second because it catches the same
 *                         webhook delivered twice. It cannot catch Supabase's own retries,
 *                         which come with new ids; the provider's idempotency key does.
 *   LOG_WRITE_TIMEOUT_MS  written after the send, with the email already gone and a person
 *                         waiting on the answer. The row lands inside a sixth of a second
 *                         or it does not land at all.
 */
const LOG_TIMEOUT_MS = 500;
const LOG_READ_TIMEOUT_MS = 250;
const LOG_WRITE_TIMEOUT_MS = 150;

/**
 * How long this invocation may already have run and still ask Supabase to try again.
 *
 * Supabase retries at once, inside the same five seconds, and a retry that cannot finish
 * in what is left ends in a timeout, which fails the sign-up and throws away the token in
 * every email already sent. A provider that said "busy" quickly leaves room for another
 * go; a send that ran out its 3.5 seconds does not, so that one is answered without
 * `retry-after` and fails at once instead.
 */
const RETRY_ROOM_MS = 1500;

/**
 * The provider's idempotency key: the same for every attempt at one email, and for no other.
 *
 * Supabase marshals the payload once and re-sends those bytes on each retry under a new
 * webhook id, so the webhook id cannot be the key; the token hash can. It is hashed again
 * rather than sent as it is, because the token hash is what the link in the email carries
 * and has no business sitting in another company's logs.
 */
const sendKey = (action: string, tokenHash: string) =>
  createHash('sha256').update(`wiser-walk:${action}:${tokenHash}`).digest('hex');

const json = (status: number, body: unknown, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...extra }
  });

/** The headers every call to our own database carries. The secret key is NEVER a bearer. */
const restHeaders = (secret: string, extra: Record<string, string> = {}) => ({
  apikey: secret,
  'content-type': 'application/json',
  accept: 'application/json',
  ...extra
});

/**
 * A request that is over when the clock says so.
 *
 * The abort signal is sent, but the deadline does not depend on anybody honouring it. A
 * `fetch` that ignores its signal, or a socket that has gone quiet without closing, would
 * otherwise hold this handler open past the five seconds Supabase allows and turn a
 * working email into a failed sign-up. So the clock races the request and wins.
 */
async function withDeadline(run: (signal: AbortSignal) => Promise<Response>, ms: number): Promise<Response | null> {
  const ac = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const asked = (async () => {
    try {
      return await run(ac.signal);
    } catch {
      return null;
    }
  })();
  const clock = new Promise<null>(resolve => {
    timer = setTimeout(() => {
      ac.abort();
      resolve(null);
    }, ms);
  });
  try {
    return await Promise.race([asked, clock]);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Have we already sent this one?
 *
 * Standard Webhooks allows the same delivery to arrive twice under the same webhook id, and
 * this is what stops that becoming two emails. Supabase's own retries come under new ids
 * and are caught by the provider's idempotency key instead (sendKey above). Fails open on
 * purpose: if the log cannot be read, sending twice is better than not sending at all.
 */
async function alreadySent(base: string, secret: string, id: string): Promise<boolean> {
  const res = await withDeadline(
    signal =>
      fetch(`${base}/rest/v1/auth_email_log?select=ok&webhook_id=eq.${encodeURIComponent(id)}`, {
        headers: restHeaders(secret),
        signal
      }),
    LOG_READ_TIMEOUT_MS
  );
  if (!res || res.status !== 200) return false;
  const rows = (await res.json().catch(() => null)) as { ok?: boolean }[] | null;
  return Array.isArray(rows) && rows.length > 0 && rows[0]?.ok === true;
}

/**
 * What happened, for the setup page to read back.
 *
 * NO ADDRESS EVER. The row is the webhook id, the time, which kind of email it was,
 * whether it went and a short reason if it did not. A table of who signed up and when is
 * exactly the thing this site must not build by accident.
 */
async function record(
  base: string,
  secret: string,
  row: { webhook_id: string; action: string; ok: boolean; detail: string },
  ms: number = LOG_TIMEOUT_MS
): Promise<void> {
  await withDeadline(
    signal =>
      fetch(`${base}/rest/v1/auth_email_log?on_conflict=webhook_id`, {
        method: 'POST',
        headers: restHeaders(secret, { prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify([{ ...row, at: new Date().toISOString(), detail: row.detail.slice(0, 200) }]),
        signal
      }),
    ms
  );
}

export const POST: APIRoute = async ({ request, locals }) => {
  const started = Date.now();
  const env = readEnv(locals);
  const secret = (env.SUPABASE_SECRET_KEY ?? '').trim();
  const base = projectUrl(env);

  if (!accountsReady(env) || !(env.SUPABASE_EMAIL_HOOK_SECRET ?? '').trim()) {
    return json(503, { ok: false, error: 'Accounts are not switched on yet.' });
  }

  // The RAW text, signed as it arrived. Parsing first and stringifying back changes bytes
  // and every signature then fails, which is the classic way this check gets broken.
  const raw = await request.text().catch(() => '');
  if (!raw || raw.length > MAX_BODY) return json(400, { ok: false, error: 'Malformed request.' });

  const heads = headersFrom(request);
  if (!verifyWebhook(env.SUPABASE_EMAIL_HOOK_SECRET, heads, raw).ok) {
    return json(401, { ok: false, error: 'Not signed.' });
  }

  const id = (heads.id ?? '').slice(0, 128);
  const canLog = Boolean(base && secret && id);

  let parsed: unknown = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  const payload = readPayload(parsed);
  if (!payload) {
    // Answer "handled". A shape we do not understand must never be able to stop somebody
    // signing in, and the setup page is where it gets said out loud. The likeliest shape is
    // one of Supabase's security notices ("your password was changed"), which carry no
    // token and which this site does not send.
    if (canLog) await record(base, secret, { webhook_id: id, action: 'unknown', ok: false, detail: 'payload not understood' });
    return json(200, { ok: false, skipped: 'Payload not understood.' });
  }

  if (canLog && (await alreadySent(base, secret, id))) {
    return json(200, { ok: true, already: true });
  }

  // The link in a real email always goes to the live site, whatever host this request
  // arrived on. Only a local `astro dev` run links to itself, so its emails can be clicked.
  // The request's own host was used here until 2026-09-22, and on Vercel that host read as
  // https://localhost (see `security` in astro.config.mjs): every link would have opened
  // the reader's own computer.
  const mail = renderAuthEmail({
    action: payload.action,
    tokenHash: payload.tokenHash,
    token: payload.token,
    origin: import.meta.env?.DEV ? new URL(request.url).origin : undefined
  });
  if (!mail) {
    if (canLog) {
      await record(base, secret, {
        webhook_id: id,
        action: payload.action,
        ok: false,
        detail: 'this site does not send email for that action'
      });
    }
    // Handled, with nothing sent. The site never asks for these (email change, invite,
    // reauthentication), so there is no reader waiting on one.
    return json(200, { ok: false, skipped: 'Unhandled action type.' });
  }

  const sent = await sendTransactional(env, {
    to: payload.email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    tag: payload.action,
    idempotencyKey: sendKey(payload.action, payload.tokenHash)
  });

  if (canLog) {
    // The email has gone. This row is for the setup page, and the setup page can wait: the
    // answer to Supabase goes out at the end of this line whether or not it landed.
    await record(
      base,
      secret,
      {
        webhook_id: id,
        action: payload.action,
        ok: sent.ok,
        detail: sent.ok ? `sent by ${sent.via}` : `${sent.via}: ${sent.detail}`
      },
      LOG_WRITE_TIMEOUT_MS
    );
  }

  if (sent.ok) return json(200, { ok: true });
  // 503 is one of the two statuses Supabase retries, and only when `retry-after` is present
  // and not empty (it reads nothing else from it). A permanent refusal gets a 200, because
  // three more attempts would end the same way, with an error Supabase can read: the reader
  // is told it failed, rather than told to check an inbox that nothing is coming to.
  if (sent.retryable) {
    const again = Date.now() - started < RETRY_ROOM_MS ? { 'retry-after': '1' } : {};
    return json(503, { ok: false, error: 'The email service is busy.' }, again);
  }
  return json(200, { ok: false, error: { http_code: 500, message: 'The email did not go out.' } });
};

/** Anything but POST, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

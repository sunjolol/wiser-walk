import type { APIRoute } from 'astro';
import { readEnv } from '../../../lib/email/env';
import { getProvider } from '../../../lib/email/provider';
import { accountsReady, bearerFrom, projectUrl, sameOrigin, whoIs } from '../../../lib/account/checks';

/**
 * Deleting the account, and meaning it.
 *
 * The page says one button deletes everything, so this deletes everything: the user row,
 * and with it every saved result and game score, because the tables hang off it with
 * `on delete cascade`; and the contact on the mailing list, which is the part a site that
 * wanted to keep marketing to somebody would quietly leave behind.
 *
 * Which user is decided by the TOKEN, never by the body. That is the whole security of
 * this route, and it is why the address and the id both come out of Supabase's own answer
 * about who the bearer is.
 *
 * Deleting the row does not sign anybody out: their access token keeps working until it
 * expires. The page signs them out locally afterwards.
 */
export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

export const POST: APIRoute = async ({ request, url, locals }) => {
  const env = readEnv(locals);
  const base = projectUrl(env);
  const secret = (env.SUPABASE_SECRET_KEY ?? '').trim();

  if (!accountsReady(env)) return json(503, { ok: false, error: 'Accounts are not switched on yet.' });
  if (!sameOrigin(request, url)) return json(403, { ok: false, error: 'Bad origin.' });

  const who = await whoIs(fetch, env, bearerFrom(request));
  if (!who) return json(401, { ok: false, error: 'Log in first.' });

  if (!secret) {
    // Never pretend. Somebody asking to be forgotten and being told "done" when nothing
    // happened is the worst outcome this route has.
    return json(503, { ok: false, error: 'Deleting accounts is not switched on yet. Nothing was deleted.' });
  }

  let res: Response | null = null;
  try {
    res = await fetch(`${base}/auth/v1/admin/users/${encodeURIComponent(who.id)}`, {
      method: 'DELETE',
      // The secret key goes on the apikey header. Sent as a bearer token it is read as a
      // JWT, fails to parse, and the request is refused.
      headers: { apikey: secret, accept: 'application/json' }
    });
  } catch {
    res = null;
  }

  if (!res) return json(503, { ok: false, error: 'We could not reach your account just now. Nothing was deleted.' });
  // 404 means it is already gone, which is the state that was asked for.
  if (!(res.ok || res.status === 404)) {
    if (res.status === 401 || res.status === 403) {
      return json(500, { ok: false, error: 'This is our fault, not yours. Nothing was deleted.' });
    }
    return json(503, { ok: false, error: 'That did not go through. Nothing was deleted.' });
  }

  // The list is a separate service and can fail separately. The account is genuinely gone
  // either way, so the answer says which half did not happen rather than calling the whole
  // thing a failure.
  //
  // `listRemoved` answers one question and only sends a word it can stand behind:
  //
  //   true       an address really came off a real list.
  //   false      a real list was asked and refused. The page then tells them so, and points
  //              at the unsubscribe link in any email from us.
  //   not sent   there is no list. No key is set, or this is preview mode, so the console
  //              stand-in is in charge: it subscribed nobody in the first place and it says
  //              so in the log rather than pretending. Sending `false` here would have the
  //              page tell somebody their address may still be sitting on a mailing list
  //              that does not exist, and send them hunting for an unsubscribe link in
  //              emails that were never sent. Nothing was left behind, so nothing is said.
  //              The page reads a missing field as "no problem", which is the true reading.
  const provider = getProvider(env);
  const off = await provider.deleteContact(who.email);
  if (provider.id === 'console') return json(200, { ok: true });
  return json(200, { ok: true, listRemoved: off.ok });
};

/** Anything but POST, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

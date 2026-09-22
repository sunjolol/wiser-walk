import type { APIRoute } from 'astro';
import { readEnv } from '../../../lib/email/env';
import { getProvider, isConfigured } from '../../../lib/email/provider';
import { accountsReady, bearerFrom, projectUrl, sameOrigin, whoIs } from '../../../lib/account/checks';

/**
 * The notes: on or off.
 *
 * Called twice in a person's life, usually. Once the moment they finish setting a password,
 * which is the first point at which their address is genuinely theirs and confirmed, and
 * again if they ever turn the notes off on /account/.
 *
 * The address is taken from the TOKEN, never from the body. Reading it out of the body
 * would let anyone holding any valid token put anyone else's address on a mailing list, or
 * take it off one. The body carries a single boolean and nothing else that matters.
 *
 * Waiting until the password is set is deliberate: the list then holds only addresses
 * somebody has proved they can open, which is better for us, better for the people on it,
 * and leaves an abandoned sign-up with no trace anywhere.
 */
export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

/**
 * When the list was last told about this person, recorded where they cannot write it.
 *
 * Best effort. Somebody's notes being on is a fact about the mailing list, not about this
 * column, and failing to stamp it must never look to the reader like the switch did not
 * work.
 */
async function stamp(base: string, secret: string, userId: string): Promise<void> {
  if (!base || !secret) return;
  try {
    await fetch(`${base}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      // The secret key goes on the apikey header and never as a bearer token.
      headers: {
        apikey: secret,
        'content-type': 'application/json',
        accept: 'application/json',
        prefer: 'return=minimal'
      },
      body: JSON.stringify({ list_synced_at: new Date().toISOString() })
    });
  } catch {
    /* the switch still did what it said it would */
  }
}

export const POST: APIRoute = async ({ request, url, locals }) => {
  const env = readEnv(locals);

  if (!accountsReady(env)) return json(503, { ok: false, error: 'Accounts are not switched on yet.' });
  if (!isConfigured(env) && env.PROD) return json(503, { ok: false, error: 'Sign-up is not switched on yet.' });

  // Astro's own origin check lets a JSON body through from any origin, so this is written
  // here rather than assumed. Combined with a token that no cross-site request can reach,
  // it closes the question.
  if (!sameOrigin(request, url)) return json(403, { ok: false, error: 'Bad origin.' });

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'Malformed request.' });
  }

  // The same honeypot the result-page form uses: a field people never see and naive bots
  // cannot resist. It gets the cheerful answer, so a bot learns nothing from the reply.
  if (typeof payload.website === 'string' && payload.website.length > 0) {
    return json(200, { ok: true });
  }

  const who = await whoIs(fetch, env, bearerFrom(request));
  if (!who) return json(401, { ok: false, error: 'Log in first.' });

  const on = payload.on !== false;
  const provider = getProvider(env);
  const outcome = on
    ? await provider.subscribe({ email: who.email, source: 'account' })
    : await provider.removeFromList(who.email);

  if (!outcome.ok) {
    return json(outcome.retryable ? 503 : 400, { ok: false, error: outcome.message });
  }

  await stamp(projectUrl(env), (env.SUPABASE_SECRET_KEY ?? '').trim(), who.id);
  return json(200, { ok: true, on });
};

/** Anything but POST, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

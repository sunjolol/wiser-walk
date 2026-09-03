import type { APIRoute } from 'astro';
import { getProvider, isConfigured, looksLikeEmail } from '../../lib/email/provider';
import { readEnv } from '../../lib/email/env';
import { getQuiz, decodeFor, resultFor } from '../../lib/engine/registry';

/** The only route on the site that talks to anything outside the browser. */
export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = readEnv(locals);

  if (!isConfigured(env) && env.PROD) {
    // Better to refuse loudly than to accept an address and drop it on the floor.
    return json(503, { ok: false, error: 'Sign-up is not switched on yet.' });
  }

  // Two callers: fetch() from the result page, and a plain form POST when JavaScript is
  // off. The result page is server-rendered, so someone can reach it without ever having
  // run the quiz — a shared link — and the form should still work for them.
  const asForm = !(request.headers.get('content-type') ?? '').includes('application/json');

  let payload: Record<string, unknown>;
  try {
    payload = asForm
      ? Object.fromEntries(await request.formData())
      : await request.json();
  } catch {
    return json(400, { ok: false, error: 'Malformed request.' });
  }

  /** No-JS replies are a redirect back to the result page, with the outcome in the query. */
  const back = (status: 'ok' | 'already' | 'error', message?: string) => {
    const to = typeof payload.back === 'string' && payload.back.startsWith('/')
      ? payload.back
      : '/';
    const url = new URL(to, request.url);
    url.searchParams.set('sub', status);
    if (message) url.searchParams.set('why', message);
    return new Response(null, { status: 303, headers: { location: url.pathname + url.search } });
  };

  // Honeypot: a field hidden from people and irresistible to naive bots. Anything in it
  // gets the same cheerful answer a person gets, so a bot learns nothing from the response.
  if (typeof payload.website === 'string' && payload.website.length > 0) {
    return asForm ? back('ok') : json(200, { ok: true });
  }

  const email = payload.email;
  if (!looksLikeEmail(email)) {
    const msg = 'That does not look like an email address.';
    return asForm ? back('error', msg) : json(400, { ok: false, error: msg });
  }

  // The quiz slug and code are echoed back by the page, so validate them rather than
  // trusting them: an unvalidated code would let anyone write arbitrary text into a
  // subscriber field on the mailing list.
  const quizSlug = typeof payload.quiz === 'string' ? payload.quiz : undefined;
  const rawCode = typeof payload.code === 'string' ? payload.code.toUpperCase() : undefined;

  const quiz = quizSlug ? getQuiz(quizSlug) : undefined;
  const values = quiz && rawCode ? decodeFor(quiz, rawCode) : null;
  const result = quiz && values ? resultFor(quiz, values) : null;

  const outcome = await getProvider(env).subscribe({
    email: email.trim(),
    quiz: quiz?.slug,
    code: result ? result.code : undefined,
    headline: result?.headline
  });

  if (outcome.ok) {
    return asForm
      ? back(outcome.already ? 'already' : 'ok')
      : json(200, { ok: true, already: outcome.already });
  }
  return asForm
    ? back('error', outcome.message)
    : json(outcome.retryable ? 503 : 400, { ok: false, error: outcome.message });
};

/** Anything but POST, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

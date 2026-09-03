import type { APIRoute } from 'astro';
import { getProvider, isConfigured, looksLikeEmail } from '../../lib/email/provider';
import { getQuiz, decodeFor, resultFor } from '../../lib/engine/registry';

/** The only route on the site that talks to anything outside the browser. */
export const prerender = false;

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }
  });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = { ...process.env, ...((locals as any)?.runtime?.env ?? {}) } as Record<
    string,
    string | undefined
  >;

  if (!isConfigured(env) && env.NODE_ENV === 'production') {
    // Better to refuse loudly than to accept an address and drop it on the floor.
    return json(503, { ok: false, error: 'Sign-up is not switched on yet.' });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return json(400, { ok: false, error: 'Malformed request.' });
  }

  // Honeypot: a field hidden from people and irresistible to naive bots. Anything in it
  // gets the same cheerful answer a person gets, so a bot learns nothing from the response.
  if (typeof payload.website === 'string' && payload.website.length > 0) {
    return json(200, { ok: true });
  }

  const email = payload.email;
  if (!looksLikeEmail(email)) {
    return json(400, { ok: false, error: "That does not look like an email address." });
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

  if (outcome.ok) return json(200, { ok: true, already: outcome.already });
  return json(outcome.retryable ? 503 : 400, { ok: false, error: outcome.message });
};

/** Anything but POST, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

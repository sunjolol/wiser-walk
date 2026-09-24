import type { APIRoute } from 'astro';
import { readEnv } from '../../lib/email/env';
import { sameOrigin } from '../../lib/account/checks';
import { getQuiz } from '../../lib/engine/registry';
import { mintShortCode, resolveCode } from '../../lib/engine/links';

/**
 * Short result links (see lib/engine/links.ts).
 *
 * POST {quiz, code}      the six-character code for a finished result, made if it is new.
 *                        400 unless the code decodes for that quiz and the quiz uses short
 *                        links; 503 when there is no table or no key yet.
 * GET ?quiz=&code=       the long code behind any public form, for the runner's ?with=.
 *
 * Nothing here is about a person. A row is a quiz, a result code and a date, the same code
 * that is already in the long link, with nobody attached to it.
 *
 * Every failure is soft on purpose. The caller has the long code in hand and simply uses
 * it, so a missing table or a sleeping project costs a longer link and nothing else.
 */
export const prerender = false;

const json = (status: number, body: unknown, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': cache }
  });

export const POST: APIRoute = async ({ request, url, locals }) => {
  // Only the site's own pages make links. A script elsewhere could still send this header,
  // but a page on another site cannot make a reader's browser fill the table.
  if (!sameOrigin(request, url)) return json(403, { error: 'Bad origin.' });

  let payload: Record<string, unknown>;
  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return json(400, { error: 'Malformed request.' });
  }

  const quiz = getQuiz(typeof payload.quiz === 'string' ? payload.quiz : undefined);
  const code = typeof payload.code === 'string' ? payload.code.trim().toUpperCase() : '';
  if (!quiz || !quiz.shortLinks) return json(400, { error: 'That quiz has no short links.' });
  if (!code || code.length > 96 || !quiz.strategy.decode(quiz, code)) {
    return json(400, { error: 'That is not a result of this quiz.' });
  }

  const short = await mintShortCode(quiz, code, readEnv(locals));
  if (!short) return json(503, { error: 'Short links are not switched on yet.' });
  return json(200, { short });
};

export const GET: APIRoute = async ({ url, locals }) => {
  const quiz = getQuiz(url.searchParams.get('quiz') ?? undefined);
  const raw = url.searchParams.get('code') ?? '';
  if (!quiz) return json(404, { error: 'No such quiz.' });

  const full = await resolveCode(quiz, raw, readEnv(locals));
  if (!full) return json(404, { error: 'No such result.' });
  // A short code never changes what it points at, so an answer can be kept a long time.
  return json(200, { full }, 'public, max-age=86400, s-maxage=86400');
};

/** Anything else, answered properly rather than as a 404 from the catch-all. */
export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });

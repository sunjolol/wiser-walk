import type { APIRoute } from 'astro';
import { readEnv } from '../../lib/email/env';
import { sameOrigin } from '../../lib/account/checks';
import { getQuiz, resultFor } from '../../lib/engine/registry';
import { leadFor } from '../../lib/engine/types';
import { logResult } from '../../lib/engine/links';

/**
 * The results log (the owner, 2026-09-26): every finished quiz, kept anonymously in the table
 * quiz_results, so the site can be learned from and mistakes found without anyone sending a link.
 *
 * POST {quiz, code, answers?, from?, device?}, sent once by Base.astro when a runner says
 * "ww:finished". The code must decode for its quiz; the line the result leads with ("Closest to
 * Peter", "The Spark") is worked out here from the code, so no page has to send it.
 *
 * What is never here: a name, an address, an account, an IP address, the Personality Test's twelve
 * private answers (its code never holds them) or the Psalm quiz's taps (its runner sends only the
 * psalm). Every failure is soft and silent: a finish never waits on this.
 */
export const prerender = false;

const status = (n: number) => new Response(null, { status: n, headers: { 'cache-control': 'no-store' } });

export const POST: APIRoute = async ({ request, url, locals }) => {
  if (!sameOrigin(request, url)) return status(403);
  let p: Record<string, unknown>;
  try {
    p = JSON.parse(await request.text()) as Record<string, unknown>;
  } catch {
    return status(400);
  }
  const quiz = getQuiz(typeof p.quiz === 'string' ? p.quiz : undefined);
  const code = typeof p.code === 'string' ? p.code.trim().toUpperCase() : '';
  if (!quiz || !/^[0-9A-Z]{1,96}$/.test(code)) return status(400);
  const values = quiz.strategy.decode(quiz, code);
  if (!values) return status(400);

  let result: string | null = null;
  try {
    const view = resultFor(quiz, values) as unknown as Record<string, any>;
    const line = leadFor(quiz, view as any)?.short ?? view?.headline ?? view?.report?.typeName ?? view?.report?.type ?? null;
    result = typeof line === 'string' ? line.slice(0, 160) : null;
  } catch {
    result = null;
  }
  const answers = typeof p.answers === 'string' && /^[0-9,-]{1,400}$/.test(p.answers) ? p.answers : null;
  const from = typeof p.from === 'string' ? p.from.toLowerCase() : '';
  const device = typeof p.device === 'string' && ['phone', 'tablet', 'computer'].includes(p.device) ? p.device : null;

  await logResult(
    {
      quiz: quiz.slug,
      code,
      result,
      answers,
      cameFrom: /^[a-z0-9.-]{1,80}$/.test(from) ? from : null,
      device
    },
    readEnv(locals)
  );
  return status(204);
};

export const ALL: APIRoute = () =>
  new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

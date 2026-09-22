/**
 * Sending one email to one person, as opposed to putting an address on a list.
 *
 * provider.ts next door does contacts: it tells a marketing service that somebody exists.
 * This file does the other half, and it exists because accounts need a message to arrive
 * in a stranger's inbox within seconds or nobody can sign in. The two are separate because
 * they fail differently and are allowed to fail differently: a mailing-list write that
 * does not go through is a nuisance, a sign-in email that does not go through is the whole
 * feature.
 *
 * WHICH SERVICE, first match wins:
 *
 *   EMAIL_PREVIEW=1   the console. Sends nothing, says so in the log, reports success so a
 *                     local run can exercise the flow without mailing anybody.
 *   RESEND_API_KEY    Resend. Not set up today; wired because the one thing this site must
 *                     never be is stuck with a provider that has stopped working.
 *   BREVO_API_KEY     Brevo, the same key and the same account as the mailing list.
 *   nothing           an honest failure. Never a quiet success.
 *
 * The deadline is 3500ms, not the 8000ms the contacts code uses, because this runs inside
 * a webhook Supabase gives FIVE SECONDS in total, cold start included. Going over does not
 * make the email late, it makes Supabase treat the whole thing as failed.
 */
import { postJson } from './provider';
import type { Env } from './env';

/** Comfortably inside the hook's five seconds, with room for the log write after it. */
export const SEND_TIMEOUT_MS = 3500;

/** Who the account emails come from, unless the environment says otherwise. */
export const DEFAULT_FROM = 'Wiser Walk <account@wiserwalk.com>';

export interface Mail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** A word for the logs, e.g. `signup`. Rides along as a provider tag. */
  tag?: string;
  /** The same for every attempt at one email, so a retried delivery cannot become a second one. */
  idempotencyKey?: string;
}

export type SendOutcome =
  | { ok: true; id: string; via: string }
  /** `detail` is safe to store: a status and the provider's own error word, nothing else. */
  | { ok: false; retryable: boolean; detail: string; via: string };

/** `Wiser Walk <account@wiserwalk.com>` split into the two fields Brevo wants. */
export function splitFrom(value: string): { name: string; email: string } {
  const raw = (value || '').trim();
  const open = raw.lastIndexOf('<');
  const close = raw.lastIndexOf('>');
  if (open > -1 && close > open) {
    return { name: raw.slice(0, open).trim().replace(/^"|"$/g, ''), email: raw.slice(open + 1, close).trim() };
  }
  return { name: '', email: raw };
}

/** Which service is set up, without saying anything about the key itself. */
export function senderId(env: Env): 'console' | 'resend' | 'brevo' | 'none' {
  if (env.EMAIL_PREVIEW === '1') return 'console';
  if (env.RESEND_API_KEY?.trim()) return 'resend';
  if (env.BREVO_API_KEY?.trim()) return 'brevo';
  return 'none';
}

/**
 * A provider's own error word, and only that.
 *
 * The full message is not stored anywhere, because a provider's 400 routinely quotes the
 * address it just refused and the log this ends up in is designed to hold no addresses at
 * all. The word on its own is what the owner needs: `account_under_validation` and
 * `not_enough_credits` are two different afternoons.
 */
function errorWord(body: unknown): string {
  const b = (body ?? {}) as Record<string, unknown>;
  for (const field of ['code', 'name', 'error']) {
    const value = b[field];
    if (typeof value === 'string' && /^[a-z0-9_.-]{1,48}$/i.test(value)) return value;
  }
  return 'no code';
}

const readJson = (res: Response): Promise<unknown> => res.json().catch(() => null);

/** Send one message. Never throws; always resolves to something the caller can store. */
export async function sendTransactional(env: Env, msg: Mail): Promise<SendOutcome> {
  const via = senderId(env);
  const from = splitFrom(env.ACCOUNT_EMAIL_FROM?.trim() || DEFAULT_FROM);
  const tag = msg.tag || 'auth';

  if (via === 'console') {
    // No address in the line: this is a server log, and the point of the preview provider
    // is that nothing about a person leaves the machine, logs included.
    console.log(`[account-email] preview only, NOT sent. kind=${tag} subject=${JSON.stringify(msg.subject)}`);
    return { ok: true, id: 'preview', via };
  }

  if (via === 'none') {
    return { ok: false, retryable: false, detail: 'no email service is configured', via };
  }

  if (via === 'resend') {
    const res = await postJson(
      'https://api.resend.com/emails',
      {
        // The key is a header value and nothing else. It is never in a URL, never in a
        // body, never in a log line and never in an error we hand back.
        authorization: `Bearer ${env.RESEND_API_KEY!.trim()}`,
        ...(msg.idempotencyKey ? { 'idempotency-key': msg.idempotencyKey } : {})
      },
      {
        from: from.name ? `${from.name} <${from.email}>` : from.email,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        tags: [
          { name: 'purpose', value: 'auth' },
          { name: 'kind', value: tag }
        ]
      },
      SEND_TIMEOUT_MS
    );
    if (!res) return { ok: false, retryable: true, detail: 'could not reach the email service', via };
    if (res.status === 200 || res.status === 201) {
      const body = (await readJson(res)) as { id?: string } | null;
      return { ok: true, id: body?.id ?? '', via };
    }
    return { ok: false, ...classify(res.status, await readJson(res)), via };
  }

  const res = await postJson(
    'https://api.brevo.com/v3/smtp/email',
    { 'api-key': env.BREVO_API_KEY!.trim() },
    {
      sender: from.name ? { email: from.email, name: from.name } : { email: from.email },
      to: [{ email: msg.to }],
      subject: msg.subject,
      htmlContent: msg.html,
      textContent: msg.text,
      tags: ['auth', tag]
    },
    SEND_TIMEOUT_MS
  );
  if (!res) return { ok: false, retryable: true, detail: 'could not reach the email service', via };
  // 201 is sent, 202 is scheduled. 200 is not documented for this endpoint and is accepted
  // anyway rather than reporting a failure for a message that went.
  if (res.status === 200 || res.status === 201 || res.status === 202) {
    const body = (await readJson(res)) as { messageId?: string } | null;
    return { ok: true, id: body?.messageId ?? '', via };
  }
  return { ok: false, ...classify(res.status, await readJson(res)), via };
}

/**
 * Worth trying again, or not?
 *
 * This decides what Supabase is told. A retryable failure answers 503, which is one of the
 * two statuses Supabase retries; a permanent one answers 200 and a log row, because
 * retrying a refused key three times just spends the budget and still fails.
 */
function classify(status: number, body: unknown): { retryable: boolean; detail: string } {
  const word = errorWord(body);
  if (status === 429 || status >= 500) return { retryable: true, detail: `${status} ${word}` };
  // A 403 is not always the key. Resend answers 403 for a From address on a domain it has
  // not verified, and calling that "key refused" would send the owner off to replace a key
  // that works, so a 403 keeps the provider's own word unless the word is about the key.
  if (status === 401 || word === 'invalid_api_key' || word === 'unauthorized') {
    return { retryable: false, detail: `${status} key refused` };
  }
  return { retryable: false, detail: `${status} ${word}` };
}

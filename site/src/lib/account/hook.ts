/**
 * The Send Email hook, verified.
 *
 * Supabase does not send our account emails; it asks us to. It POSTs the address, the
 * one-time token and what the token is for to /api/auth/email, signed as a Standard
 * Webhook. Everything in this file exists to answer one question before a single byte
 * leaves for the email provider: did Supabase really send this?
 *
 * It is written against `node:crypto` rather than the `standardwebhooks` package on
 * purpose. The hook has a FIVE SECOND budget for the whole invocation including retries,
 * and that budget is spent on a cold start before our code runs at all, so the handler and
 * everything it drags in have to stay small. Twenty lines of HMAC under test is a smaller
 * surface than a dependency, and the vectors in scripts/auth-test.mjs are what make that
 * claim honest.
 *
 * Nothing here touches the network and nothing here throws. A verdict is always returned,
 * and a bad one carries a short reason that is safe to log: it never contains the secret,
 * the signature, the body or anybody's address.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Five minutes either side of now.
 *
 * The timestamp is what stops a signature captured once from being replayed for ever.
 * Standard Webhooks names five minutes and Supabase retries for at most a few seconds, so
 * this is generous already; clock skew on a serverless host is the only reason it is not
 * tighter.
 */
export const TOLERANCE_S = 300;

/** The three headers Standard Webhooks signs with, however the sender spells them. */
export interface HookHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

export interface Verdict {
  ok: boolean;
  /** Safe to log and safe to count. Never carries the secret, the body or an address. */
  why: string;
}

/** Pull the signing headers off a request, accepting either spelling of the prefix. */
export function headersFrom(request: { headers: Headers }): HookHeaders {
  const h = request.headers;
  return {
    id: h.get('webhook-id') ?? h.get('svix-id'),
    timestamp: h.get('webhook-timestamp') ?? h.get('svix-timestamp'),
    signature: h.get('webhook-signature') ?? h.get('svix-signature')
  };
}

/**
 * The secret as bytes.
 *
 * Supabase shows it as `v1,whsec_<base64>` and the owner is told to paste the whole thing,
 * because asking a non-expert to snip a prefix off a secret is asking for a truncated
 * secret. Both prefixes come off here instead, and what is left is base64 that decodes to
 * the actual key. Returns null when there is nothing usable, so a missing secret can never
 * be mistaken for an empty one that happens to verify.
 */
export function secretBytes(raw: string | undefined | null): Buffer | null {
  let s = (raw ?? '').trim();
  if (!s) return null;
  if (s.startsWith('v1,')) s = s.slice(3);
  if (s.startsWith('whsec_')) s = s.slice(6);
  if (!s) return null;
  const bytes = Buffer.from(s, 'base64');
  return bytes.length ? bytes : null;
}

/** The signature Standard Webhooks expects over `<id>.<timestamp>.<body>`, base64. */
export function sign(secret: Buffer, id: string, timestamp: string, body: string): string {
  return createHmac('sha256', secret).update(`${id}.${timestamp}.${body}`).digest('base64');
}

/** Constant time, and false rather than a throw when the lengths differ. */
function sameBytes(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

/**
 * Is this really from Supabase?
 *
 * The body must be the RAW text of the request. Parsing it first and stringifying it back
 * changes bytes (key order, spacing, escapes) and every signature then fails, which is the
 * classic way this check is broken by an innocent refactor.
 */
export function verifyWebhook(
  rawSecret: string | undefined | null,
  headers: HookHeaders,
  body: string,
  nowMs: number = Date.now()
): Verdict {
  const secret = secretBytes(rawSecret);
  if (!secret) return { ok: false, why: 'no hook secret is set' };

  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return { ok: false, why: 'a signing header is missing' };

  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return { ok: false, why: 'the timestamp is not a number' };
  const driftS = Math.abs(nowMs / 1000 - seconds);
  if (driftS > TOLERANCE_S) return { ok: false, why: 'the timestamp is too old or too far ahead' };

  const want = Buffer.from(sign(secret, id, timestamp, body), 'base64');

  // The header may carry several signatures separated by spaces, because a secret being
  // rotated is signed with both the old key and the new one for a while. Any one of them
  // matching is a pass; entries for a version we do not know are ignored, not rejected.
  let matched = false;
  let sawV1 = false;
  for (const part of signature.split(' ')) {
    const at = part.indexOf(',');
    if (at < 1) continue;
    if (part.slice(0, at) !== 'v1') continue;
    sawV1 = true;
    if (sameBytes(want, Buffer.from(part.slice(at + 1), 'base64'))) matched = true;
  }
  if (!sawV1) return { ok: false, why: 'the signature header has no v1 entry' };
  return matched ? { ok: true, why: 'signed' } : { ok: false, why: 'no signature matched' };
}

/** What we actually need out of the hook's payload, and nothing else. */
export interface HookPayload {
  /** Where the email goes. Held only long enough to send it; never written to a log. */
  email: string;
  /** `signup`, `magiclink`, `recovery`, or something we do not handle. */
  action: string;
  /** The six-digit code printed in the email beside the button. May be absent. */
  token: string;
  /** The hash that goes in the link, and the only thing the password page needs. */
  tokenHash: string;
}

const TIDY = (v: unknown) => (typeof v === 'string' ? v.trim() : '');

/**
 * The payload, made safe or refused.
 *
 * Refusing is the right answer for a shape we do not recognise: the alternative is an
 * email built out of half-understood fields, sent to whatever ended up in the address
 * slot. The caller turns a null into a logged line rather than a send.
 */
export function readPayload(raw: unknown): HookPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const body = raw as { user?: unknown; email_data?: unknown };

  const user = (body.user ?? {}) as Record<string, unknown>;
  const data = (body.email_data ?? {}) as Record<string, unknown>;

  const email = TIDY(user.email);
  const action = TIDY(data.email_action_type);
  const tokenHash = TIDY(data.token_hash);
  const token = TIDY(data.token);

  // Loose on purpose, the same way looksLikeEmail() is loose in the mailing-list code: the
  // address came from Supabase, which already accepted it, and the only job here is to
  // refuse what is obviously not one.
  if (!email || email.length > 254 || !email.includes('@')) return null;
  if (!action || action.length > 64) return null;
  if (!tokenHash || tokenHash.length > 256) return null;

  return { email, action, tokenHash, token: /^\d{4,8}$/.test(token) ? token : '' };
}

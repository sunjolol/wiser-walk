/**
 * Email capture, behind one small interface.
 *
 * The offer is deliberate: a reader's result link is already free and already in their URL
 * bar, so "we'll email you your result" converts badly and would be close to dishonest.
 * What is actually worth an address is the follow-up — a short series that unpacks the
 * axes the reader leaned hardest on, using the history and passages already written for
 * the axis pages. That series needs to know the result, which is why `code` and `quiz`
 * travel with the address.
 *
 * That is a real change to the site's privacy story and the copy says so out loud: quiz
 * answers still never leave the browser, but a reader who chooses to subscribe is sending
 * their address and their result code to an email provider. See /about and /method.
 */

export interface Subscription {
  email: string;
  /** Which quiz produced the result, so the series can be quiz-specific. */
  quiz?: string;
  /** The permalink code. Carries the scores; nothing else identifies the reader. */
  code?: string;
  /** Plain-language summary of the result, so a mail template need not decode anything. */
  headline?: string;
}

export type SubscribeOutcome =
  | { ok: true; already: boolean }
  | { ok: false; retryable: boolean; message: string };

export interface EmailProvider {
  readonly id: string;
  subscribe(sub: Subscription): Promise<SubscribeOutcome>;
}

/**
 * MailerLite, current API (connect.mailerlite.com). Two settings live in the MailerLite
 * account rather than here, and both must be checked once before this goes live:
 *
 *   1. DOUBLE OPT-IN must be enabled, or subscribers created here are live immediately and
 *      the "confirm your address" copy on the form becomes untrue.
 *   2. API access must be enabled for the account/plan; if it is not, this returns a
 *      non-retryable error and the form says so rather than silently swallowing addresses.
 */
function mailerlite(apiKey: string, groupId?: string): EmailProvider {
  return {
    id: 'mailerlite',
    async subscribe(sub) {
      const body: Record<string, unknown> = {
        email: sub.email,
        fields: {
          // Custom fields must exist in MailerLite with these exact names, or MailerLite
          // ignores them. Creating them is a one-time setup step, documented in the README.
          quiz: sub.quiz ?? '',
          result_code: sub.code ?? '',
          result_headline: sub.headline ?? ''
        }
      };
      if (groupId) body.groups = [groupId];

      let res: Response;
      try {
        res = await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            accept: 'application/json',
            authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(body)
        });
      } catch {
        return { ok: false, retryable: true, message: 'Could not reach the email service.' };
      }

      // 200 is an existing subscriber updated; 201 is a new one.
      if (res.status === 200) return { ok: true, already: true };
      if (res.status === 201) return { ok: true, already: false };

      if (res.status === 422) {
        // MailerLite's validation, e.g. an address it will not accept.
        return { ok: false, retryable: false, message: 'That address was not accepted.' };
      }
      if (res.status === 429 || res.status >= 500) {
        return { ok: false, retryable: true, message: 'The email service is busy. Try again shortly.' };
      }
      if (res.status === 401 || res.status === 403) {
        // A misconfiguration on our side, not the reader's. Never blame the reader for it.
        return { ok: false, retryable: false, message: 'Sign-up is misconfigured. This is our fault, not yours.' };
      }
      return { ok: false, retryable: false, message: 'Sign-up failed.' };
    }
  };
}

/**
 * Development fallback. Deliberately does NOT pretend to have subscribed anyone: it says
 * so in the server log and reports success only so the UI can be exercised locally.
 */
const consoleProvider: EmailProvider = {
  id: 'console',
  async subscribe(sub) {
    console.log(
      `[email] no provider configured — NOT subscribed. quiz=${sub.quiz ?? '-'} code=${sub.code ?? '-'}`
    );
    return { ok: true, already: false };
  }
};

/**
 * Picks the provider from the environment at request time, not at build time: Vercel
 * injects env vars into the function, and reading them during the static build would bake
 * in whatever the build machine happened to have.
 */
export function getProvider(env: Record<string, string | undefined>): EmailProvider {
  const key = env.MAILERLITE_API_KEY?.trim();
  if (key) return mailerlite(key, env.MAILERLITE_GROUP_ID?.trim() || undefined);
  return consoleProvider;
}

/** True when a real provider is wired up — the form asks so it can hide rather than lie. */
export const isConfigured = (env: Record<string, string | undefined>) =>
  Boolean(env.MAILERLITE_API_KEY?.trim());

/**
 * Deliberately loose. An address is validated by whether the confirmation mail arrives,
 * not by a regex; the only job here is to reject what is obviously not an address so an
 * accidental submission does not travel to a third party.
 */
export function looksLikeEmail(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length < 6 || v.length > 254) return false;
  if (/\s/.test(v)) return false;
  const at = v.indexOf('@');
  if (at < 1 || at !== v.lastIndexOf('@')) return false;
  const domain = v.slice(at + 1);
  return domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
}

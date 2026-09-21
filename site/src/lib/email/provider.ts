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
 * Eight seconds, then give up.
 *
 * This runs inside a serverless function with a reader waiting on a form. A provider that
 * has stopped answering must not hold the request until the platform kills it, because
 * the reader is then told nothing at all; a clean "busy, try again" is a better answer
 * than a spinner that never resolves.
 */
const TIMEOUT_MS = 8000;

/** A POST with a deadline. Never throws: the caller gets a Response or null. */
async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  timeoutMs: number
): Promise<Response | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: ac.signal
    });
  } catch {
    // An abort and a dead network land here alike, and the reader is told the same thing
    // either way: it did not go through, and trying again is worth doing.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** The attributes a mail template can personalise with. Empty ones are not sent. */
function attributesFor(sub: Subscription): Record<string, string> | undefined {
  const attrs: Record<string, string> = {};
  if (sub.quiz) attrs.QUIZ = sub.quiz;
  if (sub.code) attrs.RESULT_CODE = sub.code;
  if (sub.headline) attrs.RESULT_HEADLINE = sub.headline;
  return Object.keys(attrs).length ? attrs : undefined;
}

export interface BrevoOptions {
  /** The list new contacts join. Omit and they land on no list, which is rarely wanted. */
  listId?: number;
  /** Set to send Brevo's own confirmation mail instead of creating the contact outright. */
  doiTemplateId?: number;
  doiRedirect?: string;
  /** Test seam only. Production uses TIMEOUT_MS. */
  timeoutMs?: number;
}

/**
 * Brevo (api.brevo.com), the free plan: 300 emails a day, no cap on how many contacts are
 * held, and the same account can later send the account mail, so nothing has to move when
 * sign-in arrives.
 *
 * TWO MODES, and which one is in use decides whether a confirmation mail is ever sent:
 *
 *   plain       POST /v3/contacts creates the contact immediately. Nothing is emailed.
 *   double      POST /v3/contacts/doubleOptinConfirmation emails the reader a link, and
 *   opt-in      the contact only exists once they click it. Needs a DOI template in the
 *               Brevo account, hence BREVO_DOI_TEMPLATE_ID.
 *
 * The form's copy has to be true under both, which is why it no longer promises a
 * confirmation email by name. See components/EmailCapture.astro.
 */
export function brevo(apiKey: string, opts: BrevoOptions = {}): EmailProvider {
  const { listId, doiTemplateId, doiRedirect, timeoutMs = TIMEOUT_MS } = opts;
  const doi = Boolean(doiTemplateId);

  return {
    id: doi ? 'brevo-doi' : 'brevo',
    async subscribe(sub) {
      const attributes = attributesFor(sub);

      const body: Record<string, unknown> = doi
        ? {
            email: sub.email,
            includeListIds: listId ? [listId] : [],
            templateId: doiTemplateId,
            redirectionUrl: doiRedirect || 'https://wiserwalk.com/?sub=confirmed'
          }
        : { email: sub.email, updateEnabled: true };
      if (!doi && listId) body.listIds = [listId];
      if (attributes) body.attributes = attributes;

      const res = await postJson(
        doi
          ? 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation'
          : 'https://api.brevo.com/v3/contacts',
        // The key is a header value and nothing else: it is never logged, never echoed
        // into an error message and never reaches the browser.
        { 'api-key': apiKey },
        body,
        timeoutMs
      );

      if (!res) return { ok: false, retryable: true, message: 'Could not reach the email service.' };

      // 201 is a contact created; 204 is one Brevo already held and updated, and it is
      // also what the double opt-in endpoint answers when the mail has been sent.
      if (res.status === 201) return { ok: true, already: false };
      if (res.status === 204) return { ok: true, already: !doi };
      if (res.status === 200) return { ok: true, already: true };

      if (res.status === 400) {
        // "Contact already exist" arrives as a 400 rather than a conflict. It is not a
        // failure: the reader asked to be on a list they are already on.
        const code = await res
          .json()
          .then((b: unknown) => (b as { code?: string } | null)?.code ?? '')
          .catch(() => '');
        if (code === 'duplicate_parameter') return { ok: true, already: true };
        return { ok: false, retryable: false, message: 'That address was not accepted.' };
      }
      if (res.status === 401 || res.status === 403) {
        // Our key, our problem. Never blame the reader for it.
        return { ok: false, retryable: false, message: 'Sign-up is misconfigured. This is our fault, not yours.' };
      }
      if (res.status === 429 || res.status >= 500) {
        return { ok: false, retryable: true, message: 'The email service is busy. Try again shortly.' };
      }
      return { ok: false, retryable: false, message: 'Sign-up failed.' };
    }
  };
}

/**
 * MailerLite, current API (connect.mailerlite.com). Kept working, not in use: the owner's
 * MailerLite account belongs to his other business, so the site ships on Brevo. Two
 * settings live in the MailerLite account rather than here if it is ever switched back on:
 *
 *   1. DOUBLE OPT-IN, under Subscribe settings. With it off, a subscriber created here is
 *      live at once and no confirmation mail is sent. The form's copy holds either way.
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

      const res = await postJson(
        'https://connect.mailerlite.com/api/subscribers',
        { authorization: `Bearer ${apiKey}` },
        body,
        TIMEOUT_MS
      );
      if (!res) return { ok: false, retryable: true, message: 'Could not reach the email service.' };

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

/** A whole number from the environment, or undefined if it is missing or not one. */
function num(value: string | undefined): number | undefined {
  const n = Number((value ?? '').trim());
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

/**
 * Picks the provider from the environment at request time, not at build time: Vercel
 * injects env vars into the function, and reading them during the static build would bake
 * in whatever the build machine happened to have.
 *
 * Brevo first. MailerLite stays wired up and working, because the account that key
 * belongs to is the owner's other business and this site may never use it again — but
 * removing a provider that still works, to save a branch, is how a rollback stops being
 * possible.
 */
export function getProvider(env: Record<string, string | undefined>): EmailProvider {
  // EMAIL_PREVIEW wins over a real key on purpose: it exists so the form can be developed
  // and screenshotted, and a local run must never be able to write to the live list.
  if (env.EMAIL_PREVIEW === '1') return consoleProvider;

  const brevoKey = env.BREVO_API_KEY?.trim();
  if (brevoKey) {
    return brevo(brevoKey, {
      listId: num(env.BREVO_LIST_ID),
      doiTemplateId: num(env.BREVO_DOI_TEMPLATE_ID),
      doiRedirect: env.BREVO_DOI_REDIRECT?.trim() || undefined
    });
  }

  const key = env.MAILERLITE_API_KEY?.trim();
  if (key) return mailerlite(key, env.MAILERLITE_GROUP_ID?.trim() || undefined);
  return consoleProvider;
}

/**
 * True when the form should be shown at all. With no provider it stays hidden rather than
 * collecting addresses that go nowhere. EMAIL_PREVIEW=1 shows it against the console
 * provider, for local work.
 */
export const isConfigured = (env: Record<string, string | undefined>) =>
  env.EMAIL_PREVIEW === '1' ||
  Boolean(env.BREVO_API_KEY?.trim()) ||
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

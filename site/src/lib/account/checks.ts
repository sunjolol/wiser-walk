/**
 * Everything the server asks Supabase, and what the answers mean in plain words.
 *
 * Most of this file is the engine behind /account/setup/, a page nobody but the owner ever
 * opens. He is going to paste keys into two dashboards and a hosting panel, in an order
 * that matters, and the failure he cannot debug is the quiet one: everything looks fine
 * and nobody can sign in. So each check does one real request and turns the result into a
 * sentence that names the thing to go and do, never a status code and never a stack trace.
 *
 * Three rules hold it together:
 *
 *   one step each     a check that reports two problems at once reports neither usefully.
 *   never a secret    no `say` string may contain a key, an address or a count of people.
 *                     The page is unlinked, not private, and a health page that leaks the
 *                     thing it is checking is worse than no health page.
 *   never a throw     a check that cannot reach anything says so and is still a check.
 *
 * The last two exports are not health checks at all. They live here because this is the
 * one file that knows how to speak to Supabase from the server, and a bearer token being
 * verified two slightly different ways in two routes is how one of them ends up not
 * verifying anything.
 */
import type { Env } from '../email/env';

export type CheckState = 'ok' | 'todo' | 'bad';

export interface Check {
  /** The numbered step in the account README this line is about. */
  step: number;
  /** Two or three words, as a heading. */
  name: string;
  state: CheckState;
  /** A finished sentence the page prints as it is. */
  say: string;
}

/** Any `fetch`. Passed in so every check can be driven from a test with no network. */
export type Fetcher = typeof fetch;

export type CheckFn = (fetchImpl: Fetcher, env: Env) => Promise<Check>;

/** Long enough for a cold Supabase, short enough that the page still paints. */
const PROBE_TIMEOUT_MS = 4000;

/** Sixty days of hook history is plenty to answer "is it working". */
export const LOG_KEEP_DAYS = 60;

/**
 * How long a cleared result's tombstone is kept.
 *
 * Clearing a result does not delete the row, it marks it, because that marker is how the
 * reader's other devices learn to drop their own copy. Ninety days is long past the point
 * where another device could still be carrying the original, and keeping them for ever
 * would mean the table only ever grows and a promise on /method/ that quietly stops being
 * true. The daily keep-alive sweeps them.
 */
export const TOMBSTONE_KEEP_DAYS = 90;

/**
 * The two synthetic keys `/api/auth/health` adds to the environment before calling in.
 *
 * They carry what was baked into the pages AT BUILD TIME, which is a different thing from
 * what the function can read at runtime, and the gap between them is the single most
 * likely reason accounts look broken after the owner has done everything right. The pages
 * only learn a PUBLIC_ value when the site is rebuilt.
 */
export const BUILT_URL = 'WW_BUILT_SUPABASE_URL';
export const BUILT_KEY = 'WW_BUILT_SUPABASE_KEY';

const trim = (v: string | undefined) => (v ?? '').trim();

/** The base URL with no trailing slash, or '' when it is unset or not a URL. */
export function projectUrl(env: Env): string {
  const raw = trim(env.PUBLIC_SUPABASE_URL);
  if (!raw) return '';
  try {
    return new URL(raw).origin;
  } catch {
    return '';
  }
}

/** A GET with a deadline. Never throws: the caller gets a Response or null. */
async function ask(
  fetchImpl: Fetcher,
  url: string,
  headers: Record<string, string>,
  timeoutMs = PROBE_TIMEOUT_MS
): Promise<Response | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { headers: { accept: 'application/json', ...headers }, signal: ac.signal });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * How long ago, in the only three widths this page is allowed to say.
 *
 * It used to answer "four minutes ago", which is the right thing to tell the owner and the
 * wrong thing to tell everybody else. The setup page is unlinked, not private, and a
 * minute-accurate time for the last account email is live sign-up traffic: poll the route
 * and you can watch people join. Three widths still answer the only question he has, which
 * is whether the thing he did a moment ago reached us.
 *
 * "Today" is the server's own calendar day rather than the last twenty-four hours, because
 * a thing that happened yesterday evening did not happen today and this page has no
 * business rounding in the flattering direction.
 */
export function roughly(iso: string, nowMs = Date.now()): string {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return 'at some point';
  const now = new Date(nowMs);
  const when = new Date(then);
  const sameDay =
    when.getUTCFullYear() === now.getUTCFullYear() &&
    when.getUTCMonth() === now.getUTCMonth() &&
    when.getUTCDate() === now.getUTCDate();
  if (sameDay) return 'today';
  return nowMs - then < 7 * 86_400_000 ? 'in the last week' : 'more than a week ago';
}

/**
 * A paused project answers everything with 540, including sign-in for people who already
 * have accounts. It is the largest operational risk in the whole feature and the one thing
 * the owner fixes in two clicks once he knows, so every check that touches Supabase names
 * it the same way.
 */
const PAUSED =
  'Your Supabase project is paused. Open supabase.com, choose the project, and press Resume project. Nothing is lost.';

const UNREACHABLE = 'Supabase did not answer just now. Try this page again in a minute.';

// ------------------------------------------------------------------ the checks

/** Step 12. Are the two values the browser needs present at all? */
export const checkWebsiteKeys: CheckFn = async (_fetchImpl, env) => {
  const url = trim(env.PUBLIC_SUPABASE_URL);
  const key = trim(env.PUBLIC_SUPABASE_KEY);
  const step = 12;
  const name = 'The two website keys';
  if (!url && !key) {
    return {
      step,
      name,
      state: 'todo',
      say: 'Vercel has neither PUBLIC_SUPABASE_URL nor PUBLIC_SUPABASE_KEY yet. Both are on the Supabase screen called API Keys, and both go into Vercel for Production and for Preview.'
    };
  }
  if (!url || !key) {
    return {
      step,
      name,
      state: 'todo',
      say: `Vercel has one of the two website values but not the other. The missing one is ${url ? 'PUBLIC_SUPABASE_KEY, the publishable key' : 'PUBLIC_SUPABASE_URL, the project URL'}.`
    };
  }
  if (!projectUrl(env)) {
    return {
      step,
      name,
      state: 'bad',
      say: 'PUBLIC_SUPABASE_URL is not a web address. It should start with https:// and end in supabase.co, copied whole from the API Keys screen.'
    };
  }
  return { step, name, state: 'ok', say: 'Both website values are set.' };
};

/** Step 13. The keys are in Vercel, but were the pages built with them? */
export const checkRedeploy: CheckFn = async (_fetchImpl, env) => {
  const step = 13;
  const name = 'The redeploy';
  const liveUrl = trim(env.PUBLIC_SUPABASE_URL);
  const liveKey = trim(env.PUBLIC_SUPABASE_KEY);
  const builtUrl = trim(env[BUILT_URL]);
  const builtKey = trim(env[BUILT_KEY]);

  if (!liveUrl || !liveKey) {
    return { step, name, state: 'todo', say: 'Nothing to redeploy for yet. Set the two website keys first.' };
  }
  if (!builtUrl || !builtKey) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The keys are in Vercel but the site was built before you added them, so the pages cannot see them. In Vercel open Deployments, find the newest one, and press Redeploy.'
    };
  }
  if (builtUrl !== liveUrl || builtKey !== liveKey) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The keys in Vercel have changed since the site was last built. Press Redeploy on the newest deployment so the pages pick up the new ones.'
    };
  }
  return { step, name, state: 'ok', say: 'The site was built with the keys that are set now.' };
};

/** Step 12. The server-only key, and the commonest mix-up on that screen. */
export const checkSecretKey: CheckFn = async (_fetchImpl, env) => {
  const step = 12;
  const name = 'The secret key';
  const secret = trim(env.SUPABASE_SECRET_KEY);
  if (!secret) {
    return {
      step,
      name,
      state: 'todo',
      say: 'Vercel has no SUPABASE_SECRET_KEY. It is on the same Supabase screen as the other two, under the heading about secret keys, and it is the one to keep to yourself.'
    };
  }
  if (secret === trim(env.PUBLIC_SUPABASE_KEY) || secret.startsWith('sb_publishable')) {
    return {
      step,
      name,
      state: 'bad',
      say: 'SUPABASE_SECRET_KEY holds the publishable key rather than the secret one. They sit next to each other; the secret one is hidden behind a reveal button.'
    };
  }
  return { step, name, state: 'ok', say: 'The secret key is set.' };
};

/** Step 10. The shared secret that proves an email request really came from Supabase. */
export const checkHookSecret: CheckFn = async (_fetchImpl, env) => {
  const step = 10;
  const name = 'The email hook secret';
  const raw = trim(env.SUPABASE_EMAIL_HOOK_SECRET);
  if (!raw) {
    return {
      step,
      name,
      state: 'todo',
      say: 'Vercel has no SUPABASE_EMAIL_HOOK_SECRET. In Supabase open Authentication, then Hooks, switch on the Send Email hook, press Generate secret, and paste the whole thing into Vercel.'
    };
  }
  if (!raw.includes('whsec_')) {
    return {
      step,
      name,
      state: 'bad',
      say: 'SUPABASE_EMAIL_HOOK_SECRET does not look like the secret Supabase generates. Copy it again from Authentication, then Hooks, exactly as shown, including everything before the underscore.'
    };
  }
  return { step, name, state: 'ok', say: 'The email hook secret is set.' };
};

/** Step 5. Is the project there, awake, and willing to talk to us? */
export const checkProject: CheckFn = async (fetchImpl, env) => {
  const step = 5;
  const name = 'Your Supabase project';
  const base = projectUrl(env);
  // The publishable key, or none at all. /auth/v1/health needs no key to answer, and the
  // destination host is whatever PUBLIC_SUPABASE_URL happens to hold: one mistyped project
  // ref during setup, on a route any stranger can call, would otherwise hand the secret key
  // to a host of somebody else's choosing. The line above is the one that reports a
  // missing publishable key; this one has no business borrowing a key to cover for it.
  const key = trim(env.PUBLIC_SUPABASE_KEY);
  if (!base) return { step, name, state: 'todo', say: 'No project to check yet. Set the two website keys first.' };

  const res = await ask(fetchImpl, `${base}/auth/v1/health`, key ? { apikey: key } : {});
  if (!res) return { step, name, state: 'bad', say: UNREACHABLE };
  if (res.status === 540) return { step, name, state: 'bad', say: PAUSED };
  if (res.status === 401 || res.status === 403) {
    return {
      step,
      name,
      state: 'bad',
      say: 'Supabase refused the publishable key. Copy it again from the API Keys screen and put it into Vercel, then redeploy.'
    };
  }
  if (res.status === 404) {
    return {
      step,
      name,
      state: 'bad',
      say: 'That web address reached something, but not a Supabase project. Check PUBLIC_SUPABASE_URL against the project URL on the API Keys screen.'
    };
  }
  if (res.status >= 500) return { step, name, state: 'bad', say: UNREACHABLE };
  return { step, name, state: 'ok', say: 'Your Supabase project answered.' };
};

/** Step 7. Has the one block of SQL been run? */
export const checkTables: CheckFn = async (fetchImpl, env) => {
  const step = 7;
  const name = 'The account tables';
  const base = projectUrl(env);
  const secret = trim(env.SUPABASE_SECRET_KEY);
  // Named rather than pointed at: the page orders these lines by the step he does them on,
  // so the two key lines sit below this one now and "above" would send him the wrong way.
  if (!base || !secret) {
    return { step, name, state: 'todo', say: 'Nothing to check yet. Set the website keys and the secret key first.' };
  }

  // Two tables: the first a person's own, the second the one only the server writes. Both
  // have to answer the secret key, and on a project made since 30 May 2026 neither does
  // unless the schema file granted it (see the end of schema.sql).
  for (const table of ['profiles', 'auth_email_log']) {
    // The secret key goes on the apikey header and NEVER as a bearer token: it is not a
    // JWT, and anything that tries to read it as one refuses the request.
    const res = await ask(fetchImpl, `${base}/rest/v1/${table}?limit=1`, { apikey: secret });
    if (!res) return { step, name, state: 'bad', say: UNREACHABLE };
    if (res.status === 540) return { step, name, state: 'bad', say: PAUSED };
    if (res.status === 401 || res.status === 403) {
      // Postgres's "permission denied" is a table the key may not touch, which no new key
      // would fix. Telling those two apart is what stops a loop of fresh keys.
      const body = (await res.json().catch(() => null)) as { code?: unknown } | null;
      if (body?.code === '42501') {
        return {
          step,
          name,
          state: 'todo',
          say: 'The tables are there, but the site is not yet allowed to use them. In Supabase open the SQL Editor, paste the whole of the schema file again, and press Run. It is safe to run twice.'
        };
      }
      return {
        step,
        name,
        state: 'bad',
        say: 'Supabase refused the secret key. Copy it again from the API Keys screen, paste it into Vercel as SUPABASE_SECRET_KEY, and redeploy.'
      };
    }
    if (res.status === 404 || res.status === 406) {
      return {
        step,
        name,
        state: 'todo',
        say: 'The tables the accounts need are not there yet. In Supabase open the SQL Editor, paste the whole of the schema file, and press Run. It is safe to run twice.'
      };
    }
    if (res.status >= 500) return { step, name, state: 'bad', say: UNREACHABLE };
  }
  return { step, name, state: 'ok', say: 'The account tables are there and answering.' };
};

/**
 * Step 7 as well. The table behind the six-character result links (engine/links.ts).
 *
 * A line of its own rather than a third table in the check above: it came later, so the
 * owner may have run the old file and needs telling to run the new one, and without it
 * nothing breaks. Results just keep their long links.
 */
export const checkShortLinks: CheckFn = async (fetchImpl, env) => {
  const step = 7;
  const name = 'Short result links';
  const base = projectUrl(env);
  const secret = trim(env.SUPABASE_SECRET_KEY);
  if (!base || !secret) {
    return { step, name, state: 'todo', say: 'Nothing to check yet. Set the website keys and the secret key first.' };
  }

  const res = await ask(fetchImpl, `${base}/rest/v1/short_links?select=code&limit=1`, { apikey: secret });
  if (!res) return { step, name, state: 'bad', say: UNREACHABLE };
  if (res.status === 540) return { step, name, state: 'bad', say: PAUSED };
  if (res.status === 401 || res.status === 403) {
    const body = (await res.json().catch(() => null)) as { code?: unknown } | null;
    if (body?.code === '42501') {
      return {
        step,
        name,
        state: 'todo',
        say: 'The table for short links is there, but the site is not yet allowed to use it. In Supabase open the SQL Editor, paste the whole of the schema file again, and press Run.'
      };
    }
    return {
      step,
      name,
      state: 'bad',
      say: 'Supabase refused the secret key. Copy it again from the API Keys screen, paste it into Vercel as SUPABASE_SECRET_KEY, and redeploy.'
    };
  }
  if (res.status === 404 || res.status === 406) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The table for short result links is not there yet, so results use their long links. In Supabase open the SQL Editor, paste the whole of the schema file, and press Run. It is safe to run twice.'
    };
  }
  if (res.status !== 200) return { step, name, state: 'bad', say: UNREACHABLE };
  return { step, name, state: 'ok', say: 'The table for short result links is there and answering.' };
};

/** Step 15. Has Supabase ever actually asked us to send an email, and did it go? */
export const checkHookFired: CheckFn = async (fetchImpl, env) => {
  const step = 15;
  const name = 'Emails Supabase has asked for';
  const base = projectUrl(env);
  const secret = trim(env.SUPABASE_SECRET_KEY);
  if (!base || !secret) {
    return { step, name, state: 'todo', say: 'Nothing to check yet. Set the website keys and the secret key first.' };
  }

  // Two columns, because two columns are all that is printed. Asking for `detail` and then
  // not using it is how it ends up in a response body again after somebody tidies up.
  const res = await ask(fetchImpl, `${base}/rest/v1/auth_email_log?select=at,ok&order=at.desc&limit=1`, {
    apikey: secret
  });
  if (!res) return { step, name, state: 'bad', say: UNREACHABLE };
  if (res.status === 540) return { step, name, state: 'bad', say: PAUSED };
  if (res.status === 404 || res.status === 406) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The table that records these is not there yet. Run the schema file in the SQL Editor first.'
    };
  }
  if (res.status !== 200) return { step, name, state: 'bad', say: UNREACHABLE };

  const rows = (await res.json().catch(() => null)) as { at?: string; ok?: boolean }[] | null;
  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      step,
      name,
      state: 'todo',
      say: 'Supabase has never asked us to send an email. Make an account with your own address, then come back to this page and read this line again.'
    };
  }

  const last = rows[0] ?? {};
  const when = roughly(String(last.at ?? ''));
  if (last.ok) {
    return { step, name, state: 'ok', say: `Supabase asked us to send an email ${when}, and it went out.` };
  }
  // The row's `detail` holds a status and the provider's own error word, and it is NOT
  // printed here. It is safe in the sense that matters most, in that it never holds an
  // address, but this route answers anybody who asks: publishing the reason our email
  // provider refused us tells a stranger which service we use and what state the account
  // is in. The line below about sending says the same thing from our own side, and the
  // detail is a query away in the table for the one person who can act on it.
  return {
    step,
    name,
    state: 'bad',
    say: `Supabase asked us to send an email ${when}, and it did not go out. The line below about sending is usually the reason.`
  };
};

/** Step 4 (B5 and B6 on the Brevo path). Can we send, and is there a verified sender? */
export const checkSending: CheckFn = async (fetchImpl, env) => {
  const step = 4;
  const name = 'Sending the emails';

  if (env.EMAIL_PREVIEW === '1') {
    return {
      step,
      name,
      state: 'todo',
      say: 'Email is in preview mode, so nothing is really sent. Remove EMAIL_PREVIEW from Vercel when you want people to receive their links.'
    };
  }

  const resendKey = trim(env.RESEND_API_KEY);
  if (resendKey) {
    const res = await ask(fetchImpl, 'https://api.resend.com/domains', { authorization: `Bearer ${resendKey}` });
    if (!res) return { step, name, state: 'bad', say: 'The email service did not answer just now. Try this page again in a minute.' };
    const body = (await res.json().catch(() => null)) as { name?: unknown; data?: unknown } | null;

    // A key made with "Sending access" may send and may do nothing else, so asking it for
    // the list of domains is refused with a 401 named restricted_api_key. That is a working
    // key, and the smallest one that does the job; calling it refused sent the owner round
    // in a loop of making new keys. The 403 of the same name means the key is switched off.
    if (res.status === 401 && body?.name === 'restricted_api_key') {
      return {
        step,
        name,
        state: 'ok',
        say: 'The email service took our key. It can only send, so this page cannot see whether the address the emails come from is on your verified domain: the first real sign-up will show it.'
      };
    }
    if (res.status === 429 || res.status >= 500) {
      return { step, name, state: 'bad', say: 'The email service did not answer properly just now. Try this page again in a minute.' };
    }
    // Anything else that is not a 200 is the key. A made-up key gets a 400 here, not a 401,
    // and was reported as working until 2026-09-22.
    if (res.status !== 200) {
      return { step, name, state: 'bad', say: 'The email service refused our key. Make a new one and put it into Vercel.' };
    }

    // The key works. Resend refuses every email from an address outside a verified domain,
    // so the domain of the From address has to be on the list and verified. Neither the
    // address nor the domain is printed: this is a public page.
    const domain = fromAddress(env).split('@')[1] ?? '';
    const domains = Array.isArray(body?.data) ? (body!.data as { name?: unknown; status?: unknown }[]) : [];
    const mine = domains.find(d => typeof d?.name === 'string' && d.name.toLowerCase() === domain);
    if (!mine) {
      return {
        step,
        name,
        state: 'todo',
        say: 'The address the emails come from is not on any domain added to the email service. In Vercel, ACCOUNT_EMAIL_FROM has to end in the domain shown on its Domains page.'
      };
    }
    if (mine.status !== 'verified') {
      return {
        step,
        name,
        state: 'todo',
        say: 'The email service has not finished verifying the domain the emails come from. Its Domains page shows how far it has got; it can take a few minutes after the DNS records are added.'
      };
    }
    return { step, name, state: 'ok', say: 'The email service took our key, and the domain the emails come from is verified.' };
  }

  const brevoKey = trim(env.BREVO_API_KEY);
  if (!brevoKey) {
    return {
      step,
      name,
      state: 'bad',
      say: 'Nothing is set up to send email, so nobody can finish signing up. Set BREVO_API_KEY in Vercel.'
    };
  }

  const res = await ask(fetchImpl, 'https://api.brevo.com/v3/senders', { 'api-key': brevoKey });
  if (!res) return { step, name, state: 'bad', say: 'The email service did not answer just now. Try this page again in a minute.' };
  if (res.status === 401 || res.status === 403) {
    return {
      step,
      name,
      state: 'bad',
      say: 'The email service refused our key. Make a new one under Settings, then SMTP and API, and put it into Vercel.'
    };
  }
  if (res.status !== 200) {
    return {
      step,
      name,
      state: 'bad',
      say: 'The email service answered with something we did not expect. If it is a new account, sending may still be switched off; ask their support to switch on transactional email.'
    };
  }

  const body = (await res.json().catch(() => null)) as { senders?: { email?: string; active?: boolean }[] } | null;
  const senders = Array.isArray(body?.senders) ? body!.senders! : [];
  // The address itself is never printed. It is in the owner's own Vercel settings and his
  // own email account; a public page has no business repeating it back.
  const from = fromAddress(env);
  const mine = senders.find(s => (s.email ?? '').trim().toLowerCase() === from);
  if (!mine) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The email service has no sender for the address this site sends from. Add it under Settings, then Senders, Domains and IPs, then Senders.'
    };
  }
  if (mine.active === false) {
    return {
      step,
      name,
      state: 'todo',
      say: 'The sender this site uses exists but is not verified yet. Open the email service and finish verifying it, or authenticate the domain so every sender on it is verified at once.'
    };
  }
  return { step, name, state: 'ok', say: 'The email service can send, and the address this site sends from is verified.' };
};

/** The From address, lowercased, with the name stripped off. Never printed anywhere. */
function fromAddress(env: Env): string {
  const raw = trim(env.ACCOUNT_EMAIL_FROM) || 'Wiser Walk <account@wiserwalk.com>';
  const open = raw.lastIndexOf('<');
  const close = raw.lastIndexOf('>');
  const value = open > -1 && close > open ? raw.slice(open + 1, close) : raw;
  return value.trim().toLowerCase();
}

/**
 * Every check. The order here is only the tie-break: /account/setup/ sorts the lines by
 * `step`, so what the owner reads is the order he does the work in, and the two lines that
 * share step 12 stay in the order the README puts them.
 *
 * The numbers are the numbered headings in README.md in this folder. If a step is ever
 * added or moved there, these move with it or the page names a step that does not exist.
 */
export const ALL_CHECKS: CheckFn[] = [
  checkWebsiteKeys,
  checkSecretKey,
  checkHookSecret,
  checkProject,
  checkTables,
  checkShortLinks,
  checkHookFired,
  checkSending,
  checkRedeploy
];

/**
 * Run the lot.
 *
 * Together rather than one after another: they are independent, several of them wait on a
 * network, and a setup page that takes fifteen seconds to paint is a page nobody reads to
 * the bottom of. A check that somehow throws is reported as a failed check rather than
 * taking the page down with it.
 */
export async function runChecks(fetchImpl: Fetcher, env: Env): Promise<Check[]> {
  return Promise.all(
    ALL_CHECKS.map(async check => {
      try {
        return await check(fetchImpl, env);
      } catch {
        return { step: 0, name: 'A check', state: 'bad' as CheckState, say: 'This check could not be run.' };
      }
    })
  );
}

// ------------------------------------------------- not checks: the shared server pieces

/**
 * True when the site has been given enough to run accounts at all.
 *
 * Deliberately the same two values the browser needs, so the server and the pages agree
 * about whether the feature exists. Everything else has its own line on the setup page.
 */
export function accountsReady(env: Env): boolean {
  return Boolean(trim(env.PUBLIC_SUPABASE_URL) && trim(env.PUBLIC_SUPABASE_KEY));
}

/**
 * Was this request made by a page on this site?
 *
 * Astro's own origin check does NOT cover a JSON body: a cross-origin POST with
 * content-type application/json passes straight through it. So any route that acts on
 * somebody's behalf writes this itself rather than assuming the framework did.
 */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin === url.origin;
}

export interface Who {
  id: string;
  email: string;
}

/**
 * Who does this token belong to?
 *
 * The answer comes from Supabase, never from the request body. A route that took the
 * address out of the body would let anyone holding any valid token act on anyone else's
 * account, which is the whole reason this function exists and the reason both routes that
 * need it call this one.
 */
export async function whoIs(fetchImpl: Fetcher, env: Env, token: string): Promise<Who | null> {
  const base = projectUrl(env);
  const key = trim(env.PUBLIC_SUPABASE_KEY);
  const bearer = (token ?? '').trim();
  if (!base || !key || !bearer || bearer.length > 4096) return null;

  const res = await ask(fetchImpl, `${base}/auth/v1/user`, {
    apikey: key,
    authorization: `Bearer ${bearer}`
  });
  if (!res || res.status !== 200) return null;

  const body = (await res.json().catch(() => null)) as { id?: unknown; email?: unknown } | null;
  const id = typeof body?.id === 'string' ? body.id.trim() : '';
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  if (!id || !email || !email.includes('@')) return null;
  return { id, email };
}

/** The bearer token off an Authorization header, or ''. */
export function bearerFrom(request: Request): string {
  const raw = request.headers.get('authorization') ?? '';
  return /^bearer\s+/i.test(raw) ? raw.replace(/^bearer\s+/i, '').trim() : '';
}

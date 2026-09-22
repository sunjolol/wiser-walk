/**
 * Everything an account page asks the server to do.
 *
 * This is the only file on the site that touches `@supabase/supabase-js`, and it touches it
 * through a dynamic `import()` inside one memoised function. The SDK is 56 KB gzipped; a
 * static import anywhere would put it on every page of a phone-first site to serve the few
 * people on the few pages that actually sign in.
 *
 * Two promises hold for every export here:
 *
 *   it resolves      no function rejects, ever. A page calls one, gets an answer, and prints
 *                    it. There is no try/catch to forget on a form handler at midnight.
 *   `say` is ready   every failure carries a finished sentence in the site's own voice.
 *                    Pages may branch on `code` when they want to do something clever, but
 *                    printing `say` is always correct and always kind.
 *
 * The codes pages branch on are `expired`, `cooldown`, `busy`, `weak`, `same`, `wrong`,
 * `unconfirmed`, `offline`, `off`, `paused` and `unknown`. Two more exist for cases that only
 * arise inside the site rather than at Supabase: `nosession` (nobody is signed in here) and
 * `address` (that is not an email address). A page that does not know them still prints their
 * `say`, which is the point of `say`.
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import { ACCOUNTS_READY, MIN_PASSWORD, SUPABASE_KEY, SUPABASE_URL } from './config';
import { AUTH_KEY, QUEUE_KEY, SYNCED_AT_KEY, clearSignedIn, markSignedIn } from './session';
import { STAMP_KEY, syncNow } from './sync';
import { GAME_KEYS } from './merge';
import { browserStore, clearShelf } from '../shelf';
import { looksLikeEmail } from '../email/provider';

/**
 * The account's live row count, for `/account/`. It belongs to sync.ts, where the plumbing
 * that asks PostgREST a question already lives, and is passed through here so that a page
 * has one import for everything it asks the server to do.
 */
export { countResults } from './sync';

/** Success carries whatever the call has to give back; failure always carries both fields. */
export type Done<T = {}> = ({ ok: true } & T) | { ok: false; code: string; say: string };

// --------------------------------------------------------------------- the client

let ready: Promise<SupabaseClient> | null = null;

/**
 * The SDK, loaded once and never on a page that does not need it.
 *
 * `detectSessionInUrl` is off because no link we send ever carries a session in its
 * fragment: `/account/password/` reads a token hash and spends it deliberately, on submit.
 * `storageKey` is ours so that session.ts can read the session without loading any of this.
 */
function getClient(): Promise<SupabaseClient> {
  if (!ready) {
    ready = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: {
            storageKey: AUTH_KEY,
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false,
            flowType: 'implicit'
          }
        })
      )
      .catch(error => {
        // A load that failed on a dead network must not poison every later attempt.
        ready = null;
        throw error;
      });
  }
  return ready;
}

/**
 * A live access token, refreshed if it needed refreshing. For sync.ts, which reads the
 * stored token directly while it is fresh and only comes here when it is not.
 */
export async function currentToken(): Promise<{ accessToken: string; userId: string; email: string } | null> {
  if (!ACCOUNTS_READY) return null;
  try {
    const supabase = await getClient();
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.access_token || !session.user?.id) return null;
    return { accessToken: session.access_token, userId: session.user.id, email: session.user.email ?? '' };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- what went wrong

/**
 * Supabase's error code, or an HTTP status, turned into one of ours.
 *
 * Exported because it is pure and worth testing on its own: the mapping is the part that
 * decides what a reader is told, and it is the part most likely to be got wrong quietly.
 */
export function codeFor(error: unknown): string {
  if (!error) return 'unknown';
  const e = error as { code?: unknown; status?: unknown; name?: unknown; message?: unknown };
  const code = typeof e.code === 'string' ? e.code : '';
  const status = typeof e.status === 'number' ? e.status : 0;
  const name = typeof e.name === 'string' ? e.name : '';
  const message = typeof e.message === 'string' ? e.message : '';

  const named: Record<string, string> = {
    otp_expired: 'expired',
    flow_state_expired: 'expired',
    over_email_send_rate_limit: 'cooldown',
    over_request_rate_limit: 'busy',
    weak_password: 'weak',
    same_password: 'same',
    invalid_credentials: 'wrong',
    email_not_confirmed: 'unconfirmed',
    email_address_invalid: 'address'
  };
  if (named[code]) return named[code];

  // A paused free project answers everything with 540, including sign-in for people who
  // already have accounts. It is the one failure that deserves its own sentence.
  //
  // The message is read as well as the status, because the SDK only attaches a status when
  // the body parses as JSON, and what a paused project actually returns is an HTML page. The
  // word survives where the number does not.
  if (status === 540 || /paused/i.test(message)) return 'paused';

  // A dynamic import that could not be fetched IS the network, and each browser words it
  // differently: Chrome says "Failed to fetch dynamically imported module", Firefox says
  // "error loading dynamically imported module", and older bundlers say "loading chunk".
  // Told the wrong sentence, somebody on a train reloads instead of looking at their signal.
  if (
    !status &&
    (name === 'AuthRetryableFetchError' ||
      name === 'TypeError' ||
      /fetch|network|abort|importing|dynamically imported|loading chunk/i.test(message))
  ) {
    return 'offline';
  }
  if (status === 429) return 'busy';
  if (status === 502 || status === 503 || status === 504) return 'busy';

  if (code === 'signup_disabled' || code === 'otp_disabled') {
    // Nothing the reader did. Leave one breadcrumb for whoever looks at the console.
    try {
      console.warn('[account] the project refused: ' + code);
    } catch {
      /* no console, no matter */
    }
  }
  return 'unknown';
}

/*
 * Plain modern words, and what to do next (the design pass, 2026-09-22): no "Please", no
 * "Sorry", and "log in" wherever a reader sees the act, because "sign in" and "sign up"
 * differ by two letters and people press the wrong one.
 */
const SAYINGS: Record<string, string> = {
  expired: 'That link has been used or has expired. Ask for a new one.',
  // Never "we have just sent one": the same refusal covers the minute between two requests
  // for one address AND the hour's ceiling for the whole project, and in the second case
  // nothing was sent to this person at all.
  cooldown: 'Wait a minute, then try again. If an email was sent, it will be in your inbox by now.',
  busy: 'Too many tries in a short time. Wait a few minutes, then try again.',
  weak: `Use at least ${MIN_PASSWORD} characters.`,
  same: 'That is the password you already have. Choose a different one.',
  wrong: 'That email and password do not match. Check them and try again.',
  unconfirmed: 'Open the email we sent you and set a password there first.',
  offline: 'We could not reach your account. Check your connection and try again.',
  off: 'Accounts are not switched on yet.',
  paused: 'Logging in is having a rest and should be back in a few minutes. Your results are safe on this device.',
  nosession: 'You are not logged in on this device.',
  address: 'Enter an email address like name@example.com.',
  unknown: 'Something went wrong at our end. Try again in a moment.'
};

/** A code, as a sentence a page can print exactly as it stands. */
export function sayFor(code: string): string {
  return SAYINGS[code] ?? SAYINGS.unknown;
}

/** A failure, typed as the failure half alone so it fits any shape of success. */
const no = (code: string): { ok: false; code: string; say: string } => ({ ok: false, code, say: sayFor(code) });
const bad = (error: unknown) => no(codeFor(error));

/**
 * Did the server get a word in, or did the request never arrive?
 *
 * The difference decides whether "we could not read your account" means "you are signed out"
 * or "you are on a train". Getting it wrong is how a header starts flickering.
 */
function unreachable(error: unknown): boolean {
  const why = codeFor(error);
  return why === 'offline' || why === 'paused' || why === 'busy';
}

// ------------------------------------------------------------------ asking for mail

type Ask = (supabase: SupabaseClient, address: string) => Promise<unknown>;

async function ask(email: string, run: Ask): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  const address = typeof email === 'string' ? email.trim() : '';
  if (!looksLikeEmail(address)) return no('address');
  try {
    const supabase = await getClient();
    const error = await run(supabase, address);
    return error ? bad(error) : { ok: true };
  } catch (error) {
    return bad(error);
  }
}

/**
 * The sign-up box. One field, one email.
 *
 * `shouldCreateUser` stays at its default of true, so a brand new address and one that
 * already has an account both get an email and the site says the same thing to both. The
 * alternative leaks which addresses have accounts here. No redirect is sent: the link in that
 * email is written by us, in emails.ts.
 */
export function requestLink(email: string): Promise<Done> {
  return ask(email, async (supabase, address) => {
    const { error } = await supabase.auth.signInWithOtp({ email: address });
    return error;
  });
}

/**
 * Forgot the password. Never `signInWithOtp({ shouldCreateUser: false })`, which answers an
 * unknown address differently and so tells a stranger who has an account here.
 */
export function requestReset(email: string): Promise<Done> {
  return ask(email, async (supabase, address) => {
    const { error } = await supabase.auth.resetPasswordForEmail(address);
    return error;
  });
}

// -------------------------------------------------------------- setting a password

/**
 * A verify that has already succeeded, remembered across calls.
 *
 * Verifying and setting a password are necessarily two requests, and the first one spends
 * the link. If the second fails — a password the project refuses, a connection that drops —
 * the reader presses the button again, and that second press must not verify again: the token
 * is gone and they would be told their perfectly good link had expired. So the second press
 * retries the password alone, on the session the first press already opened.
 */
let verifiedFor: string | null = null;

/**
 * Everything after the link has been spent: the password itself, and the housekeeping.
 *
 * Separate from `finish` because there is a second way in. Somebody whose tab died between
 * the verify and the password comes back to a spent link and a perfectly good session, and
 * `finishWithSession` runs exactly this on it.
 */
async function settle(supabase: SupabaseClient, password: string): Promise<Done> {
  const updated = await supabase.auth.updateUser({ password });
  if (updated.error) return bad(updated.error);
  verifiedFor = null;

  // Supabase has no field that says whether a password exists, and the obvious proxies are
  // unreliable, so the flag is ours. It failing does not make the password any less set.
  await supabase.rpc('mark_password_set');

  const email = updated.data?.user?.email ?? '';
  if (email) markSignedIn(email);

  try {
    await syncNow();
  } catch {
    /* their results are on the device either way, and the next page tries again */
  }

  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token ?? '';
  // Only now is there an account to put on the list, and the address comes from the token
  // on the other side rather than from anything typed here.
  if (token) tellTheList(token, true);

  return { ok: true };
}

async function finish(memo: string, password: string, verify: (s: SupabaseClient) => Promise<unknown>): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  // Locally, BEFORE the link is spent. A password the server would refuse must never cost
  // somebody their email.
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return no('weak');

  try {
    const supabase = await getClient();

    if (verifiedFor !== memo) {
      const error = await verify(supabase);
      if (error) return bad(error);
      verifiedFor = memo;
    }

    return await settle(supabase, password);
  } catch (error) {
    return bad(error);
  }
}

/**
 * Choose a password on the session this browser is already holding.
 *
 * The link was spent on a previous visit — the phone rang, the tab was killed, iOS threw the
 * background tab away — and asking Supabase to verify it again would tell somebody with a
 * live, confirmed account that their perfectly good link had expired. They are signed in.
 * All that is left is the password.
 */
export async function finishWithSession(password: string): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  if (typeof password !== 'string' || password.length < MIN_PASSWORD) return no('weak');

  try {
    const supabase = await getClient();
    const { data } = await supabase.auth.getSession();
    if (!data?.session?.access_token) return no('nosession');
    return await settle(supabase, password);
  } catch (error) {
    return bad(error);
  }
}

/**
 * The emailed link, spent on submit.
 *
 * Type `email` resolves a token against BOTH of the columns Supabase keeps — the one a
 * confirmation writes and the one a reset writes — so it is the right first try whatever the
 * email was. `recovery` reads only the second. The kind came out of a URL, though, and a URL
 * can be mistyped or rewritten in transit, so a token that looks expired gets one honest
 * second try as the other kind before anybody is told to ask for a new email.
 */
export function finishWithToken(a: { tokenHash: string; kind: string; password: string }): Promise<Done> {
  const tokenHash = typeof a?.tokenHash === 'string' ? a.tokenHash.trim() : '';
  const kind = typeof a?.kind === 'string' ? a.kind.trim().toLowerCase() : '';
  const first: 'email' | 'recovery' = kind === 'recovery' ? 'recovery' : 'email';
  const other: 'email' | 'recovery' = first === 'recovery' ? 'email' : 'recovery';

  return finish(`t:${kind}:${tokenHash}`, a?.password, async supabase => {
    if (!tokenHash) return { code: 'otp_expired' };
    let { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: first });
    if (error && codeFor(error) === 'expired') {
      ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: other }));
    }
    return error;
  });
}

/**
 * The six digits printed in the same email, for anyone whose link will not open.
 *
 * Same two tries as the link, for the same reason: `email` is the one that reads both
 * columns, and the second try is what stops somebody reading a thirty-second-old reset code
 * off their phone and being told it has run out.
 */
export function finishWithCode(a: { email: string; code: string; password: string }): Promise<Done> {
  const address = typeof a?.email === 'string' ? a.email.trim() : '';
  const digits = typeof a?.code === 'string' ? a.code.replace(/\s+/g, '') : '';

  return finish(`c:${address}:${digits}`, a?.password, async supabase => {
    if (!address || !digits) return { code: 'otp_expired' };
    let { error } = await supabase.auth.verifyOtp({ email: address, token: digits, type: 'email' });
    if (error && codeFor(error) === 'expired') {
      ({ error } = await supabase.auth.verifyOtp({ email: address, token: digits, type: 'recovery' }));
    }
    return error;
  });
}

// ------------------------------------------------------------------ everyday doors

/** Email and password, thereafter. One message covers both fields, on purpose. */
export async function signIn(email: string, password: string): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  const address = typeof email === 'string' ? email.trim() : '';
  if (!address || typeof password !== 'string' || !password) return no('wrong');

  try {
    const supabase = await getClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: address, password });
    if (error) return bad(error);

    markSignedIn(data?.user?.email ?? address);
    try {
      await syncNow();
    } catch {
      /* signed in is signed in, whether or not the results caught up this second */
    }
    return { ok: true };
  } catch (error) {
    return bad(error);
  }
}

/**
 * Out of this browser only. The default scope logs them out everywhere they own, which is
 * not what anybody means by a "Log out" link. The hint goes whatever the server says: they
 * asked to be logged out here, and here is the part we can honour.
 */
export async function signOut(): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  try {
    const supabase = await getClient();
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* nothing to report: the next line does the part that shows */
  }
  clearSignedIn();
  return { ok: true };
}

/** Who is signed in, as `/account/` needs to know it. */
export interface Who {
  email: string;
  passwordSet: boolean;
  notesOff: boolean;
}

/**
 * Who is signed in, and the two things `/account/` needs to draw its controls.
 *
 * Three answers, not two, because "nobody is signed in" and "we could not ask" are different
 * facts and a page that treats them alike tells somebody on a train that they have no
 * account and offers to make them one they already have.
 *
 *   a `Who`        the server answered, and this is who it said.
 *   `null`         the server answered, and nobody is signed in. The hint goes with it.
 *   `'unreachable'` the request never arrived, or the project is asleep. The hint stays, and
 *                  the page stays as it is with one quiet line.
 */
export async function whoAmI(): Promise<Who | null | 'unreachable'> {
  if (!ACCOUNTS_READY) return null;
  try {
    const supabase = await getClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      // Only the server gets to say somebody is signed out. Somebody in a tunnel has not
      // signed out, and a mark that flips every time the network drops is worse than one
      // that waits.
      if (unreachable(error)) return 'unreachable';
      clearSignedIn();
      return null;
    }
    const email = data.user.email ?? '';
    if (email) markSignedIn(email);

    const { data: row } = await supabase
      .from('profiles')
      .select('password_set_at,notes_off')
      .eq('id', data.user.id)
      .maybeSingle();

    return {
      email,
      passwordSet: Boolean(row?.password_set_at),
      notesOff: Boolean(row?.notes_off)
    };
  } catch (error) {
    // The SDK itself failing to load is the network, not a verdict on anybody's session.
    return unreachable(error) ? 'unreachable' : null;
  }
}

/**
 * Changing it later, from `/account/`. The current one is checked by the server, not here.
 *
 * Every OTHER device is logged out afterwards (OWASP's advice, and the design pass of
 * 2026-09-22): somebody changing a password because they think it has leaked must not leave
 * the person who has it still logged in. This browser stays in; they are standing at it.
 */
export async function changePassword(current: string, next: string): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  if (typeof next !== 'string' || next.length < MIN_PASSWORD) return no('weak');
  if (current === next) return no('same');

  try {
    const supabase = await getClient();
    // `current_password` has been supported since supabase-js 2.102; the cast is only because
    // the published type for the attributes has not caught up with it.
    const attributes = { password: next, current_password: current } as unknown as { password: string };
    const { error } = await supabase.auth.updateUser(attributes);
    if (error) return bad(error);
    try {
      await supabase.auth.signOut({ scope: 'others' });
    } catch {
      /* the password has changed either way; the other sessions run out on their own */
    }
    return { ok: true };
  } catch (error) {
    return bad(error);
  }
}

/**
 * The notes about new quizzes and games, on or off. The profile row is what the site reads.
 *
 * An upsert rather than an update, because there may be no row yet: `mark_password_set`
 * creates it, and that call can be lost on a phone. A PATCH matching nothing is a 204 with
 * no error, so the switch would report success, tell the mailing list, and read as On again
 * on the next visit — every visit saying the setting had not stuck.
 */
export async function setNotes(on: boolean): Promise<Done> {
  if (!ACCOUNTS_READY) return no('off');
  try {
    const supabase = await getClient();
    const { data, error } = await supabase.auth.getUser();
    // Same distinction as whoAmI: a request that never arrived is not somebody signed out.
    if (error || !data?.user) return unreachable(error) ? bad(error) : no('nosession');

    const { error: refused } = await supabase
      .from('profiles')
      .upsert({ id: data.user.id, notes_off: !on }, { onConflict: 'id' });
    if (refused) return bad(refused);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token ?? '';
    if (token) tellTheList(token, on);
    return { ok: true };
  } catch (error) {
    return bad(error);
  }
}

/**
 * Everything an account leaves on this device besides the shelf.
 *
 * The delete room promises that the results and the best scores go "from our side and from
 * this device", and the games keep their own keys straight in localStorage: without this
 * list, somebody who deleted their account met their old best score under the game card on
 * the very next page, which makes a liar of the one unambiguous promise the site makes.
 */
const DEVICE_KEYS: string[] = [...GAME_KEYS, STAMP_KEY, SYNCED_AT_KEY, QUEUE_KEY];

/**
 * Really delete everything. The page says so in one line, so this has to be true of the
 * device as well as the account.
 *
 * `listRemoved` is the one half that can fail on its own: the account is genuinely gone and
 * the mailing contact may not be. It is passed back rather than swallowed so the page can
 * say the true thing instead of a comfortable one.
 */
export async function deleteAccount(): Promise<Done<{ listRemoved: boolean }>> {
  if (!ACCOUNTS_READY) return no('off');
  try {
    const supabase = await getClient();
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token ?? '';
    if (!token) return no('nosession');

    const res = await fetch('/api/auth/delete', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
      body: '{}'
    });
    const body = (await res.json().catch(() => null)) as { error?: unknown; listRemoved?: unknown } | null;

    if (!res.ok) {
      // The route writes better sentences than this file can guess at, and every one of them
      // ends in "Nothing was deleted." — which is the only thing the reader needs to know.
      const why = res.status >= 500 ? 'busy' : 'unknown';
      const said = typeof body?.error === 'string' && body.error ? body.error : sayFor(why);
      return { ok: false, code: why, say: said };
    }

    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      /* the account is gone; the token expires on its own */
    }
    clearSignedIn();
    clearShelf();
    const store = browserStore();
    for (const key of DEVICE_KEYS) {
      try {
        store?.removeItem(key);
      } catch {
        /* blocked storage has nothing to clear */
      }
    }
    // The route always says which half happened. A body that did not parse is not a reason
    // to accuse ourselves of leaving an address behind.
    return { ok: true, listRemoved: body?.listRemoved !== false };
  } catch (error) {
    return bad(error);
  }
}

/**
 * Tell our own route to add or remove the marketing contact. Fire and forget on purpose:
 * whether an address reaches a mailing list is never worth holding up a person who is trying
 * to set a password.
 */
function tellTheList(accessToken: string, notes: boolean): void {
  try {
    void fetch('/api/auth/list', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
      // The route reads `on`, and reads a missing `on` as true. Sending any other name for
      // it would mean switching the notes OFF quietly added the address to the list.
      body: JSON.stringify({ on: notes }),
      keepalive: true
    }).catch(() => {
      /* the account exists either way, and /account/ can set this again */
    });
  } catch {
    /* no fetch, no list, no problem worth showing anybody */
  }
}

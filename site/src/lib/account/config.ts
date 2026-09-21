/**
 * Two switches, and the two values every account call needs.
 *
 * ACCOUNTS_READY asks "is there a project behind this build at all". It is false until the
 * owner pastes two values into Vercel, and while it is false every account page says so in
 * one calm line and nothing on the site tries to reach a server that is not there.
 *
 * ACCOUNT_LINKS_LIVE asks a different question: "may the public see any of this yet". It is
 * a committed constant rather than an environment variable on purpose. Supabase's email hook
 * can only reach production (Vercel previews sit behind a login wall), so the owner has to
 * test the real flow on the real domain — and he must be able to do that at URLs nothing
 * links to, with the header, the result page and the footer exactly as they are today. One
 * line changes here when he is happy.
 *
 * A PREVIEW build is the exception, and IS_PREVIEW is the third switch. The owner can sign
 * in to Vercel and open the branch's preview, so that is where he can look at what a
 * signed-out visitor will see — the header label, the invitation on /me/, the button on a
 * result page — while production still shows none of it. Nobody else can reach a preview.
 *
 * Nothing in this file is secret. The publishable key is meant for the browser; what
 * actually guards the data is row-level security in schema.sql, which is why it can sit in
 * a public bundle without a second thought.
 */

/**
 * Written in by Vite at build time from `VERCEL_ENV` (see `vite.define` in
 * astro.config.mjs). It is a plain identifier rather than an `import.meta.env` read because
 * Vercel sets VERCEL_ENV for the build, not for the browser, and only a `define` carries a
 * build-time value into a static page.
 *
 * Outside that build — the headless tests bundle these modules with esbuild — the identifier
 * simply does not exist, which is why every read of it is guarded by `typeof`.
 */
declare const __WW_VERCEL_ENV__: string | undefined;

/**
 * Vite inlines `import.meta.env.PUBLIC_*` by matching the literal text, so these four
 * expressions must stay spelled out exactly as they are: build them from a variable and
 * they silently become undefined in the browser.
 *
 * Outside Vite there is no `import.meta.env` at all, and reading a property of it throws.
 * The headless test bundles this file with esbuild, so the try is not defensive padding.
 */
function fromEnv(): { url: string; key: string; dev: boolean; links: string } {
  try {
    return {
      url: String(import.meta.env.PUBLIC_SUPABASE_URL ?? '').trim(),
      key: String(import.meta.env.PUBLIC_SUPABASE_KEY ?? '').trim(),
      dev: Boolean(import.meta.env.DEV),
      links: String(import.meta.env.PUBLIC_ACCOUNT_LINKS ?? '').trim()
    };
  } catch {
    return { url: '', key: '', dev: false, links: '' };
  }
}

const env = fromEnv();

/** The project's origin, trailing slash removed so paths can be joined without thinking. */
export const SUPABASE_URL = env.url.replace(/\/+$/, '');

/** The publishable key, sent on the `apikey` header and never as a bearer token. */
export const SUPABASE_KEY = env.key;

/** Both values present, so there is something to talk to. */
export const ACCOUNTS_READY = Boolean(SUPABASE_URL && SUPABASE_KEY);

/** False until the owner says otherwise. This is the one line he flips at the end. */
export const ACCOUNT_LINKS_LIVE: boolean = false;

/**
 * True only in a Vercel PREVIEW build. Production and a local build are both false, and so
 * is anything bundled outside Vite, where the identifier is not there at all.
 */
export const IS_PREVIEW =
  typeof __WW_VERCEL_ENV__ !== 'undefined' && __WW_VERCEL_ENV__ === 'preview';

/**
 * What every entry point on the site asks before showing a door to an account.
 *
 * It answers for signed-OUT people only. What a signed-IN browser sees is gated on
 * ACCOUNTS_READY and the html[data-account="in"] flag instead, so the owner can sign in on
 * the live domain and use the whole thing while the public still sees nothing.
 *
 * The dev override exists so a builder can screenshot the signed-out header locally; it is
 * read only under `import.meta.env.DEV`, so no production build can be talked into it by an
 * environment variable.
 */
export const ACCOUNTS_VISIBLE =
  ACCOUNTS_READY && (ACCOUNT_LINKS_LIVE || IS_PREVIEW || (env.dev && env.links === '1'));

/** The shortest password we accept. Supabase is told the same number in its own settings. */
export const MIN_PASSWORD = 8;

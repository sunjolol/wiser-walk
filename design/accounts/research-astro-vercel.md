# astro-vercel

web_access_worked: true

## What is actually installed (verified locally, not from memory)

| Thing | Value | Source |
|---|---|---|
| astro | **5.18.2** | `site/node_modules/astro/package.json` |
| @astrojs/vercel | **8.2.11** | `site/node_modules/@astrojs/vercel/package.json` |
| @astrojs/sitemap | 3.7.4 | ditto |
| Node (declared + emitted) | `engines.node: 22.x`, function runtime `nodejs22.x` | `site/package.json`, `.vercel/output/functions/_render.func/.vc-config.json` |
| `output` / `build.format` / `trailingSlash` | `'static'` / `'directory'` / unset → default `'ignore'` | `site/astro.config.mjs`, installed schema |
| vercel.json | **does not exist** | — |
| src/middleware.ts | **does not exist** | — |
| `prerender = false` routes | `src/pages/api/subscribe.ts`, `src/pages/r/[quiz]/[code].astro`, `src/pages/c/[quiz]/[codes].astro` | grep |

**Version warning:** docs.astro.build now documents **Astro 7** (the sessions page cites "Added in astro@7.2.0"). Every behaviour below that matters was re-verified against the installed 5.18.2 source rather than taken from the docs.

---

## 1. On-demand API routes inside `output: 'static'`

`export const prerender = false` is all that is needed; the adapter is already installed. The build proves how this lands on Vercel — `site/.vercel/output/config.json`:

```json
{"version":3,"routes":[
  {"handle":"filesystem"},
  {"src":"^/_astro/(.*)$","headers":{"cache-control":"public, max-age=31536000, immutable"},"continue":true},
  {"src":"^/_server-islands/([^/]+?)/?$","dest":"_render"},
  {"src":"^/_image/?$","dest":"_render"},
  {"src":"^/api/subscribe/?$","dest":"_render"},
  {"src":"^/c/([^/]+?)/([^/]+?)/?$","dest":"_render"},
  {"src":"^/r/([^/]+?)/([^/]+?)/?$","dest":"_render"}
]}
```

Three consequences worth building on:

1. `{"handle":"filesystem"}` is first, so **every static page is served from the CDN and never invokes a function**. Adding `/api/auth/*` adds route entries, not cost on existing pages.
2. There is **one** function, `_render.func`. New on-demand routes do not create new functions (relevant to the Hobby "Functions Created per Deployment" limit, which is framework-dependent).
3. The emitted regex is `^/api/subscribe/?$` — **trailing slash already works both ways** on API routes. Name auth routes extensionless (`/api/auth/signin`) and `/api/auth/signin` and `/api/auth/signin/` both hit the handler.

### Shape to copy

`site/src/pages/api/subscribe.ts` is already the house pattern and is correct: a `json()` helper setting `content-type: application/json` + `cache-control: no-store`, an `ALL` export returning 405 with an `allow` header, and a 303 redirect fallback for no-JS form posts. Reuse it verbatim for auth endpoints.

```ts
export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect, locals }) => { … };
```

`APIContext` gives `params`, `request`, `cookies`, `locals`, `redirect(path, status?)`, `url`, `clientAddress`. Cookies and `clientAddress` exist **only** on on-demand routes.

### Cookies — the sharpest edge in this whole brief

`AstroCookies.set()` in 5.18.2 passes your options straight to `cookie.serialize` and **adds no defaults at all** (`site/node_modules/astro/dist/core/cookies/cookies.js`: `const serializeOptions = {}; if (options) Object.assign(serializeOptions, options);`). No `Path`, no `HttpOnly`, no `Secure`, no `SameSite` unless you write them. A cookie set from `/api/auth/signin` without `path` is scoped by the browser to `/api/auth/` and will never be sent to `/me/`.

Always write the full set:

```ts
cookies.set('ww_session', token, {
  path: '/',          // MANDATORY — no default
  httpOnly: true,
  secure: import.meta.env.PROD,   // false on http://localhost
  sameSite: 'lax',    // keeps the cookie on top-level GET returns from the email link
  maxAge: 60 * 60 * 24 * 30
});
```

Full `AstroCookieSetOptions`: `domain`, `expires` (Date), `httpOnly`, `maxAge` (seconds), `path`, `partitioned` (needs `secure: true`), `sameSite` (`boolean | 'lax' | 'none' | 'strict'`), `secure`, `encode()`.

Two more from the source:
- `cookies.delete(key, options)` reuses the options you pass (dropping `maxAge`/`expires`) and writes an expired value — **give it the same `path`** or sign-out silently does nothing.
- `cookies.set` throws `ResponseSentError` once the response has started streaming. Set cookies in an API route, or in the first lines of `.astro` frontmatter, never after render output.

Reading: `cookies.get(key)?.value`, `cookies.has(key)`, `cookies.json()` on the returned `AstroCookie`.

---

## 2. `security.checkOrigin` — do not rely on it for JSON

Default is `true` (confirmed in the installed schema: `ASTRO_CONFIG_DEFAULTS.security.checkOrigin = true`). The actual implementation, `site/node_modules/astro/dist/core/app/middlewares.js`:

```js
if (context.isPrerendered) return next();              // static pages: skipped
if (['GET','HEAD','OPTIONS'].includes(method)) return next();
const isSameOrigin = request.headers.get('origin') === url.origin;
if (hasContentType) {
  if (formLike && !isSameOrigin) return 403;           // urlencoded | multipart | text/plain
} else if (!isSameOrigin) return 403;                  // no content-type at all
return next();                                         // application/json ALWAYS passes
```

So for this feature:

- The **no-JS form POST** path (as `/api/subscribe` supports) is protected by Astro automatically.
- A **JSON POST is not protected at all**, whatever the Origin. Every auth endpoint must do its own check.

Our own defence, to write once in a shared helper:

```ts
const sameOrigin = (request: Request, url: URL) => {
  const o = request.headers.get('origin');
  if (!o) return false;                // browsers always send Origin on POST
  return o === url.origin;
};
// in each auth POST:
if (!sameOrigin(request, url)) return json(403, { ok:false, error:'Bad origin.' });
```

Combined with `sameSite: 'lax'` session cookies (which are not sent on cross-site POST at all), that is a complete CSRF story. `sameSite: 'strict'` would break the return from the emailed link; `'lax'` is right. Keep `security.checkOrigin` at its default — it costs nothing and covers the form path.

---

## 3. Middleware: safe to add, but probably unnecessary

- **Prerendered pages:** middleware runs at **build time only**. On Vercel a static page is served by `{"handle":"filesystem"}` before any function exists, so `src/middleware.ts` can never see a request for `/`, `/me/`, `/about/`. Do not plan on middleware to gate a static page.
- **On-demand routes:** middleware runs per request, inside the same `_render` function.
- **Cost:** adding `src/middleware.ts` does **not** convert static pages into invocations. The build already emits a `_noop-middleware.mjs`; middleware is bundled into the one function.
- **Edge middleware:** installed adapter 8.2.11 uses `edgeMiddleware` (default `false`). The live docs' `middlewareMode: 'edge'` belongs to a newer major and would be ignored. Leave it off — it would add a second function in front of requests for no gain here.

Verdict: put auth logic in the endpoints and in per-page frontmatter on the few `prerender = false` pages. Middleware earns its place only if several on-demand pages need the same "who is this" lookup — then use `context.locals.user`.

---

## 4. Environment variables

### What the build actually does

From the compiled chunk `site/.vercel/output/_functions/chunks/env_CLc41-d-.mjs`:

```js
const __vite_import_meta_env__ = {"ASSETS_PREFIX":undefined,"BASE_URL":"/","DEV":false,
  "MODE":"production","PROD":true,"SITE":"https://wiserwalk.com","SSR":true};
function readEnv(locals) {
  const fromVite = Object.assign(__vite_import_meta_env__, {}) ?? {};
  const fromNode = typeof process !== 'undefined' ? process.env : {};
  …
}
```

`import.meta.env` is a **frozen literal** with only the built-ins. Spreading it gives you nothing project-specific. `BREVO_API_KEY` works today purely because `process.env` is spread after it. So:

- **Server secrets → `process.env.X`** (or `getSecret('X')` from `astro:env/server`). Never `import.meta.env.SUPABASE_SERVICE_ROLE_KEY`.
- **Client values → `import.meta.env.PUBLIC_X`, written literally at the point of use** so Vite can inline it. The existing `site/src/lib/support.ts` is the correct model (`import.meta.env.PUBLIC_SUPPORT_URL`). A `PUBLIC_` value read through `readEnv()` will be absent in the browser.
- Reuse `site/src/lib/email/env.ts`'s `readEnv(locals)` for server code; it already merges Vite → process → `locals.runtime.env` in the right order.

### Build-time inlining and redeploys

`PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are baked into the client JS at build. Vercel: "Any change you make to environment variables are not applied to previous deployments, they only apply to new deployments." **The owner's numbered steps must end with "then redeploy"** — otherwise he pastes keys, sees nothing change, and concludes it is broken.

### Preview vs Production scoping

Variables are scoped per environment (Production / Preview — optionally per-branch / Development / custom). Set Supabase keys for **both Production and Preview** or every preview build of `feature/accounts` ships a dead auth client. Branch-specific preview vars override generic preview vars of the same name. Limits: 1000 vars per environment, 64 KB total per deployment.

### astro:env (optional)

Available in 5.18.2 (`astro/package.json` exports `./env`, `./env/runtime`, `./env/setup`; `envField` is exported from `astro/config`). A schema gives build-time validation and a clear error when a key is missing:

```js
env: { schema: {
  PUBLIC_SUPABASE_URL:      envField.string({ context:'client', access:'public' }),
  PUBLIC_SUPABASE_ANON_KEY: envField.string({ context:'client', access:'public' }),
  SUPABASE_SERVICE_ROLE_KEY: envField.string({ context:'server', access:'secret', optional:true }),
}}
```

`context:'client' + access:'secret'` is rejected by design. Worth it precisely because the owner will be pasting keys by hand: a build that fails loudly beats a site that 503s quietly. Keep `optional: true` on anything that must be allowed to be unset (same principle as the current 503 "Sign-up is not switched on yet").

---

## 5. Vercel Hobby limits that matter

- **Invocations:** 1,000,000/month included; also 4 hours Active CPU and 360 GB-hrs Provisioned Memory. Sign-in traffic will not come close; a naive "check session on every page view" pattern could, so paint header state from a cookie, not a fetch.
- **Duration:** with fluid compute (on by default) Hobby default **300s**, max **300s**. Legacy non-fluid projects: 10s default, 60s max. Confirm which this project is before relying on more than ~10s. Set per-function limits via `maxDuration` in the adapter options or `functions` in `vercel.json`.
- **Cron:** 100 jobs per project on every plan, but Hobby is **once per day, ±59 minutes**. A more frequent expression **fails the deployment** with "Hobby accounts are limited to daily cron jobs." Timezone is always UTC. Triggered by an HTTP **GET** to the production URL, user agent `vercel-cron/1.0`, with an `x-vercel-cron-schedule` header. Guard any cron endpoint by checking a `CRON_SECRET` in the `Authorization` header — an unguarded `/api/cron/*` is a public URL.
- **Where `vercel.json` goes:** `site/vercel.json` (the configured Root Directory). Confirmed twice: Vercel says "This file should be created in your project's root directory", and the installed adapter reads `new URL('vercel.json', config.root)` and errors on a `trailingSlash` conflict with the Astro config. Do **not** put it at the repo root — it will be ignored.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [{ "path": "/api/cron/expire-tokens", "schedule": "0 4 * * *" }]
}
```

Because the schedule is only accurate to the hour, expire tokens by a timestamp comparison in the query; treat the cron as tidy-up, never as the security boundary.

- **Caching JSON:** a function response is CDN-cached **only** if `Cache-Control` carries `s-maxage`. It is never cached if it contains `set-cookie`, or `private`/`no-cache`/`no-store`, or if the request had an `Authorization` header, or if `Vary` names `Cookie`. Sign-in responses are therefore safe by construction, but keep the existing `cache-control: no-store` on every auth JSON response — it is one line and removes the whole question.

---

## 6. Client scripts in Astro components

- A plain `<script>` (no attributes but `src`) is **processed**: TypeScript, bundled with its imports, emitted as `type="module"`, deduplicated when the component repeats, inlined when small. This is what to use for anything importing `@supabase/supabase-js`.
- `is:inline` is **not** processed: "rendered into the HTML exactly as written! Not transformed: no TypeScript and no import resolution". `site/src/layouts/Base.astro` already uses three of them (theme paint before first paint, the analytics `beforeSend` hook). It duplicates per render and has no imports — correct for tiny, must-run-first code, wrong for anything with a dependency.
- **Header state without slowing static pages:** keep it in the existing `is:inline` block — read a small non-httpOnly hint cookie (e.g. `ww_signed_in=1`, set alongside the httpOnly session cookie) and set `document.documentElement.dataset.signedin`, exactly as the theme script sets `dataset.theme`. Zero network, no flash, works on a CDN-cached page. The real session cookie stays httpOnly and is never read by JS.
- **Lazy-loading Supabase:** in a processed `<script>`, `const { createClient } = await import('@supabase/supabase-js')` inside the click/submit handler keeps the library out of the initial payload for the 95% of visitors who never sign in. Prefer `@supabase/supabase-js` only where it is genuinely needed (the set-password page and the sign-in form); the header hint needs none of it.
- Note `astro:page-load` / view transitions are not in use here, so a processed script runs once per page load normally.

---

## 7. Trailing slashes, `build.format: 'directory'`, and `/account/set-password/`

- `build.format: 'directory'` is set, so `src/pages/account/set-password.astro` builds to `account/set-password/index.html` and the canonical URL is `/account/set-password/` — matching every other page and the sitemap.
- `trailingSlash` is unset → `'ignore'` in 5.18.2, so both forms match. **Do not** add a `trailingSlash` to `site/vercel.json`: the adapter explicitly errors on a conflict, and the apex/`www` 308 arrangement in `astro.config.mjs` is already settled.
- **Query strings are untouched** by any of this. `/account/set-password/?code=abc` and `/account/set-password/#access_token=…` both resolve normally, and a hash never reaches the server at all (which is how Supabase's implicit recovery link works — the token is fragment-only, so it cannot leak into Vercel logs, analytics, or the `Referer`).
- **API routes with a trailing slash do not 404** here: the emitted regex ends `/?$`. Verified against the real build output, not assumed.
- Keep auth route filenames extensionless. An endpoint whose URL includes a file extension (`foo.json.ts`) "can only be accessed without a trailing slash" — an avoidable trap.
- If `/account/set-password/` ends up needing to set a cookie server-side, it needs `export const prerender = false` and moves into `_render`; if the token exchange happens entirely in the browser, leave it static and it costs nothing.

---

## 8. Recommended shape for this feature (mechanics only)

1. **Static pages:** `/account/sign-in/`, `/account/set-password/`, `/account/forgot/` stay prerendered wherever possible; the Supabase client does the work in a processed `<script>` with a lazy `import()`.
2. **On-demand endpoints** under `src/pages/api/auth/` with `prerender = false`, each: same-origin check → validate → `cookies.set(..., { path:'/', httpOnly:true, secure:PROD, sameSite:'lax', maxAge })` → `json(status, body)` with `cache-control: no-store`. `ALL` export returns 405.
3. **Header state** from a non-httpOnly hint cookie read in the existing `is:inline` script.
4. **No middleware, no Astro sessions, no edge middleware** unless a later step proves the need.
5. **`site/vercel.json`** created only when the first cron exists; keep it to `$schema` + `crons`.
6. **Env:** `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` referenced literally in client code; any secret through `process.env`; optionally declare all four in an `env.schema` so a missing key fails the build instead of the user's sign-in. Owner's steps must end in "redeploy", and the keys must be set for **Preview as well as Production**.

## gotchas
- security.checkOrigin does NOT protect JSON POSTs. In Astro 5.18.2 a cross-origin POST with content-type: application/json sails straight through. Every auth endpoint (/api/auth/*) must check the Origin header itself — do not assume Astro's CSRF protection covers it.
- checkOrigin DOES 403 a POST with no content-type header at all from a foreign origin — an easy way to be confused when testing with curl (curl sends no content-type unless you set one).
- Astro.cookies.set adds no defaults whatsoever. A session cookie written as cookies.set('ww_session', v, { httpOnly: true }) gets no Path, so the browser scopes it to the directory of the URL that set it (e.g. /api/auth/) and it will not be sent to /me/. Always pass path: '/', httpOnly: true, secure: true, sameSite: 'lax', maxAge.
- cookies.delete must be given the same path (and domain) as the set call, or the cookie is not cleared — a sign-out that silently does nothing.
- cookies.set throws ResponseSentError once the response has started streaming. Set cookies in an API route, or at the very top of an .astro page's frontmatter, never after output has begun.
- import.meta.env in the server bundle compiles to a frozen literal with only MODE/PROD/DEV/BASE_URL/SITE/SSR — spreading it (as site/src/lib/email/env.ts does) yields none of the real secrets. Secrets reach the function via process.env only. This is verified in the built chunk, not theory.
- PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY are inlined into client bundles at BUILD time. Changing them in Vercel requires a redeploy — Vercel states env changes 'only apply to new deployments'. Tell the owner this in the numbered steps or he will change a key, see no effect, and assume he did it wrong.
- A PUBLIC_ var referenced only through a spread helper (readEnv()) will NOT appear in client code. Client-side code must write import.meta.env.PUBLIC_SUPABASE_URL literally for Vite to inline it.
- Vercel env vars are scoped per environment. If Supabase keys are set for Production only, every preview deploy of feature/accounts gets an unconfigured client and auth appears broken on previews.
- Adding src/middleware.ts costs nothing on static pages — {"handle":"filesystem"} runs first in config.json, so static HTML never invokes the function. But middleware then runs on every /r/, /c/ and /api/ request inside the same _render function. Do not enable adapter edgeMiddleware (default false); it would add an edge function in front of requests and is unnecessary here.
- The live @astrojs/vercel docs describe middlewareMode: 'edge'; the installed 8.2.11 only knows edgeMiddleware. Copying the current doc snippet would silently do nothing.
- Vercel's own Astro maxDuration example still imports '@astrojs/vercel/serverless' — that path is from adapter v7. This project correctly imports '@astrojs/vercel'.
- vercel.json must live at site/vercel.json (the Root Directory), not the repo root. The adapter also reads site/vercel.json and will error on a trailingSlash conflict with the Astro config.
- Hobby crons run once per day at most and only to ±59 minutes. Anything more frequent fails the deployment outright. A 'delete expired sessions/tokens' cron is therefore at best daily and imprecise — expire tokens by timestamp in the query, never rely on a sweeper running on time.
- Any response carrying set-cookie is never CDN-cached, so sign-in responses are safe by default; but keep cache-control: no-store on every auth JSON response anyway, the way site/src/pages/api/subscribe.ts already does.
- Endpoints with a file extension in the path cannot be reached with a trailing slash. Keep auth routes extensionless (/api/auth/signin) — the emitted regex ^/api/auth/signin/?$ then accepts both forms.
- Astro sessions (5.7+) have no default driver on Vercel and would need session.driver configured plus external storage. Do not reach for them; a signed httpOnly cookie holding the Supabase session is simpler and is what the owner can debug least often.
- docs.astro.build is now on Astro 7. Anything read there about defaults, script ordering, or env handling may describe v6/v7 behaviour, not the installed 5.18.2. Verify against node_modules before relying on it.
- Astro 5 still rewrites non-public import.meta.env.X to process.env.X server-side; Astro v6 removes that. If the site is ever upgraded, any code reading a secret through import.meta.env breaks. Read secrets from process.env (or astro:env getSecret) now and the upgrade is a non-event.

## open_questions
- Is Fluid compute actually enabled on this Vercel project? It changes Hobby duration from 10s default / 60s max (legacy) to 300s / 300s, and changes how usage is billed. Check Project Settings > Functions before promising any timeout budget.
- Does the project currently sit inside a Hobby personal account? Vercel does not support connecting a Hobby-team project to Git-organization repos; github.com/sunjolol/wiser-walk is personal, so this is presumably fine, but a future move to an org repo forces a Team.
- Will /account/set-password/ need server rendering at all? If the Supabase recovery token is handled entirely by supabase-js in the browser (it arrives in the URL fragment), the page can stay static and cost zero invocations. If the flow uses a ?code= query with PKCE exchange on the server, that page needs prerender = false. This choice decides whether /account/* adds function routes.
- Should signed-in header state be painted from a non-httpOnly 'ww.signed_in=1' hint cookie (readable by the existing is:inline script with zero network) or from a fetch to /api/auth/session on every page? The former keeps static pages instant; it needs a decision because it means writing two cookies at sign-in.
- Does the owner want Preview deployments to talk to the same Supabase project as Production? Sharing one project is fewer manual steps for him; separate projects avoid test accounts landing in the real users table and in Brevo.

## facts
- [verified-live] Installed versions in site/node_modules: astro 5.18.2, @astrojs/vercel 8.2.11, @astrojs/sitemap 3.7.4. package.json declares engines.node 22.x and only three dependencies. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/package.json)
- [verified-live] docs.astro.build now documents Astro 7.x (the sessions page cites 'Added in astro@7.2.0'), so live doc pages describe a major version two ahead of the installed 5.18.2. Behaviour claims in this brief were therefore re-verified against the installed source where it matters. (https://docs.astro.build/en/guides/sessions/)
- [verified-live] security.checkOrigin defaults to true in the installed Astro (ASTRO_CONFIG_DEFAULTS.security.checkOrigin = true, schema z.boolean().default(...)). (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/dist/core/config/schemas/base.js)
- [verified-live] Astro 5.18.2's origin check: skips prerendered routes (context.isPrerendered), skips GET/HEAD/OPTIONS, then 403s only when (a) the content-type is form-like — application/x-www-form-urlencoded, multipart/form-data, text/plain — and Origin !== url.origin, or (b) there is NO content-type header at all and the origin mismatches. A POST with content-type: application/json and a foreign Origin passes through unchecked. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/dist/core/app/middlewares.js)
- [verified-live] Astro docs state checkOrigin default true since 4.9.0, checks POST/PATCH/DELETE/PUT with those three content types, and returns 403 on failure — they do not mention the missing-content-type branch that the installed source also blocks. (https://docs.astro.build/en/reference/configuration-reference/)
- [verified-live] AstroCookies.set(key, value, options) passes options straight to cookie.serialize with NO defaults added — no path, httpOnly, secure or sameSite unless you pass them. cookies.delete(key, options) reuses the options you give it (ignoring maxAge/expires) and sets an expired value, so it only clears a cookie when given the same path/domain that set it. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/dist/core/cookies/cookies.js)
- [verified-live] AstroCookieSetOptions accepts domain, expires (Date), httpOnly, maxAge (seconds), path, partitioned (requires secure:true), sameSite (boolean | 'lax' | 'none' | 'strict'), secure, encode(). cookies/clientAddress are 'only available for routes rendered on demand and cannot be used on prerendered pages'. (https://docs.astro.build/en/reference/api-reference/)
- [verified-live] AstroCookies.set throws ResponseSentError if the response has already been sent (i.e. after HTML streaming has begun), so cookies must be set before any rendering output in an .astro page. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/dist/core/cookies/cookies.js)
- [verified-live] Astro middleware runs at build time for prerendered pages and only at request time for on-demand routes; 'This rendering occurs at build time for all prerendered pages'. (https://docs.astro.build/en/guides/middleware/)
- [verified-live] The project's own build output proves static pages never reach a function: .vercel/output/config.json routes begin with {"handle":"filesystem"}, then map only ^/_server-islands/..., ^/_image/?$, ^/api/subscribe/?$, ^/c/([^/]+?)/([^/]+?)/?$ and ^/r/([^/]+?)/([^/]+?)/?$ to a single function named _render. (C:/Users/Light/Desktop/claude/theology compass/site/.vercel/output/config.json)
- [verified-live] The emitted API route regex is ^/api/subscribe/?$, so /api/subscribe and /api/subscribe/ both reach the function; Astro's trailingSlash default is 'ignore' in the installed version, and build.format is set to 'directory' in astro.config.mjs. (C:/Users/Light/Desktop/claude/theology compass/site/.vercel/output/config.json)
- [verified-live] Exactly one function is emitted, .vercel/output/functions/_render.func, with .vc-config.json {runtime: nodejs22.x, handler: dist/server/entry.mjs, launcherType: Nodejs, supportsResponseStreaming: true}. Adding more on-demand routes adds routes to that one function, not new functions. (C:/Users/Light/Desktop/claude/theology compass/site/.vercel/output/functions/_render.func/.vc-config.json)
- [verified-live] @astrojs/vercel 8.2.11 exposes the option name edgeMiddleware (default false) — NOT middlewareMode:'edge', which the current live docs describe for a newer adapter major. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/@astrojs/vercel/dist/index.js)
- [verified-live] The installed adapter reads vercel.json from new URL('vercel.json', config.root) — i.e. site/vercel.json — and errors if its trailingSlash contradicts the Astro trailingSlash config. (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/@astrojs/vercel/dist/index.js)
- [verified-live] In the built server bundle, import.meta.env is replaced by a frozen literal __vite_import_meta_env__ = {ASSETS_PREFIX: undefined, BASE_URL: '/', DEV: false, MODE: 'production', PROD: true, SITE: 'https://wiserwalk.com', SSR: true} — it contains no BREVO_API_KEY or other project secret. readEnv()'s real values therefore come from process.env at runtime. (C:/Users/Light/Desktop/claude/theology compass/site/.vercel/output/_functions/chunks/env_CLc41-d-.mjs)
- [verified-live] Astro docs: 'Only environment variables prefixed with PUBLIC_ are available in client-side code', and those are 'statically replaced at build time', inlined into client bundles rather than read at runtime. (https://docs.astro.build/en/guides/environment-variables/)
- [verified-live] astro:env is available in the installed version: astro/package.json exports ./env, ./env/runtime, ./env/setup, and envField is exported from astro/config (alongside defineConfig, fontProviders, getViteConfig, mergeConfig, passthroughImageService, sharpImageService, validateConfig). (C:/Users/Light/Desktop/claude/theology compass/site/node_modules/astro/package.json)
- [verified-live] astro:env: context is 'client' or 'server', access is 'public' or 'secret'; 'Secret client variables are not supported because there is no safe way to send this data to the client'; getSecret() from astro:env/server retrieves raw values and is recommended over direct process.env for adapter compatibility. (https://docs.astro.build/en/reference/modules/astro-env/)
- [verified-live] Vercel: 'Any change you make to environment variables are not applied to previous deployments, they only apply to new deployments.' Variables scope to Production, Preview (optionally per-branch), custom environments and Development; branch-specific preview vars override other preview vars of the same name. (https://vercel.com/docs/environment-variables)
- [verified-live] Vercel Hobby cron limits: 100 cron jobs per project, minimum interval once per day, scheduling precision per-hour (±59 min). 'Hobby accounts are limited to daily cron jobs. This cron expression would run more than once per day.' is a deployment-time failure for anything more frequent. (https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [verified-live] Cron mechanics: Vercel makes an HTTP GET to the production deployment URL at the vercel.json crons[].path (must start with /), user agent is always vercel-cron/1.0, and each request carries an x-vercel-cron-schedule header. Timezone is always UTC; alternative expressions like MON or JAN are unsupported; day-of-month and day-of-week cannot both be set. (https://vercel.com/docs/cron-jobs)
- [verified-live] vercel.json crons syntax: an array of objects with required path (max 512 chars, must start with /) and required schedule (max 256 chars). headers entries are {source, headers:[{key, value}]}; functions entries are keyed by glob with maxDuration. (https://vercel.com/docs/project-configuration/vercel-json)
- [verified-live] vercel.json 'should be created in your project's root directory' — with a Root Directory of site/ set in project settings, that means site/vercel.json. (https://vercel.com/docs/project-configuration/vercel-json)
- [verified-live] Hobby monthly allowances for Fluid-compute functions: 4 hours Active CPU, 360 GB-hrs Provisioned Memory, 1 million Invocations. Invocations count every request regardless of success. (https://vercel.com/docs/functions/usage-and-pricing)
- [verified-live] With fluid compute (enabled by default), Hobby function duration default is 300s and maximum is 300s. The legacy table (projects deployed before 23 April 2025 not using fluid compute) shows Hobby default 10s, maximum 60s. (https://vercel.com/docs/functions/configuring-functions/duration)
- [verified-live] Vercel CDN caches a function response only when Cache-Control contains s-maxage (optionally with stale-while-revalidate). A response is NOT cacheable if it contains a set-cookie header, or private/no-cache/no-store in Cache-Control, or if the request carries an Authorization header, or if Vary names Cookie. (https://vercel.com/docs/caching/cdn-cache)
- [verified-live] Astro <script> tags with no attributes (other than src) are bundled, treated as TypeScript, emitted as type=module, deduplicated across repeated components and inlined when small; is:inline opts out entirely — 'Will be rendered into the HTML exactly as written! Not transformed: no TypeScript and no import resolution by Astro.' (https://docs.astro.build/en/guides/client-side-scripts/)
- [verified-live] Endpoints whose URLs include a file extension (e.g. src/pages/sitemap.xml.ts) 'can only be accessed without a trailing slash' regardless of configuration. (https://docs.astro.build/en/guides/endpoints/)
- [verified-live] Astro sessions became stable in 5.7.0 but have no default driver on the Vercel adapter — session.driver must be specified manually. That makes them a poor fit for auth state here versus a plain cookie. (https://docs.astro.build/en/guides/sessions/)
- [verified-live] Astro v6 breaking changes that would bite this codebase later: Node 22.12.0+ required, and 'Non-public environment variables no longer transform to process.env automatically' plus 'import.meta.env values are always inlined and never coerced'; script/style render order changes; all official adapters went to a new major with Vite 7. (https://docs.astro.build/en/guides/upgrade-to/v6/)
- [verified-live] The site currently has no vercel.json and no src/middleware.ts; prerender=false appears in exactly three files: src/pages/api/subscribe.ts, src/pages/r/[quiz]/[code].astro and src/pages/c/[quiz]/[codes].astro. src/layouts/Base.astro contains three is:inline scripts (theme paint, analytics beforeSend, and one further down). (C:/Users/Light/Desktop/claude/theology compass/site/src/layouts/Base.astro)
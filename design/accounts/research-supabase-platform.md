# supabase-platform

web_access_worked: true

## Verdict up front

Supabase Free will do what the owner asked, and the Send Email hook **is** on the Free plan — but there are two things that will bite a low-traffic site, and both must be designed around before a line of code:

1. **Free projects pause after ~7 days of low activity, and a paused project returns HTTP 540 to everything.** No sign-in, no password reset, no profile. On a site with a handful of visitors a week this is not hypothetical. Either add a daily keep-alive request or plan on Pro ($25/mo).
2. **Supabase's built-in email sender only delivers to the project team's own addresses** (and 2/hour). Email must be wired to Brevo *before* the first real sign-up, or every sign-up silently fails with "Email address not authorized."

---

## 1. Free plan, as the pricing page states it today

| | Free |
|---|---|
| Monthly active users | 50,000 |
| Database | 500 MB (shared CPU, 500 MB RAM) |
| Egress | 5 GB + 5 GB cached |
| File storage | 1 GB |
| Active projects | 2 (across all orgs where he is Owner/Admin; paused ones don't count) |
| Pausing | "Free projects are paused after 1 week of inactivity" |

MAU = "distinct users who sign in or refresh their token during the billing cycle", counted once each. 50,000 is not a constraint for this site.

**Pausing detail.** "Supabase pauses Free Plan projects that show low activity over a 7-day period." Activity is real database/API traffic — "a few user requests to the database each day over the previous week is enough to keep the project from being paused." Dashboard browsing does not count. Restore window is **1 year**, from **Dashboard → select organization → select the paused project → "Resume project" → confirm**. While paused, every API/auth request returns **HTTP 540** ("The project cannot process requests until it is un-paused by the owner"). Pro is documented as never paused for inactivity.

**Keep-alive:** the docs are silent on whether a scheduled ping is allowed. It is not forbidden; the Fair Use / Acceptable Use policy reserves restrictions for abuse. A once-a-day `GET /rest/v1/<tiny table>?select=id&limit=1` from a Vercel cron or GitHub Actions is the usual pattern. Treat it as an undocumented-but-common practice, not a guarantee.

---

## 2. API keys — exact paths and header rules

**Dashboard: `Settings > API Keys` → tab "Publishable and secret API keys".**

- **`sb_publishable_...`** — safe in the browser. Maps to Postgres role `anon` when nobody is signed in, `authenticated` when a user token is present. RLS applies.
- **`sb_secret_...`** — server only. Maps to `service_role`, has `BYPASSRLS`. Returns **401 if a browser User-Agent is detected**.
- Legacy `anon` / `service_role` JWTs still exist and still work; **Supabase is deprecating them by the end of 2026**. Disabling them is a separate, deliberate step on the same screen.

**The header rule that will cost time if missed:**

> "Send publishable and secret keys on the `apikey` header, not on `Authorization: Bearer`."

Because the new keys are not JWTs, sending a secret key as Bearer makes the platform try to parse it as a JWT and reject with `Invalid JWT`. This applies to `/rest/v1` and `/auth/v1` alike.

Plain-fetch shapes:

```
# anonymous / public read
GET https://<ref>.supabase.co/rest/v1/profiles?select=*
apikey: sb_publishable_...
Authorization: Bearer sb_publishable_...

# as the signed-in user, so RLS applies
GET https://<ref>.supabase.co/rest/v1/results?select=*
apikey: sb_publishable_...
Authorization: Bearer <user access_token>

# server-side admin, bypasses RLS
apikey: sb_secret_...          <-- NOT Authorization: Bearer
```

**Verifying a token on our server** (two options):

- **JWKS:** `GET https://<ref>.supabase.co/auth/v1/.well-known/jwks.json` — asymmetric (ES256/RS256) keys, cached at the edge for 10 minutes; verify locally with `jose`. No network round-trip per request once cached.
- **Ask Supabase:** `GET https://<ref>.supabase.co/auth/v1/user` with the publishable key in `apikey` and the JWT in `Authorization`. HTTP 200 = valid. Simpler, one round-trip per check, and the only option for HS256 shared-secret projects.

Access token (JWT) default expiry is **3600s / 1 hour** (`Authentication > Sessions`, max 604800). Refresh-token reuse interval is 10s and should not be changed.

---

## 3. Email — the decision that shapes the whole build

### Default sender: unusable
- **2 messages per hour**
- **only delivers to project team members' addresses**; anyone else gets `Email address not authorized.`

### Option A — Custom SMTP through Brevo's relay (fewer moving parts, more dashboard steps)

**Path: `Authentication > Emails > SMTP Settings` → `supabase.com/dashboard/project/_/auth/smtp`**

Fields (Management API names in brackets):
- Sender email `[smtp_admin_email]`
- Sender name `[smtp_sender_name]`
- Host `[smtp_host]` — Brevo relay, ports **587** or **2525** plain, **465** with SSL/TLS
- Port `[smtp_port]`
- Username `[smtp_user]` — Brevo's SMTP login (either his account email or an auto-generated `[ID]@smtp-brevo.com`)
- Password `[smtp_pass]` — **the Brevo SMTP key, not the API key**; Brevo dashboard → **SMTP and API settings → SMTP tab**
- Minimum interval between emails `[smtp_max_frequency]`, default `1m`

**Then immediately:** `Authentication > Rate Limits` → `supabase.com/dashboard/project/_/auth/rate-limits` — custom SMTP imposes a fresh **30 messages/hour** cap. Raise it.

Email copy then lives in the Supabase dashboard at `Authentication > Emails > Templates` (`/auth/templates`).

### Option B — Send Email auth hook (copy lives in our repo, but a hard 5s budget)

**Available on Free and Pro.** Path: `Authentication > Hooks` → `supabase.com/dashboard/project/_/auth/hooks`.

When enabled, **"Auth Hook handles email sending (SMTP not used)"** — the SMTP screen and the dashboard templates are both bypassed. Supabase POSTs to our HTTPS endpoint; we render the email ourselves and send it via `POST https://api.brevo.com/v3/smtp/email` (headers `api-key`, `Content-Type: application/json`; body `sender`, `to`, `subject`, `htmlContent`).

Payload:

```json
{
  "user": { "id": "...", "email": "...", "app_metadata": {...}, "user_metadata": {...} },
  "email_data": {
    "token": "305805",
    "token_hash": "7d5b7b19...",
    "email_action_type": "signup",     // signup | recovery | magiclink | invite | email_change | reauthentication
    "redirect_to": "...",
    "site_url": "https://wiserwalk.com"
  }
}
```

Security: Standard Webhooks. Secret is `v1,whsec_<base64>` (generated on the Hooks screen); headers `webhook-id`, `webhook-timestamp`, `webhook-signature`; verify with `standardwebhooks@1.0.0`, storing only the `<base64>` portion in the env var.

**The constraint that decides it:** **5s timeout for the entire webhook invocation, including retries**; retries only on 429/503 with 2s backoff; 20KB payload cap. A cold Vercel function plus a Brevo API call can exceed 5s. Realistic reading: Option B is genuinely fewer manual steps for him and puts the email copy under version control, but it trades a dashboard chore for an occasional lost sign-up email unless the handler is trivial and kept warm. **Recommend Option A for launch; Option B is worth revisiting once traffic keeps a function warm.**

---

## 4. URL configuration

**Path: `Authentication > URL Configuration` → `supabase.com/dashboard/project/_/auth/url-configuration`**

- **Site URL** — the default redirect when no `redirectTo` is supplied. Set to `https://wiserwalk.com`.
- **Redirect URLs** — allow-list. Wildcards: `*` (non-separator run), `**` (anything), `?` (one non-separator char).
- For Vercel previews the documented pattern is `https://*-<team-or-account-slug>.vercel.app/**`, alongside `http://localhost:3000/**` (ours would be `http://localhost:4321/**`).
- `emailRedirectTo` / `redirectTo` is validated against this list. In the template, use `{{ .RedirectTo }}` in place of `{{ .SiteURL }}` so the link honours it.

---

## 5. Email templates

**Path: `Authentication > Emails > Templates` → `supabase.com/dashboard/project/_/auth/templates`**

Auth templates: **Confirm sign up, Invite user, Magic link or OTP, Change email address, Reset password, Reauthentication.** Plus security notifications (password changed, email address changed, sign-in method linked/removed, verification method added/removed).

Variables: `{{ .ConfirmationURL }}`, `{{ .Token }}` (6-digit), `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .RedirectTo }}`, `{{ .Email }}`, `{{ .Data }}` (from `auth.users.user_metadata`).

Managed three ways: dashboard builder (hosted), **Management API** `PATCH /v1/projects/{ref}/config/auth` (fields `mailer_subjects_confirmation`, `mailer_templates_confirmation_content`, `mailer_subjects_recovery`, `mailer_templates_recovery_content`, `mailer_subjects_magic_link`, …), or `supabase/config.toml` `[auth.email.template.<type>]` with `subject` + `content_path` for `invite | confirmation | recovery | magic_link | email_change`. Both non-dashboard routes need a personal access token / CLI link, so they reduce *his* steps only if we run them.

**Link-scanner warning from the docs:** spam filters prefetch URLs and burn one-time tokens. Mitigation is the `{{ .TokenHash }}` pattern — the email links to **our** page and redeems the token only on a real click:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/account/set-password
```

---

## 6. The exact flow he asked for

**Sign up (email only) → emailed link → set a password → thereafter email + password.**

1. Sign-up box calls `supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: 'https://wiserwalk.com/auth/confirm?next=/account/set-password' } })`. It creates the user and sends a link.
2. `/auth/confirm` reads `token_hash` + `type` and calls `supabase.auth.verifyOtp({ token_hash, type: 'email' })` → the user now has a session.
3. `/account/set-password` requires that live session and calls `supabase.auth.updateUser({ password })`.
4. Afterwards: `supabase.auth.signInWithPassword({ email, password })`.
5. Forgot password: `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://wiserwalk.com/auth/confirm?next=/account/set-password' })` — the same landing page, `type=recovery`.
6. Google later: adding an OAuth provider does not disturb any of the above.

REST equivalents if we skip the SDK: `POST /auth/v1/otp`, `POST /auth/v1/verify`, `PUT /auth/v1/user`, `POST /auth/v1/token?grant_type=password`, `POST /auth/v1/recover`.

**Write BOTH templates.** `signInWithOtp` sends the **Confirm sign up** template to an address it has never seen and the **Magic link** template to one it has. Wording must match on both, since step 1 is used for sign-up *and* re-entry.

**Password rules:** `Authentication > Sign In / Providers > Email` (`/auth/providers?provider=Email`) — minimum length and required character classes (symbols allowed: `` !@#$%^&*()_+-=[]{};'\:"|<>?,./`~ ``). **Leaked-password protection (HaveIBeenPwned) is Pro-only.** Link/OTP expiry default is 3600s.

---

## 7. Database, RLS, and moving the shelf server-side

SQL editor: dashboard left nav **SQL Editor** (`/dashboard/project/_/sql`); Table Editor for the visual version.

```sql
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now(),
  primary key (id)
);
alter table public.profiles enable row level security;

create policy "own profile: read"   on public.profiles for select to authenticated
  using ( (select auth.uid()) = id );
create policy "own profile: write"  on public.profiles for update to authenticated
  using ( (select auth.uid()) = id ) with check ( (select auth.uid()) = id );
```

Only ever foreign-key to `auth.users`' **primary key** — other auth-schema objects "may change at any time".

The shelf (`ww.shelf.v1` = `{quiz, code, at}[]`) maps cleanly onto:

```sql
create table public.results (
  user_id uuid not null references auth.users on delete cascade,
  quiz text not null,
  code text not null,
  at timestamptz not null default now(),
  primary key (user_id, quiz, code)
);
```

Sync by upsert, via plain fetch with the user's token:

```
POST /rest/v1/results?on_conflict=user_id,quiz,code
apikey: sb_publishable_...
Authorization: Bearer <access_token>
Prefer: resolution=merge-duplicates,return=minimal
Content-Type: application/json
[ {"user_id":"...","quiz":"theology-compass","code":"...","at":"..."} ]
```

(`resolution=ignore-duplicates` if we'd rather keep the first `at`.) Game bests (`sls.best`, `wsi.best`, …) fit a `key/value jsonb` table with the same RLS shape.

Account deletion: `supabase.auth.admin.deleteUser(id)` with the **secret key, server-side only**. `on delete cascade` clears the rows. Note deletion does **not** sign the user out — the JWT lives until expiry, so sign them out explicitly.

---

## 8. Packages and the Astro fit

- `@supabase/supabase-js` **v2.116.0 — 56 KB gzipped**, 5 deps.
- `@supabase/ssr` **v0.12.7 — 6 KB gzipped**, 1 dep. The docs state plainly it is **not deprecated**; it is the recommended way to do cookie sessions, and it uses the PKCE flow.
- The official Astro quickstart installs `@supabase/supabase-js`, `@supabase/ssr`, `@astrojs/node` and sets **`output: "server"` site-wide**. **Do not copy that.** Our site is `output: 'static'` on `@astrojs/vercel` with `prerender = false` on selected routes. Use `createServerClient` only on those non-prerendered routes; leave the static pages static.
- For the header's signed-in state on cached static pages: 56 KB of SDK on every page is a lot for a phone-first site. Cheaper path — read the session cookie or call `GET /auth/v1/user` once from a small inline script, and load the full SDK only on the auth and profile routes.

---

## 9. Manual steps he cannot avoid (the list to turn into numbered instructions)

1. Create a Supabase account and a project (region, database password) — note the project ref.
2. `Settings > API Keys` → **Publishable and secret API keys** tab → copy the publishable key and the project URL; copy the secret key separately.
3. Paste into Vercel as `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.
4. Brevo → **SMTP and API settings → SMTP** → generate an SMTP key; note the SMTP login.
5. Supabase `Authentication > Emails > SMTP Settings` → fill host/port/user/pass/sender.
6. Supabase `Authentication > Rate Limits` → raise the 30/hour email cap.
7. Supabase `Authentication > URL Configuration` → Site URL `https://wiserwalk.com`; add redirect URLs including the Vercel preview wildcard.
8. Run our SQL (we hand him one block to paste into **SQL Editor**).
9. Paste our two email templates into `Authentication > Emails > Templates`.

Steps 7–9 can be collapsed into a single `PATCH /v1/projects/{ref}/config/auth` (site_url, uri_allow_list, smtp_*, rate_limit_email_sent, mailer_* templates) or a `supabase config push` if **we** run it with a personal access token — worth offering, since every dashboard step is a chance for a mistake.

**Alternative worth putting to him:** the **Vercel Marketplace** Supabase integration creates the project from inside Vercel and auto-syncs 12 env vars (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWT_SECRET`, `POSTGRES_*`), removing steps 1–3. Costs: projects can then only be created from the Vercel dashboard, organizations cannot be removed manually, billing runs through Vercel, and the default variable names carry a `NEXT_PUBLIC_` prefix that is wrong for Astro (we need `PUBLIC_`). Free-plan availability through the marketplace is not documented.

## gotchas
- PROJECT PAUSING IS THE BIGGEST RISK FOR THIS SITE. A Free project with low activity over a 7-day window is paused, and a paused project answers EVERY request with HTTP 540 — sign-in, sign-up, password reset and the profile API all die at once, silently, on a low-traffic site. Recovery is manual: dashboard > organization > project > Resume project. Budget for a daily keep-alive request (a Vercel cron or GitHub Actions cron hitting /rest/v1/<a tiny table> once a day), or plan on $25/mo Pro before this matters. Docs say "a few user requests to the database each day over the previous week is enough".
- Supabase's docs never say whether automated keep-alive pings are allowed. They are not forbidden and not blessed. The Acceptable Use / Fair Use policy reserves restriction for abuse. One tiny request a day is not plausibly abuse, but it is an unwritten-rule risk the owner should know about rather than a documented guarantee.
- THE BUILT-IN EMAIL SENDER CANNOT BE USED IN PRODUCTION AT ALL. It is capped at 2 messages per hour AND only delivers to the project team members' own email addresses — every real visitor's sign-up email fails with "Email address not authorized." This is not a soft limit you grow out of; email must be wired to Brevo before a single real user signs up.
- After custom SMTP is switched on, Supabase imposes a NEW low limit of 30 emails/hour, in a different place (Authentication > Rate Limits). Easy to miss and it will silently throttle a launch day. Raise it in the same sitting you configure SMTP.
- The Send Email hook has a 5-second timeout "for the entire webhook invocation, including retry requests", a 20KB payload cap, and retries only on 429/503. A Vercel serverless cold start plus a call to api.brevo.com can plausibly blow 5s. If the hook is used, the handler must be tiny and warm — or accept that an occasional sign-up email is lost. This is a real argument for plain custom SMTP (Brevo relay) over the hook, despite the hook's appeal of keeping email copy in our repo.
- Secret keys (sb_secret_...) MUST be sent on the `apikey` header. Sent as `Authorization: Bearer`, the platform tries to parse them as a JWT and rejects with "Invalid JWT". This is the opposite of the old service_role habit and will burn an afternoon.
- Secret keys return HTTP 401 when a browser User-Agent is detected. Fine for Vercel functions, but it means you cannot debug a secret-key call from the browser console or a browser-based REST client.
- signInWithOtp uses DIFFERENT templates for new vs existing users ("Confirm signup" for a brand-new address, "Magic Link" for one that already exists). If only one is rewritten, half of users get email copy that contradicts what the site just told them. Both must be written, with matching wording.
- Email link prefetching by spam scanners consumes one-time tokens before the human clicks. Supabase's own documented mitigation is the token_hash pattern — the email links to OUR page (/auth/confirm?token_hash=...&type=...) and the token is only redeemed on a user click — not a direct {{ .ConfirmationURL }}. Build that page from the start.
- The email-link-then-set-password flow means the link itself is a full sign-in. Anyone who can read the inbox is signed in. That is inherent to what the owner asked for, but the set-password page must require a live session and the link must be short-lived (otp_expiry default 3600s).
- Leaked-password protection (HaveIBeenPwned) is Pro-only. On Free, the only defences are minimum length and character requirements at Authentication > Sign In / Providers > Email.
- Deleting a user from auth.users does NOT sign them out — the JWT stays valid until it expires (default 1 hour). Account deletion needs an explicit sign-out too.
- The official Astro quickstart mandates output: "server" site-wide with @astrojs/node. Our site is output: 'static' with @astrojs/vercel and per-route prerender = false. Do not follow that quickstart literally — it would un-static the whole site and break the caching the phone-first design depends on. Use @supabase/ssr only on the handful of prerender=false routes, or skip it and drive /auth/v1 by plain fetch.
- @supabase/supabase-js is 56 KB gzipped. For a static, phone-first site whose header just needs to say "signed in as…", that is a heavy import to put on every page. Plain fetch against /auth/v1 (or a tiny localStorage read of the session) is worth costing out before the whole SDK ships to every visitor.
- RLS policies must name the role (`to authenticated`) and wrap the call as `(select auth.uid())`. Omitting the `to` clause makes policies run for anonymous visitors too; calling auth.uid() bare runs it once per row.
- The Free plan allows 2 active projects across ALL organizations where the owner is Owner/Admin. If he already has a Supabase project for anything else, he is near the ceiling.
- supabase/config.toml auth settings apply to local development; pushing them to the hosted project needs `supabase config push` against a linked project, which is an extra CLI + access-token step for a non-expert. The Management API (PATCH /v1/projects/{ref}/config/auth) is the other non-dashboard route, and also needs a personal access token.
- The Vercel Marketplace integration would cut manual steps (project created from Vercel, 12 env vars auto-synced) but locks project creation to the Vercel dashboard and organizations cannot be removed manually. It also syncs NEXT_PUBLIC_*-prefixed names by default, which is wrong for Astro (PUBLIC_*).
- Free-plan quota overage does not hard-stop immediately: billing email notification, then a grace period, then restrictions — 402 responses, read-only database, and possible pausing. Worth knowing the failure mode differs from the 540 pause.

## open_questions
- Does Supabase permit a scheduled keep-alive request to prevent Free-plan pausing? The docs describe what counts as activity but never say whether automating it is allowed or discouraged. The Acceptable Use Policy (https://supabase.com/aup) was not fetched in full and should be read before we build a cron for it.
- Do brand-new projects created today ship with sb_publishable_/sb_secret_ keys already present, and do they ALSO still get legacy anon/service_role keys? The migration page says "Older projects don't have these keys yet" (implying new ones do) and the api-keys page says new keys are created under the name "default", but no page states the default state of a project created in September 2026 outright. Needs confirming at project-creation time by looking at Settings > API Keys.
- Can email template CONTENT (not just subjects) be pushed to a hosted project via `supabase config push` with content_path, or only via the Management API's mailer_templates_*_content fields? The CLI config page describes content_path as local; the blog post does not cover templates.
- What happens to a sign-up when the Send Email hook endpoint fails or times out — does the user get created without an email, or does the whole request fail? The docs give the 5s timeout and retry rules but not the user-visible outcome.
- Is the Free plan actually offered through the Vercel Marketplace integration? The Supabase docs page does not say, and billing there runs through Vercel.
- Exact Brevo SMTP hostname from an official page — help.brevo.com returned 403 to direct fetch; smtp-relay.brevo.com appears in Brevo's own search snippets and developer docs describe only ports and the SMTP-key rule. Confirm in the Brevo dashboard when the owner opens SMTP and API settings > SMTP.
- Whether Brevo's free plan (300 emails/day) permits transactional/SMTP sending at that volume without a paid add-on, and whether a dedicated sender domain with SPF/DKIM must be added at SiteGround DNS before Supabase auth emails deliver reliably. (DNS records may be ADDED at SiteGround; this likely needs a DKIM record.)

## facts
- [verified-live] Supabase Free plan today: 50,000 monthly active users, 500 MB database size (shared CPU, 500 MB RAM), 5 GB egress + 5 GB cached egress, 1 GB file storage, and a limit of 2 active projects. Pro is from $25/month and is never paused for inactivity. (https://supabase.com/pricing)
- [verified-live] Free projects are paused after 1 week of inactivity. Pricing page wording: "Free projects are paused after 1 week of inactivity"; Pro answers "Never" to the same row. (https://supabase.com/pricing)
- [verified-live] Supabase pauses Free Plan projects that show low activity over a 7-day period. "A few user requests to the database each day over the previous week is enough to keep the project from being paused." Restoration returns the project to its previous state including data and configurations. (https://supabase.com/docs/guides/platform/free-project-pausing)
- [verified-live] There is a 1-year window to restore a paused project from within Supabase Studio. To restore: open the Supabase Dashboard, select the organization, then the paused project, then click Resume project and confirm (paths /dashboard/organizations and /dashboard/project/_). (https://supabase.com/docs/guides/platform/free-project-pausing)
- [verified-live] A paused project returns HTTP 540 on every request: "The project the request was being made against has been paused. The project cannot process requests until it is un-paused by the owner." A restricted (fair-use/overdue) project returns HTTP 402 with a code such as exceeded_egress_quota or overdue_payment. (https://supabase.com/docs/guides/troubleshooting/http-status-codes)
- [verified-live] Going-into-prod guidance: "We may pause applications on the Free Plan that exhibit low activity in a 7-day period to save on server resources" and "Upgrade to Pro to guarantee that we won't pause your project for inactivity." (https://supabase.com/docs/guides/platform/going-into-prod)
- [verified-live] Billing FAQ: "You are entitled to two active free projects. Paused projects do not count towards your quota." Free-plan quota overage leads to notification and a grace period, then restrictions including project pausing, read-only database mode, and API requests blocked with 402. (https://supabase.com/docs/guides/platform/billing-faq)
- [verified-live] MAU definition: "You are charged for the number of distinct users who sign in or refresh their token during the billing cycle", counted once per billing cycle regardless of how many times they authenticate. Free quota 50,000 MAU. (https://supabase.com/docs/guides/platform/manage-your-usage/monthly-active-users)
- [verified-live] Egress is incurred by all services — Database, Auth, Storage, Edge Functions, Realtime and Log Drains. Auth egress covers data sent while managing users (sign-in, sign-out, user creation). Free quota is 5 GB uncached + 5 GB cached. (https://supabase.com/docs/guides/platform/manage-your-usage/egress)
- [verified-live] New-style keys are short strings, not JWTs: publishable sb_publishable_... (maps to the anon Postgres role when no user is signed in, authenticated when one is) and secret sb_secret_... (maps to service_role, has BYPASSRLS so RLS never applies). (https://supabase.com/docs/guides/api/api-keys)
- [verified-live] "Send publishable and secret keys on the apikey header, not on Authorization: Bearer." Because they are not JWTs, anything that verifies them as a JWT fails; sending a secret key as Bearer makes the platform try to parse it as a JWT and reject the request with "Invalid JWT". (https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [verified-live] Secret keys return HTTP 401 if used in a browser (matched on the User-Agent header), and you can run a separate secret key per service so one leak forces one rotation. (https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [verified-live] Dashboard path for keys: "Open the Settings > API Keys section of the Dashboard and select the Publishable and secret API keys tab." Legacy anon/service_role keys keep working until you disable them there, which is a separate step. (https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys)
- [verified-live] Supabase is deprecating the anon and service_role keys by the end of 2026. Creating a publishable or secret key adds it alongside existing anon/service_role keys without affecting them. New keys are created under the name "default". (https://supabase.com/docs/guides/api/api-keys)
- [verified-live] Calling the REST API by plain fetch/curl requires both headers: apikey: <key> and Authorization: Bearer <token>. Endpoint format https://<project_ref>.supabase.co/rest/v1/<table>. (https://supabase.com/docs/guides/api/creating-routes)
- [verified-live] JWKS endpoint for verifying access tokens yourself: GET https://<project-id>.supabase.co/auth/v1/.well-known/jwks.json — served by the Auth server and cached by the Supabase Edge for 10 minutes. Supabase supports HS256, ES256 and RS256 signing keys. (https://supabase.com/docs/guides/auth/jwts)
- [verified-live] Alternative token validation: GET https://<project-id>.supabase.co/auth/v1/user with the publishable key and the JWT in the Authorization header — "If the server responds with HTTP 200 OK, the JWT is valid, otherwise it is not." (https://supabase.com/docs/guides/auth/jwts)
- [verified-live] The built-in Supabase email service is limited to 2 messages per hour AND only delivers to addresses of the project's team members; other addresses fail with "Email address not authorized." (https://supabase.com/docs/guides/auth/auth-smtp)
- [verified-live] Custom SMTP dashboard path is supabase.com/dashboard/project/_/auth/smtp. Fields map to smtp_host, smtp_port, smtp_user, smtp_pass, smtp_admin_email (sender email), smtp_sender_name. (https://supabase.com/docs/guides/auth/auth-smtp)
- [verified-live] After enabling custom SMTP "a low rate-limit of 30 messages per hour is imposed"; raise it at supabase.com/dashboard/project/_/auth/rate-limits. (https://supabase.com/docs/guides/auth/auth-smtp)
- [verified-live] Auth rate limits (Authentication > Rate Limits, /auth/rate-limits): emails 2/hour on the built-in provider; OTP/magic link 60-second window before a new request for the same user; sign-up/sign-in 30 requests per 5 minutes; verification 30 per 5 minutes; token refresh 150 per 5 minutes. Exceeding returns 429. (https://supabase.com/docs/guides/auth/rate-limits)
- [verified-live] URL Configuration lives at supabase.com/dashboard/project/_/auth/url-configuration (Authentication > URL Configuration). Site URL is the default redirect when no redirectTo is given. Wildcards: * matches non-separator characters, ** matches any sequence, ? matches one non-separator character. Vercel example patterns: http://localhost:3000/** and https://*-<team-or-account-slug>.vercel.app/** (https://supabase.com/docs/guides/auth/redirect-urls)
- [verified-live] When using redirectTo, email templates should use {{ .RedirectTo }} in place of {{ .SiteURL }} so the confirmation link goes to the right page. (https://supabase.com/docs/guides/auth/redirect-urls)
- [verified-live] Email templates live at https://supabase.com/dashboard/project/_/auth/templates. Auth templates: Confirm sign up, Invite user, Magic link or OTP, Change email address, Reset password, Reauthentication. Security-notification templates also exist (password changed, email address changed, sign-in method linked/removed, etc.). (https://supabase.com/docs/guides/auth/auth-email-templates)
- [verified-live] Template variables: {{ .ConfirmationURL }} (the confirmation URL), {{ .Token }} (6-digit OTP), {{ .TokenHash }} (hashed token, for building custom links), {{ .SiteURL }}, {{ .RedirectTo }}, {{ .Email }}, {{ .Data }} (auth.users.user_metadata). (https://supabase.com/docs/guides/auth/auth-email-templates)
- [verified-live] Templates can be managed three ways: the dashboard template builder (hosted projects), the Management API via curl, and supabase/config.toml + HTML files for local/self-hosted. (https://supabase.com/docs/guides/auth/auth-email-templates)
- [verified-live] Email providers' spam detection can prefetch confirmation URLs and invalidate one-time tokens; documented mitigations are sending an OTP code instead of a link, or a custom redirect page that only activates the confirmation URL on user interaction. (https://supabase.com/docs/guides/auth/auth-email-templates)
- [verified-live] The Send Email hook IS available on the Free plan. Availability table: Before User Created (Free, Pro), Custom Access Token (Free, Pro), Send SMS (Free, Pro), Send Email (Free, Pro); MFA Verification and Password Verification are Teams and Enterprise only. (https://supabase.com/docs/guides/auth/auth-hooks)
- [verified-live] HTTP auth hooks: configured at Authentication > Hooks (dashboard/project/_/auth/hooks); timeout is "5s for the entire webhook invocation, including retry requests"; up to three retries with 2-second backoff for 429 or 503; payload limit 20KB. (https://supabase.com/docs/guides/auth/auth-hooks)
- [verified-live] Auth hook secret format is v1,whsec_<base64-secret>, verified with the Standard Webhooks spec using headers webhook-id, webhook-timestamp and webhook-signature; the standardwebhooks@1.0.0 library is the documented verifier. Only the <base64-secret> portion is stored in env vars. (https://supabase.com/docs/guides/auth/auth-hooks)
- [verified-live] Send Email hook payload contains a user object (id, email, phone, app_metadata, user_metadata, identities, timestamps) and an email_data object with token, token_hash, email_action_type (signup, recovery, magiclink, email_change, reauthentication, invite), redirect_to, site_url, plus token_new/token_hash_new and old_email/old_phone for dual-confirmation cases. (https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [verified-live] With the Send Email hook enabled, "Auth Hook handles email sending (SMTP not used)" — dashboard SMTP settings and dashboard email templates are bypassed. (https://supabase.com/docs/guides/auth/auth-hooks/send-email-hook)
- [verified-live] RLS: enable with `alter table public.reports enable row level security;`. Once enabled "no data is accessible through the API when using a publishable key, until you create policies." Always name the role with the `to` clause, and wrap auth.uid() as (select auth.uid()) so Postgres caches it per statement instead of calling it per row. (https://supabase.com/docs/guides/database/postgres/row-level-security)
- [verified-live] Recommended profile table shape: create table public.profiles ( id uuid not null references auth.users on delete cascade, ..., primary key (id) ); only reference auth.users' primary key, because other auth-schema objects "may change at any time". Deleting a user cascades to the profile row but does not sign the user out (JWTs stay valid until expiry). (https://supabase.com/docs/guides/auth/managing-user-data)
- [verified-live] PostgREST upsert: POST with header "Prefer: resolution=merge-duplicates" (or resolution=ignore-duplicates), and ?on_conflict=<column> to upsert on a UNIQUE constraint rather than the primary key. "Prefer: return=representation" returns the row; return=minimal is the default. (https://postgrest.org/en/stable/references/api/tables_views.html)
- [verified-live] Admin user deletion: supabase.auth.admin.deleteUser(id, shouldSoftDelete?) — requires the service_role/secret key and must only be called on a server, never in the browser. (https://supabase.com/docs/reference/javascript/auth-admin-deleteuser)
- [verified-live] @supabase/supabase-js v2.116.0 is 220,174 bytes minified and 56,357 bytes gzipped, with 5 dependencies. (https://bundlephobia.com/api/size?package=@supabase/supabase-js)
- [verified-live] @supabase/ssr v0.12.7 is 17,576 bytes minified and 6,081 bytes gzipped, with 1 dependency. (https://bundlephobia.com/api/size?package=@supabase/ssr)
- [verified-live] The docs state plainly that "@supabase/ssr is not deprecated"; use it when sessions are stored in cookies and must be readable on both client and server; use supabase-js alone when you do not need that cookie/refresh handling. (https://supabase.com/docs/guides/auth/choosing-a-server-package)
- [verified-live] The official Astro auth quickstart installs @supabase/supabase-js, @supabase/ssr and @astrojs/node, sets output: "server" with the Node adapter, uses PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY, creates a server client with createServerClient + cookie getAll/setAll, and adds src/pages/auth/callback.astro that reads token_hash and type from the query string and calls supabase.auth.verifyOtp(). (https://supabase.com/docs/guides/auth/quickstarts/astrojs.md)
- [verified-live] Password auth: supabase.auth.signUp({email, password, options:{emailRedirectTo}}), supabase.auth.signInWithPassword({email,password}), supabase.auth.resetPasswordForEmail(email, {redirectTo}), and supabase.auth.updateUser({password}) for a signed-in user (optionally with current_password since v2.102.0). REST endpoints shown: POST /auth/v1/signup, POST /auth/v1/token?grant_type=password, POST /auth/v1/verify. (https://supabase.com/docs/guides/auth/passwords)
- [verified-live] Leaked-password protection using the HaveIBeenPwned Pwned Passwords API is "available on the Pro Plan and above". Password requirement options (digits, lower/upper case, symbols) and minimum length are set at supabase.com/dashboard/project/_/auth/providers?provider=Email; anything under 8 characters is not recommended. (https://supabase.com/docs/guides/auth/password-security)
- [verified-live] signInWithOtp sends a Magic Link by default ("Though the method is labelled 'OTP', it sends a Magic Link by default"); it auto-registers the user unless shouldCreateUser: false. The PKCE landing page verifies with supabase.auth.verifyOtp({token_hash, type:'email'}) and the template URL pattern is {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email (https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [verified-live] Session defaults: access token (JWT) expiry default 3600 seconds / 1 hour, max 604800; refresh-token reuse interval 10 seconds, not recommended to change. Configured at dashboard/project/_/auth/sessions. (https://supabase.com/docs/guides/auth/sessions)
- [verified-live] config.toml auth defaults: jwt_expiry 3600, otp_expiry 3600, otp_length 6, enable_confirmations false, email max_frequency "1m". Template sections are [auth.email.template.<type>] with subject and content_path for types invite, confirmation, recovery, magic_link, email_change. The send-email hook is [auth.hook.send_email] with enabled, uri, secrets. (https://supabase.com/docs/guides/local-development/cli/config)
- [verified-live] Management API can set auth config without the dashboard: PATCH /v1/projects/{ref}/config/auth, with fields smtp_host, smtp_port, smtp_user, smtp_pass, smtp_admin_email, smtp_sender_name, smtp_max_frequency, site_url, uri_allow_list, rate_limit_email_sent, and mailer_subjects_* / mailer_templates_*_content for templates. (https://supabase.com/docs/reference/api/v1-update-auth-service-config)
- [likely] supabase config push writes the properties declared in supabase/config.toml to a LINKED hosted project through the Management API; a [remotes] block targets specific project IDs. (https://supabase.com/blog/cli-v2-config-as-code)
- [verified-live] The Vercel Marketplace Supabase integration creates and bills the Supabase project from inside Vercel and auto-syncs 12 env vars including SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, SUPABASE_JWT_SECRET and POSTGRES_* . Limitation: "Projects can only be created via the Vercel dashboard" and organizations cannot be removed manually. (https://supabase.com/docs/guides/integrations/vercel-marketplace)
- [verified-live] Brevo transactional send: POST https://api.brevo.com/v3/smtp/email with headers api-key and Content-Type: application/json; body fields sender {email,name}, to [{email,name}], subject, htmlContent, optional textContent. (https://developers.brevo.com/reference/sendtransacemail)
- [likely] Brevo SMTP relay: ports 587 or 2525 unencrypted, port 465 with SSL/TLS. Credentials are at SMTP and API settings > SMTP tab; you must use an SMTP key, not an API key. (Host smtp-relay.brevo.com appears in Brevo help-centre search results but that page returned 403 to a direct fetch.) (https://developers.brevo.com/docs/smtp-integration)
# supabase-auth-flow

web_access_worked: true

## The short answer

The owner's flow is buildable almost exactly as he described it, and the deferred-verify landing page he wants to evaluate is not only workable — it is the cleanest available answer to the email-scanner problem. The single biggest surprise is not in Supabase Auth at all: **the built-in email service refuses to send to anyone outside the Supabase organization**, so nothing works for a real visitor until Brevo SMTP is configured. That must be the first numbered step he does, not the last.

The second surprise is that **one sign-up box produces two different email templates** depending on whether the address already exists, so three templates have to be edited identically.

---

## 1. The flow, endpoint by endpoint

### Step 1 — the sign-up box (email only)

```js
await supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: 'https://wiserwalk.com/auth/set-password/' }
})
```

REST equivalent:

```
POST https://<ref>.supabase.co/auth/v1/otp
apikey: <anon key>
Content-Type: application/json

{ "email": "a@b.com",
  "create_user": true,
  "data": { },
  "gotrue_meta_security": { "captcha_token": "..." } }
```

`shouldCreateUser` / `create_user` defaults to **true** — leave it true here.

**What the server actually does** (`internal/api/otp.go` → `internal/api/magic_link.go`):

```go
if user != nil { isNewUser = !user.IsConfirmed() }
if isNewUser {
    // ...
    if err := a.Signup(fakeResponse, r); err != nil { return err }
} else {
    return a.sendMagicLink(r, tx, user, flowType)
}
```

| Address | Email sent | Token column |
|---|---|---|
| brand new | **Confirm signup** | `confirmation_token` |
| exists, never confirmed | **Confirm signup** | `confirmation_token` |
| exists, confirmed | **Magic Link** | `recovery_token` |
| forgot-password (`/recover`) | **Reset password** | `recovery_token` |

### Step 2 — the email templates (Authentication → Email Templates)

Edit **Confirm signup**, **Magic Link** and **Reset password** to the *same* href. Use the URL **fragment**, not the query string:

```html
<a href="{{ .SiteURL }}/auth/set-password/#token_hash={{ .TokenHash }}&type=email">
  Set your password
</a>
```

`type=email` works for all three because of `internal/api/verify.go`:

```go
// if the type is emailOTPVerification, we'll check both the
// confirmation_token and recovery_token columns
FindUserByOneTimeToken(conn, params.TokenHash, models.ConfirmationToken, models.RecoveryToken)
```

That is the whole trick: **one landing page, one `type` value, all three cases.** Supabase's own SSR sample uses `&type=email` for signup and `&type=recovery` for reset; collapsing both to `email` is supported by the source and removes a branch from our code.

Why the fragment rather than `?token_hash=`:
- fragments are never sent to a server, so the token stays out of Vercel access logs, the `Referer` header and analytics;
- Supabase's own troubleshooting page names the fragment technique as the anti-prefetch mitigation.

Available variables: `{{ .ConfirmationURL }}`, `{{ .Token }}`, `{{ .TokenHash }}`, `{{ .SiteURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`, `{{ .RedirectTo }}`, `{{ .Data }}`.

### Step 3 — `/auth/set-password/` does nothing on load

Render the "choose a password" form immediately. Read `token_hash` and `type` from `location.hash`. Verify **only on submit**:

```js
// 1. validate locally FIRST — length, match, not obviously weak
// 2. only then burn the token
const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: 'email' })
// 3. session now exists and is stored by supabase-js
await supabase.auth.updateUser({ password })
// 4. record the flag server-side, then migrate ww.shelf.v1 / sls.* / wsi.*
```

REST:

```
POST /auth/v1/verify        apikey: <anon>     { "type": "email", "token_hash": "..." }
  -> { access_token, token_type: "bearer", expires_in: 3600, refresh_token, type }

PUT  /auth/v1/user          apikey: <anon>
                            Authorization: Bearer <access_token>
                            { "password": "..." }
```

`POST /verify` accepts `{ type, token, token_hash, email, phone, redirect_to }` — **no `password` field**, so this is necessarily two calls.

### Step 4 — thereafter, email + password

```
POST /auth/v1/token?grant_type=password
apikey: <anon>
{ "email": "...", "password": "...", "gotrue_meta_security": { "captcha_token": "..." } }
```

Refresh: `POST /auth/v1/token?grant_type=refresh_token` with `{ "refresh_token": "..." }`.
Sign out: `POST /auth/v1/logout?scope=local` with `Authorization: Bearer` — **pass `local` explicitly**, the default is `global` and logs the person out everywhere.

### Step 5 — forgot password

Use `resetPasswordForEmail(email, { redirectTo })` → `POST /auth/v1/recover` `{ "email": "..." }`. It uses the **Reset password** template, which we already pointed at `/auth/set-password/#...&type=email`, so the same page handles it. Same code, same look, nothing new to build.

Do **not** implement forgot-password as `signInWithOtp({ shouldCreateUser: false })`: that path returns `422 "Signups not allowed for otp"` for unknown addresses and leaks account existence (open bug, supabase/auth #1955).

---

## 2. Does the deferred-verify idea hold up?

**Yes.** Nothing in the auth server requires verification on page load; `POST /verify` is an ordinary call that can happen at any moment inside the token's lifetime. A scanner that GETs the link fetches a static page that performs no network call, so the token survives. Four things to handle:

1. **The expiry clock now covers typing.** `otp_expiry` defaults to 3600s and it must now cover receive → click → choose a password → submit. An hour is ample; just never lower it below ~15 minutes.
2. **Validate the password before calling verify.** If `updateUser` rejects a weak password *after* verify, the token is already spent and the person needs a new email. Client-side length/match checks first make that impossible.
3. **If `updateUser` fails anyway, do not re-verify.** The session from step 2 persists; retry `updateUser` on it.
4. **Expired or already-used token** comes back as `403` with code `otp_expired`, message "Email link is invalid or has expired". The page needs a friendly "that link has been used or has expired — send me a new one" state with a resend button, disabled for 60 seconds (`max_frequency`).

An alternative Supabase also endorses is `{{ .Token }}` — a six-digit code the person types. It is scanner-proof by construction but adds a typing step; the deferred-verify page is nicer and equally safe.

---

## 3. Does reauthentication get in the way?

No. `internal/api/user.go`:

```go
if config.Security.UpdatePasswordRequireReauthentication {
    now := time.Now()
    if session == nil || now.After(session.CreatedAt.Add(24*time.Hour)) {
        if len(params.Nonce) == 0 {
            return apierrors.NewBadRequestError(
                apierrors.ErrorCodeReauthenticationNeeded,
                "Password update requires reauthentication")
        }
    }
}
```

The setting is **off by default** (`auth.email.secure_password_change`), and even when on, a session seconds old from `verifyOtp` is well inside the 24-hour window. Leave the setting off.

Related: changing to the same password returns `422 same_password`, "New password should be different from the old password." `supabase-js ≥ 2.102.0` also supports `updateUser({ password, current_password })` for the later in-app "change my password" screen — that is newer than I had in memory and worth using there.

Password policy on Free: `GOTRUE_PASSWORD_MIN_LENGTH` defaults to **6** — raise it to 8+ at Authentication → Sign In / Providers → Email. Character-class options are digits / digits+letters / digits+mixed-case / digits+mixed-case+symbols. Leaked-password protection is **Pro-only**. Weak passwords return code `weak_password`, and in supabase-js the error carries `reasons: WeakPasswordReasons[]` (`isAuthWeakPasswordError(error)`).

---

## 4. "Has this person set a password yet?"

**There is no built-in field, and the obvious proxies are broken.** `user.identities` and `app_metadata.providers` do not reliably reflect a password: auth issue #1605 (`raw_app_meta_data` not updated when a third-party user sets a password) and discussion #37737 ("Password Reset Creates 'Ghost Password' Without Email Identity"). `user_metadata` is writable by the user, so it cannot gate anything.

Recommendation: a `public.profiles` row keyed on `auth.users.id` with `password_set_at timestamptz`, written either by a trigger on `auth.users` or by a small server route using the service_role key. RLS: the user may `select` their own row, never `update` that column. This table is wanted anyway for the cross-quiz profile, so it is not extra machinery.

---

## 5. Email enumeration, honestly

- `signUp()` on an existing confirmed address returns an **obfuscated fake user object** when email confirmations are on (and "User already registered" when off).
- `resetPasswordForEmail()` is documented as not revealing existence.
- `signInWithOtp({ shouldCreateUser: false })` **does** reveal it — open bug #1955.
- `POST /recover` has a residual reported leak — open bug #2702 (`400 email_address_invalid` for an existing user vs silent success for a missing one), with PRs #2710/#2723 open.

For this site the practical conclusion is: stick to `signInWithOtp` with `shouldCreateUser: true` for sign-up (no leak — every address gets an email) and `resetPasswordForEmail` for reset. Never expose a "check if this email is registered" call.

---

## 6. Rate limits, and why Brevo is step one

**Built-in email service:** sends **only to organization members** ("Email address not authorized" for anyone else) and **2 messages per hour**, with no delivery SLA. Sign-up is non-functional for real visitors until custom SMTP is set at `https://supabase.com/dashboard/project/_/auth/smtp`. Fields: `smtp_admin_email` (from address), `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass`, `smtp_sender_name`. Brevo is on Supabase's compatible list.

After enabling custom SMTP, Supabase imposes **30 messages/hour**; raise it at Authentication → Rate Limits.

| Limit | Default | Scope |
|---|---|---|
| Emails sent | 2/hr built-in, 30/hr after custom SMTP | project |
| `/auth/v1/otp` | 60 s cooldown | per user |
| `/auth/v1/signup` | 60 s cooldown | per user |
| `/auth/v1/recover` | 60 s cooldown | per user |
| signup/signin endpoints | 30 per 5 min | per IP |
| `/auth/v1/verify` | 30 per 5 min | per IP |
| `/auth/v1/token` | 150 per 5 min | per IP |

Cooldown violations return `429` with code `over_email_send_rate_limit`; IP limits return `over_request_rate_limit`.

**CAPTCHA** (hCaptcha or Cloudflare Turnstile) is available on Free at Settings → Authentication → Bot and Abuse Protection; pass `options.captchaToken` in supabase-js or `gotrue_meta_security.captcha_token` in REST, on sign-up, sign-in and password-reset. Worth holding in reserve rather than shipping day one — it is one more thing to break.

---

## 7. Sessions

- Access token (JWT) lifetime **3600s** (`auth.jwt_expiry`).
- Refresh-token rotation **on by default**; `refresh_token_reuse_interval` **10s**; tokens are single-use and reuse is detected as theft.
- Session time-box, inactivity timeout and single-session-per-user are **Pro-only** — not available to us.
- `signOut()` scopes: `global` (default, every device), `local` (this browser), `others` (fires no `SIGNED_OUT` event).

For a static Astro site: `supabase-js` in the browser holds the session in `localStorage` and refreshes it itself, so the header's signed-in state can be painted client-side on first paint from local storage with no network round trip. Nothing about this requires the static pages to become dynamic. Only if we later want the header rendered server-side would `@supabase/ssr` and cookies come in.

---

## 8. Adding Google later

Nothing has to be done now. Automatic linking already covers it (`internal/models/linking.go`): when a Google identity arrives carrying a **verified** email that matches an existing user, the decision is `LinkAccount` — "no similarIdentities but a user with the same email exists / so we link this new identity to the user". Conversely, "if there are no verified emails, we always decide to create a new account."

Our users reach an account *through an email link*, so their email is confirmed by construction — which is exactly the precondition for linking. One thing to keep true: never create users with unconfirmed emails via the Admin API, or a later Google sign-in will fork into a second account.

When the time comes: a Web OAuth client in Google Cloud, Authorized JavaScript origin `https://wiserwalk.com`, Authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`, client ID + secret into the Google provider page, our domain on the redirect allow list. Then `signInWithOAuth({ provider: 'google', options: { redirectTo } })` → `GET /auth/v1/authorize?provider=google`.

---

## 9. Should our server send the emails through Brevo instead?

`POST /auth/v1/admin/generate_link` makes it possible:

```
POST /auth/v1/admin/generate_link
apikey: <anon>
Authorization: Bearer <service_role key>       # server only, never in the browser

{ "type": "magiclink" | "signup" | "recovery" | "invite"
         | "email_change_current" | "email_change_new",
  "email": "a@b.com",
  "password": "...",        # signup only
  "data": { },
  "redirect_to": "https://wiserwalk.com/auth/set-password/" }

-> { "action_link": "...", "email_otp": "...", "hashed_token": "...",
     "verification_type": "...", "redirect_to": "..." }
```

It creates the user for `signup`, `invite` and `magiclink`, and it does not send anything — we would take `hashed_token`, build our own URL and hand it to Brevo's API.

**Recommendation: don't.** It requires the service_role key in a Vercel function (a new secret for the owner to paste and a new way to leak), adds a `prerender = false` route, moves email design out of the dashboard where he can edit it, and `type: 'magiclink'` has a reported failure to create missing users (supabase/supabase #22521, with a follow-on `verifyOtp` "user not found"). Brevo SMTP configured inside Supabase gets the same deliverability with one fewer key and zero custom code.

---

## 10. Free-plan realities

50,000 MAU, 500 MB database, 5 GB egress, **limit of 2 active projects**, and **"Free projects are paused after 1 week of inactivity"** — a paused project means sign-in is down site-wide. Not included on Free: leaked-password protection, session limits and timeouts, advanced MFA, SAML SSO.

---

## 11. Manual steps the owner has to perform (count them — each is a failure point)

1. Create the Supabase project; copy **Project URL** and **anon/publishable key**.
2. Authentication → SMTP Settings: enter Brevo host/port/login/key + sender address.
3. Authentication → Rate Limits: raise emails/hour above 30 if needed.
4. Authentication → URL Configuration: Site URL `https://wiserwalk.com`, add `https://wiserwalk.com/**` (and a Vercel preview glob if wanted).
5. Authentication → Email Templates: paste the same one-line href into **Confirm signup**, **Magic Link** and **Reset password**.
6. Authentication → Email provider: raise minimum password length to 8.
7. Vercel: set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`.

That is seven steps, six of them inside one dashboard. Steps 5 and 6 are the ones most likely to be done wrong, so the instructions should give the exact string to paste and a screenshot-level description of where.

---

## 12. Error codes the UI must handle

| Code | Meaning | What the page should say |
|---|---|---|
| `otp_expired` (403) | link expired or already used | "That link has been used or has expired." + resend |
| `over_email_send_rate_limit` (429) | 60s per-address cooldown | "We just sent one — check your inbox, or try again in a minute." |
| `over_request_rate_limit` (429) | IP limit | "Too many attempts. Try again in a few minutes." |
| `weak_password` (422) | fails length/class rules | show `error.reasons` |
| `same_password` (422) | unchanged password | "Pick a different password." |
| `invalid_credentials` (400) | wrong email/password | one generic message for both fields |
| `email_not_confirmed` (400) | password sign-in before confirming | "Check your email for the link we sent." |
| `signup_disabled` / `otp_disabled` | misconfiguration | generic error + log it |
| `reauthentication_needed` | should never fire here | generic error + log it |

Error objects from supabase-js carry `message`, `status` and `code`.

## gotchas
- BLOCKER, day one: Supabase's built-in email service sends only to addresses of people on the Supabase organization — everyone else gets "Email address not authorized" — and caps at 2 emails per hour. Sign-up literally cannot work for a real visitor until Brevo SMTP is entered at Authentication > SMTP Settings. Treat custom SMTP as step 1 of the owner's numbered instructions, not a later optimisation.
- One sign-up box, TWO templates. signInWithOtp on a brand-new address goes through the Signup path and sends the "Confirm signup" template; on an existing confirmed address it sends the "Magic Link" template. If only one template is edited to point at our set-password page, half the users land on the wrong page. Both (plus "Reset password") must be edited identically.
- isNewUser is !user.IsConfirmed(), not "row absent". Someone who asked for a link and never clicked it is still treated as new and keeps getting the Confirm signup template.
- verifyOtp type=email searches confirmation_token first, then recovery_token. If a user somehow has both pending at once (asked for a fresh sign-in link and a password reset), the confirmation token wins and the newer reset link may resolve to the older token. Rare, but it is why the page should tell people to use the most recent email.
- POST /verify has no password field. Verifying and setting a password are necessarily two calls, so there is a window where the token is burned but the password is not yet set. Validate the password in the browser BEFORE calling verifyOtp, and if updateUser fails afterwards the session still exists — retry updateUser, never re-verify.
- signOut() defaults to scope 'global' and kills the session on every device the person owns. Almost certainly not what the owner wants from a "Sign out" link. Pass { scope: 'local' } explicitly.
- Free plan pauses a project after 1 week of inactivity. A paused project means sign-in is down site-wide, including for people who already have accounts. Any real traffic keeps it awake, but there should be a deliberate check (or a trivial cron hitting the DB) before this is trusted in production.
- Leaked-password protection (HaveIBeenPwned) is Pro-only, as are session time-box and inactivity timeout. On Free the only password defences are minimum length and character classes, so set minimum length to at least 8 (the default is 6).
- POST /otp with create_user:false answers "Signups not allowed for otp" for unknown addresses, which leaks whether an email has an account (open bug supabase/auth #1955). Do not build "forgot password" on signInWithOtp; use resetPasswordForEmail, which is designed not to reveal existence (though #2702 reports a residual leak there too).
- There is no field that tells you whether a user has set a password. identities and app_metadata.providers are demonstrably unreliable for this (auth #1605, discussion #37737), and user_metadata is writable by the user so it cannot gate anything. Keep the flag server-side: a profiles row written with the service_role key or by a trigger, readable but not writable under RLS.
- The per-address email cooldown is 60 seconds (auth.email.max_frequency). A "resend" button must be disabled for 60s or it returns 429 over_email_send_rate_limit and the owner will hear that the site is broken.
- Putting token_hash in the query string writes it into Vercel access logs, the Referer header and any analytics. Put it in the URL fragment instead — fragments never reach a server, and Supabase's own troubleshooting page names fragments as the anti-scanner technique.
- Admin generate_link looks attractive (our server sends the mail through Brevo's API) but needs the service_role key in a serverless function, adds a prerender=false route, and type=magiclink has a reported failure to create missing users (supabase/supabase #22521). For a non-expert owner, letting Supabase send via Brevo SMTP is fewer moving parts and fewer keys to paste.
- Default "Email OTP expiration" is 3600s. Under the deferred-verify design the clock now has to cover receive + click + type a password, not just click. It is still ample, but if the owner ever lowers it for security, that is the number that breaks his flow.
- Redirect allow list: emailRedirectTo must match an entry at Authentication > URL Configuration or it silently falls back to Site URL and the person lands on the home page with a dead token.

## open_questions
- Does POST /auth/v1/admin/generate_link skip the per-address 60s MaxFrequency check? I could not locate adminGenerateLink in the current source tree (it is not at internal/api/admin.go or internal/api/admin_generate_link.go on master), so the common claim that it bypasses rate limits is unverified. It certainly does not send an email, so the per-project email cap does not apply to it.
- Does updateUser({ password }) revoke the user's other sessions while keeping the current one? The sessions doc lists "password changes" as a termination trigger but does not say whether the initiating session survives. Worth a live test before relying on it.
- Exact Brevo SMTP relay host/port/login and free-plan daily cap — help.brevo.com returned 403 to the fetcher, so I have not verified these. Another agent's Brevo topic should supply them; do not write the owner's numbered steps from memory.
- Whether hosted Supabase projects ship with "Confirm email" ON by default. If it were OFF, the magic-link Signup path would auto-confirm the user and the flow changes shape. The CLI default (auth.email.enable_confirmations) is false, but hosted projects are widely reported to default to on — confirm in the dashboard before writing instructions.
- Whether a session created by verifyOtp on a SIGNUP token is flagged IsRecovery(). It matters only for the optional current_password check in PUT /user; the 24h reauthentication gate is unaffected either way.

## facts
- [verified-live] signInWithOtp email options are exactly { emailRedirectTo?, shouldCreateUser?, data?, captchaToken? }; shouldCreateUser defaults to true. REST equivalent POST /auth/v1/otp takes { email, create_user, data, code_challenge_method, code_challenge, gotrue_meta_security: { captcha_token } }. (https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts + https://raw.githubusercontent.com/supabase/auth/master/openapi.yaml)
- [verified-live] POST /otp routes to the MagicLink handler. MagicLink sets isNewUser = !user.IsConfirmed(); if isNewUser it calls a.Signup(), which sends the CONFIRM SIGNUP template. An existing confirmed user gets sendMagicLink() -> MAGIC LINK template. So one sign-up box produces two different templates depending on the address. (https://raw.githubusercontent.com/supabase/auth/master/internal/api/magic_link.go)
- [verified-live] Token storage columns: sendConfirmation -> models.ConfirmationToken; sendMagicLink -> models.RecoveryToken; sendPasswordRecovery -> models.RecoveryToken. (https://raw.githubusercontent.com/supabase/auth/master/internal/api/mail.go)
- [verified-live] verifyOtp with type 'email' (mail.EmailOTPVerification) calls FindUserByOneTimeToken(conn, params.TokenHash, models.ConfirmationToken, models.RecoveryToken) — it searches BOTH columns. Therefore type=email resolves signup-confirmation, magic-link AND recovery token hashes with a single value. (https://raw.githubusercontent.com/supabase/auth/master/internal/api/verify.go)
- [verified-live] EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email'. MobileOtpType = 'sms' | 'phone_change'. VerifyTokenHashParams is exactly { token_hash: string, type: EmailOtpType } — no email needed. The only @deprecated item nearby is options.captchaToken on VerifyEmailOtpParams. (https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts)
- [verified-live] Invalid or expired email link returns HTTP 403 with error code otp_expired and message "Email link is invalid or has expired". Expiry check is isOtpExpired(sentAt, config.Mailer.OtpExp). (https://raw.githubusercontent.com/supabase/auth/master/internal/api/verify.go)
- [verified-live] Email OTP / link expiry default is 3600 seconds (auth.email.otp_expiry = 3600, env MAILER_OTP_EXP). Set at Authentication > Sign In / Providers > Email > Email OTP expiration. Values above 86400 are disallowed. (https://supabase.com/docs/guides/local-development/cli/config)
- [verified-live] Magic links and email OTPs are explicitly one-time use only, and expire in 1 hour by default. (https://supabase.com/docs/guides/auth/auth-email-passwordless)
- [verified-live] Supabase's official prefetch guidance: email scanners "automatically click or access links within emails", consuming the single-use token. Recommended mitigations are (a) use {{ .Token }} OTP codes instead of a link, (b) delay token invalidation until explicit user submission, (c) wrap {{ .ConfirmationURL }} inside a URL FRAGMENT of an intermediate landing page, because fragments are not fetched by scanners. Diagnose by looking for 403s on /verify shortly after send. (https://supabase.com/docs/guides/troubleshooting/otp-verification-failures-token-has-expired-or-otp_expired-errors-5ee4d0)
- [verified-live] Reauthentication for a password change is gated by: if config.Security.UpdatePasswordRequireReauthentication { if session == nil || now.After(session.CreatedAt.Add(24*time.Hour)) { require nonce } }. A session minutes old from verifyOtp is therefore exempt even when the setting is ON. Errors: ErrorCodeReauthenticationNeeded "Password update requires reauthentication"; ErrorCodeSamePassword "New password should be different from the old password." (https://raw.githubusercontent.com/supabase/auth/master/internal/api/user.go)
- [verified-live] auth.email.secure_password_change defaults to off (CLI config shows None); env var is GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_REAUTHENTICATION. (https://supabase.com/docs/guides/local-development/cli/config + https://raw.githubusercontent.com/supabase/auth/master/README.md)
- [verified-live] supabase-js v2.102.0+ supports updateUser({ password, current_password }) for optional current-password verification. This is newer than what I held in memory. (https://supabase.com/docs/guides/auth/passwords)
- [verified-live] Password policy: GOTRUE_PASSWORD_MIN_LENGTH default 6; GOTRUE_PASSWORD_REQUIRED_CHARACTERS (colon-separated classes). Dashboard offers four character-class options, strongest being digits + lowercase + uppercase + symbols, symbol set !@#$%^&*()_+-=[]{};'\:"|<>?,./~. Docs say anything under 8 characters is not recommended. (https://supabase.com/docs/guides/auth/password-security + https://raw.githubusercontent.com/supabase/auth/master/README.md)
- [verified-live] Leaked-password protection (HaveIBeenPwned Pwned Passwords API) requires Pro Plan and above; it is listed as "Not included" on Free. (https://supabase.com/docs/guides/auth/password-security + https://supabase.com/pricing)
- [verified-live] Built-in Supabase email service sends only to pre-authorized addresses (organization team members) — anyone else fails with "Email address not authorized" — and is limited to 2 messages per hour with no delivery SLA. Custom SMTP is required before any real user can sign up. (https://supabase.com/docs/guides/auth/auth-smtp)
- [verified-live] After enabling custom SMTP a low rate limit of 30 messages per hour is imposed initially; raise it at Authentication > Rate Limits. Brevo is on Supabase's list of compatible SMTP providers. (https://supabase.com/docs/guides/auth/auth-smtp)
- [verified-live] Auth rate limits (defaults): emails 2/hour built-in (configurable with custom SMTP); /auth/v1/otp 60s per-user cooldown; /auth/v1/signup 60s per-user; /auth/v1/recover 60s per-user; sign-up/sign-in endpoints 30 requests per 5 min per IP; /auth/v1/verify 30 per 5 min per IP; /auth/v1/token 150 per 5 min per IP. All of these are configurable at Authentication > Rate Limits except MFA challenge limits. (https://supabase.com/docs/guides/auth/rate-limits)
- [verified-live] Per-address email cooldown is enforced in code by validateSentWithinFrequencyLimit(u.RecoverySentAt, config.SMTP.MaxFrequency), returning HTTP 429 with error code over_email_send_rate_limit. CLI default auth.email.max_frequency = "1m". (https://raw.githubusercontent.com/supabase/auth/master/internal/api/mail.go + https://supabase.com/docs/guides/local-development/cli/config)
- [verified-live] Template variables available: {{ .ConfirmationURL }}, {{ .Token }}, {{ .TokenHash }}, {{ .SiteURL }}, {{ .Email }}, {{ .NewEmail }}, {{ .RedirectTo }}, {{ .Data }}. Six templates: Confirm sign up, Invite user, Magic Link, Change email address, Reset password, Reauthentication. (https://supabase.com/docs/guides/auth/auth-email-templates)
- [verified-live] Supabase's own SSR sample uses href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}" for signup confirmation and &type=recovery for password reset, with a route calling supabase.auth.verifyOtp({ type, token_hash }). Astro is one of the documented framework targets. (https://supabase.com/docs/guides/auth/server-side/email-based-auth-with-pkce-flow-for-ssr)
- [verified-live] POST /auth/v1/verify accepts { type, token, token_hash, email, phone, redirect_to } — there is NO password field, so verify-and-set-password cannot be one call. PUT /auth/v1/user accepts { email, phone, password, nonce, data, app_metadata, channel }. POST /auth/v1/token?grant_type= accepts password | refresh_token | id_token | pkce | web3. (https://raw.githubusercontent.com/supabase/auth/master/openapi.yaml)
- [verified-live] Header requirements: apikey required on POST /token, POST /verify, GET /verify, POST /signup, POST /recover, POST /resend, POST /otp, GET /authorize and all /admin/*. Authorization: Bearer <access_token> required on GET /user, PUT /user, POST /logout, POST /reauthenticate. (https://raw.githubusercontent.com/supabase/auth/master/openapi.yaml)
- [verified-live] POST /verify with type=recovery issues a real session (issueRefreshToken ... sendJSON(w, http.StatusOK, token)), so a recovery link produces a normal signed-in session that can then call PUT /user. (https://raw.githubusercontent.com/supabase/auth/master/internal/api/verify.go)
- [verified-live] resetPasswordForEmail(email, options) hits POST /auth/v1/recover, uses the Reset Password template, does not sign the user in, and fires a PASSWORD_RECOVERY auth event when they return. Supabase states it does not reveal whether an account exists. (https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail + https://supabase.com/docs/guides/auth/passwords)
- [verified-live] POST /otp with create_user:false returns NewUnprocessableEntityError "Signups not allowed for otp" for an unknown address, which reveals non-existence. This is filed as an open bug: supabase/auth issue #1955, "signInWithOtp has a user enumeration vulnerability", still Open with the bug label. (https://raw.githubusercontent.com/supabase/auth/master/internal/api/otp.go + https://github.com/supabase/auth/issues/1955)
- [verified-live] A separate open issue, supabase/auth #2702, reports that POST /auth/v1/recover can still be enumerated: HTTP 400 email_address_invalid for an existing user vs silent success for a missing one. Two PRs (#2710, #2723) are open against it. (https://github.com/supabase/auth/issues/2702)
- [likely] signUp() for an already-registered confirmed address returns an obfuscated fake user object when email confirmations are enabled, and "User already registered" when they are disabled. (https://supabase.com/docs/guides/auth/passwords)
- [verified-live] There is no first-class field telling you whether a user has set a password. identities / app_metadata.providers are unreliable: supabase/auth issue #1605 (raw_app_meta_data not updated when setting a password for third-party users) and supabase discussion #37737 ("Password Reset Creates 'Ghost Password' Without Email Identity"). The community answer is to keep your own flag. (https://github.com/supabase/auth/issues/1605 + https://github.com/orgs/supabase/discussions/37737 + https://github.com/orgs/supabase/discussions/5741)
- [verified-live] Automatic identity linking: in GetAccountLinkingResult, "if there are no verified emails, we always decide to create a new account"; when verified emails match an existing user in the same linking domain the decision is LinkAccount — "no similarIdentities but a user with the same email exists / so we link this new identity to the user". Ambiguity (several users on one email) yields MultipleAccounts. (https://raw.githubusercontent.com/supabase/auth/master/internal/models/linking.go + https://supabase.com/docs/guides/auth/auth-identity-linking)
- [verified-live] Google web setup needs: a Web-application OAuth client in Google Cloud, Authorized JavaScript origin https://wiserwalk.com, Authorized redirect URI https://<project-ref>.supabase.co/auth/v1/callback, client ID+secret pasted into the Google provider page, and our domain on the Site URL / Redirect URLs allow list. There is a "Skip nonce check" toggle. No REST change on our side: GET /auth/v1/authorize?provider=google. (https://supabase.com/docs/guides/auth/social-login/auth-google)
- [verified-live] Redirect URL allow list supports glob patterns: * matches any sequence of non-separator characters, ** any sequence, ? a single non-separator character; separators are . and /. Site URL is the fallback when redirectTo is absent. (https://supabase.com/docs/guides/auth/redirect-urls)
- [verified-live] Sessions: access token (JWT) default lifetime 3600s (auth.jwt_expiry); refresh token rotation enabled by default (auth.enable_refresh_token_rotation = true) with auth.refresh_token_reuse_interval = 10 seconds; refresh tokens are single-use with limited exceptions and reuse is detected. Session time-box, inactivity timeout and single-session-per-user are Pro Plan and up. (https://supabase.com/docs/guides/auth/sessions + https://supabase.com/docs/guides/local-development/cli/config)
- [verified-live] signOut() defaults to scope 'global', signing the person out on every device; 'local' and 'others' are the alternatives; 'others' fires no SIGNED_OUT event. REST: POST /auth/v1/logout?scope=global|local|others with Authorization: Bearer. (https://supabase.com/docs/reference/javascript/auth-signout)
- [verified-live] CAPTCHA supports hCaptcha and Cloudflare Turnstile, enabled at Settings > Authentication > Bot and Abuse Protection. Token is passed as options.captchaToken in supabase-js and gotrue_meta_security.captcha_token in REST. It applies to sign-in, sign-up and password-reset forms. (https://supabase.com/docs/guides/auth/auth-captcha)
- [verified-live] POST /auth/v1/admin/generate_link takes { type: magiclink|signup|recovery|invite|email_change_current|email_change_new, email, new_email?, password?, data?, redirect_to? } with Authorization: Bearer <service_role>, and returns { action_link, email_otp, hashed_token, verification_type, redirect_to }. It does not send the email. It creates the user for signup, invite and magiclink. (https://raw.githubusercontent.com/supabase/auth/master/openapi.yaml + https://supabase.com/docs/reference/javascript/auth-admin-generatelink)
- [likely] generateLink with type 'magiclink' has a reported flakiness: supabase/supabase issue #22521, "magiclink auth.admin.generateLink occasionally fails to create a user when it does not exist", with users seeing a subsequent verifyOtp fail with "user not found" on the first login with a new address. (https://github.com/supabase/supabase/issues/22521)
- [verified-live] Free plan: 50,000 MAU included, 500 MB database, limit of 2 active projects, and "Free projects are paused after 1 week of inactivity". Leaked password protection, session limits/timeouts, advanced MFA and SAML SSO are all Not included. (https://supabase.com/pricing)
- [verified-live] Error objects from supabase.auth.* carry message, status and code. AuthWeakPasswordError additionally carries reasons: WeakPasswordReasons[], detectable with isAuthWeakPasswordError(error). (https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/errors.ts)
- [verified-live] Relevant auth error codes: otp_expired, otp_disabled, email_not_confirmed, email_exists, user_already_exists, over_email_send_rate_limit, over_request_rate_limit, weak_password, same_password, reauthentication_needed, reauthentication_not_valid, invalid_credentials, signup_disabled, flow_state_expired. (https://supabase.com/docs/guides/auth/debugging/error-codes)
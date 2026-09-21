# brevo-sending

web_access_worked: true

## What already exists in this repo

Read: `site/src/lib/email/README.md`, `site/src/lib/email/provider.ts`, `site/scripts/email-test.mjs`.

**What is built:** contact capture only. `provider.ts` exports `brevo(apiKey, {listId, doiTemplateId, doiRedirect, timeoutMs})`, which POSTs to one of two endpoints with the header `{'api-key': apiKey}` and an 8-second `AbortController` deadline:

- plain: `POST https://api.brevo.com/v3/contacts` with `{email, updateEnabled: true, listIds: [n], attributes: {...}}`
- double opt-in: `POST https://api.brevo.com/v3/contacts/doubleOptinConfirmation` with `{email, includeListIds: [n], templateId, redirectionUrl, attributes: {...}}`

`attributesFor()` sends exactly three attributes, uppercase, and omits empty ones: **`QUIZ`**, **`RESULT_CODE`**, **`RESULT_HEADLINE`**. Status mapping: 201 new, 204 update, 200 already, 400 + `code === 'duplicate_parameter'` treated as success, 401/403 "our fault", 429/5xx retryable. `getProvider(env)` precedence: `EMAIL_PREVIEW=1` → console; `BREVO_API_KEY` → brevo; `MAILERLITE_API_KEY` → mailerlite; else console.

**Env vars the owner was already told to set** (README): `BREVO_API_KEY` (required), `BREVO_LIST_ID` (required, a number), `BREVO_DOI_TEMPLATE_ID` (optional), `BREVO_DOI_REDIRECT` (optional, default `https://wiserwalk.com/?sub=confirmed`). Legacy: `MAILERLITE_API_KEY`, `MAILERLITE_GROUP_ID`, `EMAIL_PREVIEW`.

**Brevo settings he was told to make:** an account; a list called `Wiser Walk` (note its numeric id); three *Text* contact attributes named exactly `QUIZ`, `RESULT_CODE`, `RESULT_HEADLINE` (Contacts → Settings → Contact attributes); an API key; optionally a double opt-in template containing `{{ doubleoptin }}`.

**Critically: the README never mentions a sender address or domain authentication.** Nothing he has done so far makes the account able to *send* an email from wiserwalk.com. Its API-key path is also stale. `email-test.mjs` stubs `fetch` and asserts the contacts requests field-by-field; **there is no transactional-send code and no test for one.**

---

## 1. Transactional email API

```
POST https://api.brevo.com/v3/smtp/email
api-key: <same BREVO_API_KEY already in Vercel>
content-type: application/json
```

```json
{
  "sender":   { "email": "account@wiserwalk.com", "name": "Wiser Walk" },
  "to":       [ { "email": "reader@example.com" } ],
  "replyTo":  { "email": "hello@wiserwalk.com", "name": "Wiser Walk" },
  "subject":  "Set your password",
  "htmlContent": "<html><body><p>...</p></body></html>",
  "textContent": "...",
  "tags":     ["auth", "set-password"],
  "headers":  { "X-Wiserwalk-Purpose": "set-password" }
}
```

- Required: either `sender` + `subject` + `htmlContent`, **or** `templateId` (+ `params`). Recipients via `to` **or** `messageVersions`, never both.
- `headers` names must be `Title-Case-Format`; standard email headers are not accepted. Brevo's own special ones are `sender.ip` and `idempotencyKey`; `X-Mailin-custom` is echoed into the sent message and is therefore **visible to the recipient** — do not put anything private there.
- `replyTo` supports **one** address only.
- Responses: **201** `{"messageId": "<...>"}`, **202** scheduled, **400** `{code, message}`. Account-level failures use codes `permission_denied`, `account_under_validation`, `not_enough_credits`, `unauthorized`; 402 = "Account requires activation or additional credits".
- **The same API key works.** Brevo API keys are account-wide: "API keys give full access to your Brevo account." No new env var is needed for sending — `BREVO_API_KEY` is enough.
- Rate limits (general tier): `/v3/smtp/email` 1,000 req/s, `/v3/contacts` **10 req/s**. 429 on exceed.

**Activation:** transactional is *not* on by default. Brevo: *"Transactional email sending requires a separate activation step from Brevo. If you've never sent transactional emails from your account, contact our support team by creating a ticket from your account to request activation."* The SMTP symptom is `450 Your SMTP account is not yet activated`. **Make this step 1 of the owner's checklist** — it involves waiting on a human.

## 2. SMTP relay (what Supabase custom SMTP would use)

| field | value |
|---|---|
| Host | `smtp-relay.brevo.com` |
| Port | **587** (default, TLS/STARTTLS); 2525 if 587 is blocked; 465 for SSL |
| Username | the **SMTP login** — either the account login email or an auto-generated `[ID]@smtp-brevo.com`, shown on the SMTP page. Changing the account email does not change it. |
| Password | an **SMTP key**, *not* the API key |
| From | a verified sender / domain-authenticated address. **Never the SMTP login.** |

Generate at: account dropdown → **Settings → SMTP & API → SMTP tab → Generate a new SMTP key**. Pick **Standard (64 chars)**; only use *Short (15 chars)* if the client truncates passwords. Set **no expiration**. Shown once.

Both API keys and SMTP keys: **inactive keys expire after 90 days.**

## 3. Free plan

- **300 email sends per day, one shared pool** across campaigns, automations and transactional. Resets daily, no rollover.
- Over the limit, transactional mail goes to a **retry queue capped at 1,000**; beyond that, *"Emails beyond this queue are not delivered."*
- 100,000 contacts; 1 user; 2,000 contacts/month into automations; basic stats only.
- **"Emails sent from the Free plan always include the Sent with Brevo sticker."** Removing it requires Starter + the *Remove Brevo branding* add-on, or Standard/Professional/Enterprise.

## 4. Senders and domain authentication for wiserwalk.com

**Path:** Settings → **Senders, Domains, IPs → Domains** → *Add a domain* → enter `wiserwalk.com` → **choose "Authenticate the domain yourself" (manual)**.

Do **not** use automatic authentication: it logs into the DNS provider and *"If your domain already has a DMARC record, you'll be asked if you want to replace it with Brevo's DMARC record."* wiserwalk.com already has one.

Brevo asks for three records:

| name | type | note |
|---|---|---|
| Brevo code | **TXT** | host `@` (or the domain, or blank); value contains a `:` — some DNS editors reject that |
| DKIM | **1 TXT** at selector `mail._domainkey`, **or 2 CNAME** at `brevo1._domainkey` / `brevo2._domainkey` — whichever the dashboard shows | 1024-bit by default; 2048-bit (`sib2k`) only on request to support |
| DMARC | TXT at `_dmarc` | **see below — do not add a second one** |

**SPF: not needed.** *"The SPF and MX records are not required to authenticate a domain. We only provide these records when setting up a dedicated IP."* So the single-SPF-record rule never comes into play — leave SiteGround's SPF untouched.

**Live DNS at wiserwalk.com right now (verified via dns.google):**

```
TXT   wiserwalk.com    v=spf1 +a +mx include:wiserwalk.com.spf.auto.dnssmarthost.net ~all
TXT   _dmarc           v=DMARC1; p=none; aspf=r; adkim=r;        <- no rua tag
TXT   default._domainkey   v=DKIM1; p=MIGfMA0...                  <- SiteGround DKIM
MX    mx10/20/30.antispam.mailspamprotection.com                  <- SiteGround mail
```

So the safe plan at SiteGround:

1. **ADD** the Brevo code TXT at the root. Multiple TXT records at the root are fine; only *SPF* is one-per-domain and we are not adding one.
2. **ADD** Brevo's DKIM record(s). The selector `mail._domainkey` (or `brevo1/brevo2._domainkey`) does **not** collide with SiteGround's `default._domainkey`. Both DKIM keys coexist happily — DKIM is selector-scoped by design.
3. **EDIT, do not duplicate, `_dmarc`.** Append a `rua` tag to the existing record, e.g. `v=DMARC1; p=none; rua=mailto:dmarc@wiserwalk.com; aspf=r; adkim=r;`. Keep `p=none`. Brevo will otherwise report "your DMARC record is missing a rua tag", and two DMARC records break DMARC outright.
4. **Touch nothing else.** No MX, no SPF, no NS delegation.
5. Back in Brevo, click **"Authenticate this email domain"**. Up to 48 hours to propagate.

**Sender:** Settings → **Senders, Domains, IPs → Senders → Add a sender**. Once `wiserwalk.com` is authenticated, *"all senders using that domain are automatically verified."* Unauthenticated, Brevo emails a **6-digit code** to the address which you paste back in; an unverified sender *"cannot be used to send transactional emails."*

**Use a dedicated account sender**, e.g. From name `Wiser Walk`, From email `account@wiserwalk.com`, separate from whatever sends the newsletter. Reason in §6.

**If he sends from a gmail.com address instead:** Brevo rewrites the From. Marketing becomes `mycompany@5000001.brevosend.com`; **transactional becomes `mycompany@5000001.t-sender-sib.com`**. *"Brevo replaces any free email address used for sending, regardless of the recipients."* And: *"If your domain is not authenticated with DMARC, all emails sent to Microsoft recipients (@outlook.com, @hotmail.com, and @live.com) will be marked as spam or rejected."* A password-reset mail from `…@5000001.t-sender-sib.com` is functionally dead on arrival.

## 5. Contacts, attributes, and marking an account sign-up

Already built and correct: `POST /v3/contacts` with `{email, updateEnabled: true, listIds:[n], attributes:{QUIZ, RESULT_CODE, RESULT_HEADLINE}}`.

**To mark a contact as having come from account sign-up, add an attribute, not a second list.** Recommendation:

- Add a Text attribute **`SOURCE`** (values `quiz-result`, `account-signup`, `footer`) — one field, works with `updateEnabled: true`, segmentable, and does not fragment the list the owner wants to market to.
- Optionally a Date attribute **`ACCOUNT_CREATED`**.
- A second list would mean two list ids in the env, two places to keep in sync, and contacts on both lists — avoid it. Lists are for *who gets which campaign*; attributes are for *what we know*.

Whatever is chosen, **the attribute must be created in Brevo first**: *"These attributes must be present in your Brevo account"*, and Brevo silently ignores unknown ones — the existing README already warns about this.

**Double opt-in and accounts:** do **not** route account sign-up through `/v3/contacts/doubleOptinConfirmation`. Two reasons: (a) the person is already proving ownership of the address by clicking the set-password link, so a second confirmation email is friction the owner explicitly hates; (b) the DOI endpoint documents `includeListIds`, `redirectionUrl` **and** `templateId` as *required*, and the current code sends `includeListIds: []` when no list is configured, which will likely 400. Marketing-only sign-up (the footer form) can keep DOI; account sign-up should use plain `POST /v3/contacts` after the password is set, so only confirmed addresses land on the list. DOI confirmation mails also consume the 300/day pool and the link expires in 30 days.

## 6. Link tracking — the biggest design constraint

**It cannot be switched off**, and this directly threatens one-time sign-in links.

- Brevo rewrites every link in every transactional email through its own redirector (`sendibt2.com`, `sendibt3.com`, `sendibm1.com`; newer docs name `r.brevolinks.com`). A real example from the forum: `https://hfrhp.r.a.d.sendibm1.com/mk/cl/f/sh/1f8qm…`
- Brevo PM, May 2024: *"Disabling tracking is not planned (at least not yet), for security reasons. EDIT: Disabling tracking will be available, upon request and to our Enterprise plans."* The thread runs to **Feb 2026** with no fix and several customers leaving over it.
- Anymail's docs: *"No click-tracking or open-tracking options — Brevo does not provide a way to control open or click tracking for individual messages."* **There is no per-email header and no per-key switch.**
- What *is* available: **account-wide anonymisation** at Settings → **Automations → Transactional emails → Tracking** → *Anonymous email tracking* = Yes. This unlinks opens/clicks from contacts; it does **not** stop the rewrite. (Campaigns have their own toggle at Settings → Default settings → Tracking.)
- Also available: per-recipient `contactPixelTrackingConsent: true|false` on each entry of `to`/`cc`/`bcc`, after enabling Settings → **Contacts → Per-contact pixel tracking consent**. Whether `false` also suppresses the link rewrite is unverified — test it.

**Build the token to survive this.** Concretely: make the one-time token tolerate a prefetch (do not consume it on `GET`; land on a page with a visible "Set my password" button that `POST`s), give it a reasonable lifetime, and keep the visible URL short. Also note the forum's report of Brevo SSL-certificate failures on `sendibt2.com` breaking account verification links entirely — worth a plain-language fallback in the email ("if the button does not work, go to wiserwalk.com/signin and ask for a new link").

If the **branded subdomain** feature is available on the account, it turns the tracking host into `r.mail.wiserwalk.com` and the return-path into `mail.wiserwalk.com` — the single biggest cosmetic and deliverability win available. Check for it on the Domains page.

## 7. The unsubscribe header on a password-reset email

*"Brevo automatically includes a list-unsubscribe header in your email campaigns and transactional emails"* and it *"may result in an Unsubscribe link being displayed by some email providers."* Swapping it for a `List-Help` header *"is only available with an Enterprise plan, and under specific conditions."*

So Gmail will show **Unsubscribe** beside "Set your password", and if the user clicks it they are blocklisted. The containment is that **transactional blocklisting is per sender**: *"when a contact unsubscribes from your transactional emails, they are only blocked from the sender of this specific email… they may still receive important notifications such as order confirmations or password reset."*

→ **Send account mail from a sender used for nothing else** (`account@wiserwalk.com`), and marketing from a different one (`hello@wiserwalk.com`). Campaign blocklisting and transactional blocklisting are already separate channels, so an unsubscribe from the newsletter cannot kill sign-in emails; the dedicated sender closes the remaining hole.

Also worth handling in the app: if Brevo reports a recipient as blocked, the sign-in page should say so plainly rather than claiming "we sent you a link".

## 8. The numbered steps to write for the owner (ordered by wait time)

1. In Brevo, **create a support ticket asking to activate transactional email sending.** (Do this first; it is the only step with a human queue.)
2. Settings → Senders, Domains, IPs → Domains → **Add a domain** `wiserwalk.com` → **"Authenticate the domain yourself"**. Copy the Brevo code and DKIM values.
3. At SiteGround: **add** the Brevo code TXT; **add** the DKIM TXT/CNAMEs; **edit** the existing `_dmarc` record to add `rua=mailto:…`. Change nothing else — not MX, not SPF.
4. Back in Brevo, click **Authenticate this email domain** (may take up to 48h).
5. Settings → Senders, Domains, IPs → **Senders → Add a sender**: `Wiser Walk` / `account@wiserwalk.com`.
6. Settings → **SMTP & API → SMTP tab → Generate a new SMTP key** (Standard, no expiration) — only if Supabase custom SMTP is the chosen route. Note the **SMTP login** shown on that page; it is probably *not* his account email.
7. Settings → SMTP & API → **API Keys & MCP** — the existing `BREVO_API_KEY` already works for sending, so only regenerate if it has an expiry set.
8. Contacts → Settings → Contact attributes → add **`SOURCE`** (Text).
9. Optional: Settings → Automations → Transactional emails → Tracking → **Anonymous email tracking = Yes**.
10. Paste the SMTP key (and nothing else new) into Supabase / Vercel, then redeploy.

## 9. Fixes needed in this repo before accounts ship

- `site/src/lib/email/README.md`: add the sender + domain-authentication steps (missing entirely), correct the API-key path to **Settings → SMTP & API → API Keys & MCP**, note the mandatory expiry choice and the 90-day inactive-key expiry, and add the transactional-activation ticket as step 1.
- `site/src/lib/email/provider.ts`: the DOI branch sends `includeListIds: []` when `BREVO_LIST_ID` is unset, but Brevo documents that field as required — that call will probably 400. The comment on line 138 ("204 is… what the double opt-in endpoint answers") disagrees with the reference, which documents **201**; the code accepts 200/201/204 so behaviour is fine, the comment is not.
- New code for sending will need a `sendTransactional()` alongside `subscribe()`, reusing the same `postJson` deadline helper and the same `api-key` header, plus a `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` pair of env vars so the From address is not hard-coded.
- `site/scripts/email-test.mjs` should grow a stubbed-fetch test for `/v3/smtp/email` in the same style: assert the endpoint, the `api-key` header, the exact body, and that the key never appears in a URL or body.

## gotchas
- THE 300/DAY IS ONE SHARED POOL. Account emails (Supabase confirm, set-password, forgot-password, magic links), DOI confirmations and any marketing campaign all draw on the same 300 sends per day. Past the limit, transactional mail goes into a retry queue capped at 1,000 and anything beyond that is simply not delivered - a user waiting for a sign-in link gets silence and there is no signal in the app. Budget for this before launch: 300/day is roughly 12/hour sustained.
- TRANSACTIONAL SENDING MUST BE ACTIVATED BY BREVO SUPPORT. A brand-new account can add contacts through /v3/contacts (which is all the current code does) and still fail to send a single email. The owner must raise a support ticket from inside the account to request transactional activation, and should do that FIRST, before any auth code is written - it is a human-in-the-loop wait, not a setting he can toggle.
- BREVO REWRITES EVERY LINK AND THIS CANNOT BE TURNED OFF. A 'set your password' link becomes something like https://hfrhp.r.a.d.sendibm1.com/mk/cl/f/sh/1f8qm... Disabling it is Enterprise-only and on request; the thread asking for it has run from Nov 2023 to Feb 2026 with no fix. Three consequences: (1) the link looks like phishing to a non-technical user, which is exactly the wrong look on a security email; (2) corporate/school mail filters and link-prefetchers can BURN A ONE-TIME TOKEN by visiting the redirect - design the token to be single-use-on-POST or tolerant of one GET; (3) users reported Brevo SSL-certificate outages on sendibt2.com breaking account verification links entirely. 'Anonymous email tracking' (Settings > Automations > Transactional emails > Tracking) only unlinks the data from the contact - the link is still rewritten.
- BREVO FORCES A List-Unsubscribe HEADER ONTO TRANSACTIONAL EMAILS. Gmail and Outlook will render an 'Unsubscribe' button next to a password-reset email. Replacing it with List-Help is Enterprise-only. If a user clicks it they are blocklisted from that SENDER's transactional emails - and since transactional blocklisting is per-sender, a dedicated sender for account mail (e.g. account@wiserwalk.com) is the containment: an unsubscribe from the newsletter sender can never kill his sign-in emails, and vice versa.
- THE FREE PLAN STAMPS 'Sent with Brevo' ON EVERY EMAIL, including the account emails. On a page whose job is to look trustworthy while asking someone to set a password, third-party branding is a real cost. Removing it needs Starter + the Remove Brevo branding add-on at minimum.
- DO NOT ADD A SECOND _dmarc RECORD AT SITEGROUND. wiserwalk.com already has exactly one: `v=DMARC1; p=none; aspf=r; adkim=r;` - and it has NO rua tag, which Brevo will flag. Two DMARC records break DMARC entirely. Edit the existing one to add rua=mailto:..., keep p=none, and never let Brevo's AUTOMATIC authentication run, because it offers to REPLACE the existing DMARC record. Choose 'Authenticate the domain yourself' (manual).
- DO NOT TOUCH THE SPF RECORD. Brevo explicitly does not need SPF or MX unless you buy a dedicated IP. The single SiteGround SPF TXT (`v=spf1 +a +mx include:wiserwalk.com.spf.auto.dnssmarthost.net ~all`) stays exactly as it is. There is no include: to merge, so the one-SPF-record rule is never at risk here.
- NEVER USE THE 'Brevo-managed setup' NS DELEGATION. It would hand DNS control for a zone to Brevo and Brevo's own docs say it is unavailable for a root domain for that reason. Delegating anything at wiserwalk.com would put the SiteGround MX/SPF/DKIM/DMARC records at risk. Individual DNS records only.
- API KEYS AND SMTP KEYS NOW EXPIRE. You must choose an expiry (7 days to 1 year) or explicitly 'no expiration' at creation, AND 'inactive API keys expire after 90 days' (same for SMTP keys). For an owner who cannot debug auth, a silently expired key means sign-up dies with a 401 weeks later. Choose 'no expiration', and treat a sudden 401 as the first thing to check.
- AN SMTP KEY IS NOT THE API KEY. If Supabase custom SMTP is configured with BREVO_API_KEY it fails with '535 5.7.8 Authentication failed'. Supabase needs: host smtp-relay.brevo.com, port 587, username = the SMTP login (often [ID]@smtp-brevo.com, NOT the account email), password = a Standard SMTP key. The SMTP login must never be used as the From address.
- IF THE SENDER IS NOT ON AN AUTHENTICATED DOMAIN, BREVO REWRITES THE FROM ADDRESS. A transactional email sent from a gmail.com address goes out as something@5000001.t-sender-sib.com. A password-reset email from an address like that will be ignored or reported as spam. wiserwalk.com must be authenticated in Brevo BEFORE any account email is sent, and the From must be an address at wiserwalk.com.
- THE EXISTING DOI CODE PATH IS LIKELY BROKEN IF NO LIST ID IS SET. site/src/lib/email/provider.ts sends `includeListIds: []` when BREVO_LIST_ID is absent (and email-test.mjs asserts that empty array as correct), but Brevo documents includeListIds, redirectionUrl and templateId as REQUIRED on /v3/contacts/doubleOptinConfirmation. An empty array will probably 400. Also, the code comments say 204 is the DOI success code while the reference documents 201 - the code accepts 200/201/204 so it is safe, but the comment is wrong.
- site/src/lib/email/README.md HAS NEVER MENTIONED A SENDER OR DOMAIN AUTHENTICATION. Its four setup steps cover only the list, the three attributes, the API key and the Vercel vars - enough to STORE contacts, not enough to SEND anything. Its API-key path ('SMTP & API > API keys') is also stale; the page is now 'SMTP & API > API Keys & MCP' and forces an expiry choice. The README needs rewriting before the owner touches Brevo again for accounts.
- PROTECT THE SIGN-UP FORM AGAINST BOTS. Brevo automatically suspends the transactional platform if an unprotected form on the account is hit by bot sign-ups, and recovery is a support ticket. One community thread also found Brevo treated reCAPTCHA v3 submissions as a bot attack. Rate-limit /api/subscribe and the account sign-up route server-side.
- THE CONTACTS ENDPOINT IS RATE-LIMITED AT 10 REQUESTS PER SECOND (36,000/hour) while transactional allows 1,000/s. If sign-up both creates a contact and sends an email, the contacts call is the bottleneck, and a 429 there must not block the auth email.

## open_questions
- Does `contactPixelTrackingConsent: false` stop Brevo REWRITING the links, or only stop the click being attributed to a contact? The CNIL article says 'Brevo does not track opens or clicks for this email', but every other source says link rewriting is unconditional. This needs one real test send before relying on it to produce a clean sign-in URL.
- Is the 'branded subdomain' feature (which would turn r.brevolinks.com into r.mail.wiserwalk.com and make the sign-in link look like ours) available on the FREE plan? The article states no plan restriction, only that it is part of a new domain setup flow 'not yet available to all users'. Worth checking in the account once it exists - it is the single biggest improvement available to the look of the sign-in link.
- Exact hostnames/values of the Brevo code and DKIM records are account-specific and only shown inside the Brevo dashboard. Brevo's own articles never print them; the DKIM TXT selector appears to be `mail._domainkey`, and the CNAME variant is commonly `brevo1._domainkey` / `brevo2._domainkey`, but the owner must copy the real values from the Domains page rather than us predicting them.
- Does the REST endpoint POST /v3/smtp/email return a specific error code (permission_denied? account_under_validation?) when the transactional platform is not yet activated, or does it accept the call and silently queue? The 450 error is documented for the SMTP relay only. Any code we write should log the raw body of a non-2xx so the owner can be told exactly what to put in the support ticket.
- Whether Supabase Auth's own emails count one-per-action or retry, and therefore what the real daily ceiling is against the 300/day shared pool. Needs pairing with whoever researched Supabase Auth.
- Whether a SiteGround DNS editor accepts a TXT value containing ':' (the Brevo code value is of the form `brevo-code:<hash>`). Brevo names this as a known failure with some providers.

## facts
- [verified-live] The transactional send endpoint is POST https://api.brevo.com/v3/smtp/email, content-type application/json, authenticated with the header `api-key`. Body fields: sender {email|id, name}, to/cc/bcc [{email, name, contactPixelTrackingConsent}], replyTo {email, name}, subject, htmlContent, textContent, templateId, params, tags (string array), headers (object, Title-Case-Format names), attachment [{url|content, name}], scheduledAt, batchId, messageVersions. Required: either (sender + subject + htmlContent) or templateId; plus `to` or `messageVersions` (mutually exclusive). (https://developers.brevo.com/reference/sendtransacemail)
- [verified-live] Documented responses for POST /v3/smtp/email: 201 'Transactional email sent successfully' returning {"messageId": "<...>"} (or messageIds), 202 'Transactional email scheduled successfully', 400 for missing/invalid parameters with an error object carrying `code` and `message`. (https://developers.brevo.com/reference/sendtransacemail)
- [verified-live] One Brevo API key covers the whole account, so the SAME key already set as BREVO_API_KEY for POST /v3/contacts also works for POST /v3/smtp/email. Brevo states: 'API keys give full access to your Brevo account and should be protected in the same way as a password.' There is no per-endpoint scoping on API keys. (https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys)
- [verified-live] The API key page is now at: account dropdown > Settings > SMTP & API > API Keys & MCP > Generate a new API key. On creation you must set an expiry date from 7 days to 1 year, or choose no expiration. Existing keys are never shown again (only the last digits). (https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys)
- [verified-live] GOTCHA: 'To improve security and reduce the risk of exposure from unused credentials, inactive API keys expire after 90 days.' Email reminders go out 7 days before and on the expiration date. The identical rule exists for SMTP keys. (https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys)
- [verified-live] SMTP relay settings: SMTP server `smtp-relay.brevo.com`; SMTP user is your SMTP login, which is either your Brevo account login email or an auto-generated address of the form `[ID]@smtp-brevo.com`; SMTP password is an SMTP KEY, explicitly 'not an API key'. (https://help.brevo.com/hc/en-us/articles/7924908994450-Send-transactional-emails-using-Brevo-SMTP)
- [verified-live] SMTP keys are generated at account dropdown > Settings > SMTP & API > SMTP tab > Generate a new SMTP key. Two variants: Standard (64 characters, recommended) and Short (15 characters, only if the client truncates long passwords). Expiry 7 days to 1 year or none. Inactive SMTP keys expire after 90 days. The full key is shown only once. (https://help.brevo.com/hc/en-us/articles/7959631848850-Create-and-manage-your-SMTP-keys)
- [verified-live] Brevo SMTP ports: 587 (recommended default, STARTTLS), 2525 (alternative when 587 is blocked), 465 (SSL/TLS). Encryption field should be left empty unless using 465. (https://help.brevo.com/hc/en-us/articles/10905415650322-Which-SMTP-port-should-I-use-Port-587-465-or-2525)
- [verified-live] FREE PLAN: 300 email sends per day, ONE shared pool - the same limit governs campaign emails and transactional emails. 'Transactional emails: once you reach your daily limit, up to 1,000 additional emails are held in a retry queue. Emails beyond this queue are not delivered.' Limit resets daily; unused sends do not roll over. Up to 100,000 contacts. (https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [verified-live] FREE PLAN BRANDING: 'Emails sent from the Free plan always include the Sent with Brevo sticker.' It cannot be removed without upgrading to Starter (with the Remove Brevo branding add-on), Standard, Professional or Enterprise. (https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [likely] The 'Sent with Brevo' sticker applies to transactional emails too, so a 'set your password' email on the free plan will carry Brevo branding. The help article says 'always' without naming transactional separately; third-party reviews state it applies to transactional API sends. (https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan)
- [verified-live] TRANSACTIONAL MUST BE ACTIVATED SEPARATELY: 'Transactional email sending requires a separate activation step from Brevo. If you've never sent transactional emails from your account, contact our support team by creating a ticket from your account to request activation.' The symptom is the SMTP error '450 Your SMTP account is not yet activated' or 'Your sending platform is currently disabled'. (https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP)
- [verified-live] Brevo can also suspend the transactional platform automatically if an unprotected sign-up form is hit by bots, or if the account looks compromised. Recovery is a support ticket in both cases. (https://help.brevo.com/hc/en-us/articles/115000188150-Troubleshooting-Issues-with-Brevo-SMTP)
- [verified-live] Domain authentication needs three record types: Brevo code (TXT, proves ownership), DKIM (either 1 TXT record or 2 CNAME records - Brevo shows which), DMARC (TXT). Settings > Senders, Domains, IPs > Domains > Add a domain. Propagation can take up to 48 hours. (https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-record-DMARC-record)
- [verified-live] SPF IS NOT NEEDED: 'The SPF and MX records are not required to authenticate a domain. We only provide these records when setting up a dedicated IP.' So nothing has to be added to or merged into the existing single SPF TXT record at wiserwalk.com. (https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-record-DMARC-record)
- [verified-live] Brevo's automatic domain authentication will ASK TO REPLACE an existing DMARC record: 'If your domain already has a DMARC record, you'll be asked if you want to replace it with Brevo's DMARC record. If you don't want to replace your existing DMARC record with Brevo's, you need to authenticate your domain manually instead.' Brevo also warns to keep only ONE DMARC record. (https://help.brevo.com/hc/en-us/articles/12163873383186-Authenticate-your-domain-with-Brevo-Brevo-code-DKIM-record-DMARC-record)
- [verified-live] The DKIM TXT host Brevo uses is the selector `mail`, i.e. `mail._domainkey.<domain>` (Brevo's troubleshooting article uses `mail._domainkey.domain.com` as its worked example). The default key is 1024-bit; a 2048-bit key (value starts with `sib2k`) must be requested from support. Where two CNAMEs are shown instead, they exist so Brevo can rotate keys without you touching DNS. (https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-issues-with-domain-authentication-Brevo-code-DKIM-DMARC)
- [verified-live] The Brevo code TXT VALUE contains a colon, and some DNS hosts reject ':' in a value field; Brevo names Alfahosting as one. If the hostname field rejects Brevo's suggested name, use '@', the domain name, or leave it blank. (https://help.brevo.com/hc/en-us/articles/16045394674066-Troubleshooting-issues-with-domain-authentication-Brevo-code-DKIM-DMARC)
- [verified-live] LIVE DNS AT wiserwalk.com TODAY: SPF `v=spf1 +a +mx include:wiserwalk.com.spf.auto.dnssmarthost.net ~all` (single TXT at root); DMARC at _dmarc `v=DMARC1; p=none; aspf=r; adkim=r;` (NO rua tag); DKIM selector in use is `default._domainkey` (SiteGround/dnssmarthost); MX = mx10/20/30.antispam.mailspamprotection.com. So Brevo's `mail._domainkey` or `brevo1/brevo2._domainkey` will NOT collide with SiteGround's DKIM, and the Brevo code TXT can be added at the root alongside the SPF TXT. (https://dns.google/resolve?name=wiserwalk.com&type=TXT)
- [verified-live] Senders: if the sender's domain is authenticated, 'all senders using that domain are automatically verified'. If not, Brevo emails a 6-digit code to the sender address which you paste into Brevo to verify. An unverified sender 'cannot be used to send transactional emails'. Path: Settings > Senders, Domains, IPs > Senders > Add a sender. (https://help.brevo.com/hc/en-us/articles/208836149-Create-a-new-sender-From-name-and-From-email)
- [verified-live] FREE-MAIL SENDER REWRITING, with exact formats: 'If you are sending from a free email address or have not authenticated your domain, Brevo temporarily replaces your sender address with a compliant one.' Original mycompany@gmail.com becomes mycompany@5000001.brevosend.com for marketing emails and mycompany@5000001.t-sender-sib.com for TRANSACTIONAL emails. 'Brevo replaces any free email address used for sending, regardless of the recipients.' Gmail/Yahoo domains cannot be authenticated at all. (https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders)
- [verified-live] Also: 'If your domain is not authenticated with DMARC, all emails sent to Microsoft recipients (@outlook.com, @hotmail.com, and @live.com) will be marked as spam or rejected.' (https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders)
- [verified-live] LINK TRACKING CANNOT BE TURNED OFF on a free/standard plan. Brevo rewrites every link in transactional email through its own redirector (users report sendibt2.com, sendibt3.com, sendibm1.com; Brevo's own newer docs name r.brevolinks.com). A Brevo PM stated in May 2024: 'Disabling tracking is not planned (at least not yet), for security reasons. EDIT: Disabling tracking will be available, upon request and to our Enterprise plans.' As of the last post on the thread (Feb 2026) there is still no per-message or per-key opt-out, and Brevo staff had not shipped one. (https://community.brevo.com/t/no-way-to-disable-by-option-tracking-in-transactional-e-mail/201?page=3)
- [verified-live] There is no per-message API flag for click or open tracking. The Anymail library documents it flatly: 'No click-tracking or open-tracking options - Brevo does not provide a way to control open or click tracking for individual messages.' (https://anymail.dev/en/stable/esps/brevo/)
- [verified-live] ACCOUNT-WIDE ANONYMISATION (not disabling) is available. For transactional: account dropdown > Settings > Automations > Transactional emails > Tracking > Yes under 'Anonymous email tracking'. For campaigns it is Settings > Default settings > Tracking. Anonymisation stops opens/clicks being tied to a contact; it does NOT stop the link being rewritten. (https://help.brevo.com/hc/en-us/articles/11643306229906-Can-I-anonymize-the-tracking-of-opens-and-clicks-for-my-emails)
- [verified-live] PER-RECIPIENT consent field exists: after activating Settings > Contacts > Per-contact pixel tracking consent, you add `contactPixelTrackingConsent` to each entry of the to/cc/bcc arrays in the API call. true = track, false = 'Brevo does not track opens or clicks for this email', unknown/unset = account default. This was introduced for the CNIL recommendation of 14 April 2026 (consent required from 14 July 2026 for French contacts). (https://help.brevo.com/hc/en-us/articles/37114679474706-About-email-tracking-pixels-and-the-CNIL-recommendation-in-Brevo)
- [verified-live] LIST-UNSUBSCRIBE IS FORCED ON AUTH EMAILS: 'Brevo automatically includes a list-unsubscribe header in your email campaigns and transactional emails' and 'may result in an Unsubscribe link being displayed by some email providers'. Replacing it with a list-help header 'is only available with an Enterprise plan, and under specific conditions' and requires contacting support. (https://help.brevo.com/hc/en-us/articles/19100260472850-FAQs-About-list-unsubscribe-and-list-help-headers-in-emails)
- [verified-live] TRANSACTIONAL BLOCKLISTING IS PER SENDER: 'By default, when a contact unsubscribes from your transactional emails, they are only blocked from the sender of this specific email... This way, if a contact unsubscribes from a transactional email, they may still receive important notifications such as order confirmations or password reset.' Campaign blocklisting and transactional blocklisting are separate channels. Hard bounces and spam complaints also blocklist. (https://help.brevo.com/hc/en-us/articles/209458705-FAQs-What-are-the-different-types-of-blocklisted-contacts)
- [verified-live] DOI endpoint POST /v3/contacts/doubleOptinConfirmation documents `email`, `includeListIds`, `redirectionUrl` and `templateId` as REQUIRED, with `attributes` and `excludeListIds` optional; success is documented as 201 Created ('DOI Contact created'), failure 400. Attributes 'must be present in your Brevo account'. (https://developers.brevo.com/reference/create-doi-contact)
- [verified-live] Rate limits, general (all accounts): POST /v3/smtp/email 3,600,000 requests/hour and 1,000 req/s; /v3/contacts endpoints 36,000 requests/hour and 10 req/s. Exceeding returns 429 with rate-limit headers. The 10 req/s contacts limit is far tighter than the transactional one. (https://developers.brevo.com/docs/api-limits)
- [verified-live] Documented API error `code` strings: invalid_parameter, missing_parameter, unauthorized, not_enough_credits, duplicate_parameter, duplicate_request, permission_denied, account_under_validation, document_not_found, out_of_range, method_not_allowed. 402 means 'Account requires activation or additional credits'; 403 'Insufficient permissions for this resource'. (https://developers.brevo.com/docs/how-it-works)
- [verified-live] A 'branded subdomain' replaces Brevo's tracking and return-path domains with your own (mailed-by/return-path brevosend.com -> mail.yourcompany.com; tracking links r.brevolinks.com -> r.mail.yourcompany.com; images img.brevolinks.com -> img.mail.yourcompany.com) and gives full SPF alignment. It is optional on a shared IP. It is 'part of the new domain setup flow, which is being gradually rolled out and is not yet available to all users' - no plan restriction is stated. (https://help.brevo.com/hc/en-us/articles/35946791638802-FAQs-About-branded-subdomains)
- [verified-live] In the new domain setup flow, a ROOT domain can only use individual DNS records; the 'Brevo-managed setup' (delegating two NS records to Brevo) requires a subdomain, 'because delegating DNS control at root domain level would affect your entire domain'. The flow can generate up to seven DNS records. (https://help.brevo.com/hc/en-us/articles/35337929909778-Set-up-your-domain-in-Brevo)
- [likely] DOI confirmation emails are sent as transactional emails and are recorded in the transactional logs, so they consume the same 300/day pool. The DOI confirmation link is valid for 30 days. (https://help.brevo.com/hc/en-us/articles/208733449-Double-opt-in-DOI-What-it-is-and-how-to-track-user-sign-ups)
# Switching sign-up on

The code is done. Everything below happens in a Brevo account and in Vercel, and only you
can do it.

**Since 2026-09-23 no form on the site posts to `/api/subscribe`.** Every email box (the footer,
the result page's "Save your result", /me/, /account/sign-up/) starts an account sign-up, and
the address joins the list through `/api/auth/list` once the password is set. The endpoint is
kept for the tests and for any future list-only use.

**Why Brevo.** The free plan holds up to 100,000 contacts and sends 300 emails a day, it
has an API and SMTP, and it costs nothing to start. (MailerLite still works in the code,
but that account belongs to your other business, so it is not used.)

**Why the account emails are recommended to go somewhere else.** Brevo rewrites every link
in every email it sends, through its own tracking address, and it keeps a record of the
links people opened. For a newsletter that is only a bit ugly. For the account emails it is
different, because the link in those is the one that lets somebody set a password, so that
record would be worth stealing and the Brevo key would be the thing that reads it. The
account instructions in `../account/README.md` therefore recommend Resend for those, and
say what to do if you would rather keep everything in Brevo. Either way the mailing list
below stays exactly as it is.

**Storing a contact and sending an email are two different jobs in Brevo.** Steps 1 to 3
are all the mailing list needs: addresses are stored, and no email is ever sent. The moment
you want Brevo to *send* something, whether that is a confirmation email (step 5) or the
account emails, section 4 has to be done first, and it has waiting in it.

## 1. Make the account and the list

1. Sign up at **brevo.com** and confirm the address. Free plan is enough.
2. **Contacts → Lists → Create a list.** Call it `Wiser Walk`. Open it and note the **id**
   (a number, shown in the list's URL and in the list settings).
3. **Contacts → Settings → Contact attributes → Add an attribute.** Add these, all of type
   *Text*, named exactly:

   | attribute | example | what it is for |
   |---|---|---|
   | `QUIZ` | `theology-compass` | which quiz the reader finished, so the right series goes out |
   | `RESULT_CODE` | `01VJSE` | rebuilds their link: `wiserwalk.com/r/{QUIZ}/{RESULT_CODE}/` |
   | `RESULT_HEADLINE` | `Monergist-leaning, sacramental-leaning` | their result in words, so a template need not decode anything |
   | `SOURCE` | `account` | where the address came from, so account sign-ups can be told apart from quiz sign-ups |

   Brevo ignores attributes it does not recognise, so a typo here means the emails have
   nothing to personalise with and nothing tells you.

## 2. Make an API key

**Your name (top right) → Settings → SMTP & API → API Keys & MCP → Generate a new API
key.** Copy it now; Brevo shows it once. It is a password: it goes in Vercel and nowhere
else, never in the repository.

Two things about keys that will otherwise bite you months from now:

- Brevo makes you **choose an expiry** when you create the key, from a week to a year, or
  no expiration. **Choose no expiration.** A key that expires takes sign-up down silently,
  weeks after you have forgotten you set it.
- **A key nobody has used for 90 days expires on its own.** Brevo emails a warning a week
  before. If sign-up worked for a long time and then stopped with nothing else changed,
  this is the first thing to check.

The same rules apply to SMTP keys, which are a separate thing from API keys and are only
needed if something is ever configured to send through Brevo's SMTP relay.

One Brevo key covers the whole account, and the site only has one place to put it. So if
you ever point the account emails at Brevo too, this same key becomes the one that carries
them, and `../account/README.md` explains why it then has to be guarded like your own
password and made for this site alone.

## 3. Put it in Vercel

**Project → Settings → Environment Variables.** Add these for **Production** and
**Preview**:

| name | required | value |
|---|---|---|
| `BREVO_API_KEY` | yes | the key from step 2 |
| `BREVO_LIST_ID` | yes | the list id from step 1 (a number) |
| `BREVO_DOI_TEMPLATE_ID` | no | see step 5 |
| `BREVO_DOI_REDIRECT` | no | where a confirmed reader lands. Default `https://wiserwalk.com/?sub=confirmed` |

Then **redeploy** (Deployments → the latest one → Redeploy). Environment variables are
read when the function starts, so nothing changes until a deploy happens.

## 4. Before Brevo can send anything

Skip this entirely if all you want is addresses on a list. Do it before step 5, and before
anything asks Brevo to send an account email.

1. **Ask Brevo to switch transactional sending on.** From inside your account, raise a
   support ticket saying you want **transactional email sending** activated, that the site
   is `wiserwalk.com`, and what it is for. A new account cannot send a single email until
   they answer, and it is a person answering, so start here. The symptom if you skip it is
   an email that is simply never delivered.
2. **Prove you own the domain.** **Settings → Senders, Domains, IPs → Domains → Add a
   domain**, enter `wiserwalk.com`, and **choose to authenticate it yourself**. Never the
   automatic option: it signs in to your DNS and offers to *replace* your existing DMARC
   record, which puts your email at risk.
3. **At SiteGround, Site Tools → Domain → DNS Zone Editor:**
   - **Add** the Brevo code record (type TXT) at the root. If the name field will not take
     what Brevo suggests, use `@`, the domain name, or leave it blank.
   - **Add** Brevo's DKIM record or records exactly as shown, either one TXT or two CNAME.
     They will not clash with the SiteGround one; they sit under different names.
   - **Edit**, never duplicate, the existing `_dmarc` record. Two of them break mail
     outright. Today it reads `v=DMARC1; p=none; aspf=r; adkim=r;` and Brevo wants a
     reporting address in it, so make it
     `v=DMARC1; p=none; rua=mailto:dmarc@wiserwalk.com; aspf=r; adkim=r;`. Keep `p=none`.
   - **Touch nothing else.** Not the MX records, not the SPF record starting `v=spf1`, not
     `default._domainkey`. Brevo does not need SPF or MX from you, so there is nothing to
     merge and nothing to risk.
   - Then press the button in Brevo that authenticates the domain. Up to 48 hours, usually
     much less.
4. **Add a sender.** **Settings → Senders, Domains, IPs → Senders → Add a sender.** Once
   the domain is authenticated, senders on it verify themselves. Use `hello@wiserwalk.com`
   for anything from the mailing list, and keep `account@wiserwalk.com` for account emails
   only. The reason is small and real: some email apps show an Unsubscribe button beside
   every email, and a person who presses it is blocked from that **sender**. Two senders
   means an unsubscribe from the newsletter can never stop somebody's sign-in email.

**If you send from a Gmail or other free address, Brevo replaces your From address with
one of its own** that no reader recognises. For anything a reader is meant to trust, that
is the same as not arriving.

Three things about the free plan worth knowing before you build anything on it:

- **300 emails a day, one pool.** Campaigns, confirmations and account emails all draw on
  the same 300. Past it, mail queues and eventually is not delivered at all.
- **Every link in every email is rewritten** through Brevo's own tracking address, and this
  cannot be switched off below their top plan.
- **Every email carries a "Sent with Brevo" stamp.**

## 5. Optional: ask people to confirm first (double opt-in)

This needs section 4 done, because it sends an email.

Without this, an address is added the moment someone types it and no email is sent. With
it, Brevo emails them a link and the address only joins the list when they click it. It
costs you a few sign-ups and buys you a list that nobody can fill with other people's
addresses, and inbox providers treat it better.

To switch it on: **Campaigns → Templates → New template**, build a short "confirm your
address" email containing Brevo's `{{ doubleoptin }}` confirmation link, save and
**activate** it, note its **id**, and set `BREVO_DOI_TEMPLATE_ID` to that id in Vercel.
Redeploy.

The site's copy works either way: it says the first email *may* ask you to confirm, and
never promises a confirmation mail that might not be sent.

Account sign-up never goes through this. Somebody who has just clicked a link in their own
email has already proved the address is theirs, and a second confirmation would be friction
for nothing.

## 6. Check it worked

**The easy way, no terminal.** Once step 3 is done and the site has been redeployed, open
**wiserwalk.com**, go to the sign-up box at the bottom of any page, and put in a real
address you can open with a `+` tag on it, like `you+test@gmail.com`. Then look in Brevo
under **Contacts**: it should be there within a few seconds, or the confirmation email
should arrive if you have done step 5. Delete the test contact afterwards.

**The other way, if you have a terminal open.** The same thing, with the answer as a
number:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://wiserwalk.com/api/subscribe \
  -H "content-type: application/json" \
  -d '{"email":"you+test@gmail.com"}'
```

`200` means it went through; the contact appears under Contacts within a few seconds (or
the confirmation email arrives, with double opt-in on). `503` means the key is not set on
that environment, or the deploy has not happened yet. `400` means the address itself was
refused. `401` usually means the key has expired (step 2). Delete the test contact
afterwards.

## What is actually sent

Only the address the reader typed, plus the quiz slug, the result code and the headline,
and only when they submit a form. The code is decoded through the engine before it is
forwarded, so an edited URL cannot write arbitrary text onto a contact. Quiz answers
themselves are never sent anywhere.

`/about` and `/method` describe this to the reader. If the offer changes, change those
too: quietly contradicting published copy is the one thing this site cannot afford.

## If you ever go back to MailerLite

The MailerLite provider is still in `provider.ts` and still works. Remove `BREVO_API_KEY`
from Vercel and set `MAILERLITE_API_KEY` (and optionally `MAILERLITE_GROUP_ID`) instead,
then redeploy. Its custom fields are lowercase (`quiz`, `result_code`, `result_headline`)
and have to exist in that account. Brevo wins whenever both keys are set.

`EMAIL_PREVIEW=1` in a local `.env` runs a console provider that subscribes nobody, for
working on the forms. It does the same to the account emails: nothing is sent, the log
prints what would have gone, and `/account/setup/` says email is in preview mode. Never set
it in Vercel.

# Switching sign-up on

The code is done. Everything below happens in a Brevo account and in Vercel, and only you
can do it. Until it is done, `/api/subscribe` answers 503 in production and the two sign-up
forms collect nothing.

**Why Brevo.** The free plan holds an unlimited number of contacts and sends 300 emails a
day, it has an API and SMTP, and the same account can later send the sign-in and account
emails. Nothing has to move when accounts arrive. (MailerLite still works in the code, but
that account belongs to your other business, so it is not used.)

## 1. Make the account and the list

1. Sign up at **brevo.com** and confirm the address. Free plan is enough.
2. **Contacts → Lists → Create a list.** Call it `Wiser Walk`. Open it and note the **id**
   (a number, shown in the list's URL and in the list settings).
3. **Contacts → Settings → Contact attributes → Add an attribute.** Add three, all of type
   *Text*, named exactly:

   | attribute | example | what it is for |
   |---|---|---|
   | `QUIZ` | `theology-compass` | which quiz the reader finished, so the right series goes out |
   | `RESULT_CODE` | `01VJSE` | rebuilds their link: `wiserwalk.com/r/{QUIZ}/{RESULT_CODE}/` |
   | `RESULT_HEADLINE` | `Monergist-leaning, sacramental-leaning` | their result in words, so a template need not decode anything |

   Brevo ignores attributes it does not recognise, so a typo here means the emails have
   nothing to personalise with and nothing tells you.

## 2. Make an API key

**Your name (top right) → SMTP & API → API keys → Generate a new API key.** Copy it now;
Brevo shows it once. It is a password: it goes in Vercel and nowhere else, never in the
repository.

## 3. Put it in Vercel

**Project → Settings → Environment Variables.** Add these for **Production** and
**Preview**:

| name | required | value |
|---|---|---|
| `BREVO_API_KEY` | yes | the key from step 2 |
| `BREVO_LIST_ID` | yes | the list id from step 1 (a number) |
| `BREVO_DOI_TEMPLATE_ID` | no | see step 4 |
| `BREVO_DOI_REDIRECT` | no | where a confirmed reader lands. Default `https://wiserwalk.com/?sub=confirmed` |

Then **redeploy** (Deployments → the latest one → Redeploy). Environment variables are
read when the function starts, so nothing changes until a deploy happens.

## 4. Optional: ask people to confirm first (double opt-in)

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

## 5. Check it worked

Use a real address you can open, and a `+` tag so it is easy to delete afterwards:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://wiserwalk.com/api/subscribe \
  -H "content-type: application/json" \
  -d '{"email":"you+test@example.com"}'
```

`200` means it went through; the contact appears under Contacts within a few seconds (or
the confirmation email arrives, with double opt-in on). `503` means the key is not set on
that environment, or the deploy has not happened yet. `400` means the address itself was
refused. Delete the test contact afterwards.

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
working on the forms.

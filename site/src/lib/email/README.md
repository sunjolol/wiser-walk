# Email capture — what has to be true before this works

The code is done; three things live in your MailerLite account and one in Vercel.

## 1. Vercel environment variables

Set these on the project (Settings → Environment Variables), for Production **and** Preview:

| name | required | what it is |
|---|---|---|
| `MAILERLITE_API_KEY` | yes | An API token from MailerLite → Integrations → API. |
| `MAILERLITE_GROUP_ID` | no | The numeric id of the group new subscribers join. Omit and they land ungrouped. |

With no key set, `/api/subscribe` uses a console provider that logs and **does not subscribe
anyone**. In production that path returns `503` and the form says sign-up is not switched on,
rather than accepting an address and dropping it.

## 2. Custom fields in MailerLite

Create these three fields (Subscribers → Fields), type *text*, with exactly these names.
MailerLite silently ignores fields it does not recognise, so a typo here means the follow-up
series has nothing to personalise with and nobody finds out.

| field | example | why the series needs it |
|---|---|---|
| `quiz` | `theology-compass` | Which series to send. |
| `result_code` | `01VJSE` | Rebuilds the reader's result link: `wiserwalk.com/r/{quiz}/{result_code}/` |
| `result_headline` | `Monergist-leaning, sacramental-leaning` | The plain-language result, so a template need not decode anything. |

## 3. Double opt-in must be ON

Enable it under MailerLite → Settings → Subscribe settings. The form on the result page tells
the reader to expect a confirmation email. If double opt-in is off, that sentence is false and
must be changed before deploying — see `site/src/components/EmailCapture.astro`.

## 4. Check API access is available on your plan

MailerLite has gated API access by plan and by account approval in the past. Send one test
request after setting the key:

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://connect.mailerlite.com/api/subscribers -H "authorization: Bearer $MAILERLITE_API_KEY" -H "content-type: application/json" -d '{"email":"you+test@example.com"}'
```

`201` is a new subscriber, `200` an existing one. `401`/`403` means the token or the plan is
the problem, not the code.

## What is actually sent

Only the address the reader typed, plus the quiz slug, the result code and the headline —
and only when they submit the form. The code is validated by decoding it through the engine
before it is forwarded, so an edited URL cannot write arbitrary text into a subscriber field.
Quiz answers themselves are never sent anywhere by anything.

`/about` and `/method` describe this to the reader. If the offer changes, change those too —
they used to promise there was no email list, and quietly contradicting published copy is the
one thing this site cannot afford.

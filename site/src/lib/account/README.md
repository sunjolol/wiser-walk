# Switching accounts on

The code for accounts is done. Everything below happens in other people's websites and in
Vercel, and only you can do it. Until it is done, every account page says sign-in is not
switched on yet and the rest of the site is exactly as it is today. **Nothing on the public
site links to an account page until you have tested it yourself and said go.** There are
**fifteen steps**, or seventeen if you choose Brevo at the start, and two optional extras
at the end that can wait as long as you like.

Two things to know before you begin.

- The account code is already on the live site. Nothing links to it and nothing changes
  until the keys below are set, so it is safe for it to sit there while you work through
  this.
- Do the steps in order. They are ordered so that the parts with waiting in them are
  started first.

## How this goes live, in four moves

Worth reading now, because it explains why the steps are safe to do in daylight on the real
site.

1. **The code ships switched off.** It is on wiserwalk.com already. Nothing links to it, so
   no visitor lands on an account page by accident and no visitor sees anything new.
2. **You test it on the real site, at addresses nobody else is given.** The pages are all
   there: `wiserwalk.com/account/sign-up/`, `/account/sign-in/` and `/account/`. It has to
   be the real site rather than a test build, because Supabase can only reach the real site
   to send your email. Once you are signed in, **your own `/me/` becomes the signed-in
   version**: your results save to the account, the page says when they last saved, and you
   can clear them everywhere from there. That is you only. Every other visitor sees the
   site exactly as it is today.
3. **You can look at what visitors will get, before they get it.** Vercel builds a preview
   copy of any branch that is not the live one, and on a preview the doors are open: the
   header offers to sign in, `/me/` invites you to keep your results, and the result page
   offers to keep it on every device. Only somebody logged in to Vercel can open a preview,
   so it is still nobody but you. Sign-up itself will not work there, for the reason in
   move 2, so look rather than test. If there is no preview to hand when you want one, ask
   me and I will push a branch so Vercel builds one.
4. **You say go.** One line in the code changes, the site deploys, and the doors appear for
   everybody: the header mark, the invitation on `/me/`, the button on a result page.

## The one choice to make first: who sends the account emails

These are the emails carrying the link to set a password, and the "I forgot my password"
email. They have to arrive, and they have to look like they came from you.

**Recommended: Resend.** Free for 3,000 emails a month and 100 a day, across up to three
domains. It leaves the links in your emails alone, and it puts nothing of its own at the
bottom of the email. The cost is a new account and a domain to prove you own, which is
four steps. (Those figures were read off resend.com/pricing on 21 September 2026. Their own
advice is to send from a subdomain, and their tracking of opens and clicks is a setting you
leave switched off.)

**The other way: Brevo, which you already have.** One less account to hold, and one less
company with a key to anything of yours. But it takes six steps instead of four, and four
of them are real costs:

- Brevo will not send anything until their support switch transactional sending on for
  your account. That is a ticket and a person answering it, so it is unpredictable.
- On the free plan Brevo **rewrites every link** in the email through its own tracking
  address. A "set your password" link that points at a long address nobody recognises is
  the exact look you do not want on a security email, and it cannot be turned off below
  their top plan.
- **Brevo also keeps a record of the links people opened**, and the link in these emails is
  the one that lets somebody set a password on an account. So that record sits in Brevo,
  and for the hour each link is good, anybody holding the Brevo key could read one out of
  it and walk into that person's account before they ever got there themselves. The
  site uses one Brevo key for both jobs, so that single key stops being a mailing-list key
  and becomes a key to people's accounts: it belongs in Vercel and nowhere else, never in a
  support ticket, never in a screenshot, never pasted into another tool. **If you choose
  Brevo, make a key for this site and nothing else** (B6 below). Resend does not rewrite
  the links, so none of this arises there.
- On the free plan every email also carries a "Sent with Brevo" stamp.

Either way, the mailing list side of Brevo stays exactly as it is. Accounts do not change
how the newsletter works.

**If you pick Resend, do steps 1 to 4. If you pick Brevo, do B1 to B6 instead, then carry
on at step 5.**

---

# The steps

## 1. Make a Resend account

Go to **resend.com** and sign up. The free plan is the one you want.

*Done when:* you are looking at the Resend dashboard.

## 2. Add the domain

In Resend's left-hand menu open **Domains**, then add a domain. Resend will recommend
sending from a subdomain rather than the bare `wiserwalk.com`, something on the pattern of
`send.wiserwalk.com`. Take its recommendation and **copy the exact name the screen shows
you**. Write that name down; you need it again in step 12.

It then shows you a short list of DNS records. Leave that page open.

Every record on that list is a **new** record. None of them replaces anything you already
have at SiteGround.

*Done when:* the domain is listed, marked as not verified yet, with a table of DNS records
on screen.

## 3. Add those records at SiteGround

SiteGround, Site Tools for **wiserwalk.com**, then **Domain → DNS Zone Editor**, the same
place you last changed DNS.

For each row Resend shows you, add a new record of that type, with the name and the value
**copied exactly from the Resend screen**. Do not type them from memory. Do not add or
remove a full stop at the end unless the value has one.

**Change nothing that is already there.** In particular, leave alone:

| leave alone | what it is |
|---|---|
| the `MX` records | your SiteGround email. Delete these and your email dies. |
| the TXT record starting `v=spf1` | also SiteGround email. |
| `default._domainkey` | also SiteGround email. |
| `_dmarc` | Resend does not need this changed. |

If Resend's list includes a record of a type you already have at the root, an `MX` or a
`TXT`, that is normal and it is not a clash: its name will be the subdomain from step 2,
which is a different name from `wiserwalk.com` itself. Add it as a new row and leave the
ones at the root exactly as they are.

Then go back to Resend and press the button that checks the records. It usually takes a few
minutes. If it says the records are not there yet, wait ten minutes and press it again
before assuming anything is wrong.

*Done when:* Resend shows the domain as verified.

## 4. Make an API key

In Resend's left-hand menu open **API Keys** and create one. Name it `wiserwalk`.

**Copy the key now.** It is shown once and never again. It is a password: it goes into
Vercel in step 12 and nowhere else. Never into the repository, never into an email, never
into a screenshot.

*Done when:* you have the key saved somewhere safe. Now go to step 5.

---

### If you chose Brevo instead, these six steps replace steps 1 to 4

**B1. Ask Brevo to switch transactional sending on.** From inside your Brevo account, open
their help or support and raise a ticket. Say that you want **transactional email sending**
activated, that the site is `wiserwalk.com`, and that it is for account sign-in emails. Do
this first: it is the only step with a person on the other end, and nothing else works
until they answer. *Done when:* they reply to say it is on.

**B2. Add the domain.** **Settings → Senders, Domains, IPs → Domains → Add a domain.**
Enter `wiserwalk.com`. When it offers to do it automatically or for you to do it yourself,
**choose to do it yourself**. Never the automatic option: it signs in to your DNS and
offers to *replace* your existing DMARC record, which would put your email at risk. Copy
the values it shows you. *Done when:* the domain is listed as not authenticated yet, with
its records on screen.

**B3. Put those records at SiteGround.** Site Tools for wiserwalk.com, **Domain → DNS Zone
Editor**.

- **Add** the Brevo code record, type TXT, at the root of the domain. If the name field
  will not take what Brevo suggests, use `@`, or the domain name, or leave it blank.
- **Add** Brevo's DKIM record or records exactly as shown. It will be either one TXT record
  or two CNAME records; do whichever the screen shows you. It will not clash with the
  SiteGround one, because they sit under different names.
- **Edit**, do not duplicate, the existing `_dmarc` record. Two of those records break mail
  outright. Today it reads:

  ```
  v=DMARC1; p=none; aspf=r; adkim=r;
  ```

  Change it to:

  ```
  v=DMARC1; p=none; rua=mailto:dmarc@wiserwalk.com; aspf=r; adkim=r;
  ```

  If what is actually there differs from the first line, add the `rua=` part to what is
  there and change nothing else. Keep `p=none`.
- **Touch nothing else.** Not the MX records, not the SPF record starting `v=spf1`, not
  `default._domainkey`. Brevo does not need SPF or MX from you.

*Done when:* the new records are saved and the old ones are untouched.

**B4. Tell Brevo to check.** Back on the Domains page, press the button that authenticates
the domain. It can take up to 48 hours, though it is usually much faster. *Done when:* the
domain shows as authenticated.

**B5. Add the sender.** **Settings → Senders, Domains, IPs → Senders → Add a sender.**
Name `Wiser Walk`, address `account@wiserwalk.com`. Keep it separate from whatever sends
the newsletter. The reason is small and real: some email apps show an Unsubscribe button
beside every email Brevo sends, a password email included, and a person who presses it is
blocked from that *sender*. Two senders means an unsubscribe from the newsletter can never
stop somebody's sign-in email, and the other way round. *Done when:* the sender is listed as
verified, which happens by itself once the domain is authenticated.

**B6. Make a key for this site and nothing else.** **Settings → SMTP & API → API Keys &
MCP → Generate a new API key.** Name it `wiserwalk`, choose **no expiration**, copy it, and
put it in Vercel as `BREVO_API_KEY` in step 12, replacing whatever is there. Use it for
this site only: not in another tool, not in a script, not pasted anywhere to show somebody
a problem. That is because of the link record above, which turns this key into something
that can reach people's accounts.

Two things about Brevo keys that will otherwise bite you months from now: they can be given
an expiry date, and a key that has not been used for 90 days expires on its own. Both take
sign-in down quietly, long after you have forgotten you set it.

*Done when:* the key in Vercel is a fresh one with no expiry, made for this site.

Then carry on at step 5. There is no second name to add in Vercel for Brevo: the one
`BREVO_API_KEY` carries the mailing list and the account emails together, which is exactly
why B6 asks for a key made for this site alone.

---

## 5. Make the Supabase project

Go to **supabase.com**, sign in (or sign up, if you have never used it), and make a
**New project**. Signing in with GitHub is the quickest way, and it is the same account
the site's code already lives in.

- Name: `wiser-walk`.
- Region: the one nearest most of your readers.
- It asks for a **database password**. Let it generate one and **write it down somewhere
  safe**. It is shown once, and it is not something the site uses day to day, but you will
  want it one day.
- Free plan.

The free plan allows two projects running at once. If you already have two, this will not
start until one is paused.

It takes a couple of minutes to build.

*Done when:* the project's own dashboard opens and has stopped saying it is setting up.

## 6. Copy the three values

**Settings → API Keys**, then the tab called **Publishable and secret API keys**.

Copy three things into a note:

| what | looks like | who may see it |
|---|---|---|
| the **Project URL** | `https://something.supabase.co` | anyone. It is in the page source. |
| the **publishable** key | starts `sb_publishable_` | anyone. Same. |
| the **secret** key | starts `sb_secret_` | **you only.** It is a password. |

The Project URL is shown in the project's settings; copy the value the screen shows you.
If the screen also lists older keys called `anon` and `service_role`, ignore them, and do
not press anything that disables them.

*Done when:* you have three values in a note.

## 7. Make the tables

In the project's left-hand menu, **SQL Editor**, then **New query**.

The thing to paste is the file called `schema.sql`, which sits in the same folder as these
instructions: `site/src/lib/account/schema.sql` in the site's code, on your computer or on
GitHub, whichever is easier to open. Copy the whole file, paste it into the query box, and
press **Run**. It is safe to run twice: running it again changes nothing.

*Done when:* it reports success, and **Table Editor** lists `profiles`, `results`,
`game_stats` and `auth_email_log`.

## 8. Set the password rules

**Authentication → Sign In / Providers → Email.**

- Set **Minimum password length** to **8**. The default is 6, which is too short. The site
  asks for 8 of its own accord, so this makes the two agree rather than leaving Supabase
  willing to accept something the site would have turned away.
- If that screen has a switch about **confirming the email address**, leave it on. It is on
  by default, so most likely there is nothing to do.
- Save.

*Done when:* the page still shows 8 after you reload it.

## 9. Look at the email limit

**Authentication → Rate Limits.**

Find the limit for **emails sent per hour**. If you can change it, set it to **30** and
save. The starting value is **two an hour**, which one good day would quietly exhaust with
nothing to tell you and nothing to tell the person waiting for a link.

**If the field is locked**, leave it and carry on. As far as Supabase documents it, the
thing that unlocks that field is filling in their own SMTP settings, which this site
deliberately does not use: the site writes and sends the emails itself (step 10). Filling
those settings in later would unlock the field and change nothing else, and the
troubleshooting section at the bottom says how.

**Being straight with you: nobody knows whether this limit applies at all while the site is
sending the emails.** Supabase documents the two-an-hour figure for its own sending, and
this site is not using its sending. It might be counted, it might be ignored. Step 15 has a
test that answers it in five minutes, and it is worth doing.

*Done when:* the page shows 30 after a reload, or you know the field is locked and have
made a note that only two emails an hour may go out until the test in step 15 says
otherwise.

## 10. Point Supabase's emails at the site

**Authentication → Hooks → Send Email hook → Enable.** Choose the HTTPS option if it asks.

- URL: `https://wiserwalk.com/api/auth/email`
- Press the button that generates a secret, and **copy the whole thing**, including the
  `v1,whsec_` at the front.
- Save.

This is what makes the site write the emails instead of Supabase. It is why the wording is
in the repository and not in a form somewhere.

*Done when:* the hook is listed as enabled with that URL against it.

## 11. Set the Site URL

**Authentication → URL Configuration.**

Set **Site URL** to `https://wiserwalk.com`. Leave the **Redirect URLs** list alone; this
site does not use it.

*Done when:* the Site URL reads exactly that, with no slash on the end and no `www`.

## 12. Put the values into Vercel

**Vercel → the wiser walk project → Settings → Environment Variables.**

Add each one below, and tick **Production and Preview both**. Preview matters for two
reasons: a preview build without these values has dead sign-in and looks like broken code,
and the preview is where you look at what visitors will see (move 3 at the top).

| name | value |
|---|---|
| `PUBLIC_SUPABASE_URL` | the Project URL from step 6 |
| `PUBLIC_SUPABASE_KEY` | the **publishable** key from step 6 |
| `SUPABASE_SECRET_KEY` | the **secret** key from step 6 |
| `SUPABASE_EMAIL_HOOK_SECRET` | the secret from step 10, in full, including `v1,whsec_` |
| `RESEND_API_KEY` | the key from step 4. **Resend only.** Leave it out entirely if you chose Brevo. |

Already there, and reused exactly as they are: `BREVO_API_KEY` and `BREVO_LIST_ID`, which
are the mailing list.

**One more if you used Resend and verified a subdomain.** The address the email comes from
has to be at the domain you verified. Add:

| name | value |
|---|---|
| `ACCOUNT_EMAIL_FROM` | `Wiser Walk <account@send.wiserwalk.com>` |

with `send.wiserwalk.com` replaced by the exact subdomain from step 2. If you verified the
bare `wiserwalk.com`, or you chose Brevo, leave this out: the site already uses
`Wiser Walk <account@wiserwalk.com>`.

*Done when:* every name above is listed with both Production and Preview beside it.

## 13. Redeploy

**Vercel → Deployments → the most recent one → Redeploy.**

Do this before you look at anything, and do it again after any change in Vercel. Nothing
you pasted reaches the pages, or the site's own checks, until a new build has happened,
however carefully you pasted it. Until then the site is still running on the build from
before, which had none of these values.

*Done when:* the deploy finishes and says Ready.

## 14. Read the setup page

Open **https://wiserwalk.com/account/setup/**. Nothing on the site links to it.

It runs eight checks on the parts a page can see: the two website values, the secret key
and the hook secret; whether the site was rebuilt after you set them; whether your Supabase
project answers; whether the tables are there; whether the sending account takes our key
(and, on Brevo, whether the address we send from is verified); and whether Supabase has
ever asked us to send an email.

It cannot see the rest, so those are on you to have done: the DNS records, whether Resend
has finished verifying your domain, the Site URL, the minimum password length, the email
limit, and whether the Send Email hook is switched on. The first real sign-up in step 15 is
what proves those, which is why it is the last step rather than a formality.

**Do not go on until every line says it is fine**, with one exception. The line called
**Emails Supabase has asked for** cannot pass yet, because nothing has asked for one: it
turns green during step 15 and not before. Every other line should be clean here.

Nothing is live yet, so nothing is broken while you fix things. If a line tells you to
change something, change it, press **Redeploy** again, and reload this page.

*Done when:* the only line left is the one about emails Supabase has asked for.

## 15. The first real test, with your own address

Open **https://wiserwalk.com/account/sign-up/**. Nothing links to it, so nobody else will
find it. It has to be the live site and not a preview, because Supabase cannot reach a
preview build.

1. Type an address you can open.
2. The email should arrive within a minute. If it does not, look in spam.
3. The link takes you to a page where you choose a password.
4. You land on `/me/`, it says your results are saved to your account, and anything you
   have taken on that device is listed.
5. Sign out, then sign in again at `https://wiserwalk.com/account/sign-in/` with that email
   and that password.
6. Press **Forgotten your password?** on the sign-in page and set a new one that way as
   well.
7. **The three-address test, which settles step 9.** In one sitting, sign up with three
   different addresses, one after the other. Most email providers let you make extra
   addresses by adding a plus sign and a word before the `@`, so `you+one@`, `you+two@` and
   `you+three@` all land in the same inbox. Wait a minute or two, then count what arrived.
   If the first ones came and a later one did not, the emails-per-hour limit in step 9 is
   the reason and it does apply: go back and raise it, or fill in SMTP Settings so that you
   can. If all three arrive, it does not apply to us and there is nothing more to do. (You
   have already sent yourself two emails in items 1 and 6, so if that was within this same
   hour, it is really the fourth and fifth emails you are testing. That is fine: what you
   are looking for is the point where they stop.)
8. Go back to **https://wiserwalk.com/account/setup/** and check the line about emails
   Supabase has asked for. It should now say one went out.

*Done when:* all eight work. Then tell me, and the doors go on: the header mark, `/me/` and
the result page start pointing at these pages. That is one line of code and a deploy,
and until you say so it stays off.

---

# Two optional extras

Neither is needed for any of the above to work, and neither is worth holding the launch
for.

**Optional, one minute, any time.** In Brevo, **Contacts → Settings → Contact attributes →
Add an attribute**, type *Text*, named exactly `SOURCE`. It marks which sign-ups came from
an account rather than from a quiz result, so you can mail them differently later.
Everything works without it; Brevo simply ignores what it does not recognise.

**Optional, one minute, in Vercel.** Add an environment variable called `CRON_SECRET`, for
Production and Preview, with any long line of letters and numbers as its value, then
redeploy. Once a day Vercel calls the site to ask the database one small question, which is
what stops a quiet week putting your free Supabase project to sleep. Setting `CRON_SECRET`
means only Vercel's own daily call is answered and a stranger cannot set that call off by
hand. Vercel sends the value for you; there is nothing else to do with it, and nothing
breaks if you never set it.

---

# If something goes wrong

## Start at the setup page

**https://wiserwalk.com/account/setup/** runs its eight checks every time you load it, and
names what to go and do. Remember what it cannot see (step 14): the DNS records, the domain
verification, the Site URL, the password length, the email limit and whether the hook is
switched on. Go there before anything else, but if every line is clean and emails still are
not arriving, the answer is in that list rather than on the page.

## The emails are not arriving

1. Look in spam, and give it two minutes.
2. Read `/account/setup/`. It says whether the sending account refused us, and why.
3. Look at the sending account's own log of emails sent. Resend and Brevo both keep one.
   If the email is listed as sent, the problem is delivery and not the site.
4. If it is still dead, **hand the emails back to Supabase**. This takes about fifteen
   minutes and changes no code.

   - **Authentication → Hooks**, and turn the Send Email hook **off**.
   - **Authentication → Emails → Templates.** Three templates matter: **Confirm sign up**,
     **Magic link** (it may be called Magic Link or OTP) and **Reset password**. In each
     one, replace the whole body with this single line:

     ```html
     <a href="{{ .SiteURL }}/account/password/?t={{ .TokenHash }}&k=signup">Choose a password</a>
     ```

     changing only the `k=` part:

     | template | the `k=` value |
     |---|---|
     | Confirm sign up | `k=signup` |
     | Magic link | `k=magiclink` |
     | Reset password | `k=recovery` |

     That produces exactly the same link the site sends today, so the page it lands on
     needs no change.
   - Supabase will now send those emails itself, but **its own sender only delivers to
     addresses on your project team, and only two an hour**. That is enough to prove the
     flow works for you. It is not enough for readers.
   - For readers, fill in **Authentication → Emails → SMTP Settings** with the sending
     account's SMTP details. Copy the values that account's own SMTP screen shows you. For
     Brevo the password there is an **SMTP key**, which is a different thing from the API
     key, and the username is usually not your account email.
   - Then look at **Authentication → Rate Limits** again. Switching SMTP on sets the
     emails-per-hour limit to 30, and unlocks the field if it was locked in step 9, so this
     is the moment to raise it.

## The Supabase project is paused

A free project is paused after about a week of very little use, and a paused project
answers everything with an error. Sign-up, sign-in and password resets all stop at the same
moment, for everybody, including people who already have accounts. Results already saved on
somebody's own device still show; nothing is lost.

- **To wake it up:** supabase.com, your organisation, the project, then **Resume project**,
  and confirm. It takes a few minutes. You have a year to do this before the data goes.
- **The site already tries to prevent it.** Once a day Vercel calls the site and the site
  asks the database one small question, which counts as use. It runs by itself and there is
  nothing you have to set up, though `CRON_SECRET` above is worth the minute it takes.
- **Honestly:** Supabase's own wording is "a few requests a day over the previous week",
  and one a day sits at the bottom of that. It is not a guarantee. The only guarantee is
  their paid plan at about $25 a month, which is never paused. If accounts matter and the
  project pauses more than once, that is the answer, and it is a fair price for the thing
  not breaking.

## A key stopped working

The sign is always the same: emails stop, and `/account/setup/` says the sending account
refused us.

- Brevo keys expire. You pick an expiry when you make one, and a key nobody has used for 90
  days expires on its own. This is the first thing to check when something worked for weeks
  and then did not.
- The fix is the same everywhere: make a new key on that account's keys screen, paste it
  into Vercel over the old value for **both** Production and Preview, and redeploy.
- The same steps apply if you ever change the Supabase keys.

## Switching the whole thing off

**Vercel → Settings → Environment Variables.** Remove `PUBLIC_SUPABASE_URL` and
`PUBLIC_SUPABASE_KEY` from Production and Preview, then redeploy.

Every account page then shows one calm line saying sign-in is not switched on yet, and the
rest of the site is exactly as it is today. Nobody is deleted and nothing is lost. Put the
two values back, redeploy, and it is on again.

---

# What is kept about a person

This is the honest list, and it is also what `/method/` has to say.

**Kept, once somebody makes an account:**

- Their email address.
- Their password, scrambled by Supabase in a way nobody can read back. Not you, not me.
- For each quiz they finish: the quiz's name, the short result code that is already in
  their result link, and the date they finished.
- Their best score in each game, and which canon they chose in Sounds Like Scripture.
- The date the account was made, the date they set a password, and whether they want the
  occasional note about new quizzes.
- If they are on the mailing list: their address, and the quiz and result they signed up
  from.
- When they clear a result, a marker saying which quiz, which code and when. That is how
  their other devices know to drop it too. It is erased after ninety days, or when they
  close the account, whichever comes first.

**Not kept:**

- Their answers. Quizzes are still worked out in the browser, and the answers never leave
  it. The result code carries the scores and nothing else.
- Their name. The site never asks for one.
- Anything about which pages they read. The visit counter has no account attached to it and
  never sees an address.
- Who was sent which email. The site keeps a short note that Supabase asked it to send one,
  with no address in it, and throws that away after sixty days.

**And one button on `/account/` deletes all of it**: the account, the results, the markers,
the game scores on our side and on that device, and the mailing contact. Not a form, not an
email to you, not a wait. The one part that can lag is the mailing contact, if the mailing
service happens to be down at that second; when that happens the page says so plainly and
points at the unsubscribe link in any email from us, which does the same job.

---

# Adding Google later

Nothing needs doing now, and nothing above blocks it.

Everybody who has an account got in by clicking a link in their own email, so their address
is already proven. Supabase joins a Google sign-in to the account that already exists when
the address matches and is proven, rather than quietly making a second account. That is the
part that usually goes wrong elsewhere, and it is handled by how sign-up works here.

When you want it:

1. Make a web OAuth client in Google Cloud. The allowed origin is `https://wiserwalk.com`
   and the redirect address is the one Supabase's Google page prints for your project;
   copy the value that screen shows you.
2. Paste the client id and the client secret into **Authentication → Sign In / Providers →
   Google** and enable it.
3. Add `https://wiserwalk.com/account/**` to **Authentication → URL Configuration →
   Redirect URLs**. This is the one time that list matters.

The sign-in page already has the space for the button, so this is a dashboard job and a
small change on our side.

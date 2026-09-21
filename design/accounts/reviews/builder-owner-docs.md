# owner-docs

## files
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/account/README.md
- C:/Users/Light/Desktop/claude/theology compass/site/src/lib/email/README.md

## needs
- site/src/lib/account/schema.sql (lib builder): step 7 tells the owner the run worked when Table Editor lists exactly profiles, results, game_stats and auth_email_log. If the schema names a table differently, or adds a fifth the owner should see, tell me and I will change the line. It must also be safe to run twice, which the README promises out loud.
- site/src/pages/account/setup.astro and site/src/lib/account/checks.ts (setup-page builder): the README sends the owner to /account/setup/ before the redeploy and again for every failure. It needs (a) one line per numbered step using THIS README's numbers (1 to 15, and B1 to B6 for the Brevo sender path), (b) an explicit line for the build-versus-runtime mismatch worded as 'the site has not been rebuilt with these keys yet', because step 13 tells him that is the one complaint he may go on with, and (c) a line that says plainly when the sending account refused our key, since 'a key that expired' in the trouble section depends on it.
- site/src/lib/email/send.ts (lib builder): the README tells a Resend user who verified a SUBDOMAIN (Resend recommends one) to set ACCOUNT_EMAIL_FROM to an address at that subdomain, e.g. Wiser Walk <account@send.wiserwalk.com>. Please make sure the From parser handles that and that nothing hard-codes account@wiserwalk.com past the default.
- site/src/lib/email/provider.ts and site/src/pages/api/auth/list.ts (list builder): I documented the Brevo Text attribute SOURCE in both READMEs (optional, unnumbered, because Brevo ignores attributes it does not know). Keep the attribute name exactly SOURCE and the account value exactly 'account', or the docs and the code drift.
- site/src/pages/account/index.astro (page builder): the 'What is kept about a person' section states that one button on /account/ deletes the account, the results, the game scores AND the Brevo contact, with no form and no waiting. If deletion does not remove the mailing contact, that line has to change.
- site/src/pages/method.astro (whoever rewrites it): section 4 of site/src/lib/account/README.md is written to be the source for the /method/ rewrite. Use it rather than writing a second, slightly different list.
- site/vercel.json (lib builder): the trouble section tells the owner the site asks the database one small question a day by itself, with nothing for him to set up. That is the daily cron at /api/auth/health?ping=1; if it does not ship, the paused-project section overpromises.

## tests
- none. Both files are documentation; nothing was built, run or deployed. I ran only greps over my own output to check for em dashes (0), the word 'faith' (0) and the env names against brief item 8.

## notes
WHAT I WROTE

site/src/lib/account/README.md, in the voice of email/README.md. Count stated at the top: FIFTEEN steps with Resend, seventeen with Brevo. Order minimises waiting: the sender (which has DNS propagation, and with Brevo a support ticket behind it) first, then Supabase, then Vercel, then the setup page, then the redeploy, then the first real test. Every step names a screen path, the exact value, and ends with an italic 'Done when:' line. The sender choice is a short block before step 1 with a plain recommendation (Resend) and both paths fully written: Resend as steps 1 to 4, Brevo as B1 to B6 which replace them, then everything rejoins at step 5. Brevo's three real costs are named where he will read them: the activation ticket with a human behind it, link rewriting that cannot be switched off, and the 'Sent with Brevo' stamp. The 'nothing links to these pages until you have tested and said go' promise is in the opening five lines and again in step 15.

Sections 3, 4 and 5 are as asked: trouble (setup page first, emails not arriving with the SMTP fallback and the one template line, the paused project, an expired key, switching the whole feature off by removing the two PUBLIC_ values and redeploying), what is kept about a person in plain words with a 'not kept' list, and Google later.

site/src/lib/email/README.md: fixed the four things the Brevo research found. API-key path corrected to Settings > SMTP & API > API Keys & MCP; the forced expiry choice ('choose no expiration') and the 90-day inactive-key rule added, with 401 named as its symptom in the check step; a new section 4, 'Before Brevo can send anything', holding the activation ticket, manual domain authentication, the ADD-only DNS rules (never the automatic option, never a second _dmarc, never touch SPF or MX), and the dedicated sender; SOURCE added to the attributes table. Old step 4 became 5 and now says it needs section 4 first, old step 5 became 6. The intro now states that storing a contact and sending an email are different jobs, and points at ../account/README.md.

DECISIONS I TOOK

- Two numbering schemes rather than one, because a single list with a branch in it is exactly the kind of thing he cannot follow. Steps 1 to 4 are Resend; B1 to B6 are the Brevo replacement; 5 to 15 are common.
- The ACCOUNT_LINKS_LIVE flip is NOT a numbered owner step. It is a code change and a deploy, so step 15 ends with 'tell me and the doors go on'.
- Adding the Brevo SOURCE attribute is unnumbered and marked optional, so it does not inflate the count. Brevo ignores unknown attributes, so nothing breaks without it.
- I wrote a precondition at the top that the account code is already live on wiserwalk.com and links to nothing, because steps 13 and 15 are impossible otherwise and nothing in the brief said this to him.
- Step 15 says the test must happen on wiserwalk.com and not a preview, since Supabase cannot reach a preview build.

UNVERIFIED, AND WHERE I HEDGED INSTEAD OF INVENTING

- RESEND IS NOT IN ANY RESEARCH SHEET. Its numbers in my step text (3,000 a month, 100 a day, up to three domains, links not rewritten, nothing stamped, subdomain recommended) come from the task text I was given, not from anything I verified. Its screens I kept to sidebar level ('Domains', 'API Keys') and every value is 'copy the exact name the screen shows you'. I did not claim a key prefix, a record type or a DNS value. If anyone can web-verify the free-plan figures before this ships, that is worth doing: they are the whole reason the recommendation goes that way.
- The SiteGround path 'Site Tools > Domain > DNS Zone Editor' is not in the research either. I wrote it with 'the same place you last changed DNS' beside it.
- The live _dmarc value I print is the research sheet's dns.google check from 2026-09-21. I tell him to add the rua= part to whatever is actually there if it differs.
- Supabase field labels I softened where the research only gave a screen: 'find the limit for emails sent per hour', 'choose the HTTPS option if it asks', and the Project URL as 'copy the value the screen shows you'.
- The fallback in 'the emails are not arriving' is honest about a thing design C glossed: with the hook off and nothing else configured, Supabase's own sender only reaches project team members, two an hour. Enough for him to prove the flow, not enough for readers, so the SMTP screen and a second look at the rate limit follow. The template line is design C's, with the brief's link format.
- The phrase 'Magic link' appears twice, only as the name of the Supabase dashboard template he has to find in that fallback. The house rule bans it from site copy; there is no way to name that screen otherwise.
- Nothing in either file was rendered or read back in a browser. They are plain Markdown in the repo, not published pages.
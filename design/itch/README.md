# Putting Sounds Like Scripture on itch.io

About twenty minutes, once. Everything you upload is in `design/itch/upload/`:

- `sounds-like-scripture.html` (the game, one file)
- `cover.png` (630 x 500)
- `screenshot-play.png`, `screenshot-reveal.png`, `screenshot-result.png`, `screenshot-start.png`

This copy of the game is the same game as the one on the site, with three changes made for itch: a
challenge link copied from it sends the friend to **wiserwalk.com** (not to itch), the chip on the first
screen links to wiserwalk.com, and the result screen links to Who Said It? and the quizzes.

## Steps

1. Make an account at https://itch.io/register (or log in). Add a profile picture and one line about
   yourself on your profile first; an empty profile looks like spam.
2. Go to https://itch.io/game/new and fill the form in from top to bottom:
   - **Title:** `Sounds Like Scripture`
   - **Project URL:** `sounds-like-scripture`
   - **Short description or tagline:** `A line appears. Is it in the Bible, or does it only sound like it? Ten lines, a few seconds each.`
   - **Classification:** Games
   - **Kind of project:** HTML
   - **Release status:** Released
   - **Pricing:** No payments
   - **Uploads:** upload `sounds-like-scripture.html`, then tick **This file will be played in the browser**.
   - **Embed options:** Embed in page. **Viewport dimensions:** `960` x `720`.
   - **Frame options:** tick **Mobile friendly** (orientation: Portrait, or "any" if offered) and
     **Fullscreen button**. Leave "Automatically start on page load" and "Enable scrollbars" unticked.
   - **Description:** paste the page text below.
   - **Genre:** Educational
   - **Tags:** `bible`, `christian`, `trivia`, `quiz`, `text-based`, `casual`, `short`, `singleplayer`, `high-score`, `history`
   - **Generative AI question:** answer **Yes**, and tick **Code** only. That is the honest answer: AI
     helped write the code; no line in the game, no picture and no sound was generated. Leave Graphics,
     Sound and Text unticked.
   - **Community:** Comments
   - **Cover image:** `cover.png`
   - **Screenshots:** add them in this order: play, reveal, result, start.
   - **Visibility and access:** leave it on Draft for now.
3. Press **Save and view page**. Play one run on the draft page, on your computer and once on your phone.
4. If it plays, go back to **Edit game**, set visibility to **Public**, and save. Done. There is nothing to
   keep up afterwards.

If the game looks cut off in the frame, change the viewport to `1000` x `760` and save again.

## The page text (paste into Description)

**A line appears on a card. Is it in the Bible, or does it only sound like it?**

You get ten lines and a few seconds for each. Swipe or tap your call, watch the clock, and see what you
scored. It is much harder than it sounds.

**Why it is hard**

- No easy giveaways. "God helps those who help themselves" is not in here. The lines that are not in the
  Bible come from 1 Enoch, the Apostolic Fathers, Augustine, Thomas a Kempis, Julian of Norwich, John
  Bunyan, Pascal, Josephus and other old writers.
- Old English and modern English appear on both sides, so "thee" and "thou" tell you nothing.
- 907 lines, so you will rarely see the same one twice.

**Every line is real**

Nothing in the game was written by me or by an AI. Every line is copied word for word from a
public-domain edition, and a script checks each one against the file it came from. After every call you
get the exact citation and a link to read the source yourself.

**Your Bible, your answers**

Pick Protestant, Catholic or Orthodox before you play. A line from Sirach or 1 Maccabees counts as
Scripture if your Bible includes it, and the game tells you which Bibles carry it either way.

**After your run**

See the lines that got you, which books fool you most, and copy a challenge link so a friend can play
the same ten lines and try to beat your score.

Free, no account, nothing to install. Made by one person with AI help on the code.

More free games and quizzes (Which Bible character are you most like? What are your spiritual gifts?
Where do you stand among the Christian traditions?) at **https://wiserwalk.com**

## When to upload it again

Only if the game's lines are rebuilt. A challenge link replays the same ten lines only while itch and the
site hold the same set. To remake everything in the upload folder:

    node design/itch/build.mjs shots

Then on itch: Edit game, delete the old file, upload the new one, tick "played in the browser", save.

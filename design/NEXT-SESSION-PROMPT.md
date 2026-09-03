# Next session — starting prompt

Copy the block below as the first message of the next session.

---

Read `CLAUDE.md` (the **PICK UP HERE** section) before doing anything, then skim
`design/README.md`. The visual theme is settled — do not redesign it.

**This session's goal: blueprint the whole result experience, then build it. Phone-first.**

## Step 1 — blueprint both result shapes together, before writing any page code

The Compass is **bipolar** (six axes between two named poles, a centre that means "no position").
Every other planned quiz is **unipolar** — spiritual gifts, seven deadly sins, who-you-are-like in
the Bible are all *categories ranked by strength*: no poles, no centre, no no-claim band. Almost
every Compass design decision is meaningless for those.

Spec ONE result system that serves both without pretending they are the same thing. Applying a
bipolar chassis to unipolar data is the same class of error as labelling one pole of two. Cover:
the hero visual, the per-item detail row, the deep-content panel, the share card, and the empty /
flat / tied edge cases for each shape.

Also blueprint, at least in outline: the article system, the Bible study tools, the hub, and how a
reader moves between quiz → result → axis page → article → another quiz. Map the full scope now;
patching weak concepts later is exactly what we are avoiding.

## Step 2 — build the Compass result page against that spec

Accepted decisions are listed in `CLAUDE.md`. The load-bearing ones:

- **No separate compass wheel.** Hero and axis rows are ONE component: six full-width diverging
  rails on a shared centre spine. A circle cannot hold twelve pole labels.
- **Both pole names print on every rail, always.** Never encode a pole by omission.
- Draw the audited 41–59 no-claim band as a visible zone.
- Layered opacity: ~30% tint under a 100% solid knob. Never a flat saturated fill.
- Deep content as two mirrored pole panels, via `design/tools/split-summaries.mjs`.
- Do **not** assign scripture passages to a pole — both camps claim them; splitting is an audit
  violation. `readMore` IS pole-split, because the data says so.
- Truncate axis prose on the result page; the full text lives on the indexable `/axis/` pages.

## Step 3 — fix the two verified open bugs

1. Axis `key` ≠ `slug`: `spirit`→`gifts`, `tradition`→`authority`. Always route off `slug`.
2. `(see candidate_statements)` — an internal JSON key — is in the published Grace summary in
   `audit/compass-data.revised.json`. Needs an editorial fix; ask before changing audited prose.

## Step 4 — email capture

The offer is the result link **plus a short follow-up series** unpacking the reader's strongest
axes. Rewrite the "no accounts, no email list" promises on `/about` and `/method` honestly — do not
quietly contradict published copy.

## How to work

- **Mobile-first at every stage.** Phone → tablet → desktop, never desktop scaled down. No PWA, no
  native wrapper; responsive web only.
- **Read the data before designing for it.** Two rounds were wasted last session by not noticing
  `readMore` was already pole-split and that `flower-bg-2` is only 4.2% opaque.
- **Use agents** for design and review — they caught real bugs a solo pass missed. **But verify
  every claim.** One critic asserted a `band()`/`nearestState()` contradiction that is not reachable
  at any real score.
- `design/DESIGN-SPECS.md` holds five specs with adversarial critiques. Every one came back
  `needs-work` — **read the critique alongside its spec; the critique usually wins.**
- Run `node design/tools/split-summaries.mjs` and `npm run test` in `site/` after any data change.
- Say plainly when something is a style specimen rather than a finished screen.
- Take the time it takes. Rushed output gets rejected.

## Definition of done

The Compass result page is live on wiserwalk.com, excellent on a phone, with the rails, the deep
content, the share card and email capture working — and the blueprint written down so the next
quiz is a data file, not a redesign.

**Note: every push to `main` deploys straight to production. There is no staging.**

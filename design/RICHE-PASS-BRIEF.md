# The Riche pass: design brief for every page

The owner rejected the first attempt at this as "INSANELY lazy", "SO boring" and "BARELY different
from the original boring bland non-designed layout". He is right: it put a plain panel behind each
heading and left every page body as text. **The bar is the result page and the reference skins, not
"tidy".** He can tell when work is rushed. Take the time to compose each page.

## Look before you build

Read these images first (the Read tool shows PNGs). They are the design language.

- `design/refs/ref-riche-sheet.png` — the primary inspiration: a framed sheet, a dark charcoal column
  against light panels, giant lowercase italic serif type cropped by its container, stat tiles,
  tiny letterspaced pill labels, a vertical gradient strip with rotated text.
- `design/refs/ref-epitaph.png` — a colour-washed hero with a giant ghost word behind it, a dark chip,
  dark panels with right-aligned italic display titles, category cards with a washed stripe, rotated
  tags, a medallion, a dark corner tab, bordered chip grids.
- `design/refs/ref-rose-water.png` — dotted-rule label/value lists, segmented pips, dark skewed pills
  with italic titles, display type bleeding off the panel edge.
- `design/refs/locked-theme-demo.png` — the locked wiserwalk adaptation (palette, wash strength,
  tiles, floral overlay, skewed cards).
- `design/refs/new-home-desktop.png` and `new-home-phone.png` — **the new home page, already built in
  this language. Your pages must look like siblings of it.** Read `site/src/pages/index.astro`,
  `site/src/styles/kit.css` and the components it uses before writing anything.
- The live result page, https://wiserwalk.com/r/theology-compass/01IBS6/ (capture it yourself): the
  refinement bar for instruments (compass, rails, outcome cards, depth panels, timeline, passages).

## The kit (site/src/styles/kit.css). Use it; extend it only in YOUR page stylesheet

| Thing | Markup | Use for |
|---|---|---|
| The band | `<Hero title eyebrow icon ghost blue orange tiles long>` | every page's header. Always give it a `ghost` word (one lowercase word). `tiles` only with real numbers |
| Section head | `<SectionHead title kicker href more />` | every region of a page. Lowercase italic display |
| Stripe card | `<Card href title text meta tab go icon />` | lists of quizzes, games, articles |
| Dark panel | `class="dark"` + `.dark-ghost` word | contrast blocks, calls to action, anything that should feel like the charcoal column |
| Feature | `.feature` > `.feature-art.dark` + `.feature-body` | one flagship thing, with an instrument on the dark half |
| Spec list | `<dl class="spec"><div><dt><dd>` | label/value facts on dotted rules |
| Chips | `<ul class="chips"><li><a class="chip-link">` | link grids (axes, traditions, anchors) |
| Tiles | `<ul class="tiles"><li class="tile"><b>n</b><span>label` | real numbers |
| Buttons | `.btn`, `.btn.dark`, `.btn.ghost` | already in site.css |
| Instruments | `CompassWheel`, `RailStack`, `OutcomeCards`, `AxisDepth`, `HistoryTimeline`, `PassagePills` | reuse them. Inside `.dark` they re-colour themselves through the tokens |

## Rules

1. **Phone first, truly.** Compose at 390px, then 768, then 1360. No horizontal scroll at 390.
   Tap targets 44px. Nothing may rely on hover.
2. **Light is the default theme** (owner's instruction). Dark is `?theme=dark`. Both must look
   finished. Dark needs roughly a tenth of the texture opacity light does (already in the tokens).
3. **Tokens only.** No colour literals outside `:root` token blocks. Blue means the left pole and
   orange the right pole wherever an axis is involved; neither is "good".
4. **Real data only.** Every number, name, date and quotation on a page comes from the repo's data
   (`site/src/lib`, `site/src/data`, content collections). Never invent a statistic, a quotation, a
   source or a claim. Never add a sources block to tradition pages (no citations exist in the data).
   Do not assign Scripture passages to a pole. Both pole names print wherever an axis is drawn.
5. **Do not touch:** the result page's instruments' internals, scoring, the engine, `Base.astro`,
   `kit.css`, `site.css`, `index.astro`, other builders' files. Put your CSS in your own
   `site/src/styles/pages/<group>.css` (already imported). New components are welcome (new files).
6. Copy stays honest and plain. Banned words in any new copy: "faith" (as a brand word), "-ward"
   coinages, "almost/not yet/barely" framings. No emoji. No flattery of any tradition.
7. Structure must be true: numbered markers only for real sequences; tiles only for real counts.
8. `prefers-reduced-motion` respected; no `requestAnimationFrame` dependence.
9. No commit, no push, no npm installs, no sub-agents.

## How to see your work (the in-app browser cannot screenshot; use this)

The dev server is already running at http://localhost:4321 (do not start another; if it is down,
say so in your report). From the repo root, with ABSOLUTE output paths:

```
sh design/tools/shot.sh -m "http://localhost:4321/PATH/" "$PWD/design/tools/shots/NAME-phone.png" 3000
sh design/tools/shot.sh "http://localhost:4321/PATH/" "$PWD/design/tools/shots/NAME-desk.png" 1360 2600
sh design/tools/shot.sh -m "http://localhost:4321/PATH/?theme=dark" "$PWD/design/tools/shots/NAME-phone-dark.png" 3000
python design/tools/crop.py design/tools/shots/NAME-phone.png 1300     # slices you can actually read
```

Look at every page you touch, on phone AND desktop, light AND dark, and iterate until it is
composed, not merely styled. Compare against the references each time. Before you finish run
`npm run build` in `site/` (it runs the engine tests) and make sure it completes.

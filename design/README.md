# design/

Everything needed to rebuild the visual work from scratch. Self-contained: no path here reaches
outside the repo, and nothing depends on an external image host.

## Layout

- `graphics/` — the eight source stencils. **Seven of the eight are black RGB with the entire image
  in the alpha channel**, so they are stencils, not pictures. Measured opacity matters when placing
  them:

  | file | size | pixels >50% opaque | usable as |
  |---|---|---|---|
  | `abstract-bg-2.png` | 717×400 | 44% | small confined placements |
  | `smokey-bg-2.png` | 867×400 | 27% | confined placements, veils |
  | `flower-bg-1.png` | 375×585 | 11% | needs room |
  | `flower-bg-2.png` | 540×756 | **4.2%** | full-bleed only |
  | `dark-starry-bg.png` | 798×798 | opaque | dark fills (light theme only) |

  The 4.2% figure is why a floral confined to a 150px sliver renders as nothing. Delicate line art
  only registers spread wide.

- `demos/*-template.html` — sources. Built output is gitignored; regenerate it.
- `tools/` — run any of these from `design/tools/`:
  - `build-riche.mjs` → the locked theme demo
  - `build-results.mjs` → the result page demo, with real audited axis content
  - `split-summaries.mjs` → splits each axis summary by pole, and **verifies** the split
  - `gen-textures.mjs` → procedural PNG paint-pour/grunge/halftone generator (unused by the
    current demos, kept for OG image generation — it is reseedable, so a new pour per quiz is
    one number)
  - `inspect.mjs` → reports alpha/luminance of the graphics

## How the stencils are used

Three techniques, all from the reference skins:

1. **Gradient poured through a mask** — `mask-image: <stencil>` over a `linear-gradient`. Gives the
   smoke any colour we want.
2. **Inverted to white and blended** — `filter: invert(100%)` + `mix-blend-mode: soft-light`.
3. **Blended inside a panel** — starfield at `lighten`, floral at `overlay`.

Dark themes need roughly an order of magnitude less opacity than light: the hero wash runs `.52`
light and `.05` dark. A value that reads as subtle on paper is glaring against near-black.

## Licensing

The graphics were supplied by the owner, who confirmed they are cleared for use. The *code* of the
reference skins (Pharaoh Leap on CodePen) is MIT and requires attribution if reused; the design
language studied from them is recorded in `DESIGN-SPECS.md`. Note this repo is **public**, so these
files are redistributed by being committed here.

## DESIGN-SPECS.md

295KB of specialist output: five design specs, each with an adversarial critique. Every dimension
came back `needs-work`. **Read the critique alongside its spec — the critique usually wins.** These
are proposals, not settled decisions; see `CLAUDE.md` for what was actually accepted.

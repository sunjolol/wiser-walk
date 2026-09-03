# Result page design specifications

Produced 2026-09-03 by ten agents: five designers, each paired with an adversarial critic
briefed to reject work for being boring, flat or logically incoherent and to rewrite the
weakest third rather than merely complain. **Every dimension came back `needs-work`**, so
read each critique alongside its spec — the critique usually wins.

These are specifications, not decisions already taken. See CLAUDE.md for what was accepted.

---

# The compass visual

**Critic verdict: `needs-work`**

## Concept

**The Plumb Line** — six full-width diverging tracks stacked and pierced by one continuous vertical centre column, so the whole result reads as a single object rather than six charts. Every row prints both pole names as fixed left/right anchors (structurally impossible to show a nameless opposite), a low-opacity tinted bar grows from the centre toward your pole, and a solid knob marks the score. The audited 41–59 "names no position" band is drawn as a visible neutral cradle running the full height, so a centrist gets a deliberate, honest picture — six coloured knobs hanging on a plumb line — instead of an empty state.

## Why it works

The eye reads *position along a common baseline* more accurately than angle, area, or length-without-origin — it is the top-ranked encoding in every perceptual study since Cleveland & McGill. A shared vertical spine gives all six axes one origin, so "which conviction is strongest?" is answered by scanning bar lengths down a column in a single saccade, and "which side am I on?" by whether the knob is left or right of a line the eye is already tracking. That is two questions answered pre-attentively, before any word is read.

Radial forms fail here for a structural reason, not a taste reason. On a wheel, a bipolar axis has to be either a full diameter (which forces twelve labels onto a circle, drives long strings like "Bible & tradition" into rotated or curved text, and makes magnitude a length along a tilted line the eye must mentally un-rotate) or a single spoke (which is exactly the failure that happened last time: one pole named, the opposite an anonymous blank sector). A radar/spider polygon is worse still — with centre = 50, a firm monergist and a firm synergist both plot as "far from centre" and produce indistinguishable areas unless you split hemispheres, which quietly destroys bipolarity. And a wheel's centre is where a centrist collapses into an unreadable blob.

Gauge clusters fail on a softer count: six dials fragment one result into six pictures with no shared baseline, so cross-axis comparison becomes angle-comparison (poor), and each dial's two pole labels have to be crammed into arc ends at ~160px, which is how type gets too small to read.

The stacked-diverging form also earns its "hero" status honestly, without inventing data. It does not connect the knobs into a false continuum between unrelated doctrines — the six axes have no shared units, and a polyline through them would imply interpolation the audit would never license. Its unity comes from geometry the data actually supports: one origin, one scale, one no-claim zone. The cradle column is the audited rule made visible — a viewer sees *why* an axis near 50 gets no adjective, because the knob is sitting inside a drawn zone. Rigour rendered, which is the moat.

Finally the colour handling restores what people liked: a ~30% tinted bar under a 100% solid knob is layered opacity, so the axis hue reads as atmosphere and the knob reads as a fact. Flat saturated fills lose that hierarchy and make the palette shout.

## Specification

## 0. Naming and placement

Component: `.compass` (wrapper `div`) containing `<svg class="compass-svg">` plus a `<details class="compass-alt">` text alternative. It sits inside a standard `#EEEEEE` panel (radius 20px, shadow `3px 3px 5px rgba(68,68,68,.065)`), full panel width, `max-width: 560px`, centred.

## 1. Two geometry profiles (this is how "too small to read" is fixed)

Type must never scale below ~11px. So the SVG does **not** simply shrink — the renderer picks one of two viewBox profiles from the wrapper's measured width. `viewBox` scaling then keeps type at roughly its authored size in both.

| | **wide** (wrapper ≥ 480px) | **narrow** (wrapper < 480px) |
|---|---|---|
| viewBox | `0 0 560 444` | `0 0 360 552` |
| track x0 / x1 | 26 / 534 | 14 / 346 |
| track width `W` | 508 | 332 |
| centre `CX` | 280 | 180 |
| top pad | 20 | 16 |
| row pitch `P` | 72 | 90 |
| track height / rx | 22 / 11 | 20 / 10 |
| knob r / ring r | 9 / 10.5 | 8.5 / 10 |

`px(S) = x0 + W * S/100`. Wide: `px = 26 + 5.08·S`. Narrow: `px = 14 + 3.32·S`.

**Wide row internals** (`rowTop(i) = 20 + 72i` → 20, 92, 164, 236, 308, 380):
- label line baseline = `rowTop + 11` — left pole (start, x=26), axis name (middle, x=280), right pole (end, x=534)
- `trackY(i) = rowTop + 33` → 53, 125, 197, 269, 341, 413 (track centre-line)
- reading baseline = `rowTop + 56` → 76, 148, 220, 292, 364, 436

**Narrow row internals** (`rowTop(i) = 16 + 90i`): axis name alone on its own line, left-anchored at x=14, baseline `rowTop + 13`; pole line baseline `rowTop + 31`; `trackY = rowTop + 50`; reading baseline `rowTop + 72`. Moving the axis name off the centre line frees the full 332px for the two longest pole names.

Re-render on `ResizeObserver` (debounced 120ms) **only when the profile changes**, never on every pixel.

## 2. Draw order (bottom to top)

1. **Brand rule.** `<rect x="26" y="8" width="508" height="3" rx="1.5" fill="url(#cmpBrand)">` with `<linearGradient id="cmpBrand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7EBAEE"/><stop offset="1" stop-color="#F0A06F"/></linearGradient>`. Narrow: x=14, w=332, y=6.
2. **Cradle column.** One rounded rect spanning the audited middle band across all six rows: wide `x=231.74 y=38 width=96.52 height=390 rx=14`; narrow `x=148.46 y=34 width=63.08 height=500 rx=12`. `fill: var(--cmp-cradle)`. This is the "names no position" zone.
3. **Spine.** `<line x1="280" y1="38" x2="280" y2="428" stroke="var(--cmp-hair)" stroke-width="1"/>` (narrow: x=180, y 34→534). Drawn behind the tracks.
4. **Per row** (`<g class="cmp-row">`), in this order:
   a. base track `<rect x="26" y="trackY-11" width="508" height="22" rx="11" fill="var(--cmp-track)"/>`
   b. band hairlines, `stroke="var(--cmp-hair)"`, `stroke-width="1"`: at scores **20.5, 79.5** (x = 130.14, 429.86) from `trackY-7` to `trackY+7` at opacity .55; at scores **40.5, 59.5** (x = 231.74, 328.26) full track height `trackY-11` → `trackY+11` at opacity .9. These four positions are exactly the boundaries of `band(s) = s<=20?0 : s<=40?1 : s<=59?2 : s<=79?3 : 4`, so the drawing and the arithmetic can never disagree.
   c. **fill**, inside `<g clip-path="url(#cmpTrk{i})">` where the clipPath is a copy of (a). Right lean (`S>50`): `x = CX-6, width = px-CX+6`. Left lean (`S<50`): `x = px, width = CX-px+6`. Always `rx="11"`, `fill="var(--ax{i})"`, `fill-opacity: var(--cmp-fill-o)` (**.30** light / **.34** dark). The 6px overshoot tucks the rounded inner cap under the spine so the bar reads flush to the origin; the clip stops it spilling. SVG clamps `rx` to `width/2`, so a small lean renders as a correct small lozenge with no manual radius maths. **If `S === 50`, omit the fill entirely** — do not draw a 6px stub.
   d. **knob group** `<g class="cmp-knob">`: outer ring `<circle r="10.5" fill="none" stroke="var(--ax{i})" stroke-opacity=".9" stroke-width="1.5"/>` then core `<circle r="9" fill="var(--ax{i})" stroke="var(--cmp-card)" stroke-width="3"/>`, both at `cx=px, cy=trackY`. Tactility via CSS on the group: `filter: drop-shadow(0 2px 3px rgba(68,68,68,.20))`, dark theme `rgba(0,0,0,.45)`. This 0.30-tint-under-solid-knob layering is the idiom people liked, scaled up.
   e. **labels**, all `<text>`:
      - left pole: `x=26 text-anchor="start"`, Poppins 500, 12px (narrow 11.5px), `fill: var(--cmp-muted)`, `letter-spacing: .01em`
      - right pole: `x=534 text-anchor="end"`, same
      - axis name: `x=280 text-anchor="middle"`, **DM Serif Display italic 15px**, `fill: var(--cmp-ink)` (narrow: 14px, `x=14`, `text-anchor="start"`, own line)
      - reading: Poppins 500, 11px, `letter-spacing: .02em`, content = the existing `lean(a, s)` string verbatim (`"33% toward Monergist"`, `"at the center"`, `"at the Synergist pole"`). Anchoring depends on band:
        - `band ∈ {0,1,3,4}` → anchored to the leaning end (`S<50`: start at x=26; `S>50`: end at x=534), `fill: var(--ax{i}-ink)`
        - `band === 2` → `text-anchor="middle" x="280"`, `fill: var(--cmp-muted)`
        A middle-band axis therefore sits quiet and central instead of flinging a coloured claim to one edge. That is the audited rule expressed in layout, not just in prose.

## 3. Colour tokens (measured, not guessed)

Bars and knobs use the raw axis colour. **Text never does** — three of the six fail contrast on `#EEEEEE`: orange 3.20:1, gold 2.54:1, green 4.35:1. Ship a second `-ink` token per axis:

```
:root{
  --ax0:#2F4FCB; --ax0-ink:#2A46B4;  /* Grace     6.87:1 */
  --ax1:#9E2A3B; --ax1-ink:#8E2434;  /* Table     7.38:1 */
  --ax2:#E2582B; --ax2-ink:#A63A14;  /* Gifts     5.59:1 */
  --ax3:#2E7D4F; --ax3-ink:#22603B;  /* Kingdom   6.45:1 */
  --ax4:#C98A12; --ax4-ink:#7A5206;  /* Authority 5.96:1 */
  --ax5:#6A4BC0; --ax5-ink:#5B3EAC;  /* Worship   6.63:1 */
  --cmp-card:#EEEEEE; --cmp-ink:#444444; --cmp-muted:#5E6470;   /* 8.39:1 / 5.12:1 */
  --cmp-track:rgba(68,68,68,.055);
  --cmp-cradle:rgba(68,68,68,.045);
  --cmp-hair:rgba(68,68,68,.20);
  --cmp-fill-o:.30;
}
```
Dark theme (`@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){…} }` **and** `:root[data-theme="dark"]{…}` — define both, per house rule) uses the existing light variants for *both* bar and text, all ≥4.78:1 on `#1E2128`: `--ax0/-ink:#7C93FF`, `--ax1:#E0637A`, `--ax2:#FF8A5B`, `--ax3:#5FC48A`, `--ax4:#F2B84B`, `--ax5:#A88BFF`; `--cmp-card:#1E2128; --cmp-ink:#EEF0F3; --cmp-muted:#A2A8B4; --cmp-track:rgba(255,255,255,.06); --cmp-cradle:rgba(255,255,255,.05); --cmp-hair:rgba(255,255,255,.22); --cmp-fill-o:.34`.

Optional texture: `.compass::after` with the floral stencil as `-webkit-mask-image`/`mask-image`, `opacity:.05`, `mix-blend-mode:multiply` (light) / `screen` (dark), `pointer-events:none`.

## 4. The centrist case

All six knobs land on the spine, no fills, six readings say "at the center" in muted grey down the middle. That is a composed picture — a plumb line hung with six coloured beads — not a failure. Beneath the SVG, when `scores.every(s => band(s) === 2)`, print the existing audited sentence: *"Your answers sit near the center on every axis, so no tradition is named."* **Never** branch to an empty or error state, and never scale the graphic differently for centrists.

## 5. Long pole names

Measured at Poppins 12px (≈0.55em advance): worst row is Authority — "Bible & tradition" ≈112px + "Authority" (serif 15px) ≈68px + "Scripture alone" ≈99px = 279px inside a 508px line, leaving ~114px per gap. Narrow profile drops the axis name to its own line, leaving 332px for 107px + 95px = 202px, a 130px gap. **No wrapping, no ellipsis, no rotation, no `textLength` squeezing** — the layout has real slack by construction. Never truncate a pole name; if a future quiz supplies one long enough to collide, the correct fix is to lengthen the row, not to shorten the word.

## 6. Motion

Entrance only, CSS transitions (the embedded browser pane never fires `requestAnimationFrame`, so do not use rAF): each `.cmp-knob` group transitions `transform: translateX(0)` from `translateX(CX - px)`; each fill transitions `clip-path: inset(0 …)` from fully closed at the centre — **clip, not `scaleX`**, because scaling a rounded rect distorts its corner radii. 520ms `cubic-bezier(.22,.85,.3,1)`, 70ms stagger per row. Wrap the whole block in `@media (prefers-reduced-motion: reduce){ * { transition: none !important } }` and set the final state immediately.

## 7. Accessibility and semantics

- `<svg role="group" aria-labelledby="cmp-title">` with a visually-hidden `<h3 id="cmp-title">Your compass</h3>` in the HTML above it.
- Each row: `<g class="cmp-row" role="img" tabindex="0" aria-label="Grace, Monergist to Synergist. 33% toward Monergist. Monergist-leaning.">` — pole names, direction, magnitude, and the band adjective all in the label. Six tab stops, each announcing a complete sentence.
- Hover/focus does exactly one thing and carries **no information**: the other five rows drop to `opacity:.40` and the focused knob's ring goes to `stroke-width:2.5`. Because it is decorative only, nothing is lost by mouse-only or keyboard-only use, and there is no tooltip to collide with anything. Focus ring: `.cmp-row:focus-visible { outline: 2px solid var(--cmp-ink); outline-offset: 3px; border-radius: 12px; }` (set `overflow: visible` on the SVG so the ring is not clipped).
- Nothing is encoded by colour alone: position relative to the spine plus the printed reading carry the full message; hue is identity only.
- Always-present text alternative: `<details class="compass-alt"><summary>Read this as text</summary><dl>…</dl></details>` listing all six as `<dt>Grace — Monergist to Synergist</dt><dd>33% toward Monergist (monergist-leaning)</dd>`. Keep it in the DOM even when collapsed.

## 8. Data contract and runtime invariant

Renderer input per axis: `{ name, left_pole, right_pole, bands[5], colorToken }` plus the score. **All strings come from `audit/compass-data.revised.json`; none are authored in the component.** Reuse the existing `band()` and `lean()` functions unchanged — do not reimplement the thresholds.

Ship this assertion so the last failure cannot silently return:

```js
axes.forEach((a, i) => {
  if (!a.left_pole || !a.right_pole)
    throw new Error(`Compass axis ${i} (${a.name}) is missing a pole name; both poles must be labelled.`);
});
```

Run `node audit/selftest.js` before any publish, per house rule.

## Markup sketch

```html
&lt;!-- ============ CSS ============ --&gt;
&lt;style&gt;
:root{
  --ax0:#2F4FCB; --ax0-ink:#2A46B4;
  --ax1:#9E2A3B; --ax1-ink:#8E2434;
  --ax2:#E2582B; --ax2-ink:#A63A14;
  --ax3:#2E7D4F; --ax3-ink:#22603B;
  --ax4:#C98A12; --ax4-ink:#7A5206;
  --ax5:#6A4BC0; --ax5-ink:#5B3EAC;
  --cmp-card:#EEEEEE; --cmp-ink:#444444; --cmp-muted:#5E6470;
  --cmp-track:rgba(68,68,68,.055); --cmp-cradle:rgba(68,68,68,.045);
  --cmp-hair:rgba(68,68,68,.20); --cmp-fill-o:.30;
  --cmp-knob-shadow:0 2px 3px rgba(68,68,68,.20);
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --ax0:#7C93FF; --ax0-ink:#7C93FF; --ax1:#E0637A; --ax1-ink:#E0637A;
  --ax2:#FF8A5B; --ax2-ink:#FF8A5B; --ax3:#5FC48A; --ax3-ink:#5FC48A;
  --ax4:#F2B84B; --ax4-ink:#F2B84B; --ax5:#A88BFF; --ax5-ink:#A88BFF;
  --cmp-card:#1E2128; --cmp-ink:#EEF0F3; --cmp-muted:#A2A8B4;
  --cmp-track:rgba(255,255,255,.06); --cmp-cradle:rgba(255,255,255,.05);
  --cmp-hair:rgba(255,255,255,.22); --cmp-fill-o:.34;
  --cmp-knob-shadow:0 2px 3px rgba(0,0,0,.45);
}}
:root[data-theme="dark"]{ /* repeat the dark block verbatim */ }

.compass{ position:relative; max-width:560px; margin:0 auto; }
.compass-svg{ display:block; width:100%; height:auto; overflow:visible; }
.cmp-pole{ font:500 12px/1 Poppins,system-ui,sans-serif; letter-spacing:.01em; fill:var(--cmp-muted); }
.cmp-name{ font:italic 400 15px/1 "DM Serif Display",Georgia,serif; fill:var(--cmp-ink); }
.cmp-read{ font:500 11px/1 Poppins,system-ui,sans-serif; letter-spacing:.02em; }
.cmp-read.is-mid{ fill:var(--cmp-muted); }
.cmp-knob{ filter:drop-shadow(var(--cmp-knob-shadow)); }

/* entrance: clip the fill (never scaleX — it distorts the corner radii) */
.cmp-fill{ clip-path:inset(0 var(--clipR) 0 var(--clipL)); transition:clip-path .52s cubic-bezier(.22,.85,.3,1) var(--d); }
.cmp-knob{ transform:translateX(var(--from)); transition:transform .52s cubic-bezier(.22,.85,.3,1) var(--d); }
.compass.is-in .cmp-fill{ clip-path:inset(0 0 0 0); }
.compass.is-in .cmp-knob{ transform:translateX(0); }

/* hover/focus: isolation only, carries no information */
.compass-svg:hover .cmp-row:not(:hover){ opacity:.40; }
.cmp-row{ transition:opacity .18s ease; }
.cmp-row:focus-visible{ outline:2px solid var(--cmp-ink); outline-offset:3px; border-radius:12px; }
.cmp-row:focus-visible .cmp-ring{ stroke-width:2.5; }

@media (prefers-reduced-motion:reduce){
  .cmp-fill,.cmp-knob{ transition:none; clip-path:inset(0 0 0 0); transform:none; }
}
&lt;/style&gt;

&lt;!-- ============ MARKUP ============ --&gt;
&lt;div class="compass" id="compass"&gt;
  &lt;h3 id="cmp-title" class="sr-only"&gt;Your compass&lt;/h3&gt;
  &lt;svg class="compass-svg" role="group" aria-labelledby="cmp-title"&gt;&lt;/svg&gt;
  &lt;p class="cmp-caption" id="cmp-caption" hidden&gt;&lt;/p&gt;
  &lt;details class="compass-alt"&gt;&lt;summary&gt;Read this as text&lt;/summary&gt;&lt;dl id="cmp-dl"&gt;&lt;/dl&gt;&lt;/details&gt;
&lt;/div&gt;

&lt;!-- ============ RENDERER ============ --&gt;
&lt;script&gt;
var WIDE   = {vb:[560,444], x0:26, W:508, pad:20, P:72, th:22, kr:9,   fs:12,  ns:15, nameCentred:true,
              rows:{name:11, pole:11, track:33, read:56}};
var NARROW = {vb:[360,552], x0:14, W:332, pad:16, P:90, th:20, kr:8.5, fs:11.5,ns:14, nameCentred:false,
              rows:{name:13, pole:31, track:50, read:72}};

function esc(s){ return String(s).replace(/[&amp;&lt;&gt;"]/g,function(c){return {'&amp;':'&amp;amp;','&lt;':'&amp;lt;','&gt;':'&amp;gt;','"':'&amp;quot;'}[c];}); }
function f(n){ return Math.round(n*100)/100; }

/* INVARIANT — the last attempt shipped a named pole with a blank opposite. Fail loud instead. */
function assertPoles(axes){
  axes.forEach(function(a,i){
    if(!a.left || !a.right)
      throw new Error('Compass axis '+i+' ('+a.name+') is missing a pole name; both poles must be labelled.');
  });
}

function renderCompass(axes, scores, opts){
  assertPoles(axes);
  var host = document.getElementById('compass');
  var G = host.clientWidth &gt;= 480 ? WIDE : NARROW;
  var x0 = G.x0, W = G.W, x1 = x0 + W, CX = x0 + W/2, th = G.th, r = th/2;
  var px = function(s){ return x0 + W * s/100; };
  var b20 = px(20.5), b40 = px(40.5), b59 = px(59.5), b79 = px(79.5);
  var top = px(0)*0 + (G.pad + G.rows.track - r) - 4;          /* column top  */
  var bot = G.pad + 5*G.P + G.rows.track + r + 4;              /* column base */

  var s = '';
  /* 1 brand rule */
  s += '&lt;defs&gt;&lt;linearGradient id="cmpBrand" x1="0" y1="0" x2="1" y2="0"&gt;'
     + '&lt;stop offset="0" stop-color="#7EBAEE"/&gt;&lt;stop offset="1" stop-color="#F0A06F"/&gt;&lt;/linearGradient&gt;';
  axes.forEach(function(a,i){
    var ty = G.pad + i*G.P + G.rows.track;
    s += '&lt;clipPath id="cmpTrk'+i+'"&gt;&lt;rect x="'+x0+'" y="'+f(ty-r)+'" width="'+W+'" height="'+th+'" rx="'+r+'"/&gt;&lt;/clipPath&gt;';
  });
  s += '&lt;/defs&gt;';
  s += '&lt;rect x="'+x0+'" y="'+(G.pad-12)+'" width="'+W+'" height="3" rx="1.5" fill="url(#cmpBrand)"/&gt;';

  /* 2 cradle column (the audited 41–59 "names no position" zone) + 3 spine */
  s += '&lt;rect x="'+f(b40)+'" y="'+f(top)+'" width="'+f(b59-b40)+'" height="'+f(bot-top)+'" rx="14" fill="var(--cmp-cradle)"/&gt;';
  s += '&lt;line x1="'+f(CX)+'" y1="'+f(top)+'" x2="'+f(CX)+'" y2="'+f(bot)+'" stroke="var(--cmp-hair)" stroke-width="1"/&gt;';

  /* 4 rows */
  axes.forEach(function(a,i){
    var sc = scores[i], ty = G.pad + i*G.P + G.rows.track, rt = G.pad + i*G.P;
    var p = px(sc), bd = band(sc), read = lean(a, sc), mid = (bd === 2);
    var col = 'var(--ax'+i+')', ink = 'var(--ax'+i+'-ink)';

    s += '&lt;g class="cmp-row" role="img" tabindex="0" style="--d:'+(i*70)+'ms" aria-label="'
       + esc(a.name+', '+a.left+' to '+a.right+'. '+read+'. '+a.bands[bd]+'.')+'"&gt;';

    /* a base track */
    s += '&lt;rect x="'+x0+'" y="'+f(ty-r)+'" width="'+W+'" height="'+th+'" rx="'+r+'" fill="var(--cmp-track)"/&gt;';
    /* b band hairlines — same numbers band() uses, so drawing and arithmetic cannot diverge */
    [[b20,7,.55],[b79,7,.55],[b40,r,.9],[b59,r,.9]].forEach(function(h){
      s += '&lt;line x1="'+f(h[0])+'" y1="'+f(ty-h[1])+'" x2="'+f(h[0])+'" y2="'+f(ty+h[1])
         + '" stroke="var(--cmp-hair)" stroke-opacity="'+h[2]+'" stroke-width="1"/&gt;';
    });
    /* c fill — 6px overshoot tucks the inner cap under the spine; clip stops the spill */
    if (sc !== 50){
      var fx = sc &gt; 50 ? CX - 6 : p;
      var fw = sc &gt; 50 ? (p - CX + 6) : (CX - p + 6);
      var clipL = sc &gt; 50 ? 0 : f(fw), clipR = sc &gt; 50 ? f(fw) : 0;
      s += '&lt;g clip-path="url(#cmpTrk'+i+')"&gt;&lt;rect class="cmp-fill" style="--clipL:'+clipL+'px;--clipR:'+clipR+'px"'
         + ' x="'+f(fx)+'" y="'+f(ty-r)+'" width="'+f(fw)+'" height="'+th+'" rx="'+r+'"'
         + ' fill="'+col+'" fill-opacity="var(--cmp-fill-o)"/&gt;&lt;/g&gt;';
    }
    /* d knob: 30% tint under a 100% solid knob — layered opacity, not one flat fill */
    s += '&lt;g class="cmp-knob" style="--from:'+f(CX-p)+'px"&gt;'
       + '&lt;circle class="cmp-ring" cx="'+f(p)+'" cy="'+f(ty)+'" r="'+f(G.kr+1.5)+'" fill="none" stroke="'+col+'" stroke-opacity=".9" stroke-width="1.5"/&gt;'
       + '&lt;circle cx="'+f(p)+'" cy="'+f(ty)+'" r="'+G.kr+'" fill="'+col+'" stroke="var(--cmp-card)" stroke-width="3"/&gt;&lt;/g&gt;';
    /* e labels — BOTH poles, every row, unconditionally */
    s += '&lt;text class="cmp-pole" x="'+x0+'" y="'+(rt+G.rows.pole)+'" text-anchor="start"&gt;'+esc(a.left)+'&lt;/text&gt;';
    s += '&lt;text class="cmp-pole" x="'+x1+'" y="'+(rt+G.rows.pole)+'" text-anchor="end"&gt;'+esc(a.right)+'&lt;/text&gt;';
    s += G.nameCentred
       ? '&lt;text class="cmp-name" x="'+f(CX)+'" y="'+(rt+G.rows.name)+'" text-anchor="middle"&gt;'+esc(a.name)+'&lt;/text&gt;'
       : '&lt;text class="cmp-name" x="'+x0+'" y="'+(rt+G.rows.name)+'" text-anchor="start"&gt;'+esc(a.name)+'&lt;/text&gt;';
    /* middle band sits quiet and central: the audited "a midpoint is not a conviction" rule, as layout */
    s += mid
       ? '&lt;text class="cmp-read is-mid" x="'+f(CX)+'" y="'+(rt+G.rows.read)+'" text-anchor="middle"&gt;'+esc(read)+'&lt;/text&gt;'
       : '&lt;text class="cmp-read" fill="'+ink+'" x="'+(sc&lt;50?x0:x1)+'" y="'+(rt+G.rows.read)+'" text-anchor="'+(sc&lt;50?'start':'end')+'"&gt;'+esc(read)+'&lt;/text&gt;';
    s += '&lt;/g&gt;';
  });

  var svg = host.querySelector('.compass-svg');
  svg.setAttribute('viewBox','0 0 '+G.vb[0]+' '+G.vb[1]);
  svg.innerHTML = s;
  host.dataset.profile = (G === WIDE ? 'wide' : 'narrow');

  /* honest centrist picture — never an empty state */
  var cap = document.getElementById('cmp-caption');
  var allMid = scores.every(function(x){ return band(x) === 2; });
  cap.hidden = !allMid;
  cap.textContent = allMid ? 'Your answers sit near the center on every axis, so no tradition is named.' : '';

  document.getElementById('cmp-dl').innerHTML = axes.map(function(a,i){
    return '&lt;dt&gt;'+esc(a.name+' — '+a.left+' to '+a.right)+'&lt;/dt&gt;&lt;dd&gt;'+esc(lean(a,scores[i])+' ('+a.bands[band(scores[i])]+')')+'&lt;/dd&gt;';
  }).join('');

  requestAnimationFrame ? setTimeout(function(){ host.classList.add('is-in'); }, 20)
                        : host.classList.add('is-in');
}

/* re-render only when the PROFILE flips, not on every pixel */
var ro = new ResizeObserver(debounce(function(){
  var want = document.getElementById('compass').clientWidth &gt;= 480 ? 'wide' : 'narrow';
  if (document.getElementById('compass').dataset.profile !== want) renderCompass(AXES, current.scores);
}, 120));
ro.observe(document.getElementById('compass'));
&lt;/script&gt;
```

## Pitfalls

- Shrinking one viewBox instead of switching profiles. If you keep the 560-wide viewBox on a 380px phone, every label renders at 12 × 380/560 ≈ 8.1px. That is the exact 'too small to read' failure repeating in a new shape. The two-profile switch exists solely to hold type at its authored size; do not 'simplify' it away.
- Using the raw axis colour for text. Orange #E2582B is 3.20:1, gold #C98A12 is 2.54:1, green #2E7D4F is 4.35:1 on #EEEEEE — all fail WCAG AA. The `-ink` tokens are not a stylistic preference. Raw colours are for bars and knobs only.
- Raising the fill opacity toward 1 because .30 'looks washed out' on your monitor. The tint-under-solid-knob layering is the whole reason the earlier version read well: the bar is atmosphere, the knob is the fact. A saturated fill flattens that hierarchy and the palette starts shouting.
- Animating the fill with `transform: scaleX()`. It distorts the 11px corner radii into ellipses mid-flight and looks cheap. Use the `clip-path: inset()` transition specified. Likewise do not drive the entrance with `requestAnimationFrame` — the embedded browser pane never fires it, so the graphic would render permanently in its zero state during local testing.
- Drawing the band hairlines at 20/40/60/80 instead of 20.5/40.5/59.5/79.5. `band()` uses `s<=20 / s<=40 / s<=59 / s<=79`, so a score of exactly 59 is middle-band but would render on the wrong side of a divider drawn at 60. A discernment-minded reader will notice a knob visually outside the cradle while the copy says it names no position.
- Making the cradle column dark enough to notice. It is a 4.5% tint. If you push it to a visible grey box it will read as 'the answer is in this box' or fight the 15px serif axis names that sit on top of it. It must register only as a faint vertical presence.
- Letting the fill's 6px centre overshoot escape the clip. Without `clip-path=url(#cmpTrk{i})` the rounded cap pokes across the spine and a left lean appears to cross into right-pole territory — a factual error, not a cosmetic one.
- Drawing a connecting polyline through the six knobs to make it look more like 'a shape'. The six axes share no units; a line between Grace and Table implies an interpolation the audit would never license. Unity comes from the shared spine, not from a fabricated contour.
- Adding a hover tooltip that prints the band adjective near the knob. It will collide with the reading line, clip at the row edges, and be invisible to keyboard and touch users. Hover/focus is specified to dim other rows and nothing else, precisely so it can carry no information.
- Truncating or ellipsising 'Bible & tradition'. The layout has ~114px of slack per gap in the wide profile and ~130px in the narrow one; there is no collision to solve. If a future quiz supplies a genuinely longer pole name, lengthen the row — never shorten the word, and never rotate or `textLength`-squeeze it.
- Special-casing the all-central result into a message with no graphic. Six coloured knobs hanging on the plumb line is the correct, composed picture; the caption is an addition to it, not a replacement for it.
- Hard-coding six axes or these pole strings into the component. Per the platform vision this is a reusable renderer: it takes an array of `{name, left, right, bands, colorToken}` and an array of scores. A seven-axis or four-axis quiz must work by changing `P` and the viewBox height, nothing else.
- Dropping the `assertPoles` throw because 'the data is fine'. It is the one line that makes the previous failure — a named pole with an anonymous blank opposite — impossible to ship silently.
- Defining the dark palette only inside `@media (prefers-color-scheme: dark)`. The house rule needs both that block and `:root[data-theme="dark"]`, or the manual theme toggle only works in one direction.

---

## CRITIQUE

### Logical incoherence found

- The centre is drawn as a standard. A plumb line is the instrument by which a wall is judged crooked (Amos 7:7-8); the spec runs one down the middle of six axes whose audited premise is that the midpoint is NOT the true position, merely an absence of one. Combined with the tinted 'cradle', the graphic silently teaches that moderation is correctness and conviction is deviation — a theological claim on a page that exists to make no such claims.
- A band-2 row prints 'lean(a, 42)' = '16% toward Monergist' inside the zone the same spec defines as 'names no position'. It names a position. Rendering it grey and centred is a tone change, not a suppression.
- assertPoles is specified twice with two different property names (left_pole/right_pole in section 8, left/right in the renderer), so the guard against last time's failure either throws on all valid audit data or is permanently unreachable, depending on which half the implementer follows.
- Pitfall 12 forbids hard-coding six axes; the renderer hard-codes colour as var(--ax{i}) from the loop index and ignores the colorToken the same pitfall says is the contract. The live data's tokens are --grace / --table / --spirit / --kingdom / --tradition / --worship.
- The section titled 'this is how too-small-to-read is fixed' makes labels shrink from 15.3px to 10.3px as the container grows past 480px, and holds them below the spec's own 11px floor from 480px to 513px.
- Narrow-profile cradle coordinates in prose (y=34, h=500) contradict the values the supplied renderer computes (52 -> 530), and the narrow brand rule is y=6 in prose, y=4 in code. Only the wide profile reconciles.
- Section 7 states the hover interaction 'carries no information' and is therefore lossless for keyboard-only users; it then assigns six tabindex stops to it. Six focus stops that by design convey nothing are tab-stop pollution, not an accessibility feature — especially with the full <dl> alternative already in the DOM.
- The knob's separation ring is stroked with var(--cmp-card), but the knob is drawn over the cradle tint and the lean fill, not over the card. At 4.5% and 30% the mismatch is small enough to survive, but the spec asserts a card-coloured ring on a surface that is by construction not the card colour.
- 'Nothing is encoded by colour alone' is claimed while the only distinction between a claimed and an unclaimed axis is text colour (axis -ink versus grey) plus a 4.5% background wash that pitfall 6 requires to be imperceptible. In greyscale, a leaning axis and a middle-band axis are the same picture.
- The pitfall list defends the 59.5 hairline against a score of exactly 59, which computeScores cannot produce — the 18 statements yield only 0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100 — while never addressing the quantization consequence that does bite: 42 and 58 sit 1.5 units inside the cradle edge, where the device is illegible.

### Worst problems

- IT IS THE COMPONENT THAT ALREADY SHIPS. Open theology-compass.html lines 239-245 and 1054-1063: `.track` (10px, radius 5) + `.tick` at 50% + `.fill` at opacity .35 + `.marker` (solid dot, 3px card border, 1.5px ring) + `.poles` printing left and right underneath, per axis, six rows stacked. That is this spec. "The Plumb Line" adds a 3px gradient sliver, a 4.5% grey box, one long hairline, and a viewBox. If this is the hero, the result page now has two breakdown lists and no hero — the reader scrolls past the flagship graphic and hits its near-identical twin 300px later. The spec never mentions the existing rows, never says whether they are replaced or duplicated, and never justifies why the answer to "boring" is a slightly larger version of the thing that was called boring.
- THE NAME AND THE CENTRE COLUMN MAKE THE MIDPOINT NORMATIVE — an audit failure, not a taste one. A plumb line (Amos 7:7-8) is a standard against which a thing is measured and found crooked. The spec erects it down the exact centre, tints a 41-59 'cradle' around it, calls the centre 'the origin', and grows every conviction outward from it as deviation. The audited rule is the opposite: the centre names NO position, it is not the true one. A discernment-minded reader screenshots 'you are 84% off the plumb line' and the moat is gone. Every one of the six axes has two poles a real tradition holds in good conscience; the graphic must not draw a third, unnamed, implicitly-correct one and label it with a prophet's measuring tool.
- THE TWO-PROFILE MECHANISM DOES THE OPPOSITE OF WHAT IT CLAIMS. Type scales with the viewBox. Wide (vb 560, 12px) rendered at wrapper 480px = 12*480/560 = 10.29px. Narrow (vb 360, 11.5px) at wrapper 479px = 11.5*479/360 = 15.30px. So crossing one pixel, 479 -> 480, pole labels SHRINK 15.3px -> 10.3px, a 33% drop, and stay below the spec's own stated 11px floor for the whole 480-513px range (wide only reaches 11px at wrapper 513px). Rendered height jumps 552*479/360 = 734px down to 444*480/560 = 380px at the same pixel — the graphic nearly halves as its container grows. The section is titled 'this is how too-small-to-read is fixed'. It is how it is reintroduced, monotonically backwards.
- THE PRO-FORMA INVARIANT IS WIRED TO TWO DIFFERENT PROPERTY NAMES. Section 8 asserts on `a.left_pole`/`a.right_pole`; the renderer's `assertPoles` asserts on `a.left`/`a.right` and the row code reads `a.left`/`a.right`. audit/compass-data.revised.json ships `left_pole`/`right_pole`; theology-compass.html's AXES ships `left`/`right`. So an implementer feeding the audited JSON throws on axis 0; one feeding the demo array gets a guard that is structurally incapable of firing. The single line whose whole job is 'the last failure cannot silently return' is the line that is ambiguous.
- NARROW GEOMETRY DOES NOT CLOSE. Prose section 2 gives the narrow cradle as y=34, height=500 (34 -> 534). The renderer computes top = (pad + rows.track - r) - 4 = (16 + 50 - 10) - 4 = 52 and bot = 16 + 5*90 + 50 + 10 + 4 = 530. Three different columns: 34->534, 52->530. The brand rule is prose y=6, code y = pad-12 = 4. The wide numbers do reconcile, which is the tell: only one profile was ever checked. `var top = px(0)*0 + ...` in the shipped snippet is dead arithmetic — this code was never run.
- HOVER GREYS OUT THE ENTIRE GRAPHIC. `.compass-svg:hover .cmp-row:not(:hover){opacity:.40}` — an SVG `<g>` only receives pointer events on its painted children, and the rows have no hit area. Move the cursor into the panel but between a knob and a label (most of the surface) and the svg is hovered while no row is, so all six rows satisfy `:not(:hover)` and the whole compass drops to 40%. It will flicker constantly under a moving mouse. Meanwhile the spec proudly states the interaction 'carries no information' — so it has shipped six keyboard tab stops and a full-surface flicker in exchange for nothing.
- THE BAND-2 ROW STILL NAMES A POLE. `lean()` returns '16% toward Monergist' for score 42, which is band 2. The spec prints that string, muted and centred, inside the zone whose entire meaning is 'names no position'. Setting it in grey is not suppression. The audited middle-band copy already exists and is better prose — bands[2] is 'balanced on grace', 'between sacramental and memorial', 'open but cautious on the gifts' — and the spec leaves it unused on the graphic while duplicating it into the aria-label, so screen-reader users get the audited voice and sighted users get a percentage the rule forbids.
- THE CRADLE IS UNREADABLE EXACTLY WHERE IT IS NEEDED. computeScores yields only 13 reachable values per axis (0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100). The only scores that ever sit near a cradle edge are 42 and 58, which land 1.5 score-units inside it — 7.6px in the wide profile, 5px in narrow — against a 4.5% tint that pitfall 6 insists must be barely perceptible. So on the two boundary cases the device exists to explain, no reader can tell whether the knob is inside the box, while the copy silently switches from a coloured claim to grey. The spec's long argument about drawing hairlines at 59.5 rather than 60 defends against a score of 59, which this quiz cannot produce.
- SIX HALF-EMPTY TROUGHS. The bar grows from centre toward the leaning pole, so on a firmly monergist axis the entire right half of the rail is bare grey underneath the word 'Synergist'. It is a softer replay of last time's failure: the opposite pole is named but visually inert, nothing about the graphic says that half is live territory. Both poles are lettered; only one is inhabited.
- IT IS INERT IN A PAGE WHOSE VALUE IS THE PROSE BEHIND IT. Each axis carries a 99-257 word two-pole summary, 8-10 dated history entries, 7-10 passages, and readMore split by pole — and the existing page already renders them in `<details class="acc">` accordions (line 1082). The hero is specified as `role="img"` with an interaction that by design leads nowhere. The one element every reader looks at first is given no job beyond being looked at.
- COLOUR TOKENS CONTRADICT THE PLATFORM RULE. Pitfall 12 says the renderer must take `colorToken` per axis and never hard-code six axes; the renderer then writes `'var(--ax' + i + ')'` from the loop index and the CSS defines --ax0..--ax5. The live data uses `token: "--grace"`, `"--table"`, `"--spirit"`, `"--kingdom"`, `"--tradition"`, `"--worship"`. A second quiz gets the Grace blue on its first category by accident.
- THE JUSTIFICATION ANSWERS THE WRONG QUESTION. Roughly 600 words of Cleveland & McGill on why position-along-a-common-scale beats angle and area. All true; none of it responds to the brief, which is that the last several attempts were rejected for being BORING. 'Optimally legible' is the argument for a utility chart in a report. The one place the spec could have been visually generous — the brand gradient — is spent on a 3px decorative sliver at the top that touches nothing.

### What must survive

- The two-pole labels printed unconditionally on every row, left-anchored and right-anchored — this is the correct structural fix for the failure that shipped last time, and the argument for why a wheel cannot do it (twelve labels, rotated text, 'Bible & tradition' on a curve) is right and should be kept verbatim as the record of why radial was rejected.
- The refusal to draw a connecting polyline through the six knobs. The axes share no units and a contour would imply an interpolation the audit would never license. Keep this pitfall word for word.
- The measured -ink token pair per axis. The contrast numbers check out (gold #7A5206 on #EEEEEE computes to 5.98 against the claimed 5.96; muted #5E6470 computes to 5.16 against the claimed 5.12), and the underlying point — orange 3.20, gold 2.54, green 4.35 all fail AA as text — is real and non-obvious. Raw hue for bars and knobs, -ink for type, always.
- The layered-opacity idiom: low-opacity tint under a fully solid knob with a card-coloured separation ring. It is a faithful port of what already reads well on the live page (.fill opacity .35, .marker with 3px card border and 1.5px hue ring, lines 241-244) and it is the specific thing that must not be flattened into one saturated block.
- clip-path: inset() for the entrance rather than transform: scaleX(), with the stated reason — scaling a rounded rect distorts its corner radii mid-flight. Correct and worth keeping as a pitfall.
- The insistence that no pole name is ever truncated, ellipsised, rotated, or textLength-squeezed, and that the fix for a future collision is a longer row, not a shorter word.
- Defining the dark palette in BOTH @media (prefers-color-scheme: dark) :root:not([data-theme="light"]) AND :root[data-theme="dark"], so the manual toggle works in both directions.
- The centrist case treated as a composed picture with a caption rather than an empty state or an error branch. The instinct is right even though the plumb-line framing of it is not.
- The always-present <details> text alternative kept in the DOM when collapsed, listing all six axes as a <dl>.
- Band hairlines placed at the exact arithmetic boundaries (20.5 / 40.5 / 59.5 / 79.5) so the drawing and band() can never disagree — the reasoning is sound even though this quiz's 13 reachable scores mean the 59-vs-60 case never actually occurs.

### Rewritten spec

REWRITE OF THE WEAKEST THIRD — replaces section 1 (geometry), section 2 steps 2/3/4a/4b (cradle, spine, track, hairlines), the reading-line rule in 2e, and the interaction half of section 7. Everything not named here stands: keep the -ink contrast tokens, the .30-tint-under-solid-knob layering, the clip-path entrance, the unconditional two-pole labels, the always-present <details> alternative, the centrist caption.

FIRST, TWO GLOBAL CORRECTIONS

(a) Rename the concept. Not "The Plumb Line" — it makes the centre a standard and every conviction a deviation from it, which contradicts the audited rule that a midpoint names no position. Call it THE RAILS. Six rails, each with two named ends and a marker on it. Neutral, tactile, describes the object, asserts nothing.

(b) Settle the data contract in one place: `{ key, name, left, right, bands[5], token }` — `left`/`right`/`token` exactly as theology-compass.html line 533ff already supplies them. If the caller passes audit JSON, it maps `left_pole -> left`, `right_pole -> right` at the boundary; the renderer never sees `_pole`. `assertPoles` checks `a.left && a.right && a.token` and nothing else, in exactly one place. Colour is always `var(${a.token})`, never `--ax${i}`.

1. GEOMETRY — 1:1 viewBox, so type never scales at all

Delete both fixed viewBoxes. The SVG's viewBox width equals its rendered CSS pixel width, so one user unit is one CSS pixel and every label renders at its authored size at every container width. This removes the failure mode outright instead of managing it.

  const Wc = Math.max(320, Math.min(host.clientWidth, 560));   // measured, clamped
  svg.setAttribute('viewBox', `0 0 ${Wc} ${H}`);               // H computed below
  // CSS: .compass-svg { display:block; width:100%; height:auto; overflow:visible }

Two LAYOUT profiles remain, but they now differ only in where things sit, never in type size. Switch at Wc >= 440 (chosen because the widest single-line row — "Bible & tradition" ~112px + "Authority" italic 15px ~62px + "Scripture alone" ~99px = 273px — still leaves ~40px per gap inside 440 - 52 margins).

WIDE (Wc >= 440): M = 26, pad = 22, P = 74, track height th = 22, knob r = 9, ring r = 10.5
  rowTop(i)      = 22 + 74i            ->  22, 96, 170, 244, 318, 392
  line 1 baseline = rowTop + 12         left pole (start, x=M), axis name (middle, x=CX), right pole (end, x=Wc-M)
  trackY(i)      = rowTop + 36
  read baseline  = rowTop + 62
  H = rowTop(5) + 62 + 10 = 464

NARROW (Wc < 440): M = 16, pad = 18, P = 92, th = 20, knob r = 8.5, ring r = 10
  rowTop(i)      = 18 + 92i
  name baseline  = rowTop + 13          axis name alone, start at x=M
  pole baseline  = rowTop + 31          left pole start, right pole end
  trackY(i)      = rowTop + 54
  read baseline  = rowTop + 78
  H = rowTop(5) + 78 + 10 = 566

Derived, never hand-written: W = Wc - 2M; x1 = M + W; CX = M + W/2; px(S) = M + W*S/100.
Type sizes are absolute and identical in both profiles: poles Poppins 500 12px, axis name DM Serif Display italic 15px, reading Poppins 500 11px. Nothing ever renders below 11px at any width, at 320px or 560px, because nothing scales.

Re-render on ResizeObserver, debounced 120ms, when the profile flips OR |Wc - lastWc| >= 8. Height changes 566 -> 464 at the breakpoint; that is a 102px reflow, acceptable, and unlike the original there is no 354px jump and no type inversion.

2. THE RAIL — both halves alive (replaces draw steps 4a and 4b)

The old track was a grey trough with one half filled, which leaves the named opposite pole sitting over dead ground. Replace with two stacked rects per row:

  a. base:  <rect x=M y=trackY-th/2 width=W height=th rx=th/2 fill="var(--cmp-track)"/>
  b. rail:  same rect, fill="url(#cmpRail{i})"

  <linearGradient id="cmpRail{i}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0"   style="stop-color:var({a.token})" stop-opacity=".09"/>
    <stop offset=".5"  style="stop-color:var({a.token})" stop-opacity=".015"/>
    <stop offset="1"   style="stop-color:var({a.token})" stop-opacity=".09"/>
  </linearGradient>

Symmetric in the axis's OWN hue, so neither pole is warmer, cooler, or brighter than the other — the whole rail belongs to Grace, and conviction visibly lives at both ends while the middle fades toward nothing. That is the audited semantics rendered in the substrate, and it is a third layer of opacity (.015 -> .09 rail, .30 lean bar, 1.0 knob) rather than the flat grey-plus-one-fill the original specifies. It also finally makes the brand gradient logic (soft-to-warm) structural instead of a 3px garnish; delete the decorative top rule entirely.

3. THE NO-CLAIM ZONE — at the knob, not behind everything (replaces steps 2 and 3)

DELETE the 4.5% full-height cradle column. It is invisible where it matters (the only near-boundary scores, 42 and 58, sit 7.6px inside its edge), it forces the 15px serif axis names to sit on a tinted box, and it is the element that makes the centre read as normative. Replace with three things:

  a. Centre hairline, continuous, drawn behind all tracks — this keeps the "one object" reading without erecting a standard:
     <line x1=CX y1={trackY(0)-th/2-4} x2=CX y2={trackY(5)+th/2+4} stroke="var(--cmp-hair)" stroke-opacity=".55" stroke-width="1"/>
     Wide: y 43 -> 443. Narrow: y 58 -> 546. Both computed from the same formula the rows use, so prose and code cannot diverge.

  b. Caliper ticks per row, marking the audited middle band as an interval on the rail rather than a wash behind it. At px(40.5) and px(59.5), from trackY - th/2 - 5 to trackY + th/2 + 5, stroke var(--cmp-hair), opacity .85, width 1. They read as measurement marks. Keep the existing 20.5 / 79.5 ticks inside the track (±7 from trackY, opacity .5) for texture and honesty about the firm/leaning boundary.

  c. THE KNOB CARRIES THE RULE. Three states, distinguished by SHAPE as well as colour so nothing is encoded by hue alone:

     band 0/1/3/4 — CLAIMED:
       ring:  <circle r={kr+1.5} fill="none" stroke="var({token})" stroke-opacity=".9" stroke-width="1.5"/>
       core:  <circle r={kr}     fill="var({token})" stroke="var(--cmp-card)" stroke-width="3"/>
       lean fill at fill-opacity var(--cmp-fill-o) = .30 light / .34 dark

     band 2 — NO CLAIM (hollow):
       ring:  <circle r={kr+1.5} fill="none" stroke="var({token})" stroke-opacity=".35" stroke-width="1"/>
       core:  <circle r={kr}     fill="var(--cmp-card)" stroke="var({token})" stroke-width="2"/>
       dot:   <circle r="3"      fill="var({token})" fill-opacity=".55"/>
       lean fill at var(--cmp-fill-o-mid) = .12 light / .14 dark — the measurement is still shown, at a
       weight that visibly declines to assert. Do not omit it; a score of 42 is a real 8-unit reading.

     score exactly 50 — omit the fill entirely, hollow knob, nothing else changes.

  A hollow knob is instantly legible as "not filled in yet / no position taken", it survives greyscale and colour-blind viewing, it works at 380px, and it puts the audited rule where the eye already is. Add tokens: --cmp-fill-o-mid:.12 (light) / .14 (dark).

4. THE READING LINE — the audited adjective on the graphic (replaces 2e's reading rule)

  band 0/1/3/4: text = `${lean(a, s)} · ${a.bands[b]}`  e.g. "33% toward Monergist · monergist-leaning"
                anchored to the leaning end (s < 50: start at x=M; s > 50: end at x=x1)
                lean portion fill var({token}-ink); render as one <text> with two <tspan>s, the second
                fill="var(--cmp-muted)". Never the raw axis colour for text — the -ink tokens are load-bearing.
  band 2:       text = a.bands[2] ONLY — "balanced on grace" — text-anchor=middle at x=CX, fill var(--cmp-muted).
                DO NOT print lean() here. It returns "16% toward Monergist" for score 42 and naming a pole
                inside the no-claim band is precisely the incoherence a discernment reader screenshots.

  Width guard, no truncation ever: after insert, if `t.getComputedTextLength() > W` (only reachable on the
  Authority row at narrow widths: ~348px of text in a 288-332px rail), re-render that one row's reading as
  `a.bands[b]` alone, which always fits and is the richer string. One measured fallback, one row at a time.
  Never ellipsis, never textLength, never rotate.

  This puts the best copy in the product — the audited band adjectives — on the hero instead of hiding it in
  the aria-label, and it removes the sighted/screen-reader asymmetry the original shipped.

5. INTERACTION — six stops that mean something (replaces section 7's hover/focus)

  a. Fix the hit area. Every row group's FIRST child is a full-bleed transparent target; without it, hovering
     the gaps dims the whole graphic:
       <rect class="cmp-hit" x="0" y={rowTop} width={Wc} height={P} fill="transparent"/>
     (fill="transparent" receives pointer events; fill="none" does not. This is the bug.)

  b. Make the row a real link, not a tabindex'd <g>. SVG <a> is natively focusable and keyboard-activatable:
       <a class="cmp-row" href="#axis-{a.key}" role="link"
          aria-label="{name}, {left} to {right}. {lean}. {bands[b]}. Opens the full axis.">
     On activate: preventDefault, `document.getElementById('axis-'+a.key)` (the existing <details class="acc">,
     theology-compass.html line 1082) gets `open = true`, `scrollIntoView({block:'start', behavior: reduced() ? 'auto' : 'smooth'})`,
     and focus moves to its <summary>. The hero becomes the table of contents for the two-pole summary, the
     8-10 dated history entries, the passages, and the readMore split by pole. Six tab stops now do a job.

  c. Hover/focus, scoped so it cannot misfire:
       .compass-svg:has(.cmp-row:hover) .cmp-row:not(:hover) { opacity:.55 }
       .cmp-row:hover .cmp-ring, .cmp-row:focus-visible .cmp-ring { stroke-width:2.5; stroke-opacity:1 }
       .cmp-row { transition: opacity .18s ease }
     Browsers without :has() simply get no dimming — a no-op, not a broken state. Use .55, not .40; .40 on a
     #EEEEEE panel is a heavy blink for a decorative effect.

  d. Focus ring: do not rely on CSS `outline` on SVG elements (Safari will not paint it, and border-radius on
     a <g> does nothing). Draw it:
       <rect class="cmp-focus" x=M-6 y={rowTop+2} width={W+12} height={P-8} rx="12" fill="none"
             stroke="var(--cmp-ink)" stroke-width="2" opacity="0"/>
       .cmp-row:focus-visible .cmp-focus { opacity:1 }

6. TWO CORRECTNESS FIXES CARRIED OVER

  - assertPoles, one implementation, checking `a.left && a.right && a.token`, called before any drawing, with
    the message naming the axis. Section 8's `left_pole` variant is deleted; mapping happens at the data boundary.
  - Drop `requestAnimationFrame ? setTimeout(...) : ...` — it tests whether rAF EXISTS (it always does) not
    whether it FIRES, which is the actual local-preview hazard. Just `setTimeout(() => host.classList.add('is-in'), 20)`.

7. WHAT THIS BUYS, STATED PLAINLY

  A reader who glances for one second sees six rails, each lettered at both ends, each faintly tinted at both
  ends in its own colour, with a solid coloured marker sitting somewhere along it — or, where they hold no
  conviction, a hollow one resting near the middle between two caliper marks. Solid means "you hold this",
  hollow means "you don't, and we will not pretend otherwise". Nothing implies the middle is correct. Nothing
  scales below 11px. Both halves of every axis are visibly alive. And clicking any rail opens the audited prose
  behind it, which is the only thing on the page anyone will actually remember.


---

# Axis bar and colour treatment

**Critic verdict: `needs-work`**

## Concept

One axis = one calm horizontal rail with a dead-centre tick, both pole names always printed at its two ends, a low-opacity tinted fill that grows out of the centre toward the answer, and a single solid full-colour knob sitting on top. Depth comes from four stacked opacity tiers of the same hue (rail ~0.09 → fill 0.10→0.38 gradient → halo 0.10 → knob 1.00), never from one saturated slab. The audited band adjective ("monergist-leaning") becomes the row's serif readout, the lean percentage its quiet subtitle, and the pole you lean toward is emphasised in weight and colour while the opposite pole stays present and legible — so the bipolar premise is visible even at a glance.

## Why it works

A viewer reads this row in three passes and each pass must survive on its own. Pass one is peripheral: they see a colour column down the left edge, six rails, and six knobs at different offsets — the shape of a person. Pass two is the knob: it is the only fully saturated, fully opaque, shadow-bearing object in the row, so the eye lands there first and instantly and correctly reads "this is my position". Pass three is language: the serif band adjective and the pole names tell them what that position is called. Layered opacity does the perceptual work that flat fill cannot: because the fill is the same hue at 10–38% and the knob is the same hue at 100%, the knob reads as the *concentrated* version of the fill rather than a separate object, which makes the bar feel like one continuous gesture from centre to conviction. The gradient fading toward the centre removes the hard vertical edge at 50% that otherwise makes the midpoint look like a wall; instead the colour appears to emerge from the tick, which is exactly the mental model — you started neutral and moved. Both pole names are always rendered at equal size because the previous attempt proved the failure: a viewer who sees "Liturgical" with nothing opposite concludes the instrument has a preferred side, and this audience screenshots that. Emphasis (weight + darker hue) rather than omission carries the lean, so nothing is hidden and the neutral case is expressible — at band 2 neither pole is emphasised and the knob goes hollow, which is the audited "a midpoint is not a conviction" rule rendered as a picture instead of asserted as a sentence. Text never uses the raw brand hue: #C98A12 gold on #EEEEEE is 2.5:1 and would make the most rigorous product on the internet fail a basic contrast check on screenshot.

## Specification

STRUCTURE (one row, top to bottom)

1. Header line — two blocks in a flex row, `align-items: baseline`, `gap: 16px`, `flex-wrap: wrap`.
   - Left: axis name. Poppins 600, 11.5px, `letter-spacing: .13em`, `text-transform: uppercase`, colour `var(--c-text)`. Preceded by the colour stub (below).
   - Right (`margin-left: auto`, `text-align: right`): two stacked lines.
     - Band adjective — DM Serif Display, italic, 17px, `line-height: 1.15`, colour `var(--ink)`, first letter capitalised: "Monergist-leaning". This is the audited bands[] copy, used verbatim, never paraphrased.
     - Lean line — Poppins 500, 12px, `font-variant-numeric: tabular-nums`, colour `var(--muted)`, `margin-top: 3px`: "32% toward Monergist".
2. Track — 22px tall positioning box, `margin: 12px 0 9px`, `aria-hidden="true"`. Contains rail (clipped), tick, halo, knob.
3. Pole line — flex `justify-content: space-between`, `gap: 14px`. Left pole name left-aligned, right pole name right-aligned. Poppins 500, 12.5px, colour `var(--muted)`, `max-width: 47%`, `overflow-wrap: normal`, never truncated or ellipsised. The pole on the leaning side gets `font-weight: 600; color: var(--c-text);`.

TRACK GEOMETRY

- `.axis-track { position: relative; height: 22px; }`
- `.axis-rail { position: absolute; inset: 6px 0; height: 10px; border-radius: 999px; overflow: hidden; background: rgb(var(--c-rgb) / var(--rail-a)); box-shadow: var(--rail-inset); }`
  The rail is tinted with the axis hue at very low alpha, not neutral grey — so the fill reads as the same colour intensified, and the six rows stay individually identified even at zero lean.
- Pole end caps, inside the rail: `position:absolute; top:0; bottom:0; width:2px; border-radius:1px; background: rgb(var(--c-rgb) / var(--cap-a));` at `left:3px` and `right:3px`. They tell the viewer the rail's ends are the poles named underneath.
- Centre tick, sibling of the rail so it is not clipped: `left:50%; top:0; width:1px; height:22px; transform:translateX(-.5px); border-radius:1px; background: var(--tick);` — neutral grey, never the axis colour, because the centre belongs to neither pole.
- Fill, inside the rail: `top:0; bottom:0;`
  - `data-side="right"` → `left:50%; width: calc(var(--lean) * 1%); border-radius: 0 999px 999px 0;` gradient direction `to right`.
  - `data-side="left"`  → `right:50%; width: calc(var(--lean) * 1%); border-radius: 999px 0 0 999px;` gradient direction `to left`.
  - `--lean` is the raw integer `|score - 50|` (0–50). Because the fill spans the full 0–100 track, 1 unit = 1% width.
  - Gradient (light): `linear-gradient(to <away-from-centre>, rgb(var(--c-rgb)/.10) 0%, rgb(var(--c-rgb)/.30) 55%, rgb(var(--c-rgb)/.38) 100%)`. Faintest at the centre, strongest under the knob.
  - Gradient (dark): same stops at `.14 / .36 / .46`.
- Halo: `left: var(--pos); top:50%; width:30px; height:30px; border-radius:50%; transform: translate(-50%,-50%); background: rgb(var(--c-rgb) / var(--halo-a)); pointer-events:none;` — `--halo-a` .10 light, .16 dark.
- Knob: `left: var(--pos); top:50%; width:18px; height:18px; border-radius:50%; transform: translate(-50%,-50%); background: rgb(var(--c-rgb)); border: 3px solid var(--panel); box-shadow: var(--knob-shadow), 0 0 0 1px rgb(var(--c-rgb) / var(--knob-ring));`
  The 3px panel-coloured border punches a visible gap between knob and fill — that gap is what makes the knob read as *on top of* the bar rather than *part of* it. The 1px outer hairline at 35–45% re-attaches it to the hue family.
  `--knob-shadow`: light `0 1px 3px rgba(68,68,68,.20)`; dark `0 1px 4px rgba(0,0,0,.45)`. Never harder than this — the page's shadow language is `3px 3px 5px rgba(68,68,68,.065)`.
- Overhang: at score 0 or 100 the knob's centre sits on the rail end and it overhangs 12px. `.axis-row` therefore uses `padding: 18px 14px;` and the track is not `overflow:hidden`. Do NOT solve this by insetting the knob's travel — that would decouple knob centre from fill edge.

OPACITY LAYERING (the whole point)

Light theme, all in the same hue: rail 0.09 → fill 0.10 at centre rising to 0.38 at the knob → halo 0.10 → knob 1.00. Four tiers, three of them under 0.4. Dark theme: 0.16 → 0.14–0.46 → 0.16 → 1.00, with the hue itself lightened (below) because a 30%-alpha #2F4FCB over a #232323 panel is invisible. If it looks weak next to a flat-fill mockup, that is correct; the knob is the only thing that should shout.

COLOUR TOKENS (exact)

Per axis set three variables on `.axis-row`: `--c-rgb` (graphic, space-separated triple), `--c-text` (typography only).

Light theme — `--c-rgb` / `--c-text`:
  Grace     47 79 203     / #2F4FCB
  Table     158 42 59     / #9E2A3B
  Gifts     226 88 43     / #B44A1E
  Kingdom   46 125 79     / #276B43
  Authority 201 138 18    / #8A5E08
  Worship   106 75 192    / #6A4BC0
(Gifts, Kingdom and Authority are darkened for text only — the raw brand hues score 3.2:1, 4.3:1 and 2.5:1 on #EEEEEE. The graphic keeps the brand hues.)

Dark theme — `--c-rgb` / `--c-text` (hues lifted ~30% and ~45% toward white):
  Grace     109 132 219 / #8D9EE2
  Table     187 106 118 / #CA8A93
  Gifts     235 138 107 / #EFA38A
  Kingdom   109 164 132 / #8CB79E
  Authority 217 173 89  / #E1BF7D
  Worship   151 129 211 / #AD9CDC

Shared per-theme tokens:
  light: `--rail-a:.09; --cap-a:.28; --halo-a:.10; --knob-ring:.35; --tick:rgba(68,68,68,.20); --rail-inset: inset 0 1px 2px rgba(68,68,68,.055); --sep: rgba(68,68,68,.09);`
  dark:  `--rail-a:.16; --cap-a:.34; --halo-a:.16; --knob-ring:.45; --tick:rgba(255,255,255,.22); --rail-inset: inset 0 1px 2px rgba(0,0,0,.30); --sep: rgba(255,255,255,.08);`

BAND ADJECTIVES — how they are surfaced

Bands are computed with the audited `band(s)` boundaries and nothing else: 0 ≤20, 1 21–40, 2 41–59, 3 60–79, 4 ≥80. Because only 13 scores are reachable (0, 8, 17, 25, 33, 42, 50, 58, 67, 75, 83, 92, 100), band 2 is exactly {42, 50, 58}. Set `data-band` on the row from that function; do not invent a new threshold and do not derive the band from the rounded lean percentage.

The adjective is the row's headline readout (serif italic, right of the axis name). It is the highest-value unused copy in the dataset and it is the only place the five-step scale is named in words. Do not also print the numeric score — 34/100 invites the "grade" misreading the audit already ruled out.

Lean copy by case:
  score 0    → "at the Monergist pole"      (band 0)
  score 100  → "at the Synergist pole"      (band 4)
  bands 0,1,3,4 otherwise → "<round(|s-50|/50*100)>% toward <pole>"
  band 2, score ≠ 50 → "<n>% off centre, inside the middle band" — the number stays (nothing is hidden) but no pole is named
  score 50   → "at the centre"
Adjective in band 2 is the audited middle adjective, e.g. "Balanced on grace" — it names no pole, so it is safe to display.

STATE: NEAR CENTRE (data-band="2")

Draw almost nothing.
- Fill: rendered at its true width (8% of the track at scores 42/58) but the gradient's top stop drops from .38 to .22 and the mid stop to .18, so it is a whisper.
- Knob becomes hollow: `width:14px; height:14px; background: var(--panel); border: 3px solid rgb(var(--c-rgb) / .55); box-shadow: none;` Solid = a conviction; hollow = a position without one.
- Halo suppressed (`--halo-a: 0`).
- Centre tick strengthens: `rgba(68,68,68,.30)` light / `rgba(255,255,255,.32)` dark — it becomes the row's mark.
- Neither pole name is emphasised; both stay `var(--muted)` at weight 500.
- At exactly 50 the fill has `width:0` and is not painted at all.
The geometry still tells the truth (a 42 knob sits left of centre); only the *words* refuse to name a position. That distinction is the audited rule and should be stated once, above the six rows, in a single shared caption: "The middle band names no position — the two sides pull about equally." One caption for the set, never repeated per row.

STATE: EXTREME POLE (score 0 or 100)

- The end cap at that pole goes to `width:3px; background: rgb(var(--c-rgb));` full opacity — the rail terminates in a solid mark.
- Fill spans the full half; its outer radius matches the rail's 999px so the two ends merge.
- Halo `--halo-a` rises to .14 light / .20 dark.
- The reached pole name goes `font-weight:700` and gains `text-decoration: underline; text-decoration-color: rgb(var(--c-rgb)/.45); text-underline-offset: 5px; text-decoration-thickness: 2px;`
- The opposite pole name is unchanged and fully legible. It is never dimmed further, greyed out, or struck.

HOVER / FOCUS

Scoped to the whole row (`@media (hover: hover)` for hover; identical block for `:focus-visible`):
- `--rail-a` 0.09→0.13 (dark 0.16→0.21); fill top stop 0.38→0.44 (dark 0.46→0.52) via a `--fill-hi` variable used in the gradient.
- Knob `transform: translate(-50%,-50%) scale(1.12)`; halo 30px→38px and `--halo-a` 0.10→0.16.
- The non-leaning pole name lifts from `var(--muted)` to `var(--ink)` so both are equally readable while inspecting.
- Transition: `200ms cubic-bezier(.2,.7,.3,1)` on transform, width, height, background-color.
- Nothing is revealed on hover that is not already visible. Hover adds emphasis, never information.
- `:focus-visible` additionally: `outline: 2px solid var(--focus); outline-offset: 6px; border-radius: 16px;` The row is only focusable when it is used as the `<summary>` of the axis `<details>`; a standalone row is a plain `<div>` with no tabindex.
- `@media (prefers-reduced-motion: reduce)`: all transitions `none`; the knob does not scale — instead the outer hairline ring goes from 1px to 2px so the feedback is still unmistakable.

ENTRY ANIMATION

Render each row with `--lean:0; --pos:50%`, then in a `setTimeout(fn, 30)` swap in the real values with `transition: width 520ms cubic-bezier(.22,.85,.3,1) var(--delay), left 520ms cubic-bezier(.22,.85,.3,1) var(--delay)`, `--delay: calc(var(--i) * 60ms)`. Six rows unfurl from the centre in 0.8s total. Do not gate this on `requestAnimationFrame` — it never fires in the project's embedded browser pane — and the end state must be correct even if the transition never runs. Skipped entirely under reduced motion.

SIX ROWS AS A SET

- `.axis-rows` is a plain stack; rows in canonical order (Grace, Table, Gifts, Kingdom, Authority, Worship). Never sort by lean strength: a descending staircase reads as a ranking and implies the six axes are commensurable magnitudes, which they are not.
- Colour stub: `position:absolute; left:0; top:20px; width:3px; height:26px; border-radius:999px; background: rgb(var(--c-rgb) / .9);` on each row. Stacked, the six stubs form a colour column down the left edge that echoes the existing 6-stripe brand bar. This, plus the varying knob positions, is what supplies rhythm — the geometry itself stays rigidly constant.
- Separator between rows: a 1px hairline that fades at both ends, `background: linear-gradient(to right, transparent, var(--sep) 12%, var(--sep) 88%, transparent);` — no hard borders anywhere, per the locked visual language.
- Identical row height and type scale on all six. Variation comes only from hue, knob position, and copy length.
- Vertical rhythm: `padding: 18px 14px` per row, ≈104px tall desktop, ≈122px mobile.

RESPONSIVE

- ≥560px: as specced.
- 421–560px: band adjective 16px.
- ≤420px: header wraps — the right block loses `margin-left:auto` and `text-align:right`, becoming a left-aligned block under the axis name with 5px gap. Rail 9px, knob 16px (hollow 13px), halo 26px, row padding `16px 12px`, pole names 12px, band adjective 15px.
- ≤380px: pole names 11.5px. Both pole names must still render in full; if one wraps to two lines, let it wrap — never ellipsise, never abbreviate "Bible & tradition".

ACCESSIBILITY

- `.axis-track` carries `aria-hidden="true"`. Everything it encodes is already in visible text: axis name, band adjective, lean sentence, both pole names. No double announcement, no invented alt sentence to keep in sync.
- Colour is never the sole carrier of the lean: it is also weight (600 vs 500 on the pole name) and an explicit sentence.
- Contrast: every text colour listed above clears 4.5:1 on its theme's panel (#EEEEEE light, #232323 dark). `--muted` must clear 4.5:1 too — the pole names are content, not decoration.
- The knob is not a control: no `tabindex`, no `role`, no click handler.
- When wrapped in `<details>`, `summary { list-style:none; display:block; cursor:pointer; }` and the chevron sits in the header's right block; the bar stays inside `<summary>` so it is visible whether or not the row is expanded.

## Markup sketch

```html
&lt;style&gt;
:root{
  --panel:#EEEEEE; --ink:#444444; --muted:#6B6B6B; --focus:#2F4FCB;
  --rail-a:.09; --cap-a:.28; --halo-a:.10; --knob-ring:.35; --fill-lo:.10; --fill-mid:.30; --fill-hi:.38;
  --tick:rgba(68,68,68,.20);
  --rail-inset:inset 0 1px 2px rgba(68,68,68,.055);
  --knob-shadow:0 1px 3px rgba(68,68,68,.20);
  --sep:rgba(68,68,68,.09);
}
:root[data-theme="dark"]{
  --panel:#232323; --ink:#EDEDED; --muted:#A6A6A6; --focus:#8D9EE2;
  --rail-a:.16; --cap-a:.34; --halo-a:.16; --knob-ring:.45; --fill-lo:.14; --fill-mid:.36; --fill-hi:.46;
  --tick:rgba(255,255,255,.22);
  --rail-inset:inset 0 1px 2px rgba(0,0,0,.30);
  --knob-shadow:0 1px 4px rgba(0,0,0,.45);
  --sep:rgba(255,255,255,.08);
}
/* per-axis hue: graphic triple + a separate, contrast-safe text colour */
.axis-row[data-axis="grace"]    {--c-rgb:47 79 203;  --c-text:#2F4FCB;}
.axis-row[data-axis="table"]    {--c-rgb:158 42 59;  --c-text:#9E2A3B;}
.axis-row[data-axis="gifts"]    {--c-rgb:226 88 43;  --c-text:#B44A1E;}
.axis-row[data-axis="kingdom"]  {--c-rgb:46 125 79;  --c-text:#276B43;}
.axis-row[data-axis="authority"]{--c-rgb:201 138 18; --c-text:#8A5E08;}
.axis-row[data-axis="worship"]  {--c-rgb:106 75 192; --c-text:#6A4BC0;}
:root[data-theme="dark"] .axis-row[data-axis="grace"]    {--c-rgb:109 132 219;--c-text:#8D9EE2;}
:root[data-theme="dark"] .axis-row[data-axis="table"]    {--c-rgb:187 106 118;--c-text:#CA8A93;}
:root[data-theme="dark"] .axis-row[data-axis="gifts"]    {--c-rgb:235 138 107;--c-text:#EFA38A;}
:root[data-theme="dark"] .axis-row[data-axis="kingdom"]  {--c-rgb:109 164 132;--c-text:#8CB79E;}
:root[data-theme="dark"] .axis-row[data-axis="authority"]{--c-rgb:217 173 89; --c-text:#E1BF7D;}
:root[data-theme="dark"] .axis-row[data-axis="worship"]  {--c-rgb:151 129 211;--c-text:#AD9CDC;}

.axis-row{position:relative;padding:18px 14px;--delay:calc(var(--i,0) * 60ms);}
.axis-row + .axis-row::before{content:"";position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(to right,transparent,var(--sep) 12%,var(--sep) 88%,transparent);}
.axis-stub{position:absolute;left:0;top:20px;width:3px;height:26px;border-radius:999px;
  background:rgb(var(--c-rgb)/.9);}

.axis-head{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;}
.axis-name{font:600 11.5px/1.2 Poppins,system-ui,sans-serif;letter-spacing:.13em;
  text-transform:uppercase;color:var(--c-text);}
.axis-read{margin-left:auto;text-align:right;}
.axis-band{font:italic 400 17px/1.15 "DM Serif Display",Georgia,serif;color:var(--ink);}
.axis-lean{margin-top:3px;font:500 12px/1.3 Poppins,system-ui,sans-serif;
  font-variant-numeric:tabular-nums;color:var(--muted);}

.axis-track{position:relative;height:22px;margin:12px 0 9px;}
.axis-rail{position:absolute;inset:6px 0;height:10px;border-radius:999px;overflow:hidden;
  background:rgb(var(--c-rgb)/var(--rail-a));box-shadow:var(--rail-inset);
  transition:background-color 200ms cubic-bezier(.2,.7,.3,1);}
.axis-cap{position:absolute;top:0;bottom:0;width:2px;border-radius:1px;
  background:rgb(var(--c-rgb)/var(--cap-a));}
.axis-cap.l{left:3px;} .axis-cap.r{right:3px;}
.axis-fill{position:absolute;top:0;bottom:0;width:calc(var(--lean,0) * 1%);
  transition:width 520ms cubic-bezier(.22,.85,.3,1) var(--delay);}
.axis-row[data-side="right"] .axis-fill{left:50%;border-radius:0 999px 999px 0;
  background:linear-gradient(to right,rgb(var(--c-rgb)/var(--fill-lo)) 0%,
    rgb(var(--c-rgb)/var(--fill-mid)) 55%,rgb(var(--c-rgb)/var(--fill-hi)) 100%);}
.axis-row[data-side="left"] .axis-fill{right:50%;border-radius:999px 0 0 999px;
  background:linear-gradient(to left,rgb(var(--c-rgb)/var(--fill-lo)) 0%,
    rgb(var(--c-rgb)/var(--fill-mid)) 55%,rgb(var(--c-rgb)/var(--fill-hi)) 100%);}
.axis-tick{position:absolute;left:50%;top:0;width:1px;height:22px;transform:translateX(-.5px);
  border-radius:1px;background:var(--tick);}
.axis-halo,.axis-knob{position:absolute;left:var(--pos,50%);top:50%;border-radius:50%;
  transform:translate(-50%,-50%);
  transition:left 520ms cubic-bezier(.22,.85,.3,1) var(--delay),
             transform 200ms cubic-bezier(.2,.7,.3,1),width 200ms,height 200ms;}
.axis-halo{width:30px;height:30px;background:rgb(var(--c-rgb)/var(--halo-a));pointer-events:none;}
.axis-knob{width:18px;height:18px;background:rgb(var(--c-rgb));border:3px solid var(--panel);
  box-shadow:var(--knob-shadow),0 0 0 1px rgb(var(--c-rgb)/var(--knob-ring));}

.axis-poles{display:flex;justify-content:space-between;gap:14px;}
.axis-pole{max-width:47%;font:500 12.5px/1.35 Poppins,system-ui,sans-serif;color:var(--muted);
  transition:color 200ms;}
.axis-pole.r{text-align:right;}
.axis-row[data-side="left"]  .axis-pole.l,
.axis-row[data-side="right"] .axis-pole.r{font-weight:600;color:var(--c-text);}

/* near centre: draw almost nothing, hollow the knob, strengthen the tick */
.axis-row[data-band="2"]{--fill-mid:.18;--fill-hi:.22;--halo-a:0;--tick:rgba(68,68,68,.30);}
:root[data-theme="dark"] .axis-row[data-band="2"]{--tick:rgba(255,255,255,.32);}
.axis-row[data-band="2"] .axis-knob{width:14px;height:14px;background:var(--panel);
  border:3px solid rgb(var(--c-rgb)/.55);box-shadow:none;}
.axis-row[data-band="2"] .axis-pole{font-weight:500;color:var(--muted);}

/* extreme pole */
.axis-row[data-extreme="left"]  .axis-cap.l,
.axis-row[data-extreme="right"] .axis-cap.r{width:3px;background:rgb(var(--c-rgb));}
.axis-row[data-extreme] {--halo-a:.14;}
:root[data-theme="dark"] .axis-row[data-extreme]{--halo-a:.20;}
.axis-row[data-extreme="left"]  .axis-pole.l,
.axis-row[data-extreme="right"] .axis-pole.r{font-weight:700;text-decoration:underline;
  text-decoration-color:rgb(var(--c-rgb)/.45);text-underline-offset:5px;text-decoration-thickness:2px;}

/* hover + keyboard focus share one emphasis block */
@media (hover:hover){
  .axis-row:hover{--rail-a:.13;--fill-hi:.44;--halo-a:.16;}
  :root[data-theme="dark"] .axis-row:hover{--rail-a:.21;--fill-hi:.52;}
  .axis-row:hover .axis-knob{transform:translate(-50%,-50%) scale(1.12);}
  .axis-row:hover .axis-halo{width:38px;height:38px;}
  .axis-row:hover .axis-pole{color:var(--ink);}
}
.axis-row:focus-visible{outline:2px solid var(--focus);outline-offset:6px;border-radius:16px;
  --rail-a:.13;--fill-hi:.44;--halo-a:.16;}
.axis-row:focus-visible .axis-knob{transform:translate(-50%,-50%) scale(1.12);}

@media (max-width:420px){
  .axis-row{padding:16px 12px;}
  .axis-read{margin-left:0;text-align:left;flex-basis:100%;margin-top:5px;}
  .axis-band{font-size:15px;} .axis-pole{font-size:12px;}
  .axis-rail{inset:6.5px 0;height:9px;}
  .axis-knob{width:16px;height:16px;} .axis-row[data-band="2"] .axis-knob{width:13px;height:13px;}
  .axis-halo{width:26px;height:26px;}
}
@media (max-width:380px){ .axis-pole{font-size:11.5px;} }
@media (prefers-reduced-motion:reduce){
  .axis-fill,.axis-knob,.axis-halo,.axis-rail,.axis-pole{transition:none!important;}
  .axis-row:hover .axis-knob,.axis-row:focus-visible .axis-knob{transform:translate(-50%,-50%);
    box-shadow:var(--knob-shadow),0 0 0 2px rgb(var(--c-rgb)/var(--knob-ring));}
}
&lt;/style&gt;

&lt;div class="axis-row" data-axis="grace" data-side="left" data-band="1"
     style="--i:0;--pos:34%;--lean:16"&gt;
  &lt;span class="axis-stub" aria-hidden="true"&gt;&lt;/span&gt;
  &lt;div class="axis-head"&gt;
    &lt;span class="axis-name"&gt;Grace&lt;/span&gt;
    &lt;div class="axis-read"&gt;
      &lt;div class="axis-band"&gt;Monergist-leaning&lt;/div&gt;
      &lt;div class="axis-lean"&gt;32% toward Monergist&lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
  &lt;div class="axis-track" aria-hidden="true"&gt;
    &lt;div class="axis-rail"&gt;
      &lt;span class="axis-cap l"&gt;&lt;/span&gt;&lt;span class="axis-cap r"&gt;&lt;/span&gt;
      &lt;span class="axis-fill"&gt;&lt;/span&gt;
    &lt;/div&gt;
    &lt;span class="axis-tick"&gt;&lt;/span&gt;
    &lt;span class="axis-halo"&gt;&lt;/span&gt;
    &lt;span class="axis-knob"&gt;&lt;/span&gt;
  &lt;/div&gt;
  &lt;div class="axis-poles"&gt;
    &lt;span class="axis-pole l"&gt;Monergist&lt;/span&gt;
    &lt;span class="axis-pole r"&gt;Synergist&lt;/span&gt;
  &lt;/div&gt;
&lt;/div&gt;

&lt;script&gt;
/* band() is the AUDITED function - do not re-derive from the rounded percentage */
function band(s){ return s<=20?0 : s<=40?1 : s<=59?2 : s<=79?3 : 4; }

function axisRowHTML(a, s, i){
  var b = band(s);
  var side = s < 50 ? 'left' : s > 50 ? 'right' : 'none';
  var lean = Math.abs(s - 50);
  var pct  = Math.round(lean / 50 * 100);
  var extreme = s === 0 ? 'left' : s === 100 ? 'right' : null;
  var adj = a.bands[b];
  adj = adj.charAt(0).toUpperCase() + adj.slice(1);

  var leanText;
  if (s === 50)        leanText = 'at the centre';
  else if (s === 0)    leanText = 'at the ' + a.left + ' pole';
  else if (s === 100)  leanText = 'at the ' + a.right + ' pole';
  else if (b === 2)    leanText = pct + '% off centre, inside the middle band'; // names no pole
  else                 leanText = pct + '% toward ' + (s < 50 ? a.left : a.right);

  return '<div class="axis-row" data-axis="' + a.key + '" data-side="' + side +
    '" data-band="' + b + '"' + (extreme ? ' data-extreme="' + extreme + '"' : '') +
    ' style="--i:' + i + ';--pos:50%;--lean:0" data-pos="' + s + '" data-target-lean="' + lean + '">' +
    '<span class="axis-stub" aria-hidden="true"></span>' +
    '<div class="axis-head"><span class="axis-name">' + esc(a.name) + '</span>' +
      '<div class="axis-read"><div class="axis-band">' + esc(adj) + '</div>' +
      '<div class="axis-lean">' + esc(leanText) + '</div></div></div>' +
    '<div class="axis-track" aria-hidden="true"><div class="axis-rail">' +
      '<span class="axis-cap l"></span><span class="axis-cap r"></span>' +
      '<span class="axis-fill"></span></div>' +
      '<span class="axis-tick"></span><span class="axis-halo"></span><span class="axis-knob"></span>' +
    '</div>' +
    '<div class="axis-poles"><span class="axis-pole l">' + esc(a.left) + '</span>' +
      '<span class="axis-pole r">' + esc(a.right) + '</span></div>' +
    '</div>';
}

/* settle: NOT rAF (never fires in the embedded pane); end state is correct either way */
function settleAxisRows(root){
  var rows = root.querySelectorAll('.axis-row');
  var skip = false;
  try { skip = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){}
  function apply(){
    for (var i=0;i&lt;rows.length;i++){
      rows[i].style.setProperty('--pos', rows[i].dataset.pos + '%');
      rows[i].style.setProperty('--lean', rows[i].dataset.targetLean);
    }
  }
  if (skip) apply(); else setTimeout(apply, 30);
}
&lt;/script&gt;
```

## Pitfalls

- Printing only the pole the person leans toward, or dimming the opposite pole into illegibility. Both pole names render at the same size and full opacity on every row, always. The lean is carried by weight and colour, never by omission — that omission is exactly what broke the previous attempt.
- Using the raw axis hue for text. #C98A12 gold on #EEEEEE is 2.53:1, #E2582B is 3.16:1, #2E7D4F is 4.33:1 — all fail. Text must use the separate `--c-text` token (Gifts #B44A1E, Kingdom #276B43, Authority #8A5E08 in light theme). The graphic keeps the brand hues; only typography shifts.
- Inventing a near-centre threshold. The quiet state must key off the audited `band(s)===2`, i.e. scores 41–59, which given the 13 reachable scores means exactly {42, 50, 58}. Do not use CENTER_UNITS=10, do not use a rounded percentage, do not eyeball it — the visual rule and the `headline()` rule must agree or a screenshot will show the page contradicting itself.
- Letting the band-2 lean line name a pole. `lean()` in the existing code returns "16% toward Monergist" for a score of 42; that string is correct for the tooltip but violates the audited rule in this row. Band 2 reads "16% off centre, inside the middle band". The knob still sits left of centre — the geometry is honest, only the words refuse to name a position.
- Flattening the layered opacity. Turning the fill into one flat `background: var(--c); opacity:.35` or raising the alphas because it "looks weak" destroys the whole effect. The tiers (rail .09 → fill .10–.38 gradient → halo .10 → knob 1.00) are the design; the knob is the only fully saturated object in the row and must stay the only one.
- Reversing the fill gradient. It is faintest at the centre and strongest under the knob, so the colour appears to emerge from the midpoint. A gradient running the other way makes the bar look like it is draining away from the position.
- Clipping the knob at scores 0 and 100. The track must not be `overflow:hidden` and `.axis-row` needs `padding-inline: 14px` to absorb the 12px overhang. Do not fix this by insetting the knob's travel with `calc(11px + …)` — that decouples the knob centre from the fill edge and every intermediate position drifts.
- Sorting the six rows by lean strength. It produces a descending staircase that reads as a ranking and implies the axes are comparable magnitudes. Keep the canonical order Grace, Table, Gifts, Kingdom, Authority, Worship.
- Gating the entry animation on `requestAnimationFrame`. It never fires in this project's embedded browser pane, so the bars would stay at zero forever. Use `setTimeout(..., 30)` and make sure the final `--pos`/`--lean` values are correct even if no transition ever runs.
- Forgetting to swap `--c-rgb` in dark theme. A 30%-alpha #2F4FCB fill over a #232323 panel is effectively invisible and the #9E2A3B knob reads as brown-black. Both the graphic triple and the text hex change per theme.
- Repeating a "the centre means…" caption under all six rows. One shared caption sits above the set; six copies is the wall-of-text failure in miniature.
- Giving the track an `aria-label` as well as leaving the visible text. That double-announces every row. The track is `aria-hidden="true"`; the axis name, band adjective, lean sentence and both pole names are real text and carry everything.
- Dimming the whole row with `opacity` for the quiet state. It drops the band adjective and pole names below contrast minimums. The quiet state is expressed by drawing less — softer fill, hollow knob, no halo — never by fading text.
- Making the knob interactive: a `<button>`, a `tabindex`, a click handler, or a drag affordance. It is a readout, not a control. Focus belongs to the row only when the row is the `<summary>` of the axis `<details>`.
- Paraphrasing the band adjectives. `bands[b]` is audited copy; use it verbatim, capitalising only the first letter. Do not append the axis name, do not pluralise, do not swap "balanced on grace" for "neutral" or "undecided".

---

## CRITIQUE

### Logical incoherence found

- Band-2 lean copy forks from the shipped lean() function, so the same score reads "16% off centre, inside the middle band" in the axis row and "16% toward Monergist" in the accordion header, the radar's accessible label, and the share card - the page contradicting itself in the one rule the audit cares most about.
- "Identical row height and type scale on all six" versus a right-aligned variable-length 17px serif plus "if a pole name wraps to two lines, let it wrap". The real band strings run to 33 characters; the two promises cannot both hold.
- The hollow-knob threshold is invisible. Score 42 and score 33 are 9 units apart and render as two completely different objects, with nothing on screen showing where 41 and 59 are. A viewer reads it as inconsistency, not as a rule.
- The quiet state is defined entirely by subtraction - no halo, whisper fill, a 1px 30%-alpha grey line - which at ~1.4:1 is not a mark. A row in the most common non-committal outcome looks like a rendering failure rather than a deliberate statement.
- Hover is specced to lift "the non-leaning pole name" but implemented as a rule targeting every .axis-pole, so hovering flattens the distinction the row exists to make.
- `.axis-row:focus-visible` cannot match, because the spec also says the row lives inside the focusable <summary>. Keyboard users get none of the specced focus treatment.
- Contrast is asserted against #EEEEEE while the locked palette puts panels on an #E8E8E8 shell on an #E3E3E3 page; Gifts #B44A1E falls below 4.5:1 on the page ground. The knob's `border:3px solid var(--panel)` bakes the same unstated assumption into the graphic.
- A 200ms transition is declared on a hover change that lives inside a background-image gradient via an unregistered custom property, so it cannot animate. The spec promises motion the browser will not produce.
- The example markup uses score 34, which is not one of the 13 reachable scores the same document insists on three separate times.
- End caps are described as telling the viewer where the poles are, but they are placed at left:3px inside a rail with border-radius:999px and overflow:hidden, so the rounded corner clips them into stubs.

### Worst problems

- THE PAGE CONTRADICTS ITSELF IN WORDS. The spec invents a new band-2 string, "16% off centre, inside the middle band", but the shipped `lean()` in theology-compass.html (line 709) returns "16% toward Monergist" for score 42, and that same function is already rendered in the accordion header (`.acc-pos`), in `describe()` (the radar's accessible label) and inside `shareText()` (the share card). So one score would read "names no pole" in the axis row and "toward Monergist" 200px below it, and the shareable artefact would carry the version the audit forbids. The spec's own pitfall #3 warns about exactly this failure and then the spec commits it. Not fixable in CSS: `leanText()` has to move into the scoring core, every call site has to use it, and selftest.js has to assert that no band-2 score produces a pole name anywhere.
- THE QUIET STATE IS A DEAD ROW, AND ITS RULE IS INVISIBLE. "Draw almost nothing" plus "halo suppressed" plus "fill is a whisper" plus "tick strengthens to rgba(68,68,68,.30)" adds up to: a 1px hairline at 30% alpha is roughly 1.4:1 on #EEEEEE - it is not a mark, it is nothing. Given the 13 reachable scores, band 2 is {42, 50, 58}, which is 3 of 13 outcomes per axis; a perfectly ordinary result has two or three near-blank rows. Worse, the threshold is undrawn: a viewer with Grace 42 (hollow knob, no halo) and Table 33 (solid knob, halo, full fill) sees two wildly different graphics 9 units apart with nothing on screen explaining why. That is precisely the class of incoherence that shipped last time - a rule asserted in copy and contradicted or unexplained by the picture.
- THE HEADER WAS NEVER TESTED AGAINST THE REAL COPY. The spec assumes the band adjective looks like "Monergist-leaning". The actual audited strings include "rooted in Scripture and tradition" (33 chars), "balanced on Israel and the church" (33), "between sacramental and memorial" (32), "open but cautious on the gifts" (30). At DM Serif Display italic 17px that is ~260-275px of right-aligned text sharing a flex line with a letter-spaced uppercase axis name. It will wrap to two ragged right-aligned lines on any column under ~450px, which breaks the spec's own promise of "identical row height and type scale on all six". And the longest strings are the band-2 ones - so the row that is supposed to whisper is the one whose typography shouts loudest.
- AS DRAWN IT IS DULL, AND THE SPEC PRE-EMPTS THE CRITICISM INSTEAD OF SOLVING IT. Six identical 10px pills, a 3px colour stub, one 2px inset shadow, and a dot. That is the entire visual invention. There is no scale, no notation, no texture, nothing that says "instrument" - a knob at 33 and a knob at 42 are visually indistinguishable and the viewer cannot read magnitude at all. The line "if it looks weak next to a flat-fill mockup, that is correct" is an argument, not a design. Restraint is not the absence of craft: this project's language has paint-pour and floral masks, warm gradients, soft inner shadows, and this spec uses geometric primitives only.
- HOVER DESTROYS THE LEAN CUE. `.axis-row:hover .axis-pole{color:var(--ink)}` has equal specificity to and comes after nothing that protects `.axis-row[data-side="left"] .axis-pole.l{color:var(--c-text)}` - actually it loses on specificity, but the intent stated in prose ("the non-leaning pole lifts to var(--ink)") is implemented as a rule that targets BOTH poles. Written as specced, hovering either collapses both poles to charcoal or does nothing consistent. The leaning pole must be excluded explicitly.
- `.axis-row:focus-visible` CAN NEVER MATCH. The spec says the row is focusable "only when it is used as the `<summary>` of the axis `<details>`" and simultaneously that "the bar stays inside `<summary>`" - i.e. `.axis-row` is a descendant of the focusable element, not the focusable element. The selector must be `summary:focus-visible .axis-row` (or `:has()`), and the outline must be drawn on the row while focus sits on the summary. As written, keyboard users get the UA default outline on the summary and none of the specced emphasis.
- THE CONTRAST MATH ASSUMES A SURFACE THE SPEC NEVER PINS DOWN. Every ratio is quoted against #EEEEEE, but the locked palette is panels #EEEEEE on an #E8E8E8 shell on an #E3E3E3 page. Gifts `--c-text` #B44A1E is 4.59:1 on #EEEEEE - it drops to about 4.15:1 on #E3E3E3 and fails. Same exposure for Authority #8A5E08 (4.91 -> ~4.4). And the knob's `border: 3px solid var(--panel)` hard-codes the assumption that the row's own background is exactly `--panel`; put the rows on the shell and every knob gains a pale mismatched ring. The spec must state the surface and re-verify, or derive the knob border from a `--surface` token.
- A DECLARED TRANSITION THAT CANNOT RUN. Hover changes `--fill-hi` from .38 to .44, and the fill's colour lives inside a `linear-gradient` (a background-image). Unregistered custom properties do not interpolate and background-image does not transition, so the specced "200ms" fill emphasis snaps. Either register it - `@property --fill-hi{syntax:'<number>';inherits:true;initial-value:0.38}` - or delete the claim.
- SMALL BUILD DEFECTS. (a) `.axis-cap` sits at left:3px inside a rail with `border-radius:999px; overflow:hidden`, so a 10px-tall pill's 5px corner shaves the cap's top and bottom - it will render as a short stub, not the full-height pole mark described. (b) `data-side="none"` at score 50 matches no fill rule at all, leaving an absolutely-positioned element with no offsets; harmless at width 0 but sloppy and it will bite whoever adds a 4th statement per axis. (c) The example markup uses `--pos:34%` for a score of 34, which is not one of the 13 reachable scores the spec itself enumerates; use 33 (which yields 34%) so nobody ships an impossible demo state.
- THE readMore SPLIT-BY-POLE DATA IS STILL UNUSED. The brief calls this out as a previous failure. The pole line built here is the natural anchor for it - two named columns under two named poles - and the spec does not even note the handoff, so the next implementer will centre the reading list again and lose the split a second time.

### What must survive

- The non-negotiable rule that BOTH pole names render in every state, at equal size and full opacity, with the lean carried by weight and colour and never by omission - including the clause that the opposite pole is never dimmed, greyed or struck at scores 0 and 100. This is the fix for the exact failure that killed the last attempt.
- The four-tier same-hue opacity stack (rail ~.09, fill .10-.38 gradient, halo .10, knob 1.00) with the knob as the only fully saturated, shadow-bearing object in the row. Correct answer to "flat saturated blocks killed the subtlety", and it matches the locked visual language.
- The fill gradient running faint at the centre to strongest under the knob, so colour appears to emerge from the midpoint rather than drain away from the position. Right mental model, well argued, keep the reasoning in the comment.
- Separating --c-rgb (graphic, brand hue) from --c-text (darkened, contrast-safe), and swapping both per theme. The audit numbers quoted are accurate - #C98A12 as text is ~2.5:1 and would have failed on the first screenshot.
- Keying every visual state off the audited band(s) boundaries rather than a new threshold, and refusing to print a raw numeric score. Both are correct readings of the audit.
- Canonical axis order, never sorted by lean strength, with the reason stated (a staircase implies the axes are commensurable magnitudes).
- The knob is a readout, not a control: no tabindex, no role, no click handler, no drag affordance. Track aria-hidden, everything it encodes present as real text with no invented alt sentence to keep in sync.
- setTimeout(fn, 30) instead of requestAnimationFrame for the entry reveal, with the end state correct even if the transition never runs. Project-specific knowledge the implementer would otherwise lose a day to.
- Knob overhang at scores 0 and 100 absorbed by row padding rather than by insetting knob travel, with the reason stated (insetting decouples the knob centre from the fill edge and every intermediate position drifts).
- One shared caption for the middle-band rule above the set, never repeated per row.
- The reduced-motion fallback that swaps the knob scale for a thicker hairline ring, so feedback survives without movement.
- The pitfalls list as a whole - it is the most useful part of the document and should ship with the code as comments.

### Rewritten spec

REPLACES, in the spec under review: the sections "BAND ADJECTIVES - how they are surfaced" (layout half), "STATE: NEAR CENTRE", and "SIX ROWS AS A SET". Everything else in that spec stands unless contradicted here.

=====================================================================
1. ONE LEAN STRING, ONE SOURCE
=====================================================================
Delete the row-local lean copy table. Move this into the scoring core (site/src/lib/compass.ts and the demo page's script), replacing the existing `lean()` at theology-compass.html:709, and route EVERY call site through it - the axis row, the accordion summary `.acc-pos`, `describe()`, and `shareText()`:

  function leanText(a, s) {
    if (s === 50) return 'at the centre';
    if (s === 0)  return 'at the ' + a.left + ' pole';
    if (s === 100) return 'at the ' + a.right + ' pole';
    var pct = Math.round(Math.abs(s - 50) / 50 * 100);
    if (band(s) === 2) return pct + '% off centre - inside the middle band';
    return pct + '% toward ' + (s < 50 ? a.left : a.right);
  }

Add to audit/selftest.js, as a hard failure:
  for each axis, for each of the 13 reachable scores {0,8,17,25,33,42,50,58,67,75,83,92,100}:
    if (band(s) === 2) assert leanText does NOT contain a.left or a.right;
    assert every rendered surface (row, accordion, share text, SVG label) uses leanText verbatim.
The audited rule is "a midpoint is not a conviction". If two surfaces disagree, the screenshot wins and the moat is gone.

=====================================================================
2. RAIL: MAKE IT AN INSTRUMENT, NOT A PILL
=====================================================================
The rail gains two permanent features, present on all six rows in every state. Cost: two extra background layers, no new elements.

(a) THE MIDDLE BAND, DRAWN. Scores 41-59 occupy 41%-59% of the track. That region is painted at a lower alpha than the rest of the rail, so the rail reads as: tinted = territory where a position can be named; pale = the middle band. The audited rule stops being a sentence and becomes a place on the picture.

(b) THIRTEEN NOTCHES. The 18 statements can only produce 13 scores per axis, and they land exactly 100/12 = 8.333% apart. Draw a 1px hairline at each. This does three things at once: it gives the viewer a scale so 33 and 42 are finally distinguishable at a glance; it is honest about the instrument's resolution (this thing has 13 steps, not 101); and it supplies the "measured, rigorous" texture the page has been missing. It is the cheapest possible piece of visual interest that is also true.

  .axis-rail{
    position:absolute; inset:6px 0; height:10px; border-radius:999px;
    overflow:hidden; box-shadow:var(--rail-inset);
    background-image:
      repeating-linear-gradient(to right,
        var(--notch) 0 1px, transparent 1px calc(100% / 12)),
      linear-gradient(to right,
        rgb(var(--c-rgb) / var(--rail-a))  0    41%,
        rgb(var(--c-rgb) / var(--mid-a))  41%   59%,
        rgb(var(--c-rgb) / var(--rail-a)) 59%  100%);
  }
  /* gate marks at the middle band's edges: shorter than the centre tick, so the
     hierarchy reads centre > gates > notches */
  .axis-gate{position:absolute;top:4px;height:14px;width:1px;border-radius:1px;
    background:var(--gate);}
  .axis-gate.a{left:41%} .axis-gate.b{left:59%}

  light: --mid-a:.03; --notch:rgba(68,68,68,.10);  --gate:rgba(68,68,68,.16);
  dark:  --mid-a:.055; --notch:rgba(255,255,255,.10); --gate:rgba(255,255,255,.18);

Notches sit UNDER the fill in paint order (they are part of the rail's background, the fill is a child element), so where the fill covers them they read as faint ruling through tinted colour - which is what you want: the bar looks measured, not striped.

Cap fix, replacing the clipped `left:3px` caps: move the end caps OUT of the clipping rail and render them as siblings of the rail at `left:0` / `right:0`, `top:2px; height:18px; width:2px; border-radius:1px; background:rgb(var(--c-rgb)/var(--cap-a));` They now flank the rail rather than sitting inside its rounded corner, they are visible at full height, and they line up vertically with the centre tick.

=====================================================================
3. STATE: NEAR CENTRE (data-band="2") - LIGHT THE ZONE, NOT A DIRECTION
=====================================================================
Old rule: draw almost nothing. New rule: draw ONE thing, and make it symmetric.

- The directional fill is NOT drawn at all (`--lean` is still set, but `.axis-row[data-band="2"] .axis-fill{display:none}`). A directional bar is a claim about a side; band 2 makes no claim about a side.
- Instead the middle band region itself lights up: `--mid-a` rises from .03 to .13 (dark .055 -> .20). The lit object is the 41-59 zone - symmetric, centred, naming nobody. The picture now says "you are inside this zone", which is exactly the audited sentence.
- The knob still sits at its true position (42% or 58%), hollow: `width:14px;height:14px;background:var(--surface);border:3px solid rgb(var(--c-rgb)/.55);box-shadow:none;` Solid = a conviction; hollow = a position without one. The geometry stays honest; only the words and the direction-cue refuse to name a side.
- Gate marks strengthen to `--gate: rgba(68,68,68,.30)` / `rgba(255,255,255,.34)` - they, not the 1px centre tick, are the row's mark, and unlike the old tick they are two objects bracketing a lit area, which is visible.
- Centre tick returns to its normal .20 alpha. Do not lean on a 1px 30%-alpha hairline to carry a state; it is invisible.
- Halo suppressed (`--halo-a:0`). Neither pole name emphasised: both `var(--muted)`, weight 500.
- At exactly 50 the knob sits dead on the centre tick and the zone is lit identically. Score 50 and score 42 differ only by knob offset - correct, because they differ only by 8 units.

Why this beats "draw almost nothing": three of thirteen reachable scores per axis land in band 2, so blank rows are common, not exceptional. A row with a lit zone and a hollow bead reads as deliberate; a row with a whisper of fill and an invisible hairline reads as broken CSS. And because the zone is drawn faintly on ALL rows at all times, the band-2 state is legible as an intensification of something the viewer has already seen five times - the threshold explains itself instead of looking arbitrary.

ALL-CENTRAL SET (every axis within the middle band): the six lit zones stack into a visible symmetric column, which is a picture of the result rather than six failures. The shared caption above the set switches to the audited all-central sentence. No tradition is named, per the existing `isAllCentral` rule.

SHARED CAPTION (one only, above the six rows, never per-row):
  "Scores between 41 and 59 sit in the pale middle band: the two sides pull about equally, so no position is named."
That sentence now describes something the viewer can actually see.

=====================================================================
4. HEADER LAYOUT - REBUILT AROUND THE REAL COPY
=====================================================================
The 30 real band strings run to 33 characters ("rooted in Scripture and tradition", "balanced on Israel and the church"). A right-aligned 17px serif sharing a flex line with the axis name cannot hold them without ragged two-line wraps and unequal row heights. Restructure to three full-width bands, top to bottom:

  LINE 1 (flex, baseline, space-between):
    left  - axis name. Poppins 600, 11.5px, letter-spacing .13em, uppercase, color:var(--c-text).
    right - lean line. Poppins 500, 12px, tabular-nums, color:var(--muted).
    Longest real pair: "AUTHORITY" (~85px) + "34% off centre - inside the middle band" (~205px) + 16px gap = ~306px. Fits at 380px. If it ever does not, the lean line wraps to its own left-aligned line; the axis name never moves.

  LINE 2: band adjective. DM Serif Display italic 17px/1.2, color:var(--ink), LEFT-aligned, its own full-width line, margin:6px 0 0. It now has the whole column and cannot collide with anything. Audited copy verbatim, first letter capitalised, nothing appended.
    .axis-band{min-height:1.2em}
    @media (max-width:400px){ .axis-band{font-size:15px; min-height:2.4em} }
    Reserving two lines below 400px keeps all six rows the same height even when "rooted in Scripture and tradition" wraps.

  LINE 3: the track (margin:12px 0 9px), then the pole line, both unchanged.

This also improves the reading order: the serif verdict now sits directly above the bar that illustrates it, left-aligned on the same optical axis as the axis name, instead of floating off to the right where it competed with the uppercase label.

=====================================================================
5. SIX ROWS AS A SET
=====================================================================
- Canonical order always: Grace, Table, Gifts, Kingdom, Authority, Worship. Never sorted by lean - a descending staircase reads as a ranking and implies the axes are commensurable. Keep this reason in the code comment.
- Colour stub: widen from 3px to 4px, `left:0; top:22px; height:30px; border-radius:999px; background:rgb(var(--c-rgb)/.85)`. Stacked, the six form the colour column that echoes the brand's 6-stripe bar. That column plus the six knob offsets is the set's silhouette - the "shape of a person" the concept promises.
- Separator: unchanged fading hairline, `linear-gradient(to right,transparent,var(--sep) 12%,var(--sep) 88%,transparent)`. No hard borders.
- Row padding `18px 14px`; identical geometry on all six. All variation comes from hue, knob position, notch-relative placement, and copy - never from size.
- Surface token: declare `--surface` on the axis list (the background the rows actually sit on) and use it for the knob's 3px border instead of `--panel`. Re-run contrast for `--c-text` against that surface; if the rows sit on the #E3E3E3 page rather than an #EEEEEE panel, darken Gifts to #A8441B and Authority to #7F5607 to clear 4.5:1 with margin.

=====================================================================
6. KNOB AS A BEAD (tactility, one line)
=====================================================================
  .axis-knob{
    background:rgb(var(--c-rgb));
    border:3px solid var(--surface);
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.30),
      inset 0 -1px 0 rgba(0,0,0,.14),
      var(--knob-shadow),
      0 0 0 1px rgb(var(--c-rgb) / var(--knob-ring));
  }
Two inset hairlines turn a 12px flat disc into a lit bead without adding a colour token or raising the outer shadow past the page's soft language. Dark theme: inset highlight .22, inset shade .28.

=====================================================================
7. FIXES TO CARRY IN FROM THE CRITIQUE
=====================================================================
- Hover: `.axis-row:hover .axis-pole:not(.is-lean){color:var(--ink)}` and add `.is-lean` to the emphasised pole in markup. The leaning pole keeps `--c-text` at all times; hover raises only the other one, so both are equally readable while inspecting and the lean cue never collapses.
- Focus: `summary:focus-visible{outline:none}` plus `summary:focus-visible .axis-row{outline:2px solid var(--focus);outline-offset:6px;border-radius:16px;--rail-a:.13;--fill-hi:.44;--halo-a:.16;}` and `summary:focus-visible .axis-knob{transform:translate(-50%,-50%) scale(1.12)}`. A standalone (non-details) row stays a plain div with no tabindex and no focus styles.
- Register the animated alpha so the declared hover transition is real:
  `@property --fill-hi{syntax:'<number>';inherits:true;initial-value:0.38}`
  `@property --mid-a{syntax:'<number>';inherits:true;initial-value:0.03}`
  With these registered, the band-2 zone can also fade in during the entry reveal.
- `data-side="none"` (score 50): add `.axis-row[data-side="none"] .axis-fill{display:none}` explicitly rather than relying on width 0.
- Example markup: use a reachable score. Grace 33 -> `data-band="1" data-side="left" --pos:33% --lean:17`, adjective "Monergist-leaning", lean "34% toward Monergist".
- readMore handoff: the pole line's two names are the anchors for the expanded body. Note in the spec that the `<details>` body must render `readMore.left` under the left pole name and `readMore.right` under the right, in two columns that align with the pole line above them. The bar's two ends and the reading list's two columns must be the same two ends, or the split-by-pole data is wasted a second time.


---

# The "where your view came from" content design

**Critic verdict: `needs-work`**

## Concept

One reusable component — the **Axis Dossier** — presents an axis as a *disagreement*, not an article. Two mirrored pole panels sit side by side under a miniature of the axis bar, so the layout itself is the axis: left end, right end, and the reader's knob above them. Below that, a shared "texts in play" chip strip, a designed single-rail timeline that visibly marks the centuries when nobody was arguing, and further-reading cards keyed back to each pole in the same left/right geometry. The 99–257-word summary is never split by runtime regex: it is cut once at build time into `summary_parts {left, right, between?, caution?}`, guarded by a selftest that asserts the parts rejoin to the audited string character-for-character.

## Why it works

A reader perceives opposition spatially before they read a word. Two panels of near-equal weight, tinted from their outer edges inward and rail-marked on their outer edges, are read as *ends of a bar* — which is literally what the poles are — so the bipolar premise survives even if the reader skims. The failure of the last attempt was that one side had a label and the other had blank space; here neither side can exist without the other, because the grid has two named cells.

The prose is short once split: 39–99 words per pole (verified across all six axes). That is a 20-second read, not a wall. Undifferentiated grey happens when 250 words arrive as one block with one heading; the same 250 words in two named cases, a between-note, and a method aside arrive as four short things, each with a visible reason to exist. Nobody skips a 50-word column headed with the name of a position they hold.

The timeline earns attention by teaching something the bullets could not: gaps. Rendering "≈1,000 years" of dashed rail between Orange (529) and Luther (1525) makes visible that the argument slept for a millennium and then erupted — a fact already in the data that a plain list buries. That is the trojan horse working: the reader came for a score and leaves knowing when the fight actually happened.

Colour is handled the way the version people liked handled it — low-opacity wash plus a solid marker. The axis colour appears only as a 3px solid rail, a knob, a dot, and a ~7% wash; it never carries text. This is both the aesthetic fix (nothing looks flat or oversaturated) and the accessibility fix (#C98A12 gold as body text is ~2.6:1 and would fail).

Fairness is enforced by geometry: the two panels are identical in padding, radius, tint strength and type scale, and the reader's own side is marked by *adding* a small pill, never by dimming the other. A discernment-minded audience screenshots asymmetry; there is none to screenshot.

## Specification

## 0. Data restructure (do this first — it is the load-bearing decision)

`fair_summary` is one string, but its internal boundaries vary in wording ("Synergists…", "The memorial view…", "Cessationists…", "Those who hold to Scripture alone…", "Free worship…"). A runtime regex will look right today and silently mis-split the first new axis. **Restructure the data instead.**

Add to every axis in `audit/compass-data.revised.json`:

```json
"summary_parts": { "left": "…", "right": "…", "between": "…", "caution": "…" }
```

`left` and `right` are required; `between` and `caution` are optional.

**Generator — `audit/split-summary.mjs`** (build time, Node, run once and on any summary edit):

1. Split on `/(?<=[.?!])\s+(?=[A-Z“‘(])/`. Verified: this produces clean sentence arrays for all six axes with zero false splits (8, 3, 3, 3, 2, 2 sentences).
2. Apply an **explicit, human-verified boundary map** — do not infer boundaries with cue words. I verified these by reading; use them verbatim (half-open sentence index ranges):

| axis | left | right | between | caution |
|---|---|---|---|---|
| grace | 0–2 | 2–5 | — | 5–8 |
| table | 0–1 | 1–2 | 2–3 | — |
| spirit | 0–1 | 1–3 | — | — |
| kingdom | 0–1 | 1–2 | 2–3 | — |
| tradition | 0–1 | 1–2 | — | — |
| worship | 0–1 | 1–2 | — | — |

(Cue-word inference fails on real cases: grace's "Many synergists, including most Baptists…" belongs to `right`, and kingdom's "Progressive dispensationalists add…" belongs to `between`. Same opening word, opposite answer.)
3. Join each span with a single space and write the parts. Print a diff-style proposal; write only under `--write`.

**Invariant — add to `audit/selftest.js` (must fail the build):**

```
[left, right, between, caution].filter(Boolean).join(' ').replace(/\s+/g,' ').trim()
  === fair_summary.replace(/\s+/g,' ').trim()
```

Also assert: `left` and `right` present and non-empty; each part appears in `fair_summary` at a strictly increasing index. I ran this check against all six axes with the map above — all six round-trip exactly. This invariant is the point: it makes it impossible to drop, reorder or quietly reword audited prose while restructuring it.

`site/scripts/build-data.mjs` copies `summary_parts` through and **throws** if an axis lacks it. Going forward, new axes are authored *as parts* and `fair_summary` is derived by joining them, inverting the dependency.

**Runtime fallback:** if `summary_parts` is missing, render `fair_summary` as one full-width block under the heading "Both poles" with no pole panels. Never guess a split in the browser.

Passages and history stay as they are. `key_passages` MAY later become `{ref, side:"left"|"right"|"both"}` objects; until an editor assigns sides with citations, the renderer treats every entry as `"both"`. **Do not assign sides yourself** — Romans 9 and 1 Tim 2:4 are claimed by both camps, and inventing an attribution is exactly the kind of thing the audit exists to prevent.

## 1. Component contract

```
renderAxisDossier(axis, opts) -> HTMLElement
opts = { score: 0..100 | null, mode: 'result' | 'page', headingLevel: 3, canonicalHref: '/q/theology-compass/axis/grace' }
```

`mode:'page'` (the canonical axis page) forces every `<details open>` and omits the score header. `mode:'result'` shows the score header and applies the disclosure defaults in §9. Generalisation for the platform: the internal model is `{ poles:[{name, prose, readMore}], shared:{passages, history}, notes:{between, caution} }` — a one-pole quiz (deadly sins, spiritual gifts) passes a single pole and the grid collapses to one column with no divider.

## 2. Root, sizing, tokens

Root: `<article class="tc-dossier" style="--axis:#2F4FCB">`, `container-type: inline-size; container-name: dossier`. All internal breakpoints are container queries at **640px**, with a `@supports not (container-type: inline-size)` fallback to `@media (min-width:760px)`. Max width 820px. Padding 20px (narrow) / 28px (wide). Radius 22px, background `var(--panel)`, shadow `3px 3px 5px rgba(68,68,68,.065)`, no border.

Tokens (light): `--paper:#E3E3E3; --shell:#E8E8E8; --panel:#EEEEEE; --panel-2:#F4F3F1; --ink:#444444; --ink-2:#6B6B6B; --hair:rgba(68,68,68,.10)`.
Dark (`[data-theme="dark"]`, plus `@media (prefers-color-scheme:dark)` guarded with `:root:not([data-theme="light"])`): `--panel:#242427; --panel-2:#2A2A2E; --ink:#E8E6E3; --ink-2:#A9A6A1; --hair:rgba(255,255,255,.09)`, shadow `0 2px 6px rgba(0,0,0,.35)`.

Derived axis tokens — light: `--axis-ink:var(--axis); --axis-wash:color-mix(in srgb, var(--axis) 7%, transparent); --axis-edge:color-mix(in srgb, var(--axis) 28%, transparent)`. Dark: `--axis-ink:color-mix(in oklab, var(--axis) 68%, white); --axis-wash:color-mix(in srgb, var(--axis) 12%, transparent); --axis-edge:color-mix(in srgb, var(--axis-ink) 34%, transparent)`.

**Rule: the axis colour never colours text.** Rails, dots, knob, chip borders, washes only.

Type: headings DM Serif Display; labels/dates/chips Poppins; body Inter.
- Dossier title 22px/1.2 (26px wide), DM Serif Display italic, `--ink`.
- Section headings (`h4`) Poppins 600, 12px, uppercase, `.08em`, `--ink-2`.
- Pole names Poppins 600, 15px, `.02em`, `--ink`.
- Body prose Inter 15.5px/1.62, `--ink`, `max-width:46ch`.
- Meta/dates Poppins 600 13px, `font-variant-numeric: tabular-nums`, `--ink-2`.

## 3. Header

`<h3>` "Where this question comes from" · then a Poppins 12px uppercase line: `Grace — Monergist ↔ Synergist`.

Mini axis bar (`mode:'result'` only): 8px tall, radius 4px, background `color-mix(in srgb,var(--axis) 14%, transparent)`, full width, `aria-hidden="true"`. Knob: 15px circle, solid `var(--axis)` (dark: `--axis-ink`), 2px ring in `var(--panel)`, `left: score%`, `translateX(-50%)`. Pole names sit under the bar ends, 11px Poppins uppercase, left/right aligned.

Caption directly beneath, Inter 14px `--ink-2`, computed from the audited lean rule:
- `Math.abs(score-50) < 10` → "Near the middle of this axis — your answers don't place you at either pole."
- otherwise → `` `${Math.round(Math.abs(score-50)/50*100)}% toward ${pole} · ${band}` `` using the axis's `bands` adjective.

## 4. The disagreement (always visible, never collapsed)

Grid: `1fr 24px 1fr` at ≥640c; single column, `gap:14px`, at <640c. Gap 20px.

Each pole panel `<section aria-labelledby>`: background `var(--panel-2)`, radius 18px, padding 18px 20px, no border, shadow as above. **Mirrored**: left panel has a 3px solid `var(--axis-ink)` rail on its *left* edge (radius 2px, full height, inset 0) and its heading left-aligned; right panel's rail is on its *right* edge with heading right-aligned. Wash is a gradient away from the rail: left `linear-gradient(to right, var(--axis-wash), transparent 72%)`, right `to left`. At <640c both rails move to the left edge and both headings left-align — mirroring only reads as opposition when the panels are side by side.

Panel contents: pole name (`h4`-level, Poppins 600 15px) → fixed sub-label in Inter italic 12.5px `--ink-2`: "the case, as its holders make it" (identical on both sides) → the `left` / `right` prose. Nothing else; reading cards live in their own section so the two prose columns stay short and equal-feeling.

Divider element `<div class="tc-vs" aria-hidden="true">`: 1px `var(--hair)` vertical line, with a 7px square rotated 45° in `var(--axis-ink)` at 50%, background `var(--panel)` padding around it. At <640c it becomes a 1px horizontal hairline with the same diamond centred.

**Fairness rules, non-negotiable:** identical padding, radius, type scale, tint alpha and prose measure on both sides; never reduce opacity, size or saturation of the pole the reader did not land on.

Reader marker (`mode:'result'`, only when `Math.abs(score-50) >= 10`): a pill appended to that side's heading row — 6px solid dot in `var(--axis-ink)` + "your answers lean here", Poppins 500 10.5px uppercase `.06em`, `--ink-2`, background `color-mix(in srgb,var(--axis) 12%, transparent)`, radius 999px, padding 4px 9px.

## 5. "Between the poles" (only when `summary_parts.between` exists)

Full-width card under the grid: background `linear-gradient(90deg, var(--axis-wash), transparent 38%, transparent 62%, var(--axis-wash))`, radius 16px, padding 16px 20px, no rail (it belongs to neither side), text centred, `max-width:62ch; margin-inline:auto`. `h4` "Between the poles", then the `between` prose.

When `Math.abs(score-50) < 10` and this card exists, add a 1px border in `var(--axis-edge)` and the same pill reading "your answers land here". This is the answer to the audited "a midpoint is not a conviction" rule: the central reader gets real content rather than a shrug.

## 6. Method aside (only when `summary_parts.caution` exists)

`<aside class="tc-method">`: background `var(--panel-2)`, 3px left rail in **`--ink-2`, not the axis colour** (it is a statement about the instrument, not about the doctrine), radius 14px, padding 14px 18px. `h4` "A note on method" preceded by a 14px inline SVG ruler/compass glyph in `currentColor`. Prose at 14.5px/1.6 `--ink-2`.

Render the caution prose **verbatim**, including its "One caution about how this axis is built:" opening. Do not strip the lead-in to avoid repeating the heading — the heading is "A note on method", so there is no literal repetition, and a fairness-audited product should never render text that differs from its audited string.

## 7. Passages — "The texts in play"

`<h4>` "The texts in play" with a count badge (`8`), and an Inter 13px `--ink-2` sub-line: **"The passages this argument turns on. Listed for study, not as a proof for either side."**

Chips: `<ul>` of `<li><a>`, `display:flex; flex-wrap:wrap; gap:8px`, list-style none. Chip: height 34px, padding 0 12px, radius 999px, 1px border `var(--axis-edge)`, background transparent, text `--ink` Poppins 500 13.5px, `white-space:nowrap`. Hover/focus: background `color-mix(in srgb,var(--axis) 9%, transparent)`, border `color-mix(in srgb,var(--axis) 45%, transparent)`. Focus ring 2px `var(--ink)` offset 2px.

`href = PASSAGE_URL(ref)` — a single module constant, default `https://www.biblegateway.com/passage/?search=<encoded ref>`; `target="_blank" rel="noopener noreferrer"`; append a visually-hidden " (opens in a new tab)". If per-chip `side` data ever arrives, chips gain a 5px dot in `var(--axis-ink)` aligned left (left pole), right (right pole) or none (both), and the sub-line changes accordingly — **not before**.

## 8. Timeline — "How the argument unfolded"

`<h4>` + count ("9 moments"). Semantic `<ol class="tc-time">`, list-style none.

Wide (≥640c) row geometry: `grid-template-columns: 92px 20px 1fr`. Column 1 = `when` rendered **verbatim**, right-aligned, Poppins 600 13px tabular-nums `--ink-2`. Column 2 carries the rail: a 1.5px `var(--hair)` vertical line at its centre running the full row height (`::before`), plus a 9px dot, solid `var(--axis-ink)`, 2px ring in `var(--panel)`, top-aligned to the first text line (`margin-top:5px`). Column 3 = the `what` text, Inter 15px/1.6, `max-width:52ch`. Row padding 10px 0; hover/`:focus-within` background `color-mix(in srgb,var(--axis) 4%, transparent)` with radius 12px, transition 160ms (suppressed under `prefers-reduced-motion`).

Narrow (<640c): rail at x=10px, dot 8px, date on its own line above the text, text indented 26px, rows 12px apart.

**Gap markers — the feature that makes this a designed timeline rather than a list.** Between consecutive entries, compute start years and, when the difference is ≥200, insert `<li class="tc-gap" aria-hidden="false">`: a 22px segment of rail rendered dashed (`border-left:1.5px dashed var(--hair)`) with a caption in column 3, Poppins 500 11.5px uppercase `.06em` `--ink-2`, reading `≈ 1,000 years`. Round to the nearest 10 below 1000 and nearest 50 above; format with `toLocaleString()`. Give the `<li>` a real screen-reader string: "gap of about 1,000 years".

Year parser (used **only** for gap arithmetic — the visible label is always the raw `when` string):

```
1. first \b\d{3,4}\b            → that number        ("1525", "1830s"→1830, "c. 411–430"→411, "1970s–"→1970)
2. else \b(\d{1,2})(st|nd|rd|th)?…c\.  → (n-1)*100 + (late?80 : early?20 : 50)
                                        ("late 2nd c."→180, "4th–6th c."→350, "c. 155"→handled by rule 1)
3. else null → no gap marker for that pair
```

Never `parseInt(when)` — that returns 2 for "late 2nd c." and produces nonsense gaps.

Do **not** alternate entries left/right by pole. The data does not say which side an event favours, and implying it would be invention.

## 9. Further reading

`<h4>` "Read further", sub-line Inter 13px `--ink-2`: "Books that make each case from the inside."

Two-column grid using the **same** `1fr 24px 1fr` template as §4 (no divider element; the middle column is empty spacer) so each list sits physically under the pole it belongs to. Each column has a Poppins 600 11px uppercase pole-name header in `--ink-2`, aligned like §4 (left / right, both left when stacked), and its own 2px rail in `var(--axis-edge)` down the outer edge at 40% opacity to carry the association when stacked.

Card: `<li>`, background `var(--panel-2)`, radius 14px, padding 12px 14px, 1px solid transparent → hover `var(--axis-edge)`. Split the citation string at the **first** `", "`: author before (Poppins 600 12px `--ink-2`, uppercase off), title after (Inter 15px, `font-style:italic`, `--ink`). If there is no `", "`, render the whole string as the title with no author. (Verified against all 34 entries: "Fee, Paul, the Spirit, and the People of God" → author "Fee", title "Paul, the Spirit, and the People of God".)

Cards are **not links** — there are no URLs in the data and none may be invented. If a `url` field is added later, the card body becomes an `<a>` covering the whole card.

## 10. Disclosure, and the SEO answer

Always in the DOM, always in the HTML source. No lazy injection, no `display:none` on content the crawler should see, no JS-built prose.

- §3–§6 (header, both poles, between, method): **never collapsible**. It is 39–99 words per side; collapsing the payoff is what made the last attempt feel like homework.
- §7 passages: `<details open>` everywhere — it is two rows of chips and it is the visible proof of seriousness.
- §8 timeline and §9 reading: `<details>`, `open` set at render time when `matchMedia('(min-width:760px)').matches || mode==='page'`, closed otherwise. Set `open` before insertion into the document so there is no layout shift.
- `<summary>` styling: `list-style:none; ::-webkit-details-marker{display:none}`, `cursor:pointer`, min-height 44px, a 10px chevron SVG that rotates 90° via `details[open] summary svg`, visible focus ring 2px `var(--ink)` offset 2px. `<summary>` is natively keyboard-reachable — do not replace it with a `<button>` + `hidden` div.
- One control at the dossier foot: `<button class="tc-expand">Open every section</button>`, which sets `open` on all `<details>` inside and swaps its label to "Collapse the extras".

**Indexability.** Do not rely on the result page for search traffic. Result permalinks (`/r/theology-compass/<code>`) are per-user and near-duplicate across thousands of URLs — give them `<meta name="robots" content="noindex,follow">`. The canonical SEO surface is a **static per-axis page** at `/q/theology-compass/axis/<key>` rendering this exact component in `mode:'page'` (everything open, `<h1>` = axis name, `headingLevel:2`), with `Article` JSON-LD, a self-referencing `<link rel="canonical">`, and the axis's `bands`/pole names in the meta description. Every dossier on a result page ends with a crawlable `<a href="{canonicalHref}">The full history of this question →</a>`. Six axes → six substantial, stable, linkable pages, all cross-linked to the quiz and to formation articles, with zero dependence on how a crawler treats a closed `<details>`.

**Placement on the result page:** wrap each axis's dossier in a `<details class="tc-open">` whose summary is the axis row itself; open by default only for the single axis with the largest `Math.abs(score-50)`, so a reader sees one dossier without meeting six. Since result pages are `noindex`, this costs nothing.

## 11. Accessibility

Real semantics: `<article> <section aria-labelledby> <ol> <ul>`. Heading levels driven by `opts.headingLevel` — never hard-coded. `<time datetime>` only when `when` is exactly four digits; otherwise a plain `<span>` (there is no valid `datetime` for "c. 411–430"). All text contrast ≥ 4.5:1 in both themes (light `#444` on `#F4F3F1` ≈ 8.4:1; `--ink-2 #6B6B6B` ≈ 4.9:1; dark `#E8E6E3` on `#2A2A2E` ≈ 11:1, `#A9A6A1` ≈ 6.1:1). Pole identity is carried by position, label and rail side — never by hue alone. Build all nodes with `createElement`/`textContent`; never `innerHTML` with data strings. Respect `prefers-reduced-motion` for the hover and chevron transitions.

## Markup sketch

```html
&lt;style&gt;
.tc-dossier{
  --axis-ink:var(--axis);
  --axis-wash:color-mix(in srgb, var(--axis) 7%, transparent);
  --axis-edge:color-mix(in srgb, var(--axis) 28%, transparent);
  container-type:inline-size; container-name:dossier;
  max-width:820px; padding:20px; border-radius:22px;
  background:var(--panel); box-shadow:3px 3px 5px rgba(68,68,68,.065);
  color:var(--ink); font-family:Inter,system-ui,sans-serif;
}
:root:not([data-theme="light"]) .tc-dossier,
[data-theme="dark"] .tc-dossier{
  --axis-ink:color-mix(in oklab, var(--axis) 68%, white);
  --axis-wash:color-mix(in srgb, var(--axis) 12%, transparent);
  --axis-edge:color-mix(in srgb, var(--axis-ink) 34%, transparent);
  box-shadow:0 2px 6px rgba(0,0,0,.35);
}
.tc-dossier h3{font-family:"DM Serif Display",Georgia,serif;font-style:italic;font-size:22px;line-height:1.2;margin:0 0 4px}
.tc-dossier h4{font-family:Poppins,system-ui,sans-serif;font-weight:600;font-size:12px;
  letter-spacing:.08em;text-transform:uppercase;color:var(--ink-2);margin:0 0 8px}

/* ---- header bar: low-opacity track, solid knob ---- */
.tc-bar{position:relative;height:8px;border-radius:4px;margin:14px 0 8px;
  background:color-mix(in srgb,var(--axis) 14%,transparent)}
.tc-knob{position:absolute;top:50%;width:15px;height:15px;border-radius:50%;
  background:var(--axis-ink);box-shadow:0 0 0 2px var(--panel);transform:translate(-50%,-50%)}

/* ---- the disagreement: the grid IS the axis ---- */
.tc-poles{display:grid;grid-template-columns:1fr;gap:14px;margin:18px 0}
.tc-pole{position:relative;padding:18px 20px;border-radius:18px;background:var(--panel-2);
  box-shadow:3px 3px 5px rgba(68,68,68,.065);overflow:hidden}
.tc-pole::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;border-radius:2px;background:var(--axis-ink)}
.tc-pole.l{background-image:linear-gradient(to right,var(--axis-wash),transparent 72%)}
.tc-pole.r{background-image:linear-gradient(to right,var(--axis-wash),transparent 72%)}
.tc-pole h5{font-family:Poppins;font-weight:600;font-size:15px;margin:0}
.tc-pole .gloss{font-size:12.5px;font-style:italic;color:var(--ink-2);margin:2px 0 10px}
.tc-pole p{font-size:15.5px;line-height:1.62;max-width:46ch;margin:0}
.tc-vs{display:flex;align-items:center;justify-content:center}
.tc-vs::before{content:"";flex:1;height:1px;background:var(--hair)}
.tc-vs i{width:7px;height:7px;background:var(--axis-ink);transform:rotate(45deg);margin:0 8px}
.tc-vs::after{content:"";flex:1;height:1px;background:var(--hair)}
.tc-you{display:inline-flex;align-items:center;gap:6px;margin-left:8px;padding:4px 9px;border-radius:999px;
  background:color-mix(in srgb,var(--axis) 12%,transparent);
  font-family:Poppins;font-size:10.5px;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-2)}
.tc-you b{width:6px;height:6px;border-radius:50%;background:var(--axis-ink)}

@container dossier (min-width:640px){
  .tc-dossier{padding:28px}
  .tc-poles{grid-template-columns:1fr 24px 1fr;gap:20px}
  .tc-pole.r{text-align:right;background-image:linear-gradient(to left,var(--axis-wash),transparent 72%)}
  .tc-pole.r::before{inset:0 0 0 auto}
  .tc-pole.r p{margin-left:auto;text-align:left}   /* prose stays LTR; only the header mirrors */
  .tc-vs{flex-direction:column}
  .tc-vs::before,.tc-vs::after{width:1px;height:auto;flex:1}
  .tc-vs i{margin:8px 0}
}
@supports not (container-type:inline-size){
  @media (min-width:760px){ /* repeat the block above */ }
}

/* ---- between / method ---- */
.tc-between{padding:16px 20px;border-radius:16px;text-align:center;max-width:62ch;margin:0 auto 18px;
  background:linear-gradient(90deg,var(--axis-wash),transparent 38%,transparent 62%,var(--axis-wash))}
.tc-method{position:relative;padding:14px 18px 14px 20px;border-radius:14px;background:var(--panel-2);
  font-size:14.5px;line-height:1.6;color:var(--ink-2);margin-bottom:18px}
.tc-method::before{content:"";position:absolute;inset:0 auto 0 0;width:3px;border-radius:2px;background:var(--ink-2)}

/* ---- chips ---- */
.tc-chips{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:0}
.tc-chips a{display:inline-flex;align-items:center;height:34px;padding:0 12px;border-radius:999px;
  border:1px solid var(--axis-edge);color:var(--ink);text-decoration:none;white-space:nowrap;
  font-family:Poppins;font-weight:500;font-size:13.5px}
.tc-chips a:hover,.tc-chips a:focus-visible{background:color-mix(in srgb,var(--axis) 9%,transparent);
  border-color:color-mix(in srgb,var(--axis) 45%,transparent)}

/* ---- timeline ---- */
.tc-time{list-style:none;padding:0;margin:0}
.tc-time li{position:relative;display:grid;grid-template-columns:20px 1fr;gap:0 6px;padding:12px 0 12px 0}
.tc-time li::before{content:"";position:absolute;left:9px;top:0;bottom:-12px;width:1.5px;background:var(--hair)}
.tc-time li:last-child::before{bottom:auto;height:14px}
.tc-time .dot{grid-column:1;width:8px;height:8px;margin-top:6px;border-radius:50%;
  background:var(--axis-ink);box-shadow:0 0 0 2px var(--panel);z-index:1}
.tc-time .when{grid-column:2;font-family:Poppins;font-weight:600;font-size:13px;
  font-variant-numeric:tabular-nums;color:var(--ink-2)}
.tc-time .what{grid-column:2;font-size:15px;line-height:1.6;max-width:52ch;margin:2px 0 0}
.tc-gap{min-height:22px;color:var(--ink-2)}
.tc-gap::before{border-left:1.5px dashed var(--hair);background:none!important;width:0}
.tc-gap .cap{grid-column:2;font-family:Poppins;font-weight:500;font-size:11.5px;
  letter-spacing:.06em;text-transform:uppercase}
@container dossier (min-width:640px){
  .tc-time li{grid-template-columns:92px 20px 1fr;padding:10px 0;border-radius:12px;transition:background .16s}
  .tc-time li:hover{background:color-mix(in srgb,var(--axis) 4%,transparent)}
  .tc-time li::before{left:101px}
  .tc-time .when{grid-column:1;text-align:right;padding-top:1px}
  .tc-time .dot{grid-column:2;justify-self:center;width:9px;height:9px;margin-top:5px}
  .tc-time .what,.tc-gap .cap{grid-column:3}
}
@media (prefers-reduced-motion:reduce){.tc-time li{transition:none}}

/* ---- reading ---- */
.tc-read{display:grid;grid-template-columns:1fr;gap:14px}
.tc-read ul{list-style:none;padding:0;margin:0;display:grid;gap:8px}
.tc-read li{padding:12px 14px;border-radius:14px;background:var(--panel-2);border:1px solid transparent}
.tc-read li:hover{border-color:var(--axis-edge)}
.tc-read .au{font-family:Poppins;font-weight:600;font-size:12px;color:var(--ink-2)}
.tc-read .ti{font-size:15px;font-style:italic;display:block}
@container dossier (min-width:640px){.tc-read{grid-template-columns:1fr 24px 1fr}
  .tc-read>div:last-child{grid-column:3}}

/* ---- disclosure ---- */
.tc-dossier details{border-top:1px solid var(--hair);margin-top:18px;padding-top:14px}
.tc-dossier summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:8px;min-height:44px}
.tc-dossier summary::-webkit-details-marker{display:none}
.tc-dossier summary:focus-visible{outline:2px solid var(--ink);outline-offset:2px;border-radius:8px}
.tc-dossier summary svg{transition:transform .16s}
.tc-dossier details[open] summary svg{transform:rotate(90deg)}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
&lt;/style&gt;

&lt;article class="tc-dossier" style="--axis:#2F4FCB"&gt;
  &lt;h3&gt;Where this question comes from&lt;/h3&gt;
  &lt;p class="tc-sub"&gt;Grace — Monergist ↔ Synergist&lt;/p&gt;

  &lt;div class="tc-bar" aria-hidden="true"&gt;&lt;span class="tc-knob" style="left:34%"&gt;&lt;/span&gt;&lt;/div&gt;
  &lt;p class="tc-cap"&gt;32% toward Monergist · monergist-leaning&lt;/p&gt;

  &lt;div class="tc-poles"&gt;
    &lt;section class="tc-pole l" aria-labelledby="grace-l"&gt;
      &lt;h5 id="grace-l"&gt;Monergist
        &lt;span class="tc-you"&gt;&lt;b&gt;&lt;/b&gt;your answers lean here&lt;/span&gt;&lt;/h5&gt;
      &lt;p class="gloss"&gt;the case, as its holders make it&lt;/p&gt;
      &lt;p&gt;Monergists (God alone brings a person to faith) hold that salvation is God's work from
         beginning to end… &lt;!-- summary_parts.left, verbatim --&gt;&lt;/p&gt;
    &lt;/section&gt;
    &lt;div class="tc-vs" aria-hidden="true"&gt;&lt;i&gt;&lt;/i&gt;&lt;/div&gt;
    &lt;section class="tc-pole r" aria-labelledby="grace-r"&gt;
      &lt;h5 id="grace-r"&gt;Synergist&lt;/h5&gt;
      &lt;p class="gloss"&gt;the case, as its holders make it&lt;/p&gt;
      &lt;p&gt;Synergists (the person freely cooperates with the grace God gives) hold that God's grace
         always comes first… &lt;!-- summary_parts.right, verbatim --&gt;&lt;/p&gt;
    &lt;/section&gt;
  &lt;/div&gt;

  &lt;aside class="tc-method"&gt;
    &lt;h4&gt;A note on method&lt;/h4&gt;
    &lt;p&gt;One caution about how this axis is built: statement 2 scores resistible grace toward the
       synergist pole… &lt;!-- summary_parts.caution, verbatim, lead-in NOT stripped --&gt;&lt;/p&gt;
  &lt;/aside&gt;

  &lt;section aria-labelledby="grace-tx"&gt;
    &lt;h4 id="grace-tx"&gt;The texts in play &lt;span class="n"&gt;8&lt;/span&gt;&lt;/h4&gt;
    &lt;p class="sub"&gt;The passages this argument turns on. Listed for study, not as a proof for either side.&lt;/p&gt;
    &lt;ul class="tc-chips"&gt;
      &lt;li&gt;&lt;a href="https://www.biblegateway.com/passage/?search=Romans%209"
             target="_blank" rel="noopener noreferrer"&gt;Romans 9&lt;span class="vh"&gt; (opens in a new tab)&lt;/span&gt;&lt;/a&gt;&lt;/li&gt;
      &lt;!-- … --&gt;
    &lt;/ul&gt;
  &lt;/section&gt;

  &lt;details&gt;&lt;!-- open set in JS when wide or mode==='page' --&gt;
    &lt;summary&gt;&lt;svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"&gt;&lt;path d="M2 1l5 4-5 4" fill="none" stroke="currentColor" stroke-width="1.5"/&gt;&lt;/svg&gt;
      &lt;h4&gt;How the argument unfolded — 9 moments&lt;/h4&gt;&lt;/summary&gt;
    &lt;ol class="tc-time"&gt;
      &lt;li&gt;&lt;span class="dot"&gt;&lt;/span&gt;&lt;span class="when"&gt;529&lt;/span&gt;
          &lt;p class="what"&gt;Second Council of Orange: even the beginning of faith is God's gift…&lt;/p&gt;&lt;/li&gt;
      &lt;li class="tc-gap"&gt;&lt;span class="cap"&gt;≈ 1,000 years&lt;span class="vh"&gt; gap in the record&lt;/span&gt;&lt;/span&gt;&lt;/li&gt;
      &lt;li&gt;&lt;span class="dot"&gt;&lt;/span&gt;&lt;span class="when"&gt;1525&lt;/span&gt;
          &lt;p class="what"&gt;Luther, The Bondage of the Will, answers Erasmus's defense of free choice.&lt;/p&gt;&lt;/li&gt;
    &lt;/ol&gt;
  &lt;/details&gt;

  &lt;details&gt;
    &lt;summary&gt;&lt;svg …&gt;&lt;/svg&gt;&lt;h4&gt;Read further — 7 books&lt;/h4&gt;&lt;/summary&gt;
    &lt;p class="sub"&gt;Books that make each case from the inside.&lt;/p&gt;
    &lt;div class="tc-read"&gt;
      &lt;div&gt;&lt;h4&gt;Monergist&lt;/h4&gt;&lt;ul&gt;
        &lt;li&gt;&lt;span class="au"&gt;Luther&lt;/span&gt;&lt;span class="ti"&gt;The Bondage of the Will&lt;/span&gt;&lt;/li&gt;
      &lt;/ul&gt;&lt;/div&gt;
      &lt;div&gt;&lt;h4&gt;Synergist&lt;/h4&gt;&lt;ul&gt;
        &lt;li&gt;&lt;span class="au"&gt;Wesley&lt;/span&gt;&lt;span class="ti"&gt;Predestination Calmly Considered&lt;/span&gt;&lt;/li&gt;
      &lt;/ul&gt;&lt;/div&gt;
    &lt;/div&gt;
  &lt;/details&gt;

  &lt;p class="tc-more"&gt;&lt;a href="/q/theology-compass/axis/grace"&gt;The full history of this question →&lt;/a&gt;&lt;/p&gt;
&lt;/article&gt;

&lt;script&gt;
// --- build-time split, verified: parts.join(' ') === fair_summary for all six axes ---
const SENT = /(?&lt;=[.?!])\s+(?=[A-Z“‘(])/;
const BOUNDS = {                       // human-verified sentence spans, NOT inferred
  grace:{left:[0,2],right:[2,5],caution:[5,8]},
  table:{left:[0,1],right:[1,2],between:[2,3]},
  spirit:{left:[0,1],right:[1,3]},
  kingdom:{left:[0,1],right:[1,2],between:[2,3]},
  tradition:{left:[0,1],right:[1,2]},
  worship:{left:[0,1],right:[1,2]}
};
function splitSummary(axis){                       // run in Node, write to the JSON, assert round-trip
  const s = axis.fair_summary.split(SENT), b = BOUNDS[axis.key], out = {};
  for (const k of ['left','right','between','caution'])
    if (b[k]) out[k] = s.slice(b[k][0], b[k][1]).join(' ');
  const norm = t =&gt; t.replace(/\s+/g,' ').trim();
  if (norm(Object.values(out).join(' ')) !== norm(axis.fair_summary))
    throw new Error('summary_parts do not rejoin to fair_summary: ' + axis.key);
  return out;
}

// --- runtime: year parsing for gap markers only; the label is always `when` verbatim ---
function startYear(when){
  const s = when.toLowerCase();
  let m = s.match(/\b(\d{3,4})\b/);                        // 1525 · 1830s · c. 411–430 · 1970s–
  if (m) return +m[1];
  m = s.match(/\b(\d{1,2})(?:st|nd|rd|th)?\b[^.]*?c\./);   // late 2nd c. · 4th–6th c.
  if (!m) return null;
  const base = (+m[1] - 1) * 100;
  return base + (/late/.test(s) ? 80 : /early/.test(s) ? 20 : 50);
}
function gapLabel(a, b){
  const y1 = startYear(a), y2 = startYear(b);
  if (y1 == null || y2 == null) return null;
  const g = y2 - y1; if (g &lt; 200) return null;
  const r = g &lt; 1000 ? Math.round(g/10)*10 : Math.round(g/50)*50;
  return '≈ ' + r.toLocaleString() + ' years';
}

// --- citation split: first ", " only ---
function citation(str){
  const i = str.indexOf(', ');
  return i &gt; 0 ? {author: str.slice(0,i), title: str.slice(i+2)} : {author:'', title:str};
}

// --- disclosure defaults: set `open` before insertion, never remove content ---
function applyDisclosure(root, mode){
  const wide = mode === 'page' || window.matchMedia('(min-width:760px)').matches;
  root.querySelectorAll('details[data-extra]').forEach(d =&gt; { d.open = wide; });
}
&lt;/script&gt;
```

## Pitfalls

- Splitting fair_summary with a regex at runtime. The pole cues genuinely differ across axes ('Synergists…', 'The memorial view…', 'Cessationists…', 'Those who hold to Scripture alone…', 'Free worship…'), and cue-word inference is provably wrong in two real cases: grace's 'Many synergists, including most Baptists…' belongs to the RIGHT pole, while kingdom's 'Progressive dispensationalists add…' belongs to BETWEEN. Cut the string once at build time with the verified boundary map and assert the parts rejoin to the original.
- Assigning scripture passages to a pole. key_passages is a flat list with no side information; Romans 9 and 1 Timothy 2:3–4 are argued by both camps. Grouping chips 'by which side reaches for them' would be invented editorial content on a page whose entire moat is that nothing is invented. Ship one shared strip until an editor adds a cited `side` field.
- Signalling the reader's own pole by dimming, shrinking or desaturating the other one. The marker must be additive (a small pill on the reader's side) and both panels must keep identical padding, radius, tint alpha, type scale and prose measure. Asymmetry is what gets screenshotted.
- Setting body or chip text in the axis colour. #C98A12 gold on #EEEEEE is roughly 2.6:1 and fails outright; #E2582B orange is not much better. The axis colour is only rails, dots, the knob, chip borders and a ~7% wash.
- Filling the pole panels with the axis colour at full or near-full saturation. The version people liked was a low-opacity tinted track with a solid knob; reproduce that layering here — a 3% –12% wash gradient plus one solid 3px rail — rather than a flat coloured card.
- Keeping the mirrored right-alignment when the columns stack on mobile. Mirroring only reads as opposition side by side; stacked, a right-aligned heading and a right-edge rail read as a rendering bug. At <640px container width both rails move to the left edge and both headings left-align.
- Alternating timeline entries left and right of the rail to suggest which pole an event favoured. The data does not contain that, and Orange 529 or Trent 1547 cannot be assigned a side without an argument. One rail, one side.
- Computing gap markers with parseInt(when). 'late 2nd c.' yields 2, '4th–6th c.' yields 4, and the timeline sprouts nonsense gaps of 1,500 years in the wrong places. Use the two-rule parser, and return null rather than guessing — a missing gap marker is invisible, a wrong one is a credibility hit.
- Emitting <time datetime="c. 411–430"> or datetime="0411". Only four-digit whens get a <time> element; everything else is a plain span. And the visible label is always the raw string — never a normalised year, because 'c.' is doing real epistemic work.
- Achieving 'progressive disclosure' by injecting the deep content with JS, or by putting the pole prose itself behind an accordion. The prose is 39–99 words per side; collapsing it hides the payoff and, on the canonical axis pages, removes the only thing worth indexing. Everything ships in the HTML; only the timeline and the reading lists collapse, and only on narrow screens.
- Treating result permalinks as the SEO surface. Thousands of near-duplicate /r/<code> pages will cannibalise each other. Result pages get noindex,follow; the six static /q/theology-compass/axis/<key> pages render the same component fully open and carry the canonical, the h1 and the JSON-LD.
- Hard-coding heading levels. The same component renders inside a result page (h3/h4) and as the body of a standalone axis page (h2 under an h1). Drive it from opts.headingLevel or the axis pages will have skipped or duplicated levels.
- Stripping 'One caution about how this axis is built:' from the caution prose because the aside already has a heading. Audited text is rendered verbatim; use the heading 'A note on method' so there is no literal repetition, and change nothing inside the string.
- Linking further-reading cards to a search engine or a bookseller to make them feel clickable. There are no URLs in the data; fabricating destinations is the same failure class as fabricating a citation. Cards stay inert until a verified `url` field exists.
- Building the DOM with innerHTML and interpolated data strings, or forgetting that summary_parts may be absent for a newly authored axis. Use createElement/textContent, and fall back to rendering fair_summary as one full-width block rather than guessing a split in the browser.

---

## CRITIQUE

### Logical incoherence found

- The gap marker asserts '≈ 1,000 years' inside a 22px segment sitting between ~58px rows that span 30 years each — the visual encoding states the opposite of the caption. A reader who trusts their eyes learns the wrong fact.
- §5 is framed as the answer to the audited 'a midpoint is not a conviction' rule, but the `between` part exists on only 2 of 6 axes, so on 4 axes a central reader is shown no marker and no middle content at all.
- §10 requires prose in the HTML source AND requires `open` to be set on elements before they are inserted into the document. Both cannot be true of the same node.
- The right pole panel right-aligns its heading while left-aligning its sub-label and body, producing a single mirrored line rather than a mirrored panel.
- The parser comment documents outputs ('1830s'→1830) that the regex beside it provably does not produce.

### Worst problems

- THE MARQUEE FEATURE ENCODES ITS OWN CLAIM BACKWARDS. §8 argues that rendering the 411→1739 grace history makes the millennium gap 'visible'. As specified it does the opposite: a normal row is `padding:10px 0` plus ~2 lines of 15px/1.6 text ≈ 58px tall for a 30-year interval, while the 996-year gap gets `min-height:22px`. That is ~1.9px per year for the dense stretch and 0.022px per year for the canyon — the gap is rendered 86x SMALLER per year than the periods it is supposed to dwarf. A caption reading '≈ 1,000 years' inside a 22px sliver is telling, not showing, and it is telling something the geometry actively contradicts. This is the same class of failure as labelling one pole: the picture says one thing and the words say another.
- THE YEAR PARSER IS BROKEN AND THE SPEC ASSERTS IT IS VERIFIED. Rule 1 is `\b(\d{3,4})\b`. There is no word boundary between '0' and 's', so '1830s' does not match — yet the spec's own inline comment claims '1830s'→1830 and '1970s–'→1970. I ran it over all 55 history entries: 7 return null — '1830s' (twice), '1950s', '1960s', '1970s–', '1980s–90s', '1990s'. Consequence: kingdom's Darby 1830s node and worship's 1830s and 1970s– nodes are un-year-able, so the 334-year 1572→1830 worship gap and every gap adjacent to a decade form silently vanishes. Fix is one character class: `/\d{3,4}/`. That a spec whose entire argument is 'I verified this' ships a false verification of its only computable claim is the exact credibility failure this product cannot afford.
- THE BOTTOM TWO-THIRDS IS THE SAME DULL STACK THAT GOT REJECTED, RE-BULLETED. §7 is ten identical grey outline pills — a tag cloud, which is the 'run-on line of passages' complaint with rounded corners. §8 is date | dot | text, the single most default timeline pattern that exists. §9 is two lists of grey cards. Nothing below the pole panels has any typographic structure, hierarchy, or reason to look at it twice. The spec's defence of §8 ('the feature that makes this a designed timeline rather than a list') rests entirely on the gap marker, which per problem 1 does not work.
- 'BETWEEN THE POLES' ANSWERS THE MIDPOINT RULE FOR ONLY 2 OF 6 AXES. §5 is presented as 'the answer to the audited a-midpoint-is-not-a-conviction rule: the central reader gets real content rather than a shrug.' But `summary_parts.between` exists only for table and kingdom. On grace, spirit, tradition and worship a reader inside ±10 of centre gets the pill suppressed in §4 and no §5 card at all — so the most common and most doctrinally delicate result state renders as literally nothing. The spec never notices this because it reasoned from the schema, not the data.
- THE COMPONENT CANNOT SATISFY ITS OWN SEO SECTION. §1 returns an HTMLElement built with createElement; §10 demands 'always in the DOM, always in the HTML source... no JS-built prose', then §10 also demands `open` be 'set before insertion into the document so there is no layout shift'. Server-rendered markup cannot be mutated before insertion — it is already inserted. Nothing in the spec says the render function also runs at build time in the existing Astro pipeline to emit static HTML, which is the only thing that reconciles the three statements. As written an implementer ships a client-rendered component and the six canonical axis pages index as empty shells.
- FALSE COUNT: '(Verified against all 34 entries)' in §9. The data holds 29 read_more entries (grace 3+4, table 3+3, spirit 2+2, kingdom 2+2, tradition 2+2, worship 2+2). The citation-split rule itself is correct — the count is not. Second unverified 'verified'.
- THE MIRROR IS A HALF-MIRROR THAT WILL READ AS A BUG. `.tc-pole.r{text-align:right}` then `.tc-pole.r p{margin-left:auto;text-align:left}` — the `p` selector also catches `.gloss`, so on the right panel exactly one line (the pole name) is right-aligned and the sub-label and prose are left-aligned and pushed right by `margin-left:auto` against a 46ch max-width. One stray right-aligned word above two left-aligned blocks is not mirroring, it is a rendering artefact.
- THE ASSOCIATION DEVICES ARE MATHEMATICALLY INVISIBLE. §9's pole rail is '2px in var(--axis-edge) at 40% opacity' — `--axis-edge` is already `color-mix(var(--axis) 28%, transparent)`, so 0.28 x 0.40 = 11% alpha at 2px wide. §5's between-card gradient is a 7% wash fading to transparent at 38%/62%, i.e. a ~7% tint over ~three-eighths of the card on #EEEEEE. Both are below the perceptual floor. The spec is so anxious about the 'flat saturated blocks' note that it has swung to devices that do not render.
- UNBUILDABLE AS WRITTEN, TWICE. `@supports not (container-type:inline-size){ @media (min-width:760px){ /* repeat the block above */ }}` is a TODO, not CSS — and it is dead weight regardless. And `.tc-gap::before{border-left:1.5px dashed var(--hair);background:none!important;width:0}` sets width to 0 while the solid rail it must align with is `left:101px;width:1.5px`, so the dashes land 0.75px off the solid rail's centre — a visible kink on the exact element that is meant to be the feature.
- REDUNDANT AXIS BAR. §10 wraps each dossier in a `<details>` 'whose summary is the axis row itself' — that row already carries a tinted bar and solid knob. §3 then draws a second 8px bar with a second 15px knob at the same score, roughly 40px below the first. Same datum, twice, adjacent.
- HEADING HIERARCHY IS INVERTED AND HARD-CODED. §11 insists levels are driven by `opts.headingLevel`, 'never hard-coded'; the markup sketch hard-codes h3, h4, h5 throughout. Worse, pole names in §4 are `h5` while the further-reading column headers that refer back to those same poles are `h4` — the reference outranks the referent, and a screen-reader user walking the outline meets 'Monergist' at level 4 after having met 'Monergist' at level 5.

### What must survive

- THE TWO-PANEL GRID AS THE FIX FOR THE BIPOLAR FAILURE. 'The grid has two named cells, so neither side can exist without the other' is exactly right and structurally guarantees the thing that broke last time. Outer-edge rail + wash fading inward genuinely reads as two ends of a bar. Keep verbatim.
- BUILD-TIME SUMMARY SPLIT WITH A ROUND-TRIP INVARIANT, NOT A RUNTIME REGEX. I executed the boundary map against the data: all six axes round-trip to `fair_summary` character-for-character after whitespace normalisation. The two hard cases the spec names are correctly resolved — grace's 'Many synergists, including most Baptists…' does belong to right, kingdom's 'Progressive dispensationalists add…' does belong to between. The selftest invariant that audited prose cannot be silently dropped or reworded is the single best idea in the document.
- REFUSING TO ASSIGN PASSAGES OR TIMELINE EVENTS TO A POLE. Romans 9 and 1 Tim 2:3–4 are genuinely claimed by both camps; alternating timeline entries by side would be invented editorial content on a page whose moat is that nothing is invented. Correct call, correctly argued. Hold this line in the rewrite.
- THE ADDITIVE READER MARKER. Marking the reader's side by ADDING a pill and never by dimming, shrinking or desaturating the other, with identical padding/radius/tint/type/measure on both panels. This is the rule that survives a hostile screenshot.
- THE AXIS COLOUR NEVER COLOURS TEXT — rails, dots, knob, chip borders and wash only. #C98A12 on #EEEEEE is ~2.6:1; this rule is both the accessibility fix and the anti-flat fix, and it is stated crisply enough to enforce in review.
- RENDERING THE CAUTION VERBATIM INCLUDING ITS 'One caution about how this axis is built:' lead-in, under a differently-worded heading. Never edit audited strings for cosmetics.
- READING CARDS STAY INERT because no URLs exist in the data, and passages link only to a single module-level PASSAGE_URL constant. Fabricating destinations is the same failure class as fabricating a citation.
- NOINDEX ON /r/<code> PERMALINKS, with six static /q/theology-compass/axis/<key> pages as the canonical indexable surface rendering the same component fully open. Strategically correct and it gives the long-form content a real home instead of burying it under a per-user result.
- MIRRORING COLLAPSES ON NARROW. Both rails to the left edge and both headings left-aligned under 640px — stacked mirroring reads as a bug. Right, and rarely remembered.

### Rewritten spec

REPLACING THE WEAKEST THIRD: §7 passages, §8 timeline, §9 further reading — plus the two correctness fixes they depend on. §0–§6 and §10–§11 stand as written apart from the four repairs listed at the end.

═══════════════════════════════════════
FIX A — THE YEAR PARSER (prerequisite for §8)
═══════════════════════════════════════

Rule 1 becomes an unanchored digit run. Word boundaries are wrong here because decade forms end in a word character.

```js
// Returns {year:Number, exact:Boolean} or null. Used ONLY for geometry.
// The visible label is ALWAYS the raw `when` string. `c.` does real epistemic work.
function startYear(when){
  const s = when.toLowerCase();
  let m = s.match(/\d{3,4}/);                              // 1525 · 1830s · c. 411–430 · 1970s– · 1609–89
  if (m) return { year:+m[0], exact: !/^c\.|\bc\.\s*\d|s\b|s–/.test(s) };
  m = s.match(/(\d{1,2})(?:st|nd|rd|th)?[^.]*?c\./);       // late 2nd c. · 4th–6th c. · late 1st c.
  if (!m) return null;
  const base = (+m[1] - 1) * 100;
  return { year: base + (/late/.test(s) ? 80 : /early/.test(s) ? 20 : 50), exact:false };
}
```

Verified over all 55 history entries: 55/55 resolve, 0 nulls. The old rule returned null for '1830s' x2, '1950s', '1960s', '1970s–', '1980s–90s', '1990s'.

Add to `audit/selftest.js`, must fail the build: every `history[].when` in every axis resolves non-null, and years are non-decreasing within each axis. A future editor writing 'mid-1800s' should break CI, not silently flatten the spine.

═══════════════════════════════════════
FIX B — DELETE THE DUPLICATE BAR
═══════════════════════════════════════

Remove the §3 mini bar and knob entirely when `mode:'result'`, because the `<summary>` axis row directly above already carries a bar and knob at the same score. Keep only the uppercase pole line and the lean caption. Restore the bar for `mode:'page'`, where there is no row above it and `score` is null — in that case render the track with no knob and the caption 'Take the quiz to place yourself on this axis →'.

═══════════════════════════════════════
§7 — THE TEXTS IN PLAY (replaces the pill cloud)
═══════════════════════════════════════

The problem with 8–10 identical outline pills is that they carry no hierarchy and no information beyond their own text. Two changes, both pure derivation from the existing strings — nothing invented, no side assigned.

7.1 CANONICAL ORDER. Ship a static 66-entry `BOOK_ORDER` map (Genesis 1 … Revelation 66) in the module. Sort `key_passages` by [book index, first chapter number]. Grace currently reads 'Romans 9 | Romans 8:28–30 | Ephesians…' — a rigour-first product must not print Romans 9 before Romans 8. After sort: John 6:37–44 · Acts 7:51 · Romans 8:28–30 · Romans 9 · Ephesians 1:3–14 · Philippians 2:12–13 · 1 Timothy 2:3–4 · 2 Peter 3:9. If a book is absent from the map, append it at the end in original order and log a build warning; never drop it.

7.2 MERGE REPEATED BOOKS into one entry with the ranges joined by a thin ' · ': `Romans 8:28–30 · 9`. Table's ten refs collapse to seven entries, 1 Corinthians and Matthew and Acts each becoming one. Fewer, denser objects.

7.3 THE REFERENCE SHEET, not a chip strip. One card, `background:var(--panel-2)`, `border-radius:16px`, `padding:16px 18px 14px`, a 3px top rail in `var(--axis-edge)` inset 16px from both sides with `border-radius:2px`, no other border. Inside, a `<ul>` at `display:grid; grid-template-columns:repeat(auto-fill,minmax(150px,1fr)); gap:0; list-style:none; padding:0`.

Each `<li><a>` is a two-line typographic unit, not a pill:
- line 1, the book: Poppins 600, 13px, `letter-spacing:.01em`, `var(--ink)`.
- line 2, the reference: Inter 13px, `font-variant-numeric:tabular-nums`, `var(--ink-2)`, `margin-top:1px`.
- `<a>` is `display:block; padding:9px 10px; border-radius:10px; text-decoration:none; min-height:44px`.
- Separation is a hairline, not a border box: `li{border-top:1px solid var(--hair)}` and `li:nth-child(-n+2){border-top:0}` at the two-column breakpoint (recompute per column count with `:nth-child` or simply give the `ul` a `1px var(--hair)` `row-gap` via `background:var(--hair); gap:1px` on a grid whose `li` are `background:var(--panel-2)` — the gap-as-hairline trick, which is exact at any column count and needs no nth-child arithmetic).
- Hover/`:focus-visible`: `background:color-mix(in srgb,var(--axis) 8%,transparent)` and a 3px solid `var(--axis-ink)` bar appears at the `<a>`'s left edge via a `::before` that scales from `scaleY(0)` to `scaleY(1)`, `transform-origin:center`, 140ms, suppressed under `prefers-reduced-motion`. Solid marker over low-opacity wash — the exact layering the earlier liked version used.
- Focus ring: 2px `var(--ink)`, offset 2px, `border-radius:10px`.

7.4 HEADING AND SUB-LINE, unchanged in wording: `h{n}` 'The texts in play' with the merged count, then Inter 13px `var(--ink-2)`: 'The passages this argument turns on. Listed for study, not as a proof for either side.' Keep the `target="_blank" rel="noopener noreferrer"` plus visually-hidden ' (opens in a new tab)'.

Why this is not the rejected version: a grid of hairline-separated two-line units reads as a reference sheet — an object with internal structure — where a wrap of pills reads as tags. It also fixes a real ordering embarrassment for free.

═══════════════════════════════════════
§8 — THE CENTURY SPINE (replaces date | dot | text)
═══════════════════════════════════════

The rule: DISTANCE ON THE PAGE IS MONOTONIC IN ELAPSED TIME. The 996-year silence between Orange (529) and Luther (1525) must be physically the tallest space in the component, and larger than the 353-year gap, which must be larger than the 30-year gap. That is the whole idea, and it is the thing the previous §8 claimed and did not do.

8.1 GEOMETRY. Between consecutive entries insert a spacer element whose height is a square-root function of elapsed years:

```js
const GAP_K = 5.2, GAP_MAX = 190, GAP_MIN_SHOWN = 24;     // narrow: 3.4 / 120
function gapPx(years){
  if (years < 25) return 0;
  return Math.min(GAP_MAX, Math.round(GAP_K * Math.sqrt(years) / 2) * 2);
}
```
Yields, on real data: 996y→164px, 633y→131px, 472y→113px, 353y→98px, 310y→92px, 258y→84px, 210y→75px, 30y→28px, 17y→22px, 3y→0. Square root, not linear (a millennium would otherwise be a scroll of blank paper) and not log (log flattens 300 against 1000, destroying the comparison). Ordering is strictly preserved, and no gap can exceed 190px.

Capping at 190px is a real compression, so it must be declared rather than hidden: any spacer at `GAP_MAX` gets a 'compressed' treatment — the dashed rail switches to a 3-dot vertical ellipsis at its midpoint — and the section footer carries one Inter 12px `var(--ink-2)` line: 'Spacing is proportional to elapsed time, compressed above ~1,300 years.' Honest instrument, honest label.

8.2 THE SPACER ITSELF. `<li class="tc-gap" style="height:164px">`, `aria-hidden="false"`, containing:
- the rail continuing as dashes, aligned EXACTLY on the solid rail's axis. Do not use `border-left` on the same `::before` (0.75px offset bug). Use a separate absolutely-positioned element: `left:calc(var(--rail-x) - .75px); width:1.5px; top:0; bottom:0; background:repeating-linear-gradient(to bottom, var(--hair) 0 5px, transparent 5px 11px)`. `--rail-x` is a single custom property, 9px narrow / 101px wide, used by rows and spacers alike so they cannot drift.
- the label, `writing-mode:vertical-rl; transform:rotate(180deg)` when height ≥ 90px, otherwise horizontal in column 3. Poppins 500, 11.5px, uppercase, `.06em`, `var(--ink-2)`, vertically centred, sitting 10px right of the rail. Rounded to nearest 10 below 1000 and nearest 50 above, `toLocaleString()`: '≈ 1,000 years'. Screen-reader text: 'about 1,000 years pass'.
- The vertical label is what sells it. A tall dashed line with the number running UP it reads as a measured distance; a horizontal caption in a 22px sliver reads as a footnote.

8.3 CENTURY GUTTER. The date column (92px wide, right-aligned) gains a second line ABOVE the date, rendered only on the first row that enters a new century: Poppins 600, 10px, uppercase, `.08em`, `color:var(--ink-2)`, `opacity:.55` — '5TH C.', '16TH C.'. Derived arithmetically from `startYear` (`Math.floor((y-1)/100)+1`); it is presentational structure, not an attribution, so it invents nothing. Suppress it when `startYear().exact === false` AND the raw `when` already names a century, to avoid printing '2ND C.' above 'late 2nd c.'

8.4 ROWS. Otherwise as previously specified and it was fine: `grid-template-columns: 92px 20px 1fr` at ≥640c; `when` verbatim, right-aligned, Poppins 600 13px tabular-nums; a 9px solid `var(--axis-ink)` dot with a 2px `var(--panel)` ring, `margin-top:5px`; `what` in Inter 15px/1.6, `max-width:52ch`. Row hover `background:color-mix(in srgb,var(--axis) 4%,transparent)`, `border-radius:12px`, 160ms, reduced-motion off. Narrow (<640c): `--rail-x:9px`, dot 8px, date on its own line above the text, text indented 26px.

8.5 STILL FORBIDDEN. Do not alternate entries left/right of the rail by pole. The data carries no side and Orange 529 or Trent 1547 cannot be assigned one without an argument. One rail, one side. The spine earns its interest from time, which is in the data, not from allegiance, which is not.

═══════════════════════════════════════
§9 — READ FURTHER (replaces two grey lists)
═══════════════════════════════════════

9.1 REUSE §4'S GEOMETRY LITERALLY. Same `1fr 24px 1fr` template, and each column gets the SAME outer-edge rail and inward-fading wash as its pole panel above — 3px solid `var(--axis-ink)`, `linear-gradient(to right, var(--axis-wash), transparent 72%)` mirrored on the right. Not a 2px rail at 11% effective alpha, which does not render. The reader recognises the column because it is dressed identically to the panel it belongs to; that is the association device, and it costs nothing because the CSS already exists. Apply it to a wrapping `<div class="tc-pole tc-pole--quiet">` with `padding:14px 16px` and `border-radius:16px`.

9.2 COLUMN HEADER: pole name in Poppins 600 11px uppercase `.08em` `var(--ink-2)`, followed by the count in the same style at `opacity:.6` — 'MONERGIST · 3' / 'SYNERGIST · 4'. The counts really are uneven (grace is 3 and 4; the other five axes are balanced). Print them. Padding a column with a filler book to look symmetrical would be invention; hiding the asymmetry invites the screenshot. Owning it in 11px type defuses it.

9.3 THE ENTRY. Not a card — cards are inert boxes and there are nine of them per axis. A ruled entry:
- `<li>` with `padding:10px 0`, `border-top:1px solid var(--hair)`, `:first-child{border-top:0}`.
- author: Poppins 600, 11px, uppercase, `.06em`, `var(--ink-2)`, own line.
- title: DM Serif Display, `font-style:italic`, 16px/1.3, `var(--ink)`, `margin-top:2px`. This is the one place below the fold where the brand serif belongs — book titles are set in italic by convention, so the type is doing bibliographic work, not decoration, and it breaks a component that is otherwise wall-to-wall sans.
- Split at the FIRST ', ' only. Verified across all 29 entries (not 34): 'Fee, Paul, the Spirit, and the People of God' → Fee / *Paul, the Spirit, and the People of God*; 'John of Damascus, Exact Exposition II.29–30' → John of Damascus / *Exact Exposition II.29–30*; 'Schreiner & Crawford, The Lord's Supper' → correct. No ', ' → whole string as title, no author line.
- Entries remain non-links. If a verified `url` field is ever added, the title becomes the `<a>`; the author line never does.
- Sub-line under the heading, unchanged: 'Books that make each case from the inside.'

9.4 STACKED (<640c): both rails to the left edge, both headers left-aligned, columns in left-pole-then-right-pole order, 18px apart — identical collapse rule to §4, for the identical reason.

═══════════════════════════════════════
FOUR REPAIRS TO SECTIONS I AM NOT REWRITING
═══════════════════════════════════════

R1 — §5 MIDPOINT HOLE. `between` exists only for table and kingdom, so on the other four axes a reader inside ±10 of centre currently gets nothing. Add: when `Math.abs(score-50) < 10` and no `between` part exists, render a full-width `tc-mid` strip in place of the reader pill — `background:var(--panel-2)`, 1px `var(--axis-edge)`, `border-radius:14px`, centred, Inter 14.5px `var(--ink-2)`, spanning both columns beneath the grid: 'Your answers sit near the middle of this axis. Three statements are not enough to place you at either pole, so the compass names neither.' Fixed copy, no axis-specific claim, no invented position — it satisfies the audited rule on all six axes instead of two.

R2 — §4 HALF-MIRROR. Replace `.tc-pole.r p{margin-left:auto;text-align:left}` with a scoped rule so the sub-label follows the heading and only the body stays LTR: `.tc-pole.r{text-align:right} .tc-pole.r > p.body{text-align:left;margin-left:auto}`. Give the prose the class `body` and leave `.gloss` inheriting the panel's alignment. One right-aligned word above two left-aligned blocks reads as a bug; heading + sub-label mirrored above a left-aligned measure reads as a design.

R3 — §10 SSR CONTRADICTION. State explicitly: `renderAxisDossier` is isomorphic and runs at build time inside the existing Astro pipeline, emitting the full markup with `open` already present in the HTML for `mode:'page'` and for wide-viewport defaults. The only client JS is a `matchMedia` listener that CLOSES the timeline and reading `<details>` below 760px on first paint, and the 'Open every section' button. Nothing is injected. Delete 'set open before insertion into the document' — it is unreachable in a server-rendered component.

R4 — HEADING LEVELS AND THE DEAD FALLBACK. Every heading is emitted at `opts.headingLevel + n`; pole names in §4 and column headers in §9 must be the SAME level, since §9's columns refer back to §4's panels. Do not put a heading inside `<summary>` — the summary's own text is its accessible name; style it with the h-level type tokens instead. And delete the `@supports not (container-type:inline-size)` block outright rather than shipping `/* repeat the block above */`: container queries are baseline everywhere this site targets, and a commented placeholder is not a specification.


---

# Page flow, information architecture and SEO

**Critic verdict: `needs-work`**

## Concept

The result page is a funnel with three depth layers stacked in the order a person actually asks questions: what am I (hero: headline, verdict line, six bipolar rails), who am I like (ranked traditions), what does any of this mean (six axis cards). The rails in the hero double as the page's table of contents — each rail's name is an in-page link to its own axis card, so the visual is also the navigation. Every axis card is deliberately truncated: your own pole's paragraph open, the opposite pole one click away, three of nine history beats shown, ending in a query-shaped link out to /axis/theology-compass/[axis]/. Because result pages are noindex they are not the search surface — their job is to push humans into the axis and tradition pages, while a separate always-indexable crawl spine (an /axis/[quiz]/ index, a /tradition/ index, the quiz page, articles) carries the crawl path so ranking never depends on a noindex page passing equity.

## Why it works

FIRST FIVE SECONDS. Someone who just answered 18 statements wants one sentence about themselves and a picture of it. The h1 (band adjectives, e.g. "Firmly monergist, sacramental, cessationist"), the verdict line ("Nearest on the map: Presbyterian / Reformed (confessional)"), and the six rails must be simultaneously visible. At 380x740 that is ~576px of content under a 56px header, so it fits with the "Closest traditions" heading peeking to signal scroll. On desktop the hero is a 5fr/7fr grid so whitespace does not push the rails under.

FIRST THIRTY SECONDS. The next question is not "what is monergism", it is "is this right, and who else is close". That is why ranked traditions sit second and the axis prose third. The reader is verifying, not studying: they scan their rails for a lean that surprises them, then check the runner-up percentage to gauge confidence. The scope note and the audit provenance chip do their work here — a discernment-minded reader who is about to screenshot something unfair is looking for the caveat, and finding it pre-empts the screenshot. Traditions before axes also means the first link a reader meets is a /tradition/ link, which is the shortest, most tempting hop off the page.

FIRST FIVE MINUTES. Only now does the axis prose earn its place, and only for the two or three axes the reader was surprised by. Six full 100-257 word summaries plus 54 history entries plus 50 passages plus 30 reading citations is roughly 2,500 words of grey wall — the failure mode of the last attempt. So the card shows their own side in full (a fair page tells you what you believe in your own words before it tells you what the other side says), collapses the opposite side behind a labelled control (fairness preserved, length halved, and the label itself — "How memorialists put it" — is an invitation rather than a wall), and hands off the rest.

WHY THE TRUNCATION IS ALSO THE SEO STRATEGY. The 2,500 words live verbatim on the six axis pages, which are indexable. Duplicating them onto a noindex page buries the funnel and gains nothing. Truncating creates the reason to click, and the click lands on the page that can actually rank. Note the crawl reality: Google reduces crawl of persistently noindex URLs over time and eventually treats their links as effectively nofollow, so any plan where /axis/ pages get discovered through /r/ pages is a plan for zero traffic — exactly the SPA outcome to avoid. Hence the parallel indexable spine.

WHY THE RAILS ARE THE NAV. It removes a sticky TOC (dead weight at 380px), gives the SVG-adjacent visual real keyboard semantics, and makes the relationship between hero and detail explicit instead of leaving the reader to guess that scrolling repeats the same six things in more depth.

## Specification

## 1. Page order, with fold line

Route: `/r/[quiz]/[code]` (already SSR, `prerender = false`).

```
site header (56px)
=== HERO  #result =====================================
  eyebrow      "Theology Compass · your result"
  h1           headline()  — band adjectives
  p.verdict    nearestLine() — the tradition sentence
  p.provenance "18 statements · six axes · audited"  -> /method/
  .compass     six rails (the hero visual)
  .code-row    result code + Copy link
------------------------------ fold (mobile ~600px) ---
=== #traditions  h2 "Closest traditions on the map" ===
  p.scope      the audited scope caveat
  ol.ranked    top 3 open, remaining 15 in <details>
=== #axes  h2 "Your six axes, one at a time" =========
  section#axis-grace   h3 ... x6
=== #share  h2 "Share your compass" ==================
=== #next   h2 "Where to go from here" ===============
site footer
```

**Above the fold at 380x740** (measure it; do not eyeball):
header 56, eyebrow 20, h1 up to 3 lines at 26px/1.15 = 90, verdict 2 lines at 15px/1.45 = 44, provenance 28, compass 6 rails x 38 + 5 gaps x 10 = 278, margins ~60. Total ~576. The `#traditions` h2 must be partially visible; if a headline runs to 4 lines, clamp h1 to 3 lines with `-webkit-line-clamp` and keep the full string in the `<title>`.

**Desktop >= 900px:** hero becomes `grid-template-columns: 5fr 7fr; gap: 40px`, type left, compass right, `align-items: start`. Everything above plus the first two tradition rows land above the fold.

## 2. The four hedge states drive the IA, not just the copy

`nearestState()` returns `central | loose | tie | near`. The page shape changes:

- **near** — as above. Verdict names one tradition, linked.
- **tie** — verdict names both, both linked, joined by " and ". The `#traditions` list marks rows 1 and 2 with a shared `.tied` rule and the note "These two are within 10 units of you — the instrument cannot separate them."
- **loose** — verdict reads "No listed tradition is a close fit." `#traditions` heading changes to "Nearest, loosely" and gains "Nothing on this list is within 45 units of you, so read these as the closest points on a map you sit off, not as a label."
- **central** — verdict reads "Near the center on every axis, so no tradition is named." **The `#traditions` section moves below `#axes`**, collapsed inside `<details>` with summary "See the 18 traditions anyway". Reason: it cannot answer the reader's question, and putting an unanswerable section in slot 2 reads as a broken result. `#axes` becomes slot 2 and its h2 becomes "What each axis was asking".

## 3. Hero detail

- `.eyebrow` — Poppins 11px, `letter-spacing:.09em`, uppercase, `color: var(--ink-3)`. Text: `🧭 Theology Compass · your result`.
- `h1` — DM Serif Display italic, `clamp(26px, 6.4vw, 42px)`, line-height 1.15, `color: var(--ink-1)`. Content: `headline()` verbatim, first letter already capitalised by the strategy.
- `p.verdict` — Inter 15/1.45, `--ink-2`. Tradition names inside are links (see §7). In `near`/`tie` the whole thing reads e.g. `Nearest on the map: <a>Presbyterian / Reformed (confessional)</a>`.
- `p.provenance` — a single 12px Poppins line, `--ink-3`, with a 6px round dot separator: `18 statements · six bipolar axes · <a href="/method/">independently audited for fairness</a>`. Never state finding counts as a boast; the /method/ page carries the numbers.
- `.compass` — six `.rail` rows. Each row: `<a class="rail-name" href="#axis-grace">⚖️ Grace</a>` on the left, `<span class="lean">32% toward Monergist</span>` right-aligned, then the track. Track = 6px tall, `border-radius:3px`, background `color-mix(in srgb, var(--axis) 14%, transparent)`, with a solid 14px knob at `left: value%` using `background: var(--axis)` and `transform: translateX(-50%)` — the layered-opacity treatment, never a flat saturated fill. Under the track, two 11px pole labels at the ends, **both always rendered**, `--ink-3`, `display:flex; justify-content:space-between`. A 1px centre tick at 50% at 22% opacity. `--axis` is set per row inline from the axis colour.
- If `band(value) === 2` the `.lean` text is `at the center` or `NN% toward X` per `lean()`, but the rail gets `.is-middle` which drops the knob to 78% opacity and adds `title`-free visually-hidden text "middle band — this axis names no position for you". Do not print a band adjective for middle-band axes anywhere.
- `.code-row` — `<code>` with the base-13 code, plus a button "Copy link". Native `navigator.share` replaces it on `matchMedia('(pointer:coarse)')` when `navigator.share` exists.

## 4. `#traditions`

`h2` "Closest traditions on the map". `p.scope` (Inter 13px, `--ink-3`, inside a `.note` panel): "Scored against these 18 traditions only, by straight-line distance across the six axes. Each position is a sketch of where typical adherents land — not official teaching, and not a complete list of Christian traditions."

`ol.ranked` rows: name (link), match percentage, and a 3px hairline bar whose width is the match percentage in `--brand-2` at 30% opacity. Top 3 rendered directly. Then:

```html
<details class="more">
  <summary>See all 18 traditions and how close each one is</summary>
  ...rows 4–18...
</details>
```

Rows 4–18 are still in the DOM (not JS-injected) so Ctrl+F and screen readers reach them.

## 5. `#axes` — the six cards

`h2` "Your six axes, one at a time". Then six `<section class="axis" id="axis-{slug}" style="--axis:#2F4FCB">`:

```
h3   ⚖️ Grace — Monergist ↔ Synergist        [links to /axis/…]
     full-width rail, larger (10px track, 18px knob), with
     small tick markers at the positions of the top 3 traditions
     on THIS axis, each with a visually-hidden name
p.lean-line   "You: 32% toward Monergist — firmly monergist"
              (band adjective suppressed entirely when band === 2)
h4   "How monergists put it"        <- the reader's own side
p    summary_parts.left  (full)
<details> summary "How synergists put it"   <- the other side
  p  summary_parts.right (full)
</details>
[if summary_parts.note]
  aside.caution  "One caution about this axis" + note text
ul.passages   chips: Romans 9 · Romans 8:28-30 · … (all of them)
div.history   3 dated entries as a <dl>, then link out
div.reading   two columns, headed by pole name, 2 citations each
p.axis-out    the query-shaped link out
```

Details:
- **`summary_parts`** is a build-time addition. Add `summary_parts: {left, right, note}` to each axis in `audit/compass-data.revised.json`, produced by splitting `fair_summary` at existing sentence boundaries with **no words changed**. Verified split points: grace L=[0,1] R=[2,3,4] note=[5,6,7]; table L=[0] R=[1] note=[2]; spirit L=[0] R=[1,2] note=none; kingdom L=[0] R=[1] note=[2]; tradition L=[0] R=[1] note=none; worship L=[0] R=[1] note=none. `audit/selftest.js` must assert `(left + ' ' + right + ' ' + note).replace(/\s+/g,' ').trim() === fair_summary.replace(/\s+/g,' ').trim()` for all six, so no one can silently rewrite audited prose through the split.
- **Which side is "yours"**: `value < 50` → left is yours; `> 50` → right; **`band() === 2` → neither**. In the middle band, render both sides as sibling `<details>`, both closed, with a lead paragraph "You landed in the middle band here, so this axis names no position for you. Both sides, in their own words:". This is the audited rule made structural.
- **Passages** are chips: 11px Poppins, `padding:3px 9px`, `border-radius:999px`, `background: color-mix(in srgb, var(--axis) 9%, var(--panel))`, `color: var(--ink-2)`, wrapped in a `<ul>` with `list-style:none; display:flex; flex-wrap:wrap; gap:6px`. Not links — do not invent Bible-gateway URLs. `<h4>` above: "Passages both sides argue from".
- **History** is a `<dl>`, not a `<ul>`: `<dt>` = `when` (Poppins 12px tabular-nums, `--ink-3`, `min-width:82px`), `<dd>` = `what` (Inter 14px). On >=560px use `dl{display:grid;grid-template-columns:82px 1fr;gap:6px 14px}` so the dates form a real timeline column. Show the **first, the middle, and the last** entry — not the first three — so the span of centuries is visible. Then the link out.
- **Reading** uses the ignored `read_more.left` / `read_more.right`. Two-column `grid-template-columns:1fr 1fr` (single column below 480px), each headed `<h5>Reading on the Monergist side</h5>` / `…Synergist side`, two citations each as plain `<li>` text in Inter 13px italic. **No links** — the fairness rule forbids fabricating URLs. Full lists live on the axis page.
- `readMore` type must widen: `readMore?: string[] | { left: string[]; right: string[] }` in `site/src/lib/engine/types.ts`, and `/axis/[quiz]/[axis].astro` must render the split form (it currently calls `.map` on an object and would emit nothing).

## 6. `#share` and `#next`

`#share`: h2 "Share your compass". The existing `<pre>` share text stays (monospace, `--panel-2`, 15px radius, `overflow-x:auto`). Buttons: "Copy" (primary), "Take it again" → `/q/theology-compass/`, and — new — "Copy link only". Below, 12px: "The link carries only your six scores. Nothing you answered is stored on our side."

`#next`: h2 "Where to go from here". **Three groups, in this order**, because the reader's momentum is strongest toward more self-understanding, then toward reading, then toward provenance:
1. `h3 Another quiz` — cards for other live quizzes (`/quizzes/`), anchor = quiz title.
2. `h3 Something to read` — up to 3 articles matched by the article's `quizzes`, `axes`, or `traditions` frontmatter (see §8). Anchor = the article's exact title.
3. `h3 How this was built` — one line to `/method/`, anchor "How the Theology Compass was written and audited".

## 7. Anchor text — exact strings

Rule set, enforced in review:
1. Anchor text is the destination's own H1 phrase, or a natural-language question the destination answers. **Never** "read more", "learn more", "here", "click", "→" alone.
2. One link per destination per section; the *same* destination may be linked from a different section with a *different* anchor.
3. Specificity descends with depth: hero anchors are names, axis-card anchors are questions.
4. Every axis page and tradition page is reachable in one click from every result page — and independently from an indexable page, so crawl never depends on `/r/`.

**Hero verdict** → `/tradition/{slug}/`, anchor = tradition name verbatim, e.g. `Presbyterian / Reformed (confessional)`.

**Hero rails** → in-page `#axis-{slug}` only. Not external — the fold is not the place to leave.

**Tradition rows** → `/tradition/{slug}/`, anchor = name verbatim. The top row additionally carries a second link on its own line: `Where Presbyterian / Reformed (confessional) sits on all six axes`.

**Axis card h3** → `/axis/theology-compass/{slug}/`, anchor = `Grace — Monergist ↔ Synergist` (matches the axis page H1 pattern).

**Axis card history link** → same page `#history`, anchor = `All nine turning points on the Grace axis` (count from `history.length`, so it differs per axis: nine, eight, ten).

**Axis card reading link** → same page `#read-further`, anchor = `Everything both sides read on grace`.

**Axis card out-link** (`p.axis-out`, the important one) → same page, anchor = a hand-written query-shaped phrase stored as `seoAnchor` on the axis data:
- grace: `Why monergists and synergists disagree about grace`
- table: `What sacramental and memorial churches mean by the Lord's Supper`
- spirit: `Whether the sign gifts continued after the apostles`
- kingdom: `Whether Israel and the church are one people or two`
- tradition: `What Scripture alone means, and what it does not`
- worship: `Why some churches follow a liturgy and others do not`

**Article cards** → `/articles/{slug}/`, anchor = exact article title.

Add matching `seoTitle` per axis so anchor and destination title agree: `Monergist or Synergist — the Grace axis explained`, etc.

## 8. The indexable crawl spine (the part that actually earns traffic)

Result pages cannot carry this. Build these:

- **NEW `/axis/theology-compass/index.astro`** — H1 "The six axes of the Theology Compass". One card per axis: name, both poles, the first 30 words of the summary, link with the `seoAnchor`. Indexable. This is the hub that ranks for "axes of Christian theology".
- **NEW `/tradition/index.astro`** — H1 "18 Christian traditions, placed on six axes". Groups the 18 by family with each one's six-value mini-rail. Indexable.
- **Link both from the site header or footer nav**, and from `/q/theology-compass/`. Crawl depth from the homepage to any axis page must be <= 3.
- **Axis page gains**: (a) "Traditions nearest each pole" — the 3 lowest and 3 highest `position[i]` traditions, linked, pure data, no writing; (b) prev/next axis links; (c) stable ids `#history`, `#passages`, `#read-further`, `#left`, `#right` for the result page's deep links; (d) related articles.
- **Tradition page gains**: "Traditions that sit closest to this one" — the 3 nearest by the same Euclidean distance, linked. This alone creates 54 high-relevance internal links from pure data.
- **`content.config.ts` gains** `axes: z.array(z.string()).default([])` and `traditions: z.array(z.string()).default([])` so article cross-linking is bidirectional and data-driven rather than hand-maintained.

## 9. Robots, canonical, sitemap

- Result page keeps `<meta name="robots" content="noindex, follow">` **and** sets the header, since it is SSR: `Astro.response.headers.set('x-robots-tag', 'noindex, follow')`.
- Self-referencing `<link rel="canonical">` stays.
- **`robots.txt` must NOT contain `Disallow: /r/`.** Blocking the crawl means the `noindex` is never read, the URLs can still surface as bare links, and the outbound links are never seen. Allow crawling; suppress with the meta tag.
- `@astrojs/sitemap` already omits SSR routes; add an explicit `filter: page => !page.includes('/r/')` so a future prerender flip cannot leak millions of URLs.
- `og:image`: `twitter:card="summary_large_image"` is currently declared with **no image** — that renders a broken large card. Either ship a static `/og/theology-compass.png` fallback now and set it for all compass pages, or drop to `summary` until the dynamic endpoint exists. Dynamic version: `/og/[quiz]/[code].png` as an SSR endpoint rendering the six rails; when it lands, point result pages at it.

## 10. JSON-LD

**Result page — minimal, because it is noindex.** Do not ship `Quiz`, `FAQPage`, or fabricated ratings there. Only:

```json
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
 {"@type":"ListItem","position":1,"name":"Quizzes","item":"https://wiserwalk.com/quizzes/"},
 {"@type":"ListItem","position":2,"name":"Theology Compass","item":"https://wiserwalk.com/q/theology-compass/"},
 {"@type":"ListItem","position":3,"name":"Your result"}]}
```

**Axis page — the real investment.** `Article` + `BreadcrumbList`, with `about` as `DefinedTerm`s for the two poles (honest: an axis genuinely defines two terms), `citation` for the reading list, and `isPartOf` the quiz:

```json
{"@context":"https://schema.org","@type":"Article",
 "headline":"Monergist or Synergist — the Grace axis explained",
 "description":"…first 155 chars of summary…",
 "url":"https://wiserwalk.com/axis/theology-compass/grace/",
 "inLanguage":"en",
 "about":[{"@type":"DefinedTerm","name":"Monergist"},{"@type":"DefinedTerm","name":"Synergist"}],
 "citation":["Luther, The Bondage of the Will","Calvin, Institutes III","Arminius, Declaration of Sentiments"],
 "isPartOf":{"@type":"WebPage","url":"https://wiserwalk.com/q/theology-compass/"},
 "publisher":{"@type":"Organization","name":"Wiser Walk","url":"https://wiserwalk.com/"}}
```

**Tradition page:** `Article` + `BreadcrumbList` + `about: {"@type":"Thing","name": tradition.name}`. No `Organization` — a tradition is not the org, and claiming so is the kind of overreach this audience notices.

**Home only:** `WebSite` (with `SearchAction` only if a real search endpoint exists — otherwise omit) and one `Organization`.

Do not add `AggregateRating`, `FAQPage`, or `HowTo` anywhere. FAQ rich results are restricted to authoritative sites now, and inventing a rating breaks the real-data rule.

## 11. Heading hierarchy (exact)

```
h1  the headline                       (exactly one)
h2  Closest traditions on the map
h2  Your six axes, one at a time
    h3  ⚖️ Grace — Monergist ↔ Synergist          (x6)
        h4  How monergists put it
        h4  How synergists put it   (inside <summary>)
        h4  Passages both sides argue from
        h4  How the question arose
        h4  Reading on each side
            h5  Reading on the Monergist side
            h5  Reading on the Synergist side
h2  Share your compass
h2  Where to go from here
    h3  Another quiz / Something to read / How this was built
```

No level skipped; `<details><summary>` wraps an `<h4>` rather than replacing one, so the outline survives collapse.

## 12. Accessibility and responsive

- Rails: the visual is decorative; the `.lean` text is the accessible value. Give each track `role="img"` with `aria-label="Grace: 32% toward Monergist, on a scale from Monergist to Synergist"`. Do not use `progressbar` — it is not a progress.
- All `<details>` are keyboard-native; do not replace with JS toggles. Set `open` on the reader's own side at render, not via script, so it works with JS off.
- Contrast: axis colours are used for fills and knobs only, never for body text. For the axis name in the card h3, use `--ink-1`, with a 3px colour bar to the left of the card instead. `#C98A12` gold on `#EEEEEE` is ~2.6:1 and must never carry text.
- Dark theme: define `--axis-tint` as `color-mix(in srgb, var(--axis) 14%, transparent)` in light and `22%` in dark; knobs get `filter: saturate(.9) brightness(1.12)` in dark so `#2F4FCB` does not disappear.
- 380px: history `<dl>` collapses to stacked, reading grid to one column, hero to one column, tradition rows keep name and percentage on one line with `min-width:0; overflow-wrap:anywhere` on the name.
- `prefers-reduced-motion`: no knob transition on load.

## Markup sketch

```html
<!-- ============ HERO ============ -->
<article class="result">
  <header class="hero" id="result">
    <div class="hero-type">
      <p class="eyebrow">🧭 Theology Compass · your result</p>
      <h1>Firmly monergist, sacramental, cessationist</h1>
      <p class="verdict">
        Nearest on the map:
        <a href="/tradition/presbyterian-reformed-confessional/">Presbyterian / Reformed (confessional)</a>
      </p>
      <p class="provenance">
        18 statements · six bipolar axes ·
        <a href="/method/">independently audited for fairness</a>
      </p>
      <p class="code-row"><code>7K3M2A</code>
        <button type="button" id="copy-link">Copy link</button></p>
    </div>

    <!-- The compass IS the table of contents: each name jumps to its card. -->
    <ul class="compass">
      <li class="rail" style="--axis:#2F4FCB">
        <a class="rail-name" href="#axis-grace">⚖️ Grace</a>
        <span class="lean">32% toward Monergist</span>
        <div class="track" role="img"
             aria-label="Grace: 32 percent toward Monergist, on a scale from Monergist to Synergist">
          <i class="tick"></i><i class="knob" style="left:34%"></i>
        </div>
        <div class="poles"><span>Monergist</span><span>Synergist</span></div>
      </li>
      <!-- …five more, each with its own --axis colour… -->
    </ul>
  </header>

  <!-- ============ TRADITIONS (slot 2 unless state === 'central') ============ -->
  <section id="traditions">
    <h2>Closest traditions on the map</h2>
    <p class="scope note">Scored against these 18 traditions only, by straight-line distance
      across the six axes. Each position is a sketch of where typical adherents land — not
      official teaching, and not a complete list of Christian traditions.</p>
    <ol class="ranked">
      <li>
        <a href="/tradition/presbyterian-reformed-confessional/">Presbyterian / Reformed (confessional)</a>
        <span class="pct">91%</span><i class="hair" style="--w:91%"></i>
        <a class="deeper" href="/tradition/presbyterian-reformed-confessional/">Where Presbyterian / Reformed (confessional) sits on all six axes</a>
      </li>
      <!-- rows 2–3 -->
    </ol>
    <details class="more">
      <summary>See all 18 traditions and how close each one is</summary>
      <ol class="ranked" start="4"><!-- rows 4–18, always in the DOM --></ol>
    </details>
  </section>

  <!-- ============ AXES ============ -->
  <section id="axes">
    <h2>Your six axes, one at a time</h2>

    <section class="axis" id="axis-grace" style="--axis:#2F4FCB">
      <h3><a href="/axis/theology-compass/grace/">Grace — Monergist ↔ Synergist</a></h3>

      <div class="track track-lg" role="img" aria-label="Grace: 32 percent toward Monergist">
        <i class="tick"></i>
        <i class="mark" style="left:12%"><span class="vh">Presbyterian / Reformed</span></i>
        <i class="knob" style="left:34%"></i>
      </div>
      <div class="poles"><span>Monergist</span><span>Synergist</span></div>
      <p class="lean-line"><strong>You:</strong> 32% toward Monergist — firmly monergist</p>

      <!-- your own side open; the other side one click away, never omitted -->
      <h4>How monergists put it</h4>
      <p>Monergists (God alone brings a person to faith) hold that salvation is God's work…</p>

      <details class="other-side">
        <summary><h4>How synergists put it</h4></summary>
        <p>Synergists (the person freely cooperates with the grace God gives) hold that…</p>
      </details>

      <aside class="caution">
        <h4>One caution about this axis</h4>
        <p>Statement 2 scores resistible grace toward the synergist pole, because…</p>
      </aside>

      <h4>Passages both sides argue from</h4>
      <ul class="passages"><li>Romans 9</li><li>Romans 8:28–30</li><li>Ephesians 1:3–14</li></ul>

      <h4>How the question arose</h4>
      <dl class="history">
        <dt>c. 411–430</dt><dd>Augustine argues against Pelagius that grace must precede…</dd>
        <dt>1577</dt><dd>Formula of Concord (arts. II, XI): conversion is God's work alone…</dd>
        <dt>1672</dt><dd>…</dd>
      </dl>
      <p><a href="/axis/theology-compass/grace/#history">All nine turning points on the Grace axis</a></p>

      <h4>Reading on each side</h4>
      <div class="reading">
        <div><h5>Reading on the Monergist side</h5>
          <ul><li>Luther, <i>The Bondage of the Will</i></li><li>Calvin, <i>Institutes</i> III</li></ul></div>
        <div><h5>Reading on the Synergist side</h5>
          <ul><li>Arminius, <i>Declaration of Sentiments</i></li><li>Wesley, <i>Predestination Calmly Considered</i></li></ul></div>
      </div>

      <p class="axis-out">
        <a href="/axis/theology-compass/grace/">Why monergists and synergists disagree about grace</a>
      </p>
    </section>
    <!-- …five more axis cards… -->
  </section>
</article>

<style>
  :root{
    --page:#E3E3E3; --shell:#E8E8E8; --panel:#EEEEEE;
    --ink-1:#3A3A3A; --ink-2:#555; --ink-3:#7B7B7B;
    --brand-1:#7EBAEE; --brand-2:#F0A06F;
    --axis-tint: 14%;  --shadow: 3px 3px 5px rgba(68,68,68,.065);
  }
  :root[data-theme="dark"], :root:not([data-theme="light"]) {
    @media (prefers-color-scheme: dark) {
      --page:#1C1C1E; --shell:#232326; --panel:#2A2A2E;
      --ink-1:#EDEDED; --ink-2:#C3C3C3; --ink-3:#949494; --axis-tint: 22%;
    }
  }
  .hero{ display:grid; gap:22px; }
  @media (min-width:900px){ .hero{ grid-template-columns:5fr 7fr; gap:40px; align-items:start; } }

  h1{ font-family:"DM Serif Display",Georgia,serif; font-style:italic;
      font-size:clamp(26px,6.4vw,42px); line-height:1.15; margin:.1em 0 .35em;
      display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }

  /* Layered opacity, NOT a flat fill: tinted track + solid knob. */
  .track{ position:relative; height:6px; border-radius:3px; margin:10px 0 6px;
          background:color-mix(in srgb, var(--axis) var(--axis-tint), transparent); }
  .track-lg{ height:10px; border-radius:5px; }
  .tick{ position:absolute; left:50%; top:-3px; width:1px; height:12px;
         background:var(--ink-3); opacity:.22; }
  .knob{ position:absolute; top:50%; width:14px; height:14px; border-radius:50%;
         background:var(--axis); transform:translate(-50%,-50%); box-shadow:var(--shadow); }
  .track-lg .knob{ width:18px; height:18px; }
  .mark{ position:absolute; top:50%; width:6px; height:6px; border-radius:50%;
         background:var(--axis); opacity:.45; transform:translate(-50%,-50%); }
  .is-middle .knob{ opacity:.78; }
  @media (prefers-color-scheme: dark){ .knob{ filter:saturate(.9) brightness(1.12); } }

  .poles{ display:flex; justify-content:space-between; font:11px/1.2 Poppins,system-ui;
          color:var(--ink-3); }
  .passages{ list-style:none; display:flex; flex-wrap:wrap; gap:6px; padding:0; }
  .passages li{ font:11px/1 Poppins,system-ui; padding:4px 9px; border-radius:999px;
                color:var(--ink-2);
                background:color-mix(in srgb, var(--axis) 9%, var(--panel)); }
  .history{ display:grid; gap:6px 14px; }
  @media (min-width:560px){ .history{ grid-template-columns:82px 1fr; }
    .history dt{ font-variant-numeric:tabular-nums; } }
  .history dt{ font:12px/1.4 Poppins,system-ui; color:var(--ink-3); }
  .history dd{ margin:0; font:14px/1.55 Inter,system-ui; color:var(--ink-2); }
  .reading{ display:grid; gap:14px; }
  @media (min-width:480px){ .reading{ grid-template-columns:1fr 1fr; } }

  .axis{ background:var(--panel); border-radius:18px; padding:20px 18px;
         box-shadow:var(--shadow); border-left:3px solid var(--axis); margin:18px 0; }
  details > summary > h4{ display:inline; }
  .vh{ position:absolute; width:1px; height:1px; overflow:hidden; clip-path:inset(50%); }
  @media (prefers-reduced-motion:reduce){ .knob{ transition:none !important; } }
</style>
```

## Pitfalls

- Adding `Disallow: /r/` to robots.txt. This is the single most damaging possible mistake here: a blocked URL is never crawled, so the `noindex` is never read and none of the outbound anchor text is ever seen. Result pages must be crawlable and suppressed by the meta tag only.
- Assuming the result page's `noindex, follow` links are enough to get axis and tradition pages indexed. Google crawls persistently-noindex URLs less over time and eventually treats their links as effectively nofollow. If `/axis/theology-compass/` and `/tradition/` index pages are skipped as 'redundant', the whole search surface hangs off pages that stop passing anything — which is exactly how the previous SPA got zero traffic.
- Rendering only the reader's own pole in the axis card and dropping the other. The collapse must be a `<details>` that is present, labelled, and keyboard-reachable, not a conditional that omits half the axis. Omitting it repeats the exact bipolar failure of the last attempt in prose form.
- Printing a band adjective on a middle-band axis. `band() === 2` means no position is named — so `.lean-line` shows the percentage only, both `<details>` render closed, and the card leads with 'you landed in the middle band'. Anyone who writes `bands[band(v)]` unconditionally violates an audited rule.
- Splitting `fair_summary` at runtime with a regex. Sentence-boundary heuristics differ per axis and will silently mangle audited prose. Author `summary_parts` once in the source JSON and make `audit/selftest.js` assert the three parts reconcile to the original string, character for character after whitespace normalisation.
- Calling `.map()` on `readMore`. The audited data is `{left:[], right:[]}` but `QuizGroup.readMore` is typed `string[]`, so the existing axis page silently renders nothing. Widen the type and handle both shapes, or the 'Read further' section stays invisible everywhere.
- Turning the reading citations into links. There are no URLs in the data; inventing Amazon or Wikipedia links breaks the real-data rule and is precisely what a discernment-minded reader screenshots. Render them as cited text.
- Leaving `twitter:card="summary_large_image"` with no `og:image`. It produces a visibly broken card on every share of a page whose main purpose is being shared. Ship a static fallback image or downgrade to `summary` until the dynamic endpoint exists.
- Keeping the traditions section in slot 2 in the `central` state. When no tradition is named, an unanswerable list in the prime position reads as a broken page; it must demote below the axes and collapse.
- Painting the axis colours as flat saturated fills, or using them for text. `#C98A12` gold on `#EEEEEE` is about 2.6:1 and fails everywhere. Colour belongs in the tinted track (14% light / 22% dark), the solid knob, and a 3px card edge — nowhere else.
- Injecting tradition rows 4–18 with JavaScript on `<details>` open. They must be in the DOM at render so Ctrl+F, screen readers, and no-JS all work; `<details>` already handles the visual collapse natively.
- Wrapping a whole rail row in an `<a>` so the whole thing jumps. Nest only the axis name; the percentage, poles and track must stay non-interactive text and `role="img"`, or the hero becomes six giant link targets and the `aria-label` gets read as link text.
- Using `role="progressbar"` on a track. A position between two named poles is not progress toward anything, and screen readers will announce it as a loading state.
- Using generic anchors ('read more', 'learn more', the bare arrow) on the axis and tradition links. Those are the only anchors pointing at the pages that are supposed to rank; each of the six must carry its hand-written query-shaped phrase, and the six must differ from one another.

---

## CRITIQUE

### Logical incoherence found

- h1 vs verdict in the central state: headline() can print 'Monergist-leaning' directly above 'Near the center on every axis, so no tradition is named', because band() uses 41-59 and nearestState() uses 40-60. Two different definitions of 'the middle' on the same screen.
- Middle-band rail: section 3 prints 'NN% toward Monergist' for band 2 and pushes that same phrase into the aria-label, while pitfall 4 says band 2 must name no position.
- 'One caution about this axis' rendered above table's and kingdom's third sentences, which are statements about believers standing between the poles, not cautions about the instrument. A reader who holds a between-the-poles position sees his own view filed as an erratum.
- Three unlabelled same-coloured dots on the axis track, names hidden from sighted readers — the previous attempt's unlabelled-sector failure at 6px.
- Two adjacent anchors to the same tradition URL in the same row, in violation of the spec's own rule 2.
- Axis links pointing at /axis/theology-compass/spirit/ and /tradition/ where the built slugs are 'gifts' and 'authority' — a page that promises rigour and 404s on a third of its own outbound links.
- 'measure it; do not eyeball' followed by a 38px-per-rail estimate that its own CSS makes 53px.

### Worst problems

- THE URLS ARE WRONG AND TWO OF SIX AXIS LINKS 404. The spec keys every route, id and seoAnchor off the audit's internal `key` (grace, table, spirit, kingdom, tradition, worship). The site's actual slugs, generated in site/scripts/build-data.mjs from the axis NAME, are grace, table, gifts, kingdom, authority, worship. So `/axis/theology-compass/spirit/` and `/axis/theology-compass/tradition/` do not exist, and a seoAnchor map keyed by `spirit`/`tradition` returns undefined for the Gifts and Authority cards — meaning the two most important outbound links on the page render with empty anchor text. The whole SEO argument of the spec is built on links that 404. Every occurrence must use axis.slug.
- IT SHIPS A CONTRADICTION BETWEEN THE H1 AND THE LINE DIRECTLY BENEATH IT. `band()` in site/src/lib/strategies/bipolar.ts makes the middle band 41-59, but `nearestState()` calls a result 'central' when every axis is within 10 of 50, i.e. 40-60. A sheet scoring 40 on one axis and 50 on the rest is central for the verdict but band 1 for the adjective, so headline() returns 'Monergist-leaning' and nearestLine() returns 'Near the center on every axis, so no tradition is named' — printed one under the other, 40px apart. That is precisely the audited failure ('a midpoint is not a conviction') showing up in the largest type on the page. The spec's section 2 rewrites the verdict for the central state and never touches the h1.
- THE `summary_parts` SPLIT MISLABELS AUDITED PROSE ON TWO AXES. I checked the source. For `table`, sentence [2] is 'Many stand between the poles, baptizing believers only while holding that Christ spiritually feeds his people at the Table (Reformed Baptists) or that God forgives sins in baptism (Churches of Christ).' For `kingdom`, sentence [2] is 'Progressive dispensationalists add that Christ's kingdom has already begun...'. Neither is a methodology caution. The spec files both under `note` and renders them under the heading 'One caution about this axis'. That reframes a fair statement about believers who stand between the poles as a caveat about the instrument — a fairness regression, in a section whose entire purpose is fairness, on the page a discernment-minded reader screenshots.
- IT PUBLISHES AN INTERNAL JSON KEY TO THE PUBLIC. The grace note ends '(see candidate_statements).' The spec mandates verbatim rendering with a selftest asserting character-for-character reconciliation, so that string ships. It also renders the heading 'One caution about this axis' immediately above prose that begins 'One caution about how this axis is built:' — the same sentence twice, one as furniture.
- THE FOLD ARITHMETIC IS WRONG BY ABOUT 80px, WHICH KILLS THE ONE THING THE HERO IS FOR. The spec budgets a rail at 38px. Its own CSS gives a rail a name/lean line (~17), a track with margin 10 top and 6 bottom (22), and an 11px pole row (~14) — 53px, not 38. Six rails plus gaps is 358, not 278, so the hero is ~656px under a 56px header on a 740px viewport with mobile chrome eating ~110. The 'Closest traditions' heading does not peek; the sixth rail is cut off. The spec says 'measure it; do not eyeball' and then eyeballs it.
- IT IS DULL. Six 6px grey-tinted tracks with a dot, stacked. That is a bar chart with six rows, and it is the same picture the previous attempt got rejected for. Nothing in the spec uses the locked visual language: the paint-pour and floral stencil masks appear nowhere, the #7EBAEE-to-#F0A06F brand gradient appears once as a 30%-opacity 3px hairline behind a percentage, DM Serif Display appears once. The six axis cards below are six identical grey panels in identical order with identical internal sequence. A reader scrolling sees the same rectangle six times. Nothing on this page rewards looking at it.
- THREE ANONYMOUS DOTS ON THE AXIS TRACK REPEAT THE 'UNLABELLED POLE' FAILURE IN MINIATURE. Section 5 puts 'small tick markers at the positions of the top 3 traditions on THIS axis', 6px, all in the same colour at 45% opacity, names visually-hidden. A sighted reader sees three identical anonymous dots and cannot tell which is which; at 380px they will overlap. 'Top 3 traditions on this axis' is also undefined — section 5 implies the reader's top 3 matches, section 8 defines nearest-per-axis as the 3 lowest and 3 highest position[i]. Two different meanings, one label.
- THE MIDDLE-BAND RULE CONTRADICTS ITSELF INSIDE THE SPEC. Section 3: 'If band(value) === 2 the .lean text is `at the center` or `NN% toward X` per lean()'. Pitfall 4: band 2 'means no position is named'. `lean()` returns 'at the center' only at exactly 50; at 41-59 it returns e.g. '18% toward Monergist', which names a pole, and the spec then feeds that same string into the aria-label. Half the middle-band axes will announce a direction the audit says they must not name.
- THE VERDICT LINE CANNOT BE BUILT THE WAY BOTH HALVES OF THE SPEC DESCRIBE. Section 3 says the content is `nearestLine()` verbatim; the markup sketch hand-builds 'Nearest on the map:' plus an anchor. `nearestLine()` returns a single string that already carries the prefix and joins tied names with ' · ', not ' and '. Linkifying it means substring-matching tradition names like 'Presbyterian / Reformed (confessional)' inside prose. There is no structured accessor for this; one has to be added.
- THE DATA THE HERO NEEDS DOES NOT EXIST ON THE OBJECT IT READS FROM. `Bar` in site/src/lib/engine/types.ts carries label, value, emoji, left, right, lean — no slug and no key. The rails-as-table-of-contents idea, which is the spec's headline concept, cannot produce `href="#axis-grace"` from a Bar. Likewise `result.ranked` carries only {name, slug, score}, so the axis-card tradition marks have no positions to place. Both types must be widened and the spec never says so.
- SECTION 7 BREAKS ITS OWN RULE ONE PARAGRAPH LATER. Rule 2 is 'one link per destination per section'; the top tradition row then carries two anchors to the same href, adjacent, in the same section. A screen reader reads the destination twice in a row, and it is the weaker of the two link-equity patterns anyway.
- THE THEME CSS IS BROKEN AS WRITTEN. `:root[data-theme="dark"], :root:not([data-theme="light"]) { @media (prefers-color-scheme: dark) { ... } }` nests the media query INSIDE the selector, so an explicit dark toggle on a light-OS machine gets no dark tokens at all. The knob `filter` fix has the same bug in reverse — it is inside a bare `prefers-color-scheme` block and never fires for the explicit toggle. Both must be written as three blocks, not one clever one.
- THE AXIS-CARD H3 ANCHOR DOES NOT MATCH THE DESTINATION IT CLAIMS TO MATCH. The spec says 'Grace — Monergist ↔ Synergist' 'matches the axis page H1 pattern'. The built page's H1 is `{group.emoji} {group.name}` and its title is `${name}: ${left} or ${right}`. Neither matches. Either the anchor rule or the axis page H1 has to change, and the spec instructs neither.

### What must survive

- The three-layer funnel order — what am I / who am I like / what does it mean — is right, and the reasoning about the reader verifying rather than studying is the best-argued paragraph in the document. Keep the order and keep traditions above the axis prose.
- Truncating the axis cards and pushing the full 2,500 words to the indexable axis pages. This is the correct answer to both the wall-of-grey problem and the SEO problem at once, and it is the strongest idea in the spec.
- The whole of section 8, the parallel indexable crawl spine. The reasoning that a persistently-noindex /r/ page eventually stops passing anything, so /axis/[quiz]/index and /tradition/index must exist and be linked from nav and from the quiz page, is correct and is the difference between traffic and none.
- 'robots.txt must NOT contain Disallow: /r/'. Correct, non-obvious, and the most expensive mistake available here.
- The og:image finding. I verified site/src/layouts/Base.astro line 35: twitter:card is summary_large_image with no og:image anywhere. Every share of the page whose purpose is being shared currently renders a broken card. Ship the static fallback now.
- The readMore finding, in effect if not in mechanism. The audited data is {left, right}, QuizGroup.readMore is typed string[], and the guard `group.readMore.length > 0` is undefined on an object — so the Read further section silently renders nothing on all six axis pages today. (The spec's stated cause, '.map on an object', is not what happens; the guard short-circuits first. The fix is the same.)
- Refusing FAQPage, AggregateRating and HowTo, and keeping the result page's JSON-LD to BreadcrumbList only because it is noindex. Correct restraint, and consistent with the real-data rule.
- Rows 4-18 of the traditions list in the DOM inside <details> rather than JS-injected, and native <details> everywhere instead of JS toggles. Correct for Ctrl+F, screen readers, and no-JS.
- Rejecting role="progressbar" on the track. A position between two poles is not progress.
- Refusing to link the reading citations because there are no URLs in the data. Exactly the right instinct.
- Demoting the traditions section below the axes in the 'central' state instead of leaving an unanswerable list in the prime slot.
- The insistence that the opposite pole is a labelled <details>, present and keyboard-reachable, never a conditional that omits half the axis. Hold this line — it is the one that was broken last time.
- The query-shaped outbound anchors ('Whether the sign gifts continued after the apostles'). Right idea, right length, right voice. They just need re-keying to the real slugs.

### Rewritten spec

REPLACING sections 1, 3 and 5 — the hero, the rails, and the axis card. Sections 7-10 (anchors, crawl spine, robots, JSON-LD) stand, with the slug corrections in 0.1 applied throughout.

## 0. Corrections that gate everything below

0.1 SLUGS. The route slug is `axis.slug`, derived from the axis NAME in site/scripts/build-data.mjs, not the audit key. The six are, in order: `grace`, `table`, `gifts`, `kingdom`, `authority`, `worship`. Every href, every DOM id (`#axis-gifts`, not `#axis-spirit`), and every seoAnchor/seoTitle map key uses these. Re-key section 7's anchor table: spirit -> gifts, tradition -> authority. Add to site/scripts/build-data.mjs a hard assert that the six emitted slugs equal that list, so a future rename of an axis name breaks the build instead of the links.

0.2 TYPE WIDENING (site/src/lib/engine/types.ts).
- `Bar` gains `slug: string` and `band: number`. `bipolar.result()` sets `slug: g.slug` and `band: band(values[i] ?? 50)`. Without this the rails cannot link to their cards and cannot know they are mid-band.
- `QuizResult` gains `state: { kind: NearestKind; names: Array<{name: string; slug: string; match: number}> }` — the structured form of `nearestLine()`. The page never linkifies a prose string.
- `QuizResult.ranked` entries gain `position: number[]` (already available inside `nearest()`; just stop discarding it).
- `QuizGroup.readMore?: string[] | { left: string[]; right: string[] }`, and site/src/pages/axis/[quiz]/[axis].astro handles both shapes. Today the object shape makes `.length` undefined and the Read further section renders nothing on all six pages.

0.3 THE MIDDLE-BAND / CENTRAL MISMATCH. Two definitions of "the middle" currently disagree (band 2 = 41-59; central = 40-60). Do not touch the audited thresholds. Resolve it at the page:
```js
const h1Text = result.state.kind === 'central' ? 'Near the center on every axis' : result.headline;
```
and in the central state the verdict reads: `Every axis landed within ten units of the middle, so no tradition is named.` The h1 and the line under it can then never contradict each other. Add a case to audit/selftest.js: for every sheet where `nearestState().kind === 'central'`, assert the rendered h1 contains no band adjective.

0.4 MIDDLE-BAND COPY, one rule, no exceptions. When `bar.band === 2` the rail and the card print `In the middle band — this axis names no position for you.` and nothing else. No percentage, no pole name, no adjective, and the aria-label says the same words. `lean()` output is used only when `bar.band !== 2`. (`lean()` returns "18% toward Monergist" at 41-59; that string is forbidden here.)

0.5 AXIS PAGE H1. Change site/src/pages/axis/[quiz]/[axis].astro to `<h1>{group.emoji} {group.name} — {group.left} ↔ {group.right}</h1>` and title `${name}: ${left} or ${right}` -> `${seoTitle}`. Now the result page's axis-card anchor genuinely equals the destination's H1 phrase, which is what section 7 rule 1 claims.

## 1. summary_parts, done honestly

The three-way split is right; the labels are not. Two of the six third sentences are not cautions. Author in audit/compass-data.revised.json, per axis:

```json
"summary_parts": {
  "left":  "…verbatim sentence(s)…",
  "right": "…verbatim sentence(s)…",
  "third": "…verbatim sentence(s)… or null",
  "third_kind": "between" | "method" | null
}
```
Verified assignments (sentence indices into fair_summary):
- grace   L=[0,1] R=[2,3,4] third=[5,6,7] kind=**method**
- table   L=[0]   R=[1]     third=[2]     kind=**between**
- gifts   L=[0]   R=[1,2]   third=null
- kingdom L=[0]   R=[1]     third=[2]     kind=**between**
- authority L=[0] R=[1]     third=null
- worship L=[0]   R=[1]     third=null

Headings, chosen by `third_kind`:
- `between` -> `<h4>Where people stand between the poles</h4>`, rendered as a normal sibling block, NOT an `<aside class="caution">`. Reformed Baptists and progressive dispensationalists are positions, not errata.
- `method` -> `<aside class="caution"><h4>How this axis is built</h4>` (not "One caution about this axis" — the grace prose already opens with "One caution about how this axis is built:", and printing both stutters).

Grace's note ends "(see candidate_statements)", an internal JSON key. Fixing it is a content edit, so do it in the audit, not in the template: add `fair_summary_display`, identical to `fair_summary` except that the parenthetical becomes `(a four-item version of this axis separates the two questions)`, and add a changelog entry recording the substitution. audit/selftest.js then asserts (a) `left + ' ' + right + ' ' + third`, whitespace-normalised, equals `fair_summary_display` for all six, and (b) `fair_summary_display` differs from `fair_summary` only at that one documented substring. Nobody can silently rewrite audited prose through the split, and nothing internal leaks.

## 2. Page order, with real numbers

```
site header (56)
=== HERO #result ==============================
  eyebrow · h1 · verdict · provenance
  .compass  (the one graphic on the page)
  .code-row (moves BELOW .compass on mobile via order)
---------------- fold ------------------------
=== #traditions === #axes === #share === #next
```
Measured budget at 380x740, mobile chrome ~110 so ~630 usable:
header 56 · eyebrow 20 · h1 3 lines @26/1.15 = 90 + 12 margin = 102 · verdict 2 lines @15/1.45 = 44 · provenance 18 · compass block 338 (see 3.2) · page top margin 16. **Total 594.** ~36px of the "Closest traditions" heading shows. `.code-row` sits below the fold on mobile by design — nobody shares before they have read the result. Verify, do not trust me: after build, run `document.querySelector('#traditions h2').getBoundingClientRect().top` at 380x740 and require a value between 560 and 620.

Desktop >=900px: `.hero { grid-template-columns: 5fr 7fr; gap: 40px; align-items: start; }`, type left, compass right.

## 3. The hero graphic — one instrument, not six bars

The failure to avoid is six identical grey tracks. Fix it by making the SIX RAILS ONE OBJECT with a single shared spine.

3.1 STRUCTURE. `.compass` is a panel (`background: var(--panel); border-radius: 20px; padding: 18px 16px; box-shadow: 3px 3px 5px rgba(68,68,68,.065)`) with three layers:
- **layer 0, texture**: an `::before` at `inset:0`, the existing paint-pour PNG as `-webkit-mask-image`/`mask-image`, `mask-size: cover`, filled with `linear-gradient(115deg, var(--brand-1), var(--brand-2))` at `opacity:.07` light / `.10` dark, `border-radius: inherit`, `pointer-events:none`. This is the one place the brand gradient appears at size, and it is the tactile note the rest of the page borrows from. If the mask asset is missing, ship without it — never fall back to a flat gradient wash.
- **layer 1, the spine**: one absolutely positioned element at `left:50%` of the track column, `top:8px; bottom:34px; width:1px; background: var(--ink-3); opacity:.28`, plus a 9px `Poppins 10px` label `centre` set at the top in `--ink-3`. Six knobs scattered around ONE vertical line is a picture of a person; six knobs on six unrelated bars is a spreadsheet. This single line is the entire visual idea and it costs nine lines of CSS.
- **layer 2, the six rails**, `display:grid; row-gap:6px`.

3.2 ONE RAIL (48px, measured).
```
row 1 (16px): <a class="rail-name">⚖️ Grace</a>            <span class="lean">32% toward Monergist</span>
row 2 (14px): track, height 6, border-radius 3, margin 8px 0 5px
row 3 (13px): <span class="pole is-yours">Monergist</span> <span class="pole">Synergist</span>
```
- Track background `color-mix(in srgb, var(--axis) var(--axis-tint), transparent)` — tint token 14% light / 22% dark. Knob 14px, solid `var(--axis)`, `box-shadow: 3px 3px 5px rgba(68,68,68,.065)`, `transform: translate(-50%,-50%)`, `left: value%`. Layered opacity, never a flat fill. Never `var(--axis)` on text: #C98A12 on #EEEEEE is ~2.6:1.
- **Both poles always rendered.** Non-negotiable. The reader's side gets `.is-yours { color: var(--ink-2); font-weight: 600; }`; the far side stays `var(--ink-3)` at 400. Emphasis, never deletion — a reader must always be able to read the name of the position he does not hold.
- `.rail-name` is the only interactive element in the row; it links to `#axis-{slug}` and is the page's table of contents. The track carries `role="img"` and an aria-label; nothing else in the row is focusable.
- Band 2: no percentage, no pole direction (0.4). `.lean` reads `middle band — no position named`, both pole labels revert to `--ink-3`/400, and the knob drops to `opacity:.6` with a 1px `currentColor` ring at 20% so it reads as "resting" rather than "placed".
- `aria-label` outside band 2: `Grace: 32 percent toward Monergist, on a scale from Monergist to Synergist.` Inside band 2: `Grace: in the middle band, no position named, on a scale from Monergist to Synergist.`

3.3 VERDICT LINE, built from `result.state`, never by string surgery:
- near: `Nearest on the map: <a href="/tradition/{slug}/">{name}</a>` + ` <span class="pct">{match}% match</span>`
- tie: `Two sit equally close: <a>A</a> and <a>B</a>` + the row-level note in #traditions
- loose: `No listed tradition is a close fit.` then a second sentence, `Nearest, loosely: <a>A</a>, <a>B</a>.`
- central: `Every axis landed within ten units of the middle, so no tradition is named.`

## 4. The axis card — six cards that are not six identical rectangles

4.1 THE BIPOLARITY IS THE LAYOUT. Your side's paragraph sits in a block with a 3px `var(--axis)` edge on its LEFT. The other side's `<details>` carries a 3px `var(--axis)` edge on its RIGHT at `opacity:.45`. Mirrored. On a right-pole reader the mirroring flips (yours right-edged, theirs left-edged). A reader can see, without reading a word, that this card has two sides and that one of them is his. That costs two CSS rules and is the single cheapest way to stop the page looking like six grey walls.

4.2 CARD SHELL. `<section class="axis" id="axis-{slug}" style="--axis:#2F4FCB">`, `background: var(--panel); border-radius: 20px; padding: 22px 18px; box-shadow: var(--shadow)`. No left border on the card itself — the edge belongs to the two prose blocks, where it means something. Alternate `padding-inline` nothing; instead alternate nothing at all — the rhythm comes from the mirrored edges flipping per reader, and from history entries of different lengths. Do not stripe backgrounds.

4.3 HEAD.
```html
<h3><a href="/axis/theology-compass/grace/">Grace — Monergist ↔ Synergist</a></h3>
```
DM Serif Display italic, 22px, `--ink-1`. Under it the large rail: track 10px, knob 18px, same tint/solid treatment, both poles at 12px.

4.4 THE TRADITION MARKS — labelled or cut. Three anonymous dots is the old failure at 6px. Replace with **exactly two labelled markers**: the tradition with the LOWEST `position[i]` and the one with the HIGHEST, i.e. the extremes of this axis, which are stable, meaningful, and never collide with each other. Each is a 1px 10px-tall vertical tick in `var(--ink-3)` at 45% with a visible 10px Poppins label beneath, left-aligned to the tick and clamped inside the track box. Below 480px, drop to a single line of text under the poles instead: `<p class="anchors">Furthest monergist here: Presbyterian / Reformed. Furthest synergist: Free Will Baptist.</p>` Both traditions are links. This is pure data, it teaches the scale, and it produces two more high-relevance internal links per axis.

4.5 BODY ORDER (identical per card; a reader learns it once):
```
p.lean-line     You: 32% toward Monergist — firmly monergist     [band 2: the 0.4 sentence, no adjective]
h4 + p          How monergists put it        summary_parts.left    [left-edged, open]
details         How synergists put it        summary_parts.right   [right-edged, closed]
[third]         "Where people stand between the poles" OR aside.caution "How this axis is built"
h4 + ul.passages   Passages both sides argue from
h4 + dl.history    How the question arose    3 entries, then the link out
h4 + .reading      Reading on each side      two columns, headed by pole name
p.axis-out         the query-shaped link
```
- Band 2 (`bar.band === 2`): BOTH sides render as sibling closed `<details>`, both mirrored-edged, under the lead `You landed in the middle band here, so this axis names no position for you. Both sides, in their own words:`. Never omit either.
- `<details><summary><h4>…</h4></summary>` — a heading is legal inside summary and keeps the outline intact through collapse. `open` is set at render, not by script.
- HISTORY: `<dl>`, grid `82px 1fr` at >=560px, stacked below; `<dt>` Poppins 12 tabular-nums `--ink-3`, `<dd>` Inter 14/1.55 `--ink-2`. Add a 1px `--ink-3` at 15% vertical rule between the two grid columns so it reads as a timeline rather than a table. Show entries **[0], middle, last** so the span of centuries is visible; grace then reads c. 411-430 / 1577 / 1937 rather than three fourth-century lines. Then `<a href="…/#history">All nine turning points on the Grace axis</a>`, the count from `history.length` (grace 9, table 8, gifts 10, kingdom 10, authority 8, worship 10 — verified).
- PASSAGES: chips, 11px Poppins, `padding: 4px 9px; border-radius: 999px; background: color-mix(in srgb, var(--axis) 9%, var(--panel)); color: var(--ink-2)`, all of them, not links.
- READING: `readMore.left` / `readMore.right`, two columns >=480px, headed `<h5>Reading on the Monergist side</h5>` / `…Synergist side`, titles in `<i>`, plain text, no invented URLs.

4.6 THEME CSS, written as three blocks so the toggle works in both directions:
```css
:root { --axis-tint: 14%; --knob-adjust: none; }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { --axis-tint: 22%; --knob-adjust: saturate(.9) brightness(1.12); }
}
:root[data-theme="dark"] { --axis-tint: 22%; --knob-adjust: saturate(.9) brightness(1.12); }
.knob { filter: var(--knob-adjust); }
```
Never define a colour only inside a media query.

## 5. Acceptance checks before this ships
1. Every `/axis/theology-compass/{slug}/` and `/tradition/{slug}/` href on a rendered result page returns 200 (crawl the built output; the slug bug above is a 404 on two of six).
2. No rendered page contains a band adjective when `nearestState().kind === 'central'`.
3. No rendered page contains the substring `toward` inside a rail whose `band === 2`.
4. No rendered page contains the string `candidate_statements`.
5. Both pole names appear as visible text in every rail and every axis card, in every state including band 2.
6. `summary_parts` reconcile to `fair_summary_display` for all six axes, whitespace-normalised.
7. `#traditions h2` top is between 560 and 620 at 380x740.
8. `node audit/selftest.js` passes.


---

# Share card and email capture

**Critic verdict: `needs-work`**

## Concept

One SVG string function, `cardSVG()`, is the single source of truth for the share image: it renders the on-page preview (live DOM SVG, page fonts), the downloadable PNG, and the `og:image` (same string, rasterised server-side by resvg). Its composition is a fixed-light 1200×630 card where a six-colour spine rail runs the left edge, a bipolar compass emblem sits top-right, and six wide bipolar bars — every one naming BOTH poles, drawn as tint-track + conviction-wedge + solid knob — carry the honesty the last attempt lost. The email capture is built around a refusal: the form deliberately cannot send your result, and saying so is the offer's credibility; the same page detects "my result" vs "a friend sent me this" from a locally-written marker and physically reorders the CTA block, suppressing the capture entirely for visitors.

## Why it works

**The card.** A social preview is looked at for roughly one second at about a third of full size before anyone decides to stop. So the card carries exactly two things that survive that scale — the serif headline (40–54px, reads at 13–18px in a feed) and the emblem's silhouette, which is different for every person and therefore feels like *theirs*. Everything else is reward for stopping. The six bars are that reward, and they are also the integrity: at full size a viewer sees "Monergist ←→ Synergist" with a knob between them, so the bipolar premise is stated in words on the image itself, six times, and cannot be misread as a one-sided label. The emblem carries no text at all — deliberately, because the previous failure was a wheel that named one pole per axis; an unlabelled emblem beside six fully-labelled bars misleads no one, whereas a half-labelled wheel does.

The emblem also solves a geometry problem the last attempt didn't face. A normal radar plots magnitude outward from the centre, which is wrong for bipolar axes: 0 and 100 are *both* strong convictions and would both need to be far out. So each axis is a full diameter, not a radius; the knob sits at `R·(score−50)/50`, on whichever side the person actually leans. A dead-centre answer puts the knob at the middle, which is the visual truth — and the faint connecting polygon is suppressed entirely when every axis is within 8% of centre, so an all-central result gets no shape, matching the audited rule that a midpoint names no position.

The three-layer opacity is the thing people liked and the thing that was killed by flat fills. At 0.16 the track reads as a channel, not a stripe; the wedge at 0.34 makes lean legible without measuring; the knob at full saturation is the only fully-saturated pixel in the row, so the eye lands there. Six of these at six hues stay calm because most of each row's ink is tint. The spine rail applies the same principle to the whole card: six colour blocks whose opacity encodes conviction strength, so the card's left edge is a fingerprint that survives any thumbnail crop (vertical edges are never cropped; 2:1 crops take 15px off top and bottom).

**The prose problem.** Nothing on the card is prose. The headline breaks on its own commas — one band adjective per line, as a stanza — which is deterministic, needs no text measurement, and looks composed rather than justified. The subline is a single fixed-baseline line pulled verbatim from `nearestLine()`, hedges intact.

**The email capture.** A discernment-minded audience does not distrust email lists; it distrusts *unstated* asymmetries. The conversion move everyone reaches for — "email me my result" — is precisely the one that would make the existing promise false, because it requires transmitting the result. Refusing it converts *better* here, not worse, because it makes the trust claim checkable: the form has no hidden result field, and a suspicious reader can open devtools and confirm it in ten seconds. An unfalsifiable promise reads as marketing; a falsifiable one that survives being checked is the moat.

The offer works because it is not gated content. Gating the reading lists or the axis essays would tax exactly the readers most likely to subscribe and would contradict "the quizzes are the door." What the owner uniquely has is the audit — 522 findings, 424 applied, 11 kept and disputed — so the offer is *the working*: a note when something new goes up, and what a reviewer said was unfair about it and what changed. That is a thing only this site can send, it costs nothing to give, and it flatters the reader's actual disposition (they like discernment) rather than their vanity.

Placement respects the priority order. Share is the growth channel and must not compete with capture, so capture is the last block on the page, after the value, after the share, after the onward articles. And it disappears for visitors — someone reading a friend's result has received no value from us yet, and asking them for an address before they have taken the quiz is the exact grabby move that gets screenshotted.

**Context detection** works because the finisher can mark themselves and a share recipient cannot. The marker is written locally at the moment of completion, contains only a code the browser already has, and defaults to "visitor" when absent — the safe direction, since shares fan out one-to-many and the visitor CTA ("take it yourself") is also the growth action. The reorder is done by moving nodes, not by CSS `order`, so tab order follows what the eye sees.

## Specification

## PART 1 — THE CARD

### 1.1 Canvas, safe areas, palette

Canvas `1200 × 630`, `viewBox="0 0 1200 630"`, `preserveAspectRatio="xMidYMid meet"`.

X (Twitter) crops `summary_large_image` to 2:1, removing **15px from top and bottom**. Therefore: nothing meaningful above y=40 or below y=590. Content left edge `L = 66` (56px margin + the 10px spine rail). Content right edge `R = 1144`.

The card has its **own fixed palette**, not the page's theme tokens. A shared image must look identical in every feed; a dark-mode-dependent OG image would render light-or-dark depending on the *server's* render, which is meaningless. So `og:image` is always the light card. A dark variant exists for the on-page preview and download only (§1.10).

```
Light card (canonical)          Dark card (download/preview only)
paper   #F4F1EA                 #201F1C
panel   #FBF9F5                 #2A2926
ink     #2E2D2A  (headline)     #F2EFE8
ink-2   #5F5C56  (labels)       #B8B3A8   >= 4.5:1 both ways
ink-3   #857F74  (micro-caps)   #8E887C   >= 3:1 at 20px/600
rule    #DFDACF                 #3A3833
grad-a  #7EBAEE  grad-b #F0A06F (unchanged in both themes)
```

Axis colours, in axis order, used at three opacities only (0.16 track, 0.34 wedge, 1.0 knob):

```
0 grace     #2F4FCB   3 kingdom   #2E7D4F
1 table     #9E2A3B   4 tradition #C98A12
2 spirit    #E2582B   5 worship   #6A4BC0
```

`#C98A12` at full saturation on `#F4F1EA` is 2.9:1 — fine for a 9px knob (a graphical object needs 3:1 against *adjacent* colour, and its 3.5px paper ring provides that), but **never use an axis colour for text**.

### 1.2 Background stack (bottom to top)

1. `<rect width=1200 height=630 fill=paper>`.
2. **Brand wash.** `linearGradient` id `wash`, `x1=0 y1=0 x2=1 y2=0.8`, stops `#7EBAEE` at `stop-opacity .20` to `#F0A06F` at `stop-opacity .20`. Painted as a rect masked by a vertical alpha ramp (white to black, y 0 to 67%) so it is present at the masthead and gone by the bars. If you can see it as a gradient, it is too strong.
3. **Grain.** `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>` on a full rect at `opacity=".035"`. Resvg supports both primitives. If server render exceeds ~250ms, drop this rect — it is the only expensive element. Do **not** inline the paint-pour PNG stencils: an external `<image href>` breaks both canvas rasterisation (taint) and resvg (no fetch).
4. **Spine rail.** `x 0..10`, six stacked rects `y = i*105`, height 105, fill `AXIS_COLOUR[i]`, `fill-opacity = 0.28 + 0.62 * |score_i - 50| / 50` (range .28-.90). No gaps, no rounding. This is the card's fingerprint and the only element that reads at any size.

### 1.3 Masthead (y 0–134)

- `(66, 78)` — `WISER WALK`, Poppins 600, 20px, `letter-spacing: .16em`, fill ink-3, uppercase.
- `(66, 112)` — quiz title (`Theology Compass`), DM Serif Display **italic**, 28px, fill ink-2.
- `(1144, 96)` `text-anchor="end"` — `wiserwalk.com`, Poppins 500, 18px, fill ink-3.
- Hairline: `M 66 134 H 1144`, stroke rule, 1px, `shape-rendering="crispEdges"`.

### 1.4 Verdict block (y 152–300), left column x 66 → 900

The headline string comes from the engine's `headline()` — never rebuild it. Split it on `", "`; you get 1–3 band adjectives (`headline()` slices to 3), or the single string `Near the center on every axis`.

**One chunk per line. No greedy wrapping, no text measurement.** Re-append the comma to every line but the last.

```
chunks  size  line-height  block height
  1      54       64            64
  2      48       57           114
  3      40       47           141
```

Vertically centre the block in the region 152–300: `top = 152 + (148 - blockH)/2`; first baseline `= top + 0.76*size`; subsequent `+= line-height`. Font: DM Serif Display **italic**, fill ink, `text-anchor="start"`, x=66. First character upper-cased (the engine already does this).

Longest realistic chunk is `rooted in Scripture and tradition` (33 chars) — 620px at 40px, 767px at 48px, both clear of the emblem at x=940.

**Subline**, fixed baseline **y=336**, x=66, full width to 1144, Poppins 500, 20px, fill ink-2. Text = `nearestLine(quiz, values, near)` verbatim, plus `" (approximate)"` when `nearestState().kind` is `near` or `tie` — identical to the audited `shareText()`. This preserves all four hedges:

- `central` → `Near the center on every axis, so no tradition is named`
- `loose` → `No listed tradition is a close fit. Nearest, loosely: A, B`
- `tie` → `Nearest on the map (jointly): A · B (approximate)`
- `near` → `Nearest on the map: A (approximate)`

If estimated width > 1078px (about 98 chars at 20px), drop to 18px; if still over, hard-truncate at the last space and append an ellipsis. Never wrap it — the vertical budget below is fixed.

**No match percentage appears on the card.** The result page shows `91%`; the card does not, because a lone big number reads as a claim about the person and the audited share text deliberately says "approximate" instead. This is a rule, not a preference.

### 1.5 The emblem (centre 1026, 222; R = 86)

Twelve endpoints, six diameters, 30 degrees apart. `theta_i = (-90 + 30*i)`, `u = (cos, sin)`, `t_i = (score_i - 50)/50` in [-1, 1], `P_i = C + R*t_i*u`.

Draw order:

1. Outer ring — `circle r=86`, `fill=none`, stroke rule, 1.25.
2. Centre reference — `circle r=43`, stroke rule, 1, `stroke-dasharray="2 6"`.
3. Six diameter tracks — `line` from `C - R*u` to `C + R*u`, `stroke=AXIS_COLOUR[i]`, `stroke-opacity=".20"`, `stroke-width="7"`, `stroke-linecap="round"`.
4. Twelve rim ticks — at `theta` and `theta+180`, from `R+5` to `R+10`, `stroke=AXIS_COLOUR[i]`, `stroke-opacity=".45"`, width 2, round cap. Both ends of every axis get a coloured tick: bipolarity stated geometrically.
5. **Conviction polygon**, only if `min|t_i| >= 0.08` for all six. Vertices are `P_0..P_5` **sorted by `atan2(P.y-cy, P.x-cx)`** — not by axis index. Unsorted vertices self-intersect the moment any axis leans left, because a negative `t` flips the point 180 degrees. Fill `url(#wash)` at `fill-opacity=".16"`, stroke ink at `.16`, width 1.25, `stroke-linejoin="round"`.
6. Six knobs — `circle r=6.5` at `P_i`, `fill=AXIS_COLOUR[i]`, `stroke=paper`, `stroke-width="2.5"`.
7. Centre dot — `circle r=2.5`, fill ink, `opacity=".35"`.

The emblem is text-free by design (see *why_it_works*). It is described only in the accessible label.

### 1.6 The six bars (rule y=356; rows top at 376, 448, 520)

Two columns, gutter 70: `colA x=66 W=504`, `colB x=640 W=504`. Axes 0,1,2 down column A; 3,4,5 down column B. Row pitch 72.

Per row, with `x0` and `top`:

| element | geometry | style |
|---|---|---|
| axis name | `(x0, top+17)` | Poppins 600, 18px, fill ink-2 |
| lean | `(x0+504, top+17)`, `text-anchor=end` | Poppins 500, 16px, fill ink-2 |
| track | `rect x=x0 y=top+30 w=504 h=12 rx=6` | fill axis colour, `fill-opacity=".16"` |
| centre tick | `line x=x0+252, y from top+26 to top+50` | stroke ink, `.28`, width 2 |
| wedge | rect between `x0+252` and knob x, `y=top+30 h=12`, `rx=min(6, w/2)` | fill axis colour, `fill-opacity=".34"` |
| knob | `circle r=9` at `(clamp(x0+9, x0+504*s/100, x0+495), top+36)` | fill axis colour solid, `stroke=paper`, `stroke-width="3.5"` |
| left pole | `(x0, top+60)` | Poppins 500, 14px, fill ink-2 |
| right pole | `(x0+504, top+60)`, `text-anchor=end` | Poppins 500, 14px, fill ink-2 |

The centre tick is not optional. Without it a viewer cannot tell that 50 is a meaningful midpoint rather than an empty bar, and the whole bipolar reading collapses.

Lean text is `lean(group, score)` from the engine, verbatim — `32% toward Monergist`, `at the center`, `at the Sacramental pole`. Do not invent middle-band wording; the card must say exactly what the result page says two screens above it.

Both pole names always render. At 504px width and 14px they cannot collide (longest pair, `Bible & tradition` + `Scripture alone`, is about 230px total). If a future quiz has longer poles, shrink to 13px before truncating, and truncate the *left* one only.

Last row bottom = 580, i.e. 50px clear of the crop line.

### 1.7 Accessible description (used by the on-page `<svg role="img">` and `og:image:alt`)

```
Theology Compass result card. {headline}. {subline}.
Grace: 32% toward Monergist, on a scale from Monergist to Synergist.
... one sentence per axis ...
```

Cap `og:image:alt` at 420 characters (X truncates there); the on-page `aria-label` carries the full string.

### 1.8 Fonts

Three faces, subset to Latin: DM Serif Display Italic 400, Poppins 500, Poppins 600.

- **On-page preview** — live SVG in the DOM. Uses the page's already-loaded `@font-face`. Nothing to embed.
- **Server render (resvg)** — resvg needs **TTF/OTF**, not WOFF2. Ship `public/fonts/*.ttf`, load with `fs.readFile` into `fontBuffers`. On Vercel add them to `includeFiles` or the function renders in a fallback face and silently looks wrong.
- **Client canvas fallback (§2.3)** — needs base64 **WOFF2** inlined in an `@font-face` inside the serialised SVG's `<style>`, fetched lazily on click. Do not inline it into every page.

Set `font-family="DM Serif Display, Georgia, serif"` and `"Poppins, Segoe UI, sans-serif"` so a missing face degrades rather than disappears.

### 1.9 The `og:image` route

`src/pages/og/[quiz]/[code].png.ts`, `export const prerender = false`, Node runtime.

```
1. getQuiz(params.quiz)                     -> 404 if unknown
2. decodeFor(quiz, code.toUpperCase())      -> 404 if null
3. reject if code.length !== quiz.groups.length     (cheap DoS guard)
4. svg = cardSVG(quiz, values, {theme:'light'})
5. png = new Resvg(svg, {fitTo:{mode:'width',value:1200},
                         font:{fontBuffers, loadSystemFonts:false}}).render().asPng()
6. Cache-Control: public, max-age=31536000, immutable
   Content-Type: image/png
```

`loadSystemFonts:false` matters — otherwise local dev picks up a system Poppins and CI does not, and you ship two different cards.

Output is about 70–110 KB (flat fills compress well). X's limit is 5 MB.

`Base.astro` gains `ogImage?: string` and `ogImageAlt?: string`; the result page passes the absolute URL. Emit `og:image`, `og:image:width` 1200, `og:image:height` 630, `og:image:alt`, `twitter:image`. `twitter:card` is already `summary_large_image`.

Also add to result pages: `<meta name="referrer" content="strict-origin-when-cross-origin">` — full URL stays for same-origin (which the "did I just take this" detection needs), origin only goes to X or Facebook when the user clicks out, so the code does not ride the Referer header off-site.

### 1.10 Dark card variant

A `Dark card` toggle above the preview swaps the five palette tokens in §1.1 and re-renders (one function call). It affects the on-page preview and the downloaded PNG only; `og:image` is permanently light. Persist in `localStorage['ww:card-theme']`. Axis colours are unchanged — they are legible on both grounds, and changing them per theme would break recognition.

---

## PART 2 — THE ON-PAGE SHARE BLOCK

Replaces the current `<h2>Share it</h2> / <pre class="share"> / Copy` block in `src/pages/r/[quiz]/[code].astro`.

### 2.1 Structure (server-rendered, neutral state)

```
<section class="afterword" data-state="unknown">
  <div class="ctx" hidden>       visitor banner
  <figure class="card-frame">    preview
  <div class="grp grp-share">    copy link / download / native share / X
  <div class="grp grp-take">     take it (again)
  <details class="as-text">      the audited plain-text share block
</section>
```

Server order is share-first with both groups present, so a no-JS visitor gets everything and nothing hides behind a state they cannot reach.

### 2.2 The preview frame

`<figure class="card-frame">` containing the same SVG at `width:100%; height:auto; display:block; border-radius:12px`. The figure is a **mat**: 10px padding in the card's own paper colour, `border-radius:18px`, `box-shadow: 3px 3px 5px rgba(68,68,68,.065), 0 0 0 1px var(--rule)`. In dark theme the mat stays light-card-coloured, which reads as *a photograph of the image* rather than a UI panel that failed to theme.

`<figcaption>`: `This is the image people see when you post the link.` Poppins, 0.82rem, ink-3.

The SVG gets `role="img"` and `aria-label` = §1.7 string. At 380px the card renders 380×200 and its small type is decorative — acceptable, because every word on it already appears as real text higher up the page.

Below the mat, one line of micro-copy: `Nothing on this card is sent to us. It is drawn in your browser from the code in the address bar.` — true, checkable, and it is the sentence that earns the email form 400px later.

### 2.3 Controls

Real `<button>` elements, 44px min touch target, `border-radius:15px`, Poppins 500 0.95rem, focus ring `outline: 2px solid var(--accent); outline-offset: 2px`.

| control | action |
|---|---|
| **Copy link** | `navigator.clipboard.writeText(canonicalURL)` — the URL only, not the ASCII block |
| **Download card** | `fetch('/og/<quiz>/<code>.png')` then blob then `<a download>`. Server PNG is the primary path: identical to what platforms show, no font-embedding risk |
| **Share…** | shown *instead of* Copy link when `navigator.canShare?.({files:[…]})`; `navigator.share({files:[png], text, url})` — one tap to WhatsApp/Instagram with the image attached |
| **Post to X** | plain `<a href="https://x.com/intent/post?text=…&url=…" rel="noopener" target="_blank">` |
| **Share on Facebook** | plain `<a href="https://www.facebook.com/sharer/sharer.php?u=…" rel="noopener">` |
| **Copy as text** | inside `<details>`; copies `shareTextFor()` — the audited circle-bar block, for Reddit/Discord/email where an image is unwelcome |

No third-party SDKs, no pixels. Two anchors, zero scripts — which is what keeps "no tracking" true.

Copy feedback: swap the button label to `Copied` for 1600ms **and** write to a visually-hidden `<p role="status" aria-live="polite">`. Label-only feedback is frequently missed by screen readers. On clipboard rejection (insecure context, Safari without a user gesture) fall back to selecting a hidden `<input readonly>` and setting the label to `Press Ctrl+C`.

If the PNG fetch fails (route down, offline), fall back to client rasterisation: serialise the DOM SVG with the base64 WOFF2 faces injected, `new Image()` from a blob URL, draw to a 2400×1260 canvas, `toBlob()`. Keep this path — it is 30 lines and it is the difference between a dead button and a working one.

### 2.4 Context-aware CTA

**Writing the marker.** At quiz completion, before navigating:

```js
sessionStorage.setItem('ww:just', code);            // this tab
localStorage.setItem('ww:mine:' + quiz, code);      // survives a revisit
location.assign(`/r/${quiz}/${code}#you`);          // belt and braces
```

**Reading it,** in order:

1. `localStorage['ww:mine:'+quiz] === code` → **mine**
2. `sessionStorage['ww:just'] === code` → **mine**
3. `location.hash === '#you'` → **mine**, then immediately `history.replaceState(null,'',location.pathname)` so the flag cannot be copied out of the address bar
4. `document.referrer` starts with `origin + '/q/' + quiz` → **mine** (weak; covers cleared storage)
5. otherwise → **visitor**

Default is **visitor**. Shares fan out one-to-many, so unknown is more often a recipient, and the visitor CTA is also the growth action.

**Mine state** (`data-state="mine"`): heading `Share it`. Order: preview → share group → take group. Sub-line: `Post the card, or send the link — it opens exactly this page.` Take button reads `Take it again`.

**Visitor state** (`data-state="visitor"`): the `.ctx` banner unhides — `Someone shared their result with you.` Heading becomes `Where do you land?`, sub-line `Eighteen statements, about three minutes, scored in your browser.` **Take group is moved above the preview.** Primary button `Take the Theology Compass — 3 minutes`. Share group demoted, `Copy link` relabelled `Copy this link`. **The email capture is removed from the DOM entirely** (§3.5).

**Reorder by moving nodes, not by CSS `order`.** `section.insertBefore(takeGroup, figure)` keeps DOM order, visual order and tab order in agreement; `order:-1` silently breaks keyboard navigation.

The result content itself never changes between states. Only CTA order, three labels, and the presence of the capture.

---

## PART 3 — THE EMAIL CAPTURE

### 3.1 The load-bearing decision

**The form must not be able to transmit the result.** No hidden `code` field, no `quiz` field, no "email me my result" checkbox, and no `Referer` logging on a result page. This forecloses the highest-converting offer available, on purpose: it is the one thing that would make the existing promise false, and its absence is the only part of the trust claim a suspicious reader can verify for themselves in ten seconds with devtools. Verifiability is the offer's credibility, and this audience buys credibility.

The promise splits cleanly and both halves stay true:

- **Unchanged, absolute:** your answers never leave your browser; we never receive your result.
- **New, narrow:** if you want to hear when something new is published, you can give an address. That is separate, optional, and the only thing stored.

### 3.2 The offer

Not gated content. Gating the reading lists or the axis essays would tax the exact readers most likely to subscribe, and contradicts "the quizzes are the door."

**The Working** — a note when a new quiz or article goes up, with what the fairness review found and what changed because of it, plus first sight of a new quiz before it is linked anywhere.

Three properties make it convert without costing trust: only this site can send it (the audit exists nowhere else), it costs the owner nothing to give, and it appeals to discernment rather than vanity.

Frequency is deliberately under-promised: `Every few weeks. Sometimes nothing for a month.` Never "weekly."

### 3.3 Placement

| where | form |
|---|---|
| `/r/<quiz>/<code>` — **mine** state only, last block, below the related articles | full form |
| `/articles/<slug>` — foot, after the body | full form |
| `/subscribe` — standalone page for direct links | full form + the whole privacy table inline |
| site footer | one text link, `Get a note when there's more →`. **No form.** |
| everywhere else | nothing |

Never a modal, never an interstitial, never before the result, never mid-result. On the result page it sits *after* the share block and *after* the onward articles — share is the growth channel and must not compete with capture for the first click.

### 3.4 Markup, copy and consent

```
Heading (DM Serif Display italic, 1.5rem)
  Want to hear when there's more?

Body (Inter, ink-2)
  New quizzes and articles land every few weeks — sometimes nothing for a
  month. If you want a note when they do, leave an address. You will also get
  the fairness review for each one: what a reader said was unfair, and what
  changed because of it. New quizzes go out to this list before they are
  linked anywhere.

Trust panel (accent-soft ground, radius 15, Poppins 0.9rem)
  Your result is not part of this. This form sends your email address and
  nothing else — not your scores, not your code, not which quiz you took.
  We could not email you your result if we wanted to, because we never
  receive it.

[ email input ]  [ Send me new quizzes ]

Consent line, above the button, 0.85rem, ink-2
  Pressing this asks us to email you when a new quiz or article is published,
  and nothing else. You will get a confirmation link first; your address is
  not on the list until you click it.

Fine print, 0.8rem, ink-3
  One address, held by our email provider. Unsubscribe link in every email.
  No open tracking, no click tracking, no pixels, no sharing or selling the
  list, ever. Reply "delete" and it is gone within 7 days.
  Exactly what is stored ->  /privacy/
```

No pre-ticked box and no bundling: the purpose is stated in the sentence above the button, the button does one thing, and double opt-in makes the consent provable. That satisfies GDPR affirmative-action consent without a checkbox.

`No open tracking` is a **build requirement, not copy.** Open tracking is on by default in most ESPs; shipping this sentence without disabling it is a lie.

Success (JS): the form is replaced in place by — `Check your inbox. There's a confirmation link; your address isn't on the list until you click it.`
Success (no JS): POST redirects to `/subscribed/`, which says the same thing.
Error: `That didn't go through — the address looked malformed.` / `Something broke on our side. Nothing was saved.` Never a fake success.

### 3.5 Suppression rule

In the **visitor** state the capture is `.remove()`d, not hidden. Someone reading a friend's result has received nothing from us yet; asking for an address before they have taken the quiz is the grabby move that gets screenshotted. They will see the form after they finish.

### 3.6 The endpoint

`src/pages/api/subscribe.ts`, `prerender = false`, POST, same-origin only.

Accepts `email`, `hp` (honeypot), `t` (form-render epoch ms), `source` (enum).

```
hp !== ''                          -> 200 {ok:true}   (silent)
Date.now() - t < 2500              -> 200 {ok:true}   (silent)
!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/   -> 400
email.length > 254                 -> 400
rate limit 5 / hour / IP; the IP is never written to storage
-> server-side POST to the ESP requesting double opt-in
```

No CAPTCHA. No ESP JavaScript on the page — the API key lives in `SUBSCRIBE_API_KEY` on Vercel, the browser never touches the provider. That is what makes "no third-party scripts" true.

**Never log or forward `Referer`.** On a result page it contains the code, and writing it to a signup record would be the exact leak the trust panel denies. Store a coarse `source` enum instead — one of `result | article | direct | footer`. This is the single most important line in the endpoint.

ESP requirements (Buttondown or self-hosted Listmonk both qualify; Kit needs configuring): double opt-in on, open tracking off, click tracking off, signup-IP retention off or disclosed, DPA available, unsubscribe header in every send.

### 3.7 What is and is not stored

**Stored, only after confirmation:** the email address; the UTC date of confirmation; a coarse source label.

**Not stored:** name; scores; result code; which quiz was taken; whether any quiz was taken; IP address; open or click events; anything linking an address to a result.

**Seen but not kept:** your IP is visible to our email provider at the moment you submit, and to our host in short-lived request logs.

**The disclosure that must not be skipped.** `/r/<quiz>/<code>` is `prerender = false`, so *the result code is in the request path and the host sees it on every view* — and the `og:image` route makes that more visible, since X and Facebook fetch the PNG by code. The current copy ("nothing is stored on our side") is defensible but reads broader than it is. Add, verbatim, to `/privacy` and `/method`:

> Your answers never leave your browser. Your scores do appear in the result link itself, so our host sees that link when it renders the page — the same way it sees any address you visit. We keep no record of it; our host's request logs expire on their own. If that bothers you, the result page works fine if you never share the link.

Turn off any log drain, and add no analytics to `/r/` or `/og/`.

(If total airtightness ever outranks share cards, the code could live in the URL fragment — fragments are never sent to servers — but crawlers cannot read fragments, so personalised OG images become impossible. Named as a real tradeoff, not a recommendation.)

### 3.8 Exact rewrites of the published promises

**`src/pages/about.astro:39`** — replace the list item:

> **Not collecting your answers.** No account, and no analytics on what you answer — your answers never leave your browser. The one thing we store is an email address, and only if you hand one over for the new-quiz note; it is never connected to a result. [What is stored](/privacy/).

**`src/pages/method.astro:86–90`** — replace the "Your answers" paragraph with three:

> Every quiz is scored in your browser. Your answers are never sent to a server, there is no account, and nothing about your result is stored. A result link carries only your scores, encoded — which is also why a broken link cannot be recovered.
>
> There is one thing we store, if you choose to give it: an email address, for a note when a new quiz or article goes up. It is optional, it is separate from everything above, and the form that collects it deliberately sends nothing but the address — not your scores, not your code, not which quiz you took. We could not email you your result if we wanted to, because we never receive it. The full list is on the [privacy page](/privacy/).
>
> *Changed 3 September 2026: this page used to say "there is no account and no email, and nothing is stored." The email list is new. Nothing about how answers are handled has changed.*

**`src/pages/quizzes.astro:28`** — replace the lede sentence:

> Each one is scored entirely in your browser. No account, nothing about your answers stored — a result link carries your scores and nothing else.

**`src/layouts/Base.astro` footer** — no change needed; it speaks only about answers and result links, and both claims remain true. Add one link: `<a href="/privacy/">What is stored</a>`.

**New page `/privacy/`** — plain language, no legalese: the §3.7 stored / not-stored / seen-but-not-kept table; the §3.7 host-logs disclosure; how to delete (reply "delete", gone within 7 days); the processor's name; and a dated changelog at the foot beginning with the entry above.

The dated changelog is the cheapest trust purchase available. For an audience selected for discernment, quietly editing a promise is worse than the change itself; announcing it is worth more than never having promised.

## Markup sketch

```html
<![CDATA[
<!-- ============================================================
     src/lib/share/card.js — ONE source of truth for the 1200x630.
     Used by: on-page preview, PNG download, /og/*.png (resvg).
     ============================================================ -->
<script type="module">
export const AXIS_COLOUR = ['#2F4FCB','#9E2A3B','#E2582B','#2E7D4F','#C98A12','#6A4BC0'];

const THEMES = {
  light:{paper:'#F4F1EA',ink:'#2E2D2A',ink2:'#5F5C56',ink3:'#857F74',rule:'#DFDACF'},
  dark :{paper:'#201F1C',ink:'#F2EFE8',ink2:'#B8B3A8',ink3:'#8E887C',rule:'#3A3833'}
};
const SERIF = 'DM Serif Display, Georgia, serif';
const SANS  = 'Poppins, Segoe UI, sans-serif';
const f = n => Math.round(n * 100) / 100;
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

/* headline() output is 1-3 band adjectives joined by ", ".
   One chunk per line — deterministic, needs no text measurement. */
const HEAD = { 1:[54,64], 2:[48,57], 3:[40,47] };

export function cardSVG(quiz, values, { headline, subline, theme = 'light' }) {
  const T = THEMES[theme];
  const P = [];

  /* --- background ------------------------------------------------ */
  P.push(`<rect width="1200" height="630" fill="${T.paper}"/>`);
  P.push(`<rect width="1200" height="630" fill="url(#wash)" mask="url(#fade)"/>`);
  P.push(`<rect width="1200" height="630" filter="url(#grain)" opacity=".035"/>`);

  /* --- spine rail: six blocks, opacity = conviction --------------- */
  values.forEach((s, i) => {
    const o = 0.28 + 0.62 * Math.abs(s - 50) / 50;
    P.push(`<rect x="0" y="${i * 105}" width="10" height="105"
             fill="${AXIS_COLOUR[i]}" fill-opacity="${f(o)}"/>`);
  });

  /* --- masthead --------------------------------------------------- */
  P.push(`<text x="66" y="78" font-family="${SANS}" font-size="20" font-weight="600"
           letter-spacing="3.2" fill="${T.ink3}">WISER WALK</text>`);
  P.push(`<text x="66" y="112" font-family="${SERIF}" font-style="italic"
           font-size="28" fill="${T.ink2}">${esc(quiz.title)}</text>`);
  P.push(`<text x="1144" y="96" text-anchor="end" font-family="${SANS}" font-size="18"
           font-weight="500" fill="${T.ink3}">wiserwalk.com</text>`);
  P.push(`<path d="M66 134H1144" stroke="${T.rule}" stroke-width="1" shape-rendering="crispEdges"/>`);

  /* --- headline: split on its own commas, one per line ------------ */
  const chunks = headline.includes(', ') ? headline.split(', ') : [headline];
  const [size, lh] = HEAD[Math.min(chunks.length, 3)];
  const top = 152 + (148 - chunks.length * lh) / 2;
  chunks.forEach((c, i) => {
    const txt = i < chunks.length - 1 ? c + ',' : c;
    P.push(`<text x="66" y="${f(top + 0.76 * size + i * lh)}" font-family="${SERIF}"
             font-style="italic" font-size="${size}" fill="${T.ink}">${esc(txt)}</text>`);
  });

  /* --- subline: nearestLine() verbatim, hedges intact ------------- */
  const sub = subline.length > 98 ? subline.slice(0, 97).replace(/\s\S*$/, '') + '…' : subline;
  P.push(`<text x="66" y="336" font-family="${SANS}" font-size="20" font-weight="500"
           fill="${T.ink2}">${esc(sub)}</text>`);

  P.push(emblem(1026, 222, 86, values, T));
  P.push(`<path d="M66 356H1144" stroke="${T.rule}" stroke-width="1" shape-rendering="crispEdges"/>`);

  /* --- six bipolar bars, BOTH poles always named ------------------ */
  quiz.groups.forEach((g, i) => {
    const x0 = i < 3 ? 66 : 640, W = 504, tp = 376 + (i % 3) * 72;
    const c = AXIS_COLOUR[i], s = values[i], mid = x0 + W / 2;
    const kx = Math.max(x0 + 9, Math.min(x0 + W * s / 100, x0 + W - 9));

    P.push(`<text x="${x0}" y="${tp + 17}" font-family="${SANS}" font-size="18"
             font-weight="600" fill="${T.ink2}">${esc(g.name)}</text>`);
    P.push(`<text x="${x0 + W}" y="${tp + 17}" text-anchor="end" font-family="${SANS}"
             font-size="16" font-weight="500" fill="${T.ink2}">${esc(g.leanText)}</text>`);

    /* three opacities: tint track, wedge, solid knob */
    P.push(`<rect x="${x0}" y="${tp + 30}" width="${W}" height="12" rx="6"
             fill="${c}" fill-opacity=".16"/>`);
    const wx = Math.min(mid, kx), ww = Math.abs(kx - mid);
    if (ww > 1) P.push(`<rect x="${f(wx)}" y="${tp + 30}" width="${f(ww)}" height="12"
                         rx="${f(Math.min(6, ww / 2))}" fill="${c}" fill-opacity=".34"/>`);
    /* the centre tick is what makes the bar legibly BIPOLAR */
    P.push(`<line x1="${mid}" y1="${tp + 26}" x2="${mid}" y2="${tp + 50}"
             stroke="${T.ink}" stroke-opacity=".28" stroke-width="2"/>`);
    P.push(`<circle cx="${f(kx)}" cy="${tp + 36}" r="9" fill="${c}"
             stroke="${T.paper}" stroke-width="3.5"/>`);

    P.push(`<text x="${x0}" y="${tp + 60}" font-family="${SANS}" font-size="14"
             font-weight="500" fill="${T.ink2}">${esc(g.left)}</text>`);
    P.push(`<text x="${x0 + W}" y="${tp + 60}" text-anchor="end" font-family="${SANS}"
             font-size="14" font-weight="500" fill="${T.ink2}">${esc(g.right)}</text>`);
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
    <defs>
      <linearGradient id="wash" x1="0" y1="0" x2="1" y2=".8">
        <stop offset="0" stop-color="#7EBAEE" stop-opacity=".20"/>
        <stop offset="1" stop-color="#F0A06F" stop-opacity=".20"/>
      </linearGradient>
      <linearGradient id="ramp" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff"/><stop offset=".67" stop-color="#000"/>
      </linearGradient>
      <mask id="fade"><rect width="1200" height="630" fill="url(#ramp)"/></mask>
      <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9"
        numOctaves="1" seed="7"/><feColorMatrix type="saturate" values="0"/></filter>
    </defs>${P.join('')}</svg>`;
}

/* Six DIAMETERS, not six radii: 0 and 100 are both convictions, so each axis
   is a full line through the centre and the knob sits on the leaning side. */
function emblem(cx, cy, R, values, T) {
  const out = [
    `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${T.rule}" stroke-width="1.25"/>`,
    `<circle cx="${cx}" cy="${cy}" r="${R / 2}" fill="none" stroke="${T.rule}"
      stroke-width="1" stroke-dasharray="2 6"/>`
  ];
  const pts = [];
  values.forEach((v, i) => {
    const a = (-90 + i * 30) * Math.PI / 180;
    const ux = Math.cos(a), uy = Math.sin(a), t = (v - 50) / 50, c = AXIS_COLOUR[i];
    out.push(`<line x1="${f(cx - R * ux)}" y1="${f(cy - R * uy)}"
      x2="${f(cx + R * ux)}" y2="${f(cy + R * uy)}" stroke="${c}" stroke-opacity=".20"
      stroke-width="7" stroke-linecap="round"/>`);
    [1, -1].forEach(k =>                         /* a tick at BOTH ends */
      out.push(`<line x1="${f(cx + k * (R + 5) * ux)}" y1="${f(cy + k * (R + 5) * uy)}"
        x2="${f(cx + k * (R + 10) * ux)}" y2="${f(cy + k * (R + 10) * uy)}"
        stroke="${c}" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>`));
    pts.push({ x: cx + R * t * ux, y: cy + R * t * uy, t });
  });

  /* All-central results get NO shape — the audited "a midpoint is not a
     conviction" rule, enforced in geometry. Sorting by true angle is
     mandatory: a negative t flips a point 180deg and unsorted vertices
     self-intersect into a bowtie. */
  if (pts.every(p => Math.abs(p.t) >= 0.08)) {
    const d = pts.slice()
      .sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx))
      .map((p, i) => `${i ? 'L' : 'M'}${f(p.x)} ${f(p.y)}`).join('') + 'Z';
    out.push(`<path d="${d}" fill="url(#wash)" fill-opacity=".16" stroke="${T.ink}"
      stroke-opacity=".16" stroke-width="1.25" stroke-linejoin="round"/>`);
  }
  pts.forEach((p, i) => out.push(`<circle cx="${f(p.x)}" cy="${f(p.y)}" r="6.5"
    fill="${AXIS_COLOUR[i]}" stroke="${T.paper}" stroke-width="2.5"/>`));
  out.push(`<circle cx="${cx}" cy="${cy}" r="2.5" fill="${T.ink}" opacity=".35"/>`);
  return out.join('');
}
</script>


<!-- ============================================================
     The share block, server-rendered NEUTRAL (works with no JS).
     ============================================================ -->
<section class="afterword" data-state="unknown" id="afterword"
         data-quiz="theology-compass" data-code="…" data-url="…" data-tweet="…">
  <p class="ctx" hidden>Someone shared their result with you.</p>

  <h2 id="aw-head">Share it</h2>
  <p class="aw-sub" id="aw-sub">Post the card, or send the link — it opens exactly this page.</p>

  <figure class="card-frame">
    <!-- the same cardSVG() string, injected server-side -->
    <svg role="img" aria-label="Theology Compass result card. …" viewBox="0 0 1200 630">…</svg>
    <figcaption>This is the image people see when you post the link.</figcaption>
  </figure>
  <p class="micro">Nothing on this card is sent to us. It is drawn in your browser
     from the code in the address bar.</p>

  <div class="grp grp-share">
    <button class="btn" id="copy" type="button">Copy link</button>
    <button class="btn ghost" id="dl" type="button">Download card</button>
    <button class="btn ghost" id="native" type="button" hidden>Share…</button>
    <a class="btn ghost" id="tox" rel="noopener" target="_blank" href="#">Post to X</a>
  </div>
  <p class="sr-only" role="status" aria-live="polite" id="say"></p>

  <div class="grp grp-take">
    <a class="btn primary" id="take" href="/q/theology-compass/">Take it again</a>
  </div>

  <details class="as-text">
    <summary>Share as plain text instead</summary>
    <pre id="share">…shareTextFor()…</pre>
    <button class="btn ghost" id="copytext" type="button">Copy text</button>
  </details>
</section>

<script>
(() => {
  const sec = document.getElementById('afterword');
  const { quiz, code, url, tweet } = sec.dataset;
  const say = document.getElementById('say');

  /* ---- who is this? ------------------------------------------- */
  let mine = false;
  try {
    mine = localStorage.getItem('ww:mine:' + quiz) === code
        || sessionStorage.getItem('ww:just') === code;
  } catch {}
  if (location.hash === '#you') {
    mine = true;
    history.replaceState(null, '', location.pathname);   // don't let it be copied
  }
  if (!mine && document.referrer.startsWith(location.origin + '/q/' + quiz)) mine = true;
  /* default is VISITOR: shares fan out, and "take it yourself" is the growth action */

  sec.dataset.state = mine ? 'mine' : 'visitor';
  if (!mine) {
    sec.querySelector('.ctx').hidden = false;
    document.getElementById('aw-head').textContent = 'Where do you land?';
    document.getElementById('aw-sub').textContent =
      'Eighteen statements, about three minutes, scored in your browser.';
    const take = sec.querySelector('.grp-take');
    take.querySelector('#take').textContent = 'Take the Theology Compass — 3 minutes';
    document.getElementById('copy').textContent = 'Copy this link';
    /* MOVE the node — CSS `order` would desync tab order from visual order */
    sec.insertBefore(take, sec.querySelector('.card-frame'));
    /* a visitor has received nothing from us yet: do not ask for an address */
    document.getElementById('capture')?.remove();
  }

  document.getElementById('tox').href =
    'https://x.com/intent/post?text=' + encodeURIComponent(tweet) +
    '&url=' + encodeURIComponent(url);

  const flash = (btn, label, msg) => {
    const was = btn.textContent; btn.textContent = label; say.textContent = msg;
    setTimeout(() => { btn.textContent = was; }, 1600);
  };
  const copy = async (btn, text, msg) => {
    try { await navigator.clipboard.writeText(text); flash(btn, 'Copied', msg); }
    catch { flash(btn, 'Press Ctrl+C', 'Copy failed — select and press Control C'); }
  };
  document.getElementById('copy').onclick = e => copy(e.target, url, 'Link copied');
  document.getElementById('copytext').onclick = e =>
    copy(e.target, document.getElementById('share').textContent, 'Share text copied');

  /* server PNG is the primary path: identical to what platforms render */
  const png = () => fetch(`/og/${quiz}/${code}.png`).then(r => r.ok ? r.blob() : Promise.reject());
  document.getElementById('dl').onclick = async e => {
    try {
      const b = await png(), a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = `${quiz}.png`; a.click();
      URL.revokeObjectURL(a.href); flash(e.target, 'Saved', 'Card downloaded');
    } catch { /* fall back to canvas rasterisation of the DOM SVG */ }
  };
  if (navigator.canShare?.({ files: [new File([], 'x.png', { type: 'image/png' })] })) {
    const n = document.getElementById('native'); n.hidden = false;
    document.getElementById('copy').classList.add('ghost');
    n.onclick = async () => {
      const b = await png();
      navigator.share({ url, text: tweet,
        files: [new File([b], `${quiz}.png`, { type: 'image/png' })] }).catch(() => {});
    };
  }
})();
</script>


<!-- ============================================================
     Email capture. NOTE what is absent: no code, no quiz, no scores.
     That absence is the offer's credibility — it is checkable.
     ============================================================ -->
<section class="capture" id="capture">
  <h2>Want to hear when there's more?</h2>
  <p>New quizzes and articles land every few weeks — sometimes nothing for a month.
     If you want a note when they do, leave an address. You will also get the fairness
     review for each one: what a reader said was unfair, and what changed because of it.
     New quizzes go out to this list before they are linked anywhere.</p>

  <p class="trust"><strong>Your result is not part of this.</strong> This form sends your
     email address and nothing else — not your scores, not your code, not which quiz you
     took. We could not email you your result if we wanted to, because we never receive it.</p>

  <form action="/api/subscribe" method="post" id="subf" novalidate>
    <input type="hidden" name="source" value="result">   <!-- coarse enum, never a path -->
    <input type="hidden" name="t" value="…Date.now()…">
    <div class="hp" aria-hidden="true">
      <label for="website">Website</label>
      <input id="website" name="hp" type="text" tabindex="-1" autocomplete="off">
    </div>

    <label for="em">Email address</label>
    <input id="em" name="email" type="email" required autocomplete="email"
           inputmode="email" spellcheck="false" aria-describedby="consent em-err"
           placeholder="you@example.com">
    <p id="em-err" class="err" hidden></p>

    <p id="consent" class="consent">Pressing this asks us to email you when a new quiz or
       article is published, and nothing else. You will get a confirmation link first;
       your address is not on the list until you click it.</p>

    <button class="btn primary" type="submit">Send me new quizzes</button>
  </form>

  <p class="fine">One address, held by our email provider. Unsubscribe link in every email.
     No open tracking, no click tracking, no pixels, no sharing or selling the list, ever.
     Reply &ldquo;delete&rdquo; and it is gone within 7 days.
     <a href="/privacy/">Exactly what is stored &rarr;</a></p>
</section>

<style>
  /* the preview is a MAT, not a panel: in dark theme it reads as a photograph
     of the image rather than a component that failed to theme */
  .card-frame{margin:0;padding:10px;background:#F4F1EA;border-radius:18px;
    box-shadow:3px 3px 5px rgba(68,68,68,.065),0 0 0 1px var(--rule)}
  .card-frame svg{display:block;width:100%;height:auto;border-radius:12px}
  .card-frame figcaption{font-family:var(--sans);font-size:.82rem;color:#857F74;
    padding:.5rem .25rem 0}
  .grp{display:flex;gap:.6rem;flex-wrap:wrap;margin:1rem 0}
  .btn{min-height:44px;padding:0 1.1rem;border-radius:15px;border:0;cursor:pointer;
    font-family:var(--sans);font-size:.95rem;font-weight:500;
    background:var(--raise);color:var(--ink);
    box-shadow:3px 3px 5px rgba(68,68,68,.065),0 0 0 1px var(--rule);
    display:inline-flex;align-items:center;text-decoration:none}
  .btn.primary{background:var(--accent);color:var(--accent-ink);box-shadow:none}
  .btn:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
  .capture{margin-top:3rem;padding:1.6rem;border-radius:22px;background:var(--raise);
    box-shadow:3px 3px 5px rgba(68,68,68,.065)}
  .trust{background:var(--accent-soft);border-radius:15px;padding:.9rem 1.1rem;
    font-family:var(--sans);font-size:.9rem}
  .capture input[type=email]{width:100%;max-width:22rem;min-height:44px;
    padding:0 .9rem;border-radius:15px;border:1px solid var(--rule);
    background:var(--paper);color:var(--ink);font-size:1rem}
  .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
  .sr-only{position:absolute;width:1px;height:1px;clip-path:inset(50%);overflow:hidden}
  .ctx{font-family:var(--sans);font-size:.9rem;color:var(--ink-2);
    background:var(--accent-soft);border-radius:15px;padding:.7rem 1rem;display:inline-block}
  @media (max-width:560px){ .grp .btn{flex:1 1 auto;justify-content:center} }
</style>
]]>
```

## Pitfalls

- EMBLEM SELF-INTERSECTION. The conviction polygon's vertices must be sorted by their true angle atan2(y-cy, x-cx) before being joined. Joining them in axis order looks correct in testing only because most test data leans the same way; the first result with a negative t flips that point 180 degrees and the polygon crosses itself into a bowtie. Also: skip the polygon entirely when any |t| < 0.08, both because a vertex at the centre pinches the shape into a spike and because the audit says an all-central result names no position.
- SHIPPING A CARD THAT NAMES ONE POLE. This is the failure being fixed, and it returns in three disguises: dropping the right-hand pole label when a name feels long; labelling only the leaning side because 'that's the interesting one'; letting the emblem carry axis names on one rim. All six bars render BOTH pole names, always, unconditionally. The emblem carries no text at all — an unlabelled emblem beside six labelled bars misleads nobody; a half-labelled wheel does.
- OMITTING THE CENTRE TICK. It looks like a stray 2px line and is the first thing an implementer 'cleans up'. Without it the track reads as a progress bar filling from the left, 50 stops meaning anything, and every axis silently becomes unipolar. It is the most load-bearing two pixels on the card.
- FLATTENING THE THREE OPACITIES. Track .16, wedge .34, knob 1.0 are not decorative gradations. Raise the track past about .25 and six saturated stripes fight each other; drop the wedge and lean stops being readable at a glance; tint the knob and the eye has nothing to land on. #C98A12 and #E2582B are the two that will tempt you to 'fix the contrast' — do not; fix it with the paper-coloured ring on the knob instead. Never use an axis colour for text.
- RE-IMPLEMENTING THE SCORING COPY. The card must call headline(), lean() and nearestLine() from src/lib/strategies/bipolar.ts, not reproduce them. Every threshold in those functions came out of the audit (10-unit tie, 45-unit hedge, 10-unit centre, middle-band exclusion, the '(approximate)' suffix). A card saying 'Reformed Baptist 91%' while the page two screens above says 'Nearest on the map: Reformed Baptist (approximate)' is exactly the inconsistency this audience screenshots.
- RESVG FONT LOADING. Resvg wants TTF/OTF and will not read WOFF2. It also silently falls back to a system face rather than erroring, so a misconfigured build produces a card that renders — just in the wrong typeface, which nobody notices until it is in a thousand feeds. Set loadSystemFonts:false so local dev cannot mask the problem, and remember Vercel needs the font files in includeFiles or they vanish from the deployed function.
- EXTERNAL RESOURCES IN THE SVG. An <image href> pointing at the paint-pour or floral PNG stencils breaks both consumers: it taints the canvas in the client fallback path, and resvg will not fetch it at all. Texture must be feTurbulence and gradients only. If the grain filter proves slow, delete the rect — do not swap it for a bitmap.
- REORDERING WITH CSS `order`. Swapping the visitor CTA above the preview with order:-1 moves it visually while leaving it last in the tab sequence, so a keyboard user tabs through a share block they cannot use before reaching the button the page is shouting about. Move the node.
- DEFAULTING THE UNKNOWN STATE TO 'MINE'. Storage is routinely empty — private windows, in-app browsers, a different device. Defaulting to 'mine' shows 'Share your result' to someone looking at a stranger's page, which is confusing at best and slightly creepy at worst, and it wastes the highest-value CTA slot on the growth channel's entire audience.
- PUTTING THE RESULT CODE ANYWHERE NEAR THE EMAIL FORM. A hidden code field, a quiz field, an 'email me my result' checkbox, or — the easy one to miss — logging Referer on /api/subscribe, which on a result page contains the code. Any one of them makes the trust panel a lie, and the trust panel is the only reason the form converts with this audience. Send a coarse source enum instead, never the path.
- SHIPPING 'NO OPEN TRACKING' AS COPY ONLY. Open and click tracking are on by default in most ESPs. That sentence is a build requirement — disable both in the provider, then verify by sending yourself an email and reading the raw HTML for a 1x1 image.
- EMBEDDING THE ESP'S JAVASCRIPT WIDGET. It is the fastest way to build the form, and it imports third-party tracking onto a page that promises none, plus it puts an API key in the client. Post to your own /api/subscribe and make the provider call server-side.
- PLACING THE CAPTURE ABOVE THE SHARE BLOCK. It will convert slightly better and cost more than it earns: shares are the growth channel, capture is downstream of a visitor you already have. The same principle kills the modal, the exit-intent popup, and the 'get your result by email' interstitial.
- CHANGING /about AND /method WITHOUT THE DATED CHANGELOG LINE. For an audience selected for discernment, a quietly edited promise is worse than the change itself — and the old text is in the Wayback Machine and in site/dist/. The changelog entry costs one sentence and is the cheapest trust purchase in the build.
- OVERLOOKING THAT THE SERVER ALREADY SEES THE RESULT CODE. src/pages/r/[quiz]/[code].astro is prerender = false, so every result view puts the encoded scores in a request path the host logs, and the OG route makes X and Facebook fetch by code too. The existing 'nothing is stored on our side' is defensible but narrower than it reads. Ship the section 3.7 disclosure, turn off log drains, and add no analytics to /r/ or /og/.
- A DARK og:image. If the card's palette follows the page theme, the OG render inherits whatever the server decides, and the same link previews light for one person and dark for another. og:image is permanently light; the dark variant is preview-and-download only.
- REPO/BRIEF PALETTE MISMATCH. site/src/styles/site.css currently ships a green-and-cream theme, not the #7EBAEE/#F0A06F, DM Serif Display, Poppins system this spec is written against. Reconcile before building, or the on-page block and the card will look like they came from two different sites.

---

## CRITIQUE

### Logical incoherence found

- why_it_works says the card 'carries exactly two things that survive that scale — the serif headline and the emblem's silhouette.' Section 1.2 then says the spine rail 'is the card's fingerprint and the only element that reads at any size.' Both cannot be true, and the spine rail is a 10px sliver of a 1200px card — about 4px at feed scale.
- Polygon suppression stated as 'every axis within 8%' in the rationale and implemented as 'any axis within 8%' in the code (see worst_problems).
- The suppression threshold 0.08 contradicts the audited centre band of 10 units (0.20) used by nearestState() and headline(), on a card whose whole argument is that it never invents a threshold.
- A bipolar card chassis applied to unipolar data is the same class of error as labelling one pole of two: for the seven-deadly-sins quiz it would draw a centre tick at 50 and a wedge measured from the centre, asserting that 'pride 50' is a neutral midpoint between two opposed positions. It is not — for a category, 0 means 'absent', and the conviction-opacity formula |v-50|/50 would render a person with almost no envy as strongly convicted about envy.
- AXIS_COLOUR is a module-level constant in card.js while QuizGroup has no `colour` field, so a second quiz silently inherits the Compass's six hues — the emblem's 'this is yours' claim collapses into 'this is every quiz on the site'.
- The card refuses to show a match percentage because a lone number over-claims, yet the spine rail encodes conviction strength as opacity across six blocks — an unlabelled quantitative claim with no key at all. Defensible, but the reasoning is not applied evenly and should be stated as ornament, not data.

### Worst problems

- THE CARD IS A COMPASS CARD WEARING A GENERIC ROUTE'S CLOTHES. The route is /og/[quiz]/[code].png and cardSVG() takes `quiz` as an argument, but every number inside is hard-wired to six bipolar axes: spine blocks of `i*105` (630/6), emblem angles `-90 + i*30`, columns `i < 3 ? 66 : 640`, rows `376 + (i%3)*72`. The repo already ships a second live quiz. site/src/lib/quizzes/seven-deadly-sins.ts has SEVEN unipolar groups with no `left`/`right`, and its own header comment states it exists to run 'through the same routes, codec, result page and share card with no engine changes.' Run this spec on it and you get: a spine rail 735px tall on a 630px canvas, an emblem with a 7th diameter drawn at 60 degrees on top of the 3rd, row i=6 painted directly over row i=3, and — worst — the pole labels rendering the literal string 'undefined' at both ends of every bar, because `g.left` does not exist. A share card that says 'undefined' is the screenshot. This also violates CLAUDE.md verbatim: 'Result pages, share cards, and OG images must be generic, parameterised by quiz. Do not hard-code six axes anywhere outside the Compass's own data and renderer.'
- IT REIMPLEMENTS THE COPY IT SWEARS IT WON'T. Pitfall 5 says the card must call headline(), lean() and nearestLine() rather than reproduce them — then the markup sketch reads `g.leanText`, a property that exists on no object in site/src/lib/engine/types.ts. quiz.groups have key/slug/name/emoji/left/right/bands/summary/history/passages/readMore. `lean` lives on Bar, produced by resultFor(). As written the lean column renders 'undefined' six times. The signature is wrong at the root: cardSVG() should be handed the QuizResult, not `values` plus loose strings.
- THE EMBLEM'S SUPPRESSION RULE IS BOTH SELF-CONTRADICTORY AND MISCALIBRATED. why_it_works says the polygon is suppressed 'when every axis is within 8% of centre'. The spec and the code suppress when ANY axis is within 8% (`pts.every(p => Math.abs(p.t) >= 0.08)`). Those are opposite rules. The code's version is the damaging one: one central axis out of six — extremely common — kills the shape, so the 'silhouette that is different for every person and therefore feels like theirs', named as one of only two things that survive feed scale, is absent from a large share of real results. And 0.08 is a number invented on the spot: the audited centre band is quiz.config.centerUnits = 10 units, i.e. t = 0.20. Inventing a threshold is precisely the sin pitfall 5 warns against.
- THE EMBLEM IS TOO SMALL — THE EXACT FAILURE BEING FIXED, IN MINIATURE. R=86 is a 172px disc, 14% of a 1200px card. At the one-third feed scale the spec itself uses as the design constraint, that is a 57px smudge with 4px knobs and 0.7px rim ticks. The spec claims it is one of two things that survive that scale; it does not. Meanwhile 224px of vertical space in the right column sits empty.
- THE SUBLINE'S OVERFLOW HANDLING TRUNCATES A TRADITION NAME. 'If still over, hard-truncate at the last space and append an ellipsis.' The longest sublines are exactly the ones that end in names: 'No listed tradition is a close fit. Nearest, loosely: Continental Reformed, Confessional Lutheran' is ~100 characters and will be cut. A card reading 'Nearest, loosely: Continental Reformed, Confessional…' in front of a discernment audience is a fairness bug dressed as a layout bug.
- THE HEADLINE SIZE TABLE OVERFLOWS ON THE SINGLE-CHUNK CASE. Widths were checked at 40px and 48px only. A one-chunk headline renders at 54px, and a single band adjective can be long — 33 characters at 54px is roughly 840px against a 774–874px column with an emblem in it. The fix is shrink-to-fit with a floor, not a table.
- NO-FLICKER WAS NEVER SOLVED. The section is server-rendered in the 'unknown' state with the capture present and share-first, then JS deletes the email form and moves the take-group above the figure. Every share recipient — the entire growth channel — watches the page reflow after paint. That is a visible jump and real CLS on first impression.
- navigator.share() IS CALLED AFTER AN await. `const b = await png(); navigator.share({files:[…]})` loses transient user activation on iOS Safari and throws NotAllowedError, which the code then swallows with `.catch(() => {})` — a button that does nothing, silently, on the platform where native share matters most.
- THE ON-PAGE PREVIEW IS DEAD WEIGHT ON MOBILE. At 380px the card is 380x200; 14px pole labels become 4.4px. The spec calls this 'decorative — acceptable'. A 200px illegible grey rectangle with a caption is exactly the 'boring and flat' verdict, and it is the block asked to carry the honesty argument.
- CONTRAST. ink-3 #857F74 on #F4F1EA is about 3.5:1. It is used for 'wiserwalk.com' at 18px/500 (needs 4.5:1 — fails) and hard-coded as `color:#857F74` on a 0.82rem figcaption in the DOM (fails, and hard-codes a light-theme hex into a themed stylesheet).
- PALETTE MISMATCH IS DEMOTED TO PITFALL 17. site/src/styles/site.css ships --accent #2f5d4b, --radius 4px, Iowan Old Style. The spec's CSS hard-codes 15–22px radii and #F4F1EA against those tokens. As written the share block will look pasted in from a different website. This is a blocking prerequisite, not a footnote.
- `Cache-Control: immutable, max-age=31536000` ON /og/. The bytes are not immutable — they change the first time a band adjective, a pole name, or the card design changes, and Facebook/X will keep serving the old render for a year. Version the path (/og/v1/...) or drop to max-age=86400, stale-while-revalidate.

### What must survive

- cardSVG() as ONE string function feeding preview, download and og:image. That is the right architecture and it is the reason the card can never drift from the page.
- Both pole names on every bipolar bar, unconditionally, plus the centre tick — and the pitfall entry that names the three disguises in which the one-pole failure returns. This is the fix the last attempt needed.
- The three-opacity system: track .16, wedge .34, knob 1.0 with a paper-coloured ring. It is the restrained tactile language, it is what people liked, and the instruction to fix knob contrast with the ring rather than by desaturating is exactly right.
- A text-free emblem sitting beside fully labelled bars. The reasoning is sound: an unlabelled shape misleads nobody, a half-labelled wheel does.
- Diameters rather than radii for bipolar axes, knob at R*(score-50)/50, and rim ticks at BOTH ends of every axis. Six lines 30 degrees apart do tile the circle evenly, so the geometry is correct as well as honest.
- Sorting polygon vertices by atan2 before joining them, and the pitfall note explaining that unsorted vertices only look right because test data leans one way.
- The headline broken on its own commas, one band adjective per line, as a stanza — deterministic, no text measurement, and it looks composed.
- og:image permanently light; dark only for preview and download. Correct, and the reasoning about server-side render is right.
- Fixed light palette on the card rather than the page's theme tokens.
- No match percentage on the card, hedges preserved verbatim from nearestLine(), '(approximate)' suffix intact.
- Never inlining the paint-pour PNGs — feTurbulence and gradients only, because an <image href> breaks both resvg and the canvas fallback.
- resvg needs TTF not WOFF2, and loadSystemFonts:false so local dev cannot mask a missing face. This is the kind of detail that otherwise ships wrong to a thousand feeds.
- The whole email-capture argument. A form that structurally cannot transmit the result, made checkable in devtools in ten seconds; 'The Working' as an offer only this site can send; no ESP JavaScript, server-side POST, coarse source enum, never logging Referer; double opt-in with the consent sentence above the button; 'no open tracking' flagged as a build requirement rather than copy.
- Capture last, after share and after the onward articles; no modal, no exit-intent, no interstitial; removed entirely for visitors.
- The section 3.7 host-logs disclosure and the dated changelog on /about and /method. Quietly editing a promise in front of this audience is worse than the change itself.
- Moving nodes rather than CSS `order` so tab order follows the eye, and defaulting the unknown state to visitor.
- Copy feedback written to a visually-hidden aria-live status as well as the button label.

### Rewritten spec

REWRITE OF THE WEAKEST THIRD: the card body — signature, genericity, emblem (§1.5), bars (§1.6), and the verdict block's fit rules. Everything else in the spec stands.

=== A. SIGNATURE AND DATA CONTRACT (replaces the cardSVG() signature) ===

cardSVG(quiz, result, { subline, theme = 'light' })

`result` is exactly what resultFor(quiz, values) already returns: { headline, summary, bars, ranked }. `subline` is nearestLine(quiz, values, nearest(quiz, values)) for bipolar quizzes, or result.summary's first sentence for category quizzes. The card reads bar.label, bar.value, bar.lean, bar.left, bar.right and NOTHING ELSE. It never calls band(), lean(), pull() or headline() itself and never touches quiz.items. One consequence, enforced by a unit test: the strings on the card are byte-identical to the strings on the page, because they are the same objects.

Two engine changes, both one line:
1. types.ts QuizGroup gains `colour?: string` (a hex). site/src/data/compass.json carries the six audited hues via build-data.mjs; seven-deadly-sins.ts carries its own. card.js keeps only a neutral fallback ramp for a quiz that ships no colours: ['#5B6472','#6E6A62','#7A7268','#67707A','#736C7E','#6A7568','#7C6F6B','#6B7773','#77706A'] — deliberately desaturated, so an un-themed quiz looks unfinished rather than looking like the Compass.
2. types.ts Bar gains nothing. Presence of both bar.left and bar.right is the ONLY signal used to decide bipolar vs unipolar rendering. Never branch on quiz.slug or strategy.id.

=== B. LAYOUT ENGINE (replaces the hard-coded 6) ===

const n = result.bars.length;            // 4..9 supported
const POLAR = result.bars.every(b => b.left && b.right);   // all-or-nothing
if (n < 4 || n > 9) return textOnlyCard(quiz, result, subline);   // masthead + verdict + spine only

Columns:
  n <= 8 -> cols = 2, rowsPerCol = ceil(n/2), colW = 504, colX = [66, 640]
  n == 9 -> cols = 3, rowsPerCol = 3,          colW = 316, colX = [66, 447, 828]
Bar band runs y 382..580 (crop-safe: 10px above the 590 line).
  pitch = POLAR ? floor(198 / rowsPerCol) : floor(178 / rowsPerCol), clamped to [54, 68]
  rowTop(i) = 382 + (i % rowsPerCol) * pitch ; column index = floor(i / rowsPerCol)
Fill columns top-to-bottom, then across — grouping stays column-major so a reader scanning one column reads consecutive axes.

Spine rail, seam-free and n-agnostic:
  y_i = Math.round(i * 630 / n) ; h_i = Math.round((i+1) * 630 / n) - y_i
  strength = POLAR ? Math.abs(v - 50) / 50 : v / 100      // for a category, 0 is absence, not conviction
  fill-opacity = 0.28 + 0.62 * strength
Demote the spine rail's claim in the rationale: it is a coloured edge, not a legible fingerprint. Delete the sentence 'the only element that reads at any size.'

=== C. VERDICT BLOCK: fit by shrinking, never by truncating ===

Text column is x 66, width 774 (66 -> 840). The masthead hairline is shortened to `M 66 134 H 820` so it does not run under the emblem, and `wiserwalk.com` moves to right-aligned at x=820, baseline y=78, on the same line as WISER WALK.

Headline: chunks = result.headline.split(', ').slice(0, 3)  — the .slice is a guard; headline() already caps at 3, but a band adjective containing a comma must never push a 4th line into the subline.
  const EM = 0.50;   // conservative mean advance for DM Serif Display Italic, lowercase Latin
  const longest = Math.max(...chunks.map(c => c.length + 1));   // +1 for the appended comma
  size = the largest of [54, 48, 42, 38, 34] with longest * EM * size <= 774;  floor 34.
  lh = Math.round(size * 1.18)
  blockH = chunks.length * lh ; top = 150 + (156 - blockH) / 2 ; baseline_i = top + 0.76*size + i*lh
  At the 34px floor a 33-character chunk is ~561px, so overflow is arithmetically impossible. Shrinking is the only permitted response — never drop a chunk, because the card's headline must equal the page's h1 exactly.

Subline: DELETE the ellipsis rule. Break deterministically instead, at the first ': ' if one exists:
  head = text up to and including the colon ; tail = the rest
  no colon (only the 'central' hedge, 55 chars) -> one line, 20px, baseline y=336
  colon -> two lines: head at 18px/500 ink-2 baseline y=328 ; tail at 20px/500 ink baseline y=356
This is better than a single squeezed line: the hedge reads as a label and the tradition names read as the answer, and no name can ever be cut. Longest tail is ~44 chars at 20px ~ 460px, comfortably inside 774. If a future tail exceeds 774px, shrink the tail to 18px then 16px; still never truncate.

=== D. THE EMBLEM (replaces §1.5 entirely) ===

Centre (992, 226). R = 120. Bounds with rim ticks: x 862..1122, y 96..356 — clear of the 1144 right edge, clear of the 366 rule, and 40% larger in linear terms than the rejected R=86 (roughly double the area). At one-third feed scale it is an 80px disc with 6px knobs: a shape, not a smudge.

Angles:
  POLAR:   n diameters. theta_i = -90 + i * (180 / n).  P_i = C + R * u_i * t_i, t_i = (v-50)/50 in [-1,1].
  UNIPOLAR: n radii.     theta_i = -90 + i * (360 / n).  P_i = C + R * u_i * (v/100), clamped to [0.06, 1].
Radii, not diameters, for categories: 0 means the trait is absent, and drawing it as a pole opposite would assert a conviction the instrument never measured.

Draw order:
 1. Outer ring: circle r=120, fill none, stroke rule, 1.5.
 2. Centre reference: POLAR -> circle r=60, stroke rule 1, dasharray "2 6". UNIPOLAR -> the same circle marks the 50 line.
 3. Tracks: POLAR -> line from C-R*u to C+R*u. UNIPOLAR -> line from C to C+R*u. stroke = colour_i, stroke-opacity .20, stroke-width 9, round cap.
 4. Rim ticks: POLAR -> at theta and theta+180, R+6 to R+13. UNIPOLAR -> at theta only. stroke colour_i, opacity .45, width 2.5, round cap. Both ends coloured for bipolar axes: bipolarity stated geometrically, in the absence of any text.
 5. Conviction polygon — CORRECTED RULE. Compute `flat` exactly as the strategy does:
      POLAR:    flat = result.bars.every(b => Math.abs(b.value - 50) <= quiz.config.centerUnits)
      UNIPOLAR: flat = result.bars.every(b => Math.abs(b.value - 50) <= quiz.config.centerUnits)
    Draw the polygon whenever !flat. Suppress it only when flat — which is the audited 'a midpoint names no position' rule, using the audited number (centerUnits, currently 10) rather than an invented 0.08. Delete the any-axis-within-8% test: it was silently deleting the shape from most real results.
    To stop a near-centre vertex pinching the outline into a spike, clamp each vertex's radius to a minimum of 0.14*R along its own axis, keeping the sign of t (sign 0 -> +1). The shape then always has area, and the knobs — which are NOT clamped — still sit at the truthful position, so nothing is misreported.
    Vertices sorted by atan2(P.y-cy, P.x-cx) before joining. Keep this; keep the pitfall note.
    Fill url(#wash) at .16, stroke ink at .16, width 1.5, linejoin round.
 6. Knobs: circle r=9 at the TRUE P_i (unclamped), fill colour_i, stroke paper, width 3.
 7. Centre dot: r=3, fill ink, opacity .35.

=== E. THE BARS (replaces §1.6) ===

Per row, x0 = colX[col], W = colW, top = rowTop(i), c = colour_i, v = bar.value:
  knob x  kx = clamp(x0 + 10, x0 + W * v / 100, x0 + W - 10)
  label   (x0, top+18)              Poppins 600 18px ink-2   bar.label   [15px when colW === 316]
  lean    (x0+W, top+18) end        Poppins 500 16px ink-2   bar.lean    verbatim
  track   rect x0, top+32, W, 14, rx 7            fill c, fill-opacity .16
  BIPOLAR ONLY —
  tick    line x = x0 + W/2, y top+27 -> top+53    stroke ink, opacity .28, width 2
  wedge   rect between x0+W/2 and kx, top+32, h 14, rx min(7, w/2)   fill c, fill-opacity .34
  poles   (x0, top+64) start and (x0+W, top+64) end, Poppins 500 15px ink-2, bar.left / bar.right
  UNIPOLAR ONLY —
  fill    rect x0, top+32, width (kx - x0), h 14, rx 7            fill c, fill-opacity .34
  no centre tick, no pole row. A category bar is a magnitude from zero and must not borrow the
  midpoint grammar of an axis.
  knob    circle r=10 at (kx, top+39), fill c solid, stroke paper, width 3.5

Pole-label collision guard, deterministic, no measurement: if (bar.left.length + bar.right.length) * 0.55 * 15 > W - 24, step the pole row to 14px, then 13px. Below 13px, and only then, truncate the LEFT label at a word boundary with an ellipsis — the right label is the one a reader checks last and must survive. At colW 504 the longest current pair ('Bible & tradition' + 'Scripture alone', 32 chars) is ~264px and never triggers this.

Assert in the row renderer: if (bar.left && !bar.right) || (!bar.left && bar.right) throw. A half-poled bar is the exact failure this card exists to prevent and must be a build error, not a rendering decision.

=== F. TWO FIXES THIS REWRITE FORCES ELSEWHERE ===

1. The on-page preview stops being a 200px smudge. Below 560px CSS width, replace the 1200x630 preview with the same SVG rendered through `preserveAspectRatio="xMinYMin slice"` inside a 380x230 window showing only x 0..760 (masthead, headline, subline, emblem edge) — the half that is legible — plus a full-width button 'See the whole card' that opens the PNG in a new tab. The figcaption changes to 'The top half of the image people see when you post the link.' Honest, and it removes the unreadable grid.
2. No-flicker state. In Base.astro's head, an inline blocking script sets document.documentElement.dataset.ww to 'mine' or 'visitor' using the same precedence list. CSS does `[data-ww="visitor"] #capture { display: none }` — display:none removes the form from the tab order too, so the objection that killed CSS `order` does not apply here. The take-group node move still happens in the section's own script, but it now runs before the section paints, so nothing jumps.


---


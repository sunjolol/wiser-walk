# The self-hosted fonts (site/public/fonts/)

**Since 2026-09-23 Philosopher's eight files are the builds Google sends to iPhones, named
`philosopher-*-unhinted.woff2`.** Google answers a Windows user agent with hinted files carrying
TrueType font programs (fpgm, prep, cvt); an iPhone was seen refusing those, so every headline fell
back to Gill Sans while Inter and Poppins loaded. For the display face, run the recipe below with an
iPhone Safari user agent (e.g. `Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X)
AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1`), keep the
`-unhinted` names, and raise the `?v=` number on `/fonts/fonts.css` in `Base.astro` and the two game
pages whenever a file name changes (the stylesheet caches for a week). Inter and Poppins are still the
Windows builds and load everywhere; they were left alone.

**Since 2026-09-22 the headline face is Philosopher (400, 700, both italics) in place of DM Serif
Display; Inter and Poppins are unchanged** (the owner tried PT Sans for them the same day and kept
these). fonts.css also declares 'Wiser Display': Philosopher Bold under its own name at weights
400 and 700, because every headline rule says font-weight: 400. To regenerate, use the URL
`family=Inter:wght@400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@500;600;700`
in the recipe below, then add the 'Wiser Display' blocks back by hand (copies of the four
Philosopher 700 blocks, renamed, at weights 400 and 700). The paragraph that follows describes
the fonts before that date.

Since 2026-09-21 the site serves DM Serif Display (regular, italic), Inter (400, 500, 600, 700) and
Poppins (500, 600, 700) from `/fonts/` instead of from Google Fonts: the same OFL-licensed woff2 files
Google serves, Latin and Latin Extended subsets, with the three licences beside them. `Base.astro`
links `/fonts/fonts.css` and preloads the two faces every first paint needs; the two game pages swap
their generated Google link for the same stylesheet. `vercel.json` caches `/fonts/` for a week.

Google's build-time tools (`design/og/card.html`, `design/itch/cover.html`) still load Google Fonts:
they run in headless Chrome on this machine and never on the site.

## Regenerating (only if a family or weight is added)

Run from `site/`. It fetches Google's CSS with a desktop Chrome user agent (so it answers with woff2),
keeps the `latin` and `latin-ext` blocks, downloads each file, and rewrites `fonts.css`.

```python
import re, urllib.request, os
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
url = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Philosopher:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:wght@500;600;700&display=swap'
css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA})).read().decode()
out = []
for subset, body in re.findall(r'/\* (\w[\w-]*) \*/\s*@font-face\s*{(.*?)}', css, re.S):
    if subset not in ('latin', 'latin-ext'): continue
    fam = re.search(r"font-family:\s*'([^']+)'", body).group(1)
    style = re.search(r'font-style:\s*(\w+)', body).group(1)
    weight = re.search(r'font-weight:\s*(\d+)', body).group(1)
    src = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)', body).group(1)
    ur = re.search(r'unicode-range:\s*([^;]+);', body).group(1).strip()
    fname = f"{fam.lower().replace(' ', '-')}-{weight}{'-italic' if style == 'italic' else ''}-{subset}.woff2"
    open(os.path.join('public/fonts', fname), 'wb').write(urllib.request.urlopen(urllib.request.Request(src, headers={'User-Agent': UA})).read())
    out.append(f"@font-face {{\n  font-family: '{fam}';\n  font-style: {style};\n  font-weight: {weight};\n  font-display: swap;\n  src: url(/fonts/{fname}) format('woff2');\n  unicode-range: {ur};\n}}")
open('public/fonts/fonts.css', 'w', encoding='utf8').write('\n\n'.join(out) + '\n')
```

Then put the header comment back at the top of `fonts.css`, and if a family is new, add its
`OFL.txt` from https://github.com/google/fonts/tree/main/ofl/ beside the files.

"""
The "Wiser Walk" wordmark as an SVG, drawn from the owner's Amatry font.

The site never serves Amatry itself: the font is SelarasWP's ("All rights reserved"), and a
logo drawn from it is not the same thing as putting the font file on a public web server.
So the two words are shaped with HarfBuzz (the font's own kerning, exactly as a browser would
set them) and written out as outlines. The result is one small SVG whose paths fill with
currentColor, so the header's CSS decides its colour in light and dark.

    python design/tools/wordmark.py            writes site/public/img/wordmark.svg

Re-run it only if the words or the font change. The output is committed; nothing at build
time needs Python.
"""
import sys
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

HERE = Path(__file__).resolve().parent
FONT = HERE.parent / 'fonts' / 'Amatry.ttf'
OUT = HERE.parent.parent / 'site' / 'public' / 'img' / 'wordmark.svg'
TEXT = 'Wiser Walk'

blob = hb.Blob.from_file_path(str(FONT))
face = hb.Face(blob)
font = hb.Font(face)
upem = face.upem
buf = hb.Buffer()
buf.add_str(TEXT)
buf.guess_segment_properties()
hb.shape(font, buf, {'kern': True, 'liga': True})

tt = TTFont(str(FONT))
glyphs = tt.getGlyphSet()
order = tt.getGlyphOrder()

pen = SVGPathPen(glyphs)
x = 0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    # font units, y up; flip to SVG's y down around the baseline
    tpen = TransformPen(pen, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset))
    glyphs[name].draw(tpen)
    x += pos.x_advance

path = pen.getCommands()

# The ink box, so the SVG is cropped to the letters and scales from its real edges.
from fontTools.pens.boundsPen import BoundsPen
bp = BoundsPen(glyphs)
x = 0
for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
    name = order[info.codepoint]
    glyphs[name].draw(TransformPen(bp, (1, 0, 0, -1, x + pos.x_offset, -pos.y_offset)))
    x += pos.x_advance
xmin, ymin, xmax, ymax = bp.bounds

w, h = xmax - xmin, ymax - ymin
svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{xmin:.0f} {ymin:.0f} {w:.0f} {h:.0f}" '
    f'fill="currentColor" role="img" aria-label="{TEXT}"><path d="{path}"/></svg>\n'
)
OUT.write_text(svg, encoding='utf-8')
print(f'{OUT} {len(svg)} bytes, ink box {w:.0f} x {h:.0f} units (ratio {w / h:.4f}), upem {upem}')

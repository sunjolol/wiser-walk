# Traces the owner's brush W (design/graphics/logo-larger.png, 159 x 114, the largest export in the repo)
# into a vector, so the site icon can be cut sharp at any size. The shape is the PNG's own alpha edge,
# upsampled and smoothed, then fitted with cubic curves; the fill is a linear gradient fitted to the
# PNG's own colours. Writes design/icon/w.svg.
#   python design/icon/trace-w.py
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage
from skimage import measure

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'graphics', 'logo-larger.png')
OUT = os.path.join(HERE, 'w.svg')
UP = 8  # upsampling before the edge is found, so the curve follows the anti-aliased edge, not the pixels

im = Image.open(SRC).convert('RGBA')
W, H = im.size
a = np.asarray(im, dtype=np.float64)
alpha = a[..., 3] / 255.0

# The edge: alpha upsampled smoothly, blurred to iron out pixel steps, cut at half coverage.
# The W touches the PNG's edges (the hook's top, the right tip, the foot). Padded with nothing, the
# blur rounds those three ends off the way the brush rounds its others; repeating the edge instead
# grew a stub at each. The viewBox below leaves room for the rounding.
M = 3
ext = np.pad(alpha, M)
big = np.asarray(Image.fromarray((ext * 255).astype(np.uint8)).resize(((W + 2 * M) * UP, (H + 2 * M) * UP), Image.BICUBIC), dtype=np.float64) / 255
big = ndimage.gaussian_filter(big, sigma=UP * 0.9)
pad = np.pad(big, 2)
contours = measure.find_contours(pad, 0.5)
contours = [c for c in contours if len(c) > 50]
contours.sort(key=len, reverse=True)

def to_path(c):
    # back to the PNG's own coordinates (x, y), then thinned to every few points and fitted with
    # Catmull-Rom splines, which pass through every kept point and turn into cubic Beziers exactly
    pts = (c[:, ::-1] - 2) / UP - M
    pts = measure.approximate_polygon(pts, tolerance=0.12)
    if np.allclose(pts[0], pts[-1]):
        pts = pts[:-1]
    n = len(pts)
    d = [f'M{pts[0][0]:.2f} {pts[0][1]:.2f}']
    for i in range(n):
        p0, p1, p2, p3 = pts[(i - 1) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = p1 + (p2 - p0) / 6
        c2 = p2 - (p3 - p1) / 6
        d.append(f'C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}')
    return ''.join(d) + 'Z', n

paths = [to_path(c) for c in contours]

# The fill: each channel fitted as a plane over the opaque pixels, value = k + gx*x + gy*y. The
# red channel falls fastest along the stroke, so its slope gives the gradient's direction; the two
# end colours are the fitted colour at the extremes of the shape along that direction.
ys, xs = np.nonzero(alpha > 0.9)
X = np.column_stack([np.ones_like(xs), xs, ys]).astype(np.float64)
coef = [np.linalg.lstsq(X, a[ys, xs, ch], rcond=None)[0] for ch in range(3)]
g = np.array([coef[0][1], coef[0][2]])
u = -g / np.linalg.norm(g)          # from orange (high red) towards blue
t = xs * u[0] + ys * u[1]
p_start = np.array([xs[t.argmin()], ys[t.argmin()]], dtype=np.float64)
p_end = np.array([xs[t.argmax()], ys[t.argmax()]], dtype=np.float64)
hexc = lambda c: '#%02X%02X%02X' % tuple(int(round(v)) for v in c)
# The colour does not run straight from orange to blue: it passes through a soft lilac, and a
# two-stop gradient goes muddy there. So the stops are the PNG's own mean colour in nine bands
# along the axis.
t0, t1 = t.min(), t.max()
BANDS = 9
stops = []
for i in range(BANDS):
    lo, hi = t0 + (t1 - t0) * i / BANDS, t0 + (t1 - t0) * (i + 1) / BANDS
    m = (t >= lo) & (t <= hi)
    if m.sum() < 5:
        continue
    stops.append(((lo + hi) / 2 - t0) / (t1 - t0))
    stops[-1] = (stops[-1], a[ys[m], xs[m], :3].mean(axis=0))
c0, c1 = stops[0][1], stops[-1][1]

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-M} {-M} {W + 2 * M} {H + 2 * M}" width="{W + 2 * M}" height="{H + 2 * M}">
  <!-- Traced from design/graphics/logo-larger.png by design/icon/trace-w.py. -->
  <defs>
    <linearGradient id="w" gradientUnits="userSpaceOnUse" x1="{p_start[0]:.1f}" y1="{p_start[1]:.1f}" x2="{p_end[0]:.1f}" y2="{p_end[1]:.1f}">
{chr(10).join(f'      <stop offset="{o:.3f}" stop-color="{hexc(c)}"/>' for o, c in stops)}
    </linearGradient>
  </defs>
  <path fill="url(#w)" d="{' '.join(p for p, _ in paths)}"/>
</svg>
'''
open(OUT, 'w', encoding='utf-8', newline='\n').write(svg)
print('w.svg:', len(paths), 'outline(s),', sum(n for _, n in paths), 'points; gradient', hexc(c0), '->', hexc(c1),
      'from', p_start.tolist(), 'to', p_end.tolist())

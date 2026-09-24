# Makes the preview's pictures: square portrait crops (faces/) and web-sized paintings (arts/).
# python design/quiz-ideas/personality/preview/faces.py
import os, json
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.normpath(os.path.join(HERE, '..', '..', '..', '..', 'site', 'public', 'img'))
os.makedirs(os.path.join(HERE, 'faces'), exist_ok=True)
os.makedirs(os.path.join(HERE, 'arts'), exist_ok=True)

FACES = {
  # key: (path, vertical focus 0 = top .. 1 = bottom, horizontal focus)
  'antony-the-great': (f'{SITE}/early-christians/antony-the-great.jpg', 0.05, .5),
  'augustine-of-hippo': (f'{SITE}/early-christians/augustine-of-hippo.jpg', 0.05, .5),
  'gregory-the-great': (f'{SITE}/early-christians/gregory-the-great.jpg', 0.0, .55),
  'john-chrysostom': (f'{SITE}/early-christians/john-chrysostom.jpg', 0.05, .5),
  'jerome': (f'{SITE}/early-christians/jerome.jpg', 0.0, .7),
  'gregory-of-nazianzus': (f'{SITE}/early-christians/gregory-of-nazianzus.jpg', 0.04, .5),
  'basil-the-great': (f'{SITE}/early-christians/basil-the-great.jpg', 0.04, .5),
  'benedict-of-nursia': (f'{SITE}/early-christians/benedict-of-nursia.jpg', 0.05, .5),
  'ambrose-of-milan': (f'{SITE}/early-christians/ambrose-of-milan.jpg', 0.05, .5),
  'martin-of-tours': (f'{SITE}/early-christians/martin-of-tours.jpg', 0.05, .5),
  'elijah': (f'{SITE}/figures/elijah.jpg', 0.15, .5),
  'gideon': (f'{SITE}/figures/gideon.jpg', 0.15, .5),
  'peter': (f'{SITE}/figures/peter.jpg', 0.15, .5),
  'abraham': (f'{SITE}/figures/abraham.jpg', 0.15, .5),
  'jeremiah': (f'{HERE}/img/jeremiah.jpg', 0.1, .5),
  'isaiah': (f'{HERE}/img/isaiah.jpg', 0.1, .5),
  'arsenius': (f'{HERE}/img/arsenius.jpg', 0.05, .5),
  'ephrem': (f'{HERE}/img/ephrem.jpg', 0.05, .5),
  'moses': (f'{HERE}/img/moses.jpg', 0.1, .5),
  # the opposite-pair saints (Your opposite, page 2)
  'martha': (f'{HERE}/img/martha.jpg', 0.1, .5),
  'mary-bethany': (f'{HERE}/img/mary-bethany.jpg', 0.1, .5),
  'barnabas': (f'{HERE}/img/barnabas.jpg', 0.1, .5),
  'paul': (f'{HERE}/img/paul.jpg', 0.1, .5),
  'monica': (f'{HERE}/img/monica.jpg', 0.1, .5),
  # named only by the start page's "The saints behind it"
  'john-cassian': (f'{HERE}/img/john-cassian.jpg', 0.1, .5),
}
# colour pictures fetched for the preview win over the site's grey engravings
for k in ('elijah', 'gideon', 'peter', 'abraham'):
    if os.path.exists(os.path.join(HERE, 'img', k + '.jpg')):
        FACES[k] = (os.path.join(HERE, 'img', k + '.jpg'), 0.1, .5)
if os.path.exists(os.path.join(HERE, 'img', 'ambrose.jpg')):
    FACES['ambrose-of-milan'] = (os.path.join(HERE, 'img', 'ambrose.jpg'), 0.1, .5)
# the page-10 role card wears its saint large, as a background: l-<key>
LINES = ['elijah', 'benedict-of-nursia', 'abraham', 'ephrem', 'ambrose-of-milan', 'gregory-the-great', 'martin-of-tours']
os.makedirs(os.path.join(HERE, 'lines'), exist_ok=True)
ARTS = ['hearth', 'spark', 'deepwell', 'forge', 'stillwater', 'lookout', 'oak', 'herald']

def crop_square(im, fy, fx):
    w, h = im.size
    s = min(w, h)
    left = int((w - s) * fx) if w > h else 0
    top = int((h - s) * fy) if h > w else 0
    return im.crop((left, top, left + s, top + s))

# Whole-figure pictures get a tight square on the face: (centre x, centre y, side as a share of the width).
FOCUS = {
  'jeremiah': (.44, .2, .42),
  'augustine-of-hippo': (.55, .1, .6),
  'john-chrysostom': (.5, .17, .4),
  'jerome': (.71, .3, .45),
  'isaiah': (.52, .13, .45),
  'arsenius': (.5, .21, .55),
  'ephrem': (.47, .3, .55),
  'moses': (.62, .3, .6),
  'elijah': (.42, .26, .75),
  'abraham': (.55, .25, .55),
  'peter': (.44, .3, .72),
  'ambrose-of-milan': (.47, .21, .5),
  'martha': (.52, .41, .55),
  'mary-bethany': (.7, .37, .6),
  'barnabas': (.5, .33, .7),
  'paul': (.47, .42, .72),
  'monica': (.48, .43, .6),
  # a 9th-century medallion whose dotted border hugs his hair: the square stays inside the gold
  'john-cassian': (.5, .49, .8),
}

def crop_focus(im, cx, cy, frac):
    w, h = im.size
    s = int(w * frac)
    left = min(max(0, int(w * cx - s / 2)), w - s)
    top = min(max(0, int(h * cy - s / 2)), h - s)
    return im.crop((left, top, left + s, top + s))

made = []
for k, (p, fy, fx) in FACES.items():
    if not os.path.exists(p):
        print('missing', k); continue
    im = Image.open(p).convert('RGB')
    sq = crop_focus(im, *FOCUS[k]) if k in FOCUS else crop_square(im, fy, fx)
    sq.resize((220, 220), Image.LANCZOS).save(os.path.join(HERE, 'faces', k + '.jpg'), quality=82)
    made.append(k)
for k in LINES:
    p = FACES[k][0]
    if not os.path.exists(p):
        continue
    im = Image.open(p).convert('RGB')
    im.thumbnail((760, 1100), Image.LANCZOS)
    im.save(os.path.join(HERE, 'lines', 'l-' + k + '.jpg'), quality=74)
# the other quizzes' cards wear the site's own Doré engravings, as on the home page
for k, f in (('q-sins', 'dore-eden.jpg'), ('q-gifts', 'dore-paul.jpg')):
    im = Image.open(os.path.join(SITE, f)).convert('RGB')
    im.thumbnail((560, 700), Image.LANCZOS)
    im.save(os.path.join(HERE, 'lines', k + '.jpg'), quality=74)
for k in ARTS:
    p = os.path.join(HERE, 'img', k + '.jpg')
    if not os.path.exists(p):
        print('missing art', k); continue
    im = Image.open(p).convert('RGB')
    im.thumbnail((1100, 1100), Image.LANCZOS)
    im.save(os.path.join(HERE, 'arts', k + '.jpg'), quality=76)
    made.append(k)

# contact sheet of every face and painting, for a quick check
tiles = [os.path.join(HERE, 'faces', k + '.jpg') for k in FACES if os.path.exists(os.path.join(HERE, 'faces', k + '.jpg'))] + \
        [os.path.join(HERE, 'arts', k + '.jpg') for k in ARTS if os.path.exists(os.path.join(HERE, 'arts', k + '.jpg'))]
cols = 7
rows = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 200, rows * 200), 'white')
for i, t in enumerate(tiles):
    im = Image.open(t); im.thumbnail((200, 200))
    sheet.paste(im, ((i % cols) * 200, (i // cols) * 200))
sheet.save(os.path.join(HERE, 'contact-preview.jpg'), quality=80)
print('made', len(made))

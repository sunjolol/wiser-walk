# Cut a tall capture into readable slices:  python design/tools/crop.py <in.png> [slice_height=1300]
import sys
from PIL import Image
src = sys.argv[1]; step = int(sys.argv[2]) if len(sys.argv) > 2 else 1300
im = Image.open(src); w, h = im.size
for i, top in enumerate(range(0, h, step)):
    out = src[:-4] + f'-{i}.png'
    im.crop((0, top, w, min(h, top + step))).save(out); print(out)

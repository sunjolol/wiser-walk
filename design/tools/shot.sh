#!/bin/sh
# Headless Chrome capture. The in-app browser pane cannot screenshot while hidden; this can.
#   sh design/tools/shot.sh <url> <out.png> <width> <height>          desktop / tablet widths (>= 500)
#   sh design/tools/shot.sh -m <url> <out.png> <height> [width=390]   phone width, through an iframe
# Dark theme: add ?theme=dark to the URL (the site honours it). Output path must be absolute.
#
# The virtual-time budget is 30s on purpose. At 7s a tall capture shuttered before the lazy
# pictures further down the page had decoded, and a card wearing an engraving photographed as a
# flat black box — which reads as a design fault that is not there. Do not lower it.
CH="/c/Program Files/Google/Chrome/Application/chrome.exe"
HERE="$(cd "$(dirname "$0")" && pwd)"
if [ "$1" = "-m" ]; then
  URL="$2"; OUT="$3"; H="$4"; W="${5:-390}"
  ENC=$(python -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$URL")
  URL="file:///$(cygpath -m "$HERE/frame.html")?u=$ENC&w=$W&h=$H"
else
  URL="$1"; OUT="$2"; W="$3"; H="$4"
fi
PROFILE="$(mktemp -d)"
"$CH" --headless=new --disable-gpu --hide-scrollbars --no-first-run --user-data-dir="$(cygpath -w "$PROFILE")" \
  --window-size=$W,$H --virtual-time-budget=30000 --screenshot="$(cygpath -w "$OUT")" "$URL" >/dev/null 2>&1
rm -rf "$PROFILE" 2>/dev/null
ls -la "$OUT" | awk '{print $5, $9}'

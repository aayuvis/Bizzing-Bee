#!/usr/bin/env bash
# finish.sh — re-render the shots whose definition changed mid-run, then assemble.
#
# The four render workers load scenes.js and shotrender.js once, at start. Anything edited
# while they are running is invisible to them, so a shot they already produced is stale
# rather than wrong-looking — it silently carries the old definition into the concat. These
# six changed after the workers launched: five gained moving traffic, and one had its
# misspelling corrected from GLADIOLYS to GLADYOLUS.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH=/opt/node22/lib/node_modules

STALE="0 25 36 51 75 67"

echo "re-rendering shots whose definition changed after the workers started: $STALE"
for i in $STALE; do
  rm -f "out/shot$(printf '%03d' "$i").mp4"
done
for i in $STALE; do
  node render.cjs --shot "$i" 2>&1 | grep -E "^  shot|ERR" || true
done

# Prove the corrected spelling really is on screen, not merely in the source. The renderer
# asserts this from the live DOM before writing a frame, but it is the single error this
# film cannot ship, so it is worth saying out loud in the build log too.
node -e '
  const s = require("./scenes.js").build().find(x => x.wrong);
  const shown = s.word.slice(0, s.wrong.i) + s.wrong.ch + s.word.slice(s.wrong.i + 1);
  console.log("misspelling shot " + s.idx + " shows: " + shown);
  if (shown !== "GLADYOLUS") { console.error("FAIL: expected GLADYOLUS"); process.exit(1); }'

./assemble.sh

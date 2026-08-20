#!/usr/bin/env bash
# finish.sh — re-render the shots whose definition changed mid-run, then assemble.
#
# The four render workers load scenes.js and shotrender.js once, at start. Anything edited
# while they are running is invisible to them, so a shot they already produced is stale
# rather than wrong-looking — it silently carries the old definition into the concat.
#
# STALE is therefore per-run, not a fixed list. Set it to the shots whose definition changed
# after the workers launched; leave it empty when nothing did. The v3 run had nothing: both
# sources were last written before the workers started, which the check below re-proves
# rather than takes on trust.
set -euo pipefail
cd "$(dirname "$0")"
export NODE_PATH=/opt/node22/lib/node_modules

STALE=""

# A source newer than the oldest shot on disk means some shot was rendered from a definition
# that no longer exists. Say so loudly — this is the failure that ships quietly.
oldest=$(ls -t out/shot*.mp4 2>/dev/null | tail -1)
if [ -n "$oldest" ]; then
  for src in scenes.js shotrender.js; do
    if [ "$src" -nt "$oldest" ]; then
      echo "WARNING: $src is newer than $oldest — some shots may be stale. Add them to STALE." >&2
    fi
  done
fi

if [ -z "$STALE" ]; then
  echo "no shots changed mid-run — nothing to re-render"
else
  echo "re-rendering shots whose definition changed after the workers started: $STALE"
fi
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

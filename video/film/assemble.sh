#!/usr/bin/env bash
# assemble.sh — shot mp4s + the voiceover → the finished film.
#
#   ./assemble.sh          master + preview
#
# The shots are already cut to the narration (the audio is the clock), so this is a
# straight concat and a mux. There is deliberately no re-timing step here: if a shot and
# its sentence disagree, the fix belongs in scenes.js, not in a stretch filter.
set -euo pipefail
cd "$(dirname "$0")"

FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
VO=../vo/bizzing-vo-ep1-despina.mp3
OUT=../out
mkdir -p "$OUT"

# Concatenating whatever happens to be on disk is how you ship a film with a hole in it: a
# worker that died leaves its slice missing and `-c copy` joins the rest without complaint.
# So the count is checked against the scene graph before anything is joined.
want=$(NODE_PATH=/opt/node22/lib/node_modules node -e 'process.stdout.write(String(require("./scenes.js").build().length))')
n=$(ls out/shot*.mp4 2>/dev/null | wc -l)
[ "$n" -gt 0 ] || { echo "no shots rendered — run: node render.cjs --all"; exit 1; }
if [ "$n" -ne "$want" ]; then
  echo "FAIL: $n shot files on disk but the scene graph has $want."
  NODE_PATH=/opt/node22/lib/node_modules node -e '
    const fs=require("fs");
    const have=new Set(fs.readdirSync("out").filter(f=>/^shot\d+\.mp4$/.test(f)));
    const miss=require("./scenes.js").build()
      .filter(s=>!have.has("shot"+String(s.idx).padStart(3,"0")+".mp4"))
      .map(s=>s.idx);
    console.log("missing shots:", miss.join(", "));'
  exit 1
fi
echo "concatenating $n shots"

: > out/list.txt
for f in $(ls out/shot*.mp4 | sort); do echo "file '$PWD/$f'" >> out/list.txt; done
"$FF" -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/picture.mp4

probe(){ "$FF" -i "$1" 2>&1 | sed -n 's/.*\(Duration: [0-9:.]*\).*/\1/p' | sed -n 1p || true; }
VD=$(probe out/picture.mp4)
AD=$(probe "$VO")
echo "picture $VD"
echo "voice   $AD"

# Master. The picture now runs PAST the narration: scenes.js holds a TAIL of sign-off after
# the last word, so the mix is padded with that much silence rather than the video being
# truncated to the audio. -shortest here would cut the sign-off off entirely, which is
# exactly what it did the first time this tail was added.
TAIL=$(node -e 'process.stdout.write(String(require("./scenes.js").TAIL))')
echo "tail    ${TAIL}s of silence after the last word"

# The effects bed (typewriters, press rumble, firecrackers) is mixed UNDER the narration,
# never over it. normalize=0 matters: amix's default halves every input to guard against
# clipping, which would quietly drop the voice 6dB and undo the whole recording.
# STEREO, always. The narration source is mono and ffmpeg will happily carry that through to
# a mono AAC track, which is technically correct and reads as a film with NO SOUND: several
# embedded players drop a mono track rather than downmixing it. A review copy was reported
# as silent for exactly this reason while every measurement said the audio was fine.
AOPT="-c:a aac -b:a 192k -ac 2 -ar 44100"

SFX=../vo/sfx.wav
# Regenerate it if absent: it is a build artifact, not a source file, and is deliberately
# not tracked. sfx.py is deterministic, so this reproduces the same bed every time.
if [ ! -f "$SFX" ] && [ -f ../sfx.py ]; then
  echo "sfx     $SFX missing — regenerating"; ( cd .. && python3 sfx.py >/dev/null ); fi
if [ -f "$SFX" ]; then
  echo "sfx     mixing $SFX under the narration"
  "$FF" -y -loglevel error -i out/picture.mp4 -i "$VO" -i "$SFX" \
    -filter_complex "[1:a]apad=pad_dur=${TAIL}[v];[2:a]volume=0.32[s];\
[v][s]amix=inputs=2:normalize=0:duration=first:dropout_transition=0,alimiter=limit=0.97[a]" \
    -map 0:v -map "[a]" -c:v copy $AOPT -shortest \
    "$OUT/before-the-bee-ep1-1080p.mp4"
else
  "$FF" -y -loglevel error -i out/picture.mp4 -i "$VO" \
    -filter_complex "[1:a]apad=pad_dur=${TAIL}[a]" \
    -map 0:v -map "[a]" -c:v copy $AOPT -shortest \
    "$OUT/before-the-bee-ep1-1080p.mp4"
fi

# Preview. Quality-TARGETED, not bitrate-pinned: a derived file that comes out larger than
# its master is the trap CLAUDE.md records, and flat graphic animation lands under any
# sensible fixed bitrate at 1080p.
"$FF" -y -loglevel error -i "$OUT/before-the-bee-ep1-1080p.mp4" \
  -vf scale=1280:720 -c:v libx264 -preset medium -crf 26 -c:a copy \
  "$OUT/before-the-bee-ep1-720p.mp4"

M=$(stat -c%s "$OUT/before-the-bee-ep1-1080p.mp4")
P=$(stat -c%s "$OUT/before-the-bee-ep1-720p.mp4")
echo "master  $((M/1048576)) MB   $(probe "$OUT/before-the-bee-ep1-1080p.mp4")"
echo "preview $((P/1048576)) MB"
[ "$P" -lt "$M" ] || { echo "FAIL: preview is not smaller than the master"; exit 1; }

# The master must be as long as the picture. If -shortest has quietly clipped the sign-off
# again, this is where it shows up rather than in the upload.
# `|| true` is load-bearing, same as in probe() above: `ffmpeg -i` with no output file exits
# non-zero by design, and under `set -o pipefail` that aborts the script — silently, because
# the caller pipes this to tail. It is what stopped the previous build right after printing
# the file sizes, so the length check never ran at all.
secs(){ { "$FF" -i "$1" 2>&1 | sed -n 's/.*Duration: \([0-9]*\):\([0-9]*\):\([0-9.]*\).*/\1 \2 \3/p' | sed -n 1p \
        | awk '{printf "%.2f", $1*3600+$2*60+$3}'; } || true; }
PV=$(secs out/picture.mp4); MV=$(secs "$OUT/before-the-bee-ep1-1080p.mp4")
echo "picture ${PV}s · master ${MV}s"
awk -v a="$PV" -v b="$MV" 'BEGIN{ if ((a-b)>0.5 || (b-a)>0.5) exit 1 }' \
  || { echo "FAIL: master ${MV}s does not match picture ${PV}s — the tail was clipped"; exit 1; }
# And prove the track really is stereo, from the file rather than from the flags we passed.
# This is the one defect that measures clean and plays as silence, so it gets its own check.
for f in "$OUT/before-the-bee-ep1-1080p.mp4" "$OUT/before-the-bee-ep1-720p.mp4"; do
  ch=$({ "$FF" -i "$f" 2>&1 | sed -n 's/.*Audio: .*, \(mono\|stereo\).*/\1/p' | sed -n 1p; } || true)
  echo "audio   $(basename "$f"): ${ch:-UNKNOWN}"
  [ "$ch" = stereo ] || { echo "FAIL: $(basename "$f") is ${ch:-missing audio}, not stereo — players will drop it"; exit 1; }
done

echo "done → $OUT/"

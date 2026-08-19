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

n=$(ls out/shot*.mp4 2>/dev/null | wc -l)
[ "$n" -gt 0 ] || { echo "no shots rendered — run: node render.cjs --all"; exit 1; }
echo "concatenating $n shots"

: > out/list.txt
for f in $(ls out/shot*.mp4 | sort); do echo "file '$PWD/$f'" >> out/list.txt; done
"$FF" -y -loglevel error -f concat -safe 0 -i out/list.txt -c copy out/picture.mp4

probe(){ "$FF" -i "$1" 2>&1 | sed -n 's/.*\(Duration: [0-9:.]*\).*/\1/p' | sed -n 1p || true; }
VD=$(probe out/picture.mp4)
AD=$(probe "$VO")
echo "picture $VD"
echo "voice   $AD"

# Master. -shortest guards the tail: the picture is built from the narration's own
# lengths, so any drift here means scenes.js and timing.json have come apart.
"$FF" -y -loglevel error -i out/picture.mp4 -i "$VO" \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest \
  "$OUT/before-the-bee-ep1-1080p.mp4"

# Preview. Quality-TARGETED, not bitrate-pinned: a derived file that comes out larger than
# its master is the trap CLAUDE.md records, and flat graphic animation lands under any
# sensible fixed bitrate at 1080p.
"$FF" -y -loglevel error -i "$OUT/before-the-bee-ep1-1080p.mp4" \
  -vf scale=1280:720 -c:v libx264 -preset medium -crf 26 -c:a copy \
  "$OUT/before-the-bee-ep1-720p.mp4"

M=$(stat -c%s "$OUT/before-the-bee-ep1-1080p.mp4")
P=$(stat -c%s "$OUT/before-the-bee-ep1-720p.mp4")
echo "master  $((M/1048576)) MB"
echo "preview $((P/1048576)) MB"
[ "$P" -lt "$M" ] || { echo "FAIL: preview is not smaller than the master"; exit 1; }
echo "done → $OUT/"

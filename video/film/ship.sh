#!/usr/bin/env bash
# ship.sh — put the finished master into ../dist as parts GitHub will accept.
#
#   ./ship.sh
#
# GitHub hard-refuses any blob over 100 MiB, so the master ships as a BYTE split: four raw
# ranges that concatenate back to the original bit for bit. No part is independently
# playable and that is correct — cutting the film into four playable segments instead would
# re-encode it, and re-encoding a delivered master loses a generation for nothing.
#
# The round trip is verified HERE, before anything is committed. A part uploaded from an
# unverified split is a corrupt master that nobody discovers until someone tries to watch it.
set -euo pipefail
cd "$(dirname "$0")"

FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
SRC=../out/before-the-bee-ep1-1080p.mp4
DIST=../dist
PARTS=4
STEM=ep1-1080p

[ -f "$SRC" ] || { echo "no master at $SRC — run ./assemble.sh first"; exit 1; }

# Refuse to ship a mono master. This is the defect that measures clean and plays as silence.
ch=$({ "$FF" -i "$SRC" 2>&1 | sed -n 's/.*Audio: .*, \(mono\|stereo\).*/\1/p' | sed -n 1p; } || true)
[ "$ch" = stereo ] || { echo "FAIL: master is ${ch:-missing audio}, not stereo — re-run assemble.sh"; exit 1; }

SIZE=$(stat -c%s "$SRC")
SUM=$(sha256sum "$SRC" | cut -d' ' -f1)
echo "master  $((SIZE/1048576)) MB  $ch  $SUM"

mkdir -p "$DIST"
rm -f "$DIST/$STEM".part*.bin
split -n "$PARTS" -d --additional-suffix=.bin "$SRC" "$DIST/$STEM.part"

big=$(find "$DIST" -name "$STEM.part*.bin" -size +99M | head -1)
[ -z "$big" ] || { echo "FAIL: $big is over 99 MB — raise PARTS"; exit 1; }

# Rejoin into a scratch file and compare. Verifying after the push is not verifying.
TMP=$(mktemp -p "${TMPDIR:-/tmp}" ship.XXXXXX)
trap 'rm -f "$TMP"' EXIT
cat "$DIST/$STEM".part*.bin > "$TMP"
[ "$(sha256sum "$TMP" | cut -d' ' -f1)" = "$SUM" ] \
  || { echo "FAIL: rejoined file does not match the master"; exit 1; }
echo "verify  rejoin is byte-identical to the master"

DUR=$({ "$FF" -i "$SRC" 2>&1 | sed -n 's/.*Duration: \([0-9:.]*\),.*/\1/p' | sed -n 1p; } || true)
VID=$({ "$FF" -i "$SRC" 2>&1 | sed -n 's/.*Video: \([^,]*, [^,]*, [0-9x]*\).*/\1/p' | sed -n 1p; } || true)

cat > "$DIST/README.md" <<EOF
# Before the Bee, Ep. 1 — 1080p master, split for GitHub

The finished film is $((SIZE/1048576)) MB. GitHub rejects any single file over 100 MB, so the master is
stored here as $PARTS byte-exact parts. They are **not** $PARTS video files — each part on its own
is unplayable. Concatenating them reproduces the original file bit for bit.

## Stitch it back

macOS / Linux:

    cat $STEM.part*.bin > before-the-bee-ep1-1080p.mp4

Windows (PowerShell):

    cmd /c copy /b $(ls "$DIST/$STEM".part*.bin | xargs -n1 basename | paste -sd+ -) before-the-bee-ep1-1080p.mp4

## Then check it

    shasum -a 256 before-the-bee-ep1-1080p.mp4

must print

    $SUM

If it does, the file is identical to what was rendered. If it does not, one part downloaded
short — re-pull that part rather than trusting the video.

| | |
|---|---|
| Duration | ${DUR:-?} |
| Picture | ${VID:-1920x1080}, 24 fps, H.264 CRF 18 |
| Sound | AAC 192 kbps **stereo** — narration, plus typewriters and press rumble |
| Size | $SIZE bytes |

The sound is stereo deliberately. The narration source is mono, and a mono AAC track is
technically correct but reads as a film with no sound at all: several embedded players drop
one rather than downmixing it. \`assemble.sh\` and this script both refuse a mono master.

## A warning about keeping these here

Git stores every version of a binary forever. This repo has already paid for one 1.63 GB
\`git filter-repo\` purge caused by committed binaries, and \`CLAUDE.md\` records the rule that
generated artifacts stay out of the tree. These are here by explicit decision — there is no
other way to get a $((SIZE/1048576)) MB file out of an ephemeral container, and a master that lives only
in a container is a master that is already lost.

Two things follow. **Replace, never accumulate**: a re-cut overwrites these parts in one
commit; do not let v1/v2/v3 pile up, which is exactly how the 1.63 GB happened. And **once
the master is safely downloaded, delete them** (\`git rm video/dist/*.bin\`). That clears the
working tree, though not history; only a rewrite reclaims the space.

The film is also fully reproducible without any of this:

    cd video/film && node render.cjs --all && ./finish.sh && ./ship.sh
EOF

ls -la "$DIST"
echo "done → $DIST/ ($PARTS parts, verified)"

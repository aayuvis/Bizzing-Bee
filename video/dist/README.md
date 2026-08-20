# Before the Bee, Ep. 1 — 1080p master, split for GitHub

The finished film is 351 MB. GitHub rejects any single file over 100 MB, so the master is
stored here as 4 byte-exact parts. They are **not** 4 video files — each part on its own
is unplayable. Concatenating them reproduces the original file bit for bit.

## Stitch it back

macOS / Linux:

    cat ep1-1080p.part*.bin > before-the-bee-ep1-1080p.mp4

Windows (PowerShell):

    cmd /c copy /b ep1-1080p.part00.bin+ep1-1080p.part01.bin+ep1-1080p.part02.bin+ep1-1080p.part03.bin before-the-bee-ep1-1080p.mp4

## Then check it

    shasum -a 256 before-the-bee-ep1-1080p.mp4

must print

    f4efa9eb3a9d7cbed66baf170d9c12bb467e19f6f69ae4df47c242247e56e5ff

If it does, the file is identical to what was rendered. If it does not, one part downloaded
short — re-pull that part rather than trusting the video.

| | |
|---|---|
| Duration | 00:08:31.29 |
| Picture | h264 (High) (avc1 / 0x31637661), yuv420p(progressive), 1920x1080, 24 fps, H.264 CRF 18 |
| Sound | AAC 192 kbps **stereo** — narration, plus typewriters and press rumble |
| Size | 368230558 bytes |

The sound is stereo deliberately. The narration source is mono, and a mono AAC track is
technically correct but reads as a film with no sound at all: several embedded players drop
one rather than downmixing it. `assemble.sh` and this script both refuse a mono master.

## A warning about keeping these here

Git stores every version of a binary forever. This repo has already paid for one 1.63 GB
`git filter-repo` purge caused by committed binaries, and `CLAUDE.md` records the rule that
generated artifacts stay out of the tree. These are here by explicit decision — there is no
other way to get a 351 MB file out of an ephemeral container, and a master that lives only
in a container is a master that is already lost.

Two things follow. **Replace, never accumulate**: a re-cut overwrites these parts in one
commit; do not let v1/v2/v3 pile up, which is exactly how the 1.63 GB happened. And **once
the master is safely downloaded, delete them** (`git rm video/dist/*.bin`). That clears the
working tree, though not history; only a rewrite reclaims the space.

The film is also fully reproducible without any of this:

    cd video/film && node render.cjs --all && ./finish.sh && ./ship.sh

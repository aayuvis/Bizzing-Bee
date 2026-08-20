# Before the Bee, Ep. 1 — 1080p master, split for GitHub

The finished film is 350 MB. GitHub rejects any single file over 100 MB, so the master is
stored here as four byte-exact parts of 87.5 MB. They are **not** four video files — each
part on its own is unplayable. Concatenating them reproduces the original file bit for bit.

## Stitch it back

macOS / Linux:

    cat ep1-1080p.part*.bin > before-the-bee-ep1-1080p.mp4

Windows (PowerShell):

    cmd /c copy /b ep1-1080p.part00.bin+ep1-1080p.part01.bin+ep1-1080p.part02.bin+ep1-1080p.part03.bin before-the-bee-ep1-1080p.mp4

## Then check it

    shasum -a 256 before-the-bee-ep1-1080p.mp4

must print

    9d559f19c33c4c7fbc2bcb30a3378f1a863cf2c869aa39006d0f7441022aebe6

If it does, the file is identical to what was rendered. If it does not, one part downloaded
short — re-pull that part rather than trusting the video.

| | |
|---|---|
| Duration | 8:31.29 |
| Picture | 1920×1080, 24 fps, H.264 CRF 18 |
| Sound | AAC 192 kbps mono — narration, plus typewriters and press rumble |
| Size | 367,100,763 bytes |

## A warning about keeping these here

Git stores every version of a binary forever, and these four files are 350 MB. This repo has
already paid for one 1.63 GB `git filter-repo` purge caused by committed binaries, and
`CLAUDE.md` records the rule that generated artifacts stay out of the tree. They are here
because they were asked for and because there is no other way to get a 350 MB file out of an
ephemeral container — not because this is a good long-term home.

**Once the master is safely downloaded, delete them** (`git rm video/dist/*.bin`). That
removes them from the working tree, though not from history; only a history rewrite reclaims
the space, and that is not worth a force-push over already-pushed work.

The film is also fully reproducible without any of this:

    cd video/film && node render.cjs --all && ./finish.sh

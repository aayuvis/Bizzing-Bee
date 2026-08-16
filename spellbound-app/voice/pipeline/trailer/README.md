# Trailer pipeline (Bee Grand Prix v1 — 73.5s, 1080p30)

Real gameplay, no AI video gen. Order:
1. `python3 -m http.server 8991` in spellbound-app/
2. `node capture.cjs` — Playwright records 6 gameplay clips (1920x1080 webm)
   + endcard.png. Needs SB_DEBUG _race hooks (toBox/grant/jump in saga2.js).
3. `python3 mkoverlays.py` — Fraunces text overlays (convert woff2→ttf first).
4. `python3 music.py` — 132bpm chiptune bed (numpy, royalty-free by construction).
5. `python3 vo.py` — Kokoro af_heart narration (model from kokoro-model-v1 release).
6. `python3 assemble.py` — trim/overlay/concat/mix → bee-grand-prix-trailer.mp4.

Clips include ~9-13s of app boot — find cut points with 1fps contact sheets
(ffmpeg tile filter) before trusting the trim table in assemble.py.
ffmpeg comes from pip's imageio-ffmpeg (no drawtext in that build — overlays are PNGs).

## Episode format (v2 — the engaging one)
Ad ≠ episode. `capture2.cjs` records ONE continuous choreographed champ race
(cold-open loop, one-rule challenge, setbacks, near-miss, photo finish) with an
EV event log; `vo2.py` is let's-play commentary (am_adam) with word-specific
lines; `sfx.py` synthesizes whoosh/skid/siren/thud/ding/rocket/tada; `assemble2.py`
cuts it. Two hard-won rules: call _race.clearBoxes() right after GO or champ's
scattered ? boxes dim every racing segment, and expect recordVideo to DRIFT
seconds past the EV log under load — verify cut points against extracted frames,
never trust the log alone. Word-specific VO/overlays must be regenerated per take.

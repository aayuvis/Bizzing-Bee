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

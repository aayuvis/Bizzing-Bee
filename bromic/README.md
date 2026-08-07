# Get Bromic — brand campaign

| File | What it is |
|---|---|
| `GET-BROMIC-CAMPAIGN.md` | Concept evaluation, strategic reframe, six executions, channel plan, measurement, risk register |
| `GET-BROMIC-20-CONCEPTS.md` | 20 culturally-tagged concepts for US + AUS, with a summary grid and shortlist |
| `Get-Bromic-Deck.html` | **Standalone deck — every image and the film embedded as data URIs. Open it anywhere, offline, no network.** |
| `deck.html` | Source of the deck (assets injected at build time, not stored inline) |
| `GET-BROMIC-TRADE-COMMERCIAL.md` | Tier 2 — 5 builder + 5 commercial concepts with full campaign briefs |
| `boards/` | 35 AI-generated mood board frames (Gemini `gemini-3-pro-image`), 1200px JPEG |
| `films/` | 18-second films (Veo 3.1, 2×8s clips + endline card, stitched with ffmpeg) |
| `build-films.py` | Veo generation + ffmpeg stitch pipeline |
| `build-deck.py` | Inlines `boards/*.jpg` and the film as data URIs into `deck.html` → standalone HTML |

**Published deck:** https://claude.ai/code/artifact/b84bd3c2-c832-4407-9ef6-ee69107e3596

Mood boards are tonal references for direction only — lighting, staging, casting age and comic
register. They are not storyboards or final frames, and depict no real product.

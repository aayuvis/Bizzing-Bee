# Get Bromic — brand campaign

| File | What it is |
|---|---|
| `GET-BROMIC-CAMPAIGN.md` | Concept evaluation, strategic reframe, six executions, channel plan, measurement, risk register |
| `GET-BROMIC-20-CONCEPTS.md` | 20 culturally-tagged concepts for US + AUS, with a summary grid and shortlist |
| `Get-Bromic-Deck.html` | **Standalone deck — every image and the film embedded as data URIs. Open it anywhere, offline, no network.** |
| `deck.html` | Source of the deck (assets injected at build time, not stored inline) |
| `GET-BROMIC-THE-RECEIPT.md` | Second format — the inverted price stack, in type and as priced photography, with legal guidance |
| `GET-BROMIC-TRADE-COMMERCIAL.md` | Tier 2 — 5 builder + 5 commercial concepts with full campaign briefs |
| `boards/` | 35 AI-generated mood board frames (Gemini `gemini-3-pro-image`), 1200px JPEG |
| `films/` | Six 20-second animatics — matched-cut plates, Ken Burns push/pull, Gemini TTS deadpan VO, endline card |
| `build-animatics.py` | Animatic pipeline: TTS VO + ffmpeg zoompan/xfade (no video API, no quota) |
| `build-films.py` | Veo generation + ffmpeg stitch pipeline (blocked on Veo quota) |
| `build-deck.py` | Inlines `boards/*.jpg` and the film as data URIs into `deck.html` → standalone HTML |

**Published deck:** https://claude.ai/code/artifact/b84bd3c2-c832-4407-9ef6-ee69107e3596

Mood boards are tonal references for direction only — lighting, staging, casting age and comic
register. They are not storyboards or final frames, and depict no real product.

# VOICE PIPELINE — exact provenance + params (answers the new chat's 2 asks)

## 1) Model files — exact source + host reachability

The two files were **GitHub release assets**, renamed locally:

| local name    | actual asset (release `model-files-v1.0`) | bytes      | sha256 |
|---------------|-------------------------------------------|------------|--------|
| `kokoro.onnx` | **`kokoro-v1.0.int8.onnx`**               | 92,361,271 | `6e742170d309016e5891a994e1ce1559c702a2ccd0075e67ef7157974f6406cb` |
| `voices.bin`  | **`voices-v1.0.bin`**                     | 28,214,398 | `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d` |

Base URL:
`https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/`
Voice used: **`af_heart`**. Package: **`kokoro-onnx==0.5.0`**.

**Host reachability (tested from a Kokoro-capable session):**
- `files.pythonhosted.org` / `pypi.org` → **200 (open)** — but **the model is NOT on PyPI.**
  The `kokoro-onnx` wheels are ~KB; they don't bundle the 92 MB ONNX. So **there is no
  pythonhosted route for the model files.**
- `github.com/.../releases/download/...` → **302 (works here — redirects to the asset)**.
- `huggingface.co` → **403 (blocked in sandbox).**

**Implication for the new session:** pip installs work over PyPI, but the **model download
needs `github.com` + `objects.githubusercontent.com` on the network allowlist.** If the new
session's policy blocks GitHub, it CANNOT get the model from PyPI — options are:
(a) add those two domains to the environment's allowed domains, or
(b) transfer the two files directly (they can be sent from the session that has them), or
(c) do synthesis in a Kokoro-ready session and hand clips off via git.

Fetch (once GitHub is allowed):
```bash
pip install -q kokoro-onnx==0.5.0 soundfile numpy espeakng-loader phonemizer-fork imageio-ffmpeg
B=https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0
curl -L -o kokoro.onnx $B/kokoro-v1.0.int8.onnx
curl -L -o voices.bin  $B/voices-v1.0.bin
sha256sum kokoro.onnx voices.bin   # must match the table above
```

## 2) Synth parameters — the library uses THREE sets (matters for matching)

Same for all: `Kokoro("voice/kokoro.onnx","voice/voices.bin")`, voice `af_heart`,
`lang="en-us"`, input text = `word + "."`, output = ffmpeg `-ar 24000 -ac 1 -b:a 48k
libmp3lame`, filename key = `re.sub(r'[^a-z0-9]','-', word)`. They differ only in
**speed + trim + pad**:

**A. Bulk ~40k library — `kfinal.py` (what MOST shipped clips use → match this for normal words)**
- `k.create(w+".", voice="af_heart", speed=0.95, lang="en-us")`
- trim: `idx = np.where(np.abs(a) > 0.004)[0]`
- pad: lead `int(0.14*sr)`, trail `int(0.16*sr)`

**B. 464 short-word batch — `synth_short.py`**
- `speed=0.92`
- trim: `np.abs(a) > 0.0035`, then keep `[idx[0]-0.10*sr : idx[-1]+0.12*sr]`
- pad: lead `0.13*sr`, trail `0.15*sr`

**C. 44 flagged rebuild THIS session — `synth_v2.py`**
- `speed=1.0`, `trim=True` (Kokoro's own end-trim)
- energy-envelope trim: `env(win=0.012s)`, `thr = max(env)*0.045`, keep
  `[idx[0]-0.03*sr : idx[-1]+0.05*sr]`
- pad: lead `0.05*sr`, trail `0.07*sr`

### ⚠️ The consistency tradeoff (read before rebuilding)
The bulk library is **0.95×**; this session's 44 rebuilds are **1.0×** (deliberate — 0.92/0.95
stretched vowels and caused the `pole→oooole` echoes on ultra-short words). So:
- **Normal / multisyllable words:** use **set A (0.95)** to match the library's pace/timbre.
- **Ultra-short 2–4 letter words:** **1.0 (set C)** is the fix; they'll sound slightly
  snappier than neighbors — acceptable, or eventually re-do the whole short set at 1.0 for
  internal consistency.
- Don't invent new trim params — pick A or C so rebuilt clips match a shipped cohort.

The three scripts are attached (`kfinal.py`, `synth_short.py`, `synth_v2.py`). Input to each
is a JSON array of words: `python3 synth_v2.py words.json` (run from the dir holding
`voice/kokoro.onnx` + `voice/voices.bin`).

## Note on quality ceiling
You cannot audition audio in-sandbox — the parent's **Re-review tab** is the only quality
gate. Phonemes for the flagged words are already correct; the artifacts are acoustic
(Kokoro destabilizing on very short isolated inputs). Carrier/extraction tricks were tested
and don't work (Kokoro won't insert separable gaps). Best lever remains native speed + clean
trim, then route to Re-review.

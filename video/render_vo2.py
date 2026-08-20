#!/usr/bin/env python3
"""render_vo2.py — cues2.json -> vo2/cue###.wav -> vo2/ep2-vo.wav (multi-voice)

    python3 render_vo2.py            render whatever is missing, then assemble
    python3 render_vo2.py 12 41      re-render just those cues, then assemble
    python3 render_vo2.py --list     what is on disk
    python3 render_vo2.py --assemble assemble only, render nothing

Eight voices: the narrator, and seven people quoted in their own voice. Gemini TTS takes the
direction as a prompt PREPENDED to the line, so the character work lives in `prep2.py`'s CAST
table and this file only has to deliver it faithfully.

TWO THINGS THIS FILE EXISTS TO GET RIGHT.

1. **The API returns raw PCM, not a container.** `audio/L16;codec=pcm;rate=24000`, base64 in
   `inlineData`. Write the 44-byte WAV header yourself or every player rejects the file.

2. **A quoted voice needs air around it.** Butted straight against the narration a character
   line reads as the narrator putting on an accent. Each cue carries its own `pad`, and the
   gap between two cues is the larger of the two facing pads — never their sum, which
   double-counts every join and adds a dead half-second to the film.

Cues are rendered ONE FILE EACH so a fluffed line costs one line. `--list` shows what is
there; naming cue numbers re-renders exactly those. Nothing here is in git: it is fully
reproducible from the script, and CLAUDE.md's rule is that a reproducible artifact is
gitignored before its first commit.
"""
import base64, json, os, struct, subprocess, sys, time, urllib.request
import concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
CUES = os.path.join(HERE, 'cues2.json')
OUT = os.path.join(HERE, 'vo2')
KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
MODEL = os.environ.get('TTS_MODEL', 'gemini-2.5-pro-preview-tts')
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
RATE = 24000
WORKERS = 4          # the TTS quota is per-model; more workers just queue on the same limit


def wav_bytes(pcm, rate=RATE):
    return (b'RIFF' + struct.pack('<I', 36 + len(pcm)) + b'WAVEfmt '
            + struct.pack('<IHHIIHH', 16, 1, 1, rate, rate * 2, 2, 16)
            + b'data' + struct.pack('<I', len(pcm)) + pcm)


def say(cue, retries=4):
    """One cue -> one wav. Returns a status line."""
    path = f'{OUT}/cue{cue["n"]:03d}.wav'
    # A character line must be said VERBATIM. Without this instruction the model paraphrases
    # quietly and plausibly: a blind listening check caught "Tell HIM about the dream" for
    # "Tell THEM", which changes who Mahalia Jackson was pointing at. The narrator does not
    # get this instruction — it reads as stilted over long prose.
    prompt = cue['style'] + '\n\n'
    if cue['who'] != 'NARRATOR':
        prompt += 'Say exactly this line, word for word, and nothing else:\n'
    body = {'contents': [{'parts': [{'text': prompt + cue['tts']}]}],
            'generationConfig': {'responseModalities': ['AUDIO'],
                                 'speechConfig': {'voiceConfig': {
                                     'prebuiltVoiceConfig': {'voiceName': cue['voice']}}}}}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(),
        headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'})
    for attempt in range(retries):
        try:
            r = json.load(urllib.request.urlopen(req, timeout=300))
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < retries - 1:
                time.sleep(15 * (attempt + 1)); continue
            return f'ERR  {cue["n"]:3d} HTTP {e.code}'
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(10); continue
            return f'ERR  {cue["n"]:3d} {type(e).__name__}'
        try:
            p = r['candidates'][0]['content']['parts'][0]['inlineData']
        except Exception:
            fin = r.get('candidates', [{}])[0].get('finishReason', '?')
            return f'NOAUD{cue["n"]:3d} finish={fin}'
        pcm = base64.b64decode(p['data'])
        rate = int(p['mimeType'].split('rate=')[1]) if 'rate=' in p['mimeType'] else RATE
        open(path, 'wb').write(wav_bytes(pcm, rate))
        secs = len(pcm) / 2 / rate
        wps = len(cue['tts'].split()) / secs * 60 if secs else 0
        return f'ok   {cue["n"]:3d} {cue["who"]:15} {secs:5.1f}s  {wps:3.0f}wpm'
    return f'ERR  {cue["n"]:3d} exhausted'


def dur(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    for ln in out.splitlines():
        if 'Duration:' in ln:
            h, m, s = ln.split('Duration:')[1].split(',')[0].strip().split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 0.0


def assemble(cues):
    """Concat with the right air at every join, then loudness-normalise.

    The gap before a cue is max(previous cue's trailing pad, this cue's leading pad) plus a
    base beat — the max, not the sum, because both pads describe the SAME silence from
    either side."""
    missing = [c['n'] for c in cues if not os.path.exists(f'{OUT}/cue{c["n"]:03d}.wav')]
    if missing:
        sys.exit(f'FAIL: {len(missing)} cue(s) not rendered: {missing}')

    BASE_PARA, BASE_SEC = 0.28, 0.62
    parts, prev = [], None
    for c in cues:
        if prev is not None:
            base = BASE_SEC if c['sec'] != prev['sec'] else BASE_PARA
            gap = max(base, prev['pad'][1], c['pad'][0])
            sil = f'{OUT}/.sil{gap:.2f}.wav'
            if not os.path.exists(sil):
                subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'lavfi', '-i',
                                f'anullsrc=r={RATE}:cl=mono', '-t', f'{gap:.2f}', sil], check=True)
            parts.append(sil)
        parts.append(f'{OUT}/cue{c["n"]:03d}.wav')
        prev = c

    lst = f'{OUT}/list.txt'
    with open(lst, 'w') as f:
        for p in parts:
            f.write(f"file '{os.path.abspath(p)}'\n")
    raw = f'{OUT}/ep2-vo-raw.wav'
    subprocess.run([FF, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0',
                    '-i', lst, '-ar', str(RATE), '-ac', '1', raw], check=True)
    final = f'{OUT}/ep2-vo.wav'
    subprocess.run([FF, '-y', '-loglevel', 'error', '-i', raw,
                    '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', str(RATE), '-ac', '1',
                    final], check=True)
    d = dur(final)
    print(f'\nvoiceover  {int(d//60)}:{d%60:05.2f}   {d:.1f}s   -> {final}')
    speech = sum(dur(f'{OUT}/cue{c["n"]:03d}.wav') for c in cues)
    print(f'speech     {speech:.1f}s · silence {d - speech:.1f}s '
          f'({(d - speech) / d * 100:.0f}%)')
    words = sum(len(c['tts'].split()) for c in cues)
    print(f'rate       {words / speech * 60:.0f} wpm over {words} words')
    return d


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    cues = json.load(open(CUES))
    args = sys.argv[1:]

    if '--list' in args:
        for c in cues:
            p = f'{OUT}/cue{c["n"]:03d}.wav'
            have = f'{dur(p):5.1f}s' if os.path.exists(p) else '    - '
            print(f'  {c["n"]:3d} {have} {c["who"]:15} {c["voice"]:11} {c["tts"][:52]}')
        sys.exit(0)

    if '--assemble' not in args:
        pick = [int(a) for a in args if a.isdigit()]
        todo = ([c for c in cues if c['n'] in pick] if pick else
                [c for c in cues if not os.path.exists(f'{OUT}/cue{c["n"]:03d}.wav')])
        if todo:
            print(f'rendering {len(todo)} cue(s) on {WORKERS} workers, model {MODEL}\n')
            bad = 0
            with cf.ThreadPoolExecutor(max_workers=WORKERS) as ex:
                for r in ex.map(say, todo):
                    print(r)
                    bad += not r.startswith('ok')
            if bad:
                sys.exit(f'\n{bad} cue(s) failed — fix those before assembling')
        else:
            print('all cues already rendered')

    assemble(cues)

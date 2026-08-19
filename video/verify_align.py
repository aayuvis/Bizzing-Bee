#!/usr/bin/env python3
"""verify_align.py — prove words.json is right by listening to the audio at its timestamps.

    python3 verify_align.py

align.py derives word times from silence structure rather than from a speech model, so its
output is *plausible* by construction — which is exactly the kind of result that deserves an
independent check rather than a nod. This cuts a short clip at a sample of computed cue
times, asks Gemini to transcribe each one blind, and reports whether the words we expected
to be starting there actually are.

A pass here is what licenses scenes.js to trust `cue:` for the whole film.
"""
import base64, json, os, re, ssl, subprocess, sys, urllib.request
import concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
VO   = os.path.join(HERE, 'vo', 'bizzing-vo-ep1-despina.mp3')
FF   = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
KEY  = open('/root/.gkey').read().strip()
CTX  = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
TMP  = os.environ.get('SCRATCH', '/tmp')

words = json.load(open(os.path.join(HERE, 'words.json')))
norm  = lambda s: re.sub(r'[^a-z0-9 ]', ' ', s.lower()).split()


def clip(t, dur=4.0):
    p = f'{TMP}/vfy_{t:.2f}.mp3'
    subprocess.run([FF, '-y', '-loglevel', 'error', '-ss', str(max(0, t - 0.10)),
                    '-t', str(dur), '-i', VO, '-b:a', '64k', p], check=True)
    return p


def hear(t):
    p = clip(t)
    body = {'contents': [{'parts': [
        {'text': 'Transcribe this short audio clip verbatim. Output only the words spoken, '
                 'nothing else. If letters are being spelled out one at a time, write them '
                 'separated by spaces.'},
        {'inline_data': {'mime_type': 'audio/mp3',
                         'data': base64.b64encode(open(p, 'rb').read()).decode()}}]}]}
    req = urllib.request.Request(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',
        data=json.dumps(body).encode(),
        headers={'Content-Type': 'application/json', 'X-goog-api-key': KEY})
    try:
        with urllib.request.urlopen(req, timeout=180, context=CTX) as r:
            d = json.load(r)
        os.remove(p)
        return d['candidates'][0]['content']['parts'][0]['text'].strip()
    except Exception as e:
        return f'<error {type(e).__name__}: {e}>'


def expected(t, n=7):
    """The n words words.json says start at or after t."""
    idx = next((i for i, w in enumerate(words) if w['t'] >= t - 0.01), 0)
    return ' '.join(w['w'] for w in words[idx:idx + n])


DIGIT = {'1908':'nineteen oh eight','1925':'nineteen twenty five','1926':'nineteen twenty six',
         '1927':'nineteen twenty seven','1928':'nineteen twenty eight','2011':'twenty eleven',
         '17th':'seventeenth','2':'two','500':'five hundred','1000':'a thousand'}

def check(t):
    """Does the audio at t START with the words words.json says start there?

    Position matters, not just presence: if the expected phrase turns up three words INTO
    the clip we are early, and if it is absent while later words are present we are late.
    Both are alignment errors and a set-membership test would score them identical."""
    want, got = expected(t), hear(t)
    a = norm(' '.join(DIGIT.get(w, w) for w in norm(want)))
    b = norm(' '.join(DIGIT.get(w, w) for w in norm(got)))
    if not a or not b:
        return t, want, got, -1
    # where in the heard stream does the expected opening appear?
    pos = next((i for i in range(len(b)) if b[i:i + 2] == a[:2]), None)
    if pos is None:
        pos = next((i for i in range(len(b)) if b[i] == a[0]), None)
    return t, want, got, (99 if pos is None else pos)


if __name__ == '__main__':
    # a spread of cues: section openings, mid-sentence beats, and the letter-spelling run
    SAMPLE = [float(x) for x in sys.argv[1:]] or [
        0.5, 32.1, 90.3, 168.0, 221.8, 253.1, 274.4, 285.1, 292.1, 336.8, 403.9, 465.5]
    print(f'checking {len(SAMPLE)} timestamps against the audio\n')
    ok = 0
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for t, want, got, hit in ex.map(check, SAMPLE):
            good = 0 <= hit <= 1
            ok += good
            tag = 'ON  ' if good else ('EARLY' if hit < 99 else 'LATE ')
            print(f"  {tag} t={t:7.2f}  (expected phrase starts at heard-word {hit})")
            print(f"        expected  {want}")
            print(f"        heard     {got[:110]}")
    print(f'\n{ok}/{len(SAMPLE)} timestamps land on the expected words')
    sys.exit(0 if ok >= len(SAMPLE) * 0.8 else 1)

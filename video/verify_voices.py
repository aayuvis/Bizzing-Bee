#!/usr/bin/env python3
"""verify_voices.py — do the character voices actually sound like the character?

    python3 verify_voices.py            check every character cue
    python3 verify_voices.py 7 50       check just those cues

Nobody in this pipeline can hear. So each rendered cue is played to a listening model that
is told NOTHING about who it is supposed to be, and asked to describe what it hears: apparent
gender, apparent age, accent, and tone. The description is then compared against what the
cue was cast as.

The point is that the check is BLIND. Ask "does this sound like Nehru?" and the model agrees
with you, because that is what models do. Ask "what accent is this?" and the answer is worth
something.

⚠️ THE LISTENER IS NOT DETERMINISTIC, and the fields are not equally trustworthy. The same
unchanged file was described as "serious, solemn" on one call and "serious, matter-of-fact"
on the next. Gender, accent and the words themselves have been stable across every re-run;
TONE has not. So tone is probed THREE times and a ban only counts if it appears in at least
two of them — and even then it is a WARNING, not a failure. The hard failures are the ones
that are reproducible.

⚠️ A listening model will confabulate over near-silence — episode one had it report a rooster
and birdsong in windows measuring -inf dBFS. So the level is measured first, from the file,
and a cue that is effectively silent is failed on the measurement without asking the model
anything.
"""
import json, os, re, subprocess, sys, base64, urllib.request
import concurrent.futures as cf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'vo2')
KEY = open(os.environ.get('GKEY_FILE', '/root/.gkey')).read().strip()
MODEL = os.environ.get('LISTEN_MODEL', 'gemini-3.6-flash')
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'

ASK = ("Listen to this short audio clip of a person speaking. Describe ONLY what you actually "
       "hear, in this exact format and nothing else:\n"
       "GENDER: <male|female|unclear>\n"
       "AGE: <child|teenager|young adult|middle-aged|elderly|unclear>\n"
       "ACCENT: <a few words, e.g. General American, British RP, Indian, Eastern European>\n"
       "TONE: <a few words>\n"
       "WORDS: <exactly what is said>\n"
       "Do not guess who the speaker is. Do not flatter. If something is unclear, say unclear.")

# What each cue was cast as: (gender, acceptable ages, acceptable accents, FORBIDDEN tones).
#
# The forbidden-tone column exists because the first pass came back with King and Čapek both
# described as "solemn" and "grave" — two lines whose entire job is to be thrown away. Gender
# and accent were right and the check passed them, which is how a film ends up with a
# comedian delivering a eulogy. A voice can be cast correctly and acted wrongly.
EXPECT = {
 'LINCOLN':         ('male',   ('middle-aged', 'elderly'),            ('american',), ()),
 'EDWARD EVERETT':  ('male',   ('middle-aged', 'elderly'),            ('american', 'british', 'rp', 'transatlantic'), ('angry', 'bitter')),
  # 'serious' is NOT banned here: deadpan is the correct delivery for a dry one-liner, and
 # a comedian saying a joke straight is doing it right. 'theatrical' is the real defect.
 'STEPHEN KING':    ('male',   ('middle-aged', 'elderly', 'young adult'), ('american',), ('solemn', 'grave', 'reverent', 'dramatic', 'theatrical')),
 'JOSEF ČAPEK':     ('male',   ('young adult', 'middle-aged', 'elderly'), (), ('solemn', 'grave', 'serious', 'dramatic', 'reverent', 'portentous')),
 'YOUNG DOUGLASS':  ('male',   ('child', 'teenager', 'young adult'),   (), ('solemn', 'grave', 'sad')),
 'NEHRU':           ('male',   ('middle-aged', 'elderly'),            ('indian', 'south asian'), ('casual', 'bored')),
 'MAHALIA JACKSON': ('female', ('middle-aged', 'young adult', 'elderly'), ('american',), ('angry', 'flat', 'bored')),
}


def level(path):
    """mean/max dBFS straight from the file — the part that cannot be hallucinated."""
    err = subprocess.run([FF, '-i', path, '-af', 'volumedetect', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    g = lambda k: float(m.group(1)) if (m := re.search(rf'{k}: (-?[\d.]+) dB', err)) else float('-inf')
    return g('mean_volume'), g('max_volume')


def listen(path):
    body = {'contents': [{'parts': [
        {'text': ASK},
        {'inlineData': {'mimeType': 'audio/wav', 'data': base64.b64encode(open(path, 'rb').read()).decode()}}]}]}
    req = urllib.request.Request(
        f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent',
        data=json.dumps(body).encode(),
        headers={'x-goog-api-key': KEY, 'Content-Type': 'application/json'})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=180))
        return r['candidates'][0]['content']['parts'][0]['text'].strip()
    except Exception as e:
        return f'LISTEN FAILED: {type(e).__name__}: {e}'


def field(txt, k):
    m = re.search(rf'^{k}:\s*(.+)$', txt, re.M | re.I)
    return m.group(1).strip().lower() if m else ''


def check(cue):
    path = f'{OUT}/cue{cue["n"]:03d}.wav'
    if not os.path.exists(path):
        return cue, 'NOT RENDERED', ['not rendered'], [], ''
    mean, peak = level(path)
    if peak < -45:
        return cue, f'SILENT (peak {peak:.1f} dBFS)', ['no audio to judge'], [], ''
    heard = listen(path)
    want_g, want_age, want_acc, ban_tone = EXPECT[cue['who']]
    g, age, acc, tone, words = (field(heard, k) for k in ('GENDER', 'AGE', 'ACCENT', 'TONE', 'WORDS'))
    bad, warn = [], []
    # Exact word match, NOT substring: "male" is a substring of "female", so a substring
    # test silently passes every female voice cast as male. It did — Umbriel read female and
    # the check waved it through.
    if want_g not in re.findall(r'[a-z]+', g):
        bad.append(f'gender: wanted {want_g}, heard "{g}"')
    if want_age and not any(a in age for a in want_age):
        bad.append(f'age: wanted one of {want_age}, heard "{age}"')
    if want_acc and not any(a in acc for a in want_acc):
        bad.append(f'accent: wanted one of {want_acc}, heard "{acc}"')
    if ban_tone:
        tones = [tone] + [field(listen(path), 'TONE') for _ in range(2)]
        hit = [b for b in ban_tone if sum(b in t for t in tones) >= 2]
        if hit:
            warn.append(f'tone: {hit} in 2 of 3 listens — heard {tones}')
    # the line must actually be the line
    said = re.sub(r'[^a-z ]', '', words.lower()).split()
    meant = re.sub(r'[^a-z ]', '', cue['tts'].lower()).split()
    if said and meant and said[:len(meant)] != meant and meant[:len(said)] != said:
        bad.append(f'words differ: said "{" ".join(said[:12])}"')
    return cue, f'mean {mean:.1f} peak {peak:.1f} dBFS', bad, warn, heard


if __name__ == '__main__':
    cues = [c for c in json.load(open(os.path.join(HERE, 'cues2.json'))) if c['who'] != 'NARRATOR']
    pick = [int(a) for a in sys.argv[1:] if a.isdigit()]
    if pick:
        cues = [c for c in cues if c['n'] in pick]
    fails = warns = 0
    with cf.ThreadPoolExecutor(max_workers=4) as ex:
        for cue, lvl, bad, warn, heard in ex.map(check, cues):
            mark = 'FAIL' if bad else ('warn' if warn else 'ok  ')
            fails += bool(bad); warns += bool(warn)
            print(f'{mark} {cue["n"]:3d} {cue["who"]:16} {cue["voice"]:13} {lvl}')
            for line in heard.splitlines():
                if line.strip():
                    print(f'          {line.strip()}')
            for b in bad:
                print(f'       ->  FAIL {b}')
            for w in warn:
                print(f'       ->  warn {w}')
            print()
    print(f'{len(cues) - fails}/{len(cues)} pass the reproducible checks '
          f'(gender, accent, words){f" · {warns} tone warning(s)" if warns else ""}')
    sys.exit(1 if fails else 0)

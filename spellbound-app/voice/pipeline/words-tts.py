#!/usr/bin/env python3
"""Generate word clips for served words that have none, in the library's voice.

The served corpus grew from 40,944 to 55,000 when the difficulty bands were
recalibrated, and 2,055 of the words promoted into it have no recording. This
fills exactly those, using the SAME settings as the rest of the library so a
child cannot hear the join: en-US-Neural2-F at speakingRate 0.95, MP3. Any drift
in voice, rate or encoding is audible across a drill and is the whole reason
these constants are pinned here rather than passed in.

    TTS_KEY_FILE=/root/.tts-key python3 voice/pipeline/words-tts.py

AUTH, and the trap that costs an hour: an API key DOES work against Cloud TTS,
but only one whose project has the Cloud Text-to-Speech API enabled. A key
without it returns 401 with "API keys are not supported by this API", which
reads as a blanket refusal of key auth and is not — it is that project saying
no. /root/.gkey is the Gemini image key and fails exactly this way. The key is
never printed and never written into any output.

After a run: the new keys are appended to voice-words.js (SB_WVOICE), the words
are added to SB_VOICE_REVIEW so a grown-up can audition them in the Word Voice
Tester, and SB_VOICE_VER is bumped. Clips belong on `main`, not on gh-pages —
voice-cdn.js rewrites the URL for the hosted build.
"""
import base64, json, os, re, ssl, sys, time, urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
APP = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(APP, 'voice', 'w')
TODO = os.environ.get('TTS_TODO', os.path.join(HERE, 'voice-todo.json'))

VOICE = 'en-US-Neural2-F'     # the word library's voice — keep in lock-step
RATE = 0.95                   # and its rate; 1.0 only for ultra-short words
LANG = 'en-US'
CTX = ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt') \
    if os.path.exists('/root/.ccr/ca-bundle.crt') else None

slug = lambda w: re.sub(r'[^a-z0-9]', '-', str(w).lower())


def synth(text, key, rate):
    body = json.dumps({
        'input': {'text': text},
        'voice': {'languageCode': LANG, 'name': VOICE},
        'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': rate},
    }).encode()
    req = urllib.request.Request(
        'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + key,
        data=body, headers={'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, context=CTX, timeout=90) as r:
                return base64.b64decode(json.load(r)['audioContent'])
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 503) and attempt < 3:
                time.sleep(2 ** attempt)
                continue
            raise SystemExit('HTTP %s from Cloud TTS' % e.code)   # never echo the key
        except Exception:
            if attempt < 3:
                time.sleep(2 ** attempt)
                continue
            raise


def main():
    kf = os.environ.get('TTS_KEY_FILE', '/root/.tts-key')
    key = open(kf).read().strip() if os.path.exists(kf) else ''
    if not key:
        sys.exit('no key — set TTS_KEY_FILE to a file holding a Google API key '
                 'whose project has the Cloud Text-to-Speech API enabled')
    todo = json.load(open(TODO, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    done, skipped, made = [], 0, 0
    for i, item in enumerate(todo, 1):
        w = item['w'] if isinstance(item, dict) else item
        k = slug(w)
        path = os.path.join(OUT, k + '.mp3')
        if os.path.exists(path) and os.path.getsize(path) > 512:
            skipped += 1
            done.append(k)
            continue
        # an ultra-short word is clipped by the leading silence trim at 0.95
        rate = 1.0 if len(str(w)) <= 3 else RATE
        audio = synth(str(w), key, rate)
        if len(audio) < 512:
            print('  short audio, skipping %s' % w)
            continue
        open(path, 'wb').write(audio)
        done.append(k)
        made += 1
        if made % 50 == 0:
            print('  %d/%d  (%d new, %d already there)' % (i, len(todo), made, skipped), flush=True)
    print('done: %d new clips, %d already present' % (made, skipped))
    json.dump(sorted(set(done)), open(os.path.join(HERE, 'voice-new-keys.json'), 'w'))
    print('wrote voice-new-keys.json — now:')
    print('  1. append these keys to SB_WVOICE in voice-words.js')
    print('  2. add the words to SB_VOICE_REVIEW in voice-review.js')
    print('  3. bump SB_VOICE_VER')
    print('  4. commit voice/w/*.mp3 to main (NOT gh-pages)')


if __name__ == '__main__':
    main()

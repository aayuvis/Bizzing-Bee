#!/usr/bin/env python3
"""Record the Mock Bee announcer in the word library's own voice.

WHY THIS IS ONLY 41 CLIPS
  The announcer holds 41 distinct sentences across 24 pools. It used to be 78,
  and every placeholder multiplied them: "Number {n}, {name}. {age}, and {tell}."
  is ten spellers by eleven draw numbers — a hundred and ten recordings for one
  sentence, and 827 for the set. Two decisions killed that:

    - {name} was moved to a sentence BOUNDARY in every line, and the speller's
      name is spoken live by the device voice (speakName() in mockbee.js). It is
      the only part that genuinely cannot be pre-recorded.
    - The pools were cut to two lines each. A bee announcer repeats himself, and
      a child hears these many times.

  So each sentence is recorded ONCE, with its placeholders left as a short
  device-spoken gap or simply dropped from the recorded phrasing.

THE VOICE
  en-US-Neural2-F at speakingRate 0.95 — identical to the word library (see the
  GOOGLE TTS MIGRATION note in voice-review.js). The announcer and the pronouncer
  are then the same person, which is what a real hall sounds like. Do not change
  the voice or the rate without regenerating the 41k word clips to match.

  0.95 is deliberately not slower. It is the pace the whole library already
  trains on; dropping to 0.8 for "clarity" makes a child wait through every line
  and they stop listening, which is worse for comprehension than the words being
  a shade quicker.

CREDENTIALS
  Google Cloud Text-to-Speech does NOT accept API keys — it returns
  401 UNAUTHENTICATED with "API keys are not supported by this API". It needs a
  service account:

      export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
      pip install google-cloud-texttospeech
      python3 voice/pipeline/announcer-tts.py

  The Gemini key at /root/.gkey is for the Generative Language API and will not
  work here. If you only have that, the fallback is Gemini's own TTS models, but
  they are a DIFFERENT voice from the word library and the mismatch is audible —
  better to leave the announcer on screen than to give him a second voice.

OUTPUT
  voice/ann/<pool>-<i>.mp3, plus voice/ann/manifest.json mapping each pool index
  to its file and duration. mockbee.js should fall back to the on-screen text
  whenever a clip is missing, so a partial run is safe to ship.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MOCKBEE = os.path.join(ROOT, 'mockbee.js')
OUT = os.path.join(ROOT, 'voice', 'ann')

VOICE = 'en-US-Neural2-F'      # the word library's voice — keep in lock-step
RATE = 0.95                    # the word library's rate — see the docstring


def pools():
    """Read SAY out of mockbee.js rather than keeping a second copy of it.

    A duplicated list of lines would drift the first time somebody edits the
    announcer, and the drift is silent: the clip would simply be of a sentence
    that is no longer on screen.
    """
    src = open(MOCKBEE, encoding='utf-8').read()
    i = src.index('const SAY = {')
    j = src.index('\n  };', i)
    body = src[i:j]
    out, cur = {}, None
    for line in body.split('\n'):
        m = re.match(r'^\s{4}(\w+):\s*\[', line)
        if m:
            cur = m.group(1); out[cur] = []
        if cur:
            for q in re.findall(r"'((?:[^'\\]|\\.)*)'", line):
                t = q.replace("\\'", "'").strip()
                if len(t) > 6:
                    out[cur].append(t)
    return {k: list(dict.fromkeys(v)) for k, v in out.items() if v}


def spoken(text):
    """What the announcer actually says, or None if the line cannot be recorded.

    {name} is spoken live by the device, so it is dropped from the recording and
    the sentence starts or ends on the pause where the name goes — which is why
    every {name} sits at a boundary.

    NOT EVERY LINE SURVIVES THAT, and the script must say so rather than record
    the wreckage. A dry run against the live pools produced:

        "{name} — {age}, and {tell}."  ->  "and ."
        "{round}. {line}"              ->  "."

    Those are almost entirely placeholder: the age, the tell and the round name
    all vary, and with the name gone there is no sentence left. They stay on
    screen, where they read perfectly well. A line is returned only if enough
    real words survive to be worth a clip.

    {word} is a special case in the other direction: it is dropped and the
    sentence ends where the word goes, because the app already owns a clip of
    every one of the 41,000 words in the pronouncer's voice. "No. The word was"
    followed by necklace.mp3 is better than any recording could be.
    """
    t = text.strip()
    # No dynamic part at all — record it exactly as written, however short.
    # "Correct." and "Five left." are two of the most-heard lines in the bee.
    if '{' not in t:
        return t

    # Otherwise the dynamic parts must sit at the EDGES. A placeholder in the
    # middle leaves a hole in the middle of the audio — "You have drawn number
    # ___ . Remember it" — and no amount of splicing makes that sound like a
    # person. Those lines stay on screen, which costs nothing: they are already
    # rendered there.
    head = re.match(r'^(\{\w+\}\s*[—,:.-]?\s*)+', t)
    tail = re.search(r'(\s*[—,:.-]?\s*\{\w+\}\s*\.?\s*)+$', t)
    body = t[head.end() if head else 0: tail.start() if tail else len(t)]
    if '{' in body:
        return None

    body = re.sub(r'\s{2,}', ' ', body).strip(' ,;:—-')
    words = re.findall(r"[A-Za-z']+", body)
    # a two-word remainder is a fragment, not a line the announcer can say
    return body if len(words) >= 3 else None


def main():
    try:
        from google.cloud import texttospeech
    except ImportError:
        sys.exit('pip install google-cloud-texttospeech  (and set '
                 'GOOGLE_APPLICATION_CREDENTIALS to a service account json)')
    if not os.environ.get('GOOGLE_APPLICATION_CREDENTIALS'):
        sys.exit('GOOGLE_APPLICATION_CREDENTIALS is unset — Cloud TTS will not '
                 'accept an API key. See the docstring.')

    os.makedirs(OUT, exist_ok=True)
    client = texttospeech.TextToSpeechClient()
    voice = texttospeech.VoiceSelectionParams(language_code='en-US', name=VOICE)
    cfg = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3, speaking_rate=RATE)

    P = pools()
    total = sum(len(v) for v in P.values())
    print(f'{total} sentences across {len(P)} pools, voice {VOICE} at {RATE}x')
    manifest, n = {}, 0
    for pool, lines in P.items():
        manifest[pool] = []
        for idx, line in enumerate(lines):
            say = spoken(line)
            if not say:
                manifest[pool].append(None); continue
            name = f'{pool}-{idx}.mp3'
            path = os.path.join(OUT, name)
            if not os.path.exists(path):
                r = client.synthesize_speech(
                    input=texttospeech.SynthesisInput(text=say),
                    voice=voice, audio_config=cfg)
                open(path, 'wb').write(r.audio_content)
            n += 1
            manifest[pool].append({'f': name, 'say': say})
            print(f'  [{n}/{total}] {pool}-{idx}  {say[:56]}')
    json.dump(manifest, open(os.path.join(OUT, 'manifest.json'), 'w'),
              ensure_ascii=False, indent=1)
    kb = sum(os.path.getsize(os.path.join(OUT, f))
             for f in os.listdir(OUT) if f.endswith('.mp3')) // 1024
    print(f'done — {n} clips, {kb}KB in voice/ann/')


if __name__ == '__main__':
    main()

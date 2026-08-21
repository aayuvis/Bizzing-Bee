#!/usr/bin/env python3
"""prep2.py — episode-2 script .md -> cues2.json, ready for multi-voice TTS.

    python3 prep2.py

Episode one had one voice, so `prep.py` only had to split the script into sections. This
episode has eight: the narrator, and seven people who get a line of their own. So the unit
here is a CUE, not a section — a run of narration, or one character's line — and every cue
carries the voice and the direction it will be rendered with.

A character cue is a line in the script beginning `**SPEAKER:**`. Everything else is the
narrator. That is deliberately the only marker: the script stays readable as a script, and
there is no second list of who-says-what to drift out of step with it.

Three preprocessing rules carried over from episode one, all learned the hard way:
  - years become words, or the model reads 1863 as a cardinal number
  - spelled-out letters become separate tokens (`L. S. F. A.`), or the dashes are read as
    pauses inside one mangled word — fatal in a film about spelling
  - stage directions and markdown never reach the model
"""
import re, json, os, sys

SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ep-four-letters-on-a-plank.md')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cues2.json')

# The narrator's direction is byte-identical to episode one's, because it is the same
# narrator and the same series. Do not "improve" it — the voice was chosen on this text.
NARRATOR = dict(voice='Despina', style=(
    "Speak at a natural, brisk conversational pace, like a great storyteller talking to a "
    "friend. Warm, confident, engaging. Keep it moving. Do NOT slow down, do NOT add long "
    "dramatic pauses, do NOT sound solemn or ponderous."))

# One entry per character. `voice` sets the timbre, `style` does the acting — and the style
# prompt is where nearly all the character actually lives, so each one names the person, the
# room, and the feeling, and forbids the failure mode that voice is prone to.
#
# `pad` is the silence in seconds placed before and after the cue at assembly. A quoted voice
# needs air around it or it reads as the narrator putting on an accent.
CAST = {
 'LINCOLN': dict(voice='Charon', pad=(0.45, 0.55), style=(
    "You are an older American man in 1863 with a high, plain, carrying voice, speaking four "
    "words of a speech you have rewritten many times. Grave and steady, but conversational, "
    "not thunderous. Let the three phrases land separately. Do NOT boom, do NOT sound like a "
    "movie trailer.")),
 'EDWARD EVERETT': dict(voice='Rasalgethi', pad=(0.40, 0.55), style=(
    "You are a cultivated, elderly American gentleman of the 1860s, reading aloud a private "
    "letter you have just written to a man who outdid you. Formal, courteous, and quietly "
    "rueful — you are conceding something and you mean it. Unhurried but never solemn.")),
 'STEPHEN KING': dict(voice='Achird', pad=(0.35, 0.50), style=(
    "You are a friendly, fast-talking American writer making a wry aside to a room of "
    "students — a joke you have made a hundred times and still enjoy. Quick and light, with a "
    "half-smile in the voice, thrown away over your shoulder. Say it in under two and a half "
    "seconds. Do NOT slow down, do NOT be solemn, do NOT be theatrical, do NOT be grave, do "
    "NOT perform it.")),
 'JOSEF ČAPEK': dict(voice='Algenib', pad=(0.35, 0.60), style=(
    "You are a Czech painter in 1920, absorbed in your painting, not looking up, muttering a "
    "single word over your shoulder because your brother asked you a question. Light, "
    "offhand, barely interested — you are already back at work. Do NOT announce it, do NOT be "
    "grave, do NOT be deep, do NOT be dramatic. It is a shrug, not a revelation.")),
 'YOUNG DOUGLASS': dict(voice='Puck', pad=(0.35, 0.45), style=(
    "You are a quick, cheeky twelve-year-old boy in a Baltimore street, daring another boy to "
    "prove he can write. Teasing and confident, because you know exactly what you are doing "
    "and he does not. Light and fast.")),
 'NEHRU': dict(voice='Orus', pad=(0.50, 0.65), style=(
    "You are an Indian statesman addressing a parliament in the last minute before midnight, "
    "on the night your country becomes independent. Measured, formal, precise English in an "
    "Indian voice. Deeply moved and entirely controlled. Do NOT rush, but do NOT drag.")),
 'MAHALIA JACKSON': dict(voice='Sulafat', pad=(0.35, 0.50), style=(
    "You are a warm African-American gospel singer standing behind a speaker on a platform, "
    "calling out to him over a huge crowd. Urgent, affectionate, encouraging — you are "
    "prompting a friend, not heckling. Raise your voice to carry. The word is THEM, meaning "
    "the crowd — not him.")),
}

SPEAKER = re.compile(r'^\*\*([A-ZČ][A-ZČ .]*[A-ZČ]):\*\*\s*(.*)$')

# Words the model gets wrong, respelled. "Martin" came back as "Marni" in a blind listening
# check — the kind of error that is inaudible to whoever wrote the line and obvious to
# everyone else. Add to this table rather than re-rolling and hoping.
PHON = {'Martin': 'Mar-tin'}

# Words the model keeps SUBSTITUTING rather than mispronouncing. Mahalia Jackson's line came
# back as "Tell HIM about the dream" three times across two voices — she was telling him to
# address the crowd, so "him" points at the wrong person entirely. Capitals read as emphasis.
EMPH = {'Tell them about': 'Tell THEM about'}

YEARS = {'1066':'ten sixty-six', '1772':'seventeen seventy-two',
         '1826':'eighteen twenty-six', '1818':'eighteen eighteen', '1819':'eighteen nineteen',
         '1845':'eighteen forty-five', '1863':'eighteen sixty-three', '1920':'nineteen twenty',
         '1947':'nineteen forty-seven', '1950':'nineteen fifty', '1963':'nineteen sixty-three',
         '2000':'two thousand'}


def spoken(t):
    """Text as it should be heard, not as it is written."""
    # Letters read one at a time: L, S, F, A stay as separate tokens with stops.
    t = re.sub(r'\b(?:[A-Z][–\-—]){2,}[A-Z]\b',
               lambda m: ' '.join(c + '.' for c in re.split(r'[–\-—]', m.group())), t)
    for k, v in YEARS.items():
        t = re.sub(r'\b' + k + r'\b', v, t)
    for k, v in PHON.items():
        t = re.sub(r'\b' + k + r'\b', v, t)
    for k, v in EMPH.items():
        t = t.replace(k, v)
    t = t.replace('—', ' — ')
    return re.sub(r'\s{2,}', ' ', t).strip()


def clean(t):
    """Strip everything that is notation rather than speech.

    The horizontal rules and the end-card marker are the ones that bite: strip the markdown
    first and they survive as plausible-looking one-word paragraphs, and the narrator says
    "BIZZING BEE CARD" out loud in the finished film. Drop them as whole lines, before the
    emphasis markers come off."""
    t = re.sub(r'^\s*\*{0,2}\[.*?\]\*{0,2}\s*$', '', t, flags=re.M)  # *[beat]*, **[CARD]**
    t = re.sub(r'^\s*-{3,}\s*$', '', t, flags=re.M)          # --- section rules
    t = re.sub(r'^\s*>\s?', '', t, flags=re.M)               # blockquote markers
    t = re.sub(r'\*\*|\*|_|`', '', t)
    return t


def build():
    # End the script at the NEXT top-level heading, whatever it is called. Splitting on a
    # named section ('## LENGTH') silently swallowed the production notes into the narration
    # when the next draft renamed that heading — 261 words of table and commentary would
    # have been read aloud.
    body = open(SRC).read().split('## SCRIPT', 1)[1]
    body = re.split(r'^## ', body, maxsplit=1, flags=re.M)[0]
    parts = re.split(r'\*\*\[(\d+:\d+)\s*—\s*([^\]]+)\]\*\*', body)
    cues, n = [], 0
    for i in range(1, len(parts), 3):
        ts, label, text = parts[i], parts[i + 1].strip(), parts[i + 2]
        if label == 'BIZZING BEE CARD':
            continue
        buf = []
        def flush():
            """One cue per PARAGRAPH, not per section.

            Episode one rendered a whole section per call, which meant a single fluffed
            sentence cost the whole section. A paragraph is the smallest unit that still
            carries its own intonation, so a bad one is re-rendered on its own — and it keeps
            every request short, which the model is more reliable on."""
            nonlocal buf, n
            block = clean('\n'.join(buf)).strip()
            buf = []
            for para in re.split(r'\n\s*\n', block):
                t = ' '.join(para.split())
                if not t:
                    continue
                cues.append(dict(n=n, sec=label, ts=ts, who='NARRATOR', voice=NARRATOR['voice'],
                                 style=NARRATOR['style'], pad=[0.0, 0.0],
                                 text=t, tts=spoken(t)))
                n += 1
        for line in text.split('\n'):
            m = SPEAKER.match(line.strip())
            if m:
                flush()
                who, first = m.group(1), m.group(2)
                # a character line may wrap onto following non-blank lines
                cues.append(dict(n=n, sec=label, ts=ts, who=who, _first=first))
                n += 1
            elif cues and '_first' in cues[-1] and line.strip() and not buf:
                cues[-1]['_first'] += ' ' + line.strip()
            else:
                buf.append(line)
        flush()

    for c in cues:
        if '_first' in c:
            who = c['who']
            if who not in CAST:
                sys.exit(f"FAIL: no cast entry for {who!r} — add one to CAST or fix the script")
            t = clean(c.pop('_first')).strip()
            c.update(voice=CAST[who]['voice'], style=CAST[who]['style'],
                     pad=list(CAST[who]['pad']), text=t, tts=spoken(t))
    return cues


if __name__ == '__main__':
    cues = build()
    # A year the YEARS table does not know reaches the model as digits, and the model reads
    # it as a cardinal number ("one thousand eight hundred and twenty-six"). Silent, and
    # obvious the moment anyone hears it. Fail here instead.
    stray = sorted({y for c in cues for y in re.findall(r'\b\d{3,4}\b', c['tts'])})
    if stray:
        sys.exit(f"FAIL: {stray} not in YEARS — add them or they will be read as numbers")
    json.dump(cues, open(OUT, 'w'), indent=1, ensure_ascii=False)
    words = sum(len(c['tts'].split()) for c in cues)
    chars = [c for c in cues if c['who'] != 'NARRATOR']
    print(f"{len(cues)} cues · {words} words (~{words/152:.1f} min) · "
          f"{len(chars)} character lines across {len({c['who'] for c in chars})} voices\n")
    sec = None
    for c in cues:
        if c['sec'] != sec:
            sec = c['sec']; print(f"  [{c['ts']}] {sec}")
        tag = '' if c['who'] == 'NARRATOR' else f"  <{c['voice']}>"
        print(f"    {c['n']:3d} {c['who']:16} {len(c['tts'].split()):4}w{tag}")
    missing = {c['who'] for c in chars} - set(CAST)
    print("\nunused cast entries:", sorted(set(CAST) - {c['who'] for c in chars}) or 'none')
    if missing:
        sys.exit(f"FAIL: {missing}")

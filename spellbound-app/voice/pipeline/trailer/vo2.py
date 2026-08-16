#!/usr/bin/env python3
"""Episode 1 commentary — am_adam, energetic let's-play register."""
from kokoro_onnx import Kokoro
import soundfile as sf
k = Kokoro('/tmp/kokoro-v1.0.int8.onnx', '/tmp/voices-v1.0.bin')
LINES = [
 ('c1',  "Last lap of the Grand Prix. Champ words. And I am one letter away from disaster."),
 ('s1',  "Welcome back! Today — the Bee Grand Prix, on champ difficulty. The hardest words in the game."),
 ('s2',  "One rule. If we drop to last place... we restart. Everything."),
 ('go',  "Three... two... one... GO!"),
 ('oil', "Clean start, looking good — oh! Oil! We're slipping!"),
 ('cop', "No. No no no. A cop? In a kart race?! We're getting pulled over!"),
 ('last',"And just like that... dead last. One more mistake, and it's over."),
 ('g1a', "First word box. We need this. Listen close."),
 ('g1b', "Antidromous?! Okay. Okay. A. N. T. I... come on, fingers."),
 ('g1c', "Got it! Turbo! Punch it!"),
 ('mid', "Fourth... third... the Smudge is right there."),
 ('g2a', "Another box — and it's a monster. Retroduction."),
 ('g2b', "Retro... d... wait. Is it E? ... No. U! It's U!"),
 ('g2c', "Yes! Rocket boost! Hold on!"),
 ('cl',  "Final stretch — there's the flag — come on, come on, come on!"),
 ('fin', "Photo finish! Did we get it?!"),
 ('rep', "Look at this. Look at this! By half a kart. Spelling wins races, people."),
 ('res', "P one. New record. On champ."),
 ('out', "Episode two — the Neon City. At night. Think you can beat my time? The game's free at bizzing bee dot com. See you on the track!"),
]
for n,t in LINES:
    s,sr=k.create(t,voice='am_adam',speed=1.06,lang='en-us')
    sf.write(f'/tmp/vid/e_{n}.wav',s,sr)
    print(n, round(len(s)/sr,2))

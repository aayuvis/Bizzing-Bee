#!/usr/bin/env python3
"""Trailer voice-over with Kokoro (af_heart — the app's own warm word-voice register)."""
from kokoro_onnx import Kokoro
import soundfile as sf

k = Kokoro('/tmp/kokoro-v1.0.int8.onnx', '/tmp/voices-v1.0.bin')
LINES = [
    ('v1', "This is Bee Grand Prix. A real kart racer — where the fuel... is spelling."),
    ('v2', "Pick your hero. Pick your kart. Pick your world."),
    ('v3', "Then race the rivals — dodge the oil, and mind the cops!"),
    ('v4a', "Hit a mystery box, and the race holds its breath. Spell the word you hear..."),
    ('v4b', "...and the power-up is yours. Rocket boost!"),
    ('v5', "Race the sunset canyon. Race the neon city."),
    ('v6', "First to the flag! And every single win is real spelling, mastered."),
    ('v7', "Bee Grand Prix is part of Bizzing Bee — eight arcade games, a mock spelling bee, and a forty thousand word library. No ads. Built for kids. Free to play."),
    ('v8', "Bizzing Bee. Where champions learn to spell."),
]
for name, text in LINES:
    samples, sr = k.create(text, voice='af_heart', speed=1.0, lang='en-us')
    sf.write(f'/tmp/vid/{name}.wav', samples, sr)
    print(name, round(len(samples)/sr, 2), 's')

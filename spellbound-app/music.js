/* music.js — Bizzing Bee's music, composed in code (FAMILY-STANDARD §11, FIX-BEE v2).

   Ten seamless loops: one for Home, one for the games, and one for each of the eight worlds.
   Nothing here is an audio file and nothing is random at play time: every loop is WRITTEN out
   below as a tempo, a key, a chord progression, a bass pattern and two melodic motifs, then
   rendered by WebAudio. The same loop plays the same notes every time, the way a recording
   would — the old world bed was a random walk, which is noise that happens to be in key.

   The rules it keeps (and tests/music.cjs checks each one):
   • lazy — this file is not in the first load; boot-lazy fetches it after the first tap.
   • 60–90 s loops, scheduled bar by bar, so the join is seamless (no gap, no click).
   • level = the ONE volume in Settings (SB_VOL, default 40%); Music is its own switch.
   • it ducks under every word, sentence and sound effect (SB_VOL.duck) and comes back up.
   • it pauses when the tab is hidden, and is off in Calm mode and on the working screens.
   Credits: music/CREDITS.md — composed in code for Bizzing, no third-party recordings. */
(function () {
  'use strict';
  var AC = null, bus = null, duckG = null, verbIn = null;
  var cur = null, startAt = 0, nextBar = 0, timer = null, fadeG = null;
  var BASE = 0.3;                 // music bus at volume 100%; the default 40% gives 0.12

  /* ---------------------------------------------------------------- the score
     sc: scale steps from the root. prog: one chord per bar as a scale DEGREE (0 = tonic), 8 bars,
     played A A B A over 32 bars. bass: beats (in eighths, 0-7) on which the bass sounds. mA/mB:
     the two motifs, eight eighths each, as scale degrees above the chord root (null = rest).
     voice: lead / pad / bass oscillator types. kit: a light percussion pattern, or none. */
  var MAJ = [0, 2, 4, 5, 7, 9, 11], MIN = [0, 2, 3, 5, 7, 8, 10], DOR = [0, 2, 3, 5, 7, 9, 10],
      PENT = [0, 2, 4, 7, 9, 12, 14], MIXO = [0, 2, 4, 5, 7, 9, 10], LYD = [0, 2, 4, 6, 7, 9, 11];
  var SCORE = {
    home:       { bpm: 96, root: 60, sc: MAJ,  prog: [0, 4, 5, 3, 0, 4, 3, 4], bass: [0, 4], mA: [4, null, 2, 4, 5, 4, 2, null], mB: [7, 6, 4, null, 2, 4, 2, 0], voice: ['triangle', 'sine', 'sine'], kit: 'soft' },
    games:      { bpm: 112, root: 62, sc: MIXO, prog: [0, 6, 3, 0, 4, 3, 6, 4], bass: [0, 3, 4, 6], mA: [0, 2, 4, 2, 5, 4, 2, 4], mB: [7, null, 6, 4, 5, null, 4, 2], voice: ['square', 'triangle', 'triangle'], kit: 'drive' },
    spellbound: { bpm: 100, root: 64, sc: PENT, prog: [0, 3, 4, 0, 5, 3, 4, 4], bass: [0, 4], mA: [2, 3, 4, null, 3, 2, 0, null], mB: [4, null, 5, 4, 3, 2, 3, null], voice: ['triangle', 'sine', 'sine'], kit: 'soft' },
    aurora:     { bpm: 88, root: 69, sc: LYD,  prog: [0, 1, 0, 5, 3, 1, 4, 0], bass: [0], mA: [4, null, null, 6, null, null, 7, null], mB: [9, null, 7, null, 6, null, 4, null], voice: ['sine', 'sine', 'sine'], kit: null },
    anime:      { bpm: 92, root: 64, sc: [0, 2, 3, 7, 8, 12, 14], prog: [0, 0, 3, 4, 0, 0, 3, 1], bass: [0, 5], mA: [4, 3, 2, null, 3, 2, 0, null], mB: [5, null, 4, 3, 2, null, 3, null], voice: ['triangle', 'sine', 'sine'], kit: 'block' },
    science:    { bpm: 116, root: 67, sc: [0, 2, 4, 6, 7, 9, 11], prog: [0, 3, 1, 4, 0, 3, 5, 4], bass: [0, 2, 4, 6], mA: [0, 4, 2, 4, 1, 4, 2, 4], mB: [6, 4, 5, 3, 4, 2, 3, 1], voice: ['square', 'sine', 'triangle'], kit: 'tick' },
    avatar:     { bpm: 88, root: 62, sc: DOR,  prog: [0, 3, 0, 6, 0, 3, 4, 4], bass: [0, 6], mA: [4, null, 3, 2, null, 0, 2, null], mB: [7, null, 6, 4, null, 3, 4, null], voice: ['sine', 'sine', 'sine'], kit: null },
    godly:      { bpm: 88, root: 57, sc: MAJ,  prog: [0, 3, 4, 0, 5, 3, 1, 4], bass: [0], mA: [4, null, null, null, 2, null, 4, null], mB: [7, null, null, 5, null, null, 4, null], voice: ['sine', 'sine', 'sine'], kit: null },
    race:       { bpm: 126, root: 52, sc: MIXO, prog: [0, 0, 6, 6, 3, 3, 4, 4], bass: [0, 1, 2, 3, 4, 5, 6, 7], mA: [0, 0, 2, 4, 0, 0, 5, 4], mB: [7, 6, 4, 2, 4, 5, 4, 2], voice: ['sawtooth', 'triangle', 'sawtooth'], kit: 'drive' },
    dino:       { bpm: 88, root: 45, sc: MIN,  prog: [0, 5, 3, 4, 0, 5, 6, 4], bass: [0, 3, 4], mA: [4, null, 4, 2, 4, null, 5, null], mB: [7, null, 5, 4, 2, null, 0, null], voice: ['triangle', 'sine', 'sine'], kit: 'drums' }
  };
  var FORM = [0, 0, 1, 0];          // A A B A, eight bars each — 32 bars
  var midi = function (n) { return 440 * Math.pow(2, (n - 69) / 12); };
  var deg = function (sc, d) { var n = sc.length, o = Math.floor(d / n); return sc[((d % n) + n) % n] + 12 * o; };
  function loopSecs(id) { var S = SCORE[id]; return 32 * 4 * 60 / S.bpm; }

  function ensure() {
    var A = window.AudioContext || window.webkitAudioContext; if (!A) return false;
    if (!AC) {
      AC = new A();
      bus = AC.createGain(); bus.gain.value = 0;
      duckG = AC.createGain(); duckG.gain.value = 1;
      var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.Q.value = 0.3;
      /* a small room: two taps of feedback delay, mixed low — dry synth reads as a toy */
      verbIn = AC.createGain(); verbIn.gain.value = 0.22;
      var d1 = AC.createDelay(1), d2 = AC.createDelay(1), fb = AC.createGain(), wet = AC.createGain();
      d1.delayTime.value = 0.23; d2.delayTime.value = 0.37; fb.gain.value = 0.3; wet.gain.value = 0.5;
      verbIn.connect(d1); d1.connect(d2); d2.connect(fb); fb.connect(d1); d1.connect(wet); d2.connect(wet);
      wet.connect(bus); bus.connect(duckG); duckG.connect(lp); lp.connect(AC.destination);
    }
    if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    return true;
  }
  function level() { var v = 0; try { v = window.SB_VOL ? SB_VOL.level() : 0.4; } catch (e) {} return BASE * v; }

  function note(dest, f, at, dur, type, vol, atk, rel) {
    var o = AC.createOscillator(), g = AC.createGain();
    o.type = type; o.frequency.setValueAtTime(f, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.linearRampToValueAtTime(vol, at + (atk || 0.02));
    g.gain.setValueAtTime(vol, at + Math.max(atk || 0.02, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur + (rel || 0.25));
    o.connect(g); g.connect(dest);
    o.start(at); o.stop(at + dur + (rel || 0.25) + 0.05);
  }
  function noise(dest, at, dur, vol, hp) {
    var len = Math.max(1, Math.floor(AC.sampleRate * dur)), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0);
    var s = 1234567;   /* a fixed seed: the hat is the same hat every bar */
    for (var i = 0; i < len; i++) { s = (s * 16807) % 2147483647; d[i] = ((s / 2147483647) * 2 - 1) * (1 - i / len); }
    var src = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    src.buffer = buf; f.type = 'highpass'; f.frequency.value = hp || 6000; g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(dest); src.start(at);
  }

  /* one bar of the score, at time t */
  function bar(id, b, t, out) {
    var S = SCORE[id], beat = 60 / S.bpm, e8 = beat / 2;
    var sec = FORM[Math.floor(b / 8) % 4], chord = S.prog[b % 8] + (sec === 1 && b % 2 ? 1 : 0);
    var rootN = S.root + deg(S.sc, chord), lead = S.voice[0], pad = S.voice[1], bassV = S.voice[2];
    // pad: the chord's triad, held for the bar
    [0, 2, 4].forEach(function (k, i) { note(out, midi(S.root + deg(S.sc, chord + k) - 12), t + i * 0.012, beat * 3.7, pad, 0.05, 0.4, 0.6); });
    // bass
    S.bass.forEach(function (p) { note(out, midi(rootN - 24 + (p % 4 === 3 ? 7 : 0)), t + p * e8, e8 * 1.6, bassV, 0.085, 0.01, 0.12); });
    // lead: the section's motif over this chord; the last bar of each eight answers
    var m = sec === 1 ? S.mB : S.mA;
    m.forEach(function (d, i) { if (d == null) return; if (b % 8 === 7 && i > 4) return;
      note(out, midi(S.root + 12 + deg(S.sc, chord + d)), t + i * e8, e8 * (lead === 'square' || lead === 'sawtooth' ? 0.7 : 1.4), lead, lead === 'square' || lead === 'sawtooth' ? 0.022 : 0.045, 0.015, 0.3); });
    // a light kit
    if (S.kit === 'soft') { if (b % 2 === 1) noise(out, t + beat * 3.5, 0.06, 0.02); }
    else if (S.kit === 'drive') { for (var i = 0; i < 8; i++) noise(out, t + i * e8, 0.04, i % 2 ? 0.018 : 0.03); note(out, 55, t, 0.18, 'sine', 0.12, 0.005, 0.1); note(out, 55, t + beat * 2, 0.18, 'sine', 0.12, 0.005, 0.1); }
    else if (S.kit === 'drums') { note(out, 62, t, 0.3, 'sine', 0.14, 0.005, 0.2); note(out, 48, t + beat * 2.5, 0.35, 'sine', 0.12, 0.005, 0.2); }
    else if (S.kit === 'block') { [0, 3, 6].forEach(function (p) { note(out, midi(S.root + 31), t + p * e8, 0.05, 'triangle', 0.03, 0.002, 0.05); }); }
    else if (S.kit === 'tick') { for (var j = 0; j < 4; j++) noise(out, t + j * beat, 0.025, 0.018, 8000); }
  }

  function pump() {
    if (!AC || !cur) return;
    var S = SCORE[cur.id], barLen = 4 * 60 / S.bpm;
    while (cur.next < AC.currentTime + 1.2) { bar(cur.id, cur.bar % 32, cur.next, cur.out); cur.bar++; cur.next += barLen; }
  }
  function play(id) {
    if (!SCORE[id] || !ensure()) return;
    if (cur && cur.id === id) return;
    stop(0.6);
    var out = AC.createGain(); out.gain.setValueAtTime(0.0001, AC.currentTime); out.gain.linearRampToValueAtTime(1, AC.currentTime + 1.2); out.connect(bus); out.connect(verbIn);
    cur = { id: id, out: out, bar: 0, next: AC.currentTime + 0.12 };
    bus.gain.setTargetAtTime(level(), AC.currentTime, 0.1);
    pump(); if (!timer) timer = setInterval(pump, 200);
  }
  function stop(fade) {
    if (!cur) return; var c = cur; cur = null;
    try { c.out.gain.setTargetAtTime(0.0001, AC.currentTime, (fade || 0.3) / 3); setTimeout(function () { try { c.out.disconnect(); } catch (e) {} }, (fade || 0.3) * 1000 + 600); } catch (e) {}
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* which loop belongs on this screen — null is silence */
  var QUIET = { coach: 1, quest: 1, train: 1, levelup: 1, revisions: 1, explore: 1, concepts: 1, vocab: 1, typing: 1, figurative: 1,
    trivtrain: 1, journeys: 1, quotes: 1, themes: 1, ipatrain: 1, builder: 1, finder: 1, reader: 1, leveltest: 1, parent: 1, progress: 1, voicetest: 1 };
  var GAMES = { games: 1, mockbee: 1, trivia: 1, sq: 1 };
  function want() {
    try {
      if (typeof state === 'undefined' || !state || state.screen !== 'app') return null;
      if (document.visibilityState !== 'visible') return null;
      if (!window.SB_VOL || !SB_VOL.musicOn() || SB_VOL.level() <= 0) return null;
      if (state.calmMode || document.documentElement.classList.contains('w4-calm-forced')) return null;
      /* Focus the CHILD switched on is silence. Focus the app switches on by itself for the quiet
         screens (state._focusAuto) stills the backdrop; on the Atlas the world's loop still plays. */
      try { if (window.SB_W4_FOCUS && SB_W4_FOCUS.on() && !state._focusAuto) return null; } catch (e) {}
      if (document.querySelector('.arc-play,.bz-play')) return 'games';
      var n = state.nav || 'home';
      if (GAMES[n]) return 'games';
      if (n === 'home') return 'home';
      if (QUIET[n]) return null;
      return SCORE[state.theme] ? state.theme : 'spellbound';
    } catch (e) { return null; }
  }
  function sync() { var w = want(); if (!w) { stop(0.5); return; } play(w); try { if (bus) bus.gain.setTargetAtTime(level(), AC.currentTime, 0.15); } catch (e) {} }

  window.SB_MUSIC = {
    SCORE: SCORE, FORM: FORM, loopSecs: loopSecs, want: want,
    playing: function () { return cur ? cur.id : null; },
    sync: sync, stop: function () { stop(0.3); },
    level: function () { try { if (bus) bus.gain.setTargetAtTime(cur ? level() : 0, AC.currentTime, 0.1); } catch (e) {} },
    duck: function (ms) { try { if (!AC || !duckG) return; var t = AC.currentTime; duckG.gain.cancelScheduledValues(t);
      duckG.gain.setTargetAtTime(0.22, t, 0.04); duckG.gain.setTargetAtTime(1, t + (ms || 600) / 1000, 0.25); } catch (e) {} },
    /* tests read what one bar WOULD play, without a sound card */
    _bar: function (id, b) { var ev = []; var save = { note: note, noise: noise };
      note = function (d, f, at, dur, type, vol) { ev.push({ f: +f.toFixed(2), at: +at.toFixed(3), type: type }); };
      noise = function () { ev.push({ noise: 1 }); };
      try { bar(id, b, 0, null); } finally { note = save.note; noise = save.noise; } return ev; },
    ctx: function () { return AC; }
  };
  document.addEventListener('visibilitychange', function () {
    try { if (!AC) return; if (document.visibilityState !== 'visible') { stop(0.1); AC.suspend(); } else { AC.resume(); sync(); } } catch (e) {} });
  sync();
})();

/* ============================================================
   SAGA-MUSIC.js — procedural background music for the saga.
   Offline-first: generates gentle per-world ambient loops with
   the Web Audio API (no files, no CDN). Soft pad drone + sparse
   melodic arpeggio, filtered warm. Kid-calm, never busy.
   Public API (window.SAGA_MUSIC):
     start(worldLabel)  stop()  duck(on)  toggleMute()  isMuted()
   Muted state persists in localStorage 'sb_saga_music' ('off' = muted).
   ============================================================ */
(function () {
  var AC = null;
  function ctx() {
    try {
      if (typeof window.audioCtx === 'function') { var a = window.audioCtx(); if (a) return a; }
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
      return AC;
    } catch (e) { return null; }
  }

  // semitone → frequency from A4=440
  function hz(semi) { return 440 * Math.pow(2, (semi - 9) / 12); }
  // scale degrees expressed as semitone offsets from the mood root
  var SCALES = {
    majPent: [0, 2, 4, 7, 9, 12, 16],
    minPent: [0, 3, 5, 7, 10, 12, 15],
    lydian: [0, 2, 4, 6, 7, 11, 12, 14],
    minor: [0, 2, 3, 5, 7, 8, 10, 12],
    major: [0, 2, 4, 5, 7, 9, 11, 12]
  };
  // per-world mood: root semitone (rel A4=0), scale, note wave, tempo(ms/step), pad interval, brightness(Hz), warmth gain
  var MOODS = {
    meadow:   { root: -5, scale: 'majPent', wave: 'triangle', step: 620, cut: 1400, g: 1.0 },
    sky:      { root: 0,  scale: 'majPent', wave: 'sine',     step: 700, cut: 1600, g: 0.9 },
    opensky:  { root: 0,  scale: 'majPent', wave: 'sine',     step: 700, cut: 1600, g: 0.9 },
    hive:     { root: -3, scale: 'major',   wave: 'triangle', step: 560, cut: 1300, g: 1.0 },
    stage:    { root: -1, scale: 'major',   wave: 'triangle', step: 500, cut: 1800, g: 1.0 },
    carnival: { root: -1, scale: 'major',   wave: 'triangle', step: 480, cut: 1900, g: 1.0 },
    cosmos:   { root: 2,  scale: 'lydian',  wave: 'sine',     step: 820, cut: 1500, g: 0.85 },
    dojo:     { root: -5, scale: 'minPent', wave: 'triangle', step: 720, cut: 1100, g: 0.9 },
    lotus:    { root: -5, scale: 'minPent', wave: 'sine',     step: 760, cut: 1200, g: 0.85 },
    lab:      { root: 3,  scale: 'major',   wave: 'square',   step: 440, cut: 1700, g: 0.55 },
    arcade:   { root: 3,  scale: 'majPent', wave: 'square',   step: 400, cut: 1800, g: 0.5 },
    critter:  { root: -3, scale: 'majPent', wave: 'triangle', step: 600, cut: 1400, g: 0.95 },
    pond:     { root: -3, scale: 'majPent', wave: 'sine',     step: 680, cut: 1300, g: 0.95 },
    forest:   { root: -5, scale: 'majPent', wave: 'triangle', step: 640, cut: 1300, g: 0.95 },
    greysea:  { root: -7, scale: 'minor',   wave: 'sine',     step: 900, cut: 900,  g: 0.8 },
    engine:   { root: -7, scale: 'minor',   wave: 'triangle', step: 640, cut: 1000, g: 0.75 },
    junkyard: { root: -7, scale: 'minPent', wave: 'triangle', step: 560, cut: 1100, g: 0.75 },
    warfield: { root: -8, scale: 'minor',   wave: 'triangle', step: 600, cut: 1000, g: 0.75 },
    siren:    { root: -2, scale: 'minor',   wave: 'sine',     step: 820, cut: 1200, g: 0.85 },
    homecoming:{ root: -3, scale: 'major',  wave: 'triangle', step: 700, cut: 1500, g: 1.0 }
  };
  // CH_META.world label / plate id → mood key
  var LABEL = {
    'Meadow': 'meadow', 'Sky': 'sky', 'Long Sky': 'sky', 'Open Sky': 'opensky',
    'Hive': 'hive', 'Hive Gates': 'hive', 'Marquee': 'stage', 'Stage': 'stage',
    'Carnival': 'carnival', 'Galaxy': 'cosmos', 'Cosmos': 'cosmos', 'Dojo': 'dojo',
    'Lotus': 'lotus', 'Lab': 'lab', 'Arcade': 'arcade', 'Critter': 'critter',
    'Pond': 'pond', 'Forest': 'forest', 'Grey Sea': 'greysea', 'Engine': 'engine',
    'Junkyard': 'junkyard', 'Warfield': 'warfield', 'Siren': 'siren', 'Homecoming': 'homecoming'
  };
  function moodFor(world) {
    if (!world) return MOODS.meadow;
    var key = LABEL[world] || String(world).toLowerCase();
    return MOODS[key] || MOODS.meadow;
  }

  var master = null, pad = null, running = false, timer = null;
  var nextTime = 0, stepIdx = 0, mood = MOODS.meadow, duckAmt = 1;
  var TARGET = 0.055; // background level — deliberately quiet

  function muted() { try { return localStorage.getItem('sb_saga_music') === 'off'; } catch (e) { return false; } }

  function ensureMaster(ac) {
    if (master) return;
    master = ac.createGain(); master.gain.value = 0.0001; master.connect(ac.destination);
  }
  function applyGain(ac, t) {
    if (!master) return;
    var lvl = (muted() ? 0.0001 : TARGET * duckAmt);
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(Math.max(0.0001, lvl), t, 0.4);
  }

  function padDrone(ac) {
    // low sustained root+fifth pad through a gentle lowpass — the "warm bed"
    if (pad) { try { pad.stop(); } catch (e) {} pad = null; }
    var g = ac.createGain(); g.gain.value = 0.0; g.connect(master);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = mood.cut * 0.7; lp.connect(g);
    var root = hz(mood.root - 12), fifth = hz(mood.root - 12 + 7);
    var oscs = [root, fifth, root * 1.003].map(function (f) {
      var o = ac.createOscillator(); o.type = 'sine'; o.frequency.value = f; o.connect(lp); o.start(); return o;
    });
    var t = ac.currentTime;
    g.gain.setTargetAtTime(0.5 * mood.g, t, 1.2);
    pad = { stop: function () { oscs.forEach(function (o) { try { o.stop(); } catch (e) {} }); } };
  }

  function note(ac, when, semi, dur, vel) {
    var o = ac.createOscillator(); o.type = mood.wave; o.frequency.value = hz(semi);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = mood.cut;
    var g = ac.createGain();
    o.connect(lp); lp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime((vel || 0.5) * mood.g, when + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.start(when); o.stop(when + dur + 0.05);
  }

  // a calm arpeggio pattern over the scale, with occasional rests
  var PATTERN = [0, 2, 4, 2, 1, 3, 5, 3, 0, 4, 2, -1]; // -1 = rest
  function tick(ac) {
    if (!running) return;
    var look = ac.currentTime + 0.25;
    while (nextTime < look) {
      var scale = SCALES[mood.scale];
      var p = PATTERN[stepIdx % PATTERN.length];
      if (p >= 0) {
        var deg = scale[p % scale.length];
        var oct = (Math.floor(stepIdx / PATTERN.length) % 2) * 12; // gentle octave lift each cycle
        note(ac, nextTime, mood.root + deg + oct, (mood.step / 1000) * 2.2, 0.42);
        // soft harmony a third below on strong steps
        if (stepIdx % 4 === 0) note(ac, nextTime, mood.root + scale[Math.max(0, (p - 2)) % scale.length] - 12, (mood.step / 1000) * 3, 0.28);
      }
      stepIdx++;
      nextTime += mood.step / 1000;
    }
    timer = setTimeout(function () { tick(ac); }, 60);
  }

  function start(world) {
    var ac = ctx(); if (!ac) return;
    mood = moodFor(world);
    ensureMaster(ac);
    if (running) { padDrone(ac); applyGain(ac, ac.currentTime); return; } // world switch: swap pad, keep loop
    running = true; stepIdx = 0; nextTime = ac.currentTime + 0.1;
    padDrone(ac);
    applyGain(ac, ac.currentTime);
    tick(ac);
  }
  function stop() {
    running = false;
    if (timer) { clearTimeout(timer); timer = null; }
    var ac = ctx();
    if (master && ac) { master.gain.cancelScheduledValues(ac.currentTime); master.gain.setTargetAtTime(0.0001, ac.currentTime, 0.3); }
    if (pad) { setTimeout(function () { if (pad) { pad.stop(); pad = null; } }, 800); }
  }
  function duck(on) { // lower under dialogue voice
    duckAmt = on ? 0.35 : 1;
    var ac = ctx(); if (ac) applyGain(ac, ac.currentTime);
  }
  function toggleMute() {
    var m = !muted();
    try { localStorage.setItem('sb_saga_music', m ? 'off' : 'on'); } catch (e) {}
    var ac = ctx(); if (ac) applyGain(ac, ac.currentTime);
    return m;
  }
  function isMuted() { return muted(); }

  window.SAGA_MUSIC = { start: start, stop: stop, duck: duck, toggleMute: toggleMute, isMuted: isMuted };
})();

/* ============================================================
   SAGA-ART-DOM.js — vanilla bridge to the Claude Design registries.
   The app has NO React, so the shipped SagaSprite/WorldArt React
   renderers can't run here. This adapter reads the same data —
     window.SAGA_ART[name] = { vb, frames:[svgInner,…] }
     window.WORLD_ART[id]  = { vb, svg }
   — and returns SVG-string markup for the innerHTML game engines.
   Grey = the Unspelling filter (saturate .12 · brightness 1.05).
   Extend the registries only; never a second art dialect.
   ============================================================ */
(function () {
  function SA() { return window.SAGA_ART || {}; }
  function WA() { return window.WORLD_ART || {}; }

  // world plate → full-bleed cinematic background
  function plate(id, grey) {
    var w = WA()[id]; if (!w) return '';
    return '<svg class="sg-plate' + (grey ? ' sg-grey' : '') + '" viewBox="' + w.vb +
      '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + w.svg + '</svg>';
  }

  // sprite → inline svg; opts:{frame,size,grey,cls}
  function sprite(name, opts) {
    opts = opts || {}; var a = SA()[name]; if (!a) return '';
    var frames = a.frames || (a.svg ? [a.svg] : ['']);
    var f = frames[opts.frame || 0] || frames[0] || '';
    var cls = 'sg-sprite' + (opts.grey ? ' sg-grey' : '') + (opts.cls ? (' ' + opts.cls) : '');
    var sz = opts.size ? ('width="' + opts.size + '" height="' + opts.size + '" ') : '';
    return '<svg class="' + cls + '" ' + sz + 'viewBox="' + a.vb +
      '" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + f + '</svg>';
  }

  // frame count for a sprite (for CSS/JS animation drivers)
  function frames(name) { var a = SA()[name]; return a ? (a.frames ? a.frames.length : 1) : 0; }
  function has(name) { return !!SA()[name]; }

  // CH_META.world label → WORLD_ART plate id (Act I today, room for all six acts)
  var WORLD_MAP = {
    'Meadow': 'meadow', 'Sky': 'opensky', 'Long Sky': 'opensky', 'Open Sky': 'opensky',
    'Hive': 'hive', 'Hive Gates': 'hive', 'Flyway': 'flyway', 'Pond': 'pond',
    'Marquee': 'stage', 'Stage': 'stage', 'Carnival': 'carnival', 'Galaxy': 'cosmos', 'Cosmos': 'cosmos',
    'Dojo': 'dojo', 'Lotus': 'lotus', 'Library': 'library', 'Lab': 'lab', 'Arcade': 'arcade',
    'Forest': 'forest', 'Dino': 'dino', 'Grey Sea': 'greysea', 'Engine': 'engine',
    'Junkyard': 'junkyard', 'Siren': 'siren', 'Strait': 'strait', 'Warfield': 'warfield',
    'Homecoming': 'homecoming', 'Origami': 'origami', 'Elements': 'elements', 'Vibe': 'vibe',
    'Hive Chakravyuha': 'chakravyuha', 'Chakravyuha': 'chakravyuha'
  };
  // Accepts either a world LABEL ('Hive') or a raw plate ID ('hive'); falls back to meadow.
  function plateForWorld(world, grey) {
    var id = WORLD_MAP[world] || (WA()[world] ? world : 'meadow');
    return plate(id, grey);
  }

  // dialogue speaker key → SAGA_ART portrait asset
  var PORTRAIT = {
    bizzy: 'bizzy-portrait-happy', bumble: 'crew-owl', waggle: 'crew-panda', drone: 'crew-fox',
    queen: 'bizzy-portrait-determined', smudge: 'smudge-swarm', sting: 'sting-salute',
    narrator: '', melody: 'melody-captive', maestro: 'vex-portrait',
    astro: 'bizzy-portrait-triumphant', comet: 'crew-owl', zib: 'scopey-vision',
    sensei: 'sensei-counsel', ninja: 'sting-defect', beaker: 'crew-panda',
    brainiac: 'crew-owl', zoomies: 'crew-fox', capy: 'crew-panda', pixel: 'static-sprite',
    joystick: 'crew-fox', glitch: 'glitch-corrupt-glee', vex: 'vex-portrait'
  };
  function portrait(spk) { var n = PORTRAIT[spk]; return n && has(n) ? sprite(n, { cls: 'sg-portrait' }) : ''; }

  window.SGART = {
    plate: plate, sprite: sprite, frames: frames, has: has,
    plateForWorld: plateForWorld, portrait: portrait,
    WORLD_MAP: WORLD_MAP, PORTRAIT: PORTRAIT,
    ready: function () { return !!(window.SAGA_ART && window.WORLD_ART); }
  };
})();

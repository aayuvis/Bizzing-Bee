/* ============================================================
   WORLDS-ART.JS v2 — cinematic world plates, premium pass
   window.WORLD_ART[id] = { vb, svg } · <WorldArt name grey/> fluid.
   Technique kit: procedural detail (loops, seeded jitter), layered
   depth planes, glow/blur filters, film grain, graded vignettes.
   Cast stays sticker-constant; grey = the Unspelling only.
   ============================================================ */
(function () {
  var W = {};
  function reg(id, svg) { W[id] = { vb: '0 0 640 300', svg: svg }; }
  function rng(seed) { var s = seed; return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

  /* ---- shared def builders (ids world-prefixed) ---- */
  function glowDef(p, dev) { return '<filter id="' + p + '-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="' + (dev || 5) + '" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'; }
  function blurDef(p, dev) { return '<filter id="' + p + '-blur" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="' + dev + '"/></filter>'; }
  function grainDef(p, a) { return '<filter id="' + p + '-gr"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ' + (a || .05) + ' 0"/></filter>'; }
  function grain(p) { return '<rect width="640" height="300" filter="url(#' + p + '-gr)"/>'; }
  function vig(p, col, op) { return '<radialGradient id="' + p + '-vig" cx=".5" cy=".46" r=".72"><stop offset=".55" stop-color="' + col + '" stop-opacity="0"/><stop offset="1" stop-color="' + col + '" stop-opacity="' + op + '"/></radialGradient>'; }
  function vigR(p) { return '<rect width="640" height="300" fill="url(#' + p + '-vig)"/>'; }
  function lg(id, rot, stops) {
    var s = stops.map(function (x) { return '<stop offset="' + x[0] + '" stop-color="' + x[1] + '"' + (x[2] != null ? ' stop-opacity="' + x[2] + '"' : '') + '/>'; }).join('');
    var c = rot === 'v' ? 'x1="0" y1="0" x2="0" y2="1"' : rot === 'h' ? 'x1="0" y1="0" x2="1" y2="0"' : 'x1="0" y1="0" x2="1" y2="1"';
    return '<linearGradient id="' + id + '" ' + c + '>' + s + '</linearGradient>';
  }
  function rg(id, stops, cx, cy, r) {
    var s = stops.map(function (x) { return '<stop offset="' + x[0] + '" stop-color="' + x[1] + '"' + (x[2] != null ? ' stop-opacity="' + x[2] + '"' : '') + '/>'; }).join('');
    return '<radialGradient id="' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r="' + (r || .5) + '">' + s + '</radialGradient>';
  }
  function wave(y0, amp, segs, r, fill, extra) {
    var d = 'M0 ' + (y0 + (r() - .5) * amp), x = 0, step = 640 / segs;
    for (var i = 0; i < segs; i++) {
      var nx = x + step, my = y0 + (r() - .5) * amp * 2;
      d += ' Q' + (x + step / 2).toFixed(0) + ' ' + my.toFixed(0) + ' ' + nx.toFixed(0) + ' ' + (y0 + (r() - .5) * amp).toFixed(0);
      x = nx;
    }
    d += ' L640 300 L0 300 Z';
    return '<path d="' + d + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function starfield(n, seed, ymax, tint) {
    var r = rng(seed), s = '';
    for (var i = 0; i < n; i++) {
      var x = (r() * 640).toFixed(0), y = (r() * (ymax || 300)).toFixed(0), rad = (r() * 1.3 + .3).toFixed(2), o = (r() * .7 + .2).toFixed(2);
      s += '<circle cx="' + x + '" cy="' + y + '" r="' + rad + '" fill="' + (tint || '#fff') + '" opacity="' + o + '"/>';
    }
    return s;
  }
  function bokeh(n, seed, cols, ymin, ymax, rmin, rmax, p) {
    var r = rng(seed), s = '';
    for (var i = 0; i < n; i++) {
      s += '<circle cx="' + (r() * 640).toFixed(0) + '" cy="' + (ymin + r() * (ymax - ymin)).toFixed(0) + '" r="' + (rmin + r() * (rmax - rmin)).toFixed(1) + '" fill="' + cols[i % cols.length] + '" opacity="' + (.14 + r() * .3).toFixed(2) + '" filter="url(#' + p + '-blur)"/>';
    }
    return s;
  }
  var BIZZY = '<g transform="translate(-10,-11) scale(1)"><ellipse cx="4" cy="4" rx="5" ry="8" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1.4" transform="rotate(-28 4 4)"/><ellipse cx="16" cy="4" rx="5" ry="8" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1.4" transform="rotate(28 16 4)"/><ellipse cx="10" cy="12" rx="8.6" ry="7.8" fill="#FFC23D"/><path d="M3 10 H17 M2.8 14.6 H17.2" stroke="#3A2A8C" stroke-width="2.2" stroke-linecap="round"/><circle cx="13" cy="9.6" r="1.9" fill="#2B1B5E"/><circle cx="13.6" cy="9" r=".7" fill="#fff"/></g>';

  /* ============ 1 · MEADOW & HIVE — golden hour ============ */
  (function () {
    var p = 'mw', r = rng(7), s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#FFEFC9'], [.4, '#FFD98E'], [.75, '#F7B94F'], [1, '#E89A3C']]) +
      rg(p + '-sun', [[0, '#FFFBEE'], [.25, '#FFF1C4'], [.6, '#FFD86E', .55], [1, '#FFD86E', 0]]) +
      lg(p + '-far', 'v', [[0, '#D9C08A'], [1, '#C4A96E']]) +
      lg(p + '-mid', 'v', [[0, '#C4D488'], [1, '#9DBB66']]) +
      lg(p + '-near', 'v', [[0, '#86AC58'], [1, '#5F8A44']]) +
      lg(p + '-twr', 'v', [[0, '#EFB558'], [1, '#C08428']]) +
      glowDef(p, 4) + blurDef(p, 5) + grainDef(p, .045) + vig(p, '#5C3A10', .38) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<circle cx="486" cy="84" r="120" fill="url(#' + p + '-sun)"/><circle cx="486" cy="84" r="34" fill="#FFF6DC"/><circle cx="486" cy="84" r="46" fill="none" stroke="#FFF1C4" stroke-width="1.6" opacity=".5"/>';
    for (var i = 0; i < 4; i++) {
      var cx = 80 + r() * 480, cy = 34 + r() * 60, sc = .7 + r() * .8;
      s += '<g transform="translate(' + cx.toFixed(0) + ',' + cy.toFixed(0) + ') scale(' + sc.toFixed(2) + ')" opacity=".92"><ellipse rx="46" ry="13" fill="#F6D9A8"/><ellipse cx="-14" cy="-8" rx="24" ry="11" fill="#FBE9C6"/><ellipse cx="16" cy="-6" rx="20" ry="9" fill="#FFF3D9"/><path d="M-44 -4 Q-20 -22 8 -12" stroke="#FFFDF4" stroke-width="2.4" fill="none" opacity=".8"/></g>';
    }
    s += wave(178, 10, 5, rng(11), 'url(#' + p + '-far)', ' opacity=".85"');
    // hive citadel on the far hill
    s += '<g transform="translate(452,96)">';
    var tw = [[0, 36, 26], [30, 18, 40], [62, 44, 34], [100, 26, 30], [128, 46, 22]];
    tw.forEach(function (t, ti) {
      var x = t[0], top = t[1], w = t[2];
      s += '<path d="M' + x + ' 92 V' + (top + 14) + ' q' + (w / 2) + ' -' + (14 + w * .3) + ' ' + w + ' 0 V92Z" fill="url(#' + p + '-twr)"/>';
      s += '<path d="M' + x + ' ' + (top + 16) + ' q' + (w / 2) + ' -' + (14 + w * .3) + ' ' + w + ' 0" fill="none" stroke="#FFE9AE" stroke-width="2" opacity=".8"/>';
      for (var wy = top + 26; wy < 86; wy += 14) {
        s += '<path d="M' + (x + w / 2) + ' ' + wy + ' l4.5 2.6 v5.2 l-4.5 2.6 -4.5 -2.6 v-5.2Z" fill="#FFEFC9" filter="url(#' + p + '-glow)" opacity="' + (.75 + (ti % 2) * .2) + '"/>';
      }
    });
    s += '<path d="M-8 92 H182" stroke="#B27A18" stroke-width="4" stroke-linecap="round"/></g>';
    s += wave(212, 12, 6, rng(23), 'url(#' + p + '-mid)');
    // winding path with light
    s += '<path d="M300 300 C280 262 330 246 368 238 C420 227 440 218 452 196" stroke="#E8CE9A" stroke-width="13" stroke-linecap="round" fill="none" opacity=".95"/><path d="M300 300 C280 262 330 246 368 238 C420 227 440 218 452 196" stroke="#FFF3D2" stroke-width="5" stroke-linecap="round" fill="none" opacity=".8"/>';
    // mid flower drifts
    var fr = rng(41), hues = ['#F2A8C4', '#C9A8F0', '#FF8FB0', '#7FB8E8', '#FFE05C'];
    for (i = 0; i < 16; i++) {
      var fx = 20 + fr() * 600, fy = 232 + fr() * 30, fs = .35 + fr() * .5, hu = hues[i % 5];
      s += '<g transform="translate(' + fx.toFixed(0) + ',' + fy.toFixed(0) + ') scale(' + fs.toFixed(2) + ') rotate(' + ((fr() - .5) * 24).toFixed(0) + ')"><path d="M0 6 V22" stroke="#4E7A4A" stroke-width="3.4" stroke-linecap="round"/>' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="0" cy="-9" rx="4.6" ry="8" fill="' + hu + '" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="4.4" fill="#FFC23D"/></g>';
    }
    s += wave(258, 10, 7, rng(31), 'url(#' + p + '-near)');
    // labeled hero flowers (the world's signature: flowers wearing their names)
    [[168, 234, .95, '#F2A8C4', 'DAISY'], [418, 240, .88, '#C9A8F0', 'TULIP'], [560, 236, .8, '#FF8FB0', 'POPPY']].forEach(function (F) {
      s += '<g transform="translate(' + F[0] + ',' + F[1] + ') scale(' + F[2] + ')"><path d="M0 6 V26" stroke="#4E7A4A" stroke-width="3.6" stroke-linecap="round"/>' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="0" cy="-11" rx="5" ry="9" fill="' + F[3] + '" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="5.6" fill="#FFC23D"/><circle cx="-1.6" cy="-1.6" r="1.5" fill="#fff" opacity=".85"/><rect x="-21" y="28" width="42" height="14" rx="4" fill="#FFFDF6" stroke="#4E7A4A" stroke-width="1.4"/><text y="38.5" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="9" fill="#2A2140" letter-spacing="1.4">' + F[4] + '</text></g>';
    });
    // bee flight + Bizzy
    s += '<path d="M120 152 C210 96 320 128 442 108" stroke="#F0B429" stroke-width="2.6" stroke-dasharray="1 9" stroke-linecap="round" fill="none" filter="url(#' + p + '-glow)"/>';
    s += '<g transform="translate(116,154) scale(1.25)" filter="url(#' + p + '-glow)">' + BIZZY + '</g>';
    s += bokeh(14, 77, ['#FFE9AE', '#FFD86E'], 60, 240, 2, 6, p);
    // foreground grass + hero flowers
    var gr = rng(97);
    s += '<g>';
    for (i = 0; i < 46; i++) {
      var gx = gr() * 640, gh = 18 + gr() * 34, bend = (gr() - .5) * 26;
      s += '<path d="M' + gx.toFixed(0) + ' 300 q' + (bend * .4).toFixed(0) + ' -' + (gh * .55).toFixed(0) + ' ' + bend.toFixed(0) + ' -' + gh.toFixed(0) + '" stroke="#3E6234" stroke-width="' + (2 + gr() * 2.4).toFixed(1) + '" stroke-linecap="round" fill="none"/>';
    }
    s += '</g>';
    s += '<g transform="translate(72,266)"><path d="M0 34 Q-3 12 0 0" stroke="#3E6234" stroke-width="5" stroke-linecap="round" fill="none"/>' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="0" cy="-13" rx="6" ry="10.5" fill="#E88AAE" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="6.5" fill="#E8A620"/><circle cx="-2" cy="-2" r="1.8" fill="#FFF3D2"/></g>';
    s += '<g transform="translate(596,272) scale(.85)"><path d="M0 34 Q3 12 0 0" stroke="#3E6234" stroke-width="5" stroke-linecap="round" fill="none"/>' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<ellipse cx="0" cy="-13" rx="6" ry="10.5" fill="#B48CE0" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="6.5" fill="#E8A620"/></g>';
    s += vigR(p) + grain(p);
    reg('meadow', s);
  })();

  /* ============ 2 · STAGE — art-deco limelight ============ */
  (function () {
    var p = 'st', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#1C040D'], [1, '#3A0A1C']]) +
      lg(p + '-fold', 'h', [[0, '#8A1E40'], [.5, '#5C1029'], [1, '#8A1E40']]) +
      lg(p + '-foldL', 'h', [[0, '#A83252'], [.5, '#6E1430'], [1, '#4A0B1E']]) +
      lg(p + '-beam', 'v', [[0, '#FFEBB0', .95], [1, '#FFEBB0', 0]]) +
      lg(p + '-floor', 'v', [[0, '#5C2A20'], [1, '#2A1009']]) +
      rg(p + '-spot', [[0, '#FFF3D2', .95], [.7, '#FFDFA0', .35], [1, '#FFDFA0', 0]]) +
      glowDef(p, 4) + blurDef(p, 6) + grainDef(p, .06) + vig(p, '#12030A', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // back curtain folds
    for (var i = 0; i < 16; i++) {
      var x = i * 40 - 6;
      s += '<path d="M' + x + ' 30 C' + (x - 10) + ' 120 ' + (x + 12) + ' 200 ' + (x + 2) + ' 262 L' + (x + 26) + ' 262 C' + (x + 30) + ' 190 ' + (x + 14) + ' 110 ' + (x + 24) + ' 30Z" fill="url(#' + p + '-fold)" opacity=".9"/>';
    }
    // swagged side curtains
    s += '<path d="M0 0 H210 C196 60 188 130 210 210 Q140 250 96 300 L0 300Z" fill="url(#' + p + '-foldL)"/>';
    s += '<g transform="translate(640,0) scale(-1,1)"><path d="M0 0 H210 C196 60 188 130 210 210 Q140 250 96 300 L0 300Z" fill="url(#' + p + '-foldL)"/></g>';
    for (i = 0; i < 6; i++) {
      s += '<path d="M' + (18 + i * 32) + ' 0 C' + (10 + i * 30) + ' 90 ' + (30 + i * 30) + ' 160 ' + (58 + i * 26) + ' 218" stroke="#3F0A1B" stroke-width="10" fill="none" opacity=".6"/>';
      s += '<path d="M' + (622 - i * 32) + ' 0 C' + (630 - i * 30) + ' 90 ' + (610 - i * 30) + ' 160 ' + (582 - i * 26) + ' 218" stroke="#3F0A1B" stroke-width="10" fill="none" opacity=".6"/>';
    }
    s += '<path d="M96 300 Q210 236 210 210 L232 224 Q160 262 128 300Z" fill="#C43D5A" opacity=".55"/>';
    // proscenium + bulbs
    s += '<path d="M0 22 H640" stroke="#F0B429" stroke-width="7"/><path d="M0 34 H640" stroke="#B27A18" stroke-width="2"/>';
    for (i = 0; i < 16; i++) s += '<circle cx="' + (22 + i * 40) + '" cy="12" r="4.6" fill="' + (i % 2 ? '#FFE9A8' : '#F0B429') + '" filter="url(#' + p + '-glow)"/>';
    // beams
    s += '<path d="M170 30 L96 262 H262Z" fill="url(#' + p + '-beam)" opacity=".85"/><path d="M480 30 L560 262 H404Z" fill="url(#' + p + '-beam)" opacity=".6"/><path d="M320 26 L268 262 H372Z" fill="url(#' + p + '-beam)" opacity=".4"/>';
    // floor
    s += '<rect y="238" width="640" height="62" fill="url(#' + p + '-floor)"/>';
    for (i = 0; i < 9; i++) s += '<path d="M' + (320 + (i - 4) * 26) + ' 238 L' + (320 + (i - 4) * 92) + ' 300" stroke="#1C0A06" stroke-width="2" opacity=".7"/>';
    s += '<path d="M0 238 H640" stroke="#F0B429" stroke-width="2.4"/>';
    // footlight glows
    for (i = 0; i < 7; i++) s += '<ellipse cx="' + (60 + i * 88) + '" cy="298" rx="26" ry="8" fill="#FFDFA0" opacity=".4" filter="url(#' + p + '-blur)"/>';
    // Melody in the spot
    s += '<ellipse cx="320" cy="252" rx="86" ry="18" fill="url(#' + p + '-spot)"/>';
    s += '<g transform="translate(320,212)"><circle r="19" fill="#F7A8C8"/><path d="M-19 4 a19 19 0 0 0 38 0 l-4 26 h-30Z" fill="#E88AB8"/><circle cx="-5" cy="-4" r="5.4" fill="#fff"/><circle cx="7" cy="-4" r="5.4" fill="#fff"/><circle cx="-4" cy="-3.4" r="2.4" fill="#2B1B5E"/><circle cx="8" cy="-3.4" r="2.4" fill="#2B1B5E"/><path d="M-4 8 Q1.5 12.5 7 8" stroke="#3A1E5C" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M14 -19 q9 -9 5 -19" stroke="#F0B429" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="19" cy="-39" r="4.4" fill="#F0B429" filter="url(#' + p + '-glow)"/></g>';
    // rising notes
    s += '<g fill="#FFE9A8" filter="url(#' + p + '-glow)"><path d="M368 150 q0 -15 11 -15 v24 q0 6.5 -6.5 6.5 t-4.5 -6.5Z"/><path d="M398 118 q0 -13 9 -13 v20 q0 5.5 -5.5 5.5 t-3.5 -5.5Z" opacity=".8"/><path d="M424 92 q0 -11 8 -11 v17 q0 4.6 -4.6 4.6 t-3.4 -4.6Z" opacity=".6"/></g>';
    s += bokeh(16, 55, ['#FFE9A8', '#FFDFA0'], 60, 230, 1.4, 3.6, p);
    s += vigR(p) + grain(p);
    reg('stage', s);
  })();

  /* ============ 3 · COSMOS — Spiderverse ============ */
  (function () {
    var p = 'co', s = '<defs>' +
      lg(p + '-sky', 'd', [[0, '#0D1030'], [.5, '#231A54'], [1, '#3A1450']]) +
      rg(p + '-neb1', [[0, '#FF5D9E', .5], [1, '#FF5D9E', 0]]) +
      rg(p + '-neb2', [[0, '#36D1FF', .4], [1, '#36D1FF', 0]]) +
      rg(p + '-neb3', [[0, '#7C5CFF', .45], [1, '#7C5CFF', 0]]) +
      rg(p + '-pl', [[0, '#8FA0F5'], [.45, '#5B6BE0'], [1, '#2A2C7A']], .32, .28, .95) +
      '<pattern id="' + p + '-h1" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><circle cx="4" cy="4" r="2.1" fill="#7C5CFF" opacity=".22"/></pattern>' +
      '<pattern id="' + p + '-h2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-14)"><circle cx="3" cy="3" r="1.3" fill="#36D1FF" opacity=".25"/></pattern>' +
      glowDef(p, 5) + blurDef(p, 14) + grainDef(p, .05) + vig(p, '#05030F', .5) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<ellipse cx="150" cy="90" rx="200" ry="120" fill="url(#' + p + '-neb3)"/><ellipse cx="520" cy="210" rx="220" ry="130" fill="url(#' + p + '-neb1)"/><ellipse cx="420" cy="60" rx="180" ry="100" fill="url(#' + p + '-neb2)"/>';
    s += starfield(90, 5, 300);
    s += starfield(24, 9, 300, '#9BD7EE');
    // halftone fields
    s += '<path d="M0 0 H640 V120 Q400 180 180 130 T0 150Z" fill="url(#' + p + '-h1)"/>';
    s += '<path d="M0 300 H640 V170 Q420 230 200 190 T0 210Z" fill="url(#' + p + '-h2)"/>';
    // ringed planet w/ chromatic ghosts
    s += '<g transform="translate(492,96)">' +
      '<ellipse rx="74" ry="20" fill="none" stroke="#FF5D9E" stroke-width="4" transform="rotate(-16)" opacity=".9"/>' +
      '<ellipse rx="74" ry="20" fill="none" stroke="#36D1FF" stroke-width="2" transform="rotate(-16) translate(3.5,2.5)" opacity=".8"/>' +
      '<circle r="34" fill="url(#' + p + '-pl)"/>' +
      '<path d="M-30 -16 A34 34 0 0 1 30 -16" stroke="#C9D2FF" stroke-width="2" fill="none" opacity=".7"/>' +
      '<ellipse cx="-10" cy="-9" rx="7" ry="5" fill="#C9D2FF" opacity=".5"/><ellipse cx="12" cy="8" rx="5" ry="3.6" fill="#2A2C7A" opacity=".8"/><ellipse cx="-2" cy="18" rx="4" ry="3" fill="#2A2C7A" opacity=".6"/>' +
      '<circle r="34" fill="none" stroke="#36D1FF" stroke-width="2.4" transform="translate(-3,-2)" opacity=".8"/><circle r="34" fill="none" stroke="#FF5D9E" stroke-width="2.4" transform="translate(3,2)" opacity=".8"/>' +
      '<path d="M-74 14 A74 20 -16 0 0 -6 33" stroke="#FF7FB4" stroke-width="4" fill="none" transform="rotate(0)" opacity=".95"/></g>';
    // constellation letter B with glow
    s += '<g filter="url(#' + p + '-glow)"><g stroke="#36D1FF" stroke-width="2.4" fill="none" opacity=".95"><path d="M120 176 L112 108 L156 96 L170 124 L136 140 L178 158 L158 190 Z"/></g>' +
      [[120, 176], [112, 108], [156, 96], [170, 124], [136, 140], [178, 158], [158, 190]].map(function (pt, i) {
        return '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="' + (i % 2 ? 3.4 : 4.6) + '" fill="#FFC83D"/><circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="1.6" fill="#FFF6DC"/>';
      }).join('') + '</g>';
    s += '<text x="196" y="150" font-family="Sono,monospace" font-weight="600" font-size="17" fill="#36D1FF" letter-spacing="2">BRAVE</text><text x="194.5" y="148.5" font-family="Sono,monospace" font-weight="600" font-size="17" fill="#FF5D9E" letter-spacing="2" opacity=".75">BRAVE</text>';
    // comet + trail particles
    s += '<g filter="url(#' + p + '-glow)"><path d="M226 236 C300 210 400 224 470 200" stroke="#FF5D9E" stroke-width="2.6" stroke-dasharray="2 9" stroke-linecap="round" fill="none"/><g transform="translate(222,238)"><circle r="9" fill="#FFC83D"/><path d="M9 -2 L48 -14 L40 2 L52 6 L14 6Z" fill="#FF5D9E" opacity=".8"/><path d="M9 0 L40 10 L30 -4Z" fill="#36D1FF" opacity=".7"/></g></g>';
    var cr = rng(61);
    for (var i = 0; i < 8; i++) s += '<circle cx="' + (240 + cr() * 220).toFixed(0) + '" cy="' + (196 + cr() * 34).toFixed(0) + '" r="' + (1 + cr() * 1.6).toFixed(1) + '" fill="' + (i % 2 ? '#FF5D9E' : '#36D1FF') + '" opacity=".8"/>';
    // pop shapes (comic energy)
    s += '<path d="M56 236 l7 -14 7 14 -7 14Z" fill="#7C5CFF" opacity=".9"/><path d="M598 160 l6 -12 6 12 -6 12Z" fill="#36D1FF" opacity=".8"/><path d="M330 44 l5 10 10 5 -10 5 -5 10 -5 -10 -10 -5 10 -5Z" fill="#FFC83D" opacity=".9" filter="url(#' + p + '-glow)"/>';
    s += vigR(p) + grain(p);
    reg('cosmos', s);
  })();

  /* ============ 4 · DOJO — sumi-e ============ */
  (function () {
    var p = 'dj', s = '<defs>' +
      lg(p + '-paper', 'v', [[0, '#F6EFDF'], [1, '#EBDFC6']]) +
      rg(p + '-sun', [[0, '#D24A42'], [.8, '#C43D3D'], [1, '#C43D3D', .0]]) +
      lg(p + '-ink1', 'v', [[0, '#4A4348'], [1, '#2A2426']]) +
      lg(p + '-ink2', 'v', [[0, '#6E6668'], [1, '#4A4348']]) +
      glowDef(p, 3) + blurDef(p, 8) + grainDef(p, .07) + vig(p, '#8A7A5C', .3) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-paper)"/>';
    // wash bands
    for (var i = 0; i < 5; i++) s += '<path d="M0 ' + (34 + i * 52) + ' q160 ' + ((i % 2 ? -1 : 1) * 10) + ' 320 0 t320 0" stroke="#E2D4B8" stroke-width="' + (16 + i * 4) + '" fill="none" opacity=".5"/>';
    // red sun with bleed
    s += '<circle cx="452" cy="86" r="66" fill="url(#' + p + '-sun)" filter="url(#' + p + '-blur)" opacity=".55"/><circle cx="452" cy="86" r="54" fill="#C43D3D"/><path d="M406 68 A54 54 0 0 1 476 42" stroke="#D8625A" stroke-width="5" fill="none" opacity=".8"/>';
    // ink mountains, three depths
    s += '<path d="M-10 168 C60 96 120 128 170 108 C210 92 250 120 300 112 L300 300 H-10Z" fill="url(#' + p + '-ink2)" opacity=".55" filter="url(#' + p + '-blur)"/>';
    s += '<path d="M-10 196 C70 128 150 158 220 134 C280 114 330 144 384 136 L384 300 H-10Z" fill="url(#' + p + '-ink1)" opacity=".92"/>';
    // dry-brush lights on ridge
    var dr = rng(17);
    for (i = 0; i < 9; i++) {
      var dx = 20 + dr() * 320, dy = 150 + dr() * 40;
      s += '<path d="M' + dx.toFixed(0) + ' ' + dy.toFixed(0) + ' q' + (14 + dr() * 26).toFixed(0) + ' -' + (4 + dr() * 8).toFixed(0) + ' ' + (34 + dr() * 40).toFixed(0) + ' ' + ((dr() - .5) * 8).toFixed(0) + '" stroke="#F6EFDF" stroke-width="' + (1 + dr() * 1.6).toFixed(1) + '" fill="none" opacity=".5"/>';
    }
    // pagoda — three curved roofs, lit shoji
    s += '<g transform="translate(478,132)">' +
      '<path d="M-64 34 Q0 6 64 34 L48 34 Q0 14 -48 34Z" fill="#2A2426"/><path d="M-64 34 Q0 6 64 34" stroke="#C43D3D" stroke-width="2.4" fill="none"/>' +
      '<rect x="-40" y="34" width="80" height="26" fill="#3A3236"/><path d="M-34 40 h20 v16 h-20Z M6 40 h20 v16 h-20Z" fill="#FFDFA0" filter="url(#' + p + '-glow)"/><path d="M-24 40 v16 M16 40 v16 M-34 48 h20 M6 48 h20" stroke="#3A3236" stroke-width="1.6"/>' +
      '<path d="M-52 62 Q0 40 52 62 L40 62 Q0 46 -40 62Z" fill="#2A2426"/>' +
      '<rect x="-32" y="62" width="64" height="24" fill="#3A3236"/><path d="M-24 68 h14 v13 h-14Z M10 68 h14 v13 h-14Z" fill="#FFDFA0" filter="url(#' + p + '-glow)"/>' +
      '<path d="M-44 88 Q0 70 44 88 L36 88 Q0 74 -36 88Z" fill="#2A2426"/>' +
      '<rect x="-28" y="88" width="56" height="38" fill="#443A3E"/><path d="M-20 96 h12 v22 h-12Z M8 96 h12 v22 h-12Z" fill="#F6EFDF" opacity=".85"/><path d="M-14 96 v22 M14 96 v22 M-20 107 h12 M8 107 h12" stroke="#443A3E" stroke-width="1.8"/>' +
      '<path d="M0 6 v-14 M0 -8 l8 5" stroke="#2A2426" stroke-width="2.6" stroke-linecap="round"/></g>';
    // great ink slash + splatter
    s += '<path d="M56 44 C170 92 380 200 604 258" stroke="#1B1618" stroke-width="9" stroke-linecap="round" fill="none"/>' +
      '<path d="M64 50 C160 88 300 148 430 196" stroke="#1B1618" stroke-width="3" stroke-linecap="round" fill="none" opacity=".45"/>' +
      '<path d="M470 214 C510 228 560 244 596 254" stroke="#1B1618" stroke-width="2" stroke-linecap="round" fill="none" opacity=".35"/>';
    var sp = rng(29);
    for (i = 0; i < 10; i++) s += '<circle cx="' + (90 + sp() * 480).toFixed(0) + '" cy="' + (70 + sp() * 170).toFixed(0) + '" r="' + (.8 + sp() * 2).toFixed(1) + '" fill="#1B1618" opacity="' + (.3 + sp() * .4).toFixed(2) + '"/>';
    // petals
    var pt = rng(43);
    for (i = 0; i < 16; i++) {
      var px = pt() * 640, py = 30 + pt() * 230, ps = .6 + pt() * .9;
      s += '<g transform="translate(' + px.toFixed(0) + ',' + py.toFixed(0) + ') rotate(' + (pt() * 360).toFixed(0) + ') scale(' + ps.toFixed(2) + ')"><path d="M0 -6 C4 -2 4 3 0 6 C-4 3 -4 -2 0 -6Z" fill="' + (i % 3 ? '#F2A8C4' : '#E88AAE') + '" opacity="' + (.6 + pt() * .4).toFixed(2) + '"/></g>';
    }
    s += '<text x="52" y="252" font-family="Fraunces,serif" font-weight="800" font-size="24" fill="#C43D3D" opacity=".9">道</text><rect x="48" y="260" width="34" height="4" fill="#C43D3D" opacity=".55"/>';
    s += vigR(p) + grain(p);
    reg('dojo', s);
  })();

  /* ============ 5 · LAB — retro-futurist fizz ============ */
  (function () {
    var p = 'lb', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#0A2826'], [.6, '#0F3A34'], [1, '#124A40']]) +
      lg(p + '-liq', 'v', [[0, '#D6FA8E'], [.5, '#9BE34D'], [1, '#5FBF3A']]) +
      lg(p + '-glass', 'h', [[0, '#7FD9C4', .0], [.12, '#7FD9C4', .28], [.3, '#7FD9C4', 0], [.8, '#7FD9C4', 0], [.92, '#7FD9C4', .34], [1, '#7FD9C4', 0]]) +
      rg(p + '-corebloom', [[0, '#C6F56E', .5], [1, '#C6F56E', 0]]) +
      glowDef(p, 5) + blurDef(p, 7) + grainDef(p, .05) + vig(p, '#03110F', .5) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // back wall shelves of glowing jars
    var jr = rng(13), jc = ['#5CC1E8', '#F2A8C4', '#C6F56E', '#FFD86E', '#C9A8F0'];
    for (var row = 0; row < 2; row++) {
      var sy = 52 + row * 54;
      s += '<path d="M40 ' + (sy + 30) + ' H600" stroke="#0A2020" stroke-width="5"/>';
      for (var i = 0; i < 11; i++) {
        var jx = 56 + i * 50 + (jr() - .5) * 10, jh = 14 + jr() * 14, jw = 10 + jr() * 8, col = jc[(i + row) % 5];
        if (jx > 240 && jx < 400) continue;
        s += '<g transform="translate(' + jx.toFixed(0) + ',' + (sy + 30) + ')"><path d="M' + (-jw / 2) + ' 0 v-' + jh + ' q0 -5 5 -5 h' + (jw - 10) + ' q5 0 5 5 v' + jh + 'Z" fill="' + col + '" opacity=".8" filter="url(#' + p + '-glow)"/><path d="M' + (-jw / 2 + 2) + ' -4 v-' + (jh - 6) + '" stroke="#fff" stroke-width="1.6" opacity=".5"/></g>';
      }
    }
    // haze
    s += '<rect y="120" width="640" height="60" fill="#7FD9C4" opacity=".05" filter="url(#' + p + '-blur)"/>';
    // floor grid perspective
    s += '<rect y="228" width="640" height="72" fill="#081E1C"/>';
    for (i = 0; i < 11; i++) s += '<path d="M' + (320 + (i - 5) * 34) + ' 228 L' + (320 + (i - 5) * 130) + ' 300" stroke="#134A40" stroke-width="2"/>';
    s += '<path d="M0 244 H640 M0 266 H640 M0 290 H640" stroke="#134A40" stroke-width="2"/>';
    // core flask
    s += '<ellipse cx="320" cy="164" rx="120" ry="90" fill="url(#' + p + '-corebloom)"/>';
    s += '<g transform="translate(320,150)">' +
      '<path d="M-30 -96 h60 v12 h-60Z" fill="#7FD9C4"/><path d="M-22 -84 h44 v30 l44 74 a19 19 0 0 1 -17 28 H-49 a19 19 0 0 1 -17 -28 l44 -74Z" fill="#0E332C" stroke="#7FD9C4" stroke-width="3.6" stroke-linejoin="round"/>' +
      '<path d="M-46 14 c16 -12 30 8 46 0 s28 8 40 0 l16 28 a13 13 0 0 1 -12 19 H-50 a13 13 0 0 1 -12 -19Z" fill="url(#' + p + '-liq)" filter="url(#' + p + '-glow)"/>' +
      '<ellipse cx="0" cy="16" rx="42" ry="6" fill="#E9FBD8" opacity=".35"/>' +
      '<path d="M-22 -84 h44 v30 l44 74 a19 19 0 0 1 -17 28 H-49 a19 19 0 0 1 -17 -28 l44 -74Z" fill="url(#' + p + '-glass)"/>' +
      [[-8, 30, 5], [12, 40, 3.8], [2, 8, 4.2], [-14, -2, 3], [6, -18, 2.6], [-2, -34, 2], [3, -50, 1.5]].map(function (b) { return '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + b[2] + '" fill="#E9FBD8" opacity="' + (b[2] / 6 + .3).toFixed(2) + '"/>'; }).join('') + '</g>';
    // coils to side vessels
    s += '<path d="M264 90 C220 90 224 122 196 122 C168 122 172 92 148 96" stroke="#7FD9C4" stroke-width="4" fill="none" opacity=".85"/><path d="M376 90 C420 90 416 128 448 128 C480 128 476 98 500 102" stroke="#7FD9C4" stroke-width="4" fill="none" opacity=".85"/>';
    s += '<g transform="translate(132,168)"><path d="M-18 52 h36 l-7 -40 a13 13 0 1 0 -22 0Z" fill="#0E332C" stroke="#7FD9C4" stroke-width="3"/><path d="M-9 32 c7 -5 11 3 18 0 l5 16 h-27Z" fill="#5CC1E8" filter="url(#' + p + '-glow)"/><circle cx="0" cy="40" r="2.6" fill="#D9F2FC"/></g>';
    s += '<g transform="translate(512,172)"><path d="M-15 48 v-62 a15 15 0 0 1 30 0 v62Z" fill="#0E332C" stroke="#7FD9C4" stroke-width="3"/><path d="M-15 16 c9 -6 13 4 22 0 l8 0 v32 h-30Z" fill="#F2A8C4" filter="url(#' + p + '-glow)"/><circle cx="1" cy="30" r="3" fill="#FCE3EE"/></g>';
    // chalk science
    s += '<g stroke="#9FD9CC" fill="none" opacity=".65"><circle cx="126" cy="64" r="6" stroke-width="1.8"/><circle cx="158" cy="46" r="4.6" stroke-width="1.8"/><path d="M131 60 L154 49" stroke-width="1.8"/><circle cx="126" cy="64" r="2" fill="#9FD9CC" stroke="none"/><path d="M498 52 q12 9 0 18 t0 18" stroke-width="2.4"/></g>';
    s += '<text x="546" y="60" font-family="Sono,monospace" font-weight="600" font-size="13" fill="#C6F56E" opacity=".9" filter="url(#' + p + '-glow)">Wx = ?</text>';
    // steam
    s += '<path d="M320 44 q-8 -14 2 -24 M334 46 q10 -12 4 -26" stroke="#E9FBD8" stroke-width="3" stroke-linecap="round" fill="none" opacity=".35" filter="url(#' + p + '-blur)"/>';
    s += bokeh(12, 71, ['#C6F56E', '#7FD9C4'], 60, 240, 1.6, 4, p);
    s += vigR(p) + grain(p);
    reg('lab', s);
  })();

  /* ============ 6 · ARCADE — CRT canyon ============ */
  (function () {
    var p = 'ar', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#0B0F24'], [1, '#141A3C']]) +
      lg(p + '-scr1', 'v', [[0, '#4DF0DA'], [1, '#1B8FA8']]) +
      lg(p + '-scr2', 'v', [[0, '#FF7FB4'], [1, '#C4356E']]) +
      lg(p + '-cab', 'v', [[0, '#242C5C'], [1, '#161B3E']]) +
      '<pattern id="' + p + '-scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.6" fill="#05070F" opacity=".5"/></pattern>' +
      rg(p + '-pool', [[0, '#36E0C8', .35], [1, '#36E0C8', 0]]) +
      glowDef(p, 5) + blurDef(p, 6) + grainDef(p, .06) + vig(p, '#04050C', .6) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    s += starfield(30, 3, 120, '#7BA3F5');
    // cabinet canyon — 3 per side, receding
    function cab(x, y, sc, scr, title, flip) {
      var g = '<g transform="translate(' + x + ',' + y + ') scale(' + sc + (flip ? ' ' : ' ') + ')">';
      g += '<rect width="118" height="200" rx="8" fill="url(#' + p + '-cab)"/><rect x="0" y="0" width="118" height="200" rx="8" fill="none" stroke="#0B0F24" stroke-width="3"/>';
      g += '<rect x="8" y="8" width="102" height="26" rx="5" fill="#0B0F24"/><text x="59" y="26" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="14" fill="' + (scr === 1 ? '#36E0C8' : '#FF5D9E') + '" filter="url(#' + p + '-glow)">' + title + '</text>';
      g += '<rect x="10" y="42" width="98" height="64" rx="6" fill="url(#' + p + '-scr' + scr + ')"/>';
      if (scr === 1) g += '<text x="59" y="82" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="20" fill="#062A30">SPELL</text>';
      else g += '<g fill="#fff"><rect x="46" y="56" width="8" height="8"/><rect x="62" y="56" width="8" height="8"/><rect x="38" y="72" width="8" height="8"/><rect x="54" y="76" width="8" height="8"/><rect x="70" y="72" width="8" height="8"/></g>';
      g += '<rect x="10" y="42" width="98" height="64" rx="6" fill="url(#' + p + '-scan)"/><path d="M14 46 q30 8 90 2" stroke="#fff" stroke-width="4" opacity=".14" fill="none"/>';
      g += '<rect x="18" y="118" width="82" height="9" rx="4.5" fill="' + (scr === 1 ? '#FF5D9E' : '#36E0C8') + '"/>';
      g += '<circle cx="34" cy="148" r="8.5" fill="#FF5D9E"/><circle cx="59" cy="148" r="8.5" fill="#FFC83D"/><circle cx="84" cy="148" r="8.5" fill="#36E0C8"/><path d="M34 148 l0 -14" stroke="#B8B2C6" stroke-width="3.4" stroke-linecap="round"/><circle cx="34" cy="132" r="4" fill="#FF5D9E"/>';
      g += '<rect x="18" y="168" width="82" height="22" rx="4" fill="#0B0F24"/><rect x="26" y="175" width="20" height="8" rx="2" fill="#FFC83D" opacity=".8"/>';
      return g + '</g>';
    }
    s += cab(28, 66, 1, 1, 'WORD•UP');
    s += cab(160, 96, .72, 2, 'GLITCH');
    s += cab(496, 66, 1, 2, 'BOSS');
    s += cab(402, 96, .72, 1, 'SPELL-X');
    // neon sign
    s += '<g transform="translate(320,44)" filter="url(#' + p + '-glow)"><text text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="26" fill="#FF5D9E" letter-spacing="4">ARCADE</text><text text-anchor="middle" x="-2.5" y="-2" font-family="Sono,monospace" font-weight="600" font-size="26" fill="#36E0C8" letter-spacing="4" opacity=".8">ARCADE</text><path d="M-70 10 H70" stroke="#FF5D9E" stroke-width="2"/></g>';
    // token river
    s += '<path d="M240 300 C260 250 300 244 320 214 C338 188 380 186 420 202 C470 220 520 216 560 236" stroke="#0B0F24" stroke-width="34" fill="none"/>';
    s += '<path d="M240 300 C260 250 300 244 320 214 C338 188 380 186 420 202 C470 220 520 216 560 236" stroke="#12173A" stroke-width="26" fill="none"/>';
    var tr = rng(19), tpts = [[262, 268], [288, 248], [318, 222], [352, 200], [396, 196], [438, 208], [482, 218], [524, 222]];
    tpts.forEach(function (t, i) {
      s += '<g transform="translate(' + t[0] + ',' + t[1] + ') rotate(' + ((tr() - .5) * 40).toFixed(0) + ') scale(' + (0.8 + tr() * .4).toFixed(2) + ')" filter="url(#' + p + '-glow)"><ellipse rx="10" ry="8.6" fill="#FFC83D"/><ellipse rx="10" ry="8.6" fill="none" stroke="#B27A18" stroke-width="2"/><path d="M0 -4 l1.4 2.8 3 .5 -2.2 2.1.5 3L0 5 -2.7 6.4l.5 -3 -2.2 -2.1 3 -.5Z" fill="#B27A18"/></g>';
    });
    // floor + glow pools
    s += '<path d="M0 268 H640" stroke="#1E2650" stroke-width="3"/>';
    s += '<ellipse cx="90" cy="282" rx="70" ry="12" fill="url(#' + p + '-pool)"/><ellipse cx="552" cy="282" rx="70" ry="12" fill="url(#' + p + '-pool)"/>';
    // drifting pixels
    var px = rng(37);
    for (var i = 0; i < 10; i++) s += '<rect x="' + (px() * 620).toFixed(0) + '" y="' + (40 + px() * 200).toFixed(0) + '" width="' + (3 + px() * 4).toFixed(0) + '" height="' + (3 + px() * 4).toFixed(0) + '" fill="' + (i % 2 ? '#36E0C8' : '#FF5D9E') + '" opacity="' + (.3 + px() * .5).toFixed(2) + '"/>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-scan)" opacity=".4"/>';
    s += vigR(p) + grain(p);
    reg('arcade', s);
  })();

  /* ============ 7 · CARNIVAL — rigged glamour ============ */
  (function () {
    var p = 'cv', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#38093A'], [.6, '#701448'], [1, '#9A1E5C']]) +
      lg(p + '-tent1', 'v', [[0, '#E84A6E'], [1, '#A82040']]) +
      lg(p + '-tent2', 'v', [[0, '#FCEED2'], [1, '#E8C89A']]) +
      rg(p + '-glow', [[0, '#FFD86E', .55], [1, '#FFD86E', 0]]) +
      glowDef(p, 4) + blurDef(p, 9) + grainDef(p, .06) + vig(p, '#20031C', .55) + '<filter id="' + p + '-blur2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += starfield(26, 21, 130, '#FF9ED0');
    // ferris wheel silhouette
    s += '<g transform="translate(104,120)" opacity=".9"><circle r="64" fill="none" stroke="#2A0720" stroke-width="5"/><circle r="64" fill="none" stroke="#FF5D9E" stroke-width="1.6" opacity=".6"/>';
    for (var i = 0; i < 8; i++) s += '<path d="M0 0 L' + (64 * Math.cos(i * Math.PI / 4)).toFixed(1) + ' ' + (64 * Math.sin(i * Math.PI / 4)).toFixed(1) + '" stroke="#2A0720" stroke-width="3"/><g transform="rotate(' + (i * 45) + ') translate(0,-64)"><rect x="-7" y="-2" width="14" height="12" rx="3" fill="#2A0720"/><rect x="-4" y="1" width="8" height="6" rx="1.5" fill="' + ['#FFD86E', '#FF9ED0', '#7FD9C4', '#C9A8F0'][i % 4] + '" filter="url(#' + p + '-glow)"/></g>';
    s += '<path d="M-30 118 L0 0 L30 118" stroke="#2A0720" stroke-width="6" fill="none"/><circle r="7" fill="#2A0720"/></g>';
    // big top, tilted 3°, curved stripes
    s += '<g transform="rotate(-3 400 210)">';
    s += '<ellipse cx="400" cy="286" rx="240" ry="14" fill="#20031C"/>';
    var stx = [232, 279, 326, 373, 420, 467, 514];
    for (i = 0; i < 7; i++) {
      s += '<path d="M' + stx[i] + ' 282 C' + (stx[i] + 4) + ' 200 ' + (stx[i] + 14) + ' 140 ' + (400 - (400 - stx[i]) * .18) + ' 96 L' + (400 - (400 - stx[i] - 47) * .18) + ' 96 C' + (stx[i] + 61) + ' 140 ' + (stx[i] + 51) + ' 200 ' + (stx[i] + 47) + ' 282Z" fill="url(#' + p + '-tent' + (i % 2 + 1) + ')"/>';
    }
    // scalloped hem + rim light
    for (i = 0; i < 7; i++) s += '<path d="M' + stx[i] + ' 282 q23.5 16 47 0" fill="none" stroke="#20031C" stroke-width="5"/>';
    s += '<path d="M232 282 C260 160 330 104 400 96 C470 104 540 160 568 282" fill="none" stroke="#FF9ED0" stroke-width="2" opacity=".5"/>';
    // crown + flag + lights
    s += '<path d="M384 96 h32 l-6 -18 h-20Z" fill="#F0B429"/><path d="M400 78 V52 l20 8 -20 9" fill="#FFD86E" stroke="#F0B429" stroke-width="2"/>';
    s += '<path d="M244 270 C310 232 490 232 556 270" stroke="#3A0A2C" stroke-width="2.4" fill="none"/>';
    for (i = 0; i < 11; i++) { var lx = 254 + i * 30; s += '<circle cx="' + lx + '" cy="' + (268 - Math.sin(i / 10 * Math.PI) * 34).toFixed(0) + '" r="3.4" fill="' + (i % 2 ? '#FFD86E' : '#FF9ED0') + '" filter="url(#' + p + '-glow)"/>'; }
    // entrance
    s += '<path d="M368 282 q32 -60 64 0Z" fill="#20031C"/><path d="M376 282 q24 -46 48 0" fill="none" stroke="#F0B429" stroke-width="2" opacity=".8"/>';
    s += '</g>';
    // pennant strings across sky
    s += '<path d="M0 44 C120 78 260 66 380 84" stroke="#3A0A2C" stroke-width="2" fill="none"/>';
    var pr = rng(31);
    for (i = 0; i < 9; i++) { var qx = 22 + i * 42; s += '<path d="M' + qx + ' ' + (48 + Math.sin(i / 2) * 14).toFixed(0) + ' l16 22 h-30Z" fill="' + ['#FF5D9E', '#F0B429', '#7FD9C4', '#C9A8F0'][i % 4] + '" transform="rotate(' + ((pr() - .5) * 14).toFixed(0) + ' ' + qx + ' 58)"/>'; }
    // VEX's oversized shadow — cast on the CREAM stripe band, high contrast
    s += '<g transform="rotate(-3 400 210)" opacity=".58"><g filter="url(#' + p + '-blur2)">' +
      '<path d="M376 128 C382 106 414 102 426 120 C438 136 430 156 412 162 L420 254 L390 254 L396 166 C382 162 372 146 376 128Z" fill="#2A0416"/>' +
      '<path d="M414 116 Q434 98 454 96 M388 118 Q370 100 352 98" stroke="#2A0416" stroke-width="6" stroke-linecap="round" fill="none"/>' +
      '<path d="M426 156 Q450 166 458 190 L458 244" stroke="#2A0416" stroke-width="8" stroke-linecap="round" fill="none"/>' +
      '<path d="M458 186 q0 -12 12 -10" stroke="#2A0416" stroke-width="7" stroke-linecap="round" fill="none"/></g></g>';
    // dice table (foreground, the only grey = loaded die)
    s += '<g transform="translate(150,236) rotate(2)"><path d="M-64 20 h128 l-12 -32 h-104Z" fill="#2A0720"/><path d="M-58 -12 h116 v-5 h-116Z" fill="#F0B429"/><ellipse cx="0" cy="-14" rx="56" ry="7" fill="url(#' + p + '-glow)"/>' +
      '<g transform="translate(-18,-30) rotate(-9)"><rect width="22" height="22" rx="5" fill="#fff" stroke="#241E33" stroke-width="2"/><circle cx="6.5" cy="6.5" r="2" fill="#241E33"/><circle cx="15.5" cy="15.5" r="2" fill="#241E33"/><path d="M3 3 a20 20 0 0 1 8 -1" stroke="#C9C3D6" stroke-width="1.6" fill="none"/></g>' +
      '<g transform="translate(10,-33) rotate(11)"><rect width="22" height="22" rx="5" fill="#E8E4DC" stroke="#8B857B" stroke-width="2"/>' + [[5.5, 5.5], [11, 5.5], [16.5, 5.5], [5.5, 11], [16.5, 11], [5.5, 16.5], [11, 16.5], [16.5, 16.5]].map(function (d) { return '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="1.6" fill="#8B857B"/>'; }).join('') + '</g></g>';
    s += bokeh(12, 87, ['#FFD86E', '#FF9ED0'], 100, 260, 1.6, 4.4, p);
    s += vigR(p) + grain(p);
    reg('carnival', s);
  })();

  /* ============ 8 · LOTUS — trippy dream ============ */
  (function () {
    var p = 'lt', s = '<defs>' +
      rg(p + '-sky', [[0, '#FFF4FA'], [.3, '#FFD6EC'], [.55, '#D6F0E4'], [.78, '#E3D6F8'], [1, '#C4B2F0']], .5, .38, .85) +
      rg(p + '-halo', [[0, '#FFFFFF', .8], [1, '#FFFFFF', 0]]) +
      lg(p + '-pet1', 'v', [[0, '#FFB2D8'], [1, '#FF7FBE']]) +
      lg(p + '-pet2', 'v', [[0, '#FFD2E8'], [1, '#FFA0CC']]) +
      lg(p + '-pet3', 'v', [[0, '#FFE6F2'], [1, '#FFC2DE']]) +
      glowDef(p, 6) + blurDef(p, 10) + grainDef(p, .04) + vig(p, '#B48CD9', .3) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    // concentric swirl ribbons
    var cols = ['#F7A8D8', '#A8E0C8', '#C9B4F2', '#FFD6A8'];
    for (var i = 0; i < 7; i++) {
      var ry = 34 + i * 26, op = .5 - i * .04;
      s += '<path d="M-20 ' + ry + ' Q120 ' + (ry - 26 - i * 3) + ' 300 ' + ry + ' T680 ' + (ry - 10) + '" stroke="' + cols[i % 4] + '" stroke-width="' + (8 + i * 2.4) + '" fill="none" opacity="' + op.toFixed(2) + '"/>';
    }
    s += '<circle cx="320" cy="112" r="60" fill="url(#' + p + '-halo)"/>';
    // dream pool
    s += '<ellipse cx="320" cy="252" rx="300" ry="44" fill="#8FD9BC" opacity=".5"/><ellipse cx="320" cy="256" rx="220" ry="30" fill="#A8E4CC" opacity=".6"/>';
    s += '<path d="M120 244 Q170 238 220 244 M420 258 Q470 250 520 258" stroke="#FFFFFF" stroke-width="2.4" fill="none" opacity=".5"/>';
    // grand lotus — three petal rows
    s += '<g transform="translate(320,214)">';
    s += '<ellipse cy="14" rx="120" ry="18" fill="#5FA886" opacity=".5"/>';
    var rows = [[7, 92, 'url(#' + p + '-pet1)'], [5, 66, 'url(#' + p + '-pet2)'], [3, 42, 'url(#' + p + '-pet3)']];
    rows.forEach(function (row, ri) {
      var n = row[0], len = row[1], fill = row[2];
      for (var k = 0; k < n; k++) {
        var a = (k - (n - 1) / 2) * (ri === 0 ? 24 : ri === 1 ? 28 : 34);
        s += '<g transform="rotate(' + a + ')"><path d="M0 6 C' + (len * .34) + ' -' + (len * .3) + ' ' + (len * .2) + ' -' + (len * .86) + ' 0 -' + len + ' C-' + (len * .2) + ' -' + (len * .86) + ' -' + (len * .34) + ' -' + (len * .3) + ' 0 6Z" fill="' + fill + '"/><path d="M0 -8 V-' + (len * .8) + '" stroke="#FF7FBE" stroke-width="1.4" opacity=".4"/></g>';
      }
    });
    s += '<circle cy="-12" r="13" fill="#FFE05C" filter="url(#' + p + '-glow)"/><circle cy="-12" r="6" fill="#FFF3B0"/></g>';
    // satellite lotuses
    [[120, 236, .5, 0], [532, 240, .6, 8]].forEach(function (q) {
      s += '<g transform="translate(' + q[0] + ',' + q[1] + ') scale(' + q[2] + ') rotate(' + q[3] + ')">';
      for (var k = 0; k < 5; k++) { var a = (k - 2) * 28; s += '<g transform="rotate(' + a + ')"><path d="M0 6 C22 -20 14 -56 0 -66 C-14 -56 -22 -20 0 6Z" fill="url(#' + p + '-pet2)"/></g>'; }
      s += '<circle cy="-10" r="9" fill="#FFE05C"/></g>';
    });
    // dissolving word
    var word = 'REMEMBER';
    for (i = 0; i < word.length; i++) {
      var op2 = 1 - i * .13, wx = 180 + i * 38, wy = 84 + Math.sin(i * .9) * 10;
      s += '<text x="' + wx + '" y="' + wy.toFixed(0) + '" font-family="Sono,monospace" font-weight="600" font-size="23" fill="#B48CD9" opacity="' + Math.max(op2, .06).toFixed(2) + '" transform="rotate(' + (i * 2 - 4) + ' ' + wx + ' ' + wy.toFixed(0) + ')">' + word[i] + '</text>';
      if (i > 3) s += '<path d="M' + (wx + 8) + ' ' + (wy - 18 - i * 2) + ' C' + (wx + 14) + ' ' + (wy - 28 - i * 3) + ' ' + (wx + 4) + ' ' + (wy - 34 - i * 3) + ' ' + (wx + 10) + ' ' + (wy - 44 - i * 4) + '" stroke="#F7A8D8" stroke-width="2" fill="none" opacity="' + (.5 - (i - 4) * .1).toFixed(2) + '"/><ellipse cx="' + (wx + 10) + '" cy="' + (wy - 46 - i * 4) + '" rx="3.4" ry="4.6" fill="#FFB2D8" opacity="' + (.7 - (i - 4) * .12).toFixed(2) + '" transform="rotate(' + (i * 30) + ' ' + (wx + 10) + ' ' + (wy - 46 - i * 4) + ')"/>';
    }
    s += bokeh(16, 93, ['#FFFFFF', '#FFE05C', '#A8E0C8'], 30, 250, 3, 9, p);
    // drowsy Z drift
    s += '<g font-family="Fraunces,serif" font-weight="800" fill="#C9A8F0"><text x="72" y="90" font-size="20" opacity=".8">z</text><text x="90" y="70" font-size="15" opacity=".55">z</text><text x="104" y="54" font-size="11" opacity=".35">z</text></g>';
    s += vigR(p) + grain(p);
    reg('lotus', s);
  })();

  /* ============ 9 · SIREN SHORE ============ */
  (function () {
    var p = 'si', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#0D1430'], [.7, '#1C3A4C'], [1, '#26505C']]) +
      lg(p + '-sea', 'v', [[0, '#1D4152'], [1, '#0A1C26']]) +
      rg(p + '-moon', [[0, '#F2F7F8'], [.6, '#DCE8EA'], [1, '#DCE8EA', 0]]) +
      lg(p + '-rib1', 'h', [[0, '#F0B429', 0], [.2, '#FFD86E'], [.8, '#F0B429'], [1, '#F0B429', 0]]) +
      lg(p + '-rib2', 'h', [[0, '#8B7BB0', 0], [.2, '#A997D4'], [.8, '#8B7BB0'], [1, '#8B7BB0', 0]]) +
      glowDef(p, 5) + blurDef(p, 8) + grainDef(p, .06) + vig(p, '#050D14', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += starfield(40, 15, 150);
    s += '<circle cx="512" cy="64" r="56" fill="url(#' + p + '-moon)" opacity=".5"/><circle cx="512" cy="64" r="27" fill="#EFF5F6"/><path d="M498 52 a18 18 0 0 1 16 -6" stroke="#CBD9DE" stroke-width="2" fill="none" opacity=".7"/><circle cx="504" cy="72" r="4" fill="#CBD9DE" opacity=".5"/><circle cx="521" cy="58" r="2.6" fill="#CBD9DE" opacity=".5"/>';
    // sea with moonpath
    s += '<rect y="168" width="640" height="132" fill="url(#' + p + '-sea)"/>';
    var wr = rng(9);
    for (var i = 0; i < 6; i++) {
      var wy = 176 + i * 20;
      s += '<path d="M0 ' + wy + ' Q80 ' + (wy - 5 - wr() * 4).toFixed(0) + ' 160 ' + wy + ' T320 ' + wy + ' T480 ' + wy + ' T640 ' + wy + '" stroke="#5C93A6" stroke-width="' + (1.4 + i * .3).toFixed(1) + '" fill="none" opacity="' + (.5 - i * .06).toFixed(2) + '"/>';
    }
    for (i = 0; i < 14; i++) s += '<path d="M' + (486 + (wr() - .5) * 60).toFixed(0) + ' ' + (176 + wr() * 110).toFixed(0) + ' h' + (6 + wr() * 16).toFixed(0) + '" stroke="#EAF2F4" stroke-width="1.8" stroke-linecap="round" opacity="' + (.25 + wr() * .4).toFixed(2) + '"/>';
    // rocks + sirens (elegant silhouettes)
    function siren(x, y, sc, hairDir) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')">' +
        '<path d="M-38 96 C-44 40 -18 22 -6 0 C0 -12 -4 -22 4 -30 C18 -22 12 -6 10 6 C24 40 30 70 22 96Z" fill="#0B1826"/>' +
        '<path d="M-2 -26 c0 -12 14 -12 14 0 c0 5 -3 8 -3 12 l7 26 c-8 6 -16 6 -22 0 l7 -26 c-3 -4 -3 -7 -3 -12Z" fill="#101F30"/>' +
        '<path d="M5 -34 a10.5 10.5 0 1 1 .1 0" fill="#101F30"/>' +
        '<path d="M12 -40 C' + (22 * hairDir) + ' -34 ' + (26 * hairDir) + ' -16 ' + (18 * hairDir) + ' 2 C' + (26 * hairDir) + ' 14 ' + (20 * hairDir) + ' 30 ' + (12 * hairDir) + ' 38" stroke="#101F30" stroke-width="7" fill="none" stroke-linecap="round"/>' +
        '<path d="M-14 6 Q-24 14 -26 26 M16 8 Q24 16 25 26" stroke="#101F30" stroke-width="4.6" stroke-linecap="round" fill="none"/></g>';
    }
    s += siren(120, 156, 1, -1) + siren(316, 138, 1.12, 1) + siren(508, 162, .94, 1);
    // song ribbons (flowing, letters riding them)
    s += '<g filter="url(#' + p + '-glow)"><path d="M132 108 C190 74 260 96 320 76 C370 60 420 76 462 62" stroke="url(#' + p + '-rib1)" stroke-width="10" fill="none" opacity=".95"/><text x="188" y="86" font-family="Sono,monospace" font-weight="600" font-size="13" fill="#3A2A0C" letter-spacing="3" transform="rotate(-6 188 86)">SEPARATE</text></g>';
    s += '<path d="M330 96 C390 120 450 108 510 128 C550 140 590 132 626 144" stroke="url(#' + p + '-rib2)" stroke-width="8" fill="none" opacity=".8"/><text x="420" y="118" font-family="Sono,monospace" font-weight="600" font-size="11" fill="#1D2138" letter-spacing="2.4" transform="rotate(5 420 118)">SEPERATE</text>';
    s += '<path d="M96 168 C140 190 200 182 250 200 C296 216 340 208 380 222" stroke="url(#' + p + '-rib2)" stroke-width="7" fill="none" opacity=".6"/><text x="180" y="196" font-family="Sono,monospace" font-weight="600" font-size="10" fill="#1D2138" letter-spacing="2" transform="rotate(6 180 196)">SEPERETE</text>';
    // fog + fg rock frame
    s += '<rect y="150" width="640" height="40" fill="#26505C" opacity=".25" filter="url(#' + p + '-blur)"/>';
    s += '<path d="M0 300 L0 240 C40 226 90 238 120 262 C90 282 50 292 0 300Z" fill="#06111A"/><path d="M640 300 V252 C600 240 556 250 530 272 C560 288 600 296 640 300Z" fill="#06111A"/>';
    s += vigR(p) + grain(p);
    reg('siren', s);
  })();

  /* ============ 10 · GREY SEA — inverted rule ============ */
  (function () {
    var p = 'gs', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#D5D0C6'], [1, '#BDB6AA']]) +
      rg(p + '-sun', [[0, '#E8E3D9'], [.6, '#DAD5CB'], [1, '#DAD5CB', 0]]) +
      rg(p + '-hero', [[0, '#FFC23D', .4], [1, '#FFC23D', 0]]) +
      glowDef(p, 6) + blurDef(p, 6) + grainDef(p, .08) + vig(p, '#4A4438', .4) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<circle cx="500" cy="64" r="52" fill="url(#' + p + '-sun)"/><circle cx="500" cy="64" r="26" fill="#E3DED4"/><circle cx="500" cy="64" r="34" fill="none" stroke="#C9C3B8" stroke-width="1.6" opacity=".7"/>';
    // cliffs with the eye
    s += '<path d="M0 132 L58 54 L96 92 L140 40 L208 96 L232 132Z" fill="#A39B8E"/><path d="M0 132 L58 54 L96 92 L74 132Z" fill="#968D7F"/>';
    s += '<ellipse cx="140" cy="74" rx="12" ry="10" fill="#E8E4DC"/><circle cx="143" cy="75" r="4.6" fill="#4A4438"/><path d="M128 66 q12 -7 24 0" stroke="#4A4438" stroke-width="2.4" fill="none"/>';
    // paper-cut wave strata w/ cut shadows
    var seas = ['#B3ACA0', '#A29A8D', '#918A7C', '#7F786B', '#6E675C'];
    var sr = rng(25);
    for (var i = 0; i < 5; i++) {
      var y0 = 140 + i * 32;
      var d = 'M0 ' + y0, x = 0;
      while (x < 640) { var seg = 50 + sr() * 60; d += ' q' + (seg / 2).toFixed(0) + ' -' + (10 + sr() * 14).toFixed(0) + ' ' + seg.toFixed(0) + ' 0'; x += seg; }
      d += ' L640 300 L0 300Z';
      s += '<path d="' + d + '" fill="#4A4438" opacity=".25" transform="translate(0,4)"/>';
      s += '<path d="' + d + '" fill="' + seas[i] + '"/>';
    }
    // foam strokes + lost letters
    for (i = 0; i < 8; i++) s += '<path d="M' + (30 + sr() * 560).toFixed(0) + ' ' + (150 + sr() * 120).toFixed(0) + ' q' + (8 + sr() * 12).toFixed(0) + ' -4 ' + (18 + sr() * 20).toFixed(0) + ' 0" stroke="#E8E4DC" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="' + (.4 + sr() * .3).toFixed(2) + '"/>';
    var lets = 'LOSTWORDS';
    for (i = 0; i < 7; i++) s += '<text x="' + (60 + sr() * 500).toFixed(0) + '" y="' + (170 + sr() * 110).toFixed(0) + '" font-family="Sono,monospace" font-weight="600" font-size="' + (10 + sr() * 6).toFixed(0) + '" fill="#847C6F" opacity="' + (.4 + sr() * .35).toFixed(2) + '" transform="rotate(' + ((sr() - .5) * 30).toFixed(0) + ')">' + lets[i] + '</text>';
    // whirlpool
    s += '<g transform="translate(552,208)" opacity=".85"><path d="M0 0 a30 30 0 0 1 30 -30 a24 24 0 0 1 -6 44 a17 17 0 0 1 -24 -14 a11 11 0 0 1 14 -10 a6 6 0 0 1 2 8" fill="none" stroke="#55503F" stroke-width="3.6" stroke-linecap="round"/></g>';
    // the boat — the last color in the world
    s += '<ellipse cx="310" cy="170" rx="70" ry="40" fill="url(#' + p + '-hero)"/>';
    s += '<g transform="translate(310,168)">' +
      '<path d="M-38 12 C-26 28 26 28 38 12 L28 0 H-28Z" fill="#6E675C"/><path d="M-38 12 C-26 28 26 28 38 12" fill="none" stroke="#4A4438" stroke-width="2"/>' +
      '<path d="M0 0 V-44 M0 -44 L28 -16 H0" stroke="#55503F" stroke-width="3.4" fill="none"/><path d="M0 -44 L28 -16 H0Z" fill="#8B8477" opacity=".7"/>' +
      '<g transform="translate(-4,-8) scale(1.15)" filter="url(#' + p + '-glow)">' + BIZZY + '</g></g>';
    s += '<path d="M296 190 q14 6 30 0" stroke="#E8E4DC" stroke-width="2.4" fill="none" opacity=".8"/>';
    s += vigR(p) + grain(p);
    reg('greysea', s);
  })();

  /* ============ 11 · THE ENGINE — gothic industrial ============ */
  (function () {
    var p = 'en', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#120D1C'], [1, '#221A2E']]) +
      rg(p + '-core', [[0, '#FFE9A8'], [.3, '#FF6B7E'], [.65, '#C43D5A'], [1, '#C43D5A', 0]]) +
      rg(p + '-coreglow', [[0, '#C43D5A', .5], [1, '#C43D5A', 0]]) +
      lg(p + '-col', 'h', [[0, '#0B0714'], [.5, '#1E1530'], [1, '#0B0714']]) +
      glowDef(p, 6) + blurDef(p, 10) + grainDef(p, .07) + vig(p, '#050308', .62) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // vault ribs
    for (var i = 0; i < 5; i++) s += '<path d="M' + (60 + i * 26) + ' 300 Q320 ' + (-40 + i * 26) + ' ' + (580 - i * 26) + ' 300" stroke="#2A1F3C" stroke-width="3" fill="none" opacity="' + (.5 - i * .07) + '"/>';
    // side columns with gear capitals
    [[52, 1], [132, .8], [508, .8], [588, 1]].forEach(function (c) {
      var x = c[0], sc = c[1];
      s += '<g transform="translate(' + x + ',0) scale(' + sc + ',1)"><rect x="-16" y="70" width="32" height="230" fill="url(#' + p + '-col)"/><path d="M-16 70 h32 M-16 84 h32" stroke="#F0B429" stroke-width="1.4" opacity=".5"/><rect x="-22" y="52" width="44" height="18" fill="#0B0714"/>';
      for (var g = 0; g < 6; g++) s += '<rect x="' + (-22 + g * 8) + '" y="46" width="5" height="8" fill="#0B0714"/>';
      s += '<path d="M-16 120 h32 M-16 190 h32 M-16 258 h32" stroke="#2A1F3C" stroke-width="3"/></g>';
    });
    // hanging chains
    var cr = rng(33);
    for (i = 0; i < 5; i++) {
      var chx = 180 + i * 72;
      s += '<path d="M' + chx + ' 0 V' + (40 + cr() * 40).toFixed(0) + '" stroke="#2A1F3C" stroke-width="3" stroke-dasharray="7 4"/>';
    }
    // the gear rose window
    s += '<ellipse cx="320" cy="128" rx="130" ry="110" fill="url(#' + p + '-coreglow)"/>';
    s += '<g transform="translate(320,120)">';
    for (i = 0; i < 12; i++) s += '<path d="M-9 -74 h18 l4 16 h-26Z" fill="#3A2A44" transform="rotate(' + (i * 30) + ')"/>';
    s += '<circle r="62" fill="#171123" stroke="#3A2A44" stroke-width="9"/><circle r="62" fill="none" stroke="#F0B429" stroke-width="1.2" opacity=".5"/>';
    for (i = 0; i < 8; i++) s += '<path d="M0 -52 L0 -20" stroke="#3A2A44" stroke-width="7" transform="rotate(' + (i * 45) + ')"/>';
    s += '<circle r="40" fill="none" stroke="#3A2A44" stroke-width="5"/><circle r="20" fill="url(#' + p + '-core)" filter="url(#' + p + '-glow)"/><circle r="7" fill="#FFF3D2"/></g>';
    // light rays from core
    s += '<path d="M320 120 L240 300 H400Z" fill="#C43D5A" opacity=".1" filter="url(#' + p + '-blur)"/>';
    // letter-intake streams (gold → grey along path)
    function stream(pts, letters, flip) {
      var out = '<path d="M' + pts + '" stroke="#3A2A44" stroke-width="13" fill="none"/><path d="M' + pts + '" stroke="#221A2E" stroke-width="8" fill="none"/>';
      letters.forEach(function (L, li) {
        var t = li / (letters.length - 1);
        var cols2 = ['#FFD86E', '#E8B85C', '#C39A62', '#9A8B7E', '#7A736A'];
        out += '<text x="' + L[0] + '" y="' + L[1] + '" font-family="Sono,monospace" font-weight="600" font-size="' + (15 - li * 1.4) + '" fill="' + cols2[Math.min(li, 4)] + '" opacity="' + (1 - t * .25).toFixed(2) + '" transform="rotate(' + ((flip ? -1 : 1) * li * 4) + ' ' + L[0] + ' ' + L[1] + ')"' + (li === 0 ? ' filter="url(#' + p + '-glow)"' : '') + '>' + L[2] + '</text>';
      });
      return out;
    }
    s += stream('40 232 C140 210 220 214 268 160', [[52, 226, 'S'], [104, 214, 'T'], [156, 208, 'O'], [206, 200, 'R'], [246, 178, 'Y']], false);
    s += stream('600 240 C500 216 420 220 372 162', [[586, 234, 'N'], [534, 220, 'A'], [482, 214, 'M'], [432, 206, 'E'], [394, 182, 'S']], true);
    // floor + reflection
    s += '<rect y="272" width="640" height="28" fill="#0B0714"/><ellipse cx="320" cy="282" rx="120" ry="9" fill="#C43D5A" opacity=".22" filter="url(#' + p + '-blur)"/>';
    s += '<path d="M180 272 H460" stroke="#F0B429" stroke-width="1.4" opacity=".4"/>';
    // steam
    s += '<path d="M132 60 q8 -18 22 -24 M496 66 q-6 -18 -20 -26" stroke="#3A2A44" stroke-width="7" stroke-linecap="round" fill="none" opacity=".7" filter="url(#' + p + '-blur)"/>';
    s += vigR(p) + grain(p);
    reg('engine', s);
  })();

  /* ============ 12 · HOMECOMING — lamp-lit panorama ============ */
  (function () {
    var p = 'hc', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#141040'], [.6, '#33206A'], [1, '#5A3492']]) +
      rg(p + '-burst1', [[0, '#FFE05C', .9], [1, '#FFE05C', 0]]) +
      rg(p + '-burst2', [[0, '#FF8FC8', .8], [1, '#FF8FC8', 0]]) +
      lg(p + '-water', 'v', [[0, '#241A54'], [1, '#120D30']]) +
      glowDef(p, 4) + blurDef(p, 7) + grainDef(p, .05) + vig(p, '#0A0620', .5) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += starfield(60, 27, 180);
    // fireworks
    function burst(x, y, r0, col, n) {
      var b = '<circle cx="' + x + '" cy="' + y + '" r="' + (r0 * 1.5) + '" fill="url(#' + p + '-burst' + (col === '#FFE05C' ? 1 : 2) + ')" opacity=".5"/>';
      for (var k = 0; k < n; k++) {
        var a = k * Math.PI * 2 / n, x2 = x + Math.cos(a) * r0, y2 = y + Math.sin(a) * r0;
        b += '<path d="M' + (x + Math.cos(a) * r0 * .3).toFixed(0) + ' ' + (y + Math.sin(a) * r0 * .3).toFixed(0) + ' L' + x2.toFixed(0) + ' ' + y2.toFixed(0) + '" stroke="' + col + '" stroke-width="1.8" stroke-linecap="round" opacity=".9"/><circle cx="' + x2.toFixed(0) + '" cy="' + y2.toFixed(0) + '" r="1.8" fill="' + col + '"/>';
      }
      return '<g filter="url(#' + p + '-glow)">' + b + '</g>';
    }
    s += burst(140, 64, 34, '#FFE05C', 12) + burst(520, 48, 26, '#FF8FC8', 10);
    // skyline of ALL worlds (detailed silhouette + warm windows)
    s += '<g fill="#100C2E">' +
      '<path d="M0 260 V196 l16 -12 16 12 v-30 q14 -18 28 0 v30 l14 -10 14 10 V260Z"/>' + // hive domes
      '<path d="M96 260 V208 q22 -30 44 0 V260Z M112 178 h12 l-6 -12Z"/>' + // big top
      '<path d="M156 260 V186 h34 l-6 -16 h-22Z"/>' + // theatre
      '<path d="M204 260 V172 l14 -22 14 22 V260Z"/>' + // rocket/cosmos spire
      '<path d="M246 260 V206 q10 -26 30 -26 q-4 20 8 26 V260Z"/>' + // flask
      '<path d="M298 260 V198 h40 v-14 h-40 l6 -14 h28Z"/>' + // pagoda-ish
      '<path d="M352 260 V190 h30 v70Z M352 190 l15 -18 15 18Z"/>' + // cabinet
      '<path d="M396 260 V210 l22 -32 22 32 V260Z"/>' + // origami peak
      '<path d="M452 260 V196 q24 -34 48 0 V260Z"/>' + // stadium/vibe dome
      '<path d="M514 260 V206 l18 -14 18 14 v-24 l14 -12 14 12 V260Z"/>' + // crossroads towers
      '<path d="M592 260 V216 q24 -22 48 0 V260Z"/></g>';
    // windows
    var wr2 = rng(51), wcols = ['#FFC23D', '#FFD86E', '#FF9ED0', '#7FD9C4'];
    for (var i = 0; i < 30; i++) {
      s += '<rect x="' + (10 + wr2() * 610).toFixed(0) + '" y="' + (196 + wr2() * 52).toFixed(0) + '" width="' + (4 + wr2() * 4).toFixed(0) + '" height="' + (5 + wr2() * 5).toFixed(0) + '" rx="1.4" fill="' + wcols[i % 4] + '" opacity="' + (.65 + wr2() * .35).toFixed(2) + '"/>';
    }
    // lamp strings (two catenaries)
    function lamps(y0, sag, n, seed) {
      var r2 = rng(seed), out = '<path d="M0 ' + y0 + ' Q320 ' + (y0 + sag) + ' 640 ' + (y0 - 8) + '" stroke="#3A2A8C" stroke-width="2" fill="none"/>';
      for (var k = 1; k < n; k++) {
        var t = k / n, lx = 640 * t, ly = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag) + t * t * (y0 - 8);
        var col = wcols[k % 4];
        out += '<g transform="translate(' + lx.toFixed(0) + ',' + ly.toFixed(0) + ')"><path d="M0 0 v5" stroke="#3A2A8C" stroke-width="1.4"/><path d="M-5 5 h10 l-2 12 h-6Z" fill="' + col + '" filter="url(#' + p + '-glow)"/><circle cy="12" r="1.8" fill="#FFF6DC"/></g>';
      }
      return out;
    }
    s += lamps(118, 34, 12, 61) + lamps(148, 26, 9, 67);
    // Bizzy's gold trail
    s += '<path d="M40 96 C200 56 420 66 600 84" stroke="#FFC23D" stroke-width="2.6" stroke-dasharray="1 9" stroke-linecap="round" fill="none" filter="url(#' + p + '-glow)"/>';
    s += '<g transform="translate(600,84) scale(1.2)" filter="url(#' + p + '-glow)">' + BIZZY + '</g>';
    // canal reflection
    s += '<rect y="260" width="640" height="40" fill="url(#' + p + '-water)"/>';
    for (i = 0; i < 14; i++) {
      var rx = 20 + wr2() * 600;
      s += '<path d="M' + rx.toFixed(0) + ' ' + (266 + wr2() * 26).toFixed(0) + ' v' + (4 + wr2() * 9).toFixed(0) + '" stroke="' + wcols[i % 4] + '" stroke-width="2.4" opacity="' + (.3 + wr2() * .3).toFixed(2) + '"/>';
    }
    s += bokeh(10, 81, ['#FFE05C', '#FF8FC8', '#7FD9C4'], 30, 160, 1.6, 4, p);
    s += vigR(p) + grain(p);
    reg('homecoming', s);
  })();

  /* ============ 13 · THE HIVE — honeycomb city interior ============ */
  (function () {
    var p = 'hv', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#3A2008'], [.55, '#5C3410'], [1, '#7A4A16']]) +
      rg(p + '-hall', [[0, '#FFE9AE', .95], [.5, '#FFC23D', .5], [1, '#FFC23D', 0]]) +
      lg(p + '-cell', 'v', [[0, '#FFDE8C'], [1, '#F0A828']]) +
      lg(p + '-honey', 'v', [[0, '#FFCE58'], [1, '#D98E1B']]) +
      glowDef(p, 4) + blurDef(p, 7) + grainDef(p, .05) + vig(p, '#241102', .5) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // hex wall — big depth field of cells, lit ones with dwellers
    var hr = rng(7);
    function hexP(x, y, sz) { return 'M' + x + ' ' + (y - sz) + ' L' + (x + sz * .87) + ' ' + (y - sz / 2) + ' V' + (y + sz / 2) + ' L' + x + ' ' + (y + sz) + ' L' + (x - sz * .87) + ' ' + (y + sz / 2) + ' V' + (y - sz / 2) + ' Z'; }
    for (var row = 0; row < 6; row++) for (var col = 0; col < 14; col++) {
      var hx = 34 + col * 50 + (row % 2) * 25, hy = 34 + row * 44, dist = Math.hypot(hx - 320, hy - 150);
      if (dist < 96) continue;
      var lit = hr() > .6, sz2 = 24;
      s += '<path d="' + hexP(hx, hy, sz2) + '" fill="' + (lit ? 'url(#' + p + '-cell)' : '#4A2A0C') + '" stroke="#2E1806" stroke-width="3"' + (lit ? ' opacity=".95"' : '') + '/>';
      if (lit && hr() > .5) s += '<g transform="translate(' + hx + ',' + (hy + 3) + ') scale(.5)"><circle r="9" fill="#FFC23D"/><path d="M-8 -3 H8 M-8 3 H8" stroke="#3A2A8C" stroke-width="2.6" stroke-linecap="round"/><circle cx="-3" cy="-2" r="1.6" fill="#2B1B5E"/><circle cx="3" cy="-2" r="1.6" fill="#2B1B5E"/></g>';
      else if (lit) s += '<path d="' + hexP(hx, hy, 13) + '" fill="#FFE9AE" opacity=".6" filter="url(#' + p + '-glow)"/>';
    }
    // queen's hall — grand arch, glowing
    s += '<ellipse cx="320" cy="160" rx="120" ry="110" fill="url(#' + p + '-hall)"/>';
    s += '<path d="M240 268 V150 Q320 58 400 150 V268Z" fill="#2E1806"/><path d="M252 268 V154 Q320 74 388 154 V268Z" fill="#FFE9AE" filter="url(#' + p + '-glow)"/>';
    s += '<path d="M262 268 V158 Q320 86 378 158 V268" fill="none" stroke="#E8A620" stroke-width="3"/>';
    // throne dais + tiny queen silhouette
    s += '<path d="M284 268 h72 l-8 -14 h-56Z" fill="#B87A14"/><g transform="translate(320,232)"><circle r="14" fill="#E8A620"/><path d="M-12 -2 H12 M-11 5 H11" stroke="#5C3410" stroke-width="3" stroke-linecap="round"/><circle cx="-4" cy="-5" r="2" fill="#2B1B5E"/><circle cx="4" cy="-5" r="2" fill="#2B1B5E"/><path d="M-8 -13 L-4 -20 L0 -13 L4 -20 L8 -13" stroke="#FFDE8C" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>';
    // honey drips off arch
    [[248, 150], [268, 118], [320, 96], [372, 118], [392, 150]].forEach(function (d, i) {
      var len = 14 + (i % 3) * 12;
      s += '<path d="M' + d[0] + ' ' + d[1] + ' q3 ' + len * .6 + ' 0 ' + len + ' q-4 8 0 12" stroke="url(#' + p + '-honey)" stroke-width="' + (5 - i % 2) + '" stroke-linecap="round" fill="none"/><circle cx="' + d[0] + '" cy="' + (d[1] + len + 16) + '" r="3.4" fill="#FFCE58"/>';
    });
    // floor
    s += '<rect y="268" width="640" height="32" fill="#241102"/><path d="M0 268 H640" stroke="#E8A620" stroke-width="2" opacity=".6"/><ellipse cx="320" cy="278" rx="110" ry="7" fill="#FFC23D" opacity=".2" filter="url(#' + p + '-blur)"/>';
    s += bokeh(14, 31, ['#FFE9AE', '#FFCE58'], 40, 250, 1.6, 4.4, p);
    s += vigR(p) + grain(p);
    reg('hive', s);
  })();

  /* ============ 14 · OPEN SKY — 3-layer flight country ============ */
  (function () {
    var p = 'os', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#7FC4EE'], [.6, '#A8DCF5'], [1, '#D6EFFA']]) +
      rg(p + '-sun', [[0, '#FFFDF2'], [.4, '#FFF3C4', .8], [1, '#FFF3C4', 0]]) +
      glowDef(p, 4) + blurDef(p, 9) + grainDef(p, .035) + vig(p, '#3A6E96', .28) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<circle cx="96" cy="56" r="88" fill="url(#' + p + '-sun)"/><circle cx="96" cy="56" r="26" fill="#FFFBEA"/>';
    // LAYER 3 (far) — soft blurred clouds
    var cr = rng(11);
    for (var i = 0; i < 5; i++) {
      var cx = cr() * 640, cy = 40 + cr() * 90;
      s += '<g transform="translate(' + cx.toFixed(0) + ',' + cy.toFixed(0) + ')" opacity=".55" filter="url(#' + p + '-blur)"><ellipse rx="60" ry="16" fill="#FFFFFF"/><ellipse cx="-24" cy="-10" rx="30" ry="13" fill="#FFFFFF"/></g>';
    }
    // vowels printed in cloud-shadow
    ['A', 'E', 'O'].forEach(function (v, vi) {
      s += '<text x="' + (200 + vi * 150) + '" y="' + (74 + vi * 26) + '" font-family="Sono,monospace" font-weight="600" font-size="30" fill="#8FC6E8" opacity=".7">' + v + '</text>';
    });
    // LAYER 2 (mid) — sculpted cumulus with shading
    function cloud(x, y, sc, op) {
      return '<g transform="translate(' + x + ',' + y + ') scale(' + sc + ')" opacity="' + op + '">' +
        '<path d="M-70 12 Q-70 -10 -46 -12 Q-42 -34 -16 -30 Q-4 -48 22 -38 Q46 -44 52 -22 Q76 -20 72 2 Q78 14 62 16 L-62 16 Q-74 16 -70 12Z" fill="#FFFFFF"/>' +
        '<path d="M-46 -12 Q-42 -34 -16 -30 Q-4 -48 22 -38" fill="none" stroke="#EAF6FD" stroke-width="5"/>' +
        '<path d="M-60 14 Q-20 4 30 12 Q52 8 66 14" stroke="#BFE0F2" stroke-width="6" fill="none" opacity=".8"/></g>';
    }
    s += cloud(150, 150, 1, .96) + cloud(430, 110, .8, .92) + cloud(590, 180, .7, .9);
    // honey pot parked on cloud shelf
    s += '<g transform="translate(430,92)"><path d="M-14 8 q-4 -18 14 -18 q18 0 14 18 q-2 10 -14 10 q-12 0 -14 -10Z" fill="#E8A620"/><path d="M-12 -6 h24 v-6 h-24Z" fill="#B87A14"/><path d="M-8 -2 q8 5 16 0" stroke="#FFDE8C" stroke-width="2.4" fill="none"/><path d="M-4 -12 q2 -8 8 -10" stroke="#B87A14" stroke-width="2" fill="none"/></g>';
    // thorn brambles closing in from edges
    function bramble(mirror) {
      var g = '<g transform="translate(' + (mirror ? 640 : 0) + ',0) scale(' + (mirror ? -1 : 1) + ',1)">';
      g += '<path d="M0 0 C30 40 18 110 44 160 C60 196 50 250 70 300 L0 300Z" fill="#1E4A30"/>';
      [[16, 50, 30], [30, 120, 38], [46, 190, 30], [58, 250, 36]].forEach(function (t) {
        g += '<path d="M' + t[0] + ' ' + t[1] + ' q' + t[2] + ' -6 ' + (t[2] + 18) + ' 8" stroke="#1E4A30" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M' + (t[0] + t[2] - 4) + ' ' + (t[1] - 4) + ' l8 -10 M' + (t[0] + t[2] + 6) + ' ' + t[1] + ' l10 -6" stroke="#16382438" stroke-width="0" fill="none"/><path d="M' + (t[0] + t[2] - 2) + ' ' + (t[1] - 2) + ' l7 -9 M' + (t[0] + t[2] + 8) + ' ' + (t[1] + 2) + ' l9 -5" stroke="#163824" stroke-width="4" stroke-linecap="round"/>';
      });
      return g + '</g>';
    }
    s += bramble(false) + bramble(true);
    // Bizzy mid-flight with speed streaks
    s += '<path d="M180 220 C260 200 330 214 400 198" stroke="#FFC23D" stroke-width="2.4" stroke-dasharray="1 8" stroke-linecap="round" fill="none" filter="url(#' + p + '-glow)"/>';
    s += '<g transform="translate(408,190) scale(1.35)" filter="url(#' + p + '-glow)">' + BIZZY + '</g>';
    s += '<path d="M120 232 h30 M110 244 h22 M132 256 h26" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".8"/>';
    // LAYER 1 (near) — fast bottom cloud rushing by
    s += '<path d="M0 300 V272 Q60 252 140 268 Q220 250 320 266 Q420 248 520 264 Q580 254 640 268 V300Z" fill="#FFFFFF" opacity=".95"/>';
    s += '<path d="M40 276 q40 -10 90 -2 M300 268 q50 -10 100 -2" stroke="#D6ECF8" stroke-width="5" fill="none"/>';
    s += vigR(p) + grain(p);
    reg('opensky', s);
  })();

  /* ============ 15 · CRITTER POND — dawn-mint garden ============ */
  (function () {
    var p = 'pd', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#D8F0DC'], [.5, '#BCE4C8'], [1, '#9AD4B0']]) +
      lg(p + '-water', 'v', [[0, '#7FC9B0'], [1, '#3E8A78']]) +
      rg(p + '-mist', [[0, '#FFFFFF', .55], [1, '#FFFFFF', 0]]) +
      glowDef(p, 3) + blurDef(p, 8) + grainDef(p, .04) + vig(p, '#2A5C48', .3) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<circle cx="520" cy="60" r="34" fill="#FFF7DC" opacity=".9" filter="url(#' + p + '-blur)"/>';
    // far hedge + mist
    s += '<path d="M0 130 Q100 108 200 124 Q320 104 450 122 Q560 108 640 124 V180 H0Z" fill="#6FB08C" opacity=".8"/>';
    s += '<ellipse cx="320" cy="140" rx="280" ry="26" fill="url(#' + p + '-mist)"/>';
    // pond
    s += '<path d="M0 172 Q160 156 320 166 Q480 154 640 168 V300 H0Z" fill="url(#' + p + '-water)"/>';
    var wr = rng(13);
    for (var i = 0; i < 7; i++) s += '<ellipse cx="' + (60 + wr() * 520).toFixed(0) + '" cy="' + (190 + wr() * 90).toFixed(0) + '" rx="' + (22 + wr() * 30).toFixed(0) + '" ry="3" fill="none" stroke="#BDEBD8" stroke-width="1.6" opacity="' + (.35 + wr() * .3).toFixed(2) + '"/>';
    // koi under surface
    function koi(x, y, rot, sc, col) {
      return '<g transform="translate(' + x + ',' + y + ') rotate(' + rot + ') scale(' + sc + ')" opacity=".65"><path d="M-20 0 Q-4 -10 12 0 Q-4 10 -20 0 M12 0 l12 -7 -3 7 3 7Z" fill="' + col + '"/><circle cx="0" cy="-2" r="4" fill="#E86A3C"/><circle cx="-10" cy="2" r="3" fill="#E86A3C"/></g>';
    }
    s += koi(180, 226, 12, 1.1, '#F6F0E4') + koi(420, 250, -160, .9, '#F6F0E4') + koi(310, 210, 40, .7, '#FBDFC4');
    // lily pads + blooming lotus
    [[120, 200, 1], [250, 240, 1.3], [480, 214, 1], [560, 252, .8]].forEach(function (L) {
      s += '<g transform="translate(' + L[0] + ',' + L[1] + ') scale(' + L[2] + ')"><path d="M-26 0 A26 12 0 1 1 26 0 L8 -3 Z" fill="#4E9A5E"/><path d="M-20 -2 A22 9 0 0 1 18 -4" stroke="#7FC98A" stroke-width="2" fill="none"/></g>';
    });
    s += '<g transform="translate(250,232)">' + [0, 40, 80, 120, 160, -40, -80].map(function (a) { return '<g transform="rotate(' + a + ')"><path d="M0 2 C8 -8 6 -22 0 -26 C-6 -22 -8 -8 0 2Z" fill="#F7A8C8"/></g>'; }).join('') + '<circle r="5" fill="#FFD86E" filter="url(#' + p + '-glow)"/></g>';
    // reeds + cattails frame
    for (i = 0; i < 8; i++) {
      var rx = i < 4 ? 14 + i * 20 : 560 + (i - 4) * 22, rh = 60 + (i % 3) * 30;
      s += '<path d="M' + rx + ' 300 q' + ((i % 2 ? 1 : -1) * 8) + ' -' + rh / 2 + ' 2 -' + rh + '" stroke="#3E7A50" stroke-width="4" fill="none" stroke-linecap="round"/>';
      if (i % 2) s += '<ellipse cx="' + (rx + 2) + '" cy="' + (300 - rh - 10) + '" rx="4.6" ry="13" fill="#7A5A34"/>';
    }
    // willow fronds top frame
    for (i = 0; i < 9; i++) {
      var wx = 20 + i * 74;
      s += '<path d="M' + wx + ' -6 q' + ((i % 2 ? 1 : -1) * 14) + ' 40 4 ' + (46 + (i % 3) * 22) + '" stroke="#5EA46E" stroke-width="3.4" fill="none" stroke-linecap="round"/>';
      for (var lf = 0; lf < 4; lf++) s += '<ellipse cx="' + (wx + (i % 2 ? 6 : -2)) + '" cy="' + (14 + lf * 14) + '" rx="2.6" ry="7" fill="#79BC85" transform="rotate(' + ((i % 2 ? 1 : -1) * 26) + ' ' + wx + ' ' + (14 + lf * 14) + ')"/>';
    }
    // dragonfly with letter wings
    s += '<g transform="translate(392,150)" filter="url(#' + p + '-glow)"><ellipse cx="-9" cy="-6" rx="12" ry="4.6" fill="#BDEBF2" opacity=".85" transform="rotate(-24)"/><ellipse cx="9" cy="-6" rx="12" ry="4.6" fill="#BDEBF2" opacity=".85" transform="rotate(24)"/><path d="M0 -2 L2 20" stroke="#2E6A8C" stroke-width="3.6" stroke-linecap="round"/><circle cy="-4" r="3.4" fill="#2E6A8C"/></g>';
    s += '<path d="M330 158 C350 140 372 148 390 152" stroke="#8FD9BC" stroke-width="1.8" stroke-dasharray="1 6" fill="none"/>';
    s += bokeh(10, 41, ['#FFFFFF', '#D8F5C4'], 40, 200, 2, 5, p);
    s += vigR(p) + grain(p);
    reg('pond', s);
  })();

  /* ============ 16 · ORIGAMI GORGE — folded paper world ============ */
  (function () {
    var p = 'og', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#F4E8D8'], [1, '#E8CFAE']]) +
      lg(p + '-cliffL', 'd', [[0, '#E8896A'], [1, '#B9502F']]) +
      lg(p + '-cliffR', 'd', [[0, '#D9694A'], [1, '#A03E22']]) +
      grainDef(p, .05) + glowDef(p, 3) + vig(p, '#8A4A2C', .32) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    // geometric sun — faceted
    s += '<g transform="translate(480,66)"><path d="M0 -34 L10 -10 L34 0 L10 10 L0 34 L-10 10 L-34 0 L-10 -10Z" fill="#F0B429"/><path d="M0 -34 L10 -10 L0 0 Z M34 0 L10 10 L0 0Z" fill="#FFD86E"/><path d="M0 34 L-10 10 L0 0Z M-34 0 L-10 -10 L0 0Z" fill="#D98E1B"/></g>';
    // paper cranes
    [[150, 60, 1, -6], [260, 96, .7, 8], [370, 50, .55, -10]].forEach(function (c) {
      s += '<g transform="translate(' + c[0] + ',' + c[1] + ') scale(' + c[2] + ') rotate(' + c[3] + ')"><path d="M0 0 L-26 -8 L-6 -4Z" fill="#E8E0D2"/><path d="M0 0 L-6 -4 L4 -18 L8 -2Z" fill="#FFFFFF"/><path d="M4 -18 L8 -2 L22 -10Z" fill="#D9CFC0"/><path d="M8 -2 L22 -10 L30 2 L12 4Z" fill="#F4EDE2"/><path d="M0 0 L12 4 L8 12Z" fill="#C9BEAC"/></g>';
    });
    // faceted cliffs — left & right, crease highlights
    s += '<g><path d="M0 62 L96 84 L74 140 L128 168 L96 226 L150 258 L118 300 L0 300Z" fill="url(#' + p + '-cliffL)"/>' +
      '<path d="M0 62 L96 84 L74 140 L0 118Z" fill="#F09A78" opacity=".7"/><path d="M74 140 L128 168 L96 226 L34 196Z" fill="#C9603C" opacity=".8"/>' +
      '<path d="M96 84 L74 140 M128 168 L96 226 M150 258 L118 300" stroke="#8A3418" stroke-width="2"/><path d="M0 62 L96 84 M74 140 L128 168 M96 226 L150 258" stroke="#FBD0BC" stroke-width="2.2"/></g>';
    s += '<g><path d="M640 48 L530 78 L560 132 L498 166 L540 224 L482 254 L520 300 L640 300Z" fill="url(#' + p + '-cliffR)"/>' +
      '<path d="M640 48 L530 78 L560 132 L640 108Z" fill="#E87A56" opacity=".65"/><path d="M498 166 L540 224 L482 254 L448 200Z" fill="#B04A28" opacity=".55"/>' +
      '<path d="M530 78 L560 132 M498 166 L540 224 M482 254 L520 300" stroke="#7A2E12" stroke-width="2"/><path d="M640 48 L530 78 M560 132 L498 166 M540 224 L482 254" stroke="#F7C4AC" stroke-width="2.2"/></g>';
    // accordion bridge across the gorge
    s += '<g>';
    var bx = 128, by = 190, seg = 34;
    for (var i = 0; i < 11; i++) {
      var x1 = bx + i * seg, y1 = by + (i % 2 ? 10 : 0) + i * 1.4, x2 = x1 + seg, y2 = by + ((i + 1) % 2 ? 10 : 0) + (i + 1) * 1.4;
      s += '<path d="M' + x1 + ' ' + y1 + ' L' + x2 + ' ' + y2 + ' L' + x2 + ' ' + (y2 + 12) + ' L' + x1 + ' ' + (y1 + 12) + 'Z" fill="' + (i % 2 ? '#FFFFFF' : '#E3D8C4') + '" stroke="#B9A88C" stroke-width="1.4"/>';
    }
    s += '<path d="M' + bx + ' ' + (by - 22) + ' Q' + (bx + 5.5 * seg) + ' ' + (by + 14) + ' ' + (bx + 11 * seg) + ' ' + (by - 6) + '" stroke="#8A6A42" stroke-width="2.4" fill="none"/></g>';
    // gorge depth below bridge
    s += '<path d="M118 300 L150 258 L200 280 L280 268 L380 284 L460 262 L482 254 L520 300Z" fill="#8A4A2C" opacity=".5"/>';
    // folded boat sailing the gorge river
    s += '<path d="M180 288 Q320 274 470 286" stroke="#7FB8D8" stroke-width="10" fill="none" opacity=".7"/>';
    s += '<g transform="translate(300,272) rotate(-3)"><path d="M-22 8 L22 8 L12 16 L-12 16Z" fill="#FFFFFF" stroke="#B9A88C" stroke-width="1.4"/><path d="M-22 8 L0 8 L0 -12Z" fill="#F4EDE2" stroke="#B9A88C" stroke-width="1.4"/><path d="M0 8 L22 8 L0 -12Z" fill="#D9CFC0" stroke="#B9A88C" stroke-width="1.4"/></g>';
    // dotted fold-guides in sky
    s += '<path d="M60 40 L200 20 M420 30 L560 16" stroke="#C9B394" stroke-width="1.6" stroke-dasharray="4 5"/>';
    s += '<text x="320" y="42" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="13" fill="#B08A5C" letter-spacing="3">FOLD · CREASE · UNFOLD</text>';
    s += vigR(p) + grain(p);
    reg('origami', s);
  })();

  /* ============ 17 · VIBE STUDIO — beat highway ============ */
  (function () {
    var p = 'vb', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#160B2E'], [1, '#2E1054']]) +
      lg(p + '-hwy', 'v', [[0, '#4A1E8C'], [1, '#7C3AE0']]) +
      lg(p + '-laser1', 'v', [[0, '#FF5D9E', .8], [1, '#FF5D9E', 0]]) +
      lg(p + '-laser2', 'v', [[0, '#36E0C8', .7], [1, '#36E0C8', 0]]) +
      glowDef(p, 5) + blurDef(p, 8) + grainDef(p, .06) + vig(p, '#0A0518', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // equalizer skyline
    var er = rng(17);
    for (var i = 0; i < 32; i++) {
      var eh = 20 + er() * 90, ex = i * 20;
      s += '<rect x="' + ex + '" y="' + (170 - eh).toFixed(0) + '" width="14" height="' + eh.toFixed(0) + '" fill="#241048"/><rect x="' + ex + '" y="' + (170 - eh).toFixed(0) + '" width="14" height="5" fill="' + ['#FF5D9E', '#36E0C8', '#FFD86E', '#C9A8F0'][i % 4] + '" filter="url(#' + p + '-glow)"/>';
    }
    // laser fans
    s += '<path d="M120 0 L60 170 L180 170Z" fill="url(#' + p + '-laser1)" opacity=".5"/><path d="M520 0 L460 170 L580 170Z" fill="url(#' + p + '-laser2)" opacity=".5"/>';
    // beat highway receding to vanishing point
    s += '<path d="M240 300 L306 128 L334 128 L400 300Z" fill="url(#' + p + '-hwy)"/>';
    s += '<path d="M306 128 L240 300 M334 128 L400 300" stroke="#FF5D9E" stroke-width="3" filter="url(#' + p + '-glow)"/>';
    for (i = 0; i < 6; i++) {
      var t = i / 6, y = 128 + (300 - 128) * t * t, w2 = 28 + (160 - 28) * t * t;
      s += '<path d="M' + (320 - w2 / 2) + ' ' + y.toFixed(0) + ' H' + (320 + w2 / 2) + '" stroke="#B98CF5" stroke-width="' + (1 + t * 3).toFixed(1) + '" opacity="' + (.9 - t * .4).toFixed(2) + '"/>';
    }
    // beat-note letter tiles riding the lanes
    [[.3, 'B', '#FFD86E'], [.55, 'O', '#36E0C8'], [.8, 'P', '#FF5D9E']].forEach(function (n) {
      var t = n[0], y = 128 + 172 * t * t, sz2 = 12 + 26 * t;
      s += '<g transform="translate(320,' + y.toFixed(0) + ')" filter="url(#' + p + '-glow)"><rect x="' + (-sz2 / 2) + '" y="' + (-sz2 / 2) + '" width="' + sz2 + '" height="' + sz2 + '" rx="' + (sz2 * .22) + '" fill="' + n[2] + '"/><text y="' + (sz2 * .32) + '" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="' + (sz2 * .66) + '" fill="#160B2E">' + n[1] + '</text></g>';
    });
    // speaker towers
    function speaker(x, flip) {
      var g = '<g transform="translate(' + x + ',150)' + (flip ? ' scale(-1,1)' : '') + '">';
      g += '<rect x="0" y="0" width="74" height="150" rx="8" fill="#1C0E38" stroke="#3A1E6E" stroke-width="3"/>';
      [[37, 38, 22], [37, 96, 30]].forEach(function (sp) {
        g += '<circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="' + sp[2] + '" fill="#0E0722" stroke="#4A2E8C" stroke-width="3"/><circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="' + (sp[2] * .45) + '" fill="#36E0C8" opacity=".9" filter="url(#' + p + '-glow)"/><circle cx="' + sp[0] + '" cy="' + sp[1] + '" r="' + (sp[2] * .72) + '" fill="none" stroke="#5C3AA8" stroke-width="2"/>';
      });
      return g + '</g>';
    }
    s += speaker(26, false) + speaker(614, true);
    // sound rings pulsing from speakers
    for (i = 0; i < 3; i++) s += '<circle cx="63" cy="246" r="' + (34 + i * 16) + '" fill="none" stroke="#36E0C8" stroke-width="1.6" opacity="' + (.4 - i * .12) + '"/><circle cx="577" cy="246" r="' + (34 + i * 16) + '" fill="none" stroke="#FF5D9E" stroke-width="1.6" opacity="' + (.4 - i * .12) + '"/>';
    // floating notes
    var nr = rng(23);
    for (i = 0; i < 6; i++) {
      var nx2 = 120 + nr() * 400, ny = 40 + nr() * 80;
      s += '<path d="M' + nx2.toFixed(0) + ' ' + ny.toFixed(0) + ' q0 -12 9 -12 v18 q0 5 -5 5 t-4 -5Z" fill="' + ['#FFD86E', '#FF9ED0', '#7FE8D8'][i % 3] + '" opacity="' + (.5 + nr() * .5).toFixed(2) + '" filter="url(#' + p + '-glow)" transform="rotate(' + ((nr() - .5) * 24).toFixed(0) + ' ' + nx2.toFixed(0) + ' ' + ny.toFixed(0) + ')"/>';
    }
    // stage floor glow
    s += '<path d="M0 300 H640 V286 Q320 270 0 286Z" fill="#36E0C8" opacity=".14" filter="url(#' + p + '-blur)"/>';
    s += vigR(p) + grain(p);
    reg('vibe', s);
  })();

  /* ============ 18 · DINO VALLEY — sunset runner zones ============ */
  (function () {
    var p = 'dv', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#FFB25C'], [.5, '#F08A4A'], [1, '#D9633C']]) +
      rg(p + '-sun', [[0, '#FFF3D2'], [.5, '#FFD98E', .8], [1, '#FFD98E', 0]]) +
      lg(p + '-cliff', 'v', [[0, '#B0543A'], [1, '#7A3424']]) +
      lg(p + '-scrub', 'v', [[0, '#8A6A3C'], [1, '#5C4224']]) +
      glowDef(p, 3) + blurDef(p, 7) + grainDef(p, .05) + vig(p, '#5C2410', .4) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += '<circle cx="320" cy="118" r="110" fill="url(#' + p + '-sun)"/><circle cx="320" cy="118" r="44" fill="#FFEFC4"/>';
    // pterosaur silhouettes
    [[150, 60, 1], [220, 44, .6], [470, 70, .8]].forEach(function (b) {
      s += '<path d="M' + b[0] + ' ' + b[1] + ' q' + 10 * b[2] + ' -' + 8 * b[2] + ' ' + 20 * b[2] + ' 0 q6 -3 ' + 12 * b[2] + ' 2 q-' + 8 * b[2] + ' -2 -' + 14 * b[2] + ' 2 q-' + 8 * b[2] + ' -6 -' + 18 * b[2] + ' -4Z" fill="#6E2A16" opacity=".8"/>';
    });
    // ZONE: cliffs (mid) — stratified mesas
    s += '<path d="M0 168 V96 h70 l14 20 h52 V168Z" fill="url(#' + p + '-cliff)"/><path d="M0 120 h70 M14 142 h108" stroke="#8A3E28" stroke-width="4"/><path d="M0 96 h70 l14 20 h52" stroke="#D9784E" stroke-width="2.4" fill="none"/>';
    s += '<path d="M508 168 V88 h64 l16 24 h52 V168Z" fill="url(#' + p + '-cliff)"/><path d="M508 116 h64 M524 140 h116" stroke="#8A3E28" stroke-width="4"/><path d="M508 88 h64 l16 24 h52" stroke="#D9784E" stroke-width="2.4" fill="none"/>';
    // long-neck silhouette against sun
    s += '<g fill="#5C2410"><path d="M330 168 q-4 -34 18 -44 q22 -8 24 -30 q1 -12 12 -12 q10 0 9 10 q-2 26 -22 38 q-16 10 -14 38Z"/><ellipse cx="352" cy="172" rx="34" ry="14"/><path d="M330 178 l-4 14 h8Z M372 178 l4 14 h-8Z"/><circle cx="391" cy="84" r="7"/></g>';
    // ZONE: nest (right mid) — eggs on straw mound
    s += '<g transform="translate(560,214)"><ellipse rx="44" ry="12" fill="#A8742E"/><path d="M-40 0 q10 -8 20 0 M-8 2 q10 -9 22 -1 M14 0 q10 -7 22 1" stroke="#7A5220" stroke-width="2.4" fill="none"/>' +
      '<ellipse cx="-14" cy="-12" rx="10" ry="13" fill="#F4E8D0"/><ellipse cx="8" cy="-14" rx="9" ry="12" fill="#EFDDBC"/><path d="M4 -20 l4 5 4 -6 4 5" stroke="#C9A870" stroke-width="1.6" fill="none"/>' +
      '<ellipse cx="26" cy="-10" rx="8" ry="11" fill="#F4E8D0"/><path d="M-18 -16 l4 4 3 -5" stroke="#C9A870" stroke-width="1.4" fill="none"/></g>';
    // ZONE: scrub (foreground) — runner ground with ferns
    s += '<path d="M0 232 Q160 218 320 228 Q480 216 640 230 V300 H0Z" fill="url(#' + p + '-scrub)"/>';
    s += '<path d="M0 232 Q160 218 320 228 Q480 216 640 230" stroke="#D9A860" stroke-width="3" fill="none"/>';
    var fr = rng(29);
    for (var i = 0; i < 9; i++) {
      var fx = 30 + fr() * 580, fy = 252 + fr() * 34, fs = .5 + fr() * .8;
      s += '<g transform="translate(' + fx.toFixed(0) + ',' + fy.toFixed(0) + ') scale(' + fs.toFixed(2) + ')">' + [-40, -15, 15, 40].map(function (a) { return '<path d="M0 0 Q' + a * .4 + ' -18 ' + a + ' -26" stroke="#3E5C28" stroke-width="4" fill="none" stroke-linecap="round"/>' + '<path d="M' + a * .5 + ' -12 l' + (a > 0 ? 7 : -7) + ' -2 M' + a * .7 + ' -19 l' + (a > 0 ? 6 : -6) + ' -2" stroke="#4E7232" stroke-width="3" stroke-linecap="round"/>'; }).join('') + '</g>';
    }
    // runner dust + baby dino hatchling
    s += '<g transform="translate(150,258)"><ellipse cx="-20" cy="6" rx="16" ry="5" fill="#C9955C" opacity=".6" filter="url(#' + p + '-blur)"/><path d="M-6 -8 q8 -14 22 -10 q14 4 12 16 q-2 10 -14 10 h-12 q-10 0 -8 -16Z" fill="#7FBF5C"/><path d="M16 -16 q4 -8 12 -8 l-2 8Z" fill="#5C9A3E"/><circle cx="20" cy="-8" r="2.6" fill="#24380E"/><path d="M26 -2 q5 2 8 0" stroke="#24380E" stroke-width="1.8" fill="none"/><path d="M-2 8 l-3 8 M10 8 l2 8" stroke="#5C9A3E" stroke-width="3.4" stroke-linecap="round"/><path d="M-14 -12 l5 4 4 -6 4 5" stroke="#F4E8D0" stroke-width="2" fill="none"/></g>';
    s += bokeh(8, 47, ['#FFD98E', '#FFB25C'], 60, 220, 1.6, 4, p);
    s += vigR(p) + grain(p);
    reg('dino', s);
  })();

  /* ============ 19 · ENCHANTED FOREST — bioluminous night ============ */
  (function () {
    var p = 'ef', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#0A1E28'], [.6, '#0E3030'], [1, '#144038']]) +
      rg(p + '-grove', [[0, '#7FE8C8', .5], [.6, '#3EA88C', .2], [1, '#3EA88C', 0]]) +
      lg(p + '-trunk', 'h', [[0, '#0A2420'], [.5, '#1C4A3C'], [1, '#0A2420']]) +
      glowDef(p, 5) + blurDef(p, 8) + grainDef(p, .06) + vig(p, '#03100E', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // god rays
    s += '<path d="M280 0 L240 300 L300 300 L330 0Z" fill="#7FE8C8" opacity=".06"/><path d="M380 0 L360 300 L400 300 L410 0Z" fill="#7FE8C8" opacity=".05"/>';
    // far trunks (blurred)
    [[70, 20], [180, 14], [540, 18], [460, 12]].forEach(function (t) {
      s += '<rect x="' + t[0] + '" y="0" width="' + t[1] + '" height="300" fill="#0C2A24" filter="url(#' + p + '-blur)" opacity=".8"/>';
    });
    // guardian grove tree — center, gentle face
    s += '<ellipse cx="320" cy="170" rx="150" ry="130" fill="url(#' + p + '-grove)"/>';
    s += '<g transform="translate(320,0)"><path d="M-34 300 C-40 220 -26 160 -30 96 Q-34 60 0 54 Q34 60 30 96 C26 160 40 220 34 300Z" fill="url(#' + p + '-trunk)"/>' +
      '<path d="M-30 96 Q-60 80 -78 48 M30 96 Q60 80 78 48 M-14 62 Q-18 30 -6 8 M14 62 Q18 30 6 8" stroke="#0A2420" stroke-width="12" stroke-linecap="round" fill="none"/>' +
      // glowing canopy blobs
      '<ellipse cx="-78" cy="40" rx="40" ry="26" fill="#1E5C48"/><ellipse cx="78" cy="40" rx="40" ry="26" fill="#1E5C48"/><ellipse cx="0" cy="6" rx="52" ry="30" fill="#246E54"/>' +
      '<circle cx="-64" cy="34" r="3" fill="#9FF5D8" filter="url(#' + p + '-glow)"/><circle cx="-88" cy="46" r="2.4" fill="#9FF5D8" filter="url(#' + p + '-glow)"/><circle cx="70" cy="30" r="3" fill="#9FF5D8" filter="url(#' + p + '-glow)"/><circle cx="12" cy="0" r="3" fill="#9FF5D8" filter="url(#' + p + '-glow)"/><circle cx="-18" cy="12" r="2.4" fill="#9FF5D8" filter="url(#' + p + '-glow)"/>' +
      // the face — closed kind eyes + knot mouth
      '<path d="M-16 140 q6 6 12 0 M4 140 q6 6 12 0" stroke="#7FE8C8" stroke-width="2.6" stroke-linecap="round" fill="none" filter="url(#' + p + '-glow)"/>' +
      '<ellipse cx="0" cy="164" rx="7" ry="9" fill="#0A2420" stroke="#3EA88C" stroke-width="1.6"/></g>';
    // bioluminescent mushrooms
    [[120, 264, 1.2, '#5CC1E8'], [190, 280, .8, '#C9A8F0'], [480, 270, 1, '#5CC1E8'], [560, 284, 1.3, '#F2A8C4'], [420, 286, .7, '#7FE8C8']].forEach(function (m) {
      s += '<g transform="translate(' + m[0] + ',' + m[1] + ') scale(' + m[2] + ')"><path d="M-3 0 h6 l2 -14 h-10Z" fill="#DCE8E0" opacity=".9"/><path d="M-16 -12 a16 10 0 0 1 32 0Z" fill="' + m[3] + '" filter="url(#' + p + '-glow)"/><circle cx="-6" cy="-16" r="1.6" fill="#fff" opacity=".8"/><ellipse cx="0" cy="2" rx="14" ry="3" fill="' + m[3] + '" opacity=".25" filter="url(#' + p + '-blur)"/></g>';
    });
    // glow flora spirals
    s += '<path d="M80 300 q-6 -40 14 -60 q16 -16 10 -36" stroke="#3EA88C" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="104" cy="204" r="5" fill="#9FF5D8" filter="url(#' + p + '-glow)"/>';
    s += '<path d="M580 300 q8 -36 -10 -56 q-14 -16 -8 -32" stroke="#3EA88C" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="562" cy="212" r="5" fill="#C9A8F0" filter="url(#' + p + '-glow)"/>';
    // fireflies — spelling a faint word
    var fr2 = rng(53);
    for (var i = 0; i < 18; i++) s += '<circle cx="' + (60 + fr2() * 520).toFixed(0) + '" cy="' + (60 + fr2() * 180).toFixed(0) + '" r="' + (1.2 + fr2() * 1.8).toFixed(1) + '" fill="#FFE982" opacity="' + (.4 + fr2() * .6).toFixed(2) + '" filter="url(#' + p + '-glow)"/>';
    s += '<text x="320" y="248" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="13" fill="#7FE8C8" letter-spacing="6" opacity=".7" filter="url(#' + p + '-glow)">GUARDIAN</text>';
    // fg ferns
    s += '<path d="M0 300 Q30 258 8 236 M22 300 Q52 264 36 240" stroke="#1E5C48" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M640 300 Q606 260 626 236 M616 300 Q586 266 602 244" stroke="#1E5C48" stroke-width="7" fill="none" stroke-linecap="round"/>';
    s += vigR(p) + grain(p);
    reg('forest', s);
  })();

  /* ============ 20 · WILDHEARTS FLYWAY — migration sky-river ============ */
  (function () {
    var p = 'fw', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#2E1E5C'], [.45, '#8A4A7C'], [.75, '#E8845C'], [1, '#FFB86E']]) +
      rg(p + '-sun', [[0, '#FFF3D2'], [.5, '#FFC98E', .7], [1, '#FFC98E', 0]]) +
      lg(p + '-riv', 'h', [[0, '#FFD86E', 0], [.2, '#FFD86E', .7], [.8, '#FFB25C', .7], [1, '#FFB25C', 0]]) +
      glowDef(p, 4) + blurDef(p, 8) + grainDef(p, .05) + vig(p, '#1C1040', .45) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    s += starfield(30, 19, 110);
    s += '<circle cx="320" cy="232" r="90" fill="url(#' + p + '-sun)"/><circle cx="320" cy="232" r="30" fill="#FFEFC4"/>';
    // layered mountains
    s += '<path d="M0 236 L90 172 L170 224 L260 158 L350 226 L450 170 L540 228 L640 180 V300 H0Z" fill="#3A2454" opacity=".85"/>';
    s += '<path d="M0 268 L120 216 L240 262 L380 210 L500 260 L640 224 V300 H0Z" fill="#241640"/>';
    // the sky-river of birds — glowing S-band with flock chevrons
    s += '<path d="M-20 120 C120 60 240 160 360 100 C460 52 560 120 660 80" stroke="url(#' + p + '-riv)" stroke-width="44" fill="none" opacity=".5" filter="url(#' + p + '-blur)"/>';
    var br = rng(37), path = [];
    for (var i = 0; i < 34; i++) {
      var t = i / 34, bx2 = -20 + t * 680;
      var by2 = 120 - 60 * Math.sin(t * Math.PI * 1.7) * (t < .55 ? 1 : .7) + (br() - .5) * 22;
      var sc2 = .6 + br() * .9, op = .5 + br() * .5;
      s += '<path d="M' + bx2.toFixed(0) + ' ' + by2.toFixed(0) + ' l' + (5 * sc2).toFixed(1) + ' ' + (3.4 * sc2).toFixed(1) + ' l' + (5 * sc2).toFixed(1) + ' ' + (-3.4 * sc2).toFixed(1) + '" stroke="#2A1A4C" stroke-width="' + (2.2 * sc2).toFixed(1) + '" stroke-linecap="round" fill="none" opacity="' + op.toFixed(2) + '"/>';
    }
    // hero flock — lit by sun, closer
    [[180, 96, 1.8], [230, 118, 2.2], [290, 92, 1.9], [350, 116, 2.4], [410, 88, 1.7]].forEach(function (b, i) {
      s += '<g transform="translate(' + b[0] + ',' + b[1] + ') scale(' + b[2] + ')"><path d="M0 0 Q4 -4 9 -2 L5 1 Q9 2 12 6 Q6 5 3 2 Q1 4 -3 4 Q-1 2 0 0Z" fill="' + (i % 2 ? '#FFE9C4' : '#FFD8A0') + '"/><circle cx="7.5" cy="-.5" r=".9" fill="#4A2A18"/></g>';
    });
    // drifting feathers
    [[140, 200, -20], [480, 190, 30], [560, 150, -35]].forEach(function (f) {
      s += '<g transform="translate(' + f[0] + ',' + f[1] + ') rotate(' + f[2] + ')" opacity=".85"><path d="M0 0 Q10 -14 2 -30 Q-8 -16 0 0Z" fill="#F4E0D0"/><path d="M1 -4 Q2 -16 2 -28" stroke="#D9B8A8" stroke-width="1.2" fill="none"/></g>';
    });
    // wind lines
    s += '<path d="M60 180 q40 -8 84 0 M420 160 q46 -10 90 -2 M100 60 q36 -6 70 0" stroke="#FFD8A0" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".5"/>';
    // water reflection strip at base
    s += '<rect y="282" width="640" height="18" fill="#4A2E6E" opacity=".8"/><path d="M240 288 h60 M330 292 h44 M160 292 h30" stroke="#FFB86E" stroke-width="2.4" opacity=".6"/>';
    s += vigR(p) + grain(p);
    reg('flyway', s);
  })();

  /* ============ 21 · ELEMENTS CROSSROADS — four seasons colliding ============ */
  (function () {
    var p = 'el', s = '<defs>' +
      lg(p + '-spring', 'd', [[0, '#FFE4F0'], [1, '#F7B8D4']]) +
      lg(p + '-summer', 'd', [[0, '#FFE9A8'], [1, '#FFC23D']]) +
      lg(p + '-autumn', 'd', [[0, '#F5B87C'], [1, '#D9743C']]) +
      lg(p + '-winter', 'd', [[0, '#DCEEFA'], [1, '#A8CCE8']]) +
      rg(p + '-core', [[0, '#FFFFFF', .95], [.5, '#FFE9AE', .6], [1, '#FFE9AE', 0]]) +
      glowDef(p, 4) + blurDef(p, 6) + grainDef(p, .045) + vig(p, '#4A3A5C', .3) + '</defs>';
    // four wedges meeting at center
    s += '<path d="M320 150 L0 0 H640Z" fill="url(#' + p + '-spring)"/>';
    s += '<path d="M320 150 L640 0 V300Z" fill="url(#' + p + '-summer)"/>';
    s += '<path d="M320 150 L640 300 H0Z" fill="url(#' + p + '-autumn)"/>';
    s += '<path d="M320 150 L0 300 V0Z" fill="url(#' + p + '-winter)"/>';
    // wedge seams
    s += '<path d="M320 150 L0 0 M320 150 L640 0 M320 150 L0 300 M320 150 L640 300" stroke="#FFFFFF" stroke-width="2.4" opacity=".65"/>';
    // SPRING (top): blossom branch + petals
    s += '<path d="M120 26 Q220 46 320 38 Q420 30 520 44" stroke="#8A5A48" stroke-width="5" fill="none"/><path d="M180 36 q-4 -12 6 -16 M300 40 q-2 -12 8 -14 M430 36 q-4 -12 6 -14" stroke="#8A5A48" stroke-width="3" fill="none"/>';
    var pr = rng(59);
    for (var i = 0; i < 10; i++) {
      var px2 = 120 + pr() * 400, py2 = 16 + pr() * 50;
      s += '<g transform="translate(' + px2.toFixed(0) + ',' + py2.toFixed(0) + ') scale(' + (.5 + pr() * .5).toFixed(2) + ')">' + [0, 72, 144, 216, 288].map(function (a) { return '<ellipse cx="0" cy="-5" rx="3.4" ry="5.4" fill="#FF9EC8" transform="rotate(' + a + ')"/>'; }).join('') + '<circle r="2.6" fill="#FFE05C"/></g>';
    }
    // SUMMER (right): sun + dragonflies
    s += '<g transform="translate(560,140)"><circle r="26" fill="#FFB429" filter="url(#' + p + '-glow)"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { return '<path d="M0 -34 L0 -44" stroke="#FFB429" stroke-width="4" stroke-linecap="round" transform="rotate(' + a + ')"/>'; }).join('') + '</g>';
    s += '<path d="M560 196 q-14 18 -34 22 M574 200 q-8 22 -26 30" stroke="#E8A620" stroke-width="2.4" fill="none" opacity=".7"/>';
    // AUTUMN (bottom): swirling leaves
    for (i = 0; i < 9; i++) {
      var ax = 140 + pr() * 380, ay = 236 + pr() * 50;
      s += '<g transform="translate(' + ax.toFixed(0) + ',' + ay.toFixed(0) + ') rotate(' + (pr() * 360).toFixed(0) + ') scale(' + (.7 + pr() * .6).toFixed(2) + ')"><path d="M0 -8 C6 -4 7 3 0 9 C-7 3 -6 -4 0 -8Z" fill="' + ['#D9743C', '#C4562A', '#E89A4C'][i % 3] + '"/><path d="M0 -6 V7" stroke="#8A3E1C" stroke-width="1.2"/></g>';
    }
    s += '<path d="M120 262 q60 -18 130 -6 M380 276 q60 -16 120 -4" stroke="#B85C2E" stroke-width="2" fill="none" opacity=".5" stroke-dasharray="3 5"/>';
    // WINTER (left): snow drifts + flakes
    s += '<path d="M0 90 q40 18 30 52 q-12 34 14 60 q20 24 2 52 L0 260Z" fill="#FFFFFF" opacity=".55"/>';
    for (i = 0; i < 12; i++) {
      var wx2 = 10 + pr() * 200, wy2 = 40 + pr() * 220;
      if (Math.abs(wx2 - 320) < 100) continue;
      s += '<g transform="translate(' + wx2.toFixed(0) + ',' + wy2.toFixed(0) + ') scale(' + (.5 + pr() * .6).toFixed(2) + ')" opacity=".9">' + [0, 60, 120].map(function (a) { return '<path d="M0 -7 V7 M-2.4 -4.6 L0 -7 L2.4 -4.6 M-2.4 4.6 L0 7 L2.4 4.6" stroke="#FFFFFF" stroke-width="1.6" transform="rotate(' + a + ')"/>'; }).join('') + '</g>';
    }
    // center: standing-stone circle + glowing crossroads
    s += '<circle cx="320" cy="150" r="52" fill="url(#' + p + '-core)"/>';
    for (i = 0; i < 4; i++) {
      var a2 = i * 90 + 45, sx = 320 + Math.cos(a2 * Math.PI / 180) * 38, sy = 150 + Math.sin(a2 * Math.PI / 180) * 30;
      s += '<path d="M' + (sx - 7).toFixed(0) + ' ' + (sy + 12).toFixed(0) + ' l1.5 -24 q5.5 -5 11 0 l1.5 24Z" fill="#6E5C82"/><path d="M' + (sx - 5).toFixed(0) + ' ' + (sy - 6).toFixed(0) + ' h9" stroke="#C9B8E0" stroke-width="1.8"/>';
    }
    s += '<circle cx="320" cy="150" r="12" fill="#FFFFFF" filter="url(#' + p + '-glow)"/><circle cx="320" cy="150" r="5" fill="#FFC23D"/>';
    s += vigR(p) + grain(p);
    reg('elements', s);
  })();

  /* ============ 22 · TURBO JUNKYARD — night circuit ============ */
  (function () {
    var p = 'jk', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#141420'], [1, '#2A2438']]) +
      lg(p + '-track', 'v', [[0, '#3A3644'], [1, '#232030']]) +
      rg(p + '-flood', [[0, '#FFF3C4', .8], [1, '#FFF3C4', 0]]) +
      lg(p + '-oil', 'd', [[0, '#4A5CE0', .7], [.5, '#8A3AE0', .6], [1, '#2AB8A8', .7]]) +
      glowDef(p, 4) + blurDef(p, 7) + grainDef(p, .06) + vig(p, '#08080F', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    // junk mountain silhouettes with car shapes
    s += '<path d="M0 150 L40 120 l30 14 20 -24 34 10 22 -18 30 22 24 -10 V160 H0Z" fill="#1A1826"/>';
    s += '<g fill="#1A1826"><path d="M60 118 h44 l-6 -14 h-30Z"/><path d="M120 96 h38 l-8 -12 h-24Z"/><rect x="86" y="82" width="30" height="12" rx="4"/></g>';
    s += '<path d="M420 150 l30 -34 26 12 18 -22 36 16 20 -12 40 24 50 -14 V166 H420Z" fill="#1A1826"/>';
    // stacked tires
    function tires(x, y, n, sc) {
      var g = '';
      for (var k = 0; k < n; k++) g += '<g transform="translate(' + x + ',' + (y - k * 13 * sc) + ') scale(' + sc + ')"><ellipse rx="20" ry="8" fill="#0E0D16"/><ellipse rx="20" ry="8" fill="none" stroke="#2E2A3C" stroke-width="2"/><ellipse rx="8" ry="3.4" fill="#232030"/></g>';
      return g;
    }
    s += tires(50, 208, 4, 1) + tires(600, 200, 3, 1.15) + tires(560, 210, 2, .8);
    // floodlight towers
    [[130, 40], [510, 36]].forEach(function (f) {
      s += '<path d="M' + f[0] + ' 160 L' + (f[0] - 8) + ' ' + f[1] + ' M' + f[0] + ' 160 L' + (f[0] + 8) + ' ' + f[1] + ' M' + (f[0] - 6) + ' 120 h12 M' + (f[0] - 7) + ' 80 h14" stroke="#2E2A3C" stroke-width="3"/>' +
        '<rect x="' + (f[0] - 16) + '" y="' + (f[1] - 10) + '" width="32" height="10" rx="3" fill="#1A1826"/>' +
        [[-10], [0], [10]].map(function (o) { return '<circle cx="' + (f[0] + o[0]) + '" cy="' + (f[1] - 5) + '" r="3.4" fill="#FFF3C4" filter="url(#' + p + '-glow)"/>'; }).join('') +
        '<path d="M' + (f[0] - 14) + ' ' + f[1] + ' L' + (f[0] - 60) + ' 240 L' + (f[0] + 40) + ' 240 L' + (f[0] + 14) + ' ' + f[1] + 'Z" fill="url(#' + p + '-flood)" opacity=".35"/>';
    });
    // the track — banked S-curve with drift zone
    s += '<path d="M-20 260 C120 200 220 292 360 240 C480 196 560 236 660 208" stroke="url(#' + p + '-track)" stroke-width="64" fill="none"/>';
    s += '<path d="M-20 260 C120 200 220 292 360 240 C480 196 560 236 660 208" stroke="#FFD84A" stroke-width="3" stroke-dasharray="18 14" fill="none" opacity=".9"/>';
    s += '<path d="M-20 230 C110 176 216 264 352 214 M-16 292 C132 228 228 318 372 268 C486 224 566 262 662 236" stroke="#0E0D16" stroke-width="5" fill="none"/>';
    // red-white curbs on the bend
    for (var i = 0; i < 8; i++) s += '<path d="M' + (196 + i * 15) + ' ' + (270 - i * 1.2).toFixed(0) + ' l12 -3 l2 8 l-12 3Z" fill="' + (i % 2 ? '#E84A4A' : '#F4F0E8') + '"/>';
    // oil slick (iridescent)
    s += '<ellipse cx="420" cy="232" rx="30" ry="10" fill="url(#' + p + '-oil)" opacity=".85"/><ellipse cx="428" cy="230" rx="12" ry="4" fill="#FFFFFF" opacity=".25"/>';
    // neon ramp arrows
    [[260, 262], [288, 254], [316, 247]].forEach(function (a, i2) {
      s += '<path d="M' + a[0] + ' ' + a[1] + ' l14 -5 v-4 l10 7 -10 7 v-4 l-14 5Z" fill="#36E0C8" opacity="' + (.5 + i2 * .25) + '" filter="url(#' + p + '-glow)"/>';
    });
    // spark burst at drift apex
    s += '<g transform="translate(212,266)" filter="url(#' + p + '-glow)">' + [[-14, -6], [-20, 2], [-12, 8], [-24, -4]].map(function (sp2) { return '<path d="M0 0 L' + sp2[0] + ' ' + sp2[1] + '" stroke="#FFC23D" stroke-width="2.4" stroke-linecap="round"/>'; }).join('') + '<circle r="3.4" fill="#FFF3C4"/></g>';
    // checkered start banner
    s += '<path d="M540 150 V96 M600 150 V96" stroke="#2E2A3C" stroke-width="4"/><g>';
    for (i = 0; i < 6; i++) for (var j = 0; j < 2; j++) s += '<rect x="' + (540 + i * 10) + '" y="' + (96 + j * 10) + '" width="10" height="10" fill="' + ((i + j) % 2 ? '#E8E4DC' : '#12101C') + '"/>';
    s += '</g>';
    s += vigR(p) + grain(p);
    reg('junkyard', s);
  })();

  /* ============ 23 · GATEKEEPER'S STRAIT — the one-eyed cliff ============ */
  (function () {
    var p = 'gk', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#1A2A38'], [.6, '#2E4450'], [1, '#3E5A60']]) +
      lg(p + '-cliff', 'v', [[0, '#22303A'], [1, '#0E1820']]) +
      lg(p + '-sea', 'v', [[0, '#2E5058'], [1, '#12242A']]) +
      rg(p + '-eye', [[0, '#FFE9AE'], [.5, '#F0B429', .8], [1, '#F0B429', 0]]) +
      glowDef(p, 5) + blurDef(p, 8) + grainDef(p, .07) + vig(p, '#060E14', .58) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    // storm clouds
    var sr2 = rng(67);
    for (var i = 0; i < 4; i++) s += '<ellipse cx="' + (80 + sr2() * 480).toFixed(0) + '" cy="' + (30 + sr2() * 40).toFixed(0) + '" rx="' + (70 + sr2() * 50).toFixed(0) + '" ry="' + (14 + sr2() * 10).toFixed(0) + '" fill="#141F28" opacity=".8" filter="url(#' + p + '-blur)"/>';
    s += '<path d="M210 34 l-10 22 h12 l-14 26" stroke="#BFE0F2" stroke-width="2.4" fill="none" opacity=".8" filter="url(#' + p + '-glow)"/>';
    // LEFT: the gatekeeper cliff — mantis-faced colossus profile
    s += '<path d="M0 300 V60 L36 42 L60 66 L54 96 L92 88 L120 118 L96 132 L128 152 L108 174 L146 190 L122 214 L160 232 L130 258 L168 276 L140 300Z" fill="url(#' + p + '-cliff)"/>';
    // ridge highlights
    s += '<path d="M36 42 L60 66 M92 88 L120 118 M128 152 L108 174 M146 190 L122 214" stroke="#4E6A72" stroke-width="2" opacity=".8"/>';
    // THE EYE — huge, lit, tracking
    s += '<ellipse cx="84" cy="112" rx="26" ry="20" fill="url(#' + p + '-eye)" filter="url(#' + p + '-glow)"/><ellipse cx="84" cy="112" rx="24" ry="17" fill="#F6EFDF"/><circle cx="92" cy="114" r="8.6" fill="#1C2A14"/><circle cx="95" cy="111" r="2.6" fill="#fff"/><path d="M58 100 Q84 86 110 100" stroke="#0E1820" stroke-width="7" fill="none"/>';
    // mantis mandible silhouettes at waterline
    s += '<path d="M140 258 q30 -8 44 12 q-24 2 -34 16Z M168 276 q26 -4 36 14 l-38 0Z" fill="#0E1820"/>';
    // RIGHT: claw rocks
    s += '<path d="M640 300 V150 L604 168 L622 196 L588 208 L612 238 L578 250 L604 276 L572 300Z" fill="url(#' + p + '-cliff)"/>';
    s += '<path d="M560 300 q-4 -40 22 -52 q-30 -4 -28 -34 q-2 26 -22 34 q26 10 18 52Z" fill="#0E1820"/>';
    // sea + whirlpool
    s += '<rect y="222" width="640" height="78" fill="url(#' + p + '-sea)"/>';
    for (i = 0; i < 5; i++) s += '<path d="M0 ' + (230 + i * 14) + ' Q80 ' + (224 + i * 14) + ' 160 ' + (230 + i * 14) + ' T320 ' + (230 + i * 14) + ' T480 ' + (230 + i * 14) + ' T640 ' + (230 + i * 14) + '" stroke="#4E7A80" stroke-width="1.8" fill="none" opacity="' + (.5 - i * .08) + '"/>';
    // whirlpool — concentric collapsing spiral
    s += '<g transform="translate(400,262)"><ellipse rx="86" ry="22" fill="none" stroke="#5C93A0" stroke-width="4" opacity=".7"/><ellipse rx="60" ry="15" fill="none" stroke="#7FB4BC" stroke-width="3.4" opacity=".8" transform="rotate(6)"/><ellipse rx="38" ry="9.5" fill="none" stroke="#9FD0D4" stroke-width="3" transform="rotate(12)"/><ellipse rx="19" ry="5" fill="none" stroke="#C4E4E4" stroke-width="2.6" transform="rotate(20)"/><ellipse rx="7" ry="2" fill="#06121A"/></g>';
    // foam + the crew's tiny boat holding the line
    s += '<g transform="translate(258,240)"><path d="M-20 6 C-14 15 14 15 20 6 L14 0 H-14Z" fill="#8A6A42"/><path d="M0 0 V-22 M0 -22 L15 -8 H0Z" stroke="#5C4A32" stroke-width="2.4" fill="none"/><path d="M0 -22 L15 -8 H0Z" fill="#E8D9B8"/><g transform="translate(-2,-8) scale(.8)" filter="url(#' + p + '-glow)">' + BIZZY + '</g></g>';
    s += '<path d="M226 252 q14 6 30 1 M282 250 q12 5 26 0" stroke="#C4E4E4" stroke-width="2.2" fill="none" opacity=".7"/>';
    // riddle glyphs hanging in the air
    s += '<g font-family="Sono,monospace" font-weight="600" fill="#F0B429" opacity=".85" filter="url(#' + p + '-glow)"><text x="180" y="80" font-size="20">?</text><text x="300" y="56" font-size="14" opacity=".7">?</text><text x="252" y="110" font-size="11" opacity=".5">?</text></g>';
    s += vigR(p) + grain(p);
    reg('strait', s);
  })();

  /* ============ 24 · SUNKEN LIBRARY — drowned shelves ============ */
  (function () {
    var p = 'sl', s = '<defs>' +
      lg(p + '-water', 'v', [[0, '#0E3A44'], [.5, '#0A2A38'], [1, '#061A26']]) +
      lg(p + '-shaft', 'v', [[0, '#7FD9C4', .5], [1, '#7FD9C4', 0]]) +
      lg(p + '-shelf', 'v', [[0, '#1E4A50'], [1, '#12323A']]) +
      rg(p + '-lamp', [[0, '#BFF2E4', .9], [.5, '#7FD9C4', .4], [1, '#7FD9C4', 0]]) +
      glowDef(p, 5) + blurDef(p, 9) + grainDef(p, .06) + vig(p, '#03101A', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-water)"/>';
    // light shafts from the surface
    s += '<path d="M180 0 L120 300 L200 300 L240 0Z" fill="url(#' + p + '-shaft)" opacity=".35"/><path d="M420 0 L390 300 L440 300 L460 0Z" fill="url(#' + p + '-shaft)" opacity=".25"/>';
    // surface shimmer
    s += '<path d="M0 10 Q80 2 160 10 T320 8 T480 12 T640 8" stroke="#7FD9C4" stroke-width="2.4" fill="none" opacity=".5"/>';
    // receding shelf stacks
    function shelf(x, y, w2, h2, tilt, op) {
      var g = '<g transform="translate(' + x + ',' + y + ') rotate(' + tilt + ')" opacity="' + op + '">';
      g += '<rect width="' + w2 + '" height="' + h2 + '" fill="url(#' + p + '-shelf)" stroke="#0A222A" stroke-width="3"/>';
      var rows2 = Math.floor(h2 / 30);
      for (var k2 = 1; k2 <= rows2; k2++) g += '<path d="M0 ' + (k2 * 30) + ' h' + w2 + '" stroke="#0A222A" stroke-width="3"/>';
      var br2 = rng(x + y);
      for (var k3 = 0; k3 < rows2; k3++) for (var b2 = 0; b2 < Math.floor(w2 / 12); b2++) {
        if (br2() < .25) continue;
        var bh = 16 + br2() * 9, lean = (br2() - .5) * 14;
        g += '<rect x="' + (4 + b2 * 12) + '" y="' + (k3 * 30 + 28 - bh) + '" width="8" height="' + bh.toFixed(0) + '" rx="1.4" fill="' + ['#3E7A6E', '#8A4A3C', '#B8934A', '#4A6A8C', '#6E4A7A'][Math.floor(br2() * 5)] + '" transform="rotate(' + lean.toFixed(0) + ' ' + (8 + b2 * 12) + ' ' + (k3 * 30 + 28) + ')"/>';
      }
      return g + '</g>';
    }
    s += shelf(20, 90, 110, 190, -3, .92) + shelf(160, 120, 90, 160, 2, .8) + shelf(470, 84, 120, 200, 4, .95) + shelf(380, 140, 70, 140, -2, .7);
    // toppled shelf on the floor
    s += '<g transform="translate(250,262) rotate(-78)" opacity=".85">' + '<rect width="70" height="90" fill="url(#' + p + '-shelf)" stroke="#0A222A" stroke-width="3"/><path d="M0 30 h70 M0 60 h70" stroke="#0A222A" stroke-width="3"/></g>';
    // ghost-lamps — jellyfish lanterns
    [[130, 60, 1.2], [330, 90, .9], [560, 50, 1], [420, 60, .6]].forEach(function (L2) {
      s += '<g transform="translate(' + L2[0] + ',' + L2[1] + ') scale(' + L2[2] + ')"><ellipse rx="26" ry="30" fill="url(#' + p + '-lamp)"/><path d="M-14 6 a14 12 0 0 1 28 0 q-4 8 -14 8 t-14 -8Z" fill="#BFF2E4" opacity=".85" filter="url(#' + p + '-glow)"/>' + [-9, -3, 3, 9].map(function (o) { return '<path d="M' + o + ' 14 q' + (o * .4) + ' 12 ' + (o * .2) + ' 22" stroke="#9FE8D4" stroke-width="1.8" fill="none" opacity=".7"/>'; }).join('') + '</g>';
    });
    // floating letters like plankton
    var lr = rng(73), letters = 'ETYMOLOGYWORDS';
    for (var i = 0; i < 16; i++) {
      var lx = 40 + lr() * 560, ly = 40 + lr() * 220, lo = .25 + lr() * .6, lsz = 9 + lr() * 10;
      s += '<text x="' + lx.toFixed(0) + '" y="' + ly.toFixed(0) + '" font-family="Sono,monospace" font-weight="600" font-size="' + lsz.toFixed(0) + '" fill="#9FE8D4" opacity="' + lo.toFixed(2) + '" transform="rotate(' + ((lr() - .5) * 40).toFixed(0) + ' ' + lx.toFixed(0) + ' ' + ly.toFixed(0) + ')" filter="url(#' + p + '-glow)">' + letters[i % letters.length] + '</text>';
    }
    // bubbles
    for (i = 0; i < 12; i++) s += '<circle cx="' + (30 + lr() * 580).toFixed(0) + '" cy="' + (30 + lr() * 240).toFixed(0) + '" r="' + (1.4 + lr() * 3).toFixed(1) + '" fill="none" stroke="#7FD9C4" stroke-width="1.2" opacity="' + (.3 + lr() * .4).toFixed(2) + '"/>';
    // floor: sand + open glowing book
    s += '<path d="M0 278 Q160 268 320 276 Q480 268 640 276 V300 H0Z" fill="#123038"/>';
    s += '<g transform="translate(320,268)"><path d="M-30 0 Q-15 -8 0 0 Q15 -8 30 0 L30 8 Q15 1 0 8 Q-15 1 -30 8Z" fill="#E8E0CC"/><path d="M0 0 V8" stroke="#B8AA8C" stroke-width="1.6"/><ellipse cy="-2" rx="34" ry="12" fill="url(#' + p + '-lamp)" opacity=".7"/></g>';
    // kelp
    s += '<path d="M40 300 q-8 -30 6 -52 q12 -20 4 -44 M60 300 q10 -26 -2 -50" stroke="#1E5C50" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M600 300 q10 -34 -4 -58 q-10 -18 -2 -38" stroke="#1E5C50" stroke-width="6" fill="none" stroke-linecap="round"/>';
    s += vigR(p) + grain(p);
    reg('library', s);
  })();

  /* ============ 25 · THE CHAKRAVYUHA — spiral fortress (top-down) ============ */
  (function () {
    var p = 'ck', s = '<defs>' +
      lg(p + '-bg', 'v', [[0, '#1C1428'], [1, '#2A1E38']]) +
      rg(p + '-core2', [[0, '#FFE9AE'], [.4, '#F0B429', .7], [1, '#F0B429', 0]]) +
      glowDef(p, 4) + blurDef(p, 6) + grainDef(p, .06) + vig(p, '#0A0614', .55) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-bg)"/>';
    // ground texture ring shadows
    s += '<ellipse cx="320" cy="150" rx="300" ry="140" fill="#241A30"/>';
    // spiral walls — archimedean, drawn as arc segments with gate gaps
    s += '<g transform="translate(320,150)">';
    var turns = 4.2, segs2 = 260;
    for (var k = 0; k < 3; k++) {
      var d2 = '', started = false;
      for (var i = 0; i <= segs2; i++) {
        var t2 = i / segs2, ang = t2 * turns * Math.PI * 2 + k * 2.1;
        var rad = 18 + t2 * 118;
        // gate gaps: skip petals of arc
        var gate = Math.abs(((ang * 3 / Math.PI) % 2) - 1) < .09 && t2 > .18;
        var gx = Math.cos(ang) * rad * 1.9, gy = Math.sin(ang) * rad * .88;
        if (gate) { started = false; continue; }
        d2 += (started ? ' L' : ' M') + gx.toFixed(1) + ' ' + gy.toFixed(1); started = true;
      }
      s += '<path d="' + d2 + '" fill="none" stroke="' + (k === 0 ? '#4A3A5C' : k === 1 ? '#5C4870' : '#3A2C4C') + '" stroke-width="' + (9 - k * 2) + '" stroke-linecap="round"/>';
    }
    // wall crenellation dots
    var cr2 = rng(83);
    for (i = 0; i < 40; i++) {
      var a3 = cr2() * Math.PI * 2 * turns, rr = 18 + (a3 / (Math.PI * 2 * turns)) * 118;
      s += '<circle cx="' + (Math.cos(a3) * rr * 1.9).toFixed(1) + '" cy="' + (Math.sin(a3) * rr * .88).toFixed(1) + '" r="1.8" fill="#8A76A0" opacity=".8"/>';
    }
    // petal gates — like closing flower petals at the four cardinal gaps
    [[0, 118], [90, 96], [180, 118], [270, 96]].forEach(function (g2, gi) {
      var ga = g2[0] * Math.PI / 180, gr2 = g2[1];
      var gx2 = Math.cos(ga) * gr2 * 1.9, gy2 = Math.sin(ga) * gr2 * .88;
      s += '<g transform="translate(' + gx2.toFixed(0) + ',' + gy2.toFixed(0) + ') rotate(' + (g2[0] + 90) + ')">' +
        '<path d="M-16 0 C-14 -14 -6 -20 0 -22 C6 -20 14 -14 16 0 C10 4 -10 4 -16 0Z" fill="' + (gi % 2 ? '#C43D5A' : '#8A2E44') + '"/>' +
        '<path d="M0 -22 V0" stroke="#5C1428" stroke-width="2"/><path d="M-10 -8 Q0 -13 10 -8" stroke="#E8768E" stroke-width="1.6" fill="none"/></g>';
    });
    // the glowing heart + trapped letter
    s += '<ellipse rx="46" ry="26" fill="url(#' + p + '-core2)"/><g filter="url(#' + p + '-glow)"><rect x="-11" y="-13" width="22" height="22" rx="5" fill="#FFC23D"/><text y="4.5" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="15" fill="#3A2213">A</text></g>';
    // Bizzy's dotted route in — solving the maze
    s += '<path d="M-300 108 C-220 128 -160 92 -120 66 C-80 42 -30 40 -6 -8" stroke="#FFC23D" stroke-width="2.4" stroke-dasharray="1 8" stroke-linecap="round" fill="none" filter="url(#' + p + '-glow)"/>';
    s += '<g transform="translate(-300,104) scale(1.05)" filter="url(#' + p + '-glow)">' + BIZZY + '</g>';
    // patrolling moth mobs (top-down grey dots with wings)
    [[-120, -60], [96, 90], [180, -40], [-40, 110]].forEach(function (m2) {
      s += '<g transform="translate(' + m2[0] + ',' + m2[1] + ')" opacity=".85"><ellipse cx="-4" cy="0" rx="4.6" ry="6" fill="#A39B8E" transform="rotate(-20)"/><ellipse cx="4" cy="0" rx="4.6" ry="6" fill="#A39B8E" transform="rotate(20)"/><ellipse rx="2" ry="5" fill="#7A736A"/></g>';
    });
    s += '</g>';
    // torch flames on outer wall
    [[80, 96], [560, 96], [130, 250], [510, 250]].forEach(function (t3) {
      s += '<g transform="translate(' + t3[0] + ',' + t3[1] + ')"><path d="M0 8 V-2" stroke="#4A3A5C" stroke-width="3"/><path d="M0 -4 C4 -8 3 -14 0 -17 C-3 -14 -4 -8 0 -4Z" fill="#F0B429" filter="url(#' + p + '-glow)"/><path d="M0 -6 C2 -8 1.6 -11 0 -13 C-1.6 -11 -2 -8 0 -6Z" fill="#FFE9AE"/></g>';
    });
    s += vigR(p) + grain(p);
    reg('chakravyuha', s);
  })();

  /* ============ 26 · THE WAR FIELD — grey plain, two armies ============ */
  (function () {
    var p = 'wf', s = '<defs>' +
      lg(p + '-sky', 'v', [[0, '#2E2A34'], [.6, '#4A4450'], [1, '#5C5560']]) +
      lg(p + '-plain', 'v', [[0, '#6E6874'], [1, '#3A3540']]) +
      rg(p + '-engine', [[0, '#C43D5A', .6], [1, '#C43D5A', 0]]) +
      rg(p + '-dawn', [[0, '#FFC23D', .5], [1, '#FFC23D', 0]]) +
      glowDef(p, 5) + blurDef(p, 9) + grainDef(p, .08) + vig(p, '#14101C', .5) + '</defs>';
    s += '<rect width="640" height="300" fill="url(#' + p + '-sky)"/>';
    // brooding cloud bank
    var cr3 = rng(91);
    for (var i = 0; i < 5; i++) s += '<ellipse cx="' + (cr3() * 640).toFixed(0) + '" cy="' + (26 + cr3() * 50).toFixed(0) + '" rx="' + (80 + cr3() * 70).toFixed(0) + '" ry="' + (14 + cr3() * 12).toFixed(0) + '" fill="#241F2C" opacity=".7" filter="url(#' + p + '-blur)"/>';
    // dawn crack behind the crew side
    s += '<ellipse cx="60" cy="110" rx="130" ry="80" fill="url(#' + p + '-dawn)"/>';
    // THE ENGINE on the horizon — cathedral silhouette with crimson rose
    s += '<ellipse cx="520" cy="120" rx="120" ry="80" fill="url(#' + p + '-engine)"/>';
    s += '<g fill="#1A1522"><path d="M470 160 V96 l12 -14 12 14 v24 h14 V88 l14 -16 14 16 v32 h12 V78 q6 -18 12 0 v82Z"/><rect x="446" y="128" width="24" height="32"/><rect x="562" y="120" width="26" height="40"/><path d="M446 128 l12 -18 12 18Z M562 120 l13 -20 13 20Z"/></g>';
    s += '<circle cx="520" cy="118" r="15" fill="#C43D5A" filter="url(#' + p + '-glow)"/><circle cx="520" cy="118" r="15" fill="none" stroke="#1A1522" stroke-width="4"/><path d="M520 103 V133 M505 118 H535 M509 107 L531 129 M531 107 L509 129" stroke="#1A1522" stroke-width="3"/>';
    // smokestacks
    s += '<path d="M488 92 q-4 -18 6 -28 M552 86 q6 -16 -2 -30" stroke="#241F2C" stroke-width="8" stroke-linecap="round" fill="none" opacity=".8" filter="url(#' + p + '-blur)"/>';
    // the plain
    s += '<rect y="196" width="640" height="104" fill="url(#' + p + '-plain)"/>';
    s += '<path d="M0 196 H640" stroke="#8A8390" stroke-width="1.6" opacity=".6"/>';
    // cracked earth lines
    for (i = 0; i < 7; i++) s += '<path d="M' + (cr3() * 640).toFixed(0) + ' ' + (216 + cr3() * 70).toFixed(0) + ' l' + ((cr3() - .5) * 60).toFixed(0) + ' ' + (8 + cr3() * 14).toFixed(0) + ' l' + ((cr3() - .5) * 50).toFixed(0) + ' ' + (6 + cr3() * 12).toFixed(0) + '" stroke="#2A2530" stroke-width="1.8" fill="none"/>';
    // LEFT ARMY — the crew: small colored silhouettes with banners (color = hope)
    var crew2 = ['#FFC23D', '#F7A8C8', '#7FD9C4', '#C9A8F0', '#9BE34D', '#5CC1E8', '#F0894B', '#E8E4DC'];
    for (i = 0; i < 8; i++) {
      var cx2 = 40 + i * 26 + (i % 3) * 5, cy2 = 226 + (i % 4) * 9, cs = .8 + (i % 3) * .2;
      s += '<g transform="translate(' + cx2 + ',' + cy2 + ') scale(' + cs + ')"><circle r="8" fill="' + crew2[i] + '"/><circle cx="-2.6" cy="-1.6" r="1.4" fill="#241E33"/><circle cx="2.6" cy="-1.6" r="1.4" fill="#241E33"/><path d="M-8 10 h16" stroke="' + crew2[i] + '" stroke-width="4" stroke-linecap="round"/></g>';
    }
    // crew banner
    s += '<g transform="translate(30,182)"><path d="M0 52 V0" stroke="#8A8390" stroke-width="2.6"/><path d="M0 2 h30 l-7 8 7 8 H0Z" fill="#FFC23D"/><path d="M6 7 l3.4 7 M13 7 l3.4 7" stroke="#3A2213" stroke-width="2" stroke-linecap="round"/></g>';
    // Bizzy front and center, quill up
    s += '<g transform="translate(96,212) scale(1.3)" filter="url(#' + p + '-glow)">' + BIZZY + '</g>';
    s += '<path d="M112 200 L124 184" stroke="#FFC23D" stroke-width="3" stroke-linecap="round"/><path d="M124 184 l6 -9 3 5Z" fill="#FFE9AE" filter="url(#' + p + '-glow)"/>';
    // RIGHT ARMY — grey horde: rows of moth/locust silhouettes receding
    var hr2 = rng(97);
    for (var row2 = 0; row2 < 4; row2++) {
      for (i = 0; i < 12; i++) {
        var hx2 = 380 + i * 22 + (row2 % 2) * 11, hy2 = 216 + row2 * 16, hs = 1 - row2 * .14;
        if (hx2 > 632) continue;
        s += '<g transform="translate(' + hx2 + ',' + hy2 + ') scale(' + hs.toFixed(2) + ')" opacity="' + (.95 - row2 * .16).toFixed(2) + '"><ellipse cx="-3.4" cy="-1" rx="3.8" ry="5" fill="#4A4450" transform="rotate(-22)"/><ellipse cx="3.4" cy="-1" rx="3.8" ry="5" fill="#4A4450" transform="rotate(22)"/><ellipse rx="1.8" ry="4.6" fill="#332E3C"/><circle cx="-1.4" cy="-3" r=".8" fill="#C43D5A"/><circle cx="1.4" cy="-3" r=".8" fill="#C43D5A"/></g>';
      }
    }
    // horde banner — grey, tattered
    s += '<g transform="translate(600,180)"><path d="M0 56 V0" stroke="#4A4450" stroke-width="2.6"/><path d="M0 2 h-28 l5 7 -5 7 4 0 -3 6 h27Z" fill="#5C5560"/><circle cx="-14" cy="10" r="4" fill="none" stroke="#332E3C" stroke-width="2"/></g>';
    // dust rolling between the lines
    s += '<ellipse cx="290" cy="252" rx="90" ry="12" fill="#8A8390" opacity=".25" filter="url(#' + p + '-blur)"/>';
    s += '<text x="290" y="286" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="11" fill="#B8B2C0" letter-spacing="4" opacity=".8">EVERY WORD REMEMBERED IS A SOLDIER</text>';
    s += vigR(p) + grain(p);
    reg('warfield', s);
  })();

  function dims(vb) { var q = vb.split(' '); return { w: +q[2], h: +q[3] }; }
  window.WORLD_ART = Object.assign(window.WORLD_ART || {}, W);
  var waUid = 0;
  window.WorldArt = function (props) {
    var R = window.React, a = (window.WORLD_ART || {})[props.name];
    if (!a) return R.createElement('div', { style: { color: '#C4453C', fontSize: '12px' } }, 'missing world: ' + props.name);
    var idRef = R.useRef ? R.useRef(null) : { current: null };
    if (!idRef.current) idRef.current = 'wah' + (++waUid);
    var html = a.svg;
    if (!props.crisp) {
      html = '<defs><filter id="' + idRef.current + '" x="-4%" y="-4%" width="108%" height="108%"><feGaussianBlur in="SourceGraphic" stdDeviation=".55" result="s"/><feTurbulence type="fractalNoise" baseFrequency=".011 .017" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="s" in2="n" scale="5.2" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#' + idRef.current + ')" style="stroke-linejoin:round;stroke-linecap:round">' + html + '</g>';
    }
    var d = dims(a.vb);
    return R.createElement('svg', {
      viewBox: a.vb, width: '100%', height: 'auto',
      preserveAspectRatio: 'xMidYMid slice',
      style: { display: 'block', aspectRatio: d.w + '/' + d.h, filter: props.grey ? 'saturate(.14) brightness(1.04)' : 'none' },
      dangerouslySetInnerHTML: { __html: html }
    });
  };
})();

/* ============================================================
   SAGA-MAP.JS — P0 map & progression assets (DESIGN-BRIEF-SAGA-MAP)
   Registers into window.SAGA_ART (merge-safe, any load order).
   Render with <SagaSprite> from saga-art.js.
   ============================================================ */
(function () {
  var INK = '#2A2140', HONEY = '#FFC83D', GOLD = '#F0B429', CRIM = '#C43D5A', DEEP = '#4A32A8';
  var G1 = '#A39B8E', G2 = '#8B857B', G3 = '#C7C1B6', G4 = '#E8E4DC';
  function hex(cx, cy, s) { return 'M' + cx + ' ' + (cy - s) + ' L' + (cx + s * .87) + ' ' + (cy - s / 2) + ' V' + (cy + s / 2) + ' L' + cx + ' ' + (cy + s) + ' L' + (cx - s * .87) + ' ' + (cy + s / 2) + ' V' + (cy - s / 2) + ' Z'; }
  function gloss(cx, cy) { return '<ellipse cx="' + (cx - 5) + '" cy="' + (cy - 7) + '" rx="4.5" ry="3" fill="#fff" opacity=".5"/>'; }
  var M = {};

  /* ---- nodes (44×48 canvas; boss 56×60) ---- */
  M['node-locked'] = { vb: '0 0 44 48', frames: ['<path d="' + hex(22, 24, 17) + '" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="2.6" stroke-linejoin="round"/><path d="' + hex(22, 24, 12) + '" fill="' + G4 + '" opacity=".5"/><text x="22" y="29" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="13" fill="' + G2 + '" opacity=".7">?</text>'] };
  M['node-current'] = { vb: '0 0 44 48', frames: [0, 1].map(function (f) {
    var r = f ? 20.5 : 18.5, o = f ? .35 : .6;
    return '<path d="' + hex(22, 24, r) + '" fill="none" stroke="' + HONEY + '" stroke-width="2" opacity="' + o + '"/>' +
      '<path d="' + hex(22, 24, 17) + '" fill="' + HONEY + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
      '<path d="' + hex(22, 24, 12) + '" fill="#FFDE8C"/>' + gloss(22, 20) +
      '<text x="22" y="29" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="13" fill="' + INK + '">3</text>';
  }) };
  M['node-cleared'] = { vb: '0 0 44 48', frames: ['<path d="' + hex(22, 24, 17) + '" fill="' + GOLD + '" stroke="' + INK + '" stroke-width="2.6" stroke-linejoin="round"/>' +
    '<path d="' + hex(22, 22, 11) + '" fill="#A8D18C"/><path d="M14 26 q8 -6 16 0 v3 q-8 4 -16 0Z" fill="#7FAF6B"/><circle cx="26" cy="17" r="2.6" fill="#FFE9AE"/>' + gloss(22, 19) +
    [[14, 36], [22, 38], [30, 36]].map(function (p, i) { return '<path d="M' + p[0] + ' ' + p[1] + ' l1.7 -3.4 3.7 -.5 -2.7 -2.6 .6 -3.7 -3.3 1.8 -3.3 -1.8 .6 3.7 -2.7 2.6 3.7 .5Z" fill="' + (i < 2 ? '#FFE05C' : '#E8E4DC') + '" stroke="' + INK + '" stroke-width="1" transform="scale(.62) translate(' + (p[0] * .61) + ' ' + (p[1] * .61) + ')"/>'; }).join('')] };
  M['node-boss'] = { vb: '0 0 56 60', frames: [
    '<path d="' + hex(28, 30, 23) + '" fill="' + CRIM + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="' + hex(28, 30, 17) + '" fill="#8A2436"/><circle cx="28" cy="30" r="9" fill="' + CRIM + '" stroke="#F0B429" stroke-width="1.6"/><path d="M22 27 q6 -5 12 0 M22 33 q6 5 12 0" stroke="#241E33" stroke-width="2.2" fill="none"/>' + gloss(28, 24),
    '<path d="' + hex(28, 30, 23) + '" fill="' + G2 + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="' + hex(28, 30, 17) + '" fill="' + G1 + '"/><circle cx="28" cy="30" r="9" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="1.6"/><path d="M22 27 q6 -5 12 0 M22 33 q6 5 12 0" stroke="' + G2 + '" stroke-width="2.2" fill="none"/><path d="M20 20 L30 34 M30 22 L26 30 L34 38" stroke="' + INK + '" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M36 18 l2 -3 M40 26 l3 -1" stroke="' + INK + '" stroke-width="1.2"/>'
  ] };
  M['node-finale'] = { vb: '0 0 56 60', frames: ['<path d="' + hex(28, 30, 23) + '" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
    [0, 45, 90, 135].map(function (a) { return '<path d="M28 4 V-2" stroke="' + HONEY + '" stroke-width="2" stroke-linecap="round" transform="rotate(' + a + ' 28 30)"/>'; }).join('') +
    '<path d="' + hex(28, 30, 16) + '" fill="#6C4FE0"/><path d="M28 20 l3 6.2 6.8 1 -4.9 4.7 1.2 6.7 -6.1 -3.2 -6.1 3.2 1.2 -6.7 -4.9 -4.7 6.8 -1Z" fill="' + HONEY + '" stroke="' + INK + '" stroke-width="1.4"/>' + gloss(28, 24)] };
  function sideroad(glyph) {
    return '<circle cx="22" cy="24" r="16" fill="#7FD9C4" stroke="' + INK + '" stroke-width="2.6"/><circle cx="22" cy="24" r="11" fill="#BFF2E4"/>' + glyph + gloss(22, 20) + '<path d="M22 8 q-2 -4 -6 -5 M22 8 q2 -4 6 -5" stroke="#4FB0A6" stroke-width="1.6" fill="none" stroke-dasharray="2 3"/>';
  }
  M['node-sideroad-kart'] = { vb: '0 0 44 48', frames: [sideroad('<circle cx="22" cy="24" r="7" fill="' + INK + '"/><circle cx="22" cy="24" r="2.6" fill="#8A8FA8"/><path d="M22 17.5 V19 M22 29 V30.5 M15.5 24 H17 M27 24 H28.5 M17.5 19.5 l1 1 M26.5 19.5 l-1 1 M17.5 28.5 l1 -1 M26.5 28.5 l-1 -1" stroke="#C9CEDF" stroke-width="1.4"/>')] };
  M['node-sideroad-beat'] = { vb: '0 0 44 48', frames: [sideroad('<path d="M25.5 15 v11.4 q0 3.6 -3.6 3.6 q-3.4 0 -3.4 -3 q0 -2.6 3.4 -3.2 l2 -.4 V17.4Z" fill="' + DEEP + '"/><path d="M25.5 17.4 q3 0 4 -2.4" stroke="' + DEEP + '" stroke-width="1.6" fill="none"/>')] };
  M['node-sideroad-wisp'] = { vb: '0 0 44 48', frames: [sideroad('<path d="M22 14 c3.4 3.4 4.6 6.4 3.4 9.4 a4.6 4.6 0 0 1 -6.8 0 C17.4 20.4 18.6 17.4 22 14Z" fill="#C9A8F0" stroke="' + DEEP + '" stroke-width="1.2"/><circle cx="22" cy="30" r="1.6" fill="' + DEEP + '"/>')] };

  /* ---- Bizzy you-are-here (idle bob 2f + hop 3f) ---- */
  var BEE = function (dy, wingRot, squash) {
    return '<g transform="translate(0,' + dy + ') scale(1,' + (squash || 1) + ')">' +
      '<ellipse cx="14" cy="10" rx="4.4" ry="7" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1.2" transform="rotate(' + (-26 + wingRot) + ' 14 10)"/>' +
      '<ellipse cx="26" cy="10" rx="4.4" ry="7" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1.2" transform="rotate(' + (26 - wingRot) + ' 26 10)"/>' +
      '<circle cx="20" cy="18" r="8.6" fill="' + HONEY + '"/>' +
      '<path d="M13 15 H27 M12.6 20.5 H27.4" stroke="#3A2A8C" stroke-width="2.2" stroke-linecap="round"/>' +
      '<circle cx="17.4" cy="16.4" r="1.5" fill="#2B1B5E"/><circle cx="22.6" cy="16.4" r="1.5" fill="#2B1B5E"/><circle cx="18" cy="15.8" r=".5" fill="#fff"/><circle cx="23.2" cy="15.8" r=".5" fill="#fff"/>' +
      '<path d="M17.4 23 q2.6 2 5.2 0" stroke="#3A2A8C" stroke-width="1.3" fill="none" stroke-linecap="round"/></g>';
  };
  M['map-bizzy-here'] = { vb: '0 0 40 34', frames: [BEE(0, 0), BEE(-1.6, 14)] };
  M['map-bizzy-hop'] = { vb: '0 0 40 34', frames: [BEE(2, 0, .88), BEE(-6, 18), BEE(.5, 4, .94) + '<g fill="' + GOLD + '"><circle cx="10" cy="30" r="1.2"/><circle cx="30" cy="29" r="1"/><circle cx="20" cy="32" r=".9"/></g>'] };

  /* ---- act gates (locked / lit) ---- */
  var GATE_GLYPHS = {
    1: '<path d="' + hex(0, 0, 5.5) + '" fill="#FFD86E" stroke="' + INK + '" stroke-width="1.2"/>',
    2: '<path d="M0 -6 l1.8 3.7 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6Z" fill="#B294F5" stroke="' + INK + '" stroke-width="1.1"/>',
    3: '<rect x="-4.6" y="-4.6" width="9.2" height="9.2" rx="2" fill="#E8E4DC" stroke="' + INK + '" stroke-width="1.1" transform="rotate(-8)"/><path d="M-3 -4 L3 4" stroke="' + INK + '" stroke-width=".9"/>',
    4: '<path d="M0 -6 C2.6 -2 4 .4 4 2.6 a4 4 0 0 1 -8 0 C-4 .4 -2.6 -2 0 -6Z" fill="#9FD0F5" stroke="' + INK + '" stroke-width="1.1"/>',
    5: '<path d="M-5 2 q5 -4.6 10 0 l-1.2 2.4 q-3.8 -3.4 -7.6 0Z" fill="#C9C3B6" stroke="' + INK + '" stroke-width="1.1"/>',
    6: '<path d="M0 -6 C2 -3.6 3 -1.4 2.4 .8 a3.4 3.4 0 0 1 -4.8 0 C-3 -1.4 -2 -3.6 0 -6Z" fill="#FFB25C" stroke="' + INK + '" stroke-width="1.1"/>'
  };
  for (var g = 1; g <= 6; g++) (function (g2) {
    var glyph = GATE_GLYPHS[g2];
    var arch = function (stone, trim, lit) {
      return '<path d="M8 52 V26 Q27.5 4 47 26 V52 H38 V28 Q27.5 14 17 28 V52Z" fill="' + stone + '" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/>' +
        '<path d="M12 30 Q27.5 10 43 30" fill="none" stroke="' + trim + '" stroke-width="1.6"/>' +
        '<circle cx="27.5" cy="20" r="8" fill="' + (lit ? '#FFF3D2' : G4) + '" stroke="' + INK + '" stroke-width="1.8"/>' +
        '<g transform="translate(27.5,20)">' + glyph + '</g>' +
        (lit ? '<circle cx="27.5" cy="20" r="11.5" fill="' + HONEY + '" opacity=".3"/><path d="M4 24 l-3 -1 M51 24 l3 -1" stroke="' + HONEY + '" stroke-width="1.6" stroke-linecap="round"/>' : '') +
        '<path d="M8 52 H47" stroke="' + INK + '" stroke-width="2.4"/>';
    };
    M['gate-act' + g2] = { vb: '0 0 55 55', frames: [arch(G3, G2, false), arch('#E8B85C', GOLD, true)] };
  })(g);

  /* ---- path segments + mist tile ---- */
  M['map-path-gilded'] = { vb: '0 0 120 24', frames: ['<path d="M0 12 C30 4 60 20 90 10 Q105 6 120 12" stroke="' + INK + '" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M0 12 C30 4 60 20 90 10 Q105 6 120 12" stroke="' + HONEY + '" stroke-width="7.5" fill="none" stroke-linecap="round"/><path d="M8 11 C32 5 58 18 88 10" stroke="#FFE9AE" stroke-width="2" fill="none" stroke-linecap="round" opacity=".9"/>'] };
  M['map-path-dotted'] = { vb: '0 0 120 24', frames: ['<path d="M0 12 C30 4 60 20 90 10 Q105 6 120 12" stroke="' + G2 + '" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-dasharray="1 10"/>'] };
  M['map-mist'] = { vb: '0 0 120 60', frames: [0, 1].map(function (f) {
    var dx = f ? 8 : 0;
    return '<g opacity=".8"><ellipse cx="' + (30 + dx) + '" cy="22" rx="34" ry="13" fill="' + G4 + '"/><ellipse cx="' + (78 - dx) + '" cy="30" rx="40" ry="15" fill="#F1EEE8"/><ellipse cx="' + (52 + dx) + '" cy="44" rx="46" ry="14" fill="' + G3 + '" opacity=".8"/></g>';
  }) };

  /* ---- progression surfaces ---- */
  M['hud-crewbar'] = { vb: '0 0 240 34', frames: [(function () {
    var s = '<rect x="1" y="4" width="238" height="26" rx="13" fill="#FFFDF6" stroke="' + INK + '" stroke-width="1.6"/>';
    var cols = ['#F0894B', '#F7A8C8', '#4FB0A6', '#8A5CE8', '#9BE34D', '#5CC1E8', HONEY, '#E84A6E'];
    for (var i = 0; i < 12; i++) {
      var cx = 18 + i * 18;
      if (i < 7) { // recruited
        s += '<circle cx="' + cx + '" cy="17" r="7.5" fill="' + cols[i % 8] + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + (cx - 2.4) + '" cy="15.6" r="1.1" fill="' + INK + '"/><circle cx="' + (cx + 2.4) + '" cy="15.6" r="1.1" fill="' + INK + '"/><path d="M' + (cx - 2) + ' 20 q2 1.6 4 0" stroke="' + INK + '" stroke-width="1" fill="none"/>';
      } else if (i === 7) { // captive
        s += '<circle cx="' + cx + '" cy="17" r="7.5" fill="' + G3 + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + (cx - 2.4) + '" cy="15.6" r="1.1" fill="' + G2 + '"/><circle cx="' + (cx + 2.4) + '" cy="15.6" r="1.1" fill="' + G2 + '"/><path d="M' + (cx - 6) + ' 11 V23 M' + cx + ' 10 V24 M' + (cx + 6) + ' 11 V23" stroke="#8A8FA8" stroke-width="1.3"/>';
      } else { // empty
        s += '<circle cx="' + cx + '" cy="17" r="7.5" fill="' + G4 + '" stroke="' + G3 + '" stroke-width="1.3" stroke-dasharray="2 2.6"/><path d="M' + cx + ' 13.6 a3.2 3.2 0 0 1 0 6.4 a3.2 3.2 0 0 1 0 -6.4" fill="' + G3 + '"/>';
      }
    }
    s += '<text x="232" y="21" text-anchor="end" font-family="Sono,monospace" font-weight="600" font-size="8" fill="' + INK + '" opacity=".7">7/38</text>';
    return s;
  })()] };
  M['screen-gemshelf'] = { vb: '0 0 200 130', frames: [(function () {
    var s = '<rect x="2" y="2" width="196" height="126" rx="12" fill="#5C3410" stroke="' + INK + '" stroke-width="2"/><rect x="7" y="7" width="186" height="116" rx="9" fill="#7A4A16"/>';
    var gems = ['#FFD86E', '#B294F5', '#E8E4DC', '#9FD0F5', '#C9C3B6', '#FFB25C'];
    for (var r = 0; r < 6; r++) for (var c = 0; c < 6; c++) {
      var cx = 30 + c * 28, cy = 22 + r * 18;
      var filled = (r * 6 + c) < 15;
      s += '<path d="' + hex(cx, cy, 7.5) + '" fill="' + (filled ? gems[r] : '#4A2A0C') + '" stroke="' + (filled ? INK : '#3A2008') + '" stroke-width="1.3"/>';
      if (filled) s += '<circle cx="' + (cx - 2) + '" cy="' + (cy - 2.4) + '" r="1.3" fill="#fff" opacity=".7"/>';
    }
    s += '<circle cx="100" cy="65" r="13" fill="#4A2A0C" stroke="#3A2008" stroke-width="1.6"/><text x="100" y="69" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="7" fill="#B87A14">36</text>';
    return s;
  })()] };
  M['badge-everyword'] = { vb: '0 0 40 40', frames: ['<circle cx="20" cy="20" r="16" fill="' + DEEP + '" stroke="' + INK + '" stroke-width="2"/><circle cx="20" cy="20" r="12" fill="none" stroke="' + HONEY + '" stroke-width="1.4"/>' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<path d="M20 3 l1.6 3 -1.6 1.6 -1.6 -1.6Z" fill="' + HONEY + '" transform="rotate(' + a + ' 20 20)"/>'; }).join('') + '<text x="20" y="18" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="8" fill="#FFF">EVERY</text><text x="20" y="27" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="8" fill="' + HONEY + '">WORD</text><circle cx="13" cy="11" r="2" fill="#fff" opacity=".4"/>'] };
  M['hud-saga-ribbon'] = { vb: '0 0 240 26', frames: [(function () {
    var s = '<rect x="1" y="2" width="238" height="22" rx="11" fill="' + INK + '"/>';
    s += '<text x="14" y="17" font-family="Sono,monospace" font-weight="600" font-size="10" fill="' + HONEY + '">III</text>';
    s += '<text x="36" y="17" font-family="Hanken Grotesk,sans-serif" font-weight="650" font-size="9.5" fill="#FFF">The Rigged Game</text>';
    for (var i = 0; i < 36; i++) s += '<rect x="' + (128 + i * 2.9) + '" y="11" width="1.7" height="5" rx=".8" fill="' + (i < 12 ? HONEY : i === 12 ? '#FFF' : 'rgba(255,255,255,.25)') + '"/>';
    return s;
  })()] };
  M['tile-saga-entry'] = { vb: '0 0 200 90', frames: [(function () {
    var s = '<rect x="2" y="2" width="196" height="86" rx="12" fill="#38093A" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M2 60 Q60 40 110 52 T198 46 V88 H2Z" fill="#701448" opacity=".8"/><circle cx="160" cy="26" r="12" fill="#FF5D9E" opacity=".5"/>';
    s += '<rect x="2" y="2" width="196" height="86" rx="12" fill="none" stroke="' + HONEY + '" stroke-width="1.2" opacity=".4"/>';
    s += '<text x="14" y="24" font-family="Fraunces,serif" font-weight="800" font-size="14" fill="#FFF">The Saga</text>';
    s += '<text x="14" y="40" font-family="Hanken Grotesk,sans-serif" font-weight="650" font-size="9" fill="#F7A8C8">Act III \u00b7 Chapter 13</text>';
    s += '<rect x="14" y="66" width="120" height="7" rx="3.5" fill="rgba(255,255,255,.18)"/><rect x="14" y="66" width="40" height="7" rx="3.5" fill="' + HONEY + '"/>';
    s += '<text x="140" y="73" font-family="Sono,monospace" font-weight="600" font-size="8" fill="' + HONEY + '">33%</text>';
    s += '<g transform="translate(158,44) scale(.9)">' + BEE(0, 8) + '</g>';
    return s;
  })()] };
  M['screen-chapterbrief'] = { vb: '0 0 200 120', frames: [(function () {
    var s = '<rect x="2" y="2" width="196" height="116" rx="12" fill="#FFFDF6" stroke="' + INK + '" stroke-width="2"/>';
    s += '<path d="M2 14 a12 12 0 0 1 12 -12 h172 a12 12 0 0 1 12 12 V38 H2Z" fill="#38093A"/><circle cx="150" cy="20" r="9" fill="#FF5D9E" opacity=".6"/><path d="M2 30 Q60 22 120 28 T198 26 V38 H2Z" fill="#701448"/>';
    s += '<text x="14" y="56" font-family="Fraunces,serif" font-weight="800" font-size="13" fill="' + INK + '">The Rigged Game</text>';
    s += '<text x="14" y="70" font-family="Hanken Grotesk,sans-serif" font-weight="450" font-size="8.5" fill="#6A6478">Vex deals. The table never loses. Stake it all anyway.</text>';
    for (var i = 0; i < 8; i++) s += '<circle cx="' + (20 + i * 15) + '" cy="86" r="5.5" fill="' + ['#F0894B', '#F7A8C8', '#4FB0A6', '#8A5CE8', '#9BE34D', '#5CC1E8', HONEY, G3][i] + '" stroke="' + INK + '" stroke-width="1.1"/>';
    s += '<circle cx="160" cy="98" r="14" fill="' + HONEY + '" stroke="' + INK + '" stroke-width="2"/><text x="160" y="102" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="9" fill="' + INK + '">GO</text><path d="M150 88 a14 14 0 0 1 10 -4" stroke="#fff" stroke-width="1.6" fill="none" opacity=".6"/>';
    return s;
  })()] };
  M['map-recenter-chip'] = { vb: '0 0 90 26', frames: ['<rect x="1" y="1" width="88" height="24" rx="12" fill="#FFFDF6" stroke="' + INK + '" stroke-width="1.6"/><g transform="translate(15,13) scale(.5)">' + BEE(-14, 8) + '</g><text x="28" y="17" font-family="Hanken Grotesk,sans-serif" font-weight="650" font-size="9.5" fill="' + INK + '">Find Bizzy</text><path d="M78 9 l4 4 -4 4" stroke="' + INK + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>'] };

  window.SAGA_ART = Object.assign(window.SAGA_ART || {}, M);
})();

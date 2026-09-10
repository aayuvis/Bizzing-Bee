/* ============================================================
   SAGA-ART.JS v2 — P0 registry for "Bizzy and the Great Unspelling"
   Contract: SAGA_ART[name] = { vb, frames:[svgString,…] }
   <SagaSprite name size frame grey animate fluid/> (window.SagaSprite)
   BIZZY = the Bizzing Bee LOGO (bee_logo.svg / SB_BEE_ART):
   gold #FFC23D body · #3A2A8C stripes · lavender #EDE7FF wings
   (#C4B4FF stroke) · star-tipped antennae · pink #FF7FBE cheeks ·
   big white eyes (#2B1B5E pupils). Crew stays the shipped buddy
   library. Grey = the Unspelling only (#A39B8E family).
   ============================================================ */
(function () {
  var GOLD = '#FFC23D', GOLD2 = '#FFD86E', DEEP = '#3A2A8C', PUP = '#2B1B5E', SMILE = '#3A1E5C';
  var WNG = '#EDE7FF', WNGS = '#C4B4FF', CHEEK = '#FF7FBE', HONEY = '#FFC83D';
  var INK = '#241E33', CRIM = '#C43D5A', CRIM2 = '#A82F4A', GLD = '#F0B429';
  var G1 = '#A39B8E', G2 = '#8B857B', G3 = '#C7C1B6', G4 = '#E8E4DC';
  var uid = 0;

  function star5(cx, cy, r, fill) {
    var p = '', n = 5;
    for (var i = 0; i < n * 2; i++) {
      var rr = i % 2 ? r * .42 : r, a = Math.PI * i / n - Math.PI / 2;
      p += (i ? 'L' : 'M') + (cx + rr * Math.cos(a)).toFixed(1) + ',' + (cy + rr * Math.sin(a)).toFixed(1);
    }
    return '<path d="' + p + 'Z" fill="' + fill + '"/>';
  }
  function sparkle(x, y, s, fill) {
    return '<path d="M' + x + ' ' + (y - s) + ' C' + (x + s * .2) + ' ' + (y - s * .2) + ' ' + (x + s * .8) + ' ' + (y - s * .2) + ' ' + (x + s) + ' ' + y +
      ' C' + (x + s * .2) + ' ' + (y + s * .2) + ' ' + (x + s * .2) + ' ' + (y + s * .2) + ' ' + x + ' ' + (y + s) +
      ' C' + (x - s * .2) + ' ' + (y + s * .2) + ' ' + (x - s * .8) + ' ' + (y + s * .2) + ' ' + (x - s) + ' ' + y +
      ' C' + (x - s * .2) + ' ' + (y - s * .2) + ' ' + (x - s * .2) + ' ' + (y - s * .2) + ' ' + x + ' ' + (y - s) + 'Z" fill="' + fill + '"/>';
  }

  /* ================= BIZZY — logo-faithful front base ================= */
  // o: {pal:'gold'|'grey', mouth, eyes:'open'|'closed'|'up', browL, browR, tear, extras, wingTilt}
  function bizzyFront(o) {
    o = o || {};
    var id = 'bz' + (uid++);
    var grey = o.pal === 'grey';
    var body = grey ? '#E6DCC3' : GOLD, hi = grey ? '#F0E9D6' : GOLD2, stripe = grey ? G2 : DEEP,
        wing = grey ? '#EDEAE4' : WNG, wingS = grey ? G3 : WNGS, cheek = grey ? '#D8CBC4' : CHEEK,
        pup = grey ? G2 : PUP, sm = grey ? G2 : SMILE, starF = grey ? G3 : HONEY;
    var wt = o.wingTilt || 0;
    var s = '<g transform="translate(120,135) scale(1) translate(-120,-135)">';
    s += '<ellipse cx="58" cy="106" rx="30" ry="50" fill="' + wing + '" stroke="' + wingS + '" stroke-width="3" opacity=".92" transform="rotate(' + (-26 - wt) + ' 58 106)"/>';
    s += '<ellipse cx="182" cy="106" rx="30" ry="50" fill="' + wing + '" stroke="' + wingS + '" stroke-width="3" opacity=".92" transform="rotate(' + (26 + wt) + ' 182 106)"/>';
    s += '<path d="M104,84 Q88,48 84,28" fill="none" stroke="' + stripe + '" stroke-width="6" stroke-linecap="round"/>';
    s += '<path d="M136,84 Q152,48 156,28" fill="none" stroke="' + stripe + '" stroke-width="6" stroke-linecap="round"/>';
    s += star5(84, 21, 11, starF) + star5(156, 21, 11, starF);
    s += '<ellipse cx="32" cy="196" rx="13" ry="20" fill="' + body + '" transform="rotate(22 32 196)"/>';
    s += '<ellipse cx="208" cy="196" rx="13" ry="20" fill="' + body + '" transform="rotate(-22 208 196)"/>';
    s += '<ellipse cx="120" cy="172" rx="88" ry="96" fill="' + body + '"/>';
    s += '<ellipse cx="98" cy="118" rx="42" ry="30" fill="' + hi + '" opacity=".5"/>';
    s += '<defs><clipPath id="' + id + '"><ellipse cx="120" cy="172" rx="88" ry="96"/></clipPath></defs>';
    s += '<g clip-path="url(#' + id + ')"><rect x="28" y="214" width="184" height="24" fill="' + stripe + '"/><rect x="28" y="246" width="184" height="24" fill="' + stripe + '"/></g>';
    s += '<g transform="translate(0,-18)">';
    s += '<ellipse cx="62" cy="184" rx="15" ry="9" fill="' + cheek + '" opacity=".85"/><ellipse cx="178" cy="184" rx="15" ry="9" fill="' + cheek + '" opacity=".85"/>';
    if (o.eyes === 'closed') {
      s += '<path d="M72 150 Q92 134 112 150" fill="none" stroke="' + pup + '" stroke-width="9" stroke-linecap="round"/>';
      s += '<path d="M132 150 Q152 134 172 150" fill="none" stroke="' + pup + '" stroke-width="9" stroke-linecap="round"/>';
    } else {
      var dx = o.eyes === 'up' ? 0 : 2, dy = o.eyes === 'up' ? -5 : 2;
      s += '<circle cx="92" cy="150" r="27" fill="#FFFFFF"/><circle cx="' + (92 + dx) + '" cy="' + (150 + dy) + '" r="13" fill="' + pup + '"/><circle cx="' + (87.5 + dx) + '" cy="' + (144.8 + dy) + '" r="4.2" fill="#FFFFFF"/>';
      s += '<circle cx="152" cy="150" r="27" fill="#FFFFFF"/><circle cx="' + (152 + dx) + '" cy="' + (150 + dy) + '" r="13" fill="' + pup + '"/><circle cx="' + (147.5 + dx) + '" cy="' + (144.8 + dy) + '" r="4.2" fill="#FFFFFF"/>';
    }
    if (o.browL) s += '<path d="' + o.browL + '" fill="none" stroke="' + pup + '" stroke-width="7" stroke-linecap="round"/>';
    if (o.browR) s += '<path d="' + o.browR + '" fill="none" stroke="' + pup + '" stroke-width="7" stroke-linecap="round"/>';
    s += o.mouth || '<path d="M96,196 Q120,224 150,196" fill="none" stroke="' + sm + '" stroke-width="9" stroke-linecap="round"/>';
    if (o.tear) s += '<path d="M70 168 C70 180 62 183 62 191 A8.5 8.5 0 0 0 79 191 C79 183 74 180 74 168 Z" fill="#7FB8E8"/><circle cx="68" cy="188" r="2.6" fill="#fff" opacity=".7"/>';
    s += '</g>' + (o.extras || '') + '</g>';
    return s;
  }
  var M = {
    determined: '<path d="M102,200 Q120,208 138,200" fill="none" stroke="' + SMILE + '" stroke-width="9" stroke-linecap="round"/>',
    worried: '<ellipse cx="120" cy="203" rx="13" ry="16" fill="' + SMILE + '"/><ellipse cx="120" cy="207" rx="7" ry="8" fill="#FF9FC8"/>',
    heartbroken: '<path d="M100,210 Q120,192 140,210" fill="none" stroke="' + SMILE + '" stroke-width="9" stroke-linecap="round"/>',
    triumphant: '<path d="M92,192 Q120,232 148,192 Q120,212 92,192Z" fill="' + SMILE + '"/><path d="M108,213 Q120,222 132,213 L130,208 Q120,214 110,208Z" fill="#FF9FC8"/>',
    fadedFlat: '<path d="M100,202 H140" stroke="' + G2 + '" stroke-width="8" stroke-linecap="round" fill="none"/>'
  };
  var PORTRAITS = {
    determined: bizzyFront({ mouth: M.determined, browL: 'M70 118 L108 128', browR: 'M170 118 L132 128' }),
    happy: bizzyFront({}),
    worried: bizzyFront({ mouth: M.worried, eyes: 'up', browL: 'M74 116 Q90 108 106 114', browR: 'M166 116 Q150 108 134 114' }),
    heartbroken: bizzyFront({ mouth: M.heartbroken, tear: true, browL: 'M76 114 Q92 122 106 126', browR: 'M164 114 Q148 122 134 126' }),
    triumphant: bizzyFront({ mouth: M.triumphant, eyes: 'closed', extras: sparkle(28, 60, 14, HONEY) + sparkle(214, 78, 11, '#C9A8F0') + sparkle(196, 34, 8, HONEY) }),
    faded: bizzyFront({ pal: 'grey', mouth: M.fadedFlat, extras: '<path d="M150 250 q6 -10 14 -12" stroke="' + G2 + '" stroke-width="3" stroke-dasharray="3 6" fill="none"/>' })
  };

  /* ---------- Bizzy side view (logo proportions, facing right) ---------- */
  function bizzySide(fw, bw, legs, extras, tilt) {
    var id = 'bs' + (uid++);
    var s = '<g transform="rotate(' + (tilt || 0) + ' 130 130)">';
    s += '<g transform="rotate(' + bw + ' 108 62)" opacity=".7"><ellipse cx="96" cy="34" rx="24" ry="42" fill="' + WNG + '" stroke="' + WNGS + '" stroke-width="3"/></g>';
    s += '<path d="M42 142 L10 128 L44 116 Z" fill="' + DEEP + '"/>';
    s += '<ellipse cx="132" cy="132" rx="92" ry="76" fill="' + GOLD + '"/>';
    s += '<ellipse cx="110" cy="92" rx="40" ry="26" fill="' + GOLD2 + '" opacity=".5"/>';
    s += '<defs><clipPath id="' + id + '"><ellipse cx="132" cy="132" rx="92" ry="76"/></clipPath></defs>';
    s += '<g clip-path="url(#' + id + ')"><rect x="52" y="56" width="22" height="160" fill="' + DEEP + '" transform="rotate(6 63 132)"/><rect x="96" y="52" width="22" height="168" fill="' + DEEP + '" transform="rotate(6 107 132)"/></g>';
    s += '<ellipse cx="196" cy="158" rx="13" ry="8" fill="' + CHEEK + '" opacity=".85"/>';
    s += '<circle cx="182" cy="112" r="24" fill="#FFFFFF"/><circle cx="188" cy="114" r="11.5" fill="' + PUP + '"/><circle cx="184" cy="109.5" r="3.8" fill="#FFFFFF"/>';
    s += '<path d="M196 138 Q210 148 222 136" fill="none" stroke="' + SMILE + '" stroke-width="7" stroke-linecap="round"/>';
    s += '<path d="M178 62 Q192 34 206 22" fill="none" stroke="' + DEEP + '" stroke-width="6" stroke-linecap="round"/>' + star5(208, 18, 10, HONEY);
    s += legs || '<path d="M100 204 L92 226 M148 202 L156 224" stroke="' + DEEP + '" stroke-width="7" stroke-linecap="round" fill="none"/>';
    s += '<g transform="rotate(' + fw + ' 120 66)"><ellipse cx="120" cy="30" rx="28" ry="48" fill="' + WNG + '" stroke="' + WNGS + '" stroke-width="3" opacity=".95"/><path d="M120 66 Q118 34 112 12" stroke="' + WNGS + '" stroke-width="2" fill="none" opacity=".7"/></g>';
    s += (extras || '') + '</g>';
    return s;
  }
  var RUN0 = bizzySide(-16, -4, '<path d="M96 202 L74 220 M150 200 L172 214" stroke="' + DEEP + '" stroke-width="8" stroke-linecap="round" fill="none"/>', sparkle(20, 190, 8, G3) + sparkle(34, 216, 6, G3), 6);
  var RUN1 = bizzySide(-10, 2, '<path d="M100 202 L88 226 M146 202 L152 228" stroke="' + DEEP + '" stroke-width="8" stroke-linecap="round" fill="none"/>', sparkle(26, 204, 7, G3), 6);
  function bizzyTop(f) {
    var id = 'bt' + (uid++), wa = f === 0 ? 24 : 40;
    var s = '';
    s += '<ellipse cx="42" cy="112" rx="30" ry="52" fill="' + WNG + '" stroke="' + WNGS + '" stroke-width="3" transform="rotate(' + wa + ' 42 112)" opacity=".92"/>';
    s += '<ellipse cx="198" cy="112" rx="30" ry="52" fill="' + WNG + '" stroke="' + WNGS + '" stroke-width="3" transform="rotate(' + (-wa) + ' 198 112)" opacity=".92"/>';
    s += '<path d="M112 214 L120 244 L128 214 Z" fill="' + DEEP + '"/>';
    s += '<ellipse cx="120" cy="128" rx="66" ry="86" fill="' + GOLD + '"/>';
    s += '<defs><clipPath id="' + id + '"><ellipse cx="120" cy="128" rx="66" ry="86"/></clipPath></defs>';
    s += '<g clip-path="url(#' + id + ')"><rect x="46" y="118" width="148" height="20" fill="' + DEEP + '"/><rect x="46" y="150" width="148" height="20" fill="' + DEEP + '"/><rect x="46" y="182" width="148" height="20" fill="' + DEEP + '"/></g>';
    s += '<circle cx="120" cy="46" r="34" fill="' + GOLD + '"/><ellipse cx="108" cy="36" rx="14" ry="9" fill="' + GOLD2 + '" opacity=".6"/>';
    s += '<path d="M104 22 Q92 8 80 4" stroke="' + DEEP + '" stroke-width="5" stroke-linecap="round" fill="none"/>' + star5(78, 3, 8, HONEY);
    s += '<path d="M136 22 Q148 8 160 4" stroke="' + DEEP + '" stroke-width="5" stroke-linecap="round" fill="none"/>' + star5(162, 3, 8, HONEY);
    return s;
  }
  var LEAP0 = '<ellipse cx="120" cy="182" rx="96" ry="62" fill="' + GOLD + '"/>' +
    '<ellipse cx="96" cy="150" rx="36" ry="18" fill="' + GOLD2 + '" opacity=".5"/>' +
    '<path d="M56 158 Q50 182 56 206 M104 152 Q98 182 104 210" stroke="' + DEEP + '" stroke-width="14" stroke-linecap="round" fill="none" opacity=".9"/>' +
    '<circle cx="152" cy="158" r="20" fill="#fff"/><circle cx="156" cy="162" r="9.5" fill="' + PUP + '"/><circle cx="152.5" cy="158.5" r="3" fill="#fff"/>' +
    '<circle cx="196" cy="158" r="20" fill="#fff"/><circle cx="200" cy="162" r="9.5" fill="' + PUP + '"/><circle cx="196.5" cy="158.5" r="3" fill="#fff"/>' +
    '<path d="M138 138 L166 146 M210 138 L184 146" stroke="' + PUP + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M160 196 Q175 204 190 194" fill="none" stroke="' + SMILE + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M96 238 L82 252 M150 240 L162 254" stroke="' + DEEP + '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M40 258 H208" stroke="' + G3 + '" stroke-width="5" stroke-linecap="round"/>';
  var LEAP1 = '<g transform="rotate(-22 120 130)">' + bizzySide(-30, -16, '<path d="M96 200 L76 212 M148 200 L168 208" stroke="' + DEEP + '" stroke-width="7" stroke-linecap="round" fill="none"/>', '', 0) + '</g>' +
    sparkle(18, 210, 12, HONEY) + sparkle(40, 240, 8, '#C9A8F0') + '<path d="M6 186 h30 M0 206 h22" stroke="' + G3 + '" stroke-width="4" stroke-linecap="round"/>';
  var QUILL_EX = '<g transform="translate(196,44) rotate(14) scale(2.1)"><path d="M28 4 C20 8 13 17 11 28 L14 30 C24 26 30 16 32 7 Z" fill="' + GOLD2 + '" stroke="' + DEEP + '" stroke-width="1.6"/><path d="M26.5 9 L15.5 25 M29 12 L18.5 26.5 M24 7.5 L13.5 22" stroke="' + GLD + '" stroke-width="1.1"/><path d="M11 28 L7 35" stroke="' + DEEP + '" stroke-width="2.4" stroke-linecap="round"/><path d="M7 35 l-1.6 3.2 3.2-.6Z" fill="' + DEEP + '"/></g>' +
    '<path d="M208 186 Q224 166 232 140" stroke="' + GOLD + '" stroke-width="16" stroke-linecap="round" fill="none"/>' +
    sparkle(226, 30, 13, HONEY) + sparkle(180, 14, 9, '#C9A8F0');
  var BIZZY_QUILL = bizzyFront({ mouth: M.determined, browL: 'M70 118 L108 128', browR: 'M170 118 L132 128', extras: QUILL_EX });

  /* ================= Crew (library buddies, vb 0 0 40 40 — untouched rule) ================= */
  var FOX = '<path d="M9 7 L15 14 L7 14 Z" fill="#F0894B"/><path d="M31 7 L25 14 L33 14 Z" fill="#F0894B"/><circle cx="20" cy="21" r="11" fill="#F0894B"/><path d="M20 22 C24 22 26 25 24.5 28 C22 32 18 32 15.5 28 C14 25 16 22 20 22 Z" fill="#FFF1E6"/><circle cx="20" cy="24.5" r="1.6" fill="#2A2140"/><circle cx="16" cy="19" r="1.9" fill="#2A2140"/><circle cx="24" cy="19" r="1.9" fill="#2A2140"/><circle cx="16.7" cy="18.3" r=".68" fill="#fff"/><circle cx="24.7" cy="18.3" r=".68" fill="#fff"/>';
  var PANDA = '<circle cx="11" cy="11" r="3.5" fill="#2A2140"/><circle cx="29" cy="11" r="3.5" fill="#2A2140"/><circle cx="20" cy="21" r="11" fill="#F4F4F8" stroke="#2A2140" stroke-width="1.1"/><ellipse cx="15" cy="20" rx="3" ry="4" fill="#2A2140"/><ellipse cx="25" cy="20" rx="3" ry="4" fill="#2A2140"/><circle cx="15" cy="20" r="1.4" fill="#fff"/><circle cx="25" cy="20" r="1.4" fill="#fff"/><circle cx="20" cy="25" r="1.4" fill="#2A2140"/>';
  var OWL = '<path d="M12 8 L16 13 L10 13 Z" fill="#3F938B"/><path d="M28 8 L24 13 L30 13 Z" fill="#3F938B"/><circle cx="20" cy="21" r="11" fill="#4FB0A6"/><circle cx="16" cy="20" r="4" fill="#fff"/><circle cx="24" cy="20" r="4" fill="#fff"/><circle cx="16" cy="20" r="2" fill="#2A2140"/><circle cx="24" cy="20" r="2" fill="#2A2140"/><path d="M20 24 L17.5 27 L22.5 27 Z" fill="' + HONEY + '"/>';
  function cheer(base, col) {
    return base +
      '<path d="M10 20 Q5.5 16 4.5 11" stroke="' + col + '" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="4.5" cy="11" r="1.8" fill="' + col + '"/>' +
      '<path d="M30 20 Q34.5 16 35.5 11" stroke="' + col + '" stroke-width="2.4" stroke-linecap="round" fill="none"/><circle cx="35.5" cy="11" r="1.8" fill="' + col + '"/>' +
      star5(7, 6, 2.6, HONEY) + star5(33, 5, 2.2, '#F2A8C4');
  }

  /* ================= Villains v2 — richer ================= */
  function vexHead(fury) {
    var eyes = fury
      ? '<path d="M32 34 L52 41 M88 34 L68 41" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<ellipse cx="45" cy="49" rx="7" ry="4" fill="#fff" transform="rotate(12 45 49)"/><path d="M43 47 L47 51" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<ellipse cx="75" cy="49" rx="7" ry="4" fill="#fff" transform="rotate(-12 75 49)"/><path d="M77 47 L73 51" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M46 76 Q60 70 74 76" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M52 74 L50 79 M68 74 L70 79" stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"/>'
      : '<ellipse cx="45" cy="47" rx="7.5" ry="4.8" fill="#fff" transform="rotate(-14 45 47)"/><circle cx="46.5" cy="47" r="2.8" fill="' + INK + '"/>' +
        '<ellipse cx="75" cy="47" rx="7.5" ry="4.8" fill="#fff" transform="rotate(14 75 47)"/><circle cx="73.5" cy="47" r="2.8" fill="' + INK + '"/>' +
        '<path d="M45 73 Q60 83 75 73" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M71 75.5 L74 80" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    var monocle = fury
      ? '<circle cx="75" cy="47" r="11" fill="none" stroke="' + GLD + '" stroke-width="2.2" transform="rotate(8 75 47)"/><path d="M84 55 Q88 66 84 74" stroke="' + GLD + '" stroke-width="1.6" fill="none"/>'
      : '<circle cx="75" cy="47" r="11" fill="none" stroke="' + GLD + '" stroke-width="2.2"/><path d="M69 41 A8.5 8.5 0 0 1 80 43" stroke="#fff" stroke-width="1.8" fill="none" opacity=".8"/><path d="M84 54 Q88 64 85 72" stroke="' + GLD + '" stroke-width="1.6" fill="none"/><circle cx="85" cy="73.5" r="1.8" fill="' + GLD + '"/>';
    return '' +
      '<path d="M48 16 Q36 4 20 3" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/><circle cx="20" cy="3" r="3.4" fill="' + INK + '"/><circle cx="20" cy="3" r="1.4" fill="' + GLD + '"/>' +
      '<path d="M72 16 Q84 4 100 3" stroke="' + INK + '" stroke-width="4.5" stroke-linecap="round" fill="none"/><circle cx="100" cy="3" r="3.4" fill="' + INK + '"/><circle cx="100" cy="3" r="1.4" fill="' + GLD + '"/>' +
      '<circle cx="60" cy="56" r="33" fill="' + CRIM + '"/>' +
      '<path d="M30 68 A33 33 0 0 0 90 68 L90 76 A33 33 0 0 1 30 76 Z" fill="' + CRIM2 + '" opacity=".7"/>' +
      '<ellipse cx="46" cy="34" rx="14" ry="8" fill="#E76D88" opacity=".55"/>' +
      '<path d="M28 40 C38 32 82 32 92 40 L90 52 C78 44 42 44 30 52 Z" fill="' + INK + '"/>' +
      '<path d="M30 43 C42 36 78 36 90 43" stroke="' + GLD + '" stroke-width="1.4" fill="none"/>' +
      eyes + monocle +
      '<path d="M38 86 H82 L76 100 H44 Z" fill="' + INK + '"/><path d="M41 91 H79" stroke="' + GLD + '" stroke-width="1.4"/>' +
      '<path d="M54 86 L60 93 L66 86 L64 82 L56 82 Z" fill="' + CRIM + '" stroke="' + GLD + '" stroke-width="1"/>';
  }
  var VEX_FULL = '' +
    '<g opacity=".85"><ellipse cx="34" cy="52" rx="9" ry="26" fill="rgba(196,180,255,.30)" stroke="rgba(58,42,140,.35)" stroke-width="1.4" transform="rotate(22 34 52)"/><path d="M30 32 Q32 52 38 72 M26 40 Q30 54 34 66" stroke="rgba(58,42,140,.3)" stroke-width="1" fill="none" transform="rotate(22 34 52)"/></g>' +
    '<g opacity=".85"><ellipse cx="86" cy="52" rx="9" ry="26" fill="rgba(196,180,255,.30)" stroke="rgba(58,42,140,.35)" stroke-width="1.4" transform="rotate(-22 86 52)"/><path d="M90 32 Q88 52 82 72 M94 40 Q90 54 86 66" stroke="rgba(58,42,140,.3)" stroke-width="1" fill="none" transform="rotate(-22 86 52)"/></g>' +
    '<path d="M50 16 Q42 6 30 4.5" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="30" cy="4.5" r="2.6" fill="' + INK + '"/><circle cx="30" cy="4.5" r="1.1" fill="' + GLD + '"/>' +
    '<path d="M70 16 Q78 6 90 4.5" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round" fill="none"/><circle cx="90" cy="4.5" r="2.6" fill="' + INK + '"/><circle cx="90" cy="4.5" r="1.1" fill="' + GLD + '"/>' +
    '<circle cx="60" cy="30" r="18" fill="' + CRIM + '"/><ellipse cx="52" cy="20" rx="8" ry="5" fill="#E76D88" opacity=".55"/>' +
    '<path d="M44 24 C50 19 70 19 76 24 L75 31 C68 27 52 27 45 31 Z" fill="' + INK + '"/><path d="M46 26 C54 22 66 22 74 26" stroke="' + GLD + '" stroke-width="1" fill="none"/>' +
    '<ellipse cx="53" cy="34" rx="4" ry="2.6" fill="#fff" transform="rotate(-14 53 34)"/><circle cx="54" cy="34" r="1.5" fill="' + INK + '"/>' +
    '<ellipse cx="67" cy="34" rx="4" ry="2.6" fill="#fff" transform="rotate(14 67 34)"/><circle cx="66" cy="34" r="1.5" fill="' + INK + '"/>' +
    '<circle cx="67" cy="34" r="6" fill="none" stroke="' + GLD + '" stroke-width="1.4"/><path d="M72 39 Q75 46 73 52" stroke="' + GLD + '" stroke-width="1" fill="none"/>' +
    '<path d="M53 42 Q60 47 67 42" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
    '<path d="M46 48 C42 56 42 64 48 70 L72 70 C78 64 78 56 74 48 C68 44 52 44 46 48 Z" fill="' + INK + '"/>' +
    '<path d="M60 48 L60 70 M52 48 L56 70 M68 48 L64 70" stroke="#3A3450" stroke-width="1.2"/>' +
    '<path d="M47 52 H73 M46 58 H74" stroke="' + GLD + '" stroke-width="1"/>' +
    '<path d="M56 46 L60 52 L64 46 L62 43 L58 43 Z" fill="' + CRIM + '" stroke="' + GLD + '" stroke-width=".8"/>' +
    '<path d="M52 70 C46 82 46 98 60 108 C74 98 74 82 68 70 Z" fill="' + CRIM + '"/>' +
    '<path d="M49.5 79 H70.5 M48.5 88 H71.5 M50.5 97 H69.5" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M49 83.5 H71 M49.5 92.5 H70.5" stroke="' + GLD + '" stroke-width="1.2"/>' +
    '<path d="M58 108 L60 120 L62 108 Z" fill="' + INK + '"/>' +
    '<path d="M74 56 Q82 60 86 68" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round" fill="none"/><circle cx="86" cy="68" r="2.6" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>' +
    '<path d="M86 70 V116" stroke="' + INK + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M86 70 C86 60 99 60 99 68" stroke="' + GLD + '" stroke-width="3.4" stroke-linecap="round" fill="none"/>' +
    '<circle cx="99" cy="68" r="2.8" fill="' + CRIM + '" stroke="' + GLD + '" stroke-width="1.2"/>' +
    '<path d="M83 116 h6 l2 5 h-10 Z" fill="' + GLD + '"/>' +
    '<path d="M46 60 Q38 64 34 72" stroke="' + INK + '" stroke-width="3.6" stroke-linecap="round" fill="none"/><circle cx="34" cy="72" r="2.6" fill="#fff" stroke="' + INK + '" stroke-width="1.4"/>';
  function moth(f) {
    var wa = f === 0 ? -28 : -8;
    function wing(sign) {
      var cx = 60 + sign * 22, rot = sign * (-wa);
      return '<g transform="rotate(' + rot + ' ' + cx + ' 52)">' +
        '<path d="M' + cx + ' 52 C' + (cx + sign * 34) + ' 24 ' + (cx + sign * 40) + ' 56 ' + (cx + sign * 26) + ' 66 C' + (cx + sign * 34) + ' 72 ' + (cx + sign * 18) + ' 84 ' + cx + ' 70 Z" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="2"/>' +
        '<circle cx="' + (cx + sign * 20) + '" cy="44" r="6" fill="' + G4 + '" stroke="' + G2 + '" stroke-width="1.4"/><circle cx="' + (cx + sign * 20) + '" cy="44" r="2.2" fill="' + G2 + '"/>' +
        '<path d="M' + cx + ' 56 Q' + (cx + sign * 16) + ' 58 ' + (cx + sign * 24) + ' 64" stroke="' + G2 + '" stroke-width="1.2" fill="none"/></g>';
    }
    return wing(-1) + wing(1) +
      '<ellipse cx="60" cy="62" rx="9" ry="20" fill="' + G1 + '"/>' +
      '<path d="M53 50 Q60 44 67 50 M53 58 Q60 52 67 58" stroke="' + G2 + '" stroke-width="2" fill="none"/>' +
      '<circle cx="60" cy="40" r="9" fill="' + G1 + '"/>' +
      '<path d="M56 33 Q50 24 42 22 M58 32 Q54 25 49 22" stroke="' + G2 + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M64 33 Q70 24 78 22 M62 32 Q66 25 71 22" stroke="' + G2 + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
      '<circle cx="56.5" cy="39" r="2" fill="' + INK + '" opacity=".8"/><circle cx="63.5" cy="39" r="2" fill="' + INK + '" opacity=".8"/>' +
      '<path d="M52 74 Q60 80 68 74" stroke="' + G2 + '" stroke-width="1.6" fill="none" opacity=".7"/>';
  }
  function miniMoth(x, y, r, s) {
    return '<g transform="translate(' + x + ',' + y + ') rotate(' + r + ') scale(' + (s || 1) + ')"><ellipse cx="-3.4" cy="0" rx="3.6" ry="5" fill="' + G3 + '" transform="rotate(-20)"/><ellipse cx="3.4" cy="0" rx="3.6" ry="5" fill="' + G3 + '" transform="rotate(20)"/><circle cx="-3.4" cy="-1" r="1.2" fill="' + G4 + '"/><circle cx="3.4" cy="-1" r="1.2" fill="' + G4 + '"/><ellipse cx="0" cy="1.5" rx="1.8" ry="4.4" fill="' + G1 + '"/></g>';
  }
  var SMUDGE = '' +
    '<path d="M60 68 C38 70 22 62 18 50 C10 48 8 36 16 31 C14 20 26 12 36 16 C42 6 62 4 72 12 C84 6 100 14 100 26 C110 30 112 44 104 50 C102 62 84 70 60 68 Z" fill="' + G2 + '"/>' +
    '<path d="M34 26 C42 18 66 16 78 22" stroke="' + G3 + '" stroke-width="3" stroke-linecap="round" fill="none" opacity=".5"/>' +
    '<path d="M28 56 C36 62 52 64 62 62" stroke="' + G1 + '" stroke-width="4" stroke-linecap="round" fill="none" opacity=".5"/>' +
    '<path d="M24 70 q2 6 -2 10 M50 72 q1 5 -3 9 M84 68 q3 5 0 10" stroke="' + G2 + '" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"/>' +
    '<ellipse cx="45" cy="40" rx="7" ry="8.5" fill="' + G4 + '"/><ellipse cx="75" cy="40" rx="7" ry="8.5" fill="' + G4 + '"/>' +
    '<circle cx="45" cy="41.5" r="2.6" fill="' + INK + '"/><circle cx="75" cy="41.5" r="2.6" fill="' + INK + '"/>' +
    '<path d="M40 32 L50 35 M80 32 L70 35" stroke="' + G4 + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M46 56 Q54 61 62 56 Q70 61 76 55" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" fill="none" opacity=".7"/>' +
    miniMoth(16, 22, -24) + miniMoth(102, 20, 20) + miniMoth(8, 48, -60, .8) + miniMoth(112, 46, 55, .8) + miniMoth(58, 6, 6, .9) + miniMoth(88, 64, 30, .75) + miniMoth(30, 66, -30, .75) + miniMoth(70, 74, 12, .65);

  /* ================= Artifacts v2 ================= */
  function quill(pal, glow) {
    var f1 = pal === 'grey' ? G3 : GOLD2, f2 = pal === 'grey' ? G2 : GLD, ink = pal === 'grey' ? G2 : DEEP;
    return (glow ? '<circle cx="20" cy="20" r="17.5" fill="' + HONEY + '" opacity=".28"/><circle cx="20" cy="20" r="12" fill="' + HONEY + '" opacity=".22"/>' + sparkle(31, 6, 3, HONEY) + sparkle(6, 12, 2.4, '#C9A8F0') : '') +
      '<ellipse cx="19" cy="37.2" rx="9" ry="1.7" fill="' + f2 + '" opacity=".3"/>' +
      '<path d="M28 4 C20 8 13 17 11 28 L14 30 C24 26 30 16 32 7 Z" fill="' + f1 + '" stroke="' + ink + '" stroke-width="1.5"/>' +
      '<path d="M30 5.5 C25 7 18 13 14.5 20" stroke="#fff" stroke-width="1.2" fill="none" opacity="' + (pal === 'grey' ? .3 : .7) + '"/>' +
      '<path d="M26.5 9 L15.5 25 M29 12 L18.5 26.5 M24 7.5 L13.5 22" stroke="' + f2 + '" stroke-width="1.1"/>' +
      '<path d="M12.8 26.2 L12 30.5" stroke="' + f2 + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M11 28 L7.5 34.5" stroke="' + ink + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M7.5 34.5 l-1.6 3.2 3.2-.6 Z" fill="' + ink + '"/>' +
      '<circle cx="27" cy="8" r="1.6" fill="#fff" opacity="' + (pal === 'grey' ? .35 : .85) + '"/>';
  }
  var GEM1 = '<ellipse cx="20" cy="37.5" rx="9.5" ry="1.8" fill="' + GLD + '" opacity=".28"/>' +
    '<path d="M20 4 L33 12 V28 L20 36 L7 28 V12 Z" fill="' + GLD + '" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M20 9 L28.5 14.5 V25.5 L20 31 L11.5 25.5 V14.5 Z" fill="' + GOLD2 + '"/>' +
    '<path d="M20 9 L20 31 M11.5 14.5 L28.5 25.5 M28.5 14.5 L11.5 25.5" stroke="' + GLD + '" stroke-width=".9" opacity=".8"/>' +
    '<path d="M20 14 L24.5 17 V23 L20 26 L15.5 23 V17 Z" fill="#FFE9AE"/>' +
    '<circle cx="14.5" cy="12.5" r="2.1" fill="#fff" opacity=".9"/>' + sparkle(31.5, 7, 2.6, '#fff');
  function dice(loaded) {
    var d2 = loaded
      ? '<g transform="rotate(10 60 22)"><rect x="44" y="6" width="32" height="32" rx="7" fill="' + G4 + '" stroke="' + G2 + '" stroke-width="2"/>' +
        '<circle cx="52" cy="14" r="2.4" fill="' + G2 + '"/><circle cx="60" cy="14" r="2.4" fill="' + G2 + '"/><circle cx="68" cy="14" r="2.4" fill="' + G2 + '"/>' +
        '<circle cx="52" cy="22" r="2.4" fill="' + G2 + '"/><circle cx="68" cy="22" r="2.4" fill="' + G2 + '"/>' +
        '<circle cx="52" cy="30" r="2.4" fill="' + G2 + '"/><circle cx="60" cy="30" r="2.4" fill="' + G2 + '"/><circle cx="68" cy="30" r="2.4" fill="' + G2 + '"/>' +
        miniMoth(74, 4, 20, .6) + '</g>' + sparkle(78, 4, 3.4, CRIM)
      : '<g transform="rotate(8 60 22)"><rect x="44" y="6" width="32" height="32" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M47 9 A28 28 0 0 1 58 8" stroke="#DDD9E4" stroke-width="2" fill="none"/>' +
        '<circle cx="52" cy="14" r="2.6" fill="' + INK + '"/><circle cx="60" cy="22" r="2.6" fill="' + INK + '"/><circle cx="68" cy="30" r="2.6" fill="' + INK + '"/></g>';
    return '<ellipse cx="40" cy="41" rx="30" ry="2.2" fill="' + INK + '" opacity=".12"/>' +
      '<g transform="rotate(-6 20 22)"><rect x="4" y="6" width="32" height="32" rx="7" fill="#fff" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M7 9 A28 28 0 0 1 18 8" stroke="#DDD9E4" stroke-width="2" fill="none"/>' +
      '<circle cx="12" cy="14" r="2.6" fill="' + INK + '"/><circle cx="28" cy="14" r="2.6" fill="' + INK + '"/><circle cx="20" cy="22" r="2.6" fill="' + INK + '"/><circle cx="12" cy="30" r="2.6" fill="' + INK + '"/><circle cx="28" cy="30" r="2.6" fill="' + INK + '"/></g>' + d2;
  }

  /* ================= Meadow env (unchanged from v1 + petal fix) ================= */
  function flower(x, y, petal, labelText) {
    var petals = '';
    for (var i = 0; i < 6; i++) petals += '<ellipse cx="0" cy="-11" rx="4.5" ry="7.5" fill="' + petal + '" transform="rotate(' + (i * 60) + ')"/>';
    return '<g transform="translate(' + x + ',' + y + ')">' +
      '<path d="M0 6 V26" stroke="#5F8A6B" stroke-width="2.6" stroke-linecap="round"/>' +
      '<g>' + petals + '</g><circle r="5.5" fill="' + HONEY + '"/><circle cx="-1.6" cy="-1.6" r="1.4" fill="#fff" opacity=".8"/>' +
      '<rect x="-19" y="28" width="38" height="13" rx="4" fill="#FFFDF6" stroke="#5F8A6B" stroke-width="1.2"/>' +
      (labelText ? '<text y="37.5" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="8.5" fill="#2A2140" letter-spacing="1">' + labelText + '</text>' : '') +
      '</g>';
  }
  function hexCell(x, y, s, fill, sk) {
    return '<path d="M' + x + ' ' + (y - s) + ' L' + (x + s * .87) + ' ' + (y - s / 2) + ' V' + (y + s / 2) + ' L' + x + ' ' + (y + s) + ' L' + (x - s * .87) + ' ' + (y + s / 2) + ' V' + (y - s / 2) + ' Z" fill="' + fill + '" stroke="' + sk + '" stroke-width="1.4"/>';
  }
  var MEADOW_COLOR = '<g id="color">' +
    '<rect width="640" height="240" fill="#DFF2F8"/>' +
    '<ellipse cx="110" cy="42" rx="34" ry="12" fill="#fff" opacity=".85"/><ellipse cx="470" cy="30" rx="42" ry="13" fill="#fff" opacity=".75"/>' +
    '<circle cx="580" cy="34" r="20" fill="' + GOLD2 + '"/><circle cx="580" cy="34" r="20" fill="none" stroke="#F0B429" stroke-width="2"/>' +
    '<path d="M0 150 C120 108 250 108 340 142 C440 178 560 176 640 140 V240 H0 Z" fill="#A8D18C"/>' +
    '<path d="M0 190 C150 158 340 162 640 186 V240 H0 Z" fill="#7FAF6B"/>' +
    hexCell(560, 176, 17, '#FFE9AE', '#E3B23C') + hexCell(590, 193, 17, GOLD2, '#E3B23C') + hexCell(560, 210, 17, '#FFE9AE', '#E3B23C') +
    flower(90, 158, '#F2A8C4', 'DAISY') + flower(210, 172, '#C9A8F0', 'TULIP') + flower(330, 162, '#FF8FB0', 'POPPY') + flower(450, 178, '#7FB8E8', 'LUPIN') +
    '<path d="M480 96 C520 60 560 66 596 88" stroke="' + HONEY + '" stroke-width="2" stroke-dasharray="1 7" stroke-linecap="round" fill="none"/>' +
    '</g>';
  var MEADOW_GREY = ('<g id="grey">' +
    '<rect width="640" height="240" fill="#DCD8D0"/>' +
    '<ellipse cx="110" cy="42" rx="34" ry="12" fill="#EAE7E1" opacity=".9"/><ellipse cx="470" cy="30" rx="42" ry="13" fill="#EAE7E1" opacity=".8"/>' +
    '<circle cx="580" cy="34" r="20" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="2"/>' +
    '<path d="M0 150 C120 108 250 108 340 142 C440 178 560 176 640 140 V240 H0 Z" fill="' + G3 + '"/>' +
    '<path d="M0 190 C150 158 340 162 640 186 V240 H0 Z" fill="' + G1 + '"/>' +
    hexCell(560, 176, 17, G4, G2) + hexCell(590, 193, 17, G3, G2) + hexCell(560, 210, 17, G4, G2) +
    flower(90, 158, G2, '') + flower(210, 172, G2, '') + flower(330, 162, G2, '') + flower(450, 178, G2, '') +
    '</g>').replace(/#5F8A6B/g, G2).replace(new RegExp(HONEY + '"', 'g'), '#B3AB9D"').replace(/#FFFDF6/g, '#EFECE6');

  /* ================= Registry ================= */
  var A = {
    'bizzy-base': { vb: '0 0 240 270', frames: [PORTRAITS.happy] },
    'bizzy-portrait-determined': { vb: '0 0 240 270', frames: [PORTRAITS.determined] },
    'bizzy-portrait-happy': { vb: '0 0 240 270', frames: [PORTRAITS.happy] },
    'bizzy-portrait-worried': { vb: '0 0 240 270', frames: [PORTRAITS.worried] },
    'bizzy-portrait-heartbroken': { vb: '0 0 240 270', frames: [PORTRAITS.heartbroken] },
    'bizzy-portrait-faded': { vb: '0 0 240 270', frames: [PORTRAITS.faded] },
    'bizzy-portrait-triumphant': { vb: '0 0 240 270', frames: [PORTRAITS.triumphant] },
    'bizzy-side-fly': { vb: '0 0 250 240', frames: [bizzySide(-38, -22), bizzySide(-14, 0), bizzySide(14, 28), bizzySide(-14, 0)] },
    'bizzy-run': { vb: '0 0 250 240', frames: [RUN0, RUN1] },
    'bizzy-top': { vb: '0 0 240 250', frames: [bizzyTop(0), bizzyTop(1)] },
    'bizzy-leap': { vb: '0 0 240 270', frames: [LEAP0, LEAP1] },
    'bizzy-quill': { vb: '0 0 250 270', frames: [BIZZY_QUILL] },
    'crew-fox': { vb: '0 0 40 40', frames: [FOX] },
    'crew-fox-cheer': { vb: '0 0 40 40', frames: [cheer(FOX, '#F0894B')] },
    'crew-panda': { vb: '0 0 40 40', frames: [PANDA] },
    'crew-panda-cheer': { vb: '0 0 40 40', frames: [cheer(PANDA, '#2A2140')] },
    'crew-owl': { vb: '0 0 40 40', frames: [OWL] },
    'crew-owl-cheer': { vb: '0 0 40 40', frames: [cheer(OWL, '#4FB0A6')] },
    'vex-portrait': { vb: '0 0 120 108', frames: [vexHead(false)] },
    'vex-portrait-fury': { vb: '0 0 120 108', frames: [vexHead(true)] },
    'vex-full': { vb: '0 0 120 124', frames: [VEX_FULL] },
    'grey-moth': { vb: '0 0 120 96', frames: [moth(0), moth(1)] },
    'smudge-swarm': { vb: '0 0 120 84', frames: [SMUDGE] },
    'artifact-quill': { vb: '0 0 40 40', frames: [quill('gold', false)] },
    'artifact-quill-glow': { vb: '0 0 40 40', frames: [quill('gold', true)] },
    'artifact-quill-grey': { vb: '0 0 40 40', frames: [quill('grey', false)] },
    'gem-act1': { vb: '0 0 40 40', frames: [GEM1] },
    'dice-pair': { vb: '0 0 82 44', frames: [dice(false)] },
    'dice-pair-loaded': { vb: '0 0 82 44', frames: [dice(true)] },
    'env-meadow': { vb: '0 0 640 240', frames: [MEADOW_COLOR] },
    'env-meadow-grey': { vb: '0 0 640 240', frames: [MEADOW_GREY] }
  };

  function rng(seed) { var q = seed; return function () { q = (q * 16807) % 2147483647; return (q - 1) / 2147483646; }; }
  /* ================= COMPLETION BATCH — cast + artifacts ================= */
  function sticker(inner, shadow) {
    return '<ellipse cx="20" cy="37.4" rx="10" ry="1.9" fill="' + (shadow || 'rgba(42,33,64,.18)') + '"/>' + inner;
  }
  var CRIM = '#C43D5A', DK = '#241E33';

  /* ---- Sting: guard bee (library-geometry bee + helm + spear) ---- */
  function stingBase(arm) {
    return '<ellipse cx="13" cy="15" rx="4.5" ry="6.5" fill="rgba(124,92,255,.16)"/><ellipse cx="27" cy="15" rx="4.5" ry="6.5" fill="rgba(124,92,255,.16)"/>' +
      '<circle cx="20" cy="21" r="11" fill="' + HONEY + '"/>' +
      '<path d="M11 17 H29 M10.5 23.5 H29.5" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M10 14 a10.5 10.5 0 0 1 20 0 l-2 3 H12Z" fill="#8A8FA8"/><path d="M12 12 a9 9 0 0 1 16 0" stroke="#C9CEDF" stroke-width="1.8" fill="none"/><path d="M18 6.5 h4 v4 h-4Z" fill="#C43D5A"/>' +
      '<circle cx="16.5" cy="20" r="1.8" fill="' + INK + '"/><circle cx="23.5" cy="20" r="1.8" fill="' + INK + '"/><circle cx="17.2" cy="19.3" r="0.65" fill="#fff"/><circle cx="24.2" cy="19.3" r="0.65" fill="#fff"/>' + arm;
  }
  var STING_SALUTE = stingBase('<path d="M17.5 27 H22.5" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<path d="M29 18 Q33 14 33.5 9" stroke="' + INK + '" stroke-width="2.2" stroke-linecap="round" fill="none"/><circle cx="33.5" cy="9" r="1.7" fill="' + INK + '"/>' +
    '<path d="M7 34 V6" stroke="#8A6A42" stroke-width="2.2" stroke-linecap="round"/><path d="M7 6 l-3 6 h6Z" fill="#C9CEDF" stroke="' + INK + '" stroke-width="1.2"/>');
  var STING_DEFECT = '<g transform="rotate(6 20 22)">' + stingBase('<path d="M16.5 28 Q20 25.5 23.5 28" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>') + '</g>' +
    '<path d="M7 30 L13 36 M13 30 L7 36" stroke="#8A6A42" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M30 33 q3 -2 3 -5" stroke="#A39B8E" stroke-width="1.6" fill="none" stroke-linecap="round"/>';

  /* ---- Scopey: telescope owl w/ vision ring ---- */
  var SCOPEY_VISION = '<path d="M12 8 L16 13 L10 13 Z" fill="#3F938B"/><path d="M28 8 L24 13 L30 13 Z" fill="#3F938B"/><circle cx="20" cy="21" r="11" fill="#4FB0A6"/>' +
    '<circle cx="16" cy="20" r="4" fill="#fff"/><circle cx="16" cy="20" r="2" fill="' + INK + '"/>' +
    '<g><circle cx="25" cy="20" r="5" fill="#2A2140"/><circle cx="25" cy="20" r="5" fill="none" stroke="#B8934A" stroke-width="1.8"/><circle cx="25" cy="20" r="2.2" fill="#7FE8D8"/>' +
    '<path d="M30 17 L37 12 M30 23 L37 28" stroke="#7FE8D8" stroke-width="1.4" opacity=".8"/></g>' +
    '<ellipse cx="37" cy="20" rx="2.6" ry="8" fill="none" stroke="#7FE8D8" stroke-width="1.6" opacity=".85"/>' +
    '<path d="M20 24 L17.5 27 L22.5 27 Z" fill="' + HONEY + '"/>';

  /* ---- Hoppy mid-bound ---- */
  var HOPPY_LEAP = '<g transform="rotate(-18 20 20)"><ellipse cx="11" cy="8" rx="3" ry="8" fill="#E8D9C4" transform="rotate(-14 11 8)"/><ellipse cx="19" cy="7" rx="3" ry="8" fill="#F4E8D4" transform="rotate(8 19 7)"/>' +
    '<ellipse cx="19" cy="22" rx="11" ry="9.5" fill="#F4E8D4"/>' +
    '<circle cx="14.5" cy="19" r="1.8" fill="' + INK + '"/><circle cx="23.5" cy="19" r="1.8" fill="' + INK + '"/><circle cx="15.2" cy="18.3" r=".6" fill="#fff"/>' +
    '<path d="M17 24 Q19 26 21 24" stroke="' + INK + '" stroke-width="1.5" stroke-linecap="round" fill="none"/><ellipse cx="19" cy="22.5" rx="1.6" ry="1.1" fill="#E88AAE"/>' +
    '<path d="M9 28 Q4 30 2 34 M27 28 Q33 26 36 20" stroke="#E8D9C4" stroke-width="4.5" stroke-linecap="round" fill="none"/><circle cx="30" cy="27" r="3.4" fill="#FFF"/></g>' +
    '<path d="M4 37 q6 -2 12 0 M20 38 q5 -1.5 10 0" stroke="#C7C1B6" stroke-width="1.6" fill="none" stroke-linecap="round"/>';

  /* ---- Karts: side-view, 2-frame wheel spin ---- */
  function kart(body, driver, f, spark) {
    var wheel = function (x) {
      return '<circle cx="' + x + '" cy="30" r="5.5" fill="' + DK + '"/><circle cx="' + x + '" cy="30" r="2.4" fill="#8A8FA8"/>' +
        '<path d="M' + x + ' 25.5 V27 M' + x + ' 33 V34.5 M' + (x - 4.5) + ' 30 H' + (x - 3) + ' M' + (x + 3) + ' 30 H' + (x + 4.5) + '" stroke="#C9CEDF" stroke-width="1.3" transform="rotate(' + (f ? 45 : 0) + ' ' + x + ' 30)"/>';
    };
    return '<ellipse cx="20" cy="36.4" rx="15" ry="1.8" fill="rgba(42,33,64,.18)"/>' +
      '<path d="M5 27 q-1 -6 6 -7 l4 -5 h8 l3 5 h6 q5 1 4 7 l-2 3 H7Z" fill="' + body + '" stroke="' + DK + '" stroke-width="1.6"/>' +
      '<path d="M7 22 h9" stroke="#fff" stroke-width="1.6" opacity=".5"/>' +
      '<path d="M31 20 h5 l1 3 h-5Z" fill="' + DK + '"/>' + driver + wheel(11) + wheel(29) +
      (spark ? '<g><path d="M2 31 l-5 -2 M3 34 l-6 1 M4 28 l-4 -4" stroke="#FFC23D" stroke-width="1.8" stroke-linecap="round"/><circle cx="3" cy="31" r="1.6" fill="#FFF3C4"/></g>' : '');
  }
  function kdriver(col, face) {
    return '<circle cx="19" cy="13" r="6" fill="' + col + '"/>' + (face || '<circle cx="17.5" cy="12" r="1.2" fill="' + DK + '"/><circle cx="21" cy="12" r="1.2" fill="' + DK + '"/><path d="M17.5 15.5 q1.8 1.6 3.6 0" stroke="' + DK + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>') +
      '<path d="M13.5 11 a6 6 0 0 1 11 0 l-1 1.6 h-9Z" fill="' + DK + '" opacity=".85"/>';
  }
  var KARTS = {
    'kart-rally': ['#E84A4A', kdriver('#F0894B')],
    'kart-turbo': ['#3E8AE0', kdriver('#F4E8D4')],
    'kart-nitro': ['#8A3AE0', kdriver('#7FD9C4')],
    'kart-crash': ['#F0B429', kdriver('#B8B2C6')]
  };
  var BIZZY_KART_DRIVER = '<circle cx="19" cy="13" r="6.4" fill="' + HONEY + '"/><path d="M13.5 12 H24.5 M13.8 15 H24.2" stroke="' + INK + '" stroke-width="1.8" stroke-linecap="round"/>' +
    '<circle cx="17.5" cy="11" r="1.3" fill="' + DK + '"/><circle cx="21" cy="11" r="1.3" fill="' + DK + '"/>' +
    '<ellipse cx="14" cy="7" rx="2.4" ry="4" fill="rgba(124,92,255,.35)" transform="rotate(-24 14 7)"/><ellipse cx="23" cy="7" rx="2.4" ry="4" fill="rgba(124,92,255,.35)" transform="rotate(24 23 7)"/>';

  /* ---- Villain variants ---- */
  var GLITCH_CORRUPT_BASE = '<rect x="10" y="12" width="20" height="18" rx="4" fill="#2E2A5C"/>' +
    '<rect x="13" y="16" width="5" height="5" fill="#7FE8D8"/><circle cx="24.5" cy="18.5" r="3" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="1.2"/><path d="M23 18.5 h3 M24.5 17 v3" stroke="' + G2 + '" stroke-width=".9"/>' +
    '<path d="M14 26 h6 M22 26 h4" stroke="#7FE8D8" stroke-width="1.8" stroke-linecap="round"/>' +
    '<g fill="' + G1 + '"><rect x="28" y="12" width="4" height="4"/><rect x="30" y="20" width="4" height="4"/><rect x="26" y="28" width="4" height="4"/><rect x="30" y="8" width="3" height="3"/></g>' +
    '<g fill="#FF5D9E" opacity=".8"><rect x="8" y="14" width="2" height="6"/><rect x="7" y="24" width="2" height="4"/></g>' +
    '<path d="M12 8 h10 M26 8 h4" stroke="#2E2A5C" stroke-width="3" stroke-linecap="round"/>';
  var GLITCH_GLEE = GLITCH_CORRUPT_BASE + '<path d="M13 15 l5 3 M18 15 l-5 3" stroke="#0A2330" stroke-width="0"/><path d="M14 24.5 q6 5 12 0" stroke="#7FE8D8" stroke-width="2" fill="none" stroke-linecap="round"/>';
  var GLITCH_DOUBT = GLITCH_CORRUPT_BASE + '<path d="M14 27 q6 -3 12 1" stroke="#7FE8D8" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M33 6 q3 1 2.6 4 q-.3 2 -2.6 2.4" stroke="#7FE8D8" stroke-width="1.6" fill="none"/><circle cx="33" cy="15" r="1" fill="#7FE8D8"/>';
  var VOID_MAW = '<circle cx="20" cy="20" r="15" fill="#0D1030"/>' +
    '<circle cx="20" cy="20" r="15" fill="none" stroke="#7C5CFF" stroke-width="2" opacity=".8"/>' +
    '<ellipse cx="20" cy="23" rx="9" ry="7" fill="#000"/><path d="M11 23 a9 7 0 0 1 18 0" fill="none" stroke="#36D1FF" stroke-width="1.8"/>' +
    '<circle cx="14.5" cy="14" r="2.2" fill="#36D1FF"/><circle cx="25.5" cy="14" r="2.2" fill="#36D1FF"/><path d="M12 11 l4 2 M28 11 l-4 2" stroke="#7C5CFF" stroke-width="1.4" stroke-linecap="round"/>' +
    '<g font-family="Sono,monospace" font-weight="600" fill="#FFC83D"><text x="4" y="10" font-size="6" transform="rotate(-30 4 10)">W</text><text x="31" y="8" font-size="5.5" transform="rotate(28 31 8)">O</text><text x="34" y="27" font-size="5" transform="rotate(70 34 27)">R</text><text x="6" y="31" font-size="5" transform="rotate(-60 6 31)">D</text></g>' +
    '<path d="M6 8 C12 12 16 16 18 20 M33 7 C28 12 25 16 23 20 M35 26 C29 25 25 24 23 23" stroke="#FFC83D" stroke-width=".9" stroke-dasharray="1 3" fill="none" opacity=".8"/>';

  /* ---- General Gnash: locust drill sergeant ---- */
  function gnash(march) {
    var legs = march
      ? '<path d="M15 33 l-4 4 M25 33 l5 2" stroke="#4A5C28" stroke-width="2.4" stroke-linecap="round"/>'
      : '<path d="M15 33 l-2 4.5 M25 33 l2 4.5" stroke="#4A5C28" stroke-width="2.4" stroke-linecap="round"/>';
    return '<path d="M12 6 l-4 -4 M28 6 l4 -4" stroke="#4A5C28" stroke-width="1.8" stroke-linecap="round"/>' +
      '<circle cx="20" cy="14" r="8.5" fill="#7A9A3E"/>' +
      '<path d="M12 11 a8.5 8.5 0 0 1 16 0 l-1.4 2 H13.4Z" fill="#4A5C28"/><path d="M17 5.5 h6 l-1 2.6 h-4Z" fill="#B8934A"/><path d="M24 8 h6 l-1.5 2 h-4Z" fill="#4A5C28"/>' +
      '<ellipse cx="16.5" cy="14.5" rx="2.2" ry="1.4" fill="#FFE05C" transform="rotate(-14 16.5 14.5)"/><circle cx="16.5" cy="14.5" r=".8" fill="' + DK + '"/>' +
      '<ellipse cx="23.5" cy="14.5" rx="2.2" ry="1.4" fill="#FFE05C" transform="rotate(14 23.5 14.5)"/><circle cx="23.5" cy="14.5" r=".8" fill="' + DK + '"/>' +
      '<path d="M14 19.5 h12 l-1.6 3 h-8.8Z" fill="#3A481E"/><path d="M15.5 19.5 l1.4 3 M18.5 19.5 l1 3 M21.5 19.5 l-.4 3 M24.4 19.5 l-1.6 3" stroke="#E8E4DC" stroke-width="1.1"/>' +
      '<text x="20" y="21.8" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="3.2" fill="#C7C1B6">ETC</text>' +
      '<path d="M13 24 q7 4 14 0 l-1 8 q-6 3 -12 0Z" fill="#5C7230"/><path d="M14 26 h12 M14.5 29 h11" stroke="#3A481E" stroke-width="1.2"/>' +
      '<circle cx="20" cy="27.5" r="1.4" fill="#B8934A"/>' + legs +
      '<path d="M27 24 q5 0 6 -5" stroke="#4A5C28" stroke-width="2" stroke-linecap="round" fill="none"/><path d="M33 19 l3 -4 1.6 2Z" fill="#B8934A"/>';
  }

  /* ---- The Static: screen ghost ---- */
  function staticGhost(f, scream) {
    var noise = '';
    var nr = rng(f ? 137 : 131);
    for (var i = 0; i < 26; i++) noise += '<rect x="' + (11 + nr() * 17).toFixed(1) + '" y="' + (10 + nr() * 14).toFixed(1) + '" width="' + (1 + nr() * 2).toFixed(1) + '" height="1.2" fill="' + (nr() > .5 ? '#E8E4DC' : '#8A8FA8') + '" opacity="' + (.4 + nr() * .6).toFixed(2) + '"/>';
    var face = scream
      ? '<ellipse cx="20" cy="19" rx="3.4" ry="4.6" fill="#0A0A14"/><path d="M13 13 l4 2 M27 13 l-4 2" stroke="#0A0A14" stroke-width="1.8" stroke-linecap="round"/>'
      : '<circle cx="16" cy="16" r="1.6" fill="#0A0A14"/><circle cx="24" cy="16" r="1.6" fill="#0A0A14"/><path d="M16 21.5 h8" stroke="#0A0A14" stroke-width="1.6" stroke-linecap="round"/>';
    return '<path d="M9 8 q11 -5 22 0 v18 q-3 3 -5.5 0 t-5.5 0 -5.5 0 -5.5 0Z" fill="#C9CEDF" opacity=".92"/>' + noise + face +
      '<g fill="#8A8FA8"><path d="M12 7 l1.5 -4 3 3Z"/><path d="M19 6 l1 -4.5 2 4Z"/><path d="M26 7 l2.5 -3.5 1 3.5Z"/></g>' +
      '<text x="13" y="5" font-family="Sono,monospace" font-weight="600" font-size="4" fill="#8A8FA8" transform="rotate(-12 13 5)">A</text><text x="25" y="4.5" font-family="Sono,monospace" font-weight="600" font-size="3.6" fill="#8A8FA8" transform="rotate(14 25 4.5)">E</text>' +
      (scream ? '<path d="M6 14 q-3 3 0 6 M4 12 q-5 5 0 10 M34 14 q3 3 0 6 M36 12 q5 5 0 10" stroke="#C9CEDF" stroke-width="1.4" fill="none" opacity=".8"/>' : '');
  }

  /* ---- Ten-Headed Word-Eater — Ravana-machine war-form ---- */
  function wordEater() {
    var s2 = '<ellipse cx="60" cy="106" rx="36" ry="3.2" fill="rgba(14,10,24,.4)"/>';
    // drifting engine smoke
    s2 += '<ellipse cx="26" cy="30" rx="10" ry="4.6" fill="#8B857B" opacity=".18"/><ellipse cx="96" cy="24" rx="12" ry="5" fill="#8B857B" opacity=".15"/>';
    // ten serpent necks + skulls (behind body shoulders)
    var accents = ['#FF5D5D', '#FFB25C', '#C9CEDF', '#9BE34D', '#36D1FF', '#FF5D9E', '#FFD86E', '#B294F5', '#7FD9C4', '#FF8A5C'];
    var crests = [
      '<rect x="-3" y="-3" width="6" height="4.4" rx=".6" fill="#F6EFDF" stroke="#0E0A18" stroke-width=".7"/><path d="M0 -3 V1.4" stroke="#0E0A18" stroke-width=".6"/>',
      '<text y="1" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="6.5" fill="#C9CEDF">?</text>',
      '<path d="M-2.4 1.4 L0 -3.6 L2.4 1.4Z" fill="#3A3244" stroke="#0E0A18" stroke-width=".7"/><path d="M0 1 L1.8 -2.6" stroke="#FFD86E" stroke-width=".8"/>',
      '<rect x="-3.4" y="-2.4" width="3" height="3" rx=".6" fill="#C9CEDF" stroke="#0E0A18" stroke-width=".6"/><rect x=".4" y="-2.4" width="3" height="3" rx=".6" fill="#C9CEDF" stroke="#0E0A18" stroke-width=".6"/>',
      '<circle r="2.6" fill="#F6EFDF" stroke="#0E0A18" stroke-width=".7"/><path d="M0 0 V-2 M0 0 L1.4 .8" stroke="#0E0A18" stroke-width=".7"/>',
      '<path d="M-2.6 1 q0 -4.4 2.6 -4.4 q2.6 0 2.6 4.4" fill="none" stroke="#FF5D9E" stroke-width="1"/><circle cy="-3.4" r="1" fill="#FF5D9E"/>',
      '<path d="M1.6 -3.6 v3.6 q0 1.4 -1.4 1.4 q-1.3 0 -1.3 -1.1 q0 -1 1.5 -1.2 l1.2 -.2" fill="none" stroke="#FFD86E" stroke-width=".9"/>',
      '<path d="M-2.6 1 q-1 -4.6 2.6 -4.6 q3.6 0 2.6 4.6 M-1.2 -1 h2.4" fill="none" stroke="#B294F5" stroke-width=".9"/>',
      '<path d="M-2.4 -3.4 v2.4 a2.4 2.4 0 0 0 4.8 0 v-2.4 h-1.8 v2.2 a.6 .6 0 0 1 -1.2 0 v-2.2Z" fill="#7FD9C4" stroke="#0E0A18" stroke-width=".6"/>',
      '<path d="M0 -4 l1 2.2 2.3 .2 -1.7 1.5 .5 2.3 -2.1 -1.2 -2.1 1.2 .5 -2.3 -1.7 -1.5 2.3 -.2Z" fill="#FF8A5C" stroke="#0E0A18" stroke-width=".6"/>'
    ];
    var angs = [-78, -61, -44, -27, -10, 10, 27, 44, 61, 78];
    var lens = [30, 39, 47, 53, 57, 57, 53, 47, 39, 30];
    function skull(acc, crest, sc) {
      return '<g transform="scale(' + sc + ')">' +
        '<circle cx="1" cy="-4" r="4.6" fill="' + acc + '" opacity=".22"/>' +
        '<path d="M-8 -3 C-7.5 -8.5 1 -11 7 -8.4 L14 -3.4 L8.5 -1.2 L-4.5 -.2 Q-7.5 -.8 -8 -3Z" fill="#332B47" stroke="#0E0A18" stroke-width="1.1"/>' +
        '<path d="M-5.5 .8 L10.5 3.6 L4.5 8.6 L-5 5.2Z" fill="#241E33" stroke="#0E0A18" stroke-width="1.1"/>' +
        '<path d="M7 1 L12 2.8 L7 4.6Z" fill="' + acc + '" opacity=".55"/>' +
        '<path d="M5.5 -1.4 l1.5 2.8 1.5 -2.6 1.5 2.4 1.4 -2.2Z" fill="#EDE7F6"/>' +
        '<path d="M2 4.2 l1.4 2.2 1.4 -2 1.3 1.8" fill="none" stroke="#EDE7F6" stroke-width="1"/>' +
        '<path d="M-4.5 -7 L3 -5.4 L-3 -3.2Z" fill="' + acc + '"/><circle cx="-1" cy="-4.9" r=".8" fill="#0E0A18"/>' +
        '<path d="M-7 -4.4 L-2 -6.6" stroke="#0E0A18" stroke-width="1.3" stroke-linecap="round"/>' +
        '<path d="M11 -4.4 l1.8 -.8" stroke="#0E0A18" stroke-width=".9"/>' +
        '<g transform="translate(-1,-11)">' + crest + '</g></g>';
    }
    for (var i = 0; i < 10; i++) {
      var rad = angs[i] * Math.PI / 180, L = lens[i];
      var shx = 60 + Math.sin(rad) * 10, shy = 66 - Math.abs(Math.sin(rad)) * 2;
      var tx = 60 + Math.sin(rad) * (L * .92 + 12), ty = 62 - Math.cos(rad) * L;
      var dx = tx - shx, dy = ty - shy, dl = Math.sqrt(dx * dx + dy * dy);
      var nx = -dy / dl, ny = dx / dl;
      var bow = (i % 2 ? 7 : -7) * (Math.abs(angs[i]) > 50 ? 1.4 : 1);
      var mx = (shx + tx) / 2 + nx * bow, my = (shy + ty) / 2 + ny * bow;
      var wb = 5, wt = 2.2;
      var p = function (x, y) { return x.toFixed(1) + ' ' + y.toFixed(1); };
      s2 += '<path d="M' + p(shx + nx * wb, shy + ny * wb) + ' Q' + p(mx + nx * wt, my + ny * wt) + ' ' + p(tx + nx * wt, ty + ny * wt) +
        ' L' + p(tx - nx * wt, ty - ny * wt) + ' Q' + p(mx - nx * wt, my - ny * wt) + ' ' + p(shx - nx * wb, shy - ny * wb) + 'Z" fill="#2E2840" stroke="#0E0A18" stroke-width="1"/>';
      // segment bands
      for (var b2 = 1; b2 <= 2; b2++) {
        var t = b2 / 3, qx = (1 - t) * (1 - t) * shx + 2 * (1 - t) * t * mx + t * t * tx, qy = (1 - t) * (1 - t) * shy + 2 * (1 - t) * t * my + t * t * ty;
        var wseg = wb + (wt - wb) * t;
        s2 += '<path d="M' + p(qx + nx * wseg, qy + ny * wseg) + ' L' + p(qx - nx * wseg, qy - ny * wseg) + '" stroke="#0E0A18" stroke-width=".9" opacity=".8"/>';
      }
      var rot = angs[i] > 0 ? angs[i] - 4 : angs[i] + 4;
      var flip = angs[i] < 0 ? ' scale(-1,1)' : '';
      s2 += '<g transform="translate(' + p(tx, ty).replace(' ', ',') + ') rotate(' + (angs[i] < 0 ? -rot * .35 : rot * .35) + ')' + flip + '">' + skull(accents[i], crests[i], (.8 + lens[i] / 90).toFixed(2)) + '</g>';
    }
    // letters spiraling into the center maws
    s2 += '<g font-family="Sono,monospace" font-weight="600" fill="' + G1 + '"><text x="50" y="16" font-size="5.4" transform="rotate(-24 50 16)">W</text><text x="70" y="12" font-size="4.8" transform="rotate(18 70 12)">R</text><text x="60" y="26" font-size="4.4" transform="rotate(-6 60 26)">D</text><text x="40" y="30" font-size="4" transform="rotate(-30 40 30)">S</text></g>';
    s2 += '<path d="M46 34 q10 -14 22 -18" stroke="' + G2 + '" stroke-width=".8" fill="none" stroke-dasharray="1 3" opacity=".8"/>';
    // cathedral-machine torso
    s2 += '<path d="M38 106 L41 72 Q42 63 52 61 H68 Q78 63 79 72 L82 106Z" fill="#241E33" stroke="#0E0A18" stroke-width="1.6"/>';
    s2 += '<path d="M41 74 h38 M40 84 h40 M39 95 h42" stroke="#0E0A18" stroke-width="2"/>';
    s2 += '<circle cx="45" cy="79" r=".9" fill="#4A4258"/><circle cx="75" cy="79" r=".9" fill="#4A4258"/><circle cx="44" cy="90" r=".9" fill="#4A4258"/><circle cx="76" cy="90" r=".9" fill="#4A4258"/>';
    // clawed buttress arms
    s2 += '<path d="M41 76 Q28 82 26 96 L32 98 Q34 88 44 84Z" fill="#2E2840" stroke="#0E0A18" stroke-width="1.3"/><path d="M26 96 l-4 6 5 -1 1 5 3 -7Z" fill="#0E0A18"/>';
    s2 += '<path d="M79 76 Q92 82 94 96 L88 98 Q86 88 76 84Z" fill="#2E2840" stroke="#0E0A18" stroke-width="1.3"/><path d="M94 96 l4 6 -5 -1 -1 5 -3 -7Z" fill="#0E0A18"/>';
    // burning core + crack
    s2 += '<circle cx="60" cy="82" r="9.5" fill="#C43D5A" opacity=".28"/><path d="M60 75 l6 3.5 v7 l-6 3.5 -6 -3.5 v-7Z" fill="#C43D5A" stroke="#0E0A18" stroke-width="1.6"/><path d="M57 79 l3 3 -2 3 4 3" stroke="#FFD86E" stroke-width="1.1" fill="none"/>';
    // grinding gear jaw at the base
    s2 += '<path d="M42 106 v-5 l4 2 4 -4 4 4 4 -4 4 4 4 -4 4 4 4 -2 v5Z" fill="#171123"/>';
    s2 += '<path d="M46 101 l2 3 M74 101 l-2 3" stroke="#C43D5A" stroke-width=".8" opacity=".8"/>';
    // vents glowing crimson
    s2 += '<path d="M46 68 l5 1.4 M74 68 l-5 1.4" stroke="#C43D5A" stroke-width="1.6" stroke-linecap="round"/>';
    // hidden core-head hatch (foreshadow of the sad true head)
    s2 += '<circle cx="60" cy="95" r="3.4" fill="#171123" stroke="#3A3244" stroke-width="1"/><path d="M57 95 h6 M60 92 v6" stroke="#3A3244" stroke-width=".8"/><circle cx="58.9" cy="94.2" r=".7" fill="#8B857B"/><circle cx="61.1" cy="94.2" r=".7" fill="#8B857B"/>';
    // scattered devoured letters at the feet
    s2 += '<g font-family="Sono,monospace" font-weight="600" fill="' + G2 + '" opacity=".9"><text x="30" y="105" font-size="5" transform="rotate(-14 30 105)">Q</text><text x="86" y="104" font-size="4.6" transform="rotate(16 86 104)">Z</text><text x="36" y="99" font-size="3.8" transform="rotate(8 36 99)">e</text></g>';
    return s2;
  }

  /* ---- Mobs ---- */
  function locust(f) {
    var legs = f ? 'M15 27 l-4 4 M23 27 l4 3' : 'M15 27 l-2 5 M23 27 l2 5';
    return '<path d="M13 6 l-3 -3.4 M23 6 l3 -3.4" stroke="#4A5C28" stroke-width="1.5" stroke-linecap="round"/>' +
      '<circle cx="18" cy="11" r="5.5" fill="#7A9A3E"/><path d="M13.5 9 a5.5 5.5 0 0 1 9 0 l-.8 1.4 h-7.4Z" fill="#4A5C28"/>' +
      '<circle cx="16" cy="11.5" r="1.2" fill="' + DK + '"/><circle cx="20" cy="11.5" r="1.2" fill="' + DK + '"/>' +
      '<path d="M12 17 q6 3.4 12 0 l-1 9 q-5 2.6 -10 0Z" fill="#5C7230"/><path d="M13 19.5 h10 M13.4 22.5 h9" stroke="#3A481E" stroke-width="1"/>' +
      '<path d="' + legs + '" stroke="#4A5C28" stroke-width="2" stroke-linecap="round"/>' +
      '<ellipse cx="26" cy="16" rx="2.6" ry="5.4" fill="rgba(122,154,62,.4)" transform="rotate(24 26 16)"/>';
  }
  function staticSprite(f) {
    var o = f ? 1 : 0;
    return '<g fill="#C9CEDF"><rect x="12" y="' + (10 + o) + '" width="16" height="10"/><rect x="8" y="' + (14 + o) + '" width="4" height="6"/><rect x="28" y="' + (14 + o) + '" width="4" height="6"/><rect x="' + (f ? 10 : 12) + '" y="' + (20 + o) + '" width="4" height="4"/><rect x="' + (f ? 26 : 24) + '" y="' + (20 + o) + '" width="4" height="4"/></g>' +
      '<rect x="15" y="' + (13 + o) + '" width="3" height="3" fill="#0A0A14"/><rect x="22" y="' + (13 + o) + '" width="3" height="3" fill="#0A0A14"/>' +
      '<rect x="' + (f ? 13 : 16) + '" y="' + (6 + o) + '" width="2" height="2" fill="#8A8FA8"/><rect x="' + (f ? 25 : 22) + '" y="' + (5 + o) + '" width="2" height="2" fill="#8A8FA8"/>';
  }
  var VISION_CONE = '<path d="M6 20 L34 8 Q37 20 34 32Z" fill="#FFE05C" opacity=".28"/><path d="M6 20 L34 8 M6 20 L34 32" stroke="#FFE05C" stroke-width="1.4" opacity=".6" stroke-dasharray="2 3"/><circle cx="6" cy="20" r="2.6" fill="#FFE05C"/>';

  /* ---- Story gems II–VI ---- */
  var GEM2 = sticker('<path d="M20 4 l4.7 9.6 10.6 1.5 -7.7 7.4 1.8 10.5 -9.4 -5 -9.4 5 1.8 -10.5 -7.7 -7.4 10.6 -1.5Z" fill="#8A5CE8" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M20 10 l3 6 6.6 1 -4.8 4.6 1.1 6.6 -5.9 -3.1 -5.9 3.1 1.1 -6.6 -4.8 -4.6 6.6 -1Z" fill="#B294F5"/><circle cx="16" cy="13" r="1.8" fill="#fff" opacity=".9"/>', 'rgba(138,92,232,.25)');
  var GEM3 = sticker('<g transform="rotate(-8 20 20)"><rect x="8" y="8" width="22" height="22" rx="5" fill="#E8E4DC" stroke="' + INK + '" stroke-width="2"/><path d="M12 8 L26 30 M8 18 L30 14" stroke="' + INK + '" stroke-width="1.4" opacity=".5"/><circle cx="14" cy="14" r="2" fill="' + INK + '"/><circle cx="24" cy="24" r="2" fill="' + INK + '"/><path d="M28 6 l4 -4 M31 10 l5 -2" stroke="' + G2 + '" stroke-width="1.6" stroke-linecap="round"/></g>', 'rgba(139,133,123,.3)');
  var GEM4 = sticker('<path d="M20 4 C27 14 31 20 31 26 a11 11 0 0 1 -22 0 C9 20 13 14 20 4Z" fill="#3E8AE0" stroke="' + INK + '" stroke-width="2"/><path d="M14 24 q6 4 12 0" stroke="#9FD0F5" stroke-width="2.4" fill="none"/><path d="M15 26.5 q5 3.4 10 0" stroke="#9FD0F5" stroke-width="1.8" fill="none" opacity=".7"/><circle cx="16" cy="13" r="2" fill="#fff" opacity=".85"/>', 'rgba(62,138,224,.25)');
  var GEM5 = sticker('<path d="M7 26 q13 -12 26 0 l-3 6 q-10 -9 -20 0Z" fill="#8B8477" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M12 24 l2 3 M20 21.5 l0 3.4 M28 24 l-2 3" stroke="#5C574C" stroke-width="1.6"/><path d="M9 25 q11 -9 22 0" stroke="#C9C3B6" stroke-width="1.6" fill="none"/><path d="M17 10 h6 v6 h-6Z" fill="#FFC83D" stroke="' + INK + '" stroke-width="1.6" transform="rotate(12 20 13)"/>', 'rgba(139,132,119,.3)');
  var GEM6 = sticker('<path d="M20 3 C26 10 29 15 27 21 c3 -1 4 -3.4 4.4 -6 C34 20 33 26 29 30 a12 12 0 0 1 -18 0 C7 26 6 20 8.6 15 c.4 2.6 1.4 5 4.4 6 C11 15 14 10 20 3Z" fill="#F0894B" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M20 14 c3 4 4.4 7 3.4 10 a5.5 5.5 0 0 1 -6.8 0 C15.6 21 17 18 20 14Z" fill="#FFD86E"/>', 'rgba(240,137,75,.3)');

  /* ---- Tokens & tools ---- */
  var MASTER_TOKEN = sticker('<circle cx="20" cy="20" r="14" fill="#FFC83D" stroke="' + INK + '" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="#B27A18" stroke-width="1.6"/><path d="M20 13 c2.6 -3 7.4 -1 7.4 2.6 C27.4 19.6 20 24 20 24 s-7.4 -4.4 -7.4 -8.4 C12.6 12 17.4 10 20 13Z" fill="#C43D5A" stroke="' + INK + '" stroke-width="1.4"/><circle cx="14" cy="12" r="2" fill="#fff" opacity=".85"/>', 'rgba(240,180,41,.3)');
  var SATCHEL = sticker('<path d="M11 14 q9 -6 18 0 l3 16 q-12 6 -24 0Z" fill="#7FB8D8" stroke="' + INK + '" stroke-width="2"/><path d="M13 17 q7 -4 14 0 M12.4 22 q7.6 -4 15.2 0 M12 27 q8 -4 16 0" stroke="#4A7FA8" stroke-width="1.4" fill="none"/><path d="M15 13.4 L14 10 M25 13.4 L26 10" stroke="' + INK + '" stroke-width="1.6"/><path d="M13 10 q7 -4 14 0 l-1.4 3 q-5.6 -3 -11.2 0Z" fill="#8A6A42" stroke="' + INK + '" stroke-width="1.6"/><path d="M9 20 q-3 1 -4 3 M31 20 q3 1 4 3" stroke="#A8D4EE" stroke-width="1.6" fill="none" opacity=".8"/>', 'rgba(127,184,216,.3)');
  var SATCHEL_BURST = '<path d="M11 16 q9 -5 18 0 l2 12 q-11 5 -22 0Z" fill="#7FB8D8" stroke="' + INK + '" stroke-width="2" opacity=".9"/>' +
    '<path d="M13 12 q7 -4 14 0" stroke="#8A6A42" stroke-width="3" fill="none"/>' +
    '<g stroke="#C9E8F8" stroke-width="2.4" fill="none" stroke-linecap="round"><path d="M20 12 q0 -6 5 -8"/><path d="M14 13 q-3 -5 -9 -6"/><path d="M26 13 q4 -5 9 -5"/><path d="M9 20 q-5 0 -8 3"/><path d="M31 20 q5 0 8 3"/></g>' +
    '<g fill="#E8F4FC"><ellipse cx="26" cy="5" rx="3.4" ry="2" opacity=".9"/><ellipse cx="6" cy="8" rx="3" ry="1.8" opacity=".8"/><ellipse cx="36" cy="16" rx="2.6" ry="1.6" opacity=".8"/></g>';
  var RING_TOKEN = sticker('<circle cx="20" cy="22" r="10" fill="none" stroke="#FFC83D" stroke-width="4.6"/><circle cx="20" cy="22" r="10" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".4"/><path d="M14.8 11 h10.4 l-1.6 4.4 h-7.2Z" fill="#FFC83D" stroke="' + INK + '" stroke-width="1.4"/><path d="M17 13 l1.4 2.4 M20 12.6 v2.8 M23 13 l-1.4 2.4" stroke="#B27A18" stroke-width="1"/><path d="M20 8.6 l1 -2.6 1 2.6" stroke="#FFC83D" stroke-width="1.4" fill="none"/>', 'rgba(240,180,41,.28)');
  var RING_GLOW = '<circle cx="20" cy="20" r="17" fill="#FFC83D" opacity=".25"/><circle cx="20" cy="20" r="11.5" fill="#FFC83D" opacity=".25"/>' + RING_TOKEN;
  var LANTERN_LIT = sticker('<path d="M17 5 h6 M20 5 V8" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><path d="M14 8 h12 l2 4 h-16Z" fill="#8A5A3C" stroke="' + INK + '" stroke-width="1.6"/><path d="M13 12 h14 l-2 16 h-10Z" fill="#FFE9AE" stroke="' + INK + '" stroke-width="1.8"/><path d="M16 12 l1 16 M20 12 v16 M24 12 l-1 16" stroke="#E8C86A" stroke-width="1.2"/><path d="M20 18 c2.4 2 2.4 5 0 6.6 c-2.4 -1.6 -2.4 -4.6 0 -6.6Z" fill="#F0894B"/><path d="M15 28 h10 l1 3 h-12Z" fill="#8A5A3C" stroke="' + INK + '" stroke-width="1.6"/><circle cx="20" cy="21.5" r="8" fill="#FFE05C" opacity=".3"/>', 'rgba(255,224,92,.35)');
  var LANTERN_UNLIT = sticker('<path d="M17 5 h6 M20 5 V8" stroke="' + G2 + '" stroke-width="1.6" stroke-linecap="round"/><path d="M14 8 h12 l2 4 h-16Z" fill="' + G2 + '" stroke="' + G1 + '" stroke-width="1.6"/><path d="M13 12 h14 l-2 16 h-10Z" fill="' + G4 + '" stroke="' + G2 + '" stroke-width="1.8"/><path d="M16 12 l1 16 M20 12 v16 M24 12 l-1 16" stroke="' + G3 + '" stroke-width="1.2"/><path d="M15 28 h10 l1 3 h-12Z" fill="' + G2 + '" stroke="' + G1 + '" stroke-width="1.6"/>', 'rgba(139,133,123,.25)');
  function bow(state) {
    var string = state === 'unstrung' ? '<path d="M13 33 q3 2 6 1" stroke="#E8CE9A" stroke-width="1.6" fill="none"/>'
      : state === 'strung' ? '<path d="M12 7 L12 33" stroke="#FFE9AE" stroke-width="1.4"/>'
      : '<path d="M12 7 L4 20 L12 33" stroke="#FFE9AE" stroke-width="1.4" fill="none"/>';
    var arrow = state === 'drawn' ? '<path d="M4 20 H30" stroke="#B8934A" stroke-width="2" stroke-linecap="round"/><path d="M30 20 l6 0 -4 -2.6 M36 20 l-4 2.6" stroke="#B8934A" stroke-width="1.8" fill="none"/><path d="M30 17.4 l6 2.6 -6 2.6Z" fill="#FFC83D"/>' : '';
    var letters = state !== 'unstrung' ? '<g font-family="Sono,monospace" font-weight="600" font-size="4.2" fill="#FFC83D"><text x="9" y="13">S</text><text x="7.4" y="20">P</text><text x="9" y="28">L</text></g>' : '';
    return sticker('<path d="M12 7 C24 12 24 28 12 33" stroke="#8A5A3C" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M12 7 C22 12 22 28 12 33" stroke="#B8804E" stroke-width="1.2" fill="none"/><path d="M18.6 18.6 h2.6 v2.8 h-2.6Z" fill="#B8934A"/>' + string + arrow + letters, 'rgba(138,90,60,.3)');
  }

  /* ---- Astra seal medallions ×5 ---- */
  function seal(glyph, col) {
    return sticker('<circle cx="20" cy="20" r="13.5" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/><circle cx="20" cy="20" r="10" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.4"/>' +
      [0, 60, 120, 180, 240, 300].map(function (a) { return '<circle cx="20" cy="6.5" r="1.2" fill="' + INK + '" opacity=".5" transform="rotate(' + a + ' 20 20)"/>'; }).join('') + glyph + '<circle cx="14" cy="12" r="1.8" fill="#fff" opacity=".7"/>', 'rgba(42,33,64,.2)');
  }
  var SEAL_K = seal('<text x="20" y="25" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="13" fill="#fff" opacity=".45">K</text><path d="M12 26 L28 14" stroke="#fff" stroke-width="2" stroke-linecap="round"/>', '#8A5CE8');
  var SEAL_LL = seal('<text x="15.6" y="25" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="12" fill="#fff">L</text><text x="24.4" y="25" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="12" fill="#fff">L</text>', '#3E8AE0');
  var SEAL_ROOT = seal('<path d="M20 27 V17 M20 21 q-4 -1 -5 -5 M20 19 q4 -1 5 -5 M20 17 q0 -4 3 -6" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="15" cy="12" r="1.6" fill="#fff"/><circle cx="25" cy="14" r="1.4" fill="#fff"/><circle cx="23" cy="11" r="1.2" fill="#fff"/>', '#4FA85C');
  var SEAL_MASK = seal('<path d="M13 16 q7 -4 14 0 v5 q0 5 -7 6 q-7 -1 -7 -6Z" fill="#fff" opacity=".9"/><ellipse cx="17" cy="19.5" rx="1.8" ry="2.4" fill="' + INK + '"/><ellipse cx="23" cy="19.5" rx="1.8" ry="2.4" fill="' + INK + '"/><path d="M17.5 24 q2.5 1.6 5 0" stroke="' + INK + '" stroke-width="1.2" fill="none"/>', '#E88AB8');
  var SEAL_SCHWA = seal('<text x="20" y="25.5" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="15" fill="#fff" transform="rotate(180 20 20)">e</text>', '#F0894B');
  var SETU_STONE = sticker('<path d="M8 14 h24 q2 5 0 12 q-12 4 -24 0 q-2 -7 0 -12Z" fill="#8B8477" stroke="' + INK + '" stroke-width="2"/><path d="M10 16 q10 -3 20 0" stroke="#C9C3B6" stroke-width="1.4" fill="none"/><circle cx="20" cy="20.5" r="4.6" fill="#FFC83D" stroke="' + INK + '" stroke-width="1.2"/><path d="M17.6 20.5 h4.8 M20 18 v5" stroke="#B27A18" stroke-width="1.2"/>', 'rgba(139,132,119,.3)');

  /* ---- Gameplay stickers ---- */
  var HONEY_POT = sticker('<path d="M12 16 q-3 -14 8 -14 q11 0 8 14 q-1.6 8 -8 8 q-6.4 0 -8 -8Z" transform="translate(0,8)" fill="#E8A620" stroke="' + INK + '" stroke-width="1.8"/><path d="M13 14 h14 v-4 h-14Z" fill="#B87A14" stroke="' + INK + '" stroke-width="1.6"/><path d="M15 18 q5 4 10 0" stroke="#FFDE8C" stroke-width="2.2" fill="none"/><path d="M17 10 q1 -5 5 -6" stroke="#8A5A10" stroke-width="1.8" fill="none"/><circle cx="15" cy="20" r="1.6" fill="#FFDE8C" opacity=".8"/>', 'rgba(232,166,32,.3)');
  function flowerBloom(f) {
    var petalLen = [3, 7, 10][f], open = [12, 40, 62][f];
    var petals = '';
    for (var i = 0; i < 6; i++) petals += '<ellipse cx="0" cy="' + (-petalLen) + '" rx="' + (2 + f * 1.4) + '" ry="' + petalLen + '" fill="#FFC83D" stroke="' + INK + '" stroke-width="1" transform="rotate(' + (i * 60 + (f === 0 ? 8 : 0)) + ')"/>';
    return '<ellipse cx="20" cy="37" rx="8" ry="1.6" fill="rgba(42,33,64,.15)"/><path d="M20 36 V22" stroke="#4E7A4A" stroke-width="2.6" stroke-linecap="round"/><g transform="translate(20,' + (20 - f) + ') scale(' + (0.8 + f * .25) + ')">' + petals + '<circle r="' + (3 + f) + '" fill="#F0894B" stroke="' + INK + '" stroke-width="1.2"/>' + (f === 2 ? '<circle r="9" fill="#FFE05C" opacity=".25"/>' : '') + '</g>';
  }
  var ROYAL_JELLY = sticker('<path d="M20 8 q7 5 7 12 a7 7 0 0 1 -14 0 q0 -7 7 -12Z" fill="#F5E0FA" stroke="' + INK + '" stroke-width="1.8"/><path d="M16 19 a4.5 4.5 0 0 0 4 5" stroke="#fff" stroke-width="1.8" fill="none"/><path d="M14 6 l1.4 2.8 3 .5 -2.2 2 .5 3 -2.7 -1.4 -2.7 1.4 .5 -3 -2.2 -2 3 -.5Z" fill="#FFC83D" transform="translate(12,-2) scale(.7)"/>', 'rgba(200,140,220,.25)');
  var NECTAR_DOT = '<circle cx="20" cy="20" r="6.5" fill="#FFE05C"/><circle cx="20" cy="20" r="6.5" fill="none" stroke="#E8A620" stroke-width="1.6"/><circle cx="17.8" cy="17.8" r="1.8" fill="#FFF6D6"/>';
  var SHIELD_HEX = sticker('<path d="M20 5 L32 12 V26 L20 33 L8 26 V12Z" fill="#5CC1E8" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M20 9 L28.5 14 V24 L20 29 L11.5 24 V14Z" fill="#9FDCF5"/><path d="M20 9 V29 M11.5 14 L28.5 24 M28.5 14 L11.5 24" stroke="#5CC1E8" stroke-width="1"/><circle cx="14" cy="11" r="1.8" fill="#fff" opacity=".9"/>', 'rgba(92,193,232,.3)');
  function eggHatch(f) {
    if (f === 0) return sticker('<ellipse cx="20" cy="21" rx="9.5" ry="12" fill="#F4E8D0" stroke="' + INK + '" stroke-width="1.8"/><circle cx="16" cy="14" r="2" fill="#fff" opacity=".9"/><circle cx="23" cy="25" r="1.6" fill="#E0CFA8"/>', 'rgba(200,180,140,.3)');
    if (f === 1) return sticker('<ellipse cx="20" cy="21" rx="9.5" ry="12" fill="#F4E8D0" stroke="' + INK + '" stroke-width="1.8"/><path d="M13 18 l4 3 3 -4 4 4 3 -3" stroke="' + INK + '" stroke-width="1.4" fill="none"/><path d="M16 12 l2 2.4 M25 13 l-2 2" stroke="' + INK + '" stroke-width="1.1"/>', 'rgba(200,180,140,.3)');
    return sticker('<path d="M11 24 q0 8 9 8 q9 0 9 -8 l-2.4 2 -2.6 -3 -4 3.4 -4 -3.4 -2.6 3Z" fill="#F4E8D0" stroke="' + INK + '" stroke-width="1.8"/><g transform="translate(20,16)"><circle r="7" fill="#7FBF5C" stroke="' + INK + '" stroke-width="1.6"/><path d="M5 -5 q4 -2 5 -6 l-4 1Z" fill="#5C9A3E"/><circle cx="-2.4" cy="-1" r="1.3" fill="' + DK + '"/><circle cx="2.4" cy="-1" r="1.3" fill="' + DK + '"/><path d="M-2 3 q2 1.8 4 0" stroke="' + DK + '" stroke-width="1.2" fill="none"/></g>', 'rgba(127,191,92,.3)');
  }
  var LETTER_STAR = '<path d="M20 5 l4 8.4 9.2 1.2 -6.8 6.4 1.8 9.2 -8.2 -4.6 -8.2 4.6 1.8 -9.2 -6.8 -6.4 9.2 -1.2Z" fill="#FFC83D" stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round"/><text x="20" y="24" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="10" fill="' + INK + '">A</text>';
  var PAPER_PLANK = sticker('<g transform="rotate(-6 20 20)"><path d="M6 16 h28 v8 H6Z" fill="#F4EDE2" stroke="#B9A88C" stroke-width="1.6"/><path d="M6 16 L13 20 L6 24 M34 16 L27 20 L34 24" fill="#E3D8C4" stroke="#B9A88C" stroke-width="1.2"/><path d="M15 18 h10 M15 22 h8" stroke="#D9CFC0" stroke-width="1.2"/></g>', 'rgba(185,168,140,.3)');
  var BEAT_TILE = sticker('<rect x="9" y="9" width="22" height="22" rx="6" fill="#7C3AE0" stroke="' + INK + '" stroke-width="1.8"/><rect x="12" y="12" width="16" height="7" rx="3" fill="#9A66F0"/><text x="20" y="26.5" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="11" fill="#fff">B</text><path d="M31 8 q0 -5 4 -6 v8 q0 2.6 -2.6 2.6 T30 10Z" fill="#36E0C8"/>', 'rgba(124,58,224,.3)');
  var LOTUS_STICKER = sticker([0, 38, -38, 72, -72].map(function (a) { return '<g transform="translate(20,24) rotate(' + a + ')"><path d="M0 2 C6 -6 5 -16 0 -19 C-5 -16 -6 -6 0 2Z" fill="' + (Math.abs(a) > 50 ? '#FFA0CC' : '#FFB2D8') + '" stroke="#E86AA8" stroke-width="1"/></g>'; }).join('') + '<circle cx="20" cy="21" r="3.4" fill="#FFE05C" stroke="#E8A620" stroke-width="1"/>', 'rgba(255,160,204,.3)');
  var SIREN_NOTE = sticker('<path d="M17 10 q0 -4 9 -5 v16 q0 4.6 -4.6 4.6 T17 21 q0 -3.4 4.6 -4.2 l2.4 -.4 V9" fill="none" stroke="#8B7BB0" stroke-width="0"/><path d="M24 5 v16 q0 4.6 -4.6 4.6 q-4.4 0 -4.4 -3.8 q0 -3.2 4.4 -4 l2.6 -.5 V8Z" fill="#A997D4" stroke="' + INK + '" stroke-width="1.6"/><path d="M24 8 q4 0 5 -3" stroke="#A997D4" stroke-width="1.8" fill="none"/><path d="M10 28 q4 2 8 0 M12 32 q3 1.4 6 0" stroke="#8B7BB0" stroke-width="1.4" fill="none" opacity=".6"/>', 'rgba(169,151,212,.3)');
  var OIL_SLICK = '<ellipse cx="20" cy="26" rx="14" ry="6.5" fill="#2A2438"/><path d="M9 24 q5 -3 11 -1.4 q6 1.6 10 .4" stroke="#8A3AE0" stroke-width="1.8" fill="none" opacity=".8"/><path d="M11 27.5 q6 2 14 .6" stroke="#2AB8A8" stroke-width="1.6" fill="none" opacity=".8"/><ellipse cx="15" cy="24" rx="3.4" ry="1.3" fill="#4A5CE0" opacity=".7"/>';
  var ITEM_BOX = sticker('<g transform="rotate(-8 20 20)"><rect x="8" y="8" width="24" height="24" rx="6" fill="#FFC83D" stroke="' + INK + '" stroke-width="2"/><rect x="11" y="11" width="18" height="18" rx="4" fill="#FFD86E"/><text x="20" y="27" text-anchor="middle" font-family="Fraunces,serif" font-weight="800" font-size="16" fill="' + INK + '">?</text><circle cx="13" cy="12.6" r="1.8" fill="#fff" opacity=".9"/></g>', 'rgba(240,180,41,.3)');
  var PICKUP_HORN = sticker('<path d="M10 24 q-4 -1 -4 -5 t4 -5 l14 -6 q2 8 0 22Z" fill="#F0894B" stroke="' + INK + '" stroke-width="1.8"/><path d="M24 8 q7 4 7 11 t-7 11" fill="none" stroke="' + INK + '" stroke-width="1.8"/><path d="M24 8 q5.6 4 5.6 11 T24 30Z" fill="#FFB25C"/><path d="M12 17 l16 -5 M12 22 l16 5" stroke="#C4562A" stroke-width="1.2" opacity="0"/><path d="M4 14 q-2 -2 -2 -4 M4 26 q-2 2 -2 4" stroke="#F0894B" stroke-width="1.6" stroke-linecap="round" fill="none" opacity=".7"/>', 'rgba(240,137,75,.3)');
  var PICKUP_SHIELD = sticker('<path d="M20 5 q7 3 12 3 q0 14 -12 24 q-12 -10 -12 -24 q5 0 12 -3Z" fill="#4FB0A6" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><path d="M20 9 q5 2 8.6 2.4 Q28 21 20 28.6 Q12 21 11.4 11.4 Q15 11 20 9Z" fill="#7FD9C4"/><path d="M20 9 V28.6" stroke="#4FB0A6" stroke-width="1.2"/><circle cx="15" cy="11" r="1.8" fill="#fff" opacity=".9"/>', 'rgba(79,176,166,.3)');
  var PICKUP_MAGNET = sticker('<path d="M11 6 h7 v12 a2 2 0 0 0 4 0 V6 h7 v12 a9 9 0 0 1 -18 0Z" fill="#E84A6E" stroke="' + INK + '" stroke-width="1.8"/><path d="M11 6 h7 v5 h-7Z M22 6 h7 v5 h-7Z" fill="#C9CEDF" stroke="' + INK + '" stroke-width="1.6"/><path d="M13 32 q2 3 7 3 t7 -3 M15 35.4 q2 2 5 2 t5 -2" stroke="#E84A6E" stroke-width="1.4" fill="none" opacity=".65"/>', 'rgba(232,74,110,.3)');
  var GREY_BRICK = '<rect x="6" y="12" width="28" height="16" rx="3" fill="' + G3 + '" stroke="' + G2 + '" stroke-width="1.8"/><path d="M6 20 h28 M16 12 v8 M26 20 v8" stroke="' + G2 + '" stroke-width="1.4"/><text x="20" y="24.5" text-anchor="middle" font-family="Sono,monospace" font-weight="600" font-size="8" fill="' + G2 + '" opacity=".7">E</text>';
  var LIT_CONSTELLATION = '<path d="M8 28 L15 12 L24 20 L33 8" stroke="#36D1FF" stroke-width="1.6" fill="none"/><g fill="#FFC83D">' + [[8, 28], [15, 12], [24, 20], [33, 8]].map(function (pt) { return '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="3" /><circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="1.2" fill="#FFF6DC"/>'; }).join('') + '</g><circle cx="15" cy="12" r="5.5" fill="#FFC83D" opacity=".25"/>';
  var CAMPFIRE = sticker('<path d="M10 30 l20 -5 M30 30 l-20 -5" stroke="#8A5A3C" stroke-width="3" stroke-linecap="round"/><path d="M20 8 C25 13 27 17 25.6 21 c2.4 -.8 3.4 -2.6 3.8 -4.8 C31.5 20 30.5 25 27 28 a10 10 0 0 1 -14 0 C9.5 25 8.5 20 10.6 16.2 c.4 2.2 1.4 4 3.8 4.8 C13 17 15 13 20 8Z" fill="#F0894B" stroke="' + INK + '" stroke-width="1.8"/><path d="M20 16 c2.6 3.4 3.6 6 2.8 8.4 a4.6 4.6 0 0 1 -5.6 0 C16.4 22 17.4 19.4 20 16Z" fill="#FFD86E"/>', 'rgba(240,137,75,.35)');
  var FIRE_RING = '<ellipse cx="20" cy="24" rx="15" ry="7" fill="none" stroke="#F0894B" stroke-width="2.6"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) { var r2 = a * Math.PI / 180, fx = 20 + Math.cos(r2) * 15, fy = 24 + Math.sin(r2) * 7; return '<path d="M' + fx.toFixed(1) + ' ' + fy.toFixed(1) + ' c1.6 -1.6 1.3 -3.8 0 -5.4 c-1.3 1.6 -1.6 3.8 0 5.4Z" fill="#FFD86E" stroke="#F0894B" stroke-width=".9"/>'; }).join('') + '<ellipse cx="20" cy="24" rx="9" ry="4" fill="#FFE9AE" opacity=".3"/>';
  var LAMP_STRING = '<path d="M2 12 Q20 22 38 10" stroke="#3A2A8C" stroke-width="1.8" fill="none"/>' + [[8, 14.8, '#FFC83D'], [16, 17, '#FF9ED0'], [24, 17, '#7FD9C4'], [32, 13.6, '#C9A8F0']].map(function (L2) { return '<path d="M' + L2[0] + ' ' + L2[1] + ' v2.4" stroke="#3A2A8C" stroke-width="1.2"/><path d="M' + (L2[0] - 3.4) + ' ' + (L2[1] + 2.4) + ' h6.8 l-1.4 8 h-4Z" fill="' + L2[2] + '"/><circle cx="' + L2[0] + '" cy="' + (L2[1] + 7) + '" r="1.2" fill="#FFF6DC"/>'; }).join('');

  Object.assign(A, {
    'sting-salute': { vb: '0 0 40 40', frames: [STING_SALUTE] },
    'sting-defect': { vb: '0 0 40 40', frames: [STING_DEFECT] },
    'scopey-vision': { vb: '0 0 42 40', frames: [SCOPEY_VISION] },
    'hoppy-leap': { vb: '0 0 40 40', frames: [HOPPY_LEAP] },
    'kart-rally': { vb: '0 0 40 40', frames: [kart(KARTS['kart-rally'][0], KARTS['kart-rally'][1], 0), kart(KARTS['kart-rally'][0], KARTS['kart-rally'][1], 1)] },
    'kart-turbo': { vb: '0 0 40 40', frames: [kart(KARTS['kart-turbo'][0], KARTS['kart-turbo'][1], 0), kart(KARTS['kart-turbo'][0], KARTS['kart-turbo'][1], 1)] },
    'kart-nitro': { vb: '0 0 40 40', frames: [kart(KARTS['kart-nitro'][0], KARTS['kart-nitro'][1], 0), kart(KARTS['kart-nitro'][0], KARTS['kart-nitro'][1], 1)] },
    'kart-crash': { vb: '0 0 40 40', frames: [kart(KARTS['kart-crash'][0], KARTS['kart-crash'][1], 0), kart(KARTS['kart-crash'][0], KARTS['kart-crash'][1], 1)] },
    'kart-drift': { vb: '0 0 40 40', frames: [kart('#E84A4A', kdriver('#F0894B'), 1, true)] },
    'bizzy-kart': { vb: '0 0 40 40', frames: [kart(HONEY, BIZZY_KART_DRIVER, 0), kart(HONEY, BIZZY_KART_DRIVER, 1)] },
    'glitch-corrupt-glee': { vb: '0 0 40 40', frames: [GLITCH_GLEE] },
    'glitch-corrupt-doubt': { vb: '0 0 40 40', frames: [GLITCH_DOUBT] },
    'void-maw': { vb: '0 0 40 40', frames: [VOID_MAW] },
    'gnash-standing': { vb: '0 0 40 40', frames: [gnash(false)] },
    'gnash-march': { vb: '0 0 40 40', frames: [gnash(false), gnash(true)] },
    'static-idle': { vb: '0 0 40 40', frames: [staticGhost(0, false), staticGhost(1, false)] },
    'static-scream': { vb: '0 0 40 40', frames: [staticGhost(0, true)] },
    'word-eater': { vb: '0 0 120 110', frames: [wordEater()] },
    'locust-trooper': { vb: '0 0 40 40', frames: [locust(0), locust(1)] },
    'static-sprite': { vb: '0 0 40 40', frames: [staticSprite(0), staticSprite(1)] },
    'vision-cone': { vb: '0 0 40 40', frames: [VISION_CONE] },
    'gem-act2': { vb: '0 0 40 40', frames: [GEM2] },
    'gem-act3': { vb: '0 0 40 40', frames: [GEM3] },
    'gem-act4': { vb: '0 0 40 40', frames: [GEM4] },
    'gem-act5': { vb: '0 0 40 40', frames: [GEM5] },
    'gem-act6': { vb: '0 0 40 40', frames: [GEM6] },
    'master-token': { vb: '0 0 40 40', frames: [MASTER_TOKEN] },
    'tailwind-satchel': { vb: '0 0 40 40', frames: [SATCHEL] },
    'tailwind-satchel-burst': { vb: '0 0 40 40', frames: [SATCHEL_BURST] },
    'ring-token': { vb: '0 0 40 40', frames: [RING_TOKEN] },
    'ring-token-glow': { vb: '0 0 40 40', frames: [RING_GLOW] },
    'lantern-lit': { vb: '0 0 40 40', frames: [LANTERN_LIT] },
    'lantern-unlit': { vb: '0 0 40 40', frames: [LANTERN_UNLIT] },
    'bow-unstrung': { vb: '0 0 40 40', frames: [bow('unstrung')] },
    'bow-strung': { vb: '0 0 40 40', frames: [bow('strung')] },
    'bow-drawn': { vb: '0 0 40 40', frames: [bow('drawn')] },
    'seal-silent-k': { vb: '0 0 40 40', frames: [SEAL_K] },
    'seal-double-l': { vb: '0 0 40 40', frames: [SEAL_LL] },
    'seal-root': { vb: '0 0 40 40', frames: [SEAL_ROOT] },
    'seal-homophone': { vb: '0 0 40 40', frames: [SEAL_MASK] },
    'seal-schwa': { vb: '0 0 40 40', frames: [SEAL_SCHWA] },
    'setu-stone': { vb: '0 0 40 40', frames: [SETU_STONE] },
    'honey-pot': { vb: '0 0 40 40', frames: [HONEY_POT] },
    'flower-bloom': { vb: '0 0 40 40', frames: [flowerBloom(0), flowerBloom(1), flowerBloom(2)] },
    'royal-jelly': { vb: '0 0 40 40', frames: [ROYAL_JELLY] },
    'nectar-dot': { vb: '0 0 40 40', frames: [NECTAR_DOT] },
    'shield-hex': { vb: '0 0 40 40', frames: [SHIELD_HEX] },
    'egg-hatch': { vb: '0 0 40 40', frames: [eggHatch(0), eggHatch(1), eggHatch(2)] },
    'letter-star': { vb: '0 0 40 40', frames: [LETTER_STAR] },
    'paper-plank': { vb: '0 0 40 40', frames: [PAPER_PLANK] },
    'beat-tile': { vb: '0 0 40 40', frames: [BEAT_TILE] },
    'lotus-flower': { vb: '0 0 40 40', frames: [LOTUS_STICKER] },
    'siren-note': { vb: '0 0 40 40', frames: [SIREN_NOTE] },
    'oil-slick': { vb: '0 0 40 40', frames: [OIL_SLICK] },
    'item-box': { vb: '0 0 40 40', frames: [ITEM_BOX] },
    'pickup-horn': { vb: '0 0 40 40', frames: [PICKUP_HORN] },
    'pickup-shield': { vb: '0 0 40 40', frames: [PICKUP_SHIELD] },
    'pickup-magnet': { vb: '0 0 40 40', frames: [PICKUP_MAGNET] },
    'grey-brick': { vb: '0 0 40 40', frames: [GREY_BRICK] },
    'lit-constellation': { vb: '0 0 40 40', frames: [LIT_CONSTELLATION] },
    'campfire': { vb: '0 0 40 40', frames: [CAMPFIRE] },
    'fire-ring': { vb: '0 0 40 40', frames: [FIRE_RING] },
    'lamp-string': { vb: '0 0 40 40', frames: [LAMP_STRING] }
  });

  /* ================= V3 DELTAS — per CLAUDE-DESIGN-BRIEF-SAGA v3 ================= */
  var GOLD = '#F0B429', PINSTRIPE = '#F0B429';

  /* Vex flight — 4-frame wing cycle, sleek diagonal glide */
  function vexFly(wa) {
    return '<g transform="rotate(-12 20 20)">' +
      '<g transform="rotate(' + wa + ' 17 12)"><ellipse cx="15" cy="6" rx="4" ry="8" fill="rgba(163,155,142,.4)" stroke="rgba(36,30,51,.4)" stroke-width=".8"/></g>' +
      '<path d="M20 9 Q16 4 11 3.4" stroke="' + DK + '" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="11" cy="3.4" r="1.1" fill="' + DK + '"/>' +
      '<circle cx="22" cy="14" r="7.5" fill="' + CRIM + '"/>' +
      '<path d="M16 11.6 C18.6 9.9 25.4 9.9 28 11.6 L27.6 14.4 C24.6 12.9 19.4 12.9 16.4 14.4Z" fill="#241E33"/>' +
      '<ellipse cx="20" cy="13.4" rx="1.7" ry="1" fill="#fff" transform="rotate(-10 20 13.4)"/><circle cx="20.4" cy="13.4" r=".6" fill="#241E33"/>' +
      '<path d="M25 17.6 q2 1.4 4 .4" stroke="#241E33" stroke-width="1" fill="none"/>' +
      '<path d="M18 21 C15 26 15 32 19 36 L25 36 C29 32 29 26 26 21Z" fill="' + CRIM + '"/>' +
      '<path d="M16.8 25 H27.2 M16.4 29.5 H27.6" stroke="#241E33" stroke-width="1.8" stroke-linecap="round"/>' +
      '<path d="M16.6 27.2 H27.4" stroke="' + PINSTRIPE + '" stroke-width=".7"/>' +
      '<path d="M21.5 36 L22 40.5 L22.5 36Z" fill="#241E33"/>' +
      '<g transform="rotate(' + (wa + 24) + ' 24 13)"><ellipse cx="26" cy="7" rx="3.4" ry="7" fill="rgba(163,155,142,.5)" stroke="rgba(36,30,51,.45)" stroke-width=".8"/></g></g>';
  }
  /* Vex duel — casting: letters swirl from his hand, greying as they leave */
  var VEX_DUEL = '<path d="M14 5 Q10 1.6 5.5 1.4" stroke="#241E33" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="5.5" cy="1.4" r="1.1" fill="#241E33"/>' +
    '<path d="M22 5 Q26 1.6 30.5 1.4" stroke="#241E33" stroke-width="1.5" stroke-linecap="round" fill="none"/><circle cx="30.5" cy="1.4" r="1.1" fill="#241E33"/>' +
    '<circle cx="18" cy="11" r="7.5" fill="' + CRIM + '"/>' +
    '<path d="M12 8.6 C14.6 6.9 21.4 6.9 24 8.6 L23.6 11.6 C20.6 10 15.4 10 12.4 11.6Z" fill="#241E33"/>' +
    '<ellipse cx="15.4" cy="10.6" rx="1.7" ry="1" fill="#fff" transform="rotate(-10 15.4 10.6)"/><circle cx="15.8" cy="10.6" r=".6" fill="#241E33"/>' +
    '<ellipse cx="21" cy="10.6" rx="1.7" ry="1" fill="#fff" transform="rotate(10 21 10.6)"/><circle cx="20.6" cy="10.6" r=".6" fill="#241E33"/>' +
    '<path d="M15 14.6 Q18 16.4 21 14.6" stroke="#241E33" stroke-width="1" fill="none"/>' +
    '<path d="M14 18 C12 23 12 29 15.5 33 L21.5 33 C25 29 25 23 23 18Z" fill="#241E33"/>' +
    '<path d="M13.4 22 H23.8 M13 27 H24.2" stroke="' + PINSTRIPE + '" stroke-width=".7"/>' +
    '<path d="M15 21 C11 26 10 32 12 37" stroke="#241E33" stroke-width="1.8" stroke-linecap="round" fill="none"/>' +
    '<path d="M23 19 Q29 16 32 11" stroke="#241E33" stroke-width="1.9" stroke-linecap="round" fill="none"/>' +
    '<g font-family="Sono,monospace" font-weight="600"><text x="31" y="9" font-size="5.5" fill="' + GOLD + '">W</text><text x="34" y="3.5" font-size="5" fill="#C39A62" transform="rotate(18 34 3.5)">R</text><text x="27" y="2.5" font-size="4.5" fill="' + G1 + '" transform="rotate(-14 27 2.5)">D</text><text x="21.5" y="1.8" font-size="4" fill="' + G3 + '" transform="rotate(-30 21.5 1.8)">S</text></g>' +
    '<path d="M32 10 C33 6 30 3 26 2 C23.4 1.4 21 1.6 19.5 2.6" stroke="' + G2 + '" stroke-width=".8" stroke-dasharray="1 2.4" fill="none"/>';
  /* Vex softened — Ch 35: he remembers */
  var VEX_SOFT = '' +
    '<path d="M17 7 Q13 3.4 8.5 3" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="8.5" cy="3" r="1.3" fill="' + INK + '"/>' +
    '<path d="M23 7 Q27 3.4 31.5 3" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" fill="none"/><circle cx="31.5" cy="3" r="1.3" fill="' + INK + '"/>' +
    '<circle cx="20" cy="19" r="11" fill="' + CRIM + '"/>' +
    '<path d="M10.5 14.5 C14 12 26 12 29.5 14.5 L29 19 C25 16.8 15 16.8 11 19 Z" fill="#241E33"/>' +
    '<path d="M12 17.5 q3 2 6 .6 M22 18.1 q3 -1.4 6 -.6" stroke="#241E33" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M13.4 20 q1.6 1.4 3.6 1 M23 21 q2 .4 3.6 -1" stroke="#E8768E" stroke-width="1" fill="none" opacity=".8"/>' +
    '<path d="M15.5 25.5 Q20 28.5 24.5 25.5" stroke="#241E33" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
    '<circle cx="26.5" cy="24" r="1.1" fill="#7FB8E8"/>' +
    '<g font-family="Sono,monospace" font-weight="600" font-size="4.5" fill="' + GOLD + '"><text x="31" y="14">w</text><text x="33.5" y="9" opacity=".7">o</text></g>';
  /* Smudge scatter-burst */
  var SMUDGE_SCATTER = (function () {
    var out = '<circle cx="60" cy="38" r="7" fill="none" stroke="' + G3 + '" stroke-width="1.4" stroke-dasharray="2 4" opacity=".7"/>';
    var pts = [[18, 10, -40, 1], [100, 8, 35, .9], [112, 40, 70, .8], [96, 66, 130, .9], [58, 72, 180, .75], [20, 62, -130, .85], [8, 34, -75, .8], [44, 6, -15, .7], [78, 20, 20, .65], [30, 28, -55, .6], [88, 52, 100, .6], [42, 56, -160, .6]];
    pts.forEach(function (m2) {
      out += '<g opacity="' + m2[3] + '">' + miniMoth(m2[0], m2[1], m2[2], .9) + '</g>';
      out += '<path d="M60 38 L' + m2[0] + ' ' + m2[1] + '" stroke="' + G3 + '" stroke-width=".7" stroke-dasharray="1 4" opacity=".4"/>';
    });
    return out;
  })();
  /* Melody captive — defiant in a static cage */
  var MELODY_CAPTIVE = '' +
    '<path d="M8 6 h24 M8 34 h24" stroke="#8A8FA8" stroke-width="2.4" stroke-linecap="round"/>' +
    '<g stroke="#C9CEDF" stroke-width="1.8">' + [10, 15.5, 24.5, 30].map(function (x) { return '<path d="M' + x + ' 6 V34"/>'; }).join('') + '</g>' +
    '<g fill="#8A8FA8"><rect x="9" y="12" width="2" height="3"/><rect x="29" y="20" width="2" height="4"/><rect x="14.5" y="26" width="2" height="2.6"/></g>' +
    '<g transform="translate(20,21)"><circle r="8.5" fill="#F7A8C8"/><path d="M-8.5 2 a8.5 8.5 0 0 0 17 0 l-2 10 h-13Z" fill="#E88AB8"/>' +
    '<path d="M-4.6 -3.4 L-1 -2 M4.6 -3.4 L1 -2" stroke="#3A1E5C" stroke-width="1.1" stroke-linecap="round"/>' +
    '<circle cx="-2.6" cy="-1" r="2.3" fill="#fff"/><circle cx="3" cy="-1" r="2.3" fill="#fff"/><circle cx="-2.2" cy="-.7" r="1.1" fill="#2B1B5E"/><circle cx="3.4" cy="-.7" r="1.1" fill="#2B1B5E"/>' +
    '<path d="M-2 4.4 H2.6" stroke="#3A1E5C" stroke-width="1.3" stroke-linecap="round"/>' +
    '<path d="M6.5 -8.5 q4 -4 2.2 -8.5" stroke="' + GOLD + '" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="8.7" cy="-17" r="2" fill="' + GOLD + '"/></g>' +
    '<path d="M31 14 q4 -2 5 -6 q0 5 3 7" stroke="#F7A8C8" stroke-width="1.2" fill="none" opacity=".9"/>';
  /* Echo perch-speak */
  var ECHO_SPEAK = '<path d="M8 34 H26" stroke="#8A5A3C" stroke-width="2.6" stroke-linecap="round"/><path d="M17 34 V30" stroke="#8A5A3C" stroke-width="2"/>' +
    '<g transform="translate(17,19)"><path d="M-7 10 C-10 2 -8 -7 0 -9 C8 -7 10 2 7 10 Q0 13 -7 10Z" fill="#4FB0A6"/>' +
    '<path d="M-6 8 C-9 12 -10 16 -8 19 Q-4 15 -2 11" fill="#3E8AE0"/>' +
    '<circle cx="0" cy="-4" r="6.4" fill="#E84A4A"/><path d="M-5.4 -6.4 a6.4 6.4 0 0 1 10.8 0 l-1 1.6 h-8.8Z" fill="#C43333"/>' +
    '<circle cx="-2.2" cy="-4.6" r="2" fill="#fff"/><circle cx="-1.8" cy="-4.3" r="1" fill="#241E33"/>' +
    '<path d="M3 -4 q4.5 -1.4 5.5 1 q-1 2.4 -5 1.6 q3 .6 3.4 2 q-1.6 1.6 -4 .4Z" fill="' + GOLD + '" stroke="#B27A18" stroke-width=".8"/>' +
    '<path d="M2 4 l1.4 4.6 M-1 4.6 l0 4" stroke="#E8A620" stroke-width="1.6" stroke-linecap="round"/></g>' +
    '<g stroke="#4FB0A6" stroke-width="1.3" fill="none" opacity=".85"><path d="M28 12 q3 3 0 6"/><path d="M31 10 q4.5 4.5 0 10"/></g>' +
    '<text x="27" y="7" font-family="Sono,monospace" font-weight="600" font-size="5" fill="#3F938B">&#8220;&#8230;&#8221;</text>';
  /* Panda Sensei counsel — seated, lantern-lit */
  var SENSEI_COUNSEL = '<ellipse cx="18" cy="36.6" rx="12" ry="1.9" fill="rgba(42,33,64,.18)"/>' +
    '<circle cx="30" cy="24" r="7.5" fill="#FFE05C" opacity=".25"/>' +
    '<path d="M28.5 18 h3 M30 18 V20" stroke="' + INK + '" stroke-width="1.1"/><path d="M27.5 20 h5 l1.4 3 h-7.8Z" fill="#8A5A3C" stroke="' + INK + '" stroke-width="1"/><path d="M27 23 h6 l-1 8 h-4Z" fill="#FFE9AE" stroke="' + INK + '" stroke-width="1.2"/><path d="M30 25.5 c1.4 1.2 1.4 3 0 4 c-1.4 -1 -1.4 -2.8 0 -4Z" fill="#F0894B"/><path d="M27.5 31 h5 l.6 2 h-6.2Z" fill="#8A5A3C" stroke="' + INK + '" stroke-width="1"/>' +
    '<g transform="translate(16,20)"><circle cx="-6.5" cy="-9.5" r="2.8" fill="' + INK + '"/><circle cx="6.5" cy="-9.5" r="2.8" fill="' + INK + '"/>' +
    '<circle cx="0" cy="-6" r="8.6" fill="#F4F4F8" stroke="' + INK + '" stroke-width="1"/>' +
    '<ellipse cx="-3.6" cy="-6.6" rx="2.3" ry="3" fill="' + INK + '"/><ellipse cx="3.6" cy="-6.6" rx="2.3" ry="3" fill="' + INK + '"/>' +
    '<path d="M-4 -6.6 q1 1.2 2 0 M2.6 -6.6 q1 1.2 2 0" stroke="#fff" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '<circle cx="0" cy="-2.6" r="1.1" fill="' + INK + '"/><path d="M-1.6 -.8 q1.6 1.2 3.2 0" stroke="' + INK + '" stroke-width=".9" fill="none"/>' +
    '<path d="M-8 2 q-2 8 0 12 q8 3 16 0 q2 -4 0 -12 q-8 -3 -16 0Z" fill="#3E7A50"/>' +
    '<path d="M-8 3 q8 3 16 0 M0 2 V15" stroke="#2A5438" stroke-width="1.1" fill="none"/>' +
    '<path d="M-8 12 q-4 2 -5 5 q4 1 7 -1 M8 12 q4 2 5 5 q-4 1 -7 -1" fill="#3E7A50" stroke="#2A5438" stroke-width=".8"/></g>';
  /* Bizzy meditate — Tapasya pose, floating */
  var BIZZY_MEDITATE = (function () {
    var s2 = '<ellipse cx="120" cy="258" rx="62" ry="10" fill="rgba(42,33,64,.14)"/>';
    s2 += '<circle cx="120" cy="130" r="92" fill="#FFE9AE" opacity=".22"/>';
    s2 += '<g transform="translate(0,-10)">' + bizzyFront({
      eyes: 'closed',
      mouth: '<path d="M102,198 Q120,210 138,198" fill="none" stroke="' + SMILE + '" stroke-width="8" stroke-linecap="round"/>',
      extras: '<path d="M62 176 Q34 196 40 224 Q62 232 78 214" fill="none" stroke="' + DEEP + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M178 176 Q206 196 200 224 Q178 232 162 214" fill="none" stroke="' + DEEP + '" stroke-width="10" stroke-linecap="round"/>' +
        '<circle cx="40" cy="225" r="7" fill="' + DEEP + '"/><circle cx="200" cy="225" r="7" fill="' + DEEP + '"/>'
    }) + '</g>';
    s2 += star5(38, 66, 10, GOLD) + star5(204, 52, 8, GOLD);
    s2 += '<path d="M84 250 q36 10 72 0" stroke="#FFE9AE" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>';
    return s2;
  })();
  /* Bow singing — the name-glissando burst */
  var BOW_SINGING = '<circle cx="20" cy="20" r="18" fill="' + GOLD + '" opacity=".16"/><circle cx="20" cy="20" r="12" fill="' + GOLD + '" opacity=".16"/>' +
    bow('strung') +
    '<g stroke="' + GOLD + '" stroke-width="1.4" fill="none" opacity=".9"><path d="M14 16 q4 -3 8 0"/><path d="M13 12 q6 -5 12 0"/><path d="M12 8 q8 -7 16 0"/></g>' +
    '<g font-family="Sono,monospace" font-weight="600" fill="#B27A18"><text x="24" y="10" font-size="4.6" transform="rotate(14 24 10)">B</text><text x="28.5" y="13" font-size="4.6" transform="rotate(24 28.5 13)">I</text><text x="31.5" y="17" font-size="4.6" transform="rotate(38 31.5 17)">Z</text><text x="33.5" y="22" font-size="4.6" transform="rotate(52 33.5 22)">Z</text><text x="34" y="27.5" font-size="4.6" transform="rotate(66 34 27.5)">Y</text></g>';
  /* Word-Eater core head — small, grey, almost sad */
  var WORDEATER_CORE = '<ellipse cx="20" cy="35" rx="9" ry="1.6" fill="rgba(42,33,64,.15)"/>' +
    '<path d="M20 30 C14 30 12 24 14 18" stroke="#3A3244" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<g transform="translate(16,12)"><circle r="7.5" fill="' + G2 + '"/><circle r="7.5" fill="none" stroke="#171123" stroke-width="1.6"/>' +
    '<path d="M-5.4 -3 q-2 -2.4 -1.6 -5 M5.4 -3 q2 -2.4 1.6 -5" stroke="' + G2 + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M-4.4 -1.6 q1.4 -1.6 3 -.6 M1.4 -2.2 q1.6 -1 3 .6" stroke="#171123" stroke-width="1" fill="none"/>' +
    '<circle cx="-2.4" cy="0" r="1.2" fill="#171123"/><circle cx="2.8" cy="0" r="1.2" fill="#171123"/>' +
    '<path d="M-2.6 4.4 Q0 2.8 2.8 4.4" stroke="#171123" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '<circle cx="4.6" cy="2.6" r=".9" fill="#7FB8E8"/></g>' +
    '<text x="26" y="10" font-family="Sono,monospace" font-weight="600" font-size="4.4" fill="' + G1 + '" opacity=".85">?</text>';
  /* The Gatekeeper — one-eyed grey mantis, roar (LOOMS: 80×90) */
  var GATEKEEPER = (function () {
    var s2 = '<ellipse cx="40" cy="87" rx="28" ry="2.4" fill="rgba(42,33,64,.22)"/>';
    // raised forelimbs — scythe arcs
    s2 += '<path d="M18 52 C8 42 6 28 14 18 C16 24 20 28 26 30" fill="' + G2 + '" stroke="#3A3540" stroke-width="1.8"/><path d="M14 18 L8 8 L18 14Z" fill="#3A3540"/>';
    s2 += '<path d="M62 52 C72 42 74 28 66 18 C64 24 60 28 54 30" fill="' + G2 + '" stroke="#3A3540" stroke-width="1.8"/><path d="M66 18 L72 8 L62 14Z" fill="#3A3540"/>';
    // body
    s2 += '<path d="M30 84 C24 70 26 54 34 44 L46 44 C54 54 56 70 50 84 Q40 88 30 84Z" fill="' + G1 + '" stroke="#3A3540" stroke-width="2"/>';
    s2 += '<path d="M30 56 H50 M29 66 H51 M30 76 H50" stroke="#3A3540" stroke-width="2" opacity=".7"/>';
    // head — triangular, ONE huge eye
    s2 += '<path d="M26 40 L40 16 L54 40 Q40 48 26 40Z" fill="' + G2 + '" stroke="#3A3540" stroke-width="2"/>';
    s2 += '<path d="M30 14 q-3 -6 -8 -8 M50 14 q3 -6 8 -8" stroke="#3A3540" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="22" cy="6" r="1.4" fill="#3A3540"/><circle cx="58" cy="6" r="1.4" fill="#3A3540"/>';
    s2 += '<ellipse cx="40" cy="30" rx="9" ry="7.5" fill="#F6EFDF" stroke="#3A3540" stroke-width="1.8"/><circle cx="41.5" cy="31" r="3.4" fill="#1C2A14"/><circle cx="42.8" cy="29.8" r="1.1" fill="#fff"/><path d="M31 26 Q40 20 49 26" stroke="#3A3540" stroke-width="2.6" fill="none"/>';
    // roaring mandibles + eaten name-letters
    s2 += '<path d="M32 41 q2 6 8 7 q6 -1 8 -7 L44 44 H36Z" fill="#171123"/><path d="M33 41 l3 4 M47 41 l-3 4" stroke="' + G3 + '" stroke-width="1.6"/>';
    s2 += '<g font-family="Sono,monospace" font-weight="600" fill="' + G3 + '"><text x="36" y="52" font-size="5" transform="rotate(-8 36 52)">n</text><text x="42" y="53" font-size="4.4" transform="rotate(10 42 53)">m</text></g>';
    // roar shock lines
    s2 += '<g stroke="' + G3 + '" stroke-width="1.4" fill="none" opacity=".8"><path d="M24 46 q-4 2 -6 5"/><path d="M56 46 q4 2 6 5"/><path d="M40 52 q0 4 0 6"/></g>';
    return s2;
  })();
  /* Golden word-deer — leaping lure */
  var GOLDEN_DEER = '<ellipse cx="20" cy="36.6" rx="11" ry="1.7" fill="rgba(240,180,41,.25)"/>' +
    '<g transform="rotate(-14 20 20)">' +
    '<path d="M10 26 C10 18 16 14 22 14 C28 14 32 18 31 24 L27 24 C28 19 25 17 22 17 C18 17 14 19.5 14 26 L18 32 M28 24 L32 30" stroke="' + GOLD + '" stroke-width="0" fill="none"/>' +
    '<path d="M12 27 C11 19 17 14 23 14.5 C29 15 32 20 30.5 25 L34 31 M13 27 L10 33 M26 25.5 L30 32 M17 26.5 L15 33" stroke="#E8A620" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M12 27 C11 19 17 14 23 14.5 C29 15 31.5 19.5 30.5 25 Q21 28 12 27Z" fill="#FFD86E"/>' +
    '<path d="M23 14.5 Q26 10 25 6 M25.5 15.5 Q29 12 29.5 8" stroke="#B27A18" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<circle cx="27" cy="18" r="1.3" fill="' + INK + '"/><circle cx="27.4" cy="17.6" r=".45" fill="#fff"/>' +
    '<path d="M31.5 20 l3 .6 -2.6 1.4" fill="#FFD86E" stroke="#B27A18" stroke-width=".8"/>' +
    '<text x="16" y="24" font-family="Sono,monospace" font-weight="600" font-size="5" fill="#B27A18" opacity=".9">wrd</text></g>' +
    '<path d="M6 12 l.7 1.6 1.6 .7 -1.6 .7 -.7 1.6 -.7 -1.6 -1.6 -.7 1.6 -.7Z" fill="' + GOLD + '"/><path d="M33 6 l.6 1.4 1.4 .6 -1.4 .6 -.6 1.4 -.6 -1.4 -1.4 -.6 1.4 -.6Z" fill="' + GOLD + '" opacity=".8"/>';
  /* Ghost-lamp spellmaster — robed silhouette, hue variants */
  function ghostLamp(hue, glow) {
    return '<ellipse cx="20" cy="37" rx="10" ry="1.7" fill="rgba(42,33,64,.12)"/>' +
      '<path d="M20 6 C27 8 30 16 29 24 C31 30 29 35 26 36 Q24 33 22.5 35.5 T19 35.5 T15.5 35.5 Q13.5 33 12 35 C10 32 9.4 28 11 24 C10 16 13 8 20 6Z" fill="' + hue + '" opacity=".85"/>' +
      '<path d="M14 15 a7.5 7.5 0 0 1 12 0 q-1 5 -6 5 t-6 -5Z" fill="#0A222A" opacity=".55"/>' +
      '<circle cx="17" cy="15" r="1.3" fill="' + glow + '"/><circle cx="23" cy="15" r="1.3" fill="' + glow + '"/>' +
      '<path d="M13 26 q-4 1 -5 4" stroke="' + hue + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<circle cx="7" cy="31" r="3.6" fill="' + glow + '" opacity=".35"/><path d="M6 28.5 h2 M7 28.5 V27.5" stroke="' + hue + '" stroke-width=".9"/><path d="M5 29.5 h4 l.8 4 h-5.6Z" fill="none" stroke="' + hue + '" stroke-width="1.2"/><circle cx="7" cy="31.4" r="1" fill="' + glow + '"/>' +
      '<path d="M27 26 q3 2 3 5" stroke="' + hue + '" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".8"/>';
  }
  /* Props: earplug + forged letter */
  var EARPLUG = sticker('<g transform="rotate(-14 20 20)"><path d="M14 26 q-3 -8 3 -12 q7 -4 11 2 q3 5 -2 9 q-7 5 -12 1Z" fill="#FFE9AE" stroke="' + INK + '" stroke-width="1.6"/><path d="M17 17 q4 -2 7 1" stroke="#E8CE9A" stroke-width="1.6" fill="none"/><circle cx="16.6" cy="16" r="1.4" fill="#fff" opacity=".9"/></g><path d="M28 10 q3 -1.4 5 0 M29 6.5 q4 -2 7 0" stroke="#A997D4" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".7"/><path d="M33.5 8.6 L31 11" stroke="' + CRIM + '" stroke-width="1.6" stroke-linecap="round"/>', 'rgba(232,206,154,.35)');
  var FORGED_LETTER = sticker('<g transform="rotate(-5 20 20)"><path d="M8 12 h24 v18 h-24Z" fill="#F6EFDF" stroke="' + INK + '" stroke-width="1.6"/><path d="M8 12 L20 22 L32 12" fill="none" stroke="' + INK + '" stroke-width="1.4"/><path d="M11 26 h8 M11 23 h6" stroke="#B8AA8C" stroke-width="1"/><circle cx="26" cy="25" r="4.6" fill="' + CRIM + '" stroke="#8A2436" stroke-width="1.2"/><path d="M24 25 l1.6 1.6 3 -3" stroke="#F6D0D8" stroke-width="1.1" fill="none" transform="rotate(180 26 25)"/></g><path d="M30 8 q2.4 -2 5 -1.6" stroke="' + G2 + '" stroke-width="1.2" fill="none" stroke-dasharray="1 2.4"/>', 'rgba(196,61,90,.2)');

  Object.assign(A, {
    'vex-flight': { vb: '0 0 40 44', frames: [vexFly(-30), vexFly(-8), vexFly(16), vexFly(-8)] },
    'vex-duel': { vb: '0 0 40 40', frames: [VEX_DUEL] },
    'vex-portrait-softened': { vb: '0 0 40 40', frames: [VEX_SOFT] },
    'smudge-scatter': { vb: '0 0 120 80', frames: [SMUDGE_SCATTER] },
    'melody-captive': { vb: '0 0 40 40', frames: [MELODY_CAPTIVE] },
    'echo-perch-speak': { vb: '0 0 40 40', frames: [ECHO_SPEAK] },
    'sensei-counsel': { vb: '0 0 40 40', frames: [SENSEI_COUNSEL] },
    'bizzy-meditate': { vb: '0 0 240 270', frames: [BIZZY_MEDITATE] },
    'bow-singing': { vb: '0 0 40 40', frames: [BOW_SINGING] },
    'word-eater-core': { vb: '0 0 40 40', frames: [WORDEATER_CORE] },
    'gatekeeper-roar': { vb: '0 0 80 90', frames: [GATEKEEPER] },
    'golden-deer': { vb: '0 0 40 40', frames: [GOLDEN_DEER] },
    'ghost-lamp-1': { vb: '0 0 40 40', frames: [ghostLamp('#3E8A8C', '#BFF2E4')] },
    'ghost-lamp-2': { vb: '0 0 40 40', frames: [ghostLamp('#5C6E9E', '#D6E4FA')] },
    'ghost-lamp-3': { vb: '0 0 40 40', frames: [ghostLamp('#6E5C8C', '#E8DCFA')] },
    'earplug': { vb: '0 0 40 40', frames: [EARPLUG] },
    'forged-letter': { vb: '0 0 40 40', frames: [FORGED_LETTER] }
  });

  function dims(vb) { var p = vb.split(' '); return { w: +p[2], h: +p[3] }; }

  var handUid = 0;
  var SagaSprite = function (props) {
    var R = window.React;
    var a = (window.SAGA_ART || A)[props.name];
    var hooks = R.useState ? R.useState(0) : [0, function () {}];
    var frame = props.animate ? hooks[0] : (props.frame || 0);
    if (R.useEffect) R.useEffect(function () {
      if (!props.animate || !a || a.frames.length < 2) return;
      var t = setInterval(function () { hooks[1](function (f) { return f + 1; }); }, props.interval || 170);
      return function () { clearInterval(t); };
    }, [props.animate, props.name]);
    if (!a) return R.createElement('div', { style: { fontSize: '11px', color: '#C4453C' } }, 'missing: ' + props.name);
    var d = dims(a.vb), w = props.size || 64, h = Math.round(w * d.h / d.w);
    var fluid = props.fluid || d.w > 200;
    // hand-drawn ink pass: organic wobble via displacement, scaled to the drawing grid
    var idRef = R.useRef ? R.useRef(null) : { current: null };
    if (!idRef.current) idRef.current = 'sbh' + (++handUid);
    var html = a.frames[frame % a.frames.length];
    if (!props.crisp) {
      var bf = Math.min(.07, Math.max(.006, 2.8 / d.w)).toFixed(4);
      var sc = Math.min(7, Math.max(1.7, d.w * .032)).toFixed(2);
      var bl = (d.w * .0042).toFixed(2);
      html = '<defs><filter id="' + idRef.current + '" x="-8%" y="-8%" width="116%" height="116%"><feGaussianBlur in="SourceGraphic" stdDeviation="' + bl + '" result="s"/><feTurbulence type="fractalNoise" baseFrequency="' + bf + '" numOctaves="2" seed="11" result="n"/><feDisplacementMap in="s" in2="n" scale="' + sc + '" xChannelSelector="R" yChannelSelector="G"/></filter></defs><g filter="url(#' + idRef.current + ')" style="stroke-linejoin:round;stroke-linecap:round">' + html + '</g>';
    }
    return R.createElement('svg', {
      viewBox: a.vb, width: w, height: h,
      style: { display: 'block', flex: 'none', maxWidth: fluid ? '100%' : 'none', height: fluid ? 'auto' : h, filter: props.grey ? 'saturate(.12) brightness(1.05)' : 'none', overflow: 'visible' },
      dangerouslySetInnerHTML: { __html: html }
    });
  };

  window.SAGA_ART = Object.assign(window.SAGA_ART || {}, A);
  window.SagaSprite = SagaSprite;
})();

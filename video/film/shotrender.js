/* shotrender.js — turns one shot object into DOM.
 *
 * Loaded by shot.html. The renderer calls window.SHOT(obj) and then steps
 * document.getAnimations() frame by frame, so NOTHING here may depend on wall-clock time,
 * setTimeout or requestAnimationFrame — every moving thing must be a CSS animation or a
 * Web Animations API animation, or it will not appear in the render at all. SVG SMIL
 * (<animate>) is invisible to getAnimations() and must never be used here.
 *
 * The drawn pieces (medal, gladioli, coins, blade, the bee) are SVG built in code rather
 * than generated images: they need to move, they need to sit exactly on the film's palette,
 * and a flat vector holds up at 1080p in a way a soft raster does not.
 */
const IMG = '../images/';
const NS  = 'http://www.w3.org/2000/svg';
const $ = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const INK = '#100B26', HONEY = '#FFC23D', GOLD = '#FFD873', CREAM = '#F3EEFF', BAD = '#E0483C';

/* ---------- tiny SVG helpers ---------- */
function svg(w, h) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', `0 0 ${w} ${h}`);
  s.setAttribute('width', '100%'); s.setAttribute('height', '100%');
  s.style.cssText = 'position:absolute;inset:0;z-index:5;overflow:visible';
  return s;
}
function el(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
/* One animation per element. Two transforms on one node would fight, so anything that
 * needs both (grow AND sway) gets nested groups instead of a second animation. */
const anim = (e, frames, opts) => e.animate(frames, Object.assign({ fill: 'both', easing: 'ease' }, opts));

/* Deterministic pseudo-randomness. Math.random would make two renders of the same shot
 * differ, which breaks --resume: a re-rendered shot would no longer match its neighbours.
 * Seeded from the shot index, so every run places the same mote in the same place. */
function rng(seed) {
  let x = (seed * 2654435761) >>> 0;
  return () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}

function hexbed(stage, sh) {
  const h = $('<div class="hexbed"></div>');
  const g = $('<div class="glow"></div>');
  stage.appendChild(h); stage.appendChild(g);
  // The comb drifts and the glow breathes. Far too slow to notice as movement, but a
  // still frame of a drawn shot and a live one no longer look like the same thing.
  anim(h, [{ transform: 'translate(0,0)' }, { transform: 'translate(-52px,-90px)' }],
    { duration: 26000, iterations: Infinity, easing: 'linear' });
  anim(g, [{ transform: 'translate(-50%,-50%) scale(1)', opacity: .85 },
           { transform: 'translate(-50%,-50%) scale(1.09)', opacity: 1 }],
    { duration: 7400, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
}

/* Motes of dust in the light. Every plate gets them, which is what turns ninety slow zooms
 * into ninety shots that are alive — the Ken Burns move alone reads as a static image being
 * pushed, because nothing in the frame changes relative to anything else. */
function dust(stage, sh, n) {
  const r = rng((sh.idx || 0) + 7);
  const layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;inset:0;z-index:3;pointer-events:none;overflow:hidden';
  for (let i = 0; i < n; i++) {
    const size = 2 + r() * 5, x = r() * 100, y = r() * 100;
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;`
      + `width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;border-radius:50%;`
      + `background:#FFE9B8;opacity:${(0.10 + r() * 0.26).toFixed(2)};`
      + `filter:blur(${(r() * 1.4).toFixed(1)}px)`;
    layer.appendChild(d);
    const dx = (r() - 0.5) * 130, dy = -30 - r() * 120;
    anim(d, [{ transform: 'translate(0,0)' }, { transform: `translate(${dx.toFixed(0)}px,${dy.toFixed(0)}px)` }],
      { duration: 9000 + r() * 11000, iterations: Infinity, direction: 'alternate',
        easing: 'ease-in-out', delay: -r() * 9000 });
  }
  stage.appendChild(layer);
}

/* ---------- PLATE (Ken Burns) ---------- */
function plate(stage, sh) {
  const push = sh.push || 0;
  const fit = sh.fit === 'contain' ? ' class="contain"' : '';
  const org = { left: '18% 50%', right: '82% 50%', center: '50% 50%' }[sh.from || 'center'];
  const kb = $(`<div class="kb"><img src="${IMG}${esc(sh.src)}"${fit}></div>`);
  // Several generated plates come back with a faint painted paper edge despite the prompt
  // forbidding it. A 3.5% overscan crops it away, and costs nothing: the sources are
  // 2752px wide, so 1920 x 1.035 is still a downscale. Not applied to `contain` shots —
  // those are real archive photographs, letterboxed, where cropping would eat the picture.
  if (sh.fit !== 'contain') kb.querySelector('img').style.transform = 'scale(1.035)';
  stage.appendChild(kb);
  if (push > 0) {
    kb.style.transformOrigin = org;
    anim(kb, [{ transform: `scale(${1 + push})` }, { transform: 'scale(1)' }],
      { duration: sh.dur * 1000, easing: 'linear' });
  }

  /* Traffic. The street plates are drawn with carriages and motor cars standing at the kerb,
   * which reads as a photograph of a moment rather than a moment. Each vehicle here is a
   * separately drawn sprite, keyed to transparency, and it lives INSIDE .kb so the Ken Burns
   * move carries it along with the road it is on — parented to the stage instead, it would
   * slide across a street that was itself drifting, and read as a sticker. */
  (sh.traffic || []).forEach(t => {
    const lane = document.createElement('div');
    lane.style.cssText = `position:absolute;left:0;bottom:${t.bottom}%;height:${t.h}%;`
      + `width:${t.w}%;z-index:1;pointer-events:none`;
    const art = document.createElement('div');
    // Knocked back slightly: the sprites are generated against a flat field and come out a
    // shade hotter and cleaner than the plates they sit on, which makes them read as pasted
    // rather than drawn in. A touch less saturation and brightness settles them into the ink.
    art.style.cssText = `position:absolute;inset:0;background:url(${IMG}${t.sp}.png) `
      + `no-repeat center/contain;filter:saturate(.88) brightness(.96);`
      + `${t.flip ? 'transform:scaleX(-1)' : ''}`;
    lane.appendChild(art);
    kb.querySelector('img').after(lane);
    const px = v => (v / 100 * 1920).toFixed(0) + 'px';
    anim(lane, [{ transform: `translateX(${px(t.x0)})` }, { transform: `translateX(${px(t.x1)})` }],
      { duration: sh.dur * 1000, easing: 'linear' });
  });

  // A light that travels across the plate. Shots are concatenated as hard cuts, so there is
  // no dissolve available to carry one image into the next; a slow raking gradient gives the
  // frame its own internal change instead.
  const r = rng((sh.idx || 0) + 31);
  const lamp = document.createElement('div');
  lamp.style.cssText = 'position:absolute;inset:-20%;z-index:2;pointer-events:none;'
    + 'background:radial-gradient(38% 52% at 50% 50%,rgba(255,226,160,.13),transparent 70%)';
  stage.appendChild(lamp);
  const from = r() < 0.5 ? -26 : 26;
  anim(lamp, [{ transform: `translateX(${from}%)` }, { transform: `translateX(${-from}%)` }],
    { duration: Math.max(9000, sh.dur * 1600), easing: 'ease-in-out' });

  dust(stage, sh, 34);

  // Settle in over the first half-second. Not a fade from black — that would flicker at
  // every cut — just a slight lift, so the cut lands softly.
  // Deliberately NOT composite:'add' — the underlying opacity is 1, so an additive 0.84
  // would clamp straight back to 1 and the settle would never appear at all. The transform
  // animation above touches different properties, so plain replace on both is safe.
  anim(kb, [{ opacity: .84, filter: 'saturate(.86)' }, { opacity: 1, filter: 'saturate(1)' }],
    { duration: 520, easing: 'ease-out' });
}

/* ---------- SPELL — the letter drop ----------
 * Each letter is its own <span> so the assertion can read the assembled string out of the
 * DOM before a frame is written: a spelling channel misspelling a word on screen is the
 * one error this film cannot survive.
 *
 * When `letterAt` is present the stagger is MEASURED, not eased — each letter lands on the
 * moment the narrator says it, taken from words.json. Set in Sono, the app's spelling face.
 */
function spell(stage, sh) {
  hexbed(stage);
  const row = $('<div id="word"></div>');
  const chars = sh.word.split('');
  const size = Math.min(240, Math.floor(1400 / (chars.length * 0.72)));
  row.style.setProperty('--sz', size + 'px');
  chars.forEach((c, i) => {
    const s = document.createElement('span');
    s.textContent = (sh.wrong && i === sh.wrong.i) ? sh.wrong.ch : c;
    s.dataset.ch = s.textContent;
    if (sh.wrong && i === sh.wrong.i) s.className = 'wrong';
    if (sh.fix && i === sh.fix.i) s.className = 'fix';
    s.style.animationDelay = (sh.letterAt ? sh.letterAt[i] : 0.16 * i) + 's';
    row.appendChild(s);
  });
  stage.appendChild(row);
}

/* ---------- TYPE ---------- */
function card(stage, sh) {
  hexbed(stage);
  const c = $(`<div class="card">
    ${sh.kicker ? `<div class="kicker">${esc(sh.kicker)}</div>` : ''}
    <div class="line">${sh.line || ''}</div>
    ${sh.sub ? `<div class="sub">${esc(sh.sub)}</div>` : ''}</div>`);
  stage.appendChild(c);
  anim(c, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
    { duration: 700, easing: 'cubic-bezier(.2,.9,.25,1)' });
  if (sh.fade) {
    const f = document.createElement('div');
    f.style.cssText = 'position:absolute;inset:0;z-index:6;background:' + INK;
    stage.appendChild(f);
    anim(f, [{ opacity: 0 }, { opacity: 0 }, { opacity: .86 }],
      { duration: sh.dur * 1000, easing: 'linear' });
  }
}

function swap(stage, sh) {
  hexbed(stage);
  const row = $('<div id="swap"></div>');
  const a = sh.a.split(''), b = sh.b.split('');
  a.forEach(ch => { const s = document.createElement('span'); s.textContent = ch; row.appendChild(s); });
  let d = 0; while (d < b.length && a[d] === b[d]) d++;
  if (row.children[d]) row.children[d].className = 'drop';
  stage.appendChild(row);
}

function cards(stage, sh) {
  hexbed(stage);
  const w = $('<div class="cards"></div>');
  // Stagger has to fit inside the shot. A flat 0.35s gap put the last of four cards on
  // screen at 1.05s of a 1.28s shot, so it was gone before it had arrived.
  const gap = Math.min(0.35, sh.dur / (sh.words.length + 2.5));
  sh.words.forEach((word, i) => {
    const c = $(`<div class="wc${sh.compare ? ' big' : ''}">${esc(word)}</div>`);
    c.style.animationDelay = (gap * i).toFixed(2) + 's';
    w.appendChild(c);
  });
  stage.appendChild(w);
}

function count(stage, sh) {
  hexbed(stage);
  const box = $(`<div id="count"><div class="n">0</div><div class="l">${esc(sh.label || '')}</div></div>`);
  stage.appendChild(box);
  const n = box.querySelector('.n');
  n.dataset.to = sh.to; n.dataset.prefix = sh.prefix || '';
}

function title(stage) {
  hexbed(stage);
  stage.appendChild($('<div id="t25"><s>1925</s></div>'));
  stage.appendChild($('<div id="t08">1908</div>'));
  stage.appendChild($('<div id="ttl">BEFORE THE BEE</div>'));
}

/* ---------- MEDAL ----------
 * Drawn, not generated. The generated plate it replaces read as a flat brown disc; this one
 * is struck metal with a rim, a ribbon and a light that travels across the face — and it can
 * be ghosted for the two moments where the medal is spoken of as lost.
 */
function medal(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const defs = el('defs', {}, s);

  const g1 = el('radialGradient', { id: 'mg', cx: '38%', cy: '32%', r: '78%' }, defs);
  el('stop', { offset: '0%',   'stop-color': '#FFF0C2' }, g1);
  el('stop', { offset: '46%',  'stop-color': HONEY }, g1);
  el('stop', { offset: '100%', 'stop-color': '#9A6B12' }, g1);

  const rib = el('linearGradient', { id: 'rg', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#5B3FA8' }, rib);
  el('stop', { offset: '100%', 'stop-color': '#33257A' }, rib);

  const clip = el('clipPath', { id: 'mc' }, defs);
  el('circle', { cx: 960, cy: 610, r: 208 }, clip);

  const wrap = el('g', {}, s);          // scale-in lives here
  const CX = 960, CY = 610;
  // ribbon — long enough to leave the top of frame, so the medal reads as hanging
  el('path', { d: `M${CX - 104},120 L${CX + 104},120 L${CX + 66},${CY - 196} L${CX - 66},${CY - 196} Z`,
    fill: 'url(#rg)' }, wrap);
  el('path', { d: `M${CX - 104},120 L${CX - 44},120 L${CX - 18},${CY - 196} L${CX - 66},${CY - 196} Z`,
    fill: '#FFFFFF', opacity: '.12' }, wrap);
  el('rect', { x: CX - 92, y: CY - 232, width: 184, height: 34, rx: 8, fill: '#2A1E63' }, wrap);
  // body
  el('circle', { cx: CX, cy: CY, r: 226, fill: '#7A5410', opacity: '.55' }, wrap);
  el('circle', { cx: CX, cy: CY, r: 214, fill: 'url(#mg)' }, wrap);
  el('circle', { cx: CX, cy: CY, r: 214, fill: 'none', stroke: '#FFF3CE', 'stroke-width': 6, opacity: '.8' }, wrap);
  el('circle', { cx: CX, cy: CY, r: 176, fill: 'none', stroke: '#8A5E10', 'stroke-width': 4, opacity: '.5' }, wrap);
  // A laurel wreath as TWO symmetric branches, open at the top, one leaf per position.
  // Drawing a pair of leaves at every position along a single bottom arc packed them into a
  // row of even blobs that read as a set of teeth rather than as foliage.
  const R = 156;
  for (const side of [-1, 1]) {
    const stem = [];
    for (let i = 0; i <= 6; i++) {
      const deg = 90 + side * (18 + i * 12);       // 90° is the bottom of the disc
      const a = deg * Math.PI / 180;
      const x = CX + R * Math.cos(a), y = CY + R * Math.sin(a);
      stem.push([x, y]);
      el('ellipse', { cx: x, cy: y, rx: 13, ry: 31, fill: '#8A5E10', opacity: '.46',
        transform: `rotate(${deg + 90} ${x} ${y})` }, wrap);
    }
    el('path', { d: 'M' + stem.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join('L'),
      fill: 'none', stroke: '#8A5E10', 'stroke-width': 5, opacity: '.4' }, wrap);
  }
  // a plain struck star at the centre — an ornament, not a claim about the real object
  let star = '';
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? 26 : 62, a = (-90 + i * 36) * Math.PI / 180;
    star += (i ? 'L' : 'M') + (CX + rr * Math.cos(a)).toFixed(1) + ',' + (CY + rr * Math.sin(a)).toFixed(1);
  }
  el('path', { d: star + 'Z', fill: '#8A5E10', opacity: '.38' }, wrap);

  // travelling highlight, clipped to the disc
  const shine = el('g', { 'clip-path': 'url(#mc)' }, wrap);
  const band = el('rect', { x: -300, y: 320, width: 190, height: 600, fill: '#FFFFFF',
    opacity: '.42', transform: 'rotate(18 960 610)' }, shine);

  if (sh.ghost) {
    wrap.setAttribute('filter', 'grayscale(1)');
    wrap.style.filter = 'grayscale(1) brightness(.42)';
    wrap.style.opacity = '.42';
    band.style.display = 'none';
    anim(wrap, [{ opacity: .42 }, { opacity: .16 }], { duration: sh.dur * 1000, easing: 'linear' });
  } else {
    anim(wrap, [{ transform: 'scale(.72)', opacity: 0 }, { transform: 'scale(1.03)', opacity: 1, offset: .55 },
                { transform: 'scale(1)', opacity: 1 }], { duration: 1100, easing: 'cubic-bezier(.2,.9,.25,1)' });
    anim(band, [{ transform: 'rotate(18deg) translateX(0px)' }, { transform: 'rotate(18deg) translateX(0px)', offset: .25 },
                { transform: 'rotate(18deg) translateX(2400px)' }],
      { duration: Math.max(2600, sh.dur * 1000 * 0.7), easing: 'cubic-bezier(.4,0,.2,1)' });
  }
}

/* ---------- GLADIOLI ----------
 * The film's other signature, and the one the narration earns twice: Frank grew these, and
 * was still growing them in his nineties. Stalks rise from the foot of the frame, florets
 * open from the bottom up, and everything breathes. Grow and sway are separate nested
 * groups because one element cannot run two transform animations against each other.
 */
function gladiolus(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const defs = el('defs', {}, s);
  const gp = el('linearGradient', { id: 'pet', x1: '0', y1: '1', x2: '0', y2: '0' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#FF7E5F' }, gp);
  el('stop', { offset: '100%', 'stop-color': '#FFC23D' }, gp);

  const STALKS = [
    { x: 250,  h: 690, d: 0.00, s: 0.92 }, { x: 505,  h: 830, d: 0.28, s: 1.00 },
    { x: 760,  h: 720, d: 0.56, s: 0.95 }, { x: 1010, h: 880, d: 0.14, s: 1.04 },
    { x: 1265, h: 745, d: 0.42, s: 0.97 }, { x: 1520, h: 800, d: 0.70, s: 1.01 },
    { x: 1740, h: 660, d: 0.86, s: 0.90 },
  ];

  STALKS.forEach((st, k) => {
    const sway = el('g', { transform: `translate(${st.x} 1080)` }, s);
    const grow = el('g', {}, sway);
    const body = el('g', { transform: `scale(${st.s})` }, grow);

    // sword leaves — the reason the plant is called a little sword at all
    el('path', { d: `M-14,0 C-58,${-st.h * .42} -34,${-st.h * .72} -10,${-st.h * .86} C-26,${-st.h * .6} -34,${-st.h * .3} -2,0 Z`,
      fill: '#2E7D5B', opacity: '.85' }, body);
    el('path', { d: `M14,0 C60,${-st.h * .38} 36,${-st.h * .68} 12,${-st.h * .82} C28,${-st.h * .56} 36,${-st.h * .28} 2,0 Z`,
      fill: '#256B4C', opacity: '.85' }, body);
    // stem
    el('path', { d: `M0,0 C6,${-st.h * .35} -6,${-st.h * .66} 0,${-st.h * .92}`, stroke: '#3C8F66',
      'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, body);

    // florets, bottom to top, alternating sides
    const N = 7;
    for (let i = 0; i < N; i++) {
      const fy = -st.h * (0.34 + 0.09 * i);
      const side = i % 2 ? 1 : -1;
      const fx = side * (30 - i * 3);
      const sc = 1 - i * 0.085;
      const f = el('g', { transform: `translate(${fx} ${fy}) scale(${sc})` }, body);
      const inner = el('g', {}, f);
      for (let p = 0; p < 6; p++) {
        el('ellipse', { cx: 0, cy: -34, rx: 21, ry: 40, fill: 'url(#pet)', opacity: '.95',
          transform: `rotate(${p * 60})` }, inner);
      }
      el('circle', { cx: 0, cy: 0, r: 13, fill: '#FFF0C2' }, inner);
      anim(inner, [{ transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.12)', opacity: 1, offset: .7 },
                   { transform: 'scale(1)', opacity: 1 }],
        { duration: 620, delay: (st.d + 0.9 + i * 0.11) * 1000, easing: 'cubic-bezier(.2,.9,.25,1)' });
    }

    anim(grow, [{ transform: 'scaleY(0.04)' }, { transform: 'scaleY(1)' }],
      { duration: 1500, delay: st.d * 1000, easing: 'cubic-bezier(.22,.85,.3,1)' });

    // every stalk breathes on its own period, so the field never pulses as one object
    anim(sway, [{ transform: `translate(${st.x}px,1080px) rotate(-1.5deg)` },
                { transform: `translate(${st.x}px,1080px) rotate(1.5deg)` }],
      { duration: 3200 + k * 430, direction: 'alternate', iterations: Infinity,
        easing: 'ease-in-out', delay: -k * 700 });
  });
}

/* ---------- SWORD — gladiolus, "little sword" ---------- */
function sword(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const defs = el('defs', {}, s);
  const bg = el('linearGradient', { id: 'blade', x1: '0', y1: '0', x2: '1', y2: '0' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#6E7C93' }, bg);
  el('stop', { offset: '45%', 'stop-color': '#E8EEF8' }, bg);
  el('stop', { offset: '100%', 'stop-color': '#5A6577' }, bg);

  // Sat at y=560 at full size and drove its grip straight through the caption below.
  const g = el('g', { transform: 'translate(960 452) rotate(-24) scale(.84)' }, s);
  // the leaf, which fades out as the blade resolves
  const leaf = el('path', { d: 'M0,300 C-70,60 -46,-160 0,-330 C46,-160 70,60 0,300 Z', fill: '#2E7D5B' }, g);
  const blade = el('g', { opacity: '0' }, g);
  el('path', { d: 'M0,250 C-34,60 -24,-150 0,-330 C24,-150 34,60 0,250 Z', fill: 'url(#blade)' }, blade);
  el('path', { d: 'M0,246 L0,-322', stroke: '#FFFFFF', 'stroke-width': 3, opacity: '.5' }, blade);
  el('rect', { x: -96, y: 250, width: 192, height: 26, rx: 10, fill: HONEY }, blade);
  el('rect', { x: -20, y: 276, width: 40, height: 128, rx: 12, fill: '#7A5410' }, blade);
  el('circle', { cx: 0, cy: 418, r: 24, fill: HONEY }, blade);

  anim(leaf, [{ opacity: 1 }, { opacity: 1, offset: .3 }, { opacity: 0, offset: .62 }, { opacity: 0 }],
    { duration: sh.dur * 1000, easing: 'linear' });
  anim(blade, [{ opacity: 0 }, { opacity: 0, offset: .32 }, { opacity: 1, offset: .66 }, { opacity: 1 }],
    { duration: sh.dur * 1000, easing: 'linear' });

  const cap = $('<div class="card" style="align-content:end;padding-bottom:56px">'
    + '<div class="kicker">from the Latin</div>'
    + '<div class="sub" style="font-size:52px">gladiolus — <i>little sword</i></div></div>');
  stage.appendChild(cap);
  anim(cap, [{ opacity: 0 }, { opacity: 0, offset: .45 }, { opacity: 1, offset: .72 }, { opacity: 1 }],
    { duration: sh.dur * 1000, easing: 'linear' });
}

/* ---------- COLOURFILL — cerise is a colour, not a fruit ---------- */
function colourfill(stage, sh) {
  hexbed(stage);
  const disc = document.createElement('div');
  disc.style.cssText = `position:absolute;left:50%;top:50%;width:2400px;height:2400px;margin:-1200px 0 0 -1200px;`
    + `border-radius:50%;z-index:4;background:${sh.hex}`;
  stage.appendChild(disc);
  anim(disc, [{ transform: 'scale(0)' }, { transform: 'scale(1)' }],
    { duration: 1100, easing: 'cubic-bezier(.2,.9,.25,1)' });
  const lab = $(`<div class="card"><div class="line" style="font-size:150px">${esc(sh.label)}</div>
    <div class="sub">a colour, not a fruit</div></div>`);
  stage.appendChild(lab);
  anim(lab, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)' }],
    { duration: 700, delay: 620, easing: 'cubic-bezier(.2,.9,.25,1)' });
}

/* ---------- COINS — five hundred dollars, in gold ---------- */
function coins(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const defs = el('defs', {}, s);
  const cg = el('radialGradient', { id: 'cg', cx: '36%', cy: '30%', r: '80%' }, defs);
  el('stop', { offset: '0%', 'stop-color': '#FFF0C2' }, cg);
  el('stop', { offset: '55%', 'stop-color': HONEY }, cg);
  el('stop', { offset: '100%', 'stop-color': '#9A6B12' }, cg);

  // Discs seen at a shallow angle, each with a visible edge — a coin is a flat thing, and
  // the round radial shading of the first attempt read as a pile of eggs.
  const RX = 62, RY = 25, TH = 20;
  const P = [];
  for (let r = 0; r < 4; r++) {
    const n = 7 - r;
    for (let i = 0; i < n; i++)
      P.push({ x: 960 + (i - (n - 1) / 2) * 108 + ((i + r) % 2 ? 9 : -9),
               y: 830 - r * 34, rot: ((i * 37 + r * 61) % 15) - 7 });
  }
  P.forEach((p, k) => {
    const g = el('g', {}, s);
    const t = el('g', { transform: `rotate(${p.rot} ${p.x} ${p.y})` }, g);
    el('ellipse', { cx: p.x, cy: p.y + TH + 10, rx: RX, ry: RY * 0.5, fill: '#000', opacity: '.30' }, t);
    el('path', { d: `M${p.x - RX},${p.y} a${RX},${RY} 0 0 0 ${RX * 2},0 v${TH} a${RX},${RY} 0 0 1 ${-RX * 2},0 Z`,
      fill: '#8A5E10' }, t);
    el('ellipse', { cx: p.x, cy: p.y, rx: RX, ry: RY, fill: 'url(#cg)' }, t);
    el('ellipse', { cx: p.x, cy: p.y, rx: RX, ry: RY, fill: 'none', stroke: '#FFF3CE',
      'stroke-width': 3.5, opacity: '.85' }, t);
    el('ellipse', { cx: p.x, cy: p.y, rx: RX * 0.62, ry: RY * 0.62, fill: 'none',
      stroke: '#8A5E10', 'stroke-width': 2.5, opacity: '.55' }, t);
    const d = 0.05 * k + (k % 3) * 0.035;
    anim(g, [{ transform: 'translateY(-1300px)', opacity: 0 },
             { transform: 'translateY(-1300px)', opacity: 1, offset: .001 },
             { transform: 'translateY(20px)', offset: .74 },
             { transform: 'translateY(0px)' }],
      { duration: 880, delay: d * 1000, easing: 'cubic-bezier(.3,.1,.3,1)' });
  });
  const cap = $('<div class="card" style="align-content:start;padding-top:150px">'
    + '<div class="kicker">first prize, 1925</div><div class="line">$500 in gold</div></div>');
  stage.appendChild(cap);
  anim(cap, [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'none' }],
    { duration: 700, easing: 'cubic-bezier(.2,.9,.25,1)' });
}

/* ---------- ELIM — nine finalists, one by one ---------- */
function elim(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const N = sh.from || 9, keep = sh.to == null ? N : sh.to;
  const hex = (cx, cy, r) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 90);
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  };
  const outOrder = [4, 0, 7, 2, 6, 1, 8];   // scattered, so it never reads as a wipe
  for (let i = 0; i < N; i++) {
    const cx = 960 + (i - (N - 1) / 2) * 190, cy = 540;
    const g = el('g', {}, s);
    el('path', { d: hex(cx, cy, 78), fill: HONEY, opacity: '.16' }, g);
    el('path', { d: hex(cx, cy, 78), fill: 'none', stroke: GOLD, 'stroke-width': 5 }, g);
    el('circle', { cx, cy, r: 22, fill: GOLD }, g);
    if (keep < N) {
      const rank = outOrder.indexOf(i);
      if (rank > -1 && rank < N - keep) {
        const at = 0.10 + rank * (0.78 / Math.max(1, N - keep));
        anim(g, [{ opacity: 1 }, { opacity: 1, offset: Math.max(0, at - 0.02) },
                 { opacity: .13, offset: Math.min(1, at + 0.05) }, { opacity: .13 }],
          { duration: sh.dur * 1000, easing: 'linear' });
      }
    } else {
      anim(g, [{ opacity: .55 }, { opacity: 1 }, { opacity: .55 }],
        { duration: 2000, iterations: Infinity, easing: 'ease-in-out', delay: -i * 210 });
    }
  }
  const cap = $(`<div class="card" style="align-content:end;padding-bottom:150px">
    <div class="kicker">${keep < N ? 'one by one, they go out' : 'nine finalists'}</div></div>`);
  stage.appendChild(cap);
}

/* ---------- PAPERS — the syndication idea ---------- */
function papers(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const SEATS = [[300, 300], [660, 220], [1030, 250], [1400, 210], [1660, 330],
                 [250, 700], [620, 790], [1000, 820], [1370, 780], [1690, 690]];
  SEATS.forEach(([x, y], i) => {
    const g = el('g', { transform: `translate(${x} ${y}) rotate(${(i % 2 ? 1 : -1) * (5 + i * 1.6)})` }, s);
    el('rect', { x: -112, y: -78, width: 224, height: 156, rx: 5, fill: CREAM, opacity: '.94' }, g);
    el('rect', { x: -92, y: -58, width: 184, height: 15, rx: 3, fill: INK, opacity: '.55' }, g);
    for (let r = 0; r < 5; r++)
      el('rect', { x: -92, y: -30 + r * 17, width: r === 4 ? 108 : 184, height: 6, rx: 3, fill: INK, opacity: '.24' }, g);
    anim(g, [{ transform: `translate(960px,540px) scale(.2) rotate(0deg)`, opacity: 0 },
             { transform: `translate(${x}px,${y}px) scale(1) rotate(${(i % 2 ? 1 : -1) * (5 + i * 1.6)}deg)`, opacity: 1 }],
      { duration: 1000, delay: 90 * i, easing: 'cubic-bezier(.2,.9,.25,1)' });
  });
}

/* ---------- CITIES — teams from cities across the country ----------
 * Deliberately a constellation and not a map of the United States: an approximate outline
 * drawn from memory would be a wrong picture of a real place, sitting beside four genuine
 * archive photographs. Points of light make the same point and claim nothing.
 */
function cities(stage, sh) {
  hexbed(stage);
  const s = svg(1920, 1080); stage.appendChild(s);
  const PTS = [[380, 640], [520, 430], [700, 560], [760, 350], [900, 700], [960, 470],
               [1080, 330], [1140, 620], [1300, 430], [1380, 700], [1520, 520], [1620, 380]];
  const HUB = [960, 470];
  if (sh.lit) {
    PTS.forEach(([x, y], i) => {
      if (x === HUB[0] && y === HUB[1]) return;
      const ln = el('line', { x1: HUB[0], y1: HUB[1], x2: x, y2: y, stroke: GOLD,
        'stroke-width': 2, opacity: '.35' }, s);
      const L = Math.hypot(x - HUB[0], y - HUB[1]);
      ln.setAttribute('stroke-dasharray', L);
      anim(ln, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
        { duration: 900, delay: 260 + i * 110, easing: 'ease-out' });
    });
  }
  PTS.forEach(([x, y], i) => {
    const g = el('g', {}, s);
    el('circle', { cx: x, cy: y, r: 30, fill: HONEY, opacity: sh.lit ? '.20' : '.05' }, g);
    el('circle', { cx: x, cy: y, r: 11, fill: sh.lit ? GOLD : '#4A4270' }, g);
    if (sh.lit) {
      anim(g, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 520, delay: 200 + i * 110, easing: 'cubic-bezier(.2,.9,.25,1)',
          transformOrigin: `${x}px ${y}px` });
    }
  });
  const cap = $(`<div class="card" style="align-content:end;padding-bottom:130px"><div class="kicker">${
    sh.lit ? 'city against city' : 'nobody had made it national'}</div></div>`);
  stage.appendChild(cap);
}

/* ---------- BEEWORD — the word has nothing to do with the insect ---------- */
function beeword(stage, sh) {
  hexbed(stage);
  const wrap = $('<div class="card"><div class="line" style="font-size:230px;letter-spacing:.04em">bee</div>'
    + '<div class="sub">a gathering of neighbours — nothing to do with the insect</div></div>');
  stage.appendChild(wrap);
  anim(wrap, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
    { duration: 640, easing: 'cubic-bezier(.2,.9,.25,1)' });

  const s = svg(1920, 1080); stage.appendChild(s);
  const b = el('g', {}, s);
  el('ellipse', { cx: 0, cy: 0, rx: 26, ry: 19, fill: HONEY }, b);
  el('path', { d: 'M-10,-16 L-10,16 M4,-18 L4,18', stroke: '#3A2A08', 'stroke-width': 7, opacity: '.8' }, b);
  el('ellipse', { cx: -4, cy: -20, rx: 20, ry: 11, fill: CREAM, opacity: '.72',
    transform: 'rotate(-22 -4 -20)' }, b);
  el('circle', { cx: 24, cy: -4, r: 9, fill: '#3A2A08' }, b);
  // one pass across frame and gone: the insect leaves, the word stays
  // Scaled 3.4x and flown across the UPPER third: at its original size it was a speck, and
  // its old path crossed the subtitle so the insect appeared to be reading the line.
  anim(b, [{ transform: 'translate(-180px,300px) rotate(-8deg) scale(3.4)', opacity: 0 },
           { transform: 'translate(420px,196px) rotate(7deg) scale(3.4)', opacity: 1, offset: .22 },
           { transform: 'translate(1180px,286px) rotate(-6deg) scale(3.4)', opacity: 1, offset: .58 },
           { transform: 'translate(2140px,150px) rotate(12deg) scale(3.4)', opacity: 0 }],
    { duration: Math.max(2600, sh.dur * 900), easing: 'cubic-bezier(.4,0,.5,1)' });
}

/* ---------- FOURWORDS — the recap, as pictures rather than a list ---------- */
function fourwords(stage, sh) {
  hexbed(stage);
  const ITEMS = [
    ['gladiolus', 'plate-gladiolus-garden.png', 'a garden flower'],
    ['cerise',    'plate-fashion-plate-cerise.png', 'a Paris colour'],
    ['abrogate',  'plate-prohibition.png', 'a legal term'],
    ['albumen',   'plate-egg-albumen.png', 'the white of an egg'],
  ];
  const row = document.createElement('div');
  row.style.cssText = 'position:absolute;inset:0;z-index:5;display:flex;align-items:center;'
    + 'justify-content:center;gap:26px;padding:0 60px';
  ITEMS.forEach(([word, src, note], i) => {
    const c = document.createElement('div');
    c.style.cssText = 'width:404px;display:flex;flex-direction:column;gap:14px;align-items:center';
    c.innerHTML = `<div style="width:404px;height:404px;border-radius:18px;overflow:hidden;`
      + `border:3px solid rgba(255,216,115,.5)"><img src="${IMG}${src}" `
      + `style="width:100%;height:100%;object-fit:cover"></div>`
      + `<div style="font:800 54px Sono,monospace;color:#fff">${word}</div>`
      + `<div style="font:600 27px Hanken,system-ui;color:${CREAM};opacity:.8">${note}</div>`;
    row.appendChild(c);
    anim(c, [{ opacity: 0, transform: 'translateY(30px) scale(.94)' },
             { opacity: 1, transform: 'none' }],
      { duration: 720, delay: 260 + i * 900, easing: 'cubic-bezier(.2,.9,.25,1)' });
  });
  stage.appendChild(row);
}

/* ---------- OUTRO ----------
 * No on-screen "AI-generated" card: that disclosure belongs in the video description and in
 * YouTube's own altered-content field at upload, both of which carry it. What sits here
 * instead is what the channel is for.
 */
function outro(stage, sh) {
  hexbed(stage);
  const o = $(`<div id="outro">
    <div class="brand"><i>Bizzing</i><span class="tm">&trade;</span> Bee</div>
    <div class="blurb">A free spelling-bee training app.<br>128,000 words — every one spoken aloud.</div>
    <div class="url">www.bizzingbee.com</div></div>`);
  stage.appendChild(o);
  [...o.children].forEach((c, i) =>
    anim(c, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
      { duration: 780, delay: 180 + i * 460, easing: 'cubic-bezier(.2,.9,.25,1)' }));
}

const KIND = { plate, spell, card, swap, cards, count, medal, title, outro, gladiolus, sword,
               colourfill, coins, elim, papers, cities, beeword, fourwords,
               hold: (s) => hexbed(s) };

window.SHOT = function (sh) {
  const stage = document.getElementById('stage');
  stage.innerHTML = '';
  (KIND[sh.type] || KIND.hold)(stage, sh);
  window.__shot = sh;
  return true;
};

/* Read the assembled word straight out of the DOM — this is what the assertion checks. */
window.SPELLED = function () {
  const row = document.getElementById('word');
  return row ? [...row.children].map(s => s.dataset.ch).join('') : null;
};

/* Counters are baked per frame because they are not expressible as a CSS animation. */
window.SETPROGRESS = function (p) {
  const n = document.querySelector('#count .n');
  if (!n) return;
  const to = +n.dataset.to, pre = n.dataset.prefix || '';
  const eased = 1 - Math.pow(1 - Math.min(1, p / 0.75), 3);
  n.textContent = pre + Math.round(to * eased).toLocaleString('en-US');
};

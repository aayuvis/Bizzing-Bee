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

/* Where the contiguous United States sits inside sprite-usmap.png, which is trimmed to the
 * landmass. Longitude maps near enough linearly across this span; latitude is close enough
 * over 25 degrees that the dots land on their cities when checked against the drawing.
 * Every dot in this film is placed from real coordinates rather than read off a generated
 * map's own labels — the map is asked to carry no lettering at all for exactly that reason. */
const US = { w: -124.7, e: -66.95, n: 49.38, s: 24.5 };
const CITY = {
  cleveland: [41.50, -81.69], neworleans: [29.95, -90.07], newyork: [40.71, -74.01],
  chicago:   [41.88, -87.63], boston:     [42.36, -71.06], philadelphia: [39.95, -75.17],
  stlouis:   [38.63, -90.20], denver:     [39.74, -104.99], sanfrancisco: [37.77, -122.42],
  atlanta:   [33.75, -84.39], kansascity: [39.10, -94.58], minneapolis:  [44.98, -93.27],
  washington:[38.91, -77.04], louisville: [38.25, -85.76],
};
const cityXY = k => {
  const [lat, lon] = CITY[k];
  return [(lon - US.w) / (US.e - US.w), (US.n - lat) / (US.n - US.s)];
};

/* RETIRED from the type slides. A rosette of honeycomb cells filling one after another was
 * added so type frames carried something moving; in the cut it read as a loading spinner —
 * "looks like the page is loading" — which is a worse failure than a caption sitting still.
 * Still used by `cities`, where a filling row genuinely reads as a legend. */
function ornament(stage, sh, where) {
  const box = document.createElement('div');
  const bottom = where === 'bottom';
  box.style.cssText = 'position:absolute;z-index:6;pointer-events:none;'
    + (bottom ? 'left:0;right:0;bottom:74px;display:flex;justify-content:center'
              : 'right:96px;top:50%;transform:translateY(-50%)');
  const s = document.createElementNS(NS, 'svg');
  const n = 7, R = 17;
  s.setAttribute('viewBox', `0 0 ${n * R * 1.78 + 20} 46`);
  s.setAttribute('width', n * R * 1.78 + 20); s.setAttribute('height', 46);
  const hex = (cx, cy, r) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i - 90);
      d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  };
  for (let i = 0; i < n; i++) {
    const cx = 12 + R + i * R * 1.78, cy = 23;
    el('path', { d: hex(cx, cy, R - 2), fill: 'none', stroke: GOLD, 'stroke-width': 2, opacity: '.34' }, s);
    const fill = el('path', { d: hex(cx, cy, R - 5), fill: HONEY, opacity: '0' }, s);
    anim(fill, [{ opacity: 0 }, { opacity: .95, offset: .18 }, { opacity: .95, offset: .5 }, { opacity: 0 }],
      { duration: 3200, iterations: Infinity, delay: -i * 300, easing: 'ease-in-out' });
  }
  box.appendChild(s);
  stage.appendChild(box);
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
  // `zoom` crops INTO an archive scan — the Webster cover carries a library shelfmark in
  // its margin, and the answer to "don't want to see DL" is to frame past it rather than to
  // retouch a primary source.
  const over = sh.zoom || (sh.fit === 'contain' ? 1 : 1.035);
  if (over !== 1) kb.querySelector('img').style.transform = `scale(${over})`;
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

  /* A place-name set over the picture rather than on its own card, so the opening does not
   * spend three seconds of a nine-minute film on a title slate. */
  if (sh.title) {
    const t = $(`<div class="ptitle"><div class="pt-l">${esc(sh.title)}</div>`
      + (sh.subtitle ? `<div class="pt-s">${esc(sh.subtitle)}</div>` : '') + '</div>');
    stage.appendChild(t);
    anim(t, [{ opacity: 0, transform: 'translateY(-16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 820, easing: 'cubic-bezier(.2,.9,.25,1)' });
  }

  /* Locator inset: the map, with one city pulsing. Placed from coordinates, not eyeballed. */
  if (sh.locate) {
    const [fx, fy] = cityXY(sh.locate);
    const box = document.createElement('div');
    box.style.cssText = 'position:absolute;right:58px;top:52px;width:376px;z-index:7;'
      + 'background:rgba(16,11,38,.80);border:2px solid rgba(255,216,115,.42);'
      + 'border-radius:14px;padding:16px 16px 12px';
    const inner = document.createElement('div');
    inner.style.cssText = 'position:relative;width:100%;aspect-ratio:1974/1237';
    inner.innerHTML = `<img src="${IMG}sprite-usmap.png" style="width:100%;height:100%;`
      + `object-fit:contain;filter:brightness(1.5) saturate(.8)">`;
    const pin = document.createElement('div');
    pin.style.cssText = `position:absolute;left:${(fx * 100).toFixed(2)}%;top:${(fy * 100).toFixed(2)}%;`
      + 'width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:' + HONEY;
    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;left:${(fx * 100).toFixed(2)}%;top:${(fy * 100).toFixed(2)}%;`
      + 'width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid ' + HONEY;
    inner.appendChild(ring); inner.appendChild(pin);
    box.appendChild(inner);
    if (sh.locateLabel) {
      const lab = document.createElement('div');
      lab.style.cssText = `font:700 22px Hanken,system-ui;letter-spacing:.22em;`
        + `text-transform:uppercase;color:${GOLD};text-align:center;margin-top:10px`;
      lab.textContent = sh.locateLabel;
      box.appendChild(lab);
    }
    stage.appendChild(box);
    anim(box, [{ opacity: 0, transform: 'translateY(-18px)' }, { opacity: 1, transform: 'none' }],
      { duration: 760, delay: 520, easing: 'cubic-bezier(.2,.9,.25,1)' });
    anim(ring, [{ transform: 'scale(1)', opacity: .95 }, { transform: 'scale(3.6)', opacity: 0 }],
      { duration: 2000, iterations: Infinity, easing: 'ease-out', delay: 900 });
  }

  /* Firecrackers over the parade. Review note: the motor car crossing the road read wrong
   * for a crowd standing still, so the movement here is the celebration itself. */
  if (sh.fireworks) {
    const r = rng((sh.idx || 0) + 91);
    const s2 = svg(1920, 1080); s2.style.zIndex = '4'; stage.appendChild(s2);
    for (let b = 0; b < 9; b++) {
      const cx = 180 + r() * 1560, cy = 90 + r() * 420, delay = r() * (sh.dur * 900);
      // Each burst loops on its OWN period. With one shared 1250ms loop the volley fell
      // into a steady pulse, and the mix of it was heard back as "finger snapping in a
      // rhythmic beat". sfx.py draws this same value from the same generator in the same
      // order, so the reports stay locked to the flashes.
      const per = 1050 + r() * 900;
      const g = el('g', {}, s2);
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2, L = 46 + r() * 40;
        el('line', { x1: cx, y1: cy, x2: (cx + Math.cos(a) * L).toFixed(1),
          y2: (cy + Math.sin(a) * L).toFixed(1), stroke: k % 2 ? GOLD : '#FFF0C2',
          'stroke-width': 4, 'stroke-linecap': 'round' }, g);
      }
      el('circle', { cx, cy, r: 9, fill: '#FFF6DC' }, g);
      anim(g, [{ transform: 'scale(.05)', opacity: 0 },
               { transform: 'scale(.05)', opacity: 1, offset: .02 },
               { transform: 'scale(1)', opacity: 1, offset: .45 },
               { transform: 'scale(1.35)', opacity: 0 }],
        { duration: per, delay, iterations: Infinity,
          easing: 'cubic-bezier(.15,.7,.3,1)', transformOrigin: `${cx}px ${cy}px` });
    }
  }

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


/* The champions, drawn. The film refuses to generate a PHOTOGRAPH of any of these children —
 * beside four genuine archive plates a viewer could not tell which was the document — but
 * the app's own collectible avatars are a different register entirely: unmistakably a
 * stylised character, and the one the audience already meets in Bizzing Bee. Naming a
 * champion and showing nothing beside the name was the note; this answers it. */
const AVA = '../images/av/';
function avatarImg(id, px) {
  const d = document.createElement('div');
  d.style.cssText = `width:${px}px;height:${px}px;flex:0 0 auto;`
    + `background:url(${AVA}${id}.webp) no-repeat center/contain;`
    + `filter:drop-shadow(0 10px 26px rgba(0,0,0,.45))`;
  return d;
}

/* ---------- TYPE ---------- */
function card(stage, sh) {
  hexbed(stage);

  /* A ROW of avatars with a name under each, for the roll-call: the note was that the names
   * should line up with their faces beneath them. Handled first because it replaces the type
   * block rather than decorating it. */
  if (sh.faces) {
    const row = document.createElement('div');
    row.style.cssText = 'position:absolute;inset:0;z-index:5;display:flex;align-items:center;'
      + 'justify-content:center;gap:46px;padding:0 5%';
    sh.faces.forEach(([id, name], i) => {
      const col = document.createElement('div');
      col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:16px';
      col.appendChild(avatarImg(id, 330));
      const lab = document.createElement('div');
      lab.style.cssText = 'font:800 38px Fraunces,serif;color:#fff;text-align:center;'
        + 'text-wrap:balance;max-width:270px;line-height:1.12';
      lab.textContent = name;
      col.appendChild(lab);
      row.appendChild(col);
      anim(col, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: 180 + i * 480, easing: 'cubic-bezier(.2,.9,.25,1)' });
    });
    stage.appendChild(row);
    if (sh.fade) {
      const f = document.createElement('div');
      f.style.cssText = 'position:absolute;inset:0;z-index:6;background:' + INK;
      stage.appendChild(f);
      anim(f, [{ opacity: 0 }, { opacity: 0 }, { opacity: .86 }],
        { duration: sh.dur * 1000, easing: 'linear' });
    }
    return;
  }

  const c = $(`<div class="card">
    ${sh.kicker ? `<div class="kicker">${esc(sh.kicker)}</div>` : ''}
    <div class="line">${sh.line || ''}</div>
    ${sh.sub ? `<div class="sub">${esc(sh.sub)}</div>` : ''}</div>`);
  stage.appendChild(c);
  if (sh.avatar) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;inset:0;z-index:4;display:flex;align-items:center;'
      + 'justify-content:center;gap:40px;padding:0 6% 210px;pointer-events:none';
    [].concat(sh.avatar).forEach((id, i) => {
      const a = avatarImg(id, sh.avatarPx || 560);
      wrap.appendChild(a);
      anim(a, [{ opacity: 0, transform: 'translateY(30px) scale(.94)' },
               { opacity: 1, transform: 'none' }],
        { duration: 760, delay: 120 + i * 360, easing: 'cubic-bezier(.2,.9,.25,1)' });
    });
    stage.appendChild(wrap);
    c.style.alignContent = 'end';           // type steps out of the picture's way
    c.style.paddingBottom = '62px';
  }
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
  /* Both spelling changes now live in ONE shot. "Centre flips to center" is spoken only
   * 1.0s before the next sentence, which is under the strobe floor as a shot of its own —
   * it was cut for that reason and the note asked for it back. Holding both here gives the
   * pair three seconds together, and the second lands on its own cue. */
  const PAIRS = sh.pairs || [[sh.a, sh.b]];
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;inset:0;z-index:5';
  stage.appendChild(wrap);

  PAIRS.forEach(([a, b], k) => {
    const row = document.createElement('div');
    row.id = k === 0 ? 'swap' : '';
    row.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;'
      + 'justify-content:center;gap:.04em';
    a.split('').forEach(ch => {
      const sp = document.createElement('span');
      sp.textContent = ch;
      sp.style.cssText = 'font:800 160px Fraunces,serif;color:#fff;display:inline-block';
      row.appendChild(sp);
    });
    const at = (sh.at2 != null && k === 1) ? sh.at2 * 1000 : 0;
    const drop = a.length !== b.length;      // colour -> color: a letter genuinely leaves
    let d = 0; while (d < Math.min(a.length, b.length) && a[d] === b[d]) d++;
    if (drop) {
      const gone = row.children[d];
      if (gone) {
        gone.style.color = BAD;
        anim(gone, [{ transform: 'none', opacity: 1 },
                    { transform: 'none', opacity: 1, offset: .32 },
                    { transform: 'translateY(-12px) rotate(-5deg)', opacity: 1, offset: .40 },
                    { transform: 'translateY(330px) rotate(24deg)', opacity: 0 }],
          { duration: 1500, delay: at + 900, easing: 'ease-in' });
      }
    } else {
      /* centre -> center: same letters, two of them trade places. Marking one of them as
       * "wrong" and dropping it was simply untrue — nothing is lost, the pair transposes. */
      const i = d, j = d + 1;
      const li = row.children[i], lj = row.children[j];
      if (li && lj) {
        const w = 86;                         // one glyph advance at 160px Fraunces
        [li, lj].forEach(e => { e.style.color = HONEY; });
        anim(li, [{ transform: 'none' }, { transform: `translateX(${w}px)` }],
          { duration: 620, delay: at + 220, easing: 'cubic-bezier(.5,0,.2,1)' });
        anim(lj, [{ transform: 'none' }, { transform: `translateX(${-w}px)` }],
          { duration: 620, delay: at + 220, easing: 'cubic-bezier(.5,0,.2,1)' });
      }
    }
    wrap.appendChild(row);
    if (k > 0) {
      anim(row, [{ opacity: 0 }, { opacity: 0, offset: .99 }, { opacity: 1 }],
        { duration: Math.max(30, at), easing: 'linear' });
      // the first pair steps aside as the second arrives
      anim(wrap.children[0], [{ opacity: 1 }, { opacity: 1, offset: .99 }, { opacity: 0 }],
        { duration: Math.max(30, at), easing: 'linear' });
    }
  });
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

/* Webster's speller, drawn. The note asked for the book itself here rather than a number
 * alone: it is the object the sentence is about, and "the blue-backed speller" is a
 * description of a cover. */
function spellerBook(px) {
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 300 380');
  s.setAttribute('width', px); s.setAttribute('height', Math.round(px * 380 / 300));
  s.style.cssText = 'filter:drop-shadow(0 18px 34px rgba(0,0,0,.5))';
  const g = el('defs', {}, s);
  const lg = el('linearGradient', { id: 'bk', x1: '0', y1: '0', x2: '1', y2: '1' }, g);
  el('stop', { offset: '0%', 'stop-color': '#4A6FC4' }, lg);
  el('stop', { offset: '100%', 'stop-color': '#26407E' }, lg);
  el('path', { d: 'M62,26 L268,26 L268,354 L62,354 Z', fill: '#D8CDB4' }, s);   // pages
  for (let i = 0; i < 16; i++)
    el('rect', { x: 258 - i * 0.6, y: 34 + i * 20, width: 8, height: 10, fill: '#BEB194', opacity: '.7' }, s);
  el('path', { d: 'M30,18 L250,18 L250,362 L30,362 Z', fill: 'url(#bk)' }, s);  // blue board
  el('path', { d: 'M30,18 L52,18 L52,362 L30,362 Z', fill: '#1B2F63' }, s);     // spine
  el('rect', { x: 74, y: 52, width: 152, height: 232, fill: 'none', stroke: GOLD,
    'stroke-width': 3, opacity: '.75' }, s);
  el('rect', { x: 86, y: 64, width: 128, height: 208, fill: 'none', stroke: GOLD,
    'stroke-width': 1.6, opacity: '.5' }, s);
  // a blind-stamped ornament, not lettering: this is a drawing, not a facsimile
  el('circle', { cx: 150, cy: 168, r: 34, fill: 'none', stroke: GOLD, 'stroke-width': 2.6, opacity: '.8' }, s);
  el('circle', { cx: 150, cy: 168, r: 15, fill: GOLD, opacity: '.55' }, s);
  el('rect', { x: 104, y: 306, width: 92, height: 4, rx: 2, fill: GOLD, opacity: '.6' }, s);
  return s;
}

function count(stage, sh) {
  hexbed(stage);
  const box = $(`<div id="count"><div class="n">0</div><div class="l">${esc(sh.label || '')}</div></div>`);
  stage.appendChild(box);
  const n = box.querySelector('.n');
  n.dataset.to = sh.to; n.dataset.prefix = sh.prefix || '';
  if (sh.book) {
    // The book sits to the LEFT of the number and the counter is pushed right to meet it;
    // centring both put a blue board straight through the middle of the digits.
    const holder = document.createElement('div');
    holder.style.cssText = 'position:absolute;left:12%;top:50%;z-index:4;'
      + 'transform:translateY(-50%);pointer-events:none';
    holder.appendChild(spellerBook(330));
    stage.appendChild(holder);
    anim(holder, [{ opacity: 0, transform: 'translateY(-50%) translateX(-30px) rotate(-9deg)' },
                  { opacity: 1, transform: 'translateY(-50%) rotate(-5deg)' }],
      { duration: 860, easing: 'cubic-bezier(.2,.9,.25,1)' });
    box.style.paddingLeft = '20%';
  }
}

function title(stage, sh) {
  hexbed(stage);
  const a = $('<div id="t25"><s>1925</s></div>');
  const b = $('<div id="t08">1908</div>');
  const c = $('<div id="ttl">BEFORE THE BEE</div>');
  [a, b, c].forEach(e => { e.style.animation = 'none'; e.style.opacity = '0'; stage.appendChild(e); });
  // Delays come from scenes.js, which read them out of the recording: "1925" appears as it
  // is said and is struck through the moment the narrator says "It wasn't".
  const t25 = (sh.t25At != null ? sh.t25At : 0) * 1000;
  const t08 = (sh.t08At != null ? sh.t08At : 1.6) * 1000;
  anim(a, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: .55, transform: 'none' }],
    { duration: 520, delay: t25, easing: 'cubic-bezier(.2,.9,.25,1)' });
  anim(a.querySelector('s'), [{ 'text-decoration-color': 'transparent' },
                              { 'text-decoration-color': 'transparent', offset: .99 },
                              { 'text-decoration-color': BAD }],
    { duration: Math.max(60, t08 - t25), delay: t25 });
  anim(b, [{ opacity: 0, transform: 'translateY(-46px) scale(1.15)' }, { opacity: 1, transform: 'none' }],
    { duration: 620, delay: t08, easing: 'cubic-bezier(.2,.9,.25,1)' });
  // and 1925 leaves as 1908 lands — both sit at the same y, so holding the struck year
  // underneath left the two numbers overlapping as one unreadable smudge
  anim(a, [{ opacity: .55, transform: 'none' },
           { opacity: .55, transform: 'none', offset: .35 },
           { opacity: 0, transform: 'translateY(26px)' }],
    { duration: 700, delay: t08, easing: 'ease-in' });
  anim(c, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
    { duration: 620, delay: t08 + 620, easing: 'cubic-bezier(.2,.9,.25,1)' });
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
  /* Nine finalists, drawn as nine children rather than nine lights. The note was explicit:
   * six girls and three boys, which is the real 1925 field, and the one who wins carries the
   * champion's own avatar so the room has a face in it by the time he is named. */
  const N = sh.from || 9, keep = sh.to == null ? N : sh.to;
  const GIRL = [0, 1, 3, 5, 6, 8];                 // six girls, three boys
  const WIN = 4;                                    // the one still standing at the end
  const row = document.createElement('div');
  row.style.cssText = 'position:absolute;inset:0;z-index:5;display:flex;align-items:center;'
    + 'justify-content:center;gap:22px;padding:0 3% 90px';
  stage.appendChild(row);

  const kid = (i) => {
    const g = document.createElementNS(NS, 'svg');
    g.setAttribute('viewBox', '0 0 120 210');
    g.setAttribute('width', 120); g.setAttribute('height', 210);
    const isGirl = GIRL.includes(i);
    const DK = '#2A2050', HAIR = '#1B1338';
    if (isGirl) el('path', { d: 'M22,206 Q34,120 46,96 L74,96 Q86,120 98,206 Z', fill: DK }, g);
    else {
      el('path', { d: 'M40,206 L40,140 L56,140 L56,206 Z', fill: DK }, g);
      el('path', { d: 'M64,206 L64,140 L80,140 L80,206 Z', fill: DK }, g);
      el('path', { d: 'M38,96 L82,96 L82,146 L38,146 Z', fill: DK }, g);
    }
    el('path', { d: 'M40,94 L80,94 L76,60 L44,60 Z', fill: DK }, g);          // torso
    el('path', { d: 'M42,66 q-14,30 -8,52', stroke: DK, 'stroke-width': 13, fill: 'none',
      'stroke-linecap': 'round' }, g);
    el('path', { d: 'M78,66 q14,30 8,52', stroke: DK, 'stroke-width': 13, fill: 'none',
      'stroke-linecap': 'round' }, g);
    el('circle', { cx: 60, cy: 38, r: 25, fill: HAIR }, g);                    // head, no face
    if (isGirl) {
      el('path', { d: 'M37,34 q-11,26 -4,42', stroke: HAIR, 'stroke-width': 10, fill: 'none',
        'stroke-linecap': 'round' }, g);
      el('path', { d: 'M83,34 q11,26 4,42', stroke: HAIR, 'stroke-width': 10, fill: 'none',
        'stroke-linecap': 'round' }, g);
    }
    el('path', { d: 'M44,20 a16,14 0 0 1 32,0 z', fill: '#3E2F78' }, g);
    return g;
  };

  for (let i = 0; i < N; i++) {
    const cell = document.createElement('div');
    cell.style.cssText = 'position:relative;width:150px;height:250px;display:flex;'
      + 'align-items:flex-end;justify-content:center';
    if (keep < N && i === WIN) cell.appendChild(avatarImg('neuhauser', 210));
    else cell.appendChild(kid(i));
    row.appendChild(cell);

    if (keep < N) {
      // scattered, so it never reads as a wipe across the row
      const order = [7, 0, 2, 8, 1, 6, 3];
      const rank = order.indexOf(i);
      if (rank > -1 && rank < N - keep) {
        const at = 0.12 + rank * (0.74 / Math.max(1, N - keep));
        anim(cell, [{ opacity: 1, transform: 'none' },
                    { opacity: 1, transform: 'none', offset: Math.max(0, at - 0.02) },
                    { opacity: .10, transform: 'translateY(26px)', offset: Math.min(1, at + 0.06) },
                    { opacity: .10, transform: 'translateY(26px)' }],
          { duration: sh.dur * 1000, easing: 'ease-in' });
      }
    } else {
      anim(cell, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, delay: 90 * i, easing: 'cubic-bezier(.2,.9,.25,1)' });
    }
  }
  const cap = $(`<div class="card" style="align-content:end;padding-bottom:56px">
    <div class="kicker">${keep < N ? 'one by one, they go out' : 'six girls, three boys'}</div></div>`);
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
 * v2 drew this as an abstract constellation because an outline of the United States drawn
 * from memory would be a wrong picture of a real place sitting beside four genuine archive
 * photographs. That objection is answered rather than avoided here: the map is a real
 * drawn silhouette, and every dot is placed from actual latitude and longitude rather than
 * from where a label happened to look right. The map itself carries no lettering at all.
 */
function cities(stage, sh) {
  hexbed(stage, sh);
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);'
    + 'width:1290px;aspect-ratio:1974/1237;z-index:4;margin-top:-42px';
  wrap.innerHTML = `<img src="${IMG}sprite-usmap.png" style="position:absolute;inset:0;`
    + `width:100%;height:100%;object-fit:contain;filter:brightness(1.35)">`;
  stage.appendChild(wrap);
  anim(wrap, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.97)' },
              { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' }],
    { duration: 900, easing: 'cubic-bezier(.2,.9,.25,1)' });

  const NAMES = ['newyork', 'boston', 'philadelphia', 'chicago', 'stlouis', 'neworleans',
                 'atlanta', 'kansascity', 'minneapolis', 'denver', 'sanfrancisco'];
  const HUB = 'cleveland';
  const [hx, hy] = cityXY(HUB);

  // lines first, so the dots sit on top of them
  if (sh.lit) {
    const lines = document.createElementNS(NS, 'svg');
    lines.setAttribute('viewBox', '0 0 100 100');
    lines.setAttribute('preserveAspectRatio', 'none');
    lines.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible';
    NAMES.forEach((k, i) => {
      const [x, y] = cityXY(k);
      const ln = el('line', { x1: hx * 100, y1: hy * 100, x2: x * 100, y2: y * 100,
        stroke: GOLD, 'stroke-width': 2.4, opacity: '.75',
        'vector-effect': 'non-scaling-stroke' }, lines);
      const L = Math.hypot((x - hx) * 100, (y - hy) * 100);
      ln.setAttribute('stroke-dasharray', L);
      anim(ln, [{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
        { duration: 760, delay: 500 + i * 130, easing: 'ease-out' });
    });
    wrap.appendChild(lines);
  }

  const dot = (k, hub) => {
    const [x, y] = cityXY(k);
    const d = document.createElement('div');
    const sz = hub ? 26 : 15;
    d.style.cssText = `position:absolute;left:${(x * 100).toFixed(2)}%;top:${(y * 100).toFixed(2)}%;`
      + `width:${sz}px;height:${sz}px;margin:${-sz / 2}px 0 0 ${-sz / 2}px;border-radius:50%;`
      + `background:${sh.lit || hub ? HONEY : '#5A5288'};`
      + (hub ? `box-shadow:0 0 0 5px rgba(255,194,61,.28)` : '');
    wrap.appendChild(d);
    return d;
  };

  NAMES.forEach((k, i) => {
    const d = dot(k, false);
    if (sh.lit) anim(d, [{ opacity: 0, transform: 'scale(.2)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 420, delay: 560 + i * 130, easing: 'cubic-bezier(.2,.9,.25,1)' });
  });
  const hub = dot(HUB, true);
  anim(hub, [{ transform: 'scale(1)' }, { transform: 'scale(1.22)' }, { transform: 'scale(1)' }],
    { duration: 1800, iterations: Infinity, easing: 'ease-in-out' });

  const cap = $(`<div class="card" style="align-content:end;padding-bottom:126px"><div class="kicker">${
    sh.lit ? 'city against city' : 'nobody had made it national'}</div></div>`);
  stage.appendChild(cap);
}

/* ---------- SPOTLIGHT ----------
 * One child, alone in the light, at the moment the narration says she made no mistakes at
 * all. The figure is drawn — plaits, a plain 1908 pinafore, seen from BEHIND facing the
 * dark house. It is not a likeness and does not claim to be one: no face is drawn, here or
 * anywhere else in this film.
 */
function spotlight(stage, sh) {
  const kb = $(`<div class="kb"><img src="${IMG}plate-theatre-spot.png"></div>`);
  kb.querySelector('img').style.transform = 'scale(1.035)';
  stage.appendChild(kb);
  anim(kb, [{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }],
    { duration: sh.dur * 1000, easing: 'linear' });

  /* The plate is deliberately almost black, so the light she stands in is painted here
   * rather than borrowed from it — the first attempt put the figure at the very bottom of
   * the frame on an unlit stage and she read as a chess piece in the dark. */
  // The beam itself, thrown from above and flaring where it meets the boards.
  const beam = document.createElement('div');
  beam.style.cssText = 'position:absolute;left:50%;top:-4%;width:1000px;height:96%;z-index:2;'
    + 'transform:translateX(-50%);pointer-events:none;'
    + 'clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);'
    + 'background:linear-gradient(180deg,rgba(255,240,205,.34),rgba(255,232,178,.13) 62%,transparent)';
  stage.appendChild(beam);
  const pool = document.createElement('div');
  pool.style.cssText = 'position:absolute;left:50%;top:70%;width:1240px;height:520px;z-index:2;'
    + 'transform:translate(-50%,-50%);border-radius:50%;pointer-events:none;'
    + 'background:radial-gradient(50% 50% at 50% 50%,rgba(255,244,214,.92),'
    + 'rgba(255,226,160,.52) 40%,rgba(255,214,130,.16) 66%,transparent 80%)';
  stage.appendChild(pool);
  anim(beam, [{ opacity: .86 }, { opacity: 1 }],
    { duration: 3600, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });
  anim(pool, [{ opacity: .82 }, { opacity: 1 }],
    { duration: 3600, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });

  const s = svg(1920, 1080); s.style.zIndex = '4'; stage.appendChild(s);
  const BASE = 838, H = 452;                       // feet on the boards, head up in the light
  const g = el('g', { transform: `translate(960 ${BASE})` }, s);
  const rise = el('g', {}, g);
  const DK = '#1B1338', MD = '#2A2050';
  el('ellipse', { cx: 0, cy: 4, rx: 118, ry: 24, fill: '#000', opacity: '.42' }, rise);
  // skirt
  el('path', { d: `M-96,0 Q-70,${-H * 0.34} -42,${-H * 0.55} L42,${-H * 0.55} Q70,${-H * 0.34} 96,0 Z`, fill: MD }, rise);
  el('path', { d: `M-96,0 Q-70,${-H * 0.34} -42,${-H * 0.55} L-12,${-H * 0.55} Q-30,${-H * 0.3} -34,0 Z`,
    fill: '#372A63' }, rise);
  // bodice
  el('path', { d: `M-44,${-H * 0.53} L-38,${-H * 0.78} L38,${-H * 0.78} L44,${-H * 0.53} Z`, fill: DK }, rise);
  // arms, hanging at her sides
  el('path', { d: `M-40,${-H * 0.76} q-20,${H * 0.11} -13,${H * 0.26}`, stroke: DK,
    'stroke-width': 19, fill: 'none', 'stroke-linecap': 'round' }, rise);
  el('path', { d: `M40,${-H * 0.76} q20,${H * 0.11} 13,${H * 0.26}`, stroke: DK,
    'stroke-width': 19, fill: 'none', 'stroke-linecap': 'round' }, rise);
  // shoulders
  el('path', { d: `M-46,${-H * 0.775} q46,${-H * 0.05} 92,0`, stroke: DK, 'stroke-width': 16,
    fill: 'none', 'stroke-linecap': 'round' }, rise);
  // head from behind, plaits — no face is drawn, here or anywhere in this film
  el('circle', { cx: 0, cy: -H * 0.875, r: 42, fill: DK }, rise);
  el('path', { d: `M-38,${-H * 0.885} q-18,${H * 0.09} -7,${H * 0.16}`, stroke: DK,
    'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, rise);
  el('path', { d: `M38,${-H * 0.885} q18,${H * 0.09} 7,${H * 0.16}`, stroke: DK,
    'stroke-width': 14, fill: 'none', 'stroke-linecap': 'round' }, rise);
  el('path', { d: `M-27,${-H * 0.94} a27,23 0 0 1 54,0 z`, fill: '#3E2F78' }, rise);

  anim(rise, [{ transform: 'translateY(44px)', opacity: 0 },
              { transform: 'translateY(0)', opacity: 1 }],
    { duration: 1150, easing: 'cubic-bezier(.2,.9,.25,1)' });
  anim(g, [{ transform: `translate(960px,${BASE}px) scale(1)` },
           { transform: `translate(960px,${BASE}px) scale(1.014)` }],
    { duration: 4200, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out' });

  dust(stage, sh, 30);
  if (sh.caption) {
    const cap = $(`<div class="card" style="align-content:start;padding-top:110px">`
      + `<div class="kicker">${esc(sh.caption)}</div></div>`);
    stage.appendChild(cap);
    anim(cap, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, delay: 600 });
  }
}

/* ---------- BEEWORD — the word has nothing to do with the insect ---------- */
function beeword(stage, sh) {
  hexbed(stage, sh);
  const wrap = $('<div class="card"><div class="line" style="font-size:230px;letter-spacing:.04em">bee</div>'
    + '<div class="sub">a gathering of neighbours — nothing to do with the insect</div></div>');
  stage.appendChild(wrap);
  anim(wrap, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
    { duration: 560, delay: (sh.beeAt || 0) * 1000, easing: 'cubic-bezier(.2,.9,.25,1)' });

  const s = svg(1920, 1080); stage.appendChild(s);
  const b = el('g', {}, s);
  el('ellipse', { cx: 0, cy: 0, rx: 26, ry: 19, fill: HONEY }, b);
  el('path', { d: 'M-10,-16 L-10,16 M4,-18 L4,18', stroke: '#3A2A08', 'stroke-width': 7, opacity: '.8' }, b);
  el('ellipse', { cx: -4, cy: -20, rx: 20, ry: 11, fill: CREAM, opacity: '.72',
    transform: 'rotate(-22 -4 -20)' }, b);
  el('circle', { cx: 24, cy: -4, r: 9, fill: '#3A2A08' }, b);
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
  hexbed(stage, sh);
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
  hexbed(stage, sh);
  const o = $(`<div id="outro">
    <div class="brand"><i>Bizzing</i><span class="tm">&trade;</span> Bee</div>
    <div class="blurb">A free spelling-bee training app.<br>128,000 words — every one spoken aloud.</div>
    <div class="url">www.bizzingbee.com</div></div>`);
  stage.appendChild(o);
  [...o.children].forEach((c, i) =>
    anim(c, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }],
      { duration: 780, delay: 180 + i * 460, easing: 'cubic-bezier(.2,.9,.25,1)' }));
}


/* 7:37 — "They weren't professional children. No coaches, no study plans." Type alone did
 * not carry it; the note asked to see the two things they did NOT have, struck out. */
function noplan(stage, sh) {
  hexbed(stage);
  const row = document.createElement('div');
  row.style.cssText = 'position:absolute;inset:0;z-index:5;display:flex;align-items:center;'
    + 'justify-content:center;gap:120px;padding:0 8% 90px';
  const panel = (label, draw) => {
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:26px;position:relative';
    const art = document.createElementNS(NS, 'svg');
    art.setAttribute('viewBox', '0 0 260 260');
    art.setAttribute('width', 300); art.setAttribute('height', 300);
    draw(art);
    col.appendChild(art);
    const lab = document.createElement('div');
    lab.style.cssText = 'font:800 52px Fraunces,serif;color:#fff';
    lab.textContent = label;
    col.appendChild(lab);
    // the red strike that says they did not have it
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;left:-14px;right:-14px;top:44%;height:9px;border-radius:5px;'
      + 'background:' + BAD + ';transform-origin:left center';
    col.appendChild(bar);
    row.appendChild(col);
    return { col, bar };
  };

  const coach = panel('no coaches', a => {
    el('circle', { cx: 130, cy: 62, r: 34, fill: '#2A2050' }, a);
    el('path', { d: 'M96,44 a34,26 0 0 1 68,0 z', fill: '#3E2F78' }, a);          // cap
    el('path', { d: 'M78,232 L78,120 q52,-26 104,0 L182,232 Z', fill: '#2A2050' }, a);
    el('circle', { cx: 186, cy: 126, r: 20, fill: 'none', stroke: GOLD, 'stroke-width': 6 }, a);
    el('path', { d: 'M186,106 L186,96', stroke: GOLD, 'stroke-width': 6, 'stroke-linecap': 'round' }, a);
  });
  const plan = panel('no study plans', a => {
    el('rect', { x: 52, y: 26, width: 156, height: 208, rx: 8, fill: '#F3EEFF' }, a);
    el('rect', { x: 52, y: 26, width: 156, height: 34, rx: 8, fill: '#C9BEE8' }, a);
    for (let i = 0; i < 6; i++) {
      el('rect', { x: 74, y: 82 + i * 25, width: 16, height: 16, rx: 4, fill: 'none',
        stroke: '#6C5FA8', 'stroke-width': 3 }, a);
      el('rect', { x: 100, y: 88 + i * 25, width: 88 - (i % 3) * 18, height: 7, rx: 3.5, fill: '#8B7FC0' }, a);
    }
  });

  stage.appendChild(row);
  [coach, plan].forEach((p, i) => {
    anim(p.col, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }],
      { duration: 700, delay: 150 + i * 420, easing: 'cubic-bezier(.2,.9,.25,1)' });
    anim(p.bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(0)', offset: .3 },
                 { transform: 'scaleX(1)' }],
      { duration: 1500, delay: 700 + i * 420, easing: 'cubic-bezier(.3,0,.2,1)' });
  });

  const cap = $('<div class="card" style="align-content:end;padding-bottom:64px">'
    + '<div class="kicker">they were not professional children</div></div>');
  stage.appendChild(cap);
  if (sh.fade) {
    const f = document.createElement('div');
    f.style.cssText = 'position:absolute;inset:0;z-index:6;background:' + INK;
    stage.appendChild(f);
    anim(f, [{ opacity: 0 }, { opacity: 0 }, { opacity: .86 }],
      { duration: sh.dur * 1000, easing: 'linear' });
  }
}

const KIND = { plate, spell, card, swap, cards, count, medal, title, outro, gladiolus, sword,
               colourfill, coins, elim, papers, cities, beeword, fourwords, spotlight, noplan,
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

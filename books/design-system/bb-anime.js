/* ============================================================================
   BB ANIME — the Bizzing Bee Library's cinematic art module (v5).
   Turns the app's flat 120×120 avatar icons into anime keyframes: layered
   painterly skies, volumetric light, particle weather, cel clouds, depth of
   field, ground shadow and rim glow. Everything is parametric so the WHOLE
   211-avatar collection can walk on stage, not just the sixteen guides.

   Register (1 → 3) is the maturity dial, matched to the reading age of each
   volume: 1 = bright chibi daylight, big suns, fat clouds; 2 = golden-hour
   grounding, longer shadows; 3 = cinematic dusk/night, letterboxed framing,
   restrained palette. Same engine, growing up with the reader.

   API (all return SVG fragment strings unless noted):
     ANIME.palette(avId)                → {a, b, glow} from the avatar's own art
     ANIME.sky(world, mood, W, H, reg, uid)
     ANIME.clouds(W, H, reg, seed, uid)
     ANIME.rays(x, y, W, H, uid)       → god rays from a light source
     ANIME.particles(world, W, H, seed, reg, uid)  → petals/fireflies/embers/snow
     ANIME.ground(world, W, H, reg)    → silhouette landscape + groundline
     ANIME.figure(avId, x, y, size, opts) → lifted character: aura, rim, shadow
     ANIME.plate(avId, {W,H,world,mood,reg,seed,uid,figX,figY,figS,flip})
                                       → a full keyframe scene
     ANIME.portrait(avId, sizePt, opts)→ round painterly portrait (inline <svg>)
     ANIME.vex(sizePt, opts)           → the redesigned moth, menace intact
     ANIME.filters(uid)                → shared <defs> (call once per <svg>)
   ============================================================================ */
(function () {
  const root = typeof window !== 'undefined' ? window : globalThis;
  const AV = () => root.SB_AVATAR_ART || {};

  /* ---- deterministic rng ---- */
  const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  /* ---- colour helpers ---- */
  function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function sat([r, g, b]) { const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; }
  function lum([r, g, b]) { return (r * .299 + g * .587 + b * .114) / 255; }
  function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }
  function mix(h1, h2, t) { const a = hex2rgb(h1), b = hex2rgb(h2);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); }

  /* Bizzy — the series hero — has no entry in SB_AVATAR_ART (the app draws the
     mascot separately), so the module carries its own cel-shaded anime Bizzy:
     gradient gold body, curved stripes, glassy wings, big keyframe eyes. */
  function bizzyInner(uid) {
    return `<defs>
        <linearGradient id="bzb-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD66B"/><stop offset=".65" stop-color="#F5B93C"/><stop offset="1" stop-color="#E09A1F"/></linearGradient>
        <linearGradient id="bzw-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="rgba(255,255,255,.95)"/><stop offset="1" stop-color="rgba(173,205,255,.55)"/></linearGradient></defs>
      <g>
        <g transform="rotate(-16 60 40)"><ellipse cx="34" cy="30" rx="21" ry="13" fill="url(#bzw-${uid})"/><path d="M18 30 Q34 24 52 30 M22 34 Q36 29 50 33" stroke="rgba(120,150,220,.5)" stroke-width="1.6" fill="none"/></g>
        <g transform="rotate(16 60 40)"><ellipse cx="86" cy="30" rx="21" ry="13" fill="url(#bzw-${uid})"/><path d="M70 30 Q86 24 102 30 M72 34 Q86 29 100 33" stroke="rgba(120,150,220,.5)" stroke-width="1.6" fill="none"/></g>
        <path d="M46 16 Q40 4 30 4 M74 16 Q80 4 90 4" stroke="#3A2C14" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="30" cy="4" r="5" fill="#3A2C14"/><circle cx="90" cy="4" r="5" fill="#3A2C14"/>
        <path d="M60 108 L54 118 L66 118 Z" fill="#3A2C14"/>
        <ellipse cx="60" cy="66" rx="42" ry="46" fill="url(#bzb-${uid})"/>
        <path d="M22 78 Q60 96 98 78 Q92 108 60 110 Q28 108 22 78 Z" fill="#E09A1F" opacity=".55"/>
        <path d="M24 52 Q60 40 96 52 L96 62 Q60 50 24 62 Z M22 74 Q60 62 98 74 L98 84 Q60 72 22 84 Z" fill="#7A5210"/>
        <path d="M30 34 Q60 22 90 34 Q78 26 60 26 Q42 26 30 34 Z" fill="rgba(255,255,255,.5)"/>
        <ellipse cx="44" cy="52" rx="12" ry="14" fill="#fff"/><ellipse cx="76" cy="52" rx="12" ry="14" fill="#fff"/>
        <circle cx="46" cy="54" r="7" fill="#241E33"/><circle cx="74" cy="54" r="7" fill="#241E33"/>
        <circle cx="48.5" cy="51" r="2.6" fill="#fff"/><circle cx="76.5" cy="51" r="2.6" fill="#fff"/>
        <circle cx="34" cy="66" r="5.5" fill="#FF9EBB" opacity=".8"/><circle cx="86" cy="66" r="5.5" fill="#FF9EBB" opacity=".8"/>
        <path d="M52 70 Q60 78 68 70" stroke="#3A2C14" stroke-width="3.6" fill="none" stroke-linecap="round"/>
        <path d="M30 92 q-8 5 -9 12 M90 92 q8 5 9 12" stroke="#3A2C14" stroke-width="4" fill="none" stroke-linecap="round"/>
      </g>`;
  }

  /* The avatar's own art is the costume department: its two loudest saturated
     colours become the character's aura and rim tint, so every one of the 211
     glows in its own light instead of a generic one. */
  const _palCache = { bizzy: { a: '#F5B93C', b: '#6C4FE0', glow: '#FFE9AE' } };
  function palette(avId) {
    if (_palCache[avId]) return _palCache[avId];
    const art = AV()[avId] || '';
    const count = {};
    (art.match(/#[0-9A-Fa-f]{6}\b/g) || []).forEach(h => { h = h.toUpperCase(); count[h] = (count[h] || 0) + 1; });
    const ranked = Object.keys(count)
      .map(h => ({ h, n: count[h], s: sat(hex2rgb(h)), l: lum(hex2rgb(h)) }))
      .filter(c => c.s > .28 && c.l > .18 && c.l < .92)
      .sort((a, b) => (b.n * b.s) - (a.n * a.s));
    const a = (ranked[0] || { h: '#F0B429' }).h;
    const b = (ranked.find(c => c.h !== a && Math.abs(lum(hex2rgb(c.h)) - lum(hex2rgb(a))) > .08) || ranked[1] || { h: '#7C5CFF' }).h;
    return (_palCache[avId] = { a, b, glow: mix(a, '#FFFFFF', .45) });
  }

  /* ---- shared filter defs (blur levels + soft glow). uid keeps ids unique
     across the many inline SVGs of a printed book. ---- */
  function filters(uid) {
    return `<filter id="bl2-${uid}" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2"/></filter>
      <filter id="bl6-${uid}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="bl14-${uid}" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="14"/></filter>`;
  }

  /* ---- skies: the emotional weather of a scene ----
     Each is a 4-stop vertical wash + a light source. Mood shifts the hour;
     register darkens the hour. This is where "more realistic as the books
     move forward" lives: reg 1 stays in daylight, reg 3 lives at dusk. */
  const SKIES = {
    day:    ['#8FD0F4', '#BCE4FA', '#E9F7FF', '#FFF4DC'],
    gold:   ['#7FB2E8', '#F7C97E', '#FFAD73', '#FFE3B3'],
    dusk:   ['#3B2E77', '#7C5CC8', '#E8709A', '#FFC38A'],
    night:  ['#141233', '#2A2153', '#4A3AA0', '#8A6BD8'],
    storm:  ['#3A3554', '#5C5480', '#8D86AC', '#CFC9E4'],
    blush:  ['#8FA7EE', '#D8A9F0', '#FFB3D2', '#FFE0EC'],
  };
  function skyKey(mood, reg) {
    if (mood === 'oops') return 'storm';
    if (mood === 'love') return 'blush';
    if (mood === 'think') return reg >= 3 ? 'night' : 'dusk';
    if (mood === 'excited') return 'gold';
    return reg >= 3 ? 'gold' : 'day'; // neutral hour: day for the young books, golden hour for the older ones
  }
  function sky(world, mood, W, H, reg, uid) {
    const key = skyKey(mood, reg);
    const c = SKIES[key];
    const sunY = key === 'day' ? H * .18 : key === 'gold' ? H * .5 : H * .3;
    const sunX = W * (key === 'gold' ? .5 : .78);
    const sunR = Math.min(W, H) * (key === 'gold' ? .16 : .08);
    const sun = key === 'night'
      ? `<circle cx="${W * .78}" cy="${H * .16}" r="${sunR * .8}" fill="#F4EBD0"/><circle cx="${W * .78 - sunR * .3}" cy="${H * .16 - sunR * .12}" r="${sunR * .62}" fill="${c[0]}"/>`
      : `<circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="#FFF6DE"/><circle cx="${sunX}" cy="${sunY}" r="${sunR * 2.1}" fill="#FFE9AE" opacity=".28" filter="url(#bl6-${uid})"/>`;
    const stars = key === 'night' ? Array.from({ length: 26 }, (_, i) => { const r = mulberry(i * 41 + 7)();
      return `<circle cx="${(i * 79 % 100) / 100 * W}" cy="${(i * 53 % 60) / 100 * H}" r="${1 + r * 1.6}" fill="#FFF" opacity="${.35 + r * .5}"/>`; }).join('') : '';
    return `<linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c[0]}"/><stop offset=".42" stop-color="${c[1]}"/>
        <stop offset=".74" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></linearGradient>
      <rect width="${W}" height="${H}" fill="url(#sky-${uid})"/>${stars}${sun}
      ${key !== 'night' ? rays(sunX, sunY, W, H, uid) : ''}`;
  }

  /* god rays — long translucent wedges, blurred, from the light source */
  function rays(x, y, W, H, uid) {
    const angs = [-38, -16, 6, 26];
    return `<g filter="url(#bl14-${uid})" opacity=".5">${angs.map((a, i) =>
      `<path transform="rotate(${a} ${x} ${y})" d="M${x - 14 - i * 6} ${y} L${x + 14 + i * 6} ${y} L${x + 60 + i * 20} ${y + H} L${x - 60 - i * 20} ${y + H} Z" fill="rgba(255,244,214,${.16 - i * .025})"/>`).join('')}</g>`;
  }

  /* cel clouds: flat-bottomed cumulus, white crown + tinted underside.
     Scaled to the frame so small storyboard panels get small skies. */
  function clouds(W, H, reg, seed, uid) {
    const rnd = mulberry(seed);
    const n = reg >= 3 ? 2 : 4;
    const frameK = Math.min(1, W / 760);
    let out = '';
    for (let i = 0; i < n; i++) {
      const x = W * (.1 + rnd() * .8), y = H * (.05 + rnd() * .2), k = (.55 + rnd() * .8) * frameK;
      const under = reg >= 3 ? 'rgba(255,180,140,.55)' : 'rgba(160,190,235,.5)';
      out += `<g transform="translate(${x} ${y}) scale(${k})">
        <path d="M-70 12 Q-70 -12 -44 -12 Q-40 -34 -12 -32 Q2 -50 26 -38 Q52 -44 58 -20 Q80 -18 78 4 Q78 14 62 14 L-58 14 Q-70 14 -70 12 Z" fill="rgba(255,255,255,.94)"/>
        <path d="M-58 14 L62 14 Q74 14 76 6 Q60 10 30 8 Q-10 12 -58 8 Z" fill="${under}"/></g>`;
    }
    return out;
  }

  /* particle weather per world — the drifting life of a frame. A few are
     blurred large in the foreground for depth of field. */
  const PARTICLE = {
    meadow: 'petal', library: 'wisteria', forum: 'leaf', elements: 'spark',
    stage: 'spark', engine: 'ember', origami: 'crane', strait: 'petal',
    junkyard: 'ember', vibe: 'note', warfield: 'ember', greysea: 'snow',
  };
  function petal(c1, c2) { return `<path d="M0 -7 Q6 -3 4 4 Q0 9 -4 4 Q-6 -3 0 -7 Z" fill="${c1}"/><path d="M0 -7 Q3 -2 2 3 Q0 6 -1 3 Q-2 -2 0 -7 Z" fill="${c2}" opacity=".7"/>`; }
  const SHAPES = {
    petal:    () => petal('#FFC9DC', '#FF9EBB'),
    wisteria: () => petal('#CBB4F2', '#A98BE0'),
    leaf:     () => `<path d="M0 -8 Q7 0 0 8 Q-7 0 0 -8 Z" fill="#D8B25C"/><line y1="-6" y2="6" stroke="#A8843C" stroke-width="1"/>`,
    spark:    () => `<path d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z" fill="#FFE9AE"/>`,
    ember:    () => `<circle r="3.4" fill="#FFB36B"/><circle r="1.6" fill="#FFF0C9"/>`,
    crane:    () => `<path d="M-8 2 L0 -6 L8 2 L2 2 L0 8 L-2 2 Z" fill="#FFF"/>`,
    note:     () => `<path d="M2 -8 L2 4 Q2 8 -2 8 Q-6 8 -6 5 Q-6 2 -2 2 L0 2 L0 -8 Z" fill="#FFF"/>`,
    snow:     () => `<circle r="3" fill="rgba(255,255,255,.9)"/>`,
    firefly:  () => `<circle r="2.6" fill="#D9F79A"/>`,
  };
  function particles(world, W, H, seed, reg, uid) {
    const rnd = mulberry(seed);
    const kind = reg >= 3 && (world === 'meadow' || world === 'strait') ? 'firefly' : (PARTICLE[world] || 'petal');
    const draw = SHAPES[kind] || SHAPES.petal;
    let far = '', near = '';
    const n = 16;
    for (let i = 0; i < n; i++) {
      const x = rnd() * W, y = rnd() * H * .9, s = .5 + rnd() * .9, r = rnd() * 360, o = .45 + rnd() * .5;
      far += `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})" opacity="${o}">${draw()}</g>`;
    }
    for (let i = 0; i < 3; i++) {
      const x = rnd() * W, y = rnd() * H, s = 2.4 + rnd() * 1.8;
      near += `<g transform="translate(${x} ${y}) rotate(${rnd() * 360}) scale(${s})" opacity=".5" filter="url(#bl6-${uid})">${draw()}</g>`;
    }
    return far + near;
  }

  /* ---- grounds: layered silhouette landscapes, three depths ---- */
  function ground(world, W, H, reg) {
    const gy = H * .8;
    const far = 'rgba(70,58,120,.30)', mid = 'rgba(52,42,96,.45)', close = 'rgba(30,24,60,.62)';
    const hill = (x, w, h, f) => `<path d="M${x - w} ${gy} Q ${x} ${gy - h} ${x + w} ${gy} Z" fill="${f}"/>`;
    const spire = (x, w, h, f) => `<path d="M${x - w} ${gy} L${x} ${gy - h} L${x + w} ${gy} Z" fill="${f}"/>`;
    const block = (x, w, h, f) => `<rect x="${x - w / 2}" y="${gy - h}" width="${w}" height="${h}" fill="${f}"/>`;
    const G = {
      meadow: () => hill(W * .16, W * .3, H * .14, far) + hill(W * .82, W * .4, H * .2, far) + hill(W * .5, W * .5, H * .1, mid)
        + [.12, .3, .52, .72, .9].map((f, i) => `<g transform="translate(${W * f} ${gy - 4})"><line y2="-${18 + (i % 3) * 8}" stroke="${close}" stroke-width="3"/><circle cy="-${24 + (i % 3) * 8}" r="7" fill="${['#FF9EBB', '#FFD66B', '#B9A6FF', '#9FE7D6', '#FFB37F'][i]}" opacity=".85"/></g>`).join(''),
      library: () => [.1, .3, .5, .7, .9].map((f, i) => block(W * f, W * .13, H * (.16 + (i % 3) * .05), i % 2 ? mid : far)).join('')
        + [.2, .6, .84].map(f => `<rect x="${W * f}" y="${gy - H * .1}" width="${W * .02}" height="${H * .1}" fill="${close}"/>`).join(''),
      forum: () => [.14, .32, .5, .68, .86].map(f => `<g><rect x="${W * f - 12}" y="${gy - H * .2}" width="24" height="${H * .2}" fill="${mid}"/><rect x="${W * f - 18}" y="${gy - H * .21}" width="36" height="10" fill="${far}"/></g>`).join('') + `<path d="M${W * .26} ${gy - H * .2} Q ${W * .5} ${gy - H * .3} ${W * .74} ${gy - H * .2}" stroke="${far}" stroke-width="10" fill="none"/>`,
      elements: () => spire(W * .2, W * .1, H * .22, far) + spire(W * .5, W * .14, H * .3, mid) + spire(W * .82, W * .09, H * .18, far),
      stage: () => block(W * .5, W * .7, H * .06, close) + [.3, .5, .7].map(f => `<line x1="${W * f}" y1="${gy - H * .06}" x2="${W * f}" y2="${H * .2}" stroke="${far}" stroke-width="4"/>`).join(''),
      engine: () => block(W * .2, W * .16, H * .2, far) + block(W * .6, W * .2, H * .26, mid) + block(W * .88, W * .12, H * .16, far) + `<circle cx="${W * .6}" cy="${gy - H * .26}" r="${H * .05}" fill="${far}"/>`,
      origami: () => spire(W * .22, W * .16, H * .26, far) + spire(W * .5, W * .2, H * .34, mid) + spire(W * .8, W * .14, H * .2, far),
      strait: () => `<ellipse cx="${W * .5}" cy="${gy}" rx="${W * .6}" ry="${H * .02}" fill="${far}"/>` + `<path d="M${W * .7} ${gy} L${W * .7} ${gy - H * .14} L${W * .78} ${gy - H * .05} L${W * .7} ${gy - H * .05}" fill="${mid}"/>` + hill(W * .12, W * .2, H * .1, far),
      junkyard: () => hill(W * .2, W * .22, H * .16, mid) + hill(W * .6, W * .3, H * .22, far) + hill(W * .9, W * .16, H * .12, mid) + `<circle cx="${W * .22}" cy="${gy - H * .05}" r="${H * .03}" fill="none" stroke="${close}" stroke-width="6"/>`,
      vibe: () => hill(W * .3, W * .4, H * .12, far) + hill(W * .75, W * .35, H * .16, mid),
      warfield: () => hill(W * .5, W * .55, H * .1, mid) + [.2, .5, .8].map((f, i) => `<g transform="translate(${W * f} ${gy})"><line y2="-${H * (.14 + i * .03)}" stroke="${close}" stroke-width="4"/><path d="M0 -${H * (.14 + i * .03)} L${W * .05} -${H * (.12 + i * .03)} L0 -${H * (.1 + i * .03)} Z" fill="${i === 1 ? '#F0B429' : far}"/></g>`).join(''),
      greysea: () => `<ellipse cx="${W * .5}" cy="${gy - H * .04}" rx="${W * .7}" ry="${H * .03}" fill="${far}"/><ellipse cx="${W * .3}" cy="${gy}" rx="${W * .5}" ry="${H * .025}" fill="${mid}"/>`,
    };
    /* the foreground ground keeps its world's colour in daylight and only
       falls into silhouette as the register (and the hour) grows late */
    const GROUND_COL = { meadow: '#5FAE63', library: '#7A69B8', forum: '#C08A5E', elements: '#5E7FA8',
      stage: '#4A3E70', engine: '#8A7458', origami: '#7FA88E', strait: '#4E7FA8', junkyard: '#8A6E52',
      vibe: '#6E4E9E', warfield: '#6E5E52', greysea: '#5E6878' };
    const gc = GROUND_COL[world] || '#5FAE63';
    const baseCol = reg >= 3 ? mix(gc, '#100C24', .68) : reg === 2 ? mix(gc, '#241E33', .32) : gc;
    const shade = reg >= 3 ? 'rgba(10,7,24,.5)' : 'rgba(28,20,58,.28)';
    const base = `<path d="M0 ${gy} Q ${W * .25} ${gy - 18} ${W * .5} ${gy} T ${W} ${gy} L ${W} ${H} L 0 ${H} Z" fill="${baseCol}"/>
      <path d="M0 ${H * .93} Q ${W * .3} ${H * .9} ${W} ${H * .95} L ${W} ${H} L 0 ${H} Z" fill="${shade}"/>`;
    return (G[world] || G.meadow)() + base;
  }

  /* ---- the character lift: aura, rim light, contact shadow, scale ----
     This is what "bring the avatars to life" means mechanically: the flat
     icon is staged like a cel — backlit by its own palette, feet shadowed
     onto the ground, a white rim crescent catching the key light. */
  function figure(avId, x, y, size, opts) {
    opts = opts || {};
    const uid = opts.uid || 'f';
    const pal = palette(avId);
    const art = avId === 'bizzy' ? bizzyInner(uid + 'bz' + Math.round(x)) : (AV()[avId] || '');
    const flip = opts.flip ? -1 : 1;
    const rot = opts.rot || 0;
    const s = size / 120;
    return `<g transform="translate(${x} ${y})">
      <ellipse cx="0" cy="${size * .46}" rx="${size * .34}" ry="${size * .07}" fill="rgba(20,14,44,.4)" filter="url(#bl6-${uid})"/>
      <circle r="${size * .5}" fill="${rgba(pal.glow, .5)}" filter="url(#bl14-${uid})" style="mix-blend-mode:screen"/>
      <circle r="${size * .32}" fill="${rgba(pal.a, .28)}" filter="url(#bl6-${uid})" style="mix-blend-mode:screen"/>
      <g transform="rotate(${rot}) scale(${flip * s} ${s}) translate(-60 -60)">${art}</g>
      <path d="M ${-size * .28} ${-size * .16} A ${size * .34} ${size * .34} 0 0 1 ${size * .04} ${-size * .32}" stroke="rgba(255,255,255,.5)" stroke-width="${Math.max(2, size * .018)}" fill="none" stroke-linecap="round" filter="url(#bl2-${uid})"/>
    </g>`;
  }

  /* ---- a full keyframe ---- */
  function plate(avId, o) {
    o = o || {}; const W = o.W || 816, H = o.H || 500;
    const uid = o.uid || ('p' + (o.seed || 1));
    const reg = o.reg || 1;
    const fig = avId ? figure(avId, (o.figX != null ? o.figX : W * .68), (o.figY != null ? o.figY : H * .58), o.figS || H * .52, { uid, flip: o.flip, rot: o.rot }) : '';
    const bars = reg >= 3 && o.letterbox ? `<rect width="${W}" height="${H * .055}" fill="rgba(12,9,28,.85)"/><rect y="${H * .945}" width="${W}" height="${H * .055}" fill="rgba(12,9,28,.85)"/>` : '';
    return `<defs>${filters(uid)}
      <radialGradient id="vig-${uid}" cx=".5" cy=".42" r=".9">
        <stop offset=".62" stop-color="rgba(16,10,36,0)"/><stop offset="1" stop-color="rgba(16,10,36,${reg >= 3 ? .38 : .2})"/></radialGradient></defs>
      ${sky(o.world || 'meadow', o.mood || 'happy', W, H, reg, uid)}
      ${clouds(W, H, reg, (o.seed || 1) * 3 + 1, uid)}
      ${ground(o.world || 'meadow', W, H, reg)}
      ${fig}
      ${particles(o.world || 'meadow', W, H, (o.seed || 1) * 7 + 3, reg, uid)}
      <rect width="${W}" height="${H}" fill="url(#vig-${uid})"/>
      ${bars}`;
  }

  /* ---- round portrait chip: bokeh disc + rim-lit bust, for margins,
     dialogue labels and cast pages ---- */
  function portrait(avId, sizePt, opts) {
    opts = opts || {};
    const pal = palette(avId);
    const uid = 'pt' + avId.replace(/[^a-z0-9]/gi, '') + (opts.k || '');
    const art = avId === 'bizzy' ? bizzyInner(uid) : (AV()[avId] || '');
    return `<svg viewBox="0 0 120 120" style="width:${sizePt};height:${sizePt};flex-shrink:0${opts.style || ''}" aria-hidden="true">
      <defs>${filters(uid)}
        <radialGradient id="pg-${uid}" cx=".38" cy=".3" r="1"><stop offset="0" stop-color="${mix(pal.glow, '#FFFFFF', .3)}"/><stop offset=".62" stop-color="${rgba(pal.a, .5)}"/><stop offset="1" stop-color="${mix(pal.b, '#241E33', .35)}"/></radialGradient>
        <clipPath id="pc-${uid}"><circle cx="60" cy="60" r="57"/></clipPath></defs>
      <circle cx="60" cy="60" r="57" fill="url(#pg-${uid})"/>
      <g clip-path="url(#pc-${uid})">
        <circle cx="30" cy="30" r="12" fill="rgba(255,255,255,.35)" filter="url(#bl6-${uid})"/>
        <circle cx="92" cy="42" r="8" fill="rgba(255,255,255,.28)" filter="url(#bl6-${uid})"/>
        <circle cx="82" cy="96" r="14" fill="${rgba(pal.b, .3)}" filter="url(#bl6-${uid})"/>
        <g transform="translate(60 64) scale(.92) translate(-60 -60)">${art}</g>
        <path d="M22 40 A 44 44 0 0 1 62 16" stroke="rgba(255,255,255,.7)" stroke-width="3" fill="none" stroke-linecap="round" filter="url(#bl2-${uid})"/>
      </g>
      <circle cx="60" cy="60" r="57" fill="none" stroke="${rgba(pal.a, .9)}" stroke-width="3"/>
      <circle cx="60" cy="60" r="52.5" fill="none" stroke="rgba(255,255,255,.55)" stroke-width="1.4"/></svg>`;
  }

  /* ---- Vex, grown up: a sleek wisteria-toned moth with lantern eyes,
     ragged wing trailing dust. Reads as a real antagonist, not a doodle. ---- */
  function vex(sizePt, opts) {
    opts = opts || {};
    const uid = 'vx' + (opts.k || '');
    return `<svg viewBox="0 0 120 120" style="width:${sizePt};height:${sizePt};flex-shrink:0${opts.style || ''}" aria-hidden="true">
      <defs>${filters(uid)}
        <linearGradient id="vw-${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6B4FC4"/><stop offset="1" stop-color="#2C2150"/></linearGradient>
        <linearGradient id="vb-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#463672"/><stop offset="1" stop-color="#1E1738"/></linearGradient></defs>
      <circle cx="60" cy="62" r="44" fill="rgba(90,63,166,.28)" filter="url(#bl14-${uid})"/>
      <g>
        <path d="M56 52 Q30 24 12 30 Q10 52 30 64 Q18 66 14 78 Q30 88 46 76 Z" fill="url(#vw-${uid})"/>
        <path d="M64 52 Q90 24 108 30 Q110 52 90 64 Q102 66 106 78 Q90 88 74 76 Z" fill="url(#vw-${uid})"/>
        <path d="M30 64 l-6 8 M90 64 l6 8" stroke="#241E33" stroke-width="2" opacity=".5"/>
        <path d="M14 78 q-4 8 -2 14 M106 78 q4 8 2 14" stroke="rgba(203,180,242,.55)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
        <ellipse cx="60" cy="66" rx="14" ry="26" fill="url(#vb-${uid})"/>
        <path d="M60 44 Q52 30 42 26 M60 44 Q68 30 78 26" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="42" cy="25" r="3" fill="#CBB4F2"/><circle cx="78" cy="25" r="3" fill="#CBB4F2"/>
        <circle cx="60" cy="50" r="12" fill="#31265A"/>
        <path d="M51 47 l7 3.4 M69 47 l-7 3.4" stroke="#FFB36B" stroke-width="3.4" stroke-linecap="round"/>
        <circle cx="55" cy="51.4" r="2" fill="#FFD9A6"/><circle cx="65" cy="51.4" r="2" fill="#FFD9A6"/>
        <path d="M55 58 q5 -3.4 10 0" stroke="#E8546A" stroke-width="2.6" fill="none" stroke-linecap="round"/>
        <path d="M46 70 q-8 4 -10 10 M74 70 q8 4 10 10" stroke="#31265A" stroke-width="3" fill="none" stroke-linecap="round"/>
        <path d="M60 92 q-2 8 0 12" stroke="rgba(203,180,242,.5)" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="1 5"/>
      </g></svg>`;
  }

  /* ================= v2: full-page cinema =================
     The feedback that built this: panels must BLEND, not box; text must sit in
     clear sky, never on the character; pages must be full; covers must be
     dense, layered and alive. */

  /* Vex's inner art, for compositing INSIDE larger scenes */
  function vexInner(uid, s) {
    s = s || 1;
    return `<g transform="scale(${s})">
      <circle cx="60" cy="62" r="44" fill="rgba(90,63,166,.3)" filter="url(#bl14-${uid})"/>
      <path d="M56 52 Q30 24 12 30 Q10 52 30 64 Q18 66 14 78 Q30 88 46 76 Z" fill="#4A3690"/>
      <path d="M64 52 Q90 24 108 30 Q110 52 90 64 Q102 66 106 78 Q90 88 74 76 Z" fill="#4A3690"/>
      <path d="M56 52 Q34 30 16 32 Q30 48 38 58 Z M64 52 Q86 30 104 32 Q90 48 82 58 Z" fill="#6B4FC4" opacity=".7"/>
      <path d="M14 78 q-4 8 -2 14 M106 78 q4 8 2 14" stroke="rgba(203,180,242,.55)" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 6"/>
      <ellipse cx="60" cy="66" rx="14" ry="26" fill="#2C2150"/>
      <ellipse cx="56" cy="60" rx="6" ry="16" fill="#463672" opacity=".8"/>
      <path d="M60 44 Q52 30 42 26 M60 44 Q68 30 78 26" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="42" cy="25" r="3" fill="#CBB4F2"/><circle cx="78" cy="25" r="3" fill="#CBB4F2"/>
      <circle cx="60" cy="50" r="12" fill="#31265A"/>
      <path d="M51 47 l7 3.4 M69 47 l-7 3.4" stroke="#FFB36B" stroke-width="3.4" stroke-linecap="round"/>
      <circle cx="55" cy="51.4" r="2" fill="#FFD9A6"/><circle cx="65" cy="51.4" r="2" fill="#FFD9A6"/>
      <path d="M55 58 q5 -3.4 10 0" stroke="#E8546A" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`;
  }

  /* colored mid-ground environments: each world gets signature props with
     two-tone cel shading, drawn at the horizon so figures stand among them */
  function env(world, W, H, gy, reg, uid, seed) {
    const rnd = mulberry((seed || 1) * 13 + 5);
    const dim = reg >= 3 ? .55 : reg === 2 ? .8 : 1;
    const cel = (c, f) => mix(c, '#241E33', 1 - dim * (f == null ? 1 : f));
    const flower = (x, s, c1) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <path d="M0 0 L0 -34" stroke="${cel('#4E9A5C')}" stroke-width="5" stroke-linecap="round"/>
      <path d="M0 -18 Q12 -22 14 -30 Q4 -30 0 -24 Z" fill="${cel('#4E9A5C')}"/>
      ${[0, 60, 120, 180, 240, 300].map(a => `<ellipse transform="rotate(${a} 0 -40)" cx="0" cy="-52" rx="8" ry="13" fill="${cel(c1)}"/>`).join('')}
      <circle cy="-40" r="8" fill="${cel('#FFD66B')}"/><circle cy="-42" cx="-2" r="3" fill="rgba(255,255,255,.7)"/></g>`;
    const shroom = (x, s) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <rect x="-7" y="-22" width="14" height="22" rx="6" fill="${cel('#F2E4C8')}"/>
      <path d="M-24 -20 Q0 -46 24 -20 Q0 -28 -24 -20 Z" fill="${cel('#E8546A')}"/>
      <circle cx="-10" cy="-27" r="3.4" fill="rgba(255,255,255,.85)"/><circle cx="8" cy="-30" r="2.6" fill="rgba(255,255,255,.85)"/></g>`;
    const bookTower = (x, s) => `<g transform="translate(${x} ${gy}) scale(${s})">${[0, 1, 2, 3, 4].map(i =>
      `<rect x="${-26 + (i % 2) * 6 - 3}" y="${-16 - i * 15}" width="52" height="14" rx="3" fill="${cel(['#6C4FE0', '#E8458C', '#13A892', '#F0A93C', '#3E63D6'][i])}" transform="rotate(${(i % 2 ? -2 : 2)})"/>`).join('')}
      <path d="M-30 2 L34 2" stroke="${cel('#4A3AA0')}" stroke-width="4" stroke-linecap="round"/></g>`;
    const column = (x, s) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <rect x="-12" y="-74" width="24" height="74" fill="${cel('#EADFC8')}"/>
      <rect x="-9" y="-74" width="6" height="74" fill="rgba(255,255,255,.4)"/>
      <rect x="-18" y="-84" width="36" height="12" rx="3" fill="${cel('#D9C9A8')}"/>
      <rect x="-16" y="-4" width="32" height="8" rx="2" fill="${cel('#D9C9A8')}"/></g>`;
    const crystal = (x, s, c1) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <path d="M0 0 L-14 -10 L-4 -46 L8 -34 L12 -8 Z" fill="${cel(c1)}"/>
      <path d="M-4 -46 L8 -34 L2 -6 Z" fill="rgba(255,255,255,.35)"/></g>`;
    const spotlight = (x, flip2) => `<g transform="translate(${x} 0) scale(${flip2 ? -1 : 1} 1)">
      <path d="M0 0 L${W * .12} ${gy} L${W * .3} ${gy} Z" fill="rgba(255,246,214,.3)"/></g>`;
    const gear = (x, y2, r, c1) => `<g transform="translate(${x} ${y2})" fill="${cel(c1)}">${[0, 45, 90, 135].map(a => `<rect x="${-r - 6}" y="-5" width="${2 * r + 12}" height="10" rx="3" transform="rotate(${a})"/>`).join('')}<circle r="${r}"/><circle r="${r * .45}" fill="${cel('#241E33', .6)}"/></g>`;
    const lighthouse = (x, s) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <path d="M-12 0 L-8 -60 L8 -60 L12 0 Z" fill="${cel('#F2E8D8')}"/>
      <path d="M-10 -18 L10 -18 L11 -8 L-11 -8 Z M-9 -40 L9 -40 L10 -30 L-10 -30 Z" fill="${cel('#E8546A')}"/>
      <rect x="-8" y="-72" width="16" height="12" rx="3" fill="${cel('#FFD66B')}"/>
      <path d="M-8 -66 L-40 -78 L-40 -54 Z" fill="rgba(255,214,107,${.25 * dim})"/></g>`;
    const boat = (x, s) => `<g transform="translate(${x} ${gy - 4}) scale(${s})">
      <path d="M0 0 L0 -30" stroke="${cel('#8A5B00')}" stroke-width="3"/>
      <path d="M0 -30 L20 -4 L0 -4 Z" fill="${cel('#FFF6DE')}"/><path d="M0 -22 L-13 -4 L0 -4 Z" fill="${cel('#E8E0D0')}"/>
      <path d="M-14 0 Q0 10 14 0 Z" fill="${cel('#C43D5A')}"/></g>`;
    const neon = (x, y2, r, c1) => `<g transform="translate(${x} ${y2})" fill="none">${[r, r * .62, r * .3].map((rr, i) => `<circle r="${rr}" stroke="${cel(c1)}" stroke-width="4" opacity="${.5 + i * .2}"/>`).join('')}</g>`;
    const banner2 = (x, s, c1) => `<g transform="translate(${x} ${gy}) scale(${s})">
      <line y2="-64" stroke="${cel('#8A7458')}" stroke-width="4"/>
      <path d="M0 -64 L36 -54 L0 -44 Z" fill="${cel(c1)}"/></g>`;
    const crane2 = (x, y2, s) => `<g transform="translate(${x} ${y2}) scale(${s}) rotate(${rnd() * 20 - 10})">
      <path d="M-16 4 L0 -12 L16 4 L4 4 L0 16 L-4 4 Z" fill="${cel('#FFF6EE')}"/><path d="M0 -12 L6 -2 L-2 -2 Z" fill="${cel('#E8546A')}"/></g>`;
    const E = {
      meadow: () => flower(W * .1, 1.1, '#FF9EBB') + shroom(W * .22, .9) + flower(W * .88, 1.3, '#B9A6FF') + flower(W * .95, .8, '#FFD66B') + shroom(W * .8, .7),
      library: () => bookTower(W * .12, 1) + bookTower(W * .9, 1.2) + crane2(W * .3, H * .2, 1),
      forum: () => column(W * .08, 1) + column(W * .2, .8) + column(W * .86, 1.1) + column(W * .96, .85),
      elements: () => crystal(W * .1, 1.2, '#7FB2E8') + crystal(W * .18, .8, '#B9A6FF') + crystal(W * .9, 1.4, '#9FE7D6') + crystal(W * .82, .9, '#FF9EBB'),
      stage: () => spotlight(W * .06) + spotlight(W * .94, true) + `<g transform="translate(${W * .9} ${gy})"><line y2="-46" stroke="${cel('#8A83A3')}" stroke-width="4"/><circle cy="-52" r="8" fill="${cel('#241E33', .7)}"/><path d="M-12 0 L12 0" stroke="${cel('#8A83A3')}" stroke-width="4" stroke-linecap="round"/></g>`,
      engine: () => gear(W * .1, gy - 26, 24, '#C08A3E') + gear(W * .2, gy - 10, 15, '#8A7458') + gear(W * .9, gy - 30, 28, '#C08A3E') + `<path d="M0 ${gy - 6} H ${W * .16}" stroke="${cel('#8A7458')}" stroke-width="8"/>`,
      origami: () => crane2(W * .12, gy - 30, 1.6) + crane2(W * .88, gy - 50, 1.2) + crane2(W * .8, gy - 14, .9) + `<path d="M${W * .05} ${gy} L${W * .12} ${gy - 44} L${W * .2} ${gy} Z" fill="${cel('#FFF6EE')}"/>`,
      strait: () => lighthouse(W * .09, 1.1) + boat(W * .86, 1) + `<path d="M0 ${gy - 6} ${Array.from({ length: 6 }, (_, i) => `Q ${W * (i + .5) / 6} ${gy - 14} ${W * (i + 1) / 6} ${gy - 6}`).join(' ')}" stroke="rgba(255,255,255,.4)" stroke-width="3" fill="none"/>`,
      junkyard: () => `<g transform="translate(${W * .1} ${gy})">${[0, 1, 2].map(i => `<circle cx="${i * 10 - 10}" cy="${-8 - i * 12}" r="13" fill="none" stroke="${cel('#4C566B')}" stroke-width="6"/>`).join('')}</g>` + banner2(W * .9, 1, '#E8546A') + `<rect x="${W * .8}" y="${gy - 26}" width="40" height="26" rx="5" fill="${cel('#8A6E52')}" transform="rotate(-6 ${W * .8} ${gy - 26})"/>`,
      vibe: () => neon(W * .1, gy - 40, 26, '#E8458C') + neon(W * .9, gy - 56, 32, '#B14FC4') + `<g>${[0, 1, 2, 3].map(i => `<rect x="${W * .82 + i * 12}" y="${gy - 14 - (i % 2) * 10}" width="7" height="${14 + (i % 2) * 10}" rx="3" fill="${cel('#FFD66B')}"/>`).join('')}</g>`,
      warfield: () => banner2(W * .08, 1.2, '#F0B429') + banner2(W * .92, 1, '#D6353F') + `<path d="M${W * .8} ${gy} L${W * .86} ${gy - 30} L${W * .92} ${gy} Z" fill="${cel('#8A7458')}"/>`,
      greysea: () => `<g transform="translate(${W * .12} ${gy - 8})"><path d="M0 8 Q0 -6 10 -10 Q20 -6 20 8 Z" fill="${cel('#E8546A')}"/><line x1="10" y1="-10" x2="10" y2="-22" stroke="${cel('#8A83A3')}" stroke-width="3"/><circle cx="10" cy="-24" r="4" fill="${cel('#FFD66B')}"/></g>` + lighthouse(W * .9, .9),
    };
    return (E[world] || E.meadow)();
  }

  /* soft depth cue at the BOTTOM corners only — blurred foreground mounds.
     (Free-floating side leaves read as smudges at print size; cut.) */
  function edgeFoliage(W, H, uid, reg) {
    const c = reg >= 3 ? 'rgba(10,7,26,.6)' : 'rgba(24,16,52,.35)';
    return `<ellipse cx="0" cy="${H}" rx="${W * .26}" ry="${H * .05}" fill="${c}" filter="url(#bl14-${uid})"/>`
      + `<ellipse cx="${W}" cy="${H}" rx="${W * .24}" ry="${H * .045}" fill="${c}" filter="url(#bl14-${uid})"/>`;
  }

  /* floating letter tiles — the word-confetti that fills a cover with language */
  function letterField(text, W, H, seed, uid, n) {
    const rnd = mulberry(seed * 7 + 3);
    const AZ = (String(text || 'BIZZING BEE').toUpperCase().replace(/[^A-Z]/g, '') + 'AEIOSTRNL').slice(0, 26);
    let out = '';
    for (let i = 0; i < (n || 22); i++) {
      const L = AZ[Math.floor(rnd() * AZ.length)];
      const x = W * (.04 + rnd() * .92), y = H * (.05 + rnd() * .85);
      const s = .5 + rnd() * 1.1, a = rnd() * 40 - 20, far = rnd() < .3;
      out += `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})" opacity="${far ? .4 : .85}" ${far ? `filter="url(#bl2-${uid})"` : ''}>
        <rect x="-15" y="-15" width="30" height="30" rx="7" fill="rgba(255,255,255,.92)"/>
        <rect x="-15" y="8" width="30" height="7" rx="3" fill="rgba(36,30,51,.14)"/>
        <text y="8" text-anchor="middle" font-family="Baloo 2, BB Display, sans-serif" font-weight="800" font-size="22" fill="#241E33">${L}</text></g>`;
    }
    return out;
  }

  /* speed/motion lines behind an action figure */
  function motionLines(x, y, size, ang, uid) {
    return `<g transform="translate(${x} ${y}) rotate(${ang || -18})" stroke="rgba(255,255,255,.55)" stroke-linecap="round" filter="url(#bl2-${uid})">
      ${[-.3, -.1, .12, .3].map((f, i) => `<line x1="${-size * (0.7 + (i % 2) * .3)}" y1="${size * f}" x2="${-size * .34}" y2="${size * f}" stroke-width="${3 + (i % 2) * 2}"/>`).join('')}</g>`;
  }

  /* ---------- the full-page storyboard: one continuous canvas ----------
     No boxes. One sky that morphs through the moods of the four moments,
     soft radial mood-washes blending into each other, one ground, a winding
     dotted path connecting the moments, captions floating in CLEAR sky on
     the opposite side of each figure. */
  function storyboard(scenes, o) {
    const W = o.W || 725, H = o.H || 880, uid = o.uid || 'sb', reg = o.reg || 1;
    const world = o.world || 'meadow';
    const gy = H * .93;
    const stops = scenes.map((sc, i) => {
      const key = skyKey(sc.mood || 'happy', reg);
      return { off: (i / Math.max(1, scenes.length - 1)) * .88 + .04, c: SKIES[key][1], deep: SKIES[key][2], key };
    });
    const anyNight = stops.some(s => s.key === 'night');
    const grad = `<linearGradient id="mega-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${stops[0].c}"/>
      ${stops.map(s => `<stop offset="${s.off}" stop-color="${s.c}"/>`).join('')}
      <stop offset="1" stop-color="${stops[stops.length - 1].deep}"/></linearGradient>`;
    const spots = scenes.map((sc, i) => {
      const t = i / Math.max(1, scenes.length - 1);
      const y = H * (.1 + t * .74);
      const left = i % 2 === 1;
      return { x: W * (left ? .2 : .78), y, left };
    });
    const path = `<path d="M ${spots.map(s => `${s.x} ${s.y + 60}`).join(' L ')}" stroke="rgba(255,255,255,.5)" stroke-width="4" stroke-dasharray="1 14" stroke-linecap="round" fill="none" filter="url(#bl2-${uid})"/>`;
    const stars = anyNight ? Array.from({ length: 20 }, (_, i) => { const r = mulberry(i * 31 + 3)();
      return `<circle cx="${(i * 83 % 100) / 100 * W}" cy="${H * (.3 + (i * 47 % 55) / 100)}" r="${1 + r * 1.4}" fill="#FFF" opacity="${.3 + r * .4}"/>`; }).join('') : '';
    let body = '';
    scenes.forEach((sc, i) => {
      const p = spots[i];
      const washR = H * .24;
      body += `<radialGradient id="wash-${uid}-${i}" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="${rgba(stops[i].deep, .5)}"/><stop offset="1" stop-color="${rgba(stops[i].deep, 0)}"/></radialGradient>
        <ellipse cx="${p.x}" cy="${p.y}" rx="${washR * 1.5}" ry="${washR}" fill="url(#wash-${uid}-${i})"/>`;
      if (sc.vex) body += `<g transform="translate(${p.x - 60} ${p.y - 66})">${vexInner(uid, 1.05)}</g>`
        + `<g transform="translate(${p.x + 10} ${p.y + 10})">${motionLines(0, 0, 60, 160, uid)}</g>`;
      else if (sc.avId) body += (sc.mood === 'excited' ? motionLines(p.x, p.y, 120, p.left ? 160 : -18, uid) : '')
        + figure(sc.avId, p.x, p.y, 128, { uid, flip: !p.left });
    });
    const sun = reg >= 3 || anyNight
      ? `<circle cx="${W * .84}" cy="${H * .05}" r="26" fill="#F4EBD0"/><circle cx="${W * .84 - 9}" cy="${H * .05 - 4}" r="20" fill="${stops[0].c}"/>`
      : `<circle cx="${W * .84}" cy="${H * .06}" r="30" fill="#FFF6DE"/><circle cx="${W * .84}" cy="${H * .06}" r="52" fill="#FFE9AE" opacity=".3" filter="url(#bl6-${uid})"/>${rays(W * .84, H * .06, W, H * .5, uid)}`;
    return `<defs>${filters(uid)}${grad}</defs>
      <rect width="${W}" height="${H}" fill="url(#mega-${uid})"/>
      ${stars}${sun}
      ${clouds(W, H * .5, reg, (o.seed || 1) * 3 + 1, uid)}
      ${body}
      ${ground(world, W, H * 1.1625, reg) /* internal horizon lands at .93H */}
      ${env(world, W, H, gy, reg, uid, o.seed)}
      ${particles(world, W, H, (o.seed || 1) * 7 + 3, reg, uid)}
      ${edgeFoliage(W, H, uid, reg)}`;
  }

  /* ---------- the ensemble cover scene: hero + crew in action ---------- */
  function ensemble(o) {
    const W = o.W || 816, H = o.H || 1056, uid = o.uid || 'en', reg = o.reg || 1;
    const world = o.world || 'meadow'; const gy = H * .82;
    const heroId = o.hero || 'bizzy';
    const crew = o.crew || [];
    const key = o.skyKey || (reg >= 3 ? 'dusk' : 'gold');
    const c = SKIES[key];
    const grad = `<linearGradient id="cvsky-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c[0]}"/><stop offset=".38" stop-color="${c[1]}"/>
      <stop offset=".7" stop-color="${c[2]}"/><stop offset="1" stop-color="${c[3]}"/></linearGradient>`;
    const sunX = W * .5, sunY = H * .34;
    const stars2 = key === 'night' || key === 'dusk' ? Array.from({ length: 24 }, (_, i) => { const r = mulberry(i * 37 + 9)();
      return `<circle cx="${(i * 89 % 100) / 100 * W}" cy="${(i * 61 % 42) / 100 * H}" r="${1 + r * 1.8}" fill="#FFF" opacity="${.3 + r * .5}"/>`; }).join('') : '';
    const crewFigs = crew.map((id, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const depth = i < 2 ? 1 : .78;
      const fx = W * .5 + side * W * (.28 + (i >> 1) * .1);
      const fy = gy - 60 - (i >> 1) * H * .07 - (i % 2) * 26;
      return figure(id, fx, fy, 190 * depth, { uid, flip: side > 0 });
    }).join('');
    return `<defs>${filters(uid)}${grad}</defs>
      <rect width="${W}" height="${H}" fill="url(#cvsky-${uid})"/>
      ${stars2}
      <circle cx="${sunX}" cy="${sunY}" r="${W * .12}" fill="#FFF6DE" opacity=".9"/>
      <circle cx="${sunX}" cy="${sunY}" r="${W * .22}" fill="#FFE9AE" opacity=".22" filter="url(#bl14-${uid})"/>
      ${rays(sunX, sunY, W, H, uid)}
      ${clouds(W, H * .55, reg, (o.seed || 2) * 5 + 1, uid)}
      ${ground(world, W, H, reg)}
      ${env(world, W, H, gy, reg, uid, o.seed)}
      ${letterField(o.title, W, H * .92, (o.seed || 2) * 11 + 4, uid, 24)}
      ${crewFigs}
      ${motionLines(W * .5, H * .6, 210, -14, uid)}
      ${figure(heroId, W * .5, H * .6, 330, { uid, rot: -6 })}
      ${o.vex ? `<g transform="translate(${W * .84} ${H * .2}) scale(1.1)">${vexInner(uid)}</g>` : ''}
      ${particles(world, W, H, (o.seed || 2) * 7 + 5, reg, uid)}
      ${edgeFoliage(W, H, uid, reg)}
      <rect width="${W}" height="${H}" fill="url(#vig2-${uid})"/>
      <radialGradient id="vig2-${uid}" cx=".5" cy=".45" r=".85">
        <stop offset=".6" stop-color="rgba(16,10,36,0)"/><stop offset="1" stop-color="rgba(16,10,36,${reg >= 3 ? .42 : .26})"/></radialGradient>`;
  }

  root.BB_ANIME = { palette, filters, sky, rays, clouds, particles, ground, figure, plate, portrait, vex, vexInner,
    env, edgeFoliage, letterField, motionLines, storyboard, ensemble, mix, rgba };
})();

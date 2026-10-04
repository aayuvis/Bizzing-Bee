/* THE STAGE CHECKS (games spec §5.0 T14 / T15, §8 T11) — one helper every game on
   SGUI.stage calls on its own screen, so a hub, Word Forge or Daily Bee is held to the same
   measured rules without copying them.

     const SC = require('./lib/stage-check.cjs');
     const g = await SC.geometry(pg);   // T15 + T11: symmetry, scroll, controls, keys
     const p = await SC.pixels(pg);     // T14: flat-colour regions, pure white, pure black
     SC.report(ok, 'gym hub · phone · dusk', g, p, {play:true});

   GEOMETRY (T15), measured on screen inside the first .sb-stage (SGUI.stage):
     hud      — the left and right HUD stats are the same width (≤ 4px apart) and the
                centre title sits on the stage's centre line (≤ 4px)
     gutters  — the play region's left and right gutters agree (≤ 4px), and so do the
                controls row's
     scroll   — the page does not scroll during play (scrolling it to the end moves it ≤ 1px)
     tabbar   — no control (button, input, key) ends below the top of the tab bar or
                below the window
     thumb    — on a phone (stage ≤ 640 CSS px wide) the controls sit in the stage's
                bottom 38%
     keys     — every on-screen key (.sg-key) is at least 40 × 40 px on screen (T11)
   PIXELS (T14), from a screenshot of the stage decoded in the page:
     flat     — the largest connected region of 8px cells that are each one flat colour
                (every channel within 4 levels) and agree with their neighbours is at most
                6% of the stage: a painted plate is never a flat fill
     white    — pure white (all channels ≥ 254) covers at most 2%
     black    — pure black (all channels ≤ 1) covers at most 2%
   Every number comes back, so a failing line can say what it measured. */
'use strict';
const STILL = '*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';

async function geometry(pg) {
  return pg.evaluate(() => {
    const st = document.querySelector('.sb-stage'); if (!st) return { none: true };
    const R = e => e.getBoundingClientRect();
    const s = R(st), out = { stage: { x: s.left, y: s.top, w: s.width, h: s.height } };
    const zoom = parseFloat(getComputedStyle(document.getElementById('root') || document.body).zoom) || 1;
    out.phone = s.width / zoom <= 640;
    const l = st.querySelector('.sg-st-side.l .sg-st-stat'), r = st.querySelector('.sg-st-side.r .sg-st-stat'), c = st.querySelector('.sg-st-c');
    out.hudL = l ? R(l).width : 0; out.hudR = r ? R(r).width : 0;
    out.hudSides = { l: l ? R(l).left - s.left : null, r: r ? s.right - R(r).right : null };
    const ct = c && (c.firstElementChild || c); out.centre = ct ? (R(ct).left + R(ct).width / 2) - (s.left + s.width / 2) : null;
    const reg = st.querySelector('.sg-st-region'); if (reg) { const g = R(reg); out.gutL = g.left - s.left; out.gutR = s.right - g.right; out.region = { w: g.width, h: g.height }; }
    const ctl = st.querySelector('.sg-st-ctl'); const cr = ctl && ctl.children.length && getComputedStyle(ctl).display !== 'none' ? R(ctl) : null;
    if (cr) { const kids = [...ctl.querySelectorAll('button,input,.sg-key')].filter(e => e.getClientRects().length);
      if (kids.length) { const lx = Math.min(...kids.map(k => R(k).left)), rx = Math.max(...kids.map(k => R(k).right)); out.ctlL = lx - s.left; out.ctlR = s.right - rx; }
      out.ctlTop = cr.top - s.top; }
    /* behaviour, not box sizes: try to scroll the page and see whether it moved */
    const y0 = scrollY; scrollTo(0, 1e5); out.scroll = scrollY - y0; scrollTo(0, y0);
    const tb = document.querySelector('.sb-tabbar'); const tbTop = tb && getComputedStyle(tb).display !== 'none' ? R(tb).top : innerHeight;
    out.tabTop = tbTop;
    out.under = [...st.querySelectorAll('button,input,.sg-key')].filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden')
      .filter(e => R(e).bottom > Math.min(tbTop, innerHeight) + 0.5).map(e => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 24));
    const keys = [...document.querySelectorAll('.sg-key')].filter(e => e.getClientRects().length);
    out.keys = keys.length; out.keyMin = keys.length ? Math.min(...keys.map(k => Math.min(R(k).width, R(k).height))) : null;
    return out;
  });
}

async function pixels(pg) {
  const rect = await pg.evaluate(() => { const s = document.querySelector('.sb-stage'); if (!s) return null; const r = s.getBoundingClientRect();
    return { x: Math.max(0, r.left), y: Math.max(0, r.top), width: Math.min(innerWidth, r.right) - Math.max(0, r.left), height: Math.min(innerHeight, r.bottom) - Math.max(0, r.top) }; });
  if (!rect || rect.width < 10 || rect.height < 10) return { none: true };
  const css = await pg.addStyleTag({ content: STILL });
  await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const png = await pg.screenshot({ clip: rect });
  await css.evaluate(e => e.remove());
  return pg.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const W = img.naturalWidth, H = img.naturalHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0); const d = cx.getImageData(0, 0, W, H).data;
    let white = 0, black = 0; const N = W * H;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r >= 254 && g >= 254 && b >= 254) white++; else if (r <= 1 && g <= 1 && b <= 1) black++; }
    const C = 8, cw = Math.floor(W / C), ch = Math.floor(H / C), flat = new Int8Array(cw * ch), mean = new Float32Array(cw * ch * 3);
    for (let cy = 0; cy < ch; cy++) for (let cxx = 0; cxx < cw; cxx++) {
      let mn = [255, 255, 255], mx = [0, 0, 0], sm = [0, 0, 0];
      for (let y = cy * C; y < cy * C + C; y++) for (let x = cxx * C; x < cxx * C + C; x++) { const i = (y * W + x) * 4;
        for (let k = 0; k < 3; k++) { const v = d[i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; sm[k] += v; } }
      const id = cy * cw + cxx; flat[id] = (mx[0] - mn[0] <= 4 && mx[1] - mn[1] <= 4 && mx[2] - mn[2] <= 4) ? 1 : 0;
      for (let k = 0; k < 3; k++) mean[id * 3 + k] = sm[k] / (C * C); }
    const seen = new Uint8Array(cw * ch); let best = 0, bestAt = null;
    const near = (a, b) => Math.abs(mean[a * 3] - mean[b * 3]) <= 4 && Math.abs(mean[a * 3 + 1] - mean[b * 3 + 1]) <= 4 && Math.abs(mean[a * 3 + 2] - mean[b * 3 + 2]) <= 4;
    for (let s = 0; s < cw * ch; s++) { if (!flat[s] || seen[s]) continue;
      let n = 0; const q = [s]; seen[s] = 1;
      while (q.length) { const a = q.pop(); n++; const ax = a % cw, ay = (a / cw) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const bx = ax + dx, by = ay + dy; if (bx < 0 || by < 0 || bx >= cw || by >= ch) continue;
          const b = by * cw + bx; if (flat[b] && !seen[b] && near(a, b)) { seen[b] = 1; q.push(b); } } }
      if (n > best) { best = n; bestAt = { x: (s % cw) * C, y: ((s / cw) | 0) * C, rgb: [0, 1, 2].map(k => Math.round(mean[s * 3 + k])) }; } }
    return { w: W, h: H, white: white / N, black: black / N, flat: best / (cw * ch), flatAt: bestAt };
  }, png.toString('base64'));
}

/* Turn the measurements into OK/FAIL lines. opts.play: the screen is in play (no scroll). */
function report(ok, label, g, p, opts) {
  opts = opts || {}; const f = n => (n == null ? '—' : Math.round(n * 10) / 10);
  if (g) {
    ok(!g.none, `${label}: a .sb-stage is on screen`);
    if (g.none) return;
    ok(Math.abs(g.hudL - g.hudR) <= 4, `${label}: HUD stats are the same width (${f(g.hudL)} / ${f(g.hudR)}px)`);
    if (g.hudSides.l != null && g.hudSides.r != null) ok(Math.abs(g.hudSides.l - g.hudSides.r) <= 4, `${label}: HUD stats sit the same distance from each edge (${f(g.hudSides.l)} / ${f(g.hudSides.r)}px)`);
    ok(g.centre != null && Math.abs(g.centre) <= 4, `${label}: the title is on the centre line (${f(g.centre)}px off)`);
    if (g.gutL != null) ok(Math.abs(g.gutL - g.gutR) <= 4, `${label}: play gutters are equal (${f(g.gutL)} / ${f(g.gutR)}px)`);
    if (g.ctlL != null) ok(Math.abs(g.ctlL - g.ctlR) <= 4, `${label}: the controls are centred (${f(g.ctlL)} / ${f(g.ctlR)}px)`);
    if (opts.play !== false) ok(g.scroll <= 1, `${label}: no vertical scroll (${f(g.scroll)}px over)`);
    ok(!g.under.length, `${label}: no control under the tab bar or below the fold` + (g.under.length ? ' — ' + g.under.join(', ') : ''));
    if (g.phone && g.ctlTop != null) ok(g.ctlTop >= g.stage.h * 0.62 - 1, `${label}: phone controls sit in the bottom 38% (from ${f(g.ctlTop / g.stage.h * 100)}%)`);
    if (g.keys) ok(g.keyMin >= 40, `${label}: ${g.keys} keys, the smallest ${f(g.keyMin)}px (≥ 40)`);
  }
  if (p) {
    ok(!p.none, `${label}: the stage could be photographed`);
    if (p.none) return;
    ok(p.flat <= 0.06, `${label}: no flat-colour region over 6% (largest ${f(p.flat * 100)}%${p.flatAt ? ' at ' + p.flatAt.x + ',' + p.flatAt.y + ' rgb(' + p.flatAt.rgb + ')' : ''})`);
    ok(p.white <= 0.02, `${label}: pure white ≤ 2% (${f(p.white * 100)}%)`);
    ok(p.black <= 0.02, `${label}: pure black ≤ 2% (${f(p.black * 100)}%)`);
  }
}
module.exports = { geometry, pixels, report, STILL };

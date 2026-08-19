/* shotrender.js — turns one shot object into DOM.
 *
 * Loaded by shot.html. The renderer calls window.SHOT(obj) and then steps
 * document.getAnimations() frame by frame, so nothing here may depend on wall-clock
 * time, setTimeout or requestAnimationFrame — every moving thing must be a CSS
 * animation, or it will not appear in the render at all.
 */
const IMG = '../images/';
const $ = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function hexbed(stage) {
  stage.appendChild($('<div class="hexbed"></div>'));
  stage.appendChild($('<div class="glow"></div>'));
}

/* Ken Burns. The plate is pre-scaled by (1+push) and animates back to 1, so we only ever
 * scale DOWN — starting at 1 and pushing past it would upscale a 2K plate and soften it. */
function plate(stage, sh) {
  const push = sh.push || 0;
  const fit = sh.fit === 'contain' ? ' class="contain"' : '';
  const org = { left: '18% 50%', right: '82% 50%', center: '50% 50%' }[sh.from || 'center'];
  const kb = $(`<div class="kb"><img src="${IMG}${esc(sh.src)}"${fit}></div>`);
  stage.appendChild(kb);
  if (push > 0) {
    kb.style.transformOrigin = org;
    kb.animate([{ transform: `scale(${1 + push})` }, { transform: 'scale(1)' }],
      { duration: sh.dur * 1000, easing: 'linear', fill: 'both' });
  }
}

/* A1/A2/A3 — the letter drop. Each letter is its own <span> with a stagger, so the
 * assertion can read the assembled string out of the DOM. That check is the one that
 * matters most in this film: a spelling channel misspelling a word on screen. */
function spell(stage, sh) {
  hexbed(stage);
  const row = $('<div id="word"></div>');
  const chars = sh.word.split('');
  /* Size to the WORD, not to a constant. Fraunces 800 caps run ~0.68em of advance, so a
     9-letter word at a flat 150px filled barely a third of the frame — feeble for the
     shot the film exists for. Solve for a 1400px target and cap it so KNACK does not
     become a billboard. */
  const size = Math.min(240, Math.floor(1400 / (chars.length * 0.68)));
  row.style.setProperty('--sz', size + 'px');
  chars.forEach((c, i) => {
    const s = document.createElement('span');
    s.textContent = (sh.wrong && i === sh.wrong.i) ? sh.wrong.ch : c;
    s.dataset.ch = s.textContent;
    if (sh.wrong && i === sh.wrong.i) s.className = 'wrong';
    if (sh.fix && i === sh.fix.i) s.className = 'fix';
    s.style.animationDelay = (0.16 * i) + 's';
    row.appendChild(s);
  });
  stage.appendChild(row);
}

function card(stage, sh) {
  hexbed(stage);
  const c = $(`<div class="card">
    ${sh.kicker ? `<div class="kicker">${esc(sh.kicker)}</div>` : ''}
    <div class="line">${esc(sh.line || '')}</div>
    ${sh.sub ? `<div class="sub">${esc(sh.sub)}</div>` : ''}</div>`);
  stage.appendChild(c);
  c.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }],
    { duration: 700, easing: 'cubic-bezier(.2,.9,.25,1)', fill: 'both' });
  if (sh.fade) c.animate([{ opacity: 1 }, { opacity: 1 }, { opacity: .12 }],
    { duration: sh.dur * 1000, easing: 'linear', fill: 'both' });
}

function swap(stage, sh) {
  hexbed(stage);
  const row = $('<div id="swap"></div>');
  const a = sh.a.split(''), b = sh.b.split('');
  a.forEach((ch, i) => {
    const s = document.createElement('span'); s.textContent = ch;
    if (b[i] !== ch || a.length !== b.length) { /* the letter that leaves */ }
    row.appendChild(s);
  });
  // mark the first index where they diverge — that is the letter that falls out
  let d = 0; while (d < b.length && a[d] === b[d]) d++;
  if (row.children[d]) row.children[d].className = 'drop';
  stage.appendChild(row);
}

function cards(stage, sh) {
  hexbed(stage);
  const w = $('<div class="cards"></div>');
  sh.words.forEach((word, i) => {
    const c = $(`<div class="wc${sh.compare ? ' big' : ''}">${esc(word)}</div>`);
    c.style.animationDelay = (0.35 * i) + 's';
    w.appendChild(c);
  });
  stage.appendChild(w);
}

function count(stage, sh) {
  hexbed(stage);
  const box = $(`<div id="count"><div class="n">0</div><div class="l">${esc(sh.label || '')}</div></div>`);
  stage.appendChild(box);
  const n = box.querySelector('.n');
  // A counter cannot be a CSS animation, so it is BAKED: the renderer sets the frame's
  // value directly from progress. See renderer's onFrame hook.
  n.dataset.to = sh.to; n.dataset.prefix = sh.prefix || '';
}

function medal(stage, sh) {
  hexbed(stage);
  const m = $(`<img id="medal"${sh.ghost ? ' class="ghost"' : ''} src="${IMG}plate-medal.png">`);
  stage.appendChild(m);
}

function title(stage) {
  hexbed(stage);
  stage.appendChild($('<div id="t25"><s>1925</s></div>'));
  stage.appendChild($('<div id="t08">1908</div>'));
  stage.appendChild($('<div id="ttl">BEFORE THE BEE</div>'));
}

function outro(stage) {
  hexbed(stage);
  stage.appendChild($(`<div id="outro">
    <div class="brand"><i>Bizzing</i><span class="tm">&trade;</span> Bee</div>
    <div class="url">www.bizzingbee.com</div>
    <div class="ai">Illustrations and narration in this film are AI-generated.<br>
      Archive photographs are public domain — Library of Congress and Smithsonian.</div></div>`));
}

const KIND = { plate, spell, card, swap, cards, count, medal, title, outro, hold: (s) => hexbed(s) };

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
  const eased = 1 - Math.pow(1 - Math.min(1, p / 0.75), 3);   // settles before the shot ends
  n.textContent = pre + Math.round(to * eased).toLocaleString('en-US');
};

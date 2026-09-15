#!/usr/bin/env node
/* ============================================================================
   ASSET LIBRARY — viewer builder
   Reads build/manifest.json and emits ONE self-contained build/library.html.

   Self-contained on purpose: every thumbnail is a data: URI already, so the page
   opens from a file:// path, from a share, or from nowhere at all with no server
   and no network. A library you have to run a server to look at is a library
   nobody looks at.
   ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'build');
const man = JSON.parse(fs.readFileSync(path.join(OUT, 'manifest.json'), 'utf8'));

/* One row per asset, keys shortened because 6,274 of them ship in the page.
   r repo · p path · n name(global) · k kind · t thumb · s svg · b bytes
   w,h pixels · W wrapped-frame flag · a also-at · g big(bytes, markup shed) */
const rows = man.map(a => ({
  r: a.repo, p: a.rel, n: a.name || '', k: a.kind, t: a.thumb || '',
  s: a.svg || '', b: a.bytes || 0, w: a.w || 0, h: a.h || 0,
  W: a.wrapped ? 1 : 0, a: (a.alsoAt || []).slice(0, 6), g: a.big || 0,
  v: a.via || '',
}));

/* ORDER IS THE FIRST THING THE PAGE SAYS. Manifest order is filesystem order, which
   opens the library on export banners and c1.png — the least reusable things in it.
   Lead with what someone is actually hunting for: the art that only exists in code
   (it is both the finding and the most reusable), then vectors, then rasters; named
   before unnamed within each, so characters and icons sort above numbered exports. */
const SHAPE_RANK = { computed: 0, svg: 1, raster: 2 };
rows.sort((a, b) =>
  SHAPE_RANK[a.k] - SHAPE_RANK[b.k] ||
  (b.n ? 1 : 0) - (a.n ? 1 : 0) ||
  (a.n || a.p).localeCompare(b.n || b.p));

const repos = [...new Set(rows.map(r => r.r))].sort();
const n = k => rows.filter(r => r.k === k).length;
const stats = {
  total: rows.length, raster: n('raster'), svg: n('svg'), computed: n('computed'),
  repos: repos.map(r => ({ r, n: rows.filter(x => x.r === r).length })),
};

/* `</script>` inside JSON would end the tag early; escaping every `<` is the
   cheap, total fix and JSON.parse reads it back unchanged. */
const json = JSON.stringify(rows).replace(/</g, '\\u003c');

const HTML = `<title>Bizzing Art Library</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap">
<style>
:root{
  --ink:#241E4E; --ink-2:#4A4270; --ink-3:#7C759B;
  --paper:#FBFAF6; --surface:#FFFFFF; --surface-2:#F4F1E8; --line:#E2DCCD;
  --honey:#F0B429; --violet:#7C5CFF; --teal:#0E8A78; --pink:#E8458C;
  --accent:var(--violet);
  --shape-file:var(--teal); --shape-js:var(--honey); --shape-computed:var(--pink);
  --radius:10px;
  --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --sans:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --display:"Fraunces",Georgia,serif;
}
@media (prefers-color-scheme:dark){ :root:not([data-theme="light"]){
  --ink:#EDE9F7; --ink-2:#B9B2D4; --ink-3:#8A83A8;
  --paper:#15122B; --surface:#1E1A38; --surface-2:#272247; --line:#38315C;
  --honey:#F5C451; --violet:#9B84FF; --teal:#2FB39E; --pink:#FF6BA6;
}}
:root[data-theme="dark"]{
  --ink:#EDE9F7; --ink-2:#B9B2D4; --ink-3:#8A83A8;
  --paper:#15122B; --surface:#1E1A38; --surface-2:#272247; --line:#38315C;
  --honey:#F5C451; --violet:#9B84FF; --teal:#2FB39E; --pink:#FF6BA6;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 var(--sans);
  -webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;border:0;background:none;cursor:pointer}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:4px}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* ---------- shell ---------- */
.wrap{display:grid;grid-template-columns:230px minmax(0,1fr);gap:0;min-height:100%}
.rail{border-right:1px solid var(--line);background:var(--surface);
  position:sticky;top:0;align-self:start;max-height:100vh;overflow-y:auto;
  padding:18px 16px calc(24px + env(safe-area-inset-bottom,0px))}
.main{min-width:0;display:flex;flex-direction:column}

/* ---------- masthead ---------- */
.brand{font-family:var(--display);font-weight:700;font-size:21px;line-height:1.1;
  letter-spacing:-.01em;margin:0 0 3px;text-wrap:balance}
.brand em{font-style:normal;color:var(--honey)}
.tag{font-size:11.5px;color:var(--ink-3);line-height:1.45;margin:0 0 20px}

.rail h2{font-family:var(--display);font-size:12px;font-weight:700;margin:22px 0 8px;
  color:var(--ink-2);letter-spacing:.02em}
.rail h2:first-of-type{margin-top:0}

.f{display:flex;align-items:center;gap:8px;width:100%;padding:6px 9px;border-radius:8px;
  font-size:13px;font-weight:500;text-align:left;color:var(--ink-2);transition:background .12s}
.f:hover{background:var(--surface-2)}
.f[aria-pressed="true"]{background:color-mix(in srgb,var(--accent) 14%,transparent);
  color:var(--accent);font-weight:600}
.f .n{margin-left:auto;font:600 11px/1 var(--mono);color:var(--ink-3);
  font-variant-numeric:tabular-nums}
.f[aria-pressed="true"] .n{color:var(--accent)}
.dot{width:8px;height:8px;border-radius:2px;flex:0 0 auto}

/* ---------- toolbar ---------- */
.bar{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--paper) 92%,transparent);
  backdrop-filter:blur(8px);border-bottom:1px solid var(--line);
  padding:12px 20px;padding-top:calc(12px + env(safe-area-inset-top,0px));
  display:flex;gap:12px;align-items:center;flex-wrap:wrap}
#q{flex:1 1 260px;min-width:0;padding:9px 13px;border:1px solid var(--line);border-radius:8px;
  background:var(--surface);color:var(--ink);font:inherit;font-size:14px}
#q::placeholder{color:var(--ink-3)}
.count{font:600 12.5px/1 var(--mono);color:var(--ink-3);font-variant-numeric:tabular-nums;
  white-space:nowrap}
.count b{color:var(--ink);font-weight:600}

/* ---------- grid ---------- */
.grid{padding:18px 20px 60px;display:grid;gap:14px;
  grid-template-columns:repeat(auto-fill,minmax(112px,1fr))}
.tile{display:flex;flex-direction:column;gap:6px;text-align:left;width:100%}
.shot{aspect-ratio:1;display:grid;place-items:center;background:var(--surface);
  border:1px solid var(--line);border-radius:var(--radius);overflow:hidden;
  padding:8px;position:relative;transition:border-color .12s,transform .12s}
.tile:hover .shot{border-color:var(--accent);transform:translateY(-2px)}
.tile[aria-current="true"] .shot{border-color:var(--accent);
  box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 30%,transparent)}
.shot img{max-width:100%;max-height:100%;object-fit:contain;display:block}
.shot .none{font:600 10px/1.3 var(--mono);color:var(--ink-3);text-align:center;padding:4px}
/* the storage shape, as a corner stripe — it is the thing you filter by most */
.shot::after{content:"";position:absolute;left:0;top:0;width:4px;height:22px;
  border-radius:var(--radius) 0 4px 0;background:var(--sh)}
.cap{font:500 11px/1.3 var(--mono);color:var(--ink-2);word-break:break-all;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.more{grid-column:1/-1;display:grid;place-items:center;padding:20px}
.more button{padding:9px 18px;border:1px solid var(--line);border-radius:999px;
  font-weight:600;font-size:13px;background:var(--surface)}
.empty{grid-column:1/-1;padding:56px 20px;text-align:center;color:var(--ink-3)}

/* ---------- detail ---------- */
.sheet{position:fixed;inset:auto 0 0 0;z-index:20;background:var(--surface);
  border-top:1px solid var(--line);box-shadow:0 -12px 40px rgba(20,12,50,.16);
  padding:18px 20px calc(20px + env(safe-area-inset-bottom,0px));
  display:none;gap:18px;align-items:flex-start;max-height:62vh;overflow-y:auto}
.sheet[open]{display:flex}
.sheet .big{flex:0 0 168px;height:168px;display:grid;place-items:center;padding:10px;
  background:var(--surface-2);border:1px solid var(--line);border-radius:var(--radius)}
.sheet .big img,.sheet .big svg{max-width:100%;max-height:100%;object-fit:contain}
.sheet .body{flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:9px}
.sheet h3{font-family:var(--display);font-size:17px;font-weight:700;margin:0;
  word-break:break-all;text-wrap:balance}
.kv{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;font-size:12.5px}
.kv dt{color:var(--ink-3);font-weight:600}
.kv dd{margin:0;font-family:var(--mono);word-break:break-all;color:var(--ink-2)}
.acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:3px}
.acts button{padding:7px 13px;border:1px solid var(--line);border-radius:8px;
  font-size:12.5px;font-weight:600;background:var(--surface-2)}
.acts button:hover{border-color:var(--accent);color:var(--accent)}
.note{font-size:12px;color:var(--ink-3);line-height:1.45;
  border-left:2px solid var(--honey);padding-left:9px}
.x{position:absolute;right:14px;top:12px;font-size:20px;line-height:1;color:var(--ink-3);
  padding:4px 8px}

.badge{display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:999px;
  font:600 11px/1.6 var(--sans);background:var(--surface-2);color:var(--ink-2)}

@media (max-width:820px){
  .wrap{grid-template-columns:minmax(0,1fr)}
  .rail{position:static;max-height:none;border-right:0;border-bottom:1px solid var(--line)}
  .sheet{max-height:80vh;flex-direction:column}
  .sheet .big{flex:0 0 auto;width:100%;height:190px}
}
</style>

<div class="wrap">
<aside class="rail">
  <h1 class="brand">Bizzing <em>Art</em> Library</h1>
  <p class="tag">Every image and vector across the repos — including the ones that
    only exist while the app is running.</p>

  <h2>Where it is stored</h2>
  <div id="shapes"></div>
  <h2>Repo</h2>
  <div id="repos"></div>
  <h2>View</h2>
  <button class="f" id="dupes" aria-pressed="false"><span class="dot" style="background:var(--ink-3)"></span>Reused in 2+ places<span class="n" id="ndupes"></span></button>
  <button class="f" id="copyable" aria-pressed="false"><span class="dot" style="background:var(--violet)"></span>Markup copyable<span class="n" id="ncopy"></span></button>
</aside>

<main class="main">
  <div class="bar">
    <input id="q" type="search" placeholder="Search name, path or global — try honeypot, kit, GATTU" autocomplete="off">
    <span class="count"><b id="shown">0</b> of <b id="tot">0</b></span>
    <button class="f" id="reset" style="width:auto;flex:0 0 auto">Clear</button>
  </div>
  <div class="grid" id="grid"></div>
</main>
</div>

<div class="sheet" id="sheet" role="dialog" aria-label="Asset detail">
  <button class="x" id="close" aria-label="Close">&times;</button>
  <div class="big" id="big"></div>
  <div class="body" id="body"></div>
</div>

<script id="data" type="application/json">${json}</script>
<script>
const ROWS = JSON.parse(document.getElementById('data').textContent);
const STATS = ${JSON.stringify(stats)};
const $ = s => document.querySelector(s);

const SHAPES = [
  ['raster','Image file','var(--shape-file)','PNG, JPG and WebP on disk'],
  ['svg','Vector file','var(--shape-js)','.svg files on disk'],
  ['computed','Built in code','var(--shape-computed)','SVG a module produces at run time — not in any file'],
];

const state = { shapes:new Set(), repos:new Set(), q:'', dupes:false, copyable:false, page:0, sel:-1 };
const PAGE = 240;

function matches(r){
  if(state.shapes.size && !state.shapes.has(r.k)) return false;
  if(state.repos.size && !state.repos.has(r.r)) return false;
  if(state.dupes && !(r.a && r.a.length)) return false;
  if(state.copyable && !r.s) return false;
  if(state.q){ const q=state.q;
    if((r.p+' '+r.n+' '+r.r).toLowerCase().indexOf(q)<0) return false; }
  return true;
}
let view = [];

function shapeOf(k){ return SHAPES.find(s=>s[0]===k) || SHAPES[0]; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const kb = n => n>=1e6 ? (n/1e6).toFixed(1)+' MB' : n>=1024 ? Math.round(n/1024)+' KB' : n+' B';

function tile(r,i){
  const sh = shapeOf(r.k);
  /* A bare filename is not an identifier here: c1.png, avatar.png and stage.png each
     exist in several repos and folders. The last two segments tell them apart. */
  const label = r.n || r.p.split('/').slice(-2).join('/');
  const art = r.t ? '<img loading="lazy" decoding="async" src="'+r.t+'" alt="">'
                  : '<span class="none">no preview</span>';
  return '<button class="tile" data-i="'+i+'" aria-current="'+(state.sel===i)+'">'
       + '<span class="shot" style="--sh:'+sh[2]+'">'+art+'</span>'
       + '<span class="cap">'+esc(label)+'</span></button>';
}

function render(reset){
  if(reset){ view = ROWS.map((r,i)=>[r,i]).filter(p=>matches(p[0])); state.page=0; }
  const g = $('#grid');
  const end = Math.min(view.length,(state.page+1)*PAGE);
  let html = view.slice(0,end).map(p=>tile(p[0],p[1])).join('');
  if(!view.length) html = '<p class="empty">Nothing matches that. Try clearing a filter.</p>';
  else if(end<view.length) html += '<div class="more"><button id="more">Show '
       + Math.min(PAGE,view.length-end) + ' more — ' + (view.length-end) + ' left</button></div>';
  g.innerHTML = html;
  $('#shown').textContent = view.length.toLocaleString();
}

function drawFilters(){
  $('#shapes').innerHTML = SHAPES.map(s=>{
    const n = ROWS.filter(r=>r.k===s[0]).length;
    return '<button class="f" data-shape="'+s[0]+'" aria-pressed="'+state.shapes.has(s[0])+'" title="'+esc(s[3])+'">'
      + '<span class="dot" style="background:'+s[2]+'"></span>'+s[1]
      + '<span class="n">'+n.toLocaleString()+'</span></button>';
  }).join('');
  $('#repos').innerHTML = STATS.repos.map(x=>
    '<button class="f" data-repo="'+esc(x.r)+'" aria-pressed="'+state.repos.has(x.r)+'">'
    + esc(x.r)+'<span class="n">'+x.n.toLocaleString()+'</span></button>').join('');
  $('#ndupes').textContent = ROWS.filter(r=>r.a&&r.a.length).length.toLocaleString();
  $('#ncopy').textContent = ROWS.filter(r=>r.s).length.toLocaleString();
  $('#dupes').setAttribute('aria-pressed', state.dupes);
  $('#copyable').setAttribute('aria-pressed', state.copyable);
}

function open(i){
  const r = ROWS[i]; if(!r) return;
  state.sel = i;
  $('#big').innerHTML = r.s ? r.s : (r.t ? '<img src="'+r.t+'" alt="">' : '<span class="none">no preview</span>');
  const sh = shapeOf(r.k);
  const rows = [
    ['Repo', r.r],
    ['Path', r.p],
    r.n ? ['Reach it as', r.n] : null,
    ['Stored as', sh[1]],
    r.w ? ['Pixels', r.w+' × '+r.h] : null,
    ['Size', kb(r.g || r.b)],
  ].filter(Boolean);
  $('#body').innerHTML =
    '<h3>'+esc(r.n || r.p.split('/').pop())+'</h3>'
    + '<dl class="kv">'+rows.map(x=>'<dt>'+x[0]+'</dt><dd>'+esc(x[1])+'</dd>').join('')+'</dl>'
    + (r.W ? '<p class="note">Stored as inner markup, not a whole <code>&lt;svg&gt;</code>. '
        + 'The frame shown here was added so it renders on its own — the app draws it inside its own.</p>' : '')
    + (r.g ? '<p class="note">'+kb(r.g)+' of markup, too big to carry here. Open the file to use it.</p>' : '')
    + (r.a && r.a.length ? '<p class="note">Also at '+r.a.map(esc).join(', ')+'</p>' : '')
    + '<div class="acts">'
    + '<button data-copy="'+esc(r.r+'/'+r.p)+'">Copy path</button>'
    + (r.n ? '<button data-copy="'+esc(r.n)+'">Copy global</button>' : '')
    + (r.s ? '<button data-copysvg="'+i+'">Copy SVG markup</button>' : '')
    + '</div>';
  $('#sheet').setAttribute('open','');
  render();
}

addEventListener('click', e => {
  const t = e.target.closest('[data-i],[data-shape],[data-repo],#more,#reset,#close,#dupes,#copyable,[data-copy],[data-copysvg]');
  if(!t) return;
  if(t.dataset.i !== undefined) return open(+t.dataset.i);
  if(t.id==='more'){ state.page++; return render(); }
  if(t.id==='close'){ $('#sheet').removeAttribute('open'); state.sel=-1; return render(); }
  if(t.dataset.shape){ const k=t.dataset.shape;
    state.shapes.has(k)?state.shapes.delete(k):state.shapes.add(k); drawFilters(); return render(true); }
  if(t.dataset.repo){ const k=t.dataset.repo;
    state.repos.has(k)?state.repos.delete(k):state.repos.add(k); drawFilters(); return render(true); }
  if(t.id==='dupes'){ state.dupes=!state.dupes; drawFilters(); return render(true); }
  if(t.id==='copyable'){ state.copyable=!state.copyable; drawFilters(); return render(true); }
  if(t.id==='reset'){ state.shapes.clear(); state.repos.clear(); state.dupes=false;
    state.copyable=false; state.q=''; $('#q').value=''; drawFilters(); return render(true); }
  if(t.dataset.copy!==undefined){ navigator.clipboard?.writeText(t.dataset.copy);
    t.textContent='Copied'; setTimeout(()=>t.textContent=t.dataset.copy.includes('/')?'Copy path':'Copy global',1200); return; }
  if(t.dataset.copysvg!==undefined){ navigator.clipboard?.writeText(ROWS[+t.dataset.copysvg].s||'');
    t.textContent='Copied'; setTimeout(()=>t.textContent='Copy SVG markup',1200); return; }
});
let tid; $('#q').addEventListener('input', e => {
  clearTimeout(tid); const v=e.target.value.trim().toLowerCase();
  tid = setTimeout(()=>{ state.q=v; render(true); }, 130);
});
addEventListener('keydown', e => { if(e.key==='Escape'){ $('#sheet').removeAttribute('open'); state.sel=-1; render(); } });

$('#tot').textContent = ROWS.length.toLocaleString();
drawFilters(); render(true);
/* Open on something worth seeing rather than an empty shell: the first thing that
   only exists at run time, which is the finding this library was built to show. */
const first = ROWS.findIndex(r=>r.k==='computed' && r.s);
if(first>=0) open(first);
</script>
`;

fs.writeFileSync(path.join(OUT, 'library.html'), HTML);
const mb = (fs.statSync(path.join(OUT, 'library.html')).size / 1e6).toFixed(1);
console.log(`library.html  ${mb}MB  ${stats.total} assets ` +
  `(raster ${stats.raster}, svg ${stats.svg}, computed ${stats.computed})`);
console.log('→', path.join(OUT, 'library.html'));

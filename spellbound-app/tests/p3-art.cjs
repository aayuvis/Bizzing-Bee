/* ROAD TO 4.5, P3 — ART AND THE FIRST SESSION, the data half (node, the deploy's data gate)                       @check

   The P3 art rows (brief §4: P3.3/P3.4 feed cards by kind and the Shop's world tiles, P3.5 the Journey covers, P3.9 a
   medal per group, P3.22 Home's tip and quote, P3.23 onboarding's world plates) all draw from art SLOTS: one manifest,
   tools/art/p3-prompts.json, cut today from the app's own paintings by tools/art/p3-gen.py --cut and painted later in
   place by --paint/--webp. This holds:
     1. EVERY SLOT SHIPS AT ITS DRAWN SIZE. Each slot's file is a WebP at its declared path, exactly its declared pixel
        size (CLAUDE.md "Shipped art is sized to how it is drawn"), cut from a painting that exists.
     2. NO LETTERING, NO PEOPLE, NO MARKS IN A PROMPT. The manifest's `never` clause enumerates text, letters, numbers,
        labels, signage, writing on objects, people, faces, logos and brand marks; p3-gen.py wraps EVERY prompt in style +
        prompt + never; no prompt asks for a word, a sign or a person itself.
     3. THE KEY IS READ ONLY FROM GKEY, AT CALL TIME, SENT ONLY AS x-goog-api-key. No key file, no key in a URL, nothing
        that prints, logs or writes it.
     4. EVERY FEED CARD HAS ART THAT SHIPS. bee-feed.js's own artFor() (run here over every one of the build's cards, the
        index rows with their bodies, the road from trail-home-data.js) names a file in app-art/ for every card: a place
        its region's map, a lesson or a stop's quiz its region's banner, every other kind its kind's plate; every kind the
        build cuts has a plate; the kinds wear different plates.
     5. EVERY WORLD HAS ITS PLATE: WORLD_PLATE (app3.js) is exactly the store's eight worlds, each a slot that ships.
     6. THE JOURNEY COVERS ARE TEN DIFFERENT PAINTINGS, one per chapter of lessons-data.js, each a banner that ships.
     7. A MEDAL PER GROUP: MEDAL_GROUP (app3.js) draws every live medal group in badgeDefs — twelve — each with a shape no
        other group has, and the Collection and the celebration draw through medalSVG.
     8. HOME'S FIRST SCREEN: the tip and quote vignettes are slots drawn data-lsrc (shown near the screen, never in the
        first-load image bytes); with no note yet, the parse-time preload still asks for the journey plate.
   Proved by breaking (13 Oct 2026, eleven breaks, each in a scratch root of symlinks with ONE file replaced — the tree was
   never touched — and each failed exactly one check): a feed slot re-cut at 640×240 ("drawn size"); "NO people, NO
   human figures, NO faces" dropped from the never clause; p3-gen.py falling back to GKEY_FILE / /root/.gkey (the key
   rule); KIND_ART's `saying` entry removed — the card falls back to word.webp and still "has art", so it is the check
   naming every kind the build cuts that fails; WORLD_PLATE missing `dino`; UNIT_ART's eighth painting set to the
   sixth's ("ten different"); MEDAL_GROUP's Trivia shape made the Collection's ("Trivia shares a shape"); the
   celebration calling medalSVG bare instead of through scrDraw (the first-screen check); the tip
   vignette drawn with src= instead of data-lsrc; the no-note preload line taken out of index.html; a usage prompt
   that asks for "a girl writing with a fountain pen".
   Run: node tests/p3-art.cjs                                                                                         */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a) => (a.length ? ' — ' + a.slice(0, 6).join(' · ') + (a.length > 6 ? ` … (${a.length})` : '') : '');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

/* WebP pixel size from the header (VP8 / VP8L / VP8X) — no image library in the test */
function webpSize(rel) {
  const b = fs.readFileSync(path.join(ROOT, rel));
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const k = b.toString('ascii', 12, 16);
  if (k === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  if (k === 'VP8L') return [1 + (((b[22] & 0x3f) << 8) | b[21]), 1 + (((b[24] & 0x0f) << 10) | (b[23] << 2) | ((b[22] & 0xc0) >> 6))];
  if (k === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  return null;
}

const M = JSON.parse(read('tools/art/p3-prompts.json'));
const slots = M.slots || [];
const byOut = Object.fromEntries(slots.map((s) => [s.out, s]));

/* ---- 1. every slot ships at its drawn size ---- */
const bad1 = [];
for (const s of slots) {
  if (!exists(s.out)) { bad1.push(s.out + ' missing'); continue; }
  const sz = webpSize(s.out);
  if (!sz) bad1.push(s.out + ' is not a WebP');
  else if (sz[0] !== s.size[0] || sz[1] !== s.size[1]) bad1.push(`${s.out} is ${sz.join('×')}, drawn at ${s.size.join('×')}`);
  if (!s.fallback || !exists(s.fallback.from)) bad1.push(s.id + ': its reused painting ' + (s.fallback && s.fallback.from) + ' is missing');
}
ok(slots.length >= 22 && !bad1.length, `every one of the ${slots.length} art slots is a WebP at its declared path, at the size it is drawn, cut from a painting that ships` + some(bad1));

/* ---- 2. no lettering, no people, no marks ---- */
const never = String(M.never || '');
const NEED = [/NO TEXT/, /no letters/i, /no words/i, /no numbers/i, /no labels/i, /signage/i, /writing on/i, /NO people/, /faces/i, /logos/i, /brand marks/i];
const missing2 = NEED.filter((re) => !re.test(never)).map(String);
ok(!missing2.length, 'the never clause forbids text, letters, words, numbers, labels, signage, writing on objects, people, faces, logos and brand marks' + some(missing2));
const gen = read('tools/art/p3-gen.py');
ok(/text = M\['style'\] \+ ' ' \+ s\['prompt'\] \+ ' ' \+ M\['never'\]/.test(gen), 'p3-gen.py wraps every prompt in the house style AND the never clause');
const asks = slots.filter((s) => s.prompt && /\b(lettering|caption|title|sign(s|post)? (that )?(says|reads)|with the words?|a (boy|girl|child|man|woman|person|people)|portrait)\b/i.test(s.prompt)).map((s) => s.id);
ok(slots.filter((s) => s.prompt).length >= 8 && !asks.length, `${slots.filter((s) => s.prompt).length} slots carry a prompt, and none asks for lettering, a sign that says something or a person` + some(asks));

/* ---- 3. the key ---- */
const keyBad = [];
if (!/os\.environ\.get\('GKEY'/.test(gen)) keyBad.push('does not read GKEY from the environment');
if (/GKEY_FILE|\.gkey|open\([^)]*key/i.test(gen.replace(/^"""[\s\S]*?"""/m, ''))) keyBad.push('reads a key file');
if ((gen.match(/'x-goog-api-key': key/g) || []).length !== 1) keyBad.push('the key is not sent as exactly one x-goog-api-key header');
if (/[?&]key=/.test(gen)) keyBad.push('a key in a URL');
if (/print\([^)]*\bkey\b(?!\w)/.test(gen) || /(log|write)\([^)]*\bkey\b/.test(gen)) keyBad.push('prints or writes the key');
if (/sys\.argv[^\n]*key/i.test(gen)) keyBad.push('a key on the command line');
ok(!keyBad.length, 'p3-gen.py reads the key only from GKEY at call time and sends it only as the x-goog-api-key header' + some(keyBad));

/* ---- 4. every feed card has art that ships ---- */
const sb = { console, JSON, Math, Object, Array, String, Number, Date, RegExp };
sb.window = sb; sb.self = sb;
sb.document = { addEventListener() {}, querySelector() { return null; }, createElement() { return { setAttribute() {} }; }, head: { appendChild() {} } };
sb.state = {}; sb.render = function () {};
vm.createContext(sb);
for (const f of ['trail-home-data.js', 'feed/feed-meta.js']) vm.runInContext(read(f), sb, { filename: f });
for (const f of fs.readdirSync(path.join(ROOT, 'feed')).filter((f) => /^f[ib]\d+(-\d+)?\.js$/.test(f))) vm.runInContext(read('feed/' + f), sb, { filename: f });
vm.runInContext(read('bee-feed.js'), sb, { filename: 'bee-feed.js' });
const F = sb.SB_FEED, META = sb.SB_FEED_META;
const rows = [];
for (const g of Object.keys(sb.SB_FEED_IDX || {})) for (const r of sb.SB_FEED_IDX[g]) { const o = {}; META.keys.forEach((k, i) => { if (r[i] != null) o[k] = r[i]; }); Object.assign(o, (sb.SB_FEED_BODY || {})[o.id] || {}); rows.push(o); }
const kinds = [...new Set(rows.map((r) => r.kind))].sort();
const noArt = [], arts = new Set(), plateOf = {};
let places = 0, regional = 0;
for (const r of rows) {
  const a = F && F.artFor ? F.artFor(r) : null;
  if (!a || !exists(a)) { noArt.push(r.id + ' → ' + a); continue; }
  arts.add(a); (plateOf[r.kind] = plateOf[r.kind] || new Set()).add(a);
  if (r.kind === 'place') { if (/^app-art\/map-[a-z]+\.webp$/.test(a)) places++; }
  if ((r.kind === 'lesson' || r.kind === 'quiz') && /^app-art\/w-[a-z]+-r2\.webp$/.test(a)) regional++;
}
ok(rows.length > 20000 && !noArt.length, `every one of the build's ${rows.length} cards names art that ships in app-art/` + some(noArt));
const unplated = kinds.filter((k) => !(F.KIND_ART && F.KIND_ART[k]) || !exists('app-art/feed/' + F.KIND_ART[k] + '.webp'));
ok(kinds.length >= 12 && !unplated.length, `every kind the build cuts (${kinds.length}: ${kinds.join(', ')}) has its own entry and a plate that ships` + some(unplated));
const placeN = rows.filter((r) => r.kind === 'place').length, lessonN = rows.filter((r) => r.kind === 'lesson' || r.kind === 'quiz').length;
ok(places === placeN && placeN >= 9 && regional === lessonN && lessonN > 500,
  `a place card wears its region's map (${places}/${placeN}), a lesson or a stop's quiz its region's banner (${regional}/${lessonN})`);
const plates = new Set(Object.values(F.KIND_ART || {}));
ok(plates.size >= 11 && arts.size >= 25, `the kinds wear different paintings: ${plates.size} kind plates, ${arts.size} different pictures across the feed`);

/* ---- 5. every world has its plate ---- */
const app3 = read('app3.js');
const wp = (app3.match(/const WORLD_PLATE=\{([^}]*)\}/) || [])[1] || '';
const plateIds = [...wp.matchAll(/([a-z]+):1/g)].map((m) => m[1]).sort();
const themeIds = [...read('app2.js').slice(read('app2.js').indexOf('const THEMES = [')).split('];')[0].matchAll(/id:'([a-z]+)'/g)].map((m) => m[1])
  .concat([...read('worlds4.js').split('/* ---------- 1. register')[0].matchAll(/id:'([a-z]+)'/g)].map((m) => m[1])).sort();
const wBad = themeIds.filter((id) => !plateIds.includes(id) || !byOut['app-art/wt/' + id + '.webp']);
ok(themeIds.length === 8 && plateIds.join() === themeIds.join() && !wBad.length, `WORLD_PLATE is the store's eight worlds (${plateIds.join(', ')}), each a 480×240 slot that ships` + some(wBad));
ok(/function worldHeroCard\([^)]*\)\{[^\n]*worldPlateImg\(/.test(app3) && /worldPlateImg\(t\.id\)/.test(read('app3-me.js')) && /'onbWorld', true\)/.test(app3),
  'the Collection\'s world card, the Shop\'s world tile and onboarding\'s world step (eager) draw the painted plate');

/* ---- 6. the Journey covers ---- */
const lib = read('app3-library.js');
const ua = JSON.parse(((lib.match(/const UNIT_ART=(\[[^\]]*\])/) || [])[1] || '[]').replace(/'/g, '"'));
const sbL = { window: {} }; sbL.window = sbL; vm.createContext(sbL); vm.runInContext(read('lessons-data.js'), sbL);
const units = ((sbL.SB_LESSONS || {}).units || []).length;
const uaBad = ua.filter((u) => !exists('app-art/w-' + u + '.webp'));
ok(units === 10 && ua.length === units && new Set(ua).size === units && !uaBad.length && /unitCoverArt\(L\.unit,lk\)/.test(lib) && !/grayscale\(\.75\)/.test(lib.slice(lib.indexOf('function lessonCoverCard'), lib.indexOf('function viewJourneys'))),
  `the ${units} Journey chapters wear ${new Set(ua).size} different paintings (${ua.join(', ')}), each shipped, and a locked cover is no grey block` + some(uaBad));

/* ---- 7. a medal per group ---- */
const defs = app3.slice(app3.indexOf('function badgeDefs('), app3.indexOf('return defs.map', app3.indexOf('function badgeDefs(')));
const groups = [...new Set([...defs.matchAll(/\{ g:'([^']+)'/g)].map((m) => m[1]))].filter((g) => g !== 'Kept from before');
const meSrc = read('app3-me.js');   /* the medal art lives with the shelf that shows it — off the first screen */
const mg = meSrc.slice(meSrc.indexOf('const _MP='), meSrc.indexOf('const MEDAL_METAL'));
const sbM = { Math }; vm.createContext(sbM); vm.runInContext(mg.replace('const MEDAL_GROUP=', 'this.MEDAL_GROUP=').replace('const _MP=', 'var _MP='), sbM);
const G = sbM.MEDAL_GROUP || {};
const noShape = groups.filter((g) => !G[g]);
const shapes = groups.filter((g) => G[g]).map((g) => G[g].s());
const dup = groups.filter((g, i) => G[g] && shapes.indexOf(shapes[i]) !== i);
ok(groups.length === 12 && !noShape.length && !dup.length, `every one of the ${groups.length} live medal groups has its own medal, and no two groups share a shape` + some(noShape.concat(dup.map((d) => d + ' shares a shape'))));
ok(/medalSVG\(b,60,b\.done,i,list\.length\)/.test(meSrc) && /scrDraw\('scrMe',\(\)=>medalSVG\(b, 96\)\)/.test(app3) && !/function medalSVG|const MEDAL_GROUP/.test(app3),
  'the Collection\'s medal shelf and the "Badge earned!" celebration (through scrDraw) draw through medalSVG, which lives in app3-me.js, off the first screen');

/* ---- 8. Home's first screen ---- */
const vign = ['app-art/home/tip.webp', 'app-art/home/quote.webp'];
ok(vign.every((v) => byOut[v] && app3.includes(`homeVign('${v}')`)) && /function homeVign\(src\)\{[^\n]*'data-lsrc'/.test(app3) && /landShots\('60px 0px'\)/.test(app3),
  'Home\'s tip and quote carry their painted vignettes, drawn data-lsrc and shown only near the screen (never in the first-load image bytes)');
const idx = read('index.html');
ok(/if\(!art\.length\) art=\['app-art\/atlas-map\.webp'\];/.test(idx), 'with no note yet, the parse-time preload asks for the journey plate Home\'s first screen shows');

console.log(fails ? `\n${fails} FAILED` : '\nthe P3 art ships at its size, every feed card, world, cover and medal group has its own, and the key stays in the environment');
process.exit(fails ? 1 : 0);

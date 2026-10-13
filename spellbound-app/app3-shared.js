"use strict";
/* app3-shared.js — the code two or more of the lazy screens share.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrShared`, its group carries the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

function lessonUnits(){ return (window.SB_LESSONS&&SB_LESSONS.units)||[]; }
function lessonComplete(L){ const ms=state.luMastered||{}; const ws=(L.words||[]).filter(w=>w&&w.w); if(!ws.length) return false; const m=ws.filter(w=>ms[nkey(w.w)]).length; return m/ws.length>=PATTERN_DONE_PCT; }
function lessonsDoneCount(){ return lessonsAll().filter(L=>lessonComplete(L)).length; }
function themeClusters(){ return (window.SB_THEMES&&SB_THEMES.clusters)||[]; }
function journeyMastered(c){ c=c||active(); const arr=journeySorted(); let m=0; for(let i=0;i<arr.length;i++){ if(state.luMastered[nkey(arr[i].w)]) m++; } return m; }
function isListUnlocked(key){ if(state.devUnlock) return true; try{ if(window.SB_ENT && SB_ENT.has('lists')) return true; }catch(e){} if(!isPremiumList(key)||state.premium) return true; return !!(active().unlockedLists||{})[key]; }
function fmtAgo(ts){ if(!ts) return ''; const s=Math.max(0,Math.floor((now()-ts)/1000));
  if(s<60) return 'just now'; const m=Math.floor(s/60); if(m<60) return m+'m ago'; const h=Math.floor(m/60); if(h<24) return h+'h ago'; const d=Math.floor(h/24); return d+'d ago'; }
// Buddy empty states — the bee lives in every empty moment (spec §8)
function beeEmpty(mood,text){ return `<div style="display:flex;align-items:center;gap:14px;padding:10px 4px"><div style="width:56px;height:62px;flex-shrink:0;opacity:.95">${mascotSVG(mood)}</div><p style="margin:0;font-size:15px;color:var(--muted);line-height:1.5">${text}</p></div>`; }
/* YOUR CARD (road to 4.5, P3.17): the child's avatar in the frame they wear, their name on their plate, the background
   they chose behind it, and their one level — the Shop's Extras tab (so a look is seen before and after it is bought)
   and the top of My page. Every look comes through shopWorn (app3.js), so only what the child OWNS ever shows. */
function meCardHTML(c){ c=c||active();
  return `<div class="bz-mecard"><span class="bz-mecard-av${cardBg(c)}" aria-hidden="true">${framed(avatarSVG(c.avatar||'bizzy',72),c,80)}</span>
    <span class="bz-mecard-t"><span class="sb-cs">Your card</span><b class="bz-mecard-n">${plated(esc(c.name||'Speller'),c)}</b><span class="bz-mecard-l">${esc(oneLevel(c).label)}</span></span></div>`; }
const VOC_SET  = 50;
function vocLevel(deck,c){ const v=vocProg(c); return (v&&v.lv[deck])||0; }
function vocWordsByKeys(keys){ const db=wordDB();
  return (keys||[]).map(k=>db.get(k)).filter(Boolean); }
/* Serve the current set. Persisted by key so leaving the deck and coming back does not
   silently reshuffle the words the speller is part-way through learning. */
function vocCurrentSet(deck){ const c=active(); const v=vocProg(c); if(!v) return [];
  const saved=vocWordsByKeys(v.cur[deck]);
  if(saved.length>=5) return saved;
  return vocBuildSet(deck); }
/* Build the next set: carried-over misses first, then words this deck has not served
   before, falling back to any words if the deck runs dry. */
function vocBuildSet(deck){ const c=active(); const v=vocProg(c); if(!v) return [];
  const carry=vocWordsByKeys(v.carry[deck]).slice(0,10);
  const seen=new Set((v.seen[deck]||[]).concat(carry.map(w=>nkey(w.w))));
  const pool=vocDeckWords(deck);
  const fresh=pool.filter(w=>!seen.has(nkey(w.w)));
  const want=VOC_SET-carry.length;
  let picked=fresh.slice(0,want);
  if(picked.length<want){ // deck exhausted — allow repeats rather than serve a short set
    const rest=pool.filter(w=>picked.indexOf(w)<0&&carry.indexOf(w)<0);
    picked=picked.concat(sample(rest, Math.min(want-picked.length, rest.length))); }
  const set=carry.concat(picked);
  v.cur[deck]=set.map(w=>nkey(w.w));
  v.carry[deck]=[];
  v.seen[deck]=(v.seen[deck]||[]).concat(set.map(w=>nkey(w.w))).slice(-400);
  save();
  return set; }
function vocDeckWords(k){
  if(String(k).slice(0,5)==='list:'){ const cat=vocListCat(String(k).slice(5));
    if(!cat) return [];
    /* hardest-first so a long list front-loads the words worth learning, then a stable
       order — vocBuildSet does the slicing and remembers what has been served */
    return cat.words.slice().sort((a,b)=>(b.y||3)-(a.y||3)||a.w.localeCompare(b.w)); }
  if(['easy','medium','hard','champ'].indexOf(k)>=0){
    const r=diffRange(active(),k); const ws=corpusSlice(r[0],r[1],600);
    return sample(ws, Math.min(VOC_SET,ws.length)); }
  const pool=gameWordsD({needDef:true});
  if(k==='mix'){ const f=pickFresh(pool,VOC_SET); return f.length?f:sample(pool,Math.min(VOC_SET,pool.length)); }
  if(k.slice(0,3)==='th:'){ const ws=themeWords(k.slice(3)).filter(w=>w.d&&w.d.length>4); return sample(ws,Math.min(VOC_SET,ws.length)); }
  return [];
}
const heroFont = (s) => { const n=(s||'').length; return n<=3?42:n<=5?34:n<=7?28:n<=10?23:18; };
/* ===== Theme Journeys view — pick themes you love; each becomes a staged journey ===== */
function themeCoverBG(cl){ const t=CONCEPT_TEX[cl.tex]||CONCEPT_TEX.stripes;
  return `background-color:${cl.c};background-image:${t[0]},linear-gradient(135deg,${cl.c},${cl.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* Hand-drawn white line-art emblem per theme (offline, theme-colored cover behind it).
   `sketch` mode runs the art through a turbulence filter so it looks pencil-sketched. */
let _artN=0;
function themeArtSVG(id,size,sketch){ size=size||54; const fid='skf'+(++_artN);
  const W=(inner)=>`<svg viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="#fff" stroke-width="${sketch?2.2:2.4}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;filter:drop-shadow(0 3px 6px rgba(0,0,0,.22))">${sketch?`<defs><filter id="${fid}" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="${(id||'').length*3+2}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.6"/></filter></defs><g filter="url(#${fid})" opacity=".97">${inner}</g>`:inner}</svg>`;
  const P=(d)=>`<path d="${d}"/>`; const C=(cx,cy,r,f)=>`<circle cx="${cx}" cy="${cy}" r="${r}"${f?' fill="rgba(255,255,255,.28)" stroke="none"':''}/>`;
  const F=(d)=>`<path d="${d}" fill="rgba(255,255,255,.28)" stroke="none"/>`;
  const M={
  body:P('M24 40s-13-7.5-13-17a7.5 7.5 0 0 1 13-5 7.5 7.5 0 0 1 13 5c0 9.5-13 17-13 17z')+P('M11 24h7l3-5 4 9 3-6h9'),
  disease:P('M20 8h8M24 8v7')+P('M24 15a10 10 0 1 0 .01 0')+C(20,27,1.6,1)+C(28,25,1.6,1)+C(24,32,1.6,1),
  pharmacy:'<rect x="14" y="16" width="20" height="24" rx="4"/>'+P('M17 16v-5h14v5')+P('M24 24v8M20 28h8'),
  animals:C(15,18,3.4)+C(24,14,3.4)+C(33,18,3.4)+P('M24 24c-6 0-10 4.5-10 9 0 3 2.2 4.6 4.6 4-2.3-4.4 1-8 5.4-8s7.7 3.6 5.4 8c2.4.6 4.6-1 4.6-4 0-4.5-4-9-10-9z'),
  birds:P('M10 30c8 2 20 2 26-8-3-1-5-1-7 0 1-6-3-11-9-11-5 0-9 4-9 9v5c0 2-.5 3.6-1 5z')+C(19,15,1.5,1)+P('M36 22l6-2M10 36c8 3 18 3 24-3'),
  insects:P('M24 18v18')+C(24,14,3.2)+P('M24 22c-7-6-14-3-14 3s6 9 14 4c8 5 14 1 14-4s-7-9-14-3z')+P('M20 10l-3-4M28 10l3-4'),
  marine:P('M8 26c5-7 12-9 18-6l8-6v9l3 3-3 3v3l-8-3c-6 3-13 1-18-3z')+C(15,24,1.6,1)+P('M34 40c-3-2-6-2-9 0s-6 2-9 0'),
  botany:P('M24 40V22')+P('M24 26c0-7-5-11-12-11 0 7 5 11 12 11z')+P('M24 22c0-6 4-9 10-9 0 6-4 9-10 9z')+P('M16 40h16'),
  flowers:C(24,22,4)+P('M24 12a5 5 0 0 1 0 10 5 5 0 0 1 0-10zM34 22a5 5 0 0 1-10 0M24 32a5 5 0 0 1 0-10M14 22a5 5 0 0 1 10 0')+P('M24 32v9M24 41c0-4-3-6-7-6M24 41c0-4 3-6 7-6'),
  chemistry:P('M20 8h8M22 8v10l-9 16a4 4 0 0 0 3.4 6h15.2a4 4 0 0 0 3.4-6l-9-16V8')+P('M17 30h14')+C(22,35,1.6,1)+C(27,33,1.4,1),
  astronomy:C(24,24,8)+P('M10 32c5 1 9 0 14-3s9-8 10-13')+'<ellipse cx="24" cy="24" rx="15" ry="5.5" transform="rotate(-24 24 24)"/>'+C(37,12,1.5,1)+C(11,36,1.3,1),
  weather:P('M14 28a8 8 0 1 1 3-15.5A10 10 0 0 1 36 16a7 7 0 0 1 2 13.8')+P('M24 30l-4 8h5l-3 7 9-11h-5l3-4z'),
  minerals:P('M15 10h18l8 10-17 20L7 20z')+P('M7 20h34M15 10l9 10 9-10M24 40V20'),
  physics:'<ellipse cx="24" cy="24" rx="17" ry="7"/>'+'<ellipse cx="24" cy="24" rx="17" ry="7" transform="rotate(60 24 24)"/>'+'<ellipse cx="24" cy="24" rx="17" ry="7" transform="rotate(-60 24 24)"/>'+C(24,24,2.4,1),
  ecology:P('M24 8a16 16 0 1 0 16 16C40 15 33 8 24 8z')+P('M24 8c-8 8-8 24 0 32M24 8c8 8 8 24 0 32M9 20h30M9 28h30'),
  landforms:P('M6 38l10-18 6 10 4-6 10 14z')+P('M16 20l3-5 3 5')+F('M19 15l3 5h-6z')+C(38,12,3.4)+P('M10 38h30'),
  nations:C(24,24,15)+P('M9 24h30M24 9c-5 4-7 9-7 15s2 11 7 15c5-4 7-9 7-15s-2-11-7-15z'),
  waterways:P('M8 18c4-4 8-4 12 0s8 4 12 0 8-4 12 0')+P('M8 27c4-4 8-4 12 0s8 4 12 0 8-4 12 0')+P('M8 36c4-4 8-4 12 0s8 4 12 0 8-4 12 0'),
  maps:C(24,24,15)+P('M24 9v4M24 35v4M9 24h4M35 24h4')+P('M30 18l-4 9-9 4 4-9z')+C(24,24,1.6,1),
  farming:P('M24 40V16')+P('M24 22c-5 0-8-3-8-8 5 0 8 3 8 8zM24 22c5 0 8-3 8-8-5 0-8 3-8 8zM24 30c-5 0-8-3-8-8 5 0 8 3 8 8zM24 30c5 0 8-3 8-8-5 0-8 3-8 8z')+P('M14 40h20'),
  culinary:P('M10 26h28l-3 12a3 3 0 0 1-3 2H16a3 3 0 0 1-3-2z')+P('M24 26v-6a6 6 0 0 1 6-6')+P('M17 22c1-3 3-5 7-6M31 22c-1-2-2-3-4-4'),
  dishes:P('M8 28h32a16 16 0 0 0-32 0z')+P('M6 28h36M20 12c0 2 2 2 2 4s-2 2-2 4M27 12c0 2 2 2 2 4s-2 2-2 4'),
  spices:P('M20 12c-6 5-10 12-10 18a9 9 0 0 0 18 0c0-6-3-13-8-18z')+P('M28 10c4 1 8 5 9 10')+C(33,26,2)+C(37,32,2)+C(31,34,2),
  fabrics:P('M14 10l-6 8 5 4v18h22V22l5-4-6-8h-6a4 4 0 0 1-8 0z')+P('M18 24c4 3 8 3 12 0M18 31c4 3 8 3 12 0'),
  buildings:P('M10 40V20l8-6v26M18 40V14l12-6v32M30 40V16l8 6v18')+P('M6 40h36')+P('M23 16v3M23 24v3M23 32v3M34 26v3M34 33v2'),
  household:P('M10 26v-6a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v6')+P('M8 26a3 3 0 0 1 3 3v5h26v-5a3 3 0 0 1 6 0v4a4 4 0 0 1-2 3.4V40M8 26a3 3 0 0 0-3 3v4a4 4 0 0 0 2 3.4V40')+P('M11 34h26'),
  music:P('M18 34V12l18-4v22')+C(14,34,4.4)+C(32,30,4.4)+P('M18 18l18-4'),
  stage:P('M8 10c10 5 22 5 32 0v6c-10 5-22 5-32 0z')+P('M12 18v16a24 24 0 0 0 24 0V18')+P('M18 28c1.5 2 4 2 5.5 0M27 28c1.5 2 4 2 5.5 0M20 36c2.5 2 5.5 2 8 0'),
  painting:P('M24 8a16 16 0 0 0 0 32c2.6 0 3.6-2 2.6-3.8-1-1.9.4-4.2 2.8-4.2h2.6a8 8 0 0 0 8-8c0-9-7-16-16-16z')+C(16,22,2,1)+C(24,16,2,1)+C(32,22,2,1)+C(15,30,1.8,1),
  poetry:P('M12 40c-2-12-2-22 0-30 8-2 16-2 24 0 2 8 2 18 0 30-8-2-16-2-24 0z')+P('M18 18h12M18 24h12M18 30h7')+P('M34 34l6-6-3-3-6 6-1 4z'),
  myth:P('M24 6l3.5 8 8.5.8-6.4 5.6 2 8.6L24 24.6 16.4 29l2-8.6L12 14.8l8.5-.8z')+P('M14 38c6 3 14 3 20 0M17 43h14'),
  religion:P('M24 40V14')+P('M24 14a6 6 0 1 1 .01 0')+P('M14 26h20M18 40h12')+C(24,8,1.6,1),
  festivals:P('M10 40l8-22 8 14z')+F('M14 30l4-11 4 7z')+P('M26 8l1.5 4 4 .4-3 2.6 1 4-3.5-2-3.5 2 1-4-3-2.6 4-.4z')+C(38,18,2)+C(34,30,1.6,1)+P('M36 36l4 4M40 36l-4 4'),
  law:P('M24 8v32M16 40h16')+P('M10 16h28')+P('M14 16l-5 10a6 5 0 0 0 11 0zM34 16l-5 10a6 5 0 0 0 11 0z'),
  politics:P('M8 40h32M10 34h28')+P('M12 34V22M18 34V22M24 34V22M30 34V22M36 34V22')+P('M8 22L24 10l16 12z')+C(24,17,1.8,1),
  economy:C(24,24,14)+P('M28 18c-1.4-1.4-6-2.4-8 0-1.8 2.2-.4 4.6 2 5.4l4.2 1.4c2.8 1 3.4 4 1.4 5.8-2.2 2-6.4 1.2-8-.6')+P('M24 13v4M24 31v4'),
  jobs:P('M16 16v-3a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v3')+'<rect x="8" y="16" width="32" height="20" rx="4"/>'+P('M8 25c10 4 22 4 32 0M24 24v4'),
  character:C(24,20,9)+P('M9 42a15 15 0 0 1 30 0')+P('M20 19c.8-1.4 3-1.4 3.8 0M27 19c.8-1.4 3-1.4 3.8 0M19 24c3 2.6 7 2.6 10 0'),
  emotions:P('M24 40s-13-7.5-13-17a7.5 7.5 0 0 1 13-5 7.5 7.5 0 0 1 13 5c0 9.5-13 17-13 17z')+P('M18 22c1-1.4 3-1.4 4 0M27 22c1-1.4 3-1.4 4 0M19 27c3 2.6 8 2.6 11 0'),
  kinship:C(17,15,4.4)+C(31,15,4.4)+P('M8 36a9 9 0 0 1 18 0zM22 36a9 9 0 0 1 18 0z')+P('M24 8l1 2.4 2.6.2-2 1.8.6 2.6-2.2-1.4-2.2 1.4.6-2.6-2-1.8 2.6-.2z'),
  war:P('M12 36L34 14M30 10l8 8-4 4-8-8zM14 34l-4 8 8-4z')+P('M36 36L14 14M18 10l-8 8 4 4 8-8zM34 34l4 8-8-4z'),
  ancient:P('M8 40h32M10 36h28')+P('M12 36V18M20 36V18M28 36V18M36 36V18')+P('M8 18L24 8l16 10z')+P('M8 18h32'),
  royalty:P('M10 34l-2-18 9 7 7-11 7 11 9-7-2 18z')+P('M10 38h28')+C(24,26,2,1)+C(15,28,1.6,1)+C(33,28,1.6,1),
  seafaring:P('M24 8v22')+P('M24 10c8 2 8 10 0 12 10 1 12-4 14-2-2 6-8 8-14 8')+P('M8 34c2 4 6 6 16 6s14-2 16-6c-4-1-8-2-16-2s-12 1-16 2z')+P('M24 22c-8-2-8-10 0-12'),
  sports:C(24,24,15)+P('M24 9c5 4 7 9 7 15s-2 11-7 15c-5-4-7-9-7-15s2-11 7-15z')+P('M9.5 20c9-3 20-3 29 0M9.5 28c9 3 20 3 29 0'),
  vehicles:P('M8 30l3-9a4 4 0 0 1 3.8-3h18.4a4 4 0 0 1 3.8 3l3 9')+P('M8 30h32v6a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1H14v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z')+C(14,33,1.8,1)+C(34,33,1.8,1),
  tools:P('M28 14a8 8 0 0 0-11 9L8 32a3.5 3.5 0 0 0 5 5l9-9a8 8 0 0 0 9-11l-5 5-4-1-1-4z')+C(36,36,5)+P('M36 33v3l2.4 1.6'),
  logic:P('M17 8a8 8 0 0 0-8 8c0 3 1 4.6 2.4 6.4C9 24.6 8 26.6 8 29a8 8 0 0 0 9 8M31 8a8 8 0 0 1 8 8c0 3-1 4.6-2.4 6.4C38.4 24.6 40 26.6 40 29a8 8 0 0 1-9 8')+P('M17 37c2 2 4 3 7 3s5-1 7-3M24 12v28'),
  numbers:P('M14 8v8M10 12h8')+P('M30 10h8M30 15h8')+P('M12 30l6 8M18 30l-6 8')+C(35,34,5)+P('M32 34h6'),
  wordwords:P('M8 12h24a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H20l-8 7v-7h-4z')+P('M14 19h16M14 25h10')+P('M36 20h4a2 2 0 0 1 2 2v16l-5-4h-9'),
  time:C(24,24,15)+P('M24 13v11l8 5')+P('M24 6v3M42 24h-3M24 42v-3M6 24h3'),
  colors:P('M24 6c4 7 12 15 12 24a12 12 0 0 1-24 0c0-9 8-17 12-24z')+P('M18 30a6 6 0 0 0 6 6')+C(30,17,1.6,1),
  // a signed name plate hanging from a ribbon — the word that carries a person's name
  eponyms:P('M18 6l6 7 6-7')+P('M24 13v4')+'<rect x="7" y="17" width="34" height="23" rx="5"/>'+P('M13 25h9M13 31h6')+P('M27 34c1.5-4 3-6 4.4-6s1.6 2 .6 4 .4 2.6 2 1.2 2.4-3 3-5.6')+C(24,17,1.4,1),
  };
  /* Origin and eponym themes are not subjects, so they borrow the mark that fits
     what they actually are: a signpost for a language family, a nameplate for an
     eponym cluster. Anything else falls back to the language mark. */
  if(!M[id]){
    if(/^ep/.test(id)) return W(M.eponyms);
    if(/^o/.test(id)&&themeOf(id)&&themeOf(id).cluster==='origins')
      return W(P('M24 6v36')+P('M10 12h22l4 5-4 5H10z')+P('M38 26H16l-4 5 4 5h22z')+C(24,44,1.6,1));
  }
  return W(M[id]||M.wordwords); }
/* ===================== WORD COACH ===================== */
const FREE_LISTS = { default:1, review:1, missed:1, custom:1, ai:1, journey:1, nsf500:1, vocab26:1 };
function isPremiumList(key){ if(isThemeKey(key)) return false; if(String(key).startsWith('built_')) return false; return !FREE_LISTS[key]; }
const MC_ORIGINS=['Latin','Greek','French','Old English','Norse','Spanish','Italian','German','Arabic','Japanese','Hindi','Sanskrit','Dutch','Russian','Hebrew','Portuguese'];
const gameName=(t)=>{ const g=GAMES.find(x=>x.type===t); return g?g.name:'Game'; };
/* wrong spellings that are honestly wrong and all different: a doubled letter, a dropped
   double, a swapped neighbour, a dropped letter — in that order — never the word itself */
function spellVariants(w, n){ const s=String(w||''); const out=[]; const add=v=>{ if(v&&v.length>1&&nkey(v)!==nkey(s)&&!out.some(x=>nkey(x)===nkey(v))) out.push(v); };
  for(let i=1;i<s.length-1&&out.length<n*2;i++){ if(/[a-z]/i.test(s[i])&&s[i]!==s[i-1]&&s[i]!==s[i+1]) add(s.slice(0,i+1)+s[i]+s.slice(i+1)); }
  for(let i=1;i<s.length;i++){ if(s[i]===s[i-1]) add(s.slice(0,i)+s.slice(i+1)); }
  for(let i=1;i<s.length-1;i++){ if(s[i]!==s[i+1]) add(s.slice(0,i)+s[i+1]+s[i]+s.slice(i+2)); }
  for(let i=1;i<s.length;i++) add(s.slice(0,i)+s.slice(i+1));
  return sample(out).slice(0,n); }
/* Word Quiz rounds from the figurative dataset: idiom meanings + complete-the-simile. */
function buildFigQs(mode,n){ const pool=figPool(); if(pool.length<8) return [];
  if(mode==='idiom'){
    const cand=sample(pool.filter(x=>x.t!=='simile'), n);
    return cand.map(x=>{ const others=mcDistinct(x.m, sample(pool.filter(y=>y!==x&&y.t!=='simile'&&y.m!==x.m)).map(y=>y.m), 3);
      return {kind:'idiom', word:x.p, wordObj:{w:x.p,y:3}, answer:x.m, choices:sample([x.m].concat(others)), prompt:esc(x.p), say:x.p, os:x.os}; }); }
  const sims=pool.filter(x=>x.t==='simile'&&x.vehicle&&x.p.toLowerCase().includes(x.vehicle.toLowerCase()));
  const cand=sample(sims, Math.min(n,sims.length));
  return cand.map(x=>{ const re=new RegExp(x.vehicle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
    const blanked=x.p.replace(re,'____');
    const others=sample([...new Set(sims.filter(y=>y!==x&&y.vehicle.toLowerCase()!==x.vehicle.toLowerCase()).map(y=>y.vehicle))],3);
    return {kind:'simile2', word:x.p, wordObj:{w:x.p,y:3}, answer:x.vehicle, choices:sample([x.vehicle].concat(others)), prompt:esc(blanked), say:blanked.replace('____','hmm'), m:x.m}; });
}
/* NSF vocabulary-bee round: hear/see the word, pick the meaning. */
function buildVocabQs(n){ const pool=nextWords.pool(null,{purpose:'drill',needDef:true}); if(pool.length<8) return [];
  const cand=pickFresh(pool,n); const ws=cand.length>=Math.min(n,5)?cand:sample(pool,Math.min(n,pool.length));
  return ws.map(w=>{ logGameWord(nkey(w.w));
    const near=pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d&&Math.abs((x.y||3)-(w.y||3))<=1);
    /* the word is ON screen in a meaning round, so every option is masked against it: a
       definition that names its own headword would point straight at the answer */
    const ans=maskTxt(w.d,w.w);
    const others=mcDistinct(ans, sample(near.length>=3?near:pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d)).slice(0,24).map(x=>maskTxt(x.d,w.w)), 3);
    return {kind:'vocab', word:w.w, wordObj:w, answer:ans, choices:sample([ans].concat(others)), prompt:esc(w.w), say:w.w, p2:w.p||''}; });
}
function buildMC(mode,n){ const all=nextWords.pool(null,{purpose:mode==='origin'?'lore':'drill'});
  if(mode==='origin'){ const pool=all.filter(w=>w.o && MC_ORIGINS.indexOf(w.o)>=0); if(pool.length<4) return [];
    return pickFresh(pool, Math.min(n,pool.length)).map(w=>{
      const choices=sample([w.o].concat(sample(MC_ORIGINS.filter(o=>o!==w.o),3)));
      return { kind:'origin', word:w.w, wordObj:w, answer:w.o, choices, prompt:esc(w.w)+(w.d?(' — '+esc(trunc(w.d,80))):''), say:w.w };
    }); }
  if(mode==='spell'){ const pool=all.filter(w=>(w.m && nkey(w.m)!==nkey(w.w)) || (w.w.length>=6 && /^[a-z'\- ]+$/i.test(w.w))); if(pool.length<4) return [];
    return pickFresh(pool, Math.min(n,pool.length)).map(w=>{ const wrong=[];
      if(w.m && nkey(w.m)!==nkey(w.w)) wrong.push(w.m);
      misspellings(w.w, 5).forEach(x=>{ if(wrong.length<3 && !wrong.some(y=>nkey(y)===nkey(x)) && nkey(x)!==nkey(w.w)) wrong.push(x); });
      /* top up with DISTINCT honest variants — the old filler pushed one string three times */
      spellVariants(w.w, 6).forEach(x=>{ if(wrong.length<3 && !wrong.some(y=>nkey(y)===nkey(x))) wrong.push(x); });
      const choices=sample([w.w].concat(wrong.slice(0,3)));
      return { kind:'spell', word:w.w, wordObj:w, answer:w.w, choices, prompt:(w.d?('“'+blankHTML((w.d.length>90?w.d.slice(0,88).replace(/\s+\S*$/,'')+'…':w.d),w.w)+'”'):'Which spelling is correct?'), say:w.w };
    }); }
  // meaning (merged: half definition prompts, half sentence prompts)
  const pool=all.filter(w=>(w.d&&w.d.length>4)||(w.s&&/[a-z]/i.test(w.s))); if(pool.length<4) return [];
  return pickFresh(pool, Math.min(n,pool.length)).map(w=>{
    const useSent = w.s && /[a-z]/i.test(w.s) && Math.random()<0.5;
    const choices=sample([w.w].concat(mcDistinct(w.w, sample(all.filter(x=>nkey(x.w)!==nkey(w.w))).slice(0,24).map(x=>x.w), 3)));
    return { kind:(useSent?'sentence':'meaning'), word:w.w, wordObj:w, answer:w.w, choices, prompt:(useSent?blankHTML(w.s,w.w):blankHTML(w.d,w.w)), say:(useSent?w.s:w.w) };
  }); }
function gMisses(g){ return (g.ans?g.ans.filter(a=>!a.ok).map(a=>a.w):[]); }
function gFinishBuzz(){ const g=state.game; g.status='done'; g.bonus=g.bonus||0;   /* the wage is the words, paid as they were spelled (payG) */
  logActivity('buzz','10-Word Warm-Up', {done:g.ans.length,right:g.right,coins:g.bonus||0}, gMisses(g));
  if(g.right>=8){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishBoss(won){ clearGTimer(); const g=state.game; g.status=won?'won':'lost'; g.bonus=g.bonus||0; if(won){ sfx('win'); burstConfetti(150); } else { sfx('lose'); }
  logActivity('boss', won?'Boss Battle — won':'Boss Battle — lost', {done:g.right,right:g.right,coins:g.bonus||0}, []); render(); }
/* The pack reel and the drop reveal are deleted with the draw (FIX-BEE I3). */
function gameShell(statusBar, inner){ return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px">${statusBar}<div style="display:flex;align-items:center;gap:10px">${coinChip()}<button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div></div>
    ${inner}</div>`; }
function typedGame(){ const S=state; const g=S.game; const w=g.list[g.i]; let statusBar='';
  if(g.type==='beat'){ const low=g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:20px;color:${low?'var(--bad)':'var(--accent)'};min-width:54px">${iconSVG('timer',14,2.4)} ${g.timeLeft}s</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else if(g.type==='boss'){ const hpPct=Math.round(g.hp/g.maxhp*100); const hearts='❤️'.repeat(g.lives)+'🖤'.repeat(g.maxlives-g.lives); const sh=(active().pow||{}).shield||0;
    statusBar=`<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-size:20px">👹</span><div style="flex:1;height:11px;border-radius:999px;background:var(--surface2);overflow:hidden;max-width:220px"><div style="height:100%;border-radius:999px;background:linear-gradient(90deg,#FF4D8D,#d63a3a);width:${hpPct}%;transition:width .35s"></div></div><span style="font-size:13px">${hearts}${sh?' <span title="Boss Shields — each absorbs one miss">🛡️×'+sh+'</span>':''}</span></div></div>`; }
  else if(g.type==='champ'){ const low=g.fmt==='timed'&&g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:17px;color:var(--accent)">${iconSVG('bolt',14,2.4)} Challenge</span>${g.fmt==='timed'?`<span style="font-family:var(--display);font-weight:900;font-size:17px;color:${low?'var(--bad)':'var(--accent)'}">${iconSVG('timer',14,2.4)} ${g.timeLeft}s</span>`:`<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">${g.i+1}/${g.total}</span>`}<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else statusBar=`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.list.length} · ✓ ${g.right}</div>`;
  const hint = S.gInfo ? `<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 15px;text-align:left;font-size:13px;line-height:1.55;margin-bottom:14px">${w.d?('<b>Meaning</b> — '+blankHTML(w.d,w.w)):''}${w.d&&w.s?'<br>':''}${w.s?('<b>Sentence</b> — '+blankHTML(w.s,w.w)):''}${w.h?('<br><span style="display:inline-flex;align-items:center;gap:5px;color:var(--accent);vertical-align:middle">'+iconSVG('bulb',14)+'</span> '+blankHTML(w.h,w.w)):''}${(!w.d&&!w.s)?'No meaning for this one — listen closely!':''}${(S.gInfo|0)>=2?`<br><b>Shape</b> — ${String(w.w).replace(/[^a-z]/gi,'').length} letters${w.p?' · '+String(w.p).split(/[-\s]+/).filter(Boolean).length+' beat'+(String(w.p).split(/[-\s]+/).filter(Boolean).length===1?'':'s'):''}`:''}${(S.gInfo|0)>=3&&String(w.w).length>3?`<br><b>Starts with</b> — “${esc(String(w.w)[0].toUpperCase())}”`:''}</div>` : '';
  let bossFb=''; if(g.type==='boss'&&g.last&&g.last.ok&&!g.fb){ bossFb=`<div style="color:#1f9d57;font-weight:800;font-size:13px;margin-bottom:12px">💥 Hit! Boss took damage.</div>`; }
  if(g.fb&&!g.fb.ok){ bossFb=`<span class="sb-sr" data-live-prompt="Not this time. The word is shown letter by letter, then Next word."></span>`+missFeedbackHTML(g.fb.word, g.fb.typed||'', {head:'Look &amp; listen — here is the word, letter by letter', foot:'⚑ Saved for revision'})
      +`<button data-act="gMissGo" style="width:100%;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">Next word →</button>`; }
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,32px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px" data-live-prompt="${escA('Word '+(g.i+1)+'. '+(g.type==='boss'?'Spell it to attack.':'Listen and type.'))}">${g.type==='boss'?'Spell it to attack!':'Listen and type'}</p>
      <button data-act="gSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px"><button data-act="gSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${g.type==='boss'&&((active().pow||{}).reveal||0)>0?`<button data-act="gReveal" style="padding:9px 14px;border-radius:999px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:13px">💡 Reveal letter × ${(active().pow||{}).reveal}</button>`:''}<button data-act="gInfoToggle" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line);${S.gInfo?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}" aria-label="Hint, step ${(S.gInfo|0)+1} of 3">${iconSVG('bulb',14)} ${['Hint','More help','One more','Hide help'][S.gInfo|0]}</button></div>
      ${hint}${bossFb}
      <input data-inp="onType" data-key="gKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="type here" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:14px">
      <button data-act="gSubmit" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${g.type==='boss'?'Attack! ⚔️':'Enter →'}</button>
    </div>`;
  return gameShell(statusBar, inner); }
function ttThemes(){ return ((window.SB_TRIVIA||{}).themes)||[]; }
/* Roll a chapter's cards up into counts — used by the deck header and the Progress analytics. */
function ttChapterStats(c,th){ const deck=ttDeck(th); const out={total:deck.length,practised:0,tested:0,mastered:0,revise:0,touched:0};
  for(const q of deck){ const r=ttRec(c,ttKey(q)); if(r.s){ out[r.s]=(out[r.s]||0)+1; out.touched++; } if(r.r) out.revise++; }
  return out; }
/* A slim segmented bar: mastered | tested | practised | untouched. */
function ttBar(st,h){ const t=st.total||1; const seg=(n,col)=>n?`<span style="width:${(n/t*100).toFixed(2)}%;background:${col};display:block"></span>`:'';
  return `<span style="display:flex;height:${h||6}px;border-radius:99px;overflow:hidden;background:var(--tint-deep,var(--surface2))">
    ${seg(st.mastered,'#2FA35C')}${seg(st.tested,'#E0922E')}${seg(st.practised,'#7C5CFF')}</span>`; }

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrShared) */
Object.assign(app, {
  vocDeck:(k)=>{ state.vocDeck=k;
    /* the set persists per deck, so leaving mid-way and coming back does not reshuffle
       the words the speller is part-way through learning */
    const words=vocCurrentSet(k); if(words.length<5){ state.vocDeck=null; flash('Not enough words here yet — train a list first'); return; }
    set({vocDeck:k, vocWords:words, vocIdx:0, vocFlip:false, vocCheck:null}); setTimeout(()=>{ const w=state.vocWords[0]; if(w) say(w.w); },250); },
  /* Selecting a list here writes c.vocabList only — the spelling list (c.activeList) is
     never touched, so what you study for meaning and what you train for spelling stay
     independent. Reuses the coach's chooser via state.vocPick. */
  vocSelectList:(key)=>{ if(!isListUnlocked(key)){ set({showPaywall:true}); return; }
    const c=active(); c.vocabList=key; save();
    state.vocPick=false; state.coachMode=null; state.vocCheck=null; state.vocWordsOpen=false;
    state.nav='vocab'; state.screen='app';          // the chooser may have been opened from coach
    app.vocDeck('list:'+key); },
  ttChapter:(th)=>{ const c=active(); const seen=((c.ttSeen||{})[ttSeenKey(th)])||0; set({tt:{th:th, i:Math.min(seen, Math.max(0,ttDeck(th).length-1)), flip:false}}); },
  reviseOne:(word)=>{ const c=active(); const m=(c.missed||[]).find(x=>nkey(x.w)===nkey(word)); const src=m||(wordDB().get(nkey(word))); if(!src){ flash('Word not found'); return; }
    state.sessionWords=[{w:src.w,d:src.d||'',s:src.s||'',p:src.p||'',o:src.o||'',r:src.r||'',y:src.y||3,sy:src.sy||'',h:src.h||''}]; state.sessionLabel='Revise: '+src.w; state.gi=0; state.coachSession=false; state.trainBack='revisions'; app.startTrain(); },
  selectList:(key)=>{ if(!isListUnlocked(key)){ set({showPaywall:true}); return; } const c=active(); ensureLists(c); c.activeList=key; if(!c.lists[key]) c.lists[key]={xp:0}; if(!{journey:1,review:1,missed:1}[key]){ if(!c.pinnedLists) c.pinnedLists={}; c.pinnedLists[key]=1; }
    state.sessionListKey=null; ensureCoachWords(key); try{ window.scrollTo(0,0); }catch(e){} set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'train', luTab:'revise', status:'idle', typed:''});
    if(key==='all' && !window.SB_FULL){ loadFullLibrary(()=>{ state.sessionListKey=null; ensureCoachWords('all'); render(); }); }
    flash('Now training: '+listLabel(key)); },
  // ----- Champ Challenge: configurable test-out quiz (timed or count, pick a difficulty) -----
  openChallenge:(key)=>{ const c=active(); ensureLists(c); key=key||activeListKey(); clearGTimer();
    set({nav:'coach', screen:'app', coachMode:'challenge', challengeKey:key, chBand:'level', game:null, typed:'', gInfo:false}); },
  gReveal:()=>{ const g=state.game; if(!g||g.type!=='boss') return; const c=active(); if(((c.pow||{}).reveal||0)<=0) return;
    const w=g.list[g.i]; if(!w) return; const cur=(state.typed||''); if(cur.length>=w.w.length) return;
    c.pow.reveal--; state.typed=w.w.slice(0,cur.length+1); save(); sfx('coin'); render();
    try{ document.querySelector('[data-fkey="gType"],[data-inp="gType"]')?.focus(); }catch(e){} },
  exitGame:()=>{ clearGTimer(); set({game:null, gInfo:false, typed:''}); },
  // Word Quiz hosts a round picker: Meanings / Spellings / Origins, or a Mixed set.
  wqStart:(round)=>{ clearGTimer(); state.gInfo=false; state.typed='';
    /* Word Quiz's meaning, origin and idiom rounds moved into Word Lore (games spec §3.2); the
       spelling round stays here for the Spelling Gym */
    const LORE={meaning:'meanings',vocab:'meanings',origin:'origins',idiom:'idioms',simile:'idioms',mixed:'meanings'};
    if(LORE[round]){ app.openLore(LORE[round]); return; }
    let qs=[];
    if(round==='mixed'){ qs=[].concat(buildMC('meaning',4),buildMC('spell',3),buildMC('origin',3)); qs=sample(qs, Math.min(10,qs.length)); }
    else if(round==='idiom'||round==='simile'){ qs=buildFigQs(round,10); }
    else if(round==='vocab'){ qs=buildVocabQs(10); }
    else { qs=buildMC(round,10); }
    if(qs.length<3){ flash(round==='origin'?'Need a few words with a known origin — train a list first':'Need a few more words for this round — train a list first'); return; }
    state.game={type:'wordquiz',round,qs,i:0,picked:null,right:0,status:'play'};
    set({nav:'games',screen:'app'}); setTimeout(()=>{ const G=state.game; if(G&&G.qs) mcSpeak(G.qs[G.i||0]); },320); },
  gSaySlow:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w,0.6); },
  gKey:(e)=>{ if(e.key==='Enter'){ const g=state.game; if(g&&g.wait&&g.fbGo){ try{ e.preventDefault(); }catch(_){} g.fbGo(); return; } app.gSubmit(); } },
  gMissGo:()=>{ const g=state.game; if(g&&g.fbGo) g.fbGo(); },
  gSubmit:()=>{ const g=state.game; if(!g||g.qs||g.wait) return; const w=g.list[g.i]; const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word, then Enter'); return; }
    const ok=ans===nkey(w.w); logGameWord(nkey(w.w)); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); }
    else { addMiss(w); sfx('wrong'); }
    if(!g.rw) g.rw=[]; g.rw.push({w:w.w, ok});
    const advance=()=>{ g.fb=null; g.wait=false; g.i++; if(g.i>=g.list.length){ const fresh=nextWords(null,g.list.length,{purpose:'drill'}); g.list=fresh.length?fresh:sample(g.list); g.i=0; } state.typed=''; state.gInfo=false; setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[state.game.i]) say(state.game.list[state.game.i].w); },180); };
    // on a miss, EVERY game stops to show the word big and say it — that's how the word sticks
    /* A MISS HOLDS UNTIL TAPPED (FIX-BEE D3). It used to move on after 1.4-3.6s on a timer;
       now the word stays, letter by letter with the why, until Next (tap or Enter). `ms` is
       kept in the signature so the call sites read as before. A timed round's clock keeps
       running while the child reads — their choice, not the app's. */
    const missPause=(fin,ms)=>{ g.fb={ok:false,word:w.w,typed:ans}; g.wait=true; try{ say(w.w); }catch(e){}
      g.fbGo=()=>{ const G=state.game; if(G!==g) return; g.fbGo=null; if(fin){ fin(); } else { advance(); render(); } };
      render(); };
    if(g.type==='buzz'){ g.ans.push({w,val:state.typed,ok}); if(ok){ g.right++; payG(g); gainXp(); }
      const last=!(g.i+1<g.list.length);
      /* 2200ms read as a flash (Amrita 8.26) — a child needs time to LOOK at the
         correct spelling before it moves on. Daily Buzz is untimed, so linger. */
      if(!ok){ missPause(last?gFinishBuzz:null, 3600); } else if(last){ gFinishBuzz(); } else { advance(); render(); } }
    else if(g.type==='beat'){ if(ok){ g.right++; payG(g); gainXp(); advance(); render(); } else { g.wrong++; missPause(null, 1400); } }
    else if(g.type==='boss'){ if(ok){ g.hp=Math.max(0,g.hp-1); g.right++; payG(g); gainXp(); g.last={ok:true,word:w.w}; if(g.hp<=0){ gFinishBoss(true); return; } advance(); render(); }
      else { const cc=active(); if(((cc.pow||{}).shield||0)>0){ cc.pow.shield--; save(); g.last={ok:false,word:w.w,shielded:true}; flash('🛡️ Boss Shield absorbed the miss!'); advance(); render(); }
        else { g.lives--; g.last={ok:false,word:w.w}; if(g.lives<=0){ missPause(()=>gFinishBoss(false), 2000); return; } missPause(null, 2000); } } }
    else if(g.type==='champ'){ g.ans.push({w,ok}); if(ok){ g.right++; payG(g); } else g.wrong++;
      /* a Challenge miss shows the word like every other game — "just a sound" left the
         child not knowing what was correct (Amrita 8.26). Timed runs get a shorter look. */
      const chLast=g.fmt==='count' && (g.i+1>=g.total || g.i+1>=g.list.length);
      if(!ok){ missPause(chLast?gFinishChamp:null, g.fmt==='time'?1600:2400); return; }
      if(chLast){ gFinishChamp(); return; } advance(); render(); }
  }
});

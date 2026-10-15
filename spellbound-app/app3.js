"use strict";
/* =====================================================================
   Bizzing Bee app — part 3: state, logic, views, render + event wiring.
   Ported from the renderVals()/handlers in Bizzing Bee App.dc.html.
   ===================================================================== */
const EVO = EV_NOMEN; // evolution nomenclature (shared with the emblem engine)

/* ---------------- state ---------------- */
const state = {
  screen:'landing', authMode:'signup', email:'', pw:'',
  onbStep:0, draft:{ name:'', age:9, avatar:'bizzy', goal:10 }, addingMore:false,
  children:[], activeIdx:0, theme:'spellbound', mode:'light', premium:false,
  nav:'home', plan:'year', showPaywall:false, toast:'',
  gi:0, typed:'', status:'idle', mood:'happy', sessionRight:0, sessionDone:0,
  showDef:false, showSent:false, showOrigin:false, goalDone:0, _run:0,
  conceptData:null, conceptLoading:false, conceptErr:false, conceptSel:null,
  conceptQuery:'', conceptCat:'All', conceptStep:0, conceptWordsOpen:false,
  conceptView:'all', conceptTier:'easy', conceptPage:0, conceptChapter:null, animOn:false, animScene:0, animNonce:0,
  journeyView:'all', journeyPage:0, lessonGuided:false, lessonStep:0,
  renameKey:null, renameVal:'',
  challengeKey:null, chFmt:'count', chCount:10, chTime:60, chBand:'level',
  sessionWords:null, sessionListKey:null, sessionLabel:'', missedWords:[], sessionOver:false, sessionCorrect:[], sessionWrong:[],
  coachTab:'train', coachMode:'hub', coachDate:null, coachGoal:20,
  themeSel:null, themeTab:'learn',
  coachTargetLabel:'Tricky review', coachTargetKey:'review', coachSrs:{}, coachHistory:{}, coachBestRounds:0,
  customText:'', customWords:[], enrichResult:'', aiPrompt:'', aiWords:[], aiLabel:'', aiLoading:false, aiError:'',
  coachSession:false, trainBack:'home', wr:null, or:null, wrInfoKey:'', orInfoKey:'', orFeedback:'',
  drawerOpen:false,
  luTab:'revise', luWordsOpen:false, luMastered:{}, reviseIdx:0, conceptWordIdx:0, heatReveal:false,
  game:null, gInfo:false, sound:(function(){ try{ return SB_STORE.get('sound')!=='0'; }catch(e){ return true; } })(), parentLogOpen:null, evoSel:null,
  lessonSel:null, lessonWordsOpen:false,
};
/* ---- Word Journeys: 100 etymology lessons (premium) ---- */
const PATTERN_DONE_PCT = 0.7;   // a concept or lesson counts as "done" once 70% of its words are mastered
function lessonsAll(){ return (window.SB_LESSONS&&SB_LESSONS.lessons)||[]; }
 // done at 70%
/* ---- design-feedback store for the 80 evolution tiles (dev/design tool) ---- */
let EVOFB = {};
function loadEvoFB(){ try{ EVOFB=SB_STORE.getJSON('evofeedback',{})||{}; }catch(e){} }
 // the current level's word list
/* ---- Default track: a 20-stage curriculum that gets longer & tougher as you climb ----
   Built once from the real library (40k words), sorted by difficulty tier then length, then
   sliced into 20 stages with growing word counts (14 → 52). Mastering a stage unlocks the next. */
const STAGE_NAMES = ['Sprout','Seedling','Sapling','Climber','Explorer','Voyager','Scholar','Wordsmith','Linguist','Adept','Tactician','Strategist','Virtuoso','Maven','Sage','Luminary','Champion','Grandmaster','Prodigy','Legend'];
const DEFAULT_STAGE_COUNT = 20;
/* THE ALGORITHM, over a word source. tools/build-curriculum.cjs runs exactly this over the boot word tier and writes
   its answer into curriculum-data.js; tests/curriculum.cjs runs it again and compares. */
function buildDefaultStages(nsf){
  const seen=new Set(); const pool=[];
  for(const w of nsf){ if(!w||!w.w) continue; const k=nkey(w.w); if(seen.has(k)) continue;
    if(!(w.d&&w.d.length>4)) continue; if(!/^[a-z]+$/i.test(w.w)) continue; if(w.w.length<3||w.w.length>16) continue;
    seen.add(k); pool.push(w); }
  // ascending difficulty: tier (y) → length → more-common first (higher bp earlier)
  pool.sort((a,b)=> ((a.y||3)-(b.y||3)) || (a.w.length-b.w.length) || ((b.bp||0)-(a.bp||0)) );
  const B=DEFAULT_STAGE_COUNT; const chunk=Math.max(1,Math.floor(pool.length/B)); const stages=[];
  for(let i=0;i<B;i++){ const count=14+i*2; // 14 → 52
    const slice=pool.slice(i*chunk, i*chunk+chunk);
    const picked=[]; const ps=new Set();
    if(slice.length){ const step=slice.length/count;
      for(let j=0;j<count;j++){ const w=slice[Math.floor(j*step)]; if(w){ const k=nkey(w.w); if(!ps.has(k)){ ps.add(k); picked.push(w); } } } }
    stages.push({ n:i+1, label:STAGE_NAMES[i]||('Stage '+(i+1)), words:picked }); }
  // Stage 1 leads with the friendly curated starter words, then fills from the easy pool.
  if(stages[0]){ const cur=[]; const cs=new Set();
    for(const w of WORDS.concat(stages[0].words)){ const k=nkey(w.w); if(!cs.has(k)){ cs.add(k); cur.push(w); } }
    stages[0].words=cur.slice(0,16); }
  return stages; }
let _defStages = null;
/* THE CURRICULUM IS GENERATED DATA (road to 4.5, P1.13 step 1). The 20 stages used to be built HERE, once, from
   whatever SB_DATA.nsf held at the first call: a returning speller's first render built them from the boot word tier
   (words-data.js + words-extra.js + words-patch.js), a new child's first call could come after the second shard and
   build them from 41,000 words. The boot tier is lazy now (boot-lazy group `words1`), so that first call could come
   at any moment — and the stages are the steady state every returning child has been climbing: SB_CURRICULUM.stages
   (curriculum-data.js, written by tools/build-curriculum.cjs from buildDefaultStages over the boot tier, never typed).
   The words map back to the SAME record objects the algorithm picks (stage 1 leads with app2's WORDS; every other key
   is its first record in the shard that passes the filter), so a card, a drill and a count read exactly what they
   read before. Before the shard is in, the stages are their keys as thin records ({w}) — counts and keys only, never
   memoised; nothing that shows a meaning or starts a drill runs before the shard (callAct's gate, wordsIn). */
function defaultStages(){ if(_defStages) return _defStages;
  const C=window.SB_CURRICULUM||{};
  const mk=(by)=>(C.stages||[]).map((ks,i)=>({ n:i+1, label:STAGE_NAMES[i]||('Stage '+(i+1)), words:ks.map(w=>by(w)||{w}) }));
  if(!wordsIn()) return mk(()=>null);   /* keys only, before the shard: never memoised */
  if(!C.stages) return (_defStages=buildDefaultStages((window.SB_DATA&&SB_DATA.nsf)||[]));
  const first=new Map(), starter=new Map();
  for(const w of WORDS){ const k=nkey(w.w); if(!starter.has(k)) starter.set(k,w); }
  for(const w of (SB_DATA.nsf||[])){ if(!w||!w.w) continue; const k=nkey(w.w); if(first.has(k)) continue;
    if(!(w.d&&w.d.length>4)) continue; if(!/^[a-z]+$/i.test(w.w)) continue; if(w.w.length<3||w.w.length>16) continue; first.set(k,w); }
  const stages=mk(w=>first.get(nkey(w))||null);
  if(stages[0]) stages[0].words=C.stages[0].map(w=>starter.get(nkey(w))||first.get(nkey(w))||{w});
  _defStages=stages; return _defStages; }
/* ---- Generalized staging: EVERY list is split into difficulty-sorted stages you climb
   through until the whole list is mastered. Default uses the 20 curated stages above;
   other lists are auto-chunked (≤16 stages) by difficulty. ---- */
const _stageCache = {};
const _DYNAMIC_LISTS = { missed:1, custom:1, ai:1, review:1 }; // recompute (don't cache) — contents change
/* ===== Theme Journeys — 50 semantic themes, self-assembled from the word database.
   A word joins a theme when its DEFINITION matches the theme's keyword classifier, so the
   themes stay in sync with the library and need no hand-tagging. Theme lists ride the same
   Level ladder as every other list (th_<id> keys). ===== */
/* a theme with a minBand (themes-data.js) is not offered to a younger child anywhere — the catalogue,
   a Squares board, a game's draw (games spec §1.2). One gate, here, so no door can forget it. */
function themeDefs(){ const all=(window.SB_THEMES&&SB_THEMES.themes)||[]; let c=null; try{ c=active(); }catch(e){}
  return c?all.filter(t=>!t.minBand||bandAllows(t.minBand,c)):all; }
function themeOf(id){ return ((window.SB_THEMES&&SB_THEMES.themes)||[]).find(t=>t.id===id); }   /* by id, ungated: the gate is the catalogue (themeDefs) and the picker (themeOpen) */
let _themeCache={};
// The pool themes classify over: the 40k core library normally, deepening to the full 130k
// library automatically once it has been loaded (via "Entire library"). Cache keys on pool size.
function themePool(){ const full=window.SB_FULL; return (full&&full.length)?full:((window.SB_DATA&&SB_DATA.nsf)||[]); }
function themeWords(id){ const pool=themePool();
  const hit=_themeCache[id]; if(hit && hit._n===pool.length) return hit;
  const t=themeOf(id); if(!t) return [];
  // Fast path: the base JSON is enriched with baked theme tags (w.t). The keyword classifier
  // remains as a fallback for any word without tags (e.g. custom/pasted words).
  let re=null; try{ if(t.re) re=new RegExp(t.re,'i'); }catch(e){}
  /* Origin themes cut the library the way the books and the Word Atlas do: by the
     language a word came from, not by what it means. `ore` matches the origin field;
     `tag` narrows to a baked tag as well, which is how the eponym clusters work —
     "an eponym whose NAME is French" is two conditions, not one. */
  let ore=null; try{ if(t.ore) ore=new RegExp(t.ore,'i'); }catch(e){}
  const tag=t.tag||null;
  const out=[];
  if(ore || tag){
    /* the catch-all eponym shelf: tagged, but not claimed by any lettered cluster */
    let claimed=null;
    if(tag && !ore){ claimed=[]; for(const o of themeDefs()) if(o.tag===tag && o.ore) claimed.push(new RegExp(o.ore,'i')); }
    for(const w of pool){ if(!w||!w.w) continue;
      if(tag && (!w.t || w.t.indexOf(tag)<0)) continue;
      const o=w.o||'';
      if(ore){ if(!ore.test(o)) continue; }
      else if(claimed && claimed.length && claimed.some(r=>r.test(o))) continue;
      out.push(w); }
  } else {
    for(const w of pool){ if(!w||!w.w) continue;
      if(w.t){ if(w.t.indexOf(id)>=0) out.push(w); }
      else if(re && w.d && re.test(w.d)) out.push(w); }
  }
  out._n=pool.length; _themeCache[id]=out; return out; }
function themeKey(id){ return 'th_'+id; }
function isThemeKey(key){ return typeof key==='string' && key.slice(0,3)==='th_'; }
function myThemes(){ const c=active(); const pins=c.pinnedLists||{}; return themeDefs().filter(t=>pins[themeKey(t.id)]); }
function rawListWords(key){ if(key==='journey') return journeySorted();
  if(key==='ultra') return ((window.ADV&&ADV.pool)?ADV.pool():[]); if(isThemeKey(key)) return themeWords(key.slice(3)); const cat=coachCatalog().find(c=>c.key===key); return (cat&&cat.words&&cat.words.length)?cat.words:WORDS; }
/* Ultra Champions Journey stages: one stage per sprint day, so the level ladder in the
   ordinary Practice shell lines up exactly with the plan's days. The generic chunker caps
   at 24 stages, which over 114k words would be ~4,800 a "level" — unusable. */
function ultraStages(){
  const pool=(window.ADV&&ADV.pool)?ADV.pool():[];
  const size=(window.ADV&&ADV.daySize)?ADV.daySize():200;
  const ck='ultra|'+pool.length+'|'+size;
  if(_ultraStages&&_ultraStages._ck===ck) return _ultraStages;
  const out=[]; for(let i=0;i<pool.length;i+=size){ const ws=pool.slice(i,i+size);
    out.push({ n:out.length+1, label:'Day '+(out.length+1), words:ws }); }
  if(!out.length) out.push({ n:1, label:'Day 1', words:[] });
  out._ck=ck; out._n=pool.length; _ultraStages=out; return out; }
let _ultraStages=null;
/* Eponyms are one concept ("the spelling follows a name") but many spelling systems —
   a Greek hero's name and a French inventor's name break in different places. So the
   eponym list's Levels ARE the clusters: one Level per donor-language group, each ramped
   easy→hard by trickiness inside. */
const EPON_CLUSTERS=[
  ['Greek myth & names',        /greek/i],
  ['Latin & Roman names',       /latin/i],
  ['French names',              /french|anglo-norman/i],
  ['Italian & Spanish names',   /italian|spanish|portuguese/i],
  ['German & Nordic names',     /german|dutch|norse|danish|swedish|norwegian|finnish/i],
  ['English & Celtic names',    /english|scots|irish/i] ];
let _eponStages=null;
function eponymStages(){ const ws=catStatic().eponyms||[];
  if(_eponStages&&_eponStages._n===ws.length) return _eponStages;
  const used=new Set(); const stages=[];
  for(const [label,re] of EPON_CLUSTERS){
    const grp=ws.filter(w=>!used.has(nkey(w.w))&&re.test(w.o||''));
    if(grp.length>=8){ grp.forEach(w=>used.add(nkey(w.w)));
      grp.sort((a,b)=>(spellDiff(a)-spellDiff(b))||((b.bp||0)-(a.bp||0)));
      stages.push({ n:stages.length+1, label, words:grp }); } }
  const rest=ws.filter(w=>!used.has(nkey(w.w)));   // unknown or tiny origins gather here
  if(rest.length){ rest.sort((a,b)=>(spellDiff(a)-spellDiff(b))||((b.bp||0)-(a.bp||0)));
    stages.push({ n:stages.length+1, label:'World names', words:rest }); }
  if(!stages.length) stages.push({ n:1, label:'Eponyms', words:[] });
  stages._n=ws.length; _eponStages=stages; return stages; }
function listStages(key){
  if(key==='default') return defaultStages();
  if(key==='journey') return journeyStages();
  if(key==='ultra') return ultraStages();
  if(key==='eponyms') return eponymStages();
  const raw=rawListWords(key); const cached=_stageCache[key];
  if(!_DYNAMIC_LISTS[key] && cached && cached._n===raw.length) return cached;
  const sorted=raw.filter(w=>w&&w.w).sort((a,b)=> (spellDiff(a)-spellDiff(b)) || ((b.bp||0)-(a.bp||0)) );
  const n=sorted.length; let stages;
  if(n<=WORK_MAX){ stages=[{ n:1, label:'Stage 1', words:sorted }]; }
  else { const N=Math.max(2,Math.min(24,Math.round(n/50))); const size=Math.ceil(n/N); stages=[];
    for(let i=0;i<N;i++){ const words=sorted.slice(i*size,(i+1)*size); if(words.length) stages.push({ n:stages.length+1, label:'Stage '+(stages.length+1), words }); } }
  stages._n=raw.length; if(!_DYNAMIC_LISTS[key]) _stageCache[key]=stages; return stages; }
function listStageIdx(c,key){ c=c||active(); const N=listStages(key).length; return Math.max(0, Math.min(N-1, (getList(c,key).stage||0))); }
function curStage(c,key){ return listStages(key)[listStageIdx(c,key)]; }
function stageWords(key){ const s=curStage(active(),key); return (s&&s.words)||WORDS; }
function stageComplete(c,key){ c=c||active(); const s=curStage(c,key); return s && s.words.length>0 && s.words.every(w=>state.luMastered[nkey(w.w)]); }
function stagesDone(c,key){ c=c||active(); return listStageIdx(c,key) + (stageComplete(c,key)?1:0); }

/* ===== Spelling trickiness — the difficulty that matters in a bee. =====
   A difficult word is not a rare or long one: it is a word whose spelling the SOUND does
   not give away — silent letters, sound-alike endings, donor-language patterns, spellings
   inherited from a person's name. trickAnal reads only the word itself (plus its recorded
   common misspelling) and returns how much of the spelling must be KNOWN rather than
   heard, and which concept family explains it. Ramps and clusters are built on this;
   rarity (y) and length survive only as minor terms inside spellDiff. */
const TRICK_LABELS={ epon:'Named after someone', silent:'Silent letters', fr:'French patterns', gk:'Greek patterns', end:'Sound-alike ending', dbl:'Double letters', vow:'Tricky vowels', hom:'Sound-alike word', plain:'Straight spelling' };
const TRICK_RANK={plain:0,dbl:1,vow:2,end:3,hom:4,silent:5,gk:6,fr:7,epon:8};   // study order: phonics-adjacent first, story-words last

/* homonyms, alternate pronunciations & diacritics (sounds-data.js).
   Lookups guard against Object.prototype keys — "constructor" is a real library word. */
const _hasOwn=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
/* Ask boot-lazy for a deferred data file at the door of the feature that needs
   it. Safe to call repeatedly and safe to call before boot-lazy exists. */
function lazyNeed(what, cb){ try{ if(window.SB_LAZY) return SB_LAZY.need(what, cb); }catch(e){} if(cb) cb(); }
/* IS THE BOOT WORD TIER IN? (road to 4.5, P1.13 step 1) words-data.js + words-extra.js + words-patch.js left the first
   screen: boot-lazy group `words1`, first on the idle queue and in every word door's group. Home draws without it
   (SB_CURRICULUM carries what Home shows); anything that starts a drill or shows a meaning waits for it (callAct). */
function wordsIn(){ try{ return !window.SB_LAZY||SB_LAZY.ready('words1'); }catch(e){ return true; } }
/* THE APP3 SPLIT (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gz). app3.js keeps what the first screens and the
   shell draw and every name another file calls by bare name; each screen's own code lives in a lazy file, fetched by
   boot-lazy at the screen's door (SCR_GROUP / SCR_NAV / SCR_ACTS below, CLAUDE.md "Road to 4.5, P1 — the app3 split").
     scrReady(g)        the group is in (or there is no boot-lazy: everything is)
     scrDraw(g, fn)     draw fn() if the group is in; else ask for it, draw nothing, and render when it lands — fn is
                        an ARROW (()=>viewX()): a bare viewX would be read before its file exists
     scrStub(g, k)      app[k] until its file lands: loads the group, then runs the real action with the same arguments */
/* the screens whose view lives in a lazy file, by nav: viewApp's guard holds each until its group is in. A new lazy
   screen adds its nav here, with its file's group. */
const SCR_NAV = { concepts:'scrLib', levelup:'scrGym', train:'scrGym', coach:'scrGym', quest:'scrGym', explore:'scrLib', themes:'scrLib', figurative:'scrLib', vocab:'scrLib', quotes:'scrLib', trivtrain:'scrLib', ipatrain:'scrLib', firstword:'scrGym', typing:'scrLib', builder:'scrLib', leveltest:'scrGym', beeband:'scrGym', coachdesk:'scrGym', traps:'scrGym', revisions:'scrGym', evolution:'scrMe', collection:'scrMe', shop:'scrMe', help:'scrMe', finder:'scrFinder', games:'scrGames', daily:'scrGames', dailybuzz:'scrGames', forge:'scrGames', gym:'scrGames', sq:'scrGames', trivia:'scrGames', progress:'scrGrown', parent:'scrGrown', journeys:'scrLib', debug:'scrTools', voicetest:'scrTools', evofeedback:'scrTools' };
const SCR_GROUP = { scrLib:'scrLib', scrGym:'scrGym', scrGrown:'scrGrown', scrGames:'scrGames', scrMe:'scrMe', scrTools:'scrTools' };
function scrReady(g){ try{ return !window.SB_LAZY||SB_LAZY.ready(g); }catch(e){ return true; } }
function scrDraw(g, fn){ if(scrReady(g)) return fn(); lazyNeed(g, ()=>render()); return ''; }
function scrStub(g, k){ const f=function(){ const a=arguments, self=this;
    lazyNeed(g, ()=>{ const real=app[k]; if(typeof real==='function'&&real!==f&&!real._scr) real.apply(self&&self!==window?self:app, a); else render(); }); };
  f._scr=g; return f; }
let _homIdx=null;
function homIndex(){ if(_homIdx) return _homIdx; const m=Object.create(null); try{ (window.SB_HOM||[]).forEach(g=>g.forEach(w=>{ m[w]=g; })); }catch(e){} return (_homIdx=m); }
function homPartners(w){ const g=homIndex()[nkey(w)]; return g?g.filter(x=>x!==nkey(w)):[]; }
function altPron(w){ const o=window.SB_ALT_PRON||{}; const k=nkey(w); return _hasOwn(o,k)?o[k]:null; }
function diacritic(w){ const o=window.SB_DIACRITICS||{}; const k=nkey(w); if(_hasOwn(o,k)) return o[k];
  try{ const k2=k.normalize('NFD').replace(/[̀-ͯ]/g,''); if(k2!==k&&_hasOwn(o,k2)) return o[k2]; }catch(e){}
  return null; }
function trickAnal(w){ if(w._tk) return w._tk;
  /* while the boot tier is landing (its three files arrive one after another), nothing is cached on a record: trickSeal
     scores the whole tier when it is in, the way Home's first render always did */
  try{ if(window.SB_LAZY&&SB_LAZY.state('words1')==='loading') return trickRaw(w); }catch(e){}
  return trickRaw(w,true); }
/* THE BOOT TIER'S SCORES (P1.13 step 1). Home's first render used to sort every boot record by spellDiff before any
   lazy file had landed, so each one carried a score with NO homophone bonus (SB_HOM is in sounds-data.js, lazy) for
   the rest of the visit — the score every list, ladder and cluster order a returning speller saw was built on. Home no
   longer touches the records, so when `words1` lands they are scored here, the same way, before anything reads them. */
function trickSeal(recs){ recs=recs||(window.SB_DATA&&SB_DATA.nsf)||[];
  if(!window.SB_TIER1_N) window.SB_TIER1_N=recs.length;   /* the boot tier's size, kept: a reader that must not change when words2 appends (the Quotes tool's words, P3.21) cuts here */
  const h=_homIdx; _homIdx=Object.create(null);
  try{ for(const w of recs) if(w&&w.w&&!w._tk) trickRaw(w,true); }finally{ _homIdx=h; } }
function trickRaw(w,keep){
  const s=String(w.w||'').toLowerCase(), p=String(w.p||'');
  const f={epon:0,silent:0,fr:0,gk:0,end:0,dbl:0,vow:0};
  if((w.t||[]).indexOf('eponyms')>=0) f.epon=12;
  if(/^(pn|ps|pt|mn|gn|kn|wr|rh|x)/.test(s)) f.silent+=10;
  if(/(mb|mn|gn)$/.test(s)) f.silent+=8;
  if(/gh/.test(s)&&!/ough|augh/.test(s)) f.silent+=6;
  if(/(stle|sten|ften)$/.test(s)) f.silent+=8;
  if(/eau|oux|oir|ille|esque$|que$|gue$|ette$/.test(s)) f.fr+=9;
  if(/et$/.test(s)&&/ay$/i.test(p)) f.fr+=9;
  if(/ph|rrh|chn|(?:^|[bcdfgklmnprstz])y[bcdfgklmnprstz]/.test(s)) f.gk+=8;
  if(/ch/.test(s)&&/k/i.test(p)&&!/ch/i.test(p)) f.gk+=8;
  if(/ae|oe(?!ver)/.test(s)) f.gk+=6;
  if(/(able|ible)$/.test(s)) f.end+=8;
  if(/(ance|ence|ancy|ency|ant|ent)$/.test(s)) f.end+=7;
  if(/(ary|ery|ory|ury)$/.test(s)) f.end+=6;
  if(/(cede|ceed|sede)$/.test(s)) f.end+=10;
  if(/(eous|ious|uous)$/.test(s)) f.end+=6;
  const dbl=s.match(/([bcdfghjklmnpqrstvz])\1/g); if(dbl) f.dbl+=Math.min(10,5*new Set(dbl).size);
  if(homIndex()[s]) f.hom=8;                         // a homonym: only the MEANING picks the spelling
  if(/ei|ie/.test(s)) f.vow+=4;
  if(/ough|augh/.test(s)) f.vow+=9;
  if(/[aeiou]{3}/.test(s)) f.vow+=5;
  let score=0; for(const k in f) score+=f[k];
  if(w.m&&String(w.m).toLowerCase()!==s) score+=7;   // a recorded common misspelling is evidence in itself
  score=Math.min(60,score);
  let cls='plain',best=4; for(const k in f){ if(f[k]>best){best=f[k];cls=k;} }
  if(f.epon) cls='epon';                             // the name-story concept outranks its side-effects
  if(keep){ try{ w._tk={score,cls}; }catch(e){} }
  return {score,cls}; }
function trickScore(w){ return trickAnal(w).score; }
function trickLabel(w){ const a=trickAnal(w); return (a.cls!=='plain'&&a.score>=10)?TRICK_LABELS[a.cls]:null; }
function spellDiff(w){ return trickAnal(w).score*2 + (w.y||3)*5 + Math.min(14,String(w.w||'').length)*0.5; }
// inside one Level, sit concept-mates together (stable within each cluster, so the ramp holds)
function clusterLevel(ws){ return ws.map((w,i)=>({w,i,r:TRICK_RANK[trickAnal(w).cls]||0})).sort((a,b)=>(a.r-b.r)||(a.i-b.i)).map(x=>x.w); }
window.SB_TRICK={score:trickScore,label:trickLabel,diff:spellDiff,anal:trickAnal};

/* ===== The Bizzing Bee Journey — ONE Level ladder.
   Levels 1–20 = "Bizzing Bee Champ": the ~1,600 highest-value bee words, ramped easy→hard
   by spelling trickiness (see above), not rarity.
   Levels 21+  = "The Champion's Library": the rest of the 40,000, 120 a level (Premium).
   You climb a Level by mastering its words OR passing its Champ Challenge (test-out). ===== */
const CHAMP_LEVELS = 20;
const LIB_LEVEL_SIZE = 120;
const champLevelSize = (k) => 24 + (k-1)*6;                 // L1=24 … L20=138  (~1,620 total)
let _champWordCount = null;
function champWordCount(){ if(_champWordCount!=null) return _champWordCount; let s=0; for(let k=1;k<=CHAMP_LEVELS;k++) s+=champLevelSize(k); _champWordCount=s; return s; }
/* THE ALGORITHM, over a word source (tools/build-curriculum.cjs runs it over the boot tier; tests/curriculum.cjs again) */
function buildJourneySorted(src){ const seen=new Set(); const pool=[];
  for(const w of src){ if(!w||!w.w) continue; const k=nkey(w.w); if(seen.has(k)) continue; seen.add(k); pool.push(w); }
  pool.sort((a,b)=> (spellDiff(a)-spellDiff(b)) || ((b.bp||0)-(a.bp||0)) ); // easy→hard by trickiness
  return pool; }
let _journeySorted = null;
/* THE LADDER IS GENERATED DATA too (road to 4.5, P1.13 step 1): SB_CURRICULUM.ladder, the order buildJourneySorted
   gives the boot word tier — which is what a returning speller's first render built and kept (_journeySorted was never
   dropped), with no homophone bonus (SB_HOM is lazy and had not landed; trickSeal below keeps the boot records' scores
   that way). It used to be timing-dependent: a new child whose first call came after words-data-2.js climbed a
   41,000-word ladder that night and an 8,000-word one the next day. Keys map to the shard's first record for each. */
function journeySorted(){ if(_journeySorted) return _journeySorted;
  const C=window.SB_CURRICULUM||{};
  if(!wordsIn()) return (C.ladder||[]).map(w=>({w}));   /* keys only, before the shard: never memoised */
  if(!C.ladder) return (_journeySorted=buildJourneySorted((window.SB_DATA&&SB_DATA.nsf)||[]));
  const first=new Map(); for(const w of (SB_DATA.nsf||[])){ if(!w||!w.w) continue; const k=nkey(w.w); if(!first.has(k)) first.set(k,w); }
  _journeySorted=C.ladder.map(w=>first.get(nkey(w))||{w}); return _journeySorted; }
let _journeyOrder = null;
function journeyOrder(){ if(_journeyOrder) return _journeyOrder;
  const all=journeySorted();
  const byBp=all.slice().sort((a,b)=> ((b.bp||0)-(a.bp||0)) || (spellDiff(b)-spellDiff(a)) ); // most bee-relevant first
  const champ=byBp.slice(0, champWordCount());
  champ.sort((a,b)=> (spellDiff(a)-spellDiff(b)) || ((b.bp||0)-(a.bp||0)) ); // ramp the champ band easy→hard by trickiness
  const champSet=new Set(champ.map(w=>nkey(w.w)));
  const rest=all.filter(w=>!champSet.has(nkey(w.w)));     // already easy→hard
  _journeyOrder={champ,rest}; return _journeyOrder; }
let _journeyStages = null;
function journeyStages(){ if(_journeyStages) return _journeyStages;
  const {champ,rest}=journeyOrder(); const stages=[]; let i=0;
  for(let k=1;k<=CHAMP_LEVELS;k++){ const sz=champLevelSize(k); stages.push({ n:k, label:'Stage '+k, words:champ.slice(i,i+sz), champ:true }); i+=sz; }
  /* Sprinkle the Scripps championship words across the toughest Champ levels (15–20).
     NOT ON THE LADDER A CHILD CLIMBS (P1.13 step 1, measured): _journeyStages was memoised at Home's first render, and
     scripps-data.js is lazy (the `lists` group, the idle queue), so no returning speller's ladder ever had them — a
     child on the Journey climbed this one, unsprinkled. With the boot tier lazy the first build can come after
     scripps lands, which would re-cut every Library level under a child's feet. The ladder stays the one they climb;
     sprinkling is an owner's call, made as data (tools/build-curriculum.cjs), never by load timing. */
  const scripps=[];
  if(scripps.length){ const seen=new Set(); stages.forEach(s=>(s.words||[]).forEach(w=>seen.add(nkey(w.w))));
    const fresh=scripps.filter(w=>w&&w.w&&!seen.has(nkey(w.w)));
    const startLvl=15, span=CHAMP_LEVELS-startLvl+1; // 15..20 → 6 levels
    fresh.forEach((w,ix)=>{ stages[startLvl-1+(ix%span)].words.push(w); }); }
  // A sprinkled Scripps word can also live in the 40k library pool — drop it from the library so no word appears in two Levels.
  const placed=new Set(); stages.forEach(s=>(s.words||[]).forEach(w=>placed.add(nkey(w.w))));
  const lib=rest.filter(w=>!placed.has(nkey(w.w)));
  for(let j=0;j<lib.length;j+=LIB_LEVEL_SIZE){ const n=stages.length+1; stages.push({ n, label:'Library '+(n-CHAMP_LEVELS), words:lib.slice(j,j+LIB_LEVEL_SIZE), champ:false }); }
  stages.forEach(s=>{ s.words=clusterLevel(s.words); });   // concept-mates study together inside a Level
  stages._n=journeySorted().length; _journeyStages=stages; return _journeyStages; }
function isChampDone(c){ c=c||active(); return (getList(c,'journey').stage||0) >= CHAMP_LEVELS; } // cleared all 20 champ levels
// words contained in levels up to & including the current one = the "reached" frontier
function journeyReached(c){ c=c||active(); const st=journeyStages(); const idx=listStageIdx(c,'journey'); let s=0; for(let i=0;i<=idx&&i<st.length;i++) s+=st[i].words.length; return s; }

/* ---------------- helpers ---------------- */
const esc = (s) => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA = (s) => esc(s).replace(/"/g,'&quot;');
// escape text, then hide the target word (and simple inflections) behind a fill-in blank
/* ---- clue masking ----
   Hide not just the exact target spelling but the base/root it is built from, so
   an inflected entry never leaks its answer. "plural of cat" (cats), "past tense
   of run" (ran), "jumped: past tense of jump" all become "… of ▁▁". */
function _maskStem(word){ let s=(word||'').toLowerCase().trim();
  if(/ies$/.test(s)&&s.length>4) s=s.slice(0,-3)+'y';
  else if(/(ied)$/.test(s)&&s.length>4) s=s.slice(0,-3)+'y';
  else if(/(ed|es|er|ly)$/.test(s)&&s.length>4) s=s.slice(0,-2);
  else if(/ing$/.test(s)&&s.length>5) s=s.slice(0,-3);
  else if(/s$/.test(s)&&!/(ss|us|is)$/.test(s)&&s.length>3) s=s.slice(0,-1);
  s=s.replace(/([bcdfghjklmnpqrstvwxz])\1$/,'$1'); // running->runn->run, bigger->bigg->big
  return s; }
function _maskRules(word){ const w=(word||'').trim(); if(!w) return [];
  const e=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const out=[];
  out.push({re:new RegExp('\\b'+e(w)+'[a-z]*\\b','ig'), grp:0});                 // word + forward inflections
  const st=_maskStem(w); if(st&&st.length>=3&&st!==w.toLowerCase()) out.push({re:new RegExp('\\b'+e(st)+'[a-z]*\\b','ig'), grp:0}); // its root (cats->cat)
  // grammatical pointers: blank the base that follows them (handles irregulars: ran->"past tense of ▁▁")
  out.push({re:/\b(?:plurals?|singular|past tense|present tense|past participle|present participle|comparatives?|superlatives?|gerund|third[- ]person singular|third[- ]person|inflection|conjugation|diminutive|abbreviations?|contraction|variant spelling|variant)\s+(?:form\s+)?of\s+([A-Za-z][A-Za-z'\-]*)/ig, grp:1});
  return out; }
function _applyMasks(text, word, BLANK){ let t=text||'';
  // grammatical-pointer bases in THIS text ("plural of aalii …") get blanked everywhere,
  // not only right after "of", so a second mention later in the gloss can't leak the root.
  const bases=new Set(); const ptr=/\b(?:plurals?|singular|past tense|present tense|past participle|present participle|comparatives?|superlatives?|gerund|inflection|conjugation|diminutive)\s+(?:form\s+)?of\s+([A-Za-z][A-Za-z'\-]{2,})/ig;
  let mm; while((mm=ptr.exec(t))){ if(mm[1]) bases.add(mm[1].toLowerCase()); }
  _maskRules(word).forEach(({re,grp})=>{ t=t.replace(re,(m,g1)=>{ if(grp===1&&g1!=null) return m.slice(0,m.length-g1.length)+BLANK; return BLANK; }); });
  bases.forEach(base=>{ if(base.length>=3){ try{ t=t.replace(new RegExp('\\b'+base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','ig'),BLANK); }catch(e){} } });
  return t; }
function blankHTML(text, word){
  const t = esc(text||''); const w = (word||'').trim(); if(!w) return t;
  const BLANK='<span style="display:inline-block;min-width:58px;border-bottom:2px solid var(--accent);vertical-align:baseline">&nbsp;</span>';
  try{ return _applyMasks(t, w, BLANK); }catch(e){ return t; }
}
const trunc = (s,n) => { s=s||''; return s.length>n ? esc(s.slice(0,n).replace(/\s+\S*$/,''))+'…' : esc(s); };
const fmtN = (n) => String(n==null?'':n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
function set(patch){ Object.assign(state, patch); render(); }
let _toastTimer = null;
/* THE TOAST MUST NOT REBUILD THE APP WHILE A GAME IS ON SCREEN.
   flash() called render(), which rebuilds the entire app DOM out of ~1MB of template
   strings. The arcade games run in their OWN fullscreen overlay appended to <body>, and
   they flash constantly — every lap, every hazard, every power-up, every fizzled box — so
   each one cost a full app rebuild underneath a game that is trying to hold 60fps, and
   scheduleToast cost a SECOND one 2.2 seconds later when the toast cleared. Measured in
   the Grand Prix: a 100ms frame, which at top speed carries the kart 4.6 road segments.
   That is the reported lag, and it is why the item box could be missed.
   When an overlay is up the toast is written straight into the DOM instead. */
function _gameOverlayUp(){ try{ return !!document.querySelector('.arc-play,.bz-play,.sg-hud,.gym-stage'); }catch(e){ return false; } }
function _paintToast(){ try{
    let el=document.getElementById('sb-toast-live');
    if(!state.toast){ if(el) el.remove(); return true; }
    if(!el){ el=document.createElement('div'); el.id='sb-toast-live'; el.className='sb-toast';
      el.style.cssText='position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:9999;pointer-events:none;background:var(--accent);color:#fff;font-weight:800;font-size:15px;padding:13px 22px;border-radius:14px;box-shadow:0 8px 26px rgba(10,6,26,.34);max-width:min(90vw,460px);text-align:center';
      document.body.appendChild(el); }
    el.textContent=state.toast; _toastVsMiss(); return true;
  }catch(e){ return false; } }
/* NOTHING COVERS THE MISS PANEL (FIX2 #1). The letter-by-letter diff IS the lesson, and a toast
   ("So close — 2 letters off!") was drawn straight across it at the bottom of the screen, on a
   desktop and on a phone. While a miss panel is on screen no toast shows — on every surface that
   draws one (practice, the Atlas quiz gate, the Mock Bee, the games), because it is decided here,
   after every paint, not at each place that grades. The near-miss words moved into the panel. */
function _toastVsMiss(){ try{
    const up=[...document.querySelectorAll('.sb-miss')].some(m=>m.getClientRects().length>0);
    document.querySelectorAll('.sb-toast').forEach(t=>{ t.style.display=up?'none':''; });
  }catch(e){} }
/* the near-miss headline for the panel: said where it cannot cover anything */
function nearHead(typed,w){ try{ const a=nkey(typed), b=nkey(w); const d=lev(a,b);
    if(a && d>0 && d<=2 && b.length>=4) return 'So close — '+d+' letter'+(d>1?'s':'')+' off. Here is the word, letter by letter'; }catch(e){}
  return undefined; }
function flash(msg){ state.toast = msg; scheduleToast();
  if(_gameOverlayUp() && _paintToast()) return;      // a game is running: do not rebuild the app
  render(); }
function scheduleToast(ms){ clearTimeout(_toastTimer); _toastTimer = setTimeout(() => { state.toast='';
  if(_gameOverlayUp() && _paintToast()) return;
  try{ document.getElementById('sb-toast-live')?.remove(); }catch(e){}
  render(); }, ms||2200); }

const nkey = (w) => (w||'').toLowerCase().trim();
const sample = (arr,n) => { const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i];a[i]=a[j];a[j]=t; } return n?a.slice(0,n):a; };
/* Judging a TYPED spelling. Twenty-eight headwords carry diacritics — détente,
   protégé, consommé, soupçon — and a child on an ordinary keyboard cannot type
   them. Every one has an unaccented spelling that English dictionaries list and
   a pronouncer would accept, so the accent must not decide the answer. This is
   deliberately NOT folded into nkey(): nkey also builds the voice-clip
   filenames, and changing it would point those 28 words at clips that do not
   exist. Answer judging only. */
const spellKey = (v) => String(v == null ? '' : v).normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const sameSpelling = (a, b) => spellKey(a) === spellKey(b);
const demo = () => ({ name:'Speller', age:9, avatar:'bee', theme:'spellbound', level:1, acc:0, goal:10, week:[0,0,0,0,0,0,0], xp:0 });
const active = () => { const c = state.children[state.activeIdx] || demo(); ensureLists(c); return c; };
const curWord = () => { const L=(state.sessionWords&&state.sessionWords.length)?state.sessionWords:WORDS; return L[state.gi % L.length]; };
const formIdx = (lvl) => Math.min(9, Math.max(0, Math.ceil((lvl||1)/2)-1));
/* RANK is the one ladder, and its rungs keep their names and their emblem whatever
   world the speller is wearing. Worlds change the app's palette, type and motif —
   they no longer rename the achievement, which is what made "Level 6" mean Bulb in
   one world and Larva in another. */
const RANK_NAMES = ['Egg','Hatchling','Larva','Grub','Pupa','Cocoon','Worker','Forager','Spellbinder','Queen Bee'];
const rankName = (i) => RANK_NAMES[Math.max(0,Math.min(9,i|0))];
const rankXp = (c) => { c=c||active(); let t=0; try{ Object.keys(c.lists||{}).forEach(k=>{ t+=((c.lists[k]&&c.lists[k].xp)||0); }); }catch(e){} return t; };
const rankOf = (c) => { c=c||active(); const xp=rankXp(c); const lv=levelFromXp(xp).level;
  return { xp:xp, level:lv, form:formIdx(lv), name:rankName(formIdx(lv)) }; };
/* THE ONE VISIBLE LEVEL (FIX-BEE C6). Band, Stage, Tier, Evolution and Level were five
   ladders a child could see. Now one thing is shown as "your level": rankOf — words spelled
   right anywhere, through the same curve as ever — wearing the bee form for that level as its
   emblem. It moves ONLY in gainXp, which only a right answer calls: never time on the app,
   never coins, never a game of luck, and it never goes down. The Bee Band stays UNDERNEATH as
   the word-difficulty dial diffRange() reads; it is shown as "word difficulty", never as a
   level. Batch A places the header pill; this is what it says. Guard: tests/one-level.cjs. */
function oneLevel(c){ c=c||active(); const r=rankOf(c); const lp=levelFromXp(r.xp);
  return { level:r.level, form:r.form, name:rankName(r.form), xp:r.xp, into:lp.into, need:lp.need, toNext:Math.max(0,lp.need-lp.into),
    label:'Level '+r.level+' · '+rankName(r.form) }; }
window.SB_ONE_LEVEL = oneLevel;
function rankArt(i,size){ try{ return evEmb('spellbound',Math.max(0,Math.min(9,i|0))).replace('width="54" height="58"','width="100%" height="100%"'); }catch(e){ return ''; } }
/* WHERE A WORD'S ORIGIN WAS CHECKED (road to 4.5, P3.31 — rubric Z1, sources on factual content). Of the app's
   etymology, only Word Forge's table names a source dictionary: each row cites the entry it was checked against
   (forge-data.js `src.entry`) and the table names the dictionary (`sources.etymology`). So an etymology card names a
   source ONLY for those words, with the facts that row took from it (its origin language and donor form) — read from
   that data, never typed here. Every other word's card names none, because its data names none (the library's own
   lines are written for this app — LICENSES-THIRD-PARTY.md). The table is lazy (`forgeData`, on the idle queue): until
   it lands a card names nothing and asks for it. Shown on the word card, the set deck and My Feed's origin cards.
   Guard: tests/etym-source.cjs. */
function etymSource(w){ const F=window.SB_FORGE;
  if(!F||!F.rows){ try{ if(window.SB_LAZY&&!etymSource.asked){ etymSource.asked=1; SB_LAZY.need('forgeData',()=>{ try{ render(); }catch(e){} }); } }catch(e){} return null; }
  if(!F._srcIx){ const ix={}; F.rows.forEach(r=>{ if(r&&r.w&&r.src&&r.src.entry) ix[nkey(r.w)]=r; }); F._srcIx=ix; }
  const r=F._srcIx[nkey(w||'')], name=String((F.sources||{}).etymology||'').split(' — ')[0].trim();
  return r&&name?{ name, entry:String(r.src.entry), from:[r.origin,r.etym].filter(Boolean).join(' ') }:null; }
function etymSrcHTML(w){ const s=etymSource(w); if(!s) return '';
  return `<div class="sb-etym-src" data-etym-src><b>Source</b> ${esc(s.name)}${s.from?' · '+esc(s.from):''} <span>${esc(s.entry.replace(/^https?:\/\/(www\.)?/,''))}</span></div>`; }
/* KUDOS (road to 4.5, P3.30 — family and social). A sibling, or a grown-up behind the PIN, sends a child ONE of these
   fixed kind lines. Nothing is typed, so no child writes free text and a kudos can never say anything but these (the
   family's child-data rule). Kept on the child who receives it as {f: the sender's first name, or '' for a grown-up,
   m: the line's index, t} — the newest twelve; never uploaded (supabase-sync's PROGRESS_KEYS allow-list does not
   carry it). A child sends each sibling at most one a day. Home shows a quiet chip while one is unseen; My page holds
   them (app3-grownups.js kudosCard), the Parent Zone sends them. Guard: tests/kudos.cjs. */
const KUDOS=['Great spelling today!','You worked really hard.','Proud of you for not giving up.','That was a tricky word. Well done!','Keep going, you are doing great.','Thanks for practising with me.'];
function kudosNew(c){ const s=(c&&c.kudosSeen)||0; return ((c&&c.kudos)||[]).filter(k=>k&&k.t>s&&KUDOS[k.m]); }
function kudosChip(c){ const n=kudosNew(c); if(!n.length) return ''; const k=n[n.length-1];
  return `<button data-act="openKudos" class="sb-kudos-chip">${iconSVG('heart',13,2.4)} ${esc(k.f||'A grown-up')} sent you kudos</button>`; }
const milestone = () => { const c=active(); let m=c.milestone; if((!m||!m.date) && state.coachDate) m={label:(m&&m.label)||'the bee', date:state.coachDate};
  if(!m||!m.date) return null; const d=Math.ceil((new Date(m.date+'T00:00:00') - new Date())/86400000);
  return d>=0?{ days:d, label:m.label||'the bee', date:m.date }:null; };
/* ---- Lists (tracks): per-list progress/level; mastery stays global (word knowledge) ---- */
const FREE_LEVEL_CAP = 5; const WORK_MAX = 40;
/* Leveling curve: easy at first, then near-exponential — each level needs more right words than the last.
   xpToNext(L) = round(3 · 1.45^(L-1))  →  3, 4, 6, 9, 13, 19, 28, 40, 58, 85 … */
const XP_BASE = 5, XP_GROWTH = 1.6;
function xpToNext(level){ return Math.max(1, Math.round(XP_BASE * Math.pow(XP_GROWTH, (level||1)-1))); }
function levelFromXp(xp){ xp=Math.max(0, xp||0); let lvl=1, need=xpToNext(1); while(xp>=need){ xp-=need; lvl++; need=xpToNext(lvl); } return { level:lvl, into:xp, need:need }; }
function ensureLists(c){ if(!c) return c; if(!c.lists){ c.lists = { default:{ xp: (c.xp||0) }, journey:{xp:0} }; } if(!c.activeList) c.activeList='journey'; if(!c.lists.journey) c.lists.journey={xp:0}; if(!c.lists[c.activeList]) c.lists[c.activeList]={xp:0};
  if(c.coins==null) c.coins=0; if(!c.unlockedThemes) c.unlockedThemes=[c.theme||'spellbound']; if(!c.unlockedLists) c.unlockedLists={}; if(!c.gameLog) c.gameLog=[]; if(!c.pinnedLists) c.pinnedLists={};
  if(!c.missed) c.missed=[]; if(!c.activity) c.activity=[]; if(!c.unlockedConcepts) c.unlockedConcepts={};
  if(!c.daysPlayed) c.daysPlayed=[]; if(!c.listNames) c.listNames={}; if(c.journeyDay==null) c.journeyDay=0; return c; }
/* ---- coins economy: earn by playing, spend on worlds, packs and concepts ----
   Coins buy the things that live in the Hive and the Library — a world, an avatar
   pack, a concept chapter. They no longer buy artifacts: those are EARNED (see
   grantArt below), because an edge in a game should come from playing it, not
   from a balance. Word lists are not sold either — a premium list comes with a
   plan. unlockedLists is still read, so anyone who bought one before keeps it. */
/* COST is HISTORY now: what a world or a chapter used to cost, kept because the boot refunds
   (GONEW, Aurora) repay exactly that. Nothing is sold at these prices any more — worlds open
   on the Level ladder, chapters on the Atlas or with the plan (FIX-BEE I3/C4). */
const COST = { theme:400, concept:150 };
/* Artifacts: won, never bought. Each has one earn route, stated on its card. */
const ART_DEFS = [
  { k:'shield', ic:'crown', name:'Boss Shield 🛡️', desc:'Absorbs one wrong answer in Boss Battle.',  how:'Won when you stage up a list' },
  { k:'reveal', ic:'bulb',  name:'Letter Reveal 💡', desc:'Reveals the next letter in Boss Battle.',   how:'Won when you stage up a list' },
  { k:'time',   ic:'timer', name:'Time Warp ⏱️',    desc:'+15 seconds on your next Buzzer sprint.',   how:'Won when you stage up a list' },
];
const ART_BY = Object.fromEntries(ART_DEFS.map(a=>[a.k,a]));
function grantArt(k,n){ const c=active(); n=n||1; if(!ART_BY[k]) return;
  if(!c.pow) c.pow={}; c.pow[k]=(c.pow[k]||0)+n; }
/* Stage-ups rotate through the three game artifacts so a speller collects a spread
   rather than a pile of one — keyed off total words right, which only ever climbs. */
function grantStageArt(){ const rot=['shield','reveal','time']; const k=rot[(rankXp()|0)%3]; grantArt(k,1); return ART_BY[k]; }
/* Theme tiers: 2 open free, +2 with Premium, the rest are earn-with-coins for everyone. */
const FREE_THEMES = ['spellbound','aurora'];           // two starters; the other six are bought
/* THE FIRST RUN OFFERS A CHOICE, NOT A CATALOGUE.
   Onboarding used to open on twenty free avatars, a locked legendary row beneath them
   and "…and 122 more to collect", then a grid of eight worlds of which SEVEN were
   padlocked with a price. A five-year-old meeting the app for the first time was given
   a shop and a wall before a single word. Five buddies and two worlds, both of which
   can actually be picked — a locked tile at first run is not a choice, it is an advert.
   Everything else is still there, in My Hive, where a collection belongs and where a
   child goes LOOKING for more. */
const ONB_AVS = ['bizzy','panda','froggy','trice','luna'];
const ONB_THEMES = ['spellbound','aurora'];
/* ONBOARDING'S STEPS, BY NAME (road to 4.5, P1.7/P1.22 — owner, 10 Oct 2026: one decision per step; placement
   is its OWN step for the 10+ bands; buddy and world stay separate, the first free world preselected).
   name → age band → [placement, ages 11–13 and 14–18 only] → buddy → world → daily goal. A step is read by
   its key, never its number, because the placement step comes and goes with the band. placement.js is lazy
   (boot-lazy `placement`) and draws the step's card; this file only routes to it. */
const ONB_PLACE_BANDS = ['11-13','14-18'];
function onbKeys(){ const d=state.draft||{}; const b=d.ageBand||bandForAge(d.age).k;
  return ['name','age'].concat(ONB_PLACE_BANDS.indexOf(b)>=0?['place']:[]).concat(['buddy','world','goal']); }
function onbKey(){ const K=onbKeys(); return K[Math.max(0,Math.min(K.length-1,state.onbStep|0))]; }
/* arriving at the placement step: fetch the engine and its words, then start (or keep) the run */
function onbPlaceBegin(){ lazyNeed('placement',()=>{ try{ if(state.screen==='onboarding'&&onbKey()==='place'&&window.SB_PLACE&&SB_PLACE.begin) SB_PLACE.begin(); }catch(e){} }); }
const PREMIUM_THEMES = ['aurora','anime'];             // included with Premium
function coinsOf(){ return active().coins||0; }
/* ---- BIZZING COINS: one family wallet (FAMILY-STANDARD §1, FIX-BEE Harmonise) ----
   Bee coins are retired into Bizzing coins 1:1. The wallet (bizzing-wallet.js, the family
   drop-in ported as a classic script) is the ONLY place a balance changes; c.coins is a
   MIRROR of it, kept so the forty-odd readers of c.coins needed no change.
   • addCoins(EVENT) — 'answer' 1 · 'stop' 5 · 'contest' 10 · 'mastery' 20, capped at 100 a
     day by the wallet. A NUMBER pays nothing: the amount is the standard's, never the
     caller's, so a payout invented tomorrow fails safe instead of quietly paying. Returns
     the coins actually paid (0 at the cap) — show that number, never the asked-for one.
   • spendCoins(price, why) — a fixed printed price, nothing else.
   • walletSync(c) — moves a child's old c.coins into the wallet ONCE (c.walletV + the
     wallet's own 'migrated' receipt, so neither a reload nor a restored backup pays twice),
     follows a renamed child to their new name, then refreshes the mirror.
   Never written: in ?demo (window.SB_DEMO — a sample child must not touch the family
   feed) and under Test coins (c.devCoins — tester mode never rewrites the child). */
const BEE_APP='bee';
function walletWho(c){ return String((c&&c.name)||'').trim(); }
function walletSync(c){ try{ c=c||active(); const W=window.BZ_WALLET; if(!c||!W||window.SB_DEMO||c.devCoins) return;
  const who=walletWho(c); if(!who) return;
  if(c.walletV!==1){ const old=Math.max(0, Math.floor(+c.coins||0)); if(old>0) W.migrateFrom(BEE_APP, who, old); c.walletV=1; c.walletWho=who.toLowerCase(); }
  else if(c.walletWho && c.walletWho!==who.toLowerCase()){ const had=Math.max(0, Math.floor(+c.coins||0)); if(had>0 && !W.ledger(who).length) W.migrateFrom(BEE_APP, who, had); c.walletWho=who.toLowerCase(); }
  else if(!c.walletWho) c.walletWho=who.toLowerCase();
  c.coins=W.balance(who); }catch(e){} }
/* J7: what a child did while wearing each buddy — the card shows these, never invented stats. */
function avEvBump(c,ev){ try{ const id=c.avatar||'bizzy'; const E=(c.avEv=c.avEv||{}); const r=E[id]=E[id]||{r:0,s:0,m:0};
  if(ev==='answer') r.r++; else if(ev==='stop') r.s++; else if(ev==='mastery') r.m++; }catch(e){} }
window.SB_AV_EVIDENCE=(id)=>{ const c=active(); return (c&&c.avEv&&c.avEv[id])||null; };
function addCoins(ev){ const c=active(); const W=window.BZ_WALLET;
  if(typeof ev!=='string' || !W || !Object.prototype.hasOwnProperty.call(W.EARN, ev)) return 0;
  if(c.devCoins) return 0;                                   // the test purse is not a real one
  avEvBump(c,ev);                                            // the buddy's card records the work, paid or capped
  let n=0;
  if(window.SB_DEMO){ n=W.EARN[ev]; c.coins=(c.coins||0)+n; }  // the sample child's purse, never the family's
  else { walletSync(c); if(!walletWho(c)) return 0; n=W.earn(BEE_APP, walletWho(c), ev); c.coins=W.balance(walletWho(c)); }
  if(n){ sfx('coin'); _earned+=n; } return n; }
/* What this page has paid so far — a result screen subtracts the reading it took at the
   start, so it shows the coins that really arrived, cap and all. */
let _earned=0; function earnedSoFar(){ return _earned; }
/* A game's right answer: one coin into the wallet, and the same coin onto the game's own
   tally (g.bonus) — which is what its finish screen shows. There is no finish bonus. */
function payG(g){ const n=addCoins('answer'); if(g) g.bonus=(g.bonus||0)+n; return n; }
function spendCoins(n, why){ const c=active(); n=Math.floor(+n||0); if(n<=0) return false;
  if(c.devCoins || window.SB_DEMO){ if((c.coins||0)<n) return false; c.coins-=n; return true; }
  const W=window.BZ_WALLET; if(!W) return false; walletSync(c); if(!walletWho(c)) return false;
  const ok=W.spend(BEE_APP, walletWho(c), n, why||'bee shop'); c.coins=W.balance(walletWho(c)); return ok; }
/* Take the test coins away and give the child their real balance back. Safe to call twice.
   The real balance is the wallet's — the banked number is only a fallback with no wallet. */
function devCoinsOff(){ try{ const c=active(); if(!c||!c.devCoins) return;
  c.coins=c.devCoinsBank||0; c.devCoins=0; delete c.devCoinsBank; walletSync(c); }catch(e){} }
/* Is this world even offered on the current plan? (Owning it already always counts.) */
function themeInPlan(id){ if(state.devUnlock) return true;
  try{ if((active().unlockedThemes||[]).indexOf(id)>=0) return true;
    if(!window.SB_ENT) return true; const lim=SB_ENT.worldLimit(); if(lim==='all') return true;
    const idx=(typeof THEMES!=='undefined')?THEMES.findIndex(t=>t.id===id):-1; return idx>=0 && idx<lim; }catch(e){ return true; } }
/* WORLDS OPEN BY THE FAMILY RULE (FIX-BEE v2, FAMILY-STANDARD §7–§8), through the shared engine
   (bizzing-avatars.js → BZ_AVATARS). Bee's eight worlds are numbered in THEMES order. Worlds 1–2
   (Bizzing Bee, Galaxy) are open to everyone; worlds 3–8 open with the family plan, or one at a
   time for 240 Bizzing coins (buyWorld, through the wallet). A world opens its packs too. Worlds a
   child already held — bought under the old price, or reached on the old Level ladder (store step
   v7→v8 kept those) — stay in c.unlockedThemes and stay open. Guard: tests/avatars-engine.cjs. */
function worldNum(id){ try{ const i=THEMES.findIndex(t=>t.id===id); return i<0?0:i+1; }catch(e){ return 0; } }
function worldIdOf(n){ try{ return (THEMES[n-1]||{}).id||null; }catch(e){ return null; } }
function familyPlan(){ if(state.devUnlock) return true; try{ return !!state.premium || (!!window.SB_ENT && SB_ENT.tierId()!=='free'); }catch(e){ return !!state.premium; } }
function worldsHeld(c){ c=c||active(); return (c.unlockedThemes||[]).map(worldNum).filter(Boolean); }
function avCtx(c){ c=c||active(); const owned=new Set(); try{ Object.keys(c.avOwned||{}).forEach(id=>{ if(avCount(c,id)>0) owned.add(id); }); }catch(e){}
  return { owned, worlds:worldsHeld(c), plan:familyPlan()?'family':'free', milestones:avMilestonesMet(c), who:walletWho(c)||undefined }; }
function isThemeUnlocked(id){ if(state.devUnlock) return true; if((active().unlockedThemes||[]).indexOf(id)>=0) return true;
  const n=worldNum(id); if(!n) return FREE_THEMES.indexOf(id)>=0;
  try{ return BZ_AVATARS.worldOpen(n, avCtx()); }catch(e){ return FREE_THEMES.indexOf(id)>=0; } }
function worldMet(id){ return false; }   /* the Level ladder no longer opens worlds (kept for old callers) */
const WORLD_PRICE_COINS=240;
function worldLockText(id,short){ return short?(WORLD_PRICE_COINS+' coins'):('Open it for '+WORLD_PRICE_COINS+' Bizzing coins, or it comes with the family plan'); }
function worldRule(id){ return worldLockText(id); }
/* TWO KINDS OF LOCK, and a child can tell them apart at a glance (FIX-BEE C4).
   LEARNING lock (data-lock="learn"): the path icon, accent ink, a dashed edge — and the words
   name the learning that opens it ("Reach Level 5", "Opens at stop 3 of the Meadow").
   PLAN lock (data-lock="plan"): a padlock, quiet grey, and "comes with the plan — ask a
   grown-up". NEVER a price: prices live on the plan sheet, behind the grown-up PIN. */
function lockChip(kind,text,opt){ opt=opt||{}; const learn=kind==='learn';
  return `<span class="sb-lock ${learn?'sb-lock-learn':'sb-lock-plan'}" data-lock="${learn?'learn':'plan'}" style="display:inline-flex;align-items:center;gap:5px;max-width:100%;padding:4px 9px;border-radius:999px;font-family:var(--ui,var(--body));font-weight:800;font-size:${opt.fs||11.5}px;line-height:1.25;text-align:left;${learn?'background:var(--chip);color:var(--accent);border:1px dashed color-mix(in srgb,var(--accent) 55%,transparent)':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${learn?iconSVG('steps',12,2.2):iconSVG('lock',11,2.2)}<span>${esc(text)}</span></span>`; }
/* A concept chapter's lock: the Atlas stop that teaches it, or the plan. */
function conceptLock(ci){ const ch=(state.conceptData||[])[ci];
  if(ch&&ch.adv) return { kind:'plan', text:'Comes with the Advanced Pack' };
  let t=null; try{ t=(typeof window.SB_TRAIL_TAUGHT==='function')?SB_TRAIL_TAUGHT(ci):null; }catch(e){}
  if(!t && !window.SB_TRAIL){ try{ if(!state._trailAsked && window.SB_LAZY){ state._trailAsked=1; SB_LAZY.need('atlas',()=>{ try{ render(); }catch(e){} }); } }catch(e){}
    return { kind:'learn', text:'Opens on the Atlas' }; }
  if(t) return { kind:'learn', text:'Opens at stop '+t.stop+' of '+(t.act||'the Atlas'), t };
  return { kind:'plan', text:'Comes with the family plan' }; }
// Entitlement guard for tier-locked features. Returns true if allowed; else opens the
// tier/pricing sheet with an upsell and returns false. feature ∈ SB_TIERS[*].ent keys.
/* Open the plan sheet with an upsell, unconditionally. Used where the entitlement is a
   number (worlds, avatar packs) rather than a boolean, so gateFeature's truthiness test
   would wave it straight through. */
function openUpsell(feature, label, needTier){
  try{ state.tierUpsell={feature:feature, label:label||feature, need:needTier||'regional'}; set({showTiers:true}); }catch(e){}
  return false; }
function gateFeature(feature, label, needTier){
  try{ if(!window.SB_ENT || SB_ENT.has(feature)) return true; }catch(e){ return true; }
  try{ state.tierUpsell={feature:feature, label:label||feature, need:needTier||'regional'}; set({showTiers:true}); }catch(e){}
  return false; }
/* Concepts: all locked on free; Premium opens the easier 50%; the rest are coin-unlocks. */
function conceptHalf(){ const n=(state.conceptData||SB_CONCEPTS.chapters||[]).length; return Math.ceil(n/2); }
function isConceptUnlocked(ci){ const ch0=(state.conceptData||SB_CONCEPTS.chapters||[])[ci];
  /* Advanced Pack chapters are pack-only: no coin unlock, no premium half-course. */
  if(ch0&&ch0.adv) return advModeOn();
  if(state.devUnlock) return true; const ch=ch0; if(ch && catGroup(ch.category)==='Basics') return true; try{ if(window.SB_ENT && SB_ENT.has('concepts')) return true; }catch(e){} if((active().unlockedConcepts||{})[ci]) return true; if(state.premium && ci<conceptHalf()) return true;
  try{ if(typeof window.SB_TRAIL_OPEN==='function' && SB_TRAIL_OPEN(ci)) return true; }catch(e){}   /* reached on the Atlas */
  return false; }
// Levenshtein distance (for "so close!" near-miss feedback)
function lev(a,b){ a=a||''; b=b||''; const m=a.length,n=b.length; if(!m) return n; if(!n) return m; const d=Array.from({length:m+1},(_,i)=>[i].concat(new Array(n).fill(0)));
  for(let j=0;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){ const c=a[i-1]===b[j-1]?0:1; d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c); }
  return d[m][n]; }
function now(){ try{ return Date.now(); }catch(e){ return 0; } }
/* ---- days: local date keys ---- */
function todayKey(){ try{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }catch(e){ return '2026-01-01'; } }
/* THERE IS NO STREAK (FIX-BEE J2, FAMILY-STANDARD §8). It counted consecutive days, paid
   15/40/100/300 coins at 3/7/14/30, handed out a Streak Freeze to protect itself, and every
   day off reset it to 1 — the loss was the point. Now a day only records that it happened
   (c.daysPlayed), and the one number shown from it is good days THIS week (Mon–Sun, as the
   Hive counts them). Nothing expires, a day off costs nothing, nothing pays for coming back.
   Old c.streak / c.streakRewards / c.freezes are left in the save untouched and read by
   nothing but the retired-medal check. Guard: tests/no-streaks.cjs. */
function markActiveToday(){ const c=active(); if(!c) return; const t=todayKey();
  if(!c.daysPlayed) c.daysPlayed=[]; if(c.daysPlayed.indexOf(t)<0){ c.daysPlayed.push(t); if(c.daysPlayed.length>140) c.daysPlayed=c.daysPlayed.slice(-140); }
}
/* The week as the Hive counts it: Monday to Sunday, local dates. */
function weekDayKeys(){ const out=[]; const d=new Date(); const dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow);
  for(let i=0;i<7;i++){ out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')); d.setDate(d.getDate()+1); }
  return out; }
/* THIS WEEK, from evidence (FIX-BEE v2 B3): stops cleared (trail's paid record carries the time) and
   words mastered (c.mast — mastered-at, right on two different days). Monday is the first day, as the
   Hive counts it. */
function weekStartTs(){ const d=new Date(); const dow=(d.getDay()+6)%7; d.setHours(0,0,0,0); d.setDate(d.getDate()-dow); return d.getTime(); }
function weekProgress(c){ c=c||active(); const t0=weekStartTs(); let stops=0, words=0;
  try{ const pd=((c.trail||{}).paid)||{}; for(const k in pd) if(+pd[k]>=t0) stops++; }catch(e){}
  try{ const M=c.mast||{}; for(const k in M){ const r=M[k]; if(r&&r.b>=2&&!r.leg&&+r.mt>=t0) words++; } }catch(e){}
  return { stops, words }; }
/* Where the next stop sits in its own region: "stop 3 of 12". The region's count is small and
   concrete — not the 102-stop road (CLAUDE: never show a speller how long the whole road is).
   It is counted EXACTLY as the Atlas counts the region's pin ("8/13 stops", trail.js seq()):
   the stops THIS tier walks (a Honey unit is on the road only on its laps) plus the checkpoint
   after every Nth of them. It used to count the act's units on every tier and no checkpoints,
   so Home said "stop 8 of 11" beside a Meadow pin that said 13 (audit v4 H2). trail.js keeps
   seq() private; tests/one-count.cjs holds this reading to the Atlas's pins on all three tiers. */
function regionPos(nx){ try{ const T=window.SB_TRAIL; if(!T||!nx||nx.allDone) return null;
    const isChk=nx.kind==='chk'; const arg=String(nx.arg||'');
    const exp=isChk?arg.split('|')[0]==='exp':arg.charAt(0)==='x';
    const acts=(exp?(T.expedition||{}).expeds:(T.honey||{}).acts)||[];
    const units=(exp?(T.expedition||{}).units:(T.honey||{}).units)||[];
    const chkId=isChk?arg.split('|')[1]||'':''; const every=(T.rules&&T.rules.checkpointEvery)||4;
    const act=acts.find(a=>isChk?a.id===chkId.split(':')[0]:(a.units||[]).indexOf(arg)>=0); if(!act) return null;
    const lap=nx.lap||1, keys=[]; let n=0;
    for(const id of (act.units||[])){ const u=units.find(x=>x.id===id)||{};
      if(!exp && !(u.laps||[u.lap||1]).includes(lap)) continue;
      keys.push(id); n++; if(n%every===0) keys.push(act.id+':'+n); }
    const i=keys.indexOf(isChk?chkId:arg); return i<0?null:{ n:i+1, of:keys.length }; }catch(e){ return null; } }
/* THE BUDDY'S HELLO (FIX-BEE v2 B5): built from what the child last DID — the last missed word,
   words due again, this week's stops and masteries, the last trap beaten — with the buddy's own
   line as one voice among them. It changes once per visit (never on a re-render) and never says
   the same thing two visits running (device key sb_greet). It names effort, never a lapse: a miss is a
   word "to try again", and nothing here counts days or mentions a skip. */
function homeGreetCands(c){ c=c||active(); const out=[]; const nm=(c&&c.name)||'friend';
  try{ const due=mastDueWords(c,30).length; if(due) out.push({k:'due',t:`${due} word${due===1?' is':'s are'} ready for a second look today, ${nm} — that is how they stick.`}); }catch(e){}
  try{ const mn=(c.missed||[]).length; if(mn) out.push({k:'miss',t:`${mn===1?'One word':mn+' words'} from last time ${mn===1?'is':'are'} waiting for another try, ${nm} — every try counts.`}); }catch(e){}
  try{ const wp=weekProgress(c); if(wp.stops||wp.words) out.push({k:'week',t:`This week: ${wp.stops} stop${wp.stops===1?'':'s'} and ${wp.words} word${wp.words===1?'':'s'} mastered. Nice work, ${nm}.`}); }catch(e){}
  try{ const tb=Object.keys(c.trapsBeaten||{}).length; if(tb) out.push({k:'trap',t:`You have beaten ${tb} trap word${tb===1?'':'s'} — words that once tripped you up.`}); }catch(e){}
  try{ const nx=SB_SHELL.nextStep(); if(nx&&nx.ready&&!nx.allDone&&nx.title) out.push({k:'next',t:`Next up: ${trunc(nx.title,40)}. Ready when you are, ${nm}.`}); }catch(e){}
  try{ const lv=oneLevel(c); if(lv&&lv.label) out.push({k:'level',t:`You are at ${lv.label}, ${nm}. Every word you spell right moves it.`}); }catch(e){}
  let line=''; const who=c.avatar||'bizzy';
  try{ const G=window.SB_AV_GREETINGS||{}; line=G[who]||''; }catch(e){}
  if(!line){ try{ if(typeof SB_AV_CARD==='function'){ const d=SB_AV_CARD(who); line=(d&&d.greeting)||''; } }catch(e){} }
  if(!line) line="Buzz buzz, {name}! Let's spell the meadow back to bloom!";
  out.push({k:'buddy',t:String(line).replace(/\{name\}/g,nm)});
  return out; }
let _greetVisit=null;   /* one pick per visit to Home — a re-render keeps it */
function homeGreet(c){ c=c||active(); const C=homeGreetCands(c); const key=(c&&c.name||'')+'|'+state.nav;
  if(_greetVisit&&_greetVisit.key===key&&C.some(x=>x.k===_greetVisit.k)) return C.find(x=>x.k===_greetVisit.k).t;
  /* PICK FROM ALL THE EVIDENCE (audit v4 B5). The next stop used to be known only once trail-data.js landed, after Home's
     first paint, so the bubble held its place until then (null) rather than pick from what boot had. Since P1.13 step 3
     the road is a boot script (trail-home-data.js) and SB_TRAIL_NEXT answers at first paint: the pick is made then. */
  /* the rotation is a DEVICE note (sb_greet: {name:[n,k]}), not part of the child's record — a hello
     must never change what a backup holds */
  let G={}; try{ G=JSON.parse(SB_STORE.get('greet')||'{}')||{}; }catch(e){}
  const me=(c&&c.name)||''; const was=G[me]||[0,null];
  const n=(was[0]|0)+1; const pool=C.filter(x=>x.k!==was[1]); const pick=(pool.length?pool:C)[n%(pool.length||C.length)];
  G[me]=[n,pick.k]; try{ SB_STORE.set('greet',JSON.stringify(G)); }catch(e){} _greetVisit={key,k:pick.k}; return pick.t; }
function goodDaysThisWeek(c){ c=c||active(); const played=new Set((c&&c.daysPlayed)||[]); return weekDayKeys().filter(k=>played.has(k)).length; }
/* ---- misses: persist per-child to a revise list (with counts) AND the working pool ---- */
/* `mark` = the child filed it themselves (a study aid) — the revise pile only. Without it this
   is a real miss, and a real miss is evidence against mastery (FIX-BEE D5). */
function addMiss(w,mark){ if(!w||!w.w) return; const c=active(); if(!c.missed) c.missed=[]; const k=nkey(w.w);
  if(mark!=='mark'){ try{ mastEvidence(k,false); }catch(e){} }
  const ex=c.missed.find(x=>nkey(x.w)===k);
  if(ex){ ex.n=(ex.n||1)+1; ex.ts=now(); } else { c.missed.unshift({w:w.w,d:w.d||'',s:w.s||'',p:w.p||'',o:w.o||'',r:w.r||'',y:w.y||3,n:1,ts:now()}); }
  if(c.missed.length>200) c.missed=c.missed.slice(0,200);
  const cur=(state.missedWords||[]).filter(x=>nkey(x.w)!==k); cur.unshift(w); state.missedWords=cur.slice(0,60); }
function clearMiss(key){ key=nkey(key); const c=active(); if(c.missed){ if(c.missed.some(x=>nkey(x.w)===key)) (c.trapsBeaten=c.trapsBeaten||{})[key]=1; c.missed=c.missed.filter(x=>nkey(x.w)!==key); }   /* a word once missed and now spelled right is a TRAP BEATEN — evidence for the Traps medals */ state.missedWords=(state.missedWords||[]).filter(x=>nkey(x.w)!==key); }
function syncMissed(){ const c=active(); state.missedWords=((c&&c.missed)||[]).slice(0,60); }
/* ---- parental activity log: one high-level entry per finished session, tap to expand ---- */
function logActivity(kind, label, stats, misses){ const c=active(); if(!c.activity) c.activity=[]; markActiveToday();
  c.activity.unshift({ kind, label, ts:now(),
    done:(stats&&stats.done)||0, right:(stats&&stats.right)||0, coins:(stats&&stats.coins)||0,
    misses:(misses||[]).map(m=>(m&&m.w)?m.w:m).filter(Boolean).slice(0,20) });
  if(c.activity.length>120) c.activity=c.activity.slice(0,120);
  setTimeout(()=>{ try{ checkNewBadges(); }catch(e){} }, 700); }
/* Badge celebrations — every session-end funnels through logActivity, so newly
   earned badges are caught there. First run seeds silently (no back-pay parade). */
function checkNewBadges(){ const c=active(); if(!c) return;
  try{ grantAvatarMilestones(); }catch(e){}   /* avatars won by a milestone arrive here too — once, with a line */
  const first=!c.badgesSeen; const seen=c.badgesSeen||(c.badgesSeen={});
  const defs=badgeDefs(); const fresh=[];
  for(const b of defs){ if(b.done && !seen[b.id]){ seen[b.id]=1; if(!first && !b.retired) fresh.push(b); } }   /* each medal celebrated ONCE; a retired one is kept, never celebrated */
  if(first || !fresh.length){ save(); return; }
  save(); if(state.celebrate) return;
  state.celebrate={kind:'badge', badge:fresh[0], more:fresh.length-1};
  try{ sfx('win'); burstConfetti(230); }catch(e){} render(); }
const ACT_LABEL = { trivia:'Bee Trivia', practice:'Practice', buzz:'10-Word Warm-Up', beat:'Beat the Buzzer', boss:'Boss Battle', meaning:'Meaning Match', spell:'Spot the Spelling', origin:'Origin Detective', magic:'Magic Squares', written:'Written round', oral:'Oral elimination', concept:'Concept study' };
function getList(c,key){ ensureLists(c); if(!c.lists[key]) c.lists[key]={xp:0}; return c.lists[key]; }
function levelCap(){ return (state.premium||state.devUnlock) ? Infinity : FREE_LEVEL_CAP; }
function listLevelRaw(c,key){ return levelFromXp(getList(c,key).xp||0).level; }
 // {level,into,need}
function listLevel(c,key){ return Math.min(listLevelRaw(c,key), levelCap()); }
function activeListKey(){ return (active().activeList)||'default'; }
function heroLevel(c){ ensureLists(c); const ls=Object.keys(c.lists||{}).map(k=>listLevel(c,k)); return Math.max(1, ...(ls.length?ls:[1])); } // evolution never demotes when you switch lists
function listBaseLabel(key){ if(key==='default') return 'Default · Level-Up'; if(key==='journey') return journeyName(); if(key==='ultra') return 'Ultra Champions Journey'; if(isThemeKey(key)){ const t=themeOf(key.slice(3)); if(t) return t.label; } const cat=coachCatalog().find(c=>c.key===key); return cat?cat.label:key; }
function listLabel(key){ const custom=((active().listNames)||{})[key]; return custom||listBaseLabel(key); }
function listWords(key){ return stageWords(key); }            // current stage's words (staged progression)
function listFullWords(key){ if(key==='default') return defaultStages().reduce((a,s)=>a.concat(s.words),[]); return rawListWords(key); }
function workingSet(key){ const ws=listWords(key);
  // a session is "what you still need": every unmastered word of this Level (up to 36),
  // so finishing sessions always converges on the level-up — mastered words only return once none remain.
  // Order is the list's own order, so Practice always starts at word 1 (first time) or resumes
  // at the last-practiced word (persisted gi) — revise/mistakes live in their own flow, not here.
  const un=ws.filter(w=>!state.luMastered[nkey(w.w)]);
  if(un.length) return un.slice(0,36);
  return ws.length<=36?ws.slice():sample(ws,36); }
// bee-likelihood as 5 dots (●●●○○) from a 0–100 probability score
function beeOdds(bp){ const n=Math.max(1,Math.min(5,Math.round((bp||0)/20))); return '●'.repeat(n)+'○'.repeat(5-n); }
// Build the Practice working set for a list ONCE and keep it stable while you navigate —
// only rebuilt when the active list changes (or after a drill clears sessionListKey).
function resetSessionScore(){ state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; }
function ensureCoachWords(key){ if(state.sessionListKey!==key || !(state.sessionWords&&state.sessionWords.length)){
    state.sessionWords=workingSet(key); state.sessionListKey=key; state.sessionLabel=listLabel(key);
    state.reviseIdx=Math.min(state.reviseIdx||0, Math.max(0,state.sessionWords.length-1));
    // resume where the speller left off in this list (persisted per list)
    let gi0=0; try{ if(key&&key[0]!=='_'){ const st=getList(active(),key); gi0=(st.gi&&st.gi<state.sessionWords.length)?st.gi:0; } }catch(e){}
    state.gi=gi0; resetSessionScore(); }
  return state.sessionWords; }
function newCoachBatch(){ const key=state.sessionListKey||activeListKey(); state.sessionWords=workingSet(key); state.sessionListKey=key; state.reviseIdx=0; state.gi=0; try{ if(key&&key[0]!=='_') getList(active(),key).gi=0; }catch(e){} resetSessionScore(); }
function gainXp(){ const c=active(); const key=activeListKey(); const lp=getList(c,key); const before=listLevel(c,key);
  lp.xp=(lp.xp||0)+1; const rawAfter=listLevelRaw(c,key); const after=Math.min(rawAfter, levelCap());
  if(after>before){ const form=formIdx(after); const art=grantStageArt();
    /* NO COINS HERE (FIX-BEE v2): a stage-up is XP — right answers counted — and the standard's
       mastery coin fires only on mastery EVIDENCE. It moved to listMasteryPay(), which pays when
       every word of a Stage is mastered (right on two separate days). */
    state.toast='Stage up in '+listLabel(key)+' ✨ — you won a '+art.name; scheduleToast(3000); sfx('level'); burstConfetti(90); }
  else if(!state.premium && rawAfter>FREE_LEVEL_CAP && before>=FREE_LEVEL_CAP && (lp.xp % 6 === 0)){ state.toast='Stage 5 cleared — well spelled!'; scheduleToast(2800); }
}
// pick the smoothest natural voice the device offers (loaded async)
let _voice = null;
function loadVoices(){ try{ const vs=window.speechSynthesis.getVoices()||[]; if(!vs.length) return;
  if(VOICE && VOICE.name){ const chosen=vs.find(v=>v.name===VOICE.name); if(chosen){ _voice=chosen; return; } }
  const en=vs.filter(v=>/^en/i.test(v.lang)); const pool=en.length?en:vs;
  const pref=[/siri/i,/samantha/i,/\bava\b/i,/allison/i,/\bnicky\b/i,/\bzoe\b/i,/google us english/i,/microsoft (aria|jenny|emma|michelle|guy)/i,/natural/i,/enhanced|premium/i,/karen/i,/serena/i,/moira/i,/tessa/i,/daniel/i];
  let best=null; for(const re of pref){ best=pool.find(v=>re.test(v.name)); if(best) break; }
  if(!best) best=pool.find(v=>/en[-_]?us/i.test(v.lang))||pool[0];
  _voice=best||null;
}catch(e){} }
function utter(text,rate){ const u=new SpeechSynthesisUtterance(text); if(_voice) u.voice=_voice; u.rate=rate||0.9; u.pitch=1.0; u.volume=(window.SB_VOL?SB_VOL.voice():1); try{ if(window.SB_VOL) SB_VOL.duck(Math.min(8000,600+String(text).length*70)); }catch(e){} return u; }
/* Studio word audio: single words prefer a bundled Google TTS clip (voice/w/*.mp3,
   manifest in voice-words.js) — correct pronunciations, same voice as the bee.
   Anything without a clip (sentences, long-tail words) falls back to device TTS. */
let _wvSet=null,_wvAudio=null;
// Every word uses one consistent Kokoro voice (mixing in the device voice sounded
// unprofessional). Words reported as off get REBUILT in Kokoro and re-reviewed —
// this stays empty unless a clip is ever pulled while a rebuild is pending.
const WV_BAD=new Set([]);
function wordClip(text){ if(!window.SB_WVOICE) return null;
  if(!_wvSet){ try{ _wvSet=new Set(String(SB_WVOICE).split('|')); }catch(e){ _wvSet=new Set(); } }
  const k=nkey(text); if(!k||/\s/.test(k)) return null;
  if(WV_BAD.has(k)) return null;                       // force device TTS for bad clips
  return _wvSet.has(k) ? ('voice/w/'+k.replace(/[^a-z0-9]/g,'-')+'.mp3') : null; }
function deviceSpeak(text,rate){ try{
  const t=String(text==null?'':text).trim();
  const clip=(t&&!/\s/.test(t))?wordClip(t):null;
  if(clip){ try{ window.speechSynthesis.cancel(); }catch(e){}
    if(_wvAudio){ try{ _wvAudio.pause(); }catch(e){} }
    const a=new Audio(clip); try{ a.preservesPitch=true; a.mozPreservesPitch=true; }catch(e){}
    a.playbackRate=Math.max(.55,Math.min(1.3,(rate||0.9)/0.9)); _wvAudio=a;
    try{ if(window.SB_VOL){ a.volume=SB_VOL.voice(); SB_VOL.duck(1400); a.addEventListener('ended',()=>{ try{ SB_VOL.duck(250); }catch(e){} }); } }catch(e){}
    /* A clip that fails to load fires BOTH `error` on the element AND a rejection from
       play() — so an unguarded fallback spoke the word twice, which is what a word with
       no working recording sounded like on every hosted build (those stream each clip
       from raw.githubusercontent, so a word listed in SB_WVOICE whose file isn't there
       404s and lands here). Fire once. The identity check also stops a slow failure from
       talking over a newer word the child has already tapped. */
    let _said=false;
    const tts=()=>{ if(_said||_wvAudio!==a) return; _said=true;
      try{ window.speechSynthesis.speak(utter(text,rate||0.92)); }catch(e){} };
    a.onerror=tts; a.play().catch(tts); return; }
  window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter(text,rate||0.92)); }catch(e){} }
// voice preference: which installed device voice to use ('' = auto best). No account, no key.
const VOICE = { name:'' };
function loadVoiceCfg(){ try{ const v=SB_STORE.getJSON('voice',null); if(v) Object.assign(VOICE, v); }catch(e){} }
function saveVoiceCfg(){ try{ SB_STORE.setJSON('voice', VOICE); }catch(e){} }
function enVoices(){ try{ return (window.speechSynthesis.getVoices()||[]).filter(v=>/^en/i.test(v.lang)); }catch(e){ return []; } }
// A one-time OS step unlocks a much nicer voice — apps can't install system voices, so we
// detect the platform and show the exact path. Once added, it appears in the picker above.
function voiceUpgradeTip(){
  const ua=navigator.userAgent||''; const isIOS=/iPad|iPhone|iPod/.test(ua)||(/Mac/.test(ua)&&navigator.maxTouchPoints>1);
  const os=isIOS?'ios':/Mac/.test(ua)?'mac':/Windows/.test(ua)?'win':/Android/.test(ua)?'android':'other';
  const hasPremium=enVoices().some(v=>/premium|enhanced|natural|neural|siri/i.test(v.name));
  const tips={
    mac:['On this Mac (free, one time, ~5 min):','<b>System Settings → Accessibility → Spoken Content → System Voice → Manage Voices…</b> — download <b>Ava (Premium)</b> or <b>Zoe (Premium)</b>. Then reopen Settings here and pick it (✨).'],
    ios:['On this iPhone/iPad (free, one time):','<b>Settings → Accessibility → Spoken Content → Voices → English</b> — download <b>Ava (Premium)</b>. Then reopen Settings here and pick it (✨).'],
    win:['On Windows:','For the most natural voices, open Bizzing Bee in <b>Microsoft Edge</b> — its “Natural” voices (Aria, Jenny…) appear in the list above automatically. Offline voices: <b>Settings → Time &amp; Language → Speech → Add voices</b>.'],
    android:['On Android:','<b>Settings → System → Languages → Text-to-speech output</b> — make sure <b>Speech Services by Google</b> is the engine and its English voice data is downloaded.'],
    other:['Tip:','Add a higher-quality English voice in your device’s text-to-speech settings and it will appear in the list above.']};
  const t=tips[os];
  if(hasPremium && os!=='other') return `<div style="margin-top:12px;font-size:12px;color:var(--good);font-weight:700">✓ A high-quality voice is installed on this device — pick a ✨ one above.</div>`;
  return `<div style="margin-top:12px;background:color-mix(in srgb,var(--accent) 8%,var(--bg2));border:1px solid var(--line);border-radius:10px;padding:12px 14px">
    <div style="display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:800;font-size:12px;color:var(--accent);margin-bottom:4px">${iconSVG('spark',13)} Get a much nicer voice — ${esc(t[0])}</div>
    <div style="font-size:12px;color:var(--text);line-height:1.6">${t[1]}</div>
  </div>`; }
function speak(){ deviceSpeak(curWord().w, 0.9); }
 // tortoise: same clip/voice, slowed (pitch preserved)
function say(text,rate){ deviceSpeak(text, (rate||0.95)*(state.voiceRate||1)); }
// tortoise glyph for the "hear it slowly" button — inherits the button's currentColor
function tortoiseSVG(sz){ sz=sz||24; return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block"><path d="M3.5 15 Q11 5 18.5 15 Z" fill="currentColor"/><ellipse cx="11" cy="15" rx="7.6" ry="1.5" fill="currentColor"/><rect x="5" y="14.6" width="2.2" height="3.4" rx="1.1" fill="currentColor"/><rect x="14.8" y="14.6" width="2.2" height="3.4" rx="1.1" fill="currentColor"/><circle cx="20.2" cy="12.8" r="2.3" fill="currentColor"/><circle cx="21" cy="12.3" r=".55" fill="#fff"/><path d="M6 11.6 Q11 6.6 16 11.6" stroke="#fff" stroke-width="1" fill="none" opacity=".45"/><path d="M8.4 13.4 h5.2 M9.4 15 h3.2" stroke="#fff" stroke-width=".9" opacity=".4" stroke-linecap="round"/></svg>`; }
// split a sentence around its target word (and simple inflections) so we can read it aloud
// WITHOUT speaking the answer — used by "Finish the Sentence"
/* maskParts is gone with the bleep: nothing splits a sentence around its word any
   more. The WRITTEN masking is maskTxt / blankHTML, which are still very much in use. */
function maskTxt(text, word){ const t=text||''; const w=(word||'').trim(); if(!w) return t;
  try{ return _applyMasks(t, w, '_____'); }catch(e){ return t; } }
// Alternate/other senses of a word (validated WordNet layer in window.SB_ALT).
function altsFor(word){ try{ const m=window.SB_ALT; if(!m) return []; return m[nkey(word)]||[]; }catch(e){ return []; } }
/* 1-2 short meanings for a word (window.SB_SYN, lazy-loaded with the card).
   Drawn against each word's own definition, so the synonym matches the sense
   the bank teaches. Words with no honest short equivalent carry none. */
function synsFor(word){ try{ const m=window.SB_SYN; if(!m) return [];
  const v=m[nkey(word)]||m[String(word||'').trim()]||[]; return Array.isArray(v)?v:[]; }catch(e){ return []; } }
function synsHTML(word){ const a=synsFor(word); if(!a.length) return '';
  return `<div style="display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap;font-size:13px;line-height:1.5;margin-top:9px;justify-content:center">
      <span style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--chip);padding:3px 8px;border-radius:999px;margin-top:1px">means</span>
      <span style="color:var(--text);font-weight:700">${a.map(esc).join(' &middot; ')}</span></div>`; }
function altsHTML(word, mask){ const a=altsFor(word); if(!a||!a.length) return '';
  const rows=a.slice(0,2).map(s=>`<div style="display:flex;gap:7px;align-items:flex-start;margin-top:7px">
      <span style="flex-shrink:0;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:10px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--accent);background:var(--chip);padding:2px 7px;border-radius:999px;margin-top:2px">${esc(s.p||'also')}</span>
      <span style="font-size:13.5px;color:var(--text);line-height:1.5">${mask?blankHTML(s.d,word):esc(s.d)}</span></div>`).join('');
  return `<div style="margin-top:12px;padding-top:11px;border-top:1px dashed var(--line);text-align:left;max-width:40em;margin-left:auto;margin-right:auto">
    <div style="font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:1px">📖 Other meanings</div>${rows}</div>`; }
/* THE SENTENCE IS READ IN FULL, TARGET WORD AND ALL.
   It used to bleep the word out — speak the first half, play a tone, pause, speak the
   rest — on the reasoning that saying it would give the answer away. That is the wrong
   channel to withhold. This is a SPELLING test: hearing the word is the entire point of a
   sentence prompt, and it is what a pronouncer does at a real bee. What must never be
   given away is the WRITTEN form, and that is masked separately (maskTxt / blankHTML on
   the sentence, and the answer input). Play-testing was explicit that the placeholder tone
   left people unsure what was even being asked.
   Named for what it does now: sayMasked was a name that would mislead the next reader. */
function saySentence(sentence, word){
  const t=String(sentence||'').trim();
  if(!t){ if(word) say(word); return; }
  deviceSpeak(t, 0.92*(state.voiceRate||1)); }

/* ---- concepts ---- */
const conceptShort = (t) => (t||'').split('—')[0].trim();
const conceptRoots = (t) => { const p=(t||'').split('—'); return p.length>1?p.slice(1).join('—').trim():''; };
function catGroup(cat){ const c=(cat||'').toLowerCase();
  /* The four Advanced Pack categories keep their own shelves, so a locked shelf
     is a locked shelf and never blends into a free one. */
  if(c.includes('championship procedure')) return 'Bee day';
  if(c.includes('advanced orthography')) return 'Deep spelling';
  if(c.includes('origins beyond')) return 'Far origins';
  if(c.includes('how words are built')) return 'Word building';
  if(c.includes('basic')) return 'Basics';
  if(c.includes('prefix')) return 'Prefixes'; if(c.includes('suffix')) return 'Suffixes';
  if(c.includes('root')) return 'Roots';
  if(c.includes('loanword')||c.includes('french')||c.includes('italian')) return 'Loanwords';
  if(c.includes('rule')||c.includes('pattern')||c.includes('strategy')||c.includes('spelling')) return 'Rules';
  if(c.includes('subject')) return 'Subjects'; if(c.includes('personality')||c.includes('theme')) return 'Themes';
  return 'Advanced'; }
/* Advanced shelves — everything here needs the Advanced Pack. */
const ADV_FAMS={'Bee day':1,'Deep spelling':1,'Far origins':1,'Word building':1};
/* ONE chapter library. The free course and the 43 Advanced Pack chapters live in
   one list so there is a single door to every explanation in the app — but the
   advanced chapters are always APPENDED, never interleaved, because concept
   narration is indexed by position in this array (voice/c<i>-<n>.mp3). Advanced
   chapters carry ch.adv, which routes their narration to the am_michael clips and
   gates them behind the pack. */
function mergedConcepts(){
  const free=(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[];
  const adv=(window.SB_ADV_CONCEPTS&&SB_ADV_CONCEPTS.chapters)||[];
  return adv.length ? free.concat(adv) : free.slice();
}
function loadConcepts(){
  if(state.conceptData || state.conceptLoading) return;
  if(SB_CONCEPTS && SB_CONCEPTS.chapters && SB_CONCEPTS.chapters.length){ state.conceptData = mergedConcepts(); return; }
  state.conceptLoading = true;
  /* FIX-BEE N2: the course is a boot-lazy file now, not something the idle queue has always
     fetched by the time anyone asks — so ask for it. The sb-lazy listener below calls back
     in here when it lands; the callback only covers a file that failed to load. (The old
     fetch of concepts.json is a pre-boot-lazy fallback: there is no such file, and under
     file:// it is a CORS error in the console.) */
  if(window.SB_LAZY){ SB_LAZY.need('concepts', ()=>{ if(state.conceptLoading && !state.conceptData){ state.conceptLoading=false;
      if(SB_CONCEPTS && SB_CONCEPTS.chapters && SB_CONCEPTS.chapters.length) state.conceptData=mergedConcepts(); else state.conceptErr=true; render(); } }); return; }
  fetch('concepts.json').then(r=>r.json()).then(j=>{ state.conceptData=j.chapters; state.conceptLoading=false; render(); })
    .catch(()=>{ state.conceptLoading=false; state.conceptErr=true; render(); });
}

/* ---- kid-safety word filter — strips hate slurs & explicit sexual terms from any pool.
   Nazi vocabulary too (owner, 3 Oct 2026: "delete these words from the repo"): the 32 words were
   deleted from every store; this keeps the 130k library from bringing one back by a headword or a
   definition. `\bnazi(?!r)` spares nadir's Arabic nazir and the Nazirites; Ashkenazi has no \b.
   Gender-identity words and meanings too (owner, 8 Oct 2026, see CORE_STRIKE): by headword and by definition
   ("gender identity", "assigned at birth"…), never `gender` alone (grammar) and never `trans` alone
   (transition, transatlantic, transport all pass — tests/no-gender-identity.cjs holds the spare list).
   Sexual-orientation words and meanings too (owner, same day, "Delete them all"); `\bbisexual` spares the
   biology word ambisexual, and nothing here touches gay/queer/straight, which keep their everyday senses.
   The 40k core list is cleaned at rest; this guards the premium 130k library too. ---- */
const SB_UNSAFE_RE=/(nigger|nigga|faggot|niggard|currymuncher|towelhead|raghead|\bkike\b|\bchink|wetback|\bgook\b|\bcoon\b|darkie|\bwop\b|\bdago\b|beaner|\bspic\b|\bcunt|motherfuck|\bfuck|\bshit\b|fellat|cunniling|catamit|pederast|paedophil|pedophil|coprophil|klismaphil|frotteur|\bvoyeur|masturbat|onanis|ejaculat|copulat|fornicat|\bwhore|\bslut\b|bestialit|zoophil|necrophil|scatophil|analingus|\bnazi(?!r)|feminazi|japanazi|islamonazi|denazif|hitler|gestapo|swastika|goebbels|wehrmacht|anschluss|gammadion|transgender|transsexual|transvestit|cisgender|cissexual|genderqueer|genderfluid|\bbigender|\bagender|ambigender|multigender|intergender|postgender|transfeminis|transfolk|\btrans(?:man|men|woman|women)\b|kathoey|gender identit|gender expression|gender dysphoria|gender reassignment|sex reassignment|assigned (?:male |female )?at birth|(?:recorded|assigned) for (?:them|him|her) at birth|\bnon-?binary\b|homosexual|lesbian|heterosexual|\bbisexual|homophob|\blgbt|lesbigay|gaydar|gayborhood|gaytopia|heteronormativ|homonormativ|homonational|sexual orientation|\bgays\b|openly gay)/i;
function safeWord(w){ if(!w||!w.w) return false; if(SB_UNSAFE_RE.test(w.w)) return false; if(w.d&&SB_UNSAFE_RE.test(w.d)) return false; return true; }
window.SB_UNSAFE_RE=SB_UNSAFE_RE;   /* kid-safe.js reads it (games spec §1.2) */
/* ---- full library: 130k words live in words-full.js + words-hard.js, loaded on demand (file too big for startup) ---- */
let _fullState='idle'; // idle | loading | loaded | error
/* words-full.js defines SB_FULL as a JSON STRING (it always has, including on main), but
   every caller wants an array — loadFullLibrary called .filter() on it and threw into a
   silent catch, so it stayed a string and anything iterating it walked characters instead
   of records. Normalise once, in place, and hand back the same array afterwards. */
/* the CHAMPIONSHIP SHARD (words-hard.js) rides in the same library: ~1,800
   long, obscure and foreign-origin words that the generated core never had.
   It is a plain array rather than a JSON string because it is small, and it is
   merged exactly once — mergeHard is idempotent so a second load is harmless. */
/* ---- core corrections ----
   Seven records in the generated core are not words a speller should ever be
   asked for, and their own definitions say so: alloted ("Misspelling of
   allotted"), commmitteth (three m's), induhvidual (a joke spelling of
   individual), abe ("not a standard dictionary word"), and the bare
   abbreviations abbr / abbrev / abd / abdom. In a spelling app a misspelling
   presented as a headword is the one defect that actively teaches the wrong
   thing, so they are struck as the library loads. 'mis' carried the definition
   of MI, myocardial infarction — a corrupted pairing — and goes too.
   Struck at load rather than by rewriting a 44MB generated file, which keeps
   the correction reviewable in one place. */
const CORE_STRIKE = new Set(['alloted','commmitteth','induhvidual','abe',
  'abbr','abbrev','abd','abdom','mis',
/* ---- racist and antisemitic terms, struck 5 Sep 2026 ----
   165 headwords whose only real sense is a slur. Most were found by the
   library sweep; the rest by their own glosses, which CONFESS — "(ethnic
   slur)", "offensive term for a person of ...", "now considered offensive" —
   and were served anyway. The antisemitic set is the one that says most about
   this data: Jew-free, Jew-hatred, Jewless, Jewlessness, Jewlike, Jewman,
   Jewspeak, Jewdar. Those are not dictionary words. No lexicographic source
   carries `Jewlessness`; it was scraped or generated, and it reached a
   children's library.
   A word is struck here only when the SLUR IS THE WORD. Where the headword has
   a real sense a bee would ask and only the DEFINITION was the slur, the word
   stays and the gloss is repaired in CORE_FIX instead — dike is an embankment,
   paddy a rice field, pouf a footstool, queer means strange, kraut is pickled
   cabbage, gyp is short for gypsum. Deleting those would lose good bee words
   to a bad dictionary, which is the mistake the genus-name deletion made. */
  'americunt','antinegro','boche','boches','bulldyke','butches','caffre','chamar','chinaman',
  'chinamen','chinesey','chink','chinks','christfag','cockfag','coolie','coolies','cooly',
  'currymuncher','dagoes','dagos','darkey','darkeys','darkie','darkies','darky',
  'deniggerization','deniggerize','dothead','dyke','dykes','dykon','fag','faggots','fagot',
  'fagots','fags','federast','feminazi','feygele','finook','furfag','gayboy','gaywad',
  'giaour','ginzo','gip','gipped','gipping','gips','gipsies','golliwog','golliwogs','gooks',
  'greaser','greasers','gringo','gringos','gweilo','gweipo','gypped','gypping','homintern',
  'homocaust','honkey','honkeys','honkie','honkies','honky','hooknoses','injun',
  'islamonazism','jap','japanazi','jerrybag','jew-free','jew-hatred','jewdar','jewess',
  'jewless','jewlessness','jewlike','jewman','jewspeak','jigaboo','jigaboos','kafir','kafirs',
  'kikes','klannish','klans','klaverns','kleagle','klonvocation','krauthead','lardarse',
  'lardass','lardball','limey','limeys','lynch','lynchings','maricon','marrano','meid',
  'mexcrement','mick','micks','mischling','mojado','molestache','moonie','moralfag',
  'mulattress','muzzie','n-bomb','nances','nappyhead','negroize','niggeress','niggerish',
  'niggerishness','niggerism','niggerization','niggerless','niggerlike','niggerlips',
  'niggerlover','niggerly','niggerness','niggerology','niggers','niggery','niggy','orientals',
  'paleface','palefaces','papist','papists','picaninny','pickaninny','pom','pommies','pommy',
  'poof','poove','popehead','raghead','redskin','redskins','rooinek','schvartze','sheeny',
  'shegetz','shiksa','shikse','shitskin','soutie','spics','spik','wetback','wetbacks','wop',
  'wops','zipperhead',
  'niggerfaggot','niggerfucker','niggerling','niglet','nitchie',
/* ---- the corpus sweep, 5 Sep 2026 ----
   1,924 words read one at a time by thirty-six reviewers covering all 36,393
   served words no reviewer had seen under the strict content brief. They must
   be struck HERE as well as deleted from the served shards: fixCore guards the
   130k library, which is what the Whole Hive list, the Word Finder, the Ultra
   road and hardPool draw from, so a word deleted only from the shards is still
   one search away.
   Three classes dominate, and none of them is English: Latin genus and family
   names sold as words (clupeidae, pelecanus, arachnida), acronyms (cia, ascii,
   awol), and — worst in a spelling app — misspellings drilled as correct, with
   `scarey` sitting eleven rows from `scary` in the same list. The rest is
   content no bee would ask a child: catamite, beaner, hajji, golliwogg.
   THE SCIENTIFIC NAMES CAME BACK on 5 Sep: 1,102 genus, family and order
   names were struck here as "Latin presented as English", and that was
   wrong for a spelling bee, which does ask them. They are live again with
   their original definitions; everything else above stays struck. */
  'abacination','abattue','abc','abdominohysterectomy','abhorson','abietineae','abortions',
  'abortus','abrachia','abs','acc','acephalia','acorea','ada','adactylia','adams','adenosis',
  'adiposis','adp','agalactia','agee','agelicism','agnatha','aircrafts','ais','albee','allen',
  'aller','alonso','alright','als','alt','alts','amastia','amelia','amentia','ametria','amex',
  'amniota','amytal','anaclisis','anapsida','anderson','anencephalic','anencephaly',
  'animalia','annexa','annexal','ans','anthony','apoidea','apr','arces','arcsin','arctan',
  'ars','aryan','aryans','asap','ascii','ates','atm','aum','aus','awol','bams','barbital',
  'barbitone','bart','barth','baruch','bas','batrachia','bayard','bayoneted','bds','beaner',
  'beaners','beatles','beaumont','becket','beckett','bede','beefcake','benedict','benet',
  'bergman','bering','berith','berk','berkeley','bernard','bessemer','bhang','bircher','bis',
  'bisexual','bisexuality','bisexuals','bitchiness','biz','bizet','bks','blackface','blake',
  'blok','bloodbath','blooding','bloodlust','boner','boners','boney','bostons','bowlder',
  'bps','bra','bras','brasil','bren','brith','bryophyta','bulimia','bulimic','bullrush',
  'burk','burtons','buxom','calcedony','camelia','camerae','carcinoid','carlos','caroli',
  'carolus','casava','catamite','ceratin','cesarian','cest','cgs','changs','charadrii',
  'chawbacon','cheloid','chelonia','christies','cis','cive','cobol','coccidium','cockfight',
  'cockup','collins','colones','commie','comte','conceptus','concubinage','congreve',
  'controled','coprolith','corditis','corp','cos','cosec','coses','cosh','cotan','cps',
  'craniata','crazies','creatin','cro','crookback','crs','cubas','cuckolded','cuckoldry',
  'cul','curet','curettage','cutlas','cwt','cyanamid','cyder','dag','dagga','dags','dal',
  'damn','dat','davies','dbms','ddt','debitor','dec','decidua','deciduae','der','des',
  'descendents','dess','dewey','diablo','diam','dias','diazepam','dilantin','dink','dinks',
  'diss','dkm','dod','dominus','dorylinae','dos','dowery','downers','dramamine','duer',
  'dutcher','dys','dysuria','eccyesis','eclampsia','edp','eds','effeminate','elias','els',
  'elvis','emf','endometrial','englishes','entires','enuresis','epa','epi','ernst',
  'erogenous','ers','ese','esp','esq','est','estradiol','estriol','estrone','eugene',
  'eumycetes','eunuch','euryalida','eurylaimi','eutheria','evacuant','evans','eyres','fagin',
  'falange','falla','falsie','fanny','faq','farer','fas','fass','fbi','fecalith','fet',
  'fetishes','fetishist','fetometry','fica','fifo','fillmore','flapcake','flaubert','flog',
  'flogger','flory','folies','fourier','fps','fradicin','franca','frances','fratricides',
  'frazer','friedman','fris','frison','galen','gallamine','gallowses','ganoidei','garrick',
  'garrotted','gat','gatling','gats','gayness','gays','gds','geld','gelly','ges','gied',
  'gigolo','gimp','gis','gish','gladstone','glenn','goddam','goddamn','goddard','golder',
  'golgi','golliwogg','gos','goy','goyim','gps','gravida','grume','grumose','grumous','gruss',
  'gunman','gunmen','gunplay','hangman','hans','harelip','hassel','hawthorne','hayes',
  'hazmat','hearst','hebephrenia','heinz','helas','hellman','hepaticae','hepatoma','herbert',
  'heros','herpes','hes','heterosexual','heterosexuality','hexapoda','hickey','hiper',
  'hitler','hodgkin','hogg','holibut','homeless','homo','homosexuality','homosexuals',
  'hooknose','hooters','horniness','horny','houghton','howard','howes','hrs','hubble','hud',
  'hughes','hugo','humous','humping','hunchback','hurted','huss','hussy','hydrolize',
  'hymenal','hysterectomies','iago','ida','imu','inc','infos','ins','inst','interne',
  'intersex','intrench','ios','ips','iqs','irregardless','irs','isn','jaggers','jai','jan',
  'jared','jem','jewess','jewfish','jhvh','johns','jong','kaoline','kat','katar','kats','ker',
  'kinky','klan','klansman','klavern','kph','krs','lan','laniard','lapidate','lapidator',
  'lapp','larn','las','laster','lat','lati','lav','lcd','leafs','leary','lech','leger',
  'leiomyoma','lense','les','letch','leukotomy','levis','libidinal','lier','lifo','limicolae',
  'linac','lins','lis','listerine','litoral','llb','logans','loggie','lowes','loxes','luger',
  'lully','lunas','lunt','lutrinae','lymphuria','lynchings','maffia','majeure','mamilla',
  'mammilla','maness','mantrap','mao','maries','martials','marys','mastalgia','mastectomies',
  'mastopexy','matricide','mauser','mbd','mcg','meconium','mediobrome','meg','melaena',
  'melagra','melena','melinae','mens','menurae','mer','meralgia','merginae','mes',
  'mesothelioma','methotrexate','metopion','metralgia','metrazol','micturate','mider','min',
  'miniscule','mins','mips','mischmetall','misopedia','mit','mitomycin','mobed','mol',
  'molestation','mols','momi','monera','mons','mos','moslem','mph','msg','mss','murderess',
  'musci','muscoidea','muskat','myiases','myiasis','myomorpha','myoses','myriapoda',
  'mysidacea','mysticeti','nanism','napalm','narcist','naturist','nauseam','necked','necker',
  'neer','nembutal','nervus','neter','neuralgy','nidation','nis','nist','nocturia','noded',
  'noma','nonsexual','nov','nubile','nuda','nudism','nudist','nudity','nullipara','numidinae',
  'nycturia','nymphet','oct','ods','oestriol','oestrone','oestrus','olds','oliguria','oni',
  'onyxis','opec','ophidia','orgies','orgy','orientals','oswald','otides','oxytocic','ozaena',
  'ozena','paba','pac','pachuco','palmature','papistic','para','paramour','paras','parricide',
  'patricide','payed','paynim','pdl','pectineal','peed','percoidea','percy','perineal',
  'pernod','perry','pestis','petter','phasmida','philanderer','picariae','pinealoma',
  'pipeful','pirana','pitressin','polack','pollenate','polska','popish','porc','pos',
  'potomania','pow','prat','pressor','priapic','priapus','prima','primipara','principes',
  'privates','prn','probenecid','proctoscopy','procurer','prolapse','propellor',
  'prostatectomy','protista','proto','prox','prs','prurigo','pruritus','prys','psychopaths',
  'ptomain','pts','pubic','pudendal','putz','qats','qed','rachet','racoons','ramed','raping',
  'ratitae','recce','reccy','recission','rectal','redneck','rednecks','reit','relaxin','rem',
  'rep','reps','retinoblastoma','rfs','ricin','ridgel','ridgil','righter','rioja','ripper',
  'roi','rom','roofy','ros','rpm','rubens','russell','salomon','sam','sanger','sanies',
  'sannup','sauter','saxe','scarey','scarface','schiller','schoolcraft','sec','secs','seps',
  'sept','serra','seton','sexed','sexier','sexiest','sexless','sexts','sexuality','sexy',
  'seymour','shagging','shat','shawny','sherbert','shiv','shnook','shotgun','shotguns','shwa',
  'shylock','shyster','shysters','sider','sise','sissy','skinhead','skinheads','slasher',
  'slimer','slivovitz','snafu','snafus','sniper','snipers','snorty','sociopaths','soler',
  'sooners','sos','spastic','speer','speers','spicae','spirt','starr','stm','stogie','stogy',
  'stoner','stouts','streaker','sumner','swastika','swastikas','swob','swosh','taft','taked',
  'talbot','tampon','tampons','tartars','tate','tawse','taylor','tbs','teasle','tec',
  'temptress','terata','terrorism','terrorist','terrorists','testicle','testicles',
  'thalidomide','theres','thibet','thomas','thompson','thous','tindal','tis','tit',
  'titillating','tnt','todays','todd','tooths','torturer','tracy','tubmen','tush','tweest',
  'ult','unesco','unicef','uns','unsex','urs','usa','ussr','valium','vasectomies','ver',
  'vibrator','vier','vip','vips','virago','virginity','virgins','virtus','vis','voyeurism',
  'wacs','wats','wees','wifes','wino','winos','wis','womanizer','womans','worser','wus',
  'yhwh','yis','yrs',
/* ---- the twenty-reviewer sweep, 5 Sep 2026 ----
   Twenty reviewers read all 19,810 free-journey placements one at a time. The
   content they surfaced is listed here AND in words-patch.js, for the reason
   block 1a records: fixCore guards the 130k library, but a child practises out
   of SB_DATA.nsf, and every one of these was live in both.
   These are here rather than left to SLUR_DEF because a pattern scan over the
   whole served corpus found 0.6% of them — the glosses read innocently.
   `dicks` was "someone who is a detective". Rules cannot see that; only
   reading can, which is the lesson of the 37 learned again at scale. */
  'abacinate','abhominable','aphrodisiac','audubon','autoloader','bacchanalia','balisong',
  'blotto','booger','boogers','bosomy','calfs','capibara','carotin','casanova','castration',
  'caucasoid','chancrous','chico','chicos','circumcision','codpiece','come','coonskin',
  'coontie','coquette','crappy','cretin','cripple','cum','debauch','defecator','dicks',
  'disney','douche','doxy','dumdum','emasculate','epicanthi','erotism','estrus',
  'evert','feticide','filicide','gamin','gestapo','gipsy','git','goodmen','goring',
  'guinness','harpy','hausa','hebe','hermaphrodite','hollands','idiot','imbecile','iodin',
  'ira','jackass','katharsis','khat','kluxer','limey','lothario','lubricity','lulu','lynch',
  'lynching','mahound','masochism','mermen','midget','minx','mioses','miosis','moder',
  'mongolism','moron','morons','myosis','naturism','nazify','negro','negroes','negroid',
  'negros','nipple','nipples','nudists','octoroon','odalisque','oedipal','phallic','piss',
  'pissing','poleax','poleaxe','ponce','proctitis','proctoscope','promiscuity',
  'promiscuous','prurience','pruriency','puke','quaalude','quaaludes','quadroon','randy',
  'risque','sadism','saki','sarin','saturnalia','satyr','satyrs','seel','semite',
  'serail','sext','sexual','sexually','shitty','sills','sitters','snot','sonsy','sully',
  'suttee','tawney','tits','toying','transvestite','transvestites','trepanation','turp',
  'twit','twits','vasectomy','wittol','wuss','xis','yogi','yogin','yogis','zulu','zulus',
/* ---- the 37, signed off 4 Sep 2026 ----
   The SLUR_DEF pattern below reads what a definition says about its own
   headword, which is why it catches a whole class rather than a word list. It
   cannot catch these: their generated definitions are neutral or plainly
   invented, so there is nothing in the data to match on — "squaw: an American
   Indian woman", "cocklicker: a person who cleans or tends cockle shells",
   "encunt: enclosed within a hollow or cavity". A definition that hides what
   the word is defeats any pattern, so the only remedy is to name them, and
   naming them is the owner's call rather than this file's. These were reviewed
   one by one and struck on 4 Sep 2026.

   Innocent lookalikes are NOT here and must never be added on a substring:
   haboob is a sandstorm, booby and boobies are the bird and the blunder,
   booboisie is Mencken's coinage, boobird is a heckler, basshole is the f-hole
   of a double bass, twankay is a green tea, and fagoting is embroidery. So are
   spicy, japes, chinking, retarding, mispickel, swanky, pinprick, meltwater,
   saltwater and wristwatch. Every one of them contains an unlucky run of
   letters and nothing else, and tests/word-bank.cjs fails if one goes. */
  'abo','abos','mulatto','mulattoes','mulattos','squaw','squaws',
  'niggerese','niggerize','niggerless','niggerlike','niggery',
  'blowjob','blowjobs','bollock','bollocks','boobage','cocklicker','cuntass',
  'encunt','fuckity','kinderwhore','knobheaded','shitbag','shithead','sluts',
  'teledildonics','titty','twats','unfuck','unfuckable','unfucked','unfuckupable',
/* ---- sexual-violence and pornography glosses, signed off 5 Sep 2026 ----
   Found by three of the twenty word-fit reviewers, independently, while checking
   which stop each word belonged in. SLUR_DEF cannot see these either: the gloss
   is a plain description, not "an offensive term for". `ravished` was serving in
   Elements & Forces (its gloss contains the word "force"), `porno` in Literary &
   Poetic Devices ("of no literary value").
   `rape` is struck for the same practical reason as `niggard`: the bank serves
   only the botanical sense (a forage crop), but this app SPEAKS each word aloud
   to a child and asks for the spelling back, and that is not a word to say to a
   nine-year-old for the sake of rapeseed.
   `ravishing` is NOT struck — it has a common, kid-safe sense, so it is repaired
   in CORE_FIX below instead, the way retard and shrimp were. */
  'ravish','ravished','ravisher','ravishment','ravishes',
  'porn','porno','porns','pornos','pornography','pornographic',
  'rape','raped','rapes','rapist','rapists','molest','molested','molester','molesting',
/* ---- the ethnic slurs, signed off 5 Sep 2026 ----
   Found the same way and for the same reason as the 37 above: SLUR_DEF reads
   what a definition SAYS about its headword, and every one of these is glossed
   innocently, so nothing in the data matches. kaffir is defined as a cereal
   crop, "important for human and animal food"; hottentot as "any of the Khoisan
   languages"; negress as "a Black woman or girl"; bushman as "a member of the
   race of nomadic hunters"; coolie as a labourer. All of them were reaching a
   child's word list — kaffir surfaced in a Meadow round about creatures.
   eskimo, bushman and gypsy are dated exonyms rather than unambiguous slurs and
   each has an innocent sense (the gypsy moth, a gypsy cab); they are struck
   with the rest because this app reads a word aloud to a child and asks for it
   back, and that is not the place to litigate a contested term. */
  'kaffir','kaffirs','kafir','kafirs','hottentot','hottentots',
  'negress','negresses','pickaninny','pickaninnies','coolie','coolies',
  'redskin','redskins','chinaman','chinamen','halfcaste','half-caste',
  'eskimo','eskimos','bushman','bushmen','gypsy','gypsies',
/* niggard, niggardly, niggards and niggardliness are NOT slurs — they come from
   Old Norse and mean miserly, with no connection to the word they resemble.
   They are struck for a practical reason, not an etymological one: this app
   SPEAKS each word aloud to a child and then asks for the spelling back. If
   that call is ever reversed, these four are the whole of it. */
  'niggard','niggards','niggardly','niggardliness',
/* not words: acronyms respelled as letter names (cst = SEE-ES-TEE) and chemical
   symbols with an s on them (cfs = californium). See words-patch.js. */
  'abc','abd','acc','adp','aus','bas','bes','bis','bks','bpi','bps','btu','cfs','cgs','cia','cli','crs','cst','dbms','ddt','dui','dys','edp','emf','epa','ers','ese','esp','fps','ges','hes','iou','isn','kph','krs','las','lcd','lcm','lis','llb','mbd','msg','mss','mts','nis','pfc','pos','prs','pst','pts','qed','stm','tas','tbs','tis','tnt','vip',
/* `dike` was never on this list. It did not need to be: its LIBRARY gloss was
   "(slang) offensive term for a lesbian", and fixCore drops any entry whose own
   definition says that — so the gloss itself was doing the work. The served
   corpus keeps the word under a repaired gloss (an embankment) by a separate
   decision, and on 5 Sep the two banks were reconciled by copying served text
   into the library, which handed this entry a clean definition and quietly
   switched the filter off. Naming it here makes the exclusion say what it means
   instead of depending on a harmful sentence staying in the data to trigger it. */
  'dike',
/* ---- library sweep, 5 Sep 2026 ----
   Seventy-six reviewers read the 75,645 words that live in the 130k library but
   never in the served corpus — reachable through the Word Finder, the Whole Hive
   list and the Ultra road, and so read by no earlier sweep, all of which worked
   from the SERVED shards and were therefore looking at a subset. These are the
   harm-class findings only: slurs, sexual content, drug and self-harm glosses.
   They are already deleted from words-full.js, so this list changes nothing a
   child sees today — it is what stops them returning if the file is regenerated.
   The other 757 removals were quality faults — acronyms, misspellings, bound
   affixes — and live in qc-library-fixes.json, which must be re-applied after any
   regeneration of words-full.js or words-hard.js. */
  /* The partition hole: seventy-six reviewers each read a SLICE, so `catamites`
     and `catamite` went to different readers and only the plural was struck. These
     nineteen are the survivors of that split, each carrying the same gloss its
     struck relative was removed for. `homo` is here because the record in this
     library is the slur sense, not the genus — there is no Homo sapiens in it to
     keep. `buxom` is not listed here only because the corpus sweep had already
     struck it on 4 Sep; its records are deleted from the file to match. */
  'butch','catamite','douche','erotism','gigolo','harelip','homo','lech','letch','molest','molested','molesting','nance','niggery','nymphet','ravisher','spick','unsex',
  'alkies','americunt','antinegro','antiorgastic','antipaedophile','antiqueer','antirape',
  'antisexual','antisexuality','asphyxophilia','asscheek','assclown','assholes','assholic',
  'assish','asskisser','asslicker','assmonkey','assmunch','assmuncher','asspussy','asstastic',
  'asswad','assward','asswards','assy','autodefenestration','autogynephilic','autosexual',
  'badass','badassery','bardash','bareass','bartholinian','baubon','beefcakes','berdache',
  'bimbette','bimbo','bimboes','bimboesque','bimbos','bimboy','birdshit','bitched','bitchery',
  'bitchier','bitchiest','bitching','bitchy','boche','boches','bootylicious','brachioproctic',
  'bremelo','brokeass','bukkake','bulldyke','bullshido','bullshittery','bullshitting',
  'burusera','bustiest','busty','butches','buxomer','buxomest','buxomly','cack','caffre',
  'carnography','catamites','celesbian','chamar','chinesey','christfag','circumciser',
  'circumvaginal','cockbreath','cockfag','cocktease','conservatard','cooly','crapitalism',
  'crapola','crapped','crapper','crappers','crapping','crappity','crapplet','craptastic',
  'craptastical','cremasteric','cretins','cripples','crotchdropping','crotchless','cumhole',
  'cumskin','cuntfest','currymuncher','cyberrape','cybersexuality','cybersexually','dagoes',
  'dagos','darkey','darkeys','darkie','darkies','darky','dartoid','deball','deflour','deflower',
  'deflowers','deniggerization','deniggerize','depucelate','derograte','desexualize','dickass',
  'dickbag','dominatrix','dominatrixlike','donkeycock','dormcest','dothead','douchebag',
  'douchebaggery','douchey','drug-ridden','drugger','druggy','drugster','drugtaker',
  'drugtaking','dubcon','dumbass','dyke','dykes','dykon','eco-','ecopornography','ecosexuality',
  'emda','empathogen','entactogenic','erogenicity','erotisms','erotopathy','erototoxin',
  'esexual','eunuchoid','explornography','f-bomb','fag','faggoting','faggots','fagot','fagots',
  'fags','fauxmosexual','federast','fellate','fellated','fellating','fellatrix','felo-de-se',
  'femifascist','feminazi','feygele','finook','fondler','fondlers','fondlings','foodgasm',
  'frotteurism','fuckton','furfag','gamahuche','gay-ass','gayboy','gaywad','genitalic','giaour',
  'gigolos','gimped','gimping','gimps','gimpy','ginzo','gip','gipped','gipping','gips',
  'gipsies','goddamned','gokkun','golliwog','golliwogs','gonorrhoeic','gooks','goosed',
  'goosing','grabass','greaser','greasers','gringo','gringos','gweilo','gweipo','gynephile',
  'gynophilia','gypped','gypping','harelips','hasbian','hebephile','hebephilia','hemipenis',
  'hentai','homintern','homos','honkey','honkeys','honkie','honkies','honky','hooknoses',
  'horsecock','hosebeast','hussies','hypersexed','hypersexualize','ibogaine','indevirginate',
  'infibulation','injun','intervaginal','intracavernosal','islamonazism','ithyphallic','izmel',
  'jap','japanazi','jerkass','jerrybag','jew-hatred','jewdar','jewless','jewlike','jewman',
  'jewspeak','jigaboo','jigaboos','joygasm','kamasutra','kikes','kinseyan','kiss-ass','kissass',
  'klismaphilia','knobhead','knobtwat','krauthead','lactophilia','lame-stream','lamestream',
  'lardarse','lardass','lardball','leches','letches','lorette','lustmaking','luxuria',
  'mahometanize','malesub','mangina','manopause','maricon','marrano','megabitch','meid','merd',
  'mexcrement','mick','micks','mischling','mohammedan','mohammedanism','mohammedanize','mojado',
  'molestable','molests','monstercock','moonie','moralfag','moronity','motherfucker',
  'mulattress','muzzie','n-bomb','nances','nappyhead','narghile','negrohood','negroize',
  'newhalf','niggeress','niggerfaggot','niggerfucker','niggerish','niggerishness','niggerism',
  'niggerization','niggerling','niggerlips','niggerlover','niggerly','niggerness','niggerology',
  'niggers','niggy','niglet','nitchie','nonbisexual','noncelibate','nonces','noncrippled',
  'nongonococcal','nonincestuous','nonrape','nonretarded','nonsadomasochistic','nonsex',
  'nonsexuality','nonsexualized','nonsexy','nymphetry','nymphets','nympho','nymphomaniacs',
  'nymphos','nyotaimori','octoroons','olisbos','orchidectomy','orgasmatron','oversexed',
  'oversexualize','paederastic','paedophilia','paedophiliac','paedophilophile','paleface',
  'palefaces','pansexuality','pansexually','papist','papists','papooses','pappoose','pappooses',
  'parahexyl','paraphillia','paraphily','pathic','paultard','pedohebephile','pedohebephilia',
  'pendejo','penetratee','phalluses','picaninny','pindick','pissass','pissed','pissery',
  'pisses','pissest','pisseth','pissface','pisshole','pissiness','pisspants','pissy','polansky',
  'polyaddiction','polysubstance','pom','pommies','pommy','pomosexual','ponces','poof','poove',
  'popehead','poperies','popery','pornocopia','postwhore','presstitute','pro-circ','prostitot',
  'pseudovirgin','punani','pussier','pussiest','quadroons','quasirape','quasisexual','quickies',
  'quim','raghead','randier','randiest','rapability','rapable','rapee','rapefest','rapeful',
  'rapelike','rapey','rapophile','raunchier','raunchy','ravishers','redskirt','reffo','refujew',
  'rerape','retarded','rooinek','roundheels','sadean','sadian','sambo','satyriasis',
  'schizosexual','schvartze','scumbag','semens','sex-texting','sexcapade','sexhibition',
  'sexify','sexiness','sexpert','sexploitation','sexploitational','sexpot','sexting',
  'sexualist','sexualizable','sexualize','shebrew','sheeny','shegetz','shiksa','shikse',
  'shitpile','shitskin','shitton','skank','skinheadism','slutbag','snus','somnophilia',
  'sorostitute','soutie','spanko','spicks','spics','spigger','spik','spiks','squarehead',
  'stupidshit','stuprous','subhallucinogenic','supersexual','supersexuality','teatard',
  'technosex','technotard','teleiophile','teratophilia','tightass','tom','tomacco','toms',
  'tonto','trental','tribade','ufo','unbepissed','uncircumcision','uncock','uncuckolded',
  'undeflowered','unmaiden','unorgasmic','unprostituted','unretarded','unsexed','unsexualized',
  'untermensch','unvirginal','upskirt','upskirting','uranist','urning','urophilia','vajazzle',
  'venereous','voetsek','voyeuristic','vulvae','vulvas','wapanese','wasbian','whigger','whitey',
  'wigger','wog','wops','yid','yids','yoni','yonic','zionazi','zoosexual',
/* ---- the owner's call on the words under review, 4 Oct 2026 ----
   The v4 audit found the served corpus still defining idiot, moron and retard as "a person of
   subnormal intelligence". These six go everywhere (cretins and morons were already above).
   `retard` had been KEPT under its verb sense through CORE_FIX; the owner chose deletion, because
   the app says each word aloud to a child, which is the reasoning block 1c records for `rape`.
   `retarding` and `retardant` stay — tests/word-bank.cjs holds them. Sixteen more (autism,
   heathen, lunatic, dumb, pygmy…) were KEPT and their glosses rewritten: CORE_FIX below. Deleted
   from the served stores at rest by tools/strike-served.cjs; tests/struck-words.cjs guards both. */
  'retard','retards','idiots','idiotic','moronic','imbeciles',
  /* and the insult forms of words already struck, same day, same decision */
  'idiotically','imbecilic','cretinous','cretinism',
/* ---- gender-identity words and meanings, 8 Oct 2026 ----
   Owner: "for trans remove the meaning 'defines a person whos gender differ from what is defined at
   birth' — this is controversial… we dont want such words or meanings… audit the entire word list".
   Every word whose meaning IS a gender identity, or the politics of one, is deleted from every store and
   from the library file at rest (transvestite(s) were already struck above). `trans` stays, with only its
   'across, beyond, through' sense (CORE_FIX). SB_UNSAFE_RE refuses the family by headword AND by
   definition, so the 130k library cannot bring one back. Kept: gender/genders (grammar), engender,
   androgynous/androgyny (appearance), hermaphroditic (botany). Guard: tests/no-gender-identity.cjs. */
  'agendered','ambigender','ambigendered','androgynously','antigender','antitranssexual','bigender',
  'bigendered','cissexual','cissexuality','genderfluid','intergender','kathoey','multigender',
  'multigendered','nonfemale','nongender','nongendered','nontransgender','nontransgendered',
  'nontranssexual','postgenderism','sexship','transfeminism','transfolk','transgender','transgenderism',
  'transman','transsexual','transsexuality','transsexuals','transwoman','ungender','ungendered',
  /* defined by "gender identities" — the same meaning */
  'omnisexual','omnisexuality','nonheteronormative',
/* ---- sexual-orientation words and meanings, 8 Oct 2026 ----
   Asked the same day, the owner chose "Delete them all": every word whose meaning IS a sexual orientation
   (or its slang and politics) is deleted from every store and the library file at rest, clips included.
   Kept with their everyday sense only: gay/gayer/gaily (cheerful), straight (no bend), queer (strange, odd),
   pouf(s) (a footstool), dike (an embankment); out/outing/fairy/pansies/beard lost their orientation
   senses in SB_ALT. Kept on purpose: asexual/ambisexual (biology), sapphic (a verse form), sappho and
   Lesbos (the poet and the island), homophone(s), homophilous. Guard: tests/no-gender-identity.cjs. */
  'gayville','polari','antihomophobic','antihomosexual','antihomosexuality','antilesbian','gaybait',
  'gayborhood','gayby','gaydar','gaydom','gayish','gaymer','gaynesses','gaysian','gaytopia',
  'heteronormative','heteronormatively','heteropatriarchy','heterosexualist','heterosexually',
  'heterosexualness','heterosexuals','homonationalism','homonormative','homonormatively','homophile',
  'homophobia','homophobic','homosexual','lesbian','lesbianhood','lesbianic','lesbianish','lesbianism',
  'lesbianization','lesbianize','lesbianness','lesbians','lesbianship','lesbigay','nongay',
  'nonheterosexual','nonhomophobic','nonhomosexual','nonlesbian','nonqueer','queers','yestergay']);
window.SB_CORE_STRIKE=CORE_STRIKE;   /* kid-safe.js reads it (games spec §1.2): a struck word is never a game word */
/* ---- the reviewed non-words, signed off 4 Sep 2026 ----
   1,762 entries the generated core carried that are not English words a speller
   should ever be set: bare given names and surnames, misspellings, mechanical affix
   coinages (megaprofit, nonasterisked), two-word compounds jammed solid,
   unnaturalised foreign words and abbreviation fragments. Each was judged one by
   one against four keeping rules — a Name-ian form survives where the person or
   place is prominent AND the term carries meaning, as do city names, god and
   goddess names, and classical formations like Catalanophile. That rescued 491 of
   the 2,253 originally flagged; these are the rest. Held as one pipe-joined string
   rather than 1,762 quoted literals, the shape voice-words.js uses. Spellings keep
   their printed case for reading and are lowercased for lookup. */
const CORE_CUT = new Set((
  'abacli|abadengo|abalation|abandum|abax|abbogada|abdaria|abdom|Abgarus|abgeschmackt|' +
  'abilitable|acellularization|acelom|acognitive|acroleukopathy|addictionlike|aerocentric|' +
  'aerokinesis|Afeefa|affirmatio|aforelisted|afterfest|afterseen|agencylike|agentspace|Aghayan|' +
  'aglycosuria|ajapsandal|ajapsandali|akilter|alabamium|Alcman|Aleksanian|alethetic|allergylike|' +
  'alligatorlike|ambigendered|Americunt|Amerithrax|aminotransfer|amphtrack|anamonic|ancillula|' +
  'androidlike|anemious|anhomomorphic|annepressin|antelabrum|anthroconservatism|antianorexia|' +
  'antiarthritis|antiavian|antibullet|antibundling|antibureaucrat|anticable|anticarbon|' +
  'anticasino|anticatabolite|anticensus|antichange|anticircular|anticircus|anticoalition|' +
  'anticoffee|anticommission|anticompromise|anticonfession|anticonsensus|anticonsolidation|' +
  'anticonstructivism|anticontra|anticontraction|antidebate|antideer|antidefendant|antideficit|' +
  'antideportation|antidesertification|antidevelopment|antidevolution|antidictatorship|' +
  'antidiscursive|antidissolution|antidistribution|antidivision|antidoctor|antidrought|' +
  'antiemployee|antiemployment|antifirearms|antifish|antifishing|antiflow|antifood|' +
  'antiforeclosure|antifragmentation|antifundamental|antifungus|antigag|antigambler|' +
  'antigangster|antigenerative|antigenetics|antigerm|antighetto|antigiardiasis|antigirl|' +
  'antigold|antigolf|antihaemophilia|antiimport|antiincinerator|antiindependence|antiindustrial|' +
  'antiindustry|antiinfection|antiinflammation|antiinsect|antiinstitutionalist|antiinsurgency|' +
  'antiintrusion|antijitter|antijunta|antikick|antikilling|antikissing|antimen|antimercenary|' +
  'antimeritocracy|antimessage|antimessianic|antimetaphorical|antimetastasis|antimilk|' +
  'antimonogamy|antimother|antimotivation|antimurder|antimuseum|antipig|antipigeon|' +
  'antiplaintiff|antipleasure|antipluralistic|antipoisoning|antipress|antiprevention|' +
  'antiprivacy|antipropagation|antipsoriasis|antiquasiparticle|antiradio|antirail|antirally|' +
  'antirap|antirecycling|antireferendum|antirelationship|antireligiousness|antirepression|' +
  'antirepressive|antiresearch|antireunification|antirollover|antirotating|antisagging|antisalt|' +
  'antisanctions|antiscalping|antischolarship|antisealing|antisecurity|antiseparatism|antiset|' +
  'antisexualist|antislippage|antisneakage|antispasmolytic|antispatial|antisterino|antistimulus|' +
  'antisubsidence|antisupermarket|antisurfing|antisurgery|antisurgical|antisurvival|antitea|' +
  'antitrain|antitravel|antitruncated|antitruncation|antivideo|antiwarfare|antiwarming|' +
  'antiwarrior|antiwater|antiweapon|antiwildlife|antiwomen|antiyellow|antizombie|antizoo|' +
  'anumerical|apartheidlike|apathete|apologizable|Apovian|Apovyan|apparation|applicationwide|' +
  'arborcide|archaeastronomy|archmodernist|archsegregationist|arenalike|asecretion|asetate|' +
  'asine|asparaguslike|astochastic|astrointerferometer|astroseismology|athermotactic|atpatruus|' +
  'atrist|atscape|attohertz|attokatal|auctionlike|aufwuch|auntness|authouress|autobuffet|' +
  'autochef|autoconfirmation|autoconnection|autointeraction|autoion|autojoin|autolearning|' +
  'autoloom|autopartitioning|autoperformance|autoplunger|autoredirection|autoscattering|' +
  'autospeak|autotarget|autotransformation|autowrap|avascularized|awesometastic|backspaceable|' +
  'badgelike|badgemaking|Bahktinian|bakchoi|bakmi|balletlike|balletmaster|balletwear|balmify|' +
  'balusterlike|bandagelike|bandikini|bandkini|barfalicious|barfmail|baronduki|baseis|' +
  'basketweaver|basshole|batcrap|batdom|batfaced|bathkeeper|batless|batonless|batonlike|batpoop|' +
  'batskin|batterlike|beamsome|beblast|beccal|befie|beretlike|Bhabhan|bialtitude|bicardial|' +
  'bication|bightsome|bikinilike|billboardless|billboardlike|bimeter|bimonopole|binlike|binsite|' +
  'binucleus|biochromatic|biodot|bioerror|biofabric|bioingredient|bionanosensing|biopelagic|' +
  'biorientable|biovisualization|biphotochromic|biraryl|bisectarian|bisligand|bispiraled|bited|' +
  'bitriplet|blandiose|blastworthy|bleachorexia|bobfloat|bogotic|boomsayer|borderspace|' +
  'bosintang|boutiquelike|bozbash|brachioproctic|bragas|brager|brazierlike|brickshaped|' +
  'broccoloid|bullshido|bumder|bungaloft|burocracy|burocratic|burusera|burys|butat|byoyomi|' +
  'bytesexual|cabbageless|caffeinelike|calypsis|camouflanguage|campaignlike|canadew|capacify|' +
  'capology|caponomics|Caputoan|caramellike|carapacelike|carbonlike|carborexia|carcoat|' +
  'cardioectomy|cardiopulmonology|carlessness|casinolike|Catalanness|catapultlike|catlore|' +
  'catperson|cavemouth|ceduous|celebrityville|celeripede|celibacist|cellevision|centesm|' +
  'cespitine|cessile|cestuan|chankonabe|Chaparian|cheerleaderlike|cheesemeister|cheewink|' +
  'chemobiotic|chenfish|chickification|chipmusic|chloriodine|chlorocholesterol|chongake|' +
  'choralelike|choralography|chronocide|chronofile|chronokinesis|chronotaxis|cinemuck|' +
  'circummultiple|circusless|civilogue|classitis|clonological|clonology|codalike|coenonymphic|' +
  'coenrichment|cofocus|cointersection|coloniarch|colonyhood|colourest|colourous|comfortment|' +
  'commmitteth|commorse|communifake|competitionlike|computerbased|computeristic|conatal|' +
  'conforaneous|consectaneous|contraoriented|contrapolar|controlateral|copyparty|' +
  'corporationwide|countification|cowpool|crapitalism|craptastical|crimefree|crimeridden|' +
  'criticproof|crossclass|crossdisciplinary|cryoactivation|cryobench|cryobuffer|' +
  'cryoimmobilization|cryolathe|cryomold|cryosampling|cryotemperature|cryptotomography|' +
  'cryuoultramicrotomy|cyanoguanide|cyclinac|cycloadditive|cyclolignane|cyclorelease|' +
  'cylindricalization|cytol|dakuten|dauerlauf|deacetyltransferase|deathrate|debendification|' +
  'decameride|decatenatory|dechunk|deciamp|decikatal|declimb|deconcoct|defailment|defeatican|' +
  'defeatocrat|deglut|deliminate|deniggerization|deniggerize|dentitionally|dentize|deodourize|' +
  'deoxychorismate|deoxygenase|depetal|depliage|deprostrate|derograte|desertland|desklamp|' +
  'detext|developmentation|dexterwise|dibridged|dicarbamoyl|dicarbene|dicluster|dicomplemented|' +
  'dicone|diconical|dicoronene|didendron|didomain|difluorinated|difunctionally|digiterati|' +
  'digluon|diphenanthrene|diphosphonucleoside|disparency|diterebene|ditriflation|dkg|' +
  'dolichophallic|dolsot|domeshaped|dominatrixlike|dormcest|dramality|dudukahar|dustmat|' +
  'dysangiogenesis|Edenlike|edulious|effrontit|eigenmetabolite|electroaxonography|electroscalar|' +
  'embetterment|emda|emotronic|Endoeuropean|endosomotropic|endotoxicology|enosises|envolvement|' +
  'epimmunome|epinucleation|epoxyed|eptameride|equifrequency|erototoxin|errorfree|errorproof|' +
  'estorie|ethnomimesis|ethnomusic|etolin|euagaric|Euhemeros|eumelanogenesis|eurodemo|' +
  'Europewide|exosubstance|explornography|exportieren|extradentary|extramembrane|eyeborg|' +
  'facemail|factoryworker|failureproof|fairdom|fakon|familymoon|fanatism|fanslation|fanslator|' +
  'Farhud|fauxmosexual|fauxtatoes|fauxtograph|featurephone|Fedzilla|femifascist|femtomachine|' +
  'ferrometal|fictomercial|fieldscale|filemask|filmanthropy|flaccify|flappity|fleing|follicly|' +
  'foodoir|frecency|freightwagon|fretman|fruitique|fthm|Fujihara|fumidashi|fumidawara|' +
  'funalicious|furdom|furfag|furfan|furlined|fursecution|futureworld|gabberhouse|galcon|galpal|' +
  'garageware|Gasbarian|Gasbaryan|gasface|gasshohineri|gastrodome|gaytopia|gazoz|' +
  'geeksploitation|gelande|gheada|gizzing|glycoarray|glycohydrolysis|gokkun|goniolatry|' +
  'graecismus|gravitinoless|greasebomb|groovesome|guiacol|gulist|gunbai|gunpoke|' +
  'gynoroentgenology|gyreful|gyrofield|gyrosonic|gyrosonics|hadronless|Hakkoz|Hamazaki|' +
  'hamburgerology|handakuten|hanjaeo|hanmun|harboursome|Harezmian|harimanage|Harrapan|' +
  'Hartmanian|haycation|Hebdomum|helichopper|helijet|heliotomography|hentaigana|heptaphane|' +
  'heterobiography|heterocatenation|heterocomplexation|heterofunctionalization|heterotolerance|' +
  'hexdecylic|hexs|hikiotoshi|hikkake|hiplength|holoblast|holoreceptor|homoanhydride|' +
  'homofunctionalized|homolysate|homopaternal|homoresistant|honourous|Horezmian|huitre|humpity|' +
  'hydrogravitational|hydropedal|hydropelvis|hydroscientist|hydrostationary|hydrotellurate|' +
  'hyperbeat|hypercinnabar|hyperconfluent|hyperconifold|hypercortisonemia|hyperdiffusive|' +
  'hyperdilation|hyperdynamics|hyperenhancement|hyperentangled|hyperentanglement|hyperepidemic|' +
  'hyperface|hyperhomocysteine|hyperliterature|hyperslice|hypertask|hypervertex|hyperwhite|' +
  'hypoellipse|hypoprofusion|hysterokinetic|iatroepidemic|iatrotechnique|iceteroid|idiolectical|' +
  'idylatry|ileorenal|immunokinetic|immunopeptide|impavidness|inactose|inangular|inawe|inbelch|' +
  'inbind|inblind|incarnatable|inchlong|inchwide|infantcare|infinityfold|informationlessness|' +
  'infulminate|inhomogenous|inmove|inorganize|instanciate|integerness|interastrocytic|' +
  'interbinary|interblot|interbuilding|intercartel|intercave|interclump|intercommuting|' +
  'intercycle|interdendrimer|interdigit|interdimer|interdimeric|interdistributional|' +
  'interedition|Intereuropean|interfaction|interfactorial|interfleet|interform|interladder|' +
  'interlegislative|interlexeme|interlexemic|intermarker|interminiband|intermodel|' +
  'intermonolayer|intermonomer|interneoglacial|interpair|interphylum|interploidy|interprotocol|' +
  'interprotomer|interpupil|interqubit|interquery|interreceptor|intersensor|intersheet|' +
  'intershow|intersong|intersource|interstack|interstacked|interstacking|interstep|' +
  'interstereocilia|interstereocilial|interstring|interstroke|intersuck|intersurvey|' +
  'interthoracic|intertrack|intertrimer|intertrochanter|interuser|intervehicle|intervortex|' +
  'intervoxel|interwave|intra-octaval|intrabinary|intracell|intraclade|intracomponent|' +
  'intracycle|intracytosolic|intradimer|intradot|intraexon|intraexonic|intrafebrile|intragender|' +
  'intragluteally|intraileally|intraislet|intralayer|intralexemic|intramacrophage|intramatrix|' +
  'intramode|intramonthly|intraneuritic|intranight|intrapatient|intrapipette|intraplatform|' +
  'intrapulse|intraquartile|intraquery|intraresidue|intraset|intrasex|intrasite|intrasporal|' +
  'intrasubband|intrasubunit|iridiferous|irridenta|isamiashi|ishkhan|Islamonazism|isocapacitary|' +
  'isocausal|isoconfigurational|isocontour|isocurvature|isodispersion|isoexcitation|isonicotine|' +
  'isopepsin|isoventiloquinone|izori|jangseung|jellycopter|jerkess|jestress|jettest|Joinson|' +
  'Jongian|jumpity|kaibun|kainahineri|kakegoe|kakenage|kakezori|Kamboj|Kasbarian|Kasbaryan|' +
  'Kasparyan|katasukashi|kawaiily|kawazugake|kekaeshi|keratoatrophoderma|ketaguri|ketoic|' +
  'kimarite|kimedashi|kimetaoshi|kimonolike|kinboshi|kirikaeshi|kkwaenggwari|koanlike|' +
  'Kobashigawa|kokugi|kokuji|Kokyo|komatasukui|Koreshian|koshikudake|koshinage|kotehineri|' +
  'kotenage|kotolike|kruptadia|kubihineri|kubinage|kwukyel|lansa|latexwear|laudits|lebenswecker|' +
  'Leomania|leprosylike|leptonless|lilypond|longroot|lotterylike|luppie|Macolyte|macrocondition|' +
  'macrometabolism|macroplant|Madonnawise|magnatraction|magnesiumlike|magnetelastic|' +
  'magnetencephalography|magnetionic|magnetoptical|makiotoshi|mamarazzi|manatiq|masonrylike|' +
  'massagelike|mastertone|mathmagician|matnakash|matsoni|mauvelous|mayonnaiselike|megabid|' +
  'megabuilding|megabusiness|megacase|megacasino|megacatastrophic|megacelebrity|megacenter|' +
  'megachain|megacoaster|megacomplex|megaconference|megacool|megadebt|megademo|megaderm|' +
  'megadeveloper|megadevelopment|megadump|megafinance|megafish|megafoot|megafortune|megagrowth|' +
  'megahero|megahome|megahotel|megahype|megajerk|megamedia|megaministry|meganiche|megaplan|' +
  'megapopular|megaportal|megaproducer|megaprofit|megasmash|megastudio|megasuccessful|' +
  'megaterror|megatick|megatog|megatower|megavariate|megaverdict|megawealth|megawealthy|megazoo|' +
  'Melkonyan|menoporsche|mentorless|mentorlike|menuless|meride|meringuelike|metabalomics|' +
  'metalithium|metallokinesis|metaperspectival|metaprotocell|metapurpose|metaservice|micaless|' +
  'microarcsec|microboredom|microbroadcast|microchapter|microcharge|microcity|microcivilization|' +
  'microcomputation|microcone|microdecision|microdetail|microdimensional|microdistributor|' +
  'microdiverse|microfluid|microfragrance|microindustrial|microindustry|micromaterial|' +
  'micropolish|micropoop|microrefrigerator|microregulator|microrepresentation|microresistor|' +
  'microribbon|microsensing|microseparator|microsession|Microsoftify|microstorage|microsurge|' +
  'microtile|microvacation|midbay|midcampaign|midconcert|midconstruction|midgesture|' +
  'midinterview|midpeninsula|midphrase|midquarter|midquestion|midsequence|militarylike|' +
  'militarywise|militialike|milkwagon|milliarcsec|miniagency|minicanal|minicasino|' +
  'minicheeseburger|miniclimax|minidictionary|minidistrict|minidome|miniepic|minihamburger|' +
  'minilecture|minilocus|minimodule|miniparade|minirevolt|miniscreen|ministudio|minitractor|' +
  'miniwagon|minizone|mintaqah|misconstruation|miseasy|missionarylike|Mizunuma|monomyelocytic|' +
  'monopeptide|monopeptidyl|monophosphatase|monophosphonucleoside|monovisioned|moonnaut|' +
  'mooseburger|mooseskin|morphonuclear|Mouffean|multiactuator|multiadaptive|multiairport|' +
  'multialgorithm|multialgorithmic|multiamplifier|multiantibiotic|multiapplication|' +
  'multiarchitecture|multiarea|multiarray|multiassembly|multiauthority|multibaric|multibathroom|' +
  'multibillions|multiborough|multibranded|multibridge|multibuilding|multibureau|multibuttoned|' +
  'multichallenger|multiclaim|multicode|multicommittee|multiconversion|multicreedal|multicrisis|' +
  'multicultivation|multicurrent|multicustomer|multideath|multidepartment|multidirector|' +
  'multidirectory|multidistance|multidiversified|multidoctor|multidog|multidoor|multidrive|' +
  'multidriver|multiexchange|multifaction|multifare|multifarm|multifilm|multifilter|multiflight|' +
  'multiflighted|multifood|multifracture|multifragmenting|multiframework|multifruit|' +
  'multigalactic|multigas|multigoal|multigovernmental|multigradient|multihole|multihopping|' +
  'multihorse|multihotel|multiindustry|multijurisdiction|multilaser|multilevered|multilibrary|' +
  'multilight|multilinked|multiliter|multiload|multiloader|multilocked|multimemory|' +
  'multimilitary|multimirror|multimuseum|multimutated|multinumber|multiobservation|' +
  'multioscillation|multiparcel|multipayment|multiperformance|multipipe|multipipeline|' +
  'multiprint|multiproduction|multiquanta|multirack|multiread|multiregulator|multirestaurant|' +
  'multiriver|multisaver|multischema|multischematic|multischeme|multisectioned|multishipment|' +
  'multishirk|multispoke|multisponsored|multispore|multistatement|multistem|multistreet|' +
  'multistudent|multistudy|multitactical|multitaskable|multiterabyte|multithemed|' +
  'multitherapeutic|multitherapist|multitherapy|multiticket|multititle|multitower|multitown|' +
  'multiturbine|multiusage|multiusing|multivariance|multivegetable|multiwindows|multizipper|' +
  'museau|museumesque|mushlike|musiczine|muslinlike|myoendothelium|myoprecursor|myostimulatory|' +
  'myotubule|mythoplasm|naengmyeon|nagak|nalebinding|nanobiometrics|nanobreak|nanobunch|' +
  'nanoconstricted|nanocontainment|nanoconverter|nanoelemental|nanofragment|nanolevitation|' +
  'nanomodification|nanomodule|nanorecorder|nanorefrigerator|nanori|nanostring|nanotrack|' +
  'nanotransport|nanovessel|narsharab|naycation|Naziland|Nazilike|nebulalike|negotiosity|Nerdic|' +
  'nerdsome|netherregion|neuroblocking|neurocerebral|neurocranially|neuroectodermally|' +
  'neurogeography|neurolawyer|neuroligand|neuronuclear|neuropaleobiology|neuropatterning|' +
  'newgroup|newhalf|Nicholine|nichonage|niggerfaggot|niggerfucker|niggerishness|niggerless|' +
  'niggerlike|niggerlips|nighsome|nimaigeri|nimbility|ninpo|nitrogenlike|nocturnelike|noesises|' +
  'non-creationary|nonabandoned|nonabdominal|nonaficionado|nonairbrushed|nonairfield|nonairport|' +
  'nonalarm|nonalchemical|nonalibi|nonalimony|nonalive|nonallergy|nonambulance|nonangled|' +
  'nonanimation|nonannealable|nonannealed|nonannealing|nonannexed|nonannualized|nonanterior|' +
  'nonanthrax|nonanxiety|nonaquarium|nonAsian|nonasterisked|nonasthma|nonasynchronous|' +
  'nonattenuative|nonattitudinal|nonattracted|nonattracting|nonauction|nonaudio|nonaugmented|' +
  'nonautomation|nonauxiliary|nonawake|nonaxisymmetrical|nonazimuthal|nonback|nonbacklit|nonbad|' +
  'nonbaited|nonbaked|nonbald|nonbalding|nonbarcoded|nonbarley|nonbarometric|nonbarricaded|' +
  'nonbaseline|nonbillionaire|nonbiochemist|nonbiohazardous|nonblacklisted|nonbladder|' +
  'nonblameworthy|nonblasphemous|nonbleached|nonbleaching|nonblockbuster|nonblocked|nonblog|' +
  'nonblogging|nonblonde|nonblue|nonblurred|nonblurring|nonblurry|nonboard|nonboating|nonbody|' +
  'nonboilable|nonboiled|nonbold|nonbolded|nonbombastic|nonbondable|nonbookkeeping|nonboom|' +
  'nonbooting|nonborderline|nonboxing|nonboycotted|nonbracketed|nonbraille|nonbread|nonbred|' +
  'nonbrewing|nonbridal|nonbriefed|nonbroadband|nonbroiler|nonbroken|nonbronze|nonbrown|' +
  'nonbrutal|nonbubbly|nonbudget|nonbullied|nonbully|nonbullying|nonbundled|nonburger|nonburn|' +
  'nonbyte|nonCanadian|noncanal|noncanalized|noncanvas|noncapable|noncarboniferous|noncareful|' +
  'noncarnival|noncasino|noncassette|noncatenative|noncensoring|nonchanged|nonchaos|' +
  'noncheerleader|noncheese|nonchicken|nonchild|nonChinese|nonchlorofluorocarbon|noncircus|' +
  'nonclean|noncleanable|nonclear|noncloudy|noncoached|noncocoa|noncoffee|noncognoscenti|' +
  'noncoinciding|noncollecting|noncomplete|noncompleted|noncompleteness|noncomplicated|' +
  'noncomplimentary|noncomposed|noncompressed|noncomputed|nonconceptualizable|nonconceptualized|' +
  'nonconcert|noncondemning|noncondominium|nonconfessing|nonconfused|noncontainerizable|' +
  'noncontaminative|nonconversation|nonconvincing|noncooked|noncooled|noncorrect|noncorrected|' +
  'noncorrecting|noncorrelatable|noncoupon|noncowboy|noncriminological|noncurfew|noncustoms|' +
  'noncyber|noncylinder|noncytosol|nondatabase|nondead|nondealership|nondeep|nondeficit|' +
  'nondeified|nondelaying|nondelimited|nondelineated|nondemarcated|nondemonic|nondemonstrating|' +
  'nondentist|nondeodorant|nondeodorized|nondepot|nondeserted|nondesertion|nondesperate|' +
  'nondessert|nondestination|nondetective|nondeteriorative|nondeviantly|nondeviator|nondextrose|' +
  'nondiagnosed|nondialup|nondidactically|nondigitizable|nondiplomat|nondirty|nondiscardable|' +
  'nondiscriminator|nondisfigured|nondisjointed|nondisplayed|nondisputant|nondisputed|' +
  'nondisqualification|nondisqualified|nondisrupted|nondissident|nondissipated|nondissolved|' +
  'nondistal|noneidetic|nonfabric|nonglyphic|nonheritage|nonhermeneutical|nonhospitality|' +
  'nonhotel|nonjungle|nonkindergarten|nonlogistics|nonlottery|nonmicrophone|nonmicroscopist|' +
  'not-pology|Obamaton|ohunkakan|okuriashi|okuridashi|okurigake|okurihikiotoshi|okurinage|' +
  'okuritaoshi|okuritsuridashi|okuritsuriotoshi|Onmyodo|operalike|opisthothorax|opthalmic|' +
  'optionaire|optionlike|organohydrogen|osteoformation|outreport|overest|oxygenlike|paellalike|' +
  'palazzolike|paleoclassical|paleomagnetosphere|palettelike|pandeistical|pandeistically|' +
  'pannierlike|parachutelike|paracosmos|parainfection|parainfective|paranoialike|paraphillia|' +
  'paraphosphoric|paraprotaspis|paraxanthin|parroket|parrokets|partymeister|pastalike|paucality|' +
  'paveed|pearlesque|pedogeological|pentone|pergolalike|periherm|peucil|Pharmageddon|pheromonic|' +
  'philerast|phosphoproteinomics|photodisk|picoeucaryote|plankboard|plasmasonic|pochtecatl|' +
  'poisonsome|polkalike|pollyfish|poluria|polyderivative|polygonhood|polygonness|' +
  'polyhomeostatic|polytrioxane|poolwater|porticolike|portpass|presidentialness|proapoptosis|' +
  'procofactor|proteinomics|protirement|pseudohypersensitivity|pseudooligomer|pseudoproper|' +
  'psychophant|pycture|quadpod|quadripedal|raajmahal|rabis|rabiz|rakuware|rapmeister|rearseat|' +
  'recordlike|relationlike|reupdate|Robsten|Rocketshipper|roggenbrot|sadet|sageer|sandpaperlike|' +
  'sarcophaguslike|satsivi|schizosexual|schlagsahne|schmooseoisie|scizorhinal|screenreading|' +
  'screenscape|screenspace|seaspace|seldsome|selfsome|seminarlike|semirant|seponation|' +
  'sexalicious|sexship|shampoolike|Shirshak|showplan|shuted|sitcomedian|sitsome|skoramis|' +
  'slappity|slawdog|sleighbell|sleighlike|smoxploitation|snazztastic|snorasaurus|socketlike|' +
  'sodalike|sonatalike|sorbetlike|soyned|spacefiller|spaceshifting|spaceshiplike|spacewear|' +
  'splurchase|spookfest|spurionic|squabblesome|starmatter|stationlike|stereofluorescent|stethal|' +
  'stipulativeness|sucroselike|sudokuist|suitelike|sunflowerlike|superaffluent|superalert|' +
  'superauthentic|superbureaucrat|supercatalyst|superclear|superdramatic|superfamous|' +
  'supernematic|superparallel|superreligious|supersudden|surgeonlike|synamphoteron|synchicity|' +
  'synocracy|synonymification|Syntyche|systempunkt|tavernesque|taxonomizer|teahadist|teatard|' +
  'techniquewise|technocide|technoplegic|telebureau|telebusiness|telecomputer|telecontroller|' +
  'telegenetic|telegramlike|telepaper|telepersonals|telephonelike|telepolariscope|' +
  'telepresencing|teleprogram|telereality|teleshow|teleteacher|teletutor|teletutorial|' +
  'teletutoring|televirtual|televirtuality|televisionlike|terabuck|tetracarbonate|tetraxenon|' +
  'textmode|theion|therapylike|thuris|timophilia|traincrew|transpressionism|tribalesque|' +
  'truthsome|tsukihitza|tsukupin|tteok|turkeyling|tushs|twigloo|twireason|twistorian|uberly|' +
  'uglysome|ullamaliztli|ultrafamous|unformation|unicodification|uninymic|unke|Usakhelauri|' +
  'vacationship|valourisation|valourization|valourize|valourous|valourously|Varuzhan|vegaroni|' +
  'velcroid|videoterminal|voicemailbox|wagonbuilder|wagonbuilding|wardcorps|watchpocket|Wavoid|' +
  'weisure|wikiholic|wikilike|wikinomics|windowscreen|worksomeness|wreckreation|xcl|xenna-|' +
  'Xeroid|xeropthalmia|xylemlike|xylophonelike|xylophonically|Yaghoubian|yearnsome|yoshoku|' +
  'zeroable|zeroary|zerogon|zerolike|Zeshan|Zionazi|zorbonaut').split('|').map(function(s){ return s.toLowerCase(); }));
/* ---- definitions we replace rather than delete ----
   One record simply lost its definition in generation. The rest are ORDINARY
   WORDS a speller should meet — shrimp, runt, ragtag, riffraff, madhouse — whose
   generated gloss happens to be the disparaging SENSE of the spelling ("shrimp:
   disparaging terms for small people"). Dropping the word to be rid of the gloss
   would take a perfectly good bee word out of the library, so the gloss is
   replaced with the everyday meaning and the word stays. The replacement runs
   BEFORE the slur test below, so a repaired record is judged on its new
   definition — which is why no exemption list is needed for any of these. */
const CORE_FIX = {
    /* owner, 8 Oct 2026: the gender sense goes; the word keeps its first meaning (and words-patch DEF serves the same) */
    trans: "across, beyond or through; on the far side of something",
    /* owner, 8 Oct 2026: the served copy said "a heterosexual person"; it keeps its everyday sense */
    straight: "going in one direction without a bend, curve or turn",
    /* served to children already under this gloss; the LIBRARY copy still said
       "affectionate play (or foreplay without contact with the genital organs)".
       One word must not be repaired in one bank and deleted from the other. */
    fondling: "stroking or handling something gently and affectionately",
    dike: "a long wall or bank built to hold back water and stop flooding",
    dikes: "long walls or banks built to hold back water and stop flooding",
    paddy: "a flooded field where rice is grown",
    paddies: "flooded fields where rice is grown",
    pouf: "a soft padded footstool or low cushioned seat with no back or arms",
    poufs: "soft padded footstools or low cushioned seats with no back or arms",
    queer: "strange, odd or curious; not what you would expect",
    mongrel: "a dog of mixed or unknown breed",
    mickey: "to take the mickey is to tease someone or make fun of them",
    mickeys: "playful teasing; taking the mickey out of someone",
    hillbilly: "an old informal word for someone living in a remote mountain area",
    hillbillies: "an old informal word for people living in remote mountain areas",
    colored: "having colour, or having been given colour with dye or paint",
    coloreds: "clothes or laundry that have colour, washed apart from the whites",
    butch: "a short, tough haircut cropped close to the head",
    oriental: "an old word for things from East Asia; the modern word is Asian",
    jerry: "a chamber pot; also a British nickname for a jerry can",
    jerries: "chamber pots; also jerry cans for carrying fuel or water",
    kraut: "pickled shredded cabbage, short for sauerkraut",
    krauts: "pickled shredded cabbage, short for sauerkraut",
    mammy: "an old childish word for mother, used in some dialects",
    mammies: "an old childish word for mothers, used in some dialects",
    gyp: "a short form of gypsum, the soft mineral used to make plaster",
    spick: "spick and span means perfectly clean and tidy",
    nance: "a surname; also an old dialect word for a fussy manner",

  constructor: 'a person or company that builds something, especially one who puts up buildings',
  shrimp: 'a small shellfish with a long tail, eaten as food',
  shrimps: 'small shellfish with long tails, eaten as food',
  peewee: 'someone or something unusually small',
  peewees: 'people or things that are unusually small',
  ragtag: 'untidy and made up of an odd mixture of things',
  ragtags: 'untidy groups made up of an odd mixture of people',
  riffraff: 'a disorderly crowd of people',
  runt: 'the smallest and weakest animal in a litter',
  runts: 'the smallest and weakest animals in a litter',
  madhouse: 'a place full of noise and wild confusion',
  madhouses: 'places full of noise and wild confusion',
  nuthouse: 'a scene of complete uproar and confusion',
  nuthouses: 'scenes of complete uproar and confusion',
  /* retard / retards were repaired here under their verb sense until 4 Oct 2026, when the owner
     had them deleted (CORE_STRIKE, above) — a repair written for a struck word is dead code. */
  /* the bank glosses this as sexual violence; the everyday sense is the only
     one a child needs, and repairing it keeps a real word in the library */
  ravishing: 'delightfully beautiful; lovely enough to take your breath away',
  /* ---- KEPT AND REWRITTEN, the owner's call, 4 Oct 2026 ----
     Real words a speller meets, glossed by the generator in clinical or contemptuous terms
     ("an abnormal absorption with the self", "a person who does not acknowledge your god", "an
     insane person"). Plain, accurate, kind; no clinical stigma; the mainstream dictionary sense.
     The served shards carry the same text at rest (and words-patch.js's DEF holds it there), so
     the word card says the same thing whichever bank answers. tests/struck-words.cjs holds it. */
  autism: 'a lifelong developmental difference that affects how a person communicates and experiences the world',
  autistic: 'having a lifelong developmental difference that affects how a person communicates and experiences the world',
  schizophrenia: 'a serious long-term mental illness that can change how a person thinks, feels and sees what is real',
  schizophrenic: 'a person who lives with a serious long-term mental illness that can change how they think, feel and see what is real',
  heathen: 'an old word, often used unkindly, for someone who does not follow a widely held religion, as seen by people who do',
  heathens: 'an old word, often used unkindly, for people who do not follow a widely held religion, as seen by people who do',
  infidel: 'an old word, often used unkindly, for someone who does not follow a particular religion, usually the speaker’s own',
  infidels: 'an old word, often used unkindly, for people who do not follow a particular religion, usually the speaker’s own',
  lunatic: 'an informal and often unkind word for someone who behaves in a wild, foolish or reckless way',
  lunatics: 'an informal and often unkind word for people who behave in a wild, foolish or reckless way',
  maniac: 'an informal and often unkind word for someone who behaves in a wild or reckless way; also someone who is extremely keen on something',
  insane: 'wildly foolish or unreasonable (an informal use); it is unkind when used to describe a person who is ill',
  pygmy: 'a kind of animal or plant that is much smaller than the usual kind',
  dumb: 'not able to speak (an old meaning, now considered offensive); in everyday talk, it also means foolish',
  hysteria: 'wild, uncontrollable fear or excitement, often spreading through a crowd',
  hysterical: 'overcome by wild, uncontrollable feeling such as fear or excitement; informally, also extremely funny',
  /* the same decision, applied to the forms the first pass left: a word that names a person by a
     condition says "a person who has …", and a word used unkindly says so */
  dumbness: 'the state of not being able to speak (an old meaning, now considered offensive); in everyday talk, it also means foolishness',
  madman: 'an informal and often unkind word for a man who behaves in a wild or reckless way',
  madmen: 'an informal and often unkind word for men who behave in a wild or reckless way',
  maniacs: 'an informal and often unkind word for people who behave in a wild or reckless way; also people who are extremely keen on something',
  lunacy: 'wild foolishness; an old word for madness, from a belief that the moon could affect people’s minds',
  bedlamite: 'an old, unkind word for a person thought to be mad; it comes from the name of a London hospital for people with mental illness',
  gentile: 'a person who is not Jewish',
  gentiles: 'people who are not Jewish',
  psychotic: 'a person who has psychosis, an illness that can make it hard to tell what is real from what is not',
  paranoid: 'a person who has paranoia, a condition that makes someone feel, without good reason, that others want to harm them',
  paranoiac: 'a person who has paranoia, a condition that makes someone feel, without good reason, that others want to harm them',
  leper: 'a person who has leprosy; the word is now considered hurtful, and “a person with leprosy” is preferred',
  lepers: 'people who have leprosy; the word is now considered hurtful, and “people with leprosy” is preferred',
  lazar: 'an old word for a person who has leprosy',
  arthritic: 'a person who has arthritis, a condition that makes the joints painful and stiff',
  paretic: 'a person who has paresis, a weakness or partial loss of movement in part of the body',
  igloo: 'a dome-shaped shelter built from blocks of snow, traditionally by the Inuit',
  tupek: 'tent that is an Inuit summer dwelling',
  tupik: 'tent that is an Inuit summer dwelling',
  /* glossed "like a coquette" — a struck word — so the meaning went with it */
  flirtatious: 'behaving in a playful way that shows you like someone'
};
/* ---- slurs ----
   SB_UNSAFE_RE is a list of specific strings, so it caught 22 of the 210 entries
   whose OWN definition identifies them as an offensive term — it had no entry
   for boche, kraut, jap, mick, paddy, fag, dyke, redskin, coolie, caffre and 166
   more, all of which were reachable as spelling words for a child of eight.
   Matching on what the data SAYS ABOUT ITSELF catches the whole class instead of
   playing whack-a-mole with a word list, and keeps catching new ones. Words that
   merely MENTION offence in passing — affront, euphemism, rude, obnoxious — are
   untouched, because the pattern requires the definition to call the headword
   itself a term/word/slang/epithet/slur.

   THE NOUN MUST BE ALLOWED ITS PLURAL. The first cut of this pattern required a
   singular ("offensive term"), and the generated glosses are written almost
   entirely in the plural — "offensive terms for", "disparaging terms for",
   "(slang) offensive names for". It matched 210 records and missed 35 more,
   among them motherfucker, assholes, honky, whitey and Zionazi, all of which a
   child could still be asked to spell. Adding the plurals and a few further
   markers (pejorative, racist, obscene, taboo) takes it to 245. When adding a
   marker, add its plural in the same edit. */
const SLUR_DEF = /\b(offensive|derogatory|disparaging|pejorative|vulgar|contemptuous|insulting|racist|racial|ethnic|obscene|taboo)\b[^.]{0,40}\b(terms?|words?|names?|slang|epithets?|slurs?|expression|reference)\b/i;
/* Words the pattern catches whose definitions merely DESCRIBE offence rather
   than commit it: improperation and insultment are archaic words FOR insulting,
   nefandous means unspeakably wicked, multiracialize is about racial identity.
   Each is a real word with a real meaning, so each is named here rather than
   losing the whole class by weakening the pattern. */
const SLUR_OK = new Set(['improperation','insultment','nefandous','multiracialize',
  'affront','euphemism','rude','obnoxious','innuendo']);
/* ROMAN NUMERALS ARE NOT WORDS TO SPELL. The bank carries xiv, xxii, lxx and
   thirteen more as headwords, glossed "the cardinal number that is the sum of
   thirteen and one". They are short and rated band 1, so they surfaced near the
   FRONT of easy word lists, and "x-i-v" teaches a speller nothing.
   The test is deliberately the SHAPE *and* the definition, never the shape
   alone: `mix` reads as M-IX, `dix` as D-IX (it is the reformer Dorothea Dix)
   and `cli` as C-L-I (the command-line interface). All three are real headwords
   with real meanings, and a shape-only rule would delete all three. */
const ROMAN_SHAPE = /^(?=[mdclxvi]{2,})m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
function ROMAN_NUM(k, d){
  const g = String(d||'');
  return ROMAN_SHAPE.test(k) && (/^the cardinal number that is\b/i.test(g)
                              || /^being\s+\w+\s+more than\s+\w+/i.test(g));
}
function fixCore(v){ try{
    const out = [];
    for(const r of v){
      if(!r || !r.w) continue;
      const k = String(r.w).toLowerCase();
      if(CORE_STRIKE.has(k) || CORE_CUT.has(k)) continue;
      /* repair first, then judge — a record whose gloss we have replaced is
         judged on the replacement, not on the sense we just removed */
      if(Object.prototype.hasOwnProperty.call(CORE_FIX, k)) r.d = CORE_FIX[k];
      if(r.d && !SLUR_OK.has(k) && SLUR_DEF.test(r.d)) continue;
      if(ROMAN_NUM(k, r.d)) continue;
      /* a sentence that hurts someone for a disability, their mental health, their ethnicity or their body
         goes, the word stays (the 4.5 brief, P0.11): the list is kid-safe.js's, the served shards were
         cleaned at rest by tools/stigma-fix.cjs, and this 45 MB library is cleaned here as it loads */
      if(r.s && window.SB_KID_SAFE && SB_KID_SAFE.stigmaHit && SB_KID_SAFE.stigmaHit(r.s)) delete r.s;
      out.push(r);
    }
    return out; }catch(e){ return v; } }
function mergeHard(){ try{
    const H=window.SB_HARD; if(!Array.isArray(H)||!H.length) return;
    if(!Array.isArray(window.SB_FULL)) return;
    if(window.SB_FULL._hard) return;                 // already in
    const n=hardInto(window.SB_FULL, H);
    try{ Object.defineProperty(window.SB_FULL,'_hard',{value:n,enumerable:false}); }catch(e){}
    _wdb=null; }catch(e){} }
/* The championship shard onto a library array, ONE rule for both ways in (the whole library and a lettered
   chunk — P1.12): a shard word the array already has is skipped, the rest go through safeWord AND fixCore.
   THE SHARD GOES THROUGH fixCore TOO. It ran safeWord alone, so the 1,915 championship words bypassed
   CORE_STRIKE and CORE_FIX entirely — the guard caught `balisong` (a butterfly KNIFE, sanitised in its own
   gloss as a "folding pocket tool") re-entering the library after fixCore had struck it. A strike list that
   covers one of two merge paths is not a strike list; this is the same fault as the block list that covered
   one of three entry points. */
function hardInto(arr, H){
  const seen=new Set(arr.map(r=>String(r&&r.w||'').toLowerCase()));
  let add=(H||[]).filter(r=>{ const k=String(r&&r.w||'').toLowerCase();
    return k && !seen.has(k) && safeWord(r); });
  try{ add=fixCore(add); }catch(e){}
  let n=0; for(const r of add){ const k=String(r&&r.w||'').toLowerCase();
    if(!k||seen.has(k)) continue; seen.add(k); arr.push(r); n++; }
  return n; }
/* what a child may see of a list of RAW library records: safeWord, then fixCore (strikes, repairs, stigma) */
function fullClean(v){ try{ v=v.filter(safeWord); }catch(e){} try{ v=fixCore(v); }catch(e){} return v; }
function fullWords(){ try{
    if(Array.isArray(window.SB_FULL)){ mergeHard(); return window.SB_FULL; }
    if(typeof window.SB_FULL!=='string' || !window.SB_FULL) return null;
    const v=JSON.parse(window.SB_FULL);
    if(!Array.isArray(v)) return null;
    return fullAdopt(v); }catch(e){ return null; } }
/* the whole library becomes SB_FULL: cleaned, then the shard merged (once — mergeHard stamps `_hard`) */
function fullAdopt(v){ v=fullClean(v); window.SB_FULL=v; _wdb=null; mergeHard(); return v; }
/* THE 130k LIBRARY IS LETTERED CHUNKS (road to 4.5, P1.12). words-full.js (45 MB) and words-hard.js stay the
   source in the repo and are never fetched: tools/library-chunks.cjs cuts them into words-full/ (an index and 86
   chunks of ≤ ~200 KB gz) and library.js (SB_LIB, lazy group `library`) is their one reader. A LOOKUP — the Word
   Finder, the header search — fetches only the chunk its letters fall in (fullFor); the WHOLE library (the Whole
   Hive list, the Ultra road, Champ Dictation, "Load the whole library") is every chunk, rebuilt by SB_LIB.all in
   words-full.js's own order, so nothing that ranks by that order moves. Both go through fullClean + hardInto. */
function loadFullLibrary(then){ if(window.SB_FULL){ fullWords(); _fullState='loaded'; state.fullLoaded=true; if(then) then(); return; }
  if(_fullState==='loading') return; _fullState='loading'; state.fullLoading=true; render();
  const fail=()=>{ _fullState='error'; state.fullLoading=false; render(); flash('Couldn’t load the word library — try again in a moment'); };
  lazyNeed('library',()=>{ if(!window.SB_LIB){ fail(); return; }
    SB_LIB.all((core,hard)=>{ if(!core){ fail(); return; }
      _fullState='loaded'; state.fullLoading=false; state.fullLoaded=true;
      window.SB_HARD=hard; fullAdopt(core.slice());     // cleaned, the shard merged; SB_LIB keeps its own raw copy
      _wdb=null;
      if(then) then(); render(); flash('Full library ready — '+countTxt('library')+' words 📚'); }); }); }
/* A lookup's share of the library: the records a child may see from the chunk(s) q falls in, or null while
   they load (asked for here, once; boot-lazy re-renders when they land). Null too once the whole library is in —
   the caller reads SB_FULL then. Each chunk is cleaned once and kept. */
const _fullCk={};
function fullChunk(n){ if(_fullCk[n]) return _fullCk[n];
  const p=window.SB_LIB&&SB_LIB.part(n); if(!p) return null;
  const v=fullClean(p.core.slice()); hardInto(v, p.hard);
  return (_fullCk[n]=v); }
function fullFor(q){ if(Array.isArray(window.SB_FULL)) return null;
  q=nkey(q||''); if(q.length<2) return null;
  if(!window.SB_LIB){ lazyNeed('library'); return null; }
  /* the chunk's own callback redraws at once — boot-lazy's softRender would wait out its 140 ms window */
  const hit=SB_LIB.forKey(q,()=>{ try{ if(state.nav==='finder'||state.hq) render(); }catch(e){} }); if(!hit) return null;
  let out=[]; for(const n of hit.names){ const v=fullChunk(n); if(v) out=out.concat(v); }
  return out; }
/* ---- Word Finder: search the whole library, open a learn card, add to lists ---- */
function finderResults(q){ q=nkey((q||'').trim()); if(q.length<2) return [];
  const seen=new Set(); const exact=[],starts=[],contains=[];
  const scan=(pool)=>{ for(const r of pool){ if(!r||!r.w) continue; const k=nkey(r.w); if(seen.has(k)) continue;
      if(k===q){ seen.add(k); exact.push(r); }
      else if(k.startsWith(q)){ if(starts.length<40){ seen.add(k); starts.push(r); } }
      else if(starts.length<8 && contains.length<12 && k.includes(q)){ seen.add(k); contains.push(r); } } };
  scan((window.SB_DATA&&SB_DATA.nsf)||[]); if(window.SB_FULL) scan(window.SB_FULL); else scan(fullFor(q)||[]);   /* a lookup fetches only its letter's chunk (P1.12) */
  return exact.concat(starts,contains).slice(0,24); }
/* Header autocomplete. finderResults() is exhaustive by design — it sweeps both pools to
   rank exact / prefix / substring hits — and that is fine on the Finder page, where a
   render costs one screen. The header input is on EVERY screen and re-renders the whole
   app per keystroke, so this one stops the moment it has enough: prefix hits first, and
   only if there is room does it look for substrings. */
function suggestWords(q, n){ q=nkey((q||'').trim()); n=n||7; if(q.length<2) return [];
  const seen=new Set(), exact=[], starts=[], contains=[];
  const pools=[(window.SB_DATA&&SB_DATA.nsf)||[], window.SB_FULL||(q.length>=3&&fullFor(q))||[]];   /* the library by letter from the third letter (P1.12) */
  for(const pool of pools){
    for(let i=0;i<pool.length;i++){ const r=pool[i]; if(!r||!r.w) continue;
      const k=nkey(r.w); if(seen.has(k)) continue;
      if(k===q){ seen.add(k); exact.push(r); }
      else if(k.startsWith(q)){ seen.add(k); starts.push(r); if(exact.length+starts.length>=n) return exact.concat(starts).slice(0,n); }
      else if(contains.length<n && k.indexOf(q)>0){ seen.add(k); contains.push(r); } }
  }
  return exact.concat(starts, contains).slice(0,n); }
/* ---- The header search finds PLACES too (audit v4 C4) ----
   It returned dictionary words only: "meadow" found a gloss for hay, and "grand prix", "roman
   forum" and "quotes" found nothing. A place is an Atlas region or stop, an arcade game, a
   concept chapter or a Library tool, and its row opens it through the SAME opener a tap uses —
   the tile's own act and arg, or the route's (#/atlas/…, #/stop/…, #/concepts/…) — so a locked
   stop, a plan lock or the grown-up PIN stands exactly as it does for the tap. Keys, not
   positions, go in the row: the index is rebuilt when the Atlas or the concept course lands,
   and a row drawn before that must still open the place it names.
   It runs per keystroke beside suggestWords, so the index (~400 short titles) is built once
   from live data and matching is one word-prefix test per title. */
const LIB_DOORS=[['Concepts','setNav','concepts'],['Theme Journeys','setNav','themes'],['Vocabulary','openVocab',''],
  ['Idioms & Similes','setNav','figurative'],['Bizzing Trivia','openTrivTrain',''],['The Sound Alphabet','openIpaTrain',''],
  ['Typing Trainer','openTyping',''],['Quotes & Poems','openQuotes','']];   // the Library's tiles, act for act (viewExplore)
const placeKey=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
let _placeIdx=null, _medalNames=null;
function placeIndex(){ if(_placeIdx) return _placeIdx;
  const P=[], seen=new Set(); const add=(kind,t,go,sec)=>{ const k=placeKey(t); if(!k||seen.has(k)) return; seen.add(k); P.push({kind,t,k,go,rank:P.length,sec:!!sec}); };
  try{ const T=window.SB_TRAIL;
    if(T&&T.honey){ (T.honey.acts||[]).forEach(a=>add('Word Atlas region',String(a.title||'').replace(/^Act [IVXLC]+\s*·\s*/,''),'r|honey|'+a.id)); } }catch(e){}
  LIB_DOORS.forEach(([t,a,g])=>add('Library',t,'a|'+a+'|'+g));
  /* the Play tab's own cards (SB_PLAY_CARDS), each through its card's door — a card still "coming" is not a place yet */
  try{ playCardsShown().forEach(o=>{ if(playCardLive(o)) add('Arcade game',playCardName(o.k),'a|playCard|'+o.k); }); }catch(e){}
  try{ const T=window.SB_TRAIL;
    if(T&&T.honey){ (T.honey.units||[]).forEach(u=>{ const raw=String(u.title||''); const cut=raw.indexOf(' — '); add('Word Atlas stop',cut>0?raw.slice(0,cut):raw,'u|'+u.id); }); } }catch(e){}
  try{ const ch=((window.SB_CONCEPTS||{}).chapters||[]).concat(((window.SB_ADV_CONCEPTS||{}).chapters||[]));   // state.conceptData's order — the route's index
    ch.forEach((x,i)=>{ if(x&&x.title) add('Concept chapter',x.title,'c|'+i); });
    /* WHAT IS INSIDE A CHAPTER, AND THE MEDALS (road to 4.5, P3.27). A chapter's cards are its contents ("Find the
       beats", "Two faces of c"); a heading three or more chapters share ("The Root", "The Core") names no one place and
       is left out. A row opens its CHAPTER through the chapter's own route, so its lock holds; a medal opens the Medals
       shelf through the drawer's row. Both are SECOND to every place above (sec): a search that found a place still
       finds it first, and these fill the rows a place did not. */
    const many={}; ch.forEach(x=>((x&&x.cards)||[]).forEach(k=>{ const q=placeKey(k&&k.title); if(q) many[q]=(many[q]||0)+1; }));
    ch.forEach((x,i)=>{ if(!x||!x.title) return; const short=String(x.title).split(' — ')[0];
      (x.cards||[]).forEach(k=>{ if(k&&k.title&&many[placeKey(k.title)]<=2) add('In the chapter '+short,k.title,'c|'+i,1); }); }); }catch(e){}
  try{ (_medalNames||(_medalNames=badgeDefs().map(b=>String(b.name||'')).filter(Boolean))).forEach(n=>add('Medal',n,'a|drawer|medals',1)); }catch(e){}
  if(window.SB_TRAIL) _placeIdx=P;   // keep rebuilding until the Atlas is in
  return P; }
try{ window.addEventListener('sb-lazy',e=>{ if(/^(trail|concepts|advConcepts)$/.test(e&&e.detail)) _placeIdx=null; }); }catch(e){}
function suggestPlaces(q, n){ q=placeKey(q); n=n||3; if(q.length<3) return [];
  const out=[];
  for(const p of placeIndex()){ const i=(' '+p.k).indexOf(' '+q); if(i<0) continue;
    out.push({place:p.go, w:p.t, d:p.kind, s:(p.sec?3e4:0)+(p.k===q?0:(i===0?1:2))*1e4+p.rank}); }
  return out.sort((a,b)=>a.s-b.s).slice(0,n); }
/* The bar's list: an exact word first, then up to three places, then the other words — seven rows. */
function headerSuggest(q){ const pl=suggestPlaces(q,3); const ws=suggestWords(q,7-pl.length);
  const k=nkey((q||'').trim()); const ex=ws.filter(r=>nkey(r.w)===k);
  return ex.concat(pl, ws.filter(r=>nkey(r.w)!==k)).slice(0,7); }
/* Open a place by its key, through the opener a tap on it uses. */
function openPlace(key){ const p=String(key||'').split('|');
  if(p[0]==='r'){ lazyNeed('atlas',()=>app.trailAct(p[1]+'|'+p[2])); return; }                 // the pin's act — #/atlas/<crs>/<act>
  if(p[0]==='u'){ lazyNeed('atlas',()=>app.trailUnit(p[1])); return; }                         // #/stop/<id>: the frontier lock holds
  if(p[0]==='c'){ lazyNeed('concepts',()=>{ try{ loadConcepts(); }catch(e){}                   // #/concepts/<i>: a locked chapter goes where a tap sends it
      if(state.conceptData&&state.conceptData[+p[1]]) app.openConcept(+p[1]); else app.setNav('concepts'); }); return; }
  if(p[0]==='a'&&typeof app[p[1]]==='function'){ if(p[2]) app[p[1]](p[2]); else app[p[1]](); } }
/* ---- word DB / coach ---- */
let _wdb = null;
function wordDB(){ if(_wdb) return _wdb; const m=new Map();
  const add=(arr)=>(arr||[]).forEach(r=>{ const k=nkey(r.w); if(k&&!m.has(k)) m.set(k,r); });
  add(SB_DATA.nsf); if(window.SB_FULL) add(window.SB_FULL); add(REVIEW); add(HINDI_WORDS);
  _wdb=m; return m; }
// Pronunciation guide for a single word — used by the Quotes difficult-word popups.
// Prefers the curated SB_PRON dictionary (respelling + syllables + part of speech),
// then falls back to the core word engine. Returns null when nothing is known.
function pronFor(w){ if(!w) return null; const k=nkey(w); if(/\s/.test(k)) return null;
  let e=(window.SB_PRON&&window.SB_PRON[k])||null;
  if(!e){ try{ const hit=wordDB().get(k); if(hit&&(hit.p||hit.sy||hit.ps||hit.o)) e={p:hit.p||'',sy:hit.sy||'',ps:hit.ps||'',o:hit.o||''}; }catch(_){} }
  if(!e) return null;
  const out={p:e.p||'',sy:e.sy||'',ps:e.ps||'',o:e.o||''};
  return (out.p||out.sy||out.ps||out.o)?out:null; }
/* ---- settled picks: the home screen must not rewrite itself ----
   The word library, the quote book and the tip book all arrive in shards after
   boot, and each of the home cards picks deterministically from "everything
   loaded right now". So the first paint picks from a quarter of the data and a
   second later the card silently becomes a different word, a different quote, a
   different tip — the home screen rewriting itself under the child's eyes about
   a second in. That is what reads as the app glitching on load.

   A pick is therefore made once per period and PINNED for that period. It is
   allowed to be drawn from a smaller pool; it is not allowed to change while the
   child is looking at it. The next hour (or the next day) picks again, from
   whatever has landed by then — which by that point is everything. */
const _pinned={};
function settled(key,period,pick){
  const p=_pinned[key];
  if(p&&p.period===period&&p.val!=null) return p.val;
  let val=null; try{ val=pick(); }catch(e){ val=null; }
  if(val==null) return null;          // nothing to pick from yet; try again next render
  _pinned[key]={period,val}; return val;
}
// Word of the hour — a rich, difficult word that rotates every hour, deterministically,
// so every speller on the same hour sees the same gem. Pool = hard, fully-described words.
/* WHAT HOME MAY PUT IN FRONT OF EVERY CHILD (audit v4, B8: 68 raw-gloss defects and
   `schizophrenia` were in this pool). A gloss must pass SB_GLOSS_OK (words-patch.js — no
   "(domain)" label, no "is …" fragment, no WordNet quote marks, no spelling of its own word);
   nothing struck (CORE_STRIKE / CORE_CUT) or held for the owner (SB_WORDS_HELD); no
   capitalised headword; and rarity band `y` 6 or under — the bands above that are dictionary
   tail (abdominoscopy, adscititious) that no eight-year-old's Home should open on. The pool is
   ~700 words, a month of hours. No definition is written here. Guard: tests/struck-words.cjs. */
function wohFit(e){ if(!e||!e.w||!e.d||!e.p) return false; const k=String(e.w).toLowerCase();
  if(/^[A-Z]/.test(e.w)||CORE_STRIKE.has(k)||CORE_CUT.has(k)) return false;
  if((window.SB_WORDS_HELD||[]).indexOf(k)>=0) return false;
  if(typeof window.SB_GLOSS_OK==='function'&&!SB_GLOSS_OK(e.d,e.w)) return false;
  return !(e.y>6); }
let _wohPool=null, _wohBand={};
/* THE WORD OF THE HOUR IS THE CHILD'S BAND'S (the 4.5 brief, P1.6, P1.4): wohPool(b) is the band-b pool — every
   wohFit word (the kid-gloss rule above stays) of five to thirteen letters that kid-safe.js passes for an
   eight-year-old (Home is every child's), in band b exactly: by wordband-data.js once it has landed, and before
   that by each record's own CEILING (SB_BAND.bounds — at most that band whatever the library adds, so never
   above). Home's first screen carries only the boot word tier, which holds no band-4 word at all: a band with
   nothing loaded yet gives null and the tile holds its space (cardHold) until the library lands, never a word
   from another band. wohPool() with no band is the whole old pool (tests/struck-words.cjs reads it). */
/* THE BAND POOL, over a word source (tools/build-curriculum.cjs runs it over the boot tier for the seed below) */
function wohBandPool(src,b,B,on){ const p=[];
  for(const e of src){ if(!e||!e.w||!e.d||!e.p||/[^a-zA-Z]/.test(e.w)) continue; const len=e.w.length; if(len<5||len>13||!wohFit(e)) continue;
    if(window.SB_KID_SAFE&&!SB_KID_SAFE.check(e,8)) continue;
    if((on?B.of(e):B.bounds(e).hi)===b) p.push(e); }
  return p; }
/* THE SEED (road to 4.5, P1.13 step 1). Home's first screen no longer carries the boot word tier, so until it lands the
   word of the hour draws from SB_CURRICULUM.woh: for each band, the pool wohBandPool gives over that tier with the
   bands not yet loaded (each record's own ceiling) — exactly the pool a returning speller's first render drew from —
   in the same order, carrying only what the tile shows (word, meaning, respelling). The same hour picks the same word
   as before, and settled() pins it: the card never rewrites when the shard lands. */
function wohSeed(b){ const C=window.SB_CURRICULUM, S=C&&C.woh&&C.woh[b]; if(!S) return null;
  const m=_wohBand['seed'+b]; if(m) return m.p;
  const p=S.map(r=>({w:r[0],d:r[1],p:r[2],_seed:1})); _wohBand['seed'+b]={k:'seed',p}; return p; }
function wohPool(b){ const src=(window.SB_DATA&&SB_DATA.nsf)||[];
  if(b){ if(!wordsIn()){ const sd=wohSeed(b); if(sd) return sd; }
    const B=window.SB_BAND, on=!!(B&&B.ready&&B.ready()), k=src.length+'|'+on; const m=_wohBand[b];
    if(m&&m.k===k) return m.p; const p=wohBandPool(src,b,B,on);
    _wohBand[b]={k,p}; return p; }
  if(_wohPool) return _wohPool; const out=[];
  for(const e of src){ if(!e||!e.w||!e.d||!e.p||!e.s) continue; if(/[^a-zA-Z]/.test(e.w)) continue;
    const len=e.w.length; if(len<7||len>13) continue;
    // Prefer vetted bee words (bee-probability score) at a challenging-but-real level.
    const good=(e.bp&&e.bp>=60&&e.bp<=97)||(!e.bp&&e.y&&e.y>=3&&e.y<=4); if(good&&wohFit(e)) out.push(e); }
  _wohPool=out.length?out:src.filter(e=>e&&e.w&&e.d&&e.p&&e.w.length>=7&&wohFit(e)); return _wohPool; }
/* the band the hour is picked for: the child's (SB_BAND.child), once the Atlas is on the page — its region sets
   a floor, and a band read before it landed could change under the child's eyes */
function wohBandNow(){ try{ if(window.SB_BAND&&(window.SB_TRAIL||window.SB_TRAIL_HOME)) return SB_BAND.child(active()).band; }catch(e){} return 0; }   /* the road (trail-home-data.js) is a boot script since P1.13 step 3: the floor is known at first paint */
function wordOfHour(){
  const hr=Math.floor(Date.now()/3600000); // hours since epoch — changes every hour
  if(window.SB_BAND){ const b=wohBandNow(); if(!b) return null;
    return settled('woh|'+b,hr,()=>{ const pool=wohPool(b); if(!pool.length) return null;
      const h=((hr*2654435761)>>>0)%pool.length; return pool[h]||pool[0]||null; }); }
  return settled('woh',hr,()=>{ const pool=wohPool(); if(!pool.length) return null;
    const h=((hr*2654435761)>>>0)%pool.length; return pool[h]||pool[0]||null; }); }
// Quote of the hour — same deterministic hourly rotation, a different mixing constant so the
// quote and the word never move in lockstep. Returns the quote plus its index into SB_QUOTES.
function quoteOfHour(){
  const hr=Math.floor(Date.now()/3600000);
  const q=settled('qoh',hr,()=>{ const all=(window.SB_QUOTES||[]); if(!all.length) return null;
    return all[((hr*40503+1013904223)>>>0)%all.length]||null; });
  if(!q) return null;
  /* the pinned quote keeps its identity; its INDEX is resolved against the book
     as it stands now, because the quotes library grows after boot and Quotes is
     opened by index */
  const all=(window.SB_QUOTES||[]);
  let i=all.indexOf(q); if(i<0) i=all.findIndex(x=>x&&x.q===q.q);
  return {q, i:i<0?0:i}; }
/* ---- 🐞 bug reports live in the device bucket of SB_STORE (not on a child) ---- */
function _bugList(){ try{ return SB_STORE.getJSON('bugs',[])||[]; }catch(e){ return []; } }
function _bugSave(list){ try{ SB_STORE.setJSON('bugs', list); }catch(e){} }
/* The bug panel is a TESTING tool (FIX-BEE v2, Q7): it used to ride the edge of every child
   screen as a "BUG?" tab. It now exists only while a grown-up has testing mode on (behind the
   PIN), and Settings → Grown-ups → Testing tools opens it. A child never sees it. */
function bugUI(){
  if(state.screen!=='app' || !state.devUnlock) return '';
  const tab=`<button data-act="bugToggle" class="sb-bug-tab" title="Report a bug or share an idea" aria-label="Report a bug">🐞<span>BUG?</span></button>`;
  if(!state.bugOpen) return tab;
  const cats=[['bug','💥 Something broke'],['looks','🎨 Looks wrong'],['audio','🔊 Audio'],['words','📖 A word or fact'],['idea','💡 An idea']];
  const list=_bugList();
  const rows=list.slice(0,20).map((r,i)=>`<div style="display:flex;gap:9px;align-items:flex-start;padding:9px 0;border-top:1px solid var(--line)">
      <span style="flex:none;font-size:14px">${(cats.find(c2=>c2[0]===r.cat)||['','🐞'])[1].slice(0,2)}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-size:12.5px;line-height:1.5;overflow-wrap:anywhere">${esc(r.txt)}</span>
        <span style="display:block;font-size:10.5px;color:var(--muted);font-weight:700;margin-top:2px">${esc(r.ts)} · ${esc(r.nav)} · v${esc(r.v||'?')}</span></span>
      <button data-act="bugDel" data-arg="${i}" title="Delete this report" style="flex:none;color:var(--muted);font-weight:800;font-size:13px">✕</button></div>`).join('');
  return tab+`<div data-act="bugToggle" style="position:fixed;inset:0;z-index:128;background:rgba(10,8,20,.45)"></div>
    <aside class="sb-bug-panel" role="dialog" aria-label="Report a bug">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
        <span style="font-family:var(--display);font-weight:800;font-size:18px">🐞 Report a bug</span>
        <button data-act="bugToggle" aria-label="Close" style="margin-left:auto;width:34px;height:34px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:900;font-size:15px">✕</button></div>
      <p style="font-size:12px;color:var(--muted);line-height:1.55;margin:0 0 12px">Everything stays <b>on this device</b> — the app never sends anything. Export your reports below and share the file with us yourself.</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${cats.map(([k,l])=>`<button data-act="bugCat" data-arg="${k}" style="padding:7px 12px;border-radius:999px;font-weight:800;font-size:12px;border:1.5px solid ${(state.bugCat||'bug')===k?'var(--accent)':'var(--line)'};background:${(state.bugCat||'bug')===k?'color-mix(in srgb,var(--accent) 14%,transparent)':'var(--surface2)'};color:var(--text)">${l}</button>`).join('')}</div>
      <textarea data-inp="bugType" data-fkey="bugType" placeholder="What happened? What did you expect instead?" style="width:100%;min-height:96px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:11px 13px;font-size:13.5px;line-height:1.55;font-family:inherit;color:var(--text);resize:vertical">${esc(state.bugTxt||'')}</textarea>
      <div style="font-size:10.5px;color:var(--muted);font-weight:600;margin:5px 0 10px">Included automatically: this screen (${esc(String(state.nav||''))}), app version, window size — never a name or age.</div>
      <button data-act="bugSave" style="width:100%;padding:13px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">Save the report</button>
      ${list.length?`<div style="display:flex;align-items:center;gap:8px;margin:16px 0 4px">
          <span style="font-family:var(--display);font-weight:800;font-size:13.5px">Saved on this device · ${list.length}</span>
          <span style="margin-left:auto;display:inline-flex;gap:6px">
            <button data-act="bugCopy" style="padding:7px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:11.5px">📋 Copy</button>
            <button data-act="bugExport" style="padding:7px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:11.5px">💾 Export</button></span></div>
        ${rows}${list.length>20?`<div style="font-size:11px;color:var(--muted);font-weight:700;padding-top:8px">+${list.length-20} older in the export</div>`:''}`
        :'<p style="font-size:12px;color:var(--muted);margin-top:14px">Nothing reported yet — spotted something odd? You are the QA team now. 🕵️</p>'}
    </aside>`;
}
// memoize the heavy origin/tier filters — computed once over the core set, reused every render
let _catStatic=null;
function catStatic(){ if(_catStatic) return _catStatic; const nsf=SB_DATA.nsf||[];
  const byTier=(s)=>nsf.filter(r=>(r.nt||'').includes(s));
  const byOrigin=(kw)=>nsf.filter(r=>(r.o||'').toLowerCase().includes(kw));
  _catStatic={ finals:byTier('North South Finals'), primary:byTier('Primary'), junior:byTier('Junior'), senior:byTier('Senior'), advanced:byTier('Advanced'),
    nsf500:((window.SB_NSF500&&SB_NSF500.words)||[]),
    vocab26:((window.SB_VOCAB26&&SB_VOCAB26.words)||[]),
    likely:nsf.slice().sort((a,b)=>(b.bp||0)-(a.bp||0)),
    hardest:nsf.filter(r=>(r.y||3)>=6),
    trickiest:nsf.filter(r=>trickScore(r)>=20).sort((a,b)=>(trickScore(b)-trickScore(a))||((b.bp||0)-(a.bp||0))),
    latin:byOrigin('latin'), greek:byOrigin('greek'), french:byOrigin('french'), oe:byOrigin('old english'), norse:byOrigin('norse'),
    spanish:byOrigin('spanish'), italian:byOrigin('italian'), german:byOrigin('german'), arabic:byOrigin('arabic'), japanese:byOrigin('japanese'),
    hindi:nsf.filter(r=>/hindi|sanskrit|urdu|tamil|marathi|punjabi/i.test(r.o||'')).concat(HINDI_WORDS),
    eponyms:nsf.filter(r=>(r.t||[]).indexOf('eponyms')>=0) };
  return _catStatic; }
/* the three sound lists rebuild once the 130k library loads in (hardPool pattern) */
let _sndCache=null,_sndFull=false;
function soundLists(){
  const full=(typeof fullWords==='function'&&window.SB_FULL)?fullWords():null; const haveFull=!!(full&&full.length);
  if(_sndCache&&_sndFull===haveFull) return _sndCache;
  _sndFull=haveFull;
  const idx=homIndex(); const AP=window.SB_ALT_PRON||{}; const DI=window.SB_DIACRITICS||{};
  const src=haveFull?((SB_DATA.nsf||[]).concat(full)):((SB_DATA&&SB_DATA.nsf)||[]);
  const seen=new Set(); const hom=[],alt=[],dia=[];
  for(const r of src){ if(!r||!r.w) continue; const k=nkey(r.w); if(seen.has(k)) continue; seen.add(k);
    if(idx[k]) hom.push(r);
    if(_hasOwn(AP,k)) alt.push(r);
    if(_hasOwn(DI,k)) dia.push(r);
    else if(/[^\x00-\x7f]/.test(k)&&diacritic(k)) dia.push(r); }   // words the library spells WITH marks
  const byBee=(a,b)=>((b.bp||0)-(a.bp||0))||(spellDiff(b)-spellDiff(a));
  hom.sort(byBee); alt.sort(byBee); dia.sort(byBee);
  return (_sndCache={hom,alt,dia}); }
/* IPA for EVERY word: derived at runtime from the friendly respelling (the p field), so
   the two notations always agree on the card. Words in SB_IPA carry exact CMU-derived
   IPA and prefer it. The friendly respelling stays — it is the easier one to read. */
const P2IPA=[['eye','aɪ'],['yoo','ju'],['air','ɛr'],['ay','eɪ'],['aw','ɔ'],['ow','aʊ'],['oy','ɔɪ'],['oh','oʊ'],['ah','ɑ'],['eh','ɛ'],['ih','ɪ'],['uh','ə'],['ee','i'],['oo','u'],['uu','ʊ'],['er','ər'],['ar','ɑr'],['or','ɔr'],['ch','tʃ'],['sh','ʃ'],['zh','ʒ'],['th','θ'],['ng','ŋ'],['wh','w'],['a','æ'],['e','ɛ'],['i','ɪ'],['o','ɑ'],['u','ʌ'],['j','dʒ'],['y','j'],['c','k'],['q','k'],['x','ks'],['g','ɡ']];
function pToIPA(p){ if(!p) return ''; let n=0;
  const chunks=String(p).trim().split(/[-·\s]+/).map(ch=>({ raw:ch, low:ch.toLowerCase().replace(/[^a-z']/g,'') }));
  return chunks.map((ch,ci)=>{
    const stressed=/[A-Z]/.test(ch.raw); const low=ch.low;
    const nextFirst=(chunks[ci+1]&&chunks[ci+1].low[0])||'';
    let i=0,s='';
    while(i<low.length){ let hit=null;
      for(const t of P2IPA){ if(low.startsWith(t[0],i)){ hit=t; break; } }
      if(hit&&hit[0]==='y'){ const after=low[i+1]||nextFirst;                 // vowel y: cite = s-y-t
        if(!/[aeiou]/.test(after)) hit=['y','aɪ']; }
      if(hit){ s+=(hit[0]==='uh'&&stressed)?'ʌ':hit[1]; i+=hit[0].length; }
      else { const c2=low[i]; s+=(c2==="'"?'':c2); i++; }
    }
    return (stressed?(n++?'ˌ':'ˈ'):'')+s; }).join(''); }
function ipaOf(w,p){ try{ const M=window.SB_IPA||{}; const k=nkey(w); if(_hasOwn(M,k)) return M[k]; return pToIPA(p); }catch(e){ return ''; } }
function coachCatalog(){
  const S=state; const st=catStatic(); const nsf=SB_DATA.nsf||[]; const snd=soundLists();
  /* grp collapses the catalogue for the picker: members show inside one group card
     (My Words / The Champion Ladder / Word Origins / Tricky Words). Keys unchanged. */
  const cats=[
    { key:'review',     grp:'mine',   label:'Sticky Words',            sub:'The words everyone trips on — curated to untangle', words:REVIEW },
    { key:'scripps',    label:'Words of Champions',      sub:'Every championship-winning word at the national bee, 1925–2026', words:(window.SB_SCRIPPS||[]) },
    { key:'missed',     grp:'mine',   label:'My Comeback Words',       sub:'The ones that got away — win them back', words:((active().missed)||S.missedWords||[]) },
    { key:'likely',     grp:'mine',   label:'Most Wanted Words',       sub:'Ranked by bee-probability score',       words:st.likely },
    { key:'nsf_primary',grp:'ladder', label:'First Flight',            sub:'Your first bee words · primary level',  words:st.primary },
    { key:'nsf_junior', grp:'ladder', label:'Rising Stars',            sub:'Junior-level competition words',        words:st.junior },
    { key:'nsf_senior', grp:'ladder', label:'The Big Leagues',         sub:'Senior-level competition words',        words:st.senior },
    { key:'nsf_advanced',grp:'ladder',label:'Boss Level',              sub:'The hardest competition words there are', words:st.advanced },
    { key:'nsf_finals', grp:'ladder', label:'The Final Round',         sub:'Modeled on the NSF finals word pool',         words:st.finals },
    { key:'nsf500',     label:'The Mighty 500',          sub:'500 high-probability finals words · your 15-day list', words:st.nsf500 },
    { key:'vocab26',    label:'Meaning Masters',         sub:'Practice for the 2026 junior vocabulary final · 1,000 words', words:st.vocab26 },
    { key:'nsf',        label:'The Champion’s Vault',    sub:'17,000-word competition library',       words:nsf },
    { key:'all',        label:'The Whole Hive',          sub:'Every word we know · '+countTxt('library')+' (loads on first use)', words:(window.SB_FULL||nsf) },
    { key:'hardest',    grp:'tricky', label:'Beastly Words',           sub:'Highest-difficulty spellers + championship winners', words:st.hardest.concat(window.SB_SCRIPPS||[]) },
    { key:'trickiest',  grp:'tricky', label:'Sneaky Spellings',        sub:'The sound hides the spelling — pattern words, not just rare ones', words:st.trickiest },
    { key:'latin',      grp:'origins',label:'Latin Legends',           sub:'Words with roots from Latin',           words:st.latin },
    { key:'greek',      grp:'origins',label:'Greek Heroes',            sub:'Words with roots from Greek',           words:st.greek },
    { key:'french',     grp:'origins',label:'French Flair',            sub:'Loanwords from French',                 words:st.french },
    { key:'oe',         grp:'origins',label:'Old English Originals',   sub:'Anglo-Saxon roots',                     words:st.oe },
    { key:'norse',      grp:'origins',label:'Viking Words',            sub:'Old Norse roots',                       words:st.norse },
    { key:'spanish',    grp:'origins',label:'Spanish Treasures',       sub:'Loanwords from Spanish',                words:st.spanish },
    { key:'italian',    grp:'origins',label:'Italian Treasures',       sub:'Loanwords from Italian',                words:st.italian },
    { key:'german',     grp:'origins',label:'German Treasures',        sub:'Loanwords from German',                 words:st.german },
    { key:'arabic',     grp:'origins',label:'Arabic Treasures',        sub:'Loanwords from Arabic',                 words:st.arabic },
    { key:'japanese',   grp:'origins',label:'Japanese Treasures',      sub:'Loanwords from Japanese',               words:st.japanese },
    { key:'hindi',      grp:'origins',label:'Hindi & Sanskrit Treasures', sub:'Indian-language loanwords',          words:st.hindi },
    { key:'eponyms',    grp:'origins',label:'Named After Someone',     sub:'Eponyms clustered by the name’s language — each Level is one cluster',  words:st.eponyms },
    { key:'homophones', grp:'tricky', label:'Sound Twins',             sub:'Homonyms — same sound, different spelling; the meaning decides', words:snd.hom },
    { key:'altpron',    grp:'tricky', label:'Two-Way Words',           sub:'One spelling, two accepted sounds — hear both, spell one', words:snd.alt },
    { key:'diacritics', grp:'tricky', label:'Words in Fancy Dress',    sub:'é, ñ, ç — the marked spellings behind the plain letters', words:snd.dia },
  ].filter(c=>(c.words&&c.words.length) || c.key==='missed');
  /* The advanced journey is a first-class list once the pack is on, so it inherits the
     whole Practice shell. Unshifted to the front so it sits ABOVE the Bizzing Bee
     Journey in every picker; when the pack is off it is not offered at all. */
  /* The Ultra Champions Journey is the Atlas's third continent, not a pile of words
     filed next to Latin Legends. It keeps its list — that is the training ground the
     map opens — but it is no longer offered in the catalogue as a peer of the others. */
  if(S.customWords&&S.customWords.length) cats.push({ key:'custom', label:'My custom list', sub:'Words you pasted in', words:S.customWords });
  try{ const bl=(active().builtLists)||{}; Object.keys(bl).forEach(k=>cats.push({ key:k, label:bl[k].label, sub:'Built with the List Builder', words:builtWords(k) })); }catch(e){}
  if(S.aiWords&&S.aiWords.length) cats.push({ key:'ai', label:(S.aiLabel||'AI smart list'), sub:'Generated by Coach AI', words:S.aiWords });
  return cats.map(c=>({ ...c, count: c.key==='all' ? (window.SB_FULL?window.SB_FULL.length:128040) : (c.words||[]).length }));
}
const coachActiveCat = () => { const c=coachCatalog(); return c.find(x=>x.key===state.coachTargetKey)||c[0]; };
/* Readiness is judged against the WHOLE target list (not just the current stage) —
   for the Journey that means the ~1,620-word Champ ladder, the real bee target. */
const coachPool = () => { const key=activeListKey();
  let w = key==='journey' ? journeySorted().slice(0, champWordCount()) : listFullWords(key);
  if(!(w&&w.length)) w=(coachActiveCat().words||[]);
  return w.slice(); };
function recordCoach(word,ok){ const srs={...(state.coachSrs||{})}; const k=nkey(word);
  const r={ seen:0,correct:0,wrong:0,box:0, ...(srs[k]||{}) };
  r.seen++; if(ok){ r.correct++; r.box=Math.min(5,r.box+1); } else { r.wrong++; r.box=1; } srs[k]=r;
  const today=new Date().toISOString().slice(0,10); const hist={...(state.coachHistory||{})}; hist[today]=(hist[today]||0)+1;
  state.coachSrs=srs; state.coachHistory=hist; }
/* ---- Bee Band: one ability estimate adjudicated across every graded activity.
   Evidence is weighted by how honest a test it is (typed word = 1, multiple-choice = 0.5,
   Origin Detective = 0 — it doesn't measure spelling). The Band promotes the moment the
   evidence is there and demotes only on a sustained slide; below ~30 weighted attempts
   it reports "calibrating" and leans on the placement-test seed. ---- */
const BAND_MIN_EV=30, BAND_WIN=30, BAND_UP=0.8, BAND_DOWN=0.65;
function bandOfWord(w){ if(!w) return 3; if(typeof w==='string'){ const x=wordIndex()[nkey(w)]; return (x&&x.y)||3; } return w.y||3; }
function logBand(w, ok, wt){ try{ wt=(wt==null)?1:wt; if(!wt) return; const c=active(); if(!c||!w) return;
  const b=Math.max(1,Math.min(9,bandOfWord(w)));
  (c.attempts=c.attempts||[]).push({b, ok:ok?1:0, wt});
  if(c.attempts.length>600) c.attempts=c.attempts.slice(-480);
  const ra=realAcc(c); if(ra!=null) c.acc=ra;      // honest accuracy: measured, not massaged
  if(ok) goalBump();                                // every real correct answer counts toward today's goal — practice, games, quests
  _bandUpdate(c); }catch(e){} }
/* real accuracy: weighted % over the last 120 graded attempts (null until 5 attempts of evidence) */
function realAcc(c){ c=c||active(); const at=(c.attempts||[]).slice(-120); const W=at.reduce((s,a)=>s+a.wt,0);
  if(W<5) return null; return Math.round(at.reduce((s,a)=>s+a.ok*a.wt,0)/W*100); }
/* ================= Daily targets: app time · practice time · words =================
   Three numbers the speller sets for themselves, each measured per day and kept for 120
   days so Progress can chart them. Time is stored in SECONDS, targets in MINUTES.
   "Practice time" deliberately means words only — the clock stops in the Arcade, the saga,
   trivia and every other feature, so the number can't be inflated by playing games. */
const TGT_DEF={app:30, prac:15};                       // minutes/day out of the box
const PRACTICE_NAVS=['coach','train','levelup','revisions','today'];
/* A DRILL THAT CAME FROM A STOP BELONGS TO THE ATLAS, NOT TO PRACTICE.
   startTrain sets nav:'train', and both nav bars counted 'train' as the Practice
   tab — so walking a stop on the Word Atlas visibly threw the child into another
   tab mid-journey, and the only way back was the Exit pill. state.trailReturn
   already records that a session came from a stop, so it is the whole test: the
   Atlas keeps its tab lit and the drill stays inside the journey it belongs to.
   Both bars read this, so they cannot disagree about which tab is on. */
const atlasDrill=()=>state.nav==='train'&&!!state.trailReturn;
function targets(c){ c=c||active(); c.tgt=c.tgt||{};
  return { app:Math.max(1, c.tgt.app||TGT_DEF.app), prac:Math.max(1, c.tgt.prac||TGT_DEF.prac),
           words:Math.max(1, c.goal||state.draft.goal||10) }; }
function dayLog(c,key){ c=c||active(); if(!c) return {app:0,prac:0,words:0};
  c.dayLog=c.dayLog||{}; const k=key||todayKey();
  if(!c.dayLog[k]) c.dayLog[k]={app:0,prac:0,words:0};
  const d=c.dayLog[k]; if(d.app==null)d.app=0; if(d.prac==null)d.prac=0; if(d.words==null)d.words=0;
  return d; }
function dayLogTrim(c){ try{ const ks=Object.keys(c.dayLog||{}); if(ks.length>140){
  ks.sort(); ks.slice(0,ks.length-120).forEach(k=>{ delete c.dayLog[k]; }); } }catch(e){} }
/* Is the speller practising WORDS right now? Games and the rest of the app don't count. */
function inPracticeNow(){ try{ if(state.screen!=='app') return false;
  if(state.settingsOpen||state.pinDlg||state.showTiers) return false;
  return PRACTICE_NAVS.indexOf(state.nav)>=0; }catch(e){ return false; } }
/* The clock. Ticks only while the tab is actually being looked at, so a forgotten tab
   left open overnight doesn't invent hours of "app time". */
const METRIC_TICK=15;
function metricTick(){ try{
  if(typeof document!=='undefined' && document.visibilityState!=='visible') return;
  const c=active(); if(!c) return;
  if(state.screen!=='app' && state.screen!=='onboard') return;
  const d=dayLog(c); d.app+=METRIC_TICK; if(inPracticeNow()) d.prac+=METRIC_TICK;
  dayLogTrim(c);
  if(state._metricSaveT) return;                       // batch the writes: one save per minute
  state._metricSaveT=setTimeout(()=>{ state._metricSaveT=null; try{ save(); }catch(e){} }, 60000);
}catch(e){} }
function todayMetrics(c){ c=c||active(); const d=dayLog(c); const t=targets(c);
  return { app:d.app||0, prac:d.prac||0, words:goalToday(),
           tApp:t.app*60, tPrac:t.prac*60, tWords:t.words,
           pApp:(d.app||0)/(t.app*60), pPrac:(d.prac||0)/(t.prac*60), pWords:goalToday()/t.words }; }
/* Three nested rings, Apple-Watch style: no numbers inside, and going past the target draws
   a second lap in a brighter shade rather than stopping at full. */
const RING_COL=[['#E8458C','#FF8FC0'],['#2FA35C','#6FD48F'],['#3D7DF0','#8FB6FF']];
function ringsSVG(size,vals){ size=size||104;
  const cx=60, cy=60, R=[52,39,26], W=13;
  let out='<svg viewBox="0 0 120 120" width="'+size+'" height="'+size+'" aria-hidden="true" style="display:block;transform:rotate(-90deg)">';
  vals.forEach((v,i)=>{ const r=R[i], C=2*Math.PI*r, pct=Math.max(0,v||0);
    const base=Math.min(1,pct), over=Math.max(0,Math.min(1,pct-1));
    const col=RING_COL[i][0], lite=RING_COL[i][1];
    out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-opacity=".18" stroke-width="'+W+'"/>';
    if(base>0) out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+col+'" stroke-width="'+W+'" stroke-linecap="round" stroke-dasharray="'+(C*base).toFixed(2)+' '+C.toFixed(2)+'"/>';
    if(over>0) out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="none" stroke="'+lite+'" stroke-width="'+(W-4)+'" stroke-linecap="round" stroke-dasharray="'+(C*over).toFixed(2)+' '+C.toFixed(2)+'"/>';
  });
  return out+'</svg>'; }
function fmtMins(sec){ sec=Math.max(0,Math.round(sec||0)); const m=Math.floor(sec/60);
  if(m<60) return m+'m'; return Math.floor(m/60)+'h '+(m%60)+'m'; }
/* daily goal: per-child, resets each day automatically */
function goalState(c){ c=c||active(); const t=todayKey(); if(!c.goalD||c.goalD.d!==t) c.goalD={d:t,n:0}; return c.goalD; }
function goalToday(){ try{ return goalState().n||0; }catch(e){ return 0; } }
function goalBump(){ try{ const g=goalState(); g.n=(g.n||0)+1; state.goalDone=g.n;
  const c=active(); if(c){ dayLog(c).words=g.n; }                    // keep the 30-day history in step
}catch(e){} }
function _bandAcc(c,b){ const at=(c.attempts||[]).filter(a=>a.b===b).slice(-BAND_WIN);
  const W=at.reduce((s,a)=>s+a.wt,0); return { w:W, acc:W?at.reduce((s,a)=>s+a.ok*a.wt,0)/W:0 }; }
function bandEvidence(c){ return (c.attempts||[]).reduce((s,a)=>s+a.wt,0); }
function _bandUpdate(c){ if(bandEvidence(c)<BAND_MIN_EV) return;
  let cur=c.band||c.bandSeed||2; let raw=0;
  for(let b=1;b<=9;b++){ const s=_bandAcc(c,b); if(s.w>=8 && s.acc>=BAND_UP) raw=b; }
  if(raw>cur) cur=raw; /* climb fast: proof promotes immediately */
  else { const s=_bandAcc(c,cur); if(s.w>=12 && s.acc<BAND_DOWN) cur=Math.max(1,cur-1); } /* fall slow: one bad game never demotes */
  const was=c.band||0;
  if(cur>was && was>0){ try{ state.toast='📈 Word difficulty '+cur+' — '+bandTier(cur)+'! Proven on level '+cur+' words.'; scheduleToast(3600); sfx('win'); burstConfetti(120); }catch(e){} }
  c.band=cur; }
function bandTier(b){ return b<=2?'Classroom Speller':b<=4?'School-Bee Ready':b<=6?'Regional Ready':b<=8?'State & National':'Championship'; }
/* The Bee Band is YOUR SPELLING LEVEL, and it is now the only ladder a child is shown.
   It used to sit in the header as "Word difficulty 3" beside a second pill reading
   "Level 1 · Egg", and a third quantity called Karma that nothing read — three numbers
   for what a child experiences as one question: how good am I, and how do I get better?
   One named stage per band, each saying plainly what a speller at that stage can do. */
const BAND_STAGE=[null,
  {n:'Egg',       s:'Beginner speller',  d:'Everyday words, spelled the way they sound.'},
  {n:'Hatchling', s:'Finding your feet', d:'Common words, and the first letters you cannot hear.'},
  {n:'Forager',   s:'Building patterns', d:'Double letters and suffix endings start to appear.'},
  {n:'Worker',    s:'School-bee ready',  d:'Where a word comes from starts to decide how it is spelled.'},
  {n:'Scout',     s:'Reading origins',   d:'French and Greek patterns, recognised on sight.'},
  {n:'Ranger',    s:'Regional ready',    d:'Roots and prefixes that hold their spelling at the joins.'},
  {n:'Guardian',  s:'State level',       d:'Loanwords from many languages, and the schwa everywhere.'},
  {n:'Champion',  s:'National level',    d:'Rare words, long builds, multi-part questions.'},
  {n:'Legend',    s:'Championship',      d:'Words chosen to defeat every rule you know.'}];
const bandStage=(b)=>BAND_STAGE[Math.max(1,Math.min(9,b|0))]||BAND_STAGE[1];
function beeBand(c){ c=c||active(); const band=Math.max(1,Math.min(9,c.band||c.bandSeed||2));
  const cal=bandEvidence(c)<BAND_MIN_EV && !c.bandSeed; /* a placement result IS evidence — never call it calibrating */
  const s=_bandAcc(c,band);
  return { band, tier:bandTier(band), calibrating:cal, acc:Math.round((s.acc||0)*100), n:s.w }; }
/* AGE IS A RANGE, NOT A NUMBER. We ask a child for a band, never their birthday-exact
   age: it is less to hold about a real child, and nothing in the app needed the precision
   — every reader (ttBand, diffRange, ageMode, the tips engine) buckets it anyway. `c.age`
   is still written, as the band's MIDPOINT, so all eight of those readers keep working
   untouched; `c.ageBand` is the value of record. Legacy profiles carry a bare `c.age` and
   are read through bandForAge. */
const AGE_BANDS=[
  {k:'5-7',   lo:5,  hi:7,  mid:6,  n:'5\u20137',   sub:'just starting'},
  {k:'8-10',  lo:8,  hi:10, mid:9,  n:'8\u201310',  sub:'school bee age'},
  {k:'11-13', lo:11, hi:13, mid:12, n:'11\u201313', sub:'regional level'},
  {k:'14-18', lo:14, hi:18, mid:16, n:'14\u201318', sub:'national level'},
];
const bandForAge=(a)=>{ a=+a||9; return AGE_BANDS.find(x=>a>=x.lo&&a<=x.hi)||AGE_BANDS[1]; };
const ageBandOf=(c)=>{ c=c||active(); const b=c&&c.ageBand&&AGE_BANDS.find(x=>x.k===c.ageBand);
  return b || bandForAge(c&&c.age); };
function setAgeBand(c,k){ const b=AGE_BANDS.find(x=>x.k===k); if(!c||!b) return false;
  c.ageBand=b.k; c.age=b.mid; return true; }
function masteredCount(){ try{ return Object.keys(state.luMastered||{}).filter(k=>state.luMastered[k]).length; }catch(e){ return 0; } }
/* ===================== RESUME AN UNFINISHED DRILL AT ITS CARD (road to 4.5, P1.15) =====================
   An Atlas stop's drill (Practice from a stop — `trailReturn` set, nav 'train') used to live only in `state`:
   leave it for Home, close the tab or reload, and the words, the card and the score were gone; Continue
   reopened the stop. Now the drill is kept ON THE CHILD while it is unfinished — `c.resume` = the stop, the
   words (keys, in order), the card index, the score so far, the right and wrong lists — written when the drill
   starts and on every card it moves on (`resumeMark`), and deleted the moment it finishes (`resumeClear`).
   Continue — Home's, the drawer's and `#/continue`, all through family-shell's goNext — asks `SB_RESUME()`
   first and, when there is a drill to go back to, reopens it at THAT card (`app.resumeDrill`), the same
   words in the same order. Nothing is scored by resuming: the evidence was written when each card was
   answered. A record older than RESUME_DAYS is left alone (the map is the better door after a fortnight).
   Per child, so a sibling never inherits it. Guard: tests/drill-resume.cjs. */
const RESUME_DAYS=14;
function resumeMark(){ try{ const S=state, c=active(); if(!c) return;
    if(S.nav!=='train' || !S.trailReturn || S.sessionOver || !Array.isArray(S.sessionWords) || !S.sessionWords.length) return;
    c.resume={ u:S.trailReturn, crs:S.trailCourse==='exp'?'exp':'honey', lbl:String(S.sessionLabel||'').slice(0,80),
      ws:S.sessionWords.map(w=>w&&w.w).filter(Boolean), gi:S.gi|0, r:S.sessionRight|0, d:S.sessionDone|0,
      ok:(S.sessionCorrect||[]).map(x=>x&&x.w).filter(Boolean), no:(S.sessionWrong||[]).map(x=>x&&x.w).filter(Boolean), at:Date.now() };
    save(); }catch(e){} }
function resumeClear(){ try{ const c=active(); if(c&&c.resume){ delete c.resume; save(); } }catch(e){} }
function resumeOf(c){ try{ c=c||active(); const r=c&&c.resume;
    if(!r||!r.u||!Array.isArray(r.ws)||!r.ws.length||(r.gi|0)<0||(r.gi|0)>=r.ws.length) return null;
    if(Date.now()-(+r.at||0)>RESUME_DAYS*864e5) return null;
    return r; }catch(e){ return null; } }
window.SB_RESUME=resumeOf;
const coachDaysLeft = () => { const tg=state.coachDate; if(!tg) return null; return Math.ceil((new Date(tg+'T00:00:00') - new Date())/86400000); };
function coachPhase(){ const d=coachDaysLeft(); if(d==null) return {key:'none'}; if(d<0) return {key:'past'}; if(d>28) return {key:'breadth',d}; if(d>14) return {key:'depth',d}; return {key:'sim',d}; }
function coachConsistency(){ const h=state.coachHistory||{}; let days=0; const now=new Date(); for(let i=0;i<14;i++){ const dd=new Date(now); dd.setDate(dd.getDate()-i); if(h[dd.toISOString().slice(0,10)]) days++; } return days; }
function coachTopProblems(n){ const pool=coachPool(); const srs=state.coachSrs||{}; return pool.map(r=>({w:r.w,x:srs[nkey(r.w)]})).filter(o=>o.x&&o.x.wrong>0).sort((a,b)=>b.x.wrong-a.x.wrong).slice(0,n||10); }
function coachWeakList(n){ const srs=state.coachSrs||{}; const byKey={}; coachPool().forEach(r=>byKey[nkey(r.w)]=r);
  return Object.keys(srs).filter(k=>srs[k].wrong>0&&srs[k].box<=2).sort((a,b)=>srs[b].wrong-srs[a].wrong).map(k=>byKey[k]).filter(Boolean).slice(0,n||20); }

/* ---- Parent PIN: a 4-digit gate on grown-up areas (Settings, Parent zone, Premium).
   Stored locally only. No PIN set = gates stay open (first-run friendliness). ---- */
/* A recorded misspelling that IS the word is not a misspelling. 97 boot-shard words (4,845
   across the whole library) once printed 'Often misspelled "army"' under "army". The data is
   cleaned and tests/data-lint.cjs holds it; this guard keeps a future import from saying it. */
function realMiss(w){ return !!(w && w.m && String(w.m).trim().toLowerCase()!==String(w.w||'').trim().toLowerCase()); }
function pinSet(){ return !!state.parentPin; }
/* THE GROWN-UP PIN IS MANDATORY in front of plans, purchases, the parent zone and the testing
   tools (FIX-BEE, Oct 2026). It used to be optional and off by default, so on most devices a
   child could reach the plan sheet in two taps. With no PIN yet, the gate asks a grown-up to
   CHOOSE one (typed twice) and then carries on to where they were going. `soft` keeps the old
   rule — ask only if one exists — for Settings, which also holds a child's own sound and text
   size. It is a deterrent, not security: the dialog says so. Guard: tests/pin-mandatory.cjs. */
function pinGate(nextFn,label,soft){ if(soft && !pinSet()){ nextFn(); return; }
  state.pinDlg={ label:label||'Grown-ups only', typed:'', next:nextFn, make:!pinSet(), first:null }; render(); }
/* ---------------- handlers (the `app` surface) ---------------- */
const app = {
  goLanding:()=>set({screen:'landing'}),
  /* ACCOUNTS ARE OPTIONAL ON THIS DEVICE (FIX-BEE A3/N5). "Start free" used to open an email +
     password form whose answers were never stored anywhere — a toll gate with nothing behind it,
     and the slowest part of the road to the first word. It goes straight to the five setup
     steps now; a grown-up can still make an account later (Settings → account) for cloud backup. */
  goSignup:()=>set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bizzy',goal:10}}),
  goSignin:()=>set({screen:'auth',authMode:'signin'}),
  swapAuth:()=>set({authMode: state.authMode==='signup'?'signin':'signup'}),
  onEmail:(v)=>set({email:v}), onPw:(v)=>set({pw:v}),
  doAuth:()=>{ if(state.authMode==='signin'){ let ch=state.children;
      /* no invented child: signing in on an empty device used to conjure "Ahana, level 9, a
         12-day streak". Nothing is on this device yet, so set a speller up instead. */
      if(!ch.length){ set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bizzy',goal:10}}); flash('Nothing is saved on this device yet — let’s set your speller up'); return; }
      set({children:ch, activeIdx:0, theme:ch[0].theme||'spellbound', screen:'app', nav:'home'});
    } else { set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bizzy',goal:10}}); } },
  // onboarding
  onDraftName:(v)=>set({draft:{...state.draft,name:v}}),
  onDraftAge:(v)=>set({draft:{...state.draft,age:+v}}),
  onDraftBand:(k)=>{ const b=AGE_BANDS.find(x=>x.k===k)||AGE_BANDS[1]; set({draft:{...state.draft, age:b.mid, ageBand:b.k}}); },
  pickAvatar:(id)=>set({draft:{...state.draft,avatar:id}}),
  pickGoal:(v)=>set({draft:{...state.draft,goal:+v}}),
  onbBeeDate:(v)=>{ state.draft.beeDate=v||null; },
  onbBack:()=>{ if(state.onbStep===0){ set({screen: state.addingMore?'app':'landing'}); return; } set({onbStep:state.onbStep-1}); if(onbKey()==='place') onbPlaceBegin(); },
  pickAvatar:(id)=>{ if(window.SB_AVATARS&&SB_AVATARS.byId[id]&&SB_AVATARS.byId[id].rarity!=='free'&&state.screen==='onboarding'){ flash('🔒 '+SB_AVATARS.byId[id].name+' is waiting in your Collection — its card says how to win it.'); return; } state.draft.avatar=id; render(); },
  onbWorld:(id)=>{ if(FREE_THEMES.indexOf(id)<0){ flash('That world opens later — start in one of these two'); return; } state.draft.theme=id; state.theme=id; render(); },
  onbNext:()=>{ const S=state; const K=onbKeys(), k=K[Math.min(K.length-1,S.onbStep|0)];
    if(k==='name' && !S.draft.name.trim()){ flash('Add a name to continue'); return; }
    /* the placement step's Continue is its choice; while words are still being asked its primary is "Next word" */
    if(k==='place'){ const p=S.draft.pl;
      if(!p || !window.SB_PLACE){ onbPlaceBegin(); flash('One moment — the words are on their way'); return; }
      if(!p.skipped && !SB_PLACE.done(p.s)){ app.placeNext(); return; } }
    if(k==='world' && !S.draft.theme){ flash('Pick a world first — every speller chooses their own'); return; }
    if(S.onbStep<K.length-1){ const nk=K[S.onbStep+1];
      /* P1.22: the first free world is PRESELECTED, so that step is one tap on Continue (it is still the child's
         choice — the other one is a tap away, and the look only changes when a world is tapped) */
      if(nk==='world' && !S.draft.theme) S.draft.theme=ONB_THEMES.find(id=>FREE_THEMES.indexOf(id)>=0)||FREE_THEMES[0];
      set({onbStep:S.onbStep+1}); if(nk==='place') onbPlaceBegin(); return; }
    /* the end of setup is a first WORD (or the chosen stop's lesson): it waits for the boot word tier (P1.13 step 1) */
    if(!wordsIn()){ wordsHold(()=>app.onbNext()); return; }
    const placed=app._finishOnb(); set({screen:'app', nav:'home'});
    /* A8 (FIX-BEE v2): the first thing a new speller does is SPELL — one spoken word, right inside
       the first minute, celebrated — and then the first Atlas lesson through the one next step.
       A child who has just spelled twelve placement words has done that: they go straight INTO the
       stop they chose (app.goStep reads the start line), and the first right one is their first word. */
    if(placed && placed.n){ try{ if(placed.ok) SB_SHELL.milestone&&SB_SHELL.milestone('first-word'); }catch(e){} try{ app.goStep(); }catch(e){} }
    else { try{ app.firstWord(); }catch(e){ try{ app.goStep(); }catch(e2){} } }
    /* If they picked a paid plan on the landing page, land them back on it rather
       than dropping them at the bottom of the ladder to find it again. The tier is
       NOT applied here — nobody has paid yet; the sheet is where that happens. */
    if(state.landWant && state.landWant!=='free'){ const want=state.landWant; state.landWant=null;
      setTimeout(()=>{ try{ state.tierUpsell={feature:'plan', label:'the plan you picked', need:want};
        set({showTiers:true}); }catch(e){} }, 700); } },
  _finishOnb:()=>{ const S=state; const kid={ name:S.draft.name.trim()||'Speller', age:S.draft.age, ageBand:S.draft.ageBand||bandForAge(S.draft.age).k, avatar:S.draft.avatar, theme:(S.draft.theme&&FREE_THEMES.indexOf(S.draft.theme)>=0)?S.draft.theme:S.theme, goal:S.draft.goal, level:1, acc:0, xp:0, week:[0,0,0,0,0,0,0] };
    if(S.draft.beeDate) kid.milestone={ label:(S.draft.beeLabel||'the bee'), date:S.draft.beeDate };
    /* placement (P1.7): the region the child CHOSE becomes their start line on Tier 1 (trail.js startIdx) — only
       where Continue starts; nothing is marked walked. The suggestion and the run stay beside it for the report
       card. A band below 11 never had the step, so a run left in the draft from an earlier band is ignored. */
    let placed=null; try{ if(onbKeys().indexOf('place')>=0 && window.SB_PLACE && SB_PLACE.record) placed=SB_PLACE.record(); }catch(e){}
    if(placed && !placed.skipped && placed.u){ let at=''; try{ at=SB_SHELL.ymd(); }catch(e){}
      kid.trail={ lap:1, done:{}, chk:{}, seen:{}, elap:1, edone:{}, echk:{}, start:{ u:placed.u, act:placed.act, pick:placed.pick, rec:placed.rec, n:placed.n, ok:placed.ok, at } }; }
    /* fr = the day this child was set up: the opening splash stays away all of that first day */
    try{ kid.fr=SB_SHELL.ymd(); }catch(e){}
    /* the word book goes with the child: the one who was active keeps theirs, the new one starts empty */
    try{ if(S.children.length) SB_SHELL.bookOut(S.children[S.activeIdx]); SB_SHELL.bookIn(kid,true); }catch(e){}
    const newIdx=S.children.length; state.children=[...S.children,kid]; state.activeIdx=newIdx; state.theme=kid.theme; state.goalDone=0; state.addingMore=false; save();
    try{ SB_SHELL.startActivity(); }catch(e){} return placed; },

  firstWord:()=>{ const idx=wordIndex(); const c=active(); const opts=['bee','sun','hop','map','cup','jam','fox','web','hat','pen'].filter(w=>idx[w]);
    const w=opts.length?opts[((c&&c.name)||'').length%opts.length]:'bee';
    state.fw={ w, typed:'', tries:0, done:false, miss:false, t0:Date.now() }; set({screen:'app', nav:'firstword'});
    setTimeout(()=>{ try{ say(w); }catch(e){} },450); },












  // theme / mode
  pickTheme:(id)=>{ if(!isThemeUnlocked(id)){ app.buyTheme(id); return; } const children=state.children.slice(); if(children[state.activeIdx]) children[state.activeIdx]={...children[state.activeIdx],theme:id}; set({theme:id, children}); },
  /* A locked world goes to the Shop's Worlds tab, where its fixed price is printed (FIX-BEE v2). */
  buyTheme:(id)=>{ if(isThemeUnlocked(id)) return app.pickTheme(id); app.openShop('worlds'); },

  /* A locked chapter is never sold (FIX-BEE C4). Tapping it goes where it opens: the Atlas
     region that teaches it, or — for a chapter that only comes with the plan — the grown-up
     PIN in front of the plan sheet. The action keeps its old name; callers still use it. */
  buyConcept:(ci)=>{ ci=+ci; if(isConceptUnlocked(ci)) return app.openConcept(ci); const L=conceptLock(ci);
    if(L.kind==='learn'){ flash('🧭 '+L.text+' — walk there and it opens.'); if(L.t){ try{ app.trailAct((L.t.course||'honey')+'|'+L.t.actId); }catch(e){ try{ app.setNav('trail'); }catch(_){} } } else { try{ app.setNav('trail'); }catch(e){} } return; }
    app.askPlan('concepts'); },
  /* "Ask a grown-up about the plan": the plan sheet, which the grown-up PIN guards where it is
     drawn (pinGate in render) — so the child meets a PIN pad, never a price. */
  askPlan:(feature)=>{ openUpsell(feature||'plan', 'More to explore', 'beginner'); },
  setMode:(m)=>{ state.modePref=null; set({mode:m}); },
  setTextSize:(k)=>set({textSize:(k==='large'||k==='small')?k:'normal'}),
  // accessibility toggles
  setA11yFont:(k)=>{ state.a11yFont=(k==='easy'?'easy':'std'); save(); render(); },
  toggleContrast:()=>{ state.a11yContrast=!state.a11yContrast; save(); render(); },
  toggleReduceMotion:()=>{ state.a11yMotion=!state.a11yMotion; save(); render(); },
  toggleFeed:()=>{ if(!state._setGrown) return; state.feedOff=!state.feedOff; save(); if(state.feedOff&&state.nav==='feed') state.nav='home'; flash(state.feedOff?'My Feed is off':'My Feed is on'); render(); },
  toggleCalm:()=>{ state.calmMode=!state.calmMode; window.SB_CALM=state.calmMode; save(); flash(state.calmMode?'🌿 Calm mode on — games run gentler, no rush':'Calm mode off'); render(); },
  toggleReadAloud:()=>{ state.readAloud=!state.readAloud; save(); if(state.readAloud) say('I will read the cards to you!'); render(); },
  setVoiceRate:(k)=>{ state.voiceRate=(k==='slow'?0.75:1); save(); say('Hello! I read the words like this.'); render(); },
  // nav
  setNav:(key)=>{ if(key!=='home') _greetVisit=null;
    /* C5: a route change resets the overlays that belong to the screen being left — a PIN dialog
       opened over a locked book must not follow the child to the next screen. */
    state.pinDlg=null; state.walletOpen=false;   /* leaving Home ends the visit: the next one gets a new hello */
    if(state.settingsOpen && key!=='settings') state.settingsOpen=false;   // navigating away closes the Settings pop-up
    if(key==='train'){ app.startTrain(); return; } if(key==='coach'){ app.openCoach(); return; } if(key==='games'){ app.openGames(); return; } if(key==='journeys'){ app.openJourneys(); return; } if(key==='trivia'){ app.openTrivia(); return; }
    if(key==='settings'){ app.openSettings(); return; }   /* the child's four sections open freely; Grown-ups asks for the PIN (FIX-BEE v2, §5) */
    if(key==='parent'){ pinGate(()=>{ state.progTab='parent'; set({nav:'progress', screen:'app', mood:'happy', conceptSel:null}); },'Parent zone'); return; }
    if(key==='progress'&&state.progTab!=='me') state.progTab='me';   // the Parent tab must ask for the PIN again (FIX-BEE M3)
    if(key==='concepts'){ lazyNeed('concepts'); loadConcepts(); state.conceptView='all'; state.conceptTier=currentTier(); state.conceptPage=0; }
    if(key==='figurative') lazyNeed('figurative');
    if(key==='quotes') lazyNeed('quotes');   /* #/quotes reaches the page through here, not openQuotes */
    if(key==='feed'&&!state.feedOff) lazyNeed(['feed','atlas']);   /* My Feed: engine, cards and screen arrive at its door (boot-lazy `feed`) */
    if(key==='themes'||key==='journeys') lazyNeed(['themes','lists']);
    if(key==='adv') lazyNeed('advanced');
    set({nav:key, screen:'app', mood:'happy', conceptSel:null}); },

  // ----- Parent PIN dialog + setup -----
  pinKey:(d)=>{ const p=state.pinDlg; if(!p) return;
    if(d==='del'){ p.typed=p.typed.slice(0,-1); render(); return; }
    p.typed=(p.typed+d).slice(0,4);
    if(p.typed.length===4 && p.make){
      if(!p.first){ p.first=p.typed; p.typed=''; p.wrong=false; render(); return; }
      if(p.typed!==p.first){ p.first=null; p.typed=''; p.wrong=true; try{sfx('wrong');}catch(e){} render(); return; }
      state.parentPin=SB_STORE.pinMake(p.typed); save(); flash('Grown-up PIN set ✓'); }   /* kept salted and hashed, never as the digits (store.js, audit v4 Q1) */
    if(p.typed.length===4){ if(SB_STORE.pinCheck(p.typed,state.parentPin)){ const fn=p.next; state.pinDlg=null; p.wrong=false;
        /* a pass is good for whatever it opens on this same tick — the plan sheet's own guard in
           render() reads it, so a gated opener is not asked twice */
        state._pinPass=true; try{ fn ? fn() : render(); } finally { state._pinPass=false; } }
      else { p.typed=''; p.wrong=true; try{sfx('wrong');}catch(e){} render(); } }
    else render(); },
  pinCancel:()=>set({pinDlg:null}),
  /* Change the PIN: the old one first, then the new one twice. There is no "remove" any more —
     the PIN is what stands between a child and the plan sheet. */
  pinSetup:()=>{ const make=()=>set({pinDlg:{ label:'Choose a new grown-up PIN', typed:'', next:null, make:true, first:null }});
    if(pinSet()) pinGate(make,'Change grown-up PIN'); else make(); },   // the old PIN stands until the new one is confirmed







  figDeck:(id)=>{ if(!gateFeature('trainTools','Idioms & Similes')) return; const c=active(); const seen=((c.figSeen||{})[id]||0); set({figTab:'learn', figDeck:id, figIdx:Math.min(seen, Math.max(0,figDeckItems(id).length-1)), figFlip:false}); },
  figFlip:()=>{ const to=!state.figFlip;
    if(to && state.readAloud){ const x=figDeckItems(state.figDeck)[state.figIdx||0]; if(x) say(x.p+'. '+(x.m||'')); }
    set({figFlip:to}); },
  figNav:(dir)=>{ const items=figDeckItems(state.figDeck); let i=(state.figIdx||0)+(+dir);
    i=Math.max(0,Math.min(items.length-1,i));
    const c=active(); c.figSeen=c.figSeen||{};
    if(i>(c.figSeen[state.figDeck]||0)){ c.figSeen[state.figDeck]=i;
      if(i===items.length-1 && !((c.figDone||{})[state.figDeck])){ (c.figDone=c.figDone||{})[state.figDeck]=1; const _p=addCoins('stop'); sfx('win'); burstConfetti(50); flash('📚 Deck complete!'+(_p?' +'+_p+' 🪙':'')); } save(); }
    set({figIdx:i, figFlip:false}); },
  figBackToDecks:()=>set({figDeck:null, figFlip:false}),
  // ----- Vocabulary study (NSF vocabulary-bee style) -----
  openVocab:()=>{ if(!gateFeature('trainTools','Vocab practice')) return; set({nav:'vocab', screen:'app', vocDeck:null, conceptSel:null}); },
  // ---- Quotes: a swipeable deck of kid-friendly quotations from famous people ----
  // Quote of the hour on Home → the Quotes section, landing on that exact quote.
  openQuoteHour:(i)=>{ const n=parseInt(i,10); state.qCat=null; if(n>=0) state.qi=n; app.openQuotes(); },
  openQuotes:()=>{ if(!gateFeature('trainTools','Quotes & poems')) return; lazyNeed('quotes'); set({nav:'quotes', screen:'app', conceptSel:null, qi:(state.qi||0)}); markQuoteSeen(); setTimeout(()=>{ if(state.readAloud) app.qSpeak(); },220); },
  qNav:(dir)=>{ const L=quoteList(); if(!L.length) return; let i=(state.qi||0)+(+dir); if(i<0)i=L.length-1; if(i>=L.length)i=0; set({qi:i}); markQuoteSeen(); if(state.readAloud) app.qSpeak(); },


  qSpeak:()=>{ const L=quoteList(); const x=L[state.qi||0]; if(x){ try{ say(x.q+' — '+x.a); }catch(e){} } },

  qFavsOnly:()=>{ set({qCat:'__fav',qi:0}); },



  // Word of the hour: open its learn card, hear it, or jump straight into practice.
  /* TWO CALLERS, AND THIS USED TO SERVE ONLY ONE. The Word of the Hour tile passes
     nothing and wants the hour's word; the List Builder passes the word it drew, in
     data-arg. The handler took no parameter at all, so it called wordOfHour()
     unconditionally — every one of the builder's results opened the SAME card, and
     because the button still showed the tapped word, the card simply looked wrong
     rather than broken. An argument that a caller sends and the handler drops is
     invisible from both ends: the markup looks right and the action looks right. */
  openWordCard:(arg)=>{ let w=null;
    const q=(arg==null?'':String(arg)).trim();
    if(q){ const k=nkey(q);
      try{ w=wordIndex()[k]||wordDB().get(k)||null; }catch(e){}
      /* Never fall back to a DIFFERENT word. If the record cannot be found, show the
         word that was tapped with whatever is known about it — a thin card is a small
         failure, the wrong word is the bug being fixed. */
      if(!w) w={w:q}; }
    else{ w=wordOfHour();
      /* the hour's word may have been pinned from the seed (wohSeed) before the shard was in: open its full record */
      if(w&&w._seed){ const k=nkey(w.w); try{ w=wordIndex()[k]||wordDB().get(k)||w; }catch(e){} } }
    if(!w){ flash('No word right now — try again soon'); return; }
    set({wordCard:w}); try{ say(w.w); }catch(e){} },










  // ===== Subscription tiers (PIN-gated from Settings) =====
  openTiers:()=>set({showTiers:true}),   // render()'s plan guard asks for the PIN



  // ===== Parent account / auth (local scaffold; Supabase in Phase 2) =====
  openAuth:(mode)=>set({authSheet:mode||'signin', authErr:null}),

  


  doSignOut:()=>{ SB_AUTH.signOut(); flash('Signed out'); render(); },










  bkPick:(file)=>{ try{ const rd=new FileReader(); rd.onload=()=>app.bkLoad(String(rd.result||'')); rd.onerror=()=>{ state.bkMsg={t:'Could not read that file.',bad:1}; render(); }; rd.readAsText(file); }catch(e){} },
  bkLoad:(text)=>{ const r=backupParse(text); if(!r.ok){ state.bkPending=null; state.bkMsg={t:r.why,bad:1}; render(); return; }
    state.bkAsk=null; state.bkMsg=null; state.bkPending=r; render(); },
  bkRestoreGo:()=>{ const p=state.bkPending; if(!p) return; pinGate(()=>{ bkHalt(); restoreHousehold(p.blob); state.bkPending=null; flash('Restored — opening the household from the file'); bkHaltAndReload(); },'Restore a backup — grown-ups only'); },


  bkCancel:()=>set({bkAsk:null, bkPending:null}),

  // ===== Admin console =====
  /* The local support console. It used to open on a seeded admin / admin sign-in — a default
     credential that set any child's plan. It is a testing tool now, behind the grown-up PIN. */
  openAdmin:()=>pinGate(()=>set({screen:'admin', adminTab:'users'}),'Testing tools — grown-ups only'),
  closeAdmin:()=>set({screen:'app'}),
  adminTab:(t)=>set({adminTab:t}),
  adminSetTier:(arg)=>{ const p=String(arg).split('|'); const i=+p[0]; const c=(state.children||[])[i]; if(c&&window.SB_ENT){ SB_ENT.setTier(c,p[1]); save(); render(); } },


  vocFlip:()=>{ const to=!state.vocFlip;
    if(to && state.readAloud){ const w=(state.vocWords||[])[state.vocIdx||0]; if(w) say(w.w+'. '+(w.d||'')); }
    set({vocFlip:to}); },
  vocNav:(dir)=>{ const n=(state.vocWords||[]).length; const prev=state.vocIdx||0; let i=prev+(+dir); i=Math.max(0,Math.min(n-1,i));
    if(+dir>0 && i===n-1 && prev<n-1 && n>=10){ const c=active(); c.vocDone=(c.vocDone||0)+1; const _p=addCoins('stop'); sfx('win'); burstConfetti(50); flash('📖 Vocabulary set complete!'+(_p?' +'+_p+' 🪙':'')); save(); }
    set({vocIdx:i, vocFlip:false});
    const w=(state.vocWords||[])[i]; if(w) setTimeout(()=>say(w.w),150); },



  vocPick:(idx)=>{ const g=state.vocCheck; if(!g||g.done||g.picked!=null) return;
    const q=g.qs[g.i]; const chosen=q.choices[+idx];
    g.picked=+idx; g.ok=(chosen===q.answer);
    /* Per-word knowledge for the heatmap. This is informational — the 80% gate still moves
       only on a graded check — so practice may colour it without "counting". */
    try{ const v=vocProg(active()); const dk=g.deck; const wk=nkey(q.w.w);
      v.known[dk]=v.known[dk]||[]; v.miss[dk]=v.miss[dk]||[];
      if(g.ok){ if(v.known[dk].indexOf(wk)<0) v.known[dk].push(wk); v.miss[dk]=v.miss[dk].filter(x=>x!==wk); }
      else { if(v.miss[dk].indexOf(wk)<0) v.miss[dk].push(wk); v.known[dk]=v.known[dk].filter(x=>x!==wk); }
      v.known[dk]=v.known[dk].slice(-800); v.miss[dk]=v.miss[dk].slice(-200);
    }catch(e){}
    if(g.ok){ g.right++; sfx('correct');
      if(g.mode==='practice'){ const _p=addCoins('answer');
        state.toast='✓'+(_p?' +1 coin 🪙':''); scheduleToast(1400); save(); } }
    else { sfx('wrong'); g.missed.push(nkey(q.w.w)); }
    render(); },
  vocNext:()=>{ const g=state.vocCheck; if(!g||g.picked==null) return;
    if(g.i>=g.qs.length-1){ vocFinishCheck(); return; }
    g.i++; g.picked=null; g.ok=null; render();
    const q=g.qs[g.i]; if(q) setTimeout(()=>say(q.w.w),160); },

  vocCheckClose:()=>set({vocCheck:null}),

  vocBack:()=>set({vocDeck:null, vocCheck:null}),






  // ----- Typing Trainer -----
  openTyping:()=>{ if(!gateFeature('trainTools','the Typing Trainer')) return; tyStop(); set({nav:'typing', screen:'app', ty:null, conceptSel:null}); },
  // The Sound Alphabet (IPA) trainer
  openIpaTrain:()=>{ if(!gateFeature('trainTools','The Sound Alphabet')) return; lazyNeed('sounds'); set({nav:'ipatrain', screen:'app', it:null, conceptSel:null}); },

  itPick:(i)=>{ const it=state.it; if(!it||it.done||it.picked!=null) return; i=+i; const q=it.qs[it.i]; it.picked=i;
    if(i===q.ans){ it.score++; addCoins('answer'); }
    if(it.mode!=='readipa'||i===q.ans) app.itSay();   // confirm with the real voice
    render(); },
  itNext:()=>{ const it=state.it; if(!it||it.picked==null) return; if(it.i+1>=it.qs.length){ it.done=true; if(it.score>=it.qs.length*0.8){ sfx('win'); burstConfetti(50); } } else { it.i++; it.picked=null; } render(); },
  itSay:()=>{ const it=state.it; const q=it&&it.qs&&it.qs[it.i]; if(q) say((q.e&&q.e.w)||''); },

  // ===== Trivia Training — study the whole question bank as flip-cards, by chapter =====
  openTrivTrain:()=>{ if(!gateFeature('trainTools','Trivia Training')) return;
    const lv=ttBand(); const ready=ttLevelReady(lv);
    set({nav:'trivtrain', screen:'app', conceptSel:null, tt:null, ttLoading:!ready});
    if(!ready) ttNeed(lv,(ok)=>{ state.ttLoading=false; state.ttLoadErr=!ok; render(); }); },


  ttBack:()=>set({tt:null}),
  ttFlip:()=>{ const t=state.tt; if(!t) return; t.flip=!t.flip;
    if(t.flip){ const c=active(); c.ttSeen=c.ttSeen||{}; const sk=ttSeenKey(t.th); c.ttSeen[sk]=Math.max(c.ttSeen[sk]||0, t.i+1);
      const q=ttDeck(t.th)[t.i||0]; const k=ttKey(q);
      // Seeing the answer is the lightest state there is: the card counts as practised.
      if(k){ const rec=ttRec(c,k); if(!rec.s){ rec.s='practised'; }   /* seeing an answer is not getting one right — no coin */ ttPut(c,k,rec); }
      save(); }
    render(); },
  ttNav:(d)=>{ const t=state.tt; if(!t) return; const deck=ttDeck(t.th); if(!deck.length) return;
    let i=(t.i||0)+(+d); if(i<0)i=deck.length-1; if(i>=deck.length)i=0; t.i=i; t.flip=false; render(); },














  goSettings:()=>app.setNav('settings'),
  // Settings opens as a pop-up over whatever you're doing — the running session/game/practice
  // pauses underneath and resumes when you close it (✕).
  openSettings:()=>{ try{ clearTimeout(state._advTimer); state._advTimer=null; }catch(e){}
    try{ if(typeof clearGTimer==='function') clearGTimer(); }catch(e){}
    try{ if(state.ty&&state.ty.timer){ clearInterval(state.ty.timer); state.ty.timer=null; } }catch(e){}
    state._setOpened=false; set({settingsOpen:true}); },
  closeSettings:()=>{ state.settingsOpen=false; state._setOpened=false; state._setGrown=false;   /* the grown-ups pass ends with the sheet */
    try{ const g=state.game; if(g && (g.type==='beat'||g.type==='champ') && g.status==='play' && typeof startGTimer==='function') startGTimer(); }catch(e){}
    try{ if(state.status && state.status!=='idle' && (state.nav==='train'||state.nav==='coach')) autoAdvance(1600); }catch(e){}
    render(); },
  // ----- Word Voice Tester (human-in-the-loop voice QA) -----
  openVoiceTest:()=>set({nav:'voicetest', screen:'app', vtTab:'test'}),




  vtClear:(k)=>{ const f=vtLoad(); k=nkey(k); delete f.ok[k]; delete f.bad[k]; vtSave(f); render(); },

  goHome:()=>app.setNav('home'),
  // 🎲 Surprise me — jump into a random learning resource
  surpriseMe:()=>{ const R=a=>a[Math.floor(Math.random()*a.length)]; const opts=[];
    if((window.SB_QUOTES||[]).length) opts.push(['a famous quote',()=>{ state.qCat=null; state.qi=Math.floor(Math.random()*window.SB_QUOTES.length); app.openQuotes(); }]);
    try{ const decks=(typeof figDecks==='function')?figDecks():[]; if(decks.length) opts.push(['a saying',()=>{ const d=R(decks); set({nav:'figurative'}); try{app.figDeck(d.id);}catch(e){} }]); }catch(e){}
    opts.push(['typing skills',()=>app.openTyping()]);
    if((state.conceptData||[]).length) opts.push(['a word concept',()=>{ const uns=(state.conceptData||[]).map((_,i)=>i).filter(i=>{ try{return isConceptUnlocked(i);}catch(e){return false;} }); if(uns.length) app.openConcept(R(uns)); else app.setNav('concepts'); }]);
    opts.push(['a word journey',()=>app.openJourneys()]);
    opts.push(['a set to practise',()=>{ set({nav:'coach', luTab:'practice', status:'idle', typed:'', mood:'happy'}); try{ newCoachBatch(); }catch(e){} setTimeout(speak,350); }]);
    const pick=R(opts); try{ sfx('coin'); }catch(e){} flash('🎲 Surprise — '+pick[0]+'!'); try{ pick[1](); }catch(e){ app.setNav('explore'); } },
  goConcepts:()=>app.setNav('concepts'),
  journey:(i)=>{ i=+i; if(i===0) app.openCoach(); else if(i===1) app.setNav('concepts'); else if(i===2) app.openGames(); else app.openJourneys(); },
  // train
  /* cardIdx MUST reset with gi: a stale Card-view index left the flashcard showing
     word 7 of the new session while speak() said word 0 — "shows psychopharmacologically
     but says asphyxiated" (Amrita 8.26). */
  /* P1.15: back into the unfinished drill at its card (resumeOf above). The words' cards need the library's
     records (meaning, sentence, respelling), which may still be landing — so it waits for them, then rebuilds
     the session exactly as it was left. */
  resumeDrill:()=>{ const r=resumeOf(); if(!r){ try{ app.goNext(); }catch(e){} return; }
    lazyNeed(['words','card','audio'],()=>{ const r2=resumeOf(); if(!r2) return; const idx=wordIndex();
      const rec=k=>{ const x=idx[nkey(k)]||{w:k}; return { w:x.w||k, d:x.d||'', s:x.s||'', p:x.p||'', o:'', r:x.h||'' }; };
      state.trailReturn=r2.u; state.trailCourse=r2.crs; state.sessionLabel=r2.lbl; state.sessionWords=r2.ws.map(rec);
      state.coachSession=false; state.trainBack=null; state.sessionListKey=null; state.sessionOver=false;
      state.sessionCorrect=(r2.ok||[]).map(rec); state.sessionWrong=(r2.no||[]).map(rec);
      state.sessionRight=r2.r|0; state.sessionDone=r2.d|0; state.gi=r2.gi|0;
      set({nav:'train', screen:'app', status:'idle', typed:'', mood:'happy', showDef:false, showSent:false, showOrigin:false, cardIdx:0, cardDone:false, reviseIdx:0});
      setTimeout(speak,350); }); },
  startTrain:()=>{ lazyNeed(['card','audio']); state.sessionRight=0; state.sessionDone=0; state.sessionListKey=null; state.gi=0; state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; set({nav:'train', screen:'app', status:'idle', typed:'', mood:'happy', showDef:false, showSent:false, showOrigin:false, cardIdx:0, cardDone:false, reviseIdx:0}); resumeMark(); setTimeout(speak,350); },

  startLevelUp:()=>{ const c=active(); ensureLists(c); c.activeList='default'; app.openCoach(); },

  // Learn-card self-mark: arg is "kind|navAct|word" — record the outcome, then advance via that nav.
  flashMark:(arg)=>{ const p=String(arg).split('|'); const kind=p.shift(); const nav=p.shift(); const w=p.join('|');
    /* FIX-BEE D5: a child cannot mark a word mastered. "Got it" moves on and writes nothing;
       "revise" puts the word on the revise pile (a study list), never on the evidence record. */
    if(kind==='done'){ /* study aid only */ }
    else { const ws=state.sessionWords||[]; const obj=ws.find(x=>nkey(x.w)===nkey(w))||{w:w,d:'',s:''}; addMiss(obj,'mark'); flash('Marked for revision ⚑'); }
    if(nav && typeof app[nav]==='function') app[nav]('next'); else render(); },
  /* The last card's Next used to be a dead button ("nothing happens" — Amrita 8.26).
     Finishing a deck is a MOMENT: confetti, a high five, and a real next step. */
  deckFinish:(navAct)=>{ try{ sfx('win'); burstConfetti(120); }catch(e){}
    if(navAct==='trailWordNav'){ flash('🙌 High five — you met every word! Now practise them.');
      try{ app.trailUnit(state.trailUnit); return; }catch(e){} }
    else flash('🙌 High five — all cards met! Time to spell them.');
    set({luTab:'practice', reviseIdx:0}); },
  conceptWordNav:(dir)=>{ const ws=((state.conceptSel&&state.conceptSel.words)||[]).filter(x=>x&&x.w); const N=ws.length||1; let i=(state.conceptWordIdx||0)+(dir==='next'?1:-1); set({conceptWordIdx:Math.max(0,Math.min(N-1,i))}); },

  // Revisions — the words you flagged to revise; complete them or drill them again
  openRevisions:()=>set({nav:'revisions', screen:'app'}),
  /* Today's ten (road to 4.5, P1.16): today.js is lazy (group `today`) — the screen holds a loader until it lands */
  openToday:()=>{ clearGTimer(); state.game=null; if(window.SB_TODAY){ SB_TODAY.open(); return; } set({nav:'today', screen:'app'});
    lazyNeed('today',()=>{ if(state.nav==='today'&&window.SB_TODAY) SB_TODAY.open(); }); },






  onType:(v)=>{ state.typed=v; }, /* no per-keystroke render — a full re-render restarts tile animations (dock flicker) */


  openFinder:()=>{ if(drillLive()){ flash('Search waits until this word is answered — it could give the spelling away'); return; } state.drawerOpen=false; set({nav:'finder', conceptSel:null}); },

  /* ---- header search: type here, see suggestions, Enter opens the Finder ----
     The dropdown is NOT closed on blur. Blur fires before the click that picks a
     suggestion, so closing there kills the very tap it exists for; it closes on pick,
     on Enter, on Escape, on any nav change, and on a click outside the bar. */
  hqType:(v)=>{ if(drillLive()){ state.hq=''; return; } state.hq=v||''; state.hqSel=-1; render(); },
  hqClear:()=>{ state.hq=''; state.hqSel=-1; render();
    setTimeout(()=>{ try{ document.querySelector('[data-fkey="hq"]')?.focus(); }catch(e){} },0); },
  hqGo:()=>{ if(drillLive()) return; const q=(state.hq||'').trim(); if(q.length<2){ flash('Type at least two letters'); return; }
    state.finderQ=q; state.finderSel=null; state.hq=''; state.hqSel=-1; app.openFinder(); },
  hqPick:(w)=>{ if(drillLive()) return; state.finderQ=w||''; state.hq=''; state.hqSel=-1; state.finderSel=null;
    app.openFinder(); try{ app.finderPick(w); }catch(e){} },
  /* a place row (audit v4 C4): close the bar, then open it the way a tap on it would */
  hqPlace:(key)=>{ if(drillLive()) return; state.hq=''; state.hqSel=-1; render(); openPlace(key); },
  hqKey:(e)=>{ if(drillLive()) return; const list=headerSuggest(state.hq); const n=list.length;
    if(e.key==='ArrowDown'){ e.preventDefault(); state.hqSel=n?((state.hqSel+1+n+1)%(n+1))-0:-1; if(state.hqSel>=n) state.hqSel=-1; render(); return; }
    if(e.key==='ArrowUp'){ e.preventDefault(); state.hqSel=n?(state.hqSel<=-1?n-1:state.hqSel-1):-1; render(); return; }
    if(e.key==='Escape'){ state.hq=''; state.hqSel=-1; render(); try{ e.target.blur(); }catch(_){} return; }
    if(e.key!=='Enter') return;
    e.preventDefault();
    // Enter takes the highlighted suggestion if there is one, otherwise the typed query
    const it=state.hqSel>=0?list[state.hqSel]:null;
    if(it&&it.place) app.hqPlace(it.place); else if(it) app.hqPick(it.w); else app.hqGo(); },
  finderPick:(w)=>{ const r=finderResults(state.finderQ).find(x=>nkey(x.w)===nkey(w)) || wordDB().get(nkey(w)); if(r){ state.finderSel=r; try{window.scrollTo(0,0);}catch(e){} render(); } },





  reportWord:(w)=>set({reportW:w}),
  reportClose:()=>set({reportW:null}),
  /* ---- 🐞 the bug sidebar. OFFLINE by design (COPPA: the app transmits nothing):
     reports save to the device bucket on THIS device, with only technical context
     (screen, version, viewport, theme — never a name or age), and the panel
     exports them as bug-reports.json / copies them for the parent to send. ---- */
  /* ---- research capture (SB_TM): grown-up switch, on-device only ---- */
  toggleResearch:()=>{ pinGate(()=>{ const v=!(window.SB_TM&&SB_TM.on());
    if(window.SB_TM) SB_TM.arm(v);
    flash(v?'🔬 Research capture ON — this device only, export it from here':'🔬 Research capture off'); render();
  },'Research capture — grown-ups only'); },
  tmExport:()=>{ const txt=window.SB_TM&&SB_TM.export(); if(!txt){ flash('Nothing recorded yet'); return; }
    try{ const blob=new Blob([txt],{type:'application/json'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download='sb-research.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); flash('💾 sb-research.json saved — open it in the operator console'); }catch(e){ flash('Couldn’t save the file'); } },
  tmClear:()=>{ if(window.SB_TM) SB_TM.clear(); flash('Research log cleared'); render(); },

  bugToggle:()=>set({bugOpen:!state.bugOpen}),
  bugCat:(c2)=>set({bugCat:c2}),
  bugType:(v)=>{ state.bugTxt=String(v==null?'':v).slice(0,1200); },
  bugSave:()=>{ const txt=(state.bugTxt||'').trim();
    if(!txt){ flash('Say a few words about what happened first'); return; }
    const list=_bugList();
    list.unshift({ ts:new Date().toISOString().slice(0,16).replace('T',' '), cat:state.bugCat||'bug', txt,
      nav:String(state.nav||''), v:String(window.SB_ASSET_V||'').replace('?v=',''),
      sz:window.innerWidth+'x'+window.innerHeight, mode:String(state.mode||'light'), theme:String(state.theme||'') });
    _bugSave(list.slice(0,100));
    state.bugTxt=''; try{ sfx('correct'); }catch(e){} flash('🐞 Saved on this device — thank you!'); render(); },
  bugDel:(i)=>{ const list=_bugList(); list.splice(+i,1); _bugSave(list); render(); },
  bugExport:()=>{ const list=_bugList(); if(!list.length){ flash('No reports yet'); return; }
    const txt=JSON.stringify(list,null,2);
    try{ const blob=new Blob([txt],{type:'application/json'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download='bug-reports.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); flash('💾 bug-reports.json saved — send it to us!'); }catch(e){ flash('Couldn’t save the file — try Copy instead'); } },
  bugCopy:()=>{ const list=_bugList(); if(!list.length){ flash('No reports yet'); return; }
    const txt=list.map(r=>`${r.ts} · [${r.cat}] ${r.txt} (screen: ${r.nav} · v${r.v} · ${r.sz})`).join('\n');
    try{ navigator.clipboard.writeText(txt).then(()=>flash('Copied '+list.length+' report'+(list.length>1?'s':'')+' 📋')); }
    catch(e){ try{ const t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); flash('Copied 📋'); }catch(e2){ flash('Couldn’t copy'); } } },
  reportIssue:(issue)=>{ const w=state.reportW; if(!w) return; const r=wordDB().get(nkey(w))||{w};
    state.wordReports=[...(state.wordReports||[]), { w:r.w||w, issue, d:r.d||'', s:r.s||'', when:new Date().toISOString().slice(0,10) }];
    save(); set({reportW:null}); flash('Thanks — logged for review. Parents can export it from the Parent tab. ⚑'); },






  // Practice Vocabulary — optional, no progression: pick the right meaning from 4 options,
  // earn a coin for a correct pick. Distractors are other words' meanings from the list.
  // Words never repeat within a run — once every word has been seen the run is done and the
  // speller gets a confetti + avatar celebration. Returns true if a fresh question was built.
  vocabNewQ:()=>{ const pool=learnWords().filter(w=>w&&w.w&&String(w.d||'').trim());
    if(pool.length<2){ state.vp=null; state.vpAllDone=false; return false; }
    const seen=state._vpSeen||[]; const cand=pool.filter(w=>seen.indexOf(nkey(w.w))<0);
    if(cand.length<1){ state.vp=null; state.vpAllDone=true; return false; } // no repeats — whole list done
    const target=cand[Math.floor(Math.random()*cand.length)]; state._vpSeen=(state._vpSeen||[]).concat(nkey(target.w));
    const used={}; used[String(target.d).toLowerCase()]=1;
    const others=pool.filter(w=>nkey(w.w)!==nkey(target.w)).sort(()=>Math.random()-0.5); const distract=[];
    for(let j=0;j<others.length && distract.length<3;j++){ const dk=String(others[j].d).toLowerCase(); if(!used[dk]){ used[dk]=1; distract.push(others[j].d); } }
    /* a real shuffle: sort(()=>Math.random()-.5) is biased by position, and option order is how
       an answer leaks without any text giving it away (FIX-BEE D8, tests/question-leaks.cjs) */
    const opts=sample([{d:target.d,correct:true}].concat(distract.map(d=>({d:d,correct:false}))));
    state.vp={ w:target, opts:opts, picked:null, total:pool.length, idx:(state._vpSeen||[]).length }; state.vpAllDone=false; return true; },



  vocabRestart:()=>{ clearTimeout(state._vpTimer); state._vpTimer=null; state._vpSeen=[]; state.vpDone=0; state.vpRight=0; state.vpAllDone=false; if(app.vocabNewQ()){ render(); try{ if(state.vp) say(state.vp.w.w); }catch(e){} } else render(); },


  luPractice:(idx)=>{ state.gi=+idx; state.luTab='practice'; state.status='idle'; state.typed=''; state.mood='happy'; state.showDef=false; state.showSent=false; state.showOrigin=false; render(); setTimeout(speak,250); },
  // Show answer = you didn't know it → save for revision and move on (no manual marking in Practice)
  reveal:()=>{ if(state.status==='revealed') return; const cw=curWord(); if(cw&&cw.w){ addMiss(cw); state.sessionDone=(state.sessionDone||0)+1; state._run=0;
      const rk=nkey(cw.w); state.sessionCorrect=(state.sessionCorrect||[]).filter(x=>nkey(x.w)!==rk); state.sessionWrong=(state.sessionWrong||[]).filter(x=>nkey(x.w)!==rk); state.sessionWrong.push(cw); }
    set({status:'revealed', mood:'think'}); },   // asked to see it → it stays until they move on (a kind face, not a yawn)

  // Self-directed advance: the two card buttons replace the old "Next" button.
  /* a self-mark: moves on, scores nothing, masters nothing (FIX-BEE D5) */
  completeWord:()=>{ app.next(); },
  reviseWord:()=>{ const cw=curWord(); if(cw){ addMiss(cw,'mark'); }
    flash('Marked for revision ⚑'); app.next(); },
  // Practice card view: an icon toggles the spell card into a swipeable portrait flash-card
  // deck. Tap/swipe right = "got it" (completeWord), tap/swipe left = revise (reviseWord).
  // Card view lives inside the Learn tab: the cards icon opens a deck starting on the word
  // you're on and the words after it. Right (tap/swipe/→ key) = next; left = mark revise + next.
  toggleCardView:()=>{ if(state.coachCardView){ set({coachCardView:false, cardDone:false}); return; }
    const ws=learnWords(); state.cardIdx=Math.max(0,Math.min(state.reviseIdx||0, Math.max(0,ws.length-1))); state.cardDone=false;
    set({coachCardView:true, typed:'', status:'idle', mood:'happy'}); setTimeout(()=>say(cardWordNow().w),250); },


  cardNext:()=>app.cardAdvance('next'),
  cardRevise:()=>app.cardAdvance('revise'),
  cardAdvance:(mode)=>{ const ws=learnWords(); const i=state.cardIdx||0; const w=ws[i];
    if(mode==='revise' && w){ addMiss(w,'mark'); flash('Marked for revision ⚑'); }
    if(i>=ws.length-1){ set({cardDone:true}); }
    else { state.cardIdx=i+1; state.reviseIdx=i+1; render(); setTimeout(()=>say(cardWordNow().w),250); } },
  cardBack:()=>{ const i=state.cardIdx||0; if(i>0){ state.cardIdx=i-1; state.reviseIdx=i-1; render(); setTimeout(()=>say(cardWordNow().w),200); } },





  check:()=>{ const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word first'); return; }
    const cw=curWord(); const target=cw.w.toLowerCase();
    if(state.coachSession) recordCoach(target, ans===target);
    logBand(cw, ans===target);
    // remember this word's outcome for the end-of-list summary (latest attempt wins)
    { const rk=nkey(target); state.sessionCorrect=(state.sessionCorrect||[]).filter(x=>nkey(x.w)!==rk); state.sessionWrong=(state.sessionWrong||[]).filter(x=>nkey(x.w)!==rk); (ans===target?state.sessionCorrect:state.sessionWrong).push(cw); }
    if(ans===target){
      const _fw=firstWordDue(active());   /* read BEFORE this answer is recorded (P3.24) */
      markMastered(target);
      try{ const k2=(state.sessionListKey&&state.sessionListKey[0]!=='_')?state.sessionListKey:activeListKey(); const c3=active(); const i3=listStageIdx(c3,k2);
        if(stageComplete(c3,k2) && i3<listStages(k2).length-1 && !(k2==='journey' && i3+1>=CHAMP_LEVELS && !state.premium)){
          setTimeout(()=>{ try{ const cc=active(); if(stageComplete(cc,k2) && listStageIdx(cc,k2)===i3) app.advanceStage(k2); }catch(e){} }, 1100);
        } else {
          // working set fully mastered but the Level isn't — celebrate the set and hand over the next one
          const ws2=state.sessionWords||[]; const sig=ws2.map(w=>nkey(w.w)).join(',');
          if(ws2.length>=5 && state._setCeleSig!==sig && ws2.every(w=>state.luMastered[nkey(w.w)])){
            state._setCeleSig=sig;
            setTimeout(()=>{ try{ if(state.celebrate) return; state.celebrate={kind:'set', sub:'All '+ws2.length+' words of this set in '+listLabel(k2).split(' · ')[0]+'.'}; sfx('win'); burstConfetti(240); render(); }catch(e){} }, 950);
          }
        } }catch(e){}
      const streakRight=(state._run||0)+1; const mood=streakRight>=3?'love':'excited';
      state._run=streakRight; state.sessionRight+=1; state.sessionDone+=1;
      if(!(_fw&&firstWordFx(active()))) sfx('correct'); addCoins('answer'); gainXp(); clearMiss(target);   /* P3.24: the first word ever has its own sound and bee */
      /* a little burst every fifth right word — never a count of them (no run counts: games spec §4.3, no streaks) */
      if(streakRight>0 && streakRight%5===0){ burstConfetti(50); }
      state.status='correct'; state.mood=state.toast?'wow':mood; render();
      autoAdvance(850);  // correct → already marked complete; move on, no click needed
    } else {
      addMiss(curWord());
      sfx('wrong');   /* "So close — 2 letters off" is the miss panel's own headline now (viewTrainCard): as a toast it sat on the letter-by-letter diff */
      state.lastTry=ans;   // the attempt itself, so the letter-by-letter panel survives the child retyping (FIX-BEE D3)
      state.status='wrong'; state.mood='think'; state.sessionDone+=1; state._run=0; render();   // a kind face on a miss, never a frown
      // NO auto-advance on a wrong answer. It used to move on after 2.2s, which is less
      // time than it takes to read a word you have just got wrong — play-testing asked for
      // longer, and the honest answer is that the reader should decide, not a timer. The
      // correct spelling stays up with a Next word button beside it.
    } },
  next:()=>{ clearTimeout(state._advTimer); state._advTimer=null;
    const N=(state.sessionWords&&state.sessionWords.length)||0;
    if(N && state.gi>=N-1){ state.sessionOver=true; resumeClear();   /* finished: nothing left to resume (P1.15) */
      try{ const k=state.sessionListKey; if(k&&k[0]!=='_') getList(active(),k).gi=0; }catch(e){}
      if((state.sessionDone||0)>0){ try{ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, (state.sessionWrong||[]).map(x=>x.w)); }catch(e){} }
      /* An Atlas session reports its score the moment it COMPLETES. It used to report
         only in exitTrain — so a child who finished every word and then left through
         the nav bar (or Practice again) was never recorded, and the stop card went on
         saying "practice and get 70%" forever. Best-of semantics make the exitTrain
         call below harmless double cover for early exits. */
      if(state.trailReturn){ try{ if(window.SB_TRAIL_PRACTICED) SB_TRAIL_PRACTICED(state.trailReturn, state.sessionRight||0, state.sessionDone||0); }catch(e){} }
      try{ if(window.SB_TM) SB_TM.rec({k:'sess', r:state.sessionRight||0, d:state.sessionDone||0, lbl:String(state.sessionLabel||'').slice(0,40)}); }catch(e){}
      state.tmReacted=false;
      set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); return; }
    state.gi+=1; try{ const k=state.sessionListKey; if(k&&k[0]!=='_'){ getList(active(),k).gi=state.gi; save(); } }catch(e){} resumeMark();
    set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); setTimeout(speak,250); },


  // concepts
  conceptCat:(label)=>set({conceptCat:label, conceptPage:0}),



  conceptSetView:(v)=>set({conceptView:v, conceptPage:0}),
  conceptTier:(t)=>set({conceptTier:t, conceptPage:0}),
  conceptPagePrev:()=>set({conceptPage:Math.max(0,(state.conceptPage||0)-1)}),
  conceptPageNext:()=>set({conceptPage:(state.conceptPage||0)+1}),
  openConcept:(ci)=>{ ci=+ci; const ch=state.conceptData&&state.conceptData[ci];
    if(!ch){ flash('That chapter is still loading — one moment'); try{ loadConcepts(); }catch(e){} return; }
    if(!isConceptUnlocked(ci)){ app.buyConcept(ci); return; }
    clearAnimTimer(); stopNarration();
    /* The detail view only renders under nav 'concepts', so a chapter opened from the
       Coach, the traps page or the random-word button used to set conceptSel and then
       render the page the reader was already on — a click that did nothing. Carry the
       nav, and remember the origin so Back goes home rather than to the chapter list. */
    if(state.nav!=='concepts') state.conceptFrom=state.nav;
    state.conceptSel=ch; state.conceptStep=0; state.conceptWordsOpen=false; state.conceptWordIdx=0;
    state.animOn=false; state.animScene=0;
    try{window.scrollTo(0,0);}catch(e){} set({nav:'concepts'}); },
  conceptBack:()=>{ clearAnimTimer(); stopNarration();
    if(state.trailReturn&&app.trailUnit){ const u=state.trailReturn; state.trailReturn=null; state.conceptSel=null; state.animOn=false; set({nav:'trail'}); app.trailUnit(u); return; }
    const from=state.conceptFrom; state.conceptFrom=null;
    if(from){ set({conceptSel:null, animOn:false, animScene:0, nav:from}); return; }
    set({conceptSel:null, animOn:false, animScene:0}); },
  conceptStepGo:(i)=>{ clearAnimTimer(); stopNarration(); set({conceptStep:+i, animOn:false}); },
  conceptPlay:()=>{ clearAnimTimer(); stopNarration(); state.animNonce=(state.animNonce||0)+1; playScene(0); },
  conceptReplay:()=>{ clearAnimTimer(); stopNarration(); state.animNonce=(state.animNonce||0)+1; playScene(0); },
  animTo:(i)=>{ clearAnimTimer(); stopNarration(); state.animNonce=(state.animNonce||0)+1; playScene(+i); },
  conceptPrev:()=>set({conceptStep:Math.max(0,state.conceptStep-1)}),
  conceptNext:()=>set({conceptStep:state.conceptStep+1}),
  conceptWordsToggle:()=>set({conceptWordsOpen:!state.conceptWordsOpen, conceptWordIdx:0}),
  practiseConcept:()=>{ const ch=state.conceptSel; if(!ch) return;
    const words=(ch.words||[]).filter(x=>x&&x.w).map(x=>({w:x.w,d:x.def||'',s:x.ex||'',p:x.say||'',o:'',r:x.hook||''}));
    if(!words.length){ flash('No words in this chapter yet'); return; }
    state.sessionWords=words; state.sessionLabel=conceptShort(ch.title); state.gi=0; state.conceptSel=null; app.startTrain(); },
  // drawer
  openDrawer:()=>set({drawerOpen:true}), closeDrawer:()=>set({drawerOpen:false}),
  /* Home's kudos chip: My page, where the kudos are (P3.30) */
  openKudos:()=>{ state.progTab='me'; app.setNav('progress'); },
  drawer:(key)=>{ state.drawerOpen=false; const F={ mypage:()=>{ state.progTab='me'; app.setNav('progress'); }, medals:()=>{ state.collTab='badges'; app.openCollection(); }, help:()=>set({nav:'help', screen:'app', conceptSel:null}), evolution:()=>app.openEvo(), home:()=>app.setNav('home'), next:()=>app.goNext(), levelup:()=>app.startLevelUp(), games:()=>app.openGames(), concepts:()=>app.setNav('concepts'),
    trail:()=>app.openTrail&&app.openTrail(), revisions:()=>app.openRevisions(), ipatrain:()=>app.openIpaTrain(),
      coach:()=>app.openCoach(), journeys:()=>app.openJourneys(), study:()=>app.coachStudy(), written:()=>app.startWritten(), oral:()=>app.startOral(),
      weak:()=>app.coachWeakDrill(), parentview:()=>{ state.progTab='parent'; app.setNav('progress'); }, settings:()=>app.setNav('settings'), themes:()=>app.setNav('themes'),
      quest:()=>app.openQuestChooser(), coachdesk:()=>app.openCoachDesk(), traps:()=>app.openTraps(), collection:()=>{ state.collTab='avatars'; app.openCollection(); }, finder:()=>app.openFinder(), builder:()=>app.openBuilder(), progress:()=>app.setNav('progress'), parent:()=>app.setNav('parent'), explore:()=>app.setNav('explore'), figurative:()=>app.setNav('figurative'), vocab:()=>app.openVocab(), typing:()=>app.openTyping(), quotes:()=>app.openQuotes(), trivia:()=>app.openTrivia(), trivtrain:()=>app.openTrivTrain(), ipatrain:()=>app.openIpaTrain(), trail:()=>app.openTrail() };
    (F[key]||(()=>{}))(); },
  // coach
  openCoach:()=>{ lazyNeed(['card','lists']); const c=active(); ensureLists(c);
    if(!c.questPath){ set({nav:'quest', screen:'app', conceptSel:null}); return; }   // first visit: choose a quest path
    ensureCoachWords(c.activeList||'default'); state.coachSession=false;
    set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'train', luTab:'revise', luWordsOpen:false, status:'idle', typed:'', mood:'happy', conceptSel:null}); },
  startWordCoach:()=>app.openCoach(),
  openQuestChooser:()=>set({nav:'quest', screen:'app', conceptSel:null}),



  noop:()=>{},   // click-eater for dialog panels (delegation-safe alternative to stopPropagation)





  openBuilder:()=>set({nav:'builder', screen:'app', conceptSel:null}),




  b2TxtStarts:(v)=>{ b2State().starts=String(v||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,12); render(); },
  b2TxtHas:(v)=>{ b2State().has=String(v||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,12); render(); },
  b2TxtEnds:(v)=>{ b2State().ends=String(v||'').toLowerCase().replace(/[^a-z]/g,'').slice(0,12); render(); },

  b2QQtag:(v)=>{ b2State().qtag=String(v||'').slice(0,24); render(); },
  b2QQorig:(v)=>{ b2State().qorig=String(v||'').slice(0,24); render(); },





























  // ----- Level ladder: advance to the next Level of the active list -----
  advanceStage:(key)=>{ const c=active(); ensureLists(c); key=key||activeListKey(); const stages=listStages(key); const idx=listStageIdx(c,key);
    if(idx>=stages.length-1){ sfx('win'); burstConfetti(140); flash('🏆 Every level cleared — incredible!'); return; }
    // Journey: free climbs to Champ (Level 20); the Library beyond is Premium.
    if(key==='journey' && (idx+1)>=CHAMP_LEVELS && !state.premium){ set({showPaywall:true}); return; }
    const champJustDone = (key==='journey' && idx+1===CHAMP_LEVELS);
    getList(c,key).stage=idx+1; state.sessionListKey=null; ensureCoachWords(key); sfx('win'); burstConfetti(champJustDone?320:240);
    state.celebrate={ level:idx+2, list:listLabel(key).split(' · ')[0], champ:champJustDone, date:new Date().toLocaleDateString() }; render(); },










  startBuzz:()=>app.playGame('buzz'),
  // ===== games arcade =====
  openGames:()=>{ clearGTimer(); const c=active(); ensureLists(c); set({nav:'games', screen:'app', game:null, gInfo:false, typed:'', mood:'happy', conceptSel:null}); },
  /* Spelling Quest is gone; its Arcade slot is the Mock Spelling Bee. Old
     deep-links land on the new game rather than on nothing. */
  openQuest:()=>app.mbOpen(),
  /* THE MOCK BEE'S DOOR: mockbee.js is lazy (boot-lazy group 'mockbee'); when it lands it replaces this
     with the real opener, which is then called with the same mode */
  mbOpen:(mode)=>{ const me=app.mbOpen; lazyNeed('mockbee', ()=>{ if(app.mbOpen!==me) app.mbOpen(mode); }); },
  /* The 'Bizzy & the Great Unspelling' story is gone — the games it used to gate are
     now played straight from the arcade (arcadePlay). This is kept as a safe no-op so any
     stale saved deep-link or cached handler lands somewhere harmless rather than throwing. */
  openSaga:()=>{ set({nav:'games', screen:'app'}); },
  /* DAILY BEE (games spec §5.2, in for Daily Buzz) is a screen in the shell (audit v4 N2): nav 'daily',
     #/daily, the top bar and tabs around a full-height stage, Back to Play. games-daily.js is lazy (the
     `daily` group brings it and the whole corpus the day's word is picked from) and draws into #db-host
     after each render. A tap here is a gesture, so the word is said as the board appears. */
  openDailyBee:(arg)=>{ clearGTimer(); try{ if(window.SB_DAILY&&SB_DAILY.close) SB_DAILY.close(); }catch(e){} state.game=null; state.dbeeSpeak=arg==='route'?0:1;
    lazyNeed('daily'); app.setNav('daily'); },
  openDaily:()=>app.openDailyBee(),   /* the old name: every door that opened Daily Buzz opens Daily Bee */
  /* DAILY BUZZ, back as it was (owner, 5 Oct 2026: "come back as it was", its own card): nav 'dailybuzz', #/buzz,
     the page head and the board under it. daily-buzz.js is lazy (boot-lazy group 'buzz'); render() mounts it. */
  /* THE ANALOGIES TAB (owner, 9 Oct 2026): analogy.js + analogy-data.js, lazy group 'analogy'; #/analogies,
     #/analogies/<region|stop>[/learn|/words], #/analogies/clock; Mock Analogy Bee is #/anlbee */
  /* while the files load the tab shows its loader; when they land, the screen opens ONLY if the child is still
     waiting on it — a late load must never pull a child back from wherever they went in the meantime */
  /* THE ANALOGY GATE (anlOpen, above NAV_TABS): until the content is released, or in tester mode, each door lands on
     Home (the Link Finder on the Library) and fetches nothing — a typed address goes through these same doors */
  openAnalogies:(sub)=>{ if(!anlOpen()){ app.setNav('home'); return; }
    clearGTimer(); state.game=null; const parts=String(sub||'').split('/').filter(Boolean), late=!window.SB_ANL;
    if(late) app.setNav('analogy');
    lazyNeed('analogy', ()=>{ if(late && state.nav!=='analogy') return; try{ if(window.SB_ANL) SB_ANL.openRoute(parts); }catch(e){} }); },
  /* the Library's Link Finder (owner, 10 Oct 2026), the same lazy group; #/links, #/links/<word> */
  openAnlTool:(w)=>{ if(!anlOpen()){ app.setNav('explore'); return; }
    clearGTimer(); state.game=null; const late=!window.SB_ANL; const word=(typeof w==='string'&&/^[a-z][a-z\- ]*$/i.test(w))?w:null;
    if(late) app.setNav('anltool');
    lazyNeed('analogy', ()=>{ if(late && state.nav!=='anltool') return; try{ if(window.SB_ANL) SB_ANL.openTool(word); }catch(e){} }); },
  /* Mock Analogy Bee seats Mock Bee's own cast (MOCKBEE.rivals, owner 10 Oct 2026), so its door brings that file too */
  openAnlBee:()=>{ if(!anlOpen()){ app.setNav('home'); return; }
    clearGTimer(); state.game=null; const late=!(window.SB_ANL&&window.MOCKBEE);
    if(late) app.setNav('anlbee');
    lazyNeed(['analogy','mockbee'], ()=>{ if(late && state.nav!=='anlbee') return; try{ if(window.SB_ANL) SB_ANL.openBee(); }catch(e){} }); },
  /* TESTER MODE (see the analogy gate above NAV_TABS): the grown-up's switch in Settings → Testing tools, behind the
     PIN; ?tester=1 reaches testerSet through family-shell.js only after the PIN. Kept on this device (store key
     'tester'), like the testing unlock. Switching it off is never gated. */
  toggleTester:()=>{ if(state.tester){ app.testerSet(false); return; } pinGate(()=>app.testerSet(true),'Testing tools — grown-ups only'); },
  testerSet:(on)=>{ state.tester=!!on; try{ SB_STORE.set('tester',on?'1':'0'); }catch(e){}
    _placeIdx=null;   // search's places list the Play cards a child can reach
    try{ if(window.SB_FEED&&SB_FEED.reset) SB_FEED.reset(); }catch(e){}
    flash(on?'Tester mode on — content still under review is open on this device':'Tester mode off'); render(); },
  openDailyBuzz:()=>{ clearGTimer(); try{ if(window.SB_DAILY_BUZZ&&SB_DAILY_BUZZ.close) SB_DAILY_BUZZ.close(); }catch(e){} state.game=null;
    lazyNeed('buzz', ()=>{ if(state.nav==='dailybuzz') render(); }); app.setNav('dailybuzz'); },
  /* WORD FORGE (games spec §5.1), a screen in the shell like Daily Buzz: nav 'forge', #/forge. Its table is
     cited data the OWNER signs off — until SB_FORGE.signedOff the door stays shut (a typed address lands on
     Play), except in testing mode, which opens it for review. forge.js draws into #fg-host after render. */
  openForge:()=>{ clearGTimer(); lazyNeed('forge', ()=>{
      const ok=!!((window.SB_FORGE&&SB_FORGE.signedOff)||testerOn());
      if(!ok){ app.openGames(); return; }
      state.game=null; app.setNav('forge'); }); },
  /* THE SPELLING GYM (games spec §4.2): one hub for the drills, its own lazy file (gym.js, boot-lazy
     group 'gym'). The door shows the screen at once and hands over when the file is in; mode is one
     of gym.js's MODES ('warmup', 'sprint', …) or nothing for the hub. #/gym and #/gym/<mode> land here. */
  openGym:(mode)=>{ clearGTimer(); state.game=null; state.gymMode=mode||null;
    if(window.SB_GYM){ SB_GYM.open(mode); return; }
    set({nav:'gym', screen:'app'}); lazyNeed('gym', ()=>{ if(window.SB_GYM && state.nav==='gym') SB_GYM.open(state.gymMode); }); },

  // ----- Word Lore + Hive Mind (lore.js, lazy group `quizhubs`; games spec §4.3/§4.4) -----
  /* Bee Trivia split in two (owner decision 3). boot-lazy's DOORS hold these until lore.js is in,
     so a tap or an address that arrives first simply runs when it lands. */
  openLore:(mode)=>{ clearGTimer(); if(window.SB_QHUB) SB_QHUB.open('lore', mode||null); },
  openHive:(mode)=>{ clearGTimer(); if(window.SB_QHUB) SB_QHUB.open('hive', mode||null); },
  /* the old Bee Trivia door: word themes go to Word Lore, everything else to Hive Mind */
  openTrivia:(th)=>{ const w={wroots:1,wbreak:1,wstories:1,eponyms:1,words:1,wmeaning:1}; if(typeof th==='string'&&w[th]) app.openLore(th==='wmeaning'?'meanings':'roots'); else app.openHive(); },
  // ----- Bee Trivia (window.STV) — unreachable now; kept for the trivia bank's leak checks -----
  trvTh:(a)=>{ if(window.STV) STV.setTh(a); },
  trvLv:(a)=>{ if(window.STV) STV.setLv(a); },
  trvQuiz:()=>{ if(window.STV) STV.startQuiz(); },
  trvSquare:()=>{ if(window.STV) STV.startSquare(); },
  trvClock:()=>{ if(window.STV) STV.startClock(); },
  trvPick:(a)=>{ if(window.STV) STV.pick(a); }, trvNext:()=>{ if(window.STV&&STV.next) STV.next(); },
  trvCell:(a)=>{ if(window.STV) STV.cell(a); },
  trvHear:()=>{ if(window.STV) STV.hear(); },
  trvExit:()=>{ if(window.STV) STV.exit(); },
  /* Boss Battle used to be reached from the Spelling Quest season map; it is a
     plain Arcade fight now. The rest of the sq* actions went out with the game. */
  sqBoss:()=>{ try{ clearInterval((state.sq||{}).timer); }catch(e){} state.sq=null; state.nav='games'; app.playGame('boss'); },









  /* The Store is gone: it sold avatars, worlds and concepts that already had a home,
     so the buy button now sits on the thing itself. openShop survives only as a
     redirect, so old entry points (deep links, the drawer) land somewhere sensible
     instead of a blank screen. */
  /* THE SHOP (FIX-BEE v2): Avatars · Worlds · Extras · Grand Prix, then the wallet history. From ☰ and the coin chip. */
  openShop:(tab)=>{ state.walletOpen=false; state.drawerOpen=false; state.shopTab=({avatars:1,worlds:1,extras:1,race:1})[tab]?tab:(state.shopTab||'avatars'); set({nav:'shop', screen:'app', conceptSel:null}); },

  openWallet:()=>{ state.drawerOpen=false; try{ walletSync(active()); }catch(e){} set({walletOpen:true}); },
  closeWallet:()=>set({walletOpen:false}),


  celebrateLore:(n)=>{ state.celebrate=null; app.openLesson(n); },
  celebrateNextSet:()=>{ state.celebrate=null; newCoachBatch(); state.luTab='practice'; state.status='idle'; state.typed=''; render(); setTimeout(speak,350); },
  celebrateBadges:()=>{ state.celebrate=null; app.setNav('collection'); },
  celebrateVocabAgain:()=>{ state.celebrate=null; app.vocabRestart(); },
  // Advance Today's tip — capped at 10 forward taps per day, resets at the day boundary
  nextTip:()=>{ const c=active(); if(!c) return; const day=dayNum(); if(c.tipDay!==day){ c.tipDay=day; c.tipStep=0; }
    if((c.tipStep||0)>=10){ flash('That’s all 10 tips for today — more tomorrow! 🐝'); return; }
    c.tipStep=(c.tipStep||0)+1; save(); render(); },







  /* The Coach explains; openCoach (nav 'coach') drills. Two different screens — keep the
     names apart. The rulebook is lazy, so ask for it and let the view re-render. */
  openCoachDesk:()=>{ try{ loadConcepts(); }catch(e){} try{ if(window.SB_LAZY) SB_LAZY.need('coach',()=>{ if(state.nav==='coachdesk') render(); }); }catch(e){}
    set({nav:'coachdesk', screen:'app', trapSel:null, conceptSel:null}); },


  openTraps:()=>{ try{ loadConcepts(); }catch(e){} set({nav:'traps', screen:'app', trapSel:null, conceptSel:null}); },
  // Worlds live in the Hive's Worlds tab now; this stays so old entry points still land.
  openWorlds:()=>{ state.collTab='worlds'; app.openCollection(); },
  openEvo:()=>set({nav:'evolution', screen:'app'}),
  openCollection:()=>set({nav:'collection', screen:'app'}),

  /* The ONE coin purchase in Bee: a Rare avatar in an open pack, at its printed price. No
     chance, no pack, no content — a cosmetic at a fixed price (FAMILY-STANDARD §1). */
  /* Buying is the ENGINE's (BZ_AVATARS.buy): a fixed printed price, through the family wallet, only
     when the card says "N coins" — its world open, and for a Legendary its milestone met. */
  buyAvatar:(id)=>{ const c=active(); const a=SB_AVATARS.byId[id]; if(!a||avOwned(c,id)) return;
    const s=avState(a,c); if(!s||s.state!=='buy'){ flash(s?s.say:'Not for sale'); return; }
    if(s.short){ flash(a.name+' is '+s.price+' Bizzing coins — '+s.short+' more to go.'); return; }
    if(!window.confirm('Buy '+a.name+' for '+s.price+' Bizzing coins? The price is fixed — this is exactly what you get.')) return;
    let ok=false;
    if(window.SB_DEMO){ ok=spendCoins(s.price,'avatar:'+id); }
    else { walletSync(c); ok=BZ_AVATARS.buy(BEE_APP, walletWho(c), { id:a.id, tier:SB_AVATARS.tierOf(a), pack:1, world:a.worldN||1, milestone:a.milestone }, avCtx(c)); try{ c.coins=BZ_WALLET.balance(walletWho(c)); }catch(e){} }
    if(!ok){ flash('That did not go through — nothing was spent.'); return; }
    avGive(c,id,1); c.avatar=id; save(); sfx('win'); flash(a.name+' joined your collection!'); render();
    try{ app.showAvCard(id,{unlocked:true}); }catch(e){ burstConfetti(120); } },

  /* Selling is gone (FIX-BEE I3): it turned avatars back into coins at a rate no learning
     earned, and spares only ever existed because packs were a lottery. sellAvatar and
     sellDupes are deleted with the packs; a spare a child already holds stays harmlessly
     in the count. */
  /* buyPack, packSkip, toggleOdds, packClose and packWear are deleted with the draw. A
     stale tap on an old "Open pack" lands on the Avatars tab, which says how each is won. */
  buyPack:()=>{ state.collTab='avatars'; app.openCollection(); },
  openShopAvatars:()=>app.openShop('avatars'),
  wearAv:(id)=>{ const c=active(); if(!avOwned(c,id)){ flash('Not collected yet'); return; } c.avatar=id; save(); sfx('correct'); render(); },


  drillTrap:(k)=>{ const ws=trapWords(k); if(!ws.length){ flash('No words for this trap right now'); return; }
    state.sessionWords=ws; state.sessionListKey='__trap__'; state.sessionLabel='Trap drill'; state.gi=0; state.coachSession=false; state.trainBack='home'; app.startTrain(); },


  toggleSound:()=>{ set({sound:!state.sound}); try{ SB_STORE.set('sound',state.sound?'1':'0'); }catch(e){} if(state.sound) sfx('coin'); },
  /* ---- Settings §5 controls (FIX-BEE v2) ---- */
  toggleMusic:()=>{ try{ if(window.SB_VOL) SB_VOL.setMusic(!SB_VOL.musicOn()); }catch(e){} render(); },
  setVolume:(v)=>{ try{ if(window.SB_VOL) SB_VOL.set(+v); }catch(e){} render(); },
  muteAll:()=>{ try{ if(window.SB_VOL) SB_VOL.setMuted(!SB_VOL.muted()); }catch(e){} state.drawerOpen=false; render();
    try{ flash(SB_VOL.muted()?'Sound off — tap again to bring it back':'Sound on'); }catch(e){} },
  setModePref:(m)=>{ m=({light:1,white:1,dusk:1,auto:1})[m]?m:'light'; state.modePref=m; state.mode=effectiveMode(m); save(); render(); },
  setOpenCollection:()=>{ app.closeSettings(); state.collTab='avatars'; app.openCollection(); },
  setSwitchChild:(i)=>{ app.closeSettings(); try{ SB_SHELL.switchChild(+i); }catch(e){} },
  setOpenShopWorld:(id)=>{ app.closeSettings(); app.openShop('worlds'); },
  setGrownOpen:()=>pinGate(()=>{ state._setGrown=true; render(); },'Grown-ups settings'),
  /* the 6-second world splash on app open — a device switch (SB_STORE 'splash'), because the
     splash runs from an inline script long before this file has parsed */
  toggleSplash:()=>{ let on=false; try{ on=SB_STORE.get('splash')==='1'; }catch(e){}
    try{ SB_STORE.set('splash',on?'0':'1'); }catch(e){}
    flash(on?'Opening splash off — straight to the app':'✨ Opening splash on — see you at the next launch'); render(); },
  toggleFocus:()=>{ clearTimeout(app._modeT); try{ if(window.SB_W4_FOCUS){ const on=SB_W4_FOCUS.toggle(); flash(on?'Focus on — music off, world held still':'Focus off — the world wakes up'); } }catch(e){} render(); },
  devTap:()=>{ state._devTaps=(state._devTaps||0)+1;
    if(state._devTaps>=7){ state._devTaps=0; state.devReveal=!state.devReveal; flash(state.devReveal?'🛠 Testing tools revealed':'🛠 Testing tools hidden'); render(); } },
  toggleDevUnlock:()=>{ pinGate(()=>{
      const on=!state.devUnlock; state.devUnlock=on; state.premium=on?true:false;
      try{SB_STORE.set('devunlock',on?'1':'0');}catch(e){}
      if(!on) devCoinsOff();                       // leaving testing always hands the real purse back
      save(); flash(on?'🔓 All features unlocked for testing':'🔒 Locked features restored'); render();
    },'Testing tools — grown-ups only'); },
  // Test coins are a SEPARATE switch and are never real: the true balance is banked while they
  // are on and restored the moment they go off (or testing mode ends).
  toggleDevCoins:()=>{ pinGate(()=>{
      const c=active(); if(!c) return;
      /* Testing never rewrites the child (FIX-BEE M3, family standard §7): this switch can only
         hand a banked purse back now. "Unlock everything" opens the gates without touching it. */
      if(c.devCoins){ devCoinsOff(); flash('🪙 Test coins removed — real balance restored'); }
      else { flash('Testing tools never change a child’s coins — Unlock everything opens the gates instead.'); }
      save(); render();
    },'Testing tools — grown-ups only'); },
  avLore:(id)=>app.showAvCard(id),   // legacy alias
  // Collectible trump card as a full-screen popup over the app.
  showAvCard:(id,opts)=>{ opts=opts||{}; if(typeof window.SB_AV_CARD_HTML!=='function') return;
    const c=active(); const owned=(typeof avOwned==='function')?avOwned(c,id):true; const wearing=c.avatar===id;
    const ov=document.createElement('div'); ov.className='avc-ov';
    const unlockBanner=opts.unlocked?'<div class="avc-unlock">✨ New card unlocked!</div>':'';
    /* an unowned card says, under the card, exactly how it is won (avRule) — FIX-BEE I3 */
    const _a=(window.SB_AVATARS&&SB_AVATARS.byId[id])||null; const _r=(!owned&&_a)?avRule(_a,c):null;
    const ruleHTML=_r?('<div class="avc-rule av-rule" style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-top:10px">'+lockChip(_r.kind==='milestone'?'learn':(_r.kind==='plan'?'plan':'learn'),_r.text)
      +(_r.price?'<button class="avc-use" data-avc-buy="'+id+'">Buy for '+_r.price+' Bizzing coins</button>':'')+'</div>'):'';
    const actions=owned?(wearing?'<span class="avc-worn">Wearing ✓</span>':'<button class="avc-use" data-avc-use="'+id+'">Wear this avatar</button>'):ruleHTML;
    ov.innerHTML='<div class="avc-wrap">'+unlockBanner+SB_AV_CARD_HTML(id,{owned})+actions+'<button class="avc-x" aria-label="Close">Close</button></div>';
    ov.onclick=e=>{ const useId=e.target.closest('[data-avc-use]'); if(useId){ app.wearAv(useId.getAttribute('data-avc-use')); ov.remove(); return; }
      const buyId=e.target.closest('[data-avc-buy]'); if(buyId){ ov.remove(); app.buyAvatar(buyId.getAttribute('data-avc-buy')); return; }
      if(e.target===ov||e.target.closest('.avc-x')) ov.remove(); };
    document.body.appendChild(ov);
    try{ if(opts.unlocked&&typeof burstConfetti==='function') burstConfetti(120); }catch(e){} },
  // Avatar deck: tapping the home avatar fans out every card you own as a stack you
  // can flip through (arrows / swipe / keyboard) and wear straight from the card.
  openAvDeck:(startId)=>{ if(typeof window.SB_AV_CARD_HTML!=='function'||!window.SB_AVATARS){ try{ app.showAvCard(startId); }catch(e){} return; }
    const c=active();
    const ids=SB_AVATARS.list.filter(a=>avOwned(c,a.id)&&typeof SB_AV_CARD==='function'&&SB_AV_CARD(a.id)).map(a=>a.id);
    if(!ids.length){ try{ app.showAvCard(startId||c.avatar); }catch(e){} return; }
    let idx=ids.indexOf(startId||c.avatar); if(idx<0) idx=0;
    const ov=document.createElement('div'); ov.className='avc-ov avdeck-ov';
    function paint(){ const id=ids[idx]; const cc=active(); const wearing=cc.avatar===id; const multi=ids.length>1;
      const nav=multi?'<button class="avd-nav avd-prev" data-avd="prev" aria-label="Previous card">‹</button><button class="avd-nav avd-next" data-avd="next" aria-label="Next card">›</button>':'';
      const count=multi?'<div class="avd-count">'+(idx+1)+' / '+ids.length+' owned</div>':'';
      const action=wearing?'<span class="avc-worn">Wearing ✓</span>':'<button class="avc-use" data-avd="wear">Wear this avatar</button>';
      ov.innerHTML='<div class="avdeck-stage">'
        +'<div class="avd-ghost avd-g3"></div><div class="avd-ghost avd-g2"></div><div class="avd-ghost avd-g1"></div>'
        +'<div class="avc-wrap avd-live">'+SB_AV_CARD_HTML(id,{owned:true})+'</div>'+nav+'</div>'
        +'<div class="avd-bar">'+count+action+'<button class="avc-x" data-avd="close">Close</button></div>'; }
    function go(n){ idx=(idx+n+ids.length)%ids.length; paint(); }
    function cleanup(){ document.removeEventListener('keydown',key); ov.remove(); }
    function key(e){ if(e.key==='ArrowLeft') go(-1); else if(e.key==='ArrowRight') go(1); else if(e.key==='Escape') cleanup(); }
    ov.onclick=e=>{ const t=e.target.closest('[data-avd]');
      if(t){ const a=t.getAttribute('data-avd');
        if(a==='prev') go(-1); else if(a==='next') go(1);
        else if(a==='wear'){ try{ app.wearAv(ids[idx]); }catch(_){}
          try{ if(typeof burstConfetti==='function') burstConfetti(90); }catch(_){} paint(); }
        else if(a==='close') cleanup(); return; }
      if(e.target===ov) cleanup(); };
    let sx=null; ov.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; },{passive:true});
    ov.addEventListener('touchend',e=>{ if(sx==null) return; const dx=e.changedTouches[0].clientX-sx; if(Math.abs(dx)>45) go(dx<0?1:-1); sx=null; },{passive:true});
    document.addEventListener('keydown',key); paint(); document.body.appendChild(ov); },
  playGame:(type)=>{ clearGTimer(); const c=active(); ensureLists(c); state.gInfo=false; state.typed='';
    c.gameDiff = gameDiffFor(c, type);           // this game's own level drives the word pick
    if(type==='buzz'){ const list=nextWords(null,10,{purpose:'drill'}); if(!list.length){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,right:0,ans:[],status:'idle'}; setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='beat'){ state.game={type:'beat',phase:'mode'}; set({nav:'games',screen:'app'}); return; }
    else if(type==='wordquiz'){ state.game={type:'wordquiz',phase:'pick'}; set({nav:'games',screen:'app'}); return; }
    else if(type==='duel'){ const list=nextWords(null,10,{purpose:'drill'}); if(list.length<5){ flash('No words yet — try a list first'); return; }
      state.game={type,list:list.slice(0,10),phase:'setup',p:[{name:c.name||'Player 1',right:0},{name:'Player 2',right:0}],turn:0,i:0,status:'play'}; state.typed=''; }
    else if(type==='boss'){ const list=nextWords(null,60,{purpose:'drill'}); if(list.length<3){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,hp:8,maxhp:8,lives:3,maxlives:3,right:0,status:'play',last:null}; setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='magic'){ magicNewBoard(); }
    else return;
    set({nav:'games', screen:'app'}); },
  /* data-arg is "type|key": set THIS game's difficulty, remember it, and re-render so the
     tile's pill row updates. Does not launch the game — Play does that. */
  setGameDiff:(arg)=>{ const c=active(); const [type,k]=String(arg).split('|');
    if(!k){ c.gameDiff=type; save(); render(); return; }     // legacy single-arg call
    if(window.SB_LEVEL) SB_LEVEL.set(type,k,c); c.gameDiffBy=c.gameDiffBy||{}; c.gameDiffBy[type]=k; c.gameDiff=k; save(); render(); },
  /* the §1.7 level chip (SB_LEVEL.chip): one tap steps Auto → Easy → Medium → Hard → Champ → Auto */
  levelChip:(key)=>{ if(!window.SB_LEVEL||!key) return; SB_LEVEL.set(key, SB_LEVEL.next(key)); render(); },
  /* "Ready for Hard?" — the offer two rounds at 80% make (data-arg "<key>|<level>") */
  levelUp:(arg)=>{ const [key,lv]=String(arg||'').split('|'); if(!window.SB_LEVEL||!key||!SB_LEVEL.LABEL[lv]) return; SB_LEVEL.set(key,lv); flash('Level '+SB_LEVEL.LABEL[lv]+' it is.'); render(); },


  arcadePlay:(k,extra)=>{
    extra=extra||{};
    const g=(window.SB_ARCADE_GAMES||[]).find(x=>x.k===k); if(!g) return;
    const engs=window.SB_SAGA_ENGINES;   // saga2.js is a direct boot script, so this is present
    if(!engs||!engs[k]){ flash('Games are still loading — one moment'); return; }
    const c=active(); ensureLists(c);
    /* The engines key their internal config by easy/medium/hard/champ and were never
       handed 'auto' — the saga only ever passed the four concrete levels. So resolve
       'auto' (this tile's default) to a concrete level from the speller's band before
       the engine sees it, or CFG['auto'].time throws. The word pool is happy with the
       resolved level too. */
    const pick=gameDiffFor(c,k);
    const band=(function(){ try{ return beeBand(c).band; }catch(e){ return 4; } })();
    const eDiff = pick!=='auto' ? pick : (band<=3?'easy':band<=6?'medium':band<=8?'hard':'champ');
    c.gameDiff=eDiff; clearGTimer(); arcadeClose();
    const el=document.createElement('div'); el.className='arc-play'; _arcEl=el;
    const heroAvId=extra.hero||((c.arcGame&&c.arcGame[k]&&c.arcGame[k].av))||c.avatar||'bizzy';
    const avChip=(()=>{ try{ return '<span class="arc-play-av">'+(SB_AVATAR(heroAvId,26)||'')+'</span>'; }catch(e){ return ''; } })();
    el.innerHTML='<div class="arc-play-top">'
      +'<button class="arc-play-back" id="arc-back">← Arcade</button>'
      +'<span class="arc-play-name">'+esc(g.n)+'</span>'+avChip
      +'<span class="arc-play-diff">'+(_arcDiffLabel[pick]||'')+'</span></div>'
      +'<div class="arc-play-host" id="arc-host"></div>';
    document.body.appendChild(el);
    /* the overlay has an address (#/play/grandprix …, games spec T9): the router reads it off
       data-route, and ← Arcade steps back over it so Back does not reopen the game */
    try{ const r=window.SB_SHELL&&SB_SHELL.playRoute&&SB_SHELL.playRoute(k); if(r){ el.setAttribute('data-route',r); SB_SHELL.sync(); } }catch(e){}
    el.querySelector('#arc-back').onclick=arcadeLeave;
    const host=el.querySelector('#arc-host');
    /* P6: the engine draws its own clue and end card; say them as they change */
    try{ let lt=0; const mo=new MutationObserver(()=>{ if(!lt) lt=setTimeout(()=>{ lt=0; liveScanArc(host); },160); });   /* throttled, not debounced: a HUD ticking every frame must not starve it */
      mo.observe(el,{subtree:true,childList:true,characterData:true}); el._liveMo=mo; _liveSaid=''; }catch(e){}
    const onUnlock=()=>{};   /* a stage reached inside a game pays nothing extra — its words paid as they were spelled */
    g._e0=earnedSoFar();
    // one round = one word log, so the result card reports this play and not the last one
    try{ if(window.SB_WORDLOG) SB_WORDLOG.reset(); }catch(e){}
    const done=(res)=>{ _arcHandle=null; arcadeResult(g, res||{}); };
    const gopts=extra.opts||((c.arcGame&&c.arcGame[k]&&c.arcGame[k].opts))||{};
    // no tint: karts/heroes carry their own colours (a leftover saved arcColour used to
    // wash the kart sprite oddly). A menu-chosen world overrides the tile's default.
    try{ _arcHandle=engs[k](host, {diff:eDiff, world:gopts.world||g.w, onUnlock, hero:heroAvId,
        kart:gopts.kart, scene:gopts.scene, drive:gopts.drive, layout:gopts.layout, style:gopts.style, autoGo:!!extra.fromMenu}, done); }
    catch(e){ try{ console.error(e); }catch(_){} flash('Could not start that game'); arcadeClose(); }
    // launched from the start menu → skip the engine's own how-to gate (the menu explained it)
    if(extra.fromMenu){ setTimeout(()=>{ try{ const go=host.querySelector('#sg-howgo'); if(go) go.click(); }catch(_){}} , 90); }
  },
  /* Bizzillionaire is Word Lore's Ladder now (games spec §4.3): twelve honeycomb rungs, no cash. */
  openBizz:()=>app.openLore('ladder'),
  champTen:()=>{ const c=active(); const keep=c.gameDiff; c.gameDiff='champ';
    const list=nextWords(null,10,{purpose:'drill'}); c.gameDiff=keep;
    if(list.length<3){ flash('Not enough champ words yet — play a little first'); return; }
    state.game={type:'buzz',list,i:0,right:0,ans:[],status:'idle'};
    set({nav:'games', screen:'app'}); setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[0]) say(state.game.list[0].w); },320); },




  gSay:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w); },

  gSayQ:()=>{ const g=state.game; const q=g&&g.qs&&g.qs[g.i]; mcSpeak(q); },
  /* E6: graduated hints on the item in front of the child — 1 the meaning and a sentence, 2 how many
     letters and beats, 3 the first letter. Never the word. A new word starts again at none. */
  gInfoToggle:()=>set({gInfo:((state.gInfo|0)+1)%4}),



  gPick:(idx)=>{ const g=state.game; if(!g||!g.qs||g.picked!=null) return; idx=+idx; const q=g.qs[g.i]; q._i0=g.i; g.picked=idx; const ok=q.choices[idx]===q.answer; logGameWord(nkey(q.word));
    const spellingGame = ['origin','idiom','simile2','vocab'].indexOf(q.kind)<0; // knowledge rounds don't count as spelling mastery
    logBand(q.wordObj||q.word, ok, spellingGame?0.5:0);
    if(ok){ g.right++; payG(g); gainXp(); if(spellingGame){ markMastered(nkey(q.word),'mc'); clearMiss(q.word); } sfx('correct'); }
    else { sfx('wrong'); if(spellingGame && q.wordObj){ addMiss(q.wordObj); (g.miss=g.miss||[]).push(q.word); } try{ say(q.word); }catch(e){} }
    if(!g.rw) g.rw=[]; g.rw.push({w:q.word, ok});
    /* right moves on by itself; a miss HOLDS under the answer until Next (FIX-BEE D3) */
    g.mcGo=()=>{ const G=state.game; if(!G||G!==g||G.picked==null) return; G.mcGo=null; if(G.i+1<G.qs.length){ G.i++; G.picked=null; render(); mcSpeak(G.qs[G.i]); } else { gFinishMC(); } };
    render();
    if(ok) setTimeout(()=>{ if(g.mcGo&&state.game===g&&g.i===q._i0) g.mcGo(); }, 950); },
  gMcNext:()=>{ const g=state.game; if(g&&g.mcGo) g.mcGo(); },
  coachTab:(t)=>set({coachTab:t}),


  setCoachTarget:(key)=>{ const cat=coachCatalog().find(c=>c.key===key); state.coachTargetKey=key; state.coachTargetLabel=cat?cat.label:key; if(cat) flash('Target list set: '+cat.label); else render(); },
  coachRec:()=>{ const k=coachPhase().key; if(k==='breadth') app.coachStudy(); else if(k==='depth') app.coachWeakDrill(); else if(k==='sim') app.startWritten(); },
  say:(w)=>say(w),
  /* the alternate pronunciation: a Google-TTS clip at voice/ap/<slug>.mp3 when one has
     been generated (the Audio wrapper in voice-cdn.js resolves it on Pages), otherwise
     the device voice reads the speakable respelling from SB_ALT_PRON */
  sayAlt:(word)=>{ const a=altPron(word); if(!a) return;
    // Same double-fire as deviceSpeak: `error` and the play() rejection both arrive.
    let said=false;
    const fallback=()=>{ if(said) return; said=true;
      try{ window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter(a.s||word,0.88)); }catch(e){} };
    try{ const slug=String(word).toLowerCase().replace(/[^a-z0-9]/g,'-');
      const au=new Audio('voice/ap/'+slug+'.mp3');
      au.onerror=fallback; au.play().catch(fallback);
    }catch(e){ fallback(); } },
  /* ===== Advanced Mode (window.ADV, advanced.js) ===== */
  openAdvanced:()=>{ if(!window.ADV) return; lazyNeed('advanced');
    /* T3: the Advanced Pack's sales page is a grown-up's screen. A child who owns the pack walks
       straight in; anyone else meets the PIN first, so no sales page draws on a child's screen. */
    if(!advModeOn(active()) && !state._advPinOk){ pinGate(()=>{ state._advPinOk=true; app.openAdvanced(); state._advPinOk=false; },'The Advanced Pack — grown-ups only'); return; }
    ADV.open();
    if(state.advView!=='gate' && !window.SB_FULL) loadFullLibrary(()=>{ try{ render(); }catch(e){} }); },
  /* the Advanced Pack's mock rounds live in the Mock Bee now (games spec §3.1: Champ absorbs them) */
  advGo:(v)=>{ if(v==='mock'&&typeof app.mbOpen==='function'){ app.mbOpen('champ'); return; } if(window.ADV) ADV.go(v); },
  /* ◆ advanced rounds inside the ordinary Arcade pickers (no separate Advanced Games room) */
  arcAdvDict:()=>{ if(!window.ADV||!advModeOn()) return; app.openAdvanced(); ADV.dictStart(); },
  advConcept:(i)=>{ if(window.ADV) ADV.openConcept(i); },
  /* Deep links from the ordinary hubs straight into an Advanced Mode segment. ADV.open()
     first so the module owns nav and the full library starts loading, then jump. */
  /* Advanced features have no hub — each is opened from the ordinary workflow that owns it
     and returns there. ADV_HOME records which one, so Back is never a dead end. */
  advJump:(seg)=>{ if(!window.ADV) return; app.openAdvanced();
    // openAdvanced() lands on the gate when the pack is not active; do not jump past it
    if(ADV.active&&!ADV.active()) return;
    const ADV_HOME={concepts:'explore',tips:'explore',mock:'explore',games:'games',ucj:'coach'};
    state.advHome=ADV_HOME[seg]||'explore';
    ADV.go(seg); },

  /* Train the advanced journey through the ordinary shell, which is what gives it the
     Practice / Test / Revise / Vocab tabs and word cards. */
  /* Locked: show the Advanced Pack's offer. ADV.open() renders its own gate screen when
     the pack is not owned, so it is the offer, not a way in. */
  ultraUpsell:()=>{
    // openAdvanced bails when ADV is not loaded yet — which is the common case on a first
    // tap, since the module is lazy. Pull it in, then open its gate; fall back to the
    // plan sheet if it will not come.
    if(window.ADV) return app.openAdvanced();
    lazyNeed('advanced', ()=>{ if(window.ADV){ try{ app.openAdvanced(); }catch(e){} }
      else { try{ openUpsell('advanced','The Ultra Champions Journey'); }catch(e){} } }); },

  openAdvConcepts:()=>app.advJump('concepts'),

  openAdvMock:()=>app.advJump('mock'),
  openAdvGames:()=>app.advJump('games'),
  /* Turn the pack on or off. Off clears the announce flag too, so switching it back on
     re-fires the one-line confirmation rather than silently changing five screens. */
  toggleAdvPack:()=>{ const c=active(); if(!c) return;
    if(advModeOn(c)){ c.addons=c.addons||{}; delete c.addons.advanced; c.advOn=false; c.advPaid=false; c.advAnnounced=0;
      state.advView=null;
      if(state.nav==='adv') state.nav='home';
      save(); flash('Advanced Pack off'); render(); return; }
    c.addons=c.addons||{}; c.addons.advanced=1; c.advOn=true; save();
    try{ if(window.ADV&&ADV.activate) ADV.activate(); }catch(e){}
    render(); },
  
  advBack:()=>{ if(window.ADV) ADV.back(); },
  advExit:()=>{ if(window.ADV) ADV.exit(); },
  advBuy:()=>{ if(window.ADV) ADV.buy(); },
  advSize:(n)=>{ if(window.ADV) ADV.setSize(n); },
  advDay:(n)=>{ if(window.ADV) ADV.setDay(n); },
  advStartSprint:()=>{ if(window.ADV) ADV.startSprint(); },
  advScanMark:(v)=>{ if(window.ADV) ADV.scanMark(String(v)==='1'); },
  advDrillSubmit:()=>{ if(window.ADV) ADV.drillSubmit(); },
  advSayCur:()=>{ if(window.ADV) ADV.sayCur(); },
  advSaySlow:()=>{ if(window.ADV) ADV.saySlow(); },
  advSayW:(w)=>{ if(w) say(w); },
  advSayCurList:()=>{ const g=state.adv; if(!g||!g.list) return; const w=g.list[g.i]; if(w) say(w.w); },
  advMockPick:(k)=>{ if(window.ADV) ADV.mockPick(k); },
  advMockSubmit:()=>{ if(window.ADV) ADV.mockSubmit(); },
  advMockVocab:(i)=>{ if(window.ADV) ADV.mockPickVocab(+i); }, advMockVocabNext:()=>{ if(window.ADV&&ADV.mockVocabNext) ADV.mockVocabNext(); },
  advOpenTip:(i)=>{ if(window.ADV) ADV.openTip(+i); },
  advTipCat:(c)=>{ if(window.ADV) ADV.tipCat(c); },
  advDictStart:()=>{ if(window.ADV) ADV.dictStart(); },
  advDictSubmit:()=>{ if(window.ADV) ADV.dictSubmit(); },
  advKey:(e)=>{ if(e.key!=='Enter') return; e.preventDefault(); const v=state.advView;
    if(v==='sprint') app.advDrillSubmit();
    else if(v==='mock') app.advMockSubmit();
    else if(v==='dict') app.advDictSubmit(); },


  setAiPrompt:(v)=>{ state.aiPrompt=v; render(); },
  generateAiList:()=>{ const prompt=(state.aiPrompt||'').trim(); if(!prompt){ flash('Describe the list you want'); return; }
    if(!(window.claude && window.claude.complete)){ set({aiError:'AI is unavailable in this build. Use a target list, paste your own words, or pick an origin filter instead.'}); return; }
    set({aiLoading:true, aiError:''}); /* (online AI path omitted in offline build) */ },
  coachStudy:()=>{ const pool=sample(coachPool(), Math.min(state.coachGoal||15,15)); if(!pool.length){ flash('No words available'); return; } state.sessionWords=pool; state.sessionLabel='Coach study'; state.gi=0; state.coachSession=true; state.trainBack='coach'; app.startTrain(); },
  coachWeakDrill:()=>{ const list=coachWeakList(20); if(!list.length){ flash('No weak words yet — play a round first'); return; } state.sessionWords=list; state.sessionLabel='Weak-word drill'; state.gi=0; state.coachSession=true; state.trainBack='coach'; app.startTrain(); },


  // ===== Word Journeys (etymology lessons) =====
  /* Word Journeys opens for EVERY child. The tales a child earns — one per Stage cleared
     (loreCount) — are theirs on any plan, and the Story vault and a stage-cleared "Read →" both
     send them here. The whole screen used to sit behind gateFeature, which put the grown-up PIN
     in front of a child's own earned tales, and on #/journeys left that PIN standing over the
     screen beneath. The plan lock is per lesson now (journeyOpen): quiet on the card, and a tap
     on a locked one asks a grown-up, like every other plan lock. */
  openJourneys:()=>{ set({nav:'journeys', screen:'app', lessonSel:null, conceptSel:null, game:null, mood:'happy'}); },



  openLesson:(n)=>{ if(!journeyOpen(n)){ gateFeature('journeys','Word Journeys'); return; } const L=lessonsAll().find(x=>x.n===+n); if(!L) return; set({nav:'journeys', screen:'app', lessonSel:L, lessonWordsOpen:false, lessonGuided:(state.journeyView==='guided'), lessonStep:0}); try{window.scrollTo(0,0);}catch(e){} },




  lessonWordsToggle:()=>set({lessonWordsOpen:!state.lessonWordsOpen}),

  // ===== evolution-tile design feedback tool =====
  openEvoFeedback:()=>{ loadEvoFB(); set({nav:'evofeedback', screen:'app', evoSel:null, conceptSel:null, game:null}); },







  // written round
  startWritten:()=>{ const list=sample(coachPool(), Math.min(15,state.coachGoal||15)); if(!list.length){ flash('No words available'); return; } set({coachMode:'written', wr:{list,i:0,ans:[]}, typed:'', wrInfoKey:''}); setTimeout(()=>{ const w=list[0]; if(w) say(w.w); },300);
    setTimeout(()=>{ try{ document.querySelector('[data-fkey="typed"]')?.focus(); }catch(e){} },80); },





  // oral
  startOral:()=>{ const pool=sample(coachPool()); if(!pool.length){ flash('No words available'); return; } set({coachMode:'oral', or:{pool,i:0,round:0,last:null}, typed:'', orInfoKey:'', orFeedback:''}); setTimeout(()=>{ const w=pool[0]; if(w) say(w.w); },300); },

  
  




  // parent / settings / paywall
  addChild:()=>set({screen:'onboarding', onbStep:0, addingMore:true, draft:{name:'',age:9,avatar:'panda',goal:10}}),
  selectChild:(i)=>{ i=+i; if(i!==state.activeIdx && state.children[i]){ try{ SB_SHELL.bookOut(state.children[state.activeIdx]); SB_SHELL.bookIn(state.children[i]); }catch(e){} }
    state.activeIdx=i; const c=state.children[i]; ensureLists(c); state.theme=(c&&c.theme)||'spellbound'; state.parentLogOpen=null; state.sessionListKey=null; syncMissed(); render(); },
 closePaywall:()=>set({showPaywall:false}),
  pickPlan:(p)=>set({plan:p}), upgrade:()=>{ pinGate(()=>{ set({premium:true, showPaywall:false}); flash('Welcome to Premium! 👑'); },'Start free trial — grown-ups only'); },
  /* THE sign-out. There used to be two controls and neither was right: this one only
     returned to the landing screen (so "Sign out" was a lie), and the real one lived as a
     chip inside the account card, invisible unless a parent happened to be signed in — so
     a family playing offline had no sign-out at all. Calling it "Exit to the start screen"
     described the mechanism honestly and answered a question nobody asks. One button now,
     with the name everyone looks for: it signs the account out if there is one, and
     always returns to the start screen. */
  signOut:()=>{ try{ if(window.SB_AUTH && SB_AUTH.current && SB_AUTH.current()) SB_AUTH.signOut(); }catch(e){}
    set({screen:'landing', nav:'home', email:'', pw:''}); },
  celebrateClose:()=>set({celebrate:null}),
  setAgeMode:(m)=>{ const c=active(); c.ageMode=m; save(); render(); },
  setAgeBand:(k)=>{ const c=active(); if(setAgeBand(c,k)){ save(); render(); } },
  setLight:()=>app.setMode('light'), setWhite:()=>app.setMode('white'), setDusk:()=>app.setMode('dusk'),
  /* A tap cycles the look; a double-tap is focus. The cycle waits a beat so the two
     gestures cannot both fire off one double-tap. */
  cycleMode:()=>{ clearTimeout(app._modeT); app._modeT=setTimeout(()=>{ const o=['light','white','dusk']; app.setMode(o[(o.indexOf(state.mode)+1)%3]); },230); },
  profName:(v)=>{ const c=active(); c.name=(v||'').slice(0,24); save(); }, /* no per-key render (input keeps its own value) */
  /* Kept for old callers: still snaps to the band, so nothing stores a bare age. */
  profAge:(v)=>{ const c=active(); const n=parseInt(v,10); if(n>=5&&n<=18){ setAgeBand(c, bandForAge(n).k); save(); render(); } },
  profGoal:(v)=>{ const c=active(); c.goal=+v||10; save(); render(); flash('Daily goal set to '+c.goal+' words'); },
  // The three self-set daily targets behind the Home rings.
  setTgtApp:(v)=>{ const c=active(); c.tgt=c.tgt||{}; c.tgt.app=Math.max(1,Math.min(600,parseInt(v,10)||TGT_DEF.app)); save(); render(); },
  setTgtPrac:(v)=>{ const c=active(); c.tgt=c.tgt||{}; c.tgt.prac=Math.max(1,Math.min(600,parseInt(v,10)||TGT_DEF.prac)); save(); render(); },
  setTgtWords:(v)=>{ const c=active(); c.goal=Math.max(1,Math.min(500,parseInt(v,10)||10)); save(); render(); },


  profAvatar:(id)=>{ const c=active(); c.avatar=id; save(); render(); },
  profMsLabel:(v)=>{ const c=active(); if(c.milestone) c.milestone.label=(v||'').slice(0,30)||'the bee'; else c.milestone={ label:(v||'').slice(0,30)||'the bee', date:null }; save(); },
  profMsDate:(v)=>{ const c=active(); if(!v){ c.milestone=null; } else { c.milestone={ label:(c.milestone&&c.milestone.label)||'the bee', date:v }; } save(); render(); },
  landType:(v)=>{ state.landTyped=v; },
  landKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.landCheck(); } },
  /* The landing demo is a scored round of real entries, not one word on a loop.
     The point is the parent losing to their own child's word list — a claim about
     the library cannot do that, and thirty seconds of trying can. */
  landSay:()=>{ const e=LAND_WORDS[state.landIdx||0]; if(e) try{ say(e.w); }catch(err){} },
  landNext:(gotIt)=>{ state.landAsked=(state.landAsked||0)+1;
    if(gotIt) state.landScore=(state.landScore||0)+1;
    state.landTyped=''; state.landIdx=(state.landIdx||0)+1; render();
    setTimeout(()=>{ state.landDone=false; state.landMiss=''; render(); }, 2000); },
  landCheck:()=>{ const e=LAND_WORDS[state.landIdx||0]; if(!e) return;
    const ok=(state.landTyped||'').trim().toLowerCase()===e.w;
    state.landDone=ok; state.landMiss=ok?'':e.w;
    try{ sfx(ok?'correct':'wrong'); if(ok) burstConfetti(90); }catch(err){}
    app.landNext(ok); },
  landSkip:()=>{ const e=LAND_WORDS[state.landIdx||0]; if(!e) return;
    state.landDone=false; state.landMiss=e.w; app.landNext(false); },
  landRestart:()=>{ state.landIdx=0; state.landScore=0; state.landAsked=0;
    state.landTyped=''; state.landDone=false; state.landMiss=''; render(); },
  devBannerHide:()=>{ state.devBannerOff=true; render(); },
  landBill:(k)=>{ state.landYearly=(k!=='month'); render(); },


  landPlans:()=>{ try{ const el=document.getElementById('land-plans');
    if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); return; } }catch(e){}
    render(); },
  /* Choosing a paid plan from the shop window still starts with an account —
     there is nobody to bill otherwise. The tier is remembered so the sign-up lands
     on the plan they picked instead of dropping them at the bottom of the ladder. */
  landPick:(id)=>{ state.landWant=id||'regional'; app.goSignup(); },
  bandUpClose:()=>set({bandUp:null}),
  voiceSetDevice:(v)=>{ VOICE.name=v||''; saveVoiceCfg(); loadVoices(); flash(VOICE.name?'Voice set ✨':'Using the best available voice'); },
  voiceTest:()=>{ say('Hi! I am your spelling buddy. Try this word: iridescent. The soap bubble had an iridescent shine.'); },
  noop:()=>{},
};
/* THE APP3 SPLIT'S STUBS (road to 4.5, P1.13 step 2). The actions of the screens that live in app3's lazy files
   (app3-library.js, app3-gym.js, app3-grownups.js, app3-games.js, app3-me.js, app3-tools.js, and app3-shared.js
   under them) are stubs here: a tap on one asks boot-lazy for its file (SCR_GROUP), and the file's
   Object.assign(app, {…}) replaces the stub before the call runs again — so the keyboard, data-act and every
   app.x() caller work unchanged, and a tap on a screen not yet loaded simply runs when its code lands.
   Add an action to a lazy screen: write it in that file's Object.assign AND name it here, in the file's line. */
const SCR_ACTS = {
  scrLib: 'openAdvTips openConceptChapter conceptChaptersBack onConceptSearch openBooks openBook addTheme openTheme ' +
    'themeBack themeTab themePractice figPage figTheme figWorld figQ figSay figType figTab vocSayCard ' +
    'vocSayWord vocSayQ vocNewSet vocCheck vocToggleHeat vocJump vocToggleWords vocSetupOpen vocSetTab ' +
    'qShuffle qFav qMeaning qWord qSetCat ttPlay ttShuffle ttSay ttRevise ttMark ttSetBand itSayWord itMode ' +
    'tyStart _tyArm tyTest tyTap tyExit bldNameCancel bldCreate bldName bldNameOpen b2Shuffle b2Tab b2Clear ' +
    'b2Pool b2OGrp b2TGrp b2WlMax b2WlMin b2Size b2Sec b2Tog finderQ finderCreateAdd finderName finderBack ' +
    'finderAddTo finderLoadFull journeySetView journeyPageNext journeyPagePrev lessonStepPrev lessonBack ' +
    'lessonStepNext lessonStepGo practiseLesson lvMore lvSearch closeListView lvSay lvY qWordSay qWordClose ' +
    'wohPractise wordCardSay wordCardClose deckGo deckSaySlow deckSay deckTog deckAll deckClose ttListClose ' +
    'ttGoCard',
  scrGym: 'printOpen openListView toggleHeat wordCard reviseNav primary trainKey toggleOrigin toggleSent toggleDef ' +
    'speakSlow speak exitTrain drillMisspelt restartSession tmReact cardSpeakSlow cardSpeak cardRestart ' +
    'cardToRevise cardToPractice luToggleWords luSetTab deckOpen startJourney vocabNext vocabSay vocabPick ' +
    'goPaywall printGo printClose printSet startRename cancelRename saveRename renameInput newBatch pickUltra ' +
    'openAdvJourney coachSetupOpen resumeList dockRemove pauseList dockMenu chStart chExit chSet champAdvance ' +
    'enrichCustom setCustomText setCoachGoal setCoachDate catGroup lockedList exitCoachMode orJudge orKey ' +
    'orInfoOrig orInfo orInfoSent orInfoDef orSaySlow orSay wrNext wrKey wrInfoOrig wrInfo wrInfoSent ' +
    'wrInfoDef wrSaySlow wrSay questPick fwCheck fwKey fwType fwSay fwDone ltSkip ltEnter _ltFinish ltKey ' +
    'ltType ltSay ltGo startLevelTest coachTipNext coachTrap openMetrics trapPick trapBack mastRecheck ' +
    'practiceRevisions revTab reviseHistoryAgain reviseComplete',
  scrShared: 'openChallenge selectList exitGame gSubmit gKey gReveal gSaySlow gMissGo vocSelectList vocDeck wqStart ' +
    'ttChapter reviseOne',
  scrMe: 'printAvCards collTab buyFrame wearFrame buyWorld shopTab buyItem wearItem hivePost',
  scrGames: 'gReplay beatStart magicBoard magicPick magicSubmit magicNext magicKey magicHear magicNew magicCell ' +
    'duelEnter duelKey duelType duelSay duelP2 duelBegin duelName playCard arcadeMenu',
  scrGrown: 'kudosSend kudosGrown ttChapterFrom ttList metricPick progHeatPick progHeat bkAskErase bkDownload bkEraseGo certPng cloudPush ' +
    'cloudNeed cloudRestore openCloud clearReports copyReports parentLogToggle reviseMisses moreTips ' +
    'printReport askDelSpeller delSpeller progTab buyAddon closeTiers chooseTier doSignIn doSignUp authPw ' +
    'authEmail authName closeAuth cloudAgree cloudAdd cloudOff closeCloud',
  scrTools: 'dbgSaga vtExport vtTab vtBad vtPlay vtOk evoExport evoSelect evoClearTile evoNote evoRate'
};
for (const g in SCR_ACTS) for (const k of SCR_ACTS[g].split(' ')) if (!(k in app)) app[k] = scrStub(g, k);
/* THE WORD ATLAS'S ACTIONS (P1.13 step 3): trail.js is lazy (boot-lazy `atlas`, with its curriculum) and registers these
   on app when it lands (app2.x = …); until then each is a stub that asks for the group and runs. A new trail.js action
   is added here too. */
const TRAIL_ACTS = 'openTrail trailUnit trailChk trailNextFrom trailPick trailShut openUltra trailTrain trailBack trailAct trailHere trailToMap trailLesson trailWords trailWordNav trailPractice atlasNext trailQuiz tqPick tqSpell tqSay tqNext tqRevise tqInput ultraAct ultraPick ultraSteps ultraTrain uqType uqKey uqSay uqClose uqGo uqNext uDuel uGate uWisp atlasAdvDoor mwWander mwPoke mwHero mwLmk kitPick kitTile kitReset trailTre treClose treGame treLore treTrivAns villType villKey villSay villFlee villGo atlasMusic atlasZoom hallOpen teamOpen circuitOpen visitorOpen';
for (const k of TRAIL_ACTS.split(' ')) if (!(k in app)) app[k] = scrStub('atlas', k);

/* ===================================================================== */
/*  View — builds the HTML for the current state                          */
/* ===================================================================== */
const diffMap = { easy:['Easy','#1f9d57'], medium:['Medium','#c08a00'], hard:['Hard','#d63a3a'] };
const diffStyleFor = (d) => 'padding:3px 9px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;background:'+(diffMap[d]||diffMap.medium)[1];
const seg = (on) => 'padding:7px 15px;border-radius:999px;font-weight:800;font-size:13px;transition:.2s;'+(on?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)');
const chip = (on) => 'padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line);transition:.2s;'+(on?'background:var(--accent);color:#fff;border-color:transparent':'background:var(--surface2);color:var(--text)');

function view(){
  const S = state;
  if(S.screen==='admin') return viewAdmin();
  if(S.screen==='landing') return viewLanding();
  if(S.screen==='auth') return viewAuth();
  if(S.screen==='onboarding') return viewOnboarding();
  return viewApp();
}

/* ============================================================================
   THE LANDING PAGE — the shop window, and the only screen a stranger ever sees.

   It follows the order the brand platform sets out, which is not the order a
   feature list would suggest:

     1. Lead with the outcome the parent already wants — Why Spell.
     2. Then answer the objection they have NOT said out loud: "they'll use it
        twice and stop." Every competitor loses here.
     3. Then remove the risk: offline, parent-only account, no ads, no strangers,
        and nothing that can be bought through.
     4. Then show the evidence — their own child spelling a word they cannot.

   Two rules from the platform that are easy to break by accident:

   WRITE TO THE CHILD'S AMBITION, NOT THE PARENT'S ANXIETY. "Sound smart" is the
   wrong end of this idea; aimed carelessly it becomes status anxiety and a brand
   children do not want to be seen using. The honest version is about being
   understood and believed — power and agency, not performance.

   NEVER STATE A FIGURE THAT IS NOT IN THE BUILD. Every number on this page comes
   from SB_FACTS below, which was counted from the shipping build by
   qa/claims.cjs. Re-run it before any flight and update in one place. The brand
   deck's own figures were stale in six of thirteen cases and every one of them
   UNDERSTATED the product — 41,136 recorded words against 128,491 real clips,
   5,000 trivia questions against 31,159.
   ========================================================================== */

/* Counted from the shipping build 2026-08-08 by qa/claims.cjs — re-run and edit
   HERE, never inline in the copy, so a claim cannot drift from the product.
   Stated as "over" figures in the copy, per the platform's own caution. */
/* Where the book series is published. It is a SEPARATE Pages site in a separate
   repo — this repo keeps only redirect stubs under books/ so old links still land.
   Change this one line to move the shelf (e.g. to https://books.bizzingbee.com/). */
const SB_BOOKS_URL = 'https://aayuvis.github.io/bizzing-bee-books/books/';

/* The shelf. One entry per published volume, in shelf order: the nineteen numbered
   books, then the four companions.

   THE THREE FIELDS ARE NOT INTERCHANGEABLE and this is the file where that bites.
   A volume's printed number, its file name and its art prefix disagree by design —
   volume 17 "Named After Someone" is book-17.html but carries b19 art, and the
   companions have no number at all. `s` is the FILE NAME, and it is the only one of
   the three that may ever be used to build a URL. It was read out of mkbooks.js
   (slugOf/artOf) rather than typed, and cross-checked against the redirect stubs in
   books/ — all 23 matched both ways.

   `a` is the volume's own accent colour, the same one its cover uses, so the drawn
   spine in app-art/spines/<s>.png and the real book agree on sight. The spine art
   carries NO lettering: the title below is real text over it, because an image model
   spells badly and this is a spelling app. */
/* Each spine's MEASURED width/height, written by voice/pipeline/spine-art.py into
   app-art/spines/ratios.json and baked in here rather than fetched — this app has no
   build step and must work from file://, so a runtime fetch for 23 numbers would be
   both a request and a new failure mode.
   libShelf() sizes each title from its own spine's width. Without this the type was
   sized on title length alone, which ignored that a vertical line of letters cannot be
   thicker than the book it is printed on: on the narrowest spines the letters painted
   out over both edges onto the shelf behind. REGENERATE THIS BLOCK whenever the spine
   art changes. */
window.SB_SPINE_R = {
 'book-01': 0.2096,
 'book-02': 0.1808,
 'book-03': 0.1904,
 'book-04': 0.2115,
 'book-05': 0.1885,
 'book-06': 0.2135,
 'book-07': 0.1788,
 'book-08': 0.1865,
 'book-09': 0.2346,
 'book-10': 0.2115,
 'book-11': 0.2577,
 'book-12': 0.1962,
 'book-13': 0.1885,
 'book-14': 0.2096,
 'book-15': 0.1981,
 'book-16': 0.2135,
 'book-17': 0.2462,
 'book-18': 0.2038,
 'book-19': 0.2423,
 'book-champion': 0.1885,
 'book-lines': 0.2058,
 'book-quiz': 0.1846,
 'book-similes': 0.175
};

const SB_SHELF = [
  { s:'book-01', t:'Lift-Off!',              a:'#FFC23D' },
  { s:'book-02', t:'The Rulebook',           a:'#6C4FE0' },
  { s:'book-03', t:'Latin Launchers',        a:'#E06A3C' },
  { s:'book-04', t:'Greek Lightning',        a:'#2E8FB8' },
  { s:'book-05', t:'Endings That Win',       a:'#E8458C' },
  { s:'book-06', t:'Root Camp: Latin',       a:'#C08A3E' },
  { s:'book-07', t:'Root Camp: Greek',       a:'#13A892' },
  { s:'book-08', t:'The World Tour',         a:'#3E63D6' },
  { s:'book-09', t:'Subject Sprints',        a:'#F0A93C' },
  { s:'book-10', t:'Word Personalities',     a:'#B14FC4' },
  { s:'book-11', t:'The Playbook',           a:'#D6353F' },
  { s:'book-12', t:'Schwa Country',          a:'#7E8AA0' },
  { s:'book-13', t:'Letters Behaving Badly', a:'#B8562F' },
  { s:'book-14', t:'The Grand Trunk Road',   a:'#D97A1E' },
  { s:'book-15', t:'Far-Flung Words',        a:'#0E8A78' },
  { s:'book-16', t:'The Word Factory',       a:'#5B6BA8' },
  { s:'book-17', t:'Named After Someone',    a:'#C2586B' },
  { s:'book-18', t:"The Champion's Mind",    a:'#7C5CFF' },
  { s:'book-19', t:"The Champion's Method",  a:'#C8901B' },
  { s:'book-similes',  t:'As Busy as a Bee',      a:'#3DA85C', co:1 },
  { s:'book-champion', t:'Say It Like a Champion',a:'#7C3F9E', co:1 },
  { s:'book-lines',    t:'Lines Worth Keeping',   a:'#4A6FA5', co:1 },
  { s:'book-quiz',     t:'The Long Quiz',         a:'#B5893C', co:1 },
];
/* Warm the shelf art once, during idle time after boot: 23 spine PNGs, ~400KB,
   same-origin. By the time the child opens the Library the whole row is usually
   in cache and every book draws at once — Pages caps these at max-age=600, so a
   cold visit otherwise re-fetched them and the shelf filled in book by book. */
let _spinesWarm=false;
function warmSpines(){ if(_spinesWarm) return; _spinesWarm=true;
  try{ SB_SHELF.forEach(b=>{ const im=new Image(); im.decoding='async'; im.src='app-art/spines/'+b.s+'.png'; }); }catch(e){} }
/* FIX-BEE N2: no longer at boot. 23 PNGs (~360KB on the wire) were a quarter of a phone's
   first-screen budget, spent on a shelf that lives on another tab. They warm on the child's
   FIRST tap or key instead — the moment boot-lazy starts its own idle queue — and the
   service worker keeps them after that, so a second visit pays nothing. */
try{ const _warmGo=()=>{ ['pointerdown','keydown'].forEach(ev=>window.removeEventListener(ev,_warmGo,true));
    if('requestIdleCallback' in window) requestIdleCallback(warmSpines,{timeout:4000}); else setTimeout(warmSpines,600); };
  ['pointerdown','keydown'].forEach(ev=>window.addEventListener(ev,_warmGo,{capture:true,passive:true})); }catch(e){}

const SB_FACTS = {
  /* Figures for data the opening page never loads. Every count of something the page DOES
     hold — avatars, arcade games, evolution forms, trivia — is SB_COUNT's now (below), read
     from the live data; these are checked against their files by tests/one-count.cjs. */
  /* The LIBRARY and the VOICE are two claims and two numbers (CLAUDE.md, "The 130k
     library"): the library is every word a child can open — the 130k library after the QC
     strike lists and safeWord, with the championship shard and the served corpus — and the
     voice is the part of it that has a recorded clip (the shard ships none, and the clip
     manifest still lists words the sweeps have since struck, which no child can reach).
     Both are kept as the honest ROUND FLOOR, not the count: tests/word-bank.cjs measures the
     live library and its clips on every run and fails unless each is that count's floor —
     library to 5,000s (127,907 on 4 Oct 2026 → 125,000), voice to 1,000s (125,894 →
     125,000; it read "over 128,000" while only 125,894 of the words a child can reach had
     a clip). */
  library: 125000,
  voiced: 125000,
  core: 40979,          // the core graded library
  chapters: 31, acts: 6,   // legacy story counts; kept for any remaining references, no longer marketed
  scripps: 108,         // SB_SCRIPPS — national winning words, 1925-2026
  journeys: 100,        // Word Journeys lessons
  techniques: 36,       // SB_ADV_TIPS
  conceptsFree: 122, conceptsAdv: 43,
  vocab26: 997,         // NSF Vocabulary 2026
  ipa: 805, homophones: 1452,
  /* (road to 4.5, P0.21) three more the opening page used to TYPE — the Mock Bee's field, the
     Atlas's painted regions and the Grand Prix's power-ups — held to their files by
     tests/one-count.cjs §1. The first was false: no Mock Bee field has seated eleven since the
     games rebuild (4, 6 or 8 rivals by age band). */
  regions: 9,           // SB_TRAIL.honey.acts — the Word Atlas's painted regions (trail-data.js)
  mbRivals: 8,          // mockbee.js BANDS — rivals in the largest field (ages 11–15); it grows with age
  gpPowers: 6,          // saga2.js PWSVG — the Bee Grand Prix's power-ups
};
const sbFmt = n => n.toLocaleString('en-US');
/* "over 125,000", not "128,079" — a round FLOOR stays true as the library grows
   and, more to the point, as QC removes from it: the 5 Sep corpus sweep struck
   1,924 words and took the filtered library from 130,094 to 128,079. A claim
   pinned 79 words above the real number is one cleanup away from being false,
   and cannot be wrong by one clip in a screenshot six months from now. */
const sbOver = n => 'over ' + sbFmt(Math.floor(n / (n >= 10000 ? 1000 : 10)) * (n >= 10000 ? 1000 : 10));

/* ONE COUNT FOR EVERY COLLECTION (audit v4 H2/A2). The same collection used to print a
   different number on every screen: quotes 1,200 (typed on the Library tile) / 135 (the boot
   file, read before the library landed) / 5,189; trivia 31,147 / 6,604 / 12,462 (whatever
   shards happened to be in memory); idioms 2,350 / 2,370; and the opening page sold "211
   characters" against a catalogue of 96. Every screen asks SB_COUNT now, and SB_COUNT asks
   the live data:
     · held on the page → exact (avatars, arcade games, evolution forms);
     · arrives lazily → counted once it HAS arrived and not before: null means "print no
       number", never a partial one (quotes, idioms);
     · trivia is sharded by level and never wholly in memory, so it is a round FLOOR of the
       index the shards are held to (data-lint) — the same figure on every screen;
     · data the opening page never loads (the concept course, the champion words) prefers
       the live file when it is in and falls back to SB_FACTS, which tests/one-count.cjs
       holds equal to that file.
   Never type a count into copy: add a line here. tests/one-count.cjs loads the screens. */
const SB_COUNT = {
  avatars: () => { try { return SB_AVATARS.catalogue().length; } catch (e) { return 0; } },
  games: () => { try { return playCardsShown().filter(o => o.door !== 'compete').length; } catch (e) { return 0; } },   /* the Play tab's cards beside the mock bee (games spec §3.1) */
  /* worlds4.js registers three of the eight worlds and runs AFTER app3's first render: until it
     has (SB_W4), the honest count is "not yet", not five */
  worlds: () => { try { return window.SB_W4 ? THEMES.length : null; } catch (e) { return null; } },
  evoForms: () => { try { return window.SB_W4 ? THEMES.reduce((n, t) => n + ((EVO[t.id] || []).length), 0) : null; } catch (e) { return null; } },
  trivia: () => { try { const B = (window.SB_TRIVIA || {}).byLevel || {}; let n = 0; for (const k in B) n += (B[k] || 0); return n; } catch (e) { return 0; } },
  quotes: () => { try { return (window.SB_LAZY && SB_LAZY.ready('quotes')) ? (window.SB_QUOTES || []).length : null; } catch (e) { return null; } },
  idioms: () => (window.SB_FIG ? figPool().length : null),
  conceptsFree: () => (((window.SB_CONCEPTS || {}).chapters || []).length || SB_FACTS.conceptsFree),
  conceptsAdv: () => (((window.SB_ADV_CONCEPTS || {}).chapters || []).length || SB_FACTS.conceptsAdv),
  scripps: () => ((window.SB_SCRIPPS || []).length || SB_FACTS.scripps),
  journeys: () => ((((window.SB_LESSONS || {}).lessons) || []).length || SB_FACTS.journeys),
  techniques: () => ((window.SB_ADV_TIPS || []).length || SB_FACTS.techniques),
  /* the 130k library and its clips are never loaded to count them — see SB_FACTS */
  library: () => SB_FACTS.library,
  voiced: () => SB_FACTS.voiced,
  regions: () => ((((window.SB_TRAIL || window.SB_TRAIL_HOME || {}).honey || {}).acts || []).length || SB_FACTS.regions),
  mbRivals: () => SB_FACTS.mbRivals,
  mbSpellers: () => SB_FACTS.mbRivals + 1,          /* the rivals and the child */
  gpPowers: () => SB_FACTS.gpPowers,
  /* the book series as the Library's shelf holds it: numbered volumes, then the companions */
  books: () => SB_SHELF.filter(b => !b.co).length,
  companions: () => SB_SHELF.filter(b => b.co).length,
  /* the plans and the avatar engine are the only places these are decided (pricing.js, BZ_AVATARS) */
  graded: () => { try { return SB_TIERS.regional.ent.words; } catch (e) { return 0; } },
  tiers: () => { try { return Object.keys(BZ_AVATARS.TIERS).length; } catch (e) { return 0; } },
  freeWorlds: () => { try { return BZ_AVATARS.FREE_WORLDS; } catch (e) { return 0; } },
  worldPrice: () => { try { return BZ_AVATARS.WORLD_PRICE; } catch (e) { return 0; } },
  /* the opening page's own "Can you spell it?" round (LAND_WORDS), which the sample review counts */
  landN: () => LAND_WORDS.length, landHalf: () => Math.floor(LAND_WORDS.length / 2), landAlmost: () => LAND_WORDS.length - 1,
};
/* The rule a parent is told, in one place, from the engine's own constants — never typed:
   worlds 1–FREE_WORLDS free; the rest with the family plan or WORLD_PRICE coins the child
   EARNED; avatars free (Common) or a fixed coin price per tier, a Legendary after its milestone.
   `n` is null until worlds4.js has registered all eight (see SB_COUNT.worlds). */
function sbRule() { try { const T = BZ_AVATARS.TIERS; const p = k => (T[k] || {}).price;
    return { free: BZ_AVATARS.FREE_WORLDS, world: BZ_AVATARS.WORLD_PRICE, n: SB_COUNT.worlds(),
      names: Object.keys(T).map(k => T[k].label), rare: p('rare'), epic: p('epic'), legendary: p('legendary') }; } catch (e) { return null; } }
/* "Common, Rare, Epic and Legendary" */
function tierNames() { const r = sbRule(); if (!r) return ''; const a = r.names; return a.length > 1 ? a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1] : (a[0] || ''); }
/* How a count is PRINTED, so a floor reads the same everywhere: '' while a lazy one is on its
   way (say the sentence without a number), "over 31,000" for trivia, the exact figure else. */
const SB_FLOOR = { trivia: 1, library: 1, voiced: 1 };
/* A hub's name (games spec §3.3, owner to choose): SB_HUB_NAMES, never typed into copy here. */
function hubNameOf(k) { try { return (window.SB_HUB_NAMES && SB_HUB_NAMES[k]) || (window.SB_QHUB ? SB_QHUB.hubName(k) : ''); } catch (e) { return ''; } }
/* Word Lore's and Hive Mind's mode names, at boot, for the Play card's best line (playCardBest →
   SB_BESTS.top: "Best 8/10 · Roots"). lore.js (lazy) carries the same titles in its MODES. */
window.SB_HUB_MODES = window.SB_HUB_MODES || {};
SB_HUB_MODES.lore = { meanings: 'Meanings', roots: 'Roots', origins: 'Origins', idioms: 'Idioms & Similes', ladder: 'Ladder', squares: 'Squares', clock: 'Against the Clock' };
SB_HUB_MODES.hive = { classic: 'Classic', squares: 'Squares', clock: 'Against the Clock' };
function countTxt(k) { const n = SB_COUNT[k] ? SB_COUNT[k]() : null; if (!n) return '';
  return SB_FLOOR[k] ? sbOver(n) : sbFmt(n); }
/* the same, starting a sentence ("Over …") */
function countCap(k) { const t = countTxt(k); return t ? t.charAt(0).toUpperCase() + t.slice(1) : ''; }
/* the same, as a word for the start of a sentence ("Six arcade games") */
function countWord(k) { const n = SB_COUNT[k] ? SB_COUNT[k]() : 0;
  const W = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  return W[n] || countTxt(k); }

function landSection(kicker, title, lede, inner, opts) {
  opts = opts || {};
  return `<section style="padding:clamp(48px,8vw,96px) 0;${opts.style || ''}">
    <div style="max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,32px)">
      ${kicker ? `<div style="font-family:var(--ui);font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">${kicker}</div>` : ''}
      <h2 style="font-family:var(--display);font-weight:800;font-size:clamp(26px,4.4vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 ${lede ? '14px' : '28px'};max-width:18em">${title}</h2>
      ${lede ? `<p style="font-size:clamp(15px,1.9vw,18px);line-height:1.6;color:var(--muted);max-width:36em;margin:0 0 30px">${lede}</p>` : ''}
      ${inner}
    </div></section>`;
}

function viewLanding() {
  const S = state;

  /* ---- 1. HERO. The whole platform in one sentence, and the honest version of
       it: not "sound clever", but be understood at the moment it matters. ---- */
  const risk = [
    ['bolt', 'Works with no internet', 'On a plane, in a tunnel, in the car. The words live on the device.'],
    ['users', 'No account needed to start', 'Set up a speller on this device with a name and an age range — no email, no password. Your child never signs in to anything and never talks to anyone.'],
    ['close', 'No ads, no chat, no leaderboard', 'Nobody can reach your child inside this app. There is no one to reach.'],
    ['spark', 'Nothing can be bought through', 'Coins are earned by learning and buy looks. Every locked thing names the learning that opens it.'],
  ].map(([ic, t, b]) => `<div style="display:flex;gap:12px;align-items:flex-start">
      <span style="flex-shrink:0;width:34px;height:34px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(ic, 17)}</span>
      <span style="min-width:0"><span style="display:block;font-weight:800;font-size:14px;line-height:1.3">${t}</span>
      <span style="display:block;font-size:13px;color:var(--muted);line-height:1.45;margin-top:2px">${b}</span></span></div>`).join('');

  const hero = `<section style="padding:clamp(30px,6vw,64px) 0 clamp(40px,7vw,80px)">
    <div style="max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,32px)">
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:clamp(28px,5vw,60px);align-items:center">
        <div>
          <div style="font-family:var(--ui);font-weight:800;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:16px">Spelling · Vocabulary · Word origins · Ages 8–15</div>
          <h1 style="font-family:var(--display);font-weight:800;font-size:clamp(30px,5.4vw,54px);line-height:1.04;letter-spacing:-.025em;margin:0 0 18px">Spelling bee practice that speaks every word&nbsp;aloud.</h1>
          <p style="font-size:clamp(16px,2.1vw,19px);line-height:1.55;color:var(--muted);max-width:32em;margin:0 0 28px">One day your child spells a word you can&rsquo;t. Getting there takes months of practice they actually did — so this is a game where spelling is how you win, with every word spoken in a real recorded voice and the Greek and Latin roots that make an unfamiliar one solvable.</p>
          <div style="display:flex;flex-wrap:wrap;gap:11px;margin-bottom:14px">
            <button data-act="goSignup" style="padding:15px 26px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge),0 8px 22px color-mix(in srgb,var(--accent) 38%,transparent)">Start free — no sign-up →</button>
            <button data-act="landPlans" style="padding:15px 24px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">See the plans</button>
          </div>
          <span style="display:flex;flex-wrap:wrap;align-items:center;gap:6px 18px">
            <button data-act="goSignin" style="font-size:13.5px;font-weight:700;color:var(--muted);text-decoration:underline;text-underline-offset:3px">I already have an account</button>
            ${/* A5: the try-before-signup sample was reachable only by typing ?demo. It is a real link — a
                 new page load, because the sample's storage sandbox is installed before anything else runs */''}
            <a href="?demo" class="sb-land-demo" style="display:inline-flex;align-items:center;min-height:44px;font-size:13.5px;font-weight:700;color:var(--accent);text-decoration:underline;text-underline-offset:3px">Look around a sample speller first →</a>
          </span>
          ${(()=>{ let av=''; try{ const A=(window.SB_AVATARS&&SB_AVATARS.list)||[];
              const ids=['bizzy','pandasensei','lunastar','pixelpal','ember','papercrane','joystick','shadowninja'];
              const pick=ids.map(i=>A.find(a=>a.id===i)).filter(Boolean);
              const use=pick.length>=6?pick:A.slice(0,8);
              av=use.slice(0,8).map(a=>`<span title="${escA(a.name)}" style="width:46px;height:46px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);display:grid;place-items:center;overflow:hidden;flex-shrink:0"><span class="sb-onb-avart" style="width:82%;height:82%">${SB_AVATAR(a.id,40)}</span></span>`).join('');
            }catch(e){}
            return av ? `<div style="margin-top:22px">
              <div style="display:flex;gap:7px;flex-wrap:wrap;margin-bottom:8px">${av}</div>
              <div style="font-size:12.5px;font-weight:700;color:var(--muted)">${countTxt('avatars')} characters to collect — Commons free, the rest bought with coins your child earns by learning. Coins are never sold.</div></div>` : ''; })()}
        </div>
        ${landTry()}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:18px;margin-top:clamp(34px,6vw,58px);padding-top:clamp(26px,4vw,36px);border-top:1px solid var(--line)">${risk}</div>
    </div></section>`;

  /* ---- 2. THE OBJECTION. Concede that it looks like a game and win with it. ---- */
  /* SHOW THE GAMES, DO NOT LIST THEM. This section used to be six tiles of numbers,
     which is a specification, not an advertisement — and the app has fourteen painted
     worlds sitting in app-art that the landing page had never once used. A nine-year-old
     decides in about two seconds and they decide on pictures. The numbers still matter to
     the parent, so they stay, compressed into one strip beneath the art. */
  const games = [
    ['game-beeGrandPrix',   'Bee Grand Prix',   'A racer with {gpPowers:word} power-ups — each one unlocked by spelling.'],
    ['game-honeycombRun',   'Honeycomb Run',    'A maze through the hive. Spell a word to open every gate.'],
    ['game-typeBlaster',    'Type Blaster',     'A typing shooter. The words are your ammunition.'],
    ['game-keepFlying',     'Keep Flying',      'Fly, bank every honey pot, then home through the gates.'],
    ['game-wordSnake',      'Word Snake',       'The trail is a word — eat the letters in order and grow.'],
    ['game-unscrambleStars','Unscramble Stars', 'Pull the word back out of the scrambled constellation.'],
    ['game-spellScene',     'Spell Scene',      'Spell the word that finishes the scene.'],
  ].filter(([f]) => (window.SB_ARCADE_GAMES || []).some(g => 'game-' + g.k === f))   /* only games the arcade still has (Keep Flying was cut, FIX-BEE v2 G11) */
   .map(([f, name, hook], i) => `<figure style="margin:0;border-radius:16px;overflow:hidden;background:var(--bg2);border:1px solid var(--line);display:flex;flex-direction:column">
      <span style="position:relative;display:block;aspect-ratio:16/11;overflow:hidden;background:#241E33">
        <img data-lsrc="app-art/shots/${f}.webp" alt="${escA(name)} — gameplay from Bizzing Bee"
             loading="lazy" decoding="async"
             style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 40%;display:block">
      </span>
      <span style="padding:12px 13px 14px">
        <b style="display:block;font-family:var(--display);font-weight:800;font-size:15.5px;margin-bottom:4px">${esc(name)}</b>
        <span style="font-size:12.5px;line-height:1.45;color:var(--muted)">${esc(factFill(hook))}</span></span>
    </figure>`).join('');

  const statStrip = [
    [countTxt('games'), 'word games'], [countTxt('conceptsFree'), 'concept chapters'],
    [countTxt('evoForms'), 'evolution forms'], [countTxt('avatars'), 'collectibles'],
    [countTxt('trivia'), 'trivia questions'], [countTxt('scripps'), 'champion words'],
  ].filter(([n]) => n).map(([n, t]) => `<span style="display:flex;flex-direction:column;align-items:center;gap:2px;min-width:0">
      <b style="font-family:var(--display);font-weight:800;font-size:clamp(20px,3vw,28px);line-height:1;color:var(--accent);font-variant-numeric:tabular-nums">${n}</b>
      <span style="font-size:11.5px;font-weight:700;color:var(--muted);text-align:center;line-height:1.25">${t}</span></span>`).join('');

  const facts = `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,232px),1fr));gap:14px">${games}</div>
    <div style="display:flex;flex-wrap:wrap;gap:18px clamp(14px,4vw,40px);justify-content:center;margin-top:26px;padding:20px;border-radius:16px;background:var(--bg2);border:1px solid var(--line)">${statStrip}</div>`;

  const game = landSection('Why children keep opening it',
    'A game where spelling is how you&nbsp;win.',
    `${countWord('games')} word games, no two the same drill. <b style="color:var(--text)">Spelling is the cheat code</b> — it opens the gate, fires the power-up, blasts the glitch — so practice happens because they want the next thing, not because you asked.`,
    `<div style="background:var(--chip);border:1px solid color-mix(in srgb,var(--accent) 30%,var(--line));border-radius:20px;padding:clamp(22px,4vw,34px);margin-bottom:26px">
       <div style="font-family:var(--ui);font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:10px">The one rule under every game</div>
       <div style="font-family:var(--display);font-weight:800;font-size:clamp(21px,3.2vw,30px);line-height:1.16;margin-bottom:12px">Spelling is the cheat&nbsp;code.</div>
       <p style="font-size:15px;line-height:1.6;color:var(--muted);max-width:40em;margin:0 0 12px">It opens the gate, fires the power-up, feeds the snake, lights the next tile. There is no pay-to-win and no tapping past it — the only way forward is to spell the word, said aloud first in a real recorded voice. So the practice happens because your child wants the next thing, not because you asked.</p>
       <p style="font-size:15px;line-height:1.6;color:var(--muted);max-width:40em;margin:0">And it all points somewhere: a full Scripps-format <b style="color:var(--text)">Mock Spelling Bee</b> — up to ${countWord('mbSpellers').toLowerCase()} spellers, preliminaries to finals — the stage they are quietly training for.</p>
       <div style="font-family:var(--display);font-weight:800;font-size:clamp(19px,2.8vw,26px);color:var(--accent);margin-top:16px">They think they&rsquo;re playing. They&rsquo;re practising for the bee.</div>
     </div>
     ${facts}`,
    { style: 'background:var(--bg2)' });

  /* ---- 3. THE TRANSLATION. One feature set read two ways — the single most
       useful page in the brand platform, because it needs no second campaign. ---- */
  const rows = [
    ['&ldquo;Spelling opens the gate. I have to get it right to keep&nbsp;going.&rdquo;',
     'Spelling reframed from test to power. In every game the word is the key — the child is unlocking the next thing, not being examined by it. That is the whole difference between a chore and a game.'],
    [`&ldquo;My bee is at Forager. ${(W => W[RANK_NAMES.length - 1 - RANK_NAMES.indexOf('Forager')] || 'A few')(['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'])} more and she&rsquo;s Queen.&rdquo;`,
     'Progress that measures effort and can never be lost. That is the answer to the plateau — the exact moment most families quit.'],
    ['&ldquo;It says the word properly.&rdquo;',
     `${countCap('voiced')} words recorded in a real neural voice, not device text-to-speech — which mispronounces exactly the French-origin borrowings that decide bees. A child can only spell what they actually heard.`],
    ['&ldquo;It won&rsquo;t tell me. It literally beeps it out.&rdquo;',
     'When the app reads a word inside a sentence it splices the audio and plays a beep over the target, so the example can never leak the spelling. It is engineered so it cannot be cheated.'],
    ['&ldquo;Beat your dad.&rdquo;',
     'Family Bee night — the mock bee, played round the sofa: pass the device to whoever is called. No accounts, no internet, no strangers. The only head-to-head in the product happens on a sofa.'],
    ['&ldquo;It works on the plane.&rdquo;',
     'Offline, no login for the child, nothing harvested, nothing to police. Screen time that does not need supervising.'],
  ].map(([kid, parent]) => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px;padding:20px 0;border-top:1px solid var(--line)">
      <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.35">${kid}</div>
      <div style="font-size:14px;color:var(--muted);line-height:1.55">${parent}</div></div>`).join('');

  const translate = landSection('The same product, twice',
    'What your child hears. What you&rsquo;re actually buying.',
    'You do not need to talk them into it and they do not need to know what it is for. One feature set, read in two directions.',
    `<div style="border-bottom:1px solid var(--line)">${rows}</div>`);

  /* ---- 4. THE LADDER. The reason this is a subscription and not an app. ---- */
  const ladder = [
    ['4–7', 'The books', 'Read aloud by a parent. No screen, no scoring, no pressure — just affection for words, and for a character they will follow.'],
    ['7–9', 'The arcade', `${countTxt('games')} word games where spelling is how you win, a new Daily Bee word every day, and ${countTxt('trivia')} trivia questions. They think they are playing a game about a bee.`],
    ['9–12', 'The ladder', 'The highest-value words, an avatar that evolves the whole way up, and Champ Challenges to test out and skip ahead.'],
    ['12–15', 'The library', `${countCap('library')} words and serious bee preparation. The child who started with a picture book is now spelling words most adults cannot.`],
  ].map(([age, t, b], i) => `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:20px;position:relative">
      <div style="font-family:var(--display);font-weight:800;font-size:13px;color:var(--accent);letter-spacing:.06em">AGES ${age}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:19px;margin:6px 0 8px">${t}</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.5">${b}</div></div>`).join('');

  const ladderSec = landSection('One ladder, ages 4 to 15',
    'A family that starts at four has eleven years of reasons to stay.',
    'This is not an app you finish in a term. The books recruit, the app retains, and the ceiling is real — the words that ended national champions are in here waiting.',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px">${ladder}</div>`,
    { style: 'background:var(--bg2)' });

  return `<div style="min-height:100dvh;background:var(--bg)">
    ${landNav()}${hero}${landShowcase()}${game}${landCollect()}${landCompare()}${translate}${ladderSec}${landPlansSection()}${landTestimonials()}${landFAQ()}${landAccount()}${landFoot()}</div>`;
}

/* ---- The nav. Sign in sits here and nowhere near the child. ---- */
/* The comparison table and the FAQ exist twice on purpose: here for the visitor,
   and as static HTML inside #root in index.html for crawlers and answer engines
   that never run this file. qa/audit.cjs asserts the two FAQ question lists match,
   because a table that disagrees with itself is worse than not having one.
   No competitor is named — the column is what a typical app in the category does. */
/* Copy that names a count says {key} (or {key:Word} / {key:word} for "Six" / "six") and is
   filled at render time from SB_COUNT ({key:Cap} for "Over 125,000" at a sentence's start) — these tables are built while app3 is still parsing,
   before the arcade list below exists. The static mirror in index.html carries the same
   words, and tests/one-count.cjs holds the two to the same figures. */
function planTok(id, f) { const t = (window.SB_TIERS || {})[id]; if (!t) return '';
  return f === 'words' ? sbFmt(t.ent.words) : f === 'mo' ? '$' + t.priceMo : f === 'yr' ? '$' + t.priceYr : ''; }
function factFill(s) { return String(s).replace(/\{(free|beginner|regional)\.(words|mo|yr)\}/g, (m, id, f) => planTok(id, f)).replace(/\{(\w+)(?::(Word|word|Cap))?\}/g, (m, k, w) => w === 'Cap' ? countCap(k) : w ? (w === 'word' ? countWord(k).toLowerCase() : countWord(k)) : countTxt(k)); }
const SB_COMPARE = [
  /* Short enough to scan, not read. The first version was three columns of full
     sentences — nobody compares anything by reading nine sentences, and the whole
     value of a table is that the eye can run down it. The detail that was in the
     prose now lives in the FAQ, where somebody who wants it will go looking. */
  ['Hearing the word',       'Robotic device text-to-speech',   '{voiced:Cap} words in one real recorded voice'],
  ['Words available',        'A few hundred to ~4,000',         '{library:Cap} · {graded} graded by difficulty'],
  ['Different games',        'One or two, re-skinned',          '{games:Word} distinct games, trivia and a mock bee'],
  ['Bee practice',           'Word lists to memorise',          'Full Scripps-format mock bee'],
  ['Roots and origins',      'Rarely covered',                  '{journeys} journeys · {conceptsFree} chapters'],
  ['Vocabulary',             'Bolted onto spelling',            'Its own ladder · NSF 2026 list'],
  ['Without internet',       'Needs a connection',              'Works fully offline'],
  ['Who signs in',           'Usually the child',               'The parent. Never the child.'],
  ['Ads, chat, leaderboards','Common',                          'None'],
  ['What money buys',        'Shortcuts and power-ups',         'A plan, bought by a grown-up. Coins are earned, never sold.'],
];
const SB_FAQ = [
  ['What is Bizzing Bee?', 'A spelling bee practice app for children aged 8 to 15. It speaks every word aloud in a recorded voice, the way a pronouncer does at a real bee, and wraps the practice in {games:word} word games plus a full mock bee so children keep coming back.'],
  ['Is Bizzing Bee free?', 'Yes. The free plan gives you {free.words} words and the basic games, with no card required and no expiry. Beginner Bee is {beginner.mo} a month or {beginner.yr} a year for {beginner.words} words, and Regional Speller at {regional.mo} a month or {regional.yr} a year unlocks the full graded library and the book series. Worlds 1\u2013{freeWorlds} are free on every plan; the others come with a paid plan, or one at a time for {worldPrice} coins your child earns by learning. Monthly plans can be cancelled at any time.'],
  ['Does my child hear the words spoken aloud?', "Yes. {voiced:Cap} words are recorded in a real neural voice rather than read by the device's built-in text-to-speech, which mispronounces exactly the French and Latin borrowings that decide bees. A child can only spell a word they actually heard correctly."],
  ['How does it help prepare for the Scripps National Spelling Bee?', 'It practises the way the bee is actually run: the word spoken aloud, the definition, the language of origin and a sentence, then you spell it. It carries the Scripps and North South Foundation study tiers, all {scripps} national winning words from 1925 to 2026, and a Mock Spelling Bee that follows the real format of preliminaries, quarterfinals, semifinals and finals.'],
  ['Does it teach Greek and Latin roots?', 'Yes. {journeys} Word Journeys lessons and {conceptsFree} concept chapters cover roots, prefixes, suffixes and language families, so an unfamiliar word can be reasoned out rather than memorised. Recognising word patterns is the single technique bee coaches recommend most.'],
  ['Does it work without internet?', 'Yes. Once loaded it runs offline on a tablet or phone — on a plane, in a car or in a tunnel. Practice is saved on this device. Nothing leaves it unless a grown-up switches on the optional cloud backup — and a child’s name and age never leave it at all.'],
  ['What ages is it for?', 'Children aged 8 to 15. Difficulty tracks the individual child rather than their school year, so a strong eight-year-old and a struggling thirteen-year-old both get words pitched at them.'],
  ['Is it safe for children?', 'There is no chat, no leaderboard, no microphone, no ads and no strangers. Only the parent holds an account; children never sign in to anything. Practice is stored on your own device.'],
  ['Can more than one child use one account?', 'Yes. One parent account carries a profile for each child, each with their own words, progress and avatar.'],
  ['What information do you actually store?', 'Your email address, because somebody has to hold the account and be billed. For each child: a display name they invent, a spelling level, and their practice progress. We do not store a child\u2019s real name, age, photo, voice or location — the database has no column for any of it, so it cannot be collected by accident later.'],
  ['Does it cover vocabulary and word meanings too?', 'Yes. There is a separate vocabulary ladder for meanings, the official NSF Vocabulary 2026 list, {trivia} trivia questions, idioms and similes, and an IPA trainer for reading pronunciation notation.'],
];

/* THE COLLECTIBLES BLOCK — the one that talks to the nine-year-old.
   The painted worlds above are play FIELDS: composed open and low-contrast through
   the middle so gameplay reads on top of them. Eight in a row is atmospheric and,
   for a child deciding in two seconds, gloomy. The characters are where this app's
   colour actually lives, and SB_AVATAR draws them as inline SVG — so a wall of
   twenty-four costs no image requests and stays sharp at any size.
   The commercial point sits underneath: none of them can be bought. */
/* REAL SCREENS, NOT SCENERY. This page used to show the painted backdrops the games
   are drawn ON — eight pictures of empty meadow. A child cannot tell what any of that
   is. These are photographs of the running app, captured by qa/shots.cjs, which also
   suppresses the build banner and the first-run tour so a screenshot shows the product
   rather than the scaffolding around it. */
const SB_SHOTS = [
  ['mockbee', 'A real bee, up to {mbSpellers:word} spellers',
   'Preliminaries, quarterfinals, semifinals, finals — the Scripps format, with up to {mbRivals:word} rivals who each have their own nerve, speciality and tell — the field grows with your child\u2019s age. Your child draws a number and waits their turn like everybody else.'],
  ['atlas', 'The whole journey, mapped',
   '{regions:Word} painted regions, from the Meadow to the Big Stage. Every stop teaches something and every one is a place, not a progress bar.'],
  ['card', 'Every word, spoken properly',
   'The word said aloud in a real recorded voice, its meaning, a sentence, the language it came from, and a hint for the letter that catches people out.'],
];
/* THE LANDING'S SCREENSHOTS LOAD AS THE VISITOR SCROLLS TO THEM. `loading="lazy"` still fetches
   anything inside the browser's own margin — thousands of pixels on a phone — so a first visit
   paid for screenshots far below the fold, and when the one-line phone header (FIX2 #4) lifted
   the page ~40px two more crossed that margin: the landing's first screen went 1274 → 1488 KB
   (tests/first-load.cjs). The <img>s carry data-lsrc and this hands them their src 600px ahead. */
const _lsrcSeen=new Set();   /* a picture shown once is drawn with its src on the next render (no blink on a redraw) */
function landShots(margin){ try{ const imgs=document.querySelectorAll('img[data-lsrc]'); if(!imgs.length) return;
    const show=i=>{ const u=i.getAttribute('data-lsrc'); i.src=u; i.removeAttribute('data-lsrc'); _lsrcSeen.add(u); };
    if(!('IntersectionObserver' in window)){ imgs.forEach(show); return; }
    const io=new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ io.unobserve(e.target); show(e.target); } }),{rootMargin:margin||'600px 0px'});
    imgs.forEach(i=>io.observe(i)); }catch(e){} }
function landShowcase(){
  const rows = SB_SHOTS.map(([f, t, b]) => [f, factFill(t), factFill(b)]).map(([f, t, b], i) => `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:clamp(20px,4vw,44px);align-items:center;margin-bottom:clamp(28px,5vw,56px)">
      <div style="${i % 2 ? 'order:2' : ''}">
        <h3 style="font-family:var(--display);font-weight:800;font-size:clamp(21px,3.2vw,30px);line-height:1.15;margin:0 0 10px">${esc(t)}</h3>
        <p style="font-size:15px;line-height:1.6;color:var(--muted);margin:0;max-width:32em">${esc(b)}</p></div>
      <div style="border-radius:18px;overflow:hidden;border:1px solid var(--line);box-shadow:0 18px 44px rgba(20,12,50,.16);background:var(--bg2)">
        <img data-lsrc="app-art/shots/${f}.webp" alt="${escA(t)} — a screen from Bizzing Bee"
             loading="lazy" decoding="async"
             style="display:block;width:100%;height:auto;aspect-ratio:1200/834"></div>
    </div>`).join('');
  return landSection('This is the actual app', 'Not a mock-up. This is what your child&nbsp;opens.', '', rows);
}

function landCollect(){
  let strip = '';
  try{
    const A = (window.SB_AVATARS && SB_AVATARS.list) || [];
    if (A.length) {
      /* one from each pack, so the wall shows the RANGE rather than ten bees */
      const byPack = {}; A.forEach(a=>{ (byPack[a.pack]=byPack[a.pack]||[]).push(a); });
      const picks = [];
      Object.keys(byPack).forEach(k=>{ picks.push(byPack[k][0]); if(byPack[k][1]) picks.push(byPack[k][1]); });
      strip = picks.slice(0,24).map(a=>`<span title="${escA(a.name)}"
        style="width:clamp(52px,7.4vw,76px);aspect-ratio:1;border-radius:18px;background:var(--bg2);
        border:1px solid var(--line);display:grid;place-items:center;overflow:hidden;flex-shrink:0">
        <span class="sb-onb-avart" style="width:80%;height:80%">${SB_AVATAR(a.id, 68)}</span></span>`).join('');
    }
  }catch(e){}
  if(!strip) return '';                       // avatars not in yet — say nothing rather than a hole

  return landSection('Collect · evolve · earn',
    `${countTxt('avatars')} characters. Coins buy them, and coins cannot be&nbsp;bought.`,
    `No packs and no odds: every card says how it is won — free, a fixed price in coins, or for a Legendary the learning milestone that comes first — coins buy looks and nothing else, and nothing is ever left to chance. In a category built on pester-power purchases, that is the headline.`,
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(clamp(52px,7.4vw,76px),1fr));gap:10px;justify-items:center;margin-bottom:22px">${strip}</div>
     <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:14px">
       ${[['Egg to Queen Bee', (countTxt('evoForms') ? countTxt('evoForms') + ' evolution forms across ' + countWord('worlds').toLowerCase() + ' worlds' : 'An evolution ladder in every world') + ', each hand-drawn with its own idle animation. It measures effort, and it never goes down.'],
          ['Coins buy looks, never words', 'Bizzing coins are earned by learning and buy an avatar, a world or a frame at its printed price — chapters open on the Atlas. There is no way to pay your way past a word you cannot spell — and game artifacts are won by playing, not bought.'],
          /* (audit v4) this card sold "pack drops" — packs, odds and drops are gone (FIX-BEE v2). What is
             true now: four rarity tiers, a fixed price for each, a milestone before a Legendary, no chance */
          (r => [`${countWord('tiers')} tiers, no luck in any of them`, r ? `${tierNames()}. Commons are free. In a world that is open, a Rare is ${r.rare} coins and an Epic ${r.epic}; a Legendary is ${r.legendary}, once your child reaches the learning milestone it names. Coins come only from learning. Nothing is drawn at random.` : 'Nothing is drawn at random.'])(sbRule())]
        .map(([t,b])=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:20px">
          <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:7px">${t}</div>
          <div style="font-size:13px;line-height:1.5;color:var(--muted)">${b}</div></div>`).join('')}
     </div>`);
}

function landCompare(){
  const rows = SB_COMPARE.map(([k,a,b])=>[k,a,factFill(b)]).map(([k,a,b])=>`<tr>
      <th scope="row" style="text-align:left;padding:13px 12px;border-bottom:1px solid var(--line);font-weight:800;font-size:14px;vertical-align:top">${esc(k)}</th>
      <td style="padding:13px 12px;border-bottom:1px solid var(--line);font-size:13.5px;color:var(--muted);line-height:1.5;vertical-align:top">${esc(a)}</td>
      <td style="padding:13px 12px;border-bottom:1px solid var(--line);font-size:13.5px;line-height:1.5;vertical-align:top;background:color-mix(in srgb,var(--accent) 7%,transparent);font-weight:600">${esc(b)}</td></tr>`).join('');
  return landSection('How it compares', 'What a spelling app usually gives you, and what this&nbsp;does.',
    'No names — this is the category, not a rival. Every figure in the right-hand column is counted from the shipping build.',
    `<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:16px">
       <table style="border-collapse:collapse;width:100%;min-width:620px">
         <thead><tr>
           <th scope="col" style="text-align:left;padding:13px 12px;border-bottom:2px solid var(--line);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">What matters</th>
           <th scope="col" style="text-align:left;padding:13px 12px;border-bottom:2px solid var(--line);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">A typical spelling app</th>
           <th scope="col" style="text-align:left;padding:13px 12px;border-bottom:2px solid var(--line);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);background:color-mix(in srgb,var(--accent) 7%,transparent)">Bizzing Bee</th>
         </tr></thead><tbody>${rows}</tbody></table></div>`);
}

function landFAQ(){
  const items = SB_FAQ.map(([q,a])=>[q,factFill(a)]).map(([q,a],i)=>`<div style="border-bottom:1px solid var(--line);padding:18px 0">
      <h3 style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.35;margin:0 0 7px">${esc(q)}</h3>
      <p style="font-size:14.5px;line-height:1.6;color:var(--muted);margin:0;max-width:52em">${esc(a)}</p></div>`).join('');
  return landSection('Questions parents ask', 'Everything you might reasonably want to know&nbsp;first.',
    '', `<div style="border-top:1px solid var(--line)">${items}</div>`, { style:'background:var(--bg2)' });
}

function landNav() {
  return `<div style="position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)">
    <div class="sb-lnav" style="max-width:1080px;margin:0 auto;padding:11px clamp(18px,4vw,32px);display:flex;flex-wrap:nowrap;align-items:center;gap:10px">
      <button data-act="goLanding" class="sb-lnav-home" aria-label="Bizzing Bee — home" style="display:flex;align-items:center;gap:9px;margin-right:auto;min-width:0;background:none;border:0;cursor:pointer">
        <span class="sb-lnav-bee" style="width:30px;height:34px;flex-shrink:0;display:block">${mascotSVG('happy')}</span>
        <span class="sb-lnav-mark" style="font-family:var(--display);font-weight:800;font-size:19px;letter-spacing:-.01em;white-space:nowrap"><i style="font-style:italic">Bizzing</i> Bee</span></button>
      <button data-act="landPlans" class="sb-lnav-b" style="padding:9px 15px;border-radius:12px;font-weight:800;font-size:13.5px;color:var(--muted);white-space:nowrap">Plans</button>
      <button data-act="goSignin" class="sb-lnav-b" style="padding:9px 15px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13.5px;white-space:nowrap">Sign in</button>
      <button data-act="goSignup" class="sb-lnav-b sb-lnav-cta" style="padding:9px 17px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge);white-space:nowrap;flex-shrink:0">Start free</button>
    </div></div>`;
}

/* ---- The proof. Not a claim about the library — the parent losing to it.
       "That feeling is the campaign": put them through it in thirty seconds.
       These are real entries, and the speaker button plays the same recording
       the child hears in a round, which is the one thing a screenshot cannot
       demonstrate and every competitor gets wrong. ---- */
const LAND_WORDS = [
  { w: 'liaison',      d: 'A person who helps two groups talk to each other.',           o: 'French' },
  { w: 'bouquet',      d: 'A bunch of flowers, gathered and tied.',                       o: 'French' },
  { w: 'iridescent',   d: 'Showing shifting rainbow colours as the light moves.',         o: 'Latin' },
  { w: 'chauffeur',    d: 'Someone employed to drive a private car.',                     o: 'French' },
  { w: 'silhouette',   d: 'A dark outline of something against a lighter background.',    o: 'French' },
  { w: 'questionnaire',d: 'A printed list of questions, used to gather information.',     o: 'French' },
  { w: 'pharaoh',      d: 'A ruler of ancient Egypt.',                                    o: 'Greek' },
  { w: 'rhythm',       d: 'A strong, regular, repeated pattern of sound or movement.',    o: 'Greek' },
];

function landTry() {
  const i = Math.min(state.landIdx || 0, LAND_WORDS.length - 1);
  const e = LAND_WORDS[i];
  const done = (state.landIdx || 0) >= LAND_WORDS.length;
  const score = state.landScore || 0;
  const asked = state.landAsked || 0;

  if (done) {
    const half = score <= Math.ceil(LAND_WORDS.length / 2);
    return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,4vw,34px);box-shadow:var(--glow);text-align:center">
      <div style="width:96px;height:108px;margin:0 auto 10px;animation:sb-float 4s ease-in-out infinite">${mascotSVG('excited')}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:clamp(24px,4vw,34px);margin-bottom:6px">${score} out of ${LAND_WORDS.length}</div>
      <p style="font-size:15px;line-height:1.55;color:var(--muted);max-width:26em;margin:0 auto 18px">${half
        ? 'Most adults get about half — these are real entries from the library, and your child will be spelling them out loud.'
        : 'That is a strong round. The library goes a very long way past this — all the way to the words that ended national champions.'}</p>
      <div style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center">
        <button data-act="goSignup" style="padding:14px 24px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Start free — no sign-up →</button>
        <button data-act="landRestart" style="padding:14px 20px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Try again</button>
      </div></div>`;
  }

  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,30px);box-shadow:var(--glow)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px">
      <span style="font-family:var(--display);font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Can you spell it?</span>
      <span style="font-family:var(--display);font-weight:800;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums">Word ${i + 1} of ${LAND_WORDS.length} · ${score}/${asked || 0} right</span>
    </div>
    <div style="display:flex;justify-content:center;margin-bottom:12px">
      <button data-act="landSay" aria-label="Hear the word" title="Hear it — this is the recording your child hears"
        style="display:inline-flex;align-items:center;gap:9px;padding:13px 20px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:14px;border:1px solid color-mix(in srgb,var(--accent) 34%,var(--line))">
        ${iconSVG('volume', 19)} Hear the word</button></div>
    <div style="text-align:center;font-size:14.5px;line-height:1.5;color:var(--muted);margin-bottom:4px">${esc(e.d)}</div>
    <div style="text-align:center;font-size:12.5px;font-weight:700;color:var(--muted);opacity:.8;margin-bottom:16px">from the ${esc(e.o)}</div>
    ${state.landMiss ? `<div style="text-align:center;font-weight:800;font-size:14px;color:var(--bad,#C0392B);margin-bottom:10px">It was <span style="font-family:var(--mono)">${esc(state.landMiss)}</span></div>` : ''}
    ${state.landDone ? `<div style="text-align:center;font-weight:800;color:var(--good,#178A4C);font-size:15px;margin-bottom:10px;animation:sb-pop .4s ease both">Correct.</div>` : ''}
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <input data-inp="landType" data-key="landKey" data-fkey="landType" value="${escA(state.landTyped || '')}"
        autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="spell it here"
        aria-label="Type your spelling"
        style="flex:1;min-width:0;padding:13px 14px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--mono);font-weight:700;font-size:16px;text-align:center;letter-spacing:.06em">
      <button data-act="landCheck" style="padding:13px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);flex-shrink:0">Check</button>
    </div>
    <div style="text-align:center"><button data-act="landSkip" style="font-size:13px;font-weight:700;color:var(--muted);text-decoration:underline;text-underline-offset:3px">Skip this one</button></div>
  </div>`;
}

/* ---- The plans. Read from SB_TIERS so the page cannot quote a price the app
       does not charge, and the Advanced Pack is shown as what it is: an add-on
       that sits on top of any tier and cannot be bought with coins. ---- */
/* A plan's blurb carries {words} (pricing.js) — the plan's own word count, filled here. */
function tierBlurb(t) { return factFill(String(t.blurb || '').replace(/\{words\}/g, sbFmt((t.ent || {}).words || 0))); }
/* Which worlds a plan opens, asked of the family engine itself (BZ_AVATARS.worldOpen). */
function sbWorldsFor(id) { const n = SB_COUNT.worlds() || 0, plan = id === 'free' ? 'free' : 'family';
  try { if (plan === 'family' && BZ_AVATARS.worldOpen(99, { plan })) return { all: true, n };
    let open = 0; while (open < 99 && BZ_AVATARS.worldOpen(open + 1, { plan })) open++; return { all: false, open, n }; }
  catch (e) { return { all: plan === 'family', open: 0, n }; } }
/* "save N months": the WHOLE months a year saves over twelve monthly payments, on the paid plan
   that saves the least — so the claim stays true of every plan on the page. */
function sbYearSaves() { try { return Math.min(...['beginner', 'regional'].map(id => { const t = SB_TIERS[id];
    return Math.floor((t.priceMo * 12 - t.priceYr) / t.priceMo + 1e-9); })); } catch (e) { return 0; } }
function landPlansSection() {
  const T = window.SB_TIERS || {};
  const yearly = state.landYearly !== false;
  const cards = ['free', 'beginner', 'regional'].map(id => {
    const t = T[id]; if (!t) return '';
    const best = id === 'regional';
    const price = id === 'free' ? 'Free'
      : yearly ? '$' + t.priceYr + '<span style="font-size:14px;font-weight:700;color:var(--muted)">/year</span>'
               : '$' + t.priceMo + '<span style="font-size:14px;font-weight:700;color:var(--muted)">/month</span>';
    const sub = id === 'free' ? 'No card, no expiry'
      : yearly ? 'about $' + (t.priceYr / 12).toFixed(2) + ' a month, billed yearly' : 'billed monthly · cancel anytime';
    /* (road to 4.5, P0.21/P0.23) every figure here is read — words from SB_TIERS, worlds from the
       family engine (BZ_AVATARS: a paid plan is the family plan, and it opens every world with its
       avatars), games and books from SB_COUNT. The beginner row's old four-worlds-and-five-packs was true of an older
       plan and false of the engine the app actually runs. */
    const W = sbWorldsFor(id), R = sbRule();
    const worldRow = W.all ? (W.n ? `All ${W.n} worlds and their avatars` : 'Every world and its avatars')
      : `Worlds 1–${W.open}${R ? ` · the others for ${R.world} earned coins each` : ''}`;
    const rows = {
      free: [sbFmt(t.ent.words) + ' words to practise', 'The basic games', worldRow, 'Progress reports'],
      beginner: [sbFmt(t.ent.words) + ' words', 'Concepts and Word Lists', 'The revision pile', worldRow],
      regional: [sbFmt(t.ent.words) + ' words — the full graded library', 'The full arcade: ' + countTxt('games') + ' games, trivia and the mock bee',
                 `The book series — ${countTxt('books')} volumes and ${countTxt('companions')} companions`, worldRow + ', and every game',
                 'All the Supercharge training tools'],
    }[id].map(r => `<li style="display:flex;gap:9px;align-items:flex-start;font-size:13.5px;line-height:1.45;margin-bottom:9px">
        <span style="color:var(--accent);flex-shrink:0;margin-top:1px">${iconSVG('check', 15)}</span><span>${r}</span></li>`).join('');
    return `<div style="background:var(--bg2);border:${best ? '2px solid var(--accent)' : '1px solid var(--line)'};border-radius:20px;padding:24px;position:relative;display:flex;flex-direction:column">
      ${best ? `<div style="position:absolute;top:-11px;left:24px;padding:4px 12px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:11px;letter-spacing:.06em;text-transform:uppercase">Most families</div>` : ''}
      <div style="font-family:var(--display);font-weight:800;font-size:18px;margin-bottom:4px">${esc(t.name)}</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:14px;min-height:2.9em">${esc(tierBlurb(t))}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:34px;line-height:1;font-variant-numeric:tabular-nums">${price}</div>
      <div style="font-size:12px;color:var(--muted);font-weight:700;margin:5px 0 16px">${sub}</div>
      <ul style="list-style:none;padding:0;margin:0 0 18px;flex:1">${rows}</ul>
      <button data-act="${id === 'free' ? 'goSignup' : 'landPick'}" data-arg="${id}"
        style="width:100%;padding:13px;border-radius:13px;font-weight:800;font-size:14.5px;${best
          ? 'background:var(--accent);color:#fff;box-shadow:var(--edge)' : 'background:var(--surface2);color:var(--text)'}">
        ${id === 'free' ? 'Start free' : 'Choose ' + esc(t.name)}</button>
    </div>`;
  }).join('');

  const adv = (window.SB_ADDONS || {}).advanced;
  const addon = !adv ? '' : `<div style="margin-top:18px;background:var(--chip);border:1px solid color-mix(in srgb,var(--accent) 30%,var(--line));border-radius:20px;padding:24px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:18px;align-items:center">
      <div>
        <div style="font-family:var(--display);font-weight:800;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);margin-bottom:7px">Add-on · sits on top of any plan</div>
        <div style="font-family:var(--display);font-weight:800;font-size:21px;margin-bottom:7px">${esc(adv.name)} · $${adv.priceYr}/year</div>
        <div style="font-size:13.5px;color:var(--muted);line-height:1.55">The full library of ${countTxt('library')} words, ${countTxt('conceptsAdv')} advanced narrated lessons, ${countTxt('techniques')} champion techniques, mock spelling bees and the Ultra Champions journey. For the family with a bee in the calendar.</div>
      </div>
      <div style="text-align:right"><button data-act="landPick" data-arg="advanced" style="padding:13px 22px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:14.5px;box-shadow:var(--edge)">Add the Advanced Pack</button></div>
    </div>`;

  const tog = on => `padding:8px 18px;border-radius:999px;font-weight:800;font-size:13px;transition:.2s;${on ? 'background:var(--accent);color:#fff' : 'color:var(--muted)'}`;
  return `<section id="land-plans" style="padding:clamp(48px,8vw,96px) 0">
    <div style="max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,32px)">
      <div style="text-align:center;margin-bottom:26px">
        <div style="font-family:var(--ui);font-weight:800;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px">Plans</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:clamp(26px,4.4vw,42px);line-height:1.08;letter-spacing:-.02em;margin:0 0 12px">Start free. Move up when they ask you&nbsp;to.</h2>
        <p style="font-size:15.5px;line-height:1.6;color:var(--muted);max-width:34em;margin:0 auto 20px">Every plan is one account for the whole family — add a profile for each child. Cancel whenever you like; the free plan never expires.</p>
        <div style="display:inline-flex;padding:4px;border-radius:999px;background:var(--surface2);gap:2px">
          <button data-act="landBill" data-arg="year" style="${tog(yearly)}">Yearly${sbYearSaves() > 0 ? ' · save ' + sbYearSaves() + ' months' : ''}</button>
          <button data-act="landBill" data-arg="month" style="${tog(!yearly)}">Monthly</button></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,258px),1fr));gap:16px">${cards}</div>
      ${addon}
      <div style="text-align:center;font-size:13px;color:var(--muted);margin-top:20px;line-height:1.6">Bizzing coins are earned by learning and only buy cosmetics. Nothing that affects learning is ever behind a coin, and nothing is ever left to chance.</div>
    </div></section>`;
}

/* ---- The account, explained honestly. The platform names "no account" as the
       strongest parent argument in the product, and a paywall appears to break
       it. It does not, and the distinction is worth a section rather than a
       footnote: the PARENT holds the account. The child is a profile on the
       device and authenticates against nothing, ever. ---- */
function landAccount() {
  return landSection('About that sign-in',
    'You have an account. Your child does&nbsp;not.',
    'A paid product needs somebody to bill, and that is where it stops. Your child taps their own face on the home screen and starts spelling — there is no username, no password and no profile of them anywhere but this device.',
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,250px),1fr));gap:16px">
      ${[['users', 'One account, every child', 'Add a profile per child. They pick theirs and go — no sign-in, ever.'],
         ['lock', 'Progress is backed up. Your child is not.', 'Practice syncs to your account so a wiped tablet cannot erase months of work. What is stored is a display name they invented, a spelling level and their progress — there is no field for a real name or an age.'],
         ['close', 'Nothing to police', 'No chat, no leaderboard, no microphone, no ads, no strangers, no in-app purchase a child can reach.'],
         ['bolt', 'Unlock once, then fly', 'After the first sign-in it runs offline. On a plane, in a tunnel, on a tablet with no SIM.']]
        .map(([ic, t, b]) => `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:20px">
          <div style="width:38px;height:38px;border-radius:11px;background:var(--chip);color:var(--accent);display:grid;place-items:center;margin-bottom:11px">${iconSVG(ic, 19)}</div>
          <div style="font-weight:800;font-size:15px;margin-bottom:6px">${t}</div>
          <div style="font-size:13px;color:var(--muted);line-height:1.5">${b}</div></div>`).join('')}
    </div>`, { style: 'background:var(--bg2)' });
}

/* ---- The footer carries the COPPA notice link. This is one of the four
       placements the privacy policy has to be reachable from; do not remove it. ---- */
/* TESTIMONIALS.
   SB_TESTIMONIALS_REAL is false, and while it is false every card is stamped as an
   illustrative example and the section says so in its own heading. That is not
   squeamishness: the FTC's 2024 rule on consumer reviews and testimonials makes
   fabricated endorsements a civil-penalty offence, and this is a product sold for
   children. Placeholders are fine; placeholders a parent could mistake for real
   parents are not.
   When the beta returns real quotes: replace the array, set the flag true, and the
   sample framing disappears on its own. */
const SB_TESTIMONIALS_REAL = false;
const SB_TESTIMONIALS = [
  ['She asks to do it. That is the part I still cannot get over — I bought a spelling app and she treats it like a game console.',
   'Parent of a 9-year-old', 'placeholder'],
  ['He came back from the regional bee and told me the pronouncer sounded like the app. That is the whole thing, isn\u2019t it.',
   'Parent of an 11-year-old', 'placeholder'],
  ['I tried the {landN:word} words on the front page and got {landHalf:word}. My daughter got {landAlmost:word}. I have never been so pleased to lose at anything.',
   'Parent of a 12-year-old', 'placeholder'],
];
function landTestimonials(){
  const cards = SB_TESTIMONIALS.map(([q, who]) => [factFill(q), who]).map(([q, who]) => `<figure style="margin:0;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;display:flex;flex-direction:column;gap:14px">
      <span style="color:var(--accent);opacity:.5;font-family:var(--display);font-weight:800;font-size:34px;line-height:.7">&ldquo;</span>
      <blockquote style="margin:0;font-size:15px;line-height:1.6;flex:1">${esc(q)}</blockquote>
      <figcaption style="font-size:12.5px;font-weight:800;color:var(--muted);display:flex;align-items:center;gap:8px">
        <span style="width:26px;height:26px;border-radius:50%;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG('users',13)}</span>
        ${esc(who)}${SB_TESTIMONIALS_REAL ? '' : ` <span style="font-weight:700;padding:2px 7px;border-radius:999px;background:var(--surface2);color:var(--muted);font-size:10.5px;letter-spacing:.04em;text-transform:uppercase">Example</span>`}</figcaption>
    </figure>`).join('');
  const head = SB_TESTIMONIALS_REAL ? 'What parents say' : 'What we hope parents will say';
  const lede = SB_TESTIMONIALS_REAL
    ? 'From families using Bizzing Bee.'
    : 'Bizzing Bee is in beta and has no reviews yet. These are illustrative examples of the reaction we are building for &mdash; not real quotes, and not presented as any. Real ones will replace them the moment there are some.';
  return landSection('Voices', head, lede,
    `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,268px),1fr));gap:16px">${cards}</div>`,
    { style:'background:var(--bg2)' });
}

function landFoot() {
  return `<footer style="border-top:1px solid var(--line);padding:30px 0 40px">
    <div style="max-width:1080px;margin:0 auto;padding:0 clamp(18px,4vw,32px);display:flex;flex-wrap:wrap;gap:14px;align-items:center">
      <span style="display:flex;align-items:center;gap:8px;margin-right:auto">
        <span style="width:24px;height:27px;display:block">${mascotSVG('happy')}</span>
        <span style="font-family:var(--display);font-weight:800;font-size:14px"><i style="font-style:italic">Bizzing</i> Bee</span></span>
      <a href="privacy.html" style="font-size:13px;font-weight:700;color:var(--muted);text-decoration:underline;text-underline-offset:3px">Privacy &amp; the children&rsquo;s online notice</a>
      <button data-act="landPlans" style="font-size:13px;font-weight:700;color:var(--muted)">Plans</button>
      <button data-act="goSignin" style="font-size:13px;font-weight:700;color:var(--muted)">Sign in</button>
      ${bkLandingLink()}
    </div>
    <div style="max-width:1080px;margin:14px auto 0;padding:0 clamp(18px,4vw,32px);font-size:12px;color:var(--muted);line-height:1.6;opacity:.85">
      Built by a family who has sat through the regional rounds. Figures on this page are counted from the shipping build.
    </div></footer>`;
}

function viewAuth(){
  const S=state; const signup=S.authMode==='signup';
  return `<div style="position:relative;z-index:1;min-height:100dvh;display:grid;place-items:center;padding:24px">
    <div style="width:100%;max-width:420px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(24px,5vw,36px);box-shadow:var(--glow)">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:22px">
        <div style="width:56px;height:62px">${mascotSVG('happy')}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">${signup?'Create your account':'Welcome back'}</h2>
        <p style="margin:0;color:var(--muted);font-size:13px;text-align:center">${signup?'Start free — no card needed.':'Sign in to pick up where you left off.'}</p>
      </div>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Parent email</label>
      <input data-inp="onEmail" data-fkey="email" value="${escA(S.email)}" type="email" placeholder="you@email.com" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:14px;outline:none">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Password</label>
      <input data-inp="onPw" data-fkey="pw" value="${escA(S.pw)}" type="password" placeholder="••••••••" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:20px;outline:none">
      <button data-act="doAuth" style="width:100%;padding:15px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${signup?'Create account':'Sign in'}</button>
      <div style="text-align:center;margin-top:16px;font-size:13px;color:var(--muted)">${signup?'Already have an account?':'New to Bizzing Bee?'} <button data-act="swapAuth" style="color:var(--accent);font-weight:800;font-size:13px">${signup?'Sign in':'Create one'}</button></div>
      <div style="text-align:center;margin-top:18px">${backPill('goLanding','Back',null)}</div>
    </div>
  </div>`;
}

/* BIZZY WAVES on the first step of setup (road to 4.5, P3.23 — "No motion"): the drawn mascot, the same Bizzy Home's
   hello draws, with its right arm lifted in a hello that swings three times (`sb-wave`, index.html) and rests raised.
   The device's reduced motion and Settings → Calm (data-motion="off") show the hello raised and still. */
function bizzyWave(){ return mascotSVG('happy').replace(/<ellipse cx="208" cy="196"[^>]*\/>/, ()=>
  '<g class="sb-wave-arm"><ellipse cx="222" cy="122" rx="13" ry="25" fill="#FFC23D" transform="rotate(32 222 122)"/><ellipse cx="231" cy="103" rx="9" ry="8" fill="#FFD86E"/></g>'); }
/* THE FIRST WORD EVER (road to 4.5, P3.24 — rubric A8, the first session's "aha"): the first word a child ever spells
   right gets a sound of its own (sfx 'first', instead of the plain right-answer chime) and a two-second bee — Bizzy
   swoops up across the screen, loops once and flies off, leaving honey sparks. ONCE per child (`c.fwFx`, kept: a redraw,
   a reload or a second word never replays it), never for a child with a right answer already on record, and never a
   coin — the word's own 'answer' coin is the only one, unchanged. Reduced motion (the device's, or Settings → Calm)
   keeps the sound and shows no flight. Drawn on <body>, outside #root, so no render can restart it. Two doors call it:
   the A8 first word (fwCheck) and the Atlas drill's right answer (a child who skipped the first word, or was placed).
   Guard: tests/p3-first-session.cjs. */
function firstWordDue(c){ try{ return !!c && !c.fwFx && rankXp(c)===0 && !Object.keys(c.mast||{}).some(k=>((c.mast[k]||{}).ok|0)>0); }catch(e){ return false; } }
function firstWordFx(c){ try{ c=c||active(); if(!c||c.fwFx) return false; c.fwFx=Date.now(); try{ save(); }catch(e){}
  sfx('first');
  const calm=!!state.a11yMotion||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(calm) return true;
  const L=document.createElement('div'); L.className='sb-fw-fly'; L.setAttribute('aria-hidden','true');
  L.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:95;overflow:hidden';
  const sp=[[22,60,.25],[38,34,.5],[54,30,.75],[62,42,.95],[54,48,1.1],[46,38,1.25],[70,22,1.5],[84,12,1.7]].map(([x,y,d])=>
    `<i style="position:absolute;left:${x}vw;top:${y}vh;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle,#FFF6C2,#FFC23D 55%,rgba(255,194,61,0) 72%);opacity:0;animation:sb-fwsp .7s ease-out ${d}s both"></i>`).join('');
  L.innerHTML=`<style>@keyframes sb-fwfly{0%{transform:translate(-14vw,72vh) scale(.6) rotate(-14deg)}28%{transform:translate(28vw,30vh) scale(1) rotate(8deg)}46%{transform:translate(54vw,22vh) scale(1.12) rotate(-4deg)}58%{transform:translate(60vw,38vh) scale(1.12) rotate(10deg)}70%{transform:translate(46vw,34vh) scale(1.08) rotate(-8deg)}100%{transform:translate(112vw,-18vh) scale(.7) rotate(16deg)}}
    @keyframes sb-fwbob{from{transform:translateY(-3px)}to{transform:translateY(3px)}}
    @keyframes sb-fwsp{0%{opacity:0;transform:scale(.3)}35%{opacity:1;transform:scale(1.3)}100%{opacity:0;transform:scale(.6) translateY(10px)}}</style>
    ${sp}<div class="sb-fw-bee" style="position:absolute;left:0;top:0;width:76px;height:86px;animation:sb-fwfly 2s cubic-bezier(.45,.05,.4,1) both"><div style="width:100%;height:100%;animation:sb-fwbob .14s ease-in-out infinite alternate">${mascotSVG('excited')}</div></div>`;
  document.body.appendChild(L); setTimeout(()=>{ try{ L.remove(); }catch(e){} }, 2300);
  return true; }catch(e){ return false; } }
function viewOnboarding(){
  const S=state;
  /* ONE DECISION PER SCREEN — the shape Bizzing Finance uses, and the reason it works:
     a child answers a question and moves on. This used to be three steps, the first of
     which asked for a name, an age band AND a buddy off a grid of twenty at once, under
     a heading that named none of them. Five steps now, each with one thing on it — six for
     the 11+ bands, whose placement step (P1.7) asks one thing too: where to start. Steps are
     read by KEY (onbKeys), because that one comes and goes with the band. */
  const K=onbKeys(), LAST=K.length-1, k=K[Math.min(LAST,S.onbStep|0)];
  const dots=K.map((_,i)=>`<div class="sb-onb-dot${i===S.onbStep?' now':(i<S.onbStep?' done':'')}"></div>`).join('');
  let foot={ label:S.onbStep===LAST?'Start spelling →':'Continue', act:'onbNext', blocked:(k==='name'&&!S.draft.name.trim()) };
  /* Two of the five steps ask for very little — a name, a face — and a 260px card
     floating in a 900px phone is the "dead space" complaint in another costume. They
     get art instead of air: the bee greets you on the way in, and the buddy you are
     choosing is shown at a size where you can actually see the choice. */
  const shell=(title,sub,body,art)=>`<div class="sb-onb-card">${art?`<div class="sb-onb-art">${art}</div>`:''}<h2>${title}</h2><p class="sb-onb-sub">${sub}</p>${body}</div>`;
  let card='';

  if(k==='name'){
    /* THE POINT OF COLLECTION. privacy.html must be linked here — it is one of the four
       places the COPPA notice is required, and splitting the old combined step is exactly
       the kind of edit that loses it. */
    card=shell("What shall we call you?","Just a first name or a nickname — whatever your speller answers to.",
      `<input data-inp="onDraftName" data-fkey="draftName" value="${escA(S.draft.name)}" placeholder="e.g. Ahana, or Fox" style="width:100%;padding:15px 16px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:17px;font-weight:700;outline:none">
      <p style="margin:18px 0 0;font-size:12px;color:var(--muted);font-weight:650;text-align:center;line-height:1.5">This name and the age range stay on this device — nothing is sent anywhere, and we never ask for a real name or an exact age.<br><a href="privacy.html" style="color:var(--muted);font-weight:700;font-size:12px;text-decoration:underline;text-underline-offset:3px">Privacy &amp; Parents' Notice</a></p>`, `<span class="sb-onb-wave">${bizzyWave()}</span>`);

  } else if(k==='age'){
    const cur=bandForAge(S.draft.age).k;
    card=shell("How old is "+esc(S.draft.name.trim()||'your speller')+"?","A range, never a birthday — it sets the starting word difficulty, and you can change it in Settings.",
      `<div style="display:grid;gap:10px">${AGE_BANDS.map(b=>{ const on=b.k===cur;
        return `<button data-act="onDraftBand" data-arg="${b.k}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;padding:16px 18px;border-radius:14px;background:${on?'var(--accent)':'var(--surface2)'};border:2px solid ${on?'var(--accent)':'transparent'};color:${on?'#fff':'var(--text)'}">
          <span><span style="display:block;font-family:var(--display);font-weight:800;font-size:18px">${b.n}</span><span style="display:block;font-size:12.5px;font-weight:650;opacity:.8;margin-top:2px">${b.sub}</span></span>
          ${on?`<span style="width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.25);display:grid;place-items:center;font-weight:900">✓</span>`:''}</button>`; }).join('')}</div>`);

  } else if(k==='place'){
    /* PLACEMENT (P1.7) — its own step, one decision: where to start. placement.js draws it (lazy); until it has
       landed the card holds its place and the step's primary waits. */
    const v=(window.SB_PLACE&&SB_PLACE.view)?SB_PLACE.view():null;
    if(!v||!S.draft.pl){ if(!viewOnboarding._asked){ viewOnboarding._asked=true; setTimeout(()=>{ viewOnboarding._asked=false; onbPlaceBegin(); },0); } }
    const pv=v||{ title:'Where shall we start?', sub:'Getting your words ready…', body:'<div role="status" style="padding:30px 0;text-align:center;color:var(--muted)">One moment…</div>', next:{ label:'Next word →', act:'placeNext', blocked:true } };
    card=shell(pv.title, pv.sub, pv.body, pv.art);
    foot={ label:pv.next.label, act:pv.next.act, blocked:!!pv.next.blocked };

  } else if(k==='buddy'){
    const avs=ONB_AVS.map(id=>SB_AVATARS.byId[id]).filter(Boolean);
    card=shell("Pick a buddy","Your speller's face around the app. There are plenty more to collect later — these five are ready now.",
      `<div class="sb-onb-hero">${avatarSVG(S.draft.avatar,320)}</div>
      <div class="sb-onb-avname">${esc((SB_AVATARS.byId[S.draft.avatar]||{}).name||'')}</div>
      <div class="sb-onb-avs">${avs.map(a=>{ const on=S.draft.avatar===a.id;
        return `<button class="sb-onb-av${on?' on':''}" data-act="pickAvatar" data-arg="${a.id}" title="${escA(a.name)}" aria-label="${escA(a.name)}" aria-pressed="${on?'true':'false'}"><span class="sb-onb-avart">${avatarSVG(a.id,128)}</span></button>`; }).join('')}</div>`);

  } else if(k==='world'){
    const worldCards=ONB_THEMES.map(id=>THEMES.find(t=>t.id===id)).filter(Boolean)
      .map(t=>worldHeroCard(t, t.id===S.draft.theme, false, 'onbWorld', true)).join('');
    card=shell("Choose a world","A world is the look of the app and a character that grows as your speller levels up. Two to start with — the rest unlock later. You can switch any time.",
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px">${worldCards}</div>`);

  } else {
    const goals=[{v:5,label:'5 words a day',sub:'Light & breezy',ic:'sprout'},{v:10,label:'10 words a day',sub:'Recommended',ic:'spark'},{v:15,label:'15 words a day',sub:'Bee-ready',ic:'flame'}]
      .map(g=>`<button data-act="pickGoal" data-arg="${g.v}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border-radius:14px;padding:16px 18px;cursor:pointer;transition:.15s;background:var(--surface2);border:2px solid ${S.draft.goal===g.v?'var(--accent)':'transparent'}">
        <div><div style="font-family:var(--display);font-weight:800;font-size:17px">${g.label}</div><div style="font-size:13px;color:var(--muted);font-weight:600">${g.sub}</div></div>
        <div style="width:40px;height:40px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(g.ic,20)}</div></button>`).join('');
    card=shell("Set a daily goal","A small daily habit beats cramming. Pick a starting target.",
      `<div style="display:grid;gap:11px">${goals}</div>
      <div style="margin-top:18px">
        <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:4px">Big bee day <span style="font-weight:600">(optional)</span></label>
        <p style="margin:0 0 8px;font-size:12px;color:var(--muted)">A competition coming up? Add the date — the app counts down to it and paces practice. You can set or change it in Settings any time.</p>
        <input type="date" data-chg="onbBeeDate" value="${escA(S.draft.beeDate||'')}" style="width:100%;max-width:220px;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:700;outline:none">
      </div>
      <div style="margin-top:14px">${voiceUpgradeTip()}</div>`);
    /* the dashed "Find my word difficulty first" card that sat here is gone (P1.7): placement is a step of its
       own for the 11+ bands, and the band-ladder test still lives on the word-difficulty page */
  }
  /* Three bands, not one centred stack: progress at the top, the question next to
     it, the actions pinned where a thumb is. The old frame centred everything in
     100dvh, which on a phone is ~290px of nothing above the heading and a primary
     button hanging off the bottom edge once the dev banner takes its 56px. */
  const blocked=foot.blocked;
  return `<div class="sb-onb">
    <div class="sb-onb-in">
      <div class="sb-onb-head">
        <div class="sb-onb-step">Step ${S.onbStep+1} of ${LAST+1}</div>
        <div class="sb-onb-dots" role="progressbar" aria-valuenow="${S.onbStep+1}" aria-valuemin="1" aria-valuemax="${LAST+1}">${dots}</div>
      </div>
      <div class="sb-onb-body">${card}</div>
      <div class="sb-onb-foot">
        <button class="sb-onb-back" data-act="onbBack">${S.onbStep===0?'Cancel':'Back'}</button>
        <button class="sb-onb-next" data-act="${foot.act}"${blocked?' aria-disabled="true"':''} style="opacity:${blocked?'.5':'1'}">${foot.label}</button>
      </div>
    </div>
  </div>`;
}

/* A home card whose data has not landed yet holds its own space rather than
   collapsing the grid — otherwise the row reflows the moment it arrives and the
   whole screen jumps. Same shell, same height, a quiet shimmer where the words
   will be. */
/* One waiting state for the whole app: the same comb the boot screen fills, at panel
   scale. A screen that waited on its data used to print a bare line of text, which reads
   as a different product than the one that just started up. */
function hiveLoader(label){ let cells='';
  for(let i=0;i<10;i++) cells+='<i class="sb-hive-cell" style="animation-delay:'+(i*0.13).toFixed(2)+'s"></i>';
  return `<div class="sb-hive" role="status" aria-live="polite">
    <div class="sb-hive-comb" aria-hidden="true">${cells}</div>
    <div class="sb-hive-lbl">${esc(label||'filling the hive…')}</div></div>`; }
function cardHold(label,h){ return `<div class="sb-card" aria-hidden="true" style="min-height:${h||128}px;padding:14px;display:flex;flex-direction:column;justify-content:center;gap:9px">
  <span style="font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)">${esc(label)}</span>
  <span class="sb-hold" style="width:58%"></span><span class="sb-hold" style="width:88%"></span><span class="sb-hold" style="width:71%"></span></div>`; }
/* ---- Word Journeys as lore: one lesson unlocks per Level cleared (any list) ---- */
function loreCount(c){ c=c||active(); try{ return Object.values(c.lists||{}).reduce((n,l)=>n+(l.stage||0),0); }catch(e){ return 0; } }
/* ONE rule for whether a Word Journeys lesson opens: the plan that carries journeys, testing's
   unlock, or a tale the child has earned. The screen itself is never locked (openJourneys). */
function journeyOpen(n){ if(state.devUnlock) return true; try{ if(window.SB_ENT && SB_ENT.has('journeys')) return true; }catch(e){} return +n<=loreCount(); }
/* HOME'S TWO READING CARDS CARRY A SMALL PAINTING (road to 4.5, P3.22 — rubric B6, "quote/tip cards flat"): a 56px
   vignette cut from the Library's own paintings (app-art/home/tip.webp, the hive's honey lamps; quote.webp, the books
   taking flight; 128x128 — tools/art/p3-gen.py, repainted in place when the bespoke vignettes are made). Drawn data-lsrc
   and shown only as it nears the screen (landShots, 60px): both cards sit below a phone's first screen, so the
   first-load image ratchet pays nothing for them. Once shown, a redraw keeps its src (no blink). */
function homeVign(src){ return `<span class="sb-vign" aria-hidden="true" style="flex-shrink:0;width:56px;height:56px;border-radius:14px;overflow:hidden;align-self:center;background:color-mix(in srgb,var(--treasure,#F0B429) 24%,var(--surface2,#f3eee3))"><img ${_lsrcSeen.has(src)?'src':'data-lsrc'}="${src}" alt="" width="56" height="56" loading="lazy" decoding="async" style="display:block;width:100%;height:100%;object-fit:cover"></span>`; }
// Tip of the day — pithy, rotating daily, banded to the speller's proven Bee Band:
// Bands 1–2 draw only from the Spelling Bee Basics concepts + gentle habit tips;
// 3–5 widen to easy/medium concepts and practice tips; 6+ open the full library + lore.
function tipOfDay(kid,asCard){ const pool=[]; let band=2; try{ band=beeBand(active()).band; }catch(e){} if(kid) band=Math.min(band,2);
  try{ const chs=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]);
    const basics=chs.filter(ch=>ch.category==='Spelling Bee Basics');
    const rest=band<=2?[]:chs.filter(ch=>ch.category!=='Spelling Bee Basics'&&(band>5||ch.difficulty!=='hard'));
    basics.concat(rest).forEach(ch=>{ const first=String(ch.concept||'').split(/(?<=[.!?])\s/)[0]; if(first&&first.length>30) pool.push(first); });
  }catch(e){}
  try{ const T=window.SB_TIPS||{}; if(!kid){
    const cats=band<=2?['young','memory','motivation','review']
      :band<=5?['memory','motivation','review','accuracy','consistency','oral']
      :['memory','accuracy','oral','written','origin','difficult','nerves','beeday','plateau','review'];
    cats.forEach(k=>(T[k]||[]).forEach(t=>pool.push(t))); }
  }catch(e){}
  try{ if(band>2) lessonsAll().slice(0,40).forEach(L=>{ if(L.hook) pool.push(L.hook); }); }catch(e){}
  /* the course chapters now wait for the first tap (boot-lazy, FIX-BEE N2), so a young speller's
     pool is empty at first paint — the bundled young tips stand in rather than a shimmer that
     never resolves until someone touches the screen */
  try{ if(!pool.length) ((window.SB_TIPS||{}).young||[]).forEach(t=>pool.push(t)); }catch(e){}
  if(!pool.length) return asCard?cardHold('Today\u2019s bee tip',128):'';
  // Up to 10 tips a day: a daily-resettable step lets the speller tap forward through more tips.
  const c0=active(); const day=dayNum(); const MAXFWD=10;
  if(c0){ if(c0.tipDay!==day){ c0.tipDay=day; c0.tipStep=0; } }
  const step=Math.max(0,Math.min(MAXFWD,(c0&&c0.tipStep)||0));
  /* pinned per day-and-step: the tip book grows with the lesson hooks, so an
     unpinned pick changes a second after the card paints */
  const t=trunc(settled('tip',day+'/'+step,()=>pool[(day+step)%pool.length]||null)||'',150);
  if(!t) return asCard?cardHold('Today\u2019s bee tip',128):'';
  const canFwd=step<MAXFWD;
  const fwd=`<button data-act="nextTip" ${canFwd?'':'disabled'} title="${canFwd?'Next tip ('+(MAXFWD-step)+' left today)':'That\u2019s all 10 tips for today \u2014 back tomorrow!'}" aria-label="Next tip" style="flex-shrink:0;align-self:center;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:16px;box-shadow:var(--edge);border:0;${canFwd?'background:var(--treasure,#F0B429);color:#5a3d00;cursor:pointer':'background:var(--surface2);color:var(--muted);opacity:.55'}">\u2192</button>`;
  // Card form for the home grid: same content and same forward nav, sized to sit beside the other tiles.
  if(asCard) return `<div class="sb-card sb-home-tip" style="display:flex;align-items:center;gap:12px;min-height:128px;padding:14px;border-left:4px solid var(--treasure,#F0B429)">
    ${homeVign('app-art/home/tip.webp')}
    <span style="min-width:0;flex:1">
      <span style="display:flex;align-items:center;gap:8px;font-size:10.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:4px">Today\u2019s bee tip${step>0?`<span style="letter-spacing:0;text-transform:none;font-weight:700;color:var(--muted)">\u00b7 ${step+1}/${MAXFWD+1}</span>`:''}</span>
      <span class="sb-tiptext" style="display:block;font-size:13.5px;line-height:1.5">${esc(trunc(t,132))}</span>
    </span>
    ${fwd}
  </div>`;
  return `<div style="position:relative;display:flex;align-items:center;gap:12px;background:var(--paper,var(--bg2));border:1px solid var(--line);border-left:4px solid var(--treasure,#F0B429);border-radius:14px;padding:14px 16px;margin-bottom:14px">
    <span style="min-width:0;flex:1"><span style="display:flex;align-items:center;gap:8px;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:3px">${kid?'Today\u2019s bee tip':'Tip of the day'}${step>0?`<span style="letter-spacing:0;text-transform:none;font-weight:700;color:var(--muted)">\u00b7 ${step+1}/${MAXFWD+1}</span>`:''}</span>
    <span class="sb-tiptext" style="display:block;font-size:15px;line-height:1.55">${esc(t)}</span></span>
    <span aria-hidden="true" style="flex-shrink:0;width:42px;height:48px;align-self:flex-end">${mascotSVG('happy')}</span>
    ${fwd}
  </div>`; }
/* ---- Weak-pattern radar: the analytics engine aimed at the speller (12+) ---- */
const TRAP_DEFS=[ ['double',/(.)\1/,'Double letters'], ['silent',/^(kn|wr|gn|ps|mn)|mb$|gh/i,'Silent letters'],
  ['ieei',/ie|ei/i,'ie / ei'], ['schwa',/(le|el|al|on|an|ar|er|or)$/i,'Schwa endings'],
  ['endings',/(tion|sion|ous|able|ible|ance|ence|ary|ery)$/i,'Suffix endings'] ];
function missTraps(){ const c=active(); const ms=(c.missed||[]); if(!ms.length) return [];
  const idx=wordIndex(); const b={};
  ms.forEach(m=>{ const w=idx[nkey(m.w)]||{w:m.w}; const n=m.n||1;
    TRAP_DEFS.forEach(([k,re])=>{ if(re.test(w.w)) b[k]=(b[k]||0)+n; });
    const o=(w.o||'').toLowerCase();
    if(/french/.test(o)) b.french=(b.french||0)+n; if(/greek/.test(o)) b.greek=(b.greek||0)+n; if(/latin/.test(o)) b.latin=(b.latin||0)+n; });
  const L={double:'Double letters',silent:'Silent letters',ieei:'ie / ei',schwa:'Schwa endings',endings:'Suffix endings',french:'French origin',greek:'Greek origin',latin:'Latin origin'};
  return Object.keys(b).map(k=>({k,label:L[k],n:b[k]})).sort((a,x)=>x.n-a.n); }
function topTraps(n){ return missTraps().slice(0,n||3); }
function trapWords(k){ const c=active(); const idx=wordIndex(); const def=TRAP_DEFS.find(t=>t[0]===k);
  const hit=(w)=>{ if(def) return def[1].test(w.w); const o=(w.o||'').toLowerCase(); return k==='french'?/french/.test(o):k==='greek'?/greek/.test(o):/latin/.test(o); };
  const mine=(c.missed||[]).map(m=>idx[nkey(m.w)]||{w:m.w}).filter(hit);
  const extra=journeySorted().filter(w=>hit(w)&&!state.luMastered[nkey(w.w)]&&!mine.some(x=>nkey(x.w)===nkey(w.w))).slice(0,Math.max(0,12-mine.length));
  return mine.concat(extra).slice(0,12); }
function trapRadar(){ const traps=topTraps(3); if(!traps.length) return '';
  const rows=traps.map(t=>`<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--surface)">
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:15px">${t.label}</span><span style="font-size:12px;color:var(--muted);font-weight:650">${t.n} miss${t.n>1?'es':''} traced here</span></span>
      <button data-act="drillTrap" data-arg="${t.k}" style="padding:8px 14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:13px;box-shadow:var(--edge)">Drill →</button></div>`).join('');
  return `<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:18px">
    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:3px"><div style="font-family:var(--display);font-weight:800;font-size:17px">Your traps</div><span style="font-size:12px;color:var(--muted);font-weight:650">where your misses cluster</span></div>
    <p style="margin:0 0 12px;font-size:13px;color:var(--muted)">Fix the pattern, not just the word.</p>
    <div style="display:flex;flex-direction:column;gap:8px">${rows}</div></div>`; }
/* ---- Worlds are worlds, not recolors: each world's hero card carries its own display
   face, palette, tagline and hero imagery (photo-duotone for Spotlight; CSS/SVG
   illustration for the rest). Body face & semantics never move. ---- */
const WORLD_HERO={
 spellbound:{ face:"'Fraunces',Georgia,serif", tag:'THE HIVE', ink:'#fff',
   bg:"background:radial-gradient(120% 130% at 20% 0%,#8B6FF0 0%,#4A32A8 55%,#2C1D6E 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:6px;width:110px;opacity:.9"><circle cx="95" cy="18" r="1.6" fill="#FFD34D"/><circle cx="70" cy="10" r="1.1" fill="#fff" opacity=".8"/><circle cx="108" cy="38" r="1.2" fill="#fff" opacity=".6"/><g transform="translate(78,26) rotate(-8)"><ellipse cx="0" cy="0" rx="11" ry="9" fill="#FFC23D"/><rect x="-8" y="1.5" width="16" height="3" rx="1.5" fill="#3A2A8C"/><ellipse cx="-7" cy="-8" rx="5" ry="7" fill="#EDE7FF" opacity=".92" transform="rotate(-24)"/><ellipse cx="7" cy="-8" rx="5" ry="7" fill="#EDE7FF" opacity=".92" transform="rotate(24)"/><circle cx="-3" cy="-2" r="1.4" fill="#2B1B5E"/><circle cx="3" cy="-2" r="1.4" fill="#2B1B5E"/></g></svg>' },
 marquee:{ face:"'Righteous',system-ui,sans-serif", tag:'TAKE THE STAGE', ink:'#F7E9C8',
   bg:"background-image:linear-gradient(180deg,rgba(20,12,4,.25),rgba(20,12,4,.62)),url('assets/spotlight-stage.png');background-size:cover;background-position:center", art:'' },
 aurora:{ face:"'Baloo 2',system-ui,sans-serif", tag:'CHART THE STARS', ink:'#EAF0FF',
   bg:"background:radial-gradient(130% 140% at 80% -10%,#3D4FBF 0%,#232B66 55%,#141838 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:4px;top:4px;width:118px"><circle cx="88" cy="26" r="13" fill="#7D8CF0"/><circle cx="83" cy="21" r="4" fill="#A9B4F7" opacity=".8"/><ellipse cx="88" cy="27" rx="24" ry="7" fill="none" stroke="#A9B4F7" stroke-width="1.4" opacity=".75" transform="rotate(-14 88 27)"/><circle cx="30" cy="12" r="1.3" fill="#fff" opacity=".9"/><circle cx="52" cy="44" r="1" fill="#fff" opacity=".6"/><circle cx="18" cy="34" r="1.1" fill="#fff" opacity=".7"/></svg>' },
 anime:{ face:"'Bangers',system-ui,sans-serif", tag:'DAWN DOJO', ink:'#FFEAF0',
   bg:"background:linear-gradient(160deg,#D8566F 0%,#8E2C44 60%,#571526 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:0;top:0;width:120px"><circle cx="92" cy="24" r="15" fill="#F3B2C0" opacity=".85"/><path d="M10 52 L112 8" stroke="#FFD9E2" stroke-width="2" opacity=".55"/><path d="M26 56 L118 20" stroke="#FFD9E2" stroke-width="1.1" opacity=".35"/></svg>' },
 science:{ face:"'Quicksand',system-ui,sans-serif", tag:'RUN THE EXPERIMENT', ink:'#DFF4EC',
   bg:"background:linear-gradient(150deg,#127a6a 0%,#0B4C42 60%,#062B25 100%);background-image:linear-gradient(rgba(223,244,236,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(223,244,236,.10) 1px,transparent 1px),linear-gradient(150deg,#127a6a 0%,#0B4C42 60%,#062B25 100%);background-size:18px 18px,18px 18px,100% 100%",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:8px;top:6px;width:100px"><path d="M78 10v14L66 48a5 5 0 0 0 4.6 7h18.8A5 5 0 0 0 94 48L82 24V10" fill="none" stroke="#8FE0CC" stroke-width="2.4" stroke-linecap="round"/><path d="M74 10h12" stroke="#8FE0CC" stroke-width="2.4" stroke-linecap="round"/><circle cx="76" cy="44" r="2.2" fill="#8FE0CC"/><circle cx="84" cy="38" r="1.6" fill="#8FE0CC" opacity=".7"/></svg>' },
 origami:{ face:"'Fredoka',system-ui,sans-serif", tag:'FOLD A WORLD', ink:'#FFF6E8',
   bg:"background:linear-gradient(150deg,#D97438 0%,#A64A1E 58%,#6E2E10 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:4px;width:112px"><g transform="translate(84,28) rotate(-6)"><path d="M0 -16 L18 10 L0 4 Z" fill="#FFE8D0"/><path d="M0 -16 L-18 10 L0 4 Z" fill="#F7C9A4"/><path d="M0 4 L6 16 L-6 16 Z" fill="#EDA671"/></g><path d="M14 46 q10 -8 20 0" stroke="#FFE8D0" stroke-width="1.6" fill="none" opacity=".6"/></svg>' },
 pixel:{ face:"'Bungee',sans-serif", tag:'INSERT COIN', ink:'#E4ECFF',
   bg:"background:linear-gradient(160deg,#3E63C4 0%,#22377A 60%,#131E45 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:6px;width:110px;image-rendering:pixelated"><g fill="#9DB8F8"><rect x="76" y="14" width="8" height="8"/><rect x="84" y="22" width="8" height="8"/><rect x="92" y="14" width="8" height="8"/><rect x="68" y="22" width="8" height="8"/><rect x="76" y="30" width="8" height="8" fill="#FFD34D"/><rect x="92" y="30" width="8" height="8"/></g><rect x="20" y="40" width="6" height="6" fill="#9DB8F8" opacity=".5"/></svg>' },
 avatar:{ face:"'Comfortaa',system-ui,sans-serif", tag:'BALANCE THE FOUR', ink:'#E6F4F9',
   bg:"background:linear-gradient(150deg,#2E8FB8 0%,#1D5E7C 58%,#103647 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:4px;width:112px"><g fill="none" stroke="#BFE4F2" stroke-width="2"><circle cx="72" cy="18" r="7"/><circle cx="94" cy="18" r="7" stroke="#F0B45B"/><circle cx="72" cy="40" r="7" stroke="#9BD3B4"/><circle cx="94" cy="40" r="7" stroke="#E4E8EC"/></g></svg>' },
};
/* One sentence per world, because the tile used to print the rank ladder's first
   and last form ("Egg -> Queen Bee") under every card. That is not a progression
   the world owns — the rank keeps the same ten forms in every world — so the line
   said nothing except, misleadingly, that picking a world changed your ladder.
   What a reader actually wants to know is what the place IS. */
const WORLD_ABOUT={
  spellbound:'The home hive: honey light, hexagons and the whole bee cast.',
  marquee:'A theatre at curtain-up — spotlights, velvet and a stage waiting for you.',
  aurora:'Deep space: star charts, ringed planets and a sky that never stops turning.',
  anime:'A dawn dojo — ink, blossom and the discipline of a single clean strike.',
  science:'A working lab: graph paper, glassware and an experiment already bubbling.',
  origami:'A folded world, built crease by crease out of coloured paper.',
  pixel:'An arcade at midnight — pixels, coin slots and high-score glow.',
  avatar:'The four elements held in balance: water, earth, fire and air.',
  godly:'A hall of the gods above the clouds, gold and pillars and long light.',
  serpent:'A jade lair of coils and shadow, deep in the roots of the world.',
  race:'A floodlit circuit at lights-out, tyres warm and the grid full.',
  dino:'A lost valley of ferns and giants, mist still on the ground.',
};
/* Each tile moves the way its world moves. One keyframe set (index.html), one
   layer per world, so a card is the place in miniature rather than a gradient. */
const WORLD_FX={
  spellbound:'<span class="wh-fx rise" style="--c:#FFD34D"></span>',
  marquee:'<span class="wh-fx sweep" style="--c:#FFF3C9"></span>',
  aurora:'<span class="wh-fx twinkle" style="--c:#fff"></span>',
  anime:'<span class="wh-fx slide" style="--c:#FFD9E2"></span>',
  science:'<span class="wh-fx rise" style="--c:#8FE0CC"></span>',
  origami:'<span class="wh-fx glide" style="--c:#FFE8D0"></span>',
  pixel:'<span class="wh-fx blink" style="--c:#9DB8F8"></span>',
  avatar:'<span class="wh-fx fall" style="--c:#BFE9FF"></span>',
  godly:'<span class="wh-fx spin" style="--c:#F6DC8A"></span>',
  serpent:'<span class="wh-fx wave" style="--c:#7BE0A0"></span>',
  race:'<span class="wh-fx scroll" style="--c:#FFD9CF"></span>',
  dino:'<span class="wh-fx drift" style="--c:#D9E8B0"></span>',
};
/* THE WORLDS ARE PAINTED (road to 4.5, P3.3 / P3.23 — "Shop worlds gradients", "world tiles are flat gradients with
   dots"): every world's tile wears its OWN play-field painting (the sgw-* plate its games already run on), cut to the
   tile's 2:1 band by tools/art/p3-gen.py --cut into app-art/wt/<id>.webp at 480x240 — the size it is drawn. The Shop's
   Worlds tab, the Collection's world cards, Settings → Look and onboarding's world step all draw it; the world's gradient
   stays under it as the bed, its drawn motif and dot layer step aside (the painting is the place), and a locked world
   keeps each surface's own greying over a painting that still shows its place — never a flat block. Guard:
   tests/p3-art.cjs (every world has its plate; a painted tile on all three surfaces). */
const WORLD_PLATE={ spellbound:1, aurora:1, anime:1, science:1, avatar:1, godly:1, race:1, dino:1 };
function worldPlateImg(id, eager){ return WORLD_PLATE[id]?`<img class="wh-plate" src="app-art/wt/${id}.webp" alt="" loading="${eager?'eager':'lazy'}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">`:''; }
function worldHeroCard(t, on, locked, act, eager){ const H=WORLD_HERO[t.id]||WORLD_HERO.spellbound; const ev=EVO[t.id]||EVO.spellbound; const pl=worldPlateImg(t.id, eager);
  const badge=on?'<span style="position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:#241E33;font-weight:800;font-size:12px;font-family:var(--ui,var(--body))">Active ✓</span>'
    :'';
  /* The price used to sit as a badge over the artwork, where it competed with the world's
     own title. It reads better as a line under the tile, beside what the world is. */
  /* A locked world names the Level that opens it — a learning lock, never a price (FIX-BEE C4). */
  const priceRow=locked?`<span style="display:block;margin-top:9px">${lockChip('plan',worldLockText(t.id))}</span>`:'';
  return `<button data-act="${act||'pickTheme'}" data-arg="${t.id}"${act==='onbWorld'?` aria-pressed="${on?'true':'false'}"`:''} style="position:relative;text-align:left;border-radius:20px;overflow:hidden;background:var(--paper,var(--bg2));border:1px solid var(--line);box-shadow:${on?'0 0 0 2px '+t.c1+',var(--sh-raised)':'var(--sh-rest)'};${locked?'opacity:.94':''}">
    <div class="wh-band${pl?' wh-painted':''}" style="position:relative;height:118px;${H.bg};${locked?(pl?'filter:grayscale(1) brightness(1.02)':'filter:grayscale(1) brightness(.96);opacity:.75'):''}">
      ${pl}${locked||pl?'':(WORLD_FX[t.id]||'')}${pl?'':H.art}${badge}
      <span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,7,26,0) ${pl?'30%':'42%'},rgba(10,7,26,${pl?'.62':'.42'}) 100%);pointer-events:none"></span>
      <div style="position:absolute;left:16px;bottom:10px;right:12px">
        <div style="font-family:${H.face};font-weight:800;font-size:26px;line-height:1;color:${H.ink};text-shadow:0 1px 6px rgba(0,0,0,.35)">${t.label}</div>
        <div style="font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.08em;color:${H.ink};opacity:.85;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${H.tag}</div>
      </div>
    </div>
    <div style="padding:10px 14px 12px">
      <span style="display:block;font-family:var(--ui,var(--body));font-size:12.5px;font-weight:600;line-height:1.42;color:var(--muted)">${esc(WORLD_ABOUT[t.id]||'A world of its own — colours, type and cast.')}</span>
      ${priceRow}
    </div></button>`; }
/* ---- Wayfinding tiles: destination color pops (spec §1). 48px solid tile, white icon,
   press edge, playful ±2–3° tilt. Colors are PLACE identity — stable across worlds. ---- */
const WAYFIND={ quest:{c:'var(--action,#6C4FE0)',ic:'steps',sb:null,label:'Practice paths'},
  trail:{c:'#C8791B',ic:'steps',sb:'steps',label:'The Word Atlas'},
  concepts:{c:'#0E8A78',ic:'grid',sb:'grid',label:'Word Concepts'},
  journeys:{c:'#C25A2E',ic:'book',sb:'book',label:'Word Journey'},
  builder:{c:'#7C5CFF',ic:'sliders',sb:'sliders',label:'List Builder'},
  arcade:{c:'#E8458C',ic:'joystick',sb:'gamepad',label:'Arcade'},
  themes:{c:'#B14FC4',ic:'palette',sb:'palette',label:'Theme Journeys'},
  figurative:{c:'#9C6A08',ic:'bulb',sb:'sparkle',label:'Idioms & Similes'},
  vocab:{c:'#2E8FB8',ic:'book',sb:'book',label:'Vocabulary'},
  typing:{c:'#5B3DD6',ic:'pencil',sb:'pencil',label:'Typing Trainer'},
  quotes:{c:'#C8791B',ic:'quote',sb:'star',label:'Quotes'},
  trivtrain:{c:'#DC7A18',ic:'bulb',sb:'sparkle',label:'Know the World of Words'},
  ipatrain:{c:'#2E6FD8',ic:'book',sb:'sparkle',label:'The Sound Alphabet'},
  traps:{c:'#C4453C',ic:'spark',sb:'target',label:'Your Traps'},
  revisions:{c:'#E0922E',ic:'book',sb:'target',label:'Your Revisions'},
  /* Advanced Mode destinations. These rows only render once Advanced Mode is on, and
     they deliberately sit inside the ordinary hubs rather than only behind the banner —
     an unlocked speller should meet them where they already look for that kind of work. */
  advconcepts:{c:'#5B3FA6',ic:'grid',sb:'grid',label:'Advanced Concepts'},
  advtips:{c:'#0E8A78',ic:'bulb',sb:'sparkle',label:'Advanced Tips & Tricks'},
  advmock:{c:'#C8901B',ic:'crown',sb:'trophy',label:'Mock Spelling Bee'} };
/* One predicate for "is Advanced Mode on", so every surface agrees. Mirrors advUnlocked()
   inside advanced.js and falls back to the same arithmetic if that module has not loaded. */
/* The Advanced Pack is a paid ADD-ON — not part of any tier, and not something a child
   levels into. advanced.js says so plainly ("READINESS ... never grants access"), but this
   fallback — the one that runs in the window before that module lazy-loads, which is
   exactly when Practice draws the Ultra pill — handed the pack to any free child at
   level 12 or band 7, and to anyone on Premium. It now mirrors advUnlocked() instead. */
function advModeOn(c){ c=c||active(); if(!c) return false;
  try{ if(window.ADV&&ADV.unlocked) return !!ADV.unlocked(); }catch(e){}
  try{ if(state.devUnlock) return true; }catch(e){}
  try{ if(window.SB_ENT && SB_ENT.hasAddon('advanced')) return true; }catch(e){}
  return !!(c.advOn||c.advPaid); }
/* The Journey is renamed once Advanced Mode is on — same ladder, but it now draws on the
   130k library, so calling it the beginner name undersells it. */
/* Headword sizing. A 58-letter word (Llanfairpwllgwyngyll...) has to shrink and wrap or it
   runs straight off the card. One helper so every headword behaves the same: step the size
   down by length, allow breaking anywhere, and report a wider container for long words. */
function hwStyle(w,max){ const L=String(w||'').length; max=max||40;
  const px = L<=10?max : L<=14?Math.round(max*0.84) : L<=20?Math.round(max*0.66)
           : L<=30?Math.round(max*0.50) : L<=44?Math.round(max*0.40) : Math.round(max*0.32);
  const min = Math.max(15,Math.round(px*0.66));
  return `font-size:clamp(${min}px,${(px/5).toFixed(1)}vw,${px}px);line-height:1.1;overflow-wrap:anywhere;word-break:break-word`; }
/* Long words get a roomier card so the wrap has somewhere to go. */
function hwWide(w,base){ const L=String(w||'').length; base=base||620;
  return L>34?Math.round(base*1.5):L>22?Math.round(base*1.25):base; }
/* The "here's how it's spelled" reveals use the entry font with wide letter-spacing, which
   costs roughly another 0.15em per character — so they overflow sooner than a plain
   headword. Shrink harder AND relax the tracking as the word grows. */
function hwSpell(w,max){ const L=String(w||'').length; max=max||32;
  const px = L<=8?max : L<=12?Math.round(max*0.82) : L<=16?Math.round(max*0.66)
           : L<=22?Math.round(max*0.52) : L<=32?Math.round(max*0.42) : Math.round(max*0.34);
  const ls = L<=12?'.14em' : L<=20?'.09em' : L<=30?'.05em' : '.02em';
  const min = Math.max(14,Math.round(px*0.68));
  return `font-size:clamp(${min}px,${(px/5).toFixed(1)}vw,${px}px);letter-spacing:${ls};line-height:1.15;overflow-wrap:anywhere;word-break:break-word`; }
function journeyName(){ return advModeOn()?'The Advanced Spelling Journey':'The Bizzing Bee Journey'; }
/* ---- Focus mode in Supercharge ---------------------------------------------------
   Supercharge and everything it leads to is the deep-learning half of the app, so it runs
   in Focus: music off and background held still. It does NOT touch the nav — the top nav is
   never collapsed. We only ever undo what we switched on ourselves, so a manual toggle
   elsewhere is respected. */
const FOCUS_NAVS=new Set(['explore','concepts','journeys','builder','vocab','figurative',
  'typing','quotes','trivtrain','revisions','traps','adv',
  /* added after play-testing: "clicking on word atlas is not freezing the background as
     it did with practice and library". The Atlas is the course itself, Practice is where
     the words are actually spelled, and the Coach is a reading screen — all three belong
     in the quiet half of the app. 'train'/'quest' come with 'coach' because Practice
     reaches them without the reader feeling they have left it. */
  'trail','coach','train','quest','coachdesk','ipatrain']);
function focusAutoSync(){ try{ const F=window.SB_W4_FOCUS; if(!F) return;
    const want=FOCUS_NAVS.has(state.nav);
    if(want && !F.on()){ F.toggle(); state._focusAuto=1; }
    else if(!want && F.on() && state._focusAuto){ F.toggle(); state._focusAuto=0; }
    else if(want) state._focusAuto=state._focusAuto||0;
  }catch(e){} }

/* ---- Advanced Mode activation ----------------------------------------------------
   Advanced Mode can switch on three ways: paying coins, reaching Level 12, or reaching
   Bee Band 7. The last two happen mid-session with no ceremony at all, and five things
   appear in five different places, so the speller needs telling. Fire once per child. */
/* One step per upgrade. `screen`/`rows`/`at` describe the destination well enough to
   redraw it in miniature, so the tour SHOWS where each feature landed rather than
   describing it — you watch the new row slide into the position it now occupies. */

function advCheckUnlock(){ try{ const c=active(); if(!c) return;
    if(state.devUnlock) return;   // tester mode opens gates; it never writes to the child (FIX-BEE M3) — no announcement, no activity row, no "day played"
    if(!advModeOn(c)) return; if(c.advAnnounced) return;
    c.advAnnounced=1; save();
    /* NO TAKEOVER ON UNLOCK. This used to open a sixteen-step guided tour over the whole
       screen the instant the pack went live — the wrong thing twice over: it interrupted
       the very moment the parent had just paid to reach, and it described features
       instead of letting the child meet them. The unlock is now a confetti burst and a
       one-line confirmation; the five new surfaces announce themselves where they live.
       If a "what's new" is ever wanted again it belongs in Settings, opened on purpose. */
    try{ sfx('win'); burstConfetti(150); }catch(e){}
    try{ flash('Advanced Pack active'); }catch(e){}
    try{ logActivity('unlock','Advanced Pack activated',{},[]); }catch(e){}
  }catch(e){} }
function wayTile(key,size,tilt){ const w=WAYFIND[key]; size=size||48;
  const glyph=(w.sb&&window.SB_ICON)?SB_ICON(w.sb,{size:24}):iconSVG(w.ic,24,2.2);
  return `<span style="width:${size}px;height:${size}px;flex-shrink:0;display:grid;place-items:center;border-radius:14px;background:${w.c};color:#fff;box-shadow:var(--edge),var(--sh-rest);transform:rotate(${tilt||-2.5}deg)">${glyph}</span>`; }
function figPool(){ if(!window.SB_FIG) return [];
  if(!window._figAll) window._figAll=(SB_FIG.idioms||[]).concat(SB_FIG.similes||[]).filter(x=>x.kid!==false);
  return window._figAll; }
/* Learning decks — idioms & similes organized like Concepts, played card by card. */
function figDecks(){
  if(window._figDecks) return window._figDecks;
  const P=figPool(); const D=[];
  const themed=[['animals','🐾 Animal idioms'],['body','💪 Body idioms'],['cuisine','🍰 Food & kitchen'],['emotions','💛 Feelings'],['sports','🏆 Games & sport'],['weather','⛅ Weather & sky'],['economics','🪙 Money & trade'],['war','🛡️ Battle words'],['seafaring','⚓ Sea & sailing'],['music','🎵 Music & stage'],['linguistics','✒️ Words about words']];
  for(const [th,label] of themed){ const items=P.filter(x=>x.t==='idiom'&&(x.th||[]).indexOf(th)>=0); if(items.length>=12) D.push({id:'th:'+th,label,items:items.length}); }
  const regions=[...new Set(P.filter(x=>x.lit&&x.region&&x.region!=='global').map(x=>x.region))];
  const big=regions.map(r=>[r,P.filter(x=>x.lit&&x.region===r).length]).filter(x=>x[1]>=12).sort((a,b)=>b[1]-a[1]);
  for(const [r,n] of big.slice(0,8)) D.push({id:'rg:'+r,label:'🌍 '+r,items:n});
  D.push({id:'world',label:'🌍 Around the world (mixed)',items:P.filter(x=>x.lit).length});
  D.push({id:'proverbs',label:'📜 Proverbs',items:P.filter(x=>x.t==='proverb').length});
  D.push({id:'sim:asas',label:'🔍 Similes — as … as',items:P.filter(x=>x.t==='simile'&&x.pattern==='as-as').length});
  D.push({id:'sim:like',label:'🔍 Similes — like a …',items:P.filter(x=>x.t==='simile'&&x.pattern==='like').length});
  D.push({id:'folk',label:'🧚 Busted! Famous myth origins',items:P.filter(x=>x.oc==='folk').length});
  window._figDecks=D.filter(d=>d.items>=8); return window._figDecks;
}
function figDeckItems(id){ if(!id) return [];
  window._figDeckCache=window._figDeckCache||{}; if(window._figDeckCache[id]) return window._figDeckCache[id];
  const P=figPool(); let items=[];
  if(id.slice(0,3)==='th:') items=P.filter(x=>x.t==='idiom'&&(x.th||[]).indexOf(id.slice(3))>=0);
  else if(id.slice(0,3)==='rg:') items=P.filter(x=>x.lit&&x.region===id.slice(3));
  else if(id==='world') items=P.filter(x=>x.lit);
  else if(id==='proverbs') items=P.filter(x=>x.t==='proverb');
  else if(id==='sim:asas') items=P.filter(x=>x.t==='simile'&&x.pattern==='as-as');
  else if(id==='sim:like') items=P.filter(x=>x.t==='simile'&&x.pattern==='like');
  else if(id==='folk') items=P.filter(x=>x.oc==='folk');
  const ord={easy:0,medium:1,hard:2};
  items=items.slice().sort((a,b)=>(ord[a.diff]-ord[b.diff])||a.p.localeCompare(b.p)).slice(0,30);
  window._figDeckCache[id]=items; return items;
}
/* Vocabulary decks: the speller's own words, NSF vocabulary-bee style. */
/* ---- Vocabulary progression -------------------------------------------------------
   Vocab used to be an ungraded flashcard browser: "New set of 20" reshuffled the deck
   whether or not the speller had learned anything. It now has its own ladder.

   Study the set → Check yourself on those exact words → 80% or better unlocks the next
   set of NEW words. Below 80%, the words you missed go into a revision queue and the
   next set stays locked until that queue is empty. A word leaves the queue the first
   time you answer it correctly in a revision round, so the loop always terminates.

   Passing with a few wrong (say 17/20) still progresses, but those few are carried into
   the next set rather than quietly dropped — you meet them again.

   This ladder is deliberately SEPARATE from spelling. It writes only to c.vocab, and the
   check never calls markMastered/addMiss/gainXp, so a vocabulary session cannot move the
   spelling stage, the spelling XP or the Bee Band. Spelling progresses on its own. */
const VOC_PASS = 0.8;            // the bar for unlocking a new set
             // words per vocabulary set
function vocProg(c){ c=c||active(); if(!c) return null;
  if(!c.vocab) c.vocab={};
  const v=c.vocab;
  v.lv=v.lv||{}; v.revise=v.revise||{}; v.seen=v.seen||{}; v.cur=v.cur||{};
  v.carry=v.carry||{}; v.last=v.last||{};
  v.known=v.known||{}; v.miss=v.miss||{};    // per-word knowledge, drawn by the heatmap
  return v; }

/* The check: one multiple-choice meaning question per word in the set. Distractors are
   other real definitions at a similar difficulty, so the answer cannot be guessed by
   register alone. */
/* Apply the 80% rule. Two paths, and neither of them touches spelling progress:
   pass  → level up, next set of new words unlocks, any few misses are carried forward
   fail  → the missed words go into the revision queue and the next set stays locked
   In a revision round a word leaves the queue the first time it is answered correctly,
   so repeated rounds always shrink the queue and the loop terminates. */
function vocFinishCheck(){ const g=state.vocCheck; if(!g) return;
  const c=active(); const v=vocProg(c); const deck=g.deck;
  const total=g.qs.length, right=g.right, pct=total?right/total:0;
  g.done=true; g.pct=pct;
  /* Practice is exactly that — it scores nothing, unlocks nothing and locks nothing. It
     exists so a speller can drill the meanings as often as they like without the graded
     run hanging over them. */
  if(g.mode==='practice'){ save(); render(); return; }
  if(g.mode==='revise'){
    // clear every queued word that was answered correctly this round
    const stillWrong=new Set(g.missed);
    v.revise[deck]=(v.revise[deck]||[]).filter(k=>stillWrong.has(k));
    g.cleared=total-g.missed.length;
    g.remaining=v.revise[deck].length;
  } else {
    v.last[deck]={right,total,at:Date.now()};
    if(pct>=VOC_PASS){
      v.lv[deck]=(v.lv[deck]||0)+1;
      v.revise[deck]=[];
      // passing with a few wrong still progresses, but those few come back next set
      v.carry[deck]=g.missed.slice(0,10);
      g.passed=true;
    } else {
      v.revise[deck]=g.missed.slice();
      g.passed=false;
    }
  }
  try{ if(g.passed) sfx('win'); }catch(e){}
  save(); render(); }

function vocBuildCheck(words){ const pool=gameWordsD({needDef:true});
  return (words||[]).filter(w=>w&&w.d).map(w=>{
    const near=pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d&&Math.abs((x.y||3)-(w.y||3))<=1);
    const src=near.length>=3?near:pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d);
    const others=mcDistinct(w.d, sample(src).slice(0,24).map(x=>x.d).filter(Boolean), 3);   // distinct, never a second copy of the answer (FIX-BEE D8)
    return { w, answer:w.d, choices:sample([w.d].concat(others)) }; }); }

/* Every list in the coach catalogue — the curated ones, the NSF tiers, the origin lists,
   plus anything the speller built with the List Builder, pasted in, or generated — can be
   studied as a vocabulary deck. Only words that actually carry a meaning are usable, since
   the whole deck is word → meaning. */
function vocListCats(){ try{
    /* coachCatalog() covers the curated and built lists but not the ladder lists the dock
       defaults to, so seed those first. */
    const seed=[];
    [['journey',journeyName().replace(/^The /,''),'Your main spelling journey'],
     ['default','Level-Up','The 20-stage default ladder']].forEach(([k,label,sub])=>{
      try{ const ws=listFullWords(k)||[]; if(ws.length) seed.push({key:k,label,sub,words:ws}); }catch(e){} });
    return seed.concat(coachCatalog()).map(cat=>{
      const defs=(cat.words||[]).filter(w=>w&&w.w&&String(w.d||'').trim().length>3);
      return { key:cat.key, label:cat.label, sub:cat.sub, words:defs, n:defs.length }; })
      .filter(cat=>cat.n>=8)             // below this a 4-option quiz cannot be built fairly
      .filter((cat,i,a)=>a.findIndex(x=>x.key===cat.key)===i);
  }catch(e){ return []; } }
function vocListCat(key){ return vocListCats().find(c=>c.key===key)||null; }
/* A deck key is 'list:<catalogue key>' so it cannot collide with the level or theme decks,
   and so each list keeps its own vocabulary level in c.vocab. */
function vocDeckLabel(k){ k=String(k||'');
  if(k.slice(0,5)==='list:'){ const cat=vocListCat(k.slice(5)); return cat?cat.label:'List'; }
  if(k.slice(0,3)==='th:'){ const t=(myThemes()||[]).find(x=>x.id===k.slice(3)); return t?t.label:'Theme'; }
  return ({mix:'My level mix',easy:'Easy',medium:'Medium',hard:'Hard',champ:'Champ'})[k]||'Vocabulary'; }
/* ===== Typing Trainer — touch-typing lessons + 60s typing test (online bees are typed!) ===== */
const TY_LESSONS=[
  {id:'home1', name:'F & J — the bumps', seq:'fj fj jf fjf jfj ff jj fjfj jfjf fj', tip:'Rest your index fingers on F and J — feel the little bumps? Never look down!'},
  {id:'home2', name:'D & K', seq:'dk dk kd dkd kdk fd jk dfk jkd dkfj', tip:'Middle fingers on D and K. Index fingers stay home on F and J.'},
  {id:'home3', name:'S & L', seq:'sl sl ls sls lsl sd lk sdf lkj sldk', tip:'Ring fingers on S and L — they are the wobbliest, be patient with them.'},
  {id:'home4', name:'A & ;', seq:'a; a; ;a a;a ;a; as ;l asdf jkl; aa;;', tip:'Pinkies on A and semicolon. The whole home row is yours now!'},
  {id:'home5', name:'Home-row words', seq:'dad sad lad ask all fall lass salad flask', tip:'Real words, home keys only. Keep your eyes on the screen.'},
  {id:'top1', name:'E & I', seq:'ed ik de ki die lie side like idea slide', tip:'Reach up with your middle fingers, then come straight home.'},
  {id:'top2', name:'R & U', seq:'rf uj fur run rude sure lure user rule', tip:'Index fingers reach up for R and U.'},
  {id:'top3', name:'W O T Y Q P', seq:'wow top yet toy quote power query type', tip:'The rest of the top row — pinkies get Q and P.'},
  {id:'bot1', name:'V N C M', seq:'vn cm van can move nice mind cave once', tip:'Index and middle fingers dip down. Thumbs stay on the space bar.'},
  {id:'bot2', name:'X Z and , .', seq:'zax mix, zoom. exact, prize. dozen fizz.', tip:'Pinkies and ring fingers dive for the corners.'},
  {id:'caps', name:'Capitals with Shift', seq:'Fox Jam Kid Sun The Bee Wins Big Now', tip:'Hold Shift with the OPPOSITE pinky, then tap the letter.'},
  {id:'words', name:'Common words', seq:'the and you that was for are with they have this from', tip:'The twelve most common words — type them until they flow.'},
  {id:'bee', name:'Bee words at your level', dyn:true, tip:'Your own spelling words — type them fast AND right.'},
  {id:'sent', name:'Sentences from your words', dyn:'sent', tip:'Real sentences from your word bank — capitals, commas, periods. Just like the online bee.'},
  {id:'mean', name:'Type the meaning', dyn:'mean', tip:'Hear the word, then type its meaning — spelling, typing and vocabulary in one drill.'},
];
function tyStop(){ if(window._tyH){ try{window.removeEventListener('keydown',window._tyH,true);}catch(e){} window._tyH=null; } const t=state.ty; if(t&&t.timer){ clearInterval(t.timer); t.timer=null; } }
function quoteList(){ const all=(window.SB_QUOTES||[]); const cat=state.qCat;
  if(cat==='__fav'){ const f=(active().quoteFavs)||{}; return all.filter(x=>f[(x.q||'').slice(0,60)]); }
  if(!cat) return all; return all.filter(x=>x.c===cat); }
// Track distinct quotes a speller has read, so Progress can show real engagement.
function markQuoteSeen(){ try{ const L=quoteList(); const x=L[state.qi||0]; if(!x) return; const c=active(); if(!c) return;
  c.qSeen=c.qSeen||{}; const k=(x.q||'').slice(0,44); if(!c.qSeen[k]){ c.qSeen[k]=1; save(); } }catch(e){} }

/* Six destinations, one drawn set. Duotone on the 24-grid: a soft currentColor wash
   under bold strokes, so every world tints both layers and the six read as siblings
   at 22px. Replaces the mixed illustrated/line glyphs the bar used to carry. */
/* Each tab keeps its own colour, so the nav reads as five places rather than five
   grey glyphs. The colours are PLACE identity and do not follow the world theme —
   the same reason the wayfinding tiles have fixed colours. On the active tab the
   icon drops back to currentColor, because the pill behind it is already the
   accent and a coloured glyph on it would be unreadable. */
const NAV_TINT={ home:'#F0A93C', atlas:'#6C4FE0', practice:'#E8458C', library:'#0E8A78',
  play:'#3B6FE0', hive:'#C8901B', progress:'#C8901B', feed:'#D2553A', analogy:'#2E9E5B' };
/* THE ANALOGY GATE (owner, 10 Oct 2026 — the road to 4.5, decision §1.2, P0.4/P0.5). The analogy content
   (analogy-data.js) was written by Claude; three independent agent rounds review it, every verdict a row in
   analogy-review/analogy-review.json, and "an item ships only with three passes". Until the owner releases it on
   the round-3 report, EVERY surface that reads it — the Analogies tab, its lessons and Against the Clock, Mock
   Analogy Bee (Play card + #/anlbee), the Library's Link Finder (#/links) and My Feed's analogy cards — is
   reachable ONLY in tester mode. This one line is the release; tests/analogy-release.cjs refuses `true` while
   any item lacks its three passes, and tests/analogy-gate.cjs holds every surface to it in the browser.
   TESTER MODE is the grown-up's, never a child's: Settings → Grown-ups → Testing tools → Tester mode, or
   ?tester=1, which asks for the grown-up PIN first (family-shell.js) — a child who types it meets the PIN, not
   the content. The testing unlock ("Unlock everything", devUnlock) counts as tester mode. Word Forge keeps its
   own sign-off gate (SB_FORGE.signedOff) and opens to tester mode the same way.
   RELEASED by the owner on 10 Oct 2026 ("release analogies") on analogy-review/REPORT.md: 1,153 items, every one
   with three passes in the ledger (tests/analogy-release.cjs checks it on every deploy). */
window.SB_ANL_RELEASED=true;
function testerOn(){ try{ return !!(state.devUnlock||state.tester); }catch(e){ return false; } }
function anlOpen(){ return window.SB_ANL_RELEASED===true||testerOn(); }
window.SB_ANL_OPEN=anlOpen; window.SB_TESTER_ON=testerOn;
/* where a gated analogy screen lands instead: Home, or the Library for its Link Finder */
const ANL_NAVS={analogy:'home', anlbee:'home', anltool:'explore'};
/* The tabs, in the family order. My Feed is the LAST tab, after Play (owner, 2 Oct 2026,
   FAMILY-STANDARD §6a) — and it goes, with its ☰ row, when a grown-up switches it off.
   SIX TABS, WORD GYM UNDER WORD ATLAS (owner, 10 Oct 2026 — the road to 4.5, decision §1.1): "Home · Word Atlas ·
   Analogies · Library · Play · My Feed. Word Gym stops being a top tab and becomes the second sub-nav of Word Atlas
   (Atlas | Gym)" — atlasSubNav(), drawn on the Atlas map and on the Word Gym. Its nav key is still 'coach' and its
   route still #/practice, and the Word Atlas tab lights for both. Analogies sits right after Word Atlas, and only
   while the analogy gate is open (anlOpen) — five tabs until then, which the family's 4–6 allows. */
function NAV_TABS(phone){ const t=[['home','Home','home'],['trail',phone?'Atlas':'Word Atlas','atlas']];
  if(anlOpen()) t.push(['analogy',phone?'Analogy':'Analogies','analogy']);
  t.push(['explore','Library','library'],['games','Play','play']);
  if(!state.feedOff) t.push(['feed','My Feed','feed']); return t; }
/* the Word Gym's screens: they belong to the Word Atlas tab now (a drill from an Atlas stop always did) */
function gymNav(S){ S=S||state; return S.nav==='coach'||S.nav==='quest'||S.nav==='levelup'||(S.nav==='train'&&!atlasDrill()); }
function atlasTabOn(S){ S=S||state; return S.nav==='trail'||atlasDrill()||gymNav(S); }
/* THE WORD ATLAS's SUB-NAV — Atlas | Gym (owner, 10 Oct 2026), the family's sub-page head: two chips at the top of
   the Atlas map and of the Word Gym, the one you are on marked (aria-current), each a real button (Tab + Enter, or
   a tap). `on` is 'atlas' or 'gym'. */
function atlasSubNav(on){
  const chip=(k,act,ic,label)=>`<button data-act="${act}" class="sb-subchip" aria-current="${on===k?'page':'false'}">${navIcon(ic,18,on===k)}<span>${label}</span></button>`;
  return `<nav class="sb-subnav" aria-label="Word Atlas">${chip('atlas','openTrail','atlas','Atlas')}${chip('gym','openCoach','practice','Gym')}</nav>`; }
function navIcon(key,size,plain){ size=size||22;
  const tint=plain?'currentColor':(NAV_TINT[key]||'currentColor');
  const w=(inner)=>`<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="${tint}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block;flex-shrink:0">${inner}</svg>`;
  const f=(d)=>`<path d="${d}" fill="${tint}" stroke="none" opacity="${plain?'.17':'.24'}"/>`;
  const M={
    /* a hive-roofed home */
    home:()=>w(f('M12 3.4 20.4 10v10.2H3.6V10z')+'<path d="M3.4 10.4 12 3.4l8.6 7"/><path d="M5.4 10.2V20.4h13.2V10.2"/><path d="M8.6 14.2h6.8M8.6 17.4h6.8"/>'),
    /* a folded map with a route across it */
    atlas:()=>w(f('M3.4 6.4 9 4.2l6 2.2 5.6-2.2v13.4L15 19.8l-6-2.2-5.6 2.2z')+'<path d="M3.4 6.4 9 4.2l6 2.2 5.6-2.2v13.4L15 19.8l-6-2.2-5.6 2.2z"/><path d="M9 4.2v13.4M15 6.4v13.4"/><path d="M6.2 14.6c2-2.4 3.4-.6 5-2.6s2.6-4 4.8-4.4" stroke-dasharray="1.6 2.4"/>'),
    /* a pencil that has just written a line */
    practice:()=>w(f('M4 20l4.4-1L19.3 8.1a2.1 2.1 0 0 0-3-3L5.4 16z')+'<path d="M4 20l4.4-1L19.3 8.1a2.1 2.1 0 0 0-3-3L5.4 16z"/><path d="M14.3 6.1l3 3"/><path d="M4.4 22h15"/>'),
    /* three books on a shelf */
    library:()=>w(f('M4.6 4.6h4v14.8h-4zM10.4 4.6h4v14.8h-4z')+'<rect x="4.6" y="4.6" width="4" height="14.8" rx="1.1"/><rect x="10.4" y="4.6" width="4" height="14.8" rx="1.1"/><path d="M16.6 5.6l3.2.8-3 14.4-3.2-.8z"/><path d="M4.6 9.4h4M10.4 9.4h4"/>'),
    /* a bridge: an analogy carries a link from one pair across to another */
    analogy:()=>w(f('M3 16.6c2.6-5.4 15.4-5.4 18 0V19H3z')+'<path d="M3 16.6c2.6-5.4 15.4-5.4 18 0"/><path d="M2.4 19.2h19.2"/><path d="M7 13.6v5.6M12 12.2v7M17 13.6v5.6"/>'),
    /* a gamepad */
    play:()=>w(f('M7.2 7.4h9.6a4.6 4.6 0 0 1 4.6 4.6v.6a4 4 0 0 1-7.1 2.5H9.7A4 4 0 0 1 2.6 12.6V12a4.6 4.6 0 0 1 4.6-4.6z')+'<path d="M7.2 7.4h9.6a4.6 4.6 0 0 1 4.6 4.6v.6a4 4 0 0 1-7.1 2.5H9.7A4 4 0 0 1 2.6 12.6V12a4.6 4.6 0 0 1 4.6-4.6z"/><path d="M6.4 11.6h2.8M7.8 10.2v2.8"/><circle cx="15.4" cy="10.8" r=".9" fill="${tint}" stroke="none"/><circle cx="17.6" cy="12.8" r=".9" fill="${tint}" stroke="none"/>'),
    /* a climbing chart with the last point lit */
    /* a skep hive with its comb — My Hive is a tab now, not a face in the corner */
    hive:()=>w(f('M12 3.2c4.3 0 7.4 3.6 7.4 8.4s-3.1 8.8-7.4 8.8-7.4-4-7.4-8.8S7.7 3.2 12 3.2z')+'<path d="M12 3.2c4.3 0 7.4 3.6 7.4 8.4s-3.1 8.8-7.4 8.8-7.4-4-7.4-8.8S7.7 3.2 12 3.2z"/><path d="M5.6 8.6h12.8M4.8 12.4h14.4M5.4 16.2h13.2"/><path d="M10.4 20.4h3.2"/>'),
    /* My Feed: two stacked cards, the top one with a line of text — a feed you read, then it ends */
    feed:()=>w(f('M5.2 8.4h13.6a1.6 1.6 0 0 1 1.6 1.6v8.6a1.6 1.6 0 0 1-1.6 1.6H5.2a1.6 1.6 0 0 1-1.6-1.6V10a1.6 1.6 0 0 1 1.6-1.6z')+'<rect x="3.6" y="8.4" width="16.8" height="11.8" rx="1.8"/><path d="M6.2 5.8h11.6M8.2 3.4h7.6"/><path d="M7 12.6h10M7 16h6.2"/>'),
    progress:()=>w(f('M4.6 19.4h15V21h-15zM6.4 13h2.8v6.4H6.4zM11.2 9.6H14v9.8h-2.8zM16 5.8h2.8v13.6H16z')+'<path d="M4 20.4h16"/><rect x="6.4" y="12.4" width="3" height="8" rx="1.1"/><rect x="11" y="9" width="3" height="11.4" rx="1.1"/><rect x="15.6" y="5.2" width="3" height="15.2" rx="1.1"/><circle cx="17.1" cy="3" r="1.5" fill="${tint}" stroke="none"/>'),
  };
  return (M[key]||M.home)();
}
/* ===================== WHY THAT MISS (FIX-BEE D3, Oct 2026) =====================
   A wrong answer used to say '✗ Not quite — it's "army"' and nothing else, with a frowning
   bee. Now every surface that grades a typed or picked spelling shows the same two things,
   and HOLDS until the child taps on:
     1. the letters, one column per letter — what they wrote over what the word is, with
        the letters that differ lit (missAlign: an edit-distance alignment, so a dropped
        letter shows as a gap rather than shifting every letter after it);
     2. WHY — the concept family that explains THAT miss, found from where the letters
        actually differ (a dropped k at the front is a silent letter; a lost m in
        committee is a double letter), falling back to the word's own trickAnal family.
        The rule line comes from the Coach's rulebook (SB_COACH_RULES[k].check, lazy) or
        TRAP_TIP while it loads; the word's own memory hook (w.h) follows when it has one.
   Shown only AFTER an attempt, so it cannot leak a spelling. Guard: tests/answer-feedback.cjs. */
function missAlign(typed, word){ const a=String(typed||'').toLowerCase().slice(0,60), b=String(word||'').toLowerCase();
  const m=a.length, n=b.length; const D=[]; for(let i=0;i<=m;i++){ D.push(new Array(n+1).fill(0)); D[i][0]=i; } for(let j=0;j<=n;j++) D[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++) D[i][j]=Math.min(D[i-1][j]+1, D[i][j-1]+1, D[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
  const cols=[]; let i=m, j=n;
  while(i>0||j>0){
    if(i>0&&j>0&&a[i-1]===b[j-1]&&D[i][j]===D[i-1][j-1]){ cols.push({t:a[i-1],w:b[j-1],op:'ok'}); i--; j--; }
    else if(i>0&&j>0&&D[i][j]===D[i-1][j-1]+1){ cols.push({t:a[i-1],w:b[j-1],op:'sub'}); i--; j--; }
    else if(j>0&&D[i][j]===D[i][j-1]+1){ cols.push({t:'',w:b[j-1],op:'del'}); j--; }
    else { cols.push({t:a[i-1],w:'',op:'ins'}); i--; } }
  return cols.reverse(); }
const MISS_CLS_KEY={dbl:'double',silent:'silent',vow:'ieei',end:'endings',fr:'french',gk:'greek',epon:'epon',hom:'hom'};
const MISS_LABEL={double:'Double letters',silent:'Silent letters',ieei:'ie or ei',schwa:'The schwa',endings:'Suffix endings',french:'French patterns',greek:'Greek patterns',latin:'Latin roots',epon:'Words from names',hom:'Sound-alikes'};
const MISS_TIP_X={ epon:'This word is named after a person or a place. Spell the name first, then add the ending.',
  hom:'Another word sounds exactly like this one. Only the meaning tells you which spelling is wanted — ask for it.',
  plain:'Say it slowly, one beat at a time, and spell each beat. Then say the whole word again and check it sounds right.' };
function missWhy(wo, typed){ const w=String((wo&&wo.w)||wo||'').toLowerCase(); if(!w) return null;
  const rec=(typeof wo==='object'&&wo)||{w:w}; const full=wordIndex()[w]||rec;
  const cols=missAlign(typed,w); const zone=new Set(); let wi=0, vowSwap=false, dblHit=false;
  cols.forEach(c=>{ if(c.op==='ins'){ zone.add(Math.max(0,wi-1)); zone.add(Math.min(w.length-1,wi));
        if(c.t===w[wi-1]||c.t===w[wi]) dblHit=true; return; }
      if(c.op!=='ok'){ zone.add(wi); if(c.op==='del'&&(w[wi-1]===c.w||w[wi+1]===c.w)) dblHit=true;
        if(c.op==='sub'&&/[aeiouy]/.test(c.t)&&/[aeiouy]/.test(c.w)) vowSwap=true; }
      wi++; });
  const hit=(re)=>{ const g=new RegExp(re.source,'g'); let mm; while((mm=g.exec(w))){ for(let i=mm.index;i<mm.index+mm[0].length;i++) if(zone.has(i)) return true; if(g.lastIndex===mm.index) g.lastIndex++; } return false; };
  let k=null;
  if(hit(/^(kn|wr|gn|ps|pn|mn|rh)/)||hit(/(mb|mn|gn)$/)||(hit(/gh/)&&!/ough|augh/.test(w))||hit(/(stle|sten|ften)$/)) k='silent';
  else if(dblHit||hit(/([b-df-hj-np-tv-z])\1/)) k='double';
  else if(hit(/ie|ei/)) k='ieei';
  /* E5: an ending is only a SUFFIX when a real stem stands before it — "giant" ends in -ant but
     "gi" is no stem, so a miss there is the schwa, never "Suffix endings". */
  else if((()=>{ const m=w.match(/(able|ible|ance|ence|ancy|ency|ant|ent|ary|ery|ory|ury|tion|sion|cian|eous|ious|uous|ous|cede|ceed|sede)$/); return m && w.length-m[0].length>=3 && hit(/(able|ible|ance|ence|ancy|ency|ant|ent|ary|ery|ory|ury|tion|sion|cian|eous|ious|uous|ous|cede|ceed|sede)$/); })()) k='endings';
  else if(hit(/ph|rh|ch|y(?=[^aeiou])/)&&/greek/i.test(full.o||'')) k='greek';
  else if(hit(/eau|que$|gue$|ette$|oir|ille|et$/)) k='french';
  else if(vowSwap) k='schwa';
  if(!k){ try{ const cls=trickAnal(full).cls; k=MISS_CLS_KEY[cls]||null; }catch(e){} }
  if(k==='endings'){ const m=w.match(/(able|ible|ance|ence|ancy|ency|ant|ent|ary|ery|ory|ury|tion|sion|cian|eous|ious|uous|ous|cede|ceed|sede|ize|ise|ful|less|ness|ment|ly|er|or|ar)$/); if(!m||w.length-m[0].length<3) k=vowSwap?'schwa':null; }
  if(!k && homPartners(w).length) k='hom';
  const R=(window.SB_COACH_RULES||{})[k]||null;
  if(!R) lazyNeed('coachRules');
  /* P1.19 (road to 4.5): the tip is matched to the TYPE of this mistake (SB_MISS_ERR, coach-rules.js — a dropped
     final e, a double, ie/ei, -able/-ible, a silent letter, a vowel…), read from the typed letters against the word;
     the concept family speaks only when no rule matches (or until the rulebook has landed). */
  let E=null; if(typed){ try{ E=window.SB_MISS_ERR?SB_MISS_ERR(typed,w,{hom:homPartners(w),isWord:x=>!!wordIndex()[x]}):null; }catch(e){} }
  if(E) return { k:E.fam||k||'plain', err:E.t, label:E.label, tip:E.tip, hook:full.h||rec.h||'', cols };
  const tip=(R&&R.check)||((typeof TRAP_TIP!=='undefined'&&TRAP_TIP[k])||MISS_TIP_X[k])||MISS_TIP_X.plain;
  return { k:k||'plain', label:(R&&R.label)||MISS_LABEL[k]||'How to get it next time', tip, hook:full.h||rec.h||'', cols }; }
/* The whole miss panel. typed='' (asked to see it / picked nothing) still shows the word in
   letters and the why. opts.head overrides the headline. */
function missFeedbackHTML(wo, typed, opts){ opts=opts||{}; const why=missWhy(wo, typed); if(!why) return '';
  const word=String((wo&&wo.w)||wo||'');
  const cell=(ch,kind,row)=>{ const bad=row==='t'&&kind!=='ok', good=row==='w'&&kind!=='ok';
    const gap=(row==='t'&&kind==='del')||(row==='w'&&kind==='ins');
    return `<span class="sb-mdc${gap?' gap':''}" style="display:grid;place-items:center;min-width:1.15em;height:1.45em;padding:0 2px;border-radius:5px;${gap?'border:1.5px dashed var(--line)':bad?'background:color-mix(in srgb,var(--bad) 20%,transparent);color:var(--bad);text-decoration:'+(kind==='ins'?'line-through':'none'):good?'background:color-mix(in srgb,var(--good) 22%,transparent);color:var(--good)':'color:var(--muted)'}">${gap?'&nbsp;':esc(ch)}</span>`; };
  const cols=why.cols.map(c=>`<span class="sb-mdcol" data-op="${c.op}" style="display:inline-flex;flex-direction:column;gap:3px">${cell(c.t,c.op,'t')}${cell(c.w,c.op,'w')}</span>`).join('');
  const nDiff=why.cols.filter(c=>c.op!=='ok').length;
  const summary=(typed?'You wrote '+typed+'. ':'')+'The word is spelled '+word.split('').join(' ')+'. '+(typed?nDiff+' letter'+(nDiff===1?'':'s')+' differ.':'');
  return `<div class="sb-miss" data-why="${escA(why.k)}" data-err="${escA(why.err||'')}" style="text-align:left;background:var(--surface);border:1.5px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:14px;animation:sb-pop .3s ease both">
      <div style="font-weight:800;font-size:14.5px;color:var(--text);margin-bottom:9px">${opts.head||(typed?'Not this time — here is the word, letter by letter':'Here is the word, letter by letter')}</div>
      <div role="img" aria-label="${escA(summary)}" style="display:flex;align-items:flex-start;gap:8px">
        <span aria-hidden="true" style="display:inline-flex;flex-direction:column;gap:3px;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)">${typed?'<span style="height:1.45em;display:flex;align-items:center">You</span>':''}<span style="height:1.45em;display:flex;align-items:center">Word</span></span>
        <span aria-hidden="true" class="sb-mdiff" style="display:flex;flex-wrap:wrap;gap:2px 1px;font-family:var(--mono,ui-monospace,monospace);font-weight:800;font-size:clamp(16px,4.2vw,21px)">${typed?cols:why.cols.map(c=>c.w?`<span class="sb-mdcol" style="display:inline-flex">${cell(c.w,'ok','w')}</span>`:'').join('')}</span></div>
      <div class="sb-mwhy" style="display:flex;gap:9px;align-items:flex-start;margin-top:11px;padding-top:10px;border-top:1px solid var(--line)">
        <span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00);margin-top:1px">${iconSVG('bulb',16)}</span>
        <span style="font-size:13.5px;line-height:1.5;color:var(--text)"><b>${esc(why.label)}</b> — ${esc(why.tip)}${why.hook?`<br><span style="color:var(--muted)">Memory hook: ${esc(why.hook)}</span>`:''}</span></div>
      ${opts.foot?`<div style="font-size:12px;font-weight:700;color:var(--muted);margin-top:8px">${opts.foot}</div>`:''}
    </div>`; }
/* ===================== APP SHELL ===================== */
function viewApp(){
  const S=state;
  /* the analogy gate, where it cannot be walked round: whatever set the nav (an opener, a stale tap, analogy.js's own
     links, tester mode switched off on the screen), a gated analogy screen is never drawn — it lands on Home, or the
     Library for the Link Finder, and the hash follows */
  if(ANL_NAVS[S.nav]&&!anlOpen()){ try{ if(window.SB_ANL) SB_ANL.stop(); }catch(e){} S.nav=ANL_NAVS[S.nav]; }
  const EXPLORE_NAVS=SB_EXPLORE_NAVS;
  const NAV_ART={home:'home',coach:'practice',explore:'explore',games:'arcade',progress:'progress',collection:'collection'};
  /* FIVE tabs. My Hive is not one: it is where your coins go, so the COINS PILL is its
     door, and it heads the drawer. (It briefly had a tab; a sixth crowded the phone bar
     and put a collection beside the five things a speller actually does.) Progress is not
     a tab either — it opens from Settings and the drawer. */
  const navTabs=NAV_TABS().map(([key,label,ic])=>{
    const on=key==='explore'?!!EXPLORE_NAVS[S.nav]
      :key==='trail'?atlasTabOn(S)   /* the Atlas and its Word Gym (owner, 10 Oct 2026) */
      :key==='games'?(S.nav==='daily'||S.nav==='dailybuzz'||S.nav==='forge'||S.nav==='gym'||S.nav==='lore'||S.nav==='hive')
      :(S.nav===key||(key==='home'&&S.nav==='today'));   /* Today's ten is Home's (P1.16) */
    // one icon dialect in BOTH states — the illustrated icon never swaps when a tab activates
    const glyph=`<span style="display:inline-flex;line-height:0">${navIcon(ic,21,on)}</span>`;
    return `<button data-act="setNav" data-arg="${key}" aria-current="${on?'page':'false'}" style="flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;padding:10px 12px;border-radius:var(--r-pill,999px);font-family:var(--display);font-weight:800;font-size:15px;letter-spacing:.01em;${on?'background:var(--action,var(--accent));color:var(--action-ink,#fff)':'background:transparent;color:var(--muted)'}">${glyph} ${label}</button>`;
  }).join('');
  let content='';
  /* A SCREEN WHOSE CODE IS LAZY, OR THAT READS WORDS (road to 4.5, P1.13): until its group is in — its app3 file (SCR_NAV,
     which carries the boot word tier) or the tier alone (words1) — the hive loader holds the page and the group is asked
     for; it renders when it lands. Reached by a tab, an address, a PIN pass or an opener, the same. */
  const _need=SCR_NAV[S.nav]||(!NAV_WORDLESS[S.nav]&&!wordsIn()?'words1':null);
  if(_need&&!scrReady(_need)) content=(lazyNeed(_need,()=>render()), hiveLoader(_need==='words1'?'fetching the words…':'opening…'));
  else if(S.nav==='home') content=viewHome();
  else if(S.nav==='concepts') content = S.conceptSel ? viewConceptDetail() : viewConceptList();
  else if(S.nav==='levelup') content=viewLevelUp();
  else if(S.nav==='train') content=viewTrain();
  else if(S.nav==='coach') content=viewCoach();
  else if(S.nav==='quest') content=viewQuest();
  else if(S.nav==='explore') content=viewExplore();
  else if(S.nav==='themes'&&S.themeSel) content=viewThemeDetail();
  else if(S.nav==='figurative') content=viewFigurative();
  else if(S.nav==='vocab') content=viewVocab();
  else if(S.nav==='quotes') content=viewQuotes();
  else if(S.nav==='trivtrain') content=viewTrivTrain();
  else if(S.nav==='ipatrain') content=viewIpaTrain();
  else if(S.nav==='firstword') content=viewFirstWord();
  else if(S.nav==='trail') content=(window.TRAIL?TRAIL.view():(lazyNeed('atlas',()=>{ if(state.nav==='trail') render(); }), hiveLoader('opening the Word Atlas…')));   /* trail.js is lazy (P1.13 step 3) */
  else if(S.nav==='typing') content=viewTyping();
  else if(S.nav==='builder') content=viewBuilder();
  else if(S.nav==='leveltest') content=viewLevelTest();
  else if(S.nav==='beeband') content=viewBeeBand();
  else if(S.nav==='coachdesk') content=viewCoachDesk();
  else if(S.nav==='traps') content=viewTraps();
  else if(S.nav==='reader') content=(window.SB_READER?SB_READER.view():'<div class="sb-cn">The reader is loading…</div>');
  else if(S.nav==='revisions') content=viewRevisions();
  else if(S.nav==='evolution') content=viewEvolution();
  else if(S.nav==='collection') content=viewCollection();
  else if(S.nav==='shop') content=viewShop();
  else if(S.nav==='help') content=viewHelp();
  else if(S.nav==='finder') content=viewFinder();
  else if(S.nav==='games') content=viewGames();
  else if(S.nav==='daily') content=viewDaily();
  else if(S.nav==='dailybuzz') content=viewDailyBuzz();
  else if(S.nav==='analogy') content=(window.SB_ANL&&window.SB_ANALOGY?SB_ANL.view():(lazyNeed('analogy',()=>{ if(state.nav==='analogy') render(); }), hiveLoader('opening the Analogy Atlas…')));
  else if(S.nav==='anltool') content=(window.SB_ANL&&window.SB_ANALOGY?SB_ANL.toolView():(lazyNeed('analogy',()=>{ if(state.nav==='anltool') render(); }), hiveLoader('opening the Link Finder…')));
  else if(S.nav==='anlbee') content=(window.SB_ANL&&window.SB_ANALOGY?SB_ANL.beeView():(lazyNeed('analogy',()=>{ if(state.nav==='anlbee') render(); }), hiveLoader('opening the bee…')));
  else if(S.nav==='today') content=(window.SB_TODAY?SB_TODAY.view():(lazyNeed('today',()=>{ if(state.nav==='today') render(); }), hiveLoader('getting today’s ten ready…')));
  else if(S.nav==='forge') content=viewForge();
  else if(S.nav==='gym') content=viewGym();
  else if(S.nav==='feed') content=(state.feedOff?`<div class="sb-feedpage">${tabHead('My Feed',{icon:navIcon('feed',20,true)})}<div class="sb-card" style="text-align:center;padding:28px 20px"><p style="margin:0 0 14px">My Feed is switched off on this device. A grown-up can switch it back on in Settings, behind the PIN.</p><button class="bz-btn" data-act="goHome">Home</button></div></div>`:window.SB_FEED?SB_FEED.view():`<div class="sb-feedpage">${tabHead('My Feed',{icon:navIcon('feed',20,true),sub:'Picked for you from across the app — about twenty, and then it ends.'})}${hiveLoader('opening your feed…')}</div>`);
  else if(S.nav==='mockbee') content=(window.MOCKBEE?MOCKBEE.view():(lazyNeed('mockbee',()=>{ if(state.nav==='mockbee') render(); }), hiveLoader('opening the bee…')));
  else if(S.nav==='sq') content=viewGames();          /* Spelling Quest retired */
  else if(S.nav==='trivia') content=(window.STV?STV.view():viewGames());
  else if(S.nav==='lore'||S.nav==='hive') content=(window.SB_QHUB?SB_QHUB.view():hiveLoader('opening '+(hubNameOf(S.nav)||'the quiz')+'…'));
  else if(S.nav==='adv') content=(window.ADV?ADV.view():viewHome());
  else if(S.nav==='themes') content=viewThemes();
  else if(S.nav==='progress') content=viewProgressShell();
  else if(S.nav==='parent') content=viewProgressShell();
  else if(S.nav==='journeys') content=viewJourneys();
  else if(S.nav==='settings') content=viewSettings();
  else if(S.nav==='debug') content=viewDebug();
  else if(S.nav==='voicetest') content=viewVoiceTest();
  else if(S.nav==='evofeedback') content=viewEvoFeedback();
  else content=viewHome();
  const lightOn=S.mode==='light';
  const celebrate=S.celebrate?(()=>{ const cb=S.celebrate; const c2=active(); const evo2=EVO[S.theme]||EVO.spellbound; const fi=formIdx(heroLevel(c2));
    const CONF=['#FFC83D','#7C5CFF','#36D1FF','#FF4D8D','#39d98a','#FF8A3D'];
    const rain=[...Array(36)].map((_,i)=>{ const l=(i*61)%100; const d=(2.6+(i%5)*0.55).toFixed(2); const dl=((i*0.17)%2).toFixed(2); const w=6+(i%3)*3;
      return `<span style="position:absolute;left:${l}%;top:-8%;width:${w}px;height:${w+7}px;border-radius:3px;background:${CONF[i%6]};opacity:.95;animation:sb-celefall ${d}s linear ${dl}s infinite;pointer-events:none"></span>`; }).join('');
    const shell=(inner)=>`<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--action) 30%,rgb(16 8 36 / .84));overflow:hidden" data-act="celebrateClose">
      <style>@keyframes sb-celefall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(115vh) rotate(560deg)}}@keyframes sb-rays{from{transform:rotate(0)}to{transform:rotate(360deg)}}@keyframes sb-cele-bounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-9px) scale(1.05)}}</style>
      ${rain}
      <div data-act="noop" style="position:relative;background:var(--paper,#fff);border-radius:24px;box-shadow:0 24px 80px rgb(10 4 30 / .55);max-width:440px;width:100%;padding:34px 28px;text-align:center;animation:sb-pop .5s cubic-bezier(.2,1.6,.4,1) both;overflow:hidden">
        <div aria-hidden="true" style="position:absolute;left:50%;top:96px;width:640px;height:640px;margin-left:-320px;background:repeating-conic-gradient(rgba(240,180,41,.15) 0 13deg,transparent 13deg 26deg);border-radius:50%;animation:sb-rays 26s linear infinite;pointer-events:none"></div>
        <div style="position:relative">${inner}</div>
      </div></div>`;
    // the child's own avatar appears and cheers in every big celebration, with a speech bubble
    const celeAvatar=(msg)=>`<div style="position:relative;width:150px;margin:0 auto 10px">
        <div style="width:120px;height:120px;margin:0 auto;animation:sb-cele-bounce 1.5s ease-in-out infinite">${myAvatar(120)}</div>
        ${msg?`<div style="position:absolute;top:4px;right:2px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:12.5px;padding:6px 12px;border-radius:14px 14px 3px 14px;box-shadow:var(--edge);white-space:nowrap;animation:sb-pop .5s ease .35s both">${esc(msg)}</div>`:''}
      </div>`;
    if(cb.kind==='badge'){ const b=cb.badge||{};
      return shell(`
        ${celeAvatar('Nice one!')}
        <div style="width:96px;height:96px;margin:-2px auto 8px">${scrDraw('scrMe',()=>medalSVG(b, 96))}</div>
        <div style="font-family:var(--ui);font-weight:650;font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Badge earned!</div>
        <div style="font-family:var(--display);font-weight:800;font-size:34px;line-height:1.05;margin:6px 0 6px">${esc(b.name||'New badge')}</div>
        <div style="font-size:15px;color:var(--muted);font-weight:500">${esc(b.desc||'')}${cb.more>0?(' · <b>+'+cb.more+' more badge'+(cb.more>1?'s':'')+'!</b>'):''}</div>
        <div style="display:flex;gap:10px;margin-top:20px"><button data-act="celebrateBadges" style="flex:1;padding:14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">See my badges</button>
        <button data-act="celebrateClose" style="flex:1;padding:14px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">Keep going →</button></div>`); }
    if(cb.kind==='vocab'){
      const total=cb.total||0, right=cb.right||0; const pct=total?Math.round(right/total*100):0;
      return shell(`
        ${celeAvatar('Brilliant!')}
        <div style="font-family:var(--ui);font-weight:650;font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Vocabulary complete!</div>
        <div style="font-family:var(--display);font-weight:800;font-size:32px;line-height:1.05;margin:6px 0 6px">Every word — done! 🌟</div>
        <div style="font-size:15px;color:var(--muted);font-weight:500">You matched <b style="color:var(--text)">${right}</b> of <b style="color:var(--text)">${total}</b> meanings${pct>=80?' — superb!':pct>=50?' — nicely done!':'.'}</div>
        <div style="display:flex;gap:10px;margin-top:20px"><button data-act="celebrateVocabAgain" style="flex:1;padding:14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">↺ Play again</button>
        <button data-act="celebrateClose" style="flex:1;padding:14px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">Done →</button></div>`); }
    if(cb.kind==='set'){
      return shell(`
        ${celeAvatar('You did it!')}
        <div style="font-family:var(--ui);font-weight:650;font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Word set mastered!</div>
        <div style="font-family:var(--display);font-weight:800;font-size:34px;line-height:1.05;margin:6px 0 6px">Every word — nailed!</div>
        <div style="font-size:15px;color:var(--muted);font-weight:500">${esc(cb.sub||'')} A fresh set is ready.</div>
        <button data-act="celebrateNextSet" style="width:100%;margin-top:20px;padding:15px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:16px;box-shadow:var(--edge)">Bring on the next set →</button>
        <button data-act="celebrateClose" style="margin-top:10px;color:var(--muted);font-weight:700;font-size:13px">Take a breather</button>`); }
    return shell(`
        ${celeAvatar(cb.champ?'CHAMP! 🏆':'Stage cleared!')}
        <div style="font-family:var(--ui);font-weight:650;font-size:12px;letter-spacing:.11em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">${cb.champ?'Champion unlocked':'Stage cleared'}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:36px;line-height:1.05;margin:6px 0 4px">${cb.champ?'Bizzing Bee Champ!':('Stage '+cb.level+' unlocked!')}</div>
        <div style="font-size:15px;color:var(--muted);font-weight:450">${esc(cb.list)} · ${esc(c2.name||'')} — ${esc(rankName(fi))} · ${cb.date}</div>
        <div style="display:flex;justify-content:center;gap:6px;margin:14px 0 18px">${[0,1,2].map(i=>`<span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:var(--treasure,#F0B429);animation:sb-pop .4s ease ${(i*0.12).toFixed(2)}s both"></span>`).join('')}</div>
        ${(()=>{ const L=lessonsAll()[loreCount(c2)-1]; if(!L) return ''; return `<div style="text-align:left;display:flex;align-items:center;gap:11px;background:var(--treasure-tint,#FFF3D6);border-radius:12px;padding:11px 13px;margin-bottom:14px">
          <span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00)">${window.SB_ICON?SB_ICON('book',{size:22}):iconSVG('book',22)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Lore unlocked</span>
          <span style="display:block;font-weight:800;font-size:14px;color:#241E33;line-height:1.25">${esc(L.title)}</span></span>
          <button data-act="celebrateLore" data-arg="${L.n}" style="flex-shrink:0;padding:8px 12px;border-radius:10px;background:var(--treasure-deep,#8A5B00);color:#fff;font-weight:800;font-size:12px">Read →</button></div>`; })()}
        <button data-act="celebrateClose" style="width:100%;padding:15px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:16px;box-shadow:var(--edge)">Keep climbing →</button>
        <div style="font-size:12px;color:var(--muted);margin-top:10px">Screenshot this card to share it!</div>`); })():'';
  const bandUp='';

  return `<div style="min-height:100dvh;display:flex;flex-direction:column">${celebrate}${bandUp}
    <!-- The top nav is never collapsed or hidden on desktop. Focus mode used to tuck it
         away behind a hover, which made the app feel like it had lost its navigation.
         Focus still kills the music and holds the background still; the tabs stay put. -->
    <div class="sb-header-sticky" style="position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);background:color-mix(in srgb,var(--bg1) 82%,transparent);border-bottom:1px solid var(--line)">
      ${SB_SHELL.demoBar()}
      <!-- flex-wrap is the safety net, not the layout: the chips collapse by breakpoint
           long before it engages. Without it this row is nowrap with every child
           flex-shrink:0, so any width it does not fit at pushes the whole document
           sideways rather than the header.
           THE FAMILY TOP BAR (standard §3, FIX-BEE B7/O4): ⬡ back to Hive · the app ·
           ……… · theme · 🔒 grown-ups · avatar ▾ — the same order in every Bizzing app, 56px.
           Bee's own tools (the menu, the search bar, the coins pill) sit in the middle. -->
      <div class="sb-fam-bar" style="max-width:1080px;margin:0 auto;padding:0 clamp(9px,3.2vw,32px);display:flex;flex-wrap:wrap;align-items:center;gap:8px;position:relative">
        ${SB_SHELL.hiveBtn()}
        <button data-act="openDrawer" aria-label="Menu" style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--text);flex-shrink:0">${iconSVG('menu',20)}</button>
        <button data-act="goHome" class="sb-fam-brand" title="Home" aria-label="Bizzing Bee — Home" style="display:flex;align-items:center;gap:9px;margin-right:auto;background:none;border:0;cursor:pointer"><div style="width:34px;height:38px;flex-shrink:0">${mascotSVG('happy')}</div><span class="sb-brand" style="font-family:var(--display);font-weight:800;font-size:20px;letter-spacing:-.01em;white-space:nowrap"><i style="font-style:italic">Bizzing</i><span class="sb-tm" aria-hidden="true"></span> Bee</span></button>
        ${(()=>{ /* A real search bar, not a button that goes somewhere to find one. Type
             here, suggestions drop under it, Enter opens the Finder on the query — and a
             suggestion tapped goes straight to that word's card. */
          const _drill=drillLive(); const _q=_drill?'':(state.hq||''); const _sug=_drill?[]:headerSuggest(_q); const _sel=state.hqSel==null?-1:state.hqSel;   // FIX-BEE D8: no search while a word is being tested
          const _rows=_sug.map((r,i)=>`<button data-act="${r.place?'hqPlace':'hqPick'}" data-arg="${escA(r.place||r.w)}" class="sb-hsug-row${r.place?' sb-hsug-place':''}${i===_sel?' on':''}" role="option" aria-selected="${i===_sel?'true':'false'}">
              <span class="sb-hsug-w">${esc(r.w)}</span>${r.d?`<span class="sb-hsug-d">${trunc(r.d,64)}</span>`:''}</button>`).join('');
          return `<div class="sb-hsearch">
            <span class="sb-hsearch-ic"><svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.2"/><path d="M15.2 15.2 21 21"/></svg></span>
            <input data-inp="hqType" data-key="hqKey" data-fkey="hq" value="${escA(_q)}" role="combobox" aria-expanded="${_sug.length?'true':'false'}" aria-autocomplete="list" aria-label="Search words, games and places" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${_drill?'Search waits until you answer':'Search any word…'}"${_drill?' disabled aria-disabled="true" title="Search pauses while a word is being tested — it could give the spelling away."':''}>
            ${_q?`<button data-act="hqClear" class="sb-hsearch-x" aria-label="Clear search">✕</button>`:''}
            ${_sug.length?`<div class="sb-hsug" role="listbox">${_rows}<button data-act="hqGo" class="sb-hsug-all">See all matches for “${esc(_q)}” →</button></div>`
              :(_q.trim().length===1?`<div class="sb-hsug"><div class="sb-hsug-none">Keep typing — two letters and the words start arriving.</div></div>`:'')}
          </div>`; })()}
        ${/* The rank pill used to sit here reading "Level 1 · Egg" beside a Bee Band pill
             reading "Word difficulty 3" — two pills that both read as "your level", for two
             different things. There is one ladder in the header now: the Bee Band, which IS
             the spelling level. The evolution forms still live in My Hive, where a
             collection belongs, reached by the Bizzy button. */''}
        ${/* The coins pill IS the door to My Hive — that is where coins are spent, and the
             Hive has no tab of its own. */''}
        <button data-act="openWallet" class="bz-coinchip" title="Your Bizzing coins — where they came from" aria-label="${escA(String(active().coins||0))} Bizzing coins — where they came from" style="display:inline-flex;align-items:center;gap:6px;padding:0 13px;height:37px;box-sizing:border-box;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12);flex-shrink:0">${coinIc(14)}<span class="bz-coin-n">${active().coins||0}</span></button>
        ${(()=>{ const _fon=!!(window.SB_W4_FOCUS&&SB_W4_FOCUS.on());
          /* One button for how the app looks: a tap cycles Light → White → Dusk, a
             double-tap holds the world still (focus) in whichever look you are in. */
          const glyph = S.mode==='light'
            ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><circle cx="12" cy="12" r="4.6" fill="currentColor" stroke="none"/><path d="M12 2.7v2.4M12 18.9v2.4M2.7 12h2.4M18.9 12h2.4M5.4 5.4l1.7 1.7M16.9 16.9l1.7 1.7M18.6 5.4l-1.7 1.7M7.1 16.9l-1.7 1.7"/></svg>`
            : S.mode==='white'
            ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"><rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4"/><path d="M12 4.2v15.6" opacity=".45"/></svg>`
            : `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M20.6 14.8A8.8 8.8 0 0 1 9.2 3.4 8.8 8.8 0 1 0 20.6 14.8z"/><circle cx="17.4" cy="5.6" r="1.1" opacity=".8"/></svg>`;
          return `<button data-act="cycleMode" data-dbl="toggleFocus" class="sb-hdr-ico${_fon?' on':''}" aria-label="Appearance: light, white or dusk. Double-tap for focus." title="Tap: Light / White / Dusk${_fon?' · focus is ON':''} — double-tap for focus">${glyph}</button>`; })()}
        ${/* Settings moved into the avatar menu (and stays in the drawer); the bar ends on the
             family's three: theme (the appearance button before this) · grown-ups · child. */''}
        ${SB_SHELL.lockBtn()}${SB_SHELL.kidBtn()}${SB_SHELL.kidMenu()}
      </div>
      <div class="sb-topnav" style="max-width:1080px;margin:0 auto;padding:0 clamp(14px,3.5vw,32px) 9px;display:flex;gap:6px;overflow-x:auto">${navTabs}</div>
    </div>
    ${viewDrawer()}
    <div class="sb-content" style="max-width:1080px;margin:0 auto;width:100%;padding:18px clamp(14px,3.5vw,32px) 60px">${content}</div>
    <nav class="sb-tabbar" aria-label="Primary">
      ${NAV_TABS(true).map(([k,l,ic])=>{ const on=(k==='explore')?!!EXPLORE_NAVS[S.nav]:(k==='trail')?atlasTabOn(S):(S.nav===k||(k==='home'&&S.nav==='today')||(k==='games'&&(S.nav==='daily'||S.nav==='dailybuzz'||S.nav==='forge'||S.nav==='gym'||S.nav==='lore'||S.nav==='hive')));
        const gl=`<span style="display:inline-flex;line-height:0">${navIcon(ic,23)}</span>`;
        return `<button data-act="setNav" data-arg="${k}" aria-current="${on?'page':'false'}" style="${on?'color:var(--accent)':'color:var(--muted)'}">${gl}<span>${l}</span></button>`; }).join('')}
    </nav>
  </div>`;
}

// Side drawer — NOT a copy of the top nav. Identity + jump-back-in + colored Explore
// shortcuts + training tools + family corner. The top nav answers "where am I";
// the drawer answers "what can I do from here".
/* The drawer's subtitles read the real data rather than a number typed in 2026:
   the Atlas reports where the speller actually is, and Concepts reports how many
   chapters the merged library holds for this account. */
function atlasSub(c){ try{ const T=window.SB_TRAIL||window.SB_TRAIL_HOME; if(!T) return 'the guided journey';
    const tr=c.trail||{}; const n=Object.keys(tr.done||{}).length; const total=(T.honey.units||[]).length;
    // "stop 4 of 102" is the same mountain as the tier bar. Where you are is the useful
    // half; how far the whole road runs is not something a speller needs at a glance.
    return n?('stop '+Math.min(n+1,total)+' · tier '+(tr.lap||1)):'nine acts · start at the Meadow'; }catch(e){ return 'the guided journey'; } }
function conceptDrawerSub(){ try{ const n=(state.conceptData||[]).length; const sh=conceptChapters().length;
    return n?(n+' chapters on '+sh+' shelves'):'every explanation in the app'; }catch(e){ return 'every explanation in the app'; } }
/* THE ☰ DRAWER IN THE FAMILY ORDER (FIX-BEE v2, FAMILY-STANDARD §3): My page · Shop · Collection ·
   Medals · four of Bee's own areas · Settings · Grown-ups 🔒 · Help · Privacy · Back to the Hive.
   A left sheet, 300px, over a scrim; Esc, the scrim and × close it, and Tab stays inside it
   (data-trap). Mute is one tap, at the top. The five tabs carry everything else — the Atlas, the
   Library and the Arcade are not repeated here. Guards: tests/nav-hive-band.cjs (order, the wallet
   chip) and tests/trust-v2.cjs (Esc, focus stays inside). */
function viewDrawer(){
  if(!state.drawerOpen) return '';
  const c=active(); ensureLists(c);
  const row=(act,arg,ic,label,sub,on)=>`<button data-act="${act}"${arg!=null?` data-arg="${escA(String(arg))}"`:''} class="bz-dr-row${on?' on':''}"${on?' aria-current="page"':''}>
      <span class="bz-dr-ic" aria-hidden="true">${iconSVG(ic,19,2.2)}</span>
      <span class="bz-dr-t"><span class="bz-dr-l">${label}</span>${sub?`<span class="bz-dr-s">${sub}</span>`:''}</span></button>`;
  const sep=(t)=>`<div class="bz-dr-sep" role="separator">${t?`<span>${t}</span>`:''}</div>`;
  const missedN=((c.missed)||[]).length; const muted=!!(window.SB_VOL&&SB_VOL.muted());
  const N=state.nav;
  return `<div data-act="closeDrawer" class="bz-dr-scrim"></div>
    <aside data-act="noop" data-trap="drawer" role="dialog" aria-modal="true" aria-label="Menu" class="bz-drawer">
      <div class="bz-dr-head">
        <span class="bz-dr-av${cardBg(c)}" aria-hidden="true">${framed(avatarSVG(c.avatar||'bizzy',44),c,48)}</span>
        <span class="bz-dr-who"><b>${plated(esc(c.name||'Speller'),c)}</b><span>${esc(oneLevel(c).label)}</span></span>
        <button data-act="muteAll" class="bz-dr-mute" aria-pressed="${muted?'true':'false'}" aria-label="${muted?'Sound is off — turn it on':'Mute all sound'}" title="${muted?'Sound off':'Mute'}">${iconSVG(muted?'mute':'volume',19,2.2)}</button>
        <button data-act="closeDrawer" class="bz-dr-x" aria-label="Close menu">${iconSVG('close',18,2.4)}</button>
      </div>
      <nav class="bz-dr-nav" aria-label="Menu">
        ${row('drawer','mypage','user','My page','your level, your week and every word met',N==='progress')}
        ${row('openShop','avatars','shop','Shop','avatars, worlds and looks · '+fmtN(c.coins||0)+' coins',N==='shop')}
        ${row('drawer','collection','star','Collection',SB_AVATARS.list.filter(a=>avOwned(c,a.id)).length+'/'+SB_AVATARS.list.length+' avatars',N==='collection'&&state.collTab!=='badges')}
        ${row('drawer','medals','medal','Medals','what you have done, and what is next',N==='collection'&&state.collTab==='badges')}
        ${sep('Bizzing Bee')}
        ${/* the drawer's jump-back-in is the same ONE next step Home's Continue takes (FIX-BEE B2) */''}
        ${(()=>{ const n=SB_SHELL.nextStep(); return row('drawer','next','steps','Next on your journey', (n.ready?(n.allDone?'the next tier of the Word Atlas':trunc(n.title,34)):'the first stop on the Word Atlas'), false); })()}
        ${row('drawer','coachdesk','bulb','Coach',missedN?('what to fix, and how — '+missedN+' word'+(missedN>1?'s':'')+' to work on'):'your patterns and what comes next',N==='coachdesk')}
        ${row('drawer','revisions','retry','Revision pile',missedN?missedN+' words waiting':'nothing waiting — nice',N==='revisions')}
        ${row('drawer','evolution','sprout','Your bee','the ten forms your bee grows through',N==='evolution')}
        ${state.feedOff?'':row('setNav','feed','feed','My Feed','about twenty cards from across the app, and then it ends',N==='feed')}

        ${sep('')}
        ${row('drawer','settings','gear','Settings','me, sound, look and comfort',!!state.settingsOpen)}
        ${row('drawer','parent','lock','Grown-ups','report card, plan and backup — needs the PIN',false)}
        ${row('drawer','help','help','Help','how coins, worlds and mastery work',N==='help')}
        <a href="privacy.html" class="bz-dr-row"><span class="bz-dr-ic" aria-hidden="true">${iconSVG('shield',19,2.2)}</span><span class="bz-dr-t"><span class="bz-dr-l">Privacy</span><span class="bz-dr-s">what stays on this device</span></span></a>
        <a href="${escA((window.SB_SHELL&&SB_SHELL.HIVE_URL)||'https://aayuvis.github.io/Bizzing_Schedule/')}" class="bz-dr-row"><span class="bz-dr-ic" aria-hidden="true">${iconSVG('hive',19,2.2)}</span><span class="bz-dr-t"><span class="bz-dr-l">Back to the Hive</span><span class="bz-dr-s">your day across every Bizzing app</span></span></a>
      </nav>
    </aside>`;
}
/* YOU ARE HERE (owner, 4 Oct 2026: "HOME screen should take to world atlas and show kids where they
   are instead of this"). Home's one Continue card is a window onto the WORLD ATLAS: the overview's
   own painting, cropped around the child's region, their avatar standing on it, the road walked to
   it in gold and the regions behind them starred — then the region, "Stop 3 of 13" counted the way
   that region's board counts it (stops and checkpoints of this tier), and the stop's name, with a
   rail of the region's stops beside Continue. The WHOLE card is one button (app.goNext: the region
   opens with this stop selected); the pill inside it is the one filled primary on Home.
   The picture is the overview's (atlas-map.webp, 99KB — 113KB as the JPEG it was until P1.14 — one for every child), not a region's own
   panorama (0.6–1MB each): Home's first screen has a budget (tests/first-load.cjs), and the region
   painting is what Continue opens. Where the pins and road are is trail.js's (SB_TRAIL_HERE). */
function homeHereCard(c,nx){
  const S=state; const crs=nx&&nx.crs==='exp'?'exp':'honey';
  const H=(typeof window.SB_TRAIL_HERE==='function')?SB_TRAIL_HERE(crs):null;
  const pins=(H&&H.pins)||[]; const hi=H?Math.max(0,H.here|0):0; const at=pins[hi]||{x:12.5,y:70};
  const pt=p=>(+p.x).toFixed(1)+' '+(+p.y).toFixed(1);
  const road=pins.map((p,i)=>(i?'L':'M')+pt(p)).join(' ');
  const walked=pins.slice(0,hi+1).map((p,i)=>(i?'L':'M')+pt(p)).join(' ');
  /* Bizzy and the plain bee are the mascot, drawn inline as the greeting draws them — no extra
     picture on Home's first screen; everyone else wears their own portrait */
  let av=''; try{ const own=c.avatar&&c.avatar!=='bizzy'&&c.avatar!=='bee'; av=(own&&window.SB_AVATAR)?(SB_AVATAR(c.avatar,48)||''):''; if(!av) av=mascotSVG('happy');
    /* above the fold on Home: never lazy (audit v4 B6 — a lazy image on the first screen waits) */
    av=av.replace(/\sloading="lazy"/g,' loading="eager"'); }catch(e){}
  const marks=pins.map((p,i)=>i===hi?'':`<span class="sb-here-pin is-${p.st}" style="left:${p.x}%;top:${p.y}%">${p.st==='done'?'★':''}</span>`).join('');
  const all=!!(nx&&nx.allDone);
  const label=nx&&nx.done?'Continue':'Start';
  const region=nx?nx.act:'The Word Atlas';
  const n=nx?(nx.stop|0):0, of=nx?(nx.stops|0):0;
  const where=all?`Tier ${nx.lap} complete — every stop walked`:(nx&&n&&of?`Stop ${n} of ${of}`:'Your first stop');
  const title=all?'':(nx?(nx.title||''):'Start at the Meadow');
  /* the rail: the region's own stops — walked, the one you are on, the road ahead */
  const rail=(H&&H.stops)||[];
  const rdone=nx?(all?of:(nx.stopsDone|0)):0; const rpct=of?Math.round(rdone/of*100):0;
  const wk=weekProgress(c);
  const aria=`You are here: ${region}${where?', '+where:''}${title?': '+title:''}. ${label}`;
  return `<button class="sb-lift sb-home-next sb-here" data-act="goNext" aria-label="${escA(aria)}">
    <span class="sb-here-map" aria-hidden="true">
      <span class="sb-here-board" style="--x:${(+at.x).toFixed(2)};--y:${(+at.y).toFixed(2)}">
        <img src="app-art/${H&&H.img||'atlas-map.webp'}" alt="" decoding="async" fetchpriority="high">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="sb-here-road">
          ${road?`<path d="${road}" class="sb-here-ghost" vector-effect="non-scaling-stroke"/>`:''}
          ${hi>0?`<path d="${walked}" class="sb-here-walk" vector-effect="non-scaling-stroke"/>`:''}</svg>
        ${marks}
        <span class="sb-here-me${at.y<26?' is-low':''}" style="left:${at.x}%;top:${at.y}%"><span class="sb-here-dot"></span><span class="sb-here-av">${av}</span></span>
      </span>
      <span class="sb-here-tag">You are here</span>
      ${nx?`<span class="sb-here-tier">Tier ${nx.lap}</span>`:''}
    </span>
    <span class="sb-here-body">
      <span class="sb-cs">Your place on the Word Atlas</span>
      <span class="sb-here-region">${trunc(region,44)}</span>
      <span class="sb-here-stop">${where?`<b>${esc(where)}</b>`:''}${where&&title?' · ':''}${title?trunc(title,48):''}</span>
      <span class="sb-here-go">
        <span class="sb-continue" style="flex:none;display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:var(--r-md,10px);background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">${iconSVG('steps',15)} ${label}</span>
        <span class="sb-home-where">
          <span class="sb-here-rail" role="progressbar" aria-label="${escA('How far along '+region)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${rpct}">${rail.map(v=>`<i class="${v===2?'d':v===1?'n':''}"></i>`).join('')||'<i></i>'}</span>
          <span class="sb-home-pos">${esc(SB_SHELL.levelWords(c))}</span>
          ${/* MASTERED THIS WEEK (owner, 10 Oct 2026 — the road to 4.5, P0.16): a small chip, words mastered ON EVIDENCE
               since Monday (c.mast, right on two separate days — weekProgress), never time or self-marks; nought says
               nought. The count above it is the board's own ("Stop n of N", SB_TRAIL_NEXT: stops + checkpoints). */''}
          <span class="sb-home-mast" data-week-mastered="${wk.words}">${iconSVG('check',12,2.6)} ${esc(wk.words+' word'+(wk.words===1?'':'s')+' mastered this week')}</span>
        </span>
      </span>
    </span></button>`;
}
/* THE SECOND JOURNEY CARD (owner, 10 Oct 2026 — the road to 4.5, P0.2: "journey card back to 547 px, second journey
   card restored (mistakes deck when due, else Analogy Atlas)"). Row 2 is Bee's two-card row again — the family's
   shell REF measures it — with "You are here" first. Beside it, ONE quiet card (Continue stays Home's only filled
   button):
     · the MISTAKES DECK when revision words are due — a word missed on an earlier day, or one whose mastery slipped
       and whose gap is over: the same "due" My Feed puts first (bee-feed.js dueOf) — opening Your Revisions;
     · otherwise the ANALOGY ATLAS — but only through the analogy gate (anlOpen: released, or tester mode). Until the
       content is released a child is never sent to it, so the card is the SPELLING GYM (the Play tab's drill hall).
   Drawn in code — the hub's own gradient and glyph, no painting — because Home's first screen has a byte budget
   (tests/first-load.cjs). */
function homeDueWords(c){ const out=new Set(), now=Date.now(), DAY=864e5;
  try{ (c.missed||[]).forEach(m=>{ if(m&&m.w&&m.ts&&now-m.ts>=DAY) out.add(nkey(m.w)); }); }catch(e){}
  try{ const M=c.mast||{}, today=mastDay();
    for(const k in M){ if(!Object.prototype.hasOwnProperty.call(M,k)) continue; const r=M[k];
      if(r&&(r.miss>0||r.lp>0)&&(r.b>=1?today>=r.due:today>r.d)) out.add(k); } }catch(e){}
  return [...out]; }
function homeSecondCard(c){
  const due=homeDueWords(c);
  const kind=due.length?'deck':anlOpen()?'analogy':'gym';
  const K={
    deck:{act:'openRevisions', grad:'linear-gradient(135deg,#F0B429,#C8791B)', art:`<span class="s2-ic">${iconSVG('retry',34,2.2)}</span>`,
      kick:'Your mistakes deck', title:due.length+' word'+(due.length===1?'':'s')+' ready to revise',
      sub:'Missed on an earlier day: spell them again and they stick.', go:'Revise',
      chips:due.slice(0,4)},
    analogy:{act:'openAnalogies', grad:'linear-gradient(150deg,#1E6B45,#163A5A)', art:`<span class="s2-ic">${navIcon('analogy',38,true)}</span>`,
      kick:'The Analogy Atlas', title:'Find the link', sub:'Twins, opposites, parts and word families — one link at a time.', go:'Open'},
    gym:{act:'openGym', grad:(PLAY_ART.gym||{}).grad||'linear-gradient(135deg,#FF5FA2,#C8458C)',
      art:(typeof gameArtSVG==='function'?`<span class="s2-art">${gameArtSVG('beat',84)}</span>`:`<span class="s2-ic">${iconSVG('bolt',34)}</span>`),
      kick:hubName('gym'), title:'Warm up your spelling', sub:(PLAY_TEXT.gym||{}).p||'', go:'Train'}
  }[kind];
  const chips=(K.chips||[]).map(w=>`<span class="s2-chip">${esc(w)}</span>`).join('');
  return `<button class="sb-lift sb-home-second" data-act="${K.act}" data-kind="${kind}" aria-label="${escA(K.kick+': '+K.title)}">
    <span class="s2-band" aria-hidden="true" style="background:${K.grad}">${K.art}</span>
    <span class="s2-body">
      <span class="sb-cs">${esc(K.kick)}</span>
      <span class="s2-title">${esc(K.title)}</span>
      <span class="s2-sub">${esc(K.sub)}</span>
      ${chips?`<span class="s2-chips">${chips}</span>`:''}
      <span class="s2-go">${esc(K.go)} ${iconSVG('arrow',14,2.4)}</span>
    </span></button>`; }
/* TODAY, IN ONE LINE (road to 4.5, P1.17 — rubric B4, "a daily reason to return"): the daily ring, the day's session
   (Today's ten, today.js) and My Feed's status, one strip in row 2 — above the two journey cards from 640px, under
   Continue on a phone. Read from the child's own record (c.today, c.feed, the day log), so it costs Home's first
   screen no file. Every control in it is an OUTLINE: Continue stays Home's one filled button (family-check).
   A NEW child (P1.18 — rubric B9) gets the FIRST-DAY CARD in its place instead: what a day here is, and ONE Start —
   the same first stop Continue opens, so day one has one way in, not two. The ribbon (and Today's ten) from day two.
   New = set up today (kid.fr), or, for a record with no set-up day, nothing on it yet. Guard: tests/today-session.cjs. */
function firstDay(c){ try{ const t=todayKey(); if(c.fr) return c.fr===t;
    const tr=c.trail||{}; return !(c.daysPlayed||[]).some(d=>d!==t)&&!Object.keys(tr.done||{}).length&&!Object.keys(c.mast||{}).length&&!(c.activity||[]).length; }catch(e){ return false; } }
function homeToday(c){ const m=todayMetrics(c), rings=[m.pApp,m.pPrac,m.pWords], shut=rings.filter(v=>v>=1).length;
  if(firstDay(c)) return `<div class="sb-today sb-first" role="group" aria-labelledby="sb-first-h"><span class="sb-first-ic" aria-hidden="true">${iconSVG('sun',30,2.2)}</span>
    <span class="sb-first-b"><b id="sb-first-h">Day one, ${esc(c.name||'speller')}!</b>
    <span>Start with your first stop on the Word Atlas. From tomorrow, Today's ten waits here: ten words, about five minutes.</span></span>
    <button class="sb-td-b sb-first-go" data-act="goNext">${iconSVG('steps',15)} Start</button></div>`;
  const T=c.today&&c.today.d===todayKey()?c.today:null, n=T?(T.res||[]).length:0, N=T?(T.ws||[]).length||10:10, ok=T?(T.res||[]).filter(x=>x.ok).length:0;
  const s=!T||!n?['about 5 minutes','Start']:T.done?[ok+' of '+N+' right','See it']:[n+' of '+N+' done','Carry on'];
  const F=c.feed||{}, fd=Math.floor(Date.now()/864e5), paid=Object.keys(F.paid||{}).filter(k=>F.paid[k]===fd).length;
  const feed=F.day===fd&&(F.ids||[]).length?(paid?paid+' answered today':'opened today'):'new cards today';
  return `<div class="sb-today" role="group" aria-label="Today">
    <button class="sb-td-b" data-act="openCoachDesk" aria-label="${escA('Daily goal: '+shut+' of 3 rings closed')}">${ringsSVG(26,rings)}<span><b>${shut}/3</b><i> rings</i></span></button>
    <button class="sb-td-b sb-td-main" data-act="openToday" aria-label="${escA("Today's ten: "+s[0]+'. '+s[1])}"><span><b>Today's ten</b><i> · ${s[0]}</i></span><span class="sb-td-go">${s[1]}<span class="sb-td-ar"> ${iconSVG('arrow',13,2.4)}</span></span></button>
    ${state.feedOff?'':`<button class="sb-td-b" data-act="setNav" data-arg="feed" aria-label="${escA('My Feed: '+feed)}">${navIcon('feed',18,true)}<span><b><i>My </i>Feed</b><i> · ${feed}</i></span></button>`}</div>`; }
function viewHome(){
  /* NOTHING HERE READS A WORD RECORD (road to 4.5, P1.13 step 1): Home draws before the boot word tier is in. Its first
     render used to count the active list's stage, its concept chapters and its Word Journeys into fourteen locals that
     nothing on the screen printed — and that dead count was what made every boot record a first-paint read. They are
     gone; what Home shows comes from the child's record, the Atlas and SB_CURRICULUM (the word of the hour's seed). */
  const S=state; const c=active(); ensureLists(c);
  const aKey=activeListKey();
  const greetHour=new Date().getHours(); const greeting=greetHour<12?'Good morning,':greetHour<18?'Good afternoon,':'Good evening,';
  /* The four tiles are the four things a speller actually does, in the order the
     app now presents them: follow the Atlas, drill words, read an explanation,
     play. Word Journeys lost its tile when it moved onto a Concepts shelf — the
     home screen should not offer a route the Library no longer lists. */
  /* One reading of the Atlas for the whole screen: seq() filters by tier, so the
     stop card and the Atlas tile must both quote the tier's count, not all 128. */
  /* ONE next step (FIX-BEE B2): home reads the same SB_NEXT_STEP every "next" in the app
     reads — family-shell.js builds it on SB_TRAIL_NEXT — so Continue cannot disagree with
     the drawer, the end of onboarding or the Hive's #/continue. */
  const _ns=SB_SHELL.nextStep(); const nx=_ns.ready?_ns:null;
  return `<div class="sb-home">
    ${(()=>{ const lp=getList(c,aKey); const lf=levelFromXp(lp.xp||0); const xpToNext=Math.max(0,(lf.need||1)-(lf.into||0));
      const evoPct=Math.min(100,Math.round((lf.into||0)/(lf.need||1)*100));
      const woh=(typeof wordOfHour==='function')?wordOfHour():null; const wohPr=woh?(pronFor(woh.w)||(woh._seed&&woh.p?{p:woh.p}:null)):null;   /* a seed word (P1.13) carries its record's respelling, which is what pronFor reads off the record */
      const wohTile=woh?`<button data-act="openWordCard" title="Tap for the full word card" class="sb-card sb-home-woh" style="width:100%;display:flex;align-items:center;gap:13px;background:linear-gradient(100deg,color-mix(in srgb,var(--treasure,#F0B429) 18%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 62%);border-color:color-mix(in srgb,var(--treasure,#F0B429) 42%,var(--line));border-radius:var(--r-lg,16px);padding:14px 16px;cursor:pointer;text-align:left;min-height:132px">
        <span style="display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--treasure,#F0B429);color:#2B2117;flex-shrink:0;font-size:20px">${iconSVG('history',20,2.2)}</span>
        <span style="min-width:0;flex:1">
          <span class="sb-cn" style="display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Word of the hour</span>
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:20px;line-height:1.12;overflow-wrap:anywhere;margin:2px 0 1px;color:var(--ink,var(--text))">${esc(woh.w)}</span>
          ${(wohPr&&wohPr.p)?`<span style="display:block;font-family:var(--mono);font-size:11.5px;color:var(--muted)">/ ${esc(wohPr.p)} /</span>`:''}
          ${woh.d?`<span style="display:block;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${trunc(woh.d,84)}</span>`:''}
          <span class="sb-cl" style="display:block;margin-top:6px">card →</span>
        </span>
      </button>`:cardHold('Word of the hour',132);
      /* its kicker wears --treasure-deep like the Word of the hour's: a fixed #8A5B00 was brown on dusk's
         purple paper at 1.5:1 (P0.20). a11y-axe loads the quotes before it reads Home, so it sees this card. */
      const qoh=(typeof quoteOfHour==='function')?quoteOfHour():null;
      const qohTile=qoh?`<button data-act="openQuoteHour" data-arg="${qoh.i}" title="Tap to open Quotes &amp; poems" class="sb-card" style="width:100%;display:flex;align-items:center;gap:13px;background:linear-gradient(100deg,color-mix(in srgb,#C8791B 15%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 62%);border-color:color-mix(in srgb,#C8791B 38%,var(--line));border-radius:var(--r-lg,16px);padding:14px 16px;cursor:pointer;text-align:left;min-height:132px">
        ${homeVign('app-art/home/quote.webp')}
        <span style="min-width:0;flex:1">
          <span class="sb-cn sb-qoh-k" style="display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Quote of the hour</span>
          <span style="display:block;font:italic 650 13.5px/1.42 var(--body,serif);color:var(--ink,var(--text));margin:3px 0 4px">“${trunc(qoh.q.q,132)}”</span>
          <span style="display:block;font-size:11.5px;font-weight:800;color:var(--muted)">— ${esc(qoh.q.a||'Unknown')}</span>
          <span class="sb-cl" style="display:block;margin-top:6px">more quotes →</span>
        </span>
      </button>`:cardHold('Quote of the hour',132);
      return `<div class="sb-home-r1" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px;margin-bottom:12px">
      <div class="sb-card sb-home-greet" style="display:flex;align-items:center;gap:14px;min-height:178px;padding:14px">
        ${(()=>{ /* Two different questions, and they used to be answered by one flag.
             WHICH ART to draw depends on the avatar worn — Bizzy and the plain bee are the
             mascot, everyone else is their own portrait. WHETHER THE CARD DECK OPENS does
             not: the deck is every card you OWN, and openAvDeck already clamps a start id
             that is not in it. Tying the button to hasCard meant a child wearing the
             standard Bizzy tapped their own picture and nothing happened. */
          const hasCard=c.avatar&&c.avatar!=='bizzy'&&c.avatar!=='bee'&&window.SB_AVATARS&&SB_AVATARS.byId[c.avatar]&&typeof SB_AV_CARD==='function';
          const deckN=(()=>{ try{ return SB_AVATARS.list.filter(a=>avOwned(c,a.id)&&typeof SB_AV_CARD==='function'&&SB_AV_CARD(a.id)).length; }catch(e){ return 0; } })();
          /* 1.5x the original 94/84 — the buddy is the first thing on Home and read small.
             avSrc switches to the full-size .webp above 96px, so the bigger draw is also a
             sharper source rather than an upscale of the 192px thumb. */
          const art=hasCard?String(avatarSVG(c.avatar,141)||'').replace('loading="lazy"','loading="eager"'):mascotSVG(S.mood);   /* first screen: never lazy (audit v4 B6) */
          /* the looks the child bought (P3.17): the frame round the buddy, the background behind it (never behind text) */
          const bg=cardBg(c), fart=framed(art,c,140);
          const inner0=`<div style="width:144px;height:150px;flex-shrink:0;animation:sb-bee-bob 3.4s ease-in-out infinite;display:grid;place-items:center;position:relative">${fart}</div>`;
          const inner=bg?`<div class="sb-greet-bg${bg}" style="width:150px;height:156px;flex-shrink:0;display:grid;place-items:center">${inner0}</div>`:inner0;
          return deckN?`<button data-act="openAvDeck" data-arg="${escA(c.avatar||'')}" title="Flip through your avatar cards — ${deckN} owned" aria-label="Your avatar cards" style="flex-shrink:0;background:none;border:0;padding:0;cursor:pointer">${inner}</button>`
                      :`<div style="position:relative;flex-shrink:0">${inner}</div>`; })()}
        <div style="min-width:0;flex:1">
          <div class="sb-cs">${greeting}</div>
          <div style="font-family:var(--display);font-weight:800;font-size:21px;line-height:1.1;margin-bottom:6px;color:var(--text)">${plated(esc(c.name),c)}</div>
          ${(()=>{ /* Your buddy says hello, whoever your buddy is — Bizzy included. The
              line comes from SB_AV_GREETINGS, with the avatar card as a second source. */
            const line=homeGreet(c);
            if(line==null) return `<div class="sb-home-greet sb-greet-hold" aria-hidden="true" style="position:relative;background:var(--surface2,#f3eee3);border-radius:12px;border-bottom-left-radius:4px;padding:10px 11px;display:flex;flex-direction:column;gap:7px;min-height:52px">${['86%','64%'].map(w=>`<span class="sb-hold" style="width:${w};background:color-mix(in srgb,var(--line) 75%,transparent)"></span>`).join('')}</div>`;
            return `<div class="sb-home-greet" style="position:relative;background:var(--surface2,#f3eee3);border-radius:12px;border-bottom-left-radius:4px;padding:8px 11px;font:italic 600 12.5px/1.4 var(--body,sans-serif);color:var(--ink,var(--text))">“${trunc(line,104)}”</div>`;
          })()}
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
            ${kudosChip(c)}${(()=>{ const ms=milestone(); return (ms&&ms.days>=0)?`<button data-act="setNav" data-arg="progress" style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:var(--r-pill,999px);background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">🐝 ${ms.days} days to ${trunc(ms.label,18)}</button>`:''; })()}
          </div>
        </div>
      </div>
      ${(()=>{ const m=todayMetrics(c); const allDone=m.pApp>=1&&m.pPrac>=1&&m.pWords>=1;
        const line=(lab,col,val,tgt)=>`<div style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:800;line-height:1.35">
          <span style="width:8px;height:8px;border-radius:3px;background:${col};flex-shrink:0"></span>
          <span style="color:var(--muted)">${lab}</span>
          <span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;color:var(--ink,var(--text));white-space:nowrap">${val}<span style="color:var(--muted)">/${tgt}</span></span></div>`;
        /* ONE card, two actions. It used to be a single <button>, which is why the band
           had to sit outside it as a sibling — a button may not contain a button. The card
           is a <div> now and each half is its own control: the rings and their three lines
           open the Coach, the level strip along the foot opens the Bee Band page. Both keep
           a real hit area, and neither is nested inside the other. */
        const bb=beeBand(c); const st=bandStage(bb.band);
        return `<div class="sb-card sb-home-rings" style="display:flex;flex-direction:column;gap:0;min-height:178px;padding:0;overflow:hidden">
          <button data-act="openCoachDesk" title="Coach speaks — what Bizzy makes of today" style="display:flex;align-items:center;gap:13px;flex:1;padding:14px;text-align:left;cursor:pointer;width:100%;background:none;border:0">
            <span style="flex-shrink:0;width:104px;height:104px;display:grid;place-items:center">${ringsSVG(104,[m.pApp,m.pPrac,m.pWords])}</span>
            <span style="min-width:0;flex:1">
              <span class="sb-ct" style="display:block;margin-bottom:6px">Daily goal${allDone?' ✓':''}</span>
              <span style="display:flex;flex-direction:column;gap:4px">
                ${line('App time', RING_COL[0][0], fmtMins(m.app), targets(c).app+'m')}
                ${line('Practise time', RING_COL[1][0], fmtMins(m.prac), targets(c).prac+'m')}
                ${line('Word count', RING_COL[2][0], m.words, m.tWords)}
              </span>
              <span class="sb-cl" style="display:block;margin-top:8px;color:var(--accent);font-weight:800">${allDone?'All three rings closed — Coach speaks →':'Coach speaks →'}</span>
            </span></button>
          ${/* "Find your level" used to sit here as a sheening Start — the third call to action on
               Home (FIX-BEE B2). Placement lives in onboarding now (and on the level page); this
               strip only says where the level stands, as a quiet link to the page that explains it. */''}
          <button data-act="setNav" data-arg="beeband" aria-label="${escA('Your level: '+oneLevel(c).label)}" title="${escA(oneLevel(c).label+' — your level. Every word you spell right moves it.')}" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:11px 14px;border:0;border-top:1px solid var(--line);background:var(--surface2);cursor:pointer">
            <span style="flex:none;display:inline-flex;line-height:0;width:26px;height:28px">${rankArt(oneLevel(c).form)}</span>
            <span style="min-width:0;flex:1">
              <span style="display:block;font-size:10.5px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)">Your level</span>
              <span class="sb-one-level" style="display:block;font-family:var(--display);font-weight:800;font-size:14.5px;line-height:1.2;color:var(--text)">${esc(oneLevel(c).label)}</span></span>
            <span style="flex:none;font-weight:800;font-size:12.5px;color:var(--accent)">→</span></button>
        </div>`; })()}
      ${wohTile}
    </div>
    <div class="sb-home-r2">
      ${(()=>{ /* YOU ARE HERE — the World Atlas, the child's place on it, and Continue (homeHereCard).
          trail-data.js is deferred. A speller who has started holds the card's space until it
          lands (it fills in once, correctly — "Home must not rewrite itself"); a speller with
          nothing walked is at the first region's first stop, which needs no data to draw. */
        const started=(()=>{ try{ const tr=c.trail||{}; return Object.keys(tr.done||{}).length>0
          ||Object.keys(tr.chk||{}).length>0||Object.keys(tr.seen||{}).length>0; }catch(e){ return false; } })();
        if(!nx&&started) return cardHold('You are here',innerWidth>=900?238:300);
        return homeHereCard(c,nx); })()}
      ${homeSecondCard(c)}
      ${homeToday(c)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:12px;margin-bottom:14px">${tipOfDay(true,true)}${qohTile}</div>`; })()}
    <div style="text-align:center;margin-top:26px;padding-top:14px;border-top:1px solid var(--line)"><a href="privacy.html" style="color:var(--muted);font-weight:700;font-size:12px;text-decoration:underline;text-underline-offset:3px">Privacy &amp; Parents' Notice</a>${tmLine()}</div>
  </div>`;
}
/* Trademark attribution. One line, in the footer, rather than a ™ sprayed over every
   mention — marking the prominent use once per surface plus an attribution line is the
   convention, and it is what a claim actually rests on. `Bizzing` is the mark being
   registered (the family brand across Bizzing Bee / Maths / India); `Bizzing Bee` is
   claimed as a mark in its own right. No ® until a registration actually issues. */
function tmLine(){
  return `<div style="margin-top:9px;font-size:11.5px;color:var(--muted);line-height:1.5">Bizzing&trade; and Bizzing Bee&trade; are trademarks of the Bizzing Bee developer. Not affiliated with the Scripps National Spelling Bee, the North South Foundation or Merriam-Webster.</div>`;
}
function avatarSVG(id,size){ size=size||30;
  let svg;
  if(window.SB_AVATARS && SB_AVATARS.byId[id]) svg=SB_AVATAR(id,size);
  else if(typeof id==='string' && id.slice(0,2)==='w:'){ const p=id.split(':'); try{ svg=evEmb(p[1],+p[2]).replace('width="54" height="58"','width="100%" height="100%"'); }catch(e){ svg=buddySVG('bee',size); } }
  else svg=buddySVG(id,size);
  // legendary avatars come alive — each animates its OWN signature (see LEGEND_FX)
  try{ const a=window.SB_AVATARS&&SB_AVATARS.byId[id]; if(a&&a.rarity==='legendary'&&typeof svg==='string') svg=legendaryAnim(svg,id); }catch(e){}
  return svg; }
// ---- Per-character legendary animation. Each fx is authored in the 0 0 120 120 viewBox. ----
// Helper: place `content` at (x,y) and run a CSS animation on it, nested so the animation's
// transform never fights the positioning translate.
function _fx(x,y,anim,dur,content,delay){ const ease=anim==='fx-spin'?'linear':'ease-in-out';
  return '<g transform="translate('+x+' '+y+')"><g style="transform-box:fill-box;transform-origin:center;animation:'+anim+' '+dur+'s '+ease+' '+(delay||0)+'s infinite">'+content+'</g></g>'; }
function _star(s,col){ const a=(s*0.3).toFixed(1),b=(s*0.72).toFixed(1); return '<path d="M0 '+(-s)+' l'+a+' '+b+' '+b+' '+a+' -'+b+' '+a+' -'+a+' '+b+' -'+a+' -'+b+' -'+b+' -'+a+' '+b+' -'+a+'z" fill="'+(col||'#FFE07A')+'"/>'; }
function _wheel(r,col){ const h=(r*0.7).toFixed(1); return '<circle r="'+r+'" fill="none" stroke="'+col+'" stroke-width="1.6"/><g stroke="'+col+'" stroke-width="1.1"><line x1="'+(-r)+'" y1="0" x2="'+r+'" y2="0"/><line x1="0" y1="'+(-r)+'" x2="0" y2="'+r+'"/><line x1="-'+h+'" y1="-'+h+'" x2="'+h+'" y2="'+h+'"/><line x1="'+h+'" y1="-'+h+'" x2="-'+h+'" y2="'+h+'"/></g>'; }
function _wings(f,s){ f=f||'#EAF2FF'; s=s||'#B8D2F0';
  return '<g transform="translate(30 42)"><g style="transform-box:fill-box;transform-origin:100% 55%;animation:fx-flutter .42s ease-in-out infinite"><path d="M0 0 Q-22 -12 -24 3 Q-18 14 0 9 Z" fill="'+f+'" opacity=".5" stroke="'+s+'" stroke-width="1"/></g></g>'
    +'<g transform="translate(90 42)"><g style="transform-box:fill-box;transform-origin:0% 55%;animation:fx-flutterR .42s ease-in-out infinite"><path d="M0 0 Q22 -12 24 3 Q18 14 0 9 Z" fill="'+f+'" opacity=".5" stroke="'+s+'" stroke-width="1"/></g></g>'; }
let LEGEND_FX=null;
/* Each legendary gets ONE bespoke effect that means something for that character.
   Authored in the avatar's 0 0 120 120 viewBox. `_a` = animate a positioned group. */
function _a(x,y,anim,dur,content,delay,ease,extra){
  return '<g transform="translate('+x+' '+y+')"><g style="transform-box:fill-box;transform-origin:'+(extra||'center')+';animation:'+anim+' '+dur+'s '+(ease||'ease-in-out')+' '+(delay||0)+'s infinite">'+content+'</g></g>'; }
function _rot(x,y,dur,content){ return '<g transform="translate('+x+' '+y+')"><g style="animation:lx-orbit '+dur+'s linear infinite">'+content+'</g></g>'; }
function legendFx(){ if(LEGEND_FX) return LEGEND_FX; const S=(s,c)=>_star(s,c); LEGEND_FX={
  // 1 Queen Hive — wings flutter + a worker bee orbits her crown
  queenhive: _wings('#EAF2FF','#B8D2F0') + _rot(60,20,3.4,'<g transform="translate(0 -16)"><ellipse rx="3.2" ry="2.4" fill="#FFC83D"/><path d="M-1 0h2M-2 1h4" stroke="#3A2A8C" stroke-width=".7"/><ellipse cx="-2" cy="-2" rx="2.2" ry="1.4" fill="#fff" opacity=".8"/></g>'),
  // 2 Gold Legend — marquee bulbs chase around the frame
  goldlegend: [[16,18],[60,10],[104,18],[110,60],[104,102],[60,110],[16,102],[10,60]].map((p,i)=>_a(p[0],p[1],'lx-chase',1.8,'<circle r="3.1" fill="#FFE07A"/>',i*0.22)).join(''),
  // 3 Nebula Drake — star-dust swirls inward and condenses into a new star
  nebula: [[-30,-24],[28,-26],[32,22],[-28,24]].map((d,i)=>'<g transform="translate(60 46)"><g style="--dx:'+(-d[0])+'px;--dy:'+(-d[1])+'px;animation:lx-condense 2.6s ease-in '+(i*0.45)+'s infinite"><g transform="translate('+d[0]+' '+d[1]+')">'+S(3.4,'#D8C0FF')+'</g></g></g>').join('') + _a(60,46,'lx-glowpair',2.6,S(5,'#FFF0B0'),1.6),
  // 4 Dragon Master — rain streaks fall, a river ripple crosses below
  dragonmaster: [[26,16],[46,10],[78,12],[96,18]].map((p,i)=>_a(p[0],p[1],'lx-rain',1.9,'<path d="M0 0 v9" stroke="#7FC8E8" stroke-width="1.7" stroke-linecap="round"/>',i*0.34,'linear')).join('') + _a(60,108,'lx-wave',2.4,'<path d="M-34 0 q9 -4 18 0 t18 0 t18 0" fill="none" stroke="#5AA8D0" stroke-width="2" opacity=".75"/>'),
  // 5 Aurum Formula — flask bubbles rise and the liquid turns gold
  aurum: [[-4,0],[2,2],[6,-1]].map((p,i)=>_a(18+p[0],96+p[1],'lx-bubble',1.7,'<circle r="2.3" fill="#FFE07A"/>',i*0.5)).join('') + _a(18,100,'lx-glowpair',1.7,'<ellipse rx="8" ry="4" fill="#FFD34D" opacity=".55"/>',0.3),
  // 6 Neon King — neon crown tubes flicker on in sequence
  neonking: [[-12,0],[-4,-7],[4,-7],[12,0]].map((p,i)=>_a(60+p[0],14+p[1],'lx-tube',1.6,'<path d="M0 6 V-5" stroke="#3DF0C8" stroke-width="2.6" stroke-linecap="round"/>',i*0.2)).join(''),
  // 7 Golden Crane — the paper unfolds and refolds
  goldencrane: _a(60,60,'lx-fold',2.8,'<path d="M-26 12 L0 -18 L26 12 Z" fill="none" stroke="#F0CE52" stroke-width="1.6" opacity=".8"/>'),
  // 8 Elemental Prime — four element orbs cycle earth→water→air→fire
  elemental: [['#4FA86A',0,-38],['#3D8AE0',38,0],['#EADFC0',0,38],['#E8603A',-38,0]].map((e,i)=>_a(60+e[1],47+e[2],'lx-elem',3.2,'<circle r="4.6" fill="'+e[0]+'"/>',i*0.8)).join(''),
  // 9 Uni — a rainbow arc sweeps out from the horn
  uni: _a(60,26,'lx-arc',2.6,'<path d="M-30 6 A30 30 0 0 1 30 6" fill="none" stroke="#FF7FBE" stroke-width="2.4" stroke-dasharray="70" stroke-linecap="round"/>',0,'linear') + _a(60,26,'lx-arc',2.6,'<path d="M-24 8 A24 24 0 0 1 24 8" fill="none" stroke="#7FD8FF" stroke-width="2.2" stroke-dasharray="70" stroke-linecap="round"/>',0.25,'linear'),
  // 10 Frost — breath fogs out and snowflakes settle on the shoulders
  yeti: _a(84,64,'lx-breath',2.6,'<ellipse rx="6" ry="4" fill="#EAF6FF" opacity=".8"/>') + [[40,26],[74,22],[58,18]].map((p,i)=>_a(p[0],p[1],'fx-fall',3,'<circle r="2" fill="#EAF6FF"/>',i*0.9,'linear')).join(''),
  // 11 Rex King — a roar shockwave rings out
  rexking: [0,0.6,1.2].map(d=>_a(94,58,'lx-roar',1.8,'<circle r="9" fill="none" stroke="#E8603A" stroke-width="2"/>',d,'ease-out')).join(''),
  // 12 Starweaver — a thread draws star to star, forming a constellation
  starweaver: '<g transform="translate(60 46)"><path d="M-30 -18 L-8 6 L16 -14 L32 12" fill="none" stroke="#FFE07A" stroke-width="1.5" stroke-dasharray="60" style="animation:lx-thread 3.4s ease-in-out infinite"/></g>' + [[-30,-18],[-8,6],[16,-14],[32,12]].map((p,i)=>_a(60+p[0],46+p[1],'fx-tw',3.4,S(3.4,'#FFF0B0'),i*0.7)).join(''),
  // 13 Pegasus — wings beat and cloud puffs trail behind
  pegasus: _wings('#F2F6FF','#C8D8F0') + [0,0.8].map(d=>_a(96,88,'lx-puff',2.4,'<ellipse rx="6" ry="4" fill="#fff" opacity=".85"/>',d)).join(''),
  // 14 Hydra — a head is cut, then two regrow
  hydra: _a(36,17,'lx-strike',2.8,'<path d="M0 7 Q-3.5 0 0 -5 Q3.5 0 0 7z" fill="#4FA86A"/><circle cx="-1" cy="-1" r=".9" fill="#122"/>') + [[72,15],[88,20]].map((p,i)=>_a(p[0],p[1],'lx-regrow',2.8,'<path d="M0 7 Q-3.2 0 0 -5 Q3.2 0 0 7z" fill="#5FB87A"/><circle cx="-1" cy="-1" r=".8" fill="#122"/>',i*0.25)).join(''),
  // 15 Titan — the checkered flag waves over speed lines
  titan: _a(97,26,'lx-wave',1.1,'<g><rect x="0" y="0" width="18" height="12" fill="#fff"/><g fill="#241E33"><rect x="0" y="0" width="4.5" height="4"/><rect x="9" y="0" width="4.5" height="4"/><rect x="4.5" y="4" width="4.5" height="4"/><rect x="13.5" y="4" width="4.5" height="4"/><rect x="0" y="8" width="4.5" height="4"/><rect x="9" y="8" width="4.5" height="4"/></g></g>','0','ease-in-out','left center') + [[14,52],[12,62],[16,72]].map((p,i)=>_a(p[0],p[1],'fx-shoot',1.2,'<path d="M0 0 h13" stroke="#FFD34D" stroke-width="2" stroke-linecap="round"/>',i*0.18,'linear')).join(''),
  // 16 Vex — letters are struck from his ledger
  vex: '<g transform="translate(92 26)"><rect x="-11" y="-9" width="22" height="20" rx="2" fill="#F4EFE2" stroke="#7A5AD0" stroke-width="1.2"/><g font-size="7" font-weight="800" fill="#5A3AA0"><text x="-7" y="-2">A</text><text x="1" y="-2">B</text><text x="-7" y="7">C</text><text x="1" y="7">D</text></g><path d="M-9 -4 h18" stroke="#C43A5A" stroke-width="1.8" style="animation:lx-strike 2.2s steps(1) infinite"/><path d="M-9 5 h18" stroke="#C43A5A" stroke-width="1.8" style="animation:lx-strike 2.2s steps(1) 1.1s infinite"/></g>',
  // 17 Word-Eater — a serpent head chomps a letter down
  wordeater: _a(94,44,'lx-chomp',1.5,'<path d="M-9 0 Q0 -8 10 -2 L10 3 Q0 6 -9 4z" fill="#3A7A4E"/><circle cx="4" cy="-1" r="1.1" fill="#FFD34D"/>',0,'ease-in-out','right center') + _a(96,58,'fx-fall',1.5,'<text text-anchor="middle" font-size="9" font-weight="800" fill="#E8E0C8">E</text>',0.4,'ease-in'),
  // 18 Naga — the coils undulate and the hood flares
  naga: _a(60,96,'lx-coil',1.6,'<path d="M-22 0 q11 -6 22 0 t22 0" fill="none" stroke="#2E8A5E" stroke-width="4" stroke-linecap="round"/>') + _a(60,20,'lx-elem',2.6,'<path d="M-14 6 Q-14 -8 0 -8 Q14 -8 14 6 Q0 1 -14 6z" fill="#3FA86E" opacity=".55"/>'),
  // 19 Blue Whale — the blow-spout puffs and the fluke sweeps
  bluewhale: [0,0.7].map(d=>_a(60,18,'lx-spout',2.4,'<path d="M0 6 V-6 M-4 2 V-4 M4 2 V-4" stroke="#8FD8F0" stroke-width="2" fill="none" stroke-linecap="round"/>',d)).join('') + _a(22,100,'lx-wave',2.4,'<path d="M0 0 q-9 -6 -14 -1 q6 3 14 1z" fill="#3D7DAE"/>'),
  // 20 Marie Curie — two glowing elements pulse in the phial
  curie: _a(20,92,'lx-glowpair',1.5,'<circle r="5" fill="#7FE8A0" opacity=".85"/>') + _a(20,92,'lx-glowpair',1.5,'<circle r="9" fill="none" stroke="#5AC88A" stroke-width="1.4"/>',0.5) + _a(99,34,'lx-glowpair',1.5,'<circle r="3.4" fill="#B8F0C8"/>',0.9),
  // 21 Gandhi — the charkha turns, drawing a thread of yarn
  gandhi: _rot(20,96,3.6,_wheel(11,'#E4DAC2')) + '<g transform="translate(20 96)"><path d="M11 0 q14 -8 26 -20" fill="none" stroke="#E8DCC0" stroke-width="1.5" stroke-dasharray="34" style="animation:lx-yarn 3.6s linear infinite"/></g>',
  // 22 Aryabhatta — a zero is written, then planets orbit it
  aryabhatta: _a(96,30,'lx-zero',3,'<text text-anchor="middle" font-family="Georgia,serif" font-size="15" font-weight="700" fill="#2E5AA0">0</text>') + _rot(60,46,5.5,'<circle cx="0" cy="-36" r="3.2" fill="#E88A3A"/>') + _rot(60,46,8,'<circle cx="32" cy="0" r="2.4" fill="#8AB4E8"/>'),
  // 23 Buddha — a bodhi leaf falls into a single calm ripple
  buddha: _a(88,22,'lx-leaf',3.4,'<path d="M0 0 Q6 5 0 11 Q-6 5 0 0z" fill="#6FBF7A"/>',0,'ease-in') + _a(60,110,'lx-roar',3.4,'<ellipse rx="10" ry="3" fill="none" stroke="#B8D8C0" stroke-width="1.4"/>',1.4,'ease-out'),
  // 24 Einstein — E=mc² writes itself, chalk-style
  einstein: '<g transform="translate(88 26)"><text text-anchor="middle" font-family="Georgia,serif" font-size="13" font-weight="700" fill="none" stroke="#2E2A6E" stroke-width="1.1" stroke-dasharray="90" style="animation:lx-write 3.4s ease-in-out infinite">E=mc²</text></g>',
  // 25 Zeus — lightning strikes down with a flash
  zeus: _a(16,86,'lx-bolt',2.2,'<path d="M5 -16 l-10 15 6 1 -8 15" stroke="#FFF3A0" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',0,'steps(1)') + _a(16,86,'lx-bolt',2.2,'<circle r="15" fill="#FFF3A0" opacity=".3"/>',0,'steps(1)'),
  // 26 Rama — the bow draws, then the arrow looses
  rama: _a(18,84,'lx-draw',2.4,'<path d="M0 -30 Q-12 0 0 30" fill="none" stroke="#EDE7D6" stroke-width="1.5"/>') + _a(30,84,'fx-shoot',2.4,'<path d="M-12 0 L12 0" stroke="#E8C24A" stroke-width="2.2" stroke-linecap="round"/><path d="M12 0 L7 -3.5 M12 0 L7 3.5" stroke="#C8952A" stroke-width="1.8" fill="none" stroke-linecap="round"/>',0.45,'ease-out'),
  // 27 Odin — a raven flies across and his eye gleams
  odin: _a(104,86,'lx-fly',3.2,'<g><ellipse rx="7" ry="4.6" fill="#2A2A32"/><path d="M4 -3 l5 -1 -3 3z" fill="#3A3A42"/><path d="M-3 -3 q4 -5 8 -1" fill="#22222A"/></g>',0,'ease-in-out') + _a(48,54,'lx-glowpair',2.4,'<circle r="3" fill="#FFE07A" opacity=".75"/>',0.8),
  // 28 Krishna — the chakra spins and flute notes drift away
  krishna: _rot(99,46,2.4,_wheel(11,'#FFD34D')+'<circle r="4.4" fill="none" stroke="#FFD34D" stroke-width="1.6"/>') + [0,1.1].map(d=>_a(30,80,'lx-note',2.6,'<text font-size="10" fill="#E8C24A">♪</text>',d)).join(''),
  // 29 Shiva — the third eye opens, damaru pulses ring out
  shiva: '<g transform="translate(60 36.5)"><g style="transform-box:fill-box;transform-origin:center;animation:lx-eye 3.2s ease-in-out infinite"><ellipse rx="4.6" ry="3" fill="#FF5A2E"/><circle r="1.3" fill="#FFF0C0"/></g></g>' + [0,0.9].map(d=>_a(60,36.5,'lx-roar',3.2,'<circle r="7" fill="none" stroke="#FF8A5A" stroke-width="1.3"/>',1.8+d,'ease-out')).join(''),
  // 30 Ganesha — the obstacle stone cracks apart and Om rises
  ganesha: _a(20,104,'lx-crack',3.2,'<path d="M-8 6 L-3 -4 L2 3 L7 -6" fill="none" stroke="#8A6A4A" stroke-width="2" stroke-linecap="round"/>') + _a(94,28,'fx-rise',3.2,'<text text-anchor="middle" font-weight="800" font-size="15" fill="#E8973A">ॐ</text>',0.6),
  // 31 Durga — the trishul gleams, a tiger-stripe flashes
  durga: _a(17,54,'lx-gleam',2.2,'<path d="M-7 0 L7 0" stroke="#FFF3B0" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>') + _a(99,104,'lx-glowpair',2.2,'<g stroke="#7A4A1A" stroke-width="1.4" opacity=".85"><path d="M-6 -2 h12"/><path d="M-5 2 h10"/></g>',0.7),
  // 32 Saraswati — the veena strings vibrate and notes float over water
  saraswati: [[26,84],[32,86],[38,88]].map((p,i)=>_a(p[0],p[1],'lx-string',0.9,'<path d="M0 -3 v6" stroke="#F0E0A0" stroke-width="1.4" stroke-linecap="round"/>',i*0.12)).join('') + [0,1.2].map(d=>_a(44,80,'lx-note',2.8,'<text font-size="11" fill="#C87A2A">♫</text>',d)).join('')
}; return LEGEND_FX; }
// Give a legendary its signature animation (falls back to twinkling sparkles).
function legendaryAnim(svg,id){
  const map=legendFx(); const fx=map[id] || (_fx(20,22,'fx-tw',2.4,_star(5,'#FFE07A'))+_fx(99,96,'fx-tw',2.4,_star(4,'#FFE07A'),1.2));
  return svg.replace(/(<svg\b[^>]*?)>/, '$1 class="sb-av-legend">')
            .replace(/<\/svg>\s*$/i, fx+'</svg>'); }
// the child's own worn avatar, with their equipped accessory
function myAvatar(size){ const c=active(); return avatarSVG(c.avatar||'bee', size); }
/* ---- Badge art: a graphical emblem per badge, rendered at avatar quality ----
   Each badge is a rich, dimensional icon of WHAT IT IS (a crown, a flame, a
   book, a sprout…) — gradient-filled with highlights and a soft coloured
   roundel behind it, the same polish as the collectible avatars, but NOT the
   bee character. `kind` = the badge's `ic` key; `won` false → greyed + locked. */
let _badgeUID=0;
// ground = [light, deep] tint of the roundel, chosen to make each emblem pop.
const BADGE_EMBLEM={
  crown:{ g:['#C9B8FF','#7C5CFF'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFEBAd"/><stop offset="1" stop-color="#EFA320"/></linearGradient>
    <path d="M22 70 17 38 34 51 50 30 66 51 83 38 78 70Z" fill="url(#${d}a)" stroke="#B8791A" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="23" y="68" width="54" height="12" rx="4" fill="url(#${d}a)" stroke="#B8791A" stroke-width="2.5"/>
    <circle cx="50" cy="44" r="5.5" fill="#FF5D8F" stroke="#C93B6A" stroke-width="1.6"/>
    <circle cx="26" cy="48" r="3.6" fill="#5AC8FF" stroke="#2E9FE0" stroke-width="1.3"/>
    <circle cx="74" cy="48" r="3.6" fill="#5AC8FF" stroke="#2E9FE0" stroke-width="1.3"/>
    <path d="M27 45 39 53" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>`},
  flame:{ g:['#FFE3C4','#FFB877'], art:(d)=>`
    <radialGradient id="${d}a" cx="50%" cy="70%" r="62%"><stop offset="0" stop-color="#FFE23A"/><stop offset=".5" stop-color="#FF9B29"/><stop offset="1" stop-color="#EA3B2E"/></radialGradient>
    <path d="M50 20C58 37 76 44 76 61a26 26 0 0 1-52 0C24 50 31 44 38 49 36 38 44 31 50 20Z" fill="url(#${d}a)" stroke="#C22B22" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 44C55 52 61 57 61 65a11 11 0 0 1-22 0C39 58 46 52 50 44Z" fill="#FFE68A" opacity=".92"/>
    <circle cx="42" cy="40" r="3" fill="#fff" opacity=".5"/>`},
  star:{ g:['#BFE0FF','#5AA9F0'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3B0"/><stop offset="1" stop-color="#F0A93C"/></linearGradient>
    <path d="M50 18 59.5 40 83 43 64.5 59 70 82 50 70 30 82 35.5 59 17 43 40.5 40Z" fill="url(#${d}a)" stroke="#D8931F" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M50 27 56 41 44 41Z" fill="#fff" opacity=".55"/>`},
  check:{ g:['#C6F0D8','#4FCB85'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DEBAD"/><stop offset="1" stop-color="#1FA35A"/></linearGradient>
    <circle cx="50" cy="50" r="30" fill="url(#${d}a)" stroke="#178a4a" stroke-width="2.5"/>
    <path d="M30 40a30 30 0 0 1 22 -14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M35 51 46 62 66 37" stroke="#fff" stroke-width="7.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`},
  book:{ g:['#FFE3C4','#FFB877'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FB0F5"/><stop offset="1" stop-color="#2E6FD6"/></linearGradient>
    <path d="M50 30C42 25 30 25 21 28V71C30 68 42 68 50 73Z" fill="#F4F8FF" stroke="#B9C4D6" stroke-width="1.6"/>
    <path d="M50 30C58 25 70 25 79 28V71C70 68 58 68 50 73Z" fill="#FFFFFF" stroke="#B9C4D6" stroke-width="1.6"/>
    <rect x="47" y="29" width="6" height="45" rx="2.5" fill="url(#${d}a)"/>
    <path d="M27 39H44M27 47H44M27 55H43" stroke="#C6D2E4" stroke-width="2" stroke-linecap="round"/>
    <path d="M56 39H73M56 47H73M57 55H73" stroke="#C6D2E4" stroke-width="2" stroke-linecap="round"/>
    <path d="M63 26V42l4-3 4 3V26Z" fill="#FF5D8F" stroke="#C93B6A" stroke-width="1.2"/>`},
  chart:{ g:['#CFEFF0','#6EDCE4'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1AA6B4"/><stop offset="1" stop-color="#5AD1D9"/></linearGradient>
    <rect x="25" y="54" width="13" height="23" rx="3" fill="url(#${d}a)" stroke="#128793" stroke-width="1.5"/>
    <rect x="43" y="44" width="13" height="33" rx="3" fill="url(#${d}a)" stroke="#128793" stroke-width="1.5"/>
    <rect x="61" y="32" width="13" height="45" rx="3" fill="url(#${d}a)" stroke="#128793" stroke-width="1.5"/>
    <path d="M24 47 40 38 54 43 74 24" fill="none" stroke="#FF6B3D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M65 22H76V33" fill="none" stroke="#FF6B3D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`},
  target:{ g:['#CFE0FF','#8AA0FF'], art:(d)=>`
    <circle cx="47" cy="53" r="27" fill="#FF5D6C" stroke="#D6304F" stroke-width="2"/>
    <circle cx="47" cy="53" r="19" fill="#fff"/>
    <circle cx="47" cy="53" r="11" fill="#FF5D6C"/>
    <circle cx="47" cy="53" r="4.5" fill="#fff"/>
    <line x1="76" y1="27" x2="52" y2="49" stroke="#6C4FE0" stroke-width="4" stroke-linecap="round"/>
    <path d="M52 49 59 49 55 43Z" fill="#F0A93C"/>
    <path d="M76 27 83 24 80 31Z" fill="#F0A93C"/>`},
  search:{ g:['#E0D6FF','#B49CFF'], art:(d)=>`
    <radialGradient id="${d}a" cx="38%" cy="34%" r="72%"><stop offset="0" stop-color="#EAF4FF"/><stop offset="1" stop-color="#9CC4EA"/></radialGradient>
    <line x1="60" y1="60" x2="79" y2="79" stroke="#5A5CE0" stroke-width="9" stroke-linecap="round"/>
    <circle cx="44" cy="44" r="22" fill="url(#${d}a)" stroke="#5A5CE0" stroke-width="6"/>
    <path d="M34 38a14 14 0 0 1 12 -6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>`},
  sprout:{ g:['#D6EFFF','#9CC4FF'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8CE06A"/><stop offset="1" stop-color="#2FA14E"/></linearGradient>
    <path d="M50 73V45" stroke="#2FA14E" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M50 51C40 51 30 45 26 34 40 32 50 40 50 51Z" fill="url(#${d}a)" stroke="#1f8a3f" stroke-width="1.5"/>
    <path d="M50 47C60 47 70 41 74 30 60 28 50 36 50 47Z" fill="url(#${d}a)" stroke="#1f8a3f" stroke-width="1.5"/>
    <path d="M31 73a19 8 0 0 1 38 0Z" fill="#A9713E" stroke="#7d5128" stroke-width="1.5"/>
    <path d="M30 44a10 10 0 0 1 8 -8" stroke="#fff" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>`},
  steps:{ g:['#FFE3C4','#FFC078'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8AA0FF"/><stop offset="1" stop-color="#5A5CE0"/></linearGradient>
    <rect x="21" y="55" width="19" height="21" rx="3" fill="url(#${d}a)" stroke="#4548c0" stroke-width="1.5"/>
    <rect x="40" y="43" width="19" height="33" rx="3" fill="url(#${d}a)" stroke="#4548c0" stroke-width="1.5"/>
    <rect x="59" y="31" width="19" height="45" rx="3" fill="url(#${d}a)" stroke="#4548c0" stroke-width="1.5"/>
    <path d="M68.5 21 71 27 77.5 27.5 72.5 31.5 74 38 68.5 34.5 63 38 64.5 31.5 59.5 27.5 66 27Z" fill="#FFD24D" stroke="#E8A020" stroke-width="1"/>`},
  bolt:{ g:['#D8D0FF','#9E8CFF'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE86A"/><stop offset="1" stop-color="#F0A030"/></linearGradient>
    <path d="M57 17 29 55H46L41 83 73 41H53Z" fill="url(#${d}a)" stroke="#D6851C" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M52 24 39 50H49" fill="none" stroke="#fff" stroke-width="2.5" opacity=".5" stroke-linecap="round" stroke-linejoin="round"/>`},
  eye:{ g:['#CFE8FF','#7FB0FF'], art:(d)=>`
    <radialGradient id="${d}a" cx="42%" cy="38%" r="70%"><stop offset="0" stop-color="#7B4FD6"/><stop offset="1" stop-color="#4A2AA0"/></radialGradient>
    <path d="M18 50Q50 24 82 50Q50 76 18 50Z" fill="#fff" stroke="#3D6FE0" stroke-width="2.5"/>
    <circle cx="50" cy="50" r="14" fill="url(#${d}a)"/>
    <circle cx="50" cy="50" r="6.5" fill="#1a1030"/>
    <circle cx="45" cy="45" r="3" fill="#fff" opacity=".85"/>`},
  palette:{ g:['#FFF0C4','#FFD86E'], art:(d)=>`
    <radialGradient id="${d}a" cx="40%" cy="34%" r="75%"><stop offset="0" stop-color="#FFF7FA"/><stop offset="1" stop-color="#FFCFE4"/></radialGradient>
    <path d="M50 23C69 23 81 37 81 52 81 62 73 65 66 65 61 65 60 71 62 75 50 79 25 71 21 50 18 33 31 23 50 23Z" fill="url(#${d}a)" stroke="#D68AB0" stroke-width="2"/>
    <circle cx="40" cy="38" r="4.2" fill="#FF5D6C"/>
    <circle cx="57" cy="36" r="4.2" fill="#5AC8FF"/>
    <circle cx="65" cy="49" r="4.2" fill="#5AD98A"/>
    <circle cx="37" cy="53" r="4.2" fill="#F0A93C"/>
    <circle cx="35" cy="64" r="6" fill="#fff" stroke="#D68AB0" stroke-width="1.5"/>`},
  cart:{ g:['#CFE8FF','#7FB0FF'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9793A"/><stop offset="1" stop-color="#8A5320"/></linearGradient>
    <linearGradient id="${d}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98B45"/><stop offset="1" stop-color="#A66A2E"/></linearGradient>
    <rect x="24" y="49" width="52" height="27" rx="4" fill="url(#${d}a)" stroke="#6b4018" stroke-width="2"/>
    <path d="M24 49a26 13 0 0 1 52 0Z" fill="url(#${d}b)" stroke="#6b4018" stroke-width="2"/>
    <rect x="23" y="45" width="54" height="6" rx="2" fill="#F0C040" stroke="#c99a1e" stroke-width="1"/>
    <rect x="45" y="51" width="10" height="10" rx="2" fill="#F0C040" stroke="#c99a1e" stroke-width="1.2"/>
    <circle cx="33" cy="73" r="4" fill="#FFD24D" stroke="#E8A020" stroke-width="1"/>
    <circle cx="41" cy="75" r="3.4" fill="#FFD24D" stroke="#E8A020" stroke-width="1"/>
    <path d="M65 28 66.6 31.4 70 31.8 67.4 34.2 68.1 37.6 65 35.8 61.9 37.6 62.6 34.2 60 31.8 63.4 31.4Z" fill="#fff" opacity=".9"/>`},
  joystick:{ g:['#FFD6E8','#FF9ED2'], art:(d)=>`
    <linearGradient id="${d}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7B4FD6"/><stop offset="1" stop-color="#4A2AA0"/></linearGradient>
    <radialGradient id="${d}b" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#FF7A8F"/><stop offset="1" stop-color="#D6304F"/></radialGradient>
    <ellipse cx="50" cy="73" rx="27" ry="8" fill="#3a2088"/>
    <path d="M27 73C27 59 50 59 50 59 50 59 73 59 73 73Z" fill="url(#${d}a)"/>
    <rect x="46" y="33" width="8" height="29" rx="4" fill="#C0C6D0" stroke="#8b93a0" stroke-width="1.2"/>
    <circle cx="50" cy="30" r="12" fill="url(#${d}b)"/>
    <circle cx="46" cy="26" r="3.5" fill="#fff" opacity=".8"/>
    <circle cx="64" cy="69" r="4" fill="#FFD24D" stroke="#E8A020" stroke-width="1"/>`},
  bulb:{ g:['#D6E4FF','#9CB4FF'], art:(d)=>`
    <radialGradient id="${d}a" cx="42%" cy="36%" r="70%"><stop offset="0" stop-color="#FFF6B0"/><stop offset="1" stop-color="#F5C842"/></radialGradient>
    <g stroke="#F0B429" stroke-width="3" stroke-linecap="round"><path d="M50 13V5"/><path d="M24 22 18.5 16.5"/><path d="M76 22 81.5 16.5"/><path d="M15 44H7"/><path d="M85 44H93"/></g>
    <path d="M50 18a22 22 0 0 1 14 38c-3 3-3 6-3 9H39c0-3 0-6-3-9a22 22 0 0 1 14 -38Z" fill="url(#${d}a)" stroke="#E0A828" stroke-width="2"/>
    <rect x="41" y="64" width="18" height="6" rx="2" fill="#B7BDC7" stroke="#8b93a0" stroke-width="1"/>
    <rect x="43" y="70" width="14" height="5" rx="2" fill="#9AA1AC"/>
    <path d="M45 48 50 40 55 48" fill="none" stroke="#E8892E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="43" cy="32" r="3" fill="#fff" opacity=".6"/>`},
  timer:{ g:['#FFDCC4','#FFB088'], art:(d)=>`
    <radialGradient id="${d}a" cx="40%" cy="34%" r="72%"><stop offset="0" stop-color="#F4F8FF"/><stop offset="1" stop-color="#C6D2E4"/></radialGradient>
    <rect x="45" y="15" width="10" height="7" rx="2" fill="#2E9FE0"/>
    <path d="M40 22H60" stroke="#2E9FE0" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="54" r="26" fill="url(#${d}a)" stroke="#2E9FE0" stroke-width="3.5"/>
    <g stroke="#8b93a0" stroke-width="2" stroke-linecap="round"><path d="M50 32V36"/><path d="M50 76V72"/><path d="M28 54H32"/><path d="M72 54H68"/></g>
    <path d="M50 54 62 40" stroke="#FF5D6C" stroke-width="3" stroke-linecap="round"/>
    <circle cx="50" cy="54" r="3.5" fill="#2E9FE0"/>`}
};
BADGE_EMBLEM.fire=BADGE_EMBLEM.flame; BADGE_EMBLEM.spark=BADGE_EMBLEM.star;
function badgeArtSVG(kind, size, won){
  size=size||96; if(won===undefined) won=true;
  const d='bg'+(_badgeUID++);
  const EM=BADGE_EMBLEM[kind]||BADGE_EMBLEM.star;
  const g=won?EM.g:['#D7DDE3','#AEB6BF'];
  const lock=won?'':`<g><circle cx="76" cy="74" r="13" fill="#fff" stroke="#B4BCC6" stroke-width="2"/><rect x="71" y="73" width="10" height="8" rx="1.5" fill="#8B95A1"/><path d="M73 73v-2a3 3 0 0 1 6 0v2" fill="none" stroke="#8B95A1" stroke-width="2"/></g>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" style="display:block;overflow:visible;${won?'':'filter:grayscale(.62)'}">
    <defs>
      <radialGradient id="${d}gr" cx="50%" cy="40%" r="66%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="${g[0]}"/><stop offset="1" stop-color="${g[1]}"/></radialGradient>
      <radialGradient id="${d}gl" cx="38%" cy="24%" r="58%"><stop offset="0" stop-color="#fff" stop-opacity=".65"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <circle cx="50" cy="50" r="47.5" fill="url(#${d}gr)" stroke="${won?'#ffffff':'#E7EBEF'}" stroke-width="3"/>
    <circle cx="50" cy="50" r="47.5" fill="none" stroke="rgba(20,10,40,.10)" stroke-width="1"/>
    <ellipse cx="41" cy="27" rx="27" ry="15" fill="url(#${d}gl)"/>
    ${EM.art(d)}
    ${lock}
  </svg>`;
}
// small colour shade helper (percent -100..100) for the badge metal tints
function shade(hex, pct){ hex=String(hex||'#888').replace('#',''); if(hex.length===3) hex=hex.split('').map(c=>c+c).join('');
  let r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16); const t=pct<0?0:255, p=Math.abs(pct)/100;
  const m=v=>Math.round((t-v)*p+v); return '#'+[m(r),m(g),m(b)].map(v=>('0'+Math.max(0,Math.min(255,v)).toString(16)).slice(-2)).join(''); }
/* ==== AVATARS: 96 in 12 × 8, through the family engine (FIX-BEE v2, FAMILY-STANDARD §8) ====
   One engine for all five apps (bizzing-avatars.js → window.BZ_AVATARS). Every card's path is the
   engine's stateOf().say, in plain words:
   • Common — "Free for everyone", every plan, from day one.
   • Rare 120 · Epic 250 — "Opens with its world" until the pack's world is open, then the fixed
     price in Bizzing coins ("120 coins · 40 more to go").
   • Legendary 500 — its world open AND its named learning milestone ("First: master 300 words"),
     then the coins.
   No chance, no packs drawn blind, no duplicates, no selling, never real money and never a
   button to a payment form. A milestone, once reached, stays reached (c.avMs). An avatar a child
   already owned — won on an old milestone, bought at an old price, or from a pack that has since
   left Bee — stays theirs and still renders. Guard: tests/avatars-engine.cjs. */
const AV_EVID = {
  right:    { t:n=>'spell '+fmtN(n)+' words right',              v:e=>e.right },
  mast:     { t:n=>'master '+fmtN(n)+' words',                   v:e=>e.mast },
  stops:    { t:n=>'finish '+n+' Atlas stop'+(n===1?'':'s'),      v:e=>e.stops },
  level:    { t:n=>'reach Level '+n,                             v:e=>e.level },
  concepts: { t:n=>'master '+n+' concept'+(n===1?'':'s'),        v:e=>e.concepts },
  traps:    { t:n=>'beat '+n+' words that once tripped you',     v:e=>e.traps },
};
function avMilestone(a){ if(!a||!a.milestone) return null; const m=a.milestone; return { k:m.k, n:m.n, text:m.label, id:m.id }; }
/* The evidence the milestones read — computed once per call site, not once per tile. */
function avEvidence(c){ c=c||active(); let concepts=0, stops=0;
  /* only read chapters already in memory — loadConcepts() would fall back to a fetch while the
     lazy shard is still on its way, and a fetch from file:// is a console error on every render */
  try{ if(state.conceptData || (window.SB_CONCEPTS&&SB_CONCEPTS.chapters&&SB_CONCEPTS.chapters.length)){ loadConcepts(); concepts=(state.conceptData||[]).filter(ch=>conceptStat(ch).done).length; } }catch(e){}
  try{ stops=(typeof window.SB_TRAIL_STOPS==='function')?SB_TRAIL_STOPS(c):0; }catch(e){}
  return { right:rankXp(c), mast:masteredCount(), stops, level:rankOf(c).level, concepts, traps:Object.keys(c.trapsBeaten||{}).length }; }
/* Milestones met: the ones recorded (c.avMs — once reached, kept) plus any the evidence shows now. */
function avMilestonesMet(c){ c=c||active(); const out=new Set(Object.keys(c.avMs||{}));
  try{ let e=null; (window.SB_AVATARS?SB_AVATARS.list:[]).forEach(a=>{ if(a.rarity!=='legendary'||!a.milestone||out.has(a.milestone.id)) return;
      e=e||avEvidence(c); if(AV_EVID[a.milestone.k] && AV_EVID[a.milestone.k].v(e)>=a.milestone.n) out.add(a.milestone.id); }); }catch(e){}
  return out; }
/* The engine's reading of one card, for this child now. */
function avState(a,c){ c=c||active(); if(!a) return null;
  if(state.devUnlock) return { state:'owned', say:'Open for testing', tier:SB_AVATARS.tierOf(a), price:a.price||0 };
  try{ const s=BZ_AVATARS.stateOf({ id:a.id, tier:SB_AVATARS.tierOf(a), pack:1, world:a.worldN||1, milestone:a.milestone }, avCtx(c));
    if(s.state==='world'){ const wid=worldIdOf(s.world); s.say='Opens with its world'+(wid?(' — '+((THEMES.find(t=>t.id===wid)||{}).label||'')):''); }
    return s; }catch(e){ return { state:'owned', say:'', tier:'common', price:0 }; } }
/* The old name — a short rule for anything that still asks for one. */
function avRule(a,c){ const s=avState(a,c); if(!s) return null;
  return { kind:s.state==='owned'?'free':(s.state==='buy'?'buy':(s.state==='milestone'?'milestone':'world')), text:s.say, price:s.state==='buy'?s.price:0 }; }
/* A legendary's milestone, met for the first time, is recorded (and said once): it does not GIVE the
   avatar any more — the standard says milestone, then coins — it opens the buying of it. */
function grantAvatarMilestones(quiet){ try{ const c=active(); if(!c||!window.SB_AVATARS||state.devUnlock) return [];
    const met=avMilestonesMet(c); const newly=[]; c.avMs=c.avMs||{};
    SB_AVATARS.list.forEach(a=>{ if(a.rarity!=='legendary'||!a.milestone) return; const id=a.milestone.id; if(met.has(id)&&!c.avMs[id]){ c.avMs[id]=Date.now(); newly.push(a); } });
    if(newly.length){ save(); if(!quiet){ try{ flash(newly[0].name+' can be yours now — you did it: '+newly[0].milestone.label+'.'); }catch(e){} } }
    return []; }catch(e){ return []; } }
/* c.avOwned[id] is a COUNT, not a flag — duplicates are collectable and sellable.
   Old saves stored a bare 1, which reads back as a single copy. */
function avCount(c,id){ const v=(c&&c.avOwned||{})[id]; const n=(typeof v==='number')?v:(v?1:0); return n>0?n:0; }
function avOwned(c,id){ if(state.devUnlock) return true; const a=window.SB_AVATARS&&SB_AVATARS.byId[id]; if(!a) return true; return a.rarity==='free' || avCount(c,id)>0; }
function avGive(c,id,n){ c.avOwned=c.avOwned||{}; c.avOwned[id]=avCount(c,id)+(n||1); }
/* Spare copies: everything above the one you keep. This is what the Sell button trades. */
function avDupes(c,id){ return Math.max(0, avCount(c,id)-1); }
function avDupeTotal(c){ let n=0; SB_AVATARS.list.forEach(a=>{ if(a.rarity!=='free') n+=avDupes(c,a.id); }); return n; }
function avDupeValue(c){ let v=0; SB_AVATARS.list.forEach(a=>{ if(a.rarity!=='free') v+=avDupes(c,a.id)*(a.sell||0); }); return v; }
function packPlanNeeded(pk){ try{ const idx=SB_AVATARS.packs.findIndex(p=>p.id===pk);
  const b=SB_TIERS.beginner.ent.avatarPacks; return (b!=='all'&&idx>=b)?'regional':'beginner'; }catch(e){ return 'regional'; } }
function themePlanNeeded(id){ try{ const idx=THEMES.findIndex(t=>t.id===id);
  const b=SB_TIERS.beginner.ent.worlds; return (b!=='all'&&idx>=b)?'regional':'beginner'; }catch(e){ return 'regional'; } }
function avOwnedCount(c){ return SB_AVATARS.list.filter(a=>avOwned(c,a.id)).length; }
function evArt(theme,i){ try{ return evEmb(theme,i).replace('width="54" height="58"','width="100%" height="100%"'); }catch(e){ return ''; } }
function badgeDefs(){ const c=active(); const bb=beeBand(c); const jl=listStageIdx(c,'journey')+1;
  let concepts=0; try{ if(state.conceptData || (window.SB_CONCEPTS&&SB_CONCEPTS.chapters&&SB_CONCEPTS.chapters.length)){ loadConcepts(); concepts=(state.conceptData||[]).filter(ch=>conceptStat(ch).done).length; } }catch(e){}   /* never trigger the file:// fetch fallback from the medal shelf */
  /* Streak medals are RETIRED, not re-locked: one already earned stays on the shelf under
     "Kept from before" (its id is a storage key in badgesSeen, like the karma* ones); one not
     earned is never shown and can never be earned — c.streak no longer moves. */
  const _seen=c.badgesSeen||{};
  const kept=(id,n)=>!!_seen[id] || !!((c.streakRewards||{})[n]) || (c.streakBest||0)>=n;   /* the RECORD of what was earned, never the live counter */
  let stops=0; try{ stops=(typeof window.SB_TRAIL_STOPS==='function')?SB_TRAIL_STOPS(c):0; }catch(e){}
  const beaten=Object.keys(c.trapsBeaten||{}).length;
  const mast=masteredCount();
  const owned=avOwnedCount(c);
  const legs=SB_AVATARS.list.filter(a=>a.rarity==='legendary'&&avOwned(c,a.id)).length;
  const epics=SB_AVATARS.list.filter(a=>a.rarity==='epic'&&avOwned(c,a.id)).length;
  const wordsRight=Object.values(c.lists||{}).reduce((s,l)=>s+(l.xp||0),0);   // one per word spelled right
  /* Spelling Quest's fifteen seasons are retired; the competition record is the
     Mock Spelling Bee's — bees entered, bees won, and the best finish of eleven. */
  let mbSt={}; try{ mbSt=(window.MOCKBEE?MOCKBEE.stats():SB_STORE.getJSON('mockbee',{}))||{}; }catch(e){}
  const mbPlayed=mbSt.played||0, mbWins=mbSt.wins||0, mbBest=mbSt.best||99;
  const worlds=THEMES.filter(t=>isThemeUnlocked(t.id)).length;
  const wkWords=(c.week||[]).reduce((a,b)=>a+(b||0),0);
  const arts=((c.pow||{}).shield||0)+((c.pow||{}).reveal||0)+((c.pow||{}).time||0);
  const defs=[
    /* EVIDENCE MEDALS (FIX-BEE I4): each one names a thing the child DID with words — a stop
       finished, a trap beaten, a concept mastered, a word spelled right. None of them can be
       had for showing up on a run of days. */
    { g:'Atlas', id:'stop1', name:'First Stop', desc:'Finish a stop on the Atlas', ic:'steps', done:stops>=1 },
    { g:'Atlas', id:'stop10', name:'Trailblazer', desc:'Finish 10 Atlas stops', ic:'steps', done:stops>=10 },
    { g:'Atlas', id:'stop25', name:'Pathfinder', desc:'Finish 25 Atlas stops', ic:'steps', done:stops>=25 },
    { g:'Atlas', id:'stop60', name:'Cartographer', desc:'Finish 60 Atlas stops', ic:'crown', done:stops>=60 },
    { g:'Traps', id:'trap1', name:'Trap Spotted', desc:'Spell a word right that you once missed', ic:'target', done:beaten>=1 },
    { g:'Traps', id:'trap10', name:'Trap Breaker', desc:'Beat 10 words that once tripped you', ic:'target', done:beaten>=10 },
    { g:'Traps', id:'trap50', name:'Trap Master', desc:'Beat 50 words that once tripped you', ic:'bolt', done:beaten>=50 },
    { g:'Traps', id:'trap150', name:'Untrappable', desc:'Beat 150 words that once tripped you', ic:'crown', done:beaten>=150 },
    { g:'Word mastery', id:'busyweek', name:'Busy Bee Week', desc:'100 words in one week', ic:'chart', done:wkWords>=100 },
    // Retired — shown only where already earned (see `kept` above)
    { g:'Kept from before', id:'streak3', name:'3-Day Buzz', desc:'Kept from before', ic:'flame', done:kept('streak3',3), retired:true },
    { g:'Kept from before', id:'streak7', name:'Week of Wings', desc:'Kept from before', ic:'flame', done:kept('streak7',7), retired:true },
    { g:'Kept from before', id:'streak14', name:'Fortnight Flyer', desc:'Kept from before', ic:'flame', done:kept('streak14',14), retired:true },
    { g:'Kept from before', id:'streak30', name:'Iron Wings', desc:'Kept from before', ic:'fire', done:kept('streak30',30), retired:true },
    { g:'Kept from before', id:'streak60', name:'Two-Month Torch', desc:'Kept from before', ic:'fire', done:kept('streak60',60), retired:true },
    { g:'Kept from before', id:'streak100', name:'Century Flame', desc:'Kept from before', ic:'fire', done:kept('streak100',100), retired:true },
    // Word mastery
    { g:'Word mastery', id:'mast10', name:'First Ten', desc:'Master 10 words', ic:'check', done:mast>=10 },
    { g:'Word mastery', id:'mast50', name:'Half Century', desc:'Master 50 words', ic:'check', done:mast>=50 },
    { g:'Word mastery', id:'mast100', name:'Word Hundredaire', desc:'Master 100 words', ic:'book', done:mast>=100 },
    { g:'Word mastery', id:'mast250', name:'Lexicon Builder', desc:'Master 250 words', ic:'book', done:mast>=250 },
    { g:'Word mastery', id:'mast500', name:'Word Wizard', desc:'Master 500 words', ic:'spark', done:mast>=500 },
    { g:'Word mastery', id:'mast1000', name:'Walking Dictionary', desc:'Master 1,000 words', ic:'crown', done:mast>=1000 },
    { g:'Word mastery', id:'acc90', name:'Sharp Speller', desc:'Keep accuracy at 90%+', ic:'target', done:(c.acc||0)>=90 },
    // Bee Band
    { g:'Word difficulty', id:'placed', name:'On the Map', desc:'Finish your placement — find your word difficulty', ic:'search', done:!bb.calibrating },
    { g:'Word difficulty', id:'band3', name:'Classroom Champ', desc:'Spell right at word difficulty 3', ic:'target', done:bb.band>=3 },
    { g:'Word difficulty', id:'band5', name:'Regional Ready', desc:'Spell right at word difficulty 5', ic:'target', done:bb.band>=5 },
    { g:'Word difficulty', id:'band7', name:'State & National', desc:'Spell right at word difficulty 7', ic:'target', done:bb.band>=7 },
    { g:'Word difficulty', id:'band9', name:'Championship Band', desc:'Spell right at word difficulty 9', ic:'crown', done:bb.band>=9 },
    // Levels & evolution
    { g:'Levels', id:'hatched', name:'First Hatch', desc:'Reach Level 3 — your bee hatches', ic:'sprout', done:rankOf(c).level>=3 },
    { g:'Levels', id:'quest5', name:'Stage 5 Climber', desc:'Reach Stage 5 on the Journey', ic:'steps', done:jl>=5 },
    { g:'Levels', id:'quest10', name:'Stage 10 Ace', desc:'Reach Stage 10 on the Journey', ic:'steps', done:jl>=10 },
    { g:'Levels', id:'quest15', name:'Stage 15 Star', desc:'Reach Stage 15 on the Journey', ic:'steps', done:jl>=15 },
    { g:'Levels', id:'champ', name:'Bizzing Bee Champ', desc:'Clear all 20 Champ stages', ic:'crown', done:isChampDone(c) },
    /* The three ids below still read karma*. They are STORAGE KEYS for earned badges —
       renaming them would re-lock all three for every child who already has them. The name
       and the wording are what a child reads, and those are fixed. */
    { g:'Levels', id:'karma100', name:'Hundred Club', desc:'Spell 100 words right', ic:'bolt', done:wordsRight>=100 },
    { g:'Levels', id:'karma500', name:'Five Hundred', desc:'Spell 500 words right', ic:'bolt', done:wordsRight>=500 },
    { g:'Levels', id:'karma2000', name:'Two Thousand', desc:'Spell 2,000 words right', ic:'bolt', done:wordsRight>=2000 },
    // Collection
    { g:'Collection', id:'coll10', name:'Starter Set', desc:'Own 10 avatars', ic:'spark', done:owned>=10 },
    { g:'Collection', id:'coll25', name:'Collector', desc:'Own 25 avatars', ic:'spark', done:owned>=25 },
    { g:'Collection', id:'coll50', name:'Curator', desc:'Own 50 avatars', ic:'spark', done:owned>=50 },
    { g:'Collection', id:'coll100', name:'Grand Curator', desc:'Own 100 avatars', ic:'crown', done:owned>=100 },
    { g:'Collection', id:'coll150', name:'Completionist', desc:'Own every avatar', ic:'crown', done:owned>=SB_AVATARS.list.length },
    { g:'Collection', id:'epic1', name:'Epic Find', desc:'Own an epic avatar', ic:'eye', done:epics>=1 },
    { g:'Collection', id:'leg1', name:'Legendary!', desc:'Own a legendary avatar', ic:'crown', done:legs>=1 },
    { g:'Collection', id:'leg5', name:'Hall of Legends', desc:'Own 5 legendary avatars', ic:'crown', done:legs>=5 },
    { g:'Collection', id:'stocked', name:'Well Stocked', desc:'Hold 5 artifacts at once', ic:'cart', done:arts>=5 },
    // Spelling Quest
    { g:'Mock Spelling Bee', id:'mb1', name:'On the Stage', desc:'Enter a mock spelling bee', ic:'target', done:mbPlayed>=1 },
    { g:'Mock Spelling Bee', id:'mbf', name:'Final Five', desc:'Finish in the last five of eleven', ic:'star', done:mbBest<=5 },
    { g:'Mock Spelling Bee', id:'mb2', name:'Runner-Up', desc:'Reach the final two', ic:'flame', done:mbBest<=2 },
    { g:'Mock Spelling Bee', id:'mbw', name:'Champion', desc:'Win a mock spelling bee', ic:'crown', done:mbWins>=1 },
    { g:'Mock Spelling Bee', id:'mbw3', name:'Three-Time', desc:'Win three mock bees', ic:'crown', done:mbWins>=3 },
    // Learning
    { g:'Learning', id:'concepts5', name:'Pattern Spotter', desc:'Master 5 concepts', ic:'grid', done:concepts>=5 },
    { g:'Learning', id:'scholar', name:'Pattern Scholar', desc:'Master 10 concepts', ic:'grid', done:concepts>=10 },
    { g:'Learning', id:'concepts25', name:'Rule Collector', desc:'Master 25 concepts', ic:'grid', done:concepts>=25 },
    { g:'Learning', id:'concepts50', name:'Concept Champion', desc:'Master 50 concepts', ic:'bulb', done:concepts>=50 },
    { g:'Learning', id:'story5', name:'Tale Finder', desc:'Unlock 5 word-history tales', ic:'book', done:loreCount(c)>=5 },
    { g:'Learning', id:'storyteller', name:'Storykeeper', desc:'Unlock 10 word-history tales', ic:'book', done:loreCount(c)>=10 },
    { g:'Learning', id:'story25', name:'Word Historian', desc:'Unlock 25 word-history tales', ic:'book', done:loreCount(c)>=25 },
    // Explorer
    { g:'Explorer', id:'worlds4', name:'Globe Trotter', desc:'Unlock 4 worlds', ic:'palette', done:worlds>=4 },
    { g:'Explorer', id:'worldsAll', name:'World Master', desc:'Unlock every world', ic:'palette', done:worlds>=THEMES.length },
    { g:'Explorer', id:'coins250', name:'Honey Saver', desc:'Hold 250 Bizzing coins at once', ic:'coin', done:(c.coins||0)>=250 },
    { g:'Explorer', id:'coins1000', name:'Honey Tycoon', desc:'Hold 1,000 Bizzing coins at once', ic:'coin', done:(c.coins||0)>=1000 },
    { g:'Explorer', id:'milestone', name:'Eye on the Prize', desc:'Set a bee-day milestone', ic:'pencil', done:!!(c.milestone&&c.milestone.date) },
    // Typing
    { g:'Typing', id:'ty1', name:'Keys Found', desc:'Finish your first typing test', ic:'pencil', done:((c.typing||{}).tests||0)>=1 },
    { g:'Typing', id:'ty15', name:'Steady Hands', desc:'Reach 15 WPM', ic:'pencil', done:((c.typing||{}).bestWpm||0)>=15 },
    { g:'Typing', id:'ty25', name:'Quick Fingers', desc:'Reach 25 WPM', ic:'bolt', done:((c.typing||{}).bestWpm||0)>=25 },
    { g:'Typing', id:'ty40', name:'Lightning Typist', desc:'Reach 40 WPM', ic:'bolt', done:((c.typing||{}).bestWpm||0)>=40 },
    { g:'Typing', id:'ty55', name:'Buzzer Beater', desc:'Reach 55 WPM', ic:'bolt', done:((c.typing||{}).bestWpm||0)>=55 },
    { g:'Typing', id:'tyless5', name:'Finger Five', desc:'Finish 5 different typing lessons', ic:'pencil', done:Object.keys((c.typing||{}).lessons||{}).length>=5 },
    { g:'Typing', id:'tylessall', name:'Keyboard Cartographer', desc:'Try every typing lesson', ic:'crown', done:Object.keys((c.typing||{}).lessons||{}).length>=TY_LESSONS.length },
    { g:'Typing', id:'typerfect', name:'Zero Typos', desc:'Finish an exercise at 100% accuracy', ic:'target', done:((c.typing||{}).perfect||0)>=1 },
    { g:'Typing', id:'typerfect5', name:'Flawless Five', desc:'5 exercises at 100% accuracy', ic:'target', done:((c.typing||{}).perfect||0)>=5 },
    { g:'Typing', id:'tybank5', name:'Sentence Smith', desc:'5 sentence or meaning typing sessions', ic:'book', done:((c.typing||{}).bank||0)>=5 },
    { g:'Typing', id:'tybank15', name:'Wordsmith Typist', desc:'15 word-bank typing sessions', ic:'book', done:((c.typing||{}).bank||0)>=15 },
    { g:'Typing', id:'tytests10', name:'Test Pilot', desc:'Run 10 timed typing tests', ic:'spark', done:((c.typing||{}).tests||0)>=10 },
    // Bee Trivia
    { g:'Trivia', id:'tr1', name:'Quiz Rookie', desc:'Finish your first trivia round', ic:'spark', done:((c.trivia||{}).rounds||0)+((c.trivia||{}).squares||0)>=1 },
    { g:'Trivia', id:'tr100', name:'Fact Finder', desc:'Answer 100 trivia questions right', ic:'bulb', done:((c.trivia||{}).right||0)>=100 },
    { g:'Trivia', id:'tr500', name:'Trivia Titan', desc:'500 right answers', ic:'bulb', done:((c.trivia||{}).right||0)>=500 },
    { g:'Trivia', id:'trperf', name:'Perfect Ten', desc:'A flawless 10/10 classic round', ic:'target', done:((c.trivia||{}).perfect||0)>=1 },
    { g:'Trivia', id:'trlines', name:'Line Judge', desc:'Score 10 lines in Trivia Squares', ic:'grid', done:((c.trivia||{}).lines||0)>=10 },
    { g:'Trivia', id:'trclock15', name:'Quick Thinker', desc:'15+ right in one Beat the Clock', ic:'bolt', done:((c.trivia||{}).clockBest||0)>=15 },
    { g:'Trivia', id:'trthemes', name:'Globe Trotter', desc:'Answer right in 15 different themes', ic:'crown', done:Object.keys((c.trivia||{}).themes||{}).length>=15 },
    // Vocabulary study
    { g:'Vocabulary', id:'voc1', name:'First Flip', desc:'Finish your first vocabulary set', ic:'book', done:(c.vocDone||0)>=1 },
    { g:'Vocabulary', id:'voc5', name:'Meaning Seeker', desc:'Finish 5 vocabulary sets', ic:'book', done:(c.vocDone||0)>=5 },
    { g:'Vocabulary', id:'voc15', name:'Lexicon Climber', desc:'Finish 15 vocabulary sets', ic:'book', done:(c.vocDone||0)>=15 },
    { g:'Vocabulary', id:'voc40', name:'Walking Dictionary', desc:'Finish 40 vocabulary sets', ic:'crown', done:(c.vocDone||0)>=40 },
    { g:'Vocabulary', id:'vocq3', name:'Quiz Curious', desc:'Play 3 Vocabulary quiz rounds', ic:'target', done:(c.vocQuiz||0)>=3 },
    { g:'Vocabulary', id:'vocq10', name:'Vocabulary Bee', desc:'Play 10 Vocabulary quiz rounds', ic:'target', done:(c.vocQuiz||0)>=10 },
    { g:'Vocabulary', id:'figdecks3', name:'Phrase Fancier', desc:'Complete 3 idiom & simile decks', ic:'spark', done:Object.keys(c.figDone||{}).length>=3 },
    { g:'Vocabulary', id:'figq5', name:'Idiom Sleuth', desc:'Play 5 idiom or simile quiz rounds', ic:'spark', done:(c.figQuiz||0)>=5 },
  ];
  /* A medal once earned STAYS earned. Live evidence can fall — mastery is re-checked, a
     retired artifact no longer counts toward "Well Stocked" — and a medal that greys out again
     is a medal taken away. badgesSeen is the record (checkNewBadges writes it, once). */
  return defs.map(b=>(b.done||!_seen[b.id])?b:Object.assign({},b,{done:true}))
    .filter(b=>!b.retired||b.done); }
/* ===================== THE SHOP AND THE WALLET (FIX-BEE v2, FAMILY-STANDARD §1, §1.1, §8) =====================
   One Shop, the same in every Bizzing app: tabs Avatars · Worlds · Extras, then the wallet history.
   It opens from ☰ → Shop and from the coin chip's sheet. Every price is fixed and PRINTED, every
   purchase goes through the family wallet, nothing is random, nothing is content (lessons, stops and
   games are never sold), and no screen here shows real money or a way to a payment form.
   • Avatars — the twelve packs by world, each card in the family look (bizzing-avatars.css) with the
     engine's own words for its path ("Free for everyone", "120 coins · 40 more to go",
     "First: master 300 words", "Opens with its world").
   • Worlds — worlds 1–2 open to all; 3–8 for 240 coins each (or with the family plan).
   • Extras — the looks of your own card: a frame round your avatar, a plate behind your name, a background.
   • Grand Prix — your kart's paint and the trail behind it (road to 4.5, P3.19/P3.20).
   The coin chip opens the wallet sheet: the balance, the last 30 lines in words (sibling apps
   marked), and one line on what coins are for. Guards: tests/avatars-engine.cjs (prices, buying) and tests/nav-hive-band.cjs (the wallet sheet).
   THE ONE PRICE TABLE (road to 4.5, P3.17–P3.20; owner: no hats or props — the sinks are frames, name plates,
   backgrounds and kart/trail skins). Everything coins buy besides an avatar or a world is a row here, and every
   row is a LOOK of a kind in SHOP_KINDS — nothing here, and no other spend, unlocks a word, a game, a mode or a
   level. A row with `ms` is never sold (it opens with its learning milestone); a row priced 0 is everyone's.
   The Grand Prix garage (saga2.js) reads these rows through window.SB_SHOP and prints no price (T3: no price on a
   child's screen outside the Shop); the race reads a paint and a trail only to draw them. Ownership keeps the
   stores it had (c.frames/c.frame; c.gpGar.own.paint|trail and .paint|.trail); plates and backgrounds live in
   c.cos = {plate:{id:t}, bg:{id:t}, on:{plate, bg}}. Guard: tests/shop-economy.cjs. */
const SHOP_KINDS=['frame','plate','bg','kart','trail'];
const SHOP_ITEMS=[
  {k:'frame',id:'honey',name:'Honey ring',price:40,about:'A warm gold ring, like the edge of a honeycomb.'},
  {k:'frame',id:'leaf',name:'Meadow leaves',price:60,about:'A green ring with a sprig at the top.'},
  {k:'frame',id:'comet',name:'Comet trail',price:80,about:'A blue ring with a streak of starlight.'},
  {k:'frame',id:'sunset',name:'Sunset',price:100,about:'Orange to pink, like the Race Zone at dusk.'},
  {k:'frame',id:'royal',name:'Royal purple',price:150,about:'A deep purple ring with a gold rim.'},
  {k:'frame',id:'rainbow',name:'Rainbow',price:200,about:'Every colour of the worlds, all the way round.'},
  {k:'plate',id:'card',name:'Paper card',price:20,about:'Your name on a cream card with a honey edge.'},
  {k:'plate',id:'ribbon',name:'Purple ribbon',price:30,about:'Your name on a purple ribbon.'},
  {k:'plate',id:'comb',name:'Honeycomb',price:45,about:'Your name on a strip of golden honeycomb.'},
  {k:'plate',id:'gilt',name:'Gold leaf',price:90,about:'Your name in gold on deep purple.'},
  {k:'bg',id:'meadow',name:'Meadow morning',price:25,about:'Soft green hills behind your card.'},
  {k:'bg',id:'dusk',name:'Lavender dusk',price:35,about:'A purple evening sky behind your card.'},
  {k:'bg',id:'hive',name:'Hive wall',price:50,about:'Honeycomb from edge to edge.'},
  {k:'bg',id:'stars',name:'Night sky',price:60,about:'A deep blue sky with small stars.'},
  {k:'bg',id:'aurora',name:'Aurora',price:120,about:'Green and violet light, like the far north.'},
  {k:'kart',id:'factory',name:'Factory finish',price:0,col:null},
  {k:'kart',id:'honey',name:'Honey gold',price:40,col:'#F0B429'},
  {k:'kart',id:'cherry',name:'Cherry',price:40,col:'#EC5C67'},
  {k:'kart',id:'ocean',name:'Ocean',price:60,col:'#3B93D6'},
  {k:'kart',id:'mint',name:'Mint',price:60,col:'#2FB98A'},
  {k:'kart',id:'grape',name:'Grape',price:80,col:'#8B63D6'},
  {k:'kart',id:'midnight',name:'Midnight',price:80,col:'#2E3566'},
  {k:'trail',id:'dust',name:'Road dust',price:0,col:'225,225,232'},
  {k:'trail',id:'sky',name:'Sky puffs',price:60,col:'150,205,255'},
  {k:'trail',id:'peach',name:'Peach puffs',price:60,col:'255,190,150'},
  {k:'trail',id:'violet',name:'Violet haze',price:90,col:'190,160,255'},
  {k:'trail',id:'gold',name:'Golden comet',col:'255,214,90',ms:{k:'clean',n:25,txt:'Spell 25 box words Clean'}},
  {k:'trail',id:'beeline',name:'Bee line',col:'255,236,140',ms:{k:'right',n:50,txt:'Spell 50 box words right'}},
  {k:'trail',id:'rainbow',name:'Rainbow',col:'rainbow',ms:{k:'cups',n:1,txt:'Finish a whole Cup'}} ];
const SHOP_BY=Object.fromEntries(SHOP_ITEMS.map(x=>[x.k+':'+x.id,x]));
const FRAMES=SHOP_ITEMS.filter(x=>x.k==='frame');
const FRAME_BY=Object.fromEntries(FRAMES.map(f=>[f.id,f]));
function frameOwned(c,id){ c=c||active(); return !!((c.frames||{})[id]); }
const SHOP_GAR={kart:'paint',trail:'trail'};   /* the Grand Prix garage's own names for the two race kinds */
function shopGar(c){ return c.gpGar||(c.gpGar={own:{paint:['factory'],trail:['dust']},paint:'factory',trail:'dust'}); }
function shopOwns(c,it){ if(!c||!it) return false;
  if(it.ms) return ((c.gpStat||{})[it.ms.k]||0)>=it.ms.n;
  if(!it.price) return true;
  if(it.k==='frame') return frameOwned(c,it.id);
  if(SHOP_GAR[it.k]) return ((((c.gpGar||{}).own||{})[SHOP_GAR[it.k]])||[]).indexOf(it.id)>=0;
  return !!(((c.cos||{})[it.k]||{})[it.id]); }
/* what the child wears of a kind — only ever a row they own */
function shopWorn(c,k){ if(!c) return null;
  const id=k==='frame'?c.frame:SHOP_GAR[k]?((c.gpGar||{})[SHOP_GAR[k]]||(k==='kart'?'factory':'dust')):((c.cos||{}).on||{})[k];
  const it=id&&SHOP_BY[k+':'+id]; return it&&shopOwns(c,it)?it:null; }
function shopWear(c,it){ if(!c||!it||!shopOwns(c,it)) return false;
  if(it.k==='frame') c.frame=it.id; else if(SHOP_GAR[it.k]) shopGar(c)[SHOP_GAR[it.k]]=it.id;
  else ((c.cos=c.cos||{}).on=c.cos.on||{})[it.k]=it.id; return true; }
/* THE ONE BUY: the printed price, once, through `spend` (spendCoins → the family wallet). A milestone row or a free
   row is never sold and an owned row is never charged again. It writes ONLY the look it bought, and wears it. */
function shopBuy(c,key,spend){ const it=SHOP_BY[key];
  if(!c||!it||it.ms||!(it.price>0)) return {ok:false,why:'none'};
  if(shopOwns(c,it)) return {ok:false,why:'owned',it};
  if(!spend(it.price,key)) return {ok:false,why:'short',it};
  if(it.k==='frame') (c.frames=c.frames||{})[it.id]=Date.now();
  else if(SHOP_GAR[it.k]){ const o=shopGar(c).own, g=SHOP_GAR[it.k]; (o[g]=o[g]||[]).push(it.id); }
  else ((c.cos=c.cos||{})[it.k]=c.cos[it.k]||{})[it.id]=Date.now();
  shopWear(c,it); return {ok:true,it}; }
window.SB_SHOP={ items:SHOP_ITEMS, by:SHOP_BY, owns:shopOwns, worn:shopWorn };
/* a child's name on the plate they wear, and their card's background — classes only, the look is CSS (index.html) */
function plated(html,c){ const p=shopWorn(c,'plate'); return p?`<span class="bz-plate bz-plate-${p.id}">${html}</span>`:html; }
function cardBg(c){ const b=shopWorn(c,'bg'); return b?' bz-bg bz-bg-'+b.id:''; }
/* Wrap any avatar drawing in the child's worn frame. The ring is pure CSS (.bz-frame-<id>). */
function framed(html,c,size){ c=c||active(); const f=c&&c.frame&&FRAME_BY[c.frame]&&frameOwned(c,c.frame)?c.frame:null;
  return f?`<span class="bz-frame bz-frame-${f}" style="--fs:${size||40}px">${html}</span>`:html; }

const CONCEPTS_PER_PAGE = 9;
function conceptWordsOf(ch){ return (ch.words||[]).filter(x=>x&&x.w); }
function conceptStat(ch){ const ws=conceptWordsOf(ch); const total=ws.length; const m=ws.filter(x=>state.luMastered[nkey(x.w)]).length; const pct=total?m/total:0;
  if(total>0 && m>=total) return { label:'Mastered', fg:'#fff', bg:'var(--good)', m, total, pct, done:true };
  if(total>0 && pct>=PATTERN_DONE_PCT) return { label:'Complete', fg:'#fff', bg:'var(--good)', m, total, pct, done:true };
  if(m>0) return { label:'In progress', fg:'var(--accent)', bg:'var(--chip)', m, total, pct, done:false };
  return { label:'New', fg:'var(--muted)', bg:'var(--surface2)', m, total, pct, done:false }; }
// ----- pattern completion + celebration (concepts & Word Journeys lessons) -----
function patWords(ws){ return (ws||[]).filter(x=>x&&x.w); }
function justCrossed(ws,key){ ws=patWords(ws); const total=ws.length; if(!total||!ws.some(x=>nkey(x.w)===key)) return false;
  const m=ws.filter(x=>state.luMastered[nkey(x.w)]).length; return (m/total>=PATTERN_DONE_PCT) && ((m-1)/total < PATTERN_DONE_PCT); }
function celebratePattern(emoji,kind,name,reward){ const _p=addCoins('mastery'); try{ sfx('win'); burstConfetti(150); }catch(e){} state.toast=emoji+' '+kind+' complete — '+name+'!'+(_p?' +'+_p+' 🪙':''); scheduleToast(3200); }   /* a concept or lesson mastered is the standard's mastery event; the old per-caller reward is ignored */
function checkPatternDone(key){
  for(const ch of (state.conceptData||[])){ if(justCrossed(ch.words,key)){ celebratePattern('🧩','Concept',conceptShort(ch.title),20); return; } }
  for(const L of lessonsAll()){ if(justCrossed(L.words,key)){ celebratePattern('🗺️','Lesson',L.title,15); return; } } }
/* ===================== MASTERY FROM EVIDENCE (FIX-BEE D5, Oct 2026) =====================
   markMastered used to set luMastered[word]=true on the FIRST right answer, from anywhere,
   and nothing ever took it back — a "Complete" button on a card did the same. So one lucky
   answer, or one tap, said "mastered" for ever. Now a word is mastered only on evidence:
   right, and right again on a LATER DAY. The record lives on the CHILD (c.mast), one entry
   per word: {b box 0-5, due day, d day of the last box move, ok, n, at, mt mastered-at,
   lp lapses, sl last slip, miss, leg}. Days are local day numbers (mastDay), so "tomorrow"
   is the calendar's, not 24 hours.
     · a right recall moves the box up only when it is DUE and on a new day; the same word
       right twice today is practice, not evidence (box 0 -> 1 is the first right answer).
     · box >= MAST_BOX (2) is mastered: right on two separate days, a day or more apart.
     · a mastered word comes DUE again after MAST_GAPS[box] days — that is the decay. It is
       still counted as mastered while due, and the Revisions page and the report surface it
       for a re-check; a right answer on the re-check moves it further out.
     · a miss drops it: a mastered word falls to box 1 (and counts a lapse — "slipped"),
       anything else to box 0. Re-mastering needs another later day.
     · recognition ('mc': picking the right spelling) is never enough to move a box up,
       but a wrong pick still drops one — failing to recognise a word is evidence too.
   state.luMastered is DERIVED from the active child's record by mastSync() (every reader —
   stage-ups, concept/lesson labels, heatmaps, reports — keeps working unchanged). Nothing
   else may write it. The child cannot self-mark: the card "Got it" / "Complete" buttons are
   study aids that write nothing here. Guard: tests/mastery-evidence.cjs. */
const MAST_GAPS=[0,1,3,7,21,60];   // days until a box comes due again — a design assumption to tune, not a cited finding
const MAST_BOX=2;                  // box 2 = right on two separate days
function mastDay(t){ const d=new Date(t==null?Date.now():t); return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000); }
function mastRec(c){ if(!c) return null; if(!c.mast||typeof c.mast!=='object'||Array.isArray(c.mast)) c.mast={}; return c.mast; }
function mastIsMastered(r){ return !!(r&&r.b>=MAST_BOX); }
function mastIsDue(r,today){ return !!(r&&r.b>=1&&(today==null?mastDay():today)>=r.due); }
/* one piece of evidence about one word. kind: undefined = a typed recall, 'mc' = recognition */
function mastEvidence(key, ok, kind){ key=nkey(key); if(!key) return null; const c=active(); if(!c) return null;
  const M=mastRec(c); const t=Date.now(), today=mastDay(t);
  const r=Object.prototype.hasOwnProperty.call(M,key)?M[key]:(M[key]={b:0,due:today,ok:0,n:0});
  r.n=(r.n||0)+1; r.at=t;
  if(ok){ r.ok=(r.ok||0)+1;
    if(kind!=='mc'){
      if(!r.b){ r.b=1; r.d=today; r.due=today+MAST_GAPS[1]; }
      else if(today>=r.due && today>(r.d==null?-Infinity:r.d)){ const was=r.b;
        r.b=Math.min(MAST_GAPS.length-1,r.b+1); r.d=today; r.due=today+MAST_GAPS[r.b]; delete r.leg;
        if(was<MAST_BOX && r.b>=MAST_BOX) r.mt=t; } } }
  else { if(r.b>=MAST_BOX){ r.lp=(r.lp||0)+1; r.sl=t; }
    r.b=(r.b>=MAST_BOX)?1:0; r.d=today; r.due=today; r.miss=(r.miss||0)+1; delete r.leg; }
  mastSync(true);
  try{ mastMilestone(c); }catch(e){}
  return r; }
/* luMastered = the active child's mastered words. Rebuilt when the child changes or a record
   is written; a direct write to state.luMastered survives until then (tests seed it). */
let _mastSig='';
function mastSync(force){ try{ const c=active(); if(!c) return; const sig=(state.activeIdx||0)+'|'+(c.name||'');
    if(!force && sig===_mastSig) return; _mastSig=sig;
    const M=c.mast||{}; const lu={}; for(const k in M){ if(Object.prototype.hasOwnProperty.call(M,k) && mastIsMastered(M[k])) lu[k]=true; }
    state.luMastered=lu; }catch(e){} }
/* First load after this change: the household's old luMastered (one right answer, or a
   self-mark — no way to tell which) is carried onto each child as box 2 flagged `leg`, due
   today. It keeps every stage, label and heatmap exactly as the child left it, while the
   report refuses to count it as retained until a re-check proves it. Runs once: only when
   no child in the household has a record yet. */
function mastBoot(lu){ try{ const kids=state.children||[]; if(!kids.length) return;
    if(kids.some(k=>k&&k.mast&&typeof k.mast==='object')){ mastSync(true); return; }
    const today=mastDay(); const keys=Object.keys(lu||{}).filter(k=>lu[k]);
    kids.forEach(k=>{ if(!k) return; const M=mastRec(k);
      keys.forEach(w=>{ const key=nkey(w); if(key && !Object.prototype.hasOwnProperty.call(M,key)) M[key]={b:MAST_BOX,due:today,d:today-1,ok:1,n:1,leg:1}; }); });
    mastSync(true); }catch(e){} }
/* the words ready for their next check, oldest due first — mastered ones being re-checked
   and once-right ones waiting for their second day */
function mastDueWords(c,n){ c=c||active(); const M=(c&&c.mast)||{}; const today=mastDay(); const idx=wordIndex();
  return Object.keys(M).filter(k=>mastIsDue(M[k],today)).sort((a,b)=>(M[a].due-M[b].due)||(M[b].b-M[a].b))
    .slice(0,n||30).map(k=>{ const w=idx[k]||(wordDB().get?wordDB().get(k):null)||{w:k}; return {w:w.w||k,d:w.d||'',s:w.s||'',p:w.p||'',o:w.o||'',r:w.r||'',y:w.y||3,sy:w.sy||'',h:w.h||''}; }); }
/* Hive milestones for mastery — every 25 words actually mastered, written through the family
   drop-in when it is present (batch A wires BZ_ACTIVITY). Never more than one per threshold. */
function mastMilestone(c){ if(!window.BZ_ACTIVITY||typeof BZ_ACTIVITY.trackMilestone!=='function') return;
  const M=c.mast||{}; let n=0; for(const k in M) if(mastIsMastered(M[k])&&!M[k].leg) n++;
  const step=Math.floor(n/25)*25; if(step<25||(c.mastMs||0)>=step) return; c.mastMs=step;
  BZ_ACTIVITY.trackMilestone('bee', c.name||'', 'mastery', step+' words mastered'); }
/* Is a word being tested on screen right now? While it is, the header search and the Finder
   are off — typing the start of the word there would show its spelling mid-drill (FIX-BEE D8).
   State-based (the header renders after the view, but must not depend on the previous DOM). */
function drillLive(){ try{ const S=state; if(S.screen!=='app') return false;
    const practice=(S.nav==='train')||((S.nav==='coach'||S.nav==='levelup')&&S.luTab==='practice');
    if(practice && !S.sessionOver && !S.coachCardView) return true;
    if((S.nav==='coach'||S.nav==='levelup') && S.luTab==='vocab' && S.vp && S.vp.picked==null) return true;
    if(S.nav==='coach' && (S.coachMode==='written'||S.coachMode==='oral')) return true;
    if(S.nav==='trail' && S.trailView==='quiz' && S.tq && !S.tq.over) return true;
    if(S.vocCheck && !S.vocCheck.done && S.nav==='vocab') return true;
    if(S.nav==='mockbee' && S.mb && S.mb.view==='stage') return true;
    if(S.nav==='trivia' && S.trv && /^(quiz|clock|square)$/.test(S.trv.view||'') && !S.trv.done) return true;
    if((S.nav==='lore'||S.nav==='hive') && S.qz && S.qz.mode && S.qz.phase==='play') return true;   /* a hub round: Origins asks for a spelling */
    if(S.nav==='games' && S.game && S.game.status==='play') return true;
    if(S.nav==='gym' && window.SB_GYM && SB_GYM.live()) return true;
    if(S.nav==='today' && window.SB_TODAY && SB_TODAY.live()) return true;   /* Today's ten: a word is open */
    if(S.nav==='adv' && S.adv && /^(drill|scan|mock)$/.test(S.adv.mode||'') && !S.adv.done) return true;
    if(S.nav==='leveltest' && S.lt && S.lt.placed==null) return true;
    if(S.readerQuiz && !S.readerQuiz.over) return true;
    if(document.querySelector('.arc-play,.bz-play')) return true;
    return false; }catch(e){ return false; } }
/* A right answer is EVIDENCE now, not a verdict (the name stays: a dozen callers in four
   files use it). kind 'mc' = recognition. A word crossing into mastery can still finish a
   concept or lesson pattern. */
function markMastered(key,kind){ if(!key) return; key=nkey(key); const was=!!state.luMastered[key];
  mastEvidence(key,true,kind); if(!was && state.luMastered[key]){ checkPatternDone(key); listMasteryPay(key); } }
/* THE MASTERY COIN (standard §1: "fires on mastery evidence, never on an XP level-up").
   A Stage of a word list is mastered when every one of its words is mastered on evidence —
   right on two separate days (c.mast box ≥ 2). The word that completes it pays 'mastery' (20)
   once per list and Stage, recorded on the child (c.mastPaid), so a slip and a re-master
   cannot pay twice. Guard: tests/trust-v2.cjs. */
function listMasteryPay(key){ try{ const c=active(); if(!c||!key) return 0; ensureLists(c);
    const lk=activeListKey(); const s=curStage(c,lk); if(!s||!s.words||!s.words.length) return 0;
    if(!s.words.some(w=>nkey(w.w)===key)) return 0;
    if(!s.words.every(w=>state.luMastered[nkey(w.w)])) return 0;
    const id=lk+':'+(listStageIdx(c,lk)|0); c.mastPaid=c.mastPaid||{}; if(c.mastPaid[id]) return 0;
    c.mastPaid[id]=Date.now(); const n=addCoins('mastery'); save();
    state.toast='Stage mastered in '+listLabel(lk)+' — every word right on two different days'+(n?' · +'+n+' Bizzing coins':''); scheduleToast(3200);
    return n; }catch(e){ return 0; } }
function conceptTierList(t){ return (state.conceptData||[]).filter(c=>(c.difficulty||'medium')===t); }
function currentTier(){ const order=['easy','medium','hard']; for(const t of order){ const list=conceptTierList(t); if(list.length && !list.every(c=>conceptStat(c).done)) return t; } return 'hard'; }
const CONCEPT_FAM_ORDER = ['Basics','Prefixes','Suffixes','Roots','Loanwords','Rules','Subjects','Themes','Advanced',
  'Bee day','Deep spelling','Far origins','Word building'];
const CONCEPT_TEX = {
  stripes:['repeating-linear-gradient(45deg,rgba(255,255,255,.13) 0 2px,transparent 2px 11px)','auto'],
  dots:['radial-gradient(rgba(255,255,255,.22) 1.5px,transparent 1.6px)','13px 13px'],
  grid:['linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px)','15px 15px,15px 15px'],
  diag:['repeating-linear-gradient(-45deg,rgba(255,255,255,.14) 0 3px,transparent 3px 13px)','auto'],
  rings:['radial-gradient(circle at 80% 18%,rgba(255,255,255,.20) 0 16%,transparent 17%),radial-gradient(circle at 14% 96%,rgba(255,255,255,.13) 0 20%,transparent 21%)','auto,auto'],
  cross:['repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 14px),repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 1px,transparent 1px 14px)','auto,auto'] };
const _stripParen = (s) => String(s||'').replace(/\([^)]*\)/g,' ').replace(/\s+/g,' ').trim();
function conceptHero(ch){
  if(ch._hero) return ch._hero;
  const short=conceptShort(ch.title), roots=conceptRoots(ch.title);
  const cleaned=_stripParen(short+' '+roots);
  let affixes=(cleaned.match(/[a-zëé]{1,8}-|-[a-zëé]{1,8}/gi)||[]).map(a=>a.toLowerCase());
  affixes=[...new Set(affixes)];
  let res;
  if(affixes.length){ res={hero:affixes.slice(0,3),kind:'morpheme'}; }
  else {
    let toks=_stripParen(roots||short).split(/[\/,]| and | & /i).map(t=>t.trim()).filter(t=>/^[a-zëé]{2,9}$/i.test(t)).map(t=>t.toLowerCase());
    toks=[...new Set(toks)];
    if(toks.length){ res={hero:toks.slice(0,3),kind:'morpheme'}; }
    else { const ws=conceptWordsOf(ch).map(x=>x.w).filter(Boolean); let pick=ws[0]||short, best=1e9;
      for(const w of ws){ if(w.length<3) continue; const d=Math.abs(w.length-9)+((w.length>=7&&w.length<=12)?0:5); if(d<best){best=d;pick=w;} }
      res={hero:[pick],kind:'word'}; }
  }
  try{ ch._hero=res; }catch(e){}
  return res;
}
// Group the concepts into manageable CHAPTERS (ordered by family, then difficulty; 121 → 11 chapters).
/* Shelves, not slices. The hub used to cut the sorted course into ten equal
   chapters, which put a prefix family and a subject list on the same shelf and —
   once the Advanced Pack chapters joined the same list — would have mixed free and
   locked chapters inside one cover. Each shelf is now one real family, in teaching
   order, and a shelf is either free or Advanced Pack, never both. */
function conceptChapters(){ const chs=state.conceptData||[]; if(state._cchap && state._cchap._n===chs.length) return state._cchap||[];
  const dr={easy:0,medium:1,hard:2};
  const byFam={};
  chs.forEach((c,i)=>{ const g=catGroup(c.category); (byFam[g]=byFam[g]||[]).push({c,i}); });
  const out=[];
  for(const fam of CONCEPT_FAM_ORDER){ const items=byFam[fam]; if(!items||!items.length) continue;
    items.sort((a,b)=>{ const da=dr[a.c.difficulty]??1, db=dr[b.c.difficulty]??1; return (da-db)||(a.i-b.i); });
    out.push({ n:out.length+1, name:fam, adv:!!ADV_FAMS[fam], items:items.map(o=>o.c) }); }
  /* anything with an unexpected category still gets a home */
  for(const fam of Object.keys(byFam)){ if(CONCEPT_FAM_ORDER.indexOf(fam)>=0) continue;
    out.push({ n:out.length+1, name:fam, adv:!!ADV_FAMS[fam], items:byFam[fam].map(o=>o.c) }); }
  out._n=chs.length; state._cchap=out; return out; }
// Shared page header — back link + display title + optional mono meta + muted subtitle.
// Keeps every top-level view's header identical (the Concepts/Journeys reference treatment).
/* ONE back control for the whole app. There were thirty-odd of these, every one a bare
   "← Home" in whatever weight and colour the screen happened to use, and on a painted
   header they all but vanished. It is a pill, it always sits immediately left of the
   title it returns from, and it is the same object on every screen.
   `dark` is for the two places it sits on artwork rather than on paper.
   Exposed on window so trail.js and the other extension files share it. */
/* The Library family. Hoisted out of viewApp so pageHead can read it: a screen you reached
   FROM the Library should go back to the Library. */
const SB_EXPLORE_NAVS={explore:1,concepts:1,journeys:1,themes:1,figurative:1,vocab:1,quotes:1,typing:1,builder:1,adv:1,traps:1,revisions:1,trivtrain:1,ipatrain:1};
function backPill(act, label, arg, dark){
  const A=arg==null?'':` data-arg="${escA(String(arg))}"`;
  const sty = dark
    ? 'background:rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.28);color:#fff'
    : 'background:var(--surface2);border:1px solid var(--line);color:var(--text)';
  return `<button data-act="${act}"${A} aria-label="Back to ${escA(label)}" style="flex:none;display:inline-flex;align-items:center;gap:6px;padding:7px 14px 7px 11px;border-radius:999px;font-weight:800;font-size:13px;line-height:1;white-space:nowrap;${sty}">
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:none"><path d="M15 5 8 12l7 7"/></svg>${esc(label)}</button>`;
}
try{ window.SB_BACK=backPill; }catch(e){}
/* One header bar for every screen: back pill hard left, the screen's own name (with its
   icon, when it has one) CENTRED on the page, actions hard right. Three grid columns with
   1fr on both flanks is what centres the title against the page rather than against
   whatever is left over — a flex row with margin-auto drifts as the right side changes.
   Below 620px it stacks (.sb-phead in index.html) so the title never gets crushed. */
/* THE TAB-ROOT HEAD (road to 4.5, P3.29 — the family's U6). A TAB's own first screen — the Library, Play, My Feed — and
   the Shop name themselves TITLE-LEFT, as the Word Atlas does: the title with its icon, any sub-nav chips beside it,
   the screen's actions at the right, an optional line under it — and NO back pill: a tab root has no parent to go back
   to (the tab bar is the way about; Back still works, through the hash). pageHead, pill and centred title, stays for
   every screen BELOW a tab, whose pill names that parent. Guard: tests/back-pill.cjs (no pill on a root, the title at
   the content's left edge), tests/feed-screen.cjs. */
function tabHead(title, o){ o=o||{};
  return `<div class="sb-thead"><h2 class="sb-thead-t">${o.icon?`<span class="sb-thead-ic">${o.icon}</span>`:''}<span>${title}</span></h2>${o.meta?`<span class="sb-thead-m">${o.meta}</span>`:''}${o.chips?`<span class="sb-thead-chips">${o.chips}</span>`:''}${o.right?`<span class="sb-thead-r">${o.right}</span>`:''}</div>${o.sub?`<p class="sb-thead-s">${o.sub}</p>`:''}`; }
function pageHead(title, meta, sub, right, backAct, backLabel, backArg, icon){
  /* The default back is not always Home. Everything in the Library family — Typing, Quotes,
     Vocabulary, Idioms, Trivia Training, the Sound Alphabet, Themes, Concepts, the Builder,
     Traps — was reached FROM the Library, and play-testing flagged that getting back there
     was not obvious. A screen only defaults to Home when it is not one of those. */
  const _back = backAct || (SB_EXPLORE_NAVS[state.nav] && state.nav!=='explore' ? 'setNav' : 'goHome');
  const _bl   = backLabel || (_back==='setNav' ? 'Library' : 'Home');
  const _ba   = backArg!=null ? backArg : (_back==='setNav' ? 'explore' : null);
  return `<div class="sb-phead" style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:11px;margin-bottom:8px">
      <span class="sb-phead-l" style="justify-self:start;display:flex;align-items:center">${backPill(_back, _bl, _ba)}</span>
      <span class="sb-phead-c" style="justify-self:center;min-width:0;display:flex;align-items:center;justify-content:center;gap:9px;flex-wrap:wrap;text-align:center">
        ${icon?`<span style="flex:none;display:inline-flex;align-items:center;line-height:0">${icon}</span>`:''}
        <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0;line-height:1.15">${title}</h2>${meta?`<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">${meta}</span>`:''}
      </span>
      <span class="sb-phead-r" style="justify-self:end;display:flex;gap:8px;flex-wrap:wrap;align-items:center">${right||''}</span>
    </div>
    ${sub?`<p style="margin:0 0 14px;color:var(--muted);font-size:13px;max-width:52em">${sub}</p>`:''}`;
}

/* ===== Concept animations — generated CSS/SVG "explainers", one per concept (no video files) ===== */
let _animTimer=null; let _vAudio=null;
function clearAnimTimer(){ if(_animTimer){ clearTimeout(_animTimer); _animTimer=null; } }
function canSpeak(){ try{ return !!window.speechSynthesis; }catch(e){ return false; } }
function stopClip(){ try{ if(_vAudio){ _vAudio.onended=null; _vAudio.onerror=null; _vAudio.pause(); _vAudio.src=''; _vAudio=null; } }catch(e){} }
function stopNarration(){ try{ window.speechSynthesis.cancel(); }catch(e){} stopClip(); }
// Pre-rendered AI-voice clip for a concept scene (embedded, fully offline). Falls back to Web Speech if absent.
/* Advanced chapters live in their own array with their own narration and their own
   voice (am_michael, not af_heart), so both lookups branch on ch.adv. */
function advIdx(ch){ try{ const A=window.SB_ADV_CONCEPTS; return (A&&A.chapters)?A.chapters.indexOf(ch):-1; }catch(e){ return -1; } }
function voiceClip(ch,i){ try{
    if(ch&&ch.adv){ const V=window.SB_ADV_VOICE; if(!V||!V.dur) return null; const ai=advIdx(ch); if(ai<0) return null;
      const arr=V.dur[ai]; if(!arr||i>=arr.length) return null;
      return { url:(V.base||'voice/')+'a'+ai+'-'+i+'.mp3', ms:Math.round(((arr[i]||2)+0.25)*1000) }; }
    const V=window.SB_VOICE; if(!V||!V.dur) return null; const ci=(state.conceptData||[]).indexOf(ch); if(ci<0) return null; const arr=V.dur[ci]; if(!arr||i>=arr.length) return null; return { url:(V.base||'voice/')+'c'+ci+'-'+i+'.mp3', ms:Math.round(((arr[i]||2)+0.25)*1000) }; }catch(e){ return null; } }
function hasVoicePack(ch){ try{ const V=window.SB_VOICE; return !!(V&&V.dur&&V.dur[(state.conceptData||[]).indexOf(ch)]); }catch(e){ return false; } }
function narrate(text,onend){ try{ window.speechSynthesis.cancel(); const u=utter(text,0.96); u.onend=onend||null; u.onerror=onend||null; window.speechSynthesis.speak(u); }catch(e){ if(onend) setTimeout(onend,1200); } }
function spokenScene(s){ let t=String((s&&(s.say||s.cap))||'');
  // safety net for any line without an explicit script: strip symbols TTS reads badly
  if(!(s&&s.say)) t=t.replace(/[“”"]/g,'').replace(/→/g,' becomes ').replace(/\s*\/\s*/g,' or ').replace(/(\w)-(?=\s|$)/g,'$1');
  return t.replace(/[🔇✦•↻▶🏆🌅⚡👑]/g,'').replace(/\s+/g,' ').trim(); }
// voice-enabled scene player: narrates each scene and advances when narration ends (with a timing fallback)
function playScene(i){ const ch=state.conceptSel; if(!ch) return; const an=conceptAnim(ch); const N=an.scenes.length; i=Math.max(0,Math.min(i,N-1));
  state.animScene=i; state.animOn=true; render(); clearAnimTimer(); const myNonce=state.animNonce;
  const advance=()=>{ clearAnimTimer(); if(state.animNonce!==myNonce||!state.animOn||state.conceptSel!==ch) return; if(i<N-1) playScene(i+1); };
  let done=false; const go=()=>{ if(done||state.animNonce!==myNonce) return; done=true; clearAnimTimer(); _animTimer=setTimeout(advance,300); };
  const txt=spokenScene(an.scenes[i]); const est=Math.max(an.scenes[i].dur||2000, 1000+txt.length*60);
  const clip=(state.sound!==false)?voiceClip(ch,i):null;
  if(clip){ stopClip();
    try{ const a=new Audio(clip.url); _vAudio=a; a.onended=go;
      a.onerror=()=>{ _vAudio=null; if(state.sound!==false && canSpeak()) narrate(txt,go); };
      const pr=a.play(); if(pr&&pr.catch) pr.catch(()=>{ if(state.sound!==false && canSpeak()) narrate(txt,go); });
    }catch(e){ if(canSpeak()) narrate(txt,go); }
    _animTimer=setTimeout(go, clip.ms+2500); /* safety net if 'ended' never fires */ }
  else if(state.sound!==false && canSpeak()){ narrate(txt, go); _animTimer=setTimeout(go, est); }
  else { _animTimer=setTimeout(advance, an.scenes[i].dur||2300); } }   // dur is now script-length aware
function firstDef(ch,w){ const e=conceptWordsOf(ch).find(x=>nkey(x.w)===nkey(w)); return (e&&(e.def||e.d||''))||''; }
function conceptMeaning(ch){ const p=(String(ch.title).match(/\(([^)]*)\)/)||[])[1]; return (p||conceptRoots(ch.title)||'').trim(); }
function conceptWordList(ch){ return conceptWordsOf(ch).map(x=>x.w).filter(w=>w && /^[a-z]+$/i.test(w)); }
function showcaseWord(ch){ const ws=conceptWordList(ch); if(!ws.length) return (conceptShort(ch.title).replace(/[^a-zA-Z]/g,'')||'spelling'); return ws.slice().sort((a,b)=>Math.abs(a.length-8)-Math.abs(b.length-8))[0]; }
function clearExamples(ch,test,n){ const seen=new Set(); const out=[];
  for(const w of conceptWordList(ch).filter(test).sort((a,b)=>a.length-b.length)){ const k=w.toLowerCase(); if(!seen.has(k)){ seen.add(k); out.push(w); } if(out.length>=(n||3)) break; } return out; }
function hiOf(word,sub){ if(!sub) return null; const i=word.toLowerCase().indexOf(sub.toLowerCase()); return i>=0?[i,sub.length]:null; }
function hiEnd(word,sub){ if(!sub) return null; const lw=word.toLowerCase(), ls=sub.toLowerCase(); return lw.endsWith(ls)?[word.length-sub.length,sub.length]:hiOf(word,sub); }
// speech helpers: spell a morpheme as letters ("tion" -> "T, I, O, N"), tidy meanings, list words naturally
const SPELL=(s)=>String(s||'').replace(/[^a-zA-Z]/g,'').toUpperCase().split('').join(', ');
const ORW=(m)=>String(m||'').replace(/\s*\/\s*/g,' or ').replace(/[“”"()]/g,'').trim();
const LISTW=(arr)=>{ arr=(arr||[]).slice(0,3); if(!arr.length) return ''; if(arr.length===1) return arr[0]; if(arr.length===2) return arr[0]+' and '+arr[1]; return arr[0]+', '+arr[1]+', and '+arr[2]; };
const capFirst=(s)=>String(s||'').replace(/^([a-z])/,(m,c)=>c.toUpperCase());
// Each scene carries: stage (visual), cap (on-screen caption), say (the spoken NARRATION SCRIPT — speech-ready).
function conceptAnim(ch){ if(ch._anim) return ch._anim;
  // Authored explanation script (the bee teaches the concept) takes priority over the pattern templates.
  try{ const ci=(ch&&ch.adv)?advIdx(ch):(state.conceptData||[]).indexOf(ch);
    /* A chapter may carry its own script inline (the Grand Trunk Road ones do —
       they ship with the book, not with the indexed narration tables). */
    const auth=(ch&&ch.sc&&ch.sc.scenes&&ch.sc.scenes.length)?ch.sc
      :(ch&&ch.adv)?(window.SB_ADV_CSCRIPT&&window.SB_ADV_CSCRIPT[ci]):(window.SB_CSCRIPT&&window.SB_CSCRIPT[ci]);
    if(auth&&auth.scenes&&auth.scenes.length){
      /* Pace each scene by how long its narration actually is. A flat 3s default was fine
         for the short general scripts but ran the advanced ones (15-23s of speech) far
         faster than anyone could follow whenever the clip was unavailable. Prefer the
         MEASURED clip length from the voice manifest; fall back to a reading-speed
         estimate from the script text; never go below 3s. */
      const measured=(i)=>{ try{ const c=voiceClip(ch,i); return c?c.ms:0; }catch(e){ return 0; } };
      const scenes=auth.scenes.map((s,i)=>({stage:s.show,cap:s.cap,say:s.say,mood:s.mood||'happy',
        dur:s.dur || measured(i) || Math.max(3000, 900+String(s.say||s.cap||'').length*70)}));
      const r={label:auth.label||catGroup(ch.category),scenes,authored:true}; ch._anim=r; return r; } }catch(e){}
  const fam=catGroup(ch.category); const lc=(ch.title+' '+(ch.category||'')+' '+(ch.concept||'')).toLowerCase();
  const ho=conceptHero(ch); const heroArr=(ho.hero||[]).filter(Boolean); const mean=conceptMeaning(ch)||'';
  // gloss = a REAL meaning, taken only from a parenthetical like "(birth / origin / produce)".
  // Never treat the title's roots as a meaning — saying "it means ego or auto or alter" is nonsense.
  const gloss=((String(ch.title).match(/\(([^)]*)\)/)||[])[1]||'').trim()?ORW((String(ch.title).match(/\(([^)]*)\)/)||[])[1]):'';
  // theme = the human topic before any dash/paren, for word-group concepts (e.g. "Feelings & Emotions").
  const theme=String(conceptShort(ch.title)).split(/[—\-(]/)[0].replace(/&/g,'and').trim();
  const short=l=>String(l).replace(/-/g,''); const S=[]; let label=fam;
  const add=(stage,cap,say,dur)=>S.push({stage,cap,say,dur:dur||2700});
  if(/silent/.test(lc)){ label='Silent letters';
    const clu=short(heroArr[0]||'')||(conceptWordList(ch).map(w=>(w.match(/kn|gh|mb|wr|gn|ps|rh|bt|mn/i)||[])[0]).filter(Boolean)[0]||'');
    const exs=clearExamples(ch,w=>clu&&w.toLowerCase().includes(clu.toLowerCase()),3);
    add({t:'glyph',text:clu||'•',sub:'silent'}, 'Some letters are written but not spoken.', "Sometimes a letter is written, but you don't say it out loud.");
    if(exs[0]) add({t:'word',word:exs[0],hi:hiOf(exs[0],clu),dim:true}, 'In “'+exs[0]+'”, the “'+clu+'” stays silent.', 'Take the word '+exs[0]+'. The letters '+SPELL(clu)+' are there, but they stay silent.');
    if(exs.length>1) add({t:'list',items:exs.slice(0,3).map(w=>({word:w,hi:hiOf(w,clu),dim:true}))}, 'Also: '+exs.slice(0,3).join(', ')+'.', 'It happens in '+LISTW(exs)+'.');
    add({t:'glyph',text:clu||'•',sub:'silent'}, 'Write the “'+clu+'”, but don’t say it.', "So remember to write the silent letters, even though you can't hear them."); }
  else if(fam==='Rules' && /(i before e|ie|ei|cei)/.test(lc)){ label='i before e';
    const ieW=clearExamples(ch,w=>/ie/.test(w.toLowerCase())&&!/cie|cei/.test(w.toLowerCase()),1)[0]||'believe';
    const eiW=clearExamples(ch,w=>/cei|ei/.test(w.toLowerCase()),1)[0]||'receive';
    add({t:'glyph',text:'ie',sub:'i before e'}, 'The rule: i before e…', "Here's a spelling rule. I, before E.");
    add({t:'word',word:ieW,hi:hiOf(ieW,'ie')}, '…like “'+ieW+'”.', 'Like in the word '+ieW+'.');
    add({t:'glyph',text:'cei',sub:'except after c'}, '…except after “c”.', 'Except after the letter C.');
    add({t:'word',word:eiW,hi:hiOf(eiW,eiW.toLowerCase().includes('cei')?'cei':'ei')}, 'After c → ei, like “'+eiW+'”.', 'After a C, it flips to E, I. Like in the word '+eiW+'.'); }
  else if(fam==='Prefixes' && heroArr.length){ const forms=heroArr.map(short); const base=forms[0];
    const exB=clearExamples(ch,w=>w.toLowerCase().startsWith(base.toLowerCase())&&w.length>base.length+1,3);
    const exs=exB.length?exB:clearExamples(ch,w=>forms.some(f=>w.toLowerCase().startsWith(f.toLowerCase())),3);
    const assim=forms.length>1; label=assim?'Assimilation':'Prefix';
    add({t:'glyph',text:base+'-',sub:mean||'prefix'}, 'The prefix “'+base+'-”'+(mean?(' means “'+mean+'”.'):'.'), "Here's a prefix, spelled "+SPELL(base)+"."+(gloss?(' It means '+gloss+'.'):''));
    if(exs[0]){ const w=exs[0],root=w.slice(base.length); add({t:'build',side:'pre',affix:base,root}, 'Add it to the front: “'+root+'” → “'+w+'”.', 'You add it to the front of a word. So '+root+' becomes '+w+'.'); }
    if(assim){ const vars=forms.slice(1,4).map(f=>{ const e=clearExamples(ch,w=>w.toLowerCase().startsWith(f.toLowerCase())&&w.length>f.length+1,1)[0]; return e?{f,e}:null; }).filter(Boolean);
      if(vars.length){ const v=vars[0]; add({t:'list',items:vars.map(x=>({word:x.e,hi:hiOf(x.e,x.f)}))}, 'It changes to match the next letter: '+vars.map(x=>x.f+'-').join(', ')+'.', 'But it changes its spelling to match the next letter. For example, it becomes '+SPELL(v.f)+', as in '+v.e+'.'); }
      add({t:'glyph',text:forms.slice(0,4).join(' '),sub:mean}, '“'+base+'-” keeps its meaning but changes spelling.', 'The meaning stays the same, but the spelling shifts to match. So watch for that hidden prefix.'); }
    else { if(exs.length>1) add({t:'list',items:exs.slice(0,3).map(w=>({word:w,hi:hiOf(w,base)}))}, 'Like: '+exs.slice(0,3).join(', ')+'.', "You'll see it in words like "+LISTW(exs)+'.');
      add({t:'glyph',text:base+'-',sub:mean}, '“'+base+'-”'+(mean?(' = “'+mean+'”.'):' — a handy prefix.'), 'So remember the prefix, spelled '+SPELL(base)+(gloss?(', meaning '+gloss):'')+'.'); } }
  else if(fam==='Suffixes' && heroArr.length){ const forms=heroArr.map(short); const base=forms[0];
    const exs=clearExamples(ch,w=>forms.some(f=>w.toLowerCase().endsWith(f.toLowerCase())&&w.length>f.length+1),3); label='Suffix';
    add({t:'glyph',text:'-'+base,sub:mean||'ending'}, 'The ending “-'+base+'”'+(mean?(' means “'+mean+'”.'):'.'), "Here's an ending, spelled "+SPELL(base)+"."+(gloss?(' It usually means '+gloss+'.'):''));
    if(exs[0]){ const w=exs[0],root=w.slice(0,w.length-base.length); add({t:'build',side:'suf',affix:base,root}, '“'+root+'” + “-'+base+'” → “'+w+'”.', 'You add it to the end of a word. So '+root+' becomes '+w+'.'); }
    if(exs.length>1) add({t:'list',items:exs.slice(0,3).map(w=>({word:w,hi:hiEnd(w,base)}))}, 'Like: '+exs.slice(0,3).join(', ')+'.', 'Look for it in '+LISTW(exs)+'.');
    add({t:'glyph',text:'-'+base,sub:mean}, 'The “-'+base+'” ending'+(mean?(' = “'+mean+'”.'):'.'), 'So remember the ending, spelled '+SPELL(base)+(gloss?(', meaning '+gloss):'')+'.'); }
  else if(fam==='Roots'){ const root=short(heroArr[0]||conceptShort(ch.title)).toLowerCase();
    const fam3=clearExamples(ch,w=>w.toLowerCase().includes(root),4); label='Root family';
    add({t:'glyph',text:root,sub:mean||'root'}, 'The root “'+root+'”'+(mean?(' means “'+mean+'”.'):'.'), 'This root is '+root+', spelled '+SPELL(root)+'.'+(gloss?(' It means '+gloss+'.'):''));
    fam3.slice(0,3).forEach(w=>add({t:'word',word:w,hi:hiOf(w,root)}, '“'+w+'” is built on “'+root+'”.', "Here's "+w+'. You can find '+root+' hidden inside it.', 2300));
    if(fam3.length) add({t:'list',items:fam3.slice(0,3).map(w=>({word:w,hi:hiOf(w,root)}))}, 'One root, a whole word family.', 'So one root, '+root+', gives you a whole family of words.'); }
  else { let pat=ho.kind==='morpheme'?short(heroArr[0]||''):''; label=fam;
    // a tiny stopword can sneak in as a "pattern" from a worded title ("the Four Humors") — don't teach "the".
    if(pat && (pat.length<2 || /^(the|and|for|with|that|this|from|into|four|some|any|all|are|its|out)$/.test(pat.toLowerCase()))) pat='';
    const exs=pat?clearExamples(ch,w=>w.toLowerCase().includes(pat.toLowerCase()),3):clearExamples(ch,()=>true,3);
    const isHomo=/homophone|homonym|homograph|same sound/.test(lc);
    if(pat){ add({t:'glyph',text:pat,sub:gloss||'pattern'}, 'Spot the pattern “'+pat+'”'+(gloss?(' — “'+gloss+'”.'):'.'), 'Watch for the pattern, spelled '+SPELL(pat)+'.'+(gloss?(' It often means '+gloss+'.'):''));
      if(exs.length) add({t:'list',items:exs.slice(0,3).map(w=>({word:w,hi:hiOf(w,pat)}))}, 'See it in: '+exs.slice(0,3).join(', ')+'.', "You'll find it in "+LISTW(exs)+'.');
      add({t:'glyph',text:pat,sub:gloss||theme}, 'Remember the “'+pat+'” pattern.', 'So remember the pattern, spelled '+SPELL(pat)+'.'); }
    else { const head=exs[0]||showcaseWord(ch);
      if(isHomo){ add({t:'word',word:head}, 'Sound-alikes.', "These words sound alike, but they're spelled differently.");
        if(exs.length>1) add({t:'list',items:exs.slice(0,3).map(w=>({word:w}))}, exs.slice(0,3).join(', ')+'.', 'Take '+LISTW(exs)+'. Same sound, different spelling.');
        add({t:'glyph',text:head.slice(0,5),sub:'homophones'}, 'Listen, then picture the spelling.', 'So slow down on these, and match each sound to the right spelling.'); }
      else { add({t:'word',word:head}, 'A key word: “'+head+'”.', "Here's a word from this set: "+head+'.');
        const others=exs.slice(1,3);
        if(others.length) add({t:'list',items:exs.slice(0,3).map(w=>({word:w}))}, 'With '+exs.slice(0,3).join(', ')+'.', 'It goes together with '+LISTW(others)+'.');
        add({t:'glyph',text:head.slice(0,5),sub:theme||fam}, 'Learn these as a set.', (gloss?('Remember, these mean '+gloss+'. '):'')+'These words are grouped together, so study them as a set — and picture each spelling.'); } } }
  if(!S.length){ const w=showcaseWord(ch); add({t:'word',word:w}, '“'+w+'”', "Here's a key word to study: "+w+'.'); }
  const res={label, scenes:S}; try{ ch._anim=res; }catch(e){} return res; }
// ---- scene-spec stage renderer ----
function aTile(letter,kind,anim,sm){ const bg=kind==='affix'?'var(--accent)':'var(--surface2)'; const col=kind==='affix'?'#fff':(kind==='dim'?'var(--muted)':'var(--text)'); const op=kind==='dim'?';opacity:.45':'';
  const w=sm?'clamp(24px,5vw,34px)':'clamp(30px,7vw,48px)', h=sm?'clamp(30px,6vw,42px)':'clamp(38px,9vw,58px)', fs=sm?'clamp(15px,3.4vw,21px)':'clamp(20px,4.6vw,30px)';
  return `<span style="display:inline-grid;place-items:center;width:${w};height:${h};border-radius:${sm?9:11}px;background:${bg};color:${col};font-family:var(--display);font-weight:800;font-size:${fs};box-shadow:0 3px 8px rgba(43,27,94,.1)${op};${anim?('animation:'+anim):''}">${esc(letter)}</span>`; }
function aRow(inner,gap){ return `<div style="display:flex;gap:${gap||5}px;justify-content:center;align-items:center;flex-wrap:wrap">${inner}</div>`; }
function aTiles(str,kind,anim,sm){ return String(str).split('').map((c,i)=>aTile(c,kind,anim?(anim+' .5s ease '+(i*0.05).toFixed(2)+'s both'):'',sm)).join(''); }
function aGlow(html){ return `<div style="animation:ca-glow 1.4s ease 1">${html}</div>`; }
function wTiles(word,hi,dim,sm){ let t=''; for(let i=0;i<word.length;i++){ const on=hi&&i>=hi[0]&&i<hi[0]+hi[1]; const kind=on?(dim?'dim':'affix'):'root'; t+=aTile(word[i],kind,'ca-pop .42s ease '+(i*0.05).toFixed(2)+'s both',sm); } return t; }
function renderStage(s){ if(!s) return '';
  if(s.t==='glyph') return `<div style="text-align:center">${aRow(aTiles(s.text,'affix','ca-pop'))}${s.sub?`<div style="margin-top:13px;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--accent);font-weight:700;letter-spacing:.02em">${esc(s.sub)}</div>`:''}</div>`;
  if(s.t==='word') return aGlow(aRow(wTiles(s.word,s.hi,s.dim)));
  if(s.t==='list') return `<div style="display:flex;flex-direction:column;gap:9px;align-items:center">${s.items.map(it=>aRow(wTiles(it.word,it.hi,it.dim,true),4)).join('')}</div>`;
  if(s.t==='build'){ const root=s.root||'',aff=s.affix||''; return s.side==='pre'?aRow(aTiles(aff,'affix','ca-sl')+aTiles(root,'root')):aRow(aTiles(root,'root')+aTiles(aff,'affix','ca-sr')); }
  if(s.t==='breakdown'){ const word=s.word||''; const parts=s.parts||[];
    const top=aGlow(aRow(wTiles(word,s.hi,false),4));
    const chips=parts.map((pp,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:var(--surface2);font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;animation:ca-up .45s ease ${(i*0.12).toFixed(2)}s both"><b style="color:var(--accent)">${esc(pp.txt)}</b><span style="color:var(--muted)">${pp.gloss?('= '+esc(pp.gloss)):''}</span></span>`).join('');
    return `<div style="display:flex;flex-direction:column;gap:12px;align-items:center">${top}${parts.length?`<div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center">${chips}</div>`:''}</div>`; }
  /* ---- Advanced Mode stages. The general chapters teach word parts, so tiles are
     enough. The advanced ones teach where the STRESS sits and which spelling an
     ORIGIN implies, and neither of those is a letter you can highlight — so they
     get their own stages. ---- */
  if(s.t==='shift'){ // stress moving under derivation: one row per family member
    const row=(r)=>{ const syl=r.syl||[];
      return `<div style="display:flex;align-items:flex-end;gap:5px;justify-content:center;opacity:${r.dim?.45:1};transition:opacity .3s">
        ${syl.map((y,i)=>{ const on=i===r.on;
          return `<span style="display:flex;flex-direction:column;align-items:center;gap:3px">
            <span style="height:9px;font-size:11px;line-height:1;color:var(--accent);font-weight:900">${on?'&#9679;':''}</span>
            <span style="padding:${on?'7px 10px':'5px 9px'};border-radius:8px;font-family:var(--display);font-weight:${on?900:700};font-size:${on?'17px':'14px'};
              background:${on?'var(--accent)':'var(--surface2)'};color:${on?'#fff':'var(--muted)'}">${esc(y)}</span></span>`; }).join('')}
        <span style="margin-left:8px;font-family:var(--body);font-size:11.5px;font-weight:700;color:var(--muted);align-self:center">${esc(r.label||'')}</span></div>`; };
    return `<div style="display:flex;flex-direction:column;gap:10px;align-items:center">${(s.rows||[]).map(row).join('')}</div>`; }
  if(s.t==='rescue'){ // an unreadable schwa, and the relative that exposes it
    const u=s.unclear||{}, c=s.clear;
    const un=`<div style="display:flex;flex-direction:column;align-items:center;gap:5px">
      ${aRow(String(u.word||'').split('').map((ch,i)=>aTile(ch,i===u.at?'dim':'root','ca-pop .4s ease '+(i*0.04).toFixed(2)+'s both',true)).join(''),4)}
      <span style="font-family:var(--body);font-size:11.5px;font-weight:700;color:var(--muted)">unstressed &mdash; any vowel fits</span></div>`;
    if(!c) return un;
    const syl=c.syl||[];
    const cl=`<div style="display:flex;flex-direction:column;align-items:center;gap:5px">
      <div style="display:flex;gap:4px;align-items:center">${syl.map((y,i)=>`<span style="padding:${i===c.on?'7px 10px':'5px 9px'};border-radius:8px;font-family:var(--display);font-weight:${i===c.on?900:700};font-size:${i===c.on?'17px':'14px'};background:${i===c.on?'var(--accent)':'var(--surface2)'};color:${i===c.on?'#fff':'var(--muted)'}">${esc(y)}</span>`).join('')}</div>
      <span style="font-family:var(--body);font-size:11.5px;font-weight:700;color:var(--accent)">stressed &mdash; the vowel is readable</span></div>`;
    return `<div style="display:flex;flex-direction:column;gap:9px;align-items:center">${un}
      <span style="font-size:17px;color:var(--accent);font-weight:900;animation:ca-up .4s ease .2s both">&#8595;</span>${cl}</div>`; }
  if(s.t==='tree'){ // one heard sound, candidate spellings ranked by origin
    return `<div style="display:flex;flex-direction:column;gap:9px;align-items:center;width:100%">
      <span style="padding:6px 14px;border-radius:999px;background:var(--accent);color:#fff;font-family:var(--display);font-weight:900;font-size:15px">${esc(s.sound||'')}</span>
      <div style="display:flex;flex-direction:column;gap:5px;width:100%;max-width:320px">
        ${(s.branches||[]).map((b,i)=>`<div style="display:flex;align-items:center;gap:8px;animation:ca-up .4s ease ${(i*0.09).toFixed(2)}s both">
          <span style="min-width:44px;text-align:center;padding:4px 8px;border-radius:7px;background:var(--surface2);font-family:var(--display);font-weight:900;font-size:14px;color:var(--accent)">${esc(b.sp)}</span>
          <span style="font-family:var(--body);font-size:11.5px;font-weight:800;color:var(--text)">${esc(b.org)}</span>
          ${b.ex?`<span style="margin-left:auto;font-family:var(--body);font-size:11px;font-weight:650;color:var(--muted)">${esc(b.ex)}</span>`:''}
        </div>`).join('')}
      </div></div>`; }
  if(s.t==='pair'){ // two words, one root, two routes
    const side=(w)=>`<span style="padding:7px 12px;border-radius:9px;background:var(--surface2);font-family:var(--display);font-weight:800;font-size:16px;color:var(--text)">${esc(w)}</span>`;
    return `<div style="display:flex;flex-direction:column;gap:9px;align-items:center;text-align:center">
      <div style="display:flex;gap:10px;align-items:center">${side(s.left)}<span style="color:var(--muted);font-weight:900">&#8596;</span>${side(s.right)}</div>
      ${s.root?`<span style="font-family:var(--body);font-size:12px;font-weight:800;color:var(--accent)">${esc(s.root)}</span>`:''}
      ${s.note?`<span style="font-family:var(--body);font-size:11.5px;font-weight:650;color:var(--muted);max-width:30em;line-height:1.45">${esc(s.note)}</span>`:''}</div>`; }
  if(s.t==='ask'){ // a question at the mic and what it eliminates
    return `<div style="display:flex;flex-direction:column;gap:10px;align-items:center;width:100%">
      <span style="padding:7px 15px;border-radius:999px;background:var(--accent);color:#fff;font-family:var(--display);font-weight:800;font-size:14px;text-align:center">${esc(s.q||'')}</span>
      <div style="display:flex;flex-direction:column;gap:5px;max-width:340px">
        ${(s.rules||[]).map((r,i)=>`<div style="display:flex;gap:7px;align-items:flex-start;animation:ca-up .4s ease ${(i*0.09).toFixed(2)}s both">
          <span style="color:var(--accent);font-weight:900;font-size:12px;line-height:1.5">&#8250;</span>
          <span style="font-family:var(--body);font-size:12px;font-weight:700;color:var(--text);line-height:1.5">${esc(r)}</span></div>`).join('')}
      </div></div>`; }
  return ''; }
function conceptAnimStage(an,sc){ const scn=an.scenes[Math.min(Math.max(sc,0),an.scenes.length-1)]; return renderStage(scn&&scn.stage); }
function conceptPlayer(){ const ch=state.conceptSel; if(!ch) return ''; const an=conceptAnim(ch); const N=an.scenes.length; const sc=Math.min(Math.max(state.animScene||0,0),N-1); const playing=state.animOn;
  const voiceOn=state.sound!==false;
  return `<div style="background:var(--bg2);border:1px solid var(--accent);border-radius:20px;overflow:hidden;box-shadow:var(--glow)">
    <div style="display:flex;align-items:center;gap:8px;padding:11px 16px;border-bottom:1px solid var(--line)"><span style="display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:800;font-size:13px;color:var(--accent)">${iconSVG('spark',15)} Animated explainer</span><span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('volume',12)} ${voiceOn?(hasVoicePack(ch)?'Narrated':'Voice on'):'Voice off'}</span><span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${esc(an.label)}</span></div>
    <div style="position:relative;background:radial-gradient(120% 120% at 50% 0,color-mix(in srgb,var(--accent) 13%,var(--bg2)),var(--bg2));padding:22px clamp(74px,11%,100px);min-height:150px;display:flex;align-items:center">
      ${(()=>{ const raw=an.scenes[sc].mood||'happy'; const bmood=raw==='oops'?'think':raw;      // happy learning emotions only — no sad/angry bee
        const right=sc%2===1;                                                                    // the bee flies to the other side each scene
        return `<div style="position:absolute;bottom:6px;left:${right?'calc(100% - 90px)':'10px'};width:78px;height:88px;transition:left 1.1s cubic-bezier(.45,.08,.25,1);z-index:2;pointer-events:none">
          <div style="width:100%;height:100%;transform:scaleX(${right?-1:1});transition:transform .5s ease .45s">
            <div class="sb-bee-presenter${playing?' talking':''}" style="width:100%;height:100%;filter:drop-shadow(0 6px 12px rgba(43,27,94,.18))">${mascotSVG(bmood)}</div>
          </div></div>`; })()}
      <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;min-height:100px">${conceptAnimStage(an,sc)}</div>
      ${!playing?`<button data-act="conceptPlay" aria-label="Play" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;background:color-mix(in srgb,var(--bg2) 52%,transparent)"><span style="width:60px;height:60px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;padding-left:4px;font-size:24px;box-shadow:0 6px 18px rgba(0,0,0,.22)">▶</span><span style="font-weight:800;font-size:12px;color:var(--text)">Watch &amp; listen</span></button>`:''}
    </div>
    <div style="padding:13px 16px 15px">
      <div style="display:flex;gap:5px;margin-bottom:10px">${an.scenes.map((s,i)=>`<button data-act="animTo" data-arg="${i}" style="flex:1;height:5px;border-radius:999px;background:${i<=sc?'var(--accent)':'var(--surface2)'}"></button>`).join('')}</div>
      <div style="font-size:13px;color:var(--text);line-height:1.5;min-height:40px;font-weight:600">${esc(an.scenes[sc].cap)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:9px"><button data-act="conceptReplay" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('volume',14)} ${playing?'Replay':'Watch & listen'}</button><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">Scene ${sc+1}/${N}</span></div>
    </div>
  </div>`; }
function viewConceptDetail(){
  const S=state; const csel=S.conceptSel; const cw=(csel.words||[]).filter(x=>x&&x.w);
  // ONE card flow: the animated explainer is card 1, then method + worked cards follow.
  const steps=[{kind:'anim'}]; if(csel.method) steps.push({kind:'method',title:'How to crack it',html:csel.method});
  (csel.cards||[]).forEach(cc=>steps.push({kind:'card',title:cc.title,body:cc.body}));
  const total=steps.length; const idx=Math.min(Math.max(S.conceptStep||0,0),total-1); const step=steps[idx];
  const dots=steps.map((s,i)=>`<button data-act="conceptStepGo" data-arg="${i}" style="height:7px;border-radius:999px;flex:1;background:${i<=idx?'var(--accent)':'var(--surface2)'}" title="${s.kind==='anim'?'Animated explainer':escA(s.title||'')}"></button>`).join('');
  const genericCard=(st)=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:24px;min-height:170px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="width:30px;height:30px;flex-shrink:0;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(st.kind==='method'?'spark':'book',16)}</span><div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.2">${esc(st.title||'')}</div></div>
      <div style="font-size:15px;line-height:1.65;color:var(--text);${st.kind==='method'?'white-space:pre-line':''}">${st.kind==='method'?st.html:esc(st.body||'')}</div>
    </div>`;
  const stepContent = step.kind==='anim' ? conceptPlayer() : genericCard(step);
  const stepNav = (idx>0||idx<total-1) ? `<div style="display:flex;gap:10px;margin-bottom:14px">${idx>0?`<button data-act="conceptPrev" style="padding:12px 18px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">← Back</button>`:''}${idx<total-1?(idx===0?`<button data-act="conceptNext" style="flex:1;padding:12px;border-radius:10px;background:transparent;color:var(--accent);font-weight:800;font-size:15px;text-decoration:underline;text-underline-offset:3px">Read more →</button>`:`<button data-act="conceptNext" style="flex:1;padding:12px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next card →</button>`):''}</div>` : '';
  return `<div style="animation:sb-rise .35s ease both;max-width:780px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">${backPill('conceptBack','All concepts',null)}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(csel.category)}</span><span style="${diffStyleFor(csel.difficulty)}">${(diffMap[csel.difficulty]||diffMap.medium)[0]}</span></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;line-height:1.1;margin:0 0 4px">${esc(conceptShort(csel.title))}</h2>
    <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--accent);font-weight:700;margin-bottom:16px">${esc(conceptRoots(csel.title))}</div>
    <p style="font-size:15px;line-height:1.55;color:var(--muted);margin:0 0 12px">${esc(csel.concept||'')}</p>
    ${(()=>{ /* The other half of the two-way link: the index says where on the map this
        chapter is taught, so the Library and the Atlas stop being parallel worlds. */
      if(typeof window.SB_TRAIL_TAUGHT!=='function') return '';
      const gi=(state.conceptData||[]).indexOf(csel); const t=gi>=0?SB_TRAIL_TAUGHT(gi):null;
      if(!t) return '';
      return `<button data-act="trailUnit" data-arg="${escA(t.unit)}" style="display:inline-flex;align-items:center;gap:8px;margin:0 0 18px;padding:8px 14px;border-radius:var(--r-pill,999px);background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">
        ${iconSVG('steps',15)} Taught on the map at ${esc(t.act)} · stop ${t.stop} →</button>`; })()}
    <div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${total}${step.kind==='anim'?' · Watch':''}</span><div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round((idx+1)/total*100)}%;transition:width .3s"></div></div></div>
      <div style="display:flex;gap:6px;margin-bottom:14px">${dots}</div>
      ${stepNav}
      ${stepContent}
    </div>
    <!-- Advanced chapters used to suppress this row because they shipped with no drill
         words. They now carry a mined, library-verified list each, so they get the same
         word browser and Practise button as every other chapter. -->
    ${`<button data-act="conceptWordsToggle" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:15px 18px;font-family:var(--display);font-weight:800;font-size:15px;color:var(--text);margin-bottom:12px"><span>${(S.conceptWordsOpen?'Hide word study':'Study the words one by one')+' · '+cw.length}</span><span style="color:var(--accent)">${S.conceptWordsOpen?'▲':'▼'}</span></button>`}
    ${S.conceptWordsOpen?`<div style="margin-bottom:22px;animation:sb-rise .3s ease both">${wordFlash(cw.map(x=>({w:x.w,d:x.def||'',s:x.ex||'',p:x.say||'',o:''})), S.conceptWordIdx, 'conceptWordNav', {})}</div>`:''}
    ${`<button data-act="practiseConcept" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-top:12px">Practise these words →</button>`}
  </div>`;
}

// After an answer is checked, glide to the next word automatically so one Enter is enough.
// (Enter still works to skip the wait; navigating away cancels it.)
function autoAdvance(ms){ try{ clearTimeout(state._advTimer); }catch(e){}
  state._advTimer=setTimeout(()=>{ if(!state.settingsOpen && state.status && state.status!=='idle' && (state.nav==='train'||state.nav==='coach')){ try{ app.next(); }catch(e){} } }, ms||900); }
// Practice CARD VIEW — a portrait flash-card deck. The word shows on a tall card; tap or
// swipe the RIGHT half = "got it" → next (completeWord), the LEFT half = revise → next
// (reviseWord). The top-left icon toggles back to the spelling card. Because the word itself
// is shown here, meaning/sentence are not masked.
// the word set the Learn tab / card deck iterate (the coach working set), and the current card
function learnWords(){ return (state.sessionWords&&state.sessionWords.length)?state.sessionWords:(function(){ try{ return listWords(activeListKey())||[]; }catch(e){ return []; } })(); }
function cardWordNow(){ const ws=learnWords(); if(!ws.length) return {w:''}; return ws[Math.min(Math.max(state.cardIdx||0,0),ws.length-1)]||{w:''}; }
// reusable one-card-at-a-time study flashcard (word + meaning + sentence + params), Prev/Next + progress bar
function wordFlash(words, idx, navAct, opts){
  opts=opts||{}; const N=words.length||1; const i=Math.min(Math.max(idx||0,0),N-1); const w=words[i]||{w:'',d:'',s:'',p:'',o:''};
  const mastered=state.luMastered[nkey(w.w)]; const pct=Math.round((i+1)/N*100);
  const chip=(t)=>`<span style="padding:4px 11px;border-radius:999px;background:var(--surface2);font-size:12px;color:var(--muted);font-weight:700">${t}</span>`;
  // Practice self-mark: two top-right buttons replace the Next button — either one advances.
  const selfMark=!!opts.selfMark;
  const markRow=selfMark?`<div style="display:flex;justify-content:flex-end;flex-wrap:wrap;gap:7px;align-self:stretch;width:100%;margin-bottom:6px">
        <button data-act="flashMark" data-arg="${escA('done|'+navAct+'|'+w.w)}" title="Got it — mark this word complete and move to the next" style="display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:999px;${mastered?'background:var(--good);border:1px solid var(--good);color:#fff':'background:color-mix(in srgb,var(--good) 15%,transparent);border:1px solid var(--good);color:var(--good)'};font-weight:800;font-size:12.5px">✓ Complete</button>
        <button data-act="flashMark" data-arg="${escA('revise|'+navAct+'|'+w.w)}" title="Mark this word for revision and move to the next" style="display:inline-flex;align-items:center;gap:5px;padding:8px 13px;border-radius:999px;background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border:1px solid var(--treasure,#F0B429);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12.5px">${iconSVG('flag',14,2.4)} Mark for revision</button>
      </div>`:'';
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${i+1} of ${N}</span>
      <div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div>
      ${mastered?'<span style="color:var(--good);font-weight:800;font-size:12px;white-space:nowrap">✓ Mastered</span>':''}
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow);text-align:center;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center">
      ${markRow}
      <div style="display:flex;align-items:center;justify-content:center;gap:11px;flex-wrap:wrap;max-width:100%">
        <div style="font-family:var(--display);font-weight:800;min-width:0;max-width:100%;hyphens:auto;${hwStyle(w.w,36)}">${esc(w.w)}</div>
        <button data-act="say" data-arg="${escA(w.w)}" aria-label="Hear the word" title="Hear the word" style="width:42px;height:42px;flex-shrink:0;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',20)}</button>
      </div>
      ${w.sy?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--accent);font-weight:700;letter-spacing:.04em;margin-top:3px">${esc(w.sy)}</div>`:''}
      <div style="font-size:15px;color:var(--text);line-height:1.5;margin-top:8px">${esc(w.d)}</div>
      ${w.s?`<div style="font-size:13px;color:var(--muted);line-height:1.55;margin-top:9px"><b style="color:var(--text)">Sentence.</b> ${esc(w.s)}</div>`:''}
      ${w.h?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:13px;color:var(--text);line-height:1.5;margin-top:10px;background:var(--chip);border-radius:10px;padding:9px 13px;max-width:42em"><span style="color:var(--accent);margin-top:1px;flex-shrink:0">${iconSVG('bulb',15)}</span><span>${esc(w.h)}</span></div>`:''}
      ${realMiss(w)?`<div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--bad);font-weight:700;line-height:1.5;margin-top:9px">${iconSVG('alert',14)} Often misspelled “${esc(w.m)}”</div>`:''}
      ${(()=>{try{const ps=homPartners(w.w); return ps.length?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:13px;color:var(--text);line-height:1.5;margin-top:9px;background:var(--surface2);border-radius:10px;padding:9px 13px;max-width:42em"><span style="color:var(--accent);flex-shrink:0;font-weight:800">≈</span><span>Sounds exactly like <b>${ps.map(esc).join('</b> and <b>')}</b> — a different spelling! At the bee, ask for the meaning to know which one you have.</span></div>`:'';}catch(e){return '';}})()}
      ${(()=>{try{const a=altPron(w.w); return a?`<div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;font-size:13px;color:var(--text);line-height:1.5;margin-top:9px;background:var(--surface2);border-radius:10px;padding:9px 13px;max-width:42em"><span>Two ways to say it: <b>/ ${esc(a.a)} /</b> and <b>/ ${esc(a.b)} /</b>${a.n?` — ${esc(a.n)}`:''}</span><button data-act="sayAlt" data-arg="${escA(w.w)}" title="Hear the other pronunciation" style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12px;flex-shrink:0">${iconSVG('volume',14)} Hear it the other way</button></div>`:'';}catch(e){return '';}})()}
      ${(()=>{try{const d=diacritic(w.w); return (d&&d.m!==w.w)?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:13px;color:var(--text);line-height:1.5;margin-top:9px;background:var(--surface2);border-radius:10px;padding:9px 13px;max-width:42em"><span style="flex-shrink:0">´</span><span>In full dress it wears its marks: <b style="font-size:15px">${esc(d.m)}</b> (${esc(d.n)}) — at the bee, spelling the plain letters is accepted.</span></div>`:'';}catch(e){return '';}})()}
      ${synsHTML(w.w)}
      ${altsHTML(w.w,false)}
      <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:15px">
        ${w.bp!=null?`<span title="Bee-probability score: ${w.bp}/100" style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;background:var(--surface2);font-size:12px;color:var(--accent);font-weight:800">${iconSVG('target',13)} ${beeOdds(w.bp)}</span>`:''}
        ${w.p?chip('/ '+esc(w.p)+' /'):''}${(()=>{try{const t=ipaOf(w.w,w.p); return t?chip('IPA /'+esc(t)+'/'):'';}catch(e){return '';}})()}${w.o?chip(esc(w.o)):''}${w.ps?chip(esc(w.ps)):''}${(()=>{try{const tl=trickLabel(w);return tl?`<span title="Why this word is tricky" style="padding:4px 11px;border-radius:999px;background:var(--chip);font-size:12px;color:var(--accent);font-weight:800">🧩 ${esc(tl)}</span>`:'';}catch(e){return '';}})()}
        <button data-act="reportWord" data-arg="${escA(w.w)}" title="Meaning or sentence look wrong? Report it for review" style="padding:4px 11px;border-radius:999px;background:transparent;border:1px dashed var(--line);font-size:12px;color:var(--muted);font-weight:700">${iconSVG('flag',14,2.4)} Report a fix</button>
      </div>
      ${state.reportW===w.w?`<div style="margin-top:12px;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:12px;max-width:34em">
        <div style="font-weight:800;font-size:13px;margin-bottom:8px">What looks wrong with “${esc(w.w)}”?</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${['Meaning is wrong','Sentence is wrong','Meaning ↔ sentence mismatch','Pronunciation','Something else'].map(o=>`<button data-act="reportIssue" data-arg="${escA(o)}" style="padding:7px 12px;border-radius:999px;background:var(--bg2);border:1px solid var(--line);font-weight:700;font-size:12px;color:var(--text)">${o}</button>`).join('')}</div>
        <button data-act="reportClose" style="margin-top:8px;color:var(--muted);font-weight:700;font-size:12px;text-decoration:underline;text-underline-offset:2px">Cancel</button>
      </div>`:''}
    </div>
    ${selfMark?`<div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button data-act="${navAct}" data-arg="prev" style="padding:12px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button>
      <span style="flex:1;font-size:12px;color:var(--muted);font-weight:700;text-align:center"><b style="color:var(--good)">✓ Complete</b> or <b style="color:var(--treasure-deep,#8A5B00)">⚑</b> records the word — Next just moves on</span>
      ${i>=N-1
        ?`<button data-act="deckFinish" data-arg="${navAct}" style="padding:12px 20px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Finish 🎉</button>`
        :`<button data-act="${navAct}" data-arg="next" style="padding:12px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Next →</button>`}
    </div>`:`<div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button data-act="${navAct}" data-arg="prev" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button>
      <button data-act="${navAct}" data-arg="next" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'All done ✓':'Next →'}</button>
    </div>`}`;
}

/* ===================== Parent analytics + offline tips engine (no AI) ===================== */
let _wIdx=null;
function wordIndex(){ if(_wIdx) return _wIdx; _wIdx={}; try{ journeySorted().forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); ((window.SB_NSF500&&SB_NSF500.words)||[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); ((window.SB_VOCAB26&&SB_VOCAB26.words)||[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); (window.SB_SCRIPPS||[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); (typeof REVIEW!=='undefined'?REVIEW:[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); }catch(e){} return _wIdx; }
function dayNum(){ const d=new Date(); return Math.floor(d.getTime()/86400000); }
function parentSignals(){ const c=active(); const played=(c.daysPlayed||[]).slice().sort();
  let daysSince=999; if(played.length){ const last=new Date(played[played.length-1]+'T12:00'); daysSince=Math.max(0,Math.round((Date.now()-last.getTime())/86400000)); }
  const cutoff=Date.now()-14*86400000; const active14=played.filter(k=>new Date(k+'T12:00').getTime()>=cutoff).length;
  const missedN=((c.missed)||[]).length; const key=activeListKey(); const enc=encounteredWords(key);
  const encM=enc.filter(w=>state.luMastered[nkey(w.w)]).length; const coverage=enc.length?Math.round(encM/enc.length*100):0;
  /* Signals added Aug 2026. The tip rules were written when the app was Practice plus a
     word list; it has since grown an Atlas, a vocabulary ladder with its own progression,
     an Arcade, Trivia, Theme Journeys and the Advanced Pack — and a parent was never told
     a word about any of them, because parentTips() could not see them. Each of these is a
     cheap read that unlocks an if-this-then-tip rule below. */
  const band=(function(){ try{ return beeBand(c); }catch(e){ return {band:2,calibrating:true,acc:0}; } })();
  const trail=c.trail||{}; const trailDone=Object.keys(trail.done||{}).length;
  const vocab=c.vocab||{}; const vocabTouched=Object.keys(vocab).length>0;
  const themesN=(function(){ try{ return myThemes().length; }catch(e){ return 0; } })();
  const arcadeN=(function(){ try{ return Object.keys(SB_STORE.getJSON('arcBest',{})||{}).length; }catch(e){ return 0; } })();
  const advOn=(function(){ try{ return !!(window.ADV&&ADV.active&&ADV.active()); }catch(e){ return false; } })();
  const traps=(function(){ try{ return missTraps(); }catch(e){ return []; } })();
  return { c, daysSince, active14, acc:(c.acc||0), missedN, goodDays:goodDaysThisWeek(c), toBee:(milestone()||{days:9999}).days, age:(c.age||9), coverage,
    reviewHealth:Math.max(0,100-missedN*5), consistency:Math.round(active14/14*100),
    band:band.band, calibrating:!!band.calibrating, trailDone, vocabTouched, themesN, arcadeN, advOn,
    traps, topTrap:traps[0]||null }; }
// Generated tips multiply the authored library with real app data — every concept, theme,
// champion-word hook and the child's own misses become concrete, presentable coaching tips.
function genTip(kind,idx){ const T=window.SB_TIPS||{};
  if(kind==='pattern'){ const chs=state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]; if(!chs.length) return null; const ch=chs[idx%chs.length]; return 'Pattern coaching — '+conceptShort(ch.title)+': '+ch.concept; }
  if(kind==='theme'){ const ts=themeDefs(); if(!ts.length) return null; const t=ts[idx%ts.length]; return 'Interest is memory glue: if '+t.label.toLowerCase()+' excites your child, add the “'+t.label+'” Theme Journey — its words will stick twice as fast as neutral lists.'; }
  if(kind==='champword'){ const pool=journeySorted().filter(w=>w.h&&(w.y||3)>=4); if(!pool.length) return null; const w=pool[idx%pool.length]; return 'Champion word of the day — “'+w.w+'”: '+w.h; }
  if(kind==='trap'){ const t=(function(){ try{ return missTraps()[0]; }catch(e){ return null; } })(); if(!t) return null;
    const how=(typeof TRAP_TIP!=='undefined'&&TRAP_TIP[t.k])||'';
    return 'Their misses cluster in one place — '+t.label.toLowerCase()+' ('+t.n+' of them). '+(how?how+' ':'')+'Coach the PATTERN for a week rather than the words: fixing one pattern retires a dozen words at once.'; }
  if(kind==='miss'){ const ms=(active().missed)||[]; if(!ms.length) return null; const m=ms[idx%ms.length]; const w=wordIndex()[nkey(m.w)];
    if(w&&w.h) return 'On the review pile — “'+w.w+'”: '+w.h;
    if(w&&w.sy) return 'On the review pile — “'+w.w+'”: spell it beat by beat ('+w.sy.replace(/\./g,' · ')+'), then say the whole word to seal it.';
    return 'On the review pile — “'+m.w+'”: have your child spell it three ways (pencil, finger-trace, eyes closed) and retire it after three clean days.'; }
  return null; }
function parentTips(){ const T=window.SB_TIPS||{}; const s=parentSignals(); const page=state.tipPage||0; const seed=dayNum()+page*7;
  const picks=[]; const used=new Set();
  const take=(cat,why)=>{ if(used.has(cat)) return; used.add(cat);
    if(cat==='pattern'||cat==='theme'||cat==='champword'||cat==='miss'||cat==='trap'){ const t=genTip(cat,seed+picks.length); if(t) picks.push({cat,why,text:t}); return; }
    const arr=T[cat]; if(!arr||!arr.length) return; picks.push({cat,why,text:arr[(seed+picks.length)%arr.length]}); };
  if(!everPractised(s.c)){ take('young','the first session is ahead'); take('motivation','starting strong'); take('parenting','setting up the habit'); return picks; }
  if(s.daysSince>=3) take('reengage','no practice in '+s.daysSince+' days');
  if(s.active14<7) take('consistency','practised '+s.active14+' of the last 14 days');
  if(s.acc && s.acc<75) take('accuracy','accuracy at '+s.acc+'%');
  if(s.missedN>=8) take('difficult',s.missedN+' words on the review pile');
  if(s.missedN>0){ take('miss','from '+(s.c.name||'your speller')+"'s own misses"); take('review',s.missedN+' words to revisit'); }
  if(s.toBee<=21) { take('beeday',s.toBee+' days to the bee'); take('nerves','competition is close'); }
  if(s.coverage<40 && s.toBee>28) take('coverage','list coverage at '+s.coverage+'%');
  if(s.age<=8) take('young','tuned for younger spellers');
  /* --- surfaces the app grew after these rules were first written --- */
  if(s.topTrap && s.topTrap.n>=3) take('trap','misses cluster in '+s.topTrap.label.toLowerCase());
  if(s.calibrating) take('placement','still working out the right word difficulty');
  if(s.trailDone===0 && s.active14>=2) take('atlas','practising, but the Atlas is untouched');
  else if(s.trailDone>0 && s.trailDone<4) take('atlas','only '+s.trailDone+' Atlas stop'+(s.trailDone>1?'s':'')+' cleared');
  if(!s.vocabTouched && s.band>=3) take('vocab','spelling at level '+s.band+', vocabulary not started');
  if(s.themesN===0 && s.active14>=3) take('themes','no Theme Journey picked yet');
  if(s.arcadeN===0 && s.age<=11) take('arcade','has not opened the Arcade');
  if(s.band>=6 && !s.advOn) take('advanced','at level '+s.band+' of 9 without the Advanced Pack');
  if(s.band>=5) take('origin','origin questions matter from level 5');
  ['motivation','memory','parenting','oral','written','origin','pattern','champword','theme','plateau','atlas','vocab','themes','arcade','placement'].forEach(cat=>{ if(picks.length<6) take(cat,'daily coaching rotation'); });
  return picks.slice(0,6); }
/* ===================== THE FAMILY REPORT CARD (FIX-BEE M2, family standard §7) =====================
   Three measures, the same in every Bizzing app so the Hive can merge them:
     TIME      active minutes, read from the family feed (SB_STORE 'activity' = bizzing.activity)
               (the drop-in writes {a:'bee', d, m, who}); never invented when it is absent.
     PROGRESS  steps along the path — Atlas stops cleared and where the child is now, plus the
               spelling Stage on the active list.
     MASTERY   what the child can now DO, from the evidence record (c.mast) and nothing else:
               words retained on a later day, by concept family; words that slipped since they
               were mastered; words due for their re-check; traps to help with.
   Cumulative counts and minutes are never presented as learning. Every number comes from
   one pass over the record, so the totals agree with each other by construction — and
   tests/report-card.cjs checks they do. */
function reportCard(c){ c=c||active(); const out={ name:(c&&c.name)||'' };
  /* time */
  try{ const o=SB_STORE.getJSON('activity',null);
    if(o&&Array.isArray(o.s)){ const who=String(c.name||'').trim().toLowerCase(); const d0=new Date(); d0.setDate(d0.getDate()-6);
      const cut=d0.getFullYear()+'-'+String(d0.getMonth()+1).padStart(2,'0')+'-'+String(d0.getDate()).padStart(2,'0');
      const mine=o.s.filter(x=>x&&x.a==='bee'&&String(x.who||'').trim().toLowerCase()===who&&!x.ev&&x.d>=cut);
      out.time={ feed:true, minutes:mine.reduce((t,x)=>t+(+x.m||0),0), days:new Set(mine.map(x=>x.d)).size }; }
    else out.time={ feed:false, minutes:0, days:0 }; }catch(e){ out.time={ feed:false, minutes:0, days:0 }; }
  /* progress */
  try{ const tn=window.SB_TRAIL_NEXT?SB_TRAIL_NEXT():null;
    out.progress={ atlas:tn?{ cleared:tn.done, at:tn.allDone?'every stop on this tier':tn.title, region:tn.act||'', act:tn.actId||'', tier:tn.lap||1 }:null };
    /* P1.7: where onboarding's placement started this child, and what it suggested (c.trail.start) */
    try{ const st=(c.trail||{}).start; if(st&&st.u){ const T=window.SB_TRAIL, A=T&&T.honey&&T.honey.acts||[], nm=i=>{ const a=A[i]; return a?String(a.title).replace(/^Act [IVX]+ · /,''):''; };
      out.progress.placed={ chose:nm(st.pick)||st.act, suggested:nm(st.rec), n:st.n|0, ok:st.ok|0, at:st.at||'' }; } }catch(e){}
    const lk=activeListKey(); out.progress.stage=listStageIdx(c,lk)+1; out.progress.list=listLabel(lk).split(' · ')[0]; }catch(e){ out.progress=out.progress||{atlas:null}; }
  /* mastery — one pass */
  const M=(c&&c.mast)||{}; const today=mastDay(); const week=Date.now()-7*864e5; const idx=wordIndex();
  const fam={}, traps={}; const m={ retained:0, carried:0, due:0, learning:0, newThisWeek:0, slipped:[], dueWords:[] };
  for(const k in M){ if(!Object.prototype.hasOwnProperty.call(M,k)) continue; const r=M[k]; if(!r) continue;
    const w=idx[k]||{w:k}; let cls='plain'; try{ cls=trickAnal(w).cls; }catch(e){}
    if(r.b>=MAST_BOX){
      if(r.leg) m.carried++; else { m.retained++; fam[cls]=(fam[cls]||0)+1; if(r.mt&&r.mt>=week) m.newThisWeek++; }
      if(today>=r.due){ m.due++; if(m.dueWords.length<12) m.dueWords.push(k); } }
    else { if(r.b===1) m.learning++;
      if(r.lp) m.slipped.push({w:k, at:r.sl||0});
      if(r.miss){ const t=(traps[cls]=traps[cls]||{n:0,words:[]}); t.n+=r.miss; if(t.words.length<4) t.words.push(k); } } }
  m.slipped.sort((a,b)=>b.at-a.at);
  m.mastered=m.retained+m.carried;
  m.families=Object.keys(fam).map(k=>({k, label:TRICK_LABELS[k]||k, n:fam[k]})).sort((a,b)=>b.n-a.n);
  m.traps=Object.keys(traps).filter(k=>k!=='plain'||Object.keys(traps).length===1).map(k=>({k, label:TRICK_LABELS[k]||k, n:traps[k].n, words:traps[k].words})).sort((a,b)=>b.n-a.n).slice(0,3);
  out.mastery=m; return out; }
window.SB_REPORT_CARD=reportCard;
function everPractised(c){ c=c||active(); try{ return bandEvidence(c)>0 || masteredCount()>0 || (c.missed||[]).length>0 || Object.keys(state.coachHistory||{}).length>0; }catch(e){ return false; } }
/* ===================== List Builder (button-based custom lists) ===================== */
function builtWords(key){ const bl=(active().builtLists||{})[key]; if(!bl) return []; const idx=wordIndex(); const db=wordDB(); return (bl.ws||[]).map(s=>idx[nkey(s)]||db.get(nkey(s))||{w:s}).filter(Boolean); }
/* ---------------------------------------------------------------------------
   THE LIST BUILDER — a faceted search over the whole served library.

   The five-tap version this replaces asked five either/or questions (difficulty,
   size, source, length, one "tricky pattern") and handed back a slice. It could
   not answer the questions a speller actually has — "French words I keep getting
   wrong", "eight-letter nouns from the finals lists", "words about medicine that
   start with ph" — because each of those is several conditions at once.

   So: fourteen filters, any number of them at a time, and EVERY OPTION CARRIES ITS
   OWN LIVE COUNT computed with that filter lifted out (proper faceted counting).
   A choice that would leave nothing is greyed before it is tapped, which is the
   whole reason to count this way rather than just filtering.

   Two of those fourteen are the spelling bands, and they replaced a facet that was
   lying: see B2_DIFF / B2_ODDS. The subject and origin facets are grouped rather
   than ranked flat, because 768 tags and 214 origin strings sorted by count is a
   haystack — see B2_TAGGRP / B2_ORIGRP.

   Icons are the app's own SVG set. No emoji: they render as a different picture
   on every platform and this screen is dense enough to need one visual language.
--------------------------------------------------------------------------- */

/* the index is built once over the served corpus and dropped when a shard lands
   (boot-lazy fires sb-lazy; app3's listener clears _b2Idx with the other pools) */
let _b2Idx = null;

function b2State(){ const S=state;
  /* `diff` missing means either a fresh builder or one left over from the version
     that filtered on `lv` (rarity). Rebuild rather than migrate: the old facet has
     no honest equivalent here — a y-band is not a difficulty band — so carrying the
     selection across would silently mean something different from what was chosen. */
  if(!S.b2 || !S.b2.diff) S.b2={ diff:[], odds:[], bee:[], cls:[], orig:[], tag:[], pos:[],
                   syl:[], fl:[], flag:[],
                   pool:'', size:20, wlmin:3, wlmax:24, starts:'', has:'', ends:'',
                   qtag:'', qorig:'', tgrp:'', ogrp:'', tab:'list', seed:1,
                   /* open by default: the two spelling bands and the size. Everything
                      else announces its setting in the closed header, so the rail fits
                      one screen and a child chooses what to open rather than scrolling
                      past fourteen groups to find the one they wanted. */
                   open:{ diff:1, odds:1, size:1 } };
  if(!S.b2.open) S.b2.open={ diff:1, odds:1, size:1 };
  return S.b2; }
// Words the child has met on a list so far: every Level up to (and including) the current one.
function encounteredWords(key){ try{ const c=active(); const stages=listStages(key); const idx=listStageIdx(c,key);
  let out=[]; for(let i=0;i<=idx && i<stages.length;i++) out=out.concat(stages[i].words||[]); return out.filter(w=>w&&w.w); }catch(e){ return []; } }
/* THE ADVANCED PACK's DOOR LIVES HERE NOW (owner, 10 Oct 2026 — the road to 4.5, P0.29: "Remove the last 'Show a
   grown-up' doors from the child Atlas; one quiet line in the Parent Zone"). The child's Atlas says only "More
   continents come with the Advanced Pack"; the way to the pack is this one quiet line, behind the Parent Zone's PIN,
   through the same door the Atlas used (ultraUpsell → the pack's page, which asks for the PIN again). Nothing when
   the pack is on — or under the testing unlock, which opens it anyway. */
function advParentLine(){ try{ if(advModeOn(active())) return ''; }catch(e){ return ''; }
  return `<div class="sb-pz-adv" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:12px 0 0;padding:10px 14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line)">
    <span style="flex:1;min-width:200px;display:inline-flex;align-items:center;gap:7px;font-size:13px;font-weight:650;color:var(--muted)">${iconSVG('lock',14)} More continents on the Word Atlas, the Advanced Rounds and Ultra Champions, come with the Advanced Pack.</span>
    <button data-act="ultraUpsell" style="min-height:44px;padding:0 14px;border-radius:10px;background:transparent;border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">About the pack</button></div>`; }
 // 10 Championship
const capWords=(s)=> String(s||'').toLowerCase().replace(/\b([a-z])/g,(m,c)=>c.toUpperCase());
   /* below this a theme cannot make an honest level ladder */
function themeLore(id){ try{ return (window.SB_THEME_LORE||{})[id]||null; }catch(e){ return null; } }

/* ===================== WORD VOICE TESTER (human-in-the-loop QA) ===================== */
// Flags live in a dedicated device key (SB_STORE 'vflags') that no reset touches, AND are seeded
// from window.SB_VOICE_FLAGLOG — the git-committed permanent record — so a cache
// clear can never lose feedback Claude has already logged.
function vtLoad(){ let f; try{ f=SB_STORE.getJSON('vflags',{})||{}; }catch(e){ f={}; }
  f.ok=f.ok||{}; f.bad=f.bad||{};
  try{ (window.SB_VOICE_FLAGLOG||[]).forEach(x=>{ const k=nkey(x&&(x.w||x)); if(k && !f.ok[k] && !f.bad[k]) f.bad[k]={h:(x&&x.h)||'',at:(x&&x.at)||0,logged:1}; }); }catch(e){}
  return f; }
function vtSave(f){ try{ SB_STORE.setJSON('vflags', {ok:f.ok||{},bad:f.bad||{}}); }catch(e){} }
function voiceFlagCount(){ try{ return Object.keys(vtLoad().bad).length; }catch(e){ return 0; } }
window.sbVTnote=function(k,val){ const f=vtLoad(); k=nkey(k); if(!f.bad[k]) f.bad[k]={h:'',at:Date.now()}; f.bad[k].h=String(val||'').slice(0,60); vtSave(f); };

function viewSettings(){
  /* SETTINGS IN THE FAMILY'S FIVE SECTIONS (FAMILY-STANDARD §5, FIX-BEE v2), in this order:
     Me · Sound & music · Look · Comfort · Grown-ups 🔒. The first four are the child's own and
     open without a PIN — they hold sound, text size and the world, which a child must be able to
     change. Everything a grown-up decides (the plan, the age band, the daily targets, backup,
     the testing tools, signing out) sits BEHIND the PIN in the fifth section: until the PIN is
     passed, that section is one row and nothing else, so "Manage plan" can never appear on a
     child's screen. The pass lasts until the sheet closes (state._setGrown, cleared by
     closeSettings). Components are the family's: switch, segmented pills, one slider.
     Guard: tests/trust-v2.cjs (order, the PIN wall, Esc, every control has an effect). */
  const S=state, c=active();
  const sw=(act,label,on,sub,id)=>`<div class="bz-row"><div class="bz-row-t"><span class="bz-row-l" id="${id||('l-'+act)}">${label}</span>${sub?`<span class="bz-row-s">${sub}</span>`:''}</div>
      <button data-act="${act}" role="switch" aria-checked="${on?'true':'false'}" aria-labelledby="${id||('l-'+act)}" class="bz-sw${on?' on':''}"><span></span></button></div>`;
  const seg=(label,act,opts,cur,sub)=>`<div class="bz-row bz-row-col"><div class="bz-row-t"><span class="bz-row-l">${label}</span>${sub?`<span class="bz-row-s">${sub}</span>`:''}</div>
      <div class="bz-seg" role="radiogroup" aria-label="${escA(label)}">${opts.map(o=>`<button data-act="${act}" data-arg="${escA(o[0])}" role="radio" aria-checked="${o[0]===cur?'true':'false'}" class="${o[0]===cur?'on':''}">${o[1]}</button>`).join('')}</div></div>`;
  const card=(n,id,title,icon,body,extra)=>`<section class="bz-set-sec" data-sec="${id}" aria-labelledby="bz-sec-${id}">
      <h3 id="bz-sec-${id}"><span class="bz-set-n" aria-hidden="true">${n}</span>${icon?`<span class="bz-set-ic" aria-hidden="true">${iconSVG(icon,17,2.2)}</span>`:''}${title}${extra||''}</h3>
      <div class="sb-card bz-set-card">${body}</div></section>`;

  /* ---- 1. Me ---- */
  const kids=(S.children||[]);
  const me=`<div class="bz-row bz-row-col"><label class="bz-row-l" for="bz-name">Display name <span class="bz-row-s" style="display:inline">— a nickname is perfect</span></label>
      <input id="bz-name" data-inp="profName" data-fkey="profName" value="${escA(c.name||'')}" maxlength="24" placeholder="e.g. Ahana, or Fox" autocomplete="off" class="bz-input"></div>
    <div class="bz-row"><div class="bz-row-t" style="flex-direction:row;align-items:center;gap:12px"><span class="bz-set-av" aria-hidden="true">${avatarSVG(c.avatar||'bizzy',46)}</span><span><span class="bz-row-l">Avatar</span><span class="bz-row-s">${esc(((window.SB_AVATARS&&SB_AVATARS.byId[c.avatar])||{}).name||'Bizzy')}</span></span></div>
      <button data-act="setOpenCollection" class="bz-btn">Change</button></div>
    ${kids.length>1?`<div class="bz-row bz-row-col"><span class="bz-row-l">Switch child</span><div class="bz-seg" role="radiogroup" aria-label="Switch child">${kids.map((k,i)=>`<button data-act="setSwitchChild" data-arg="${i}" role="radio" aria-checked="${i===S.activeIdx?'true':'false'}" class="${i===S.activeIdx?'on':''}">${esc(k.name||'Speller')}</button>`).join('')}</div></div>`
      :`<div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Switch child</span><span class="bz-row-s">Only ${esc(c.name||'one speller')} on this device. A grown-up can add a child below.</span></div></div>`}`;

  /* ---- 2. Sound & music ---- */
  const V=window.SB_VOL; const vol=V?V.pct():40; const musicOn=V?V.musicOn():true;
  const sound=sw('toggleSound','Sound effects',!!S.sound,'Right, wrong, finish, medal and coin sounds.')
    + sw('toggleMusic','Music',musicOn,'A calm loop for Home, each world and the games. Off in Calm mode.')
    + `<div class="bz-row bz-row-col"><label class="bz-row-l" for="bz-vol">Volume <b class="bz-vol-n" data-vol-n>${vol}%</b></label>
        <input id="bz-vol" type="range" min="0" max="100" step="5" value="${vol}" data-vol data-chg="setVolume" class="bz-range" aria-valuetext="${vol} percent"></div>`
    + sw('toggleReadAloud','Read aloud',!!S.readAloud,'Reads cards and sentences to you.')
    + seg('Reading speed','setVoiceRate',[['slow','Slower'],['normal','Normal']],((S.voiceRate||1)<1)?'slow':'normal');

  /* ---- 3. Look ---- */
  const modePref=S.modePref||S.mode||'light';
  const worldThumbs=THEMES.map((t,i)=>{ const un=isThemeUnlocked(t.id); const on=t.id===S.theme; const H=(typeof WORLD_HERO!=='undefined'&&WORLD_HERO[t.id])||{};
    return `<button data-act="${un?'pickTheme':'setOpenShopWorld'}" data-arg="${t.id}" class="bz-wthumb${on?' on':''}${un?'':' locked'}" aria-pressed="${on?'true':'false'}" aria-label="${escA(t.label+(un?(on?' — on':''):' — '+worldLockText(t.id)))}">
        <span class="bz-wthumb-art" style="position:relative;overflow:hidden;${H.bg||''}">${worldPlateImg(t.id)}</span><span class="bz-wthumb-l">${esc(t.label)}</span>${un?'':`<span class="bz-wthumb-lock">${iconSVG('lock',11,2.4)} ${esc(worldLockText(t.id,true))}</span>`}</button>`; }).join('');
  const look=`<div class="bz-row bz-row-col"><span class="bz-row-l">World</span><span class="bz-row-s">Each world repaints the app and brings its own cast and music.</span><div class="bz-wgrid">${worldThumbs}</div></div>`
    + seg('Light or dark','setModePref',[['light','Light'],['white','White'],['dusk','Dark'],['auto','Match device']],modePref)
    + seg('Text size','setTextSize',[['small','S'],['normal','M'],['large','L']],S.textSize||'normal')
    + seg('Style','setAgeMode',[['playful','Playful'],['focused','Focused']],(c.ageMode||((c.age||9)<=11?'playful':'focused')),'Playful has more colour and confetti; Focused is quieter.')
    + sw('toggleSplash','Opening splash',(function(){try{return SB_STORE.get('splash')==='1';}catch(e){return false;}})(),'A short world opening when the app starts. Off unless you turn it on.');

  /* ---- 4. Comfort ---- */
  const comfort=sw('toggleReduceMotion','Reduce motion',!!S.a11yMotion,'Stops the moving backgrounds and slides.')
    + sw('toggleCalm','Calm mode',!!S.calmMode,'Music off, softer effects, no confetti, games without a rush.')
    + sw('toggleContrast','High contrast',!!S.a11yContrast,'Stronger outlines and text.')
    + seg('Letters','setA11yFont',[['std','Standard'],['easy','Easy-read']],S.a11yFont||'std');

  /* ---- 5. Grown-ups 🔒 ---- */
  let grown;
  if(!S._setGrown){
    grown=`<div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Grown-ups only</span><span class="bz-row-s">Age range, daily targets, the plan, backup and the testing tools. ${pinSet()?'Needs the grown-up PIN.':'A grown-up chooses a PIN the first time.'} The PIN is a deterrent, not a lock.</span></div>
      <button data-act="setGrownOpen" class="bz-btn bz-btn-lock">${iconSVG('lock',14,2.4)} Open</button></div>`;
  } else {
    const _tierId=(window.SB_ENT)?SB_ENT.tierId():'free'; const _tier=(window.SB_TIERS&&SB_TIERS[_tierId])||{name:'Free',badge:''};
    const _parent=(window.SB_AUTH)?SB_AUTH.current():null; const _advOn=advModeOn(c);
    const _band=ageBandOf(c); const t=targets(c);
    const num=(lab,act,val,unit)=>`<label class="bz-num"><span class="bz-row-s">${lab}</span><span><input type="number" min="1" max="600" data-chg="${act}" value="${val}" aria-label="${escA(lab+' ('+unit+')')}"> <span class="bz-row-s" style="display:inline">${unit}</span></span></label>`;
    const _voices=enVoices();
    const voiceOpts=['<option value="">Auto · best available</option>'].concat(_voices.map(v=>`<option value="${escA(v.name)}"${VOICE.name===v.name?' selected':''}>${esc(v.name)}</option>`)).join('');
    grown=`<div class="bz-row bz-row-col"><span class="bz-row-l">Age range</span><span class="bz-row-s">Sets how hard the words start.</span>
        <div class="bz-seg" role="radiogroup" aria-label="Age range">${AGE_BANDS.map(b=>`<button data-act="setAgeBand" data-arg="${b.k}" role="radio" aria-checked="${b.k===_band.k?'true':'false'}" class="${b.k===_band.k?'on':''}">${b.n}</button>`).join('')}</div></div>
      <div class="bz-row bz-row-col"><span class="bz-row-l">Daily targets</span><span class="bz-row-s">They draw the three rings on Home. Going past one is fine.</span>
        <div class="bz-nums">${num('Time on the app','setTgtApp',t.app,'min')}${num('Time practising','setTgtPrac',t.prac,'min')}${num('Words practised','setTgtWords',t.words,'words')}</div></div>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Plan</span><span class="bz-row-s">${esc(_tier.name)}${_parent?(' · signed in as '+esc(_parent.email)):' · playing offline'}</span></div>
        <button data-act="openTiers" class="bz-btn">Manage plan</button></div>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Advanced Pack</span><span class="bz-row-s">${S.devUnlock?'Testing unlock is on, so this reads as open.':(_advOn?'On — national-bee prep is live.':'An add-on with national-bee prep.')}</span></div>
        ${S.devUnlock?'':`<button data-act="toggleAdvPack" role="switch" aria-checked="${_advOn?'true':'false'}" aria-label="Advanced Pack" class="bz-sw${_advOn?' on':''}"><span></span></button>`}</div>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Report card and backup</span><span class="bz-row-s">The weekly report, printables, backup, restore and erase.</span></div>
        <button data-act="setNav" data-arg="parent" class="bz-btn">Open</button></div>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Progress</span><span class="bz-row-s">Level, the Atlas, this week and every word met.</span></div>
        <button data-act="setNav" data-arg="progress" class="bz-btn">Open</button></div>
      ${sw('toggleFeed','My Feed',!state.feedOff,'A short feed of cards from across the app, picked from what your child is learning. Off removes the tab and the menu row.')}
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Grown-up PIN</span><span class="bz-row-s">${pinSet()?'Set. Change it any time.':'Not set yet.'}</span></div>
        <button data-act="pinSetup" class="bz-btn">${pinSet()?'Change':'Set PIN'}</button></div>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Add a child</span><span class="bz-row-s">Each child keeps their own words, coins and collection.</span></div>
        <button data-act="addChild" class="bz-btn">Add</button></div>
      <div class="bz-row bz-row-col"><label class="bz-row-l" for="bz-voice">Device voice for sentences</label><span class="bz-row-s">Words use the app's recorded voice. Sentences use a voice on this device.</span>
        <select id="bz-voice" data-chg="voiceSetDevice" class="bz-input">${voiceOpts}</select></div>
      ${_parent?'':`<div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Parent account</span><span class="bz-row-s">Optional, for cloud backup.</span></div><button data-act="openAuth" data-arg="signin" class="bz-btn">Sign in</button></div>`}
      <details class="bz-row bz-row-col bz-tools"><summary class="bz-row-l">Testing tools</summary>
        ${sw('toggleDevUnlock','Unlock everything',!!S.devUnlock,'Opens every gate for testing. It never changes a child’s coins or collection.')}
        ${sw('toggleTester','Tester mode',!!S.tester,'Shows content still under review on this device: the Analogies tab, Mock Analogy Bee, the Link Finder and Word Forge. Children never see it. ?tester=1 asks for this PIN first.')}
        ${(c&&c.devCoins)?sw('toggleDevCoins','Test coins',true,'Left on by an older build. Switch off to restore the real balance.'):''}
        ${S.devUnlock?`<div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Report a bug</span><span class="bz-row-s">Notes stay on this device.</span></div><button data-act="bugToggle" class="bz-btn">Open</button></div>`:''}
        <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l">Support console</span><span class="bz-row-s">Profiles and plans on this device. Local only.</span></div><button data-act="openAdmin" class="bz-btn">Open</button></div>
        ${sw('toggleResearch','Research capture',!!(window.SB_TM&&SB_TM.on()),'Logs taps and screens on this device only. Nothing is sent.')}
        ${(window.SB_TM&&SB_TM.on())?`<div class="bz-row"><span class="bz-row-s">${fmtN(SB_TM.count())} events on this device</span><span style="display:flex;gap:8px"><button data-act="tmExport" class="bz-btn">Export</button><button data-act="tmClear" class="bz-btn">Clear</button></span></div>`:''}
      </details>
      <div class="bz-row"><div class="bz-row-t"><span class="bz-row-l" style="color:var(--bad,#D6453A)">Sign out</span><span class="bz-row-s">${_parent?('Signs '+esc(_parent.email)+' out and returns to the welcome screen.'):'Returns to the welcome screen.'}</span></div>
        <button data-act="signOut" class="bz-btn" style="color:var(--bad,#D6453A)">Sign out</button></div>`;
  }

  return `<div class="bz-settings">
    <div class="bz-set-head"><button data-act="closeSettings" class="bz-set-back" aria-label="Back">${iconSVG('arrowLeft',16,2.4)}<span>Back</span></button>
      <h2>${iconSVG('gear',20,2.2)} Settings</h2><span></span></div>
    ${card(1,'me','Me','user',me)}
    ${card(2,'sound','Sound &amp; music','volume',sound)}
    ${card(3,'look','Look','palette',look)}
    ${card(4,'comfort','Comfort','heart',comfort)}
    ${card(5,'grownups','Grown-ups','lock',grown,`<span class="bz-set-lock">${iconSVG('lock',12,2.4)} PIN</span>`)}
    <footer class="bz-set-foot"><a href="privacy.html">Privacy</a><span aria-hidden="true">·</span><button data-act="devTap" class="bz-set-about">About Bizzing Bee</button><span aria-hidden="true">·</span><span>version ${esc(String(window.SB_ASSET_V||'').replace(/^\?v=/,'')||'dev')}</span></footer>
  </div>`;
}
// Right-click a top-nav list chip to remove it (all but the core 3). Progress is kept; re-add from Setup.
window.sbDelList = function(e,key){ try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
  if({journey:1,review:1,missed:1}[key]){ flash('That one stays — it’s a core list.'); return false; }
  const c=active(); const nm=(key==='journey'?'Bizzing Bee Journey':listLabel(key).split(' · ')[0]);
  if(!window.confirm('Remove “'+nm+'” from your lists?\n\n(Your progress is kept — you can add it again from Setup & lists.)')) return false;
  if(c.pinnedLists) delete c.pinnedLists[key];
  if(key==='custom') state.customWords=[]; if(key==='ai') state.aiWords=[];
  if((c.activeList||'default')===key){ c.activeList='journey'; state.sessionListKey=null; }
  save(); flash('List removed ✓'); render(); return false;
};
function magicConceptCells(){ try{ loadConcepts(); }catch(e){}
  return (state.conceptData||[]).map((ch,ci)=>({kind:'concept', id:'c:'+ci, label:conceptShort(ch.title), ci}))
    .filter(x=>isConceptUnlocked(x.ci) && conceptWordsOf((state.conceptData||[])[x.ci]).length>=5); }
function magicNewBoard(){ clearGTimer();
  const ok=t=>nextWords.pool(null,{purpose:'drill',theme:t.id,needDef:true}).length>=10;   /* through the door: kid-safe, band-gated themes */
  const used=state._magicUsed||(state._magicUsed=new Set());
  const fresh=t=>ok(t)&&!used.has(t.id);
  // every round deals different themes; when the deck runs out, reshuffle it
  if(themeDefs().filter(fresh).length<9) used.clear();
  let pool=myThemes().filter(fresh);
  pool=pool.concat(sample(themeDefs().filter(t=>fresh(t)&&!pool.some(p=>p.id===t.id)), 9-Math.min(pool.length,9)));
  if(pool.length<9) pool=pool.concat(sample(themeDefs().filter(t=>ok(t)&&!pool.some(p=>p.id===t.id)),9-pool.length));
  // mix in up to 3 concept cells so the board teaches patterns too
  const cCells=sample(magicConceptCells().filter(x=>!used.has(x.id)), 3);
  let cells=sample(pool,9-cCells.length).map(t=>({kind:'theme',id:t.id,label:t.label,cluster:t.cluster}))
    .concat(cCells.map(x=>({kind:'concept',id:x.id,label:x.label,ci:x.ci})));
  const board=sample(cells,cells.length).slice(0,9).map(c=>({...c,done:false,best:0,tried:0}));
  board.forEach(c=>used.add(c.id));
  const round=((state.game&&state.game.type==='magic')?(state.game.round||1):0)+1;
  state.game={type:'magic',board,round,cell:null,qs:null,qi:0,right:0,picked:null,ok:null,revealed:false,
    lines:{r:[false,false,false],c:[false,false,false],d:[false,false]},squareDone:false,celebr:null,coins:0,status:'board'};
  state.typed=''; render(); }
/* ===================== GAMES ARCADE ===================== */
/* One quick game. Beat the Buzzer, Magic Squares and Word Quiz's spelling rounds merged into the
   Spelling Gym (games spec §4.2, gym.js) on 4 Oct 2026: their entry points are gone, their engines
   stay (playGame('beat'|'magic'|'buzz') still run, and tests drive them). Word Quiz keeps its
   knowledge rounds until Word Lore takes them. */
const GAMES=[
  { type:'wordquiz', ic:'book',   name:'Word Quiz',       blurb:'Meanings, spellings or word origins — choose your round, or go mixed.', tag:'Quiz', c:'#13A892',c2:'#0E8A78',tex:'rings' },
];
function gameCoverBG(gm){ const t=CONCEPT_TEX[gm.tex]||CONCEPT_TEX.stripes;
  return `background-color:${gm.c};background-image:${t[0]},linear-gradient(135deg,${gm.c},${gm.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* Animated cover scene per game — each icon acts out its game (buzzer gets pressed, sword
   strikes shield, grid cells light up…). Parts share one timeline so the choreography syncs. */
function gameArtSVG(type,size){ size=size||58;
  // Arcade tiles get a character in the avatar house style; the line-art below still serves
  // the game types that have no mascot yet.
  if(window.SB_GAME_MASCOT){ const m=SB_GAME_MASCOT(type,Math.round(size*1.5)); if(m) return m; }
  const W=(inner)=>`<svg class="sb-ga" viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;overflow:visible;filter:drop-shadow(0 3px 6px rgba(0,0,0,.22))">${inner}</svg>`;
  const P=(d)=>`<path d="${d}"/>`;
  if(type==='beat') return W(
    `<g style="animation:sb-ga-ring 1.9s ease-in-out infinite;transform-origin:24px 30px"><circle cx="24" cy="30" r="13" stroke-opacity=".85"/></g>`+
    `<g style="animation:sb-ga-press 1.9s ease-in-out infinite">`+P('M24 4v6M24 10c-4 0-6 2-6 5v4h12v-4c0-3-2-5-6-5z')+`</g>`+
    `<g style="animation:sb-ga-squash 1.9s ease-in-out infinite;transform-origin:24px 34px">`+P('M15 26a9 5.5 0 0 1 18 0v3H15z')+`</g>`+
    P('M12 34h24a3 3 0 0 1 3 3v3H9v-3a3 3 0 0 1 3-3z'));
  if(type==='boss') return W(
    `<g style="animation:sb-ga-brace 2.2s ease-in-out infinite">`+P('M8 12l10-3 10 3v9c0 8-4 13-10 16-6-3-10-8-10-16z').replace('<path','<path transform="translate(-2,2) scale(.9)"')+P('M14 20l4 4 7-8').replace('<path','<path transform="translate(-2,2) scale(.9)"')+`</g>`+
    `<g style="animation:sb-ga-swing 2.2s ease-in-out infinite;transform-origin:40px 40px">`+P('M40 40L23 23M20 18l5 5M27 25l-4 4M18 20l10 10')+`</g>`+
    `<g style="animation:sb-ga-spark 2.2s linear infinite;transform-origin:22px 24px">`+P('M22 17v-4M17 22h-4M18.5 18.5l-3-3M27 19l3-3')+`</g>`);
  if(type==='magic'){ const cells=[0,1,2,3,4,5,6,7,8].map(i=>{ const x=13+(i%3)*8, y=13+Math.floor(i/3)*8;
      return `<rect x="${x-3}" y="${y-3}" width="6.4" height="6.4" rx="1.6" fill="#fff" fill-opacity=".14" style="animation:sb-ga-cell 3.6s linear infinite;animation-delay:${(i*0.28).toFixed(2)}s"/>`; }).join('');
    return W(cells+`<g style="animation:sb-ga-star 3.6s ease-in-out infinite;transform-origin:24px 24px">`+P('M24 15l2.6 5.8 6.4.6-4.8 4.2 1.4 6.2-5.6-3.4-5.6 3.4 1.4-6.2-4.8-4.2 6.4-.6z').replace('<path','<path fill="rgba(255,255,255,.85)"')+`</g>`); }
  if(type==='buzz') return W(
    `<g style="animation:sb-ga-flame 2.2s ease-in-out infinite;transform-origin:24px 40px">`+P('M24 6c1 6 6.5 9 6.5 15.5a11 11 0 0 1-4.5 9c.7-3-.4-5.6-2.6-7.2.5 4.5-2.7 7-5 9.4a8 8 0 0 1-1.4-4.7C13.7 30.5 13 26 15.5 21.5 18 17 23 13 24 6z')+`</g>`+
    [0,1,2].map(i=>`<circle cx="${18+i*6}" cy="34" r="1.3" fill="#fff" stroke="none" style="animation:sb-ga-ember 2.2s linear infinite;animation-delay:${i*0.7}s"/>`).join('')+
    P('M14 40c3 2.5 6 3.6 10 3.6s7-1.1 10-3.6'));
  if(type==='meaning') return W(
    `<g style="animation:sb-ga-snapL 2.6s ease-in-out infinite">`+P('M8 16h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z')+`<text x="14" y="25.6" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="9" fill="#fff" stroke="none">A</text></g>`+
    `<g style="animation:sb-ga-snapR 2.6s ease-in-out infinite">`+P('M28 16h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H28a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3z')+P('M30 21h8M30 25h5')+`</g>`+
    `<g style="animation:sb-ga-tickpop 2.6s ease-in-out infinite;transform-origin:24px 38px">`+P('M19 38l3.6 3.6L31 34')+`</g>`);
  if(type==='spell') return W(
    `<text x="10" y="20" font-family="Baloo 2,sans-serif" font-weight="800" font-size="10" fill="#fff" stroke="none" opacity=".9">a</text>`+
    `<text x="22" y="20" font-family="Baloo 2,sans-serif" font-weight="800" font-size="10" fill="#fff" stroke="none" opacity=".9">b</text>`+
    `<text x="34" y="20" font-family="Baloo 2,sans-serif" font-weight="800" font-size="10" fill="#fff" stroke="none" opacity=".9">c</text>`+
    `<g style="animation:sb-ga-scan 3.2s ease-in-out infinite"><circle cx="24" cy="18" r="8"/>`+P('M30 24l7 7')+`</g>`);
  if(type==='origin') return W(
    `<circle cx="24" cy="24" r="13"/>`+P('M11 24h26M24 11c-4.5 3.5-6 8-6 13s1.5 9.5 6 13c4.5-3.5 6-8 6-13s-1.5-9.5-6-13z')+
    `<g style="animation:sb-ga-orbit 7s linear infinite;transform-origin:24px 24px"><g transform="translate(24,5)"><circle cx="0" cy="0" r="4.6"/>`+P('M3.4 3.4l4 4')+`</g></g>`);
  if(type==='wordquiz') return W(
    P('M13 9h22a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H24l-7 6v-6h-4a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z')+
    `<g style="animation:sb-ga-press 2s ease-in-out infinite;transform-origin:24px 20px">`+P('M20 17.5a4 4 0 1 1 5.4 3.7c-1 .4-1.4 1-1.4 2v1',' stroke-opacity=".95"')+`<circle cx="24" cy="27" r="1.4" fill="#fff" stroke="none"/></g>`);
  if(type==='duel') return W(
    `<g style="animation:sb-ga-swing 2.2s ease-in-out infinite;transform-origin:12px 38px">`+P('M9 39l12-12M18 24l4 4M8 36l4 4')+`</g>`+
    `<g style="animation:sb-ga-swing 2.2s ease-in-out infinite reverse;transform-origin:36px 38px">`+P('M39 39L27 27M30 24l-4 4M40 36l-4 4')+`</g>`+
    `<g style="animation:sb-ga-spark 2.2s linear infinite;transform-origin:24px 22px">`+P('M24 15v-4M19 20h-4M20.5 16.5l-3-3M27.5 16.5l3-3',' stroke-opacity=".9"')+`</g>`);
  if(type==='daily'){ // five guess-squares light up in sequence, like a daily reveal
    const sq=[0,1,2,3,4].map(i=>`<rect x="${8+i*7}" y="21" width="5.6" height="5.6" rx="1.4" fill="#fff" fill-opacity=".18" style="animation:sb-ga-cell 3s linear infinite;animation-delay:${(i*0.34).toFixed(2)}s"/>`).join('');
    return W(sq+`<g style="animation:sb-jr-rise 3s ease-in-out infinite">`+P('M12 15h24',' stroke-opacity=".9"')+`</g>`); }
  if(type==='trivia'){ // glowing lightbulb that pulses, sparks flicking off it
    return W(
      `<g style="animation:sb-ga-press 2.2s ease-in-out infinite;transform-origin:24px 22px">`+P('M24 8a10 10 0 0 0-6 18c1.2 1 1.7 1.8 1.8 3h8.4c.1-1.2.6-2 1.8-3a10 10 0 0 0-6-18z')+`</g>`+
      P('M20 33h8M21 37h6')+
      `<g style="animation:sb-ga-spark 2.2s linear infinite;transform-origin:24px 20px">`+P('M24 3v3M11 9l2 2M37 9l-2 2M6 20h3M39 20h-3',' stroke-opacity=".9"')+`</g>`); }
  if(type==='champ'){ // a champion star that pulses with a lightning spark
    return W(
      `<g style="animation:sb-ga-star 2.4s ease-in-out infinite;transform-origin:24px 24px">`+P('M24 8l4.4 9.6 10.6 1-8 7 2.4 10.4L24 40l-9.4 6 2.4-10.4-8-7 10.6-1z').replace('<path','<path fill="rgba(255,255,255,.9)"')+`</g>`+
      `<g style="animation:sb-ga-spark 2.4s linear infinite;transform-origin:24px 24px">`+P('M24 20l-3 5h4l-3 5',' fill="none" stroke="#FFC23D" stroke-width="2.6"')+`</g>`); }
  // fallback: existing icon set with float
  const gm=GAMES.find(g=>g.type===type);
  return `<div class="sb-theme-art">${iconSVG((gm&&gm.ic)||'spark',46,2)}</div>`; }
// generate plausible wrong spellings (double/drop/swap letters, ie↔ei, ent↔ant, ible↔able …)
function misspellings(w, n){ const out=new Set();
  const ops=[ x=>{const i=1+Math.floor(Math.random()*(x.length-1));return x.slice(0,i)+x[i]+x.slice(i);},
    x=>{const i=1+Math.floor(Math.random()*(x.length-1));return x.slice(0,i)+x.slice(i+1);},
    x=>{const i=Math.floor(Math.random()*(x.length-1));return x.slice(0,i)+x[i+1]+x[i]+x.slice(i+2);},
    x=>x.replace(/ie/,'ei'), x=>x.replace(/ei/,'ie'), x=>x.replace(/([a-z])\1/,'$1'),
    x=>x.replace(/ent\b/,'ant'), x=>x.replace(/ant\b/,'ent'), x=>x.replace(/ible\b/,'able'), x=>x.replace(/able\b/,'ible'),
    x=>x.replace(/cc/,'c'), x=>x.replace(/ss/,'s'), x=>x.replace(/ph/,'f') ];
  let t=0; while(out.size<n && t<50){ t++; const c=ops[Math.floor(Math.random()*ops.length)](w); if(c && c!==w && /^[a-z'\- ]+$/i.test(c)) out.add(c); }
  return [...out]; }
function mcSpeak(q){ if(!q) return; if(q.kind==='sentence') saySentence(q.say, q.word); else if(q.kind==='spell'||q.kind==='origin') say(q.word); else if(q.kind==='idiom'||q.kind==='simile2'||q.kind==='vocab') say(q.say); /* 'meaning': stay silent so the word isn't given away */ }
let _gtimer=null;
function clearGTimer(){ if(_gtimer){ clearInterval(_gtimer); _gtimer=null; } }
function startGTimer(){ clearGTimer(); _gtimer=setInterval(gTick,1000); }
function gTick(){ if(state.settingsOpen) return;   // Settings pop-up pauses the clock
  const g=state.game; if(!g||(g.type!=='beat'&&g.type!=='champ')||g.status!=='play'){ clearGTimer(); return; } g.timeLeft--; if(g.timeLeft<=3&&g.timeLeft>0) sfx('tick'); if(g.timeLeft<=0){ clearGTimer(); (g.type==='champ'?gFinishChamp:gFinishBeat)(); return; } render(); }
function gFinishChamp(){ clearGTimer(); const g=state.game; g.status='done'; const done=g.right+g.wrong;
  g.pass = g.fmt==='count' ? (done>0 && g.right/done>=0.8) : (g.right>=10);
  g.bonus=(g.bonus||0)+(g.pass?addCoins('contest'):0);   /* each right word paid as it went (payG); passing the challenge is a contest completed */
  const c=active(); const curLvl=listStageIdx(c,g.champKey)+1;
  const blockLib = g.champKey==='journey' && g.champLevel>=CHAMP_LEVELS && !state.premium;
  g.canAdvance = g.pass && g.band==='level' && curLvl===g.champLevel && !blockLib && (listStageIdx(c,g.champKey) < listStages(g.champKey).length-1);
  if(g.pass){ sfx('win'); burstConfetti(120); } else sfx('level');
  logActivity('champ','Champ Challenge', {done, right:g.right, coins:g.bonus||0}, []); render(); }
const BANDS=[['level','This Level'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['champion','Champion'],['missed','My misses']];
// dedupe + gather a fun mix: words you missed, curated tricky review, and your active list
function gameWords(opts){ opts=opts||{}; const c=active(); const key=c.activeList||'default';
  const stages=listStages(key); const idx=listStageIdx(c,key);
  const cur=(stages[idx]&&stages[idx].words)||listWords(key);        // this Level's words
  const prev=(idx>0&&stages[idx-1]&&stages[idx-1].words)||[];        // last Level for review
  const band=Math.min(9,beeBand(c).band+1);                          // proven Bee Band + one of headroom, so games feed the climb
  const rev=REVIEW.filter(w=>(w.y||3)<=band);
  const pool=(state.missedWords||[]).concat(cur).concat(prev).concat(rev).filter(w=>!w||(w.y||3)<=band); const seen=new Set(); const out=[];
  pool.forEach(w=>{ if(!w||!w.w) return; const k=nkey(w.w); if(k&&!seen.has(k)){ seen.add(k); out.push(w); } });
  if(opts.needDef) return out.filter(w=>w.d&&w.d.length>4);
  if(opts.needSent) return out.filter(w=>w.s&&/[a-z]/i.test(w.s));
  return out; }
/* ---- corpus depth: the games draw on the FULL 40k library, not just the child's
   small working set, so Easy is genuinely easy (even for an 8-year-old), Champ is
   genuinely championship-tier, and no two games fight over the same 30 words. ---- */
let _corpusBands = null;
function corpusBands(){ const src=(window.SB_DATA&&SB_DATA.nsf)||[];
  /* keyed on the library's LENGTH: the second word shard lands after boot, and a memo built from
     the boot tier alone kept every game on 8,000 words for the whole visit */
  if(_corpusBands && _corpusBands._n===src.length) return _corpusBands;
  const by={1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]};
  try{ Object.defineProperty(by,'_n',{value:src.length,enumerable:false}); }catch(e){}
  for(const w of src){ if(!w||!w.w||!(w.d&&w.d.length>4)) continue; if(!/^[a-z]+$/i.test(w.w)) continue;
    if(!kidSafeAll(w)) continue;   /* games spec §1.2: the kid-safe list sits AT the corpus — the every-age half here, the age half in nextWords */
    const y=Math.max(1,Math.min(9,w.y||3)); by[y].push(w); }
  _corpusBands=by; return by; }
// difficulty → an absolute y-range anchored on the child's proven Bee Band and age
/* Difficulty is chosen PER GAME now, not once for the whole Arcade. c.gameDiffBy keeps
   each game's own choice; gameDiffFor reads it. The live engines still read the single
   c.gameDiff (saga2.js does, mid-play), so launching a game copies its per-game choice
   into c.gameDiff for that session — the same trick champTen already used. */
function gameDiffFor(c,type){ c=c||active(); if(window.SB_LEVEL) return SB_LEVEL.get(type,c); return (c && c.gameDiffBy && c.gameDiffBy[type]) || 'auto'; }   /* the §1.7 record first (it moves after a round), then the old per-game choice */
function diffRange(c,dOver){ c=c||active(); const d=dOver||c.gameDiff||'auto'; const band=beeBand(c).band; const age=c.age||9;
  if(d==='easy')   return [1, Math.max(1, Math.min(age<=8?2:3, band))];
  if(d==='medium') return [Math.max(1,band-1), Math.min(9,band+1)];
  if(d==='hard')   return [band, Math.min(9,band+2)];
  if(d==='champ')  return [Math.max(4,Math.min(8,band+1)), 9];      // champ always reaches real bee-final words
  return [1, Math.min(9, age<=8?Math.min(band+1,4):band+1)];        // auto: everything up to band+1 (age-capped)
}
function corpusSlice(lo,hi,cap){ const by=corpusBands(); let out=[];
  for(let y=lo;y<=hi;y++) out=out.concat(by[y]||[]);
  if(cap && out.length>cap){ const step=out.length/cap; const picked=[];
    for(let i=0;i<cap;i++) picked.push(out[Math.floor(i*step)]); return picked; }
  return out; }
/* ---- arcade difficulty: personal words first (misses + this Level), then the corpus
   guarantees depth at the chosen difficulty — pools never collapse to a 10-word pot ---- */
function wordDiffScore(w){ return (w.y||3)*2 + Math.min(3, Math.max(0, ((w.w||'').length-5)/2)); }
/* gameWordsD is the door's old name (games spec §1.1): every caller now gets nextWords' pool —
   personal words in the window, then the corpus, kid-safe for this child. New code calls
   nextWords(child, n, {purpose}) and never this. */
function gameWordsD(opts){ opts=opts||{}; return nextWords.pool(null, Object.assign({purpose:'drill'}, opts)); }
/* ---- no-repeat log: don't re-serve a word until 150 others have been played ---- */
const NO_REPEAT_WINDOW = 150;
function recentGameKeys(c){ const log=(c&&c.gameLog)||[]; return new Set(log.slice(-NO_REPEAT_WINDOW)); }
function logGameWord(key){ if(!key) return; const c=active(); if(!c.gameLog) c.gameLog=[]; c.gameLog.push(key); if(c.gameLog.length>600) c.gameLog=c.gameLog.slice(-600); }
// pick n words from pool, skipping the last 150 served; if the pool is too small to
// avoid repeats, fall back to the LEAST-recently-served words (best effort, no crash)
function pickFresh(pool, n){ const c=active(); const recent=recentGameKeys(c); const log=(c.gameLog||[]);
  const valid=pool.filter(w=>w&&w.w); const fresh=valid.filter(w=>!recent.has(nkey(w.w)));
  if(fresh.length>=n) return sample(fresh, n);
  const used=valid.filter(w=>recent.has(nkey(w.w))).sort((a,b)=>log.lastIndexOf(nkey(a.w))-log.lastIndexOf(nkey(b.w)));
  return sample(fresh).concat(used).slice(0, n); }
/* =====================================================================================
   THE WORD DOOR — nextWords() and kidSafe() (games spec §1.1–1.2, 4 Oct 2026)
   Every word a game puts in front of a child comes through nextWords(). It is gameWordsD's
   successor and sits beside it: the same level window (diffRange), the same 150-word no-repeat
   log (c.gameLog), and two things gameWordsD never had — the kid-safe list (kid-safe.js) and a
   PURPOSE, so a race's item box, a bee and a review round each draw the right kind of word.
     nextWords(child, n, {purpose, tier, origin, minLen, maxLen, lemmaOnly,
                          level, key, theme, needDef, needSent, filter, date})
       purpose  gate · drill · contest · review · daily · lore · forge · paths   (default drill)
       tier     -1 / 0 / +1 — one step below, at, or above the level being played (§1.7)
       level    the level being played ('auto'|'easy'|'medium'|'hard'|'champ'); else SB_LEVEL.get(key);
                else the child's c.gameDiff
       origin   a string or RegExp matched against the word's origin (lore)
       theme    a Theme Journey id — gated by its minBand (Drugs, War, Diseases are 11+)
     → word records {w,d,s,p,o,y,…}: kid-safe for THIS child, inside the window, none of them among
       the child's last 150 game words (a pool too small to avoid it backfills the least recent).
       `daily` is the exception on purpose: one deterministic pick per date and age band, the same
       for every child in that band, and it neither reads nor writes the window. `review` reads the
       child's own missed and due words (the Leitner gap is up) and ignores the window, because a
       word is due BECAUSE it was met; it still logs what it serves.
     nextWords.pool(child, opts) → the whole candidate pool, unpicked (distractors, previews).
   T7 (tests/word-door.cjs) fails on any game that reads corpusSlice, the 130k library or a theme
   list itself; tests/next-words.cjs holds the contract in the page. ============================ */
const LEVEL_ORDER=['easy','medium','hard','champ'];
const LEVEL_LABEL={auto:'Auto',easy:'Easy',medium:'Medium',hard:'Hard',champ:'Champ'};
/* a child's age for the kid-safe rule: the LOW end of their band (an 11–13 child is eleven) */
function childAge(c){ c=c||active(); try{ const b=ageBandOf(c); if(b&&b.lo) return b.lo; }catch(e){} return +(c&&c.age)||9; }
function kidSafeAll(w){ try{ return window.SB_KID_SAFE ? SB_KID_SAFE.checkAll(w) : safeWord(w); }catch(e){ return safeWord(w); } }
function kidSafe(w, c){ if(!w||!w.w) return false;
  try{ return window.SB_KID_SAFE ? SB_KID_SAFE.check(w, childAge(c)) : safeWord(w); }catch(e){ return safeWord(w); } }
window.kidSafe=kidSafe;
/* minBand '11-15' (the family's band) means "eleven and over" */
function bandAllows(minBand, c){ if(!minBand) return true; const lo=parseInt(String(minBand),10)||0; return childAge(c)>=lo; }
function themeOpen(t, c){ return !!t && bandAllows(t.minBand, c); }
window.SB_THEME_OPEN=themeOpen;
const NW_PURPOSES={gate:1,drill:1,contest:1,review:1,daily:1,lore:1,forge:1,paths:1};
function nwLevel(c,o){ let lv=o.level; if(!lv&&o.key&&window.SB_LEVEL) lv=SB_LEVEL.get(o.key); if(!lv) lv=(c&&c.gameDiff)||'auto'; return LEVEL_LABEL[lv]?lv:'auto'; }
function nwRange(c,o){ const r=diffRange(c, nwLevel(c,o)); let lo=r[0], hi=r[1]; const t=Math.max(-1,Math.min(1,Math.round(+o.tier||0)));
  if(t){ lo=Math.max(1,Math.min(9,lo+t)); hi=Math.max(1,Math.min(9,hi+t)); } return [lo,hi]; }
let _nwIdx=null;
function nwIndex(){ const src=(window.SB_DATA&&SB_DATA.nsf)||[]; if(_nwIdx&&_nwIdx._n===src.length) return _nwIdx;
  const m=Object.create(null); for(const w of src){ if(w&&w.w){ const k=nkey(w.w); if(!m[k]) m[k]=w; } }
  try{ Object.defineProperty(m,'_n',{value:src.length,enumerable:false}); }catch(e){} _nwIdx=m; return m; }
/* a headword, not an inflection: no "plural of …" gloss, and no stem in the library that carries the
   SAME definition (the generated library repeats a gloss on blockhead / blockheads) */
function nwLemma(w){ const d=String(w.d||'').trim(); if(/^(an? )?(plural|past tense|past participle|present participle|third[- ]person|simple past|comparative|superlative)\b[^.;]*\bof\b/i.test(d)) return false;
  const k=nkey(w.w), idx=nwIndex();
  for(const s2 of [k.replace(/ies$/,'y'), k.replace(/es$/,''), k.replace(/s$/,''), k.replace(/ed$/,''), k.replace(/ed$/,'e'), k.replace(/ing$/,''), k.replace(/ing$/,'e')]){
    if(s2!==k && s2.length>=3 && idx[s2] && String(idx[s2].d||'').trim()===d) return false; }
  return true; }
function nwRecent(c){ const log=(c&&c.gameLog)||[]; return new Set(log.slice(-NO_REPEAT_WINDOW)); }
function nwLog(c,w){ if(!c||!w||!w.w) return; if(!Array.isArray(c.gameLog)) c.gameLog=[]; c.gameLog.push(nkey(w.w)); if(c.gameLog.length>600) c.gameLog=c.gameLog.slice(-600); }
function nwFilters(c,o){ const minL=+o.minLen||0, maxL=+o.maxLen||0;
  const ore=o.origin? (o.origin instanceof RegExp? o.origin : new RegExp(String(o.origin).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i')) : null;
  return w=>{ if(!w||!w.w) return false; const L=String(w.w).replace(/[^a-z]/gi,'').length;
    if(minL&&L<minL) return false; if(maxL&&L>maxL) return false;
    if(ore&&!ore.test(String(w.o||''))) return false;
    if(o.needDef&&!(w.d&&w.d.length>4)) return false;
    if(o.needSent&&!(w.s&&/[a-z]/i.test(w.s))) return false;
    if(o.lemmaOnly&&!nwLemma(w)) return false;
    if(typeof o.filter==='function'&&!o.filter(w)) return false;
    return kidSafe(w,c); }; }
function nwDedupe(list){ const seen=new Set(), out=[]; for(const w of list){ if(!w||!w.w) continue; const k=nkey(w.w); if(!seen.has(k)){ seen.add(k); out.push(w); } } return out; }
/* a word table a game owns (Word Forge's morphemes, Sound Paths' alignments): an array of words or
   rows {w}, a Set, or an object keyed by word — resolved against the library */
function nwTable(T){ if(!T) return []; const idx=nwIndex(); let rows=[];
  if(Array.isArray(T)) rows=T; else if(T instanceof Set) rows=[...T]; else if(typeof T==='object') rows=Object.keys(T);
  return rows.map(x=>{ const k=typeof x==='string'?x:(x&&x.w); if(!k) return null; return idx[nkey(k)]||(typeof x==='object'&&x.w?x:null); }).filter(Boolean); }
/* the review pile: missed words, and words in the mastery record whose Leitner gap is up */
function nwReview(c){ const idx=nwIndex(), out=[]; let wi=null; try{ wi=wordIndex(); }catch(e){}
  const rec=k=>idx[k]||(wi&&wi[k])||null; const today=(typeof mastDay==='function')?mastDay():0;
  const miss=(c===active()?(state.missedWords||[]):[]).concat(Array.isArray(c.missed)?c.missed:[]);
  for(const m of miss){ const k=nkey(m&&m.w?m.w:m); const r=rec(k)||(m&&m.w?m:null); if(r) out.push(r); }
  const M=c.mast||{}; for(const k of Object.keys(M)){ const e=M[k]; if(e&&typeof e==='object'&&(e.due==null||e.due<=today)&&(e.b|0)<=2){ const r=rec(k); if(r) out.push(r); } }
  return nwDedupe(out); }
/* THE WORD BANDS live inside this door (the 4.5 brief, P1.1–P1.3; owner: "there is no second door"). SB_BAND
   (wordband.js) is the model: a level is a window of word bands around the child's band — Easy is band 1 only,
   whoever the child — and nwBand() keeps a pool to that window and nothing above it (SB_BAND.pick, which filters
   what it is handed and reads no corpus). The corpus comes by band (nwBandSlice), not by the old y-window. The
   in-round climb (tier) moves the window a band, or takes the trickier half where it cannot move. Review is the
   child's own words and is not banded. Guard: tests/word-band.cjs. */
function nwBandOn(){ return !!(window.SB_BAND&&typeof SB_BAND.pick==='function'); }
function nwBand(c,o,pool,min){ return SB_BAND.pick(c,pool,0,{level:nwLevel(c,o),tier:o.tier,min})||[]; }
let _nwBy=null;
/* the corpus by word band — what a band window draws from (rebuilt as the library or the band file lands) */
function nwBandSlice(lo,hi){ const by=corpusBands(), v=(window.SB_WORDBAND&&SB_WORDBAND.v)||'';
  if(!(_nwBy&&_nwBy._n===by._n&&_nwBy._v===v)){ const o={1:[],2:[],3:[],4:[]};
    for(let y=1;y<=9;y++) for(const w of by[y]||[]) o[SB_BAND.of(w)].push(w);
    try{ Object.defineProperty(o,'_n',{value:by._n}); Object.defineProperty(o,'_v',{value:v}); }catch(e){} _nwBy=o; }
  let out=[]; for(let b=lo;b<=hi;b++) out=out.concat(_nwBy[b]||[]); return out; }
function nwPool(c,o){ const purpose=NW_PURPOSES[o.purpose]?o.purpose:'drill'; const [lo,hi]=nwRange(c,o); const keep=nwFilters(c,o);
  if(purpose==='review') return nwReview(c).filter(keep);
  if(purpose==='forge') return nwTable(window.SB_FORGE_TABLE).filter(keep);
  if(purpose==='paths') return nwTable(window.SB_PATHS_TABLE).filter(keep);
  const BW=nwBandOn()?SB_BAND.win(c,nwLevel(c,o),o.tier):null;
  const inWin=w=>{ const y=w.y||3; return y>=lo&&y<=hi; };
  if(o.theme){ const t=themeOf(o.theme); if(!themeOpen(t,c)) return [];
    const all=themeWords(o.theme).filter(keep);
    if(BW) return nwBand(c,o,all,10);
    const f=all.filter(inWin); return f.length>=10?f:all; }
  let personal=[];
  if(c===active()&&purpose!=='lore'){ try{ const miss=new Set((state.missedWords||[]).map(m=>nkey(m.w)));
    personal=gameWords({}).filter(w=>BW||inWin(w)||miss.has(nkey(w.w))); }catch(e){ personal=[]; } }
  let pool=nwDedupe(personal.concat(BW?nwBandSlice(BW.lo,BW.hi):corpusSlice(lo,hi))).filter(keep);
  if(purpose==='lore') pool=pool.filter(w=>w.o&&w.d&&w.d.length>4);
  if(purpose==='contest'){ const bee=pool.filter(w=>w.nt); if(bee.length>=60) pool=bee; }   /* real competition words first (mockbee's beeList reads the same tag) */
  return BW?nwBand(c,o,pool):pool; }
/* the same word for every child in a band on a date: rendezvous hashing, so the pick holds as the
   library grows under it unless a NEW word outranks it (wait for the second shard, 'words2') */
function nwHash(s){ let h=0x811c9dc5; s=String(s); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,0x01000193)>>>0; } return h>>>0; }
const NW_DAILY_Y={'5-7':[1,2],'8-10':[2,4],'11-13':[3,6],'14-18':[4,8]};
/* Daily Bee's word (P1.1/P1.4): the same for every child of a WORD band on a date, from that band — never above
   it. Before wordband.js existed it was the age band's rarity window (NW_DAILY_Y), which is still the path when
   the band model is not on the page. */
const _nwDaily={};   /* a band's day pool, kept while the library and the band file stand still */
function nwDaily(c,n,o){ const band=(ageBandOf(c)||{}).k||'8-10'; const d=o.date||(()=>{ const t=new Date(); return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0'); })();
  const r=NW_DAILY_Y[band]||[2,4]; const age=parseInt(band,10)||9;
  const safe=w=>(window.SB_KID_SAFE?SB_KID_SAFE.check(w,age):safeWord(w));
  const fit=w=>w.d&&w.d.length>4&&w.s&&/[a-z]/i.test(w.s)&&w.w.length>=4&&safe(w);
  let pool, tag=band;
  if(nwBandOn()){ const B=SB_BAND.child(c).band, k=B+'|'+age+'|'+((window.SB_DATA&&SB_DATA.nsf)||[]).length+'|'+((window.SB_WORDBAND&&SB_WORDBAND.v)||'');
    pool=_nwDaily[k]; if(!pool){ const all=nwBandSlice(1,B).filter(fit); pool=all.filter(w=>SB_BAND.of(w)===B); if(pool.length<50) pool=all; _nwDaily[k]=pool; }
    tag='band'+B; }
  else pool=corpusSlice(r[0],r[1]).filter(fit);
  /* the n lowest hashes (ties by word) — what sorting the whole pool and slicing gave, without the sort */
  const top=[], pre=d+'|'+tag+'|', lt=(h,w,x)=>h<x.h||(h===x.h&&w.w<x.w.w);
  for(const w of pool){ const h=nwHash(pre+nkey(w.w)); if(top.length>=n&&!lt(h,w,top[top.length-1])) continue;
    let i=top.length; while(i>0&&lt(h,w,top[i-1])) i--; top.splice(i,0,{w,h}); if(top.length>n) top.pop(); }
  return top.map(x=>x.w); }
function nextWords(child, n, opts){ opts=opts||{}; const c=child||active(); n=Math.max(0,Math.floor(+n||0)); if(!c||!n) return [];
  if(opts.purpose==='daily') return nwDaily(c,n,opts);
  const pool=nwPool(c,opts); let out;
  if(opts.purpose==='review') out=pool.slice(0,n);
  else { const recent=nwRecent(c); const fresh=pool.filter(w=>!recent.has(nkey(w.w)));
    if(fresh.length>=n) out=sample(fresh,n);
    else { const log=c.gameLog||[]; const used=pool.filter(w=>recent.has(nkey(w.w))).sort((a,b)=>log.lastIndexOf(nkey(a.w))-log.lastIndexOf(nkey(b.w)));
      out=sample(fresh).concat(used).slice(0,n); } }
  out.forEach(w=>nwLog(c,w)); return out; }
nextWords.pool=(child,opts)=>{ const c=child||active(); return c?nwPool(c,opts||{}):[]; };
window.nextWords=nextWords;

/* =====================================================================================
   LEVELS — chosen by the child, re-checked every round (games spec §1.7, owner's rule)
   window.SB_LEVEL.get(key) → 'auto'|'easy'|'medium'|'hard'|'champ'; set(key, level);
   after(key, pct) → {level, dropped, offerUp, line, pct}; chip(key, label?) → the chip's HTML.
   Kept per CHILD as c.levels[key] = {level, history:[pct…], hand}, through the store (step
   v9→v10 seeds it from the old per-game choice, c.gameDiffBy). Keys: mockbee, beeGrandPrix,
   typeBlaster, honeycombRun, wordForge, dailyBee, and 'gym/<mode>', 'lore/<mode>', 'hive/<mode>'
   — a mode with no level of its own takes its hub's ('gym'), the hub card's chip.
   The rule: 50% or more keeps the level; under 50% drops one (floor Easy) with a kind line; a
   hand-set level sticks until the next round's check; two rounds in a row at 80%+ offer the next
   level as a tap (OFFER_UP — the owner may switch it off). pct is a percent (0–100), or a
   fraction when it is 1 or less. Guard: tests/levels.cjs (T13). ================== */
window.SB_LEVEL=(function(){
  const CYCLE=['auto'].concat(LEVEL_ORDER);
  const API={ OFFER_UP:true, ORDER:LEVEL_ORDER.slice(), LABEL:LEVEL_LABEL };
  const ok=v=>Object.prototype.hasOwnProperty.call(LEVEL_LABEL,v);
  function rec(key,c){ if(!c.levels||typeof c.levels!=='object'||Array.isArray(c.levels)) c.levels={};
    let r=c.levels[key]; if(!r||typeof r!=='object'){ r={level:API.get(key,c),history:[]}; c.levels[key]=r; }
    if(!ok(r.level)) r.level='auto'; if(!Array.isArray(r.history)) r.history=[]; return r; }
  function sync(c,key,lv){ c.gameDiffBy=c.gameDiffBy||{}; c.gameDiffBy[key]=lv; }   /* the engines still read the old per-game choice */
  API.get=(key,c)=>{ c=c||active(); if(!c||!key) return 'auto'; key=String(key);
    const r=c.levels&&c.levels[key]; if(r&&ok(r.level)) return r.level;
    const g=c.gameDiffBy&&c.gameDiffBy[key]; if(ok(g)) return g;
    const i=key.indexOf('/'); return i>0?API.get(key.slice(0,i),c):'auto'; };
  /* 'auto' as a concrete level, from the child's word difficulty (the arcade's own mapping) */
  API.resolve=(key,c)=>{ c=c||active(); const lv=API.get(key,c); if(lv!=='auto') return lv;
    let band=4; try{ band=beeBand(c).band; }catch(e){} return band<=3?'easy':band<=6?'medium':band<=8?'hard':'champ'; };
  API.set=(key,level,c)=>{ c=c||active(); if(!c||!key||!ok(level)) return API.get(key,c); const r=rec(String(key),c);
    r.level=level; r.hand=level==='auto'?0:1; sync(c,key,level); try{ save(); }catch(e){}
    try{ window.dispatchEvent(new CustomEvent('sb-level',{detail:{key,level}})); }catch(e){} return level; };
  API.line=(res)=>res&&res.dropped?('Let’s warm up on '+LEVEL_LABEL[res.level]+'. You can move back up any time.'):'';
  API.after=(key,pct,c)=>{ c=c||active(); if(!c||!key) return {level:'auto',dropped:false,offerUp:null,line:'',pct:0}; key=String(key);
    let p=+pct; if(!isFinite(p)) p=0; if(p<=1) p*=100; p=Math.max(0,Math.min(100,Math.round(p)));
    const r=rec(key,c); r.history.push(p); if(r.history.length>10) r.history=r.history.slice(-10);
    let dropped=false;
    if(p<50){ const cur=r.level==='auto'?API.resolve(key,c):r.level; const i=LEVEL_ORDER.indexOf(cur);
      if(i>0){ r.level=LEVEL_ORDER[i-1]; dropped=true; sync(c,key,r.level); } else if(r.level==='auto'){ r.level='easy'; sync(c,key,'easy'); } }
    r.hand=0;   /* the check has run: a hand-set level stuck until now, and the rule owns it from here */
    let offerUp=null; const h=r.history;
    if(API.OFFER_UP&&!dropped&&h.length>=2&&h[h.length-1]>=80&&h[h.length-2]>=80){ const cur=r.level==='auto'?API.resolve(key,c):r.level; const i=LEVEL_ORDER.indexOf(cur); if(i>=0&&i<LEVEL_ORDER.length-1) offerUp=LEVEL_ORDER[i+1]; }
    try{ save(); }catch(e){}
    const res={level:r.level,dropped,offerUp,pct:p}; res.line=API.line(res); return res; };
  /* the chip: Auto ▾ → Easy → Medium → Hard → Champ → Auto, one tap each (keyboard: it is a button) */
  API.chip=(key,label)=>{ const lv=API.get(key); const nx=CYCLE[(CYCLE.indexOf(lv)+1)%CYCLE.length];
    return `<button type="button" data-act="levelChip" data-arg="${escA(key)}" class="sb-lvchip" aria-label="${escA('Word level for '+(label||key)+': '+LEVEL_LABEL[lv]+'. Tap for '+LEVEL_LABEL[nx])}" title="Word level: ${LEVEL_LABEL[lv]} — tap to change">${LEVEL_LABEL[lv]} ▾</button>`; };
  /* "Ready for Hard?" — the tap an offerUp shows (data-act="levelUp" data-arg="<key>|<level>") */
  API.upButton=(key,res)=>res&&res.offerUp?`<button type="button" data-act="levelUp" data-arg="${escA(key+'|'+res.offerUp)}" class="sb-lvup">Ready for ${LEVEL_LABEL[res.offerUp]}?</button>`:'';
  API.next=(key)=>{ const lv=API.get(key); return CYCLE[(CYCLE.indexOf(lv)+1)%CYCLE.length]; };
  return API; })();

/* =====================================================================================
   BESTS that outlive their game (games spec §3, T12). c.bests['<card or hub>/<mode>'] =
   {right, of, at, from}. Store step v10→v11 carried the bests of the games that left the Play tab
   (Beat the Buzzer, Magic Squares, Word Quiz, Bee Trivia) to their new homes in the hubs; a hub
   mode reads and writes them here, and the hub's card shows its best mode. ===================== */
window.SB_BESTS={
  get(key,c){ c=c||active(); const b=c&&c.bests&&c.bests[key]; return (b&&typeof b==='object')?b:null; },
  ratio(b){ return b?(b.of?b.right/b.of:b.right):0; },
  put(key,right,of,c){ c=c||active(); if(!c||!key) return false; right=Math.max(0,+right||0); of=of==null?null:Math.max(1,+of||1);
    if(!c.bests||typeof c.bests!=='object') c.bests={}; const old=c.bests[key];
    const better=!old||(of&&old.of?(right/of>old.right/old.of||(right/of===old.right/old.of&&of>old.of)):right>(old.right||0));
    if(better){ c.bests[key]={right,of,at:Date.now()}; try{ save(); }catch(e){} } return better; },
  /* the best mode under a hub prefix, for its card: "Best 8/10 · Roots" */
  top(prefix,c){ c=c||active(); const B=(c&&c.bests)||{}; let best=null, bk='';
    for(const k of Object.keys(B)){ if(k.indexOf(prefix+'/')!==0) continue; const b=B[k]; if(!b) continue;
      if(!best||(this.ratio(b)>this.ratio(best))) { best=b; bk=k; } }
    return best?{key:bk,mode:bk.slice(prefix.length+1),best}:null; }
};
/* The three hubs' names — the owner may rename them (spec §3.3); nothing may hard-code one. */
window.SB_HUB_NAMES=Object.assign({gym:'Spelling Gym', lore:'Word Lore', hive:'Hive Mind'}, window.SB_HUB_NAMES||{});
function hubName(k){ return (window.SB_HUB_NAMES&&SB_HUB_NAMES[k])||k; }
/* n distinct distractor strings, none equal to the answer (case- and space-blind). Every
   multiple-choice generator goes through this: two identical options is two right answers, and
   a "last-resort filler" pushed three times was three identical wrong ones (FIX-BEE D8). */
function mcDistinct(answer, cands, n){ const seen=new Set([String(answer||'').trim().toLowerCase()]); const out=[];
  for(const c of (cands||[])){ const k=String(c==null?'':c).trim().toLowerCase(); if(!k||seen.has(k)) continue; seen.add(k); out.push(c); if(out.length>=n) break; }
  return out; }
function gFinishBeat(){ const g=state.game; g.status='done'; g.bonus=g.bonus||0;
  logActivity('beat','Beat the Buzzer', {done:g.right+g.wrong,right:g.right,coins:g.bonus||0}, []);
  if(g.right>=12){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishMC(){ const g=state.game; g.status='done'; g.bonus=g.bonus||0;
  if(g.round==='vocab'){ const c=active(); c.vocQuiz=(c.vocQuiz||0)+1; }
  if(g.round==='idiom'||g.round==='simile'){ const c=active(); c.figQuiz=(c.figQuiz||0)+1; }
  logActivity(g.type, ACT_LABEL[g.type]||'Quiz', {done:g.qs.length,right:g.right,coins:g.bonus||0}, g.miss||[]);
  if(g.right>=7){ sfx('win'); burstConfetti(110); } else sfx('level'); render(); }

function coinIc(sz){ return (window.SB_ICON_ART&&SB_ICON_ART.coin)?SB_ICON_ART('coin',{size:sz||14}):SB_ICON('coin',{size:sz||14}); }
function coinAmt(n, sz){ return `<span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">${coinIc(sz)} ${n}</span>`; }
function coinChip(){ return `<span class="sb-coinchip" title="Bizzing coins — one wallet for every Bizzing app" style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)">${coinAmt(coinsOf(),14)}</span>`; }
/* THE SPELLING GYM IN THE SHELL (games spec §4.2). The stage, the hub and every mode are gym.js's; the
   shell gives it a host the height of the screen and render() hands the host over (SB_GYM.mount). */
/* the gym's modes by name, for the Play card's "Best 9/10 · Warm-up" before gym.js has loaded (gym.js reads it too) */
window.SB_HUB_MODES=window.SB_HUB_MODES||{};
SB_HUB_MODES.gym={warmup:'Warm-up', sprint:'Sprint', dictation:'Champ Dictation', spot:'Spot the Error', squares:'Squares', doctor:'Word Doctor', challenge:'Level Challenge'};
   /* ◆ Rapid Dictation left (games spec §3.1): Spelling Gym · Champ Dictation is its home */
   /* ◆ Memory Match left (games spec §3.1): it paid for luck; Spelling Gym · Word Doctor is in for it */
/* The question bank is sharded and lazy: its headline number is SB_COUNT.trivia (the index's
   per-level counts, printed as a floor by countTxt), never SB_TRIVIA.questions.length. */
/* ============================================================================
   THE 14 GAMES, PLAYABLE DIRECTLY FROM THE ARCADE — no story in the way.
   Each tile mounts one SB_SAGA_ENGINES engine on its painted play-field at the
   difficulty chosen on that tile. This runner is DECOUPLED from saga2's story
   machinery (map/board/beats/CH_META): it calls the engine straight, so when the
   'Great Unspelling' story layer is removed the arcade keeps working. The engines
   pull their own words via pool()->gameWordsD(), which reads c.gameDiff — so, like
   playGame, we set c.gameDiff from the tile's choice before mounting.
   Engine contract: handle = eng(hostEl, {diff, world, onUnlock}, done); handle.destroy().
   ============================================================================ */
/* The arcade's eight games, culled from fourteen on a fun × learning index. The dropped
   six were the redundant "select/catch given letters" cluster (Whack-a-Moth, Comb
   Catcher, Star Connect, Word Hive) plus the two lowest-learning novelties (Spell Shield
   — it duplicated Type Blaster's spell-fast-under-threat loop — and Stage Rhythm, where
   timing crowded out recall). Word Snake is kept by request (a fun-dexterity anchor).
   What's left spans eight distinct feels with no two sharing a core loop, weighted toward
   games that make the child PRODUCE the spelling from memory, with Keep Flying, Word Snake
   and Spotlight Simon as the lighter fun anchors for younger spellers. The dropped engines
   still live in saga2.js, so any one can be re-added with a single line here. */
const SB_ARCADE_GAMES = [
  {k:'beeGrandPrix',        n:'Bee Grand Prix',   tag:'Race',   w:'hive',      blurb:'Spell to boost past rivals in a flat-out race.'},
  {k:'honeycombRun',        n:'Honeycomb Run',    tag:'Maze',   w:'meadow',    blurb:'Four honey gates, four words, then home to the hive.'},
  {k:'typeBlaster',         n:'Type Blaster',     tag:'Speed',  w:'meadow',    blurb:'Blast the falling glitches with whole words and paint the world back.'},
  /* Keep Flying is CUT from the arcade (FIX-BEE v2 G11): a Flappy loop where spelling was a toll, and
     the Grand Prix already carries "spell to keep moving". The engine stays in saga2.js — one line back.
     Word Snake, Unscramble Stars and Spell Scene left on 4 Oct 2026 (games spec §3.1, GAMES-LEDGER.md):
     the snake's glowing tile spelled the word for the child, a random tapper scored 96% at Unscramble,
     and Spell Scene merges into Type Blaster. Re-adding a line here is a new card: it needs a named
     "out" in the ledger first (tests/games-ledger.cjs). */
];
window.SB_ARCADE_GAMES = SB_ARCADE_GAMES;
const _arcDiffLabel = {auto:'My level',easy:'Easy',medium:'Medium',hard:'Hard',champ:'Champ'};
let _arcHandle=null, _arcEl=null;
function arcadeLeave(){ arcadeClose(); try{ if(window.SB_SHELL&&SB_SHELL.leaveOverlay){ SB_SHELL.leaveOverlay(); return; } }catch(e){} }
function arcadeClose(){
  if(_arcHandle){ try{ _arcHandle.destroy(); }catch(e){} _arcHandle=null; }
  if(_arcEl){ try{ if(_arcEl._liveMo) _arcEl._liveMo.disconnect(); }catch(e){} _arcEl.remove(); _arcEl=null; }
  try{ if(window.SB_W4_MUSIC) SB_W4_MUSIC.sync(); }catch(e){}
}
/* ============================================================================
   ARCADE START MENU — a per-game launch screen: explains the game, lets you pick
   your racer (avatar), your colour, and difficulty, then drops you straight in.
   ========================================================================== */
const ARCADE_HOWTO = {
  beeGrandPrix:   'A kart race first: steer, brake, drift and pick your box in every zone. Spell its word for a power-up — quick and right is full strength.',
  honeycombRun:   'Four honey gates stand between you and the hive. Stand on the flower by a gate and spell its word to open it, dodge the moths, and fly home before the clock runs out.',
  typeBlaster:    'Hear the word, type all of it, then press Enter to fire. Every glitch you blast paints a piece of the grey world back. A wrong word costs a shield.',
  keepFlying:     'Tap or hold to fly. Bank every honey pot by spelling it, dodge the pillars, then soar through the Hive Gates home.',
};
const ARC_COLOURS = [
  {n:'Honey',v:'#F0B429'},{n:'Cherry',v:'#EC5C67'},{n:'Ocean',v:'#3B93D6'},
  {n:'Grape',v:'#8B63D6'},{n:'Mint',v:'#2FB98A'},{n:'Sunset',v:'#F0803C'},{n:'Bubblegum',v:'#EC6BB0'},
];
const ARC_DIFFS = [['auto','My level'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['champ','Champ']];
/* Per-game extra customization for the start menu. Each group has a kind:
   'kart'/'scene' render an image thumbnail (app-art/gart/<img>.webp); 'chip' is a
   plain labelled button. The chosen values ride into the engine via opts. */
const ARC_KARTS = [
  {v:'kart',n:'Classic',img:'kart'},{v:'kart-red',n:'Racer',img:'kart-red'},
  {v:'kart-rocket',n:'Rocket',img:'kart-rocket'},{v:'kart-buggy',n:'Buggy',img:'kart-buggy'},
  {v:'kart-cruiser',n:'Cruiser',img:'kart-cruiser'},
];
const ARC_SCENES = [
  {v:'meadow',n:'Sunny Meadow',img:'gp-sky'},{v:'sunset',n:'Sunset Canyon',img:'gp-sunset'},
  {v:'city',n:'Neon City',img:'gp-city'},{v:'bazaar',n:'Spice Bazaar',img:'gp-bazaar'},
  /* the Cup: all four tracks in one sitting, each with its own word family (saga2.js GP_CUP) */
  {v:'cup',n:'The Cup',imgs:['gp-sky','gp-sunset','gp-city','gp-bazaar']},
];
/* Grand Prix: how hard the ROAD is, chosen apart from the word level (games spec §2.6) */
const ARC_DRIVE = [{v:'easy',n:'Easy road'},{v:'medium',n:'Medium road'},{v:'hard',n:'Hard road'},{v:'champ',n:'Champ road'}];
const ARC_HCLAYOUT = [{v:'classic',n:'Classic'},{v:'spiral',n:'Spiral'},{v:'chambers',n:'Chambers'}];
const ARC_HCSTYLE  = [{v:'hive',n:'Golden Hive'},{v:'meadow',n:'Meadow'},{v:'cavern',n:'Crystal Cavern'}];
const ARC_CFG = {
  /* no hero row: the driver is the speller's own buddy. Choosing a champion out of thirty
     before every race was a decision in front of the game, not part of it. */
  beeGrandPrix:{ noHero:true, diffLabel:'Word level', garage:true, groups:[
    {key:'kart', label:'Your kart', kind:'kart',  opts:ARC_KARTS},
    {key:'scene',label:'Track',     kind:'scene', opts:ARC_SCENES},
    {key:'drive',label:'Driving',   kind:'chip',  opts:ARC_DRIVE} ]},
  honeycombRun:{ groups:[
    {key:'layout',label:'Maze layout',kind:'chip', opts:ARC_HCLAYOUT},
    {key:'style', label:'World style', kind:'chip', opts:ARC_HCSTYLE} ]},
  /* no hero row: the speller's own buddy pilots the cannon (spec §4.5 — "pilots the cannon
     or goes"); a champion picked from thirty would have been a face on a chip and nothing more */
  typeBlaster:{ noHero:true, groups:[] },
};
function arcGart(img){ return 'app-art/gart/'+img+'.webp'+(window.SB_ASSET_V?('?v='+window.SB_ASSET_V):''); }
function arcadeMenu(k){
  const g=(window.SB_ARCADE_GAMES||[]).find(x=>x.k===k); if(!g) return;
  const c=active(); ensureLists(c); arcadeClose();
  const cfg=ARC_CFG[k]||{groups:[]};
  const AVL=(window.SB_AVATARS&&SB_AVATARS.list)||[];
  let avList;
  if(cfg.heroList){
    // a curated cast for this game (e.g. Word Snake offers the Serpent pack)
    avList=cfg.heroList.map(id=>AVL.find(a=>a.id===id)||{id,name:id}).filter(Boolean);
  } else {
    // the whole roster — owned ones first, capped so the row stays snappy
    const owned=AVL.filter(a=>{ try{ return avOwned(c,a.id); }catch(e){ return false; } });
    const rest=AVL.filter(a=>owned.indexOf(a)<0);
    avList=(owned.concat(rest)).slice(0,30);
  }
  if(!avList.length) avList.push({id:'bizzy',name:'Bizzy'});
  const saved=(c.arcGame&&c.arcGame[k])||{};
  let selAv=(saved.av&&avList.some(a=>a.id===saved.av))?saved.av
           :(c.avatar&&avList.some(a=>a.id===c.avatar))?c.avatar:((avList[0]&&avList[0].id)||'bizzy');
  let selDiff=saved.diff||gameDiffFor(c,k);
  const selOpt={}; (cfg.groups||[]).forEach(gr=>{ selOpt[gr.key]=(saved.opts&&saved.opts[gr.key])||(gr.opts[0]&&gr.opts[0].v); });
  const avSVG=(id,sz)=>{ try{ return (window.SB_AVATAR&&SB_AVATAR(id,sz))||''; }catch(e){ return ''; } };
  const el=document.createElement('div'); el.className='arc-menu'; _arcEl=el;
  const groupHTML=(cfg.groups||[]).map(gr=>`<div class="arcm-sec"><div class="arcm-lbl">${esc(gr.label)}</div><div class="arcm-opts arcm-opts-${gr.kind}" id="arcm-gr-${gr.key}"></div></div>`).join('');
  el.innerHTML=`<div class="arcm-card">
    <button class="arcm-x" aria-label="Back to arcade">✕</button>
    <span class="arcm-tag">${esc(g.tag)}</span>
    <h2 class="arcm-title">${esc(g.n)}</h2>
    <p class="arcm-how">${esc(ARCADE_HOWTO[k]||g.blurb||'')}</p>
    ${cfg.noHero?'':`<div class="arcm-preview"><span class="arcm-av" id="arcm-prev"></span></div>
    <div class="arcm-sec"><div class="arcm-lbl">${esc(cfg.heroLabel||'Your hero')}</div><div class="arcm-avrow" id="arcm-avs"></div></div>`}
    ${groupHTML}
    <div class="arcm-sec"><div class="arcm-lbl">${esc(cfg.diffLabel||'Difficulty')}</div><div class="arcm-diff" id="arcm-diff"></div></div>
    ${cfg.garage?`<button class="arcm-d" id="arcm-gar" style="margin:4px auto 10px;display:block;min-height:44px;padding:0 18px">Garage — paint and trails</button>`:''}
    <button class="arcm-go" id="arcm-go">${iconSVG('joystick',18)} Start</button>
  </div>`;
  document.body.appendChild(el);
  const prev=el.querySelector('#arcm-prev');
  const drawPrev=()=>{ if(!prev) return; prev.innerHTML=avSVG(selAv,120); prev.style.boxShadow='0 0 0 4px rgba(255,216,115,.55), 0 10px 30px rgba(0,0,0,.4)'; };
  const avs=el.querySelector('#arcm-avs');
  if(avs){
    avs.innerHTML=avList.map(a=>`<button class="arcm-av-b${a.id===selAv?' on':''}" data-av="${escA(a.id)}" title="${escA(a.name||a.id)}">${avSVG(a.id,44)}</button>`).join('');
    avs.onclick=e=>{ const b=e.target.closest('[data-av]'); if(!b)return; selAv=b.dataset.av;
      avs.querySelectorAll('.arcm-av-b').forEach(x=>x.classList.toggle('on',x.dataset.av===selAv)); drawPrev(); };
  }
  (cfg.groups||[]).forEach(gr=>{ const box=el.querySelector('#arcm-gr-'+gr.key); if(!box) return;
    box.innerHTML=gr.opts.map(o=>{
      const on=o.v===selOpt[gr.key]?' on':'';
      if(gr.kind==='kart'||gr.kind==='scene'||gr.kind==='world'){
        /* a kart thumbnail is drawn by the same code that draws the kart in the race
           (SB_KART_ART) — the picked kart and the raced kart are one drawing */
        if(o.imgs) return `<button class="arcm-opt arcm-opt-img${on}" data-v="${escA(o.v)}" title="${escA(o.n)}"><span style="display:grid;grid-template-columns:1fr 1fr;gap:2px;aspect-ratio:16/9;overflow:hidden;border-radius:8px">${o.imgs.map(im=>`<img src="${arcGart(im)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">`).join('')}</span><span>${esc(o.n)}</span></button>`;
        const kt=(gr.kind==='kart'&&window.SB_KART_ART)?SB_KART_ART.thumb(o.v,168):'';
        const src=kt||(gr.kind==='world'?('app-art/sgw-'+o.img+'.webp'+(window.SB_ASSET_V?('?v='+window.SB_ASSET_V):'')):arcGart(o.img));
        return `<button class="arcm-opt arcm-opt-img${on}" data-v="${escA(o.v)}" title="${escA(o.n)}"><img src="${src}" alt="${escA(o.n)}" loading="lazy"><span>${esc(o.n)}</span></button>`; }
      return `<button class="arcm-opt arcm-opt-chip${on}" data-v="${escA(o.v)}">${esc(o.n)}</button>`;
    }).join('');
    box.onclick=e=>{ const b=e.target.closest('[data-v]'); if(!b) return; selOpt[gr.key]=b.dataset.v;
      box.querySelectorAll('.arcm-opt').forEach(x=>x.classList.toggle('on',x.dataset.v===selOpt[gr.key])); }; });
  const dd=el.querySelector('#arcm-diff');
  dd.innerHTML=ARC_DIFFS.map(([kk,l])=>`<button class="arcm-d${kk===selDiff?' on':''}" data-d="${kk}">${l}</button>`).join('');
  dd.onclick=e=>{ const b=e.target.closest('[data-d]'); if(!b)return; selDiff=b.dataset.d;
    dd.querySelectorAll('.arcm-d').forEach(x=>x.classList.toggle('on',x.dataset.d===selDiff)); };
  drawPrev();
  el.querySelector('.arcm-x').onclick=arcadeClose;
  const gar=el.querySelector('#arcm-gar'); if(gar) gar.onclick=()=>{ try{ window.SB_GP.garage(el,()=>{ try{ gar.focus(); }catch(e){} }); }catch(e){} };
  el.querySelector('#arcm-go').onclick=()=>{
    // remember the per-game choices, but DON'T overwrite the child's app-wide avatar
    c.arcGame=c.arcGame||{}; c.arcGame[k]={av:cfg.noHero?null:selAv,diff:selDiff,opts:{...selOpt}};
    if(window.SB_LEVEL) SB_LEVEL.set(k,selDiff,c); c.gameDiffBy=c.gameDiffBy||{}; c.gameDiffBy[k]=selDiff; c.gameDiff=selDiff;
    try{ save(); }catch(e){}
    arcadeClose();
    // no colour tint — each kart carries its own colour
    app.arcadePlay(k,{hero:cfg.noHero?(c.avatar||'bizzy'):selAv,opts:{...selOpt},fromMenu:true});
  };
}
/* Per-game personal best, persisted on the device — gives the competitive speller a
   number to beat every play. SB_STORE 'arcBest' (sb_arc_best) = { <gameKey>: bestScore }. */
function arcBestMap(){ try{ return SB_STORE.getJSON('arcBest',{})||{}; }catch(e){ return {}; } }
function arcSaveBest(k,v){ try{ const m=arcBestMap(); m[k]=v; SB_STORE.setJSON('arcBest',m); }catch(e){} }
function arcadeResult(g, res){
  if(!_arcEl) return;
  const win = !!(res && res.win);
  const score = Math.max(0, Math.round((res && res.score) || 0));
  const prevBest = arcBestMap()[g.k] || 0;
  const isBest = score > 0 && score > prevBest;
  if(isBest) arcSaveBest(g.k, score);
  const shownBest = Math.max(prevBest, score);
  /* a game's wage is its words, one coin each as they were spelled — winning pays no extra,
     because a win is partly reflexes and the standard pays only for learning */
  const coins = Math.max(0, earnedSoFar()-(g._e0||0));
  // best-score line: celebrate a new record, else show the bar to beat
  const bestLine = score>0
    ? (isBest
        ? `<div style="margin-top:9px;font-family:var(--display);font-weight:800;font-size:14px;color:var(--accent)">🏆 New personal best — ${score}!</div>`
        : `<div style="margin-top:9px;font-size:12.5px;color:var(--muted)">You scored <b style="color:var(--text)">${score}</b> · best <b style="color:var(--text)">${shownBest}</b></div>`)
    : '';
  /* The words this round asked for, spelling and all.
     A game used to swallow them: miss one mid-flight and the answer went past in the same
     breath as the crash, so the one word you most needed to read was the one you never got.
     Missed words come first — they are the reason to look — and every row can go straight
     onto the revision list. saga2.js fills SB_WORDLOG; arcadePlay clears it each round. */
  const logged=(()=>{ try{ return (window.SB_WORDLOG&&SB_WORDLOG.list||[]).slice(); }catch(e){ return []; } })();
  logged.sort((a,b)=>(a.ok?1:0)-(b.ok?1:0));
  const missedN=logged.filter(x=>!x.ok).length;
  const recap = !logged.length ? '' : `
      <div class="arc-r-words" style="margin-top:16px;border-top:1px solid var(--line);padding-top:13px;text-align:left">
        <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:9px">
          <b style="font-family:var(--display);font-size:14.5px">Words you met</b>
          <span style="font-size:11.5px;color:var(--muted)">${logged.length} word${logged.length>1?'s':''}${missedN?` · ${missedN} to revise`:' · all correct 🎉'}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;max-height:210px;overflow-y:auto">
        ${logged.map(x=>`<div style="display:flex;align-items:center;gap:9px;padding:7px 10px;border-radius:9px;background:${x.ok?'var(--surface2)':'color-mix(in srgb,var(--bad) 11%,transparent)'}">
            <span style="font-size:13px">${x.ok?'✓':'✗'}</span>
            <span style="font-family:var(--display);font-weight:800;font-size:14.5px;color:${x.ok?'var(--text)':'var(--bad)'};letter-spacing:.02em">${esc(x.w)}</span>
            <span style="flex:1;min-width:0;font-size:11px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.d||'')}</span>
            <button class="arc-r-say" data-w="${escA(x.w)}" title="Hear it" aria-label="Hear ${escA(x.w)}" style="flex:none;padding:4px 7px;border-radius:7px;background:var(--surface);border:1px solid var(--line);color:var(--muted);font-size:11px">🔊</button>
            <button class="arc-r-rev" data-w="${escA(x.w)}" data-d="${escA(x.d||'')}" style="flex:none;padding:4px 9px;border-radius:7px;background:${x.ok?'var(--surface)':'var(--treasure,#F0B429)'};border:1px solid ${x.ok?'var(--line)':'transparent'};color:${x.ok?'var(--muted)':'var(--treasure-deep,#8A5B00)'};font-weight:800;font-size:11px;white-space:nowrap">${iconSVG('flag',14,2.4)} Revise</button>
          </div>`).join('')}
        </div>
      </div>`;
  const card=document.createElement('div'); card.className='arc-play-result';
  card.innerHTML=`<div class="arc-play-rcard">
      <div style="font-size:34px;line-height:1">${isBest?'🌟':win?'🏆':'💪'}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:20px;margin:6px 0 2px" data-live-prompt="">${isBest?'New record!':win?'Nice spelling!':'Good try!'}</div>
      <div style="font-size:13px;color:var(--muted)">${win?((coins?'+'+coins+' 🪙 · ':'')+'play again to beat it'):'Every round makes the words stick. Give it another go.'}</div>
      ${bestLine}
      ${recap}
      <div style="display:flex;gap:9px;margin-top:16px;justify-content:center;flex-wrap:wrap">
        <button class="arc-r-again" style="padding:11px 18px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:14px">Play again</button>
        <button class="arc-r-back" style="padding:11px 18px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:14px">← Arcade</button>
      </div></div>`;
  _arcEl.appendChild(card);
  card.querySelector('.arc-r-again').onclick=()=>{ arcadeClose(); if(window.app) app.arcadePlay(g.k); };
  card.querySelector('.arc-r-back').onclick=arcadeLeave;
  card.querySelectorAll('.arc-r-say').forEach(b=>{ b.onclick=()=>{ try{ say(b.dataset.w); }catch(e){} }; });
  card.querySelectorAll('.arc-r-rev').forEach(b=>{ b.onclick=()=>{
    try{ addMiss({w:b.dataset.w, d:b.dataset.d||''},'mark'); }catch(e){}
    b.textContent='⚑ On revise list'; b.disabled=true; b.style.opacity='.65';
    try{ flash('Marked for revision ⚑'); }catch(e){}
  }; });
}
/* Who Wants to Be a Bizzillionaire is Word Lore's LADDER now (lore.js, games spec §4.3): twelve
   honeycomb rungs and no money — "You walk away with" went with the overlay, its 15-rung cash table
   (SB_BIZZ_LADDER), the two safe havens and the Skip lifeline. The lifelines are 50:50 · Hear it in a
   sentence · Ask a rival; a miss holds with the answer and why, then the climb ends. */

/* ============================================================================
   THE PLAY TAB — the lineup (games spec §3.1, owner decision 1: one in, one out)
   Three doors — Compete · Train · Play — and the cards in SB_PLAY_CARDS, nothing else.
   GAMES-LEDGER.md is the record of what each card came in for; tests/games-ledger.cjs (T16)
   fails if this registry ever outgrows the ledger or a key arrives without a named "out".
   Back, 5 Oct 2026 (owner, "come back as it was"): Daily Buzz, its own card again, in Unscramble Stars' slot.
   Out, 4 Oct 2026: Bizzillionaire, Daily Buzz, Beat the Buzzer, Magic Squares, Word Quiz, Bee
   Trivia, Word Snake, Unscramble Stars, Spell Scene (and the add-on's Memory Match, Rapid
   Dictation, mock rounds). Their engines may live on inside a hub; their cards do not.
   A card opens through ONE opener on `app` (`open`) or the arcade start menu (`arcade`). A card
   whose opener is not on the page yet still stands, saying "Coming", so the doors never re-flow
   as the hubs land. Word Forge stays hidden while its table is unsigned (SB_FORGE.signedOff; devUnlock shows it).
   Hub names come from SB_HUB_NAMES — never typed here. Every card carries the §1.7 level chip.
   Rows are always full: 4 columns (2 below 720px), flagships span two, and a door whose cards
   would leave a hole widens its last small cards instead (tests/arcade-hub.cjs).
   ============================================================================ */
const SB_PLAY_CARDS = [
  {k:'mockbee',      door:'compete', size:'big',  open:'mbOpen',       tag:'Competition'},   // half banner since 9 Oct 2026 (owner), beside Mock Analogy Bee
  {k:'mockAnalogy',  door:'compete', size:'big',  open:'openAnlBee',   tag:'Competition'},   // in 9 Oct 2026 (owner: "an analogy based mock spelling bee … mock analogy bee")
  {k:'gym',          door:'train',   open:'openGym',      hub:1,       tag:'Train'},
  {k:'lore',         door:'train',   open:'openLore',     hub:1,       tag:'Words'},
  {k:'hive',         door:'train',   open:'openHive',     hub:1,       tag:'Quiz'},
  {k:'dailyBee',     door:'train',   open:'openDailyBee',              tag:'Today'},
  {k:'beeGrandPrix', door:'play',    size:'big', arcade:1,             tag:'Race'},
  {k:'typeBlaster',  door:'play',    arcade:1,                         tag:'Speed'},
  {k:'honeycombRun', door:'play',    arcade:1,                         tag:'Maze'},
  {k:'dailyBuzz',    door:'play',    open:'openDailyBuzz', nolevel:1,  tag:'Puzzle'},   // back 5 Oct 2026 (owner); no level: one word for everyone, as it was
  {k:'wordForge',    door:'play',    size:'big', open:'openForge',     tag:'Forge'},
];
window.SB_PLAY_CARDS = SB_PLAY_CARDS;
const PLAY_TEXT = {
  mockbee:  {n:'Mock Spelling Bee', p:'Your rivals, one microphone, real bee rules. Miss your word and you sit down.'},
  mockAnalogy:{n:'Mock Analogy Bee', p:'Your rivals, one analogy each. Miss the link and you sit down.'},
  gym:      {p:'Warm-up, Sprint, Squares and more: every way to drill a spelling, in one hall.'},
  lore:     {p:'Roots, origins, meanings and idioms: the story inside every word.'},
  hive:     {p:'General-knowledge trivia, with a fact to keep from every question.'},
  dailyBee: {n:'Daily Bee', p:'One new word a day: hear it, learn it, spell it.'},
  dailyBuzz:{n:'Daily Buzz', p:'Six tries to spell today\u2019s mystery word, then share your grid.'},
  wordForge:{n:'Word Forge', p:'Build words from their parts at the honey forge.'},
};
const PLAY_ART = {
  mockbee:{grad:'linear-gradient(150deg,#3A1E4E,#2A1638 60%,#1E1028)'},
  mockAnalogy:{grad:'linear-gradient(150deg,#163A5A,#122A44 60%,#0C1C30)'},
  gym:{grad:'linear-gradient(135deg,#FF5FA2,#C8458C)', plate:'gym', game:'beat'},
  lore:{grad:'linear-gradient(135deg,#13A892,#0E7A6A)', plate:'lore', game:'wordquiz'},
  hive:{grad:'linear-gradient(135deg,#F0A93C,#C8791B)', plate:'hive', game:'trivia'},
  dailyBee:{grad:'linear-gradient(135deg,#2FA35C,#1E7D45)', plate:'daily', game:'daily'},
  dailyBuzz:{grad:'linear-gradient(110deg,#1E7D45,#2FA35C 46%,#3FBF6E)', game:'daily'},   // the green its banner wore
  beeGrandPrix:{grad:'linear-gradient(150deg,#2A1A4A,#1B1235)', img:'app-art/arc-grandprix.webp', cta:'Start your engine'},
  typeBlaster:{grad:'linear-gradient(150deg,#1B2A4A,#121B35)', shot:'typeBlaster'},
  honeycombRun:{grad:'linear-gradient(150deg,#4A2A10,#2E1A0A)', img:'app-art/arc-honeycomb.webp', cta:'Enter the maze'},
  wordForge:{grad:'linear-gradient(150deg,#5A2A10,#2E140A)', plate:'forge', cta:'Light the forge'},
};
function playCardName(k){ if(k==='gym'||k==='lore'||k==='hive') return hubName(k);
  const g=(window.SB_ARCADE_GAMES||[]).find(x=>x.k===k); return (PLAY_TEXT[k]&&PLAY_TEXT[k].n)||(g&&g.n)||k; }
function playCardLive(card){ if(card.arcade) return !!(window.SB_ARCADE_GAMES||[]).find(x=>x.k===card.k); return typeof app[card.open]==='function'; }
/* Word Forge stands on the tab only once its morpheme table is signed off (g-forge's SB_FORGE.signedOff), or in tester
   mode; Mock Analogy Bee only through the analogy gate (anlOpen — released, or tester mode; owner, 10 Oct 2026) */
function playCardShown(card){ if(card.k==='wordForge') return !!((window.SB_FORGE&&SB_FORGE.signedOff)||testerOn());
  if(card.k==='mockAnalogy') return anlOpen();
  return true; }
function playCardsShown(){ return SB_PLAY_CARDS.filter(playCardShown); }
/* the child's own best on a card, quietly — a number they set, never a target the card sets (G9) */
function playCardBest(card,c){
  if(card.arcade){ const v=Math.round(+arcBestMap()[card.k]||0); return v>0?'Best '+fmtN(v):''; }
  if(card.k==='mockAnalogy'){ try{ if(window.SB_ANL) return SB_ANL.beeBest(); const p=((c&&c.anl)||{}).bee||{}; if(!p.played||!p.best) return ''; const n=p.best; return 'Best finish: '+n+(n%100>10&&n%100<14?'th':({1:'st',2:'nd',3:'rd'})[n%10]||'th')+(p.wins?' · '+p.wins+' won':''); }catch(e){ return ''; } }
  if(card.k==='mockbee'){ try{ const st=(window.MOCKBEE?MOCKBEE.stats():SB_STORE.getJSON('mockbee',{}))||{}; return st.played&&st.best?('Best finish: '+(n=>n+(n%100>10&&n%100<14?'th':({1:'st',2:'nd',3:'rd'})[n%10]||'th'))(+st.best)+(st.wins?' · '+st.wins+' won':'')):''; }catch(e){ return ''; } }
  if(card.hub){ try{ if(window.SB_HUB_BEST&&typeof SB_HUB_BEST[card.k]==='function'){ const s=SB_HUB_BEST[card.k](); if(s) return String(s); } }catch(e){}
    const t=SB_BESTS.top(card.k,c); if(!t) return '';
    const mode=((window.SB_HUB_MODES&&SB_HUB_MODES[card.k]&&SB_HUB_MODES[card.k][t.mode])||t.mode.charAt(0).toUpperCase()+t.mode.slice(1));
    return 'Best '+(t.best.of?t.best.right+'/'+t.best.of:t.best.right)+' · '+mode; }
  return ''; }
// End-of-game reveal: what was right, what was wrong, and coaching tips drawn from the words themselves
const TRAP_TIP={ double:'Twin letters mark where syllables split — rab·bit, oc·cur·rence. Spell each half and keep both letters.',
  silent:'Silent letters travel in families: kn-, wr-, -mb, gh. Learn the family once and a dozen words come free.',
  ieei:'i before e except after c — and right after c it flips: receive, ceiling.',
  schwa:'That mumbled “uh” hides a letter. Say it robot-style — choc-O-late, sep-A-rate — and the letter appears.',
  endings:'Suffixes come in families (-tion, -ance/-ence, -able/-ible). Say a relative out loud — the family shares its spelling.',
  french:'French words hide their endings — ballet, bouquet. When a word sounds fancy, ask its origin.',
  greek:'Greek words love ph, y, and ch that sounds like k — photo, gym, chorus.',
  latin:'Latin roots repeat everywhere — find the root, reuse its spelling.' };
function overlays(){
  const S=state; let h=''; if(S.listView) h+=scrDraw('scrLib',()=>fullListOverlay()); 
  /* a tap that is waiting for the boot word tier (wordsHold): the hive loader over the screen, nothing to tap under it */
  if(S.wordsWait) h+=`<div class="sb-words-wait" style="position:fixed;inset:0;z-index:140;display:grid;place-items:center;background:color-mix(in srgb,var(--bg1,#f3efff) 82%,transparent)">${hiveLoader('fetching the words…')}</div>`;
  // These sheets live out here, not inside view(): render() wraps view() in a
  // position:relative;z-index:1 box, which is a stacking context — anything drawn inside it
  // is pinned below the overlays no matter how high its own z-index is. That is why
  // Settings → Manage plan used to open *behind* Settings.
  /* A household written by a NEWER build is opened read-only (store.js) — say so for as long as
     it lasts, not in a toast that is gone before anyone reads it. */
  if(window.SB_STORE && SB_STORE.readOnly()) h+=`<div class="sb-ro" role="status" style="position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:120;max-width:min(560px,calc(100vw - 32px));padding:10px 16px;border-radius:12px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);border:1px solid currentColor;font-weight:700;font-size:13px;line-height:1.45;box-shadow:var(--sh-overlay)">This device holds Bizzing Bee data from a newer version. Reload to update — nothing is saved until then.</div>`;
  /* THE PLAN GUARD. Eight places open the plan sheet or the paywall (a locked list, a locked
     lesson, an upsell, the landing page's plan pick…). Guarding each opener is how this went
     wrong, so it is guarded HERE, where the sheet is drawn: no sheet until a grown-up has passed
     the PIN, creating one first if there is none. The pass lasts until the sheet closes. */
  if((S.showTiers||S.showPaywall) && !S._planOk){
    if(S._pinPass) S._planOk=true;
    else { const t=!!S.showTiers, pw=!!S.showPaywall; S.showTiers=false; S.showPaywall=false;
      if(!S.pinDlg) S.pinDlg={ label:((S.tierUpsell&&S.tierUpsell.label)?S.tierUpsell.label.replace(/^./,ch=>ch.toUpperCase())+' — grown-ups only':'Plans — grown-ups only'), typed:'', make:!pinSet(), first:null,
        next:()=>{ state._planOk=true; state.showTiers=t; state.showPaywall=pw; render(); } }; } }
  if(!S.showTiers && !S.showPaywall) S._planOk=false;
  if(S.qWord) h+=scrDraw('scrLib',()=>viewQuotesWordPop());
  if(S.wordCard) h+=scrDraw('scrLib',()=>viewWordCardPop());
  if(S.deckOpen) h+=scrDraw('scrLib',()=>viewSetDeck());
  if(S.ttList) h+=scrDraw('scrLib',()=>viewTtList());
  if(S.showTiers) h+=scrDraw('scrGrown',()=>viewTiersSheet());
  if(S.authSheet) h+=scrDraw('scrGrown',()=>viewAuthSheet());
  if(S.cloudSheet) h+=scrDraw('scrGrown',()=>viewCloudSheet());
  h+=bugUI();
  if(S.walletOpen) h+=scrDraw('scrMe',()=>viewWalletSheet());
  if(S.settingsOpen){
    h+=`<div id="sb-set-ov" data-act="closeSettings" style="position:fixed;inset:0;z-index:76;background:rgba(10,8,20,.55);backdrop-filter:blur(6px);display:grid;place-items:start center;padding:18px;overflow:auto">
      <div data-act="noop" data-trap="settings" role="dialog" aria-modal="true" aria-label="Settings" style="position:relative;width:100%;max-width:720px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;box-shadow:var(--glow);padding:clamp(16px,4vw,26px) clamp(16px,4vw,26px) 24px;margin:20px 0;${state._setOpened?'':'animation:sb-pop .3s ease both'}">
        <button data-act="closeSettings" aria-label="Close settings" title="Close" style="position:absolute;top:14px;right:14px;z-index:3;width:38px;height:38px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);display:grid;place-items:center;font-weight:900;font-size:16px">✕</button>
        ${viewSettings()}
      </div></div>`;
  }
  /* (road to 4.5, P0.23) THE OLD "GO PREMIUM" PAGE IS GONE. It sold "$59/yr", "4 worlds" and "never with
     coins" — none of which any plan does (SB_TIERS is the only place a price is decided, and worlds open
     with the family plan or for earned coins). A locked list or an old link that asks for it gets the ONE
     plan sheet, behind the same guard above; closing it clears both flags (closeTiers). */
  if(S.showPaywall && !S.showTiers) h+=scrDraw('scrGrown',()=>viewTiersSheet());
  if(S.fullLoading) h+=`<div style="position:fixed;inset:0;z-index:65;background:rgba(10,8,20,.5);backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px">
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:28px 30px;text-align:center;box-shadow:var(--glow);max-width:340px">
        <div style="width:64px;height:72px;margin:0 auto 12px;animation:sb-float 2.5s ease-in-out infinite">${mascotSVG('happy')}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;margin-bottom:6px">Loading the full library…</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5">The whole library, ${countTxt('library')} words — this one-time load takes a few seconds.</div>
        <div style="width:28px;height:28px;margin:14px auto 0;border:3px solid var(--surface2);border-top-color:var(--accent);border-radius:50%;animation:sb-spin .8s linear infinite"></div>
      </div></div>`;
  if(S.pinDlg) h+=`<div style="position:fixed;inset:0;z-index:130;display:grid;place-items:center;padding:20px;background:rgb(20 12 40 / .6)" data-act="pinCancel">
    <div data-act="noop" data-pin-dlg role="dialog" aria-modal="true" aria-label="${escA(S.pinDlg.label)}" style="background:var(--paper,#fff);border-radius:20px;box-shadow:var(--sh-overlay);width:100%;max-width:320px;padding:26px 24px;text-align:center;animation:sb-pop .3s ease both">
      <div style="display:flex;justify-content:center;color:var(--accent)">${SB_ICON('lock',{size:34})}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:19px;margin:4px 0 2px">${esc(S.pinDlg.label)}</div>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:14px;line-height:1.5">${S.pinDlg.make
        ? (S.pinDlg.wrong?'<b style="color:var(--bad,#D6453A)">Those didn’t match — choose again</b>':S.pinDlg.first?'Type it again to check.':'Grown-ups: choose a 4-digit PIN. Plans, purchases and the parent zone will ask for it. It keeps small hands out — it is not a lock.')
        : (S.pinDlg.wrong?'<b style="color:var(--bad,#D6453A)">Wrong PIN — try again</b>':'Ask a grown-up to enter the 4-digit PIN.')}</div>
      <div style="display:flex;gap:9px;justify-content:center;margin-bottom:16px">${[0,1,2,3].map(i=>`<span style="width:15px;height:15px;border-radius:50%;border:2px solid var(--accent);display:inline-block;background:${i<S.pinDlg.typed.length?'var(--accent)':'transparent'}"></span>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${['1','2','3','4','5','6','7','8','9','del','0','x'].map(k=>k==='x'?`<button data-act="pinCancel" style="padding:13px 0;border-radius:12px;background:var(--surface2);font-weight:800;font-size:13px;color:var(--muted)">Cancel</button>`:`<button data-act="pinKey" data-arg="${k}" style="padding:13px 0;border-radius:12px;background:${k==='del'?'var(--surface2)':'var(--chip)'};font-weight:800;font-size:${k==='del'?'12px':'17px'};color:${k==='del'?'var(--muted)':'var(--accent)'}">${k==='del'?'⌫':k}</button>`).join('')}</div>
    </div></div>`;
  if(S.toast) h+=`<div class="sb-toast" style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:70;pointer-events:none;background:var(--accent);color:#fff;font-weight:800;font-size:15px;padding:13px 22px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:sb-pop .35s ease both;display:flex;align-items:center;gap:9px">${esc(S.toast)}</div>`;
  return h;
}

/* ============ Trivia Training — "Know the World of Words" ============
   The whole trivia bank as study material: one chapter per theme, each a deck of
   flip-cards (question on the front, answer + fun fact on the back). Studying is
   Low-pressure — no timer, no scoring — and each chapter hands off to the Arcade. */
let _ttCache={};
/* ---- The trivia band: which of the five question levels this speller should see. ----
   Mirrors how the spelling engine meets a child where they are: age gives the base
   (five groups), spelling prowess shifts it, and recent trivia accuracy at that band
   fine-tunes it. A manual pick (c.ttLvSel 1–5) always wins; 0/unset = automatic. */
function ttAgeBand(age){ return age<=8?1: age<=10?2: age<=12?3: age<=14?4: 5; }
function ttBand(c){ c=c||active(); if(!c) return 3;
  const sel=+(c.ttLvSel||0); if(sel>=1&&sel<=5) return sel;
  let b=ttAgeBand(+c.age||9);
  try{ const hl=heroLevel(c); if(hl>=14) b+=1; else if(hl<=3) b-=1; }catch(e){}
  try{ const s=(((c.trivia||{}).bands)||{})[Math.max(1,Math.min(5,b))]||{r:0,d:0};
    if(s.d>=20){ const a=s.r/s.d; if(a>=.85) b+=1; else if(a<.45) b-=1; } }catch(e){}
  return Math.max(1,Math.min(5,b)); }
window.ttBand=ttBand; window.ttAgeBand=ttAgeBand;
/* Every answered arcade question feeds back into the band (decayed so old rounds fade). */
window.ttBandRecord=(band,right)=>{ try{ const c=active(); const t=c.trivia||(c.trivia={});
  const B=t.bands||(t.bands={}); const s=B[band]||(B[band]={r:0,d:0}); s.d++; if(right) s.r++;
  if(s.d>200){ s.r=Math.round(s.r/2); s.d=100; } save(); }catch(e){} };
/* The bank is sharded by level and fetched on demand (a 6MB boot payload is no way to
   treat a tablet). Everything below reads SB_TRIVIA.questions synchronously, so the rule
   is simple: make sure a level is in memory BEFORE rendering anything that shows it. */
window.SB_TRIVIA_ONLOAD=function(){ _ttCache={}; try{ render(); }catch(e){} };
function ttNeed(lv,cb){ try{
    if(window.SB_TRIVIA && typeof SB_TRIVIA.need==='function'){ SB_TRIVIA.need(lv,cb); return; }
  }catch(e){}
  if(cb) cb(true); }                       // un-sharded data: everything is already here
function ttLevelReady(lv){ try{ return !(window.SB_TRIVIA&&SB_TRIVIA.loaded) || SB_TRIVIA.loaded(lv); }catch(e){ return true; } }
window.ttNeed=ttNeed; window.ttLevelReady=ttLevelReady;
/* How many cards a chapter holds at a level — answerable from the index alone, so the
   hub can show real numbers while a shard is still in flight. */
function ttDeck(th,lv){ lv=lv||ttBand(); const ck=th+'|'+lv; if(_ttCache[ck]) return _ttCache[ck];
  const all=((window.SB_TRIVIA||{}).questions)||[];
  let deck=all.filter(q=>q.th===th && (q.lv||3)===lv);
  if(deck.length<12) deck=all.filter(q=>q.th===th && Math.abs((q.lv||3)-lv)<=1).sort((a,b)=>(a.lv||3)-(b.lv||3));
  _ttCache[ck]=deck; return deck; }
function ttSeenKey(th){ return th+'|'+ttBand(); }
function ttKey(q){ return (q&&(q.id||q.q))?String(q.id||q.q).slice(0,60):''; }
function ttRec(c,k){ const m=c.ttCards||{}; const v=m[k];
  if(!v) return {s:'',r:0};
  if(typeof v!=='object') return {s:'practised',r:0};      // legacy "seen" flag
  return {s:v.s||'',r:v.r?1:0}; }
function ttPut(c,k,rec){ c.ttCards=c.ttCards||{};
  if(!rec.s&&!rec.r) delete c.ttCards[k]; else c.ttCards[k]={s:rec.s||'',r:rec.r?1:0}; }
/* The card in the Parent dashboard. It states the truth about THIS install rather than
   a general claim, because the honest answer differs per family: most are offline-only,
   and telling them their data is in a cloud they never opted into would be a lie. */
/* ===================== BACKUP · RESTORE · ERASE (FIX-BEE M3, family standard §7) =====================
   A grown-up can take the whole household away in one file, put it back, or wipe it — all three
   behind the PIN, each asked for again at the moment it acts (the parent zone can stay open on a
   shared device). There is no server; the file goes to the grown-up's own device and nowhere else.
   · WHAT IS IN THE FILE: every `sb_*` key this app keeps — the household blob (names included:
     it is the family's own file, and a backup that loses the child's name is not a backup) —
     EXCEPT device things that must not travel (BK_SKIP: sign-in, session, cloud consent, the
     research log, bug reports, voice flags, tester mode). It is a deny-list on purpose, unlike
     the cloud allow-list: a backup that silently drops a key added next month loses a child's
     work, which is the worse failure here.
   · THE FAMILY KEYS are shared with the other Bizzing apps on this origin, so the file carries
     only this household's slice (its children's wallet rows, Bee's rows of the activity feed),
     and restore only ADDS what is missing — it never overwrites another app's newer history.
   · ERASE removes every `sb_*` key and Bee's rows of the activity feed for these children. The
     family wallet is left alone and the screen says so: its coins were earned across apps.
   · After restore/erase the page reloads into what is on disk, and `save` is stubbed first —
     pagehide calls save(), which would otherwise write the old household straight back.
   Guard: tests/backup-restore.cjs (round-trip a child exactly, the PIN, a refused file). */
const BK_SKIP=/^sb_(accounts_v\d+|session_v\d+|sync_v\d+|tm_log|tm_on|bugs|devunlock|vflags|evofeedback)$/;
function bkKeys(all){ const out=[]; try{ SB_STORE.keys().forEach(k=>{ if(/^sb_/.test(k)&&(all||!BK_SKIP.test(k))) out.push(k); }); }catch(e){} return out.sort(); }
/* the risky direction is the strict one: the file says what it is, or it is refused with a reason */
function backupParse(text){ let b; try{ b=JSON.parse(String(text||'')); }catch(e){ return {ok:false, why:'That file is not a Bizzing Bee backup — it cannot be read as one.'}; }
  if(!b||b.app!=='bizzing-bee'||b.kind!=='household-backup'||!b.keys||typeof b.keys!=='object') return {ok:false, why:'That is a file, but not a Bizzing Bee backup.'};
  if((b.v||0)>1) return {ok:false, why:'That backup was made by a newer Bizzing Bee. Update the app first — restoring it here would lose what it knows.'};
  let h; try{ h=JSON.parse(b.keys.sb_saas_v2||'null'); }catch(e){ h=null; }
  if(!h||!Array.isArray(h.children)) return {ok:false, why:'The backup has no household in it.'};
  if((+h.sv||1)>SB_STORE.SCHEMA) return {ok:false, why:'That backup was made by a newer Bizzing Bee. Update the app first — restoring it here would lose what it knows.'};
  for(const k in b.keys){ if(!/^sb_/.test(k)||BK_SKIP.test(k)||typeof b.keys[k]!=='string') return {ok:false, why:'The backup carries something that is not Bizzing Bee data ('+String(k).slice(0,40)+'), so it was not restored.'}; }
  return {ok:true, blob:b, kids:h.children.length, names:h.children.map(c=>c&&c.name).filter(Boolean), at:b.at||0}; }
function bkFamilyAdd(fam){ fam=fam||{};
  try{ const src=fam['bizzing.wallet']; if(src&&src.kids){ const w=SB_STORE.getJSON('wallet',null)||{v:1,kids:{}}; w.kids=w.kids||{};
      let ch=false; Object.keys(src.kids).forEach(n=>{ if(!w.kids[n]){ w.kids[n]=src.kids[n]; ch=true; } }); if(ch) SB_STORE.setJSON('wallet',w); } }catch(e){}
  try{ const src=fam['bizzing.activity']; if(src&&Array.isArray(src.s)){ const a=SB_STORE.getJSON('activity',null)||{v:1,s:[]}; a.s=Array.isArray(a.s)?a.s:[];
      const sig=x=>[x.a,x.d,x.t,x.who||'',x.ev||'',x.label||''].join('|'); const have=new Set(a.s.map(sig));
      src.s.forEach(x=>{ if(x&&!have.has(sig(x))){ a.s.push(x); have.add(sig(x)); } }); a.s.sort((p,q)=>(p.d<q.d?-1:p.d>q.d?1:(p.t||0)-(q.t||0))); SB_STORE.setJSON('activity',a); } }catch(e){} }
/* the page is about to reload into what is on disk: nothing may write the old household back.
   Halt FIRST — any render() on the way out (a flash, a view) can call save(). */
function bkHalt(){ try{ window.save=function(){}; }catch(e){} try{ if(window.SB_SYNC) SB_SYNC.queue=function(){}; }catch(e){} }
/* the reload carries a seal (store.js): a reloaded page that cannot see it yet is reading storage from before the
   erase or restore, holds every write and reloads again — never the old household saved back over the new one */
function bkHaltAndReload(){ bkHalt(); try{ setTimeout(()=>{ try{ SB_STORE.sealReload(); }catch(e){ try{ location.reload(); }catch(_){} } }, 60); }catch(e){} }
function restoreHousehold(blob){ bkKeys(false).forEach(k=>{ try{ SB_STORE.delKey(k); }catch(e){} });
  Object.keys(blob.keys).forEach(k=>{ try{ SB_STORE.setKey(k, blob.keys[k]); }catch(e){} }); bkFamilyAdd(blob.family); }
const bkBtn=(act,label,bg,col,bd)=>`<button data-act="${act}" style="padding:10px 15px;border-radius:10px;background:${bg};color:${col};border:1px solid ${bd||'transparent'};font-weight:800;font-size:13px">${label}</button>`;
/* a new device (or one just erased) has no Parent Zone to restore from — the welcome page's
   footer carries the same file picker and the same confirm */
function bkLandingLink(){ const S=state; const p=S.bkPending;
  return `<label style="position:relative;font-size:13px;font-weight:700;color:var(--muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer">Restore a backup<input type="file" accept=".json,application/json" data-file="bkPick" aria-label="Restore a household from a backup file" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden;left:0"></label>
    ${(p||S.bkMsg)?`<div style="flex-basis:100%">${S.bkMsg?`<div class="sb-bk-msg" role="status" style="font-size:12.5px;font-weight:700;color:${S.bkMsg.bad?'var(--bad)':'var(--good)'}">${esc(S.bkMsg.t)}</div>`:''}${bkRestoreConfirm()}</div>`:''}`; }
function bkRestoreConfirm(){ const p=state.bkPending; const btn=bkBtn; return p?`<div class="sb-bk-confirm" style="margin-top:12px;padding:12px;border-radius:11px;background:var(--surface2);border:1px solid var(--line)">
      <div style="font-size:13px;line-height:1.5;font-weight:650;margin-bottom:9px">Restore <b>${esc(p.names.join(', ')||(p.kids+' speller'+(p.kids===1?'':'s')))}</b> from the backup made ${p.at?esc(new Date(p.at).toLocaleString()):'earlier'}? Everything Bizzing Bee holds on this device now is replaced by the file.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${btn('bkRestoreGo','Restore it','var(--accent)','#fff')}${btn('bkCancel','Cancel','var(--surface)','var(--text)','var(--line)')}</div></div>`:''; }
/* a file input cannot dispatch through data-act (the value is a fake path); this one listener
   hands the File itself to its action */
document.addEventListener('change', e=>{ try{ const el=e.target&&e.target.closest&&e.target.closest('[data-file]'); if(!el) return;
  const f=el.files&&el.files[0]; const fn=app[el.getAttribute('data-file')]; if(fn&&f) fn(f); el.value=''; }catch(err){} });
// ===== Admin console (local support tool; Retool/RBAC in Phase 2) =====
function viewAdmin(){ const S=state; const tab=S.adminTab||'users'; const me=SB_AUTH.current();
  const tabBtn=(k,l)=>`<button data-act="adminTab" data-arg="${k}" style="padding:9px 15px;border-radius:10px;font-weight:800;font-size:13px;${tab===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${l}</button>`;
  let body='';
  if(tab==='users'){
    const kids=(S.children||[]).map((c,i)=>{ const t=(c.tier&&SB_TIERS[c.tier])?c.tier:'free';
      const sel=['free','beginner','regional'].map(id=>`<button data-act="adminSetTier" data-arg="${i}|${id}" style="padding:6px 10px;border-radius:8px;font-weight:800;font-size:11.5px;${t===id?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${SB_TIERS[id].name}</button>`).join('');
      return `<div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:13px 15px;margin-bottom:9px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(c.name||'Speller '+(i+1))}</span><span style="font-size:12px;color:var(--muted)">ages ${ageBandOf(c).n} · 🪙 ${fmtN(c.coins||0)} · plan: <b style="color:var(--accent)">${esc(SB_TIERS[t].name)}</b></span></div>
        <div style="display:flex;gap:7px;flex-wrap:wrap">${sel}</div></div>`; }).join('')||'<div style="color:var(--muted);font-size:13px">No child profiles on this device yet.</div>';
    const accts=SB_AUTH.listUsers().map(u=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12px">${u.role==='admin'?'🛡️':'👤'} ${esc(u.email)} <span style="color:var(--muted)">· ${esc(u.role)}</span></span>`).join(' ');
    body=`<div class="sb-card" style="margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">Child profiles &amp; plans</div><div style="font-size:12px;color:var(--muted);margin-bottom:12px">Set any speller's subscription tier (local — mirrors what a Stripe webhook will do in Phase 2).</div>${kids}</div>
      <div class="sb-card"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:8px">Accounts</div><div style="display:flex;gap:7px;flex-wrap:wrap">${accts}</div></div>`;
  } else if(tab==='promos'){
    body=`<div class="sb-card"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">Promotions &amp; feature flags</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6">This is where promo banners, coupon codes, price experiments and tier changes are toggled <b>live, without an app redeploy</b>. In Phase 2 this panel is backed by a remote-config / feature-flag service (PostHog flags or Firebase Remote Config) + Stripe coupons. For now it's a placeholder wired to the same admin gate.</div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap"><span style="padding:6px 12px;border-radius:99px;background:var(--surface2);border:1px dashed var(--line);font-weight:700;font-size:12px;color:var(--muted)">＋ New promo (Phase 2)</span><span style="padding:6px 12px;border-radius:99px;background:var(--surface2);border:1px dashed var(--line);font-weight:700;font-size:12px;color:var(--muted)">＋ Coupon code (Phase 2)</span></div></div>`;
  } else if(tab==='content'){
    const reports=(S.wordReports||[]).length;
    body=`<div class="sb-card"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">Content moderation</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6">Word/quote fixes ship as data (the <code>words-patch.js</code> pattern). Parent-flagged words on this device: <b>${reports}</b>. In Phase 2 these flow to a shared moderation queue.</div></div>`;
  } else {
    let saga=0; try{ saga=(window.SAGA2&&SAGA2.cleared)?SAGA2.cleared():0; }catch(e){}
    body=`<div class="sb-card"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:8px">Analytics (local snapshot)</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px">
        ${[['Profiles',(S.children||[]).length],['Accounts',SB_AUTH.listUsers().length],['Quotes',SB_COUNT.quotes()==null?'…':SB_COUNT.quotes()],['Saga cleared',saga]].map(([l,v])=>`<div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:14px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:22px;color:var(--accent)">${fmtN(v)}</div><div style="font-size:11.5px;color:var(--muted);font-weight:700">${l}</div></div>`).join('')}
      </div>
      <div style="font-size:12px;color:var(--muted);margin-top:12px">Real product analytics (PostHog) + revenue BI (warehouse + Metabase) connect in Phase 2 — see LAUNCH-READINESS.md.</div></div>`;
  }
  return `<div style="max-width:860px;margin:0 auto;padding:18px clamp(14px,3.5vw,32px) 60px">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:14px">
      <span style="width:38px;height:38px;border-radius:11px;background:#241E33;color:#fff;display:grid;place-items:center;font-size:18px">🛡️</span>
      <span style="font-family:var(--display);font-weight:800;font-size:20px">Admin console</span>
      <span style="font-size:12px;color:var(--muted)">${me?esc(me.email):''}</span>
      <span style="margin-left:auto;display:inline-flex;gap:8px"><button data-act="doSignOut" style="padding:9px 14px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:12.5px">Sign out</button>${backPill('closeAdmin','Back to app',null)}</span>
    </div>
    <div style="background:#FEF3C7;border:1px solid #F0C040;color:#7a5a00;border-radius:10px;padding:9px 13px;font-size:12px;font-weight:600;margin-bottom:14px">⚠️ Local dev console. This is not production security — real admin runs server-side (RBAC) in Phase 2.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">${tabBtn('users','Users & plans')}${tabBtn('promos','Promotions')}${tabBtn('content','Content')}${tabBtn('analytics','Analytics')}</div>
    ${body}
  </div>`; }

/* ===================== render + events ===================== */
const root = document.getElementById('root');
/* "Match device" (standard §5): the look follows prefers-color-scheme — Light by day, Dusk by night. */
function effectiveMode(pref){ if(pref!=='auto') return pref||'light';
  try{ return (window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dusk':'light'; }catch(e){ return 'light'; } }
try{ if(window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{ try{ if(state.modePref==='auto'){ state.mode=effectiveMode('auto'); render(); } }catch(e){} }); }catch(e){}
function save(){ if(window.SB_STORE&&SB_STORE.readOnly()) return;   // a newer build wrote this household: never write over it
  try{ SB_STORE.saveHousehold({ theme:state.theme, mode:state.mode, mp:state.modePref||null, premium:state.premium, pin:state.parentPin||null, vr:state.voiceRate||1, tz:state.textSize||'normal', ra:state.readAloud?1:0, af:state.a11yFont||'std', ac:state.a11yContrast?1:0, am:state.a11yMotion?1:0, cm:state.calmMode?1:0, fo:state.feedOff?1:0, children:state.children, activeIdx:state.activeIdx, goalDone:state.goalDone, cN:(window.SB_CONCEPTS&&SB_CONCEPTS.chapters&&SB_CONCEPTS.chapters.length)||121, lu:state.luMastered, srs:state.coachSrs, chist:state.coachHistory, wr:state.wordReports||[] }); }catch(e){}
  /* Cloud backup rides on the same call, coalesced inside SB_SYNC. save() fires on
     nearly every interaction, so this must never do work on the calling frame — and
     it must never be able to break the local save above, which is why it is last and
     wrapped. Inert unless a parent has signed in and consented. */
  try{ if(window.SB_SYNC) SB_SYNC.queue(); }catch(e){} }
/* An entrance animation should say "a new screen arrived", not "a data file
   landed". sb-rise is applied in thirty places, all inside strings render()
   rebuilds — so every render restarts a translateY(12px) slide on everything
   visible. At boot that is fifteen renders in four hundred milliseconds as
   boot-lazy delivers the deferred data, and the whole screen jitters.
   (Layout-shift metrics do not catch it: a transform is not a layout shift, so
   CLS reads a clean 0.000 while the app is visibly jumping.)
   So: remember what was on screen last time, and when render() is only
   repainting the SAME view, suppress the entrances. Moving between screens
   still animates, which is the only time it meant anything. */
function viewKey(){
  /* trailView/Act/Unit/Chk/Stop, not the long-dead trailOpen: with one key for the
     whole Atlas, sb-norise never lifted on real navigation inside it (no entrance
     animation ever replayed on arrival) — and background re-renders still flashed
     the stop callout, whose pop is a CLASS animation the [style*=…] rules below
     cannot reach. trail.js gates its own inline rises and the callout by the same
     identity; this key keeps the body-level mechanism telling the same story. */
  try{ return [state.screen, state.nav, state.view, state.coachTab, state.vocTab,
    state.vocDeck, state.mb && state.mb.view, state.trailView, state.trailAct,
    state.trailUnit, state.trailChk, state.trailStop, state.chapter,
    state.readerBook, state.readerCh, state.readerPg, !!state.readerQuiz].join('|'); }
  catch(e){ return ''; }
}
var _lastViewKey = null;
function render(){
  try{
    var k = viewKey();
    document.body.classList.toggle('sb-norise', k === _lastViewKey);
    _lastViewKey = k;
  }catch(e){}
  // keep the legacy paid/free flag in lock-step with the active child's subscription tier
  try{ if(window.SB_ENT && state.children && state.children.length) state.premium = SB_ENT.isPaid(); }catch(e){}
  try{ mastSync(); }catch(e){}   // luMastered follows the active child's evidence record (FIX-BEE D5)
  // Advanced Mode can switch on from a level-up mid-session, so check on every render.
  // advCheckUnlock() is a no-op after the first time for a given child.
  try{ if(state.screen==='app') advCheckUnlock(); }catch(e){}
  try{ if(state.screen==='app') focusAutoSync(); }catch(e){}
  const a=document.activeElement; const fkey=a&&a.getAttribute&&a.getAttribute('data-fkey'); let ss=null,se=null;
  /* A BACKGROUND REDRAW KEEPS THE FOCUS (14 Oct 2026). A file landing redraws #root (boot-lazy softRender), and every
     button in it is new — a keyboard user Tabbing on Home in the first seconds was thrown back to <body>, and their
     Enter landed nowhere (kudos caught it twice in full runs). On such a redraw only, the focus goes back to the same
     control: the nth element with the same data-act and data-arg. A redraw the child caused (a click, a key) is left
     as it was: a button that kept the focus after its own click would act twice on the drills' global Enter. */
  let _fk=null; try{ if(!fkey&&window.SB_RENDER_SOFT&&a&&a!==document.body&&a.getAttribute&&a.getAttribute('data-act')){ const R0=document.getElementById('root');
    if(R0&&R0.contains(a)){ const act=a.getAttribute('data-act'), arg=a.getAttribute('data-arg'); const same=[...R0.querySelectorAll('[data-act]')].filter(x=>x.getAttribute('data-act')===act&&x.getAttribute('data-arg')===arg);
      _fk={act,arg,i:same.indexOf(a)}; } } }catch(e){ _fk=null; }
  try{ if(a){ ss=a.selectionStart; se=a.selectionEnd; } }catch(e){}
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-mode', state.mode);
  if(state.mode==='dusk') document.documentElement.setAttribute('data-bz-dark',''); else document.documentElement.removeAttribute('data-bz-dark');   /* the family night glow (bizzing-avatars.css) */
  document.documentElement.setAttribute('data-size', state.textSize||'normal');
  { const R=document.documentElement;
    R.setAttribute('data-font', state.a11yFont==='easy'?'easy':'std');
    if(state.a11yContrast) R.setAttribute('data-contrast','high'); else R.removeAttribute('data-contrast');
    if(state.a11yMotion) R.setAttribute('data-motion','off'); else R.removeAttribute('data-motion');
    window.SB_CALM=!!state.calmMode; }
  try{ const _c=active(); document.documentElement.setAttribute('data-age', _c.ageMode||((_c.age||9)<=11?'playful':'focused')); }catch(e){}
  // preserve the Settings pop-up scroll position across re-renders so it never jumps
  let _setScroll=null; try{ const so=document.getElementById('sb-set-ov'); if(so) _setScroll=so.scrollTop; }catch(e){}
  /* SITE-UNDER-DEVELOPMENT BANNER.
     Rendered rather than written into the static #root on purpose: the crawlable
     copy is what Google and the answer engines index, and "under development" is
     not a sentence worth ranking for. A visitor sees it; a crawler describes the
     product. Dismissible for the session only — it comes back on the next visit,
     because it stops being true only when we say so, not when someone clicks an X. */
  /* Only on the landing page: a child's screens (setup and the app) never carry it (FIX-BEE v2, Q7).
     And OFF on the public landing at launch (road to 4.5, P0.22): a visitor deciding whether to trust
     the app with their child is not shown a "still being built" strip. Testing mode (state.devUnlock,
     behind the grown-up PIN) keeps it, so a tester still sees that the build is not final.
     Guard: tests/trust-v2.cjs §2. */
  const devBanner = (!state.devUnlock || state.devBannerOff || state.screen==='app' || state.screen==='onboarding') ? '' : `<div style="position:relative;z-index:60;
    background:linear-gradient(90deg,#F0B429,#E09612);color:#3A2A00;
    font-family:var(--ui,system-ui);font-weight:800;font-size:12.5px;line-height:1.4;
    padding:8px clamp(12px,3vw,20px);display:flex;align-items:center;gap:10px;justify-content:center;text-align:center">
    <span style="flex-shrink:0;display:inline-flex">${iconSVG('alert',15)}</span>
    <span style="min-width:0">This site is still being built — you may find rough edges, and some things will change.</span>
    <button data-act="devBannerHide" aria-label="Hide this notice"
      style="flex-shrink:0;width:22px;height:22px;border-radius:6px;display:grid;place-items:center;
      background:rgba(58,42,0,.14);color:#3A2A00;font-weight:800;line-height:1">${iconSVG('close',12)}</button></div>`;
  root.innerHTML = devBanner + `<div style="min-height:100dvh;position:relative;z-index:1">${view()}</div>` + overlays();
  _screenTop();
  if(state.nav==='daily'&&state.screen==='app'){ try{ const h=document.getElementById('db-host'); if(h&&window.SB_DAILY&&SB_DAILY.mount) SB_DAILY.mount(h); }catch(e){} }   /* Daily Bee draws its own stage into the shell */
  else if(window.SB_DAILY&&SB_DAILY.close){ try{ SB_DAILY.close(); }catch(e){} }   /* …and lets its keyboard go the moment it is not the screen */
  if(state.nav==='dailybuzz'&&state.screen==='app'){ try{ const h=document.getElementById('dz-host'); if(h&&window.SB_DAILY_BUZZ) SB_DAILY_BUZZ.mount(h); }catch(e){} }   /* Daily Buzz draws its board into the shell */
  else if(window.SB_DAILY_BUZZ&&SB_DAILY_BUZZ.close){ try{ SB_DAILY_BUZZ.close(); }catch(e){} }
  try{ document.body.classList.toggle('sb-forge-on', state.nav==='forge'&&state.screen==='app'); }catch(e){}
  if(state.nav==='forge'&&state.screen==='app'){ try{ const h=document.getElementById('fg-host'); if(h){ if(window.SB_FORGE_UI) SB_FORGE_UI.mount(h); else lazyNeed('forge', ()=>{ const h2=document.getElementById('fg-host'); if(h2&&window.SB_FORGE_UI) SB_FORGE_UI.mount(h2); }); } }catch(e){} }   /* Word Forge draws its own stage into the shell */
  if(state.nav==='gym'&&state.screen==='app'){ try{ const h=document.getElementById('gym-host'); if(h&&window.SB_GYM) SB_GYM.mount(h); }catch(e){} }   /* the Spelling Gym keeps its own DOM and is re-attached, so a render never wipes a half-typed word */
  if(state.nav==='home'&&state.screen==='app') homeArtHint();
  if(state.screen==='app'&&(state.game||state.nav==='daily'||state.nav==='today'||state.nav==='dailybuzz'||((state.nav==='lore'||state.nav==='hive')&&state.qz&&state.qz.mode)||(state.nav==='analogy'&&state.anl&&state.anl.run)||(state.nav==='anlbee'&&state.anlBee&&state.anlBee.phase!=='lobby')||state.nav==='forge'||(state.nav==='mockbee'&&state.mb&&(state.mb.view==='stage'||state.mb.view==='result')))) liveScan(root); else if(!document.querySelector('.arc-play,.bz-play')) _liveSaid='';
  _toastVsMiss();   // a toast never sits on the letter-by-letter miss panel
  if(state.screen==='landing') landShots(); else if(state.screen==='app'&&state.nav==='home') landShots('60px 0px');   /* Home's tip and quote pictures wait until they are nearly on screen (P3.22: the first-load image ratchet) */
  /* First real paint — take the loading screen down. Called on every render; the
     injector guards against running twice, and its own 6s ceiling covers the case
     where a render never arrives at all. */
  try{ if(window.SB_BOOT_DONE) window.SB_BOOT_DONE(); }catch(e){}
  if(_setScroll!=null){ try{ const so2=document.getElementById('sb-set-ov'); if(so2) so2.scrollTop=_setScroll; }catch(e){} }
  if(state.settingsOpen) state._setOpened=true;
  if(fkey){ const el=root.querySelector('[data-fkey="'+fkey+'"]'); if(el){ try{ el.focus(); if(ss!=null&&el.setSelectionRange) el.setSelectionRange(ss,se); }catch(e){} } }
  if(_fk&&(!document.activeElement||document.activeElement===document.body)){ try{ const same=[...root.querySelectorAll('[data-act]')].filter(x=>x.getAttribute('data-act')===_fk.act&&x.getAttribute('data-arg')===_fk.arg);
    const el=same[_fk.i]||(same.length===1?same[0]:null); if(el) el.focus({preventScroll:true}); }catch(e){} }
  // the evolution rail scrolls on narrow screens — park it on the speller's current stage
  try{ if(window.evoLadderSync) evoLadderSync(); }catch(e){}
  try{ if(window.SB_SHELL) SB_SHELL.afterRender(); }catch(e){}   // hash route + Hive milestones
  trapFocusAfterRender();
  save();
}
/* A NEW SCREEN STARTS AT ITS TOP (P0.17: "the practice progress bar scrolled off the top"). Every
   screen is one long page on the window, and nothing put the window back when the screen changed, so
   a drill opened from low on the page — "Practise these words" at the foot of a concept chapter, the
   Champ Challenge from the Word Gym's list dock, a list chosen in that dock — opened with its own
   header and progress bar already scrolled above the phone's edge. The key is the SCREEN, not the state: a re-render of
   the same screen (a coin, a toast, a typed letter, a word card over it) never moves the page; a new
   nav, a coach mode, a Word Gym tab or a game starting does — and so does choosing a list in the dock
   (selectList / startJourney), which swaps the cards at the top of the same screen. Guard:
   tests/mobile-layout.cjs. */
/* …AND IT ARRIVES (road to 4.5, P3.8): the same key decides a page transition — the new screen's content fades in over
   0.16 s. Opacity only (a transform would move the kit's fixed stage), and only when the child asked for the screen (a
   tap or a key in the last 0.6 s: a lazy file landing, a route or a timer never flashes the page). Off under Reduce motion:
   the app's setting stops every animation (data-motion="off"), saga2.css stops this one for the OS setting. Guard:
   tests/game-juice.cjs §7. */
let _scrKey=null, _scrIn=0;
try{ ['pointerdown','keydown'].forEach(t=>addEventListener(t,()=>{ _scrIn=Date.now(); },true)); }catch(e){}
function _screenTop(){ try{
  const S=state; const k=[S.screen,S.nav,S.nav==='coach'||S.nav==='levelup'?(S.coachMode||'')+'/'+(S.luTab||''):'',S.game?1:0].join('|');
  if(_scrKey!=null&&k!==_scrKey){ if((window.scrollY||0)>0) window.scrollTo(0,0);
    if(Date.now()-_scrIn<600){ const c=document.querySelector('#root .sb-content'); if(c){ c.classList.remove('sb-enter'); void c.offsetWidth; c.classList.add('sb-enter'); } } }
  _scrKey=k; }catch(e){} }
/* HOME'S PICTURES ARRIVE WITH ITS WORDS (audit v4 B6: "avatar and journey banners blank for ~6 s").
   Home's avatar and its two painted journey plates are asked for only when Home is drawn — after
   ~1MB of script — so on a phone network the words sat there for seconds over empty frames. Each
   Home render notes which of those pictures it showed (device key homeArt, through the store); next
   visit, index.html's parse-time peek preloads exactly those, alongside the scripts. Nothing is
   added to a first load: the same files, asked for sooner, and only for a speller who has been here. */
let _homeArtWas=null;
function homeArtHint(){ try{
  const urls=[...document.querySelectorAll('#root .sb-home-greet img, #root .sb-home-r2 img')].filter(i=>i.getBoundingClientRect().top<innerHeight).map(i=>i.getAttribute('src')||'')
    .filter(u=>/^(avatars|app-art)\/[a-z0-9\/._-]+\.(png|webp|jpe?g)$/i.test(u)).filter((u,i,a)=>a.indexOf(u)===i).slice(0,5);
  if(!urls.length) return; const k=JSON.stringify(urls);
  if(_homeArtWas==null) _homeArtWas=JSON.stringify(SB_STORE.getJSON('homeArt',[]));
  if(k!==_homeArtWas){ _homeArtWas=k; SB_STORE.setJSON('homeArt',urls); }
}catch(e){} }
/* P6 (audit v4): A GAME'S PROMPT AND ITS RESULT ARE SPOKEN TO A SCREEN READER. One polite live
   region, #sb-live (visually hidden, on <body>, so no render ever replaces it — a live region rebuilt
   with its new text is not announced). Screens mark what to say with data-live-prompt (its value, or
   the element's text without its buttons); the arcade engines, which this file does not draw, are
   read by selector (their clue line .sg-cardmean / #ss-hint, their end card). Said once per change,
   never a spelling the screen does not already show, and nothing on screen moves. */
const LIVE_STRIP=/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]\uFE0F?/gu;
let _liveEl=null, _liveSaid='';
function liveEl(){ if(_liveEl&&_liveEl.isConnected) return _liveEl; if(!document.body) return null;
  _liveEl=document.getElementById('sb-live')||document.createElement('div');
  _liveEl.id='sb-live'; _liveEl.className='sb-sr'; _liveEl.setAttribute('role','status'); _liveEl.setAttribute('aria-live','polite'); _liveEl.setAttribute('aria-atomic','true');
  if(!_liveEl.isConnected) document.body.appendChild(_liveEl); return _liveEl; }
function liveText(el){ const v=el.getAttribute&&el.getAttribute('data-live-prompt'); if(v) return v;
  const k=el.cloneNode(true); k.querySelectorAll('button,[aria-hidden="true"],svg').forEach(x=>x.remove());
  return [...k.childNodes].map(n=>(n.textContent||'').trim()).filter(Boolean).join('. '); }
function liveSay(parts){ try{ const t=parts.map(x=>String(x||'').replace(LIVE_STRIP,'').replace(/\s+/g,' ').trim()).filter(Boolean).join('. ').replace(/([.?!:;—…])\s*\.(?=\s|$)/g,'$1');
    if(t===_liveSaid) return;
    /* the same prompt with something added (a miss under its question) says only what was added */
    const say=(_liveSaid&&t.indexOf(_liveSaid)===0)?t.slice(_liveSaid.length).replace(/^[\s.]+/,''):t;
    _liveSaid=t; const el=liveEl(); if(el&&say) el.textContent=say; }catch(e){} }
function liveScan(scope){ try{ scope=scope||root; const els=[...scope.querySelectorAll('[data-live-prompt]')].filter(e=>e.getClientRects().length);
    liveSay(els.map(liveText)); }catch(e){} }
/* the arcade engines: their end card, else their clue line */
function liveScanArc(host){ try{ if(!host||!host.isConnected) return;
    const vis=e=>e&&e.getClientRects().length;
    const res=[...document.querySelectorAll('.arc-play-result [data-live-prompt]')].filter(vis);
    if(res.length){ liveSay(res.map(liveText)); return; }
    const end=host.querySelector('.sg-endcard');
    if(vis(end)){ liveSay(['.sg-end-h','.sg-end-sub','.sg-end-score','.sg-wordsum-h'].map(q=>{ const e=end.querySelector(q); return e?e.textContent:''; })); return; }
    const clue=[...host.querySelectorAll('.sg-cardmean, #ss-hint')].filter(vis).map(e=>e.textContent.trim()).filter((t,i,a)=>t&&a.indexOf(t)===i);
    if(clue.length) liveSay(['Clue: '+clue[0]]); }catch(e){} }
try{ liveEl(); }catch(e){}
window.SB_LIVE={ say:liveSay, scan:liveScan };
function callAct(act, arg, ev){ const fn=app[act]; if(typeof fn==='function') fn(arg, ev); }
/* A TAP THAT NEEDS THE WORDS WAITS FOR THEM (road to 4.5, P1.13 step 1). The boot word tier left the first screen
   (boot-lazy `words1`, first on the idle queue, which the first tap starts). Before, every action could count on it;
   now a tap in the app made before it lands is held — ONE tap; the hive loader covers the screen so a second tap has
   nothing to land on — and runs the moment the tier is in. Typing (data-inp / data-chg) never waits. WORDLESS are the
   shell's own controls (drawer, wallet, PIN, settings, the look, the child switcher, Home itself), which read no word
   and answer at once. The landing and the onboarding steps are not gated: none reads a word, and onbNext waits for
   the tier itself before it ends setup on the first word. */
const WORDLESS=new Set(['noop','openDrawer','closeDrawer','muteAll','openWallet','closeWallet','cycleMode','pinKey','pinCancel',
  'openSettings','closeSettings','setGrownOpen','setSwitchChild','setOpenCollection','pinSetup','devTap','devBannerHide','goHome','celebrateClose',
  'famMenu','famMenuClose','famSwitch','famSettings','famMine','famAdd','hqClear','nextTip','openAvDeck']);
let _wordsHeld=null;
function wordsHold(fn){ if(wordsIn()){ fn(); return true; }
  if(_wordsHeld) return false;
  _wordsHeld=fn; state.wordsWait=true; try{ render(); }catch(e){}
  lazyNeed('words1', ()=>{ const f=_wordsHeld; _wordsHeld=null; state.wordsWait=false; try{ f(); }finally{ try{ render(); }catch(e){} } });
  return false; }
/* navs that read no word record (or ask for their own group, which carries the tier): drawn before it lands */
const NAV_WORDLESS = { home:1, settings:1, collection:1, shop:1, evolution:1, help:1, trail:1, reader:1, analogy:1, anltool:1, anlbee:1, today:1,
  feed:1, mockbee:1, lore:1, hive:1, adv:1, debug:1, voicetest:1, evofeedback:1 };
function tapAct(act, arg){
  /* the lock asks for the PIN first (setNav('parent') → pinGate): the PIN reads no word, and the report card it opens
     waits for the tier itself (viewApp's NAV_WORDLESS guard) */
  if(state.screen!=='app' || WORDLESS.has(act) || (act==='setNav'&&(arg==='home'||arg==='parent')) || wordsIn()) return callAct(act, arg);
  wordsHold(()=>callAct(act, arg)); }
root.addEventListener('click', e=>{ const el=e.target.closest('[data-act]'); if(!el) return; tapAct(el.getAttribute('data-act'), el.getAttribute('data-arg')); });
root.addEventListener('dblclick', e=>{ const el=e.target.closest('[data-dbl]'); if(!el) return;
  e.preventDefault(); tapAct(el.getAttribute('data-dbl'), el.getAttribute('data-arg')); });
/* The suggestion list closes on pick, Enter, Escape and any nav change. This covers the
   last case — a click that lands somewhere else entirely. It runs on capture so it fires
   before the click's own action re-renders. */
root.addEventListener('click', e=>{ try{ if(!state.hq) return; if(e.target.closest('.sb-hsearch')) return;
  state.hq=''; state.hqSel=-1;
  /* Render on the NEXT tick, not here: this runs on capture, so re-rendering now would
     detach the element the click is still travelling towards and its action would never
     fire. Setting the state and letting the tick repaint keeps both. */
  setTimeout(()=>{ try{ render(); }catch(_){} },0); }catch(_){} }, true);
root.addEventListener('input', e=>{ const el=e.target.closest('[data-inp]'); if(!el) return; callAct(el.getAttribute('data-inp'), el.value); });
root.addEventListener('change', e=>{ const el=e.target.closest('[data-chg]'); if(!el) return; callAct(el.getAttribute('data-chg'), el.value); });
root.addEventListener('keydown', e=>{ const el=e.target.closest('[data-key]'); if(!el) return; const fn=app[el.getAttribute('data-key')]; if(fn) fn(e); });
/* Practice card view: swipe OR arrow keys, both on the app-wide d-pad —
   ← previous · ↑ deck · ↓ revise · → next. preventDefault on a handled swipe suppresses
   the ghost click. */
(function(){ let sx=0,sy=0,st=0,mode=null;
  root.addEventListener('touchstart',e=>{ const t=e.target.closest('[data-swipe]'); mode=t?t.getAttribute('data-swipe'):null; if(!mode) return; const p=e.changedTouches[0]; sx=p.clientX; sy=p.clientY; st=Date.now(); },{passive:true});
  root.addEventListener('touchend',e=>{ if(mode!=='coach') return; const p=e.changedTouches[0]; const dx=p.clientX-sx, dy=p.clientY-sy; mode=null;
    if(Date.now()-st>700) return;
    if(Math.abs(dx)>=48 && Math.abs(dx)>Math.abs(dy)*1.3){ e.preventDefault(); if(dx>0) app.cardNext(); else app.cardBack(); return; }
    if(Math.abs(dy)>=54 && Math.abs(dy)>Math.abs(dx)*1.3){ e.preventDefault(); if(dy>0) app.cardRevise(); else app.toggleCardView(); } },{passive:false}); })();
/* ESC CLOSES THE SHEET AND THE DRAWER, AND FOCUS STAYS INSIDE THEM (FIX-BEE v2, P5; standard §3).
   Topmost first: the PIN dialog, then Settings, then ☰, then the Shop. Tab and Shift+Tab wrap
   inside whichever [data-trap] layer is open, and opening one moves focus into it. */
function _trapLayer(){ const L=document.querySelectorAll('[data-trap]'); return L.length?L[L.length-1]:null; }
window.addEventListener('keydown',e=>{ try{
  if(e.key==='Escape'){
    if(state.pinDlg){ state.pinDlg=null; render(); e.preventDefault(); return; }
    if(state.settingsOpen){ app.closeSettings(); e.preventDefault(); return; }
    if(state.drawerOpen){ state.drawerOpen=false; render(); e.preventDefault(); try{ const m=document.querySelector('[data-act="openDrawer"]'); if(m) m.focus(); }catch(_){} return; }
    if(state.walletOpen){ state.walletOpen=false; render(); e.preventDefault(); return; }
    return; }
  if(e.key!=='Tab') return; const box=_trapLayer(); if(!box) return;
  const f=[...box.querySelectorAll('button,[href],input,select,textarea,summary,[tabindex]:not([tabindex="-1"])')].filter(x=>!x.disabled&&x.offsetParent!==null);
  if(!f.length) return; const first=f[0], last=f[f.length-1];
  if(!box.contains(document.activeElement)){ e.preventDefault(); first.focus(); return; }
  if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
  else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); }
}catch(_){} }, true);
/* THE GROWN-UP PIN PAD TYPES FROM A KEYBOARD (FIX2 #7). It was tap-only: a grown-up at a laptop
   had to click four digits. Now, whenever the PIN dialog is up — entering a PIN or choosing one —
   the top-row digits and the numpad type (by e.code too, so a numpad with Num Lock off still
   works), Backspace/Delete takes one back, and Escape cancels (above). Enter and Space press only a
   key of the pad that has focus; anywhere else they are swallowed, so they can never press a button
   hidden under the dialog. Every key the dialog handles stops here — a digit must not also land in
   a spelling box or a game underneath. The touch pad is unchanged. */
window.addEventListener('keydown',e=>{ try{
  if(!state.pinDlg || e.ctrlKey || e.metaKey || e.altKey) return;
  const m=/^Numpad(\d)$/.exec(e.code||''); const d=/^\d$/.test(e.key)?e.key:(m?m[1]:null);
  const inPad=!!(e.target && e.target.closest && e.target.closest('[data-pin-dlg]'));
  if(d!=null){ app.pinKey(d); }
  else if(e.key==='Backspace'||e.key==='Delete'){ app.pinKey('del'); }
  else if((e.key==='Enter'||e.key===' ') && inPad){ return; }   /* a focused key of the pad: let it press */
  else if(e.key==='Enter'||e.key===' '){}
  else return;
  e.preventDefault(); e.stopImmediatePropagation();
}catch(_){} }, true);
let _trapWas='';
/* A re-render (a lazy file landing, the music arriving) rebuilds the layer and drops focus to <body>;
   the focused control is remembered by its place in the layer and given back, so Tab never escapes. */
let _trapFocusIdx=-1;
document.addEventListener('focusin',e=>{ try{ const box=_trapLayer(); if(box&&box.contains(e.target)){ _trapFocusIdx=[...box.querySelectorAll('button,[href],input,select')].indexOf(e.target); } }catch(_){} });
function trapFocusAfterRender(){ try{ const box=_trapLayer(); const k=box?box.getAttribute('data-trap'):'';
  if(k&&!box.contains(document.activeElement)){ const all=box.querySelectorAll('button,[href],input,select');
    const f=(k===_trapWas&&_trapFocusIdx>=0&&all[_trapFocusIdx])||all[0]; if(f) f.focus({preventScroll:true}); }
  if(k!==_trapWas) _trapFocusIdx=-1; _trapWas=k; }catch(e){} }
window.addEventListener('keydown',e=>{ try{ if(!state.coachCardView||state.cardDone||state.pinDlg||state.settingsOpen||state.showTiers) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  const k=e.key;
  if(k==='ArrowRight'){ e.preventDefault(); app.cardNext(); }
  else if(k==='ArrowLeft'){ e.preventDefault(); app.cardBack(); }
  else if(k==='ArrowUp'){ e.preventDefault(); app.toggleCardView(); }
  else if(k==='ArrowDown'){ e.preventDefault(); app.cardRevise(); } }catch(err){} });
/* The other two card decks — Vocabulary and Idioms & Similes — take the same d-pad:
   ← previous · ↑ back to the deck · → next, space/enter to flip. (Neither has a revision
   pile of its own, so ↓ is left alone there.) */
window.addEventListener('keydown',e=>{ try{
  if(state.pinDlg||state.settingsOpen||state.showTiers) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  const k=e.key;
  /* the vocabulary check owns the keyboard while it is open: 1-4 pick a meaning, Enter
     advances, Escape returns to the cards. Card navigation must not fire underneath it. */
  if(state.nav==='vocab'&&state.vocCheck){ const g=state.vocCheck;
    if(k==='Escape'){ e.preventDefault(); app.vocCheckClose(); return; }
    if(g.done) return;
    if(/^[1-4]$/.test(k)){ e.preventDefault(); app.vocPick(+k-1); return; }
    if(k==='Enter'||k===' '){ e.preventDefault(); if(g.picked!=null) app.vocNext(); return; }
    return; }
  const inVoc=state.nav==='vocab'&&state.vocDeck; const inFig=state.nav==='figurative'&&state.figDeck;
  if(!inVoc&&!inFig) return;
  const nav=inVoc?app.vocNav:app.figNav, back=inVoc?app.vocBack:app.figBackToDecks, flip=inVoc?app.vocFlip:app.figFlip;
  if(k==='ArrowLeft'){ e.preventDefault(); nav(-1); }
  else if(k==='ArrowRight'){ e.preventDefault(); nav(1); }
  else if(k==='ArrowUp'){ e.preventDefault(); back(); }
  else if(k===' '||k==='Enter'){ e.preventDefault(); flip(); }
}catch(err){} });
/* Quotes deck: ← → to move between quotes */
/* Trivia Training keys mirror the on-screen d-pad exactly: ← previous, ↑ deck,
   ↓ reveal the answer, → next. Space/enter also reveals. (Touch and keyboard both, always.) */
window.addEventListener('keydown',e=>{ try{
  if(state.nav!=='trivtrain'||!state.tt||state.pinDlg||state.settingsOpen||state.showTiers) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const k=e.key;
  if(k==='ArrowLeft'){ e.preventDefault(); app.ttNav(-1); }
  else if(k==='ArrowRight'){ e.preventDefault(); app.ttNav(1); }
  else if(k==='ArrowUp'){ e.preventDefault(); app.ttBack(); }
  else if(k==='ArrowDown'){ e.preventDefault(); app.ttFlip(); }
  else if(k===' '||k==='Enter'){ e.preventDefault(); app.ttFlip(); }
}catch(_){} });
/* Sound Alphabet hotkeys: 1–4 answer, R hears the word, Enter/Space advances */
window.addEventListener('keydown',e=>{ try{
  if(state.nav!=='ipatrain'||!state.it||state.it.mode==='learn'||state.pinDlg||state.settingsOpen) return;
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  const it=state.it;
  if(e.key>='1'&&e.key<='4'&&!it.done&&it.picked==null){ e.preventDefault(); app.itPick(String(+e.key-1)); }
  else if((e.key==='Enter'||e.key===' ')&&!it.done&&it.picked!=null){ e.preventDefault(); app.itNext(); }
  else if(e.key==='r'||e.key==='R'){ e.preventDefault(); app.itSay(); }
}catch(_){} });
window.addEventListener('keydown',e=>{ try{ if(state.nav!=='quotes'||state.pinDlg||state.settingsOpen) return;
  const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  if(e.key==='ArrowRight'){ e.preventDefault(); app.qNav(1); } else if(e.key==='ArrowLeft'){ e.preventDefault(); app.qNav(-1); } }catch(err){} });
/* game hotkeys: 1–4 pick an answer, R repeats the word, D shows the hint (never while typing) */
window.addEventListener('keydown', e=>{ try{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  const g=state.game; if(!g || state.nav!=='games' || state.pinDlg || state.settingsOpen) return;
  if(g.qs && g.picked!=null && g.mcGo && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); app.gMcNext(); return; }   // a held miss moves on with Enter
  if(g.qs && g.picked==null && g.status==='play'){
    if(e.key>='1'&&e.key<='4'){ const q=g.qs[g.i]; if(q && q.choices[+e.key-1]!=null){ e.preventDefault(); app.gPick(String(+e.key-1)); } return; }
    if(e.key==='r'||e.key==='R'){ e.preventDefault(); app.gSayQ(); return; } }
  if(g.list && !g.qs && g.status==='play'){
    if(e.key==='r'||e.key==='R'){ e.preventDefault(); app.gSay(); return; }
    if(e.key==='d'||e.key==='D'){ e.preventDefault(); app.gInfoToggle(); return; } }
}catch(err){} });

/* ===================== init ===================== */
/* boot-lazy hand-off. The heavy feature data (etymology, the concept course, the
   Word Atlas curriculum, the sound tables, the quote and figurative libraries)
   now arrives after first paint, so anything this file memoised in the meantime
   is built from an empty pool. Drop the stale caches when a file lands and let
   boot-lazy's render rebuild them. */
window.addEventListener('sb-lazy', e => { const name = e && e.detail;
  if(name==='concepts'||name==='advConcepts'){ state.conceptData=null; state.conceptLoading=false; state._cchap=null;
    try{ loadConcepts(); }catch(err){} }
  if(name==='sounds'){ _homIdx=null; _sndCache=null; }
  if(name==='lore'||name==='pron'){ _wIdx=null; }
  if(name==='fig'){ try{ window._figAll=null; }catch(err){} }
  if(name==='voiceWords'){ _wvSet=null; }
  if(name==='lessons'||name==='vocab26'||name==='finals500'||name==='scripps'){ _catStatic=null; _wIdx=null; _wohPool=null; }
  if(name==='lore'){ _wdb=null; }
  /* The second word shard quadruples the library, so every pool derived from it
     is stale: the catalogue, the word index, the theme classifications, the
     word-of-the-hour pool and the sound lists all rebuild on the next render. */
  if(name==='words2'){ _catStatic=null; _wIdx=null; _wohPool=null; _wdb=null; _sndCache=null; _themeCache={}; }
  if(name==='wordband'||name==='words2'){ _wohBand={}; _nwBy=null; }   /* the word bands (P1.1): every band-keyed pool rebuilds */
  /* THE BOOT WORD TIER LANDED (P1.13 step 1: words-data.js + words-extra.js + words-patch.js, one bundle). Score its
     records first, the way Home's first render always did (trickSeal: no homophone bonus — every list order a returning
     speller ever saw was built on these scores), then drop EVERY pool that could have been built without it. Nothing
     that starts a drill ran before this (callAct's gate), but a count, a search or a list may have been drawn. */
  if(name==='words1'){ try{ trickSeal(); }catch(err){}
    _catStatic=null; _wIdx=null; _wohPool=null; _wdb=null; _nwIdx=null; _corpusBands=null; _b2Idx=null; _sndCache=null; _themeCache={};
    for(const k in _stageCache) delete _stageCache[k];
    _defStages=null; _journeySorted=null; _journeyOrder=null; _journeyStages=null; _eponStages=null; _nwBy=null;
    for(const k in _wohBand) if(k.indexOf('seed')!==0) delete _wohBand[k]; }
});

(function init(){
  /* THE HOUSEHOLD COMES THROUGH THE SEAM (store.js, FIX-BEE N4). loadHousehold() has already run
     the versioned steps — the concept-index shift, the test-coin reset, the accessory, world-cut
     and Aurora refunds, and the per-child mastery copy, which used to be ad-hoc blocks right
     here — exactly once per household, in the order they always ran. Add a step there, never a
     block here. */
  try{ const s=SB_STORE.loadHousehold(); if(s){
    state.theme=s.theme||'spellbound'; state.modePref=s.mp||null; state.mode=s.mp?effectiveMode(s.mp):(s.mode||'light'); state.premium=!!s.premium; state.parentPin=s.pin||null; state.voiceRate=s.vr||1; state.textSize=s.tz||'normal'; state.readAloud=!!s.ra; state.a11yFont=s.af||'std'; state.a11yContrast=!!s.ac; state.a11yMotion=!!s.am; state.calmMode=!!s.cm; window.SB_CALM=!!s.cm; state.feedOff=!!s.fo;
    state.children=s.children||[]; state.activeIdx=s.activeIdx||0; state.goalDone=s.goalDone||0;
    state.luMastered=s.lu||{}; state.coachSrs=s.srs||{}; state.coachHistory=s.chist||{}; state.wordReports=s.wr||[];
    try{ state.children.forEach(ensureLists); }catch(e){}
    try{ syncMissed(); }catch(e){}
    try{ mastBoot(s.lu); }catch(e){}   // FIX-BEE D5: mastery from evidence (c.mast); luMastered is derived from it
    state.screen=(s.children&&s.children.length)?'app':'landing'; state.nav='home';
  } }catch(e){}
  try{ if(SB_STORE.get('devunlock')==='1'){ state.devUnlock=true; state.premium=true; } }catch(e){}
  try{ if(SB_STORE.get('tester')==='1') state.tester=true; }catch(e){}   /* tester mode, the grown-up's (the analogy gate) */
  /* (the test-coin reset and the accessory, world-cut and Aurora refunds are store.js steps
     v2_to_v3 … v5_to_v6 now; the flashes below still read the receipts they leave on a child) */
  /* FIX-BEE: Bee coins become Bizzing coins, 1:1, once per child (walletSync). It runs AFTER
     the refunds above on purpose: money handed back for a withdrawn world or accessory is
     the child's, and moves into the family wallet with the rest. From here on c.coins is a
     mirror of the wallet. Guard: tests/wallet-coins.cjs (boots twice, pays once). */
  try{ (state.children||[]).forEach(ch=>walletSync(ch)); }catch(e){}
  try{ loadVoiceCfg(); }catch(e){}
  try{ loadEvoFB(); }catch(e){}
  try{ loadVoices(); window.speechSynthesis.onvoiceschanged=loadVoices; }catch(e){}
  /* Back and deep links (FIX-BEE B6). The old trap pushed one dummy entry and sent every Back
     to Home; now every screen has a hash route (family-shell.js), Back retraces them, and the
     bottom of the stack climbs back onto the first screen instead of leaving the app. The same
     file carries the top bar's family pieces and the Hive feed, which starts here once a child
     is known (onboarding starts it for a first child). */
  try{ SB_SHELL.install(); SB_SHELL.boot(); SB_SHELL.startActivity(); }catch(e){}
  /* Start the daily-target clock. It self-gates on tab visibility, and flushes on the way
     out so the last partial minute isn't lost. */
  try{ setInterval(metricTick, METRIC_TICK*1000);
    document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'){
      try{ if(state._metricSaveT){ clearTimeout(state._metricSaveT); state._metricSaveT=null; } save(); }catch(e){} } });
    window.addEventListener('pagehide',()=>{ try{ save(); }catch(e){} });
  }catch(e){}
  /* Say so, once — a purse that quietly grows is a bug from where the child is sitting. */
  try{ const _c=state.children&&state.children[state.activeIdx];
    if(_c && _c.accRefund){ const _n=_c.accRefund; delete _c.accRefund; save();
      setTimeout(()=>{ try{ flash('Bee style has been retired — '+_n+' 🪙 refunded to your purse'); }catch(e){} }, 1400); }
    if(_c && _c.auroraRefund){ const _a=_c.auroraRefund; delete _c.auroraRefund; save();
      setTimeout(()=>{ try{ flash('Aurora is free for everyone now — '+_a+' 🪙 back in your purse'); }catch(e){} }, 1600); }
    if(_c && _c.worldRefund){ const _w=_c.worldRefund; delete _c.worldRefund; save();
      setTimeout(()=>{ try{ flash('Some worlds have been retired — '+_w+' 🪙 refunded to your purse'); }catch(e){} }, 1800); }
  }catch(e){}
  render();
})();

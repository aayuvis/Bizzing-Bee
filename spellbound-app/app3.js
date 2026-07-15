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
  coachTargetLabel:'Tricky review', coachTargetKey:'review', coachSrs:{}, coachHistory:{}, coachBestRounds:0,
  customText:'', customWords:[], enrichResult:'', aiPrompt:'', aiWords:[], aiLabel:'', aiLoading:false, aiError:'',
  coachSession:false, trainBack:'home', wr:null, or:null, wrInfoKey:'', orInfoKey:'', orFeedback:'',
  drawerOpen:false,
  luTab:'revise', luWordsOpen:false, luMastered:{}, reviseIdx:0, conceptWordIdx:0, heatReveal:false,
  game:null, gInfo:false, sound:true, parentLogOpen:null, shopTab:'worlds', evoSel:null,
  lessonSel:null, lessonWordsOpen:false,
};
/* ---- Word Journeys: 100 etymology lessons (premium) ---- */
const PATTERN_DONE_PCT = 0.7;   // a concept or lesson counts as "done" once 70% of its words are mastered
function lessonsAll(){ return (window.SB_LESSONS&&SB_LESSONS.lessons)||[]; }
function lessonUnits(){ return (window.SB_LESSONS&&SB_LESSONS.units)||[]; }
function lessonComplete(L){ const ms=state.luMastered||{}; const ws=(L.words||[]).filter(w=>w&&w.w); if(!ws.length) return false; const m=ws.filter(w=>ms[nkey(w.w)]).length; return m/ws.length>=PATTERN_DONE_PCT; } // done at 70%
function lessonsDoneCount(){ return lessonsAll().filter(L=>lessonComplete(L)).length; }
// light markdown: escape, then **bold** / *italic*
function mdInline(t){ return esc(t||'').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<i>$1</i>'); }
// map a lesson's 5 words to full word objects (enriched from the 128k DB; etymology kept as the hook)
function lessonWordObjs(L){ const db=wordDB(); return (L.words||[]).map(w=>{ const hit=db.get(nkey(w.w));
  const etyArr=(w.ety||[]); const ety=etyArr.join(' ');
  return { w:w.w, d:(hit&&hit.d)||'', s:(hit&&hit.s)||'', p:(hit&&hit.p)||w.pron||'', o:(hit&&hit.o)||'', r:ety, etyArr, y:(hit&&hit.y)||3, sy:(hit&&hit.sy)||w.syll||'', h:ety, bp:(hit&&hit.bp) }; }); }
/* ---- design-feedback store for the 80 evolution tiles (dev/design tool) ---- */
let EVOFB = {};
function loadEvoFB(){ try{ const r=localStorage.getItem('sb_evofeedback'); if(r) EVOFB=JSON.parse(r)||{}; }catch(e){} }
function saveEvoFB(){ try{ localStorage.setItem('sb_evofeedback', JSON.stringify(EVOFB)); }catch(e){} }
const LEVEL_WORDS = WORDS; // the current level's word list
/* ---- Default track: a 20-stage curriculum that gets longer & tougher as you climb ----
   Built once from the real library (40k words), sorted by difficulty tier then length, then
   sliced into 20 stages with growing word counts (14 → 52). Mastering a stage unlocks the next. */
const STAGE_NAMES = ['Sprout','Seedling','Sapling','Climber','Explorer','Voyager','Scholar','Wordsmith','Linguist','Adept','Tactician','Strategist','Virtuoso','Maven','Sage','Luminary','Champion','Grandmaster','Prodigy','Legend'];
const DEFAULT_STAGE_COUNT = 20;
let _defStages = null;
function defaultStages(){ if(_defStages) return _defStages;
  const nsf=(window.SB_DATA&&SB_DATA.nsf)||[];
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
function themeDefs(){ return (window.SB_THEMES&&SB_THEMES.themes)||[]; }
function themeClusters(){ return (window.SB_THEMES&&SB_THEMES.clusters)||[]; }
function themeOf(id){ return themeDefs().find(t=>t.id===id); }
let _themeCache={};
// The pool themes classify over: the 40k core library normally, deepening to the full 128k
// library automatically once it has been loaded (via "Entire library"). Cache keys on pool size.
function themePool(){ const full=window.SB_FULL; return (full&&full.length)?full:((window.SB_DATA&&SB_DATA.nsf)||[]); }
function themeWords(id){ const pool=themePool();
  const hit=_themeCache[id]; if(hit && hit._n===pool.length) return hit;
  const t=themeOf(id); if(!t) return [];
  // Fast path: the base JSON is enriched with baked theme tags (w.t). The keyword classifier
  // remains as a fallback for any word without tags (e.g. custom/pasted words).
  let re=null; try{ re=new RegExp(t.re,'i'); }catch(e){}
  const out=[];
  for(const w of pool){ if(!w||!w.w) continue;
    if(w.t){ if(w.t.indexOf(id)>=0) out.push(w); }
    else if(re && w.d && re.test(w.d)) out.push(w); }
  out._n=pool.length; _themeCache[id]=out; return out; }
function themeKey(id){ return 'th_'+id; }
function isThemeKey(key){ return typeof key==='string' && key.slice(0,3)==='th_'; }
function themeStat(id){ const ws=themeWords(id); const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length; return {total:ws.length, m, pct:ws.length?Math.round(m/ws.length*100):0}; }
function myThemes(){ const c=active(); const pins=c.pinnedLists||{}; return themeDefs().filter(t=>pins[themeKey(t.id)]); }
function rawListWords(key){ if(key==='journey') return journeySorted(); if(isThemeKey(key)) return themeWords(key.slice(3)); const cat=coachCatalog().find(c=>c.key===key); return (cat&&cat.words&&cat.words.length)?cat.words:WORDS; }
function listStages(key){
  if(key==='default') return defaultStages();
  if(key==='journey') return journeyStages();
  const raw=rawListWords(key); const cached=_stageCache[key];
  if(!_DYNAMIC_LISTS[key] && cached && cached._n===raw.length) return cached;
  const sorted=raw.filter(w=>w&&w.w).sort((a,b)=> ((a.y||3)-(b.y||3)) || (a.w.length-b.w.length) || ((b.bp||0)-(a.bp||0)) );
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

/* ===== The Bizzing Bee Journey — ONE Level ladder.
   Levels 1–20 = "Bizzing Bee Champ": the ~1,600 highest-value bee words, ramped easy→hard.
   Levels 21+  = "The Champion's Library": the rest of the 40,000, 120 a level (Premium).
   You climb a Level by mastering its words OR passing its Champ Challenge (test-out). ===== */
const CHAMP_LEVELS = 20;
const LIB_LEVEL_SIZE = 120;
const champLevelSize = (k) => 24 + (k-1)*6;                 // L1=24 … L20=138  (~1,620 total)
let _champWordCount = null;
function champWordCount(){ if(_champWordCount!=null) return _champWordCount; let s=0; for(let k=1;k<=CHAMP_LEVELS;k++) s+=champLevelSize(k); _champWordCount=s; return s; }
let _journeySorted = null;
function journeySorted(){ if(_journeySorted) return _journeySorted;
  const src=(window.SB_DATA&&SB_DATA.nsf)||[]; const seen=new Set(); const pool=[];
  for(const w of src){ if(!w||!w.w) continue; const k=nkey(w.w); if(seen.has(k)) continue; seen.add(k); pool.push(w); }
  pool.sort((a,b)=> ((a.y||3)-(b.y||3)) || ((b.bp||0)-(a.bp||0)) || (a.w.length-b.w.length) ); // easy→hard
  _journeySorted=pool; return pool; }
let _journeyOrder = null;
function journeyOrder(){ if(_journeyOrder) return _journeyOrder;
  const all=journeySorted();
  const byBp=all.slice().sort((a,b)=> ((b.bp||0)-(a.bp||0)) || ((a.y||3)-(b.y||3)) ); // most bee-relevant first
  const champ=byBp.slice(0, champWordCount());
  champ.sort((a,b)=> ((a.y||3)-(b.y||3)) || (a.w.length-b.w.length) || ((b.bp||0)-(a.bp||0)) ); // ramp the champ band easy→hard
  const champSet=new Set(champ.map(w=>nkey(w.w)));
  const rest=all.filter(w=>!champSet.has(nkey(w.w)));     // already easy→hard
  _journeyOrder={champ,rest}; return _journeyOrder; }
let _journeyStages = null;
function journeyStages(){ if(_journeyStages) return _journeyStages;
  const {champ,rest}=journeyOrder(); const stages=[]; let i=0;
  for(let k=1;k<=CHAMP_LEVELS;k++){ const sz=champLevelSize(k); stages.push({ n:k, label:'Level '+k, words:champ.slice(i,i+sz), champ:true }); i+=sz; }
  // Sprinkle the Scripps championship words across the toughest Champ levels (15–20).
  const scripps=(window.SB_SCRIPPS||[]);
  if(scripps.length){ const seen=new Set(); stages.forEach(s=>(s.words||[]).forEach(w=>seen.add(nkey(w.w))));
    const fresh=scripps.filter(w=>w&&w.w&&!seen.has(nkey(w.w)));
    const startLvl=15, span=CHAMP_LEVELS-startLvl+1; // 15..20 → 6 levels
    fresh.forEach((w,ix)=>{ stages[startLvl-1+(ix%span)].words.push(w); }); }
  for(let j=0;j<rest.length;j+=LIB_LEVEL_SIZE){ const n=stages.length+1; stages.push({ n, label:'Library '+(n-CHAMP_LEVELS), words:rest.slice(j,j+LIB_LEVEL_SIZE), champ:false }); }
  stages._n=journeySorted().length; _journeyStages=stages; return _journeyStages; }
function journeyTotal(){ return journeySorted().length; }
// avatar form (0–9) from a journey level: evolve across the 20 Champ levels, then hold at Champ form
function journeyFormIdx(level){ return Math.max(0, Math.min(9, Math.floor((level-1)/2))); }
function isChampDone(c){ c=c||active(); return (getList(c,'journey').stage||0) >= CHAMP_LEVELS; } // cleared all 20 champ levels
function journeyMastered(c){ c=c||active(); const arr=journeySorted(); let m=0; for(let i=0;i<arr.length;i++){ if(state.luMastered[nkey(arr[i].w)]) m++; } return m; }
// words contained in levels up to & including the current one = the "reached" frontier
function journeyReached(c){ c=c||active(); const st=journeyStages(); const idx=listStageIdx(c,'journey'); let s=0; for(let i=0;i<=idx&&i<st.length;i++) s+=st[i].words.length; return s; }

/* ---------------- helpers ---------------- */
const esc = (s) => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escA = (s) => esc(s).replace(/"/g,'&quot;');
// escape text, then hide the target word (and simple inflections) behind a fill-in blank
function blankHTML(text, word){
  const t = esc(text||''); const w = (word||'').trim(); if(!w) return t;
  let re; try{ re = new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','gi'); }catch(e){ return t; }
  return t.replace(re, '<span style="display:inline-block;min-width:58px;border-bottom:2px solid var(--accent);vertical-align:baseline">&nbsp;</span>');
}
const trunc = (s,n) => { s=s||''; return s.length>n ? esc(s.slice(0,n).replace(/\s+\S*$/,''))+'…' : esc(s); };
const fmtN = (n) => String(n==null?'':n).replace(/\B(?=(\d{3})+(?!\d))/g,',');
function set(patch){ Object.assign(state, patch); render(); }
let _toastTimer = null;
function flash(msg){ state.toast = msg; scheduleToast(); render(); }
function scheduleToast(ms){ clearTimeout(_toastTimer); _toastTimer = setTimeout(() => { state.toast=''; render(); }, ms||2200); }

const nkey = (w) => (w||'').toLowerCase().trim();
const sample = (arr,n) => { const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i];a[i]=a[j];a[j]=t; } return n?a.slice(0,n):a; };
const judgeWord = (val,w) => (val||'').trim().toLowerCase() === ((w&&w.w)||'').toLowerCase();
const demo = () => ({ name:'Speller', age:9, avatar:'bee', theme:'spellbound', level:1, streak:0, acc:0, goal:10, week:[0,0,0,0,0,0,0], xp:0 });
const active = () => { const c = state.children[state.activeIdx] || demo(); ensureLists(c); return c; };
const curWord = () => { const L=(state.sessionWords&&state.sessionWords.length)?state.sessionWords:WORDS; return L[state.gi % L.length]; };
const formIdx = (lvl) => Math.min(9, Math.max(0, Math.ceil((lvl||1)/2)-1));
const milestone = () => { const c=active(); let m=c.milestone; if((!m||!m.date) && state.coachDate) m={label:(m&&m.label)||'the bee', date:state.coachDate};
  if(!m||!m.date) return null; const d=Math.ceil((new Date(m.date+'T00:00:00') - new Date())/86400000);
  return d>=0?{ days:d, label:m.label||'the bee', date:m.date }:null; };
/* ---- Lists (tracks): per-list Karma/level; mastery stays global (word knowledge) ---- */
const FREE_LEVEL_CAP = 5; const WORK_MAX = 40;
/* Leveling curve: easy at first, then near-exponential — each level needs more Karma than the last.
   xpToNext(L) = round(3 · 1.45^(L-1))  →  3, 4, 6, 9, 13, 19, 28, 40, 58, 85 … */
const XP_BASE = 5, XP_GROWTH = 1.6;
function xpToNext(level){ return Math.max(1, Math.round(XP_BASE * Math.pow(XP_GROWTH, (level||1)-1))); }
function levelFromXp(xp){ xp=Math.max(0, xp||0); let lvl=1, need=xpToNext(1); while(xp>=need){ xp-=need; lvl++; need=xpToNext(lvl); } return { level:lvl, into:xp, need:need }; }
function ensureLists(c){ if(!c) return c; if(!c.lists){ c.lists = { default:{ xp: (c.xp||0) }, journey:{xp:0} }; } if(!c.activeList) c.activeList='journey'; if(!c.lists.journey) c.lists.journey={xp:0}; if(!c.lists[c.activeList]) c.lists[c.activeList]={xp:0};
  if(c.coins==null) c.coins=0; if(!c.unlockedThemes) c.unlockedThemes=[c.theme||'spellbound']; if(!c.unlockedLists) c.unlockedLists={}; if(!c.gameLog) c.gameLog=[]; if(!c.pinnedLists) c.pinnedLists={};
  if(!c.missed) c.missed=[]; if(!c.activity) c.activity=[]; if(!c.unlockedConcepts) c.unlockedConcepts={};
  if(!c.daysPlayed) c.daysPlayed=[]; if(!c.streakRewards) c.streakRewards={}; if(!c.listNames) c.listNames={}; if(c.journeyDay==null) c.journeyDay=0; return c; }
/* ---- coins economy: earn by playing, spend on boosts / lists / themes ---- */
const COST = { theme:400, list:250, boost:200, concept:150 };
/* Theme tiers: 2 open free, +2 with Premium, the rest are earn-with-coins for everyone. */
const FREE_THEMES = ['spellbound','marquee'];          // open from the start
const PREMIUM_THEMES = ['aurora','anime'];             // included with Premium
function coinsOf(){ return active().coins||0; }
function addCoins(n){ if(!n) return; const c=active(); c.coins=(c.coins||0)+n; sfx('coin'); }
function spendCoins(n){ const c=active(); if((c.coins||0)<n) return false; c.coins-=n; return true; }
function isThemeUnlocked(id){ if(state.devUnlock) return true; if(FREE_THEMES.indexOf(id)>=0) return true; if(state.premium && PREMIUM_THEMES.indexOf(id)>=0) return true; return (active().unlockedThemes||[]).indexOf(id)>=0; }
function isListUnlocked(key){ if(state.devUnlock) return true; if(!isPremiumList(key)||state.premium) return true; return !!(active().unlockedLists||{})[key]; }
/* Concepts: all locked on free; Premium opens the easier 50%; the rest are coin-unlocks. */
function conceptHalf(){ const n=(state.conceptData||SB_CONCEPTS.chapters||[]).length; return Math.ceil(n/2); }
function isConceptUnlocked(ci){ if(state.devUnlock) return true; const ch=(state.conceptData||SB_CONCEPTS.chapters||[])[ci]; if(ch && catGroup(ch.category)==='Basics') return true; if((active().unlockedConcepts||{})[ci]) return true; if(state.premium && ci<conceptHalf()) return true; return false; }
// Levenshtein distance (for "so close!" near-miss feedback)
function lev(a,b){ a=a||''; b=b||''; const m=a.length,n=b.length; if(!m) return n; if(!n) return m; const d=Array.from({length:m+1},(_,i)=>[i].concat(new Array(n).fill(0)));
  for(let j=0;j<=n;j++) d[0][j]=j;
  for(let i=1;i<=m;i++) for(let j=1;j<=n;j++){ const c=a[i-1]===b[j-1]?0:1; d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c); }
  return d[m][n]; }
function now(){ try{ return Date.now(); }catch(e){ return 0; } }
/* ---- daily streak: count consecutive days with at least one finished session ---- */
function todayKey(){ try{ const d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }catch(e){ return '2026-01-01'; } }
function dayDiff(a,b){ if(!a||!b) return 99; const pa=a.split('-').map(Number), pb=b.split('-').map(Number); return Math.round((Date.UTC(pb[0],pb[1]-1,pb[2])-Date.UTC(pa[0],pa[1]-1,pa[2]))/86400000); }
const STREAK_REWARDS={3:15,7:40,14:100,30:300};
function markActiveToday(){ const c=active(); if(!c) return; const t=todayKey();
  if(!c.daysPlayed) c.daysPlayed=[]; if(c.daysPlayed.indexOf(t)<0){ c.daysPlayed.push(t); if(c.daysPlayed.length>140) c.daysPlayed=c.daysPlayed.slice(-140); }
  if(c.lastActiveDay===t) return; // already counted today
  const d=dayDiff(c.lastActiveDay, t);
  if(!c.lastActiveDay) c.streak=Math.max(1, c.streak||0);   // legacy profiles: never wipe an existing streak
  else if(d===1) c.streak=(c.streak||0)+1;
  else if(d===2 && (c.freezes||0)>0){ c.freezes--; c.streak=(c.streak||0)+1; try{ flash('🧊 Streak Freeze used — your '+c.streak+'-day streak survives!'); }catch(e){} }
  else if(d>1) c.streak=1; else c.streak=(c.streak||1);
  c.lastActiveDay=t; c.streakBest=Math.max(c.streakBest||0, c.streak||1);
  if(!c.streakRewards) c.streakRewards={}; const rw=STREAK_REWARDS[c.streak];
  if(rw && !c.streakRewards[c.streak]){ c.streakRewards[c.streak]=1; addCoins(rw); state.toast='🔥 '+c.streak+'-day streak! +'+rw+' coins'; scheduleToast(2800); sfx('win'); burstConfetti(80); }
}
/* ---- misses: persist per-child to a revise list (with counts) AND the working pool ---- */
function addMiss(w){ if(!w||!w.w) return; const c=active(); if(!c.missed) c.missed=[]; const k=nkey(w.w);
  const ex=c.missed.find(x=>nkey(x.w)===k);
  if(ex){ ex.n=(ex.n||1)+1; ex.ts=now(); } else { c.missed.unshift({w:w.w,d:w.d||'',s:w.s||'',p:w.p||'',o:w.o||'',r:w.r||'',y:w.y||3,n:1,ts:now()}); }
  if(c.missed.length>200) c.missed=c.missed.slice(0,200);
  const cur=(state.missedWords||[]).filter(x=>nkey(x.w)!==k); cur.unshift(w); state.missedWords=cur.slice(0,60); }
function clearMiss(key){ key=nkey(key); const c=active(); if(c.missed) c.missed=c.missed.filter(x=>nkey(x.w)!==key); state.missedWords=(state.missedWords||[]).filter(x=>nkey(x.w)!==key); }
function syncMissed(){ const c=active(); state.missedWords=((c&&c.missed)||[]).slice(0,60); }
/* ---- parental activity log: one high-level entry per finished session, tap to expand ---- */
function logActivity(kind, label, stats, misses){ const c=active(); if(!c.activity) c.activity=[]; markActiveToday();
  c.activity.unshift({ kind, label, ts:now(),
    done:(stats&&stats.done)||0, right:(stats&&stats.right)||0, coins:(stats&&stats.coins)||0,
    misses:(misses||[]).map(m=>(m&&m.w)?m.w:m).filter(Boolean).slice(0,20) });
  if(c.activity.length>120) c.activity=c.activity.slice(0,120); }
function fmtAgo(ts){ if(!ts) return ''; const s=Math.max(0,Math.floor((now()-ts)/1000));
  if(s<60) return 'just now'; const m=Math.floor(s/60); if(m<60) return m+'m ago'; const h=Math.floor(m/60); if(h<24) return h+'h ago'; const d=Math.floor(h/24); return d+'d ago'; }
const ACT_LABEL = { trivia:'Bee Trivia', practice:'Practice', buzz:'10-Word Warm-Up', beat:'Beat the Buzzer', boss:'Boss Battle', meaning:'Meaning Match', spell:'Spot the Spelling', origin:'Origin Detective', magic:'Magic Squares', written:'Written round', oral:'Oral elimination', concept:'Concept study' };
function getList(c,key){ ensureLists(c); if(!c.lists[key]) c.lists[key]={xp:0}; return c.lists[key]; }
function levelCap(){ return (state.premium||state.devUnlock) ? Infinity : FREE_LEVEL_CAP; }
function listLevelRaw(c,key){ return levelFromXp(getList(c,key).xp||0).level; }
function listProgress(c,key){ return levelFromXp(getList(c,key).xp||0); } // {level,into,need}
function listLevel(c,key){ return Math.min(listLevelRaw(c,key), levelCap()); }
function activeListKey(){ return (active().activeList)||'default'; }
function heroLevel(c){ ensureLists(c); const ls=Object.keys(c.lists||{}).map(k=>listLevel(c,k)); return Math.max(1, ...(ls.length?ls:[1])); } // evolution never demotes when you switch lists
function overallLevel(c){ ensureLists(c); const ks=Object.keys(c.lists||{}); if(!ks.length) return 1; const ls=ks.map(k=>listLevel(c,k)); const best=Math.max(...ls); const avg=ls.reduce((a,b)=>a+b,0)/ls.length; return Math.max(1, Math.round(best*0.6 + avg*0.4)); }
function listBaseLabel(key){ if(key==='default') return 'Default · Level-Up'; if(key==='journey') return 'The Bizzing Bee Journey'; if(isThemeKey(key)){ const t=themeOf(key.slice(3)); if(t) return t.label; } const cat=coachCatalog().find(c=>c.key===key); return cat?cat.label:key; }
function listLabel(key){ const custom=((active().listNames)||{})[key]; return custom||listBaseLabel(key); }
function listWords(key){ return stageWords(key); }            // current stage's words (staged progression)
function listFullWords(key){ if(key==='default') return defaultStages().reduce((a,s)=>a.concat(s.words),[]); return rawListWords(key); }
function workingSet(key){ const ws=listWords(key);
  // a session is "what you still need": every unmastered word of this Level (up to 36),
  // so finishing sessions always converges on the level-up — mastered words only return once none remain
  const un=ws.filter(w=>!state.luMastered[nkey(w.w)]);
  if(un.length) return un.slice(0,36);
  return ws.length<=36?ws.slice():sample(ws,36); }
// bee-likelihood as 5 dots (●●●○○) from a 0–100 probability score
function beeOdds(bp){ const n=Math.max(1,Math.min(5,Math.round((bp||0)/20))); return '●'.repeat(n)+'○'.repeat(5-n); }
// Build the Word Coach working set for a list ONCE and keep it stable while you navigate —
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
  if(after>before){ const form=formIdx(after); state.toast='Level '+after+'! Now '+((EVO[state.theme]||EVO.spellbound)[form])+' in '+listLabel(key)+' ✨'; scheduleToast(2600); addCoins(4); sfx('level'); burstConfetti(90); }
  else if(!state.premium && rawAfter>FREE_LEVEL_CAP && before>=FREE_LEVEL_CAP && (lp.xp % 6 === 0)){ state.toast='Level 5 reached — go Premium to keep leveling 👑'; scheduleToast(2800); }
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
function utter(text,rate){ const u=new SpeechSynthesisUtterance(text); if(_voice) u.voice=_voice; u.rate=rate||0.9; u.pitch=1.0; u.volume=1; return u; }
function deviceSpeak(text,rate){ try{ window.speechSynthesis.cancel(); window.speechSynthesis.speak(utter(text,rate||0.92)); }catch(e){} }
// voice preference: which installed device voice to use ('' = auto best). No account, no key.
const VOICE = { name:'' };
function loadVoiceCfg(){ try{ const raw=localStorage.getItem('sb_voice'); if(raw) Object.assign(VOICE, JSON.parse(raw)); }catch(e){} }
function saveVoiceCfg(){ try{ localStorage.setItem('sb_voice', JSON.stringify(VOICE)); }catch(e){} }
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
function say(text,rate){ deviceSpeak(text, (rate||0.95)*(state.voiceRate||1)); }
// split a sentence around its target word (and simple inflections) so we can read it aloud
// WITHOUT speaking the answer — used by "Finish the Sentence"
function maskParts(sentence, word){ const t=sentence||''; const w=(word||'').trim(); if(!w) return {before:t, after:'', matched:false};
  let re; try{ re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','i'); }catch(e){ return {before:t, after:'', matched:false}; }
  const m=t.match(re); if(!m) return {before:t, after:'', matched:false};
  return { before:t.slice(0,m.index).trim(), after:t.slice(m.index+m[0].length).trim(), matched:true }; }
function maskTxt(text, word){ const t=text||''; const w=(word||'').trim(); if(!w) return t;
  let re; try{ re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','ig'); }catch(e){ return t; }
  return t.replace(re,'_____'); }
function sayMasked(sentence, word){ try{ window.speechSynthesis.cancel(); }catch(e){}
  const parts=maskParts(sentence, word);
  if(!parts.matched){ const safe=(sentence||'').replace(new RegExp((word||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),' beep '); deviceSpeak(safe||'beep',0.92); return; }
  const speakPart=(txt)=>new Promise(res=>{ if(!txt){ res(); return; } let done=false; const fin=()=>{ if(done) return; done=true; res(); };
    let u; try{ u=utter(txt,0.92); }catch(e){ return fin(); } u.onend=fin; u.onerror=fin;
    try{ window.speechSynthesis.speak(u); }catch(e){ return fin(); }
    setTimeout(fin, 1100 + txt.length*60); }); // fallback if onend never fires (flaky on some devices)
  speakPart(parts.before).then(()=>{ beep(); return new Promise(r=>setTimeout(r,460)); }).then(()=>speakPart(parts.after)); }

/* ---- concepts ---- */
const conceptShort = (t) => (t||'').split('—')[0].trim();
const conceptRoots = (t) => { const p=(t||'').split('—'); return p.length>1?p.slice(1).join('—').trim():''; };
function catGroup(cat){ const c=(cat||'').toLowerCase();
  if(c.includes('basic')) return 'Basics';
  if(c.includes('prefix')) return 'Prefixes'; if(c.includes('suffix')) return 'Suffixes';
  if(c.includes('root')) return 'Roots';
  if(c.includes('loanword')||c.includes('french')||c.includes('italian')) return 'Loanwords';
  if(c.includes('rule')||c.includes('pattern')||c.includes('strategy')||c.includes('spelling')) return 'Rules';
  if(c.includes('subject')) return 'Subjects'; if(c.includes('personality')||c.includes('theme')) return 'Themes';
  return 'Advanced'; }
function loadConcepts(){
  if(state.conceptData || state.conceptLoading) return;
  if(SB_CONCEPTS && SB_CONCEPTS.chapters && SB_CONCEPTS.chapters.length){ state.conceptData = SB_CONCEPTS.chapters; return; }
  state.conceptLoading = true;
  fetch('concepts.json').then(r=>r.json()).then(j=>{ state.conceptData=j.chapters; state.conceptLoading=false; render(); })
    .catch(()=>{ state.conceptLoading=false; state.conceptErr=true; render(); });
}

/* ---- full library: 128k words live in words-full.js, loaded on demand (file too big for startup) ---- */
let _fullState='idle'; // idle | loading | loaded | error
function loadFullLibrary(then){ if(window.SB_FULL){ _fullState='loaded'; state.fullLoaded=true; if(then) then(); return; }
  if(_fullState==='loading') return; _fullState='loading'; state.fullLoading=true; render();
  const s=document.createElement('script'); s.src='words-full.js';
  s.onload=()=>{ _fullState='loaded'; _wdb=null; state.fullLoading=false; state.fullLoaded=true; if(then) then(); render(); flash('Full library ready — 128,000 words 📚'); };
  s.onerror=()=>{ _fullState='error'; state.fullLoading=false; render(); flash('Couldn’t load words-full.js — keep it in the same folder'); };
  document.head.appendChild(s); }
/* ---- Word Finder: search the whole library, open a learn card, add to lists ---- */
function finderResults(q){ q=nkey((q||'').trim()); if(q.length<2) return [];
  const seen=new Set(); const exact=[],starts=[],contains=[];
  const scan=(pool)=>{ for(const r of pool){ if(!r||!r.w) continue; const k=nkey(r.w); if(seen.has(k)) continue;
      if(k===q){ seen.add(k); exact.push(r); }
      else if(k.startsWith(q)){ if(starts.length<40){ seen.add(k); starts.push(r); } }
      else if(starts.length<8 && contains.length<12 && k.includes(q)){ seen.add(k); contains.push(r); } } };
  scan((window.SB_DATA&&SB_DATA.nsf)||[]); if(window.SB_FULL) scan(window.SB_FULL);
  return exact.concat(starts,contains).slice(0,24); }
/* ---- word DB / coach ---- */
let _wdb = null;
function wordDB(){ if(_wdb) return _wdb; const m=new Map();
  const add=(arr)=>(arr||[]).forEach(r=>{ const k=nkey(r.w); if(k&&!m.has(k)) m.set(k,r); });
  add(SB_DATA.nsf); if(window.SB_FULL) add(window.SB_FULL); add(REVIEW); add(HINDI_WORDS);
  _wdb=m; return m; }
// memoize the heavy origin/tier filters — computed once over the core set, reused every render
let _catStatic=null;
function catStatic(){ if(_catStatic) return _catStatic; const nsf=SB_DATA.nsf||[];
  const byTier=(s)=>nsf.filter(r=>(r.nt||'').includes(s));
  const byOrigin=(kw)=>nsf.filter(r=>(r.o||'').toLowerCase().includes(kw));
  _catStatic={ finals:byTier('North South Finals'), primary:byTier('Primary'), junior:byTier('Junior'), senior:byTier('Senior'), advanced:byTier('Advanced'),
    nsf500:((window.SB_NSF500&&SB_NSF500.words)||[]),
    likely:nsf.slice().sort((a,b)=>(b.bp||0)-(a.bp||0)),
    hardest:nsf.filter(r=>(r.y||3)>=6),
    latin:byOrigin('latin'), greek:byOrigin('greek'), french:byOrigin('french'), oe:byOrigin('old english'), norse:byOrigin('norse'),
    spanish:byOrigin('spanish'), italian:byOrigin('italian'), german:byOrigin('german'), arabic:byOrigin('arabic'), japanese:byOrigin('japanese'),
    hindi:nsf.filter(r=>/hindi|sanskrit|urdu|tamil|marathi|punjabi/i.test(r.o||'')).concat(HINDI_WORDS) };
  return _catStatic; }
function coachCatalog(){
  const S=state; const st=catStatic(); const nsf=SB_DATA.nsf||[];
  const cats=[
    { key:'review',     label:'Tricky review',           sub:'Curated commonly-missed words',        words:REVIEW },
    { key:'scripps',    label:'Winning Words — Scripps Bee', sub:'Championship-ending words, 1925–2026', words:(window.SB_SCRIPPS||[]) },
    { key:'missed',     label:'My missed words',         sub:'Words you’ve gotten wrong',            words:((active().missed)||S.missedWords||[]) },
    { key:'likely',     label:'Most likely words',       sub:'Ranked by bee-probability score',       words:st.likely },
    { key:'nsf_finals', label:'North South Finals',      sub:'The official finals word pool',         words:st.finals },
    { key:'nsf_primary',label:'NSF — Primary',           sub:'Primary-level NSF words',               words:st.primary },
    { key:'nsf_junior', label:'NSF — Junior',            sub:'Junior-level NSF words',                words:st.junior },
    { key:'nsf500',     label:'Junior Finals 500 🐝',    sub:'500 high-probability finals words · your 15-day list', words:st.nsf500 },
    { key:'nsf_senior', label:'NSF — Senior',            sub:'Senior-level NSF words',                words:st.senior },
    { key:'nsf_advanced',label:'NSF — Advanced',         sub:'The hardest NSF words',                 words:st.advanced },
    { key:'nsf',        label:'Championship library',     sub:'17,000-word competition library',       words:nsf },
    { key:'all',        label:'Entire library',           sub:'Every word · 128,000 (loads on first use)', words:(window.SB_FULL||nsf) },
    { key:'hardest',    label:'Toughest words',          sub:'Highest-difficulty spellers + Scripps champions', words:st.hardest.concat(window.SB_SCRIPPS||[]) },
    { key:'latin',      label:'Latin origin',            sub:'Roots from Latin',                      words:st.latin },
    { key:'greek',      label:'Greek origin',            sub:'Roots from Greek',                      words:st.greek },
    { key:'french',     label:'French origin',           sub:'Loanwords from French',                 words:st.french },
    { key:'oe',         label:'Old English origin',      sub:'Anglo-Saxon roots',                     words:st.oe },
    { key:'norse',      label:'Norse origin',            sub:'Old Norse roots',                       words:st.norse },
    { key:'spanish',    label:'Spanish origin',          sub:'Loanwords from Spanish',                words:st.spanish },
    { key:'italian',    label:'Italian origin',          sub:'Loanwords from Italian',                words:st.italian },
    { key:'german',     label:'German origin',           sub:'Loanwords from German',                 words:st.german },
    { key:'arabic',     label:'Arabic origin',           sub:'Loanwords from Arabic',                 words:st.arabic },
    { key:'japanese',   label:'Japanese origin',         sub:'Loanwords from Japanese',               words:st.japanese },
    { key:'hindi',      label:'Hindi / Sanskrit origin', sub:'Indian-language loanwords',             words:st.hindi },
  ].filter(c=>(c.words&&c.words.length) || c.key==='missed');
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
const srsState = (r) => { if(!r||!r.seen) return 'new'; if(r.box>=5) return 'mastered'; if(r.box>=3) return 'review'; return 'learning'; };
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
/* daily goal: per-child, resets each day automatically */
function goalState(c){ c=c||active(); const t=todayKey(); if(!c.goalD||c.goalD.d!==t) c.goalD={d:t,n:0}; return c.goalD; }
function goalToday(){ try{ return goalState().n||0; }catch(e){ return 0; } }
function goalBump(){ try{ const g=goalState(); g.n=(g.n||0)+1; state.goalDone=g.n; }catch(e){} }
function _bandAcc(c,b){ const at=(c.attempts||[]).filter(a=>a.b===b).slice(-BAND_WIN);
  const W=at.reduce((s,a)=>s+a.wt,0); return { w:W, acc:W?at.reduce((s,a)=>s+a.ok*a.wt,0)/W:0 }; }
function bandEvidence(c){ return (c.attempts||[]).reduce((s,a)=>s+a.wt,0); }
function _bandUpdate(c){ if(bandEvidence(c)<BAND_MIN_EV) return;
  let cur=c.band||c.bandSeed||2; let raw=0;
  for(let b=1;b<=9;b++){ const s=_bandAcc(c,b); if(s.w>=8 && s.acc>=BAND_UP) raw=b; }
  if(raw>cur) cur=raw; /* climb fast: proof promotes immediately */
  else { const s=_bandAcc(c,cur); if(s.w>=12 && s.acc<BAND_DOWN) cur=Math.max(1,cur-1); } /* fall slow: one bad game never demotes */
  const was=c.band||0;
  if(cur>was && was>0){ try{ state.toast='📈 Bee Band '+cur+' — '+bandTier(cur)+'! Proven on Band '+cur+' words.'; scheduleToast(3600); sfx('win'); burstConfetti(120); }catch(e){} }
  c.band=cur; }
function bandTier(b){ return b<=2?'Classroom Speller':b<=4?'School-Bee Ready':b<=6?'Regional Ready':b<=8?'State & National':'Championship'; }
function beeBand(c){ c=c||active(); const band=Math.max(1,Math.min(9,c.band||c.bandSeed||2));
  const cal=bandEvidence(c)<BAND_MIN_EV && !c.bandSeed; /* a placement result IS evidence — never call it calibrating */
  const s=_bandAcc(c,band);
  return { band, tier:bandTier(band), calibrating:cal, acc:Math.round((s.acc||0)*100), n:s.w }; }
function masteredCount(){ try{ return Object.keys(state.luMastered||{}).filter(k=>state.luMastered[k]).length; }catch(e){ return 0; } }
function coachReadiness(){ const pool=coachPool(); const srs=state.coachSrs||{}; let nw=0,lr=0,rv=0,ms=0;
  pool.forEach(r=>{ const st=srsState(srs[nkey(r.w)]); if(st==='new')nw++; else if(st==='learning')lr++; else if(st==='review')rv++; else ms++; });
  const size=pool.length||1; const seen=lr+rv+ms;
  return { size:pool.length, nw,lr,rv,ms, seen, coverage:Math.round(seen/size*100), ready:Math.round(ms/size*100) }; }
const coachDaysLeft = () => { const tg=state.coachDate; if(!tg) return null; return Math.ceil((new Date(tg+'T00:00:00') - new Date())/86400000); };
function coachPhase(){ const d=coachDaysLeft(); if(d==null) return {key:'none'}; if(d<0) return {key:'past'}; if(d>28) return {key:'breadth',d}; if(d>14) return {key:'depth',d}; return {key:'sim',d}; }
function coachConsistency(){ const h=state.coachHistory||{}; let days=0; const now=new Date(); for(let i=0;i<14;i++){ const dd=new Date(now); dd.setDate(dd.getDate()-i); if(h[dd.toISOString().slice(0,10)]) days++; } return days; }
function coachTopProblems(n){ const pool=coachPool(); const srs=state.coachSrs||{}; return pool.map(r=>({w:r.w,x:srs[nkey(r.w)]})).filter(o=>o.x&&o.x.wrong>0).sort((a,b)=>b.x.wrong-a.x.wrong).slice(0,n||10); }
function coachWeakList(n){ const srs=state.coachSrs||{}; const byKey={}; coachPool().forEach(r=>byKey[nkey(r.w)]=r);
  return Object.keys(srs).filter(k=>srs[k].wrong>0&&srs[k].box<=2).sort((a,b)=>srs[b].wrong-srs[a].wrong).map(k=>byKey[k]).filter(Boolean).slice(0,n||20); }

/* ---- Parent PIN: a 4-digit gate on grown-up areas (Settings, Parent zone, Premium).
   Stored locally only. No PIN set = gates stay open (first-run friendliness). ---- */
function pinSet(){ return !!state.parentPin; }
function pinGate(nextFn,label){ if(!pinSet()){ nextFn(); return; }
  state.pinDlg={ label:label||'Grown-ups only', typed:'', next:nextFn }; render(); }
/* ---------------- handlers (the `app` surface) ---------------- */
const app = {
  goLanding:()=>set({screen:'landing'}),
  goSignup:()=>set({screen:'auth',authMode:'signup'}),
  goSignin:()=>set({screen:'auth',authMode:'signin'}),
  swapAuth:()=>set({authMode: state.authMode==='signup'?'signin':'signup'}),
  onEmail:(v)=>set({email:v}), onPw:(v)=>set({pw:v}),
  doAuth:()=>{ if(state.authMode==='signin'){ let ch=state.children;
      if(!ch.length) ch=[{ name:'Ahana', age:9, avatar:'fox', theme:'spellbound', level:9, streak:12, acc:88, goal:10, xp:124, week:[12,20,15,30,18,25,22] }];
      set({children:ch, activeIdx:0, theme:ch[0].theme||'spellbound', screen:'app', nav:'home'});
    } else { set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bizzy',goal:10}}); } },
  // onboarding
  onDraftName:(v)=>set({draft:{...state.draft,name:v}}),
  onDraftAge:(v)=>set({draft:{...state.draft,age:+v}}),
  pickAvatar:(id)=>set({draft:{...state.draft,avatar:id}}),
  pickGoal:(v)=>set({draft:{...state.draft,goal:+v}}),
  onbBeeDate:(v)=>{ state.draft.beeDate=v||null; },
  onbBack:()=>{ if(state.onbStep===0){ set({screen: state.addingMore?'app':'auth'}); } else set({onbStep:state.onbStep-1}); },
  pickAvatar:(id)=>{ if(window.SB_AVATARS&&SB_AVATARS.byId[id]&&SB_AVATARS.byId[id].rarity!=='free'&&state.screen==='onboarding'){ flash('🔒 '+SB_AVATARS.byId[id].name+' unlocks with coins — find it in your Collection later!'); return; } state.draft.avatar=id; render(); },
  onbWorld:(id)=>{ if(FREE_THEMES.indexOf(id)<0){ flash('🔒 Locked — start in Bizzing Bee or Spotlight, then unlock this world for '+COST.theme+' 🪙'); return; } state.draft.theme=id; state.theme=id; render(); },
  onbNext:()=>{ const S=state;
    if(S.onbStep===0 && !S.draft.name.trim()){ flash('Add a name to continue'); return; }
    if(S.onbStep===1 && !S.draft.theme){ flash('Pick a world first — every speller chooses their own'); return; }
    if(S.onbStep<2){ set({onbStep:S.onbStep+1}); return; }
    app._finishOnb(); set({screen:'app', nav:'home'}); flash('Profile ready — let’s spell! 🐝'); },
  _finishOnb:()=>{ const S=state; const kid={ name:S.draft.name.trim()||'Speller', age:S.draft.age, avatar:S.draft.avatar, theme:S.theme, goal:S.draft.goal, level:1, streak:0, acc:0, xp:0, week:[0,0,0,0,0,0,0] };
    if(S.draft.beeDate) kid.milestone={ label:(S.draft.beeLabel||'the bee'), date:S.draft.beeDate };
    const newIdx=S.children.length; state.children=[...S.children,kid]; state.activeIdx=newIdx; state.goalDone=0; state.addingMore=false; save(); },
  startLevelTest:()=>{ if(state.screen==='onboarding'){ if(!state.draft.name.trim()){ flash('Add a name first'); return; } app._finishOnb(); }
    /* The placement test walks the difficulty-band ladder itself (not stage lists), so its
       result IS the Bee Band — the Quest start is then derived from the same number. */
    state.lt={ band:2, i:0, ok:0, fails:0, words:sample(ltBandPool(2),6), typed:'', placed:null };
    set({screen:'app', nav:'leveltest'}); setTimeout(()=>{ const lt=state.lt; if(lt&&lt.words[0]) say(lt.words[0].w); },400); },
  ltSay:()=>{ const lt=state.lt; if(lt&&lt.words[lt.i]) say(lt.words[lt.i].w); },
  ltType:(v)=>{ state.lt.typed=v; },
  ltKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.ltEnter(); } },
  ltSkip:()=>{ set({nav:'home', lt:null}); flash('No problem — starting at Level 1. You can climb fast!'); },
  ltEnter:()=>{ const lt=state.lt; const w=lt.words[lt.i]; if(!w) return; const ok=nkey(lt.typed)===nkey(w.w);
    logBand(w,ok);
    if(ok){ lt.ok++; sfx('correct'); } else { lt.fails++; sfx('wrong'); }
    lt.typed=''; lt.i++;
    if(lt.fails>=3){ lt.placed=Math.max(1,lt.band-1); app._ltFinish(); return; }
    if(lt.ok>=3){ if(lt.band>=9){ lt.placed=9; app._ltFinish(); return; }
      lt.band++; lt.i=0; lt.ok=0; lt.fails=0; lt.words=sample(ltBandPool(lt.band),6); render(); setTimeout(()=>say(lt.words[0].w),350); return; }
    if(lt.i>=lt.words.length){ lt.placed=Math.max(1,lt.band-(lt.ok>=2?0:1)); app._ltFinish(); return; }
    render(); setTimeout(()=>say(lt.words[lt.i].w),300); },
  _ltFinish:()=>{ const lt=state.lt; const c=active(); ensureLists(c);
    c.band=c.bandSeed=Math.max(1,Math.min(9,lt.placed||1));            // one result, one truth: the test IS the Band
    getList(c,'journey').stage=ltStageForBand(c.band); c.activeList='journey'; save();
    sfx('win'); burstConfetti(110); lt.done=true; render(); },
  ltGo:()=>{ set({nav:'home', lt:null}); },
  // theme / mode
  pickTheme:(id)=>{ if(!isThemeUnlocked(id)){ app.buyTheme(id); return; } const children=state.children.slice(); if(children[state.activeIdx]) children[state.activeIdx]={...children[state.activeIdx],theme:id}; set({theme:id, children}); },
  buyTheme:(id)=>{ if(isThemeUnlocked(id)) return app.pickTheme(id); if(!window.confirm('Unlock this world for '+COST.theme+' coins?')) return; if(spendCoins(COST.theme)){ const c=active(); c.unlockedThemes=[...(c.unlockedThemes||[]),id]; sfx('win'); burstConfetti(70); flash('New world unlocked! 🎨'); app.pickTheme(id); } else { flash('Need '+COST.theme+' 🪙 — play games to earn!'); } },
  buyList:(key)=>{ if(isListUnlocked(key)) return app.selectList(key); if(!window.confirm('Unlock this list for '+COST.list+' coins?')) return; if(spendCoins(COST.list)){ const c=active(); c.unlockedLists={...(c.unlockedLists||{}),[key]:1}; sfx('win'); burstConfetti(70); flash('List unlocked! 🔓'); app.selectList(key); } else { flash('Need '+COST.list+' 🪙 to unlock — earn by playing!'); } },
  buyConcept:(ci)=>{ ci=+ci; if(isConceptUnlocked(ci)) return app.openConcept(ci); if(!window.confirm('Unlock this concept for '+COST.concept+' coins?')) return; if(spendCoins(COST.concept)){ const c=active(); c.unlockedConcepts={...(c.unlockedConcepts||{}),[ci]:1}; sfx('win'); burstConfetti(70); flash('Concept unlocked! 🔓'); app.openConcept(ci); } else { flash('Need '+COST.concept+' 🪙 to unlock — earn by playing!'); } },
  setMode:(m)=>set({mode:m}),
  setTextSize:(k)=>set({textSize:k==='large'?'large':'normal'}),
  toggleReadAloud:()=>{ state.readAloud=!state.readAloud; save(); if(state.readAloud) say('I will read the cards to you!'); render(); },
  setVoiceRate:(k)=>{ state.voiceRate=(k==='slow'?0.75:1); save(); say('Hello! I read the words like this.'); render(); },
  // nav
  setNav:(key)=>{ if(key==='train'){ app.startTrain(); return; } if(key==='coach'){ app.openCoach(); return; } if(key==='games'){ app.openGames(); return; } if(key==='shop'){ app.openShop(); return; } if(key==='journeys'){ app.openJourneys(); return; } if(key==='trivia'){ app.openTrivia(); return; }
    if(key==='settings'){ pinGate(()=>set({nav:'settings', screen:'app', mood:'happy', conceptSel:null}),'Settings — grown-ups only'); return; }
    if(key==='parent'){ pinGate(()=>{ state.progTab='parent'; set({nav:'progress', screen:'app', mood:'happy', conceptSel:null}); },'Parent zone'); return; }
    if(key==='progress'&&state.progTab==null) state.progTab='me';
    if(key==='concepts'){ loadConcepts(); state.conceptView='all'; state.conceptTier=currentTier(); state.conceptPage=0; }
    set({nav:key, screen:'app', mood:'happy', conceptSel:null}); },
  progTab:(k)=>{ if(k==='parent'){ pinGate(()=>set({progTab:'parent'}),'Parent zone'); return; } set({progTab:'me'}); },
  // ----- Parent PIN dialog + setup -----
  pinKey:(d)=>{ const p=state.pinDlg; if(!p) return;
    if(d==='del'){ p.typed=p.typed.slice(0,-1); render(); return; }
    p.typed=(p.typed+d).slice(0,4);
    if(p.typed.length===4){ if(p.typed===state.parentPin){ const fn=p.next; state.pinDlg=null; p.wrong=false; fn&&fn(); }
      else { p.typed=''; p.wrong=true; try{sfx('wrong');}catch(e){} render(); } }
    else render(); },
  pinCancel:()=>set({pinDlg:null}),
  pinSetup:()=>{ const cur=state.parentPin;
    const go=()=>{ const v=window.prompt(cur?'New 4-digit PIN (leave empty to remove):':'Choose a 4-digit parent PIN:','');
      if(v==null) return; const t=(v||'').trim();
      if(t===''){ if(cur){ state.parentPin=null; save(); flash('Parent PIN removed'); render(); } return; }
      if(!/^\d{4}$/.test(t)){ flash('PIN must be exactly 4 digits'); return; }
      state.parentPin=t; save(); flash('Parent PIN set ✓'); render(); };
    if(cur) pinGate(go,'Change parent PIN'); else go(); },
  // ----- Idioms & Sayings browser -----
  figQ:(v)=>{ state.figQ=v||''; state.figPage=0; render(); },
  figType:(k)=>set({figType:k, figPage:0}),
  figTheme:(v)=>set({figTheme:v||'all', figPage:0}),
  figWorld:()=>set({figWorld:!state.figWorld, figPage:0}),
  figPage:(n)=>{ set({figPage:+n}); try{window.scrollTo(0,0);}catch(e){} },
  figSay:(t)=>say(t),
  figTab:(k)=>set({figTab:k}),
  figDeck:(id)=>{ const c=active(); const seen=((c.figSeen||{})[id]||0); set({figTab:'learn', figDeck:id, figIdx:Math.min(seen, Math.max(0,figDeckItems(id).length-1)), figFlip:false}); },
  figFlip:()=>{ const to=!state.figFlip;
    if(to && state.readAloud){ const x=figDeckItems(state.figDeck)[state.figIdx||0]; if(x) say(x.p+'. '+(x.m||'')); }
    set({figFlip:to}); },
  figNav:(dir)=>{ const items=figDeckItems(state.figDeck); let i=(state.figIdx||0)+(+dir);
    i=Math.max(0,Math.min(items.length-1,i));
    const c=active(); c.figSeen=c.figSeen||{};
    if(i>(c.figSeen[state.figDeck]||0)){ c.figSeen[state.figDeck]=i;
      if(i===items.length-1 && !((c.figDone||{})[state.figDeck])){ (c.figDone=c.figDone||{})[state.figDeck]=1; addCoins(5); sfx('win'); burstConfetti(50); flash('📚 Deck complete! +5 🪙'); } save(); }
    set({figIdx:i, figFlip:false}); },
  figBackToDecks:()=>set({figDeck:null, figFlip:false}),
  // ----- Vocabulary study (NSF vocabulary-bee style) -----
  openVocab:()=>{ set({nav:'vocab', screen:'app', vocDeck:null, conceptSel:null}); },
  vocDeck:(k)=>{ const words=vocDeckWords(k); if(words.length<5){ flash('Not enough words here yet — train a list first'); return; }
    set({vocDeck:k, vocWords:words, vocIdx:0, vocFlip:false}); setTimeout(()=>{ const w=state.vocWords[0]; if(w) say(w.w); },250); },
  vocFlip:()=>{ const to=!state.vocFlip;
    if(to && state.readAloud){ const w=(state.vocWords||[])[state.vocIdx||0]; if(w) say(w.w+'. '+(w.d||'')); }
    set({vocFlip:to}); },
  vocNav:(dir)=>{ const n=(state.vocWords||[]).length; const prev=state.vocIdx||0; let i=prev+(+dir); i=Math.max(0,Math.min(n-1,i));
    if(+dir>0 && i===n-1 && prev<n-1 && n>=10){ const c=active(); c.vocDone=(c.vocDone||0)+1; addCoins(5); sfx('win'); burstConfetti(50); flash('📖 Vocabulary set complete! +5 🪙'); save(); }
    set({vocIdx:i, vocFlip:false});
    const w=(state.vocWords||[])[i]; if(w) setTimeout(()=>say(w.w),150); },
  vocSayWord:()=>{ const w=(state.vocWords||[])[state.vocIdx||0]; if(w) say(w.w); },
  vocSayCard:()=>{ const w=(state.vocWords||[])[state.vocIdx||0]; if(w){ if(!state.vocFlip) state.vocFlip=true; say(w.w+'. '+(w.d||'')); render(); } },
  vocNewSet:()=>{ set({vocWords:vocDeckWords(state.vocDeck), vocIdx:0, vocFlip:false}); },
  vocBack:()=>set({vocDeck:null}),
  // ----- Typing Trainer -----
  openTyping:()=>{ tyStop(); set({nav:'typing', screen:'app', ty:null, conceptSel:null}); },
  tyStart:(id)=>{ tyStop(); const l=TY_LESSONS.find(x=>x.id===id)||TY_LESSONS[0];
    state.ty={mode:'lesson', lesson:l.id, title:l.name, tip:l.tip, seq:tySeqFor(l), pos:0, typed:0, errors:0, startT:0, done:false};
    set({nav:'typing', screen:'app'}); app._tyArm(); },
  tyTest:()=>{ tyStop(); const ws=gameWordsD().filter(w=>/^[a-z]+$/.test(w.w)&&w.w.length<=10);
    const seq=sample(ws, Math.min(90,ws.length)).map(w=>w.w).join(' ')||'the quick brown fox jumps over the lazy dog';
    state.ty={mode:'test', title:'60-second Typing Test', tip:'', seq, pos:0, typed:0, errors:0, startT:0, done:false};
    set({nav:'typing', screen:'app'}); app._tyArm(); },
  _tyArm:()=>{ if(window._tyH) return; window._tyH=(e)=>{ const t=state.ty; if(!t||t.done||state.nav!=='typing') return;
      if(e.metaKey||e.ctrlKey||e.altKey) return;
      if(e.key==='Backspace'||e.key.length===1){ e.preventDefault(); tyProcess(e.key); } };
    window.addEventListener('keydown', window._tyH, true); },
  tyTap:(ch)=>{ tyProcess(ch); },
  tyExit:()=>{ tyStop(); set({ty:null, nav:'typing'}); },
  goSettings:()=>app.setNav('settings'),
  goHome:()=>app.setNav('home'),
  goConcepts:()=>app.setNav('concepts'),
  journey:(i)=>{ i=+i; if(i===0) app.openCoach(); else if(i===1) app.setNav('concepts'); else if(i===2) app.openGames(); else app.openJourneys(); },
  // train
  startTrain:()=>{ state.sessionRight=0; state.sessionDone=0; state.sessionListKey=null; state.gi=0; state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; set({nav:'train', screen:'app', status:'idle', typed:'', mood:'happy', showDef:false, showSent:false, showOrigin:false}); setTimeout(speak,350); },
  newBatch:()=>{ newCoachBatch(); flash('Fresh set of words ✨'); },
  startLevelUp:()=>{ const c=active(); ensureLists(c); c.activeList='default'; app.openCoach(); },
  reviseNav:(dir)=>{ const N=(state.sessionWords&&state.sessionWords.length)||LEVEL_WORDS.length; let i=(state.reviseIdx||0)+(dir==='next'?1:-1); set({reviseIdx:Math.max(0,Math.min(N-1,i))}); },
  conceptWordNav:(dir)=>{ const ws=((state.conceptSel&&state.conceptSel.words)||[]).filter(x=>x&&x.w); const N=ws.length||1; let i=(state.conceptWordIdx||0)+(dir==='next'?1:-1); set({conceptWordIdx:Math.max(0,Math.min(N-1,i))}); },
  exitTrain:()=>{ if((state.sessionDone||0)>0){ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, []); } if(state.coachSession){ state.coachSession=false; app.openCoach(); } else if(state.trainBack==='themes'){ state.trainBack=null; app.setNav('themes'); } else app.setNav('home'); },
  onType:(v)=>{ state.typed=v; }, /* no per-keystroke render — a full re-render restarts tile animations (dock flicker) */
  trainKey:(e)=>{ if(e.key==='Enter'){ if(state.status==='idle') app.check(); else app.next(); } },
  toggleDef:()=>set({showDef:!state.showDef}),
  openFinder:()=>{ state.drawerOpen=false; set({nav:'finder', conceptSel:null}); },
  finderQ:(v)=>{ state.finderQ=v||''; state.finderSel=null; render(); },
  finderPick:(w)=>{ const r=finderResults(state.finderQ).find(x=>nkey(x.w)===nkey(w)) || wordDB().get(nkey(w)); if(r){ state.finderSel=r; try{window.scrollTo(0,0);}catch(e){} render(); } },
  finderBack:()=>set({finderSel:null}),
  finderLoadFull:()=>loadFullLibrary(()=>{}),
  finderAddTo:(k)=>{ const c=active(); const w=state.finderSel; if(!w) return; c.builtLists=c.builtLists||{}; const bl=c.builtLists[k]; if(!bl) return;
    if((bl.ws||[]).some(x=>nkey(x)===nkey(w.w))){ flash('“'+w.w+'” is already in '+bl.label); return; }
    bl.ws=[...(bl.ws||[]),w.w]; bl.label=bl.label.replace(/\(\d+\)$/,'('+bl.ws.length+')'); save(); sfx('correct'); flash('Added “'+w.w+'” to '+bl.label+' ✓'); render(); },
  finderName:(v)=>{ state.finderName=v||''; },
  finderCreateAdd:()=>{ const c=active(); const w=state.finderSel; if(!w) return; const name=(state.finderName||'').trim()||'My words';
    c.builtLists=c.builtLists||{}; const key='built_'+Date.now().toString(36);
    c.builtLists[key]={ label:name, ws:[w.w] }; state.finderName=''; save(); sfx('win');
    flash('New list “'+name+'” created with “'+w.w+'” — find it in Word Coach ✓'); render(); },
  reportWord:(w)=>set({reportW:w}),
  reportClose:()=>set({reportW:null}),
  reportIssue:(issue)=>{ const w=state.reportW; if(!w) return; const r=wordDB().get(nkey(w))||{w};
    state.wordReports=[...(state.wordReports||[]), { w:r.w||w, issue, d:r.d||'', s:r.s||'', when:new Date().toISOString().slice(0,10) }];
    save(); set({reportW:null}); flash('Thanks — logged for review. Parents can export it from the Parent tab. ⚑'); },
  copyReports:()=>{ const rs=state.wordReports||[]; if(!rs.length) return;
    const txt=rs.map(r=>`${r.when} · ${r.w} · ${r.issue}${r.d?' · meaning: '+r.d:''}${r.s?' · sentence: '+r.s:''}`).join('\n');
    try{ navigator.clipboard.writeText(txt).then(()=>flash('Copied '+rs.length+' report'+(rs.length>1?'s':'')+' 📋')); }
    catch(e){ try{ const t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); flash('Copied 📋'); }catch(e2){ flash('Couldn’t copy'); } } },
  clearReports:()=>{ state.wordReports=[]; save(); render(); flash('Reports cleared'); },
  wordCard:(w)=>{ const ws=state.sessionWords||[]; const i=ws.findIndex(x=>nkey(x.w)===nkey(w));
    if(i>=0){ state.luTab='revise'; state.reviseIdx=i; try{window.scrollTo(0,0);}catch(e){} render(); } else { say(w); } },
  toggleSent:()=>{ const on=!state.showSent; if(on){ const w=curWord(); if(w&&w.s) sayMasked(w.s,w.w); } set({showSent:on}); },
  toggleOrigin:()=>set({showOrigin:!state.showOrigin}),
  luSetTab:(t)=>{ set({luTab:t, heatReveal:false}); if(t==='practice') setTimeout(speak,250); },
  toggleHeat:()=>set({heatReveal:!state.heatReveal}),
  luToggleWords:()=>set({luWordsOpen:!state.luWordsOpen}),
  luPractice:(idx)=>{ state.gi=+idx; state.luTab='practice'; state.status='idle'; state.typed=''; state.mood='happy'; state.showDef=false; state.showSent=false; state.showOrigin=false; render(); setTimeout(speak,250); },
  reveal:()=>set({status:'revealed', mood:'sleepy'}),
  primary:()=>{ if(state.status==='idle') app.check(); else app.next(); },
  speak,
  check:()=>{ const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word first'); return; }
    const cw=curWord(); const target=cw.w.toLowerCase();
    if(state.coachSession) recordCoach(target, ans===target);
    logBand(cw, ans===target);
    // remember this word's outcome for the end-of-list summary (latest attempt wins)
    { const rk=nkey(target); state.sessionCorrect=(state.sessionCorrect||[]).filter(x=>nkey(x.w)!==rk); state.sessionWrong=(state.sessionWrong||[]).filter(x=>nkey(x.w)!==rk); (ans===target?state.sessionCorrect:state.sessionWrong).push(cw); }
    if(ans===target){
      markMastered(target);
      try{ const k2=(state.sessionListKey&&state.sessionListKey[0]!=='_')?state.sessionListKey:activeListKey(); const c3=active(); const i3=listStageIdx(c3,k2);
        if(stageComplete(c3,k2) && i3<listStages(k2).length-1 && !(k2==='journey' && i3+1>=CHAMP_LEVELS && !state.premium)){
          setTimeout(()=>{ try{ const cc=active(); if(stageComplete(cc,k2) && listStageIdx(cc,k2)===i3) app.advanceStage(k2); }catch(e){} }, 1100);
        } }catch(e){}
      const streakRight=(state._run||0)+1; const mood=streakRight>=3?'love':'excited';
      state._run=streakRight; state.sessionRight+=1; state.sessionDone+=1;
      sfx('correct'); addCoins(1); gainXp(); clearMiss(target);
      if(streakRight>0 && streakRight%5===0){ addCoins(5); state.toast='🔥 '+streakRight+' in a row! +5 bonus coins'; scheduleToast(2200); burstConfetti(50); }
      state.status='correct'; state.mood=state.toast?'wow':mood; render();
      autoAdvance(850);
    } else {
      addMiss(curWord());
      sfx('wrong'); const d=lev(ans,target); if(d>0 && d<=2 && target.length>=4){ state.toast='So close — '+d+' letter'+(d>1?'s':'')+' off! 💡'; scheduleToast(2400); }
      state.status='wrong'; state.mood='oops'; state.sessionDone+=1; state._run=0; render();
      autoAdvance(2200);
    } },
  next:()=>{ clearTimeout(state._advTimer); state._advTimer=null;
    const N=(state.sessionWords&&state.sessionWords.length)||0;
    if(N && state.gi>=N-1){ state.sessionOver=true;
      try{ const k=state.sessionListKey; if(k&&k[0]!=='_') getList(active(),k).gi=0; }catch(e){}
      if((state.sessionDone||0)>0){ try{ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, (state.sessionWrong||[]).map(x=>x.w)); }catch(e){} }
      set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); return; }
    state.gi+=1; try{ const k=state.sessionListKey; if(k&&k[0]!=='_'){ getList(active(),k).gi=state.gi; save(); } }catch(e){}
    set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); setTimeout(speak,250); },
  restartSession:()=>{ state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; state.gi=0; set({typed:'', status:'idle', mood:'happy'}); setTimeout(speak,300); },
  drillMisspelt:()=>{ const wrong=(state.sessionWrong||[]).slice(); if(!wrong.length){ flash('Nothing to redo — all correct! 🎉'); return; } state.sessionWords=wrong; state.sessionLabel=(state.sessionLabel||'Practice').replace(/ · misspelt$/,'')+' · misspelt'; state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; state.gi=0; set({typed:'', status:'idle', mood:'happy'}); setTimeout(speak,300); },
  // concepts
  conceptCat:(label)=>set({conceptCat:label, conceptPage:0}),
  openConceptChapter:(i)=>{ try{window.scrollTo(0,0);}catch(e){} set({conceptChapter:+i, conceptQuery:''}); },
  conceptChaptersBack:()=>set({conceptChapter:null}),
  onConceptSearch:(v)=>set({conceptQuery:v, conceptPage:0}),
  conceptSetView:(v)=>set({conceptView:v, conceptPage:0}),
  conceptTier:(t)=>set({conceptTier:t, conceptPage:0}),
  conceptPagePrev:()=>set({conceptPage:Math.max(0,(state.conceptPage||0)-1)}),
  conceptPageNext:()=>set({conceptPage:(state.conceptPage||0)+1}),
  openConcept:(ci)=>{ ci=+ci; const ch=state.conceptData&&state.conceptData[ci]; if(!ch) return; if(!isConceptUnlocked(ci)){ app.buyConcept(ci); return; } clearAnimTimer(); stopNarration(); state.conceptSel=ch; state.conceptStep=0; state.conceptWordsOpen=false; state.conceptWordIdx=0; state.animOn=false; state.animScene=0; try{window.scrollTo(0,0);}catch(e){} render(); },
  conceptBack:()=>{ clearAnimTimer(); stopNarration(); set({conceptSel:null, animOn:false, animScene:0}); },
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
  drawer:(key)=>{ state.drawerOpen=false; const F={ home:()=>app.setNav('home'), levelup:()=>app.startLevelUp(), games:()=>app.openGames(), shop:()=>app.openShop(), concepts:()=>app.setNav('concepts'),
      coach:()=>app.openCoach(), journeys:()=>app.openJourneys(), study:()=>app.coachStudy(), written:()=>app.startWritten(), oral:()=>app.startOral(),
      weak:()=>app.coachWeakDrill(), parentview:()=>{ state.progTab='parent'; app.setNav('progress'); }, settings:()=>app.setNav('settings'), themes:()=>app.setNav('themes'),
      quest:()=>app.openQuestChooser(), traps:()=>app.openTraps(), collection:()=>app.openCollection(), finder:()=>app.openFinder(), builder:()=>app.openBuilder(), progress:()=>app.setNav('progress'), parent:()=>app.setNav('parent'), explore:()=>app.setNav('explore'), figurative:()=>app.setNav('figurative'), vocab:()=>app.openVocab(), typing:()=>app.openTyping() };
    (F[key]||(()=>{}))(); },
  // coach
  openCoach:()=>{ const c=active(); ensureLists(c);
    if(!c.questPath){ set({nav:'quest', screen:'app', conceptSel:null}); return; }   // first visit: choose a quest path
    ensureCoachWords(c.activeList||'default'); state.coachSession=false;
    set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'train', luTab:'revise', luWordsOpen:false, status:'idle', typed:'', mood:'happy', conceptSel:null}); },
  startWordCoach:()=>app.openCoach(),
  openQuestChooser:()=>set({nav:'quest', screen:'app', conceptSel:null}),
  questPick:(p)=>{ const c=active(); ensureLists(c); c.questPath=p; save(); sfx('coin');
    if(p==='journey'){ app.selectList('journey'); flash('⚔️ Quest set: the Bizzing Bee Journey — climb to Champ!'); }
    else if(p==='themes'){ set({nav:'themes'}); flash('⚔️ Quest set: Theme Journey — pick the worlds you love'); }
    else { app.openBuilder(); flash('⚔️ Quest set: your own list — pick one or build one in five taps'); } },
  progHeat:(v)=>set({progHeatKey:v}),
  progHeatPick:(k)=>set({progHeatKey:k}),
  noop:()=>{},   // click-eater for dialog panels (delegation-safe alternative to stopPropagation)
  moreTips:()=>set({tipPage:(state.tipPage||0)+1}),
  dockMenu:(k)=>set({dockMenu:state.dockMenu===k?null:k}),
  pauseList:(k)=>{ const c=active(); ensureLists(c); if(!c.pausedLists) c.pausedLists={};
    if((c.activeList||'default')===k){ flash('Switch to another list first, then pause this one'); state.dockMenu=null; render(); return; }
    c.pausedLists[k]=1; state.dockMenu=null; save(); flash('Paused — progress kept. Resume any time ⏸'); render(); },
  resumeList:(k)=>{ const c=active(); if(c.pausedLists) delete c.pausedLists[k]; state.dockMenu=null; save(); app.selectList(k); },
  dockRemove:(k)=>{ state.dockMenu=null; const c=active(); if(c.pausedLists) delete c.pausedLists[k];
    window.sbDelList({preventDefault(){},stopPropagation(){}},k); },
  openBuilder:()=>set({nav:'builder', screen:'app', conceptSel:null}),
  bldSet:(kv)=>{ const i=kv.indexOf(':'); const k=kv.slice(0,i); let v=kv.slice(i+1); if(k==='size') v=+v; bldState()[k]=v; render(); },
  bldCreate:()=>{ const b=bldState(); const words=bldPick(); if(!words.length) return; const c=active(); ensureLists(c);
    if(!c.builtLists) c.builtLists={}; const key='built_'+Date.now().toString(36);
    const patL=b.pat!=='any'?(BLD_PATS[b.pat].label+' '):''; const diffL=b.diff!=='mixed'?(b.diff[0].toUpperCase()+b.diff.slice(1)+' '):'';
    c.builtLists[key]={ label:(diffL+patL+'Builder list ('+words.length+')').trim(), ws:words.map(w=>w.w) };
    save(); sfx('win'); burstConfetti(60); app.selectList(key);
    flash('List built — '+words.length+' words · '+bldLevels(words.length)+' Level'+(bldLevels(words.length)>1?'s':'')+' to mastery 🛠️'); },
  printOpen:()=>{ if(!state.prn||!state.prn.inc) state.prn={inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'}; set({printOpen:true}); },
  printClose:()=>set({printOpen:false}),
  printSet:(kv)=>{ const i=kv.indexOf(':'); if(!state.prn||!state.prn.inc) state.prn={inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
    const g=kv.slice(0,i), v=kv.slice(i+1);
    if(g==='inc'){ const inc=state.prn.inc; const on=Object.keys(inc).filter(k=>inc[k]).length;
      if(inc[v]&&on<=1){ flash('Keep at least one thing on the page'); return; } inc[v]=inc[v]?0:1; }
    else state.prn[g]=v; render(); },
  printGo:()=>{ try{ const w=window.open('','_blank'); if(!w){ flash('Pop-up blocked — allow pop-ups to print'); return; }
    w.document.write(printDoc(activeListKey())); w.document.close(); setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} },350); state.printOpen=false; render(); }catch(e){ flash('Could not open the print view'); } },
  addTheme:(id)=>{ const c=active(); ensureLists(c); const key=themeKey(id); const t=themeOf(id); if(!t) return;
    if(!(c.pinnedLists||{})[key]){ if(!c.pinnedLists) c.pinnedLists={}; c.pinnedLists[key]=1; if(!c.lists[key]) c.lists[key]={xp:0}; save(); sfx('coin'); flash('“'+t.label+'” added to your lists ✓'); render(); }
    else app.selectList(key); },
  themePractice:(id)=>{ const c=active(); ensureLists(c); const key=themeKey(id); const t=themeOf(id); if(!t) return;
    if(!c.lists[key]) c.lists[key]={xp:0};             // give it a ladder, but don't pin it to the top bar
    const ws=workingSet(key); if(!ws.length){ flash('No words in this theme yet'); return; }
    state.sessionWords=ws; state.sessionListKey=key; state.sessionLabel=t.label;
    state.gi=0; state.coachSession=false; state.trainBack='themes'; app.startTrain(); },
  selectList:(key)=>{ if(!isListUnlocked(key)){ set({showPaywall:true}); return; } const c=active(); ensureLists(c); c.activeList=key; if(!c.lists[key]) c.lists[key]={xp:0}; if(!{journey:1,review:1,missed:1}[key]){ if(!c.pinnedLists) c.pinnedLists={}; c.pinnedLists[key]=1; }
    state.sessionListKey=null; ensureCoachWords(key); set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'train', luTab:'revise', status:'idle', typed:''});
    if(key==='all' && !window.SB_FULL){ loadFullLibrary(()=>{ state.sessionListKey=null; ensureCoachWords('all'); render(); }); }
    flash('Now training: '+listLabel(key)); },
  coachSetupOpen:()=>{ const c=active(); ensureLists(c); set({nav:'coach', screen:'app', coachMode:'setup', coachTab:'train', status:'idle', typed:''}); },
  // ----- Level ladder: advance to the next Level of the active list -----
  advanceStage:(key)=>{ const c=active(); ensureLists(c); key=key||activeListKey(); const stages=listStages(key); const idx=listStageIdx(c,key);
    if(idx>=stages.length-1){ sfx('win'); burstConfetti(140); flash('🏆 Every level cleared — incredible!'); return; }
    // Journey: free climbs to Champ (Level 20); the Library beyond is Premium.
    if(key==='journey' && (idx+1)>=CHAMP_LEVELS && !state.premium){ set({showPaywall:true}); return; }
    const champJustDone = (key==='journey' && idx+1===CHAMP_LEVELS);
    getList(c,key).stage=idx+1; state.sessionListKey=null; ensureCoachWords(key); sfx(champJustDone?'win':'level'); burstConfetti(champJustDone?170:100);
    state.celebrate={ level:idx+2, list:listLabel(key).split(' · ')[0], champ:champJustDone, date:new Date().toLocaleDateString() }; render(); },
  // ----- The Bizzing Bee Journey -----
  startJourney:()=>{ const c=active(); ensureLists(c); c.activeList='journey'; if(!c.lists.journey) c.lists.journey={xp:0};
    state.sessionListKey=null; ensureCoachWords('journey'); set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'revise', luTab:'revise', status:'idle', typed:''});
    flash('Welcome to the Bizzing Bee Journey ✨'); },
  // ----- Champ Challenge: configurable test-out quiz (timed or count, pick a difficulty) -----
  openChallenge:(key)=>{ const c=active(); ensureLists(c); key=key||activeListKey(); clearGTimer();
    set({nav:'coach', screen:'app', coachMode:'challenge', challengeKey:key, chBand:'level', game:null, typed:'', gInfo:false}); },
  chSet:(kv)=>{ const i=String(kv).indexOf(':'); const f=String(kv).slice(0,i), v=String(kv).slice(i+1); const p={};
    if(f==='fmt')p.chFmt=v; else if(f==='count')p.chCount=+v; else if(f==='time')p.chTime=+v; else if(f==='band')p.chBand=v; set(p); },
  chExit:()=>{ clearGTimer(); set({coachMode:'hub', game:null, typed:''}); },
  chStart:()=>{ clearGTimer(); const c=active(); const key=state.challengeKey||activeListKey(); const fmt=state.chFmt||'count';
    let pool=challengePool().filter(w=>w&&w.w); if(pool.length<3){ flash('Not enough words in that band — pick another'); return; }
    const n = fmt==='timed' ? Math.min(240,pool.length) : Math.min(state.chCount||10, pool.length);
    pool=sample(pool, n);
    const g={ type:'champ', list:pool, i:0, right:0, wrong:0, ans:[], status:'play', fmt, champKey:key, champLevel:listStageIdx(c,key)+1, band:state.chBand, total:(fmt==='count'?n:0) };
    if(fmt==='timed') g.timeLeft=state.chTime||60;
    state.game=g; state.typed=''; state.gInfo=false; render(); setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); if(fmt==='timed') startGTimer(); },
  champAdvance:()=>{ const g=state.game; if(!g||!g.canAdvance) return; const key=g.champKey; clearGTimer(); state.game=null; app.advanceStage(key); set({coachMode:'hub'}); },
  // ----- rename a list's display name (per child) -----
  startRename:(key)=>{ const c=active(); set({renameKey:key, renameVal:listLabel(key)}); },
  renameInput:(v)=>{ state.renameVal=v; },     // no re-render: keep input smooth
  cancelRename:()=>set({renameKey:null, renameVal:''}),
  saveRename:()=>{ const c=active(); const key=state.renameKey; if(!key) return; ensureLists(c); if(!c.listNames) c.listNames={};
    const v=(state.renameVal||'').trim().slice(0,40);
    if(v && v!==listBaseLabel(key)) c.listNames[key]=v; else delete c.listNames[key];
    state.sessionLabel=listLabel(key); set({renameKey:null, renameVal:''}); flash('List renamed ✏️'); },
  startBuzz:()=>app.playGame('buzz'),
  // ===== games arcade =====
  openGames:()=>{ clearGTimer(); const c=active(); ensureLists(c); set({nav:'games', screen:'app', game:null, gInfo:false, typed:'', mood:'happy', conceptSel:null}); },
  // ----- Spelling Quest (window.SQ) -----
  openQuest:()=>{ clearGTimer(); if(window.SQ) SQ.open(); },
  // ----- Bee Trivia (window.STV) -----
  openTrivia:()=>{ clearGTimer(); if(window.STV) STV.open(); },
  trvTh:(a)=>{ if(window.STV) STV.setTh(a); },
  trvLv:(a)=>{ if(window.STV) STV.setLv(a); },
  trvQuiz:()=>{ if(window.STV) STV.startQuiz(); },
  trvSquare:()=>{ if(window.STV) STV.startSquare(); },
  trvClock:()=>{ if(window.STV) STV.startClock(); },
  trvPick:(a)=>{ if(window.STV) STV.pick(a); },
  trvCell:(a)=>{ if(window.STV) STV.cell(a); },
  trvHear:()=>{ if(window.STV) STV.hear(); },
  trvExit:()=>{ if(window.STV) STV.exit(); },
  sqExit:()=>{ if(window.SQ) SQ.exit(); },
  sqPickSeason:(a)=>{ if(window.SQ) SQ.pickSeason(a); },
  sqStart:()=>{ if(window.SQ) SQ.startChapter(); },
  sqHear:()=>{ if(window.SQ) SQ.hear(); },
  sqKey:(a)=>{ if(window.SQ) SQ.key(a); },
  sqType:(v)=>{ if(window.SQ) SQ.type(v); },
  sqKeyEnter:(e)=>{ if(window.SQ) SQ.keyEnter(e); },
  sqPick:(a)=>{ if(window.SQ) SQ.pick(a); },
  sqNext:()=>{ if(window.SQ) SQ.next(); },
  sqRetry:()=>{ if(window.SQ) SQ.retry(); },
  sqHearLine:(a)=>{ if(window.SQ) SQ.hearLine(a); },
  sqBeat:()=>{ if(window.SQ) SQ.beatNext(); },
  sqHearBeat:(a)=>{ if(window.SQ) SQ.hearBeat(a); },
  sqToChallenge:()=>{ if(window.SQ) SQ.toChallenge(); },
  sqGoCh:(a)=>{ if(window.SQ) SQ.goCh(a); },
  sqBrief:()=>{ if(window.SQ) SQ.showBrief(); },
  sqBegin:()=>{ if(window.SQ) SQ.beginSeason(); },
  // ----- Magic Squares -----
  magicCell:(i)=>{ const g=state.game; if(!g||g.type!=='magic') return; i=+i; if(g.board[i].done){ flash('That square is already yours ⭐'); return; }
    g.qs=magicBuildQs(g.board[i].id); if(g.qs.length<5){ flash('Not enough words in that theme yet'); return; }
    g.cell=i; g.qi=0; g.right=0; g.picked=null; g.ok=null; g.revealed=false; g.status='play'; state.typed='';
    render(); const q=g.qs[0]; if(q.k==='spell') setTimeout(()=>say(q.w.w),350); },
  magicPick:(c)=>{ const g=state.game; if(!g||g.status!=='play'||g.picked!=null) return; const q=g.qs[g.qi];
    g.picked=c; g.ok=(nkey(c)===nkey(q.w.w)); if(g.ok){ g.right++; sfx('correct'); addCoins(1); g.coins++; } else sfx('wrong');
    render(); setTimeout(magicAdvance, g.ok?900:1700); },
  magicKey:(e)=>{ if(e.key==='Enter') app.magicSubmit(); },
  magicSubmit:()=>{ const g=state.game; if(!g||g.status!=='play'||g.revealed) return; const q=g.qs[g.qi];
    const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word first'); return; }
    g.revealed=true; g.ok=(ans===q.w.w.toLowerCase());
    logBand(q.w, g.ok);
    if(g.ok){ g.right++; sfx('correct'); addCoins(1); g.coins++; markMastered(nkey(q.w.w)); } else { sfx('wrong'); addMiss(q.w); }
    render(); setTimeout(magicAdvance, g.ok?900:2100); },
  magicHear:()=>{ const g=state.game; if(g&&g.qs&&g.qs[g.qi]) say(g.qs[g.qi].w.w); },
  magicBoard:()=>{ const g=state.game; if(!g) return; g.status='board'; g.celebr=null; state.typed=''; render(); },
  magicNew:()=>magicNewBoard(),
  openShop:()=>{ try{ loadConcepts(); }catch(e){} set({nav:'shop', screen:'app', game:null, conceptSel:null}); },
  shopTab:(t)=>set({shopTab:t}),
  celebrateLore:(n)=>{ state.celebrate=null; app.openLesson(n); },
  duelName:(v)=>{ state.game.p[1].name=(v||'Player 2').slice(0,16); },
  duelBegin:()=>{ const g=state.game; g.phase='play'; g.turn=0; g.i=0; state.typed=''; render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[0]) say(gg.list[0].w); },350); },
  duelSay:()=>{ const g=state.game; if(g&&g.list[g.i]) say(g.list[g.i].w); },
  duelType:(v)=>{ state.typed=v; },
  duelKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.duelEnter(); } },
  duelEnter:()=>{ const g=state.game; const w=g.list[g.i]; if(!w) return;
    const ok=nkey(state.typed)===nkey(w.w); if(g.turn===0) logBand(w,ok); /* only the profile owner's turn counts toward their Band */
    if(ok){ g.p[g.turn].right++; sfx('right'); } else sfx('wrong');
    state.typed=''; g.i++;
    if(g.i>=g.list.length){ if(g.turn===0){ g.phase='pass'; render(); return; }
      g.phase='done'; const a=g.p[0].right,b=g.p[1].right; addCoins(a===b?8:12); sfx('win'); burstConfetti(120); render(); return; }
    render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[gg.i]) say(gg.list[gg.i].w); },300); },
  duelP2:()=>{ const g=state.game; g.turn=1; g.i=0; g.phase='play'; state.typed=''; render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[0]) say(gg.list[0].w); },350); },
  openTraps:()=>{ try{ loadConcepts(); }catch(e){} set({nav:'traps', screen:'app', trapSel:null, conceptSel:null}); },
  openEvo:()=>set({nav:'evolution', screen:'app'}),
  openCollection:()=>set({nav:'collection', screen:'app'}),
  collTab:(t)=>set({collTab:t}),
  buyAvatar:(id)=>{ const c=active(); const a=SB_AVATARS.byId[id]; if(!a||avOwned(c,id)) return;
    if(!spendCoins(a.price)){ flash('Need '+a.price+' 🪙 — play games and clear Levels to earn!'); return; }
    (c.avOwned=c.avOwned||{})[id]=1; c.avatar=id; save(); sfx('win'); burstConfetti(120); flash('✨ '+a.name+' joined your collection!'); render(); },
  sellAvatar:(id)=>{ const c=active(); const a=SB_AVATARS.byId[id]; if(!a||a.rarity==='free'||!((c.avOwned||{})[id])) return;
    if(c.avatar===id){ flash('Pick a different avatar first — you can\'t sell the one you\'re wearing'); return; }
    delete c.avOwned[id]; addCoins(a.sell); save(); sfx('coin'); flash('Sold '+a.name+' for '+a.sell+' 🪙'); render(); },
  // ----- avatar packs: probability drop (62% rare · 30% epic · 8% legendary, unowned only) -----
  buyPack:(pk)=>{ const c=active(); const pool=SB_AVATARS.list.filter(a=>a.pack===pk&&!avOwned(c,a.id));
    if(!pool.length){ flash('You own this whole pack! 🎉'); return; }
    if(!window.confirm('Open this avatar pack for 150 coins? You get one surprise avatar you don’t own yet.')) return;
    if(!spendCoins(150)){ flash('Need 150 🪙 — play games and clear Levels to earn!'); return; }
    const tiers=[['rare',.62],['epic',.30],['legendary',.08]].filter(t=>pool.some(a=>a.rarity===t[0]));
    const tot=tiers.reduce((s,t)=>s+t[1],0); let roll=Math.random()*tot; let tier=tiers[tiers.length-1][0];
    for(const t of tiers){ if(roll<t[1]){ tier=t[0]; break; } roll-=t[1]; }
    const cand=pool.filter(a=>a.rarity===tier); const win=cand[Math.floor(Math.random()*cand.length)];
    (c.avOwned=c.avOwned||{})[win.id]=1; save();
    sfx(win.rarity==='legendary'?'win':'coin'); burstConfetti(win.rarity==='legendary'?150:(win.rarity==='epic'?100:60));
    set({packDrop:win.id}); },
  packClose:()=>set({packDrop:null}),
  packWear:()=>{ const id=state.packDrop; if(id){ const c=active(); c.avatar=id; save(); sfx('correct'); } set({packDrop:null}); },
  openShopAvatars:()=>{ state.shopTab='avatars'; app.openShop(); },
  wearAv:(id)=>{ const c=active(); if(!avOwned(c,id)){ flash('Not collected yet'); return; } c.avatar=id; save(); sfx('correct'); render(); },
  trapPick:(k)=>set({trapSel:k}),
  trapBack:()=>set({trapSel:null}),
  drillTrap:(k)=>{ const ws=trapWords(k); if(!ws.length){ flash('No words for this trap right now'); return; }
    state.sessionWords=ws; state.sessionListKey='__trap__'; state.sessionLabel='Trap drill'; state.gi=0; state.coachSession=false; state.trainBack='home'; app.startTrain(); },
  gReveal:()=>{ const g=state.game; if(!g||g.type!=='boss') return; const c=active(); if(((c.pow||{}).reveal||0)<=0) return;
    const w=g.list[g.i]; if(!w) return; const cur=(state.typed||''); if(cur.length>=w.w.length) return;
    c.pow.reveal--; state.typed=w.w.slice(0,cur.length+1); save(); sfx('coin'); render();
    try{ document.querySelector('[data-fkey="gType"],[data-inp="gType"]')?.focus(); }catch(e){} },
  buyPower:(k)=>{ const c=active(); const cost={freeze:80,shield:60,reveal:40,time:40,cheer:20}[k]||40; if(!window.confirm('Buy this power-up for '+cost+' coins?')) return;
    if(k==='cheer'){ if(!spendCoins(20)){ flash('Need 20 🪙 — one warm-up round gets you there!'); return; }
      save(); sfx('win'); burstConfetti(200); try{ say('Hip hip hooray for '+(c.name||'our speller')+'! You are amazing!'); }catch(e){}
      flash('🎉 Bizzy cheers for '+(c.name||'you')+'!'); render(); return; }
    if(!spendCoins(cost)){ flash('Need '+cost+' 🪙 — play games to earn!'); return; }
    if(k==='freeze') c.freezes=(c.freezes||0)+1; else { if(!c.pow) c.pow={}; c.pow[k]=(c.pow[k]||0)+1; }
    save(); sfx('coin'); flash(k==='freeze'?'🧊 Streak Freeze stocked!':'🎒 Artifact stocked!'); render(); },
  buyAcc:(k)=>{ const c=active(); if(!window.confirm('Buy this accessory for 120 coins?')) return; if(!spendCoins(120)){ flash('Need 120 🪙 — play games to earn!'); return; }
    if(!c.beeAcc) c.beeAcc={}; c.beeAcc[k]=1; c.accOn=k; save(); sfx('win'); burstConfetti(50); flash('New bee style! ✨'); render(); },
  wearAcc:(k)=>{ const c=active(); c.accOn=(c.accOn===k?null:k); save(); render(); },

  toggleSound:()=>{ set({sound:!state.sound}); if(state.sound) sfx('coin'); },
  devTap:()=>{ state._devTaps=(state._devTaps||0)+1;
    if(state._devTaps>=7){ state._devTaps=0; state.devReveal=!state.devReveal; flash(state.devReveal?'🛠 Testing tools revealed':'🛠 Testing tools hidden'); render(); } },
  toggleDevUnlock:()=>{ const on=!state.devUnlock; state.devUnlock=on; state.premium=on?true:false; try{localStorage.setItem('sb_devunlock',on?'1':'0');}catch(e){} save(); flash(on?'🔓 All features & content unlocked (testing)':'🔒 Locked features restored'); render(); },
  playGame:(type)=>{ clearGTimer(); const c=active(); ensureLists(c); state.gInfo=false; state.typed='';
    if(type==='buzz'){ const list=pickFresh(gameWordsD(),10); if(!list.length){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,right:0,ans:[],status:'idle'}; setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='beat'){ state.game={type:'beat',phase:'mode'}; set({nav:'games',screen:'app'}); return; }
    else if(type==='wordquiz'){ state.game={type:'wordquiz',phase:'pick'}; set({nav:'games',screen:'app'}); return; }
    else if(type==='duel'){ const list=pickFresh(gameWordsD(),10); if(list.length<5){ flash('No words yet — try a list first'); return; }
      state.game={type,list:list.slice(0,10),phase:'setup',p:[{name:c.name||'Player 1',right:0},{name:'Player 2',right:0}],turn:0,i:0,status:'play'}; state.typed=''; }
    else if(type==='boss'){ const list=pickFresh(gameWordsD(), 60); if(list.length<3){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,hp:8,maxhp:8,lives:3,maxlives:3,right:0,status:'play',last:null}; setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='magic'){ magicNewBoard(); }
    else return;
    set({nav:'games', screen:'app'}); },
  setGameDiff:(k)=>{ const c=active(); c.gameDiff=k; save(); render(); },
  champTen:()=>{ const c=active(); const keep=c.gameDiff; c.gameDiff='champ';
    const list=pickFresh(gameWordsD(),10); c.gameDiff=keep;
    if(list.length<3){ flash('Not enough champ words yet — play a little first'); return; }
    state.game={type:'buzz',list,i:0,right:0,ans:[],status:'idle'};
    set({nav:'games', screen:'app'}); setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); },
  exitGame:()=>{ clearGTimer(); set({game:null, gInfo:false, typed:''}); },
  // Beat the Buzzer now hosts a mode picker: a relaxed 10-word warm-up (the old
  // Buzz of the Day) or the 60-second sprint.
  beatStart:(mode)=>{ clearGTimer(); if(mode==='warmup'){ app.playGame('buzz'); return; }
    const c=active(); const list=pickFresh(gameWordsD(),240); if(list.length<3){ flash('No words yet — try a list first'); return; }
    let _t=60; if(((c.pow||{}).time||0)>0){ c.pow.time--; _t=75; save(); setTimeout(()=>flash('⚡ +15s boost active!'),200); }
    state.game={type:'beat',mode:'sprint',list,i:0,right:0,wrong:0,timeLeft:_t,status:'play'}; startGTimer();
    setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); set({nav:'games',screen:'app'}); },
  // Word Quiz hosts a round picker: Meanings / Spellings / Origins, or a Mixed set.
  wqStart:(round)=>{ clearGTimer(); state.gInfo=false; state.typed='';
    let qs=[];
    if(round==='mixed'){ qs=[].concat(buildMC('meaning',4),buildMC('spell',3),buildMC('origin',3)); qs=sample(qs, Math.min(10,qs.length)); }
    else if(round==='idiom'||round==='simile'){ qs=buildFigQs(round,10); }
    else if(round==='vocab'){ qs=buildVocabQs(10); }
    else { qs=buildMC(round,10); }
    if(qs.length<3){ flash(round==='origin'?'Need a few words with a known origin — train a list first':'Need a few more words for this round — train a list first'); return; }
    state.game={type:'wordquiz',round,qs,i:0,picked:null,right:0,status:'play'};
    set({nav:'games',screen:'app'}); setTimeout(()=>{ const G=state.game; if(G&&G.qs) mcSpeak(G.qs[G.i||0]); },320); },
  gReplay:()=>{ const g=state.game; if(!g) return; if(g.type==='wordquiz'&&g.round){ app.wqStart(g.round); return; }
    if(g.type==='beat'){ app.beatStart(g.mode||'sprint'); return; } if(g.type) app.playGame(g.type); },
  gSay:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w); },
  gSaySlow:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w,0.6); },
  gSayQ:()=>{ const g=state.game; const q=g&&g.qs&&g.qs[g.i]; mcSpeak(q); },
  gInfoToggle:()=>set({gInfo:!state.gInfo}),
  gKey:(e)=>{ if(e.key==='Enter') app.gSubmit(); },
  gSubmit:()=>{ const g=state.game; if(!g||g.qs||g.wait) return; const w=g.list[g.i]; const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word, then Enter'); return; }
    const ok=ans===nkey(w.w); logGameWord(nkey(w.w)); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); }
    else { addMiss(w); sfx('wrong'); }
    if(!g.rw) g.rw=[]; g.rw.push({w:w.w, ok});
    const advance=()=>{ g.fb=null; g.wait=false; g.i++; if(g.i>=g.list.length){ const fresh=pickFresh(gameWordsD(), g.list.length); g.list=fresh.length?fresh:sample(g.list); g.i=0; } state.typed=''; state.gInfo=false; setTimeout(()=>{ if(state.game&&state.game.list[state.game.i]) say(state.game.list[state.game.i].w); },180); };
    // on a miss, EVERY game stops to show the word big and say it — that's how the word sticks
    const missPause=(fin,ms)=>{ g.fb={ok:false,word:w.w}; g.wait=true; try{ say(w.w); }catch(e){} render();
      setTimeout(()=>{ const G=state.game; if(G!==g) return; if(fin){ fin(); } else { advance(); render(); } }, ms); };
    if(g.type==='buzz'){ g.ans.push({w,val:state.typed,ok}); if(ok){ g.right++; addCoins(1); gainXp(); }
      const last=!(g.i+1<g.list.length);
      if(!ok){ missPause(last?gFinishBuzz:null, 2200); } else if(last){ gFinishBuzz(); } else { advance(); render(); } }
    else if(g.type==='beat'){ if(ok){ g.right++; addCoins(1); gainXp(); advance(); render(); } else { g.wrong++; missPause(null, 1400); } }
    else if(g.type==='boss'){ if(ok){ g.hp=Math.max(0,g.hp-1); g.right++; addCoins(1); gainXp(); g.last={ok:true,word:w.w}; if(g.hp<=0){ gFinishBoss(true); return; } advance(); render(); }
      else { const cc=active(); if(((cc.pow||{}).shield||0)>0){ cc.pow.shield--; save(); g.last={ok:false,word:w.w,shielded:true}; flash('🛡️ Boss Shield absorbed the miss!'); advance(); render(); }
        else { g.lives--; g.last={ok:false,word:w.w}; if(g.lives<=0){ missPause(()=>gFinishBoss(false), 2000); return; } missPause(null, 2000); } } }
    else if(g.type==='champ'){ g.ans.push({w,ok}); if(ok){ g.right++; addCoins(1); } else g.wrong++;
      if(g.fmt==='count' && (g.i+1>=g.total || g.i+1>=g.list.length)){ gFinishChamp(); return; } advance(); render(); }
  },
  gPick:(idx)=>{ const g=state.game; if(!g||!g.qs||g.picked!=null) return; idx=+idx; const q=g.qs[g.i]; g.picked=idx; const ok=q.choices[idx]===q.answer; logGameWord(nkey(q.word));
    const spellingGame = ['origin','idiom','simile2','vocab'].indexOf(q.kind)<0; // knowledge rounds don't count as spelling mastery
    logBand(q.wordObj||q.word, ok, spellingGame?0.5:0);
    if(ok){ g.right++; addCoins(1); gainXp(); if(spellingGame){ markMastered(nkey(q.word)); clearMiss(q.word); } sfx('correct'); }
    else { sfx('wrong'); if(spellingGame && q.wordObj){ addMiss(q.wordObj); (g.miss=g.miss||[]).push(q.word); } try{ say(q.word); }catch(e){} }
    if(!g.rw) g.rw=[]; g.rw.push({w:q.word, ok});
    render();
    setTimeout(()=>{ const G=state.game; if(!G) return; if(G.i+1<G.qs.length){ G.i++; G.picked=null; render(); mcSpeak(G.qs[G.i]); } else { gFinishMC(); } }, ok?950:2400); },
  coachTab:(t)=>set({coachTab:t}),
  setCoachDate:(v)=>{ const c=active(); c.milestone={ label:(c.milestone&&c.milestone.label)||'the bee', date:v||null }; if(!v) c.milestone=null; set({coachDate:v||null}); },
  setCoachGoal:(v)=>{ const n=parseInt(v,10); set({coachGoal:(n&&n>0)?n:20}); },
  setCoachTarget:(key)=>{ const cat=coachCatalog().find(c=>c.key===key); state.coachTargetKey=key; state.coachTargetLabel=cat?cat.label:key; if(cat) flash('Target list set: '+cat.label); else render(); },
  coachRec:()=>{ const k=coachPhase().key; if(k==='breadth') app.coachStudy(); else if(k==='depth') app.coachWeakDrill(); else if(k==='sim') app.startWritten(); },
  say:(w)=>say(w),
  setCustomText:(v)=>{ state.customText=v; render(); },
  enrichCustom:()=>{ const raw=state.customText||''; const words=raw.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
    if(!words.length){ flash('Type or paste some words first'); return; }
    const db=wordDB(); const found=[],missing=[]; const seen=new Set();
    words.forEach(w=>{ const k=nkey(w); if(seen.has(k))return; seen.add(k); const hit=db.get(k); if(hit) found.push(hit); else missing.push({w:w.trim(),d:'',s:'',p:'',o:'',r:'',y:4}); });
    state.customWords=found.concat(missing); state.coachTargetKey='custom'; state.coachTargetLabel='My custom list';
    state.enrichResult='✓ '+found.length+' enriched from the database'+(missing.length?(' · '+missing.length+' kept as-is (not in database)'):'');
    app.selectList('custom'); },
  setAiPrompt:(v)=>{ state.aiPrompt=v; render(); },
  generateAiList:()=>{ const prompt=(state.aiPrompt||'').trim(); if(!prompt){ flash('Describe the list you want'); return; }
    if(!(window.claude && window.claude.complete)){ set({aiError:'AI is unavailable in this build. Use a target list, paste your own words, or pick an origin filter instead.'}); return; }
    set({aiLoading:true, aiError:''}); /* (online AI path omitted in offline build) */ },
  coachStudy:()=>{ const pool=sample(coachPool(), Math.min(state.coachGoal||15,15)); if(!pool.length){ flash('No words available'); return; } state.sessionWords=pool; state.sessionLabel='Coach study'; state.gi=0; state.coachSession=true; state.trainBack='coach'; app.startTrain(); },
  coachWeakDrill:()=>{ const list=coachWeakList(20); if(!list.length){ flash('No weak words yet — play a round first'); return; } state.sessionWords=list; state.sessionLabel='Weak-word drill'; state.gi=0; state.coachSession=true; state.trainBack='coach'; app.startTrain(); },
  reviseMisses:()=>{ const c=active(); const list=(c.missed||[]).slice(0,20); if(!list.length){ flash('No missed words yet — nice work!'); return; } state.sessionWords=list.map(m=>({w:m.w,d:m.d||'',s:m.s||'',p:m.p||'',o:m.o||'',r:m.r||'',y:m.y||3})); state.sessionLabel='Revise misses'; state.gi=0; state.coachSession=false; app.startTrain(); },
  parentLogToggle:(i)=>{ i=+i; set({parentLogOpen: state.parentLogOpen===i?null:i}); },
  // ===== Word Journeys (etymology lessons) =====
  openJourneys:()=>{ set({nav:'journeys', screen:'app', lessonSel:null, conceptSel:null, game:null, mood:'happy'}); },
  journeySetView:(v)=>set({journeyView:v, journeyPage:0}),
  journeyPagePrev:()=>set({journeyPage:Math.max(0,(state.journeyPage||0)-1)}),
  journeyPageNext:()=>set({journeyPage:(state.journeyPage||0)+1}),
  openLesson:(n)=>{ const earned=+n<=loreCount(); if(!state.premium && !earned){ set({showPaywall:true}); return; } const L=lessonsAll().find(x=>x.n===+n); if(!L) return; set({nav:'journeys', screen:'app', lessonSel:L, lessonWordsOpen:false, lessonGuided:(state.journeyView==='guided'), lessonStep:0}); try{window.scrollTo(0,0);}catch(e){} },
  lessonBack:()=>set({lessonSel:null}),
  lessonStepGo:(i)=>{ set({lessonStep:+i}); try{window.scrollTo(0,0);}catch(e){} },
  lessonStepPrev:()=>{ set({lessonStep:Math.max(0,(state.lessonStep||0)-1)}); try{window.scrollTo(0,0);}catch(e){} },
  lessonStepNext:()=>{ set({lessonStep:(state.lessonStep||0)+1}); try{window.scrollTo(0,0);}catch(e){} },
  lessonWordsToggle:()=>set({lessonWordsOpen:!state.lessonWordsOpen}),
  practiseLesson:()=>{ const L=state.lessonSel; if(!L) return; const ws=lessonWordObjs(L); if(!ws.length){ flash('No words in this lesson'); return; } state.sessionWords=ws; state.sessionListKey='__lesson__'; state.sessionLabel=L.id+' · '+L.title; state.gi=0; state.coachSession=false; app.startTrain(); },
  // ===== evolution-tile design feedback tool =====
  openEvoFeedback:()=>{ loadEvoFB(); set({nav:'evofeedback', screen:'app', evoSel:null, conceptSel:null, game:null}); },
  evoSelect:(key)=>set({evoSel:key}),
  evoRate:(rate)=>{ const k=state.evoSel; if(!k) return; EVOFB[k]={...(EVOFB[k]||{}), rate}; saveEvoFB(); render(); },
  evoNote:(v)=>{ const k=state.evoSel; if(!k) return; EVOFB[k]={...(EVOFB[k]||{}), note:v}; saveEvoFB(); }, // no re-render: keep textarea smooth
  evoClearTile:()=>{ const k=state.evoSel; if(k){ delete EVOFB[k]; saveEvoFB(); render(); } },
  evoExport:()=>{ const themes=Object.keys(EV_NOMEN); const lines=[]; let n=0;
    themes.forEach(t=>{ (EV_NOMEN[t]||[]).forEach((nm,i)=>{ const fb=EVOFB[t+':'+i]; if(fb&&(fb.rate||fb.note)){ n++; lines.push((THEME_LABEL[t]||t)+' · Lv'+(i+1)+' '+nm+' — '+(fb.rate||'(note)')+(fb.note?(' — '+fb.note):'')); } }); });
    if(!n){ flash('No feedback yet — tap a tile to rate or note it'); return; }
    const text='BIZZING BEE — evolution tile feedback ('+n+' tiles)\n\n'+lines.join('\n')+'\n\n--- raw json ---\n'+JSON.stringify(EVOFB);
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to export the feedback'); return; }
    w.document.write('<!doctype html><meta charset="utf-8"><title>Tile feedback</title><body style="font-family:system-ui,Arial;padding:18px;max-width:760px;margin:0 auto"><h2 style="margin:0 0 4px">Evolution tile feedback</h2><p style="color:#666;margin:0 0 12px">Select all, copy, and paste this back to your developer.</p><textarea style="width:100%;height:78vh;font-family:monospace;font-size:13px;padding:10px;border:1px solid #ccc;border-radius:6px">'+text.replace(/</g,'&lt;')+'</textarea></body>'); w.document.close(); },
  printReport:()=>{ try{ const c=active(); ensureLists(c); const t=todayKey();
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to print the report'); return; }
    const played=new Set(c.daysPlayed||[]); const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const last7=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); last7.push({on:played.has(k), label:dn[d.getDay()]}); }
    const daysThisWeek=last7.filter(x=>x.on).length;
    const mastered=masteredCount();
    const tsKey=(ts)=>{ const d=new Date(ts); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    const recent=(c.activity||[]).filter(a=>a.ts && dayDiff(tsKey(a.ts), t)<=7);
    const sessions=recent.length; const totDone=recent.reduce((s,a)=>s+(a.done||0),0); const totRight=recent.reduce((s,a)=>s+(a.right||0),0);
    const acc=totDone?Math.round(totRight/totDone*100):0;
    const misses=(c.missed||[]).slice(0,24);
    const ov=listStageIdx(c,activeListKey())+1; const bnd=beeBand(c);
    const E=(s)=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const dotRow=last7.map(d=>`<td style="text-align:center;padding:4px"><div style="width:30px;height:30px;border-radius:6px;margin:0 auto;background:${d.on?'#7C5CFF':'#e7e3f5'}"></div><div style="font-size:12px;color:#888;margin-top:3px">${d.label}</div></td>`).join('');
    const missChips=misses.length?misses.map(m=>`<span style="display:inline-block;border:1px solid #ddd;border-radius:20px;padding:3px 10px;margin:3px;font-size:12px;font-family:monospace">${E(m.w)}${m.n>1?(' ×'+m.n):''}</span>`).join(''):'<i style="color:#888">No misses — great week!</i>';
    const html='<!doctype html><html><head><meta charset="utf-8"><title>Bizzing Bee — '+E(c.name)+'</title>'+
      '<style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1a1530;max-width:740px;margin:0 auto;padding:28px}h1{font-size:24px;margin:0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:#7C5CFF;margin:26px 0 10px;border-bottom:2px solid #eee;padding-bottom:6px}.row{display:flex;gap:14px;flex-wrap:wrap}.stat{flex:1;min-width:120px;border:1px solid #eee;border-radius:10px;padding:14px;text-align:center}.stat b{display:block;font-size:24px}.stat span{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.04em}@media print{body{padding:0}button{display:none}}</style></head><body>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #7C5CFF;padding-bottom:12px"><div><div style="font-size:13px;color:#7C5CFF;font-weight:800;letter-spacing:.08em">BIZZING BEE · WEEKLY REPORT</div><h1>'+E(c.name)+'</h1></div><div style="text-align:right;font-size:12px;color:#888">'+new Date().toLocaleDateString()+'<br>Age '+E(c.age||9)+'</div></div>'+
      '<h2>This week at a glance</h2><div class="row"><div class="stat"><b>'+daysThisWeek+'/7</b><span>Days practised</span></div><div class="stat"><b>'+(c.streak||0)+'</b><span>Day streak</span></div><div class="stat"><b>'+sessions+'</b><span>Sessions</span></div><div class="stat"><b>'+acc+'%</b><span>Accuracy</span></div></div>'+
      '<table style="width:100%;margin-top:16px;border-collapse:collapse"><tr>'+dotRow+'</tr></table>'+
      '<h2>Progress</h2><div class="row"><div class="stat"><b>'+ov+'</b><span>Level ('+E(listLabel(activeListKey()))+')</span></div><div class="stat"><b>'+mastered+'</b><span>Words mastered</span></div><div class="stat"><b>'+totRight+'</b><span>Correct this week</span></div><div class="stat"><b>'+bnd.band+'</b><span>Bee Band · '+E(bnd.tier)+'</span></div></div>'+
      '<h2>Words to revise ('+(c.missed||[]).length+')</h2><div>'+missChips+'</div>'+
      (milestone()?('<h2>Countdown</h2><p style="font-size:15px">'+esc(milestone().label)+' — <b>'+milestone().days+' days</b> to go.</p>'):'')+
      (function(){ try{ const sg=parentSignals(); let rd=0; try{ rd=coachReadiness().ready||0; }catch(e){}
        const rows=[['Consistency',sg.consistency],['Accuracy',sg.acc],['Coverage',sg.coverage],['Review health',sg.reviewHealth],['Readiness',rd]]
          .map(x=>'<td style="padding:6px 10px;border:1px solid #ddd;text-align:center"><b style="font-size:17px">'+Math.max(0,Math.min(100,Math.round(x[1]||0)))+'%</b><br><span style="font-size:11px;color:#666">'+x[0]+'</span></td>').join('');
        const tips=parentTips().slice(0,3).map(t=>'<li style="margin:5px 0;font-size:13px;line-height:1.45">'+t.text+'</li>').join('');
        return '<h2>Readiness signals</h2><table style="border-collapse:collapse;width:100%"><tr>'+rows+'</tr></table>'+
               '<h2>Coach&#39;s corner — this week&#39;s tips</h2><ol style="padding-left:20px">'+tips+'</ol>'; }catch(e){ return ''; } })()+
      '<div style="margin-top:24px;text-align:center"><button onclick="window.print()" style="background:#7C5CFF;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-weight:700;font-size:15px;cursor:pointer">🖨️ Print / Save as PDF</button></div>'+
      '<p style="text-align:center;color:#aaa;font-size:12px;margin-top:18px">Generated by Bizzing Bee · keep practising a little every day 🐝</p>'+
      '</body></html>';
    w.document.write(html); w.document.close(); setTimeout(()=>{ try{ w.focus(); }catch(e){} }, 300);
  }catch(e){ flash('Could not open the report'); } },
  exitCoachMode:()=>set({coachMode:'hub', wr:null, or:null, typed:'', orFeedback:''}),
  // written round
  startWritten:()=>{ const list=sample(coachPool(), Math.min(15,state.coachGoal||15)); if(!list.length){ flash('No words available'); return; } set({coachMode:'written', wr:{list,i:0,ans:[]}, typed:'', wrInfoKey:''}); setTimeout(()=>{ const w=list[0]; if(w) say(w.w); },300);
    setTimeout(()=>{ try{ document.querySelector('[data-fkey="typed"]')?.focus(); }catch(e){} },80); },
  wrInfo:(kind)=>{ const key=state.wrInfoKey===kind?'':kind; if(key==='sent'){ const w=state.wr.list[state.wr.i]; if(w&&w.s) say(w.s); } set({wrInfoKey:key}); },
  wrSay:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w); },
  wrSaySlow:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w,0.6); },
  wrKey:(e)=>{ if(e.key==='Enter') app.wrNext(); },
  wrNext:()=>{ const S=state; const wr=S.wr; const w=wr.list[wr.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); addCoins(1); gainXp(); } else { addMiss(w); sfx('wrong'); }
    const ans=wr.ans.concat([{w,val:S.typed,ok}]);
    if(wr.i+1<wr.list.length){ set({wr:{...wr,i:wr.i+1,ans}, typed:'', wrInfoKey:''}); setTimeout(()=>{ const nx=wr.list[wr.i+1]; if(nx) say(nx.w); },250); }
    else { const rgt=ans.filter(a=>a.ok).length; logActivity('written','Written round', {done:ans.length,right:rgt}, ans.filter(a=>!a.ok).map(a=>a.w)); set({wr:{...wr,ans}, coachMode:'wrdone'}); } },
  // oral
  startOral:()=>{ const pool=sample(coachPool()); if(!pool.length){ flash('No words available'); return; } set({coachMode:'oral', or:{pool,i:0,round:0,last:null}, typed:'', orInfoKey:'', orFeedback:''}); setTimeout(()=>{ const w=pool[0]; if(w) say(w.w); },300); },
  orInfo:(kind)=>{ const key=state.orInfoKey===kind?'':kind; if(key==='sent'){ const w=state.or.pool[state.or.i]; if(w&&w.s) say(w.s); } set({orInfoKey:key}); },
  wrInfoDef:()=>app.wrInfo('def'), wrInfoSent:()=>app.wrInfo('sent'), wrInfoOrig:()=>app.wrInfo('orig'),
  orInfoDef:()=>app.orInfo('def'), orInfoSent:()=>app.orInfo('sent'), orInfoOrig:()=>app.orInfo('orig'),
  orSay:()=>{ const or=state.or; const w=or&&or.pool[or.i]; if(w) say(w.w); },
  orSaySlow:()=>{ const or=state.or; const w=or&&or.pool[or.i]; if(w) say(w.w,0.6); },
  orKey:(e)=>{ if(e.key==='Enter') app.orJudge(); },
  orJudge:()=>{ const S=state; const or=S.or; const w=or.pool[or.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); addCoins(1); gainXp(); const round=or.round+1; state.or={...or,round}; state.coachBestRounds=Math.max(state.coachBestRounds||0,round); state.orFeedback='✓ Correct — advancing! ('+round+' in a row)'; say('Correct!'); render();
      setTimeout(()=>{ if(!state.or) return; let ni=state.or.i+1; let np=state.or.pool; if(ni>=np.length){ np=sample(np); ni=0; } state.or={...state.or,i:ni,pool:np}; state.typed=''; state.orInfoKey=''; state.orFeedback=''; render(); const nx=state.or&&state.or.pool[state.or.i]; if(nx) say(nx.w); },1000);
    } else { addMiss(w); say('Incorrect'); logActivity('oral','Oral elimination', {done:(or.round||0)+1,right:or.round||0}, [w]); set({coachMode:'orgone', or:{...or,last:w}}); } },
  // parent / settings / paywall
  addChild:()=>set({screen:'onboarding', onbStep:0, addingMore:true, draft:{name:'',age:9,avatar:'panda',goal:10}}),
  selectChild:(i)=>{ i=+i; state.activeIdx=i; const c=state.children[i]; ensureLists(c); state.theme=(c&&c.theme)||'spellbound'; state.parentLogOpen=null; state.sessionListKey=null; syncMissed(); render(); },
  goPaywall:()=>set({showPaywall:true}), closePaywall:()=>set({showPaywall:false}),
  pickPlan:(p)=>set({plan:p}), upgrade:()=>{ pinGate(()=>{ set({premium:true, showPaywall:false}); flash('Welcome to Premium! 👑'); },'Start free trial — grown-ups only'); },
  signOut:()=>set({screen:'landing', nav:'home', email:'', pw:''}),
  celebrateClose:()=>set({celebrate:null}),
  setAgeMode:(m)=>{ const c=active(); c.ageMode=m; save(); render(); },
  setLight:()=>app.setMode('light'), setWhite:()=>app.setMode('white'), setDusk:()=>app.setMode('dusk'),
  cycleMode:()=>{ const o=['light','white','dusk']; app.setMode(o[(o.indexOf(state.mode)+1)%3]); },
  profName:(v)=>{ const c=active(); c.name=(v||'').slice(0,24); save(); }, /* no per-key render (input keeps its own value) */
  profAge:(v)=>{ const c=active(); const n=parseInt(v,10); if(n>=5&&n<=18){ c.age=n; save(); render(); } },
  profGoal:(v)=>{ const c=active(); c.goal=+v||10; save(); render(); flash('Daily goal set to '+c.goal+' words'); },
  profAvatar:(id)=>{ const c=active(); c.avatar=id; save(); render(); },
  profMsLabel:(v)=>{ const c=active(); if(c.milestone) c.milestone.label=(v||'').slice(0,30)||'the bee'; else c.milestone={ label:(v||'').slice(0,30)||'the bee', date:null }; save(); },
  profMsDate:(v)=>{ const c=active(); if(!v){ c.milestone=null; } else { c.milestone={ label:(c.milestone&&c.milestone.label)||'the bee', date:v }; } save(); render(); },
  landType:(v)=>{ state.landTyped=v; },
  landKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.landCheck(); } },
  landCheck:()=>{ const w=LAND_WORDS[state.landIdx||0]; if((state.landTyped||'').trim().toLowerCase()===w){ state.landDone=true; state.landTyped=''; state.landIdx=((state.landIdx||0)+1)%LAND_WORDS.length; try{ sfx('correct'); burstConfetti(90); }catch(e){} render(); setTimeout(()=>{ state.landDone=false; render(); },2600); } else { flash('Almost — check it letter by letter!'); } },
  bandUpClose:()=>set({bandUp:null}),
  voiceSetDevice:(v)=>{ VOICE.name=v||''; saveVoiceCfg(); loadVoices(); flash(VOICE.name?'Voice set ✨':'Using the best available voice'); },
  voiceTest:()=>{ say('Hi! I am your spelling buddy. Try this word: iridescent. The soap bubble had an iridescent shine.'); },
  noop:()=>{},
};

/* ===================================================================== */
/*  View — builds the HTML for the current state                          */
/* ===================================================================== */
const diffMap = { easy:['Easy','#1f9d57'], medium:['Medium','#c08a00'], hard:['Hard','#d63a3a'] };
const LAND_WORDS=['iridescent','bouquet','rhythm','marvelous'];
const diffStyleFor = (d) => 'padding:3px 9px;border-radius:999px;font-size:12px;font-weight:800;color:#fff;background:'+(diffMap[d]||diffMap.medium)[1];
const seg = (on) => 'padding:7px 15px;border-radius:999px;font-weight:800;font-size:13px;transition:.2s;'+(on?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)');
const chip = (on) => 'padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line);transition:.2s;'+(on?'background:var(--accent);color:#fff;border-color:transparent':'background:var(--surface2);color:var(--text)');

function view(){
  const S = state;
  if(S.screen==='landing') return viewLanding();
  if(S.screen==='auth') return viewAuth();
  if(S.screen==='onboarding') return viewOnboarding();
  return viewApp();
}

function viewLanding(){
  const features=[
    { ic:'volume', title:'The speller hears every word', body:'Real spoken pronunciation, definition, sentence and origin — like a true bee round.' },
    { ic:'sprout', title:'Tested, gamified learning methods', body:'Evolution ladders, streaks, coins and quests — play-tested mechanics that make daily practice stick.' },
    { ic:'chart', title:'Parents see everything', body:'Accuracy, streaks, weak words and a finals countdown in one dashboard.' },
  ].map(f=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:22px">
      <div style="width:46px;height:46px;border-radius:14px;background:var(--chip);color:var(--accent);display:grid;place-items:center;margin-bottom:13px">${iconSVG(f.ic,22)}</div>
      <div style="font-family:var(--display);font-weight:700;font-size:17px;margin-bottom:6px">${f.title}</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.5">${f.body}</div></div>`).join('');
  return `<div style="position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:22px clamp(18px,4vw,40px) 60px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:clamp(28px,7vw,72px)">
      <div style="display:flex;align-items:center;gap:11px"><div style="width:44px;height:48px">${mascotSVG('happy')}</div><span style="font-family:var(--display);font-weight:800;font-size:24px;letter-spacing:-.01em"><i style="font-style:italic">Bizzing</i> Bee</span></div>
      <button data-act="goSignin" style="padding:10px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:700;font-size:13px">Sign in</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,5vw,56px);align-items:center">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:18px"><span style="width:20px;height:22px;display:inline-block;flex-shrink:0">${mascotSVG('happy')}</span> Built for spelling-bee champions</div>
        <h1 style="font-family:var(--display);font-weight:800;font-size:clamp(34px,6.4vw,58px);line-height:1.03;letter-spacing:-.02em;margin:0 0 16px">Spell your way to the National&nbsp;Bee.</h1>
        <p style="font-size:clamp(16px,2.2vw,19px);line-height:1.55;color:var(--muted);max-width:30em;margin:0 0 26px">A daily spelling trainer that hears your child spell out loud, evolves a character with every win, and shows parents exactly where they stand — built around real championship words.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">
          <button data-act="goSignup" style="padding:15px 26px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge),0 8px 22px color-mix(in srgb,var(--accent) 40%,transparent)">Start free →</button>
          <button data-act="goSignin" style="padding:15px 24px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">I have an account</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;color:var(--muted);font-size:17px;font-weight:600;line-height:1.45;max-width:34em">
          <span style="display:flex;align-items:center;gap:11px"><span style="color:var(--accent);flex-shrink:0">${iconSVG('lock',20)}</span>100% offline — words never leave your device</span>
          <span style="display:flex;align-items:center;gap:11px"><span style="color:var(--accent);flex-shrink:0">${iconSVG('spark',20)}</span>No card to start</span>
          <span style="display:flex;align-items:flex-start;gap:11px"><span style="color:var(--accent);flex-shrink:0;margin-top:2px">${iconSVG('users',20)}</span>Developed by an IIT/IIM couple with a national-level NSF spelling-bee finalist</span>
        </div>
      </div>
      <div style="position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,34px);box-shadow:var(--glow)">
        <div style="display:flex;justify-content:center;margin-bottom:6px"><div style="width:118px;height:132px;animation:sb-float 4s ease-in-out infinite">${mascotSVG('excited')}</div></div>
        <div style="text-align:center;font-family:var(--mono);font-size:13px;letter-spacing:.3em;color:var(--muted);margin-bottom:6px">SPELL THIS</div>
        <div style="text-align:center;font-family:var(--display);font-weight:800;font-size:clamp(28px,5vw,40px);letter-spacing:.02em;margin-bottom:12px">${LAND_WORDS[state.landIdx||0]}</div>
        ${state.landDone?`<div style="text-align:center;font-weight:800;color:var(--good,#178A4C);font-size:15px;margin-bottom:12px;animation:sb-pop .4s ease both">⭐ Nailed it! That\u2019s how practice feels.</div>`:''}
        <div style="display:flex;gap:8px;margin-bottom:18px">
          <input data-inp="landType" data-key="landKey" data-fkey="landType" value="${escA(state.landTyped||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type it here — try me!" style="flex:1;min-width:0;padding:12px 14px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry,inherit);font-weight:700;font-size:16px;text-align:center;letter-spacing:.05em">
          <button data-act="landCheck" style="padding:12px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Check</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px"><div style="font-size:12px;color:var(--muted);font-weight:700">Streak</div><div style="font-family:var(--display);font-weight:800;font-size:20px;display:flex;align-items:center;gap:6px">12 days <span style="color:#FF7A1A">${iconSVG('fire',18)}</span></div></div>
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px"><div style="font-size:12px;color:var(--muted);font-weight:700">Form</div><div style="font-family:var(--display);font-weight:800;font-size:20px">Forager</div></div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:clamp(40px,7vw,72px)">${features}</div>
  </div>`;
}

function viewAuth(){
  const S=state; const signup=S.authMode==='signup';
  return `<div style="position:relative;z-index:1;min-height:100dvh;display:grid;place-items:center;padding:24px">
    <div style="width:100%;max-width:420px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(24px,5vw,36px);box-shadow:var(--glow)">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:22px">
        <div style="width:56px;height:62px">${mascotSVG('happy')}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">${signup?'Create your account':'Welcome back'}</h2>
        <p style="margin:0;color:var(--muted);font-size:13px;text-align:center">${signup?'Start free — no card needed.':'Sign in to keep your streak going.'}</p>
      </div>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Parent email</label>
      <input data-inp="onEmail" data-fkey="email" value="${escA(S.email)}" type="email" placeholder="you@email.com" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:14px;outline:none">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Password</label>
      <input data-inp="onPw" data-fkey="pw" value="${escA(S.pw)}" type="password" placeholder="••••••••" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:20px;outline:none">
      <button data-act="doAuth" style="width:100%;padding:15px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${signup?'Create account':'Sign in'}</button>
      <div style="text-align:center;margin-top:16px;font-size:13px;color:var(--muted)">${signup?'Already have an account?':'New to Bizzing Bee?'} <button data-act="swapAuth" style="color:var(--accent);font-weight:800;font-size:13px">${signup?'Sign in':'Create one'}</button></div>
      <div style="text-align:center;margin-top:18px"><button data-act="goLanding" style="color:var(--muted);font-size:13px;font-weight:600">← Back</button></div>
    </div>
  </div>`;
}

function viewOnboarding(){
  const S=state;
  const dots=[0,1,2].map(i=>`<div style="width:${i===S.onbStep?'26px':'8px'};height:8px;border-radius:999px;transition:.25s;background:${i<=S.onbStep?'var(--accent)':'var(--surface2)'}"></div>`).join('');
  let card='';
  if(S.onbStep===0){
    const _freeAvs=SB_AVATARS.list.filter(a=>a.rarity==='free');
    const _legendAvs=SB_AVATARS.list.filter(a=>a.rarity==='legendary');
    const avatars=`<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px;max-width:460px;margin:0 auto;justify-items:center">${_freeAvs.map(a=>{ const on=S.draft.avatar===a.id;
        return `<button data-act="pickAvatar" data-arg="${a.id}" title="${a.name}" style="position:relative;width:100%;aspect-ratio:1;border-radius:16px;display:grid;place-items:center;transition:.15s;background:var(--surface2);border:2.5px solid ${on?'var(--accent)':'transparent'};padding:7px;${on?'box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%,transparent)':''}"><span style="width:60px;height:60px;display:inline-block">${avatarSVG(a.id,60)}</span></button>`; }).join('')}</div>
      <div style="margin-top:14px;font-size:12.5px;font-weight:700;color:var(--muted);text-align:center">…and ${SB_AVATARS.list.length-_freeAvs.length} more to collect — earn coins by playing.</div>
      <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;justify-content:center">${_legendAvs.map(a=>`<button data-act="pickAvatar" data-arg="${a.id}" title="${a.name} · legendary — unlock later with coins" style="position:relative;width:50px;height:50px;border-radius:12px;display:grid;place-items:center;background:var(--surface2);border:2px solid transparent;padding:4px;opacity:.45"><span style="width:38px;height:38px;display:inline-block">${avatarSVG(a.id,38)}</span><span style="position:absolute;top:1px;right:2px;font-size:9px">🔒</span></button>`).join('')}</div>`;
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Who's practising?</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:13px">Set up your speller's profile.</p>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Name</label>
      <input data-inp="onDraftName" data-fkey="draftName" value="${escA(S.draft.name)}" placeholder="e.g. Ahana" style="width:100%;padding:13px 14px;border-radius:14px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:700;margin-bottom:18px;outline:none">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:8px">Age · <b style="color:var(--text)">${S.draft.age}</b></label>
      <input data-inp="onDraftAge" data-fkey="draftAge" type="range" min="5" max="15" step="1" value="${S.draft.age}" style="width:100%;accent-color:var(--accent);margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px;text-align:center">Pick a buddy</label>
      ${avatars}</div>`;
  } else if(S.onbStep===1){
    const worldCards=THEMES.map(t=>{ const open=FREE_THEMES.indexOf(t.id)>=0;
      return worldHeroCard(t, t.id===S.draft.theme, !open, 'onbWorld'); }).join('');
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Choose a world</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:13px">Each world is a different look <b style="color:var(--text)">and</b> a character that evolves as you level up — from its first form to its last. Pick the journey that excites your speller. You can change it any time.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px">${worldCards}</div></div>`;
  } else {
    const goals=[{v:5,label:'5 words a day',sub:'Light & breezy',ic:'sprout'},{v:10,label:'10 words a day',sub:'Recommended',ic:'spark'},{v:15,label:'15 words a day',sub:'Bee-ready',ic:'flame'}]
      .map(g=>`<button data-act="pickGoal" data-arg="${g.v}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border-radius:14px;padding:16px 18px;cursor:pointer;transition:.15s;background:var(--surface2);border:2px solid ${S.draft.goal===g.v?'var(--accent)':'transparent'}">
        <div><div style="font-family:var(--display);font-weight:800;font-size:17px">${g.label}</div><div style="font-size:13px;color:var(--muted);font-weight:600">${g.sub}</div></div>
        <div style="width:40px;height:40px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(g.ic,20)}</div></button>`).join('');
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Set a daily goal</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:13px">A small daily habit beats cramming. Pick a starting target.</p>
      <div style="display:grid;gap:11px">${goals}</div>
      <div style="margin-top:18px">
        <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:4px">Big bee day <span style="font-weight:600">(optional)</span></label>
        <p style="margin:0 0 8px;font-size:12px;color:var(--muted)">A competition coming up? Add the date — the app counts down to it and paces practice. You can set or change it in Settings any time.</p>
        <input type="date" data-chg="onbBeeDate" value="${escA(S.draft.beeDate||'')}" style="width:100%;max-width:220px;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:700;outline:none">
      </div>
      <button data-act="startLevelTest" style="width:100%;margin-top:14px;display:flex;align-items:center;gap:11px;text-align:left;padding:13px 15px;border-radius:12px;border:1px dashed var(--accent);background:var(--chip);color:var(--text)"><span style="color:var(--accent)">${iconSVG('target',20)}</span><span style="min-width:0"><span style="display:block;font-weight:800;font-size:14px">Find my Bee Band first <span style="color:var(--muted);font-weight:650">(optional, ~3 min)</span></span><span style="display:block;font-size:12px;color:var(--muted)">Words climb band by band until we find what you're ready for — it sets your Band, your games and your Quest start in one go.</span></span></button>
      <div style="margin-top:14px">${voiceUpgradeTip()}</div></div>`;
  }
  return `<div style="position:relative;z-index:1;min-height:100dvh;display:grid;place-items:center;padding:24px">
    <div style="width:100%;max-width:560px">
      <div style="display:flex;gap:7px;justify-content:center;margin-bottom:22px">${dots}</div>
      ${card}
      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:18px">
        <button data-act="onbBack" style="padding:13px 20px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:700;font-size:15px">${S.onbStep===0?'Cancel':'Back'}</button>
        <button data-act="onbNext" style="flex:1;max-width:240px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);opacity:${(S.onbStep===0&&!S.draft.name.trim())?'.5':'1'}">${S.onbStep===2?'Start spelling →':'Continue'}</button>
      </div>
    </div>
  </div>`;
}

// Buddy empty states — the bee lives in every empty moment (spec §8)
function beeEmpty(mood,text){ return `<div style="display:flex;align-items:center;gap:14px;padding:10px 4px"><div style="width:56px;height:62px;flex-shrink:0;opacity:.95">${mascotSVG(mood)}</div><p style="margin:0;font-size:15px;color:var(--muted);line-height:1.5">${text}</p></div>`; }
/* ---- Word Journeys as lore: one lesson unlocks per Level cleared (any list) ---- */
function loreCount(c){ c=c||active(); try{ return Object.values(c.lists||{}).reduce((n,l)=>n+(l.stage||0),0); }catch(e){ return 0; } }
function loreUnlocked(){ const n=loreCount(); return lessonsAll().slice(0,Math.min(n,lessonsAll().length)); }
// Tip of the day — pithy, rotating daily, banded to the speller's proven Bee Band:
// Bands 1–2 draw only from the Spelling Bee Basics concepts + gentle habit tips;
// 3–5 widen to easy/medium concepts and practice tips; 6+ open the full library + lore.
function tipOfDay(kid){ const pool=[]; let band=2; try{ band=beeBand(active()).band; }catch(e){} if(kid) band=Math.min(band,2);
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
  if(!pool.length) return '';
  const t=trunc(pool[dayNum()%pool.length],150);
  return `<div style="position:relative;display:flex;align-items:flex-start;gap:13px;background:var(--paper,var(--bg2));border:1px solid var(--line);border-left:4px solid var(--treasure,#F0B429);border-radius:14px;padding:14px 18px;margin-bottom:14px">
    <span style="flex-shrink:0;font-family:var(--display);font-weight:800;font-size:32px;line-height:.8;color:var(--treasure,#F0B429)">“</span>
    <span style="min-width:0"><span style="display:block;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:3px">${kid?'Today\u2019s bee tip \ud83d\udc1d':'Tip of the day'}</span>
    <span style="display:block;font-size:15px;line-height:1.5;font-weight:650;color:var(--ink,var(--text))">${esc(t)}</span></span>
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
 marquee:{ face:"'Abril Fatface',Georgia,serif", tag:'TAKE THE STAGE', ink:'#F7E9C8',
   bg:"background-image:linear-gradient(180deg,rgba(20,12,4,.25),rgba(20,12,4,.62)),url('assets/spotlight-stage.png');background-size:cover;background-position:center", art:'' },
 aurora:{ face:"'Space Grotesk',system-ui,sans-serif", tag:'CHART THE STARS', ink:'#EAF0FF',
   bg:"background:radial-gradient(130% 140% at 80% -10%,#3D4FBF 0%,#232B66 55%,#141838 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:4px;top:4px;width:118px"><circle cx="88" cy="26" r="13" fill="#7D8CF0"/><circle cx="83" cy="21" r="4" fill="#A9B4F7" opacity=".8"/><ellipse cx="88" cy="27" rx="24" ry="7" fill="none" stroke="#A9B4F7" stroke-width="1.4" opacity=".75" transform="rotate(-14 88 27)"/><circle cx="30" cy="12" r="1.3" fill="#fff" opacity=".9"/><circle cx="52" cy="44" r="1" fill="#fff" opacity=".6"/><circle cx="18" cy="34" r="1.1" fill="#fff" opacity=".7"/></svg>' },
 anime:{ face:"'Rajdhani',system-ui,sans-serif", tag:'DAWN DOJO', ink:'#FFEAF0',
   bg:"background:linear-gradient(160deg,#D8566F 0%,#8E2C44 60%,#571526 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:0;top:0;width:120px"><circle cx="92" cy="24" r="15" fill="#F3B2C0" opacity=".85"/><path d="M10 52 L112 8" stroke="#FFD9E2" stroke-width="2" opacity=".55"/><path d="M26 56 L118 20" stroke="#FFD9E2" stroke-width="1.1" opacity=".35"/></svg>' },
 science:{ face:"'Spline Sans Mono',monospace", tag:'RUN THE EXPERIMENT', ink:'#DFF4EC',
   bg:"background:linear-gradient(150deg,#127a6a 0%,#0B4C42 60%,#062B25 100%);background-image:linear-gradient(rgba(223,244,236,.10) 1px,transparent 1px),linear-gradient(90deg,rgba(223,244,236,.10) 1px,transparent 1px),linear-gradient(150deg,#127a6a 0%,#0B4C42 60%,#062B25 100%);background-size:18px 18px,18px 18px,100% 100%",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:8px;top:6px;width:100px"><path d="M78 10v14L66 48a5 5 0 0 0 4.6 7h18.8A5 5 0 0 0 94 48L82 24V10" fill="none" stroke="#8FE0CC" stroke-width="2.4" stroke-linecap="round"/><path d="M74 10h12" stroke="#8FE0CC" stroke-width="2.4" stroke-linecap="round"/><circle cx="76" cy="44" r="2.2" fill="#8FE0CC"/><circle cx="84" cy="38" r="1.6" fill="#8FE0CC" opacity=".7"/></svg>' },
 origami:{ face:"'Zen Maru Gothic',system-ui,sans-serif", tag:'FOLD A WORLD', ink:'#FFF6E8',
   bg:"background:linear-gradient(150deg,#D97438 0%,#A64A1E 58%,#6E2E10 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:4px;width:112px"><g transform="translate(84,28) rotate(-6)"><path d="M0 -16 L18 10 L0 4 Z" fill="#FFE8D0"/><path d="M0 -16 L-18 10 L0 4 Z" fill="#F7C9A4"/><path d="M0 4 L6 16 L-6 16 Z" fill="#EDA671"/></g><path d="M14 46 q10 -8 20 0" stroke="#FFE8D0" stroke-width="1.6" fill="none" opacity=".6"/></svg>' },
 pixel:{ face:"'Bungee',sans-serif", tag:'INSERT COIN', ink:'#E4ECFF',
   bg:"background:linear-gradient(160deg,#3E63C4 0%,#22377A 60%,#131E45 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:6px;width:110px;image-rendering:pixelated"><g fill="#9DB8F8"><rect x="76" y="14" width="8" height="8"/><rect x="84" y="22" width="8" height="8"/><rect x="92" y="14" width="8" height="8"/><rect x="68" y="22" width="8" height="8"/><rect x="76" y="30" width="8" height="8" fill="#FFD34D"/><rect x="92" y="30" width="8" height="8"/></g><rect x="20" y="40" width="6" height="6" fill="#9DB8F8" opacity=".5"/></svg>' },
 avatar:{ face:"'Philosopher',system-ui,sans-serif", tag:'BALANCE THE FOUR', ink:'#E6F4F9',
   bg:"background:linear-gradient(150deg,#2E8FB8 0%,#1D5E7C 58%,#103647 100%)",
   art:'<svg viewBox="0 0 120 60" style="position:absolute;right:6px;top:4px;width:112px"><g fill="none" stroke="#BFE4F2" stroke-width="2"><circle cx="72" cy="18" r="7"/><circle cx="94" cy="18" r="7" stroke="#F0B45B"/><circle cx="72" cy="40" r="7" stroke="#9BD3B4"/><circle cx="94" cy="40" r="7" stroke="#E4E8EC"/></g></svg>' },
};
function worldHeroCard(t, on, locked, act){ const H=WORLD_HERO[t.id]||WORLD_HERO.spellbound; const ev=EVO[t.id]||EVO.spellbound;
  const badge=on?'<span style="position:absolute;top:10px;right:10px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:#241E33;font-weight:800;font-size:12px;font-family:var(--ui,var(--body))">Active ✓</span>'
    :(locked?('<span style="position:absolute;top:10px;right:10px;left:auto;z-index:3;display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:#8A5B00;font-weight:900;font-size:12px;box-shadow:0 1px 4px rgba(0,0,0,.18)">🔒 '+coinAmt(COST.theme,11)+'</span>'):'');
  return `<button data-act="${act||'pickTheme'}" data-arg="${t.id}" style="position:relative;text-align:left;border-radius:20px;overflow:hidden;background:var(--paper,var(--bg2));border:1px solid var(--line);box-shadow:${on?'0 0 0 2px '+t.c1+',var(--sh-raised)':'var(--sh-rest)'};${locked?'opacity:.94':''}">
    <div style="position:relative;height:104px;${H.bg};${locked?'filter:grayscale(1) brightness(.96);opacity:.75':''}">
      ${H.art}${badge}
      <div style="position:absolute;left:16px;bottom:10px;right:12px">
        <div style="font-family:${H.face};font-weight:800;font-size:26px;line-height:1;color:${H.ink};text-shadow:0 1px 6px rgba(0,0,0,.35)">${t.label}</div>
        <div style="font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.08em;color:${H.ink};opacity:.85;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${H.tag}</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;padding:10px 14px">
      <span style="font-family:var(--ui,var(--body));font-size:12px;font-weight:650;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev[0]} → ${ev[9]}</span>
    </div></button>`; }
/* ---- Wayfinding tiles: destination color pops (spec §1). 48px solid tile, white icon,
   press edge, playful ±2–3° tilt. Colors are PLACE identity — stable across worlds. ---- */
const WAYFIND={ quest:{c:'var(--action,#6C4FE0)',ic:'steps',sb:null,label:'Champion’s Quest'},
  concepts:{c:'#0E8A78',ic:'grid',sb:'grid',label:'Concepts'},
  journeys:{c:'#C25A2E',ic:'book',sb:'book',label:'Word Journeys'},
  arcade:{c:'#E8458C',ic:'joystick',sb:'gamepad',label:'Arcade'},
  themes:{c:'#B14FC4',ic:'palette',sb:'palette',label:'Theme Journeys'},
  figurative:{c:'#9C6A08',ic:'bulb',sb:'sparkle',label:'Idioms & Sayings'},
  vocab:{c:'#2E8FB8',ic:'book',sb:'book',label:'Vocabulary'},
  typing:{c:'#5B3DD6',ic:'pencil',sb:'pencil',label:'Typing Trainer'},
  traps:{c:'#C4453C',ic:'spark',sb:'target',label:'Your Traps'} };
function wayTile(key,size,tilt){ const w=WAYFIND[key]; size=size||48;
  const glyph=(w.sb&&window.SB_ICON)?SB_ICON(w.sb,{size:24}):iconSVG(w.ic,24,2.2);
  return `<span style="width:${size}px;height:${size}px;flex-shrink:0;display:grid;place-items:center;border-radius:14px;background:${w.c};color:#fff;box-shadow:var(--edge),var(--sh-rest);transform:rotate(${tilt||-2.5}deg)">${glyph}</span>`; }
// Explore — the hub behind the 5-item nav: Arcade, Concepts, Word Journeys, Theme Journeys.
/* ===== Idioms & Sayings — browse 2,350 figurative phrases with honest origin stories ===== */
function figPool(){ if(!window.SB_FIG) return [];
  if(!window._figAll) window._figAll=(SB_FIG.idioms||[]).concat(SB_FIG.similes||[]).filter(x=>x.kid!==false);
  return window._figAll; }
const FIG_OC={documented:['📜 True story','#0F5C3E','#EAF7F0'], disputed:['🤔 Best guess','#8A5B00','#FFF3D6'], folk:['🧚 Folk tale — busted!','#6E1F30','#FBEAE8']};
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
function vocDeckWords(k){
  if(['easy','medium','hard','champ'].indexOf(k)>=0){
    const r=diffRange(active(),k); const ws=corpusSlice(r[0],r[1],600);
    return sample(ws, Math.min(20,ws.length)); }
  const pool=gameWordsD({needDef:true});
  if(k==='mix'){ const f=pickFresh(pool,20); return f.length?f:sample(pool,Math.min(20,pool.length)); }
  if(k.slice(0,3)==='th:'){ const ws=themeWords(k.slice(3)).filter(w=>w.d&&w.d.length>4); return sample(ws,Math.min(20,ws.length)); }
  return [];
}
function figTabsBar(on){ const b=(k,l)=>`<button data-act="figTab" data-arg="${k}" style="flex:1;min-width:120px;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${on===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${l}</button>`;
  return `<div style="display:flex;gap:8px;margin-bottom:14px">${b('learn','📚 Learn — deck by deck')}${b('browse','🔎 Browse all')}</div>`; }
function figLearnView(){ const S=state; const c=active();
  if(S.figDeck){ const items=figDeckItems(S.figDeck); const deck=figDecks().find(d=>d.id===S.figDeck)||{label:'Deck'};
    const i=Math.min(S.figIdx||0, items.length-1); const x=items[i]; if(!x) return figTabsBar('learn')+'<p style="color:var(--muted)">Empty deck.</p>';
    const oc=FIG_OC[x.oc]||FIG_OC.documented; const flip=!!S.figFlip;
    const back=`<div style="display:flex;flex-direction:column;gap:9px;text-align:left;animation:sb-pop .3s ease both">
        <div style="font-size:16px;font-weight:800">${esc(x.m)}</div>
        ${x.lit?`<div style="font-size:13px;color:var(--muted)"><b>Literally:</b> ${esc(x.lit)}</div>`:''}
        <div style="font-size:13px;color:var(--muted);line-height:1.55"><span style="font-size:10.5px;font-weight:800;padding:2px 9px;border-radius:99px;color:${oc[1]};background:${oc[2]}">${oc[0]}</span> ${esc(x.os)}</div>
        <div style="font-size:13px;font-style:italic;opacity:.85">“${esc(x.ex)}”</div>
        ${(x.eq&&x.eq.length)?`<div style="font-size:12px;color:var(--muted)"><b>Same idea elsewhere:</b> ${x.eq.map(e=>esc(e.lang)+': “'+esc(e.p)+'”').join(' · ')}</div>`:''}</div>`;
    return `<div style="max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><button data-act="figBackToDecks" style="color:var(--muted);font-weight:700;font-size:13px">← All decks</button><span style="font-family:var(--display);font-weight:800;font-size:18px">${esc(deck.label)}</span><span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--muted)">${i+1} / ${items.length}</span></div>
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;background:var(--accent);width:${Math.round((i+1)/items.length*100)}%"></div></div>
      <button data-act="figFlip" style="display:block;width:100%;text-align:center;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--sh-rest);min-height:290px">
        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:10px"><span style="font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:var(--surface2);color:var(--muted)">${x.t}</span>${x.region&&x.region!=='global'?`<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;background:var(--chip);color:var(--accent)">🌍 ${esc(x.region)}</span>`:''}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(20px,4.6vw,28px);line-height:1.25;margin-bottom:12px">“${esc(x.p)}”</div>
        ${flip?back:`<div style="color:var(--muted);font-weight:700;font-size:13px;margin-top:26px">Tap the card to reveal the meaning &amp; story ▾</div>`}
      </button>
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:14px">
        <button data-act="figNav" data-arg="-1" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;${i===0?'opacity:.4':''}">← Back</button>
        <button data-act="figSay" data-arg="${escA(x.p+'. '+(flip?x.m:''))}" style="height:44px;padding:0 14px;border-radius:12px;background:var(--chip);color:var(--accent);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',17)} Hear it</button>
        <button data-act="figNav" data-arg="1" style="padding:12px 24px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);${i>=items.length-1?'opacity:.4':''}">Next →</button>
      </div></div>`;
  }
  const decks=figDecks().map(d=>{ const items=figDeckItems(d.id); const seen=Math.min(((c.figSeen||{})[d.id]||0)+1, items.length); const done=!!((c.figDone||{})[d.id]);
    return `<button data-act="figDeck" data-arg="${d.id}" style="text-align:left;background:var(--paper,var(--bg2));border:1.5px solid ${done?'var(--treasure,#F0B429)':'var(--line)'};border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:8px">
      <span style="font-family:var(--display);font-weight:800;font-size:15.5px">${d.label} ${done?'✓':''}</span>
      <span style="font-size:12px;color:var(--muted);font-weight:650">${items.length} cards${seen>1&&!done?' · resume at '+seen:''}</span>
      <span style="height:5px;border-radius:99px;background:var(--surface2);overflow:hidden"><span style="display:block;height:100%;background:${done?'var(--treasure,#F0B429)':'var(--accent)'};width:${done?100:Math.round(seen/Math.max(1,items.length)*100)}%"></span></span></button>`; }).join('');
  return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">${decks}</div>`;
}
function viewFigurative(){ const S=state;
  if((S.figTab||'learn')==='learn'){
    return `<div style="max-width:980px;margin:0 auto">
      ${pageHead('Idioms & Sayings', figPool().length+' phrases', 'Learn deck by deck like Concepts — tap a card to reveal the meaning and its true origin story. Finish a deck for +5 🪙.')}
      ${figTabsBar('learn')}${figLearnView()}</div>`;
  }
  const q=(S.figQ||'').trim().toLowerCase(); const ty=S.figType||'all'; const th=S.figTheme||'all'; const world=!!S.figWorld;
  let list=figPool();
  if(ty!=='all') list=list.filter(x=>x.t===ty);
  if(th!=='all') list=list.filter(x=>(x.th||[]).indexOf(th)>=0);
  if(world) list=list.filter(x=>x.lit);
  if(q) list=list.filter(x=>x.p.toLowerCase().includes(q)||x.m.toLowerCase().includes(q));
  const PER=24; const pages=Math.max(1,Math.ceil(list.length/PER)); const pg=Math.min(S.figPage||0,pages-1);
  const themes=[...new Set(figPool().flatMap(x=>x.th||[]))].sort();
  const seg=(k,l)=>`<button data-act="figType" data-arg="${k}" style="padding:8px 14px;border-radius:999px;font-weight:800;font-size:12.5px;${(S.figType||'all')===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${l}</button>`;
  const cards=list.slice(pg*PER,pg*PER+PER).map(x=>{ const oc=FIG_OC[x.oc]||FIG_OC.documented;
    return `<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;align-items:flex-start;gap:8px"><span style="font-family:var(--display);font-weight:800;font-size:16.5px;line-height:1.2;flex:1">${esc(x.p)}</span>
        <button data-act="figSay" data-arg="${escA(x.p+'. '+x.m)}" title="Hear it" style="width:30px;height:30px;border-radius:9px;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG('volume',15)}</button></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <span style="font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:var(--surface2);color:var(--muted)">${x.t}</span>
        <span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;color:${oc[1]};background:${oc[2]}">${oc[0]}</span>
        ${x.region&&x.region!=='global'?`<span style="font-size:10px;font-weight:800;padding:2px 9px;border-radius:99px;background:var(--chip);color:var(--accent)">🌍 ${esc(x.region)}</span>`:''}</div>
      <div style="font-size:13.5px;font-weight:700">${esc(x.m)}</div>
      ${x.lit?`<div style="font-size:12px;color:var(--muted)"><b>Literally:</b> ${esc(x.lit)}</div>`:''}
      <div style="font-size:12px;color:var(--muted);line-height:1.5">${esc(x.os)}</div>
      <div style="font-size:12px;font-style:italic;color:var(--text);opacity:.85">“${esc(x.ex)}”</div>
      ${(x.eq&&x.eq.length)?`<div style="font-size:11.5px;color:var(--muted)"><b>Same idea elsewhere:</b> ${x.eq.map(e=>esc(e.lang)+': “'+esc(e.p)+'”'+(e.lit?' ('+esc(e.lit)+')':'')).join(' · ')}</div>`:''}
    </div>`; }).join('');
  return `<div style="max-width:980px;margin:0 auto">
    ${pageHead('Idioms & Sayings', list.length+' of '+figPool().length+' phrases', 'Real meanings, true origin stories — and an honest flag when the famous story is a myth. Play the Idiom round in Word Quiz to test yourself.')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px">
      <input data-inp="figQ" data-fkey="figQ" value="${escA(S.figQ||'')}" placeholder="Search phrases or meanings…" style="flex:1;min-width:200px;padding:11px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px;outline:none">
      ${seg('all','All')}${seg('idiom','Idioms')}${seg('proverb','Proverbs')}${seg('simile','Similes')}
      <button data-act="figWorld" style="padding:8px 14px;border-radius:999px;font-weight:800;font-size:12.5px;${world?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">🌍 World</button>
      <select data-chg="figTheme" style="padding:9px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px">
        <option value="all">All themes</option>${themes.map(t=>`<option value="${t}" ${th===t?'selected':''}>${t}</option>`).join('')}</select>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:12px">${cards||'<p style="color:var(--muted)">No matches — try a different search.</p>'}</div>
    ${pages>1?`<div style="display:flex;gap:8px;justify-content:center;align-items:center;margin-top:16px">
      <button data-act="figPage" data-arg="${Math.max(0,pg-1)}" style="padding:9px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13px;${pg===0?'opacity:.4':''}">← Prev</button>
      <span style="font-size:13px;font-weight:700;color:var(--muted)">Page ${pg+1} / ${pages}</span>
      <button data-act="figPage" data-arg="${Math.min(pages-1,pg+1)}" style="padding:9px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13px;${pg>=pages-1?'opacity:.4':''}">Next →</button></div>`:''}
  </div>`;
}
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
  {id:'sent', name:'Sentences from your words', dyn:'sent', tip:'Real sentences from your word bank — capitals, commas, full stops. Just like the online bee.'},
  {id:'mean', name:'Type the meaning', dyn:'mean', tip:'Hear the word, then type its meaning — spelling, typing and vocabulary in one drill.'},
];
const TY_FINGER={q:'p',a:'p',z:'p',w:'r',s:'r',x:'r',e:'m',d:'m',c:'m',r:'i',f:'i',v:'i',t:'i',g:'i',b:'i',y:'I',h:'I',n:'I',u:'I',j:'I',m:'I',i:'M',k:'M',',':'M',o:'R',l:'R','.':'R',p:'P',';':'P'};
const TY_FCOLOR={p:'#E8458C',r:'#F0A82A',m:'#13A892',i:'#3D7DF0',I:'#7B52E0',M:'#13A892',R:'#F0A82A',P:'#E8458C'};
function tyClean(t){ return String(t||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'').replace(/[^a-zA-Z ,.;']/g,' ').replace(/\s+/g,' ').trim(); }
function tySeqFor(l){ if(!l.dyn) return l.seq;
  if(l.dyn==='sent'){ const ws=gameWordsD({needSent:true}).filter(w=>w.s&&w.s.length>=25&&w.s.length<=130);
    const picked=sample(ws,2).map(w=>tyClean(w.s)).filter(x=>x.length>=20);
    if(picked.length) return picked.join(' ');
  }
  if(l.dyn==='mean'){ const ws=gameWordsD({needDef:true}).filter(w=>w.d&&w.d.length>=20&&w.d.length<=110);
    const picked=sample(ws,2).map(w=>{ try{ setTimeout(()=>say(w.w),150); }catch(e){} return tyClean(w.w+', '+w.d); }).filter(x=>x.length>=20);
    if(picked.length) return picked.join('. ')+'.';
  }
  const ws=gameWordsD().filter(w=>/^[a-z]+$/.test(w.w)&&w.w.length<=9); return sample(ws,8).map(w=>w.w).join(' ')||'bee hive honey spell word queen'; }
function tyStats(c){ return c.typing||(c.typing={bestWpm:0,bestAcc:0,tests:0,lessons:{}}); }
function tyStop(){ if(window._tyH){ try{window.removeEventListener('keydown',window._tyH,true);}catch(e){} window._tyH=null; } const t=state.ty; if(t&&t.timer){ clearInterval(t.timer); t.timer=null; } }
function tyProcess(ch){ const t=state.ty; if(!t||t.done) return;
  if(!t.startT){ t.startT=Date.now();
    if(t.mode==='test'){ t.timer=setInterval(()=>{ const tt=state.ty; if(!tt||tt.done){ return; }
      const left=60-Math.floor((Date.now()-tt.startT)/1000);
      const el=document.getElementById('ty-time'); if(el) el.textContent=Math.max(0,left)+'s';
      if(left<=0) tyFinish(); },250); } }
  const want=t.seq[t.pos];
  if(ch==='Backspace'){ if(t.pos>0){ t.pos--; const sp=document.getElementById('ty-c'+t.pos); if(sp){ sp.style.color='var(--muted)'; sp.style.background='none'; sp.style.borderBottom='2px solid transparent'; } tyCursor(); } return; }
  if(ch.length!==1) return;
  const ok=ch===want; if(!ok) t.errors++;
  const sp=document.getElementById('ty-c'+t.pos);
  if(sp){ sp.style.color=ok?'var(--good,#1f9d57)':'#fff'; sp.style.background=ok?'none':'#E0483C'; sp.style.borderRadius='3px'; }
  t.pos++; t.typed++;
  if(t.pos>=t.seq.length){ tyFinish(); return; }
  tyCursor();
  const pr=document.getElementById('ty-prog'); if(pr) pr.style.width=Math.round(t.pos/t.seq.length*100)+'%';
}
function tyCursor(){ const t=state.ty; for(let i=Math.max(0,t.pos-2);i<=Math.min(t.seq.length-1,t.pos+2);i++){ const sp=document.getElementById('ty-c'+i); if(sp) sp.style.borderBottom=(i===t.pos)?'2px solid var(--accent)':'2px solid transparent'; }
  document.querySelectorAll('[id^=ty-k-]').forEach(k=>{ k.style.outline='none'; k.style.transform='none'; });
  const want=(t.seq[t.pos]||'').toLowerCase(); const key=document.getElementById('ty-k-'+(want===' '?'space':want));
  if(key){ key.style.outline='3px solid var(--accent)'; key.style.transform='translateY(-2px)'; } }
function tyFinish(){ const t=state.ty; if(!t||t.done) return; t.done=true; tyStop();
  const mins=Math.max(0.05,(Date.now()-(t.startT||Date.now()))/60000);
  const correct=t.typed-t.errors;
  t.wpm=Math.max(0,Math.round((correct/5)/mins)); t.acc=t.typed?Math.round(correct/t.typed*100):0;
  const c=active(); const st=tyStats(c);
  if(t.mode==='test'){ st.tests=(st.tests||0)+1; const nb=t.wpm>(st.bestWpm||0);
    if(nb) st.bestWpm=t.wpm; if(t.acc>(st.bestAcc||0)) st.bestAcc=t.acc;
    const coins=Math.min(40,Math.max(3,Math.floor(t.wpm/2))); addCoins(coins); t.coins=coins;
    sfx(nb?'win':'level'); if(nb) burstConfetti(90);
  } else { st.lessons[t.lesson]=Math.max(st.lessons[t.lesson]||0, t.acc);
    st.sessions=(st.sessions||0)+1;
    if(t.lesson==='sent'||t.lesson==='mean') st.bank=(st.bank||0)+1;
    if(t.acc>=100) st.perfect=(st.perfect||0)+1;
    const coins=(t.lesson==='sent'||t.lesson==='mean')?5:3; addCoins(coins); t.coins=coins; sfx('correct'); }
  save(); render(); }
function tyKeyboardHTML(){ const rows=['qwertyuiop','asdfghjkl;','zxcvbnm,.'];
  const key=(ch)=>{ const f=TY_FINGER[ch]; const col=f?TY_FCOLOR[f]:'#9A93AB';
    return `<button data-act="tyTap" data-arg="${escA(ch)}" id="ty-k-${esc(ch)}" style="width:clamp(26px,3.4vw,40px);height:clamp(34px,4vw,46px);border-radius:8px;background:var(--surface2);border:1px solid var(--line);border-bottom:3px solid ${col};font-weight:800;font-size:14px;color:var(--text);transition:.1s">${ch===';'?';':ch.toUpperCase()}</button>`; };
  return `<div style="display:flex;flex-direction:column;gap:5px;align-items:center;user-select:none">
    ${rows.map(r=>`<div style="display:flex;gap:5px">${r.split('').map(key).join('')}</div>`).join('')}
    <div style="display:flex;gap:5px"><button data-act="tyTap" data-arg=" " id="ty-k-space" style="width:min(46vw,300px);height:clamp(34px,4vw,44px);border-radius:8px;background:var(--surface2);border:1px solid var(--line);border-bottom:3px solid #9A93AB;font-weight:700;font-size:11px;color:var(--muted)">SPACE — thumbs</button></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:4px;font-size:10.5px;font-weight:700;color:var(--muted)">
      ${[['#E8458C','pinky'],['#F0A82A','ring'],['#13A892','middle'],['#3D7DF0','left index'],['#7B52E0','right index']].map(x=>`<span style="display:inline-flex;align-items:center;gap:4px"><span style="width:10px;height:10px;border-radius:3px;background:${x[0]}"></span>${x[1]}</span>`).join('')}
    </div></div>`; }
function viewTyping(){ const S=state; const c=active(); const st=tyStats(c);
  if(S.ty && !S.ty.done){ const t=S.ty;
    const chars=t.seq.split('').map((ch,i)=>`<span id="ty-c${i}" style="color:${i<t.pos?'var(--good,#1f9d57)':'var(--muted)'};border-bottom:2px solid ${i===t.pos?'var(--accent)':'transparent'}">${ch===' '?'&nbsp;':esc(ch)}</span>`).join('');
    return `<div style="max-width:760px;margin:0 auto;text-align:center">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><button data-act="tyExit" style="color:var(--muted);font-weight:700;font-size:13px">← Typing</button><span style="font-family:var(--display);font-weight:800;font-size:18px">${esc(t.title)}</span><span style="margin-left:auto;font-family:var(--mono);font-size:13px;color:var(--muted)">${t.mode==='test'?`<span id="ty-time">60s</span>`:''}</span></div>
      ${t.tip?`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">💡 ${esc(t.tip)}</p>`:''}
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:16px"><div id="ty-prog" style="height:100%;background:var(--accent);width:${Math.round(t.pos/t.seq.length*100)}%"></div></div>
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:20px 22px;font-family:var(--mono);font-size:clamp(18px,3.4vw,26px);letter-spacing:.06em;line-height:2;word-break:break-word;text-align:left;margin-bottom:16px;box-shadow:var(--sh-rest)">${chars}</div>
      ${tyKeyboardHTML()}
      <p style="font-size:12px;color:var(--muted);margin-top:12px">Type on your keyboard${'ontouchstart' in window?' or tap the keys above':''} — ${t.mode==='test'?'the 60-second clock starts on your first key!':'accuracy first, speed follows.'}</p>
    </div>`; }
  if(S.ty && S.ty.done){ const t=S.ty;
    return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .35s ease both">
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--glow)">
        <div style="font-size:44px">${t.mode==='test'?(t.wpm>=(st.bestWpm||0)?'🏆':'⌨️'):'✅'}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:26px;margin:6px 0 14px">${t.mode==='test'?(t.wpm>=st.bestWpm?'New best!':'Test complete!'):'Exercise complete!'}</h2>
        <div style="display:flex;gap:14px;justify-content:center;margin-bottom:14px">
          <div style="background:var(--surface2);border-radius:14px;padding:14px 22px"><div style="font-family:var(--display);font-weight:800;font-size:30px;color:var(--accent)">${t.wpm}</div><div style="font-size:11px;color:var(--muted);font-weight:800">WPM</div></div>
          <div style="background:var(--surface2);border-radius:14px;padding:14px 22px"><div style="font-family:var(--display);font-weight:800;font-size:30px;color:${t.acc>=90?'var(--good)':'var(--text)'}">${t.acc}%</div><div style="font-size:11px;color:var(--muted);font-weight:800">ACCURACY</div></div>
        </div>
        <div style="font-size:13px;font-weight:800;color:var(--treasure-deep,#8A5B00)">+${t.coins} 🪙</div>
        <div style="display:flex;gap:10px;justify-content:center;margin-top:18px">
          <button data-act="${t.mode==='test'?'tyTest':'tyStart'}" ${t.mode==='test'?'':`data-arg="${t.lesson}"`} style="padding:13px 22px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">${t.mode==='test'?'Test again →':'Once more →'}</button>
          <button data-act="tyExit" style="padding:13px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px">All lessons</button>
        </div></div></div>`; }
  const lessons=TY_LESSONS.map((l,i)=>{ const acc=st.lessons[l.id];
    return `<button data-act="tyStart" data-arg="${l.id}" style="text-align:left;background:var(--paper,var(--bg2));border:1.5px solid ${acc>=90?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:13px 15px;display:flex;align-items:center;gap:12px">
      <span style="width:34px;height:34px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center;font-weight:800;font-size:13px;flex-shrink:0">${i+1}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:14px">${esc(l.name)}${l.dyn?' <span style="font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);background:var(--treasure-tint,#FFF3D6);padding:2px 6px;border-radius:99px;vertical-align:middle">word bank</span>':''}</span>
      <span style="display:block;font-size:11.5px;color:var(--muted);font-weight:650">${acc!=null?('best accuracy '+acc+'%'+(acc>=90?' ✓':'')):'not tried yet'}</span></span></button>`; }).join('');
  return `<div style="max-width:920px;margin:0 auto">
    ${pageHead('Typing Trainer','⌨️ '+ (st.bestWpm?('best '+st.bestWpm+' WPM · '+st.bestAcc+'% acc'):'online bees are typed!'),'Learn to touch-type finger by finger — then race the 60-second Typing Test. NSF online rounds are typed, so speed is real bee prep.',
      `<button data-act="tyTest" style="padding:10px 18px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">⏱ 60-second Typing Test →</button>`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px">${lessons}</div>
  </div>`;
}
/* ===== Vocabulary — study decks + card player (NSF vocabulary-bee style) ===== */
function viewVocab(){ const S=state; const c=active();
  if(S.vocDeck){ const ws=S.vocWords||[]; const i=Math.min(S.vocIdx||0,ws.length-1); const w=ws[i]; if(!w) return '<p style="color:var(--muted)">No words.</p>';
    const flip=!!S.vocFlip;
    const back=`<div style="display:flex;flex-direction:column;gap:10px;text-align:left;animation:sb-pop .3s ease both">
        <div style="font-size:16.5px;font-weight:800">${esc(w.d||'—')}</div>
        ${w.s?`<div style="font-size:13.5px;font-style:italic;color:var(--muted);line-height:1.5">“${blankHTML(w.s,w.w)}”</div>`:''}
        ${w.o?`<div style="font-size:12px;color:var(--muted)"><b>Origin:</b> ${esc(w.o)}${w.r?' · '+esc(w.r):''}</div>`:''}</div>`;
    return `<div style="max-width:640px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><button data-act="vocBack" style="color:var(--muted);font-weight:700;font-size:13px">← Decks</button><span style="font-family:var(--display);font-weight:800;font-size:18px">Vocabulary</span><span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--muted)">${i+1} / ${ws.length}</span></div>
      <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;background:var(--accent);width:${Math.round((i+1)/ws.length*100)}%"></div></div>
      <button data-act="vocFlip" style="display:block;width:100%;text-align:center;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--sh-rest);min-height:270px">
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(24px,5.5vw,34px);letter-spacing:.02em;margin-bottom:6px">${esc(w.w)}</div>
        ${w.p?`<div style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-bottom:4px">${esc(w.p)}</div>`:''}
        ${w.sy?`<div style="font-size:12px;color:var(--muted);margin-bottom:10px">${esc(w.sy)}</div>`:''}
        ${flip?back:`<div style="color:var(--muted);font-weight:700;font-size:13px;margin-top:22px">Tap to reveal the meaning ▾</div>`}
      </button>
      <div style="display:flex;gap:10px;align-items:center;justify-content:center;margin-top:14px">
        <button data-act="vocNav" data-arg="-1" style="padding:12px 20px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:14px;${i===0?'opacity:.4':''}">← Back</button>
        <button data-act="vocSayWord" style="height:44px;padding:0 14px;border-radius:12px;background:var(--chip);color:var(--accent);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',17)} Hear it</button>
        <button data-act="vocSayCard" title="Hear the word and its meaning" style="height:44px;padding:0 14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:12.5px">${iconSVG('volume',15)} + meaning</button>
        <button data-act="vocNav" data-arg="1" style="padding:12px 24px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);${i>=ws.length-1?'opacity:.4':''}">Next →</button>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button data-act="vocNewSet" style="padding:10px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12.5px;color:var(--muted)">🔄 New set of 20</button>
        <button data-act="wqStart" data-arg="vocab" style="padding:10px 16px;border-radius:10px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12.5px">🎯 Play the Vocabulary round →</button>
      </div></div>`;
  }
  const deckBtn=(k,label,sub)=>`<button data-act="vocDeck" data-arg="${k}" style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:15px 16px;display:flex;flex-direction:column;gap:6px">
      <span style="font-family:var(--display);font-weight:800;font-size:15.5px">${label}</span><span style="font-size:12px;color:var(--muted);font-weight:650">${sub}</span></button>`;
  const themeDecks=myThemes().slice(0,6).map(t=>deckBtn('th:'+t.id,'🗂️ '+esc(t.label),'20 words from this theme')).join('');
  return `<div style="max-width:980px;margin:0 auto">
    ${pageHead('Vocabulary','word → meaning','Study words the vocabulary-bee way — hear the word, guess the meaning, flip the card. Then test yourself in the Vocabulary round of Word Quiz.',
      `<button data-act="wqStart" data-arg="vocab" style="padding:9px 16px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">🎯 Vocabulary round →</button>`)}
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px">
      ${deckBtn('mix','✨ My level mix','20 fresh words from your list, at your level')}
      ${deckBtn('easy','🌱 Easy','genuinely easy words — a friendly warm-up')}
      ${deckBtn('medium','🌿 Medium','right around your Bee Band')}
      ${deckBtn('hard','🔥 Hard','a band above you — the stretch zone')}
      ${deckBtn('champ','👑 Champ','real championship-tier words')}
      ${themeDecks}
    </div></div>`;
}
function viewExplore(){ const c=active(); ensureLists(c);
  const cAll=(state.conceptData||[]); const cDone=cAll.filter(ch=>conceptStat(ch).done).length;
  const dests=[
    {key:'arcade', act:'openGames', desc:'Story-mode Spelling Quest, Beat the Buzzer, Boss Battle & more — every correct word earns coins.', meta:(c.coins||0)+' coins'},
    {key:'concepts', act:'setNav', arg:'concepts', desc:'Spelling basics, patterns, prefixes, roots & tricky endings — 121 concepts in 11 chapters.', meta:cDone+'/'+(cAll.length||121)+' mastered'},
    {key:'journeys', act:'openJourneys', desc:'The history & geography of words — 100 lessons from ancient roots to championship linguistics.', meta:state.premium?'10 chapters':'Premium'},
    {key:'themes', act:'setNav', arg:'themes', desc:'Learn words by their worlds — 52 themes from medicine to myths. Pick 3–5 you love.', meta:myThemes().length+' picked'},
    {key:'figurative', act:'setNav', arg:'figurative', desc:'2,000 idioms & 350 similes with true origin stories — learn deck by deck, card by card.', meta:'2,350 phrases'},
    {key:'vocab', act:'openVocab', desc:'Word → meaning, the vocabulary-bee way — study decks at your level, then take the Vocabulary round.', meta:'your level'},
    {key:'typing', act:'openTyping', desc:'Touch-type finger by finger, then race the 60-second Typing Test — online bee rounds are typed!', meta:'⌨️ WPM'},
  ].map((d,i)=>{ const w=WAYFIND[d.key];
    return `<button class="sb-lift" data-act="${d.act}" ${d.arg?`data-arg="${d.arg}"`:''} style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--sh-rest);display:flex;flex-direction:column;padding:0">
      <div style="position:relative;width:100%">${SB_COVER(state.theme,d.key==='themes'?'themes':d.key,{h:110,dark:state.mode==='dusk'})}
        <span style="position:absolute;left:14px;bottom:-16px">${wayTile(d.key,48,i%2?2.5:-2.5)}</span></div>
      <div style="display:flex;align-items:flex-start;gap:16px;padding:24px 20px 18px;width:100%">
      <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:20px;line-height:1.15">${w.label}</span>
      <span style="display:block;font-size:15px;color:var(--muted);line-height:1.5;margin-top:5px">${d.desc}</span>
      <span style="display:inline-block;margin-top:9px;font-size:13px;font-weight:650;color:var(--muted)">${esc(d.meta)} →</span></span></div></button>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Explore','four ways in','Games, concepts, word history and theme worlds — every road leads to better spelling.')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px">${dests}</div>
  </div>`; }
// Optional placement test: climb difficulty bands; three fails per level find your start
/* placement-test helpers: word pool per difficulty band + the Quest stage that matches a band */
function ltBandPool(b){ const all=journeySorted().filter(w=>(w.y||3)===b);
  return all.length>=6?all:all.concat(REVIEW.filter(w=>(w.y||3)===b)); }
function ltStageForBand(b){ const stages=journeyStages(); if(b<=1) return 0;
  for(let i=0;i<stages.length;i++){ const ws=stages[i].words||[]; if(!ws.length) continue;
    const med=(ws[Math.floor(ws.length/2)].y)||3; if(med>=b) return i; }
  return Math.max(0,stages.length-1); }
function viewLevelTest(){ const lt=state.lt||{}; if(lt.done) return `<div style="max-width:520px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:32px;text-align:center;box-shadow:var(--sh-overlay)">
      <div style="width:100px;height:110px;margin:0 auto 6px;animation:sb-bee-talk 1.6s ease-in-out infinite">${mascotAcc('excited')}</div>
      <div style="font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Placement complete</div>
      <div style="font-family:var(--display);font-weight:800;font-size:30px;margin:6px 0 4px">Band ${lt.placed} — ${bandTier(lt.placed||1)}!</div>
      <p style="font-size:15px;color:var(--muted);margin:0 0 6px">That's exactly where champions start. Your Bee Band, your games and your Quest are all set to it — spell well and the Band climbs with you.</p>
      <p style="font-size:13px;color:var(--muted);margin:0 0 8px">Quest start: Level ${ltStageForBand(lt.placed||1)+1} of the Bizzing Bee Journey.</p>
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 18px;line-height:1.5">One more thing: your <b>bee</b> still hatches young — evolution measures <b>practice</b>, not skill, and it only ever climbs. Your Band is the skill part, and yours is already set. 🐝</p>
      <button data-act="ltGo" style="width:100%;max-width:280px;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Let's spell →</button>
    </div></div>`;
  const hearts='❤️'.repeat(Math.max(0,3-(lt.fails||0)))+'🖤'.repeat(Math.min(3,lt.fails||0));
  const ltw=(lt.words||[])[lt.i]||{};
  const ltMeaning=ltw.d?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:12px;text-align:left">
        <div style="font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:3px">Meaning</div>
        <div style="font-size:13.5px;font-weight:650;color:var(--text);line-height:1.45">${esc(maskTxt(ltw.d,ltw.w))}</div>
        ${ltw.s?`<div style="font-size:12.5px;color:var(--muted);margin-top:4px;line-height:1.45">“${esc(maskTxt(ltw.s,ltw.w))}”</div>`:''}
      </div>`:'';
  return `<div style="max-width:520px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="font-family:var(--display);font-weight:800;font-size:20px">Find my Bee Band</span><span style="margin-left:auto;font-size:13px">${hearts}</span></div>
    <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,30px);box-shadow:var(--sh-rest);text-align:center">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">Band ${lt.band} · ${bandTier(lt.band||2)}</span><span style="font-family:var(--mono);font-size:13px;color:var(--muted)">✓ ${lt.ok}/3 to climb</span></div>
      <p style="font-size:13px;color:var(--muted);font-weight:650;margin:0 0 12px">Spell 3 right to climb a band. Three misses and we lock in your start.</p>
      <button data-act="ltSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      ${ltMeaning}
      <input data-inp="ltType" data-key="ltKey" data-fkey="ltType" value="${escA(lt.typed||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type it…" style="width:100%;padding:15px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:20px;text-align:center;letter-spacing:.06em;margin-bottom:12px">
      <button data-act="ltEnter" style="width:100%;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Submit</button>
      <button data-act="ltSkip" style="margin-top:12px;color:var(--muted);font-weight:700;font-size:13px;text-decoration:underline;text-underline-offset:3px">Skip — start at Level 1</button>
    </div></div>`; }
// Traps — the weak-pattern radar screen. Overview = radar; detail = tips + concepts first, then practice.
const TRAP_CONCEPT_RE={ double:/Double Consonant/i, silent:/Silent kn|Silent -gh|Blends & Silent/i, ieei:/ie \/ ei/i, schwa:/Schwa/i, endings:/Suffix|-tion|able/i, french:/French Loanword/i, greek:/Greek (Prefixes|Root|Suffixes)/i, latin:/Latin (Prefixes|Root|Suffixes)/i };
function viewTraps(){ const S=state; const traps=missTraps(); const sel=S.trapSel;
  if(sel){ const t=traps.find(x=>x.k===sel)||{k:sel,label:(sel[0].toUpperCase()+sel.slice(1)),n:0};
    const idx=wordIndex(); const ws=trapWords(sel); const mine=((active().missed)||[]).map(m=>idx[nkey(m.w)]||{w:m.w}).filter(w=>ws.some(x=>nkey(x.w)===nkey(w.w)));
    const hooks=mine.slice(0,2).map(w=>w.h?`<div style="display:flex;gap:9px;align-items:flex-start;padding:11px 13px;border-radius:12px;background:var(--surface)"><span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00)">${window.SB_ICON?SB_ICON('bulb',{size:16}):iconSVG('bulb',16)}</span><span style="font-size:13px;line-height:1.5">“<b>${esc(w.w)}</b>” — ${esc(w.h)}</span></div>`:'').join('');
    const chs=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]); const re=TRAP_CONCEPT_RE[sel];
    const rel=re?chs.map((ch,i)=>({ch,i})).filter(x=>re.test(x.ch.title)||re.test(x.ch.category)).slice(0,3):[];
    const relChips=rel.map(x=>`<button data-act="openConcept" data-arg="${x.i}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">${window.SB_ICON?SB_ICON('grid',{size:14}):iconSVG('grid',14)} ${esc(conceptShort(x.ch.title))}</button>`).join('');
    const wordChips=ws.slice(0,12).map(w=>`<button data-act="say" data-arg="${escA(w.w)}" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:6px 10px;border-radius:6px;background:var(--surface2)">${esc(w.w)}</button>`).join('');
    return `<div style="max-width:640px;margin:0 auto;animation:sb-rise .35s ease both">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="trapBack" style="color:var(--muted);font-weight:700;font-size:14px">← All traps</button></div>
      ${pageHead(t.label, t.n?(t.n+' misses traced here'):'', 'Step 1: understand the pattern. Step 2: beat it in practice.')}
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:18px;box-shadow:var(--sh-rest);margin-bottom:14px">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:8px">The trick</div>
        <p style="margin:0 0 10px;font-size:15px;line-height:1.55">${TRAP_TIP[sel]||'Meet each word, find its story, and the pattern loses its power.'}</p>
        ${hooks?`<div style="display:flex;flex-direction:column;gap:7px">${hooks}</div>`:''}
      </div>
      ${relChips?`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:var(--sh-rest);margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:9px">Learn it properly</div><div style="display:flex;gap:8px;flex-wrap:wrap">${relChips}</div></div>`:''}
      <div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:16px 18px;box-shadow:var(--sh-rest);margin-bottom:16px">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:9px">Your battlefield · ${ws.length} words</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap">${wordChips}</div>
      </div>
      <button data-act="drillTrap" data-arg="${sel}" style="width:100%;padding:15px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Free yourself — practice these →</button>
    </div>`; }
  const maxN=traps.length?traps[0].n:1;
  const rows=traps.map((t,i)=>`<button data-act="trapPick" data-arg="${t.k}" class="sb-lift" style="display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:14px 16px">
      <span style="width:40px;height:40px;border-radius:12px;flex-shrink:0;display:grid;place-items:center;background:var(--fix-tint,#FBE9E7);color:var(--fix,#C4453C);font-weight:900;font-size:15px">${t.n}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:15px">${t.label}</span>
        <span style="display:block;height:5px;border-radius:999px;background:var(--tint-deep,var(--surface2));overflow:hidden;margin-top:7px"><span style="display:block;height:100%;background:var(--fix,#C4453C);width:${Math.round(t.n/maxN*100)}%"></span></span></span>
      <span style="color:var(--action,var(--accent));font-weight:800">→</span></button>`).join('');
  return `<div style="max-width:640px;margin:0 auto;animation:sb-rise .35s ease both">
    ${pageHead('Your Traps','the weak-pattern radar','Your misses, clustered by the pattern that caused them. Beat the pattern and whole families of words come free.')}
    <div style="position:relative;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--sh-rest);margin-bottom:16px">
      ${SB_COVER(state.theme,'traps',{h:110,dark:state.mode==='dusk'})}
      <span style="position:absolute;left:14px;bottom:12px;font-family:var(--display);font-weight:800;font-size:20px;color:${state.mode==='dusk'?'var(--action,#6C4FE0)':'#fff'};text-shadow:0 1px 5px rgba(0,0,0,.3)">${traps.length?traps.length+' patterns on the radar':'Radar clear'}</span>
    </div>
    ${traps.length?`<div style="display:flex;flex-direction:column;gap:9px">${rows}</div>`
      :beeEmpty('sleepy','Nothing on the radar — no misses to trace yet. The bee naps until you find a tricky word.')}
  </div>`; }
/* ===================== APP SHELL ===================== */
function viewApp(){
  const S=state;
  const EXPLORE_NAVS={explore:1,concepts:1,journeys:1,themes:1,figurative:1,vocab:1,typing:1};
  const navTabs=[['home','Home','home'],['coach','Practice','pencil'],['explore','Explore','compass'],['games','Arcade','joystick'],['shop','Store','cart'],['progress','Progress','chart'],['collection','Collection','crown']].map(([key,label,ic])=>{
    const on=key==='explore'?!!EXPLORE_NAVS[S.nav]:S.nav===key;
    const glyph=key==='explore'?(window.SB_ICON?SB_ICON('compass',{size:17}):iconSVG('grid',17)):iconSVG(ic,17);
    return `<button data-act="setNav" data-arg="${key}" style="display:inline-flex;align-items:center;gap:8px;white-space:nowrap;padding:10px 18px;border-radius:var(--r-pill,999px);font-family:var(--display);font-weight:800;font-size:15px;letter-spacing:.01em;${on?'background:var(--action,var(--accent));color:var(--action-ink,#fff)':'background:transparent;color:var(--muted)'}">${glyph} ${label}</button>`;
  }).join('');
  let content='';
  if(S.nav==='home') content=viewHome();
  else if(S.nav==='concepts') content = S.conceptSel ? viewConceptDetail() : viewConceptList();
  else if(S.nav==='levelup') content=viewLevelUp();
  else if(S.nav==='train') content=viewTrain();
  else if(S.nav==='coach') content=viewCoach();
  else if(S.nav==='quest') content=viewQuest();
  else if(S.nav==='explore') content=viewExplore();
  else if(S.nav==='figurative') content=viewFigurative();
  else if(S.nav==='vocab') content=viewVocab();
  else if(S.nav==='typing') content=viewTyping();
  else if(S.nav==='builder') content=viewBuilder();
  else if(S.nav==='leveltest') content=viewLevelTest();
  else if(S.nav==='traps') content=viewTraps();
  else if(S.nav==='evolution') content=viewEvolution();
  else if(S.nav==='collection') content=viewCollection();
  else if(S.nav==='finder') content=viewFinder();
  else if(S.nav==='games') content=viewGames();
  else if(S.nav==='sq') content=(window.SQ?SQ.view():viewGames());
  else if(S.nav==='trivia') content=(window.STV?STV.view():viewGames());
  else if(S.nav==='shop') content=viewShop();
  else if(S.nav==='themes') content=viewThemes();
  else if(S.nav==='progress') content=viewProgressShell();
  else if(S.nav==='parent') content=viewProgressShell();
  else if(S.nav==='journeys') content=viewJourneys();
  else if(S.nav==='settings') content=viewSettings();
  else if(S.nav==='evofeedback') content=viewEvoFeedback();
  else content=viewHome();
  const lightOn=S.mode==='light';
  const celebrate=S.celebrate?(()=>{ const cb=S.celebrate; const c2=active(); const evo2=EVO[S.theme]||EVO.spellbound; const fi=formIdx(heroLevel(c2));
    return `<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:20px;background:color-mix(in srgb,var(--action) 26%,rgb(20 12 40 / .78))" data-act="celebrateClose">
      <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;box-shadow:var(--sh-overlay);max-width:420px;width:100%;padding:32px 28px;text-align:center;animation:sb-pop .45s ease both">
        <div style="width:110px;height:120px;margin:0 auto 6px;animation:sb-bee-talk 1.6s ease-in-out infinite">${mascotAcc('excited')}</div>
        <div style="font-family:var(--ui);font-weight:650;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">${cb.champ?'Champion unlocked':'Level cleared'}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:32px;line-height:1.08;margin:6px 0 4px">${cb.champ?'Bizzing Bee Champ!':('Level '+cb.level+' unlocked!')}</div>
        <div style="font-size:15px;color:var(--muted);font-weight:450">${esc(cb.list)} · ${esc(c2.name||'')} — ${evo2[fi]} · ${cb.date}</div>
        <div style="display:flex;justify-content:center;gap:6px;margin:14px 0 18px">${[0,1,2].map(i=>`<span style="display:inline-block;width:12px;height:12px;border-radius:999px;background:var(--treasure,#F0B429);animation:sb-pop .4s ease ${(i*0.12).toFixed(2)}s both"></span>`).join('')}</div>
        ${(()=>{ const L=lessonsAll()[loreCount(c2)-1]; if(!L) return ''; return `<div style="text-align:left;display:flex;align-items:center;gap:11px;background:var(--treasure-tint,#FFF3D6);border-radius:12px;padding:11px 13px;margin-bottom:14px">
          <span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00)">${window.SB_ICON?SB_ICON('book',{size:22}):iconSVG('book',22)}</span>
          <span style="min-width:0;flex:1"><span style="display:block;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Lore unlocked</span>
          <span style="display:block;font-weight:800;font-size:14px;color:#241E33;line-height:1.25">${esc(L.title)}</span></span>
          <button data-act="celebrateLore" data-arg="${L.n}" style="flex-shrink:0;padding:8px 12px;border-radius:10px;background:var(--treasure-deep,#8A5B00);color:#fff;font-weight:800;font-size:12px">Read →</button></div>`; })()}
        <button data-act="celebrateClose" style="width:100%;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Keep climbing →</button>
        <div style="font-size:12px;color:var(--muted);margin-top:10px">Screenshot this card to share it!</div>
      </div></div>`; })():'';
  const bandUp='';

  return `<div style="min-height:100dvh;display:flex;flex-direction:column">${celebrate}${bandUp}
    <div style="position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);background:color-mix(in srgb,var(--bg1) 82%,transparent);border-bottom:1px solid var(--line)">
      <div style="max-width:1080px;margin:0 auto;padding:11px clamp(14px,3.5vw,32px);display:flex;align-items:center;gap:12px">
        <button data-act="openDrawer" aria-label="Menu" style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--text);flex-shrink:0">${iconSVG('menu',20)}</button>
        <div style="display:flex;align-items:center;gap:9px;margin-right:auto"><div style="width:34px;height:38px;flex-shrink:0">${mascotSVG('happy')}</div><span class="sb-brand" style="font-family:var(--display);font-weight:800;font-size:20px;letter-spacing:-.01em;white-space:nowrap"><i style="font-style:italic">Bizzing</i> Bee</span></div>
        <button data-act="openFinder" class="sb-mob-hide" title="Word Finder — search 129,000 words, hear them, and add them to a list" aria-label="Search words" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--muted);font-weight:800;font-size:13px">${iconSVG('search',15)}<span class="sb-search-lbl">Search</span></button><button data-act="openEvo" class="sb-mob-hide" title="Karma — your practice record. One right word = 1 Karma; it grows your evolution and is never spent." style="display:inline-flex;align-items:center;gap:4px;padding:6px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:900;font-size:13px">✦ ${fmtN(getList(active(),activeListKey()).xp||0)}</button><button data-act="openShop" title="Your coins — tap to open the Store" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)">${coinAmt(active().coins||0,14)}</button>
        <button data-act="cycleMode" aria-label="Switch look (Light / White / Dusk)" title="Light / White / Dusk" style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--text);font-size:16px;line-height:1" class="sb-mob-hide">${S.mode==='light'?'☀':S.mode==='white'?'◻':'☾'}</button>
        <button data-act="goSettings" aria-label="Settings" style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--text)">${iconSVG('gear',17)}</button>
      </div>
      <div class="sb-topnav" style="max-width:1080px;margin:0 auto;padding:0 clamp(14px,3.5vw,32px) 9px;display:flex;gap:6px;overflow-x:auto">${navTabs}</div>
    </div>
    ${viewDrawer()}
    <div class="sb-content" style="max-width:1080px;margin:0 auto;width:100%;padding:18px clamp(14px,3.5vw,32px) 60px">${content}</div>
    <nav class="sb-tabbar" aria-label="Primary">
      ${[['home','Home','home'],['coach','Practice','pencil'],['games','Arcade','joystick'],['progress','Progress','chart']].map(([k,l,ic])=>{ const on=S.nav===k||(k==='coach'&&(S.nav==='train'||S.nav==='levelup'));
        return `<button data-act="setNav" data-arg="${k}" aria-current="${on?'page':'false'}" style="${on?'color:var(--accent)':'color:var(--muted)'}">${iconSVG(ic,21)}<span>${l}</span></button>`; }).join('')}
      <button data-act="openDrawer" style="color:var(--muted)">${iconSVG('menu',21)}<span>More</span></button>
    </nav>
  </div>`;
}

// Side drawer — NOT a copy of the top nav. Identity + jump-back-in + colored Explore
// shortcuts + training tools + family corner. The top nav answers "where am I";
// the drawer answers "what can I do from here".
function viewDrawer(){
  if(!state.drawerOpen) return '';
  const c=active(); ensureLists(c); const key=activeListKey();
  const evoD=EVO[state.theme]||EVO.spellbound; const fiD=formIdx(heroLevel(c));
  const kick=(t)=>`<div style="font-family:var(--ui,var(--body));font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:650;padding:16px 12px 6px">${t}</div>`;
  const row=(k,ic,label,sub,active)=>`<button data-act="drawer" data-arg="${k}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:10px 12px;border-radius:10px;${active?'background:var(--action,var(--accent));color:var(--action-ink,#fff)':'background:transparent;color:var(--text)'}">
      <span style="display:inline-flex;flex-shrink:0;${active?'':'color:var(--muted)'}">${iconSVG(ic,18)}</span>
      <span style="min-width:0"><span style="display:block;font-weight:800;font-size:15px;line-height:1.15">${label}</span>${sub?`<span style="display:block;font-size:12px;font-weight:650;${active?'opacity:.85':'color:var(--muted)'}">${sub}</span>`:''}</span></button>`;
  const wayRow=(k,wkey,label,sub)=>`<button data-act="drawer" data-arg="${k}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:8px 12px;border-radius:10px;background:transparent;color:var(--text)">
      ${wayTile(wkey,34,-2)}
      <span style="min-width:0"><span style="display:block;font-weight:800;font-size:15px;line-height:1.15">${label}</span><span style="display:block;font-size:12px;font-weight:650;color:var(--muted)">${sub}</span></span></button>`;
  const missedN=((c.missed)||[]).length;
  return `<div data-act="closeDrawer" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:55;animation:sb-fade .2s ease both"></div>
    <aside data-act="noop" style="position:fixed;top:0;left:0;bottom:0;width:300px;max-width:86vw;background:var(--paper,var(--bg2));border-right:1px solid var(--line);z-index:56;display:flex;flex-direction:column;padding:14px 12px;overflow-y:auto;box-shadow:var(--sh-overlay)">
      <div style="display:flex;align-items:center;gap:11px;padding:8px 8px 14px;border-bottom:1px solid var(--line);margin-bottom:4px">
        <div style="width:44px;height:50px;flex-shrink:0">${mascotAcc('happy')}</div>
        <div style="min-width:0;flex:1">
          <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.1">${esc(c.name||'Speller')}</div>
          <div style="font-size:12px;color:var(--muted);font-weight:650">${evoD[fiD]} · <span style="color:var(--treasure-deep,#8A5B00);font-weight:800">${c.coins||0} coins</span></div>
        </div>
        <button data-act="closeDrawer" aria-label="Close" style="width:32px;height:32px;border-radius:10px;background:var(--surface2);display:grid;place-items:center;color:var(--text);flex-shrink:0">${iconSVG('close',18)}</button>
      </div>
      <nav style="display:flex;flex-direction:column;gap:1px;overflow-y:auto">
        ${row('levelup','steps','Continue practising','${LBL}'.replace('${LBL}',esc(listLabel(key).split(' · ')[0])+' · Level '+(listStageIdx(c,key)+1)),false)}
        ${missedN?row('weak','spark','Revenge round',missedN+' missed words waiting',false):''}
        ${kick('Explore')}
        ${wayRow('concepts','concepts','Concepts','121 concepts · 11 chapters')}
        ${wayRow('journeys','journeys','Word Journeys','the history of words')}
        ${wayRow('themes','themes','Theme Journeys',myThemes().length?myThemes().length+' worlds picked':'pick 3–5 worlds')}
        ${wayRow("figurative","figurative","Idioms & Sayings","2,350 phrases · true origin stories")}
        ${wayRow("vocab","vocab","Vocabulary","word → meaning, bee-style")}
        ${wayRow("typing","typing","Typing Trainer","learn to type · 60s test")}
        ${row('trivia','bulb','Bee Trivia','5,000 questions · 20 themes',state.nav==='trivia')}
        ${kick('Tools')}
        ${row('builder','pencil','List Builder','custom list in five taps',state.nav==='builder')}
        <div class="sb-mob-only" style="display:contents">
        ${row('collection','crown','My Collection',avOwnedCount(c)+'/'+SB_AVATARS.list.length+' avatars · badges',state.nav==='collection')}
        ${row('shop','cart','Store','avatar packs, worlds & artifacts',state.nav==='shop')}
        ${row('finder','search','Search words','find any of 129,000 words',state.nav==='finder')}
        </div>
        ${kick('')}
        ${row('settings','gear','Theme & settings','worlds, voice, style',state.nav==='settings')}
      </nav>
    </aside>`;
}

// bee accessories — cosmetic overlays on the mascot (viewBox matches mascotSVG)
function beeAccSVG(k){ if(!k) return '';
  if(k==='goggles') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><g fill="rgba(120,200,255,.30)" stroke="#2B1B5E" stroke-width="6"><circle cx="92" cy="132" r="31"/><circle cx="152" cy="132" r="31"/></g><path d="M123 132h-2M61 128l-22-6M183 128l22-6" stroke="#2B1B5E" stroke-width="6" stroke-linecap="round"/></svg>';
  if(k==='cape') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><path d="M50 152 C22 190 12 224 4 248 C38 238 56 224 64 204 Z" fill="#D6453C" stroke="#A33232" stroke-width="3" stroke-linejoin="round"/><circle cx="54" cy="152" r="7" fill="#F0B429" stroke="#C8901B" stroke-width="2"/></svg>';
  if(k==='bolt') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><path d="M204 26 L178 72 L194 72 L170 118 L212 64 L194 64 L216 26 Z" fill="#FFD24D" stroke="#C8901B" stroke-width="3" stroke-linejoin="round"/></svg>';
  if(k==='crown') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><path d="M84 30 L96 8 L112 24 L120 2 L128 24 L144 8 L156 30 Z" fill="#F0B429" stroke="#C8901B" stroke-width="3" stroke-linejoin="round"/><circle cx="96" cy="10" r="4" fill="#FFD34D"/><circle cx="120" cy="4" r="4" fill="#FFD34D"/><circle cx="144" cy="10" r="4" fill="#FFD34D"/></svg>';
  if(k==='bow') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><g transform="translate(120,238)"><path d="M0 0 L-26 -14 Q-34 0 -26 14 Z" fill="#DC5B7E"/><path d="M0 0 L26 -14 Q34 0 26 14 Z" fill="#DC5B7E"/><circle cx="0" cy="0" r="7" fill="#C43D5A"/></g></svg>';
  if(k==='halo') return '<svg viewBox="0 0 240 270" width="100%" height="100%" style="display:block;overflow:visible;position:absolute;inset:0;pointer-events:none"><ellipse cx="120" cy="18" rx="46" ry="12" fill="none" stroke="#F0B429" stroke-width="5"/><circle cx="74" cy="18" r="4" fill="#FFD34D"/><circle cx="166" cy="18" r="4" fill="#FFD34D"/><circle cx="120" cy="6" r="4" fill="#FFD34D"/></svg>';
  return ''; }
function mascotAcc(mood){ const c=active(); const acc=c&&c.accOn?beeAccSVG(c.accOn):'';
  return '<div style="position:relative;width:100%;height:100%">'+mascotSVG(mood)+acc+'</div>'; }
function streakCard(){ const c=active(); ensureLists(c); const t=todayKey(); const played=new Set(c.daysPlayed||[]);
  const days=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); days.push({on:played.has(k), today:k===t, dn:['S','M','T','W','T','F','S'][d.getDay()]}); }
  const dots=days.map(d=>`<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="width:17px;height:17px;border-radius:6px;display:inline-block;background:${d.on?'var(--accent)':'var(--surface2)'};${d.today?'box-shadow:0 0 0 2px var(--accent)':''}"></span><span style="font-size:12px;color:var(--muted);font-weight:700">${d.dn}</span></div>`).join('');
  const playedToday=played.has(t); const next=[3,7,14,30].find(m=>m>(c.streak||0));
  return `<div class="sb-card">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:11px"><div style="width:42px;height:42px;border-radius:10px;background:color-mix(in srgb,#FF8A3D 18%,var(--bg2));color:#FF7A1A;display:grid;place-items:center">${iconSVG('fire',24)}</div><div><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1">${c.streak||0}-day streak</div><div style="font-size:12px;color:var(--muted);font-weight:600">Best ${c.streakBest||c.streak||0} · ${playedToday?'practised today ✓':'practise today to keep it going'}</div></div></div>
      ${next?`<div style="text-align:right"><div style="font-size:12px;color:var(--muted);font-weight:700">Next reward</div><div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-weight:800;font-size:13px;color:var(--accent)">${next}-day · ${coinAmt(STREAK_REWARDS[next],12)}</div></div>`:'<div style="font-weight:800;font-size:13px;color:var(--accent)">All rewards earned ✓</div>'}
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:space-between">${dots}</div>
  </div>`; }
// festive confetti streamers — a few, gently floating (kept light so the card stays clean)
function streamers(){
  const R=[[9,16,'#FFD23F',22],[26,70,'#36E0C8',-26],[46,22,'#FFFFFF',40],[70,68,'#FFE27A',-16],[86,26,'#36E2FF',30],[60,46,'#FFFFFF',-22]];
  const D=[[16,44,'#fff'],[78,18,'#FFE27A'],[40,80,'#36E2FF']];
  return `<div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">`+
    R.map(([l,t,co,r],i)=>`<span style="position:absolute;left:${l}%;top:${t}%;width:5px;height:14px;background:${co};border-radius:6px;opacity:.8;--r:${r}deg;transform:rotate(${r}deg);animation:sb-confetti ${3+(i%3)}s ease-in-out ${(i*0.45).toFixed(2)}s infinite"></span>`).join('')+
    D.map(([l,t,co])=>`<span style="position:absolute;left:${l}%;top:${t}%;width:5px;height:5px;border-radius:50%;background:${co};opacity:.7"></span>`).join('')+
  `</div>`;
}
function viewHome(){
  const S=state; const c=active(); ensureLists(c); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound;
  const focusedH=((c.ageMode)||((c.age||9)<=11?'playful':'focused'))==='focused';
  const aKey=activeListKey(); const aLevel=listLevel(c,aKey); const fIdx=formIdx(heroLevel(c)); const oLevel=overallLevel(c);
  const greetHour=new Date().getHours(); const greeting=greetHour<12?'Good morning,':greetHour<18?'Good afternoon,':'Good evening,';
  const goalTarget=c.goal||S.draft.goal||10; const goalDoneN=goalToday(); const goalPctNum=Math.min(100,Math.round((goalDoneN/goalTarget)*100));
  const masteredCt=listWords(aKey).filter(w=>S.luMastered[nkey(w.w)]).length; const listCt=listWords(aKey).length||1;
  const buzzCt=(S.missedWords&&S.missedWords.length)||0;
  const aLvlNew=listStageIdx(c,aKey)+1;
  const cAll=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]); const cDone=cAll.filter(ch=>conceptStat(ch).done).length; const cTot=cAll.length||110;
  const cChapDone=(cAll.length?conceptChapters().filter(x=>conceptChapterStat(x).complete).length:0);
  const lDone=lessonsDoneCount(); const lUnits=lessonUnits();
  const lChapDone=lUnits.filter(u=>{ const ls=lessonsAll().filter(L=>L.unit===u.n); return ls.length && ls.every(L=>lessonComplete(L)); }).length; const lChapTot=lUnits.length||10;
  const qp=c.questPath; const qpLabel=qp==='themes'?'Theme Journey':qp==='own'?'My own list':qp==='journey'?'Bizzing Bee Journey':null;
  const journeys=[
    {goAct:'openCoach', ic:'steps', sc:'coach', c1:'#7C5CFF',c2:'#5A37D6',accent:'#7C5CFF', title:"Champion's Quest", desc:qp?('Your path: '+qpLabel+' — climb its Levels with Revise & Practice. Switch paths any time.'):'One quest, three paths — the Bizzing Bee ladder, a Theme Journey, or your own word list.', pct:Math.min(100,Math.round(aLvlNew/20*100))+'%', badge:qp?('Level '+aLvlNew+' · '+qpLabel):'Choose your path', kind:'go'},
    {goAct:'setNav', goArg:'concepts', ic:'grid', sc:'concept', c1:'#13A892',c2:'#0E8A78',accent:'#13A892', title:'Concepts', desc:'Spelling basics, patterns, prefixes, roots & tricky endings, in 11 short chapters.', pct:Math.round(cDone/(cTot||1)*100)+'%', badge:cChapDone+'/'+(conceptChapters().length||11)+' chapters', kind:'go'},
    {goAct:'openJourneys', ic:'book', sc:'book', c1:'#E0922E',c2:'#C8791B',accent:'#E0922E', title:'Word Journeys', desc:'The history & geography of words — roots, journeys & origins, in 10 chapters.', pct:Math.round((lChapTot?lChapDone/lChapTot:0)*100)+'%', badge:S.premium?(lChapDone+'/'+lChapTot+' chapters'):'Premium', kind:S.premium?'go':'lock'},
    {goAct:'openGames', ic:'joystick', sc:'joystick', festive:true, title:'Arcade', desc:'Spelling Quest, Boss Battle, Word Quiz & more — earn coins!', pct:Math.min(100,(c.streak||0)*10)+'%', badge:(c.coins||0)+' coins', kind:'go'},
  ].filter(j=>focusedH?(j.sc==='coach'||j.sc==='concept'||j.festive):(j.sc==='coach'||j.festive)).map((j,ji)=>{
    const arg=j.goArg?`data-arg="${j.goArg}"`:'';
    const wk=({coach:'quest',concept:'concepts',book:'journeys',joystick:'arcade',theme:'themes'})[j.sc]||'quest';
    const cid=({coach:'quest',concept:'concepts',book:'journeys',joystick:'arcade',theme:'themes'})[j.sc]||'quest';
    const _pd=S.mode==='dusk'; const pillBg=_pd?'#FFFFFF':'#241E33', pillFg=_pd?'#241E33':'#FFFFFF';
    const meta=`<span style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;padding:4px 11px;border-radius:var(--r-pill,999px);font-size:11px;font-weight:800;letter-spacing:.02em;background:${pillBg};color:${pillFg}">${j.festive?iconSVG('coin',12):(j.kind==='lock'?iconSVG('lock',11,2.2):'')}${j.festive?((c.coins||0)+' coins'):esc(j.badge)}</span>`;
    return `<button class="sb-lift" data-act="${j.goAct}" ${arg} style="text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;overflow:hidden;box-shadow:var(--sh-rest);display:flex;flex-direction:column;padding:0">
      <div style="position:relative;width:100%">
        ${SB_COVER(S.theme,cid,{h:110,dark:S.mode==='dusk'})}
        <span style="position:absolute;left:14px;bottom:-16px">${wayTile(wk,48,ji%2?2.5:-2.5)}</span>
      </div>
      <div style="padding:12px 14px 0 76px;min-height:30px;display:flex;align-items:center;justify-content:flex-end;width:100%">${meta}</div>
      <div style="padding:2px 16px 16px;display:flex;flex-direction:column;flex:1;width:100%">
        <div style="font-family:var(--ui,var(--body));font-weight:650;font-size:17px;line-height:1.2;color:var(--ink,var(--text))">${j.title}</div>
        <div style="font-size:15px;color:var(--muted);line-height:1.5;margin:4px 0 14px">${j.desc}</div>
        <div style="margin-top:auto;height:6px;border-radius:var(--r-pill,999px);background:var(--tint-deep,var(--surface2));overflow:hidden"><div style="height:100%;background:${j.kind==='lock'?'var(--muted)':'var(--action,var(--accent))'};width:${j.pct}"></div></div>
      </div></button>`;
  }).join('');
  return `<div>
    ${(()=>{ const lp=getList(c,aKey); const lf=levelFromXp(lp.xp||0); const xpToNext=Math.max(0,(lf.need||1)-(lf.into||0));
      const evoPct=Math.min(100,Math.round((lf.into||0)/(lf.need||1)*100));
      const bb=beeBand(c);
      const bandBanner=`<button data-act="${bb.calibrating?'startLevelTest':'setNav'}" data-arg="progress" title="${bb.calibrating?'A 3-minute placement quest':'Open Progress for the full band ladder'}" class="sb-card" style="width:100%;display:flex;align-items:center;gap:14px;flex-wrap:wrap;background:linear-gradient(100deg,color-mix(in srgb,var(--action,var(--accent)) 14%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 62%);border-color:color-mix(in srgb,var(--action,var(--accent)) 35%,var(--line));border-radius:var(--r-lg,16px);padding:12px 18px;margin-bottom:14px;cursor:pointer">
        <span style="display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);flex-shrink:0">${iconSVG('target',22)}</span>
        <span style="min-width:0;flex:1">
          <span class="sb-ct" style="display:block">${bb.calibrating?'Find your Bee Band':('Bee Band '+bb.band+' · '+bb.tier)}</span>
          <span class="sb-cn sb-bandsub" style="display:block">${bb.calibrating?'A 3-minute quest sets your words, games and tips exactly to you.':'Skill — what you’re ready to spell, proven by your words. Games and tips follow it.'}</span>
        </span>
        ${bb.calibrating?'':`<span style="flex-shrink:0;display:flex;gap:4px;align-items:center" aria-hidden="true">${[1,2,3,4,5,6,7,8,9].map(n=>`<span style="width:${n===bb.band?'11px':'7px'};height:${n===bb.band?'11px':'7px'};border-radius:99px;background:${n<=bb.band?'var(--action,var(--accent))':'var(--tint-deep,var(--surface2))'};${n===bb.band?'box-shadow:0 0 0 3px color-mix(in srgb,var(--action,var(--accent)) 25%,transparent);':''}"></span>`).join('')}</span>`}
        <span class="sb-cl">${bb.calibrating?'Start →':'details →'}</span>
      </button>`;
      return `${bandBanner}<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px;margin-bottom:18px">
      <div class="sb-card" style="display:flex;align-items:center;gap:16px;min-height:156px">
        <div style="position:relative;flex-shrink:0">
          <div style="width:108px;height:112px;animation:sb-bee-bob 3.4s ease-in-out infinite;display:grid;place-items:center">${(c.avatar&&c.avatar!=='bizzy'&&c.avatar!=='bee'&&window.SB_AVATARS&&SB_AVATARS.byId[c.avatar])?SB_AVATAR(c.avatar,104):mascotAcc(S.mood)}</div>
        </div>
        <div style="min-width:0;flex:1">
          <div class="sb-cs">${greeting}</div>
          <div style="font-family:var(--display);font-weight:800;font-size:24px;line-height:1.1">${esc(c.name)}</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">
            ${(c.streak||0)>0?`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:var(--r-pill,999px);background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:13px">${iconSVG('flame',14)} ${c.streak}-day streak</span>`:''}
            ${(()=>{ const ms=milestone(); return (ms&&ms.days>=0)?`<button data-act="setNav" data-arg="progress" style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:var(--r-pill,999px);background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">🐝 ${ms.days} days to ${esc(trunc(ms.label,18))}</button>`:''; })()}
          </div>
        </div>
      </div>
      <button data-act="openEvo" title="Open the full evolution ladder" class="sb-card" style="display:flex;align-items:stretch;gap:14px;cursor:pointer;min-height:156px">
        <div style="flex-shrink:0;text-align:center;align-self:center">
          <div style="width:76px;height:82px">${evArt(theme,fIdx)}</div>
          <div class="sb-cn" style="font-weight:800;color:var(--ink,var(--text));margin-top:1px">${evo[fIdx]}</div>
        </div>
        <div style="min-width:0;flex:1;display:flex;flex-direction:column">
          ${fIdx>=9
            ?`<div class="sb-ct" style="margin-top:auto;margin-bottom:7px">Top form reached! 🎉</div>`
            :`<div style="display:flex;align-items:center;gap:7px;margin-top:auto;margin-bottom:7px"><span class="sb-ct">${xpToNext} Karma to ${evo[fIdx+1]}</span><span style="width:22px;height:24px;flex-shrink:0;display:inline-block;overflow:hidden">${evArt(theme,fIdx+1)}</span></div>`}
          <div style="height:6px;border-radius:var(--r-pill,999px);background:var(--tint-deep,var(--surface2));overflow:hidden;margin-bottom:7px"><div style="height:100%;border-radius:inherit;background:var(--treasure,#F0B429);width:${evoPct}%"></div></div>
          <div class="sb-cn">${fIdx>=9?'Queen of the hive 🐝':'+1 Karma per correct word — everything counts.'}</div>
          <div style="margin-top:auto;text-align:right"><span class="sb-cl">See the ladder →</span></div>
        </div>
      </button>
      <div class="sb-card" style="display:flex;align-items:center;gap:16px;min-height:156px">
        <div style="width:112px;height:112px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:conic-gradient(var(--action,var(--accent)) ${goalPctNum}%, var(--tint-deep,var(--surface2)) 0)">
          <div style="width:94px;height:94px;border-radius:50%;background:var(--paper,var(--bg2));display:grid;place-items:center;text-align:center"><div><div style="font-family:var(--display);font-weight:800;font-size:19px;line-height:1">${goalDoneN}/${goalTarget}</div><div class="sb-cn" style="margin-top:2px">today</div></div></div>
        </div>
        <div style="min-width:0">
          <div class="sb-ct" style="margin-bottom:3px">Daily goal</div>
          <div class="sb-cs" style="margin-bottom:11px">${goalPctNum>=100?'Goal smashed for today — amazing!':('Spell '+Math.max(0,goalTarget-goalDoneN)+' more to hit today\u2019s goal.')}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><button data-act="openCoach" style="padding:10px 17px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">${goalDoneN>0?'Continue →':'Start practice →'}</button>
          <button data-act="champTen" title="Ten championship-tier words — your daily stretch" style="padding:10px 14px;border-radius:10px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:13px">🏆 Champ 10</button></div>
        </div>
      </div>
    </div>`; })()}
${focusedH?(()=>{ return `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:18px">${journeys}</div>`; })()
    :`${tipOfDay(true)}<div style="font-family:var(--display);font-weight:800;font-size:15px;margin:4px 2px 12px">Keep going</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px;margin-bottom:18px">${journeys}</div>`}
  </div>`;
}
function avatarSVG(id,size){ size=size||30;
  if(window.SB_AVATARS && SB_AVATARS.byId[id]) return SB_AVATAR(id,size);
  if(typeof id==='string' && id.slice(0,2)==='w:'){ const p=id.split(':'); try{ return evEmb(p[1],+p[2]).replace('width="54" height="58"','width="100%" height="100%"'); }catch(e){ return buddySVG('bee',size); } }
  return buddySVG(id,size); }
function avOwned(c,id){ if(state.devUnlock) return true; const a=window.SB_AVATARS&&SB_AVATARS.byId[id]; if(!a) return true; return a.rarity==='free' || !!((c.avOwned||{})[id]); }
function avOwnedCount(c){ return SB_AVATARS.list.filter(a=>avOwned(c,a.id)).length; }
function evArt(theme,i){ try{ return evEmb(theme,i).replace('width="54" height="58"','width="100%" height="100%"'); }catch(e){ return ''; } }
function badgeDefs(){ const c=active(); const bb=beeBand(c); const jl=listStageIdx(c,'journey')+1;
  let concepts=0; try{ loadConcepts(); concepts=(state.conceptData||[]).filter(ch=>conceptStat(ch).done).length; }catch(e){}
  const st=(n)=>((c.streak||0)>=n)||!!((c.streakRewards||{})[n]);
  const mast=masteredCount();
  const owned=avOwnedCount(c);
  const legs=SB_AVATARS.list.filter(a=>a.rarity==='legendary'&&avOwned(c,a.id)).length;
  const epics=SB_AVATARS.list.filter(a=>a.rarity==='epic'&&avOwned(c,a.id)).length;
  const karma=Object.values(c.lists||{}).reduce((s,l)=>s+(l.xp||0),0);
  let seasons=0; try{ if(window.SQ) seasons=SB_AVATARS.packs.filter(p=>SQ.cleared(p.pack)>=5).length; }catch(e){}
  const worlds=THEMES.filter(t=>isThemeUnlocked(t.id)).length;
  const wkWords=(c.week||[]).reduce((a,b)=>a+(b||0),0);
  const arts=((c.pow||{}).shield||0)+((c.pow||{}).reveal||0)+((c.pow||{}).time||0)+(c.freezes||0);
  return [
    // Streaks
    { g:'Streaks', id:'streak3', name:'3-Day Buzz', desc:'Practise 3 days in a row', ic:'flame', done:st(3) },
    { g:'Streaks', id:'streak7', name:'Week of Wings', desc:'A 7-day streak', ic:'flame', done:st(7) },
    { g:'Streaks', id:'streak14', name:'Fortnight Flyer', desc:'A 14-day streak', ic:'flame', done:st(14) },
    { g:'Streaks', id:'streak30', name:'Iron Wings', desc:'A 30-day streak', ic:'fire', done:st(30) },
    { g:'Streaks', id:'streak60', name:'Two-Month Torch', desc:'A 60-day streak', ic:'fire', done:st(60)||(c.streak||0)>=60 },
    { g:'Streaks', id:'streak100', name:'Century Flame', desc:'A 100-day streak', ic:'fire', done:(c.streak||0)>=100 },
    { g:'Streaks', id:'busyweek', name:'Busy Bee Week', desc:'100 words in one week', ic:'chart', done:wkWords>=100 },
    // Word mastery
    { g:'Word mastery', id:'mast10', name:'First Ten', desc:'Master 10 words', ic:'check', done:mast>=10 },
    { g:'Word mastery', id:'mast50', name:'Half Century', desc:'Master 50 words', ic:'check', done:mast>=50 },
    { g:'Word mastery', id:'mast100', name:'Word Hundredaire', desc:'Master 100 words', ic:'book', done:mast>=100 },
    { g:'Word mastery', id:'mast250', name:'Lexicon Builder', desc:'Master 250 words', ic:'book', done:mast>=250 },
    { g:'Word mastery', id:'mast500', name:'Word Wizard', desc:'Master 500 words', ic:'spark', done:mast>=500 },
    { g:'Word mastery', id:'mast1000', name:'Walking Dictionary', desc:'Master 1,000 words', ic:'crown', done:mast>=1000 },
    { g:'Word mastery', id:'acc90', name:'Sharp Speller', desc:'Keep accuracy at 90%+', ic:'target', done:(c.acc||0)>=90 },
    // Bee Band
    { g:'Bee Band', id:'placed', name:'On the Map', desc:'Finish your placement — find your Bee Band', ic:'search', done:!bb.calibrating },
    { g:'Bee Band', id:'band3', name:'Classroom Champ', desc:'Prove Bee Band 3', ic:'target', done:bb.band>=3 },
    { g:'Bee Band', id:'band5', name:'Regional Ready', desc:'Prove Bee Band 5', ic:'target', done:bb.band>=5 },
    { g:'Bee Band', id:'band7', name:'State & National', desc:'Prove Bee Band 7', ic:'target', done:bb.band>=7 },
    { g:'Bee Band', id:'band9', name:'Championship Band', desc:'Prove Bee Band 9', ic:'crown', done:bb.band>=9 },
    // Levels & evolution
    { g:'Levels', id:'hatched', name:'First Hatch', desc:'Reach Hatchling — your first evolution', ic:'sprout', done:listLevel(c,activeListKey())>=2 },
    { g:'Levels', id:'quest5', name:'Level 5 Climber', desc:'Reach Level 5 on any path', ic:'steps', done:jl>=5 },
    { g:'Levels', id:'quest10', name:'Level 10 Ace', desc:'Reach Level 10 on the Journey', ic:'steps', done:jl>=10 },
    { g:'Levels', id:'quest15', name:'Level 15 Star', desc:'Reach Level 15 on the Journey', ic:'steps', done:jl>=15 },
    { g:'Levels', id:'champ', name:'Bizzing Bee Champ', desc:'Clear all 20 Champ Levels', ic:'crown', done:isChampDone(c) },
    { g:'Levels', id:'karma100', name:'Karma Kindler', desc:'Earn 100 Karma', ic:'bolt', done:karma>=100 },
    { g:'Levels', id:'karma500', name:'Karma Keeper', desc:'Earn 500 Karma', ic:'bolt', done:karma>=500 },
    { g:'Levels', id:'karma2000', name:'Karma Legend', desc:'Earn 2,000 Karma', ic:'bolt', done:karma>=2000 },
    // Collection
    { g:'Collection', id:'coll10', name:'Starter Set', desc:'Own 10 avatars', ic:'spark', done:owned>=10 },
    { g:'Collection', id:'coll25', name:'Collector', desc:'Own 25 avatars', ic:'spark', done:owned>=25 },
    { g:'Collection', id:'coll50', name:'Curator', desc:'Own 50 avatars', ic:'spark', done:owned>=50 },
    { g:'Collection', id:'coll100', name:'Grand Curator', desc:'Own 100 avatars', ic:'crown', done:owned>=100 },
    { g:'Collection', id:'coll150', name:'Completionist', desc:'Own every avatar', ic:'crown', done:owned>=SB_AVATARS.list.length },
    { g:'Collection', id:'epic1', name:'Epic Find', desc:'Own an epic avatar', ic:'eye', done:epics>=1 },
    { g:'Collection', id:'leg1', name:'Legendary!', desc:'Own a legendary avatar', ic:'crown', done:legs>=1 },
    { g:'Collection', id:'leg5', name:'Hall of Legends', desc:'Own 5 legendary avatars', ic:'crown', done:legs>=5 },
    { g:'Collection', id:'stylist', name:'Stylist', desc:'Dress your bee in an accessory', ic:'palette', done:Object.keys(c.beeAcc||{}).length>=1 },
    { g:'Collection', id:'stocked', name:'Well Stocked', desc:'Hold 5 artifacts at once', ic:'cart', done:arts>=5 },
    // Spelling Quest
    { g:'Spelling Quest', id:'sq1', name:'First Season', desc:'Clear a Spelling Quest season', ic:'joystick', done:seasons>=1 },
    { g:'Spelling Quest', id:'sq5', name:'Story Seeker', desc:'Clear 5 seasons', ic:'joystick', done:seasons>=5 },
    { g:'Spelling Quest', id:'sq10', name:'Saga Speller', desc:'Clear 10 seasons', ic:'joystick', done:seasons>=10 },
    { g:'Spelling Quest', id:'sq15', name:'World Ender', desc:'Clear all 15 seasons', ic:'crown', done:seasons>=15 },
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
    { g:'Explorer', id:'coins250', name:'Honey Saver', desc:'Hold 250 coins at once', ic:'coin', done:(c.coins||0)>=250 },
    { g:'Explorer', id:'coins1000', name:'Honey Tycoon', desc:'Hold 1,000 coins at once', ic:'coin', done:(c.coins||0)>=1000 },
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
  ]; }
function viewCollection(){ const S=state; const c=active(); const tab=S.collTab||'badges';
  const tabBtn=(k,ic,l)=>`<button data-act="collTab" data-arg="${k}" style="flex:1;min-width:96px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${tab===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  let body='';
  if(tab==='avatars'){
    body=SB_AVATARS.packs.map(p=>{ const avs=SB_AVATARS.list.filter(a=>a.pack===p.id); const ownedN=avs.filter(a=>avOwned(c,a.id)).length;
      const tiles=avs.map(a=>{ const own=avOwned(c,a.id); const R=SB_AVATARS.rarities[a.rarity]; const on=c.avatar===a.id;
        const action= on?`<span style="font-weight:800;font-size:11.5px;color:var(--good)">Wearing ✓</span>`
          : own?`<span style="display:inline-flex;gap:6px"><button data-act="wearAv" data-arg="${a.id}" style="padding:6px 11px;border-radius:8px;background:var(--accent);color:#fff;font-weight:800;font-size:11.5px">Use</button>${a.rarity!=='free'?`<button data-act="sellAvatar" data-arg="${a.id}" title="Sell for ${a.sell} coins" style="padding:6px 9px;border-radius:8px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:11.5px;color:var(--muted)">Sell ${a.sell}🪙</button>`:''}</span>`
          : `<button data-act="openShopAvatars" title="Drops from a ${p.label} pack in the Store" style="display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:8px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:11.5px;color:var(--muted)">${iconSVG('lock',11,2.2)} Store pack</button>`;
        return `<div style="background:var(--paper,var(--bg2));border:1.5px solid ${on?'var(--accent)':own?'var(--line)':'var(--line)'};border-radius:14px;padding:11px 9px;display:flex;flex-direction:column;align-items:center;gap:6px;text-align:center;${own?'':'filter:grayscale(.75);opacity:.72'}">
          <span style="width:76px;height:76px">${avatarSVG(a.id,76)}</span>
          <span style="font-weight:800;font-size:12px;line-height:1.15">${a.name}</span>
          <span style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:2px 8px;border-radius:99px;color:#fff;background:${R.c}">${R.label}</span>
          ${action}</div>`; }).join('');
      return `<div class="sb-card" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px;flex-wrap:wrap"><span style="width:12px;height:12px;border-radius:4px;background:linear-gradient(135deg,${p.c1},${p.c2});display:inline-block"></span><span class="sb-ct" style="font-size:15px">${p.label}</span><span class="sb-cn">${ownedN}/${avs.length} collected</span>${ownedN<avs.length?`<button data-act="buyPack" data-arg="${p.id}" style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:999px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12px">🎁 Open pack · ${coinAmt(150,11)}</button>`:''}</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:9px">${tiles}</div></div>`; }).join('');
  } else if(tab==='worlds'){
    const rows=THEMES.map(t=>{ const on=t.id===S.theme; const un=isThemeUnlocked(t.id); const ev=EVO[t.id]||EVO.spellbound;
      return `<div style="display:flex;align-items:center;gap:12px;background:var(--paper,var(--bg2));border:1.5px solid ${on?'var(--accent)':'var(--line)'};border-radius:14px;padding:12px 14px;${un?'':'filter:grayscale(.6);opacity:.65'}">
        <div style="width:44px;height:44px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,${t.c1},${t.c2});flex-shrink:0;color:#fff">${un?worldEmblemSVG(t.id,24):iconSVG('lock',20,2.2)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${t.label}</div><div style="font-size:12px;color:var(--muted)">${WORLD_DEF[t.id]||(ev[0]+' → '+ev[9])}</div></div>
        ${on?'<span style="font-weight:800;font-size:12px;color:var(--accent)">Active ✓</span>':(un?`<button data-act="pickTheme" data-arg="${t.id}" style="padding:8px 14px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:12px">Use</button>`:`<button data-act="openShop" style="display:inline-flex;align-items:center;gap:5px;padding:8px 12px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--muted)">${iconSVG('lock',11,2.2)} Store</button>`)}
      </div>`; }).join('');
    const unc=THEMES.filter(t=>isThemeUnlocked(t.id)).length;
    body=`<div class="sb-card"><div style="display:flex;align-items:baseline;gap:9px;margin-bottom:12px"><span class="sb-ct" style="font-size:15px">Worlds</span><span class="sb-cn">${unc}/${THEMES.length} unlocked — switch any time</span></div><div style="display:grid;gap:9px">${rows}</div></div>`;
  } else if(tab==='artifacts'){
    const inv=[
      {k:'shield', ic:'crown', name:'Boss Shield 🛡️', desc:'Absorbs one wrong answer in Boss Battle.', own:((c.pow||{}).shield||0)},
      {k:'reveal', ic:'bulb',  name:'Letter Reveal 💡', desc:'Reveals the next letter in Boss Battle.', own:((c.pow||{}).reveal||0)},
      {k:'time',   ic:'timer', name:'Time Warp ⏱️', desc:'+15 seconds on your next Buzzer sprint.', own:((c.pow||{}).time||0)},
      {k:'freeze', ic:'flame', name:'Streak Freeze 🧊', desc:'Miss a day — your streak survives.', own:(c.freezes||0)},
    ].map(it=>`<div style="display:flex;align-items:center;gap:12px;background:var(--paper,var(--bg2));border:1.5px solid ${it.own?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:12px 14px;${it.own?'':'opacity:.6;filter:grayscale(.5)'}">
        <div style="width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--chip);color:var(--accent);flex-shrink:0">${iconSVG(it.ic,20)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${it.name}</div><div style="font-size:12px;color:var(--muted)">${it.desc}</div></div>
        <span style="font-weight:900;font-size:14px;color:${it.own?'var(--good)':'var(--muted)'}">× ${it.own}</span></div>`).join('');
    const accOwned=Object.keys(c.beeAcc||{});
    const accs=accOwned.length?`<div style="font-family:var(--display);font-weight:800;font-size:15px;margin:16px 2px 10px">Bee style</div><div style="display:flex;gap:10px;flex-wrap:wrap">${accOwned.map(k=>`<div style="width:64px;height:70px;position:relative;background:var(--surface2);border-radius:14px;padding:8px;${c.accOn===k?'box-shadow:inset 0 0 0 2px var(--accent)':''}">${mascotSVG('happy')}<div style="position:absolute;inset:8px">${beeAccSVG(k)}</div></div>`).join('')}</div>`:'';
    body=`<div class="sb-card"><div style="display:flex;align-items:baseline;gap:9px;margin-bottom:12px"><span class="sb-ct" style="font-size:15px">Artifacts</span><span class="sb-cn">your stash — stock up in the Store</span></div>${inv}${accs}
      <button data-act="openShop" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:14px">Get more in the Store →</button></div>`;
  } else {
    const B=badgeDefs(); const won=B.filter(b=>b.done).length;
    const groups=[...new Set(B.map(b=>b.g))];
    body=groups.map(g=>{ const list=B.filter(b=>b.g===g); const w=list.filter(b=>b.done).length;
      return `<div class="sb-card" style="margin-bottom:14px"><div style="display:flex;align-items:baseline;gap:9px;margin-bottom:12px"><span class="sb-ct" style="font-size:15px">${g}</span><span class="sb-cn">${w}/${list.length} won</span></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px">${list.map(b=>`<div style="background:var(--paper,var(--bg2));border:1.5px solid ${b.done?'var(--treasure,#F0B429)':'var(--line)'};border-radius:14px;padding:13px 10px;display:flex;flex-direction:column;align-items:center;gap:7px;text-align:center;${b.done?'':'opacity:.55;filter:grayscale(.6)'}">
        <span style="width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:${b.done?'linear-gradient(135deg,#FFD24D,#F0A93C)':'var(--surface2)'};color:${b.done?'#5a3d00':'var(--muted)'};box-shadow:${b.done?'0 2px 8px rgba(240,180,41,.4)':'none'}">${iconSVG(b.ic,22)}</span>
        <span style="font-weight:800;font-size:12.5px;line-height:1.15">${b.name}</span>
        <span class="sb-cn" style="font-size:11px">${b.desc}</span>
        <span style="font-weight:800;font-size:10.5px;color:${b.done?'var(--good)':'var(--muted)'}">${b.done?'WON ✓':'LOCKED'}</span></div>`).join('')}</div></div>`; }).join('')
      + `<div class="sb-cn" style="margin:4px 2px 0">${won}/${B.length} badges won — earned by playing, never bought.</div>`;
  }
  const bAll=badgeDefs();
  return `<div style="max-width:920px;margin:0 auto">
    ${pageHead('My Collection', avOwnedCount(c)+'/'+SB_AVATARS.list.length+' avatars', 'Everything you\'ve earned and unlocked — badges, avatars, worlds and artifacts.',
      `<span style="display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px">${coinAmt(c.coins||0,14)}</span>`)}
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">${tabBtn('badges','crown','Badges · '+bAll.filter(b=>b.done).length+'/'+bAll.length)}${tabBtn('avatars','spark','Avatars · '+avOwnedCount(c)+'/'+SB_AVATARS.list.length)}${tabBtn('worlds','palette','Worlds · '+THEMES.filter(t=>isThemeUnlocked(t.id)).length+'/'+THEMES.length)}${tabBtn('artifacts','bolt','Artifacts')}</div>
    ${body}
  </div>`; }
/* ---- Evolution ladder as its own screen (Home shows only the compact card) ---- */
function viewEvolution(){ const S=state; const c=active(); ensureLists(c); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound;
  const aKey=activeListKey(); const aLevel=listLevel(c,aKey); const fIdx=formIdx(heroLevel(c));
  const lp=getList(c,aKey); const totalXp=lp.xp||0;
  // Karma needed to REACH each rung (stage i needs level 2i+1 → sum of the first 2i level costs)
  const stageXp=(i)=>{ let t=0; for(let l=1;l<=i*2;l++) t+=xpToNext(l); return t; };
  const rungMarks=Array.from({length:10},(_,i)=>i===0?'start':fmtN(stageXp(i))+' Karma');
  const xpToForm=Math.max(0, stageXp(Math.min(9,fIdx+1))-totalXp);
  return `<div style="max-width:900px;margin:0 auto">
    <button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px;margin-bottom:8px">← Home</button>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:26px;margin:0 0 4px">Your evolution</h2><span style="font-size:13px;color:var(--muted);font-weight:650">how your bee grows</span></div>
    <p style="margin:0 0 16px;font-size:14px;color:var(--muted);line-height:1.5">Every word you practise feeds your bee. Evolution measures <b style="color:var(--text)">effort</b> — it always climbs and never falls. (What you're <i>ready</i> to spell is your Bee Band — that lives on Progress.)</p>
    <div class="sb-card" style="margin-bottom:14px">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:6px;flex-wrap:wrap">
        <div style="font-family:var(--display);font-weight:800;font-size:17px">You're ${evo[fIdx]}</div>
        <div style="font-size:12px;color:var(--muted);font-weight:600">${fIdx>=9?'Top form reached! 🎉':(fmtN(xpToForm)+' Karma of practice to '+evo[fIdx+1])}</div>
      </div>
      <div style="overflow-x:auto;padding:4px 0 2px"><div style="min-width:760px">${evoLadderHTML(theme,fIdx,rungMarks)}</div></div>
      <div class="sb-cn" style="margin-top:6px">You have <b style="color:var(--text)">${fmtN(totalXp)} Karma</b> in ${esc(listLabel(aKey).split(' · ')[0])} — each rung shows the total Karma that unlocks it.</div>
    </div>
    <div class="sb-card" style="margin-bottom:14px">
      <div class="sb-ct" style="font-size:15px;margin-bottom:6px">How Karma works</div>
      <div class="sb-cs" style="line-height:1.6">One word spelled right = <b style="color:var(--text)">1 Karma</b> — in Word Coach, the Arcade, Concepts, anywhere. Karma is your practice record: it only grows and is never spent.<br>Coins 🪙 are different — they're treasure you win and <i>spend</i> in the Store on worlds, avatars and power-ups. Spending coins never touches your Karma or your evolution.</div>
    </div>
    ${(theme==='spellbound')?`<div class="sb-card" style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="font-size:26px;flex-shrink:0">👑</span><span class="sb-cs"><b style="color:var(--text)">Why a Queen at the top?</b> Every hive is ruled by its Queen — the strongest, most protected bee alive. Reaching her means you outgrew every other bee in the hive.</span></div>`:''}
    ${beeEmpty('happy','Ten forms, one bee. Practise anywhere — Word Coach, the Arcade, Concepts — and the Karma all feeds the same evolution.')}
  </div>`;
}

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
function celebratePattern(emoji,kind,name,reward){ addCoins(reward); try{ sfx('win'); burstConfetti(150); }catch(e){} state.toast=emoji+' '+kind+' complete — '+name+'! +'+reward+' '+'🪙'; scheduleToast(3200); }
function checkPatternDone(key){
  for(const ch of (state.conceptData||[])){ if(justCrossed(ch.words,key)){ celebratePattern('🧩','Concept',conceptShort(ch.title),20); return; } }
  for(const L of lessonsAll()){ if(justCrossed(L.words,key)){ celebratePattern('🗺️','Lesson',L.title,15); return; } } }
function markMastered(key){ if(!key||state.luMastered[key]) return; state.luMastered={...state.luMastered,[key]:true}; checkPatternDone(key); }
function conceptTierList(t){ return (state.conceptData||[]).filter(c=>(c.difficulty||'medium')===t); }
function currentTier(){ const order=['easy','medium','hard']; for(const t of order){ const list=conceptTierList(t); if(list.length && !list.every(c=>conceptStat(c).done)) return t; } return 'hard'; }
/* ---- generated concept covers: theme-independent family palette + texture (design handoff) ---- */
const CONCEPT_FAM = {
  Basics:{c:'#F0A81C',c2:'#D68A08',tex:'dots'},
  Prefixes:{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes'},
  Suffixes:{c:'#FF5FA2',c2:'#E8458C',tex:'dots'},
  Roots:{c:'#13A892',c2:'#0E8A78',tex:'rings'},
  Loanwords:{c:'#E0922E',c2:'#C8791B',tex:'diag'},
  Rules:{c:'#3D7DF0',c2:'#2A63D6',tex:'grid'},
  Subjects:{c:'#4F9E6A',c2:'#3C8455',tex:'dots'},
  Themes:{c:'#F0703C',c2:'#D85A29',tex:'rings'},
  Advanced:{c:'#7B52E0',c2:'#5E39C4',tex:'cross'} };
const CONCEPT_FAM_ORDER = ['Basics','Prefixes','Suffixes','Roots','Loanwords','Rules','Subjects','Themes','Advanced'];
const CONCEPT_TEX = {
  stripes:['repeating-linear-gradient(45deg,rgba(255,255,255,.13) 0 2px,transparent 2px 11px)','auto'],
  dots:['radial-gradient(rgba(255,255,255,.22) 1.5px,transparent 1.6px)','13px 13px'],
  grid:['linear-gradient(rgba(255,255,255,.14) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.14) 1px,transparent 1px)','15px 15px,15px 15px'],
  diag:['repeating-linear-gradient(-45deg,rgba(255,255,255,.14) 0 3px,transparent 3px 13px)','auto'],
  rings:['radial-gradient(circle at 80% 18%,rgba(255,255,255,.20) 0 16%,transparent 17%),radial-gradient(circle at 14% 96%,rgba(255,255,255,.13) 0 20%,transparent 21%)','auto,auto'],
  cross:['repeating-linear-gradient(0deg,rgba(255,255,255,.12) 0 1px,transparent 1px 14px),repeating-linear-gradient(90deg,rgba(255,255,255,.12) 0 1px,transparent 1px 14px)','auto,auto'] };
function conceptFam(ch){ return CONCEPT_FAM[catGroup(ch.category)]||CONCEPT_FAM.Advanced; }
function conceptCoverBG(ch){ const f=conceptFam(ch); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
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
const heroFont = (s) => { const n=(s||'').length; return n<=3?42:n<=5?34:n<=7?28:n<=10?23:18; };
function conceptCardHTML(ch, allChs){
  const ci=allChs.indexOf(ch); const st=conceptStat(ch); const locked=!isConceptUnlocked(ci);
  const fam=catGroup(ch.category); const f=conceptFam(ch); const dc=(diffMap[ch.difficulty]||diffMap.medium)[1];
  const {hero,kind}=conceptHero(ch); const main=hero[0]||conceptShort(ch.title); const rest=hero.slice(1);
  const nWords=conceptWordsOf(ch).length;
  const titleClean=conceptShort(ch.title).replace(/\s*\([^)]*\)\s*$/,'').trim();
  const paren=(String(ch.title).match(/\(([^)]*)\)/)||[])[1];
  const meaning=(paren||conceptRoots(ch.title)||'').trim();
  const mainStyle=`font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-size:${heroFont(main)}px;font-weight:${kind==='word'?700:800};${kind==='word'?'font-style:italic;':''}`;
  const cover=`<div style="position:relative;height:116px;display:flex;align-items:center;justify-content:center;padding:14px;${conceptCoverBG(ch)}">
    <span style="position:absolute;top:11px;left:12px;font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(fam)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${st.done?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div class="sb-theme-art" style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16);animation-delay:${(ci%9)*0.22}s${locked?';opacity:.92':''}">
      ${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',42,2)}</div>`:`<div style="${mainStyle}">${esc(main)}</div>`}
      ${(!locked&&rest.length)?`<div style="font-family:var(--mono);font-weight:700;font-size:13px;color:rgba(255,255,255,.85);margin-top:6px;letter-spacing:.04em">${rest.map(esc).join('&nbsp;&nbsp;&nbsp;')}</div>`:''}
    </div>
  </div>`;
  const footL = locked
    ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;font-size:12px;font-weight:900;color:#a06a00;background:linear-gradient(135deg,#FFE08A,#F0B85C)">${iconSVG('lock',11,2.2)} ${coinAmt(COST.concept,11)}</span>`
    : `<span style="padding:3px 9px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${(diffMap[ch.difficulty]||diffMap.medium)[0]}</span>`;
  const footR=`<span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${locked?'Unlock':(nWords+' words')} →</span>`;
  const prog=(!locked && !st.done && st.m>0)?`<div style="font-family:var(--mono);font-size:12px;color:${f.c};font-weight:700;margin-top:7px">${st.m}/${st.total} mastered</div>`:'';
  return `<button class="sb-cover-card" data-act="${locked?'buyConcept':'openConcept'}" data-arg="${ci}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column;${locked?'opacity:.97':''}">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.15;color:var(--text)">${esc(titleClean)}</div>
      ${meaning?`<div style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c};margin-top:3px">${esc(trunc(meaning,42))}</div>`:''}
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(ch.concept,96)}</div>
      ${prog}
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">${footL}${footR}</div>
    </div>
  </button>`;
}
function conceptBigCard(ch, allChs){
  const ci=allChs.indexOf(ch); const st=conceptStat(ch); const locked=!isConceptUnlocked(ci);
  const tag=locked?`<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:900;color:#a06a00;background:linear-gradient(135deg,#FFE08A,#F0B85C)">${iconSVG('lock',12,2.2)} Locked</span>`:`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:999px;font-size:12px;font-weight:800;background:${st.bg};color:${st.fg}">${st.done?'✓ Mastered':(st.label+(st.total?(' · '+st.m+'/'+st.total):''))}</span>`;
  const cta=locked?`<button data-act="buyConcept" data-arg="${ci}" style="padding:12px 20px;border-radius:14px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14)">🔓 Unlock · ${coinAmt(COST.concept,12)}</button>`:`<button data-act="openConcept" data-arg="${ci}" style="padding:12px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Open &amp; study · ${st.total} words →</button>`;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow)">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><span style="font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(catGroup(ch.category))}</span><span style="${diffStyleFor(ch.difficulty)}">${(diffMap[ch.difficulty]||diffMap.medium)[0]}</span></div>
    <div style="font-family:var(--display);font-weight:800;font-size:clamp(22px,4.5vw,28px);line-height:1.12;margin-bottom:4px;display:flex;align-items:center;gap:9px">${locked?`<span style="color:var(--muted);display:inline-flex">${iconSVG('lock',22,2.2)}</span>`:''}${esc(conceptShort(ch.title))}</div>
    <div style="font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:700;margin-bottom:13px">${esc(conceptRoots(ch.title))}</div>
    <div style="font-size:15px;color:var(--text);line-height:1.6;margin-bottom:18px">${locked?'This concept is locked. Unlock it with coins to reveal its pattern, worked examples and word list.':esc(ch.concept||'')}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">${tag}${cta}</div>
  </div>`;
}
function famCoverBG(fam){ const f=CONCEPT_FAM[fam]||CONCEPT_FAM.Advanced; const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
// Group the concepts into manageable CHAPTERS (ordered by family, then difficulty; 121 → 11 chapters).
function conceptChapters(){ const chs=state.conceptData||[]; if(state._cchap && state._cchap._n===chs.length) return state._cchap||[];
  const dr={easy:0,medium:1,hard:2};
  const ord=chs.map((c,i)=>({c,i})).sort((a,b)=>{ const fa=CONCEPT_FAM_ORDER.indexOf(catGroup(a.c.category)), fb=CONCEPT_FAM_ORDER.indexOf(catGroup(b.c.category)); if(fa!==fb) return (fa<0?9:fa)-(fb<0?9:fb); const da=dr[a.c.difficulty]??1, db=dr[b.c.difficulty]??1; if(da!==db) return da-db; return a.i-b.i; });
  const N=ord.length>110?11:10; const per=Math.ceil(ord.length/N)||1; const out=[];
  for(let k=0;k<N;k++){ const slice=ord.slice(k*per,(k+1)*per); if(!slice.length) continue;
    const counts={}; slice.forEach(o=>{ const g=catGroup(o.c.category); counts[g]=(counts[g]||0)+1; }); const dom=Object.keys(counts).sort((x,y)=>counts[y]-counts[x])[0]||'Patterns';
    out.push({ n:out.length+1, name:dom, items:slice.map(o=>o.c) }); }
  out._n=chs.length; state._cchap=out; return out; }
function conceptChapterStat(chap){ const done=chap.items.filter(c=>conceptStat(c).done).length; return { done, total:chap.items.length, complete:done>=chap.items.length }; }
function chapterCoverCard(chap){ const f=CONCEPT_FAM[chap.name]||CONCEPT_FAM.Advanced; const st=conceptChapterStat(chap); const pct=st.total?Math.round(st.done/st.total*100):0;
  return `<button class="sb-cover-card" data-act="openConceptChapter" data-arg="${chap.n-1}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:94px;display:flex;align-items:center;justify-content:center;padding:12px 14px;${famCoverBG(chap.name)}">
      <span style="position:absolute;top:9px;left:11px;font-family:var(--mono);font-weight:700;font-size:11px;letter-spacing:.09em;text-transform:uppercase;padding:3px 8px;border-radius:6px;background:rgba(0,0,0,.28);color:#fff">Ch ${chap.n}</span>
      <span style="font-family:var(--display);font-weight:800;font-size:24px;color:#fff;text-shadow:0 2px 8px rgba(0,0,0,.3);text-align:center;line-height:1.05">${esc(chap.name)}</span>
      ${st.complete?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    </div>
    <div style="padding:13px 15px 14px;display:flex;flex-direction:column;flex:1">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:8px"><span class="sb-ct" style="font-size:15px">Chapter ${chap.n}</span><span style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c}">${st.total} concepts</span></div>
      <div style="margin-top:auto;padding-top:13px;display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${st.complete?'var(--good)':f.c};width:${pct}%;transition:width .4s"></div></div><span style="font-size:12px;color:var(--muted);font-weight:800;white-space:nowrap">${st.done}/${st.total}</span></div>
    </div>
  </button>`; }
// Shared page header — back link + display title + optional mono meta + muted subtitle.
// Keeps every top-level view's header identical (the Concepts/Journeys reference treatment).
function pageHead(title, meta, sub, right){
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0">${title}</h2>${meta?`<span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${meta}</span>`:''}</div>
      ${right?`<div style="display:flex;gap:8px;flex-wrap:wrap">${right}</div>`:''}
    </div>
    ${sub?`<p style="margin:0 0 14px;color:var(--muted);font-size:13px;max-width:52em">${sub}</p>`:''}`;
}
function viewConceptList(){
  const S=state; const allChs=S.conceptData||[]; const loading=S.conceptLoading&&!S.conceptData;
  const chapters=allChs.length?conceptChapters():[]; const chaptersDone=chapters.filter(c=>conceptChapterStat(c).complete).length;
  const masteredCount=allChs.filter(c=>conceptStat(c).done).length; const pct=allChs.length?Math.round(masteredCount/allChs.length*100):0;
  const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
  const q=(S.conceptQuery||'').trim().toLowerCase();
  const search=`<input data-inp="onConceptSearch" data-fkey="conceptSearch" value="${escA(S.conceptQuery)}" placeholder="Search any pattern, root or word…" style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:11px 15px;font-size:13px;color:var(--text);margin-bottom:14px">`;
  let mainContent='', headDesc='', backRow='';
  if(!loading){
    if(q){ const list=allChs.filter(ch=>(ch.title+' '+ch.category+' '+(ch.concept||'')).toLowerCase().includes(q));
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      mainContent=`<div style="font-size:12px;color:var(--muted);font-weight:700;margin:0 2px 12px">${list.length} match${list.length===1?'':'es'} for “${esc(S.conceptQuery.trim())}”</div>`+(list.length?`<div style="${gridStyle}">${list.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`:'<div style="padding:44px 0;text-align:center;color:var(--muted);font-weight:700">No matches.</div>');
    } else if(S.conceptChapter!=null && chapters[S.conceptChapter]){ const chap=chapters[S.conceptChapter]; const st=conceptChapterStat(chap);
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      backRow=`<button data-act="conceptChaptersBack" style="display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:700;font-size:13px;margin-bottom:12px">← All chapters</button>`;
      mainContent=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;color:#fff;font-family:var(--display);font-weight:800;font-size:20px;${famCoverBG(chap.name)}">${chap.n}</span><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.1">Chapter ${chap.n} · ${esc(chap.name)}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${st.done}/${st.total} concepts done</div></div></div><div style="${gridStyle}">${chap.items.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`;
    } else { headDesc='Ten short chapters — pick one and master the spelling patterns inside. A concept is yours once you nail 70% of its words.';
      mainContent=`<div style="${gridStyle}">${chapters.map(chapterCoverCard).join('')}</div>`; }
  }
  return `<div style="animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button></div>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0">Concepts</h2><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${conceptChapters().length||11} chapters</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13px;max-width:52em">${headDesc}</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('grid',15)} ${chaptersDone}/${conceptChapters().length||11} chapters</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .4s"></div></div>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${pct}%</span>
    </div>
    ${backRow}${search}
    ${loading?'<div style="padding:60px 0;text-align:center;color:var(--muted);font-weight:700">Loading chapters…</div>':''}
    ${mainContent}
  </div>`;
}

/* ===== Concept animations — generated CSS/SVG "explainers", one per concept (no video files) ===== */
let _animTimer=null; let _vAudio=null;
function clearAnimTimer(){ if(_animTimer){ clearTimeout(_animTimer); _animTimer=null; } }
function canSpeak(){ try{ return !!window.speechSynthesis; }catch(e){ return false; } }
function stopClip(){ try{ if(_vAudio){ _vAudio.onended=null; _vAudio.onerror=null; _vAudio.pause(); _vAudio.src=''; _vAudio=null; } }catch(e){} }
function stopNarration(){ try{ window.speechSynthesis.cancel(); }catch(e){} stopClip(); }
// Pre-rendered AI-voice clip for a concept scene (embedded, fully offline). Falls back to Web Speech if absent.
function voiceClip(ch,i){ try{ const V=window.SB_VOICE; if(!V||!V.dur) return null; const ci=(state.conceptData||[]).indexOf(ch); if(ci<0) return null; const arr=V.dur[ci]; if(!arr||i>=arr.length) return null; return { url:(V.base||'voice/')+'c'+ci+'-'+i+'.mp3', ms:Math.round(((arr[i]||2)+0.25)*1000) }; }catch(e){ return null; } }
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
  else { _animTimer=setTimeout(advance, an.scenes[i].dur||2300); } }
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
  try{ const ci=(state.conceptData||[]).indexOf(ch); const auth=window.SB_CSCRIPT&&window.SB_CSCRIPT[ci];
    if(auth&&auth.scenes&&auth.scenes.length){ const scenes=auth.scenes.map(s=>({stage:s.show,cap:s.cap,say:s.say,mood:s.mood||'happy',dur:s.dur||3000}));
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
  if(s.t==='glyph') return `<div style="text-align:center">${aRow(aTiles(s.text,'affix','ca-pop'))}${s.sub?`<div style="margin-top:13px;font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:700;letter-spacing:.02em">${esc(s.sub)}</div>`:''}</div>`;
  if(s.t==='word') return aGlow(aRow(wTiles(s.word,s.hi,s.dim)));
  if(s.t==='list') return `<div style="display:flex;flex-direction:column;gap:9px;align-items:center">${s.items.map(it=>aRow(wTiles(it.word,it.hi,it.dim,true),4)).join('')}</div>`;
  if(s.t==='build'){ const root=s.root||'',aff=s.affix||''; return s.side==='pre'?aRow(aTiles(aff,'affix','ca-sl')+aTiles(root,'root')):aRow(aTiles(root,'root')+aTiles(aff,'affix','ca-sr')); }
  if(s.t==='breakdown'){ const word=s.word||''; const parts=s.parts||[];
    const top=aGlow(aRow(wTiles(word,s.hi,false),4));
    const chips=parts.map((pp,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:var(--surface2);font-family:var(--mono);font-size:12px;font-weight:700;animation:ca-up .45s ease ${(i*0.12).toFixed(2)}s both"><b style="color:var(--accent)">${esc(pp.txt)}</b><span style="color:var(--muted)">${pp.gloss?('= '+esc(pp.gloss)):''}</span></span>`).join('');
    return `<div style="display:flex;flex-direction:column;gap:12px;align-items:center">${top}${parts.length?`<div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center">${chips}</div>`:''}</div>`; }
  return ''; }
function conceptAnimStage(an,sc){ const scn=an.scenes[Math.min(Math.max(sc,0),an.scenes.length-1)]; return renderStage(scn&&scn.stage); }
function conceptPlayer(){ const ch=state.conceptSel; if(!ch) return ''; const an=conceptAnim(ch); const N=an.scenes.length; const sc=Math.min(Math.max(state.animScene||0,0),N-1); const playing=state.animOn;
  const voiceOn=state.sound!==false;
  return `<div style="background:var(--bg2);border:1px solid var(--accent);border-radius:20px;overflow:hidden;box-shadow:var(--glow)">
    <div style="display:flex;align-items:center;gap:8px;padding:11px 16px;border-bottom:1px solid var(--line)"><span style="display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:800;font-size:13px;color:var(--accent)">${iconSVG('spark',15)} Animated explainer</span><span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('volume',12)} ${voiceOn?(hasVoicePack(ch)?'Narrated':'Voice on'):'Voice off'}</span><span style="margin-left:auto;font-family:var(--mono);font-size:12px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${esc(an.label)}</span></div>
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
      <div style="display:flex;align-items:center;gap:8px;margin-top:9px"><button data-act="conceptReplay" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('volume',14)} ${playing?'Replay':'Watch & listen'}</button><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">Scene ${sc+1}/${N}</span></div>
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
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><button data-act="conceptBack" style="color:var(--muted);font-weight:700;font-size:13px">← All concepts</button></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(csel.category)}</span><span style="${diffStyleFor(csel.difficulty)}">${(diffMap[csel.difficulty]||diffMap.medium)[0]}</span></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;line-height:1.1;margin:0 0 4px">${esc(conceptShort(csel.title))}</h2>
    <div style="font-family:var(--mono);font-size:13px;color:var(--accent);font-weight:700;margin-bottom:16px">${esc(conceptRoots(csel.title))}</div>
    <p style="font-size:15px;line-height:1.55;color:var(--muted);margin:0 0 18px">${esc(csel.concept||'')}</p>
    <div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${total}${step.kind==='anim'?' · Watch':''}</span><div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round((idx+1)/total*100)}%;transition:width .3s"></div></div></div>
      <div style="display:flex;gap:6px;margin-bottom:14px">${dots}</div>
      ${stepNav}
      ${stepContent}
    </div>
    <button data-act="conceptWordsToggle" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:15px 18px;font-family:var(--display);font-weight:800;font-size:15px;color:var(--text);margin-bottom:12px"><span>${(S.conceptWordsOpen?'Hide word study':'Study the words one by one')+' · '+cw.length}</span><span style="color:var(--accent)">${S.conceptWordsOpen?'▲':'▼'}</span></button>
    ${S.conceptWordsOpen?`<div style="margin-bottom:22px;animation:sb-rise .3s ease both">${wordFlash(cw.map(x=>({w:x.w,d:x.def||'',s:x.ex||'',p:x.say||'',o:''})), S.conceptWordIdx, 'conceptWordNav', {})}</div>`:''}
    <button data-act="practiseConcept" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-top:12px">Practise these words →</button>
  </div>`;
}

// After an answer is checked, glide to the next word automatically so one Enter is enough.
// (Enter still works to skip the wait; navigating away cancels it.)
function autoAdvance(ms){ try{ clearTimeout(state._advTimer); }catch(e){}
  state._advTimer=setTimeout(()=>{ if(state.status && state.status!=='idle' && (state.nav==='train'||state.nav==='coach')){ try{ app.next(); }catch(e){} } }, ms||900); }
function sessionResults(){
  const S=state; const ok=S.sessionCorrect||[]; const bad=S.sessionWrong||[]; const total=ok.length+bad.length;
  const pct=total?Math.round(ok.length/total*100):0;
  const chip=(w,good)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${good?'color-mix(in srgb,var(--good) 15%,transparent)':'color-mix(in srgb,var(--bad) 14%,transparent)'};font-family:var(--display);font-weight:800;font-size:13px;color:${good?'var(--good)':'var(--bad)'}"><button data-act="say" data-arg="${escA(w.w)}" title="Hear it" style="display:inline-flex;color:inherit;opacity:.8">${iconSVG('volume',13)}</button>${esc(w.w)}</span>`;
  const col=(title,arr,good)=>`<div style="flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="width:26px;height:26px;border-radius:6px;display:grid;place-items:center;background:${good?'color-mix(in srgb,var(--good) 20%,transparent)':'color-mix(in srgb,var(--bad) 18%,transparent)'};color:${good?'var(--good)':'var(--bad)'}">${iconSVG(good?'check':'close',15)}</span><span style="font-family:var(--display);font-weight:800;font-size:15px">${title} · ${arr.length}</span></div>
      ${arr.length?`<div style="display:flex;flex-wrap:wrap;gap:7px">${arr.map(w=>chip(w,good)).join('')}</div>`:`<div style="font-size:13px;color:var(--muted)">${good?'None yet.':'None — perfect! 🎉'}</div>`}
    </div>`;
  const mood = pct>=80?'love':pct>=50?'happy':'think';   // encouraging, never sad
  // If this session was for a levelled list and its level is now complete, offer to advance.
  const c=active(); const lk=(S.sessionListKey&&S.sessionListKey[0]!=='_')?S.sessionListKey:activeListKey(); let advBtn='';
  try{ const stages=listStages(lk); const li=listStageIdx(c,lk); const st=stages[li];
    if(st&&st.words.length){ const lm=st.words.filter(w=>state.luMastered[nkey(w.w)]).length;
      if(lm>=st.words.length && li<stages.length-1){
        advBtn=`<button data-act="advanceStage" data-arg="${escA(lk)}" style="flex:1;min-width:100%;padding:15px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${iconSVG('check',16)} Level ${li+1} cleared — go to Level ${li+2} →</button>`;
      } else if(lm<st.words.length){
        advBtn=`<div style="flex:1;min-width:100%;display:flex;align-items:center;gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px 16px;text-align:left">
          <span style="color:var(--accent);flex-shrink:0">${iconSVG('steps',18)}</span>
          <span style="min-width:0;flex:1;font-size:13px;font-weight:650;color:var(--muted)"><b style="color:var(--ink,var(--text))">Level ${li+1} progress: ${lm}/${st.words.length} words mastered</b> — ${st.words.length-lm} to go. Your next session serves exactly those words; master them all (or pass the ⚡ Challenge) to unlock Level ${li+2}.</span>
          <div style="flex-shrink:0;width:90px;height:7px;border-radius:999px;background:var(--tint-deep,var(--surface2));overflow:hidden"><div style="height:100%;background:var(--good);width:${Math.round(lm/st.words.length*100)}%"></div></div>
        </div>
        ${(()=>{ const miss=st.words.filter(w=>!state.luMastered[nkey(w.w)]);
          return `<div style="flex:1;min-width:100%;display:flex;align-items:center;gap:7px;flex-wrap:wrap;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:11px 16px;text-align:left"><span style="font-size:13px;font-weight:800;flex-shrink:0">Still to master · ${miss.length}:</span>${miss.slice(0,14).map(w=>`<button data-act="say" data-arg="${escA(w.w)}" title="Tap to hear" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;background:var(--paper,var(--bg2));border:1px solid var(--line)">${esc(w.w)}</button>`).join('')}${miss.length>14?`<span class="sb-cn">+${miss.length-14} more</span>`:''}</div>`; })()}`;
      } } }catch(e){}
  return `<div style="max-width:720px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="text-align:center;margin-bottom:18px"><div style="width:78px;height:86px;margin:0 auto 8px">${mascotSVG(mood)}</div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Test complete!</h2>
      <div style="font-size:15px;color:var(--muted);font-weight:700">${esc((S.sessionLabel||'Practice').split(' · ')[0])} — you spelled <b style="color:var(--good)">${ok.length}</b> of <b style="color:var(--text)">${total}</b> right (${pct}%)</div></div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px">${col('Spelled correctly',ok,true)}${col('Misspelt',bad,false)}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${advBtn}
      ${bad.length?`<button data-act="drillMisspelt" style="flex:1;min-width:200px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Spell the ${bad.length} misspelt word${bad.length>1?'s':''} →</button>`:''}
      <button data-act="restartSession" style="flex:1;min-width:160px;padding:14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">${iconSVG('arrow',16)} Restart the list</button>
      <button data-act="exitTrain" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:15px">Done</button>
    </div>
  </div>`;
}
function trainerCard(){
  if(state.sessionOver) return sessionResults();
  const S=state; const word=curWord(); const st=S.status;
  let resultText='',resultStyle=''; const primaryLabel=(st==='idle')?'Check':'Next word →'; const showResult=(st!=='idle');
  const rbase='border-radius:14px;padding:13px 16px;font-weight:800;font-size:15px;margin-bottom:16px;animation:sb-pop .3s ease both;';
  if(st==='correct'){ resultText='✓ Correct! Nicely spelled.'; resultStyle=rbase+'background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)'; }
  else if(st==='wrong'){ resultText='✗ Not quite — it’s "'+word.w+'". Try the next one.'; resultStyle=rbase+'background:color-mix(in srgb,var(--bad) 16%,transparent);color:var(--bad)'; }
  else if(st==='revealed'){ resultText='The word is "'+word.w+'".'; resultStyle=rbase+'background:var(--surface2);color:var(--text)'; }
  const hints=[];
  if(S.showDef){ hints.push('<b>Definition</b> — '+blankHTML(word.d,word.w)+'.'); if(word.h) hints.push('<span style="display:inline-flex;align-items:center;gap:5px;color:var(--accent)">'+iconSVG('bulb',14)+'</span> '+blankHTML(word.h,word.w)); }
  if(S.showSent) hints.push('<b>Sentence</b> — '+blankHTML(word.s,word.w));
  if(S.showOrigin) hints.push('<b>Origin</b> — '+esc(word.o||'—')+(word.r?('. '+esc(word.r)):'')+'.');
  const tchip=(on,label,act)=>`<button data-act="${act}" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid ${on?'var(--accent)':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:transparent;color:var(--text)'}">${label}</button>`;
  const mascotAnim=st==='wrong'?'animation:sb-shake .45s ease':(st==='correct'?'animation:sb-pop .4s ease':'');
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center;position:relative">
      <div style="width:96px;height:108px;margin:0 auto 4px"><div style="${mascotAnim};width:96px;height:108px">${mascotSVG(S.mood)}</div></div>
      <button data-act="speak" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:18px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:18px">${tchip(S.showDef,'Definition','toggleDef')}${tchip(S.showSent,'Sentence','toggleSent')}${tchip(S.showOrigin,'Origin','toggleOrigin')}</div>
      ${hints.length?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:15px;line-height:1.6;margin-bottom:18px">${hints.join('  ·  ')}</div>`:''}
      <input data-inp="onType" data-key="trainKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:16px">
      ${showResult?`<div style="${resultStyle}">${esc(resultText)}</div>`:''}
      <div style="display:flex;gap:10px"><button data-act="reveal" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Show answer</button><button data-act="primary" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${primaryLabel}</button></div>
    </div>`;
}
function viewTrain(){
  const S=state; const goalTarget=active().goal||S.draft.goal||10; const goalDoneN=goalToday(); const goalPctNum=Math.min(100,Math.round((goalDoneN/goalTarget)*100));
  return `<div style="max-width:620px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><button data-act="exitTrain" style="color:var(--muted);font-weight:700;font-size:13px">← Exit</button><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${S.sessionDone} done · ${S.sessionRight} correct</div></div>
    <div style="height:7px;border-radius:999px;background:var(--surface2);overflow:hidden;margin-bottom:22px"><div style="height:100%;background:var(--accent);border-radius:999px;width:${goalPctNum}%;transition:width .4s"></div></div>
    ${trainerCard()}
    ${liveHeatmap(S.sessionWords&&S.sessionWords.length?S.sessionWords:WORDS, {anon:true})}
  </div>`;
}
// reusable one-card-at-a-time study flashcard (word + meaning + sentence + params), Prev/Next + progress bar
function wordFlash(words, idx, navAct, opts){
  opts=opts||{}; const N=words.length||1; const i=Math.min(Math.max(idx||0,0),N-1); const w=words[i]||{w:'',d:'',s:'',p:'',o:''};
  const mastered=state.luMastered[nkey(w.w)]; const pct=Math.round((i+1)/N*100);
  const chip=(t)=>`<span style="padding:4px 11px;border-radius:999px;background:var(--surface2);font-size:12px;color:var(--muted);font-weight:700">${t}</span>`;
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${i+1} of ${N}</span>
      <div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div>
      ${mastered?'<span style="color:var(--good);font-weight:800;font-size:12px;white-space:nowrap">✓ Mastered</span>':''}
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow);text-align:center;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="display:flex;align-items:center;justify-content:center;gap:11px">
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(26px,5.5vw,36px);line-height:1.05">${esc(w.w)}</div>
        <button data-act="say" data-arg="${escA(w.w)}" aria-label="Hear the word" title="Hear the word" style="width:42px;height:42px;flex-shrink:0;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',20)}</button>
      </div>
      ${w.sy?`<div style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:700;letter-spacing:.04em;margin-top:3px">${esc(w.sy)}</div>`:''}
      <div style="font-size:15px;color:var(--text);line-height:1.5;margin-top:8px">${esc(w.d)}</div>
      ${w.s?`<div style="font-size:13px;color:var(--muted);line-height:1.55;margin-top:9px"><b style="color:var(--text)">Sentence.</b> ${esc(w.s)}</div>`:''}
      ${w.h?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:13px;color:var(--text);line-height:1.5;margin-top:10px;background:var(--chip);border-radius:10px;padding:9px 13px;max-width:42em"><span style="color:var(--accent);margin-top:1px;flex-shrink:0">${iconSVG('bulb',15)}</span><span>${esc(w.h)}</span></div>`:''}
      ${w.m?`<div style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--bad);font-weight:700;line-height:1.5;margin-top:9px">${iconSVG('alert',14)} Often misspelled “${esc(w.m)}”</div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:15px">
        ${w.bp!=null?`<span title="Bee-probability score: ${w.bp}/100" style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;background:var(--surface2);font-size:12px;color:var(--accent);font-weight:800">${iconSVG('target',13)} ${beeOdds(w.bp)}</span>`:''}
        ${w.p?chip('/ '+esc(w.p)+' /'):''}${w.o?chip(esc(w.o)):''}${w.ps?chip(esc(w.ps)):''}
        <button data-act="reportWord" data-arg="${escA(w.w)}" title="Meaning or sentence look wrong? Report it for review" style="padding:4px 11px;border-radius:999px;background:transparent;border:1px dashed var(--line);font-size:12px;color:var(--muted);font-weight:700">⚑ Report a fix</button>
      </div>
      ${state.reportW===w.w?`<div style="margin-top:12px;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:12px;max-width:34em">
        <div style="font-weight:800;font-size:13px;margin-bottom:8px">What looks wrong with “${esc(w.w)}”?</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center">${['Meaning is wrong','Sentence is wrong','Meaning ↔ sentence mismatch','Pronunciation','Something else'].map(o=>`<button data-act="reportIssue" data-arg="${escA(o)}" style="padding:7px 12px;border-radius:999px;background:var(--bg2);border:1px solid var(--line);font-weight:700;font-size:12px;color:var(--text)">${o}</button>`).join('')}</div>
        <button data-act="reportClose" style="margin-top:8px;color:var(--muted);font-weight:700;font-size:12px;text-decoration:underline;text-underline-offset:2px">Cancel</button>
      </div>`:''}
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button data-act="${navAct}" data-arg="prev" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button>
      <button data-act="${navAct}" data-arg="next" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'All done ✓':'Next →'}</button>
    </div>`;
}
// live progress heatmap of a word set — colours update as words are mastered/missed
function liveHeatmap(words, opts){
  if(!words || !words.length) return '';
  opts=opts||{}; const anon=!!opts.anon; const reveal=!anon || !!state.heatReveal;
  const cur=curWord(); const N=words.length;
  const m=words.filter(w=>state.luMastered[nkey(w.w)]).length;
  const missed=words.filter(w=>!state.luMastered[nkey(w.w)] && (state.missedWords||[]).some(x=>nkey(x.w)===nkey(w.w))).length;
  const cells=words.map(w=>{ const k=nkey(w.w); const mastered=state.luMastered[k]; const miss=!mastered && (state.missedWords||[]).some(x=>nkey(x.w)===k);
    const isCur=cur && nkey(cur.w)===k; const bg=mastered?'var(--good)':(miss?'var(--bad)':'var(--surface2)'); const fg=(mastered||miss)?'#fff':'var(--muted)';
    if(!reveal){ // anonymized: a colored tile, no word text (so practice isn't spoiled)
      return `<span title="${mastered?'mastered':(miss?'to review':'new')}" style="width:22px;height:22px;border-radius:6px;background:${bg};display:inline-block;${isCur?'box-shadow:0 0 0 2px var(--accent)':''}"></span>`;
    }
    if(anon && isCur) return `<span title="current word — hidden" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;color:var(--muted);background:var(--surface2);box-shadow:0 0 0 2px var(--accent)">•••</span>`;
    return `<button data-act="wordCard" data-arg="${escA(w.w)}" title="open the learn card" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;color:${fg};background:${bg};${isCur?'box-shadow:0 0 0 2px var(--accent)':''}">${esc(w.w)}</button>`;
  }).join('');
  const legend=[['var(--good)','Mastered'],['var(--bad)','Missed'],['var(--surface2)','New']].map(([c,l])=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="width:11px;height:11px;border-radius:6px;background:${c};display:inline-block"></span>${l}</span>`).join('');
  const pct=Math.round(m/N*100);
  const toggle=(anon?`<button data-act="toggleHeat" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px;white-space:nowrap">${iconSVG(reveal?'eyeoff':'eye',14)} ${reveal?'Hide words':'Show words'}</button>`:'')
    +(opts.print?`<button data-act="printOpen" title="Print this word list" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px;white-space:nowrap">${SB_ICON('printer',{size:16})} Print</button>`:'');
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:18px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:11px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Live progress</div><div style="flex:1;min-width:90px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .35s"></div></div><div style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">${m}/${N} mastered${missed?(' · '+missed+' to review'):''}</div>${toggle}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${cells}</div>
    <div style="display:flex;flex-wrap:wrap;gap:14px">${legend}</div>
  </div>`;
}
function viewLevelUp(){
  const S=state; const c=active(); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound; const fIdx=formIdx(c.level);
  const lw=listWords('default'); const N=lw.length||1; const mastered=lw.filter(w=>S.luMastered[nkey(w.w)]).length; const pos=(S.gi%N)+1;
  const tab=(k,l)=>`<button data-act="luSetTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:10px;font-weight:800;font-size:13px;${S.luTab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const header=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button>
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${evo[fIdx]}</span>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${S.luTab==='practice'?('Word '+pos+' of '+N+' · '):''}${mastered}/${N} mastered</span>
      <button data-act="luToggleWords" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${iconSVG('grid',15)} Word list ${S.luWordsOpen?'▲':'▼'}</button>
    </div>
    <div style="height:6px;border-radius:999px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round(mastered/N*100)}%;transition:width .4s"></div></div>`;
  const wordsPanel=S.luWordsOpen?`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px;margin-bottom:16px;animation:sb-rise .3s ease both">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Level word list · ${N}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px">${lw.map(w=>{ const hide=S.luTab==='practice'&&state.status==='idle'&&nkey((curWord()||{}).w||'')===nkey(w.w);
        return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:11px 13px">${S.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:12px">✓ </span>':''}<span style="font-family:var(--display);font-weight:800;font-size:15px">${hide?'•••':esc(w.w)}</span><div style="font-size:12px;color:var(--muted);line-height:1.4;margin-top:2px">${esc(hide?maskTxt(w.d,w.w):w.d)}</div></div>`; }).join('')}</div>
    </div>`:'';
  let body;
  if(S.luTab==='practice') body=trainerCard();
  else body=wordFlash(lw, S.reviseIdx, 'reviseNav', { practise:true });
  return `<div style="max-width:760px;margin:0 auto">${header}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:14px;padding:5px;margin-bottom:16px">${tab('revise','Revise')}${tab('practice','Practice')}</div>
    ${wordsPanel}${body}${liveHeatmap(lw, {anon:S.luTab==='practice'})}</div>`;
}

/* ===================== Parent analytics + offline tips engine (no AI) ===================== */
let _wIdx=null;
function wordIndex(){ if(_wIdx) return _wIdx; _wIdx={}; try{ journeySorted().forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); ((window.SB_NSF500&&SB_NSF500.words)||[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); (window.SB_SCRIPPS||[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); (typeof REVIEW!=='undefined'?REVIEW:[]).forEach(w=>{ if(w&&w.w&&!_wIdx[nkey(w.w)]) _wIdx[nkey(w.w)]=w; }); }catch(e){} return _wIdx; }
function dayNum(){ const d=new Date(); return Math.floor(d.getTime()/86400000); }
function parentSignals(){ const c=active(); const played=(c.daysPlayed||[]).slice().sort();
  let daysSince=999; if(played.length){ const last=new Date(played[played.length-1]+'T12:00'); daysSince=Math.max(0,Math.round((Date.now()-last.getTime())/86400000)); }
  const cutoff=Date.now()-14*86400000; const active14=played.filter(k=>new Date(k+'T12:00').getTime()>=cutoff).length;
  const missedN=((c.missed)||[]).length; const key=activeListKey(); const enc=encounteredWords(key);
  const encM=enc.filter(w=>state.luMastered[nkey(w.w)]).length; const coverage=enc.length?Math.round(encM/enc.length*100):0;
  return { c, daysSince, active14, acc:(c.acc||0), missedN, streak:(c.streak||0), toBee:(milestone()||{days:9999}).days, age:(c.age||9), coverage,
    reviewHealth:Math.max(0,100-missedN*5), consistency:Math.round(active14/14*100) }; }
// Generated tips multiply the authored library with real app data — every concept, theme,
// champion-word hook and the child's own misses become concrete, presentable coaching tips.
function genTip(kind,idx){ const T=window.SB_TIPS||{};
  if(kind==='pattern'){ const chs=state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]; if(!chs.length) return null; const ch=chs[idx%chs.length]; return 'Pattern coaching — '+conceptShort(ch.title)+': '+ch.concept; }
  if(kind==='theme'){ const ts=themeDefs(); if(!ts.length) return null; const t=ts[idx%ts.length]; return 'Interest is memory glue: if '+t.label.toLowerCase()+' excites your child, add the “'+t.label+'” Theme Journey — its words will stick twice as fast as neutral lists.'; }
  if(kind==='champword'){ const pool=journeySorted().filter(w=>w.h&&(w.y||3)>=4); if(!pool.length) return null; const w=pool[idx%pool.length]; return 'Champion word of the day — “'+w.w+'”: '+w.h; }
  if(kind==='miss'){ const ms=(active().missed)||[]; if(!ms.length) return null; const m=ms[idx%ms.length]; const w=wordIndex()[nkey(m.w)];
    if(w&&w.h) return 'On the review pile — “'+w.w+'”: '+w.h;
    if(w&&w.sy) return 'On the review pile — “'+w.w+'”: spell it beat by beat ('+w.sy.replace(/\./g,' · ')+'), then say the whole word to seal it.';
    return 'On the review pile — “'+m.w+'”: have your child spell it three ways (pencil, finger-trace, eyes closed) and retire it after three clean days.'; }
  return null; }
function tipLibraryCount(){ const T=window.SB_TIPS||{}; let n=0; Object.keys(T).forEach(k=>n+=T[k].length);
  const chs=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]).length; const ths=themeDefs().length;
  let champ=0; try{ champ=journeySorted().filter(w=>w.h&&(w.y||3)>=4).length; }catch(e){}
  return n+chs+ths+champ; }
function parentTips(){ const T=window.SB_TIPS||{}; const s=parentSignals(); const page=state.tipPage||0; const seed=dayNum()+page*7;
  const picks=[]; const used=new Set();
  const take=(cat,why)=>{ if(used.has(cat)) return; used.add(cat);
    if(cat==='pattern'||cat==='theme'||cat==='champword'||cat==='miss'){ const t=genTip(cat,seed+picks.length); if(t) picks.push({cat,why,text:t}); return; }
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
  ['motivation','memory','parenting','oral','written','origin','pattern','champword','theme','plateau'].forEach(cat=>{ if(picks.length<6) take(cat,'daily coaching rotation'); });
  return picks.slice(0,6); }
const TIP_CAT_LABEL={reengage:'Re-engage',consistency:'Consistency',difficult:'Hard words',memory:'Memory science',accuracy:'Accuracy',oral:'Oral rounds',written:'Written rounds',beeday:'Bee day',nerves:'Nerves',motivation:'Motivation',parenting:'Parenting',young:'Young spellers',plateau:'Plateau',review:'Review',coverage:'Coverage',origin:'Origins',pattern:'Patterns',champword:'Champion words',theme:'Themes',miss:'Their words'};
function everPractised(c){ c=c||active(); try{ return bandEvidence(c)>0 || masteredCount()>0 || (c.missed||[]).length>0 || Object.keys(state.coachHistory||{}).length>0; }catch(e){ return false; } }
function parentAnalytics(){ const s=parentSignals(); let rd=0; try{ rd=coachReadiness().ready||0; }catch(e){}
  if(!everPractised(s.c)) return `<div class="sb-card" style="display:flex;align-items:center;gap:16px">
    <div style="width:64px;height:70px;flex-shrink:0">${mascotSVG('think')}</div>
    <div style="min-width:0">
      <div class="sb-ct" style="margin-bottom:3px">${esc(s.c.name||'Your speller')} hasn\u2019t practised yet</div>
      <div class="sb-cs">Signals appear after the first session \u2014 you\u2019ll see <b>Consistency</b>, <b>Accuracy</b>, <b>Coverage</b>, <b>Review health</b> and <b>Readiness</b>, all computed on this device. The best first step: one 5-word session together today.</div>
    </div></div>`;
  const meters=[['Consistency',s.consistency,'practised '+s.active14+'/14 days'],['Accuracy',s.acc,'across recent sessions'],['Coverage',s.coverage,'of words met on the active list'],['Review health',s.reviewHealth,s.missedN+' words waiting for revenge'],['Readiness',rd,'on the coach target list']];
  const bars=meters.map(([l,v,sub])=>{ v=Math.max(0,Math.min(100,Math.round(v||0))); const col=v>=70?'var(--good)':v>=40?'#c08a00':'var(--bad)';
    return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span style="font-family:var(--display);font-weight:800;font-size:13px">${l}</span><span style="font-family:var(--mono);font-weight:700;font-size:13px;color:${col}">${v}%</span></div><div style="height:7px;border-radius:999px;background:var(--surface);overflow:hidden;margin:8px 0 6px"><div style="height:100%;border-radius:999px;background:${col};width:${v}%"></div></div><div style="font-size:12px;color:var(--muted);font-weight:600">${sub}</div></div>`; }).join('');
  const tips=parentTips().map(t=>`<div style="display:flex;gap:11px;align-items:flex-start;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface)">
      <span style="flex-shrink:0;margin-top:1px;padding:4px 9px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px;white-space:nowrap">${TIP_CAT_LABEL[t.cat]||t.cat}</span>
      <div style="min-width:0"><div style="font-size:13px;line-height:1.5;color:var(--text);font-weight:600">${esc(t.text)}</div><div style="font-size:12px;color:var(--muted);font-weight:700;margin-top:3px">Why now: ${esc(t.why)}</div></div></div>`).join('');
  return `<div class="sb-card" style="margin-bottom:18px">
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Parent analytics</div><span style="font-size:12px;color:var(--muted);font-weight:700">readiness across five signals</span></div>
    <p style="margin:0 0 14px;font-size:12px;color:var(--muted)">All computed on this device from the practice log — no internet, no AI.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:16px">${bars}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Coach's corner <span style="color:var(--muted);font-weight:700;font-size:12px">· picked for this week by the practice data</span></div>
      <button data-act="moreTips" style="padding:8px 14px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">More tips ↻</button></div>
    <div style="display:flex;flex-direction:column;gap:8px">${tips}</div>
    <div style="font-size:12px;color:var(--muted);font-weight:600;margin-top:10px">Tip library: ${tipLibraryCount().toLocaleString()} coaching tips, matched to your speller's data.</div>
  </div>`; }
/* ===================== List Builder (button-based custom lists) ===================== */
function builtWords(key){ const bl=(active().builtLists||{})[key]; if(!bl) return []; const idx=wordIndex(); const db=wordDB(); return (bl.ws||[]).map(s=>idx[nkey(s)]||db.get(nkey(s))||{w:s}).filter(Boolean); }
function bldState(){ const S=state; if(!S.bld) S.bld={diff:'mixed',size:120,src:'core',len:'any',pat:'any'}; return S.bld; }
const BLD_PATS={ double:{re:/(.)\1/, label:'Double letters'}, silent:{re:/^(kn|wr|gn|ps|mn)|mb$|gh/i, label:'Silent letters'}, ieei:{re:/ie|ei/i, label:'ie / ei'}, endings:{re:/(tion|sion|ous|able|ible|ance|ence|ary|ery|ory)$/i, label:'Suffix endings'} };
function bldPool(){ const b=bldState(); let pool;
  if(b.src==='scripps') pool=(window.SB_SCRIPPS||[]).slice();
  else if(b.src==='review') pool=(typeof REVIEW!=='undefined'?REVIEW:[]).slice();
  else if(b.src==='missed') pool=((active().missed)||[]).map(m=>wordIndex()[nkey(m.w)]||{w:m.w});
  else if(b.src==='nsf') pool=(coachCatalog().find(x=>x.key==='nsf_finals')||{words:[]}).words.slice();
  else pool=journeySorted().slice();
  pool=pool.filter(w=>w&&w.w);
  if(b.diff!=='mixed'){ const t={easy:w=>(w.y||3)<=2, medium:w=>(w.y||3)===3, hard:w=>(w.y||3)===4, champion:w=>(w.y||3)>=5}[b.diff]; if(t) pool=pool.filter(t); }
  if(b.len!=='any'){ const t={short:w=>w.w.length<=6, medium:w=>w.w.length>=7&&w.w.length<=9, long:w=>w.w.length>=10}[b.len]; if(t) pool=pool.filter(t); }
  if(b.pat!=='any' && BLD_PATS[b.pat]) pool=pool.filter(w=>BLD_PATS[b.pat].re.test(w.w));
  return pool; }
function bldPick(){ const b=bldState(); const pool=bldPool().sort((x,y)=>((x.y||3)-(y.y||3))||(x.w.length-y.w.length));
  const n=Math.min(b.size,pool.length); if(!n) return [];
  if(pool.length<=b.size) return pool;
  const out=[]; const step=pool.length/n; for(let i=0;i<n;i++){ out.push(pool[Math.floor(i*step)]); } return out; } // even spread keeps the easy→hard ramp
function bldLevels(n){ return n<=WORK_MAX?1:Math.max(2,Math.min(24,Math.round(n/50))); }
function viewBuilder(){ const S=state; const b=bldState(); const picked=bldPick(); const n=picked.length; const lv=bldLevels(n); const per=n?Math.ceil(n/lv):0;
  const btn=(group,val,label,cur)=>`<button data-act="bldSet" data-arg="${group}:${val}" style="padding:9px 14px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid ${cur===val?'var(--action,var(--accent))':'var(--line)'};${cur===val?'background:color-mix(in srgb,var(--action,var(--accent)) 12%,var(--paper,#fff));color:var(--action,var(--accent))':'background:var(--surface2);color:var(--text)'}">${label}</button>`;
  const row=(title,sub,btns)=>`<div style="margin-bottom:15px"><div style="font-family:var(--display);font-weight:800;font-size:13px">${title} <span style="color:var(--muted);font-weight:700;font-size:12px">· ${sub}</span></div><div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">${btns}</div></div>`;
  const srcs=[['core','Core library'],['scripps','Scripps winners'],['nsf','North South Finals'],['review','Tricky review'],['missed','My missed words']];
  const preview=picked.slice(0,18).map(w=>`<span style="font-family:var(--mono);font-size:12px;font-weight:700;padding:4px 9px;border-radius:6px;background:var(--surface2);border:1px solid var(--line)">${esc(w.w)}</span>`).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('List Builder','pick · build · print','Build a custom word list with five taps — or pick a ready-made list below. Every list gets its own Level ladder.')}
    <div class="sb-card" style="margin-bottom:16px">
      ${row('1 · Difficulty','how hard the words are',['easy','medium','hard','champion','mixed'].map(d=>btn('diff',d,d[0].toUpperCase()+d.slice(1),b.diff)).join(''))}
      ${row('2 · List size','how many words',[24,60,120,240,480].map(s=>btn('size',String(s),s+' words',String(b.size))).join(''))}
      ${row('3 · Source','which word pool to draw from',srcs.map(([k,l])=>btn('src',k,l,b.src)).join(''))}
      ${row('4 · Word length','short, medium or long words',[['any','Any'],['short','Short ≤6'],['medium','Medium 7–9'],['long','Long 10+']].map(([k,l])=>btn('len',k,l,b.len)).join(''))}
      ${row('5 · Tricky pattern','focus on one spelling trap',[['any','Any'],...Object.keys(BLD_PATS).map(k=>[k,BLD_PATS[k].label])].map(([k,l])=>btn('pat',k,l,b.pat)).join(''))}
      <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 16px;border-radius:14px;background:var(--chip);margin-bottom:14px">
        <div><div style="font-family:var(--display);font-weight:800;font-size:20px;color:var(--accent)">${n} words</div><div style="font-size:12px;color:var(--muted);font-weight:700">match your five choices</div></div>
        <div><div style="font-family:var(--display);font-weight:800;font-size:20px;color:var(--accent)">${n?lv:0} ${lv===1?'Level':'Levels'}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${n?('to mastery · ~'+per+' words per Level, easy→hard'):'pick looser criteria'}</div></div>
        ${n&&n<b.size?`<div style="font-size:12px;color:var(--muted);font-weight:700">only ${n} match — loosen a filter for more</div>`:''}
      </div>
      ${n?`<div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:14px">${preview}${n>18?`<span style="font-size:12px;color:var(--muted);font-weight:700;align-self:center">+${n-18} more</span>`:''}</div>`:''}
      <button data-act="bldCreate" ${n?'':'disabled'} style="width:100%;padding:14px;border-radius:14px;background:${n?'var(--accent)':'var(--surface2)'};color:${n?'#fff':'var(--muted)'};font-weight:800;font-size:15px;box-shadow:var(--edge)">${n?('Create list & start training → ('+n+' words · '+lv+' '+(lv===1?'Level':'Levels')+')'):'No words match yet'}</button>
    </div>
    <div class="sb-card">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">…or pick a ready-made list</div>
      <p style="font-size:12px;color:var(--muted);margin:0 0 12px">North South Finals, Scripps winners, origin lists and more — includes paste-your-own in Setup & lists.</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${coachCatalog().slice(0,8).map(o=>`<button data-act="selectList" data-arg="${escA(o.key)}" style="padding:9px 14px;border-radius:10px;font-weight:800;font-size:12px;border:1px solid var(--line);background:var(--surface2);color:var(--text)">${esc(o.label)} <span style="color:var(--muted);font-weight:700">${o.count}</span></button>`).join('')}
        <button data-act="coachSetupOpen" style="padding:9px 14px;border-radius:10px;font-weight:800;font-size:12px;border:1px dashed var(--line);background:transparent;color:var(--accent)">All lists + paste your own →</button>
      </div>
    </div>
  </div>`; }
/* ===================== Print a word list ===================== */
function printDoc(key){ const p=(state.prn&&state.prn.inc)?state.prn:{inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
  const inc=p.inc, page=p.page||'letter', scope=p.scope||'level', sort=p.sort||'level', compact=p.size==='compact';
  const c=active(); let words=(scope==='level'?listWords(key):listFullWords(key)).filter(w=>w&&w.w);
  if(sort==='alpha') words=words.slice().sort((a,b)=>a.w.localeCompare(b.w));
  else if(sort==='diff') words=words.slice().sort((a,b)=>((a.y||3)-(b.y||3))||((a.bp||0)-(b.bp||0))||a.w.localeCompare(b.w));
  const PRINT_CAP=2400; const total=words.length; if(words.length>PRINT_CAP) words=words.slice(0,PRINT_CAP);   // giant lists would hang the browser
  const label=listLabel(key).split(' · ')[0]; const sizes={letter:'letter',a4:'A4',a5:'A5'};
  let cols = inc.d ? 1 : ((inc.w?1:0)+(inc.p?1:0)>1 ? 2 : 3);
  if(compact) cols += (inc.d?1:1);                                   // compact squeezes one extra column in
  const rows=words.map((w,i)=>{ const say=w.p||w.sy||'';
    const wordBit = inc.w ? `<span class="w">${esc(w.w)}</span>` : `<span class="blank"></span>`;
    const sayBit  = (inc.p&&say) ? `<span class="p">${esc(say)}</span>` : '';
    const defBit  = (inc.d&&w.d) ? `<div class="d">${esc(inc.w?w.d:maskTxt(w.d,w.w))}</div>` : '';
    if(inc.d) return `<div class="cell full"><div><span class="n">${i+1}</span>${wordBit}${sayBit}</div>${defBit}</div>`;
    return `<div class="cell"><span class="n">${i+1}</span>${wordBit}${sayBit}</div>`; }).join('');
  const sortNote = sort==='alpha'?' · A→Z' : sort==='diff'?' · easiest→hardest' : '';
  const fz = compact ? {w:11,p:10,d:10,n:9.5,pad:'2px',dpad:'3px',gap:'2px 12px',mar:'9mm'} : {w:13,p:12,d:12,n:12,pad:'4px',dpad:'6px',gap:'4px 18px',mar:'14mm'};
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(label)} — Bizzing Bee word list</title><style>
    @page{size:${sizes[page]||'letter'};margin:${fz.mar}} *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Georgia,'Times New Roman',serif;color:#1c1633;padding:4px}
    h1{font-size:${compact?16:20}px;margin-bottom:2px} .meta{font-size:${compact?10:12}px;color:#666;margin-bottom:${compact?8:14}px;padding-bottom:${compact?5:8}px;border-bottom:2px solid #1c1633}
    .grid{display:grid;grid-template-columns:repeat(${cols},1fr);gap:${fz.gap}}
    .cell{display:flex;align-items:baseline;gap:8px;padding:${fz.pad} 0;border-bottom:1px dotted #ccc;break-inside:avoid}
    .cell.full{display:block;padding:${fz.dpad} 0}
    .n{font-size:${fz.n}px;color:#999;min-width:${compact?16:20}px;display:inline-block} .w{font-size:${fz.w}px;font-weight:bold;letter-spacing:.02em}
    .p{font-size:${fz.p}px;color:#555;font-style:italic;margin-left:8px} .d{font-size:${fz.d}px;color:#444;line-height:1.35;margin:2px 0 0 ${compact?22:28}px}
    .blank{display:inline-block;min-width:${compact?90:120}px;border-bottom:1.4px solid #444;height:${compact?10:13}px}
    .foot{margin-top:${compact?9:16}px;font-size:${compact?10:12}px;color:#888;text-align:center}
  </style></head><body>
    <h1>${esc(label)}${inc.w?'':' — quiz sheet'}</h1>
    <div class="meta">${esc(c.name||'Speller')} · ${words.length}${total>words.length?(' of '+total):''} words${sortNote} · ${scope==='level'?('Level '+(listStageIdx(c,key)+1)):'whole list'}${total>words.length?' (first '+PRINT_CAP+' shown — print a Level for a focused sheet)':''} · printed ${new Date().toLocaleDateString()} · Bizzing Bee</div>
    <div class="grid">${rows}</div>
    <div class="foot">${inc.w?'Say it → spell it → say it again. 🐝':'Read the clue, write the word — check together afterwards. 🐝'}</div>
  </body></html>`; }
// Lists the child has activated: the 3 core lists + everything they pinned + whatever is being trained now.
function activatedListKeys(){ const c=active(); ensureLists(c);
  const keys=['journey','review','missed', ...Object.keys(c.pinnedLists||{}).filter(k=>(c.pinnedLists||{})[k])];
  const cur=c.activeList; if(cur && !keys.includes(cur)) keys.push(cur);
  return keys.filter((k,i)=>keys.indexOf(k)===i); }
// Words the child has met on a list so far: every Level up to (and including) the current one.
function encounteredWords(key){ try{ const c=active(); const stages=listStages(key); const idx=listStageIdx(c,key);
  let out=[]; for(let i=0;i<=idx && i<stages.length;i++) out=out.concat(stages[i].words||[]); return out.filter(w=>w&&w.w); }catch(e){ return []; } }
// Champion's Quest — one quest, three paths. The chooser; the paths not picked stay a tap away as lists.
function viewQuest(){
  const c=active(); ensureLists(c); const qp=c.questPath;
  const paths=[
    { id:'journey', sc:'coach', c1:'#7C5CFF', c2:'#5A37D6', tex:'stripes', title:'Bizzing Bee Journey',
      sub:'The classic champ ladder', desc:'~1,600 top bee words ramped easy→hard across 20 Levels. Master each Level (or pass its Champ Challenge) and evolve all the way to Bizzing Bee Champ.',
      points:['20 Levels → Champ','Champ Challenge test-outs','The Champion’s Library beyond'] },
    { id:'themes', sc:'theme', c1:'#B14FC4', c2:'#9438A8', tex:'rings', title:'Theme Journey',
      sub:'Learn words by their worlds', desc:'Pick 3–5 worlds you love — medicine, music, maps, myths & 50 more. Each theme becomes its own Level ladder, and mastery flows back into every list.',
      points:['52 themes in 8 worlds','Each theme = its own ladder','Feeds Magic Squares in the Arcade'] },
    { id:'own', sc:'book', c1:'#13A892', c2:'#0E8A78', tex:'grid', title:'My Own List',
      sub:'Bring or build your list', desc:'Train on any list — North South Finals, Scripps Winning Words, or paste your own words and we enrich them with meanings, sentences and origins.',
      points:['Every ready-made list','Paste your own words','Same Level ladder & games'] },
  ].map((p,i)=>{ const cur=qp===p.id; const t=CONCEPT_TEX[p.tex]||CONCEPT_TEX.stripes;
    return `<button class="sb-cover-card" data-act="questPick" data-arg="${p.id}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 ${cur?'2px '+p.c1:'1px var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
      <div style="position:relative;height:112px;display:grid;place-items:center;background-color:${p.c1};background-image:${t[0]},linear-gradient(135deg,${p.c1},${p.c2});background-size:${t[1]},100% 100%">
        ${cur?'<span style="position:absolute;top:10px;right:11px;padding:4px 10px;border-radius:999px;background:rgba(255,255,255,.94);color:'+p.c1+';font-weight:900;font-size:12px">Current path ✓</span>':''}
        <div style="color:#fff">${journeyArtSVG(p.sc,54)}</div>
      </div>
      <div style="padding:15px 16px 16px;display:flex;flex-direction:column;flex:1">
        <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">${p.title}</div>
        <div style="font-family:var(--ui,var(--body));font-weight:800;font-size:11.5px;letter-spacing:.07em;text-transform:uppercase;color:${p.c1};margin-top:3px">${p.sub}</div>
        <div style="font-family:var(--body);font-size:13px;line-height:1.5;color:var(--muted);margin:9px 0 11px">${p.desc}</div>
        <div style="display:flex;flex-direction:column;gap:5px;margin-bottom:13px">${p.points.map(x=>`<span style="display:flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--text)"><span style="width:6px;height:6px;border-radius:50%;background:${p.c1};flex-shrink:0"></span>${x}</span>`).join('')}</div>
        <span style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;padding:11px;border-radius:10px;font-weight:800;font-size:13px;${cur?('background:var(--surface2);color:'+p.c1):('background:'+p.c1+';color:#fff;box-shadow:var(--edge)')}">${cur?'Continue this path →':(qp?'Switch to this path →':'Choose this path →')}</span>
      </div></button>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead("Champion's Quest",'one quest · three paths','Pick the path that fits today — the other two stay one tap away in your list row, with all progress kept.')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px;margin-bottom:16px">${paths}</div>
    <div style="display:flex;align-items:center;gap:10px;padding:13px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line)"><span style="color:var(--accent)">${iconSVG('spark',17)}</span><span style="font-size:13px;color:var(--muted);font-weight:600">Switching paths never loses progress — every list keeps its own Level ladder, and you can hop between them from the Word Coach list row.</span></div>
    ${(()=>{ const un=loreUnlocked(); const all=lessonsAll().length||100; const next=lessonsAll()[un.length];
      const chips=un.slice(-8).map(L=>`<button data-act="openLesson" data-arg="${L.n}" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12px">${window.SB_ICON?SB_ICON('book',{size:13}):iconSVG('book',13)} ${esc(trunc(L.title,26))}</button>`).join('');
      return `<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:16px 18px;margin-top:14px">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:4px"><span style="font-family:var(--display);font-weight:800;font-size:17px">Story vault</span><span style="font-size:12px;color:var(--muted);font-weight:650">${un.length}/${all} word-history tales unlocked — one per Level you clear</span></div>
        ${un.length?`<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">${chips}</div>`:`<p style="margin:6px 0 0;font-size:13px;color:var(--muted)">Clear your first Level to unlock a tale from the history of words.</p>`}
        ${next?`<div style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;color:var(--muted);font-weight:650">${iconSVG('lock',13,2.2)} Next up: <b style="color:var(--ink,var(--text))">${esc(next.title)}</b> — clear a Level to open it</div>`:''}
      </div>`; })()}
  </div>`;
}
/* Progress + Parent live under one nav: a segmented switch picks the view. */
function viewProgressShell(){ const t=state.progTab==='parent'?'parent':'me';
  const seg2=(k,ic,l)=>`<button data-act="progTab" data-arg="${k}" style="display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:999px;font-weight:800;font-size:13.5px;${t===k?'background:var(--accent);color:#fff;box-shadow:var(--edge)':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  return `<div style="max-width:920px;margin:0 auto">
    <div style="display:flex;gap:8px;margin-bottom:16px">${seg2('me','chart','My progress')}${seg2('parent','users','Parent zone')}</div>
    ${t==='parent'?viewParent():viewProgress()}</div>`; }
function viewProgress(){
  const c=active();
  const bb=beeBand(c);
  const stats=[{v:masteredCount(),k:'Words mastered'},{v:c.streak||0,k:'Day streak'}]
    .map(s=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:24px;color:var(--accent)">${s.v}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${s.k}</div></div>`).join('');
  const wk=c.week&&c.week.length?c.week:[12,20,15,30,18,25,22]; const maxW=Math.max(...wk,1); const days=['M','T','W','T','F','S','S'];
  const week=wk.map((m,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end"><div style="font-size:11px;font-weight:800;color:var(--muted)">${m||''}</div><div style="width:100%;border-radius:6px 7px 4px 4px;background:var(--accent);height:${Math.round((m/maxW)*100)}%;min-height:5px;opacity:${m?'1':'.3'}"></div><div style="font-size:12px;color:var(--muted);font-weight:700">${days[i]}</div></div>`).join('');
  // ---- real per-list heatmap: dropdown over activated lists, plus All ----
  const S=state; const hKeys=activatedListKeys(); const hSel=(S.progHeatKey&&(S.progHeatKey==='all'||hKeys.includes(S.progHeatKey)))?S.progHeatKey:'all';
  const hLabel=(k)=> k==='journey'?'Bizzing Bee Journey':listLabel(k).split(' · ')[0];
  const hOpts=[`<option value="all"${hSel==='all'?' selected':''}>All lists</option>`,...hKeys.map(k=>`<option value="${escA(k)}"${hSel===k?' selected':''}>${esc(hLabel(k))} · L${listStageIdx(c,k)+1}</option>`)].join('');
  const hDrop=`<div style="position:relative;margin-left:auto"><select data-chg="progHeat" style="appearance:none;-webkit-appearance:none;padding:9px 34px 9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-family:var(--display);font-weight:800;font-size:13px;cursor:pointer">${hOpts}</select><span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--accent);font-size:12px">▼</span></div>`;
  let hBody='';
  if(hSel==='all'){
    hBody=hKeys.map(k=>{ const ws=encounteredWords(k); const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length;
      const miss=ws.filter(w=>!state.luMastered[nkey(w.w)] && (state.missedWords||[]).some(x=>nkey(x.w)===nkey(w.w))).length;
      const pct=ws.length?Math.round(m/ws.length*100):0;
      const tiles=ws.slice(0,96).map(w=>{ const kk=nkey(w.w); const bg=state.luMastered[kk]?'var(--good)':((state.missedWords||[]).some(x=>nkey(x.w)===kk)?'var(--bad)':'var(--surface2)'); return `<span title="${escA(w.w)}" style="width:14px;height:14px;border-radius:6px;background:${bg};display:inline-block"></span>`; }).join('');
      return `<button data-act="progHeatPick" data-arg="${escA(k)}" style="display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:10px;background:var(--surface)">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(hLabel(k))}</span><span style="font-size:12px;color:var(--muted);font-weight:700">L${listStageIdx(c,k)+1} · ${m}/${ws.length} mastered${miss?(' · '+miss+' to review'):''}</span><div style="flex:1;min-width:80px;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--accent);width:${pct}%"></div></div><span style="font-size:12px;color:var(--accent);font-weight:800">${pct}%</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${tiles}${ws.length>96?`<span style="font-size:12px;color:var(--muted);font-weight:700;align-self:center">+${ws.length-96} more</span>`:''}</div>
      </button>`; }).join('');
    hBody=hBody||beeEmpty('think','Nothing to map yet — start practising and this lights up like a hive.');
  } else {
    const ws=encounteredWords(hSel); const cap=400;
    hBody=ws.length?((()=>{ const shown=ws.slice(0,cap);
      const cells=shown.map(w=>{ const kk=nkey(w.w); const mstd=state.luMastered[kk]; const miss=!mstd&&(state.missedWords||[]).some(x=>nkey(x.w)===kk);
        return `<button data-act="say" data-arg="${escA(w.w)}" title="tap to hear" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;color:${(mstd||miss)?'#fff':'var(--muted)'};background:${mstd?'var(--good)':(miss?'var(--bad)':'var(--surface2)')}">${esc(w.w)}</button>`; }).join('');
      const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length;
      return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:11px"><span style="font-size:12px;color:var(--muted);font-weight:700">${m}/${ws.length} mastered — words met so far on this list (through Level ${listStageIdx(c,hSel)+1})</span></div><div style="display:flex;flex-wrap:wrap;gap:6px">${cells}</div>${ws.length>cap?`<div style="font-size:12px;color:var(--muted);margin-top:8px">Showing the first ${cap} of ${ws.length}.</div>`:''}`; })())
      :beeEmpty('happy','A fresh list! First practice fills this grid — clipboard ready.');
  }
  const legend=[['var(--good)','Mastered'],['var(--bad)','Needs work'],['var(--surface2)','Not yet mastered']].map(([cc,l])=>`<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600"><span style="width:12px;height:12px;border-radius:6px;background:${cc}"></span>${l}</span>`).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Progress','this week','Mastery, accuracy and streak at a glance — and where each word stands.')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px">${stats}</div>
    ${(()=>{ const ms=milestone(); let rd=null; try{ rd=coachReadiness(); }catch(e){}
      if(!ms&&!rd) return '';
      const mastered7=(c.activity||[]).filter(a=>a.ts&&dayDiff((d=>{const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');})(a.ts),todayKey())<=7).reduce((t,a)=>t+(a.right||0),0);
      const need=rd?Math.max(0,rd.size-rd.ms):0;
      const pace=(ms&&ms.days>0&&need>0)?Math.ceil(need/ms.days):null;
      return `<div class="sb-card" style="margin-bottom:18px;background:linear-gradient(100deg,color-mix(in srgb,var(--accent) 10%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 60%)">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px"><span style="font-family:var(--display);font-weight:800;font-size:15px">🐝 Road to the bee</span>${ms?`<span style="font-size:12px;color:var(--muted);font-weight:700">${esc(ms.label)} · ${ms.days} days away</span>`:''}</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${ms?`<div style="flex:1;min-width:110px;text-align:center;background:var(--surface);border-radius:12px;padding:12px 8px"><div style="font-family:var(--display);font-weight:800;font-size:22px;color:var(--accent)">${ms.days}</div><div style="font-size:11.5px;color:var(--muted);font-weight:700">days to go</div></div>`:''}
          ${rd&&rd.size?`<div style="flex:1;min-width:110px;text-align:center;background:var(--surface);border-radius:12px;padding:12px 8px"><div style="font-family:var(--display);font-weight:800;font-size:22px">${rd.ready}%</div><div style="font-size:11.5px;color:var(--muted);font-weight:700">list mastered</div></div>
          <div style="flex:1;min-width:110px;text-align:center;background:var(--surface);border-radius:12px;padding:12px 8px"><div style="font-family:var(--display);font-weight:800;font-size:22px">${fmtN(need)}</div><div style="font-size:11.5px;color:var(--muted);font-weight:700">words to master</div></div>`:''}
          ${pace?`<div style="flex:1;min-width:110px;text-align:center;background:var(--surface);border-radius:12px;padding:12px 8px"><div style="font-family:var(--display);font-weight:800;font-size:22px;color:${mastered7>=pace*7?'var(--good)':'var(--treasure-deep,#8A5B00)'}">${pace}/day</div><div style="font-size:11.5px;color:var(--muted);font-weight:700">pace to be ready${mastered7?(' · '+mastered7+' this week'):''}</div></div>`:''}
        </div>
      </div>`; })()}
    ${(()=>{ const tiers=[[1,2,'Classroom Speller'],[3,4,'School-Bee Ready'],[5,6,'Regional Ready'],[7,8,'State & National'],[9,9,'Championship']];
      const row=tiers.map(([a,b2,label])=>{ const on=bb.band>=a&&bb.band<=b2;
        return `<div style="flex:1;min-width:96px;text-align:center;padding:10px 6px;border-radius:12px;${on?'background:var(--chip);box-shadow:inset 0 0 0 1.5px var(--accent)':'background:var(--surface);opacity:.75'}">
          <div style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--muted)">${a===b2?('Band '+a):('Bands '+a+'–'+b2)}</div>
          <div style="font-size:12px;font-weight:800;line-height:1.15;margin-top:3px;${on?'color:var(--accent)':''}">${label}</div></div>`; }).join('');
      return `<div class="sb-card" style="margin-bottom:18px">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:3px"><span style="font-family:var(--display);font-weight:800;font-size:15px">Your Bee Band</span><span style="font-size:12px;color:var(--muted);font-weight:650">${bb.calibrating?'calibrating — appears after ~30 graded words':('Band '+bb.band+' · '+bb.tier+(bb.n>=2?(' · '+bb.acc+'% right at this band'):''))}</span></div>
        <p style="margin:0 0 12px;font-size:12.5px;color:var(--muted);line-height:1.5">One skill measure across everything — Word Coach, games, duels and tests all feed it. It climbs the moment you prove a harder band (80%+ right) and never falls from one bad game — only a sustained slide moves it down. Your games and daily tip follow it automatically.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${row}</div>
      </div>`; })()}
    <div style="margin-bottom:18px">${streakCard()}</div>
    <div class="sb-card" style="margin-bottom:18px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:16px">This week</div>
      <div style="display:flex;align-items:flex-end;gap:9px;height:120px">${week}</div>
    </div>
    <div class="sb-card">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Word heatmap <span style="color:var(--muted);font-weight:700;font-size:12px">· by list</span></div>${hDrop}</div>
      ${hBody}
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px">${legend}</div>
    </div>
  </div>`;
}

function parentReviseCard(){ const c=active(); const misses=(c.missed||[]); const top=misses.slice(0,14);
  const chips=top.map(m=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12px"><span style="font-family:var(--mono)">${esc(m.w)}</span>${(m.n>1)?`<span style="color:var(--bad);font-weight:800">×${m.n}</span>`:''}</span>`).join('');
  return `<div class="sb-card" style="margin-top:18px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Words to revise <span style="color:var(--muted);font-weight:700">· ${misses.length}</span></div>${misses.length?`<button data-act="reviseMisses" style="padding:9px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">Revise these →</button>`:''}</div>
    ${misses.length?`<div style="display:flex;flex-wrap:wrap;gap:7px">${chips}${misses.length>14?`<span style="padding:5px 10px;font-size:12px;color:var(--muted);font-weight:700">+${misses.length-14} more</span>`:''}</div>`:beeEmpty('sleepy','No misses to chase — the bee ate every tricky word. Nap time earned!')}
  </div>`; }
function parentActivityCard(){ const S=state; const c=active(); const acts=(c.activity||[]).slice(0,12);
  const rows=acts.map((a,i)=>{ const open=S.parentLogOpen===i; const label=ACT_LABEL[a.kind]||a.label||'Activity'; const acc=a.done?Math.round(a.right/a.done*100):0; const hasDetail=a.misses&&a.misses.length;
    return `<div style="border:1px solid var(--line);border-radius:10px;margin-bottom:8px;overflow:hidden">
      <button data-act="parentLogToggle" data-arg="${i}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:11px 13px;background:${open?'var(--surface2)':'transparent'}">
        <span style="width:30px;height:30px;flex-shrink:0;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(actIcon(a.kind),16)}</span>
        <span style="min-width:0;flex:1"><span style="font-weight:800;font-size:13px">${esc(label)}</span><span style="display:block;font-size:12px;color:var(--muted);font-weight:600">${fmtAgo(a.ts)}${a.coins?(' · '+coinAmt(a.coins,11)):''}</span></span>
        <span style="font-family:var(--mono);font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">${a.right}/${a.done}${a.done?(' · '+acc+'%'):''}</span>
        ${hasDetail?`<span style="color:var(--accent);font-size:12px">${open?'▲':'▼'}</span>`:'<span style="width:12px"></span>'}
      </button>
      ${(open&&hasDetail)?`<div style="padding:0 13px 12px;font-size:12px;color:var(--muted);line-height:1.6"><b style="color:var(--bad)">Missed:</b> <span style="font-family:var(--mono)">${a.misses.map(esc).join(', ')}</span></div>`:''}
    </div>`; }).join('');
  return `<div class="sb-card" style="margin-top:18px">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">Activity log</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Everything ${esc(c.name||'your speller')} has done — tap a row to see the missed words.</div>
    ${acts.length?rows:`<p style="margin:0;font-size:13px;color:var(--muted)">No activity yet. Play a game or a practice round and it’ll show up here.</p>`}
  </div>`; }
function actIcon(kind){ return ({practice:'pencil',buzz:'flame',beat:'target',boss:'crown',meaning:'book',spell:'spark',origin:'grid',written:'pencil',oral:'volume',concept:'grid'})[kind]||'spark'; }
function viewFinder(){ const S=state; const c=active(); const q=S.finderQ||'';
  const total=window.SB_FULL?'128,000':'40,000';
  const loadBtn=(!window.SB_FULL)?`<button data-act="finderLoadFull" style="display:inline-flex;align-items:center;gap:7px;padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">${S.fullLoading?'Loading the full library…':'📚 Load all 128,000 words'}</button>`:'';
  let body='';
  if(S.finderSel){ const w=S.finderSel;
    const lists=Object.entries(c.builtLists||{});
    const addChips=lists.map(([k,bl])=>`<button data-act="finderAddTo" data-arg="${escA(k)}" style="padding:8px 13px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">＋ ${esc(bl.label)}</button>`).join('');
    body=`<button data-act="finderBack" style="color:var(--muted);font-weight:700;font-size:13px;margin-bottom:10px">← Back to results</button>
      <div class="sb-card" style="margin-bottom:12px">
        <div class="sb-ct" style="font-size:14px;margin-bottom:8px">Add “${esc(w.w)}” to a list</div>
        <div style="display:flex;gap:7px;flex-wrap:wrap;align-items:center">${addChips}
          <span style="display:inline-flex;gap:6px;align-items:center"><input data-inp="finderName" data-fkey="finderName" value="${escA(S.finderName||'')}" maxlength="30" placeholder="New list name…" style="width:150px;padding:8px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:12.5px;font-weight:700;outline:none"><button data-act="finderCreateAdd" style="padding:8px 14px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">Create + add</button></span></div>
        <div class="sb-cn" style="margin-top:8px">Lists live in Word Coach — practise them any time.</div>
      </div>
      ${wordFlash([w],0,'noop',{})}`;
  } else {
    const rs=finderResults(q);
    const cells=rs.map(r=>`<button data-act="finderPick" data-arg="${escA(r.w)}" style="display:flex;flex-direction:column;gap:3px;text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:12px 14px">
        <span style="display:flex;align-items:center;gap:8px;width:100%"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(r.w)}</span>${state.luMastered[nkey(r.w)]?'<span style="color:var(--good);font-weight:800;font-size:11px">✓ mastered</span>':''}<span style="margin-left:auto;color:var(--accent)">${iconSVG('book',15)}</span></span>
        ${r.d?`<span style="font-size:12px;color:var(--muted);line-height:1.4">${esc(trunc(r.d,110))}</span>`:''}</button>`).join('');
    body = q.trim().length<2
      ? `<div class="sb-card" style="text-align:center;padding:34px 20px"><div style="font-size:34px;margin-bottom:8px">🔎</div><div class="sb-ct">Type at least two letters</div><div class="sb-cs" style="margin-top:4px">Search the whole library — every word opens its learn card with meaning, sentence and pronunciation.</div></div>`
      : (rs.length?`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:9px">${cells}</div>`
        :`<div class="sb-card" style="text-align:center;padding:30px 20px"><div class="sb-ct">No matches for “${esc(q)}”</div><div class="sb-cs" style="margin-top:4px">${window.SB_FULL?'Try a different spelling.':'Try a different spelling — or load the full 128,000-word library below.'}</div><div style="margin-top:12px">${loadBtn}</div></div>`);
  }
  return `<div style="max-width:860px;margin:0 auto">
    ${pageHead('Word Finder','search '+total+' words','Look up any word, study its learn card, and add it to one of your lists.',loadBtn)}
    <div style="position:relative;margin-bottom:14px"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:var(--muted)">${iconSVG('book',18)}</span>
      <input data-inp="finderQ" data-fkey="finderQ" value="${escA(q)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Type a word… e.g. iridescent" style="width:100%;padding:14px 16px 14px 44px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:17px;outline:none"></div>
    ${body}
  </div>`; }
function viewParent(){
  const S=state;
  const sub=S.premium
    ? {ic:'crown',title:'Premium',body:'4 worlds, half the concepts & uncapped levels. Earn coins for the rest.',btn:'Manage',btnStyle:'padding:10px 16px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13px',cardStyle:'background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 16%,var(--bg2)),var(--bg2));border:1px solid var(--accent);border-radius:20px;padding:20px;box-shadow:var(--glow)'}
    : {ic:'spark',title:'Free plan',body:'2 worlds & Level-Up to Level 5. Earn 🪙 coins to unlock more, or go Premium.',btn:'Upgrade',btnStyle:'padding:10px 18px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)',cardStyle:'background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:var(--sh-rest)'};
  const kids=(S.children.length?S.children:[demo()]).map((k,i)=>`<div style="background:var(--bg2);border:1px solid ${i===S.activeIdx?'var(--accent)':'var(--line)'};border-radius:14px;padding:18px">
      <div style="display:flex;align-items:center;gap:13px;margin-bottom:16px"><div style="width:60px;height:60px;border-radius:16px;background:var(--surface2);display:grid;place-items:center">${avatarSVG(k.avatar,44)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:17px">${esc(k.name)}</div><div style="font-size:12px;color:var(--muted);font-weight:600">Age ${k.age} · ${THEME_LABEL[k.theme]||'Bizzing Bee'}</div></div>
        <button data-act="selectChild" data-arg="${i}" style="padding:7px 13px;border-radius:10px;font-weight:800;font-size:12px;${i===S.activeIdx?'background:var(--chip);color:var(--accent)':'background:var(--surface2);color:var(--text)'}">${i===S.activeIdx?'Active':'Switch'}</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
        <div style="background:var(--surface);border-radius:10px;padding:11px;text-align:center" title="${bandTier(beeBand(k).band)} — proven difficulty band across all activities">${(()=>{ const kb=beeBand(k); return `<div style="font-family:var(--display);font-weight:800;font-size:17px">${kb.calibrating?'…':kb.band}</div><div style="font-size:12px;color:var(--muted);font-weight:700">BEE BAND</div>`; })()}</div>
        <div style="background:var(--surface);border-radius:10px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:17px">${k.acc||0}%</div><div style="font-size:12px;color:var(--muted);font-weight:700">ACCURACY</div></div>
        <div style="background:var(--surface);border-radius:10px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:17px">${k.streak||0}</div><div style="font-size:12px;color:var(--muted);font-weight:700">STREAK</div></div>
      </div></div>`).join('');
  const parentBtns=`<button data-act="printReport" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13px;border:1px solid var(--line)">${iconSVG('print',15)} Weekly report</button><button data-act="addChild" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('plus',15)} Add child</button>`;
  const oneThing=(()=>{ try{ const t=parentTips()[0]; if(!t) return '';
    return `<div class="sb-card" style="margin-bottom:16px;background:linear-gradient(100deg,color-mix(in srgb,var(--treasure,#F0B429) 14%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 65%)">
      <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:5px">🌙 Tonight's one thing</div>
      <div style="font-size:14px;line-height:1.55;font-weight:600">${t.text}</div></div>`; }catch(e){ return ''; } })();
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Parent dashboard','',`Track ${esc(active().name||'your speller')}, manage spellers and print a weekly report.`,parentBtns)}
    ${oneThing}
    <div style="${sub.cardStyle}"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="width:46px;height:46px;border-radius:14px;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG(sub.ic,26)}</div>
      <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:17px">${sub.title}</div><div style="font-size:13px;color:var(--muted)">${sub.body}</div></div>
      <button data-act="goPaywall" style="${sub.btnStyle}">${sub.btn}</button></div></div>
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin:20px 2px 12px">Spellers</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">${kids}</div>
    <div style="margin-top:18px">${parentAnalytics()}</div>
    ${parentReviseCard()}
    ${parentActivityCard()}
    ${(()=>{ const rs=state.wordReports||[]; if(!rs.length) return '';
      return `<div class="sb-card" style="margin-top:18px">
        <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:6px"><span style="font-family:var(--display);font-weight:800;font-size:15px">⚑ Reported word fixes</span><span class="sb-cn">${rs.length} flagged by your speller</span>
          <span style="margin-left:auto;display:inline-flex;gap:7px"><button data-act="copyReports" style="padding:7px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--text)">Copy all</button><button data-act="clearReports" style="padding:7px 13px;border-radius:10px;background:transparent;border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--muted)">Clear</button></span></div>
        <div style="display:grid;gap:6px;max-height:220px;overflow-y:auto">${rs.slice().reverse().map(r=>`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:12.5px"><b>${esc(r.w)}</b> — ${esc(r.issue)} <span style="color:var(--muted)">· ${esc(r.when)}</span>${r.d?`<div style="color:var(--muted);margin-top:2px">meaning: ${esc(trunc(r.d,110))}</div>`:''}</div>`).join('')}</div>
        <div class="sb-cn" style="margin-top:8px">The app is fully offline — copy these and share them with us to get the dictionary corrected.</div>
      </div>`; })()}
    <div class="sb-card" style="margin-top:18px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">Countdown</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">${(()=>{ const ms=milestone(); return ms?esc(ms.label):'Your next milestone'; })()}</div>
      ${(()=>{ const ms=milestone(); return ms?`<div style="display:flex;align-items:baseline;gap:10px"><div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent)">${ms.days}</div><div style="font-size:13px;color:var(--muted);font-weight:700">days to ${esc(ms.label)} · ${esc(ms.date)}</div></div>`:`<div style="font-size:13px;color:var(--muted);font-weight:650;line-height:1.5">No milestone set. Add your bee day in <button data-act="setNav" data-arg="settings" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px">Settings</button> to see the countdown.</div>`; })()}
    </div>
  </div>`;
}

const DIFF_DOT={easy:'#1f9d57',medium:'#c08a00',hard:'#d63a3a'};
/* Word Journeys: 10 era-themed unit bands, lesson covers (same generated-cover language as Concepts) */
const UNIT_PAL=[
  {c:'#6A47F5',c2:'#5A37D6',tex:'stripes'}, // 1 Birth of English
  {c:'#D6453A',c2:'#B8322A',tex:'diag'},    // 2 Latin Engine
  {c:'#13A892',c2:'#0E8A78',tex:'rings'},   // 3 Greek Laboratory
  {c:'#2A63D6',c2:'#1E4DB0',tex:'grid'},    // 4 Norman Invasion
  {c:'#E0922E',c2:'#C8791B',tex:'diag'},    // 5 Word Journeys
  {c:'#9B59D0',c2:'#7E3FB8',tex:'cross'},   // 6 Semantic Time Travel
  {c:'#4F9E6A',c2:'#3C8455',tex:'dots'},    // 7 Cognate Web
  {c:'#4A6B8A',c2:'#37506E',tex:'grid'},    // 8 Language Detectives
  {c:'#E8458C',c2:'#CC2E72',tex:'dots'},    // 9 World Vocabulary
  {c:'#C8901B',c2:'#A8760E',tex:'rings'} ]; // 10 Championship
const unitPal=(n)=>UNIT_PAL[((n||1)-1)%UNIT_PAL.length]||UNIT_PAL[0];
function unitCoverBG(n){ const f=unitPal(n); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
const titleCase=(w)=> (w||'').charAt(0).toUpperCase()+(w||'').slice(1).toLowerCase();
const capWords=(s)=> String(s||'').toLowerCase().replace(/\b([a-z])/g,(m,c)=>c.toUpperCase());
function lessonHero(L){ if(L._hero) return L._hero; const ws=(L.words||[]).map(x=>x.w).filter(Boolean);
  let pick=ws[0]||L.id, best=1e9; for(const w of ws){ if(w.length<3) continue; const d=Math.abs(w.length-9)+((w.length>=6&&w.length<=12)?0:5); if(d<best){best=d;pick=w;} }
  const h=titleCase(pick); try{ L._hero=h; }catch(e){} return h; }
function lessonCoverCard(L){
  const dn=lessonComplete(L); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''}; const f=unitPal(L.unit);
  const dc=DIFF_DOT[L.diff]||DIFF_DOT.medium; const hero=lessonHero(L); const nW=(L.words||[]).filter(x=>x&&x.w).length;
  const uname=capWords(u.title); const _dk=state.mode==='dusk'; const cover=`<div style="position:relative;height:110px;display:flex;align-items:center;justify-content:center;padding:14px;overflow:hidden;${unitCoverBG(L.unit)}">${SB_BACKDROP(state.theme,{dark:_dk})}
    <span style="position:absolute;top:10px;left:12px;font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:6px;background:${_dk?'rgba(255,255,255,.14)':'rgba(255,255,255,.92)'};color:${_dk?'#fff':'#241E33'}">${esc(L.id)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${dn?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div class="sb-theme-art" style="position:relative;text-align:center;animation-delay:${(L.n%9)*0.22}s"><div style="font-family:var(--display);color:${_dk?'var(--action,#6C4FE0)':'#FFFFFF'};line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${heroFont(hero)}px">${esc(hero)}</div></div>
  </div>`;
  return `<button class="sb-cover-card" data-act="openLesson" data-arg="${L.n}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(L.title)}</div>
      <div style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c};margin-top:4px">Chapter ${L.unit} · ${esc(trunc(uname,26))}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(L.bigIdea||L.story||'',92)}</div>
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="padding:3px 9px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span><span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${nW} words →</span></div>
    </div>
  </button>`;
}
function lessonBigCard(L){ const dn=lessonComplete(L); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''}; const f=unitPal(L.unit);
  const dc=DIFF_DOT[L.diff]||DIFF_DOT.medium; const hero=lessonHero(L); const nW=(L.words||[]).filter(x=>x&&x.w).length;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--glow)">
    <div style="position:relative;height:150px;display:flex;align-items:center;justify-content:center;padding:18px;${unitCoverBG(L.unit)}">
      <span style="position:absolute;top:14px;left:15px;font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85)">${esc(L.id)} · Chapter ${L.unit}</span>
      <span style="position:absolute;top:15px;right:15px;width:11px;height:11px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
      ${dn?'<span style="position:absolute;bottom:13px;right:14px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
      <div style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.18)"><div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${Math.min(48,heroFont(hero)+8)}px">${esc(hero)}</div></div>
    </div>
    <div style="padding:clamp(18px,4vw,24px)">
      <div style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c};margin-bottom:6px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:clamp(20px,4vw,25px);line-height:1.14;margin-bottom:8px">${esc(L.title)}</div>
      <p style="font-size:15px;line-height:1.6;color:var(--text);margin:0 0 18px">${mdInline(trunc(L.bigIdea||L.story||'',200))}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <span style="padding:4px 11px;border-radius:999px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span>
        <button data-act="openLesson" data-arg="${L.n}" style="padding:12px 20px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Open &amp; study · ${nW} words →</button>
      </div>
    </div>
  </div>`; }
function viewJourneys(){ const S=state; if(S.lessonSel) return viewLesson();
  const all=lessonsAll(); const units=lessonUnits(); const done=lessonsDoneCount();
  const chaptersDone=units.filter(u=>{ const ls=all.filter(L=>L.unit===u.n); return ls.length && ls.every(L=>lessonComplete(L)); }).length;
  const chaptersTotal=units.length||10;
  if(!all.length) return `<div style="max-width:680px;margin:0 auto;padding:60px 0;text-align:center;color:var(--muted);font-weight:700">Lessons are loading…</div>`;
  if(!S.premium){
    return `<div style="max-width:620px;margin:0 auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button></div>
      <div style="background:var(--bg2);border:1px solid var(--accent);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow)">
        <div style="width:64px;height:64px;border-radius:14px;background:var(--chip);color:var(--accent);display:grid;place-items:center;margin:0 auto 14px">${iconSVG('book',32)}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 8px">Word Journeys</h2>
        <p style="color:var(--muted);font-size:15px;line-height:1.6;margin:0 0 18px">A 100‑lesson tour through the history &amp; geography of words — from Proto‑Indo‑European roots to Latin, Greek, Norse and beyond. Learn the stories behind spellings, then drill the words from each lesson.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px">${units.slice(0,5).map(u=>`<span style="padding:5px 11px;border-radius:999px;background:var(--surface2);font-size:12px;font-weight:700;color:var(--muted)">${esc(trunc(u.title,22))}</span>`).join('')}</div>
        <button data-act="goPaywall" style="padding:14px 24px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Unlock with Premium 👑</button>
      </div></div>`;
  }
  const guided=S.journeyView==='guided';
  let main, headDesc, wrapStyle;
  if(guided){
    const N=all.length; const i=Math.min(Math.max(S.journeyPage||0,0),Math.max(0,N-1)); const curL=all[i];
    headDesc='Your guided path — one lesson at a time, in order. Step through, study, and practise.';
    wrapStyle='max-width:680px;margin:0 auto';
    main=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Lesson ${i+1} of ${N}</span><div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round((i+1)/N*100)}%;transition:width .3s"></div></div></div>
      ${lessonBigCard(curL)}
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px"><button data-act="journeyPagePrev" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button><button data-act="journeyPageNext" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'End of the path ✓':'Next lesson →'}</button></div>`;
  } else {
    const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
    headDesc='The history &amp; geography of words, in 10 eras — read a lesson, then practise its five words.';
    wrapStyle='';
    main=units.map(u=>{ const ls=all.filter(L=>L.unit===u.n); if(!ls.length) return '';
      const f=unitPal(u.n); const dc=ls.filter(L=>lessonComplete(L)).length;
      const header=`<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
        <span style="width:10px;height:10px;border-radius:6px;background:${f.c};flex-shrink:0"></span>
        <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:0;color:var(--text)">Chapter ${u.n} · ${esc(capWords(u.title))}</h3>
        <span style="font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap">${dc}/${ls.length} done</span>
        <span style="flex:1;height:1px;background:var(--line)"></span>
      </div>`;
      return header+`<div style="${gridStyle}">${ls.map(lessonCoverCard).join('')}</div>`;
    }).join('');
  }
  const pathBtn=`<button data-act="journeySetView" data-arg="${guided?'all':'guided'}" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${guided?('← Browse all '+iconSVG('grid',15)):('Guided path '+iconSVG('arrow',15))}</button>`;
  return `<div style="${wrapStyle}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">Word Journeys</h2><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${chaptersTotal} chapters</span></div>${pathBtn}</div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:13px;max-width:52em">${headDesc}</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin:12px 0 4px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('book',15)} ${chaptersDone}/${chaptersTotal} chapters</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${Math.round(done)}%;transition:width .4s"></div></div>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${done}%</span>
    </div>
    ${main}</div>`; }
/* ===== Theme Journeys view — pick themes you love; each becomes a staged journey ===== */
function themeCoverBG(cl){ const t=CONCEPT_TEX[cl.tex]||CONCEPT_TEX.stripes;
  return `background-color:${cl.c};background-image:${t[0]},linear-gradient(135deg,${cl.c},${cl.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* Motion per theme — the emblem moves like its subject: birds fly, fish swim, plants grow,
   lightning flashes, the clock ticks, the ship rocks, war shakes, the heart beats… */
const THEME_MOTION={
  body:'m-beat', emotions:'m-beat', kinship:'m-beat', disease:'m-shake', pharmacy:'m-grow',
  animals:'m-fly', birds:'m-fly', insects:'m-fly', marine:'m-swim',
  botany:'m-grow', flowers:'m-grow', farming:'m-grow', ecology:'m-grow',
  chemistry:'m-sparkle', minerals:'m-sparkle', colors:'m-sparkle', festivals:'m-sparkle',
  astronomy:'m-spin', physics:'m-spin', maps:'m-spin', time:'m-tick',
  weather:'m-flash', war:'m-shake',
  music:'m-swing', stage:'m-swing', poetry:'m-swing', law:'m-swing',
  seafaring:'m-rock', waterways:'m-swim', dishes:'m-rock',
  vehicles:'m-drive', sports:'m-drive',
};
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
  };
  return W(M[id]||M.wordwords); }
function themeCard(t){ const c=active(); const cl=themeClusters().find(x=>x.id===t.cluster)||themeClusters()[0];
  const key=themeKey(t.id); const pinned=!!((c.pinnedLists||{})[key]); const st=themeStat(t.id);
  const lvl=listStageIdx(c,key)+1;
  const done=st.total>0 && st.m/st.total>=PATTERN_DONE_PCT;
  return `<div class="sb-cover-card" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${pinned?cl.c:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:104px;display:flex;align-items:center;justify-content:center;padding:12px;${themeCoverBG(cl)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(cl.label)}</span>
      ${done?'<span style="position:absolute;bottom:8px;right:9px;width:21px;height:21px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:12px">✓</span>':''}
      ${pinned?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:12px">MY THEME</span>':''}
      <div class="sb-theme-art ${THEME_MOTION[t.id]||''}" style="animation-delay:${((t.id.length*137)%1800)/1000}s">${themeArtSVG(t.id,58,false)}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(t.label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(t.sub)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:10px">
        <div style="flex:1;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${done?'var(--good)':cl.c};width:${st.pct}%;transition:width .4s"></div></div>
        <span style="font-family:var(--mono);font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">${st.m}/${fmtN(st.total)}</span>
      </div>
      <div style="margin-top:auto;padding-top:11px;display:flex;gap:7px">
        <button data-act="themePractice" data-arg="${t.id}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:10px;background:${cl.c};color:#fff;font-weight:800;font-size:12px;box-shadow:var(--edge)">${iconSVG('pencil',13)} Practice</button>
        <button data-act="addTheme" data-arg="${t.id}" title="${pinned?'In your lists — tap to open in Word Coach':'Add to your lists (top bar in Practice)'}" style="flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 8px;border-radius:10px;font-weight:800;font-size:12px;${pinned?`background:color-mix(in srgb,${cl.c} 13%,var(--bg2));border:1px solid ${cl.c};color:${cl.c}`:'background:var(--surface2);border:1px solid var(--line);color:var(--text)'}">${pinned?('✓ L'+lvl):'+ Add'}</button>
      </div>
    </div>
  </div>`; }
function viewThemes(){ const S=state; const c=active(); ensureLists(c);
  const defs=themeDefs(); const mine=myThemes();
  const mastered=defs.reduce((a,t)=>a+themeStat(t.id).m,0);
  const doneThemes=defs.filter(t=>{ const st=themeStat(t.id); return st.total>0 && st.m/st.total>=PATTERN_DONE_PCT; }).length;
  const myRow = mine.length
    ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px"><span style="font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">My themes</span>${mine.map(t=>{ const cl=themeClusters().find(x=>x.id===t.cluster)||{}; return `<button data-act="selectList" data-arg="${themeKey(t.id)}" oncontextmenu="return sbDelList(event,'${themeKey(t.id)}')" title="Train · right-click to remove" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:10px;border:1px solid ${cl.c};background:color-mix(in srgb,${cl.c} 12%,var(--bg2));color:var(--text);font-weight:800;font-size:12px">${esc(t.label)} <span style="opacity:.7;font-size:12px">L${listStageIdx(c,themeKey(t.id))+1}</span></button>`; }).join('')}</div>`
    : `<div style="background:color-mix(in srgb,var(--accent) 9%,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;font-size:13px;color:var(--text)"><b>Pick 3–5 themes you love.</b> Words stick better when they live somewhere — a kitchen, a courtroom, the night sky. Each theme becomes its own level ladder, and it joins your top bar in Practice.</div>`;
  const grid='display:grid;grid-template-columns:repeat(auto-fill,minmax(224px,1fr));gap:13px';
  const sections=themeClusters().map(cl=>{ const ts=defs.filter(t=>t.cluster===cl.id); if(!ts.length) return '';
    return `<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
      <span style="width:10px;height:10px;border-radius:6px;background:${cl.c};flex-shrink:0"></span>
      <h3 style="font-family:var(--display);font-weight:800;font-size:17px;margin:0;color:var(--text)">${esc(cl.label)}</h3>
      <span style="font-family:var(--mono);font-size:12px;color:var(--muted);white-space:nowrap">${ts.length} themes</span>
      <span style="flex:1;height:1px;background:var(--line)"></span>
    </div><div style="${grid}">${ts.map(themeCard).join('')}</div>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Theme Journeys', defs.length+' themes', 'Learn words by the worlds they live in — medicine, music, maps, mythology… Pick a theme and climb its levels; every word you master counts everywhere else too.')}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('palette',15)} ${mine.length} picked · ${doneThemes} complete</span>
      <span style="font-size:12px;color:var(--muted);font-weight:700">${fmtN(mastered)} themed words mastered</span>
    </div>
    ${myRow}
    ${sections}
  </div>`; }
function viewLesson(){ const S=state; const L=S.lessonSel; const dn=lessonComplete(L); const ws=lessonWordObjs(L);
  const f=unitPal(L.unit); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''};
  // Each of the 5 words as a rich sub-card: word · pronunciation · syllables · meaning · full etymology (every bullet kept).
  const wordCards=ws.map(w=>{ const ety=(w.etyArr&&w.etyArr.length)?w.etyArr:(w.r?[w.r]:[]);
    return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:6px"><span style="font-family:var(--display);font-weight:800;font-size:17px;letter-spacing:.01em">${esc(w.w)}</span>${w.p?`<span style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:700">/ ${esc(w.p)} /</span>`:''}${w.sy&&w.sy.toLowerCase()!==w.w.toLowerCase()?`<span style="font-size:12px;color:var(--muted);font-weight:700">${esc(w.sy)}</span>`:''}${state.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:12px">✓ mastered</span>':''}<button data-act="say" data-arg="${escA(w.w)}" title="Hear it" style="margin-left:auto;color:var(--accent)">${iconSVG('volume',16)}</button></div>
      ${w.d?`<div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:${ety.length?'7':'0'}px">${esc(w.d)}</div>`:''}
      ${ety.length?`<div style="border-top:1px dashed var(--line);padding-top:8px"><div style="font-family:var(--mono);font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:5px">Etymology</div>${ety.map(e=>`<div style="display:flex;gap:7px;font-size:12px;color:var(--muted);line-height:1.55;margin-bottom:4px"><span style="color:${f.c};flex-shrink:0">•</span><span>${mdInline(e)}</span></div>`).join('')}</div>`:''}
    </div>`; }).join('');
  const act=(label,txt)=>txt?`<div style="margin-bottom:10px"><span style="font-weight:800;font-size:13px;color:${f.c}">${label}.</span> <span style="font-size:13px;color:var(--text);line-height:1.55">${mdInline(txt)}</span></div>`:'';
  // Every lesson is a card flow (like Concepts): one section per card, no content dropped.
  const practiceHTML=(L.practice&&(L.practice.decode||L.practice.trace||L.practice.build))?`${act('Decode it',L.practice.decode)}${act('Trace it',L.practice.trace)}${act('Build it',L.practice.build)}`:'';
  const steps=[];
  if(L.bigIdea) steps.push({tag:'Big idea',ic:'bulb',body:`<p style="margin:0;font-size:15px;line-height:1.62;font-weight:600;color:var(--text)">${mdInline(L.bigIdea)}</p>`});
  if(L.story) steps.push({tag:'The story',ic:'book',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.story)}</p>`});
  if(L.pattern) steps.push({tag:'The pattern',ic:'search',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.pattern)}</p>`});
  steps.push({tag:'The five words',ic:'spark',body:`${wordCards}<button data-act="practiseLesson" style="width:100%;margin-top:6px;padding:13px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Practise these 5 words →</button>`});
  if(L.connection) steps.push({tag:'The connection',ic:'link',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.connection)}</p>`});
  if(practiceHTML) steps.push({tag:'Try with a grown-up',ic:'pencil',body:practiceHTML});
  const N=steps.length; const idx=Math.min(Math.max(S.lessonStep||0,0),N-1); const step=steps[idx];
  const dots=steps.map((s,i)=>`<button data-act="lessonStepGo" data-arg="${i}" style="height:7px;border-radius:999px;flex:1;background:${i<=idx?f.c:'var(--surface2)'}" title="${esc(s.tag)}"></button>`).join('');
  const last=idx>=N-1;
  const nextBtn=last
    ? (L.n<100?`<button data-act="openLesson" data-arg="${L.n+1}" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next lesson →</button>`:`<button data-act="lessonBack" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Finish ✓</button>`)
    : `<button data-act="lessonStepNext" style="flex:1;padding:14px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next card →</button>`;
  return `<div style="max-width:660px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><button data-act="lessonBack" style="color:var(--muted);font-weight:700;font-size:13px">← All lessons</button><span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="font-family:var(--mono)">${L.id}</span> · <span style="text-transform:capitalize">${L.diff}</span> <span style="width:9px;height:9px;border-radius:50%;background:${DIFF_DOT[L.diff]}"></span></span></div>
    <div style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c};margin-bottom:3px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.15;margin:0 0 14px">${esc(L.title)}${dn?' <span style="color:var(--good);font-size:17px">✓</span>':''}</h2>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${N}</span><div style="display:flex;gap:5px;flex:1">${dots}</div></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="lessonStepPrev" style="padding:12px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${idx<=0?'opacity:.4;pointer-events:none':''}">← Back</button>${nextBtn}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--glow);animation:sb-rise .3s ease both">
      <div style="height:6px;${unitCoverBG(L.unit)}"></div>
      <div style="padding:clamp(18px,4vw,24px)">
        <div style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:15px;color:${f.c};margin-bottom:12px">${iconSVG(step.ic,18)} ${step.tag}</div>
        ${step.body}
      </div>
    </div>
  </div>`; }
function viewEvoFeedback(){ const S=state; const themes=Object.keys(EV_NOMEN);
  const RC={keep:'var(--good)',tweak:'#E8A33A',redo:'var(--bad)'};
  const reviewed=Object.keys(EVOFB).filter(k=>EVOFB[k]&&(EVOFB[k].rate||EVOFB[k].note)).length;
  let editor='';
  if(S.evoSel){ const parts=S.evoSel.split(':'); const t=parts[0], i=+parts[1]; const nm=(EV_NOMEN[t]||[])[i]||''; const fb=EVOFB[S.evoSel]||{};
    const rbtn=(r,label,col)=>`<button data-act="evoRate" data-arg="${r}" style="flex:1;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;border:2px solid ${fb.rate===r?col:'var(--line)'};background:${fb.rate===r?col:'var(--surface2)'};color:${fb.rate===r?'#fff':'var(--text)'}">${label}</button>`;
    editor=`<div style="position:sticky;top:64px;z-index:5;background:var(--bg2);border:1px solid var(--accent);border-radius:20px;padding:16px;margin-bottom:18px;box-shadow:var(--glow)">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <div style="width:64px;height:68px;flex-shrink:0;background:var(--surface2);border-radius:10px;display:grid;place-items:center">${evEmb(t,i)}</div>
        <div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:17px">${esc(THEME_LABEL[t]||t)} · Lv ${i+1}</div><div style="font-size:13px;color:var(--muted);font-weight:600">“${esc(nm)}”</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">${rbtn('keep','Keep','var(--good)')}${rbtn('tweak','Tweak','#E8A33A')}${rbtn('redo','Redo','var(--bad)')}</div>
      <textarea data-inp="evoNote" data-fkey="evonote" placeholder="What should change? Colour, shape, clarity, vibe, how it reads at small size…" style="width:100%;min-height:64px;resize:vertical;padding:11px 13px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:13px;font-family:var(--body)">${esc(fb.note||'')}</textarea>
      <div style="display:flex;justify-content:flex-end;margin-top:8px"><button data-act="evoClearTile" style="font-size:12px;color:var(--bad);font-weight:700">Clear this tile</button></div>
    </div>`;
  } else { editor=`<div style="background:var(--surface2);border:1px dashed var(--line);border-radius:14px;padding:14px 16px;margin-bottom:18px;font-size:13px;color:var(--muted)">Tap any tile below to rate it (Keep / Tweak / Redo) and add a note. Your feedback saves automatically — hit <b>Export</b> when done.</div>`; }
  const sections=themes.map(t=>{ const tiles=(EV_NOMEN[t]||[]).map((nm,i)=>{ const key=t+':'+i; const fb=EVOFB[key]||{}; const sel=S.evoSel===key;
      const dotCol=fb.rate?RC[fb.rate]:(fb.note?'#E8A33A':null);
      const dot=dotCol?`<span style="position:absolute;top:5px;right:5px;width:9px;height:9px;border-radius:50%;background:${dotCol};box-shadow:0 0 0 2px var(--bg2)"></span>`:'';
      return `<button data-act="evoSelect" data-arg="${key}" style="position:relative;background:var(--bg2);border:2px solid ${sel?'var(--accent)':'var(--line)'};border-radius:10px;padding:8px 4px 6px;display:flex;flex-direction:column;align-items:center;gap:2px">${dot}<div style="width:46px;height:50px;display:grid;place-items:center">${evEmb(t,i)}</div><div style="font-family:var(--mono);font-size:12px;color:var(--muted);font-weight:700">LV ${i+1}</div><div style="font-family:var(--display);font-weight:700;font-size:12px;text-align:center;line-height:1.05">${esc(nm)}</div></button>`; }).join('');
    return `<div style="margin-bottom:18px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:9px;display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border-radius:6px;background:linear-gradient(135deg,${(EV_TC[t]||EV_TC.spellbound).a},${(EV_TC[t]||EV_TC.spellbound).b})"></span>${esc(THEME_LABEL[t]||t)}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px">${tiles}</div></div>`;
  }).join('');
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goSettings" style="color:var(--muted);font-weight:700;font-size:13px">← Settings</button><span style="font-family:var(--display);font-weight:800;font-size:20px">Design feedback</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:10px"><span style="font-size:12px;color:var(--muted);font-weight:700">${reviewed}/80 reviewed</span><button data-act="evoExport" style="padding:9px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">Export →</button></span></div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:13px">All 80 evolution tiles (8 worlds × 10 levels). Give per-tile feedback, then export it.</p>
    ${editor}${sections}
  </div>`; }
function viewSettings(){
  const S=state;
  const themes=THEMES.filter(t=>isThemeUnlocked(t.id)).map(t=>worldHeroCard(t, t.id===S.theme, false, 'pickTheme')).join('');
  const _voices=enVoices();
  const _nat=(n)=>/natural|enhanced|premium|siri|google|neural|online/i.test(n);
  const voiceOpts=['<option value="">Auto · best available</option>'].concat(_voices.map(v=>`<option value="${escA(v.name)}"${VOICE.name===v.name?' selected':''}>${esc(v.name)}${_nat(v.name)?' ✨':''}</option>`)).join('');
  const _pc=active();
  const _avRows=`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(48px,1fr));gap:8px;max-width:380px">${SB_AVATARS.list.filter(a=>avOwned(_pc,a.id)).map(a=>
    `<button data-act="profAvatar" data-arg="${a.id}" title="${a.name}" style="position:relative;aspect-ratio:1;border-radius:12px;display:grid;place-items:center;background:var(--surface2);border:2px solid ${_pc.avatar===a.id?'var(--accent)':'transparent'};padding:4px"><span style="width:48px;height:48px;display:inline-block">${avatarSVG(a.id,48)}</span></button>`).join('')}</div>`+`<div style="margin-top:10px"><button data-act="openCollection" class="sb-cl" style="background:none;border:0;padding:0;cursor:pointer">Collect more in your Collection →</button></div>`;
  const profileCard=`<div class="sb-card" style="margin-bottom:16px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px">Profile</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Pick your own display name and buddy — parents can adjust age, the daily goal and milestones here too.</div>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Display name</label>
      <input data-inp="profName" data-fkey="profName" value="${escA(_pc.name||'')}" maxlength="24" placeholder="e.g. Ahana" autocomplete="off" style="width:100%;max-width:320px;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:700;margin-bottom:14px;outline:none">
      <div style="display:flex;gap:22px;flex-wrap:wrap;margin-bottom:14px">
        <div><label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Age · <b style="color:var(--text)">${_pc.age||9}</b></label>
          <input type="range" min="5" max="18" value="${_pc.age||9}" data-inp="profAge" style="width:200px"></div>
        <div><label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Daily goal</label>
          <div style="display:flex;gap:7px">${[5,10,15].map(g=>`<button data-act="profGoal" data-arg="${g}" style="padding:9px 15px;border-radius:999px;font-weight:800;font-size:13px;${(_pc.goal||10)===g?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${g} words</button>`).join('')}</div></div>
      </div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px">
        <div><label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Milestone <span style="font-weight:600">(optional — e.g. NSF Finals)</span></label>
          <input data-inp="profMsLabel" data-fkey="profMsLabel" value="${escA((_pc.milestone&&_pc.milestone.label)||'')}" maxlength="30" placeholder="e.g. NSF Finals" style="width:200px;padding:11px 13px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:700;outline:none"></div>
        <div><label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Date</label>
          <input type="date" data-chg="profMsDate" value="${escA((_pc.milestone&&_pc.milestone.date)||'')}" style="width:170px;padding:11px 13px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:700;outline:none"></div>
        ${_pc.milestone&&_pc.milestone.date?`<div class="sb-cn" style="padding-bottom:12px">countdown shows in Word Coach & Progress</div>`:''}
      </div>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:8px">Buddy</label>
      ${_avRows}</div>`;
  const voiceCard=`<div class="sb-card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:12px">
        <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Voice</div><div style="font-size:13px;color:var(--muted)">The voice that reads words &amp; sentences aloud</div></div>
        <button data-act="voiceTest" style="padding:11px 18px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge);white-space:nowrap">▶ Test</button>
      </div>
      <div style="position:relative"><select data-chg="voiceSetDevice" style="width:100%;appearance:none;-webkit-appearance:none;padding:13px 36px 13px 14px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px;cursor:pointer">${voiceOpts}</select><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--accent);font-size:12px">▼</span></div>
      <p style="font-size:12px;color:var(--muted);line-height:1.55;margin:12px 0 0">Bizzing Bee picks the smoothest voice your device offers — no account or key, fully offline. Voices marked ✨ are the most natural. ${_voices.length?'':'<b style="color:var(--text)">Voices load a moment after opening</b> — reopen Settings to see the full list. '}</p>
      ${voiceUpgradeTip()}
    </div>`;
  return `<div style="max-width:640px">
    <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 16px">Settings</h2>
    <div class="sb-card" style="margin-bottom:16px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:3px">World</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Each world is a different look and a character that evolves as you level up.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(212px,1fr));gap:11px">${themes}</div>
      ${THEMES.some(t=>!isThemeUnlocked(t.id))?`<button data-act="openShop" class="sb-cl" style="background:none;border:0;padding:10px 0 0;cursor:pointer">🔒 ${THEMES.filter(t=>!isThemeUnlocked(t.id)).length} more worlds to unlock — visit the Store →</button>`:''}
    </div>
    ${profileCard}
    ${voiceCard}
    <div class="sb-card" style="margin-bottom:16px;box-shadow:var(--sh-rest);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Background</div><div style="font-size:13px;color:var(--muted)">Tinted paper or pure white</div></div>
      <div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px"><button data-act="setLight" style="${seg(S.mode==='light')}">Light</button><button data-act="setWhite" style="${seg(S.mode==='white')}">White</button><button data-act="setDusk" style="${seg(S.mode==='dusk')}">Dusk</button></div>
      <div style="display:flex;align-items:center;gap:10px;margin-top:12px"><span style="font-size:13px;font-weight:650;color:var(--muted)">Style</span><div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px"><button data-act="setAgeMode" data-arg="playful" style="${seg((active().ageMode||((active().age||9)<=11?'playful':'focused'))==='playful')}">Playful</button><button data-act="setAgeMode" data-arg="focused" style="${seg((active().ageMode||((active().age||9)<=11?'playful':'focused'))==='focused')}">Focused</button></div><span style="font-size:12px;color:var(--muted)">Playful = buddy everywhere & big celebrations · Focused = calmer, compact</span></div>
    </div>
    <div class="sb-card" style="margin-bottom:16px;box-shadow:var(--sh-rest);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Sound effects</div><div style="font-size:13px;color:var(--muted)">Dings, coins &amp; celebrations during games</div></div>
      <button data-act="toggleSound" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;background:${S.sound?'var(--accent)':'var(--surface2)'};color:${S.sound?'#fff':'var(--muted)'};font-weight:800;font-size:13px">${S.sound?'🔊 On':'🔇 Off'}</button>
    </div>
    <div class="sb-card" style="margin-bottom:16px;box-shadow:var(--sh-rest);display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Text size</div><div style="font-size:13px;color:var(--muted)">Larger text everywhere — easier for young or new readers</div></div>
        <div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px"><button data-act="setTextSize" data-arg="normal" style="${seg((S.textSize||'normal')==='normal')}">Normal</button><button data-act="setTextSize" data-arg="large" style="${seg(S.textSize==='large')}">Large</button></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Voice speed</div><div style="font-size:13px;color:var(--muted)">How fast words &amp; sentences are read aloud</div></div>
        <div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px"><button data-act="setVoiceRate" data-arg="slow" style="${seg((S.voiceRate||1)<1)}">Slow</button><button data-act="setVoiceRate" data-arg="normal" style="${seg((S.voiceRate||1)>=1)}">Normal</button></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap">
        <div><div style="font-family:var(--display);font-weight:800;font-size:15px">Read cards to me</div><div style="font-size:13px;color:var(--muted)">Bizzy reads every vocabulary &amp; idiom card aloud when it flips — great for reading together</div></div>
        <button data-act="toggleReadAloud" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;background:${S.readAloud?'var(--accent)':'var(--surface2)'};color:${S.readAloud?'#fff':'var(--muted)'};font-weight:800;font-size:13px">${S.readAloud?'🐝 On':'Off'}</button>
      </div>
    </div>
    <div class="sb-card" style="margin-bottom:16px;box-shadow:var(--sh-rest);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:15px">🔐 Parent PIN</div><div style="font-size:13px;color:var(--muted)">${pinSet()?'Set — protects Settings, the Parent zone and purchases.':'Add a 4-digit PIN so only grown-ups can open Settings, the Parent zone and Premium.'}</div></div>
      <button data-act="pinSetup" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;background:${pinSet()?'var(--surface2)':'var(--accent)'};color:${pinSet()?'var(--muted)':'#fff'};font-weight:800;font-size:13px;white-space:nowrap">${pinSet()?'Change / remove':'Set PIN'}</button>
    </div>
    ${(S.devReveal||S.devUnlock)?`<div style="background:var(--bg2);border:1px solid ${S.devUnlock?'var(--accent)':'var(--line)'};border-radius:20px;padding:20px;margin-bottom:16px;box-shadow:var(--sh-rest);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div style="min-width:0"><div style="display:inline-flex;align-items:center;gap:7px;font-family:var(--display);font-weight:800;font-size:15px">${iconSVG('lock',16)} Unlock everything <span style="font-family:var(--mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface2);padding:2px 7px;border-radius:999px">testing</span></div><div style="font-size:13px;color:var(--muted)">Unlocks all concepts, lists, worlds &amp; every level — no coins or Premium needed.</div></div>
      <button data-act="toggleDevUnlock" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:10px;background:${S.devUnlock?'var(--accent)':'var(--surface2)'};color:${S.devUnlock?'#fff':'var(--muted)'};font-weight:800;font-size:13px">${S.devUnlock?'🔓 On':'Off'}</button>
    </div>`:''}
    ${state.devUnlock?`<button data-act="openEvoFeedback" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);box-shadow:var(--sh-rest);margin-bottom:16px;color:var(--text)"><div style="text-align:left"><div style="font-family:var(--display);font-weight:800;font-size:15px">Design feedback</div><div style="font-size:12px;color:var(--muted)">Review the 80 evolution tiles &amp; export notes</div></div><span style="color:var(--accent)">${iconSVG('arrow',18)}</span></button>`:''}
    <button data-act="signOut" style="width:100%;padding:14px;border-radius:14px;background:var(--surface2);color:var(--bad);font-weight:800;font-size:15px">Sign out</button>
    <button data-act="devTap" style="display:block;width:100%;text-align:center;background:none;border:0;cursor:default;margin-top:14px;font-size:11.5px;color:var(--muted);font-weight:650">Bizzing Bee · made with 🐝 for spellers</button>
  </div>`;
}

/* ===================== WORD COACH ===================== */
const FREE_LISTS = { default:1, review:1, missed:1, custom:1, ai:1, journey:1, nsf500:1 };
function isPremiumList(key){ if(isThemeKey(key)) return false; if(String(key).startsWith('built_')) return false; return !FREE_LISTS[key]; }
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
function coachTrain(){
  const S=state; const c=active(); ensureLists(c); const theme=S.theme; const key=c.activeList||'default';
  const ws=ensureCoachWords(key);
  const fullList=listWords(key); const isJourney = key==='journey';
  const stages = listStages(key); const sIdx = listStageIdx(c,key); const stage=stages[sIdx]||{n:1,words:fullList,label:'',champ:true};
  const uiLevel = sIdx+1; const fIdx=journeyFormIdx(uiLevel); const form=(EVO[theme]||EVO.spellbound)[fIdx];
  const stageM=stage.words.filter(w=>state.luMastered[nkey(w.w)]).length; const stagePct=stage.words.length?Math.round(stageM/stage.words.length*100):0;
  const stageDone=stageComplete(c,key); const lastStage=sIdx>=stages.length-1;
  const nextIsLibrary = isJourney && stage.n>=CHAMP_LEVELS;      // advancing from here enters/continues the Library
  const libLocked = nextIsLibrary && !state.premium;
  // ---- List Dock: one clear "now training" tile + visual switching; pause/remove live in a ⋯ menu ----
  const dockLabel=(k)=> k==='journey'?'Bizzing Bee Journey':listLabel(k).split(' · ')[0];
  const CORE_LISTS={journey:1,review:1,missed:1}; const pinned=c.pinnedLists||{}; const pausedL=c.pausedLists||{};
  let extras=Object.keys(pinned).filter(k=>!CORE_LISTS[k] && pinned[k]);   // only lists the user has added
  if(!CORE_LISTS[key] && !extras.includes(key)) extras.push(key);           // always show the one being trained
  let dockKeys=['journey', ...extras, 'review','missed'].filter((k,i,a)=>a.indexOf(k)===i);
  const pausedKeys=dockKeys.filter(k=>pausedL[k] && k!==key);
  const liveKeys=dockKeys.filter(k=>!pausedL[k] || k===key);
  const DOCK_PAL=['#7C5CFF','#E0922E','#DC5B7E','#13A892','#3D7DF0','#B14FC4','#4F9E6A','#F0703C'];
  const dockColor=(k)=>{ if(k==='journey') return '#7C5CFF'; if(k==='review') return '#E0922E'; if(k==='missed') return '#DC5B7E';
    if(isThemeKey(k)){ try{ const t=themeOf(k.slice(3)); const cl=themeClusters().find(x=>x.id===t.cluster); if(cl&&cl.c) return cl.c; }catch(e){} }
    if(String(k).startsWith('built_')) return '#13A892';
    let h=0; for(const ch2 of String(k)) h=(h*31+ch2.charCodeAt(0))>>>0; return DOCK_PAL[h%DOCK_PAL.length]; };
  const bigC=dockColor(key);
  const bigTile=`<div style="flex:1.5;min-width:220px;display:flex;align-items:center;gap:13px;padding:14px 16px;border-radius:14px;background:linear-gradient(135deg,${bigC},color-mix(in srgb,${bigC} 74%,#1c1030 26%));color:#fff;box-shadow:0 6px 16px color-mix(in srgb,${bigC} 32%,transparent);animation:sb-pop .35s ease both">
      <div style="width:54px;height:54px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:conic-gradient(#fff ${stagePct}%,rgba(255,255,255,.25) 0)"><div style="width:41px;height:41px;border-radius:50%;background:color-mix(in srgb,${bigC} 82%,#1c1030 18%);display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:12px">${stagePct}%</div></div>
      <div style="min-width:0"><div style="font-family:var(--mono);font-size:12px;letter-spacing:.11em;text-transform:uppercase;opacity:.85;font-weight:700">Now training</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.12;text-shadow:0 1px 4px rgba(0,0,0,.16)">${esc(dockLabel(key))}</div>
        <div style="font-size:12px;font-weight:700;opacity:.92">${isJourney?(stage.champ!==false&&sIdx<CHAMP_LEVELS?('Level '+(sIdx+1)+' of '+CHAMP_LEVELS+' to Champ'):('Champion’s Library · '+esc(stage.label||('Library '+(sIdx+1-CHAMP_LEVELS))))):('Level '+(sIdx+1)+' of '+stages.length)} · ${stageM}/${stage.words.length} mastered this Level</div></div></div>`;
  const smallTiles=liveKeys.filter(k=>k!==key).map(k=>{ const cc=dockColor(k); const open=S.dockMenu===k;
    return `<div style="position:relative;display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
      <button data-act="selectList" data-arg="${escA(k)}" title="Switch to this list" style="display:flex;align-items:center;gap:9px;min-width:0;flex:1;text-align:left">
        <span style="width:27px;height:27px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,${cc},color-mix(in srgb,${cc} 70%,#1c1030 30%))"></span>
        <span style="min-width:0"><span style="display:block;font-weight:800;font-size:12px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(dockLabel(k))}</span><span style="font-size:12px;color:var(--muted);font-weight:700">Level ${listStageIdx(c,k)+1}</span></span></button>
      <button data-act="dockMenu" data-arg="${escA(k)}" aria-label="List options" style="flex-shrink:0;width:26px;height:26px;border-radius:6px;color:var(--muted);display:grid;place-items:center;background:${open?'var(--surface2)':'transparent'};font-weight:800;font-size:15px;line-height:1">⋯</button>
      ${open?`<div style="position:absolute;top:calc(100% + 4px);right:4px;z-index:40;background:var(--bg2);border:1px solid var(--line);border-radius:10px;box-shadow:var(--sh-overlay);padding:6px;min-width:170px;animation:sb-pop .18s ease both">
        <button data-act="pauseList" data-arg="${escA(k)}" style="display:flex;align-items:baseline;gap:7px;width:100%;text-align:left;padding:8px 10px;border-radius:6px;font-weight:800;font-size:12px;color:var(--text)">${SB_ICON('pause',{size:16})} Pause <span style="color:var(--muted);font-weight:600;font-size:12px">keeps progress</span></button>
        ${CORE_LISTS[k]?'':`<button data-act="dockRemove" data-arg="${escA(k)}" style="display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:8px 10px;border-radius:6px;font-weight:800;font-size:12px;color:var(--bad)">${SB_ICON('x',{size:16})} Remove <span style="color:var(--muted);font-weight:600;font-size:12px">re-add from Setup</span></button>`}
      </div>`:''}
    </div>`; }).join('');
  const pausedShelf=pausedKeys.length?`<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)"><span style="font-family:var(--mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700">Paused</span>${pausedKeys.map(k=>`<button data-act="resumeList" data-arg="${escA(k)}" title="Tap to resume training this list" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;border:1px dashed var(--line);background:transparent;color:var(--muted);font-weight:700;font-size:12px">${SB_ICON('play',{size:14})} ${esc(dockLabel(k))} <span style="font-size:12px">L${listStageIdx(c,k)+1}</span></button>`).join('')}</div>`:'';
  const addBtn=`<button data-act="coachSetupOpen" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px dashed var(--line);background:transparent;color:var(--accent)">+ Add list</button>`;
  const topBar=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button><span style="font-family:var(--display);font-weight:800;font-size:20px;margin-left:4px">Word Coach</span><button data-act="openQuestChooser" title="Change your quest path" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('steps',13)} Quest path</button>${(()=>{ const n=missTraps().length; return `<button data-act="openTraps" title="Your weak patterns" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${n?'var(--fix-tint,#FBE9E7)':'var(--surface2)'};border:1px solid ${n?'var(--fix,#C4453C)':'var(--line)'};color:${n?'var(--fix,#C4453C)':'var(--muted)'};font-weight:800;font-size:12px">${iconSVG('target',13)} Traps${n?' · '+n:''}</button>`; })()}${(()=>{ const ms=milestone(); return ms?`<span style="margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('target',14)} ${ms.days} days to ${esc(ms.label)}</span>`:''; })()}</div>`;
  const allWordsBtn=`<button data-act="luToggleWords" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid ${S.luWordsOpen?'var(--accent)':'var(--line)'};background:var(--surface2);color:var(--text)">${iconSVG('grid',14)} All words <span style="color:var(--muted);font-weight:700">${fullList.length}</span> ${S.luWordsOpen?'▴':'▾'}</button>`;
  const newSetBtn = fullList.length>WORK_MAX ? `<button data-act="newBatch" title="Swap in a fresh set of words from this list" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid var(--line);background:var(--surface2);color:var(--text)">${SB_ICON('retry',{size:16})} New set</button>` : '';
  const chipsRow=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:12px">
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:stretch">${bigTile}<div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:7px;justify-content:center">${smallTiles||'<div style="font-size:12px;color:var(--muted);font-weight:600;padding:4px 2px">Add another list to switch between quests — each keeps its own Level ladder.</div>'}</div></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${addBtn}${allWordsBtn}${newSetBtn}</div>
    ${pausedShelf}
  </div>`;
  const allWordsPanel = S.luWordsOpen ? (()=>{ const cap=400; const shown=fullList.slice(0,cap);
    const curK=(S.luTab==='practice'&&state.status==='idle')?nkey((curWord()||{}).w||''):'';
    const cells=shown.map(w=>{ const hide=curK&&nkey(w.w)===curK;
      return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:10px 12px"><div style="display:flex;align-items:center;gap:6px"><span style="font-family:var(--display);font-weight:800;font-size:13px">${hide?'•••':esc(w.w)}</span>${state.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:12px">✓</span>':''}<button data-act="say" data-arg="${escA(w.w)}" style="margin-left:auto;color:var(--accent)">${iconSVG('volume',14)}</button></div>${w.d?`<div style="font-size:12px;color:var(--muted);line-height:1.4;margin-top:3px">${esc(trunc(hide?maskTxt(w.d,w.w):w.d,90))}</div>`:''}</div>`; }).join('');
    return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px;animation:sb-rise .3s ease both"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Level ${stage.n} words · ${esc(listLabel(key).split(' · ')[0])} · ${fullList.length}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;max-height:360px;overflow-y:auto">${cells}</div>${fullList.length>cap?`<div style="font-size:12px;color:var(--muted);margin-top:8px">Showing the first ${cap} of ${fullList.length}.</div>`:''}</div>`; })() : '';
  const titleRow = (S.renameKey===key)
    ? `<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px"><input data-inp="renameInput" data-fkey="renameInp" value="${escA(S.renameVal)}" maxlength="40" placeholder="List name" style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--accent);border-radius:10px;padding:8px 11px;font-size:15px;font-weight:800;color:var(--text);font-family:var(--display)"><button data-act="saveRename" style="padding:8px 13px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Save</button><button data-act="cancelRename" style="padding:8px 11px;border-radius:10px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:13px">✕</button></div>`
    : `<div style="display:inline-flex;align-items:center;gap:8px;min-width:0"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(listLabel(key))}</span><button data-act="startRename" data-arg="${escA(key)}" title="Rename this list" style="color:var(--muted);display:inline-flex">${iconSVG('pencil',15)}</button><span style="font-size:13px;color:var(--muted);font-weight:700;white-space:nowrap">· Level ${uiLevel}</span></div>`;
  const printDlg = S.printOpen ? (()=>{ const p=(S.prn&&S.prn.inc)?S.prn:{inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
    const pbtn=(g,v,l)=>`<button data-act="printSet" data-arg="${g}:${v}" style="padding:9px 13px;border-radius:10px;font-weight:800;font-size:12px;border:1px solid ${p[g]===v?'var(--accent)':'var(--line)'};${p[g]===v?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${l}</button>`;
    const tbtn=(v,l)=>`<button data-act="printSet" data-arg="inc:${v}" style="padding:9px 13px;border-radius:10px;font-weight:800;font-size:12px;border:1px solid ${p.inc[v]?'var(--accent)':'var(--line)'};${p.inc[v]?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${p.inc[v]?'✓ ':''}${l}</button>`;
    const prow=(t,btns)=>`<div style="margin-bottom:13px"><div style="font-size:12px;color:var(--muted);font-weight:800;margin-bottom:7px">${t}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${btns}</div></div>`;
    const nWords=(p.scope==='level'?listWords(key):listFullWords(key)).length;
    return `<div style="position:fixed;inset:0;z-index:90;background:rgba(20,12,50,.45);display:grid;place-items:center;padding:18px" data-act="printClose">
      <div data-act="noop" style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:22px;max-width:430px;width:100%;box-shadow:var(--sh-overlay);cursor:default">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:4px"><span style="display:inline-flex;color:var(--action)">${SB_ICON('printer',{size:20})}</span><span style="font-family:var(--display);font-weight:800;font-size:17px">Print word list</span><button data-act="printClose" style="margin-left:auto;color:var(--muted);font-weight:800">✕</button></div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 15px">${esc(listLabel(key).split(' · ')[0])} — opens a clean page you can print or save as PDF.</p>
        ${prow('What to include — pick one, two or three',[tbtn('w','Words'),tbtn('p','Pronunciations'),tbtn('d','Meanings')].join('')+(p.inc.w?'':'<div style="flex-basis:100%;font-size:11.5px;color:var(--muted);font-weight:650;margin-top:2px">No words = a quiz sheet — each row gets a blank line to write on.</div>'))}
        ${prow('Sort by',[['level','Level order'],['alpha','A → Z'],['diff','Easiest → hardest']].map(([v,l])=>pbtn('sort',v,l)).join(''))}
        ${prow('Text size',[['normal','Normal'],['compact','Compact — less paper']].map(([v,l])=>pbtn('size',v,l)).join(''))}
        ${prow('Page size',[['letter','Letter'],['a4','A4'],['a5','A5']].map(([v,l])=>pbtn('page',v,l)).join(''))}
        ${prow('What scope',[['level','Words in play · '+listWords(key).length],['all','Entire word list · '+listFullWords(key).length]].map(([v,l])=>pbtn('scope',v,l)).join(''))}
        <button data-act="printGo" style="width:100%;padding:13px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Print ${nWords} words →</button>
      </div></div>`; })() : '';
  // ---- one Level header (Word→Set→Level→Champ→Library) ----
  const levelHeadline = isJourney
    ? (stage.champ ? ('Level '+stage.n+' of '+CHAMP_LEVELS+' to Champ') : ('Champion\'s Library · '+esc(stage.label)))
    : ('Level '+stage.n+' of '+stages.length);
  const levelTag = isJourney
    ? (stage.champ ? `<span style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--accent)">BIZZING BEE CHAMP</span>` : `<span style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.08em;color:#C8901B">★ CHAMP · LIBRARY</span>`)
    : `<span style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)">${esc(listLabel(key).split(' · ')[0]).toUpperCase()}</span>`;
  const advanceTo = isJourney ? (nextIsLibrary ? ('Library '+(stage.n-CHAMP_LEVELS+1)) : ('Level '+(stage.n+1))) : ('Level '+(stage.n+1));
  let advanceHTML;
  if(lastStage && stageDone){ advanceHTML=`<div style="margin-top:10px;font-size:12px;color:var(--good);font-weight:800">🏆 Every level cleared — legendary!</div>`; }
  else if(stageDone && libLocked){ advanceHTML=`<div style="margin-top:11px;background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:11px 13px"><div style="font-weight:800;font-size:13px;margin-bottom:3px">🏆 You're a Bizzing Bee Champ!</div><div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:9px">The Champion's Library — the other ${fmtN(journeyTotal()-champWordCount())} words — is Premium.</div><button data-act="goPaywall" style="padding:9px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Unlock the Library 👑</button></div>`; }
  else if(stageDone){ advanceHTML=`<button data-act="advanceStage" data-arg="${escA(key)}" style="margin-top:11px;width:100%;padding:12px;border-radius:10px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Level ${stage.n} cleared! Go to ${advanceTo} →</button><button data-act="openChallenge" data-arg="${escA(key)}" style="margin-top:8px;width:100%;padding:11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:13px">⚡ Take the Level ${stage.n} Challenge</button>`; }
  else { advanceHTML=`<div style="margin-top:11px"><button data-act="openChallenge" data-arg="${escA(key)}" style="width:100%;padding:12px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">⚡ Take the Level ${stage.n} Challenge</button></div><div style="margin-top:8px;font-size:12px;color:var(--muted);line-height:1.5">Master all ${stage.words.length} words to level up — or pass the Challenge to test out early.</div>`; }
  const tracker = isJourney
    ? `<div style="display:flex;gap:3px;margin-top:11px">${Array.from({length:CHAMP_LEVELS},(_,i)=>`<span style="flex:1;height:5px;border-radius:999px;background:${(uiLevel>i+1||(uiLevel===i+1&&stageDone))?'var(--good)':(uiLevel===i+1?'var(--accent)':'var(--line)')}"></span>`).join('')}</div><div style="font-size:12px;color:var(--muted);margin-top:5px">20 levels to Bizzing Bee Champ${uiLevel>CHAMP_LEVELS?' ✓ — now exploring the Library':''}</div>`
    : `<div style="display:flex;gap:4px;margin-top:11px">${stages.map((s,i)=>`<span style="flex:1;height:5px;border-radius:999px;background:${(i<sIdx||(i===sIdx&&stageDone))?'var(--good)':(i===sIdx?'var(--accent)':'var(--line)')}"></span>`).join('')}</div>`;
  const libMeter = isJourney ? `<div style="margin-top:11px;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:7px"><span style="font-weight:800;color:var(--text)">Library explored</span> ${fmtN(journeyMastered(c))} / ${fmtN(journeyTotal())} words mastered</div>` : '';
  const levelBlock=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">${titleRow}<div style="font-size:12px;color:var(--muted);font-weight:700">You're <b style="color:var(--text)">${form}</b></div></div>
      <div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:3px">${levelTag}<span style="font-size:12px;color:var(--muted);font-weight:700">${stageM}/${stage.words.length} mastered</span></div>
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:8px">${levelHeadline}</div>
        <div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:9px;border-radius:999px;background:var(--bg2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${stageDone?'var(--good)':'var(--accent)'};width:${stagePct}%;transition:width .4s"></div></div><span style="font-size:12px;color:var(--muted);font-weight:800">${stagePct}%</span></div>
        ${advanceHTML}
      </div>
      <div style="overflow-x:auto;padding:2px 0"><div style="min-width:760px">${evoLadderHTML(theme, fIdx)}</div></div>
    </div>`;
  const tab=(k,l)=>`<button data-act="luSetTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:10px;font-weight:800;font-size:13px;${S.luTab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const body = S.luTab==='practice' ? trainerCard() : wordFlash(ws, S.reviseIdx, 'reviseNav', {});
  const act=(a,ic,t,d)=>`<button data-act="${a}" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px"><span style="color:var(--accent)">${iconSVG(ic,18)}</span><span style="font-family:var(--display);font-weight:800;font-size:13px">${t}</span><span style="font-size:12px;color:var(--muted)">${d}</span></button>`;
  const actions=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:16px">${act('startBuzz','flame','Daily Buzz','Quick mixed round')}${act('startWritten','pencil','Written round','Type a sequence, scored')}${act('startOral','volume','Oral elimination','Spell aloud, survive')}${act('coachSetupOpen','gear','Setup &amp; lists','Date, goal, choose lists')}</div>`;
  const journeyPromo = (key!=='journey' && (getList(c,'journey').stage||0)===0) ? `<button data-act="startJourney" style="width:100%;text-align:left;border-radius:14px;margin-top:16px;overflow:hidden;${listCoverBG('journey')};box-shadow:0 4px 14px rgba(43,27,94,.16)"><div style="padding:13px 16px;color:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">★ Recommended path</div><div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.15">The Bizzing Bee Journey — 20 Levels to Champ</div></div><span style="padding:8px 14px;border-radius:10px;background:#fff;color:${listCoverOf('journey').c};font-weight:800;font-size:13px;white-space:nowrap">Start →</span></div></button>` : '';
  return `<div style="max-width:760px;margin:0 auto">${printDlg}${topBar}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:14px;padding:5px;margin-bottom:16px">${tab('revise','Learn')}${tab('practice','Practice')}</div>
    ${body}
    ${liveHeatmap(ws, {anon:S.luTab==='practice', print:true})}
    ${chipsRow}${allWordsPanel}
    ${levelBlock}
    ${journeyPromo}
    ${actions}</div>`;
}
const LIST_COVER={
  journey    :{c:'#6A47F5',c2:'#4F2FC8',tex:'rings',hero:'40k',tag:'1-Year Path'},
  default    :{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes',hero:'Aa',tag:'Starter'},
  review     :{c:'#E0922E',c2:'#C8791B',tex:'diag',hero:'Review',tag:'Curated'},
  missed     :{c:'#D6453A',c2:'#B8322A',tex:'dots',hero:'Misses',tag:'Yours'},
  likely     :{c:'#3D7DF0',c2:'#2A63D6',tex:'grid',hero:'Likely',tag:'Ranked'},
  nsf_finals :{c:'#C8901B',c2:'#A8760E',tex:'rings',hero:'Finals',tag:'NSF'},
  nsf_primary:{c:'#4F9E6A',c2:'#3C8455',tex:'grid',hero:'Primary',tag:'NSF'},
  nsf_junior :{c:'#13A892',c2:'#0E8A78',tex:'grid',hero:'Junior',tag:'NSF'},
  nsf500     :{c:'#E0922E',c2:'#B26E12',tex:'rings',hero:'500',tag:'Finals'},
  nsf_senior :{c:'#3D7DF0',c2:'#2A63D6',tex:'grid',hero:'Senior',tag:'NSF'},
  nsf_advanced:{c:'#7B52E0',c2:'#5E39C4',tex:'grid',hero:'Advanced',tag:'NSF'},
  nsf        :{c:'#C8901B',c2:'#A8760E',tex:'rings',hero:'Champs',tag:'Library'},
  all        :{c:'#7B52E0',c2:'#5E39C4',tex:'cross',hero:'128k',tag:'Everything'},
  hardest    :{c:'#D6453A',c2:'#B8322A',tex:'cross',hero:'Tough',tag:'Tier 6+'},
  latin      :{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes',hero:'Latin',tag:'Origin'},
  greek      :{c:'#13A892',c2:'#0E8A78',tex:'rings',hero:'Greek',tag:'Origin'},
  french     :{c:'#E8458C',c2:'#CC2E72',tex:'dots',hero:'French',tag:'Origin'},
  oe         :{c:'#4F9E6A',c2:'#3C8455',tex:'stripes',hero:'Old Eng',tag:'Origin'},
  norse      :{c:'#3D7DF0',c2:'#2A63D6',tex:'grid',hero:'Norse',tag:'Origin'},
  spanish    :{c:'#E0922E',c2:'#C8791B',tex:'diag',hero:'Spanish',tag:'Origin'},
  italian    :{c:'#D6453A',c2:'#B8322A',tex:'diag',hero:'Italian',tag:'Origin'},
  german     :{c:'#4A6B8A',c2:'#37506E',tex:'grid',hero:'German',tag:'Origin'},
  arabic     :{c:'#C8901B',c2:'#A8760E',tex:'rings',hero:'Arabic',tag:'Origin'},
  japanese   :{c:'#F0703C',c2:'#D85A29',tex:'rings',hero:'Japanese',tag:'Origin'},
  hindi      :{c:'#9B59D0',c2:'#7E3FB8',tex:'cross',hero:'Hindi',tag:'Origin'},
  custom     :{c:'#13A892',c2:'#0E8A78',tex:'rings',hero:'Custom',tag:'Yours'},
  ai         :{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes',hero:'AI',tag:'Smart'} };
const listCoverOf=(k)=>LIST_COVER[k]||{c:'#4F9E6A',c2:'#3C8455',tex:'stripes',hero:'List',tag:'Words'};
function listCoverBG(k){ const f=listCoverOf(k); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
function listCoverCard(k,label,sub,count,locked){ const c=active(); const on=(c.activeList||'default')===k; const f=listCoverOf(k); const act=locked?'buyList':'selectList';
  const lvl=(getList(c,k).stage||0)+1;
  const stMeta = (k==='journey') ? (' · Level '+(listStageIdx(c,'journey')+1)) : ((on && !locked) ? (' · Level '+(listStageIdx(c,k)+1)+'/'+listStages(k).length) : '');
  return `<button class="sb-cover-card" data-act="${act}" data-arg="${k}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${on?f.c:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:88px;display:flex;align-items:center;justify-content:center;padding:12px;${listCoverBG(k)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--mono);font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(f.tag)}</span>
      ${on?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:12px">ACTIVE</span>':''}
      <div class="sb-theme-art" style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16);animation-delay:${(k.length%9)*0.22}s">${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',34,2)}</div>`:`<div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-weight:800;font-size:${heroFont(f.hero)}px">${esc(f.hero)}</div>`}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(trunc(sub,64))}</div>
      <div style="margin-top:auto;padding-top:11px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-family:var(--mono);font-size:12px;color:var(--muted);font-weight:700">${count} words · L${lvl}${stMeta}</span>
        <span style="display:inline-flex;align-items:center;gap:4px;font-family:var(--body);font-weight:800;font-size:12px;color:${on?f.c:(locked?'#a06a00':f.c)};white-space:nowrap">${on?'Training':(locked?(iconSVG('lock',11,2.2)+' '+coinAmt(COST.list,11)):'Choose →')}</span>
      </div>
    </div>
  </button>`; }
function coachSetup(){
  const S=state; const c=active();
  const coverGrid='display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px';
  const defCard=listCoverCard('default','Default · Level-Up','A 20-stage journey, growing tougher as you climb',curStage(c,'default').words.length,false);
  const others=coachCatalog().filter(o=>o.key!=='default').map(o=>listCoverCard(o.key,o.label,o.sub,o.count, !isListUnlocked(o.key))).join('');
  const jc=listCoverOf('journey'); const jLvl=(getList(c,'journey').stage||0)+1; const jMast=journeyMastered(c);
  const jChampPct=Math.round(Math.min(1,(getList(c,'journey').stage||0)/CHAMP_LEVELS)*100); const jStarted=(getList(c,'journey').stage||0)>0 || jMast>0;
  const champLabel = jLvl>CHAMP_LEVELS ? 'Bizzing Bee Champ 🏆 · exploring the Library' : ('Level '+Math.min(jLvl,CHAMP_LEVELS)+' of '+CHAMP_LEVELS+' to Champ');
  const journeyBanner=`<button data-act="startJourney" style="position:relative;overflow:hidden;text-align:left;width:100%;border-radius:20px;margin-bottom:16px;${listCoverBG('journey')};box-shadow:0 8px 22px rgba(43,27,94,.18)">
    <div style="padding:18px 20px;color:#fff">
      <span style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">${(active().activeList||'default')==='journey'?'Your path':'★ Recommended path'}</span>
      <div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.1;margin:6px 0 4px">The Bizzing Bee Journey</div>
      <div style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.5;margin-bottom:12px;max-width:46em">Climb <b>20 Levels</b> through the ~${fmtN(champWordCount())} highest-value bee words to become a <b>Bizzing Bee Champ</b> — then unlock the full ${fmtN(journeyTotal())}-word Library. Words → Set of 24 → Level → Champ.</div>
      <div style="height:8px;border-radius:999px;background:rgba(255,255,255,.25);overflow:hidden;margin-bottom:9px"><div style="height:100%;width:${jChampPct}%;background:#fff"></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span style="font-size:12px;font-weight:800;color:rgba(255,255,255,.92)">${champLabel} · ${fmtN(jMast)} mastered</span><span style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:#fff;color:${jc.c};font-weight:800;font-size:13px">${jStarted?'Continue':'Start the Journey'} →</span></div>
    </div></button>`;
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><button data-act="openCoach" style="color:var(--muted);font-weight:700;font-size:13px">← Back to Word Coach</button></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 4px">Setup &amp; lists</h2>
    <p style="margin:0 0 16px;color:var(--muted);font-size:13px">Pick the list you're training — each keeps its own level.${state.premium?'':' 🔒 lists unlock with Premium <b>or</b> 🪙 '+COST.list+' coins from playing.'}</p>
    ${journeyBanner}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:14px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div style="flex:1;min-width:150px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Bee day</label><input data-chg="setCoachDate" type="date" value="${escA(S.coachDate||'')}" style="width:100%;padding:11px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px"></div><div style="width:120px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Daily goal</label><input data-chg="setCoachGoal" value="${escA(S.coachGoal)}" style="width:100%;padding:11px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px"></div></div>
      <div style="font-size:12px;color:var(--muted);margin-top:8px">The daily goal is a target, not a limit — keep going as long as you like.</div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:12px">Choose a list</div><div style="${coverGrid}">${defCard}${others}</div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:16px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px;display:flex;align-items:center;gap:8px"><span style="color:var(--accent)">${iconSVG('upload',18)}</span> Bring your own words</div><p style="font-size:12px;color:var(--muted);margin:0 0 10px">Paste words (commas or new lines) — we enrich them from the database.</p>
      <textarea data-inp="setCustomText" data-fkey="customText" placeholder="silhouette, bouquet, mnemonic" style="width:100%;min-height:74px;resize:vertical;padding:12px 13px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:13px;margin-bottom:10px;font-family:var(--body)">${esc(S.customText)}</textarea>
      <button data-act="enrichCustom" style="width:100%;padding:12px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;border:1px solid var(--line)">Enrich &amp; train these →</button></div>
  </div>`;
}
function viewCoach(){
  const S=state;
  if(S.coachMode==='written') return coachWritten();
  if(S.coachMode==='wrdone') return coachWrDone();
  if(S.coachMode==='oral') return coachOral();
  if(S.coachMode==='orgone') return coachOrGone();
  if(S.coachMode==='setup') return coachSetup();
  if(S.coachMode==='challenge') return S.game ? (S.game.status==='done'?champDone():typedGame()) : challengeConfig();
  return coachTrain();
}
function infoChip(on,label,act){ return `<button data-act="${act}" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid ${on?'var(--accent)':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:transparent;color:var(--text)'}">${label}</button>`; }
function coachWritten(){
  const S=state; const wr=S.wr; let infoHTML=''; if(wr){ const w=wr.list[wr.i]; if(S.wrInfoKey==='def') infoHTML='Meaning — '+blankHTML(w.d||'—',w.w); else if(S.wrInfoKey==='sent') infoHTML='Sentence — '+blankHTML(w.s||'—',w.w); else if(S.wrInfoKey==='orig') infoHTML='Origin — '+esc(w.o||'—')+(w.r?('. '+esc(w.r)):''); }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">Written round · Word ${wr.i+1}/${wr.list.length}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div>
    <div style="height:7px;border-radius:999px;background:var(--surface2);overflow:hidden;margin-bottom:22px"><div style="height:100%;background:var(--accent);border-radius:999px;width:${Math.round(wr.i/wr.list.length*100)}%;transition:width .4s"></div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">Listen and type — no answer shown till the end</p>
      <button data-act="wrSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:16px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px"><button data-act="wrSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${infoChip(S.wrInfoKey==='def','Definition','wrInfoDef')}${infoChip(S.wrInfoKey==='sent','Sentence','wrInfoSent')}${infoChip(S.wrInfoKey==='orig','Origin','wrInfoOrig')}</div>
      ${S.wrInfoKey?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:15px;line-height:1.6;margin-bottom:16px">${infoHTML}</div>`:''}
      <input data-inp="onType" data-key="wrKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="type here" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:16px">
      <button data-act="wrNext" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${(wr.i+1<wr.list.length)?'Next word →':'Finish & score →'}</button>
    </div>
  </div>`;
}
function coachWrDone(){
  const S=state; const wr=S.wr; const ok=wr.ans.filter(a=>a.ok).length, total=wr.ans.length||1, pct=Math.round(ok/total*100);
  const rows=wr.ans.map(a=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:10px;background:${a.ok?'color-mix(in srgb,#1f9d57 13%,transparent)':'color-mix(in srgb,var(--bad) 13%,transparent)'}"><span style="font-weight:800">${esc(a.w.w)}</span><span style="font-family:var(--mono);font-size:13px">${a.ok?'✓':(esc(a.val||'(blank)')+' ✗')}</span></div>`).join('');
  return `<div style="max-width:680px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px">${pct>=80?'Strong round! 🏆':pct>=60?'Good effort 💪':'Keep training 🌱'}</h2><div style="font-family:var(--display);font-weight:800;font-size:48px;color:var(--accent);line-height:1">${pct}%</div><p style="color:var(--muted);font-weight:700;margin-top:6px">${ok} of ${wr.ans.length} correct</p></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Round results</div><div style="display:flex;flex-direction:column;gap:7px">${rows}</div></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="coachWeakDrill" style="padding:13px 18px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Drill the misses →</button></div>
  </div>`;
}
function coachOral(){
  const S=state; const or=S.or; let infoHTML=''; if(or&&or.pool[or.i]){ const w=or.pool[or.i]; if(S.orInfoKey==='def') infoHTML='Meaning — '+blankHTML(w.d||'—',w.w); else if(S.orInfoKey==='sent') infoHTML='Sentence — '+blankHTML(w.s||'—',w.w); else if(S.orInfoKey==='orig') infoHTML='Origin — '+esc(w.o||'—')+(w.r?('. '+esc(w.r)):''); }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">Oral elimination · Round ${or.round+1} · Best ${S.coachBestRounds||0}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">Spell it out loud, letter by letter</p>
      <button data-act="orSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:16px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px"><button data-act="orSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${infoChip(S.orInfoKey==='def','Definition','orInfoDef')}${infoChip(S.orInfoKey==='sent','Sentence','orInfoSent')}${infoChip(S.orInfoKey==='orig','Origin','orInfoOrig')}</div>
      ${S.orInfoKey?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:15px;line-height:1.6;margin-bottom:16px">${infoHTML}</div>`:''}
      <input data-inp="onType" data-key="orKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="…type the letters" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:14px">
      ${S.orFeedback?`<div style="color:#1f9d57;font-weight:800;font-size:13px;margin-bottom:12px">${esc(S.orFeedback)}</div>`:''}
      <button data-act="orJudge" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Judge</button>
    </div>
  </div>`;
}
function coachOrGone(){
  const S=state; const or=S.or; const w=(or&&or.last)?or.last.w:'';
  return `<div style="max-width:680px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 10px">Eliminated 🛑</h2><p style="color:var(--muted);font-weight:700;margin:0 0 4px">The word was</p><div style="font-family:var(--display);font-weight:800;font-size:36px;color:var(--accent);line-height:1">${esc(w)}</div><p style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-top:8px;letter-spacing:.12em">${esc(w.split('').join(' '))}</p><p style="color:var(--muted);font-weight:700;margin-top:14px">You survived <b style="color:var(--text)">${or?or.round:0}</b> rounds · best ${S.coachBestRounds||0}</p></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="startOral" style="padding:13px 18px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Try again →</button></div>
  </div>`;
}

/* ===== Magic Squares — a 3×3 bingo board of themes. Clear a cell by acing 5 questions
   (spell-it or pick-the-meaning). Complete rows, columns & diagonals for bonus coins;
   black out the whole square for the mega prize. ===== */
const MAGIC_BONUS={cell:3,row:10,col:10,diag:15,square:40};
function magicConceptCells(){ try{ loadConcepts(); }catch(e){}
  return (state.conceptData||[]).map((ch,ci)=>({kind:'concept', id:'c:'+ci, label:conceptShort(ch.title), ci}))
    .filter(x=>isConceptUnlocked(x.ci) && conceptWordsOf((state.conceptData||[])[x.ci]).length>=5); }
function magicNewBoard(){ clearGTimer();
  const ok=t=>themeWords(t.id).length>=10;
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
function magicClusterOf(cell){ if(cell&&cell.kind==='concept') return {id:'concept',label:'Concept',c:'#0E8A78'};
  return themeClusters().find(x=>x.id===cell.cluster)||themeClusters()[0]; }
function magicCellWords(id){
  if(String(id).slice(0,2)==='c:'){ const ch=(state.conceptData||[])[+String(id).slice(2)];
    return conceptWordsOf(ch||{}).map(x=>({w:x.w, d:x.def||'', s:x.ex||''})); }
  return themeWords(id); }
function magicBuildQs(id){ const all=diffSlice(magicCellWords(id).filter(w=>w.d&&w.d.length>4));
  let ws=pickFresh(all,5); if(ws.length<5) ws=ws.concat(sample(all.filter(w=>!ws.some(x=>nkey(x.w)===nkey(w.w))),5-ws.length));
  return ws.slice(0,5).map(w=>{ logGameWord(nkey(w.w));
    if(Math.random()<0.5 && /^[a-z'\- ]+$/i.test(w.w)) return {k:'spell',w};
    const others=sample(all.filter(x=>nkey(x.w)!==nkey(w.w)),3).map(x=>x.w);
    return {k:'mean',w,choices:sample([w.w].concat(others))}; }); }
function magicLinesCheck(g){ const d=g.board.map(c=>c.done); const won=[];
  const L=g.lines;
  for(let r=0;r<3;r++) if(!L.r[r] && d[r*3]&&d[r*3+1]&&d[r*3+2]){ L.r[r]=true; won.push({label:'Row '+(r+1)+' complete!',coins:MAGIC_BONUS.row}); }
  for(let c=0;c<3;c++) if(!L.c[c] && d[c]&&d[c+3]&&d[c+6]){ L.c[c]=true; won.push({label:'Column '+(c+1)+' complete!',coins:MAGIC_BONUS.col}); }
  if(!L.d[0] && d[0]&&d[4]&&d[8]){ L.d[0]=true; won.push({label:'Diagonal complete!',coins:MAGIC_BONUS.diag}); }
  if(!L.d[1] && d[2]&&d[4]&&d[6]){ L.d[1]=true; won.push({label:'Diagonal complete!',coins:MAGIC_BONUS.diag}); }
  if(!g.squareDone && d.every(Boolean)){ g.squareDone=true; won.push({label:'✨ MAGIC SQUARE! ✨',coins:MAGIC_BONUS.square,mega:true}); }
  return won; }
function magicFinishCell(){ const g=state.game; const i=g.cell; const cell=g.board[i];
  cell.tried++; cell.best=Math.max(cell.best,g.right);
  const win=g.right>=4; let celebr=null; let coins=0;
  if(win && !cell.done){ cell.done=true; coins+=MAGIC_BONUS.cell;
    const lines=magicLinesCheck(g);
    if(lines.length){ celebr={msgs:lines.map(l=>l.label+' +'+l.coins+' 🪙'), mega:lines.some(l=>l.mega)}; coins+=lines.reduce((a,l)=>a+l.coins,0); } }
  if(coins){ addCoins(coins); g.coins+=coins; }
  g.cellResult={win, right:g.right, coins}; g.celebr=celebr; g.status='result';
  if(celebr&&celebr.mega){ sfx('win'); burstConfetti(240); setTimeout(()=>burstConfetti(180),700); }
  else if(celebr){ sfx('win'); burstConfetti(140); }
  else if(win){ sfx('level'); burstConfetti(60); }
  else sfx('lose');
  logActivity('magic','Magic Squares — '+g.board[i].label, {done:5, right:g.right, coins}, []);
  render(); }
function magicAdvance(){ const g=state.game; if(!g) return;
  g.qi++; g.picked=null; g.ok=null; g.revealed=false; state.typed='';
  if(g.qi>=g.qs.length){ magicFinishCell(); return; }
  render(); const q=g.qs[g.qi]; if(q.k==='spell') setTimeout(()=>say(q.w.w),300); }
/* ===================== GAMES ARCADE ===================== */
const GAMES=[
  { type:'beat',     ic:'target', name:'Beat the Buzzer', blurb:'A 60-second sprint, or a relaxed 10-word warm-up. You pick.', tag:'Timed', c:'#FF5FA2',c2:'#E8458C',tex:'dots' },
  { type:'wordquiz', ic:'book',   name:'Word Quiz',       blurb:'Meanings, spellings or word origins — choose your round, or go mixed.', tag:'Quiz', c:'#13A892',c2:'#0E8A78',tex:'rings' },
  { type:'boss',     ic:'crown',  name:'Boss Battle',     blurb:'Defeat the boss with your toughest words.', tag:'Battle', c:'#7B52E0',c2:'#5E39C4',tex:'cross' },
  { type:'duel',     ic:'swords', name:'Spelling Duel',  blurb:'Pass the device — same 10 words, two spellers. Who takes the crown?', tag:'Versus', c:'#C43D5A',c2:'#8E2C44',tex:'diag' },
];
function gameCoverBG(gm){ const t=CONCEPT_TEX[gm.tex]||CONCEPT_TEX.stripes;
  return `background-color:${gm.c};background-image:${t[0]},linear-gradient(135deg,${gm.c},${gm.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* Animated cover scene per game — each icon acts out its game (buzzer gets pressed, sword
   strikes shield, grid cells light up…). Parts share one timeline so the choreography syncs. */
function gameArtSVG(type,size){ size=size||58;
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
  // fallback: existing icon set with float
  const gm=GAMES.find(g=>g.type===type);
  return `<div class="sb-theme-art">${iconSVG((gm&&gm.ic)||'spark',46,2)}</div>`; }
// Meaningful, self-animating emblems for the Home journey cards — each scene tells its journey's story,
// mirroring the arcade game scenes (motion lives inside the SVG, not a generic float on the box).
function journeyArtSVG(kind,size){ size=size||26;
  const W=(inner)=>`<svg viewBox="0 0 48 48" width="${size}" height="${size}" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;overflow:visible;filter:drop-shadow(0 2px 4px rgba(0,0,0,.18))">${inner}</svg>`;
  const P=(d,extra)=>`<path d="${d}"${extra?' '+extra:''}/>`;
  if(kind==='coach'){ // Coaching — three rising level-bars light in turn while a chevron climbs above them
    const bars=[[11,30,10],[21,22,18],[31,14,26]].map(([x,y,h],i)=>
      `<rect x="${x}" y="${y}" width="6" height="${h}" rx="1.6" fill="#fff" fill-opacity=".18" style="animation:sb-ga-cell 2.8s linear infinite;animation-delay:${(i*0.5).toFixed(2)}s"/>`).join('');
    return W(bars+`<g style="animation:sb-jr-rise 2.8s ease-in-out infinite">`+P('M30 12l4-4 4 4')+`</g>`); }
  if(kind==='concept'){ // Concepts — letter tiles light in sequence, an underline sweeps the pattern
    const tiles=[10,20,30].map((x,i)=>
      `<rect x="${x}" y="14" width="8" height="8" rx="1.8" fill="#fff" fill-opacity=".18" style="animation:sb-ga-cell 3s linear infinite;animation-delay:${(i*0.5).toFixed(2)}s"/>`).join('');
    const letters=['a','b','c'].map((L,i)=>`<text x="${14+i*10}" y="20.6" text-anchor="middle" font-family="Baloo 2,sans-serif" font-weight="800" font-size="7" fill="#fff" stroke="none">${L}</text>`).join('');
    return W(tiles+letters+`<g style="animation:sb-ga-scan 3s ease-in-out infinite">`+P('M13 30h9',' stroke-opacity=".95"')+`</g>`); }
  if(kind==='book'){ // Word Journeys — an open book whose page turns
    return W(P('M24 14v22')+P('M24 14C20 11 14 11 8 12v22c6-1 12-1 16 2')+P('M24 14c4-3 10-3 16-2v22c-6-1-12-1-16 2')+
      `<g style="animation:sb-jr-flip 3.2s ease-in-out infinite;transform-origin:24px 24px">`+P('M24 14c3-2 7-2.4 10-1.6v20c-3-.8-7-.4-10 1.6z',' fill="rgba(255,255,255,.24)"')+`</g>`); }
  if(kind==='theme'){ // Theme Journeys — a painter's palette whose colour dabs pop in turn, with a sparkle
    const dabs=[[16,20],[24,15],[32,19],[30,28]].map(([x,y],i)=>
      `<circle cx="${x}" cy="${y}" r="2.6" fill="#fff" fill-opacity=".2" style="animation:sb-ga-cell 3.2s linear infinite;animation-delay:${(i*0.5).toFixed(2)}s"/>`).join('');
    return W(P('M24 8C14 8 7 15 7 23c0 6 5 8 9 8 3 0 3 4 6 5 8 2 18-5 18-14C40 14 33 8 24 8z')+dabs+
      `<g style="animation:sb-ga-star 3.2s ease-in-out infinite;transform-origin:20px 22px">`+P('M20 18l1.3 3 3.3.3-2.5 2.2.8 3.2-2.9-1.7-2.9 1.7.8-3.2-2.5-2.2 3.3-.3z',' fill="rgba(255,255,255,.92)" stroke="none"')+`</g>`); }
  if(kind==='joystick'){ // Arcade — the stick waggles while a button presses
    return W(P('M13 42h22a3 3 0 0 0 3-3v-5H10v5a3 3 0 0 0 3 3z')+
      `<g style="animation:sb-ga-joy 2.4s ease-in-out infinite;transform-origin:24px 34px">`+P('M24 34V16')+`<circle cx="24" cy="12" r="5" fill="rgba(255,255,255,.3)"/></g>`+
      `<circle cx="33" cy="29" r="2.4" fill="#fff" stroke="none" style="animation:sb-ga-press 2.4s ease-in-out infinite;transform-origin:33px 29px"/>`); }
  return `<div class="sb-theme-art">${iconSVG('spark',size,2)}</div>`; }
const MC_ORIGINS=['Latin','Greek','French','Old English','Norse','Spanish','Italian','German','Arabic','Japanese','Hindi','Sanskrit','Dutch','Russian','Hebrew','Portuguese'];
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
function mcSpeak(q){ if(!q) return; if(q.kind==='sentence') sayMasked(q.say, q.word); else if(q.kind==='spell'||q.kind==='origin') say(q.word); else if(q.kind==='idiom'||q.kind==='simile2'||q.kind==='vocab') say(q.say); /* 'meaning': stay silent so the word isn't given away */ }
const gameName=(t)=>{ const g=GAMES.find(x=>x.type===t); return g?g.name:'Game'; };
let _gtimer=null;
function clearGTimer(){ if(_gtimer){ clearInterval(_gtimer); _gtimer=null; } }
function startGTimer(){ clearGTimer(); _gtimer=setInterval(gTick,1000); }
function gTick(){ const g=state.game; if(!g||(g.type!=='beat'&&g.type!=='champ')||g.status!=='play'){ clearGTimer(); return; } g.timeLeft--; if(g.timeLeft<=3&&g.timeLeft>0) sfx('tick'); if(g.timeLeft<=0){ clearGTimer(); (g.type==='champ'?gFinishChamp:gFinishBeat)(); return; } render(); }
/* ----- Champ Challenge helpers ----- */
function challengePool(){ const c=active(); const key=state.challengeKey||activeListKey(); const band=state.chBand||'level';
  if(band==='level') return (curStage(c,key).words||[]).slice();
  if(band==='missed') return (state.missedWords||[]).concat((c.missed)||[]);
  const tier={ easy:w=>(w.y||3)<=2, medium:w=>(w.y||3)===3, hard:w=>(w.y||3)===4, champion:w=>(w.y||3)>=5 }[band]||(()=>true);
  return journeySorted().filter(w=>w&&w.w&&tier(w)); }
function gFinishChamp(){ clearGTimer(); const g=state.game; g.status='done'; const done=g.right+g.wrong;
  g.pass = g.fmt==='count' ? (done>0 && g.right/done>=0.8) : (g.right>=10);
  const bonus=g.right*2 + (g.pass?10:0); addCoins(bonus); g.bonus=bonus;
  const c=active(); const curLvl=listStageIdx(c,g.champKey)+1;
  const blockLib = g.champKey==='journey' && g.champLevel>=CHAMP_LEVELS && !state.premium;
  g.canAdvance = g.pass && g.band==='level' && curLvl===g.champLevel && !blockLib && (listStageIdx(c,g.champKey) < listStages(g.champKey).length-1);
  if(g.pass){ sfx('win'); burstConfetti(120); } else sfx('level');
  logActivity('champ','Champ Challenge', {done, right:g.right, coins:bonus}, []); render(); }
const BANDS=[['level','This Level'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['champion','Champion'],['missed','My misses']];
function challengeConfig(){ const S=state; const key=S.challengeKey||activeListKey(); const lvl=listStageIdx(active(),key)+1;
  const seg=(f,v,label,cur)=>`<button data-act="chSet" data-arg="${f}:${v}" style="flex:1;min-width:64px;padding:11px 8px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid ${cur?'var(--accent)':'var(--line)'};${cur?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${label}</button>`;
  const fmtRow=`<div style="display:flex;gap:8px;margin-bottom:14px">${seg('fmt','count','🔢 Set number',S.chFmt==='count')}${seg('fmt','timed','⏱️ Beat the clock',S.chFmt==='timed')}</div>`;
  const amtRow = S.chFmt==='timed'
    ? `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">How long?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[60,90,120].map(t=>seg('time',t,t+'s',S.chTime===t)).join('')}</div>`
    : `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">How many words?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[10,15,20,30].map(n=>seg('count',n,String(n),S.chCount===n)).join('')}</div>`;
  const bandRow=`<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">Difficulty</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${BANDS.map(([v,l])=>seg('band',v,l,S.chBand===v)).join('')}</div>`;
  return `<div style="max-width:560px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><button data-act="chExit" style="color:var(--muted);font-weight:700;font-size:13px">← Back</button></div>
    <h2 style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">${iconSVG('bolt',22)} Champ Challenge</h2>
    <p style="margin:0 0 18px;color:var(--muted);font-size:13px">Pick your format and difficulty. Pass the <b>This Level</b> challenge to <b>test out</b> and jump straight to the next Level.</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px">
      ${fmtRow}${amtRow}${bandRow}
      <button data-act="chStart" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Start Challenge →</button>
      ${S.chBand==='level'?`<div style="font-size:12px;color:var(--muted);margin-top:10px;text-align:center">Testing out of <b>Level ${lvl}</b> of ${esc(listLabel(key).split(' · ')[0])}.</div>`:''}
    </div>
  </div>`; }
function champDone(){ const g=state.game; const done=g.right+g.wrong; const acc=done?Math.round(g.right/done*100):0;
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">
    <div style="font-size:54px;margin:8px 0">${g.pass?'⭐':'💪'}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 6px">${g.pass?'Challenge passed!':'Good effort!'}</h2>
    <div style="font-size:15px;color:var(--muted);margin-bottom:16px">${g.right} right${g.fmt==='count'?(' of '+done):''} · ${acc}% accuracy · +${g.bonus} ${iconSVG('coin',14)}</div>
    ${g.canAdvance?`<button data-act="champAdvance" style="width:100%;padding:14px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:10px">🎉 Level cleared — advance →</button>`:''}
    ${(!g.canAdvance&&g.pass&&g.band==='level')?`<div style="font-size:12px;color:var(--muted);margin-bottom:10px">Nice — that wasn't your current Level, so no skip this time.</div>`:''}
    <div style="display:flex;gap:10px"><button data-act="chStart" style="flex:1;padding:13px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">Try again</button><button data-act="chExit" style="flex:1;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px">Done</button></div>
  </div>`; }
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
function corpusBands(){ if(_corpusBands) return _corpusBands;
  const src=(window.SB_DATA&&SB_DATA.nsf)||[]; const by={1:[],2:[],3:[],4:[],5:[],6:[],7:[],8:[],9:[]};
  for(const w of src){ if(!w||!w.w||!(w.d&&w.d.length>4)) continue; if(!/^[a-z]+$/i.test(w.w)) continue;
    const y=Math.max(1,Math.min(9,w.y||3)); by[y].push(w); }
  _corpusBands=by; return by; }
// difficulty → an absolute y-range anchored on the child's proven Bee Band and age
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
function gameWordsD(opts){ opts=opts||{}; const c=active(); const [lo,hi]=diffRange(c);
  const personal=gameWords(opts);
  const inRange=personal.filter(w=>{ const y=w.y||3; return (y>=lo&&y<=hi) || (state.missedWords||[]).some(m=>nkey(m.w)===nkey(w.w)); });
  // corpus extension: about 3× the personal pool, at least 150, at most 450 fresh library words
  let ext=corpusSlice(lo,hi, Math.min(450, Math.max(150, inRange.length*3)));
  if(opts.needSent) ext=ext.filter(w=>w.s&&/[a-z]/i.test(w.s));
  const seen=new Set(inRange.map(w=>nkey(w.w))); const out=inRange.slice();
  for(const w of ext){ const k=nkey(w.w); if(!seen.has(k)){ seen.add(k); out.push(w); } }
  return out.length?out:personal; }
function diffSlice(pool){ const c=active(); const [lo,hi]=diffRange(c);
  const f=pool.filter(w=>{ const y=w.y||3; return y>=lo&&y<=hi; });
  return f.length>=10?f:pool; }
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
/* Word Quiz rounds from the figurative dataset: idiom meanings + complete-the-simile. */
function buildFigQs(mode,n){ const pool=figPool(); if(pool.length<8) return [];
  if(mode==='idiom'){
    const cand=sample(pool.filter(x=>x.t!=='simile'), n);
    return cand.map(x=>{ const others=sample(pool.filter(y=>y!==x&&y.t!=='simile'&&y.m!==x.m),3).map(y=>y.m);
      return {kind:'idiom', word:x.p, wordObj:{w:x.p,y:3}, answer:x.m, choices:sample([x.m].concat(others)), prompt:esc(x.p), say:x.p, os:x.os}; }); }
  const sims=pool.filter(x=>x.t==='simile'&&x.vehicle&&x.p.toLowerCase().includes(x.vehicle.toLowerCase()));
  const cand=sample(sims, Math.min(n,sims.length));
  return cand.map(x=>{ const re=new RegExp(x.vehicle.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');
    const blanked=x.p.replace(re,'____');
    const others=sample([...new Set(sims.filter(y=>y!==x&&y.vehicle.toLowerCase()!==x.vehicle.toLowerCase()).map(y=>y.vehicle))],3);
    return {kind:'simile2', word:x.p, wordObj:{w:x.p,y:3}, answer:x.vehicle, choices:sample([x.vehicle].concat(others)), prompt:esc(blanked), say:blanked.replace('____','hmm'), m:x.m}; });
}
/* NSF vocabulary-bee round: hear/see the word, pick the meaning. */
function buildVocabQs(n){ const pool=gameWordsD({needDef:true}); if(pool.length<8) return [];
  const cand=pickFresh(pool,n); const ws=cand.length>=Math.min(n,5)?cand:sample(pool,Math.min(n,pool.length));
  return ws.map(w=>{ logGameWord(nkey(w.w));
    const near=pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d&&Math.abs((x.y||3)-(w.y||3))<=1);
    const others=sample(near.length>=3?near:pool.filter(x=>nkey(x.w)!==nkey(w.w)&&x.d),3).map(x=>x.d);
    return {kind:'vocab', word:w.w, wordObj:w, answer:w.d, choices:sample([w.d].concat(others)), prompt:esc(w.w), say:w.w, p2:w.p||''}; });
}
function buildMC(mode,n){ const all=gameWordsD();
  if(mode==='origin'){ const pool=all.filter(w=>w.o && MC_ORIGINS.indexOf(w.o)>=0); if(pool.length<4) return [];
    return pickFresh(pool, Math.min(n,pool.length)).map(w=>{
      const choices=sample([w.o].concat(sample(MC_ORIGINS.filter(o=>o!==w.o),3)));
      return { kind:'origin', word:w.w, wordObj:w, answer:w.o, choices, prompt:esc(w.w)+(w.d?(' — '+esc(trunc(w.d,80))):''), say:w.w };
    }); }
  if(mode==='spell'){ const pool=all.filter(w=>(w.m && nkey(w.m)!==nkey(w.w)) || (w.w.length>=6 && /^[a-z'\- ]+$/i.test(w.w))); if(pool.length<4) return [];
    return pickFresh(pool, Math.min(n,pool.length)).map(w=>{ const wrong=[];
      if(w.m && nkey(w.m)!==nkey(w.w)) wrong.push(w.m);
      misspellings(w.w, 5).forEach(x=>{ if(wrong.length<3 && !wrong.some(y=>nkey(y)===nkey(x)) && nkey(x)!==nkey(w.w)) wrong.push(x); });
      while(wrong.length<3) wrong.push(w.w.slice(0,-1)+w.w.slice(-1)+'e'); // last-resort filler
      const choices=sample([w.w].concat(wrong.slice(0,3)));
      return { kind:'spell', word:w.w, wordObj:w, answer:w.w, choices, prompt:(w.d?('“'+esc(trunc(w.d,90))+'”'):'Which spelling is correct?'), say:w.w };
    }); }
  // meaning (merged: half definition prompts, half sentence prompts)
  const pool=all.filter(w=>(w.d&&w.d.length>4)||(w.s&&/[a-z]/i.test(w.s))); if(pool.length<4) return [];
  return pickFresh(pool, Math.min(n,pool.length)).map(w=>{
    const useSent = w.s && /[a-z]/i.test(w.s) && Math.random()<0.5;
    const choices=sample([w.w].concat(sample(all.filter(x=>nkey(x.w)!==nkey(w.w)),3).map(x=>x.w)));
    return { kind:(useSent?'sentence':'meaning'), word:w.w, wordObj:w, answer:w.w, choices, prompt:(useSent?blankHTML(w.s,w.w):esc(w.d)), say:(useSent?w.s:w.w) };
  }); }
function gMisses(g){ return (g.ans?g.ans.filter(a=>!a.ok).map(a=>a.w):[]); }
function gFinishBuzz(){ const g=state.game; g.status='done'; const bonus=2+g.right; addCoins(bonus); g.bonus=bonus;
  logActivity('buzz','10-Word Warm-Up', {done:g.ans.length,right:g.right,coins:bonus}, gMisses(g));
  if(g.right>=8){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishBeat(){ const g=state.game; g.status='done'; const bonus=Math.round(g.right*1.5); addCoins(bonus); g.bonus=bonus;
  logActivity('beat','Beat the Buzzer', {done:g.right+g.wrong,right:g.right,coins:bonus}, []);
  if(g.right>=12){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishBoss(won){ clearGTimer(); const g=state.game; g.status=won?'won':'lost'; const bonus=won?14:0; if(won){ addCoins(bonus); g.bonus=bonus; sfx('win'); burstConfetti(150); } else { sfx('lose'); }
  logActivity('boss', won?'Boss Battle — won':'Boss Battle — lost', {done:g.right,right:g.right,coins:bonus}, []); render(); }
function gFinishMC(){ const g=state.game; g.status='done'; const bonus=2+g.right; addCoins(bonus); g.bonus=bonus;
  if(g.round==='vocab'){ const c=active(); c.vocQuiz=(c.vocQuiz||0)+1; }
  if(g.round==='idiom'||g.round==='simile'){ const c=active(); c.figQuiz=(c.figQuiz||0)+1; }
  logActivity(g.type, ACT_LABEL[g.type]||'Quiz', {done:g.qs.length,right:g.right,coins:bonus}, g.miss||[]);
  if(g.right>=7){ sfx('win'); burstConfetti(110); } else sfx('level'); render(); }

function coinAmt(n, sz){ return `<span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">${iconSVG('coin',sz||13)} ${n}</span>`; }
function coinChip(){ return `<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)">${coinAmt(coinsOf(),14)}</span>`; }
function viewGames(){ const g=state.game; if(!g) return gamesHub();
  if(g.type==='duel') return duelView();
  if(g.type==='magic') return magicView();
  if(g.type==='beat' && g.phase==='mode') return beatModePicker();
  if(g.type==='wordquiz' && !g.qs) return wordQuizPicker();
  if(g.qs) return (g.status==='done')?mcDone():mcGame();
  return (g.status==='done'||g.status==='won'||g.status==='lost')?typedDone():typedGame(); }
function gamePickerShell(title,sub,cards){ return `<div style="max-width:620px;margin:0 auto;animation:sb-rise .3s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:14px">← Arcade</button><span style="font-family:var(--display);font-weight:800;font-size:20px">${esc(title)}</span></div>
    <p style="margin:0 0 16px;color:var(--muted);font-size:13px">${sub}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">${cards}</div></div>`; }
function pickerCard(act,arg,c,ic,name,desc){ return `<button data-act="${act}" data-arg="${arg}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px 16px 15px;box-shadow:var(--sh-rest);display:flex;flex-direction:column;gap:7px">
    <span style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:${c};color:#fff">${iconSVG(ic,20)}</span>
    <span style="font-family:var(--display);font-weight:800;font-size:16px;color:var(--text)">${esc(name)}</span>
    <span style="font-size:12.5px;color:var(--muted);line-height:1.4">${esc(desc)}</span></button>`; }
function beatModePicker(){ return gamePickerShell('Beat the Buzzer','Pick how you want to play.',
  pickerCard('beatStart','sprint','#FF5FA2','target','60-Second Sprint','Spell as many as you can before the clock runs out.')+
  pickerCard('beatStart','warmup','#E0922E','flame','10-Word Warm-Up','A relaxed, untimed round of ten mixed words — your daily warm-up.')); }
function wordQuizPicker(){ return gamePickerShell('Word Quiz','Choose a round — each is 10 questions.',
  pickerCard('wqStart','meaning','#13A892','book','Meanings','Match a word to its meaning or fill the blank in a sentence.')+
  pickerCard('wqStart','spell','#3D7DF0','spark','Spellings','Pick the correctly-spelled word from look-alikes.')+
  pickerCard('wqStart','origin','#4F9E6A','grid','Origins','Guess each word’s language of origin.')+
  pickerCard('wqStart','idiom','#9C6A08','bulb','Idioms','What does “break the ice” really mean? 2,000 phrases.')+
  pickerCard('wqStart','simile','#E0922E','flame','Similes','Complete the simile — as busy as a … ?')+
  pickerCard('wqStart','vocab','#2E8FB8','book','Vocabulary','Bee-style: hear the word, pick the right meaning.')+
  pickerCard('wqStart','mixed','#B14FC4','palette','Mixed','A little of everything — meanings, spellings and origins.')); }
/* ---- Spelling Duel: pass-the-device, same 10 words, two spellers ---- */
function duelView(){ const S=state; const g=S.game; const shell=(inner)=>`<div style="max-width:560px;margin:0 auto;animation:sb-rise .3s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:14px">← Arcade</button><span style="font-family:var(--display);font-weight:800;font-size:20px">Spelling Duel</span></div>${inner}</div>`;
  if(g.phase==='setup') return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:var(--sh-rest);text-align:center">
      <div style="width:84px;height:92px;margin:0 auto 10px">${mascotAcc('excited')}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:24px;margin-bottom:6px">${esc(g.p[0].name)} vs …</div>
      <p style="font-size:15px;color:var(--muted);margin:0 0 14px">Same 10 words for both spellers. Player 2, type your name:</p>
      <input data-inp="duelName" data-fkey="duelName" value="${escA(g.p[1].name)}" maxlength="16" style="width:100%;max-width:260px;padding:12px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px;text-align:center;margin-bottom:16px">
      <button data-act="duelBegin" style="display:block;width:100%;max-width:260px;margin:0 auto;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Start the duel →</button></div>`);
  if(g.phase==='pass') return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--sh-rest);text-align:center">
      <div style="font-size:15px;color:var(--muted);font-weight:650;margin-bottom:6px">${esc(g.p[0].name)} scored</div>
      <div style="font-family:var(--display);font-weight:800;font-size:44px;color:var(--action,var(--accent));line-height:1">${g.p[0].right}/10</div>
      <p style="font-size:15px;margin:14px 0 18px">Pass the device to <b>${esc(g.p[1].name)}</b> — same 10 words. No peeking!</p>
      <button data-act="duelP2" style="padding:14px 26px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">I'm ${esc(g.p[1].name)} — go →</button></div>`);
  if(g.phase==='done'){ const a=g.p[0],b=g.p[1]; const tie=a.right===b.right; const win=a.right>=b.right?a:b; const lose=win===a?b:a;
    return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:30px;box-shadow:var(--sh-overlay);text-align:center">
      <div style="width:100px;height:110px;margin:0 auto 8px;animation:sb-bee-talk 1.6s ease-in-out infinite">${mascotAcc('excited')}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:28px;margin-bottom:10px">${tie?'It\'s a tie!':esc(win.name)+' wins! 🏆'}</div>
      <div style="display:flex;justify-content:center;gap:22px;margin-bottom:16px">${[a,b].map(pp=>`<div><div style="font-family:var(--display);font-weight:800;font-size:36px;line-height:1;color:${pp===win&&!tie?'var(--treasure-deep,#8A5B00)':'var(--ink,var(--text))'}">${pp.right}</div><div style="font-size:13px;color:var(--muted);font-weight:650">${esc(pp.name)}</div></div>`).join('')}</div>
      <p style="font-size:13px;color:var(--muted);margin:0 0 16px">${tie?'Both':'Winner'} earned ${tie?'8':'12'} 🪙 · rematch with fresh words any time.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button data-act="playGame" data-arg="duel" style="padding:13px 22px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">Rematch →</button><button data-act="exitGame" style="padding:13px 22px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px">Back to Arcade</button></div></div>`); }
  const pl=g.p[g.turn]; const w=g.list[g.i];
  return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,30px);box-shadow:var(--sh-rest);text-align:center">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-weight:800;font-size:14px;color:var(--action,var(--accent))">${esc(pl.name)}'s turn</span><span style="font-family:var(--mono);font-size:13px;color:var(--muted)">${g.i+1}/10 · ✓ ${pl.right}</span></div>
      <button data-act="duelSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      <input data-inp="duelType" data-key="duelKey" data-fkey="duelType" value="${escA(S.typed)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type it…" style="width:100%;padding:15px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:20px;text-align:center;letter-spacing:.06em;margin-bottom:12px">
      <button data-act="duelEnter" style="width:100%;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Submit</button></div>`);
}
/* ---- Magic Squares view: board → 5-question cell → result (+ line celebrations) ---- */
function magicView(){ const g=state.game; const S=state;
  const head=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:13px">← Arcade</button><span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:20px;margin-left:4px">${iconSVG('palette',21)} Magic Squares</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px">${iconSVG('coin',14)} +${g.coins}</span></div>`;
  if(g.status==='board'){
    const tiles=g.board.map((cell,i)=>{ const cl=magicClusterOf(cell);
      const doneBG=`${themeCoverBG(cl)};color:#fff`;
      return `<button class="sb-lift" data-act="magicCell" data-arg="${i}" style="position:relative;aspect-ratio:1;border-radius:14px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;border:2px solid ${cell.done?cl.c:'var(--line)'};${cell.done?doneBG:'background:var(--bg2)'};box-shadow:${cell.done?('0 6px 16px rgba(43,27,94,.2)'):'0 2px 6px rgba(43,27,94,.06)'}">
        ${cell.done?`<span style="position:absolute;top:6px;right:7px;font-size:16px;line-height:1">⭐</span>`:''}
        <div class="sb-theme-art" style="width:54px;height:54px;border-radius:14px;display:grid;place-items:center;animation-delay:${(i%9)*0.22}s;${cell.done?'filter:drop-shadow(0 1px 3px rgba(0,0,0,.3))':`background:linear-gradient(135deg,${cl.c},${cl.c2||cl.c})`}">${themeArtSVG(cell.id,44,false)}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:12px;line-height:1.15;${cell.done?'color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.25)':'color:var(--text)'}">${esc(cell.label)}</div>
        ${(!cell.done&&cell.tried)?`<div style="font-size:12px;font-weight:800;color:var(--muted)">best ${cell.best}/5 · retry</div>`:''}
      </button>`; }).join('');
    const doneN=g.board.filter(c=>c.done).length;
    return `<div style="max-width:560px;margin:0 auto">${head}
      <p style="margin:0 0 14px;color:var(--muted);font-size:13px">Pick a square and ace <b>4 of 5</b> questions to claim it. Finish a <b>row +${MAGIC_BONUS.row}</b> 🪙, <b>column +${MAGIC_BONUS.col}</b>, <b>diagonal +${MAGIC_BONUS.diag}</b> — and the whole square for <b>+${MAGIC_BONUS.square}</b>!</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">${tiles}</div>
      <div style="display:flex;align-items:center;gap:10px"><span style="font-size:12px;color:var(--muted);font-weight:700">Round ${g.round||1} · ${doneN}/9 squares</span><span style="flex:1"></span><button data-act="magicNew" style="padding:10px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">🔄 New board</button></div>
    </div>`; }
  if(g.status==='play'){ const q=g.qs[g.qi]; const cell=g.board[g.cell]; const cl=magicClusterOf(cell);
    const dots=g.qs.map((_,i)=>`<span style="flex:1;height:6px;border-radius:999px;background:${i<g.qi?'var(--good)':(i===g.qi?cl.c:'var(--surface2)')}"></span>`).join('');
    let body='';
    if(q.k==='spell'){
      const fb = g.revealed ? (g.ok?`<div style="border-radius:14px;padding:12px 15px;margin-bottom:12px;font-weight:800;background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good);animation:sb-pop .3s ease both">✓ Correct!</div>`:`<div style="border-radius:14px;padding:12px 15px;margin-bottom:12px;font-weight:800;background:color-mix(in srgb,var(--bad) 16%,transparent);color:var(--bad);animation:sb-pop .3s ease both">✗ It's “${esc(q.w.w)}”</div>`) : '';
      body=`<div style="text-align:center">
        <button data-act="magicHear" style="display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',17)} Hear it again</button>
        ${q.w.d?`<div style="font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:14px;max-width:40em;margin-left:auto;margin-right:auto"><b style="color:var(--text)">Meaning.</b> ${esc(q.w.d)}</div>`:''}
        ${fb}
        <input data-inp="onType" data-key="magicKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${g.revealed?'disabled':''} style="width:100%;text-align:center;padding:15px 14px;border-radius:14px;background:var(--surface);border:2px solid ${g.revealed?(g.ok?'var(--good)':'var(--bad)'):'var(--line)'};color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(19px,4.5vw,26px);letter-spacing:.13em;text-transform:lowercase;outline:none;margin-bottom:12px">
        ${g.revealed?'':`<button data-act="magicSubmit" style="width:100%;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Check ✓</button>`}
      </div>`;
    } else {
      const btns=q.choices.map(c=>{ const isPick=g.picked===c; const isAns=nkey(c)===nkey(q.w.w);
        let st='background:var(--surface2);border:1px solid var(--line);color:var(--text)';
        if(g.picked!=null){ if(isAns) st=`background:color-mix(in srgb,var(--good) 20%,transparent);border:1.5px solid var(--good);color:var(--good)`; else if(isPick) st=`background:color-mix(in srgb,var(--bad) 16%,transparent);border:1.5px solid var(--bad);color:var(--bad)`; else st+=';opacity:.55'; }
        return `<button data-act="magicPick" data-arg="${escA(c)}" style="padding:14px 12px;border-radius:14px;font-family:var(--display);font-weight:800;font-size:15px;${st}">${esc(c)}</button>`; }).join('');
      body=`<div style="font-size:15px;color:var(--text);line-height:1.6;margin-bottom:16px;text-align:center"><b>Which word means:</b><br>“${esc(q.w.d)}”</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">${btns}</div>`;
    }
    return `<div style="max-width:560px;margin:0 auto">${head}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:color-mix(in srgb,${cl.c} 14%,var(--bg2));color:${cl.c};font-weight:800;font-size:12px">${esc(cell.label)}</span><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">Question ${g.qi+1}/5 · ${g.right} right</span></div>
      <div style="display:flex;gap:5px;margin-bottom:14px">${dots}</div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(16px,4vw,24px);box-shadow:var(--glow)">${body}</div>
    </div>`; }
  // result
  const r=g.cellResult||{}; const cell=g.board[g.cell]||{}; const cl=magicClusterOf(cell);
  const celebr=g.celebr?`<div style="margin:14px 0;animation:sb-pop .45s ease both">${g.celebr.msgs.map(m=>`<div style="font-family:var(--display);font-weight:800;font-size:${g.celebr.mega?'26px':'19px'};color:var(--accent);margin-bottom:4px">🎉 ${esc(m)}</div>`).join('')}</div>`:'';
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">${head}
    <div style="display:flex;justify-content:center;margin:6px 0 4px"><div style="width:84px;height:92px">${mascotSVG(r.win?(g.celebr?'excited':'happy'):'oops')}</div></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">${r.win?(g.celebr&&g.celebr.mega?'MAGIC SQUARE!':'Square claimed! ⭐'):'So close!'}</h2>
    <div style="font-size:15px;color:var(--muted);font-weight:700">${esc(cell.label)} — ${r.right}/5 right${r.coins?(' · +'+r.coins+' 🪙 bonus'):''}</div>
    ${celebr}
    <div style="display:flex;gap:10px;margin-top:16px">${r.win?'':`<button data-act="magicCell" data-arg="${g.cell}" style="flex:1;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Try again →</button>`}${g.squareDone
      ? `<button data-act="magicNew" style="flex:1;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Round ${(g.round||1)+1} — 9 new cells →</button><button data-act="exitGame" style="padding:13px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">Done</button>`
      : `<button data-act="magicBoard" style="flex:1;padding:13px;border-radius:14px;background:${r.win?'var(--accent)':'var(--surface2)'};color:${r.win?'#fff':'var(--text)'};font-weight:800;font-size:15px;${r.win?'box-shadow:var(--edge)':'border:1px solid var(--line)'}">Back to the board</button>`}</div>
  </div>`; }
function gamesHub(){ const S=state;
  const questCard=(function(){ if(!window.SQ) return '';
    let done=0,total=0,legWon=0; try{ const ss=SQ.seasons(); total=ss.length; ss.forEach(s=>{ if(SQ.cleared(s.pack)>=5){done++; legWon++;} }); }catch(e){}
    const c=active(); const heroId=(function(){ try{ return (SB_AVATARS.byId['queenhive']?'queenhive':(SB_AVATARS.list[0]||{}).id); }catch(e){ return 'queenhive'; } })();
    return `<button data-act="openQuest" style="grid-column:1/-1;text-align:left;border-radius:16px;overflow:hidden;background:linear-gradient(150deg,#2E2258,#241A47 60%,#1C1438);box-shadow:0 8px 24px rgba(43,27,94,.28);position:relative">
      <div style="position:absolute;right:-6px;bottom:-10px;opacity:.9;filter:drop-shadow(0 4px 12px rgba(0,0,0,.4))">${SB_AVATAR(heroId,120,{dark:true})}</div>
      <div style="padding:18px 20px;color:#fff;position:relative;max-width:78%">
        <div style="display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#FFD98A;background:rgba(255,194,61,.14);border:1px solid rgba(255,194,61,.35);border-radius:99px;padding:3px 11px;margin-bottom:8px">★ Story mode</div>
        <div style="font-family:var(--display);font-weight:800;font-size:22px;line-height:1.1">Spelling Quest</div>
        <div style="font-size:13px;color:#C9BFEA;line-height:1.45;margin-top:5px">Play 15 story seasons — spell through five chapters to a boss and win its legendary avatar.</div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
          <span style="padding:9px 18px;border-radius:10px;background:#FFC23D;color:#241E33;font-weight:800;font-size:14px">${done>0?'Continue':'Start Season 1'} →</span>
          <span style="font-size:12px;font-weight:800;color:#C9BFEA">${done}/${total} seasons ${legWon?('· '+legWon+' legendary won'):'cleared'}</span>
        </div>
      </div></button>`;
  })();
  const champCard=`<button data-act="openChallenge" data-arg="journey" style="grid-column:1/-1;text-align:left;border-radius:14px;overflow:hidden;${listCoverBG('journey')};box-shadow:0 6px 18px rgba(43,27,94,.18)"><div style="padding:16px 18px;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="display:flex;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))">${iconSVG('bolt',32)}</div><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">Set timed or counted · pick a difficulty</div><div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">Champ Challenge</div><div style="font-size:12px;color:rgba(255,255,255,.9)">Beat the clock or a set number — pass your Level to test out.</div></div><span style="padding:9px 16px;border-radius:10px;background:#fff;color:${listCoverOf('journey').c};font-weight:800;font-size:13px;white-space:nowrap">Set it up →</span></div></button>`;
  const magicCard=`<button data-act="playGame" data-arg="magic" style="grid-column:1/-1;text-align:left;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#B14FC4,#7E2E9E);box-shadow:0 6px 18px rgba(123,46,142,.24)"><div style="padding:16px 18px;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="display:flex;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))">${iconSVG('grid',30)}</div><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">3×3 board of themes &amp; concepts · lines win bonus coins</div><div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">Magic Squares</div><div style="font-size:12px;color:rgba(255,255,255,.9)">Clear theme and concept cells by spelling — complete a line for a Magic Square bonus.</div></div><span style="padding:9px 16px;border-radius:10px;background:#fff;color:#7E2E9E;font-weight:800;font-size:13px;white-space:nowrap">Play →</span></div></button>`;
  const triviaCard=(function(){ if(!window.SB_TRIVIA) return '';
    const st=(active().trivia)||{}; const nQ=(SB_TRIVIA.questions||[]).length;
    return `<button data-act="openTrivia" style="grid-column:1/-1;text-align:left;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#F0A93C,#DC7A18);box-shadow:0 6px 18px rgba(200,122,20,.28)"><div style="padding:16px 18px;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="display:flex;font-size:30px;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))">🧠</div><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.88)">${fmtN(nQ)} questions · 20 themes · 5 levels</div><div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">Bee Trivia</div><div style="font-size:12px;color:rgba(255,255,255,.92)">Classic quiz, Trivia Squares board or Beat the Clock — with picture and listening rounds.</div></div><span style="padding:9px 16px;border-radius:10px;background:#fff;color:#C8791B;font-weight:800;font-size:13px;white-space:nowrap">${st.right?('Play → · '+fmtN(st.right)+' right'):'Play →'}</span></div></button>`;
  })();
  const cards=questCard+triviaCard+champCard+magicCard+GAMES.map(gm=>`<button class="sb-cover-card" data-act="playGame" data-arg="${gm.type}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px var(--line),var(--sh-rest);display:flex;flex-direction:column">
      <div style="position:relative">
        ${SB_GAME(S.theme,gm.type,{h:108,dark:S.mode==='dusk'})}
        <span style="position:absolute;top:10px;left:12px;font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:3px 9px;border-radius:6px;background:${S.mode==='dusk'?'rgba(36,30,51,.85);color:#fff':'rgba(255,255,255,.92);color:#241E33'}">${esc(gm.tag)}</span>
      </div>
      <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
        <div style="font-family:var(--display);font-weight:800;font-size:17px;color:var(--text)">${gm.name}</div>
        <div style="font-family:var(--body);font-weight:600;font-size:12px;color:var(--muted);line-height:1.45;margin-top:6px">${gm.blurb}</div>
        <div style="margin-top:auto;padding-top:13px"><span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:${gm.c};color:#fff;font-weight:800;font-size:13px">${iconSVG('volume',14)} Play →</span></div>
      </div></button>`).join('');
  const store=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px;margin-top:18px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-family:var(--display);font-weight:800;font-size:15px">Coin store</span><span style="font-size:12px;color:var(--muted);font-weight:700">— spend what you earn</span></div>
      <p style="font-size:12px;color:var(--muted);margin:0 0 12px">Play games, Word Coach and Concepts to collect 🪙. Then treat yourself:</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
        <button data-act="openShop" style="text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px"><div style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:13px;margin-bottom:3px;color:var(--accent)">${iconSVG('cart',16)} Open the Store</div><div style="font-size:12px;color:var(--muted)">Avatar packs, worlds, power-ups</div></button>
      </div></div>`;
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button><span style="margin-left:2px">${arcadeLogoSVG(38)}</span><span style="font-family:var(--display);font-weight:800;font-size:20px;letter-spacing:-.01em">Arcade</span><span style="margin-left:auto">${coinChip()}</span></div>
    <p style="margin:0 0 10px;color:var(--muted);font-size:13px">Play a story season or jump into a quick game — every correct word earns coins.</p>
    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:16px">
      <span style="font-size:12px;font-weight:800;color:var(--muted)">Word difficulty</span>
      ${[['auto','My level'],['easy','Easy'],['medium','Medium'],['hard','Hard'],['champ','Champ']].map(([k,l])=>{ const on=((active().gameDiff)||'auto')===k;
        return `<button data-act="setGameDiff" data-arg="${k}" style="padding:7px 13px;border-radius:999px;font-weight:800;font-size:12.5px;${on?'background:var(--accent);color:#fff;box-shadow:var(--edge)':'background:var(--surface2);color:var(--muted);border:1px solid var(--line)'}">${l}</button>`; }).join('')}
      <span style="font-size:11.5px;color:var(--muted);font-weight:650">— how tough the words are in every game, scaled to your own level</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">${cards}</div>
    ${store}
  </div>`;
}
function viewShop(){ const S=state; const c=active(); ensureLists(c); const tab=S.shopTab||'avatars';
  const tabBtn=(k,ic,l)=>`<button data-act="shopTab" data-arg="${k}" style="flex:1;min-width:96px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${tab===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  let body='';
  if(tab==='avatars'){
    const packs=SB_AVATARS.packs.map(p=>{ const avs=SB_AVATARS.list.filter(a=>a.pack===p.id); const ownedN=avs.filter(a=>avOwned(c,a.id)).length; const full=ownedN>=avs.length;
      const leg=avs.find(a=>a.rarity==='legendary');
      const preview=avs.filter(a=>avOwned(c,a.id)).slice(0,2).concat(leg?[leg]:[]).slice(0,3)
        .map(a=>{ const own=avOwned(c,a.id); return `<span style="width:52px;height:52px;display:inline-grid;place-items:center;background:rgba(255,255,255,.85);border-radius:12px;${own?'':'filter:grayscale(1) brightness(.4);opacity:.8'}">${avatarSVG(a.id,44)}</span>`; }).join('');
      return `<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;overflow:hidden;display:flex;flex-direction:column">
        <div style="background:linear-gradient(135deg,${p.c1},${p.c2});padding:13px 14px;display:flex;align-items:center;gap:8px">${preview}<span style="flex:1"></span><span style="font-weight:900;font-size:12px;color:rgba(255,255,255,.95);background:rgba(0,0,0,.22);border-radius:99px;padding:4px 10px">${ownedN}/${avs.length}</span></div>
        <div style="padding:12px 14px 14px;display:flex;flex-direction:column;gap:8px;flex:1">
          <div style="font-family:var(--display);font-weight:800;font-size:15px">${p.label}</div>
          ${full?`<div style="font-weight:800;font-size:13px;color:var(--good);margin-top:auto">Complete ✓ — every avatar collected</div>`
            :`<button data-act="buyPack" data-arg="${p.id}" style="margin-top:auto;display:inline-flex;align-items:center;justify-content:center;gap:7px;padding:11px;border-radius:11px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:900;font-size:13.5px">🎁 Open a pack · ${coinAmt(150,13)}</button>`}
        </div></div>`; }).join('');
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 6px">Every pack drop is a surprise avatar you don't own yet — <b>62% rare · 30% epic · 8% legendary</b>. Duplicates never drop.</p>
      <p style="font-size:12px;color:var(--muted);margin:0 0 14px">Change your mind? Sell spare avatars back for coins from <button data-act="setNav" data-arg="collection" style="color:var(--accent);font-weight:800;background:none;border:0;padding:0;cursor:pointer">your Collection</button>.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px">${packs}</div>`;
  } else if(tab==='worlds'){
    const rows=THEMES.map(t=>{ const on=t.id===S.theme; const un=isThemeUnlocked(t.id); const ev=EVO[t.id]||EVO.spellbound;
      const right=on?'<span style="font-weight:800;font-size:12px;color:var(--accent)">Active</span>':(un?`<span style="font-weight:800;font-size:12px;color:var(--good)">Use</span>`:`<span style="font-weight:900;font-size:12px;color:#a06a00">${coinAmt(COST.theme,12)}</span>`);
      return `<button data-act="${un?'pickTheme':'buyTheme'}" data-arg="${t.id}" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--surface2);border:1px solid ${on?'var(--accent)':'var(--line)'};border-radius:14px;padding:12px 14px;margin-bottom:9px">
        <div style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,${t.c1},${t.c2});flex-shrink:0;color:#fff;${un?'':'filter:grayscale(.5)'}">${un?worldEmblemSVG(t.id,21):iconSVG('lock',19,2.2)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${t.label}</div><div style="font-size:12px;color:var(--muted)">${WORLD_DEF[t.id]||(ev[0]+' → '+ev[9])}</div></div>${right}</button>`; }).join('');
    const unc=THEMES.filter(t=>isThemeUnlocked(t.id)).length;
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${THEMES.length} worlds unlocked · 2 free, ${state.premium?'2 more with Premium, ':''}the rest with coins.</p>${rows}`;
  } else if(tab==='power'){
    const items=[
      {k:'cheer',  ic:'spark', name:'Bee Cheer 🎉', desc:'Bizzy shouts your name with a confetti storm — right now! A perfect first buy.', cost:20, own:0},
      {k:'shield', ic:'crown', name:'Boss Shield 🛡️', desc:'Absorbs one wrong answer in Boss Battle — keep all your lives.', cost:60, own:((c.pow||{}).shield||0)},
      {k:'reveal', ic:'bulb',  name:'Letter Reveal 💡', desc:'Reveals the next letter in Boss Battle. One use each.', cost:40, own:((c.pow||{}).reveal||0)},
      {k:'time',   ic:'timer', name:'Time Warp ⏱️', desc:'+15 seconds on your next Beat the Buzzer sprint. Auto-used.', cost:40, own:((c.pow||{}).time||0)},
      {k:'freeze', ic:'flame', name:'Streak Freeze 🧊', desc:'Miss a day and your daily streak survives. Auto-used.', cost:80, own:(c.freezes||0)},
    ].map(it=>`<div style="display:flex;align-items:center;gap:12px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:9px">
        <div style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--chip);color:var(--accent);flex-shrink:0">${window.SB_ICON?SB_ICON(it.ic,{size:20}):iconSVG('spark',20)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${it.name} ${it.own?`<span style="font-size:12px;color:var(--good);font-weight:800">× ${it.own}</span>`:''}</div><div style="font-size:12px;color:var(--muted)">${it.desc}</div></div>
        <button data-act="buyPower" data-arg="${it.k}" style="padding:9px 14px;border-radius:10px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:900;font-size:13px;white-space:nowrap">${coinAmt(it.cost,12)}</button>
      </div>`).join('');
    const accs=[
      {k:'crown', name:'Golden Crown', desc:'For royalty of the spelling stage.'},
      {k:'bow',   name:'Scarlet Bow', desc:'A dapper bow for word detectives.'},
      {k:'halo',  name:'Star Halo', desc:'Sparkles orbiting a champion.'},
      {k:'goggles',name:'Flight Goggles', desc:'Built for speed spelling.'},
      {k:'cape',  name:'Hero Cape', desc:'Every champion needs one.'},
      {k:'bolt',  name:'Lightning Bolt', desc:'Crackling with word power.'},
    ].map(a=>{ const owned=!!((c.beeAcc||{})[a.k]); const on=c.accOn===a.k;
      return `<div style="display:flex;align-items:center;gap:12px;background:var(--surface2);border:1px solid ${on?'var(--accent)':'var(--line)'};border-radius:14px;padding:12px 14px;margin-bottom:9px">
        <div style="width:44px;height:48px;flex-shrink:0;position:relative">${mascotSVG('happy')}<div style="position:absolute;inset:0">${beeAccSVG(a.k)}</div></div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${a.name}</div><div style="font-size:12px;color:var(--muted)">${a.desc}</div></div>
        ${owned?`<button data-act="wearAcc" data-arg="${a.k}" style="padding:9px 14px;border-radius:10px;background:${on?'var(--action,var(--accent))':'var(--surface)'};color:${on?'var(--action-ink,#fff)':'var(--text)'};font-weight:800;font-size:13px">${on?'Wearing ✓':'Wear'}</button>`
          :`<button data-act="buyAcc" data-arg="${a.k}" style="padding:9px 14px;border-radius:10px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:900;font-size:13px;white-space:nowrap">${coinAmt(120,12)}</button>`}
      </div>`; }).join('');
    body=`<div style="font-family:var(--display);font-weight:800;font-size:15px;margin:2px 2px 4px">Artifacts</div>
      <p style="font-size:13px;color:var(--muted);margin:0 0 12px">Spend coins on artifacts that give you an edge in the games.</p>${items}
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin:16px 2px 10px">Bee style</div>${accs}`;
  }
  else if(tab==='lists'){
    const cats=[{key:'default',label:'Default · Level-Up',sub:'Curated starter words',count:LEVEL_WORDS.length}].concat(coachCatalog().filter(o=>o.key!=='default').map(o=>({key:o.key,label:o.label,sub:o.sub,count:o.count})));
    const rows=cats.map(o=>{ const un=isListUnlocked(o.key); const on=(c.activeList||'default')===o.key;
      const right=on?'<span style="font-weight:800;font-size:12px;color:var(--accent)">Active</span>':(un?'<span style="font-weight:800;font-size:12px;color:var(--good)">Train</span>':`<span style="font-weight:900;font-size:12px;color:#a06a00">${coinAmt(COST.list,12)}</span>`);
      return `<button data-act="${un?'selectList':'buyList'}" data-arg="${o.key}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:var(--surface2);border:1px solid ${on?'var(--accent)':'var(--line)'};border-radius:14px;padding:12px 14px;margin-bottom:9px"><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:15px;display:flex;align-items:center;gap:6px">${un?'':`<span style="color:var(--muted);display:inline-flex">${iconSVG('lock',14,2.2)}</span>`}${esc(o.label)}</div><div style="font-size:12px;color:var(--muted)">${esc(o.sub)} · ${o.count} words</div></div>${right}</button>`; }).join('');
    const unc=cats.filter(o=>isListUnlocked(o.key)).length;
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${cats.length} lists unlocked. Premium lists open with Premium or coins.</p>${rows}`;
  } else {
    const chs=S.conceptData||[]; const total=chs.length||110; const unc=chs.filter((ch,ci)=>isConceptUnlocked(ci)).length;
    const locked=chs.map((ch,ci)=>({ch,ci})).filter(x=>!isConceptUnlocked(x.ci)).slice(0,8);
    const rows=locked.map(({ch,ci})=>`<button data-act="buyConcept" data-arg="${ci}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin-bottom:9px"><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:15px;display:flex;align-items:center;gap:6px"><span style="color:var(--muted);display:inline-flex">${iconSVG('lock',14,2.2)}</span>${esc(conceptShort(ch.title))}</div><div style="font-size:12px;color:var(--muted)">${esc(catGroup(ch.category))} · ${(diffMap[ch.difficulty]||diffMap.medium)[0]}</div></div><span style="font-weight:900;font-size:12px;color:#a06a00;white-space:nowrap">${coinAmt(COST.concept,12)}</span></button>`).join('');
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${total} concepts unlocked. ${state.premium?'Premium opens the easier half — ':'All locked on the free plan — '}unlock more with coins.</p>
      ${locked.length?rows:'<p style="font-size:13px;color:var(--muted)">Everything available is unlocked. 🎉</p>'}
      <button data-act="goConcepts" style="width:100%;margin-top:6px;padding:13px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;border:1px solid var(--line)">Browse all concepts →</button>`;
  }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:13px">← Home</button><span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--display);font-weight:800;font-size:20px;margin-left:4px">${iconSVG("cart",21)} Store</span><span style="margin-left:auto">${coinChip()}</span></div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:13px">Spend the coins you earn from games, Word Coach &amp; Concepts.</p>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">${tabBtn('avatars','crown','Avatars')}${tabBtn('worlds','palette','Worlds')}${tabBtn('power','spark','Artifacts')}${tabBtn('lists','book','Word lists')}${tabBtn('concepts','grid','Concepts')}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px">${body}</div>
    ${packDropOverlay()}
  </div>`; }
/* Pack-drop reveal: modal card over the Store after opening a pack. */
function packDropOverlay(){ const id=state.packDrop; if(!id) return '';
  const a=SB_AVATARS.byId[id]; if(!a) return ''; const R=SB_AVATARS.rarities[a.rarity]||{label:a.rarity,c:'#888'};
  const leg=a.rarity==='legendary';
  return `<div data-act="packClose" style="position:fixed;inset:0;background:rgba(20,14,40,.72);z-index:80;display:grid;place-items:center;padding:20px;animation:sb-pop .25s ease both">
    <div data-act="noop" style="background:linear-gradient(160deg,#3A2F5C,#241A47);border:1px solid rgba(255,255,255,.2);border-radius:24px;padding:28px 34px;text-align:center;max-width:330px;width:100%;box-shadow:0 0 60px ${leg?'rgba(255,194,61,.45)':'rgba(233,225,255,.25)'}">
      <div style="font-family:var(--mono);font-size:11px;font-weight:700;letter-spacing:.16em;color:#C9BFEA;margin-bottom:12px">PACK OPENED</div>
      <div style="width:150px;height:150px;margin:0 auto;animation:sb-pop .5s ease both">${SB_AVATAR(a.id,150,{dark:true})}</div>
      <div style="display:inline-block;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:${R.c};border-radius:99px;padding:4px 12px;margin:14px 0 6px">${R.label}${leg?' ✦':''}</div>
      <div style="font-family:var(--display);color:#fff;font-weight:800;font-size:22px">${esc(a.name)}</div>
      <div style="display:flex;gap:9px;justify-content:center;margin-top:20px">
        <button data-act="packWear" style="padding:12px 22px;border-radius:99px;background:#FFC23D;color:#241E33;font-weight:800;font-size:14px;box-shadow:0 4px 0 #C8891B">Wear now</button>
        <button data-act="packClose" style="padding:12px 18px;border-radius:99px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.25);color:#E9E1FF;font-weight:800;font-size:13px">Keep it</button>
      </div>
    </div></div>`; }
function gameShell(statusBar, inner){ return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px">${statusBar}<div style="display:flex;align-items:center;gap:10px">${coinChip()}<button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div></div>
    ${inner}</div>`; }
function typedGame(){ const S=state; const g=S.game; const w=g.list[g.i]; let statusBar='';
  if(g.type==='beat'){ const low=g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:20px;color:${low?'var(--bad)':'var(--accent)'};min-width:54px">⏱ ${g.timeLeft}s</span><span style="font-family:var(--mono);font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else if(g.type==='boss'){ const hpPct=Math.round(g.hp/g.maxhp*100); const hearts='❤️'.repeat(g.lives)+'🖤'.repeat(g.maxlives-g.lives); const sh=(active().pow||{}).shield||0;
    statusBar=`<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-size:20px">👹</span><div style="flex:1;height:11px;border-radius:999px;background:var(--surface2);overflow:hidden;max-width:220px"><div style="height:100%;border-radius:999px;background:linear-gradient(90deg,#FF4D8D,#d63a3a);width:${hpPct}%;transition:width .35s"></div></div><span style="font-size:13px">${hearts}${sh?' <span title="Boss Shields — each absorbs one miss">🛡️×'+sh+'</span>':''}</span></div></div>`; }
  else if(g.type==='champ'){ const low=g.fmt==='timed'&&g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:17px;color:var(--accent)">⚡ Challenge</span>${g.fmt==='timed'?`<span style="font-family:var(--display);font-weight:900;font-size:17px;color:${low?'var(--bad)':'var(--accent)'}">⏱ ${g.timeLeft}s</span>`:`<span style="font-family:var(--mono);font-size:13px;color:var(--muted)">${g.i+1}/${g.total}</span>`}<span style="font-family:var(--mono);font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else statusBar=`<div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.list.length} · ✓ ${g.right}</div>`;
  const hint = S.gInfo ? `<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 15px;text-align:left;font-size:13px;line-height:1.55;margin-bottom:14px">${w.d?('<b>Meaning</b> — '+blankHTML(w.d,w.w)):''}${w.d&&w.s?'<br>':''}${w.s?('<b>Sentence</b> — '+blankHTML(w.s,w.w)):''}${w.h?('<br><span style="display:inline-flex;align-items:center;gap:5px;color:var(--accent);vertical-align:middle">'+iconSVG('bulb',14)+'</span> '+blankHTML(w.h,w.w)):''}${(!w.d&&!w.s)?'No hint for this one — listen closely!':''}</div>` : '';
  let bossFb=''; if(g.type==='boss'&&g.last&&g.last.ok&&!g.fb){ bossFb=`<div style="color:#1f9d57;font-weight:800;font-size:13px;margin-bottom:12px">💥 Hit! Boss took damage.</div>`; }
  if(g.fb&&!g.fb.ok){ bossFb=`<div style="background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C);border-radius:14px;padding:14px;margin-bottom:14px;animation:sb-pop .3s ease both">
      <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--fix,#C4453C)">Look &amp; listen — it's spelled</div>
      <div style="font-family:var(--entry);font-weight:800;font-size:clamp(24px,6vw,32px);letter-spacing:.16em;color:var(--text);margin-top:4px">${esc(g.fb.word)}</div></div>`; }
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,32px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">${g.type==='boss'?'Spell it to attack!':'Listen and type'}</p>
      <button data-act="gSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px"><button data-act="gSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${g.type==='boss'&&((active().pow||{}).reveal||0)>0?`<button data-act="gReveal" style="padding:9px 14px;border-radius:999px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:13px">💡 Reveal letter × ${(active().pow||{}).reveal}</button>`:''}<button data-act="gInfoToggle" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line);${S.gInfo?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">💡 Hint</button></div>
      ${hint}${bossFb}
      <input data-inp="onType" data-key="gKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="type here" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:14px">
      <button data-act="gSubmit" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${g.type==='boss'?'Attack! ⚔️':'Enter →'}</button>
    </div>`;
  return gameShell(statusBar, inner); }
// End-of-game reveal: what was right, what was wrong, and coaching tips drawn from the words themselves
const TRAP_TIP={ double:'Twin letters mark where syllables split — rab·bit, oc·cur·rence. Spell each half and keep both letters.',
  silent:'Silent letters travel in families: kn-, wr-, -mb, gh. Learn the family once and a dozen words come free.',
  ieei:'i before e except after c — and right after c it flips: receive, ceiling.',
  schwa:'That mumbled “uh” hides a letter. Say it robot-style — choc-O-late, sep-A-rate — and the letter appears.',
  endings:'Suffixes come in families (-tion, -ance/-ence, -able/-ible). Say a relative out loud — the family shares its spelling.',
  french:'French words hide their endings — ballet, bouquet. When a word sounds fancy, ask its origin.',
  greek:'Greek words love ph, y, and ch that sounds like k — photo, gym, chorus.',
  latin:'Latin roots repeat everywhere — find the root, reuse its spelling.' };
function gameReveal(g){ const rw=(g&&g.rw)||[]; if(!rw.length) return '';
  const right=rw.filter(x=>x.ok), wrong=rw.filter(x=>!x.ok); const idx=wordIndex();
  const chip=(w,ok)=>`<button data-act="say" data-arg="${escA(w)}" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;background:${ok?'var(--mastered-tint,#E1F4E8)':'var(--fix-tint,#FBE9E7)'};color:${ok?'var(--mastered,#178A4C)':'var(--fix,#C4453C)'}">${esc(w)}</button>`;
  // tips: each missed word's own hook first, then one pattern tip from the trap the misses share
  const tips=[]; wrong.slice(0,3).forEach(x=>{ const w=idx[nkey(x.w)]; if(w&&w.h) tips.push({t:'“'+w.w+'” — '+w.h}); });
  const b={}; wrong.forEach(x=>{ const w=idx[nkey(x.w)]||{w:x.w}; TRAP_DEFS.forEach(([k,re])=>{ if(re.test(w.w)) b[k]=(b[k]||0)+1; }); const o=((idx[nkey(x.w)]||{}).o||'').toLowerCase(); if(/french/.test(o))b.french=(b.french||0)+1; if(/greek/.test(o))b.greek=(b.greek||0)+1; });
  const topTrap=Object.keys(b).sort((a,c)=>b[c]-b[a])[0];
  if(topTrap&&TRAP_TIP[topTrap]) tips.push({t:TRAP_TIP[topTrap]});
  const tipRows=tips.slice(0,3).map(t=>`<div style="display:flex;gap:9px;align-items:flex-start;text-align:left;padding:10px 12px;border-radius:12px;background:var(--surface)"><span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00)">${window.SB_ICON?SB_ICON('bulb',{size:16}):iconSVG('bulb',16)}</span><span style="font-size:13px;line-height:1.5;color:var(--ink,var(--text))">${esc(t.t)}</span></div>`).join('');
  return `<div style="text-align:left;margin:16px 0 4px">
    ${right.length?`<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--mastered,#178A4C);margin-bottom:6px">Got right · ${right.length}</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">${right.map(x=>chip(x.w,true)).join('')}</div>`:''}
    ${wrong.length?`<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--fix,#C4453C);margin-bottom:6px">To fix · ${wrong.length}</div><div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px">${wrong.map(x=>chip(x.w,false)).join('')}</div>`:''}
    ${tipRows?`<div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin:2px 0 6px">Coach tips</div><div style="display:flex;flex-direction:column;gap:7px">${tipRows}</div>`:''}
  </div>`; }
function typedDone(){ const S=state; const g=S.game; let title,big,sub;
  if(g.type==='boss'){ title=g.status==='won'?'Boss defeated! 🏆':'You were beaten 👹'; big=g.status==='won'?'VICTORY':'TRY AGAIN'; sub=g.status==='won'?('You landed '+(g.right||0)+' hits'):('You landed '+(g.right||0)+' hits before falling'); }
  else if(g.type==='beat'){ title=g.right>=12?'Lightning speller! ⚡':'Time! ⏱'; big=g.right+' words'; sub='spelled in 60 seconds'; }
  else { const pct=Math.round(g.right/(g.ans.length||1)*100); title=pct>=80?'Strong round! 🏆':pct>=50?'Nice work 💪':'Keep training 🌱'; big=g.right+'/'+g.ans.length; sub=pct+'% correct'; }
  return `<div style="max-width:560px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px">
      <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:74px;height:82px">${mascotSVG(g.status==='lost'?'oops':'love')}</div></div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px">${title}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1">${big}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px">${sub}</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${iconSVG('coin',15)} +${g.bonus||0} coins earned</div>
      ${gameReveal(g)}
    </div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitGame" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">← Arcade</button><button data-act="gReplay" style="padding:13px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Play again →</button></div>
  </div>`; }
function mcGame(){ const S=state; const g=S.game; const q=g.qs[g.i]; const mono=q.kind==='spell';
  const statusBar=`<div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.qs.length} · ✓ ${g.right} <span class="sb-mob-hide" style="opacity:.7">· keys 1–4 pick · R repeat</span></div>`;
  const choices=q.choices.map((ch,idx)=>{ let bg='var(--surface2)',col='var(--text)',bd='var(--line)';
    if(g.picked!=null){ if(ch===q.answer){ bg='color-mix(in srgb,#1f9d57 20%,var(--bg2))'; col='var(--text)'; bd='#1f9d57'; } else if(idx===g.picked){ bg='color-mix(in srgb,var(--bad) 18%,var(--bg2))'; bd='var(--bad)'; } }
    return `<button data-act="gPick" data-arg="${idx}" ${g.picked!=null?'disabled':''} style="text-align:${mono?'center':'left'};padding:15px 17px;border-radius:14px;background:${bg};border:2px solid ${bd};color:${col};font-family:${mono?'var(--mono)':'var(--display)'};font-weight:800;font-size:15px;${mono?'letter-spacing:.04em;':''}">${esc(ch)}</button>`; }).join('');
  const hearBtn=(label)=>`<button data-act="gSayQ" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">${iconSVG('volume',15)} ${label}</button>`;
  const eyebrow=(t)=>`<div style="font-size:12px;color:var(--muted);font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">${t}</div>`;
  let prompt;
  if(q.kind==='sentence') prompt=`${eyebrow('Fill the blank')}<div style="font-size:clamp(17px,3.6vw,21px);line-height:1.6;font-weight:600">${q.prompt}</div>${hearBtn('Hear sentence')}`;
  else if(q.kind==='origin') prompt=`${eyebrow('Where does it come from?')}<div style="font-family:var(--display);font-size:clamp(20px,4.5vw,28px);font-weight:800">${q.prompt}</div>${hearBtn('Hear word')}`;
  else if(q.kind==='spell') prompt=`${eyebrow('Which spelling is correct?')}<div style="font-size:clamp(15px,3.4vw,19px);line-height:1.5;font-weight:600;color:var(--muted)">${q.prompt}</div>${hearBtn('Hear word')}`;
  else if(q.kind==='idiom') prompt=`${eyebrow('What does it mean?')}<div style="font-family:var(--display);font-size:clamp(18px,4vw,25px);font-weight:800;line-height:1.3">“${q.prompt}”</div>${hearBtn('Hear it')}`;
  else if(q.kind==='simile2') prompt=`${eyebrow('Complete the simile')}<div style="font-family:var(--display);font-size:clamp(18px,4vw,25px);font-weight:800;line-height:1.3">${q.prompt}</div>${hearBtn('Hear it')}`;
  else if(q.kind==='vocab') prompt=`${eyebrow('What does it mean?')}<div style="font-family:var(--display);font-size:clamp(22px,5vw,30px);font-weight:800;letter-spacing:.02em">${q.prompt}</div>${q.p2?`<div style=\"font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:4px\">${esc(q.p2)}</div>`:''}${hearBtn('Hear the word')}`;
  else prompt=`${eyebrow('Which word means…')}<div style="font-size:clamp(17px,3.6vw,21px);line-height:1.55;font-weight:600">“${q.prompt}”</div>`;
  const wrongPick=g.picked!=null && q.choices[g.picked]!==q.answer;
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4.5vw,30px);box-shadow:var(--glow);margin-bottom:14px;text-align:center">${prompt}</div>
    ${wrongPick?`<div style="background:var(--fix-tint,#FBE9E7);border:1.5px solid var(--fix,#C4453C);border-radius:12px;padding:10px 14px;margin-bottom:12px;text-align:center;font-weight:800;font-size:14px;animation:sb-pop .3s ease both">✗ The answer: <span style="color:var(--fix,#C4453C)">${esc(trunc(q.answer,90))}</span></div>`:''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:11px">${choices}</div>`;
  return gameShell(statusBar, inner); }
function mcDone(){ const g=state.game; const pct=Math.round(g.right/(g.qs.length||1)*100);
  return `<div style="max-width:560px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px">
      <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:74px;height:82px">${mascotSVG('love')}</div></div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px">${pct>=80?'Word wizard! 🧙':pct>=50?'Good thinking 💪':'Keep learning 🌱'}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1">${g.right}/${g.qs.length}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px">${pct}% correct</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${iconSVG('coin',15)} +${g.bonus||0} coins earned</div>
      ${gameReveal(g)}
    </div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitGame" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">← Arcade</button><button data-act="gReplay" style="padding:13px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Play again →</button></div>
  </div>`; }


/* ===================== OVERLAYS ===================== */
function overlays(){
  const S=state; let h='';
  if(S.showPaywall){
    const perks=['4 worlds unlocked (2 more than free)','Spelling Basics free + half of all 121 concepts unlocked','Level up past Level 5 on every list','Premium word lists + full library','Earn 🪙 coins to unlock everything else']
      .map(p=>`<div style="display:flex;align-items:center;gap:11px;font-size:15px;font-weight:600"><span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:13px;flex-shrink:0">✓</span>${p}</div>`).join('');
    const planStyle=(on)=>'flex:1;text-align:left;border-radius:14px;padding:14px;cursor:pointer;background:var(--surface2);border:2px solid '+(on?'var(--accent)':'transparent');
    h+=`<div data-act="closePaywall" style="position:fixed;inset:0;z-index:60;background:rgba(10,8,20,.55);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px">
      <div data-act="noop" style="width:100%;max-width:460px;background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(24px,5vw,34px);box-shadow:var(--glow);animation:sb-pop .35s ease both;max-height:92dvh;overflow:auto">
        <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:70px;height:78px">${mascotSVG('love')}</div></div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;text-align:center;margin:0 0 4px">Go Premium</h2>
        <p style="text-align:center;color:var(--muted);font-size:13px;margin:0 0 20px">Unlock 4 worlds, half the concepts, and uncapped levels — then earn coins for the rest.</p>
        <div style="display:grid;gap:9px;margin-bottom:20px">${perks}</div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <button data-act="pickPlan" data-arg="year" style="${planStyle(S.plan==='year')}"><div style="font-size:12px;font-weight:800;color:var(--accent);letter-spacing:.04em">BEST VALUE · SAVE 38%</div><div style="font-family:var(--display);font-weight:800;font-size:20px">$59<span style="font-size:13px;color:var(--muted)">/yr</span></div><div style="font-size:12px;color:var(--muted)">$4.92 / month</div></button>
          <button data-act="pickPlan" data-arg="month" style="${planStyle(S.plan==='month')}"><div style="font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.04em">MONTHLY</div><div style="font-family:var(--display);font-weight:800;font-size:20px">$7.99<span style="font-size:13px;color:var(--muted)">/mo</span></div><div style="font-size:12px;color:var(--muted)">billed monthly</div></button>
        </div>
        <button data-act="upgrade" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Start 7-day free trial</button>
        <div style="text-align:center;margin-top:12px"><button data-act="closePaywall" style="color:var(--muted);font-size:13px;font-weight:600">Maybe later</button></div>
      </div></div>`;
  }
  if(S.fullLoading) h+=`<div style="position:fixed;inset:0;z-index:65;background:rgba(10,8,20,.5);backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px">
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:28px 30px;text-align:center;box-shadow:var(--glow);max-width:340px">
        <div style="width:64px;height:72px;margin:0 auto 12px;animation:sb-float 2.5s ease-in-out infinite">${mascotSVG('happy')}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;margin-bottom:6px">Loading the full library…</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5">All 128,000 words — this one-time load takes a few seconds.</div>
        <div style="width:28px;height:28px;margin:14px auto 0;border:3px solid var(--surface2);border-top-color:var(--accent);border-radius:50%;animation:sb-spin .8s linear infinite"></div>
      </div></div>`;
  if(S.pinDlg) h+=`<div style="position:fixed;inset:0;z-index:130;display:grid;place-items:center;padding:20px;background:rgb(20 12 40 / .6)" data-act="pinCancel">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;box-shadow:var(--sh-overlay);width:100%;max-width:320px;padding:26px 24px;text-align:center;animation:sb-pop .3s ease both">
      <div style="font-size:34px">🔐</div>
      <div style="font-family:var(--display);font-weight:800;font-size:19px;margin:4px 0 2px">${esc(S.pinDlg.label)}</div>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:14px">${S.pinDlg.wrong?'<b style="color:var(--bad,#D6453A)">Wrong PIN — try again</b>':'Ask a grown-up to enter the 4-digit PIN.'}</div>
      <div style="display:flex;gap:9px;justify-content:center;margin-bottom:16px">${[0,1,2,3].map(i=>`<span style="width:15px;height:15px;border-radius:50%;border:2px solid var(--accent);display:inline-block;background:${i<S.pinDlg.typed.length?'var(--accent)':'transparent'}"></span>`).join('')}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${['1','2','3','4','5','6','7','8','9','del','0','x'].map(k=>k==='x'?`<button data-act="pinCancel" style="padding:13px 0;border-radius:12px;background:var(--surface2);font-weight:800;font-size:13px;color:var(--muted)">Cancel</button>`:`<button data-act="pinKey" data-arg="${k}" style="padding:13px 0;border-radius:12px;background:${k==='del'?'var(--surface2)':'var(--chip)'};font-weight:800;font-size:${k==='del'?'12px':'17px'};color:${k==='del'?'var(--muted)':'var(--accent)'}">${k==='del'?'⌫':k}</button>`).join('')}</div>
    </div></div>`;
  if(S.toast) h+=`<div class="sb-toast" style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:70;background:var(--accent);color:#fff;font-weight:800;font-size:15px;padding:13px 22px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:sb-pop .35s ease both;display:flex;align-items:center;gap:9px">${esc(S.toast)}</div>`;
  return h;
}

/* ===================== render + events ===================== */
const root = document.getElementById('root');
function save(){ try{ localStorage.setItem('sb_saas_v2', JSON.stringify({ theme:state.theme, mode:state.mode, premium:state.premium, pin:state.parentPin||null, vr:state.voiceRate||1, tz:state.textSize||'normal', ra:state.readAloud?1:0, children:state.children, activeIdx:state.activeIdx, goalDone:state.goalDone, cN:(window.SB_CONCEPTS&&SB_CONCEPTS.chapters&&SB_CONCEPTS.chapters.length)||121, lu:state.luMastered, srs:state.coachSrs, chist:state.coachHistory, wr:state.wordReports||[] })); }catch(e){} }
function render(){
  const a=document.activeElement; const fkey=a&&a.getAttribute&&a.getAttribute('data-fkey'); let ss=null,se=null;
  try{ if(a){ ss=a.selectionStart; se=a.selectionEnd; } }catch(e){}
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-mode', state.mode);
  document.documentElement.setAttribute('data-size', state.textSize||'normal');
  try{ const _c=active(); document.documentElement.setAttribute('data-age', _c.ageMode||((_c.age||9)<=11?'playful':'focused')); }catch(e){}
  root.innerHTML = `<div style="min-height:100dvh;position:relative;z-index:1">${view()}</div>` + overlays();
  if(fkey){ const el=root.querySelector('[data-fkey="'+fkey+'"]'); if(el){ try{ el.focus(); if(ss!=null&&el.setSelectionRange) el.setSelectionRange(ss,se); }catch(e){} } }
  save();
}
function callAct(act, arg, ev){ const fn=app[act]; if(typeof fn==='function') fn(arg, ev); }
root.addEventListener('click', e=>{ const el=e.target.closest('[data-act]'); if(!el) return; callAct(el.getAttribute('data-act'), el.getAttribute('data-arg')); });
root.addEventListener('input', e=>{ const el=e.target.closest('[data-inp]'); if(!el) return; callAct(el.getAttribute('data-inp'), el.value); });
root.addEventListener('change', e=>{ const el=e.target.closest('[data-chg]'); if(!el) return; callAct(el.getAttribute('data-chg'), el.value); });
root.addEventListener('keydown', e=>{ const el=e.target.closest('[data-key]'); if(!el) return; const fn=app[el.getAttribute('data-key')]; if(fn) fn(e); });
/* game hotkeys: 1–4 pick an answer, R repeats the word, D shows the hint (never while typing) */
window.addEventListener('keydown', e=>{ try{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const t=e.target; if(t && (t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable)) return;
  const g=state.game; if(!g || state.nav!=='games' || state.pinDlg) return;
  if(g.qs && g.picked==null && g.status==='play'){
    if(e.key>='1'&&e.key<='4'){ const q=g.qs[g.i]; if(q && q.choices[+e.key-1]!=null){ e.preventDefault(); app.gPick(String(+e.key-1)); } return; }
    if(e.key==='r'||e.key==='R'){ e.preventDefault(); app.gSayQ(); return; } }
  if(g.list && !g.qs && g.status==='play'){
    if(e.key==='r'||e.key==='R'){ e.preventDefault(); app.gSay(); return; }
    if(e.key==='d'||e.key==='D'){ e.preventDefault(); app.gInfoToggle(); return; } }
}catch(err){} });

/* ===================== init ===================== */
(function init(){
  try{ const raw=localStorage.getItem('sb_saas_v2'); if(raw){ const s=JSON.parse(raw);
    state.theme=s.theme||'spellbound'; state.mode=s.mode||'light'; state.premium=!!s.premium; state.parentPin=s.pin||null; state.voiceRate=s.vr||1; state.textSize=s.tz||'normal'; state.readAloud=!!s.ra;
    state.children=s.children||[]; state.activeIdx=s.activeIdx||0; state.goalDone=s.goalDone||0;
    state.luMastered=s.lu||{}; state.coachSrs=s.srs||{}; state.coachHistory=s.chist||{}; state.wordReports=s.wr||[];
    // Chapter 1 insert shifted concept indices by 11 — migrate index-keyed coin unlocks once
    try{ const shift=(((window.SB_CONCEPTS&&SB_CONCEPTS.chapters&&SB_CONCEPTS.chapters.length)||121))-(s.cN||110);
      if(shift>0) state.children.forEach(ch=>{ if(ch.unlockedConcepts){ const u={}; Object.keys(ch.unlockedConcepts).forEach(k=>{ u[+k+shift]=1; }); ch.unlockedConcepts=u; } }); }catch(e){}
    try{ state.children.forEach(ensureLists); }catch(e){}
    try{ syncMissed(); }catch(e){}
    state.screen=(s.children&&s.children.length)?'app':'landing'; state.nav='home';
  } }catch(e){}
  try{ if(localStorage.getItem('sb_devunlock')==='1'){ state.devUnlock=true; state.premium=true; } }catch(e){}
  try{ loadVoiceCfg(); }catch(e){}
  try{ loadEvoFB(); }catch(e){}
  try{ loadVoices(); window.speechSynthesis.onvoiceschanged=loadVoices; }catch(e){}
  // Back-button trap: a kid pressing Back mid-game goes Home instead of leaving the app
  try{ history.pushState({sb:1},''); window.addEventListener('popstate',()=>{ try{ history.pushState({sb:1},'');
    if(state.screen==='app' && state.nav!=='home'){ state.game=null; state.sq=null; tyStop&&tyStop(); state.nav='home'; render(); } }catch(e){} }); }catch(e){}
  render();
})();

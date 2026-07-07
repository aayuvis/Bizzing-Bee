"use strict";
/* =====================================================================
   Spellbound app — part 3: state, logic, views, render + event wiring.
   Ported from the renderVals()/handlers in Spellbound App.dc.html.
   ===================================================================== */
const EVO = EV_NOMEN; // evolution nomenclature (shared with the emblem engine)

/* ---------------- state ---------------- */
const state = {
  screen:'landing', authMode:'signup', email:'', pw:'',
  onbStep:0, draft:{ name:'', age:9, avatar:'bee', goal:10 }, addingMore:false,
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

/* ===== The Spellbound Journey — ONE Level ladder.
   Levels 1–20 = "Spellbound Champ": the ~1,600 highest-value bee words, ramped easy→hard.
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
const daysToBee = () => { const d=Math.ceil((new Date('2026-07-31') - new Date())/86400000); return d>0?d:0; };
/* ---- Lists (tracks): per-list XP/level; mastery stays global (word knowledge) ---- */
const FREE_LEVEL_CAP = 5; const WORK_MAX = 40;
/* Leveling curve: easy at first, then near-exponential — each level needs more XP than the last.
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
function isConceptUnlocked(ci){ if(state.devUnlock) return true; if((active().unlockedConcepts||{})[ci]) return true; if(state.premium && ci<conceptHalf()) return true; return false; }
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
  c.streak = (!c.lastActiveDay) ? 1 : (d===1 ? (c.streak||0)+1 : (d>1 ? 1 : (c.streak||1)));
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
const ACT_LABEL = { practice:'Practice', buzz:'Buzz of the Day', beat:'Beat the Buzzer', boss:'Boss Battle', meaning:'Meaning Match', spell:'Spot the Spelling', origin:'Origin Detective', magic:'Magic Squares', written:'Written round', oral:'Oral elimination', concept:'Concept study' };
function getList(c,key){ ensureLists(c); if(!c.lists[key]) c.lists[key]={xp:0}; return c.lists[key]; }
function levelCap(){ return (state.premium||state.devUnlock) ? Infinity : FREE_LEVEL_CAP; }
function listLevelRaw(c,key){ return levelFromXp(getList(c,key).xp||0).level; }
function listProgress(c,key){ return levelFromXp(getList(c,key).xp||0); } // {level,into,need}
function listLevel(c,key){ return Math.min(listLevelRaw(c,key), levelCap()); }
function activeListKey(){ return (active().activeList)||'default'; }
function overallLevel(c){ ensureLists(c); const ks=Object.keys(c.lists||{}); if(!ks.length) return 1; const ls=ks.map(k=>listLevel(c,k)); const best=Math.max(...ls); const avg=ls.reduce((a,b)=>a+b,0)/ls.length; return Math.max(1, Math.round(best*0.6 + avg*0.4)); }
function listBaseLabel(key){ if(key==='default') return 'Default · Level-Up'; if(key==='journey') return 'The Spellbound Journey'; if(isThemeKey(key)){ const t=themeOf(key.slice(3)); if(t) return t.label; } const cat=coachCatalog().find(c=>c.key===key); return cat?cat.label:key; }
function listLabel(key){ const custom=((active().listNames)||{})[key]; return custom||listBaseLabel(key); }
function listWords(key){ return stageWords(key); }            // current stage's words (staged progression)
function listFullWords(key){ if(key==='default') return defaultStages().reduce((a,s)=>a.concat(s.words),[]); return rawListWords(key); }
function workingSet(key){ const ws=listWords(key); if(ws.length<=WORK_MAX) return ws.slice();
  const un=ws.filter(w=>!state.luMastered[nkey(w.w)]); const pool=un.length>=24?un:ws;
  // focus on the most bee-likely words: shuffle a batch of 24 from the top of the bp ranking
  const ranked=pool.slice().sort((a,b)=>(b.bp||0)-(a.bp||0)).slice(0, Math.min(pool.length, 80));
  return sample(ranked, 24); }
// bee-likelihood as 5 dots (●●●○○) from a 0–100 probability score
function beeOdds(bp){ const n=Math.max(1,Math.min(5,Math.round((bp||0)/20))); return '●'.repeat(n)+'○'.repeat(5-n); }
// Build the Word Coach working set for a list ONCE and keep it stable while you navigate —
// only rebuilt when the active list changes (or after a drill clears sessionListKey).
function resetSessionScore(){ state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; }
function ensureCoachWords(key){ if(state.sessionListKey!==key || !(state.sessionWords&&state.sessionWords.length)){
    state.sessionWords=workingSet(key); state.sessionListKey=key; state.sessionLabel=listLabel(key);
    state.reviseIdx=Math.min(state.reviseIdx||0, Math.max(0,state.sessionWords.length-1)); state.gi=0; resetSessionScore(); }
  return state.sessionWords; }
function newCoachBatch(){ const key=state.sessionListKey||activeListKey(); state.sessionWords=workingSet(key); state.sessionListKey=key; state.reviseIdx=0; state.gi=0; resetSessionScore(); }
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
function speak(){ deviceSpeak(curWord().w, 0.9); }
function say(text,rate){ deviceSpeak(text, rate||0.95); }
// split a sentence around its target word (and simple inflections) so we can read it aloud
// WITHOUT speaking the answer — used by "Finish the Sentence"
function maskParts(sentence, word){ const t=sentence||''; const w=(word||'').trim(); if(!w) return {before:t, after:'', matched:false};
  let re; try{ re=new RegExp('\\b'+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','i'); }catch(e){ return {before:t, after:'', matched:false}; }
  const m=t.match(re); if(!m) return {before:t, after:'', matched:false};
  return { before:t.slice(0,m.index).trim(), after:t.slice(m.index+m[0].length).trim(), matched:true }; }
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
  if(S.aiWords&&S.aiWords.length) cats.push({ key:'ai', label:(S.aiLabel||'AI smart list'), sub:'Generated by Coach AI', words:S.aiWords });
  return cats.map(c=>({ ...c, count: c.key==='all' ? (window.SB_FULL?window.SB_FULL.length:128040) : (c.words||[]).length }));
}
const coachActiveCat = () => { const c=coachCatalog(); return c.find(x=>x.key===state.coachTargetKey)||c[0]; };
const coachPool = () => { const w=listWords(activeListKey()); return (w&&w.length)?w.slice():(coachActiveCat().words||[]).slice(); };
const srsState = (r) => { if(!r||!r.seen) return 'new'; if(r.box>=5) return 'mastered'; if(r.box>=3) return 'review'; return 'learning'; };
function recordCoach(word,ok){ const srs={...(state.coachSrs||{})}; const k=nkey(word);
  const r={ seen:0,correct:0,wrong:0,box:0, ...(srs[k]||{}) };
  r.seen++; if(ok){ r.correct++; r.box=Math.min(5,r.box+1); } else { r.wrong++; r.box=1; } srs[k]=r;
  const today=new Date().toISOString().slice(0,10); const hist={...(state.coachHistory||{})}; hist[today]=(hist[today]||0)+1;
  state.coachSrs=srs; state.coachHistory=hist; }
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
    } else { set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bee',goal:10}}); } },
  // onboarding
  onDraftName:(v)=>set({draft:{...state.draft,name:v}}),
  onDraftAge:(v)=>set({draft:{...state.draft,age:+v}}),
  pickAvatar:(id)=>set({draft:{...state.draft,avatar:id}}),
  pickGoal:(v)=>set({draft:{...state.draft,goal:+v}}),
  onbBack:()=>{ if(state.onbStep===0){ set({screen: state.addingMore?'app':'auth'}); } else set({onbStep:state.onbStep-1}); },
  onbNext:()=>{ const S=state;
    if(S.onbStep===0 && !S.draft.name.trim()){ flash('Add a name to continue'); return; }
    if(S.onbStep<2){ set({onbStep:S.onbStep+1}); return; }
    const kid={ name:S.draft.name.trim(), age:S.draft.age, avatar:S.draft.avatar, theme:S.theme, goal:S.draft.goal, level:1, streak:0, acc:0, xp:0, week:[0,0,0,0,0,0,0] };
    const newIdx=S.children.length; state.children=[...S.children,kid]; state.activeIdx=newIdx; state.goalDone=0; state.addingMore=false;
    set({screen:'app', nav:'home'}); flash('Profile ready — let’s spell! 🐝'); },
  // theme / mode
  pickTheme:(id)=>{ if(!isThemeUnlocked(id)){ app.buyTheme(id); return; } const children=state.children.slice(); if(children[state.activeIdx]) children[state.activeIdx]={...children[state.activeIdx],theme:id}; set({theme:id, children}); },
  buyTheme:(id)=>{ if(isThemeUnlocked(id)) return app.pickTheme(id); if(spendCoins(COST.theme)){ const c=active(); c.unlockedThemes=[...(c.unlockedThemes||[]),id]; sfx('win'); burstConfetti(70); flash('New world unlocked! 🎨'); app.pickTheme(id); } else { flash('Need '+COST.theme+' 🪙 — play games to earn!'); } },
  buyList:(key)=>{ if(isListUnlocked(key)) return app.selectList(key); if(spendCoins(COST.list)){ const c=active(); c.unlockedLists={...(c.unlockedLists||{}),[key]:1}; sfx('win'); burstConfetti(70); flash('List unlocked! 🔓'); app.selectList(key); } else { flash('Need '+COST.list+' 🪙 to unlock — earn by playing!'); } },
  buyConcept:(ci)=>{ ci=+ci; if(isConceptUnlocked(ci)) return app.openConcept(ci); if(spendCoins(COST.concept)){ const c=active(); c.unlockedConcepts={...(c.unlockedConcepts||{}),[ci]:1}; sfx('win'); burstConfetti(70); flash('Concept unlocked! 🔓'); app.openConcept(ci); } else { flash('Need '+COST.concept+' 🪙 to unlock — earn by playing!'); } },
  boostLevel:()=>{ const c=active(); const key=activeListKey(); if(!state.premium && listLevelRaw(c,key)>=FREE_LEVEL_CAP){ flash('Default caps at Level 5 — go Premium to climb higher 👑'); return; } if(spendCoins(COST.boost)){ const lp=getList(c,key); const lf=levelFromXp(lp.xp||0); lp.xp=(lp.xp||0)+(lf.need-lf.into); sfx('level'); burstConfetti(60); flash('⚡ Level boost! +1 level'); render(); } else { flash('Need '+COST.boost+' 🪙 for a boost'); } },
  setMode:(m)=>set({mode:m}),
  // nav
  setNav:(key)=>{ if(key==='train'){ app.startTrain(); return; } if(key==='coach'){ app.openCoach(); return; } if(key==='games'){ app.openGames(); return; } if(key==='shop'){ app.openShop(); return; } if(key==='journeys'){ app.openJourneys(); return; }
    if(key==='concepts'){ loadConcepts(); state.conceptView='all'; state.conceptTier=currentTier(); state.conceptPage=0; }
    set({nav:key, screen:'app', mood:'happy', conceptSel:null}); },
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
  exitTrain:()=>{ if((state.sessionDone||0)>0){ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, []); } if(state.coachSession){ state.coachSession=false; app.openCoach(); } else app.setNav('home'); },
  onType:(v)=>{ state.typed=v; render(); },
  trainKey:(e)=>{ if(e.key==='Enter'){ if(state.status==='idle') app.check(); else app.next(); } },
  toggleDef:()=>set({showDef:!state.showDef}),
  toggleSent:()=>{ const on=!state.showSent; if(on){ const w=curWord(); if(w&&w.s) say(w.s); } set({showSent:on}); },
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
    // remember this word's outcome for the end-of-list summary (latest attempt wins)
    { const rk=nkey(target); state.sessionCorrect=(state.sessionCorrect||[]).filter(x=>nkey(x.w)!==rk); state.sessionWrong=(state.sessionWrong||[]).filter(x=>nkey(x.w)!==rk); (ans===target?state.sessionCorrect:state.sessionWrong).push(cw); }
    if(ans===target){
      markMastered(target);
      const streakRight=(state._run||0)+1; const mood=streakRight>=3?'love':'excited';
      state.goalDone=state.goalDone+1; state._run=streakRight; state.sessionRight+=1; state.sessionDone+=1;
      const c=active(); c.acc=Math.min(99, Math.round(((c.acc||80)*0.85)+15));
      sfx('correct'); addCoins(1); gainXp(); clearMiss(target);
      if(streakRight>0 && streakRight%5===0){ addCoins(5); state.toast='🔥 '+streakRight+' in a row! +5 bonus coins'; scheduleToast(2200); burstConfetti(50); }
      state.status='correct'; state.mood=state.toast?'wow':mood; render();
      autoAdvance(850);
    } else {
      addMiss(curWord());
      const c=active(); c.acc=Math.max(40, Math.round((c.acc||80)*0.92));
      sfx('wrong'); const d=lev(ans,target); if(d>0 && d<=2 && target.length>=4){ state.toast='So close — '+d+' letter'+(d>1?'s':'')+' off! 💡'; scheduleToast(2400); }
      state.status='wrong'; state.mood='oops'; state.sessionDone+=1; state._run=0; render();
      autoAdvance(2200);
    } },
  next:()=>{ clearTimeout(state._advTimer); state._advTimer=null;
    const N=(state.sessionWords&&state.sessionWords.length)||0;
    if(N && state.gi>=N-1){ state.sessionOver=true;
      if((state.sessionDone||0)>0){ try{ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, (state.sessionWrong||[]).map(x=>x.w)); }catch(e){} }
      set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); return; }
    state.gi+=1; set({typed:'', status:'idle', mood:'happy', showDef:false, showSent:false, showOrigin:false}); setTimeout(speak,250); },
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
      weak:()=>app.coachWeakDrill(), parentview:()=>{ app.openCoach(); state.coachTab='parent'; render(); }, settings:()=>app.setNav('settings'), themes:()=>app.setNav('themes') };
    (F[key]||(()=>{}))(); },
  // coach
  openCoach:()=>{ const c=active(); ensureLists(c); ensureCoachWords(c.activeList||'default'); state.coachSession=false;
    set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'train', luTab:'revise', luWordsOpen:false, status:'idle', typed:'', mood:'happy', conceptSel:null}); },
  startWordCoach:()=>app.openCoach(),
  addTheme:(id)=>{ const c=active(); ensureLists(c); const key=themeKey(id); const t=themeOf(id); if(!t) return;
    if(!(c.pinnedLists||{})[key]){ if(!c.pinnedLists) c.pinnedLists={}; c.pinnedLists[key]=1; if(!c.lists[key]) c.lists[key]={xp:0}; save(); sfx('coin'); flash('“'+t.label+'” added to your themes ✓ — tap it again to train'); render(); }
    else app.selectList(key); },
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
    flash(champJustDone ? '🏆 You\'re a Spellbound Champ! The Library awaits.' : ('Level '+(idx+2)+' unlocked! 🎉')); render(); },
  // ----- The Spellbound Journey -----
  startJourney:()=>{ const c=active(); ensureLists(c); c.activeList='journey'; if(!c.lists.journey) c.lists.journey={xp:0};
    state.sessionListKey=null; ensureCoachWords('journey'); set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'revise', luTab:'revise', status:'idle', typed:''});
    flash('Welcome to the Spellbound Journey ✨'); },
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
    if(g.ok){ g.right++; sfx('correct'); addCoins(1); g.coins++; markMastered(nkey(q.w.w)); } else { sfx('wrong'); addMiss(q.w); }
    render(); setTimeout(magicAdvance, g.ok?900:2100); },
  magicHear:()=>{ const g=state.game; if(g&&g.qs&&g.qs[g.qi]) say(g.qs[g.qi].w.w); },
  magicBoard:()=>{ const g=state.game; if(!g) return; g.status='board'; g.celebr=null; state.typed=''; render(); },
  magicNew:()=>magicNewBoard(),
  openShop:()=>{ try{ loadConcepts(); }catch(e){} set({nav:'shop', screen:'app', game:null, conceptSel:null}); },
  shopTab:(t)=>set({shopTab:t}),
  toggleSound:()=>{ set({sound:!state.sound}); if(state.sound) sfx('coin'); },
  toggleDevUnlock:()=>{ const on=!state.devUnlock; state.devUnlock=on; state.premium=on?true:false; try{localStorage.setItem('sb_devunlock',on?'1':'0');}catch(e){} save(); flash(on?'🔓 All features & content unlocked (testing)':'🔒 Locked features restored'); render(); },
  playGame:(type)=>{ clearGTimer(); const c=active(); ensureLists(c); state.gInfo=false; state.typed='';
    if(type==='buzz'){ const list=pickFresh(gameWords(),10); if(!list.length){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,right:0,ans:[],status:'idle'}; setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='beat'){ const list=pickFresh(gameWords(),240); if(list.length<3){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,right:0,wrong:0,timeLeft:60,status:'play'}; startGTimer(); setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='boss'){ const list=pickFresh((state.missedWords||[]).concat(REVIEW).concat(listWords(c.activeList||'default')), 60); if(list.length<3){ flash('No words yet — try a list first'); return; } state.game={type,list,i:0,hp:8,maxhp:8,lives:3,maxlives:3,right:0,status:'play',last:null}; setTimeout(()=>{ if(state.game&&state.game.list[0]) say(state.game.list[0].w); },320); }
    else if(type==='magic'){ magicNewBoard(); }
    else if(type==='meaning'||type==='spell'||type==='origin'){ const qs=buildMC(type,8); if(qs.length<3){ flash('Need a few more words for this game — train a list first'); return; } state.game={type,qs,i:0,picked:null,right:0,status:'play'}; setTimeout(()=>{ mcSpeak(state.game&&state.game.qs[0]); },320); }
    else return;
    set({nav:'games', screen:'app'}); },
  exitGame:()=>{ clearGTimer(); set({game:null, gInfo:false, typed:''}); },
  gReplay:()=>{ const t=state.game&&state.game.type; if(t) app.playGame(t); },
  gSay:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w); },
  gSaySlow:()=>{ const g=state.game; if(g&&g.list&&g.list[g.i]) say(g.list[g.i].w,0.6); },
  gSayQ:()=>{ const g=state.game; const q=g&&g.qs&&g.qs[g.i]; mcSpeak(q); },
  gInfoToggle:()=>set({gInfo:!state.gInfo}),
  gKey:(e)=>{ if(e.key==='Enter') app.gSubmit(); },
  gSubmit:()=>{ const g=state.game; if(!g||g.qs) return; const w=g.list[g.i]; const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word, then Enter'); return; }
    const ok=ans===nkey(w.w); logGameWord(nkey(w.w));
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); }
    else { addMiss(w); sfx('wrong'); }
    const advance=()=>{ g.i++; if(g.i>=g.list.length){ const fresh=pickFresh(gameWords(), g.list.length); g.list=fresh.length?fresh:sample(g.list); g.i=0; } state.typed=''; state.gInfo=false; setTimeout(()=>{ if(state.game&&state.game.list[state.game.i]) say(state.game.list[state.game.i].w); },180); };
    if(g.type==='buzz'){ g.ans.push({w,val:state.typed,ok}); if(ok){ g.right++; addCoins(1); gainXp(); } if(g.i+1<g.list.length){ advance(); render(); } else { gFinishBuzz(); } }
    else if(g.type==='beat'){ if(ok){ g.right++; addCoins(1); gainXp(); } else g.wrong++; advance(); render(); }
    else if(g.type==='boss'){ if(ok){ g.hp=Math.max(0,g.hp-1); g.right++; addCoins(1); gainXp(); g.last={ok:true,word:w.w}; if(g.hp<=0){ gFinishBoss(true); return; } } else { g.lives--; g.last={ok:false,word:w.w}; if(g.lives<=0){ gFinishBoss(false); return; } } advance(); render(); }
    else if(g.type==='champ'){ g.ans.push({w,ok}); if(ok){ g.right++; addCoins(1); } else g.wrong++;
      if(g.fmt==='count' && (g.i+1>=g.total || g.i+1>=g.list.length)){ gFinishChamp(); return; } advance(); render(); }
  },
  gPick:(idx)=>{ const g=state.game; if(!g||!g.qs||g.picked!=null) return; idx=+idx; const q=g.qs[g.i]; g.picked=idx; const ok=q.choices[idx]===q.answer; logGameWord(nkey(q.word));
    const spellingGame = q.kind!=='origin'; // origin tests language knowledge, not spelling mastery
    if(ok){ g.right++; addCoins(1); gainXp(); if(spellingGame){ markMastered(nkey(q.word)); clearMiss(q.word); } sfx('correct'); }
    else { sfx('wrong'); if(spellingGame && q.wordObj){ addMiss(q.wordObj); (g.miss=g.miss||[]).push(q.word); } }
    render();
    setTimeout(()=>{ const G=state.game; if(!G) return; if(G.i+1<G.qs.length){ G.i++; G.picked=null; render(); mcSpeak(G.qs[G.i]); } else { gFinishMC(); } },950); },
  coachTab:(t)=>set({coachTab:t}),
  setCoachDate:(v)=>set({coachDate:v||null}),
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
  openLesson:(n)=>{ if(!state.premium){ set({showPaywall:true}); return; } const L=lessonsAll().find(x=>x.n===+n); if(!L) return; set({nav:'journeys', screen:'app', lessonSel:L, lessonWordsOpen:false, lessonGuided:(state.journeyView==='guided'), lessonStep:0}); try{window.scrollTo(0,0);}catch(e){} },
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
    const text='SPELLBOUND — evolution tile feedback ('+n+' tiles)\n\n'+lines.join('\n')+'\n\n--- raw json ---\n'+JSON.stringify(EVOFB);
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to export the feedback'); return; }
    w.document.write('<!doctype html><meta charset="utf-8"><title>Tile feedback</title><body style="font-family:system-ui,Arial;padding:18px;max-width:760px;margin:0 auto"><h2 style="margin:0 0 4px">Evolution tile feedback</h2><p style="color:#666;margin:0 0 12px">Select all, copy, and paste this back to your developer.</p><textarea style="width:100%;height:78vh;font-family:monospace;font-size:13px;padding:10px;border:1px solid #ccc;border-radius:8px">'+text.replace(/</g,'&lt;')+'</textarea></body>'); w.document.close(); },
  printReport:()=>{ try{ const c=active(); ensureLists(c); const t=todayKey();
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to print the report'); return; }
    const played=new Set(c.daysPlayed||[]); const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const last7=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); last7.push({on:played.has(k), label:dn[d.getDay()]}); }
    const daysThisWeek=last7.filter(x=>x.on).length;
    const mastered=Object.keys(state.luMastered||{}).length;
    const tsKey=(ts)=>{ const d=new Date(ts); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    const recent=(c.activity||[]).filter(a=>a.ts && dayDiff(tsKey(a.ts), t)<=7);
    const sessions=recent.length; const totDone=recent.reduce((s,a)=>s+(a.done||0),0); const totRight=recent.reduce((s,a)=>s+(a.right||0),0);
    const acc=totDone?Math.round(totRight/totDone*100):0;
    const misses=(c.missed||[]).slice(0,24);
    const ov=overallLevel(c);
    const E=(s)=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const dotRow=last7.map(d=>`<td style="text-align:center;padding:4px"><div style="width:30px;height:30px;border-radius:7px;margin:0 auto;background:${d.on?'#7C5CFF':'#e7e3f5'}"></div><div style="font-size:10px;color:#888;margin-top:3px">${d.label}</div></td>`).join('');
    const missChips=misses.length?misses.map(m=>`<span style="display:inline-block;border:1px solid #ddd;border-radius:20px;padding:3px 10px;margin:3px;font-size:12px;font-family:monospace">${E(m.w)}${m.n>1?(' ×'+m.n):''}</span>`).join(''):'<i style="color:#888">No misses — great week!</i>';
    const html='<!doctype html><html><head><meta charset="utf-8"><title>Spellbound — '+E(c.name)+'</title>'+
      '<style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1a1530;max-width:740px;margin:0 auto;padding:28px}h1{font-size:24px;margin:0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:#7C5CFF;margin:26px 0 10px;border-bottom:2px solid #eee;padding-bottom:6px}.row{display:flex;gap:14px;flex-wrap:wrap}.stat{flex:1;min-width:120px;border:1px solid #eee;border-radius:12px;padding:14px;text-align:center}.stat b{display:block;font-size:26px}.stat span{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.04em}@media print{body{padding:0}button{display:none}}</style></head><body>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #7C5CFF;padding-bottom:12px"><div><div style="font-size:13px;color:#7C5CFF;font-weight:800;letter-spacing:.08em">SPELLBOUND · WEEKLY REPORT</div><h1>'+E(c.name)+'</h1></div><div style="text-align:right;font-size:12px;color:#888">'+new Date().toLocaleDateString()+'<br>Age '+E(c.age||9)+'</div></div>'+
      '<h2>This week at a glance</h2><div class="row"><div class="stat"><b>'+daysThisWeek+'/7</b><span>Days practised</span></div><div class="stat"><b>'+(c.streak||0)+'</b><span>Day streak</span></div><div class="stat"><b>'+sessions+'</b><span>Sessions</span></div><div class="stat"><b>'+acc+'%</b><span>Accuracy</span></div></div>'+
      '<table style="width:100%;margin-top:16px;border-collapse:collapse"><tr>'+dotRow+'</tr></table>'+
      '<h2>Progress</h2><div class="row"><div class="stat"><b>'+ov+'</b><span>Overall level</span></div><div class="stat"><b>'+mastered+'</b><span>Words mastered</span></div><div class="stat"><b>'+totRight+'</b><span>Correct this week</span></div><div class="stat"><b>'+(c.streak||0)+'</b><span>Day streak</span></div></div>'+
      '<h2>Words to revise ('+(c.missed||[]).length+')</h2><div>'+missChips+'</div>'+
      '<h2>Countdown</h2><p style="font-size:15px">North South Foundation National Finals — <b>'+daysToBee()+' days</b> to go (31 Jul 2026).</p>'+
      '<div style="margin-top:24px;text-align:center"><button onclick="window.print()" style="background:#7C5CFF;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-weight:700;font-size:15px;cursor:pointer">🖨️ Print / Save as PDF</button></div>'+
      '<p style="text-align:center;color:#aaa;font-size:11px;margin-top:18px">Generated by Spellbound · keep practising a little every day 🐝</p>'+
      '</body></html>';
    w.document.write(html); w.document.close(); setTimeout(()=>{ try{ w.focus(); }catch(e){} }, 300);
  }catch(e){ flash('Could not open the report'); } },
  exitCoachMode:()=>set({coachMode:'hub', wr:null, or:null, typed:'', orFeedback:''}),
  // written round
  startWritten:()=>{ const list=sample(coachPool(), Math.min(15,state.coachGoal||15)); if(!list.length){ flash('No words available'); return; } set({coachMode:'written', wr:{list,i:0,ans:[]}, typed:'', wrInfoKey:''}); setTimeout(()=>{ const w=list[0]; if(w) say(w.w); },300); },
  wrInfo:(kind)=>{ const key=state.wrInfoKey===kind?'':kind; if(key==='sent'){ const w=state.wr.list[state.wr.i]; if(w&&w.s) say(w.s); } set({wrInfoKey:key}); },
  wrSay:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w); },
  wrSaySlow:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w,0.6); },
  wrKey:(e)=>{ if(e.key==='Enter') app.wrNext(); },
  wrNext:()=>{ const S=state; const wr=S.wr; const w=wr.list[wr.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok);
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
  orJudge:()=>{ const S=state; const or=S.or; const w=or.pool[or.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); addCoins(1); gainXp(); const round=or.round+1; state.or={...or,round}; state.coachBestRounds=Math.max(state.coachBestRounds||0,round); state.orFeedback='✓ Correct — advancing! ('+round+' in a row)'; say('Correct!'); render();
      setTimeout(()=>{ if(!state.or) return; let ni=state.or.i+1; let np=state.or.pool; if(ni>=np.length){ np=sample(np); ni=0; } state.or={...state.or,i:ni,pool:np}; state.typed=''; state.orInfoKey=''; state.orFeedback=''; render(); const nx=state.or&&state.or.pool[state.or.i]; if(nx) say(nx.w); },1000);
    } else { addMiss(w); say('Incorrect'); logActivity('oral','Oral elimination', {done:(or.round||0)+1,right:or.round||0}, [w]); set({coachMode:'orgone', or:{...or,last:w}}); } },
  // parent / settings / paywall
  addChild:()=>set({screen:'onboarding', onbStep:0, addingMore:true, draft:{name:'',age:9,avatar:'panda',goal:10}}),
  selectChild:(i)=>{ i=+i; state.activeIdx=i; const c=state.children[i]; ensureLists(c); state.theme=(c&&c.theme)||'spellbound'; state.parentLogOpen=null; state.sessionListKey=null; syncMissed(); render(); },
  goPaywall:()=>set({showPaywall:true}), closePaywall:()=>set({showPaywall:false}),
  pickPlan:(p)=>set({plan:p}), upgrade:()=>{ set({premium:true, showPaywall:false}); flash('Welcome to Premium! 👑'); },
  signOut:()=>set({screen:'landing', nav:'home', email:'', pw:''}),
  setLight:()=>app.setMode('light'), setWhite:()=>app.setMode('white'),
  voiceSetDevice:(v)=>{ VOICE.name=v||''; saveVoiceCfg(); loadVoices(); flash(VOICE.name?'Voice set ✨':'Using the best available voice'); },
  voiceTest:()=>{ say('Hi! I am your spelling buddy. Try this word: iridescent. The soap bubble had an iridescent shine.'); },
  noop:()=>{},
};

/* ===================================================================== */
/*  View — builds the HTML for the current state                          */
/* ===================================================================== */
const diffMap = { easy:['Easy','#1f9d57'], medium:['Medium','#c08a00'], hard:['Hard','#d63a3a'] };
const diffStyleFor = (d) => 'padding:3px 9px;border-radius:99px;font-size:11px;font-weight:800;color:#fff;background:'+(diffMap[d]||diffMap.medium)[1];
const seg = (on) => 'padding:7px 15px;border-radius:999px;font-weight:800;font-size:13px;transition:.2s;'+(on?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)');
const chip = (on) => 'padding:9px 14px;border-radius:999px;font-weight:700;font-size:13.5px;border:1px solid var(--line);transition:.2s;'+(on?'background:var(--accent);color:#fff;border-color:transparent':'background:var(--surface2);color:var(--text)');

function view(){
  const S = state;
  if(S.screen==='landing') return viewLanding();
  if(S.screen==='auth') return viewAuth();
  if(S.screen==='onboarding') return viewOnboarding();
  return viewApp();
}

function viewLanding(){
  const features=[
    { ic:'volume', title:'Hears every word', body:'Real spoken pronunciation, definition, sentence and origin — like a true bee round.' },
    { ic:'sprout', title:'A character that evolves', body:'Ten forms per world. Every level visibly grows your speller’s buddy.' },
    { ic:'chart', title:'Parents see everything', body:'Accuracy, streaks, weak words and a finals countdown in one dashboard.' },
  ].map(f=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:22px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="width:46px;height:46px;border-radius:13px;background:var(--chip);color:var(--accent);display:grid;place-items:center;margin-bottom:13px">${iconSVG(f.ic,22)}</div>
      <div style="font-family:var(--display);font-weight:700;font-size:17px;margin-bottom:6px">${f.title}</div>
      <div style="font-size:14px;color:var(--muted);line-height:1.5">${f.body}</div></div>`).join('');
  return `<div style="position:relative;z-index:1;max-width:1080px;margin:0 auto;padding:22px clamp(18px,4vw,40px) 60px">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:clamp(28px,7vw,72px)">
      <div style="display:flex;align-items:center;gap:11px"><div style="width:44px;height:48px">${mascotSVG('happy')}</div><span style="font-family:var(--display);font-weight:800;font-size:24px;letter-spacing:-.01em">Spellbound</span></div>
      <button data-act="goSignin" style="padding:10px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:700;font-size:14px">Sign in</button>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:clamp(24px,5vw,56px);align-items:center">
      <div>
        <div style="display:inline-flex;align-items:center;gap:8px;padding:7px 13px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px;letter-spacing:.04em;text-transform:uppercase;margin-bottom:18px">🐝 Built for spelling-bee champions</div>
        <h1 style="font-family:var(--display);font-weight:800;font-size:clamp(34px,6.4vw,58px);line-height:1.03;letter-spacing:-.02em;margin:0 0 16px">Spell your way to the National&nbsp;Bee.</h1>
        <p style="font-size:clamp(16px,2.2vw,19px);line-height:1.55;color:var(--muted);max-width:30em;margin:0 0 26px">A daily spelling trainer that hears your child spell out loud, evolves a character with every win, and shows parents exactly where they stand — built around real championship words.</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:24px">
          <button data-act="goSignup" style="padding:15px 26px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18),0 8px 22px color-mix(in srgb,var(--accent) 40%,transparent)">Start free →</button>
          <button data-act="goSignin" style="padding:15px 24px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:16px">I have an account</button>
        </div>
        <div style="display:flex;align-items:center;gap:16px;color:var(--muted);font-size:13.5px;font-weight:600"><span>★★★★★ <b style="color:var(--text)">4.9</b> parents</span><span style="width:1px;height:14px;background:var(--line)"></span><span>No card to start</span></div>
      </div>
      <div style="position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:24px;padding:clamp(20px,4vw,34px);box-shadow:var(--glow)">
        <div style="display:flex;justify-content:center;margin-bottom:6px"><div style="width:118px;height:132px;animation:sb-float 4s ease-in-out infinite">${mascotSVG('excited')}</div></div>
        <div style="text-align:center;font-family:var(--mono);font-size:13px;letter-spacing:.3em;color:var(--muted);margin-bottom:6px">SPELL THIS</div>
        <div style="text-align:center;font-family:var(--display);font-weight:800;font-size:clamp(28px,5vw,40px);letter-spacing:.02em;margin-bottom:18px">iridescent</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:13px;padding:13px"><div style="font-size:12px;color:var(--muted);font-weight:700">Streak</div><div style="font-family:var(--display);font-weight:800;font-size:22px;display:flex;align-items:center;gap:6px">12 days <span style="color:#FF7A1A">${iconSVG('fire',18)}</span></div></div>
          <div style="background:var(--surface);border:1px solid var(--line);border-radius:13px;padding:13px"><div style="font-size:12px;color:var(--muted);font-weight:700">Form</div><div style="font-family:var(--display);font-weight:800;font-size:22px">Forager</div></div>
        </div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px;margin-top:clamp(40px,7vw,72px)">${features}</div>
  </div>`;
}

function viewAuth(){
  const S=state; const signup=S.authMode==='signup';
  return `<div style="position:relative;z-index:1;min-height:100dvh;display:grid;place-items:center;padding:24px">
    <div style="width:100%;max-width:420px;background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,5vw,36px);box-shadow:var(--glow)">
      <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:22px">
        <div style="width:56px;height:62px">${mascotSVG('happy')}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">${signup?'Create your account':'Welcome back'}</h2>
        <p style="margin:0;color:var(--muted);font-size:14px;text-align:center">${signup?'Start free — no card needed.':'Sign in to keep your streak going.'}</p>
      </div>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Parent email</label>
      <input data-inp="onEmail" data-fkey="email" value="${escA(S.email)}" type="email" placeholder="you@email.com" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:13px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:14px;outline:none">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Password</label>
      <input data-inp="onPw" data-fkey="pw" value="${escA(S.pw)}" type="password" placeholder="••••••••" autocomplete="off" style="width:100%;padding:13px 14px;border-radius:13px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:600;margin-bottom:20px;outline:none">
      <button data-act="doAuth" style="width:100%;padding:15px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${signup?'Create account':'Sign in'}</button>
      <div style="text-align:center;margin-top:16px;font-size:14px;color:var(--muted)">${signup?'Already have an account?':'New to Spellbound?'} <button data-act="swapAuth" style="color:var(--accent);font-weight:800;font-size:14px">${signup?'Sign in':'Create one'}</button></div>
      <div style="text-align:center;margin-top:18px"><button data-act="goLanding" style="color:var(--muted);font-size:13px;font-weight:600">← Back</button></div>
    </div>
  </div>`;
}

function viewOnboarding(){
  const S=state;
  const dots=[0,1,2].map(i=>`<div style="width:${i===S.onbStep?'26px':'8px'};height:8px;border-radius:99px;transition:.25s;background:${i<=S.onbStep?'var(--accent)':'var(--surface2)'}"></div>`).join('');
  let card='';
  if(S.onbStep===0){
    const avatars=BUDDIES.map(id=>`<button data-act="pickAvatar" data-arg="${id}" style="aspect-ratio:1;border-radius:13px;display:grid;place-items:center;transition:.15s;background:var(--surface2);border:2px solid ${S.draft.avatar===id?'var(--accent)':'transparent'}">${buddySVG(id,30)}</button>`).join('');
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:23px;margin:0 0 4px">Who's practising?</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:14px">Set up your speller's profile.</p>
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px">Name</label>
      <input data-inp="onDraftName" data-fkey="draftName" value="${escA(S.draft.name)}" placeholder="e.g. Ahana" style="width:100%;padding:13px 14px;border-radius:13px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:15px;font-weight:700;margin-bottom:18px;outline:none">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:8px">Age · <b style="color:var(--text)">${S.draft.age}</b></label>
      <input data-inp="onDraftAge" data-fkey="draftAge" type="range" min="5" max="15" step="1" value="${S.draft.age}" style="width:100%;accent-color:var(--accent);margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:10px">Pick a buddy</label>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:8px">${avatars}</div></div>`;
  } else if(S.onbStep===1){
    const worldCards=THEMES.map(t=>{ const ev=EVO[t.id]||EVO.spellbound; const sel=t.id===S.theme;
      return `<button data-act="pickTheme" data-arg="${t.id}" style="text-align:left;border-radius:15px;overflow:hidden;cursor:pointer;transition:.16s;background:var(--surface2);border:2px solid ${sel?'var(--accent)':'transparent'}${sel?';box-shadow:0 8px 22px color-mix(in srgb,var(--accent) 26%,transparent)':''}">
        <div style="height:78px;display:grid;place-items:center;background:linear-gradient(135deg,${t.c1},${t.c2})">${worldEmblemSVG(t.id,40)}</div>
        <div style="padding:12px 13px 14px"><div style="font-family:var(--display);font-weight:800;font-size:16px;color:var(--text)">${t.label}</div>
          <div style="font-size:12px;color:var(--muted);line-height:1.45;margin:4px 0 9px;min-height:51px">${WORLD_DEF[t.id]||''}</div>
          <div style="display:inline-flex;align-items:center;font-family:var(--mono);font-size:10px;letter-spacing:.02em;color:var(--accent);font-weight:700;background:var(--chip);padding:4px 9px;border-radius:99px">${ev[0]}  →  ${ev[9]}</div></div></button>`; }).join('');
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:23px;margin:0 0 4px">Choose a world</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:14px">Each world is a different look <b style="color:var(--text)">and</b> a character that evolves as you level up — from its first form to its last. Pick the journey that excites your speller. You can change it any time.</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:12px">${worldCards}</div></div>`;
  } else {
    const goals=[{v:5,label:'5 words a day',sub:'Light & breezy',ic:'sprout'},{v:10,label:'10 words a day',sub:'Recommended',ic:'spark'},{v:15,label:'15 words a day',sub:'Bee-ready',ic:'flame'}]
      .map(g=>`<button data-act="pickGoal" data-arg="${g.v}" style="display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;border-radius:14px;padding:16px 18px;cursor:pointer;transition:.15s;background:var(--surface2);border:2px solid ${S.draft.goal===g.v?'var(--accent)':'transparent'}">
        <div><div style="font-family:var(--display);font-weight:800;font-size:18px">${g.label}</div><div style="font-size:13px;color:var(--muted);font-weight:600">${g.sub}</div></div>
        <div style="width:40px;height:40px;border-radius:11px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(g.ic,20)}</div></button>`).join('');
    card=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow)">
      <h2 style="font-family:var(--display);font-weight:800;font-size:23px;margin:0 0 4px">Set a daily goal</h2>
      <p style="margin:0 0 20px;color:var(--muted);font-size:14px">A small daily habit beats cramming. Pick a starting target.</p>
      <div style="display:grid;gap:11px">${goals}</div></div>`;
  }
  return `<div style="position:relative;z-index:1;min-height:100dvh;display:grid;place-items:center;padding:24px">
    <div style="width:100%;max-width:560px">
      <div style="display:flex;gap:7px;justify-content:center;margin-bottom:22px">${dots}</div>
      ${card}
      <div style="display:flex;justify-content:space-between;gap:12px;margin-top:18px">
        <button data-act="onbBack" style="padding:13px 20px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:700;font-size:15px">${S.onbStep===0?'Cancel':'Back'}</button>
        <button data-act="onbNext" style="flex:1;max-width:240px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);opacity:${(S.onbStep===0&&!S.draft.name.trim())?'.5':'1'}">${S.onbStep===2?'Start spelling →':'Continue'}</button>
      </div>
    </div>
  </div>`;
}

/* ===================== APP SHELL ===================== */
function viewApp(){
  const S=state;
  const navTabs=[['home','Home','home'],['coach','Practice','pencil'],['games','Arcade','joystick'],['concepts','Concepts','grid'],['journeys','Word Journeys','book'],['themes','Themes','palette'],['progress','Progress','chart'],['parent','Parent','users']].map(([key,label,ic])=>{
    const on=S.nav===key;
    return `<button data-act="setNav" data-arg="${key}" style="display:inline-flex;align-items:center;gap:7px;white-space:nowrap;padding:9px 15px;border-radius:11px;font-weight:800;font-size:14px;${on?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)'}">${iconSVG(ic,17)} ${label}</button>`;
  }).join('');
  let content='';
  if(S.nav==='home') content=viewHome();
  else if(S.nav==='concepts') content = S.conceptSel ? viewConceptDetail() : viewConceptList();
  else if(S.nav==='levelup') content=viewLevelUp();
  else if(S.nav==='train') content=viewTrain();
  else if(S.nav==='coach') content=viewCoach();
  else if(S.nav==='games') content=viewGames();
  else if(S.nav==='shop') content=viewShop();
  else if(S.nav==='themes') content=viewThemes();
  else if(S.nav==='progress') content=viewProgress();
  else if(S.nav==='parent') content=viewParent();
  else if(S.nav==='journeys') content=viewJourneys();
  else if(S.nav==='settings') content=viewSettings();
  else if(S.nav==='evofeedback') content=viewEvoFeedback();
  else content=viewHome();
  const lightOn=S.mode==='light';
  return `<div style="min-height:100dvh;display:flex;flex-direction:column">
    <div style="position:sticky;top:0;z-index:20;backdrop-filter:blur(10px);background:color-mix(in srgb,var(--bg1) 82%,transparent);border-bottom:1px solid var(--line)">
      <div style="max-width:1080px;margin:0 auto;padding:11px clamp(14px,3.5vw,32px);display:flex;align-items:center;gap:12px">
        <button data-act="openDrawer" aria-label="Menu" style="width:38px;height:38px;border-radius:11px;background:var(--surface2);display:grid;place-items:center;color:var(--text);flex-shrink:0">${iconSVG('menu',20)}</button>
        <div style="display:flex;align-items:center;gap:9px;margin-right:auto"><div style="width:34px;height:38px">${mascotSVG('happy')}</div><span style="font-family:var(--display);font-weight:800;font-size:19px;letter-spacing:-.01em">Spellbound</span></div>
        <button data-act="openShop" title="Your coins — tap to open the Shop" style="display:inline-flex;align-items:center;gap:4px;padding:6px 12px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13.5px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)">${coinAmt(active().coins||0,14)}</button>
        <div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px">
          <button data-act="setLight" aria-pressed="${lightOn}" style="padding:7px 15px;border-radius:999px;font-weight:800;font-size:13px;${lightOn?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)'}">Light</button>
          <button data-act="setWhite" aria-pressed="${!lightOn}" style="padding:7px 15px;border-radius:999px;font-weight:800;font-size:13px;${!lightOn?'background:var(--accent);color:#fff':'background:transparent;color:var(--muted)'}">White</button>
        </div>
        <button data-act="goSettings" aria-label="Settings" style="width:38px;height:38px;border-radius:11px;background:var(--surface2);display:grid;place-items:center;color:var(--text)">${iconSVG('gear',17)}</button>
      </div>
      <div style="max-width:1080px;margin:0 auto;padding:0 clamp(14px,3.5vw,32px) 9px;display:flex;gap:6px;overflow-x:auto">${navTabs}</div>
    </div>
    ${viewDrawer()}
    <div style="max-width:1080px;margin:0 auto;width:100%;padding:18px clamp(14px,3.5vw,32px) 60px">${content}</div>
  </div>`;
}

function viewDrawer(){
  if(!state.drawerOpen) return '';
  const items=[
    {t:'item',label:'Home',ic:'home',key:'home',active:state.nav==='home'},
    {t:'item',label:'Word Coach',ic:'steps',key:'levelup'},
    {t:'item',label:'Arcade',ic:'joystick',key:'games',active:state.nav==='games'},
    {t:'item',label:'Shop',ic:'crown',key:'shop',active:state.nav==='shop'},
    {t:'item',label:'Concepts',ic:'grid',key:'concepts',active:state.nav==='concepts'},
    {t:'item',label:'Word Journeys',ic:'book',key:'journeys',active:state.nav==='journeys'},
    {t:'item',label:'Theme Journeys',ic:'palette',key:'themes',active:state.nav==='themes'},
    {t:'label',label:'Word Coach · Bee Prep'},
    {t:'item',label:'Coach overview',ic:'target',key:'coach',active:state.nav==='coach'},
    {t:'sub',label:'Study',ic:'book',key:'study'},
    {t:'sub',label:'Written round',ic:'pencil',key:'written'},
    {t:'sub',label:'Oral elimination',ic:'volume',key:'oral'},
    {t:'sub',label:'Weak-word drill',ic:'spark',key:'weak'},
    {t:'sub',label:'Readiness · parent view',ic:'chart',key:'parentview'},
    {t:'label',label:'More'},
    {t:'item',label:'Theme & settings',ic:'gear',key:'settings',active:state.nav==='settings'},
  ];
  const nav=items.map(d=>{
    if(d.t==='label') return `<div style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:800;padding:14px 12px 6px">${d.label}</div>`;
    const indent=d.t==='sub'?'8px':'0';
    if(d.active) return `<button data-act="drawer" data-arg="${d.key}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;font-weight:800;font-size:14.5px;padding:11px 12px;border-radius:12px;background:var(--accent);color:#fff;margin-left:${indent}"><span style="display:inline-flex">${iconSVG(d.ic,d.t==='sub'?17:19)}</span>${d.label}</button>`;
    return `<button data-act="drawer" data-arg="${d.key}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;font-weight:${d.t==='sub'?700:700};font-size:14.5px;padding:11px 12px;border-radius:12px;background:transparent;color:var(--text);margin-left:${indent}"><span style="display:inline-flex;color:var(--muted)">${iconSVG(d.ic,d.t==='sub'?17:19)}</span>${d.label}</button>`;
  }).join('');
  return `<div data-act="closeDrawer" style="position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:55;animation:sb-fade .2s ease both"></div>
    <aside data-act="noop" style="position:fixed;top:0;left:0;bottom:0;width:280px;max-width:84vw;background:var(--bg2);border-right:1px solid var(--line);z-index:56;display:flex;flex-direction:column;padding:16px 12px;overflow-y:auto;box-shadow:0 0 40px rgba(0,0,0,.18)">
      <div style="display:flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:18px;padding:4px 6px 12px;border-bottom:1px solid var(--line);margin-bottom:8px">
        <div style="width:26px;height:30px">${mascotSVG('happy')}</div>Spellbound
        <button data-act="closeDrawer" aria-label="Close" style="margin-left:auto;width:32px;height:32px;border-radius:9px;background:var(--surface2);display:grid;place-items:center;color:var(--text)">${iconSVG('close',18)}</button>
      </div>
      <nav style="display:flex;flex-direction:column;gap:2px;overflow-y:auto">${nav}</nav>
    </aside>`;
}

function streakCard(){ const c=active(); ensureLists(c); const t=todayKey(); const played=new Set(c.daysPlayed||[]);
  const days=[]; for(let i=13;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); days.push({on:played.has(k), today:k===t, dn:['S','M','T','W','T','F','S'][d.getDay()]}); }
  const dots=days.map(d=>`<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="width:17px;height:17px;border-radius:5px;display:inline-block;background:${d.on?'var(--accent)':'var(--surface2)'};${d.today?'box-shadow:0 0 0 2px var(--accent)':''}"></span><span style="font-size:9px;color:var(--muted);font-weight:700">${d.dn}</span></div>`).join('');
  const playedToday=played.has(t); const next=[3,7,14,30].find(m=>m>(c.streak||0));
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:11px"><div style="width:42px;height:42px;border-radius:12px;background:color-mix(in srgb,#FF8A3D 18%,var(--bg2));color:#FF7A1A;display:grid;place-items:center">${iconSVG('fire',24)}</div><div><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1">${c.streak||0}-day streak</div><div style="font-size:12px;color:var(--muted);font-weight:600">Best ${c.streakBest||c.streak||0} · ${playedToday?'practised today ✓':'practise today to keep it going'}</div></div></div>
      ${next?`<div style="text-align:right"><div style="font-size:12px;color:var(--muted);font-weight:700">Next reward</div><div style="display:flex;align-items:center;gap:5px;justify-content:flex-end;font-weight:800;font-size:13.5px;color:var(--accent)">${next}-day · ${coinAmt(STREAK_REWARDS[next],12)}</div></div>`:'<div style="font-weight:800;font-size:13px;color:var(--accent)">All rewards earned ✓</div>'}
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:space-between">${dots}</div>
  </div>`; }
// festive confetti streamers — a few, gently floating (kept light so the card stays clean)
function streamers(){
  const R=[[9,16,'#FFD23F',22],[26,70,'#36E0C8',-26],[46,22,'#FFFFFF',40],[70,68,'#FFE27A',-16],[86,26,'#36E2FF',30],[60,46,'#FFFFFF',-22]];
  const D=[[16,44,'#fff'],[78,18,'#FFE27A'],[40,80,'#36E2FF']];
  return `<div style="position:absolute;inset:0;pointer-events:none;overflow:hidden">`+
    R.map(([l,t,co,r],i)=>`<span style="position:absolute;left:${l}%;top:${t}%;width:5px;height:14px;background:${co};border-radius:2px;opacity:.8;--r:${r}deg;transform:rotate(${r}deg);animation:sb-confetti ${3+(i%3)}s ease-in-out ${(i*0.45).toFixed(2)}s infinite"></span>`).join('')+
    D.map(([l,t,co])=>`<span style="position:absolute;left:${l}%;top:${t}%;width:5px;height:5px;border-radius:50%;background:${co};opacity:.7"></span>`).join('')+
  `</div>`;
}
function viewHome(){
  const S=state; const c=active(); ensureLists(c); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound;
  const aKey=activeListKey(); const aLevel=listLevel(c,aKey); const fIdx=formIdx(aLevel); const oLevel=overallLevel(c);
  const greetHour=new Date().getHours(); const greeting=greetHour<12?'Good morning,':greetHour<18?'Good afternoon,':'Good evening,';
  const goalTarget=c.goal||S.draft.goal||10; const goalPctNum=Math.min(100,Math.round((S.goalDone/goalTarget)*100));
  const masteredCt=listWords(aKey).filter(w=>S.luMastered[nkey(w.w)]).length; const listCt=listWords(aKey).length||1;
  const buzzCt=(S.missedWords&&S.missedWords.length)||0;
  const aLvlNew=listStageIdx(c,aKey)+1;
  const cAll=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]); const cDone=cAll.filter(ch=>conceptStat(ch).done).length; const cTot=cAll.length||110;
  const cChapDone=(cAll.length?conceptChapters().filter(x=>conceptChapterStat(x).complete).length:0);
  const lDone=lessonsDoneCount(); const lUnits=lessonUnits();
  const lChapDone=lUnits.filter(u=>{ const ls=lessonsAll().filter(L=>L.unit===u.n); return ls.length && ls.every(L=>lessonComplete(L)); }).length; const lChapTot=lUnits.length||10;
  const journeys=[
    {goAct:'openCoach', ic:'steps', c1:'#7C5CFF',c2:'#5A37D6',accent:'#7C5CFF', title:'Spellbound Coaching Journey', desc:'Your training hub — pick a list and climb its Levels with Revise & Practice.', pct:Math.min(100,Math.round(aLvlNew/20*100))+'%', badge:'Lv '+aLvlNew, kind:'go'},
    {goAct:'setNav', goArg:'concepts', ic:'grid', c1:'#13A892',c2:'#0E8A78',accent:'#13A892', title:'Concepts', desc:'Spelling patterns — prefixes, roots & tricky endings, in 10 short chapters.', pct:Math.round(cDone/(cTot||1)*100)+'%', badge:cChapDone+'/10 chapters', kind:'go'},
    {goAct:'openJourneys', ic:'book', c1:'#E0922E',c2:'#C8791B',accent:'#E0922E', title:'Word Journeys', desc:'The history & geography of words — roots, journeys & origins, in 10 chapters.', pct:Math.round((lChapTot?lChapDone/lChapTot:0)*100)+'%', badge:S.premium?(lChapDone+'/'+lChapTot+' chapters'):'Premium', kind:S.premium?'go':'lock'},
    {goAct:'setNav', goArg:'themes', ic:'palette', c1:'#B14FC4',c2:'#9438A8',accent:'#B14FC4', title:'Theme Journeys', desc:'Learn words by their worlds — medicine, music, maps & 50 more themes to pick from.', pct:Math.min(100,myThemes().length*20)+'%', badge:myThemes().length+' picked', kind:'go'},
    {goAct:'openGames', ic:'joystick', festive:true, title:'Arcade', desc:'8 mini-games — Magic Squares, Champ Challenge, Boss Battle & more. Earn coins!', pct:Math.min(100,(c.streak||0)*10)+'%', badge:(c.coins||0)+' coins', kind:'go'},
  ].map(j=>{
    const arg=j.goArg?`data-arg="${j.goArg}"`:'';
    if(j.festive){ return `<button class="sb-arcade-card" data-act="${j.goAct}" ${arg} style="position:relative;overflow:hidden;text-align:left;border-radius:16px;padding:18px 20px;background-image:linear-gradient(120deg,#7C5CFF 0%,#FF5FA2 52%,#FFB23E 100%);box-shadow:0 8px 22px rgba(124,92,255,.32);color:#fff;display:flex;flex-direction:column">
      ${streamers()}
      <div style="position:relative;display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:13px"><div style="width:46px;height:46px;border-radius:13px;background:rgba(255,255,255,.24);display:grid;place-items:center;color:#fff;box-shadow:0 3px 10px rgba(0,0,0,.18)">${iconSVG(j.ic,26,2.3)}</div><span style="display:inline-flex;align-items:center;gap:5px;white-space:nowrap;padding:5px 12px;border-radius:99px;font-size:11.5px;font-weight:900;background:#fff;color:#7C5CFF;box-shadow:0 2px 6px rgba(0,0,0,.15)">${iconSVG('coin',12)}${c.coins||0} coins</span></div>
      <div style="position:relative;font-family:var(--display);font-weight:800;font-size:18.5px;margin-bottom:4px;text-shadow:0 1px 5px rgba(0,0,0,.22)">Arcade 🎉</div>
      <div style="position:relative;font-size:13px;color:rgba(255,255,255,.96);line-height:1.45;margin-bottom:14px">${j.desc}</div>
      <div style="position:relative;margin-top:auto;height:7px;border-radius:99px;background:rgba(255,255,255,.3);overflow:hidden"><div style="height:100%;border-radius:99px;background:#fff;width:${j.pct}"></div></div></button>`; }
    const badgeStyle = j.kind==='lock' ? 'background:var(--surface2);color:var(--muted)' : ('background:color-mix(in srgb,'+j.accent+' 15%,transparent);color:'+j.accent);
    return `<button data-act="${j.goAct}" ${arg} style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:18px 20px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.07);display:flex;flex-direction:column">
      <div style="display:flex;justify-content:space-between;align-items:start;gap:8px;margin-bottom:13px"><div style="width:46px;height:46px;border-radius:13px;background:linear-gradient(135deg,${j.c1},${j.c2});color:#fff;display:grid;place-items:center;box-shadow:0 4px 12px color-mix(in srgb,${j.accent} 38%,transparent)">${iconSVG(j.ic,25,2.3)}</div><span style="display:inline-flex;align-items:center;gap:4px;white-space:nowrap;padding:4px 10px;border-radius:99px;font-size:11px;font-weight:800;${badgeStyle}">${j.kind==='lock'?iconSVG('lock',11,2.2):''}${esc(j.badge)}</span></div>
      <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15;margin-bottom:4px">${j.title}</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.45;margin-bottom:14px">${j.desc}</div>
      <div style="margin-top:auto;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:${j.accent};width:${j.pct}"></div></div></button>`;
  }).join('');
  return `<div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:18px">
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:var(--glow);display:flex;align-items:center;gap:18px">
        <div style="width:84px;height:94px;flex-shrink:0;animation:sb-float 4.5s ease-in-out infinite">${mascotSVG(S.mood)}</div>
        <div style="min-width:0">
          <div style="font-size:13px;color:var(--muted);font-weight:700">${greeting}</div>
          <div style="font-family:var(--display);font-weight:800;font-size:clamp(22px,3.6vw,28px);line-height:1.1">${esc(c.name)}</div>
          <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:8px">
            <span style="display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('flame',14)} ${c.streak||0}-day streak</span>
            <span style="padding:5px 11px;border-radius:999px;background:var(--surface2);font-weight:800;font-size:12.5px">${evo[fIdx]} · Lv ${aLevel}</span>
            <span style="padding:5px 11px;border-radius:999px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:12.5px">Overall Lv ${oLevel}</span>
          </div>
        </div>
      </div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:22px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06);display:flex;align-items:center;gap:20px">
        <div style="width:92px;height:92px;border-radius:50%;flex-shrink:0;display:grid;place-items:center;background:conic-gradient(var(--accent) ${goalPctNum}%, var(--surface2) 0)">
          <div style="width:70px;height:70px;border-radius:50%;background:var(--bg2);display:grid;place-items:center;text-align:center"><div><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1">${S.goalDone}/${goalTarget}</div><div style="font-size:10px;color:var(--muted);font-weight:700">today</div></div></div>
        </div>
        <div style="min-width:0">
          <div style="font-family:var(--display);font-weight:800;font-size:18px;margin-bottom:3px">Daily goal</div>
          <div style="font-size:13.5px;color:var(--muted);line-height:1.45;margin-bottom:12px">${goalPctNum>=100?'Goal smashed for today — amazing!':('Spell '+Math.max(0,goalTarget-S.goalDone)+' more to hit today’s goal.')}</div>
          <button data-act="openCoach" style="padding:11px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${S.goalDone>0?'Continue →':'Start practice →'}</button>
        </div>
      </div>
    </div>
    <div style="margin-bottom:18px">${streakCard()}</div>
    <div style="font-family:var(--display);font-weight:800;font-size:16px;margin:4px 2px 12px">Keep going</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin-bottom:18px">${journeys}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:6px;flex-wrap:wrap">
        <div style="font-family:var(--display);font-weight:800;font-size:17px">Your evolution</div>
        <div style="font-size:12.5px;color:var(--muted);font-weight:600">You're <b style="color:var(--text)">${evo[fIdx]}</b> — ${fIdx>=9?'top form reached! 🎉':('next: '+evo[fIdx+1])}</div>
      </div>
      <div style="overflow-x:auto;padding:4px 0 2px"><div style="min-width:760px">${evoLadderHTML(theme,fIdx)}</div></div>
    </div>
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
  Prefixes:{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes'},
  Suffixes:{c:'#FF5FA2',c2:'#E8458C',tex:'dots'},
  Roots:{c:'#13A892',c2:'#0E8A78',tex:'rings'},
  Loanwords:{c:'#E0922E',c2:'#C8791B',tex:'diag'},
  Rules:{c:'#3D7DF0',c2:'#2A63D6',tex:'grid'},
  Subjects:{c:'#4F9E6A',c2:'#3C8455',tex:'dots'},
  Themes:{c:'#F0703C',c2:'#D85A29',tex:'rings'},
  Advanced:{c:'#7B52E0',c2:'#5E39C4',tex:'cross'} };
const CONCEPT_FAM_ORDER = ['Prefixes','Suffixes','Roots','Loanwords','Rules','Subjects','Themes','Advanced'];
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
    <span style="position:absolute;top:11px;left:12px;font-family:var(--mono);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(fam)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${st.done?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16)${locked?';opacity:.92':''}">
      ${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',42,2)}</div>`:`<div style="${mainStyle}">${esc(main)}</div>`}
      ${(!locked&&rest.length)?`<div style="font-family:var(--mono);font-weight:700;font-size:13px;color:rgba(255,255,255,.85);margin-top:6px;letter-spacing:.04em">${rest.map(esc).join('&nbsp;&nbsp;&nbsp;')}</div>`:''}
    </div>
  </div>`;
  const footL = locked
    ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:900;color:#a06a00;background:linear-gradient(135deg,#FFE08A,#F0B85C)">${iconSVG('lock',11,2.2)} ${coinAmt(COST.concept,11)}</span>`
    : `<span style="padding:3px 9px;border-radius:99px;font-family:var(--body);font-weight:800;font-size:11px;color:#fff;background:${dc}">${(diffMap[ch.difficulty]||diffMap.medium)[0]}</span>`;
  const footR=`<span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${locked?'Unlock':(nWords+' words')} →</span>`;
  const prog=(!locked && !st.done && st.m>0)?`<div style="font-family:var(--mono);font-size:11px;color:${f.c};font-weight:700;margin-top:7px">${st.m}/${st.total} mastered</div>`:'';
  return `<button class="sb-cover-card" data-act="${locked?'buyConcept':'openConcept'}" data-arg="${ci}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column;${locked?'opacity:.97':''}">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:16px;line-height:1.15;color:var(--text)">${esc(titleClean)}</div>
      ${meaning?`<div style="font-family:var(--mono);font-weight:700;font-size:12px;color:${f.c};margin-top:3px">${esc(trunc(meaning,42))}</div>`:''}
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(ch.concept,96)}</div>
      ${prog}
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px">${footL}${footR}</div>
    </div>
  </button>`;
}
function conceptBigCard(ch, allChs){
  const ci=allChs.indexOf(ch); const st=conceptStat(ch); const locked=!isConceptUnlocked(ci);
  const tag=locked?`<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:900;color:#a06a00;background:linear-gradient(135deg,#FFE08A,#F0B85C)">${iconSVG('lock',12,2.2)} Locked</span>`:`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:99px;font-size:12px;font-weight:800;background:${st.bg};color:${st.fg}">${st.done?'✓ Mastered':(st.label+(st.total?(' · '+st.m+'/'+st.total):''))}</span>`;
  const cta=locked?`<button data-act="buyConcept" data-arg="${ci}" style="padding:12px 20px;border-radius:13px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.14)">🔓 Unlock · ${coinAmt(COST.concept,12)}</button>`:`<button data-act="openConcept" data-arg="${ci}" style="padding:12px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Open &amp; study · ${st.total} words →</button>`;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow)">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:12px"><span style="font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(catGroup(ch.category))}</span><span style="${diffStyleFor(ch.difficulty)}">${(diffMap[ch.difficulty]||diffMap.medium)[0]}</span></div>
    <div style="font-family:var(--display);font-weight:800;font-size:clamp(22px,4.5vw,28px);line-height:1.12;margin-bottom:4px;display:flex;align-items:center;gap:9px">${locked?`<span style="color:var(--muted);display:inline-flex">${iconSVG('lock',22,2.2)}</span>`:''}${esc(conceptShort(ch.title))}</div>
    <div style="font-family:var(--mono);font-size:13.5px;color:var(--accent);font-weight:700;margin-bottom:13px">${esc(conceptRoots(ch.title))}</div>
    <div style="font-size:14.5px;color:var(--text);line-height:1.6;margin-bottom:18px">${locked?'This concept is locked. Unlock it with coins to reveal its pattern, worked examples and word list.':esc(ch.concept||'')}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">${tag}${cta}</div>
  </div>`;
}
function famCoverBG(fam){ const f=CONCEPT_FAM[fam]||CONCEPT_FAM.Advanced; const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
// Group the 110 concepts into 10 manageable CHAPTERS (ordered by family, then difficulty).
function conceptChapters(){ const chs=state.conceptData||[]; if(state._cchap && state._cchap._n===chs.length) return state._cchap||[];
  const dr={easy:0,medium:1,hard:2};
  const ord=chs.map((c,i)=>({c,i})).sort((a,b)=>{ const fa=CONCEPT_FAM_ORDER.indexOf(catGroup(a.c.category)), fb=CONCEPT_FAM_ORDER.indexOf(catGroup(b.c.category)); if(fa!==fb) return (fa<0?9:fa)-(fb<0?9:fb); const da=dr[a.c.difficulty]??1, db=dr[b.c.difficulty]??1; if(da!==db) return da-db; return a.i-b.i; });
  const N=10; const per=Math.ceil(ord.length/N)||1; const out=[];
  for(let k=0;k<N;k++){ const slice=ord.slice(k*per,(k+1)*per); if(!slice.length) continue;
    const counts={}; slice.forEach(o=>{ const g=catGroup(o.c.category); counts[g]=(counts[g]||0)+1; }); const dom=Object.keys(counts).sort((x,y)=>counts[y]-counts[x])[0]||'Patterns';
    out.push({ n:out.length+1, name:dom, items:slice.map(o=>o.c) }); }
  out._n=chs.length; state._cchap=out; return out; }
function conceptChapterStat(chap){ const done=chap.items.filter(c=>conceptStat(c).done).length; return { done, total:chap.items.length, complete:done>=chap.items.length }; }
function chapterCoverCard(chap){ const f=CONCEPT_FAM[chap.name]||CONCEPT_FAM.Advanced; const st=conceptChapterStat(chap); const pct=st.total?Math.round(st.done/st.total*100):0;
  return `<button class="sb-cover-card" data-act="openConceptChapter" data-arg="${chap.n-1}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column">
    <div style="position:relative;height:94px;display:flex;align-items:center;justify-content:center;${famCoverBG(chap.name)}">
      <span style="position:absolute;top:11px;left:12px;font-family:var(--mono);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">Chapter</span>
      ${st.complete?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
      <div style="font-family:var(--display);color:#fff;font-weight:800;font-size:44px;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,.2)">${chap.n}</div>
    </div>
    <div style="padding:13px 15px 14px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15.5px;color:var(--text)">Chapter ${chap.n}</div>
      <div style="font-family:var(--mono);font-weight:700;font-size:11px;color:${f.c};margin-top:3px">${esc(chap.name)} · ${st.total} concepts</div>
      <div style="margin-top:auto;padding-top:13px;display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:${st.complete?'var(--good)':f.c};width:${pct}%;transition:width .4s"></div></div><span style="font-size:11px;color:var(--muted);font-weight:800;white-space:nowrap">${st.done}/${st.total}</span></div>
    </div>
  </button>`; }
// Shared page header — back link + display title + optional mono meta + muted subtitle.
// Keeps every top-level view's header identical (the Concepts/Journeys reference treatment).
function pageHead(title, meta, sub, right){
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button></div>
    <div style="display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px">
      <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0">${title}</h2>${meta?`<span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${meta}</span>`:''}</div>
      ${right?`<div style="display:flex;gap:8px;flex-wrap:wrap">${right}</div>`:''}
    </div>
    ${sub?`<p style="margin:0 0 14px;color:var(--muted);font-size:14px;max-width:52em">${sub}</p>`:''}`;
}
function viewConceptList(){
  const S=state; const allChs=S.conceptData||[]; const loading=S.conceptLoading&&!S.conceptData;
  const chapters=allChs.length?conceptChapters():[]; const chaptersDone=chapters.filter(c=>conceptChapterStat(c).complete).length;
  const masteredCount=allChs.filter(c=>conceptStat(c).done).length; const pct=allChs.length?Math.round(masteredCount/allChs.length*100):0;
  const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
  const q=(S.conceptQuery||'').trim().toLowerCase();
  const search=`<input data-inp="onConceptSearch" data-fkey="conceptSearch" value="${escA(S.conceptQuery)}" placeholder="Search any pattern, root or word…" style="width:100%;background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 15px;font-size:14px;color:var(--text);margin-bottom:14px">`;
  let mainContent='', headDesc='', backRow='';
  if(!loading){
    if(q){ const list=allChs.filter(ch=>(ch.title+' '+ch.category+' '+(ch.concept||'')).toLowerCase().includes(q));
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      mainContent=`<div style="font-size:12.5px;color:var(--muted);font-weight:700;margin:0 2px 12px">${list.length} match${list.length===1?'':'es'} for “${esc(S.conceptQuery.trim())}”</div>`+(list.length?`<div style="${gridStyle}">${list.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`:'<div style="padding:44px 0;text-align:center;color:var(--muted);font-weight:700">No matches.</div>');
    } else if(S.conceptChapter!=null && chapters[S.conceptChapter]){ const chap=chapters[S.conceptChapter]; const st=conceptChapterStat(chap);
      headDesc='Ten short chapters of spelling patterns — finish one, then the next.';
      backRow=`<button data-act="conceptChaptersBack" style="display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:700;font-size:14px;margin-bottom:12px">← All chapters</button>`;
      mainContent=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><span style="width:38px;height:38px;border-radius:11px;display:grid;place-items:center;color:#fff;font-family:var(--display);font-weight:800;font-size:19px;${famCoverBG(chap.name)}">${chap.n}</span><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:19px;line-height:1.1">Chapter ${chap.n} · ${esc(chap.name)}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${st.done}/${st.total} concepts done</div></div></div><div style="${gridStyle}">${chap.items.map(ch=>conceptCardHTML(ch,allChs)).join('')}</div>`;
    } else { headDesc='Ten short chapters — pick one and master the spelling patterns inside. A concept is yours once you nail 70% of its words.';
      mainContent=`<div style="${gridStyle}">${chapters.map(chapterCoverCard).join('')}</div>`; }
  }
  return `<div style="animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button></div>
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0">Concepts</h2><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">10 chapters</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:14px;max-width:52em">${headDesc}</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('grid',15)} ${chaptersDone}/10 chapters</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${pct}%;transition:width .4s"></div></div>
      <span style="font-size:12.5px;color:var(--muted);font-weight:700">${pct}%</span>
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
    const chips=parts.map((pp,i)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:99px;background:var(--surface2);font-family:var(--mono);font-size:12.5px;font-weight:700;animation:ca-up .45s ease ${(i*0.12).toFixed(2)}s both"><b style="color:var(--accent)">${esc(pp.txt)}</b><span style="color:var(--muted)">${pp.gloss?('= '+esc(pp.gloss)):''}</span></span>`).join('');
    return `<div style="display:flex;flex-direction:column;gap:12px;align-items:center">${top}${parts.length?`<div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:center">${chips}</div>`:''}</div>`; }
  return ''; }
function conceptAnimStage(an,sc){ const scn=an.scenes[Math.min(Math.max(sc,0),an.scenes.length-1)]; return renderStage(scn&&scn.stage); }
function conceptPlayer(){ const ch=state.conceptSel; if(!ch) return ''; const an=conceptAnim(ch); const N=an.scenes.length; const sc=Math.min(Math.max(state.animScene||0,0),N-1); const playing=state.animOn;
  const voiceOn=state.sound!==false;
  return `<div style="background:var(--bg2);border:1px solid var(--accent);border-radius:18px;overflow:hidden;box-shadow:var(--glow)">
    <div style="display:flex;align-items:center;gap:8px;padding:11px 16px;border-bottom:1px solid var(--line)"><span style="display:inline-flex;align-items:center;gap:6px;font-family:var(--display);font-weight:800;font-size:13.5px;color:var(--accent)">${iconSVG('spark',15)} Animated explainer</span><span style="display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:99px;background:var(--chip);color:var(--accent);font-weight:800;font-size:10.5px">${iconSVG('volume',12)} ${voiceOn?(hasVoicePack(ch)?'Narrated':'Voice on'):'Voice off'}</span><span style="margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em">${esc(an.label)}</span></div>
    <div style="position:relative;background:radial-gradient(120% 120% at 50% 0,color-mix(in srgb,var(--accent) 13%,var(--bg2)),var(--bg2));padding:22px 18px;min-height:150px;display:flex;align-items:center;gap:14px">
      <div class="sb-bee-presenter${playing?' talking':''}" style="width:78px;height:88px;flex-shrink:0;align-self:flex-end;filter:drop-shadow(0 6px 12px rgba(43,27,94,.18))">${mascotSVG(an.scenes[sc].mood||'happy')}</div>
      <div style="flex:1;min-width:0;display:flex;align-items:center;justify-content:center;min-height:100px">${conceptAnimStage(an,sc)}</div>
      ${!playing?`<button data-act="conceptPlay" aria-label="Play" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;background:color-mix(in srgb,var(--bg2) 52%,transparent)"><span style="width:60px;height:60px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;padding-left:4px;font-size:23px;box-shadow:0 6px 18px rgba(0,0,0,.22)">▶</span><span style="font-weight:800;font-size:12.5px;color:var(--text)">Watch &amp; listen</span></button>`:''}
    </div>
    <div style="padding:13px 16px 15px">
      <div style="display:flex;gap:5px;margin-bottom:10px">${an.scenes.map((s,i)=>`<button data-act="animTo" data-arg="${i}" style="flex:1;height:5px;border-radius:99px;background:${i<=sc?'var(--accent)':'var(--surface2)'}"></button>`).join('')}</div>
      <div style="font-size:13.5px;color:var(--text);line-height:1.5;min-height:40px;font-weight:600">${esc(an.scenes[sc].cap)}</div>
      <div style="display:flex;align-items:center;gap:8px;margin-top:9px"><button data-act="conceptReplay" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.16)">${iconSVG('volume',14)} ${playing?'Replay':'Watch & listen'}</button><span style="font-family:var(--mono);font-size:11px;color:var(--muted)">Scene ${sc+1}/${N}</span></div>
    </div>
  </div>`; }
function viewConceptDetail(){
  const S=state; const csel=S.conceptSel; const cw=(csel.words||[]).filter(x=>x&&x.w);
  // ONE card flow: the animated explainer is card 1, then method + worked cards follow.
  const steps=[{kind:'anim'}]; if(csel.method) steps.push({kind:'method',title:'How to crack it',html:csel.method});
  (csel.cards||[]).forEach(cc=>steps.push({kind:'card',title:cc.title,body:cc.body}));
  const total=steps.length; const idx=Math.min(Math.max(S.conceptStep||0,0),total-1); const step=steps[idx];
  const dots=steps.map((s,i)=>`<button data-act="conceptStepGo" data-arg="${i}" style="height:7px;border-radius:99px;flex:1;background:${i<=idx?'var(--accent)':'var(--surface2)'}" title="${s.kind==='anim'?'Animated explainer':escA(s.title||'')}"></button>`).join('');
  const genericCard=(st)=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:24px;min-height:170px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.07)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><span style="width:30px;height:30px;flex-shrink:0;border-radius:9px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(st.kind==='method'?'spark':'book',16)}</span><div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.2">${esc(st.title||'')}</div></div>
      <div style="font-size:15px;line-height:1.65;color:var(--text);${st.kind==='method'?'white-space:pre-line':''}">${st.kind==='method'?st.html:esc(st.body||'')}</div>
    </div>`;
  const stepContent = step.kind==='anim' ? conceptPlayer() : genericCard(step);
  const stepNav = (idx>0||idx<total-1) ? `<div style="display:flex;gap:10px;margin-bottom:14px">${idx>0?`<button data-act="conceptPrev" style="padding:12px 18px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14.5px">← Back</button>`:''}${idx<total-1?`<button data-act="conceptNext" style="flex:1;padding:12px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${idx===0?'Read more →':'Next card →'}</button>`:''}</div>` : '';
  return `<div style="animation:sb-rise .35s ease both;max-width:780px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><button data-act="conceptBack" style="color:var(--muted);font-weight:700;font-size:14px">← All concepts</button></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);font-weight:700">${esc(csel.category)}</span><span style="${diffStyleFor(csel.difficulty)}">${(diffMap[csel.difficulty]||diffMap.medium)[0]}</span></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:27px;line-height:1.1;margin:0 0 4px">${esc(conceptShort(csel.title))}</h2>
    <div style="font-family:var(--mono);font-size:14px;color:var(--accent);font-weight:700;margin-bottom:16px">${esc(conceptRoots(csel.title))}</div>
    <p style="font-size:14.5px;line-height:1.55;color:var(--muted);margin:0 0 18px">${esc(csel.concept||'')}</p>
    <div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${total}${step.kind==='anim'?' · Watch':''}</span><div style="flex:1;height:6px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${Math.round((idx+1)/total*100)}%;transition:width .3s"></div></div></div>
      <div style="display:flex;gap:6px;margin-bottom:14px">${dots}</div>
      ${stepNav}
      ${stepContent}
    </div>
    <button data-act="conceptWordsToggle" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:15px 18px;font-family:var(--display);font-weight:800;font-size:15px;color:var(--text);margin-bottom:12px"><span>${(S.conceptWordsOpen?'Hide word study':'Study the words one by one')+' · '+cw.length}</span><span style="color:var(--accent)">${S.conceptWordsOpen?'▲':'▼'}</span></button>
    ${S.conceptWordsOpen?`<div style="margin-bottom:22px;animation:sb-rise .3s ease both">${wordFlash(cw.map(x=>({w:x.w,d:x.def||'',s:x.ex||'',p:x.say||'',o:''})), S.conceptWordIdx, 'conceptWordNav', {})}</div>`:''}
    <button data-act="practiseConcept" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-top:12px">Practise these words →</button>
  </div>`;
}

// After an answer is checked, glide to the next word automatically so one Enter is enough.
// (Enter still works to skip the wait; navigating away cancels it.)
function autoAdvance(ms){ try{ clearTimeout(state._advTimer); }catch(e){}
  state._advTimer=setTimeout(()=>{ if(state.status && state.status!=='idle' && (state.nav==='train'||state.nav==='coach')){ try{ app.next(); }catch(e){} } }, ms||900); }
function sessionResults(){
  const S=state; const ok=S.sessionCorrect||[]; const bad=S.sessionWrong||[]; const total=ok.length+bad.length;
  const pct=total?Math.round(ok.length/total*100):0;
  const chip=(w,good)=>`<span style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:99px;background:${good?'color-mix(in srgb,var(--good) 15%,transparent)':'color-mix(in srgb,var(--bad) 14%,transparent)'};font-family:var(--display);font-weight:800;font-size:14px;color:${good?'var(--good)':'var(--bad)'}"><button data-act="say" data-arg="${escA(w.w)}" title="Hear it" style="display:inline-flex;color:inherit;opacity:.8">${iconSVG('volume',13)}</button>${esc(w.w)}</span>`;
  const col=(title,arr,good)=>`<div style="flex:1;min-width:240px;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="width:26px;height:26px;border-radius:8px;display:grid;place-items:center;background:${good?'color-mix(in srgb,var(--good) 20%,transparent)':'color-mix(in srgb,var(--bad) 18%,transparent)'};color:${good?'var(--good)':'var(--bad)'}">${iconSVG(good?'check':'close',15)}</span><span style="font-family:var(--display);font-weight:800;font-size:15px">${title} · ${arr.length}</span></div>
      ${arr.length?`<div style="display:flex;flex-wrap:wrap;gap:7px">${arr.map(w=>chip(w,good)).join('')}</div>`:`<div style="font-size:13px;color:var(--muted)">${good?'None yet.':'None — perfect! 🎉'}</div>`}
    </div>`;
  const mood = pct>=80?'love':pct>=50?'happy':'oops';
  // If this session was for a levelled list and its level is now complete, offer to advance.
  const c=active(); const lk=S.sessionListKey; let advBtn='';
  try{ if(lk && lk!=='__lesson__' && lk!=='__retry__' && !S.coachSession && stageComplete(c,lk) && listStageIdx(c,lk)<listStages(lk).length-1){
    const nextN=listStageIdx(c,lk)+2;
    advBtn=`<button data-act="advanceStage" data-arg="${escA(lk)}" style="flex:1;min-width:100%;padding:15px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${iconSVG('check',16)} Level cleared — go to Level ${nextN} →</button>`;
  } }catch(e){}
  return `<div style="max-width:720px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="text-align:center;margin-bottom:18px"><div style="width:78px;height:86px;margin:0 auto 8px">${mascotSVG(mood)}</div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Test complete!</h2>
      <div style="font-size:15px;color:var(--muted);font-weight:700">${esc((S.sessionLabel||'Practice').split(' · ')[0])} — you spelled <b style="color:var(--good)">${ok.length}</b> of <b style="color:var(--text)">${total}</b> right (${pct}%)</div></div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px">${col('Spelled correctly',ok,true)}${col('Misspelt',bad,false)}</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${advBtn}
      ${bad.length?`<button data-act="drillMisspelt" style="flex:1;min-width:200px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Spell the ${bad.length} misspelt word${bad.length>1?'s':''} →</button>`:''}
      <button data-act="restartSession" style="flex:1;min-width:160px;padding:14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15.5px">${iconSVG('arrow',16)} Restart the list</button>
      <button data-act="exitTrain" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:15.5px">Done</button>
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
  const tchip=(on,label,act)=>`<button data-act="${act}" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13.5px;border:1px solid ${on?'var(--accent)':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:transparent;color:var(--text)'}">${label}</button>`;
  const mascotAnim=st==='wrong'?'animation:sb-shake .45s ease':(st==='correct'?'animation:sb-pop .4s ease':'');
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center;position:relative">
      <div style="width:96px;height:108px;margin:0 auto 4px"><div style="${mascotAnim};width:96px;height:108px">${mascotSVG(S.mood)}</div></div>
      <button data-act="speak" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:18px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:18px">${tchip(S.showDef,'Definition','toggleDef')}${tchip(S.showSent,'Sentence','toggleSent')}${tchip(S.showOrigin,'Origin','toggleOrigin')}</div>
      ${hints.length?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:14.5px;line-height:1.6;margin-bottom:18px">${hints.join('  ·  ')}</div>`:''}
      <input data-inp="onType" data-key="trainKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:15px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:16px">
      ${showResult?`<div style="${resultStyle}">${esc(resultText)}</div>`:''}
      <div style="display:flex;gap:10px"><button data-act="reveal" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Show answer</button><button data-act="primary" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${primaryLabel}</button></div>
    </div>`;
}
function viewTrain(){
  const S=state; const goalTarget=active().goal||S.draft.goal||10; const goalPctNum=Math.min(100,Math.round((S.goalDone/goalTarget)*100));
  return `<div style="max-width:620px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><button data-act="exitTrain" style="color:var(--muted);font-weight:700;font-size:14px">← Exit</button><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${S.sessionDone} done · ${S.sessionRight} correct</div></div>
    <div style="height:7px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:22px"><div style="height:100%;background:var(--accent);border-radius:99px;width:${goalPctNum}%;transition:width .4s"></div></div>
    ${trainerCard()}
    ${liveHeatmap(S.sessionWords&&S.sessionWords.length?S.sessionWords:WORDS, {anon:true})}
  </div>`;
}
// reusable one-card-at-a-time study flashcard (word + meaning + sentence + params), Prev/Next + progress bar
function wordFlash(words, idx, navAct, opts){
  opts=opts||{}; const N=words.length||1; const i=Math.min(Math.max(idx||0,0),N-1); const w=words[i]||{w:'',d:'',s:'',p:'',o:''};
  const mastered=state.luMastered[nkey(w.w)]; const pct=Math.round((i+1)/N*100);
  const chip=(t)=>`<span style="padding:4px 11px;border-radius:99px;background:var(--surface2);font-size:12px;color:var(--muted);font-weight:700">${t}</span>`;
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="font-size:12.5px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${i+1} of ${N}</span>
      <div style="flex:1;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div>
      ${mastered?'<span style="color:var(--good);font-weight:800;font-size:12.5px;white-space:nowrap">✓ Mastered</span>':''}
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow);text-align:center;min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center">
      <div style="display:flex;align-items:center;justify-content:center;gap:11px">
        <div style="font-family:var(--display);font-weight:800;font-size:clamp(26px,5.5vw,36px);line-height:1.05">${esc(w.w)}</div>
        <button data-act="say" data-arg="${escA(w.w)}" aria-label="Hear the word" title="Hear the word" style="width:42px;height:42px;flex-shrink:0;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${iconSVG('volume',20)}</button>
      </div>
      ${w.sy?`<div style="font-family:var(--mono);font-size:12.5px;color:var(--accent);font-weight:700;letter-spacing:.04em;margin-top:3px">${esc(w.sy)}</div>`:''}
      <div style="font-size:15px;color:var(--text);line-height:1.5;margin-top:8px">${esc(w.d)}</div>
      ${w.s?`<div style="font-size:13.5px;color:var(--muted);line-height:1.55;margin-top:9px"><b style="color:var(--text)">Sentence.</b> ${esc(w.s)}</div>`:''}
      ${w.h?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:13px;color:var(--text);line-height:1.5;margin-top:10px;background:var(--chip);border-radius:12px;padding:9px 13px;max-width:42em"><span style="color:var(--accent);margin-top:1px;flex-shrink:0">${iconSVG('bulb',15)}</span><span>${esc(w.h)}</span></div>`:''}
      ${w.m?`<div style="display:inline-flex;align-items:center;gap:6px;font-size:12.5px;color:var(--bad);font-weight:700;line-height:1.5;margin-top:9px">${iconSVG('alert',14)} Often misspelled “${esc(w.m)}”</div>`:''}
      <div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:15px">
        ${w.bp!=null?`<span title="Bee-probability score: ${w.bp}/100" style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:99px;background:var(--surface2);font-size:12px;color:var(--accent);font-weight:800">${iconSVG('target',13)} ${beeOdds(w.bp)}</span>`:''}
        ${w.p?chip('/ '+esc(w.p)+' /'):''}${w.o?chip(esc(w.o)):''}${w.ps?chip(esc(w.ps)):''}
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <button data-act="${navAct}" data-arg="prev" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button>
      <button data-act="${navAct}" data-arg="next" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'All done ✓':'Next →'}</button>
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
    return `<button data-act="say" data-arg="${escA(w.w)}" title="tap to hear" style="font-family:var(--mono);font-size:11px;font-weight:700;padding:5px 9px;border-radius:7px;color:${fg};background:${bg};${isCur?'box-shadow:0 0 0 2px var(--accent)':''}">${esc(w.w)}</button>`;
  }).join('');
  const legend=[['var(--good)','Mastered'],['var(--bad)','Missed'],['var(--surface2)','New']].map(([c,l])=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:11.5px;color:var(--muted);font-weight:700"><span style="width:11px;height:11px;border-radius:3px;background:${c};display:inline-block"></span>${l}</span>`).join('');
  const pct=Math.round(m/N*100);
  const toggle=anon?`<button data-act="toggleHeat" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:9px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px;white-space:nowrap">${iconSVG(reveal?'eyeoff':'eye',14)} ${reveal?'Hide words':'Show words'}</button>`:'';
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:11px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Live progress</div><div style="flex:1;min-width:90px;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${pct}%;transition:width .35s"></div></div><div style="font-size:12.5px;color:var(--muted);font-weight:700;white-space:nowrap">${m}/${N} mastered${missed?(' · '+missed+' to review'):''}</div>${toggle}</div>
    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px">${cells}</div>
    <div style="display:flex;flex-wrap:wrap;gap:14px">${legend}</div>
  </div>`;
}
function viewLevelUp(){
  const S=state; const c=active(); const theme=S.theme; const evo=EVO[theme]||EVO.spellbound; const fIdx=formIdx(c.level);
  const lw=listWords('default'); const N=lw.length||1; const mastered=lw.filter(w=>S.luMastered[nkey(w.w)]).length; const pos=(S.gi%N)+1;
  const tab=(k,l)=>`<button data-act="luSetTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:9px;font-weight:800;font-size:13.5px;${S.luTab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const header=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px">
      <button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button>
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">Level ${c.level||1} · ${evo[fIdx]}</span>
      <span style="font-size:12.5px;color:var(--muted);font-weight:700">${S.luTab==='practice'?('Word '+pos+' of '+N+' · '):''}${mastered}/${N} mastered</span>
      <button data-act="luToggleWords" style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${iconSVG('grid',15)} Word list ${S.luWordsOpen?'▲':'▼'}</button>
    </div>
    <div style="height:6px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:14px"><div style="height:100%;border-radius:99px;background:var(--accent);width:${Math.round(mastered/N*100)}%;transition:width .4s"></div></div>`;
  const wordsPanel=S.luWordsOpen?`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px;margin-bottom:16px;animation:sb-rise .3s ease both">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Level word list · ${N}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px">${lw.map(w=>`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:12px;padding:11px 13px">${S.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:12px">✓ </span>':''}<span style="font-family:var(--display);font-weight:800;font-size:14.5px">${esc(w.w)}</span><div style="font-size:11.5px;color:var(--muted);line-height:1.4;margin-top:2px">${esc(w.d)}</div></div>`).join('')}</div>
    </div>`:'';
  let body;
  if(S.luTab==='practice') body=trainerCard();
  else body=wordFlash(lw, S.reviseIdx, 'reviseNav', { practise:true });
  return `<div style="max-width:760px;margin:0 auto">${header}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:13px;padding:5px;margin-bottom:16px">${tab('revise','Revise')}${tab('practice','Practice')}</div>
    ${wordsPanel}${body}${liveHeatmap(lw, {anon:S.luTab==='practice'})}</div>`;
}

function viewProgress(){
  const c=active();
  const stats=[{v:(c.xp||124),k:'Words mastered'},{v:(c.acc||88)+'%',k:'Accuracy'},{v:c.streak||12,k:'Day streak'},{v:'Lv '+(c.level||9),k:'Current level'}]
    .map(s=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:15px;padding:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.07)"><div style="font-family:var(--display);font-weight:800;font-size:26px;color:var(--accent)">${s.v}</div><div style="font-size:12.5px;color:var(--muted);font-weight:700">${s.k}</div></div>`).join('');
  const wk=c.week&&c.week.length?c.week:[12,20,15,30,18,25,22]; const maxW=Math.max(...wk,1); const days=['M','T','W','T','F','S','S'];
  const week=wk.map((m,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:7px;height:100%;justify-content:flex-end"><div style="width:100%;border-radius:7px 7px 4px 4px;background:var(--accent);height:${Math.round((m/maxW)*100)}%;min-height:5px;opacity:${m?'1':'.3'}"></div><div style="font-size:11px;color:var(--muted);font-weight:700">${days[i]}</div></div>`).join('');
  const heat=Array.from({length:48},(_,i)=>{ const r=(i*7+3)%10; const c2=r<4?'var(--good)':r<6?'var(--accent3)':r<7?'var(--bad)':'var(--surface2)'; return `<div title="word ${i+1}" style="aspect-ratio:1;border-radius:6px;background:${c2}"></div>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Progress','this week','Mastery, accuracy and streak at a glance — and where each word stands.')}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:18px">${stats}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:16px">This week</div>
      <div style="display:flex;align-items:flex-end;gap:9px;height:120px">${week}</div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:14px">Word heatmap</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(26px,1fr));gap:5px">${heat}</div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;font-size:12px;color:var(--muted);font-weight:600">
        <span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:4px;background:var(--good)"></span>Mastered</span>
        <span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:4px;background:var(--accent3)"></span>Learning</span>
        <span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:4px;background:var(--bad)"></span>Needs work</span>
        <span style="display:flex;align-items:center;gap:6px"><span style="width:12px;height:12px;border-radius:4px;background:var(--surface2)"></span>New</span>
      </div>
    </div>
  </div>`;
}

function parentReviseCard(){ const c=active(); const misses=(c.missed||[]); const top=misses.slice(0,14);
  const chips=top.map(m=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:99px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12.5px"><span style="font-family:var(--mono)">${esc(m.w)}</span>${(m.n>1)?`<span style="color:var(--bad);font-weight:800">×${m.n}</span>`:''}</span>`).join('');
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-top:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px"><div style="font-family:var(--display);font-weight:800;font-size:16px">Words to revise <span style="color:var(--muted);font-weight:700">· ${misses.length}</span></div>${misses.length?`<button data-act="reviseMisses" style="padding:9px 16px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Revise these →</button>`:''}</div>
    ${misses.length?`<div style="display:flex;flex-wrap:wrap;gap:7px">${chips}${misses.length>14?`<span style="padding:5px 10px;font-size:12.5px;color:var(--muted);font-weight:700">+${misses.length-14} more</span>`:''}</div>`:`<p style="margin:0;font-size:13.5px;color:var(--muted)">No misses logged yet — every word so far has been spelled right. 🎉</p>`}
  </div>`; }
function parentActivityCard(){ const S=state; const c=active(); const acts=(c.activity||[]).slice(0,12);
  const rows=acts.map((a,i)=>{ const open=S.parentLogOpen===i; const label=ACT_LABEL[a.kind]||a.label||'Activity'; const acc=a.done?Math.round(a.right/a.done*100):0; const hasDetail=a.misses&&a.misses.length;
    return `<div style="border:1px solid var(--line);border-radius:12px;margin-bottom:8px;overflow:hidden">
      <button data-act="parentLogToggle" data-arg="${i}" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;padding:11px 13px;background:${open?'var(--surface2)':'transparent'}">
        <span style="width:30px;height:30px;flex-shrink:0;border-radius:9px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG(actIcon(a.kind),16)}</span>
        <span style="min-width:0;flex:1"><span style="font-weight:800;font-size:14px">${esc(label)}</span><span style="display:block;font-size:11.5px;color:var(--muted);font-weight:600">${fmtAgo(a.ts)}${a.coins?(' · '+coinAmt(a.coins,11)):''}</span></span>
        <span style="font-family:var(--mono);font-size:12.5px;color:var(--muted);font-weight:700;white-space:nowrap">${a.right}/${a.done}${a.done?(' · '+acc+'%'):''}</span>
        ${hasDetail?`<span style="color:var(--accent);font-size:12px">${open?'▲':'▼'}</span>`:'<span style="width:12px"></span>'}
      </button>
      ${(open&&hasDetail)?`<div style="padding:0 13px 12px;font-size:12.5px;color:var(--muted);line-height:1.6"><b style="color:var(--bad)">Missed:</b> <span style="font-family:var(--mono)">${a.misses.map(esc).join(', ')}</span></div>`:''}
    </div>`; }).join('');
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-top:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
    <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px">Activity log</div>
    <div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Everything ${esc(c.name||'your speller')} has done — tap a row to see the missed words.</div>
    ${acts.length?rows:`<p style="margin:0;font-size:13.5px;color:var(--muted)">No activity yet. Play a game or a practice round and it’ll show up here.</p>`}
  </div>`; }
function actIcon(kind){ return ({practice:'pencil',buzz:'flame',beat:'target',boss:'crown',meaning:'book',spell:'spark',origin:'grid',written:'pencil',oral:'volume',concept:'grid'})[kind]||'spark'; }
function viewParent(){
  const S=state;
  const sub=S.premium
    ? {ic:'crown',title:'Premium',body:'4 worlds, half the concepts & uncapped levels. Earn coins for the rest.',btn:'Manage',btnStyle:'padding:10px 16px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px',cardStyle:'background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 16%,var(--bg2)),var(--bg2));border:1px solid var(--accent);border-radius:18px;padding:20px;box-shadow:var(--glow)'}
    : {ic:'spark',title:'Free plan',body:'2 worlds & Level-Up to Level 5. Earn 🪙 coins to unlock more, or go Premium.',btn:'Upgrade',btnStyle:'padding:10px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)',cardStyle:'background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)'};
  const kids=(S.children.length?S.children:[demo()]).map((k,i)=>`<div style="background:var(--bg2);border:1px solid ${i===S.activeIdx?'var(--accent)':'var(--line)'};border-radius:16px;padding:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.07)">
      <div style="display:flex;align-items:center;gap:13px;margin-bottom:16px"><div style="width:48px;height:48px;border-radius:13px;background:var(--surface2);display:grid;place-items:center">${buddySVG(k.avatar,28)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:17px">${esc(k.name)}</div><div style="font-size:12.5px;color:var(--muted);font-weight:600">Age ${k.age} · ${THEME_LABEL[k.theme]||'Spellbound'}</div></div>
        <button data-act="selectChild" data-arg="${i}" style="padding:7px 13px;border-radius:10px;font-weight:800;font-size:12.5px;${i===S.activeIdx?'background:var(--chip);color:var(--accent)':'background:var(--surface2);color:var(--text)'}">${i===S.activeIdx?'Active':'Switch'}</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
        <div style="background:var(--surface);border-radius:11px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:18px">${k.level||1}</div><div style="font-size:10.5px;color:var(--muted);font-weight:700">LEVEL</div></div>
        <div style="background:var(--surface);border-radius:11px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:18px">${k.acc||0}%</div><div style="font-size:10.5px;color:var(--muted);font-weight:700">ACCURACY</div></div>
        <div style="background:var(--surface);border-radius:11px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:18px">${k.streak||0}</div><div style="font-size:10.5px;color:var(--muted);font-weight:700">STREAK</div></div>
      </div></div>`).join('');
  const parentBtns=`<button data-act="printReport" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px;border:1px solid var(--line)">${iconSVG('print',15)} Weekly report</button><button data-act="addChild" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${iconSVG('plus',15)} Add child</button>`;
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Parent dashboard','',`Track ${esc(active().name||'your speller')}, manage spellers and print a weekly report.`,parentBtns)}
    <div style="${sub.cardStyle}"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="width:46px;height:46px;border-radius:13px;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG(sub.ic,26)}</div>
      <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:18px">${sub.title}</div><div style="font-size:13.5px;color:var(--muted)">${sub.body}</div></div>
      <button data-act="goPaywall" style="${sub.btnStyle}">${sub.btn}</button></div></div>
    <div style="font-family:var(--display);font-weight:800;font-size:16px;margin:20px 2px 12px">Spellers</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">${kids}</div>
    ${parentReviseCard()}
    ${parentActivityCard()}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-top:18px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:6px">Countdown to the Finals</div>
      <div style="font-size:13.5px;color:var(--muted);margin-bottom:14px">North South Foundation National Finals</div>
      <div style="display:flex;align-items:baseline;gap:10px"><div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent)">${daysToBee()}</div><div style="font-size:14px;color:var(--muted);font-weight:700">days to go · 31 Jul 2026</div></div>
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
  const uname=capWords(u.title); const cover=`<div style="position:relative;height:110px;display:flex;align-items:center;justify-content:center;padding:14px;${unitCoverBG(L.unit)}">
    <span style="position:absolute;top:11px;left:12px;font-family:var(--mono);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(L.id)}</span>
    <span style="position:absolute;top:12px;right:12px;width:9px;height:9px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
    ${dn?'<span style="position:absolute;bottom:9px;right:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:13px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
    <div style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16)"><div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${heroFont(hero)}px">${esc(hero)}</div></div>
  </div>`;
  return `<button class="sb-cover-card" data-act="openLesson" data-arg="${L.n}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column">
    ${cover}
    <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(L.title)}</div>
      <div style="font-family:var(--mono);font-weight:700;font-size:11px;color:${f.c};margin-top:4px">Chapter ${L.unit} · ${esc(trunc(uname,26))}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.45;color:var(--muted);margin-top:8px">${trunc(L.bigIdea||L.story||'',92)}</div>
      <div style="margin-top:auto;padding-top:12px;display:flex;align-items:center;justify-content:space-between;gap:8px"><span style="padding:3px 9px;border-radius:99px;font-family:var(--body);font-weight:800;font-size:11px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span><span style="font-family:var(--body);font-weight:800;font-size:12px;color:${f.c};white-space:nowrap">${nW} words →</span></div>
    </div>
  </button>`;
}
function lessonBigCard(L){ const dn=lessonComplete(L); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''}; const f=unitPal(L.unit);
  const dc=DIFF_DOT[L.diff]||DIFF_DOT.medium; const hero=lessonHero(L); const nW=(L.words||[]).filter(x=>x&&x.w).length;
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--glow)">
    <div style="position:relative;height:150px;display:flex;align-items:center;justify-content:center;padding:18px;${unitCoverBG(L.unit)}">
      <span style="position:absolute;top:14px;left:15px;font-family:var(--mono);font-weight:700;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.85)">${esc(L.id)} · Chapter ${L.unit}</span>
      <span style="position:absolute;top:15px;right:15px;width:11px;height:11px;border-radius:50%;background:${dc};box-shadow:0 0 0 3px rgba(255,255,255,.28)"></span>
      ${dn?'<span style="position:absolute;bottom:13px;right:14px;width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:15px;box-shadow:0 2px 6px rgba(0,0,0,.2)">✓</span>':''}
      <div style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.18)"><div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-style:italic;font-weight:700;font-size:${Math.min(48,heroFont(hero)+8)}px">${esc(hero)}</div></div>
    </div>
    <div style="padding:clamp(18px,4vw,24px)">
      <div style="font-family:var(--mono);font-weight:700;font-size:11.5px;color:${f.c};margin-bottom:6px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:clamp(20px,4vw,25px);line-height:1.14;margin-bottom:8px">${esc(L.title)}</div>
      <p style="font-size:14.5px;line-height:1.6;color:var(--text);margin:0 0 18px">${mdInline(trunc(L.bigIdea||L.story||'',200))}</p>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <span style="padding:4px 11px;border-radius:99px;font-family:var(--body);font-weight:800;font-size:12px;color:#fff;background:${dc}">${L.diff?titleCase(L.diff):'Medium'}</span>
        <button data-act="openLesson" data-arg="${L.n}" style="padding:12px 20px;border-radius:13px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Open &amp; study · ${nW} words →</button>
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
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button></div>
      <div style="background:var(--bg2);border:1px solid var(--accent);border-radius:22px;padding:30px;text-align:center;box-shadow:var(--glow)">
        <div style="width:64px;height:64px;border-radius:16px;background:var(--chip);color:var(--accent);display:grid;place-items:center;margin:0 auto 14px">${iconSVG('book',32)}</div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 8px">Word Journeys</h2>
        <p style="color:var(--muted);font-size:14.5px;line-height:1.6;margin:0 0 18px">A 100‑lesson tour through the history &amp; geography of words — from Proto‑Indo‑European roots to Latin, Greek, Norse and beyond. Learn the stories behind spellings, then drill the words from each lesson.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px">${units.slice(0,5).map(u=>`<span style="padding:5px 11px;border-radius:99px;background:var(--surface2);font-size:12px;font-weight:700;color:var(--muted)">${esc(trunc(u.title,22))}</span>`).join('')}</div>
        <button data-act="goPaywall" style="padding:14px 24px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Unlock with Premium 👑</button>
      </div></div>`;
  }
  const guided=S.journeyView==='guided';
  let main, headDesc, wrapStyle;
  if(guided){
    const N=all.length; const i=Math.min(Math.max(S.journeyPage||0,0),Math.max(0,N-1)); const curL=all[i];
    headDesc='Your guided path — one lesson at a time, in order. Step through, study, and practise.';
    wrapStyle='max-width:680px;margin:0 auto';
    main=`<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><span style="font-size:12.5px;color:var(--muted);font-weight:700;white-space:nowrap">Lesson ${i+1} of ${N}</span><div style="flex:1;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${Math.round((i+1)/N*100)}%;transition:width .3s"></div></div></div>
      ${lessonBigCard(curL)}
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px"><button data-act="journeyPagePrev" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${i<=0?'opacity:.4;pointer-events:none':''}">← Back</button><button data-act="journeyPageNext" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);${i>=N-1?'opacity:.5;pointer-events:none':''}">${i>=N-1?'End of the path ✓':'Next lesson →'}</button></div>`;
  } else {
    const gridStyle='display:grid;grid-template-columns:repeat(auto-fill,minmax(236px,1fr));gap:14px';
    headDesc='The history &amp; geography of words, in 10 eras — read a lesson, then practise its five words.';
    wrapStyle='';
    main=units.map(u=>{ const ls=all.filter(L=>L.unit===u.n); if(!ls.length) return '';
      const f=unitPal(u.n); const dc=ls.filter(L=>lessonComplete(L)).length;
      const header=`<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
        <span style="width:10px;height:10px;border-radius:3px;background:${f.c};flex-shrink:0"></span>
        <h3 style="font-family:var(--display);font-weight:800;font-size:18px;margin:0;color:var(--text)">Chapter ${u.n} · ${esc(capWords(u.title))}</h3>
        <span style="font-family:var(--mono);font-size:11.5px;color:var(--muted);white-space:nowrap">${dc}/${ls.length} done</span>
        <span style="flex:1;height:1px;background:var(--line)"></span>
      </div>`;
      return header+`<div style="${gridStyle}">${ls.map(lessonCoverCard).join('')}</div>`;
    }).join('');
  }
  const pathBtn=`<button data-act="journeySetView" data-arg="${guided?'all':'guided'}" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">${guided?('← Browse all '+iconSVG('grid',15)):('Guided path '+iconSVG('arrow',15))}</button>`;
  return `<div style="${wrapStyle}">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button></div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:4px"><div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap"><h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0">Word Journeys</h2><span style="font-family:var(--mono);font-size:12px;color:var(--muted)">${chaptersTotal} chapters</span></div>${pathBtn}</div>
    <p style="margin:0 0 8px;color:var(--muted);font-size:14px;max-width:52em">${headDesc}</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin:12px 0 4px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('book',15)} ${chaptersDone}/${chaptersTotal} chapters</span>
      <div style="flex:1;min-width:140px;height:7px;border-radius:99px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:99px;background:var(--accent);width:${Math.round(done)}%;transition:width .4s"></div></div>
      <span style="font-size:12.5px;color:var(--muted);font-weight:700">${done}%</span>
    </div>
    ${main}</div>`; }
/* ===== Theme Journeys view — pick themes you love; each becomes a staged journey ===== */
function themeCoverBG(cl){ const t=CONCEPT_TEX[cl.tex]||CONCEPT_TEX.stripes;
  return `background-color:${cl.c};background-image:${t[0]},linear-gradient(135deg,${cl.c},${cl.c2});background-size:${t[1]},100% 100%;background-position:center`; }
function themeCard(t){ const c=active(); const cl=themeClusters().find(x=>x.id===t.cluster)||themeClusters()[0];
  const key=themeKey(t.id); const pinned=!!((c.pinnedLists||{})[key]); const st=themeStat(t.id);
  const started=pinned||(getList(c,key).xp||0)>0; const lvl=listStageIdx(c,key)+1;
  const done=st.total>0 && st.m/st.total>=PATTERN_DONE_PCT;
  return `<button class="sb-cover-card" data-act="addTheme" data-arg="${t.id}" style="text-align:left;background:var(--bg2);border:1px solid ${pinned?cl.c:'var(--line)'};border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column">
    <div style="position:relative;height:92px;display:flex;align-items:center;justify-content:center;padding:12px;${themeCoverBG(cl)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--mono);font-weight:700;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(cl.label)}</span>
      ${done?'<span style="position:absolute;bottom:8px;right:9px;width:21px;height:21px;border-radius:50%;background:rgba(255,255,255,.94);color:#1fa377;display:grid;place-items:center;font-weight:900;font-size:12px">✓</span>':''}
      ${pinned?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:9px">MY THEME</span>':''}
      <div style="font-family:var(--display);color:#fff;font-weight:700;font-style:italic;font-size:${heroFont(t.hero)}px;line-height:1;text-shadow:0 2px 8px rgba(0,0,0,.18)">${esc(t.hero)}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:14.5px;line-height:1.18;color:var(--text)">${esc(t.label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:11.5px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(t.sub)}</div>
      <div style="margin-top:auto;padding-top:11px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted);font-weight:700">${fmtN(st.total)} words${st.m?(' · '+st.m+' ✓'):''}</span>
        <span style="font-family:var(--body);font-weight:800;font-size:12px;color:${cl.c};white-space:nowrap">${started?('Level '+lvl+' →'):'Add →'}</span>
      </div>
    </div>
  </button>`; }
function viewThemes(){ const S=state; const c=active(); ensureLists(c);
  const defs=themeDefs(); const mine=myThemes();
  const mastered=defs.reduce((a,t)=>a+themeStat(t.id).m,0);
  const doneThemes=defs.filter(t=>{ const st=themeStat(t.id); return st.total>0 && st.m/st.total>=PATTERN_DONE_PCT; }).length;
  const myRow = mine.length
    ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px"><span style="font-family:var(--mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700">My themes</span>${mine.map(t=>{ const cl=themeClusters().find(x=>x.id===t.cluster)||{}; return `<button data-act="selectList" data-arg="${themeKey(t.id)}" oncontextmenu="return sbDelList(event,'${themeKey(t.id)}')" title="Train · right-click to remove" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:11px;border:1px solid ${cl.c};background:color-mix(in srgb,${cl.c} 12%,var(--bg2));color:var(--text);font-weight:800;font-size:12.5px">${esc(t.label)} <span style="opacity:.7;font-size:11px">L${listStageIdx(c,themeKey(t.id))+1}</span></button>`; }).join('')}</div>`
    : `<div style="background:color-mix(in srgb,var(--accent) 9%,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;font-size:13.5px;color:var(--text)"><b>Pick 3–5 themes you love.</b> Words stick better when they live somewhere — a kitchen, a courtroom, the night sky. Each theme becomes its own level ladder, and it joins your top bar in Practice.</div>`;
  const grid='display:grid;grid-template-columns:repeat(auto-fill,minmax(224px,1fr));gap:13px';
  const sections=themeClusters().map(cl=>{ const ts=defs.filter(t=>t.cluster===cl.id); if(!ts.length) return '';
    return `<div style="display:flex;align-items:center;gap:12px;margin:24px 0 12px">
      <span style="width:10px;height:10px;border-radius:3px;background:${cl.c};flex-shrink:0"></span>
      <h3 style="font-family:var(--display);font-weight:800;font-size:18px;margin:0;color:var(--text)">${esc(cl.label)}</h3>
      <span style="font-family:var(--mono);font-size:11.5px;color:var(--muted);white-space:nowrap">${ts.length} themes</span>
      <span style="flex:1;height:1px;background:var(--line)"></span>
    </div><div style="${grid}">${ts.map(themeCard).join('')}</div>`; }).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Theme Journeys', defs.length+' themes', 'Learn words by the worlds they live in — medicine, music, maps, mythology… Pick a theme and climb its levels; every word you master counts everywhere else too.')}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:13px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;flex-wrap:wrap">
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('palette',15)} ${mine.length} picked · ${doneThemes} complete</span>
      <span style="font-size:12.5px;color:var(--muted);font-weight:700">${fmtN(mastered)} themed words mastered</span>
    </div>
    ${myRow}
    ${sections}
  </div>`; }
function viewLesson(){ const S=state; const L=S.lessonSel; const dn=lessonComplete(L); const ws=lessonWordObjs(L);
  const f=unitPal(L.unit); const u=lessonUnits().find(x=>x.n===L.unit)||{title:''};
  // Each of the 5 words as a rich sub-card: word · pronunciation · syllables · meaning · full etymology (every bullet kept).
  const wordCards=ws.map(w=>{ const ety=(w.etyArr&&w.etyArr.length)?w.etyArr:(w.r?[w.r]:[]);
    return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:13px 15px;margin-bottom:10px">
      <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:6px"><span style="font-family:var(--display);font-weight:800;font-size:17px;letter-spacing:.01em">${esc(w.w)}</span>${w.p?`<span style="font-family:var(--mono);font-size:11.5px;color:var(--accent);font-weight:700">/ ${esc(w.p)} /</span>`:''}${w.sy&&w.sy.toLowerCase()!==w.w.toLowerCase()?`<span style="font-size:11.5px;color:var(--muted);font-weight:700">${esc(w.sy)}</span>`:''}${state.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:11.5px">✓ mastered</span>':''}<button data-act="say" data-arg="${escA(w.w)}" title="Hear it" style="margin-left:auto;color:var(--accent)">${iconSVG('volume',16)}</button></div>
      ${w.d?`<div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:${ety.length?'7':'0'}px">${esc(w.d)}</div>`:''}
      ${ety.length?`<div style="border-top:1px dashed var(--line);padding-top:8px"><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:5px">Etymology</div>${ety.map(e=>`<div style="display:flex;gap:7px;font-size:12.5px;color:var(--muted);line-height:1.55;margin-bottom:4px"><span style="color:${f.c};flex-shrink:0">•</span><span>${mdInline(e)}</span></div>`).join('')}</div>`:''}
    </div>`; }).join('');
  const act=(label,txt)=>txt?`<div style="margin-bottom:10px"><span style="font-weight:800;font-size:13.5px;color:${f.c}">${label}.</span> <span style="font-size:13.5px;color:var(--text);line-height:1.55">${mdInline(txt)}</span></div>`:'';
  // Every lesson is a card flow (like Concepts): one section per card, no content dropped.
  const practiceHTML=(L.practice&&(L.practice.decode||L.practice.trace||L.practice.build))?`${act('Decode it',L.practice.decode)}${act('Trace it',L.practice.trace)}${act('Build it',L.practice.build)}`:'';
  const steps=[];
  if(L.bigIdea) steps.push({tag:'Big idea',ic:'bulb',body:`<p style="margin:0;font-size:16px;line-height:1.62;font-weight:600;color:var(--text)">${mdInline(L.bigIdea)}</p>`});
  if(L.story) steps.push({tag:'The story',ic:'book',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.story)}</p>`});
  if(L.pattern) steps.push({tag:'The pattern',ic:'search',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.pattern)}</p>`});
  steps.push({tag:'The five words',ic:'spark',body:`${wordCards}<button data-act="practiseLesson" style="width:100%;margin-top:6px;padding:13px;border-radius:13px;background:${f.c};color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Practise these 5 words →</button>`});
  if(L.connection) steps.push({tag:'The connection',ic:'link',body:`<p style="margin:0;font-size:15px;line-height:1.68;color:var(--text)">${mdInline(L.connection)}</p>`});
  if(practiceHTML) steps.push({tag:'Try with a grown-up',ic:'pencil',body:practiceHTML});
  const N=steps.length; const idx=Math.min(Math.max(S.lessonStep||0,0),N-1); const step=steps[idx];
  const dots=steps.map((s,i)=>`<button data-act="lessonStepGo" data-arg="${i}" style="height:7px;border-radius:99px;flex:1;background:${i<=idx?f.c:'var(--surface2)'}" title="${esc(s.tag)}"></button>`).join('');
  const last=idx>=N-1;
  const nextBtn=last
    ? (L.n<100?`<button data-act="openLesson" data-arg="${L.n+1}" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Next lesson →</button>`:`<button data-act="lessonBack" style="flex:1;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Finish ✓</button>`)
    : `<button data-act="lessonStepNext" style="flex:1;padding:14px;border-radius:14px;background:${f.c};color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Next card →</button>`;
  return `<div style="max-width:660px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><button data-act="lessonBack" style="color:var(--muted);font-weight:700;font-size:14px">← All lessons</button><span style="margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="font-family:var(--mono)">${L.id}</span> · <span style="text-transform:capitalize">${L.diff}</span> <span style="width:9px;height:9px;border-radius:50%;background:${DIFF_DOT[L.diff]}"></span></span></div>
    <div style="font-family:var(--mono);font-weight:700;font-size:11.5px;color:${f.c};margin-bottom:3px">Chapter ${L.unit} · ${esc(capWords(u.title))}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:22px;line-height:1.15;margin:0 0 14px">${esc(L.title)}${dn?' <span style="color:var(--good);font-size:17px">✓</span>':''}</h2>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px"><span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${idx+1} of ${N}</span><div style="display:flex;gap:5px;flex:1">${dots}</div></div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px"><button data-act="lessonStepPrev" style="padding:12px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;${idx<=0?'opacity:.4;pointer-events:none':''}">← Back</button>${nextBtn}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--glow);animation:sb-rise .3s ease both">
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
    const rbtn=(r,label,col)=>`<button data-act="evoRate" data-arg="${r}" style="flex:1;padding:10px 8px;border-radius:11px;font-weight:800;font-size:13px;border:2px solid ${fb.rate===r?col:'var(--line)'};background:${fb.rate===r?col:'var(--surface2)'};color:${fb.rate===r?'#fff':'var(--text)'}">${label}</button>`;
    editor=`<div style="position:sticky;top:64px;z-index:5;background:var(--bg2);border:1px solid var(--accent);border-radius:18px;padding:16px;margin-bottom:18px;box-shadow:var(--glow)">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">
        <div style="width:64px;height:68px;flex-shrink:0;background:var(--surface2);border-radius:12px;display:grid;place-items:center">${evEmb(t,i)}</div>
        <div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:17px">${esc(THEME_LABEL[t]||t)} · Lv ${i+1}</div><div style="font-size:13px;color:var(--muted);font-weight:600">“${esc(nm)}”</div></div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px">${rbtn('keep','Keep','var(--good)')}${rbtn('tweak','Tweak','#E8A33A')}${rbtn('redo','Redo','var(--bad)')}</div>
      <textarea data-inp="evoNote" data-fkey="evonote" placeholder="What should change? Colour, shape, clarity, vibe, how it reads at small size…" style="width:100%;min-height:64px;resize:vertical;padding:11px 13px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:14px;font-family:var(--body)">${esc(fb.note||'')}</textarea>
      <div style="display:flex;justify-content:flex-end;margin-top:8px"><button data-act="evoClearTile" style="font-size:12.5px;color:var(--bad);font-weight:700">Clear this tile</button></div>
    </div>`;
  } else { editor=`<div style="background:var(--surface2);border:1px dashed var(--line);border-radius:14px;padding:14px 16px;margin-bottom:18px;font-size:13.5px;color:var(--muted)">Tap any tile below to rate it (Keep / Tweak / Redo) and add a note. Your feedback saves automatically — hit <b>Export</b> when done.</div>`; }
  const sections=themes.map(t=>{ const tiles=(EV_NOMEN[t]||[]).map((nm,i)=>{ const key=t+':'+i; const fb=EVOFB[key]||{}; const sel=S.evoSel===key;
      const dotCol=fb.rate?RC[fb.rate]:(fb.note?'#E8A33A':null);
      const dot=dotCol?`<span style="position:absolute;top:5px;right:5px;width:9px;height:9px;border-radius:50%;background:${dotCol};box-shadow:0 0 0 2px var(--bg2)"></span>`:'';
      return `<button data-act="evoSelect" data-arg="${key}" style="position:relative;background:var(--bg2);border:2px solid ${sel?'var(--accent)':'var(--line)'};border-radius:12px;padding:8px 4px 6px;display:flex;flex-direction:column;align-items:center;gap:2px">${dot}<div style="width:46px;height:50px;display:grid;place-items:center">${evEmb(t,i)}</div><div style="font-family:var(--mono);font-size:8px;color:var(--muted);font-weight:700">LV ${i+1}</div><div style="font-family:var(--display);font-weight:700;font-size:9.5px;text-align:center;line-height:1.05">${esc(nm)}</div></button>`; }).join('');
    return `<div style="margin-bottom:18px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:9px;display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border-radius:4px;background:linear-gradient(135deg,${(EV_TC[t]||EV_TC.spellbound).a},${(EV_TC[t]||EV_TC.spellbound).b})"></span>${esc(THEME_LABEL[t]||t)}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px">${tiles}</div></div>`;
  }).join('');
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goSettings" style="color:var(--muted);font-weight:700;font-size:14px">← Settings</button><span style="font-family:var(--display);font-weight:800;font-size:22px">Design feedback</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:10px"><span style="font-size:12.5px;color:var(--muted);font-weight:700">${reviewed}/80 reviewed</span><button data-act="evoExport" style="padding:9px 16px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Export →</button></span></div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:14px">All 80 evolution tiles (8 worlds × 10 levels). Give per-tile feedback, then export it.</p>
    ${editor}${sections}
  </div>`; }
function viewSettings(){
  const S=state;
  const themes=THEMES.map(t=>{ const ev=EVO[t.id]||EVO.spellbound; const on=t.id===S.theme; const locked=!isThemeUnlocked(t.id);
    const badge=on?'<span style="margin-left:auto;font-size:11px;font-weight:800;color:var(--accent)">Active</span>':(locked?('<span style="margin-left:auto;font-size:11px;font-weight:900;color:#a06a00;background:linear-gradient(135deg,#FFE08A,#F0B85C);padding:3px 8px;border-radius:99px;white-space:nowrap">'+coinAmt(COST.theme,11)+'</span>'):'');
    return `<button data-act="pickTheme" data-arg="${t.id}" style="text-align:left;border-radius:14px;padding:13px;transition:.18s;background:var(--surface2);border:2px solid ${on?'var(--accent)':'transparent'}${on?';box-shadow:0 6px 18px color-mix(in srgb,var(--accent) 28%,transparent)':''};${locked?'opacity:.92':''}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><div style="width:34px;height:34px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,${t.c1},${t.c2});flex-shrink:0;color:#fff;${locked?'filter:grayscale(.55)':''}">${locked?iconSVG('lock',18,2.2):worldEmblemSVG(t.id,20)}</div>
        <div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:14.5px;color:var(--text);line-height:1.05">${t.label}</div><div style="font-family:var(--mono);font-size:9.5px;letter-spacing:.02em;color:var(--accent);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ev[0]} → ${ev[9]}</div></div>${badge}</div>
      <div style="font-size:11.5px;color:var(--muted);line-height:1.4">${WORLD_DEF[t.id]||''}</div></button>`; }).join('');
  const _voices=enVoices();
  const _nat=(n)=>/natural|enhanced|premium|siri|google|neural|online/i.test(n);
  const voiceOpts=['<option value="">Auto · best available</option>'].concat(_voices.map(v=>`<option value="${escA(v.name)}"${VOICE.name===v.name?' selected':''}>${esc(v.name)}${_nat(v.name)?' ✨':''}</option>`)).join('');
  const voiceCard=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:12px">
        <div><div style="font-family:var(--display);font-weight:800;font-size:16px">Voice</div><div style="font-size:13px;color:var(--muted)">The voice that reads words &amp; sentences aloud</div></div>
        <button data-act="voiceTest" style="padding:11px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);white-space:nowrap">▶ Test</button>
      </div>
      <div style="position:relative"><select data-chg="voiceSetDevice" style="width:100%;appearance:none;-webkit-appearance:none;padding:13px 36px 13px 14px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px;cursor:pointer">${voiceOpts}</select><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--accent);font-size:11px">▼</span></div>
      <p style="font-size:12px;color:var(--muted);line-height:1.55;margin:12px 0 0">Spellbound picks the smoothest voice your device offers and works on phones, tablets and computers — no account or key, fully offline. Voices marked ✨ are the most natural. ${_voices.length?'':'<b style="color:var(--text)">Voices load a moment after opening</b> — reopen Settings to see the full list. '}For an even nicer voice you can add a free one in your device’s settings (Apple: Accessibility → Spoken Content; Android: Text-to-speech; Windows: Speech) and it’ll appear here.</p>
    </div>`;
  return `<div style="max-width:640px">
    <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 16px">Settings</h2>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:3px">World</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">Each world is a different look and a character that evolves as you level up.</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(212px,1fr));gap:11px">${themes}</div>
    </div>
    ${voiceCard}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div><div style="font-family:var(--display);font-weight:800;font-size:16px">Background</div><div style="font-size:13px;color:var(--muted)">Tinted paper or pure white</div></div>
      <div style="display:flex;background:var(--surface2);border-radius:999px;padding:3px"><button data-act="setLight" style="${seg(S.mode==='light')}">Light</button><button data-act="setWhite" style="${seg(S.mode==='white')}">White</button></div>
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div><div style="font-family:var(--display);font-weight:800;font-size:16px">Sound effects</div><div style="font-size:13px;color:var(--muted)">Dings, coins &amp; celebrations during games</div></div>
      <button data-act="toggleSound" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:12px;background:${S.sound?'var(--accent)':'var(--surface2)'};color:${S.sound?'#fff':'var(--muted)'};font-weight:800;font-size:14px">${S.sound?'🔊 On':'🔇 Off'}</button>
    </div>
    <div style="background:var(--bg2);border:1px solid ${S.devUnlock?'var(--accent)':'var(--line)'};border-radius:18px;padding:20px;margin-bottom:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06);display:flex;align-items:center;justify-content:space-between;gap:14px">
      <div style="min-width:0"><div style="display:inline-flex;align-items:center;gap:7px;font-family:var(--display);font-weight:800;font-size:16px">${iconSVG('lock',16)} Unlock everything <span style="font-family:var(--mono);font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface2);padding:2px 7px;border-radius:99px">testing</span></div><div style="font-size:13px;color:var(--muted)">Unlocks all concepts, lists, worlds &amp; every level — no coins or Premium needed.</div></div>
      <button data-act="toggleDevUnlock" style="display:inline-flex;align-items:center;gap:7px;padding:10px 16px;border-radius:12px;background:${S.devUnlock?'var(--accent)':'var(--surface2)'};color:${S.devUnlock?'#fff':'var(--muted)'};font-weight:800;font-size:14px">${S.devUnlock?'🔓 On':'Off'}</button>
    </div>
    <button data-act="openEvoFeedback" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:15px 18px;border-radius:14px;background:var(--bg2);border:1px solid var(--line);box-shadow:inset 0 -3px 0 rgba(0,0,0,.06);margin-bottom:16px;color:var(--text)"><div style="text-align:left"><div style="font-family:var(--display);font-weight:800;font-size:16px">Design feedback</div><div style="font-size:12.5px;color:var(--muted)">Review the 80 evolution tiles &amp; export notes</div></div><span style="color:var(--accent)">${iconSVG('arrow',18)}</span></button>
    <button data-act="signOut" style="width:100%;padding:14px;border-radius:14px;background:var(--surface2);color:var(--bad);font-weight:800;font-size:15px">Sign out</button>
  </div>`;
}

/* ===================== WORD COACH ===================== */
const FREE_LISTS = { default:1, review:1, missed:1, custom:1, ai:1, journey:1 };
function isPremiumList(key){ if(isThemeKey(key)) return false; return !FREE_LISTS[key]; }
// Right-click a top-nav list chip to remove it (all but the core 3). Progress is kept; re-add from Setup.
window.sbDelList = function(e,key){ try{ e.preventDefault(); e.stopPropagation(); }catch(_){}
  if({journey:1,review:1,missed:1}[key]){ flash('That one stays — it’s a core list.'); return false; }
  const c=active(); const nm=(key==='journey'?'Spellbound Journey':listLabel(key).split(' · ')[0]);
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
  // Curated quick-switch row: Journey + the currently-selected list (if any other) + Tricky review + Missed words.
  // Every other list lives in "Setup & lists".
  const chipLabel=(k)=> k==='journey'?'Spellbound Journey':listLabel(k).split(' · ')[0];
  // The 3 core lists always stay. Any other list the child has added shows here too and can be
  // removed with a right-click (it just leaves the quick-switch — progress is kept, re-add from Setup).
  const CORE_LISTS={journey:1,review:1,missed:1}; const pinned=c.pinnedLists||{};
  let extras=Object.keys(pinned).filter(k=>!CORE_LISTS[k] && pinned[k]);   // only lists the user has added
  if(!CORE_LISTS[key] && !extras.includes(key)) extras.push(key);           // always show the one being trained
  let chipKeys=['journey', ...extras, 'review','missed'];
  chipKeys=chipKeys.filter((k,i)=>chipKeys.indexOf(k)===i);
  const chips=chipKeys.map(k=>{ const on=k===key; const star=(k==='journey')?'★ ':''; const canDel=!CORE_LISTS[k];
    return `<button data-act="selectList" data-arg="${k}"${canDel?` oncontextmenu="return sbDelList(event,'${escA(k)}')" title="Right-click to remove this list"`:''} style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:8px 13px;border-radius:11px;font-weight:800;font-size:13px;border:1px solid ${on?'var(--accent)':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${star}${esc(chipLabel(k))} <span style="opacity:.85;font-weight:700;font-size:11.5px">L${listStageIdx(c,k)+1}</span></button>`; }).join('');
  const addBtn=`<button data-act="coachSetupOpen" style="white-space:nowrap;padding:8px 13px;border-radius:11px;font-weight:800;font-size:13px;border:1px dashed var(--line);background:transparent;color:var(--accent)">+ Lists</button>`;
  const topBar=`<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button><span style="font-family:var(--display);font-weight:800;font-size:22px;margin-left:4px">Word Coach</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('target',14)} ${daysToBee()} days to the bee</span></div>`;
  const allWordsBtn=`<button data-act="luToggleWords" style="display:inline-flex;align-items:center;gap:6px;white-space:nowrap;padding:8px 13px;border-radius:11px;font-weight:800;font-size:13px;border:1px solid ${S.luWordsOpen?'var(--accent)':'var(--line)'};background:var(--surface2);color:var(--text)">${iconSVG('grid',14)} All words <span style="color:var(--muted);font-weight:700">${fullList.length}</span> ${S.luWordsOpen?'▴':'▾'}</button>`;
  const newSetBtn = fullList.length>WORK_MAX ? `<button data-act="newBatch" title="Swap in a fresh set of words from this list" style="white-space:nowrap;padding:8px 13px;border-radius:11px;font-weight:800;font-size:13px;border:1px solid var(--line);background:var(--surface2);color:var(--text)">🔄 New set</button>` : '';
  const chipsRow=`<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;margin-bottom:12px">${chips}${addBtn}${allWordsBtn}${newSetBtn}</div>`;
  const allWordsPanel = S.luWordsOpen ? (()=>{ const cap=400; const shown=fullList.slice(0,cap);
    const cells=shown.map(w=>`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:11px;padding:10px 12px"><div style="display:flex;align-items:center;gap:6px"><span style="font-family:var(--display);font-weight:800;font-size:14px">${esc(w.w)}</span>${state.luMastered[nkey(w.w)]?'<span style="color:var(--good);font-weight:800;font-size:11px">✓</span>':''}<button data-act="say" data-arg="${escA(w.w)}" style="margin-left:auto;color:var(--accent)">${iconSVG('volume',14)}</button></div>${w.d?`<div style="font-size:11.5px;color:var(--muted);line-height:1.4;margin-top:3px">${esc(trunc(w.d,90))}</div>`:''}</div>`).join('');
    return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:14px;margin-bottom:14px;animation:sb-rise .3s ease both"><div style="font-family:var(--display);font-weight:800;font-size:14.5px;margin-bottom:10px">Level ${stage.n} words · ${esc(listLabel(key).split(' · ')[0])} · ${fullList.length}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;max-height:360px;overflow-y:auto">${cells}</div>${fullList.length>cap?`<div style="font-size:11.5px;color:var(--muted);margin-top:8px">Showing the first ${cap} of ${fullList.length}.</div>`:''}</div>`; })() : '';
  const titleRow = (S.renameKey===key)
    ? `<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px"><input data-inp="renameInput" data-fkey="renameInp" value="${escA(S.renameVal)}" maxlength="40" placeholder="List name" style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--accent);border-radius:10px;padding:8px 11px;font-size:15px;font-weight:800;color:var(--text);font-family:var(--display)"><button data-act="saveRename" style="padding:8px 13px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Save</button><button data-act="cancelRename" style="padding:8px 11px;border-radius:10px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:13px">✕</button></div>`
    : `<div style="display:inline-flex;align-items:center;gap:8px;min-width:0"><span style="font-family:var(--display);font-weight:800;font-size:16px">${esc(listLabel(key))}</span><button data-act="startRename" data-arg="${escA(key)}" title="Rename this list" style="color:var(--muted);display:inline-flex">${iconSVG('pencil',15)}</button><span style="font-size:13px;color:var(--muted);font-weight:700;white-space:nowrap">· Level ${uiLevel}</span></div>`;
  // ---- one Level header (Word→Set→Level→Champ→Library) ----
  const levelHeadline = isJourney
    ? (stage.champ ? ('Level '+stage.n+' of '+CHAMP_LEVELS+' to Champ') : ('Champion\'s Library · '+esc(stage.label)))
    : ('Level '+stage.n+' of '+stages.length);
  const levelTag = isJourney
    ? (stage.champ ? `<span style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--accent)">SPELLBOUND CHAMP</span>` : `<span style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;color:#C8901B">★ CHAMP · LIBRARY</span>`)
    : `<span style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.08em;color:var(--muted)">${esc(listLabel(key).split(' · ')[0]).toUpperCase()}</span>`;
  const advanceTo = isJourney ? (nextIsLibrary ? ('Library '+(stage.n-CHAMP_LEVELS+1)) : ('Level '+(stage.n+1))) : ('Level '+(stage.n+1));
  let advanceHTML;
  if(lastStage && stageDone){ advanceHTML=`<div style="margin-top:10px;font-size:12.5px;color:var(--good);font-weight:800">🏆 Every level cleared — legendary!</div>`; }
  else if(stageDone && libLocked){ advanceHTML=`<div style="margin-top:11px;background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:11px 13px"><div style="font-weight:800;font-size:13px;margin-bottom:3px">🏆 You're a Spellbound Champ!</div><div style="font-size:11.5px;color:var(--muted);line-height:1.5;margin-bottom:9px">The Champion's Library — the other ${fmtN(journeyTotal()-champWordCount())} words — is Premium.</div><button data-act="goPaywall" style="padding:9px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Unlock the Library 👑</button></div>`; }
  else if(stageDone){ advanceHTML=`<button data-act="advanceStage" data-arg="${escA(key)}" style="margin-top:11px;width:100%;padding:12px;border-radius:11px;background:var(--good);color:#fff;font-weight:800;font-size:14.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Level ${stage.n} cleared! Go to ${advanceTo} →</button>`; }
  else { advanceHTML=`<div style="margin-top:11px"><button data-act="openChallenge" data-arg="${escA(key)}" style="width:100%;padding:12px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">⚡ Take the Level ${stage.n} Challenge</button></div><div style="margin-top:8px;font-size:11px;color:var(--muted);line-height:1.5">Master all ${stage.words.length} words to level up — or pass the Challenge to test out early.</div>`; }
  const tracker = isJourney
    ? `<div style="display:flex;gap:3px;margin-top:11px">${Array.from({length:CHAMP_LEVELS},(_,i)=>`<span style="flex:1;height:5px;border-radius:99px;background:${(uiLevel>i+1||(uiLevel===i+1&&stageDone))?'var(--good)':(uiLevel===i+1?'var(--accent)':'var(--line)')}"></span>`).join('')}</div><div style="font-size:10px;color:var(--muted);margin-top:5px">20 levels to Spellbound Champ${uiLevel>CHAMP_LEVELS?' ✓ — now exploring the Library':''}</div>`
    : `<div style="display:flex;gap:4px;margin-top:11px">${stages.map((s,i)=>`<span style="flex:1;height:5px;border-radius:99px;background:${(i<sIdx||(i===sIdx&&stageDone))?'var(--good)':(i===sIdx?'var(--accent)':'var(--line)')}"></span>`).join('')}</div>`;
  const libMeter = isJourney ? `<div style="margin-top:11px;font-size:11px;color:var(--muted);display:flex;align-items:center;gap:7px"><span style="font-weight:800;color:var(--text)">Library explored</span> ${fmtN(journeyMastered(c))} / ${fmtN(journeyTotal())} words mastered</div>` : '';
  const levelBlock=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px;margin-top:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.06)">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">${titleRow}<div style="font-size:12.5px;color:var(--muted);font-weight:700">You're <b style="color:var(--text)">${form}</b></div></div>
      <div style="background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:13px 15px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:3px">${levelTag}<span style="font-size:11.5px;color:var(--muted);font-weight:700">${stageM}/${stage.words.length} mastered</span></div>
        <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:8px">${levelHeadline}</div>
        <div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:9px;border-radius:99px;background:var(--bg2);overflow:hidden"><div style="height:100%;border-radius:99px;background:${stageDone?'var(--good)':'var(--accent)'};width:${stagePct}%;transition:width .4s"></div></div><span style="font-size:11.5px;color:var(--muted);font-weight:800">${stagePct}%</span></div>
        ${advanceHTML}
        ${tracker}
        ${libMeter}
      </div>
      <div style="overflow-x:auto;padding:2px 0"><div style="min-width:760px">${evoLadderHTML(theme, fIdx)}</div></div>
    </div>`;
  const tab=(k,l)=>`<button data-act="luSetTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:9px;font-weight:800;font-size:13.5px;${S.luTab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const body = S.luTab==='practice' ? trainerCard() : wordFlash(ws, S.reviseIdx, 'reviseNav', {});
  const act=(a,ic,t,d)=>`<button data-act="${a}" style="display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px"><span style="color:var(--accent)">${iconSVG(ic,18)}</span><span style="font-family:var(--display);font-weight:800;font-size:14px">${t}</span><span style="font-size:11.5px;color:var(--muted)">${d}</span></button>`;
  const actions=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:16px">${act('startBuzz','flame','Daily Buzz','Quick mixed round')}${act('startWritten','pencil','Written round','Type a sequence, scored')}${act('startOral','volume','Oral elimination','Spell aloud, survive')}${act('coachSetupOpen','gear','Setup &amp; lists','Date, goal, choose lists')}</div>`;
  const journeyPromo = (key!=='journey' && (getList(c,'journey').stage||0)===0) ? `<button data-act="startJourney" style="width:100%;text-align:left;border-radius:14px;margin-top:16px;overflow:hidden;${listCoverBG('journey')};box-shadow:0 4px 14px rgba(43,27,94,.16)"><div style="padding:13px 16px;color:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">★ Recommended path</div><div style="font-family:var(--display);font-weight:800;font-size:16px;line-height:1.15">The Spellbound Journey — 20 Levels to Champ</div></div><span style="padding:8px 14px;border-radius:10px;background:#fff;color:${listCoverOf('journey').c};font-weight:800;font-size:13px;white-space:nowrap">Start →</span></div></button>` : '';
  return `<div style="max-width:760px;margin:0 auto">${topBar}${chipsRow}${allWordsPanel}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:13px;padding:5px;margin-bottom:16px">${tab('revise','Learn')}${tab('practice','Practice')}</div>
    ${body}
    ${liveHeatmap(ws, {anon:S.luTab==='practice'})}
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
  return `<button class="sb-cover-card" data-act="${act}" data-arg="${k}" style="text-align:left;background:var(--bg2);border:1px solid ${on?f.c:'var(--line)'};border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column">
    <div style="position:relative;height:88px;display:flex;align-items:center;justify-content:center;padding:12px;${listCoverBG(k)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--mono);font-weight:700;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(f.tag)}</span>
      ${on?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:9.5px">ACTIVE</span>':''}
      <div style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16)">${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',34,2)}</div>`:`<div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-weight:800;font-size:${heroFont(f.hero)}px">${esc(f.hero)}</div>`}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:14.5px;line-height:1.18;color:var(--text)">${esc(label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:11.5px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(trunc(sub,64))}</div>
      <div style="margin-top:auto;padding-top:11px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-family:var(--mono);font-size:10.5px;color:var(--muted);font-weight:700">${count} words · L${lvl}${stMeta}</span>
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
  const champLabel = jLvl>CHAMP_LEVELS ? 'Spellbound Champ 🏆 · exploring the Library' : ('Level '+Math.min(jLvl,CHAMP_LEVELS)+' of '+CHAMP_LEVELS+' to Champ');
  const journeyBanner=`<button data-act="startJourney" style="position:relative;overflow:hidden;text-align:left;width:100%;border-radius:18px;margin-bottom:16px;${listCoverBG('journey')};box-shadow:0 8px 22px rgba(43,27,94,.18)">
    <div style="padding:18px 20px;color:#fff">
      <span style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">★ Recommended path</span>
      <div style="font-family:var(--display);font-weight:800;font-size:22px;line-height:1.1;margin:6px 0 4px">The Spellbound Journey</div>
      <div style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.5;margin-bottom:12px;max-width:46em">Climb <b>20 Levels</b> through the ~${fmtN(champWordCount())} highest-value bee words to become a <b>Spellbound Champ</b> — then unlock the full ${fmtN(journeyTotal())}-word Library. Words → Set of 24 → Level → Champ.</div>
      <div style="height:8px;border-radius:99px;background:rgba(255,255,255,.25);overflow:hidden;margin-bottom:9px"><div style="height:100%;width:${jChampPct}%;background:#fff"></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span style="font-size:11.5px;font-weight:800;color:rgba(255,255,255,.92)">${champLabel} · ${fmtN(jMast)} mastered</span><span style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:11px;background:#fff;color:${jc.c};font-weight:800;font-size:14px">${jStarted?'Continue':'Start the Journey'} →</span></div>
    </div></button>`;
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px"><button data-act="openCoach" style="color:var(--muted);font-weight:700;font-size:14px">← Back to Word Coach</button></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 4px">Setup &amp; lists</h2>
    <p style="margin:0 0 16px;color:var(--muted);font-size:14px">Pick the list you're training — each keeps its own level.${state.premium?'':' 🔒 lists unlock with Premium <b>or</b> 🪙 '+COST.list+' coins from playing.'}</p>
    ${journeyBanner}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:14px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div style="flex:1;min-width:150px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Bee day</label><input data-chg="setCoachDate" type="date" value="${escA(S.coachDate||'')}" style="width:100%;padding:11px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px"></div><div style="width:120px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Daily goal</label><input data-chg="setCoachGoal" value="${escA(S.coachGoal)}" style="width:100%;padding:11px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px"></div></div>
      <div style="font-size:11.5px;color:var(--muted);margin-top:8px">The daily goal is a target, not a limit — keep going as long as you like.</div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:12px">Choose a list</div><div style="${coverGrid}">${defCard}${others}</div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:16px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px;display:flex;align-items:center;gap:8px"><span style="color:var(--accent)">${iconSVG('upload',18)}</span> Bring your own words</div><p style="font-size:12.5px;color:var(--muted);margin:0 0 10px">Paste words (commas or new lines) — we enrich them from the database.</p>
      <textarea data-inp="setCustomText" data-fkey="customText" placeholder="silhouette, bouquet, mnemonic" style="width:100%;min-height:74px;resize:vertical;padding:12px 13px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:14px;margin-bottom:10px;font-family:var(--body)">${esc(S.customText)}</textarea>
      <button data-act="enrichCustom" style="width:100%;padding:12px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14.5px;border:1px solid var(--line)">Enrich &amp; train these →</button></div>
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
function coachHub(){
  const S=state; const c=active();
  const cDays=coachDaysLeft(); const cPhase=coachPhase(); const cRd=coachReadiness();
  const tabs=[['train','Train'],['setup','Setup'],['heatmap','Heatmap'],['parent','Parent']].map(([k,l])=>{ const on=S.coachTab===k;
    return `<button data-act="coachTab" data-arg="${k}" style="flex:1;padding:9px 8px;border-radius:9px;font-weight:800;font-size:13px;${on?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`; }).join('');
  let tabBody='';
  if(S.coachTab==='train'){
    const planText={breadth:'Breadth — cover the whole list. Study new words broadly to build coverage.',depth:'Depth — drill your misses and run reviews. Lock in the tricky ones.',sim:'Simulation — run full Written and Oral rounds at real competition difficulty.',none:'Set a target date in Setup to unlock your countdown and a day-by-day plan.',past:'Your target date has passed — set a new one in Setup to keep training.'}[cPhase.key];
    const recMap={breadth:['Study new words →'],depth:['Drill weak words →'],sim:['Start a written round →']}[cPhase.key];
    const phaseTag=cPhase.d!=null?(' · '+(cPhase.key==='breadth'?'more than 4 weeks out':cPhase.key==='depth'?'2–4 weeks out':'final 2 weeks')):'';
    const modes=[['Study','Learn + spaced repetition','book','coachStudy'],['Written round','Type a sequence, scored at end','pencil','startWritten'],['Oral elimination','Spell aloud, survive rounds','volume','startOral'],['Weak-word drill','Your most-missed words','spark','coachWeakDrill']]
      .map(([name,desc,ic,act])=>`<button data-act="${act}" style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px"><span style="color:var(--accent)">${iconSVG(ic,20)}</span><span style="font-family:var(--display);font-weight:800;font-size:14.5px">${name}</span><span style="font-size:12px;color:var(--muted);line-height:1.35">${desc}</span></button>`).join('');
    tabBody=`${cDays!=null?`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;text-align:center;margin-bottom:14px;box-shadow:var(--glow)"><div style="font-family:var(--display);font-weight:800;font-size:46px;line-height:1;color:var(--accent)">${Math.abs(cDays)}</div><div style="font-size:13px;color:var(--muted);font-weight:700;margin-top:4px">${cDays<0?'days since your bee':'days to go'}</div></div>`:''}
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">
        <div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:22px">${cRd.size?(cRd.ready+'%'):'—'}</div><div style="font-size:12px;color:var(--muted);font-weight:700">Readiness</div></div>
        <div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:22px">${cRd.ms}</div><div style="font-size:12px;color:var(--muted);font-weight:700">Mastered</div></div>
        <div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:22px;display:flex;align-items:center;justify-content:center;gap:5px">${(c.streak||0)} <span style="color:#FF7A1A">${iconSVG('fire',16)}</span></div><div style="font-size:12px;color:var(--muted);font-weight:700">Streak</div></div>
      </div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px">
        <div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px">Today's plan</div>
        <div style="font-size:12.5px;color:var(--muted);margin-bottom:6px">Target list: <b style="color:var(--text)">${esc(S.coachTargetLabel)}</b>${phaseTag}</div>
        <p style="font-size:14px;line-height:1.5;margin:0 0 12px">${planText}</p>
        ${recMap?`<button data-act="coachRec" style="width:100%;padding:13px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${recMap[0]}</button>`:''}
      </div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:12px">Training modes</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${modes}</div></div>`;
  } else if(S.coachTab==='setup'){
    const cat=coachActiveCat(); const opts=coachCatalog().map(o=>`<option value="${o.key}"${o.key===S.coachTargetKey?' selected':''}>${esc(o.label)} (${o.count})</option>`).join('');
    tabBody=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:12px">Bee day & daily goal</div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div style="flex:1;min-width:160px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Target date</label><input data-chg="setCoachDate" type="date" value="${escA(S.coachDate||'')}" style="width:100%;padding:11px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px"></div>
          <div style="width:110px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Daily goal</label><input data-chg="setCoachGoal" data-fkey="coachGoal" value="${escA(S.coachGoal)}" style="width:100%;padding:11px 12px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:14px"></div></div></div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px">Choose your target list</div><p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">This drives your plan, readiness and drills.</p>
        <div style="position:relative"><select data-chg="setCoachTarget" style="width:100%;appearance:none;-webkit-appearance:none;padding:14px 38px 14px 14px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-family:var(--display);font-weight:800;font-size:15px;cursor:pointer">${opts}</select><span style="position:absolute;right:14px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--accent);font-size:12px">▼</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:12px;padding:12px 14px;border-radius:12px;background:var(--surface2)"><span style="color:var(--accent)">${iconSVG('target',18)}</span><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:14px">${esc(S.coachTargetLabel)} · ${cat?cat.count:0} words</div><div style="font-size:12px;color:var(--muted)">${cat?esc(cat.sub):''}</div></div></div></div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px;display:flex;align-items:center;gap:8px"><span style="color:var(--accent)">${iconSVG('spark',16)}</span> Smart list with AI</div><p style="font-size:12.5px;color:var(--muted);margin:0 0 12px">Describe what you want to drill and Coach AI builds a list from the word database.</p>
        <input data-inp="setAiPrompt" data-fkey="aiPrompt" value="${escA(S.aiPrompt)}" placeholder="e.g. tricky silent-letter words for a 5th grader" style="width:100%;padding:13px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:14px;margin-bottom:10px">
        <button data-act="generateAiList" style="width:100%;padding:13px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${S.aiLoading?'Thinking…':'Generate smart list →'}</button>
        ${S.aiError?`<div style="font-size:12.5px;color:var(--bad);font-weight:700;margin-top:10px">${esc(S.aiError)}</div>`:''}</div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:4px;display:flex;align-items:center;gap:8px"><span style="color:var(--accent)">${iconSVG('upload',18)}</span> Bring your own words</div><p style="font-size:12.5px;color:var(--muted);margin:0 0 12px">Paste words (commas or new lines). We enrich them with definitions, sentences and origins from the database.</p>
        <textarea data-inp="setCustomText" data-fkey="customText" placeholder="silhouette, bouquet, mnemonic" style="width:100%;min-height:84px;resize:vertical;padding:13px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:600;font-size:14px;line-height:1.5;margin-bottom:10px;font-family:var(--body)">${esc(S.customText)}</textarea>
        <button data-act="enrichCustom" style="width:100%;padding:13px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px;border:1px solid var(--line)">Enrich & set as target →</button>
        ${S.enrichResult?`<div style="font-size:12.5px;color:var(--accent);font-weight:700;margin-top:10px">${esc(S.enrichResult)}</div>`:''}</div>`;
  } else if(S.coachTab==='heatmap'){
    const cHeatC={mastered:'#1f9d57',review:'#c08a00',learning:'#e07a3a',new:'#b9bdc9'};
    const cells=coachPool().slice(0,240).map(r=>{ const stt=srsState((S.coachSrs||{})[nkey(r.w)]); return `<button data-act="say" data-arg="${escA(r.w)}" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:6px 10px;border-radius:8px;color:#fff;background:${cHeatC[stt]}">${esc(r.w)}</button>`; }).join('');
    const legend=[['Mastered','mastered'],['Review','review'],['Learning','learning'],['New','new']].map(([l,k])=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="width:11px;height:11px;border-radius:3px;display:inline-block;background:${cHeatC[k]}"></span>${l}</span>`).join('');
    tabBody=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:2px">Word heatmap</div><p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">${esc(S.coachTargetLabel)} · ${coachReadiness().size} words · tap any word to hear it</p><div style="display:flex;flex-wrap:wrap;gap:7px;margin-bottom:14px">${cells}</div><div style="display:flex;flex-wrap:wrap;gap:14px">${legend}</div></div>`;
  } else {
    const cRd2=coachReadiness(); const cProblems=coachTopProblems(10);
    tabBody=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:16px;margin-bottom:10px">Readiness</div>
      <div style="height:9px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:8px"><div style="height:100%;background:var(--accent);border-radius:99px;width:${cRd2.coverage}%"></div></div>
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 14px">${cRd2.coverage}% of the list seen · ${cRd2.ready}% mastered · ${esc(S.coachTargetLabel)} (${cRd2.size} words)</p>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px">
        <div style="text-align:center;background:var(--surface2);border-radius:12px;padding:12px 6px"><div style="font-family:var(--display);font-weight:800;font-size:20px">${cRd2.nw}</div><div style="font-size:11px;color:var(--muted);font-weight:700">New</div></div>
        <div style="text-align:center;background:var(--surface2);border-radius:12px;padding:12px 6px"><div style="font-family:var(--display);font-weight:800;font-size:20px">${cRd2.lr}</div><div style="font-size:11px;color:var(--muted);font-weight:700">Learning</div></div>
        <div style="text-align:center;background:var(--surface2);border-radius:12px;padding:12px 6px"><div style="font-family:var(--display);font-weight:800;font-size:20px">${cRd2.rv}</div><div style="font-size:11px;color:var(--muted);font-weight:700">Review</div></div>
        <div style="text-align:center;background:var(--surface2);border-radius:12px;padding:12px 6px"><div style="font-family:var(--display);font-weight:800;font-size:20px">${cRd2.ms}</div><div style="font-size:11px;color:var(--muted);font-weight:700">Mastered</div></div>
      </div>
      <p style="font-size:12.5px;color:var(--muted);line-height:1.55;margin:0 0 8px"><b style="color:var(--text)">Consistency.</b> Practised ${coachConsistency()} of the last 14 days · best oral run ${S.coachBestRounds||0} rounds.</p>
      ${cProblems.length?`<p style="font-size:12.5px;color:var(--muted);line-height:1.55;margin:0"><b style="color:var(--text)">Top problem words.</b> ${esc(cProblems.map(p=>p.w+' ('+p.x.wrong+')').join(', '))}</p>`:''}</div>`;
  }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button><div style="display:inline-flex;align-items:center;gap:8px;padding:5px 12px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px;letter-spacing:.04em;text-transform:uppercase">Bee Prep</div></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 2px">Word Coach</h2>
    <p style="margin:0 0 16px;color:var(--muted);font-size:14px">Competition training for a date you choose.</p>
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:13px;padding:5px;margin-bottom:18px">${tabs}</div>
    ${tabBody}
  </div>`;
}
function coachWritten(){
  const S=state; const wr=S.wr; let infoHTML=''; if(wr){ const w=wr.list[wr.i]; if(S.wrInfoKey==='def') infoHTML='Meaning — '+blankHTML(w.d||'—',w.w); else if(S.wrInfoKey==='sent') infoHTML='Sentence — '+blankHTML(w.s||'—',w.w); else if(S.wrInfoKey==='orig') infoHTML='Origin — '+esc(w.o||'—')+(w.r?('. '+esc(w.r)):''); }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">Written round · Word ${wr.i+1}/${wr.list.length}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:14px">✕ Exit</button></div>
    <div style="height:7px;border-radius:99px;background:var(--surface2);overflow:hidden;margin-bottom:22px"><div style="height:100%;background:var(--accent);border-radius:99px;width:${Math.round(wr.i/wr.list.length*100)}%;transition:width .4s"></div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">Listen and type — no answer shown till the end</p>
      <button data-act="wrSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:16px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px"><button data-act="wrSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${infoChip(S.wrInfoKey==='def','Definition','wrInfoDef')}${infoChip(S.wrInfoKey==='sent','Sentence','wrInfoSent')}${infoChip(S.wrInfoKey==='orig','Origin','wrInfoOrig')}</div>
      ${S.wrInfoKey?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:14.5px;line-height:1.6;margin-bottom:16px">${infoHTML}</div>`:''}
      <input data-inp="onType" data-key="wrKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="type here" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:15px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:16px">
      <button data-act="wrNext" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${(wr.i+1<wr.list.length)?'Next word →':'Finish & score →'}</button>
    </div>
  </div>`;
}
function coachWrDone(){
  const S=state; const wr=S.wr; const ok=wr.ans.filter(a=>a.ok).length, total=wr.ans.length||1, pct=Math.round(ok/total*100);
  const rows=wr.ans.map(a=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:10px;background:${a.ok?'color-mix(in srgb,#1f9d57 13%,transparent)':'color-mix(in srgb,var(--bad) 13%,transparent)'}"><span style="font-weight:800">${esc(a.w.w)}</span><span style="font-family:var(--mono);font-size:13px">${a.ok?'✓':(esc(a.val||'(blank)')+' ✗')}</span></div>`).join('');
  return `<div style="max-width:680px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 8px">${pct>=80?'Strong round! 🏆':pct>=60?'Good effort 💪':'Keep training 🌱'}</h2><div style="font-family:var(--display);font-weight:800;font-size:48px;color:var(--accent);line-height:1">${pct}%</div><p style="color:var(--muted);font-weight:700;margin-top:6px">${ok} of ${wr.ans.length} correct</p></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Round results</div><div style="display:flex;flex-direction:column;gap:7px">${rows}</div></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="coachWeakDrill" style="padding:13px 18px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Drill the misses →</button></div>
  </div>`;
}
function coachOral(){
  const S=state; const or=S.or; let infoHTML=''; if(or&&or.pool[or.i]){ const w=or.pool[or.i]; if(S.orInfoKey==='def') infoHTML='Meaning — '+blankHTML(w.d||'—',w.w); else if(S.orInfoKey==='sent') infoHTML='Sentence — '+blankHTML(w.s||'—',w.w); else if(S.orInfoKey==='orig') infoHTML='Origin — '+esc(w.o||'—')+(w.r?('. '+esc(w.r)):''); }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--mono);font-size:13px;color:var(--muted)">Oral elimination · Round ${or.round+1} · Best ${S.coachBestRounds||0}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:14px">✕ Exit</button></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">Spell it out loud, letter by letter</p>
      <button data-act="orSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:16px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px"><button data-act="orSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button>${infoChip(S.orInfoKey==='def','Definition','orInfoDef')}${infoChip(S.orInfoKey==='sent','Sentence','orInfoSent')}${infoChip(S.orInfoKey==='orig','Origin','orInfoOrig')}</div>
      ${S.orInfoKey?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:14.5px;line-height:1.6;margin-bottom:16px">${infoHTML}</div>`:''}
      <input data-inp="onType" data-key="orKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="…type the letters" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:15px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:14px">
      ${S.orFeedback?`<div style="color:#1f9d57;font-weight:800;font-size:14px;margin-bottom:12px">${esc(S.orFeedback)}</div>`:''}
      <button data-act="orJudge" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Judge</button>
    </div>
  </div>`;
}
function coachOrGone(){
  const S=state; const or=S.or; const w=(or&&or.last)?or.last.w:'';
  return `<div style="max-width:680px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 10px">Eliminated 🛑</h2><p style="color:var(--muted);font-weight:700;margin:0 0 4px">The word was</p><div style="font-family:var(--display);font-weight:800;font-size:36px;color:var(--accent);line-height:1">${esc(w)}</div><p style="font-family:var(--mono);font-size:13px;color:var(--muted);margin-top:8px;letter-spacing:.12em">${esc(w.split('').join(' '))}</p><p style="color:var(--muted);font-weight:700;margin-top:14px">You survived <b style="color:var(--text)">${or?or.round:0}</b> rounds · best ${S.coachBestRounds||0}</p></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="startOral" style="padding:13px 18px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Try again →</button></div>
  </div>`;
}

/* ===== Magic Squares — a 3×3 bingo board of themes. Clear a cell by acing 5 questions
   (spell-it or pick-the-meaning). Complete rows, columns & diagonals for bonus coins;
   black out the whole square for the mega prize. ===== */
const MAGIC_BONUS={cell:3,row:10,col:10,diag:15,square:40};
function magicNewBoard(){ clearGTimer();
  const ok=t=>themeWords(t.id).length>=10;
  let pool=myThemes().filter(ok);
  pool=pool.concat(sample(themeDefs().filter(t=>ok(t)&&!pool.some(p=>p.id===t.id)), 9-Math.min(pool.length,9)));
  if(pool.length<9) pool=pool.concat(sample(themeDefs().filter(t=>ok(t)&&!pool.some(p=>p.id===t.id)),9-pool.length));
  const board=sample(pool,9).map(t=>({id:t.id,label:t.label,cluster:t.cluster,done:false,best:0,tried:0}));
  state.game={type:'magic',board,cell:null,qs:null,qi:0,right:0,picked:null,ok:null,revealed:false,
    lines:{r:[false,false,false],c:[false,false,false],d:[false,false]},squareDone:false,celebr:null,coins:0,status:'board'};
  state.typed=''; render(); }
function magicClusterOf(cell){ return themeClusters().find(x=>x.id===cell.cluster)||themeClusters()[0]; }
function magicBuildQs(id){ const all=themeWords(id).filter(w=>w.d&&w.d.length>4);
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
  { type:'buzz',     ic:'flame',  name:'Buzz of the Day', blurb:'10 mixed words, typed. Your daily warm-up.', tag:'Daily', c:'#E0922E',c2:'#C8791B',tex:'diag' },
  { type:'beat',     ic:'target', name:'Beat the Buzzer', blurb:'Spell as many as you can in 60 seconds!', tag:'Timed', c:'#FF5FA2',c2:'#E8458C',tex:'dots' },
  { type:'boss',     ic:'crown',  name:'Boss Battle',     blurb:'Defeat the boss with your toughest words.', tag:'Battle', c:'#7B52E0',c2:'#5E39C4',tex:'cross' },
  { type:'meaning',  ic:'book',   name:'Meaning Match',   blurb:'Match a word to its meaning or its sentence.', tag:'Quiz', c:'#13A892',c2:'#0E8A78',tex:'rings' },
  { type:'spell',    ic:'spark',  name:'Spot the Spelling',blurb:'Pick the correctly-spelled word from look-alikes.', tag:'Quiz', c:'#3D7DF0',c2:'#2A63D6',tex:'grid' },
  { type:'origin',   ic:'grid',   name:'Origin Detective', blurb:'Guess each word’s language of origin.', tag:'Detective', c:'#4F9E6A',c2:'#3C8455',tex:'stripes' },
  { type:'magic',    ic:'palette',name:'Magic Squares',    blurb:'A 3×3 board of themes — clear cells, complete rows & diagonals for bonus coins!', tag:'Board', c:'#B14FC4',c2:'#9438A8',tex:'dots' },
];
function gameCoverBG(gm){ const t=CONCEPT_TEX[gm.tex]||CONCEPT_TEX.stripes;
  return `background-color:${gm.c};background-image:${t[0]},linear-gradient(135deg,${gm.c},${gm.c2});background-size:${t[1]},100% 100%;background-position:center`; }
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
function mcSpeak(q){ if(!q) return; if(q.kind==='sentence') sayMasked(q.say, q.word); else if(q.kind==='spell'||q.kind==='origin') say(q.word); /* 'meaning': stay silent so the word isn't given away */ }
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
  const seg=(f,v,label,cur)=>`<button data-act="chSet" data-arg="${f}:${v}" style="flex:1;min-width:64px;padding:11px 8px;border-radius:11px;font-weight:800;font-size:13.5px;border:1px solid ${cur?'var(--accent)':'var(--line)'};${cur?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${label}</button>`;
  const fmtRow=`<div style="display:flex;gap:8px;margin-bottom:14px">${seg('fmt','count','🔢 Set number',S.chFmt==='count')}${seg('fmt','timed','⏱️ Beat the clock',S.chFmt==='timed')}</div>`;
  const amtRow = S.chFmt==='timed'
    ? `<div style="font-size:12.5px;color:var(--muted);font-weight:700;margin-bottom:7px">How long?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[60,90,120].map(t=>seg('time',t,t+'s',S.chTime===t)).join('')}</div>`
    : `<div style="font-size:12.5px;color:var(--muted);font-weight:700;margin-bottom:7px">How many words?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[10,15,20,30].map(n=>seg('count',n,String(n),S.chCount===n)).join('')}</div>`;
  const bandRow=`<div style="font-size:12.5px;color:var(--muted);font-weight:700;margin-bottom:7px">Difficulty</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${BANDS.map(([v,l])=>seg('band',v,l,S.chBand===v)).join('')}</div>`;
  return `<div style="max-width:560px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px"><button data-act="chExit" style="color:var(--muted);font-weight:700;font-size:14px">← Back</button></div>
    <h2 style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:23px;margin:0 0 4px">${iconSVG('bolt',22)} Champ Challenge</h2>
    <p style="margin:0 0 18px;color:var(--muted);font-size:14px">Pick your format and difficulty. Pass the <b>This Level</b> challenge to <b>test out</b> and jump straight to the next Level.</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px">
      ${fmtRow}${amtRow}${bandRow}
      <button data-act="chStart" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Start Challenge →</button>
      ${S.chBand==='level'?`<div style="font-size:11.5px;color:var(--muted);margin-top:10px;text-align:center">Testing out of <b>Level ${lvl}</b> of ${esc(listLabel(key).split(' · ')[0])}.</div>`:''}
    </div>
  </div>`; }
function champDone(){ const g=state.game; const done=g.right+g.wrong; const acc=done?Math.round(g.right/done*100):0;
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">
    <div style="font-size:54px;margin:8px 0">${g.pass?'⭐':'💪'}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:26px;margin:0 0 6px">${g.pass?'Challenge passed!':'Good effort!'}</h2>
    <div style="font-size:15px;color:var(--muted);margin-bottom:16px">${g.right} right${g.fmt==='count'?(' of '+done):''} · ${acc}% accuracy · +${g.bonus} ${iconSVG('coin',14)}</div>
    ${g.canAdvance?`<button data-act="champAdvance" style="width:100%;padding:14px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:10px">🎉 Level cleared — advance →</button>`:''}
    ${(!g.canAdvance&&g.pass&&g.band==='level')?`<div style="font-size:12.5px;color:var(--muted);margin-bottom:10px">Nice — that wasn't your current Level, so no skip this time.</div>`:''}
    <div style="display:flex;gap:10px"><button data-act="chStart" style="flex:1;padding:13px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">Try again</button><button data-act="chExit" style="flex:1;padding:13px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px">Done</button></div>
  </div>`; }
// dedupe + gather a fun mix: words you missed, curated tricky review, and your active list
function gameWords(opts){ opts=opts||{}; const c=active(); const base=listWords(c.activeList||'default');
  const pool=(state.missedWords||[]).concat(REVIEW).concat(base); const seen=new Set(); const out=[];
  pool.forEach(w=>{ if(!w||!w.w) return; const k=nkey(w.w); if(k&&!seen.has(k)){ seen.add(k); out.push(w); } });
  if(opts.needDef) return out.filter(w=>w.d&&w.d.length>4);
  if(opts.needSent) return out.filter(w=>w.s&&/[a-z]/i.test(w.s));
  return out; }
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
function buildMC(mode,n){ const all=gameWords();
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
  logActivity('buzz','Buzz of the Day', {done:g.ans.length,right:g.right,coins:bonus}, gMisses(g));
  if(g.right>=8){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishBeat(){ const g=state.game; g.status='done'; const bonus=Math.round(g.right*1.5); addCoins(bonus); g.bonus=bonus;
  logActivity('beat','Beat the Buzzer', {done:g.right+g.wrong,right:g.right,coins:bonus}, []);
  if(g.right>=12){ sfx('win'); burstConfetti(120); } else sfx('level'); render(); }
function gFinishBoss(won){ clearGTimer(); const g=state.game; g.status=won?'won':'lost'; const bonus=won?14:0; if(won){ addCoins(bonus); g.bonus=bonus; sfx('win'); burstConfetti(150); } else { sfx('lose'); }
  logActivity('boss', won?'Boss Battle — won':'Boss Battle — lost', {done:g.right,right:g.right,coins:bonus}, []); render(); }
function gFinishMC(){ const g=state.game; g.status='done'; const bonus=2+g.right; addCoins(bonus); g.bonus=bonus;
  logActivity(g.type, ACT_LABEL[g.type]||'Quiz', {done:g.qs.length,right:g.right,coins:bonus}, g.miss||[]);
  if(g.right>=7){ sfx('win'); burstConfetti(110); } else sfx('level'); render(); }

function coinAmt(n, sz){ return `<span style="display:inline-flex;align-items:center;gap:3px;white-space:nowrap">${iconSVG('coin',sz||13)} ${n}</span>`; }
function coinChip(){ return `<span style="display:inline-flex;align-items:center;gap:4px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12)">${coinAmt(coinsOf(),14)}</span>`; }
function viewGames(){ const g=state.game; if(!g) return gamesHub();
  if(g.type==='magic') return magicView();
  if(g.qs) return (g.status==='done')?mcDone():mcGame();
  return (g.status==='done'||g.status==='won'||g.status==='lost')?typedDone():typedGame(); }
/* ---- Magic Squares view: board → 5-question cell → result (+ line celebrations) ---- */
function magicView(){ const g=state.game; const S=state;
  const head=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:14px">← Arcade</button><span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:22px;margin-left:4px">${iconSVG('palette',21)} Magic Squares</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px">${iconSVG('coin',14)} +${g.coins}</span></div>`;
  if(g.status==='board'){
    const tiles=g.board.map((cell,i)=>{ const cl=magicClusterOf(cell);
      const doneBG=`${themeCoverBG(cl)};color:#fff`;
      return `<button data-act="magicCell" data-arg="${i}" style="position:relative;aspect-ratio:1;border-radius:15px;padding:10px 8px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;text-align:center;border:2px solid ${cell.done?cl.c:'var(--line)'};${cell.done?doneBG:'background:var(--bg2)'};box-shadow:${cell.done?('0 6px 16px rgba(43,27,94,.2)'):'0 2px 6px rgba(43,27,94,.06)'}">
        ${cell.done?`<div style="font-size:26px;line-height:1;animation:sb-pop .4s ease both">⭐</div>`:`<div style="width:26px;height:26px;border-radius:8px;background:color-mix(in srgb,${cl.c} 16%,var(--bg2));color:${cl.c};display:grid;place-items:center">${iconSVG('spark',15)}</div>`}
        <div style="font-family:var(--display);font-weight:800;font-size:12.5px;line-height:1.15;${cell.done?'color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.25)':'color:var(--text)'}">${esc(cell.label)}</div>
        ${(!cell.done&&cell.tried)?`<div style="font-size:10px;font-weight:800;color:var(--muted)">best ${cell.best}/5 · retry</div>`:''}
      </button>`; }).join('');
    const doneN=g.board.filter(c=>c.done).length;
    return `<div style="max-width:560px;margin:0 auto">${head}
      <p style="margin:0 0 14px;color:var(--muted);font-size:13.5px">Pick a square and ace <b>4 of 5</b> questions to claim it. Finish a <b>row +${MAGIC_BONUS.row}</b> 🪙, <b>column +${MAGIC_BONUS.col}</b>, <b>diagonal +${MAGIC_BONUS.diag}</b> — and the whole square for <b>+${MAGIC_BONUS.square}</b>!</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">${tiles}</div>
      <div style="display:flex;align-items:center;gap:10px"><span style="font-size:12.5px;color:var(--muted);font-weight:700">${doneN}/9 squares</span><span style="flex:1"></span><button data-act="magicNew" style="padding:10px 16px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">🔄 New board</button></div>
    </div>`; }
  if(g.status==='play'){ const q=g.qs[g.qi]; const cell=g.board[g.cell]; const cl=magicClusterOf(cell);
    const dots=g.qs.map((_,i)=>`<span style="flex:1;height:6px;border-radius:99px;background:${i<g.qi?'var(--good)':(i===g.qi?cl.c:'var(--surface2)')}"></span>`).join('');
    let body='';
    if(q.k==='spell'){
      const fb = g.revealed ? (g.ok?`<div style="border-radius:13px;padding:12px 15px;margin-bottom:12px;font-weight:800;background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good);animation:sb-pop .3s ease both">✓ Correct!</div>`:`<div style="border-radius:13px;padding:12px 15px;margin-bottom:12px;font-weight:800;background:color-mix(in srgb,var(--bad) 16%,transparent);color:var(--bad);animation:sb-pop .3s ease both">✗ It's “${esc(q.w.w)}”</div>`) : '';
      body=`<div style="text-align:center">
        <button data-act="magicHear" style="display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;background:${cl.c};color:#fff;font-weight:800;font-size:14.5px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:14px">${iconSVG('volume',17)} Hear it again</button>
        ${q.w.d?`<div style="font-size:13.5px;color:var(--muted);line-height:1.55;margin-bottom:14px;max-width:40em;margin-left:auto;margin-right:auto"><b style="color:var(--text)">Meaning.</b> ${esc(q.w.d)}</div>`:''}
        ${fb}
        <input data-inp="onType" data-key="magicKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${g.revealed?'disabled':''} style="width:100%;text-align:center;padding:15px 14px;border-radius:15px;background:var(--surface);border:2px solid ${g.revealed?(g.ok?'var(--good)':'var(--bad)'):'var(--line)'};color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(19px,4.5vw,26px);letter-spacing:.13em;text-transform:lowercase;outline:none;margin-bottom:12px">
        ${g.revealed?'':`<button data-act="magicSubmit" style="width:100%;padding:13px;border-radius:13px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Check ✓</button>`}
      </div>`;
    } else {
      const btns=q.choices.map(c=>{ const isPick=g.picked===c; const isAns=nkey(c)===nkey(q.w.w);
        let st='background:var(--surface2);border:1px solid var(--line);color:var(--text)';
        if(g.picked!=null){ if(isAns) st=`background:color-mix(in srgb,var(--good) 20%,transparent);border:1.5px solid var(--good);color:var(--good)`; else if(isPick) st=`background:color-mix(in srgb,var(--bad) 16%,transparent);border:1.5px solid var(--bad);color:var(--bad)`; else st+=';opacity:.55'; }
        return `<button data-act="magicPick" data-arg="${escA(c)}" style="padding:14px 12px;border-radius:13px;font-family:var(--display);font-weight:800;font-size:16px;${st}">${esc(c)}</button>`; }).join('');
      body=`<div style="font-size:14.5px;color:var(--text);line-height:1.6;margin-bottom:16px;text-align:center"><b>Which word means:</b><br>“${esc(q.w.d)}”</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">${btns}</div>`;
    }
    return `<div style="max-width:560px;margin:0 auto">${head}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:99px;background:color-mix(in srgb,${cl.c} 14%,var(--bg2));color:${cl.c};font-weight:800;font-size:12px">${esc(cell.label)}</span><span style="font-family:var(--mono);font-size:11.5px;color:var(--muted)">Question ${g.qi+1}/5 · ${g.right} right</span></div>
      <div style="display:flex;gap:5px;margin-bottom:14px">${dots}</div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:clamp(16px,4vw,24px);box-shadow:var(--glow)">${body}</div>
    </div>`; }
  // result
  const r=g.cellResult||{}; const cell=g.board[g.cell]||{}; const cl=magicClusterOf(cell);
  const celebr=g.celebr?`<div style="margin:14px 0;animation:sb-pop .45s ease both">${g.celebr.msgs.map(m=>`<div style="font-family:var(--display);font-weight:800;font-size:${g.celebr.mega?'26px':'19px'};color:var(--accent);margin-bottom:4px">🎉 ${esc(m)}</div>`).join('')}</div>`:'';
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">${head}
    <div style="display:flex;justify-content:center;margin:6px 0 4px"><div style="width:84px;height:92px">${mascotSVG(r.win?(g.celebr?'excited':'happy'):'oops')}</div></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:25px;margin:0 0 4px">${r.win?(g.celebr&&g.celebr.mega?'MAGIC SQUARE!':'Square claimed! ⭐'):'So close!'}</h2>
    <div style="font-size:14.5px;color:var(--muted);font-weight:700">${esc(cell.label)} — ${r.right}/5 right${r.coins?(' · +'+r.coins+' 🪙 bonus'):''}</div>
    ${celebr}
    <div style="display:flex;gap:10px;margin-top:16px">${r.win?'':`<button data-act="magicCell" data-arg="${g.cell}" style="flex:1;padding:13px;border-radius:13px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Try again →</button>`}<button data-act="magicBoard" style="flex:1;padding:13px;border-radius:13px;background:${r.win?'var(--accent)':'var(--surface2)'};color:${r.win?'#fff':'var(--text)'};font-weight:800;font-size:15px;${r.win?'box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)':'border:1px solid var(--line)'}">Back to the board</button></div>
  </div>`; }
function gamesHub(){ const S=state;
  const champCard=`<button data-act="openChallenge" data-arg="journey" style="grid-column:1/-1;text-align:left;border-radius:16px;overflow:hidden;${listCoverBG('journey')};box-shadow:0 6px 18px rgba(43,27,94,.18)"><div style="padding:16px 18px;color:#fff;display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="display:flex;filter:drop-shadow(0 2px 6px rgba(0,0,0,.25))">${iconSVG('bolt',32)}</div><div style="min-width:0;flex:1"><div style="font-family:var(--mono);font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">Set timed or counted · pick a difficulty</div><div style="font-family:var(--display);font-weight:800;font-size:18px;line-height:1.15">Champ Challenge</div><div style="font-size:12px;color:rgba(255,255,255,.9)">Beat the clock or a set number — pass your Level to test out.</div></div><span style="padding:9px 16px;border-radius:11px;background:#fff;color:${listCoverOf('journey').c};font-weight:800;font-size:13px;white-space:nowrap">Set it up →</span></div></button>`;
  const cards=champCard+GAMES.map(gm=>`<button class="sb-cover-card" data-act="playGame" data-arg="${gm.type}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(43,27,94,.05);display:flex;flex-direction:column">
      <div style="position:relative;height:108px;display:flex;align-items:center;justify-content:center;padding:14px;${gameCoverBG(gm)}">
        <span style="position:absolute;top:11px;left:12px;font-family:var(--mono);font-weight:700;font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(gm.tag)}</span>
        <div style="color:#fff;display:grid;place-items:center;filter:drop-shadow(0 2px 8px rgba(0,0,0,.22))">${iconSVG(gm.ic,46,2)}</div>
      </div>
      <div style="padding:14px 15px 15px;display:flex;flex-direction:column;flex:1">
        <div style="font-family:var(--display);font-weight:800;font-size:16.5px;color:var(--text)">${gm.name}</div>
        <div style="font-family:var(--body);font-weight:600;font-size:12.5px;color:var(--muted);line-height:1.45;margin-top:6px">${gm.blurb}</div>
        <div style="margin-top:auto;padding-top:13px"><span style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:11px;background:${gm.c};color:#fff;font-weight:800;font-size:13px">${iconSVG('volume',14)} Play →</span></div>
      </div></button>`).join('');
  const store=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:18px;padding:18px;margin-top:18px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px"><span style="font-family:var(--display);font-weight:800;font-size:16px">Coin store</span><span style="font-size:12px;color:var(--muted);font-weight:700">— spend what you earn</span></div>
      <p style="font-size:12.5px;color:var(--muted);margin:0 0 12px">Play games, Word Coach and Concepts to collect 🪙. Then treat yourself:</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
        <button data-act="boostLevel" style="text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:13px"><div style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:14px;margin-bottom:3px;color:var(--accent)">${iconSVG('bolt',16)} Level boost</div><div style="font-size:11.5px;color:var(--muted)">+1 level on your list · ${coinAmt(COST.boost,12)}</div></button>
        <button data-act="openShop" style="text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:13px"><div style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:14px;margin-bottom:3px;color:var(--accent)">${iconSVG('cart',16)} Open the Shop</div><div style="font-size:11.5px;color:var(--muted)">Worlds, word lists &amp; concepts</div></button>
        <button data-act="goPaywall" style="text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:13px"><div style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:14px;margin-bottom:3px;color:var(--accent)">${iconSVG('crown',16)} Go Premium</div><div style="font-size:11.5px;color:var(--muted)">Unlock more, instantly</div></button>
      </div></div>`;
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button><span style="margin-left:2px">${arcadeLogoSVG(38)}</span><span style="font-family:var(--display);font-weight:800;font-size:22px;letter-spacing:-.01em">Arcade</span><span style="margin-left:auto">${coinChip()}</span></div>
    <p style="margin:0 0 16px;color:var(--muted);font-size:14px">Eight ways to play — every correct word earns coins.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px">${cards}</div>
    ${store}
  </div>`;
}
function viewShop(){ const S=state; const c=active(); ensureLists(c); const tab=S.shopTab||'worlds';
  const tabBtn=(k,ic,l)=>`<button data-act="shopTab" data-arg="${k}" style="flex:1;min-width:96px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 8px;border-radius:11px;font-weight:800;font-size:13.5px;${tab===k?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  let body='';
  if(tab==='worlds'){
    const rows=THEMES.map(t=>{ const on=t.id===S.theme; const un=isThemeUnlocked(t.id); const ev=EVO[t.id]||EVO.spellbound;
      const right=on?'<span style="font-weight:800;font-size:12.5px;color:var(--accent)">Active</span>':(un?`<span style="font-weight:800;font-size:12.5px;color:var(--good)">Use</span>`:`<span style="font-weight:900;font-size:12.5px;color:#a06a00">${coinAmt(COST.theme,12)}</span>`);
      return `<button data-act="${un?'pickTheme':'buyTheme'}" data-arg="${t.id}" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:var(--surface2);border:1px solid ${on?'var(--accent)':'var(--line)'};border-radius:13px;padding:12px 14px;margin-bottom:9px">
        <div style="width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:linear-gradient(135deg,${t.c1},${t.c2});flex-shrink:0;color:#fff;${un?'':'filter:grayscale(.5)'}">${un?worldEmblemSVG(t.id,21):iconSVG('lock',19,2.2)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:15px">${t.label}</div><div style="font-size:11.5px;color:var(--muted)">${WORLD_DEF[t.id]||(ev[0]+' → '+ev[9])}</div></div>${right}</button>`; }).join('');
    const unc=THEMES.filter(t=>isThemeUnlocked(t.id)).length;
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${THEMES.length} worlds unlocked · 2 free, ${state.premium?'2 more with Premium, ':''}the rest with coins.</p>${rows}`;
  } else if(tab==='lists'){
    const cats=[{key:'default',label:'Default · Level-Up',sub:'Curated starter words',count:LEVEL_WORDS.length}].concat(coachCatalog().filter(o=>o.key!=='default').map(o=>({key:o.key,label:o.label,sub:o.sub,count:o.count})));
    const rows=cats.map(o=>{ const un=isListUnlocked(o.key); const on=(c.activeList||'default')===o.key;
      const right=on?'<span style="font-weight:800;font-size:12.5px;color:var(--accent)">Active</span>':(un?'<span style="font-weight:800;font-size:12.5px;color:var(--good)">Train</span>':`<span style="font-weight:900;font-size:12.5px;color:#a06a00">${coinAmt(COST.list,12)}</span>`);
      return `<button data-act="${un?'selectList':'buyList'}" data-arg="${o.key}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:var(--surface2);border:1px solid ${on?'var(--accent)':'var(--line)'};border-radius:13px;padding:12px 14px;margin-bottom:9px"><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:14.5px;display:flex;align-items:center;gap:6px">${un?'':`<span style="color:var(--muted);display:inline-flex">${iconSVG('lock',14,2.2)}</span>`}${esc(o.label)}</div><div style="font-size:12px;color:var(--muted)">${esc(o.sub)} · ${o.count} words</div></div>${right}</button>`; }).join('');
    const unc=cats.filter(o=>isListUnlocked(o.key)).length;
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${cats.length} lists unlocked. Premium lists open with Premium or coins.</p>${rows}`;
  } else {
    const chs=S.conceptData||[]; const total=chs.length||110; const unc=chs.filter((ch,ci)=>isConceptUnlocked(ci)).length;
    const locked=chs.map((ch,ci)=>({ch,ci})).filter(x=>!isConceptUnlocked(x.ci)).slice(0,8);
    const rows=locked.map(({ch,ci})=>`<button data-act="buyConcept" data-arg="${ci}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:13px;padding:12px 14px;margin-bottom:9px"><div style="min-width:0"><div style="font-family:var(--display);font-weight:800;font-size:14.5px;display:flex;align-items:center;gap:6px"><span style="color:var(--muted);display:inline-flex">${iconSVG('lock',14,2.2)}</span>${esc(conceptShort(ch.title))}</div><div style="font-size:12px;color:var(--muted)">${esc(catGroup(ch.category))} · ${(diffMap[ch.difficulty]||diffMap.medium)[0]}</div></div><span style="font-weight:900;font-size:12.5px;color:#a06a00;white-space:nowrap">${coinAmt(COST.concept,12)}</span></button>`).join('');
    body=`<p style="font-size:13px;color:var(--muted);margin:0 0 12px">${unc}/${total} concepts unlocked. ${state.premium?'Premium opens the easier half — ':'All locked on the free plan — '}unlock more with coins.</p>
      ${locked.length?rows:'<p style="font-size:13.5px;color:var(--muted)">Everything available is unlocked. 🎉</p>'}
      <button data-act="goConcepts" style="width:100%;margin-top:6px;padding:13px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14.5px;border:1px solid var(--line)">Browse all concepts →</button>`;
  }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><button data-act="goHome" style="color:var(--muted);font-weight:700;font-size:14px">← Home</button><span style="display:inline-flex;align-items:center;gap:7px;font-family:var(--display);font-weight:800;font-size:22px;margin-left:4px">${iconSVG('cart',21)} Shop</span><span style="margin-left:auto">${coinChip()}</span></div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:14px">Spend the coins you earn from games, Word Coach &amp; Concepts.</p>
    <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">${tabBtn('worlds','palette','Worlds')}${tabBtn('lists','book','Word lists')}${tabBtn('concepts','grid','Concepts')}</div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px">${body}</div>
  </div>`; }
function gameShell(statusBar, inner){ return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px">${statusBar}<div style="display:flex;align-items:center;gap:10px">${coinChip()}<button data-act="exitGame" style="color:var(--muted);font-weight:700;font-size:14px">✕ Exit</button></div></div>
    ${inner}</div>`; }
function typedGame(){ const S=state; const g=S.game; const w=g.list[g.i]; let statusBar='';
  if(g.type==='beat'){ const low=g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:20px;color:${low?'var(--bad)':'var(--accent)'};min-width:54px">⏱ ${g.timeLeft}s</span><span style="font-family:var(--mono);font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else if(g.type==='boss'){ const hpPct=Math.round(g.hp/g.maxhp*100); const hearts='❤️'.repeat(g.lives)+'🖤'.repeat(g.maxlives-g.lives);
    statusBar=`<div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:5px"><span style="font-size:20px">👹</span><div style="flex:1;height:11px;border-radius:99px;background:var(--surface2);overflow:hidden;max-width:220px"><div style="height:100%;border-radius:99px;background:linear-gradient(90deg,#FF4D8D,#d63a3a);width:${hpPct}%;transition:width .35s"></div></div><span style="font-size:13px">${hearts}</span></div></div>`; }
  else if(g.type==='champ'){ const low=g.fmt==='timed'&&g.timeLeft<=10; statusBar=`<div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:900;font-size:18px;color:var(--accent)">⚡ Challenge</span>${g.fmt==='timed'?`<span style="font-family:var(--display);font-weight:900;font-size:18px;color:${low?'var(--bad)':'var(--accent)'}">⏱ ${g.timeLeft}s</span>`:`<span style="font-family:var(--mono);font-size:13px;color:var(--muted)">${g.i+1}/${g.total}</span>`}<span style="font-family:var(--mono);font-size:13px;color:var(--muted)">✓ ${g.right}</span></div>`; }
  else statusBar=`<div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.list.length} · ✓ ${g.right}</div>`;
  const hint = S.gInfo ? `<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 15px;text-align:left;font-size:14px;line-height:1.55;margin-bottom:14px">${w.d?('<b>Meaning</b> — '+blankHTML(w.d,w.w)):''}${w.d&&w.s?'<br>':''}${w.s?('<b>Sentence</b> — '+blankHTML(w.s,w.w)):''}${w.h?('<br><span style="display:inline-flex;align-items:center;gap:5px;color:var(--accent);vertical-align:middle">'+iconSVG('bulb',14)+'</span> '+blankHTML(w.h,w.w)):''}${(!w.d&&!w.s)?'No hint for this one — listen closely!':''}</div>` : '';
  let bossFb=''; if(g.type==='boss'&&g.last){ bossFb=g.last.ok?`<div style="color:#1f9d57;font-weight:800;font-size:14px;margin-bottom:12px">💥 Hit! Boss took damage.</div>`:`<div style="color:var(--bad);font-weight:800;font-size:14px;margin-bottom:12px">💔 Missed — it was <b>${esc(g.last.word)}</b></div>`; }
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(22px,5vw,32px);box-shadow:var(--glow);text-align:center">
      <p style="font-size:13px;color:var(--muted);font-weight:700;margin:0 0 14px">${g.type==='boss'?'Spell it to attack!':'Listen and type'}</p>
      <button data-act="gSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:14px"><button data-act="gSaySlow" style="padding:9px 14px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">Slow</button><button data-act="gInfoToggle" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid var(--line);${S.gInfo?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">💡 Hint</button></div>
      ${hint}${bossFb}
      <input data-inp="onType" data-key="gKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="type here" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:15px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:14px">
      <button data-act="gSubmit" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">${g.type==='boss'?'Attack! ⚔️':'Enter →'}</button>
    </div>`;
  return gameShell(statusBar, inner); }
function typedDone(){ const S=state; const g=S.game; let title,big,sub;
  if(g.type==='boss'){ title=g.status==='won'?'Boss defeated! 🏆':'You were beaten 👹'; big=g.status==='won'?'VICTORY':'TRY AGAIN'; sub=g.status==='won'?('You landed '+(g.right||0)+' hits'):('You landed '+(g.right||0)+' hits before falling'); }
  else if(g.type==='beat'){ title=g.right>=12?'Lightning speller! ⚡':'Time! ⏱'; big=g.right+' words'; sub='spelled in 60 seconds'; }
  else { const pct=Math.round(g.right/(g.ans.length||1)*100); title=pct>=80?'Strong round! 🏆':pct>=50?'Nice work 💪':'Keep training 🌱'; big=g.right+'/'+g.ans.length; sub=pct+'% correct'; }
  return `<div style="max-width:560px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px">
      <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:74px;height:82px">${mascotSVG(g.status==='lost'?'oops':'love')}</div></div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 8px">${title}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1">${big}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px">${sub}</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${iconSVG('coin',15)} +${g.bonus||0} coins earned</div>
    </div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitGame" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">← Arcade</button><button data-act="gReplay" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Play again →</button></div>
  </div>`; }
function mcGame(){ const S=state; const g=S.game; const q=g.qs[g.i]; const mono=q.kind==='spell';
  const statusBar=`<div style="font-family:var(--mono);font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.qs.length} · ✓ ${g.right}</div>`;
  const choices=q.choices.map((ch,idx)=>{ let bg='var(--surface2)',col='var(--text)',bd='var(--line)';
    if(g.picked!=null){ if(ch===q.answer){ bg='color-mix(in srgb,#1f9d57 20%,var(--bg2))'; col='var(--text)'; bd='#1f9d57'; } else if(idx===g.picked){ bg='color-mix(in srgb,var(--bad) 18%,var(--bg2))'; bd='var(--bad)'; } }
    return `<button data-act="gPick" data-arg="${idx}" ${g.picked!=null?'disabled':''} style="text-align:${mono?'center':'left'};padding:15px 17px;border-radius:14px;background:${bg};border:2px solid ${bd};color:${col};font-family:${mono?'var(--mono)':'var(--display)'};font-weight:800;font-size:16px;${mono?'letter-spacing:.04em;':''}">${esc(ch)}</button>`; }).join('');
  const hearBtn=(label)=>`<button data-act="gSayQ" style="margin-top:12px;display:inline-flex;align-items:center;gap:8px;padding:9px 15px;border-radius:999px;background:var(--surface2);font-weight:700;font-size:13px;border:1px solid var(--line)">${iconSVG('volume',15)} ${label}</button>`;
  const eyebrow=(t)=>`<div style="font-size:12px;color:var(--muted);font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">${t}</div>`;
  let prompt;
  if(q.kind==='sentence') prompt=`${eyebrow('Fill the blank')}<div style="font-size:clamp(17px,3.6vw,21px);line-height:1.6;font-weight:600">${q.prompt}</div>${hearBtn('Hear sentence')}`;
  else if(q.kind==='origin') prompt=`${eyebrow('Where does it come from?')}<div style="font-family:var(--display);font-size:clamp(20px,4.5vw,28px);font-weight:800">${q.prompt}</div>${hearBtn('Hear word')}`;
  else if(q.kind==='spell') prompt=`${eyebrow('Which spelling is correct?')}<div style="font-size:clamp(15px,3.4vw,19px);line-height:1.5;font-weight:600;color:var(--muted)">${q.prompt}</div>${hearBtn('Hear word')}`;
  else prompt=`${eyebrow('Which word means…')}<div style="font-size:clamp(17px,3.6vw,21px);line-height:1.55;font-weight:600">“${q.prompt}”</div>`;
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(20px,4.5vw,30px);box-shadow:var(--glow);margin-bottom:14px;text-align:center">${prompt}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:11px">${choices}</div>`;
  return gameShell(statusBar, inner); }
function mcDone(){ const g=state.game; const pct=Math.round(g.right/(g.qs.length||1)*100);
  return `<div style="max-width:560px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px">
      <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:74px;height:82px">${mascotSVG('love')}</div></div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:22px;margin:0 0 8px">${pct>=80?'Word wizard! 🧙':pct>=50?'Good thinking 💪':'Keep learning 🌱'}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1">${g.right}/${g.qs.length}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px">${pct}% correct</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${iconSVG('coin',15)} +${g.bonus||0} coins earned</div>
    </div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitGame" style="padding:13px 18px;border-radius:13px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">← Arcade</button><button data-act="gReplay" style="padding:13px 20px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Play again →</button></div>
  </div>`; }


/* ===================== OVERLAYS ===================== */
function overlays(){
  const S=state; let h='';
  if(S.showPaywall){
    const perks=['4 worlds unlocked (2 more than free)','Half of all 110 concepts unlocked','Level up past Level 5 on every list','Premium word lists + full library','Earn 🪙 coins to unlock everything else']
      .map(p=>`<div style="display:flex;align-items:center;gap:11px;font-size:14.5px;font-weight:600"><span style="width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;font-size:13px;flex-shrink:0">✓</span>${p}</div>`).join('');
    const planStyle=(on)=>'flex:1;text-align:left;border-radius:14px;padding:14px;cursor:pointer;background:var(--surface2);border:2px solid '+(on?'var(--accent)':'transparent');
    h+=`<div data-act="closePaywall" style="position:fixed;inset:0;z-index:60;background:rgba(10,8,20,.55);backdrop-filter:blur(6px);display:grid;place-items:center;padding:20px">
      <div data-act="noop" style="width:100%;max-width:460px;background:var(--bg2);border:1px solid var(--line);border-radius:22px;padding:clamp(24px,5vw,34px);box-shadow:var(--glow);animation:sb-pop .35s ease both;max-height:92dvh;overflow:auto">
        <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:70px;height:78px">${mascotSVG('love')}</div></div>
        <h2 style="font-family:var(--display);font-weight:800;font-size:24px;text-align:center;margin:0 0 4px">Go Premium</h2>
        <p style="text-align:center;color:var(--muted);font-size:14px;margin:0 0 20px">Unlock 4 worlds, half the concepts, and uncapped levels — then earn coins for the rest.</p>
        <div style="display:grid;gap:9px;margin-bottom:20px">${perks}</div>
        <div style="display:flex;gap:10px;margin-bottom:16px">
          <button data-act="pickPlan" data-arg="year" style="${planStyle(S.plan==='year')}"><div style="font-size:11px;font-weight:800;color:var(--accent);letter-spacing:.04em">BEST VALUE · SAVE 38%</div><div style="font-family:var(--display);font-weight:800;font-size:22px">$59<span style="font-size:13px;color:var(--muted)">/yr</span></div><div style="font-size:12px;color:var(--muted)">$4.92 / month</div></button>
          <button data-act="pickPlan" data-arg="month" style="${planStyle(S.plan==='month')}"><div style="font-size:11px;font-weight:800;color:var(--muted);letter-spacing:.04em">MONTHLY</div><div style="font-family:var(--display);font-weight:800;font-size:22px">$7.99<span style="font-size:13px;color:var(--muted)">/mo</span></div><div style="font-size:12px;color:var(--muted)">billed monthly</div></button>
        </div>
        <button data-act="upgrade" style="width:100%;padding:16px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:16px;box-shadow:inset 0 -3px 0 rgba(0,0,0,.18)">Start 7-day free trial</button>
        <div style="text-align:center;margin-top:12px"><button data-act="closePaywall" style="color:var(--muted);font-size:13px;font-weight:600">Maybe later</button></div>
      </div></div>`;
  }
  if(S.fullLoading) h+=`<div style="position:fixed;inset:0;z-index:65;background:rgba(10,8,20,.5);backdrop-filter:blur(5px);display:grid;place-items:center;padding:20px">
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:28px 30px;text-align:center;box-shadow:var(--glow);max-width:340px">
        <div style="width:64px;height:72px;margin:0 auto 12px;animation:sb-float 2.5s ease-in-out infinite">${mascotSVG('happy')}</div>
        <div style="font-family:var(--display);font-weight:800;font-size:18px;margin-bottom:6px">Loading the full library…</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.5">All 128,000 words — this one-time load takes a few seconds.</div>
        <div style="width:28px;height:28px;margin:14px auto 0;border:3px solid var(--surface2);border-top-color:var(--accent);border-radius:50%;animation:sb-spin .8s linear infinite"></div>
      </div></div>`;
  if(S.toast) h+=`<div style="position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:70;background:var(--accent);color:#fff;font-weight:800;font-size:15px;padding:13px 22px;border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.3);animation:sb-pop .35s ease both;display:flex;align-items:center;gap:9px">${esc(S.toast)}</div>`;
  return h;
}

/* ===================== render + events ===================== */
const root = document.getElementById('root');
function save(){ try{ localStorage.setItem('sb_saas_v2', JSON.stringify({ theme:state.theme, mode:state.mode, premium:state.premium, children:state.children, activeIdx:state.activeIdx, goalDone:state.goalDone })); }catch(e){} }
function render(){
  const a=document.activeElement; const fkey=a&&a.getAttribute&&a.getAttribute('data-fkey'); let ss=null,se=null;
  try{ if(a){ ss=a.selectionStart; se=a.selectionEnd; } }catch(e){}
  document.documentElement.setAttribute('data-theme', state.theme);
  document.documentElement.setAttribute('data-mode', state.mode);
  root.innerHTML = `<div style="min-height:100dvh;position:relative;z-index:1">${view()}</div>` + overlays();
  if(fkey){ const el=root.querySelector('[data-fkey="'+fkey+'"]'); if(el){ try{ el.focus(); if(ss!=null&&el.setSelectionRange) el.setSelectionRange(ss,se); }catch(e){} } }
  save();
}
function callAct(act, arg, ev){ const fn=app[act]; if(typeof fn==='function') fn(arg, ev); }
root.addEventListener('click', e=>{ const el=e.target.closest('[data-act]'); if(!el) return; callAct(el.getAttribute('data-act'), el.getAttribute('data-arg')); });
root.addEventListener('input', e=>{ const el=e.target.closest('[data-inp]'); if(!el) return; callAct(el.getAttribute('data-inp'), el.value); });
root.addEventListener('change', e=>{ const el=e.target.closest('[data-chg]'); if(!el) return; callAct(el.getAttribute('data-chg'), el.value); });
root.addEventListener('keydown', e=>{ const el=e.target.closest('[data-key]'); if(!el) return; const fn=app[el.getAttribute('data-key')]; if(fn) fn(e); });

/* ===================== init ===================== */
(function init(){
  try{ const raw=localStorage.getItem('sb_saas_v2'); if(raw){ const s=JSON.parse(raw);
    state.theme=s.theme||'spellbound'; state.mode=s.mode||'light'; state.premium=!!s.premium;
    state.children=s.children||[]; state.activeIdx=s.activeIdx||0; state.goalDone=s.goalDone||0;
    try{ state.children.forEach(ensureLists); }catch(e){}
    try{ syncMissed(); }catch(e){}
    state.screen=(s.children&&s.children.length)?'app':'landing'; state.nav='home';
  } }catch(e){}
  try{ if(localStorage.getItem('sb_devunlock')==='1'){ state.devUnlock=true; state.premium=true; } }catch(e){}
  try{ loadVoiceCfg(); }catch(e){}
  try{ loadEvoFB(); }catch(e){}
  try{ loadVoices(); window.speechSynthesis.onvoiceschanged=loadVoices; }catch(e){}
  render();
})();

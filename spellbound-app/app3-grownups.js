"use strict";
/* app3-grownups.js — the grown-ups' screens: the report card (progress / parent), the plan, cloud and account sheets.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrGrown`, its group carries app3-shared.js and the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

function dayDiff(a,b){ if(!a||!b) return 99; const pa=a.split('-').map(Number), pb=b.split('-').map(Number); return Math.round((Date.UTC(pb[0],pb[1]-1,pb[2])-Date.UTC(pa[0],pa[1]-1,pa[2]))/86400000); }
const srsState = (r) => { if(!r||!r.seen) return 'new'; if(r.box>=5) return 'mastered'; if(r.box>=3) return 'review'; return 'learning'; };
function coachReadiness(){ const pool=coachPool(); const srs=state.coachSrs||{}; let nw=0,lr=0,rv=0,ms=0;
  pool.forEach(r=>{ const st=srsState(srs[nkey(r.w)]); if(st==='new')nw++; else if(st==='learning')lr++; else if(st==='review')rv++; else ms++; });
  const size=pool.length||1; const seen=lr+rv+ms;
  return { size:pool.length, nw,lr,rv,ms, seen, coverage:Math.round(seen/size*100), ready:Math.round(ms/size*100) }; }
/* "Worlds 1–2 are free; worlds 3–8 come with the family plan, or one at a time for 240 coins your child earns." */
function worldRuleTxt(lead) { const r = sbRule(); if (!r) return '';
  const rest = r.n ? `worlds ${r.free + 1}–${r.n}` : 'the rest';
  return `${lead || 'Worlds'} 1–${r.free} are free; ${rest} come with the family plan, or one at a time for ${r.world} coins your child earns by learning.`; }
/* Good days THIS week — the whole of what is left of the streak card. Seven squares, Monday
   to Sunday, lit where a session finished. No count of days in a row, no "next reward", no
   best, no fire: a day off costs nothing (FAMILY-STANDARD §8). */
function goodDaysCard(){ const c=active(); ensureLists(c); const t=todayKey(); const played=new Set(c.daysPlayed||[]);
  const days=weekDayKeys().map((k,i)=>({on:played.has(k), today:k===t, dn:['M','T','W','T','F','S','S'][i]}));
  const n=days.filter(d=>d.on).length;
  const dots=days.map(d=>`<div style="display:flex;flex-direction:column;align-items:center;gap:3px"><span style="width:17px;height:17px;border-radius:6px;display:inline-block;background:${d.on?'var(--accent)':'var(--surface2)'};${d.today?'box-shadow:0 0 0 2px var(--accent)':''}"></span><span style="font-size:12px;color:var(--muted);font-weight:700">${d.dn}</span></div>`).join('');
  return `<div class="sb-card sb-gooddays">
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:11px"><div style="width:42px;height:42px;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG('check',22)}</div><div><div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1">${n} good ${n===1?'day':'days'} this week</div><div style="font-size:12px;color:var(--muted);font-weight:600">Nothing expires. A day off costs nothing.</div></div></div>
    </div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;justify-content:space-between">${dots}</div>
  </div>`; }
function paintedTileArt(world,h,eager){   /* eager: Home's first screen — a lazy image above the fold waits its turn (audit v4 B6) */
  return `<span style="position:relative;display:block;width:100%;height:${h}px;overflow:hidden;background:linear-gradient(160deg,#4a3f7a,#241e46)">
    <img src="app-art/w-${world}-r2.webp" alt="" loading="${eager?'eager':'lazy'}" decoding="async" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
    <span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,9,32,.16),rgba(14,9,32,.42))"></span></span>`;
}
function tipLibraryCount(){ const T=window.SB_TIPS||{}; let n=0; Object.keys(T).forEach(k=>n+=T[k].length);
  const chs=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]).length; const ths=themeDefs().length;
  let champ=0; try{ champ=journeySorted().filter(w=>w.h&&(w.y||3)>=4).length; }catch(e){}
  return n+chs+ths+champ; }
const TIP_CAT_LABEL={trap:'Their pattern',atlas:'The Atlas',vocab:'Vocabulary',themes:'Theme Journeys',arcade:'The Arcade',advanced:'Advanced Pack',placement:'Finding their level',reengage:'Re-engage',consistency:'Consistency',difficult:'Hard words',memory:'Memory science',accuracy:'Accuracy',oral:'Oral rounds',written:'Written rounds',beeday:'Bee day',nerves:'Nerves',motivation:'Motivation',parenting:'Parenting',young:'Young spellers',plateau:'Plateau',review:'Review',coverage:'Coverage',origin:'Origins',pattern:'Patterns',champword:'Champion words',theme:'Themes',miss:'Their words'};
function reportCardHTML(c){ c=c||active(); let R; try{ R=reportCard(c); }catch(e){ return ''; } const m=R.mastery, T=R.time, P=R.progress||{};
  const box=(label,big,sub,body)=>`<div class="sb-rc-box" style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px 15px;min-width:0">
      <div style="font-size:11.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)">${label}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:20px;margin:4px 0 2px;line-height:1.2">${big}</div>
      <div style="font-size:12.5px;color:var(--muted);line-height:1.45">${sub}</div>${body||''}</div>`;
  const chips=(ws)=>ws.map(w=>`<span style="display:inline-block;font-family:var(--mono);font-size:12px;font-weight:700;padding:3px 8px;border-radius:6px;background:var(--paper,var(--bg2));border:1px solid var(--line);margin:3px 4px 0 0">${esc(w)}</span>`).join('');
  const time=T.feed?box('Time',`${T.minutes} active minute${T.minutes===1?'':'s'}`,`over the last 7 days, on ${T.days} day${T.days===1?'':'s'}. Time is effort, not learning — it is here so you can see the habit.`)
    :box('Time','Not recorded yet','Active minutes appear once the Bizzing family activity feed is on for this device.');
  const at=P.atlas; if(!at) lazyNeed('atlas');   // the map's data rides the idle queue; it re-renders when it lands
  const pl=P.placed;
  const prog=box('Progress', at?`${at.cleared} Atlas stop${at.cleared===1?'':'s'} cleared`:`Stage ${P.stage||1}`,
    (at?`Now at <b>${esc(at.at)}</b>${at.region?' · '+esc(at.region):''} (tier ${at.tier}). `:'')+(P.list?`Spelling: Stage ${P.stage||1} of ${esc(P.list)}.`:'')+
    (pl?` <span class="sb-rc-placed">Started at <b>${esc(pl.chose)}</b> after placement (${pl.ok} of ${pl.n} words right${pl.suggested&&pl.suggested!==pl.chose?'; it suggested '+esc(pl.suggested):''}) — the stops before it are open and not counted as walked.</span>`:''));
  /* P1.9 / P1.10: the "I can…" objectives with their evidence, and the sourced grade map — objectives.js and
     grade-map-data.js are lazy (boot-lazy `curriculum`); the trail map's word pools come through trail.js */
  let cur='';
  try{ if(window.SB_OBJ && window.SB_GRADE_MAP) cur=SB_OBJ.reportSection(c, at&&at.act); else { lazyNeed('curriculum'); cur='<div class="sb-rc-curriculum" role="status" style="margin-top:14px;font-size:12.5px;color:var(--muted)">Loading what they can do, region by region…</div>'; } }catch(e){}
  const famLine=m.families.length?`<div style="margin-top:8px;font-size:12.5px;line-height:1.5">${m.families.slice(0,4).map(f=>`<b>${f.n}</b> ${esc(f.label.toLowerCase())}`).join(' · ')}</div>`:'';
  const mast=box('Mastery', `${m.retained} word${m.retained===1?'':'s'} mastered`,
    `Spelled right on two different days, a day or more apart — so it stuck.${m.newThisWeek?` <b>${m.newThisWeek}</b> new this week.`:''}`+
    (m.carried?` <br>${m.carried} more ${m.carried===1?'was':'were'} marked before mastery needed a second day; ${m.carried===1?'it counts':'they count'} once re-checked.`:''), famLine);
  const lines=[];
  if(m.due) lines.push(`<div><b>${m.due} due for a re-check</b> — mastered words come back now and then. ${chips(m.dueWords.slice(0,8))}</div>`);
  if(m.slipped.length) lines.push(`<div><b>${m.slipped.length} slipped since mastered</b> — spelled right before, missed since. ${chips(m.slipped.slice(0,8).map(x=>x.w))}</div>`);
  if(m.traps.length) lines.push(`<div><b>Traps to help with:</b> ${m.traps.map(t=>`${esc(t.label)} (${t.words.map(esc).join(', ')})`).join(' · ')}</div>`);
  if(m.learning) lines.push(`<div><b>${m.learning}</b> spelled right once and waiting for another day.</div>`);
  return `<div class="sb-card sb-report-card" style="margin-bottom:18px">
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Report card · ${esc(R.name||'your speller')}</div><span style="font-size:12px;color:var(--muted);font-weight:700">what ${esc(R.name||'they')} can now do, from evidence</span></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin:10px 0">${time}${prog}${mast}</div>
    ${lines.length?`<div style="display:flex;flex-direction:column;gap:8px;font-size:13px;line-height:1.5">${lines.join('')}</div>`:''}
    ${cur}
    ${/* standard §13: the grown-ups page links to the Hive's family-wide view (a link, not a request) */''}
    <a class="sb-hive-grown" href="https://aayuvis.github.io/Bizzing_Schedule/#grown" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:6px;margin-top:12px;font-size:12.5px;font-weight:800;color:var(--accent);text-decoration:none">⬡ The whole family in the Bizzing Hive →</a>
  </div>`; }
function parentAnalytics(){ const s=parentSignals(); let rd=0; try{ rd=coachReadiness().ready||0; }catch(e){}
  if(!everPractised(s.c)) return `<div class="sb-card" style="display:flex;align-items:center;gap:16px">
    <div style="width:64px;height:70px;flex-shrink:0">${mascotSVG('think')}</div>
    <div style="min-width:0">
      <div class="sb-ct" style="margin-bottom:3px">${esc(s.c.name||'Your speller')} hasn\u2019t practised yet</div>
      <div class="sb-cs">Signals appear after the first session \u2014 you\u2019ll see <b>Consistency</b>, <b>Accuracy</b>, <b>Coverage</b>, <b>Review health</b> and <b>Readiness</b>, all computed on this device. The best first step: one 5-word session together today.</div>
    </div></div>`;
  const meters=[['Consistency',s.consistency,'practised '+s.active14+'/14 days'],['Accuracy',s.acc,'across recent sessions'],['Coverage',s.coverage,'of words met on the active list'],['Review health',s.reviewHealth,s.missedN+' words waiting for revenge'],['Readiness',rd,'on the coach target list']];
  const bars=meters.map(([l,v,sub])=>{ v=Math.max(0,Math.min(100,Math.round(v||0))); const col=v>=70?'var(--good)':v>=40?'#c08a00':'var(--bad)';
    return `<div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><span style="font-family:var(--display);font-weight:800;font-size:13px">${l}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:13px;color:${col}">${v}%</span></div><div style="height:7px;border-radius:999px;background:var(--surface);overflow:hidden;margin:8px 0 6px"><div style="height:100%;border-radius:999px;background:${col};width:${v}%"></div></div><div style="font-size:12px;color:var(--muted);font-weight:600">${sub}</div></div>`; }).join('');
  const tips=parentTips().map(t=>`<div style="display:flex;gap:11px;align-items:flex-start;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--surface)">
      <span style="flex-shrink:0;margin-top:1px;padding:4px 9px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px;white-space:nowrap">${TIP_CAT_LABEL[t.cat]||t.cat}</span>
      <div style="min-width:0"><div style="font-size:13px;line-height:1.5;color:var(--text);font-weight:600">${esc(t.text)}</div><div style="font-size:12px;color:var(--muted);font-weight:700;margin-top:3px">Why now: ${esc(t.why)}</div></div></div>`).join('');
  return `<div class="sb-card" style="margin-bottom:18px">
    <div style="display:flex;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:4px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Practice habits</div><span style="font-size:12px;color:var(--muted);font-weight:700">how the practice is going — the report card above says what has been learned</span></div>
    <p style="margin:0 0 14px;font-size:12px;color:var(--muted)">All computed on this device from the practice log — no internet, no AI.</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:16px">${bars}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px"><div style="font-family:var(--display);font-weight:800;font-size:15px">Coach's corner <span style="color:var(--muted);font-weight:700;font-size:12px">· picked for this week by the practice data</span></div>
      <button data-act="moreTips" style="padding:8px 14px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">More tips ↻</button></div>
    <div style="display:flex;flex-direction:column;gap:8px">${tips}</div>
    <div style="font-size:12px;color:var(--muted);font-weight:600;margin-top:10px">Tip library: ${tipLibraryCount().toLocaleString()} coaching tips, matched to your speller's data.</div>
  </div>`; }
// Lists the child has activated: the 3 core lists + everything they pinned + whatever is being trained now.
function activatedListKeys(){ const c=active(); ensureLists(c);
  const keys=['journey','review','missed', ...Object.keys(c.pinnedLists||{}).filter(k=>(c.pinnedLists||{})[k])];
  const cur=c.activeList; if(cur && !keys.includes(cur)) keys.push(cur);
  return keys.filter((k,i)=>keys.indexOf(k)===i); }
/* Progress + Parent live under one nav: a segmented switch picks the view. */
function viewProgressShell(){ const t=state.progTab==='parent'?'parent':'me';
  const seg2=(k,ic,l)=>`<button data-act="progTab" data-arg="${k}" style="display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:999px;font-weight:800;font-size:13.5px;${t===k?'background:var(--accent);color:#fff;box-shadow:var(--edge)':'background:var(--surface2);color:var(--muted)'}">${iconSVG(ic,15)} ${l}</button>`;
  return `<div style="max-width:920px;margin:0 auto">
    <div style="display:flex;gap:8px;margin-bottom:16px">${seg2('me','chart','My progress')}${seg2('parent','users','Parent zone')}</div>
    ${t==='parent'?viewParent():viewProgress()}</div>`; }
// A snapshot of everything a speller explores beyond core spelling — used by both the
// kid Progress screen and the Parent dashboard so the surfaces (Quotes, Journeys,
// Typing, Idioms) are actually reflected in progress.
function explorerTiles(c){
  const tiles=[]; const qTotal=(window.SB_QUOTES||[]).length; const qTxt=countTxt('quotes');
  if(qTotal){ const favN=Object.keys(c.quoteFavs||{}).length; const seenN=Object.keys(c.qSeen||{}).length;
    tiles.push({act:'openQuotes',ic:'quote',col:'#C8791B',label:'Quotes & poems',v:(seenN||favN||0)+'',sub:(favN?favN+' ❤ favourites · ':'')+(qTxt?qTxt+' to explore':'more to explore')}); }
  try{ const lDone=lessonsDoneCount(); const lU=lessonUnits(); const lChap=lU.filter(u=>{ const ls=lessonsAll().filter(L=>L.unit===u.n); return ls.length&&ls.every(L=>lessonComplete(L)); }).length;
    if(lU.length) tiles.push({act:'openJourneys',ic:'book',col:'#E0922E',label:'Word Journeys',v:lChap+'/'+(lU.length),sub:lDone+' lessons studied'}); }catch(e){}
  try{ const cAll=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]); const cDone=cAll.filter(ch=>conceptStat(ch).done).length;
    if(cAll.length) tiles.push({act:'setNav',arg:'concepts',ic:'grid',col:'#13A892',label:'Concepts',v:cDone+'/'+cAll.length,sub:'patterns & rules learned'}); }catch(e){}
  const ty=c.typing||{}; if(ty.tests) tiles.push({act:'openTyping',ic:'pencil',col:'#3D7DF0',label:'Typing',v:(ty.bestWpm||0)+' WPM',sub:'best · '+(ty.bestAcc||0)+'% accuracy'});
  const figN=Object.keys(c.figDone||{}).length; if(figN) tiles.push({act:'setNav',arg:'figurative',ic:'spark',col:'#E8458C',label:'Idioms & similes',v:figN+'',sub:'decks completed'});
  return tiles; }
function explorerCard(c,opts){ opts=opts||{}; const tiles=explorerTiles(c); if(!tiles.length) return '';
  const cell=t=>{ const arg=t.arg?`data-arg="${escA(t.arg)}"`:''; return `<button data-act="${t.act}" ${arg} style="text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;gap:6px">
    <span style="display:flex;align-items:center;gap:8px"><span style="width:30px;height:30px;flex-shrink:0;border-radius:9px;background:color-mix(in srgb,${t.col} 16%,transparent);color:${t.col};display:grid;place-items:center">${iconSVG(t.ic,16)}</span><span style="font-family:var(--display);font-weight:800;font-size:13px;color:var(--text)">${esc(t.label)}</span></span>
    <span style="font-family:var(--display);font-weight:800;font-size:20px;color:${t.col};line-height:1">${esc(t.v)}</span>
    <span style="font-size:11.5px;color:var(--muted);font-weight:600;line-height:1.3">${esc(t.sub)}</span></button>`; };
  return `<div class="sb-card" style="${opts.mt?'margin-top:18px':''}">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:3px">${opts.title||'Beyond spelling'}</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:13px">${opts.sub||'Everywhere '+esc(c.name||'your speller')+' is building language — the arcade, quotes, journeys and more.'}</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">${tiles.map(cell).join('')}</div>
  </div>`; }
/* ---- Daily-target history: one metric at a time, 30 days of bars against the target line ---- */
const METRICS=[['app','App time',RING_COL[0][0]],['prac','Practise time',RING_COL[1][0]],['words','Word count',RING_COL[2][0]]];
function metricDays(c,n){ n=n||30; const out=[]; const d=new Date();
  for(let i=n-1;i>=0;i--){ const x=new Date(d.getFullYear(),d.getMonth(),d.getDate()-i);
    const k=x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
    const rec=(c.dayLog||{})[k]||{}; const isToday=(k===todayKey());
    out.push({k, day:x.getDate(), dow:x.getDay(), app:rec.app||0, prac:rec.prac||0,
      words: isToday?goalToday():(rec.words||0) }); }
  return out; }
function metricsCard(c){
  const sel=(['app','prac','words'].indexOf(state.metricSel)>=0)?state.metricSel:'app';
  const meta=METRICS.find(m=>m[0]===sel); const col=meta[2];
  const t=targets(c); const tgt=(sel==='words')?t.words:(sel==='app'?t.app*60:t.prac*60);
  const days=metricDays(c,30);
  const vals=days.map(d=>d[sel]);
  // headroom above the target so an over-target day is visibly over
  const top=Math.max(tgt*1.25, ...vals, 1);
  const fmt=(v)=>sel==='words'?String(v):fmtMins(v);
  const hit=vals.filter(v=>v>=tgt).length;
  const tot=vals.reduce((a,b)=>a+b,0); const avg=Math.round(tot/days.length);
  const H=132, tgtY=(1-tgt/top)*H;
  const bars=days.map((d,i)=>{ const v=d[sel]; const h=Math.max(v>0?3:0, Math.round(v/top*H));
    const over=v>=tgt; const wk=d.dow===0||d.dow===6;
    return `<span title="${d.k} · ${fmt(v)}" style="flex:1;min-width:5px;display:flex;flex-direction:column;justify-content:flex-end;height:${H}px">
      <span style="display:block;height:${h}px;border-radius:3px 3px 2px 2px;background:${over?col:'color-mix(in srgb,'+col+' 34%,transparent)'};${wk&&!over?'opacity:.8':''}"></span></span>`; }).join('');
  const ticks=days.map((d,i)=>`<span style="flex:1;min-width:5px;text-align:center;font-size:8.5px;color:var(--muted);font-weight:700">${(i%5===0||i===days.length-1)?d.day:''}</span>`).join('');
  const drop=`<div style="position:relative;display:inline-block">
    <select data-chg="metricPick" aria-label="Choose a metric" style="appearance:none;-webkit-appearance:none;padding:10px 36px 10px 14px;border-radius:10px;background:var(--surface2);border:1.5px solid ${col};color:var(--text);font-family:var(--display);font-weight:800;font-size:13.5px;cursor:pointer">
      ${METRICS.map(([k,lab])=>`<option value="${k}"${sel===k?' selected':''}>${lab}</option>`).join('')}
    </select><span style="position:absolute;right:13px;top:50%;transform:translateY(-50%);pointer-events:none;color:${col};font-size:11px">▼</span></div>`;
  return `<div class="sb-card" id="sb-metrics" style="margin-bottom:18px">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:3px">
      <span style="flex-shrink:0">${ringsSVG(46,[todayMetrics(c).pApp,todayMetrics(c).pPrac,todayMetrics(c).pWords])}</span>
      <span style="min-width:0"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15px">Daily targets · last 30 days</span>
      <span style="display:block;font-size:12px;color:var(--muted)">Pick a metric. The dashed line is your target; solid bars are the days you reached it.</span></span></div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:center;margin:12px 0 14px">${drop}<span style="font-size:11.5px;color:var(--muted);font-weight:700">— 30 days, one bar a day</span></div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px">
      ${[['Target',fmt(tgt)],['Today',fmt(vals[vals.length-1]||0)],['Daily average',fmt(avg)],['Days on target',hit+'/'+days.length]]
        .map(([l,v])=>`<span style="min-width:78px"><span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;color:${col}">${esc(String(v))}</span><span style="display:block;font-size:11px;color:var(--muted);font-weight:700">${l}</span></span>`).join('')}
    </div>
    <div style="position:relative;padding-right:4px">
      <div style="position:absolute;left:0;right:0;top:${tgtY.toFixed(1)}px;border-top:2px dashed ${col};opacity:.85;pointer-events:none"></div>
      <div style="position:absolute;left:0;top:${Math.max(0,tgtY-15).toFixed(1)}px;font-size:9.5px;font-weight:800;color:${col};background:var(--paper,var(--bg2));padding:0 5px 0 0;pointer-events:none">target ${fmt(tgt)}</div>
      <div style="display:flex;align-items:flex-end;gap:2px;height:${H}px">${bars}</div>
    </div>
    <div style="display:flex;gap:2px;margin-top:4px">${ticks}</div>
    <div style="font-size:11.5px;color:var(--muted);font-weight:650;margin-top:8px">${sel==='prac'?'Practice time counts the Word Gym and revisions only — the clock stops in the Arcade and everywhere else.':(sel==='app'?'Every minute spent anywhere in Bizzing Bee, counted only while the app is on screen.':'Every word you spell right, wherever you spell it.')}</div>
  </div>`; }
/* Study-card analytics: how the trivia cards are split across practised / tested / mastered /
   revision, chapter by chapter — and tapping a state opens the actual list of those cards. */
function ttAnalyticsCard(c){
  const all=ttAllStats(c); if(!all.total) return '';
  if(!all.touched) return `<div class="sb-card" style="margin-bottom:18px">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:3px">🃏 Study cards</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:11px">Nothing marked yet. Open <b style="color:var(--text)">Know the World of Words</b> and mark cards practised, tested or mastered — this fills in as you go.</div>
    <button data-act="openTrivTrain" style="padding:10px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">Start studying →</button></div>`;
  const cells=[['mastered','Mastered','#2FA35C','🏆'],['tested','Tested','#E0922E','✍️'],['practised','Practised','#7C5CFF','📖'],['revise','To revise','#C8791B','↓']]
    .map(([k,lab,col,em])=>`<button data-act="ttList" data-arg="${k}" style="text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:13px 14px;display:flex;flex-direction:column;gap:5px">
      <span style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:800;color:var(--text)">${em} ${lab}</span>
      <span style="font-family:var(--display);font-weight:800;font-size:22px;color:${col};line-height:1">${fmtN(all[k]||0)}</span>
      <span style="font-size:11px;color:var(--muted);font-weight:700">${all.total?Math.round((all[k]||0)/all.total*100):0}% of ${fmtN(all.total)} · see the list →</span></button>`).join('');
  const chapters=ttThemes().map(th=>{ const st=all.byTh[th.id]||{}; if(!st.touched) return '';
    return `<button data-act="ttChapterFrom" data-arg="${escA(th.id)}" style="display:block;width:100%;text-align:left;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px">
      <span style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span>${th.e}</span><span style="font-weight:800;font-size:13px">${esc(th.label)}</span>
      <span style="margin-left:auto;font-size:11.5px;color:var(--muted);font-weight:700">${st.touched}/${fmtN(st.total)}</span></span>
      ${ttBar(st,5)}</button>`; }).filter(Boolean).join('');
  return `<div class="sb-card" style="margin-bottom:18px">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:3px">🃏 Study cards</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">${fmtN(all.touched)} of ${fmtN(all.total)} cards marked. Tap any state to see exactly which cards are in it.</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:14px">${cells}</div>
    ${chapters?`<div style="font-size:11px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-bottom:7px">By chapter</div>${chapters}`:''}
  </div>`; }
function viewProgress(){
  const c=active();
  const bb=beeBand(c);
  const stats=[{v:goodDaysThisWeek(c),k:'Good days this week'}]   /* words mastered is in the rank block above */
    .map(s=>`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:18px"><div style="font-family:var(--display);font-weight:800;font-size:24px;color:var(--accent)">${s.v}</div><div style="font-size:12px;color:var(--muted);font-weight:700">${s.k}</div></div>`).join('');
  const wk=c.week&&c.week.length?c.week:[12,20,15,30,18,25,22]; const maxW=Math.max(...wk,1); const days=['M','T','W','T','F','S','S'];
  const week=wk.map((m,i)=>`<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;height:100%;justify-content:flex-end"><div style="font-size:11px;font-weight:800;color:var(--muted)">${m||''}</div><div style="width:100%;border-radius:6px 7px 4px 4px;background:var(--accent);height:${Math.round((m/maxW)*100)}%;min-height:5px;opacity:${m?'1':'.3'}"></div><div style="font-size:12px;color:var(--muted);font-weight:700">${days[i]}</div></div>`).join('');
  /* Progress opens on the one ladder rather than computing a number of its own.
     Rank (effort, never falls) · Word difficulty (the dial) · the Atlas tier. */
  const rankBlock=(()=>{ const r=rankOf(c); const bnd=beeBand(c);
    const nx=(typeof window.SB_TRAIL_NEXT==='function')?SB_TRAIL_NEXT():null;
    const cell=(v,l,sub)=>`<span style="flex:1;min-width:104px"><span style="display:block;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:21px;line-height:1.1">${v}</span>
      <span style="display:block;font-size:11.5px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:3px">${l}</span>
      ${sub?`<span style="display:block;font-size:12px;color:var(--muted);font-weight:650;margin-top:2px">${sub}</span>`:''}</span>`;
    return `<div class="sb-card" style="margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap">
        <span style="width:60px;height:64px;flex-shrink:0;display:grid;place-items:center;border-radius:14px;background:var(--surface2)">${rankArt(r.form)}</span>
        <span style="min-width:0;flex:1">
          <span class="sb-cs">Your level</span>
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:20px;line-height:1.12">Level ${r.level} · ${esc(r.name)}</span>
          <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:650;margin-top:2px">Words spelled right move it, and nothing else — it only ever climbs.</span>
        </span>
        <button data-act="setNav" data-arg="evolution" class="sb-cl" style="align-self:flex-start">the ladder →</button>
      </div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;margin-top:14px;padding-top:13px;border-top:1px solid var(--line)">
        ${cell(bnd.calibrating?'—':bnd.band, 'Word difficulty', bnd.calibrating?'take the placement test':esc(bnd.tier))}
        ${cell(nx?('Tier '+nx.lap):'—', 'Word Atlas', nx?(nx.done+' of '+nx.total+' stops'):'not started')}
        ${cell(fmtN(journeyMastered(c)), 'Words mastered', 'across every list')}
      </div>
    </div>`; })();
  // ---- real per-list heatmap: dropdown over activated lists, plus All ----
  const S=state; const hKeys=activatedListKeys(); const hSel=(S.progHeatKey&&(S.progHeatKey==='all'||hKeys.includes(S.progHeatKey)))?S.progHeatKey:'all';
  const hLabel=(k)=> k==='journey'?'Bizzing Bee Journey':listLabel(k).split(' · ')[0];
  const hOpts=[`<option value="all"${hSel==='all'?' selected':''}>All lists</option>`,...hKeys.map(k=>`<option value="${escA(k)}"${hSel===k?' selected':''}>${esc(hLabel(k))} · Stage ${listStageIdx(c,k)+1}</option>`)].join('');
  const hDrop=`<div style="position:relative;margin-left:auto"><select data-chg="progHeat" style="appearance:none;-webkit-appearance:none;padding:9px 34px 9px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-family:var(--display);font-weight:800;font-size:13px;cursor:pointer">${hOpts}</select><span style="position:absolute;right:12px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--accent);font-size:12px">▼</span></div>`;
  let hBody='';
  if(hSel==='all'){
    hBody=hKeys.map(k=>{ const ws=encounteredWords(k); const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length;
      const miss=ws.filter(w=>!state.luMastered[nkey(w.w)] && (state.missedWords||[]).some(x=>nkey(x.w)===nkey(w.w))).length;
      const pct=ws.length?Math.round(m/ws.length*100):0;
      const tiles=ws.slice(0,96).map(w=>{ const kk=nkey(w.w); const bg=state.luMastered[kk]?'var(--good)':((state.missedWords||[]).some(x=>nkey(x.w)===kk)?'var(--bad)':'var(--surface2)'); return `<span title="${escA(w.w)}" style="width:14px;height:14px;border-radius:6px;background:${bg};display:inline-block"></span>`; }).join('');
      return `<button data-act="progHeatPick" data-arg="${escA(k)}" style="display:block;width:100%;text-align:left;border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:10px;background:var(--surface)">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(hLabel(k))}</span><span style="font-size:12px;color:var(--muted);font-weight:700">Stage ${listStageIdx(c,k)+1} · ${m}/${ws.length} mastered${miss?(' · '+miss+' to review'):''}</span><div style="flex:1;min-width:80px;height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;background:var(--accent);width:${pct}%"></div></div><span style="font-size:12px;color:var(--accent);font-weight:800">${pct}%</span></div>
        <div style="display:flex;flex-wrap:wrap;gap:4px">${tiles}${ws.length>96?`<span style="font-size:12px;color:var(--muted);font-weight:700;align-self:center">+${ws.length-96} more</span>`:''}</div>
      </button>`; }).join('');
    hBody=hBody||beeEmpty('think','Nothing to map yet — start practising and this lights up like a hive.');
  } else {
    const ws=encounteredWords(hSel); const cap=400;
    hBody=ws.length?((()=>{ const shown=ws.slice(0,cap);
      const cells=shown.map(w=>{ const kk=nkey(w.w); const mstd=state.luMastered[kk]; const miss=!mstd&&(state.missedWords||[]).some(x=>nkey(x.w)===kk);
        return `<button data-act="say" data-arg="${escA(w.w)}" title="tap to hear" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;color:${(mstd||miss)?'#fff':'var(--muted)'};background:${mstd?'var(--good)':(miss?'var(--bad)':'var(--surface2)')}">${esc(w.w)}</button>`; }).join('');
      const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length;
      return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:11px"><span style="font-size:12px;color:var(--muted);font-weight:700">${m}/${ws.length} mastered — words met so far on this list (through Stage ${listStageIdx(c,hSel)+1})</span></div><div style="display:flex;flex-wrap:wrap;gap:6px">${cells}</div>${ws.length>cap?`<div style="font-size:12px;color:var(--muted);margin-top:8px">Showing the first ${cap} of ${ws.length}.</div>`:''}`; })())
      :beeEmpty('happy','A fresh list! First practice fills this grid — clipboard ready.');
  }
  const legend=[['var(--good)','Mastered'],['var(--bad)','Needs work'],['var(--surface2)','Not yet mastered']].map(([cc,l])=>`<span style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600"><span style="width:12px;height:12px;border-radius:6px;background:${cc}"></span>${l}</span>`).join('');
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Progress','where you stand')}
    ${rankBlock}
    ${(()=>{ /* The Word Atlas, in its own words */
      const nx=(typeof window.SB_TRAIL_NEXT==='function')?SB_TRAIL_NEXT():null;
      if(!nx) return '';
      const pct=Math.round((nx.total?nx.done/nx.total:0)*100);
      return `<div class="sb-card" style="margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:13px;flex-wrap:wrap">
          <span style="width:74px;height:52px;flex-shrink:0;border-radius:12px;overflow:hidden">${paintedTileArt(nx.world,52)}</span>
          <span style="min-width:0;flex:1">
            <span class="sb-cs">The Word Atlas · Tier ${nx.lap} of 3</span>
            <span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15;margin-top:2px">${esc(nx.allDone?('Tier '+nx.lap+' complete'):nx.title)}</span>
            <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:650;margin-top:2px">${esc(nx.act)} · ${nx.done} of ${nx.total} stops this tier</span>
          </span>
          <button data-act="openTrail" style="padding:10px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:13px;white-space:nowrap">Open the map →</button>
        </div>
        <div style="height:7px;border-radius:999px;background:var(--tint-deep,var(--surface2));overflow:hidden;margin-top:12px"><div style="height:100%;background:var(--action,var(--accent));width:${pct}%"></div></div>
      </div>`; })()}
    ${(()=>{ /* Practice, in its own words: Stage and mastery, never a level */
      const k=activeListKey(); const st=listStages(k)||[]; const si=listStageIdx(c,k);
      const ws=encounteredWords(k)||[]; const m=ws.filter(w=>state.luMastered[nkey(w.w)]).length;
      const pct=ws.length?Math.round(m/ws.length*100):0;
      const others=activatedListKeys().filter(x=>x!==k).slice(0,3);
      return `<div class="sb-card" style="margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span style="min-width:0;flex:1">
            <span class="sb-cs">Word Gym · now training</span>
            <span style="display:block;font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15;margin-top:2px">${esc(listLabel(k).split(' · ')[0])}</span>
            <span style="display:block;font-size:12.5px;color:var(--muted);font-weight:650;margin-top:2px">${k==='journey'?(si<CHAMP_LEVELS?('Stage '+(si+1)+' of '+CHAMP_LEVELS+' to Champ'):('Champion’s Library · stage '+(si+1))):('Stage '+(si+1)+(st.length?(' of '+st.length):''))} · ${m} of ${ws.length} words met are mastered</span>
          </span>
          <button data-act="openCoach" style="padding:10px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:13px;white-space:nowrap">Open Word Gym →</button>
        </div>
        <div style="height:7px;border-radius:999px;background:var(--tint-deep,var(--surface2));overflow:hidden;margin:12px 0 0"><div style="height:100%;background:var(--good);width:${pct}%"></div></div>
        ${others.length?`<div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:11px">${others.map(x=>`<button data-act="selectList" data-arg="${escA(x)}" style="display:inline-flex;align-items:center;gap:6px;padding:5px 11px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-size:12px;font-weight:800;color:var(--muted)">${esc(listLabel(x).split(' · ')[0])} · Stage ${listStageIdx(c,x)+1}</button>`).join('')}</div>`:''}
      </div>`; })()}
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
          <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11px;font-weight:700;color:var(--muted)">${a===b2?('Band '+a):('Bands '+a+'–'+b2)}</div>
          <div style="font-size:12px;font-weight:800;line-height:1.15;margin-top:3px;${on?'color:var(--accent)':''}">${label}</div></div>`; }).join('');
      return `<div class="sb-card" style="margin-bottom:18px">
        <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin-bottom:3px"><span style="font-family:var(--display);font-weight:800;font-size:15px">Your word difficulty</span><span style="font-size:12px;color:var(--muted);font-weight:650">${bb.calibrating?'calibrating — appears after ~30 graded words':('Word difficulty '+bb.band+' of 9 · '+bb.tier+(bb.n>=2?(' · '+bb.acc+'% right at this band'):''))}</span></div>
        <p style="margin:0 0 12px;font-size:12.5px;color:var(--muted);line-height:1.5">One skill measure across everything — the Word Gym, games, duels and tests all feed it. It climbs the moment you prove a harder band (80%+ right) and never falls from one bad game — only a sustained slide moves it down. Your games and daily tip follow it automatically.</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">${row}</div>
      </div>`; })()}
    <div style="margin-bottom:18px">${goodDaysCard()}</div>
    ${metricsCard(c)}
    ${ttAnalyticsCard(c)}
    ${(()=>{ const ec=explorerCard(c,{title:'Your Bizzing Bee world',sub:'Everywhere you’re exploring — the arcade, quotes, journeys, typing and more.'}); return ec?`<div style="margin-bottom:18px">${ec}</div>`:''; })()}
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
  const chips=top.map(m=>`<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);font-weight:700;font-size:12px"><span style="font-family:var(--display);font-variant-numeric:tabular-nums">${esc(m.w)}</span>${(m.n>1)?`<span style="color:var(--bad);font-weight:800">×${m.n}</span>`:''}</span>`).join('');
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
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">${a.right}/${a.done}${a.done?(' · '+acc+'%'):''}</span>
        ${hasDetail?`<span style="color:var(--accent);font-size:12px">${open?'▲':'▼'}</span>`:'<span style="width:12px"></span>'}
      </button>
      ${(open&&hasDetail)?`<div style="padding:0 13px 12px;font-size:12px;color:var(--muted);line-height:1.6"><b style="color:var(--bad)">Missed:</b> <span style="font-family:var(--display);font-variant-numeric:tabular-nums">${a.misses.map(esc).join(', ')}</span></div>`:''}
    </div>`; }).join('');
  return `<div class="sb-card" style="margin-top:18px">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">Activity log</div>
    <div style="font-size:12px;color:var(--muted);margin-bottom:12px">Everything ${esc(c.name||'your speller')} has done — tap a row to see the missed words.</div>
    ${acts.length?rows:`<p style="margin:0;font-size:13px;color:var(--muted)">No activity yet. Play a game or a practice round and it’ll show up here.</p>`}
  </div>`; }
function actIcon(kind){ return ({practice:'pencil',buzz:'flame',beat:'target',boss:'crown',meaning:'book',spell:'spark',origin:'grid',written:'pencil',oral:'volume',concept:'grid'})[kind]||'spark'; }
/* CERTIFICATES (FIX-BEE v2 T9, FAMILY-STANDARD §13). One for every region of the Atlas walked end to
   end, and one for every Stage mastered on evidence (c.mastPaid). It shows the first name, the child's
   avatar, Bizzy, and what was mastered; it is made on the device as a PNG and saved from the
   grown-ups' area only — never shared from a child's screen. */
function certList(c){ c=c||active(); const out=[];
  try{ const T=window.SB_TRAIL; const pd=((c.trail||{}).paid)||{}; const when={};
    for(const k in pd){ const u=k.split(':')[0]; when[u]=Math.max(when[u]||0,+pd[k]||0); }
    ((T&&T.honey&&T.honey.acts)||[]).forEach(a=>{ const us=a.units||[]; if(us.length&&us.every(u=>when[u]!==undefined))
      out.push({ id:'r:'+a.id, kind:'Region', title:String(a.title).replace(/^Act [IVX]+ · /,''), what:`walked all ${us.length} stops of the Word Atlas region`, t:Math.max(...us.map(u=>when[u]||0)) }); }); }catch(e){}
  try{ const mp=c.mastPaid||{}; for(const id in mp){ const i=id.lastIndexOf(':'); const lk=id.slice(0,i), st=+id.slice(i+1);
      let lab=lk; try{ const cat=coachCatalog().find(x=>x.key===lk); if(cat) lab=cat.label||cat.title||lk; }catch(e){}
      out.push({ id:'s:'+id, kind:'Stage', title:`${lab==='default'||lab==='journey'?'The Bizzing Bee Journey':lab} · Stage ${st+1}`, what:'mastered every word of the Stage — right on two different days', t:+mp[id]||0 }); } }catch(e){}
  return out.sort((a,b)=>b.t-a.t); }
function certCard(){ const c=active(); if(!c) return ''; const L=certList(c);
  return `<div class="sb-card" style="margin-top:16px;padding:16px 18px;border-radius:16px;background:var(--bg2);box-shadow:0 0 0 1px var(--line)">
    <h3 style="font-family:var(--display);font-size:17px;margin:0 0 4px">${iconSVG('medal',18)} Certificates</h3>
    <div style="font-size:13px;color:var(--muted);margin-bottom:10px">One for each region walked end to end and each Stage mastered. Made on this device as a picture — save it, print it or send it to family.</div>
    ${L.length?L.map((x,i)=>`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)">
      <span style="flex:1;min-width:0"><b>${esc(x.title)}</b><span style="display:block;font-size:12px;color:var(--muted)">${x.kind}${x.t?' · '+new Date(x.t).toLocaleDateString():''}</span></span>
      <button class="bz-btn" data-act="certPng" data-arg="${escA(x.id)}" style="min-height:44px">Save as picture</button></div>`).join('')
      :`<div style="font-size:13px;color:var(--muted)">${esc(c.name)}'s first certificate arrives when a region of the Atlas is walked end to end, or a Stage is mastered.</div>`}
  </div>`; }
function certDraw(x, c, withAv){ return new Promise(res=>{ const W=1600,H=1130; const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const g=cv.getContext('2d');
  const gr=g.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#FFF8E6'); gr.addColorStop(1,'#FCE7B2'); g.fillStyle=gr; g.fillRect(0,0,W,H);
  g.strokeStyle='#E8A81C'; g.lineWidth=18; g.strokeRect(40,40,W-80,H-80); g.strokeStyle='#241E33'; g.lineWidth=3; g.strokeRect(72,72,W-144,H-144);
  g.fillStyle='#241E33'; g.textAlign='center';
  const F=(w,sz,f)=>`${w} ${sz}px ${f||"'Fredoka','Trebuchet MS',sans-serif"}`;
  g.font=F(700,34); g.fillText('BIZZING BEE · CERTIFICATE', W/2, 170);
  g.font=F(800,96); g.fillText(String(c.name||'').slice(0,24), W/2, 600);
  g.font=F(600,40,"'Nunito','Segoe UI',sans-serif"); g.fillText(x.what, W/2, 680);
  g.font=F(800,58); g.fillText(x.title.slice(0,46), W/2, 770);
  g.font=F(600,30,"'Nunito','Segoe UI',sans-serif"); g.fillStyle='#5b5470'; g.fillText((x.t?new Date(x.t):new Date()).toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'}), W/2, 860);
  g.fillText('Earned on evidence: right answers, on more than one day.', W/2, 910);
  const imgs=[]; const add=(src,x0,y0,s)=>imgs.push(new Promise(r=>{ const im=new Image(); im.onload=()=>{ try{ g.drawImage(im,x0,y0,s,s); }catch(e){} r(); }; im.onerror=()=>r(); im.src=src; }));
  try{ const m=mascotSVG('happy'); add('data:image/svg+xml;charset=utf-8,'+encodeURIComponent(m.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"')), W-430, 230, 260); }catch(e){}
  if(withAv){ try{ const h=String(avatarSVG(c.avatar||'bizzy',384)||''); const m=h.match(/<img[^>]*src="([^"]+)"/);
      const src=m?m[1]:(/^\s*<svg/.test(h)?'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(/xmlns=/.test(h)?h:h.replace('<svg','<svg xmlns="http://www.w3.org/2000/svg"')):''); if(src) add(src,170,230,260); }catch(e){} }
  Promise.all(imgs).then(()=>res(cv)); }); }
function viewParent(){
  const S=state;
  /* THE PLAN CARD SAYS TODAY'S RULE (road to 4.5, P0.23), read from the family engine (sbRule, BZ_AVATARS):
     worlds 1–2 free; the rest with the family plan or one at a time for coins the child EARNED. It said
     two worlds and "Level-Up to Level 5 … or go Premium" — a ladder that no longer opens anything — while the
     Shop sold worlds 3–8 for coins, and its button opened the old Premium page with prices the plans do
     not charge. It opens the plan sheet (SB_TIERS) now. Guard: tests/trust-v2.cjs §7. */
  const fam=familyPlan(), R=sbRule()||{}; let tierName=''; try{ tierName=SB_ENT.isPaid()?SB_ENT.tier().name:''; }catch(e){}
  const avLine=R.rare?` Avatars: Commons are free; Rares ${R.rare} coins, Epics ${R.epic}, a Legendary ${R.legendary} after its learning milestone — always coins earned by learning, never money.`:'';
  const sub=fam
    ? {ic:'crown',title:(tierName?tierName+' · ':'')+'family plan',body:`Every world is open${R.n?' — all '+R.n:''}, with its avatar packs.`+avLine,btn:'Manage plan',btnStyle:'padding:10px 16px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13px',cardStyle:'background:linear-gradient(135deg,color-mix(in srgb,var(--accent) 16%,var(--bg2)),var(--bg2));border:1px solid var(--accent);border-radius:20px;padding:20px;box-shadow:var(--glow)'}
    : {ic:'spark',title:'Free plan',body:worldRuleTxt()+avLine,btn:'See the plans',btnStyle:'padding:10px 18px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)',cardStyle:'background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:20px;box-shadow:var(--sh-rest)'};
  const kids=(S.children.length?S.children:[demo()]).map((k,i)=>`<div style="background:var(--bg2);border:1px solid ${i===S.activeIdx?'var(--accent)':'var(--line)'};border-radius:14px;padding:18px">
      <div style="display:flex;align-items:center;gap:13px;margin-bottom:16px"><div style="width:60px;height:60px;border-radius:16px;background:var(--surface2);display:grid;place-items:center">${avatarSVG(k.avatar,44)}</div>
        <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-weight:800;font-size:17px">${esc(k.name)}</div><div style="font-size:12px;color:var(--muted);font-weight:600">Ages ${ageBandOf(k).n} · ${THEME_LABEL[k.theme]||'Bizzing Bee'}</div></div>
        <button data-act="selectChild" data-arg="${i}" style="padding:7px 13px;border-radius:10px;font-weight:800;font-size:12px;${i===S.activeIdx?'background:var(--chip);color:var(--accent)':'background:var(--surface2);color:var(--text)'}">${i===S.activeIdx?'Active':'Switch'}</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:9px">
        ${(()=>{ /* A band nobody has measured yet says so in words (audit v4 §4): this tile printed '…'
             for every child still calibrating, which read as a value that had not loaded. */
          const kb=beeBand(k), ev=Math.round(bandEvidence(k));
          return kb.calibrating
            ? `<div class="sb-pz-band" data-band="none" style="background:var(--surface);border-radius:10px;padding:11px;text-align:center" title="Word difficulty is measured from graded words — about ${BAND_MIN_EV} of them, or the placement test"><div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.3">Not yet</div><div style="font-size:11px;color:var(--muted);font-weight:650;line-height:1.3">after ~${BAND_MIN_EV} graded words · ${Math.min(ev,BAND_MIN_EV)} so far</div><div style="font-size:12px;color:var(--muted);font-weight:700;margin-top:2px">WORD DIFFICULTY</div></div>`
            : `<div class="sb-pz-band" data-band="${kb.band}" style="background:var(--surface);border-radius:10px;padding:11px;text-align:center" title="${bandTier(kb.band)} — proven difficulty band across all activities"><div style="font-family:var(--display);font-weight:800;font-size:17px">${kb.band} of 9</div><div style="font-size:12px;color:var(--muted);font-weight:700">WORD DIFFICULTY</div></div>`; })()}
        <div style="background:var(--surface);border-radius:10px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:17px">${k.acc||0}%</div><div style="font-size:12px;color:var(--muted);font-weight:700">ACCURACY</div></div>
        <div style="background:var(--surface);border-radius:10px;padding:11px;text-align:center"><div style="font-family:var(--display);font-weight:800;font-size:17px">${goodDaysThisWeek(k)}</div><div style="font-size:12px;color:var(--muted);font-weight:700">GOOD DAYS THIS WEEK</div></div>
      </div>
      ${S.children.length?(S.delSpeller===i
        ? `<div style="margin-top:11px;padding:11px 12px;border-radius:11px;background:color-mix(in srgb,var(--bad,#D6453A) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--bad,#D6453A) 34%,transparent)">
            <div style="font-size:12.5px;line-height:1.5;font-weight:650;margin-bottom:9px">Delete ${esc(k.name)} and everything they have earned? Progress, words, coins and levels go permanently — here and in any backup.</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><button data-act="delSpeller" data-arg="${i}" style="padding:8px 14px;border-radius:9px;background:var(--bad,#D6453A);color:#fff;font-weight:800;font-size:12.5px">Delete permanently</button><button data-act="askDelSpeller" data-arg="${i}" style="padding:8px 14px;border-radius:9px;background:var(--surface2);color:var(--text);font-weight:800;font-size:12.5px">Cancel</button></div></div>`
        : `<div style="margin-top:10px;text-align:right"><button data-act="askDelSpeller" data-arg="${i}" style="padding:6px 11px;border-radius:8px;background:transparent;color:var(--muted);font-weight:700;font-size:12px">Remove speller</button></div>`):''}
      </div>`).join('');
  const parentBtns=`<button data-act="printReport" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13px;border:1px solid var(--line)">${iconSVG('print',15)} Weekly report</button><button data-act="addChild" style="display:inline-flex;align-items:center;gap:6px;padding:10px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('plus',15)} Add child</button>`;
  const oneThing=(()=>{ try{ const t=parentTips()[0]; if(!t) return '';
    return `<div class="sb-card" style="margin-bottom:16px;background:linear-gradient(100deg,color-mix(in srgb,var(--treasure,#F0B429) 14%,var(--paper,var(--bg2))),var(--paper,var(--bg2)) 65%)">
      <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:5px">🌙 Tonight's one thing</div>
      <div style="font-size:14px;line-height:1.55;font-weight:600">${t.text}</div></div>`; }catch(e){ return ''; } })();
  return `<div style="animation:sb-rise .35s ease both">
    ${pageHead('Parent dashboard','',`Track ${esc(active().name||'your speller')}, manage spellers and print a weekly report.`,parentBtns)}
    ${oneThing}
    <div style="${sub.cardStyle}"><div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap"><div style="width:46px;height:46px;border-radius:14px;background:var(--chip);color:var(--accent);display:grid;place-items:center;flex-shrink:0">${iconSVG(sub.ic,26)}</div>
      <div style="min-width:0;flex:1 1 220px"><div style="font-family:var(--display);font-weight:800;font-size:17px">${sub.title}</div><div style="font-size:13px;color:var(--muted)">${sub.body}</div></div>
      <button data-act="openTiers" style="${sub.btnStyle}">${sub.btn}</button></div></div>
    ${advParentLine()}
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin:20px 2px 12px">Spellers</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px">${kids}</div>
    <div style="margin-top:18px">${reportCardHTML(active())}${parentAnalytics()}</div>
    ${explorerCard(active(),{mt:true,title:'Beyond spelling',sub:'Enrichment and engagement across the whole app — not just word drills.'})}
    ${parentReviseCard()}
    ${parentActivityCard()}
    ${(()=>{ const rs=state.wordReports||[]; if(!rs.length) return '';
      return `<div class="sb-card" style="margin-top:18px">
        <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:6px"><span style="font-family:var(--display);font-weight:800;font-size:15px">${iconSVG('flag',14,2.4)} Reported word fixes</span><span class="sb-cn">${rs.length} flagged by your speller</span>
          <span style="margin-left:auto;display:inline-flex;gap:7px"><button data-act="copyReports" style="padding:7px 13px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--text)">Copy all</button><button data-act="clearReports" style="padding:7px 13px;border-radius:10px;background:transparent;border:1px solid var(--line);font-weight:800;font-size:12px;color:var(--muted)">Clear</button></span></div>
        <div style="display:grid;gap:6px;max-height:220px;overflow-y:auto">${rs.slice().reverse().map(r=>`<div style="background:var(--surface2);border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:12.5px"><b>${esc(r.w)}</b> — ${esc(r.issue)} <span style="color:var(--muted)">· ${esc(r.when)}</span>${r.d?`<div style="color:var(--muted);margin-top:2px">meaning: ${esc(trunc(r.d,110))}</div>`:''}</div>`).join('')}</div>
        <div class="sb-cn" style="margin-top:8px">The app is fully offline — copy these and share them with us to get the dictionary corrected.</div>
      </div>`; })()}
    ${cloudCard()}
    ${certCard()}
    ${backupCard()}
    <div class="sb-card" style="margin-top:18px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">Countdown</div>
      <div style="font-size:13px;color:var(--muted);margin-bottom:14px">${(()=>{ const ms=milestone(); return ms?esc(ms.label):'Your next milestone'; })()}</div>
      ${(()=>{ const ms=milestone(); return ms?`<div style="display:flex;align-items:baseline;gap:10px"><div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent)">${ms.days}</div><div style="font-size:13px;color:var(--muted);font-weight:700">days to ${esc(ms.label)} · ${esc(ms.date)}</div></div>`:`<div style="font-size:13px;color:var(--muted);font-weight:650;line-height:1.5">No milestone set. Add your bee day in <button data-act="setNav" data-arg="settings" style="color:var(--accent);font-weight:800;text-decoration:underline;text-underline-offset:2px">Settings</button> to see the countdown.</div>`; })()}
    </div>
  </div>`;
}
function ttAllStats(c){ const out={total:0,practised:0,tested:0,mastered:0,revise:0,touched:0,byTh:{}};
  ttThemes().forEach(th=>{ const st=ttChapterStats(c,th.id); out.byTh[th.id]=st;
    out.total+=st.total; out.practised+=st.practised; out.tested+=st.tested; out.mastered+=st.mastered;
    out.revise+=st.revise; out.touched+=st.touched; });
  return out; }
// ===== Subscription tier sheet (pricing) =====
function tierEntRows(t){ const e=t.ent; const yes='✓', no='—';
  const wc=(e.words>=SB_COUNT.graded()?'All ':'')+fmtN(e.words)+' words';
  /* worlds and their avatar packs are the family engine's rule (sbWorldsFor), not the old plan shape */
  const W=sbWorldsFor(t.id), R=sbRule();
  const worlds=W.all?('Every world'+(W.n?' — all '+W.n:'')):('Worlds 1–'+W.open+(R?' (more for '+R.world+' earned coins each)':''));
  const packs=W.all?'Every avatar pack':'The avatar packs of open worlds';
  const rows=[wc, (e.lists?yes:no)+' Word lists', (e.concepts?yes:no)+' Concepts', (e.trainTools?yes:no)+' Train tools (idioms, typing, vocab, quotes)', (e.games==='all'?'All games':'Basic games'), worlds, packs, (e.startCoins?('🪙 '+fmtN(e.startCoins)+' start coins'):'')];
  return rows.filter(Boolean).map(r=>`<div style="font-size:12.5px;color:var(--text);padding:3px 0;line-height:1.4">${r.charAt(0)==='—'?'<span style="color:var(--muted)">'+esc(r)+'</span>':esc(r)}</div>`).join(''); }
function viewTiersSheet(){ const S=state; const cur=(window.SB_ENT?SB_ENT.tierId():'free'); const up=S.tierUpsell;
  /* Testing unlock overrides every entitlement, so a plan change here looks like it did
     nothing. Say it plainly rather than letting the sheet lie. */
  const devNote=S.devUnlock?`<div style="margin:0 0 14px;padding:11px 14px;border-radius:12px;background:var(--treasure-tint,#FFF3D6);color:var(--treasure-deep,#8A5B00);font-size:13px;line-height:1.5;font-weight:650"><b>Testing unlock is on.</b> Every plan's features are open regardless of what you pick here — switch it off in Settings → Testing tools to see a plan as a family sees it.</div>`:'';
  const col=(id)=>{ const t=SB_TIERS[id]; const isCur=id===cur; const accent=id==='regional'?'#7C5CFF':id==='beginner'?'#E0922E':'#2FA35C';
    const price=t.priceMo?('$'+t.priceMo.toFixed(2)+'/mo · $'+t.priceYr+'/yr'):'Free';
    return `<div style="flex:1;min-width:210px;background:var(--paper,var(--bg2));border:2px solid ${isCur?accent:'var(--line)'};border-radius:16px;padding:16px 15px;display:flex;flex-direction:column;position:relative">
      ${isCur?`<span style="position:absolute;top:-11px;left:15px;background:${accent};color:#fff;font-weight:800;font-size:10.5px;letter-spacing:.05em;text-transform:uppercase;padding:3px 9px;border-radius:99px">Your plan</span>`:''}
      <div style="font-family:var(--display);font-weight:800;font-size:17px">${t.badge} ${esc(t.name)}</div>
      <div style="font-weight:800;font-size:14px;color:${accent};margin:2px 0 3px">${price}</div>
      <div style="font-size:12px;color:var(--muted);line-height:1.4;margin-bottom:10px">${esc(tierBlurb(t))}</div>
      <div style="border-top:1px solid var(--line);padding-top:9px;margin-bottom:12px">${tierEntRows(t)}</div>
      <div style="margin-top:auto">${isCur?`<div style="text-align:center;font-weight:800;font-size:13px;color:${accent};padding:10px">Current ✓</div>`:`<button data-act="chooseTier" data-arg="${id}" style="width:100%;padding:11px;border-radius:11px;background:${accent};color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge)">${id==='free'?'Switch to Free':'Choose '+esc(t.name)}</button>`}</div>
    </div>`; };
  const addon=SB_ADDONS.advanced;
  return `<div style="position:fixed;inset:0;z-index:135;display:grid;place-items:center;padding:18px;background:rgba(20,12,4,.55);overflow:auto" data-act="closeTiers">
    <div data-act="noop" style="background:var(--bg1,#f6f2ff);border-radius:22px;max-width:820px;width:100%;padding:22px;box-shadow:0 24px 70px rgba(20,10,30,.5);animation:sb-pop .3s ease both;max-height:92vh;overflow:auto">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px"><span style="font-family:var(--display);font-weight:800;font-size:20px">Choose your plan</span><button data-act="closeTiers" style="margin-left:auto;width:34px;height:34px;border-radius:10px;background:var(--surface2);color:var(--muted);font-weight:800">✕</button></div>
      ${devNote}${up?`<div style="font-size:13px;color:var(--accent);font-weight:700;margin-bottom:12px">🔒 ${esc(up.label)} is part of the ${esc((SB_TIERS[up.need]||{}).name||'a higher')} plan — upgrade to unlock it.</div>`:`<div style="font-size:12.5px;color:var(--muted);margin-bottom:12px">Prices in USD. Regional pricing applies at checkout (Phase 2). Change or cancel anytime.</div>`}
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">${['free','beginner','regional'].map(col).join('')}</div>
      <div style="background:var(--surface2);border:1px dashed var(--line);border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <span style="width:40px;height:40px;flex-shrink:0;border-radius:11px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG('spark',22)}</span>
        <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14px">${esc(addon.name)} · +$${addon.priceYr}/yr</span><span style="display:block;font-size:12px;color:var(--muted)">${esc(factFill(addon.blurb))}</span></span>
        ${(()=>{ const owned=(()=>{ try{ return !!SB_ENT.hasAddon('advanced'); }catch(e){ return false; } })();
          if(owned) return `<span style="padding:9px 15px;border-radius:10px;background:var(--mastered-tint,#E1F4E8);color:var(--good,#1f9d57);font-weight:800;font-size:12.5px;white-space:nowrap">Active &#10003;</span>`;
          if(!addon.built) return `<button data-act="buyAddon" data-arg="advanced" style="padding:9px 15px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">Notify me</button>`;
          return `<button data-act="buyAddon" data-arg="advanced" style="padding:11px 17px;border-radius:11px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;white-space:nowrap;box-shadow:var(--edge)">Unlock &middot; $${addon.priceYr}/yr</button>`; })()}
      </div>
      <div style="font-size:11px;color:var(--muted);margin-top:12px;text-align:center">Local preview — real billing (Stripe / Razorpay) connects in Phase 2. Plans are managed by a parent.</div>
    </div></div>`; }
// ===== Parent / admin auth sheet =====
function viewAuthSheet(){ const S=state; const mode=S.authSheet; const signup=mode==='signup';
  return `<div style="position:fixed;inset:0;z-index:136;display:grid;place-items:center;padding:20px;background:rgba(20,12,4,.55)" data-act="closeAuth">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;max-width:380px;width:100%;padding:24px 22px;box-shadow:0 20px 60px rgba(20,10,30,.5);animation:sb-pop .3s ease both">
      <div style="font-family:var(--display);font-weight:800;font-size:20px;margin-bottom:3px">${signup?'Create parent account':'Parent sign in'}</div>
      <div style="font-size:12.5px;color:var(--muted);margin-bottom:16px">${'Accounts are for grown-ups — kids just play. '+((window.SB_AUTH&&SB_AUTH.isCloud)?'Your email is the account; your child never signs in to anything.':'(Local preview — this account stays on this device.)')}</div>
      ${signup?`<input data-inp="authName" placeholder="Your name" autocomplete="off" style="width:100%;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:600;margin-bottom:10px;outline:none">`:''}
      <input data-inp="authEmail" placeholder="you@email.com" autocomplete="off" autocapitalize="off" style="width:100%;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:600;margin-bottom:10px;outline:none">
      <input data-inp="authPw" type="password" placeholder="Password" autocomplete="off" style="width:100%;padding:12px 14px;border-radius:12px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:14px;font-weight:600;margin-bottom:${S.authErr?'8':'16'}px;outline:none">
      ${S.authErr?`<div style="font-size:12.5px;color:var(--bad,#D6453A);font-weight:700;margin-bottom:14px">${esc(S.authErr)}</div>`:''}
      <button data-act="${signup?'doSignUp':'doSignIn'}" style="width:100%;padding:13px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge);margin-bottom:10px">${signup?'Create account':'Sign in'}</button>
      <div style="text-align:center;font-size:12.5px;color:var(--muted)">${signup?'Have an account?':'No account yet?'} <button data-act="openAuth" data-arg="${signup?'signin':'signup'}" style="color:var(--accent);font-weight:800;background:none;border:0;cursor:pointer">${signup?'Sign in':'Create one'}</button> · <button data-act="closeAuth" style="color:var(--muted);font-weight:700;background:none;border:0;cursor:pointer">Cancel</button></div>
    </div></div>`; }
/* ===== Cloud backup: the consent screen, the off switch, and restore =====
   The consent screen is deliberately wordy. It is the one place a parent decides that
   something about their child leaves the device, and a switch labelled "sync" would
   not be consent to anything. What it promises is enforced in supabase-sync.js
   (an allow-list of fields) and in the schema (no column for a name or an age). */
function viewCloudSheet(){ const S=state; const m=S.cloudSheet;
  const wrap=(inner,wide)=>`<div style="position:fixed;inset:0;z-index:137;display:grid;place-items:center;padding:20px;background:rgba(20,12,4,.55)" data-act="closeCloud">
    <div data-act="noop" style="background:var(--paper,#fff);border-radius:20px;max-width:${wide?'520px':'420px'};width:100%;max-height:86vh;overflow:auto;padding:24px 22px;box-shadow:0 20px 60px rgba(20,10,30,.5);animation:sb-pop .3s ease both">${inner}</div></div>`;
  const err=S.cloudErr?`<div style="font-size:12.5px;color:var(--bad,#D6453A);font-weight:700;margin:10px 0 0">${esc(S.cloudErr)}</div>`:'';
  if(m==='off') return wrap(`
    <div style="font-family:var(--display);font-weight:800;font-size:19px;margin-bottom:6px">Turn cloud backup off?</div>
    <div style="font-size:13.5px;line-height:1.6;color:var(--muted)">This withdraws your consent and <b style="color:var(--text)">deletes everything already uploaded</b> — every speller record and every progress record on your account. Nothing on this device is touched; your child keeps playing exactly as they are.</div>
    <div style="display:flex;gap:9px;margin-top:18px">
      <button data-act="cloudOff" style="flex:1;padding:13px;border-radius:12px;background:var(--bad,#D6453A);color:#fff;font-weight:800;font-size:14px">${S.cloudBusy?'Deleting…':'Turn off &amp; delete'}</button>
      <button data-act="closeCloud" style="padding:13px 18px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px">Keep it on</button>
    </div>${err}`);
  if(m==='restore'){
    const list=S.cloudList;
    const body = list===null
      ? `<div style="font-size:13px;color:var(--muted);padding:14px 0">Looking for backed-up spellers…</div>`
      : (!list.length
        ? `<div style="font-size:13px;color:var(--muted);padding:14px 0">No backed-up spellers on this account yet.</div>`
        : list.map((r,i)=>{
            const here=(S.children||[]).some(c=>c.cid===r.row.id);
            const when=r.updated_at?new Date(r.updated_at).toLocaleDateString():'';
            return `<div style="border:1px solid var(--line);border-radius:14px;padding:13px;margin-bottom:10px">
              <div style="display:flex;align-items:center;gap:11px;margin-bottom:${here?'0':'10px'}">
                <div style="width:42px;height:42px;border-radius:12px;background:var(--surface2);display:grid;place-items:center">${avatarSVG(r.row.avatar||'bizzy',30)}</div>
                <div style="min-width:0;flex:1"><div style="font-weight:800;font-size:14.5px">${esc(r.row.display_name||'Speller')} · Level ${+r.row.spell_level||1}</div>
                  <div style="font-size:12px;color:var(--muted)">${when?'Last saved '+esc(when):'Backed up'}</div></div>
                ${here?'<span style="font-size:12px;font-weight:800;color:var(--muted)">On this device</span>':''}</div>
              ${here?'':`<div style="display:flex;gap:8px;flex-wrap:wrap">
                <input id="cldn-${i}" placeholder="First name or nickname" style="flex:1;min-width:140px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:13.5px;font-weight:600;outline:none">
                <select id="clda-${i}" aria-label="Age range" style="min-height:44px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-size:13.5px;font-weight:600">${AGE_BANDS.map(b=>`<option value="${b.k}"${b.k===bandForAge(9).k?' selected':''}>Ages ${b.n}</option>`).join('')}</select>
                <button data-act="cloudAdd" data-arg="${i}" style="padding:10px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Restore</button></div>`}
            </div>`; }).join(''));
    return wrap(`
      <div style="font-family:var(--display);font-weight:800;font-size:19px;margin-bottom:4px">Restore a speller</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:14px">Their progress is on your account. Their <b style="color:var(--text)">name and age range were never uploaded</b>, so add those here — they stay on this device.</div>
      ${body}${err}
      <button data-act="closeCloud" style="width:100%;padding:12px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13.5px;margin-top:4px">Done</button>`,true);
  }
  const signed=(window.SB_AUTH&&SB_AUTH.current())||null;
  const yes=(t)=>`<li style="margin-bottom:5px">${t}</li>`;
  return wrap(`
    <div style="font-family:var(--display);font-weight:800;font-size:19px;margin-bottom:4px">Back up your spellers' progress</div>
    <div style="font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:14px">So a lost, wiped or replaced tablet does not cost months of practice — and so the same progress opens on a second device.</div>
    <div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px">
      <div style="font-weight:800;font-size:13px;margin-bottom:6px">What gets uploaded</div>
      <ul style="margin:0 0 12px 16px;padding:0;font-size:13px;color:var(--muted);line-height:1.5">
        ${yes('A label taken from their avatar — “Fox”, “Panda”')}${yes('Their spelling level, avatar and world')}${yes('Practice progress: words, scores, coins, days practised')}</ul>
      <div style="font-weight:800;font-size:13px;margin-bottom:6px">What never leaves this device</div>
      <ul style="margin:0 0 0 16px;padding:0;font-size:13px;color:var(--muted);line-height:1.5">
        ${yes('<b style="color:var(--text)">The name you typed for them</b> — real name or nickname, neither is uploaded')}${yes('<b style="color:var(--text)">Their age</b>')}${yes('Anything else that could identify them — the database has no column for it')}</ul>
    </div>
    <div style="font-size:12.5px;color:var(--muted);line-height:1.55;margin-bottom:14px">Records are stored against a random id on our database host, Supabase, and are readable only by your account. You can turn this off and delete everything in one tap, any time. <a href="privacy.html" style="color:var(--accent);font-weight:700">Read the full notice →</a></div>
    ${signed
      ? `<button data-act="cloudAgree" style="width:100%;padding:13px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">${S.cloudBusy?'Turning on…':'I’m the parent — turn backup on'}</button>`
      : `<button data-act="openAuth" data-arg="signup" style="width:100%;padding:13px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Create a parent account first</button>`}
    ${err}
    <button data-act="closeCloud" style="width:100%;padding:11px;border-radius:12px;background:transparent;color:var(--muted);font-weight:800;font-size:13px;margin-top:8px">Not now</button>`);
}
function bkNames(children){ return (children||[]).map(c=>String((c&&c.name)||'').trim().toLowerCase()).filter(Boolean); }
function backupBlob(){ try{ save(); }catch(e){}
  const keys={}; bkKeys(false).forEach(k=>{ keys[k]=SB_STORE.getKey(k); });
  const names=bkNames(state.children); const family={};
  try{ const w=SB_STORE.getJSON('wallet',null); if(w&&w.kids){ const kids={}; names.forEach(n=>{ if(w.kids[n]) kids[n]=w.kids[n]; }); if(Object.keys(kids).length) family['bizzing.wallet']={v:w.v||1,kids}; } }catch(e){}
  try{ const a=SB_STORE.getJSON('activity',null); if(a&&Array.isArray(a.s)){ const s=a.s.filter(x=>x&&x.a==='bee'&&names.indexOf(String(x.who||'').trim().toLowerCase())>=0); if(s.length) family['bizzing.activity']={v:a.v||1,s}; } }catch(e){}
  return { app:'bizzing-bee', kind:'household-backup', v:1, at:Date.now(), keys, family }; }
function backupFileName(){ const n=(state.children||[]).map(c=>String((c&&c.name)||'').replace(/[^A-Za-z0-9]/g,'')).filter(Boolean).join('-');
  return 'bizzing-bee-'+(n||'household')+'-'+todayKey()+'.json'; }
function bkFamilyDrop(names){ try{ const a=SB_STORE.getJSON('activity',null);
    if(a&&Array.isArray(a.s)){ a.s=a.s.filter(x=>!(x&&x.a==='bee'&&names.indexOf(String(x.who||'').trim().toLowerCase())>=0)); SB_STORE.setJSON('activity',a); } }catch(e){} }
function eraseHousehold(){ const names=bkNames(state.children); bkKeys(true).forEach(k=>{ try{ SB_STORE.delKey(k); }catch(e){} }); bkFamilyDrop(names); }
function backupCard(){ const S=state; const ask=S.bkAsk; const btn=bkBtn;
  const restoreConfirm=bkRestoreConfirm();
  const eraseConfirm=ask==='erase'?`<div class="sb-bk-confirm" style="margin-top:12px;padding:12px;border-radius:11px;background:color-mix(in srgb,var(--bad,#D6453A) 10%,var(--surface));border:1px solid color-mix(in srgb,var(--bad,#D6453A) 34%,transparent)">
      <div style="font-size:13px;line-height:1.5;font-weight:650;margin-bottom:9px">Erase everything Bizzing Bee keeps on this device — every speller, their words, progress and settings — and start again? This cannot be undone unless you have a backup file. Bizzing coins are shared with your family's other Bizzing apps and stay in the family wallet.</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${btn('bkEraseGo','Erase everything','var(--bad,#D6453A)','#fff')}${btn('bkCancel','Cancel','var(--surface)','var(--text)','var(--line)')}</div></div>`:'';
  return `<div class="sb-card sb-backup" style="margin-top:18px">
    <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">Backup, restore &amp; erase</div>
    <div style="font-size:12.5px;color:var(--muted);line-height:1.5;margin-bottom:12px">The whole household in one file on your own device — nothing is sent anywhere. Each of these asks for the grown-up PIN again. The PIN is a deterrent, not a lock.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      ${btn('bkDownload','⬇ Download a backup','var(--accent)','#fff')}
      <label style="display:inline-flex;align-items:center;gap:6px;padding:10px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13px;cursor:pointer">⬆ Restore from a file<input type="file" accept=".json,application/json" data-file="bkPick" aria-label="Restore from a backup file" style="position:absolute;width:1px;height:1px;opacity:0;overflow:hidden"></label>
      ${btn('bkAskErase','Erase everything…','transparent','var(--bad,#D6453A)','color-mix(in srgb,var(--bad,#D6453A) 45%,transparent)')}
    </div>
    ${S.bkMsg?`<div class="sb-bk-msg" role="status" style="margin-top:10px;font-size:12.5px;font-weight:700;color:${S.bkMsg.bad?'var(--bad)':'var(--good)'}">${esc(S.bkMsg.t)}</div>`:''}
    ${restoreConfirm}${eraseConfirm}
  </div>`; }
function cloudCard(){
  const st=(window.SB_SYNC&&SB_SYNC.status())||{configured:false};
  const signed=(window.SB_AUTH&&SB_AUTH.current())||null;
  const when=(t)=>t?new Date(t).toLocaleString():'never';
  let body, ctrl;
  if(!st.configured){
    body='Everything in this app — names, ages, progress, scores — lives in this browser on this device. Nothing leaves it unless a grown-up switches on the optional cloud backup, and a child’s name and age never leave it at all. No analytics, no ads, no third parties. Deleting a profile (or clearing this site’s browser data) erases it permanently.';
    ctrl='';
  } else if(!st.consented){
    body='Right now this app is <b>offline only</b> — your child’s names, ages and progress live in this browser and nothing is sent anywhere. You can optionally back up progress to your parent account so a wiped tablet does not cost months of work. Names and ages are never uploaded.';
    ctrl=`<button data-act="openCloud" data-arg="consent" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px;box-shadow:var(--edge)">Set up cloud backup</button>
      <button data-act="cloudRestore" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">Restore a speller</button>`;
  } else {
    body=`Cloud backup is <b>on</b> for ${esc((signed&&signed.email)||'your account')}. Spelling levels, avatars and progress are backed up under an avatar label; <b>names and ages are not, and cannot be</b>. Last backup: ${esc(when(st.lastPush))}.${st.error?' <span style="color:var(--bad,#D6453A)">Last attempt failed: '+esc(st.error)+'</span>':''}`;
    ctrl=`<button data-act="cloudPush" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px;box-shadow:var(--edge)">Back up now</button>
      <button data-act="cloudRestore" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">Restore a speller</button>
      <button data-act="openCloud" data-arg="off" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:transparent;border:1px solid var(--line);color:var(--muted);font-weight:800;font-size:12.5px">Turn off &amp; delete</button>`;
  }
  return `<div class="sb-card" style="margin-top:18px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">🔒 Privacy — your child's data</div>
      <div style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:10px">${body}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">${ctrl}
        <a href="privacy.html" style="display:inline-flex;align-items:center;gap:6px;padding:9px 15px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px;text-decoration:none">Read the full Privacy &amp; Parents' Notice →</a></div>
    </div>`;
}

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrGrown) */
Object.assign(app, {
  progTab:(k)=>{ if(k==='parent'){ pinGate(()=>set({progTab:'parent'}),'Parent zone'); return; } set({progTab:'me'}); },
  closeTiers:()=>set({showTiers:false, showPaywall:false, tierUpsell:null}),
  chooseTier:(id)=>{ const c=active(); if(!window.SB_TIERS||!SB_TIERS[id]) return; SB_ENT.setTier(c,id); try{ state.premium=SB_ENT.isPaid(); }catch(e){} save(); try{ sfx(id==='free'?'tick':'win'); }catch(e){} if(id!=='free') burstConfetti(80); flash(id==='free'?'Switched to Free':('You’re on '+SB_TIERS[id].name+' 🎉')); render(); },
  buyAddon:(k)=>{ const c=active(); if(!window.SB_ADDONS||!SB_ADDONS[k]) return;
    if(!SB_ADDONS[k].built){ flash(SB_ADDONS[k].name+' is coming soon — you’ll be first to know'); return; }
    c.addons=c.addons||{}; c.addons[k]=1; save();
    // the advanced pack IS Advanced Mode; owning it switches the mode on, and the reveal
    // card then fires from render() off c.advOn
    if(k==='advanced'){ try{ if(window.ADV&&ADV.activate) ADV.activate(); }catch(e){} set({showTiers:false, tierUpsell:null}); return; }
    flash(SB_ADDONS[k].name+' added'); render(); },
  closeAuth:()=>set({authSheet:null, authErr:null}),
  authEmail:(v)=>{ state.auth_email=v; },
authPw:(v)=>{ state.auth_pw=v; },
authName:(v)=>{ state.auth_name=v; },
  /* signIn/signUp return a value in local mode and a promise once a backend is
     configured. Promise.resolve() flattens both, so neither path needs its own
     branch and a build with no backend behaves exactly as it always did. */
  doSignIn:()=>{ set({authErr:null, authBusy:true});
    Promise.resolve(SB_AUTH.signIn(state.auth_email||'', state.auth_pw||'')).then(r=>{
      state.authBusy=false;
      if(!r || r.error){ set({authErr:(r&&r.error)||'Could not sign in'}); return; }
      state.auth_pw='';
      set({authSheet:null}); flash('Signed in as '+esc((r.user&&(r.user.name||r.user.email))||'you'));
    }); },
  doSignUp:()=>{ set({authErr:null, authBusy:true});
    Promise.resolve(SB_AUTH.signUp(state.auth_email||'', state.auth_pw||'', state.auth_name||'')).then(r=>{
      state.authBusy=false;
      if(!r || r.error){ set({authErr:(r&&r.error)||'Could not create the account'}); return; }
      state.auth_pw='';
      /* Confirm-by-email is on by default in Supabase, so sign-up can succeed with
         no session yet. Saying that plainly beats a spinner that never resolves. */
      if(r.pending){ set({authErr:null}); flash(r.message||'Check your email to confirm the account'); return; }
      set({authSheet:null}); flash('Account created — welcome!');
    }); },
  /* ===== Cloud backup =====
     Every one of these routes through SB_LAZY.need('cloud'), because supabase-sync.js
     arrives on the idle queue and a parent can reach this card before it lands. */
  cloudNeed:(cb)=>{ if(window.SB_SYNC) return cb(); if(window.SB_LAZY) SB_LAZY.need('cloud',()=>cb()); },
  openCloud:(m)=>app.cloudNeed(()=>set({cloudSheet:m||'consent', cloudErr:null, cloudList:null})),
  closeCloud:()=>set({cloudSheet:null, cloudErr:null, cloudList:null}),
  /* The consent event itself. It cannot be reached without a signed-in parent, and the
     sheet that calls it has already spelled out what will and will not be sent — which
     is the whole point of making this a screen rather than a switch. */
  cloudAgree:()=>{ app.cloudNeed(()=>{
      if(!SB_AUTH.current()){ set({cloudErr:'Sign in first — the backup belongs to your account.'}); return; }
      set({cloudBusy:true});
      Promise.resolve(SB_SYNC.giveConsent()).then(()=>SB_SYNC.push()).then(r=>{
        state.cloudBusy=false;
        if(r&&r.error){ set({cloudErr:r.error}); return; }
        set({cloudSheet:null}); flash('Cloud backup is on'); }); }); },
  cloudOff:()=>{ app.cloudNeed(()=>{ set({cloudBusy:true});
      Promise.resolve(SB_SYNC.withdrawConsent()).then(r=>{
        state.cloudBusy=false;
        if(r&&r.error){ set({cloudErr:r.error}); return; }
        set({cloudSheet:null}); flash('Backup off — everything uploaded has been deleted'); }); }); },
  cloudPush:()=>{ app.cloudNeed(()=>{ flash('Backing up…');
      Promise.resolve(SB_SYNC.push()).then(r=>{ render();
        flash(r&&r.error ? 'Could not back up — '+r.error : 'Backed up'); }); }); },
  cloudRestore:()=>{ app.cloudNeed(()=>{ set({cloudSheet:'restore', cloudList:null, cloudErr:null});
      Promise.resolve(SB_SYNC.fetchAll()).then(r=>{
        if(r&&r.error){ set({cloudErr:r.error, cloudList:[]}); return; }
        set({cloudList:(r&&r.kids)||[]}); }); }); },
  /* Restoring asks for the name and the age HERE, on the device, because the server
     was never told them. That is the design working, not a missing field. */
  cloudAdd:(i)=>{ const row=(state.cloudList||[])[+i]; if(!row) return;
    const nEl=document.getElementById('cldn-'+i), aEl=document.getElementById('clda-'+i);
    const nm=((nEl&&nEl.value)||'').trim()||'Speller';
    /* an age RANGE, as onboarding and Settings ask (AGE_BANDS): c.ageBand is the value of record
       and c.age its midpoint (setAgeBand) — this sheet used to take an exact age in a number box */
    const band=(AGE_BANDS.find(b=>b.k===((aEl&&aEl.value)||''))||bandForAge(9)).k;
    if((state.children||[]).some(c=>c.cid===row.row.id)){ flash('That speller is already on this device'); return; }
    const kid=Object.assign({}, row.child, {name:nm}); setAgeBand(kid, band);
    state.children=(state.children||[]).concat([kid]); save();
    flash(esc(nm)+' restored'); set({cloudSheet:null, cloudList:null}); },
  /* Deleting a speller. COPPA gives a parent the right to delete their child's
     information, and the privacy notice says it can be done in the app — so it has to
     actually exist. Two taps, because the second tap destroys months of practice. */
  askDelSpeller:(i)=>set({delSpeller:(state.delSpeller===+i?null:+i)}),
  /* backup · restore · erase (FIX-BEE M3) — each re-asks the PIN at the moment it acts */
  bkDownload:()=>pinGate(()=>{ try{ const txt=JSON.stringify(backupBlob()); const blob=new Blob([txt],{type:'application/json'}); const u=URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=u; a.download=backupFileName(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000);
      state.bkMsg={t:'Saved '+backupFileName()+' — keep it somewhere safe.'}; render(); }catch(e){ state.bkMsg={t:'Could not save the file.',bad:1}; render(); } },'Backup — grown-ups only'),
  bkAskErase:()=>set({bkAsk:(state.bkAsk==='erase'?null:'erase'), bkPending:null, bkMsg:null}),
  bkEraseGo:()=>pinGate(()=>{ bkHalt(); eraseHousehold(); state.bkAsk=null; flash('Erased — Bizzing Bee is starting fresh'); bkHaltAndReload(); },'Erase everything — grown-ups only'),
  delSpeller:(i)=>{ const ch=state.children||[]; const k=ch[+i]; if(!k) return;
    const nm=k.name||'That speller';
    if(k.cid&&window.SB_SYNC) { try{ SB_SYNC.delChild(k.cid); }catch(e){} }
    /* keep the SAME child active (the index shifts when an earlier one goes), and if the
       active child is the one removed, the next one brings their own word book back */
    const wasActive=(+i===(state.activeIdx||0)); const keep=(+i<(state.activeIdx||0))?(state.activeIdx-1):(state.activeIdx||0);
    ch.splice(+i,1);
    state.children=ch;
    state.activeIdx=Math.max(0,Math.min(keep, ch.length-1));
    if(wasActive && ch.length){ try{ SB_SHELL.bookIn(ch[state.activeIdx]); }catch(e){} }
    state.delSpeller=null;
    save();
    if(!ch.length){ flash(esc(nm)+' removed'); set({screen:'onboarding', onbStep:0, addingMore:false, draft:{name:'',age:9,avatar:'bizzy',goal:10}}); return; }
    flash(esc(nm)+' removed — everything of theirs is deleted'); render(); },
  ttList:(st)=>set({ttList:st}),
  ttChapterFrom:(th)=>{ set({ttList:null, nav:'trivtrain', screen:'app'}); app.ttChapter(th); },
  copyReports:()=>{ const rs=state.wordReports||[]; if(!rs.length) return;
    const txt=rs.map(r=>`${r.when} · ${r.w} · ${r.issue}${r.d?' · meaning: '+r.d:''}${r.s?' · sentence: '+r.s:''}`).join('\n');
    try{ navigator.clipboard.writeText(txt).then(()=>flash('Copied '+rs.length+' report'+(rs.length>1?'s':'')+' 📋')); }
    catch(e){ try{ const t=document.createElement('textarea'); t.value=txt; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); flash('Copied 📋'); }catch(e2){ flash('Couldn’t copy'); } } },
  clearReports:()=>{ state.wordReports=[]; save(); render(); flash('Reports cleared'); },
  progHeat:(v)=>set({progHeatKey:v}),
  progHeatPick:(k)=>set({progHeatKey:k}),
  moreTips:()=>set({tipPage:(state.tipPage||0)+1}),
  certPng:(id)=>{ const c=active(); const x=certList(c).find(y=>y.id===id); if(!x) return;
    const out=(cv)=>{ const url=cv.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download=('bizzing-bee-'+(c.name||'certificate')+'-'+x.title).toLowerCase().replace(/[^a-z0-9]+/g,'-').slice(0,70)+'.png'; document.body.appendChild(a); a.click(); a.remove(); state._certMade=a.download; flash('Certificate saved as a picture'); };
    certDraw(x,c,true).then(cv=>{ try{ out(cv); }catch(e){ certDraw(x,c,false).then(cv2=>{ try{ out(cv2); }catch(e2){ flash('Could not make the picture on this device'); } }); } }); },
  reviseMisses:()=>{ const c=active(); const list=(c.missed||[]).slice(0,20); if(!list.length){ flash('No missed words yet — nice work!'); return; } state.sessionWords=list.map(m=>({w:m.w,d:m.d||'',s:m.s||'',p:m.p||'',o:m.o||'',r:m.r||'',y:m.y||3})); state.sessionLabel='Revise misses'; state.gi=0; state.coachSession=false; app.startTrain(); },
  parentLogToggle:(i)=>{ i=+i; set({parentLogOpen: state.parentLogOpen===i?null:i}); },
  printReport:()=>{ try{ const c=active(); ensureLists(c); const t=todayKey();
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to print the report'); return; }
    const played=new Set(c.daysPlayed||[]); const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const last7=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); const k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); last7.push({on:played.has(k), label:dn[d.getDay()]}); }
    const daysThisWeek=last7.filter(x=>x.on).length;
    const RC=reportCard(c); const mastered=RC.mastery.retained;   // one number everywhere: mastered on evidence (FIX-BEE M2)
    const tsKey=(ts)=>{ const d=new Date(ts); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
    const recent=(c.activity||[]).filter(a=>a.ts && dayDiff(tsKey(a.ts), t)<=7);
    const sessions=recent.length; const totDone=recent.reduce((s,a)=>s+(a.done||0),0); const totRight=recent.reduce((s,a)=>s+(a.right||0),0);
    const acc=totDone?Math.round(totRight/totDone*100):0;
    const misses=(c.missed||[]).slice(0,24);
    const ov=listStageIdx(c,activeListKey())+1; const bnd=beeBand(c); const rk=rankOf(c);
    const E=(s)=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const dotRow=last7.map(d=>`<td style="text-align:center;padding:4px"><div style="width:30px;height:30px;border-radius:6px;margin:0 auto;background:${d.on?'#7C5CFF':'#e7e3f5'}"></div><div style="font-size:12px;color:#888;margin-top:3px">${d.label}</div></td>`).join('');
    const missChips=misses.length?misses.map(m=>`<span style="display:inline-block;border:1px solid #ddd;border-radius:20px;padding:3px 10px;margin:3px;font-size:12px;font-family:monospace">${E(m.w)}${m.n>1?(' ×'+m.n):''}</span>`).join(''):'<i style="color:#888">No misses — great week!</i>';
    const html='<!doctype html><html><head><meta charset="utf-8"><title>Bizzing Bee — '+E(c.name)+'</title>'+
      '<style>*{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1a1530;max-width:740px;margin:0 auto;padding:28px}h1{font-size:24px;margin:0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.05em;color:#7C5CFF;margin:26px 0 10px;border-bottom:2px solid #eee;padding-bottom:6px}.row{display:flex;gap:14px;flex-wrap:wrap}.stat{flex:1;min-width:120px;border:1px solid #eee;border-radius:10px;padding:14px;text-align:center}.stat b{display:block;font-size:24px}.stat span{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.04em}@media print{body{padding:0}button{display:none}}</style></head><body>'+
      '<div style="display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #7C5CFF;padding-bottom:12px"><div><div style="font-size:13px;color:#7C5CFF;font-weight:800;letter-spacing:.08em">BIZZING BEE · WEEKLY REPORT</div><h1>'+E(c.name)+'</h1></div><div style="text-align:right;font-size:12px;color:#888">'+new Date().toLocaleDateString()+'<br>Ages '+E(ageBandOf(c).n)+'</div></div>'+
      '<h2>This week at a glance</h2><div class="row"><div class="stat"><b>'+daysThisWeek+'/7</b><span>Days practised</span></div><div class="stat"><b>'+sessions+'</b><span>Sessions</span></div><div class="stat"><b>'+acc+'%</b><span>Accuracy</span></div></div>'+
      '<table style="width:100%;margin-top:16px;border-collapse:collapse"><tr>'+dotRow+'</tr></table>'+
      '<h2>Report card</h2><div class="row"><div class="stat"><b>'+(RC.time.feed?RC.time.minutes:'—')+'</b><span>Active minutes · 7 days</span></div><div class="stat"><b>'+(RC.progress&&RC.progress.atlas?RC.progress.atlas.cleared:'—')+'</b><span>Atlas stops cleared</span></div><div class="stat"><b>'+RC.mastery.retained+'</b><span>Mastered on two days</span></div><div class="stat"><b>'+RC.mastery.due+'</b><span>Due for a re-check</span></div><div class="stat"><b>'+RC.mastery.slipped.length+'</b><span>Slipped since mastered</span></div></div>'+
      (RC.mastery.traps.length?'<p style="font-size:13px;margin:10px 0 0"><b>Traps to help with:</b> '+RC.mastery.traps.map(t=>E(t.label)+' ('+t.words.map(E).join(', ')+')').join(' · ')+'</p>':'')+
      '<h2>Progress</h2><div class="row"><div class="stat"><b>'+rk.level+'</b><span>Rank · '+E(rk.name)+'</span></div><div class="stat"><b>'+ov+'</b><span>Stage ('+E(listLabel(activeListKey()))+')</span></div><div class="stat"><b>'+mastered+'</b><span>Words mastered</span></div><div class="stat"><b>'+totRight+'</b><span>Correct this week</span></div><div class="stat"><b>'+bnd.band+'</b><span>Word difficulty · '+E(bnd.tier)+'</span></div></div>'+
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
  metricPick:(k)=>set({metricSel:k})
});

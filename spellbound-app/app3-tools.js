"use strict";
/* app3-tools.js — the grown-up's testing tools: debug, the voice tester, evolution feedback.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrTools`, its group carries app3-shared.js and the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

function saveEvoFB(){ try{ SB_STORE.setJSON('evofeedback', EVOFB); }catch(e){} }
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
      return `<button data-act="evoSelect" data-arg="${key}" style="position:relative;background:var(--bg2);border:2px solid ${sel?'var(--accent)':'var(--line)'};border-radius:10px;padding:8px 4px 6px;display:flex;flex-direction:column;align-items:center;gap:2px">${dot}<div style="width:46px;height:50px;display:grid;place-items:center">${evEmb(t,i)}</div><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700">LV ${i+1}</div><div style="font-family:var(--display);font-weight:700;font-size:12px;text-align:center;line-height:1.05">${esc(nm)}</div></button>`; }).join('');
    return `<div style="margin-bottom:18px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:9px;display:flex;align-items:center;gap:8px"><span style="width:14px;height:14px;border-radius:6px;background:linear-gradient(135deg,${(EV_TC[t]||EV_TC.spellbound).a},${(EV_TC[t]||EV_TC.spellbound).b})"></span>${esc(THEME_LABEL[t]||t)}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:8px">${tiles}</div></div>`;
  }).join('');
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:6px">${backPill('goSettings','Settings',null)}<span style="font-family:var(--display);font-weight:800;font-size:20px">Design feedback</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:10px"><span style="font-size:12px;color:var(--muted);font-weight:700">${reviewed}/80 reviewed</span><button data-act="evoExport" style="padding:9px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">Export →</button></span></div>
    <p style="margin:0 0 14px;color:var(--muted);font-size:13px">All 80 evolution tiles (8 worlds × 10 levels). Give per-tile feedback, then export it.</p>
    ${editor}${sections}
  </div>`; }
/* ===================== DEBUG · QC GAMES (dev-unlock only) ===================== */
function viewDebug(){
  if(!state.devUnlock) return viewSettings();
  const hubs=[
    {act:'openDailyBee',arg:'', c:'#2E8B57', n:'Daily Bee',       d:'Hear it, find its spelling'},
    {act:'mbOpen',      arg:'', c:'#7C5CFF', n:'Mock Spelling Bee', d:'11 spellers, 8 rounds'},
    {act:'openLore',    arg:'', c:'#13A892', n:hubNameOf('lore')||'Word trivia', d:'Word trivia + the ladder'},
    {act:'openHive',    arg:'', c:'#2A63D6', n:hubNameOf('hive')||'General knowledge', d:'General knowledge'},
    {act:'openChallenge',arg:'journey', c:'#E0922E', n:'Champ Challenge', d:'Timed / counted'},
    {act:'openGym',     arg:'',      c:'#E0922E', n:hubName('gym'),  d:'The drills hub (seven modes)'},
    {act:'playGame',    arg:'wordquiz', c:'#13A892', n:'Word Quiz', d:'Meaning / origin MC'},
    {act:'playGame',    arg:'boss',  c:'#7B52E0', n:'Boss Battle', d:'HP boss'},
    {act:'playGame',    arg:'duel',  c:'#C43D5A', n:'Spelling Duel', d:'Pass-the-device'},
  ];
  const engines=[
    ['honeycombRun','Honeycomb Run','🌼 Pac-bee maze'],
    ['keepFlying','Keep Flying','🍯 Flappy-bee'],
    ['beeGrandPrix','Bee Grand Prix','🏁 Type-to-nitro race'],
    ['whackAMoth','Whack-a-Moth','🔨 Tap letters'],
    ['spellShield','Spell Shield','🛡️ Boss defence'],
    ['combCatcher','Comb Catcher','🧺 Catch falling letters'],
  ];
  const card=(o)=>`<button data-act="${o.act}"${o.arg?` data-arg="${o.arg}"`:''} style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-left:5px solid ${o.c};border-radius:12px;padding:13px 15px;box-shadow:var(--sh-rest);color:var(--text);cursor:pointer"><div style="font-family:var(--display);font-weight:800;font-size:15px">${o.n}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${o.d}</div></button>`;
  const eng=(e)=>`<button data-act="dbgSaga" data-arg="${e[0]}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-left:5px solid #F0B429;border-radius:12px;padding:13px 15px;box-shadow:var(--sh-rest);color:var(--text);cursor:pointer"><div style="font-family:var(--display);font-weight:800;font-size:15px">${e[1]}</div><div style="font-size:12px;color:var(--muted);margin-top:2px">${e[2]} · <span style="font-family:var(--display);font-variant-numeric:tabular-nums">${e[0]}</span></div></button>`;
  const grid=(items)=>`<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:8px 0 20px">${items}</div>`;
  return `<div style="max-width:820px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:4px">${backPill('goSettings','Settings',null)}<span style="font-family:var(--display);font-weight:800;font-size:22px">🐞 Debug · QC games</span><span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);background:var(--surface2);padding:3px 9px;border-radius:999px">dev only</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13px">One-tap launch for every game — for testing. Only visible while “Unlock everything” is on.</p>
    <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:4px 0 2px">Full games &amp; hubs</div>
    ${grid(hubs.map(card).join(''))}
    <div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:4px 0 2px">Saga engines · launch standalone</div>
    ${grid(engines.map(eng).join(''))}
  </div>`;
}
function voiceFlagList(){ const f=vtLoad(); return Object.keys(f.bad).map(k=>({w:k,h:(f.bad[k]&&f.bad[k].h)||''})); }
// Full test queue in priority order: hand-picked seed → the child's own study words
// → the entire voiced corpus (all ~41k Kokoro clips). Cached; the tester batches it.
function voicePriorityList(){ if(window._vtPriCache) return window._vtPriCache;
  const seen=new Set(), out=[];
  const add=(w)=>{ const k=nkey(w); if(k && /^[a-z][a-z-]*$/.test(k) && !seen.has(k)){ seen.add(k); out.push(k); } };
  (window.SB_VOICE_PRIORITY||[]).forEach(add);
  try{ (gameWordsD()||[]).forEach(x=>add(x.w)); }catch(e){}
  try{ String(window.SB_WVOICE||'').split('|').forEach(add); }catch(e){}
  window._vtPriCache=out; return out; }
var VT_BATCH=20;
function viewVoiceTest(){
  const S=state; const f=vtLoad(); const tab=S.vtTab||'test';
  const reviewAll=(window.SB_VOICE_REVIEW||[]).map(x=>nkey(x&&(x.w||x))).filter((v,i,a)=>v&&a.indexOf(v)===i);
  const review=reviewAll.filter(k=>!f.ok[k]);   // dynamically drop the ones already confirmed OK
  const flagged=Object.keys(f.bad);
  let list, empty, batchInfo='';
  const frAll=(window.SB_VOICE_FRENCH?String(SB_VOICE_FRENCH).split('|'):[]);
  const frLeft=frAll.filter(k=>!f.ok[k]&&!f.bad[k]);
  if(tab==='flagged'){ list=flagged; empty='No words flagged yet. In “To test”, cross any word that sounds wrong.'; }
  else if(tab==='review'){ list=review; empty=reviewAll.length?'🎉 Every rebuilt word confirmed — the whole batch sounds right. Thank you!':'Nothing to re-review yet. When Claude rebuilds your flagged words, they appear here for a fresh listen.'; }
  else if(tab==='french'){ list=frLeft.slice(0,VT_BATCH); empty='🎉 Every French-origin word checked!';
    const frDone=frAll.length-frLeft.length;
    batchInfo=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-bottom:12px;font-size:13px;color:var(--text)"><b>French-origin audit</b> — these words use French spelling patterns the voice model finds hardest, so they get their own lane. Double-tap 🔊 = right, ✗ = wrong. <span style="color:var(--muted)">${frDone.toLocaleString()} of ${frAll.length.toLocaleString()} checked · ${frLeft.length.toLocaleString()} left</span></div>`; }
  else { const all=voicePriorityList(); const unrev=all.filter(k=>!f.ok[k]&&!f.bad[k]);
    list=unrev.slice(0,VT_BATCH); empty='🎉 Every word tested — the whole library is done. Thank you!';
    const doneAll=all.length-unrev.length;
    batchInfo=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:12px;padding:11px 14px;margin-bottom:12px;font-size:13px;color:var(--text)"><b>Batch of ${Math.min(VT_BATCH,unrev.length)}</b> — hear each: double-tap 🔊 = right, ✗ = wrong. Then <b>Save &amp; export</b> and the next batch loads automatically. <span style="color:var(--muted)">${doneAll.toLocaleString()} of ${all.length.toLocaleString()} checked · ${unrev.length.toLocaleString()} left</span></div>`; }
  const row=(k)=>{ const okd=!!f.ok[k], bad=f.bad[k]; const note=(bad&&bad.h)||'';
    return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:var(--bg2);border:1px solid ${bad?'var(--bad,#C43D5A)':okd?'var(--good,#2FA35C)':'var(--line)'};border-radius:12px;padding:10px 12px;margin-bottom:8px">
      <button data-act="vtPlay" data-arg="${k}" aria-label="Play ${esc(k)} — double-tap if it sounds right" title="Tap: hear · double-tap: sounds right" style="width:42px;height:42px;border-radius:10px;background:${okd?'var(--good,#2FA35C)':'var(--accent)'};color:#fff;font-size:18px;flex-shrink:0;user-select:none;-webkit-user-select:none;position:relative">${okd?'✓':'🔊'}</button>
      <button data-act="vtBad" data-arg="${k}" title="${bad?'Un-flag':'Sounds wrong'}" style="width:40px;height:40px;border-radius:10px;font-size:17px;background:${bad?'var(--bad,#C43D5A)':'var(--surface2)'};color:${bad?'#fff':'var(--muted)'};border:1px solid var(--line);flex-shrink:0;user-select:none;-webkit-user-select:none">✗</button>
      <div style="min-width:0;flex:1"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:800;font-size:16px;overflow-wrap:anywhere">${esc(k)}${bad&&bad.logged?' <span style="font-family:var(--body);font-size:10px;font-weight:800;color:var(--muted);background:var(--surface2);padding:1px 6px;border-radius:99px;vertical-align:middle">logged</span>':''}</div>${bad?`<input value="${escA(note)}" oninput="window.sbVTnote('${k}',this.value)" placeholder="how did it sound? e.g. sod" style="margin-top:5px;width:100%;font-size:12.5px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface2);color:var(--text)">`:''}</div></div>`; };
  const rows = list.length ? list.slice(0,400).map(row).join('') : `<div style="color:var(--muted);font-size:14px;padding:26px 16px;text-align:center">${empty}</div>`;
  const tested=Object.keys(f.ok).length+flagged.length;
  const tabBtn=(id,label)=>`<button data-act="vtTab" data-arg="${id}" style="padding:8px 14px;border-radius:999px;font-weight:800;font-size:13px;border:1px solid var(--line);background:${tab===id?'var(--accent)':'var(--surface2)'};color:${tab===id?'#fff':'var(--text)'}">${label}</button>`;
  return `<div style="max-width:640px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:11px;flex-wrap:wrap;margin-bottom:4px">${backPill('goSettings','Settings',null)}<span style="font-family:var(--display);font-weight:800;font-size:22px">🎧 Word voice tester</span></div>
    <p style="margin:0 0 12px;color:var(--muted);font-size:13px">Tap 🔊 to hear a word — <b>double-tap 🔊 if it sounds right</b> (it turns green and the next word moves up). Tap ✗ if it sounds wrong, then type how it sounded (e.g. “soda” → “sod”); tap ✗ again to undo. Flags are saved permanently. Press <b>Save &amp; export</b> and share the file with Claude to rebuild them; rebuilt words come back under <b>Re-review</b>.</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${tabBtn('test','To test')}${tabBtn('flagged','Flagged · '+flagged.length)}${tabBtn('review','Re-review · '+review.length)}${tabBtn('french','🇫🇷 French · '+frLeft.length)}</div>
    <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px">
      <span style="font-size:12px;color:var(--muted);font-weight:700">${tested} checked · ${flagged.length} flagged</span>
      <button data-act="vtExport" style="padding:9px 16px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">💾 Save &amp; export</button>
    </div>
    ${(tab==='test'||tab==='french')?batchInfo:''}
    ${rows}
  </div>`;
}

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrTools) */
Object.assign(app, {
  vtTab:(t)=>set({vtTab:t}),
  vtPlay:(k)=>{ try{ k=nkey(k);
    // double-tap the 🔊 = "sounds right": second tap within 400ms marks OK instead of replaying
    const now=Date.now(), last=window._vtLastPlay;
    if(last && last.k===k && (now-last.t)<400){ window._vtLastPlay=null; app.vtOk(k); return; }
    window._vtLastPlay={k:k,t:now};
    if(typeof WV_BAD!=='undefined' && WV_BAD.has(k)){ try{ if(typeof deviceSpeak==='function') deviceSpeak(k,0.9); }catch(e){} return; }  // blocklisted → device voice, exactly what the app plays
    if(window._vtA){ try{window._vtA.pause();}catch(e){} } const a=new Audio('voice/w/'+String(k).replace(/[^a-z0-9]/g,'-')+'.mp3'); window._vtA=a; a.play().catch(()=>{ try{ if(typeof deviceSpeak==='function') deviceSpeak(k,0.9); }catch(e){} }); }catch(e){} },
  vtOk:(k)=>{ const f=vtLoad(); k=nkey(k); delete f.bad[k]; f.ok[k]=1; vtSave(f); try{ flash('✓ '+k+' sounds right'); }catch(e){} render(); },
  vtBad:(k)=>{ const f=vtLoad(); k=nkey(k); delete f.ok[k];
    if(f.bad[k] && !f.bad[k].h){ delete f.bad[k]; }      // ✗ again on an un-annotated flag = undo
    else if(!f.bad[k]) f.bad[k]={h:'',at:Date.now()};
    vtSave(f); render(); },
  vtExport:()=>{ const list=voiceFlagList(); if(!list.length){ flash('No flagged words yet — cross the ones that sound wrong first.'); return; }
    const payload={ app:'Bizzing Bee', kind:'voice-flags', at:new Date().toISOString(), count:list.length, words:list };
    const txt=JSON.stringify(payload,null,2);
    try{ const blob=new Blob([txt],{type:'application/json'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download='voice-flags.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); }catch(e){}
    try{ if(navigator.clipboard) navigator.clipboard.writeText(txt); }catch(e){}
    flash('💾 '+list.length+' flag'+(list.length===1?'':'s')+' saved — share voice-flags.json with Claude to rebuild them.'); },
  // ----- Debug / QC: launch one saga engine standalone in a full-screen overlay -----
  dbgSaga:(name)=>{ if(!window.SB_SAGA_ENGINES||!SB_SAGA_ENGINES[name]){ flash('Engine not loaded'); return; }
    const old=document.getElementById('dbg-eng'); if(old) old.remove();
    const ov=document.createElement('div'); ov.id='dbg-eng';
    ov.style.cssText='position:fixed;inset:0;z-index:90;background:var(--bg,#FBF7EC);overflow:auto;display:flex;flex-direction:column';
    ov.innerHTML='<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:2px solid var(--honey,#F0B429)">'
      +'<button id="dbg-x" style="font:600 14px sans-serif;border:1px solid var(--line,#EADFC8);background:var(--panel,#fff);border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit">‹ Debug</button>'
      +'<span style="font-family:var(--display,serif);font-weight:800;font-size:16px">🐞 '+name+'</span>'
      +'<span style="margin-left:auto;font:600 11px monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--honey,#B8860B)">medium · QC</span></div>'
      +'<div id="dbg-host" style="flex:1;max-width:680px;width:100%;margin:0 auto;padding:14px"></div>';
    document.body.appendChild(ov);
    let handle=null;
    const closeDbg=()=>{ try{ if(handle&&handle.destroy) handle.destroy(); }catch(e){} ov.remove(); };
    ov.querySelector('#dbg-x').onclick=closeDbg;
    try{ handle=SB_SAGA_ENGINES[name](ov.querySelector('#dbg-host'), {diff:'medium'}, (res)=>{
      const h=ov.querySelector('#dbg-host');
      if(h) h.innerHTML='<div style="text-align:center;padding:40px 16px"><div style="font-family:var(--display,serif);font-weight:800;font-size:22px;margin-bottom:8px">'+(res&&res.win?'✅ Win':'❌ Loss')+'</div><div style="color:var(--muted,#7A6E5C);font-size:14px">score '+((res&&res.score)||0)+' · stars '+((res&&res.stars)||0)+'</div><button id="dbg-again" style="margin-top:18px;padding:11px 20px;border-radius:12px;border:none;background:var(--honey,#F0B429);color:#2B2117;font-weight:800;cursor:pointer">Run again</button></div>';
      const ag=ov.querySelector('#dbg-again'); if(ag) ag.onclick=()=>app.dbgSaga(name);
    }); }catch(e){ flash('Engine error: '+e.message); }
  },
  evoSelect:(key)=>set({evoSel:key}),
  evoRate:(rate)=>{ const k=state.evoSel; if(!k) return; EVOFB[k]={...(EVOFB[k]||{}), rate}; saveEvoFB(); render(); },
  evoNote:(v)=>{ const k=state.evoSel; if(!k) return; EVOFB[k]={...(EVOFB[k]||{}), note:v}; saveEvoFB(); },
  evoClearTile:()=>{ const k=state.evoSel; if(k){ delete EVOFB[k]; saveEvoFB(); render(); } },
  evoExport:()=>{ const themes=Object.keys(EV_NOMEN); const lines=[]; let n=0;
    themes.forEach(t=>{ (EV_NOMEN[t]||[]).forEach((nm,i)=>{ const fb=EVOFB[t+':'+i]; if(fb&&(fb.rate||fb.note)){ n++; lines.push((THEME_LABEL[t]||t)+' · Lv'+(i+1)+' '+nm+' — '+(fb.rate||'(note)')+(fb.note?(' — '+fb.note):'')); } }); });
    if(!n){ flash('No feedback yet — tap a tile to rate or note it'); return; }
    const text='BIZZING BEE — evolution tile feedback ('+n+' tiles)\n\n'+lines.join('\n')+'\n\n--- raw json ---\n'+JSON.stringify(EVOFB);
    const w=window.open('','_blank'); if(!w){ flash('Allow pop-ups to export the feedback'); return; }
    w.document.write('<!doctype html><meta charset="utf-8"><title>Tile feedback</title><body style="font-family:system-ui,Arial;padding:18px;max-width:760px;margin:0 auto"><h2 style="margin:0 0 4px">Evolution tile feedback</h2><p style="color:#666;margin:0 0 12px">Select all, copy, and paste this back to your developer.</p><textarea style="width:100%;height:78vh;font-family:monospace;font-size:13px;padding:10px;border:1px solid #ccc;border-radius:6px">'+text.replace(/</g,'&lt;')+'</textarea></body>'); w.document.close(); }
});

"use strict";
/* app3-games.js — the classic in-app games under the Play tab (viewGames, the typed games, the duel, magic squares…) and the thin Gym / Daily / Forge / Daily Buzz screens.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrGames`, its group carries app3-shared.js and the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

/* ===== Magic Squares — a 3×3 bingo board of themes. Clear a cell by acing 5 questions
   (spell-it or pick-the-meaning). Complete rows, columns & diagonals for a celebration (coins come from the words: a won cell is a finished round);
   black out the whole square for the mega prize. ===== */
/* A won cell is a finished round and pays the standard 'stop' (5) through the wallet. Lines,
   diagonals and the full square are CELEBRATED, never paid: they used to print +10/+15/+40 and
   pay nothing (FIX-BEE v2 Fix-first). The copy now says exactly what is paid. */
const MAGIC_BONUS={cell:1};
function magicClusterOf(cell){ if(cell&&cell.kind==='concept') return {id:'concept',label:'Concept',c:'#0E8A78'};
  return themeClusters().find(x=>x.id===cell.cluster)||themeClusters()[0]; }
function magicCellWords(id){
  if(String(id).slice(0,2)==='c:'){ const ch=(state.conceptData||[])[+String(id).slice(2)];
    return conceptWordsOf(ch||{}).map(x=>({w:x.w, d:x.def||'', s:x.ex||''})).filter(w=>kidSafe(w)); }
  return nextWords.pool(null,{purpose:'drill',theme:id}); }
function magicBuildQs(id){ const all=diffSlice(magicCellWords(id).filter(w=>w.d&&w.d.length>4));
  let ws=pickFresh(all,5); if(ws.length<5) ws=ws.concat(sample(all.filter(w=>!ws.some(x=>nkey(x.w)===nkey(w.w))),5-ws.length));
  return ws.slice(0,5).map(w=>{ logGameWord(nkey(w.w));
    if(Math.random()<0.5 && /^[a-z'\- ]+$/i.test(w.w)) return {k:'spell',w};
    const others=mcDistinct(w.w, sample(all.filter(x=>nkey(x.w)!==nkey(w.w))).slice(0,24).map(x=>x.w), 3);
    return {k:'mean',w,choices:sample([w.w].concat(others))}; }); }
function magicLinesCheck(g){ const d=g.board.map(c=>c.done); const won=[];
  const L=g.lines;
  for(let r=0;r<3;r++) if(!L.r[r] && d[r*3]&&d[r*3+1]&&d[r*3+2]){ L.r[r]=true; won.push({label:'Row '+(r+1)+' complete!'}); }
  for(let c=0;c<3;c++) if(!L.c[c] && d[c]&&d[c+3]&&d[c+6]){ L.c[c]=true; won.push({label:'Column '+(c+1)+' complete!'}); }
  if(!L.d[0] && d[0]&&d[4]&&d[8]){ L.d[0]=true; won.push({label:'Diagonal complete!'}); }
  if(!L.d[1] && d[2]&&d[4]&&d[6]){ L.d[1]=true; won.push({label:'Diagonal complete!'}); }
  if(!g.squareDone && d.every(Boolean)){ g.squareDone=true; won.push({label:'MAGIC SQUARE!',mega:true}); }
  return won; }
function magicFinishCell(){ const g=state.game; const i=g.cell; const cell=g.board[i];
  cell.tried++; cell.best=Math.max(cell.best,g.right);
  const win=g.right>=4; let celebr=null; let coins=0;
  if(win && !cell.done){ cell.done=true; coins+=MAGIC_BONUS.cell;
    const lines=magicLinesCheck(g);
    if(lines.length){ celebr={msgs:lines.map(l=>l.label), mega:lines.some(l=>l.mega)}; } }   /* a line is a pattern on the board, not a wage */
  if(coins){ coins=addCoins('stop'); g.coins+=coins; }   /* a cell won (4 of 5 right) is a finished round */
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
function diffSlice(pool){ const c=active(); const [lo,hi]=diffRange(c);
  const f=pool.filter(w=>{ const y=w.y||3; return y>=lo&&y<=hi; });
  return f.length>=10?f:pool; }
/* DAILY BEE, IN THE SHELL (audit v4 N2, games spec §5.2). The whole screen is games-daily.js's stage —
   HUD, board and keys on the morning-hive plate, edge to edge between the top bar and the tab bar —
   mounted into #db-host by render(). Until the lazy file lands the host holds the hive loader. */
function viewDaily(){
  return `<div id="db-host" class="db-host" role="region" aria-label="Today's Daily Bee">${window.SB_DAILY?'':hiveLoader('getting today\u2019s word ready\u2026')}</div>`;
}
/* DAILY BUZZ, IN THE SHELL, as it was before 4 Oct (restored 5 Oct 2026): the app's page head (back to Play) and
   the board under it, daily-buzz.js's, mounted into #dz-host by render(). The loader stands until the lazy file lands. */
function viewDailyBuzz(){
  let when=''; try{ when=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'}); }catch(e){}
  return `<div class="sb-dailypage" style="max-width:560px;margin:0 auto">
    ${pageHead('Daily Buzz', esc(when), '', null, 'openGames', 'Play')}
    <div id="dz-host" class="dz-host" role="region" aria-label="Today's Daily Buzz" style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;box-shadow:var(--sh-rest)">${window.SB_DAILY_BUZZ?'':hiveLoader('getting today\u2019s word ready\u2026')}</div></div>`;
}
/* WORD FORGE, IN THE SHELL: the stage is forge.js's, mounted into #fg-host by render(). */
function viewForge(){ return `<div id="fg-host" class="fg-host" role="region" aria-label="Word Forge"></div>`; }
function viewGym(){ return `<div class="sb-gympage"><div id="gym-host" class="gym-host" role="region" aria-label="${escA(hubName('gym'))}">${window.SB_GYM?'':hiveLoader('opening the gym…')}</div></div>`; }
function viewGames(){ const g=state.game; if(!g) return gamesHub();
  if(g.type==='duel') return duelView();
  if(g.type==='magic') return magicView();
  if(g.type==='beat' && g.phase==='mode') return beatModePicker();
  if(g.type==='wordquiz' && !g.qs) return wordQuizPicker();
  if(g.qs) return (g.status==='done')?mcDone():mcGame();
  return (g.status==='done'||g.status==='won'||g.status==='lost')?typedDone():typedGame(); }
function gamePickerShell(title,sub,cards){ return `<div style="max-width:620px;margin:0 auto;animation:sb-rise .3s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">${backPill('exitGame','Arcade',null)}<span style="font-family:var(--display);font-weight:800;font-size:20px">${esc(title)}</span></div>
    <p style="margin:0 0 16px;color:var(--muted);font-size:13px">${sub}</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px">${cards}</div></div>`; }
function pickerCard(act,arg,c,ic,name,desc){ return `<button data-act="${act}" data-arg="${arg}" style="text-align:left;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:16px 16px 15px;box-shadow:var(--sh-rest);display:flex;flex-direction:column;gap:7px">
    <span style="width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:${c};color:#fff">${iconSVG(ic,20)}</span>
    <span style="font-family:var(--display);font-weight:800;font-size:16px;color:var(--text)">${esc(name)}</span>
    <span style="font-size:12.5px;color:var(--muted);line-height:1.4">${esc(desc)}</span></button>`; }
function beatModePicker(){ return gamePickerShell('Beat the Buzzer','Pick how you want to play.',
  pickerCard('beatStart','sprint','#FF5FA2','target','60-Second Sprint','Spell as many as you can before the clock runs out.')+
  pickerCard('beatStart','warmup','#E0922E','flame','10-Word Warm-Up','A relaxed, untimed round of ten mixed words — your daily warm-up.')+
  pickerCard('openChallenge','journey','#7C5CFF','trophy','Stage Challenge','Beat the clock or a set number — pass your Stage to test out.')+
  pickerCard('playGame','duel','#C43D5A','swords','Spelling Duel','Pass the device — same 10 words, two spellers. Who takes the crown?')+
  ''); }
function wordQuizPicker(){ return gamePickerShell('Word Quiz','Choose a round — each is 10 questions.',
  /* meanings, origins, idioms and similes are Word Lore's modes now (games spec §4.3) */
  pickerCard('openLore','','#13A892','book',hubNameOf('lore')||'Word trivia','Meanings, roots, origins, idioms and the ladder.')+
  ''); }
/* ---- Spelling Duel: pass-the-device, same 10 words, two spellers ---- */
function duelView(){ const S=state; const g=S.game; const shell=(inner)=>`<div style="max-width:560px;margin:0 auto;animation:sb-rise .3s ease both">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">${backPill('exitGame','Arcade',null)}<span style="font-family:var(--display);font-weight:800;font-size:20px">Spelling Duel</span></div>${inner}</div>`;
  if(g.phase==='setup') return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:26px;box-shadow:var(--sh-rest);text-align:center">
      <div style="width:84px;height:92px;margin:0 auto 10px">${mascotSVG('excited')}</div>
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
      <div style="width:100px;height:110px;margin:0 auto 8px;animation:sb-bee-talk 1.6s ease-in-out infinite">${mascotSVG('excited')}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:28px;margin-bottom:10px">${tie?'It\'s a tie!':esc(win.name)+' wins! 🏆'}</div>
      <div style="display:flex;justify-content:center;gap:22px;margin-bottom:16px">${[a,b].map(pp=>`<div><div style="font-family:var(--display);font-weight:800;font-size:36px;line-height:1;color:${pp===win&&!tie?'var(--treasure-deep,#8A5B00)':'var(--ink,var(--text))'}">${pp.right}</div><div style="font-size:13px;color:var(--muted);font-weight:650">${esc(pp.name)}</div></div>`).join('')}</div>
      <p style="font-size:13px;color:var(--muted);margin:0 0 16px">${tie?'Both':'Winner'} earned ${tie?'8':'12'} 🪙 · rematch with fresh words any time.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap"><button data-act="playGame" data-arg="duel" style="padding:13px 22px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:14px;box-shadow:var(--edge)">Rematch →</button><button data-act="exitGame" style="padding:13px 22px;border-radius:10px;background:var(--surface2);color:var(--text);font-weight:800;font-size:14px">Back to Arcade</button></div></div>`); }
  const pl=g.p[g.turn]; const w=g.list[g.i];
  return shell(`<div style="background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,30px);box-shadow:var(--sh-rest);text-align:center">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="font-weight:800;font-size:14px;color:var(--action,var(--accent))">${esc(pl.name)}'s turn</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">${g.i+1}/10 · ✓ ${pl.right}</span></div>
      <button data-act="duelSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      <input data-inp="duelType" data-key="duelKey" data-fkey="duelType" value="${escA(S.typed)}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type it…" style="width:100%;padding:15px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:20px;text-align:center;letter-spacing:.06em;margin-bottom:12px">
      <button data-act="duelEnter" style="width:100%;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Submit</button></div>`);
}
/* ---- Magic Squares view: board → 5-question cell → result (+ line celebrations) ---- */
function magicView(){ const g=state.game; const S=state;
  const head=`<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">${backPill('exitGame','Arcade',null)}<span style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:20px;margin-left:4px">${iconSVG('palette',21)} Magic Squares</span><span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;padding:5px 11px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:13px">${coinIc(14)} +${g.coins}</span></div>`;
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
      <p style="margin:0 0 14px;color:var(--muted);font-size:13px">Pick a square and ace <b>4 of 5</b> questions to claim it — a claimed square is a finished round and pays <b>5 Bizzing coins</b>. Rows, columns and diagonals light up the board.</p>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px">${tiles}</div>
      <div style="display:flex;align-items:center;gap:10px"><span style="font-size:12px;color:var(--muted);font-weight:700">Round ${g.round||1} · ${doneN}/9 squares</span><span style="flex:1"></span><button data-act="magicNew" style="padding:10px 16px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">🔄 New board</button></div>
    </div>`; }
  if(g.status==='play'){ const q=g.qs[g.qi]; const cell=g.board[g.cell]; const cl=magicClusterOf(cell);
    const dots=g.qs.map((_,i)=>`<span style="flex:1;height:6px;border-radius:999px;background:${i<g.qi?'var(--good)':(i===g.qi?cl.c:'var(--surface2)')}"></span>`).join('');
    let body='';
    if(q.k==='spell'){
      const fb = g.revealed ? (g.ok?`<div style="border-radius:14px;padding:12px 15px;margin-bottom:12px;font-weight:800;background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good);animation:sb-pop .3s ease both">✓ Correct!</div>`:missFeedbackHTML(q.w, g.tried||'')) : '';
      body=`<div style="text-align:center">
        <button data-act="magicHear" style="display:inline-flex;align-items:center;gap:8px;padding:11px 20px;border-radius:999px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',17)} Hear it again</button>
        ${q.w.d?`<div style="font-size:13px;color:var(--muted);line-height:1.55;margin-bottom:14px;max-width:40em;margin-left:auto;margin-right:auto"><b style="color:var(--text)">Meaning.</b> ${esc(maskTxt(q.w.d,q.w.w))}</div>`:''}
        ${fb}
        <input data-inp="onType" data-key="magicKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" ${g.revealed?'disabled':''} style="width:100%;text-align:center;padding:15px 14px;border-radius:14px;background:var(--surface);border:2px solid ${g.revealed?(g.ok?'var(--good)':'var(--bad)'):'var(--line)'};color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(19px,4.5vw,26px);letter-spacing:.13em;text-transform:lowercase;outline:none;margin-bottom:12px">
        ${g.revealed?(g.ok?'':`<button data-act="magicNext" style="width:100%;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next →</button>`):`<button data-act="magicSubmit" style="width:100%;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Check ✓</button>`}
      </div>`;
    } else {
      const btns=q.choices.map(c=>{ const isPick=g.picked===c; const isAns=nkey(c)===nkey(q.w.w);
        let st='background:var(--surface2);border:1px solid var(--line);color:var(--text)';
        if(g.picked!=null){ if(isAns) st=`background:color-mix(in srgb,var(--good) 20%,transparent);border:1.5px solid var(--good);color:var(--good)`; else if(isPick) st=`background:color-mix(in srgb,var(--bad) 16%,transparent);border:1.5px solid var(--bad);color:var(--bad)`; else st+=';opacity:.55'; }
        return `<button data-act="magicPick" data-arg="${escA(c)}" style="padding:14px 12px;border-radius:14px;font-family:var(--display);font-weight:800;font-size:15px;${st}">${esc(c)}</button>`; }).join('');
      body=`<div style="font-size:15px;color:var(--text);line-height:1.6;margin-bottom:16px;text-align:center"><b>Which word means:</b><br>“${esc(maskTxt(q.w.d,q.w.w))}”</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">${btns}</div>
        ${(g.picked!=null&&!g.ok)?`<p style="text-align:center;margin:12px 0 0;font-weight:700;font-size:13.5px">Not this time — the green one is right.</p><button data-act="magicNext" style="width:100%;margin-top:10px;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next →</button>`:''}`;
    }
    return `<div style="max-width:560px;margin:0 auto">${head}
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px"><span style="display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;background:color-mix(in srgb,${cl.c} 14%,var(--bg2));color:${cl.c};font-weight:800;font-size:12px">${esc(maskTxt(cell.label,(q&&q.w&&q.w.w)||''))}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">Question ${g.qi+1}/5 · ${g.right} right</span></div>
      <div style="display:flex;gap:5px;margin-bottom:14px">${dots}</div>
      <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(16px,4vw,24px);box-shadow:var(--glow)">${body}</div>
    </div>`; }
  // result
  const r=g.cellResult||{}; const cell=g.board[g.cell]||{}; const cl=magicClusterOf(cell);
  const celebr=g.celebr?`<div style="margin:14px 0;animation:sb-pop .45s ease both">${g.celebr.msgs.map(m=>`<div style="font-family:var(--display);font-weight:800;font-size:${g.celebr.mega?'26px':'19px'};color:var(--accent);margin-bottom:4px">🎉 ${esc(m)}</div>`).join('')}</div>`:'';
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">${head}
    <div style="display:flex;justify-content:center;margin:6px 0 4px"><div style="width:84px;height:92px">${mascotSVG(r.win?(g.celebr?'excited':'happy'):'oops')}</div></div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">${r.win?(g.celebr&&g.celebr.mega?'MAGIC SQUARE!':'Square claimed! ⭐'):'So close!'}</h2>
    <div style="font-size:15px;color:var(--muted);font-weight:700">${esc(cell.label)} — ${r.right}/5 right${r.coins?(' · +'+r.coins+' Bizzing coins for the round'):''}</div>
    ${celebr}
    <div style="display:flex;gap:10px;margin-top:16px">${r.win?'':`<button data-act="magicCell" data-arg="${g.cell}" style="flex:1;padding:13px;border-radius:14px;background:${cl.c};color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Try again →</button>`}${g.squareDone
      ? `<button data-act="magicNew" style="flex:1;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Round ${(g.round||1)+1} — 9 new cells →</button><button data-act="exitGame" style="padding:13px 16px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">Done</button>`
      : `<button data-act="magicBoard" style="flex:1;padding:13px;border-radius:14px;background:${r.win?'var(--accent)':'var(--surface2)'};color:${r.win?'#fff':'var(--text)'};font-weight:800;font-size:15px;${r.win?'box-shadow:var(--edge)':'border:1px solid var(--line)'}">Back to the board</button>`}</div>
  </div>`; }
const PLAY_DOORS = [['compete','Compete'],['train','Train'],['play','Play']];
function playCardPicture(card,big){ const A=PLAY_ART[card.k]||{}; const V=window.SB_ASSET_V?('?v='+window.SB_ASSET_V):'';
  if(A.img) return A.img+V;
  if(A.shot) return 'app-art/shots/game-'+A.shot+'.webp'+V;
  if(A.plate){ try{ if(typeof window.SB_PLATE==='function'){ const u=SB_PLATE(A.plate); if(u) return u; } }catch(e){}
    /* saga2 (and SB_PLATE) loads with the arcade, after this tab first draws: the same rule, here */
    return 'app-art/stage/'+A.plate+'-'+(document.documentElement.getAttribute('data-mode')==='dusk'?'night':'day')+'.webp'; }
  return ''; }
function gamesHub(){ const c=active();
  const shown=playCardsShown();
  const card=(o,span)=>{ const A=PLAY_ART[o.k]||{}; const name=playCardName(o.k); const live=playCardLive(o);
    const promise=(PLAY_TEXT[o.k]&&PLAY_TEXT[o.k].p)||(((window.SB_ARCADE_GAMES||[]).find(x=>x.k===o.k)||{}).blurb)||'';
    const best=live?playCardBest(o,c):''; const pic=playCardPicture(o,span>1);
    const chip=o.nolevel?'':SB_LEVEL.chip(o.k,name);   // Daily Buzz has no level: a chip there would step nothing
    const go=live?(A.cta||'Play'):'Coming';
    if(span>1){   /* a flagship: the large painted tile */
      let art=''; if(!pic&&(o.k==='mockbee'||o.k==='mockAnalogy')&&window.SB_AVATAR){ try{ const want=o.k==='mockbee'?'goldlegend':'scopey'; const hid=SB_AVATARS.byId[want]?want:((SB_AVATARS.list[o.k==='mockbee'?0:1]||{}).id); art=SB_AVATAR(hid,116,{dark:true}); }catch(e){} }
      if(!pic&&!art&&A.game) art=gameArtSVG(A.game,96);
      return `<div class="pl-card pl-big" data-card="${o.k}" style="grid-column:${span>=4?'1 / -1':'span 2'}">
        <button data-act="playCard" data-arg="${escA(o.k)}" class="arc-hero${live?'':' pl-coming'}">
          <span aria-hidden="true" style="position:absolute;inset:0;background:${A.grad||'var(--accent)'}"></span>
          ${pic?`<span aria-hidden="true" class="arc-hero-img" style="background-image:url('${pic}')"></span>`:''}
          ${art?`<span class="arc-hero-art">${art}</span>`:''}
          <span class="arc-hero-in">
            <span class="arc-tag" style="color:#FFD98A;background:rgba(255,194,61,.14);border:1px solid rgba(255,194,61,.35)">${iconSVG(o.door==='compete'?'trophy':'joystick',12,2.4)} ${esc(live?o.tag:'Coming')}</span>
            <span class="arc-hero-title" style="display:block">${esc(name)}</span>
            <span class="arc-hero-blurb" style="display:block">${esc(promise)}</span>
            <span class="arc-hero-cta"><span class="arc-hero-go">${esc(go)}${live?' →':''}</span>${best?`<span class="arc-hero-sub">${esc(best)}</span>`:''}</span>
          </span></button>
        <span class="pl-chip">${chip}</span></div>`; }
    const top=pic?`linear-gradient(180deg,rgba(20,14,42,0),rgba(20,14,42,.14)),url('${pic}') center/cover`:(A.grad||'var(--accent)');
    return `<div class="arc-tile pl-card" data-card="${o.k}"${span>1?` style="grid-column:span ${span}"`:''}>
      <button data-act="playCard" data-arg="${escA(o.k)}" class="arc-tile-play${live?'':' pl-coming'}">
        <span class="arc-tile-top" style="background:${top}"><span class="arc-badge">${esc(live?o.tag:'Coming')}</span>${(!pic||A.plate)&&A.game?`<span style="filter:drop-shadow(0 3px 7px rgba(0,0,0,.38))">${gameArtSVG(A.game,48)}</span>`:''}</span>
        <span class="arc-tile-body">
          <span class="arc-tile-title" style="display:block">${esc(name)}</span>
          <span class="arc-tile-blurb" style="display:block">${esc(promise)}</span>
          <span class="arc-tile-foot"><span class="arc-cta" style="background:${live?'var(--accent)':'var(--muted)'}">${live?iconSVG('joystick',14)+' Play':'Coming soon'}</span>${best?`<span class="arc-stat">${esc(best)}</span>`:''}</span>
        </span></button>
      ${chip}
    </div>`; };
  /* spans that fill every row: full = the row, big = two, small = one; bigs first, and a door that
     would leave a hole widens its last small cards (4 columns; 2 below 720px — a big is a phone row) */
  const doorHTML=([id,label])=>{ const cards=shown.filter(x=>x.door===id); if(!cards.length) return '';
    let items=cards.map(x=>({x,span:x.size==='full'?4:x.size==='big'?2:1}));
    items=items.filter(i=>i.span===4).concat(items.filter(i=>i.span===2),items.filter(i=>i.span===1));
    let tot=items.reduce((t,i)=>t+i.span,0);
    for(let j=items.length-1;j>=0&&tot%4;j--){ if(items[j].span===1){ items[j].span=2; tot++; } }
    for(let j=items.length-1;j>=0&&tot%4;j--){ if(items[j].span===2){ items[j].span=4; tot+=2; } }
    items=items.filter(i=>i.span===4).concat(items.filter(i=>i.span===2),items.filter(i=>i.span===1));
    return `<section class="pl-door" data-door="${id}" aria-label="${escA(label)}">
      <h2 class="pl-door-h">${esc(label)}</h2>
      <div class="pl-grid">${items.map(i=>card(i.x,i.span)).join('')}</div></section>`; };
  return `<div style="max-width:860px;margin:0 auto">
    ${pageHead('Bizzy&rsquo;s Great Spelling Arcade','','',coinChip(),'goHome','Home',null,arcadeLogoSVG(34))}
    ${PLAY_DOORS.map(doorHTML).join('')}
  </div>`;
}
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
      <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px" data-live-prompt="">${title}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1" data-live-prompt="">${big}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px" data-live-prompt="">${sub}</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${coinIc(15)} +${g.bonus||0} coins earned</div>
      ${gameReveal(g)}
    </div>
    <div style="display:flex;gap:10px;justify-content:center">${backPill('exitGame','Arcade',null)}<button data-act="gReplay" style="padding:13px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Play again →</button></div>
  </div>`; }
function mcGame(){ const S=state; const g=S.game; const q=g.qs[g.i]; const mono=q.kind==='spell';
  /* the key hint is chrome, and chrome must not say the word being asked ("which word means to do or say
     something again?" over "R repeat") — a hint that holds the target drops itself for that question */
  const keyHint='keys 1–4 pick · R repeat', tgt=String(q.word||q.answer||'').toLowerCase();
  const hintOk=!tgt||!keyHint.toLowerCase().split(/[^a-z]+/).includes(tgt);
  const statusBar=`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">${gameName(g.type)} · ${g.i+1}/${g.qs.length} · ✓ ${g.right} ${hintOk?`<span class="sb-mob-hide" style="opacity:.7">· ${keyHint}</span>`:''}</div>`;
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
  else if(q.kind==='vocab') prompt=`${eyebrow('What does it mean?')}<div style="font-family:var(--display);font-size:clamp(22px,5vw,30px);font-weight:800;letter-spacing:.02em">${q.prompt}</div>${q.p2?`<div style=\"font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);margin-top:4px\">${esc(q.p2)}</div>`:''}${hearBtn('Hear the word')}`;
  else prompt=`${eyebrow('Which word means…')}<div style="font-size:clamp(17px,3.6vw,21px);line-height:1.55;font-weight:600">“${q.prompt}”</div>`;
  const wrongPick=g.picked!=null && q.choices[g.picked]!==q.answer;
  const inner=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4.5vw,30px);box-shadow:var(--glow);margin-bottom:14px;text-align:center"><span class="sb-sr" data-live-prompt="${escA('Question '+(g.i+1)+' of '+g.qs.length)}"></span><div data-live-prompt="">${prompt}</div></div>
    ${wrongPick?(q.kind==='spell'
        ? '<span class="sb-sr" data-live-prompt="Not this time. The right spelling is shown, letter by letter."></span>'+missFeedbackHTML(q.wordObj||q.answer, q.choices[g.picked]||'', {head:'Not this time — the right spelling, letter by letter'})
        : `<div data-live-prompt="" style="background:var(--surface);border:1.5px solid var(--line);border-radius:12px;padding:10px 14px;margin-bottom:12px;text-align:center;font-weight:800;font-size:14px;animation:sb-pop .3s ease both">Not this time — the answer is: <span style="color:var(--good)">${esc(trunc(q.answer,90))}</span></div>`):''}
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:11px">${choices}</div>
    ${wrongPick?`<button data-act="gMcNext" style="width:100%;margin-top:12px;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Next →</button>`:''}`;
  return gameShell(statusBar, inner); }
function mcDone(){ const g=state.game; const pct=Math.round(g.right/(g.qs.length||1)*100);
  return `<div style="max-width:560px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px">
      <div style="display:flex;justify-content:center;margin-bottom:8px"><div style="width:74px;height:82px">${mascotSVG('love')}</div></div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px" data-live-prompt="">${pct>=80?'Word wizard! 🧙':pct>=50?'Good thinking 💪':'Keep learning 🌱'}</h2>
      <div style="font-family:var(--display);font-weight:800;font-size:40px;color:var(--accent);line-height:1" data-live-prompt="${g.right} of ${g.qs.length} right">${g.right}/${g.qs.length}</div>
      <p style="color:var(--muted);font-weight:700;margin-top:6px" data-live-prompt="">${pct}% correct</p>
      <div style="display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:8px 15px;border-radius:999px;background:linear-gradient(135deg,#FFD24D,#F0A93C);color:#5a3d00;font-weight:900;font-size:15px">${coinIc(15)} +${g.bonus||0} coins earned</div>
      ${gameReveal(g)}
    </div>
    <div style="display:flex;gap:10px;justify-content:center">${backPill('exitGame','Arcade',null)}<button data-act="gReplay" style="padding:13px 20px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Play again →</button></div>
  </div>`; }

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrGames) */
Object.assign(app, {
  // ----- Magic Squares -----
  magicCell:(i)=>{ const g=state.game; if(!g||g.type!=='magic') return; i=+i; if(g.board[i].done){ flash('That square is already yours ⭐'); return; }
    g.qs=magicBuildQs(g.board[i].id); if(g.qs.length<5){ flash('Not enough words in that theme yet'); return; }
    g.cell=i; g.qi=0; g.right=0; g.picked=null; g.ok=null; g.revealed=false; g.status='play'; state.typed='';
    render(); const q=g.qs[0]; if(q.k==='spell') setTimeout(()=>say(q.w.w),350); },
  magicPick:(c)=>{ const g=state.game; if(!g||g.status!=='play'||g.picked!=null) return; const q=g.qs[g.qi];
    g.picked=c; g.ok=(nkey(c)===nkey(q.w.w)); if(g.ok){ g.right++; sfx('correct'); g.coins+=addCoins('answer'); } else sfx('wrong');
    render(); if(g.ok) setTimeout(magicAdvance, 900); },
  magicKey:(e)=>{ if(e.key==='Enter'){ const g=state.game; if(g&&g.revealed&&!g.ok){ magicAdvance(); return; } app.magicSubmit(); } },
  magicNext:()=>{ const g=state.game; if(g&&(g.revealed||g.picked!=null)) magicAdvance(); },
  magicSubmit:()=>{ const g=state.game; if(!g||g.status!=='play'||g.revealed) return; const q=g.qs[g.qi];
    const ans=(state.typed||'').trim().toLowerCase(); if(!ans){ flash('Type the word first'); return; }
    g.revealed=true; g.ok=(ans===q.w.w.toLowerCase());
    logBand(q.w, g.ok);
    if(g.ok){ g.right++; sfx('correct'); g.coins+=addCoins('answer'); markMastered(nkey(q.w.w)); } else { sfx('wrong'); addMiss(q.w); }
    g.tried=ans; render(); if(g.ok) setTimeout(magicAdvance, 900); },
  magicHear:()=>{ const g=state.game; if(g&&g.qs&&g.qs[g.qi]) say(g.qs[g.qi].w.w); },
  magicBoard:()=>{ const g=state.game; if(!g) return; g.status='board'; g.celebr=null; state.typed=''; render(); },
  magicNew:()=>magicNewBoard(),
  duelName:(v)=>{ state.game.p[1].name=(v||'Player 2').slice(0,16); },
  duelBegin:()=>{ const g=state.game; g.phase='play'; g.turn=0; g.i=0; state.typed=''; render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[0]) say(gg.list[0].w); },350); },
  duelSay:()=>{ const g=state.game; if(g&&g.list[g.i]) say(g.list[g.i].w); },
  duelType:(v)=>{ state.typed=v; },
  duelKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.duelEnter(); } },
  duelEnter:()=>{ const g=state.game; const w=g.list[g.i]; if(!w) return;
    const ok=sameSpelling(state.typed,w.w); if(g.turn===0) logBand(w,ok); /* only the profile owner's turn counts toward their Band */
    if(ok){ g.p[g.turn].right++; sfx('correct'); } else sfx('wrong');
    state.typed=''; g.i++;
    if(g.i>=g.list.length){ if(g.turn===0){ g.phase='pass'; render(); return; }
      g.phase='done'; sfx('win');   /* no coin for finishing a duel (games spec §1.3): the old 'contest' here paid two players for reaching the end */ burstConfetti(120); render(); return; }
    render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[gg.i]) say(gg.list[gg.i].w); },300); },
  duelP2:()=>{ const g=state.game; g.turn=1; g.i=0; g.phase='play'; state.typed=''; render(); setTimeout(()=>{ const gg=state.game; if(gg&&gg.type==='duel'&&gg.phase==='play'&&gg.list[0]) say(gg.list[0].w); },350); },
  /* Launch one of the 14 engines directly on its play-field, story-free. Mounts into a
     self-managed fullscreen overlay (like the saga's, minus the story) so it does not
     depend on app3's string render or on saga2's board/beats. */
  arcadeMenu:(k)=>{ try{ arcadeMenu(k); }catch(e){ try{ app.arcadePlay(k); }catch(_){} } },
  /* a Play-tab card (SB_PLAY_CARDS): its own opener, the arcade start menu, or "coming" */
  playCard:(k)=>{ const card=SB_PLAY_CARDS.find(x=>x.k===k); if(!card||!playCardShown(card)) return;   /* a card the tab does not show opens nothing (a stale tap, a search place) */
    if(card.arcade){ app.arcadeMenu(k); return; }
    if(typeof app[card.open]==='function'){ app[card.open](); return; }
    flash(playCardName(k)+' is coming soon'); },
  // Beat the Buzzer now hosts a mode picker: a relaxed 10-word warm-up (the old
  // Buzz of the Day) or the 60-second sprint.
  beatStart:(mode)=>{ clearGTimer(); if(mode==='warmup'){ app.playGame('buzz'); return; }
    const c=active(); const list=nextWords(null,240,{purpose:'drill'}); if(list.length<3){ flash('No words yet — try a list first'); return; }
    let _t=60; if(((c.pow||{}).time||0)>0){ c.pow.time--; _t=75; save(); setTimeout(()=>flash('⚡ +15s boost active!'),200); }
    state.game={type:'beat',mode:'sprint',list,i:0,right:0,wrong:0,timeLeft:_t,status:'play'}; startGTimer();
    setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[0]) say(state.game.list[0].w); },320); set({nav:'games',screen:'app'}); },
  gReplay:()=>{ const g=state.game; if(!g) return; if(g.type==='wordquiz'&&g.round){ app.wqStart(g.round); return; }
    if(g.type==='beat'){ app.beatStart(g.mode||'sprint'); return; } if(g.type) app.playGame(g.type); }
});

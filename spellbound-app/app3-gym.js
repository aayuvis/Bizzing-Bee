"use strict";
/* app3-gym.js — the Word Gym: the coach, the quest chooser, the drill (train), level-up, revisions, traps, the coach desk, the level test, the bee band page and the first word.
   Split out of app3.js (road to 4.5, P1.13 step 2 — first-load JS ≤ 400 KB gzip): none of this is on a first screen.
   boot-lazy fetches it (REG `scrGym`, its group carries app3-shared.js and the boot word tier) at the door of a screen it
   draws — viewApp's SCR_NAV guard, an overlay's scrDraw, an action's stub (app3.js SCR_ACTS) — and on the idle queue,
   so it is offline after the first tap. It runs after app3.js, in the same global scope: it reads app3's names by
   bare name and app3 never reads its names except through those three doors. The code is app3's, moved verbatim.
   The rules for adding to it are in CLAUDE.md, "Road to 4.5, P1 — the app3 split". */

const LEVEL_WORDS = WORDS;
function journeyTotal(){ return journeySorted().length; }
// avatar form (0–9) from a journey level: evolve across the 20 Champ levels, then hold at Champ form
function journeyFormIdx(level){ return Math.max(0, Math.min(9, Math.floor((level-1)/2))); }
const judgeWord = (val,w) => sameSpelling(val, (w&&w.w)||'');
function speakSlow(){ deviceSpeak(curWord().w, 0.55); }
// stacked-cards glyph for the Practice card-view toggle
function cardsSVG(sz){ sz=sz||20; return `<svg width="${sz}" height="${sz}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true" focusable="false" style="display:block"><rect x="3.5" y="7.5" width="12" height="13" rx="2.4"/><path d="M8 7.5V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9.5a2 2 0 0 1-2 2h-1.5"/></svg>`; }
const bandArt=(b)=>{ try{ return rankArt(Math.max(0,Math.min(9,(b|0)-1))); }catch(e){ return ''; } };
function loreUnlocked(){ const n=loreCount(); return lessonsAll().slice(0,Math.min(n,lessonsAll().length)); }
/* Level 12 / Bee Band 7 is a READINESS signal: it changes how the pack is pitched, never
   whether it is open. Kept separate from advModeOn so the two can never be confused again. */
function advReadyOn(c){ c=c||active(); if(!c) return false;
  try{ return (listStageIdx(c,'journey')+1)>=12 || beeBand(c).band>=7; }catch(e){ return false; } }
/* The Practice shell, reused: back link + title row, the List Dock, the tab bar, then
   whatever the active tab renders. Everything inside a tab is unchanged — only the frame
   around it now matches the coach. */
/* The coach's "Live progress" heatmap, drawn from the VOCABULARY ladder: green = meaning
   answered correctly (any mode), red = answered wrong or waiting in the revision queue,
   grey = not asked yet. Anonymized coloured tiles by default with the same tap-to-reveal
   eye toggle the coach uses; a revealed chip jumps to that word's card. Reads and writes
   nothing in luMastered/missedWords — spelling's heatmap stays its own. */
/* Chip type for a mixed-length word tray: shorter words keep the full size, longer ones
   step down so no single chip dominates the row. Capped in ch so the widest still wraps. */
function chipType(w){ const L=String(w||'').length;
  const px = L<=12?12 : L<=18?11 : L<=26?10 : L<=34?9.2 : 8.6;
  return `font-size:${px}px;max-width:min(100%,${Math.min(26,Math.max(12,Math.ceil(L*0.62)))}ch)`; }
/* A8: the first word. One spoken word, spelled right in the first minute, celebrated. */
function viewFirstWord(){ const f=state.fw; if(!f) return '';
  const c=active();
  if(f.done) return `<div style="max-width:520px;margin:30px auto;text-align:center;padding:26px 22px;border-radius:22px;background:var(--bg2);box-shadow:0 0 0 1px var(--line)">
    <div style="width:150px;margin:0 auto 6px">${avatarSVG((c&&c.avatar)||'bizzy',150)}</div>
    <h1 style="font-family:var(--display);font-size:30px;margin:6px 0">Your first word — spelled right!</h1>
    <div style="font-size:16px;color:var(--muted);margin-bottom:18px"><b style="color:var(--text);letter-spacing:.06em">${esc(f.w)}</b> · that is how every champion starts.</div>
    <button class="sb-btn-primary" data-act="fwDone" style="min-height:48px;padding:12px 26px;border-radius:14px;background:var(--action,var(--accent));color:#fff;font-weight:800;font-size:16px">Start your first lesson ${iconSVG('arrow',16)}</button></div>`;
  return `<div style="max-width:520px;margin:30px auto;text-align:center;padding:26px 22px;border-radius:22px;background:var(--bg2);box-shadow:0 0 0 1px var(--line)">
    <div style="width:110px;margin:0 auto">${mascotSVG('happy')}</div>
    <h1 style="font-family:var(--display);font-size:26px;margin:6px 0 4px">Your first word</h1>
    <div style="font-size:15px;color:var(--muted);margin-bottom:14px">Listen, then spell it.</div>
    <button data-act="fwSay" aria-label="Hear the word again" style="width:72px;height:72px;border-radius:50%;background:var(--chip);color:var(--accent);display:inline-grid;place-items:center;margin-bottom:14px">${iconSVG('volume',32)}</button>
    ${f.miss?`<div style="text-align:left;margin-bottom:12px">${missFeedbackHTML({w:f.w},String(f.miss).trim(),{head:'Nearly — here are the letters. Type it once more.'})}</div>`:''}
    <div style="display:flex;gap:8px;justify-content:center"><input data-inp="fwType" data-key="fwKey" data-fkey="fw" value="${escA(f.typed)}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Type the word" style="font-size:22px;padding:10px 14px;border-radius:12px;border:2px solid var(--line);width:220px;text-align:center;background:var(--paper,var(--bg));color:var(--text)">
    <button data-act="fwCheck" style="min-height:48px;padding:0 20px;border-radius:12px;background:var(--action,var(--accent));color:#fff;font-weight:800">Check</button></div>
    <button data-act="fwDone" style="margin-top:14px;min-height:44px;color:var(--muted);font-weight:700;font-size:13px">Go straight to the lesson</button></div>`; }
/* Advanced Mode entry — a gated hero banner. Unlocks at Level 12, Bee Band 7, or by paying. */
function advBanner(c){ if(!advModeOn(c)) return '';   /* T3: no offer on a child's screen — the pack is sold behind the PIN */
  /* Only ever an offer. Once the pack is active its five features live in Supercharge,
     the Arcade and Practice, so a banner pointing at a hub would be a second, redundant
     route to things already on screen. */
  if(advModeOn(c)) return '';
  const lvl=(function(){ try{ return listStageIdx(c,'journey')+1; }catch(e){ return 1; } })();
  const band=(function(){ try{ return beeBand(c).band; }catch(e){ return 2; } })();
  const on=advModeOn(c);                                   // owns the Advanced Pack
  const ready=(window.ADV&&ADV.ready)?ADV.ready():(lvl>=12||band>=7);
  const price=(window.ADV&&ADV.price)?ADV.price():299;
  const unlocked=on;
  const sub=on
    ? 'National-bee prep · a library of '+countTxt('library')+' words · 2-year plan, mock bees, champion tips & games'
    : ready
      ? 'You are ready for this — the Advanced Pack adds the full library of '+countTxt('library')+' words, mock bees and narrated advanced lessons'
      : 'Advanced Pack · the full library of '+countTxt('library')+' words, mock bees, narrated advanced lessons and champion techniques';
  return `<button class="sb-lift" data-act="openAdvanced" style="width:100%;text-align:left;border-radius:20px;overflow:hidden;margin-bottom:16px;background:linear-gradient(135deg,#241B4E,#3A2A72 60%,#5B3FA6);box-shadow:0 8px 22px rgba(60,40,120,.32);position:relative">
    <div style="padding:17px 18px;display:flex;align-items:center;gap:14px;color:#fff">
      <span style="width:52px;height:52px;border-radius:15px;flex-shrink:0;display:grid;place-items:center;color:#fff;background:rgba(255,255,255,.14)">${SB_ICON('trophy',{size:29})}</span>
      <span style="min-width:0;flex:1">
        <span style="display:flex;align-items:center;gap:8px"><span style="font-family:var(--display);font-weight:800;font-size:18px">Advanced Mode</span>${unlocked?'<span style="font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;border-radius:999px;background:#39d98a;color:#093">Unlocked</span>':'<span style="display:inline-flex;color:rgba(255,255,255,.9)">'+SB_ICON('lock',{size:15})+'</span>'}</span>
        <span style="display:block;font-size:12.5px;color:rgba(255,255,255,.9);font-weight:600;margin-top:3px;line-height:1.4">${esc(sub)}</span>
      </span>
      <span style="flex-shrink:0;padding:9px 15px;border-radius:11px;background:#fff;color:#3A2A72;font-weight:800;font-size:13px;white-space:nowrap">${on?'Enter →':'See the pack →'}</span>
    </div></button>`; }
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
      <div style="width:100px;height:110px;margin:0 auto 6px;animation:sb-bee-talk 1.6s ease-in-out infinite">${mascotSVG('excited')}</div>
      <div style="font-family:var(--ui,var(--body));font-weight:650;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00)">Placement complete</div>
      <div style="font-family:var(--display);font-weight:800;font-size:30px;margin:6px 0 4px">Band ${lt.placed} — ${bandTier(lt.placed||1)}!</div>
      <p style="font-size:15px;color:var(--muted);margin:0 0 6px">That's exactly where champions start. Your word difficulty, your games and your Word Gym are all set to it — spell well and it climbs with you.</p>
      <p style="font-size:13px;color:var(--muted);margin:0 0 8px">Quest start: Stage ${ltStageForBand(lt.placed||1)+1} of the Bizzing Bee Journey.</p>
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
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><span style="display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">Band ${lt.band} · ${bandTier(lt.band||2)}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">✓ ${lt.ok}/3 to climb</span></div>
      <p style="font-size:13px;color:var(--muted);font-weight:650;margin:0 0 12px">Spell 3 right to climb a band. Three misses and we lock in your start.</p>
      <button data-act="ltSay" style="display:inline-flex;align-items:center;gap:9px;padding:11px 20px;border-radius:999px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:14px">${iconSVG('volume',18)} Hear the word</button>
      ${ltMeaning}
      <input data-inp="ltType" data-key="ltKey" data-fkey="ltType" value="${escA(lt.typed||'')}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type it…" style="width:100%;padding:15px;border-radius:12px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:20px;text-align:center;letter-spacing:.06em;margin-bottom:12px">
      <button data-act="ltEnter" style="width:100%;padding:14px;border-radius:10px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Submit</button>
      <button data-act="ltSkip" style="margin-top:12px;color:var(--muted);font-weight:700;font-size:13px;text-decoration:underline;text-underline-offset:3px">Skip — start at Level 1</button>
    </div></div>`; }
// Traps — the weak-pattern radar screen. Overview = radar; detail = tips + concepts first, then practice.
const TRAP_CONCEPT_RE={ double:/Double Consonant/i, silent:/Silent kn|Silent -gh|Blends & Silent/i, ieei:/ie \/ ei/i, schwa:/Schwa/i, endings:/Suffix|-tion|able/i, french:/French Loanword/i, greek:/Greek (Prefixes|Root|Suffixes)/i, latin:/Latin (Prefixes|Root|Suffixes)/i,
  epon:/Eponym|Named After|Personality/i, hom:/Homonym|Homophone|Sound-Alike|Meaning/i };
/* ===================== THE COACH ==========================================
   A tiled briefing built from what the app already measures, answered from a HARDCODED
   rulebook (coach-rules.js). No model, no network, nothing generated.

   Play-testing on the first cut: "good but boring looking… no flow… no graphics… just
   advice in blocks. Kids should engage with it." Fair. The rewrite makes three changes:
     - every trap is a CHARACTER with a face and a colour, not a heading;
     - the centrepiece is a PICTURE of the mistake — the word spelled right beside the way
       it is commonly got wrong, with the letters that differ lit up. 26,879 words in the
       library carry a recorded common misspelling (`m`), so this is the child's own error
       drawn for them rather than described;
     - it reads as a path — meet the trap, see the mistake, learn the trick, beat it —
       instead of five equal boxes of prose.

   Naming: nav 'coach' is the PRACTICE session that drills. This is 'coachdesk', the page
   that explains. Keep them apart.
   ========================================================================== */

/* Where two spellings part company. Aligns on the shared head and tail and calls the
   middle the mistake, which is exactly right for the way words are actually misspelled
   (a doubled letter, a swapped vowel pair, a dropped silent letter). */
function spellSplit(right, wrong){
  const a=String(right||''), b=String(wrong||'');
  if(!a||!b||a.toLowerCase()===b.toLowerCase()) return null;
  let p=0; while(p<a.length&&p<b.length&&a[p].toLowerCase()===b[p].toLowerCase()) p++;
  let q=0; while(q<a.length-p&&q<b.length-p&&a[a.length-1-q].toLowerCase()===b[b.length-1-q].toLowerCase()) q++;
  return { pre:a.slice(0,p), mid:a.slice(p,a.length-q), post:a.slice(a.length-q),
           wmid:b.slice(p,b.length-q) };
}
/* The word drawn twice: right, and the way it goes wrong. The differing letters carry the
   colour; everything else stays quiet, so the eye lands on the one thing to remember. */
function coachWordArt(w){
  const sp=spellSplit(w.w, w.m); if(!sp) return '';
  const dim='color:var(--muted);opacity:.85';
  const cell=(pre,mid,post,ok)=>`<div style="display:flex;align-items:center;gap:9px;padding:9px 12px;border-radius:11px;background:${ok?'color-mix(in srgb,var(--good) 11%,transparent)':'color-mix(in srgb,var(--bad) 10%,transparent)'}">
      <span style="font-size:14px;flex:none">${ok?'✓':'✗'}</span>
      <span style="font-family:var(--mono);font-size:clamp(15px,3.4vw,19px);font-weight:800;letter-spacing:.06em;overflow-wrap:anywhere">
        <span style="${dim}">${esc(pre)}</span>${mid?`<span style="color:${ok?'var(--good)':'var(--bad)'};background:${ok?'color-mix(in srgb,var(--good) 22%,transparent)':'color-mix(in srgb,var(--bad) 20%,transparent)'};border-radius:4px;padding:1px 3px">${esc(mid)}</span>`:`<span title="a letter is missing here" style="display:inline-block;width:.55em;height:1.05em;border-radius:4px;background:color-mix(in srgb,var(--bad) 20%,transparent);border:1px dashed var(--bad);vertical-align:-.18em;margin:0 2px"></span>`}<span style="${dim}">${esc(post)}</span>
      </span></div>`;
  return `<div style="display:flex;flex-direction:column;gap:6px">
      ${cell(sp.pre,sp.mid,sp.post,true)}${cell(sp.pre,sp.wmid,sp.post,false)}
    </div>`;
}
function coachFace(id,sz,ring){
  try{ if(window.SB_AVATAR){ const a=SB_AVATAR(id,sz); if(a) return `<span style="flex:none;width:${sz}px;height:${sz}px;border-radius:50%;overflow:hidden;display:grid;place-items:center;${ring?`box-shadow:0 0 0 3px ${ring}`:''}">${a}</span>`; } }catch(e){}
  return '';
}
/* which chapters teach the patterns catching this child */
function coachConcepts(keys){
  /* Index STRICTLY into state.conceptData, because that is the array openConcept reads.
     Falling back to SB_CONCEPTS.chapters here would hand out indexes into a different
     array — free chapters happen to line up, advanced ones do not. */
  const chs=state.conceptData||[];
  if(!chs.length) return [];
  const out=[], seen=new Set();
  keys.forEach(k=>{ const re=TRAP_CONCEPT_RE[k]; if(!re) return;
    chs.forEach((ch,i)=>{ if(seen.has(i)) return;
      if(re.test(ch.title)||re.test(ch.category)){ seen.add(i); out.push({ch,i,k}); } }); });
  return out.slice(0,6);
}
/* an example of this trap taken from the CHILD'S OWN misses, with its misspelling if the
   library records one — their word beats a textbook word every time */
function coachExample(k){
  const idx=wordIndex(), def=TRAP_DEFS.find(t=>t[0]===k);
  const hit=(w)=>{ if(!w||!w.w) return false; if(def) return def[1].test(w.w);
    const o=(w.o||'').toLowerCase(); return k==='french'?/french/.test(o):k==='greek'?/greek/.test(o):k==='latin'?/latin/.test(o):false; };
  const mine=((active().missed)||[]).map(m=>idx[nkey(m.w)]||{w:m.w}).filter(hit);
  return mine.find(w=>spellSplit(w.w,w.m)) || mine.find(w=>w.h||w.sy) || mine[0] || null;
}
/* ===================== YOUR SPELLING LEVEL ================================
   One ladder, nine named stages, and an honest answer to "how do I move up?".

   Before this there were three numbers a child could see — a Bee Band pill reading
   "Word difficulty 3", a rank pill reading "Level 1 · Egg", and a Karma counter that
   nothing in the app read. Three answers to one question. This page is the single answer,
   and the header pill opens it.

   What moves the band is deliberately NOT time on the app: it is graded evidence, because
   the band is also the dial diffRange() reads to choose which words every game serves. A
   band inflated by hours played would serve a child words they cannot spell. Time is
   rewarded by coins, which is the right currency for showing up.
   ========================================================================== */
function viewBeeBand(){
  /* FIX-BEE C6: this page is "Your level" now — the ONE level (oneLevel), and only right
     answers move it. The Bee Band is shown underneath as WORD DIFFICULTY, with no stage names
     and no rung ladder of its own: it is the dial that picks words, not a second rank. */
  const c=active(), bb=beeBand(c), L=oneLevel(c);
  const wordsRight=L.xp;
  const mastered=masteredCount();
  const pct=Math.max(0,Math.min(100,Math.round(L.into/Math.max(1,L.need)*100)));
  const mover=(ic,t,b,col)=>`<div style="display:flex;gap:11px;align-items:flex-start;padding:11px 0;border-top:1px solid var(--line)">
      <span style="flex:none;width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-size:15px;background:color-mix(in srgb,${col} 14%,transparent)">${ic}</span>
      <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:13.5px;margin-bottom:2px">${t}</span>
        <span style="display:block;font-size:12.5px;color:var(--muted);line-height:1.55">${b}</span></span></div>`;

  return `<div style="max-width:900px;margin:0 auto;animation:sb-rise .35s ease both">
    ${pageHead('Your level','','One level. Every word you spell right moves it, and nothing else does.')}

    <div style="position:relative;overflow:hidden;border-radius:20px;background:linear-gradient(135deg,var(--accent),var(--ink));padding:clamp(17px,3.2vw,24px);margin-bottom:15px;box-shadow:var(--sh-rest)">
      <div style="display:flex;align-items:center;gap:clamp(13px,2.6vw,20px);flex-wrap:wrap">
        <div style="width:clamp(58px,11vw,80px);height:clamp(64px,12vw,88px);flex:none;filter:drop-shadow(0 3px 10px rgba(0,0,0,.28))">${rankArt(L.form)||mascotSVG('excited')}</div>
        <div style="min-width:0;flex:1">
          <div class="sb-one-level" style="font-family:var(--display);font-weight:800;font-size:clamp(24px,4.6vw,34px);color:#fff;line-height:1.1;margin:2px 0 3px">${esc(L.label)}</div>
          <div style="font-size:13.5px;color:rgba(255,255,255,.9);line-height:1.5"><b>${fmtN(L.toNext)}</b> more ${L.toNext===1?'word':'words'} spelled right to Level ${L.level+1}.</div>
          <div style="height:7px;border-radius:999px;background:rgba(255,255,255,.22);overflow:hidden;margin-top:9px"><div style="height:100%;width:${pct}%;background:#fff"></div></div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;align-items:start">
      <section class="sb-card">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">What moves your level</div>
        ${mover('🎯','Spell a word right','Anywhere — the Word Gym, an Atlas stop, the Arcade, the mock bee. Each right answer is one step, and the steps add up to the next level.','var(--accent)')}
        ${mover('🔁','Beat a word that tripped you','A word you once missed and now spell right counts the same — and it is the best practice there is.','var(--bad)')}
        ${mover('🛡️','It never goes down','A day off, a wrong answer, a lost race: none of them take a step away.','var(--good)')}
        <div style="margin-top:12px;padding:10px 12px;border-radius:11px;background:var(--surface2);font-size:12px;color:var(--muted);line-height:1.55">
          <b style="color:var(--text)">It cannot be bought or waited out.</b> Time on the app, Bizzing coins and games of luck never move your level. Coins come from learning too, but they buy looks — never a level.</div>
      </section>

      <section class="sb-card">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:6px">How hard your words are</div>
        <div class="sb-cn" style="line-height:1.55;margin-bottom:10px">This is not a level — it is the dial that picks your words. It follows how you do on words of each difficulty, so it can ease off when words get too hard, and that is a good thing.</div>
        <div style="display:flex;align-items:center;gap:10px"><span style="font-family:var(--display);font-weight:800;font-size:20px">${bb.calibrating?'Still working it out':('Difficulty '+bb.band+' of 9')}</span>${bb.calibrating?'':`<span class="sb-cn">${esc(bb.tier||'')}</span>`}</div>
        <div style="display:flex;gap:4px;margin-top:9px">${[...Array(9)].map((_,i)=>`<span style="flex:1;height:7px;border-radius:99px;background:${!bb.calibrating&&i<bb.band?'var(--accent)':'var(--surface2)'}"></span>`).join('')}</div>
        ${bb.calibrating?`<button data-act="startLevelTest" style="margin-top:12px;padding:10px 16px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13px">Take the 3-minute placement →</button>`:''}
      </section>
    </div>

    <section class="sb-card" style="margin-top:14px">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:11px">Where you are right now</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:9px">
        ${[[fmtN(wordsRight),'words spelled right','var(--accent)'],[mastered,'words mastered','var(--good)'],
           [((c.missed||[]).length),'on the revision pile','var(--bad)'],[bb.acc?bb.acc+'%':'—','recent accuracy','var(--treasure-deep,#8A5B00)']]
          .map(([v,l,col])=>`<div style="padding:12px 13px;border-radius:13px;background:color-mix(in srgb,${col} 10%,transparent)">
            <div style="font-family:var(--display);font-weight:800;font-size:23px;line-height:1;color:${col}">${v}</div>
            <div style="font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:5px">${l}</div></div>`).join('')}
      </div>
      <div style="display:flex;gap:9px;flex-wrap:wrap;margin-top:14px">
        <button data-act="openCoachDesk" style="padding:11px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge)">What to fix next →</button>
        <button data-act="openEvo" style="padding:11px 18px;border-radius:12px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:13.5px">Your bee's ten forms →</button>
      </div>
    </section></div>`;
}
function viewCoachDesk(){
  const R=window.SB_COACH_RULES;
  if(!R){ try{ if(window.SB_LAZY) SB_LAZY.need('coach',()=>{ if(state.nav==='coachdesk') render(); }); }catch(e){}
    return `<div style="max-width:1080px;margin:0 auto">${pageHead('Coach','','Reading your practice…')}
      <div class="sb-card" style="text-align:center;color:var(--muted)">One moment — Bizzy is opening your notes.</div></div>`; }

  const c=active(), bb=beeBand(c), traps=missTraps(), missed=(c.missed||[]);
  const B=(window.SB_COACH_BANDS||[])[bb.band]||{}, tips=window.SB_COACH_TIPS||[];
  const known=traps.filter(t=>R[t.k]);
  const sel=known.find(t=>t.k===state.coachTrap)||known[0]||null;
  const top=known[0]||null, maxN=known.length?known[0].n:1;

  /* ---- 1. Bizzy says the one thing, on a coloured band ---- */
  const line = !missed.length
    ? 'We have not met enough words yet for me to spot a pattern. Go and get some wrong — that is the fastest way to make me useful.'
    : top ? `Nearly every word you lose goes the same way: <b style="color:#fff">${esc(top.label.toLowerCase())}</b>. Fix that one thing and ${top.n} of your misses stop happening.`
          : 'Your misses are spread thin — no single pattern is catching you, which is a good place to be.';
  /* Today's rings ride in the Coach header, a third of the band to the right of Bizzy's
     read. Home's rings open the Coach; the Coach's rings open the 30-day chart, so the
     three targets read as one chain: today -> why -> the month. */
  const _m=todayMetrics(c); const _t=targets(c);
  const _ringLine=(lab,col,val,tgt)=>`<span style="display:flex;align-items:center;gap:6px;font-size:11.5px;font-weight:800;line-height:1.3">
      <span style="width:7px;height:7px;border-radius:2px;background:${col};flex:none"></span>
      <span style="color:rgba(255,255,255,.72)">${lab}</span>
      <span style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;color:#fff;white-space:nowrap">${val}<span style="color:rgba(255,255,255,.6)">/${tgt}</span></span></span>`;
  const _allDone=_m.pApp>=1&&_m.pPrac>=1&&_m.pWords>=1;
  const ringPanel=`<button data-act="openMetrics" title="See the last 30 days in Progress" style="display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);border-radius:16px;padding:12px 14px;cursor:pointer">
      <span style="flex:none;width:72px;height:72px;display:grid;place-items:center">${ringsSVG(72,[_m.pApp,_m.pPrac,_m.pWords])}</span>
      <span style="min-width:0;flex:1;display:flex;flex-direction:column;gap:3px">
        <span style="font-family:var(--body);font-size:10.5px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.72);margin-bottom:2px">Today${_allDone?' \u2713':''}</span>
        ${_ringLine('App', RING_COL[0][0], fmtMins(_m.app), _t.app+'m')}
        ${_ringLine('Practise', RING_COL[1][0], fmtMins(_m.prac), _t.prac+'m')}
        ${_ringLine('Words', RING_COL[2][0], _m.words, _m.tWords)}
        <span style="font-size:10.5px;font-weight:700;color:rgba(255,255,255,.6);margin-top:3px">last 30 days \u2192</span>
      </span></button>`;
  const hero=`<div style="position:relative;overflow:hidden;border-radius:20px;background:linear-gradient(135deg,${top?esc(R[top.k].col):'var(--accent)'},var(--ink));padding:clamp(16px,3vw,22px);margin-bottom:16px;box-shadow:var(--sh-rest)">
      <div class="sb-coach-hero">
        <div style="display:flex;align-items:center;gap:clamp(12px,2.4vw,18px);min-width:0">
          <div style="width:clamp(58px,11vw,84px);height:clamp(66px,12vw,94px);flex:none">${mascotSVG(missed.length?'think':'happy')}</div>
          <div style="min-width:0;flex:1">
            <div style="font-family:var(--body);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.72);margin-bottom:4px">Bizzy’s read on ${esc(c.name||'you')}</div>
            <div style="font-family:var(--display);font-weight:800;font-size:clamp(15px,2.6vw,20px);line-height:1.4;color:#fff">${line}</div>
          </div>
          ${top?coachFace(R[top.k].face,64,'rgba(255,255,255,.5)'):''}
        </div>
        ${ringPanel}
      </div></div>`;

  /* ---- 2. the traps as a bar chart of characters, tap to switch ---- */
  const radar = !known.length ? '' : `<div style="display:flex;flex-direction:column;gap:7px">
      ${known.slice(0,6).map(t=>{ const r=R[t.k], on=sel&&sel.k===t.k, pct=Math.max(14,Math.round(t.n/maxN*100));
        return `<button data-act="coachTrap" data-arg="${t.k}" style="display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:8px 11px;border-radius:12px;background:${on?'var(--surface2)':'transparent'};border:1px solid ${on?r.col:'transparent'}">
          ${coachFace(r.face,34,on?r.col:'')}
          <span style="flex:1;min-width:0">
            <span style="display:block;font-weight:800;font-size:13.5px;margin-bottom:4px">${esc(r.label)}</span>
            <span style="display:block;height:7px;border-radius:4px;background:var(--surface2);overflow:hidden"><span style="display:block;height:100%;width:${pct}%;border-radius:4px;background:${r.col}"></span></span>
          </span>
          <span style="flex:none;font-family:var(--display);font-weight:800;font-size:15px;color:${r.col}">${t.n}</span>
        </button>`; }).join('')}
    </div>`;

  /* ---- 3. the selected trap, as a path: meet it → see it → beat it ---- */
  let detail;
  if(!sel){
    detail=`<div style="text-align:center;padding:26px 18px">
      <div style="width:86px;height:96px;margin:0 auto 10px">${mascotSVG('happy')}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:17px;margin-bottom:5px">Nothing is catching you yet</div>
      <div style="font-size:13.5px;color:var(--muted);line-height:1.6;max-width:34em;margin:0 auto">Practise a set and come back. Every word you get wrong teaches me something about how you spell — which is the one time a mistake is worth more than a right answer.</div>
      <button data-act="levelup" style="margin-top:15px;padding:12px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Go and practise →</button></div>`;
  } else {
    const r=R[sel.k], eg=coachExample(sel.k);
    const art=eg?coachWordArt(eg):'';
    const step=(n,t,body,col)=>`<div style="display:flex;gap:11px;align-items:flex-start;padding:12px 0;border-top:1px solid var(--line)">
        <span style="flex:none;width:24px;height:24px;border-radius:50%;background:${col};color:#fff;display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:12.5px">${n}</span>
        <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:13px;color:${col};letter-spacing:.04em;text-transform:uppercase;margin-bottom:3px">${t}</span>${body}</span></div>`;
    detail=`<div>
      <div style="display:flex;align-items:center;gap:13px;padding-bottom:13px">
        ${coachFace(r.face,58,r.col)}
        <div style="min-width:0;flex:1">
          <div style="font-family:var(--display);font-weight:800;font-size:clamp(17px,3vw,21px);line-height:1.15">${esc(r.label)}</div>
          <div style="font-size:12.5px;color:var(--muted);margin-top:2px">caught you <b style="color:${r.col}">${sel.n}</b> time${sel.n>1?'s':''}</div>
        </div>
        <button data-act="drillTrap" data-arg="${sel.k}" style="flex:none;padding:11px 17px;border-radius:12px;background:${r.col};color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge)">Beat it →</button>
      </div>
      ${step(1,'What goes wrong',`<div style="font-size:13.5px;line-height:1.55;color:var(--text)">${esc(r.mistake)}</div>${art?`<div style="margin-top:10px">${art}<div style="font-size:11px;color:var(--muted);margin-top:6px">“${esc(eg.w)}” — one of your own missed words, and the way it usually goes wrong.</div></div>`:''}`,'var(--bad)')}
      ${step(2,'The trick',`<div style="font-size:13.5px;line-height:1.55">${esc(r.rule)}</div>
        <div style="margin-top:9px;padding:10px 12px;border-radius:11px;background:color-mix(in srgb,${r.col} 12%,transparent);font-size:13px;line-height:1.5;color:var(--text)"><b>At the microphone:</b> ${esc(r.check)}</div>
        ${eg&&eg.h?`<div style="margin-top:8px;font-size:12.5px;color:var(--muted);line-height:1.5">💡 ${esc(eg.h)}</div>`:''}`,r.col)}
      ${step(3,'Watch it work',`<div style="display:flex;flex-direction:column;gap:6px">${r.egs.map(([w,why])=>
          `<div style="display:flex;gap:9px;align-items:baseline;flex-wrap:wrap">
            <button data-act="say" data-arg="${escA(w)}" title="Hear it" style="font-family:var(--mono);font-size:12.5px;font-weight:800;padding:4px 9px;border-radius:7px;background:var(--chip);color:var(--accent);flex:none">${iconSVG('volume',14,2.4)} ${esc(w)}</button>
            <span style="font-size:12.5px;color:var(--muted);flex:1;min-width:180px">${esc(why)}</span></div>`).join('')}</div>`,'var(--good)')}
    </div>`;
  }

  /* ---- 4. the ladder: where you stand and what the next rung brings ---- */
  const rungs=[...Array(9)].map((_,i)=>{ const n=i+1, on=n===bb.band, done=n<bb.band, st=bandStage(n);
    return `<span title="${escA(st.n+' · '+st.s)}" style="flex:1;display:grid;place-items:center;padding:${on?'2px':'5px'} 0;border-radius:9px;background:${on?'color-mix(in srgb,var(--accent) 15%,transparent)':'transparent'}">
      <span style="display:block;width:100%;max-width:${on?34:26}px;aspect-ratio:27/29;${done||on?'':'opacity:.38;filter:grayscale(.7)'}">${bandArt(n)}</span></span>`; }).join('');
  const ladder=`<div style="display:flex;align-items:flex-end;gap:3px;margin:2px 0 12px">${rungs}</div>
    <div style="display:flex;gap:11px;flex-wrap:wrap">
      <div style="flex:1;min-width:210px"><div style="font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);margin-bottom:3px">Right now · word difficulty ${bb.band} of 9</div>
        <div style="font-size:13.5px;line-height:1.55">${esc(B.words||'')}</div></div>
      <div style="flex:1;min-width:210px;padding:11px 13px;border-radius:12px;background:color-mix(in srgb,var(--treasure,#F0B429) 13%,transparent)">
        <div style="font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--treasure-deep,#8A5B00);margin-bottom:3px">Coming next</div>
        <div style="font-size:13.5px;line-height:1.55;color:var(--treasure-deep,#8A5B00)">${esc(B.next||'')}</div></div>
    </div>`;

  /* ---- 5. one habit a day, as a card you turn over ---- */
  const seed=(typeof dayNum==='function'?dayNum():0);
  const ti=((state.coachTip==null?seed:state.coachTip)%Math.max(1,tips.length)+tips.length)%Math.max(1,tips.length);
  const tip=tips[ti]||{t:'',b:''};
  const tipCard=`<div style="display:flex;align-items:flex-start;gap:12px">
      <div style="width:46px;height:52px;flex:none">${mascotSVG('excited')}</div>
      <div style="min-width:0;flex:1">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:4px">${esc(tip.t)}</div>
        <div style="font-size:13px;color:var(--muted);line-height:1.6">${esc(tip.b)}</div>
      </div></div>
    <div style="display:flex;align-items:center;gap:9px;margin-top:12px">
      <button data-act="coachTipNext" style="padding:9px 15px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">Another one →</button>
      <span style="font-size:11.5px;color:var(--muted)">${ti+1} of ${tips.length}</span></div>`;

  /* ---- 6. chapters, as covers rather than a chip row ---- */
  const rel=coachConcepts(known.map(t=>t.k));
  const chapters = rel.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:8px">${rel.map(x=>{ const r=R[x.k]||{};
        return `<button data-act="openConcept" data-arg="${x.i}" style="display:inline-flex;align-items:center;gap:8px;padding:8px 13px 8px 8px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12.5px">
          ${coachFace(r.face||'bizzy',26,'')}${esc(conceptShort(x.ch.title))} →</button>`; }).join('')}</div>`
    : `<div style="color:var(--muted);font-size:13px">Once a pattern shows up in your misses, the chapter that teaches it appears here.</div>`;

  /* Numbers that move. A child checks these the way they check a score, and they fill
     the column beside the trap detail — which was the dead space play-testing called out. */
  const stat=(v,l,col)=>`<div style="padding:11px 12px;border-radius:13px;background:color-mix(in srgb,${col} 11%,transparent)">
      <div style="font-family:var(--display);font-weight:800;font-size:clamp(19px,3.4vw,24px);line-height:1;color:${col}">${v}</div>
      <div style="font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--muted);margin-top:4px">${l}</div></div>`;
  const stats=`<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">
      ${stat(masteredCount(),'words mastered','var(--good)')}
      ${stat(missed.length,'to revise','var(--bad)')}
      ${stat(goodDaysThisWeek(c),'good days this week','var(--treasure-deep,#8A5B00)')}
      ${stat(bb.acc?bb.acc+'%':'—','accuracy','var(--accent)')}
    </div>`;

  /* Their own words, worst first — v1 had this and the redesign dropped it. It belongs
     in the short column, and a word chip is a thing to tap rather than a thing to read. */
  const idx2=wordIndex();
  const worst=missed.slice().sort((a,b)=>(b.n||1)-(a.n||1)).slice(0,14);
  const wordChips = worst.length
    ? `<div style="display:flex;flex-wrap:wrap;gap:6px">${worst.map(m=>{
        const w=idx2[nkey(m.w)]||m, k=Object.keys(R).find(x=>{ const re=TRAP_DEFS.find(t=>t[0]===x); return re&&re[1].test(w.w); });
        const col=(R[k]||{}).col||'var(--muted)';
        return `<button data-act="say" data-arg="${escA(m.w)}" title="Hear it" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 9px;border-radius:7px;background:var(--surface2);border-left:3px solid ${col}">${esc(m.w)}${(m.n||1)>1?`<span style="color:var(--bad);font-weight:800"> ×${m.n}</span>`:''}</button>`;
      }).join('')}</div>
      <button data-act="openRevisions" style="margin-top:11px;padding:9px 15px;border-radius:11px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12.5px">Open the revision pile →</button>`
    : `<div style="color:var(--muted);font-size:13px">Nothing waiting — every word you have missed is cleared.</div>`;

  const panel=(title,body,pad)=>`<section class="sb-card" style="padding:${pad||'15px 17px'};display:flex;flex-direction:column">
      ${title?`<div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:11px">${title}</div>`:''}${body}</section>`;

  return `<div style="max-width:1080px;margin:0 auto;animation:sb-rise .35s ease both">
    ${pageHead('Coach', esc(c.name||'Speller'))}
    ${hero}
    <div style="display:grid;grid-template-columns:minmax(0,1fr);gap:14px">
      ${/* The trap detail is tall and the list beside it is short, which left a column of
            empty card under it. The narrow column now carries three tiles that each earn
            their height, and both columns stretch, so neither ends in white space. */''}
      <div class="sb-coach-2col" style="display:grid;grid-template-columns:minmax(250px,.66fr) minmax(0,1.34fr);gap:14px;align-items:start">
        <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
          ${panel('What catches you', radar||'<div style="color:var(--muted);font-size:13px">No pattern yet.</div>')}
          ${panel('Your numbers', stats)}
          ${panel('Words that keep catching you', wordChips)}
        </div>
        ${panel('', detail)}
      </div>
      ${/* natural heights, not stretched: a stretched card ends in empty card, which is
            the dead space itself. */''}
      <div class="sb-coach-2col" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:14px;align-items:start">
        ${panel('How hard your words are, and the step ahead', ladder)}
        ${panel('Bizzy’s habit of the day', tipCard)}
        ${panel('Chapters that teach this', chapters)}
      </div>
    </div></div>`;
}
function viewTraps(){ const S=state; const traps=missTraps(); const sel=S.trapSel;
  if(sel){ const t=traps.find(x=>x.k===sel)||{k:sel,label:(sel[0].toUpperCase()+sel.slice(1)),n:0};
    const idx=wordIndex(); const ws=trapWords(sel); const mine=((active().missed)||[]).map(m=>idx[nkey(m.w)]||{w:m.w}).filter(w=>ws.some(x=>nkey(x.w)===nkey(w.w)));
    const hooks=mine.slice(0,2).map(w=>w.h?`<div style="display:flex;gap:9px;align-items:flex-start;padding:11px 13px;border-radius:12px;background:var(--surface)"><span style="flex-shrink:0;color:var(--treasure-deep,#8A5B00)">${window.SB_ICON?SB_ICON('bulb',{size:16}):iconSVG('bulb',16)}</span><span style="font-size:13px;line-height:1.5">“<b>${esc(w.w)}</b>” — ${esc(w.h)}</span></div>`:'').join('');
    const chs=(state.conceptData||(window.SB_CONCEPTS&&SB_CONCEPTS.chapters)||[]); const re=TRAP_CONCEPT_RE[sel];
    const rel=re?chs.map((ch,i)=>({ch,i})).filter(x=>re.test(x.ch.title)||re.test(x.ch.category)).slice(0,3):[];
    const relChips=rel.map(x=>`<button data-act="openConcept" data-arg="${x.i}" style="display:inline-flex;align-items:center;gap:6px;padding:8px 13px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:13px">${window.SB_ICON?SB_ICON('grid',{size:14}):iconSVG('grid',14)} ${esc(conceptShort(x.ch.title))}</button>`).join('');
    const wordChips=ws.slice(0,12).map(w=>`<button data-act="say" data-arg="${escA(w.w)}" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:6px 10px;border-radius:6px;background:var(--surface2)">${esc(w.w)}</button>`).join('');
    return `<div style="max-width:640px;margin:0 auto;animation:sb-rise .35s ease both">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">${backPill('trapBack','All traps',null)}</div>
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
    ${pageHead('Your Traps','the weak-pattern radar','Beat one pattern and whole families of words come free.')}
    <div style="position:relative;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:20px;overflow:hidden;box-shadow:var(--sh-rest);margin-bottom:16px">
      ${SB_COVER(state.theme,'traps',{h:110,dark:state.mode==='dusk'})}
      <span style="position:absolute;left:14px;bottom:12px;font-family:var(--display);font-weight:800;font-size:20px;color:${state.mode==='dusk'?'var(--action,#6C4FE0)':'#fff'};text-shadow:0 1px 5px rgba(0,0,0,.3)">${traps.length?traps.length+' patterns on the radar':'Radar clear'}</span>
    </div>
    ${traps.length?`<div style="display:flex;flex-direction:column;gap:9px">${rows}</div>`
      :beeEmpty('sleepy','Nothing on the radar — no misses to trace yet. The bee naps until you find a tricky word.')}
  </div>`; }
// Revisions — words the child flagged "Mark for revision" in Practice. Each can be drilled
// again (⚑ Revise) or cleared once mastered (✓ Complete). Companion to Your Traps.
function viewRevisions(){
  const c=active(); const list=(c.missed||[]); const hist=(c.reviseHistory||[]); const tab=state.revTab||'todo';
  const nameRow=(m,actBtn)=>{ const w=m.w;
    return `<div style="display:flex;align-items:center;gap:10px;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:14px;padding:11px 12px;box-shadow:var(--sh-rest)">
      <button data-act="say" data-arg="${escA(w)}" title="Hear it" style="width:38px;height:38px;flex-shrink:0;border-radius:10px;background:var(--chip);color:var(--accent);display:grid;place-items:center">${iconSVG('volume',17)}</button>
      <span style="min-width:0;flex:1">
        <span style="display:block;font-family:var(--display);font-weight:800;font-size:16px;line-height:1.15;overflow-wrap:anywhere">${esc(w)}</span>
        ${m.d?`<span style="display:block;font-size:12px;color:var(--muted);font-weight:600;line-height:1.35;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(m.d)}</span>`:''}
      </span>${actBtn}</div>`; };
  const todoRow=(m)=>nameRow(m,`<button data-act="reviseOne" data-arg="${escA(m.w)}" title="Practice this word again" style="flex-shrink:0;padding:8px 11px;border-radius:999px;background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border:1px solid var(--treasure,#F0B429);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12.5px">${iconSVG('flag',14,2.4)} Revise</button><button data-act="reviseComplete" data-arg="${escA(m.w)}" title="I know it now — mark complete" style="flex-shrink:0;padding:8px 11px;border-radius:999px;background:color-mix(in srgb,var(--good) 15%,transparent);border:1px solid var(--good);color:var(--good);font-weight:800;font-size:12.5px">✓ Complete</button>`);
  const histRow=(m)=>nameRow(m,`<span style="flex-shrink:0;color:var(--good);font-weight:800;font-size:12px">✓ done</span><button data-act="reviseHistoryAgain" data-arg="${escA(m.w)}" title="Put it back on the revise list" style="flex-shrink:0;padding:8px 11px;border-radius:999px;background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border:1px solid var(--treasure,#F0B429);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12.5px">↻ Revise again</button>`);
  const tabBtn=(k,l)=>`<button data-act="revTab" data-arg="${k}" style="flex:1;padding:10px 8px;border-radius:10px;font-weight:800;font-size:13px;${tab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const body = tab==='history'
    ? (hist.length?`<div style="display:flex;flex-direction:column;gap:9px">${hist.map(histRow).join('')}</div>`:beeEmpty('happy','No revise history yet. When you mark a revision word ✓ Complete, it moves here so you can revisit it any time.'))
    : (list.length?`<div style="display:flex;gap:8px;margin-bottom:14px"><button data-act="practiceRevisions" style="flex:1;padding:13px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff);font-weight:800;font-size:15px;box-shadow:var(--edge)">Practice all ${list.length} →</button></div><div style="display:flex;flex-direction:column;gap:9px">${list.map(todoRow).join('')}</div>`
      :beeEmpty('happy','Nothing to revise — every flagged word is cleared! Mark a word for revision in the Word Gym and it will show up here.'));
  return `<div style="max-width:640px;margin:0 auto;animation:sb-rise .35s ease both">
    ${pageHead('Your Revisions','words you flagged to revise','Mark a word for revision in the Word Gym and it lands here. Drill it, or mark it complete once it sticks — completed words move to Revise history so you can revisit them.')}
    ${mastDueCard()}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:14px;padding:5px;margin-bottom:14px">${tabBtn('todo','To revise'+(list.length?' · '+list.length:''))}${tabBtn('history','Revise history'+(hist.length?' · '+hist.length:''))}</div>
    ${body}
  </div>`;
}
/* "Ready for a check" — the words whose spaced re-check has come round (FIX-BEE D5). This is
   the decay made visible: a mastered word comes back, and spelling it again keeps it. */
function mastDueCard(){ const due=mastDueWords(active(),30); if(!due.length) return '';
  return `<div class="sb-card sb-mastdue" style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px">
    <span style="width:40px;height:40px;flex-shrink:0;border-radius:12px;background:color-mix(in srgb,var(--good) 16%,transparent);color:var(--good);display:grid;place-items:center">${iconSVG('retry',19)}</span>
    <span style="min-width:0;flex:1"><b style="display:block;font-family:var(--display);font-size:15px">${due.length} word${due.length===1?'':'s'} ready for a check</b>
      <span style="font-size:12.5px;color:var(--muted);line-height:1.45">A word is mastered when you spell it right on two different days — and it comes back now and then so it stays mastered.</span></span>
    <button data-act="mastRecheck" style="flex-shrink:0;padding:11px 16px;border-radius:12px;background:var(--good);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Check them →</button></div>`; }
function mastGet(c,key){ const M=c&&c.mast; key=nkey(key); return (M&&Object.prototype.hasOwnProperty.call(M,key))?M[key]:null; }
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
        advBtn=`<button data-act="advanceStage" data-arg="${escA(lk)}" style="flex:1;min-width:100%;padding:15px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${iconSVG('check',16)} Stage ${li+1} cleared — go to Stage ${li+2} →</button>`;
      } else if(lm<st.words.length){
        advBtn=`<div style="flex:1;min-width:100%;display:flex;align-items:center;gap:10px;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:12px 16px;text-align:left">
          <span style="color:var(--accent);flex-shrink:0">${iconSVG('steps',18)}</span>
          <span style="min-width:0;flex:1;font-size:13px;font-weight:650;color:var(--muted)"><b style="color:var(--ink,var(--text))">Stage ${li+1}: ${lm} of ${st.words.length} words mastered</b> — ${st.words.length-lm} to go.${(()=>{ const pend=st.words.filter(w=>{ const r=mastGet(c,w.w); return r&&r.b===1; }).length; return pend?` <b style="color:var(--good)">${pend} spelled right</b> — spell them right again on another day and they count as mastered.`:''; })()} Master them all (or pass the ⚡ Challenge) to open Stage ${li+2}.</span>
          <div style="flex-shrink:0;width:90px;height:7px;border-radius:999px;background:var(--tint-deep,var(--surface2));overflow:hidden"><div style="height:100%;background:var(--good);width:${Math.round(lm/st.words.length*100)}%"></div></div>
        </div>
        ${(()=>{ const miss=st.words.filter(w=>!state.luMastered[nkey(w.w)]);
          return `<div style="flex:1;min-width:100%;display:flex;align-items:center;gap:7px;flex-wrap:wrap;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:11px 16px;text-align:left"><span style="font-size:13px;font-weight:800;flex-shrink:0">Still to master · ${miss.length}:</span>${miss.slice(0,14).map(w=>`<button data-act="say" data-arg="${escA(w.w)}" title="Tap to hear" style="font-family:var(--mono);font-size:12px;font-weight:700;padding:5px 10px;border-radius:6px;background:var(--paper,var(--bg2));border:1px solid var(--line)">${esc(w.w)}</button>`).join('')}${miss.length>14?`<span class="sb-cn">+${miss.length-14} more</span>`:''}</div>`; })()}`;
      } } }catch(e){}
  /* The Atlas gate card carries its own Redo and Back, so the generic footer pair
     below would offer the same two actions a second time, in different words. */
  let atlasGate=false;
  try{ if(S.trailReturn && typeof window.SB_TRAIL_BEST==='function'){ const tb0=SB_TRAIL_BEST(S.trailReturn);
    atlasGate=!!(tb0 && tb0.p>=tb0.gate); } }catch(e){}
  return `<div style="max-width:720px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="text-align:center;margin-bottom:18px"><div style="width:78px;height:86px;margin:0 auto 8px">${mascotSVG(mood)}</div>
      <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">Test complete!</h2>
      <div style="font-size:15px;color:var(--muted);font-weight:700">${esc((S.sessionLabel||'Practice').split(' · ')[0])} — you spelled <b style="color:var(--good)">${ok.length}</b> of <b style="color:var(--text)">${total}</b> right (${pct}%)</div></div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px">${col('Spelled correctly',ok,true)}${col('Misspelt',bad,false)}</div>
    ${(window.SB_TM&&SB_TM.on()&&!S.tmReacted)?`<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:0 0 14px;padding:12px;border-radius:14px;background:var(--surface2)">
      <span style="font-size:13px;font-weight:800;color:var(--muted)">How did that feel?</span>
      ${['love|😍','ok|🙂','meh|😕'].map(o=>{const[v,g]=o.split('|');return `<button data-act="tmReact" data-arg="${v}" aria-label="${v}" style="font-size:24px;line-height:1;background:none;padding:4px 7px;border-radius:10px">${g}</button>`;}).join('')}
    </div>`:''}
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      ${(()=>{ /* an Atlas session says what the score MEANT, right here — reading the
           RECORDED best, so a 3-word redo round cannot claim an unlock it did not earn */
        try{ if(S.trailReturn && typeof window.SB_TRAIL_BEST==='function'){ const tb=SB_TRAIL_BEST(S.trailReturn);
          if(tb) return tb.p>=tb.gate
            ? (()=>{ /* CLEARING THE GATE IS A FORK, NOT A DOOR. This used to be one
                 button back to the stop, so the moment a child earned the next stop
                 the app chose for them. Four ways on, in the order a child is most
                 likely to want them: go on, go deeper, go again, go back. The
                 lesson choice only appears when the stop HAS a chapter — an Ultra
                 landmark has none, and an option that explains nothing is worse
                 than no option. */
              const hasLesson=(()=>{ try{ return !!(window.SB_TRAIL_HASLESSON&&SB_TRAIL_HASLESSON(S.trailReturn)); }catch(e){ return false; } })();
              /* the stop's sets, so the round button can name the one still owed
                 rather than the vague "New words" — a child who has just cleared
                 set 2 of 4 should be told that set 3 is what comes next */
              const sx=(()=>{ try{ return window.SB_TRAIL_SETS?SB_TRAIL_SETS(S.trailReturn):null; }catch(e){ return null; } })();
              /* One or two words on each, and the app's own icon set — an emoji
                 renders as a different picture on every platform and reads as
                 filler beside artwork this considered. */
              /* The primary takes the whole first line and the rest sit four
                 across, folding to 2x2 on a phone. Letting all five share one
                 flex line left the last one stranded at full width on its own
                 row, which reads as a mistake rather than as emphasis. */
              const opt=(act,arg,ico,label,primary)=>`<button data-act="${act}"${arg?` data-arg="${escA(arg)}"`:''} style="${primary?'flex:1 1 100%':'flex:1 1 calc(25% - 7px);min-width:118px'};display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 12px;border-radius:13px;font-family:var(--display);font-weight:800;font-size:14px;letter-spacing:.01em;white-space:nowrap;${primary?'background:var(--good);border:1px solid var(--good);color:#fff;box-shadow:var(--edge)':'background:var(--bg2);border:1px solid var(--line);color:var(--text)'}">
                  <span style="display:inline-flex;line-height:0;flex-shrink:0;opacity:${primary?'1':'.75'}">${iconSVG(ico,17)}</span>${label}
                </button>`;
              return `<div style="flex:1;min-width:100%">
                <div style="display:flex;align-items:center;gap:9px;margin-bottom:11px;padding:11px 15px;border-radius:14px;background:color-mix(in srgb,var(--good) 15%,transparent);border:1px solid color-mix(in srgb,var(--good) 45%,var(--line))">
                  <span style="display:inline-flex;line-height:0;color:var(--good);flex-shrink:0">${iconSVG('star',17)}</span>
                  <span style="font-size:13.5px;font-weight:800;color:var(--good)">Best ${tb.p}% — you passed ${tb.gate}% and the next stop is open.${(sx&&sx.sets>1)?` ${sx.cleared} of ${sx.sets} sets cleared.`:''} What next?</span></div>
                <div style="display:flex;gap:9px;flex-wrap:wrap">
                  ${opt('atlasNext','next','compass','Next stop',true)}
                  ${hasLesson?opt('atlasNext','lesson','book','Learn more'):''}
                  ${opt('atlasNext','round','sparkle',(sx&&sx.sets>1)?`Practise set ${sx.next}`:'New words')}
                  ${opt('restartSession',null,'retry','Redo list')}
                  ${opt('atlasNext',null,'arrowLeft','Back')}
                </div></div>`;
            })()
            : `<div style="flex:1;min-width:100%;display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--treasure,#FFD24D) 22%,var(--bg2));border:1px solid color-mix(in srgb,var(--treasure,#FFD24D) 50%,var(--line));border-radius:14px;padding:12px 16px;text-align:left"><span style="font-size:16px">👉</span><span style="font-size:13px;font-weight:700;line-height:1.45">Best so far ${tb.p}% — reach ${tb.gate}% on a full round to open the next Atlas stop.${bad.length?' The misspelt words below are the gap.':''}</span></div>`;
        } }catch(e){} return ''; })()}
      ${advBtn}
      ${bad.length?`<button data-act="drillMisspelt" style="flex:1;min-width:200px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Spell the ${bad.length} misspelt word${bad.length>1?'s':''} →</button>`:''}
      ${atlasGate?'':`<button data-act="restartSession" style="flex:1;min-width:160px;padding:14px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">${iconSVG('arrow',16)} Restart the list</button>
      <button data-act="exitTrain" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:15px">Done</button>`}
    </div>
  </div>`;
}
function trainerCard(){
  if(state.sessionOver) return sessionResults();
  const S=state; const word=curWord(); const st=S.status;
  let resultText='',resultStyle=''; const primaryLabel=(st==='idle')?'Check':'Check again'; const showResult=(st!=='idle');
  const rbase='border-radius:14px;padding:13px 16px;font-weight:800;font-size:15px;margin-bottom:16px;animation:sb-pop .3s ease both;';
  if(st==='correct'){ resultText='✓ Correct! Nicely spelled — next word…'; resultStyle=rbase+'background:color-mix(in srgb,var(--good) 18%,transparent);color:var(--good)'; }
  /* a miss shows the letters and the why, and HOLDS (FIX-BEE D3) — see missFeedbackHTML */
  else if(st==='wrong'){ resultText=''; resultStyle=''; }
  else if(st==='revealed'){ resultText=''; resultStyle=''; }
  // Correct auto-advances (no click needed). Wrong and Show-answer HOLD, so the reader
  // controls when the spelling leaves the screen — they get a Next word button instead.
  const showMarks=(st==='idle'||st==='revealed');
  const completeHot=false, reviseHot=(st==='revealed');
  const completeStyle=completeHot
    ? 'background:var(--good);border:1px solid var(--good);color:#fff;box-shadow:0 4px 14px color-mix(in srgb,var(--good) 45%,transparent);animation:sb-pop .3s ease'
    : 'background:color-mix(in srgb,var(--good) 15%,transparent);border:1px solid var(--good);color:var(--good)';
  const reviseStyle=reviseHot
    ? 'background:var(--treasure,#F0B429);border:1px solid var(--treasure,#F0B429);color:#3a2a00;box-shadow:0 4px 14px color-mix(in srgb,var(--treasure,#F0B429) 50%,transparent);animation:sb-pop .3s ease'
    : 'background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border:1px solid var(--treasure,#F0B429);color:var(--treasure-deep,#8A5B00)';
  const hints=[];
  if(S.showDef){ hints.push('<b>Definition</b> — '+blankHTML(word.d,word.w)+'.'); } // meaning only — spelling hints (word.h) teach letters, so they never show mid-spell
  if(S.showSent) hints.push('<b>Sentence</b> — '+blankHTML(word.s,word.w));
  if(S.showOrigin) hints.push('<b>Origin</b> — '+esc(word.o||'—')+'.'); // language of origin only — the full etymology (word.r) spells out the roots and would leak the answer
  const tchip=(on,label,act)=>`<button data-act="${act}" style="padding:9px 14px;border-radius:999px;font-weight:700;font-size:13px;border:1px solid ${on?'var(--accent)':'var(--line)'};${on?'background:var(--accent);color:#fff':'background:transparent;color:var(--text)'}">${label}</button>`;
  const mascotAnim=st==='correct'?'animation:sb-pop .4s ease':'';   // no head-shake on a miss: the bee stays kind
  return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(22px,5vw,34px);box-shadow:var(--glow);text-align:center;position:relative">
      <div style="height:6px"></div>
      <div style="width:96px;height:108px;margin:0 auto 4px"><div style="${mascotAnim};width:96px;height:108px">${mascotSVG(S.mood)}</div></div>
      <div style="display:flex;justify-content:center;gap:12px;margin-bottom:18px">
        <button data-act="speak" aria-label="Hear the word" title="Hear the word" style="width:54px;height:54px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',24)}</button>
        <button data-act="speakSlow" aria-label="Hear it slowly" title="Hear it slowly" style="width:54px;height:54px;border-radius:50%;background:var(--surface2);color:var(--accent);border:1px solid var(--line);display:grid;place-items:center">${tortoiseSVG(26)}</button>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:18px">${tchip(S.showDef,'Definition','toggleDef')}${tchip(S.showSent,'Sentence','toggleSent')}${tchip(S.showOrigin,'Origin','toggleOrigin')}</div>
      ${hints.length?`<div style="background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:14px 16px;text-align:left;font-size:15px;line-height:1.6;margin-bottom:18px">${hints.join('  ·  ')}</div>`:''}
      <input data-inp="onType" data-key="trainKey" data-fkey="typed" value="${escA(S.typed)}" placeholder="spell it" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" style="width:100%;text-align:center;padding:16px 14px;border-radius:14px;background:var(--surface);border:2px solid var(--line);color:var(--text);font-family:var(--entry);font-weight:700;font-size:clamp(20px,5vw,28px);letter-spacing:.14em;text-transform:lowercase;outline:none;margin-bottom:16px">
      ${st==='wrong'?missFeedbackHTML(word, S.lastTry||'', {head:nearHead(S.lastTry,word&&word.w), foot:'⚑ Saved for revision. Take your time — tap Next word when you are ready.'})
        :st==='revealed'?missFeedbackHTML(word, '', {head:'The word is', foot:'⚑ Saved for revision.'})
        :(showResult?`<div style="${resultStyle}">${esc(resultText)}</div>`:'')}
      <div style="display:flex;gap:10px;flex-wrap:wrap"><button data-act="reveal" style="padding:14px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Show answer</button><button data-act="primary" style="flex:1;min-width:120px;padding:14px;border-radius:14px;${showResult?'background:var(--surface2);color:var(--text);border:1px solid var(--line)':'background:var(--accent);color:#fff;box-shadow:var(--edge)'};font-weight:800;font-size:15px">${primaryLabel}</button>${st==='wrong'?`<button data-act="next" style="flex:1;min-width:120px;padding:14px;border-radius:14px;background:var(--accent);color:#fff;box-shadow:var(--edge);font-weight:800;font-size:15px">Next word →</button>`:''}</div>
    </div>`;
}
// finished the deck → next-step choices
function cardDonePanel(){ const miss=((active().missed)||[]).length;
  return `<div style="max-width:360px;margin:0 auto;background:var(--bg2);border:1px solid var(--line);border-radius:24px;box-shadow:var(--glow);padding:28px 26px;text-align:center;animation:sb-rise .3s ease both">
    <div style="width:92px;height:104px;margin:0 auto 2px">${mascotSVG('excited')}</div>
    <div style="font-family:var(--display);font-weight:800;font-size:22px">All cards learnt! 🎉</div>
    <div style="font-size:13px;color:var(--muted);line-height:1.5;margin:6px 0 18px">You’ve been through every word in this set. What next?</div>
    <div style="display:flex;flex-direction:column;gap:9px">
      <button data-act="cardToPractice" style="padding:14px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Practice &amp; test →</button>
      ${miss?`<button data-act="cardToRevise" style="padding:14px;border-radius:12px;background:color-mix(in srgb,var(--treasure,#F0B429) 18%,transparent);border:1px solid var(--treasure,#F0B429);color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:15px">${iconSVG('flag',14,2.4)} Revise the ${miss} revision word${miss>1?'s':''}</button>`:''}
      <div style="display:flex;gap:9px">
        <button data-act="cardRestart" style="flex:1;padding:11px;border-radius:12px;background:var(--surface2);color:var(--text);font-weight:800;font-size:13px">↺ Cards again</button>
        ${backPill('toggleCardView','Back to Learn',null)}
      </div>
    </div></div>`;
}
// Practice Vocabulary — a 4-option meaning quiz on the list's words. Optional (no level impact);
// a correct pick earns a coin.
function vocabPracticeCard(){
  if(!state.vp && !state.vpAllDone) app.vocabNewQ();
  // Whole list matched — a calm "all done" panel (the big celebration fires once, on completion)
  if(state.vpAllDone && !state.vp){ const right=state.vpRight||0, total=state.vpDone||0; const pct=total?Math.round(right/total*100):0;
    return `<div style="max-width:520px;margin:0 auto;text-align:center">
      <div style="width:132px;height:132px;margin:6px auto 4px">${myAvatar(132)}</div>
      <div style="font-family:var(--display);font-weight:800;font-size:26px;margin:6px 0 4px">Every word — matched! 🌟</div>
      <div style="font-size:14.5px;color:var(--muted);font-weight:500;margin-bottom:6px">You went through the whole list and matched <b style="color:var(--text)">${right}</b> of <b style="color:var(--text)">${total}</b> meanings${pct>=80?' — superb!':pct>=50?' — nicely done!':'.'}</div>
      <div style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:var(--treasure-deep,#8A5B00);background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border-radius:999px;padding:5px 13px;margin-bottom:16px">🪙 ${(active().coins)||0} coins</div>
      <div><button data-act="vocabRestart" style="padding:13px 26px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">↺ Play the list again</button></div>
    </div>`; }
  const vp=state.vp;
  if(!vp) return `<div style="max-width:520px;margin:0 auto">${beeEmpty('sleepy','No words with meanings in this list yet — pick a list with definitions and try again.')}</div>`;
  const w=vp.w;
  const optBtn=(o,i)=>{ let bg='var(--surface2)',bd='var(--line)',col='var(--text)',mark='';
    if(vp.picked!=null){ if(o.correct){ bg='color-mix(in srgb,var(--good) 16%,transparent)'; bd='var(--good)'; col='var(--good)'; mark=' ✓'; }
      else if(i===vp.picked){ bg='color-mix(in srgb,var(--bad) 14%,transparent)'; bd='var(--bad)'; col='var(--bad)'; mark=' ✗'; } else { col='var(--muted)'; } }
    return `<button data-act="vocabPick" data-arg="${i}" ${vp.picked!=null?'disabled':''} style="display:block;width:100%;text-align:left;padding:13px 15px;border-radius:14px;background:${bg};border:1.5px solid ${bd};color:${col};font-weight:700;font-size:14.5px;line-height:1.42;margin-bottom:9px">${esc(o.d)}${mark}</button>`; };
  return `<div style="max-width:560px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:12px">
      <span style="font-size:12px;color:var(--muted);font-weight:700">Optional — doesn’t change your level, but great practice (recommended!)</span>
      <span style="margin-left:auto;display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:800;color:var(--treasure-deep,#8A5B00);background:color-mix(in srgb,var(--treasure,#F0B429) 16%,transparent);border-radius:999px;padding:4px 11px">🪙 ${(active().coins)||0}</span>
      ${vp.total?`<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">Word ${vp.idx||1} of ${vp.total}</span>`:''}
      ${state.vpDone?`<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted)">✓ ${state.vpRight||0}/${state.vpDone}</span>`:''}
    </div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:clamp(20px,4vw,28px);box-shadow:var(--glow)">
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:6px">What does this word mean?</div>
        <div style="display:flex;align-items:center;justify-content:center;gap:11px;flex-wrap:wrap">
          <div style="font-family:var(--display);font-weight:800;${hwStyle(w.w,34)}">${esc(w.w)}</div>
          <button data-act="vocabSay" title="Hear the word" aria-label="Hear the word" style="width:42px;height:42px;flex-shrink:0;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',20)}</button>
        </div>
        ${w.p?`<div style="font-family:var(--mono);font-size:12px;color:var(--accent);font-weight:700;margin-top:4px">/ ${esc(w.p)} /</div>`:''}
      </div>
      ${vp.opts.map(optBtn).join('')}
      ${vp.picked!=null?`<div style="display:flex;justify-content:flex-end;margin-top:4px"><button data-act="vocabNext" style="padding:10px 18px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:14px;box-shadow:var(--edge)">Next word →</button></div>`:''}
    </div>
  </div>`;
}
function coachFlashCard(){
  if(state.cardDone) return cardDonePanel();
  const ws=learnWords(); const N=ws.length||1; const i=Math.min(Math.max(state.cardIdx||0,0),N-1); const w=ws[i]||{w:'',d:'',s:'',o:''};
  const pct=Math.round((i+1)/N*100); const onRev=((active().missed)||[]).some(m=>nkey(m.w)===nkey(w.w));
  const chip=(t)=>`<span style="padding:4px 11px;border-radius:999px;background:var(--surface2);font-size:11.5px;color:var(--muted);font-weight:700">${t}</span>`;
  const revCol='var(--treasure-deep,#8A5B00)', okCol='var(--good)';
  return `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <span style="font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap">Card ${i+1} of ${N}</span>
      <div style="flex:1;height:7px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:var(--accent);width:${pct}%;transition:width .3s"></div></div>
      ${onRev?'<span style="color:var(--treasure-deep,#8A5B00);font-weight:800;font-size:12px;white-space:nowrap">'+iconSVG('flag',14,2.4)+' On revise</span>':''}
    </div>
    <div data-swipe="coach" class="coach-card" style="position:relative;max-width:340px;margin:0 auto;min-height:min(72vh,470px);border-radius:24px;overflow:hidden;touch-action:pan-y;-webkit-user-select:none;user-select:none">
      <div class="coach-glimmer"></div>
      <!-- One d-pad everywhere in the app: ← previous · ↑ deck · ↓ revise · → next.
           Each edge is both a tap target and a label, and the arrow keys and swipes match. -->
      <div data-act="cardBack" title="Previous card" style="position:absolute;top:34px;left:0;bottom:34px;width:50%;z-index:1;cursor:${i>0?'pointer':'default'}"></div>
      <div data-act="cardNext" title="Next word" style="position:absolute;top:34px;right:0;bottom:34px;width:50%;z-index:1;cursor:pointer"></div>
      <button data-act="cardBack" ${i>0?'':'disabled'} title="Previous card (← key)" aria-label="Previous card" style="position:absolute;left:0;top:34px;bottom:34px;width:34px;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:0;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) ${i>0?'22':'8'}%,transparent),transparent);color:${i>0?'var(--accent)':'var(--muted)'};${i>0?'':'opacity:.5'}"><span style="font-size:15px;font-weight:900">‹</span><span style="font-size:9px;font-weight:800;writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:.08em">PREVIOUS</span></button>
      <button data-act="cardNext" title="Next word (→ key)" aria-label="Next word" style="position:absolute;right:0;top:34px;bottom:34px;width:34px;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;border:0;background:linear-gradient(270deg,color-mix(in srgb,var(--good) 22%,transparent),transparent);color:${okCol}"><span style="font-size:15px;font-weight:900">›</span><span style="font-size:9px;font-weight:800;writing-mode:vertical-rl;letter-spacing:.08em">NEXT</span></button>
      <button data-act="toggleCardView" title="Back to the deck (↑ key)" aria-label="Back to the deck" style="position:absolute;left:0;right:0;top:0;height:34px;z-index:4;display:flex;align-items:center;justify-content:center;gap:7px;border:0;background:linear-gradient(180deg,color-mix(in srgb,var(--accent) 20%,transparent),transparent);color:var(--accent);font-size:9.5px;font-weight:800;letter-spacing:.09em">↑ DECK</button>
      <button data-act="cardRevise" title="Mark for revision (↓ key)" aria-label="Mark for revision" style="position:absolute;left:0;right:0;bottom:0;height:34px;z-index:4;display:flex;align-items:center;justify-content:center;gap:7px;border:0;background:linear-gradient(0deg,color-mix(in srgb,var(--treasure,#F0B429) 26%,transparent),transparent);color:${revCol};font-size:9.5px;font-weight:800;letter-spacing:.09em">↓ ${onRev?'ON REVISE':'REVISE'}</button>
      ${/* justify-content:center on a fixed-height flex column overflows BOTH ends, and a
            browser cannot scroll above the start of its content — so on a 45-letter word the
            top of the card became unreachable and the headword and the syllable line drew
            over each other. The card now GROWS (min-height, not height) and the content is
            centred by `margin:auto 0` on a single child, which centres when there is room
            and clamps to the top when there is not. */''}
      <div style="position:relative;z-index:2;pointer-events:none;min-height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:44px 40px 42px">
        <div style="margin:auto 0;width:100%;display:flex;flex-direction:column;align-items:center">
        <div style="font-family:var(--display);font-weight:800;max-width:100%;${hwStyle(w.w,33)}">${esc(w.w)}</div>
        ${w.sy&&w.sy.toLowerCase()!==(w.w||'').toLowerCase()?`<div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--accent);font-weight:700;letter-spacing:.04em;margin-top:4px;max-width:100%;overflow-wrap:anywhere;word-break:break-word;line-height:1.35">${esc(w.sy)}</div>`:''}
        <div style="display:flex;gap:10px;justify-content:center;margin:13px 0 4px;pointer-events:auto">
          <button data-act="cardSpeak" aria-label="Hear the word" title="Hear the word" style="width:46px;height:46px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;box-shadow:var(--edge)">${iconSVG('volume',21)}</button>
          <button data-act="cardSpeakSlow" aria-label="Hear it slowly" title="Hear it slowly" style="width:46px;height:46px;border-radius:50%;background:var(--surface2);color:var(--accent);border:1px solid var(--line);display:grid;place-items:center">${tortoiseSVG(23)}</button>
        </div>
        ${w.d?`<div style="font-size:15px;color:var(--text);line-height:1.5;margin-top:8px">${esc(w.d)}</div>`:''}
        ${w.s?`<div style="font-size:12.5px;color:var(--muted);line-height:1.55;margin-top:9px"><b style="color:var(--text)">Sentence.</b> ${esc(w.s)}</div>`:''}
        ${w.h?`<div style="display:flex;align-items:flex-start;gap:7px;font-size:12.5px;color:var(--text);line-height:1.5;margin-top:10px;background:var(--chip);border-radius:10px;padding:8px 11px"><span style="color:var(--accent);margin-top:1px;flex-shrink:0">${iconSVG('bulb',14)}</span><span>${esc(w.h)}</span></div>`:''}
        <div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:12px">${w.p?chip('/ '+esc(w.p)+' /'):''}${w.o?chip(esc(w.o)):''}${w.ps?chip(esc(w.ps)):''}</div>
        </div>
      </div>
    </div>`;
}
function viewTrain(){
  const S=state; const goalTarget=active().goal||S.draft.goal||10; const goalDoneN=goalToday(); const goalPctNum=Math.min(100,Math.round((goalDoneN/goalTarget)*100));
  /* The Practice side of the two-way link: when these words came from a stop on the
     Word Atlas, the drill says which stop and offers the way back. */
  const from=(()=>{ try{ if(!S.trailReturn||typeof window.SB_TRAIL_WHERE!=='function') return '';
      const w=SB_TRAIL_WHERE(S.trailReturn); if(!w) return '';
      return `<button data-act="trailUnit" data-arg="${escA(w.unit)}" style="display:inline-flex;align-items:center;gap:7px;margin-bottom:12px;padding:7px 13px;border-radius:var(--r-pill,999px);background:var(--chip);color:var(--accent);font-weight:800;font-size:12.5px">
        ${iconSVG('steps',14)} From the Word Atlas · ${esc(w.act)} · stop ${w.stop} of ${w.total}</button>`; }catch(e){ return ''; } })();
  /* THE WHOLE SET, ON TOP. A drill hands one card at a time; this is the way to
     see what the set holds without walking it. It sits with the back pill
     because that is the row a child reads before they start. */
  const nCards=(S.sessionWords&&S.sessionWords.length)||0;
  const deck=nCards>1?`<button data-act="deckOpen" title="See every card in this set" style="display:inline-flex;align-items:center;gap:7px;padding:8px 13px;border-radius:var(--r-pill,999px);background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12.5px">${iconSVG('grid',15)} View all ${nCards} cards</button>`:'';
  return `<div style="max-width:620px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:14px">${backPill('exitTrain',S.trailReturn?'Back to the stop':'Exit',null)}${deck}<div style="margin-left:auto;font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">${S.sessionDone} done · ${S.sessionRight} correct</div></div>
    ${from}
    <div class="sb-train-bar" style="height:7px;border-radius:999px;background:var(--surface2);overflow:hidden;margin-bottom:22px"><div style="height:100%;background:var(--accent);border-radius:999px;width:${goalPctNum}%;transition:width .4s"></div></div>
    ${(S.coachCardView&&!S.sessionOver)?coachFlashCard():trainerCard()}
    ${liveHeatmap(S.sessionWords&&S.sessionWords.length?S.sessionWords:WORDS, {anon:true})}
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
    if(anon && isCur) return `<span title="current word — hidden" style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;padding:5px 9px;border-radius:6px;color:var(--muted);background:var(--surface2);box-shadow:0 0 0 2px var(--accent)">•••</span>`;
    /* A 58-letter word made this chip wider than a phone screen and pushed the whole page
       sideways — cap it at the row width and let it wrap inside itself.
       And the tray holds words of wildly different lengths side by side, so a flat 12px
       left "sapphic" looking oversized next to a 45-letter monster that ate a whole row.
       chipType() steps the size down with length, the same idea hwStyle uses on headwords,
       so every chip takes a comparable amount of the row. */
    return `<button data-act="wordCard" data-arg="${escA(w.w)}" title="open the learn card" style="font-family:var(--display);font-variant-numeric:tabular-nums;${chipType(w.w)};font-weight:700;padding:5px 9px;border-radius:6px;min-width:0;text-align:left;overflow-wrap:anywhere;word-break:break-word;line-height:1.25;color:${fg};background:${bg};${isCur?'box-shadow:0 0 0 2px var(--accent)':''}">${esc(w.w)}</button>`;
  }).join('');
  const legend=[['var(--good)','Mastered'],['var(--bad)','Missed'],['var(--surface2)','New']].map(([c,l])=>`<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:700"><span style="width:11px;height:11px;border-radius:6px;background:${c};display:inline-block"></span>${l}</span>`).join('');
  const pct=Math.round(m/N*100);
  const toggle=(anon?`<button data-act="toggleHeat" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px;white-space:nowrap">${iconSVG(reveal?'eyeoff':'eye',14)} ${reveal?'Hide words':'Show words'}</button>`:'')
    +(opts.print?`<button data-act="openListView" title="See every word with meanings, pronunciations & hints" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px;white-space:nowrap">${iconSVG('book',15)} View complete list</button>`:'')
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
      ${backPill('goHome','Home',null)}
      <span style="display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${esc(rankName(fIdx))}</span>
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
  if(S.coachCardView) body=coachFlashCard();
  else if(S.luTab==='practice') body=trainerCard();
  else body=`<div style="display:flex;margin-bottom:10px"><button data-act="toggleCardView" title="Card view — flip through these words, starting on this one" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12.5px">${cardsSVG(15)} Card view</button></div>`+wordFlash(lw, S.reviseIdx, 'reviseNav', { practise:true });
  return `<div style="max-width:760px;margin:0 auto">${header}
    <div style="display:flex;gap:6px;background:var(--surface2);border-radius:14px;padding:5px;margin-bottom:16px">${tab('revise','Revise')}${tab('practice','Practice')}</div>
    ${S.coachCardView?'':wordsPanel}${body}${liveHeatmap(lw, {anon:S.luTab==='practice'})}</div>`;
}
/* ===================== Print a word list ===================== */
function printDoc(key){ const p=(state.prn&&state.prn.inc)?state.prn:{inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
  const inc=p.inc, page=p.page||'letter', scope=p.scope||'level', sort=p.sort||'level', compact=p.size==='compact';
  const c=active(); let words=(scope==='level'?listWords(key):listFullWords(key)).filter(w=>w&&w.w);
  if(sort==='alpha') words=words.slice().sort((a,b)=>a.w.localeCompare(b.w));
  else if(sort==='diff') words=words.slice().sort((a,b)=>((a.y||3)-(b.y||3))||((a.bp||0)-(b.bp||0))||a.w.localeCompare(b.w));
  const PRINT_CAP=2400; const total=words.length; if(words.length>PRINT_CAP) words=words.slice(0,PRINT_CAP);   // giant lists would hang the browser
  const label=listLabel(key).split(' · ')[0]; const sizes={letter:'letter',a4:'A4',a5:'A5'};
  const wide = inc.d || inc.s;                       // meanings or sentences need the full row
  let cols = wide ? 1 : ((inc.w?1:0)+(inc.p?1:0)>1 ? 2 : 3);
  if(compact) cols += 1;                                             // compact squeezes one extra column in
  const rows=words.map((w,i)=>{ const say=w.p||w.sy||'';
    const wordBit = inc.w ? `<span class="w">${esc(w.w)}</span>` : `<span class="blank"></span>`;
    const sayBit  = (inc.p&&say) ? `<span class="p">${esc(say)}</span>` : '';
    const defBit  = (inc.d&&w.d) ? `<div class="d">${esc(inc.w?w.d:maskTxt(w.d,w.w))}</div>` : '';
    const sentBit = (inc.s&&w.s) ? `<div class="s">“${esc(inc.w?w.s:maskTxt(w.s,w.w))}”</div>` : '';
    if(wide) return `<div class="cell full"><div><span class="n">${i+1}</span>${wordBit}${sayBit}</div>${defBit}${sentBit}</div>`;
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
    .s{font-size:${fz.d}px;color:#666;font-style:italic;line-height:1.35;margin:2px 0 0 ${compact?22:28}px}
    .blank{display:inline-block;min-width:${compact?90:120}px;border-bottom:1.4px solid #444;height:${compact?10:13}px}
    .foot{margin-top:${compact?9:16}px;font-size:${compact?10:12}px;color:#888;text-align:center}
  </style></head><body>
    <h1>${esc(label)}${inc.w?'':' — quiz sheet'}</h1>
    <div class="meta">${esc(c.name||'Speller')} · ${words.length}${total>words.length?(' of '+total):''} words${sortNote} · ${scope==='level'?('Stage '+(listStageIdx(c,key)+1)):'whole list'}${total>words.length?' (first '+PRINT_CAP+' shown — print a Stage for a focused sheet)':''} · printed ${new Date().toLocaleDateString()} · Bizzing Bee</div>
    <div class="grid">${rows}</div>
    <div class="foot">${inc.w?'Say it → spell it → say it again. 🐝':'Read the clue, write the word — check together afterwards. 🐝'}</div>
  </body></html>`; }
// Printable flashcards — one word per card (front = full detail + checkbox + note lines,
// back = Bizzing Bee honeycomb backdrop with the word's level). 4 cards/page, backs mirrored
// per row so they line up behind the fronts when duplex-printed.
function printCards(key){ const p=(state.prn&&state.prn.inc)?state.prn:{inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
  const scope=p.scope||'level', sort=p.sort||'level'; const c=active();
  let words=(scope==='level'?listWords(key):listFullWords(key)).filter(w=>w&&w.w);
  if(sort==='alpha') words=words.slice().sort((a,b)=>a.w.localeCompare(b.w));
  else if(sort==='diff') words=words.slice().sort((a,b)=>((a.y||3)-(b.y||3))||((a.bp||0)-(b.bp||0))||a.w.localeCompare(b.w));
  const CAP=400; const total=words.length; if(words.length>CAP) words=words.slice(0,CAP);
  const label=listLabel(key).split(' · ')[0]; const sizes={letter:'letter',a4:'A4',a5:'A5'};
  const LC=(y)=>{ y=y||3; return y<=1?['#35B6E8','#1E8FC4']:y===2?['#6C7CF0','#4F5CD8']:y===3?['#9B5CF0','#7C3FD8']:y===4?['#E45CB0','#C43A92']:y===5?['#F0913C','#D4711C']:['#E8503E','#C43222']; };
  // a different avatar per card, picked deterministically from the word so it's stable
  const AVL=(window.SB_AVATARS&&SB_AVATARS.list)||[];
  const cardAv=(word)=>{ if(!AVL.length) return ''; let h=0; const s=String(word); for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; const id=AVL[h%AVL.length].id; try{ return avatarSVG(id,46); }catch(e){ return ''; } };
  const front=(w)=>{ const pron=w.p||w.sy||''; const cc=LC(w.y); const meta=[pron?esc(pron):'',w.ps?esc(w.ps):''].filter(Boolean).join(' · '); const av=cardAv(w.w);
    return `<div class="card front" style="--c1:${cc[0]};--c2:${cc[1]}">
      <div class="fbanner"><span class="cbox"></span><div class="fw">${esc(w.w)}</div>${meta?`<div class="fmeta">${meta}</div>`:''}</div>
      <div class="fbody">
        ${w.d?`<div class="frow"><span class="ic">📖</span><div class="ftx"><b>Meaning</b>${esc(w.d)}</div></div>`:''}
        ${w.s?`<div class="frow"><span class="ic">💬</span><div class="ftx"><b>In a sentence</b>${esc(w.s)}</div></div>`:''}
        ${w.o?`<div class="frow"><span class="ic">🌍</span><div class="ftx"><b>Origin</b>${esc(w.o)}${w.r?('. '+esc(w.r)):''}</div></div>`:''}
        ${w.h?`<div class="fhint"><span class="ic">💡</span><div><b>Memory trick</b>${esc(w.h)}</div></div>`:''}
        ${realMiss(w)?`<div class="fmis">⚠️ Often misspelled “${esc(w.m)}”</div>`:''}
        <div class="fnotes"><span class="nlab">✏️ My notes</span><span class="nl"></span><span class="nl"></span></div>
      </div>${av?`<div class="favatar">${av}</div>`:''}</div>`; };
  /* Fronts only. The decorative back sheet doubled the paper for no teaching value, and
     duplex mirroring made it fragile on any printer that feeds differently. */
  let pages=''; for(let i=0;i<words.length;i+=4){
    pages+='<div class="page">'+words.slice(i,i+4).map(front).join('')+'</div>'; }
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(label)} — Bizzing Bee flashcards</title><style>
    @page{size:${sizes[p.page]||'letter'} portrait;margin:8mm} *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Trebuchet MS','Segoe UI',Verdana,sans-serif;color:#241E33}
    .page{display:flex;flex-wrap:wrap;gap:9mm 8mm;justify-content:center;align-content:flex-start;page-break-after:always}
    .card{width:90mm;height:125mm;border:2.5px solid var(--c1);border-radius:18px;overflow:hidden;position:relative;display:flex;flex-direction:column;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    /* front banner */
    .fbanner{background:linear-gradient(135deg,var(--c1),var(--c2));color:#fff;padding:15px 18px 15px;position:relative}
    .fw{font-size:38px;font-weight:800;line-height:1;letter-spacing:.005em;overflow-wrap:anywhere;text-shadow:0 1.5px 3px rgba(0,0,0,.18);padding-right:36px}
    .fmeta{font-size:14px;font-style:italic;opacity:.96;margin-top:5px}
    .cbox{position:absolute;top:14px;right:15px;width:30px;height:30px;border:3px solid #fff;border-radius:7px;background:rgba(255,255,255,.2)}
    /* front body */
    .fbody{padding:20px 18px 14px;display:flex;flex-direction:column;flex:1}
    .frow{display:flex;gap:10px;font-size:15px;line-height:1.42;color:#2a2740;margin-bottom:11px}
    .frow .ic{font-size:19px;flex-shrink:0;line-height:1.2}
    .ftx b,.fhint b{display:block;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--c1);font-weight:800;margin-bottom:2px}
    .fhint{display:flex;gap:10px;font-size:14.5px;line-height:1.4;color:#1f6b41;background:#edf8f0;border:1.5px solid #bfe6cc;border-radius:12px;padding:10px 12px;margin-bottom:11px}
    .fmis{font-size:13px;color:#b23a4e;font-weight:700;margin-bottom:11px}
    .fnotes{margin-top:auto;padding-top:10px;padding-right:56px;border-top:2.5px dotted color-mix(in srgb,var(--c1) 45%,#fff)}
    .nlab{font-size:12px;font-weight:800;color:var(--c1)}
    .nl{display:block;border-bottom:1.6px solid #d8d0ea;height:19px;margin-top:11px}
    .favatar{position:absolute;bottom:12px;right:12px;width:54px;height:54px;border-radius:50%;background:color-mix(in srgb,var(--c1) 14%,#fff);border:2.5px solid var(--c1);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 7px rgba(0,0,0,.15)}
    .favatar svg{width:44px;height:44px}
    /* back — fun sunburst + confetti backdrop with Bizzy the mascot */
  </style></head><body>${pages}</body></html>`; }
// Champion's Quest — one quest, three paths. The chooser; the paths not picked stay a tap away as lists.
function viewQuest(){
  const c=active(); ensureLists(c); const qp=c.questPath;
  const lvlOf=(k)=>{ try{ return listStageIdx(c,k)+1; }catch(e){ return 1; } };
  const paths=[
    /* col is the path's colour (its icon and border); ink is the same hue dark enough for white 12.5px
       text — #7C5CFF made 4.34:1 and #13A892 2.98:1 with white, under WCAG's 4.5 (P0.19; a11y-axe held
       these in KNOWN until then). The Stage pill's words are half the path's colour and half the look's
       own text ink, so they stay dark on paper and light on dusk. */
    { id:'journey', key:'journey', col:'#7C5CFF', ink:'#6446E0', e:'questJourney', title:'Bizzing Bee Journey',
      desc:'The classic 20-Level champ ladder — the 1,600 highest-value bee words, ramped gently from easy to hard.',
      feat:'Clear a Level by mastering its words, or test out with a Champ Challenge.' },
    { id:'own',     key:'own',     col:'#13A892', ink:'#0E7C6B', e:'questOwn', title:'My Own List',
      desc:'Bring your school list, paste any words, or build a custom set in a few taps.',
      feat:'Perfect for this week’s spelling homework or a personal target list.' },
  ].map(p=>{ const cur=qp===p.id;
    const meta=cur?(p.id==='journey'?('Stage '+lvlOf('journey')):(p.id==='themes'?((myThemes().length||0)+' worlds picked'):'Ready')):'';
    return `<button class="sb-lift" data-act="questPick" data-arg="${p.id}" style="display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;background:var(--paper,var(--bg2));border:1px solid ${cur?p.col:'var(--line)'};border-radius:18px;padding:16px 17px;box-shadow:var(--sh-rest)">
      ${iconTile(p.e, p.col, {size:54, radius:16})}
      <span style="min-width:0;flex:1">
        <span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">${p.title}</span>${cur&&meta?`<span style="font-size:11px;font-weight:800;color:color-mix(in srgb,${p.col} 50%,var(--text));background:color-mix(in srgb,${p.col} 14%,transparent);padding:2px 9px;border-radius:999px">${esc(meta)}</span>`:''}</span>
        <span style="display:block;font-size:13px;color:var(--text);font-weight:600;margin-top:5px;line-height:1.5">${p.desc}</span>
        <span style="display:flex;align-items:flex-start;gap:6px;font-size:12px;color:var(--muted);font-weight:600;margin-top:6px;line-height:1.45"><span style="color:${p.col};flex-shrink:0;margin-top:1px">${SB_ICON('sparkle',{size:13})}</span>${p.feat}</span>
        <span style="display:inline-flex;align-items:center;gap:5px;margin-top:11px;font-weight:800;font-size:12.5px;color:#fff;background:${p.ink};padding:9px 15px;border-radius:10px">${cur?'Continue':(qp?'Switch to this':'Choose this path')} ${SB_ICON('arrowRight',{size:14})}</span>
      </span>
    </button>`; }).join('');
  // Advanced Mode — the fourth, gated path: National Spelling Bee prep from the 130k library.
  const aLvl=lvlOf('journey'); const aBand=(function(){ try{ return beeBand(c).band; }catch(e){ return 2; } })();
  const aUnlocked=advModeOn(c);                                   // owns the Advanced Pack
  const aPrice=(window.ADV&&ADV.price)?ADV.price():299;
  const advCol='#5B3FA6';
  const advTile=`<button class="sb-lift" data-act="openAdvanced" style="display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;border-radius:18px;padding:16px 17px;box-shadow:0 6px 18px rgba(60,40,120,.22);border:1px solid ${aUnlocked?advCol:'var(--line)'};background:${aUnlocked?'linear-gradient(160deg,color-mix(in srgb,'+advCol+' 14%,var(--bg2)),var(--bg2) 60%)':'var(--paper,var(--bg2))'}">
      ${iconTile('advanced', advCol, {size:54, radius:16})}
      <span style="min-width:0;flex:1">
        <span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">Advanced Mode</span>${aUnlocked?`<span style="font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#0a7a44;background:color-mix(in srgb,#39d98a 30%,transparent);padding:2px 8px;border-radius:999px">Unlocked</span>`:`<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:800;color:var(--muted);background:var(--surface2);padding:2px 9px;border-radius:999px">${SB_ICON('lock',{size:12})} Locked</span>`}</span>
        <span style="display:block;font-size:13px;color:var(--text);font-weight:600;margin-top:5px;line-height:1.5">National Spelling Bee prep from the full library of <b>${countTxt('library')} words</b> — a 2-year sprint plan, mock bees, champion tips and advanced games.</span>
        <span style="display:flex;align-items:flex-start;gap:6px;font-size:12px;color:var(--muted);font-weight:600;margin-top:6px;line-height:1.45"><span style="color:${advCol};flex-shrink:0;margin-top:1px">${SB_ICON('sparkle',{size:13})}</span>${aUnlocked?'You’ve earned it — master the very hardest words.':('Comes with the Advanced Pack.')}</span>
        <span style="display:inline-flex;align-items:center;gap:5px;margin-top:11px;font-weight:800;font-size:12.5px;color:#fff;background:${advCol};padding:9px 15px;border-radius:10px">${aUnlocked?'Enter Advanced':'See how to unlock'} ${SB_ICON('arrowRight',{size:14})}</span>
      </span>
    </button>`;
  /* With the pack on, the Ultra Champions Journey IS the advanced path and leads the list.
     It trains through the ordinary shell, so it is a questPick like the others. */
  const uPool=(window.ADV&&ADV.pool)?ADV.pool().length:0;
  const uDays=(function(){ try{ return listStages('ultra').length; }catch(e){ return 0; } })();
  const uCur=(c.activeList||'')==='ultra';
  const ultraTile=aUnlocked?`<button class="sb-lift" data-act="pickUltra" style="display:flex;align-items:flex-start;gap:14px;width:100%;text-align:left;border-radius:18px;padding:16px 17px;background:linear-gradient(135deg,#241B4E,#3A2A72 58%,#5B3FA6);box-shadow:0 8px 22px rgba(36,27,78,.3);color:#fff">
      <span style="width:54px;height:54px;flex-shrink:0;border-radius:16px;background:rgba(255,255,255,.14);display:grid;place-items:center;color:#fff">${(window.SB_ICON_ART&&SB_ICON_ART.ultraJourney)?SB_ICON_ART('ultraJourney',{size:29}):''}</span>
      <span style="min-width:0;flex:1">
        <span style="display:flex;align-items:center;gap:8px;flex-wrap:wrap"><span style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.15">Ultra Champions Journey</span>
          <span style="font-size:10px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;background:rgba(255,255,255,.2);padding:3px 8px;border-radius:999px">Advanced Pack</span>
          ${uCur?`<span style="font-size:11px;font-weight:800;color:#fff;opacity:.85">Day ${listStageIdx(c,'ultra')+1}</span>`:''}</span>
        <span style="display:block;font-size:13px;color:rgba(255,255,255,.92);font-weight:600;margin-top:5px;line-height:1.5">Every one of the <b>${fmtN(uPool)}</b> hardest words in the library, ${((window.ADV&&ADV.daySize)?ADV.daySize():200)} a day, hardest first.</span>
        <span style="display:flex;align-items:flex-start;gap:6px;font-size:12px;color:rgba(255,255,255,.8);font-weight:600;margin-top:6px;line-height:1.45"><span>&#10022;</span><span>${fmtN(uDays)} days, with the same Practice, Test, Revise and Vocab tabs you already use.</span></span>
        <span style="display:inline-flex;align-items:center;gap:5px;margin-top:11px;font-weight:800;font-size:12.5px;color:#3A2A72;background:#fff;padding:9px 15px;border-radius:11px">${uCur?'Continue':'Choose this path'} &rarr;</span>
      </span></button>`:'';
  const un=loreUnlocked(); const all=lessonsAll().length||100;
  const vault=un.length?`<button data-act="openJourneys" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:var(--treasure-tint,#FFF3D6);border:1px solid var(--treasure,#F0B429);border-radius:14px;padding:12px 15px;margin-top:14px">
      ${iconTile('book','#C9922B',{size:40,radius:12})}
      <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:14px;color:var(--treasure-deep,#8A5B00)">Story vault</span><span style="display:block;font-size:12px;color:var(--treasure-deep,#8A5B00);opacity:.85">${un.length} of ${all} word-history tales unlocked</span></span>
      <span style="color:var(--treasure-deep,#8A5B00);font-weight:800">→</span></button>`:'';
  return `<div style="animation:sb-rise .35s ease both;max-width:640px;margin:0 auto">
    ${atlasSubNav('gym')}
    ${pageHead('Word Gym','pick your training path','The Bizzing Bee ladder, your own lists, or Ultra — switch any time, all progress kept. Looking for the concept journey? That’s the Atlas, beside Gym above.')}
    <div style="display:flex;flex-direction:column;gap:12px">${aUnlocked?(ultraTile+paths):paths}</div>
    ${vault}
  </div>`;
}
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
  const dockLabel=(k)=> k==='journey'?journeyName().replace(/^The /,''):listLabel(k).split(' · ')[0];
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
      <div style="min-width:0"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.11em;text-transform:uppercase;opacity:.85;font-weight:700">Now training</div>
        <div style="font-family:var(--display);font-weight:800;font-size:17px;line-height:1.12;text-shadow:0 1px 4px rgba(0,0,0,.16)">${esc(dockLabel(key))}</div>
        <div style="font-size:12px;font-weight:700;opacity:.92">${isJourney?(stage.champ!==false&&sIdx<CHAMP_LEVELS?('Stage '+(sIdx+1)+' of '+CHAMP_LEVELS+' to Champ'):('Champion’s Library · '+esc(stage.label||('Library '+(sIdx+1-CHAMP_LEVELS))))):('Stage '+(sIdx+1)+' of '+stages.length+(stage.label&&!/^Stage \d+$/.test(stage.label)?' · '+esc(stage.label):''))} · ${stageM}/${stage.words.length} mastered in this Stage</div></div></div>`;
  const smallTiles=liveKeys.filter(k=>k!==key).map(k=>{ const cc=dockColor(k); const open=S.dockMenu===k;
    return `<div style="position:relative;display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;border:1px solid var(--line);background:var(--surface)">
      <button data-act="selectList" data-arg="${escA(k)}" title="Switch to this list" style="display:flex;align-items:center;gap:9px;min-width:0;flex:1;text-align:left">
        <span style="width:27px;height:27px;border-radius:6px;flex-shrink:0;background:linear-gradient(135deg,${cc},color-mix(in srgb,${cc} 70%,#1c1030 30%))"></span>
        <span style="min-width:0"><span style="display:block;font-weight:800;font-size:12px;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(dockLabel(k))}</span><span style="font-size:12px;color:var(--muted);font-weight:700">Stage ${listStageIdx(c,k)+1}</span></span></button>
      <button data-act="dockMenu" data-arg="${escA(k)}" aria-label="List options" style="flex-shrink:0;width:26px;height:26px;border-radius:6px;color:var(--muted);display:grid;place-items:center;background:${open?'var(--surface2)':'transparent'};font-weight:800;font-size:15px;line-height:1">⋯</button>
      ${open?`<div style="position:absolute;top:calc(100% + 4px);right:4px;z-index:40;background:var(--bg2);border:1px solid var(--line);border-radius:10px;box-shadow:var(--sh-overlay);padding:6px;min-width:170px;animation:sb-pop .18s ease both">
        <button data-act="pauseList" data-arg="${escA(k)}" style="display:flex;align-items:baseline;gap:7px;width:100%;text-align:left;padding:8px 10px;border-radius:6px;font-weight:800;font-size:12px;color:var(--text)">${SB_ICON('pause',{size:16})} Pause <span style="color:var(--muted);font-weight:600;font-size:12px">keeps progress</span></button>
        ${CORE_LISTS[k]?'':`<button data-act="dockRemove" data-arg="${escA(k)}" style="display:flex;align-items:center;gap:7px;width:100%;text-align:left;padding:8px 10px;border-radius:6px;font-weight:800;font-size:12px;color:var(--bad)">${SB_ICON('x',{size:16})} Remove <span style="color:var(--muted);font-weight:600;font-size:12px">re-add from Setup</span></button>`}
      </div>`:''}
    </div>`; }).join('');
  const pausedShelf=pausedKeys.length?`<div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:9px;padding-top:9px;border-top:1px dashed var(--line)"><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);font-weight:700">Paused</span>${pausedKeys.map(k=>`<button data-act="resumeList" data-arg="${escA(k)}" title="Tap to resume training this list" style="display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;border:1px dashed var(--line);background:transparent;color:var(--muted);font-weight:700;font-size:12px">${SB_ICON('play',{size:14})} ${esc(dockLabel(k))} <span style="font-size:12px">L${listStageIdx(c,k)+1}</span></button>`).join('')}</div>`:'';
  const addBtn=`<button data-act="coachSetupOpen" style="white-space:nowrap;padding:8px 13px;border-radius:10px;font-weight:800;font-size:13px;border:1px dashed var(--line);background:transparent;color:var(--accent)">+ Add list</button>`;
  const topBar=`${atlasSubNav('gym')}<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px">${backPill('goHome','Home',null)}<span style="font-family:var(--display);font-weight:800;font-size:20px;margin-left:4px">Word Gym</span><button data-act="openQuestChooser" title="Change your practice path" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('steps',13)} My path</button>${(()=>{ const n=missTraps().length; return `<button data-act="openTraps" title="Your weak patterns" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${n?'var(--fix-tint,#FBE9E7)':'var(--surface2)'};border:1px solid ${n?'var(--fix,#C4453C)':'var(--line)'};color:${n?'var(--fix,#C4453C)':'var(--muted)'};font-weight:800;font-size:12px">${iconSVG('target',13)} Traps${n?' · '+n:''}</button>`; })()}${(()=>{ const r=((active().missed)||[]).length; return `<button data-act="openRevisions" title="Words you marked to revise" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${r?'color-mix(in srgb,var(--treasure,#F0B429) 18%,transparent)':'var(--surface2)'};border:1px solid ${r?'var(--treasure,#F0B429)':'var(--line)'};color:${r?'var(--treasure-deep,#8A5B00)':'var(--muted)'};font-weight:800;font-size:12px">${iconSVG('flag',14,2.4)} Revise${r?' · '+r:''}</button>`; })()}${(()=>{ /* Ultra rides here as a pill. It used to be a full-width
      purple banner between the header and the tabs, which ate a whole row of Practice and
      pushed the thing the child came for below the fold — for a pack most of them do not
      own. A pill says the same thing and costs 40px. */
      const _c=active(); const _own=advModeOn(_c); const _ready=advReadyOn(_c);
      const _on=_own&&(activeListKey()==='ultra');
      const _ic=(window.SB_ICON_ART&&SB_ICON_ART.ultraJourney)?SB_ICON_ART('ultraJourney',{size:13}):'';
      /* Locked, the pill stays on screen and says what it costs. Hiding it made the pack
         invisible to the people who would buy it, and the old gate handed it out free at
         level 12 — so it was both unsellable and unpaid for. */
      if(!_own) return `<button data-act="ultraUpsell" title="Ultra Champions Journey — 200 of the hardest words a day, from the Advanced Pack" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--surface2);border:1px solid color-mix(in srgb,#5B3FA6 42%,var(--line));color:#5B3FA6;font-weight:800;font-size:12px">${iconSVG('lock',12,2.2)} Ultra · ${_ready?'you\u2019re ready — unlock':'Advanced Pack'}</button>`;
      return `<button data-act="${_on?'openAdvJourney':'pickUltra'}" title="Ultra Champions Journey — the Advanced Pack's hardest words, 200 a day" style="display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:${_on?'linear-gradient(135deg,#3A2A72,#5B3FA6)':'var(--surface2)'};border:1px solid ${_on?'transparent':'color-mix(in srgb,#5B3FA6 42%,var(--line))'};color:${_on?'#fff':'#5B3FA6'};font-weight:800;font-size:12px">${_ic} Ultra${_on?' · on':''}</button>`; })()}${(()=>{ const ms=milestone(); return ms?`<span style="margin-left:auto;display:inline-flex;align-items:center;gap:7px;padding:5px 11px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:12px">${iconSVG('target',14)} ${ms.days} days to ${esc(ms.label)}</span>`:''; })()}</div>`;
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
    return `<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:14px;animation:sb-rise .3s ease both"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Stage ${stage.n} words · ${esc(listLabel(key).split(' · ')[0])} · ${fullList.length}</div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;max-height:360px;overflow-y:auto">${cells}</div>${fullList.length>cap?`<div style="font-size:12px;color:var(--muted);margin-top:8px">Showing the first ${cap} of ${fullList.length}.</div>`:''}</div>`; })() : '';
  const titleRow = (S.renameKey===key)
    ? `<div style="display:flex;align-items:center;gap:8px;flex:1;min-width:220px"><input data-inp="renameInput" data-fkey="renameInp" value="${escA(S.renameVal)}" maxlength="40" placeholder="List name" style="flex:1;min-width:120px;background:var(--surface2);border:1px solid var(--accent);border-radius:10px;padding:8px 11px;font-size:15px;font-weight:800;color:var(--text);font-family:var(--display)"><button data-act="saveRename" style="padding:8px 13px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Save</button><button data-act="cancelRename" style="padding:8px 11px;border-radius:10px;background:var(--surface2);color:var(--muted);font-weight:800;font-size:13px">✕</button></div>`
    : `<div style="display:inline-flex;align-items:center;gap:8px;min-width:0"><span style="font-family:var(--display);font-weight:800;font-size:15px">${esc(listLabel(key))}</span><button data-act="startRename" data-arg="${escA(key)}" title="Rename this list" style="color:var(--muted);display:inline-flex">${iconSVG('pencil',15)}</button><span style="font-size:13px;color:var(--muted);font-weight:700;white-space:nowrap">· Stage ${uiLevel}</span></div>`;
  const printDlg = S.printOpen ? (()=>{ const p=(S.prn&&S.prn.inc)?S.prn:{inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
    const pbtn=(g,v,l)=>`<button data-act="printSet" data-arg="${g}:${v}" style="padding:9px 13px;border-radius:10px;font-weight:800;font-size:12px;border:1px solid ${p[g]===v?'var(--accent)':'var(--line)'};${p[g]===v?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${l}</button>`;
    const tbtn=(v,l)=>`<button data-act="printSet" data-arg="inc:${v}" style="padding:9px 13px;border-radius:10px;font-weight:800;font-size:12px;border:1px solid ${p.inc[v]?'var(--accent)':'var(--line)'};${p.inc[v]?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${p.inc[v]?'✓ ':''}${l}</button>`;
    const prow=(t,btns)=>`<div style="margin-bottom:13px"><div style="font-size:12px;color:var(--muted);font-weight:800;margin-bottom:7px">${t}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${btns}</div></div>`;
    const fmt=p.fmt==='cards'?'cards':'list';
    const nWords=(p.scope==='level'?listWords(key):listFullWords(key)).length;
    const CARDCAP=400; const nCards=Math.min(nWords,CARDCAP);
    return `<div style="position:fixed;inset:0;z-index:90;background:rgba(20,12,50,.45);display:grid;place-items:center;padding:18px" data-act="printClose">
      <div data-act="noop" style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:22px;max-width:430px;width:100%;box-shadow:var(--sh-overlay);cursor:default;max-height:90vh;overflow:auto">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:4px"><span style="display:inline-flex;color:var(--action)">${SB_ICON('printer',{size:20})}</span><span style="font-family:var(--display);font-weight:800;font-size:17px">Print</span><button data-act="printClose" style="margin-left:auto;color:var(--muted);font-weight:800">✕</button></div>
        <p style="font-size:12px;color:var(--muted);margin:0 0 15px">${esc(listLabel(key).split(' · ')[0])} — opens a clean page you can print or save as PDF.</p>
        ${prow('Format',[['list','📄 Word list'],['cards','🃏 Flashcards']].map(([v,l])=>pbtn('fmt',v,l)).join(''))}
        ${fmt==='cards'
          ? `<div style="font-size:11.5px;color:var(--muted);font-weight:650;line-height:1.5;background:var(--surface2);border-radius:10px;padding:10px 12px;margin-bottom:13px">One word per card with its meaning, sentence, origin &amp; hint, a ✓ box and note lines. 4 cards per page, single-sided — print and cut out.</div>`
          : prow('What to include — e.g. word · meaning · sentence',[tbtn('w','Words'),tbtn('p','Pronunciations'),tbtn('d','Meanings'),tbtn('s','Sentences')].join('')+(p.inc.w?'':'<div style="flex-basis:100%;font-size:11.5px;color:var(--muted);font-weight:650;margin-top:2px">No words = a quiz sheet — each row gets a blank line to write on.</div>'))}
        ${prow('Sort by',[['level','Level order'],['alpha','A → Z'],['diff','Easiest → hardest']].map(([v,l])=>pbtn('sort',v,l)).join(''))}
        ${fmt==='cards'?'':prow('Text size',[['normal','Normal'],['compact','Compact — less paper']].map(([v,l])=>pbtn('size',v,l)).join(''))}
        ${prow('Page size',[['letter','Letter'],['a4','A4'],['a5','A5']].map(([v,l])=>pbtn('page',v,l)).join(''))}
        ${prow('What scope',[['level','Words in play · '+listWords(key).length],['all','Entire word list · '+listFullWords(key).length]].map(([v,l])=>pbtn('scope',v,l)).join(''))}
        <button data-act="printGo" style="width:100%;padding:13px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">${fmt==='cards'?('Print '+nCards+' flashcard'+(nCards===1?'':'s')+' 🃏'):('Print '+nWords+' words →')}</button>
      </div></div>`; })() : '';
  // ---- one Level header (Word→Set→Level→Champ→Library) ----
  const levelHeadline = isJourney
    ? (stage.champ ? ('Stage '+stage.n+' of '+CHAMP_LEVELS+' to Champ') : ('Champion\'s Library · '+esc(stage.label)))
    : ('Stage '+stage.n+' of '+stages.length);
  const levelTag = isJourney
    ? (stage.champ ? `<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--accent)">BIZZING BEE CHAMP</span>` : `<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.08em;color:#C8901B">★ CHAMP · LIBRARY</span>`)
    : `<span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--muted)">${esc(listLabel(key).split(' · ')[0]).toUpperCase()}</span>`;
  const advanceTo = isJourney ? (nextIsLibrary ? ('Library '+(stage.n-CHAMP_LEVELS+1)) : ('Stage '+(stage.n+1))) : ('Stage '+(stage.n+1));
  let advanceHTML;
  if(lastStage && stageDone){ advanceHTML=`<div style="margin-top:10px;font-size:12px;color:var(--good);font-weight:800">🏆 Every level cleared — legendary!</div>`; }
  else if(stageDone && libLocked){ advanceHTML=`<div style="margin-top:11px;background:var(--bg2);border:1px solid var(--line);border-radius:10px;padding:11px 13px"><div style="font-weight:800;font-size:13px;margin-bottom:3px">🏆 You're a Bizzing Bee Champ!</div><div style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:9px">The Champion's Library — the other ${fmtN(journeyTotal()-champWordCount())} words — is Premium.</div><button data-act="goPaywall" style="padding:9px 15px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px">Unlock the Library 👑</button></div>`; }
  else if(stageDone){ advanceHTML=`<button data-act="advanceStage" data-arg="${escA(key)}" style="margin-top:11px;width:100%;padding:12px;border-radius:10px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Stage ${stage.n} cleared! Go to ${advanceTo} →</button><button data-act="openChallenge" data-arg="${escA(key)}" style="margin-top:8px;width:100%;padding:11px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:13px">${iconSVG('bolt',14,2.4)} Take the Stage ${stage.n} Challenge</button>`; }
  else { advanceHTML=`<div style="margin-top:11px"><button data-act="openChallenge" data-arg="${escA(key)}" style="width:100%;padding:12px;border-radius:10px;background:var(--accent);color:#fff;font-weight:800;font-size:13px;box-shadow:var(--edge)">${iconSVG('bolt',14,2.4)} Take the Stage ${stage.n} Challenge</button></div><div style="margin-top:8px;font-size:12px;color:var(--muted);line-height:1.5">Master all ${stage.words.length} words to open the next Stage — or pass the Challenge to test out early.</div>`; }
  const tracker = isJourney
    ? `<div style="display:flex;gap:3px;margin-top:11px">${Array.from({length:CHAMP_LEVELS},(_,i)=>`<span style="flex:1;height:5px;border-radius:999px;background:${(uiLevel>i+1||(uiLevel===i+1&&stageDone))?'var(--good)':(uiLevel===i+1?'var(--accent)':'var(--line)')}"></span>`).join('')}</div><div style="font-size:12px;color:var(--muted);margin-top:5px">20 Stages to Bizzing Bee Champ${uiLevel>CHAMP_LEVELS?' ✓ — now exploring the Library':''}</div>`
    : `<div style="display:flex;gap:4px;margin-top:11px">${stages.map((s,i)=>`<span style="flex:1;height:5px;border-radius:999px;background:${(i<sIdx||(i===sIdx&&stageDone))?'var(--good)':(i===sIdx?'var(--accent)':'var(--line)')}"></span>`).join('')}</div>`;
  const libMeter = isJourney ? `<div style="margin-top:11px;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:7px"><span style="font-weight:800;color:var(--text)">Library explored</span> ${fmtN(journeyMastered(c))} / ${fmtN(journeyTotal())} words mastered</div>` : '';
  const levelBlock=`<div style="background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:16px;margin-top:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">${titleRow}</div>
      <div style="background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:13px 15px;margin-bottom:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:3px">${levelTag}<span style="font-size:12px;color:var(--muted);font-weight:700">${stageM}/${stage.words.length} mastered</span></div>
        <div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:8px">${levelHeadline}</div>
        <div style="display:flex;align-items:center;gap:10px"><div style="flex:1;height:9px;border-radius:999px;background:var(--bg2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${stageDone?'var(--good)':'var(--accent)'};width:${stagePct}%;transition:width .4s"></div></div><span style="font-size:12px;color:var(--muted);font-weight:800">${stagePct}%</span></div>
        ${advanceHTML}
      </div>
    </div>`;
  const tab=(k,l)=>`<button data-act="luSetTab" data-arg="${k}" style="flex:1;padding:9px 6px;border-radius:10px;font-weight:800;font-size:12px;line-height:1.15;${S.luTab===k?'background:var(--bg2);color:var(--accent);box-shadow:0 1px 3px rgba(0,0,0,.08)':'background:transparent;color:var(--muted)'}">${l}</button>`;
  const learnCardsBtn=`<div style="display:flex;margin-bottom:10px"><button data-act="toggleCardView" title="Card view — flip through these words, starting on this one" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;background:var(--surface2);border:1px solid var(--line);color:var(--accent);font-weight:800;font-size:12.5px">${cardsSVG(15)} Card view</button></div>`;
  const body = S.coachCardView ? coachFlashCard()
    : (S.luTab==='practice' ? trainerCard()
      : S.luTab==='vocab' ? vocabPracticeCard()
      : learnCardsBtn+wordFlash(ws, S.reviseIdx, 'reviseNav', {selfMark:true}));
  const act=(a,ic,t,col,arg)=>`<button data-act="${a}"${arg?` data-arg="${escA(arg)}"`:''} class="sb-lift" style="display:flex;flex-direction:column;align-items:center;gap:9px;text-align:center;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:16px;padding:16px 10px;box-shadow:var(--sh-rest)">${iconTile(ic,col,{size:44,radius:13})}<span style="font-family:var(--display);font-weight:800;font-size:13.5px;color:${col};line-height:1.15">${t}</span></button>`;
  /* Play-tested (Amrita 8.26): Daily Buzz / Written / Oral round all read as the same
     "hear it, type it" to a child — problem of plenty — and "Setup" read as a settings
     tab. Two ways to practise plus one clearly-named door to the word lists. */
  const actions=`<div style="font-family:var(--display);font-weight:800;font-size:15px;margin:18px 2px 10px">Quick practice</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:11px">${act('openGym','flame','Warm-up','#E8845C','warmup')}${act('startOral','speaker','Oral round','#13A892')}${act('coachSetupOpen','list','Pick your words','#C8901B')}</div>`;
  const journeyPromo = (key!=='journey' && (getList(c,'journey').stage||0)===0) ? `<button data-act="startJourney" style="width:100%;text-align:left;border-radius:14px;margin-top:16px;overflow:hidden;${listCoverBG('journey')};box-shadow:0 4px 14px rgba(43,27,94,.16)"><div style="padding:13px 16px;color:#fff;display:flex;align-items:center;gap:12px;flex-wrap:wrap"><div style="min-width:0;flex:1"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">Recommended path</div><div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.15">${journeyName()} — 20 Stages to Champ</div></div><span style="padding:8px 14px;border-radius:10px;background:#fff;color:${listCoverOf('journey').c};font-weight:800;font-size:13px;white-space:nowrap">Start →</span></div></button>` : '';
  /* The Ultra banner moved into the Practice header as a pill (see topBar above):
     a full-width card for a pack most spellers do not own was pushing Practice itself
     below the fold. */
  const advJourney = '';
  return `<div style="max-width:760px;margin:0 auto">${printDlg}${topBar}${advJourney}
    <div style="display:flex;gap:5px;background:var(--surface2);border-radius:14px;padding:5px;margin-bottom:16px">${tab('revise','Learn')}${tab('practice','Practice Spelling')}${tab('vocab','Practice Vocabulary')}</div>
    ${body}
    ${S.luTab==='vocab'?'':liveHeatmap(ws, {anon:S.luTab==='practice', print:true})}
    ${chipsRow}${allWordsPanel}
    ${levelBlock}
    ${journeyPromo}
    ${actions}
    ${advBanner(c)}</div>`;
}
const LIST_COVER={
  journey    :{c:'#6A47F5',c2:'#4F2FC8',tex:'rings',hero:'40k',tag:'1-Year Path'},
  default    :{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes',hero:'Aa',tag:'Starter'},
  review     :{c:'#E0922E',c2:'#C8791B',tex:'diag',hero:'Review',tag:'Curated'},
  missed     :{c:'#D6453A',c2:'#B8322A',tex:'dots',hero:'Misses',tag:'Yours'},
  likely     :{c:'#3D7DF0',c2:'#2A63D6',tex:'grid',hero:'Likely',tag:'Ranked'},
  nsf_finals :{c:'#C8901B',c2:'#A8760E',tex:'rings',hero:'Final',tag:'Round'},
  nsf_primary:{c:'#4F9E6A',c2:'#3C8455',tex:'grid',hero:'First',tag:'Flight'},
  nsf_junior :{c:'#13A892',c2:'#0E8A78',tex:'grid',hero:'Rising',tag:'Stars'},
  nsf500     :{c:'#E0922E',c2:'#B26E12',tex:'rings',hero:'500',tag:'Mighty'},
  vocab26    :{c:'#2E8FB8',c2:'#1E6A8C',tex:'rings',hero:'Meaning',tag:'Masters'},
  nsf_senior :{c:'#3D7DF0',c2:'#2A63D6',tex:'grid',hero:'Big',tag:'Leagues'},
  nsf_advanced:{c:'#7B52E0',c2:'#5E39C4',tex:'grid',hero:'Boss',tag:'Level'},
  nsf        :{c:'#C8901B',c2:'#A8760E',tex:'rings',hero:'Vault',tag:'Champion’s'},
  all        :{c:'#7B52E0',c2:'#5E39C4',tex:'cross',hero:'Hive',tag:Math.floor(SB_COUNT.library()/1000)+'k+ words'},
  hardest    :{c:'#D6453A',c2:'#B8322A',tex:'cross',hero:'Beastly',tag:'Tier 6+'},
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
  ultra      :{c:'#5B3FA6',c2:'#3A2A72',tex:'rings',hero:'Ultra',tag:'Advanced Pack'},
  eponyms    :{c:'#A8763C',c2:'#8A5F2A',tex:'dots',hero:'Eponyms',tag:'Named After'},
  custom     :{c:'#13A892',c2:'#0E8A78',tex:'rings',hero:'Custom',tag:'Yours'},
  ai         :{c:'#7C5CFF',c2:'#6A47F5',tex:'stripes',hero:'AI',tag:'Smart'} };
const listCoverOf=(k)=>LIST_COVER[k]||{c:'#4F9E6A',c2:'#3C8455',tex:'stripes',hero:'List',tag:'Words'};
function listCoverBG(k){ const f=listCoverOf(k); const t=CONCEPT_TEX[f.tex]||CONCEPT_TEX.stripes;
  return `background-color:${f.c};background-image:${t[0]},linear-gradient(135deg,${f.c},${f.c2});background-size:${t[1]},100% 100%;background-position:center`; }
/* One chooser, two sections. In vocabulary mode the cards select the VOCABULARY list
   (c.vocabList) and report the vocabulary level, so picking a list to study for meaning
   never changes which list the speller is training for spelling. */
function listCoverCard(k,label,sub,count,locked){ const c=active(); const voc=!!state.vocPick;
  const on=voc?((c.vocabList||c.activeList||'default')===k):((c.activeList||'default')===k);
  const f=listCoverOf(k); const act=locked?'lockedList':(voc?'vocSelectList':'selectList');
  /* getList() lazily creates a spelling-list record, so in vocabulary mode we must not call
     it — browsing lists to read should never write anything into the spelling data. */
  const lvl = voc ? (vocLevel('list:'+k)+1) : ((getList(c,k).stage||0)+1);
  const stMeta = voc ? (' · Vocab set '+(vocLevel('list:'+k)+1))
    : (k==='journey') ? (' · Stage '+(listStageIdx(c,'journey')+1)) : ((on && !locked) ? (' · Stage '+(listStageIdx(c,k)+1)+'/'+listStages(k).length) : '');
  return `<button class="sb-cover-card" data-act="${act}" data-arg="${k}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${on?f.c:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
    <div style="position:relative;height:88px;display:flex;align-items:center;justify-content:center;padding:12px;${listCoverBG(k)}">
      <span style="position:absolute;top:10px;left:11px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(f.tag)}</span>
      ${on?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:12px">ACTIVE</span>':''}
      <div class="sb-theme-art" style="text-align:center;text-shadow:0 2px 8px rgba(0,0,0,.16);animation-delay:${(k.length%9)*0.22}s">${locked?`<div style="display:flex;justify-content:center;color:#fff">${iconSVG('lock',34,2)}</div>`:`<div style="font-family:var(--display);color:#fff;line-height:1;letter-spacing:-.01em;font-weight:800;font-size:${heroFont(f.hero)}px">${esc(f.hero)}</div>`}</div>
    </div>
    <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
      <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(label)}</div>
      <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(trunc(sub,64))}</div>
      <div style="margin-top:auto;padding-top:11px;display:flex;align-items:center;justify-content:space-between;gap:8px">
        <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700">${count} words · L${lvl}${stMeta}</span>
        <span style="display:inline-flex;align-items:center;gap:4px;font-family:var(--body);font-weight:800;font-size:12px;color:${on?f.c:(locked?'#a06a00':f.c)};white-space:nowrap">${on?'Training':(locked?lockChip('plan','With the family plan',{fs:10.5}):'Choose →')}</span>
      </div>
    </div>
  </button>`; }
function coachSetup(){
  const S=state; const c=active();
  const coverGrid='display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px';
  const defCard=listCoverCard('default','Default · Level-Up','A 20-stage journey, growing tougher as you climb',curStage(c,'default').words.length,false);
  /* The catalogue is collapsed into a handful of top-level cards; four groups hold the
     rest (My Words / The Champion Ladder / Word Origins / Tricky Words). Tapping a
     group opens its members in the same grid — state.catGroup. Keys stay unchanged. */
  const LIST_GROUPS={
    mine:  {label:'My Words',            sub:'Sticky, comeback & most-wanted — your personal battle lists', c1:'#E0922E',c2:'#B4711A', tag:'Personal', hero:'★'},
    ladder:{label:'The Champion Ladder', sub:'Five rungs, first bee to the final round — each keeps its own level', c1:'#7C5CFF',c2:'#5A37D6', tag:'The ladder', hero:'V'},
    origins:{label:'Word Origins',       sub:'Latin to Japanese — every donor language, plus eponyms', c1:'#0E8A78',c2:'#0A6B5E', tag:'Origins', hero:'Ω'},
    tricky:{label:'Tricky Words',        sub:'Sound twins, two-way words, fancy dress & the sneakiest spellings', c1:'#C4453C',c2:'#8E2C28', tag:'Traps', hero:'ph?'},
  };
  const catAll=coachCatalog().filter(o=>o.key!=='default');
  const gSel=(S.catGroup&&LIST_GROUPS[S.catGroup])?S.catGroup:null;
  const groupCard=(gk)=>{ const g=LIST_GROUPS[gk]; const mem=catAll.filter(x=>x.grp===gk);
    const total=mem.reduce((s,x)=>s+(x.count||0),0);
    const activeIn=mem.some(x=>x.key===(c.activeList||'default'));
    return `<button class="sb-cover-card" data-act="catGroup" data-arg="${gk}" style="text-align:left;background:var(--bg2);border:0;border-radius:14px;overflow:hidden;box-shadow:0 0 0 1px ${activeIn?g.c1:'var(--line)'},var(--sh-rest);display:flex;flex-direction:column">
      <div style="position:relative;height:88px;display:flex;align-items:center;justify-content:center;padding:12px;background:linear-gradient(135deg,${g.c1},${g.c2})">
        <span style="position:absolute;top:10px;left:11px;font-family:var(--display);font-variant-numeric:tabular-nums;font-weight:700;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.82)">${esc(g.tag)}</span>
        ${activeIn?'<span style="position:absolute;top:9px;right:10px;padding:2px 8px;border-radius:999px;background:rgba(255,255,255,.92);color:#1fa377;font-weight:900;font-size:12px">ACTIVE</span>':''}
        <div style="font-family:var(--display);color:#fff;line-height:1;font-weight:800;font-size:40px;text-shadow:0 2px 8px rgba(0,0,0,.16)">${esc(g.hero)}</div>
      </div>
      <div style="padding:12px 14px 13px;display:flex;flex-direction:column;flex:1">
        <div style="font-family:var(--display);font-weight:800;font-size:15px;line-height:1.18;color:var(--text)">${esc(g.label)}</div>
        <div style="font-family:var(--body);font-weight:600;font-size:12px;line-height:1.4;color:var(--muted);margin-top:4px">${esc(trunc(g.sub,72))}</div>
        <div style="margin-top:auto;padding-top:11px;display:flex;align-items:center;justify-content:space-between;gap:8px">
          <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;color:var(--muted);font-weight:700">${mem.length} lists · ${fmtN(total)} words</span>
          <span style="font-weight:800;font-size:12.5px;color:${g.c1}">Open →</span></div>
      </div></button>`; };
  const emitted={};
  const others=gSel
    ? catAll.filter(o=>o.grp===gSel).map(o=>listCoverCard(o.key,o.label,o.sub,o.count, !isListUnlocked(o.key))).join('')
    : catAll.map(o=>{ if(o.grp&&LIST_GROUPS[o.grp]){ if(emitted[o.grp]) return ''; emitted[o.grp]=1; return groupCard(o.grp); }
        return listCoverCard(o.key,o.label,o.sub,o.count, !isListUnlocked(o.key)); }).join('');
  const jc=listCoverOf('journey'); const jLvl=(getList(c,'journey').stage||0)+1; const jMast=journeyMastered(c);
  const jChampPct=Math.round(Math.min(1,(getList(c,'journey').stage||0)/CHAMP_LEVELS)*100); const jStarted=(getList(c,'journey').stage||0)>0 || jMast>0;
  const champLabel = jLvl>CHAMP_LEVELS ? 'Bizzing Bee Champ 🏆 · exploring the Library' : ('Stage '+Math.min(jLvl,CHAMP_LEVELS)+' of '+CHAMP_LEVELS+' to Champ');
  const journeyBanner=`<button data-act="startJourney" style="position:relative;overflow:hidden;text-align:left;width:100%;border-radius:20px;margin-bottom:16px;${listCoverBG('journey')};box-shadow:0 8px 22px rgba(43,27,94,.18)">
    <div style="padding:18px 20px;color:#fff">
      <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.85)">${(active().activeList||'default')==='journey'?'Your path':'★ Recommended path'}</span>
      <div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.1;margin:6px 0 4px">${journeyName()}</div>
      <div style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.5;margin-bottom:12px;max-width:46em">Climb <b>20 Levels</b> through the ~${fmtN(champWordCount())} highest-value bee words to become a <b>Bizzing Bee Champ</b> — then unlock the full ${fmtN(journeyTotal())}-word Library. Words → Set of 24 → Level → Champ.</div>
      <div style="height:8px;border-radius:999px;background:rgba(255,255,255,.25);overflow:hidden;margin-bottom:9px"><div style="height:100%;width:${jChampPct}%;background:#fff"></div></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span style="font-size:12px;font-weight:800;color:rgba(255,255,255,.92)">${champLabel} · ${fmtN(jMast)} mastered</span><span style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:#fff;color:${jc.c};font-weight:800;font-size:13px">${jStarted?'Continue':'Start the Journey'} →</span></div>
    </div></button>`;
  return `<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">${backPill('openCoach','Back to the Word Gym',null)}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 4px">Setup &amp; lists</h2>
    <p style="margin:0 0 16px;color:var(--muted);font-size:13px">Pick the list you're training — each keeps its own level.${state.premium?'':' 🔒 lists come with Premium.'}</p>
    ${(()=>{ const on=advModeOn(c);
      const ultra=`<button class="sb-lift" data-act="pickUltra" style="width:100%;text-align:left;border-radius:20px;margin-bottom:16px;overflow:hidden;background:linear-gradient(135deg,#241B4E,#3A2A72 58%,#5B3FA6);box-shadow:0 8px 22px rgba(36,27,78,.3)">
        <div style="padding:17px 19px;color:#fff">
          <span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:11.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.82)">${(c.activeList||'')==='ultra'?'Your path':'★ Advanced Pack'}</span>
          <div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.1;margin:6px 0 4px">Ultra Champions Journey</div>
          <div style="font-size:13px;color:rgba(255,255,255,.9);line-height:1.5;margin-bottom:12px;max-width:46em">Every one of the <b>${fmtN(((window.ADV&&ADV.pool)?ADV.pool().length:0))}</b> hardest words, ${((window.ADV&&ADV.daySize)?ADV.daySize():200)} a day, hardest first — with the same Practice, Test, Revise and Vocab tabs you already use.</div>
          <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap"><span style="font-size:12px;font-weight:800;color:rgba(255,255,255,.92)">Day ${listStageIdx(c,'ultra')+1} of ${fmtN(listStages('ultra').length)}</span><span style="display:inline-flex;align-items:center;gap:6px;padding:9px 16px;border-radius:10px;background:#fff;color:#3A2A72;font-weight:800;font-size:13px">${(c.activeList||'')==='ultra'?'Continue':'Train this'} →</span></div>
        </div></button>`;
      const locked=`<button class="sb-lift" data-act="openAdvanced" style="width:100%;text-align:left;border-radius:16px;margin-bottom:16px;background:var(--surface2);border:1px dashed var(--line);padding:13px 15px;display:flex;align-items:center;gap:12px">
        <span style="width:40px;height:40px;flex-shrink:0;border-radius:12px;background:color-mix(in srgb,#5B3FA6 13%,transparent);color:#5B3FA6;display:grid;place-items:center;opacity:.8">${(window.SB_ICON_ART&&SB_ICON_ART.ultraJourney)?SB_ICON_ART('ultraJourney',{size:22}):''}</span>
        <span style="min-width:0;flex:1"><span style="display:block;font-family:var(--display);font-weight:800;font-size:15px;color:var(--muted)">Ultra Champions Journey</span>
        <span style="display:block;font-size:12px;color:var(--muted);font-weight:600;margin-top:1px">Hardest-first through the library of ${countTxt('library')} words · Advanced Pack</span></span>
        <span style="flex-shrink:0;display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;background:var(--chip);color:var(--accent);font-weight:800;font-size:11px;white-space:nowrap">${iconSVG('lock',12)||''} Family plan</span></button>`;
      // unlocked: the advanced journey leads. locked: it sits under the standard one.
      return on ? (ultra+journeyBanner) : (journeyBanner+locked); })()}
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:14px">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end"><div style="flex:1;min-width:150px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Bee day</label><input data-chg="setCoachDate" type="date" value="${escA(S.coachDate||'')}" style="width:100%;padding:11px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px"></div><div style="width:120px"><label style="display:block;font-size:12px;color:var(--muted);font-weight:700;margin-bottom:6px">Daily goal</label><input data-chg="setCoachGoal" value="${escA(S.coachGoal)}" style="width:100%;padding:11px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line);color:var(--text);font-weight:700;font-size:13px"></div></div>
      <div style="font-size:12px;color:var(--muted);margin-top:8px">The daily goal is a target, not a limit — keep going as long as you like.</div></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:12px;display:flex;align-items:center;gap:10px">${gSel?`${backPill('catGroup','All lists','')}<span>${esc((LIST_GROUPS[gSel]||{}).label||'')}</span>`:'Choose a list'}</div><div style="${coverGrid}">${gSel?'':defCard}${others}</div>
      ${gSel?'':`<!-- Pick your words is where a speller comes to choose what to drill, so it is
           also where they should be able to BUILD what to drill. The Builder used to be
           reachable only from the Library tile, one level away from the decision. -->
      <button data-act="openBuilder" style="width:100%;margin-top:13px;display:flex;align-items:center;gap:13px;text-align:left;padding:15px 17px;border-radius:16px;border:1px dashed color-mix(in srgb,var(--action,var(--accent)) 55%,var(--line));background:color-mix(in srgb,var(--action,var(--accent)) 7%,var(--bg2));color:var(--text)">
        <span style="flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:12px;background:var(--action,var(--accent));color:var(--action-ink,#fff)">${iconSVG('sliders',20)}</span>
        <span style="min-width:0;flex:1">
          <span style="display:block;font-family:var(--display);font-weight:800;font-size:15px">Build your own list</span>
          <span style="display:block;font-family:var(--body);font-weight:600;font-size:12.5px;color:var(--muted);margin-top:3px">Nine filters over every word the app serves — level, origin, subject, part of speech, why it&rsquo;s tricky</span>
        </span>
        <span style="flex:0 0 auto;color:var(--action,var(--accent))">${iconSVG('arrowRight',18)}</span>
      </button>`}</div>
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
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">Written round · Word ${wr.i+1}/${wr.list.length}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div>
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
  const rows=wr.ans.map(a=>`<div style="display:flex;align-items:center;justify-content:space-between;padding:9px 13px;border-radius:10px;background:${a.ok?'color-mix(in srgb,#1f9d57 13%,transparent)':'color-mix(in srgb,var(--bad) 13%,transparent)'}"><span style="font-weight:800">${esc(a.w.w)}</span><span style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px">${a.ok?'✓':(esc(a.val||'(blank)')+' ✗')}</span></div>`).join('');
  return `<div style="max-width:680px;margin:0 auto">
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 8px">${pct>=80?'Strong round! 🏆':pct>=60?'Good effort 💪':'Keep training 🌱'}</h2><div style="font-family:var(--display);font-weight:800;font-size:48px;color:var(--accent);line-height:1">${pct}%</div><p style="color:var(--muted);font-weight:700;margin-top:6px">${ok} of ${wr.ans.length} correct</p></div>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px;margin-bottom:14px"><div style="font-family:var(--display);font-weight:800;font-size:15px;margin-bottom:10px">Round results</div><div style="display:flex;flex-direction:column;gap:7px">${rows}</div></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="coachWeakDrill" style="padding:13px 18px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Drill the misses →</button></div>
  </div>`;
}
function coachOral(){
  const S=state; const or=S.or; let infoHTML=''; if(or&&or.pool[or.i]){ const w=or.pool[or.i]; if(S.orInfoKey==='def') infoHTML='Meaning — '+blankHTML(w.d||'—',w.w); else if(S.orInfoKey==='sent') infoHTML='Sentence — '+blankHTML(w.s||'—',w.w); else if(S.orInfoKey==='orig') infoHTML='Origin — '+esc(w.o||'—')+(w.r?('. '+esc(w.r)):''); }
  return `<div style="max-width:680px;margin:0 auto">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px"><div style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted)">Oral elimination · Round ${or.round+1} · Best ${S.coachBestRounds||0}</div><button data-act="exitCoachMode" style="color:var(--muted);font-weight:700;font-size:13px">✕ Exit</button></div>
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
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:30px;text-align:center;box-shadow:var(--glow);margin-bottom:14px"><h2 style="font-family:var(--display);font-weight:800;font-size:20px;margin:0 0 10px">Eliminated 🛑</h2><p style="color:var(--muted);font-weight:700;margin:0 0 4px">The word was</p><div style="font-family:var(--display);font-weight:800;font-size:36px;color:var(--accent);line-height:1">${esc(w)}</div><p style="font-family:var(--display);font-variant-numeric:tabular-nums;font-size:13px;color:var(--muted);margin-top:8px;letter-spacing:.12em">${esc(w.split('').join(' '))}</p><p style="color:var(--muted);font-weight:700;margin-top:14px">You survived <b style="color:var(--text)">${or?or.round:0}</b> rounds · best ${S.coachBestRounds||0}</p></div>
    <div style="display:flex;gap:10px;justify-content:center"><button data-act="exitCoachMode" style="padding:13px 18px;border-radius:14px;background:var(--surface2);color:var(--text);font-weight:800;font-size:15px">Back to Coach</button><button data-act="startOral" style="padding:13px 18px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Try again →</button></div>
  </div>`;
}
/* ----- Champ Challenge helpers ----- */
function challengePool(){ const c=active(); const key=state.challengeKey||activeListKey(); const band=state.chBand||'level';
  if(band==='level') return (curStage(c,key).words||[]).slice();
  if(band==='missed') return (state.missedWords||[]).concat((c.missed)||[]);
  const tier={ easy:w=>(w.y||3)<=2, medium:w=>(w.y||3)===3, hard:w=>(w.y||3)===4, champion:w=>(w.y||3)>=5 }[band]||(()=>true);
  return journeySorted().filter(w=>w&&w.w&&tier(w)); }
function challengeConfig(){ const S=state; const key=S.challengeKey||activeListKey(); const lvl=listStageIdx(active(),key)+1;
  const seg=(f,v,label,cur)=>`<button data-act="chSet" data-arg="${f}:${v}" style="flex:1;min-width:64px;padding:11px 8px;border-radius:10px;font-weight:800;font-size:13px;border:1px solid ${cur?'var(--accent)':'var(--line)'};${cur?'background:var(--accent);color:#fff':'background:var(--surface2);color:var(--text)'}">${label}</button>`;
  const fmtRow=`<div style="display:flex;gap:8px;margin-bottom:14px">${seg('fmt','count','🔢 Set number',S.chFmt==='count')}${seg('fmt','timed','⏱️ Beat the clock',S.chFmt==='timed')}</div>`;
  const amtRow = S.chFmt==='timed'
    ? `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">How long?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[60,90,120].map(t=>seg('time',t,t+'s',S.chTime===t)).join('')}</div>`
    : `<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">How many words?</div><div style="display:flex;gap:8px;margin-bottom:16px">${[10,15,20,30].map(n=>seg('count',n,String(n),S.chCount===n)).join('')}</div>`;
  const bandRow=`<div style="font-size:12px;color:var(--muted);font-weight:700;margin-bottom:7px">Difficulty</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">${BANDS.map(([v,l])=>seg('band',v,l,S.chBand===v)).join('')}</div>`;
  return `<div style="max-width:560px;margin:0 auto;animation:sb-rise .35s ease both">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">${backPill('chExit','Back',null)}</div>
    <h2 style="display:inline-flex;align-items:center;gap:8px;font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 4px">${iconSVG('bolt',22)} Champ Challenge</h2>
    <p style="margin:0 0 18px;color:var(--muted);font-size:13px">Pick your format and difficulty. Pass the <b>This Level</b> challenge to <b>test out</b> and jump straight to the next Level.</p>
    <div style="background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:18px">
      ${fmtRow}${amtRow}${bandRow}
      <button data-act="chStart" style="width:100%;padding:14px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge)">Start Challenge →</button>
      ${S.chBand==='level'?`<div style="font-size:12px;color:var(--muted);margin-top:10px;text-align:center">Testing out of <b>Stage ${lvl}</b> of ${esc(listLabel(key).split(' · ')[0])}.</div>`:''}
    </div>
  </div>`; }
function champDone(){ const g=state.game; const done=g.right+g.wrong; const acc=done?Math.round(g.right/done*100):0;
  return `<div style="max-width:520px;margin:0 auto;text-align:center;animation:sb-pop .4s ease both">
    <div style="font-size:54px;margin:8px 0">${g.pass?'⭐':'💪'}</div>
    <h2 style="font-family:var(--display);font-weight:800;font-size:24px;margin:0 0 6px">${g.pass?'Challenge passed!':'Good effort!'}</h2>
    <div style="font-size:15px;color:var(--muted);margin-bottom:16px">${g.right} right${g.fmt==='count'?(' of '+done):''} · ${acc}% accuracy · +${g.bonus} ${coinIc(14)}</div>
    ${g.canAdvance?`<button data-act="champAdvance" style="width:100%;padding:14px;border-radius:14px;background:var(--good);color:#fff;font-weight:800;font-size:15px;box-shadow:var(--edge);margin-bottom:10px">🎉 Level cleared — advance →</button>`:''}
    ${(!g.canAdvance&&g.pass&&g.band==='level')?`<div style="font-size:12px;color:var(--muted);margin-bottom:10px">Nice — that wasn't your current Level, so no skip this time.</div>`:''}
    <div style="display:flex;gap:10px"><button data-act="chStart" style="flex:1;padding:13px;border-radius:14px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:15px">Try again</button><button data-act="chExit" style="flex:1;padding:13px;border-radius:14px;background:var(--accent);color:#fff;font-weight:800;font-size:15px">Done</button></div>
  </div>`; }

/* the actions of these screens: they replace app3's stubs (SCR_ACTS.scrGym) */
Object.assign(app, {
  startLevelTest:()=>{ if(state.screen==='onboarding'){ if(!state.draft.name.trim()){ flash('Add a name first'); return; } app._finishOnb(); }
    /* The placement test walks the difficulty-band ladder itself (not stage lists), so its
       result IS the Bee Band — the Quest start is then derived from the same number. */
    state.lt={ band:2, i:0, ok:0, fails:0, words:sample(ltBandPool(2),6), typed:'', placed:null };
    set({screen:'app', nav:'leveltest'}); setTimeout(()=>{ const lt=state.lt; if(lt&&lt.words[0]) say(lt.words[0].w); },400); },
  fwSay:()=>{ if(state.fw) say(state.fw.w); },
  fwType:(v)=>{ if(state.fw) state.fw.typed=v; },
  fwKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.fwCheck(); } },
  fwCheck:()=>{ const f=state.fw; if(!f||f.done) return; const ok=sameSpelling(f.typed,f.w); f.tries++;
    if(ok){ f.done=true; f.miss=false; addCoins('answer'); sfx('correct'); try{ burstConfetti(200); }catch(e){} try{ SB_SHELL.milestone&&SB_SHELL.milestone('first-word'); }catch(e){} save(); render(); return; }
    /* a miss HOLDS: the letters and the why, and the child types it again */
    f.miss=f.typed||' '; f.typed=''; sfx('wrong'); render(); },
  fwDone:()=>{ state.fw=null; try{ app.goStep(); }catch(e){ app.setNav('home'); } },
  ltSay:()=>{ const lt=state.lt; if(lt&&lt.words[lt.i]) say(lt.words[lt.i].w); },
  ltType:(v)=>{ state.lt.typed=v; },
  ltKey:(e)=>{ if(e.key==='Enter'){ e.preventDefault(); app.ltEnter(); } },
  ltSkip:()=>{ state.lt=null; flash('No problem — starting at Level 1. You can climb fast!'); app.goStep(); },
  ltEnter:()=>{ const lt=state.lt; const w=lt.words[lt.i]; if(!w) return; const ok=sameSpelling(lt.typed,w.w);
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
  ltGo:()=>{ state.lt=null; app.goStep(); },
  /* Word lists are not sold. A premium list comes with a plan, so a locked one opens
     the plan sheet where it stands, in the Library. (Lists bought under the old coin
     price stay unlocked — isListUnlocked still reads c.unlockedLists.) */
  lockedList:(key)=>{ if(isListUnlocked(key)) return app.selectList(key); openUpsell('lists', listLabel(key)); },
  /* the set deck — read the whole set, then go back to drilling it */
  deckOpen:()=>set({deckOpen:true,deckCards:state.deckCards||{}}),
  newBatch:()=>{ newCoachBatch(); flash('Fresh set of words ✨'); },
  reviseNav:(dir)=>{ const N=(state.sessionWords&&state.sessionWords.length)||LEVEL_WORDS.length; let i=(state.reviseIdx||0)+(dir==='next'?1:-1); set({reviseIdx:Math.max(0,Math.min(N-1,i))}); },
  exitTrain:()=>{ if((state.sessionDone||0)>0){ logActivity(state.coachSession?'concept':'practice', state.sessionLabel||'Practice', {done:state.sessionDone,right:state.sessionRight}, []); } if(state.trailReturn&&app.trailUnit){ const u=state.trailReturn; try{ if(window.SB_TRAIL_PRACTICED) SB_TRAIL_PRACTICED(u, state.sessionRight||0, state.sessionDone||0); }catch(e){} if(/^ul\d+$/.test(u)){ state.trailReturn=null; state.coachSession=false; try{ app.ultraAct(Math.floor(parseInt(u.slice(2),10)/4)); }catch(e){ app.setNav('trail'); } return; } state.trailReturn=null; state.coachSession=false; state.nav='trail'; app.trailUnit(u); return; } if(state.coachSession){ state.coachSession=false; app.openCoach(); } else if(state.trainBack==='revisions'){ state.trainBack=null; app.openRevisions(); } else if(state.trainBack==='themes'){ state.trainBack=null; app.setNav('themes'); } else app.setNav('home'); },
  reviseComplete:(word)=>{ const c=active(); const m=(c.missed||[]).find(x=>nkey(x.w)===nkey(word));   // moves it off the pile; mastery needs a spelling (FIX-BEE D5)
    if(m){ c.reviseHistory=c.reviseHistory||[]; if(!c.reviseHistory.some(x=>nkey(x.w)===nkey(word))) c.reviseHistory.unshift(Object.assign({},m,{doneTs:now()})); if(c.reviseHistory.length>300) c.reviseHistory=c.reviseHistory.slice(0,300); }
    clearMiss(word); save(); flash('Completed ✓ — saved to Revise history'); render(); },
  reviseHistoryAgain:(word)=>{ const c=active(); const m=(c.reviseHistory||[]).find(x=>nkey(x.w)===nkey(word)); if(!m) return;
    addMiss(m,'mark'); c.reviseHistory=(c.reviseHistory||[]).filter(x=>nkey(x.w)!==nkey(word)); save(); flash('Back on the revise list ⚑'); render(); },
  revTab:(t)=>set({revTab:t}),
  mastRecheck:()=>{ const due=mastDueWords(active(),30); if(!due.length){ flash('Nothing is due for a check today'); return; }
    state.sessionWords=due; state.sessionLabel='Ready for a check'; state.gi=0; state.coachSession=false; state.trainBack='revisions'; app.startTrain(); },
  practiceRevisions:()=>{ const c=active(); const list=(c.missed||[]).slice(0,30); if(!list.length){ flash('No revisions yet — nice work!'); return; }
    state.sessionWords=list.map(m=>({w:m.w,d:m.d||'',s:m.s||'',p:m.p||'',o:m.o||'',r:m.r||'',y:m.y||3,sy:m.sy||'',h:m.h||''})); state.sessionLabel='Revisions'; state.gi=0; state.coachSession=false; state.trainBack='revisions'; app.startTrain(); },
  trainKey:(e)=>{ if(e.key==='Enter'){ if(state.status==='idle') app.check(); else app.next(); } },
  toggleDef:()=>set({showDef:!state.showDef}),
  tmReact:(v)=>{ try{ if(window.SB_TM) SB_TM.rec({k:'react', v:String(v)}); }catch(e){}
    state.tmReacted=true; try{ sfx('coin'); }catch(e){} flash('Thanks for telling us! 🐝'); render(); },
  wordCard:(w)=>{ const ws=state.sessionWords||[]; const i=ws.findIndex(x=>nkey(x.w)===nkey(w));
    if(i>=0){ state.luTab='revise'; state.reviseIdx=i; try{window.scrollTo(0,0);}catch(e){} render(); } else { say(w); } },
  toggleSent:()=>{ const on=!state.showSent; if(on){ const w=curWord(); if(w&&w.s) saySentence(w.s,w.w); } set({showSent:on}); },
  toggleOrigin:()=>set({showOrigin:!state.showOrigin}),
  luSetTab:(t)=>{ if(t==='vocab' && !state.vp && !state.vpAllDone) app.vocabNewQ(); set({luTab:t, heatReveal:false, coachCardView:false}); if(t==='practice') setTimeout(speak,250); if(t==='vocab') setTimeout(()=>{ try{ if(state.vp) say(state.vp.w.w); }catch(e){} },250); },
  vocabSay:()=>{ if(state.vp) say(state.vp.w.w); },
  vocabPick:(i)=>{ i=+i; const vp=state.vp; if(!vp||vp.picked!=null) return; vp.picked=i; const ok=!!(vp.opts[i]&&vp.opts[i].correct);
    if(ok){ sfx('correct'); const _p=addCoins('answer'); state.vpRight=(state.vpRight||0)+1; state.toast='✓'+(_p?' +1 coin 🪙':''); scheduleToast(1500); save(); }
    else { sfx('wrong'); }
    state.vpDone=(state.vpDone||0)+1; render();
    clearTimeout(state._vpTimer); if(!ok) return;   // a miss holds until Next (FIX-BEE D3)
    state._vpTimer=setTimeout(()=>{ if(state.luTab==='vocab' && state.vp && state.vp.picked!=null){
      const more=app.vocabNewQ();
      if(more){ render(); try{ if(state.vp) say(state.vp.w.w); }catch(e){} }
      else { // every word matched — big celebration with the child's avatar cheering
        state.celebrate={kind:'vocab', right:state.vpRight||0, total:state.vpDone||0};
        try{ sfx('win'); burstConfetti(240); }catch(e){}
        render();
      }
    } }, ok?1150:2200); },
  vocabNext:()=>{ clearTimeout(state._vpTimer); state._vpTimer=null; if(app.vocabNewQ()){ render(); try{ if(state.vp) say(state.vp.w.w); }catch(e){} } else render(); },
  toggleHeat:()=>set({heatReveal:!state.heatReveal}),
  luToggleWords:()=>set({luWordsOpen:!state.luWordsOpen}),
  primary:()=>{ app.check(); },
  cardSpeak:()=>deviceSpeak(cardWordNow().w,0.9),
  cardSpeakSlow:()=>deviceSpeak(cardWordNow().w,0.55),
  cardRestart:()=>{ set({cardDone:false}); state.cardIdx=0; state.reviseIdx=0; render(); setTimeout(()=>say(cardWordNow().w),200); },
  cardToPractice:()=>{ set({coachCardView:false, cardDone:false, luTab:'practice', typed:'', status:'idle', mood:'happy'}); setTimeout(speak,300); },
  cardToRevise:()=>{ set({coachCardView:false, cardDone:false}); app.openRevisions(); },
  speak,
  speakSlow:()=>speakSlow(),
  restartSession:()=>{ state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; state.gi=0; set({typed:'', status:'idle', mood:'happy'}); setTimeout(speak,300); },
  drillMisspelt:()=>{ const wrong=(state.sessionWrong||[]).slice(); if(!wrong.length){ flash('Nothing to redo — all correct! 🎉'); return; } state.sessionWords=wrong; state.sessionLabel=(state.sessionLabel||'Practice').replace(/ · misspelt$/,'')+' · misspelt'; state.sessionOver=false; state.sessionCorrect=[]; state.sessionWrong=[]; state.sessionRight=0; state.sessionDone=0; state.gi=0; set({typed:'', status:'idle', mood:'happy'}); setTimeout(speak,300); },
  questPick:(p)=>{ const c=active(); ensureLists(c); c.questPath=p; save(); sfx('coin');
    if(p==='journey'){ app.selectList('journey'); flash('⚔️ Quest set: the Bizzing Bee Journey — climb to Champ!'); }
    else if(p==='themes'){ set({nav:'themes'}); flash('⚔️ Quest set: Theme Journey — pick the worlds you love'); }
    else { app.openBuilder(); flash('⚔️ Quest set: your own list — pick one or build one in five taps'); } },
  dockMenu:(k)=>set({dockMenu:state.dockMenu===k?null:k}),
  pauseList:(k)=>{ const c=active(); ensureLists(c); if(!c.pausedLists) c.pausedLists={};
    if((c.activeList||'default')===k){ flash('Switch to another list first, then pause this one'); state.dockMenu=null; render(); return; }
    c.pausedLists[k]=1; state.dockMenu=null; save(); flash('Paused — progress kept. Resume any time ⏸'); render(); },
  resumeList:(k)=>{ const c=active(); if(c.pausedLists) delete c.pausedLists[k]; state.dockMenu=null; save(); app.selectList(k); },
  dockRemove:(k)=>{ state.dockMenu=null; const c=active(); if(c.pausedLists) delete c.pausedLists[k];
    window.sbDelList({preventDefault(){},stopPropagation(){}},k); },
  printOpen:()=>{ if(!state.prn||!state.prn.inc) state.prn={inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'}; set({printOpen:true}); },
  printClose:()=>set({printOpen:false}),
  // ----- View complete word list (browsable card view for any list) -----
  openListView:(key)=>{ const k=key||activeListKey(); set({listView:k, lvQuery:'', lvY:'', lvShown:80}); },
  printSet:(kv)=>{ const i=kv.indexOf(':'); if(!state.prn||!state.prn.inc) state.prn={inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
    const g=kv.slice(0,i), v=kv.slice(i+1);
    if(g==='inc'){ const inc=state.prn.inc; const on=Object.keys(inc).filter(k=>inc[k]).length;
      if(inc[v]&&on<=1){ flash('Keep at least one thing on the page'); return; } inc[v]=inc[v]?0:1; }
    else state.prn[g]=v; render(); },
  printGo:()=>{ try{ const w=window.open('','_blank'); if(!w){ flash('Pop-up blocked — allow pop-ups to print'); return; }
    const key=activeListKey(); const cards=(state.prn&&state.prn.fmt==='cards');
    w.document.write(cards?printCards(key):printDoc(key)); w.document.close(); setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} },350); state.printOpen=false; render(); }catch(e){ flash('Could not open the print view'); } },
  coachSetupOpen:()=>{ const c=active(); ensureLists(c); set({vocPick:false, nav:'coach', screen:'app', coachMode:'setup', coachTab:'train', status:'idle', typed:''}); },
  // ----- The Bizzing Bee Journey -----
  startJourney:()=>{ const c=active(); ensureLists(c); c.activeList='journey'; if(!c.lists.journey) c.lists.journey={xp:0};
    state.sessionListKey=null; ensureCoachWords('journey'); try{ window.scrollTo(0,0); }catch(e){} set({nav:'coach', screen:'app', coachMode:'hub', coachTab:'revise', luTab:'revise', status:'idle', typed:''});
    flash('Welcome to the Bizzing Bee Journey ✨'); },
  chSet:(kv)=>{ const i=String(kv).indexOf(':'); const f=String(kv).slice(0,i), v=String(kv).slice(i+1); const p={};
    if(f==='fmt')p.chFmt=v; else if(f==='count')p.chCount=+v; else if(f==='time')p.chTime=+v; else if(f==='band')p.chBand=v; set(p); },
  chExit:()=>{ clearGTimer(); set({coachMode:'hub', game:null, typed:''}); },
  chStart:()=>{ clearGTimer(); const c=active(); const key=state.challengeKey||activeListKey(); const fmt=state.chFmt||'count';
    let pool=challengePool().filter(w=>w&&w.w); if(pool.length<3){ flash('Not enough words in that band — pick another'); return; }
    const n = fmt==='timed' ? Math.min(240,pool.length) : Math.min(state.chCount||10, pool.length);
    pool=sample(pool, n);
    const g={ type:'champ', list:pool, i:0, right:0, wrong:0, ans:[], status:'play', fmt, champKey:key, champLevel:listStageIdx(c,key)+1, band:state.chBand, total:(fmt==='count'?n:0) };
    if(fmt==='timed') g.timeLeft=state.chTime||60;
    state.game=g; state.typed=''; state.gInfo=false; render(); setTimeout(()=>{ if(state.game&&state.game.list&&state.game.list[0]) say(state.game.list[0].w); },320); if(fmt==='timed') startGTimer(); },
  champAdvance:()=>{ const g=state.game; if(!g||!g.canAdvance) return; const key=g.champKey; clearGTimer(); state.game=null; app.advanceStage(key); set({coachMode:'hub'}); },
  // ----- rename a list's display name (per child) -----
  startRename:(key)=>{ const c=active(); set({renameKey:key, renameVal:listLabel(key)}); },
  renameInput:(v)=>{ state.renameVal=v; },
  cancelRename:()=>set({renameKey:null, renameVal:''}),
  saveRename:()=>{ const c=active(); const key=state.renameKey; if(!key) return; ensureLists(c); if(!c.listNames) c.listNames={};
    const v=(state.renameVal||'').trim().slice(0,40);
    if(v && v!==listBaseLabel(key)) c.listNames[key]=v; else delete c.listNames[key];
    state.sessionLabel=listLabel(key); set({renameKey:null, renameVal:''}); flash('List renamed ✏️'); },
  catGroup:(a)=>set({catGroup:a||null}),
  coachTrap:(k)=>set({coachTrap:k}),
  coachTipNext:()=>{ const n=(window.SB_COACH_TIPS||[]).length||1;
    const cur=(state.coachTip==null?(typeof dayNum==='function'?dayNum():0):state.coachTip);
    set({coachTip:(cur+1)%n}); },
  trapPick:(k)=>set({trapSel:k}),
  trapBack:()=>set({trapSel:null}),
  setCoachDate:(v)=>{ const c=active(); c.milestone={ label:(c.milestone&&c.milestone.label)||'the bee', date:v||null }; if(!v) c.milestone=null; set({coachDate:v||null}); },
  setCoachGoal:(v)=>{ const n=parseInt(v,10); set({coachGoal:(n&&n>0)?n:20}); },
  openAdvJourney:()=>app.advJump('ucj'),
  pickUltra:()=>{ const c=active(); if(!advModeOn(c)) { app.ultraUpsell(); return; }
    ensureLists(c); c.activeList='ultra'; c.pinnedLists={...(c.pinnedLists||{}),ultra:1}; save();
    set({nav:'coach', screen:'app', coachMode:null, luTab:'practice', conceptSel:null}); },
  setCustomText:(v)=>{ state.customText=v; render(); },
  enrichCustom:()=>{ const raw=state.customText||''; const words=raw.split(/[\n,]+/).map(s=>s.trim()).filter(Boolean);
    if(!words.length){ flash('Type or paste some words first'); return; }
    const db=wordDB(); const found=[],missing=[]; const seen=new Set();
    words.forEach(w=>{ const k=nkey(w); if(seen.has(k))return; seen.add(k); const hit=db.get(k); if(hit) found.push(hit); else missing.push({w:w.trim(),d:'',s:'',p:'',o:'',r:'',y:4}); });
    state.customWords=found.concat(missing); state.coachTargetKey='custom'; state.coachTargetLabel='My custom list';
    state.enrichResult='✓ '+found.length+' enriched from the database'+(missing.length?(' · '+missing.length+' kept as-is (not in database)'):'');
    app.selectList('custom'); },
  exitCoachMode:()=>set({coachMode:'hub', wr:null, or:null, typed:'', orFeedback:''}),
  wrInfo:(kind)=>{ const key=state.wrInfoKey===kind?'':kind; if(key==='sent'){ const w=state.wr.list[state.wr.i]; if(w&&w.s) say(w.s); } set({wrInfoKey:key}); },
  wrSay:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w); },
  wrSaySlow:()=>{ const wr=state.wr; const w=wr&&wr.list[wr.i]; if(w) say(w.w,0.6); },
  wrKey:(e)=>{ if(e.key==='Enter') app.wrNext(); },
  wrNext:()=>{ const S=state; const wr=S.wr; const w=wr.list[wr.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); addCoins('answer'); gainXp(); } else { addMiss(w); sfx('wrong'); }
    const ans=wr.ans.concat([{w,val:S.typed,ok}]);
    if(wr.i+1<wr.list.length){ set({wr:{...wr,i:wr.i+1,ans}, typed:'', wrInfoKey:''}); setTimeout(()=>{ const nx=wr.list[wr.i+1]; if(nx) say(nx.w); },250); }
    else { const rgt=ans.filter(a=>a.ok).length; logActivity('written','Written round', {done:ans.length,right:rgt}, ans.filter(a=>!a.ok).map(a=>a.w)); set({wr:{...wr,ans}, coachMode:'wrdone'}); } },
  orInfo:(kind)=>{ const key=state.orInfoKey===kind?'':kind; if(key==='sent'){ const w=state.or.pool[state.or.i]; if(w&&w.s) say(w.s); } set({orInfoKey:key}); },
  wrInfoDef:()=>app.wrInfo('def'),
wrInfoSent:()=>app.wrInfo('sent'),
wrInfoOrig:()=>app.wrInfo('orig'),
  orInfoDef:()=>app.orInfo('def'),
orInfoSent:()=>app.orInfo('sent'),
orInfoOrig:()=>app.orInfo('orig'),
  orSay:()=>{ const or=state.or; const w=or&&or.pool[or.i]; if(w) say(w.w); },
  orSaySlow:()=>{ const or=state.or; const w=or&&or.pool[or.i]; if(w) say(w.w,0.6); },
  orKey:(e)=>{ if(e.key==='Enter') app.orJudge(); },
  orJudge:()=>{ const S=state; const or=S.or; const w=or.pool[or.i]; const ok=judgeWord(S.typed,w); recordCoach(w.w,ok); logBand(w,ok);
    if(ok){ markMastered(nkey(w.w)); clearMiss(w.w); sfx('correct'); addCoins('answer'); gainXp(); const round=or.round+1; state.or={...or,round}; state.coachBestRounds=Math.max(state.coachBestRounds||0,round); state.orFeedback='✓ Correct — advancing! ('+round+' in a row)'; say('Correct!'); render();
      setTimeout(()=>{ if(!state.or) return; let ni=state.or.i+1; let np=state.or.pool; if(ni>=np.length){ np=sample(np); ni=0; } state.or={...state.or,i:ni,pool:np}; state.typed=''; state.orInfoKey=''; state.orFeedback=''; render(); const nx=state.or&&state.or.pool[state.or.i]; if(nx) say(nx.w); },1000);
    } else { addMiss(w); say('Incorrect'); logActivity('oral','Oral elimination', {done:(or.round||0)+1,right:or.round||0}, [w]); set({coachMode:'orgone', or:{...or,last:w}}); } },
  goPaywall:()=>set({showPaywall:true}),
  // Home rings → the 30-day chart on Progress.
  openMetrics:()=>{ set({nav:'progress', screen:'app', progTab:'me', conceptSel:null});
    setTimeout(()=>{ try{ const el=document.getElementById('sb-metrics'); if(el) el.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} },240); }
});

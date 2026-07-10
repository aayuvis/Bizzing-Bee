import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const R={};
// ---- veteran with active journey ----
const v=await (await b.newContext({viewport:{width:1360,height:1100}})).newPage();
v.on('pageerror',e=>errs.push('V:'+e.message));
await v.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bizzy',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,questPath:'journey',activeList:'journey',lists:{journey:{xp:60,stage:2}},coins:900,band:4,bandSeed:4,missed:[]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await v.goto('file:///home/claude/repo/spellbound-app/index.html'); await v.waitForTimeout(900);
// 1. home: no speech bubble, XP pill present
R.home=await v.evaluate(()=>{ const t=document.body.textContent;
  return { noBubble:!/Spell 5 words and I hatch|Goal smashed — bonus rounds/.test(t), xpPill:!!document.querySelector('[data-act="openEvo"][title^="XP"]') }; });
// 2. coach: no lvBanner, no hardcoded countdown, challenge present
R.coach=await v.evaluate(async()=>{ app.openCoach(); await new Promise(r=>setTimeout(r,400)); const t=document.body.textContent;
  return { noLvBanner:!/or pass the ⚡ Challenge to test out/.test(t), noHardBee:!/days to the bee/.test(t),
    noTracker:!/20 levels to Bizzing Bee Champ/.test(t), challengeBtn:/Take the Level \d+ Challenge/.test(t) }; });
await v.screenshot({path:'s8-coach.png', clip:{x:300,y:0,width:760,height:1000}});
// 3. milestone set → countdown pill appears in coach
R.milestone=await v.evaluate(async()=>{ app.profMsDate('2026-07-31'); app.profMsLabel('NSF Finals'); render(); await new Promise(r=>setTimeout(r,300));
  const t=document.body.textContent; return { pill:/days to NSF Finals/.test(t) }; });
// 4. resume: answer words then leave & re-enter coach
R.resume=await v.evaluate(async()=>{ state.luTab='practice'; render(); await new Promise(r=>setTimeout(r,200));
  for(let k=0;k<3;k++){ const w=curWord(); state.typed=w.w; app.check(); await new Promise(r=>setTimeout(r,50)); clearTimeout(state._advTimer); app.next(); await new Promise(r=>setTimeout(r,50)); }
  const giNow=state.gi; app.setNav('home'); await new Promise(r=>setTimeout(r,150));
  state.sessionListKey=null; state.sessionWords=null; app.openCoach(); await new Promise(r=>setTimeout(r,250));
  return { giNow, giResumed:state.gi, resumed:state.gi===giNow&&giNow>0 }; });
// 5. live progress: current masked in reveal; click opens learn card
R.live=await v.evaluate(async()=>{ state.luTab='practice'; state.heatReveal=true; render(); await new Promise(r=>setTimeout(r,250));
  const h=document.body.innerHTML; const masked=/current word — hidden/.test(h);
  const btn=document.querySelector('[data-act="wordCard"]'); const target=btn&&btn.dataset.arg;
  if(btn) btn.click(); await new Promise(r=>setTimeout(r,250));
  const opened=state.luTab==='revise' && nkey((state.sessionWords[state.reviseIdx]||{}).w||'')===nkey(target||'');
  return { masked, opened }; });
// 6. report a fix
R.report=await v.evaluate(async()=>{ const w=state.sessionWords[state.reviseIdx];
  app.reportWord(w.w); await new Promise(r=>setTimeout(r,200));
  const dlg=/What looks wrong with/.test(document.body.textContent);
  app.reportIssue('Meaning is wrong'); await new Promise(r=>setTimeout(r,200));
  const logged=(state.wordReports||[]).length===1 && state.wordReports[0].w===w.w;
  const persisted=JSON.parse(localStorage.getItem('sb_saas_v2')).wr.length===1;
  app.setNav('parent'); await new Promise(r=>setTimeout(r,300));
  const parentCard=/Reported word fixes/.test(document.body.textContent);
  return { dlg, logged, persisted, parentCard }; });
// 7. evolution: rung XP marks + how-XP card
R.evo=await v.evaluate(async()=>{ app.openEvo(); await new Promise(r=>setTimeout(r,300)); const t=document.body.textContent;
  return { marks:/13 XP/.test(t)&&/46 XP/.test(t), howXp:/How XP works/.test(t)&&/1 XP/.test(t), coinsDistinct:/Coins 🪙 are different/.test(t) }; });
await v.screenshot({path:'s8-evo.png', clip:{x:300,y:0,width:760,height:900}});
// 8. finder: search → learn card → new list
R.finder=await v.evaluate(async()=>{ app.openFinder(); await new Promise(r=>setTimeout(r,250));
  app.finderQ('lynx'); await new Promise(r=>setTimeout(r,250));
  const results=[...document.querySelectorAll('[data-act="finderPick"]')].length;
  app.finderPick('lynx'); await new Promise(r=>setTimeout(r,250));
  const t=document.body.textContent;
  const card=/wild cat with tufted ears/.test(t); const noBrowser=!/text browser/.test(t);
  state.finderName='Animal words'; app.finderCreateAdd(); await new Promise(r=>setTimeout(r,200));
  const c=active(); const key=Object.keys(c.builtLists||{})[0];
  const inList=key && c.builtLists[key].label==='Animal words' && c.builtLists[key].ws.includes('lynx');
  app.finderAddTo(key); // duplicate guard
  const stillOne=c.builtLists[key].ws.length===1;
  return { results, card, noBrowser, inList, stillOne }; });
await v.screenshot({path:'s8-finder.png', clip:{x:300,y:0,width:760,height:900}});
// 9. settings: milestone fields
R.settings=await v.evaluate(async()=>{ app.setNav('settings'); await new Promise(r=>setTimeout(r,300)); const h=document.body.innerHTML;
  return { label:h.includes('data-inp="profMsLabel"'), date:h.includes('data-chg="profMsDate"') }; });
// ---- fresh user: onboarding + placement ----
const f=await (await b.newContext({viewport:{width:1360,height:1100}})).newPage();
f.on('pageerror',e=>errs.push('F:'+e.message));
await f.goto('file:///home/claude/repo/spellbound-app/index.html'); await f.waitForTimeout(700);
R.onbWorlds=await f.evaluate(async()=>{ state.screen='onboarding'; state.onbStep=1; state.draft={name:'Arjun',age:8,avatar:'bizzy',goal:10}; render();
  await new Promise(r=>setTimeout(r,250)); const t=document.body.textContent; const h=document.body.innerHTML;
  return { noRibbon:!/Play to unlock/.test(t), lockCost:/🔒/.test(t)&&/400/.test(t), shortTag:/THE HIVE/.test(t)&&!/SAY · SPELL · SAY/.test(t),
    noDots:!h.includes('width:14px;height:14px;border-radius:999px'), greyed:h.includes('grayscale(.5)') }; });
await f.screenshot({path:'s8-onbworlds.png', clip:{x:300,y:60,width:760,height:1000}});
R.onbGoal=await f.evaluate(async()=>{ state.onbStep=2; render(); await new Promise(r=>setTimeout(r,200));
  const h=document.body.innerHTML; return { beeDay:h.includes('data-chg="onbBeeDate"')&&/Big bee day/.test(document.body.textContent) }; });
R.placement=await f.evaluate(async()=>{ state.draft.beeDate=null; app.startLevelTest(); await new Promise(r=>setTimeout(r,350));
  const t=document.body.textContent; const w=(state.lt.words||[])[0]||{};
  const meaningShown=/Meaning/.test(t) && (!w.d || t.includes(maskTxt(w.d,w.w).slice(0,40)));
  const noSpoiler=!w.d || !new RegExp('Meaning[^]*\\b'+w.w+'\\b').test(t.slice(t.indexOf('Meaning'),t.indexOf('Meaning')+300));
  return { meaningShown, noSpoiler, hasWordData:!!w.d }; });
await f.screenshot({path:'s8-placement.png', clip:{x:380,y:60,width:600,height:760}});
// 10. quest fonts: no mono tagline in quest chooser
R.quest=await f.evaluate(async()=>{ app._finishOnb(); state.screen='app'; app.setNav('quest'); render(); await new Promise(r=>setTimeout(r,300));
  const qh=document.body.innerHTML; const monoSubs=(qh.match(/font-family:var\(--mono\)/g)||[]).length;
  return { monoCount:monoSubs }; });
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();

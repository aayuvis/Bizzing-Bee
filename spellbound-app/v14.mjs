import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const R={};
// ---- fresh family ----
const f=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
f.on('pageerror',e=>errs.push('F:'+e.message));
await f.goto('file:///home/claude/repo/spellbound-app/index.html'); await f.waitForTimeout(800);
// 5. landing: honest + spellable
R.landing=await f.evaluate(()=>{ const t=document.body.textContent;
  return { noRating:!/4\.9/.test(t), offline:/100% offline/.test(t), input:!!document.querySelector('[data-inp="landType"]') }; });
R.landSpell=await f.evaluate(async()=>{ state.landTyped='iridescent'; app.landCheck(); await new Promise(r=>setTimeout(r,300));
  const ok=/Nailed it/.test(document.body.textContent); const rotated=document.body.textContent.includes('bouquet');
  return { ok, rotated }; });
await f.screenshot({path:'s6-landing.png', clip:{x:660,y:150,width:560,height:560}});
// 6c. onboarding: no preselected world, guard works
R.onb=await f.evaluate(async()=>{ state.screen='onboarding'; state.onbStep=1; state.draft={name:'Arjun',age:8,avatar:'bee',goal:10}; render();
  await new Promise(r=>setTimeout(r,200));
  const noActive=!/Active ✓/.test(document.body.textContent);
  app.onbNext(); await new Promise(r=>setTimeout(r,200));
  const blocked=state.onbStep===1;
  app.onbWorld('pixel'); await new Promise(r=>setTimeout(r,200));
  const picked=/Active ✓/.test(document.body.textContent)&&state.draft.theme==='pixel';
  app.onbNext(); const advanced=state.onbStep===2;
  return { noActive, blocked, picked, advanced }; });
// finish onboarding → day-1 home staging
R.day1=await f.evaluate(async()=>{ state.theme='spellbound'; state.draft.theme='spellbound'; app._finishOnb(); state.screen='app'; state.nav='home'; render();
  await new Promise(r=>setTimeout(r,300)); const t=document.body.textContent; const h=document.body.innerHTML;
  return { inviteBanner:/Find your Bee Band/.test(t)&&/Start →/.test(t), bannerStartsTest:/data-act="startLevelTest" data-arg="progress"/.test(h),
    hatchBubble:/Spell 5 words and I hatch/.test(t), noZeroStreak:!/0-day streak/.test(t), kidTip:/Today’s bee tip/.test(t) }; });
await f.screenshot({path:'s6-day1.png', clip:{x:0,y:100,width:1360,height:560}});
// 1. parent cold start
R.parent=await f.evaluate(async()=>{ app.setNav('parent'); await new Promise(r=>setTimeout(r,300)); const t=document.body.textContent;
  return { no999:!/999/.test(t), welcome:/hasn’t practised yet/.test(t), noAlarms:!/Re-engage/.test(t), friendly:/first session/.test(t) }; });
await f.screenshot({path:'s6-parent.png', clip:{x:0,y:100,width:1360,height:700}});
// ---- veteran: band-up celebration + lore + accessories ----
const v=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
v.on('pageerror',e=>errs.push('V:'+e.message));
await v.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:400,band:4,bandSeed:4,missed:[]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await v.goto('file:///home/claude/repo/spellbound-app/index.html'); await v.waitForTimeout(800);
// 2. simulate a Band-5 promotion via logBand evidence
R.bandUp=await v.evaluate(async()=>{ const c=active(); const w4={w:'base',y:4}, w5={w:'zeta',y:5};
  for(let i=0;i<22;i++) logBand(w4,true);
  for(let i=0;i<12;i++) logBand(w5,true);
  render(); await new Promise(r=>setTimeout(r,300)); const t=document.body.textContent;
  return { shown:/Band up!/i.test(t)&&/Band 5 — Regional Ready!/.test(t), stateSet:!!state.bandUp }; });
await v.screenshot({path:'s6-bandup.png', clip:{x:330,y:60,width:700,height:760}});
R.bandUpClose=await v.evaluate(async()=>{ app.bandUpClose(); await new Promise(r=>setTimeout(r,200)); return !state.bandUp && !/Band up!/i.test(document.body.textContent); });
// 6a. hive lore on ladder
R.lore=await v.evaluate(async()=>{ app.openEvo(); await new Promise(r=>setTimeout(r,300)); return /Why a Queen at the top/.test(document.body.textContent); });
// 6b. gear accessories render
R.acc=await v.evaluate(async()=>{ app.openShop(); state.shopTab='power'; render(); await new Promise(r=>setTimeout(r,200)); const t=document.body.textContent;
  const names=/Flight Goggles/.test(t)&&/Hero Cape/.test(t)&&/Lightning Bolt/.test(t);
  const svgs=['goggles','cape','bolt'].every(k=>beeAccSVG(k).includes('<svg'));
  return { names, svgs }; });
await v.screenshot({path:'s6-shop.png', clip:{x:330,y:100,width:700,height:800}});
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();

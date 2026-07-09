import { chromium } from '/opt/pw-browsers/../node22/lib/node_modules/playwright/index.mjs';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const errs=[];
// ---------- FIRST RUN (no saved state) ----------
const f=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
f.on('pageerror',e=>errs.push('F:'+e.message));
await f.goto('file:///home/claude/repo/spellbound-app/index.html'); await f.waitForTimeout(900);
await f.screenshot({path:'r2-firstrun.png', clip:{x:0,y:0,width:1360,height:950}});
const R={};
R.firstScreen=await f.evaluate(()=>({ screen:state.screen, txt:document.body.textContent.replace(/\s+/g,' ').slice(0,200) }));
// walk onboarding
await f.evaluate(()=>{ if(state.screen==='auth'){ app.demoLogin?app.demoLogin():(state.screen='onboarding',render()); } }); await f.waitForTimeout(400);
await f.screenshot({path:'r2-onb1.png', clip:{x:0,y:0,width:1360,height:950}});
R.onb=await f.evaluate(()=>({ screen:state.screen, step:state.onbStep, txt:document.body.textContent.replace(/\s+/g,' ').slice(0,260) }));
// finish onboarding quickly as a 9yo without placement test
await f.evaluate(()=>{ state.screen='onboarding'; state.onbStep=1; state.draft={name:'Maya',age:8,avatar:'bee',theme:'spellbound',goal:10}; render(); });
await f.waitForTimeout(200); await f.screenshot({path:'r2-onb-step1.png', clip:{x:0,y:0,width:1360,height:950}});
R.onbCTA=await f.evaluate(()=>[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).filter(t=>t&&t.length<44).slice(0,14));
// land on home as a brand-new kid
await f.evaluate(()=>{ app._finishOnb?app._finishOnb():0; state.screen='app'; state.nav='home'; render(); }); await f.waitForTimeout(500);
await f.screenshot({path:'r2-home-day1.png', clip:{x:0,y:0,width:1360,height:1000}});
R.day1=await f.evaluate(()=>{ const t=document.body.textContent;
  return { calibrating:/calibrating/i.test(t), zeroStreak:/0-day streak/.test(t), tip:/Tip of the day/i.test(t),
    emptyEvo:/XP to/.test(t), goalZero:/0\/10/.test(t) }; });
// first coach visit
await f.evaluate(()=>{ app.openCoach(); }); await f.waitForTimeout(500);
await f.screenshot({path:'r2-coach-day1.png', clip:{x:0,y:0,width:1360,height:1000}});
// progress on day 1 (all empty states)
await f.evaluate(()=>{ app.setNav('progress'); }); await f.waitForTimeout(400);
await f.screenshot({path:'r2-progress-day1.png', clip:{x:0,y:0,width:1360,height:1000}});
// parent on day 1
await f.evaluate(()=>{ app.setNav('parent'); }); await f.waitForTimeout(400);
await f.screenshot({path:'r2-parent-day1.png', clip:{x:0,y:0,width:1360,height:1000}});
// ---------- VETERAN (engaged profile) ----------
const v=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
v.on('pageerror',e=>errs.push('V:'+e.message));
await v.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:12,acc:86,xp:900,week:[8,12,6,14,9,16,4],questPath:'journey',activeList:'journey',lists:{journey:{xp:2400,stage:5}},coins:340,band:5,bandSeed:4,freezes:1,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2},{w:'silhouette',n:1}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:7,cN:121})); });
await v.goto('file:///home/claude/repo/spellbound-app/index.html'); await v.waitForTimeout(900);
await v.screenshot({path:'r2-home-vet.png', clip:{x:0,y:0,width:1360,height:1000}});
await v.evaluate(()=>{ app.setNav('parent'); }); await v.waitForTimeout(400);
await v.screenshot({path:'r2-parent-vet.png', clip:{x:0,y:0,width:1360,height:1000}});
await v.evaluate(()=>window.scrollTo(0,900)); await v.waitForTimeout(200);
await v.screenshot({path:'r2-parent-vet2.png', clip:{x:0,y:0,width:1360,height:950}});
// celebration screen (engagement peak)
await v.evaluate(()=>{ window.scrollTo(0,0); state.nav='home'; state.celebrate={level:6,list:'Bizzing Bee Journey',date:new Date(2026,6,9).toLocaleDateString()}; render(); }); await v.waitForTimeout(300);
await v.screenshot({path:'r2-celebrate.png', clip:{x:0,y:0,width:1360,height:1000}});
await v.evaluate(()=>{ state.celebrate=null; render(); });
// ---------- MOBILE first-run ----------
const m=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
m.on('pageerror',e=>errs.push('M:'+e.message));
await m.goto('file:///home/claude/repo/spellbound-app/index.html'); await m.waitForTimeout(900);
await m.screenshot({path:'r2-mob-firstrun.png', clip:{x:0,y:0,width:390,height:844}});
R.mobFirst=await m.evaluate(()=>({ overflow:document.documentElement.scrollWidth>392, screen:state.screen }));
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();

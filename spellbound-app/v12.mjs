import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const seed=()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[3,5,2,6,4,7,1],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,band:4,bandSeed:4,missed:[{w:'bouquet',n:2}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); };
const R={};
// ---- mobile 390 ----
const m=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
m.on('pageerror',e=>errs.push('M:'+e.message));
await m.addInitScript(seed);
await m.goto('file:///home/claude/repo/spellbound-app/index.html'); await m.waitForTimeout(900);
R.mobile=await m.evaluate(()=>{ const out={};
  out.noOverflow=document.documentElement.scrollWidth<=392;
  out.tabbar=getComputedStyle(document.querySelector('.sb-tabbar')).display==='flex';
  out.topnavHidden=getComputedStyle(document.querySelector('.sb-topnav')).display==='none';
  out.switchHidden=getComputedStyle(document.querySelector('.sb-modeswitch')).display==='none';
  out.cycleShown=getComputedStyle(document.querySelector('.sb-cycle')).display==='grid';
  const br=document.querySelector('.sb-brand').getBoundingClientRect(); out.brandOneLine=br.height<30;
  out.bandsubHidden=getComputedStyle(document.querySelector('.sb-bandsub')).display==='none';
  return out; });
// cycle button works
R.cycle=await m.evaluate(async()=>{ const before=state.mode; document.querySelector('.sb-cycle').click(); await new Promise(r=>setTimeout(r,200)); const a=state.mode; document.querySelector('.sb-cycle').click(); await new Promise(r=>setTimeout(r,200)); return { before, a, b:state.mode }; });
await m.evaluate(()=>{ app.setMode('light'); });
// tab bar navigation
R.tabnav=await m.evaluate(async()=>{ const btns=[...document.querySelectorAll('.sb-tabbar button')]; btns[2].click(); await new Promise(r=>setTimeout(r,300)); const g=state.nav==='games'; btns[0]&&document.querySelectorAll('.sb-tabbar button')[0].click(); await new Promise(r=>setTimeout(r,200)); return g&&state.nav==='home'; });
await m.screenshot({path:'f-mob-home.png', clip:{x:0,y:0,width:390,height:844}});
// ---- desktop ----
const pg=await (await b.newContext({viewport:{width:1360,height:1000}})).newPage();
pg.on('pageerror',e=>errs.push('D:'+e.message));
await pg.addInitScript(seed);
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
R.desktop=await pg.evaluate(()=>({ topnav:getComputedStyle(document.querySelector('.sb-topnav')).display!=='none',
  tabbarHidden:getComputedStyle(document.querySelector('.sb-tabbar')).display==='none',
  cycleHidden:getComputedStyle(document.querySelector('.sb-cycle')).display==='none' }));
// consistency: drawer has no "Level", progress has no Band tile, band card has no 0%
R.consist=await pg.evaluate(async()=>{ state.drawerOpen=true; render(); const d=document.querySelector('aside').textContent;
  const drawerNoLevel=!/Level \d/.test(d); state.drawerOpen=false; app.setNav('progress'); await new Promise(r=>setTimeout(r,200));
  const t=document.body.textContent;
  return { drawerNoLevel, noBandTile:!/Band 4[\s\S]{0,30}Bee Band/.test(t)||!/>Bee Band</.test(document.body.innerHTML),
    noZeroPct:!/0% right at this band/.test(t), tierCard:/Your Bee Band/.test(t),
    weekLabeled:(document.body.textContent.match(/This week/)&&[...document.querySelectorAll('div')].some(x=>x.textContent==='6'&&x.style.fontSize==='11px')) }; });
await pg.screenshot({path:'f-progress.png', clip:{x:0,y:0,width:1360,height:900}});
// concepts hub covers
await pg.evaluate(()=>{ app.setNav('concepts'); }); await pg.waitForTimeout(500);
R.concepts=await pg.evaluate(()=>{ const t=document.body.textContent;
  return { topicOnCover:/Basics/.test(t)&&/Prefixes/.test(t), chip:/Ch 1/.test(t), noDupTitle:!/Chapter 1\s*Chapter 1/.test(t) }; });
await pg.screenshot({path:'f-concepts.png', clip:{x:0,y:0,width:1360,height:900}});
// sb-card count on progress/parent
R.cards=await pg.evaluate(async()=>{ app.setNav('progress'); await new Promise(r=>setTimeout(r,200)); const p=document.querySelectorAll('.sb-card').length;
  app.setNav('parent'); await new Promise(r=>setTimeout(r,200)); const pa=document.querySelectorAll('.sb-card').length; return {progress:p, parent:pa}; });
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();

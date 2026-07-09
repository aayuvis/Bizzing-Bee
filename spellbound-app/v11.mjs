import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const ctx=await b.newContext({viewport:{width:1360,height:1000}});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[3,5,2,6,4,7,1],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,band:4,bandSeed:4,missed:[{w:'bouquet',n:2},{w:'occurrence',n:2},{w:'necessary',n:1}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await pg.goto('file:///home/claude/repo/spellbound-app/index.html'); await pg.waitForTimeout(900);
const shot=(n,h,y)=>pg.screenshot({path:`dr-${n}.png`, clip:{x:0,y:y||0,width:1360,height:h||950}});
// 1-4 home across worlds/modes
await shot('home-light');
await pg.evaluate(()=>{ app.setMode('dusk'); }); await pg.waitForTimeout(600); await shot('home-dusk');
await pg.evaluate(()=>{ app.setMode('white'); state.theme='arcade'; render(); }); await pg.waitForTimeout(600); await shot('home-white-arcade');
await pg.evaluate(()=>{ app.setMode('light'); state.theme='marquee'; render(); }); await pg.waitForTimeout(600); await shot('home-spotlight');
await pg.evaluate(()=>{ state.theme='spellbound'; render(); }); await pg.waitForTimeout(400);
// 5 coach
await pg.evaluate(()=>{ app.openCoach(); }); await pg.waitForTimeout(500); await shot('coach',1000);
// 6 evolution screen
await pg.evaluate(()=>{ app.openEvo(); }); await pg.waitForTimeout(400); await shot('evolution',760);
// 7 progress full
await pg.evaluate(()=>{ app.setNav('progress'); }); await pg.waitForTimeout(400); await shot('progress-top',1000);
await pg.evaluate(()=>window.scrollTo(0,950)); await pg.waitForTimeout(200);
await pg.screenshot({path:'dr-progress-mid.png', clip:{x:0,y:0,width:1360,height:950}});
await pg.evaluate(()=>window.scrollTo(0,0));
// 8 explore + concepts
await pg.evaluate(()=>{ app.setNav('explore'); }); await pg.waitForTimeout(400); await shot('explore',820);
await pg.evaluate(()=>{ app.setNav('concepts'); }); await pg.waitForTimeout(500); await shot('concepts',1000);
// 9 quest chooser
await pg.evaluate(()=>{ app.openQuestChooser&&app.openQuestChooser(); }); await pg.waitForTimeout(400); await shot('quest-chooser',950);
// 10 drawer
await pg.evaluate(()=>{ app.setNav('home'); state.drawerOpen=true; render(); }); await pg.waitForTimeout(300); await shot('drawer',950);
await pg.evaluate(()=>{ state.drawerOpen=false; render(); });
// 11 onboarding
await pg.evaluate(()=>{ state.screen='onboarding'; state.onbStep=1; state.draft={name:'',age:9,avatar:'bee',theme:'spellbound',goal:10}; render(); }); await pg.waitForTimeout(300); await shot('onboarding',950);
await pg.evaluate(()=>{ state.screen='app'; state.nav='home'; render(); });
// 12 mobile sweep
const mb=await (await b.newContext({viewport:{width:390,height:844}})).newPage();
mb.on('pageerror',e=>errs.push('MOBILE:'+e.message));
await mb.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bee',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,week:[3,5,2,6,4,7,1],questPath:'journey',activeList:'journey',lists:{journey:{xp:600,stage:2}},coins:120,band:4,bandSeed:4,missed:[{w:'bouquet',n:2}]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await mb.goto('file:///home/claude/repo/spellbound-app/index.html'); await mb.waitForTimeout(900);
await mb.screenshot({path:'dr-mob-home.png', clip:{x:0,y:0,width:390,height:844}});
await mb.evaluate(()=>window.scrollTo(0,800)); await mb.waitForTimeout(200);
await mb.screenshot({path:'dr-mob-home2.png', clip:{x:0,y:0,width:390,height:844}});
await mb.evaluate(()=>{ window.scrollTo(0,0); app.openCoach(); }); await mb.waitForTimeout(500);
await mb.screenshot({path:'dr-mob-coach.png', clip:{x:0,y:0,width:390,height:844}});
await mb.evaluate(()=>{ app.openGames(); app.playGame('magic'); }); await mb.waitForTimeout(500);
await mb.screenshot({path:'dr-mob-magic.png', clip:{x:0,y:0,width:390,height:844}});
const hscroll=await mb.evaluate(()=>document.documentElement.scrollWidth>395);
console.log('mobile horizontal overflow:',hscroll);
console.log('pageerrors:',errs.length?errs:'none');
await b.close();

import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const errs=[];
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const R={};
const v=await (await b.newContext({viewport:{width:1360,height:1100}})).newPage();
v.on('pageerror',e=>errs.push(e.message));
await v.addInitScript(()=>{ const kid={name:'Ahana',age:9,avatar:'bizzy',theme:'spellbound',goal:10,streak:5,acc:82,xp:220,questPath:'journey',activeList:'journey',lists:{journey:{xp:60,stage:2}},coins:900,band:4,bandSeed:4,missed:[]};
  localStorage.setItem('sb_saas_v2',JSON.stringify({theme:'spellbound',mode:'light',premium:true,children:[kid],activeIdx:0,goalDone:4,cN:121})); });
await v.goto('file:///home/claude/repo/spellbound-app/index.html'); await v.waitForTimeout(900);
// 1. locked world card treatment (onboarding + settings both use worldHeroCard)
R.world=await v.evaluate(()=>{ const h=worldHeroCard(THEMES.find(t=>t.id==='aurora'), false, true, 'onbWorld');
  return { pillRight:/top:10px;right:10px;left:auto;z-index:3/.test(h), fullGrey:/grayscale\(1\)/.test(h)&&/opacity:\.75/.test(h), lockCost:h.includes('🔒')&&h.includes('400') }; });
// 2. print dialog toggles + guard
R.dlg=await v.evaluate(async()=>{ app.openCoach(); await new Promise(r=>setTimeout(r,300));
  app.printOpen(); await new Promise(r=>setTimeout(r,250)); const t=document.body.textContent;
  const rows=/pick one, two or three/.test(t)&&/Sort by/.test(t)&&/Compact — less paper/.test(t);
  app.printSet('inc:p'); app.printSet('inc:d'); // leave only words
  const one=state.prn.inc.w===1&&!state.prn.inc.p&&!state.prn.inc.d;
  app.printSet('inc:w'); const guarded=state.prn.inc.w===1; // can't turn off the last one
  app.printSet('inc:d'); app.printSet('sort:alpha'); app.printSet('size:compact');
  return { rows, one, guarded, sortSet:state.prn.sort==='alpha', sizeSet:state.prn.size==='compact' }; });
await v.screenshot({path:'s9-printdlg.png', clip:{x:440,y:100,width:490,height:760}});
// 3. printDoc output shapes
R.doc=await v.evaluate(()=>{ const key=activeListKey(); const out={};
  state.prn={inc:{w:1,p:1,d:1},page:'letter',scope:'level',sort:'alpha',size:'normal'};
  let h=printDoc(key); const words=[...h.matchAll(/class="w">([^<]+)</g)].map(m=>m[1]);
  out.alphaSorted=words.every((w,i)=>i===0||words[i-1].localeCompare(w)<=0);
  state.prn.sort='diff'; h=printDoc(key); out.diffRuns=h.length>500;
  state.prn={inc:{w:1,p:0,d:0},page:'a4',scope:'level',sort:'level',size:'compact'};
  h=printDoc(key); out.compactCols=/repeat\(4,1fr\)/.test(h); out.compactFont=/font-size:11px;font-weight:bold/.test(h); out.smallMargin=/margin:9mm/.test(h);
  state.prn={inc:{w:0,p:0,d:1},page:'letter',scope:'level',sort:'level',size:'normal'};
  h=printDoc(key); out.quizTitle=/quiz sheet/.test(h); out.blanks=/class="blank"/.test(h); out.maskedDefs=!/class="w">/.test(h);
  state.prn={inc:{w:1,p:1,d:0},page:'letter',scope:'level',sort:'level',size:'normal'};
  h=printDoc(key); out.twoCols=/repeat\(2,1fr\)/.test(h); out.hasPron=/class="p">/.test(h); out.noDefs=!/class="d">/.test(h);
  return out; });
console.log(JSON.stringify(R,null,1)); console.log('pageerrors:',errs.length?errs:'none');
await b.close();

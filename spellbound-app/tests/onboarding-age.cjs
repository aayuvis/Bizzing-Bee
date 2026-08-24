/* Onboarding asks for a DISPLAY NAME and an AGE RANGE — never a real name or an exact age.
   c.ageBand is the value of record; c.age is written as the band midpoint so all eight
   existing age readers (ttBand, diffRange, ageMode, the tips engine...) keep working.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/onboarding-age.cjs */
const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
  const pg=await b.newPage({viewport:{width:1180,height:1200}});
  const errs=[]; pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'..')+'/index.html'); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(async()=>{
    state.children=[]; state.screen='onboarding'; state.onbStep=0;
    state.draft={name:'',age:9,avatar:'bee',goal:10}; render();
    await new Promise(r=>setTimeout(r,400));
    const out={ bands:[...document.querySelectorAll('[data-act="onDraftBand"]')].length,
      slider:!!document.querySelector('[data-inp="onDraftAge"]'),
      txt:document.body.innerText.slice(0,600) };
    const el=document.querySelector('[data-act="onDraftBand"][data-arg="14-18"]');
    if(el){ el.click(); await new Promise(r=>setTimeout(r,300));
      out.draftAge=state.draft.age; out.draftBand=state.draft.ageBand; }
    app._finishOnb && app._finishOnb();
    await new Promise(r=>setTimeout(r,400));
    const c=state.children[0]||{}; out.kidBand=c.ageBand; out.kidAge=c.age;
    return out;
  });
  if(r.bands!==4) errs.push('onboarding shows '+r.bands+' age bands');
  if(r.slider) errs.push('the exact-age slider survives in onboarding');
  if(!/Display name/.test(r.txt)) errs.push('onboarding still says "Name" not "Display name"');
  if(r.draftBand!=='14-18') errs.push('draft band = '+r.draftBand);
  if(r.kidBand!=='14-18') errs.push('saved child band = '+r.kidBand);
  if(r.kidAge!==16) errs.push('saved child age midpoint = '+r.kidAge+' (want 16)');
  await b.close();
  console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS — onboarding asks for a display name and an age range, and stores both');
  process.exit(errs.length?1:0);
})();

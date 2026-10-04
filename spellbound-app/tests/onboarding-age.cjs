/* Onboarding asks for a DISPLAY NAME and an AGE RANGE — never a real name or an exact age.
   c.ageBand is the value of record; c.age is written as the band midpoint so all eight
   existing age readers (ttBand, diffRange, ageMode, the tips engine...) keep working.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/onboarding-age.cjs */
const { chromium } = require('playwright');
(async()=>{
  const b=await chromium.launch({executablePath:process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p))});
  const pg=await b.newPage({viewport:{width:1180,height:1200}});
  const errs=[]; pg.on('pageerror',e=>errs.push('pageerror: '+e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'..')+'/index.html'); await pg.waitForTimeout(3000);
  const r=await pg.evaluate(async()=>{
    const wait=ms=>new Promise(r=>setTimeout(r,ms));
    state.children=[]; state.screen='onboarding'; state.onbStep=0;
    state.draft={name:'',age:9,avatar:'bizzy',goal:10}; render(); await wait(400);
    const out={ steps:[], slider:false, avCount:0, worldCount:0, lockedWorlds:0 };
    /* ONE DECISION PER SCREEN. Walk the whole flow and record what each step asks for —
       the failure this catches is a step quietly growing a second question, which is what
       the old step 0 was: a name, an age band and a buddy off a grid of twenty. */
    for(let i=0;i<8;i++){
      const h=(document.querySelector('h2')||{}).textContent||'';
      const asks=['onDraftBand','pickAvatar','onbWorld','pickGoal']
        .filter(a=>document.querySelector('[data-act="'+a+'"]'))
        .concat(document.querySelector('[data-inp="onDraftName"]')?['name']:[]);
      out.steps.push({ step:state.onbStep, h, asks });
      if(document.querySelector('[data-inp="onDraftAge"]')) out.slider=true;
      if(asks.includes('pickAvatar')) out.avCount=document.querySelectorAll('[data-act="pickAvatar"]').length;
      if(asks.includes('onbWorld')){
        const w=[...document.querySelectorAll('[data-act="onbWorld"]')];
        out.worldCount=w.length;
        out.lockedWorlds=w.filter(x=>/🔒|Unlock/.test(x.textContent||'')).length;
      }
      const nm=document.querySelector('[data-inp="onDraftName"]');
      if(nm&&!nm.value){ nm.value='Ahana'; nm.dispatchEvent(new Event('input',{bubbles:true})); }
      const band=document.querySelector('[data-act="onDraftBand"][data-arg="14-18"]');
      if(band){ band.click(); await wait(250); out.draftAge=state.draft.age; out.draftBand=state.draft.ageBand; }
      const w0=document.querySelector('[data-act="onbWorld"]'); if(w0) w0.click();
      const nx=[...document.querySelectorAll('[data-act="onbNext"]')].pop();
      if(nx) nx.click(); await wait(500);
      if(state.screen==='app') break;
    }
    out.txt=out.steps.map(s=>s.h).join(' | ');
    out.bands=(out.steps.find(s=>s.asks.includes('onDraftBand'))||{}).asks?4:0;
    const c=state.children[0]||{}; out.kidBand=c.ageBand; out.kidAge=c.age; out.landed=state.screen;
    return out;
  });
  /* the promise this file has always held */
  if(r.slider) errs.push('the exact-age slider survives in onboarding');
  if(r.landed!=='app') errs.push('onboarding did not finish — stuck on '+r.landed);
  /* ONE DECISION PER SCREEN (the Bizzing Finance shape, adopted 30 Sep 2026). */
  const busy=r.steps.filter(s=>s.asks.length>1);
  if(busy.length) errs.push('a step asks more than one thing: '+busy.map(s=>'"'+s.h+'" ['+s.asks.join('+')+']').join(', '));
  if(r.steps.length<5) errs.push('onboarding collapsed to '+r.steps.length+' steps — one decision each means five');
  /* A STARTER SET, NOT A CATALOGUE. Twenty avatars plus a locked legendary row, and
     eight worlds of which seven wore a padlock and a price, was a shop before a word. */
  if(r.avCount!==5) errs.push('buddy step offers '+r.avCount+' avatars, want 5');
  if(r.worldCount!==2) errs.push('world step offers '+r.worldCount+' worlds, want 2');
  if(r.lockedWorlds) errs.push(r.lockedWorlds+' world(s) padlocked at first run — a locked tile is an advert, not a choice');
  if(r.draftBand!=='14-18') errs.push('draft band = '+r.draftBand);
  if(r.kidBand!=='14-18') errs.push('saved child band = '+r.kidBand);
  if(r.kidAge!==16) errs.push('saved child age midpoint = '+r.kidAge+' (want 16)');
  /* (audit v4 S3) the COPPA notice says what the profile step asks for: an age RANGE, never an
     exact age — at the point of collection, in the table, and where it says what stays home */
  { const P=require('fs').readFileSync(require('path').resolve(__dirname,'..','privacy.html'),'utf8').replace(/<[^>]+>/g,'').replace(/\s+/g,' ');
    if(!/asks for a first name \(or nickname\) and an age range\b/.test(P)) errs.push('privacy.html: the profile step is not described as asking for an age range');
    if(/Child's age(?! range)/.test(P)) errs.push("privacy.html: the table lists \"Child's age\", not the age range the app stores");
    if(/The name and the age never leave/.test(P)) errs.push('privacy.html: "the name and the age never leave the device" — it is an age range'); }
  await b.close();
  console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS — onboarding asks for a display name and an age range, and stores both');
  process.exit(errs.length?1:0);
})();

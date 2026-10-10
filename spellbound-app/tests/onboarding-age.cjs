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
    for(let i=0;i<10;i++){
      /* (road to 4.5, P1.7) the 14–18 band walks the PLACEMENT step too — its own step, its words first
         (one thing: a word to spell) and then its one decision (where to start). Wait for its lazy file. */
      if(onbKey()==='place'){ for(let t=0;t<40&&!(state.draft.pl&&document.querySelector('[data-inp="placeType"],[data-act="placePick"]'));t++) await wait(100); }
      const h=(document.querySelector('h2')||{}).textContent||'';
      const asks=['onDraftBand','pickAvatar','onbWorld','pickGoal','placePick']
        .filter(a=>document.querySelector('[data-act="'+a+'"]'))
        .concat(document.querySelector('[data-inp="onDraftName"]')?['name']:[])
        .concat(document.querySelector('[data-inp="placeType"]')?['placeWord']:[]);
      out.steps.push({ step:state.onbStep, key:onbKey(), h, asks });
      if(asks.includes('placeWord')){
        /* answer all twelve "not yet" through the box, by keyboard, exactly as a child who knows none would */
        for(let n=0;n<12&&document.querySelector('[data-inp="placeType"]');n++){ const box=document.querySelector('[data-inp="placeType"]');
          box.value='zz'; box.dispatchEvent(new Event('input',{bubbles:true})); box.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); await wait(80); }
        continue;
      }
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
    out.start=((c.trail||{}).start)||null;
    /* the step comes with the band: none for 5–7 or 8–10, one for 11–13 and 14–18 */
    const keysFor=k=>{ const d=state.draft; state.draft={name:'x',age:9,ageBand:k}; const K=onbKeys(); state.draft=d; return K.join(','); };
    out.keys={}; ['5-7','8-10','11-13','14-18'].forEach(k=>{ out.keys[k]=keysFor(k); });
    return out;
  });
  /* (road to 4.5, P1.7) placement is its own step for the 10+ bands only, and a run is recorded as a start */
  const PL='name,age,place,buddy,world,goal', NOPL='name,age,buddy,world,goal';
  if(r.keys['5-7']!==NOPL||r.keys['8-10']!==NOPL||r.keys['11-13']!==PL||r.keys['14-18']!==PL) errs.push('the placement step is not offered to exactly the 11–13 and 14–18 bands: '+JSON.stringify(r.keys));
  if(!r.steps.some(s=>s.key==='place'&&s.asks.join()==='placeWord')||!r.steps.some(s=>s.key==='place'&&s.asks.join()==='placePick')) errs.push('the 14–18 walk did not meet the placement step\'s words and then its choice: '+JSON.stringify(r.steps.map(s=>s.key+':'+s.asks.join('+'))));
  if(!r.start||r.start.n!==12||r.start.u!=='u1') errs.push('twelve "not yet" answers should start at the Meadow (u1) and be recorded: '+JSON.stringify(r.start));
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
    if(/The name and the age never leave/.test(P)) errs.push('privacy.html: "the name and the age never leave the device" — it is an age range');
    if(!/restore onto a new device, the app asks you for the name and the age range there/.test(P)) errs.push('privacy.html: the restore step is not described as asking for an age range'); }
  /* (follow-up) the cloud-restore sheet asks the same RANGE onboarding and Settings ask — it took an
     exact age in a number box. A restored child gets c.ageBand and its midpoint c.age (setAgeBand). */
  const rs=await pg.evaluate(async()=>{ const wait=ms=>new Promise(r=>setTimeout(r,ms));
    const before=state.children.length; state.screen='app';
    state.cloudSheet='restore'; state.cloudErr=null; state.cloudList=[{ row:{ id:'cid-test', display_name:'Fox', spell_level:3, avatar:'fox' }, child:{ cid:'cid-test', avatar:'fox', theme:'spellbound', level:3, lists:{default:{xp:5}}, activeList:'default' }, updated_at:Date.now() }];
    render(); await wait(200);
    const sel=document.querySelector('select#clda-0'); const num=document.querySelector('input[id^="clda-"]');
    const opts=sel?[...sel.options].map(o=>o.value):[]; const label=sel&&sel.getAttribute('aria-label');
    const txt=(document.body.innerText.match(/name and age[^.]*uploaded/)||[''])[0];
    if(sel){ sel.value='11-13'; } const nm=document.getElementById('cldn-0'); if(nm) nm.value='Rhea';
    app.cloudAdd(0); await wait(200);
    const kid=state.children[state.children.length-1];
    return { opts, label, num:!!num, txt, added:state.children.length===before+1, band:kid&&kid.ageBand, age:kid&&kid.age, name:kid&&kid.name }; });
  if(rs.num) errs.push('the restore sheet still has a number box for an exact age');
  if(rs.opts.join()!==['5-7','8-10','11-13','14-18'].join() || rs.label!=='Age range') errs.push('the restore sheet does not offer the four age ranges — '+JSON.stringify(rs.opts)+' '+rs.label);
  if(!/age range were never uploaded/.test(rs.txt)) errs.push('the restore sheet says "'+rs.txt+'", not "name and age range"');
  if(!rs.added || rs.band!=='11-13' || rs.age!==12 || rs.name!=='Rhea') errs.push('a restored child should be Rhea, band 11-13, age midpoint 12 — got '+JSON.stringify(rs));
  /* (road to 4.5, P0.24) the grown-ups' speller cards print each child's age RANGE ("Ages 14–18"),
     never the midpoint stored for the old readers ("Age 16"). Read from the Parent Zone's own render. */
  const pz=await pg.evaluate(()=>{ const t=viewParent().replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');
    return { ages:t.match(/Ages? \d[\d–-]*/g)||[], want:state.children.map(c=>'Ages '+ageBandOf(c).n) }; });
  if(!pz.want.length || pz.ages.length!==pz.want.length || pz.ages.some((a,i)=>a!==pz.want[i])) errs.push('the Parent Zone prints '+JSON.stringify(pz.ages)+', want the age ranges '+JSON.stringify(pz.want));
  await b.close();
  console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS — onboarding asks for a display name and an age range, and stores both');
  process.exit(errs.length?1:0);
})();

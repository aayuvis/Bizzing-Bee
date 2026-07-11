/* Bizzing Bee — SPELLING QUEST. Each avatar pack's story arc is a playable season:
   5 chapters (survival → accuracy gate → word origins → boss → finale boss).
   Data-driven from SQ_META (below) + the SB_AVATARS roster (cast = pack avatars in
   rarity order = unlock order). Reuses global helpers from app3.js: state, render,
   deviceSpeak/say, active, addCoins, logBand, markMastered, gameWords, burstConfetti,
   sfx, SB_AVATAR, esc/escA, iconSVG. Progress persists in localStorage (sq_progress). */
(function(){
  'use strict';
  const A = ()=>window.SB_AVATARS||{list:[],packs:[]};
  // per-pack season copy: title, boss identity, 5 chapters, and origins BUZZ FACTS.
  const META = {
    hive:{ title:'The Silent Meadow', boss:'The Bramble', accent:'#FFC23D', deep:'#4A32A8',
      chapters:[['The Quiet Morning','The meadow wakes silent — spell to rouse the first bees.'],
        ['The Crew Assembles','Pack the emergency honey — 10 words, spell 7 to load the glider.'],
        ['The Waggle Map','Where the wax runs out, prove you know your words by their roots.'],
        ['Bramble Gate','A wall of thorns. Every word you spell pushes it back.'],
        ['The First Flower','The Bramble regrows, thicker. Spell it away for good.']],
      facts:[['“Nectar” is Greek for the drink of which beings?','The gods',['Kings','Bees','Giants']],
        ['A queen bee can lay how many eggs a day?','About 2,000',['About 20','About 200','About 2 million']],
        ['Honey never…','spoils',['freezes','floats','melts']],
        ['The waggle dance tells other bees…','where flowers are',['when to sleep','the weather','who is queen']]] },
    stage:{ title:'Opening Night', boss:'The Blackout', accent:'#F0A82A', deep:'#5C3A08',
      chapters:[['Blackout','The lights die an hour to curtain — spell to keep the show alive.'],
        ['Rescored','Rewrite the show in the dark — spell 7 of 10 to make the cue.'],
        ['Stalling the Crowd','Keep the crowd happy — prove your word knowledge.'],
        ['One Last Number','The Blackout wants silence. Spell to bring the light back.'],
        ['The Candlelight Finale','One beam left. Spell the finale into a standing ovation.']],
      facts:[['“Break a leg” actually means…','good luck',['run fast','fall over','sing loud']],
        ['An orchestra tunes to which single note?','A',['C','G','E']],
        ['“Encore” is French for…','again',['bravo','more please','the end']],
        ['“Limelight” came from stages burning…','lime rock',['candles','oil','coal']]] },
    cosmos:{ title:'The Missing Star', boss:'The Long Dark', accent:'#36D1FF', deep:'#1E2A5C',
      chapters:[['The Hole in the Sky','A star has blinked out — spell to light the launch pad.'],
        ['Launch Window','Countdown to liftoff — spell 7 of 10 to clear the tower.'],
        ['The Shortcut','Navigate the asteroids by knowing your words’ origins.'],
        ['The Lonely Dark','The Long Dark hoards the light. Spell to win it back.'],
        ['Rehung and Burning','Hang the star for good — spell the finale bright.']],
      facts:[['A comet’s tail always points…','away from the Sun',['at the Sun','down','backwards']],
        ['There are more stars than…','grains of sand on Earth’s beaches',['people','atoms','words']],
        ['Near a black hole, time runs…','slower',['faster','backwards','sideways']],
        ['Nebulas are where new…','stars are born',['planets die','comets hide','moons melt']]] },
    dojo:{ title:'The Silent Bell', boss:'The Silent Bell', accent:'#FFD23F', deep:'#6E1F30',
      chapters:[['The Trial','Ring the bell that never rings — begin by spelling true.'],
        ['Speed Fails','Strikes won’t work — spell 7 of 10 with calm and care.'],
        ['The Secret','Read the old scrolls — know your words by their roots.'],
        ['One Breath','The Bell stays silent. Spell in perfect stillness.'],
        ['The Answer','One low note. Spell the finale and the Bell rings itself.']],
      facts:[['A koi that climbs the waterfall becomes a…','dragon',['crane','tiger','star']],
        ['The lucky waving cat is about how old a charm?','400 years',['40 years','4 years','4,000 years']],
        ['Bamboo can grow how much in a day?','almost a metre',['a centimetre','ten metres','nothing']],
        ['Eastern dragons are said to bring…','rain and luck',['fire','winter','gold']]] },
    lab:{ title:'The Great Fizz', boss:'The Great Flat', accent:'#9BE34D', deep:'#0F3A34',
      chapters:[['Flat','Every bubble went flat — spell to spark the reaction.'],
        ['Diagnosis','Run the tests — spell 7 of 10 to isolate the fault.'],
        ['The Wake-Up','Know your elements — origins quiz to charge the mix.'],
        ['The Happy Accident','The Great Flat spreads. Spell the fizz back to life.'],
        ['Golden Fizz','Pour the winning demo — spell the finale for the crowd.']],
      facts:[['Soda fizz is a gas escaping — which one?','Carbon dioxide',['Oxygen','Helium','Steam']],
        ['Lightning is hotter than the surface of the…','Sun',['Moon','Earth','a candle']],
        ['Gold’s chemical symbol is…','Au',['Go','Gd','Gl']],
        ['You are made of about how many atoms?','7 octillion',['7 hundred','7 million','7 billion']]] },
    arcade:{ title:'Insert Coin', boss:'Boss Bot', accent:'#FF5D9E', deep:'#12234A',
      chapters:[['Last Token','The arcade closes tomorrow — spell to earn one more play.'],
        ['Co-op Mode','Team up — spell 7 of 10 to clear the level together.'],
        ['The Warp Route','Find the secret path by knowing your words.'],
        ['Boss Fight','Boss Bot, full health. Every word deals damage.'],
        ['High Score','Boss Bot’s final form. Spell the finale for the record.']],
      facts:[['“Pixel” is short for…','picture element',['pointy circle','pick colour','pixie light']],
        ['The first computer “bug” was a real…','moth',['worm','spider','ant']],
        ['Neon signs glow because electricity lights up the…','gas',['glass','metal','paint']],
        ['A “boss” fight guards…','the end of a level',['the start','the shop','the menu']]] },
    origami:{ title:'One Thousand Folds', boss:'The Unfolding', accent:'#F2E9DA', deep:'#6E3418',
      chapters:[['The Unfolding','Creases are fading — spell to hold the paper world together.'],
        ['Nine Hundred Ninety-Nine','Fold toward the wish — spell 7 of 10 cleanly.'],
        ['The Ink River','Cross the river by knowing your words’ origins.'],
        ['The Pattern','The Unfolding tears at the map. Spell each crease sharp.'],
        ['The Thousandth Crane','One sheet, no cuts. Spell the finale and the crane rises.']],
      facts:[['Fold 1,000 cranes and legend grants you a…','wish',['dragon','song','feast']],
        ['Paper can be folded in half only about…','7 times',['70 times','17 times','once']],
        ['Origami folds now help unfold…','satellites',['sandwiches','shoes','clocks']],
        ['A real origami frog jumps when you press its…','back fold',['nose','tail','eyes']]] },
    elements:{ title:'Four-Season Tuesday', boss:'The Pileup', accent:'#9BD3B4', deep:'#123A52',
      chapters:[['The Pileup','All four seasons at once — spell to restore order.'],
        ['Scouting the Jam','Ride the jetstream — spell 7 of 10 to map the mess.'],
        ['The Argument','Settle fire and water by knowing your words.'],
        ['Cooler Heads','The Pileup rages. Spell to calm each season down.'],
        ['Taking Turns','Conduct the seasons back in line — spell the finale.']],
      facts:[['Wind is air racing from crowded space to…','empty space',['the sea','the sky','the sun']],
        ['An average cloud weighs about as much as…','100 elephants',['a feather','a car','a whale']],
        ['Lightning strikes Earth about how often?','100 times a second',['once a day','once a year','never']],
        ['The water you drink was once sipped by…','dinosaurs',['no one','robots','the moon']]] },
    critter:{ title:'The Big Splash', boss:'The Log Jam', accent:'#FFD9A8', deep:'#5C2A10',
      chapters:[['Low Tide','The pond is dropping — spell to send word to every burrow.'],
        ['The Zoom','Rally the crew — spell 7 of 10 to reach the river.'],
        ['The Log Jam Found','Study the blockage by knowing your words.'],
        ['Team Lift','The Log Jam holds fast. Spell to pull it apart.'],
        ['The Splash','One last heave — spell the finale and the river runs free.']],
      facts:[['Sharks are older than…','trees',['dinosaurs only','fish','the moon']],
        ['Otters hold hands while they…','sleep',['eat','swim','sing']],
        ['Axolotls can regrow their…','legs and tails',['fur','shells','wings']],
        ['A narwhal’s tusk is really a giant…','tooth',['horn','bone','claw']]] },
    vibe:{ title:'The Sleepover', boss:'The Dark', accent:'#FF7FBE', deep:'#2E1B52',
      chapters:[['8:03pm','The power dies mid-match — spell to light the night.'],
        ['Snack Protocol','Raid the kitchen — spell 7 of 10 by phone-light.'],
        ['Unplugged','Keep spirits up by knowing your words.'],
        ['Big Feelings','The Dark feels lonely. Spell to chase it off.'],
        ['Snow Day','Dawn arrives white. Spell the finale for the surprise.']],
      facts:[['“GG” means…','good game',['go go','great grab','get gold']],
        ['Cats can’t taste…','sweet things',['water','salt','sour']],
        ['Boba pearls are made from…','tapioca root',['jelly','sugar glass','beans']],
        ['A digital song is secretly just…','numbers',['light','magnets','air']]] },
    dino:{ title:'The Rumble Egg', boss:'The Rockslide', accent:'#F0A82A', deep:'#2B4A1E',
      chapters:[['The Egg','A mystery egg appears — spell to guard it.'],
        ['Theories','Everyone has a guess — spell 7 of 10 to keep watch.'],
        ['The Search','Track the parents by knowing your words.'],
        ['The Rockslide','A rockslide blocks the nest. Spell each boulder away.'],
        ['Hatch Day','The last stones fall — spell the finale as the egg hatches.']],
      facts:[['Real raptors were covered in…','feathers',['scales only','fur','armour']],
        ['A Triceratops frill could grow bigger than a…','car door',['coin','house','pond']],
        ['Spinosaurus is the only dinosaur known to…','swim',['fly','glow','sing']],
        ['Dragon legends may have begun from digging up…','dinosaur bones',['gold','shells','ice']]] },
    enchanted:{ title:'The Borrowed Moon', boss:'The Moonless Night', accent:'#FF9EC4', deep:'#44205C',
      chapters:[['The Moonless Night','The moon won’t rise — spell to light the path.'],
        ['Follow the Lights','Steer by moonlight-memory — spell 7 of 10.'],
        ['The Fairy Ring','Pass the ring by knowing your words’ origins.'],
        ['The Sleeping Moon','The Moonless Night clings on. Spell to wake the moon.'],
        ['Rehung','Weave the moon back — spell the finale before the festival.']],
      facts:[['Luna moths live about a week and never…','eat',['sleep','fly','land']],
        ['Fairy rings are really circles of…','mushrooms',['stones','flowers','ice']],
        ['Most “shooting stars” are dust the size of a…','grain of rice',['car','house','coin']],
        ['Auroras were called sparks from a…','fox’s tail',['dragon','star','candle']]] },
    wildhearts:{ title:'The Long Way Home', boss:'The Storm', accent:'#FFC0D8', deep:'#5C1F38',
      chapters:[['The Pull South','A young monarch must migrate — spell to set out.'],
        ['The Send-Off','The meadow walks her out — spell 7 of 10.'],
        ['The River','Cross safely by knowing your words.'],
        ['The Storm','The Storm blocks the way. Spell to push through it.'],
        ['Arrival','The last valley — spell the finale and she lands home.']],
      facts:[['Monarchs migrate about how far?','4,800 km',['48 km','480 km','48,000 km']],
        ['Dolphins invent a signature… for each other.','whistle',['dance','colour','smell']],
        ['Wolves harmonize so the pack sounds…','bigger',['quieter','faster','sleepy']],
        ['A rabbit’s happy jump-twist is called a…','binky',['boing','flip','zoom']]] },
    legends:{ title:'The Proof', boss:'The Doubt', accent:'#7CFFB2', deep:'#14402A',
      chapters:[['The Kid with the Camera','A believer arrives — spell to stay hidden yet kind.'],
        ['The Council','The monsters gather — spell 7 of 10 to be heard.'],
        ['The Vote','Win the argument by knowing your words.'],
        ['The Doubt','The Doubt says monsters aren’t real. Spell to prove otherwise.'],
        ['The Photo','One perfect shot — spell the finale for the friendship.']],
      facts:[['Loch Ness holds more water than every lake in…','England and Wales',['the world','Scotland','Asia']],
        ['Giant squid have eyes the size of…','dinner plates',['coins','peas','windows']],
        ['Griffin legends may come from finding…','dinosaur skeletons',['gold','meteors','shells']],
        ['A real hydra, cut in half, becomes…','two hydras',['dust','a fish','nothing']]] },
    turbo:{ title:'The Junkyard Grand Prix', boss:'The Final Lap', accent:'#FFC23D', deep:'#5A1410',
      chapters:[['The Poster','Build-it-yourself racing — spell to sign up.'],
        ['Build Week','Assemble your rig — spell 7 of 10 to pass tech.'],
        ['Qualifying','Take pole by knowing your words.'],
        ['Race Day','The Final Lap looms. Spell to hold your lead.'],
        ['Photo Finish','Cross first — spell the finale for the trophy.']],
      facts:[['F1 cars grip so hard they could drive on a…','tunnel ceiling',['wall of water','cloud','rainbow']],
        ['The fastest RC car ever hit about…','360 km/h',['36 km/h','3,600 km/h','100 km/h']],
        ['Real hoverboards float on…','magnets',['air jets','wheels','springs']],
        ['Kangaroos can’t hop…','backwards',['forwards','uphill','fast']]] }
  };
  const RAR_ORDER = { free:0, rare:1, epic:2, legendary:3 };
  const CHKIND = ['survival','accuracy','origins','boss','finale'];

  function seasons(){
    return (A().packs||[]).map(p=>{ const m=META[p.id]; if(!m) return null;
      const cast=(A().list||[]).filter(a=>a.pack===p.id).slice().sort((a,b)=>(RAR_ORDER[a.rarity]-RAR_ORDER[b.rarity]));
      const legendary=cast.find(a=>a.rarity==='legendary')||cast[cast.length-1];
      return { pack:p.id, label:p.label, title:m.title, boss:m.boss, accent:m.accent, deep:m.deep,
        chapters:m.chapters.map((c,i)=>({ n:i+1, title:c[0], blurb:c[1], kind:CHKIND[i] })),
        facts:m.facts, cast, legendary }; }).filter(Boolean);
  }
  function seasonByPack(pk){ return seasons().find(s=>s.pack===pk); }

  // ---- progress ----
  function prog(){ try{ return JSON.parse(localStorage.getItem('sq_progress')||'{}'); }catch(e){ return {}; } }
  function saveProg(p){ try{ localStorage.setItem('sq_progress', JSON.stringify(p)); }catch(e){} }
  function cleared(pk){ return (prog()[pk]||{}).cleared||0; }              // chapters cleared 0..5
  function dev(){ return !!(typeof state!=='undefined' && state && state.devUnlock); }
  function seasonUnlocked(idx){ if(dev()) return true; if(idx===0) return true; const S=seasons(); return cleared(S[idx-1].pack)>=5; }
  function starsFor(pk,ch){ return ((prog()[pk]||{}).stars||{})[ch]||0; }
  function recordClear(pk,ch,stars){ const p=prog(); const e=p[pk]||(p[pk]={cleared:0,stars:{}});
    e.cleared=Math.max(e.cleared, ch); e.stars=e.stars||{}; e.stars[ch]=Math.max(e.stars[ch]||0, stars); saveProg(p); }

  // ---- words ----
  function bandWords(hard){ let pool=[]; try{ pool=(typeof gameWords==='function'?gameWords():[])||[]; }catch(e){}
    pool=pool.filter(w=>w&&w.w&&w.w.length>=3&&/^[a-z'\- ]+$/i.test(w.w));
    if(hard){ pool=pool.slice().sort((a,b)=>((b.y||3)-(a.y||3))||((a.bp||0)-(b.bp||0))); }
    return pool; }
  function pickWords(n,hard){ const p=bandWords(hard); const out=[]; const seen={};
    for(const w of (hard?p:shuf(p))){ const k=(w.w||'').toLowerCase(); if(seen[k])continue; seen[k]=1; out.push(w); if(out.length>=n)break; }
    return out; }
  function shuf(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(((state&&state._sqr!==undefined?(state._sqr=(state._sqr*9301+49297)%233280):Math.floor(Date.now()%233280))/233280)*(i+1)); const t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function esc2(s){ return (typeof esc==='function')?esc(s):String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }
  // authored story arcs from Claude Design (story-data.js) — setup log, 5 beats, cast roles
  function arcOf(S){ return (window.SB_STORY_ARCS||[]).find(a=>a.pack===S.label)||null; }
  // hand-written dialogue per chapter (packId → ch → [[castId, line], …]).
  // Packs without an entry fall back to the arc's storybook action lines.
  const DIALOG={
    hive:{
      1:[['queenhive','Bizzy — the meadow has gone silent. Every flower is shut tight, and the honey stores will not last the week.'],
         ['bizzy','Then I will wake the First Flower before the Honey Moon rises. Just show me the way, my Queen!'],
         ['queenhive','The wax map only reaches the meadow’s edge. Beyond that… you will need your words.']],
      2:[['honeypot','I packed the emergency jar — one golden drop, for when it matters most.'],
         ['drone','Leaf-glider is rigged and ready! Ten words of honey-fuel and she flies.'],
         ['bumble','I will carry the heavy stuff. And the snacks. Mostly the snacks.']],
      3:[['waggle','The wax runs out here — but my dance remembers the way. Watch my wings, not my feet!'],
         ['clover','Left at the fork. Trust me — left is lucky today.']],
      4:[['propolis','Thorns ahead! Shield up — every true word you spell makes the hexagon stronger.'],
         ['blossom','Easy now, roses. My friends only wish to pass… mind your thorns, please.']],
      5:[['bizzy','One drop left. Honey Pot… are you sure?'],
         ['honeypot','Emergencies only — and this is the one. Pour it, Bizzy.'],
         ['queenhive','The meadow wakes! Wing Guard — kneel. You have earned your crowns.']] },
    stage:{
      1:[['lumen','One bulb. That is all I have left — and one hour to curtain.'],
         ['star','Then we do the show with one bulb. The curtain rises tonight.']],
      2:[['maestro','New score! Softer, slower — music that GLOWS in the dark.'],
         ['mic','And I will carry every note to the very last row. They came to hear us — they will hear us.']],
      3:[['jester','Ladies and gentlebugs! While we wait — who wants to see me juggle the programme notes?'],
         ['popcorn','Snacks down the rows! Waiting tastes better with butter.']],
      4:[['diva','I said I would never sing again… but tonight, for this theatre? One. Last. Number.'],
         ['melody','The song is not written yet — hand me that ticket stub. It will be, by the chorus.']],
      5:[['lumen','One beam… through the mirror ball… now.'],
         ['encore','ONE MORE! ONE MORE! Everybody, sing it with me!'],
         ['goldlegend','In forty seasons I have never stood to applaud. Tonight — I stand.']] }
  };
  function say2(t){ try{ if(typeof deviceSpeak==='function') deviceSpeak(t,0.92); else if(typeof say==='function') say(t); }catch(e){} }
  function av(id,s,dark){ try{ return (typeof SB_AVATAR==='function')?SB_AVATAR(id,s,dark?{dark:true}:undefined):''; }catch(e){ return ''; } }
  function callout(cast,i){ const c=cast[i%cast.length]; return c; }

  window.SQ = {
    seasons, seasonByPack, cleared, prog,
    open(){ state.sq={ view:'map' }; state.nav='sq'; state.screen='app'; try{window.scrollTo(0,0);}catch(e){} render(); },
    exit(){ clearInterval((state.sq||{}).timer); state.sq=null; if(typeof app!=='undefined'&&app.openGames) app.openGames(); else { state.nav='games'; render(); } },
    pickSeason(pk){ const S=seasonByPack(pk); if(!S) return; const idx=seasons().findIndex(s=>s.pack===pk);
      if(!seasonUnlocked(idx)){ if(typeof flash==='function') flash('🔒 Finish the season before to unlock '+S.title); return; }
      if(cleared(pk)===0){ state.sq={ view:'brief', pack:pk }; render(); return; }   // first visit: mission briefing
      const ch=Math.min(5, cleared(pk)+1); state.sq={ view:'chapter', pack:pk, ch, beat:0 }; render(); },
    showBrief(){ const q=state.sq; state.sq={ view:'brief', pack:q.pack }; render(); },
    beginSeason(){ const q=state.sq; const ch=Math.min(5, cleared(q.pack)+1); state.sq={ view:'chapter', pack:q.pack, ch, beat:0 }; render(); },
    openChapter(pk,ch){ state.sq={ view:'chapter', pack:pk, ch:+ch, beat:0 }; render(); },
    // sequential story beats: narrator scene + character lines, from the authored arc
    _beats(S,ch){ const arc=arcOf(S); const chp=S.chapters[ch-1];
      if(arc && arc.beats && arc.beats[ch-1]){
        const bt=arc.beats[ch-1]; const out=[{narr:true, t:bt.x}];
        const dlg=(DIALOG[S.pack]||{})[ch];
        if(dlg){ dlg.forEach(d=>{ const sp=S.cast.find(a=>a.id===d[0]); if(sp) out.push({sp, t:d[1]}); }); }
        else{ (bt.c||[]).slice(0,3).forEach(id=>{ const sp=S.cast.find(a=>a.id===id); const ca=(arc.cast||[]).find(x=>x.id===id);
          if(sp&&ca) out.push({sp, t:ca.a, act:true}); }); }
        return out; }
      // fallback if the arc data is missing
      const cast=S.cast; const a=cast[ch%cast.length], b=cast[(ch+2)%cast.length];
      return [ {sp:a, t:chp.blurb}, {sp:b, t:'Ready when you are — spell it true!'} ]; },
    beatNext(){ const q=state.sq; const S=seasonByPack(q.pack); const bts=SQ._beats(S,q.ch);
      q.beat=Math.min((q.beat||0)+1, bts.length); const b=bts[q.beat-1]; if(b) say2(b.t); render(); },
    hearBeat(i){ const q=state.sq; const S=seasonByPack(q.pack); const b=SQ._beats(S,q.ch)[+i]; if(b) say2(b.t); },
    goCh(i){ const q=state.sq; i=+i; if(!dev() && i>cleared(q.pack)+1){ if(typeof flash==='function') flash('🔒 Clear the chapters before it first'); return; }
      state.sq={ view:'chapter', pack:q.pack, ch:i, beat:0 }; render(); },
    startChapter(){ const q=state.sq; const S=seasonByPack(q.pack); const chp=S.chapters[q.ch-1];
      const bts=SQ._beats(S,q.ch);
      if(!dev() && starsFor(q.pack,q.ch)===0 && (q.beat||0)<bts.length){ if(typeof flash==='function') flash('📖 Play the story first — tap Next!'); return; }
      if(chp.kind==='origins'){ SQ._startQuiz(S,q.ch); } else { SQ._startSpell(S,q.ch,chp.kind); } },
    // ---- typed spelling engine (survival / accuracy / boss / finale) ----
    _startSpell(S,ch,kind){ clearInterval((state.sq||{}).timer);
      const boss=(kind==='boss'||kind==='finale'); const finale=kind==='finale';
      const count = kind==='survival'?6 : kind==='accuracy'?10 : (finale?10:8);
      const words = pickWords(count, boss).map(w=>({w:w.w, s:w.s||'', d:w.d||''}));
      const timed = kind==='survival'||boss; const timeSec = kind==='survival'?60:(finale?110:90);
      const g={ view:'play', pack:S.pack, ch, kind, mode:(boss?'boss':'spell'), words, i:0, right:0, wrong:0,
        typed:'', status:'idle', hp:(finale?10:8), streak:0, requeued:{}, timed, timeLeft:timeSec, total:count, missed:[] };
      state.sq=g;
      if(timed){ g.timer=setInterval(()=>{ const gg=state.sq; if(!gg||gg.view!=='play')return; gg.timeLeft-=1;
        if(gg.timeLeft<=0){ clearInterval(gg.timer); SQ._finishSpell(false); } else render(); },1000); }
      render(); setTimeout(()=>say2(g.words[0]&&g.words[0].w),300);
    },
    hear(){ const g=state.sq; if(g&&g.words&&g.words[g.i]) say2(g.words[g.i].w); },
    key(ch){ const g=state.sq; if(!g||g.view!=='play')return; if(ch==='DEL'){ g.typed=g.typed.slice(0,-1); } else if(ch==='GO'){ return SQ.submit(); } else { g.typed=(g.typed+ch).slice(0,20); } render(); },
    type(v){ const g=state.sq; if(g&&g.view==='play'){ g.typed=v||''; } },
    keyEnter(e){ if(e&&e.key==='Enter'){ e.preventDefault&&e.preventDefault(); SQ.submit(); } },
    submit(){ const g=state.sq; if(!g||g.view!=='play'||g.status!=='idle')return; const w=g.words[g.i]; if(!w)return;
      const ans=(g.typed||'').trim().toLowerCase(); if(!ans){ if(typeof flash==='function')flash('Type the word'); return; }
      const ok=ans===w.w.toLowerCase();
      try{ if(typeof logBand==='function') logBand({w:w.w,y:4}, ok); }catch(e){}
      if(ok){ g.right++; g.streak++; g.status='right';
        try{ if(typeof markMastered==='function') markMastered(w.w.toLowerCase()); }catch(e){}
        try{ if(typeof sfx==='function') sfx('correct'); }catch(e){}
        if(g.mode==='boss'){ const dmg=(g.streak>=3?2:1); g.hp=Math.max(0,g.hp-dmg); }
      } else { g.wrong++; g.streak=0; g.status='wrong'; g.missed.push(w.w);
        try{ if(typeof sfx==='function') sfx('wrong'); }catch(e){}
        if(g.mode==='boss'){ g.hp=Math.min(g.finaleHpMax||(g.kind==='finale'?12:10), g.hp+1); }
        else if(g.timed){ g.timeLeft=Math.max(1,g.timeLeft-4); }
        if(g.kind==='survival' && !g.requeued[w.w.toLowerCase()]){ g.requeued[w.w.toLowerCase()]=1; g.words.push({w:w.w,s:w.s,d:w.d}); g.total++; }
      }
      render();
      setTimeout(()=>{ const gg=state.sq; if(!gg||gg.view!=='play')return; gg.status='idle'; gg.typed='';
        const done = gg.mode==='boss' ? (gg.hp<=0) : (gg.i+1>=gg.words.length);
        if(done && gg.mode==='boss' && gg.hp<=0){ clearInterval(gg.timer); return SQ._finishSpell(true); }
        if(gg.i+1>=gg.words.length){ clearInterval(gg.timer);
          if(gg.mode==='boss'){ return SQ._finishSpell(gg.hp<=0); }
          const pass = gg.kind==='accuracy' ? gg.right>=7 : gg.right>=Math.ceil(gg.total*0.6);
          const passSurv = gg.kind==='survival' ? gg.right>=6 : pass;
          return SQ._finishSpell(gg.kind==='survival'?passSurv:pass);
        }
        gg.i++; render(); setTimeout(()=>say2(gg.words[gg.i]&&gg.words[gg.i].w),200);
      }, ok?650:1250);
    },
    _finishSpell(pass){ const g=state.sq; clearInterval(g.timer);
      const stars = !pass?0 : (g.wrong===0?3 : (g.bestStreak>=3||g.streak>=3||g.right>=g.total?2:1));
      SQ._toVictory(g, pass, stars); },
    // ---- origins quiz ----
    _startQuiz(S,ch){ clearInterval((state.sq||{}).timer);
      const facts=S.facts.map(f=>({ q:f[0], a:f[1], choices:shuf([f[1]].concat(f[2])) }));
      // pad to 10 with word-origin questions from the corpus
      const wq=[]; try{ const ws=bandWords(false).filter(w=>w.o); const seen={};
        for(const w of ws){ if(wq.length>=6)break; const o=w.o; if(!o||seen[o+w.w])continue; seen[o+w.w]=1;
          const wrongs=shuf(['Latin','Greek','French','Old English','Spanish','German','Arabic'].filter(x=>x!==o)).slice(0,3);
          wq.push({ q:'Where does “'+w.w+'” come from?', a:o, choices:shuf([o].concat(wrongs)) }); }
      }catch(e){}
      const qs=facts.concat(wq).slice(0,10);
      state.sq={ view:'quiz', pack:S.pack, ch, qs, i:0, right:0, picked:null, wrong:0, missed:[] }; render();
    },
    pick(idx){ const g=state.sq; if(!g||g.view!=='quiz'||g.picked!=null)return; idx=+idx; const q=g.qs[g.i];
      g.picked=idx; const ok=q.choices[idx]===q.a; if(ok){ g.right++; try{sfx&&sfx('correct');}catch(e){} } else { g.wrong++; try{sfx&&sfx('wrong');}catch(e){} } render();
      setTimeout(()=>{ const gg=state.sq; if(!gg||gg.view!=='quiz')return; if(gg.i+1>=gg.qs.length){ const pass=gg.right>=7; SQ._toVictory(gg,pass,pass?(gg.wrong===0?3:(gg.wrong<=1?2:1)):0); return; } gg.i++; gg.picked=null; render(); }, ok?900:2100);
    },
    _toVictory(g, pass, stars){ const S=seasonByPack(g.pack); const ch=g.ch;
      if(pass){ recordClear(g.pack, ch, stars);
        try{ if(typeof addCoins==='function') addCoins(120+stars*20); }catch(e){}
        try{ if(typeof burstConfetti==='function') burstConfetti(ch>=5?160:100); if(sfx) sfx(ch>=5?'win':'level'); }catch(e){}
        // unlock featured avatar (this chapter's cast member) + legendary on finale
        const c=active(); c.avOwned=c.avOwned||{}; const feat=S.cast[Math.min(ch, S.cast.length-1)];
        let unlocked=null;
        if(feat && !c.avOwned[feat.id] && feat.rarity!=='free'){ c.avOwned[feat.id]=1; unlocked=feat; }
        if(ch>=5 && S.legendary && !c.avOwned[S.legendary.id]){ c.avOwned[S.legendary.id]=1; unlocked=S.legendary; }
        try{ if(typeof save==='function') save(); }catch(e){}
        state.sq={ view:'victory', pack:g.pack, ch, stars, right:g.right, total:g.total||(g.qs?g.qs.length:0), unlocked:unlocked?unlocked.id:null, unlockedName:unlocked?unlocked.name:null, finale:ch>=5, boss:S.boss };
      } else {
        state.sq={ view:'defeat', pack:g.pack, ch, right:g.right, total:g.total||(g.qs?g.qs.length:0), kind:g.kind, boss:S.boss };
      }
      render();
    },
    next(){ const q=state.sq; const nc=q.ch+1; if(q.ch>=5){ SQ.open(); } else { state.sq={ view:'chapter', pack:q.pack, ch:nc }; render(); } },
    retry(){ const q=state.sq; state.sq={ view:'chapter', pack:q.pack, ch:q.ch }; render(); },

    // ============ RENDER ============
    view(){ const q=state.sq||{view:'map'};
      if(q.view==='map') return SQ._map();
      if(q.view==='brief') return SQ._brief();
      if(q.view==='chapter') return SQ._chapter();
      if(q.view==='play') return SQ._play();
      if(q.view==='quiz') return SQ._quiz();
      if(q.view==='victory') return SQ._victory();
      if(q.view==='defeat') return SQ._defeat();
      return SQ._map();
    },
    _shell(inner, accent){ accent=accent||'#FFC23D';
      return `<div style="max-width:940px;margin:0 auto"><div style="position:relative;border-radius:24px;overflow:hidden;min-height:520px;background:linear-gradient(160deg,#2E2258 0%,#241A47 55%,#1C1438 100%);box-shadow:0 8px 30px rgba(26,21,35,.25)">${inner}</div></div>`; },
    _hudBtn(){ return `<button data-act="sqExit" style="width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);color:#fff;font-weight:800">✕</button>`; },
    _map(){ const S=seasons(); const c=active(); const nodes=S.map((s,i)=>{ const unl=seasonUnlocked(i); const cl=cleared(s.pack); const done=cl>=5;
        const artId=(s.cast[0]||{}).id;
        return `<button ${unl?`data-act="sqPickSeason" data-arg="${s.pack}"`:''} style="display:flex;flex-direction:column;align-items:center;gap:6px;background:none;border:0;cursor:${unl?'pointer':'default'};width:150px">
          <span style="width:88px;height:88px;border-radius:50%;display:grid;place-items:center;${unl?'border:4px solid '+s.accent+';box-shadow:0 0 20px '+s.accent+'66':'filter:grayscale(1) brightness(.55)'}">${av(artId,72,unl)}</span>
          <span style="color:${unl?'#fff':'#8A83A3'};font-weight:800;font-size:13px;text-align:center;line-height:1.15">${esc2(s.title)}</span>
          ${unl?`<span style="color:#C9BFEA;font-size:11px;font-weight:700">${done?'✓ Complete':('Chapter '+Math.min(5,cl+1)+' of 5')}</span>`
               :`<span style="color:#6A6488;font-size:11px;font-weight:700">🔒 Locked</span>`}
        </button>`; }).join('');
      const hud=`<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:12px;padding:16px 20px;z-index:2">
        <span style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:99px;padding:5px 14px 5px 6px;color:#fff;font-weight:800;font-size:13px"><span style="width:28px;height:28px;border-radius:50%;background:#EFEBF8;display:grid;place-items:center">${av(c.avatar||'bizzy',22)}</span>${esc2(c.name||'Speller')}</span>
        <span style="display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.1);border-radius:99px;padding:6px 14px;color:#FFC23D;font-weight:800;font-size:13px">🍯 ${(c.coins||0)}</span>
        <span style="flex:1"></span>${SQ._hudBtn()}</div>`;
      const inner=`${hud}
        <div style="padding:82px 26px 30px">
          <div style="font-family:var(--display);font-weight:800;font-size:24px;color:#fff;text-align:center;margin-bottom:4px">Spelling Quest</div>
          <div style="color:#C9BFEA;font-size:13px;text-align:center;margin-bottom:22px;font-weight:650">Play each pack’s story — spell your way through five chapters to a boss, and win its legendary avatar.</div>
          <div style="display:flex;flex-wrap:wrap;gap:16px 10px;justify-content:center">${nodes}</div>
        </div>`;
      return SQ._shell(inner);
    },
    // Mission briefing: what this season is about, who's coming, what's at stake
    _brief(){ const q=state.sq; const S=seasonByPack(q.pack); const arc=arcOf(S);
      const log=(arc&&arc.log)||('The heroes of '+S.label+' need a true speller.');
      const crew=S.cast.slice(0,10).map(a=>{ const ca=arc&&(arc.cast||[]).find(x=>x.id===a.id);
        return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;width:86px">
          <span style="width:62px;height:62px;background:#EFEBF8;border-radius:16px;display:grid;place-items:center">${av(a.id,50)}</span>
          <span style="color:#fff;font-weight:800;font-size:11px;line-height:1.1;text-align:center">${esc2(a.name)}</span>
          ${ca?`<span style="color:#9C93B8;font-weight:700;font-size:9.5px;text-align:center">${esc2(ca.r)}</span>`:''}</div>`; }).join('');
      const inner=`<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:16px 20px;z-index:2">
          <button data-act="sqExit" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);border-radius:99px;padding:6px 14px;color:#C9BFEA;font-weight:800;font-size:13px">← Season map</button>
          <span style="flex:1"></span>${SQ._hudBtn()}</div>
        <div style="padding:74px 30px 34px;text-align:center;max-width:640px;margin:0 auto">
          <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:${S.accent};letter-spacing:.14em">YOUR MISSION · ${esc2(S.label).toUpperCase()}</div>
          <div style="font-family:var(--display);font-weight:800;font-size:36px;color:#fff;margin:6px 0 14px">${esc2(S.title)}</div>
          <p style="color:#E9E1FF;font-size:16.5px;line-height:1.65;font-weight:650;margin:0 auto 18px;max-width:34em">${esc2(log)}</p>
          <div style="display:inline-block;background:rgba(255,194,61,.12);border:1px solid rgba(255,194,61,.35);border-radius:14px;padding:11px 18px;color:#FFE49B;font-weight:800;font-size:13px;margin-bottom:22px">
            Five chapters stand between you and ${esc2(S.boss)} — spell your way through each one to win <b>${esc2(S.legendary.name)}</b>, the legendary of this pack.</div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:24px">${crew}</div>
          <button data-act="sqBegin" style="background:${S.accent};color:#241E33;font-weight:800;font-size:16px;border-radius:99px;padding:14px 34px;box-shadow:0 5px 0 rgba(0,0,0,.25)">BEGIN CHAPTER ${Math.min(5,cleared(q.pack)+1)} →</button>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    _chapter(){ const q=state.sq; const S=seasonByPack(q.pack); const chp=S.chapters[q.ch-1];
      const arc=arcOf(S); const chTitle=(arc&&arc.beats&&arc.beats[q.ch-1]&&arc.beats[q.ch-1].t)||chp.title;
      const bts=SQ._beats(S,q.ch); const bi=Math.min(q.beat||0, bts.length);
      const storyDone = bi>=bts.length || starsFor(q.pack,q.ch)>0 || dev();
      const dots=S.chapters.map((c,i)=>{ const can=dev() || (i+1)<=cleared(q.pack)+1;
        return `<button ${can?`data-act="sqGoCh" data-arg="${i+1}" title="Chapter ${i+1}: ${escA?escA(c.title):c.title}"`:''} style="width:${i===q.ch-1?'13px':'11px'};height:${i===q.ch-1?'13px':'11px'};border-radius:50%;border:0;padding:0;cursor:${can?'pointer':'default'};background:${i<q.ch-1?S.accent:(i===q.ch-1?'#fff':'rgba(255,255,255,.25)')};${i===q.ch-1?'box-shadow:0 0 8px #fff':''}"></button>`; }).join('');
      // sequential story: beats played so far stack like a chat, newest highlighted
      const played=bts.slice(0,bi).map((b,i)=>{ const last=i===bi-1;
        if(b.narr) return `<div style="margin-bottom:14px;${last?'':'opacity:.62'};animation:${last?'sb-pop .35s ease both':'none'};background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:${last?'14px 20px':'10px 15px'};color:#E9E1FF;font-size:${last?'15.5px':'12.5px'};font-weight:650;font-style:italic;line-height:1.55;text-align:center">📖 ${esc2(b.t)} <button data-act="sqHearBeat" data-arg="${i}" style="color:#C4B4FF;font-style:normal">▶</button></div>`;
        return `<div style="display:flex;gap:14px;align-items:flex-start;margin-bottom:14px;${last?'':'opacity:.62'};animation:${last?'sb-pop .35s ease both':'none'}">
          <span style="width:${last?'86px':'62px'};height:${last?'86px':'62px'};flex-shrink:0;background:#EFEBF8;border-radius:18px;display:grid;place-items:center">${av(b.sp.id,last?72:50)}</span>
          <div style="background:#fff;border-radius:16px;padding:${last?'13px 17px':'9px 13px'};font-size:${last?'16px':'13px'};font-weight:700;color:#241E33;line-height:1.5;flex:1">
            <span style="display:block;font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#9C6A08;margin-bottom:3px">${esc2(b.sp.name)} <button data-act="sqHearBeat" data-arg="${i}" style="color:#6C4FE0">▶</button></span>${b.act?('<i style="font-weight:650">'+esc2(b.t)+'</i>'):('“'+esc2(b.t)+'”')}</div>
        </div>`; }).join('');
      const nextBtn = bi<bts.length
        ? `<button data-act="sqBeat" style="display:block;margin:6px auto 0;background:#fff;color:#241E33;font-weight:800;font-size:15px;border-radius:99px;padding:12px 34px;box-shadow:0 4px 0 rgba(0,0,0,.3)">${bi===0?'▶ Play the story':'Next ▸'}</button>
           <div style="text-align:center;color:#8A83A3;font-size:11.5px;font-weight:700;margin-top:8px">${bi}/${bts.length}</div>`
        : `<div style="text-align:center;color:${S.accent};font-weight:800;font-size:14px;margin-top:6px;animation:sb-pop .35s ease both">The story is told — take the challenge! →</div>`;
      const kindLabel={survival:'Spell Survival<br>6 words · 60s',accuracy:'Accuracy Gate<br>spell 7 of 10',origins:'Word Origins<br>7 of 10',boss:'Boss Battle<br>defeat '+esc2(S.boss),finale:'Finale Boss<br>'+esc2(S.boss)+' returns'}[chp.kind];
      const challenge=`<div style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:14px;text-align:center;${storyDone?'':'opacity:.55'}">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.12em;color:#C9BFEA;margin-bottom:6px">THE CHALLENGE</div>
          <div style="color:#FFE49B;font-weight:800;font-size:12.5px;line-height:1.45;margin-bottom:11px">${kindLabel}</div>
          <button data-act="sqStart" style="background:${storyDone?S.accent:'rgba(255,255,255,.15)'};color:${storyDone?'#241E33':'#8A83A3'};font-weight:800;font-size:13px;border-radius:99px;padding:10px 18px;${storyDone?'box-shadow:0 4px 0 rgba(0,0,0,.25)':''}">START →</button>
          ${storyDone?'':'<div style="color:#8A83A3;font-size:10.5px;font-weight:700;margin-top:7px">story first</div>'}
          ${dev()?`<button data-act="sqGoCh" data-arg="${Math.min(5,q.ch+1)}" style="display:block;margin:10px auto 0;background:none;border:0;color:#C9BFEA;font-weight:700;font-size:11px;text-decoration:underline;cursor:pointer">${q.ch>=5?'':'Skip chapter →'}</button>`:''}
        </div>`;
      const inner=`<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:10px;padding:16px 20px;z-index:2">
          <button data-act="sqBrief" title="The story so far" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:6px 14px;color:#fff;font-weight:800;font-size:13px;cursor:pointer">📖 ${esc2(S.title)}</button>
          <span style="display:flex;gap:6px;align-items:center">${dots}</span><span style="flex:1"></span>${SQ._hudBtn()}</div>
        <div style="padding:72px 26px 30px;display:flex;gap:20px;flex-wrap:wrap;justify-content:center">
          <div style="flex:1;min-width:300px;max-width:620px">
            <div style="text-align:center;margin-bottom:14px">
              <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:${S.accent};letter-spacing:.1em">CHAPTER ${String(q.ch).padStart(2,'0')} · ${bi>=bts.length?'READY':'STORY'}</div>
              <div style="font-family:var(--display);font-weight:800;font-size:29px;color:#fff;margin-top:3px">${esc2(chTitle)}</div>
            </div>
            <div style="min-height:250px">${played||`<div style="text-align:center;color:#C9BFEA;font-size:14px;font-weight:650;padding:40px 10px 10px">The heroes of ${esc2(S.label)} have a story to tell…</div>`}</div>
            ${nextBtn}
          </div>
          <div style="width:170px;flex-shrink:0;align-self:flex-start;margin-top:52px">${challenge}</div>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    _kbd(){ const rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
      return `<div style="display:flex;flex-direction:column;gap:6px;align-items:center">
        ${rows.map((r,ri)=>`<div style="display:flex;gap:6px">${ri===2?'<button data-act="sqKey" data-arg="DEL" style="width:52px;height:42px;border-radius:9px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);color:#fff;font-weight:800;font-size:11px">DEL</button>':''}${r.split('').map(ch=>`<button data-act="sqKey" data-arg="${ch}" style="width:36px;height:42px;border-radius:9px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.14);color:#fff;font-weight:800;font-size:15px">${ch}</button>`).join('')}${ri===2?'<button data-act="sqKey" data-arg="GO" style="width:60px;height:42px;border-radius:9px;background:#FFC23D;color:#241E33;font-weight:800;font-size:14px">GO</button>':''}</div>`).join('')}
      </div>`; },
    _tiles(typed, len){ const arr=[]; for(let i=0;i<Math.max(len,typed.length);i++){ const ch=typed[i]; arr.push(`<span style="width:40px;height:46px;border-radius:10px;display:grid;place-items:center;font:800 22px var(--ui);color:#241E33;${ch?'background:#FBF7EC;box-shadow:inset 0 -4px 0 #E2D8C2':'background:rgba(255,255,255,.1);box-shadow:inset 0 0 0 2px rgba(255,255,255,.2)'}">${ch?ch.toUpperCase():''}</span>`); } return `<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">${arr.join('')}</div>`; },
    _play(){ const g=state.sq; const S=seasonByPack(g.pack); const w=g.words[g.i]||{w:'',s:''}; const boss=g.mode==='boss';
      const sent=w.s? w.s.replace(new RegExp('\\b'+(w.w||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'[a-z]*\\b','ig'),'<span style="color:'+S.accent+'">______</span>') : '';
      const feat=callout(S.cast, g.i+g.right);
      const cheer = g.status==='right'?'Nice — keep going!': g.status==='wrong'?('It was “'+w.w+'”'): (boss?'Every word pushes '+S.boss+' back!':'You’ve got this!');
      const timeStr = g.timed? ('0:'+String(Math.max(0,g.timeLeft)).padStart(2,'0')) : '';
      const hpbar = boss? `<span style="display:flex;gap:4px">${Array.from({length:g.kind==='finale'?10:8},(_,i)=>`<span style="width:22px;height:11px;border-radius:6px;background:${i<g.hp?'#E0483C':'rgba(255,255,255,.15)'}"></span>`).join('')}</span>` : '';
      const cells = g.kind==='survival'? `<span style="display:flex;gap:5px">${Array.from({length:6},(_,i)=>`<span style="width:20px;height:22px;background:${i<g.right?'#FFC23D':'rgba(255,255,255,.15)'};clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)"></span>`).join('')}</span>`:'';
      const hud=`<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:12px;padding:16px 20px;z-index:3">
        ${g.timed?`<span style="display:inline-flex;align-items:center;gap:7px;background:rgba(255,255,255,.1);border-radius:99px;padding:6px 14px;color:#fff;font-weight:800;font-size:15px">⏱ ${timeStr}</span>`:''}
        ${boss?`<span style="color:#FF8AA8;font-weight:800;font-size:13px;letter-spacing:.06em">${esc2(S.boss).toUpperCase()}</span>${hpbar}`:`<span style="color:#C9BFEA;font-weight:800;font-size:12px">WORD ${Math.min(g.i+1,g.words.length)} OF ${g.words.length}</span>${cells}`}
        ${boss&&g.streak>=3?`<span style="color:#FFC23D;font-weight:800;font-size:13px;background:rgba(255,194,61,.12);border:1px solid rgba(255,194,61,.4);border-radius:99px;padding:4px 11px">STREAK ×${g.streak}</span>`:''}
        <span style="flex:1"></span>${SQ._hudBtn()}</div>`;
      const inner=`${hud}
        <div style="padding:78px 22px 24px;text-align:center">
          <button data-act="sqHear" style="display:inline-flex;align-items:center;gap:9px;background:#6C4FE0;color:#fff;font-weight:800;font-size:15px;border-radius:99px;padding:11px 24px;box-shadow:0 5px 0 #4A32B0">${(typeof iconSVG==='function'?iconSVG('volume',18):'🔊')} HEAR THE WORD</button>
          ${sent?`<div style="color:#C9BFEA;font-size:14.5px;font-weight:650;margin-top:14px;max-width:520px;margin-left:auto;margin-right:auto">“${sent}”</div>`:`<div style="color:#8A83A3;font-size:13px;margin-top:12px">Spell what you hear</div>`}
          <div style="margin:20px 0 8px">${SQ._tiles(g.typed, Math.max((w.w||'').length,4))}</div>
          <input data-inp="sqType" data-key="sqKeyEnter" data-fkey="sqType" value="${escA?escA(g.typed):g.typed}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="type or tap…" style="width:100%;max-width:300px;padding:11px;border-radius:12px;background:rgba(255,255,255,.1);border:2px solid rgba(255,255,255,.18);color:#fff;font-family:var(--entry);font-weight:700;font-size:17px;text-align:center;letter-spacing:.1em;outline:none;margin-bottom:12px">
          <div style="margin-bottom:14px">${SQ._kbd()}</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:10px">
            <span style="width:52px;height:52px;background:#EFEBF8;border-radius:12px;display:grid;place-items:center;flex-shrink:0">${av(feat.id,44)}</span>
            <span style="background:#fff;border-radius:12px;padding:8px 13px;font-size:13px;font-weight:700;color:#241E33"><b style="color:#9C6A08;font-size:10px;letter-spacing:.05em;text-transform:uppercase">${esc2(feat.name)}</b><br>${esc2(cheer)}</span>
          </div>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    _quiz(){ const g=state.sq; const S=seasonByPack(g.pack); const q=g.qs[g.i];
      const opts=q.choices.map((ch,idx)=>{ let bd='2px solid #EEEAF3',bg='#fff',col='#46405A';
        if(g.picked!=null){ if(ch===q.a){ bd='2px solid #1FA377';bg='#EAF7F0';col='#0F5C3E'; } else if(idx===g.picked){ bd='2px solid #E0483C';bg='#FBEAE8';col='#8A2A20'; } }
        else if(idx===0){}
        return `<button ${g.picked==null?`data-act="sqPick" data-arg="${idx}"`:''} style="text-align:left;border:${bd};background:${bg};border-radius:12px;padding:12px 16px;font-weight:${ch===q.a&&g.picked!=null?800:700};color:${col};font-size:14.5px">${esc2(ch)}</button>`; }).join('');
      const inner=`<div style="position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:12px;padding:16px 20px">
          <span style="background:rgba(255,255,255,.1);border-radius:99px;padding:6px 14px;color:#fff;font-weight:800;font-size:13px">ORIGINS · ${g.right}/${g.qs.length}</span>
          <span style="color:#8A83A3;font-weight:800;font-size:12px">PASS AT 7</span><span style="flex:1"></span>${SQ._hudBtn()}</div>
        <div style="padding:80px 24px 30px;display:flex;justify-content:center">
          <div style="background:#fff;border-radius:20px;padding:24px 28px;width:100%;max-width:520px;box-shadow:0 10px 30px rgba(0,0,0,.25)">
            <div style="font-family:var(--mono);font-size:11px;font-weight:700;color:#9C6A08;letter-spacing:.1em;margin-bottom:8px">QUESTION ${g.i+1}</div>
            <div style="font-family:var(--display);font-weight:800;font-size:21px;line-height:1.35;margin-bottom:18px">${esc2(q.q)}</div>
            <div style="display:grid;gap:9px">${opts}</div>
            ${g.picked!=null&&q.choices[g.picked]!==q.a?`<div style="margin-top:12px;font-size:13px;color:#8A2A20;font-weight:650">The answer is “${esc2(q.a)}”.</div>`:''}
          </div>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    _victory(){ const q=state.sq; const S=seasonByPack(q.pack); const chp=S.chapters[q.ch-1];
      const arc=arcOf(S); const bt=arc&&arc.beats&&arc.beats[q.ch-1];
      const fc=bt&&(arc.cast||[]).find(x=>x.id===(bt.c||[])[0]);
      const factCard=fc?`<div style="max-width:420px;margin:16px auto 0;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:14px;padding:11px 16px;display:flex;gap:11px;align-items:center;text-align:left">
          <span style="width:44px;height:44px;flex-shrink:0;background:#EFEBF8;border-radius:12px;display:grid;place-items:center">${av(fc.id,36)}</span>
          <span style="color:#E9E1FF;font-size:12.5px;font-weight:650;line-height:1.5"><b style="color:#FFD98A;font-size:10px;letter-spacing:.1em">💡 BUZZ FACT</b><br>${esc2(fc.f)}</span></div>`:'';
      const stars=Array.from({length:3},(_,i)=>`<span style="font-size:${i===1?40:32}px;color:${i<q.stars?'#FFC23D':'rgba(255,255,255,.2)'};${i===1?'margin-top:-6px':''}">★</span>`).join('');
      const nextLabel = q.ch>=5? 'BACK TO SEASON MAP' : ('NEXT · CHAPTER '+(q.ch+1)+': '+esc2(S.chapters[q.ch].title));
      const unlockCard = q.unlocked? `<div style="background:linear-gradient(160deg,#3A2F5C,#2B2148);border:1px solid rgba(255,255,255,.18);border-radius:20px;padding:18px 26px;text-align:center;box-shadow:0 0 40px rgba(233,225,255,.15);margin:18px auto 0;max-width:280px">
          <div style="width:110px;height:110px;margin:0 auto">${av(q.unlocked,110,true)}</div>
          <div style="font-size:10.5px;font-weight:800;letter-spacing:.06em;color:#6C4FE0;background:#E9E1FF;border-radius:99px;padding:3px 10px;display:inline-block;margin:10px 0 5px">${q.finale?'LEGENDARY':'AVATAR'} UNLOCKED</div>
          <div style="color:#fff;font-weight:800;font-size:16px">${esc2(q.unlockedName)}</div>
        </div>` : '';
      const inner=`<div style="padding:44px 26px 30px;text-align:center">
          <div style="display:flex;gap:8px;justify-content:center;align-items:center">${stars}</div>
          <div style="font-family:var(--display);font-weight:800;font-size:32px;color:#fff;margin-top:6px">${q.finale?'Season Complete!':(esc2(chp.title)+' cleared!')}</div>
          <div style="color:#C9BFEA;font-weight:700;font-size:14px;margin-top:4px">${q.right}/${q.total||q.right} · <span style="color:#FFC23D">+${120+q.stars*20} 🍯</span></div>
          ${unlockCard}
          ${factCard}
          <div style="margin-top:22px">
            <button data-act="sqNext" style="background:#FFC23D;color:#241E33;font-weight:800;font-size:15px;border-radius:99px;padding:13px 26px;box-shadow:0 5px 0 #C8891B">${nextLabel}</button>
            <button data-act="sqRetry" style="margin-left:8px;background:rgba(255,255,255,.1);color:#C9BFEA;border:1px solid rgba(255,255,255,.2);font-weight:800;font-size:13px;border-radius:99px;padding:11px 18px">Replay</button>
          </div>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    _defeat(){ const q=state.sq; const S=seasonByPack(q.pack);
      const inner=`<div style="padding:70px 26px 30px;text-align:center">
          <div style="font-size:46px">😅</div>
          <div style="font-family:var(--display);font-weight:800;font-size:28px;color:#fff;margin-top:6px">${esc2(S.boss)} held the line</div>
          <div style="color:#C9BFEA;font-weight:700;font-size:14px;margin-top:6px">You spelled ${q.right}/${q.total||'?'}. ${q.kind==='origins'?'Need 7 of 10.':q.kind==='accuracy'?'Need 7 of 10.':'Try again — you’re close!'}</div>
          <div style="margin-top:24px">
            <button data-act="sqRetry" style="background:#FFC23D;color:#241E33;font-weight:800;font-size:15px;border-radius:99px;padding:13px 28px;box-shadow:0 5px 0 #C8891B">TRY AGAIN</button>
            <button data-act="sqExit" style="margin-left:8px;background:rgba(255,255,255,.1);color:#C9BFEA;border:1px solid rgba(255,255,255,.2);font-weight:800;font-size:13px;border-radius:99px;padding:11px 18px">Leave</button>
          </div>
        </div>`;
      return SQ._shell(inner, S.accent);
    },
    hearLine(i){ const q=state.sq; const S=seasonByPack(q.pack); const chp=S.chapters[q.ch-1];
      const lines=[chp.blurb,'Ready when you are — spell it true!']; say2(lines[+i]||chp.blurb); }
  };
})();

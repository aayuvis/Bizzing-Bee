/* readers-data.js — Bizzing Readers: phonics & early-reading data (ages 5-7).

   Designed around assets the app already has:
   • every example/CVC/sight word here is a COMMON word, so the existing Google-TTS
     clip library (voice/w/<slug>.mp3) usually has real audio for it;
   • emoji stand in as picture cues, so pre-readers can answer without reading;
   • letter work uses INITIAL-SOUND identification ("which letter does 'monkey'
     start with?") rather than asking TTS to voice a bare phoneme, which it can't
     do reliably (it would say the letter NAME "em", not the sound /m/).

   Shapes:
     letters[]  {l, snd, ex[], emo}        - letter, its sound, example words, emoji
     digraphs[] {l, snd, ex[], emo}        - two letters, one sound
     families[] {f, on, words[], emo{}}    - rime family (-at), words that rhyme
     cvc[]      {w, p[], emo}              - decodable word, split into phonemes, picture
     sight[]    {lvl, words[]}             - high-frequency words by stage
*/
window.SB_READERS = {
  letters: [
    {l:'a',snd:'/a/',ex:['apple','ant','alligator'],emo:'🍎'},
    {l:'b',snd:'/b/',ex:['ball','bear','bus'],emo:'⚽'},
    {l:'c',snd:'/k/',ex:['cat','cake','cup'],emo:'🐱'},
    {l:'d',snd:'/d/',ex:['dog','duck','door'],emo:'🐶'},
    {l:'e',snd:'/e/',ex:['egg','elephant','elbow'],emo:'🥚'},
    {l:'f',snd:'/f/',ex:['fish','fan','fox'],emo:'🐟'},
    {l:'g',snd:'/g/',ex:['goat','gate','girl'],emo:'🐐'},
    {l:'h',snd:'/h/',ex:['hat','horse','house'],emo:'🎩'},
    {l:'i',snd:'/i/',ex:['igloo','insect','ink'],emo:'🛖'},
    {l:'j',snd:'/j/',ex:['jam','jug','jacket'],emo:'🍓'},
    {l:'k',snd:'/k/',ex:['kite','key','king'],emo:'🪁'},
    {l:'l',snd:'/l/',ex:['leaf','lion','lamp'],emo:'🍃'},
    {l:'m',snd:'/m/',ex:['monkey','moon','milk'],emo:'🐒'},
    {l:'n',snd:'/n/',ex:['nest','nose','net'],emo:'🪺'},
    {l:'o',snd:'/o/',ex:['octopus','ostrich','olive'],emo:'🐙'},
    {l:'p',snd:'/p/',ex:['pig','pen','pizza'],emo:'🐷'},
    {l:'q',snd:'/kw/',ex:['queen','quilt','question'],emo:'👑'},
    {l:'r',snd:'/r/',ex:['rabbit','rain','ring'],emo:'🐰'},
    {l:'s',snd:'/s/',ex:['sun','snake','sock'],emo:'☀️'},
    {l:'t',snd:'/t/',ex:['tiger','tree','table'],emo:'🐯'},
    {l:'u',snd:'/u/',ex:['umbrella','under','up'],emo:'☂️'},
    {l:'v',snd:'/v/',ex:['van','violin','vest'],emo:'🚐'},
    {l:'w',snd:'/w/',ex:['water','window','wolf'],emo:'💧'},
    {l:'x',snd:'/ks/',ex:['box','fox','six'],emo:'📦'},
    {l:'y',snd:'/y/',ex:['yellow','yo-yo','yarn'],emo:'💛'},
    {l:'z',snd:'/z/',ex:['zebra','zoo','zip'],emo:'🦓'}
  ],
  digraphs: [
    {l:'sh',snd:'/sh/',ex:['ship','shell','shoe'],emo:'🚢'},
    {l:'ch',snd:'/ch/',ex:['chair','cheese','chick'],emo:'🪑'},
    {l:'th',snd:'/th/',ex:['thumb','three','thorn'],emo:'👍'},
    {l:'wh',snd:'/wh/',ex:['whale','wheel','whisper'],emo:'🐋'},
    {l:'ck',snd:'/k/',ex:['duck','sock','clock'],emo:'🦆'},
    {l:'ng',snd:'/ng/',ex:['ring','king','song'],emo:'💍'},
    {l:'oo',snd:'/oo/',ex:['moon','book','food'],emo:'🌙'}
  ],
  families: [
    {f:'-at',on:'at',words:['cat','bat','hat','mat','rat','sat'],emo:{cat:'🐱',bat:'🦇',hat:'🎩',mat:'🧘',rat:'🐀',sat:'🪑'}},
    {f:'-an',on:'an',words:['can','fan','man','pan','ran','van'],emo:{can:'🥫',fan:'🌀',man:'🧑',pan:'🍳',ran:'🏃',van:'🚐'}},
    {f:'-ap',on:'ap',words:['cap','map','nap','tap','lap','gap'],emo:{cap:'🧢',map:'🗺️',nap:'😴',tap:'🚰',lap:'🦵',gap:'↔️'}},
    {f:'-ig',on:'ig',words:['pig','big','dig','fig','wig','jig'],emo:{pig:'🐷',big:'🐘',dig:'⛏️',fig:'🫐',wig:'💇',jig:'💃'}},
    {f:'-in',on:'in',words:['pin','win','bin','fin','tin','chin'],emo:{pin:'📌',win:'🏆',bin:'🗑️',fin:'🐬',tin:'🥫',chin:'😀'}},
    {f:'-ip',on:'ip',words:['lip','dip','rip','tip','zip','ship'],emo:{lip:'👄',dip:'🥣',rip:'📄',tip:'☝️',zip:'🤐',ship:'🚢'}},
    {f:'-og',on:'og',words:['dog','log','fog','jog','hog','frog'],emo:{dog:'🐶',log:'🪵',fog:'🌫️',jog:'🏃',hog:'🐗',frog:'🐸'}},
    {f:'-op',on:'op',words:['top','hop','mop','pop','stop','shop'],emo:{top:'🔝',hop:'🐰',mop:'🧹',pop:'🎈',stop:'🛑',shop:'🏪'}},
    {f:'-ot',on:'ot',words:['pot','hot','dot','cot','not','spot'],emo:{pot:'🍲',hot:'🔥',dot:'⚫',cot:'🛏️',not:'🚫',spot:'🐆'}},
    {f:'-ug',on:'ug',words:['bug','hug','rug','mug','jug','plug'],emo:{bug:'🐛',hug:'🤗',rug:'🧶',mug:'☕',jug:'🏺',plug:'🔌'}},
    {f:'-un',on:'un',words:['sun','run','fun','bun','gun','spun'],emo:{sun:'☀️',run:'🏃',fun:'🎉',bun:'🍞',gun:'💦',spun:'🌀'}},
    {f:'-ed',on:'ed',words:['bed','red','fed','led','wed','sled'],emo:{bed:'🛏️',red:'🔴',fed:'🍽️',led:'💡',wed:'💍',sled:'🛷'}},
    {f:'-en',on:'en',words:['hen','pen','ten','den','men','then'],emo:{hen:'🐔',pen:'🖊️',ten:'🔟',den:'🏕️',men:'👬',then:'➡️'}},
    {f:'-ell',on:'ell',words:['bell','well','shell','smell','tell','sell'],emo:{bell:'🔔',well:'🪣',shell:'🐚',smell:'👃',tell:'🗣️',sell:'💰'}},
    {f:'-ake',on:'ake',words:['cake','lake','snake','bake','rake','wake'],emo:{cake:'🎂',lake:'🏞️',snake:'🐍',bake:'🧁',rake:'🍂',wake:'⏰'}}
  ],
  // CVC words split into phonemes for blending practice (c-a-t → cat)
  cvc: [
    {w:'cat',p:['c','a','t'],emo:'🐱'},   {w:'dog',p:['d','o','g'],emo:'🐶'},
    {w:'sun',p:['s','u','n'],emo:'☀️'},   {w:'pig',p:['p','i','g'],emo:'🐷'},
    {w:'bed',p:['b','e','d'],emo:'🛏️'},   {w:'hat',p:['h','a','t'],emo:'🎩'},
    {w:'bus',p:['b','u','s'],emo:'🚌'},   {w:'fox',p:['f','o','x'],emo:'🦊'},
    {w:'net',p:['n','e','t'],emo:'🥅'},   {w:'cup',p:['c','u','p'],emo:'☕'},
    {w:'map',p:['m','a','p'],emo:'🗺️'},   {w:'jam',p:['j','a','m'],emo:'🍓'},
    {w:'log',p:['l','o','g'],emo:'🪵'},   {w:'pen',p:['p','e','n'],emo:'🖊️'},
    {w:'bug',p:['b','u','g'],emo:'🐛'},   {w:'hen',p:['h','e','n'],emo:'🐔'},
    {w:'top',p:['t','o','p'],emo:'🔝'},   {w:'web',p:['w','e','b'],emo:'🕸️'},
    {w:'ten',p:['t','e','n'],emo:'🔟'},   {w:'van',p:['v','a','n'],emo:'🚐'},
    {w:'kid',p:['k','i','d'],emo:'🧒'},   {w:'mug',p:['m','u','g'],emo:'☕'},
    {w:'rug',p:['r','u','g'],emo:'🧶'},   {w:'zip',p:['z','i','p'],emo:'🤐'},
    {w:'lip',p:['l','i','p'],emo:'👄'},   {w:'nut',p:['n','u','t'],emo:'🥜'},
    {w:'pot',p:['p','o','t'],emo:'🍲'},   {w:'bat',p:['b','a','t'],emo:'🦇'},
    {w:'ship',p:['sh','i','p'],emo:'🚢'}, {w:'fish',p:['f','i','sh'],emo:'🐟'},
    {w:'duck',p:['d','u','ck'],emo:'🦆'}, {w:'ring',p:['r','i','ng'],emo:'💍'},
    {w:'moon',p:['m','oo','n'],emo:'🌙'}, {w:'chick',p:['ch','i','ck'],emo:'🐤'}
  ],
  // High-frequency sight words — words you learn by SIGHT because they don't sound out.
  sight: [
    {lvl:1,label:'First words',words:['a','I','the','to','and','go','is','it','in','me','my','we','see','you','can','like','look','at','up','on']},
    {lvl:2,label:'Growing',words:['he','she','was','are','for','have','they','this','with','that','said','all','but','out','be','do','has','him','her','one']},
    {lvl:2,label:'Everyday',words:['come','some','from','were','what','when','who','how','now','then','them','there','their','would','could','your','over','down','after','little']},
    {lvl:3,label:'Reader',words:['about','because','before','around','another','always','every','first','found','great','never','other','people','right','should','something','thought','through','together','where']}
  ]
};

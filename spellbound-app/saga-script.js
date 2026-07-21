/* Bizzing Bee — SAGA SCRIPT · "Bizzy and the Great Unspelling"
   Act I complete; Acts II–VI ship with their stages.
   Line format: [speakerId, "line", "audioKey"] — audioKey maps to voice/d/<key>.mp3.
   Speakers map to the saga cast (see CLAUDE-DESIGN-BRIEF-SAGA.md §8 casting). */
window.SB_SAGA_SCRIPT = {
  ch1: { title:'Escape from the Meadow of Challenges', world:'meadow',
    intro:[
      ['narrator','The Meadow of Challenges woke up wrong that morning. The flowers had forgotten their names.','c1-n1'],
      ['bizzy','Rose? Daisy? Why won’t you answer? Your name-tags are... blank?','c1-b1'],
      ['smudge','Namesss... sweet namesss... he will eat them all, little bee.','c1-s1'],
      ['bizzy','Not today, moths. I know these flowers. And if they can’t remember their names — I’ll spell them back myself!','c1-b2']],
    win:[
      ['bizzy','The flowers! The color’s coming back where I spelled! Words... words fix it!','c1-b3'],
      ['narrator','And that is how Bizzy discovered the oldest magic there is. She ran for the Hive without looking back.','c1-n2']],
    lose:[['bizzy','Too many moths! Okay. Breathe. Spell. Again.','c1-b4']] },
  ch2: { title:'The Long Sky', world:'sky',
    intro:[
      ['narrator','The meadow was lost. Behind her, a cloud of grey moths shaped itself into a face.','c2-n1'],
      ['bumble','HELP! My wings forgot the word for FLAP!','c2-bu1'],
      ['bizzy','Grab on! F-L-A-P — there! Now beat them like you mean it!','c2-b1'],
      ['bumble','You SPELLED my wings back?! Who ARE you?','c2-bu2'],
      ['bizzy','Bizzy. Land on those honey pots with me — we’ll refuel and outfly this thing.','c2-b2']],
    win:[
      ['bumble','Ten pots! And look — the Smudge turned back! Bizzy, whatever you’re doing... I’m with you. To the end.','c2-bu3'],
      ['narrator','And so the crew began: one bee who could spell, and one who would never let go.','c2-n2']],
    lose:[['bumble','Down but not out! One more run — the pots are still there!','c2-bu4']] },
  ch3: { title:'The Elders’ Test: Bee Grand Prix', world:'hive',
    intro:[
      ['queen','A child claims the meadow fell to a word-eater. The Hive does not march on a child’s say-so.','c3-q1'],
      ['waggle','No offense, kid. But if you want the Hive’s wings, you outfly its three fastest. Them’s the rules.','c3-w1'],
      ['drone','Three laps. No stingers. First bee home takes it. Try to keep up, meadow-kid.','c3-d1'],
      ['bizzy','Then watch close. Because I don’t fly on wings alone — I fly on words.','c3-b1']],
    win:[
      ['waggle','She BOOSTED past me spelling THOROUGH. Mid-air. I’ve never even spelled thorough on the GROUND.','c3-w2'],
      ['drone','I don’t follow kids. I follow champions. Point the way, champion.','c3-d2']],
    lose:[['waggle','Close one! Rematch — and this time bank your boosts early!','c3-w3']] },
  ch4: { title:'The Queen’s Riddle', world:'hive',
    intro:[
      ['queen','Fast wings are common, little one. Show me a deep mind. Here is my riddle: one long word holds a hundred short ones. Prove it.','c4-q1'],
      ['bizzy','THUNDERSTORM... okay. There’s STORM. There’s THUNDER. There’s... oh, there’s SO many more. Watch me, Your Majesty.','c4-b1']],
    win:[
      ['queen','Twenty words drawn from one. You see what most never look for. The Hive is yours, Bizzy of the Meadow — and so is my warning: the one you chase was once one of us.','c4-q2'],
      ['bizzy','...He was a BEE?','c4-b2']],
    lose:[['queen','Eighteen. So close. Look again, child — the small words hide inside the big one like bees in a hive.','c4-q3']] },
  ch5: { title:'Whack-the-Moths', world:'hive',
    intro:[
      ['bumble','Bizzy! The nursery! The Smudge’s moths are in the NURSERY!','c5-bu1'],
      ['bizzy','They’re after the babies’ first words. Grab a soft mallet — bop them in SPELLING ORDER or they just come back!','c5-b1']],
    win:[
      ['bumble','Last moth — BOPPED. The little ones are safe.','c5-bu2'],
      ['narrator','But in the dark above the nursery, the moths regathered into a face. And the face smiled.','c5-n1']],
    lose:[['bizzy','They’re quick! Eyes on the word — whack the letters in order!','c5-b2']] },
  ch6: { title:'BOSS: The Smudge', world:'hive',
    intro:[
      ['smudge','LITTLE BEE. Give usss the wordsss. The Massster is hungry, and you are ssso small.','c6-s1'],
      ['bizzy','Small? I’m exactly the size of every word I know. SHIELDS UP — spell with me!','c6-b1']],
    mid:[['smudge','He knowsss your name, little bee. He is already sssaying it backwardsss...','c6-s2']],
    win:[
      ['sting','Hold! ...I’m Sting. Wasp Corps, formerly his. I watched you fight for words that weren’t even yours. That’s a side worth defecting to.','c6-st1'],
      ['bizzy','Then welcome to the crew, Sting. First rule: nobody fights alone.','c6-b2'],
      ['narrator','One world saved. Fourteen greying. Somewhere far away, a hornet in gold pinstripes opened a ledger and crossed out the word MEADOW.','c6-n1']],
    lose:[['bizzy','The shield broke... but shields can be rebuilt. Letter by letter. Again!','c6-b3']] }
};

/* ============================================================
   VOICE-REVIEW.js — the human-in-the-loop voice QA queue.
   Powers Settings → "Word Voice Tester".

   • SB_VOICE_PRIORITY : words to test first, highest-value first
     (common + tricky-to-pronounce + previously-flagged). The tester
     appends the child's own study words after these.
   • SB_VOICE_REVIEW   : words Claude has just REBUILT and that need a
     fresh listen. They surface in the tester's "Re-review" tab.
     Claude edits this array (and regenerates voice/w/<word>.mp3) each
     time it processes a batch of flags exported from the app.

   Round-trip: tester exports flagged words (voice-flags.json) → Claude
   rebuilds the clips + moves those words into SB_VOICE_REVIEW → the app
   shows them under Re-review for the parent to confirm.
   ============================================================ */
(function () {
  // Bumped every voice rebuild round — voice-cdn.js appends this to clip URLs so
  // browsers and the raw CDN can never serve a stale clip after a deploy.
  window.SB_VOICE_VER = 'r5-20260723';
  // Words Claude has processed since the last round — re-listen to confirm.
  // (Claude appends {w, note} entries here as it processes flag batches.)
  // Batch 3 (2026-07-22, overnight): FULL Kokoro rebuild — the model is now hosted on
  // this repo's "kokoro-model-v1" release, so everything queued was re-synthesized in
  // the library voice (af_heart) and WV_BAD is empty again:
  //   • the 33 flagged words — rebuilt fresh. The 14 short ones whose re-synth came out
  //     byte-identical to the bad clip (Kokoro is deterministic) were re-run with a
  //     changed input ("word" without the trailing dot) and verified to differ.
  //   • ~840 scan-detected truncated/garbled clips (e.g. "hotel" was 0.09s) — rebuilt;
  //     every clip re-verified acoustically (speech span sane, no stray segments).
  //   • the 451-word legacy 0.92× short-word batch (cat, dog, sun…) — re-synthesized at
  //     current params so the whole library is one consistent voice and speed.
  // Batch 5 (2026-07-22, round 4): the 15 words that kept their artifact through three
  // different af_heart inputs were rebuilt with VOICE-VECTOR BLENDS — Kokoro style
  // interpolation, 70% af_heart + 30% of a sibling voice (bella/sarah/nova), chosen per
  // word by automatic scoring against never-flagged rhyme siblings. They may sound very
  // slightly different in timbre from the rest of the library; that is the trade for
  // killing the artifact. The 12 newly flagged garbled words (enchantment "click click",
  // moisture "ture"…) were re-synthesized normally, plus a library-wide garble scan
  // rebuilt 97 more (mostly French-origin — see the new 🇫🇷 French tab to audit that
  // whole cohort).
  // Batch 6 (2026-07-23, round 5 — the decisive round under the owner's policy):
  //   • 13 words exhausted the whole rebuild ladder (variants, IPA, carrier, voice
  //     blends) and STILL sounded wrong — they now play in the device voice, permanently
  //     until a better model exists (voice/rebuild-queue.json keeps the list). A quick
  //     listen should confirm each now says the RIGHT word, just in the device voice.
  //   • 7 words got their one escalated IPA rebuild — fresh listen; if any is still
  //     wrong, flag it and it goes to the device voice too.
  window.SB_VOICE_REVIEW = (window.SB_VOICE_REVIEW || []).concat(
    ["peach","dub","tub","spa","paw","pub","rub","olive","vegetable","umbrella",
     "brave","proof","emperor"]
    .map(function(w){ return {w:w, note:"now in the device voice (rebuild ladder exhausted)"}; }),
    ["furtive","verve","loyal","enchantment","companion","pilferer","pedigree"]
    .map(function(w){ return {w:w, note:"round-5 IPA rebuild — flag again = device voice"}; })
  );

  // Highest-priority QA queue. Short/plosive-initial/final-vowel words are the
  // most prone to truncation, so they lead; then common tricky pronunciations.
  window.SB_VOICE_PRIORITY = (
    // recently reported as wrong — verify first
    "soda stubble cricket january olive robin feats peach pole " +
    // short words (truncation-prone)
    "pole ole ace age ago aid aim air ale ant ape arc ark arm art ash ask " +
    "bad bag ban bat bay bed bee beg bet bid big bin bit boa bog bow box boy bud bug bun bus but buy " +
    "cab cap car cat cob cod cog cop cot cow cry cub cup cut dad dam day den dew did dig dim din dip " +
    "doe dog dot dry dub dug dye ear eat eel egg elf elk elm end eve ewe eye fan far fat fax fed fee " +
    "few fig fin fir fit fix flu fly foe fog for fox fry fun fur gap gas gem get gig gum gun gut guy " +
    "ham hat hay hen hid him hip hit hoe hog hop hot how hub hue hug hum hut ice icy ill ink inn ivy " +
    "jab jam jar jaw jay jet jig job jog jot joy jug keg key kid kin kit lab lad lap law lay led leg " +
    "let lid lip lit log lot low mad man map mat may mob mod mom mop mud mug nap net new nib nil nip " +
    "nod nor not now nun nut oak oar oat odd off oil old one orb our out owl own pad pal pan pat paw " +
    "pea peg pen pet pie pig pin pit pod pot pox pry pub pug pun pup rag ram ran rap rat raw ray red " +
    "rib rid rig rim rip rob rod rot row rub rug rum run rye sad sag sap sat saw say sea see set sew " +
    "she shy sip sir sit six ski sky sly sob sod son sow soy spa spy sty sub sue sum sun tab tag tan " +
    "tap tar tax tea ten the thy tie tin tip toe ton too top tow toy try tub tug two use van vat vet " +
    "vex via vie vow wad wag war was wax way web wed wet who why wig win wit woe wok won wow yak yam " +
    "yap yaw yes yet you zap zip zoo " +
    // common tricky-pronunciation words
    "answer autumn beauty biscuit business castle colonel comfortable debt dessert " +
    "doubt eight enough favourite february flavour foreign gauge ghost giraffe guard " +
    "height honest island jewel knead knee knife knock know knuckle lamb listen " +
    "muscle nephew ocean often onion parliament pizza plumber pneumonia queue " +
    "receipt rhyme rhythm salmon scent science scissors sign special stomach subtle " +
    "sword thorough thumb tomb tongue tortoise vegetable weird wednesday wrist wrong yacht " +
    "bicycle calendar caterpillar chocolate cinnamon crocodile dinosaur elephant " +
    "envelope hospital library necessary October opposite restaurant sandwich " +
    "square strawberry telephone temperature umbrella universe volcano watermelon"
  ).split(/\s+/).filter(function (w, i, a) { return w && a.indexOf(w) === i; });
})();

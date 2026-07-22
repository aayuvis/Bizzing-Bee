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
  // Words Claude has processed since the last round — re-listen to confirm.
  // (Claude appends {w, note} entries here as it processes flag batches.)
  // Batch 2 (2026-07-22, overnight): processed the 33-word flag export WITHOUT the Kokoro
  // model (not fetchable in the sandbox — see voice/rebuild-queue.json for the full
  // rebuild list):
  //   • cog + tomb — quiet trailing junk ("cog e", "tomb e") surgically trimmed off the
  //     existing clips; the Kokoro audio is intact. LISTEN to confirm.
  //   • the other 31 — clip defects are baked into the audio (attached echoes, missing
  //     phonemes, truncation), so they now play in the device voice (WV_BAD) until the
  //     next Kokoro rebuild round. A quick listen should confirm they at least say the
  //     RIGHT word now.
  //   • a full acoustic scan of all 41,136 clips also found ~840 truncated/garbled clips
  //     (e.g. "hotel" was 0.09s long) — those are device-voiced + queued for rebuild too.
  window.SB_VOICE_REVIEW = (window.SB_VOICE_REVIEW || []).concat(
    [{w:"cog", note:"tail-trimmed — junk ' e' removed, confirm it sounds clean"},
     {w:"tomb", note:"tail-trimmed — junk ' e' removed, confirm it sounds clean"}],
    ["peach","pole","dub","eve","onion","won","who","tub","tip","spa","six","sip","saw",
     "paw","pub","rub","olive","vegetable","yacht","umbrella","glue","grand","blank",
     "brave","hotel","proof","raisin","forage","cuckoo","lionize","emperor"]
    .map(function(w){ return {w:w, note:"device voice until Kokoro rebuild (clip was defective)"}; })
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

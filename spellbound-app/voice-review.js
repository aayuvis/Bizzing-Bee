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
/* ROAD TO 4.5, P1.13 (10 Oct 2026): this file is now ONLY the clip version, because it is the one line the first
   screen needs — voice-cdn.js stamps every word clip with it, and a clip asked for before it existed would take a
   different URL (and miss the cache the service worker keeps under the real one). The two word lists (~16 KB gz,
   read by nothing but the Word Voice Tester) moved to voice-review-lists.js, which boot-lazy fetches at the
   tester's door (group `voicetest`). Bump SB_VOICE_VER HERE; add rebuilt words to SB_VOICE_REVIEW THERE. */
(function () {
  // Bumped every voice rebuild round — voice-cdn.js appends this to clip URLs so
  // browsers and the raw CDN can never serve a stale clip after a deploy.
  window.SB_VOICE_VER = 'g4-20260905';
})();

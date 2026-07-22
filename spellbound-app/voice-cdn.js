/* ============================================================
   VOICE-CDN.js — when the app is served from GitHub Pages
   (*.github.io), the 342 MB voice corpus isn't bundled (Pages
   can't host 41k files). Instead we fetch each clip on demand
   from raw.githubusercontent.com, which serves individual repo
   files fine. Locally / offline (file://, or a full download
   build that DOES bundle voice/), this is inert and the app
   uses the bundled relative paths.

   Mechanism: wrap the Audio constructor so any 'voice/...' src
   is rewritten to the raw URL. Every clip in the app is played
   via `new Audio('voice/...')`, so this one hook covers them
   all (word clips, saga dialogue). Missing clips still fall
   back to the browser's built-in speech synthesis.
   Load this BEFORE any other app script.
   ============================================================ */
(function () {
  try {
    var host = (typeof location !== 'undefined' && location.hostname) || '';
    if (!/(^|\.)github\.io$/i.test(host)) return;            // hosted Pages only
    var BASE = 'https://raw.githubusercontent.com/aayuvis/Bizzing-Bee/main/spellbound-app/';
    var Native = window.Audio;
    if (!Native) return;
    var Wrapped = function (src) {
      if (typeof src === 'string' && src.slice(0, 6) === 'voice/') {
        // version query busts browser + CDN caches on each voice deploy
        // (SB_VOICE_VER is bumped in voice-review.js every rebuild round)
        src = BASE + src + '?v=' + (window.SB_VOICE_VER || '0');
      }
      return src === undefined ? new Native() : new Native(src);
    };
    Wrapped.prototype = Native.prototype;
    window.Audio = Wrapped;
    window.SB_AUDIO_BASE = BASE;   // exposed for any non-constructor callers added later
  } catch (e) { /* leave native Audio untouched on any error */ }
})();

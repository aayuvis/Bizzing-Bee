/* ============================================================
   VOICE-CDN.js — when the app is served from GitHub Pages
   (*.github.io), the 1.4 GB voice corpus isn't bundled (Pages
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
    var proto = (typeof location !== 'undefined' && location.protocol) || '';
    /* WHICH BUILDS STREAM THE CORPUS.
       This used to test `host is *.github.io`, which quietly stopped being the
       right question the moment a custom domain existed: on bizzingbee.com the
       check failed, the Audio wrapper never installed, and every word resolved
       same-origin to a gh-pages branch that carries ZERO word clips. The app
       would have launched on its own domain with all 128k pronunciations 404ing
       and nothing on screen to say so.
       The real question is not what the host is called — it is whether THIS build
       bundles voice/w. Two kinds do: a file:// or localhost copy, and a full
       download build, which says so by setting SB_VOICE_BUNDLED before this runs.
       Everything else is a hosted build and must stream, whatever it is named. */
    if (window.SB_VOICE_BUNDLED) return;                     // a build that ships the corpus
    if (proto === 'file:') return;                           // offline / bundled
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[?::1\]?)$/i.test(host)) return;   // dev server
    var BASE = 'https://raw.githubusercontent.com/aayuvis/Bizzing-Bee/main/spellbound-app/';
    var Native = window.Audio;
    if (!Native) return;
    /* Concept + advanced-concept NARRATION is bundled on Pages and served same-origin.
       It is 641 files and 25 MB, so unlike the 128,491-file / 1.4 GB word corpus it fits
       comfortably. Keeping it local matters for two reasons: raw.githubusercontent
       rate-limits unauthenticated requests, and narration is the most-played audio in the
       app; and it removes the dependency on those clips having reached `main`.
       voice/c<n>-<n>.mp3 = the 121 general chapters, voice/a<n>-<n>.mp3 = advanced.

       The MOCK BEE ANNOUNCER is bundled for the same reasons and one more: this
       rewrite points at the `main` branch, and the announcer clips live on a
       feature branch until it merges — fetched remotely they would simply 404.
       33 files, 879KB. voice/ann/<pool>-<i>.mp3. */
    var LOCAL = /^voice\/(?:[ca]\d+-\d+|ann\/[a-z0-9]+-\d+)\.mp3$/i;
    var Wrapped = function (src) {
      if (typeof src === 'string' && src.slice(0, 6) === 'voice/' && !LOCAL.test(src)) {
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

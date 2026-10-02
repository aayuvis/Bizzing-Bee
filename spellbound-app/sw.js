/* sw.js — Bizzing Bee works offline after its first visit (FIX-BEE N1, family standard §11).

   ONE KEY: THE ?v= STAMP. index.html registers this file as `sw.js?v=<stamp>`, the same
   stamp every asset URL carries, so the deploy that bumps the stamp (one sed over
   index.html) also installs a new worker, which opens a new cache and drops the old one.
   There is no second version number to forget.

   THREE RULES
   · Pages (navigations) are NETWORK-FIRST. index.html is deliberately no-store so a device
     never runs an old build; online it always gets the newest document, and the cached
     copy is only the offline fallback.
   · Same-origin assets are CACHE-FIRST within the stamp's cache. Scripts and styles carry
     ?v= and are immutable under it; art, fonts and data are cached as they are fetched and
     refreshed with the next stamp.
   · Audio is cached AS HEARD, never ahead. The 128k word clips stream from
     raw.githubusercontent (voice-cdn.js) and are not precached — a clip the child has heard
     is kept (in its own cache, which survives a stamp change because the clip URL carries
     SB_VOICE_VER) and a clip they have not heard falls back to device speech offline, which
     is what the app already does for a missing clip.

   WARM-UP. The first visit is not controlled by the worker (it installs after the page has
   loaded), so the page posts the list of what it already fetched and the worker copies those
   into the cache — mostly out of the HTTP cache, so it costs little or nothing on the wire.

   What it never does: talk to any host the page does not already talk to, or touch anything
   that is not a GET. It holds no information about the child — only the app's own files. */
'use strict';
var STAMP = new URL(self.location.href).searchParams.get('v') || 'dev';
var CORE = 'bee-core-' + STAMP;
var VOICE = 'bee-voice';
var VOICE_MAX = 1500;                         // ~20MB of word clips at the most
var VOICE_HOST = 'raw.githubusercontent.com';

/* Nothing is precached at install: the page hands over what it already has (below), so a
   first visit never downloads the app twice. */
self.addEventListener('install', function (e) { e.waitUntil(self.skipWaiting()); });

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('bee-core-') === 0 && k !== CORE; })
      .map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

function isAudio(req, url) {
  return req.destination === 'audio' || /\.(mp3|wav|ogg|m4a)$/i.test(url.pathname);
}
function isVoiceHost(url) { return url.hostname === VOICE_HOST && /\/voice\//.test(url.pathname); }
function pageKey(url) { var u = new URL(url); u.search = ''; u.hash = ''; return u.href; }

/* A media element asks for `Range: bytes=0-` and a 206 cannot be stored, so audio is
   fetched whole (no Range), stored, and the whole clip is answered — a word clip is a few
   kilobytes and is never seeked. Cross-origin clips are fetched in cors mode
   (raw.githubusercontent sends Access-Control-Allow-Origin: *), so the stored copy is a
   real response, not an opaque one that browsers pad to megabytes of quota. */
function audio(req, url, cacheName) {
  var key = url.href;
  return caches.open(cacheName).then(function (c) {
    return c.match(key).then(function (hit) {
      if (hit) return hit;
      var cross = url.origin !== self.location.origin;
      return fetch(key, { mode: cross ? 'cors' : 'same-origin', credentials: 'omit' }).then(function (res) {
        if (res && res.status === 200) {
          c.put(key, res.clone()).then(function () { if (cacheName === VOICE) trim(c); }).catch(function () {});
          return res;
        }
        return res;
      }, function () { return fetch(req); });
    });
  });
}
function trim(c) {
  return c.keys().then(function (keys) {
    var over = keys.length - VOICE_MAX;
    for (var i = 0; i < over; i++) c.delete(keys[i]);
  });
}

function page(req) {
  return fetch(req).then(function (res) {
    if (res && res.status === 200 && res.type === 'basic') {
      var copy = res.clone();
      caches.open(CORE).then(function (c) { return c.put(pageKey(req.url), copy); }).catch(function () {});
    }
    return res;
  }, function () {
    return caches.open(CORE).then(function (c) {
      return c.match(pageKey(req.url)).then(function (hit) {
        return hit || c.match(new URL('./', self.location.href).href) || c.match(new URL('index.html', self.location.href).href);
      }).then(function (hit) { return hit || Response.error(); });
    });
  });
}

function asset(req) {
  return caches.open(CORE).then(function (c) {
    return c.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200 && res.type === 'basic') c.put(req, res.clone()).catch(function () {});
        return res;
      });
    });
  });
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (req.mode === 'navigate') { e.respondWith(page(req)); return; }
  if (url.origin === self.location.origin) {
    if (/\/sw\.js$/.test(url.pathname)) return;
    if (isAudio(req, url)) { e.respondWith(audio(req, url, CORE)); return; }
    e.respondWith(asset(req));
    return;
  }
  if (isVoiceHost(url) && isAudio(req, url)) { e.respondWith(audio(req, url, VOICE)); return; }
  /* anything else: not ours to cache, and the browser handles it exactly as before */
});

/* The page's warm-up list: what it fetched before this worker was in charge. Same-origin
   only, GET only, and nothing already cached is fetched again. */
self.addEventListener('message', function (e) {
  var d = e.data || {};
  if (d.type !== 'warm' || !Array.isArray(d.urls)) return;
  /* audio is left out: a media element's own fetch is not in the HTTP cache in a form a
     second fetch can reuse, so warming it downloads every clip twice. It is cached the
     next time it is played, as all audio is. */
  var urls = d.urls.filter(function (u) {
    try { var x = new URL(u, self.location.href); return x.origin === self.location.origin && !/\/sw\.js$/.test(x.pathname) && !/\.(mp3|wav|ogg|m4a)$/i.test(x.pathname); } catch (err) { return false; }
  }).slice(0, 400);
  var job = caches.open(CORE).then(function (c) {
    return Promise.all(urls.map(function (u) {
      var x = new URL(u, self.location.href); x.hash = '';
      var doc = x.pathname === new URL('./', self.location.href).pathname || /\/index\.html$/.test(x.pathname);
      var key = doc ? pageKey(x.href) : x.href;
      return c.match(key).then(function (hit) {
        if (hit) return;
        return fetch(x.href, { credentials: 'same-origin' }).then(function (res) {
          if (res && res.status === 200 && res.type === 'basic') return c.put(key, res);
        }).catch(function () {});
      });
    }));
  });
  if (e.waitUntil) e.waitUntil(job);
});

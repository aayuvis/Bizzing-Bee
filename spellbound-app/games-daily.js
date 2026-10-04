/* ============================================================
   Bizzing Bee — DAILY BUZZ (game #38)
   A Wordle-style daily spelling puzzle: one 5-letter word a day,
   six tries, green/amber/grey deduction, and a spoiler-free
   shareable grid. No run of days is counted (FIX-BEE J2). Kid-safe:
   no dictionary rejection (any 5 letters is accepted), untimed,
   no shaming. Self-contained — injects its own CSS and draws its
   board into a host the app gives it (window.SB_DAILY.mount(el)).
   IT LIVES IN THE APP'S SHELL (audit v4 N2). It used to cover the
   whole screen with only "← Games" on it — no top bar, no tabs, no
   route, and Back left it standing over whatever came next. Now it is
   a screen like the rest: nav 'daily', #/daily, the family top bar and
   tabs around it. app3 renders the page head and an empty #db-host;
   after every app render, mount() draws the board again from the
   state kept HERE (guesses, the letters being typed), so a re-render
   never loses a word half-typed. Keys reach it only while it is the
   screen and nothing is typed into a field or open over it.
   ============================================================ */
(function () {
  // Curated answer pool — common, age-8–15-friendly 5-letter words.
  var WORDS = ("apple beach bloom brave bread brick bring brush chair chalk charm chase cheer chess chief child clean clear climb cloud coach crane crawl cream crown crumb daily dance dizzy dodge dream dress drink drive eager eagle early earth feast fetch field fight flame float flock flood floor flour focus force frame fresh frost fruit ghost giant glade glare glass gleam globe glory grace grain grand grape grasp grass great green greet grind groan group growl guard guest guide happy heart honey hound house human ivory jelly jolly juice knack knead knife knock koala laugh learn ledge lemon light lodge lucky lunar magic march match merry mirth month mouse mount music never noble ocean olive onion order otter panda paint peace pearl pedal petal photo piano pilot pixel plaid plane plant plaza pluck point polar pound power press pride prize proud pulse quack quart queen query quest quick quiet quilt quote raise ranch reach react ready realm rhyme river roast robin round royal salad scale scarf scene scent scoop score scout scrub sense serve shade shake shape share sharp sheep shelf shine shore short shout shrub siren skate skill slate sleek sleep slice slime slope small smart smile smoke snack snail sneak solar solid sound south space spark speak spell spend spice spine spoke spoon sport spray sprig squad stack staff stage stair stalk stamp stand stare steam steel stern stick sting stone store storm story stove strap straw strip study sugar suite sunny swarm sweat sweep sweet swift swirl table taste teach thank theme thick thief thing think thorn three throw thumb tiger toast token torch tower track trade trail train tramp trash treat trend trial tribe trick troop trout truce truck trunk trust truth twist ulcer uncle under unite upper urban usher valid value vapor vault verse video vigor vivid vocal voice vowel wagon waltz waste watch water weave wheat wheel where which whisk white whole world worth wound woven wrist write yield young youth zebra zesty").split(/\s+/);
  var GREET = "The morning word is greying — spell it back before the sixth try.";

  var css = ''
    + '.db-ov{position:fixed;inset:0;z-index:80;background:var(--bg,#FBF7EC);overflow:auto;display:flex;flex-direction:column;font-family:var(--body,"Hanken Grotesk",system-ui,sans-serif);color:var(--text,#241E33)}'
    + '.db-top{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:2px solid var(--honey,#F0B429)}'
    + '.db-top .db-back{font:600 14px var(--body,sans-serif);border:1px solid var(--line,#EADFC8);background:var(--panel,#fff);border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit}'
    + '.db-title{font:800 18px var(--display,"Fraunces",serif);letter-spacing:-.01em}'
    + '.db-sub{font:600 11px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--honey,#B8860B);margin-left:auto}'
    + '.db-body{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between;max-width:520px;margin:0 auto;width:100%;padding:10px 14px 18px}'
    + '.db-msg{min-height:26px;font:600 14px var(--body,sans-serif);color:var(--muted,#7A6E5C);text-align:center;padding:6px 0}'
    + '.db-grid{display:grid;grid-template-rows:repeat(6,1fr);gap:7px;margin:4px 0}'
    + '.db-row{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}'
    + '.db-cell{width:56px;height:56px;display:grid;place-items:center;font:800 28px var(--mono,"Sono",monospace);text-transform:uppercase;'
    + 'border:2px solid var(--line,#D7CDB6);border-radius:10px;color:var(--text,#241E33);background:transparent;transition:transform .12s ease}'
    + '.db-cell.pop{animation:db-pop .12s ease}'
    + '.db-cell.flip{animation:db-flip .5s ease forwards}'
    + '.db-cell.hit{background:#3AA55C;border-color:#3AA55C;color:#fff}'
    + '.db-cell.near{background:#E8A33D;border-color:#E8A33D;color:#fff}'
    + '.db-cell.miss{background:#8B857B;border-color:#8B857B;color:#fff}'
    + '.db-row.shake{animation:db-shake .4s}'
    + '@keyframes db-pop{50%{transform:scale(1.12)}}'
    + '@keyframes db-flip{0%{transform:rotateX(0)}45%{transform:rotateX(90deg)}100%{transform:rotateX(0)}}'
    + '@keyframes db-shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}'
    + '.db-keys{display:flex;flex-direction:column;gap:6px;align-items:center;width:100%}'
    + '.db-krow{display:flex;gap:5px;justify-content:center;width:100%}'
    + '.db-k{flex:1;max-width:38px;height:50px;border:none;border-radius:8px;background:var(--surface2,#EDE7D8);color:var(--text,#241E33);'
    + 'font:700 15px var(--body,sans-serif);text-transform:uppercase;cursor:pointer;display:grid;place-items:center;transition:.1s}'
    + '.db-k.wide{max-width:64px;font-size:12px;font-weight:800}'
    + '.db-k.hit{background:#3AA55C;color:#fff}.db-k.near{background:#E8A33D;color:#fff}.db-k.miss{background:#8B857B;color:#fff}'
    + '.db-k:active{transform:translateY(1px)}'
    + '.db-done{text-align:center;padding:14px 0}'
    + '.db-done h3{font:800 24px var(--display,serif);margin:0 0 6px}'
    + '.db-stats{display:flex;gap:10px;justify-content:center;margin:12px 0}'
    + '.db-stat{background:var(--panel,#fff);border:1px solid var(--line,#EADFC8);border-radius:12px;padding:8px 14px;min-width:66px}'
    + '.db-stat b{display:block;font:800 22px var(--display,serif);line-height:1}'
    + '.db-stat span{font:600 10px var(--mono,monospace);letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#7A6E5C)}'
    + '.db-share{font:700 15px var(--body,sans-serif);background:var(--honey,#F0B429);color:#2B2117;border:none;border-radius:999px;padding:12px 26px;cursor:pointer;box-shadow:0 4px 0 #C8891B}'
    + '@media(max-width:400px){.db-cell{width:48px;height:48px;font-size:24px}.db-k{height:46px}}'
    /* in the shell the top bar and the tab bar share a phone's height with the board: the whole
       keyboard stays above the tab bar on a 390x844 phone (keys stay 44px targets) */
    + '@media(max-width:440px) and (max-height:900px){.db-cell{width:44px;height:44px;font-size:22px}.db-grid,.db-row{gap:6px}.db-k{height:44px}.db-body{padding:6px 10px 12px}.db-msg{font-size:13px;padding:4px 0}}';

  function todayIndex() {
    var d = new Date();
    var epoch = Date.UTC(2026, 0, 1);
    var day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - epoch) / 86400000);
    return ((day % WORDS.length) + WORDS.length) % WORDS.length;
  }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function load() { try { return SB_STORE.getJSON('daily', {}) || {}; } catch (e) { return {}; } }
  function save(s) { try { SB_STORE.setJSON('daily', s); } catch (e) {} }

  var overlay = null, answer = '', guesses = [], cur = '', over = false, won = false, kbState = {}, day = '', flipRow = -1, keyOn = false;

  function evalGuess(g) {
    var res = ['miss', 'miss', 'miss', 'miss', 'miss'], pool = answer.split('');
    for (var i = 0; i < 5; i++) { if (g[i] === answer[i]) { res[i] = 'hit'; pool[pool.indexOf(g[i])] = null; } }
    for (var j = 0; j < 5; j++) { if (res[j] === 'hit') continue; var k = pool.indexOf(g[j]); if (k > -1) { res[j] = 'near'; pool[k] = null; } }
    return res;
  }
  function rank(a, b) { var o = { miss: 0, near: 1, hit: 2 }; return o[b] > o[a] ? b : a; }

  function render() {
    var b = overlay.querySelector('#db-body');
    var rowsN = 6;
    var html = '<div class="db-msg" id="db-msg" data-live-prompt="">' + GREET + '</div><div class="db-grid" id="db-grid">';
    for (var r = 0; r < rowsN; r++) {
      html += '<div class="db-row" data-r="' + r + '">';
      var g = guesses[r], ev = g ? evalGuess(g) : null;
      for (var c = 0; c < 5; c++) {
        var ch = g ? g[c] : (r === guesses.length ? (cur[c] || '') : '');
        /* only the row just played turns over: a re-render of the screen must not flip them all again */
        var fl = ev && r === flipRow, cls = ev ? ((fl ? ' flip ' : ' ') + ev[c]) : '';
        html += '<div class="db-cell' + cls + '"' + (fl ? ' style="animation-delay:' + (c * 90) + 'ms"' : '') + '>' + (ch || '') + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div id="db-foot" style="width:100%">' + (over ? doneHtml() : keyboardHtml()) + '</div>';
    b.innerHTML = html; flipRow = -1;
    if (!over) wireKeys();
    else wireShare();
  }
  function keyboardHtml() {
    var rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    var h = '<div class="db-keys">';
    rows.forEach(function (row, i) {
      h += '<div class="db-krow">';
      if (i === 2) h += '<button class="db-k wide" data-k="enter">Enter</button>';
      row.split('').forEach(function (ch) { h += '<button class="db-k ' + (kbState[ch] || '') + '" data-k="' + ch + '">' + ch + '</button>'; });
      if (i === 2) h += '<button class="db-k wide" data-k="back">⌫</button>';
      h += '</div>';
    });
    return h + '</div>';
  }
  function doneHtml() {
    var st = load();
    return '<div class="db-done"><h3 data-live-prompt="">' + (won ? '✨ Solved it!' : 'The word was ' + answer.toUpperCase()) + '</h3>'
      + '<div class="db-stats">'
      + '<div class="db-stat"><b>' + (st.wins || 0) + '</b><span>solved</span></div>'
      + '<div class="db-stat"><b>' + (st.played || 0) + '</b><span>played</span></div>'
      + '<div class="db-stat"><b>' + Math.round(((st.wins || 0) / Math.max(1, st.played || 0)) * 100) + '%</b><span>won</span></div>'
      + '</div>'
      + '<button class="db-share" id="db-share">Share your grid</button>'
      + '<div class="db-msg" id="db-share-note" style="min-height:18px"></div></div>';
  }

  function paintKb() {
    guesses.forEach(function (g) { var ev = evalGuess(g); for (var i = 0; i < 5; i++) kbState[g[i]] = rank(kbState[g[i]] || 'miss', ev[i]); });
  }
  function submit() {
    if (cur.length < 5) { flashRow(); msg('Five letters, please.'); return; }
    var g = cur.toLowerCase(); guesses.push(g); cur = '';
    var solved = g === answer; if (solved) won = true;
    if (solved || guesses.length >= 6) { over = true; finish(); }
    paintKb();
    var st = load(); st.day = todayKey(); st.guesses = guesses; st.over = over; st.won = won; save(st);
    flipRow = guesses.length - 1;
    render();
    if (!over) msg('');
  }
  function finish() {
    var st = load(); var last = st.lastWin;
    if (won) {
      // no streak: solved days are counted, never a run of them (FIX-BEE J2)
      st.lastWin = todayKey(); st.wins = (st.wins || 0) + 1;
    }
    st.played = (st.played || 0) + (st.playedDay === todayKey() ? 0 : 1); st.playedDay = todayKey();
    save(st);
    try { if (won && typeof addCoins === 'function') addCoins('answer'); } catch (e) {}   /* one word solved is one right answer */
    try { if (typeof logActivity === 'function') logActivity('daily', { won: won, tries: guesses.length }); } catch (e) {}
  }
  function shareGrid() {
    var lines = ['Bizzing Bee — Daily Buzz', (won ? guesses.length : 'X') + '/6'];
    guesses.forEach(function (g) { var ev = evalGuess(g); lines.push(ev.map(function (e) { return e === 'hit' ? '🟩' : e === 'near' ? '🟨' : '⬜'; }).join('')); });
    return lines.join('\n');
  }

  function msg(t) { var m = overlay && overlay.querySelector('#db-msg'); if (m) m.textContent = t; try { if (t && window.SB_LIVE) SB_LIVE.say([t]); } catch (e) {} }
  function flashRow() { var row = overlay.querySelector('.db-row[data-r="' + guesses.length + '"]'); if (row) { row.classList.remove('shake'); void row.offsetWidth; row.classList.add('shake'); } }
  function typeCh(ch) { if (over || cur.length >= 5) return; cur += ch; paintCur(); }
  function backCh() { if (over) return; cur = cur.slice(0, -1); paintCur(); }
  function paintCur() {
    var row = overlay.querySelector('.db-row[data-r="' + guesses.length + '"]'); if (!row) return;
    var cells = row.querySelectorAll('.db-cell');
    for (var i = 0; i < 5; i++) { var ch = cur[i] || ''; if (cells[i].textContent !== ch) { cells[i].textContent = ch; if (ch) { cells[i].classList.remove('pop'); void cells[i].offsetWidth; cells[i].classList.add('pop'); } } }
  }
  function wireKeys() {
    var foot = overlay.querySelector('#db-foot');
    foot.onclick = function (e) { var b = e.target.closest('.db-k'); if (!b) return; var k = b.dataset.k; if (k === 'enter') submit(); else if (k === 'back') backCh(); else typeCh(k); };
  }
  function wireShare() {
    var s = overlay.querySelector('#db-share'); if (!s) return;
    s.onclick = function () {
      var txt = shareGrid();
      var note = overlay.querySelector('#db-share-note');
      try { if (navigator.clipboard) { navigator.clipboard.writeText(txt); note.textContent = 'Copied to clipboard!'; return; } } catch (e) {}
      try { if (navigator.share) { navigator.share({ text: txt }); return; } } catch (e) {}
      note.textContent = txt;
    };
  }
  function onKey(e) {
    if (!overlay || !overlay.isConnected) return;
    /* only while Daily Buzz IS the screen, with nothing open over it and nothing typed into a field
       (the top bar's search box sits right above it now) */
    try { if (typeof state !== 'undefined' && (state.nav !== 'daily' || state.pinDlg || state.settingsOpen || state.drawerOpen || state.walletOpen || state.famMenu)) return; } catch (x) {}
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target, k = e.key;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    /* Enter on a focused control of the app (Back, a tab) presses that control, not the word */
    if (k === 'Enter' && t && t.closest && t.closest('button,a,[role="button"]') && !overlay.contains(t)) return;
    if (/^[a-zA-Z]$/.test(k)) { typeCh(k.toLowerCase()); }
    else if (k === 'Backspace') { e.preventDefault(); backCh(); }
    else if (k === 'Enter') { e.preventDefault(); submit(); }
  }

  function begin() {
    answer = WORDS[todayIndex()];
    var s = load(); guesses = (s.day === todayKey() && s.guesses) ? s.guesses.slice() : []; cur = '';
    over = (s.day === todayKey() && s.over) || false; won = (s.day === todayKey() && s.won) || false;
    kbState = {}; paintKb(); day = todayKey(); flipRow = -1;
  }
  /* Draw the board into the app's #db-host. Called after every app render while nav is 'daily';
     today's game is read from storage once a day, then lives here between renders. */
  function mount(el) {
    if (!el) return;
    if (!document.getElementById('db-css')) { var st = document.createElement('style'); st.id = 'db-css'; st.textContent = css; document.head.appendChild(st); }
    if (day !== todayKey()) begin();
    overlay = el;
    el.innerHTML = '<div class="db-body" id="db-body"></div>';
    render();
    if (!keyOn) { document.addEventListener('keydown', onKey); keyOn = true; }
  }
  function close() { document.removeEventListener('keydown', onKey); keyOn = false; overlay = null; day = ''; }
  /* the old entry point: Daily Buzz is a screen now, so opening it is going there */
  function open() { day = ''; try { if (typeof app !== 'undefined' && app.openDaily) { app.openDaily(); return; } } catch (e) {} }
  window.SB_DAILY = { open: open, close: close, mount: mount };
})();

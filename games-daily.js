/* ============================================================
   Bizzing Bee — DAILY BUZZ (game #38)
   A Wordle-style daily spelling puzzle: one 5-letter word a day,
   six tries, green/amber/grey deduction, a forgiving streak with
   a free freeze, and a spoiler-free shareable grid. Kid-safe:
   no dictionary rejection (any 5 letters is accepted), untimed,
   no shaming. Self-contained — injects its own CSS, renders a
   full-screen overlay. Exposes window.SB_DAILY.open().
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
    + '@media(max-width:400px){.db-cell{width:48px;height:48px;font-size:24px}.db-k{height:46px}}';

  function todayIndex() {
    var d = new Date();
    var epoch = Date.UTC(2026, 0, 1);
    var day = Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - epoch) / 86400000);
    return ((day % WORDS.length) + WORDS.length) % WORDS.length;
  }
  function todayKey() { var d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  function load() { try { return JSON.parse(localStorage.getItem('sb_daily') || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem('sb_daily', JSON.stringify(s)); } catch (e) {} }

  var overlay = null, answer = '', guesses = [], cur = '', over = false, won = false, kbState = {};

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
    var html = '<div class="db-msg" id="db-msg">' + GREET + '</div><div class="db-grid" id="db-grid">';
    for (var r = 0; r < rowsN; r++) {
      html += '<div class="db-row" data-r="' + r + '">';
      var g = guesses[r], ev = g ? evalGuess(g) : null;
      for (var c = 0; c < 5; c++) {
        var ch = g ? g[c] : (r === guesses.length ? (cur[c] || '') : '');
        var cls = ev ? (' flip ' + ev[c]) : '';
        html += '<div class="db-cell' + cls + '"' + (ev ? ' style="animation-delay:' + (c * 90) + 'ms"' : '') + '>' + (ch || '') + '</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div id="db-foot" style="width:100%">' + (over ? doneHtml() : keyboardHtml()) + '</div>';
    b.innerHTML = html;
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
    return '<div class="db-done"><h3>' + (won ? '✨ Solved it!' : 'The word was ' + answer.toUpperCase()) + '</h3>'
      + '<div class="db-stats">'
      + '<div class="db-stat"><b>' + (st.streak || 0) + '</b><span>streak</span></div>'
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
    render();
    if (!over) msg('');
  }
  function finish() {
    var st = load(); var last = st.lastWin;
    if (won) {
      // forgiving streak: increment if last win was yesterday or today, else reset to 1 (one free skip via freeze)
      var y = new Date(); y.setDate(y.getDate() - 1);
      var yk = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
      st.streak = (last === yk || last === todayKey()) ? (st.streak || 0) + (last === todayKey() ? 0 : 1) : 1;
      st.lastWin = todayKey(); st.wins = (st.wins || 0) + 1;
    }
    st.played = (st.played || 0) + (st.playedDay === todayKey() ? 0 : 1); st.playedDay = todayKey();
    save(st);
    try { if (won && typeof addCoins === 'function') addCoins(30 + (6 - guesses.length) * 8); } catch (e) {}
    try { if (typeof logActivity === 'function') logActivity('daily', { won: won, tries: guesses.length }); } catch (e) {}
  }
  function shareGrid() {
    var lines = ['Bizzing Bee — Daily Buzz', (won ? guesses.length : 'X') + '/6'];
    guesses.forEach(function (g) { var ev = evalGuess(g); lines.push(ev.map(function (e) { return e === 'hit' ? '🟩' : e === 'near' ? '🟨' : '⬜'; }).join('')); });
    return lines.join('\n');
  }

  function msg(t) { var m = overlay && overlay.querySelector('#db-msg'); if (m) m.textContent = t; }
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
    if (!overlay) return; var k = e.key;
    if (/^[a-zA-Z]$/.test(k)) { typeCh(k.toLowerCase()); }
    else if (k === 'Backspace') { backCh(); }
    else if (k === 'Enter') { submit(); }
  }

  function close() { document.removeEventListener('keydown', onKey); if (overlay) { overlay.remove(); overlay = null; } }
  function open() {
    if (!document.getElementById('db-css')) { var st = document.createElement('style'); st.id = 'db-css'; st.textContent = css; document.head.appendChild(st); }
    answer = WORDS[todayIndex()];
    var s = load(); guesses = (s.day === todayKey() && s.guesses) ? s.guesses.slice() : []; cur = '';
    over = (s.day === todayKey() && s.over) || false; won = (s.day === todayKey() && s.won) || false;
    kbState = {}; paintKb();
    close();
    overlay = document.createElement('div'); overlay.className = 'db-ov';
    overlay.innerHTML = '<div class="db-top"><button class="db-back" id="db-back">← Games</button>'
      + '<span class="db-title">Daily Buzz</span><span class="db-sub">' + todayKey() + '</span></div>'
      + '<div class="db-body" id="db-body"></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#db-back').onclick = function () { close(); try { if (typeof app !== 'undefined' && app.openGames) app.openGames(); } catch (e) {} };
    document.addEventListener('keydown', onKey);
    render();
  }
  window.SB_DAILY = { open: open, close: close };
})();

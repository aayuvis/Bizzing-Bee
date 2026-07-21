/* ============================================================
   Bizzing Bee — WORD SNAKE (game #40)
   Steer the bee around the meadow and swallow the letters of the
   target word IN ORDER — the word literally is the path you take.
   Eat them right and the swarm grows longer; the longer you get the
   trickier the steering. Kid-safe (ages 8–15): untimed, forgiving —
   a wrong letter just bonks (no death), only tangling in your own
   trail costs one of three lives. Wrap-around walls, never a wall
   crash. Keyboard (arrows / WASD) AND an on-screen D-pad for tablets.
   Self-contained: injects its own CSS, full-screen overlay.
   Exposes window.SB_SNAKE.open().
   ============================================================ */
(function () {
  var COLS = 17, ROWS = 15;

  // Fallback word pool (used if the app's own pools aren't reachable).
  var FALLBACK = ("bloom brave chase cheer child clean climb cloud crown dance dream"
    + " eagle earth field flame fresh fruit ghost giant glass grace grand grape green"
    + " heart honey house juice light lucky magic march mouse music noble ocean olive"
    + " paint peace pearl petal piano pilot plant point power press pride prize proud"
    + " queen quest quick quiet quilt reach ready river robin round royal scarf scene"
    + " scout shade shake shape share sharp sheep shine shore short shout skate slice"
    + " smart smile snack snail solar sound south space spark spell spend spice sport"
    + " stage stair stamp stand stare steam stone storm story swarm sweet swift table"
    + " taste teach thank theme thick thief thing think three throw tiger toast torch"
    + " tower track trade trail train treat trick trout trust truth twist uncle under"
    + " unite value vapor vivid vocal voice vowel wagon waste watch water wheat wheel"
    + " where which white whole world worth write yield young youth zebra zesty").split(/\s+/);

  var css = ''
    + '.ws-ov{position:fixed;inset:0;z-index:80;background:var(--bg,#FBF7EC);overflow:auto;display:flex;flex-direction:column;'
    + 'font-family:var(--body,"Hanken Grotesk",system-ui,sans-serif);color:var(--text,#241E33);-webkit-tap-highlight-color:transparent}'
    + '.ws-top{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:2px solid var(--honey,#F0B429)}'
    + '.ws-back{font:600 14px var(--body,sans-serif);border:1px solid var(--line,#EADFC8);background:var(--panel,#fff);border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit}'
    + '.ws-title{font:800 18px var(--display,"Fraunces",serif);letter-spacing:-.01em}'
    + '.ws-sub{font:600 11px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--honey,#B8860B);margin-left:auto}'
    + '.ws-body{flex:1;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:560px;margin:0 auto;width:100%;padding:12px 14px 20px}'
    + '.ws-hud{display:flex;align-items:center;justify-content:space-between;width:100%;font:700 15px var(--body,sans-serif)}'
    + '.ws-lives{letter-spacing:2px;font-size:17px}'
    + '.ws-word{display:flex;gap:6px;flex-wrap:wrap;justify-content:center;min-height:40px}'
    + '.ws-slot{width:34px;height:40px;display:grid;place-items:center;font:800 20px var(--mono,"Sono",monospace);text-transform:uppercase;'
    + 'border-bottom:3px solid var(--line,#D7CDB6);color:var(--muted,#9a8f7d)}'
    + '.ws-slot.on{color:var(--text,#241E33);border-color:#2FA35C}'
    + '.ws-slot.next{border-color:var(--honey,#F0B429);animation:ws-pulse 1s ease-in-out infinite}'
    + '@keyframes ws-pulse{50%{background:rgba(240,180,41,.18)}}'
    + '.ws-stage{position:relative;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 6px 20px rgba(60,50,20,.18)}'
    + '.ws-cv{display:block;width:100%;height:auto;background:#8FCF7A;touch-action:none}'
    + '.ws-msg{min-height:22px;font:700 15px var(--body,sans-serif);color:var(--honey,#B8860B);text-align:center}'
    + '.ws-dpad{display:flex;flex-direction:column;align-items:center;gap:6px;user-select:none;touch-action:none;margin-top:2px}'
    + '.ws-dmid{display:flex;gap:6px}'
    + '.ws-db{width:56px;height:56px;border-radius:14px;border:none;background:var(--honey,#F0B429);color:#2B2117;font-size:22px;font-weight:800;'
    + 'cursor:pointer;box-shadow:0 3px 0 #C8901B;display:grid;place-items:center}'
    + '.ws-db:active{transform:translateY(2px);box-shadow:0 1px 0 #C8901B}'
    + '.ws-over{position:absolute;inset:0;background:rgba(20,16,10,.72);display:grid;place-items:center;text-align:center;color:#fff;padding:20px}'
    + '.ws-over h3{font:800 26px var(--display,serif);margin:0 0 8px}'
    + '.ws-over p{margin:0 0 16px;font-size:15px;opacity:.92}'
    + '.ws-btn{border:none;border-radius:12px;padding:12px 22px;font:800 16px var(--body,sans-serif);cursor:pointer;'
    + 'background:var(--honey,#F0B429);color:#2B2117;box-shadow:0 4px 0 #C8901B}'
    + '.ws-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #C8901B}';

  var overlay = null, loop = null, onKey = null, kokoro = null;

  // Rasterise the player's collectible avatar (Bizzy by default) for the snake head.
  var _avCache = {};
  function avImg(id) {
    if (!id) return null;
    if (id in _avCache) return _avCache[id];
    _avCache[id] = null;
    try {
      if (typeof window.SB_AVATAR !== 'function') return null;
      var svg = window.SB_AVATAR(id, 120, { outline: false });
      if (!svg) { _avCache[id] = false; return null; }
      if (!/xmlns=/.test(svg)) svg = svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
      var img = new Image(120, 120);
      img.onload = function () { _avCache[id] = img; };
      img.onerror = function () { _avCache[id] = false; };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (e) { _avCache[id] = false; }
    return null;
  }
  function heroAv() { try { return (typeof active === 'function' && active() && active().avatar) || 'bizzy'; } catch (e) { return 'bizzy'; } }

  function pickWords(n) {
    var list = null;
    // Prefer the app's difficulty-aware word pool if it's reachable.
    try {
      if (typeof window.gameWordsD === 'function') {
        var gp = window.gameWordsD();
        if (gp && gp.length) list = gp.map(function (w) { return (typeof w === 'string') ? w : (w.w || w.word); });
      }
    } catch (e) {}
    if (!list || !list.length) list = FALLBACK.slice();
    list = list.filter(function (w) { return w && /^[a-z]+$/i.test(w) && w.length >= 3 && w.length <= 8; });
    // Deterministic-ish shuffle without Date/Math.random dependence on seed;
    // Math.random is fine here (gameplay variety, not persistence).
    for (var i = list.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = list[i]; list[i] = list[j]; list[j] = t; }
    return list.slice(0, Math.max(n, 12)).map(function (w) { return w.toLowerCase(); });
  }

  function speak(word) {
    try {
      var a = new Audio('voice/w/' + word.replace(/[^a-z0-9]/g, '-') + '.mp3');
      a.play().catch(function () {});
    } catch (e) {}
  }

  function open() {
    if (!document.getElementById('ws-css')) {
      var st = document.createElement('style'); st.id = 'ws-css'; st.textContent = css; document.head.appendChild(st);
    }
    close();
    overlay = document.createElement('div');
    overlay.className = 'ws-ov';
    overlay.innerHTML =
      '<div class="ws-top"><button class="ws-back" id="ws-back">‹ Games</button>'
      + '<span class="ws-title">🐝 Word Snake</span><span class="ws-sub">Eat the letters in order</span></div>'
      + '<div class="ws-body">'
      + '<div class="ws-hud"><span id="ws-score">Score 0</span><span class="ws-lives" id="ws-lives">💛💛💛</span></div>'
      + '<div class="ws-word" id="ws-word"></div>'
      + '<div class="ws-stage"><canvas class="ws-cv" id="ws-cv"></canvas><div id="ws-overlay"></div></div>'
      + '<div class="ws-msg" id="ws-msg">Steer the bee to the glowing letter first!</div>'
      + '<div class="ws-dpad"><button class="ws-db" data-d="up" aria-label="Up">▲</button>'
      + '<div class="ws-dmid"><button class="ws-db" data-d="left" aria-label="Left">◀</button>'
      + '<button class="ws-db" data-d="down" aria-label="Down">▼</button>'
      + '<button class="ws-db" data-d="right" aria-label="Right">▶</button></div></div>'
      + '</div>';
    document.body.appendChild(overlay);

    var cv = overlay.querySelector('#ws-cv');
    var CELL = 30; cv.width = COLS * CELL; cv.height = ROWS * CELL;
    var cx = cv.getContext('2d');

    var words = pickWords(14), widx = 0;
    var word = '', spelled = 0, tiles = [];   // tiles: {x,y,ch,idx}
    var snake, dir, nextDir, score = 0, lives = 3, over = false, tickMs = 220, bonk = 0, wordsDone = 0;

    function empties(used) {
      var free = [];
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
        var taken = false;
        for (var i = 0; i < used.length; i++) if (used[i].x === x && used[i].y === y) { taken = true; break; }
        if (!taken) free.push({ x: x, y: y });
      }
      return free;
    }

    function layoutWord() {
      word = words[widx++ % words.length]; spelled = 0; tiles = [];
      var used = snake.slice();
      // Keep a clear ring around the bee's head so nothing spawns on top of it.
      var head = snake[0];
      for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++)
        used.push({ x: (head.x + dx + COLS) % COLS, y: (head.y + dy + ROWS) % ROWS });
      var free = empties(used);
      for (var i = free.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = free[i]; free[i] = free[j]; free[j] = t; }
      for (var k = 0; k < word.length && k < free.length; k++)
        tiles.push({ x: free[k].x, y: free[k].y, ch: word[k], idx: k });
      renderWord(); speak(word);
    }

    function renderWord() {
      var host = overlay.querySelector('#ws-word');
      host.innerHTML = word.split('').map(function (ch, i) {
        var cls = 'ws-slot' + (i < spelled ? ' on' : i === spelled ? ' next' : '');
        return '<span class="' + cls + '">' + (i < spelled ? ch.toUpperCase() : (i === spelled ? '·' : '')) + '</span>';
      }).join('');
    }

    function msg(m) { overlay.querySelector('#ws-msg').textContent = m; }
    function setHud() {
      overlay.querySelector('#ws-score').textContent = 'Score ' + score;
      overlay.querySelector('#ws-lives').textContent = '💛'.repeat(lives) + '🖤'.repeat(3 - lives);
    }

    function reset(full) {
      var cxm = Math.floor(COLS / 2), cym = Math.floor(ROWS / 2);
      snake = [{ x: cxm, y: cym }, { x: cxm - 1, y: cym }, { x: cxm - 2, y: cym }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
      if (full) { score = 0; lives = 3; wordsDone = 0; widx = 0; tickMs = 220; }
      layoutWord(); setHud();
    }

    function loseLife() {
      lives--; setHud();
      if (lives <= 0) { finish(); return; }
      msg('Tangled! ' + lives + ' ' + (lives === 1 ? 'life' : 'lives') + ' left — keep buzzing.');
      var cxm = Math.floor(COLS / 2), cym = Math.floor(ROWS / 2);
      snake = [{ x: cxm, y: cym }, { x: cxm - 1, y: cym }, { x: cxm - 2, y: cym }];
      dir = { x: 1, y: 0 }; nextDir = { x: 1, y: 0 };
    }

    function step() {
      if (over) return;
      dir = nextDir;
      var head = snake[0];
      var nx = (head.x + dir.x + COLS) % COLS, ny = (head.y + dir.y + ROWS) % ROWS;
      // self-collision (skip the tail cell we're about to vacate)
      for (var i = 0; i < snake.length - 1; i++) if (snake[i].x === nx && snake[i].y === ny) { loseLife(); return; }
      snake.unshift({ x: nx, y: ny });
      var grew = false;
      // did we land on a letter tile?
      for (var t = 0; t < tiles.length; t++) {
        if (tiles[t].x === nx && tiles[t].y === ny) {
          if (tiles[t].idx === spelled) {
            spelled++; score += 15; grew = true;
            tiles.splice(t, 1);
            if (spelled >= word.length) {
              wordsDone++; score += 40;
              try { if (typeof addCoins === 'function') addCoins(10); } catch (e) {}
              msg('🍯 ' + word.toUpperCase() + '! +10 🪙  The swarm grows.');
              if (tickMs > 120) tickMs -= 8;
              layoutWord();
            } else { renderWord(); }
          } else {
            bonk = 2; msg('That’s letter ' + (tiles[t].idx + 1) + ' — you need ' + word[spelled].toUpperCase() + ' next.');
          }
          break;
        }
      }
      if (!grew) snake.pop();
      setHud();
    }

    function draw() {
      // meadow checker
      for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) {
        cx.fillStyle = (x + y) % 2 ? '#8FCF7A' : '#86C772';
        cx.fillRect(x * CELL, y * CELL, CELL, CELL);
      }
      // letter tiles
      for (var t = 0; t < tiles.length; t++) {
        var tl = tiles[t], px = tl.x * CELL, py = tl.y * CELL;
        var isNext = tl.idx === spelled;
        cx.fillStyle = isNext ? '#F0B429' : '#FFF7E2';
        roundRect(px + 3, py + 3, CELL - 6, CELL - 6, 7); cx.fill();
        if (isNext) { cx.strokeStyle = '#C8901B'; cx.lineWidth = 2; cx.stroke(); }
        cx.fillStyle = isNext ? '#2B2117' : '#8A7A55';
        cx.font = '800 ' + Math.floor(CELL * 0.6) + 'px Sono, monospace';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.fillText(tl.ch.toUpperCase(), px + CELL / 2, py + CELL / 2 + 1);
      }
      // snake body
      for (var i = snake.length - 1; i >= 0; i--) {
        var s = snake[i], sx = s.x * CELL, sy = s.y * CELL;
        if (i === 0) {
          if (bonk > 0) { cx.fillStyle = 'rgba(229,83,61,.5)'; roundRect(sx, sy, CELL, CELL, 10); cx.fill(); }
          var av = avImg(heroAv());
          var drew = false;
          if (av) { try { cx.drawImage(av, sx - 1, sy - 2, CELL + 2, CELL + 2); drew = true; } catch (e) {} }
          if (!drew) {
            cx.fillStyle = bonk > 0 ? '#E5533D' : '#F0B429';
            roundRect(sx + 2, sy + 2, CELL - 4, CELL - 4, 9); cx.fill();
            cx.fillStyle = '#2B2117';
            cx.fillRect(sx + CELL * 0.34, sy + 4, 3, CELL - 8);
            cx.fillRect(sx + CELL * 0.56, sy + 4, 3, CELL - 8);
            cx.beginPath(); cx.arc(sx + CELL * 0.72, sy + CELL * 0.32, 2.4, 0, 7); cx.fill();
          }
        } else {
          var f = 1 - (i / snake.length) * 0.4;
          cx.fillStyle = 'rgba(240,180,41,' + f + ')';
          roundRect(sx + 3, sy + 3, CELL - 6, CELL - 6, 8); cx.fill();
        }
      }
      if (bonk > 0) bonk--;
    }

    function roundRect(x, y, w, h, r) {
      cx.beginPath();
      cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r);
      cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath();
    }

    function frame() {
      if (over) { if (loop) { clearInterval(loop); loop = null; } return; }
      try { step(); if (!over) draw(); } catch (e) {}
      // re-pace the interval if speed changed
      if (loop && frame._ms !== tickMs) { clearInterval(loop); frame._ms = tickMs; loop = setInterval(frame, tickMs); }
    }

    function finish() {
      over = true; if (loop) { clearInterval(loop); loop = null; }
      try { if (typeof logActivity === 'function') logActivity('snake', { words: wordsDone, score: score }); } catch (e) {}
      var ov = overlay.querySelector('#ws-overlay');
      ov.className = 'ws-over';
      ov.innerHTML = '<div><h3>' + (wordsDone >= 1 ? '🍯 ' + wordsDone + ' word' + (wordsDone === 1 ? '' : 's') + ' spelled!' : 'Nice try!')
        + '</h3><p>Score ' + score + '</p><button class="ws-btn" id="ws-again">Play again</button></div>';
      ov.querySelector('#ws-again').onclick = function () { ov.className = ''; ov.innerHTML = ''; over = false; reset(true); frame._ms = tickMs; loop = setInterval(frame, tickMs); };
    }

    function setDir(d) {
      if (over) return;
      var map = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
      var nd = map[d]; if (!nd) return;
      // no instant 180° reversal
      if (nd.x === -dir.x && nd.y === -dir.y) return;
      nextDir = nd;
    }

    onKey = function (e) {
      var m = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' }[e.key];
      if (m) { setDir(m); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);

    overlay.querySelector('.ws-dpad').addEventListener('click', function (e) {
      var b = e.target.closest('[data-d]'); if (b) setDir(b.dataset.d);
    });
    overlay.querySelector('.ws-dpad').addEventListener('pointerdown', function (e) {
      var b = e.target.closest('[data-d]'); if (b) { setDir(b.dataset.d); e.preventDefault(); }
    });
    // swipe on the board
    var tsx = 0, tsy = 0;
    cv.addEventListener('pointerdown', function (e) { tsx = e.clientX; tsy = e.clientY; });
    cv.addEventListener('pointerup', function (e) {
      var dx = e.clientX - tsx, dy = e.clientY - tsy;
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? 'right' : 'left'); else setDir(dy > 0 ? 'down' : 'up');
    });

    overlay.querySelector('#ws-back').onclick = close;

    reset(true);
    frame._ms = tickMs;
    loop = setInterval(frame, tickMs);
    draw();
  }

  function close() {
    if (onKey) { document.removeEventListener('keydown', onKey); onKey = null; }
    if (loop) { clearInterval(loop); loop = null; }
    if (overlay) { overlay.remove(); overlay = null; }
  }

  window.SB_SNAKE = { open: open, close: close };
})();

/* Bromic — "Extend The Moment".
   A visual campaign deck: the boards run full-bleed and the writing sits on them.
   Bromic design language throughout — Arial, ember #EF4123, Bromic black, the flame. */
const pptx = require('pptxgenjs');
const fs = require('fs');
const D = JSON.parse(fs.readFileSync('/tmp/bx/data.json', 'utf8'));

const REPO = '/home/user/Bizzing-Bee/bromic';
const DS = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/ds/powerpoint-handover/assets';
const BOARD = n => `${REPO}/boards/${n}.jpg`;
const has = n => n && fs.existsSync(BOARD(n));

const INK='231F20', EMBER='EF4123', EMBER4='F46A4A', BLACK='0E0F11',
      S400='969CA2', S300='BCC1C5', S200='DDE0E2', S50='F6F7F8', WHITE='FFFFFF', SEC='5A6066';
const FONT = 'Arial';
const px = v => v / 96;
const W = 13.333, H = 7.5, M = px(36);

const deck = new pptx();
deck.defineLayout({ name: 'BROMIC', width: W, height: H });
deck.layout = 'BROMIC';
deck.author = 'Bromic Heating';
deck.title = 'Extend The Moment — brand campaign';

const shorten = (t, n) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n)) + '…');
const money = v => '$' + v.toLocaleString('en-US');

/* full-bleed photograph + a scrim so type stays legible on any frame */
function bleed(s, img) {
  s.addImage({ path: BOARD(img), x: 0, y: 0, w: W, h: H, sizing: { type: 'cover', w: W, h: H } });
}
function scrim(s, y, h, alpha) {
  s.addShape(deck.ShapeType.rect, { x: 0, y, w: W, h, fill: { color: BLACK, transparency: alpha } });
}
function markWhite(s) {
  s.addImage({ path: `${DS}/bromic-logo-white.png`, x: W - M - px(96), y: H - px(46), h: px(20), w: px(68) });
}
function stamp(s, t, color) {
  s.addText(t, { x: M, y: px(34), w: px(700), h: px(18), fontFace: FONT, fontSize: 8.5, bold: true,
                 color: color || WHITE, charSpacing: 1.6, valign: 'middle', margin: 0 });
}

/* ============================== COVER ============================== */
{
  const s = deck.addSlide();
  s.background = { color: BLACK };
  s.addImage({ path: `${DS}/bromic-logo-white.png`, x: M, y: px(44), h: px(30), w: px(102) });
  s.addImage({ path: `${DS}/bromic-flame.png`, x: W - M - px(233), y: px(150), h: px(360), w: px(233) });
  s.addText([{ text: 'Extend\nThe Moment', options: { color: WHITE } }],
    { x: M, y: px(170), w: px(880), h: px(250), fontFace: FONT, fontSize: 62, bold: true,
      lineSpacingMultiple: 1.0, valign: 'top', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x: M, y: px(452), w: px(535), h: px(4), fill: { color: EMBER } });
  s.addText('A brand campaign for outdoor heating.\nHumour is the only unclaimed territory in this category.',
    { x: M, y: px(474), w: px(760), h: px(60), fontFace: FONT, fontSize: 15, color: 'C9CDD1',
      lineSpacingMultiple: 1.4, valign: 'top', margin: 0 });
  s.addText('44 CONCEPTS · 6 FILMS · 4 RECEIPTS · 4 PRICED SCENES · US + AUS',
    { x: M, y: px(650), w: px(900), h: px(20), fontFace: FONT, fontSize: 9, bold: true,
      color: EMBER4, charSpacing: 1.5, valign: 'middle', margin: 0 });
  s.addNotes('Bromic keeps its promise — Extend The Moment. This campaign supplies the argument underneath it.');
}

/* ============================== THE PROBLEM ============================== */
{
  const s = deck.addSlide();
  s.background = { color: BLACK };
  stamp(s, 'THE PROBLEM', EMBER4);
  s.addText([{ text: 'Every ad in this category', options: { color: WHITE, breakLine: true } },
             { text: 'is ', options: { color: WHITE, breakLine: false } },
             { text: 'the same ad.', options: { color: EMBER, breakLine: false } }],
    { x: M, y: px(168), w: px(1080), h: px(210), fontFace: FONT, fontSize: 46, bold: true,
      lineSpacingMultiple: 1.06, valign: 'top', margin: 0 });
  s.addText('Golden hour. Infinity pool. Cashmere throw. Two glasses of wine nobody drinks.',
    { x: M, y: px(392), w: px(880), h: px(28), fontFace: FONT, fontSize: 15, color: 'C9CDD1',
      valign: 'middle', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x: M, y: px(438), w: px(535), h: px(3), fill: { color: EMBER } });
  const pts = [['Bought once', 'One decision. One chance to be the name.'],
               ['Considered slowly', 'Months between the first thought and the quote.'],
               ['Closed at a counter', 'A person recommends the brand they remember.']];
  pts.forEach((p, i) => {
    const x = M + i * px(400);
    s.addText(p[0], { x, y: px(470), w: px(370), h: px(24), fontFace: FONT, fontSize: 14, bold: true,
                      color: WHITE, valign: 'middle', margin: 0 });
    s.addText(p[1], { x, y: px(496), w: px(360), h: px(44), fontFace: FONT, fontSize: 10.5,
                      color: S400, lineSpacingMultiple: 1.4, valign: 'top', margin: 0 });
  });
  s.addText('Humour is the only unclaimed territory here.',
    { x: M, y: px(600), w: px(900), h: px(30), fontFace: FONT, fontSize: 17, bold: true,
      color: EMBER, valign: 'middle', margin: 0 });
  markWhite(s);
}

/* ============================== SECTION DIVIDER ============================== */
function divider(num, name, line, img) {
  const s = deck.addSlide();
  s.background = { color: BLACK };
  if (img && has(img)) { bleed(s, img); scrim(s, 0, H, 32); }
  s.addText(num, { x: M, y: px(222), w: px(180), h: px(104), fontFace: FONT, fontSize: 60, bold: true,
                   color: EMBER, valign: 'middle', margin: 0 });
  s.addText(name, { x: M, y: px(326), w: px(1000), h: px(72), fontFace: FONT, fontSize: 40, bold: true,
                    color: WHITE, valign: 'middle', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x: M, y: px(404), w: px(535), h: px(3), fill: { color: EMBER } });
  s.addText(line, { x: M, y: px(422), w: px(820), h: px(58), fontFace: FONT, fontSize: 13,
                    color: 'C9CDD1', lineSpacingMultiple: 1.45, valign: 'top', margin: 0 });
  markWhite(s);
  return s;
}

/* ============================== 01 · THE FILMS ============================== */
divider('01', 'The films', 'Six plates. One shoot, both hemispheres. Cold misery held straight-faced for twenty-five seconds — then the heat comes on and the space fills.', D.PLATES[1].img);

D.PLATES.forEach(p => {
  /* cold frame — the joke */
  const a = deck.addSlide();
  bleed(a, p.img);
  scrim(a, H - px(300), px(300), 28);
  scrim(a, 0, px(96), 45);
  a.addText(`${p.no} · ${p.t.toUpperCase()}`, { x: M, y: px(34), w: px(760), h: px(18), fontFace: FONT,
    fontSize: 8.5, bold: true, color: EMBER4, charSpacing: 1.6, valign: 'middle', margin: 0 });
  const tags = p.tags.filter(t => t[0]).map(t => t[0]).slice(0, 5).join('   ·   ');
  a.addText(tags, { x: W - M - px(520), y: px(34), w: px(520), h: px(18), fontFace: FONT, fontSize: 8,
    bold: true, color: S300, charSpacing: 1.2, align: 'right', valign: 'middle', margin: 0 });
  a.addText(p.line, { x: M, y: H - px(230), w: px(920), h: px(120), fontFace: FONT, fontSize: 30,
    bold: true, color: WHITE, lineSpacingMultiple: 1.12, valign: 'bottom', margin: 0 });
  a.addText(p.s, { x: M, y: H - px(96), w: px(880), h: px(56), fontFace: FONT, fontSize: 10.5,
    color: S300, lineSpacingMultiple: 1.4, valign: 'top', margin: 0 });
  markWhite(a);
  a.addNotes(p.why || '');

  /* warm frame — the turn */
  const b = deck.addSlide();
  bleed(b, p.img2);
  scrim(b, H - px(210), px(210), 30);
  b.addText([{ text: 'Extend The Moment.', options: { color: WHITE } }],
    { x: M, y: H - px(150), w: px(900), h: px(60), fontFace: FONT, fontSize: 34, bold: true,
      valign: 'middle', margin: 0 });
  b.addShape(deck.ShapeType.rect, { x: M, y: H - px(168), w: px(200), h: px(3), fill: { color: EMBER } });
  b.addText(`${p.no} · THE TURN`, { x: W - M - px(300), y: H - px(140), w: px(300), h: px(20),
    fontFace: FONT, fontSize: 8.5, bold: true, color: EMBER4, charSpacing: 1.6, align: 'right',
    valign: 'middle', margin: 0 });
  markWhite(b);
});

/* ============================== 02 · THE RECEIPT ============================== */
divider('02', 'The Receipt', 'The same argument, stated as arithmetic. A stack of itemised prices — then the ending inverts, because the thing that unlocks the backyard is the cheapest line on the list.', D.PLATES[2].img);

D.RECEIPTS.forEach(r => {
  const s = deck.addSlide();
  s.background = { color: BLACK };
  s.addShape(deck.ShapeType.rect, { x: 0, y: 0, w: px(6), h: H, fill: { color: EMBER } });
  s.addText(r.tier.toUpperCase(), { x: M + px(20), y: px(48), w: px(700), h: px(18), fontFace: FONT,
    fontSize: 8.5, bold: true, color: EMBER4, charSpacing: 1.6, valign: 'middle', margin: 0 });
  s.addText(r.t, { x: M + px(20), y: px(70), w: px(760), h: px(54), fontFace: FONT, fontSize: 30,
    bold: true, color: WHITE, valign: 'middle', margin: 0 });

  const x = M + px(20), rw = px(760);
  const rows = r.rows.slice(0, 6);
  rows.forEach((row, i) => {
    const y = px(150) + i * px(46);
    s.addText(row[0], { x, y, w: rw - px(200), h: px(40), fontFace: FONT, fontSize: 14, color: S300,
      valign: 'middle', margin: 0 });
    s.addText(row[1], { x: x + rw - px(210), y, w: px(210), h: px(40), fontFace: FONT, fontSize: 14,
      color: WHITE, align: 'right', valign: 'middle', margin: 0 });
    s.addShape(deck.ShapeType.rect, { x, y: y + px(41), w: rw, h: px(1), fill: { color: '2A2C2F' } });
  });
  let y = px(150) + rows.length * px(46) + px(6);
  s.addText(r.total[0], { x, y, w: rw - px(200), h: px(40), fontFace: FONT, fontSize: 15, bold: true,
    color: WHITE, valign: 'middle', margin: 0 });
  s.addText(r.total[1], { x: x + rw - px(210), y, w: px(210), h: px(40), fontFace: FONT, fontSize: 15,
    bold: true, color: WHITE, align: 'right', valign: 'middle', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x, y: y + px(46), w: rw, h: px(2), fill: { color: WHITE } });

  y += px(66);
  s.addText(r.punch[0], { x, y, w: rw - px(220), h: px(58), fontFace: FONT, fontSize: 19, bold: true,
    color: EMBER, lineSpacingMultiple: 1.15, valign: 'middle', margin: 0 });
  s.addText(r.punch[1], { x: x + rw - px(230), y, w: px(230), h: px(58), fontFace: FONT, fontSize: 26,
    bold: true, color: EMBER, align: 'right', valign: 'middle', margin: 0 });

  s.addText('Extend The Moment.', { x, y: H - px(84), w: px(600), h: px(30), fontFace: FONT,
    fontSize: 16, bold: true, color: WHITE, valign: 'middle', margin: 0 });
  if (r.ins) s.addText(shorten(r.ins, 320), { x: W - M - px(420), y: px(160), w: px(420), h: px(300),
    fontFace: FONT, fontSize: 10.5, color: S400, lineSpacingMultiple: 1.5, valign: 'top', margin: 0 });
  markWhite(s);
  s.addNotes(r.arg || '');
});

/* ============================== 03 · PRICED SCENES ============================== */
divider('03', 'Priced scenes', 'The Receipt told as photography. Every object wears its price like a showroom tag — then the last tag lands on the only thing nobody costed, and it is the cheapest number on screen.', D.SCENES[0].cold);

D.SCENES.forEach(sc => {
  const s = deck.addSlide();
  bleed(s, sc.cold);
  scrim(s, 0, H, 20);
  scrim(s, 0, px(96), 40);
  s.addText(sc.tier.toUpperCase(), { x: M, y: px(34), w: px(600), h: px(18), fontFace: FONT,
    fontSize: 8.5, bold: true, color: EMBER4, charSpacing: 1.6, valign: 'middle', margin: 0 });
  s.addText(sc.t, { x: M, y: px(52), w: px(700), h: px(36), fontFace: FONT, fontSize: 20, bold: true,
    color: WHITE, valign: 'middle', margin: 0 });

  /* price pins, positioned from the campaign's own x/y percentages.
     The punch pin is placed first and never moves; the rest give way to it. */
  const pins = sc.tags.map(t => Object.assign({}, t)).concat([Object.assign({ punch: true }, sc.punch)]);
  pins.sort((a, b) => (b.punch ? 1 : 0) - (a.punch ? 1 : 0));
  const placed = [];
  const hits = (a, b) => !(a.x + a.w + px(6) <= b.x || b.x + b.w + px(6) <= a.x ||
                           a.y + a.h + px(4) <= b.y || b.y + b.h + px(4) <= a.y);
  pins.forEach(t => {
    const punch = !!t.punch;
    const pw = punch ? px(300) : px(232), ph = punch ? px(62) : px(50);
    const cx = (t.x / 100) * W, cy = (t.y / 100) * H;
    let bx = t.a === 'r' ? cx - pw : t.a === 'l' ? cx : cx - pw / 2;
    bx = Math.max(px(10), Math.min(bx, W - pw - px(10)));
    const TOP = px(104), BOT = H - ph - px(84);
    let by = Math.max(TOP, Math.min(cy - ph / 2, BOT));
    let box = { x: bx, y: by, w: pw, h: ph };
    if (!punch) {                       // nudge clear of anything already placed
      for (let step = 0; step < 40 && placed.some(q => hits(box, q)); step++) {
        const dir = step % 2 ? -1 : 1, mag = Math.ceil((step + 1) / 2) * px(16);
        let ny = by + dir * mag;
        if (ny < TOP || ny > BOT) ny = Math.max(TOP, Math.min(by - dir * mag, BOT));
        box = { x: bx, y: ny, w: pw, h: ph };
      }
    }
    placed.push(box);
    s.addShape(deck.ShapeType.rect, { x: box.x, y: box.y, w: pw, h: ph,
      fill: { color: punch ? EMBER : BLACK, transparency: punch ? 0 : 20 } });
    s.addText(t.l, { x: box.x + px(12), y: box.y + px(6), w: pw - px(24), h: px(18), fontFace: FONT,
      fontSize: punch ? 9.5 : 8.5, bold: punch, color: punch ? WHITE : S200, valign: 'middle', margin: 0 });
    s.addText(money(t.v), { x: box.x + px(12), y: box.y + px(24), w: pw - px(24),
      h: punch ? px(32) : px(24), fontFace: FONT, fontSize: punch ? 20 : 15, bold: true,
      color: WHITE, valign: 'middle', margin: 0 });
  });

  scrim(s, H - px(76), px(76), 25);
  s.addText(sc.note, { x: M, y: H - px(68), w: px(940), h: px(56), fontFace: FONT, fontSize: 10.5,
    color: S200, lineSpacingMultiple: 1.4, valign: 'middle', margin: 0 });
  markWhite(s);
});

/* ============================== 04 · THE BANK ============================== */
divider('04', 'The concept bank', '32 concepts for the US and Australia, plus 12 for builders, architects and commercial operators. Every one carries four registers — deadpan, dry, absurd and dark.', D.BANK[5].img);

function grid(items, titleText, note) {
  const s = deck.addSlide();
  s.background = { color: WHITE };
  s.addText(titleText, { x: M, y: px(34), w: px(900), h: px(30), fontFace: FONT, fontSize: 17,
    bold: true, color: INK, valign: 'middle', margin: 0 });
  if (note) s.addText(note, { x: W - M - px(460), y: px(38), w: px(460), h: px(22), fontFace: FONT,
    fontSize: 9, color: S400, align: 'right', valign: 'middle', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x: M, y: px(74), w: px(200), h: px(3), fill: { color: EMBER } });

  const cols = 4, gap = px(14);
  const cw = (W - 2 * M - (cols - 1) * gap) / cols;
  const ih = cw * 9 / 16;
  items.forEach((c, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const x = M + col * (cw + gap), y = px(96) + row * (ih + px(112));
    if (has(c.img)) s.addImage({ path: BOARD(c.img), x, y, w: cw, h: ih, sizing: { type: 'cover', w: cw, h: ih } });
    else {
      s.addShape(deck.ShapeType.rect, { x, y, w: cw, h: ih, fill: { color: S50 } });
      s.addText('BOARD TO BE SHOT', { x, y, w: cw, h: ih, fontFace: FONT, fontSize: 8, color: S400,
        align: 'center', valign: 'middle', charSpacing: 1.2, margin: 0 });
    }
    const num = String(c.n).length <= 2 ? String(c.n).padStart(2, '0') : String(c.n);
    s.addText(num, { x, y: y + ih + px(8), w: px(26), h: px(18), fontFace: FONT, fontSize: 9,
      bold: true, color: EMBER, valign: 'top', margin: 0 });
    s.addText(c.t, { x: x + px(28), y: y + ih + px(6), w: cw - px(28), h: px(34), fontFace: FONT,
      fontSize: 10.5, bold: true, color: INK, lineSpacingMultiple: 1.18, valign: 'top', margin: 0 });
    s.addText(shorten(c.c, 100), { x, y: y + ih + px(44), w: cw, h: px(60), fontFace: FONT,
      fontSize: 9, color: SEC, lineSpacingMultiple: 1.35, valign: 'top', margin: 0 });
  });
  s.addImage({ path: `${DS}/bromic-logo-dark.png`, x: W - M - px(70), y: H - px(34), h: px(15), w: px(50) });
  return s;
}

const BANK_HEADS = [
  ['The wasted asset', 'Jokes only a premium, specified brand can tell'],
  ['The season, the house, the habit', 'Concepts 09–16'],
  ['Pushed harder on comedy', 'Concepts 17–24'],
  ['The long tail', 'Concepts 25–32'],
];
for (let g = 0; g < 4; g++) {
  const items = D.BANK.slice(g * 8, g * 8 + 8);
  if (items.length) grid(items, BANK_HEADS[g][0], BANK_HEADS[g][1]);
}
grid(D.TRADE.filter(t => t.g === 'B'), 'Builders, architects, remodellers',
     'Their currency is reputation, callbacks and referral');
grid(D.TRADE.filter(t => t.g === 'C'), 'Commercial operators',
     'Their currency is covers, reviews and labour');

/* ============================== CLOSE ============================== */
{
  const s = deck.addSlide();
  bleed(s, D.PLATES[0].img2);
  scrim(s, 0, H, 55);
  s.addImage({ path: `${DS}/bromic-logo-white.png`, x: M, y: px(44), h: px(30), w: px(102) });
  s.addText([{ text: 'The heater is 4% of the build', options: { color: WHITE, breakLine: true } },
             { text: 'and the difference between', options: { color: WHITE, breakLine: true } },
             { text: 'eleven months and two.', options: { color: EMBER, breakLine: false } }],
    { x: M, y: px(226), w: px(1060), h: px(210), fontFace: FONT, fontSize: 36, bold: true,
      lineSpacingMultiple: 1.14, valign: 'top', margin: 0 });
  s.addShape(deck.ShapeType.rect, { x: M, y: px(462), w: px(535), h: px(4), fill: { color: EMBER } });
  s.addText('Extend The Moment.', { x: M, y: px(488), w: px(700), h: px(38), fontFace: FONT,
    fontSize: 22, bold: true, color: WHITE, valign: 'middle', margin: 0 });
}

const OUT = '/tmp/claude-0/-home-user-Bizzing-Bee/4e23cfba-e7d7-5db3-a77c-4dd0a1079ba5/Extend-The-Moment.pptx';
deck.writeFile({ fileName: OUT }).then(() => console.log('WROTE', OUT, '·', deck.slides.length, 'slides'));

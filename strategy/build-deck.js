const pptx = require('pptxgenjs');
const p = new pptx();
p.layout = 'LAYOUT_WIDE';               // 13.3 x 7.5
p.author = 'Bizzing';
p.title  = 'Bizzing — Vision, Strategy & Organisation';

// ---- Bizzing design tokens, lifted from spellbound-app/tokens.css -------------
const INK    = '241E33';   // --ink
const VIOLET = '6C4FE0';   // --action
const VIOL_D = '4A31B0';   // darker violet for depth
const GOLD   = 'F0B429';   // --treasure
const GOLD_D = '8A5B00';   // --treasure-deep
const TINT   = 'EFEBF8';   // --tint
const TINT_D = 'E3DCF2';   // --tint-deep
const PAPER  = 'FFFFFF';
const GREEN  = '178A4C';   // --mastered
const MUTED  = '7A7291';

// Fraunces / Hanken Grotesk are the app's faces but ship on nobody's machine.
// Cambria + Calibri are the closest pair that render true everywhere.
const DISP = 'Cambria';
const BODY = 'Calibri';

const W = 13.3, H = 7.5, M = 0.7;

// ---- motif: the honeycomb. One element, repeated, never decorative filler ----
function hexField(s, opts) {
  const { x, y, n = 6, size = 0.62, color = VIOLET, transparency = 88, spread = 0.9 } = opts;
  for (let i = 0; i < n; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    s.addShape(p.ShapeType.hexagon, {
      x: x + col * spread + (row % 2 ? spread / 2 : 0),
      y: y + row * spread * 0.86,
      w: size, h: size,
      fill: { color, transparency },
      line: { type: 'none' },
      rotate: 90,
    });
  }
}

function hexBullet(s, x, y, label, color = VIOLET, ink = PAPER) {
  s.addShape(p.ShapeType.hexagon, {
    x, y, w: 0.42, h: 0.42, rotate: 90,
    fill: { color }, line: { type: 'none' },
  });
  s.addText(label, {
    x, y, w: 0.42, h: 0.42, align: 'center', valign: 'middle',
    fontFace: DISP, fontSize: 13, bold: true, color: ink, margin: 0,
  });
}

function darkSlide() {
  const s = p.addSlide();
  s.background = { color: INK };
  return s;
}
function lightSlide(title, kicker) {
  const s = p.addSlide();
  s.background = { color: PAPER };
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.44, w: 8, h: 0.28, fontFace: BODY, fontSize: 11.5, bold: true,
    color: VIOLET, charSpacing: 2.4, margin: 0,
  });
  if (title) s.addText(title, {
    x: M, y: 0.76, w: 11.6, h: 0.82, fontFace: DISP, fontSize: 29, bold: true,
    color: INK, margin: 0,
  });
  return s;
}
function card(s, o) {
  s.addShape(p.ShapeType.roundRect, {
    x: o.x, y: o.y, w: o.w, h: o.h, rectRadius: 0.14,
    fill: { color: o.fill || TINT }, line: { type: 'none' },
    shadow: { type: 'outer', color: INK, opacity: 0.10, blur: 10, offset: 2, angle: 90 },
  });
}

/* =====================  1 · TITLE  ===================== */
{
  const s = darkSlide();
  hexField(s, { x: 8.85, y: 0.62, n: 9, size: 1.0, color: GOLD, transparency: 84, spread: 1.25 });
  s.addText('BIZZING', {
    x: M, y: 2.0, w: 9, h: 1.3, fontFace: DISP, fontSize: 76, bold: true,
    color: PAPER, charSpacing: 2, margin: 0,
  });
  s.addText('Competitive learning for the children of the diaspora.', {
    x: M, y: 3.35, w: 8.4, h: 0.6, fontFace: DISP, fontSize: 21, italic: true,
    color: GOLD, margin: 0,
  });
  s.addText('Vision · Strategy · Roadmap · Marketing · Content · Organisation', {
    x: M, y: 4.25, w: 8.4, h: 0.4, fontFace: BODY, fontSize: 14, color: TINT_D, margin: 0,
  });
  s.addShape(p.ShapeType.line, { x: M, y: 5.15, w: 3.2, h: 0, line: { color: VIOLET, width: 2.5 } });
  s.addText('Founding team · AI-first operating model', {
    x: M, y: 5.35, w: 8, h: 0.35, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0,
  });
  s.addNotes('Bizzing is the parent brand. Bizzing Bee is the first product, not the company.');
}

/* =====================  2 · WHY NOW  ===================== */
{
  const s = lightSlide('They moved countries so their child could compete.', 'The starting point');
  s.addText('Everything Bizzing builds answers a worry that parent already has.', {
    x: M, y: 1.6, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 15.5, color: MUTED, margin: 0,
  });
  const items = [
    ['The school is not enough', 'Diaspora parents rarely believe the local curriculum is preparing their child for the contests, tests and admissions that actually decide outcomes.', VIOLET],
    ['The child is between two worlds', 'Expected to win at an adopted country’s competitions, and to keep a language and culture that country does not teach.', GOLD],
    ['The alternatives are poor', 'Photocopied worksheets, tutors at $60–100 an hour, or apps built for a general audience that do not understand this family at all.', GREEN],
  ];
  items.forEach(([h, b, c], i) => {
    const x = M + i * 4.03;
    card(s, { x, y: 2.35, w: 3.73, h: 3.0, fill: TINT });
    s.addShape(p.ShapeType.hexagon, { x: x + 0.3, y: 2.62, w: 0.5, h: 0.5, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.3, y: 3.3, w: 3.15, h: 0.62, fontFace: DISP, fontSize: 17, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: x + 0.3, y: 4.0, w: 3.15, h: 1.2, fontFace: BODY, fontSize: 12.5, color: '4A4360', margin: 0, lineSpacing: 16 });
  });
  s.addText('That worry is large, permanent, and currently served badly. It is the whole opportunity.', {
    x: M, y: 5.7, w: 11.6, h: 0.4, fontFace: DISP, fontSize: 16, italic: true, color: VIOLET, margin: 0,
  });
}

/* =====================  3 · VISION  ===================== */
{
  const s = darkSlide();
  hexField(s, { x: 0.2, y: 4.75, n: 6, size: 0.85, color: VIOLET, transparency: 80, spread: 1.2 });
  s.addText('VISION', {
    x: M, y: 1.0, w: 6, h: 0.35, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0,
  });
  s.addText('Every child of the diaspora walks into any room in the world already equipped to belong in it.', {
    x: M, y: 1.7, w: 10.6, h: 2.4, fontFace: DISP, fontSize: 40, bold: true, color: PAPER, margin: 0, lineSpacing: 46,
  });
  s.addText('Not "does well at school". Equipped — with the words, the numbers and the nerve to compete anywhere, and the language and history to know where they came from.', {
    x: M, y: 4.3, w: 9.6, h: 1.0, fontFace: BODY, fontSize: 15, color: TINT_D, margin: 0, lineSpacing: 22,
  });
  s.addNotes('The vision is deliberately about the child at 25, not the child at 10.');
}

/* =====================  4 · MISSION  ===================== */
{
  const s = lightSlide('Mission', 'What we do about it');
  card(s, { x: M, y: 1.55, w: 11.6, h: 1.35, fill: TINT });
  s.addText('To give diaspora families world-class competitive learning — starting with words — in products children actually want to open.', {
    x: M + 0.42, y: 1.75, w: 10.8, h: 0.95, fontFace: DISP, fontSize: 21, bold: true, color: INK, margin: 0, lineSpacing: 28,
  });
  const pillars = [
    ['Competitive, not remedial', 'We prepare children to win things, not to catch up. That is the register the parent is already in.'],
    ['Built for this family', 'Heritage, language and diaspora context are first-class, not a localisation afterthought.'],
    ['Fun enough to open unprompted', 'A product a child opens on their own beats a better product they have to be nagged into.'],
  ];
  pillars.forEach(([h, b], i) => {
    const x = M + i * 4.03;
    hexBullet(s, x, 3.32, String(i + 1), i === 1 ? GOLD : VIOLET, i === 1 ? INK : PAPER);
    s.addText(h, { x, y: 3.92, w: 3.6, h: 0.5, fontFace: DISP, fontSize: 16.5, bold: true, color: INK, margin: 0 });
    s.addText(b, { x, y: 4.46, w: 3.6, h: 1.2, fontFace: BODY, fontSize: 13, color: '4A4360', margin: 0, lineSpacing: 18 });
  });
  s.addText('Success is a child who is measurably better at something their parent cares about — and who did the practice willingly.', {
    x: M, y: 6.05, w: 11.6, h: 0.5, fontFace: BODY, fontSize: 13.5, italic: true, color: MUTED, margin: 0,
  });
}

/* =====================  5 · WHY / WHAT / HOW  ===================== */
{
  const s = lightSlide('Why, what, how', 'The three questions');
  const rows = [
    ['WHY', 'Because ability is not the constraint — access is.', 'These children are not short of talent or of parental will. They are short of good, affordable, culturally-fluent practice. Every hour a parent spends worrying is an hour we can convert into something the child enjoys.', VIOLET],
    ['WHAT', 'A house of competitive-learning products for ages 8–15.', 'One engine, many subjects. Spelling first, because it is the contest this community already organises around. Then the adjacent word products, then heritage language, then numeracy.', GOLD],
    ['HOW', 'AI-first, founder-run, content-owned.', 'Two founders and no agency. The product is built with AI coding tools, the marketing is produced with AI tools, and the content bank — which is the actual moat — is generated, verified and owned in-house.', GREEN],
  ];
  rows.forEach(([tag, head, body, c], i) => {
    const y = 1.62 + i * 1.72;
    card(s, { x: M, y, w: 11.6, h: 1.5, fill: i % 2 ? PAPER : TINT });
    s.addShape(p.ShapeType.hexagon, { x: M + 0.35, y: y + 0.42, w: 0.66, h: 0.66, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: M + 0.35, y: y + 0.42, w: 0.66, h: 0.66, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9.5, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    s.addText(head, { x: M + 1.35, y: y + 0.24, w: 9.9, h: 0.42, fontFace: DISP, fontSize: 18.5, bold: true, color: INK, margin: 0 });
    s.addText(body, { x: M + 1.35, y: y + 0.7, w: 9.9, h: 0.72, fontFace: BODY, fontSize: 12.8, color: '4A4360', margin: 0, lineSpacing: 17 });
  });
}

/* =====================  6 · STRATEGY  ===================== */
{
  const s = darkSlide();
  s.addText('STRATEGY', { x: M, y: 0.55, w: 6, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Win one contest completely, then reuse the engine.', {
    x: M, y: 0.98, w: 11.6, h: 0.8, fontFace: DISP, fontSize: 29, bold: true, color: PAPER, margin: 0,
  });
  const steps = [
    ['Wedge', 'Spelling bee', 'The one competition this community already organises around — and dominates. We do not have to create the demand or explain the category.'],
    ['Expand by engine reuse', 'Adjacent word products', 'Verbal reasoning, vocabulary and test prep run on the drill engine that already exists. New revenue, near-zero new infrastructure.'],
    ['Deepen the moat', 'Heritage language', 'The only category where the diaspora is the entire market rather than a slice of it. Hardest to copy, stickiest to own.'],
    ['Broaden the house', 'Numeracy & money', 'Bizzing Finance and mental-maths extend the brand past words once the word franchise is proven.'],
  ];
  steps.forEach(([tag, head, body], i) => {
    const x = M + i * 3.02;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.2, w: 2.78, h: 3.5, rectRadius: 0.13, fill: { color: PAPER, transparency: 92 }, line: { color: VIOLET, width: 1 } });
    hexBullet(s, x + 0.28, 2.48, String(i + 1), i === 0 ? GOLD : VIOLET, i === 0 ? INK : PAPER);
    s.addText(tag.toUpperCase(), { x: x + 0.28, y: 3.06, w: 2.3, h: 0.28, fontFace: BODY, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.6, margin: 0 });
    s.addText(head, { x: x + 0.28, y: 3.36, w: 2.3, h: 0.62, fontFace: DISP, fontSize: 17, bold: true, color: PAPER, margin: 0 });
    s.addText(body, { x: x + 0.28, y: 4.06, w: 2.3, h: 1.5, fontFace: BODY, fontSize: 11.5, color: TINT_D, margin: 0, lineSpacing: 15 });
  });
  s.addText('The sequencing rule: order by how much of the existing engine a product reuses — not by which market is biggest.', {
    x: M, y: 6.02, w: 11.6, h: 0.8, fontFace: DISP, fontSize: 15, italic: true, color: GOLD, margin: 0, lineSpacing: 21,
  });
}

/* =====================  7 · THE ENGINE  ===================== */
{
  const s = lightSlide('What already exists, and transfers', 'The asset');
  s.addText('Bizzing Bee is not one app. It is a content-drill engine with a spelling skin — and the engine is the company.', {
    x: M, y: 1.58, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0,
  });
  const stats = [
    ['128,491', 'words, every one\nspoken aloud'],
    ['31,000+', 'trivia questions across\n32 themes, 5 levels'],
    ['164', 'concept chapters,\nfree and advanced'],
    ['23', 'illustrated books,\n1,700 pages'],
  ];
  stats.forEach(([n, l], i) => {
    const x = M + i * 3.02;
    card(s, { x, y: 2.25, w: 2.78, h: 1.75, fill: TINT });
    s.addText(n, { x: x + 0.2, y: 2.42, w: 2.4, h: 0.78, fontFace: DISP, fontSize: 34, bold: true, color: VIOLET, margin: 0 });
    s.addText(l, { x: x + 0.2, y: 3.2, w: 2.4, h: 0.68, fontFace: BODY, fontSize: 12, color: '4A4360', margin: 0, lineSpacing: 15 });
  });
  const reuse = [
    ['Transfers as-is', 'Audio pipeline · adaptive progression · game layer · avatars & rewards · offline delivery', GREEN],
    ['Transfers with new content', 'Verbal reasoning · heritage vocabulary · mental maths · financial literacy', VIOLET],
    ['Does not transfer', 'Anything needing a solver, a rating system or a live teacher — chess, coding, music, dance', 'C4453C'],
  ];
  reuse.forEach(([h, b, c], i) => {
    const y = 4.35 + i * 0.72;
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.04, w: 0.34, h: 0.34, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(h, { x: M + 0.52, y, w: 2.9, h: 0.42, fontFace: DISP, fontSize: 14, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(b, { x: M + 3.4, y, w: 8.5, h: 0.42, fontFace: BODY, fontSize: 12.5, color: '4A4360', margin: 0, valign: 'middle' });
  });
}

/* =====================  8 · BRAND ARCHITECTURE  ===================== */
{
  const s = lightSlide('Brand architecture', 'The house');
  s.addText('Subjects are brands. Geography is a hook, not a second brand — and the hook is free so the pack inside it can be paid.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  s.addShape(p.ShapeType.roundRect, { x: 5.4, y: 2.18, w: 2.5, h: 0.72, rectRadius: 0.14, fill: { color: INK }, line: { type: 'none' } });
  s.addText('BIZZING', { x: 5.4, y: 2.18, w: 2.5, h: 0.72, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 21, bold: true, color: PAPER, charSpacing: 2, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 6.65, y: 2.9, w: 0, h: 0.34, line: { color: TINT_D, width: 2 } });
  s.addShape(p.ShapeType.line, { x: 2.0, y: 3.24, w: 9.3, h: 0, line: { color: TINT_D, width: 2 } });

  const cols = [
    { x: 0.75, w: 3.5, name: 'Bizzing Bee', sub: 'Spelling & words', tag: 'LIVE · PAID', c: GREEN,
      body: 'The wedge. Proven demand, an existing competition, and the engine everything else reuses.' },
    { x: 4.9, w: 3.5, name: 'Bizzing India', sub: 'Culture — the hook', tag: 'FREE', c: GOLD,
      body: 'Stories, festivals, mythology, the words English took from India. Free, shareable, and why a family arrives.' },
    { x: 9.05, w: 3.5, name: 'Bizzing Finance', sub: 'Money & numeracy', tag: 'IN FLIGHT', c: VIOLET,
      body: 'Extends the house past words, and reaches the age band where the bee stops.' },
  ];
  cols.forEach(col => {
    s.addShape(p.ShapeType.line, { x: col.x + col.w / 2, y: 3.24, w: 0, h: 0.36, line: { color: TINT_D, width: 2 } });
    card(s, { x: col.x, y: 3.6, w: col.w, h: 1.72, fill: TINT });
    s.addText(col.name, { x: col.x + 0.24, y: 3.78, w: col.w - 1.78, h: 0.42, fontFace: DISP, fontSize: 15.5, bold: true, color: INK, margin: 0 });
    s.addText(col.sub, { x: col.x + 0.24, y: 4.18, w: col.w - 0.48, h: 0.3, fontFace: BODY, fontSize: 12, color: VIOL_D, margin: 0 });
    s.addText(col.body, { x: col.x + 0.24, y: 4.5, w: col.w - 0.48, h: 0.75, fontFace: BODY, fontSize: 11.5, color: '4A4360', margin: 0, lineSpacing: 15 });
    s.addShape(p.ShapeType.roundRect, { x: col.x + col.w - 1.42, y: 3.74, w: 1.18, h: 0.3, rectRadius: 0.15, fill: { color: col.c }, line: { type: 'none' } });
    s.addText(col.tag, { x: col.x + col.w - 1.42, y: 3.74, w: 1.18, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: col.c === GOLD ? INK : PAPER, margin: 0 });
  });

  // Bhasha nests INSIDE the India hook — that is the whole point of the slide
  s.addShape(p.ShapeType.line, { x: 6.65, y: 5.32, w: 0, h: 0.3, line: { color: GOLD, width: 2 } });
  s.addShape(p.ShapeType.roundRect, { x: 4.9, y: 5.62, w: 3.5, h: 0.92, rectRadius: 0.14, fill: { color: 'FBF3E0' }, line: { color: GOLD, width: 1.5 } });
  s.addText('Bizzing Bhasha', { x: 5.14, y: 5.74, w: 1.88, h: 0.34, fontFace: DISP, fontSize: 15.5, bold: true, color: GOLD_D, margin: 0 });
  s.addShape(p.ShapeType.roundRect, { x: 7.1, y: 5.76, w: 1.06, h: 0.28, rectRadius: 0.14, fill: { color: GOLD_D }, line: { type: 'none' } });
  s.addText('PAID', { x: 7.1, y: 5.76, w: 1.06, h: 0.28, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: PAPER, margin: 0 });
  s.addText('Hindi first, then Tamil and Telugu. The pack the culture hook converts into.', { x: 5.14, y: 6.1, w: 3.0, h: 0.36, fontFace: BODY, fontSize: 10.5, color: GOLD_D, margin: 0, lineSpacing: 13 });

  s.addText('Naming rule to settle now: sub-brands are SUBJECTS. "Bizzing India" is the one exception and it earns it by being a free hook, not a market. There is no "Bizzing UK" — the UK gets an edition of Bizzing Eleven.', {
    x: M, y: 6.72, w: 11.6, h: 0.55, fontFace: BODY, fontSize: 11.5, italic: true, color: MUTED, margin: 0, lineSpacing: 15,
  });
  s.addNotes('Free culture hook -> paid language pack is the freemium spine. Culture is shareable; language is deep and worth paying for.');
}

/* =====================  9 · ROADMAP — BY MILESTONE  ===================== */
{
  const s = lightSlide('Roadmap, view one: by milestone', 'Sequence');
  s.addText('Nothing launches on a date. Each product unlocks when the one before it has proved something specific.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  const gates = [
    ['NOW', 'Bizzing Bee', 'Spelling, live', 'The wedge. Free app, paid packs, the YouTube channel feeding it.', GREEN],
    ['GATE 1', 'Bizzing India + Bhasha', 'Culture free, language paid', 'Unlocks when Bee shows a repeatable way to acquire a family and keep them past the first month.', GOLD],
    ['GATE 2', 'Bizzing Eleven / Prep', 'Exam verbal reasoning', 'Unlocks when a second paid pack proves families will buy more than one thing from us.', VIOLET],
    ['GATE 3', 'Bizzing Finance, older ages', 'Past the bee', 'Unlocks when households run more than one product on one account — the multi-product home.', VIOLET],
  ];
  const spineY = 3.05, CW = 2.76, GAP = 2.98;
  s.addShape(p.ShapeType.line, { x: M + CW / 2, y: spineY, w: GAP * 3, h: 0, line: { color: TINT_D, width: 3 } });
  gates.forEach(([tag, name, sub, why, c], i) => {
    const x = M + i * GAP, cx = x + CW / 2;
    s.addShape(p.ShapeType.hexagon, { x: cx - 0.28, y: spineY - 0.28, w: 0.56, h: 0.56, rotate: 90, fill: { color: c }, line: { color: PAPER, width: 2.5 } });
    s.addText(tag, { x, y: 2.3, w: CW, h: 0.3, align: 'center', fontFace: BODY, fontSize: 9.5, bold: true, color: c === GOLD ? GOLD_D : c, charSpacing: 1.6, margin: 0 });
    card(s, { x, y: 3.62, w: CW, h: 2.42, fill: i === 0 ? TINT : PAPER });
    if (i > 0) s.addShape(p.ShapeType.roundRect, { x, y: 3.62, w: CW, h: 2.42, rectRadius: 0.14, fill: { color: PAPER }, line: { color: TINT_D, width: 1.25 } });
    s.addText(name, { x: x + 0.22, y: 3.8, w: CW - 0.44, h: 0.62, fontFace: DISP, fontSize: 15, bold: true, color: INK, margin: 0 });
    s.addText(sub, { x: x + 0.22, y: 4.42, w: CW - 0.44, h: 0.3, fontFace: BODY, fontSize: 10.5, bold: true, color: VIOL_D, margin: 0 });
    s.addText(why, { x: x + 0.22, y: 4.76, w: CW - 0.44, h: 1.14, fontFace: BODY, fontSize: 10.5, color: '4A4360', margin: 0, lineSpacing: 13.5 });
  });
  s.addText('The gates are deliberately written as proofs, not targets — the numbers behind each one are the CMO’s to set.', {
    x: M, y: 6.28, w: 11.6, h: 0.5, fontFace: BODY, fontSize: 12.5, italic: true, color: MUTED, margin: 0,
  });
}

/* =====================  10 · ROADMAP — BY CHILD AGE  ===================== */
{
  const s = lightSlide('Roadmap, view two: by the age of the child', 'Coverage');
  s.addText('A family with three children is with Bizzing from the first child at four to the last at sixteen. The gaps are where we hand them back.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  const bands = [
    ['4–6', 'Letters, sounds,\nfirst words', 'Nothing yet', 'WHITE SPACE', 'C4453C',
     'Phonics, letter sounds, first-word games, Indian nursery stories. The child cannot read — so this is audio and pictures, which the engine already does.'],
    ['6–8', 'Reading fluency,\nfirst spelling', 'Bee, entry levels', 'PARTIAL', GOLD,
     'Bizzing Bee starts too hard for most six-year-olds. A gentler on-ramp keeps the younger sibling instead of losing them.'],
    ['8–10', 'Spelling bee,\nvocabulary, GK', 'Bizzing Bee', 'COVERED', GREEN,
     'The core. Everything built so far lands squarely here, and this is where the bee community lives.'],
    ['10–12', 'Peak bee, 11+,\ngifted testing', 'Bee · Eleven · Bhasha', 'COVERED', GREEN,
     'The highest-intent, highest-spend years. Three products can serve one child at once.'],
    ['12–16', 'Debate, essays,\nmoney, SAT words', 'Finance only', 'WHITE SPACE', 'C4453C',
     'The bee ends around fourteen and the family leaves. This is the churn cliff, and the biggest single gap in the house.'],
  ];
  bands.forEach(([age, need, have, tag, c, body], i) => {
    const x = M + i * 2.42;
    const w = 2.2;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.2, w, h: 0.62, rectRadius: 0.12, fill: { color: INK }, line: { type: 'none' } });
    s.addText(age, { x, y: 2.2, w, h: 0.62, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 19, bold: true, color: PAPER, margin: 0 });
    s.addText(need, { x: x + 0.1, y: 2.92, w: w - 0.2, h: 0.66, fontFace: BODY, fontSize: 11.5, bold: true, color: VIOL_D, margin: 0, lineSpacing: 14 });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.1, y: 3.66, w: w - 0.2, h: 0.3, rectRadius: 0.15, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: x + 0.1, y: 3.66, w: w - 0.2, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    s.addText(have, { x: x + 0.1, y: 4.02, w: w - 0.2, h: 0.32, fontFace: BODY, fontSize: 10.5, italic: true, color: MUTED, margin: 0 });
    s.addText(body, { x: x + 0.1, y: 4.4, w: w - 0.2, h: 1.55, fontFace: BODY, fontSize: 10.5, color: '4A4360', margin: 0, lineSpacing: 13.5 });
  });
  card(s, { x: M, y: 6.12, w: 11.6, h: 0.72, fill: TINT });
  s.addText('Bizzing’s job is never to hand a family back. Two gaps do exactly that today — the four-to-six on-ramp, and the cliff after the bee ends at fourteen. Both are product decisions, not marketing ones.', {
    x: M + 0.34, y: 6.12, w: 10.9, h: 0.72, fontFace: DISP, fontSize: 14, italic: true, color: INK, margin: 0, valign: 'middle', lineSpacing: 19,
  });
}

/* =====================  11 · MARKETING STRATEGY  ===================== */
{
  const s = darkSlide();
  s.addText('MARKETING STRATEGY', { x: M, y: 0.6, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Earn attention, prove it in person, then pay to scale it.', {
    x: M, y: 1.0, w: 11.6, h: 0.8, fontFace: DISP, fontSize: 27, bold: true, color: PAPER, margin: 0,
  });
  s.addText('The order matters more than the mix. Paid media applied to content nobody trusts yet is the fastest way to spend money badly.', {
    x: M, y: 1.8, w: 11.0, h: 0.55, fontFace: BODY, fontSize: 13.5, color: TINT_D, margin: 0,
  });
  const chans = [
    ['1', 'YouTube', 'Earns trust and reach', 'Long-form documentaries make a stranger believe we know words. Shorts put us in front of families no targeting could find. A video keeps working for years; an ad stops the day the card does.', GOLD],
    ['2', 'Events & community', 'Turns trust into proof', 'Regional bees, cultural associations, temple and community fairs, homeschool conferences — where this diaspora already gathers. Small reach, unmatched credibility. Parent WhatsApp groups are the real distribution channel.', VIOLET],
    ['3', 'Paid media', 'Scales what is proven', 'Harvests demand the content created and retargets the warmed. Creative comes from the channel, not from an agency. It amplifies; it does not originate.', GREEN],
    ['4', 'The child', 'Compounds all three', 'A child who likes the app tells other children, and a champion who used it is worth more than any campaign. The CKO role exists partly for this.', 'E3B23C'],
  ];
  chans.forEach(([n, name, role, body, c], i) => {
    const y = 2.45 + i * 1.08;
    hexBullet(s, M, y + 0.12, n, c, INK);
    s.addText(name, { x: M + 0.62, y: y + 0.02, w: 2.3, h: 0.38, fontFace: DISP, fontSize: 17, bold: true, color: PAPER, margin: 0 });
    s.addText(role, { x: M + 0.62, y: y + 0.42, w: 2.3, h: 0.3, fontFace: BODY, fontSize: 10.5, italic: true, color: c === 'E3B23C' ? GOLD : TINT_D, margin: 0 });
    s.addText(body, { x: M + 3.15, y, w: 8.75, h: 0.9, fontFace: BODY, fontSize: 11.5, color: TINT_D, margin: 0, lineSpacing: 15 });
  });
  s.addText('No budgets, targets or channel splits here by design — those are the CMO’s call. This slide fixes the ORDER, not the numbers.', {
    x: M, y: 6.85, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 11.5, italic: true, color: MUTED, margin: 0,
  });
}

/* =====================  12 · YOUTUBE — WHY  ===================== */
{
  const s = lightSlide('YouTube is not an ad channel', 'Content strategy · 1 of 3');
  s.addText('It is the only asset that earns trust while we sleep — and the one place a parent decides whether Bizzing is serious.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  const jobs = [
    ['Authority', 'A parent choosing where their child practises is really asking whether we know the subject. Ten minutes of well-made history about words answers that better than any landing page.', VIOLET],
    ['Discovery', 'The algorithm reaches families we could never target — the ones who do not yet know a product like this exists. That is reach we do not have to buy.', GOLD],
    ['An asset, not a spend', 'A documentary published this year is still working in five. Paid media stops the moment the card stops. Over time the channel becomes the cheapest acquisition we own.', GREEN],
  ];
  jobs.forEach(([h, b, c], i) => {
    const x = M + i * 4.03;
    card(s, { x, y: 2.3, w: 3.73, h: 2.5, fill: TINT });
    s.addShape(p.ShapeType.hexagon, { x: x + 0.3, y: 2.55, w: 0.46, h: 0.46, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.3, y: 3.14, w: 3.15, h: 0.44, fontFace: DISP, fontSize: 17, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: x + 0.3, y: 3.58, w: 3.15, h: 1.15, fontFace: BODY, fontSize: 11.5, color: '4A4360', margin: 0, lineSpacing: 15 });
  });
  s.addText('Two audiences, one video', { x: M, y: 4.92, w: 6, h: 0.4, fontFace: DISP, fontSize: 18, bold: true, color: INK, margin: 0 });
  const aud = [
    ['The parent decides.', 'They need to see rigour — real sources, real history, nothing that feels like a cartoon selling something.'],
    ['The child watches.', 'They need story and pace. If the child is bored the parent never finishes it either.'],
  ];
  aud.forEach(([h, b], i) => {
    const x = M + i * 5.9;
    s.addShape(p.ShapeType.hexagon, { x, y: 5.44, w: 0.3, h: 0.3, rotate: 90, fill: { color: i ? GOLD : VIOLET }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.44, y: 5.38, w: 5.0, h: 0.34, fontFace: BODY, fontSize: 13, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: x + 0.44, y: 5.72, w: 5.0, h: 0.7, fontFace: BODY, fontSize: 11.5, color: '4A4360', margin: 0, lineSpacing: 15 });
  });
  s.addText('The rule that follows: the video never sells. The product is named once, at the end, and that is the whole ask.', {
    x: M, y: 6.6, w: 11.6, h: 0.4, fontFace: DISP, fontSize: 14, italic: true, color: VIOLET, margin: 0,
  });
}

/* =====================  13 · YOUTUBE — PILLARS  ===================== */
{
  const s = lightSlide('Four content pillars', 'Content strategy · 2 of 3');
  s.addText('Each pillar does a different job in the funnel. Together they cover reach, trust and intent.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  const pil = [
    ['Story documentaries', 'Long form', 'True stories about words and the people who used them. "Before the Bee" — the 1908 contest and the girl whose medal was never found. "The Right Word" — four times somebody reached for a word and the world changed.', 'Authority. The piece a parent shares with another parent.', VIOLET],
    ['Word-origin shorts', 'Short form', 'One word, one surprising origin, under a minute. Why "knight" keeps a silent K. Why the menu says beef and the field says cow. Built straight from the app’s existing etymology bank.', 'Reach. Volume the algorithm can work with, at almost no marginal cost.', GOLD],
    ['Bee craft', 'Mid form', 'How champions actually study: root patterns, language-of-origin cues, what to ask the pronouncer, how to handle a word you have never seen.', 'Intent. These viewers are already preparing — the shortest path to a trial.', GREEN],
    ['Culture & India', 'Mixed', 'Festivals, mythology, the words English took from India, why the diaspora spells the way it does. Feeds Bizzing India directly.', 'Connection. The pillar that makes this channel ours and nobody else’s.', 'E3B23C'],
  ];
  pil.forEach(([name, form, body, job, c], i) => {
    const x = M + (i % 2) * 5.9, y = 2.2 + Math.floor(i / 2) * 2.2;
    card(s, { x, y, w: 5.55, h: 1.95, fill: i % 3 === 0 ? TINT : PAPER });
    if (i % 3 !== 0) s.addShape(p.ShapeType.roundRect, { x, y, w: 5.55, h: 1.95, rectRadius: 0.14, fill: { color: PAPER }, line: { color: TINT_D, width: 1.25 } });
    s.addShape(p.ShapeType.hexagon, { x: x + 0.26, y: y + 0.24, w: 0.42, h: 0.42, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(name, { x: x + 0.84, y: y + 0.2, w: 3.3, h: 0.4, fontFace: DISP, fontSize: 16, bold: true, color: INK, margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: x + 4.25, y: y + 0.26, w: 1.05, h: 0.28, rectRadius: 0.14, fill: { color: TINT_D }, line: { type: 'none' } });
    s.addText(form, { x: x + 4.25, y: y + 0.26, w: 1.05, h: 0.28, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: VIOL_D, margin: 0 });
    s.addText(body, { x: x + 0.26, y: y + 0.68, w: 5.05, h: 0.78, fontFace: BODY, fontSize: 11, color: '4A4360', margin: 0, lineSpacing: 14 });
    s.addText([{ text: 'Job:  ', options: { bold: true } }, { text: job }], {
      x: x + 0.26, y: y + 1.48, w: 5.05, h: 0.38, fontFace: BODY, fontSize: 10.5, italic: true, color: VIOL_D, margin: 0, lineSpacing: 13,
    });
  });
  s.addText('One documentary yields six to ten shorts, and a shorts run seeds a book chapter. Nothing is made once.', {
    x: M, y: 6.62, w: 11.6, h: 0.4, fontFace: DISP, fontSize: 14, italic: true, color: VIOLET, margin: 0,
  });
}

/* =====================  14 · YOUTUBE — HOW IT RUNS  ===================== */
{
  const s = lightSlide('How it runs, and where it lands', 'Content strategy · 3 of 3');
  s.addText('Production', { x: M, y: 1.6, w: 5, h: 0.36, fontFace: DISP, fontSize: 18, bold: true, color: INK, margin: 0 });
  const steps = ['Script written to one message, checked against sources',
                 'Narration generated and blind-verified for accent and words',
                 'Plates generated; archive photographs used where a real person appears',
                 'Assembled by the render pipeline, timed to the narration'];
  steps.forEach((t, i) => {
    const y = 2.08 + i * 0.62;
    hexBullet(s, M, y, String(i + 1), VIOLET, PAPER);
    s.addText(t, { x: M + 0.6, y, w: 5.1, h: 0.5, fontFace: BODY, fontSize: 11.5, color: '4A4360', margin: 0, valign: 'middle', lineSpacing: 14 });
  });
  card(s, { x: M, y: 4.66, w: 5.7, h: 0.92, fill: TINT });
  s.addText('Two episodes are already built this way, founder-run, with no editor, agency or studio.', {
    x: M + 0.28, y: 4.66, w: 5.14, h: 0.92, fontFace: BODY, fontSize: 11.5, italic: true, color: VIOL_D, margin: 0, valign: 'middle', lineSpacing: 15,
  });

  s.addText('The path from a video to a paying family', { x: 6.9, y: 1.6, w: 5.4, h: 0.36, fontFace: DISP, fontSize: 18, bold: true, color: INK, margin: 0 });
  const funnel = [
    ['Watches', 'A story worth ten minutes, or a short worth sixty seconds', VIOLET],
    ['Trusts', 'Sources on screen; nothing oversold; no pitch inside the film', VIOLET],
    ['Opens the app', 'One link in the description, free and instant — no signup wall', GOLD],
    ['Makes an account', 'Progress worth keeping is the reason, not a gate', GOLD],
    ['Buys a pack', 'Bhasha, Eleven, or Advanced — bought because the free part worked', GREEN],
  ];
  funnel.forEach(([h, b, c], i) => {
    const y = 2.08 + i * 0.72;
    s.addShape(p.ShapeType.hexagon, { x: 6.9, y: y + 0.06, w: 0.34, h: 0.34, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    if (i < funnel.length - 1) s.addShape(p.ShapeType.line, { x: 7.07, y: y + 0.42, w: 0, h: 0.3, line: { color: TINT_D, width: 1.5 } });
    s.addText(h, { x: 7.44, y, w: 1.5, h: 0.44, fontFace: BODY, fontSize: 12, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(b, { x: 8.95, y, w: 3.35, h: 0.5, fontFace: BODY, fontSize: 10.5, color: '4A4360', margin: 0, valign: 'middle', lineSpacing: 13 });
  });

  s.addShape(p.ShapeType.roundRect, { x: M, y: 5.88, w: 11.6, h: 1.0, rectRadius: 0.12, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText([{ text: 'Standing rules:  ', options: { bold: true } },
             { text: 'never sell inside a film · disclose what is generated and what is archive · name sources on screen · verify every claim before it is narrated · publish nothing that would embarrass the brand in front of a bee community that will recognise every error.' }], {
    x: M + 0.3, y: 5.88, w: 11.0, h: 1.0, fontFace: BODY, fontSize: 11.5, color: GOLD_D, margin: 0, valign: 'middle', lineSpacing: 15,
  });
}

/* =====================  15 · ORG CHART  ===================== */
{
  const s = lightSlide('Organisation', 'How the team is built');
  s.addText('Two co-founders run separate, clearly-owned lanes. Joint decisions are made at founder level. The third role is advisory and sits on top as a brand asset, not an operating function.', {
    x: M, y: 1.55, w: 11.6, h: 0.62, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0, lineSpacing: 19,
  });
  s.addShape(p.ShapeType.roundRect, { x: 4.9, y: 2.35, w: 3.5, h: 0.72, rectRadius: 0.14, fill: { color: INK }, line: { type: 'none' } });
  s.addText('FOUNDER GROUP', { x: 4.9, y: 2.35, w: 3.5, h: 0.72, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 15, bold: true, color: PAPER, charSpacing: 1.4, margin: 0 });
  s.addText('strategy · budget · brand direction', { x: 4.9, y: 3.1, w: 3.5, h: 0.28, align: 'center', fontFace: BODY, fontSize: 10.5, italic: true, color: MUTED, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 6.65, y: 3.42, w: 0, h: 0.36, line: { color: TINT_D, width: 2 } });
  s.addShape(p.ShapeType.line, { x: 3.0, y: 3.78, w: 7.3, h: 0, line: { color: TINT_D, width: 2 } });
  const boxes = [
    ['Aayush', 'Co-Founder & CPTO', 'Product · engineering · architecture · roadmap', VIOLET, 2.05],
    ['Amrita', 'Co-Founder & CMO', 'Brand · growth · pricing · merch · voice of customer', GOLD, 5.9],
    ['Ahana', 'Chief Kid Officer', 'End user · usability · ambassador (advisory)', GREEN, 9.75],
  ];
  boxes.forEach(([n, role, own, c, x]) => {
    s.addShape(p.ShapeType.line, { x: x + 0.95, y: 3.78, w: 0, h: 0.34, line: { color: TINT_D, width: 2 } });
    card(s, { x, y: 4.12, w: 1.9 * 1.0 + 0.0, h: 1.85, fill: TINT });
    s.addShape(p.ShapeType.hexagon, { x: x + 0.16, y: 4.3, w: 0.44, h: 0.44, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(n, { x: x + 0.7, y: 4.3, w: 1.1, h: 0.44, fontFace: DISP, fontSize: 17, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(role, { x: x + 0.16, y: 4.86, w: 1.62, h: 0.5, fontFace: BODY, fontSize: 11, bold: true, color: VIOL_D, margin: 0 });
    s.addText(own, { x: x + 0.16, y: 5.3, w: 1.62, h: 0.6, fontFace: BODY, fontSize: 10, color: '4A4360', margin: 0, lineSpacing: 13 });
  });
  s.addText('The operating principle: each lane decides independently inside its own scope. Product decisions do not route through marketing, and brand decisions do not route through engineering.', {
    x: M, y: 6.35, w: 11.6, h: 0.55, fontFace: BODY, fontSize: 12.5, italic: true, color: MUTED, margin: 0, lineSpacing: 17,
  });
}

/* =====================  16-18 · ROLES  ===================== */
const roles = [
  {
    name: 'Aayush', title: 'Co-Founder & Chief Product and Technology Officer', c: VIOLET,
    summary: 'Owns what Bizzing is, how it is built, and what ships next. Built the full web app AI-first — directing AI coding tools rather than hand-writing code — and runs product and engineering the same way.',
    owns: ['Product roadmap and prioritisation across every Bizzing product',
           'App architecture, infrastructure, technical quality and security',
           'Turning user feedback into shipped improvements',
           'Evaluating and adopting AI tooling that improves build speed or quality',
           'Content generation pipelines — the word bank, question bank and audio'],
    not: 'Brand, pricing and channel decisions route through the CMO.',
    metrics: [['Ship rate', 'Features shipped per month against roadmap'],
              ['Quality', 'Crash-free sessions; boot time held under target'],
              ['Engine reuse', '% of a new product built from existing components'],
              ['Feedback loop', '% of usability findings actioned']],
  },
  {
    name: 'Amrita', title: 'Co-Founder & Chief Marketing and Growth Officer', c: GOLD,
    summary: 'Owns everything that gets a family to discover Bizzing, decide to trust it, and want to buy something with the logo on it. Run AI-first and deliberately lean: no agency, no editorial headcount.',
    owns: ['Brand strategy — positioning, voice, visual identity, messaging',
           'Performance marketing — Meta and Google; owns CAC, ROAS and budget',
           'Marketing analytics — AI-built dashboards for funnel, cohort and channel',
           'Content and video, produced in-house with AI tools',
           'Pricing, merch, events, influencer partnerships',
           'Voice of customer — structured feedback and usability sessions'],
    not: 'Architecture, engineering roadmap and final call on features sit with the CPTO.',
    metrics: [['Acquisition', 'MoM qualified traffic growth; CAC down per channel'],
              ['Paid efficiency', 'ROAS target per platform; spend within budget'],
              ['Conversion', 'Free-to-paid rate; merch attach rate'],
              ['Content', 'Volume produced in-house; $0 on external editors']],
  },
  {
    name: 'Ahana', title: 'Chief Kid Officer — honorary and advisory', c: GREEN,
    summary: 'The reason Bizzing exists and its most credible voice. Represents the real end user: tests the app as part of her own bee preparation, says plainly what is fun, boring, confusing or broken.',
    owns: ['Uses the app for her own spelling preparation and gives honest feedback',
           'Tries new features first in usability sessions and reacts candidly',
           'Appears in kid-appropriate marketing, always with a parent involved',
           'Longer term: hosts beginner spelling sessions to build community'],
    not: 'Not an employment position. Schoolwork, her own bee prep and her own projects take priority.',
    metrics: [['Feedback quality', 'Specific usable notes, not "it’s good"'],
              ['Ambassador content', 'Genuine, comfortable approved appearances'],
              ['Community', 'Interest generated by beginner sessions']],
  },
];
roles.forEach(r => {
  const s = lightSlide(r.name, 'Role');
  s.addText(r.title, { x: M, y: 1.5, w: 11.6, h: 0.36, fontFace: BODY, fontSize: 14.5, bold: true, color: r.c === GOLD ? GOLD_D : r.c, margin: 0 });
  card(s, { x: M, y: 1.98, w: 11.6, h: 1.05, fill: TINT });
  s.addText(r.summary, { x: M + 0.34, y: 2.14, w: 10.9, h: 0.78, fontFace: BODY, fontSize: 13.5, color: '3A3352', margin: 0, lineSpacing: 18 });

  s.addText('OWNS', { x: M, y: 3.28, w: 4, h: 0.28, fontFace: BODY, fontSize: 10.5, bold: true, color: VIOLET, charSpacing: 2, margin: 0 });
  s.addText(r.owns.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < r.owns.length - 1 } })), {
    x: M + 0.05, y: 3.62, w: 6.6, h: 2.3, fontFace: BODY, fontSize: 12.5, color: '4A4360', margin: 0, paraSpaceAfter: 7, lineSpacing: 16,
  });

  s.addText('SUCCESS METRICS', { x: 7.6, y: 3.28, w: 4.7, h: 0.28, fontFace: BODY, fontSize: 10.5, bold: true, color: VIOLET, charSpacing: 2, margin: 0 });
  r.metrics.forEach(([k, v], i) => {
    const y = 3.62 + i * 0.62;
    s.addShape(p.ShapeType.hexagon, { x: 7.6, y: y + 0.05, w: 0.28, h: 0.28, rotate: 90, fill: { color: r.c }, line: { type: 'none' } });
    s.addText(k, { x: 8.0, y, w: 1.55, h: 0.36, fontFace: BODY, fontSize: 11.5, bold: true, color: INK, margin: 0, valign: 'middle' });
    s.addText(v, { x: 9.6, y, w: 3.0, h: 0.42, fontFace: BODY, fontSize: 11, color: '4A4360', margin: 0, valign: 'middle', lineSpacing: 14 });
  });

  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.15, w: 11.6, h: 0.62, rectRadius: 0.12, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText([{ text: 'Does not own:  ', options: { bold: true } }, { text: r.not }], {
    x: M + 0.3, y: 6.15, w: 11.0, h: 0.62, fontFace: BODY, fontSize: 12, color: GOLD_D, margin: 0, valign: 'middle',
  });
});

/* =====================  19 · DECISIONS  ===================== */
{
  const s = darkSlide();
  hexField(s, { x: 9.85, y: 4.45, n: 6, size: 0.8, color: GOLD, transparency: 82, spread: 1.0 });
  s.addText('WHAT WE DECIDE NEXT', { x: M, y: 0.75, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Four open questions, in the order they block work.', {
    x: M, y: 1.15, w: 11.6, h: 0.75, fontFace: DISP, fontSize: 29, bold: true, color: PAPER, margin: 0,
  });
  const qs = [
    ['Brand axis', 'Are the sub-brands subjects or geographies? Everything downstream — domains, marks, roadmap naming — waits on this.'],
    ['Second product', 'Bizzing Eleven is the fastest to ship because the engine already does it. Bizzing Bhasha is the more valuable business. Which first?'],
    ['Monetisation shape', 'One subscription across the house, or a price per product? Decide before the second product exists, not after.'],
    ['Entity & filings', 'LLC, trademark filings, and the child-performer question before any paid appearance by the CKO.'],
  ];
  qs.forEach(([h, b], i) => {
    const y = 2.2 + i * 1.06;
    hexBullet(s, M, y + 0.08, String(i + 1), GOLD, INK);
    s.addText(h, { x: M + 0.62, y, w: 2.6, h: 0.42, fontFace: DISP, fontSize: 16, bold: true, color: PAPER, margin: 0, valign: 'middle' });
    s.addText(b, { x: M + 3.3, y, w: 8.6, h: 0.72, fontFace: BODY, fontSize: 12.5, color: TINT_D, margin: 0, lineSpacing: 17 });
  });
  s.addText('Bizzing · bizzingbee.com', { x: M, y: 6.6, w: 6, h: 0.3, fontFace: BODY, fontSize: 11, color: MUTED, margin: 0 });
}

p.writeFile({ fileName: 'Bizzing-Strategy-Org.pptx' }).then(f => console.log('wrote', f));

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

// ---- the cast. Real avatar art from the app, not clip art ---------------------
// 217 painted avatars ship in spellbound-app/avatars/s as 192px PNG. Each product is
// cast with one whose meaning is not arbitrary: mic for Speak, Aryabhata for Maths,
// Saraswati for Bhasha, and a baby bee for Buzz so that Buzz -> Bee reads visually.
const fs = require('fs');
const AVDIR = '/home/user/Bizzing-Bee/spellbound-app/avatars/s/';
const _avCache = {};
function av(name) {
  if (!_avCache[name]) _avCache[name] = 'image/png;base64,' + fs.readFileSync(AVDIR + name + '.png').toString('base64');
  return _avCache[name];
}
const FACE = {
  'Bizzing Bee': 'bizzy', 'Bizzing India': 'ganesha', 'Bizzing Bhasha': 'saraswati',
  'Bizzing Eleven': 'brainiac', 'Bizzing Buzz': 'bumble', 'Bizzing English': 'gutenberg',
  'Bizzing Maths': 'aryabhatta', 'Bizzing Business': 'bossbot', 'Bizzing Quiz': 'einstein',
  'Bizzing Speak': 'mic', 'Bizzing Prep': 'newton',
};
function face(s, name, x, y, sz) {
  const f = FACE[name.replace('↳ ', '')];
  if (f) s.addImage({ data: av(f), x, y, w: sz, h: sz });
}

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
function lightSlide(title, kicker, titleW) {
  const s = p.addSlide();
  s.background = { color: PAPER };
  if (kicker) s.addText(kicker.toUpperCase(), {
    x: M, y: 0.44, w: 8, h: 0.28, fontFace: BODY, fontSize: 11.5, bold: true,
    color: VIOLET, charSpacing: 2.4, margin: 0,
  });
  if (title) s.addText(title, {
    x: M, y: 0.76, w: titleW || 11.6, h: 0.82, fontFace: DISP, fontSize: 29, bold: true,
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
  s.addImage({ data: av('bizzy'), x: 9.55, y: 2.15, w: 2.9, h: 2.9 });
  ['bolden', 'neuhauser', 'pbell', 'lucas'].forEach((n, i) =>
    s.addImage({ data: av(n), x: M + i * 1.02, y: 5.75, w: 0.92, h: 0.92 }));
  s.addText('BIZZING', {
    x: M, y: 2.0, w: 9, h: 1.3, fontFace: DISP, fontSize: 76, bold: true,
    color: PAPER, charSpacing: 2, margin: 0,
  });
  s.addText('Competitive learning for the children of the diaspora.', {
    x: M, y: 3.35, w: 8.4, h: 0.6, fontFace: DISP, fontSize: 21, italic: true,
    color: GOLD, margin: 0,
  });
  s.addText('Vision · Strategy · Roadmap · Money · Marketing · Content · Team', {
    x: M, y: 4.25, w: 8.4, h: 0.4, fontFace: BODY, fontSize: 14, color: TINT_D, margin: 0,
  });
  s.addShape(p.ShapeType.line, { x: M, y: 5.15, w: 3.2, h: 0, line: { color: VIOLET, width: 2.5 } });
  s.addText('Founding team · AI-first operating model', {
    x: M, y: 5.35, w: 8, h: 0.35, fontFace: BODY, fontSize: 12.5, color: MUTED, margin: 0,
  });
  s.addText('Marie Bolden · Frank Neuhauser · Pauline Bell · Dean Lucas — the first four champions, in the pack', {
    x: 4.9, y: 6.06, w: 7.4, h: 0.32, fontFace: BODY, fontSize: 10, italic: true, color: MUTED, margin: 0, valign: 'middle' });
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
  s.addText('Own the stage.', {
    x: M, y: 1.62, w: 9.4, h: 1.15, fontFace: DISP, fontSize: 62, bold: true, color: GOLD, margin: 0,
  });
  s.addText('Every stage in the world has one of our kids on it.', {
    x: M, y: 2.92, w: 10.2, h: 1.5, fontFace: DISP, fontSize: 36, bold: true, color: PAPER, margin: 0, lineSpacing: 44,
  });
  s.addText('A spelling bee is a child at a microphone under lights. So is a debate, a pitch, a boardroom and a parliament. We are not raising children who fit in quietly — we are raising the ones who take the mic.', {
    x: M, y: 4.62, w: 9.5, h: 1.05, fontFace: BODY, fontSize: 14.5, color: TINT_D, margin: 0, lineSpacing: 21,
  });
  s.addImage({ data: av('mic'), x: 10.35, y: 1.55, w: 2.1, h: 2.1 });
  s.addImage({ data: av('bolden'), x: 10.75, y: 3.75, w: 1.5, h: 1.5 });
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

/* =====================  8 · THE HOUSE  ===================== */
{
  const s = lightSlide('The house', 'Brand architecture');
  s.addText('Three families, one engine. Geography is a hook rather than a brand — which is why India is the only place-name here, and why it is free.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  s.addShape(p.ShapeType.roundRect, { x: 5.4, y: 2.12, w: 2.5, h: 0.64, rectRadius: 0.13, fill: { color: INK }, line: { type: 'none' } });
  s.addText('BIZZING', { x: 5.4, y: 2.12, w: 2.5, h: 0.64, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 20, bold: true, color: PAPER, charSpacing: 2, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 6.65, y: 2.76, w: 0, h: 0.3, line: { color: TINT_D, width: 2 } });
  s.addShape(p.ShapeType.line, { x: 2.5, y: 3.06, w: 8.3, h: 0, line: { color: TINT_D, width: 2 } });

  const fams = [
    { x: 0.7, name: 'WORDS', c: VIOLET,
      items: [['Bizzing Bee', 'live'], ['Bizzing Eleven', 'next'], ['Bizzing English', 'planned'],
              ['Bizzing Buzz', 'ages 4–6'], ['Bizzing Prep', 'gap'], ['Bizzing Speak', 'gap']] },
    { x: 4.83, name: 'CULTURE', c: GOLD,
      items: [['Bizzing India', 'free hook'], ['Bizzing Bhasha', 'paid pack']] },
    { x: 8.96, name: 'NUMBERS & THE WORLD', c: GREEN,
      items: [['Bizzing Maths', 'planned'], ['Bizzing Finance', 'in flight'],
              ['Bizzing Business', 'committed'], ['Bizzing Quiz', 'gap']] },
  ];
  fams.forEach(f => {
    const w = 3.63;
    s.addShape(p.ShapeType.line, { x: f.x + w / 2, y: 3.06, w: 0, h: 0.3, line: { color: TINT_D, width: 2 } });
    s.addShape(p.ShapeType.roundRect, { x: f.x, y: 3.36, w, h: 0.42, rectRadius: 0.1, fill: { color: f.c }, line: { type: 'none' } });
    s.addText(f.name, { x: f.x, y: 3.36, w, h: 0.42, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 10, bold: true, color: f.c === GOLD ? INK : PAPER, charSpacing: 1.6, margin: 0 });
    f.items.forEach(([n, tag], i) => {
      const y = 3.94 + i * 0.46;
      const indent = n === 'Bizzing Bhasha' ? 0.34 : 0;
      s.addShape(p.ShapeType.roundRect, { x: f.x + indent, y, w: w - indent, h: 0.38, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
      face(s, n, f.x + indent + 0.06, y + 0.02, 0.34);
      s.addText(n, { x: f.x + indent + 0.46, y, w: w - indent - 1.98, h: 0.38, valign: 'middle', fontFace: DISP, fontSize: 12.5, bold: true, color: INK, margin: 0 });
      s.addText(tag, { x: f.x + w - 1.42, y, w: 1.22, h: 0.38, align: 'right', valign: 'middle', fontFace: BODY, fontSize: 9, italic: true, color: VIOL_D, margin: 0 });
    });
  });
  s.addText('Twelve products named. Three already have real content behind them — Bee, India and Quiz — and the rest are still a sentence. The naming rule: sub-brands are SUBJECTS, so there is no Bizzing UK, only a UK edition of Bizzing Eleven.', {
    x: M, y: 6.72, w: 11.6, h: 0.55, fontFace: BODY, fontSize: 11.5, italic: true, color: MUTED, margin: 0, lineSpacing: 15,
  });
  s.addNotes('Culture is free and shareable; the language pack inside it is paid. That is the freemium spine.');
}

/* =====================  PRODUCT PAGES  ===================== */
const PRODUCTS = [
  { name: 'Bizzing Bee', status: ['LIVE', GREEN], age: 'Ages 8–14', reuse: 'The engine itself',
    vision: 'The best place in the world to prepare for a spelling bee.',
    why: 'The one competition this community already organises around, and dominates. The demand exists; we neither create it nor explain it.',
    what: '128,491 words with every one spoken aloud, a mapped journey, 164 concept chapters, an arcade, and a mock bee against ten simulated rivals.',
    how: 'Offline-first, no build step, no accounts required to start. Difficulty ramps on how tricky a spelling is, not on how rare the word is.',
    usp: ['Difficulty is measured by TRICKINESS, not rarity — a silent letter beats a long word. Nothing else on the market does this.',
          'Every one of 128k words is spoken. Competitors voice a curated few hundred.',
          'A mock bee with ten rivals who each have their own nerve, speciality and vocabulary skill.'],
    add: ['A gentler on-ramp so a six-year-old is not defeated on screen one',
          'Parent-facing progress reporting — today the parent cannot see what is happening',
          'Live and community bee events to convert the strongest users into advocates'] },

  { name: 'Bizzing India', status: ['SEEDED · FREE', GOLD], age: 'Ages 6–16', reuse: 'Concept + trivia engines',
    vision: 'A child who knows where they came from, and finds it genuinely interesting rather than dutiful.',
    why: 'Heritage is the one hook no product built for a general audience can copy. It is also the warmest reason a family arrives, and it costs them nothing to try.',
    what: 'Culture, festivals, mythology, geography, and the words English took from India. Free, shareable, and the doorway to the paid Bhasha packs.',
    how: 'Reuses the concept-chapter and trivia engines outright. It is a content programme, not a new build.',
    usp: ['A real seed already ships: southasia-data.js carries eleven authored chapters on South Asian words in English, live as Expedition IV of the Word Atlas and as Volume 14 of the book series.',
          'It teaches Sanskrit, Hindi and Tamil loanwords as a bee STRATEGY — say it, spell it, trust the vowels — not as a curiosity.'],
    add: ['Festival, mythology and India-GK packs on top of the language chapters',
          'A clear free/paid line, with Bhasha as the paid pack inside the free hook',
          'The funnel itself: what a family does next after finishing a free chapter'] },

  { name: 'Bizzing Bhasha', status: ['PLANNED · PAID', VIOLET], age: 'Ages 5–16', reuse: 'Audio pipeline, drills',
    vision: 'The grandparent and the grandchild can hold a conversation.',
    why: 'The deepest emotional driver in this market, and the only category where the diaspora is the entire market rather than a slice of it. Parents fear a child losing the family, not a school place.',
    what: 'Hindi first, then Tamil and Telugu. Script, vocabulary, listening and reading — sold as packs inside the free Bizzing India hook.',
    how: 'The Google TTS pipeline that voiced 128k English words does the expensive part again in another language.',
    usp: ['Nobody serious is aiming at diaspora heritage language with a real product — the field is Saturday schools and PDF worksheets.',
          'One brand across many Indian languages, rather than a separate app per language.'],
    add: ['A per-language content build — this is the real cost, and it repeats per language',
          'Non-Latin script rendering and input, which the app has never done',
          'A decision on which language ships second, on family demand rather than speaker counts'] },

  { name: 'Bizzing Eleven', status: ['NEXT', VIOLET], age: 'Ages 8–11', reuse: 'Near-total',
    vision: 'The 11+ verbal paper stops being a mystery a family has to buy tutoring to solve.',
    why: 'British Indian families spend heavily and start at eight. The incumbents are photocopied workbooks and past papers with no feedback loop.',
    what: 'Synonyms, antonyms, homophones, odd-one-out, word codes, letter manipulation and comprehension vocabulary — the verbal paper, drilled.',
    how: 'Closer to a re-skin than a new product. The homophone groups, diacritics, alternate pronunciations and the 128k library already exist.',
    usp: ['It would be the only 11+ verbal product where every word is spoken and difficulty adapts to the child rather than to the page number.'],
    add: ['The 11+ specific item types — codes, sequences, letter shifts',
          'A timed mock-paper mode, because the exam is as much about clock as vocabulary',
          'Mapping to what UK grammar schools actually set'] },

  { name: 'Bizzing Buzz', status: ['WHITE SPACE', 'C4453C'], age: 'Ages 4–6', reuse: 'Audio + art, not the UI',
    vision: 'A child who cannot read yet still plays with words every day.',
    why: 'The family arrives when the first child is four and Bizzing has nothing for them. The younger sibling is lost before they ever get to the Bee — this is the on-ramp gap on the age roadmap.',
    what: 'Letter sounds, phonics, rhyme, first words, picture-to-word matching, and Indian nursery stories read aloud.',
    how: 'Audio-first and picture-first, because the child cannot read the interface. The voice library and avatar art transfer; the reading-free UI does not exist and must be built.',
    usp: ['The buzz before the bee. A child graduates Buzz → Bee, which is the single strongest retention story in the house.',
          'Would be the only phonics product that is diaspora-aware from the first screen.'],
    add: ['A UI a pre-reader can operate — icons, audio prompts, very large targets',
          'A phonics curriculum, which the app has never had',
          'A parent-alongside mode, since a four-year-old does not practise alone'] },

  { name: 'Bizzing English', status: ['PLANNED', VIOLET], age: 'Ages 6–16', reuse: 'Concept engine; writing is new',
    vision: 'A child who owns the language, rather than one who passes tests in it.',
    why: 'Spelling is a wedge into English, not the whole of it. Grammar, reading and writing are what school actually grades — and the second thing every parent asks about.',
    what: 'Grammar, punctuation, comprehension, writing structure, idiom and register, on one continuous ladder from first sentence to essay.',
    how: 'The concept-chapter engine already teaches exactly this way, and the 43 advanced chapters are the template. Writing is the exception: it needs assessment, not drills.',
    usp: ['One continuous ladder instead of a workbook per school year — the child never restarts, and a sibling can join at their own rung.'],
    add: ['A grammar and punctuation curriculum',
          'A comprehension passage bank with questions',
          'A writing-feedback loop — the hardest single thing in the whole house, and the one to prototype before committing'] },

  { name: 'Bizzing Maths', status: ['PLANNED', VIOLET], age: 'Ages 6–14', reuse: 'Drills yes, problems no',
    vision: 'A child who is fast and fearless with numbers, and knows why the trick works.',
    why: 'Already named in the trademark filing. Mental maths and competition maths are the largest adjacent category to spelling in this community, and abacus and Vedic programmes already have the parents’ attention.',
    what: 'Fact fluency, mental-maths and Vedic techniques, then a decision about competition problems.',
    how: 'Fact drills reuse the engine almost exactly. Competition problems do NOT — they need worked solutions and a solver, which is a different product.',
    usp: ['Would be the only mental-maths product that also teaches the reasoning, using the same concept-chapter model as the Bee.'],
    add: ['A fact-fluency bank and a Vedic technique chapter set',
          'An honest decision on competition maths — it is the demand, and it is the part that does not reuse anything',
          'Numeric input and working-out capture, which the word engine has never needed'] },

  { name: 'Bizzing Business', status: ['COMMITTED', VIOLET], age: 'Ages 11–16', reuse: 'New shape, on purpose',
    vision: 'A sixteen-year-old who has built something, pitched it to a room, and can explain why it worked or why it did not.',
    why: 'This is the conversation these families already have at the dinner table, and nothing exists for children that is not a four-figure summer camp. It lands in the twelve-to-sixteen gap where the bee ends, it is the highest price a family will pay in the whole house, and it is the product that turns Bizzing from a practice app into the place a child grew up.',
    what: 'How a business makes money, customers, pricing, competition, brand, operations and ethics — taught through real cases, worked in small teams, and finished with a capstone the child builds and pitches at a demo day.',
    how: 'Cohorts with fixed start dates, teams of three or four, a trained mentor per cohort, recorded core lessons and live sessions. Teamwork and a real teacher are FEATURES here, not obstacles — they are the reason it works and the reason it cannot be cloned by software.',
    usp: ['A mentor network is a moat. Content can be copied in a quarter; a trained bench of coaches who know these families cannot.',
          'The capstone: the child makes and pitches something real. It is exactly what the CKO already does with slime, clay and loom bags — the product is that instinct, given structure.',
          'Demo day is a marketing asset as well as a lesson: parents in a room watching their own children present.'],
    add: ['A case library written for eleven-year-olds, and a cohort curriculum',
          'Teams, project submission and mentor review in the app — none of which exists today',
          'A mentor bench: recruited, trained, paid and quality-managed. This is a hiring plan, not a feature ticket',
          'Safeguarding for adults working with children — background checks, session recording, parent visibility'] },
];

PRODUCTS.forEach((pr, idx) => {
  const s = lightSlide(pr.name, `Product ${idx + 1} of ${PRODUCTS.length}`, 8.6);
  const [tag, tagC] = pr.status;
  face(s, pr.name, 10.95, 1.42, 1.35);
  s.addShape(p.ShapeType.roundRect, { x: 9.55, y: 0.82, w: 2.75, h: 0.42, rectRadius: 0.21, fill: { color: tagC }, line: { type: 'none' } });
  s.addText(tag, { x: 9.55, y: 0.82, w: 2.75, h: 0.42, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 10, bold: true, color: tagC === GOLD ? INK : PAPER, charSpacing: 1.2, margin: 0 });
  s.addText(pr.vision, { x: M, y: 1.58, w: 9.6, h: 0.64, fontFace: DISP, fontSize: 16, italic: true, color: VIOLET, margin: 0, lineSpacing: 21 });

  // left: why / what / how
  [['WHY', pr.why], ['WHAT', pr.what], ['HOW', pr.how]].forEach(([k, v], i) => {
    const y = 2.28 + i * 1.52;
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.02, w: 0.5, h: 0.5, rotate: 90, fill: { color: i === 1 ? GOLD : VIOLET }, line: { type: 'none' } });
    s.addText(k, { x: M, y: y + 0.02, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8.5, bold: true, color: i === 1 ? INK : PAPER, margin: 0 });
    s.addText(v, { x: M + 0.68, y, w: 4.5, h: 1.4, fontFace: BODY, fontSize: 11.5, color: '4A4360', margin: 0, lineSpacing: 15.5 });
  });

  // right: what makes it different / what must be built
  const uspLive = tag.startsWith('LIVE') || tag.startsWith('SEEDED');
  card(s, { x: 6.1, y: 2.24, w: 6.2, h: 2.3, fill: 'E8F4EC' });
  s.addText(uspLive ? 'WHAT MAKES IT DIFFERENT' : 'WHAT ITS EDGE WOULD BE', {
    x: 6.42, y: 2.4, w: 5.6, h: 0.28, fontFace: BODY, fontSize: 9, bold: true, color: GREEN, charSpacing: 1.8, margin: 0 });
  s.addText(pr.usp.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < pr.usp.length - 1 } })), {
    x: 6.46, y: 2.72, w: 5.55, h: 1.7, fontFace: BODY, fontSize: 10.5, color: '1F4A33', margin: 0, paraSpaceAfter: 6, lineSpacing: 14 });

  card(s, { x: 6.1, y: 4.72, w: 6.2, h: 2.3, fill: 'FBF3E0' });
  s.addText('WHAT STILL HAS TO BE BUILT', { x: 6.42, y: 4.88, w: 5.6, h: 0.28, fontFace: BODY, fontSize: 9, bold: true, color: GOLD_D, charSpacing: 1.8, margin: 0 });
  s.addText(pr.add.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < pr.add.length - 1 } })), {
    x: 6.46, y: 5.2, w: 5.55, h: 1.7, fontFace: BODY, fontSize: 10.5, color: GOLD_D, margin: 0, paraSpaceAfter: 6, lineSpacing: 14 });

  // footer facts
  s.addText([{ text: pr.age, options: { bold: true } }, { text: '   ·   engine reuse: ' }, { text: pr.reuse, options: { bold: true } }], {
    x: M, y: 6.86, w: 5.3, h: 0.34, fontFace: BODY, fontSize: 10.5, color: MUTED, margin: 0 });
  s.addNotes(`${pr.name} — ${pr.vision}`);
});

/* =====================  BIZZING BUSINESS — HOW IT RUNS  ===================== */
{
  const s = darkSlide();
  s.addText('BIZZING BUSINESS', { x: M, y: 0.58, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('The one product where the people are the moat.', {
    x: M, y: 0.98, w: 11.6, h: 0.75, fontFace: DISP, fontSize: 28, bold: true, color: PAPER, margin: 0,
  });
  s.addText('Everything else in the house is software a competitor could clone in a quarter. A trained bench of mentors who know these families cannot be cloned at all — which is exactly why this one is worth the extra difficulty.', {
    x: M, y: 1.78, w: 11.2, h: 0.55, fontFace: BODY, fontSize: 13, color: TINT_D, margin: 0, lineSpacing: 17,
  });

  const flow = [
    ['Cohort opens', 'Fixed start dates, not always-on. Scarcity is the point: a cohort has classmates, a calendar and an ending.'],
    ['Teams of three', 'The child works with others. Teamwork is a FEATURE — it is half of what a parent is buying and none of what an app usually gives.'],
    ['Cases, then build', 'Recorded lessons and real cases carry the theory. The team then builds something actual — a product, a service, a plan.'],
    ['Mentor review', 'A trained coach reviews the work against a rubric and meets the team live. This is the paid, human, uncopyable layer.'],
    ['Demo day', 'The team pitches to a room of parents. A lesson, a rite of passage, and the best marketing asset the brand will ever have.'],
  ];
  flow.forEach(([h, b], i) => {
    const x = M + i * 2.42, w = 2.2;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.55, w, h: 2.5, rectRadius: 0.13, fill: { color: PAPER, transparency: 92 }, line: { color: VIOLET, width: 1 } });
    hexBullet(s, x + 0.2, 2.78, String(i + 1), i === 3 ? GOLD : VIOLET, i === 3 ? INK : PAPER);
    s.addText(h, { x: x + 0.16, y: 3.34, w: w - 0.32, h: 0.56, fontFace: DISP, fontSize: 14, bold: true, color: PAPER, margin: 0 });
    s.addText(b, { x: x + 0.16, y: 3.92, w: w - 0.32, h: 1.0, fontFace: BODY, fontSize: 10, color: TINT_D, margin: 0, lineSpacing: 13 });
    if (i < flow.length - 1) s.addText('›', { x: x + w + 0.02, y: 3.42, w: 0.2, h: 0.44, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 20, bold: true, color: GOLD, margin: 0 });
  });

  const notes = [
    ['Where the mentors come from', 'This diaspora is full of MBAs, founders and operators whose own children are the target age. They will teach for status, for community, and because their kid is in the room. Recruit, train, pay, and manage quality — a hiring plan, not a feature ticket.', GOLD],
    ['Why it starts earliest of the late products', 'Content can be written in weeks. A trained mentor bench and a safeguarding process cannot. Business has the longest lead time in the house, so its build begins before its launch gate — the one product where that is true.', VIOLET],
  ];
  notes.forEach(([h, b, c], i) => {
    const x = M + i * 5.9;
    s.addShape(p.ShapeType.roundRect, { x, y: 5.25, w: 5.55, h: 1.5, rectRadius: 0.13, fill: { color: PAPER, transparency: 94 }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.28, y: 5.4, w: 5.0, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: c, charSpacing: 1.4, margin: 0 });
    s.addText(b, { x: x + 0.28, y: 5.7, w: 5.0, h: 0.92, fontFace: BODY, fontSize: 10.5, color: TINT_D, margin: 0, lineSpacing: 13.5 });
  });
  s.addText('It is also the answer to the live-training revenue line — Business IS that line, not a separate venture. And safeguarding is not optional: adults working with children needs checks, recorded sessions and parent visibility from day one.', {
    x: M, y: 6.88, w: 11.6, h: 0.45, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0,
  });
  s.addNotes('The user pushed back on treating "needs teachers" as a risk. It is the moat. Build it.');
}

/* =====================  WHAT WE ARE STILL MISSING  ===================== */
{
  const s = darkSlide();
  s.addText('THE GAPS', { x: M, y: 0.6, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Three products missing, and four we should not build.', {
    x: M, y: 1.0, w: 11.6, h: 0.75, fontFace: DISP, fontSize: 27, bold: true, color: PAPER, margin: 0,
  });
  const missing = [
    ['Bizzing Speak', 'Public speaking, debate, spoken English', 'The strongest omission. It fills the twelve-to-sixteen cliff, it is the largest education category in India by search, and it is the same subject the YouTube channel already makes films about. The catch: doing it properly needs the app to LISTEN and score pronunciation, which is speech recognition and not in the engine.'],
    ['Bizzing Quiz', 'General knowledge, quiz-bowl', 'The cheapest product in the house to launch: 31,000 questions across 32 themes and 5 levels already exist and are already sharded and levelled. It is a skin and a scoring loop, not a build.'],
    ['Bizzing Prep', 'US gifted and selective entry', 'CogAT, NNAT, OLSAT verbal and SHSAT vocabulary. The highest-anxiety, highest-spend segment in the US, and the incumbent products are poor. Sits beside Eleven and shares its item types.'],
  ];
  missing.forEach(([n, sub, body], i) => {
    const x = M + i * 4.03;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.0, w: 3.73, h: 3.15, rectRadius: 0.14, fill: { color: PAPER, transparency: 92 }, line: { color: VIOLET, width: 1 } });
    face(s, n, x + 0.28, 2.2, 0.72);
    s.addText(n, { x: x + 0.28, y: 2.98, w: 3.15, h: 0.4, fontFace: DISP, fontSize: 17, bold: true, color: PAPER, margin: 0 });
    s.addText(sub, { x: x + 0.28, y: 3.36, w: 3.15, h: 0.32, fontFace: BODY, fontSize: 10.5, italic: true, color: GOLD, margin: 0 });
    s.addText(body, { x: x + 0.28, y: 3.7, w: 3.15, h: 1.34, fontFace: BODY, fontSize: 10, color: TINT_D, margin: 0, lineSpacing: 13 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 5.42, w: 11.6, h: 1.28, rectRadius: 0.12, fill: { color: PAPER, transparency: 94 }, line: { type: 'none' } });
  s.addText('Deliberately NOT building', { x: M + 0.32, y: 5.56, w: 5, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: 'E8807A', charSpacing: 1.8, margin: 0 });
  s.addText('Coding · chess · music · dance. Every one has real diaspora demand, and every one needs a solver, a rating system or a live teacher. None of them reuses a single line of what has been built, and each would be a company of its own. Chess in particular is surging right now and is still the wrong answer for this house.', {
    x: M + 0.32, y: 5.9, w: 10.95, h: 0.7, fontFace: BODY, fontSize: 11.5, color: TINT_D, margin: 0, lineSpacing: 15,
  });
  s.addText('The refusals are about ENGINE FIT, not ambition. Bizzing Business also needs people, and it is being built — because there the people ARE the product.', {
    x: M, y: 6.84, w: 11.6, h: 0.55, fontFace: DISP, fontSize: 13.5, italic: true, color: GOLD, margin: 0,
  });
}

/* =====================  9 · ROADMAP — BY MILESTONE  ===================== */
{
  const s = lightSlide('Roadmap, view one: by milestone', 'Sequence');
  s.addText('Nothing launches on a date. Each product unlocks when the one before it has proved something specific.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });
  const gates = [
    ['NOW', 'Bizzing Bee', 'Spelling, live', 'The wedge. Free app, paid packs, the YouTube channel feeding it.', GREEN],
    ['GATE 1', 'India + Bhasha + Quiz', 'Culture free, language paid', 'Unlocks when Bee shows a repeatable way to acquire a family and keep them past the first month. Quiz rides along — its 31k questions already exist.', GOLD],
    ['GATE 2', 'Eleven, then Prep', 'Exam verbal reasoning', 'Unlocks when a second paid pack proves families will buy more than one thing from us. Near-total engine reuse, so the cost is content, not build.', VIOLET],
    ['GATE 3', 'Both ends of the range', 'Buzz · Speak · English · Maths · Finance', 'Closes the 4–6 and 12–16 gaps, once households run more than one product on one account. Business is the exception — its mentor bench takes so long to build that recruiting starts back at Gate 1.', VIOLET],
  ];
  const spineY = 3.05, CW = 2.76, GAP = 2.98;
  s.addShape(p.ShapeType.line, { x: M + CW / 2, y: spineY, w: GAP * 3, h: 0, line: { color: TINT_D, width: 3 } });
  gates.forEach(([tag, name, sub, why, c], i) => {
    const x = M + i * GAP, cx = x + CW / 2;
    s.addShape(p.ShapeType.hexagon, { x: cx - 0.28, y: spineY - 0.28, w: 0.56, h: 0.56, rotate: 90, fill: { color: c }, line: { color: PAPER, width: 2.5 } });
    s.addText(tag, { x, y: 2.3, w: CW, h: 0.3, align: 'center', fontFace: BODY, fontSize: 9.5, bold: true, color: c === GOLD ? GOLD_D : c, charSpacing: 1.6, margin: 0 });
    card(s, { x, y: 3.62, w: CW, h: 2.56, fill: i === 0 ? TINT : PAPER });
    if (i > 0) s.addShape(p.ShapeType.roundRect, { x, y: 3.62, w: CW, h: 2.56, rectRadius: 0.14, fill: { color: PAPER }, line: { color: TINT_D, width: 1.25 } });
    s.addText(name, { x: x + 0.22, y: 3.8, w: CW - 0.44, h: 0.6, fontFace: DISP, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(sub, { x: x + 0.22, y: 4.4, w: CW - 0.44, h: 0.44, fontFace: BODY, fontSize: 9.5, bold: true, color: VIOL_D, margin: 0, lineSpacing: 12 });
    s.addText(why, { x: x + 0.22, y: 4.84, w: CW - 0.44, h: 1.24, fontFace: BODY, fontSize: 9.5, color: '4A4360', margin: 0, lineSpacing: 13.5 });
  });
  s.addText('Gates are written as proofs, not targets — the numbers behind each are the CMO’s. Nothing at Gate 3 starts until Gate 2 has paid for itself.', {
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
    ['4–6', 'Letters, sounds,\nfirst words', 'Buzz — to build', 'GAP, NAMED', 'C4453C',
     'Bizzing Buzz. Audio and pictures, because the child cannot read the interface. The voice library transfers; the reading-free UI does not exist yet.'],
    ['6–8', 'Reading fluency,\nfirst spelling', 'Bee entry · Buzz · English', 'PARTIAL', GOLD,
     'Bee starts too hard for most six-year-olds. Buzz→Bee is the bridge, and it is the strongest retention story in the house.'],
    ['8–10', 'Spelling bee,\nvocabulary, GK', 'Bee · India · Quiz · Maths', 'COVERED', GREEN,
     'The core. Everything built so far lands squarely here, and this is where the bee community lives.'],
    ['10–12', 'Peak bee, 11+,\ngifted testing', 'Bee · Eleven · Prep\nBhasha · English', 'COVERED', GREEN,
     'The highest-intent, highest-spend years. Four products can serve one child at once, on one account.'],
    ['12–16', 'Debate, essays,\nmoney, business', 'Speak · Business\nFinance · English', 'GAP, NAMED', 'C4453C',
     'The bee ends around fourteen and the family leaves. Four products aim here and not one of them is built. The churn cliff is still open.'],
  ];
  bands.forEach(([age, need, have, tag, c, body], i) => {
    const x = M + i * 2.42;
    const w = 2.2;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.2, w, h: 0.62, rectRadius: 0.12, fill: { color: INK }, line: { type: 'none' } });
    s.addText(age, { x, y: 2.2, w, h: 0.62, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 19, bold: true, color: PAPER, margin: 0 });
    s.addText(need, { x: x + 0.1, y: 2.92, w: w - 0.2, h: 0.66, fontFace: BODY, fontSize: 11.5, bold: true, color: VIOL_D, margin: 0, lineSpacing: 14 });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.1, y: 3.66, w: w - 0.2, h: 0.3, rectRadius: 0.15, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: x + 0.1, y: 3.66, w: w - 0.2, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    s.addText(have, { x: x + 0.1, y: 4.02, w: w - 0.2, h: 0.46, fontFace: BODY, fontSize: 10, italic: true, color: MUTED, margin: 0, lineSpacing: 12 });
    s.addText(body, { x: x + 0.1, y: 4.54, w: w - 0.2, h: 1.45, fontFace: BODY, fontSize: 10, color: '4A4360', margin: 0, lineSpacing: 13.5 });
  });
  card(s, { x: M, y: 6.12, w: 11.6, h: 0.72, fill: TINT });
  s.addText('Bizzing’s job is never to hand a family back. Both gaps now have product names against them — but a name is not a build, and until Buzz and Speak exist the family still walks out at four and again at fourteen.', {
    x: M + 0.34, y: 6.12, w: 10.9, h: 0.72, fontFace: DISP, fontSize: 14, italic: true, color: INK, margin: 0, valign: 'middle', lineSpacing: 19,
  });
}

/* =====================  11 · MONETISATION  ===================== */
{
  const s = lightSlide('How Bizzing earns, and when', 'Monetisation · years one to five');
  s.addText('Six streams. Two of them can start almost immediately because the asset already exists — the books are written and the avatar art is drawn.', {
    x: M, y: 1.58, w: 11.6, h: 0.56, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0,
  });

  const NX = M, NW = 4.55, CX = [5.3, 7.8, 10.3], CW = 2.3;
  ['YEAR 1', 'YEARS 2–3', 'YEARS 4–5'].forEach((h, i) => {
    s.addText(h, { x: CX[i], y: 2.18, w: CW, h: 0.3, align: 'center', fontFace: BODY, fontSize: 10, bold: true, color: VIOL_D, charSpacing: 1.8, margin: 0 });
  });

  // start = index of the year column a stream switches on; '' = not yet
  const LAUNCH = ['LAUNCH', GREEN], GROW = ['GROW', VIOLET], SCALE = ['SCALE', GOLD];
  const rows = [
    ['Subscription & packs', 'Advanced, Bhasha, Eleven. The compounding line — everything else is a supplement to it.', [LAUNCH, GROW, SCALE]],
    ['Books', '23 volumes and 1,700 pages already generated. Print-on-demand and ebook carry no inventory risk.', [LAUNCH, GROW, SCALE]],
    ['Playable avatar cards', 'The trump-card deck already exists in-app, and every card carries a real word fact. A physical product that still teaches.', [null, LAUNCH, GROW]],
    ['Plushies, tees, goodies', 'Bizzy and the champion avatars. Print-on-demand first; stock only what has already sold.', [null, LAUNCH, GROW]],
    ['YouTube', 'Ad revenue and sponsorship. Worth having, but its real return is acquisition — count it as marketing that pays for itself.', [null, GROW, GROW]],
    ['Live training', 'Bizzing Business cohorts, bee coaching, beginner classes. Highest price per family — and Business IS this line, not a separate venture.', [null, GROW, LAUNCH]],
  ];

  rows.forEach(([name, note, cells], i) => {
    const y = 2.56 + i * 0.69;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: NX - 0.14, y: y - 0.06, w: 12.02, h: 0.63, rectRadius: 0.1, fill: { color: TINT }, line: { type: 'none' } });
    s.addText(name, { x: NX, y: y - 0.02, w: NW, h: 0.28, fontFace: DISP, fontSize: 13.5, bold: true, color: INK, margin: 0 });
    s.addText(note, { x: NX, y: y + 0.25, w: NW, h: 0.36, fontFace: BODY, fontSize: 9.5, color: '4A4360', margin: 0, lineSpacing: 11.5 });
    cells.forEach((cell, k) => {
      if (!cell) return;
      const [label, c] = cell;
      s.addShape(p.ShapeType.roundRect, { x: CX[k] + 0.45, y: y + 0.11, w: 1.4, h: 0.3, rectRadius: 0.15, fill: { color: c }, line: { type: 'none' } });
      s.addText(label, { x: CX[k] + 0.45, y: y + 0.11, w: 1.4, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    });
  });

  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.7, w: 11.6, h: 0.62, rectRadius: 0.12, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText([{ text: 'Two cautions:  ', options: { bold: true } },
             { text: 'merch that holds stock is a different business — cash, sizes, returns — so print-on-demand until something proves itself. And live training is capped by people, not by software, which is why the mentor bench for Bizzing Business has to start being recruited long before the product launches.' }], {
    x: M + 0.3, y: 6.7, w: 11.0, h: 0.62, fontFace: BODY, fontSize: 10.5, color: GOLD_D, margin: 0, valign: 'middle', lineSpacing: 13,
  });
  s.addNotes('No prices, splits or targets anywhere — those are the CMO’s to set. This slide fixes what the streams are and the order they switch on.');
}

/* =====================  12 · MARKETING STRATEGY  ===================== */
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

/* =====================  13 · YOUTUBE — WHY  ===================== */
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

/* =====================  14 · YOUTUBE — PILLARS  ===================== */
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

/* =====================  15 · YOUTUBE — HOW IT RUNS  ===================== */
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

/* =====================  16 · ORG CHART  ===================== */
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

/* =====================  17-19 · ROLES  ===================== */
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

/* ==========================================================================
   BUSINESS MODEL — eleven slides, rebuilt to a single constraint: the business
   must be profitable from week one and must never require outside cash.

   Two structural rules deliver that, and both are printed on the slides:
     (1) ANNUAL-UPFRONT billing — cash arrives before the service is delivered.
     (2) Every discretionary cost is a PERCENTAGE OF TRAILING REVENUE, not a
         fixed budget. A cost line cannot outrun the income that funds it.

   Every figure here is computed by strategy/model.py, not typed by hand, and
   that script asserts positive EBITDA in all five years and in week one. If a
   number on a slide disagrees with the script, the script is right.

   ⚠️ Benchmark competitor prices are from working knowledge, NOT from live
   pricing pages — this environment cannot browse. The slide says so.
   ========================================================================== */

const money = v => Math.abs(v) >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${Math.round(v / 1e3)}k`;

/* -------------------  1 · THE BUSINESS MODEL  ------------------- */
{
  const s = darkSlide();
  s.addImage({ data: av('bizzy'), x: 11.0, y: 0.5, w: 1.55, h: 1.55 });
  s.addText('THE BUSINESS MODEL', { x: M, y: 0.6, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Free to arrive. Paid to go deep. Human where it matters.', {
    x: M, y: 1.0, w: 10.6, h: 0.95, fontFace: DISP, fontSize: 28, bold: true, color: PAPER, margin: 0,
  });
  s.addText('The unit is the HOUSEHOLD, not the child, and the competitor is the tutor, not the app. A family with three children buys once and stays twelve years — which is why every price is a family price, and why the age gaps cost more than any conversion rate.', {
    x: M, y: 2.0, w: 10.6, h: 0.72, fontFace: BODY, fontSize: 12.5, color: TINT_D, margin: 0, lineSpacing: 16,
  });
  const layers = [
    ['FREE', 'Arrive', 'Bizzing Bee core · Bizzing India culture · the YouTube channel. No card, no signup wall. This layer exists to be shared.', GOLD],
    ['SUBSCRIPTION', 'Go deep', 'Per-product packs, or one family plan across the house. Billed annually up front — the decision that makes week one cash-positive.', VIOLET],
    ['COHORT', 'Be taught', 'Bizzing Business, bee coaching, beginner classes. Highest price per family, capped by people rather than by servers.', GREEN],
    ['PHYSICAL & MEDIA', 'Take it home', 'Books, avatar cards, plushies and tees; YouTube ad and sponsorship. Margin support, and a brand a child can hold.', 'E3B23C'],
  ];
  layers.forEach(([tag, verb, body, c], i) => {
    const y = 2.78 + i * 1.0;
    s.addShape(p.ShapeType.roundRect, { x: M, y, w: 2.4, h: 0.88, rectRadius: 0.11, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: M, y: y + 0.12, w: 2.4, h: 0.3, align: 'center', fontFace: BODY, fontSize: 9.5, bold: true, color: c === VIOLET || c === GREEN ? PAPER : INK, charSpacing: 1.4, margin: 0 });
    s.addText(verb, { x: M, y: y + 0.43, w: 2.4, h: 0.34, align: 'center', fontFace: DISP, fontSize: 15, bold: true, color: c === VIOLET || c === GREEN ? PAPER : INK, margin: 0 });
    s.addText(body, { x: M + 2.72, y: y + 0.04, w: 9.0, h: 0.8, fontFace: BODY, fontSize: 12, color: TINT_D, margin: 0, lineSpacing: 16 });
  });
  s.addText('Everything after this slide derives from one assumption block, printed in full at the end — so any number can be argued with by changing an input rather than by disbelieving a chart.', {
    x: M, y: 6.86, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0,
  });
}

/* -------------------  2 · PROFITABLE FROM WEEK ONE  ------------------- */
{
  const s = darkSlide();
  hexField(s, { x: 10.9, y: 5.5, n: 3, size: 0.7, color: GREEN, transparency: 82, spread: 0.88 });
  s.addText('THE CONSTRAINT', { x: M, y: 0.55, w: 8, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Profitable in week one. No outside cash, in any year.', {
    x: M, y: 0.92, w: 11.4, h: 0.9, fontFace: DISP, fontSize: 30, bold: true, color: PAPER, margin: 0,
  });
  s.addText('This is not a forecast that happens to turn positive. It is a cost structure built so that it cannot turn negative.', {
    x: M, y: 1.84, w: 11.4, h: 0.36, fontFace: BODY, fontSize: 13, color: TINT_D, margin: 0,
  });

  // --- the week-one arithmetic, in full ---
  s.addShape(p.ShapeType.roundRect, { x: M, y: 2.36, w: 5.2, h: 2.72, rectRadius: 0.14, fill: { color: PAPER, transparency: 92 }, line: { type: 'none' } });
  s.addText('WEEK ONE, IN FULL', { x: M + 0.28, y: 2.5, w: 4.6, h: 0.28, fontFace: BODY, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.8, margin: 0 });
  const wk = [
    ['4 households × $250, billed annually', '+$1,000', GREEN, true],
    ['Paid media — 18% of that revenue', '−$180', TINT_D, false],
    ['Content & tools — weekly share', '−$208', TINT_D, false],
    ['Payment fees — 3.5%', '−$35', TINT_D, false],
    ['Hosting', '−$4', TINT_D, false],
    ['G&A — weekly share', '−$40', TINT_D, false],
  ];
  wk.forEach(([l, v, c, strong], i) => {
    const y = 2.86 + i * 0.31;
    s.addText(l, { x: M + 0.28, y, w: 3.5, h: 0.28, valign: 'middle', fontFace: BODY, fontSize: 10, bold: strong, color: strong ? PAPER : TINT_D, margin: 0 });
    s.addText(v, { x: M + 3.7, y, w: 1.2, h: 0.28, align: 'right', valign: 'middle', fontFace: BODY, fontSize: 10.5, bold: true, color: c, margin: 0 });
  });
  s.addShape(p.ShapeType.line, { x: M + 0.28, y: 4.76, w: 4.62, h: 0, line: { color: PAPER, width: 1, transparency: 60 } });
  s.addText('Week-one profit', { x: M + 0.28, y: 4.82, w: 3.0, h: 0.34, valign: 'middle', fontFace: DISP, fontSize: 13, bold: true, color: PAPER, margin: 0 });
  s.addText('+$533', { x: M + 3.2, y: 4.8, w: 1.7, h: 0.36, align: 'right', valign: 'middle', fontFace: DISP, fontSize: 21, bold: true, color: GREEN, margin: 0 });

  // --- the three rules that make it structural ---
  s.addText('THE THREE RULES', { x: 6.4, y: 2.5, w: 6, h: 0.28, fontFace: BODY, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.8, margin: 0 });
  const rules = [
    ['1', 'Bill the year up front', 'Cash arrives before the service is delivered. A household that joins in January funds twelve months of its own cost on the day it joins.'],
    ['2', 'Every discretionary cost is a % of revenue', 'Paid media 18%. Content and tools 12%. Mentors 50% of cohort revenue only. COGS 55% of physical revenue only. These are not budgets — they are fractions, and a fraction of income cannot exceed income.'],
    ['3', 'Fixed cost stays smaller than one week of sales', 'G&A and hosting total $2.1k in Year 1 — $40 a week against $1,000 of weekly revenue. Nothing else is fixed.'],
  ];
  rules.forEach(([n, h, b], i) => {
    const y = 2.86 + i * 0.76;
    hexBullet(s, 6.4, y, n, i === 1 ? GOLD : VIOLET, i === 1 ? INK : PAPER);
    s.addText(h, { x: 6.98, y: y - 0.03, w: 5.6, h: 0.28, fontFace: DISP, fontSize: 13, bold: true, color: PAPER, margin: 0 });
    s.addText(b, { x: 6.98, y: y + 0.23, w: 5.6, h: 0.5, fontFace: BODY, fontSize: 9.5, color: TINT_D, margin: 0, lineSpacing: 11.5 });
  });

  // --- five-year proof strip ---
  const eb = [7406, 52470, 209699, 450134, 829040];
  s.addText('EBITDA, every year, base case', { x: M, y: 5.3, w: 5, h: 0.3, fontFace: BODY, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.6, margin: 0 });
  eb.forEach((v, i) => {
    const x = M + i * 2.35;
    s.addShape(p.ShapeType.roundRect, { x, y: 5.62, w: 2.15, h: 0.62, rectRadius: 0.1, fill: { color: GREEN, transparency: 76 }, line: { type: 'none' } });
    s.addText(`Y${i + 1}`, { x: x + 0.16, y: 5.7, w: 0.36, h: 0.46, valign: 'middle', fontFace: BODY, fontSize: 9.5, bold: true, color: TINT_D, margin: 0 });
    s.addText(`+${money(v)}`, { x: x + 0.55, y: 5.7, w: 1.44, h: 0.46, align: 'right', valign: 'middle', fontFace: DISP, fontSize: 16, bold: true, color: PAPER, margin: 0 });
  });

  // --- the two honest caveats, on the slide rather than in a footnote ---
  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.38, w: 11.6, h: 0.98, rectRadius: 0.12, fill: { color: GOLD, transparency: 84 }, line: { type: 'none' } });
  s.addText('Two things this claim does NOT mean', { x: M + 0.3, y: 6.46, w: 5, h: 0.26, fontFace: BODY, fontSize: 9.5, bold: true, color: GOLD, charSpacing: 1.4, margin: 0 });
  s.addText([
    { text: 'It is cash profit, not economic profit. ', options: { bold: true, color: PAPER } },
    { text: 'Founders draw no salary until Year 3 — until then EBITDA IS founder pay, and in Year 1 that is $7.4k between two people. That is the real price of a four-a-week start.   ', options: { color: TINT_D } },
    { text: 'And accounting profit lags cash, ', options: { bold: true, color: PAPER } },
    { text: 'because annual billing creates deferred revenue: the bank balance is right, the P&L recognises it over twelve months.', options: { color: TINT_D } },
  ], { x: M + 0.3, y: 6.7, w: 11.0, h: 0.6, fontFace: BODY, fontSize: 10, margin: 0, lineSpacing: 12.5 });
  s.addNotes('The claim is deliberately narrow and the caveats are on the slide: cash profit with unpaid founders, and deferred revenue means the P&L lags the bank. Both are stated so nobody discovers them later.');
}

/* -------------------  3 · PRICING BENCHMARK  ------------------- */
{
  const s = lightSlide('We are priced against the tutor, not the app');
  s.addText('COMPETITIVE BENCHMARK', { x: M, y: 0.44, w: 8, h: 0.28, fontFace: BODY, fontSize: 11.5, bold: true, color: VIOLET, charSpacing: 2.4, margin: 0 });
  s.addText('A family preparing a child for a bee is already paying somebody by the hour. That is the alternative we actually replace — and against it, $149 is inexpensive.',
    { x: M, y: 1.58, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0 });

  const items = [
    ['Scripps Word Club (official bee app)', 30, 'APP', 'C4453C'],
    ['SpellingCity / bee practice apps', 60, 'APP', 'C4453C'],
    ['Duolingo Super — family', 120, 'APP', 'C4453C'],
    ['IXL family plan', 240, 'APP', 'C4453C'],
    ['Atom Learning (UK 11+)', 400, 'APP', 'C4453C'],
    ['Bizzing Bee Plus', 149, 'US', VIOLET],
    ['Bizzing Advanced Pack', 399, 'US', VIOLET],
    ['Bizzing Family (whole house)', 499, 'US', VIOLET],
    ['Bizzing Business cohort', 999, 'US', VIOLET],
    ['Hexco bee study packages', 700, 'TUTOR', GREEN],
    ['Kumon, one subject', 2000, 'TUTOR', GREEN],
    ['Bee coach — weekly, one hour', 3500, 'TUTOR', GREEN],
    ['UK 11+ tutoring, exam year', 3000, 'TUTOR', GREEN],
    ['Summer business camp, one week', 2200, 'TUTOR', GREEN],
  ];
  const LX = M, LW = 4.6, BX = 5.5, BW = 5.4, MAXV = 3500;
  const scale = v => Math.max(0.14, BW * Math.pow(v / MAXV, 0.42));
  items.sort((a, b) => a[1] - b[1]).forEach(([n, v, kind, c], i) => {
    const y = 2.22 + i * 0.33;
    const us = kind === 'US';
    if (us) s.addShape(p.ShapeType.roundRect, { x: LX - 0.12, y: y - 0.02, w: 11.5, h: 0.3, rectRadius: 0.07, fill: { color: TINT }, line: { type: 'none' } });
    s.addText(n, { x: LX, y: y - 0.02, w: LW, h: 0.3, valign: 'middle', fontFace: us ? DISP : BODY, fontSize: us ? 11 : 10, bold: us, color: us ? VIOLET : '4A4360', margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: BX, y: y + 0.05, w: scale(v), h: 0.17, rectRadius: 0.085, fill: { color: c }, line: { type: 'none' } });
    s.addText(`$${v.toLocaleString()}`, { x: BX + scale(v) + 0.08, y: y - 0.02, w: 1.05, h: 0.3, valign: 'middle', fontFace: BODY, fontSize: 9.5, bold: us, color: us ? VIOLET : MUTED, margin: 0 });
  });
  [['APPS', 'C4453C'], ['BIZZING', VIOLET], ['TUTORING', GREEN]].forEach(([t, c], i) => {
    const y = 2.28 + i * 0.4;
    s.addShape(p.ShapeType.roundRect, { x: 11.32, y, w: 1.28, h: 0.3, rectRadius: 0.15, fill: { color: c }, line: { type: 'none' } });
    s.addText(t, { x: 11.32, y, w: 1.28, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: PAPER, margin: 0 });
  });
  s.addText('Annual cost, US dollars.\nLog-ish scale so a $30 app\nand a $3,500 coach share\none axis.', { x: 11.3, y: 3.62, w: 1.55, h: 0.9, fontFace: BODY, fontSize: 7.5, italic: true, color: MUTED, margin: 0, lineSpacing: 9.5 });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.96, w: 11.6, h: 0.4, rectRadius: 0.1, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText([{ text: '⚠ Verify before showing externally:  ', options: { bold: true } },
             { text: 'these benchmark prices are from working knowledge, not from live pricing pages pulled today. Atom and Kumon in particular vary by region and change often. Check each before this slide leaves the building.' }], {
    x: M + 0.24, y: 6.96, w: 11.1, h: 0.4, valign: 'middle', fontFace: BODY, fontSize: 9.5, color: GOLD_D, margin: 0 });
}

/* -------------------  4 · SUBSCRIPTION MODELS  ------------------- */
{
  const s = lightSlide('What each product charges', 'Subscription models');
  s.addText('Every price is annual and billed up front. That single billing choice is what puts the cash in before the cost goes out.',
    { x: M, y: 1.58, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0 });
  const tiers = [
    ['Bizzing Bee', 'Free', '$0', 'Full library, journey, arcade. Most families never pay — and that is what makes them trust us.'],
    ['Bee Plus', 'Subscription', '$149 / yr', 'One twenty-third of a weekly bee coach. The default upgrade.'],
    ['Advanced Pack', 'Subscription', '$399 / yr', 'The champion track. Sits against Hexco packages and coaching, not against apps.'],
    ['Bizzing Eleven', 'Exam year', '$349 / yr', 'Atom Learning is ~$400 and does not speak every word. 11+ tutoring is ten times this.'],
    ['Bizzing Bhasha', 'Per language', '$199 / yr', 'Heritage-language tutoring runs $40–60 an hour. Nothing comparable exists as software.'],
    ['Maths · English · Finance', 'Subscription', '$149 / yr', 'Priced to be added without a family meeting.'],
    ['Bizzing Family', 'Everything', '$499 / yr', 'Whole house, up to four children. Cheaper than any three packs — the SKU that makes a twelve-year household real.'],
    ['Bizzing Business', 'Cohort', '$999', 'Eight weeks, a team, a mentor, a demo day. A one-week summer camp is $2,200.'],
    ['India edition', 'All products', '≈ $49 / yr', 'Roughly ₹3,999. A different market at a different price, not a discount.'],
  ];
  tiers.forEach(([n, kind, price, note], i) => {
    const y = 2.26 + i * 0.52;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.04, w: 11.98, h: 0.49, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
    const hero = n === 'Bizzing Family' || n === 'Bee Plus' || n === 'Advanced Pack';
    s.addText(n, { x: M, y, w: 2.45, h: 0.42, valign: 'middle', fontFace: DISP, fontSize: 12, bold: true, color: hero ? VIOLET : INK, margin: 0 });
    s.addText(kind, { x: M + 2.5, y, w: 1.5, h: 0.42, valign: 'middle', fontFace: BODY, fontSize: 9.5, italic: true, color: MUTED, margin: 0 });
    s.addText(price, { x: M + 4.05, y, w: 1.4, h: 0.42, valign: 'middle', align: 'right', fontFace: BODY, fontSize: 12, bold: true, color: hero ? VIOLET : GOLD_D, margin: 0 });
    s.addText(note, { x: M + 5.7, y, w: 5.8, h: 0.42, valign: 'middle', fontFace: BODY, fontSize: 9.5, color: '4A4360', margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.98, w: 11.6, h: 0.4, rectRadius: 0.1, fill: { color: TINT }, line: { type: 'none' } });
  s.addText([{ text: 'Blended ARPU used throughout:  ', options: { bold: true } },
             { text: '$250 diaspora (55% Bee Plus, 12% Advanced, 20% another single pack, 13% Family) and $45 India. The blended figure FALLS from $250 to $172 across five years as India grows into a third of the base — that dilution is in the model, not assumed away.' }], {
    x: M + 0.26, y: 6.98, w: 11.1, h: 0.4, valign: 'middle', fontFace: BODY, fontSize: 9.5, color: '4A4360', margin: 0 });
}

/* -------------------  5 · ACQUISITION STRATEGY  ------------------- */
{
  const s = lightSlide('How a household actually arrives', 'Customer acquisition strategy');
  s.addText('Capping paid media at 18% of revenue has a consequence we should say out loud: growth cannot be bought. Between 83% of Year 1 and 58% of Year 5, households have to be earned. This slide is how.',
    { x: M, y: 1.56, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0 });

  // --- the four-step motion ---
  const steps = [
    ['FIND', 'A parent searches, or a video finds them', 'YouTube and search are where a bee parent already is. The free product means there is nothing between the click and the child playing.', GOLD],
    ['PROVE', 'The child comes back without being asked', 'The only honest signal. We watch week-two return rate, not signups — a family that returns is a family that will pay.', VIOLET],
    ['ASK', 'Upgrade at the moment of ambition', 'Not on day one. At the point the child hits the wall the free tier stops at — a regional list, a harder root, a real bee date.', GREEN],
    ['SPREAD', 'One family tells four', 'The diaspora channel is a WhatsApp group, a temple hall, a school corridor. It cannot be bought. It can be deserved, and it compounds.', 'E3B23C'],
  ];
  steps.forEach(([tag, h, b, c], i) => {
    const x = M + i * 2.95;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.24, w: 2.75, h: 1.62, rectRadius: 0.12, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x, y: 2.24, w: 2.75, h: 0.28, rectRadius: 0.12, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x, y: 2.24, w: 2.75, h: 0.28, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9, bold: true, color: c === GOLD || c === 'E3B23C' ? INK : PAPER, charSpacing: 1.6, margin: 0 });
    s.addText(h, { x: x + 0.18, y: 2.6, w: 2.4, h: 0.44, fontFace: DISP, fontSize: 11.5, bold: true, color: INK, margin: 0, lineSpacing: 13 });
    s.addText(b, { x: x + 0.18, y: 3.06, w: 2.4, h: 0.74, fontFace: BODY, fontSize: 8.5, color: '4A4360', margin: 0, lineSpacing: 10.5 });
    if (i < 3) s.addText('→', { x: x + 2.76, y: 2.84, w: 0.2, h: 0.4, align: 'center', fontFace: BODY, fontSize: 15, color: MUTED, margin: 0 });
  });

  // --- channels, with the role each plays ---
  s.addText('What each channel is for', { x: M, y: 4.02, w: 5, h: 0.3, fontFace: DISP, fontSize: 15, bold: true, color: INK, margin: 0 });
  const CX = [4.35, 6.15, 8.05];
  ['ROLE', 'SWITCHES ON', 'THE NUMBER WE WATCH'].forEach((h, i) =>
    s.addText(h, { x: CX[i], y: 4.38, w: i === 2 ? 4.25 : 1.75, h: 0.26, fontFace: BODY, fontSize: 8, bold: true, color: VIOL_D, charSpacing: 1.2, margin: 0 }));
  const chans = [
    ['The free product itself', 'Converts', 'Week 1', 'Week-two return rate — everything downstream is a function of it', GREEN],
    ['YouTube back catalogue', 'Finds', 'Week 1', 'Views per video after 90 days, not on launch day', GOLD],
    ['Referral & WhatsApp', 'Multiplies', 'Month 3', 'Invites sent per paying household per year — target 2+', GREEN],
    ['Community & events', 'Converts hardest', 'Month 6', 'Cost per household at a regional bee, versus $130 paid', 'E3B23C'],
    ['Search & Meta', 'Amplifies', 'When funded', 'Only ever 18% of trailing revenue — never a fixed budget', VIOLET],
    ['School & club partnerships', 'Reaches at scale', 'Year 2', 'Households per partnership; one club is worth ~40', VIOLET],
  ];
  chans.forEach(([n, role, on, watch, c], i) => {
    const y = 4.68 + i * 0.4;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.03, w: 11.98, h: 0.38, rectRadius: 0.08, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.04, w: 0.24, h: 0.24, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(n, { x: M + 0.34, y: y - 0.02, w: 3.3, h: 0.36, valign: 'middle', fontFace: DISP, fontSize: 11, bold: true, color: INK, margin: 0 });
    s.addText(role, { x: CX[0], y: y - 0.02, w: 1.75, h: 0.36, valign: 'middle', fontFace: BODY, fontSize: 9.5, italic: true, color: c, margin: 0 });
    s.addText(on, { x: CX[1], y: y - 0.02, w: 1.75, h: 0.36, valign: 'middle', fontFace: BODY, fontSize: 9.5, bold: true, color: '4A4360', margin: 0 });
    s.addText(watch, { x: CX[2], y: y - 0.02, w: 4.25, h: 0.36, valign: 'middle', fontFace: BODY, fontSize: 9, color: '4A4360', margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 7.06, w: 11.6, h: 0.38, rectRadius: 0.09, fill: { color: INK }, line: { type: 'none' } });
  s.addText([{ text: 'The order is deliberate.  ', options: { bold: true, color: GOLD } },
             { text: 'Paid media is last because it multiplies whatever it is pointed at. Pointed at a product families do not return to, it multiplies a leak — which is the most common way a plan like this loses money.', options: { color: TINT_D } }], {
    x: M + 0.26, y: 7.06, w: 11.1, h: 0.38, valign: 'middle', fontFace: BODY, fontSize: 9.5, margin: 0 });
  s.addNotes('This slide exists because the 18% paid cap makes organic acquisition load-bearing. If only one metric survives, it is week-two return rate.');
}

/* -------------------  6 · ACQUISITION TARGETS  ------------------- */
{
  const s = lightSlide('Four a week, then earn the right to more', 'Acquisition targets');
  s.addText('The rate rises every year, but the growth MULTIPLE falls every year — 4.5×, then 2.9×, 2.2×, 1.7×. That deceleration is the honest shape of acquisition getting harder as the easy households are used up.',
    { x: M, y: 1.56, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0 });
  const CX = [5.5, 6.9, 8.3, 9.7, 11.1], CW = 1.3;
  ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'].forEach((h, i) =>
    s.addText(h, { x: CX[i], y: 2.2, w: CW, h: 0.3, align: 'center', fontFace: BODY, fontSize: 10.5, bold: true, color: VIOL_D, margin: 0 }));
  const rows = [
    ['New paying households / week', ['4', '18', '52', '115', '195'], 'The target the team is actually run against', true, VIOLET],
    ['Growth on the year before', ['—', '4.5×', '2.9×', '2.2×', '1.7×'], 'Decelerating, because it should', false, MUTED],
    ['New in the year', ['208', '936', '2,704', '5,980', '10,140'], '', false, MUTED],
    ['Retained from prior year (70%)', ['—', '146', '757', '2,422', '5,882'], '30% annual churn taken off the front', false, MUTED],
    ['Paying households, end of year', ['208', '1,082', '3,461', '8,403', '16.0k'], '', true, INK],
  ];
  rows.forEach(([n, vals, note, strong, c], i) => {
    const y = 2.56 + i * 0.6;
    const dark = i === 4;
    if (dark) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.05, w: 11.98, h: 0.56, rectRadius: 0.09, fill: { color: INK }, line: { type: 'none' } });
    else if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.05, w: 11.98, h: 0.56, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
    s.addText(n, { x: M, y: y - 0.02, w: 4.6, h: 0.3, fontFace: strong ? DISP : BODY, fontSize: strong ? 12.5 : 11, bold: strong, color: dark ? PAPER : (strong ? VIOLET : '4A4360'), margin: 0 });
    if (note) s.addText(note, { x: M, y: y + 0.24, w: 4.6, h: 0.24, fontFace: BODY, fontSize: 8, italic: true, color: dark ? TINT_D : MUTED, margin: 0 });
    vals.forEach((v, k) => s.addText(v, { x: CX[k], y, w: CW, h: 0.46, align: 'center', valign: 'middle', fontFace: BODY, fontSize: strong ? 14 : 11.5, bold: strong, color: dark ? (k === 4 ? GOLD : PAPER) : INK, margin: 0 }));
  });

  // --- the split between what paid can buy and what must be earned ---
  s.addText('Of those households, how many can paid media actually buy?', { x: M, y: 5.66, w: 7.5, h: 0.3, fontFace: DISP, fontSize: 14, bold: true, color: INK, margin: 0 });
  const split = [['Y1', 36, 208], ['Y2', 220, 936], ['Y3', 832, 2704], ['Y4', 2150, 5980], ['Y5', 4280, 10140]];
  split.forEach(([lbl, bought, total], i) => {
    const x = M + i * 2.35, frac = bought / total;
    s.addShape(p.ShapeType.roundRect, { x, y: 6.04, w: 2.15, h: 0.3, rectRadius: 0.08, fill: { color: TINT_D }, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x, y: 6.04, w: Math.max(0.2, 2.15 * frac), h: 0.3, rectRadius: 0.08, fill: { color: VIOLET }, line: { type: 'none' } });
    s.addText(`${lbl}  ${Math.round(frac * 100)}% paid`, { x: x + 0.1, y: 6.04, w: 1.95, h: 0.3, valign: 'middle', fontFace: BODY, fontSize: 8.5, bold: true, color: frac > 0.45 ? PAPER : INK, margin: 0 });
    s.addText(`${bought.toLocaleString()} bought · ${(total - bought).toLocaleString()} earned`, { x, y: 6.36, w: 2.15, h: 0.26, fontFace: BODY, fontSize: 7.5, color: MUTED, margin: 0 });
  });
  const geo = [['United States', '520k households', '7.3k', VIOLET], ['United Kingdom', '190k', '2.0k', VIOLET],
    ['Canada & Australia', '250k', '1.3k', VIOLET], ['Gulf', '350k', '0.6k', GOLD], ['India', '6.0M', '4.8k', GREEN]];
  s.addText('Year 5 split by market', { x: M, y: 6.72, w: 5, h: 0.28, fontFace: BODY, fontSize: 9.5, bold: true, color: VIOL_D, charSpacing: 1.4, margin: 0 });
  geo.forEach(([n, sam, v, c], i) => {
    const x = M + i * 2.35;
    s.addText(`${n} — `, { x, y: 7.0, w: 1.5, h: 0.24, fontFace: BODY, fontSize: 8.5, color: MUTED, margin: 0 });
    s.addText(v, { x: x + 1.5, y: 6.97, w: 0.65, h: 0.28, fontFace: DISP, fontSize: 12, bold: true, color: c, margin: 0 });
    s.addText(`of ${sam}`, { x, y: 7.2, w: 2.1, h: 0.22, fontFace: BODY, fontSize: 7.5, italic: true, color: MUTED, margin: 0 });
  });
}

/* -------------------  7 · PAID MEDIA  ------------------- */
{
  const s = darkSlide();
  s.addText('PAID MEDIA — WHAT IT WOULD TAKE', { x: M, y: 0.55, w: 9, h: 0.3, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('The budget is not chosen. It is 18% of what came in last quarter.', {
    x: M, y: 0.90, w: 11.4, h: 1.02, fontFace: DISP, fontSize: 27, bold: true, color: PAPER, margin: 0,
  });
  s.addText('That is the whole discipline. It means paid media can never be the reason a month loses money — and it means we spend $4.7k in Year 1 and $556k in Year 5 without ever making a budget decision.', {
    x: M, y: 1.98, w: 11.4, h: 0.42, fontFace: BODY, fontSize: 12.5, color: TINT_D, margin: 0, lineSpacing: 15,
  });
  const chans = [
    ['Google Search', '$1.80–3.50', '$10–16', '$100', '2.1×', 'Highest intent: "spelling bee practice", "11+ verbal reasoning". Small volume, best economics. Start here.', GREEN],
    ['Meta', '$1.20–1.80', '$12–18', '$156', '1.3×', 'Parent targeting and lookalikes off converters. Volume lives here; so does the waste.', VIOLET],
    ['YouTube — own channel', 'organic', '$2–6', '$25', '8.4×', 'Amortised production cost per conversion, and it falls every year the back catalogue grows.', GOLD],
    ['Events & community', 'n/a', '$25–50', '$70', '3.0×', 'Expensive per lead, converts three to four times better, and the LTV is longest.', 'E3B23C'],
    ['Referral & WhatsApp', '~$0', '~$0', '$8', '26×', 'The real diaspora channel. Cannot be bought, only earned — and it compounds.', GREEN],
  ];
  const CX = [3.9, 5.35, 6.8, 8.1];
  ['CPC', 'CPL', 'CAC', 'YR-1 ROAS'].forEach((h, i) =>
    s.addText(h, { x: CX[i], y: 2.44, w: 1.35, h: 0.26, align: 'center', fontFace: BODY, fontSize: 9, bold: true, color: GOLD, charSpacing: 1.2, margin: 0 }));
  chans.forEach(([n, cpc, cpl, cac, roas, note, c], i) => {
    const y = 2.74 + i * 0.69;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.05, w: 11.98, h: 0.64, rectRadius: 0.09, fill: { color: PAPER, transparency: 94 }, line: { type: 'none' } });
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.15, w: 0.26, h: 0.26, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(n, { x: M + 0.38, y, w: 2.8, h: 0.54, valign: 'middle', fontFace: DISP, fontSize: 12.5, bold: true, color: PAPER, margin: 0 });
    [cpc, cpl, cac, roas].forEach((v, k) => s.addText(v, { x: CX[k], y, w: 1.35, h: 0.54, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 11, bold: k >= 2, color: k === 3 ? c : TINT_D, margin: 0 }));
    s.addText(note, { x: 9.6, y, w: 3.0, h: 0.58, valign: 'middle', fontFace: BODY, fontSize: 9, color: TINT_D, margin: 0, lineSpacing: 11 });
  });
  const facts = [
    ['Blended CAC', '$22 → $55', 'Total paid spend ÷ ALL new households. It rises as paid takes a larger share — from 17% of new households in Year 1 to 42% in Year 5.'],
    ['Payback', '1.3 → 4.5 mo', 'Against $250 ARPU at 85% gross margin. Annual billing means the cash is in on day one regardless; this is the accounting view.'],
    ['LTV : CAC', '31 : 1 → 9 : 1', '$250 ÷ 30% churn × 85% = $708 LTV in Year 1, $488 by Year 5 as India dilutes ARPU. Three-to-one is the floor; we are far above it.'],
  ];
  facts.forEach(([h, v, b], i) => {
    const x = M + i * 4.02;
    s.addShape(p.ShapeType.roundRect, { x, y: 6.28, w: 3.72, h: 1.06, rectRadius: 0.12, fill: { color: PAPER, transparency: 92 }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.22, y: 6.36, w: 1.48, h: 0.28, fontFace: BODY, fontSize: 9, bold: true, color: GOLD, charSpacing: 1.2, margin: 0 });
    s.addText(v, { x: x + 1.75, y: 6.33, w: 1.8, h: 0.32, align: 'right', fontFace: DISP, fontSize: 15, bold: true, color: PAPER, margin: 0 });
    s.addText(b, { x: x + 0.22, y: 6.66, w: 3.3, h: 0.6, fontFace: BODY, fontSize: 8, color: TINT_D, margin: 0, lineSpacing: 10 });
  });
}

/* -------------------  8 · REVENUE MIX  ------------------- */
{
  const s = lightSlide('Where the money comes from', 'Revenue mix · base case');
  s.addText('Subscription carries it. Everything else widens the margin, deepens the brand, or reaches an age the app cannot.',
    { x: M, y: 1.58, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14.5, color: MUTED, margin: 0 });
  const years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
  const series = [
    { name: 'Subscriptions', labels: years, values: [0.026, 0.151, 0.475, 1.118, 2.102], color: VIOLET },
    { name: 'Business cohorts', labels: years, values: [0, 0, 0.078, 0.295, 0.680], color: GREEN },
    { name: 'Books, cards, merch, YouTube', labels: years, values: [0, 0.008, 0.048, 0.140, 0.309], color: GOLD },
  ];
  s.addChart(p.ChartType.bar, series, {
    x: M, y: 2.25, w: 7.5, h: 4.2,
    barDir: 'col', barGrouping: 'stacked', chartColors: series.map(x => x.color),
    showLegend: true, legendPos: 'b', legendColor: '4A4360', legendFontSize: 10, showValue: false,
    catAxisLabelColor: '4A4360', catAxisLabelFontSize: 11,
    valAxisLabelColor: '4A4360', valAxisLabelFontSize: 10,
    valAxisTitle: 'Revenue, $M', showValAxisTitle: true, valAxisTitleColor: MUTED, valAxisTitleFontSize: 10,
    valGridLine: { color: TINT_D, size: 1 }, catGridLine: { style: 'none' },
    dataBorder: { pt: 1, color: PAPER },
  });
  const notes = [
    ['Year 1', '$26k', 'Subscription only. 208 households, most joining late in the year — which is why average, not ending, households drive revenue.', VIOLET],
    ['Year 3', '$601k', 'Cohorts and physical arrive. Subscription still 79% of the line.', GREEN],
    ['Year 5', '$3.09M', 'Subscription 68%, cohorts 22%, physical and media 10%. Higher cohort pricing made that line matter more, not less.', GOLD],
  ];
  notes.forEach(([y1, v, b, c], i) => {
    const y = 2.32 + i * 1.5;
    card(s, { x: 8.5, y, w: 3.8, h: 1.32, fill: TINT });
    s.addText(y1, { x: 8.76, y: y + 0.14, w: 1.1, h: 0.28, fontFace: BODY, fontSize: 10, bold: true, color: MUTED, charSpacing: 1.4, margin: 0 });
    s.addText(v, { x: 10.05, y: y + 0.05, w: 2.05, h: 0.4, align: 'right', fontFace: DISP, fontSize: 20, bold: true, color: c, margin: 0 });
    s.addText(b, { x: 8.76, y: y + 0.47, w: 3.3, h: 0.76, fontFace: BODY, fontSize: 10, color: '4A4360', margin: 0, lineSpacing: 13 });
  });
  s.addText('The aggressive case reaches $5.37M at Year 5 on the same mix shape — 1.7× the households, not a different business.', {
    x: M, y: 6.86, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 11, italic: true, color: MUTED, margin: 0,
  });
}

/* -------------------  9 · THE CEILING  ------------------- */
{
  const s = darkSlide();
  s.addImage({ data: av('titan'), x: 11.05, y: 0.5, w: 1.5, h: 1.5 });
  s.addText('THE CEILING', { x: M, y: 0.6, w: 8, h: 0.32, fontFace: BODY, fontSize: 12, bold: true, color: GOLD, charSpacing: 3, margin: 0 });
  s.addText('Priced against the tutor, we need less of the market than any app would.', {
    x: M, y: 1.0, w: 10.2, h: 0.98, fontFace: DISP, fontSize: 25, bold: true, color: PAPER, margin: 0,
  });
  const bars = [
    ['Diaspora households with a child 4–16', '1.31M', 1.0, GOLD],
    ['× $250 blended — the whole diaspora market', '$328M', 1.0, GOLD],
    ['Year 5 base case — 16.0k households', '0.9%', 0.04, VIOLET],
    ['At 5% penetration', '$16.4M', 0.20, VIOLET],
    ['At 15% — category default, a decade in', '$49M', 0.60, VIOLET],
    ['India at 5% of 6.0M × $45', '$13.5M', 0.38, GREEN],
  ];
  bars.forEach(([label, val, frac, c], i) => {
    const y = 2.18 + i * 0.65;
    s.addText(label, { x: M, y, w: 5.4, h: 0.46, valign: 'middle', fontFace: BODY, fontSize: 11.5, color: TINT_D, margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: 6.3, y: y + 0.09, w: 4.2, h: 0.28, rectRadius: 0.14, fill: { color: PAPER, transparency: 90 }, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x: 6.3, y: y + 0.09, w: Math.max(0.26, 4.2 * frac), h: 0.28, rectRadius: 0.14, fill: { color: c }, line: { type: 'none' } });
    s.addText(val, { x: 10.65, y, w: 1.7, h: 0.46, align: 'right', valign: 'middle', fontFace: DISP, fontSize: 16, bold: true, color: c, margin: 0 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.14, w: 11.6, h: 1.22, rectRadius: 0.12, fill: { color: PAPER, transparency: 93 }, line: { type: 'none' } });
  s.addText('The honest read', { x: M + 0.32, y: 6.24, w: 4, h: 0.28, fontFace: BODY, fontSize: 10, bold: true, color: GOLD, charSpacing: 1.6, margin: 0 });
  s.addText('At tutor-adjacent pricing the realistic ceiling as category leader is $45–90M of revenue. Year 5 needs 0.9% of the diaspora, which is the strongest fact on this slide: the plan does not require winning the market, only being findable in it. But the same cost rules that guarantee profit also cap the pace — 18% of revenue on media cannot outrun a competitor who raises $20M and spends it. We win slowly or not at all, and the deck should not pretend otherwise.',
    { x: M + 0.32, y: 6.5, w: 10.95, h: 0.82, fontFace: BODY, fontSize: 10.5, color: TINT_D, margin: 0, lineSpacing: 13.5 });
  s.addNotes('The trade-off is explicit: never losing money and growing fast are not both available. This deck chooses the first.');
}

/* -------------------  10 · COST STRUCTURE  ------------------- */
{
  const s = lightSlide('Costs are fractions, not budgets', 'Cost structure · base case');
  s.addText('Only two lines are fixed, and together they are smaller than one week of Year 1 sales. Everything else moves with revenue by rule — which is the mechanism, not the forecast, behind never losing money.',
    { x: M, y: 1.56, w: 11.6, h: 0.52, fontFace: BODY, fontSize: 14, color: MUTED, margin: 0 });
  const rows = [
    ['Paid media', '18% of revenue', [4.7, 28.5, 108.2, 279.5, 556.3], 'Never a budget. Can be switched off in a week without breaking anything.', VIOLET],
    ['Content & tools', '12%, floored', [10.8, 34.0, 72.1, 186.4, 370.9], 'AI credits, art, audio, contract writers. Floored in Y1–Y2 because some spend is real even at tiny revenue.', VIOLET],
    ['People', 'capped at 20%', [0, 24.0, 96.0, 300.0, 620.0], 'Founders unpaid until Year 3 — until then EBITDA IS founder pay. First hire Y2 part-time; six by Y5.', 'C4453C'],
    ['Mentors & live delivery', '50% of cohort rev', [0, 0, 39.1, 147.5, 340.0], 'A true cost of goods. It exists only when a cohort has already been sold.', GREEN],
    ['Physical COGS', '55% of physical rev', [0, 4.4, 26.4, 76.9, 170.0], 'Print-on-demand. We never hold stock we have not already sold.', GOLD],
    ['Payment fees & hosting', '3.9% of revenue', [1.0, 6.2, 23.4, 60.6, 120.5], 'Stripe, plus a statically hosted offline-first app. Genuinely small, and it stays small.', GREEN],
    ['G&A — the only fixed line', 'fixed', [2.1, 9.0, 26.0, 52.0, 84.0], 'Entity, filings, accounting, insurance, background checks. $40 a week in Year 1.', GOLD],
  ];
  const CX = [6.6, 7.72, 8.84, 9.96, 11.08], CW = 1.02;
  ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach((h, i) =>
    s.addText(h, { x: CX[i], y: 2.2, w: CW, h: 0.28, align: 'center', fontFace: BODY, fontSize: 10.5, bold: true, color: VIOL_D, margin: 0 }));
  const tot = [0, 0, 0, 0, 0];
  rows.forEach(([n, rule, vals, note, c], i) => {
    const y = 2.5 + i * 0.56;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.04, w: 11.98, h: 0.52, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.08, w: 0.26, h: 0.26, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(n, { x: M + 0.36, y: y - 0.03, w: 2.5, h: 0.26, fontFace: DISP, fontSize: 11.5, bold: true, color: INK, margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: M + 2.9, y: y + 0.02, w: 1.42, h: 0.24, rectRadius: 0.12, fill: { color: c }, line: { type: 'none' } });
    s.addText(rule, { x: M + 2.9, y: y + 0.02, w: 1.42, h: 0.24, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 7.5, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    s.addText(note, { x: M + 0.36, y: y + 0.22, w: 5.5, h: 0.28, fontFace: BODY, fontSize: 8, color: MUTED, margin: 0 });
    vals.forEach((v, k) => { tot[k] += v; s.addText(v ? `$${v < 10 ? v.toFixed(1) : Math.round(v)}k` : '—', { x: CX[k], y, w: CW, h: 0.46, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 10.5, color: v ? INK : TINT_D, margin: 0 }); });
  });
  const y = 2.5 + 7 * 0.56;
  s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.04, w: 11.98, h: 0.52, rectRadius: 0.09, fill: { color: INK }, line: { type: 'none' } });
  s.addText('Total operating cost', { x: M + 0.36, y, w: 4, h: 0.46, valign: 'middle', fontFace: DISP, fontSize: 12.5, bold: true, color: PAPER, margin: 0 });
  tot.forEach((v, k) => s.addText(money(v * 1000), { x: CX[k], y, w: CW, h: 0.46, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 11, bold: true, color: k === 4 ? GOLD : PAPER, margin: 0 }));
  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.94, w: 11.6, h: 0.44, rectRadius: 0.1, fill: { color: 'E8F4EC' }, line: { type: 'none' } });
  s.addText([{ text: 'Why this cannot produce a loss:  ', options: { bold: true } },
             { text: 'the rule-driven lines sum to 33.9% of revenue plus 50% of cohort and 55% of physical revenue — about 42% blended. The only way to lose money is for the two fixed lines, People and G&A, to exceed the remaining 58%. Both are set annually, in arrears, from revenue already banked.' }], {
    x: M + 0.26, y: 6.94, w: 11.1, h: 0.44, valign: 'middle', fontFace: BODY, fontSize: 9.5, color: '1F4A33', margin: 0, lineSpacing: 11.5 });
}

/* -------------------  11 · P&L AND STRESS TESTS  ------------------- */
{
  const s = lightSlide('Five-year P&L, and what breaks it', 'Summary · stress tested');
  const CX = [4.15, 5.5, 6.85, 8.2, 9.55], CW = 1.3;
  function block(title, y0, rows, accent) {
    s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y0 - 0.32, w: 10.4, h: 0.3, rectRadius: 0.09, fill: { color: accent }, line: { type: 'none' } });
    s.addText(title, { x: M + 0.06, y: y0 - 0.32, w: 3.3, h: 0.3, valign: 'middle', fontFace: BODY, fontSize: 9.5, bold: true, color: PAPER, charSpacing: 1.6, margin: 0 });
    ['Y1', 'Y2', 'Y3', 'Y4', 'Y5'].forEach((h, i) =>
      s.addText(h, { x: CX[i], y: y0 - 0.32, w: CW, h: 0.3, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9, bold: true, color: PAPER, margin: 0 }));
    rows.forEach(([n, vals, strong], i) => {
      const y = y0 + i * 0.36;
      s.addText(n, { x: M, y, w: 3.3, h: 0.32, valign: 'middle', fontFace: strong ? DISP : BODY, fontSize: strong ? 11.5 : 10.5, bold: strong, color: strong ? INK : '4A4360', margin: 0 });
      vals.forEach((v, k) => s.addText(typeof v === 'number' ? money(v) : v, {
        x: CX[k], y, w: CW, h: 0.32, align: 'center', valign: 'middle', fontFace: BODY,
        fontSize: strong ? 11 : 10, bold: strong,
        color: typeof v === 'number' && v < 0 ? 'C4453C' : (strong ? INK : '4A4360'), margin: 0 }));
    });
  }
  block('BASE CASE — 4 / 18 / 52 / 115 / 195 per week', 1.82, [
    ['Paying households', ['208', '1,082', '3,461', '8,403', '16.0k'], false],
    ['Revenue', [26e3, 158.6e3, 600.9e3, 1.553e6, 3.091e6], true],
    ['Operating cost', [18.6e3, 106.1e3, 391.2e3, 1.103e6, 2.262e6], false],
    ['EBITDA', [7.4e3, 52.5e3, 209.7e3, 450.1e3, 829.0e3], true],
  ], VIOLET);
  block('AGGRESSIVE CASE — 6 / 30 / 90 / 200 / 340 per week', 3.62, [
    ['Paying households', ['312', '1,778', '5,925', '14.5k', '27.9k'], false],
    ['Revenue', [39e3, 257e3, 1.019e6, 2.680e6, 5.367e6], true],
    ['Operating cost', [21.4e3, 142.4e3, 632.5e3, 1.818e6, 3.749e6], false],
    ['EBITDA', [17.6e3, 114.7e3, 386.5e3, 862.2e3, 1.618e6], true],
  ], GREEN);

  s.addShape(p.ShapeType.roundRect, { x: 11.02, y: 1.5, w: 1.36, h: 3.66, rectRadius: 0.12, fill: { color: 'E8F4EC' }, line: { type: 'none' } });
  s.addText('PEAK CASH\nNEED', { x: 11.02, y: 1.62, w: 1.36, h: 0.46, align: 'center', fontFace: BODY, fontSize: 8, bold: true, color: '1F4A33', margin: 0, lineSpacing: 10 });
  s.addText('$0', { x: 11.02, y: 2.08, w: 1.36, h: 0.5, align: 'center', fontFace: DISP, fontSize: 26, bold: true, color: GREEN, margin: 0 });
  s.addText('in both cases,\nin every month', { x: 11.02, y: 2.58, w: 1.36, h: 0.44, align: 'center', fontFace: BODY, fontSize: 8, color: '1F4A33', margin: 0, lineSpacing: 10 });
  s.addText('BREAK-EVEN', { x: 11.02, y: 3.16, w: 1.36, h: 0.24, align: 'center', fontFace: BODY, fontSize: 8, bold: true, color: '1F4A33', margin: 0 });
  s.addText('Week 1', { x: 11.02, y: 3.4, w: 1.36, h: 0.34, align: 'center', fontFace: DISP, fontSize: 17, bold: true, color: GREEN, margin: 0 });
  s.addText('27% / 30%', { x: 11.02, y: 3.86, w: 1.36, h: 0.3, align: 'center', fontFace: DISP, fontSize: 13, bold: true, color: VIOLET, margin: 0 });
  s.addText('Y5 EBITDA margin,\nbase / aggressive', { x: 11.02, y: 4.16, w: 1.36, h: 0.36, align: 'center', fontFace: BODY, fontSize: 7.5, color: MUTED, margin: 0, lineSpacing: 9 });
  s.addText('$1.55M', { x: 11.02, y: 4.56, w: 1.36, h: 0.32, align: 'center', fontFace: DISP, fontSize: 14, bold: true, color: GOLD_D, margin: 0 });
  s.addText('cumulative EBITDA,\nbase, Y1–Y5', { x: 11.02, y: 4.86, w: 1.36, h: 0.34, align: 'center', fontFace: BODY, fontSize: 7.5, color: MUTED, margin: 0, lineSpacing: 9 });

  s.addText('Stress tests — none of them produce a loss, and that is the point', { x: M, y: 5.28, w: 8, h: 0.32, fontFace: DISP, fontSize: 14.5, bold: true, color: INK, margin: 0 });
  const stress = [
    ['We only ever hit 2 a week, not 4', 'Year 1 revenue halves to $13k — and so do the four cost lines that are fractions of it. EBITDA stays positive at ~$1.5k. Slower, never underwater.', GREEN],
    ['Churn 30% → 45%', 'LTV falls to $472 and Year 5 revenue drops about 21%. Costs fall with it. Margin holds within two points.', GREEN],
    ['Bee Plus $149 → $99', 'ARPU falls to $190. This is the one that genuinely hurts: Year 5 EBITDA roughly halves. The pricing decision IS the plan.', 'C4453C'],
    ['India stalls entirely', 'Year 5 revenue −$830k, about 27% — but blended ARPU RISES to $250 and margin improves. India is volume, not profit.', GOLD],
  ];
  stress.forEach(([h, b, c], i) => {
    const x = M + (i % 2) * 5.9, y = 5.68 + Math.floor(i / 2) * 0.74;
    s.addShape(p.ShapeType.roundRect, { x, y, w: 5.55, h: 0.66, rectRadius: 0.1, fill: { color: c === GREEN ? 'E8F4EC' : 'FBF3E0' }, line: { type: 'none' } });
    s.addText(h, { x: x + 0.2, y: y + 0.04, w: 5.15, h: 0.24, fontFace: BODY, fontSize: 10, bold: true, color: c === GREEN ? '1F4A33' : GOLD_D, margin: 0 });
    s.addText(b, { x: x + 0.2, y: y + 0.27, w: 5.15, h: 0.36, fontFace: BODY, fontSize: 8.5, color: c === GREEN ? '1F4A33' : GOLD_D, margin: 0, lineSpacing: 10.5 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 7.2, w: 11.6, h: 0.3, rectRadius: 0.08, fill: { color: TINT }, line: { type: 'none' } });
  s.addText([{ text: 'Assumptions:  ', options: { bold: true } },
             { text: 'ARPU $250 diaspora / $45 India, blended falling $250→$172 as India grows · churn 30% · annual upfront billing · paid media 18% of revenue, content 12%, mentors 50% of cohort, COGS 55% of physical, fees & hosting 3.9% · founders unpaid to Y3 · cohorts from Y3 at $999. Computed by strategy/model.py, which asserts positive EBITDA in every year and in week one.' }], {
    x: M + 0.24, y: 7.2, w: 11.1, h: 0.3, valign: 'middle', fontFace: BODY, fontSize: 8, color: '4A4360', margin: 0 });
  s.addNotes('Peak cash need $0. Break-even week 1. The two things that genuinely hurt are a price cut and a product families do not return to — not a slow start.');
}

/* ==========================================================================
   ADDITIONAL OPPORTUNITIES — two slides.

   Deliberately kept OUT of the five-year P&L. The plan is profitable without
   any of them, and adding them to the base case would quietly undo the
   discipline that makes it profitable. They are ranked by RETURN ON UNLOCK —
   annual value divided by what it costs to open the door — because that, not
   headline size, is the order they should actually be attempted in.

   ⚠️ Partner organisations are named from working knowledge, NOT from live
   research — this environment cannot browse. Several named are competitors as
   well as candidates. The slide says so, prominently.
   ========================================================================== */

/* -------------------  12 · THE OPPORTUNITY LEDGER  ------------------- */
{
  const s = lightSlide('Six doors we have not opened', 'Additional opportunities');
  s.addText('None of this is in the five-year P&L, and it should not be — the plan has to work without it. Each is ranked by RETURN ON UNLOCK, which is not the order of headline size.',
    { x: M, y: 1.54, w: 11.6, h: 0.5, fontFace: BODY, fontSize: 13.5, color: MUTED, margin: 0, lineSpacing: 16 });

  const VX = 3.9, UX = 5.1, CX = 10.35, RX = 11.5;
  [['ANNUAL VALUE', VX, 1.0, 'right'], ['WHAT IT TAKES TO UNLOCK', UX, 5.1, 'left'],
   ['UNLOCK COST', CX, 1.0, 'right'], ['RETURN', RX, 0.95, 'center']].forEach(([h, x, w, a]) =>
    s.addText(h, { x, y: 2.14, w, h: 0.26, align: a, fontFace: BODY, fontSize: 7.5, bold: true, color: VIOL_D, charSpacing: 1.1, margin: 0 }));

  // [name, arithmetic, annual $k, unlock $k, what it takes, when, colour]
  const doors = [
    ['Bee & tutor networks', 'NSF and SASB chapters reach tens of thousands of exactly our families. 5,000 households at a $60 partner price.',
      300, 5, 'One relationship, a co-branded practice track, a revenue share. The app already ships NSF’s own 2026 word lists — we are not asking them to trust a stranger.', 'Year 2', GREEN],
    ['Amazon KDP & audiobook', '23 volumes are already written, typeset and illustrated. 8,000 units a year at ~$4.50 net across the list.',
      45, 3, 'ISBNs, print-ready covers, a KDP and ACX account. The audiobook narration can come off the TTS pipeline already built for the films.', 'Year 1', GREEN],
    ['Employer learning benefit', 'Firms with large diaspora workforces already run family learning stipends. 4 employers × 200 families × $250.',
      200, 15, 'A W-9, invoicing, an HR-facing one-pager and a named reference. SOC 2 becomes necessary above roughly ten employers, not before.', 'Year 4', VIOLET],
    ['Weekend & heritage', 'Bhasha’s natural home. ~1,500 such schools in North America; 100 of them at a $500 site licence.',
      50, 10, 'A teacher mode, printable packs and a 30-week scope cut to a Saturday-morning rhythm. No procurement, no privacy review — a head teacher decides.', 'Year 2', VIOLET],
    ['Shopify — avatar merch', '217 painted avatars already exist. 2,000 orders a year at a $32 average basket.',
      65, 16, 'Store plus print-on-demand for tees and posters is cheap. Plushies are the expensive half: a real minimum order, sizes, returns.', 'Year 2', GOLD],
    ['School districts', 'Supplemental literacy licensing. 3 districts × ~10,000 students in band × $4 per student per year.',
      120, 35, 'COPPA/FERPA compliance, an SDPC data agreement, Clever or ClassLink rostering, a teacher dashboard, and one pilot with real outcome data.', 'Year 3', 'C4453C'],
  ];
  let tv = 0, tc = 0;
  doors.forEach(([n, why, val, cost, takes, when, c], i) => {
    const y = 2.46 + i * 0.68;
    tv += val; tc += cost;
    if (i % 2 === 0) s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: y - 0.05, w: 11.98, h: 0.64, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.hexagon, { x: M, y: y + 0.08, w: 0.24, h: 0.24, rotate: 90, fill: { color: c }, line: { type: 'none' } });
    s.addText(n, { x: M + 0.34, y: y - 0.04, w: 2.05, h: 0.26, fontFace: DISP, fontSize: 11.5, bold: true, color: INK, margin: 0 });
    s.addText(when, { x: M + 2.42, y: y - 0.02, w: 0.7, h: 0.22, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 7.5, bold: true, color: MUTED, margin: 0 });
    s.addText(why, { x: M + 0.34, y: y + 0.2, w: 2.75, h: 0.38, fontFace: BODY, fontSize: 7.5, color: MUTED, margin: 0, lineSpacing: 9 });
    s.addText(`$${val}k`, { x: VX, y, w: 1.0, h: 0.54, align: 'right', valign: 'middle', fontFace: DISP, fontSize: 15, bold: true, color: c, margin: 0 });
    s.addText(takes, { x: UX, y, w: 5.1, h: 0.56, valign: 'middle', fontFace: BODY, fontSize: 8.5, color: '4A4360', margin: 0, lineSpacing: 10.5 });
    s.addText(`$${cost}k`, { x: CX, y, w: 1.0, h: 0.54, align: 'right', valign: 'middle', fontFace: BODY, fontSize: 11, color: '4A4360', margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: RX, y: y + 0.13, w: 0.95, h: 0.28, rectRadius: 0.14, fill: { color: c }, line: { type: 'none' } });
    s.addText(`${Math.round(val / cost)}×`, { x: RX, y: y + 0.13, w: 0.95, h: 0.28, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
  });
  const ty = 2.46 + 6 * 0.68;
  s.addShape(p.ShapeType.roundRect, { x: M - 0.14, y: ty - 0.05, w: 11.98, h: 0.56, rectRadius: 0.09, fill: { color: INK }, line: { type: 'none' } });
  s.addText('All six, fully open', { x: M + 0.34, y: ty, w: 2.75, h: 0.46, valign: 'middle', fontFace: DISP, fontSize: 12.5, bold: true, color: PAPER, margin: 0 });
  s.addText(`$${tv}k`, { x: VX, y: ty, w: 1.0, h: 0.46, align: 'right', valign: 'middle', fontFace: DISP, fontSize: 15, bold: true, color: GOLD, margin: 0 });
  s.addText('a year by Year 4 — roughly half of base-case Year 4 revenue, added to a business that already pays for itself without any of it.', { x: UX, y: ty, w: 5.1, h: 0.46, valign: 'middle', fontFace: BODY, fontSize: 8.5, color: TINT_D, margin: 0 });
  s.addText(`$${tc}k`, { x: CX, y: ty, w: 1.0, h: 0.46, align: 'right', valign: 'middle', fontFace: BODY, fontSize: 11, bold: true, color: PAPER, margin: 0 });
  s.addText(`${Math.round(tv / tc)}×`, { x: RX, y: ty, w: 0.95, h: 0.46, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 13, bold: true, color: GOLD, margin: 0 });

  s.addShape(p.ShapeType.roundRect, { x: M, y: 7.02, w: 11.6, h: 0.42, rectRadius: 0.1, fill: { color: 'E8F4EC' }, line: { type: 'none' } });
  s.addText([{ text: 'The rule these have to clear:  ', options: { bold: true } },
             { text: 'an unlock cost is paid out of the PRIOR year’s profit, never out of a budget. $85k opens all six — which the base case cannot afford until Year 3, so the top two go first and fund the rest. That ordering is why school districts, the most impressive line on this slide, is also the last one we should touch.' }], {
    x: M + 0.26, y: 7.02, w: 11.1, h: 0.42, valign: 'middle', fontFace: BODY, fontSize: 9, color: '1F4A33', margin: 0, lineSpacing: 11 });
  s.addNotes('Ranked by return on unlock, not by size. Bee networks and Amazon are near-free and should start in Year 1; districts are a 9–18 month enterprise sale and should wait.');
}

/* -------------------  13 · WHO WE WOULD CALL  ------------------- */
{
  const s = lightSlide('Who we would actually call', 'Partners · needs verification');
  s.addText('Four networks that already gather our families in one place, so we rent an audience instead of buying one. The app already ships North South Foundation’s own word lists — we arrive built to their syllabus.',
    { x: M, y: 1.54, w: 11.6, h: 0.5, fontFace: BODY, fontSize: 13.5, color: MUTED, margin: 0, lineSpacing: 16 });

  const cats = [
    ['BEE & DIASPORA', 'The warmest room we could walk into', [
      ['North South Foundation', '~100 US chapters; regional and national contests for Indian-American children'],
      ['South Asian Spelling Bee', 'National competition, exactly our demographic'],
      ['Scripps National Spelling Bee', 'The apex — but ships Word Club, so partner and rival at once'],
      ['SPELLPundit · Hexco', 'Direct competitors. Partner, or the eventual acquirer'],
    ], GREEN],
    ['TUTOR & TEACHER', 'Distribution that already charges by the hour', [
      ['Outschool', 'Live small-group marketplace — the natural shelf for Business cohorts'],
      ['Varsity Tutors · Wyzant', 'Large US networks, both with a schools arm'],
      ['Kumon · Mathnasium · Sylvan', 'Franchise centres, heavy diaspora footfall. Sell as an add-on'],
      ['UK: Explore Learning', 'Third Space Learning sells tutoring INTO schools — a rail, not a rival'],
    ], VIOLET],
    ['WEEKEND & HERITAGE', 'Where Bhasha belongs, and nobody is serving it', [
      ['Chinmaya Mission · BAPS', 'Bala Vihar and Bal Mandal run weekly classes at scale'],
      ['Language academies', 'Tamil, Telugu, Gujarati, Punjabi and Bengali schools across North America'],
      ['TANA · ATA · community bodies', 'Regional associations with conference stages and mailing lists'],
      ['Temple & gurdwara networks', 'The most trusted room, and the hardest to enter on a sales call'],
    ], GOLD],
    ['SCHOOL & EMPLOYER RAILS', 'Procurement, not persuasion', [
      ['Clever · ClassLink', 'Rostering. Without one of these a district cannot deploy us'],
      ['SDPC · iKeepSafe', 'The data agreement and COPPA/FERPA certification that gate every district'],
      ['First districts to try', 'Fremont, Cupertino, Plano, Frisco, Naperville, Edison, Bellevue'],
      ['Employer benefits teams', 'Microsoft, Google, Deloitte, Infosys, TCS — family learning stipends'],
    ], 'C4453C'],
  ];
  cats.forEach(([tag, sub, items, c], i) => {
    const x = M + i * 2.95;
    s.addShape(p.ShapeType.roundRect, { x, y: 2.14, w: 2.76, h: 2.42, rectRadius: 0.12, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.roundRect, { x, y: 2.14, w: 2.76, h: 0.28, rectRadius: 0.12, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x, y: 2.14, w: 2.76, h: 0.28, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 8, bold: true, color: c === GOLD ? INK : PAPER, charSpacing: 1.2, margin: 0 });
    s.addText(sub, { x: x + 0.16, y: 2.46, w: 2.44, h: 0.24, fontFace: BODY, fontSize: 7.5, italic: true, color: MUTED, margin: 0 });
    items.forEach(([n, b], k) => {
      const y = 2.74 + k * 0.44;
      s.addText(n, { x: x + 0.16, y, w: 2.44, h: 0.18, fontFace: DISP, fontSize: 9, bold: true, color: INK, margin: 0 });
      s.addText(b, { x: x + 0.16, y: y + 0.16, w: 2.44, h: 0.26, fontFace: BODY, fontSize: 7, color: '4A4360', margin: 0, lineSpacing: 8.5 });
    });
  });

  s.addText('Three flagship programmes to take to them', { x: M, y: 4.68, w: 5.0, h: 0.3, fontFace: DISP, fontSize: 15, bold: true, color: INK, margin: 0 });
  s.addText('Each sells a whole thing a network can run, not a licence it has to explain.', { x: 5.9, y: 4.72, w: 6.4, h: 0.26, fontFace: BODY, fontSize: 9.5, italic: true, color: MUTED, margin: 0 });
  const flags = [
    ['BEE SEASON IN A BOX', 'A chapter or district runs its own bee', 'Graded word lists, pronouncer audio, judge sheets, a live scoreboard. The 42,483 recorded clips mean we can already pronounce every word — the single hardest part of running a bee, solved before we ask.', GREEN],
    ['BHASHA SATURDAY', 'A 30-week heritage-language track', 'Cut to the rhythm of a weekend school: teacher mode, printable packs, a term that ends in something parents are invited to. Sold to a head teacher, not a procurement office.', GOLD],
    ['FOUNDERS’ EIGHT', 'Bizzing Business, after school', 'Eight weeks, a team, a mentor, a demo night. The highest price per family we have, and the one programme a school can put its own name on.', VIOLET],
  ];
  flags.forEach(([tag, h, b, c], i) => {
    const x = M + i * 3.95;
    s.addShape(p.ShapeType.roundRect, { x, y: 5.04, w: 3.75, h: 1.28, rectRadius: 0.12, fill: { color: TINT }, line: { type: 'none' } });
    s.addShape(p.ShapeType.rect, { x, y: 5.04, w: 0.07, h: 1.28, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: x + 0.24, y: 5.13, w: 3.35, h: 0.24, fontFace: BODY, fontSize: 8.5, bold: true, color: c, charSpacing: 1.2, margin: 0 });
    s.addText(h, { x: x + 0.24, y: 5.35, w: 3.35, h: 0.26, fontFace: DISP, fontSize: 11, bold: true, color: INK, margin: 0 });
    s.addText(b, { x: x + 0.24, y: 5.62, w: 3.35, h: 0.62, fontFace: BODY, fontSize: 8, color: '4A4360', margin: 0, lineSpacing: 10 });
  });

  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.42, w: 11.6, h: 1.0, rectRadius: 0.12, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText('⚠ Every name on this slide needs verifying before anyone is contacted', { x: M + 0.28, y: 6.48, w: 8, h: 0.26, fontFace: BODY, fontSize: 10, bold: true, color: GOLD_D, margin: 0 });
  s.addText('These organisations are named from working knowledge, not from research done today — chapter counts, programme names and even whether a body still operates all need checking. Three specific cautions. Scripps ships a competing app, so an approach there is a negotiation, not a partnership. SPELLPundit and Hexco are direct competitors before they are anything else. And in India, at least one major tutoring brand has been in serious financial distress — confirm a partner is solvent before building anything on them. Treat this slide as a research brief with a starting list, not as a contact sheet.',
    { x: M + 0.28, y: 6.7, w: 11.04, h: 0.68, fontFace: BODY, fontSize: 9, color: GOLD_D, margin: 0, lineSpacing: 11 });
  s.addNotes('Research brief, not a contact sheet. The NSF angle is the strongest because the product is already built to their word lists — that is verifiable in the repo (nsf-vocab26-data.js, nsf-finals500-data.js).');
}


/* =====================  20 · DECISIONS  ===================== */
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

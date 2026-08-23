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
  s.addText('Vision · Mission · Strategy · Product roadmap · Organisation', {
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
  s.addText('Subjects are brands. Geography is an edition inside them — not a second brand.', {
    x: M, y: 1.58, w: 11.6, h: 0.4, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0,
  });
  s.addShape(p.ShapeType.roundRect, { x: 5.15, y: 2.2, w: 3.0, h: 0.85, rectRadius: 0.14, fill: { color: INK }, line: { type: 'none' } });
  s.addText('BIZZING', { x: 5.15, y: 2.2, w: 3.0, h: 0.85, align: 'center', valign: 'middle', fontFace: DISP, fontSize: 24, bold: true, color: PAPER, charSpacing: 2, margin: 0 });
  s.addShape(p.ShapeType.line, { x: 6.65, y: 3.05, w: 0, h: 0.42, line: { color: TINT_D, width: 2 } });
  s.addShape(p.ShapeType.line, { x: 1.55, y: 3.47, w: 10.2, h: 0, line: { color: TINT_D, width: 2 } });
  const kids = [
    ['Bizzing Bee', 'Spelling', 'LIVE', GREEN],
    ['Bizzing Eleven', '11+ verbal reasoning', 'NEXT', VIOLET],
    ['Bizzing Bhasha', 'Heritage languages', 'BUILD', VIOLET],
    ['Bizzing Finance', 'Money & numeracy', 'IN FLIGHT', GOLD],
  ];
  kids.forEach(([n, sub, tag, c], i) => {
    const x = 0.86 + i * 3.0;
    s.addShape(p.ShapeType.line, { x: x + 1.32, y: 3.47, w: 0, h: 0.4, line: { color: TINT_D, width: 2 } });
    card(s, { x, y: 3.87, w: 2.64, h: 1.62, fill: TINT });
    s.addText(n, { x: x + 0.2, y: 4.06, w: 2.24, h: 0.42, fontFace: DISP, fontSize: 16.5, bold: true, color: INK, margin: 0 });
    s.addText(sub, { x: x + 0.2, y: 4.48, w: 2.24, h: 0.36, fontFace: BODY, fontSize: 12, color: '4A4360', margin: 0 });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.2, y: 4.92, w: 1.15, h: 0.32, rectRadius: 0.16, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: x + 0.2, y: 4.92, w: 1.15, h: 0.32, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
  });
  s.addText('Naming caution: "Bizzing Finance" is a subject, "Bizzing India" is a place. Mixing the two axes makes "Bizzing Hindi" ambiguous — language product, or India edition? Settle it now, while it is cheap.', {
    x: M, y: 5.85, w: 11.6, h: 0.7, fontFace: BODY, fontSize: 13, italic: true, color: GOLD_D, margin: 0, lineSpacing: 18,
  });
}

/* =====================  9 · ROADMAP  ===================== */
{
  const s = lightSlide('Product roadmap', 'Three horizons');
  const hz = [
    ['HORIZON 1', 'Prove the wedge', GREEN, [
      'Bizzing Bee to paid conversion at a repeatable CAC',
      'YouTube documentary channel as top-of-funnel',
      'Spelling Champions avatar pack + merch test',
      'Supabase accounts & cloud backup live',
    ]],
    ['HORIZON 2', 'Reuse the engine', VIOLET, [
      'Bizzing Eleven — 11+ verbal reasoning, UK',
      'Bizzing Finance to first paying cohort',
      'US gifted & selective-entry verbal item bank',
      'Shared account across products, one subscription',
    ]],
    ['HORIZON 3', 'Own the category', GOLD, [
      'Bizzing Bhasha — Hindi first, then Tamil & Telugu',
      'Pronunciation scoring (needs speech recognition)',
      'School and community partnerships',
      'Bizzing as the diaspora learning house, not one app',
    ]],
  ];
  hz.forEach(([tag, head, c, items], i) => {
    const x = M + i * 4.03;
    card(s, { x, y: 1.65, w: 3.73, h: 4.55, fill: i === 0 ? TINT : PAPER });
    if (i > 0) s.addShape(p.ShapeType.roundRect, { x, y: 1.65, w: 3.73, h: 4.55, rectRadius: 0.14, fill: { color: PAPER }, line: { color: TINT_D, width: 1.25 } });
    s.addShape(p.ShapeType.roundRect, { x: x + 0.28, y: 1.92, w: 1.5, h: 0.34, rectRadius: 0.17, fill: { color: c }, line: { type: 'none' } });
    s.addText(tag, { x: x + 0.28, y: 1.92, w: 1.5, h: 0.34, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 9, bold: true, color: c === GOLD ? INK : PAPER, margin: 0 });
    s.addText(head, { x: x + 0.28, y: 2.42, w: 3.17, h: 0.5, fontFace: DISP, fontSize: 19, bold: true, color: INK, margin: 0 });
    s.addText(items.map((t, k) => ({ text: t, options: { bullet: true, breakLine: k < items.length - 1 } })), {
      x: x + 0.32, y: 3.0, w: 3.1, h: 3.0, fontFace: BODY, fontSize: 12.5, color: '4A4360',
      margin: 0, paraSpaceAfter: 9, lineSpacing: 16,
    });
  });
}

/* =====================  10 · ORG CHART  ===================== */
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

/* =====================  11-13 · ROLES  ===================== */
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

/* =====================  14 · DECISIONS  ===================== */
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

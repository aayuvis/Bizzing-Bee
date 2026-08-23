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
      items: [['Bizzing India', 'free hook'], ['↳ Bizzing Bhasha', 'paid pack']] },
    { x: 8.96, name: 'NUMBERS & THE WORLD', c: GREEN,
      items: [['Bizzing Maths', 'planned'], ['Bizzing Finance', 'in flight'],
              ['Bizzing Business', 'exploratory'], ['Bizzing Quiz', 'gap']] },
  ];
  fams.forEach(f => {
    const w = 3.63;
    s.addShape(p.ShapeType.line, { x: f.x + w / 2, y: 3.06, w: 0, h: 0.3, line: { color: TINT_D, width: 2 } });
    s.addShape(p.ShapeType.roundRect, { x: f.x, y: 3.36, w, h: 0.42, rectRadius: 0.1, fill: { color: f.c }, line: { type: 'none' } });
    s.addText(f.name, { x: f.x, y: 3.36, w, h: 0.42, align: 'center', valign: 'middle', fontFace: BODY, fontSize: 10, bold: true, color: f.c === GOLD ? INK : PAPER, charSpacing: 1.6, margin: 0 });
    f.items.forEach(([n, tag], i) => {
      const y = 3.94 + i * 0.46;
      const indent = n.startsWith('↳') ? 0.3 : 0;
      s.addShape(p.ShapeType.roundRect, { x: f.x + indent, y, w: w - indent, h: 0.38, rectRadius: 0.09, fill: { color: TINT }, line: { type: 'none' } });
      s.addText(n, { x: f.x + indent + 0.2, y, w: w - indent - 1.72, h: 0.38, valign: 'middle', fontFace: DISP, fontSize: 12.5, bold: true, color: INK, margin: 0 });
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

  { name: 'Bizzing Business', status: ['EXPLORATORY', GOLD], age: 'Ages 11–16', reuse: 'Least of anything here',
    vision: 'A twelve-year-old who can look at a business and explain why it works.',
    why: 'It is what these families talk about at the dinner table, and almost nothing exists for children. It also lands squarely in the twelve-to-sixteen gap where the bee ends and families leave.',
    what: 'How a business makes money, pricing, customers, competition, brand and ethics — taught through real cases and capstone projects the child builds and pitches.',
    how: 'Case-based and project-based rather than drilled. This is the honest caveat: it is a different product shape from everything else in the house.',
    usp: ['Capstone projects. The child makes and pitches something real, which no product at this age does well — and it is exactly what the CKO already does with slime and clay.'],
    add: ['A case library written for eleven-year-olds',
          'Project submission, a rubric, and someone or something to review the work',
          'A decision on whether review is automated, parent-led, or a paid live service'] },
];

PRODUCTS.forEach((pr, idx) => {
  const s = lightSlide(pr.name, `Product ${idx + 1} of ${PRODUCTS.length}`, 8.6);
  const [tag, tagC] = pr.status;
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
    hexBullet(s, x + 0.28, 2.26, String(i + 1), GOLD, INK);
    s.addText(n, { x: x + 0.28, y: 2.84, w: 3.15, h: 0.4, fontFace: DISP, fontSize: 17, bold: true, color: PAPER, margin: 0 });
    s.addText(sub, { x: x + 0.28, y: 3.22, w: 3.15, h: 0.32, fontFace: BODY, fontSize: 10.5, italic: true, color: GOLD, margin: 0 });
    s.addText(body, { x: x + 0.28, y: 3.58, w: 3.15, h: 1.42, fontFace: BODY, fontSize: 10.5, color: TINT_D, margin: 0, lineSpacing: 13.5 });
  });
  s.addShape(p.ShapeType.roundRect, { x: M, y: 5.42, w: 11.6, h: 1.28, rectRadius: 0.12, fill: { color: PAPER, transparency: 94 }, line: { type: 'none' } });
  s.addText('Deliberately NOT building', { x: M + 0.32, y: 5.56, w: 5, h: 0.3, fontFace: BODY, fontSize: 10, bold: true, color: 'E8807A', charSpacing: 1.8, margin: 0 });
  s.addText('Coding · chess · music · dance. Every one has real diaspora demand, and every one needs a solver, a rating system or a live teacher. None of them reuses a single line of what has been built, and each would be a company of its own. Chess in particular is surging right now and is still the wrong answer for this house.', {
    x: M + 0.32, y: 5.9, w: 10.95, h: 0.7, fontFace: BODY, fontSize: 11.5, color: TINT_D, margin: 0, lineSpacing: 15,
  });
  s.addText('Twelve products total. The discipline is not thinking of them — it is refusing to start the fifth before the second has paid for itself.', {
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
    ['GATE 3', 'Both ends of the range', 'Buzz · Speak · English · Maths · Finance · Business', 'Unlocks when households run more than one product on one account. This is where the 4–6 and 12–16 gaps get closed.', VIOLET],
  ];
  const spineY = 3.05, CW = 2.76, GAP = 2.98;
  s.addShape(p.ShapeType.line, { x: M + CW / 2, y: spineY, w: GAP * 3, h: 0, line: { color: TINT_D, width: 3 } });
  gates.forEach(([tag, name, sub, why, c], i) => {
    const x = M + i * GAP, cx = x + CW / 2;
    s.addShape(p.ShapeType.hexagon, { x: cx - 0.28, y: spineY - 0.28, w: 0.56, h: 0.56, rotate: 90, fill: { color: c }, line: { color: PAPER, width: 2.5 } });
    s.addText(tag, { x, y: 2.3, w: CW, h: 0.3, align: 'center', fontFace: BODY, fontSize: 9.5, bold: true, color: c === GOLD ? GOLD_D : c, charSpacing: 1.6, margin: 0 });
    card(s, { x, y: 3.62, w: CW, h: 2.42, fill: i === 0 ? TINT : PAPER });
    if (i > 0) s.addShape(p.ShapeType.roundRect, { x, y: 3.62, w: CW, h: 2.42, rectRadius: 0.14, fill: { color: PAPER }, line: { color: TINT_D, width: 1.25 } });
    s.addText(name, { x: x + 0.22, y: 3.8, w: CW - 0.44, h: 0.6, fontFace: DISP, fontSize: 14.5, bold: true, color: INK, margin: 0 });
    s.addText(sub, { x: x + 0.22, y: 4.4, w: CW - 0.44, h: 0.44, fontFace: BODY, fontSize: 9.5, bold: true, color: VIOL_D, margin: 0, lineSpacing: 12 });
    s.addText(why, { x: x + 0.22, y: 4.86, w: CW - 0.44, h: 1.06, fontFace: BODY, fontSize: 10, color: '4A4360', margin: 0, lineSpacing: 13.5 });
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
    ['Live training', 'Bee coaching, workshops, beginner classes. Highest price per family and the only stream limited by someone’s time.', [null, null, LAUNCH]],
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

  s.addShape(p.ShapeType.roundRect, { x: M, y: 6.74, w: 11.6, h: 0.52, rectRadius: 0.12, fill: { color: 'FBF3E0' }, line: { type: 'none' } });
  s.addText([{ text: 'Two cautions:  ', options: { bold: true } },
             { text: 'merch that holds stock is a different business — cash, sizes, returns — so print-on-demand until something proves itself. And live training is the only line capped by a person’s calendar; it scales by being recorded, or by other people teaching it.' }], {
    x: M + 0.3, y: 6.74, w: 11.0, h: 0.52, fontFace: BODY, fontSize: 10.5, color: GOLD_D, margin: 0, valign: 'middle', lineSpacing: 13,
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

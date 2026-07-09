/* Bizzing Bee design system — React adapters over the app's own shipped code.
   The SVG generators (icons, cover art, mascot) are the app's files verbatim (src/vendor/);
   structural components carry the app's card/chip/button idiom via the shipped CSS classes
   and tokens. Worlds are set with <Root world="..." mode="..."> which drives every token. */
import React from 'react';
import './vendor/icons.js';
import './vendor/cover-art.js';
import './vendor/mascot.js';

const h = React.createElement;
const raw = (html, style, cls) => h('div', { className: cls, style, dangerouslySetInnerHTML: { __html: html } });

/** Sets the active world (theme) and mode on the document so every token resolves.
 *  Wrap every screen in Root — without it components render with no palette or display font.
 *  world: spellbound | spotlight | galaxy | blade | lab | origami | arcade | elements.
 *  mode: light | white | dusk. */
export function Root({ world = 'spellbound', mode = 'light', children }) {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', world);
    document.documentElement.setAttribute('data-mode', mode);
  }, [world, mode]);
  return h('div', { style: { fontFamily: 'var(--ui, system-ui)', color: 'var(--ink, #241E33)', background: 'var(--tint, #EFEBF8)', padding: 16, borderRadius: 12 } }, children);
}

/** Friendly duotone icon from the app's single icon dialect (24x24 grid, 2.1 stroke, currentColor duotone).
 *  Tints with the surrounding color. Names include: flame, target, pencil, compass, joystick, chart,
 *  users, home, crown, bulb, book, spark, gear, menu, volume, lock, grid, palette, steps, timer, cart, plus, close. */
export function Icon({ name = 'spark', size = 20, color }) {
  const html = (window.SB_ICON ? window.SB_ICON(name, { size }) : '');
  return h('span', { style: { display: 'inline-flex', color, lineHeight: 0, verticalAlign: 'middle' }, dangerouslySetInnerHTML: { __html: html } });
}

/** The Bizzing Bee mascot, straight from the app. Moods: happy, excited, love, sleepy, think, oops. */
export function Mascot({ mood = 'happy', size = 96 }) {
  return raw(window.SB_MASCOT ? window.SB_MASCOT(mood) : '', { width: size, height: Math.round(size * 1.12) });
}

/** Generated world cover art (composition x world prop kit). Cards: quest (trophy), concepts (bricks), journeys (route), arcade (cabinet), themes (swatches), traps (radar).
 *  Dark art on light modes, light art in dusk — pass dark for dusk surfaces. */
export function WorldCover({ world = 'spellbound', card = 'quest', height = 108, dark = false }) {
  return raw(window.SB_COVER ? window.SB_COVER(world, card, { h: height, dark }) : '');
}

/** Generated arcade game cover art. Games: buzz, beat, boss, mean, spot, origin, duel, magic. */
export function GameCover({ world = 'spellbound', game = 'buzz', height = 108, dark = false }) {
  return raw(window.SB_GAME ? window.SB_GAME(world, game, { h: height, dark }) : '');
}

/** Generated chapter cover art with a big label. */
export function ChapterCover({ world = 'spellbound', label = 'Ch 1', height = 94, dark = false }) {
  return raw(window.SB_CHAPTER ? window.SB_CHAPTER(world, label, { h: height, dark }) : '');
}

/** The app's card container: paper surface, hairline border, world radius and shadow.
 *  All card content uses the four type roles: CardTitle, CardSub, CardNote, CardLink. */
export function Card({ children, style }) { return h('div', { className: 'sb-card', style }, children); }

/** Card title role — the world's display face, 17px/800. One per card. */
export function CardTitle({ children, style }) { return h('div', { className: 'sb-ct', style }, children); }

/** Card body role — 13px muted, 1.45 line height. */
export function CardSub({ children, style }) { return h('div', { className: 'sb-cs', style }, children); }

/** Card note role — 12px muted small print. */
export function CardNote({ children, style }) { return h('div', { className: 'sb-cn', style }, children); }

/** Card accent link role — 12px/800 in the world's action color ("See the ladder →"). */
export function CardLink({ children, style }) { return h('span', { className: 'sb-cl', style }, children); }

/** Pill chip. tone="treasure" is the gold streak chip; tone="accent" is the world-tinted chip. */
export function Chip({ icon, children, tone = 'accent' }) {
  const t = tone === 'treasure'
    ? { background: 'var(--treasure-tint,#FFF3D6)', color: 'var(--treasure-deep,#8A5B00)' }
    : { background: 'var(--chip, rgba(108,79,224,.12))', color: 'var(--accent, #6C4FE0)' };
  return h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 'var(--r-pill,999px)', fontWeight: 800, fontSize: 13, ...t } },
    icon ? h(Icon, { name: icon, size: 14 }) : null, children);
}

/** The app's filled action button: world action color, press edge, 800 weight. */
export function ActionButton({ children, onClick, style }) {
  return h('button', { onClick, style: { padding: '11px 18px', borderRadius: 10, background: 'var(--action,var(--accent,#6C4FE0))', color: 'var(--action-ink,#fff)', fontWeight: 800, fontSize: 15, border: 0, cursor: 'pointer', boxShadow: 'var(--edge, inset 0 -2.5px 0 rgba(0,0,0,.16))', ...style } }, children);
}

/** The Bee Band banner from Home: icon tile, title, explainer, 9-dot band scale, accent link. */
export function BandBanner({ band = 4, tier = 'School-Bee Ready', calibrating = false }) {
  const dots = [1,2,3,4,5,6,7,8,9].map(n => h('span', { key: n, style: { width: n===band?11:7, height: n===band?11:7, borderRadius: 99, background: n<=band?'var(--action,var(--accent))':'var(--tint-deep,#E3DCF2)', boxShadow: n===band?'0 0 0 3px color-mix(in srgb,var(--action,var(--accent)) 25%,transparent)':'none' } }));
  return h('button', { className: 'sb-card', style: { width: '100%', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', background: 'linear-gradient(100deg,color-mix(in srgb,var(--action,var(--accent)) 14%,var(--paper,#fff)),var(--paper,#fff) 62%)', borderColor: 'color-mix(in srgb,var(--action,var(--accent)) 35%,var(--line,#E9E5F0))', borderRadius: 'var(--r-lg,16px)', padding: '12px 18px', cursor: 'pointer' } },
    h('span', { style: { display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 12, background: 'var(--action,var(--accent))', color: 'var(--action-ink,#fff)', flexShrink: 0 } }, h(Icon, { name: 'target', size: 22 })),
    h('span', { style: { minWidth: 0, flex: 1, textAlign: 'left' } },
      h('span', { className: 'sb-ct', style: { display: 'block' } }, calibrating ? 'Find your Bee Band' : `Bee Band ${band} · ${tier}`),
      h('span', { className: 'sb-cn', style: { display: 'block' } }, calibrating ? 'A 3-minute quest sets your words, games and tips exactly to you.' : 'Skill — what you’re ready to spell, proven by your words.')),
    calibrating ? null : h('span', { style: { display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 } }, dots),
    h('span', { className: 'sb-cl' }, calibrating ? 'Start →' : 'details →'));
}

/** The daily-goal conic ring with the count in the middle. */
export function GoalRing({ done = 4, goal = 10, size = 112 }) {
  const pct = Math.min(100, Math.round(done / (goal || 1) * 100));
  return h('div', { style: { width: size, height: size, borderRadius: '50%', display: 'grid', placeItems: 'center', background: `conic-gradient(var(--action,var(--accent)) ${pct}%, var(--tint-deep,#E3DCF2) 0)`, boxShadow: 'var(--sh-rest, 0 1px 2px rgba(36,30,51,.06))' } },
    h('div', { style: { width: size - 18, height: size - 18, borderRadius: '50%', background: 'var(--paper,#fff)', display: 'grid', placeItems: 'center', textAlign: 'center' } },
      h('div', null,
        h('div', { style: { fontFamily: 'var(--display)', fontWeight: 800, fontSize: 19, lineHeight: 1 } }, `${done}/${goal}`),
        h('div', { className: 'sb-cn', style: { marginTop: 2 } }, 'today'))));
}

/** The mobile bottom tab bar (fixed on phones in the app; static here for composition).
 *  items: [{key, label, icon}], active: key. */
export function TabBar({ items, active = 'home' }) {
  const its = items || [
    { key: 'home', label: 'Home', icon: 'home' }, { key: 'coach', label: 'Practice', icon: 'pencil' },
    { key: 'games', label: 'Arcade', icon: 'joystick' }, { key: 'progress', label: 'Progress', icon: 'chart' },
    { key: 'more', label: 'More', icon: 'menu' }];
  return h('nav', { style: { display: 'flex', background: 'var(--paper,#fff)', borderTop: '1px solid var(--line,#E9E5F0)', padding: '6px 6px 7px', borderRadius: 12 } },
    its.map(it => h('button', { key: it.key, style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontSize: 10.5, fontWeight: 800, padding: '5px 2px', borderRadius: 10, border: 0, cursor: 'pointer', background: it.key === active ? 'var(--chip, rgba(108,79,224,.12))' : 'transparent', color: it.key === active ? 'var(--accent)' : 'var(--muted,#6A6478)' } },
      h(Icon, { name: it.icon, size: 21 }), h('span', null, it.label))));
}

/** The gold-quote Tip of the Day card. */
export function TipOfDay({ label = 'Tip of the day', children }) {
  return h('div', { style: { position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 13, background: 'var(--paper,#fff)', border: '1px solid var(--line,#E9E5F0)', borderLeft: '4px solid var(--treasure,#F0B429)', borderRadius: 14, padding: '14px 18px', boxShadow: 'var(--sh-rest, 0 1px 2px rgba(36,30,51,.06))' } },
    h('span', { style: { flexShrink: 0, fontFamily: 'var(--display)', fontWeight: 800, fontSize: 32, lineHeight: .8, color: 'var(--treasure,#F0B429)' } }, '“'),
    h('span', { style: { minWidth: 0 } },
      h('span', { style: { display: 'block', fontSize: 11, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--treasure-deep,#8A5B00)', marginBottom: 3 } }, label),
      h('span', { style: { display: 'block', fontSize: 15, lineHeight: 1.5, fontWeight: 650, color: 'var(--ink,#241E33)' } }, children)));
}

/** The Bizzing Bee wordmark: italic Bizzing, upright Bee, in the world's display face. */
export function Wordmark({ size = 20 }) {
  return h('span', { style: { fontFamily: 'var(--display)', fontWeight: 800, fontSize: size, letterSpacing: '-.01em', whiteSpace: 'nowrap' } },
    h('i', { style: { fontStyle: 'italic' } }, 'Bizzing'), ' Bee');
}

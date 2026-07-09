/* ============================================================
   SPELLBOUND ICON SET — v3 "friendly duotone" (only icon dialect)
   One grid: 24×24 · chunky 2.1 stroke · round caps & joins ·
   DUOTONE: a soft currentColor fill (16%) sits under bold strokes,
   so every theme tints both layers automatically. Playful details
   (sparkles, tilted tile, gem-set crown) — slick, not corporate.
   Vanilla:  el.innerHTML = SB_ICON('flame', {size:20})
   React:    <SBIcon name="flame" size={20}/>  (window.SBIcon)
   Motion:   SB_ICON_MOTION() injects feedback classes (sb-pop …)
   Rules: zero emoji in chrome. Sizes 16 / 20 / 24 only.
   ============================================================ */
(function () {
  var P = {
    home: '<path d="M4.5 10.6 12 4.4l7.5 6.2V19a1.8 1.8 0 0 1-1.8 1.8H6.3A1.8 1.8 0 0 1 4.5 19Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4.5 10.6 12 4.4l7.5 6.2V19a1.8 1.8 0 0 1-1.8 1.8H6.3A1.8 1.8 0 0 1 4.5 19Z"/><circle cx="12" cy="14.8" r="2.3"/>',
    pencil: '<path d="M5.3 18.7l.8-3.7L15.5 5.6a2.4 2.4 0 0 1 3.4 3.4L9.5 18.4l-4.2.3Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M5.3 18.7l.8-3.7L15.5 5.6a2.4 2.4 0 0 1 3.4 3.4L9.5 18.4l-4.2.3Z"/><path d="M13.7 7.4l2.9 2.9"/><path d="M3.4 7.6h2.6M2.8 11h1.8"/>',
    gamepad: '<path d="M7.3 8.6h9.4a4.8 4.8 0 0 1 4.7 5.7l-.5 2.5a2.7 2.7 0 0 1-4.8 1.2l-1.4-1.8H9.3l-1.4 1.8a2.7 2.7 0 0 1-4.8-1.2l-.5-2.5A4.8 4.8 0 0 1 7.3 8.6Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M7.3 8.6h9.4a4.8 4.8 0 0 1 4.7 5.7l-.5 2.5a2.7 2.7 0 0 1-4.8 1.2l-1.4-1.8H9.3l-1.4 1.8a2.7 2.7 0 0 1-4.8-1.2l-.5-2.5A4.8 4.8 0 0 1 7.3 8.6Z"/><path d="M8.6 11.3v3.4M6.9 13h3.4"/><circle cx="15.3" cy="12" r="1.1" fill="currentColor" stroke="none"/><circle cx="17.7" cy="14.1" r="1.1" fill="currentColor" stroke="none"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2.6" fill="currentColor" opacity=".16" stroke="none"/><rect x="4" y="4" width="7" height="7" rx="2.6"/><rect x="13" y="4" width="7" height="7" rx="2.6"/><rect x="4" y="13" width="7" height="7" rx="2.6"/><g transform="rotate(9 16.5 16.5)"><rect x="13" y="13" width="7" height="7" rx="2.6" fill="currentColor" opacity=".16" stroke="none"/><rect x="13" y="13" width="7" height="7" rx="2.6"/></g>',
    book: '<path d="M4 5.2c4.2 0 6.4.6 8 2 1.6-1.4 3.8-2 8-2v13c-4.2 0-6.4.6-8 2-1.6-1.4-3.8-2-8-2Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4 5.2c4.2 0 6.4.6 8 2 1.6-1.4 3.8-2 8-2v13c-4.2 0-6.4.6-8 2-1.6-1.4-3.8-2-8-2Z"/><path d="M12 7.2V20"/><circle cx="7.8" cy="10.4" r="1" fill="currentColor" stroke="none"/><circle cx="16.2" cy="10.4" r="1" fill="currentColor" stroke="none"/>',
    palette: '<path d="M12 3.8a8.2 8.2 0 1 0 0 16.4h1.4a2.1 2.1 0 0 0 1.6-3.5c-.9-1-.2-2.3 1.1-2.3h1.4a4.6 4.6 0 0 0 4.6-4.6C21.7 6.3 17.4 3.8 12 3.8Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 3.8a8.2 8.2 0 1 0 0 16.4h1.4a2.1 2.1 0 0 0 1.6-3.5c-.9-1-.2-2.3 1.1-2.3h1.4a4.6 4.6 0 0 0 4.6-4.6C21.7 6.3 17.4 3.8 12 3.8Z"/><circle cx="8" cy="10.2" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="7.8" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="10.2" r="1.3" fill="currentColor" stroke="none"/>',
    chart: '<path d="M4.5 4.5v13.7a1.8 1.8 0 0 0 1.8 1.8h13.2"/><path d="M9.2 15.3v-4M13.2 15.3V7.8M17.2 15.3v-2.2" stroke-width="3.1"/><path d="M18.5 3.4l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7Z" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9" cy="8.6" r="3.4" fill="currentColor" opacity=".16" stroke="none"/><path d="M3.6 19.6c.6-3.1 2.8-4.7 5.4-4.7s4.8 1.6 5.4 4.7Z" fill="currentColor" opacity=".16" stroke="none"/><circle cx="9" cy="8.6" r="3.4"/><path d="M3.6 19.6c.6-3.1 2.8-4.7 5.4-4.7s4.8 1.6 5.4 4.7"/><path d="M15.4 5.8a3.4 3.4 0 0 1 0 5.7"/><path d="M17.2 15.2c1.8.7 3 2.2 3.3 4.4"/>',
    compass: '<circle cx="12" cy="12" r="8" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="12" r="8"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1Z" fill="currentColor" stroke="none"/>',
    coin: '<circle cx="12" cy="12" r="8" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="12" r="8"/><path d="M12 8.4l1.05 2.1 2.35.35-1.7 1.65.4 2.3L12 13.7l-2.1 1.1.4-2.3-1.7-1.65 2.35-.35Z"/>',
    flame: '<path d="M12 3.4c.5 2.7-.6 4.3-2.1 5.8-1.5 1.5-2.9 3.1-2.9 5.8a5 5 0 0 0 10 0c0-1.9-.7-3.3-1.8-4.6-.4 1-1 1.7-2 2.2.4-3-.3-6.6-1.2-9.2Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 3.4c.5 2.7-.6 4.3-2.1 5.8-1.5 1.5-2.9 3.1-2.9 5.8a5 5 0 0 0 10 0c0-1.9-.7-3.3-1.8-4.6-.4 1-1 1.7-2 2.2.4-3-.3-6.6-1.2-9.2Z"/><path d="M12 13.2c1.1 1 1.6 2 1.6 3.1a1.6 1.6 0 1 1-3.2 0c0-1.1.5-2.1 1.6-3.1Z" fill="currentColor" stroke="none"/>',
    star: '<path d="M12 3.6l2.7 5.1 5.7.9-4.1 4 .95 5.7L12 16.6l-5.25 2.7.95-5.7-4.1-4 5.7-.9Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 3.6l2.7 5.1 5.7.9-4.1 4 .95 5.7L12 16.6l-5.25 2.7.95-5.7-4.1-4 5.7-.9Z"/><circle cx="20.2" cy="4.2" r="1" fill="currentColor" stroke="none"/>',
    crown: '<path d="M4.3 8.1 8 11.3 12 5.6l4 5.7 3.7-3.2v8.4a2 2 0 0 1-2 2H6.3a2 2 0 0 1-2-2Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4.3 8.1 8 11.3 12 5.6l4 5.7 3.7-3.2v8.4a2 2 0 0 1-2 2H6.3a2 2 0 0 1-2-2Z"/><circle cx="8" cy="15.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="15.4" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="15.4" r="1.1" fill="currentColor" stroke="none"/>',
    lock: '<rect x="5" y="10.6" width="14" height="9.4" rx="3" fill="currentColor" opacity=".16" stroke="none"/><rect x="5" y="10.6" width="14" height="9.4" rx="3"/><path d="M8.3 10.6V8.1a3.7 3.7 0 0 1 7.4 0v2.5"/><circle cx="12" cy="14.6" r="1.4" fill="currentColor" stroke="none"/><path d="M12 15.6v1.9"/>',
    play: '<path d="M8.4 5.7v12.6c0 1 1.1 1.6 1.9 1L19.8 13c.8-.5.8-1.7 0-2.2L10.3 4.7c-.8-.6-1.9 0-1.9 1Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M8.4 5.7v12.6c0 1 1.1 1.6 1.9 1L19.8 13c.8-.5.8-1.7 0-2.2L10.3 4.7c-.8-.6-1.9 0-1.9 1Z"/>',
    pause: '<rect x="7.4" y="5.4" width="3.6" height="13.2" rx="1.8" fill="currentColor" opacity=".16" stroke="none"/><rect x="7.4" y="5.4" width="3.6" height="13.2" rx="1.8"/><rect x="13" y="5.4" width="3.6" height="13.2" rx="1.8" fill="currentColor" opacity=".16" stroke="none"/><rect x="13" y="5.4" width="3.6" height="13.2" rx="1.8"/>',
    speaker: '<path d="M4.3 9.3h3L12 5.6v12.8l-4.7-3.7h-3Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4.3 9.3h3L12 5.6v12.8l-4.7-3.7h-3Z"/><path d="M15.4 9.4a4.2 4.2 0 0 1 0 5.2M18 7.2a7.6 7.6 0 0 1 0 9.6"/>',
    mute: '<path d="M4.3 9.3h3L12 5.6v12.8l-4.7-3.7h-3Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M4.3 9.3h3L12 5.6v12.8l-4.7-3.7h-3Z"/><path d="M16.4 9.8l4.4 4.4M20.8 9.8l-4.4 4.4"/>',
    retry: '<path d="M19.6 5.4v4.3h-4.3"/><path d="M19.3 9.7a7.5 7.5 0 1 0 .6 4.4"/><circle cx="12" cy="13.9" r="1.4" fill="currentColor" stroke="none"/>',
    printer: '<rect x="4.3" y="8" width="15.4" height="7.8" rx="2.2" fill="currentColor" opacity=".16" stroke="none"/><path d="M7 8V4.4h10V8"/><rect x="4.3" y="8" width="15.4" height="7.8" rx="2.2"/><path d="M7 13.2h10v6.4H7Z"/><circle cx="17" cy="10.8" r="1" fill="currentColor" stroke="none"/>',
    check: '<path d="M4.8 12.6l4.6 4.6L19.2 7.4" stroke-width="2.8"/>',
    x: '<path d="M6.8 6.8l10.4 10.4M17.2 6.8 6.8 17.2" stroke-width="2.6"/>',
    arrowRight: '<path d="M4.4 12h15.2M13.4 5.8l6.2 6.2-6.2 6.2" stroke-width="2.4"/>',
    arrowLeft: '<path d="M19.6 12H4.4M10.6 5.8 4.4 12l6.2 6.2" stroke-width="2.4"/>',
    chevronDown: '<path d="M5.8 9.2l6.2 6.2 6.2-6.2" stroke-width="2.6"/>',
    timer: '<circle cx="12" cy="13.6" r="7" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="13.6" r="7"/><path d="M12 13.6l2.8-2.8"/><path d="M9.4 3.2h5.2"/><path d="M18.8 6.2l1.5 1.5"/>',
    target: '<circle cx="12" cy="12" r="7.8" fill="currentColor" opacity=".16" stroke="none"/><circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="4.4"/><circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none"/>',
    bulb: '<path d="M9 17.6v-1c0-1.1-.7-2-1.5-2.9a6.3 6.3 0 1 1 9 0c-.8.9-1.5 1.8-1.5 2.9v1Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M9 17.6v-1c0-1.1-.7-2-1.5-2.9a6.3 6.3 0 1 1 9 0c-.8.9-1.5 1.8-1.5 2.9v1Z"/><path d="M9.6 20.8h4.8"/><path d="M2.8 9.6h1.7M19.5 9.6h1.7M4.9 3.7l1.2 1.2M19.1 3.7l-1.2 1.2"/>',
    sparkle: '<path d="M12 3.8l1.9 5.4 5.4 1.9-5.4 1.9-1.9 5.4-1.9-5.4-5.4-1.9 5.4-1.9Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 3.8l1.9 5.4 5.4 1.9-5.4 1.9-1.9 5.4-1.9-5.4-5.4-1.9 5.4-1.9Z"/><path d="M18.9 15.6v3.6M17.1 17.4h3.6"/>',
    trophy: '<path d="M8 4.6h8v5.6a4 4 0 0 1-8 0Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M8 4.6h8v5.6a4 4 0 0 1-8 0Z"/><path d="M8 6.2H5a2.7 2.7 0 0 0 2.8 3.5M16 6.2h3a2.7 2.7 0 0 1-2.8 3.5"/><path d="M12 14.4v2.4"/><path d="M8.6 19.6c.4-2 1.8-3 3.4-3s3 1 3.4 3Z"/><path d="M12 6.3l.65 1.3 1.45.2-1.05 1 .25 1.45L12 9.55l-1.3.7.25-1.45-1.05-1 1.45-.2Z" fill="currentColor" stroke="none"/>',
    swords: '<path d="M5.2 5.2l9.2 9.2M18.8 5.2l-9.2 9.2"/><path d="M15.4 13.2l3.4 3.4M13.2 15.4l3.4 3.4M8.6 13.2l-3.4 3.4M10.8 15.4l-3.4 3.4"/><circle cx="19.5" cy="19.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.5" cy="19.5" r="1.2" fill="currentColor" stroke="none"/>',
    heart: '<path d="M12 19.8c-4.7-3.1-8.3-6-8.3-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.3 2.8c0 3.6-3.6 6.5-8.3 9.6Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 19.8c-4.7-3.1-8.3-6-8.3-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.3 2.8c0 3.6-3.6 6.5-8.3 9.6Z"/><circle cx="8.6" cy="9.8" r="1.1" fill="currentColor" stroke="none"/>',
    plus: '<path d="M12 5.2v13.6M5.2 12h13.6" stroke-width="2.8"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4" fill="currentColor" opacity=".16" stroke="none"/><circle cx="10.8" cy="10.8" r="6.4"/><path d="M15.6 15.6 20.4 20.4" stroke-width="2.6"/><path d="M7.8 9.2a3.4 3.4 0 0 1 2-1.9"/>',
    sliders: '<path d="M4.4 7.3h6.6M15.9 7.3h3.7M4.4 16.7h3.7M13 16.7h6.6"/><circle cx="13.4" cy="7.3" r="2.3" fill="currentColor" opacity=".16" stroke="none"/><circle cx="13.4" cy="7.3" r="2.3"/><circle cx="10.4" cy="16.7" r="2.3" fill="currentColor" opacity=".16" stroke="none"/><circle cx="10.4" cy="16.7" r="2.3"/>',
    list: '<path d="M9.4 6.4h10.2M9.4 12h10.2M9.4 17.6h10.2"/><circle cx="4.9" cy="6.4" r="1.5" fill="currentColor" stroke="none"/><circle cx="4.9" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4.9" cy="17.6" r="1.5" fill="currentColor" stroke="none"/>',
    mic: '<rect x="9" y="3.4" width="6" height="10.4" rx="3" fill="currentColor" opacity=".16" stroke="none"/><rect x="9" y="3.4" width="6" height="10.4" rx="3"/><path d="M5.6 11.6a6.4 6.4 0 0 0 12.8 0"/><path d="M12 18v2.6"/>',
    calendar: '<rect x="4" y="5.6" width="16" height="14.6" rx="2.4" fill="currentColor" opacity=".16" stroke="none"/><rect x="4" y="5.6" width="16" height="14.6" rx="2.4"/><path d="M4 10.2h16"/><path d="M8.2 3.2v3M15.8 3.2v3"/><circle cx="8.4" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="15.6" cy="14" r="1.1" fill="currentColor" stroke="none"/><circle cx="8.4" cy="17.3" r="1.1" fill="currentColor" stroke="none"/>',
    bee: '<path d="M12 9c2.7 0 4.6 2 4.6 4.7S14.7 18.6 12 18.6s-4.6-2.2-4.6-4.9S9.3 9 12 9Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 9c2.7 0 4.6 2 4.6 4.7S14.7 18.6 12 18.6s-4.6-2.2-4.6-4.9S9.3 9 12 9Z"/><path d="M7.7 12h8.6M7.6 15h8.8"/><path d="M9.9 9.2C8.2 6.2 5.3 6.3 5 7.8c-.3 1.4 1.8 2.7 4.7 1.6"/><path d="M14.1 9.2c1.7-3 4.6-2.9 4.9-1.4.3 1.4-1.8 2.7-4.7 1.6"/><path d="M10.7 8.7 9.8 6.4M13.3 8.7l.9-2.3"/><circle cx="9.5" cy="5.9" r="1" fill="currentColor" stroke="none"/><circle cx="14.5" cy="5.9" r="1" fill="currentColor" stroke="none"/><path d="M12 18.6v1.6"/>',
    hive: '<path d="M12 3.8c3.8 0 6.2 2 6.6 5 .5 3.5 1.4 8.4-1.3 11.2H6.7C4 17.2 4.9 12.3 5.4 8.8c.4-3 2.8-5 6.6-5Z" fill="currentColor" opacity=".16" stroke="none"/><path d="M12 3.8c3.8 0 6.2 2 6.6 5 .5 3.5 1.4 8.4-1.3 11.2H6.7C4 17.2 4.9 12.3 5.4 8.8c.4-3 2.8-5 6.6-5Z"/><path d="M5 9.4h14M4.7 14.2h14.6"/><path d="M10.1 20v-1.7a1.9 1.9 0 0 1 3.8 0V20" fill="currentColor" stroke="none"/><circle cx="19.4" cy="4.6" r="1" fill="currentColor" stroke="none"/>',
    tile: '<rect x="4" y="4" width="16" height="16" rx="3.4" fill="currentColor" opacity=".16" stroke="none"/><rect x="4" y="4" width="16" height="16" rx="3.4"/><path d="M8.8 15.8 12 8l3.2 7.8M10 13.6h4" stroke-width="2.3"/>'
  };

  function SB_ICON(name, o) {
    o = o || {};
    var s = o.size || 24, sw = o.stroke || 2.1;
    var b = P[name];
    if (!b) { console.warn('[SB_ICON] unknown icon: ' + name); b = P.tile; }
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + sw + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:none">' + b + '</svg>';
  }

  function SBIcon(props) {
    var R = window.React, s = props.size || 24;
    return R.createElement('svg', {
      width: s, height: s, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: props.stroke || 2.1,
      strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
      style: { display: 'block', flex: 'none', color: props.color },
      dangerouslySetInnerHTML: { __html: P[props.name] || P.tile }
    });
  }

  function SBIconSheet(props) {
    var R = window.React, names = Object.keys(P);
    return R.createElement('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(88px,1fr))', gap: '10px' }
    }, names.map(function (n) {
      return R.createElement('div', {
        key: n,
        style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '14px 6px 10px', background: '#FFFFFF', border: '1px solid #E9E5F0', borderRadius: '10px', color: '#241E33' }
      }, [
        R.createElement(SBIcon, { name: n, size: 24, key: 'i' }),
        R.createElement('div', { key: 't', style: { fontFamily: '"Hanken Grotesk",system-ui,sans-serif', fontSize: '12px', fontWeight: 650, color: '#6A6478', letterSpacing: '.01em' } }, n)
      ]);
    }));
  }

  var MOTION_CSS = '@keyframes sbPop{0%,64%,100%{transform:scale(1)}18%{transform:scale(1.25)}}@keyframes sbWiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-12deg)}75%{transform:rotate(12deg)}}@keyframes sbSpin{to{transform:rotate(360deg)}}@keyframes sbPulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes sbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}.sb-pop:hover svg,.sb-pop:active svg{animation:sbPop .5s ease}.sb-wiggle:hover svg{animation:sbWiggle .5s ease}.sb-spin svg{animation:sbSpin 1s linear infinite}.sb-pulse svg{animation:sbPulse 1.8s ease-in-out infinite}.sb-bob svg{animation:sbBob 2.6s ease-in-out infinite}@media (prefers-reduced-motion:reduce){.sb-pop svg,.sb-wiggle svg,.sb-spin svg,.sb-pulse svg,.sb-bob svg{animation:none!important}}';
  function SB_ICON_MOTION() {
    if (document.getElementById('sb-icon-motion')) return;
    var st = document.createElement('style');
    st.id = 'sb-icon-motion';
    st.textContent = MOTION_CSS;
    document.head.appendChild(st);
  }

  /* The mascot as art (full-color, NOT a grid icon) — use for logo lockups, greeting card, empty states. */
  var BEE_ART = '<ellipse cx="58" cy="106" rx="30" ry="50" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="3" opacity=".92" transform="rotate(-26 58 106)"></ellipse><ellipse cx="182" cy="106" rx="30" ry="50" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="3" opacity=".92" transform="rotate(26 182 106)"></ellipse><path d="M104,84 Q88,48 84,28" fill="none" stroke="#3A2A8C" stroke-width="6" stroke-linecap="round"></path><path d="M136,84 Q152,48 156,28" fill="none" stroke="#3A2A8C" stroke-width="6" stroke-linecap="round"></path><path d="M84.0,13.0L86.6,20.4L94.5,20.6L88.3,25.4L90.5,32.9L84.0,28.5L77.5,32.9L79.7,25.4L73.5,20.6L81.4,20.4Z" fill="#FFC83D"></path><path d="M156.0,13.0L158.6,20.4L166.5,20.6L160.3,25.4L162.5,32.9L156.0,28.5L149.5,32.9L151.7,25.4L145.5,20.6L153.4,20.4Z" fill="#FFC83D"></path><ellipse cx="32" cy="196" rx="13" ry="20" fill="#FFC23D" transform="rotate(22 32 196)"></ellipse><ellipse cx="208" cy="196" rx="13" ry="20" fill="#FFC23D" transform="rotate(-22 208 196)"></ellipse><ellipse cx="120" cy="172" rx="88" ry="96" fill="#FFC23D"></ellipse><ellipse cx="98" cy="118" rx="42" ry="30" fill="#FFD86E" opacity=".5"></ellipse><defs><clipPath id="bclip"><ellipse cx="120" cy="172" rx="88" ry="96"></ellipse></clipPath></defs><g clip-path="url(#bclip)"><rect x="28" y="214" width="184" height="24" fill="#3A2A8C"></rect><rect x="28" y="246" width="184" height="24" fill="#3A2A8C"></rect></g><g transform="translate(0,-18)"><ellipse cx="62" cy="184" rx="15" ry="9" fill="#FF7FBE" opacity=".85"></ellipse><ellipse cx="178" cy="184" rx="15" ry="9" fill="#FF7FBE" opacity=".85"></ellipse><circle cx="92" cy="150" r="27" fill="#FFFFFF"></circle><circle cx="94" cy="152" r="13" fill="#2B1B5E"></circle><circle cx="89.45" cy="146.8" r="4.16" fill="#FFFFFF"></circle><circle cx="152" cy="150" r="27" fill="#FFFFFF"></circle><circle cx="154" cy="152" r="13" fill="#2B1B5E"></circle><circle cx="149.45" cy="146.8" r="4.16" fill="#FFFFFF"></circle><path d="M96,196 Q120,224 150,196" fill="none" stroke="#3A1E5C" stroke-width="9" stroke-linecap="round"></path></g>';
  function SBBee(props) {
    var R = window.React, w = (props && props.size) || 104;
    return R.createElement('svg', {
      viewBox: '0 0 240 270', width: w, height: Math.round(w * 1.125),
      role: 'img', 'aria-label': 'Bizzing Bee bee',
      style: { display: 'block', flex: 'none', overflow: 'visible' },
      dangerouslySetInnerHTML: { __html: BEE_ART }
    });
  }

  window.SB_ICON_PATHS = P;
  window.SB_BEE_ART = BEE_ART;
  window.SBBee = SBBee;
  window.SB_MOTION_CSS = MOTION_CSS;
  window.SB_ICON_MOTION = SB_ICON_MOTION;
  window.SB_ICON = SB_ICON;
  window.SBIcon = SBIcon;
  window.SBIconSheet = SBIconSheet;
})();

/* Bizzing Bee — redesigned avatar art (from Claude Design). 15 packs x 10, 120x120 viewBox
   inner markup keyed by id, consumed by SB_AVATAR(id,size) in avatars.js. */
window.SB_MASCOT = window.SB_MASCOT || (typeof mascotSVG !== 'undefined' ? mascotSVG : (typeof window !== 'undefined' && window.mascotSVG) || null);
window.SB_AVATAR_ART = window.SB_AVATAR_ART || {};

/* HIVE PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

bizzy: (window.SB_MASCOT ? '<g transform="translate(4,2) scale(.47)">' + window.SB_MASCOT('happy').replace(/<\/?svg[^>]*>/g, '') + '</g>' : ''),

honeypot: `<defs><radialGradient id="hp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F2B95A"/><stop offset="1" stop-color="#C8791B"/></radialGradient></defs>
<path d="M26 52 q-7 5 -7 13 q0 8 7 12 q-3 30 34 30 q37 0 34 -30 q7 -4 7 -12 q0 -8 -7 -13 z" fill="url(#hp-g)"/>
<path d="M26 52 q0 -14 34 -14 q34 0 34 14 q0 8 -34 8 q-34 0 -34 -8 z" fill="#FFCC5C"/>
<path d="M44 44 q-2 12 3 16 q5 -3 2 -16 z" fill="#FFCC5C"/>
<path d="M60 30 q-3 8 0 14 q6 -2 4 -12 q-1 -5 -4 -2 z" fill="#F2B95A"/>
<ellipse cx="38" cy="102" rx="7" ry="5" fill="#A85F12"/><ellipse cx="82" cy="102" rx="7" ry="5" fill="#A85F12"/>
<circle cx="46" cy="72" r="10" fill="#fff"/><circle cx="48" cy="74" r="5" fill="#2B1B5E"/><circle cx="46.5" cy="72.5" r="1.8" fill="#fff"/>
<circle cx="74" cy="72" r="10" fill="#fff"/><circle cx="76" cy="74" r="5" fill="#2B1B5E"/><circle cx="74.5" cy="72.5" r="1.8" fill="#fff"/>
<ellipse cx="34" cy="84" rx="6" ry="3.5" fill="#FF7FBE" opacity=".85"/><ellipse cx="86" cy="84" rx="6" ry="3.5" fill="#FF7FBE" opacity=".85"/>
<path d="M52 86 q8 8 16 0" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>`,

bumble: `<defs><radialGradient id="bb-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#FFC23D"/></radialGradient><clipPath id="bb-c"><ellipse cx="60" cy="70" rx="36" ry="32"/></clipPath></defs>
<ellipse cx="40" cy="34" rx="9" ry="14" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-28 40 34)"/>
<ellipse cx="80" cy="34" rx="9" ry="14" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(28 80 34)"/>
<ellipse cx="60" cy="70" rx="36" ry="32" fill="url(#bb-g)"/>
<g clip-path="url(#bb-c)"><rect x="20" y="88" width="80" height="9" fill="#3A2A8C"/><rect x="20" y="100" width="80" height="8" fill="#3A2A8C"/></g>
<ellipse cx="46" cy="55" rx="14" ry="9" fill="#FFE49B" opacity=".6"/>
<path d="M50 40 q-4 -10 -8 -13" fill="none" stroke="#3A2A8C" stroke-width="3.5" stroke-linecap="round"/><circle cx="41" cy="26" r="4" fill="#3A2A8C"/>
<path d="M70 40 q4 -10 8 -13" fill="none" stroke="#3A2A8C" stroke-width="3.5" stroke-linecap="round"/><circle cx="79" cy="26" r="4" fill="#3A2A8C"/>
<circle cx="46" cy="66" r="9" fill="#fff"/><path d="M37 64 a9 9 0 0 1 18 0 z" fill="#FFC23D"/><circle cx="47" cy="68" r="4.5" fill="#2B1B5E"/><circle cx="45.7" cy="66.7" r="1.6" fill="#fff"/>
<circle cx="74" cy="66" r="9" fill="#fff"/><path d="M65 64 a9 9 0 0 1 18 0 z" fill="#FFC23D"/><circle cx="75" cy="68" r="4.5" fill="#2B1B5E"/><circle cx="73.7" cy="66.7" r="1.6" fill="#fff"/>
<ellipse cx="36" cy="76" rx="5.5" ry="3.5" fill="#FF7FBE" opacity=".85"/><ellipse cx="84" cy="76" rx="5.5" ry="3.5" fill="#FF7FBE" opacity=".85"/>
<path d="M54 82 h13" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="46" cy="103" rx="7" ry="5" fill="#E8A33D"/><ellipse cx="74" cy="103" rx="7" ry="5" fill="#E8A33D"/>`,

waggle: `<defs><radialGradient id="wg-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#FFC23D"/></radialGradient><clipPath id="wg-c"><ellipse cx="60" cy="68" rx="28" ry="26"/></clipPath></defs>
<path d="M20 44 q-7 10 0 22" fill="none" stroke="#C4B4FF" stroke-width="3" stroke-linecap="round"/>
<path d="M13 50 q-4 7 0 12" fill="none" stroke="#C4B4FF" stroke-width="3" stroke-linecap="round"/>
<g transform="rotate(-10 60 66)">
<ellipse cx="42" cy="36" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-30 42 36)"/>
<ellipse cx="78" cy="36" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(30 78 36)"/>
<path d="M86 54 q10 -8 8 -18" fill="none" stroke="#FFC23D" stroke-width="7" stroke-linecap="round"/><circle cx="94" cy="34" r="5" fill="#FFC23D"/>
<ellipse cx="60" cy="68" rx="28" ry="26" fill="url(#wg-g)"/>
<g clip-path="url(#wg-c)"><rect x="30" y="80" width="60" height="8" fill="#3A2A8C"/><rect x="30" y="92" width="60" height="8" fill="#3A2A8C"/></g>
<path d="M40 46 q20 -24 40 0" fill="none" stroke="#3A2A8C" stroke-width="5" stroke-linecap="round"/>
<rect x="33" y="46" width="10" height="13" rx="5" fill="#3A2A8C"/><rect x="77" y="46" width="10" height="13" rx="5" fill="#3A2A8C"/>
<path d="M48 66 q4 -5 8 0" fill="none" stroke="#2B1B5E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M64 66 q4 -5 8 0" fill="none" stroke="#2B1B5E" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="42" cy="75" rx="4.5" ry="2.8" fill="#FF7FBE" opacity=".8"/><ellipse cx="78" cy="75" rx="4.5" ry="2.8" fill="#FF7FBE" opacity=".8"/>
<path d="M53 78 q7 8 14 0 q-7 3 -14 0 z" fill="#3A1E5C"/>
<ellipse cx="48" cy="98" rx="6" ry="4.5" fill="#E8A33D"/><ellipse cx="72" cy="98" rx="6" ry="4.5" fill="#E8A33D" transform="translate(2 -4)"/>
</g>
<circle cx="24" cy="30" r="2.2" fill="#FFC83D"/><circle cx="103" cy="62" r="2.2" fill="#FFC83D"/>`,

drone: `<defs><radialGradient id="dr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#FFC23D"/></radialGradient><clipPath id="dr-c"><ellipse cx="60" cy="68" rx="30" ry="28"/></clipPath></defs>
<ellipse cx="34" cy="44" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-52 34 44)"/>
<ellipse cx="86" cy="44" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(52 86 44)"/>
<ellipse cx="60" cy="68" rx="30" ry="28" fill="url(#dr-g)"/>
<g clip-path="url(#dr-c)"><rect x="28" y="82" width="64" height="8" fill="#3A2A8C"/><rect x="28" y="94" width="64" height="8" fill="#3A2A8C"/></g>
<path d="M38 42 a24 14 0 0 1 44 0 z" fill="#5A8DEE"/>
<path d="M80 38 q13 -1 15 6 q-8 5 -16 1 z" fill="#4A76D0"/>
<path d="M40 42 q20 -6 40 0" fill="none" stroke="#4A76D0" stroke-width="3" stroke-linecap="round"/>
<circle cx="60" cy="32" r="3.5" fill="#3A5CB0"/>
<circle cx="47" cy="62" r="9" fill="#fff"/><path d="M38 60 a9 9 0 0 1 18 0 l0 2 -18 0 z" fill="#FFC23D"/><path d="M38 62 h18" stroke="#B8862A" stroke-width="2.5" stroke-linecap="round"/><circle cx="48" cy="66" r="4" fill="#2B1B5E"/>
<circle cx="73" cy="62" r="9" fill="#fff"/><path d="M64 60 a9 9 0 0 1 18 0 l0 2 -18 0 z" fill="#FFC23D"/><path d="M64 62 h18" stroke="#B8862A" stroke-width="2.5" stroke-linecap="round"/><circle cx="74" cy="66" r="4" fill="#2B1B5E"/>
<path d="M54 78 q6 4 12 0" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M32 90 q28 10 56 0 l0 8 q-28 9 -56 0 z" fill="#7A5230"/>
<rect x="54" y="90" width="12" height="9" rx="2" fill="#FFC83D"/>
<path d="M40 92 l7 6 M47 92 l-7 6" stroke="#C9C2DD" stroke-width="3" stroke-linecap="round"/>
<circle cx="78" cy="96" r="3.5" fill="none" stroke="#C9C2DD" stroke-width="2.5"/>
<ellipse cx="48" cy="108" rx="7" ry="5" fill="#E8A33D"/><ellipse cx="72" cy="108" rx="7" ry="5" fill="#E8A33D"/>`,

clover: `<circle cx="45" cy="48" r="17" fill="#4CAF50"/><circle cx="75" cy="48" r="17" fill="#4CAF50"/><circle cx="60" cy="72" r="17" fill="#4CAF50"/>
<circle cx="60" cy="57" r="17" fill="#57BB61"/>
<path d="M62 32 q3 -13 14 -16 q1 13 -9 18 z" fill="#3E9B4F"/>
<path d="M58 88 q-1 12 -8 18" fill="none" stroke="#3E9B4F" stroke-width="5" stroke-linecap="round"/>
<circle cx="51" cy="56" r="8" fill="#fff"/><circle cx="52.5" cy="57.5" r="4" fill="#2B1B5E"/><circle cx="51.3" cy="56.3" r="1.4" fill="#fff"/>
<path d="M65 55 q5 -4 10 1" fill="none" stroke="#2B1B5E" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="44" cy="66" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/><ellipse cx="76" cy="66" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/>
<path d="M52 68 q8 8 17 -1" fill="none" stroke="#2B4A1E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M30 26 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5 z" fill="#FFC83D"/>
<path d="M94 78 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`,

blossom: `<g>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF9EC4"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF9EC4" transform="rotate(45 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF8AB8" transform="rotate(90 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF9EC4" transform="rotate(135 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF8AB8" transform="rotate(180 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF9EC4" transform="rotate(225 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF8AB8" transform="rotate(270 60 58)"/>
<ellipse cx="60" cy="30" rx="11" ry="17" fill="#FF9EC4" transform="rotate(315 60 58)"/>
</g>
<circle cx="60" cy="58" r="20" fill="#FFD9A8"/>
<path d="M60 82 q0 14 -2 20" fill="none" stroke="#4CAF50" stroke-width="4" stroke-linecap="round"/>
<ellipse cx="70" cy="96" rx="8" ry="4" fill="#4CAF50" transform="rotate(-24 70 96)"/>
<circle cx="52" cy="55" r="7" fill="#fff"/><circle cx="53.5" cy="56.5" r="3.6" fill="#2B1B5E"/><circle cx="52.3" cy="55.3" r="1.3" fill="#fff"/>
<circle cx="68" cy="55" r="7" fill="#fff"/><circle cx="69.5" cy="56.5" r="3.6" fill="#2B1B5E"/><circle cx="68.3" cy="55.3" r="1.3" fill="#fff"/>
<path d="M45 49 l-4 -3 M47 46 l-3 -4" stroke="#2B1B5E" stroke-width="2" stroke-linecap="round"/>
<path d="M75 49 l4 -3 M73 46 l3 -4" stroke="#2B1B5E" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="47" cy="63" rx="5.5" ry="3.5" fill="#FF7FBE" opacity=".95"/><ellipse cx="73" cy="63" rx="5.5" ry="3.5" fill="#FF7FBE" opacity=".95"/>
<path d="M53 66 q7 7 14 0" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>`,

nectar: `<defs><radialGradient id="nc-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#E8A33D"/></radialGradient></defs>
<path d="M60 14 q27 32 27 56 a27 27 0 0 1 -54 0 q0 -24 27 -56 z" fill="url(#nc-g)"/>
<path d="M45 56 q-6 14 2 24" fill="none" stroke="#FFE9A8" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<path d="M44 54 q5 -5 10 -2" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M66 50 q5 -3 10 1" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="51" cy="64" r="8" fill="#fff"/><circle cx="52.5" cy="65.5" r="4" fill="#2B1B5E"/><circle cx="51.3" cy="64.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="62" r="8" fill="#fff"/><circle cx="72.5" cy="63.5" r="4" fill="#2B1B5E"/><circle cx="71.3" cy="62.3" r="1.4" fill="#fff"/>
<ellipse cx="44" cy="74" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/><ellipse cx="78" cy="72" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/>
<path d="M52 79 q9 8 17 -2" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>
<g transform="rotate(16 70 66)"><rect x="67" y="50" width="6" height="30" rx="3" fill="#5AC8FA"/><rect x="64" y="46" width="14" height="6" rx="3" fill="#4AB4E8"/></g>`,

propolis: `<ellipse cx="40" cy="30" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-34 40 30)"/>
<ellipse cx="80" cy="30" rx="8" ry="13" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(34 80 30)"/>
<circle cx="60" cy="42" r="21" fill="#FFC23D"/>
<path d="M50 24 q-3 -8 -7 -11" fill="none" stroke="#3A2A8C" stroke-width="3" stroke-linecap="round"/><circle cx="42" cy="12" r="3.5" fill="#3A2A8C"/>
<path d="M70 24 q3 -8 7 -11" fill="none" stroke="#3A2A8C" stroke-width="3" stroke-linecap="round"/><circle cx="78" cy="12" r="3.5" fill="#3A2A8C"/>
<path d="M42 34 l11 4 M78 34 l-11 4" stroke="#2B1B5E" stroke-width="3" stroke-linecap="round"/>
<circle cx="50" cy="44" r="7" fill="#fff"/><circle cx="51.5" cy="45" r="3.6" fill="#2B1B5E"/><circle cx="50.3" cy="44" r="1.3" fill="#fff"/>
<circle cx="70" cy="44" r="7" fill="#fff"/><circle cx="71.5" cy="45" r="3.6" fill="#2B1B5E"/><circle cx="70.3" cy="44" r="1.3" fill="#fff"/>
<path d="M54 54 q6 4 12 0" fill="none" stroke="#3A1E5C" stroke-width="3" stroke-linecap="round"/>
<path d="M60 58 L86 72 L86 96 L60 110 L34 96 L34 72 z" fill="#F7B733" stroke="#8A5B00" stroke-width="3" stroke-linejoin="round"/>
<path d="M60 70 L74 78 L74 92 L60 100 L46 92 L46 78 z" fill="none" stroke="#C8791B" stroke-width="2.5" stroke-linejoin="round" opacity=".7"/>
<circle cx="60" cy="85" r="3.5" fill="#C8791B" opacity=".7"/>
<circle cx="37" cy="68" r="5.5" fill="#FFC23D" stroke="#E8A33D" stroke-width="2"/>
<circle cx="83" cy="68" r="5.5" fill="#FFC23D" stroke="#E8A33D" stroke-width="2"/>`,

queenhive: `<defs><radialGradient id="qh-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFE9A8" stop-opacity=".9"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient><radialGradient id="qh-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#F0A82A"/></radialGradient><clipPath id="qh-c"><ellipse cx="60" cy="70" rx="30" ry="30"/></clipPath></defs>
<circle cx="60" cy="62" r="52" fill="url(#qh-a)"/>
<path d="M22 24 l1.8 5.4 5.4 1.8 -5.4 1.8 -1.8 5.4 -1.8 -5.4 -5.4 -1.8 5.4 -1.8 z" fill="#FFC83D" opacity=".9"/>
<path d="M92 12 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D" opacity=".9"/>
<path d="M28 58 q-12 34 10 50 q10 7 22 6 l-4 -44 z" fill="#6C4FE0"/>
<path d="M92 58 q12 34 -10 50 q-10 7 -22 6 l4 -44 z" fill="#5335C9"/>
<ellipse cx="34" cy="42" rx="9" ry="15" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(-30 34 42)"/>
<ellipse cx="86" cy="42" rx="9" ry="15" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="2.5" transform="rotate(30 86 42)"/>
<ellipse cx="60" cy="70" rx="30" ry="30" fill="url(#qh-g)"/>
<g clip-path="url(#qh-c)"><rect x="28" y="84" width="64" height="8" fill="#3A2A8C"/><rect x="28" y="96" width="64" height="8" fill="#3A2A8C"/></g>
<path d="M46 44 l4 -12 l7 8 l3 -12 l3 12 l7 -8 l4 12 z" fill="#F0B429" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<circle cx="53" cy="36" r="2" fill="#FF5D9E"/><circle cx="60" cy="33" r="2" fill="#36D1FF"/><circle cx="67" cy="36" r="2" fill="#FF5D9E"/>
<circle cx="49" cy="66" r="8.5" fill="#fff"/><circle cx="50.5" cy="67.5" r="4.2" fill="#2B1B5E"/><circle cx="49.3" cy="66.3" r="1.5" fill="#fff"/>
<circle cx="71" cy="66" r="8.5" fill="#fff"/><circle cx="72.5" cy="67.5" r="4.2" fill="#2B1B5E"/><circle cx="71.3" cy="66.3" r="1.5" fill="#fff"/>
<path d="M40 57 q4 -4 9 -3" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M80 57 q-4 -4 -9 -3" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="40" cy="76" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/><ellipse cx="80" cy="76" rx="5" ry="3" fill="#FF7FBE" opacity=".85"/>
<path d="M52 80 q8 7 16 0" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M60 100 v8" stroke="#C8891B" stroke-width="3" stroke-linecap="round"/>`

});

/* STAGE PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

star: `<defs><radialGradient id="sst-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#F0A82A"/></radialGradient></defs>
<path d="M60 14 L73 44 L105 47 L81 68 L88 100 L60 84 L32 100 L39 68 L15 47 L47 44 z" fill="url(#sst-g)" stroke="#F0A82A" stroke-width="9" stroke-linejoin="round"/>
<circle cx="49" cy="56" r="8" fill="#fff"/><circle cx="50.5" cy="57.5" r="4" fill="#7A4A08"/><circle cx="49.3" cy="56.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="56" r="8" fill="#fff"/><circle cx="72.5" cy="57.5" r="4" fill="#7A4A08"/><circle cx="71.3" cy="56.3" r="1.4" fill="#fff"/>
<ellipse cx="42" cy="66" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".9"/><ellipse cx="78" cy="66" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".9"/>
<path d="M52 69 q8 8 16 0" fill="none" stroke="#7A4A08" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="20" r="2.2" fill="#FFC83D"/><circle cx="102" cy="88" r="2.2" fill="#FFC83D"/>
<path d="M98 16 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

mic: `<defs><radialGradient id="smc-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#9C9CB8"/><stop offset="1" stop-color="#5E5E78"/></radialGradient></defs>
<circle cx="60" cy="44" r="27" fill="url(#smc-g)"/>
<path d="M38 32 q22 -10 44 0 M35 44 h50 M38 56 q22 10 44 0" fill="none" stroke="#4A4A62" stroke-width="2" opacity=".6"/>
<path d="M42 26 q8 -7 18 -8" fill="none" stroke="#C9C9DD" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
<circle cx="50" cy="42" r="7.5" fill="#fff"/><circle cx="51.3" cy="43.5" r="3.8" fill="#2B2B3E"/><circle cx="50.2" cy="42.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="42" r="7.5" fill="#fff"/><circle cx="71.3" cy="43.5" r="3.8" fill="#2B2B3E"/><circle cx="70.2" cy="42.3" r="1.3" fill="#fff"/>
<ellipse cx="43" cy="52" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/><ellipse cx="77" cy="52" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/>
<path d="M53 55 q7 6 14 0" fill="none" stroke="#2B2B3E" stroke-width="3.5" stroke-linecap="round"/>
<rect x="42" y="69" width="36" height="9" rx="4.5" fill="#F0A82A"/>
<path d="M50 78 l-4 28 q14 7 28 0 l-4 -28 z" fill="#3A3A50"/>
<path d="M52 108 q8 4 16 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<path d="M92 30 q4 -1 5 -5 M96 40 q6 0 8 -4" stroke="#F0A82A" stroke-width="3" stroke-linecap="round" fill="none"/>
<circle cx="22" cy="26" r="2.2" fill="#FFC83D"/><circle cx="100" cy="60" r="2.2" fill="#FFC83D"/>`,

maestro: `<circle cx="34" cy="38" r="10" fill="#E8E4F0"/><circle cx="86" cy="38" r="10" fill="#E8E4F0"/><circle cx="30" cy="48" r="8" fill="#E8E4F0"/><circle cx="90" cy="48" r="8" fill="#E8E4F0"/>
<circle cx="60" cy="52" r="26" fill="#FFD9A8"/>
<path d="M40 40 q8 -12 20 -12 q12 0 20 12 q-8 -6 -20 -6 q-12 0 -20 6 z" fill="#E8E4F0"/>
<path d="M46 50 q4 -4 9 -2 M74 50 q-4 -4 -9 -2" fill="none" stroke="#5C4A32" stroke-width="2.5" stroke-linecap="round"/>
<path d="M48 58 q3 3 6 0 M66 58 q3 3 6 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="44" cy="64" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="64" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M54 68 q6 6 12 0" fill="none" stroke="#5C3A1E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M38 84 q22 -12 44 0 l-3 20 q-19 8 -38 0 z" fill="#2B2B3E"/>
<path d="M60 80 l-7 9 l7 9 l7 -9 z" fill="#fff"/>
<path d="M52 82 l8 7 8 -7 l-4 -4 h-8 z" fill="#fff"/><path d="M56 80 h8 l3 4 l-7 6 l-7 -6 z" fill="#F4F4FA"/>
<rect x="56" y="84" width="8" height="6" rx="2" fill="#C43D5A"/>
<path d="M88 76 L106 52" stroke="#8A5B2E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M100 40 q6 5 10 4 M96 32 q4 3 8 2" stroke="#C9C9DD" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<circle cx="18" cy="70" r="2.2" fill="#FFC83D"/>`,

jester: `<path d="M60 34 q-4 -16 -22 -22 q2 16 12 24 z" fill="#6C4FE0"/>
<path d="M60 34 q4 -16 22 -22 q-2 16 -12 24 z" fill="#FF5D9E"/>
<path d="M52 32 q4 -12 8 -14 q4 2 8 14 z" fill="#FFC23D"/>
<circle cx="38" cy="13" r="4.5" fill="#FFC23D"/><circle cx="82" cy="13" r="4.5" fill="#FFC23D"/><circle cx="60" cy="16" r="4" fill="#6C4FE0"/>
<circle cx="60" cy="60" r="26" fill="#FFD9A8"/>
<path d="M36 52 q24 -14 48 0 q-2 -10 -10 -14 q-14 -6 -28 0 q-8 4 -10 14 z" fill="#6C4FE0"/>
<circle cx="50" cy="58" r="7.5" fill="#fff"/><circle cx="51.3" cy="59.5" r="3.8" fill="#2B1B5E"/><circle cx="50.2" cy="58.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="58" r="7.5" fill="#fff"/><circle cx="71.3" cy="59.5" r="3.8" fill="#2B1B5E"/><circle cx="70.2" cy="58.3" r="1.3" fill="#fff"/>
<ellipse cx="43" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="77" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<path d="M50 71 q10 9 20 0 q-10 4 -20 0 z" fill="#8A2A3E"/>
<path d="M42 84 l6 8 l6 -8 l6 8 l6 -8 l6 8 l6 -8 v10 q-18 10 -36 0 z" fill="#FF5D9E"/>
<circle cx="20" cy="46" r="2.2" fill="#FFC83D"/><circle cx="100" cy="46" r="2.2" fill="#FFC83D"/>`,

lumen: `<defs><radialGradient id="slm-g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#FFF3C4"/><stop offset="1" stop-color="#FFD24D"/></radialGradient></defs>
<path d="M44 68 L20 112 h56 z" fill="#FFE9A8" opacity=".4"/>
<circle cx="60" cy="48" r="26" fill="url(#slm-g)"/>
<circle cx="60" cy="48" r="26" fill="none" stroke="#8C8CA6" stroke-width="5"/>
<path d="M40 34 q6 -8 14 -10" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>
<circle cx="51" cy="44" r="7.5" fill="#fff"/><circle cx="52.3" cy="45.5" r="3.8" fill="#8A5408"/><circle cx="51.2" cy="44.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="44" r="7.5" fill="#fff"/><circle cx="70.3" cy="45.5" r="3.8" fill="#8A5408"/><circle cx="69.2" cy="44.3" r="1.3" fill="#fff"/>
<ellipse cx="45" cy="54" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/><ellipse cx="75" cy="54" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/>
<path d="M53 57 q7 6 14 0" fill="none" stroke="#8A5408" stroke-width="3.5" stroke-linecap="round"/>
<rect x="52" y="74" width="16" height="8" rx="3" fill="#5E5E78"/>
<path d="M52 82 L36 108 M68 82 L84 108 M60 82 v26" stroke="#5E5E78" stroke-width="5" stroke-linecap="round"/>
<path d="M92 24 l3 3 M96 40 h5 M88 12 v-5" stroke="#FFC23D" stroke-width="3" stroke-linecap="round"/>
<circle cx="22" cy="28" r="2.2" fill="#FFC83D"/>`,

diva: `<path d="M34 40 q-10 10 -8 30 q-8 -4 -8 -16 q0 -18 16 -14 z" fill="#3A2A8C"/>
<path d="M86 40 q10 10 8 30 q8 -4 8 -16 q0 -18 -16 -14 z" fill="#3A2A8C"/>
<path d="M32 46 q-2 -22 28 -22 q30 0 28 22 q1 22 -8 30 q4 -18 -4 -26 q-16 6 -32 0 q-8 8 -4 26 q-9 -8 -8 -30 z" fill="#4A3AA8"/>
<circle cx="60" cy="58" r="25" fill="#FFD9A8"/>
<path d="M36 46 q24 -12 48 0 q-4 -14 -24 -14 q-20 0 -24 14 z" fill="#4A3AA8"/>
<rect x="38" y="50" width="19" height="13" rx="6" fill="#2B1B5E"/><rect x="63" y="50" width="19" height="13" rx="6" fill="#2B1B5E"/>
<path d="M57 55 h6" stroke="#2B1B5E" stroke-width="3" stroke-linecap="round"/>
<path d="M42 54 q4 -3 8 0" stroke="#8A7ADF" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M67 54 q4 -3 8 0" stroke="#8A7ADF" stroke-width="2" fill="none" stroke-linecap="round"/>
<ellipse cx="42" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="78" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<path d="M52 72 q8 8 16 0 q-8 3 -16 0 z" fill="#C4325A"/>
<path d="M30 66 l2 4 M32 74 l-3 2" stroke="#FFC23D" stroke-width="2.5" stroke-linecap="round"/>
<path d="M88 66 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="20" cy="24" r="2.2" fill="#FFC83D"/><circle cx="100" cy="20" r="2.2" fill="#FFC83D"/>`,

popcorn: `<circle cx="44" cy="38" r="9" fill="#FFF3D6"/><circle cx="58" cy="30" r="10" fill="#FFF9E8"/><circle cx="74" cy="36" r="9" fill="#FFF3D6"/><circle cx="50" cy="28" r="7" fill="#FFF9E8"/><circle cx="66" cy="26" r="7" fill="#FFF3D6"/>
<circle cx="52" cy="38" r="6" fill="#F5E3B8"/><circle cx="66" cy="36" r="6" fill="#F5E3B8"/>
<circle cx="88" cy="18" r="6" fill="#FFF9E8"/><path d="M92 10 l2 -3 M96 16 l3 -1" stroke="#F0A82A" stroke-width="2" stroke-linecap="round"/>
<path d="M38 44 h44 l-5 60 h-34 z" fill="#F4F0E6"/>
<path d="M44 44 h7 l-4 60 h-7 z M58 44 h7 l-1 60 h-7 z M72 44 h7 l2 60 h-8 z" fill="#E0483C"/>
<path d="M38 44 h44 l-1 8 h-42 z" fill="#fff" opacity=".5"/>
<circle cx="50" cy="70" r="7" fill="#fff"/><circle cx="51.3" cy="71.5" r="3.6" fill="#8A2A20"/><circle cx="50.2" cy="70.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="70" r="7" fill="#fff"/><circle cx="71.3" cy="71.5" r="3.6" fill="#8A2A20"/><circle cx="70.2" cy="70.3" r="1.3" fill="#fff"/>
<ellipse cx="44" cy="80" rx="4" ry="2.5" fill="#FF9E8A" opacity=".85"/><ellipse cx="76" cy="80" rx="4" ry="2.5" fill="#FF9E8A" opacity=".85"/>
<path d="M53 83 q7 6 14 0" fill="none" stroke="#8A2A20" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="60" r="2.2" fill="#FFC83D"/><circle cx="102" cy="52" r="2.2" fill="#FFC83D"/>`,

melody: `<defs><radialGradient id="sml-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#4A3AA8"/><stop offset="1" stop-color="#2B1B5E"/></radialGradient></defs>
<path d="M74 74 V22 q10 2 14 10 q3 7 -2 14 q8 -2 10 -8" fill="none" stroke="#2B1B5E" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="56" cy="80" rx="22" ry="17" fill="url(#sml-g)" transform="rotate(-14 56 80)"/>
<circle cx="47" cy="74" r="7.5" fill="#fff"/><circle cx="48.3" cy="75.5" r="3.8" fill="#2B1B5E"/><circle cx="47.2" cy="74.3" r="1.3" fill="#fff"/>
<circle cx="65" cy="74" r="7.5" fill="#fff"/><circle cx="66.3" cy="75.5" r="3.8" fill="#2B1B5E"/><circle cx="65.2" cy="74.3" r="1.3" fill="#fff"/>
<ellipse cx="40" cy="84" rx="4.2" ry="2.6" fill="#FF7FBE" opacity=".9"/><ellipse cx="72" cy="83" rx="4.2" ry="2.6" fill="#FF7FBE" opacity=".9"/>
<path d="M49 87 q7 6 14 -1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
<path d="M20 38 v-14 q4 1 6 4" fill="none" stroke="#6C4FE0" stroke-width="3.5" stroke-linecap="round"/><circle cx="17" cy="39" r="4" fill="#6C4FE0"/>
<path d="M102 62 v-12 q3.5 1 5 3.5" fill="none" stroke="#FF5D9E" stroke-width="3" stroke-linecap="round"/><circle cx="99.5" cy="63" r="3.5" fill="#FF5D9E"/>
<circle cx="30" cy="102" r="2.2" fill="#FFC83D"/><circle cx="98" cy="20" r="2.2" fill="#FFC83D"/>`,

encore: `<path d="M14 12 h92 v10 h-92 z" fill="#8A5B2E"/>
<circle cx="24" cy="17" r="3" fill="#FFC23D"/><circle cx="42" cy="17" r="3" fill="#FFE49B"/><circle cx="60" cy="17" r="3" fill="#FFC23D"/><circle cx="78" cy="17" r="3" fill="#FFE49B"/><circle cx="96" cy="17" r="3" fill="#FFC23D"/>
<path d="M14 22 q4 44 10 60 q8 -4 12 -12 q6 14 2 34 h-24 z" fill="#C43D5A"/>
<path d="M106 22 q-4 44 -10 60 q-8 -4 -12 -12 q-6 14 -2 34 h24 z" fill="#C43D5A"/>
<path d="M22 26 q2 30 6 46 M98 26 q-2 30 -6 46" stroke="#A32B46" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M30 78 q-8 4 -12 2 M90 78 q8 4 12 2" stroke="#F0A82A" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="60" cy="62" r="24" fill="#FFD9A8"/>
<path d="M38 54 q22 -12 44 0 q-3 -14 -22 -14 q-19 0 -22 14 z" fill="#5C3A1E"/>
<circle cx="51" cy="60" r="7" fill="#fff"/><circle cx="52.3" cy="61.5" r="3.6" fill="#2B1B5E"/><circle cx="51.2" cy="60.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="60" r="7" fill="#fff"/><circle cx="70.3" cy="61.5" r="3.6" fill="#2B1B5E"/><circle cx="69.2" cy="60.3" r="1.3" fill="#fff"/>
<ellipse cx="45" cy="70" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/><ellipse cx="75" cy="70" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/>
<path d="M51 73 q9 8 18 0 q-9 4 -18 0 z" fill="#8A2A3E"/>
<path d="M40 96 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M74 98 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`,

goldlegend: `<defs><radialGradient id="sgl-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFB84D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient><radialGradient id="sgl-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#E8A21B"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#sgl-a)"/>
<path d="M30 26 q-14 2 -14 14 q0 12 16 14" fill="none" stroke="#E8A21B" stroke-width="5"/>
<path d="M90 26 q14 2 14 14 q0 12 -16 14" fill="none" stroke="#E8A21B" stroke-width="5"/>
<path d="M34 22 h52 v18 q0 22 -26 24 q-26 -2 -26 -24 z" fill="url(#sgl-g)"/>
<path d="M40 26 q2 16 6 24" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" fill="none" opacity=".8"/>
<circle cx="51" cy="40" r="7.5" fill="#fff"/><circle cx="52.3" cy="41.5" r="3.8" fill="#7A4A08"/><circle cx="51.2" cy="40.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="40" r="7.5" fill="#fff"/><circle cx="70.3" cy="41.5" r="3.8" fill="#7A4A08"/><circle cx="69.2" cy="40.3" r="1.3" fill="#fff"/>
<ellipse cx="44" cy="49" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="76" cy="49" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M52 52 q8 8 16 0" fill="none" stroke="#7A4A08" stroke-width="3.5" stroke-linecap="round"/>
<rect x="53" y="64" width="14" height="12" fill="#D89018"/>
<path d="M42 76 h36 v10 h-36 z" fill="#C8891B"/>
<path d="M34 86 h52 v12 h-52 z" fill="#8A5B2E"/>
<path d="M60 89 l1.8 3.4 3.8 .6 -2.8 2.7 .7 3.8 -3.5 -1.8 -3.5 1.8 .7 -3.8 -2.8 -2.7 3.8 -.6 z" fill="#FFC83D"/>
<circle cx="22" cy="80" r="2.5" fill="#FF5D9E"/><circle cx="98" cy="76" r="2.5" fill="#36D1FF"/><circle cx="28" cy="100" r="2.2" fill="#FFC83D"/><circle cx="94" cy="98" r="2.2" fill="#6C4FE0"/>
<path d="M16 40 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* COSMOS PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

luna: `<defs><radialGradient id="clu-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FBF3D7"/><stop offset="1" stop-color="#EDD9A3"/></radialGradient></defs>
<circle cx="60" cy="62" r="34" fill="url(#clu-g)"/>
<circle cx="40" cy="42" r="5" fill="#DCC48A" opacity=".55"/><circle cx="80" cy="48" r="4" fill="#DCC48A" opacity=".55"/><circle cx="50" cy="88" r="4.5" fill="#DCC48A" opacity=".55"/><circle cx="82" cy="80" r="3" fill="#DCC48A" opacity=".55"/>
<circle cx="47" cy="58" r="8.5" fill="#fff"/><circle cx="48.5" cy="59.5" r="4.2" fill="#2B1B5E"/><circle cx="47.3" cy="58.3" r="1.5" fill="#fff"/>
<path d="M66 58 q4.5 -5 9 0" fill="none" stroke="#2B1B5E" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="40" cy="70" rx="5" ry="3.2" fill="#FFB3C8" opacity=".85"/><ellipse cx="80" cy="70" rx="5" ry="3.2" fill="#FFB3C8" opacity=".85"/>
<path d="M52 74 q8 7 16 0" fill="none" stroke="#3A2A5C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M18 26 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M98 84 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="94" cy="26" r="2.2" fill="#C4B4FF"/><circle cx="22" cy="86" r="2" fill="#C4B4FF"/>`,

astro: `<circle cx="60" cy="54" r="32" fill="#F4F4FA" stroke="#C9C9DD" stroke-width="3"/>
<circle cx="60" cy="56" r="22" fill="#FFD9A8"/>
<circle cx="52" cy="53" r="7" fill="#fff"/><circle cx="53.3" cy="54.5" r="3.6" fill="#2B1B5E"/><circle cx="52.2" cy="53.3" r="1.3" fill="#fff"/>
<circle cx="68" cy="53" r="7" fill="#fff"/><circle cx="69.3" cy="54.5" r="3.6" fill="#2B1B5E"/><circle cx="68.2" cy="53.3" r="1.3" fill="#fff"/>
<ellipse cx="45" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="75" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M53 66 q7 6 14 0" fill="none" stroke="#3A2A5C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M36 36 q8 -10 20 -11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
<circle cx="90" cy="34" r="4" fill="#E8845C"/><path d="M90 30 v-8" stroke="#E8845C" stroke-width="2.5" stroke-linecap="round"/>
<path d="M34 84 q26 14 52 0 l-4 22 q-22 8 -44 0 z" fill="#E8845C"/>
<rect x="52" y="92" width="16" height="10" rx="3" fill="#F4F4FA"/><circle cx="57" cy="97" r="2" fill="#36D1FF"/><circle cx="64" cy="97" r="2" fill="#FFC23D"/>
<path d="M14 60 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="104" cy="72" r="2.2" fill="#C4B4FF"/>`,

comet: `<defs><radialGradient id="cco-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#EAF6FF"/><stop offset="1" stop-color="#BBDCF5"/></radialGradient></defs>
<path d="M8 88 q22 -8 38 -20" fill="none" stroke="#5AC8FA" stroke-width="7" stroke-linecap="round" opacity=".8"/>
<path d="M6 70 q18 -4 30 -12" fill="none" stroke="#8ADAFF" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<path d="M18 102 q16 -6 28 -16" fill="none" stroke="#8ADAFF" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<circle cx="70" cy="54" r="28" fill="url(#cco-g)"/>
<circle cx="60" cy="50" r="8.5" fill="#fff"/><circle cx="61.5" cy="51.5" r="4.2" fill="#1E2A5C"/><circle cx="60.3" cy="50.3" r="1.5" fill="#fff"/>
<circle cx="82" cy="50" r="8.5" fill="#fff"/><circle cx="83.5" cy="51.5" r="4.2" fill="#1E2A5C"/><circle cx="82.3" cy="50.3" r="1.5" fill="#fff"/>
<ellipse cx="52" cy="60" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="90" cy="60" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M64 64 q7 8 14 0 q-7 3 -14 0 z" fill="#1E2A5C"/>
<path d="M96 24 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<circle cx="30" cy="34" r="2.2" fill="#C4B4FF"/><circle cx="106" cy="80" r="2.2" fill="#C4B4FF"/>`,

rocket: `<path d="M60 12 q19 15 19 44 q0 17 -6 25 h-26 q-6 -8 -6 -25 q0 -29 19 -44 z" fill="#F4F4FA"/>
<path d="M60 12 q12 10 16 26 h-32 q4 -16 16 -26 z" fill="#E0483C"/>
<path d="M41 62 q-10 6 -12 20 q9 -1 14 -8 z" fill="#E0483C"/>
<path d="M79 62 q10 6 12 20 q-9 -1 -14 -8 z" fill="#E0483C"/>
<circle cx="60" cy="54" r="15" fill="#9ADAF7" stroke="#E0483C" stroke-width="4"/>
<circle cx="55" cy="52" r="5" fill="#fff"/><circle cx="56" cy="53" r="2.6" fill="#1E2A5C"/><circle cx="55.2" cy="52.2" r="1" fill="#fff"/>
<circle cx="66" cy="52" r="5" fill="#fff"/><circle cx="67" cy="53" r="2.6" fill="#1E2A5C"/><circle cx="66.2" cy="52.2" r="1" fill="#fff"/>
<path d="M56 60 q4 3.5 8 0" fill="none" stroke="#1E2A5C" stroke-width="2.5" stroke-linecap="round"/>
<path d="M52 81 h16" stroke="#C9C9DD" stroke-width="3" stroke-linecap="round"/>
<path d="M60 88 q9 8 0 22 q-9 -14 0 -22 z" fill="#FFC23D"/>
<path d="M60 92 q4.5 5 0 12 q-4.5 -7 0 -12 z" fill="#FF8A3C"/>
<path d="M16 36 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M100 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="98" cy="88" r="2.2" fill="#C4B4FF"/>`,

alien: `<defs><radialGradient id="cal-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A8E585"/><stop offset="1" stop-color="#7BC24E"/></radialGradient></defs>
<path d="M42 24 q-6 -6 -6 -13" fill="none" stroke="#5CA346" stroke-width="3" stroke-linecap="round"/><circle cx="36" cy="9" r="4" fill="#7BC24E"/>
<path d="M78 24 q6 -6 6 -13" fill="none" stroke="#5CA346" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="9" r="4" fill="#7BC24E"/>
<ellipse cx="60" cy="52" rx="30" ry="27" fill="url(#cal-g)"/>
<path d="M36 66 q4 18 24 18 q20 0 24 -18 q-10 10 -24 10 q-14 0 -24 -10 z" fill="url(#cal-g)"/>
<ellipse cx="46" cy="52" rx="8" ry="11" fill="#1E3A20" transform="rotate(-10 46 52)"/>
<ellipse cx="74" cy="52" rx="8" ry="11" fill="#1E3A20" transform="rotate(10 74 52)"/>
<circle cx="43.5" cy="47" r="2.6" fill="#fff"/><circle cx="71.5" cy="47" r="2.6" fill="#fff"/>
<ellipse cx="35" cy="65" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".7"/><ellipse cx="85" cy="65" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".7"/>
<path d="M54 68 q6 5 12 0" fill="none" stroke="#1E3A20" stroke-width="3" stroke-linecap="round"/>
<path d="M20 90 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="100" cy="88" r="2.2" fill="#C4B4FF"/><circle cx="14" cy="40" r="2" fill="#C4B4FF"/>`,

saturn: `<defs><radialGradient id="csa-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F5C98A"/><stop offset="1" stop-color="#E8A25C"/></radialGradient></defs>
<path d="M17 64 a43 13 0 0 1 86 0" fill="none" stroke="#C4B4FF" stroke-width="6" opacity=".55"/>
<circle cx="60" cy="58" r="28" fill="url(#csa-g)"/>
<path d="M34 48 q26 -8 52 0" fill="none" stroke="#DE9448" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<path d="M36 72 q24 8 48 0" fill="none" stroke="#DE9448" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<circle cx="48" cy="54" r="8" fill="#fff"/><circle cx="49.5" cy="55.5" r="4" fill="#5C3A1E"/><circle cx="48.3" cy="54.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="54" r="8" fill="#fff"/><circle cx="73.5" cy="55.5" r="4" fill="#5C3A1E"/><circle cx="72.3" cy="54.3" r="1.4" fill="#fff"/>
<ellipse cx="41" cy="63" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/><ellipse cx="79" cy="63" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/>
<path d="M53 66 q7 6 14 0" fill="none" stroke="#5C3A1E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M17 64 a43 13 0 0 0 86 0" fill="none" stroke="#C4B4FF" stroke-width="6"/>
<circle cx="98" cy="28" r="5" fill="#EDE7FF"/><circle cx="96.5" cy="27" r="1.6" fill="#C4B4FF"/>
<path d="M18 92 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

blackhole: `<defs><radialGradient id="cbh-g" cx="50%" cy="45%" r="65%"><stop offset="0" stop-color="#2A2050"/><stop offset="1" stop-color="#14102A"/></radialGradient></defs>
<circle cx="60" cy="60" r="34" fill="none" stroke="#8A5CE8" stroke-width="7" opacity=".35"/>
<circle cx="60" cy="60" r="31" fill="none" stroke="#B08CFF" stroke-width="3"/>
<circle cx="60" cy="60" r="28" fill="url(#cbh-g)"/>
<path d="M42 46 q18 -10 34 2 q-14 -4 -28 2 q12 0 20 8 q-12 -4 -22 2" fill="none" stroke="#5B4A9E" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<circle cx="49" cy="60" r="8" fill="#EDE7FF"/><circle cx="50.5" cy="61.5" r="4" fill="#14102A"/><circle cx="49.3" cy="60.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="60" r="8" fill="#EDE7FF"/><circle cx="72.5" cy="61.5" r="4" fill="#14102A"/><circle cx="71.3" cy="60.3" r="1.4" fill="#fff"/>
<path d="M54 72 q6 5 12 0" fill="none" stroke="#B08CFF" stroke-width="3" stroke-linecap="round"/>
<path d="M16 40 q6 4 4 10" fill="none" stroke="#C4B4FF" stroke-width="2" stroke-linecap="round"/><path d="M20 34 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M102 78 q-6 -4 -4 -10" fill="none" stroke="#C4B4FF" stroke-width="2" stroke-linecap="round"/><path d="M98 84 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`,

supernova: `<defs><radialGradient id="csn-g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#FFF3C4"/><stop offset="1" stop-color="#FFB84D"/></radialGradient></defs>
<path d="M60 8 L68 44 L104 36 L76 60 L104 84 L68 76 L60 112 L52 76 L16 84 L44 60 L16 36 L52 44 z" fill="#FFC23D" opacity=".55"/>
<path d="M60 20 L66 48 L94 42 L72 60 L94 78 L66 72 L60 100 L54 72 L26 78 L48 60 L26 42 L54 48 z" fill="#FFC23D"/>
<circle cx="60" cy="60" r="24" fill="url(#csn-g)"/>
<circle cx="51" cy="56" r="7.5" fill="#fff"/><circle cx="52.3" cy="57.5" r="3.8" fill="#8A4408"/><circle cx="51.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="56" r="7.5" fill="#fff"/><circle cx="70.3" cy="57.5" r="3.8" fill="#8A4408"/><circle cx="69.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="45" cy="66" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="75" cy="66" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M53 69 q7 7 14 0 q-7 3 -14 0 z" fill="#8A4408"/>
<circle cx="18" cy="18" r="2.2" fill="#FFC83D"/><circle cx="104" cy="16" r="2" fill="#C4B4FF"/><circle cx="16" cy="102" r="2" fill="#C4B4FF"/><circle cx="102" cy="104" r="2.2" fill="#FFC83D"/>`,

ufo: `<path d="M46 76 L34 106 h52 L74 76 z" fill="#FFE9A8" opacity=".5"/>
<path d="M42 48 a18 16 0 0 1 36 0 v6 h-36 z" fill="#BFE8FF" opacity=".9"/>
<ellipse cx="60" cy="42" rx="8" ry="7" fill="#7BC24E"/><circle cx="57" cy="41" r="1.8" fill="#1E3A20"/><circle cx="63" cy="41" r="1.8" fill="#1E3A20"/>
<ellipse cx="60" cy="64" rx="36" ry="15" fill="#C9C9DD"/>
<path d="M24 64 a36 15 0 0 0 72 0 z" fill="#9C9CB8"/>
<circle cx="34" cy="68" r="3.2" fill="#FFC23D"/><circle cx="47" cy="72" r="3.2" fill="#FF5D9E"/><circle cx="60" cy="73" r="3.2" fill="#36D1FF"/><circle cx="73" cy="72" r="3.2" fill="#FFC23D"/><circle cx="86" cy="68" r="3.2" fill="#FF5D9E"/>
<circle cx="50" cy="60" r="5.5" fill="#fff"/><circle cx="51" cy="61" r="2.8" fill="#2B1B5E"/><circle cx="50.2" cy="60.2" r="1" fill="#fff"/>
<circle cx="70" cy="60" r="5.5" fill="#fff"/><circle cx="71" cy="61" r="2.8" fill="#2B1B5E"/><circle cx="70.2" cy="60.2" r="1" fill="#fff"/>
<path d="M56 65 q4 3 8 0" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M16 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M98 24 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="106" cy="92" r="2.2" fill="#C4B4FF"/>`,

nebula: `<defs><radialGradient id="cnb-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#C4B4FF" stop-opacity=".5"/><stop offset="1" stop-color="#C4B4FF" stop-opacity="0"/></radialGradient><radialGradient id="cnb-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#9E74F0"/><stop offset="1" stop-color="#6C4FE0"/></radialGradient></defs>
<circle cx="60" cy="58" r="50" fill="url(#cnb-a)"/>
<path d="M34 34 q-8 -12 -4 -24 q10 6 12 18 z" fill="#C4B4FF"/>
<path d="M86 34 q8 -12 4 -24 q-10 6 -12 18 z" fill="#C4B4FF"/>
<ellipse cx="26" cy="56" rx="8" ry="12" fill="#8A5CE8" transform="rotate(-18 26 56)"/>
<ellipse cx="94" cy="56" rx="8" ry="12" fill="#8A5CE8" transform="rotate(18 94 56)"/>
<circle cx="60" cy="60" r="30" fill="url(#cnb-g)"/>
<path d="M38 76 q4 14 22 14 q18 0 22 -14 q-10 8 -22 8 q-12 0 -22 -8 z" fill="#8A5CE8"/>
<circle cx="44" cy="42" r="1.8" fill="#fff" opacity=".9"/><circle cx="74" cy="38" r="1.5" fill="#fff" opacity=".9"/><circle cx="82" cy="52" r="1.5" fill="#fff" opacity=".9"/><circle cx="36" cy="56" r="1.4" fill="#fff" opacity=".9"/>
<circle cx="49" cy="58" r="8.5" fill="#fff"/><circle cx="50.5" cy="59.5" r="4.2" fill="#2B1B5E"/><circle cx="49.3" cy="58.3" r="1.5" fill="#fff"/>
<circle cx="71" cy="58" r="8.5" fill="#fff"/><circle cx="72.5" cy="59.5" r="4.2" fill="#2B1B5E"/><circle cx="71.3" cy="58.3" r="1.5" fill="#fff"/>
<ellipse cx="40" cy="68" rx="5" ry="3" fill="#FF9EDA" opacity=".85"/><ellipse cx="80" cy="68" rx="5" ry="3" fill="#FF9EDA" opacity=".85"/>
<path d="M52 72 q8 7 16 0" fill="none" stroke="#2B1B5E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M54 73.5 l2.4 4.4 l3.2 -3.8 z" fill="#fff"/><path d="M66 73.5 l-2.4 4.4 l-3.2 -3.8 z" fill="#fff"/>
<path d="M14 30 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 88 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* DOJO PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

panda: `<circle cx="38" cy="28" r="11" fill="#2B2B33"/><circle cx="82" cy="28" r="11" fill="#2B2B33"/>
<circle cx="60" cy="58" r="31" fill="#FBF7F0"/>
<path d="M31 44 h58 v10 h-58 z" fill="#C43D5A"/>
<path d="M89 46 q10 -2 12 -8 q3 8 -4 12 z" fill="#C43D5A"/><path d="M91 52 q9 2 14 0 q-3 8 -11 6 z" fill="#A32B46"/>
<ellipse cx="46" cy="62" rx="9" ry="11" fill="#2B2B33" transform="rotate(-12 46 62)"/>
<ellipse cx="74" cy="62" rx="9" ry="11" fill="#2B2B33" transform="rotate(12 74 62)"/>
<circle cx="47" cy="60" r="4.5" fill="#fff"/><circle cx="48" cy="61" r="2.4" fill="#2B2B33"/><circle cx="47.2" cy="60.2" r="0.9" fill="#fff"/>
<circle cx="73" cy="60" r="4.5" fill="#fff"/><circle cx="74" cy="61" r="2.4" fill="#2B2B33"/><circle cx="73.2" cy="60.2" r="0.9" fill="#fff"/>
<ellipse cx="36" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/><ellipse cx="84" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/>
<ellipse cx="60" cy="74" rx="4" ry="3" fill="#2B2B33"/>
<path d="M54 80 q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"/>
<circle cx="20" cy="88" r="2.2" fill="#FFC83D"/><circle cx="102" cy="84" r="2.2" fill="#FFC83D"/>`,

ninja: `<defs><radialGradient id="jnj-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3E4468"/><stop offset="1" stop-color="#2E3450"/></radialGradient></defs>
<circle cx="60" cy="58" r="29" fill="url(#jnj-g)"/>
<path d="M31 44 h58 v9 h-58 z" fill="#C43D5A"/>
<path d="M88 46 q12 -4 14 -12 q4 10 -5 16 z" fill="#C43D5A"/><path d="M90 52 q12 0 16 -4 q-1 10 -12 11 z" fill="#A32B46"/>
<rect x="38" y="54" width="44" height="17" rx="8.5" fill="#FFD9A8"/>
<path d="M42 60 l10 3 M78 60 l-10 3" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<circle cx="49" cy="65" r="5" fill="#2B1B5E"/><circle cx="47.8" cy="63.8" r="1.4" fill="#fff"/>
<circle cx="71" cy="65" r="5" fill="#2B1B5E"/><circle cx="69.8" cy="63.8" r="1.4" fill="#fff"/>
<path d="M20 24 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3 z" fill="#5E5E78"/><circle cx="20" cy="35" r="2.5" fill="#2E3450"/>
<path d="M96 90 q4 -1 5 -5 M100 98 q5 0 7 -3" stroke="#8A8AA6" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<circle cx="102" cy="24" r="2.2" fill="#FFC83D"/>`,

samurai: `<path d="M60 10 l-5 14 h10 z" fill="#E8A21B"/>
<path d="M48 20 q12 -8 24 0 l-4 8 q-8 -4 -16 0 z" fill="#E8A21B"/>
<path d="M28 46 q0 -24 32 -24 q32 0 32 24 l-4 10 h-56 z" fill="#3A3A50"/>
<path d="M28 46 q-8 6 -8 16 q8 0 12 -6 z" fill="#3A3A50"/>
<path d="M92 46 q8 6 8 16 q-8 0 -12 -6 z" fill="#3A3A50"/>
<path d="M36 30 q24 -12 48 0" fill="none" stroke="#5E5E78" stroke-width="3" stroke-linecap="round"/>
<circle cx="60" cy="64" r="23" fill="#FFD9A8"/>
<path d="M42 56 l11 4 M78 56 l-11 4" stroke="#2B2B3E" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="50" cy="64" r="6.5" fill="#fff"/><circle cx="51.2" cy="65.4" r="3.4" fill="#2B1B5E"/><circle cx="50.2" cy="64.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="64" r="6.5" fill="#fff"/><circle cx="71.2" cy="65.4" r="3.4" fill="#2B1B5E"/><circle cx="70.2" cy="64.3" r="1.2" fill="#fff"/>
<ellipse cx="42" cy="72" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/><ellipse cx="78" cy="72" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/>
<path d="M54 78 h12" stroke="#2B2B3E" stroke-width="3.5" stroke-linecap="round"/>
<path d="M46 87 q14 8 28 0 l-2 14 q-12 6 -24 0 z" fill="#C43D5A"/>
<path d="M56 90 l4 6 l4 -6" fill="none" stroke="#E8A21B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="16" cy="80" r="2.2" fill="#FFC83D"/><circle cx="104" cy="80" r="2.2" fill="#FFC83D"/>`,

neko: `<path d="M34 34 l4 -18 l14 10 z" fill="#FBF7F0"/><path d="M38 30 l2 -9 l7 5 z" fill="#FF9EB8"/>
<path d="M86 34 l-4 -18 l-14 10 z" fill="#FBF7F0"/><path d="M82 30 l-2 -9 l-7 5 z" fill="#FF9EB8"/>
<path d="M78 22 l-3 -12 l-10 7 z" fill="#F0A82A"/>
<circle cx="60" cy="56" r="29" fill="#FBF7F0"/>
<path d="M74 32 q10 -4 16 2 q-6 6 -14 4 z" fill="#F0A82A"/>
<circle cx="94" cy="42" r="11" fill="#FBF7F0"/>
<path d="M89 40 v-5 M94 39 v-6 M99 40 v-5" stroke="#E8D8C0" stroke-width="2.5" stroke-linecap="round"/>
<path d="M45 52 q4 4 8 0 M67 52 q4 4 8 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="38" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="82" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<ellipse cx="60" cy="62" rx="3.5" ry="2.5" fill="#FF9EB8"/>
<path d="M54 66 q3 4 6 0 q3 4 6 0" fill="none" stroke="#2B2B3E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M26 58 h-10 M28 64 h-9 M92 58 h10 M90 64 h9" stroke="#C9BFA8" stroke-width="2" stroke-linecap="round"/>
<path d="M42 82 h36 v8 h-36 z" fill="#C43D5A"/>
<circle cx="60" cy="92" r="7" fill="#FFC23D"/><path d="M56 92 h8 M60 92 v4" stroke="#8A5B00" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="18" cy="34" r="2.2" fill="#FFC83D"/><circle cx="106" cy="70" r="2.2" fill="#FFC83D"/>`,

bamboo: `<defs><radialGradient id="jbb-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#8FD068"/><stop offset="1" stop-color="#5CA346"/></radialGradient></defs>
<ellipse cx="30" cy="26" rx="13" ry="6" fill="#4A8636" transform="rotate(-32 30 26)"/>
<ellipse cx="92" cy="20" rx="12" ry="5.5" fill="#5CA346" transform="rotate(24 92 20)"/>
<path d="M42 22 q-8 -2 -14 4 M80 18 q8 -3 14 2" stroke="#4A8636" stroke-width="3" fill="none" stroke-linecap="round"/>
<rect x="46" y="16" width="28" height="92" rx="13" fill="url(#jbb-g)"/>
<path d="M46 40 q14 5 28 0 M46 72 q14 5 28 0" stroke="#4A8636" stroke-width="3.5" fill="none"/>
<path d="M50 24 q0 40 0 78" stroke="#B8E098" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<circle cx="53" cy="54" r="6.5" fill="#fff"/><circle cx="54.2" cy="55.4" r="3.4" fill="#28481C"/><circle cx="53.2" cy="54.3" r="1.2" fill="#fff"/>
<circle cx="67" cy="54" r="6.5" fill="#fff"/><circle cx="68.2" cy="55.4" r="3.4" fill="#28481C"/><circle cx="67.2" cy="54.3" r="1.2" fill="#fff"/>
<ellipse cx="49" cy="62" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/><ellipse cx="71" cy="62" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/>
<path d="M54 65 q6 5 12 0" fill="none" stroke="#28481C" stroke-width="3" stroke-linecap="round"/>
<circle cx="24" cy="70" r="2.2" fill="#FFC83D"/><circle cx="98" cy="60" r="2.2" fill="#FFC83D"/>`,

kitsune: `<defs><radialGradient id="jkt-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F09148"/><stop offset="1" stop-color="#E8845C"/></radialGradient></defs>
<path d="M30 40 L24 12 q16 4 20 20 z" fill="#E8845C"/><path d="M29 34 l-3 -14 q9 3 12 12 z" fill="#FBF7F0"/>
<path d="M90 40 L96 12 q-16 4 -20 20 z" fill="#E8845C"/><path d="M91 34 l3 -14 q-9 3 -12 12 z" fill="#FBF7F0"/>
<circle cx="60" cy="60" r="29" fill="url(#jkt-g)"/>
<path d="M34 68 q6 20 26 20 q20 0 26 -20 q-12 8 -26 8 q-14 0 -26 -8 z" fill="#FBF7F0"/>
<path d="M40 46 q6 -5 12 -2 M80 46 q-6 -5 -12 -2" stroke="#C43D5A" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="48" cy="56" r="7.5" fill="#fff"/><circle cx="49.3" cy="57.5" r="3.8" fill="#8A3A1E"/><circle cx="48.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="72" cy="56" r="7.5" fill="#fff"/><circle cx="73.3" cy="57.5" r="3.8" fill="#8A3A1E"/><circle cx="72.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="39" cy="66" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="81" cy="66" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<ellipse cx="60" cy="70" rx="3.5" ry="2.5" fill="#8A3A1E"/>
<path d="M54 75 q3 4 6 0 q3 4 6 0" fill="none" stroke="#8A3A1E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M20 74 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M98 78 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`,

oni: `<defs><radialGradient id="jon-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#E85A4E"/><stop offset="1" stop-color="#C43038"/></radialGradient></defs>
<path d="M38 26 q-2 -14 6 -20 q6 8 4 20 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2"/>
<path d="M82 26 q2 -14 -6 -20 q-6 8 -4 20 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2"/>
<circle cx="60" cy="60" r="30" fill="url(#jon-g)"/>
<path d="M32 46 q6 -14 28 -14 q22 0 28 14 q-14 -7 -28 -7 q-14 0 -28 7 z" fill="#8A2028"/>
<path d="M40 52 l12 5 M80 52 l-12 5" stroke="#4A1014" stroke-width="4" stroke-linecap="round"/>
<circle cx="47" cy="62" r="7.5" fill="#FFC23D"/><circle cx="48.3" cy="63.3" r="3.8" fill="#4A1014"/><circle cx="47.2" cy="62.2" r="1.3" fill="#fff"/>
<circle cx="73" cy="62" r="7.5" fill="#FFC23D"/><circle cx="74.3" cy="63.3" r="3.8" fill="#4A1014"/><circle cx="73.2" cy="62.2" r="1.3" fill="#fff"/>
<path d="M46 76 q14 12 28 0 q-3 10 -14 10 q-11 0 -14 -10 z" fill="#fff"/>
<path d="M49 78.5 l3 -5.5 l3.5 4.5 z" fill="#fff"/><path d="M71 78.5 l-3 -5.5 l-3.5 4.5 z" fill="#fff"/>
<path d="M46 76 q14 12 28 0" fill="none" stroke="#4A1014" stroke-width="3" stroke-linecap="round"/>
<circle cx="88" cy="82" r="5" fill="none" stroke="#E8A21B" stroke-width="3"/>
<circle cx="18" cy="42" r="2.2" fill="#FFC83D"/><circle cx="104" cy="50" r="2.2" fill="#FFC83D"/>`,

koi: `<defs><radialGradient id="jko-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FBF7F0"/><stop offset="1" stop-color="#EDE3D4"/></radialGradient></defs>
<path d="M60 14 l-9 14 q9 5 18 0 z" fill="#E8845C"/>
<ellipse cx="26" cy="66" rx="12" ry="7" fill="#E8845C" transform="rotate(-34 26 66)"/>
<ellipse cx="94" cy="66" rx="12" ry="7" fill="#E8845C" transform="rotate(34 94 66)"/>
<circle cx="60" cy="58" r="30" fill="url(#jko-g)"/>
<path d="M38 38 q10 -8 24 -4 q-4 12 -16 13 q-6 -3 -8 -9 z" fill="#E8845C"/>
<path d="M74 76 q10 2 14 8 q-8 6 -16 2 z" fill="#E8845C"/>
<circle cx="47" cy="58" r="8" fill="#fff"/><circle cx="48.4" cy="59.5" r="4" fill="#3A2A20"/><circle cx="47.3" cy="58.3" r="1.4" fill="#fff"/>
<circle cx="73" cy="58" r="8" fill="#fff"/><circle cx="74.4" cy="59.5" r="4" fill="#3A2A20"/><circle cx="73.3" cy="58.3" r="1.4" fill="#fff"/>
<ellipse cx="38" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="82" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<circle cx="60" cy="74" r="4.5" fill="none" stroke="#3A2A20" stroke-width="3"/>
<path d="M50 76 q-6 1 -9 5 M70 76 q6 1 9 5" stroke="#C9A88A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M12 98 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="20" cy="34" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="102" cy="30" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>`,

starsteel: `<defs><radialGradient id="jss-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#B4BCCE"/><stop offset="1" stop-color="#7C8498"/></radialGradient></defs>
<path d="M60 10 L72 48 L110 60 L72 72 L60 110 L48 72 L10 60 L48 48 z" fill="url(#jss-g)" stroke="#5E6678" stroke-width="3" stroke-linejoin="round"/>
<path d="M60 22 L68 50 L96 60 L68 70 L60 98 L52 70 L24 60 L52 50 z" fill="none" stroke="#98A0B4" stroke-width="2" stroke-linejoin="round" opacity=".7"/>
<circle cx="60" cy="60" r="19" fill="#5E6678"/>
<circle cx="53" cy="57" r="6.5" fill="#fff"/><circle cx="54.2" cy="58.4" r="3.4" fill="#20242E"/><circle cx="53.2" cy="57.3" r="1.2" fill="#fff"/>
<circle cx="67" cy="57" r="6.5" fill="#fff"/><circle cx="68.2" cy="58.4" r="3.4" fill="#20242E"/><circle cx="67.2" cy="57.3" r="1.2" fill="#fff"/>
<ellipse cx="48" cy="65" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".8"/><ellipse cx="72" cy="65" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".8"/>
<path d="M54 68 q6 5 12 0" fill="none" stroke="#20242E" stroke-width="3" stroke-linecap="round"/>
<path d="M96 26 a34 34 0 0 1 8 18" fill="none" stroke="#98A0B4" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M24 94 a34 34 0 0 1 -8 -18" fill="none" stroke="#98A0B4" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<circle cx="20" cy="24" r="2.2" fill="#FFC83D"/><circle cx="100" cy="96" r="2.2" fill="#FFC83D"/>`,

dragonmaster: `<defs><radialGradient id="jdm-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#FFC23D" stop-opacity=".4"/><stop offset="1" stop-color="#FFC23D" stop-opacity="0"/></radialGradient><radialGradient id="jdm-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#57B87E"/><stop offset="1" stop-color="#2E8F5C"/></radialGradient></defs>
<circle cx="60" cy="58" r="50" fill="url(#jdm-a)"/>
<path d="M36 30 q-6 -14 2 -22 q4 4 4 10 q4 -4 10 -4 q-2 10 -10 16 z" fill="#E8A21B"/>
<path d="M84 30 q6 -14 -2 -22 q-4 4 -4 10 q-4 -4 -10 -4 q2 10 10 16 z" fill="#E8A21B"/>
<path d="M30 44 q-4 8 0 16 M90 44 q4 8 0 16" stroke="#E8A21B" stroke-width="4" fill="none" stroke-linecap="round"/>
<circle cx="60" cy="60" r="29" fill="url(#jdm-g)"/>
<path d="M34 48 q8 -12 26 -12 q18 0 26 12 q-12 -5 -26 -5 q-14 0 -26 5 z" fill="#E8A21B"/>
<path d="M40 50 q6 -5 12 -2 M80 50 q-6 -5 -12 -2" stroke="#1E5F3C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="48" cy="60" r="8" fill="#fff"/><circle cx="49.4" cy="61.5" r="4" fill="#14402A"/><circle cx="48.3" cy="60.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="60" r="8" fill="#fff"/><circle cx="73.4" cy="61.5" r="4" fill="#14402A"/><circle cx="72.3" cy="60.3" r="1.4" fill="#fff"/>
<ellipse cx="60" cy="74" rx="12" ry="8" fill="#A8DCBE"/>
<circle cx="56" cy="72" r="1.6" fill="#14402A"/><circle cx="64" cy="72" r="1.6" fill="#14402A"/>
<path d="M55 78 q5 4 10 0" fill="none" stroke="#14402A" stroke-width="2.5" stroke-linecap="round"/>
<path d="M44 70 q-10 2 -16 10 M76 70 q10 2 16 10" stroke="#C43D5A" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="60" cy="102" r="6" fill="#FFE9A8" stroke="#E8A21B" stroke-width="2.5"/>
<path d="M16 34 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 28 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* LAB PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

beaker: `<path d="M50 14 h20 v26 l16 42 q4 16 -13 16 h-26 q-17 0 -13 -16 l16 -42 z" fill="#EAF6FF" stroke="#B8D4E8" stroke-width="3"/>
<path d="M46 16 h28" stroke="#B8D4E8" stroke-width="4" stroke-linecap="round"/>
<path d="M42 66 l12 0 q6 6 12 0 l12 0 8 20 q3 12 -10 12 h-26 q-13 0 -10 -12 z" fill="#58D0A8"/>
<circle cx="52" cy="58" r="3" fill="#58D0A8"/><circle cx="66" cy="50" r="2.4" fill="#58D0A8"/><circle cx="60" cy="40" r="2" fill="#58D0A8"/>
<circle cx="50" cy="80" r="6.5" fill="#fff"/><circle cx="51.2" cy="81.4" r="3.4" fill="#0E5A48"/><circle cx="50.2" cy="80.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="80" r="6.5" fill="#fff"/><circle cx="71.2" cy="81.4" r="3.4" fill="#0E5A48"/><circle cx="70.2" cy="80.3" r="1.2" fill="#fff"/>
<ellipse cx="44" cy="88" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="88" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M54 90 q6 5 12 0" fill="none" stroke="#0E5A48" stroke-width="3" stroke-linecap="round"/>
<circle cx="82" cy="70" r="2.6" fill="#8ADFC8" opacity=".9"/><circle cx="42" cy="74" r="2.2" fill="#8ADFC8" opacity=".9"/>
<circle cx="24" cy="36" r="2.2" fill="#FFC83D"/><circle cx="98" cy="42" r="2.2" fill="#FFC83D"/>`,

atom: `<defs><radialGradient id="lat-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FF9E6E"/><stop offset="1" stop-color="#E85C3C"/></radialGradient></defs>
<ellipse cx="60" cy="60" rx="40" ry="15" fill="none" stroke="#8ADAFF" stroke-width="3" opacity=".8"/>
<ellipse cx="60" cy="60" rx="40" ry="15" fill="none" stroke="#8ADAFF" stroke-width="3" opacity=".8" transform="rotate(60 60 60)"/>
<ellipse cx="60" cy="60" rx="40" ry="15" fill="none" stroke="#8ADAFF" stroke-width="3" opacity=".8" transform="rotate(-60 60 60)"/>
<circle cx="100" cy="60" r="4" fill="#36D1FF"/><circle cx="40" cy="26" r="4" fill="#36D1FF"/><circle cx="40" cy="94" r="4" fill="#36D1FF"/>
<circle cx="60" cy="60" r="21" fill="url(#lat-g)"/>
<circle cx="53" cy="57" r="7" fill="#fff"/><circle cx="54.3" cy="58.5" r="3.6" fill="#7A2A14"/><circle cx="53.2" cy="57.3" r="1.3" fill="#fff"/>
<circle cx="67" cy="57" r="7" fill="#fff"/><circle cx="68.3" cy="58.5" r="3.6" fill="#7A2A14"/><circle cx="67.2" cy="57.3" r="1.3" fill="#fff"/>
<ellipse cx="47" cy="66" rx="3.8" ry="2.4" fill="#FFC0A8" opacity=".9"/><ellipse cx="73" cy="66" rx="3.8" ry="2.4" fill="#FFC0A8" opacity=".9"/>
<path d="M54 69 q6 5 12 0" fill="none" stroke="#7A2A14" stroke-width="3" stroke-linecap="round"/>
<circle cx="18" cy="20" r="2.2" fill="#FFC83D"/><circle cx="102" cy="98" r="2.2" fill="#FFC83D"/>`,

robo: `<path d="M60 22 v-8" stroke="#8A94A8" stroke-width="3.5" stroke-linecap="round"/><circle cx="60" cy="10" r="4" fill="#36D1FF"/>
<rect x="30" y="22" width="60" height="54" rx="14" fill="#C9D2DD"/>
<rect x="38" y="32" width="44" height="34" rx="10" fill="#EAF0F5"/>
<circle cx="26" cy="46" r="5" fill="#9AA6B8"/><circle cx="94" cy="46" r="5" fill="#9AA6B8"/>
<circle cx="50" cy="46" r="7.5" fill="#fff" stroke="#9AA6B8" stroke-width="2"/><circle cx="51.3" cy="47.5" r="3.8" fill="#0E8A78"/><circle cx="50.2" cy="46.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="46" r="7.5" fill="#fff" stroke="#9AA6B8" stroke-width="2"/><circle cx="71.3" cy="47.5" r="3.8" fill="#0E8A78"/><circle cx="70.2" cy="46.3" r="1.3" fill="#fff"/>
<path d="M52 58 q8 6 16 0" fill="none" stroke="#4A5568" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="42" cy="56" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".7"/><ellipse cx="78" cy="56" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".7"/>
<path d="M42 84 q18 8 36 0 l-2 18 q-16 6 -32 0 z" fill="#9AA6B8"/>
<rect x="52" y="88" width="16" height="9" rx="3" fill="#0E8A78"/><circle cx="57" cy="92.5" r="2" fill="#8ADFC8"/><circle cx="64" cy="92.5" r="2" fill="#58D0A8"/>
<path d="M96 30 q4 -1 5 -5" stroke="#36D1FF" stroke-width="2.5" stroke-linecap="round" fill="none"/>
<circle cx="18" cy="70" r="2.2" fill="#FFC83D"/><circle cx="104" cy="76" r="2.2" fill="#FFC83D"/>`,

magnet: `<path d="M42 100 v-44 q0 -20 18 -20 q18 0 18 20 v44" fill="none" stroke="#E0483C" stroke-width="18"/>
<path d="M42 100 v-44 q0 -20 18 -20 q18 0 18 20 v44" fill="none" stroke="#F06A5C" stroke-width="7" opacity=".6"/>
<rect x="33" y="88" width="18" height="14" fill="#F4F4FA" stroke="#C9C9DD" stroke-width="2"/>
<rect x="69" y="88" width="18" height="14" fill="#F4F4FA" stroke="#C9C9DD" stroke-width="2"/>
<circle cx="53" cy="44" r="6.5" fill="#fff"/><circle cx="54.2" cy="45.4" r="3.4" fill="#5A1410"/><circle cx="53.2" cy="44.3" r="1.2" fill="#fff"/>
<circle cx="67" cy="44" r="6.5" fill="#fff"/><circle cx="68.2" cy="45.4" r="3.4" fill="#5A1410"/><circle cx="67.2" cy="44.3" r="1.2" fill="#fff"/>
<ellipse cx="48" cy="52" rx="3.5" ry="2.2" fill="#FFB3A8" opacity=".9"/><ellipse cx="72" cy="52" rx="3.5" ry="2.2" fill="#FFB3A8" opacity=".9"/>
<path d="M54 55 q6 5 12 0" fill="none" stroke="#5A1410" stroke-width="3" stroke-linecap="round"/>
<path d="M34 112 l4 -7 l-5 -1 l5 -8 M86 112 l-4 -7 l5 -1 l-5 -8" fill="none" stroke="#FFC23D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M22 74 h-8 M24 82 h-7 M98 74 h8 M96 82 h7" stroke="#C9C9DD" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="24" cy="24" r="2.2" fill="#FFC83D"/><circle cx="96" cy="24" r="2.2" fill="#FFC83D"/>`,

germy: `<defs><radialGradient id="lgm-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#B8E878"/><stop offset="1" stop-color="#7BC24E"/></radialGradient></defs>
<path d="M60 20 v-9 M88 32 l6 -7 M98 60 h9 M88 88 l6 7 M60 100 v9 M32 88 l-6 7 M22 60 h-9 M32 32 l-6 -7" stroke="#5CA346" stroke-width="4" stroke-linecap="round"/>
<circle cx="60" cy="19" r="3.5" fill="#7BC24E"/><circle cx="89" cy="31" r="3.5" fill="#7BC24E"/><circle cx="101" cy="60" r="3.5" fill="#7BC24E"/><circle cx="89" cy="89" r="3.5" fill="#7BC24E"/><circle cx="60" cy="101" r="3.5" fill="#7BC24E"/><circle cx="31" cy="89" r="3.5" fill="#7BC24E"/><circle cx="19" cy="60" r="3.5" fill="#7BC24E"/><circle cx="31" cy="31" r="3.5" fill="#7BC24E"/>
<circle cx="60" cy="60" r="34" fill="url(#lgm-g)"/>
<circle cx="42" cy="46" r="4" fill="#5CA346" opacity=".6"/><circle cx="80" cy="74" r="5" fill="#5CA346" opacity=".6"/><circle cx="44" cy="80" r="3" fill="#5CA346" opacity=".6"/>
<circle cx="52" cy="56" r="11" fill="#fff"/><circle cx="54" cy="58" r="5.5" fill="#28481C"/><circle cx="52.4" cy="56.4" r="2" fill="#fff"/>
<circle cx="76" cy="58" r="7" fill="#fff"/><circle cx="77.2" cy="59.4" r="3.6" fill="#28481C"/><circle cx="76.2" cy="58.3" r="1.3" fill="#fff"/>
<path d="M50 76 q8 7 18 1" fill="none" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M56 78.5 l2.6 4.6 l3.2 -4 z" fill="#fff"/>
<ellipse cx="38" cy="66" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".7"/>
<circle cx="18" cy="102" r="2.2" fill="#FFC83D"/><circle cx="104" cy="16" r="2.2" fill="#FFC83D"/>`,

brainiac: `<defs><radialGradient id="lbr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFB8CC"/><stop offset="1" stop-color="#F08CA8"/></radialGradient></defs>
<path d="M60 24 q-20 -2 -26 12 q-12 4 -10 18 q-4 12 8 18 q2 14 18 14 q8 6 10 4 q2 2 10 -4 q16 0 18 -14 q12 -6 8 -18 q2 -14 -10 -18 q-6 -14 -26 -12 z" fill="url(#lbr-g)"/>
<path d="M60 26 v22 M42 36 q8 6 6 14 M78 36 q-8 6 -6 14 M36 58 q8 2 10 8 M84 58 q-8 2 -10 8" fill="none" stroke="#D06888" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<circle cx="48" cy="62" r="10" fill="#fff" stroke="#8A5B2E" stroke-width="2.5"/>
<circle cx="72" cy="62" r="10" fill="#fff" stroke="#8A5B2E" stroke-width="2.5"/>
<path d="M58 60 h4 M38 60 q-4 -2 -6 -5 M82 60 q4 -2 6 -5" stroke="#8A5B2E" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<circle cx="49.5" cy="63.5" r="4.2" fill="#5C2A38"/><circle cx="48.3" cy="62.3" r="1.5" fill="#fff"/>
<circle cx="73.5" cy="63.5" r="4.2" fill="#5C2A38"/><circle cx="72.3" cy="62.3" r="1.5" fill="#fff"/>
<ellipse cx="38" cy="76" rx="4.2" ry="2.6" fill="#FF7FA8" opacity=".9"/><ellipse cx="82" cy="76" rx="4.2" ry="2.6" fill="#FF7FA8" opacity=".9"/>
<path d="M53 80 q7 6 14 0" fill="none" stroke="#5C2A38" stroke-width="3.5" stroke-linecap="round"/>
<path d="M96 20 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<circle cx="20" cy="98" r="2.2" fill="#FFC83D"/>`,

phoenix: `<defs><radialGradient id="lph-g" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#FFB158"/><stop offset="1" stop-color="#F0742A"/></radialGradient></defs>
<path d="M60 6 q10 10 4 22 q-4 -4 -4 -8 q0 4 -4 8 q-6 -12 4 -22 z" fill="#FFC23D"/>
<path d="M42 20 q6 8 2 16 l-8 -6 z" fill="#FF8A3C"/>
<path d="M78 20 q-6 8 -2 16 l8 -6 z" fill="#FF8A3C"/>
<path d="M24 54 q-12 -2 -18 6 q8 12 22 8 z" fill="#FF8A3C"/>
<path d="M96 54 q12 -2 18 6 q-8 12 -22 8 z" fill="#FF8A3C"/>
<circle cx="60" cy="62" r="30" fill="url(#lph-g)"/>
<path d="M40 80 q6 -8 12 -2 q6 -8 8 -8 q2 0 8 8 q6 -6 12 2 q-6 10 -20 10 q-14 0 -20 -10 z" fill="#FFC23D" opacity=".9"/>
<circle cx="48" cy="56" r="8" fill="#fff"/><circle cx="49.4" cy="57.5" r="4" fill="#7A2A08"/><circle cx="48.3" cy="56.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="56" r="8" fill="#fff"/><circle cx="73.4" cy="57.5" r="4" fill="#7A2A08"/><circle cx="72.3" cy="56.3" r="1.4" fill="#fff"/>
<path d="M54 68 l6 8 l6 -8 z" fill="#FFD24D" stroke="#C88930" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="39" cy="66" rx="4.2" ry="2.6" fill="#FFC0A8" opacity=".9"/><ellipse cx="81" cy="66" rx="4.2" ry="2.6" fill="#FFC0A8" opacity=".9"/>
<circle cx="24" cy="96" r="2.5" fill="#FF8A3C"/><circle cx="98" cy="94" r="2" fill="#FFC23D"/><circle cx="106" cy="34" r="2.2" fill="#FFC23D"/>`,

volt: `<defs><radialGradient id="lvt-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#F0B429"/></radialGradient></defs>
<path d="M68 8 L36 62 h18 L48 112 L86 52 h-20 L80 8 z" fill="url(#lvt-g)" stroke="#E8A21B" stroke-width="6" stroke-linejoin="round"/>
<circle cx="56" cy="40" r="7" fill="#fff"/><circle cx="57.2" cy="41.4" r="3.6" fill="#7A4A08"/><circle cx="56.2" cy="40.3" r="1.3" fill="#fff"/>
<circle cx="72" cy="40" r="7" fill="#fff"/><circle cx="73.2" cy="41.4" r="3.6" fill="#7A4A08"/><circle cx="72.2" cy="40.3" r="1.3" fill="#fff"/>
<ellipse cx="50" cy="49" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/><ellipse cx="78" cy="49" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/>
<path d="M57 52 q6 6 13 0" fill="none" stroke="#7A4A08" stroke-width="3" stroke-linecap="round"/>
<path d="M24 30 l5 5 M18 44 h7 M96 84 l-5 -5 M102 70 h-7" stroke="#FFC23D" stroke-width="3" stroke-linecap="round"/>
<circle cx="98" cy="24" r="2.2" fill="#FFC83D"/><circle cx="22" cy="98" r="2.2" fill="#FFC83D"/>`,

scopey: `<circle cx="54" cy="50" r="30" fill="#CFF1FF" opacity=".95"/>
<circle cx="54" cy="50" r="30" fill="none" stroke="#37589E" stroke-width="8"/>
<path d="M34 34 q6 -8 14 -10" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<rect x="76" y="72" width="34" height="15" rx="7.5" fill="#2C4A88" transform="rotate(45 76 72)"/>
<circle cx="45" cy="48" r="8.5" fill="#fff"/><circle cx="46.4" cy="49.6" r="4.2" fill="#1E2A5C"/><circle cx="45.3" cy="48.3" r="1.5" fill="#fff"/>
<circle cx="65" cy="48" r="8.5" fill="#fff"/><circle cx="66.4" cy="49.6" r="4.2" fill="#1E2A5C"/><circle cx="65.3" cy="48.3" r="1.5" fill="#fff"/>
<ellipse cx="38" cy="58" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/><ellipse cx="72" cy="58" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/>
<path d="M47 62 q7 6 14 0" fill="none" stroke="#1E2A5C" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="90" r="2.2" fill="#FFC83D"/><circle cx="102" cy="30" r="2.2" fill="#FFC83D"/>
<path d="M14 24 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

aurum: `<defs><radialGradient id="lau-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFB84D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient><radialGradient id="lau-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#E8A21B"/></radialGradient></defs>
<circle cx="60" cy="62" r="52" fill="url(#lau-a)"/>
<rect x="50" y="16" width="20" height="10" rx="3" fill="#8A5B2E"/>
<rect x="52" y="26" width="16" height="14" fill="#FFF6E0" stroke="#E8C878" stroke-width="2.5"/>
<circle cx="60" cy="70" r="28" fill="#FFF6E0" stroke="#E8C878" stroke-width="3"/>
<path d="M34 62 q4 -10 12 -15 q6 10 14 10 q8 0 14 -10 q8 5 12 15 a28 28 0 1 1 -52 0 z" fill="url(#lau-g)"/>
<circle cx="44" cy="58" r="2" fill="#FFE9A8"/><circle cx="76" cy="62" r="1.8" fill="#FFE9A8"/><circle cx="52" cy="88" r="2" fill="#FFE9A8"/>
<path d="M70 46 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFF3D6"/>
<circle cx="50" cy="68" r="7.5" fill="#fff"/><circle cx="51.3" cy="69.5" r="3.8" fill="#7A4A08"/><circle cx="50.2" cy="68.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="68" r="7.5" fill="#fff"/><circle cx="71.3" cy="69.5" r="3.8" fill="#7A4A08"/><circle cx="70.2" cy="68.3" r="1.3" fill="#fff"/>
<ellipse cx="43" cy="77" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="77" cy="77" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M53 80 q7 7 14 0" fill="none" stroke="#7A4A08" stroke-width="3.5" stroke-linecap="round"/>
<path d="M16 44 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 90 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* ARCADE PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

pixel: `<defs><radialGradient id="apx-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#5CACFF"/><stop offset="1" stop-color="#3B6FE0"/></radialGradient></defs>
<path d="M40 24 h40 v8 h8 v8 h8 v40 h-8 v8 h-8 v8 h-40 v-8 h-8 v-8 h-8 v-40 h8 v-8 h8 z" fill="url(#apx-g)"/>
<rect x="42" y="50" width="12" height="12" fill="#fff"/><rect x="46" y="54" width="7" height="7" fill="#12234A"/>
<rect x="66" y="50" width="12" height="12" fill="#fff"/><rect x="70" y="54" width="7" height="7" fill="#12234A"/>
<rect x="32" y="68" width="8" height="6" fill="#FF7FBE" opacity=".85"/><rect x="80" y="68" width="8" height="6" fill="#FF7FBE" opacity=".85"/>
<path d="M48 74 h4 v4 h16 v-4 h4 v4 h-4 v4 h-16 v-4 h-4 z" fill="#12234A"/>
<path d="M14 20 h6 v6 h-6 z M100 90 h6 v6 h-6 z" fill="#FFC83D"/>
<path d="M102 24 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#FFC83D"/>`,

joy: `<defs><radialGradient id="ajy-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FF8A76"/><stop offset="1" stop-color="#E0483C"/></radialGradient></defs>
<path d="M28 40 a25 25 0 0 1 12 -18 M92 40 a25 25 0 0 0 -12 -18" fill="none" stroke="#C9C9DD" stroke-width="3" stroke-linecap="round" opacity=".8"/>
<circle cx="60" cy="42" r="25" fill="url(#ajy-g)"/>
<path d="M42 30 q6 -7 14 -8" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>
<circle cx="51" cy="40" r="7.5" fill="#fff"/><circle cx="52.3" cy="41.5" r="3.8" fill="#5A1410"/><circle cx="51.2" cy="40.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="40" r="7.5" fill="#fff"/><circle cx="70.3" cy="41.5" r="3.8" fill="#5A1410"/><circle cx="69.2" cy="40.3" r="1.3" fill="#fff"/>
<ellipse cx="44" cy="50" rx="4.2" ry="2.6" fill="#FFB3A8" opacity=".9"/><ellipse cx="76" cy="50" rx="4.2" ry="2.6" fill="#FFB3A8" opacity=".9"/>
<path d="M53 53 q7 6 14 0" fill="none" stroke="#5A1410" stroke-width="3.5" stroke-linecap="round"/>
<rect x="54" y="66" width="12" height="18" fill="#5E5E78"/>
<path d="M30 84 h60 l6 14 q1 8 -8 8 h-56 q-9 0 -8 -8 z" fill="#2E3450"/>
<circle cx="82" cy="95" r="5" fill="#FFC23D"/><circle cx="96" cy="93" r="5" fill="#36D1FF"/>
<rect x="30" y="93" width="18" height="5" rx="2.5" fill="#5E5E78"/>
<circle cx="18" cy="30" r="2.2" fill="#FFC83D"/><circle cx="104" cy="60" r="2.2" fill="#FFC83D"/>`,

ghost: `<defs><radialGradient id="agh-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#8ADEF5"/><stop offset="1" stop-color="#4FB8DC"/></radialGradient></defs>
<path d="M32 100 v-40 q0 -28 28 -28 q28 0 28 28 v40 l-9.3 -8 l-9.4 8 l-9.3 -8 l-9.3 8 l-9.4 -8 z" fill="url(#agh-g)"/>
<circle cx="48" cy="56" r="9" fill="#fff"/><circle cx="50" cy="58" r="4.5" fill="#12234A"/><circle cx="48.5" cy="56.5" r="1.6" fill="#fff"/>
<circle cx="72" cy="56" r="9" fill="#fff"/><circle cx="74" cy="58" r="4.5" fill="#12234A"/><circle cx="72.5" cy="56.5" r="1.6" fill="#fff"/>
<ellipse cx="39" cy="67" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="81" cy="67" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M52 72 q8 7 16 0" fill="none" stroke="#12234A" stroke-width="3.5" stroke-linecap="round"/>
<path d="M20 36 q-6 -2 -8 -8 M100 36 q6 -2 8 -8" stroke="#8ADEF5" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
<path d="M98 84 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#FFC83D"/>
<circle cx="18" cy="88" r="2.2" fill="#FFC83D"/>`,

dpad: `<defs><radialGradient id="adp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#4A5068"/><stop offset="1" stop-color="#2E3450"/></radialGradient></defs>
<path d="M46 18 h28 v28 h28 v28 h-28 v28 h-28 v-28 h-28 v-28 h28 z" fill="url(#adp-g)" stroke="#20242E" stroke-width="3" stroke-linejoin="round"/>
<path d="M60 26 l7 9 h-14 z M60 94 l-7 -9 h14 z M26 60 l9 -7 v14 z M94 60 l-9 7 v-14 z" fill="#5E5E78"/>
<circle cx="52" cy="56" r="7.5" fill="#fff"/><circle cx="53.3" cy="57.5" r="3.8" fill="#12141E"/><circle cx="52.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="68" cy="56" r="7.5" fill="#fff"/><circle cx="69.3" cy="57.5" r="3.8" fill="#12141E"/><circle cx="68.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="47" cy="66" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".8"/><ellipse cx="73" cy="66" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".8"/>
<path d="M54 69 q6 5 12 0" fill="none" stroke="#C9C9DD" stroke-width="3" stroke-linecap="round"/>
<circle cx="16" cy="24" r="2.2" fill="#FFC83D"/><circle cx="104" cy="96" r="2.2" fill="#FFC83D"/>`,

tokeny: `<defs><radialGradient id="atk-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#F0A82A"/></radialGradient></defs>
<circle cx="60" cy="60" r="33" fill="url(#atk-g)"/>
<circle cx="60" cy="60" r="26" fill="none" stroke="#C8891B" stroke-width="2.5" opacity=".7"/>
<path d="M36 44 q8 -12 20 -14" fill="none" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<path d="M60 40 l2.2 5 5.4 .6 -4 3.7 1 5.3 -4.6 -2.6 -4.6 2.6 1 -5.3 -4 -3.7 5.4 -.6 z" fill="#C8891B"/>
<circle cx="50" cy="62" r="7.5" fill="#fff"/><circle cx="51.3" cy="63.5" r="3.8" fill="#7A4A08"/><circle cx="50.2" cy="62.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="62" r="7.5" fill="#fff"/><circle cx="71.3" cy="63.5" r="3.8" fill="#7A4A08"/><circle cx="70.2" cy="62.3" r="1.3" fill="#fff"/>
<ellipse cx="43" cy="71" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="77" cy="71" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M53 75 q7 6 14 0" fill="none" stroke="#7A4A08" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="28" r="2.2" fill="#FFC83D"/><circle cx="100" cy="92" r="2.2" fill="#FFC83D"/>
<path d="M100 24 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

bossbot: `<defs><radialGradient id="abb-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#98A0B4"/><stop offset="1" stop-color="#5E6678"/></radialGradient></defs>
<rect x="44" y="8" width="32" height="8" rx="4" fill="#C43D5A"/><rect x="44" y="8" width="20" height="8" rx="4" fill="#58D068"/>
<path d="M28 30 l-10 -8 M92 30 l10 -8" stroke="#5E6678" stroke-width="5" stroke-linecap="round"/>
<circle cx="16" cy="20" r="4" fill="#FFC23D"/><circle cx="104" cy="20" r="4" fill="#FFC23D"/>
<rect x="26" y="26" width="68" height="58" rx="12" fill="url(#abb-g)"/>
<circle cx="34" cy="34" r="2.5" fill="#3A4050"/><circle cx="86" cy="34" r="2.5" fill="#3A4050"/><circle cx="34" cy="76" r="2.5" fill="#3A4050"/><circle cx="86" cy="76" r="2.5" fill="#3A4050"/>
<path d="M38 42 l14 6 M82 42 l-14 6" stroke="#20242E" stroke-width="4.5" stroke-linecap="round"/>
<circle cx="47" cy="56" r="8.5" fill="#fff"/><circle cx="48.5" cy="57.5" r="4.2" fill="#E0483C"/><circle cx="47.3" cy="56.3" r="1.5" fill="#fff"/>
<circle cx="73" cy="56" r="8.5" fill="#fff"/><circle cx="74.5" cy="57.5" r="4.2" fill="#E0483C"/><circle cx="73.3" cy="56.3" r="1.5" fill="#fff"/>
<path d="M46 70 l4.6 4 l4.7 -4 l4.7 4 l4.7 -4 l4.7 4 l4.6 -4" fill="none" stroke="#20242E" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M42 84 q18 8 36 0 l-3 18 q-15 6 -30 0 z" fill="#4A5068"/>
<rect x="53" y="90" width="14" height="7" rx="2" fill="#E0483C"/>
<circle cx="14" cy="60" r="2.2" fill="#FFC83D"/><circle cx="106" cy="64" r="2.2" fill="#FFC83D"/>`,

rainbow: `<rect x="32" y="20" width="56" height="70" rx="7" fill="#C9C9DD"/>
<path d="M38 26 h44 M38 32 h44" stroke="#A8A8C0" stroke-width="3" stroke-linecap="round"/>
<rect x="40" y="40" width="40" height="42" rx="5" fill="#fff"/>
<path d="M44 62 a16 16 0 0 1 32 0" fill="none" stroke="#E0483C" stroke-width="5"/>
<path d="M49 62 a11 11 0 0 1 22 0" fill="none" stroke="#FFC23D" stroke-width="5"/>
<path d="M54 62 a6 6 0 0 1 12 0" fill="none" stroke="#3B6FE0" stroke-width="5"/>
<circle cx="52" cy="68" r="5.5" fill="#fff" stroke="#C9C9DD" stroke-width="1.5"/><circle cx="53" cy="69" r="2.8" fill="#2B1B5E"/><circle cx="52.2" cy="68.2" r="1" fill="#fff"/>
<circle cx="68" cy="68" r="5.5" fill="#fff" stroke="#C9C9DD" stroke-width="1.5"/><circle cx="69" cy="69" r="2.8" fill="#2B1B5E"/><circle cx="68.2" cy="68.2" r="1" fill="#fff"/>
<path d="M56 74 q4 3.5 8 0" fill="none" stroke="#2B1B5E" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="46" cy="73" rx="3" ry="2" fill="#FF9EB8" opacity=".85"/><ellipse cx="74" cy="73" rx="3" ry="2" fill="#FF9EB8" opacity=".85"/>
<rect x="42" y="90" width="36" height="10" fill="#8A8AA6"/>
<circle cx="22" cy="36" r="2.5" fill="#E0483C"/><circle cx="16" cy="52" r="2.5" fill="#FFC23D"/><circle cx="22" cy="68" r="2.5" fill="#58D068"/><circle cx="100" cy="40" r="2.5" fill="#3B6FE0"/><circle cx="104" cy="58" r="2.5" fill="#8A5CE8"/>`,

glitch: `<defs><radialGradient id="agl-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#5CACFF"/><stop offset="1" stop-color="#3B6FE0"/></radialGradient></defs>
<circle cx="60" cy="62" r="28" fill="url(#agl-g)"/>
<rect x="24" y="38" width="44" height="9" fill="#36D1FF" opacity=".85"/>
<rect x="54" y="38" width="38" height="9" fill="#FF5D9E" opacity=".85"/>
<path d="M32 38 h56 v9 h-56 z" fill="url(#agl-g)"/>
<rect x="20" y="76" width="34" height="7" fill="#FF5D9E" opacity=".7"/>
<rect x="68" y="70" width="34" height="7" fill="#36D1FF" opacity=".7"/>
<circle cx="48" cy="58" r="8.5" fill="#fff"/><rect x="44" y="54" width="9" height="9" fill="#12234A"/><rect x="45" y="55" width="3" height="3" fill="#fff"/>
<circle cx="72" cy="58" r="8.5" fill="#fff"/><circle cx="73.5" cy="59.5" r="4.2" fill="#12234A"/><circle cx="72.3" cy="58.3" r="1.5" fill="#fff"/>
<ellipse cx="39" cy="68" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/><ellipse cx="81" cy="68" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/>
<path d="M50 74 h6 v3 h8 v-3 h6" fill="none" stroke="#12234A" stroke-width="3" stroke-linecap="round"/>
<path d="M14 26 h5 M22 26 h4 M98 98 h5 M90 98 h4" stroke="#36D1FF" stroke-width="3" stroke-linecap="round"/>
<path d="M100 20 h4 v4 h4 v4 h-4 v4 h-4 v-4 h-4 v-4 h4 z" fill="#FFC83D"/>`,

hiscore: `<path d="M30 14 h60 l4 12 h-68 z" fill="#6C4FE0"/>
<path d="M34 14 h8 l-2 12 h-8 z M54 14 h8 l0 12 h-8 z M74 14 h8 l2 12 h-8 z" fill="#FF5D9E"/>
<rect x="28" y="26" width="64" height="56" rx="6" fill="#3B2A6E"/>
<rect x="36" y="32" width="48" height="38" rx="4" fill="#12234A"/>
<rect x="46" y="42" width="9" height="9" fill="#7CFFB2"/><rect x="49" y="45" width="4" height="4" fill="#12234A"/>
<rect x="65" y="42" width="9" height="9" fill="#7CFFB2"/><rect x="68" y="45" width="4" height="4" fill="#12234A"/>
<path d="M48 58 h4 v4 h16 v-4 h4" fill="none" stroke="#7CFFB2" stroke-width="3" stroke-linecap="round"/>
<circle cx="42" cy="37" r="1.5" fill="#7CFFB2" opacity=".7"/><circle cx="78" cy="66" r="1.5" fill="#7CFFB2" opacity=".7"/>
<path d="M24 82 h72 l-6 26 h-60 z" fill="#5335C9"/>
<circle cx="50" cy="94" r="5.5" fill="#E0483C"/><circle cx="66" cy="94" r="5.5" fill="#FFC23D"/>
<path d="M82 98 v-8" stroke="#2B1B5E" stroke-width="4" stroke-linecap="round"/><circle cx="82" cy="87" r="4.5" fill="#E0483C"/>
<circle cx="16" cy="50" r="2.2" fill="#FFC83D"/><circle cx="106" cy="46" r="2.2" fill="#FFC83D"/>`,

neonking: `<defs><radialGradient id="ank-g" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#251A48"/><stop offset="1" stop-color="#14102A"/></radialGradient></defs>
<circle cx="60" cy="64" r="36" fill="url(#ank-g)"/>
<circle cx="60" cy="64" r="30" fill="none" stroke="#36D1FF" stroke-width="6" opacity=".25"/>
<circle cx="60" cy="64" r="30" fill="none" stroke="#36D1FF" stroke-width="2.5"/>
<path d="M42 34 l4 -16 l9 9 l5 -14 l5 14 l9 -9 l4 16 z" fill="none" stroke="#FF5D9E" stroke-width="7" stroke-linejoin="round" opacity=".25"/>
<path d="M42 34 l4 -16 l9 9 l5 -14 l5 14 l9 -9 l4 16 z" fill="none" stroke="#FF5D9E" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M42 58 q5 -6 10 0 M68 58 q5 -6 10 0" fill="none" stroke="#FFC23D" stroke-width="6" stroke-linecap="round" opacity=".25"/>
<path d="M42 58 q5 -6 10 0 M68 58 q5 -6 10 0" fill="none" stroke="#FFC23D" stroke-width="3" stroke-linecap="round"/>
<path d="M48 76 q12 10 24 0" fill="none" stroke="#FF5D9E" stroke-width="6" stroke-linecap="round" opacity=".25"/>
<path d="M48 76 q12 10 24 0" fill="none" stroke="#FF5D9E" stroke-width="3" stroke-linecap="round"/>
<circle cx="38" cy="68" r="2.5" fill="#36D1FF" opacity=".8"/><circle cx="82" cy="68" r="2.5" fill="#36D1FF" opacity=".8"/>
<circle cx="18" cy="34" r="2.2" fill="#FF5D9E"/><circle cx="102" cy="38" r="2.2" fill="#36D1FF"/><circle cx="22" cy="98" r="2.2" fill="#FFC23D"/><circle cx="98" cy="100" r="2.2" fill="#FF5D9E"/>
<path d="M104 78 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* ORIGAMI PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

paperplane: `<path d="M20 100 q10 -8 24 -8" fill="none" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 8"/>
<path d="M12 72 L104 28 L54 70 z" fill="#FBF8F0" stroke="#D8D0BC" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 70 L104 28 L62 98 z" fill="#E8E0CC" stroke="#D8D0BC" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 70 L104 28" stroke="#C9C2B0" stroke-width="2"/>
<circle cx="50" cy="54" r="7" fill="#fff" stroke="#D8D0BC" stroke-width="1.5"/><circle cx="51.2" cy="55.4" r="3.6" fill="#2B2B3E"/><circle cx="50.2" cy="54.3" r="1.2" fill="#fff"/>
<circle cx="68" cy="46" r="7" fill="#fff" stroke="#D8D0BC" stroke-width="1.5"/><circle cx="69.2" cy="47.4" r="3.6" fill="#2B2B3E"/><circle cx="68.2" cy="46.3" r="1.2" fill="#fff"/>
<ellipse cx="44" cy="64" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M56 62 q5 4 11 -1" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<circle cx="24" cy="30" r="2.2" fill="#FFC83D"/><circle cx="100" cy="92" r="2.2" fill="#FFC83D"/>`,

cranefold: `<path d="M34 70 L8 32 L52 56 z" fill="#FBF8F0" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M86 70 L112 32 L68 56 z" fill="#FBF8F0" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M52 56 L60 18 L68 56 z" fill="#F4EDDC" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M55 26 L60 6 L65 26 L60 20 z" fill="#E8845C"/>
<circle cx="60" cy="14" r="2.5" fill="#C43D5A"/>
<path d="M60 50 L86 74 L60 102 L34 74 z" fill="#FBF8F0" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 50 L60 102 M34 74 L86 74" stroke="#EDE5D0" stroke-width="2"/>
<circle cx="50" cy="70" r="7" fill="#fff" stroke="#E0D8C4" stroke-width="1.5"/><circle cx="51.2" cy="71.4" r="3.6" fill="#2B2B3E"/><circle cx="50.2" cy="70.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="70" r="7" fill="#fff" stroke="#E0D8C4" stroke-width="1.5"/><circle cx="71.2" cy="71.4" r="3.6" fill="#2B2B3E"/><circle cx="70.2" cy="70.3" r="1.2" fill="#fff"/>
<ellipse cx="44" cy="79" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="79" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M54 82 q6 5 12 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<circle cx="20" cy="88" r="2.2" fill="#FFC83D"/><circle cx="102" cy="86" r="2.2" fill="#FFC83D"/>`,

boatfold: `<path d="M40 64 L60 32 L80 64 z" fill="#FBF8F0" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 32 L60 64" stroke="#EDE5D0" stroke-width="2"/>
<path d="M20 64 h80 l-15 24 h-50 z" fill="#F4EDDC" stroke="#E0D8C4" stroke-width="2" stroke-linejoin="round"/>
<path d="M20 64 L35 88 M100 64 L85 88" stroke="#E0D8C4" stroke-width="2"/>
<circle cx="50" cy="74" r="6.5" fill="#fff" stroke="#E0D8C4" stroke-width="1.5"/><circle cx="51.2" cy="75.4" r="3.4" fill="#2B2B3E"/><circle cx="50.2" cy="74.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="74" r="6.5" fill="#fff" stroke="#E0D8C4" stroke-width="1.5"/><circle cx="71.2" cy="75.4" r="3.4" fill="#2B2B3E"/><circle cx="70.2" cy="74.3" r="1.2" fill="#fff"/>
<ellipse cx="43" cy="81" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/><ellipse cx="77" cy="81" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/>
<path d="M55 82 q5 4 10 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<path d="M10 100 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="24" cy="36" r="2.2" fill="#FFC83D"/><circle cx="98" cy="42" r="2.2" fill="#FFC83D"/>`,

hopfold: `<path d="M30 42 L42 26 L54 42 z" fill="#8FD068" stroke="#5CA346" stroke-width="2" stroke-linejoin="round"/>
<path d="M66 42 L78 26 L90 42 z" fill="#8FD068" stroke="#5CA346" stroke-width="2" stroke-linejoin="round"/>
<circle cx="42" cy="40" r="7" fill="#fff"/><circle cx="43.2" cy="41.4" r="3.6" fill="#28481C"/><circle cx="42.2" cy="40.3" r="1.2" fill="#fff"/>
<circle cx="78" cy="40" r="7" fill="#fff"/><circle cx="79.2" cy="41.4" r="3.6" fill="#28481C"/><circle cx="78.2" cy="40.3" r="1.2" fill="#fff"/>
<path d="M24 88 L60 44 L96 88 z" fill="#8FD068" stroke="#5CA346" stroke-width="2" stroke-linejoin="round"/>
<path d="M40 88 L60 62 L80 88 z" fill="#B8E098"/>
<path d="M24 88 h72 l-6 12 h-60 z" fill="#6CB454" stroke="#5CA346" stroke-width="2" stroke-linejoin="round"/>
<path d="M34 92 l8 -8 M86 92 l-8 -8" stroke="#4A8636" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="48" cy="76" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="72" cy="76" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M54 78 q6 5 12 0" fill="none" stroke="#28481C" stroke-width="3" stroke-linecap="round"/>
<circle cx="18" cy="40" r="2.2" fill="#FFC83D"/><circle cx="104" cy="60" r="2.2" fill="#FFC83D"/>`,

fanfold: `<path d="M12 74 A50 50 0 0 1 108 74 L60 90 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M23 51 L60 90 M42 34 L60 90 M78 34 L60 90 M97 51 L60 90" stroke="#E07098" stroke-width="2"/>
<path d="M12 74 A50 50 0 0 1 23 51 L60 90 z" fill="#FFC0D8"/>
<path d="M42 34 A50 50 0 0 1 78 34 L60 90 z" fill="#FFC0D8"/>
<path d="M97 51 A50 50 0 0 1 108 74 L60 90 z" fill="#FFC0D8"/>
<rect x="55" y="88" width="10" height="16" rx="4" fill="#C25A2E"/>
<path d="M60 104 q-6 6 -4 12" fill="none" stroke="#E8A21B" stroke-width="3" stroke-linecap="round"/>
<circle cx="50" cy="62" r="7" fill="#fff" stroke="#E07098" stroke-width="1.5"/><circle cx="51.2" cy="63.4" r="3.6" fill="#5C2A38"/><circle cx="50.2" cy="62.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="62" r="7" fill="#fff" stroke="#E07098" stroke-width="1.5"/><circle cx="71.2" cy="63.4" r="3.6" fill="#5C2A38"/><circle cx="70.2" cy="62.3" r="1.2" fill="#fff"/>
<ellipse cx="43" cy="70" rx="3.8" ry="2.4" fill="#FF7FA8" opacity=".9"/><ellipse cx="77" cy="70" rx="3.8" ry="2.4" fill="#FF7FA8" opacity=".9"/>
<path d="M54 73 q6 5 12 0" fill="none" stroke="#5C2A38" stroke-width="3" stroke-linecap="round"/>
<circle cx="18" cy="30" r="2.2" fill="#FFC83D"/><circle cx="102" cy="30" r="2.2" fill="#FFC83D"/>`,

lotusfold: `<path d="M22 62 L46 52 L40 78 L18 74 z" fill="#FFC0D8" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M98 62 L74 52 L80 78 L102 74 z" fill="#FFC0D8" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 20 L76 52 L60 70 L44 52 z" fill="#FF8AB8" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 20 L60 70" stroke="#E07098" stroke-width="1.5" opacity=".6"/>
<path d="M34 40 L56 54 L44 76 L28 62 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M86 40 L64 54 L76 76 L92 62 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M28 76 h64 l-12 22 h-40 z" fill="#F0A0C0" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<circle cx="50" cy="85" r="6.5" fill="#fff" stroke="#E07098" stroke-width="1.5"/><circle cx="51.2" cy="86.4" r="3.4" fill="#5C2A38"/><circle cx="50.2" cy="85.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="85" r="6.5" fill="#fff" stroke="#E07098" stroke-width="1.5"/><circle cx="71.2" cy="86.4" r="3.4" fill="#5C2A38"/><circle cx="70.2" cy="85.3" r="1.2" fill="#fff"/>
<path d="M55 92 q5 4 10 0" fill="none" stroke="#5C2A38" stroke-width="3" stroke-linecap="round"/>
<path d="M16 28 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="102" cy="34" r="2.2" fill="#FFC83D"/>`,

koifold: `<path d="M94 62 L114 44 L108 62 L114 80 z" fill="#E8845C" stroke="#C25A2E" stroke-width="2" stroke-linejoin="round"/>
<path d="M20 62 L58 32 L96 62 L58 92 z" fill="#F09148" stroke="#C25A2E" stroke-width="2" stroke-linejoin="round"/>
<path d="M20 62 L58 32 L58 92 z" fill="#FFB070"/>
<path d="M58 32 L58 92" stroke="#C25A2E" stroke-width="1.5" opacity=".5"/>
<path d="M58 32 L78 48 L58 62 z" fill="#FBF8F0" opacity=".9"/>
<circle cx="44" cy="58" r="7" fill="#fff" stroke="#C25A2E" stroke-width="1.5"/><circle cx="45.2" cy="59.4" r="3.6" fill="#3A2A20"/><circle cx="44.2" cy="58.3" r="1.2" fill="#fff"/>
<circle cx="64" cy="58" r="7" fill="#fff" stroke="#C25A2E" stroke-width="1.5"/><circle cx="65.2" cy="59.4" r="3.6" fill="#3A2A20"/><circle cx="64.2" cy="58.3" r="1.2" fill="#fff"/>
<ellipse cx="37" cy="67" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="71" cy="67" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M48 70 q6 5 12 0" fill="none" stroke="#3A2A20" stroke-width="3" stroke-linecap="round"/>
<path d="M10 104 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="24" cy="28" r="2.2" fill="#FFC83D"/><circle cx="98" cy="24" r="2.2" fill="#FFC83D"/>`,

kabuto: `<path d="M36 36 L16 10 L50 28 z" fill="#E8A21B" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M84 36 L104 10 L70 28 z" fill="#E8A21B" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M16 62 L60 20 L104 62 l-10 14 H26 z" fill="#C43D5A" stroke="#A32B46" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 20 L60 76" stroke="#A32B46" stroke-width="2" opacity=".6"/>
<path d="M36 44 L60 66 L84 44" fill="none" stroke="#E8A21B" stroke-width="3" stroke-linejoin="round"/>
<circle cx="60" cy="84" r="19" fill="#FFD9A8"/>
<circle cx="53" cy="82" r="6" fill="#fff"/><circle cx="54.1" cy="83.3" r="3.2" fill="#2B2B3E"/><circle cx="53.2" cy="82.2" r="1.1" fill="#fff"/>
<circle cx="67" cy="82" r="6" fill="#fff"/><circle cx="68.1" cy="83.3" r="3.2" fill="#2B2B3E"/><circle cx="67.2" cy="82.2" r="1.1" fill="#fff"/>
<ellipse cx="46" cy="90" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/><ellipse cx="74" cy="90" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/>
<path d="M55 93 q5 4 10 0" fill="none" stroke="#2B2B3E" stroke-width="3" stroke-linecap="round"/>
<circle cx="16" cy="84" r="2.2" fill="#FFC83D"/><circle cx="104" cy="84" r="2.2" fill="#FFC83D"/>`,

flutterfold: `<path d="M54 54 L14 24 L32 66 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M66 54 L106 24 L88 66 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 62 L24 94 L50 82 z" fill="#FFB070" stroke="#E8955C" stroke-width="2" stroke-linejoin="round"/>
<path d="M66 62 L96 94 L70 82 z" fill="#FFB070" stroke="#E8955C" stroke-width="2" stroke-linejoin="round"/>
<path d="M54 54 L32 44 M66 54 L88 44" stroke="#E07098" stroke-width="1.5" opacity=".6"/>
<path d="M50 38 q-6 -8 -4 -16 M70 38 q6 -8 4 -16" fill="none" stroke="#8A5B2E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M52 44 L60 34 L68 44 L64 96 L60 100 L56 96 z" fill="#F4EDDC" stroke="#D8D0BC" stroke-width="2" stroke-linejoin="round"/>
<circle cx="55" cy="50" r="4.5" fill="#fff" stroke="#D8D0BC" stroke-width="1.2"/><circle cx="55.8" cy="51" r="2.4" fill="#2B2B3E"/><circle cx="55.2" cy="50.2" r=".9" fill="#fff"/>
<circle cx="65" cy="50" r="4.5" fill="#fff" stroke="#D8D0BC" stroke-width="1.2"/><circle cx="65.8" cy="51" r="2.4" fill="#2B2B3E"/><circle cx="65.2" cy="50.2" r=".9" fill="#fff"/>
<path d="M56 58 q4 3 8 0" fill="none" stroke="#2B2B3E" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="18" cy="76" r="2.2" fill="#FFC83D"/><circle cx="104" cy="70" r="2.2" fill="#FFC83D"/>`,

goldencrane: `<defs><radialGradient id="ogc-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFB84D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#ogc-a)"/>
<path d="M34 70 L8 32 L52 56 z" fill="#F7C860" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M86 70 L112 32 L68 56 z" fill="#F7C860" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M52 56 L60 18 L68 56 z" fill="#F0B429" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M55 26 L60 6 L65 26 L60 20 z" fill="#E8845C"/>
<circle cx="60" cy="14" r="2.5" fill="#C43D5A"/>
<path d="M60 50 L86 74 L60 102 L34 74 z" fill="#FFD24D" stroke="#C8891B" stroke-width="2" stroke-linejoin="round"/>
<path d="M60 50 L60 102 M34 74 L86 74" stroke="#E8A21B" stroke-width="2" opacity=".7"/>
<circle cx="50" cy="70" r="7" fill="#fff" stroke="#C8891B" stroke-width="1.5"/><circle cx="51.2" cy="71.4" r="3.6" fill="#7A4A08"/><circle cx="50.2" cy="70.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="70" r="7" fill="#fff" stroke="#C8891B" stroke-width="1.5"/><circle cx="71.2" cy="71.4" r="3.6" fill="#7A4A08"/><circle cx="70.2" cy="70.3" r="1.2" fill="#fff"/>
<ellipse cx="44" cy="79" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/><ellipse cx="76" cy="79" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/>
<path d="M54 82 q6 5 12 0" fill="none" stroke="#7A4A08" stroke-width="3" stroke-linecap="round"/>
<path d="M16 40 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 84 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* ELEMENTS PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

pebble: `<defs><radialGradient id="elpb-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#C4BCA8"/><stop offset="1" stop-color="#8F8A78"/></radialGradient></defs>
<ellipse cx="60" cy="66" rx="32" ry="28" fill="url(#elpb-g)"/>
<path d="M40 44 q10 -8 24 -6 q10 2 14 8 q-12 -4 -24 -2 q-10 2 -14 0 z" fill="#D8D0BC" opacity=".7"/>
<path d="M74 40 q10 2 14 8 q2 4 -2 6 q-8 -8 -16 -10 z" fill="#7BC24E"/>
<circle cx="86" cy="50" r="3" fill="#5CA346"/>
<circle cx="48" cy="62" r="8" fill="#fff"/><circle cx="49.4" cy="63.5" r="4" fill="#3A362B"/><circle cx="48.3" cy="62.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="62" r="8" fill="#fff"/><circle cx="73.4" cy="63.5" r="4" fill="#3A362B"/><circle cx="72.3" cy="62.3" r="1.4" fill="#fff"/>
<ellipse cx="40" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/><ellipse cx="80" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/>
<path d="M53 76 q7 6 14 0" fill="none" stroke="#3A362B" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="24" cy="96" rx="7" ry="4.5" fill="#B8B29E"/><ellipse cx="98" cy="94" rx="5" ry="3.5" fill="#B8B29E"/>
<circle cx="20" cy="34" r="2.2" fill="#FFC83D"/>`,

breeze: `<path d="M18 44 q26 -20 52 -8 q20 10 12 26 q-6 12 -20 8 q-10 -3 -8 -12 q2 -7 9 -6" fill="none" stroke="#BFE2F0" stroke-width="9" stroke-linecap="round"/>
<path d="M14 68 q10 -2 18 4 M22 84 q12 -4 22 2" fill="none" stroke="#D5EDF7" stroke-width="6" stroke-linecap="round"/>
<circle cx="44" cy="58" r="24" fill="#EAF6FF"/>
<circle cx="26" cy="66" r="13" fill="#EAF6FF"/><circle cx="62" cy="68" r="14" fill="#EAF6FF"/>
<circle cx="36" cy="54" r="7.5" fill="#fff"/><circle cx="37.3" cy="55.5" r="3.8" fill="#2E5A70"/><circle cx="36.2" cy="54.3" r="1.3" fill="#fff"/>
<circle cx="54" cy="54" r="7.5" fill="#fff"/><circle cx="55.3" cy="55.5" r="3.8" fill="#2E5A70"/><circle cx="54.2" cy="54.3" r="1.3" fill="#fff"/>
<ellipse cx="29" cy="63" rx="4" ry="2.5" fill="#FF9EB8" opacity=".8"/><ellipse cx="61" cy="63" rx="4" ry="2.5" fill="#FF9EB8" opacity=".8"/>
<path d="M39 66 q6 5 12 0" fill="none" stroke="#2E5A70" stroke-width="3" stroke-linecap="round"/>
<path d="M88 78 q6 -3 8 -9 q4 5 0 11 q-5 5 -8 -2 z" fill="#7BC24E" transform="rotate(24 92 78)"/>
<path d="M100 34 q5 -2 6 -7 q3 4 0 9 q-4 4 -6 -2 z" fill="#7BC24E" transform="rotate(-18 103 34)"/>
<circle cx="106" cy="60" r="2.2" fill="#8ADAFF"/><circle cx="16" cy="24" r="2.2" fill="#8ADAFF"/>`,

droplet: `<defs><radialGradient id="eldr-g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#6EC8F5"/><stop offset="1" stop-color="#3AA0E0"/></radialGradient></defs>
<path d="M60 12 q27 32 27 55 a27 27 0 0 1 -54 0 q0 -23 27 -55 z" fill="url(#eldr-g)"/>
<path d="M45 54 q-6 14 2 24" fill="none" stroke="#A8E0FA" stroke-width="5" stroke-linecap="round" opacity=".85"/>
<circle cx="51" cy="62" r="8" fill="#fff"/><circle cx="52.4" cy="63.5" r="4" fill="#123A52"/><circle cx="51.3" cy="62.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="62" r="8" fill="#fff"/><circle cx="72.4" cy="63.5" r="4" fill="#123A52"/><circle cx="71.3" cy="62.3" r="1.4" fill="#fff"/>
<ellipse cx="44" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/><ellipse cx="78" cy="72" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/>
<path d="M52 76 q8 7 16 0" fill="none" stroke="#123A52" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="24" cy="40" r="3" fill="#8ADAFF"/><circle cx="98" cy="34" r="2.2" fill="#8ADAFF"/><circle cx="102" cy="88" r="2.5" fill="#8ADAFF"/>`,

ember: `<path d="M60 10 q22 24 15 46 q9 -5 10 -14 q11 27 -7 45 a29 22 0 0 1 -36 0 q-18 -18 -7 -45 q1 9 10 14 q-7 -22 15 -46 z" fill="#FF8A3C"/>
<path d="M60 42 q13 15 9 28 a15 13 0 0 1 -18 0 q-4 -13 9 -28 z" fill="#FFC23D"/>
<circle cx="51" cy="66" r="7.5" fill="#fff"/><circle cx="52.3" cy="67.5" r="3.8" fill="#7A2A08"/><circle cx="51.2" cy="66.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="66" r="7.5" fill="#fff"/><circle cx="70.3" cy="67.5" r="3.8" fill="#7A2A08"/><circle cx="69.2" cy="66.3" r="1.3" fill="#fff"/>
<ellipse cx="44" cy="76" rx="4.2" ry="2.6" fill="#FFC0A8" opacity=".9"/><ellipse cx="76" cy="76" rx="4.2" ry="2.6" fill="#FFC0A8" opacity=".9"/>
<path d="M53 80 q7 6 14 0" fill="none" stroke="#7A2A08" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="22" cy="80" r="2.5" fill="#FF8A3C"/><circle cx="100" cy="72" r="2" fill="#FFC23D"/><circle cx="94" cy="24" r="2.2" fill="#FFC23D"/>`,

leafy: `<defs><radialGradient id="ellf-g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#8FD068"/><stop offset="1" stop-color="#5CA346"/></radialGradient></defs>
<path d="M60 14 q32 18 27 54 q-4 26 -27 34 q-23 -8 -27 -34 q-5 -36 27 -54 z" fill="url(#ellf-g)"/>
<path d="M60 22 v76" stroke="#4A8636" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<path d="M60 42 q-10 2 -16 10 M60 60 q10 2 16 10 M60 78 q-8 2 -12 8" fill="none" stroke="#4A8636" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
<path d="M60 102 q-2 8 -8 12" fill="none" stroke="#8A6844" stroke-width="4" stroke-linecap="round"/>
<circle cx="49" cy="56" r="8" fill="#fff"/><circle cx="50.4" cy="57.5" r="4" fill="#28481C"/><circle cx="49.3" cy="56.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="56" r="8" fill="#fff"/><circle cx="72.4" cy="57.5" r="4" fill="#28481C"/><circle cx="71.3" cy="56.3" r="1.4" fill="#fff"/>
<ellipse cx="42" cy="66" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/><ellipse cx="78" cy="66" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".8"/>
<path d="M52 70 q8 7 16 0" fill="none" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="34" r="2.2" fill="#FFC83D"/><circle cx="102" cy="90" r="2.2" fill="#FFC83D"/>`,

cloudy: `<circle cx="40" cy="64" r="19" fill="#F4F8FC"/><circle cx="62" cy="52" r="24" fill="#F4F8FC"/><circle cx="84" cy="64" r="18" fill="#F4F8FC"/>
<path d="M22 66 h76 q2 14 -14 16 h-48 q-16 -2 -14 -16 z" fill="#F4F8FC"/>
<path d="M30 76 q30 8 60 0" fill="none" stroke="#D8E4F0" stroke-width="3" stroke-linecap="round" opacity=".8"/>
<circle cx="50" cy="58" r="8" fill="#fff" stroke="#D8E4F0" stroke-width="1.5"/><circle cx="51.4" cy="59.5" r="4" fill="#4A5568"/><circle cx="50.3" cy="58.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="58" r="8" fill="#fff" stroke="#D8E4F0" stroke-width="1.5"/><circle cx="73.4" cy="59.5" r="4" fill="#4A5568"/><circle cx="72.3" cy="58.3" r="1.4" fill="#fff"/>
<ellipse cx="42" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="80" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M54 71 q6 5 12 0" fill="none" stroke="#4A5568" stroke-width="3.5" stroke-linecap="round"/>
<path d="M96 30 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="20" cy="98" r="2.2" fill="#8ADAFF"/><circle cx="100" cy="96" r="2.2" fill="#8ADAFF"/>`,

wave: `<path d="M14 96 q0 -50 42 -50 q34 0 42 26 q3 12 -8 14 q6 -16 -12 -21 q-20 -5 -25 13 l-5 18 z" fill="#3AA0E0"/>
<path d="M22 88 q2 -34 34 -34" fill="none" stroke="#7FC8F0" stroke-width="5" stroke-linecap="round" opacity=".7"/>
<circle cx="92" cy="84" r="7" fill="#EAF6FF"/><circle cx="101" cy="76" r="5" fill="#EAF6FF"/><circle cx="106" cy="66" r="3.5" fill="#EAF6FF"/>
<circle cx="42" cy="72" r="8" fill="#fff"/><circle cx="43.4" cy="73.5" r="4" fill="#123A52"/><circle cx="42.3" cy="72.3" r="1.4" fill="#fff"/>
<circle cx="62" cy="72" r="8" fill="#fff"/><circle cx="63.4" cy="73.5" r="4" fill="#123A52"/><circle cx="62.3" cy="72.3" r="1.4" fill="#fff"/>
<ellipse cx="35" cy="82" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".75"/><ellipse cx="69" cy="82" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".75"/>
<path d="M46 85 q6 5 12 0" fill="none" stroke="#123A52" stroke-width="3.5" stroke-linecap="round"/>
<path d="M8 104 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="20" cy="30" r="2.2" fill="#8ADAFF"/><circle cx="82" cy="38" r="2.5" fill="#8ADAFF"/>`,

boulder: `<defs><radialGradient id="elbd-g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#B0A490"/><stop offset="1" stop-color="#7C7260"/></radialGradient></defs>
<path d="M30 32 L76 24 L100 50 L94 92 H34 L18 60 z" fill="url(#elbd-g)" stroke="#5E5648" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M76 24 L72 44 L100 50" fill="none" stroke="#5E5648" stroke-width="2" opacity=".5"/>
<path d="M30 84 l10 -8 M88 82 l-8 -9" stroke="#5E5648" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
<path d="M26 40 q8 -4 16 -2 q-2 6 -10 8 z" fill="#7BC24E"/>
<circle cx="47" cy="58" r="8" fill="#fff"/><circle cx="48.4" cy="59.5" r="4" fill="#3A362B"/><circle cx="47.3" cy="58.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="58" r="8" fill="#fff"/><circle cx="72.4" cy="59.5" r="4" fill="#3A362B"/><circle cx="71.3" cy="58.3" r="1.4" fill="#fff"/>
<path d="M40 50 l10 3 M78 50 l-10 3" stroke="#3A362B" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="40" cy="68" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".7"/><ellipse cx="78" cy="68" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".7"/>
<path d="M52 72 q7 6 15 0" fill="none" stroke="#3A362B" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="18" cy="98" rx="6" ry="4" fill="#9C917E"/><ellipse cx="104" cy="98" rx="7" ry="4.5" fill="#9C917E"/>`,

zappy: `<defs><radialGradient id="elzp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#F0B429"/></radialGradient></defs>
<path d="M60 18 l-6 12 h8 l-7 12 M96 40 l-12 5 l6 5 l-13 6 M24 40 l12 5 l-6 5 l13 6 M60 102 l6 -12 h-8 l7 -12 M100 88 l-11 -7 l4 -6 M20 88 l11 -7 l-4 -6" fill="none" stroke="#FFC23D" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="60" cy="60" r="26" fill="url(#elzp-g)"/>
<path d="M42 44 q8 -8 18 -8" fill="none" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<circle cx="51" cy="56" r="8" fill="#fff"/><circle cx="52.4" cy="57.5" r="4" fill="#7A4A08"/><circle cx="51.3" cy="56.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="56" r="8" fill="#fff"/><circle cx="72.4" cy="57.5" r="4" fill="#7A4A08"/><circle cx="71.3" cy="56.3" r="1.4" fill="#fff"/>
<ellipse cx="44" cy="66" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="76" cy="66" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M52 69 q8 8 16 0 q-8 3 -16 0 z" fill="#7A4A08"/>
<circle cx="18" cy="20" r="2.2" fill="#FFC83D"/><circle cx="102" cy="104" r="2.2" fill="#FFC83D"/>`,

elemental: `<defs><radialGradient id="elem-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#8ADAFF" stop-opacity=".4"/><stop offset="1" stop-color="#8ADAFF" stop-opacity="0"/></radialGradient><radialGradient id="elem-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F8FBFF"/><stop offset="1" stop-color="#CADCF0"/></radialGradient></defs>
<circle cx="60" cy="60" r="52" fill="url(#elem-a)"/>
<circle cx="60" cy="60" r="38" fill="none" stroke="#8ABEE0" stroke-width="2" stroke-dasharray="4 7"/>
<path d="M60 10 q7 8 5 15 q3 -2 3 -5 q4 9 -2 15 a9 7 0 0 1 -12 0 q-6 -6 -2 -15 q0 3 3 5 q-2 -7 5 -15 z" fill="#FF8A3C"/>
<path d="M110 60 q0 -12 -12 -12 q-12 0 -12 12 a12 12 0 0 0 24 0 z" fill="#3AA0E0" transform="rotate(-90 98 60)"/>
<path d="M60 88 q14 8 12 22 q-12 2 -18 -8 q-4 -8 6 -14 z" fill="#5CA346"/>
<path d="M10 52 q10 -6 18 0 q6 5 2 10 q-3 4 -8 2 q8 2 12 -2 M14 66 q8 -4 14 0" fill="none" stroke="#BFE2F0" stroke-width="4" stroke-linecap="round"/>
<circle cx="60" cy="60" r="23" fill="url(#elem-g)"/>
<circle cx="52" cy="56" r="7.5" fill="#fff"/><circle cx="53.3" cy="57.5" r="3.8" fill="#2E5A70"/><circle cx="52.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="56" r="7.5" fill="#fff"/><circle cx="71.3" cy="57.5" r="3.8" fill="#2E5A70"/><circle cx="70.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="46" cy="65" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="65" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/>
<path d="M53 68 q7 6 14 0" fill="none" stroke="#2E5A70" stroke-width="3.5" stroke-linecap="round"/>
<path d="M20 24 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M98 96 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`

});

/* CRITTER CREW */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

froggy: `<defs><radialGradient id="crfr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#8FD068"/><stop offset="1" stop-color="#6CB454"/></radialGradient></defs>
<circle cx="42" cy="38" r="13" fill="#6CB454"/><circle cx="78" cy="38" r="13" fill="#6CB454"/>
<ellipse cx="60" cy="66" rx="33" ry="27" fill="url(#crfr-g)"/>
<circle cx="42" cy="38" r="8.5" fill="#fff"/><circle cx="43.5" cy="39.5" r="4.2" fill="#28481C"/><circle cx="42.3" cy="38.3" r="1.5" fill="#fff"/>
<circle cx="78" cy="38" r="8.5" fill="#fff"/><circle cx="79.5" cy="39.5" r="4.2" fill="#28481C"/><circle cx="78.3" cy="38.3" r="1.5" fill="#fff"/>
<ellipse cx="60" cy="80" rx="20" ry="10" fill="#C4E5A6" opacity=".8"/>
<ellipse cx="36" cy="64" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="84" cy="64" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/>
<path d="M46 64 q14 12 28 0" fill="none" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M92 20 l1.8 3.4 3.8 .6 -2.8 2.7 .7 3.8 -3.5 -1.8 -3.5 1.8 .7 -3.8 -2.8 -2.7 3.8 -.6 z" fill="#FFC83D"/>
<circle cx="22" cy="26" r="2.2" fill="#FFC83D"/>`,

corg: `<defs><radialGradient id="crcg-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F0A874"/><stop offset="1" stop-color="#E8955C"/></radialGradient></defs>
<path d="M28 44 L34 12 L56 34 z" fill="#E8955C"/><path d="M33 36 L36 20 L47 31 z" fill="#FFB3C8"/>
<path d="M92 44 L86 12 L64 34 z" fill="#E8955C"/><path d="M87 36 L84 20 L73 31 z" fill="#FFB3C8"/>
<circle cx="60" cy="62" r="29" fill="url(#crcg-g)"/>
<path d="M60 34 q7 16 0 30 q-7 -14 0 -30 z" fill="#FBF7F0"/>
<ellipse cx="60" cy="76" rx="15" ry="11" fill="#FBF7F0"/>
<circle cx="46" cy="58" r="7.5" fill="#fff"/><circle cx="47.3" cy="59.5" r="3.8" fill="#3A2A20"/><circle cx="46.2" cy="58.3" r="1.3" fill="#fff"/>
<circle cx="74" cy="58" r="7.5" fill="#fff"/><circle cx="75.3" cy="59.5" r="3.8" fill="#3A2A20"/><circle cx="74.2" cy="58.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="72" rx="4.5" ry="3.5" fill="#3A2A20"/>
<path d="M54 79 q6 5 12 0" fill="none" stroke="#3A2A20" stroke-width="3" stroke-linecap="round"/>
<path d="M58 82 q2 6 8 6 q-2 4 -6 3 q-3 -1 -2 -9 z" fill="#FF8AA8"/>
<ellipse cx="38" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/><ellipse cx="82" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".9"/>
<circle cx="18" cy="88" r="2.2" fill="#FFC83D"/><circle cx="102" cy="86" r="2.2" fill="#FFC83D"/>`,

sharky: `<defs><radialGradient id="crsh-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A3BCDE"/><stop offset="1" stop-color="#7C9AC4"/></radialGradient></defs>
<path d="M50 22 L60 2 L70 24 z" fill="#6788B4"/>
<circle cx="60" cy="60" r="30" fill="url(#crsh-g)"/>
<path d="M32 72 q28 20 56 0 q-6 18 -28 18 q-22 0 -28 -18 z" fill="#EAF0FA"/>
<path d="M24 56 q4 2 4 8 M28 50 q4 2 4 8 M96 56 q-4 2 -4 8 M92 50 q-4 2 -4 8" fill="none" stroke="#5C7CA8" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="47" cy="54" r="8" fill="#fff"/><circle cx="48.4" cy="55.5" r="4" fill="#1E2A48"/><circle cx="47.3" cy="54.3" r="1.4" fill="#fff"/>
<circle cx="73" cy="54" r="8" fill="#fff"/><circle cx="74.4" cy="55.5" r="4" fill="#1E2A48"/><circle cx="73.3" cy="54.3" r="1.4" fill="#fff"/>
<ellipse cx="38" cy="64" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".75"/><ellipse cx="82" cy="64" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".75"/>
<path d="M48 70 q12 10 24 0" fill="none" stroke="#1E2A48" stroke-width="3.5" stroke-linecap="round"/>
<path d="M52 72 l3 5.5 l3.6 -4.5 z" fill="#fff"/><path d="M68 72 l-3 5.5 l-3.6 -4.5 z" fill="#fff"/>
<path d="M10 100 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="100" cy="30" r="2.5" fill="none" stroke="#8ADAFF" stroke-width="2"/>`,

slowmo: `<defs><radialGradient id="crsl-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#C4B49A"/><stop offset="1" stop-color="#A8987E"/></radialGradient></defs>
<circle cx="60" cy="60" r="29" fill="url(#crsl-g)"/>
<ellipse cx="60" cy="64" rx="21" ry="17" fill="#E8DCC4"/>
<ellipse cx="46" cy="56" rx="8" ry="6" fill="#8A6E4E" transform="rotate(-18 46 56)"/>
<ellipse cx="74" cy="56" rx="8" ry="6" fill="#8A6E4E" transform="rotate(18 74 56)"/>
<path d="M42 56 a5 5 0 0 1 10 0" fill="none" stroke="#2B2015" stroke-width="3" stroke-linecap="round"/>
<path d="M68 56 a5 5 0 0 1 10 0" fill="none" stroke="#2B2015" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="60" cy="66" rx="3.5" ry="2.5" fill="#5C4630"/>
<path d="M52 73 q8 6 16 0" fill="none" stroke="#5C4630" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="40" cy="66" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/><ellipse cx="80" cy="66" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/>
<path d="M90 24 q6 -2 8 -8 M98 32 q5 -1 7 -5" stroke="#B8D49A" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M84 30 q4 -3 6 -7 q3 4 1 8 q-3 4 -7 -1 z" fill="#7BC24E"/>
<circle cx="20" cy="90" r="2.2" fill="#FFC83D"/><circle cx="100" cy="92" r="2.2" fill="#FFC83D"/>`,

narly: `<defs><radialGradient id="crnw-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A8C4EC"/><stop offset="1" stop-color="#7C9CCC"/></radialGradient></defs>
<path d="M56 32 L60 4 L68 32 q-6 4 -12 0 z" fill="#F0E0C0" stroke="#D8C29A" stroke-width="2" stroke-linejoin="round"/>
<path d="M58 24 l8 -5 M57 16 l7 -4" stroke="#D8C29A" stroke-width="2" stroke-linecap="round"/>
<circle cx="60" cy="62" r="29" fill="url(#crnw-g)"/>
<ellipse cx="60" cy="78" rx="17" ry="10" fill="#E2ECFA" opacity=".9"/>
<circle cx="47" cy="58" r="8" fill="#fff"/><circle cx="48.4" cy="59.5" r="4" fill="#1E2A48"/><circle cx="47.3" cy="58.3" r="1.4" fill="#fff"/>
<circle cx="73" cy="58" r="8" fill="#fff"/><circle cx="74.4" cy="59.5" r="4" fill="#1E2A48"/><circle cx="73.3" cy="58.3" r="1.4" fill="#fff"/>
<ellipse cx="39" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/><ellipse cx="81" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".85"/>
<path d="M53 72 q7 6 14 0" fill="none" stroke="#1E2A48" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="98" cy="42" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="106" cy="32" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<path d="M10 102 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>`,

redpanda: `<defs><radialGradient id="crrp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#D06E3E"/><stop offset="1" stop-color="#C25A2E"/></radialGradient></defs>
<circle cx="38" cy="28" r="11" fill="#C25A2E"/><circle cx="38" cy="28" r="5" fill="#FBF7F0"/>
<circle cx="82" cy="28" r="11" fill="#C25A2E"/><circle cx="82" cy="28" r="5" fill="#FBF7F0"/>
<circle cx="60" cy="60" r="29" fill="url(#crrp-g)"/>
<ellipse cx="44" cy="48" rx="8" ry="5.5" fill="#FBF7F0" transform="rotate(-14 44 48)"/>
<ellipse cx="76" cy="48" rx="8" ry="5.5" fill="#FBF7F0" transform="rotate(14 76 48)"/>
<ellipse cx="60" cy="72" rx="14" ry="11" fill="#FBF7F0"/>
<path d="M30 66 q-4 6 -2 12 M90 66 q4 6 2 12" stroke="#8A3E1E" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="46" cy="57" r="7.5" fill="#fff"/><circle cx="47.3" cy="58.5" r="3.8" fill="#3A2015"/><circle cx="46.2" cy="57.3" r="1.3" fill="#fff"/>
<circle cx="74" cy="57" r="7.5" fill="#fff"/><circle cx="75.3" cy="58.5" r="3.8" fill="#3A2015"/><circle cx="74.2" cy="57.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="68" rx="4" ry="3" fill="#3A2015"/>
<path d="M54 75 q3 4 6 0 q3 4 6 0" fill="none" stroke="#3A2015" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="38" cy="66" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/><ellipse cx="82" cy="66" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/>
<circle cx="20" cy="88" r="2.2" fill="#FFC83D"/><circle cx="100" cy="90" r="2.2" fill="#FFC83D"/>`,

capy: `<defs><radialGradient id="crcp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#CEB584"/><stop offset="1" stop-color="#B49A6A"/></radialGradient></defs>
<circle cx="38" cy="38" r="8" fill="#A88C5E"/><circle cx="82" cy="38" r="8" fill="#A88C5E"/>
<ellipse cx="60" cy="62" rx="31" ry="27" fill="url(#crcp-g)"/>
<circle cx="86" cy="30" r="9" fill="#F0A82A"/><path d="M86 21 q3 -4 7 -4 q0 4 -4 6 z" fill="#5CA346"/>
<ellipse cx="60" cy="76" rx="17" ry="11" fill="#D8C29A"/>
<ellipse cx="54" cy="73" rx="2.2" ry="3" fill="#5C4630"/><ellipse cx="66" cy="73" rx="2.2" ry="3" fill="#5C4630"/>
<circle cx="46" cy="56" r="4.5" fill="#3A2A15"/><circle cx="44.8" cy="54.8" r="1.4" fill="#fff"/>
<circle cx="74" cy="56" r="4.5" fill="#3A2A15"/><circle cx="72.8" cy="54.8" r="1.4" fill="#fff"/>
<path d="M55 84 h10" stroke="#5C4630" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="37" cy="64" rx="4" ry="2.5" fill="#FF9EB8" opacity=".6"/><ellipse cx="83" cy="64" rx="4" ry="2.5" fill="#FF9EB8" opacity=".6"/>
<circle cx="18" cy="90" r="2.2" fill="#FFC83D"/><circle cx="102" cy="72" r="2.2" fill="#FFC83D"/>`,

axo: `<defs><radialGradient id="crax-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD0DC"/><stop offset="1" stop-color="#FFB4C6"/></radialGradient></defs>
<path d="M30 40 q-10 -4 -14 -12 M26 54 q-12 0 -18 -6 M28 68 q-10 4 -16 12" stroke="#FF7FA8" stroke-width="5" stroke-linecap="round" fill="none"/>
<circle cx="15" cy="27" r="4" fill="#FF7FA8"/><circle cx="7" cy="47" r="4" fill="#FF7FA8"/><circle cx="11" cy="81" r="4" fill="#FF7FA8"/>
<path d="M90 40 q10 -4 14 -12 M94 54 q12 0 18 -6 M92 68 q10 4 16 12" stroke="#FF7FA8" stroke-width="5" stroke-linecap="round" fill="none"/>
<circle cx="105" cy="27" r="4" fill="#FF7FA8"/><circle cx="113" cy="47" r="4" fill="#FF7FA8"/><circle cx="109" cy="81" r="4" fill="#FF7FA8"/>
<circle cx="60" cy="58" r="30" fill="url(#crax-g)"/>
<circle cx="47" cy="54" r="8" fill="#fff"/><circle cx="48.4" cy="55.5" r="4" fill="#5C2A38"/><circle cx="47.3" cy="54.3" r="1.4" fill="#fff"/>
<circle cx="73" cy="54" r="8" fill="#fff"/><circle cx="74.4" cy="55.5" r="4" fill="#5C2A38"/><circle cx="73.3" cy="54.3" r="1.4" fill="#fff"/>
<ellipse cx="39" cy="64" rx="5" ry="3" fill="#FF7FA8" opacity=".95"/><ellipse cx="81" cy="64" rx="5" ry="3" fill="#FF7FA8" opacity=".95"/>
<path d="M48 68 q12 10 24 0" fill="none" stroke="#5C2A38" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="96" cy="98" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="22" cy="100" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>`,

rexy: `<defs><radialGradient id="crrx-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#8FD068"/><stop offset="1" stop-color="#5CA346"/></radialGradient></defs>
<rect x="28" y="26" width="64" height="56" rx="22" fill="url(#crrx-g)"/>
<path d="M30 60 h60 v3 q0 17 -30 17 q-30 0 -30 -17 z" fill="#B8E098"/>
<circle cx="50" cy="67" r="1.8" fill="#28481C"/><circle cx="70" cy="67" r="1.8" fill="#28481C"/>
<path d="M36 40 l12 4 M84 40 l-12 4" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="45" cy="51" r="8" fill="#fff"/><circle cx="46.4" cy="52.2" r="4" fill="#28481C"/><circle cx="45.3" cy="51.2" r="1.4" fill="#fff"/>
<circle cx="75" cy="51" r="8" fill="#fff"/><circle cx="76.4" cy="52.2" r="4" fill="#28481C"/><circle cx="75.3" cy="51.2" r="1.4" fill="#fff"/>
<path d="M42 74 q18 11 36 0" fill="none" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M48 76.5 l3 6 l4 -5 z" fill="#fff"/><path d="M72 76.5 l-3 6 l-4 -5 z" fill="#fff"/>
<path d="M42 88 q-7 3 -8 9 M78 88 q7 3 8 9" fill="none" stroke="#4F9139" stroke-width="6" stroke-linecap="round"/>
<ellipse cx="36" cy="59" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/><ellipse cx="84" cy="59" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/>
<circle cx="18" cy="30" r="2.2" fill="#FFC83D"/><circle cx="102" cy="94" r="2.2" fill="#FFC83D"/>`,

uni: `<defs><radialGradient id="cruni-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFC0E0" stop-opacity=".5"/><stop offset="1" stop-color="#FFC0E0" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#cruni-a)"/>
<path d="M54 32 L60 4 L68 32 q-7 4 -14 0 z" fill="#F0C040" stroke="#D8A21B" stroke-width="2" stroke-linejoin="round"/>
<path d="M57 22 l8 -5 M56 14 l7 -4" stroke="#D8A21B" stroke-width="2" stroke-linecap="round"/>
<path d="M32 38 L26 16 L46 30 z" fill="#FBF7F0"/><path d="M34 33 l-3 -9 l8 6 z" fill="#FFB3C8"/>
<path d="M88 38 L94 16 L74 30 z" fill="#FBF7F0"/><path d="M86 33 l3 -9 l-8 6 z" fill="#FFB3C8"/>
<circle cx="60" cy="62" r="28" fill="#FBF7F0"/>
<path d="M34 50 q-8 12 -4 26 M40 42 q-10 14 -8 32" fill="none" stroke="#FF9EC4" stroke-width="5" stroke-linecap="round"/>
<path d="M30 58 q-6 10 -4 20" fill="none" stroke="#8A5CE8" stroke-width="4" stroke-linecap="round"/>
<path d="M26 50 q-5 8 -5 16" fill="none" stroke="#36D1FF" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="52" cy="58" r="7.5" fill="#fff" stroke="#E8DCC8" stroke-width="1.5"/><circle cx="53.3" cy="59.5" r="3.8" fill="#5C4A78"/><circle cx="52.2" cy="58.3" r="1.3" fill="#fff"/><circle cx="54.5" cy="61" r=".9" fill="#fff"/>
<circle cx="74" cy="58" r="7.5" fill="#fff" stroke="#E8DCC8" stroke-width="1.5"/><circle cx="75.3" cy="59.5" r="3.8" fill="#5C4A78"/><circle cx="74.2" cy="58.3" r="1.3" fill="#fff"/><circle cx="76.5" cy="61" r=".9" fill="#fff"/>
<ellipse cx="44" cy="68" rx="4.5" ry="2.8" fill="#FFB3C8" opacity=".95"/><ellipse cx="80" cy="68" rx="4.5" ry="2.8" fill="#FFB3C8" opacity=".95"/>
<path d="M54 72 q6 6 13 0" fill="none" stroke="#5C4A78" stroke-width="3.5" stroke-linecap="round"/>
<path d="M16 36 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 80 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* DINO PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

trice: `<defs><radialGradient id="dtr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#53C6BC"/><stop offset="1" stop-color="#379E94"/></radialGradient></defs>
<path d="M94 79 q14 -2 18 -13" fill="none" stroke="#379E94" stroke-width="9" stroke-linecap="round"/>
<ellipse cx="72" cy="81" rx="26" ry="16" fill="#379E94"/>
<rect x="58" y="89" width="11" height="13" rx="5.5" fill="#2E8880"/><rect x="80" y="87" width="11" height="13" rx="5.5" fill="#2E8880"/>
<ellipse cx="74" cy="88" rx="15" ry="7" fill="#C4EAE2" opacity=".75"/>
<circle cx="86" cy="71" r="2.6" fill="#2E8880" opacity=".8"/><circle cx="66" cy="67" r="2.2" fill="#2E8880" opacity=".8"/>
<circle cx="44" cy="42" r="29" fill="#E8845C"/>
<circle cx="18" cy="34" r="7" fill="#E8845C"/><circle cx="26" cy="20" r="7" fill="#E8845C"/><circle cx="44" cy="13" r="7" fill="#E8845C"/><circle cx="62" cy="20" r="7" fill="#E8845C"/><circle cx="70" cy="34" r="7" fill="#E8845C"/>
<circle cx="44" cy="42" r="23" fill="none" stroke="#C25A2E" stroke-width="2.5" opacity=".4"/>
<path d="M30 30 q-3 -12 4 -16 q5 8 3 16 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2"/>
<path d="M58 30 q3 -12 -4 -16 q-5 8 -3 16 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2"/>
<circle cx="44" cy="46" r="22" fill="url(#dtr-g)"/>
<circle cx="36" cy="43" r="7.5" fill="#fff"/><circle cx="37.3" cy="44.7" r="3.8" fill="#173A36"/><circle cx="36.2" cy="43.3" r="1.3" fill="#fff"/>
<circle cx="52" cy="43" r="7.5" fill="#fff"/><circle cx="53.3" cy="44.7" r="3.8" fill="#173A36"/><circle cx="52.2" cy="43.3" r="1.3" fill="#fff"/>
<ellipse cx="28" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/><ellipse cx="60" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/>
<path d="M38 56 q6 5 12 0" fill="none" stroke="#173A36" stroke-width="3.5" stroke-linecap="round"/>`,

stego: `<defs><radialGradient id="dsg-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#86CA69"/><stop offset="1" stop-color="#63AB4B"/></radialGradient></defs>
<path d="M96 77 q12 -4 16 -16" fill="none" stroke="#63AB4B" stroke-width="8" stroke-linecap="round"/>
<path d="M104 59 l4.5 -9 l4.5 9 z" fill="#FFF3D6" stroke="#D8C8A8" stroke-width="1.6" transform="rotate(26 108 55)"/>
<path d="M52 71 l7 -15 l7 14 z" fill="#F0A82A" stroke="#C8791B" stroke-width="2" stroke-linejoin="round"/>
<path d="M66 65 l8 -17 l8 16 z" fill="#F0A82A" stroke="#C8791B" stroke-width="2" stroke-linejoin="round"/>
<path d="M82 71 l7 -13 l7 13 z" fill="#F0A82A" stroke="#C8791B" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="72" cy="81" rx="26" ry="16" fill="#63AB4B"/>
<rect x="58" y="89" width="11" height="13" rx="5.5" fill="#4F9139"/><rect x="80" y="87" width="11" height="13" rx="5.5" fill="#4F9139"/>
<ellipse cx="74" cy="88" rx="15" ry="7" fill="#C4E5A6" opacity=".7"/>
<circle cx="66" cy="71" r="2.6" fill="#4A8636" opacity=".6"/><circle cx="86" cy="69" r="2.2" fill="#4A8636" opacity=".6"/>
<path d="M37 26 l7 -13 l7 12 z" fill="#F0A82A" stroke="#C8791B" stroke-width="2" stroke-linejoin="round"/>
<circle cx="44" cy="46" r="22" fill="url(#dsg-g)"/>
<circle cx="36" cy="43" r="7.5" fill="#fff"/><circle cx="37.3" cy="44.7" r="3.8" fill="#28481C"/><circle cx="36.2" cy="43.3" r="1.3" fill="#fff"/>
<circle cx="52" cy="43" r="7.5" fill="#fff"/><circle cx="53.3" cy="44.7" r="3.8" fill="#28481C"/><circle cx="52.2" cy="43.3" r="1.3" fill="#fff"/>
<ellipse cx="28" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/><ellipse cx="60" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/>
<path d="M38 56 q6 5 12 0" fill="none" stroke="#28481C" stroke-width="3.5" stroke-linecap="round"/>`,

raptor: `<defs><radialGradient id="drp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F09148"/><stop offset="1" stop-color="#DD7A2C"/></radialGradient></defs>
<path d="M94 77 q16 -2 20 -16" fill="none" stroke="#DD7A2C" stroke-width="9" stroke-linecap="round"/>
<path d="M102 73 l3 -6 M109 69 l3 -6" stroke="#B85C1E" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="70" cy="81" rx="25" ry="15" fill="#DD7A2C"/>
<rect x="56" y="89" width="11" height="13" rx="5.5" fill="#C8651E"/><rect x="78" y="87" width="11" height="13" rx="5.5" fill="#C8651E"/>
<path d="M60 101 l-3 4.5 l6 0 z" fill="#FFF3D6"/>
<ellipse cx="72" cy="88" rx="14" ry="6.5" fill="#FFE0B8" opacity=".9"/>
<path d="M36 27 q-4 -9 -10 -12 M44 24 q-1 -10 -5 -14 M52 26 q2 -9 8 -13" fill="none" stroke="#B85C1E" stroke-width="4" stroke-linecap="round"/>
<circle cx="44" cy="46" r="22" fill="url(#drp-g)"/>
<ellipse cx="44" cy="58" rx="13" ry="8" fill="#FFE0B8"/>
<circle cx="36" cy="43" r="7.5" fill="#fff"/><path d="M28.5 42 a7.5 7.5 0 0 1 15 0 z" fill="#DD7A2C"/><circle cx="37.3" cy="44.7" r="3.8" fill="#3A1E10"/><circle cx="36.2" cy="43.5" r="1.2" fill="#fff"/>
<circle cx="52" cy="43" r="7.5" fill="#fff"/><path d="M44.5 42 a7.5 7.5 0 0 1 15 0 z" fill="#DD7A2C"/><circle cx="53.3" cy="44.7" r="3.8" fill="#3A1E10"/><circle cx="52.2" cy="43.5" r="1.2" fill="#fff"/>
<ellipse cx="27" cy="53" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/><ellipse cx="61" cy="53" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/>
<path d="M36 56 q8 7 16 0" fill="none" stroke="#5A2A10" stroke-width="3.5" stroke-linecap="round"/>
<path d="M39 57.5 l2.2 4 l3 -3.4 z" fill="#fff"/><path d="M49 57.5 l-2.2 4 l-3 -3.4 z" fill="#fff"/>`,

ptero: `<defs><radialGradient id="dpt-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A6BFE2"/><stop offset="1" stop-color="#8AA6CE"/></radialGradient></defs>
<path d="M34 70 L6 42 q2 26 24 38 z" fill="#7A9BC8"/>
<path d="M86 70 L114 42 q-2 26 -24 38 z" fill="#7A9BC8"/>
<path d="M12 48 q10 13 19 19" fill="none" stroke="#6788B4" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
<path d="M108 48 q-10 13 -19 19" fill="none" stroke="#6788B4" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
<path d="M68 38 q16 -12 20 -25 q-17 3 -26 14 z" fill="#7A9BC8"/>
<ellipse cx="60" cy="66" rx="28" ry="27" fill="url(#dpt-g)"/>
<ellipse cx="60" cy="86" rx="14" ry="8" fill="#E8F0FA" opacity=".9"/>
<circle cx="47" cy="60" r="9" fill="#fff"/><circle cx="48.5" cy="62" r="4.5" fill="#1E2A48"/><circle cx="47.3" cy="60.5" r="1.6" fill="#fff"/>
<circle cx="73" cy="60" r="9" fill="#fff"/><circle cx="74.5" cy="62" r="4.5" fill="#1E2A48"/><circle cx="73.3" cy="60.5" r="1.6" fill="#fff"/>
<ellipse cx="37" cy="72" rx="5" ry="3.2" fill="#FF9E8A" opacity=".8"/><ellipse cx="83" cy="72" rx="5" ry="3.2" fill="#FF9E8A" opacity=".8"/>
<path d="M52 74 l8 11 l8 -11 z" fill="#F0C060" stroke="#C89030" stroke-width="2" stroke-linejoin="round"/>
<g opacity=".9"><circle cx="20" cy="98" r="5" fill="#fff"/><circle cx="28" cy="100" r="7" fill="#fff"/><circle cx="36" cy="98" r="4.5" fill="#fff"/></g>`,

bronto: `<defs><radialGradient id="dbr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#AACF7D"/><stop offset="1" stop-color="#8FB95F"/></radialGradient></defs>
<g opacity=".95"><circle cx="96" cy="26" r="5.5" fill="#fff"/><circle cx="105" cy="29" r="6.5" fill="#fff"/><circle cx="96" cy="31" r="4.5" fill="#fff"/></g>
<path d="M96 92 q14 -4 18 -14" fill="none" stroke="#8FB95F" stroke-width="8" stroke-linecap="round"/>
<ellipse cx="64" cy="98" rx="34" ry="17" fill="#8FB95F"/>
<path d="M46 100 q-8 -50 10 -74" fill="none" stroke="#8FB95F" stroke-width="24" stroke-linecap="round"/>
<ellipse cx="58" cy="24" rx="17" ry="14" fill="url(#dbr-g)"/>
<circle cx="42" cy="62" r="3.2" fill="#78A24C" opacity=".8"/><circle cx="48" cy="44" r="2.8" fill="#78A24C" opacity=".8"/><circle cx="78" cy="96" r="3.5" fill="#78A24C" opacity=".8"/><circle cx="56" cy="104" r="3" fill="#78A24C" opacity=".8"/>
<circle cx="51" cy="22" r="6.5" fill="#fff"/><circle cx="52" cy="23.5" r="3.2" fill="#2B3A18"/><circle cx="51.2" cy="22.3" r="1.2" fill="#fff"/>
<circle cx="65" cy="22" r="6.5" fill="#fff"/><circle cx="66" cy="23.5" r="3.2" fill="#2B3A18"/><circle cx="65.2" cy="22.3" r="1.2" fill="#fff"/>
<ellipse cx="44" cy="30" rx="4" ry="2.5" fill="#FF9E8A" opacity=".85"/><ellipse cx="72" cy="30" rx="4" ry="2.5" fill="#FF9E8A" opacity=".85"/>
<path d="M52 31 q6 5 12 0" fill="none" stroke="#2B4A1E" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="44" cy="112" rx="7" ry="4.5" fill="#78A24C"/><ellipse cx="84" cy="112" rx="7" ry="4.5" fill="#78A24C"/>`,

spino: `<defs><radialGradient id="dsp-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3FAAAA"/><stop offset="1" stop-color="#2A8584"/></radialGradient></defs>
<path d="M94 84 q14 -4 18 -15" fill="none" stroke="#2A8584" stroke-width="8" stroke-linecap="round"/>
<path d="M46 74 L52 52 L60 68 L68 48 L76 68 L84 54 L90 76 z" fill="#E8845C"/>
<path d="M55 62 L54 54 M68 60 L68 52 M81 64 L82 56" stroke="#C25A2E" stroke-width="2.2" stroke-linecap="round" opacity=".6"/>
<ellipse cx="70" cy="86" rx="25" ry="15" fill="#2A8584"/>
<rect x="56" y="94" width="11" height="12" rx="5.5" fill="#1F6E6D"/><rect x="78" y="92" width="11" height="12" rx="5.5" fill="#1F6E6D"/>
<ellipse cx="72" cy="93" rx="14" ry="6" fill="#A8D8D4" opacity=".7"/>
<circle cx="44" cy="46" r="22" fill="url(#dsp-g)"/>
<circle cx="36" cy="43" r="7.5" fill="#fff"/><circle cx="37.3" cy="44.7" r="3.8" fill="#0F3232"/><circle cx="36.2" cy="43.3" r="1.3" fill="#fff"/>
<circle cx="52" cy="43" r="7.5" fill="#fff"/><circle cx="53.3" cy="44.7" r="3.8" fill="#0F3232"/><circle cx="52.2" cy="43.3" r="1.3" fill="#fff"/>
<ellipse cx="28" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/><ellipse cx="60" cy="53" rx="4.5" ry="2.8" fill="#FF9E8A" opacity=".85"/>
<path d="M37 56 q7 6 14 0" fill="none" stroke="#0F3232" stroke-width="3.5" stroke-linecap="round"/>
<path d="M40 57.5 l2.2 4 l3 -3.4 z" fill="#fff"/>
<path d="M8 106 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="102" cy="46" r="2.5" fill="#8ADAFF"/><circle cx="14" cy="66" r="2.2" fill="#8ADAFF"/>`,

ankylo: `<defs><radialGradient id="dak-g" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#A9BB55"/><stop offset="1" stop-color="#87973A"/></radialGradient></defs>
<path d="M92 80 q14 -6 16 -18" fill="none" stroke="#87973A" stroke-width="7" stroke-linecap="round"/>
<circle cx="110" cy="56" r="8.5" fill="#6E7C2E"/>
<circle cx="106" cy="53" r="1.8" fill="#D8E0A8"/><circle cx="113" cy="56" r="1.8" fill="#D8E0A8"/><circle cx="109" cy="60" r="1.8" fill="#D8E0A8"/>
<ellipse cx="74" cy="90" rx="28" ry="13" fill="#87973A"/>
<rect x="60" y="96" width="11" height="12" rx="5.5" fill="#767F32"/><rect x="82" y="94" width="11" height="12" rx="5.5" fill="#767F32"/>
<path d="M44 90 q2 -26 29 -26 q28 0 30 26 z" fill="#6E7C2E"/>
<circle cx="56" cy="76" r="2.8" fill="#E8E4C8"/><circle cx="73" cy="70" r="2.8" fill="#E8E4C8"/><circle cx="90" cy="76" r="2.8" fill="#E8E4C8"/><circle cx="64" cy="84" r="2.3" fill="#E8E4C8"/><circle cx="82" cy="84" r="2.3" fill="#E8E4C8"/>
<path d="M26 34 l5 -9 l5 8 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="1.6"/>
<path d="M44 33 l5 -9 l5 8 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="1.6"/>
<circle cx="40" cy="52" r="21" fill="url(#dak-g)"/>
<circle cx="33" cy="49" r="7" fill="#fff"/><circle cx="34.2" cy="50.6" r="3.6" fill="#2B3018"/><circle cx="33.2" cy="49.3" r="1.2" fill="#fff"/>
<circle cx="48" cy="49" r="7" fill="#fff"/><circle cx="49.2" cy="50.6" r="3.6" fill="#2B3018"/><circle cx="48.2" cy="49.3" r="1.2" fill="#fff"/>
<ellipse cx="25" cy="58" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/><ellipse cx="56" cy="58" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".85"/>
<path d="M35 61 q6 5 12 0" fill="none" stroke="#3A4018" stroke-width="3.5" stroke-linecap="round"/>`,

mosa: `<defs><radialGradient id="dms-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#4F73C0"/><stop offset="1" stop-color="#37589E"/></radialGradient></defs>
<path d="M42 96 q6 -26 30 -26 q24 0 30 26 z" fill="#37589E"/>
<path d="M64 72 l7 -13 l7 13 z" fill="#2C4A88"/>
<path d="M98 88 q4 -12 13 -16 q-1 10 -7 15 q9 0 13 5 q-9 4 -17 1 z" fill="#37589E"/>
<ellipse cx="52" cy="88" rx="9" ry="5.5" fill="#2C4A88" transform="rotate(-28 52 88)"/>
<circle cx="40" cy="54" r="22" fill="url(#dms-g)"/>
<ellipse cx="40" cy="66" rx="13" ry="7.5" fill="#C8DCF5" opacity=".85"/>
<circle cx="32" cy="50" r="7.5" fill="#fff"/><circle cx="33.3" cy="51.7" r="3.8" fill="#101E42"/><circle cx="32.2" cy="50.3" r="1.3" fill="#fff"/>
<circle cx="48" cy="50" r="7.5" fill="#fff"/><circle cx="49.3" cy="51.7" r="3.8" fill="#101E42"/><circle cx="48.2" cy="50.3" r="1.3" fill="#fff"/>
<ellipse cx="24" cy="60" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".75"/><ellipse cx="56" cy="60" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".75"/>
<path d="M33 63 q7 6 14 0" fill="none" stroke="#101E42" stroke-width="3.5" stroke-linecap="round"/>
<path d="M36 64.5 l2.2 4 l3 -3.4 z" fill="#fff"/>
<circle cx="86" cy="40" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="95" cy="30" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="12" cy="40" r="2.5" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<path d="M8 98 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<path d="M14 108 q10 -6 20 0 t20 0 t20 0 t20 0" fill="none" stroke="#8ADAFF" stroke-width="3.5" stroke-linecap="round" opacity=".8"/>`,

fossil: `<defs><radialGradient id="dfo-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7CFFB2" stop-opacity=".28"/><stop offset="1" stop-color="#7CFFB2" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="60" r="48" fill="url(#dfo-a)"/>
<path d="M94 80 q14 -4 18 -14" fill="none" stroke="#2A2F4A" stroke-width="7" stroke-linecap="round"/>
<circle cx="100" cy="76" r="1.6" fill="#BFE8D8"/><circle cx="106" cy="71" r="1.6" fill="#BFE8D8"/><circle cx="110" cy="65" r="1.6" fill="#BFE8D8"/>
<ellipse cx="72" cy="82" rx="24" ry="13" fill="#2A2F4A"/>
<rect x="58" y="90" width="10" height="12" rx="5" fill="#232842"/><rect x="80" y="88" width="10" height="12" rx="5" fill="#232842"/>
<path d="M58 74 q-2 8 2 12 M68 72 q-2 8 2 12 M78 72 q-2 8 2 12" fill="none" stroke="#BFE8D8" stroke-width="2.8" stroke-linecap="round"/>
<circle cx="60" cy="68" r="1.8" fill="#BFE8D8"/><circle cx="72" cy="66" r="1.8" fill="#BFE8D8"/><circle cx="84" cy="68" r="1.8" fill="#BFE8D8"/>
<circle cx="44" cy="48" r="21" fill="#2A2F4A"/>
<circle cx="36" cy="45" r="8" fill="#0F1226"/><circle cx="52" cy="45" r="8" fill="#0F1226"/>
<circle cx="36" cy="46" r="3.2" fill="#7CFFB2"/><circle cx="52" cy="46" r="3.2" fill="#7CFFB2"/>
<circle cx="35" cy="44.5" r="1.1" fill="#D8FFE8"/><circle cx="51" cy="44.5" r="1.1" fill="#D8FFE8"/>
<ellipse cx="41" cy="56" rx="1.8" ry="2.5" fill="#0F1226"/><ellipse cx="47" cy="56" rx="1.8" ry="2.5" fill="#0F1226"/>
<path d="M32 62 l3.5 4 l3.5 -4 l3.5 4 l3.5 -4 l3.5 4 l3.5 -4" fill="none" stroke="#BFE8D8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M20 24 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#7CFFB2" opacity=".9"/>
<path d="M100 32 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#7CFFB2" opacity=".9"/>`,

rexking: `<defs><radialGradient id="drx-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFB84D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient><radialGradient id="drx-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#F7BC46"/><stop offset="1" stop-color="#E89B1F"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#drx-a)"/>
<path d="M96 78 q14 -4 16 -16" fill="none" stroke="#D88A26" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="74" cy="80" rx="24" ry="16" fill="#E8912E"/>
<rect x="60" y="88" width="11" height="13" rx="5.5" fill="#C8721B"/><rect x="82" y="86" width="11" height="13" rx="5.5" fill="#C8721B"/>
<ellipse cx="76" cy="86" rx="14" ry="7" fill="#F7C860"/>
<path d="M70 84 h12 M71 90 h10" stroke="#C8721B" stroke-width="2.2" stroke-linecap="round"/>
<path d="M58 70 q-7 2 -8 8" fill="none" stroke="#D0812A" stroke-width="6" stroke-linecap="round"/>
<rect x="20" y="16" width="52" height="48" rx="20" fill="url(#drx-g)"/>
<path d="M22 44 h48 v3 q0 15 -24 15 q-24 0 -24 -15 z" fill="#F7C860"/>
<circle cx="40" cy="50" r="1.6" fill="#8A5410"/><circle cx="52" cy="50" r="1.6" fill="#8A5410"/>
<path d="M28 28 l11 4.5 M64 28 l-11 4.5" stroke="#5A2A10" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="35" cy="38" r="7.5" fill="#fff"/><circle cx="36.4" cy="39" r="3.8" fill="#3A1E10"/><circle cx="35.3" cy="38" r="1.3" fill="#fff"/>
<circle cx="57" cy="38" r="7.5" fill="#fff"/><circle cx="58.4" cy="39" r="3.8" fill="#3A1E10"/><circle cx="57.3" cy="38" r="1.3" fill="#fff"/>
<path d="M31 57 q15 9 30 0" fill="none" stroke="#5A2A10" stroke-width="3.5" stroke-linecap="round"/>
<path d="M37 59.5 l2.7 5.4 l3.6 -4.5 z" fill="#fff"/><path d="M55 59.5 l-2.7 5.4 l-3.6 -4.5 z" fill="#fff"/>
<path d="M30 16 l3.5 -12 l8 7 l4.5 -11 l4.5 11 l8 -7 l3.5 12 z" fill="#FFD700" stroke="#C8891B" stroke-width="2.5" stroke-linejoin="round"/>
<circle cx="38" cy="9" r="2" fill="#E0483C"/><circle cx="46" cy="6" r="2" fill="#36D1FF"/><circle cx="54" cy="9" r="2" fill="#E0483C"/>
<path d="M14 70 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M102 28 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});

/* VIBE PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

duckie: `<defs><radialGradient id="vbdk-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFDF7E"/><stop offset="1" stop-color="#FFC93D"/></radialGradient></defs>
<ellipse cx="60" cy="74" rx="32" ry="24" fill="#FFC93D"/>
<path d="M84 70 q10 -4 12 -14 q6 10 -2 18 q-6 5 -10 -4 z" fill="#F0B429"/>
<circle cx="56" cy="42" r="24" fill="url(#vbdk-g)"/>
<circle cx="47" cy="38" r="7.5" fill="#fff"/><circle cx="48.3" cy="39.5" r="3.8" fill="#3A2A15"/><circle cx="47.2" cy="38.3" r="1.3" fill="#fff"/>
<circle cx="67" cy="38" r="7.5" fill="#fff"/><circle cx="68.3" cy="39.5" r="3.8" fill="#3A2A15"/><circle cx="67.2" cy="38.3" r="1.3" fill="#fff"/>
<path d="M44 52 q13 -6 26 0 q-4 9 -13 9 q-9 0 -13 -9 z" fill="#F0862A"/>
<path d="M46 54 q11 4 22 0" fill="none" stroke="#C86814" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="40" cy="48" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="48" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/>
<path d="M10 100 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="20" cy="28" r="2.2" fill="#FFC83D"/><circle cx="100" cy="30" r="2.2" fill="#FFC83D"/>`,

boba: `<path d="M74 8 L58 46" stroke="#8A5CE8" stroke-width="9" stroke-linecap="round"/>
<path d="M38 34 h44 l-3 8 h-38 z" fill="#C8A882"/>
<path d="M40 42 h40 l-4 54 q-1 8 -9 8 h-14 q-8 0 -9 -8 z" fill="#E8C8A0"/>
<path d="M44 42 h6 l3 60 h-2 q-6 0 -7 -8 z" fill="#F5DEC0" opacity=".9"/>
<circle cx="50" cy="90" r="4" fill="#3A2A20"/><circle cx="60" cy="94" r="4" fill="#3A2A20"/><circle cx="70" cy="90" r="4" fill="#3A2A20"/><circle cx="55" cy="98" r="3.5" fill="#3A2A20"/><circle cx="66" cy="98" r="3.5" fill="#3A2A20"/>
<circle cx="52" cy="64" r="6.5" fill="#fff"/><circle cx="53.2" cy="65.4" r="3.4" fill="#3A2A20"/><circle cx="52.2" cy="64.3" r="1.2" fill="#fff"/>
<circle cx="70" cy="64" r="6.5" fill="#fff"/><circle cx="71.2" cy="65.4" r="3.4" fill="#3A2A20"/><circle cx="70.2" cy="64.3" r="1.2" fill="#fff"/>
<ellipse cx="46" cy="72" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".9"/><ellipse cx="76" cy="72" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".9"/>
<path d="M55 76 q6 5 12 0" fill="none" stroke="#3A2A20" stroke-width="3" stroke-linecap="round"/>
<circle cx="24" cy="30" r="2.2" fill="#FFC83D"/><circle cx="100" cy="66" r="2.2" fill="#FFC83D"/>`,

slimey: `<defs><radialGradient id="vbsl-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#A8E668"/><stop offset="1" stop-color="#6CC040"/></radialGradient></defs>
<path d="M26 80 q-6 -40 34 -42 q40 2 34 42 q-2 14 -13 16 q1 -7 -5 -9 q-4 9 -16 9 q-12 0 -16 -9 q-6 2 -5 9 q-11 -2 -13 -16 z" fill="url(#vbsl-g)"/>
<path d="M40 94 q1 8 -2 12 q-6 -2 -4 -10 z" fill="#6CC040"/>
<path d="M82 92 q2 10 -1 14 q-6 -2 -5 -11 z" fill="#8AD455"/>
<circle cx="42" cy="50" r="6" fill="#C8F0A0" opacity=".8"/><circle cx="78" cy="46" r="4" fill="#C8F0A0" opacity=".8"/><circle cx="34" cy="66" r="3" fill="#C8F0A0" opacity=".8"/>
<circle cx="48" cy="58" r="8.5" fill="#fff"/><circle cx="49.5" cy="59.5" r="4.2" fill="#28481C"/><circle cx="48.3" cy="58.3" r="1.5" fill="#fff"/>
<circle cx="72" cy="58" r="8.5" fill="#fff"/><circle cx="73.5" cy="59.5" r="4.2" fill="#28481C"/><circle cx="72.3" cy="58.3" r="1.5" fill="#fff"/>
<ellipse cx="39" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".75"/><ellipse cx="81" cy="68" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".75"/>
<path d="M48 72 q12 11 24 0 q-12 5 -24 0 z" fill="#28481C"/>
<circle cx="20" cy="34" r="2.2" fill="#FFC83D"/><circle cx="102" cy="86" r="2.2" fill="#FFC83D"/>`,

sprinkle: `<circle cx="60" cy="62" r="32" fill="#E8A25C"/>
<path d="M28 62 a32 32 0 0 1 64 0 l-2 5 q-7 -7 -13 0 q-7 7 -17 3 q-10 4 -17 -3 q-6 -7 -13 0 z" fill="#FF8AB8"/>
<circle cx="60" cy="46" r="8" fill="#F5E3C8"/>
<rect x="40" y="38" width="7" height="3" rx="1.5" fill="#36D1FF" transform="rotate(24 43 39)"/>
<rect x="72" y="34" width="7" height="3" rx="1.5" fill="#FFC23D" transform="rotate(-18 75 35)"/>
<rect x="52" y="28" width="7" height="3" rx="1.5" fill="#8A5CE8" transform="rotate(8 55 29)"/>
<rect x="32" y="52" width="7" height="3" rx="1.5" fill="#7CFFB2" transform="rotate(-30 35 53)"/>
<rect x="82" y="50" width="7" height="3" rx="1.5" fill="#fff" transform="rotate(30 85 51)"/>
<circle cx="48" cy="68" r="7.5" fill="#fff"/><circle cx="49.3" cy="69.5" r="3.8" fill="#5C2A38"/><circle cx="48.2" cy="68.3" r="1.3" fill="#fff"/>
<circle cx="72" cy="68" r="7.5" fill="#fff"/><circle cx="73.3" cy="69.5" r="3.8" fill="#5C2A38"/><circle cx="72.2" cy="68.3" r="1.3" fill="#fff"/>
<ellipse cx="41" cy="77" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/><ellipse cx="79" cy="77" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/>
<path d="M53 80 q7 6 14 0" fill="none" stroke="#5C2A38" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="18" cy="28" r="2.2" fill="#FFC83D"/><circle cx="104" cy="92" r="2.2" fill="#FFC83D"/>`,

pengu: `<ellipse cx="60" cy="66" rx="29" ry="33" fill="#2E3450"/>
<ellipse cx="34" cy="70" rx="7" ry="14" fill="#2E3450" transform="rotate(16 34 70)"/>
<ellipse cx="86" cy="70" rx="7" ry="14" fill="#2E3450" transform="rotate(-16 86 70)"/>
<ellipse cx="60" cy="74" rx="20" ry="22" fill="#FBF7F0"/>
<ellipse cx="60" cy="50" rx="17" ry="14" fill="#FBF7F0"/>
<circle cx="52" cy="48" r="6.5" fill="#fff" stroke="#D8D4C8" stroke-width="1"/><circle cx="53.2" cy="49.4" r="3.4" fill="#1E2230"/><circle cx="52.2" cy="48.3" r="1.2" fill="#fff"/>
<circle cx="68" cy="48" r="6.5" fill="#fff" stroke="#D8D4C8" stroke-width="1"/><circle cx="69.2" cy="49.4" r="3.4" fill="#1E2230"/><circle cx="68.2" cy="48.3" r="1.2" fill="#fff"/>
<path d="M54 58 q6 -4 12 0 q-3 6 -6 6 q-3 0 -6 -6 z" fill="#F0862A"/>
<ellipse cx="44" cy="56" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="56" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<ellipse cx="50" cy="100" rx="8" ry="4.5" fill="#F0862A"/><ellipse cx="70" cy="100" rx="8" ry="4.5" fill="#F0862A"/>
<path d="M18 30 l2 2 M24 24 l2 2 M100 36 l2 2" stroke="#8ADAFF" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="20" cy="90" r="2.2" fill="#8ADAFF"/><circle cx="102" cy="60" r="2.2" fill="#8ADAFF"/>`,

catlord: `<defs><radialGradient id="vbcl-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A8A8C0"/><stop offset="1" stop-color="#8A8AA6"/></radialGradient></defs>
<path d="M46 12 l4 -8 l7 6 l5 -6 l5 6 l7 -6 l4 8 z" fill="#FFD700" stroke="#C8891B" stroke-width="2" stroke-linejoin="round" transform="rotate(-8 60 10)"/>
<path d="M30 42 L34 16 L54 32 z" fill="#8A8AA6"/><path d="M35 36 L37 24 L46 31 z" fill="#FFB3C8"/>
<path d="M90 42 L86 16 L66 32 z" fill="#8A8AA6"/><path d="M85 36 L83 24 L74 31 z" fill="#FFB3C8"/>
<circle cx="60" cy="62" r="29" fill="url(#vbcl-g)"/>
<circle cx="47" cy="58" r="7.5" fill="#fff"/><path d="M39.5 56.5 a7.5 7.5 0 0 1 15 0 z" fill="#8A8AA6"/><circle cx="48.3" cy="60" r="3.8" fill="#2B2B3E"/><circle cx="47.2" cy="58.8" r="1.2" fill="#fff"/>
<circle cx="73" cy="58" r="7.5" fill="#fff"/><path d="M65.5 56.5 a7.5 7.5 0 0 1 15 0 z" fill="#8A8AA6"/><circle cx="74.3" cy="60" r="3.8" fill="#2B2B3E"/><circle cx="73.2" cy="58.8" r="1.2" fill="#fff"/>
<ellipse cx="60" cy="70" rx="3.5" ry="2.5" fill="#FF9EB8"/>
<path d="M54 74 q3 4 6 0 q3 4 6 0" fill="none" stroke="#2B2B3E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M28 64 h-12 M30 72 h-10 M92 64 h12 M90 72 h10" stroke="#C9C9DD" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="40" cy="68" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/><ellipse cx="80" cy="68" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/>
<path d="M100 92 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

djbot: `<path d="M32 38 a28 28 0 0 1 56 0" fill="none" stroke="#8A5CE8" stroke-width="7" stroke-linecap="round"/>
<rect x="18" y="38" width="14" height="22" rx="6" fill="#8A5CE8"/><rect x="88" y="38" width="14" height="22" rx="6" fill="#8A5CE8"/>
<rect x="30" y="30" width="60" height="52" rx="14" fill="#3A3A50"/>
<circle cx="48" cy="50" r="7.5" fill="#fff"/><circle cx="49.3" cy="51.5" r="3.8" fill="#8A5CE8"/><circle cx="48.2" cy="50.3" r="1.3" fill="#fff"/>
<circle cx="72" cy="50" r="7.5" fill="#fff"/><circle cx="73.3" cy="51.5" r="3.8" fill="#8A5CE8"/><circle cx="72.2" cy="50.3" r="1.3" fill="#fff"/>
<path d="M46 64 v8 M53 60 v14 M60 66 v6 M67 60 v14 M74 64 v8" stroke="#36D1FF" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="39" cy="58" rx="3.5" ry="2.2" fill="#FF7FBE" opacity=".8"/><ellipse cx="81" cy="58" rx="3.5" ry="2.2" fill="#FF7FBE" opacity=".8"/>
<path d="M42 82 q18 8 36 0 l-3 16 q-15 6 -30 0 z" fill="#5E5E78"/>
<path d="M18 78 v-12 q4 1 6 4" fill="none" stroke="#FF5D9E" stroke-width="3" stroke-linecap="round"/><circle cx="15.5" cy="79" r="3.5" fill="#FF5D9E"/>
<path d="M104 90 v-10 q3.5 1 5 3" fill="none" stroke="#36D1FF" stroke-width="3" stroke-linecap="round"/><circle cx="101.5" cy="91" r="3" fill="#36D1FF"/>
<circle cx="106" cy="28" r="2.2" fill="#FFC83D"/>`,

plushy: `<defs><radialGradient id="vbpl-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#D0A870"/><stop offset="1" stop-color="#B8905A"/></radialGradient></defs>
<circle cx="38" cy="30" r="11" fill="#B8905A"/><circle cx="38" cy="30" r="5.5" fill="#E8C8A0"/>
<circle cx="82" cy="30" r="11" fill="#B8905A"/><circle cx="82" cy="30" r="5.5" fill="#E8C8A0"/>
<circle cx="60" cy="62" r="29" fill="url(#vbpl-g)"/>
<ellipse cx="60" cy="74" rx="14" ry="11" fill="#E8C8A0"/>
<rect x="70" y="60" width="13" height="11" rx="2" fill="#8FD068"/>
<path d="M70 63 h13 M70 67 h13 M73 60 v11 M79 60 v11" stroke="#5CA346" stroke-width="1.2"/>
<path d="M34 48 l8 6 M42 48 l-8 6" stroke="#8A6844" stroke-width="2" stroke-linecap="round"/>
<circle cx="47" cy="56" r="7" fill="#fff"/><circle cx="48.3" cy="57.4" r="3.6" fill="#3A2A15"/><circle cx="47.2" cy="56.3" r="1.2" fill="#fff"/>
<circle cx="72" cy="56" r="7" fill="#fff"/><circle cx="73.3" cy="57.4" r="3.6" fill="#3A2A15"/><circle cx="72.2" cy="56.3" r="1.2" fill="#fff"/>
<path d="M55 70 l5 4 l5 -4 z" fill="#3A2A15"/>
<path d="M60 74 v4 M54 82 q6 4 12 0" fill="none" stroke="#3A2A15" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="38" cy="66" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/>
<circle cx="18" cy="88" r="2.2" fill="#FFC83D"/><circle cx="102" cy="90" r="2.2" fill="#FFC83D"/>`,

gg: `<defs><radialGradient id="vbgg-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFE0B8"/><stop offset="1" stop-color="#FFD9A8"/></radialGradient></defs>
<circle cx="60" cy="64" r="27" fill="url(#vbgg-g)"/>
<path d="M32 52 a28 28 0 0 1 56 0 l-2 4 h-52 z" fill="#3B6FE0"/>
<path d="M86 54 h18 q4 0 4 5 q0 5 -5 5 h-15 z" fill="#2C54B0"/>
<circle cx="60" cy="42" r="4" fill="#2C54B0"/>
<rect x="38" y="56" width="18" height="12" fill="#12141E"/><rect x="64" y="56" width="18" height="12" fill="#12141E"/>
<rect x="56" y="58" width="8" height="4" fill="#12141E"/>
<rect x="42" y="58" width="5" height="4" fill="#3A4050"/><rect x="68" y="58" width="5" height="4" fill="#3A4050"/>
<ellipse cx="42" cy="76" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".9"/>
<path d="M50 78 q8 8 18 2 q-4 7 -12 6 q-6 -1 -6 -8 z" fill="#8A4A2E"/>
<path d="M96 88 l1.8 3.4 3.8 .6 -2.8 2.7 .7 3.8 -3.5 -1.8 -3.5 1.8 .7 -3.8 -2.8 -2.7 3.8 -.6 z" fill="#FFC83D"/>
<circle cx="18" cy="42" r="2.2" fill="#FFC83D"/><circle cx="22" cy="94" r="2.2" fill="#FFC83D"/>`,

yeti: `<defs><radialGradient id="vbyt-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#8ADAFF" stop-opacity=".4"/><stop offset="1" stop-color="#8ADAFF" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="58" r="50" fill="url(#vbyt-a)"/>
<path d="M60 24 l6 8 l9 -5 l2 10 l10 -1 l-2 10 l10 3 l-7 8 l7 8 l-10 3 l2 10 l-10 -1 l-2 10 l-9 -5 l-6 8 l-6 -8 l-9 5 l-2 -10 l-10 1 l2 -10 l-10 -3 l7 -8 l-7 -8 l10 -3 l-2 -10 l10 1 l2 -10 l9 5 z" fill="#F4F4FA"/>
<ellipse cx="60" cy="64" rx="21" ry="18" fill="#BFE2F0"/>
<circle cx="51" cy="60" r="7.5" fill="#fff"/><circle cx="52.3" cy="61.5" r="3.8" fill="#1E3A52"/><circle cx="51.2" cy="60.3" r="1.3" fill="#fff"/>
<circle cx="69" cy="60" r="7.5" fill="#fff"/><circle cx="70.3" cy="61.5" r="3.8" fill="#1E3A52"/><circle cx="69.2" cy="60.3" r="1.3" fill="#fff"/>
<ellipse cx="44" cy="70" rx="4.2" ry="2.6" fill="#8ADAFF" opacity=".9"/><ellipse cx="76" cy="70" rx="4.2" ry="2.6" fill="#8ADAFF" opacity=".9"/>
<path d="M52 74 q8 7 16 0" fill="none" stroke="#1E3A52" stroke-width="3.5" stroke-linecap="round"/>
<path d="M53 76.5 l2.6 -4.6 l3 4 z" fill="#fff"/><path d="M67 76.5 l-2.6 -4.6 l-3 4 z" fill="#fff"/>
<path d="M18 30 l2.5 0 M19.2 28.8 l0 2.5 M98 84 l3 0 M99.5 82.5 l0 3 M102 24 l3 0 M103.5 22.5 l0 3" stroke="#8ADAFF" stroke-width="2" stroke-linecap="round"/>
<circle cx="24" cy="92" r="2.2" fill="#8ADAFF"/>`

});

/* ENCHANTED PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

fae: `<ellipse cx="34" cy="46" rx="16" ry="24" fill="#C4B4FF" opacity=".55" transform="rotate(-24 34 46)"/>
<ellipse cx="86" cy="46" rx="16" ry="24" fill="#C4B4FF" opacity=".55" transform="rotate(24 86 46)"/>
<ellipse cx="38" cy="74" rx="10" ry="15" fill="#DACFFF" opacity=".55" transform="rotate(-38 38 74)"/>
<ellipse cx="82" cy="74" rx="10" ry="15" fill="#DACFFF" opacity=".55" transform="rotate(38 82 74)"/>
<circle cx="60" cy="60" r="24" fill="#FFD9A8"/>
<path d="M36 54 q-2 -20 24 -18 q26 -2 24 18 q-10 -8 -24 -8 q-14 0 -24 8 z" fill="#A05CC8"/>
<circle cx="82" cy="42" r="5" fill="#FF8AB8"/><circle cx="79" cy="38" r="2.5" fill="#FFC0D8"/>
<path d="M34 58 l-8 -4 M86 58 l8 -4" stroke="#FFD9A8" stroke-width="5" stroke-linecap="round"/>
<circle cx="52" cy="58" r="7" fill="#fff"/><circle cx="53.2" cy="59.4" r="3.6" fill="#5C3A78"/><circle cx="52.2" cy="58.3" r="1.2" fill="#fff"/>
<circle cx="68" cy="58" r="7" fill="#fff"/><circle cx="69.2" cy="59.4" r="3.6" fill="#5C3A78"/><circle cx="68.2" cy="58.3" r="1.2" fill="#fff"/>
<ellipse cx="46" cy="67" rx="4" ry="2.5" fill="#FF9EB8" opacity=".9"/><ellipse cx="74" cy="67" rx="4" ry="2.5" fill="#FF9EB8" opacity=".9"/>
<path d="M54 70 q6 5 12 0" fill="none" stroke="#5C3A78" stroke-width="3" stroke-linecap="round"/>
<circle cx="20" cy="26" r="2" fill="#FFC83D"/><circle cx="16" cy="78" r="2.2" fill="#C4B4FF"/><circle cx="104" cy="80" r="2" fill="#FFC83D"/>
<path d="M98 18 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

mer: `<path d="M18 76 q0 -30 42 -30 q42 0 42 30 z" fill="#FF9EC4" stroke="#E07098" stroke-width="2.5"/>
<path d="M32 52 L28 76 M46 47 L44 76 M60 46 v30 M74 47 l2 29 M88 52 l4 24" stroke="#E07098" stroke-width="2" opacity=".7"/>
<path d="M18 76 q42 12 84 0 l-6 10 q-36 10 -72 0 z" fill="#F0A0C0" stroke="#E07098" stroke-width="2"/>
<defs><radialGradient id="ecmr-g" cx="42%" cy="30%" r="80%"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#D8CCF0"/></radialGradient></defs>
<circle cx="60" cy="48" r="21" fill="url(#ecmr-g)"/>
<path d="M44 36 q6 -6 14 -7" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="53" cy="46" r="6.5" fill="#fff"/><circle cx="54.2" cy="47.4" r="3.4" fill="#4A3A68"/><circle cx="53.2" cy="46.3" r="1.2" fill="#fff"/>
<circle cx="67" cy="46" r="6.5" fill="#fff"/><circle cx="68.2" cy="47.4" r="3.4" fill="#4A3A68"/><circle cx="67.2" cy="46.3" r="1.2" fill="#fff"/>
<ellipse cx="47" cy="54" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".9"/><ellipse cx="73" cy="54" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".9"/>
<path d="M55 58 q5 4 10 0" fill="none" stroke="#4A3A68" stroke-width="3" stroke-linecap="round"/>
<circle cx="24" cy="30" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="98" cy="26" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<path d="M12 104 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>`,

crystal: `<defs><linearGradient id="eccr-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C08CE8"/><stop offset="1" stop-color="#8A5CC8"/></linearGradient></defs>
<path d="M30 58 L40 40 L50 58 V92 H30 z" fill="#A874D8" opacity=".85"/>
<path d="M70 62 L82 46 L94 62 V92 H70 z" fill="#A874D8" opacity=".85"/>
<path d="M42 40 L60 14 L78 40 V94 H42 z" fill="url(#eccr-g)" stroke="#7A4AB8" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M60 14 L54 40 V94 M60 14 L70 40" stroke="#D8B8F0" stroke-width="2" opacity=".7"/>
<path d="M46 30 l4 -6" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
<circle cx="53" cy="58" r="7" fill="#fff"/><circle cx="54.2" cy="59.4" r="3.6" fill="#3A1E5C"/><circle cx="53.2" cy="58.3" r="1.2" fill="#fff"/>
<circle cx="69" cy="58" r="7" fill="#fff"/><circle cx="70.2" cy="59.4" r="3.6" fill="#3A1E5C"/><circle cx="69.2" cy="58.3" r="1.2" fill="#fff"/>
<ellipse cx="48" cy="67" rx="3.8" ry="2.4" fill="#FF9EDA" opacity=".9"/><ellipse cx="74" cy="67" rx="3.8" ry="2.4" fill="#FF9EDA" opacity=".9"/>
<path d="M55 71 q5 4 10 0" fill="none" stroke="#3A1E5C" stroke-width="3" stroke-linecap="round"/>
<path d="M16 34 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M100 78 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>
<circle cx="102" cy="30" r="2.2" fill="#C4B4FF"/>`,

lunamoth: `<path d="M56 52 Q20 24 12 44 q-6 18 22 26 q14 4 22 -6 z" fill="#C8E8B8" stroke="#9CCB88" stroke-width="2"/>
<path d="M64 52 Q100 24 108 44 q6 18 -22 26 q-14 4 -22 -6 z" fill="#C8E8B8" stroke="#9CCB88" stroke-width="2"/>
<path d="M52 68 q-18 4 -16 20 q2 12 12 6 q8 -5 8 -20 z" fill="#B8DCA4" stroke="#9CCB88" stroke-width="2"/>
<path d="M68 68 q18 4 16 20 q-2 12 -12 6 q-8 -5 -8 -20 z" fill="#B8DCA4" stroke="#9CCB88" stroke-width="2"/>
<circle cx="34" cy="48" r="5" fill="#F0E8B8" stroke="#C8B868" stroke-width="1.8"/>
<circle cx="86" cy="48" r="5" fill="#F0E8B8" stroke="#C8B868" stroke-width="1.8"/>
<path d="M52 34 q-6 -10 -16 -12 M68 34 q6 -10 16 -12" fill="none" stroke="#8A6844" stroke-width="3" stroke-linecap="round"/>
<path d="M38 20 l-4 1 M40 25 l-5 2 M82 20 l4 1 M80 25 l5 2" stroke="#8A6844" stroke-width="2" stroke-linecap="round"/>
<circle cx="60" cy="46" r="14" fill="#F4F0E6"/>
<ellipse cx="60" cy="76" rx="10" ry="20" fill="#F4F0E6"/>
<path d="M52 82 h16 M53 89 h14" stroke="#D8D0BC" stroke-width="2" stroke-linecap="round"/>
<circle cx="55" cy="44" r="4.5" fill="#fff" stroke="#D8D0BC" stroke-width="1"/><circle cx="55.8" cy="45" r="2.4" fill="#3A362B"/><circle cx="55.2" cy="44.2" r=".9" fill="#fff"/>
<circle cx="65" cy="44" r="4.5" fill="#fff" stroke="#D8D0BC" stroke-width="1"/><circle cx="65.8" cy="45" r="2.4" fill="#3A362B"/><circle cx="65.2" cy="44.2" r=".9" fill="#fff"/>
<path d="M56 52 q4 3 8 0" fill="none" stroke="#3A362B" stroke-width="2.5" stroke-linecap="round"/>
<path d="M100 88 a10 10 0 1 1 -6 -14 a8 8 0 1 0 6 14 z" fill="#FFE49B"/>
<circle cx="20" cy="90" r="2" fill="#FFC83D"/><circle cx="16" cy="26" r="2" fill="#C4B4FF"/>`,

wisp: `<defs><radialGradient id="ecwp-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#7FE8D8" stop-opacity=".4"/><stop offset="1" stop-color="#7FE8D8" stop-opacity="0"/></radialGradient><radialGradient id="ecwp-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#A8F0E4"/><stop offset="1" stop-color="#3AB8A8"/></radialGradient></defs>
<circle cx="60" cy="56" r="48" fill="url(#ecwp-a)"/>
<path d="M60 16 q26 10 24 38 q-2 24 -24 28 q-22 -4 -24 -28 q-2 -28 24 -38 z" fill="url(#ecwp-g)"/>
<path d="M48 80 q-2 12 -12 16 q14 2 20 -8 z" fill="#3AB8A8" opacity=".85"/>
<path d="M72 80 q4 10 12 12 q-12 4 -18 -4 z" fill="#5ACFC0" opacity=".85"/>
<ellipse cx="51" cy="52" rx="4.5" ry="6.5" fill="#0F3A34"/><circle cx="49.8" cy="49.5" r="1.6" fill="#fff"/>
<ellipse cx="69" cy="52" rx="4.5" ry="6.5" fill="#0F3A34"/><circle cx="67.8" cy="49.5" r="1.6" fill="#fff"/>
<ellipse cx="60" cy="66" rx="3.5" ry="4.5" fill="#0F3A34"/>
<ellipse cx="42" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".6"/><ellipse cx="78" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".6"/>
<circle cx="24" cy="34" r="3" fill="#7FE8D8" opacity=".9"/><circle cx="98" cy="44" r="2.5" fill="#7FE8D8" opacity=".9"/><circle cx="90" cy="98" r="2.8" fill="#7FE8D8" opacity=".9"/><circle cx="26" cy="94" r="2" fill="#7FE8D8" opacity=".9"/>`,

midnight: `<path d="M30 44 L34 16 L56 34 z" fill="#2B2B3E"/><path d="M35 37 L37 24 L47 32 z" fill="#8A5CE8"/>
<path d="M90 44 L86 16 L64 34 z" fill="#2B2B3E"/><path d="M85 37 L83 24 L73 32 z" fill="#8A5CE8"/>
<circle cx="60" cy="62" r="29" fill="#2B2B3E"/>
<path d="M66 40 a8 8 0 1 1 -5 -11 a6.5 6.5 0 1 0 5 11 z" fill="#FFC83D"/>
<circle cx="47" cy="58" r="7" fill="#FFC83D"/><ellipse cx="47.6" cy="59" rx="2.6" ry="3.6" fill="#14102A"/><circle cx="46.4" cy="56.8" r="1.2" fill="#fff"/>
<circle cx="73" cy="58" r="7" fill="#FFC83D"/><ellipse cx="73.6" cy="59" rx="2.6" ry="3.6" fill="#14102A"/><circle cx="72.4" cy="56.8" r="1.2" fill="#fff"/>
<ellipse cx="60" cy="68" rx="3" ry="2.2" fill="#FF9EB8"/>
<path d="M54 72 q3 4 6 0 q3 4 6 0" fill="none" stroke="#C9C2DD" stroke-width="2.5" stroke-linecap="round"/>
<path d="M30 62 h-12 M32 70 h-10 M90 62 h12 M88 70 h10" stroke="#5E5A78" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="40" cy="66" rx="4" ry="2.5" fill="#8A5CE8" opacity=".7"/><ellipse cx="80" cy="66" rx="4" ry="2.5" fill="#8A5CE8" opacity=".7"/>
<circle cx="20" cy="28" r="1.8" fill="#fff"/><circle cx="102" cy="34" r="1.5" fill="#fff"/><circle cx="106" cy="88" r="1.8" fill="#fff"/><circle cx="16" cy="92" r="1.5" fill="#fff"/>
<path d="M96 16 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

snowfox: `<path d="M30 42 L32 14 L56 32 z" fill="#FBF7F0"/><path d="M35 35 L36 22 L47 30 z" fill="#7FB8D8"/>
<path d="M90 42 L88 14 L64 32 z" fill="#FBF7F0"/><path d="M85 35 L84 22 L73 30 z" fill="#7FB8D8"/>
<circle cx="60" cy="60" r="28" fill="#FBF7F0"/>
<path d="M30 66 q-8 4 -10 10 q10 2 14 -4 z" fill="#FBF7F0"/>
<path d="M90 66 q8 4 10 10 q-10 2 -14 -4 z" fill="#FBF7F0"/>
<path d="M36 74 q6 16 24 16 q18 0 24 -16 q-10 6 -24 6 q-14 0 -24 -6 z" fill="#EAF2F8"/>
<circle cx="47" cy="56" r="7.5" fill="#fff" stroke="#D8E4EC" stroke-width="1"/><circle cx="48.3" cy="57.5" r="3.8" fill="#2E6E96"/><circle cx="47.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="56" r="7.5" fill="#fff" stroke="#D8E4EC" stroke-width="1"/><circle cx="74.3" cy="57.5" r="3.8" fill="#2E6E96"/><circle cx="73.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill="#2B3A48"/>
<path d="M54 73 q3 4 6 0 q3 4 6 0" fill="none" stroke="#2B3A48" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="40" cy="65" rx="4.2" ry="2.6" fill="#BFE2F0" opacity=".95"/><ellipse cx="80" cy="65" rx="4.2" ry="2.6" fill="#BFE2F0" opacity=".95"/>
<path d="M18 30 v8 M14 34 h8 M15.2 31.2 l5.6 5.6 M20.8 31.2 l-5.6 5.6" stroke="#8ADAFF" stroke-width="1.8" stroke-linecap="round"/>
<path d="M100 82 v8 M96 86 h8 M97.2 83.2 l5.6 5.6 M102.8 83.2 l-5.6 5.6" stroke="#8ADAFF" stroke-width="1.8" stroke-linecap="round"/>
<circle cx="102" cy="30" r="2" fill="#8ADAFF"/>`,

wish: `<path d="M12 88 q22 -6 36 -20 M8 72 q18 -2 30 -12 M22 100 q16 -6 26 -16" fill="none" stroke="#C4B4FF" stroke-width="5" stroke-linecap="round" opacity=".8"/>
<defs><radialGradient id="ecws-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFE49B"/><stop offset="1" stop-color="#F0B429"/></radialGradient></defs>
<path d="M68 12 L78 36 L104 39 L85 56 L90 82 L68 69 L46 82 L51 56 L32 39 L58 36 z" fill="url(#ecws-g)" stroke="#F0A82A" stroke-width="8" stroke-linejoin="round"/>
<path d="M58 44 a5 5 0 0 1 9 0" fill="none" stroke="#8A5408" stroke-width="3" stroke-linecap="round"/>
<path d="M74 44 a5 5 0 0 1 9 0" fill="none" stroke="#8A5408" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="55" cy="52" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/><ellipse cx="86" cy="52" rx="3.8" ry="2.4" fill="#FF9E8A" opacity=".9"/>
<path d="M65 55 q5 4 10 0" fill="none" stroke="#8A5408" stroke-width="3" stroke-linecap="round"/>
<circle cx="20" cy="30" r="2" fill="#FFC83D"/><circle cx="104" cy="90" r="2.2" fill="#FFC83D"/>
<path d="M100 14 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`,

briar: `<path d="M20 96 q20 -12 40 -8 M100 96 q-16 -10 -32 -8" fill="none" stroke="#4A8636" stroke-width="4" stroke-linecap="round"/>
<path d="M34 90 l-4 -6 l7 1 z M60 86 l-2 -7 l6 3 z M90 90 l4 -6 l-7 1 z" fill="#4A8636"/>
<path d="M42 92 q-8 -2 -12 4 q6 6 14 2 z" fill="#5CA346"/>
<path d="M78 92 q8 -2 12 4 q-6 6 -14 2 z" fill="#5CA346"/>
<defs><radialGradient id="ecbr-g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#F06A8A"/><stop offset="1" stop-color="#D0385C"/></radialGradient></defs>
<circle cx="60" cy="52" r="30" fill="url(#ecbr-g)"/>
<path d="M60 26 q20 4 22 22 q-2 16 -16 20 M60 26 q-20 4 -22 22 q1 12 9 17" fill="none" stroke="#B02848" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M60 34 q12 3 13 14 q-1 10 -10 13" fill="none" stroke="#B02848" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
<circle cx="49" cy="50" r="7.5" fill="#fff"/><circle cx="50.3" cy="51.5" r="3.8" fill="#5C1428"/><circle cx="49.2" cy="50.3" r="1.3" fill="#fff"/>
<circle cx="71" cy="50" r="7.5" fill="#fff"/><circle cx="72.3" cy="51.5" r="3.8" fill="#5C1428"/><circle cx="71.2" cy="50.3" r="1.3" fill="#fff"/>
<ellipse cx="42" cy="60" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/><ellipse cx="78" cy="60" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/>
<path d="M53 64 q7 6 14 0" fill="none" stroke="#5C1428" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="18" cy="40" r="2.2" fill="#FFC83D"/><circle cx="102" cy="44" r="2.2" fill="#FFC83D"/>`,

starweaver: `<defs><radialGradient id="ecsw-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#8A5CE8" stop-opacity=".4"/><stop offset="1" stop-color="#8A5CE8" stop-opacity="0"/></radialGradient><radialGradient id="ecsw-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#4A3AA8"/><stop offset="1" stop-color="#2B1B5E"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#ecsw-a)"/>
<path d="M22 36 L38 28 L34 46 L52 44" fill="none" stroke="#C4B4FF" stroke-width="1.5" opacity=".8"/>
<path d="M98 36 L84 30 L88 48 L70 44" fill="none" stroke="#C4B4FF" stroke-width="1.5" opacity=".8"/>
<circle cx="22" cy="36" r="2.2" fill="#fff"/><circle cx="38" cy="28" r="1.8" fill="#fff"/><circle cx="34" cy="46" r="1.5" fill="#fff"/><circle cx="98" cy="36" r="2.2" fill="#fff"/><circle cx="84" cy="30" r="1.8" fill="#fff"/><circle cx="88" cy="48" r="1.5" fill="#fff"/>
<path d="M48 20 a8 8 0 1 1 -5 -11 a6.5 6.5 0 1 0 5 11 z" fill="#FFC83D" transform="rotate(-20 44 14)"/>
<circle cx="60" cy="62" r="28" fill="url(#ecsw-g)"/>
<circle cx="46" cy="46" r="1.4" fill="#fff" opacity=".9"/><circle cx="70" cy="42" r="1.6" fill="#fff" opacity=".9"/><circle cx="80" cy="56" r="1.3" fill="#fff" opacity=".9"/><circle cx="38" cy="60" r="1.3" fill="#fff" opacity=".9"/>
<circle cx="49" cy="60" r="8" fill="#EDE7FF"/><circle cx="50.4" cy="61.5" r="4" fill="#14102A"/><circle cx="49.3" cy="60.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="60" r="8" fill="#EDE7FF"/><circle cx="72.4" cy="61.5" r="4" fill="#14102A"/><circle cx="71.3" cy="60.3" r="1.4" fill="#fff"/>
<ellipse cx="41" cy="70" rx="4.5" ry="2.8" fill="#FF9EDA" opacity=".8"/><ellipse cx="79" cy="70" rx="4.5" ry="2.8" fill="#FF9EDA" opacity=".8"/>
<path d="M53 74 q7 6 14 0" fill="none" stroke="#C4B4FF" stroke-width="3.5" stroke-linecap="round"/>
<path d="M48 90 v12 M72 90 v10" stroke="#C4B4FF" stroke-width="1.5" opacity=".8"/>
<path d="M48 104 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D" transform="translate(0 -6)"/>
<circle cx="72" cy="102" r="2.2" fill="#FFC83D"/>
<path d="M14 64 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<path d="M102 70 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#FFC83D"/>`

});

/* WILDHEARTS PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

hoppy: `<ellipse cx="46" cy="26" rx="9" ry="21" fill="#F4E8E0" transform="rotate(-8 46 26)"/>
<ellipse cx="46" cy="28" rx="4.5" ry="14" fill="#FFB3C8" transform="rotate(-8 46 28)"/>
<ellipse cx="74" cy="26" rx="9" ry="21" fill="#F4E8E0" transform="rotate(8 74 26)"/>
<ellipse cx="74" cy="28" rx="4.5" ry="14" fill="#FFB3C8" transform="rotate(8 74 28)"/>
<circle cx="60" cy="64" r="27" fill="#F4E8E0"/>
<circle cx="47" cy="60" r="7.5" fill="#fff" stroke="#E4D4C8" stroke-width="1"/><circle cx="48.3" cy="61.5" r="3.8" fill="#4A3A38"/><circle cx="47.2" cy="60.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="60" r="7.5" fill="#fff" stroke="#E4D4C8" stroke-width="1"/><circle cx="74.3" cy="61.5" r="3.8" fill="#4A3A38"/><circle cx="73.2" cy="60.3" r="1.3" fill="#fff"/>
<path d="M56 68 l4 3.5 l4 -3.5 z" fill="#FF8AA8"/>
<rect x="55" y="74" width="5" height="7" rx="1.5" fill="#fff" stroke="#E4D4C8" stroke-width="1"/><rect x="60" y="74" width="5" height="7" rx="1.5" fill="#fff" stroke="#E4D4C8" stroke-width="1"/>
<path d="M30 64 h-11 M32 71 h-9 M90 64 h11 M88 71 h9" stroke="#D8C8BC" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="40" cy="70" rx="4.5" ry="2.8" fill="#FFB3C8" opacity=".95"/><ellipse cx="80" cy="70" rx="4.5" ry="2.8" fill="#FFB3C8" opacity=".95"/>
<circle cx="20" cy="30" r="2.2" fill="#FFC83D"/><circle cx="100" cy="88" r="2.2" fill="#FFC83D"/>`,

pounce: `<defs><radialGradient id="whpn-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F5B878"/><stop offset="1" stop-color="#F0A85C"/></radialGradient></defs>
<path d="M32 42 L36 16 L56 32 z" fill="#F0A85C"/><path d="M37 35 L39 24 L48 31 z" fill="#FFB3C8"/>
<path d="M88 42 L84 16 L64 32 z" fill="#F0A85C"/><path d="M83 35 L81 24 L72 31 z" fill="#FFB3C8"/>
<circle cx="60" cy="60" r="28" fill="url(#whpn-g)"/>
<path d="M52 36 v10 M60 34 v11 M68 36 v10" stroke="#D0884A" stroke-width="3" stroke-linecap="round"/>
<circle cx="47" cy="56" r="8" fill="#fff"/><circle cx="48.4" cy="57.5" r="4" fill="#3A2A15"/><circle cx="47.3" cy="56.3" r="1.4" fill="#fff"/>
<circle cx="73" cy="56" r="8" fill="#fff"/><circle cx="74.4" cy="57.5" r="4" fill="#3A2A15"/><circle cx="73.3" cy="56.3" r="1.4" fill="#fff"/>
<ellipse cx="60" cy="66" rx="3.5" ry="2.5" fill="#FF8AA8"/>
<path d="M54 70 q3 4 6 0 q3 4 6 0" fill="none" stroke="#3A2A15" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="39" cy="65" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/><ellipse cx="81" cy="65" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/>
<circle cx="42" cy="88" r="9" fill="#F5B878"/><path d="M38 84 v-3.5 M42 83 v-4 M46 84 v-3.5" stroke="#D0884A" stroke-width="2.2" stroke-linecap="round"/>
<circle cx="78" cy="88" r="9" fill="#F5B878"/><path d="M74 84 v-3.5 M78 83 v-4 M82 84 v-3.5" stroke="#D0884A" stroke-width="2.2" stroke-linecap="round"/>
<path d="M96 24 l1.8 3.4 3.8 .6 -2.8 2.7 .7 3.8 -3.5 -1.8 -3.5 1.8 .7 -3.8 -2.8 -2.7 3.8 -.6 z" fill="#FFC83D"/>
<circle cx="18" cy="80" r="2.2" fill="#FFC83D"/>`,

echo: `<path d="M54 58 Q26 40 14 52 q-2 12 16 16 q-8 4 -4 12 q12 4 24 -10 z" fill="#5C4A8C"/>
<path d="M66 58 Q94 40 106 52 q2 12 -16 16 q8 4 4 12 q-12 4 -24 -10 z" fill="#5C4A8C"/>
<path d="M36 34 L38 12 L56 28 z" fill="#7A68B8"/><path d="M41 29 L42 19 L50 26 z" fill="#3A2A5C"/>
<path d="M84 34 L82 12 L64 28 z" fill="#7A68B8"/><path d="M79 29 L78 19 L70 26 z" fill="#3A2A5C"/>
<circle cx="60" cy="58" r="25" fill="#7A68B8"/>
<circle cx="49" cy="54" r="8" fill="#fff"/><circle cx="50.4" cy="55.5" r="4" fill="#2B1B48"/><circle cx="49.3" cy="54.3" r="1.4" fill="#fff"/>
<circle cx="71" cy="54" r="8" fill="#fff"/><circle cx="72.4" cy="55.5" r="4" fill="#2B1B48"/><circle cx="71.3" cy="54.3" r="1.4" fill="#fff"/>
<ellipse cx="42" cy="64" rx="4.2" ry="2.6" fill="#FF9EDA" opacity=".85"/><ellipse cx="78" cy="64" rx="4.2" ry="2.6" fill="#FF9EDA" opacity=".85"/>
<path d="M52 68 q8 7 16 0" fill="none" stroke="#2B1B48" stroke-width="3.5" stroke-linecap="round"/>
<path d="M54 70 l2.4 4.4 l3 -3.8 z" fill="#fff"/><path d="M66 70 l-2.4 4.4 l-3 -3.8 z" fill="#fff"/>
<path d="M18 30 a8 8 0 0 1 8 -8 M12 36 a14 14 0 0 1 14 -14" fill="none" stroke="#C4B4FF" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="102" cy="94" r="2.2" fill="#FFC83D"/><circle cx="100" cy="22" r="2" fill="#C4B4FF"/>`,

fawn: `<defs><radialGradient id="whfw-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#E4B88A"/><stop offset="1" stop-color="#D8A878"/></radialGradient></defs>
<ellipse cx="30" cy="38" rx="14" ry="9" fill="#D8A878" transform="rotate(-32 30 38)"/>
<ellipse cx="30" cy="39" rx="8" ry="4.5" fill="#FFC0D8" transform="rotate(-32 30 39)"/>
<ellipse cx="90" cy="38" rx="14" ry="9" fill="#D8A878" transform="rotate(32 90 38)"/>
<ellipse cx="90" cy="39" rx="8" ry="4.5" fill="#FFC0D8" transform="rotate(32 90 39)"/>
<circle cx="60" cy="60" r="28" fill="url(#whfw-g)"/>
<circle cx="46" cy="40" r="2.5" fill="#FBF7F0"/><circle cx="56" cy="36" r="2.5" fill="#FBF7F0"/><circle cx="66" cy="36" r="2.5" fill="#FBF7F0"/><circle cx="74" cy="40" r="2.5" fill="#FBF7F0"/>
<ellipse cx="60" cy="74" rx="15" ry="11" fill="#F0DCC0"/>
<circle cx="47" cy="56" r="7.5" fill="#fff"/><circle cx="48.3" cy="57.5" r="3.8" fill="#4A3020"/><circle cx="47.2" cy="56.3" r="1.3" fill="#fff"/>
<path d="M40 49 q-3 -2 -4 -4 M42 47 q-2 -3 -2 -5" stroke="#4A3020" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<circle cx="73" cy="56" r="7.5" fill="#fff"/><circle cx="74.3" cy="57.5" r="3.8" fill="#4A3020"/><circle cx="73.2" cy="56.3" r="1.3" fill="#fff"/>
<path d="M80 49 q3 -2 4 -4 M78 47 q2 -3 2 -5" stroke="#4A3020" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<path d="M55 72 l5 4 l5 -4 z" fill="#4A3020"/>
<path d="M60 76 v3 M54 82 q6 4 12 0" fill="none" stroke="#4A3020" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="39" cy="66" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/><ellipse cx="81" cy="66" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/>
<circle cx="94" cy="22" r="4" fill="#FF8AB8"/><circle cx="99" cy="18" r="3" fill="#FFC0D8"/><circle cx="99" cy="26" r="3" fill="#FFC0D8"/>
<circle cx="20" cy="88" r="2.2" fill="#FFC83D"/>`,

ottie: `<defs><radialGradient id="whot-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#AC8860"/><stop offset="1" stop-color="#9C7850"/></radialGradient></defs>
<circle cx="38" cy="34" r="8" fill="#9C7850"/><circle cx="82" cy="34" r="8" fill="#9C7850"/>
<circle cx="38" cy="34" r="3.5" fill="#C8A87C"/><circle cx="82" cy="34" r="3.5" fill="#C8A87C"/>
<circle cx="60" cy="58" r="28" fill="url(#whot-g)"/>
<ellipse cx="60" cy="70" rx="17" ry="13" fill="#D8BC94"/>
<circle cx="47" cy="54" r="7.5" fill="#fff"/><circle cx="48.3" cy="55.5" r="3.8" fill="#3A2A15"/><circle cx="47.2" cy="54.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="54" r="7.5" fill="#fff"/><circle cx="74.3" cy="55.5" r="3.8" fill="#3A2A15"/><circle cx="73.2" cy="54.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="66" rx="4" ry="3" fill="#3A2A15"/>
<path d="M54 72 q3 4 6 0 q3 4 6 0" fill="none" stroke="#3A2A15" stroke-width="2.5" stroke-linecap="round"/>
<path d="M32 62 h-11 M34 68 h-9 M88 62 h11 M86 68 h9" stroke="#C8A87C" stroke-width="2" stroke-linecap="round"/>
<circle cx="60" cy="92" r="10" fill="#E8A0B8"/>
<path d="M53 88 q7 -4 14 0 M52 92 h16 M54 96 q6 3 12 0" fill="none" stroke="#C87890" stroke-width="1.8" stroke-linecap="round"/>
<path d="M10 108 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="20" cy="26" r="2.2" fill="#FFC83D"/><circle cx="100" cy="80" r="2.5" fill="none" stroke="#8ADAFF" stroke-width="2"/>`,

monarch: `<path d="M54 56 Q22 20 10 40 q-8 16 20 28 q14 6 24 -4 z" fill="#F0862A" stroke="#5C3A1E" stroke-width="3" stroke-linejoin="round"/>
<path d="M66 56 Q98 20 110 40 q8 16 -20 28 q-14 6 -24 -4 z" fill="#F0862A" stroke="#5C3A1E" stroke-width="3" stroke-linejoin="round"/>
<path d="M52 66 q-20 0 -22 18 q0 12 12 8 q10 -4 12 -18 z" fill="#F0A85C" stroke="#5C3A1E" stroke-width="3" stroke-linejoin="round"/>
<path d="M68 66 q20 0 22 18 q0 12 -12 8 q-10 -4 -12 -18 z" fill="#F0A85C" stroke="#5C3A1E" stroke-width="3" stroke-linejoin="round"/>
<path d="M46 40 L28 32 M44 50 L24 48" stroke="#5C3A1E" stroke-width="2.5" stroke-linecap="round"/>
<path d="M74 40 L92 32 M76 50 L96 48" stroke="#5C3A1E" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="20" cy="56" r="2" fill="#fff"/><circle cx="30" cy="62" r="2" fill="#fff"/><circle cx="100" cy="56" r="2" fill="#fff"/><circle cx="90" cy="62" r="2" fill="#fff"/>
<path d="M52 32 q-6 -10 -14 -12 M68 32 q6 -10 14 -12" fill="none" stroke="#3A2A15" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="37" cy="19" r="2.5" fill="#3A2A15"/><circle cx="83" cy="19" r="2.5" fill="#3A2A15"/>
<circle cx="60" cy="44" r="15" fill="#4A3626"/>
<ellipse cx="60" cy="76" rx="10" ry="22" fill="#4A3626"/>
<path d="M52 70 h16 M52 78 h16 M54 86 h12" stroke="#6E543C" stroke-width="2" stroke-linecap="round"/>
<circle cx="54" cy="42" r="5" fill="#fff"/><circle cx="54.9" cy="43" r="2.6" fill="#14100A"/><circle cx="54.2" cy="42.2" r="1" fill="#fff"/>
<circle cx="66" cy="42" r="5" fill="#fff"/><circle cx="66.9" cy="43" r="2.6" fill="#14100A"/><circle cx="66.2" cy="42.2" r="1" fill="#fff"/>
<path d="M56 51 q4 3 8 0" fill="none" stroke="#E8C8A0" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="16" cy="90" r="2.2" fill="#FFC83D"/><circle cx="104" cy="88" r="2.2" fill="#FFC83D"/>`,

swan: `<ellipse cx="60" cy="88" rx="34" ry="20" fill="#FBF7F0"/>
<path d="M34 82 q-6 -8 0 -14 M42 78 q-5 -7 0 -13 M86 82 q6 -8 0 -14 M78 78 q5 -7 0 -13" fill="none" stroke="#E8E0D4" stroke-width="3" stroke-linecap="round"/>
<path d="M46 88 q-2 -26 6 -40 q4 -8 8 -8 q4 0 8 8 q8 14 6 40 z" fill="#FBF7F0"/>
<circle cx="60" cy="34" r="16" fill="#FBF7F0"/>
<path d="M52 44 q8 4 16 0" fill="none" stroke="#E8E0D4" stroke-width="2" stroke-linecap="round"/>
<circle cx="54" cy="32" r="5.5" fill="#fff" stroke="#E8E0D4" stroke-width="1"/><circle cx="55" cy="33" r="2.8" fill="#2B2B3E"/><circle cx="54.2" cy="32.2" r="1" fill="#fff"/>
<circle cx="66" cy="32" r="5.5" fill="#fff" stroke="#E8E0D4" stroke-width="1"/><circle cx="67" cy="33" r="2.8" fill="#2B2B3E"/><circle cx="66.2" cy="32.2" r="1" fill="#fff"/>
<path d="M60 38 q-5 0 -5 4 q2 4 5 4 q3 0 5 -4 q0 -4 -5 -4 z" fill="#F0A82A"/>
<ellipse cx="46" cy="38" rx="3.8" ry="2.4" fill="#FFB3C8" opacity=".9"/><ellipse cx="74" cy="38" rx="3.8" ry="2.4" fill="#FFB3C8" opacity=".9"/>
<path d="M8 106 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<path d="M96 20 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="20" cy="40" r="2.2" fill="#FFC83D"/>`,

howl: `<circle cx="84" cy="30" r="20" fill="#EAE4F5"/>
<circle cx="78" cy="26" r="3.5" fill="#D8CFEA"/><circle cx="90" cy="34" r="2.8" fill="#D8CFEA"/><circle cx="86" cy="22" r="2" fill="#D8CFEA"/>
<path d="M32 42 L34 14 L56 32 z" fill="#8A94A8"/><path d="M37 35 L38 22 L48 30 z" fill="#4A5568"/>
<path d="M88 42 L86 14 L64 32 z" fill="#8A94A8"/><path d="M83 35 L82 22 L72 30 z" fill="#4A5568"/>
<defs><radialGradient id="whhw-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A0AABC"/><stop offset="1" stop-color="#8A94A8"/></radialGradient></defs>
<circle cx="60" cy="60" r="28" fill="url(#whhw-g)"/>
<path d="M36 74 q6 16 24 16 q18 0 24 -16 q-10 6 -24 6 q-14 0 -24 -6 z" fill="#E4E8F0"/>
<path d="M40 48 q6 -4 11 -1 M80 48 q-6 -4 -11 -1" stroke="#4A5568" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="47" cy="56" r="7.5" fill="#fff"/><circle cx="48.3" cy="57.5" r="3.8" fill="#2B3040"/><circle cx="47.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="56" r="7.5" fill="#fff"/><circle cx="74.3" cy="57.5" r="3.8" fill="#2B3040"/><circle cx="73.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="68" rx="4" ry="3" fill="#2B3040"/>
<path d="M54 74 q3 4 6 0 q3 4 6 0" fill="none" stroke="#2B3040" stroke-width="2.5" stroke-linecap="round"/>
<path d="M53 76 l2.4 4 l2.8 -3.4 z" fill="#fff"/>
<ellipse cx="39" cy="65" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".7"/><ellipse cx="81" cy="65" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".7"/>
<circle cx="16" cy="30" r="1.8" fill="#fff"/><circle cx="24" cy="94" r="2.2" fill="#FFC83D"/><circle cx="104" cy="66" r="1.8" fill="#fff"/>`,

blaze: `<path d="M24 64 q-12 -6 -12 -20 q10 2 14 10 q-2 -12 6 -20 q6 10 2 22 z" fill="#FFC23D"/>
<path d="M96 64 q12 -6 12 -20 q-10 2 -14 10 q2 -12 -6 -20 q-6 10 -2 22 z" fill="#FFC23D"/>
<path d="M30 44 L32 16 L56 32 z" fill="#F0742A"/><path d="M35 37 L36 24 L47 31 z" fill="#5C2A10"/>
<path d="M90 44 L88 16 L64 32 z" fill="#F0742A"/><path d="M85 37 L84 24 L73 31 z" fill="#5C2A10"/>
<defs><radialGradient id="whbz-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FF8A48"/><stop offset="1" stop-color="#F0742A"/></radialGradient></defs>
<circle cx="60" cy="60" r="28" fill="url(#whbz-g)"/>
<path d="M36 74 q6 16 24 16 q18 0 24 -16 q-10 6 -24 6 q-14 0 -24 -6 z" fill="#FFEDD8"/>
<circle cx="47" cy="56" r="7.5" fill="#fff"/><circle cx="48.3" cy="57.5" r="3.8" fill="#5C2A10"/><circle cx="47.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="56" r="7.5" fill="#fff"/><circle cx="74.3" cy="57.5" r="3.8" fill="#5C2A10"/><circle cx="73.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="60" cy="68" rx="3.5" ry="2.5" fill="#5C2A10"/>
<path d="M54 73 q3 4 6 0 q3 4 6 0" fill="none" stroke="#5C2A10" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="39" cy="65" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/><ellipse cx="81" cy="65" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/>
<circle cx="20" cy="92" r="2.5" fill="#FF8A3C"/><circle cx="102" cy="90" r="2" fill="#FFC23D"/>`,

pegasus: `<defs><radialGradient id="whpg-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFE49B" stop-opacity=".5"/><stop offset="1" stop-color="#FFE49B" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#whpg-a)"/>
<path d="M34 66 Q6 58 4 36 q14 -2 22 8 q-2 -10 6 -16 q8 8 8 22 z" fill="#FBF7F0" stroke="#E8DCC8" stroke-width="2"/>
<path d="M86 66 Q114 58 116 36 q-14 -2 -22 8 q2 -10 -6 -16 q-8 8 -8 22 z" fill="#FBF7F0" stroke="#E8DCC8" stroke-width="2"/>
<path d="M40 34 L44 16 L56 30 z" fill="#FBF7F0"/><path d="M80 34 L76 16 L64 30 z" fill="#FBF7F0"/>
<path d="M74 32 q14 2 16 16 q-2 14 -12 18 q4 -10 0 -18 q-4 -8 -12 -10 z" fill="#F0C040"/>
<circle cx="58" cy="60" r="27" fill="#FBF7F0"/>
<ellipse cx="58" cy="76" rx="15" ry="11" fill="#F0E4D4"/>
<ellipse cx="53" cy="74" rx="2" ry="3" fill="#8A7458"/><ellipse cx="63" cy="74" rx="2" ry="3" fill="#8A7458"/>
<circle cx="46" cy="54" r="7.5" fill="#fff" stroke="#E8DCC8" stroke-width="1"/><circle cx="47.3" cy="55.5" r="3.8" fill="#4A3A68"/><circle cx="46.2" cy="54.3" r="1.3" fill="#fff"/>
<path d="M39 46 q-3 -2 -4 -4 M41 44 q-2 -3 -2 -5" stroke="#4A3A68" stroke-width="1.8" stroke-linecap="round" fill="none"/>
<circle cx="70" cy="54" r="7.5" fill="#fff" stroke="#E8DCC8" stroke-width="1"/><circle cx="71.3" cy="55.5" r="3.8" fill="#4A3A68"/><circle cx="70.2" cy="54.3" r="1.3" fill="#fff"/>
<path d="M54 84 q4 3 8 0" fill="none" stroke="#8A7458" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="38" cy="64" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/><ellipse cx="78" cy="64" rx="4.2" ry="2.6" fill="#FFB3C8" opacity=".9"/>
<path d="M16 84 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M100 88 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>
<circle cx="22" cy="20" r="2.2" fill="#FFC83D"/>`

});

/* LEGENDS PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

squatch: `<defs><radialGradient id="lgsq-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#9A7850"/><stop offset="1" stop-color="#7C5E3C"/></radialGradient></defs>
<circle cx="60" cy="60" r="31" fill="url(#lgsq-g)"/>
<path d="M34 40 q-6 -4 -8 -10 M44 32 q-4 -6 -4 -12 M60 28 q0 -7 -2 -12 M76 32 q4 -6 4 -12 M86 40 q6 -4 8 -10" stroke="#7C5E3C" stroke-width="5" stroke-linecap="round"/>
<ellipse cx="60" cy="66" rx="20" ry="17" fill="#C9A878"/>
<path d="M42 52 q18 -8 36 0" fill="none" stroke="#5C4426" stroke-width="4" stroke-linecap="round"/>
<circle cx="49" cy="60" r="6.5" fill="#fff"/><circle cx="50.2" cy="61.4" r="3.4" fill="#2B2015"/><circle cx="49.2" cy="60.3" r="1.2" fill="#fff"/>
<circle cx="71" cy="60" r="6.5" fill="#fff"/><circle cx="72.2" cy="61.4" r="3.4" fill="#2B2015"/><circle cx="71.2" cy="60.3" r="1.2" fill="#fff"/>
<ellipse cx="60" cy="70" rx="5" ry="3.5" fill="#8A6844"/>
<path d="M53 78 q7 5 14 0" fill="none" stroke="#5C4426" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="42" cy="69" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/><ellipse cx="78" cy="69" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/>
<path d="M88 90 q6 2 8 8 M92 86 q6 0 10 4" stroke="#7BC24E" stroke-width="3" stroke-linecap="round" fill="none"/>
<circle cx="20" cy="30" r="2.2" fill="#FFC83D"/><circle cx="102" cy="46" r="2.2" fill="#FFC83D"/>`,

nessie: `<defs><radialGradient id="lgns-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#6EC494"/><stop offset="1" stop-color="#4A9E6E"/></radialGradient></defs>
<path d="M40 96 q-6 -44 8 -64" fill="none" stroke="#4A9E6E" stroke-width="20" stroke-linecap="round"/>
<path d="M64 88 a16 14 0 0 1 32 0 z" fill="#4A9E6E"/>
<path d="M96 92 a10 9 0 0 1 20 0 z" fill="#4A9E6E" opacity=".9"/>
<ellipse cx="52" cy="26" rx="16" ry="13" fill="url(#lgns-g)"/>
<path d="M44 14 l3 -7 l4 6 M52 12 l3 -6 l4 6" fill="none" stroke="#4A9E6E" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="46" cy="24" r="6" fill="#fff"/><circle cx="47" cy="25.2" r="3" fill="#14402A"/><circle cx="46.2" cy="24.2" r="1.1" fill="#fff"/>
<circle cx="59" cy="24" r="6" fill="#fff"/><circle cx="60" cy="25.2" r="3" fill="#14402A"/><circle cx="59.2" cy="24.2" r="1.1" fill="#fff"/>
<ellipse cx="40" cy="32" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/><ellipse cx="66" cy="32" rx="3.8" ry="2.4" fill="#FF9EB8" opacity=".85"/>
<path d="M47 34 q6 5 12 0" fill="none" stroke="#14402A" stroke-width="3" stroke-linecap="round"/>
<circle cx="42" cy="58" r="3" fill="#3A8258" opacity=".8"/><circle cx="38" cy="76" r="3.2" fill="#3A8258" opacity=".8"/>
<path d="M8 102 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="94" cy="70" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="18" cy="34" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>`,

griff: `<defs><radialGradient id="lggf-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F5D080"/><stop offset="1" stop-color="#E8B44E"/></radialGradient></defs>
<path d="M34 34 L28 12 L48 24 z" fill="#C89030"/>
<path d="M86 34 L92 12 L72 24 z" fill="#C89030"/>
<circle cx="60" cy="58" r="29" fill="url(#lggf-g)"/>
<path d="M34 76 q8 12 26 12 q18 0 26 -12 q-12 5 -26 5 q-14 0 -26 -5 z" fill="#FBF0D8"/>
<path d="M40 46 q6 -5 12 -2 M80 46 q-6 -5 -12 -2" stroke="#8A5B10" stroke-width="3.5" fill="none" stroke-linecap="round"/>
<circle cx="47" cy="55" r="7.5" fill="#fff"/><circle cx="48.3" cy="56.5" r="3.8" fill="#5C3A08"/><circle cx="47.2" cy="55.3" r="1.3" fill="#fff"/>
<circle cx="73" cy="55" r="7.5" fill="#fff"/><circle cx="74.3" cy="56.5" r="3.8" fill="#5C3A08"/><circle cx="73.2" cy="55.3" r="1.3" fill="#fff"/>
<path d="M54 62 q6 -3 12 0 l-4 9 q-2 3 -4 0 z" fill="#F0A82A" stroke="#C88930" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="39" cy="64" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/><ellipse cx="81" cy="64" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".8"/>
<path d="M28 96 q6 -8 16 -8 M92 96 q-6 -8 -16 -8" stroke="#C89030" stroke-width="4" stroke-linecap="round" fill="none"/>
<circle cx="18" cy="36" r="2.2" fill="#FFC83D"/><circle cx="102" cy="40" r="2.2" fill="#FFC83D"/>`,

golem: `<defs><radialGradient id="lggm-g" cx="50%" cy="35%" r="80%"><stop offset="0" stop-color="#A4AEBE"/><stop offset="1" stop-color="#78849A"/></radialGradient></defs>
<path d="M32 28 L88 24 L98 58 L88 94 L34 92 L22 56 z" fill="url(#lggm-g)" stroke="#525E74" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M88 24 L82 44 L98 58 M34 92 l8 -12" fill="none" stroke="#525E74" stroke-width="2" opacity=".6"/>
<path d="M28 36 q10 -6 20 -3 q-3 8 -13 9 z" fill="#7BC24E"/>
<circle cx="90" cy="78" r="3" fill="#7BC24E"/>
<rect x="38" y="50" width="16" height="12" rx="4" fill="#12141E"/><rect x="66" y="50" width="16" height="12" rx="4" fill="#12141E"/>
<circle cx="46" cy="56" r="3.5" fill="#36D1FF"/><circle cx="74" cy="56" r="3.5" fill="#36D1FF"/>
<circle cx="46" cy="56" r="6" fill="#36D1FF" opacity=".3"/><circle cx="74" cy="56" r="6" fill="#36D1FF" opacity=".3"/>
<path d="M48 76 h24" stroke="#12141E" stroke-width="4" stroke-linecap="round"/>
<path d="M56 76 v5 M64 76 v5" stroke="#12141E" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="34" cy="68" rx="4" ry="2.5" fill="#FF9EB8" opacity=".55"/><ellipse cx="86" cy="68" rx="4" ry="2.5" fill="#FF9EB8" opacity=".55"/>
<ellipse cx="18" cy="100" rx="6" ry="4" fill="#8A94A8"/><ellipse cx="102" cy="100" rx="7" ry="4.5" fill="#8A94A8"/>
<circle cx="106" cy="26" r="2.2" fill="#36D1FF"/>`,

cyclo: `<defs><radialGradient id="lgcy-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#C89AE8"/><stop offset="1" stop-color="#A874D0"/></radialGradient></defs>
<path d="M54 26 q-2 -12 6 -18 q8 6 6 18 q-6 3 -12 0 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2"/>
<circle cx="60" cy="62" r="30" fill="url(#lgcy-g)"/>
<circle cx="36" cy="58" r="5" fill="#8A5CB0"/><circle cx="84" cy="58" r="5" fill="#8A5CB0"/>
<circle cx="60" cy="56" r="14" fill="#fff"/>
<circle cx="62" cy="58" r="7" fill="#3A1E5C"/><circle cx="59.5" cy="55.5" r="2.4" fill="#fff"/>
<path d="M44 40 q16 -8 32 0" fill="none" stroke="#5C3A78" stroke-width="3.5" stroke-linecap="round"/>
<ellipse cx="42" cy="72" rx="4.5" ry="2.8" fill="#FF9EDA" opacity=".9"/><ellipse cx="78" cy="72" rx="4.5" ry="2.8" fill="#FF9EDA" opacity=".9"/>
<path d="M50 78 q10 8 20 0" fill="none" stroke="#3A1E5C" stroke-width="3.5" stroke-linecap="round"/>
<path d="M54 80 l3 5 l3.6 -4.4 z" fill="#fff"/>
<circle cx="18" cy="42" r="2.2" fill="#FFC83D"/><circle cx="102" cy="90" r="2.2" fill="#FFC83D"/>`,

fang: `<defs><radialGradient id="lgfg-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#F0EAF8"/><stop offset="1" stop-color="#DCD2EC"/></radialGradient></defs>
<path d="M30 88 L16 106 q22 8 30 -6 z" fill="#2B2B3E"/>
<path d="M90 88 L104 106 q-22 8 -30 -6 z" fill="#2B2B3E"/>
<path d="M32 84 q-8 10 -6 18 h68 q2 -8 -6 -18 z" fill="#4A3A68"/>
<path d="M34 86 q-6 8 -5 14 h20 z" fill="#C43D5A"/>
<path d="M86 86 q6 8 5 14 h-20 z" fill="#C43D5A"/>
<circle cx="60" cy="56" r="28" fill="url(#lgfg-g)"/>
<path d="M32 48 q0 -22 28 -22 q28 0 28 22 q-8 -10 -18 -10 l4 8 q-6 -5 -14 -5 q-8 0 -14 5 l4 -8 q-10 0 -18 10 z" fill="#2B2B3E"/>
<path d="M42 52 q5 -4 11 -2 M78 52 q-5 -4 -11 -2" stroke="#3A2A5C" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="48" cy="58" r="7" fill="#fff"/><circle cx="49.2" cy="59.4" r="3.6" fill="#8A2038"/><circle cx="48.2" cy="58.3" r="1.2" fill="#fff"/>
<circle cx="72" cy="58" r="7" fill="#fff"/><circle cx="73.2" cy="59.4" r="3.6" fill="#8A2038"/><circle cx="72.2" cy="58.3" r="1.2" fill="#fff"/>
<ellipse cx="42" cy="66" rx="4" ry="2.5" fill="#E8A0B8" opacity=".8"/><ellipse cx="78" cy="66" rx="4" ry="2.5" fill="#E8A0B8" opacity=".8"/>
<path d="M52 71 q8 6 16 0" fill="none" stroke="#3A2A5C" stroke-width="3" stroke-linecap="round"/>
<path d="M54 72.5 l2.6 6 l3.2 -5 z" fill="#fff"/><path d="M66 72.5 l-2.6 6 l-3.2 -5 z" fill="#fff"/>
<path d="M20 30 L24 24 L28 30 L24 27 z" fill="#2B2B3E"/>
<circle cx="100" cy="28" r="2" fill="#C4B4FF"/><circle cx="16" cy="70" r="2" fill="#C4B4FF"/>`,

kraken: `<defs><radialGradient id="lgkr-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#3E8EAE"/><stop offset="1" stop-color="#2E6E8F"/></radialGradient></defs>
<path d="M24 96 q-10 -2 -12 -12 q8 -2 12 4 q-2 -10 4 -16 q6 6 4 16 z" fill="#2E6E8F"/>
<path d="M96 96 q10 -2 12 -12 q-8 -2 -12 4 q2 -10 -4 -16 q-6 6 -4 16 z" fill="#2E6E8F"/>
<path d="M38 100 q-4 -14 6 -22 q8 8 4 22 z" fill="#3E8EAE"/>
<path d="M82 100 q4 -14 -6 -22 q-8 8 -4 22 z" fill="#3E8EAE"/>
<ellipse cx="60" cy="56" rx="30" ry="28" fill="url(#lgkr-g)"/>
<path d="M42 82 q-2 12 4 18 M60 84 v20 M78 82 q2 12 -4 18" fill="none" stroke="#2E6E8F" stroke-width="9" stroke-linecap="round"/>
<circle cx="47" cy="52" r="8.5" fill="#fff"/><circle cx="48.5" cy="53.5" r="4.2" fill="#0F2A3A"/><circle cx="47.3" cy="52.3" r="1.5" fill="#fff"/>
<circle cx="73" cy="52" r="8.5" fill="#fff"/><circle cx="74.5" cy="53.5" r="4.2" fill="#0F2A3A"/><circle cx="73.3" cy="52.3" r="1.5" fill="#fff"/>
<ellipse cx="38" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".7"/><ellipse cx="82" cy="62" rx="4.5" ry="2.8" fill="#FF9EB8" opacity=".7"/>
<path d="M50 66 q10 9 20 0" fill="none" stroke="#0F2A3A" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="52" cy="94" r="2" fill="#8ADAFF"/><circle cx="68" cy="96" r="2" fill="#8ADAFF"/>
<circle cx="98" cy="30" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="20" cy="36" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<path d="M8 108 q10 -7 20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>`,

mino: `<defs><radialGradient id="lgmn-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#9A7850"/><stop offset="1" stop-color="#7C5E3C"/></radialGradient></defs>
<path d="M28 42 q-16 -4 -18 -20 q12 -4 20 4 q6 6 4 16 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2.5"/>
<path d="M92 42 q16 -4 18 -20 q-12 -4 -20 4 q-6 6 -4 16 z" fill="#FFF3D6" stroke="#E0CFA8" stroke-width="2.5"/>
<circle cx="38" cy="34" r="7" fill="#7C5E3C"/><circle cx="82" cy="34" r="7" fill="#7C5E3C"/>
<circle cx="60" cy="58" r="29" fill="url(#lgmn-g)"/>
<path d="M42 30 q4 -6 10 -6 M78 30 q-4 -6 -10 -6" stroke="#5C4426" stroke-width="4" fill="none" stroke-linecap="round"/>
<path d="M40 48 l11 4 M80 48 l-11 4" stroke="#2B2015" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="47" cy="56" r="7" fill="#fff"/><circle cx="48.2" cy="57.4" r="3.6" fill="#2B2015"/><circle cx="47.2" cy="56.3" r="1.2" fill="#fff"/>
<circle cx="73" cy="56" r="7" fill="#fff"/><circle cx="74.2" cy="57.4" r="3.6" fill="#2B2015"/><circle cx="73.2" cy="56.3" r="1.2" fill="#fff"/>
<ellipse cx="60" cy="74" rx="17" ry="12" fill="#C9A878"/>
<ellipse cx="53" cy="72" rx="2.5" ry="3.5" fill="#5C4426"/><ellipse cx="67" cy="72" rx="2.5" ry="3.5" fill="#5C4426"/>
<path d="M54 80 q6 4 12 0" fill="none" stroke="#5C4426" stroke-width="2.5" stroke-linecap="round"/>
<path d="M55 84 a5 5 0 0 0 10 0" fill="none" stroke="#E8A21B" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="38" cy="64" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/><ellipse cx="82" cy="64" rx="4" ry="2.5" fill="#FF9EB8" opacity=".7"/>
<circle cx="18" cy="80" r="2.2" fill="#FFC83D"/><circle cx="102" cy="78" r="2.2" fill="#FFC83D"/>`,

phantom: `<defs><radialGradient id="lgph-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#8A5CE8" stop-opacity=".35"/><stop offset="1" stop-color="#8A5CE8" stop-opacity="0"/></radialGradient></defs>
<circle cx="60" cy="58" r="50" fill="url(#lgph-a)"/>
<path d="M30 100 v-42 q0 -30 30 -30 q30 0 30 30 v42 l-10 -9 l-10 9 l-10 -9 l-10 9 z" fill="#3A3450"/>
<path d="M38 40 q-4 8 -2 16 M82 40 q4 8 2 16" stroke="#2B2640" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="60" cy="60" rx="19" ry="16" fill="#14102A"/>
<circle cx="52" cy="58" r="5.5" fill="#C4B4FF"/><circle cx="51" cy="56.8" r="1.6" fill="#fff"/>
<circle cx="68" cy="58" r="5.5" fill="#C4B4FF"/><circle cx="67" cy="56.8" r="1.6" fill="#fff"/>
<path d="M54 68 q6 4 12 0" fill="none" stroke="#C4B4FF" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="26" cy="92" r="4" fill="none" stroke="#8A8AA6" stroke-width="2.5"/><circle cx="20" cy="99" r="4" fill="none" stroke="#8A8AA6" stroke-width="2.5"/><circle cx="15" cy="106" r="4" fill="none" stroke="#8A8AA6" stroke-width="2.5"/>
<circle cx="98" cy="30" r="2" fill="#C4B4FF"/><circle cx="20" cy="30" r="1.8" fill="#C4B4FF"/><circle cx="104" cy="86" r="2.2" fill="#C4B4FF"/>`,

hydra: `<defs><radialGradient id="lghy-a" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7CFFB2" stop-opacity=".3"/><stop offset="1" stop-color="#7CFFB2" stop-opacity="0"/></radialGradient><radialGradient id="lghy-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#6EC494"/><stop offset="1" stop-color="#3A8258"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#lghy-a)"/>
<path d="M28 82 q-6 -20 4 -34" fill="none" stroke="#3A8258" stroke-width="13" stroke-linecap="round"/>
<path d="M92 82 q6 -20 -4 -34" fill="none" stroke="#3A8258" stroke-width="13" stroke-linecap="round"/>
<ellipse cx="31" cy="44" rx="11" ry="9" fill="#3A8258"/>
<path d="M26 34 l2 -5 l3 4 M33 33 l2 -5 l3 4" fill="none" stroke="#3A8258" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="27" cy="43" r="3.5" fill="#fff"/><circle cx="27.7" cy="43.8" r="1.8" fill="#14402A"/>
<circle cx="36" cy="43" r="3.5" fill="#fff"/><circle cx="36.7" cy="43.8" r="1.8" fill="#14402A"/>
<path d="M28 49 q4 3 8 0" fill="none" stroke="#14402A" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="89" cy="44" rx="11" ry="9" fill="#3A8258"/>
<path d="M84 34 l2 -5 l3 4 M91 33 l2 -5 l3 4" fill="none" stroke="#3A8258" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="85" cy="43" r="3.5" fill="#fff"/><circle cx="85.7" cy="43.8" r="1.8" fill="#14402A"/>
<circle cx="94" cy="43" r="3.5" fill="#fff"/><circle cx="94.7" cy="43.8" r="1.8" fill="#14402A"/>
<path d="M86 49 q4 3 8 0" fill="none" stroke="#14402A" stroke-width="2" stroke-linecap="round"/>
<ellipse cx="60" cy="92" rx="30" ry="16" fill="#3A8258"/>
<path d="M60 74 v-30" fill="none" stroke="#3A8258" stroke-width="16" stroke-linecap="round"/>
<circle cx="60" cy="38" r="17" fill="url(#lghy-g)"/>
<path d="M50 24 l3 -8 l4 6 M57 21 l3 -7 l4 6 M64 23 l4 -7 l3 7" fill="none" stroke="#3A8258" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="53" cy="36" r="6" fill="#fff"/><circle cx="54" cy="37.2" r="3" fill="#14402A"/><circle cx="53.2" cy="36.2" r="1.1" fill="#fff"/>
<circle cx="67" cy="36" r="6" fill="#fff"/><circle cx="68" cy="37.2" r="3" fill="#14402A"/><circle cx="67.2" cy="36.2" r="1.1" fill="#fff"/>
<ellipse cx="46" cy="43" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/><ellipse cx="74" cy="43" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".85"/>
<path d="M54 47 q6 5 12 0" fill="none" stroke="#14402A" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="60" cy="98" rx="16" ry="7" fill="#6EC494" opacity=".6"/>
<path d="M14 62 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#7CFFB2"/>
<path d="M102 66 l1.2 3.6 3.6 1.2 -3.6 1.2 -1.2 3.6 -1.2 -3.6 -3.6 -1.2 3.6 -1.2 z" fill="#7CFFB2"/>`

});

/* TURBO PACK */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {

rally: `<path d="M8 66 h14 M4 76 h12 M10 86 h10" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round"/>
<circle cx="40" cy="88" r="12" fill="#2B2B33"/><circle cx="40" cy="88" r="5" fill="#8A94A8"/>
<circle cx="80" cy="88" r="12" fill="#2B2B33"/><circle cx="80" cy="88" r="5" fill="#8A94A8"/>
<path d="M26 84 q-4 -26 10 -34 h48 q14 8 10 34 q-2 6 -8 6 h-52 q-6 0 -8 -6 z" fill="#E0483C"/>
<path d="M38 50 q4 -10 10 -12 h24 q6 2 10 12 z" fill="#E0483C"/>
<path d="M42 50 q3 -7 8 -9 h20 q5 2 8 9 z" fill="#9ADAF7"/>
<circle cx="52" cy="46" r="4" fill="#fff"/><circle cx="52.8" cy="46.8" r="2.2" fill="#2B1B3E"/>
<circle cx="68" cy="46" r="4" fill="#fff"/><circle cx="68.8" cy="46.8" r="2.2" fill="#2B1B3E"/>
<circle cx="60" cy="68" r="11" fill="#fff"/>
<path d="M60 61 l1.8 3.6 4 .6 -2.9 2.8 .7 4 -3.6 -1.9 -3.6 1.9 .7 -4 -2.9 -2.8 4 -.6 z" fill="#E0483C"/>
<circle cx="34" cy="64" r="4.5" fill="#FFE49B"/><circle cx="86" cy="64" r="4.5" fill="#FFE49B"/>
<path d="M30 78 h12 M78 78 h12" stroke="#B03028" stroke-width="3" stroke-linecap="round"/>
<circle cx="104" cy="30" r="2.2" fill="#FFC83D"/><circle cx="20" cy="28" r="2.2" fill="#FFC83D"/>`,

turbo: `<path d="M28 56 Q4 48 2 30 q12 -2 20 6 q-2 -10 6 -16 q8 8 8 20 z" fill="#F0A82A"/>
<path d="M92 56 Q116 48 118 30 q-12 -2 -20 6 q2 -10 -6 -16 q-8 8 -8 20 z" fill="#F0A82A"/>
<circle cx="60" cy="62" r="30" fill="#2E3450"/>
<path d="M60 34 v8 M83 44 l-6 5 M88 62 h-8 M83 80 l-6 -5 M60 90 v-8 M37 80 l6 -5 M32 62 h8 M37 44 l6 5" stroke="#4A5068" stroke-width="4" stroke-linecap="round"/>
<circle cx="60" cy="62" r="15" fill="#C9C9DD"/>
<circle cx="52" cy="58" r="4.5" fill="#fff" stroke="#9C9CB8" stroke-width="1"/><circle cx="52.8" cy="58.8" r="2.4" fill="#2B2B3E"/><circle cx="52.2" cy="58.2" r=".9" fill="#fff"/>
<circle cx="68" cy="58" r="4.5" fill="#fff" stroke="#9C9CB8" stroke-width="1"/><circle cx="68.8" cy="58.8" r="2.4" fill="#2B2B3E"/><circle cx="68.2" cy="58.2" r=".9" fill="#fff"/>
<path d="M55 67 q5 4 10 0" fill="none" stroke="#2B2B3E" stroke-width="2.5" stroke-linecap="round"/>
<ellipse cx="47" cy="63" rx="3" ry="2" fill="#FF9EB8" opacity=".85"/><ellipse cx="73" cy="63" rx="3" ry="2" fill="#FF9EB8" opacity=".85"/>
<path d="M14 92 h12 M20 100 h10 M90 96 h14" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round"/>
<circle cx="106" cy="80" r="2.2" fill="#FFC83D"/>`,

crash: `<path d="M94 22 l3 7 7 -2 -4 6 6 4 -7 2 2 7 -6 -4 -4 6 -2 -7 -7 2 4 -6 -6 -4 7 -2 -2 -7 6 4 z" fill="#FFC23D"/>
<circle cx="38" cy="82" r="17" fill="#2B2B33"/><circle cx="38" cy="82" r="7" fill="#8A94A8"/>
<path d="M28 70 l5 5 M48 70 l-5 5 M28 94 l5 -5 M48 94 l-5 -5" stroke="#12141E" stroke-width="3" stroke-linecap="round"/>
<circle cx="82" cy="82" r="17" fill="#2B2B33"/><circle cx="82" cy="82" r="7" fill="#8A94A8"/>
<path d="M72 70 l5 5 M92 70 l-5 5 M72 94 l5 -5 M92 94 l-5 -5" stroke="#12141E" stroke-width="3" stroke-linecap="round"/>
<path d="M30 66 q-2 -12 8 -14 h44 q10 2 8 14 l-2 6 h-56 z" fill="#3B6FE0"/>
<path d="M40 52 q4 -12 12 -14 h16 q8 2 12 14 z" fill="#3B6FE0"/>
<path d="M44 52 q3 -8 9 -10 h14 q6 2 9 10 z" fill="#9ADAF7"/>
<circle cx="53" cy="47" r="4" fill="#fff"/><circle cx="53.8" cy="47.8" r="2.2" fill="#12234A"/>
<circle cx="67" cy="47" r="4" fill="#fff"/><circle cx="67.8" cy="47.8" r="2.2" fill="#12234A"/>
<path d="M56 50 q4 3 8 0" fill="none" stroke="#12234A" stroke-width="2" stroke-linecap="round"/>
<path d="M38 60 h10 M72 60 h10" stroke="#2C54B0" stroke-width="3" stroke-linecap="round"/>
<circle cx="16" cy="36" r="2.2" fill="#FFC83D"/>`,

airtime: `<g opacity=".9"><circle cx="96" cy="22" r="5" fill="#fff"/><circle cx="104" cy="24" r="6.5" fill="#fff"/><circle cx="112" cy="22" r="4.5" fill="#fff"/></g>
<path d="M14 96 h16 M22 104 h12 M84 100 h16" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round"/>
<path d="M28 46 Q8 42 4 24 q12 -2 19 6 q0 -10 8 -15 q8 9 7 22 z" fill="#FFC83D"/>
<path d="M22 80 v-10 q0 -24 26 -24 h12 q10 0 16 11 q6 11 20 12 q8 1 8 8 v3 z" fill="#F4F4FA"/>
<path d="M56 48 q8 1 12 9 q6 11 20 12" fill="none" stroke="#C9D2DD" stroke-width="2.5" stroke-linecap="round"/>
<path d="M60 56 l9 9 M69 56 l-9 9 M74 64 l7 7" stroke="#8A94A8" stroke-width="3" stroke-linecap="round"/>
<rect x="18" y="80" width="88" height="13" rx="6.5" fill="#2C54B0"/>
<path d="M26 86 h10 M42 86 h10 M58 86 h10 M74 86 h10 M90 86 h8" stroke="#4A78D8" stroke-width="3" stroke-linecap="round"/>
<circle cx="37" cy="64" r="6.5" fill="#fff"/><circle cx="38.2" cy="65.4" r="3.4" fill="#12234A"/><circle cx="37.2" cy="64.3" r="1.2" fill="#fff"/>
<circle cx="52" cy="64" r="6.5" fill="#fff"/><circle cx="53.2" cy="65.4" r="3.4" fill="#12234A"/><circle cx="52.2" cy="64.3" r="1.2" fill="#fff"/>
<ellipse cx="30" cy="72" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".9"/><ellipse cx="59" cy="72" rx="3.5" ry="2.2" fill="#FF9EB8" opacity=".9"/>
<path d="M40 72 q4.5 4 9 0" fill="none" stroke="#12234A" stroke-width="3" stroke-linecap="round"/>
<circle cx="108" cy="48" r="2.2" fill="#FFC83D"/>`,

striker: `<defs><radialGradient id="tbst-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FDFDFD"/><stop offset="1" stop-color="#E4E0D6"/></radialGradient></defs>
<path d="M12 84 h16 M6 94 h14 M16 104 h12" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round"/>
<circle cx="62" cy="60" r="32" fill="url(#tbst-g)"/>
<path d="M62 82 l-8 6 l3 9 h10 l3 -9 z" fill="#2B2B33"/>
<path d="M30 56 l10 -8 l4 6 M94 56 l-10 -8 l-4 6" fill="none" stroke="#2B2B33" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
<path d="M46 32 l7 9 M78 32 l-7 9" stroke="#2B2B33" stroke-width="4" stroke-linecap="round"/>
<circle cx="52" cy="56" r="7.5" fill="#fff" stroke="#D8D4C8" stroke-width="1"/><circle cx="53.3" cy="57.5" r="3.8" fill="#2B2B33"/><circle cx="52.2" cy="56.3" r="1.3" fill="#fff"/>
<circle cx="72" cy="56" r="7.5" fill="#fff" stroke="#D8D4C8" stroke-width="1"/><circle cx="73.3" cy="57.5" r="3.8" fill="#2B2B33"/><circle cx="72.2" cy="56.3" r="1.3" fill="#fff"/>
<ellipse cx="45" cy="65" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/><ellipse cx="79" cy="65" rx="4" ry="2.5" fill="#FF9EB8" opacity=".85"/>
<path d="M56 68 q6 5 12 0" fill="none" stroke="#2B2B33" stroke-width="3" stroke-linecap="round"/>
<circle cx="18" cy="30" r="2.2" fill="#FFC83D"/><circle cx="104" cy="94" r="2.2" fill="#FFC83D"/>`,

champ: `<path d="M42 8 h14 l4 26 h-14 z" fill="#E0483C"/><path d="M50 8 h14 l-2 22 h-11 z" fill="#F4F4FA"/><path d="M62 8 h14 l-4 26 h-13 z" fill="#3B6FE0"/>
<defs><radialGradient id="tbch-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#FFD86E"/><stop offset="1" stop-color="#E8A21B"/></radialGradient></defs>
<circle cx="60" cy="66" r="30" fill="url(#tbch-g)"/>
<circle cx="60" cy="66" r="23" fill="none" stroke="#C8891B" stroke-width="2.5" opacity=".7"/>
<path d="M38 50 q8 -10 19 -12" fill="none" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<path d="M60 46 l2 4.6 5 .6 -3.7 3.4 1 5 -4.3 -2.5 -4.3 2.5 1 -5 -3.7 -3.4 5 -.6 z" fill="#C8891B"/>
<circle cx="50" cy="68" r="7.5" fill="#fff"/><circle cx="51.3" cy="69.5" r="3.8" fill="#7A4A08"/><circle cx="50.2" cy="68.3" r="1.3" fill="#fff"/>
<circle cx="70" cy="68" r="7.5" fill="#fff"/><circle cx="71.3" cy="69.5" r="3.8" fill="#7A4A08"/><circle cx="70.2" cy="68.3" r="1.3" fill="#fff"/>
<ellipse cx="43" cy="77" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/><ellipse cx="77" cy="77" rx="4.2" ry="2.6" fill="#FF9E8A" opacity=".9"/>
<path d="M53 81 q7 6 14 0" fill="none" stroke="#7A4A08" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="20" cy="40" r="2.5" fill="#FF5D9E"/><circle cx="100" cy="36" r="2.5" fill="#36D1FF"/><circle cx="26" cy="102" r="2.2" fill="#FFC83D"/><circle cx="96" cy="100" r="2.2" fill="#8A5CE8"/>`,

hover: `<path d="M30 30 h24 M42 30 v10 M66 30 h24 M78 30 v10" stroke="#8A94A8" stroke-width="3" stroke-linecap="round"/>
<ellipse cx="42" cy="28" rx="16" ry="4" fill="#C9D2DD" opacity=".9"/>
<ellipse cx="78" cy="28" rx="16" ry="4" fill="#C9D2DD" opacity=".9"/>
<defs><radialGradient id="tbhv-g" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#7CC0FF"/><stop offset="1" stop-color="#4A8ED8"/></radialGradient></defs>
<ellipse cx="60" cy="62" rx="30" ry="22" fill="url(#tbhv-g)"/>
<circle cx="48" cy="58" r="8" fill="#fff"/><circle cx="49.4" cy="59.5" r="4" fill="#12234A"/><circle cx="48.3" cy="58.3" r="1.4" fill="#fff"/>
<circle cx="72" cy="58" r="8" fill="#fff"/><circle cx="73.4" cy="59.5" r="4" fill="#12234A"/><circle cx="72.3" cy="58.3" r="1.4" fill="#fff"/>
<ellipse cx="39" cy="67" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/><ellipse cx="81" cy="67" rx="4.2" ry="2.6" fill="#FF9EB8" opacity=".85"/>
<path d="M53 71 q7 6 14 0" fill="none" stroke="#12234A" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="60" cy="44" r="3" fill="#FF5D9E"/>
<ellipse cx="60" cy="96" rx="22" ry="5" fill="#8ADAFF" opacity=".5"/>
<path d="M46 88 l-3 5 M60 90 v6 M74 88 l3 5" stroke="#8ADAFF" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="18" cy="60" r="2.2" fill="#FFC83D"/><circle cx="104" cy="44" r="2.2" fill="#FFC83D"/>`,

nitro: `<path d="M16 40 h14 M10 52 h12 M16 64 h10" stroke="#C9C2B0" stroke-width="3" stroke-linecap="round"/>
<rect x="52" y="10" width="16" height="8" rx="3" fill="#8A94A8"/><rect x="57" y="16" width="6" height="8" fill="#8A94A8"/>
<rect x="42" y="24" width="36" height="62" rx="15" fill="#E05C3A"/>
<path d="M42 40 h36" stroke="#C8482A" stroke-width="4"/>
<path d="M46 32 q5 -5 12 -6" fill="none" stroke="#FF8A6E" stroke-width="3.5" stroke-linecap="round"/>
<circle cx="53" cy="54" r="6.5" fill="#fff"/><circle cx="54.2" cy="55.4" r="3.4" fill="#5A1410"/><circle cx="53.2" cy="54.3" r="1.2" fill="#fff"/>
<circle cx="67" cy="54" r="6.5" fill="#fff"/><circle cx="68.2" cy="55.4" r="3.4" fill="#5A1410"/><circle cx="67.2" cy="54.3" r="1.2" fill="#fff"/>
<ellipse cx="48" cy="62" rx="3.5" ry="2.2" fill="#FFB3A8" opacity=".9"/><ellipse cx="72" cy="62" rx="3.5" ry="2.2" fill="#FFB3A8" opacity=".9"/>
<path d="M54 66 q6 5 12 0" fill="none" stroke="#5A1410" stroke-width="3" stroke-linecap="round"/>
<path d="M48 74 l6 4 l-4 4 l7 5" fill="none" stroke="#FFC23D" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M52 92 q8 10 8 16 q-8 -2 -12 -10 z" fill="#FFC23D"/>
<path d="M68 92 q-2 10 4 18 q6 -8 2 -18 z" fill="#FF8A3C"/>
<circle cx="100" cy="30" r="2.2" fill="#FFC83D"/><circle cx="104" cy="84" r="2.2" fill="#FFC83D"/>`,

mech: `<path d="M56 20 h8 l-2 -12 h-4 z" fill="#E8A21B"/>
<rect x="28" y="24" width="64" height="56" rx="12" fill="#98A0B4"/>
<rect x="34" y="30" width="52" height="44" rx="8" fill="#6E7888"/>
<circle cx="24" cy="46" r="6" fill="#5E6678"/><circle cx="96" cy="46" r="6" fill="#5E6678"/>
<rect x="38" y="42" width="44" height="18" rx="9" fill="#14102A"/>
<circle cx="50" cy="51" r="5" fill="#36D1FF"/><circle cx="48.8" cy="49.8" r="1.6" fill="#D8F8FF"/>
<circle cx="70" cy="51" r="5" fill="#36D1FF"/><circle cx="68.8" cy="49.8" r="1.6" fill="#D8F8FF"/>
<path d="M44 68 h32" stroke="#4A5568" stroke-width="4" stroke-linecap="round"/>
<path d="M50 66 v4 M60 66 v4 M70 66 v4" stroke="#98A0B4" stroke-width="2"/>
<ellipse cx="40" cy="60" rx="3.5" ry="2.2" fill="#FF7FBE" opacity=".8"/><ellipse cx="80" cy="60" rx="3.5" ry="2.2" fill="#FF7FBE" opacity=".8"/>
<path d="M40 84 q20 10 40 0 l-3 16 q-17 7 -34 0 z" fill="#5E6678"/>
<rect x="52" y="88" width="16" height="8" rx="2" fill="#E8A21B"/>
<circle cx="34" cy="34" r="2" fill="#4A5568"/><circle cx="86" cy="34" r="2" fill="#4A5568"/>
<circle cx="16" cy="70" r="2.2" fill="#FFC83D"/><circle cx="106" cy="66" r="2.2" fill="#FFC83D"/>`,

titan: `<defs><radialGradient id="tbtt-a" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#FFB84D" stop-opacity=".45"/><stop offset="1" stop-color="#FFB84D" stop-opacity="0"/></radialGradient><radialGradient id="tbtt-g" cx="50%" cy="30%" r="80%"><stop offset="0" stop-color="#F7BC46"/><stop offset="1" stop-color="#E89B1F"/></radialGradient></defs>
<circle cx="60" cy="58" r="52" fill="url(#tbtt-a)"/>
<path d="M52 18 v-8 M60 18 v-12 M68 18 v-8" stroke="#C8891B" stroke-width="4" stroke-linecap="round"/>
<circle cx="24" cy="52" r="9" fill="#C43038"/><circle cx="96" cy="52" r="9" fill="#C43038"/>
<path d="M20 48 l8 8 M28 48 l-8 8" stroke="#8A1E24" stroke-width="2.5" stroke-linecap="round"/><path d="M92 48 l8 8 M100 48 l-8 8" stroke="#8A1E24" stroke-width="2.5" stroke-linecap="round"/>
<rect x="28" y="18" width="64" height="58" rx="14" fill="url(#tbtt-g)"/>
<path d="M36 26 q6 -5 14 -6" fill="none" stroke="#FFE9A8" stroke-width="4" stroke-linecap="round" opacity=".9"/>
<path d="M38 36 l12 5 M82 36 l-12 5" stroke="#5A2A10" stroke-width="4" stroke-linecap="round"/>
<circle cx="46" cy="48" r="8.5" fill="#fff"/><circle cx="47.5" cy="49.5" r="4.2" fill="#C43038"/><circle cx="46.3" cy="48.3" r="1.5" fill="#fff"/>
<circle cx="74" cy="48" r="8.5" fill="#fff"/><circle cx="75.5" cy="49.5" r="4.2" fill="#C43038"/><circle cx="74.3" cy="48.3" r="1.5" fill="#fff"/>
<ellipse cx="38" cy="58" rx="4" ry="2.5" fill="#FF9E8A" opacity=".8"/><ellipse cx="82" cy="58" rx="4" ry="2.5" fill="#FF9E8A" opacity=".8"/>
<path d="M44 64 q16 10 32 0" fill="none" stroke="#5A2A10" stroke-width="3.5" stroke-linecap="round"/>
<path d="M48 66 v4 M56 68 v4 M64 68 v4 M72 66 v4" stroke="#5A2A10" stroke-width="2.5" stroke-linecap="round"/>
<path d="M40 78 q20 10 40 0 l-4 22 q-16 7 -32 0 z" fill="#C43038"/>
<rect x="52" y="84" width="16" height="9" rx="2" fill="#FFC23D"/>
<path d="M14 40 l1.6 4.8 4.8 1.6 -4.8 1.6 -1.6 4.8 -1.6 -4.8 -4.8 -1.6 4.8 -1.6 z" fill="#FFC83D"/>
<path d="M102 88 l1.4 4.2 4.2 1.4 -4.2 1.4 -1.4 4.2 -1.4 -4.2 -4.2 -1.4 4.2 -1.4 z" fill="#FFC83D"/>`

});


/* ===== SERPENT PACK — coiled-snake avatars, generated per species ===== */
(function(){
  function snake(cfg){
    var body=cfg.body, belly=cfg.belly, line=cfg.line||'#154A32', eye=cfg.eye||'#241A0C';
    var hood = cfg.hood ? (
      '<path d="M60 40 q-30 2 -30 22 q0 8 30 8 q30 0 30 -8 q0 -20 -30 -22z" fill="'+cfg.hoodFill+'" stroke="'+line+'" stroke-width="3"/>'+
      '<circle cx="46" cy="52" r="4" fill="'+belly+'"/><circle cx="74" cy="52" r="4" fill="'+belly+'"/>') : '';
    var rattle = cfg.rattle ? '<g transform="translate(90 96)"><path d="M0 0 l7 -3 l0 8 z" fill="#C9B27A" stroke="'+line+'" stroke-width="2"/><path d="M6 -2 l7 -3 l0 8 z" fill="#E0CB94" stroke="'+line+'" stroke-width="2"/></g>' : '';
    var horns = cfg.horns ? '<path d="M46 30 q-4 -12 2 -18 q3 6 4 15z" fill="'+cfg.horns+'" stroke="'+line+'" stroke-width="2"/><path d="M74 30 q4 -12 -2 -18 q-3 6 -4 15z" fill="'+cfg.horns+'" stroke="'+line+'" stroke-width="2"/>' : '';
    var gem = cfg.gem ? '<path d="M60 24 l6 8 -6 8 -6 -8z" fill="'+cfg.gem+'" stroke="'+line+'" stroke-width="2"/>' : '';
    var fins = cfg.fins ? '<path d="M60 34 q-2 -12 3 -16 q2 6 1 15z" fill="'+belly+'" opacity=".7"/><path d="M40 66 q-14 -4 -18 4 q10 4 18 2z" fill="'+belly+'" opacity=".55"/>' : '';
    var pat = '';
    if(cfg.pat==='diamond') for(var i=0;i<3;i++) pat+='<path d="M60 '+(70+i*11)+' l7 6 -7 6 -7 -6z" fill="'+line+'" opacity=".35"/>';
    if(cfg.pat==='bands') for(var b=0;b<3;b++) pat+='<rect x="30" y="'+(72+b*12)+'" width="60" height="5" rx="2.5" fill="'+line+'" opacity=".3"/>';
    if(cfg.pat==='spots') pat='<circle cx="44" cy="80" r="4" fill="'+line+'" opacity=".3"/><circle cx="76" cy="88" r="4" fill="'+line+'" opacity=".3"/><circle cx="60" cy="96" r="4" fill="'+line+'" opacity=".3"/>';
    return ''
      // coiled body base
      +'<defs><radialGradient id="sn-'+cfg.k+'" cx="50%" cy="38%" r="70%"><stop offset="0" stop-color="'+(cfg.hi||body)+'"/><stop offset="1" stop-color="'+body+'"/></radialGradient></defs>'
      +'<ellipse cx="60" cy="92" rx="42" ry="20" fill="url(#sn-'+cfg.k+')" stroke="'+line+'" stroke-width="3"/>'
      +'<ellipse cx="60" cy="90" rx="30" ry="12" fill="'+belly+'" opacity=".55"/>'
      +pat
      // rising S-neck
      +'<path d="M60 84 q-22 -6 -18 -26 q3 -16 18 -18" fill="none" stroke="'+line+'" stroke-width="16" stroke-linecap="round"/>'
      +'<path d="M60 84 q-22 -6 -18 -26 q3 -16 18 -18" fill="none" stroke="url(#sn-'+cfg.k+')" stroke-width="11" stroke-linecap="round"/>'
      +hood+horns+gem+fins
      // head
      +'<ellipse cx="60" cy="40" rx="20" ry="16" fill="url(#sn-'+cfg.k+')" stroke="'+line+'" stroke-width="3"/>'
      +'<ellipse cx="60" cy="46" rx="12" ry="8" fill="'+belly+'" opacity=".6"/>'
      // tongue
      +'<path d="M60 54 q0 8 0 12 M60 66 l-4 5 M60 66 l4 5" fill="none" stroke="#E23B57" stroke-width="2.4" stroke-linecap="round"/>'
      // eyes
      +'<circle cx="50" cy="36" r="6" fill="#fff"/><circle cx="51" cy="37" r="3.2" fill="'+eye+'"/><circle cx="49.6" cy="35.4" r="1.1" fill="#fff"/>'
      +'<circle cx="70" cy="36" r="6" fill="#fff"/><circle cx="71" cy="37" r="3.2" fill="'+eye+'"/><circle cx="69.6" cy="35.4" r="1.1" fill="#fff"/>'
      // nostrils + smile
      +'<circle cx="55" cy="46" r="1.3" fill="'+line+'"/><circle cx="65" cy="46" r="1.3" fill="'+line+'"/>'
      +(cfg.fangs?'<path d="M54 50 l-1 5 M66 50 l1 5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>':'');
  }
  var S={
    noodle:{k:'noodle',body:'#5FBE5A',hi:'#86D97F',belly:'#D6F0B8',line:'#2C6E2C'},
    sunny:{k:'sunny',body:'#E9963C',hi:'#FFC07A',belly:'#FFDFB0',line:'#9A5410',pat:'bands'},
    cobra:{k:'cobra',body:'#3E8D5C',hi:'#69B984',belly:'#DDF0BE',line:'#1F5A38',hood:true,hoodFill:'#4FA26C',fangs:true},
    python:{k:'python',body:'#9A824C',hi:'#C2A972',belly:'#E9DBB4',line:'#5A4620',pat:'spots'},
    rattler:{k:'rattler',body:'#B99154',hi:'#DDBA80',belly:'#EEDCB0',line:'#6E4E24',rattle:true,pat:'diamond',fangs:true},
    viper:{k:'viper',body:'#6E9A3E',hi:'#97C066',belly:'#DCEAB0',line:'#3E5A20',pat:'diamond',fangs:true},
    boa:{k:'boa',body:'#8A6AB8',hi:'#B39AD8',belly:'#E6D9F0',line:'#4A3072',pat:'spots'},
    mamba:{k:'mamba',body:'#4A4A58',hi:'#6E6E80',belly:'#B8B8C4',line:'#22222E',fangs:true},
    seasnake:{k:'seasnake',body:'#2E9FB8',hi:'#5CC4D8',belly:'#BEEAF0',line:'#14607A',fins:true,pat:'bands'},
    naga:{k:'naga',body:'#C9A227',hi:'#F0D064',belly:'#F5E7B0',line:'#7A5A10',horns:'#F0D064',gem:'#36D1FF',fangs:true}
  };
  var out={}; for(var k in S) out[k]=snake(S[k]);
  window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART||{}, out);
})();

/* ===== BIG BEASTS PACK (ported from design handoff — 120x120, same renderer) ===== */
window.SB_AVATAR_ART = Object.assign(window.SB_AVATAR_ART || {}, {
mammoth: `<defs><radialGradient id="bbmam" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#C08F60"/><stop offset="1" stop-color="#93643A"/></radialGradient></defs><circle cx="16" cy="18" r="2.2" fill="#DCEBF6"/><circle cx="30" cy="10" r="1.6" fill="#DCEBF6"/><circle cx="98" cy="14" r="2" fill="#DCEBF6"/><circle cx="110" cy="30" r="1.5" fill="#DCEBF6"/><circle cx="8" cy="44" r="1.6" fill="#DCEBF6"/>
<path d="M20 44 q-12 12 -4 24 q6 4 10 -2" fill="#93643A"/><path d="M100 44 q12 12 4 24 q-6 4 -10 -2" fill="#93643A"/>
<ellipse cx="60" cy="64" rx="41" ry="38" fill="url(#bbmam)"/>
<path d="M60 27 q-20 0 -27 13 q9 -7 27 -7 q18 0 27 7 q-7 -13 -27 -13 z" fill="#6E4823"/>
<path d="M40 30 l3 8 M50 26 l2 9 M60 25 v9 M70 26 l-2 9 M80 30 l-3 8" stroke="#6E4823" stroke-width="3" stroke-linecap="round"/>
<path d="M24 88 q-2 10 3 14 M34 96 q-1 8 3 11 M86 96 q1 8 -3 11 M96 88 q2 10 -3 14" stroke="#7E5330" stroke-width="3.5" stroke-linecap="round" fill="none"/>
<ellipse cx="46" cy="44" rx="15" ry="9" fill="#fff" opacity=".35"/>
<path d="M40 86 q-16 8 -14 26 q5 4 10 0 q-1 -12 10 -18 z" fill="#F6F1E7" stroke="#D8CBB8" stroke-width="2.5"/>
<path d="M80 86 q16 8 14 26 q-5 4 -10 0 q1 -12 -10 -18 z" fill="#F6F1E7" stroke="#D8CBB8" stroke-width="2.5"/>
<path d="M60 78 q-4 12 -12 18 q-2 8 6 10 q7 2 10 -6 q-3 -10 -4 -22 z" fill="#93643A" stroke="#6E4823" stroke-width="2"/>
<path d="M54 104 q-6 2 -6 6 q5 3 9 -2" fill="#6E4823"/><circle cx="46" cy="58" r="8" fill="#fff"/><circle cx="47.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="46.2" cy="58.2" r="1.44" fill="#fff"/><circle cx="74" cy="58" r="8" fill="#fff"/><circle cx="75.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="74.2" cy="58.2" r="1.44" fill="#fff"/><ellipse cx="39" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="81" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M52 72 q8 6 16 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><path d="M104 44 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/><path d="M12 66 l0.9799999999999999 2.94 2.94 0.9799999999999999 -2.94 0.9799999999999999 -0.9799999999999999 2.94 -0.9799999999999999 -2.94 -2.94 -0.9799999999999999 2.94 -0.9799999999999999 z" fill="#FFC83D"/>`,

titanoboa: `<defs><radialGradient id="bbtit" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#74AC60"/><stop offset="1" stop-color="#4E7F41"/></radialGradient></defs><path d="M4 116 q14 -10 26 0 t26 0 t26 0 t26 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round" opacity=".7"/>
<path d="M12 30 q-4 -12 4 -18 M12 30 q-10 -6 -10 -14 M12 30 q2 -14 -4 -20" stroke="#5FA53C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M112 44 q4 -12 -4 -18 M112 44 q10 -6 10 -14" stroke="#5FA53C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
<path d="M6 98 C26 74 38 106 58 84 C78 62 90 102 108 64" fill="none" stroke="#3E6633" stroke-width="17" stroke-linecap="round"/>
<path d="M6 98 C26 74 38 106 58 84 C78 62 90 102 108 64" fill="none" stroke="url(#bbtit)" stroke-width="13" stroke-linecap="round"/>
<path d="M6 98 C26 74 38 106 58 84 C78 62 90 102 108 64" fill="none" stroke="#A8D890" stroke-width="4" stroke-linecap="round" opacity=".6" stroke-dasharray="10 8"/>
<path d="M20 88 l4 -5 M34 92 l4 5 M52 88 l4 -5 M70 76 l4 -4 M84 88 l4 5" stroke="#33552A" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<ellipse cx="102" cy="56" rx="17" ry="14" fill="url(#bbtit)"/>
<path d="M96 44 q-2 -5 2 -7 q3 3 1 7 z M108 44 q2 -5 -2 -7 q-3 3 -1 7 z" fill="#4E7F41"/>
<ellipse cx="96" cy="50" rx="7" ry="4" fill="#fff" opacity=".35"/>
<path d="M117 54 q7 1 11 -3 M117 58 q7 4 11 3" stroke="#E05A6B" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="97" cy="51" r="5.5" fill="#fff"/><circle cx="98.3" cy="52.4" r="2.75" fill="#2E455C"/><circle cx="97.2" cy="51.2" r="0.99" fill="#fff"/><circle cx="108" cy="51" r="5.5" fill="#fff"/><circle cx="109.3" cy="52.4" r="2.75" fill="#2E455C"/><circle cx="108.2" cy="51.2" r="0.99" fill="#fff"/><ellipse cx="93" cy="59" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="112" cy="59" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M98 62 q4.5 6 9 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><g transform="translate(16 74) scale(0.85)"><ellipse rx="7" ry="5" fill="#FFC83D" stroke="#8A6A12" stroke-width="1.4"/><path d="M-2 -4.5 v9 M2 -4.5 v9" stroke="#8A6A12" stroke-width="1.4"/><ellipse cx="-2" cy="-6" rx="4" ry="2.6" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1"/><ellipse cx="2" cy="-6" rx="4" ry="2.6" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1"/><circle cx="5" cy="-1.5" r="1" fill="#3A2213"/></g><rect x="28" y="56" rx="4" width="126.80000000000001" height="12" fill="#fff" opacity=".85"/><text x="32" y="65" font-family="Hanken Grotesk,sans-serif" font-size="8.5" font-weight="700" fill="#3E6633">42 ft — one school bus</text><path d="M116 20 l1.1199999999999999 3.3600000000000003 3.3600000000000003 1.1199999999999999 -3.3600000000000003 1.1199999999999999 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 -3.3600000000000003 -3.3600000000000003 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 z" fill="#FFC83D"/>`,

megalodon: `<defs><radialGradient id="bbmeg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#A4BDD1"/><stop offset="1" stop-color="#6E8CA6"/></radialGradient></defs><path d="M6 108 q10 -7 20 0 t20 0 t20 0 t20 0 t22 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<path d="M58 6 q-15 15 -2 28 q5 -2 7 -7 q7 -13 -5 -21 z" fill="#6E8CA6"/>
<circle cx="60" cy="62" r="40" fill="url(#bbmeg)"/>
<path d="M60 22 a40 40 0 0 1 40 40 l-13 0 a27 27 0 0 0 -27 -27 z" fill="#5D7B94" opacity=".55"/>
<ellipse cx="44" cy="40" rx="14" ry="8" fill="#fff" opacity=".35"/>
<path d="M18 74 q-13 -3 -17 8 q9 7 18 2 z M102 74 q13 -3 17 8 q-9 7 -18 2 z" fill="#6E8CA6"/>
<path d="M25 60 h6 M29 66 h6 M25 72 h6 M89 60 h6 M85 66 h6 M89 72 h6" stroke="#597B94" stroke-width="2.5" stroke-linecap="round"/>
<path d="M26 78 q34 18 68 0 q-5 22 -34 22 q-29 0 -34 -22 z" fill="#F6FBFF"/>
<path d="M31 82 l5 9 5 -8 5 9 5 -8 5 9 5 -8 5 9 5 -8 5 9 5 -8 4 8" fill="none" stroke="#8FA8BC" stroke-width="2.5"/>
<path d="M29 82 l4 10 5 -9 M83 84 l5 9 4 -10" fill="#fff" stroke="#C7D8E4" stroke-width="1.5"/>
<circle cx="14" cy="36" r="4" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="22" cy="24" r="2.5" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="106" cy="42" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<g transform="translate(14 92)"><path d="M0 0 q5 -4 10 0 q-5 4 -10 0 z" fill="#FF9E5C"/><path d="M10 0 l5 -3 v6 z" fill="#FF9E5C"/><circle cx="3" cy="-.6" r=".9" fill="#3A2213"/></g>
<g transform="translate(96 96)"><path d="M0 0 q5 -4 10 0 q-5 4 -10 0 z" fill="#FFC83D"/><path d="M10 0 l5 -3 v6 z" fill="#FFC83D"/><circle cx="3" cy="-.6" r=".9" fill="#3A2213"/></g><circle cx="46" cy="54" r="8" fill="#fff"/><circle cx="47.3" cy="55.4" r="4" fill="#2E455C"/><circle cx="46.2" cy="54.2" r="1.44" fill="#fff"/><circle cx="74" cy="54" r="8" fill="#fff"/><circle cx="75.3" cy="55.4" r="4" fill="#2E455C"/><circle cx="74.2" cy="54.2" r="1.44" fill="#fff"/><ellipse cx="38" cy="64" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="82" cy="64" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M100 16 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/>`,

argentavis: `<defs><radialGradient id="bbarg" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#CE9159"/><stop offset="1" stop-color="#A2672F"/></radialGradient></defs><circle cx="18" cy="18" r="9" fill="#FFD86E"/><circle cx="18" cy="18" r="13" fill="none" stroke="#FFD86E" stroke-width="2" opacity=".5"/>
<ellipse cx="94" cy="106" rx="16" ry="6" fill="#EAF2F8"/><ellipse cx="24" cy="100" rx="13" ry="5" fill="#EAF2F8"/><ellipse cx="60" cy="112" rx="18" ry="6" fill="#EAF2F8" opacity=".8"/>
<path d="M58 56 Q22 30 4 40 q13 3 22 10 q-12 0 -20 6 q13 3 24 6 q-9 4 -13 11 q14 0 27 -6 z" fill="url(#bbarg)"/>
<path d="M62 56 Q98 30 116 40 q-13 3 -22 10 q12 0 20 6 q-13 3 -24 6 q9 4 13 11 q-14 0 -27 -6 z" fill="url(#bbarg)"/>
<path d="M14 42 q12 2 22 8 M106 42 q-12 2 -22 8 M22 56 q10 1 18 4 M98 56 q-10 1 -18 4" stroke="#84501E" stroke-width="2" opacity=".6" fill="none"/>
<ellipse cx="60" cy="72" rx="21" ry="25" fill="url(#bbarg)"/>
<ellipse cx="52" cy="58" rx="8" ry="6" fill="#fff" opacity=".35"/>
<path d="M52 92 q-4 8 -14 10 q7 3 12 0 M68 92 q4 8 14 10 q-7 3 -12 0" fill="#A2672F"/>
<path d="M60 94 q-6 10 -2 18 M60 94 q6 10 2 18" stroke="#84501E" stroke-width="4" stroke-linecap="round" fill="none"/>
<path d="M60 46 q-8 -4 -10 -12 q7 1 11 5 q4 -4 11 -5 q-2 8 -10 12 z" fill="#B87E45"/>
<path d="M60 76 l11 6 -11 5 -11 -5 z" fill="#FFB33D" stroke="#E0921E" stroke-width="1.5"/><path d="M60 82 v5" stroke="#E0921E" stroke-width="1.5"/><circle cx="52" cy="66" r="6.5" fill="#fff"/><circle cx="53.3" cy="67.4" r="3.25" fill="#2E455C"/><circle cx="52.2" cy="66.2" r="1.17" fill="#fff"/><circle cx="69" cy="66" r="6.5" fill="#fff"/><circle cx="70.3" cy="67.4" r="3.25" fill="#2E455C"/><circle cx="69.2" cy="66.2" r="1.17" fill="#fff"/><ellipse cx="45" cy="75" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="75" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M104 18 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/><path d="M10 66 l0.9799999999999999 2.94 2.94 0.9799999999999999 -2.94 0.9799999999999999 -0.9799999999999999 2.94 -0.9799999999999999 -2.94 -2.94 -0.9799999999999999 2.94 -0.9799999999999999 z" fill="#FFC83D"/>`,

megatherium: `<defs><radialGradient id="bbmgt" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#BE9F76"/><stop offset="1" stop-color="#94764E"/></radialGradient></defs><path d="M84 10 q20 -4 30 6 M88 18 q16 -2 24 6" stroke="#5FA53C" stroke-width="4" stroke-linecap="round" fill="none"/>
<ellipse cx="96" cy="12" rx="6" ry="3.5" fill="#7CC454" transform="rotate(-20 96 12)"/><ellipse cx="108" cy="16" rx="6" ry="3.5" fill="#7CC454" transform="rotate(-12 108 16)"/><ellipse cx="104" cy="26" rx="6" ry="3.5" fill="#7CC454" transform="rotate(-30 104 26)"/><ellipse cx="114" cy="8" rx="5" ry="3" fill="#7CC454" transform="rotate(-18 114 8)"/>
<path d="M60 118 q-32 0 -36 -32 q-3 -30 14 -48 q10 -10 22 -10 q12 0 22 10 q6 6 9 16" fill="url(#bbmgt)"/>
<path d="M91 54 q3 -18 -9 -26" fill="none" stroke="#94764E" stroke-width="14" stroke-linecap="round"/>
<path d="M88 30 q4 -8 12 -10 M90 36 q6 -4 12 -4" stroke="#7E6240" stroke-width="3" stroke-linecap="round" fill="none"/>
<path d="M96 26 l4 -9 M102 28 l6 -7 M104 34 l8 -4" stroke="#5E4A30" stroke-width="3" stroke-linecap="round"/>
<path d="M30 52 q14 -6 30 -4 M26 74 q18 -7 38 -4 M28 96 q16 -6 34 -4" fill="none" stroke="#7E6240" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
<ellipse cx="50" cy="42" rx="13" ry="8" fill="#fff" opacity=".35"/>
<circle cx="52" cy="40" r="19" fill="url(#bbmgt)"/>
<path d="M52 54 q-4 7 0 11 q4 -4 0 -11 z" fill="#5E4A30"/>
<path d="M26 100 q-10 5 -9 15 q6 1 10 -5 M27 104 l-3 11 M32 104 l-1 11 M37 104 l1 11" stroke="#5E4A30" stroke-width="3" stroke-linecap="round" fill="none"/>
<ellipse cx="74" cy="112" rx="10" ry="6" fill="#8A6E48"/><circle cx="45" cy="38" r="6.5" fill="#fff"/><circle cx="46.3" cy="39.4" r="3.25" fill="#2E455C"/><circle cx="45.2" cy="38.2" r="1.17" fill="#fff"/><circle cx="60" cy="38" r="6.5" fill="#fff"/><circle cx="61.3" cy="39.4" r="3.25" fill="#2E455C"/><circle cx="60.2" cy="38.2" r="1.17" fill="#fff"/><ellipse cx="38" cy="47" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="67" cy="47" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M46 50 q6 6 12 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><path d="M12 26 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/><path d="M112 50 l0.9799999999999999 2.94 2.94 0.9799999999999999 -2.94 0.9799999999999999 -0.9799999999999999 2.94 -0.9799999999999999 -2.94 -2.94 -0.9799999999999999 2.94 -0.9799999999999999 z" fill="#FFC83D"/>`,

vasuki: `<defs><radialGradient id="bbvas" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#9179CE"/><stop offset="1" stop-color="#63499E"/></radialGradient></defs><rect x="8" y="106" width="104" height="8" rx="3" fill="#D8CBB8"/><path d="M20 106 v8 M40 106 v8 M60 106 v8 M80 106 v8 M100 106 v8" stroke="#BCA98E" stroke-width="2"/>
<path d="M14 96 q-3 -14 4 -22 q3 8 0 14" fill="none" stroke="#B7B0C6" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
<path d="M6 96 C24 78 36 104 54 86 C70 70 80 100 96 74 C104 62 102 50 96 46" fill="none" stroke="#4E3684" stroke-width="17" stroke-linecap="round"/>
<path d="M6 96 C24 78 36 104 54 86 C70 70 80 100 96 74 C104 62 102 50 96 46" fill="none" stroke="url(#bbvas)" stroke-width="13" stroke-linecap="round"/>
<path d="M6 96 C24 78 36 104 54 86 C70 70 80 100 96 74 C104 62 102 50 96 46" fill="none" stroke="#C9B8F0" stroke-width="3.5" stroke-linecap="round" opacity=".65" stroke-dasharray="3 9"/>
<circle cx="22" cy="88" r="1.6" fill="#FFC83D"/><circle cx="46" cy="90" r="1.6" fill="#FFC83D"/><circle cx="70" cy="82" r="1.6" fill="#FFC83D"/><circle cx="88" cy="82" r="1.6" fill="#FFC83D"/>
<ellipse cx="92" cy="42" rx="17" ry="14" fill="url(#bbvas)"/>
<path d="M84 30 q-3 -6 2 -9 q4 3 2 9 z M100 30 q3 -6 -2 -9 q-4 3 -2 9 z" fill="#63499E"/>
<ellipse cx="86" cy="36" rx="7" ry="4" fill="#fff" opacity=".35"/>
<path d="M92 24 l5 9 -5 7 -5 -7 z" fill="#FFC83D" stroke="#E0A81E" stroke-width="1.5"/><circle cx="92" cy="31" r="2" fill="#FF5D9E"/>
<path d="M107 40 q7 1 11 -3 M107 44 q7 4 11 3" stroke="#E05A6B" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="87" cy="37" r="5.5" fill="#fff"/><circle cx="88.3" cy="38.4" r="2.75" fill="#2E455C"/><circle cx="87.2" cy="37.2" r="0.99" fill="#fff"/><circle cx="98" cy="37" r="5.5" fill="#fff"/><circle cx="99.3" cy="38.4" r="2.75" fill="#2E455C"/><circle cx="98.2" cy="37.2" r="0.99" fill="#fff"/><ellipse cx="83" cy="45" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="102" cy="45" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M88 48 q4.5 6 9 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><g transform="translate(16 76) scale(0.85)"><ellipse rx="7" ry="5" fill="#FFC83D" stroke="#8A6A12" stroke-width="1.4"/><path d="M-2 -4.5 v9 M2 -4.5 v9" stroke="#8A6A12" stroke-width="1.4"/><ellipse cx="-2" cy="-6" rx="4" ry="2.6" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1"/><ellipse cx="2" cy="-6" rx="4" ry="2.6" fill="#EDE7FF" stroke="#C4B4FF" stroke-width="1"/><circle cx="5" cy="-1.5" r="1" fill="#3A2213"/></g><rect x="26" y="56" rx="4" width="121.4" height="12" fill="#fff" opacity=".85"/><text x="30" y="65" font-family="Hanken Grotesk,sans-serif" font-size="8.5" font-weight="700" fill="#63499E">50 ft — longest ever?</text><path d="M112 16 l1.1199999999999999 3.3600000000000003 3.3600000000000003 1.1199999999999999 -3.3600000000000003 1.1199999999999999 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 -3.3600000000000003 -3.3600000000000003 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 z" fill="#FFC83D"/>`,

livyatan: `<defs><radialGradient id="bbliv" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#6788A2"/><stop offset="1" stop-color="#3E5B72"/></radialGradient></defs><path d="M6 10 q10 -7 20 0 t20 0 t20 0 t20 0 t22 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<path d="M54 22 q-3 -8 3 -12 q2 3 1 6 q4 -4 8 -2 q-2 7 -12 8 z" fill="#8FB0C6"/>
<circle cx="58" cy="64" r="39" fill="url(#bbliv)"/>
<path d="M58 25 a39 39 0 0 1 39 39 l-13 0 a26 26 0 0 0 -26 -26 z" fill="#33506A" opacity=".6"/>
<ellipse cx="42" cy="44" rx="13" ry="8" fill="#fff" opacity=".35"/>
<path d="M95 86 q16 2 21 13 q-11 6 -20 -3 z M99 76 q15 -7 22 0 q-7 10 -20 6 z" fill="#3E5B72"/>
<path d="M20 50 q30 -12 66 -2" fill="none" stroke="#33506A" stroke-width="4" stroke-linecap="round" opacity=".6"/>
<path d="M22 76 q34 20 70 0 l-7 16 q-28 13 -56 0 z" fill="#EAF2F8"/>
<path d="M27 80 l6 12 6 -10 6 12 6 -10 6 12 6 -10 6 12 6 -10 6 11" fill="none" stroke="#B6CADA" stroke-width="2.5"/>
<path d="M25 78 l5 14 6 -12 M79 82 l6 12 5 -13" fill="#fff" stroke="#C7D8E4" stroke-width="2"/>
<circle cx="12" cy="40" r="3.5" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="20" cy="28" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="104" cy="52" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="110" cy="36" r="2" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<g transform="translate(12 88)"><path d="M0 0 q5 -4 10 0 q-5 4 -10 0 z" fill="#7CC454"/><path d="M10 0 l5 -3 v6 z" fill="#7CC454"/><circle cx="3" cy="-.6" r=".9" fill="#14402A"/></g><circle cx="44" cy="56" r="8" fill="#fff"/><circle cx="45.3" cy="57.4" r="4" fill="#2E455C"/><circle cx="44.2" cy="56.2" r="1.44" fill="#fff"/><circle cx="72" cy="56" r="8" fill="#fff"/><circle cx="73.3" cy="57.4" r="4" fill="#2E455C"/><circle cx="72.2" cy="56.2" r="1.44" fill="#fff"/><ellipse cx="36" cy="66" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="80" cy="66" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M102 20 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/>`,

gigantopithecus: `<defs><radialGradient id="bbgig" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#C98548"/><stop offset="1" stop-color="#9E5E26"/></radialGradient></defs><path d="M12 4 v40 M28 0 v34" stroke="#7CC454" stroke-width="5" stroke-linecap="round"/><path d="M12 16 h5 M12 30 h5 M28 12 h5 M28 24 h5" stroke="#5FA53C" stroke-width="2.5"/>
<path d="M60 118 q-35 0 -39 -35 q-3 -29 13 -45 q-13 -6 -11 -19 q10 2 15 10 q10 -8 22 -8 q12 0 22 8 q5 -8 15 -10 q2 13 -11 19 q16 16 13 45 q-4 35 -39 35 z" fill="url(#bbgig)"/>
<path d="M34 46 q26 -11 52 0 M28 76 q32 -11 64 0" fill="none" stroke="#84501E" stroke-width="2.5" stroke-linecap="round" opacity=".5"/>
<ellipse cx="48" cy="38" rx="12" ry="7" fill="#fff" opacity=".35"/>
<ellipse cx="60" cy="48" rx="21" ry="19" fill="#EBC9A0"/>
<path d="M60 58 q-5 6 0 10 q5 -4 0 -10 z" fill="#9E5E26"/>
<path d="M52 92 q8 6 16 0" fill="none" stroke="#84501E" stroke-width="3" stroke-linecap="round" opacity=".6"/>
<path d="M96 60 v44" stroke="#7CC454" stroke-width="6" stroke-linecap="round"/><path d="M96 72 h6 M96 88 h6" stroke="#5FA53C" stroke-width="3"/><path d="M96 60 q8 -6 14 -4 q-4 7 -14 8 z" fill="#7CC454"/>
<path d="M88 78 q10 -2 12 6 q-8 6 -14 0" fill="#9E5E26"/>
<path d="M22 86 q-9 5 -7 14 q6 0 9 -6" stroke="#84501E" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="52" cy="44" r="6.5" fill="#fff"/><circle cx="53.3" cy="45.4" r="3.25" fill="#2E455C"/><circle cx="52.2" cy="44.2" r="1.17" fill="#fff"/><circle cx="68" cy="44" r="6.5" fill="#fff"/><circle cx="69.3" cy="45.4" r="3.25" fill="#2E455C"/><circle cx="68.2" cy="44.2" r="1.17" fill="#fff"/><ellipse cx="44" cy="54" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="76" cy="54" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M53 58 q7 6 14 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><path d="M14 56 l1.19 3.57 3.57 1.19 -3.57 1.19 -1.19 3.57 -1.19 -3.57 -3.57 -1.19 3.57 -1.19 z" fill="#FFC83D"/><path d="M108 26 l1.1199999999999999 3.3600000000000003 3.3600000000000003 1.1199999999999999 -3.3600000000000003 1.1199999999999999 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 -3.3600000000000003 -3.3600000000000003 -1.1199999999999999 3.3600000000000003 -1.1199999999999999 z" fill="#FFC83D"/>`,

dunkleo: `<defs><radialGradient id="bbdun" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#8AA2B8"/><stop offset="1" stop-color="#556E86"/></radialGradient></defs><path d="M6 12 q10 -7 20 0 t20 0 t20 0 t20 0 t22 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<circle cx="60" cy="64" r="39" fill="url(#bbdun)"/>
<path d="M60 25 a39 39 0 0 1 39 39 l-6 0 q-2 -8 -8 -9 q4 -16 -8 -24 q-6 -5 -17 -6 z" fill="#42586C"/>
<path d="M24 48 q36 -16 72 -2" fill="none" stroke="#3C5266" stroke-width="4" stroke-linecap="round" opacity=".7"/>
<path d="M34 34 q12 -8 26 -8 M84 38 q6 4 9 10" stroke="#A9BFD2" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".8"/>
<circle cx="32" cy="46" r="1.7" fill="#42586C"/><circle cx="46" cy="40" r="1.7" fill="#42586C"/><circle cx="62" cy="38" r="1.7" fill="#42586C"/><circle cx="78" cy="40" r="1.7" fill="#42586C"/><circle cx="92" cy="48" r="1.7" fill="#42586C"/>
<ellipse cx="44" cy="42" rx="12" ry="7" fill="#fff" opacity=".35"/>
<path d="M26 74 q34 17 68 0 l-6 14 q-28 12 -56 0 z" fill="#E8EFF5"/>
<path d="M32 76 l9 13 9 -11 M70 78 l9 11 9 -13" fill="#fff" stroke="#AFC2D2" stroke-width="2.5" stroke-linejoin="round"/>
<path d="M52 82 l5 8 5 -8" fill="#fff" stroke="#AFC2D2" stroke-width="2"/>
<path d="M16 60 q-11 2 -13 11 q9 5 15 -3 z M104 60 q11 2 13 11 q-9 5 -15 -3 z" fill="#556E86"/>
<circle cx="14" cy="32" r="3.5" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="24" cy="20" r="2.2" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="106" cy="34" r="2.8" fill="none" stroke="#8ADAFF" stroke-width="2"/>
<path d="M8 104 l7 -3 M18 108 l7 -3 M98 108 l7 -3" stroke="#8ADAFF" stroke-width="2" stroke-linecap="round" opacity=".6"/><circle cx="46" cy="58" r="8" fill="#fff"/><circle cx="47.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="46.2" cy="58.2" r="1.44" fill="#fff"/><circle cx="74" cy="58" r="8" fill="#fff"/><circle cx="75.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="74.2" cy="58.2" r="1.44" fill="#fff"/><ellipse cx="38" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="82" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M102 18 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/>`,

bluewhale: `<defs><radialGradient id="bbwha" cx="50%" cy="35%" r="75%"><stop offset="0" stop-color="#649FD6"/><stop offset="1" stop-color="#3A78B0"/></radialGradient></defs><path d="M6 112 q10 -7 20 0 t20 0 t20 0 t20 0 t22 0" fill="none" stroke="#5AC8FA" stroke-width="4" stroke-linecap="round"/>
<path d="M50 26 q-2 -10 6 -14 q2 4 1 8 M60 24 q2 -9 9 -10 q0 6 -3 10" stroke="#9CD2F2" stroke-width="3.5" stroke-linecap="round" fill="none"/>
<path d="M56 12 q3 -5 7 0 q4 -5 7 1 q1 6 -7 9 q-8 -3 -7 -10 z" fill="#FF7FBE"/>
<circle cx="58" cy="66" r="38" fill="url(#bbwha)"/>
<path d="M58 28 a38 38 0 0 1 38 38 l-12 0 a26 26 0 0 0 -26 -26 z" fill="#2E6296" opacity=".55"/>
<ellipse cx="42" cy="46" rx="13" ry="8" fill="#fff" opacity=".35"/>
<path d="M94 90 q17 2 22 14 q-12 5 -21 -5 z M98 80 q16 -7 23 0 q-8 11 -21 7 z" fill="#3A78B0"/>
<path d="M24 84 q34 18 68 0 q-7 20 -34 20 q-27 0 -34 -20 z" fill="#D8ECF8"/>
<path d="M30 88 q28 13 56 0 M34 96 q24 10 48 0" fill="none" stroke="#A8CCE4" stroke-width="2.5"/>
<path d="M44 30 l4 -11 6 8 6 -10 6 10 6 -8 4 11 z" fill="#FFC83D" stroke="#E0A81E" stroke-width="2" stroke-linejoin="round"/><circle cx="52" cy="24" r="1.5" fill="#FF5D9E"/><circle cx="66" cy="24" r="1.5" fill="#FF5D9E"/>
<g transform="translate(10 96)"><ellipse rx="4" ry="2.6" fill="#FF9E7A"/><circle cx="1.5" cy="-.5" r=".8" fill="#3A2213"/><path d="M-4 0 q-3 -2 -4 -4" stroke="#FF9E7A" stroke-width="1.4" fill="none"/></g>
<g transform="translate(22 102)"><ellipse rx="3.4" ry="2.2" fill="#FFB39A"/><circle cx="1.2" cy="-.4" r=".7" fill="#3A2213"/></g>
<g transform="translate(104 100)"><ellipse rx="4" ry="2.6" fill="#FF9E7A"/><circle cx="-1.5" cy="-.5" r=".8" fill="#3A2213"/></g>
<circle cx="14" cy="52" r="3" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="108" cy="60" r="2.4" fill="none" stroke="#8ADAFF" stroke-width="2"/><circle cx="44" cy="58" r="8" fill="#fff"/><circle cx="45.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="44.2" cy="58.2" r="1.44" fill="#fff"/><circle cx="72" cy="58" r="8" fill="#fff"/><circle cx="73.3" cy="59.4" r="4" fill="#2E455C"/><circle cx="72.2" cy="58.2" r="1.44" fill="#fff"/><ellipse cx="36" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><ellipse cx="80" cy="68" rx="5" ry="3" fill="#FF9EB8" opacity=".85"/><path d="M50 72 q8 6 16 0" fill="none" stroke="#2E455C" stroke-width="3.5" stroke-linecap="round"/><path d="M12 26 l1.26 3.7800000000000002 3.7800000000000002 1.26 -3.7800000000000002 1.26 -1.26 3.7800000000000002 -1.26 -3.7800000000000002 -3.7800000000000002 -1.26 3.7800000000000002 -1.26 z" fill="#FFC83D"/><path d="M106 30 l1.19 3.57 3.57 1.19 -3.57 1.19 -1.19 3.57 -1.19 -3.57 -3.57 -1.19 3.57 -1.19 z" fill="#FFC83D"/>`,
});

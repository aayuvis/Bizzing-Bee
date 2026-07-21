import React from 'react';
import { WorldCover } from 'bizzing-bee-ds';
export const Compositions = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 720 }}>
    {(['quest','journeys','traps'] as const).map(c => <div key={c} style={{ borderRadius: 12, overflow: 'hidden' }}><WorldCover card={c} height={100} /></div>)}
  </div>
);
export const AcrossWorlds = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 720 }}>
    {['spellbound','arcade','lab'].map(w => <div key={w} style={{ borderRadius: 12, overflow: 'hidden' }}><WorldCover world={w} card="quest" height={100} /></div>)}
  </div>
);
export const DuskArt = () => <div style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 320 }}><WorldCover card="quest" height={110} dark /></div>;

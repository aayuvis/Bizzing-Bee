import React from 'react';
import { GameCover } from 'bizzing-bee-ds';
export const ArcadeShelf = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 720 }}>
    {(['buzz','boss','magic'] as const).map(g => <div key={g} style={{ borderRadius: 12, overflow: 'hidden' }}><GameCover game={g} height={100} /></div>)}
  </div>
);
export const VersusAndTimed = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 520 }}>
    {(['duel','beat'] as const).map(g => <div key={g} style={{ borderRadius: 12, overflow: 'hidden' }}><GameCover game={g} height={100} /></div>)}
  </div>
);

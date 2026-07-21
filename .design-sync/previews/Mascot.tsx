import React from 'react';
import { Mascot } from 'bizzing-bee-ds';
export const Moods = () => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', flexWrap: 'wrap' }}>
    {(['happy','excited','love','sleepy','think'] as const).map(m => (
      <span key={m} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700 }}><Mascot mood={m} size={84} /><div>{m}</div></span>
    ))}
  </div>
);
export const Hero = () => <Mascot mood="excited" size={140} />;

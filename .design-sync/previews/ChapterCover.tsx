import React from 'react';
import { ChapterCover } from 'bizzing-bee-ds';
export const Chapters = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, maxWidth: 720 }}>
    {['Ch 1','Ch 5','Ch 11'].map(l => <div key={l} style={{ borderRadius: 12, overflow: 'hidden' }}><ChapterCover label={l} height={94} /></div>)}
  </div>
);

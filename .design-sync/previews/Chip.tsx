import React from 'react';
import { Chip } from 'bizzing-bee-ds';
export const Tones = () => (
  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
    <Chip icon="flame" tone="treasure">12-day streak</Chip>
    <Chip icon="target">Traps · 3</Chip>
    <Chip icon="steps">Quest path</Chip>
  </div>
);

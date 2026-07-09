import React from 'react';
import { Icon } from 'bizzing-bee-ds';

export const CoreSet = () => (
  <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
    {['home','pencil','compass','joystick','chart','users','target','flame','crown','bulb','book','spark'].map(n => (
      <span key={n} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700 }}>
        <Icon name={n} size={24} />{n}
      </span>
    ))}
  </div>
);

export const Sizes = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="flame" size={14} /><Icon name="flame" size={20} /><Icon name="flame" size={28} /><Icon name="flame" size={40} />
  </div>
);

export const Tinted = () => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
    <Icon name="target" size={28} color="var(--accent)" />
    <Icon name="crown" size={28} color="var(--treasure, #F0B429)" />
    <Icon name="flame" size={28} color="#C4453C" />
  </div>
);

import React from 'react';
import { Root, Card, CardTitle, CardSub, Chip } from 'bizzing-bee-ds';
export const SpellboundLight = () => (
  <Card style={{ maxWidth: 360 }}>
    <CardTitle>The default world</CardTitle>
    <CardSub style={{ margin: '5px 0 8px' }}>Root sets the world and mode — every token, font and color follows.</CardSub>
    <Chip icon="spark">8 worlds × 3 modes</Chip>
  </Card>
);

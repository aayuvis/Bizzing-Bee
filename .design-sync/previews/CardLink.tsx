import React from 'react';
import { Card, CardSub, CardLink } from 'bizzing-bee-ds';
export const AccentLink = () => (
  <Card style={{ maxWidth: 340, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
    <CardSub>Your evolution ladder</CardSub><CardLink>See the ladder →</CardLink>
  </Card>
);

import React from 'react';
import { GoalRing } from 'bizzing-bee-ds';
export const States = () => (
  <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
    <GoalRing done={0} goal={10} /><GoalRing done={4} goal={10} /><GoalRing done={10} goal={10} />
  </div>
);

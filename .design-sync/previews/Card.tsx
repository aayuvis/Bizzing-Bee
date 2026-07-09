import React from 'react';
import { Card, CardTitle, CardSub, CardNote, CardLink, Chip, ActionButton, GoalRing } from 'bizzing-bee-ds';

export const DailyGoal = () => (
  <Card style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 420 }}>
    <GoalRing done={4} goal={10} size={112} />
    <div style={{ minWidth: 0 }}>
      <CardTitle style={{ marginBottom: 3 }}>Daily goal</CardTitle>
      <CardSub style={{ marginBottom: 11 }}>Spell 6 more to hit today’s goal.</CardSub>
      <ActionButton>Continue →</ActionButton>
    </div>
  </Card>
);

export const WelcomeCard = () => (
  <Card style={{ maxWidth: 380 }}>
    <CardSub>Good evening,</CardSub>
    <div style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 24, lineHeight: 1.1 }}>Ahana</div>
    <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
      <Chip icon="flame" tone="treasure">5-day streak</Chip>
    </div>
  </Card>
);

export const TypeRoles = () => (
  <Card style={{ maxWidth: 380 }}>
    <CardTitle>Card title — display face</CardTitle>
    <CardSub style={{ margin: '6px 0' }}>Card body copy — 13px muted with a relaxed line height for reading.</CardSub>
    <CardNote>Small-print note — 12px for metadata.</CardNote>
    <div style={{ marginTop: 8, textAlign: 'right' }}><CardLink>See the ladder →</CardLink></div>
  </Card>
);

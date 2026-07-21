# Bizzing Bee — build conventions

**Wrap every screen in `Root`.** `<Root world="spellbound" mode="light">…</Root>` sets `data-theme`/`data-mode` on the document — all tokens (palette, display font, radii, shadows) resolve through it. Without Root, components render in fallback purple with system fonts. Worlds: `spellbound` (default), `spotlight`, `galaxy`, `blade`, `lab`, `origami`, `arcade`, `elements`. Modes: `light`, `white` (pure paper), `dusk` (soft dark, white text).

**Style with tokens, not raw colors.** Layout glue uses CSS variables from `styles.css` (tokens are inlined in `_ds_bundle.css`): surfaces `--tint` (page bg) / `--paper` (cards) / `--tint-deep` / `--line`; ink `--ink` / `--muted`; action `--action` + `--action-ink` (per-world accent; alias `--accent`); semantics `--treasure`/`--treasure-tint`/`--treasure-deep` (gold rewards), `--mastered` (green), `--fix` (coral); type `--display` (per-world headline face — Fraunces in the default world) and `--ui` (Hanken Grotesk body); shape `--r-sm/md/lg/xl/pill`; elevation `--sh-rest/raised/overlay`, `--edge` (button press edge).

**Card idiom.** Content lives on `Card` (class `sb-card`) with exactly four text roles: `CardTitle` (17px display), `CardSub` (13px body), `CardNote` (12px small print), `CardLink` (accent link, e.g. "See the ladder →"). Don't invent new text styles inside cards.

**Art comes from generators, never hand-drawn:** `Icon` (duotone set: home, pencil, compass, joystick, chart, users, target, flame, crown, bulb, book, spark, gear, menu, volume, lock, grid, palette, steps, timer, cart, plus, close), `Mascot` (moods: happy, excited, love, sleepy, think), `WorldCover` (cards: quest, concepts, journeys, arcade, themes, traps), `GameCover` (games: buzz, beat, boss, mean, spot, origin, duel, magic), `ChapterCover` (label text). Pass `dark` on dusk surfaces — cover art inverts (light art on dark, dark art on light).

**Patterns:** `BandBanner` (skill banner: band 1–9 + tier, or `calibrating`), `GoalRing` (done/goal), `Chip` (`tone="treasure"` gold streaks, default accent), `ActionButton` (the only filled button), `TabBar` (mobile bottom nav: Home/Practice/Arcade/Progress/More), `TipOfDay` (gold quote card), `Wordmark` (italic *Bizzing* + upright Bee — never one word, never wrap).

**Idiomatic screen:**
```jsx
<Root world="spellbound" mode="light">
  <BandBanner band={4} tier="School-Bee Ready" />
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14, marginTop: 14 }}>
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <GoalRing done={4} goal={10} />
      <div><CardTitle>Daily goal</CardTitle><CardSub>Spell 6 more today.</CardSub><ActionButton>Continue →</ActionButton></div>
    </Card>
  </div>
</Root>
```

Read `styles.css` (and its `_ds_bundle.css` import) before styling anything custom; per-component docs live in each component's prompt file.

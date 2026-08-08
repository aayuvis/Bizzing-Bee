# Bizzing Bee — brand campaign

Campaign platform for the **Bizzing Bee** app (offline spelling-bee trainer, kids 8–15)
and the **Bizzy** story books (15 packs).

| File | What it is |
|---|---|
| `Bizzing-Bee-Deck.html` | Standalone deck — open in any browser |
| `deck.html` | Source (mood boards injected at build time) |

**Published deck:** https://claude.ai/code/artifact/58b4756b-037e-4b21-8fc9-8fa84bb9a6c0

## The finding that shaped it

The product's own data says who it was built for. The word library is **NSF Finals** and
Scripps; the vocabulary set is tagged *NSF 2026 Junior*; the parent coaching engine has
categories for **bee day** and **nerves**. Those only exist for a family with a competition
in the calendar.

So the platform runs at two speeds:

- **Ring 1 — the competitive bee circuit.** Won on credibility, not charm: word coverage,
  pronunciation accuracy, bee-day readiness. Reached through NSF chapters, coaches and
  parent groups, not media.
- **Ring 2 — the mainstream parent.** Won on fame, using the one thing the product produces
  that nothing else does: a child who visibly overtakes their parent.

Sequence: **earn the core, then buy the country.**

## Open items

- Verify the current user split between competitive and mainstream families.
- Confirm whether AUS/UK have an NSF equivalent — the structure is specifically American
  and the strategy does not port without one.
- Verify library and voice counts against the shipping build before any public claim.
- Mood boards were not generated: the Gemini key returned `429 — billing account`.

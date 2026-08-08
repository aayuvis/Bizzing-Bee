# Bizzing Bee — brand campaign

> **Open `Bizzing-Bee-Deck.html`.** Everything in `src/` is build machinery;
> `src/deck.source.html` has no images in it by design.

Campaign platform for the **Bizzing Bee** app (offline spelling-bee trainer, kids 8–15)
and the **Bizzy** story books (15 packs).

| File | What it is |
|---|---|
| **`Bizzing-Bee-Deck.html`** ← open this one | Standalone deck — open in any browser |
| `boards-contact-sheet.svg` | All 16 boards on one sheet |

**Published deck:** https://claude.ai/code/artifact/58b4756b-037e-4b21-8fc9-8fa84bb9a6c0

## The platform: Why Spell?

Spelling isn't the point — it's the first rung. Nobody's ambition for their child is *good
speller*, but every ambition they do have runs through the same place: the ability to find the
right word and say it well.

| Layer | |
|---|---|
| **The tools** | Words, spelling, vocabulary, quotes — the shoes and the backpack |
| **The journey** | Mastery over language |
| **The destination** | Sounding put together; being understood the first time |
| **The outcome** | Leader, founder, creator, teacher, salesperson — whatever they choose |

> Because everything you're going to be, you're going to have to say.

Every leader is an orator. Behind every one of them is an arsenal of words and metaphors.
Bizzing Bee is where a child starts assembling theirs.

**The trap:** aimed carelessly, "sound smart" becomes status anxiety. The honest version is
power and agency, not performance — being understood, being believed, being able to say the
thing you mean when it matters. Write to the child's ambition, not the parent's.

## The audience finding

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
- Boards are hand-authored vector in the app own visual language (honey/violet, honeycomb motif,
  recurring bee), matching how the app generates its cover art as inline SVG. Photographic boards
  were blocked: the Gemini key returns `429 — monthly spending cap exceeded`, which is a cap
  setting in AI Studio rather than depleted credit.

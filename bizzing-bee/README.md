# Bizzing Bee — brand campaign

> **Open `Bizzing-Bee-Deck.html` in a real browser** (Chrome, Safari, Edge — not the iOS
> Files preview, which blocks JavaScript). Everything in `src/` is build machinery;
> `src/deck.source.html` has no images in it by design.

Campaign platform for the **Bizzing Bee** app (offline spelling-bee trainer, kids 8–15)
and the **Bizzy** story books (15 packs).

| File | What it is |
|---|---|
| **`Bizzing-Bee-Deck.html`** ← open this one | Standalone deck, 2.8MB, all 32 boards embedded |
| `boards/` | The 32 mood boards as JPEGs |
| `src/build-boards.py` | Generates the 24 photoreal boards (Gemini `gemini-3-pro-image`) |
| `src/build-kid-boards.py` | Generates the 8 kid-campaign game key-art boards |
| `src/build-deck.py` | Embeds them into the deck as data URIs |

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

## The work — 32 concepts

| Set | Count | Audience | What it does |
|---|---|---|---|
| **Why Spell** (`WS1–WS8`) | 8 | Parents | The platform films — the arsenal, the interview, the toast, the kit |
| **The core** (`C1–C4`) | 4 | Ring 1 | Credibility: the fortnight, the French word, the oral round, the plateau |
| **The app** (`01–08`) | 8 | Parents | Proof creative — the child visibly ahead of the adult |
| **The books** (`09–12`) | 4 | Parents | Where it starts, and the ladder up into the app |
| **The kid campaign** (`K1–K8`) | 8 | **Children** | Spelling is the cheat code — the game, the villain, the collection |

### The kid campaign

The child cannot buy a subscription; they can only ask for one. So this tier is built for
**nag, not conversion** — it never says "educational", never shows a classroom, and sells the
game, because the game is true.

The app ships **14 real arcade engines** and a **31-chapter, six-act saga** with five boss
fights and a traitor. Its signature mechanic is the campaign: the villain's Unspelling drains
the world to **92% greyscale**, and every correct word sweeps the colour back. *You spell. The
colour comes back.*

Kid boards are deliberately drawn in a different visual language from the photoreal parent
boards — bold game key art in honey gold, deep violet and villain crimson, matching the app's
own art direction.

### The translation

Section 08 of the deck is the practical part: a feature-by-feature table converting everything
a child wants into the argument a parent buys. You do not need two campaigns — you need one
feature set with two captions. The strongest untold parent argument is that the app is
**offline, with no account, no leaderboard, no chat, no microphone and no ads**, and that
**it cannot be bought through** — Karma is never spent, coins buy only cosmetics.

## Boards

24 photoreal and illustrated boards, generated with Gemini `gemini-3-pro-image`, embedded
at 900px q72 so the deck stays under the mobile decoded-bitmap ceiling. Children are framed
wide, from behind or in profile — no board is a face-on portrait, so nothing here reads as
casting a real child.

**These are tonal references only** — casting, lighting and register, not final frames.

## Open items

- Verify the current user split between competitive and mainstream families.
- Confirm whether AUS/UK have an NSF equivalent — the structure is specifically American
  and the strategy does not port without one.
- Verify library and voice counts against the shipping build before any public claim.
- `C2 The French Word` is the highest-risk asset: get the synthetic-voice comparison
  legal-reviewed, name no competitor, and make sure the demo is reproducible.

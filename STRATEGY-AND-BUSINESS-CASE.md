# Bizzing Bee — Strategy & Business Case (Alpha → Commercial)

*Companion to `COMMERCIALIZATION.md` (the engineering roadmap). This document covers the
commercial layer: pricing, data & CRM infrastructure, unit economics at ~1,000 kids/year,
target markets, and go-to-market. Written for the alpha-launch decision set. Last updated
2026-07-24.*

---

## 1. Executive summary

Bizzing Bee is an offline-first, no-ads spelling-bee trainer for kids 8–15, built around a
parent→children model, a rich reward economy (avatars, badges, streaks), 14 arcade-style
saga engines, a full Google-TTS voice library (41k words), and a Word Coach that teaches,
tests, and revises. Internal persona UAT scores it **8.4/10** with an average willingness to
pay of **~$11.6/mo (≈$99/yr family)** — strongest on safety, voice, and ease-of-use, exactly
where a paid kids' product must win.

**The wedge is cultural, not just pedagogical.** For two decades the Scripps National Spelling
Bee has been dominated by Indian-American children, and a parallel ecosystem — North South
Foundation (NSF), the South Asian Spelling Bee, regional bees — reflects a diaspora that
invests heavily and early in competitive spelling. That is a concentrated, high-intent,
high-WTP audience that mass-market apps under-serve. **Bizzing Bee's go-to-market is the
Indian diaspora in the US and Canada, then India and SE Asia**, expanding outward from there.

**The business is capital-light and high-margin.** At 1,000 active kids the entire infra +
tooling + payment stack costs **~$4–8k/year** against **~$45–55k ARR**, i.e. **~88–90% gross
margin**. The constraint is distribution (reach and CAC), not cost. Cash break-even is
**~90–120 paying families**. This is a viable bootstrapped launch that can be grown on
community and content channels before any paid spend.

**The alpha ask:** ship Phases 0–4 of the engineering roadmap (auth, cloud sync, Stripe/
Razorpay entitlements), stand up the data + CRM infrastructure below, and run an invite-only
alpha of ~100–300 families sourced from diaspora spelling-bee communities.

---

## 2. Market & positioning

### 2.1 Why this audience
- **Proven intent + spend.** NSF alone runs bees for tens of thousands of children annually
  across North America; families routinely pay for coaching, word lists, and practice tools.
  Competitive spelling is a status pursuit in this community, not a casual one.
- **Under-served by incumbents.** General spelling apps (SpellingCity, Reading Eggs, Spelling
  Bee Ninja, Duolingo-adjacent) are broad and school-curriculum-shaped. None combine
  bee-specific word depth, origin/etymology drilling, arcade engagement, *and* a parent
  progress loop tuned to competitive prep.
- **Bilingual/immigrant parent behaviour.** These parents are digitally sophisticated,
  WhatsApp-native, community-organized (temples, cultural associations, bee circuits), and
  respond to word-of-mouth and coach endorsements far more than to paid ads.

### 2.2 Positioning statement
> *For competitive and aspiring young spellers (8–15) and the parents who coach them,
> Bizzing Bee is the practice companion that makes serious bee prep feel like a game they
> ask to play — safe, offline, one clear voice, and a weekly progress email a parent can act
> on.*

### 2.3 Competitive frame (indicative, not exhaustive)
| Product | Angle | Price band | Gap Bizzing Bee fills |
|---|---|---|---|
| VocabularySpellingCity | School lists, teacher tool | ~$5/mo · ~$60/yr | Not bee-specific; low game depth |
| Reading Eggs / Mathseeds | Early literacy, broad | ~$10/mo · ~$60–120/yr | Younger skew; not competitive-bee |
| Spelling Bee Ninja / SpellQuiz | Bee word lists, web | freemium · ~$5–8/mo | Thin engagement + weak parent loop |
| Scripps "Word Club" / study lists | Official prep | free / low one-time | Reference, not a daily habit engine |
| Duolingo (adjacent) | Gamified language | ~$7–13/mo | Not spelling-bee; no parent dashboard |

**Our differentiation:** bee-grade word depth + etymology, *one consistent* neural voice,
14 genuinely-fun engines, an avatar/badge economy kids chase, and a parent progress email —
all **offline-first** and **ad-free**. Safety + voice + ease are our highest-rated axes.

---

## 3. Target markets & localization

Sequence by intent density and payment/consent complexity.

| Priority | Market | Primary segment | Payments | Consent / data law | Pricing stance |
|---|---|---|---|---|---|
| **1** | **United States** | Indian & broader South-Asian diaspora; NSF/Scripps circuit | Stripe (cards, Apple/Google Pay) | **COPPA** (under-13, verifiable parental consent) | Full price (USD) |
| **2** | **Canada** | Indian diaspora; regional bees | Stripe | **PIPEDA** | Full price (USD/CAD) |
| **3** | **India** | Urban, exam-oriented, English-medium families | **Razorpay** (UPI, cards, netbanking) | **DPDP Act 2023** (child data, parental consent, no targeted ads to minors) | **PPP-discounted (INR)** |
| **4** | **SE Asia** | Indian diaspora in SG/MY, + English-medium families | Stripe (SG/MY) + local later | Singapore **PDPA**, Malaysia PDPA | Mid-tier (USD/SGD) |

**Localization requirements (light):** currency + payment rail per region, PPP pricing for
India, spelling-standard toggle (US vs UK/Commonwealth — matters for CA/India/SEA), and
region-appropriate consent copy. Content and voice are already English and reusable.

---

## 4. Pricing tiers (recommendation)

Anchor to the persona WTP band ($9–14/mo, avg $11.6) and the competitive $5–13/mo range.
Keep a genuinely useful **Free** tier for virality and consent-friendly onboarding; monetize
depth, multi-child, and the parent loop.

### 4.1 Global tiers (US / Canada / SE Asia — USD)
| Tier | Price | Who | What's included |
|---|---|---|---|
| **Free** | $0 | Trial + top of funnel | 1 child · core practice · daily word cap · basic lists · ad-free |
| **Plus** | **$7.99/mo** or **$59.99/yr** | 1 competitive speller | Full word lists (incl. NSF/official) · all 14 games · Word Coach + vocabulary · progress email · printables |
| **Family** | **$12.99/mo** or **$99.99/yr** | Households, siblings | Everything in Plus · up to **4 children** · full parent dashboard · priority support |
| **Coach / School** *(post-launch)* | from **$149/yr** | Coaches, small classes | Cohort of up to 15 · roster progress · bulk word lists |

> Annual is the hero (≈37% cheaper than monthly; better retention + cash up front). Default
> the toggle to annual. Offer a **7-day free trial** on paid tiers (card-optional in regions
> where that lifts conversion).

### 4.2 India (PPP-adjusted — INR via Razorpay)
| Tier | Price (INR) | ≈ USD |
|---|---|---|
| **Plus** | **₹249/mo** or **₹1,799/yr** | ~$3 / ~$21.6 |
| **Family** | **₹449/mo** or **₹2,999/yr** | ~$5.4 / ~$36 |

PPP discounting is standard for edtech in India and expands the reachable market without
cannibalizing USD revenue (geo-gated). SE Asia can sit between India and USD (e.g. SGD
mid-tier) once volume justifies local rails.

### 4.3 Pricing principles
- **Value metric = the parent + the household**, not per-child; Family tier captures siblings
  (a real diaspora pattern) at a clean price point.
- **No ads, ever** — it is a trust pillar and a stated differentiator; do not trade it for
  short-term revenue.
- **Grandfather** early alpha adopters at a founder rate (e.g. 40% off for life) to seed
  advocates.

---

## 5. Data & CRM infrastructure

Three storage concerns — **child/profile data**, **parent identity + email**, and the
**progress-email/CRM engine** — mapped onto the Supabase + Stripe/Razorpay stack from
`COMMERCIALIZATION.md`, with the commercial pieces added.

### 5.1 Profile & progress storage (child data — minimized)
Supabase Postgres, Row-Level Security keyed to the parent auth user (schema per
`COMMERCIALIZATION.md` Phase 3):

```
profiles(id=auth.uid, email, country, plan, marketing_consent, created_at)
children(id, parent_id→profiles, name_first, age_band, avatar, theme, created_at)
progress(child_id→children, key, value jsonb, updated_at)   -- levels, mastered, misses, streaks
activity_log(id, child_id, kind, payload jsonb, at)         -- for weekly aggregation
entitlements(profile_id, plan, active, source, expires_at)  -- written by payment webhook
email_events(profile_id, template, sent_at, opened, clicked)-- deliverability + suppression
```

- **Child PII is minimized by design:** first name + age *band* only — no birthdate, email,
  photo, location, or free-text. This is the single most important compliance decision and it
  is already how the app's `state.children[]` model works.
- **RLS everywhere:** every policy is `parent_id = auth.uid()`; family A can never read family
  B. Automated tests must prove this before launch.
- **Region selection:** pick a Supabase region deliberately (US for NA, consider a second
  region for India as DPDP guidance matures) and document data residency.

### 5.2 Parent identity & email storage (consent-first)
- **Parent account = the Supabase auth user;** email lives on `profiles.email`.
- **Two distinct email bases with different legal footing:**
  - **Transactional / service emails** (weekly progress report, receipts, security) — part of
    the service relationship; still include an unsubscribe for the *progress* email.
  - **Marketing / lifecycle emails** (tips, upgrade nudges, win-back) — require **explicit
    opt-in** (`marketing_consent`), ideally **double opt-in**, with easy withdrawal.
- **The email belongs to the *parent*, never the child** — this keeps COPPA/DPDP clean:
  we correspond with the adult about the child's progress, we do not contact children.
- Store a **suppression/bounce list** (`email_events`) so unsubscribes and hard bounces are
  honored globally.

### 5.3 Progress-email engine & CRM (the parent loop)
This is the retention and upgrade flywheel; treat it as core product, not an afterthought.

**Architecture (recommended):**
1. **Supabase scheduled Edge Function** (pg_cron, weekly) aggregates each child's week from
   `activity_log`/`progress` → words mastered, accuracy, streak, new badges, next goal.
2. Render a parent-facing HTML email (React Email / MJML template) — *first name only*, no
   child PII, one clear call-to-action.
3. Send via an **ESP**, logging to `email_events` for opens/clicks and suppression.

**Tooling options:**
| Need | Recommendation | Why |
|---|---|---|
| Transactional send (progress email, receipts) | **Resend** | Developer-first, cheap, great deliverability, React-Email native |
| Lifecycle / marketing automation + segments | **Loops.so** *(or Customer.io at scale)* | SaaS-shaped journeys, simple; Customer.io if segmentation gets complex |
| Consolidated (if you want one tool) | **Customer.io** | Handles transactional + lifecycle + segmentation in one, at a higher price |

> **Recommended launch stack:** Resend for the weekly progress email + receipts; Loops for
> onboarding/upgrade/win-back journeys. At ~1,000 families this sits on entry tiers
> (~$0–49/mo). Graduate to Customer.io only when segmentation demands it.

**Lifecycle journeys to build for alpha:**
- **Onboarding (Day 0–7):** welcome → set your speller up → first-week goal → "here's your
  first progress email."
- **Weekly progress email** (the anchor): celebrate the week, show the streak, nudge the next
  session. This is the habit + reactivation engine.
- **Streak-at-risk nudge:** "Aanya's 8-day streak is about to break."
- **Free→paid upgrade:** triggered on hitting the free daily cap or after N mastered words.
- **Win-back:** 14/30 days inactive.
- **Renewal / dunning:** pre-renewal heads-up; failed-payment recovery (Stripe/Razorpay).

### 5.4 Payments & entitlements
- **Stripe** (US/CA/SEA) + **Razorpay** (India — UPI is non-negotiable there).
- Entitlements are **server-authoritative**: payment webhook → Edge Function → `entitlements`;
  the client never grants paid access (strip/dev-gate `sb_devunlock` in production).
- Add **RevenueCat** only when/if you ship to app stores (unifies web + IAP entitlements).

### 5.5 Compliance checklist (do before charging money)
- [ ] **COPPA** (US): verifiable parental consent — satisfied by the parent-account model;
      privacy policy + direct-notice copy; no behavioral ads to children.
- [ ] **India DPDP Act 2023:** parental consent for minors, **no tracking or targeted ads to
      children**, data-fiduciary obligations; document lawful basis.
- [ ] **PIPEDA** (Canada), **PDPA** (Singapore/Malaysia): consent + access/erasure rights.
- [ ] **GDPR-K** if any EU traffic slips in (age-gate + consent).
- [ ] **Privacy Policy + Terms** reviewed by a lawyer familiar with kids' apps; **DPAs** with
      Supabase, Stripe, Razorpay, Resend/Loops.
- [ ] Data-subject requests: export + delete flow (RLS makes this a per-parent operation).
- [ ] Analytics that are **kid-safe** (PostHog with PII scrubbing; never ad-network SDKs).

---

## 6. Business case — unit economics at ~1,000 kids/year

**Assumption:** 1,000 *active kids* ≈ **~750 paying families** (avg ~1.35 kids per paying
family; Family tier carries siblings). Modeled at steady state; realized Year-1 revenue is
lower because families are acquired across the year.

### 6.1 Revenue model (steady-state at 1,000 kids)
Region mix (families) and blended annual revenue per family:

| Region | % families | Blended $/family/yr* | Contribution |
|---|--:|--:|--:|
| US | 45% | $82 | $36.9 |
| Canada | 10% | $82 | $8.2 |
| India | 30% | $29.5 | $8.9 |
| SE Asia | 15% | $45 | $6.8 |
| **Blended** | **100%** | **≈ $60.7** | **$60.7** |

*Assumes ~55% Family / 45% Plus tier mix and ~60% annual plans within each region.*

- **Steady-state subscription revenue:** 750 families × ~$60.7 ≈ **$45.5k ARR** (range
  **$45–55k** depending on tier/annual mix and India share).
- **Per-kid blended ≈ $45/yr**; per North-American family ≈ $82/yr.

### 6.2 Cost structure (annual, at this scale)
| Line | Estimate | Note |
|---|--:|---|
| Supabase (Pro) | ~$300 | Postgres + auth + edge + realtime |
| Email/CRM (Resend + Loops) | ~$300–700 | Entry tiers cover ~1k families |
| Payment processing | ~$1,600 | ~3.5% blended (Stripe/Razorpay) |
| Hosting/CDN (Cloudflare Pages/R2) | ~$0–300 | Static + voice CDN, tiny at scale |
| Analytics/error (PostHog/Sentry) | ~$0–300 | Free/entry tiers |
| Domain, misc SaaS | ~$200 | |
| **Recurring COGS+tools** | **~$3–4k/yr** | |
| Legal (privacy/terms/DPA review) | ~$2–5k **one-time** | Amortize |

**Gross margin ≈ 88–90%.** Infra is a rounding error against revenue; the business is
distribution-limited, not cost-limited.

### 6.3 Unit economics
- **ARPU:** ~$60.7/family/yr blended (~$82 NA, ~$29.5 India).
- **Retention:** assume ~2-year average subscription life (kids age out / seasonal prep);
  annual plans retain better than monthly.
- **LTV:** ~$60.7 × 2 yrs × 0.9 margin ≈ **~$109/family** (~$80/kid).
- **CAC target:** keep < LTV/3 ≈ **$36/family**. Community/organic channels should land
  **$10–30**; reserve paid spend for proven funnels.
- **Payback:** < 12 months on annual plans (often immediate for annual up-front).
- **Cash break-even:** recurring costs ÷ margin ≈ **$4k ÷ 0.9 ≈ ~$4.5k revenue ≈ ~90–120
  paying families.** Everything above funds growth or founder comp.

### 6.4 Three-year sketch (illustrative)
| | Y1 (alpha→launch) | Y2 | Y3 |
|---|--:|--:|--:|
| Active kids (end of year) | 1,000 | 3,000 | 6,000 |
| Paying families | ~750 | ~2,250 | ~4,500 |
| ARR | ~$46k | ~$137k | ~$273k |
| Gross margin | ~88% | ~89% | ~90% |
| Constraint | reach/consent flows | CAC + retention | localization + team |

**Read:** this is a bootstrappable, high-margin niche business at 1k kids, with a credible
path to low-six-figure ARR as the diaspora wedge widens into general English-medium markets.
It is **not** a venture-scale story at these numbers alone — the venture case would require
either (a) breaking out of the niche into mainstream literacy, (b) a school/coach B2B2C
motion, or (c) much higher volume in India at PPP pricing. Decide which game you're playing
before raising.

---

## 7. Go-to-market

Channel strategy is community-first, because that is where this audience decides.

| Channel | Motion | Est. CAC | Notes |
|---|---|--:|---|
| **Bee circuit partnerships** (NSF, regional bees, coaches) | Endorsements, practice-tool listings, coach codes | $5–20 | Highest-intent; grandfather coaches as advocates |
| **Diaspora community** (WhatsApp groups, temples, cultural assns, Facebook parent groups) | Referral + word-of-mouth; shareable progress cards | $0–10 | The app already generates shareable avatar/badge/celebration cards — lean into this |
| **Content/SEO** ("NSF word lists", "Scripps prep app", etymology guides) | Organic; the 41k-word library is an SEO asset | $ low, slow | Compounds over time |
| **Referral program** | "Give a month, get a month" | negative | Family tier makes sharing natural |
| **Paid (later, targeted)** | Meta/Google to lookalikes of converters | $20–40 | Only after organic funnel proven |

**Alpha (Phase 0–4):** invite-only, 100–300 families sourced from 3–5 coaches / community
leaders. Goal is not revenue — it's retention proof (weekly-email open rate, streak
retention, free→paid intent) and testimonials.

---

## 8. Roadmap to alpha & paid launch

Ties to `COMMERCIALIZATION.md`:
1. **Phase 0** — entity, domain, Stripe + Razorpay, Supabase project, **legal review**, consent copy.
2. **Phase 1** — `Store` seam (sync vs device-local split, schema versioning). *Linchpin.*
3. **Phase 2** — parent auth; migrate-on-first-login for existing local users.
4. **Phase 3** — cloud sync + RLS; `activity_log` feeding the weekly aggregation.
5. **Phase 4** — Stripe/Razorpay entitlements, server-authoritative gate.
6. **CRM stand-up** — Resend + Loops; ship the weekly progress email + onboarding journey.
7. **Invite-only alpha** → measure → iterate → open paid.

**Alpha exit criteria:** RLS proven; weekly-email open rate ≥ 40%; ≥ 1 clean payment per
region rail; W4 kid retention healthy; ≥ 10 usable testimonials.

---

## 9. Key risks & mitigations
| Risk | Mitigation |
|---|---|
| **Distribution is the whole game** | Lock 3–5 coach/community partners *before* building billing; validate reach first |
| Kids' data compliance misstep | Data minimization already in the model; lawyer-reviewed consent; no ad SDKs; DPAs |
| India PPP revenue is thin | Treat India as reach/brand + funnel for NA diaspora referrals; don't over-index Y1 revenue there |
| Seasonality (bee calendar) | Weekly-email habit loop + off-season content (vocabulary, saga) to flatten churn |
| Voice/content cost creep | Already one-time-generated; CDN cost negligible at 1k scale |
| Single-founder bandwidth | Keep vanilla stack + managed services (Supabase/Stripe/Resend) to minimize ops |

---

## 10. KPIs to instrument at launch
- **Activation:** % new families whose child completes a first practice session in 48h.
- **Habit:** weekly active kids; median streak length; weekly progress-email **open + click**.
- **Monetization:** free→paid conversion; trial→paid; annual mix; blended ARPU by region.
- **Retention:** M1/M3 family retention; kid W4 retention; renewal rate.
- **Unit economics:** CAC by channel; LTV:CAC; payback months.
- **Trust/quality:** support tickets per 100 families; refund/chargeback rate; NPS.

---

### Decisions this document is asking you to make
1. **Pricing:** approve the Free / Plus $7.99·$59.99 / Family $12.99·$99.99 structure + India PPP (₹).
2. **Data stack:** Supabase (profiles/progress, RLS) + Stripe + Razorpay — confirm.
3. **CRM:** Resend (transactional/progress email) + Loops (lifecycle) — confirm, or single-tool Customer.io.
4. **Market sequence:** US/Canada diaspora first, India + SEA as reach/PPP — confirm.
5. **Game you're playing:** bootstrapped niche (this model) vs venture (needs B2B2C/scale thesis).

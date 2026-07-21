# Spellbound → Commercial App: Staged Roadmap

Turning the current offline, no-build, `localStorage` SPA into a commercial product
with logins, cloud data storage, payments, and room to grow — **without throwing away
what works** (offline-first play, the parent→children model, the premium/coins economy).

The whole plan hinges on one idea: **introduce a storage seam first**, then swap what's
behind it from `localStorage` to the cloud. Everything else bolts onto that seam.

---

## ⚠️ Phase 0 — Decisions & legal (do this BEFORE any code)

This is a **children's** app. In the US, COPPA applies to under-13s; in the EU, GDPR-Kids.
You cannot commercially collect children's data without a compliant parental-consent model.
Architecturally this is easy because your data model already fits:

- **Only the parent has an account / credentials.** Children are *non-authenticating profiles*
  under the parent (you already store `state.children[]`).
- **Minimize child PII:** first name + age *band* (not birthdate), progress data. No emails,
  photos, location, or free-text that could carry PII for a child.
- Draft a **Privacy Policy + Terms**, get a **DPA** with each vendor (Supabase, Stripe),
  and get a lawyer to review the consent flow. (Not optional for a paid kids' app.)

Also settle these product forks now — they change the stack:

| Decision | Recommended default | Why |
|---|---|---|
| Monetization | **Freemium subscription** (monthly + annual "family") | You already model `premium` + coins; recurring beats one-time for content apps |
| Platforms at launch | **Web + PWA first**, mobile later | Fastest path; avoids the 15–30% app-store cut on day one |
| Backend | **Supabase** (Postgres + Auth + Storage + Edge Functions + RLS) | Relational progress data, per-family row security, own your SQL, generous free tier |
| Payments | **Stripe** (Checkout + Billing Portal + webhooks) | Standard for web subscriptions; add RevenueCat only when you ship to app stores |
| Frontend | **Keep vanilla for now**; add Vite build in Phase 5 | No forced rewrite; modularize when the team/feature-set grows |

Set up: domain, business entity, Stripe account, Supabase project.

---

## Phase 1 — Refactor to a storage adapter (still 100% offline, no backend yet)

The single most important step. Right now `app3.js` calls `localStorage` directly
(`save()` at ~line 2718, `init()` load at ~line 2736, plus `sb_voice`, `sb_devunlock`,
`sb_evofeedback`). Wrap all of it behind one interface:

```js
// store.js — the seam. Today: localStorage. Tomorrow: cloud. Callers never change.
const Store = {
  async loadProfile()      { /* returns the sb_saas_v2 blob */ },
  async saveProfile(blob)  { /* debounced write */ },
  async loadDevice(key)    { /* voice choice, etc. — never syncs */ },
  async saveDevice(key,v)  { },
  onRemoteChange(cb)       { /* no-op until Phase 3 */ },
};
```

Then:
1. Replace every direct `localStorage`/`save()`/`load()` call with `Store.*`.
2. **Split state into two buckets:** *sync* (children, progress, entitlements) vs
   *device-local* (chosen voice, sound on/off, theme). Only the first bucket goes to the cloud.
3. **Formalize schema versioning.** You already jumped `v1→v2`; add a `schemaVersion` field
   to the blob and a `migrate(blob)` function so future changes are safe. This is what
   "ensuring future enhancements are possible" concretely means for stored data.

**Outcome:** app behaves identically and stays fully offline, but now has a clean seam to
plug the cloud into. Nothing else in this roadmap requires touching game/UI code again.

---

## Phase 2 — Accounts (auth)

- Create the Supabase project; enable **email/password + magic-link**, plus **Google** and
  **Apple** sign-in (Apple is mandatory if you ever ship iOS).
- Wire your existing `goSignup` / `goSignin` stubs (`app3.js:432` / `:796`) to Supabase Auth.
- **Parent account = the Supabase auth user.** Children = rows owned by that user.
- **Migrate-on-first-login:** when a parent signs in and the cloud is empty, upload their
  existing `localStorage` `sb_saas_v2` blob. Existing users lose nothing.

---

## Phase 3 — Cloud data + offline sync

Minimal Postgres schema (progress only — **word lists stay bundled/static**, so the DB
stays tiny and cheap):

```
profiles(id=auth.uid, email, created_at, plan)
children(id, parent_id → profiles, name, age_band, avatar, theme, created_at)
progress(child_id → children, key, value jsonb, updated_at)   -- levels, xp, mastered, misses
activity_log(id, child_id, kind, payload jsonb, at)
entitlements(profile_id, premium bool, source, expires_at)     -- written by Stripe webhook
```

- **Row-Level Security:** every table policy = `parent_id = auth.uid()`. A family can only
  ever read/write its own rows. This is your security backbone.
- **Offline-first sync:** keep `localStorage` as the working cache (via the Phase-1 Store).
  Write-through to Supabase; on load, reconcile with `updated_at` timestamps
  (last-write-wins per key is fine for single-family, single-active-device usage).
  Implement this **inside `Store`** — callers still never change.
- Supabase Realtime can push cross-device updates into `Store.onRemoteChange()`.

---

## Phase 4 — Payments & entitlements (server-authoritative)

- Define Stripe **Products/Prices**: monthly, annual, optional family tier.
- **Stripe Checkout** to buy, **Billing Portal** to manage/cancel — both hosted, minimal code.
- **Webhook → Supabase Edge Function:** on `checkout.session.completed` and subscription
  updates, write `entitlements.premium` + `expires_at`.
- **Move the premium gate server-side.** Today `state.premium` and `sb_devunlock` are
  client-trusted — trivially bypassable, which is fine for a family build but not for a paid
  product. Read entitlement from the DB (protected by RLS); **strip or dev-gate `sb_devunlock`
  in production**. Coins/shop can stay client-side; only *paid-content unlocking* must be
  server-verified.
- Mobile later → Apple/Google require their IAP for digital goods; add **RevenueCat** to
  unify web + store subscriptions behind one entitlement.

---

## Phase 5 — Content pipeline & future-proofing

This is the "future enhancements" layer:

- **Versioned content delivery.** Move `words-data.js`, `concepts`, `lessons`, `themes`,
  `voice-manifest` behind a `content_version` check so you can ship new words/lessons/voice
  packs **without redeploying the app**. Start simple: version the JSON + fetch-if-newer from
  a CDN; the bundled copy is the offline fallback.
- **Feature flags** (PostHog or Supabase config) to roll out and A/B-test enhancements safely.
- **Analytics + error monitoring:** PostHog (product analytics + flags) + Sentry (crashes).
- **Modularize + add a build.** Split `app.js/app2.js/app3.js` into ES modules along clean
  seams — `content`, `engine` (game/scoring logic), `data` (Store/sync), `auth`, `billing`,
  `ui` — and adopt **Vite**. Keeps velocity high as the codebase and team grow.

---

## Phase 6 — Distribution & ops

- **Host** the static frontend on Vercel / Netlify / Cloudflare Pages; custom domain + HTTPS.
- **PWA:** add a manifest + service worker so it installs and runs offline — this *is* your
  current "double-click and it works offline" promise, upgraded.
- **CI/CD** (GitHub Actions): lint → your existing Playwright headless smoke test → deploy on
  merge to `main`.
- **Mobile (optional):** wrap with **Capacitor** for App Store / Play Store; RevenueCat for IAP.
- **Ops:** automated DB backups, uptime monitoring, a support email, a status/changelog page.

---

## Suggested sequencing

- **Smallest viable commercial launch = Phases 0–4, web + PWA.** That gives you logins,
  cloud-synced progress, and paid subscriptions.
- Phases 5–6 are continuous investment after launch.
- Phase 1 is the linchpin — do it carefully and everything after is low-risk plumbing behind
  the `Store` seam.

## Security checklist (carry through every phase)

- Never trust the client for entitlements — DB + RLS is the source of truth.
- All secrets (Stripe keys, service-role keys) live in Edge Functions, never in client JS.
- RLS on every table; test that family A cannot read family B.
- Rate-limit auth + write endpoints.
- Remove/dev-gate `sb_devunlock` in production builds.
- Data minimization for children; signed DPAs with every vendor.

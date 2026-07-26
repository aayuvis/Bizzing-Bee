# Bizzing Bee — Launch Readiness Checklist & Ops Architecture

_Companion to STRATEGY-AND-BUSINESS-CASE.md. Assumes a small team (1 strong full-stack dev + design/QA help) and a phased launch. Estimates are engineering build time; **legal review and payment-processor approval are calendar dependencies you cannot code past.**_

**Target markets:** US · Canada · India · SE-Asia Indian diaspora. **Users:** children 8–15 (parent-owned accounts). This is a **kids' product**, so children's-privacy law is the critical path, not the code.

---

## 0. Where we are today (baseline)

| Area | Status |
|---|---|
| App (spelling engine, 40k words, games, saga, quotes, voice) | ✅ Built, live on GitHub Pages (`gh-pages`) |
| Offline / local-first (localStorage) | ✅ Works with zero backend |
| Tier **gating logic** (`state.premium`, paywalls, free caps) | 🟡 ~70% wired, but "premium" is a local flag with no real source of truth |
| Backend / API / database | ❌ None |
| Accounts / auth | ❌ None |
| Payments | ❌ None |
| Analytics / CRM / admin / promotions | ❌ None |
| Legal (privacy policy, ToS, consent) | ❌ None |

**Deployable *free* today. Not deployable as a *paid, login-gated* product without the workstreams below.**

---

## 1. Launch-readiness checklist by workstream

### A. Product / App  (mostly done)
- [x] Core learning app, games, content, offline PWA
- [x] Deep QC pass (renders, engines, mobile, content safety)
- [ ] PWA installability + service worker for true offline + "Add to Home Screen"
- [ ] App-wide error boundary + crash/telemetry hook (see Analytics)
- [ ] "Guest → account" migration: move localStorage progress into a signed-in cloud account without data loss
- [ ] Kill-switch / maintenance mode (remote-config driven — see Ops)

### B. Backend & Data
- [ ] Choose stack (recommendation: **Supabase** — Postgres + Auth + storage + row-level security in one, or Firebase). Avoid hand-rolling auth.
- [ ] Data model: `parent` (owner) → `child_profile[]` → `progress`, `subscription`, `consent_records`, `email_prefs`
- [ ] Local-first **sync layer** (client keeps working offline; syncs on login) — this is the largest single build item
- [ ] Backups, migrations, environment separation (dev / staging / prod)
- [ ] Data export + hard-delete endpoints (needed for legal DSAR/COPPA)

### C. Accounts & Auth
- [ ] **Parent** sign-up/login (email+password or magic link / Google). Children never create their own accounts.
- [ ] Multi-child profiles under one parent (already the app's mental model — `state.children[]`)
- [ ] Parent PIN gate on billing/settings (partly exists in-app)
- [ ] Password reset, email verification, session management

### D. Payments & Pricing
- [ ] **Stripe** (US/CA/global) — Checkout + billing portal + webhooks (`checkout.session.completed`, `customer.subscription.updated/deleted`)
- [ ] **Razorpay** for **India** — Stripe India recurring is restricted by RBI e-mandate rules; India needs a separate rail. Decide: India in Phase 2 or later?
- [ ] Subscription state → **the real source of truth** for tier gating (replaces the local `premium` flag)
- [ ] Tiers implemented (from strategy doc): Free / Premium (monthly + annual) / regional pricing (US vs India PPP)
- [ ] Multi-currency + **Stripe Tax** (sales tax / VAT / GST) registration
- [ ] Dunning (failed-payment retries), refunds, proration, free-trial logic
- [ ] Webhook → grant/revoke entitlement flow, idempotent + reconciled nightly

### E. Legal & Compliance  ⚠️ CRITICAL PATH
- [ ] **Privacy Policy + Terms of Service** (needed even for the free version)
- [ ] **COPPA (US)** — verifiable parental consent before collecting a child's data; data minimization; **no behavioral ads / no third-party ad SDKs**
- [ ] **India DPDP Act 2023** — in force; verifiable parental consent for minors, no tracking/targeted ads to children
- [ ] **PIPEDA (Canada)**; **UK/EU** Age-Appropriate Design Code + GDPR-K if you serve those regions
- [ ] **Verifiable parental consent flow** — the payment/parent-email step can double as the consent gate (design it in, don't bolt on)
- [ ] Data-subject requests: export + delete self-serve
- [ ] **DPAs** signed with every vendor (Supabase/Stripe/analytics/email)
- [ ] Cookie/consent banner only if you use any non-essential cookies (aim to avoid them)
- [ ] **Children's-privacy counsel review** — external, ~2–4 wks calendar. Templates (Termly/iubenda) bootstrap; a kids product still needs a lawyer sign-off. **This gates paid launch.**

### F. Analytics & Growth  (see architecture §2)
- [ ] Product analytics (funnels, retention, activation) — **privacy-safe, self-hostable** (PostHog)
- [ ] Revenue analytics (MRR, churn, LTV, CAC) — Stripe + warehouse
- [ ] Parent progress emails (the CRM loop from the strategy doc)
- [ ] Attribution for the coach-led GTM (referral codes, coach dashboards)

### G. Ops / Admin / Promotions  (see architecture §2)
- [ ] Internal **admin console** (support, refunds, entitlement overrides, content moderation)
- [ ] **Promotions / feature-flag / remote-config** service so pricing tests, promo banners, and coupons deploy **without an app redeploy**
- [ ] Coupon / referral-code engine (Stripe coupons + your codes)
- [ ] Content-update pipeline (word/quote fixes shipped as data, already the pattern)

### H. Security & Reliability
- [ ] Secrets management (no keys in client — note: this app currently has none, keep it that way)
- [ ] Rate limiting, input validation, RLS on the DB
- [ ] Pen-test / security review before taking money
- [ ] Uptime monitoring + on-call + status page
- [ ] Staging environment mirroring prod

---

## 2. Where the analytics / promotions / admin tools sit

**They don't fit the current architecture — because there is no backend yet.** Today the app is a static client on a CDN. All of this lives in a **new "control plane" tier** you stand up between the client and the database. The golden rule: **buy, don't build** these — you assemble managed services and write only thin glue.

```
                         ┌──────────────────────────────────────────┐
   CHILD / PARENT  ─────►│  CLIENT APP  (existing static PWA)        │
                         │  GitHub Pages / CDN — unchanged           │
                         └───────────────┬──────────────────────────┘
                                         │ HTTPS (auth'd API + event beacons)
                         ┌───────────────▼──────────────────────────┐
                         │  BACKEND / CONTROL PLANE   (NEW)          │
                         │  Supabase or small Node svc (Render/Fly)  │
                         │  • Auth  • Postgres DB  • Sync API        │
                         │  • Stripe/Razorpay webhooks → entitlement │
                         │  • Emits analytics events                 │
                         └──┬───────────┬───────────┬───────────┬────┘
                            │           │           │           │
          ┌─────────────────▼──┐ ┌──────▼──────┐ ┌──▼────────┐ ┌▼──────────────┐
          │ PRODUCT ANALYTICS  │ │ CRM /       │ │ REMOTE-   │ │ ADMIN CONSOLE │
          │ PostHog            │ │ MESSAGING   │ │ CONFIG /  │ │ Retool /      │
          │ (self-host / EU)   │ │ Customer.io │ │ FLAGS     │ │ Forest Admin  │
          │ funnels, retention │ │ or Loops    │ │ PostHog   │ │ support,      │
          │ + session/crash    │ │ parent      │ │ flags or  │ │ refunds,      │
          └─────────┬──────────┘ │ progress    │ │ Firebase  │ │ entitlement,  │
                    │            │ emails,     │ │ Remote    │ │ moderation,   │
          ┌─────────▼──────────┐ │ promo blasts│ │ Config    │ │ push promos   │
          │ WAREHOUSE + BI     │ └─────────────┘ └─────┬─────┘ └───────────────┘
          │ BigQuery/Postgres  │                       │
          │ + Metabase         │      "PROMOTIONS DEPLOYMENT TOOL" =
          │ MRR/churn/LTV/CAC  │      Remote-Config/Flags  +  CRM  +  Admin console
          └────────────────────┘      (config-driven, no app redeploy)
```

### What each thing is, and the recommendation
- **"Backend analytics tool"** → you don't build a bespoke engine. Stand up **PostHog** (self-hostable / EU-cloud, the kid-privacy-friendly choice) for product analytics + funnels + retention + session/crash capture. Pipe Stripe + app data into a **warehouse** (BigQuery or your Postgres) and put **Metabase/Retool** on top for revenue/BI dashboards. The only thing you "build" is the event-emission glue and a couple of dashboards.
- **"Promotions deployment tool"** → this is really **three cooperating pieces**, all config-driven so marketing can act without an engineering deploy:
  1. **Remote-config / feature flags** (PostHog flags or Firebase Remote Config) — turn promo banners, price experiments, and tier changes on/off live.
  2. **CRM / marketing automation** (Customer.io, Braze, or Loops) — parent progress emails + promo campaigns, triggered by backend events.
  3. **Admin console** (Retool / Forest Admin) — the human surface to launch a promo, issue a coupon, override an entitlement, or moderate content.
- **Admin/support** → Retool or Forest Admin sitting directly on the DB. Don't build a custom admin UI first.

### Kids-privacy constraint on all of the above (non-negotiable)
Because users are children: **no third-party advertising/tracking SDKs**, no cross-site identifiers, IP anonymization, minimal PII in events (use a parent-scoped ID, never child names), and a **signed DPA** with every tool. This is why **PostHog (self-hosted or EU) is preferred over Google Analytics/Mixpanel defaults**, and why the CRM only ever emails the **parent**.

---

## 3. Phased timeline (recommended)

| Phase | Scope | Build effort | Gates |
|---|---|---|---|
| **0 — now** | Ship **free** app + Privacy Policy/ToS. Local-only data (lowest risk). Start coach-led acquisition. Stand up PostHog for basic funnels. | ~2–5 days | Policies drafted |
| **1 — ~2–3 wks** | Managed auth + cloud save (Supabase). Guest→account migration. Admin console (Retool). Still free. | ~2–3 wks | — |
| **2 — ~+3–4 wks** | Stripe (+Razorpay for India) + real tier enforcement + **parental-consent flow** + CRM progress emails + promotions/flags. **Paid launch.** | ~3–4 wks | ⚠️ **Legal sign-off + payment approvals** |

**All-in to compliant paid launch: ~6–10 weeks**, engineering + legal running in parallel. The variance is almost entirely legal review and India payment onboarding — the two items outside your control.

---

## 4. Immediate decisions needed (unblock everything)
1. **Backend stack:** Supabase (fastest, all-in-one) vs Firebase vs custom Node? — _recommend Supabase._
2. **India in Phase 2 or later?** (Razorpay adds scope; deferring simplifies the first paid launch.)
3. **Engage children's-privacy counsel now** — it's the long pole; start week 1.
4. **Analytics choice:** PostHog self-hosted vs EU-cloud (privacy posture vs ops effort).
5. **Free-tier generosity** (from strategy doc) — final call on what's free vs Premium, since it drives the gating work.

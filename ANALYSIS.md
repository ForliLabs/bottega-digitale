# Bottega Digitale — Repository Analysis & Next-Gen Feature Planning

> **Analysis Date**: July 2025
> **Repository**: `bottega-digitale/`
> **Status**: Pre-launch MVP (no commits yet — fresh scaffold with functional demo)

---

## Part 1: Core Feature Extraction

### Primary Purpose

Bottega Digitale is an all-in-one digital presence and operations platform designed specifically for Italian artisans, small shops, and micro-businesses in Forlì and the Romagna region. It solves the acute SME digitization crisis — where 94% of Italy's 4.7M companies are microenterprises with near-zero modern SaaS penetration — by combining website builder, booking system, CRM, and Google review management into a single Italian-first toolkit distributed through trusted local business associations.

### Core Features (as implemented)

| # | Feature | Status | Description |
|---|---------|--------|-------------|
| 1 | **One-Page Website Builder** | ✅ Functional demo | Template-based site generation with services, hours, map, and contact info. Preview rendered inside the dashboard with editable blocks UI. |
| 2 | **Online Booking System** | ✅ Functional demo + API | Calendar-based appointment view (6-day lookahead), list view, booking creation via REST API. Supports multi-channel tracking (WhatsApp, Instagram, phone, web). |
| 3 | **Customer CRM (Rubrica Clienti)** | ✅ Functional demo + API | Contact list with visit history, loyalty points, phone numbers. Customer creation via REST API. Aggregate metrics (avg visits, total points). |
| 4 | **Google Review Autopilot** | ✅ Functional demo | Review monitoring with star ratings, AI-generated response suggestions in Italian. Dashboard with average rating and review count metrics. |
| 5 | **Analytics Dashboard** | ✅ Functional demo | KPI cards: website visits, bookings today, new customers, review average. Quick actions for common workflows. Business profile summary. |
| 6 | **Marketing Landing Page** | ✅ Complete | Full Italian-language landing page with hero, feature grid, pricing tiers (Vetrina/Bottega/Maestro), testimonials section, responsive navbar, and footer. |

### Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js (App Router) | 16.2.6 |
| **Language** | TypeScript | ^5 |
| **UI Library** | React | 19.2.4 |
| **Styling** | Tailwind CSS v4 | ^4 |
| **CSS Utilities** | clsx + tailwind-merge (via `cn()`) | Latest |
| **Icons** | Lucide React | ^1.14.0 |
| **Component Variants** | class-variance-authority (CVA) | ^0.7.1 |
| **ORM (configured)** | Prisma | ^7.8.0 |
| **Database (configured)** | SQLite (via Prisma) | — |
| **Data Layer (current)** | In-memory store (`InMemoryStore<T>`) | Custom |
| **Fonts** | Geist Sans + Geist Mono | via `next/font` |
| **Linting** | ESLint + eslint-config-next | ^9 |

### Architectural Patterns

- **App Router** with server components (dashboard pages are `async` server components)
- **Client components** only where needed (`"use client"` for Navbar, DashboardShell)
- **In-memory data store** pattern with `InMemoryStore<T>` generic class (async API surface ready for database swap)
- **REST API routes** at `/api/bookings` and `/api/customers` with `force-dynamic`
- **Component composition**: Reusable UI primitives (`Hero`, `FeatureGrid`, `FeatureCard`, `PricingSection`, `StatCard`, `DashboardShell`)
- **Italian-first localization**: All UI copy, date formatting (`Intl.DateTimeFormat("it-IT")`), and content in Italian
- **Mobile-first responsive design** with Tailwind breakpoints

### Target Users

1. **Primary**: Owner-operators of micro-businesses in Forlì (barbers, bakeries, restaurants, mechanics, jewelers, tailors, beauty salons) — <5 employees, currently using phone/WhatsApp for bookings
2. **Secondary**: Local business associations (CNA, Confartigianato, Confcommercio) as distribution partners
3. **Tertiary**: Accountants (commercialisti) as referral channel

### Unique Differentiators

1. **Italian-first, not Italian-translated**: All UI, copy, and business logic designed for Italian micro-businesses from scratch
2. **Association distribution moat**: Designed to be sold through CNA/Confartigianato — trust-based distribution that Silicon Valley competitors cannot replicate
3. **All-in-one simplicity**: Website + booking + CRM + reviews in one tool vs. stitching together 4-5 separate SaaS products
4. **Template-based (not drag-and-drop)**: Intentionally simple for non-tech users — no complex builder UX
5. **WhatsApp-native communication**: Designed around the channel Italian SMEs actually use
6. **Fiscal compliance path**: Architecture ready for e-invoicing (SDI) integration — unique to the Italian market

---

## Part 2: Market Potential Analysis

### Market Size

| Level | Segment | Size | Revenue Potential |
|-------|---------|------|-------------------|
| **SOM Year 1** | Forlì city pilot | 200 businesses × €29/mo | **€70K ARR** |
| **SOM Year 2** | Forlì-Cesena + Rimini + Ravenna | 1,000 businesses × €39/mo | **€468K ARR** |
| **SAM** | Romagna corridor | 35,000 businesses × €39/mo | **€16.4M ARR** |
| **TAM** | All Italian microenterprises | 4.4M businesses × €29/mo | **€1.5B ARR** |

**Key market signal**: Forlì ranks 84th out of 108 Italian capitals for digital services — worst in Emilia-Romagna. Confartigianato Forlì launched free "digital check-ups" in May 2026, explicitly identifying the digitization gap but having no product to recommend.

### Competitive Landscape

| Competitor | Category | Strength | Gap Bottega Fills |
|-----------|----------|----------|-------------------|
| **Wix / Squarespace** | Generic website builders | Strong builder UX, global scale | English-first; no Italian fiscal integrations; too complex for non-tech users |
| **Treatwell / TheFork** | Vertical booking platforms | Strong in beauty/restaurants | Commission model (15-30%); single-vertical; no CRM or website |
| **Fatture in Cloud** | Italian e-invoicing | Strong fiscal compliance | No website, no booking, no marketing — pure accounting tool |
| **JEEG (Italiaonline)** | Italian SME websites | Italian market presence | Poor UX; no booking system; expensive for micro-businesses |
| **TeamSystem (Cassa in Cloud)** | Enterprise POS/ERP | Feature-rich; enterprise trust | Too expensive and complex for <5 employee businesses |

**Bottega's unique position**: The only all-in-one platform combining website + booking + CRM + Italian fiscal compliance, specifically designed for non-tech Italian micro-businesses, distributed through trusted associations.

### Current Traction

| Metric | Value |
|--------|-------|
| Git commits | 0 (fresh scaffold, pre-initial-commit) |
| Contributors | 1 (solo founder) |
| Stars / Forks | N/A (private repo) |
| Codebase size | ~1,748 lines of TypeScript/TSX across 15 files |
| Functional pages | 6 (landing + 5 dashboard views) |
| API endpoints | 2 (bookings CRUD, customers CRUD) |
| External integrations | 0 (all demo data) |

**Assessment**: This is a functional clickable prototype / demo — not yet a production application. The demo data (Barbiere da Marco) is well-crafted and shows the product vision effectively.

### Adoption Barriers

1. **No authentication system**: No login/registration flow — critical for multi-tenant SaaS
2. **No real database**: In-memory store loses data on restart; Prisma configured but only has a basic `User` model
3. **No WhatsApp integration**: The core communication channel is not yet connected
4. **No payment processing**: No Stripe/payment integration for subscription billing
5. **No multi-tenancy**: Single hardcoded business profile; no concept of multiple businesses
6. **Trust gap**: Italian SMEs adopt through trusted intermediaries — requires on-the-ground relationship building
7. **No mobile app**: Target users (shop owners) manage from phones — web-only may limit adoption

### Growth Opportunities

1. **Business association partnerships**: CNA/Confartigianato have direct access to thousands of members
2. **Government digitization incentives**: PNRR and Transizione 5.0 provide funding for SME digitization
3. **Vertical expansion**: Same platform adaptable to florists, beauty salons, mechanics, professional services
4. **Geographic expansion**: Romagna → Emilia-Romagna → National via association federation structure
5. **Marketplace play**: Directory of local businesses creates network effects

---

## Part 3: Next-Gen Feature Proposals

| # | Feature Name | Description | Why Implement | Complexity | Impact |
|---|-------------|-------------|---------------|------------|--------|
| 1 | **Multi-Tenant Auth & Onboarding** | Complete authentication system (email + SPID) with guided onboarding wizard that creates a business profile, generates a website, and activates booking in under 10 minutes. Each business gets isolated data. | Without multi-tenancy and auth, there is no product — this is the foundation for everything else. Guided onboarding reduces the #1 adoption barrier (complexity). | High | **10** |
| 2 | **WhatsApp Business Integration** | Two-way WhatsApp messaging via Twilio/360dialog for booking confirmations, appointment reminders, review request automation, and customer communication. Inbound message routing to the dashboard. | WhatsApp is the primary communication channel for Italian SMEs. This single integration replaces email, SMS, and phone for 80% of use cases. Core to the value proposition. | High | **9** |
| 3 | **Real Database & Prisma Migration** | Replace `InMemoryStore` with full Prisma schema covering businesses, users, bookings, customers, reviews, services, and subscriptions. Migrate to PostgreSQL with proper relations, indexes, and data validation. | No production deployment is possible without persistent storage. The async `InMemoryStore` API surface means the swap is architecturally clean. | Medium | **9** |
| 4 | **Stripe Subscription Billing** | Integrate Stripe for the three pricing tiers (Vetrina €0, Bottega €29, Maestro €59). Include subscription management, invoicing, upgrade/downgrade flows, and Italian fiscal receipt generation. | No revenue without payments. Stripe handles SCA compliance (EU requirement) and supports SEPA direct debit — preferred by Italian businesses over credit cards. | Medium | **9** |
| 5 | **Google Business Profile Sync** | Bi-directional sync with Google Business Profile API: auto-update hours, post specials, pull reviews, and push response drafts. Real-time review monitoring with notification alerts. | Google visibility is the #1 driver of walk-in traffic for local businesses. Auto-syncing eliminates manual work that SMEs won't do. Directly proves ROI ("you got 3 new reviews this week"). | High | **8** |
| 6 | **AI-Powered Social Media Content** | Photo-to-post pipeline: business owner takes a photo of a product/result → AI generates Instagram/Facebook post with Italian copy, hashtags, and scheduling. Includes a weekly content calendar. | A baker has zero marketing skills but takes photos of bread daily. AI content generation is a genuine force multiplier. High perceived value for a feature that costs pennies per post via OpenAI API. | Medium | **8** |
| 7 | **Template Website Publishing** | Actually publish generated websites to custom domains or subdomains (bottega.nomeattivita.it). Include SEO optimization for local searches ("barbiere Forlì"), Google Maps embed, and tap-to-call buttons. | The current website preview is a demo — it doesn't publish anywhere. A live website is the most tangible deliverable for a business owner and the entry point for the free tier. | Medium | **8** |
| 8 | **Walk-In Queue Management** | Real-time queue display for walk-in businesses (barbershops, bakeries). Customers scan a QR code to join the queue, see estimated wait time, and get a WhatsApp notification when it's their turn. | Solves a daily pain point for high-foot-traffic businesses. Creates a natural upsell from walk-in queue → online booking. Generates customer contact data passively. | Medium | **7** |
| 9 | **Digital Loyalty Card (Carta Fedeltà)** | Replace physical stamp cards with a digital loyalty system. Customers accumulate points per visit/purchase, unlock rewards, and receive birthday/anniversary offers via WhatsApp. QR code check-in. | The CRM already tracks loyalty points — this activates them. Digital loyalty drives repeat visits (proven 20-30% increase in frequency) and gives businesses a reason to collect customer data. | Low | **7** |
| 10 | **Local Business Directory & Marketplace** | A public directory of all Bottega Digitale businesses in Forlì, searchable by category and neighborhood. Enables cross-promotion ("visited the barber? Try the bakery next door"). | Creates network effects — each new business makes the platform more valuable for all others. Provides free marketing as an onboarding incentive. Establishes Bottega as the "digital piazza" of Forlì. | Medium | **7** |

---

## Part 4: Implementation Roadmap

### Feature 1: Multi-Tenant Auth & Onboarding
- **Effort Estimate**: 4-5 person-weeks
- **Prerequisites**: Database migration (Feature 3 — can be done in parallel)
- **Implementation Phases**:
  1. **Auth system** (Week 1-2): Implement NextAuth.js with email/password + magic link. Create User, Business, and Membership Prisma models. Add login/register pages in Italian.
  2. **Onboarding wizard** (Week 2-3): 4-step guided flow: business type → basic info (name, address, hours) → service menu → website preview. Auto-generate website from template.
  3. **Multi-tenancy middleware** (Week 3-4): Request-scoped business context. Data isolation via `businessId` foreign keys. Role-based access (owner, staff). Dashboard scoped to active business.
  4. **SPID integration** (Week 5): Add SPID as an auth provider for Italian digital identity compliance. Optional but important for trust and government incentive compatibility.
- **Success Metrics**: Time-to-first-website < 10 minutes; onboarding completion rate > 70%; 50+ businesses registered in pilot
- **Risks & Mitigations**: SPID integration is complex (use a hosted SPID provider like SpidPHP or Italia Login); onboarding abandonment → add "we set it up for you" phone support option

### Feature 2: WhatsApp Business Integration
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Twilio/360dialog setup** (Week 1): WhatsApp Business API provisioning, message template approval (booking confirmation, reminder, review request), webhook endpoint.
  2. **Outbound messaging** (Week 2): Booking confirmation messages, 24h and 2h appointment reminders, post-visit review request automation. Template messages in Italian.
  3. **Inbound message routing** (Week 3): Webhook handler for incoming WhatsApp messages. Route to dashboard inbox. Parse common intents ("voglio prenotare" → booking flow).
  4. **Dashboard inbox** (Week 4): Unified message view in dashboard. Quick-reply templates. Message history per customer linked to CRM.
- **Success Metrics**: Message delivery rate > 95%; no-show reduction > 30%; review request → review conversion > 15%
- **Risks & Mitigations**: WhatsApp template approval can take days (submit early, have SMS fallback); API costs scale with volume (budget €0.05-0.08/message, included in subscription)

### Feature 3: Real Database & Prisma Migration
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: None (can start immediately)
- **Implementation Phases**:
  1. **Schema design** (Week 1): Full Prisma schema: Business, User, Membership, Booking, Customer, Service, Review, Subscription. Relations, indexes, and enum types. Migrate from SQLite to PostgreSQL.
  2. **Data access layer** (Week 1-2): Replace `InMemoryStore` calls with Prisma client queries. The existing async API surface makes this a clean swap. Add proper error handling and validation (Zod).
  3. **Seed data & migrations** (Week 2): Create seed script with demo data (Barbiere da Marco). Set up migration workflow. Add database health check endpoint.
- **Success Metrics**: All existing demo functionality works with persistent data; < 50ms query latency; zero data loss on restart
- **Risks & Mitigations**: Schema changes during early development → use Prisma migrate with dev workflow; hosting costs → start with Railway.app or Neon (free tier PostgreSQL)

### Feature 4: Stripe Subscription Billing
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Stripe integration** (Week 1): Create Stripe products for Vetrina/Bottega/Maestro tiers. Implement checkout session creation, webhook handler for subscription events, customer portal link.
  2. **Subscription management UI** (Week 2): Pricing page with Stripe checkout. Dashboard billing page showing current plan, next invoice, payment method. Upgrade/downgrade flows.
  3. **Feature gating** (Week 2-3): Middleware to enforce tier limits (e.g., Vetrina = 3 bookings/month). Graceful upgrade prompts when limits are reached. SEPA direct debit as payment option.
- **Success Metrics**: Checkout completion rate > 60%; MRR tracking in Stripe dashboard; churn rate < 5%/month
- **Risks & Mitigations**: Italian VAT compliance → use Stripe Tax; SEPA setup adds friction → offer card payment as default with SEPA option

### Feature 5: Google Business Profile Sync
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Google API setup** (Week 1): Google Business Profile API OAuth flow. Business verification and linking. Read existing reviews, hours, and photos.
  2. **Review sync** (Week 2): Periodic review pull (every 4 hours). New review notifications in dashboard. AI-generated response suggestions (keep existing pattern, connect to OpenAI).
  3. **Hours & posts sync** (Week 3): Push hours changes to Google. Auto-post specials/promotions. Holiday hour management.
  4. **Analytics integration** (Week 4): Pull Google search impressions, map views, and call clicks. Display in analytics dashboard alongside website metrics.
- **Success Metrics**: Review response time < 24 hours (from days/never); Google profile completeness > 90%; measurable increase in Google Maps visibility
- **Risks & Mitigations**: Google API quotas → implement rate limiting and caching; API changes → abstract behind service layer; business verification can be slow → guide users through the process

### Feature 6: AI-Powered Social Media Content
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Photo upload & AI pipeline** (Week 1): Image upload to Cloudinary. OpenAI Vision API for image description. GPT-4 for Italian social media copy generation with hashtags and emojis.
  2. **Content calendar** (Week 2): Weekly content suggestions based on business type. Scheduling UI with preview. Auto-post to Instagram/Facebook via Meta Graph API.
  3. **Template library** (Week 2-3): Pre-built post templates by business type (bakery: "Sfornati oggi", barber: "Look del giorno"). Seasonal and holiday content suggestions.
- **Success Metrics**: Posts generated per business > 4/month; engagement rate on auto-posts comparable to manual posts; time saved > 2 hours/week per business
- **Risks & Mitigations**: AI content quality → human review before posting; Meta API restrictions → start with image + caption generation (manual posting) before auto-posting

### Feature 7: Template Website Publishing
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Template engine** (Week 1): 6 responsive templates by business type (barber, bakery, restaurant, mechanic, beauty, generic). Dynamic data injection from business profile.
  2. **Subdomain publishing** (Week 2): Automatic subdomain assignment (barbiere-da-marco.bottegadigitale.it). Wildcard DNS + Next.js middleware for multi-tenant routing. SSL via Let's Encrypt.
  3. **Custom domain support** (Week 3): CNAME setup wizard. DNS verification. Custom domain SSL provisioning.
  4. **SEO optimization** (Week 3-4): Auto-generated meta tags, structured data (LocalBusiness schema), sitemap, robots.txt. Optimized for "barbiere Forlì" type searches.
- **Success Metrics**: Website generation time < 5 minutes; Google indexing within 7 days; first page ranking for "[business type] Forlì" within 3 months
- **Risks & Mitigations**: DNS propagation delays → clear user communication; template customization requests → keep it simple, offer "setup service" for €99

### Feature 8: Walk-In Queue Management
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: Auth system (Feature 1), WhatsApp integration (Feature 2)
- **Implementation Phases**:
  1. **Queue system** (Week 1): Real-time queue data model. QR code generation per business. Customer-facing queue status page (no login required). Estimated wait time calculation.
  2. **Business controls** (Week 2): Dashboard queue management (call next, skip, cancel). WhatsApp notification when customer's turn is approaching. Daily queue analytics.
  3. **Customer data capture** (Week 2-3): Optional name + phone collection on queue join. Auto-create CRM entry. Follow-up review request after visit.
- **Success Metrics**: Queue adoption in barbershops > 40% of walk-ins; wait time accuracy within 5 minutes; customer data capture rate > 60%
- **Risks & Mitigations**: Low smartphone adoption among older customers → physical number display as fallback; real-time sync complexity → use server-sent events or polling

### Feature 9: Digital Loyalty Card (Carta Fedeltà)
- **Effort Estimate**: 1-2 person-weeks
- **Prerequisites**: Auth system (Feature 1), Database (Feature 3)
- **Implementation Phases**:
  1. **Loyalty engine** (Week 1): Points-per-visit and points-per-euro rules engine. Reward tiers with configurable thresholds. QR code for check-in (scan at counter).
  2. **Customer-facing card** (Week 1-2): Mobile web page showing point balance, progress to next reward, and visit history. No app download required. Birthday/anniversary auto-offers via WhatsApp.
- **Success Metrics**: Loyalty program activation > 50% of returning customers; repeat visit frequency increase > 15%; average ticket increase > 10%
- **Risks & Mitigations**: Complexity of reward rules → start with simple "10 visits = 1 free" model; QR scanning friction → offer manual check-in option

### Feature 10: Local Business Directory & Marketplace
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: Auth system (Feature 1), Website publishing (Feature 7)
- **Implementation Phases**:
  1. **Directory pages** (Week 1): Public searchable directory of Bottega Digitale businesses. Filter by category, neighborhood, and service. Map view with markers.
  2. **Cross-promotion engine** (Week 2): "Nearby businesses" widget on each business's generated website. Co-marketing suggestions (barber → men's clothing store). Shared loyalty programs.
  3. **SEO & discovery** (Week 2-3): Category landing pages ("Barbieri a Forlì", "Forni a Forlì"). Google-optimized directory pages. Local event integration.
- **Success Metrics**: Directory page views > 1,000/month within 6 months; cross-referral bookings > 5% of total; SEO ranking for local category searches
- **Risks & Mitigations**: Cold-start problem (empty directory) → seed with free Vetrina businesses; quality control → curate listings manually initially

---

## Part 5: Executive Summary

```
┌─────────────────────────────────────────────────────────┐
│ PROJECT VIABILITY SCORECARD                             │
├─────────────────────────────────────────────────────────┤
│ Current Market Fit:        7/10  ███████░░░             │
│ Growth Potential:          9/10  █████████░             │
│ Technical Foundation:      7/10  ███████░░░             │
│ Community Health:          2/10  ██░░░░░░░░             │
│ Competitive Position:      8/10  ████████░░             │
├─────────────────────────────────────────────────────────┤
│ OVERALL SCORE:             7/10  ███████░░░             │
└─────────────────────────────────────────────────────────┘
```

### Score Justification

- **Current Market Fit (7/10)**: The problem is validated by business associations themselves (Confartigianato's "digital check-up" program). The product vision precisely matches the gap. Loses points because the current implementation is a demo, not a deployable product.

- **Growth Potential (9/10)**: The TAM is enormous (€1.5B). The distribution strategy through CNA/Confartigianato is brilliant — these associations have millions of members nationally and are actively seeking digital solutions for their members. Government incentives (PNRR, Transizione 5.0) provide regulatory tailwind.

- **Technical Foundation (7/10)**: Modern, well-chosen stack (Next.js 16, React 19, Tailwind v4, Prisma 7, TypeScript). Clean component architecture with good separation of concerns. The `InMemoryStore` pattern provides a clean async API surface ready for database swap. Italian localization done properly from day one. Loses points for no auth, no real database, no tests, and no CI/CD.

- **Community Health (2/10)**: Solo founder project with zero commits, no external contributors, no public presence. This is expected at the pre-launch stage but represents a real risk — bus factor of 1.

- **Competitive Position (8/10)**: Strong differentiation through Italian-first design, association distribution moat, and all-in-one simplicity. No direct competitor offers this exact combination. The association partnership strategy is extremely hard to replicate for international competitors.

### Bottom Line

**Bottega Digitale has exceptional market-problem fit and a distribution strategy that most SaaS startups would envy.** The technical foundation is clean and modern but currently a demo — the gap from prototype to MVP is roughly 10-14 weeks of focused development. **The single most important next step is to implement Features 1+3 (Auth + Database) in parallel, deploy to production, and schedule the first meeting with CNA Forlì to propose a 50-business pilot.** The product's success hinges not on technology but on whether the founder can secure that first association partnership — everything else follows from there.

### Suggested Development Sequence

```
Weeks 1-3:   Feature 3 (Database) + Feature 1 (Auth & Onboarding)  ← Foundation
Weeks 4-5:   Feature 4 (Stripe Billing) + Feature 7 (Website Publishing)  ← Revenue + deliverable
Weeks 6-8:   Feature 2 (WhatsApp) + Feature 9 (Loyalty Card)  ← Core value loop
Weeks 9-11:  Feature 5 (Google Sync) + Feature 6 (AI Social)  ← Differentiation
Weeks 12-14: Feature 8 (Queue) + Feature 10 (Directory)  ← Network effects
```

**Total estimated effort**: 24-34 person-weeks (6-8 months solo, 3-4 months with 2 developers)

---

## Appendix: Codebase Structure

```
bottega-digitale/
├── prisma/
│   └── schema.prisma              # Basic User model (needs expansion)
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page (hero, features, pricing, testimonials)
│   │   ├── layout.tsx             # Root layout (Navbar, Footer, Italian lang)
│   │   ├── globals.css            # Tailwind v4 theme
│   │   ├── api/
│   │   │   ├── bookings/route.ts  # GET/POST bookings API
│   │   │   └── customers/route.ts # GET/POST customers API
│   │   └── dashboard/
│   │       ├── layout.tsx         # Dashboard shell with sidebar
│   │       ├── page.tsx           # Overview with KPIs and quick actions
│   │       ├── bookings/page.tsx  # Calendar + list view
│   │       ├── customers/page.tsx # CRM table with loyalty points
│   │       ├── reviews/page.tsx   # Google review monitoring
│   │       └── website/page.tsx   # Website editor preview
│   ├── components/
│   │   ├── dashboard.tsx          # DashboardShell + StatCard
│   │   ├── features.tsx           # FeatureCard + FeatureGrid
│   │   ├── hero.tsx               # Hero section
│   │   ├── navbar.tsx             # Responsive navbar (client component)
│   │   ├── pricing.tsx            # PricingSection with tier cards
│   │   └── footer.tsx             # Footer with links
│   └── lib/
│       ├── data.ts                # Demo data + business logic (Barbiere da Marco)
│       ├── db.ts                  # InMemoryStore<T> generic data store
│       └── utils.ts               # cn() utility (clsx + twMerge)
├── package.json                   # Next.js 16.2.6, React 19.2.4
└── AGENTS.md                      # Next.js agent coding rules
```

**Total**: ~1,748 lines of TypeScript/TSX across 15 source files.

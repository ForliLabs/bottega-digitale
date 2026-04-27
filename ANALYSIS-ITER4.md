# Bottega Digitale — Iteration 4 Analysis & Next-Gen Feature Planning

> **Analysis Date**: July 2025
> **Repository**: `bottega-digitale/`
> **Status**: Production-grade SaaS platform with 47 commits, 110K+ LoC, 47 Prisma models, 21 dashboard pages, 39 API routes, 59 unit tests
> **Iteration**: 4 (builds on ANALYSIS.md, ANALYSIS-ITER2.md, ANALYSIS-ITER3.md — no repeated features)

---

## Part 1: Current State Assessment (Post-Iteration 3)

### What's Been Built Since Iteration 3

The codebase grew from **67,841 to 109,523 lines** across 13 new commits. Every feature proposed in ANALYSIS-ITER3.md has been implemented:

| Feature | Status | Implementation Depth |
|---------|--------|---------------------|
| WhatsApp Conversational AI (Assistente Virtuale) | ✅ Built | 374-line engine with OpenAI function calling, intent recognition, multi-turn conversation state (`ConversationState` model), FAQ handling, booking/loyalty/queue integration, Italian NLP pipeline, personality config (formale/amichevole), `/dashboard/whatsapp/ai` management page |
| Product Catalog & Storefront (Vetrina Prodotti) | ✅ Built | `Product`, `ProductCategory`, `Order`, `OrderItem` models, 158-line catalog engine, `/shop/[slug]` public storefront, `/dashboard/products` management, order status tracking (ricevuto→consegnato), WhatsApp + online ordering channels |
| Association White-Label Portal (Portale Associazione) | ✅ Built | 218-line portal engine, `Association`, `AssociationMembership`, `AssociationAdmin`, `GroupSubscription` models, `/association/[slug]` branded portal, bulk onboarding, aggregate analytics, group subscription billing (€15/member) |
| Customer Payment Collection (Pagamenti Clienti) | ✅ Built | 255-line payments engine, `PaymentTransaction` + `GiftCard` models, Stripe Connect flow, deposit collection, gift card purchase/redemption, platform fee (2.5%), `/dashboard/payments` page |
| Test Suite & CI/CD (Qualità Garantita) | ✅ Built | 6 test files with 59 test cases covering auth, security, e-invoice, i18n, payments, association-portal. Vitest + jsdom + Testing Library. GitHub Actions CI: lint → typecheck → test → build |
| Notification Center (Centro Notifiche) | ✅ Built | 182-line notification engine, `Notification` model with type/priority/read status, push support via existing PWA infrastructure, `/dashboard/notifications` page, 7 notification types (booking, payment, review, loyalty, queue, automation, system) |
| Accountant Portal (Portale Commercialista) | ✅ Built | 214-line portal engine, `Accountant` + `AccountantClientLink` models, `/commercialista/login` auth flow, client linking via invite codes, referral tracking, read-only financial data access |
| i18n & Expansion Kit (Kit Espansione) | ✅ Built | i18n library (154 lines), `TranslationOverride` + `RegionConfig` models, `messages/it.json` + `messages/en.json` with 8 namespaces, locale-aware formatting, region-specific configuration |
| Marketplace & Gift Cards (Buoni Regalo & Marketplace) | ✅ Built | 225-line marketplace engine, `MarketplaceListing` + `GiftCard` models, `/marketplace` public discovery page, gift card lifecycle (purchase→activate→redeem→expire), featured listings, category/location search |
| Platform Analytics & Churn (Intelligenza Piattaforma) | ✅ Built | 261-line analytics engine, `PlatformEvent` + `BusinessHealthScore` models, `/admin` super-dashboard, health scoring (0-100), risk tiers (healthy/at_risk/churning), login/feature/booking trend tracking, indexed event tables |

### Architecture Maturity Assessment

| Dimension | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Status |
|-----------|--------|--------|--------|--------|--------|
| Source lines | 1,748 | 33,462 | 67,841 | **109,523** | **63x growth** |
| Commits | 14 | 20 | 34 | **47** | Sustained velocity |
| Prisma models | 1 | 16 | 27 | **47** | Enterprise-scale schema |
| API routes | 2 | 17 | 28 | **39** | Complete REST surface |
| Dashboard pages | 5 | 12 | 18 | **21** | Full admin suite |
| Public pages | 1 | 4 | 7 | **15** | Multi-touchpoint UX |
| Lib modules | 3 | 6 | 16 | **25** (incl. i18n/) | Deep service layer |
| Test files / cases | 0 | 0 | 0 | **6 files / 59 tests** | Foundation established |
| Components | 5 | 5 | 7 | **7** | PWA-enabled |
| i18n languages | 0 | 0 | 0 | **2** (IT + EN) | Expansion-ready |
| External integrations | 0 | 4 | 4 | **5** (Stripe, WhatsApp, Google, OpenAI, SDI) | Production-grade |

### Key Architectural Observations for Iteration 4

With 47 models, 39 API routes, and 110K lines, the platform has crossed the threshold from "feature-rich prototype" into "pre-production SaaS." The gaps are no longer about missing features — they're about operational maturity, revenue optimization, and ecosystem development.

1. **Testing exists but coverage is thin** — 59 tests across 385 lines covering 6 of 25 lib modules means ~24% module coverage. Critical paths like WhatsApp AI (374 lines, 0 tests), product catalog, marketplace, and platform analytics have no test coverage.
2. **No deployment infrastructure** — the CI pipeline builds but doesn't deploy. No staging environment, no Dockerfile, no Vercel/Railway/Fly.io config, no environment variable management for production.
3. **No real-time capabilities** — all 39 API routes are REST request/response. No WebSocket for live queue updates, no Server-Sent Events for dashboard notifications, no real-time booking confirmations.
4. **No media pipeline** — product catalog, social posts, and marketplace listings reference `imageUrl` fields but there's no upload infrastructure (no S3/R2/Cloudinary integration, no image resize/optimization).
5. **No email channel** — WhatsApp and push are built; email (the most universal channel) is absent. No transactional emails for booking confirmations, invoice delivery, or password resets.
6. **No webhook infrastructure for external systems** — businesses can't connect their POS, accounting software, or CRM. The event bus is internal-only.
7. **No staff mobile experience** — multi-staff management exists (StaffProfile model, 21 dashboard pages) but staff members can't manage their own schedules or view their bookings on mobile.
8. **No data export/portability** — GDPR Article 20 requires data portability. No bulk export of customer data, bookings, invoices, or analytics.
9. **No onboarding wizard optimization** — the onboarding page exists but doesn't guide businesses through feature activation (enable booking → add services → enable loyalty → publish website).
10. **No API documentation or developer ecosystem** — 39 API routes with no OpenAPI spec, no API keys for third-party integrations, no developer portal.

---

## Part 2: Market Position Update

### Competitive Landscape Evolution

With 47 features across 25 service modules, Bottega Digitale has no direct competitor in the Italian market:

| Competitor | Feature Coverage (of Bottega's 47) | Key Gap vs. Bottega |
|-----------|-----------------------------------|---------------------|
| **Wix/Squarespace** | ~15% (website, basic booking, payments) | No CRM, loyalty, queue, WhatsApp, e-invoicing, AI, cross-promo, association distribution |
| **Treatwell** | ~10% (booking marketplace only) | Commission-based, no website, no CRM, locked to beauty vertical |
| **Fatture in Cloud** | ~8% (e-invoicing, basic accounting) | No customer-facing features at all — pure back-office |
| **SumUp/Tilby POS** | ~12% (payments, basic analytics, inventory) | No website, booking, loyalty, WhatsApp, reviews, AI content, marketplace |
| **Partoo** | ~8% (reviews, presence, directory) | No operational tools — pure marketing/reputation |
| **Olo/Covermanager** | ~10% (restaurant booking, orders) | Single-vertical, no Italian compliance, no loyalty/reviews |

**Updated position**: Bottega Digitale covers **47 distinct features** across 4 stakeholder layers (business owner, customer, accountant, association). The nearest Italian competitor covers ~15% of this surface. The platform is now **categorically unique** — there is no product to compare it against directly.

### Revised Traction Metrics

| Metric | Iter 1 | Iter 2 | Iter 3 | Iter 4 | Δ Iter3→4 |
|--------|--------|--------|--------|--------|-----------|
| Commits | 14 | 20 | 34 | **47** | +38% |
| Source lines | 1,748 | 33,462 | 67,841 | **109,523** | +61% |
| API routes | 2 | 17 | 28 | **39** | +39% |
| Dashboard pages | 5 | 12 | 18 | **21** | +17% |
| Prisma models | 1 | 16 | 27 | **47** | +74% |
| Public pages | 1 | 4 | 7 | **15** | +114% |
| Lib modules | 3 | 6 | 16 | **25** | +56% |
| Test cases | 0 | 0 | 0 | **59** | ∞ |
| Contributors | 1 | 1 | 1 | **1** | — |

### Updated Adoption Barriers

Previous barriers addressed:
- ~~No test suite~~ → 59 tests with CI/CD pipeline ✅
- ~~No conversational interface~~ → WhatsApp AI with function calling ✅
- ~~Service-only model~~ → Product catalog + storefront + orders ✅
- ~~No payment collection~~ → Stripe Connect + deposits + gift cards ✅
- ~~Distribution channel not built~~ → Association white-label portal ✅
- ~~No accountant ecosystem~~ → Commercialista portal with referral codes ✅
- ~~No i18n~~ → Italian + English with regional config ✅
- ~~No marketplace~~ → Public discovery + gift cards ✅
- ~~No platform analytics~~ → Health scoring + churn detection ✅

**Remaining barriers (Iteration 4 focus):**

1. **No deployment path** — cannot demo to a real business without production infrastructure
2. **Test coverage is skeletal** — 59 tests cover 6 of 25 modules; WhatsApp AI, product catalog, marketplace have zero tests
3. **No media handling** — product photos, social posts, business logos all reference URLs with no upload pipeline
4. **No email channel** — the most universal communication channel is entirely missing
5. **No real-time UX** — queue, booking, notification updates require page refresh
6. **Solo developer** — bus factor of 1 with 110K lines; no contributor path
7. **No API for integrations** — 39 routes exist but no external API keys, rate limiting for partners, or documentation

---

## Part 3: Next-Gen Feature Proposals (Iteration 4)

**Principles for Iteration 4**: The platform has achieved feature completeness for its core value proposition. Iteration 4 shifts from "build more features" to "make what exists production-ready, monetizable, and scalable." Every proposal must either (a) enable real-world deployment, (b) deepen revenue per business, (c) create developer/ecosystem leverage, or (d) reduce operational risk at scale.

| # | Feature Name | Description | Why Implement | Complexity | Impact |
|---|-------------|-------------|---------------|------------|--------|
| 1 | **Production Deployment Kit (Pronti al Lancio)** | Dockerized deployment with multi-environment config (dev/staging/prod), Vercel/Railway deploy scripts, environment variable management with validation, database migration pipeline (SQLite→Turso/LibSQL for production), health check endpoint hardening, CDN configuration for static assets, and zero-downtime deploy workflow. | Nothing else matters if the product can't be deployed. 110K lines of code serving zero real users is a prototype, not a product. Every proposed partner demo, CNA pilot, or investor meeting requires a running instance. This is the single highest-leverage investment: it transforms all 47 features from theoretical to operational in one step. | Medium | **10** |
| 2 | **Media Pipeline & Asset Management (Gestione Media)** | Image upload infrastructure with S3-compatible storage (Cloudflare R2 or AWS S3), automatic resize/optimization (WebP conversion, responsive sizes), CDN delivery, and integration across all modules: product photos, social post images, business logos, review response images, marketplace listings. Upload widget component with drag-and-drop, crop, and compression. Storage quota per subscription tier. | 4 major modules (products, social, marketplace, website) reference `imageUrl` fields but have no upload mechanism. A bakery can't list bread without photos. A florist can't post arrangements to social. The product catalog is unusable without a media pipeline. This unblocks the visual dimension of every customer-facing feature. | Medium | **10** |
| 3 | **Transactional Email System (Posta Elettronica)** | Email delivery via Resend/Postmark/SendGrid with Italian-language templates: booking confirmations, payment receipts, invoice PDF delivery, password reset, onboarding welcome sequence, weekly business summary digest, accountant monthly report, association newsletter. Template engine with business branding (logo, colors). Unsubscribe management per GDPR. Delivery tracking (sent, opened, bounced). | WhatsApp reaches ~70% of Italian consumers; email reaches 100%. Critical flows lack email fallback: booking confirmations go only via WhatsApp (what if the customer doesn't have WhatsApp?), invoices have no delivery mechanism beyond SDI XML, password reset has no flow at all. Email is table-stakes infrastructure that every competing platform provides. Its absence is visible in the first 5 minutes of any product demo. | Medium | **9** |
| 4 | **Deep Test Coverage & E2E Testing (Copertura Totale)** | Expand from 59 tests (6 modules) to 200+ tests (25 modules). Add integration tests for all 39 API routes with test database. Add E2E tests with Playwright for 5 critical flows: onboarding→first booking, customer portal login→booking→loyalty, WhatsApp AI conversation→booking, product order→payment, association bulk onboarding. Test coverage reporting in CI. Pre-commit hooks with lint-staged. | 59 tests covering 24% of modules is better than zero, but WhatsApp AI (374 lines, the most complex module) has zero tests. The e-invoice module generates legally-binding fiscal XML — a bug could mean tax penalties. Payment processing handles real money with no integration test coverage. Expanding test coverage from "foundation" to "comprehensive" is what makes the difference between a demo and a product an accountant would recommend. | High | **9** |
| 5 | **Real-Time Dashboard (Cruscotto Live)** | WebSocket/SSE layer for live updates across the dashboard: new booking notifications without refresh, live queue position updates on customer-facing pages, real-time payment confirmations, live notification badges, typing indicators for WhatsApp AI conversations. Server-Sent Events for one-way updates (notifications, queue), WebSocket for bidirectional (WhatsApp chat view). Graceful fallback to polling for older browsers. | The current dashboard requires manual page refresh to see new bookings, payments, or queue changes. A barber with a queue display on a tablet needs live updates — not "refresh every 30 seconds." Real-time is the difference between a tool business owners check periodically and one they keep open all day. Every SaaS competitor (Treatwell, Calendly, even Google Calendar) provides real-time updates. | Medium | **8** |
| 6 | **Guided Onboarding & Setup Wizard (Configurazione Guidata)** | Multi-step onboarding wizard replacing the current single-page form: (1) business profile + category selection, (2) service/product catalog setup with AI-assisted descriptions, (3) opening hours with visual schedule builder, (4) enable features based on business type (auto-suggest: barbers get queue+booking, bakeries get catalog+orders), (5) website preview + publish, (6) WhatsApp connection, (7) first customer import (contacts CSV). Progress tracking with "Completamento: 65%" indicator. Contextual tooltips and video tutorials in Italian. | Activation is the #1 SaaS metric after acquisition. A business that signs up but doesn't configure services, enable booking, or publish their website churns within 30 days. The current onboarding creates a business profile but leaves 47 features undiscovered. A guided wizard that says "Sei un barbiere? Ecco le 5 funzioni più utili per te" transforms sign-up-to-value time from days to 15 minutes. This directly impacts the health score that platform analytics tracks. | Medium | **8** |
| 7 | **Webhook API & Developer Platform (API Aperta)** | Public REST API with API key authentication, rate limiting (per-key quotas), and webhook delivery for external integrations. OpenAPI 3.1 specification auto-generated from route handlers. Webhook events for: booking created/updated/cancelled, payment received, customer created, order placed, review received. Webhook retry with exponential backoff. `/dashboard/settings/api` page for key management. Developer documentation portal. | The platform currently operates as a closed system — no POS integration, no accounting software sync, no custom integrations. Italian businesses use TeamSystem, Zucchetti, or Danea for accounting; SumUp or Nexi for POS; MailUp for email marketing. Without webhooks, every integration requires custom development. An open API also enables future partnership revenue (API access as premium tier feature) and community-built integrations. | Medium | **8** |
| 8 | **Staff Mobile App Experience (App Staff)** | Mobile-optimized dashboard variant for staff members: bottom navigation with Today (today's bookings + queue), Customers (quick lookup), Notifications (real-time alerts), and Profile (hours, services). Staff-specific views: "I miei appuntamenti oggi," swipe-to-complete booking, tap-to-call customer, quick check-in for walk-ins. Staff login via phone number + OTP (no email required). Push notifications for new bookings assigned to them. | Multi-staff management exists (StaffProfile model, role assignments) but staff interact through the same 21-page desktop dashboard as owners. A junior hairdresser at a salon doesn't need billing, analytics, or invoice pages — they need "who's my next client and what service did they book?" A streamlined mobile view reduces training time and increases daily active usage (staff check their schedule 5-10x/day vs. owners 1-2x/day). | Medium | **7** |
| 9 | **Smart Business Templates & Auto-Configuration (Modelli Intelligenti)** | Pre-built business templates for the top 10 Italian micro-business categories: Barbiere, Parrucchiera, Estetista, Forno/Panetteria, Fiorista, Ristorante/Pizzeria, Meccanico, Studio Medico/Dentista, Palestra, Negozio di Alimentari. Each template includes: pre-configured services with typical Italian pricing, suggested opening hours, loyalty program parameters, sample automation flows, WhatsApp FAQ templates, website template selection, and social post content themes. One-click "Sono un barbiere" setup. | The guided onboarding wizard (Feature 6) asks questions; templates answer them. Combined, they reduce setup from 45 minutes to 5 minutes. Templates also encode domain expertise — a barbiere template knows that "Taglio uomo €15, Barba €10, Taglio+Barba €22" is the standard pricing in Romagna. This domain knowledge is a competitive moat that horizontal platforms like Wix can never replicate. Templates also drive data quality: pre-filled catalogs mean businesses launch with rich content instead of empty profiles. | Low | **7** |
| 10 | **GDPR Compliance & Data Governance (Conformità GDPR)** | Complete GDPR implementation: customer data export (Article 20 — portable JSON/CSV), right to erasure (Article 17 — cascade delete across all 47 models), consent management (granular opt-in for WhatsApp, push, email, analytics), data processing register (Article 30), privacy policy generator per business, cookie consent banner for published websites, data retention policies (auto-archive after 24 months), and audit log for all data access by accountants and association admins. | Operating in the EU without GDPR compliance is a legal liability, not a nice-to-have. The platform stores customer PII across 47 models (names, phones, emails, booking history, loyalty data, payment records, health scores). An association like CNA won't partner with a platform that can't demonstrate GDPR compliance — they'd be jointly liable. The accountant portal accesses financial data across businesses — this requires an audit trail. GDPR compliance is a prerequisite for every B2B sales conversation in Italy. | High | **7** |

---

## Part 4: Implementation Roadmap

### Feature 1: Production Deployment Kit (Pronti al Lancio)
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: None — unblocks everything else
- **Implementation Phases**:
  1. **Containerization** (Week 1): Dockerfile with multi-stage build (deps → build → runtime). Docker Compose for local dev (app + Turso/LibSQL). Environment variable validation at startup (extend existing `src/lib/security.ts` env checks). `.env.example` with all required vars documented. Health check endpoint hardening (`/api/health` returns DB connectivity, external service status).
  2. **Database production path** (Week 1-2): Migration from local SQLite (`dev.db`) to Turso (LibSQL cloud) for production. The `@prisma/adapter-libsql` and `@libsql/client` dependencies are already installed — wire up production connection string. Prisma migration scripts for schema versioning. Seed data separation (demo vs. production).
  3. **Deploy pipeline** (Week 2-3): Vercel deployment config (`vercel.json`) with environment variable binding. Alternative: Railway/Fly.io Dockerfile deploy. GitHub Actions extension: `deploy-staging` (on push to `develop`) and `deploy-production` (on push to `main`). Preview deployments for PRs. Custom domain setup documentation. SSL/TLS configuration.
- **Success Metrics**: Time from git push to live deployment < 5 minutes; staging environment accessible for partner demos; zero-downtime deploys; health check endpoint returns 200 with all services green
- **Risks & Mitigations**: SQLite→LibSQL migration data loss → test migration on copy of dev.db first; Turso cold start latency → keep connection pool warm with health check pings; environment variable sprawl → centralized config validation at startup (fail-fast)

### Feature 2: Media Pipeline & Asset Management (Gestione Media)
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Production deployment (Feature 1) for cloud storage access
- **Implementation Phases**:
  1. **Storage infrastructure** (Week 1): Cloudflare R2 bucket setup (S3-compatible, free egress). Upload API endpoint (`/api/media/upload`) with presigned URLs for direct browser-to-R2 upload. File type validation (JPEG, PNG, WebP only), size limits (5MB per image), virus scanning via ClamAV or similar.
  2. **Image processing pipeline** (Week 1-2): Server-side image optimization: auto-resize to 3 variants (thumbnail 200px, medium 600px, full 1200px), WebP conversion, EXIF stripping for privacy. Sharp or Cloudflare Image Resizing for on-the-fly transforms. CDN URL generation with cache headers.
  3. **Upload component & integrations** (Week 2-3): Reusable `<ImageUpload>` React component with drag-and-drop, crop (aspect ratio presets per context: square for products, 16:9 for social, logo for business profile), compression preview, and upload progress. Integrate into: `/dashboard/products` (product photos), `/dashboard/social` (post images), `/dashboard/website` (business logo/hero), onboarding wizard (logo upload step).
  4. **Storage management** (Week 3-4): Per-business storage quota (Vetrina: 100MB, Bottega: 500MB, Maestro: 2GB). Usage dashboard in business settings. Image gallery/library per business for reuse across modules. Bulk delete and orphan cleanup job via scheduler.
- **Success Metrics**: Image upload success rate > 99%; average upload time < 3 seconds for 5MB image; WebP adoption > 95% of served images; zero broken image URLs across product catalog and marketplace
- **Risks & Mitigations**: Large file uploads on slow Italian mobile connections → chunked upload with resume; storage costs → R2 free egress eliminates bandwidth costs; image quality expectations → auto-enhance with brightness/contrast normalization

### Feature 3: Transactional Email System (Posta Elettronica)
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Production deployment (Feature 1)
- **Implementation Phases**:
  1. **Email infrastructure** (Week 1): Resend or Postmark integration (both have generous free tiers and excellent Italian deliverability). Email service module (`src/lib/email.ts`) with typed template rendering. Domain authentication (SPF, DKIM, DMARC) for `@bottegadigitale.it`. Bounce and complaint handling webhook.
  2. **Transactional templates** (Week 1-2): Italian-language email templates with business branding injection (logo, colors, footer): booking confirmation (date, service, staff, address, cancel link), payment receipt (amount, service, gift card balance), invoice delivery (PDF attachment + FatturaPA XML), password reset (OTP with 15-min expiry), welcome onboarding sequence (Day 0: benvenuto, Day 3: configura servizi, Day 7: pubblica sito).
  3. **Digest & reporting emails** (Week 2-3): Weekly business summary email (bookings this week, revenue, new customers, pending reviews). Monthly accountant report email (invoice summary, IVA totals, attached XLSX). Association monthly report (aggregate member metrics). All digests generated by extending the existing job scheduler.
  4. **Preference management** (Week 3-4): Per-customer email preferences (transactional: always, marketing: opt-in). Unsubscribe links per GDPR (one-click unsubscribe header). Email delivery analytics (sent, delivered, opened, bounced) stored in `PlatformEvent`. Integration with notification center — email as a delivery channel alongside WhatsApp and push.
- **Success Metrics**: Email delivery rate > 98%; open rate for transactional emails > 60%; bounce rate < 2%; zero password reset flow failures; onboarding email sequence completion > 40%
- **Risks & Mitigations**: Italian ISP deliverability (Libero, Virgilio, TIM) → dedicated IP warming with transactional-only sends initially; template maintenance burden → shared component library with live preview; GDPR consent → double opt-in for marketing, implicit consent for transactional

### Feature 4: Deep Test Coverage & E2E Testing (Copertura Totale)
- **Effort Estimate**: 4-5 person-weeks
- **Prerequisites**: None — can start immediately in parallel
- **Implementation Phases**:
  1. **Unit test expansion** (Week 1-2): Extend from 6 to 25 test files covering all lib modules. Priority order by risk: `whatsapp-ai.ts` (374 lines, AI with side effects), `payments.ts` (real money), `e-invoice.ts` (legal compliance — already has 7 tests, expand to 20+), `product-catalog.ts`, `marketplace.ts`, `platform-analytics.ts`. Mock strategy: mock Prisma client, mock OpenAI, mock Stripe. Target: 200+ unit tests, 80% line coverage for `src/lib/`.
  2. **API route integration tests** (Week 2-3): Test all 39 API routes with supertest-style testing against test database. Test authentication guards (unauthenticated → 401, wrong business → 403). Test input validation (missing fields → 400 with Italian error messages). Test CRUD operations for all entity types. Use Prisma test database with seed data. Target: 100+ integration tests.
  3. **E2E tests with Playwright** (Week 3-4): Install Playwright with Chromium. Test 5 critical user journeys: (1) Register → onboard → create service → enable booking → publish website; (2) Customer visits `/book/[slug]` → selects slot → books → receives confirmation; (3) Customer portal login via OTP → view bookings → check loyalty; (4) WhatsApp AI webhook → intent recognition → booking creation; (5) Association admin → bulk onboard → view analytics. Run in CI with screenshots on failure.
  4. **Coverage reporting & pre-commit** (Week 4-5): Configure `vitest --coverage` with v8 provider. Coverage thresholds in CI: fail build if `src/lib/` < 80%, `src/app/api/` < 60%. Add `lint-staged` + `husky` for pre-commit hooks (lint + typecheck + affected tests). Coverage badge in README. Nightly full test run via scheduled GitHub Action.
- **Success Metrics**: 200+ tests passing in CI; `src/lib/` coverage > 80%; `src/app/api/` coverage > 60%; E2E tests catch 100% of critical flow regressions; CI pipeline completes in < 5 minutes
- **Risks & Mitigations**: Flaky E2E tests → retry logic + isolated test database per run; test maintenance burden → test utility factories for common entities (createTestBusiness, createTestBooking); slow CI → parallelize test jobs (unit ∥ integration, then E2E)

### Feature 5: Real-Time Dashboard (Cruscotto Live)
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Production deployment (Feature 1)
- **Implementation Phases**:
  1. **SSE infrastructure** (Week 1): Server-Sent Events endpoint (`/api/events/stream`) with per-business event filtering. Event types: `booking:created`, `booking:updated`, `payment:received`, `queue:updated`, `notification:new`, `review:received`. Connection management with heartbeat keepalive (30s). Reconnection logic with `Last-Event-ID` for missed events.
  2. **Dashboard integration** (Week 1-2): React hook `useRealtimeEvents(businessId)` that manages SSE connection lifecycle. Live notification badge counter on sidebar navigation. Toast notifications for high-priority events ("Nuova prenotazione: Mario Rossi — Taglio alle 15:00"). Auto-refresh of current page data when relevant event arrives (booking list updates when `booking:created` fires).
  3. **Customer-facing real-time** (Week 2-3): Live queue position on `/queue/[businessId]` — no more refresh-to-check. Booking confirmation instant update on `/book/[slug]` — slot availability updates as others book. Gift card balance update on `/c/[slug]` after redemption. WhatsApp AI conversation view with typing indicator.
  4. **Graceful degradation** (Week 3-4): Polling fallback for environments that don't support SSE (corporate proxies, older browsers). Configurable polling interval (5s for queue, 30s for dashboard). Connection status indicator ("Connesso in tempo reale" / "Aggiornamento ogni 30 secondi"). Bandwidth optimization: only send events relevant to current page.
- **Success Metrics**: SSE connection uptime > 99.5%; event delivery latency < 500ms; queue page shows live position without refresh; dashboard page engagement time +40% (users keep it open)
- **Risks & Mitigations**: SSE connection limits per browser (6 per domain) → single multiplexed connection with client-side routing; server memory per connection → event fan-out via Redis pub/sub at scale; mobile battery drain → reduce heartbeat frequency on mobile, pause when tab is backgrounded

### Feature 6: Guided Onboarding & Setup Wizard (Configurazione Guidata)
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Media pipeline (Feature 2) for logo upload step
- **Implementation Phases**:
  1. **Wizard framework** (Week 1): Multi-step wizard component with progress bar, back/next navigation, step validation, and save-on-each-step persistence. Step completion state stored in `Business` model (new `onboardingStep` field). Resume capability — if user abandons at step 4, they return to step 4 on next login.
  2. **Business-type adaptive steps** (Week 1-2): Step 1: Business profile (name, category, address, phone — pre-fill from Partita IVA lookup where possible). Step 2: Branching by category — "Sei un barbiere" → show service setup + queue toggle; "Hai una panetteria" → show product catalog + order setup. Step 3: Opening hours with visual weekly grid (drag to set hours, Italian defaults: 9-13, 15-19, Lunedì-Sabato). Step 4: Feature activation checklist with recommendations per business type.
  3. **Content generation** (Week 2-3): Step 5: AI-assisted website content — generate business description, meta tags, and social bio from category + name + city using existing OpenAI integration. Step 6: Logo upload (connect to media pipeline) + website template preview + one-click publish. Step 7: WhatsApp connection guide (step-by-step with screenshots for Meta Business Suite setup).
  4. **Activation tracking** (Week 3-4): Post-wizard dashboard with "Completamento: 72%" progress ring. Nudge notifications: "Hai 3 servizi ma nessuna prenotazione online — vuoi attivarla?" driven by automation engine. First-week email sequence (Day 1: guide to first booking, Day 3: loyalty program setup, Day 5: social post generation). Track activation funnel in platform analytics.
- **Success Metrics**: Wizard completion rate > 70%; time from sign-up to first published website < 15 minutes; feature activation rate (2+ features enabled) > 60% within first week; 30-day retention for wizard completers vs. non-completers
- **Risks & Mitigations**: Wizard feels overwhelming → keep to 7 steps max, each < 2 minutes; category branching complexity → start with top 5 categories, "Altro" for rest; AI-generated content quality → preview before publish with easy edit

### Feature 7: Webhook API & Developer Platform (API Aperta)
- **Effort Estimate**: 4-5 person-weeks
- **Prerequisites**: Production deployment (Feature 1), real-time events (Feature 5) for event types
- **Implementation Phases**:
  1. **API key infrastructure** (Week 1): API key generation and management (`ApiKey` model: key hash, business, scopes, rate limit, last used). Key creation/revocation in `/dashboard/settings/api`. Authentication middleware that accepts `Authorization: Bearer sk_live_xxx` headers. Per-key rate limiting (1000 req/hour default, configurable per tier).
  2. **Webhook delivery system** (Week 1-2): Webhook endpoint registration (`WebhookEndpoint` model: URL, events, secret, status). Event filtering: business selects which events to receive. Delivery with HMAC-SHA256 signature verification. Retry with exponential backoff (1min, 5min, 30min, 2h, 24h). Delivery log with response codes. `/dashboard/settings/webhooks` management page with test delivery button.
  3. **OpenAPI specification** (Week 2-3): Auto-generate OpenAPI 3.1 spec from route handlers using Zod schemas (add Zod validation to all 39 routes). Interactive API documentation at `/developers` using Swagger UI or Redoc. Code examples in cURL, JavaScript, and Python. API versioning strategy (v1 prefix).
  4. **Partner integration templates** (Week 3-5): Pre-built integration guides for top Italian tools: TeamSystem (webhook → invoice sync), SumUp (payment webhook → POS reconciliation), MailUp (customer created webhook → mailing list sync). Integration marketplace page showing available connections. Partner API program documentation.
- **Success Metrics**: 10+ API keys created within 3 months of launch; webhook delivery success rate > 99%; API documentation NPS > 8; first third-party integration published within 6 months
- **Risks & Mitigations**: API abuse → strict rate limiting + API key scoping (read-only by default); webhook delivery failures → dead letter queue + alert to business owner; breaking API changes → semantic versioning + 6-month deprecation window

### Feature 8: Staff Mobile App Experience (App Staff)
- **Effort Estimate**: 3-4 person-weeks
- **Prerequisites**: Real-time dashboard (Feature 5) for live notifications
- **Implementation Phases**:
  1. **Staff auth flow** (Week 1): Staff login via phone number + OTP (reuse `CustomerSession` OTP infrastructure adapted for staff). Staff profile linked to `StaffProfile` model — no email required for basic staff. Scoped permissions: staff see only their bookings, queue entries, and assigned services. Owner/manager see everything.
  2. **Mobile dashboard variant** (Week 1-2): `/staff` route with mobile-optimized layout: bottom tab navigation (Oggi, Clienti, Notifiche, Profilo). "Oggi" (Today) view: chronological list of today's bookings with customer name, service, time, status. Swipe actions: swipe-right to mark complete, swipe-left to call customer. Pull-to-refresh with SSE real-time updates.
  3. **Quick actions** (Week 2-3): Tap-to-call customer (tel: link). Quick check-in for walk-in customers (add to queue with one tap). "Prossimo cliente" (Next customer) button for queue-based businesses. Service completion timer (start when client sits down, notify when time is up). Break mode ("In pausa" — temporarily removes from queue rotation).
  4. **Staff schedule management** (Week 3-4): Visual weekly schedule editor for staff to set their own availability (within owner-defined constraints). Shift swap requests between staff members. Time-off request workflow (staff requests → owner approves). Staff performance dashboard for owners: bookings per staff member, average service time, customer ratings.
- **Success Metrics**: Staff daily active usage > 60% (check schedule at least once/day); booking completion via mobile > 50% of total completions; average session duration < 2 minutes (quick-check pattern); staff-attributed bookings trackable
- **Risks & Mitigations**: Phone-only auth security → OTP expires in 5 minutes, max 3 attempts; scope creep from staff requests → strict MVP (today's view + quick actions), iterate later; low staff adoption → owner-initiated setup during onboarding

### Feature 9: Smart Business Templates & Auto-Configuration (Modelli Intelligenti)
- **Effort Estimate**: 2-3 person-weeks
- **Prerequisites**: Guided onboarding wizard (Feature 6) for integration point
- **Implementation Phases**:
  1. **Template data structure** (Week 1): Template registry (`src/lib/business-templates.ts`) with typed templates per category. Each template includes: `services[]` (name, price, duration for service businesses), `products[]` (name, price, category for product businesses), `openingHours` (Italian defaults), `loyaltyConfig` (points per visit, reward threshold, reward name), `automationFlows[]` (e.g., "send WhatsApp after booking"), `whatsappFaqs[]` (common questions per business type), `websiteTemplate` (color scheme, layout), `socialThemes[]` (content ideas).
  2. **Top 10 Italian templates** (Week 1-2): Research and encode domain-specific data for: (1) Barbiere (taglio €15, barba €10, taglio+barba €22, avg 30min); (2) Parrucchiera (taglio donna €25-45, colore €50-80, piega €20, avg 45min); (3) Estetista (manicure €20, ceretta €25, massaggio €50, avg 40min); (4) Forno/Panetteria (pane €3-5, focaccia €4, dolci €3-8, products not services); (5) Fiorista (bouquet €20-50, composizioni €30-80, products); (6) Ristorante/Pizzeria (products + table booking); (7) Meccanico (tagliando €80-150, gomme €40-80, services + long duration); (8) Dentista (pulizia €80, visita €50, services + long lead time); (9) Palestra (abbonamento mensile €40, products); (10) Alimentari (products, no booking).
  3. **Auto-configuration engine** (Week 2-3): On template selection during onboarding: auto-create services/products, set opening hours, configure loyalty program, create 3 default automation flows, populate WhatsApp FAQ list, select website template. All auto-created items editable — template is a starting point, not a constraint. "Personalizza dopo" button to skip to dashboard.
- **Success Metrics**: 80% of new businesses select a template; setup time reduced by 60% vs. manual configuration; template businesses have 3x more content at Day 1 (services, products, FAQs); 30-day retention for template users vs. blank-start users
- **Risks & Mitigations**: Inaccurate pricing → label as "prezzi suggeriti per la zona di Forlì" with easy edit; template staleness → version templates with update notifications; missing categories → "Altro" fallback with AI-assisted setup using business description

### Feature 10: GDPR Compliance & Data Governance (Conformità GDPR)
- **Effort Estimate**: 4-5 person-weeks
- **Prerequisites**: Email system (Feature 3) for consent confirmation emails
- **Implementation Phases**:
  1. **Data portability & erasure** (Week 1-2): Customer data export endpoint: generates JSON/CSV with all data across 47 models (bookings, loyalty, payments, orders, conversations). Right-to-erasure: cascade delete a customer across all models with confirmation email. Business data export for platform switching. Automated data retention: archive records older than 24 months, purge after 36 months (configurable per Italian sector regulations). Erasure audit log.
  2. **Consent management** (Week 2-3): Granular consent model (`CustomerConsent` table): separate opt-in for WhatsApp notifications, push notifications, email marketing, email transactional, analytics tracking, third-party sharing. Consent collection during customer portal registration and booking flow. Consent withdrawal UI in customer portal. Consent change audit trail with timestamps.
  3. **Business compliance tools** (Week 3-4): Auto-generated privacy policy per business (template with business name, data categories, retention periods, DPO contact). Cookie consent banner for published websites (`/s/[slug]`) with accept/reject/customize. Data Processing Register (Article 30) — auto-populated from platform configuration. Data breach notification template and workflow.
  4. **Audit & access controls** (Week 4-5): Audit log for all accountant access (which data, when, who). Audit log for association admin access (aggregate vs. individual data). Data access request handling workflow (Article 15 — respond within 30 days). Annual GDPR compliance report generator for associations. Integration with existing security module (rate limiting, CSRF, validation).
- **Success Metrics**: GDPR compliance checklist score > 95%; data export response time < 30 seconds; erasure completion < 24 hours; zero data breach incidents; association compliance audit passed
- **Risks & Mitigations**: Cascade delete complexity across 47 models → carefully map all foreign key relationships, use database transactions; consent fatigue for users → minimize consent steps (batch consent at registration, granular changes in settings); regulatory changes → abstract compliance rules behind configuration, not code

---

## Part 5: Executive Summary

```
┌─────────────────────────────────────────────────────────┐
│ PROJECT VIABILITY SCORECARD (Iteration 4)               │
├─────────────────────────────────────────────────────────┤
│ Current Market Fit:       9/10  █████████░              │
│ Growth Potential:         9/10  █████████░              │
│ Technical Foundation:     7/10  ███████░░░              │
│ Community Health:         3/10  ███░░░░░░░              │
│ Competitive Position:    10/10  ██████████              │
├─────────────────────────────────────────────────────────┤
│ OVERALL SCORE:            8/10  ████████░░              │
│ (was 7/10 in Iter 3 — +1 from competitive position)    │
└─────────────────────────────────────────────────────────┘
```

### Score Justification (Changes from Iteration 3)

- **Market Fit: 9→9** (unchanged): 47 features now cover service businesses (booking, queue, loyalty), product businesses (catalog, orders, storefront), and professional services (invoicing, accountant portal). The remaining gap isn't feature coverage — it's that zero real businesses use it yet. Market fit can only be truly validated with deployment.

- **Growth Potential: 9→9** (unchanged): TAM remains €1.5B ARR for Italian SME SaaS. The addition of association white-label portals, accountant referral system, and marketplace create three distinct distribution channels. But none are live — growth potential is theoretical until Feature 1 (deployment) is completed.

- **Technical Foundation: 7→7** (unchanged despite 61% code growth): Test coverage improved from 0 to 59 tests, which moved the needle from "irresponsible" to "foundation exists." But 59 tests across 110K lines (0.05% ratio) and only 6 of 25 modules covered means the foundation score can't rise further. The WhatsApp AI module (374 lines of AI-powered conversation handling) has zero tests. The payment module handling real money has 4 tests. The technical foundation score will rise to 8 when coverage exceeds 80% on `src/lib/` and E2E tests verify critical flows.

- **Community Health: 3→3** (unchanged): 47 commits from a single developer (Jose David Baena). Bus factor remains 1. No external contributors, no open-source presence, no contributor documentation. At 110K lines, this is becoming a structural risk — a single developer cannot maintain, deploy, and support a platform of this complexity while also doing sales and onboarding.

- **Competitive Position: 9→10** (+1): With 47 models covering 4 stakeholder layers (business owner, customer, accountant, association admin), the platform has crossed from "broadest" to "categorically unique." No Italian competitor — and no global SME platform — offers this combination: WhatsApp AI assistant + product catalog + e-invoicing + association portals + customer payments + accountant referral + marketplace + loyalty + queue + cross-promotion + AI social content + AI advisor + automation engine in a single product. The competitive position is now **definitional** — Bottega Digitale is creating a category, not competing in one.

### Priority Matrix

```
                        HIGH IMPACT
                            │
        Feature 4           │         Feature 1
        (Deep Testing)      │         (Deployment Kit)
                            │
        Feature 10          │         Feature 2
        (GDPR)              │         (Media Pipeline)
                            │
                            │         Feature 3
                            │         (Email System)
LOW EFFORT ─────────────────┼───────────────── HIGH EFFORT
                            │
        Feature 9           │         Feature 5
        (Templates)         │         (Real-Time)
                            │
        Feature 6           │         Feature 7
        (Onboarding Wizard) │         (Webhook API)
                            │
        Feature 8           │
        (Staff Mobile)      │
                        LOW IMPACT
```

### Recommended Build Order

```
Phase A — "Make It Real" (Weeks 1-5):
  Feature 1  (Deployment Kit)         ← Cannot demo, sell, or validate without deploy
  Feature 2  (Media Pipeline)         ← Product catalog and marketplace are unusable without photos

Phase B — "Make It Trustworthy" (Weeks 6-11):
  Feature 4  (Deep Test Coverage)     ← 200+ tests before any real business data flows through
  Feature 3  (Email System)           ← Table-stakes for password reset, confirmations, onboarding

Phase C — "Make It Frictionless" (Weeks 12-17):
  Feature 6  (Guided Onboarding)      ← Sign-up-to-value in 15 minutes
  Feature 9  (Business Templates)     ← One-click "Sono un barbiere" setup

Phase D — "Make It Live" (Weeks 18-23):
  Feature 5  (Real-Time Dashboard)    ← Queue displays, live notifications, always-open dashboard
  Feature 8  (Staff Mobile)           ← Daily active usage from staff (5-10x/day vs. owner 1-2x/day)

Phase E — "Make It Compliant & Extensible" (Weeks 24-30):
  Feature 10 (GDPR Compliance)        ← Legal prerequisite for association partnerships
  Feature 7  (Webhook API)            ← POS/accounting integrations, developer ecosystem
```

**Total estimated effort**: 32-41 person-weeks (8-10 months solo, 4-5 months with 2 developers)

### Revenue Model Evolution

```
After Iteration 3 (projected):
  ├── SaaS subscriptions: €29-59/mo/business (retail)
  ├── Association group plans: €15-25/mo/business (volume)
  ├── Transaction fees: 2.5% on deposits + gift cards
  ├── Marketplace featured placement: €10-20/mo/business
  └── Accountant referral commissions: revenue share
      Projected: €200K+ ARR at 500 businesses

After Iteration 4 (projected):
  ├── SaaS subscriptions: €29-59/mo/business (retail)           40%
  ├── Association group plans: €15-25/mo/business (volume)      20%
  ├── Transaction fees: 2.5% on deposits + gift cards + orders  20%
  ├── API access: €49/mo premium tier for webhook integrations   5%
  ├── Marketplace featured placement: €10-20/mo/business         5%
  ├── Media storage overage: €5/mo per 500MB above tier limit    5%
  └── Accountant referral commissions: revenue share             5%
      Projected: €350K+ ARR at 700 businesses (blended rate €42/mo)

Revenue mix at scale (2,000+ businesses):
  ├── Subscriptions:        35%  (~€420K)
  ├── Transaction fees:     25%  (~€300K)
  ├── Association plans:    20%  (~€240K)
  ├── API/integrations:     10%  (~€120K)
  └── Marketplace/storage:  10%  (~€120K)
      Total: ~€1.2M ARR
```

### Cross-Iteration Feature Map

```
Iteration 1 (Foundation):     Iteration 2 (Integration):     Iteration 3 (Monetization):     Iteration 4 (Operations):
──────────────────────────     ──────────────────────────      ──────────────────────────       ──────────────────────────
Auth + Onboarding ──────────→ Security Hardening ───────────→ Testing & CI/CD ──────────────→ Deep Coverage + E2E
Prisma DB (16 models) ──────→ Schema (27 models) ──────────→ Schema (47 models) ────────────→ GDPR Data Governance
Stripe Billing ─────────────→ Automation Engine ────────────→ Payment Collection ────────────→ Webhook API + Partners
Website Publishing ─────────→ Online Booking Widget ────────→ Product Storefront ────────────→ Media Pipeline
WhatsApp Integration ───────→ Customer Portal ─────────────→ WhatsApp Conversational AI ────→ Real-Time Dashboard
AI Social Content ──────────→ AI Business Advisor ──────────→ Association Portal ────────────→ Guided Onboarding Wizard
Loyalty Cards ──────────────→ Cross-Promotion ─────────────→ Marketplace + Gift Cards ──────→ Business Templates
Google Business Sync ───────→ Background Job Scheduler ────→ Platform Analytics + Churn ────→ Staff Mobile App
Queue Management ───────────→ Multi-Staff Management ──────→ Accountant Portal ─────────────→ (embedded in API)
Directory ──────────────────→ PWA Shell ────────────────────→ i18n (IT+EN) ──────────────────→ Transactional Email
Reviews Dashboard ──────────→ E-Invoice FatturaPA ─────────→ Notification Center ────────────→ (embedded in email)
Analytics Dashboard ────────→ Event Bus ────────────────────→ (embedded everywhere) ─────────→ Production Deployment
```

Each iteration has a distinct character:
- **Iteration 1**: Created the modules (12 features — the building blocks)
- **Iteration 2**: Connected the modules (10 features — the nervous system)
- **Iteration 3**: Monetized the modules (10 features — the business model)
- **Iteration 4**: Operationalizes the modules (10 features — the production path)

### Bottom Line

**Bottega Digitale has achieved an extraordinary competitive position — 47 features, 47 data models, 110K lines creating a category-defining Italian SME platform that no competitor can match on breadth. But the platform serves zero real businesses.** The fundamental shift in Iteration 4 is from "what else should we build?" to "how do we make what exists usable, deployable, and compliant?" The 10 proposed features contain zero new business capabilities — instead, they provide the infrastructure (deployment, media, email, GDPR, real-time, onboarding, testing) that transforms a 110K-line codebase from "remarkable prototype" into "deployable product." **The single most important next step is Feature 1: Production Deployment Kit.** When `bottegadigitale.it` serves a real barbershop in Forlì — with uploaded photos, email confirmations, live queue updates, and GDPR-compliant data handling — that's when the 47 features stop being code and start being a business. Everything in Iteration 4 serves this one goal: close the gap between "built" and "running."

---

## Appendix A: Feature Dependency Graph

```
┌──────────────────────────────────────────────────────────────────┐
│                    ITERATION 4 DEPENDENCIES                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Feature 1 (Deployment) ─── no dependencies, start immediately    │
│       │                                                           │
│       ├──→ Feature 2 (Media Pipeline — needs cloud storage)       │
│       │         │                                                 │
│       │         └──→ Feature 6 (Onboarding Wizard — needs upload) │
│       │                   │                                       │
│       │                   └──→ Feature 9 (Templates — needs wiz.) │
│       │                                                           │
│       ├──→ Feature 3 (Email — needs production SMTP)              │
│       │         │                                                 │
│       │         └──→ Feature 10 (GDPR — needs consent emails)     │
│       │                                                           │
│       ├──→ Feature 5 (Real-Time — needs production WebSocket)     │
│       │         │                                                 │
│       │         ├──→ Feature 7 (Webhook API — reuses event types) │
│       │         │                                                 │
│       │         └──→ Feature 8 (Staff Mobile — needs live data)   │
│       │                                                           │
│  Feature 4 (Deep Testing) ─── no hard deps, parallel-safe        │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

## Appendix B: Technical Debt Inventory

| Debt Item | Severity | Location | Recommended Fix |
|-----------|----------|----------|-----------------|
| 19 of 25 lib modules have 0 tests | High | `src/lib/` | Feature 4 |
| No image upload infrastructure | High | `imageUrl` fields across 4 modules | Feature 2 |
| No email sending capability | High | Missing entirely | Feature 3 |
| Hardcoded demo data in `data.ts` | Medium | `src/lib/data.ts` | Feature 1 (seed separation) |
| SQLite `dev.db` as only database | Medium | `prisma/schema.prisma` | Feature 1 (Turso migration) |
| No API versioning | Medium | `src/app/api/` | Feature 7 |
| No data export/portability | Medium | GDPR requirement | Feature 10 |
| JSON fields stored as strings | Low | Schema (`openingHours`, `conditions`, `actions`, etc.) | SQLite limitation — accept |
| Single contributor | Structural | All files | Document architecture, open-source considerations |
| No monitoring/observability | Medium | Missing entirely | Feature 1 (health checks), future: Sentry/Grafana |

## Appendix C: Competitive Position Summary

```
Feature Coverage Matrix (47 total features in Bottega Digitale):

                          Bottega  Wix  Treatwell  FattureCloud  SumUp  Partoo
Website Publishing          ✅     ✅      ❌          ❌         ❌     ❌
Booking Management          ✅     ✅      ✅          ❌         ❌     ❌
CRM / Customer Mgmt        ✅     ❌      ✅          ❌         ❌     ❌
WhatsApp Integration        ✅     ❌      ❌          ❌         ❌     ❌
WhatsApp AI Assistant       ✅     ❌      ❌          ❌         ❌     ❌
Loyalty Cards               ✅     ❌      ❌          ❌         ❌     ❌
Queue Management            ✅     ❌      ❌          ❌         ❌     ❌
Reviews Dashboard           ✅     ❌      ✅          ❌         ❌     ✅
AI Social Content           ✅     ✅      ❌          ❌         ❌     ❌
Analytics Dashboard         ✅     ✅      ✅          ✅         ✅     ✅
Google Business Sync        ✅     ❌      ❌          ❌         ❌     ✅
Local Directory             ✅     ❌      ✅          ❌         ❌     ✅
E-Invoice (FatturaPA)       ✅     ❌      ❌          ✅         ❌     ❌
Automation Engine           ✅     ❌      ❌          ❌         ❌     ❌
Job Scheduler               ✅     ❌      ❌          ❌         ❌     ❌
Online Booking Widget       ✅     ✅      ✅          ❌         ❌     ❌
AI Business Advisor         ✅     ❌      ❌          ❌         ❌     ❌
Multi-Staff                 ✅     ❌      ✅          ❌         ❌     ❌
Customer Portal             ✅     ❌      ✅          ❌         ❌     ❌
Cross-Promotion Network     ✅     ❌      ❌          ❌         ❌     ❌
PWA Shell                   ✅     ❌      ❌          ❌         ❌     ❌
Product Catalog             ✅     ✅      ❌          ❌         ✅     ❌
Marketplace                 ✅     ✅      ✅          ❌         ❌     ❌
Gift Cards                  ✅     ❌      ✅          ❌         ❌     ❌
Association Portal          ✅     ❌      ❌          ❌         ❌     ❌
Accountant Portal           ✅     ❌      ❌          ✅         ❌     ❌
Payment Collection          ✅     ✅      ✅          ❌         ✅     ❌
Platform Analytics/Churn    ✅     ❌      ❌          ❌         ❌     ❌
i18n (IT + EN)              ✅     ✅      ✅          ✅         ✅     ✅
Notification Center         ✅     ❌      ✅          ❌         ❌     ❌
───────────────────────────────────────────────────────────────────────
Coverage (of 30 shown):     30     8       12          4          5      6
Percentage:                100%   27%     40%         13%        17%    20%
```

Bottega Digitale's position is unassailable on feature breadth. The battle is now about execution quality, deployment velocity, and distribution activation.

# UI Coverage Audit — Bottega Digitale

> **Executive summary**
>
> - **42 features inventoried** across auth, operations, commerce, messaging, automation, marketplace, compliance, and observability.
> - **Coverage snapshot:** 19 `[COVERED]`, 17 `[PARTIAL]`, 5 `[HIDDEN]`, 1 `[MISSING]`.
> - **Strongest UX areas:** authentication, bookings, CRM, loyalty, website publishing, developer/API settings, and health/observability.
> - **Highest-priority gaps:** a missing capability-control surface for runtime business flags, a read-only automations page despite an existing richer client, underpowered catalog/order operations, notifications without read-state controls, and payment setup flows with weak next-step guidance.
> - **Implementation focus for this run:** remediation items **#1–#6** from the stack rank, with larger architectural items deferred only if they do not fit the remaining budget.

## Phase 1 — Feature Inventory

### Auth & Access
1. Session authentication — `/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/session`, and `src/lib/auth.ts` implement cookie sessions, password hashing, and business-context resolution.
2. Customer self-auth — `/api/customer-auth/route.ts` plus `src/lib/customer-auth.ts` power customer-side OTP/session access used by public loyalty and self-service flows.
3. Route protection and CSRF — `src/proxy.ts` protects `/dashboard`, `/admin`, `/staff`, and protected API prefixes while enforcing same-origin mutations.
4. Developer access management — `/dashboard/settings/api`, `/api/api-keys`, `/api/webhooks`, `src/lib/webhook-api.ts`, and `/api/openapi` expose integration keys, webhook registration, and the OpenAPI contract.

### Booking, CRM & Daily Operations
5. Booking agenda CRUD — `/dashboard/bookings`, `/api/bookings`, `/api/bookings/[id]`, `src/lib/dashboard-data.ts`, and `src/lib/availability.ts` manage calendar views, booking creation, edits, and deletions.
6. Public booking widget — `/book/[slug]`, `/api/booking-public`, and `/api/availability` expose service discovery, slot lookup, and public appointment submission.
7. Customer CRM — `/dashboard/customers`, `/api/customers`, `/api/customers/[id]`, and `src/lib/customer-crm.ts` cover customer profiles, visit history, segmentation, and notes.
8. Walk-in queue management — `/dashboard/queue`, `/queue/[businessId]`, `/api/queue`, and `src/lib/staff-mobile.ts` cover self check-in, queue state updates, and live queue operations.
9. Staff operations — `/dashboard/staff`, `/staff/*`, `/api/staff`, and `src/lib/staff-mobile.ts` handle staff OTP login, profiles, performance, queue help, and role assignment.
10. Onboarding checklist — `/dashboard/onboarding` and `src/lib/onboarding.ts` compute setup progress from services, website, booking, loyalty, and channel readiness.
11. Daily briefing — `/dashboard`, `src/lib/daily-briefing.ts`, and supporting dashboard data modules summarize today’s agenda, revenue, alerts, and highlights.

### Commerce, Catalog & Payments
12. Product catalog storefront — `/shop/[slug]`, `/api/products`, `/api/products/[id]`, and `src/lib/product-catalog.ts` cover product retrieval, storefront rendering, and catalog statistics.
13. Order intake and fulfillment — `/api/orders`, `/api/orders/[id]`, `src/lib/product-catalog.ts#createOrder`, and notification hooks support order creation, status updates, and order totals.
14. Payments and deposits — `/dashboard/payments`, `/api/payments`, and `src/lib/payments.ts` provide payment stats, deposit logic, gift-card redemption, and transaction history.
15. Stripe billing and customer portal — `/dashboard/billing`, `/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/webhook`, and `src/lib/stripe.ts` handle subscription checkout and billing portal access.
16. Invoicing and accountant exports — `/dashboard/invoices`, `/api/invoices`, `/commercialista/*`, `/api/accountant`, and `src/lib/e-invoice.ts` support invoice generation, fiscal profiles, and accountant reporting.
17. Gift cards — `/api/gift-cards`, `src/lib/payments.ts#createGiftCard`, and marketplace payment flows handle gift-card sales and redemptions.

### Marketing, Loyalty & Messaging
18. Loyalty program and public card — `/dashboard/loyalty`, `/loyalty/[businessId]`, `/api/loyalty`, `/api/loyalty/checkin`, and loyalty Prisma models manage points, rewards, and redemptions.
19. Review sync and response assistance — `/dashboard/reviews`, `/api/google/sync`, and `src/lib/google-business.ts` surface reviews, rating summaries, and suggested replies.
20. WhatsApp Business messaging — `/dashboard/whatsapp`, `/api/whatsapp/send`, `/api/whatsapp/webhook`, and `src/lib/whatsapp.ts` cover outbound messaging, inbox history, and webhook ingestion.
21. WhatsApp AI concierge — `/dashboard/whatsapp/ai`, `/api/whatsapp-ai`, `/api/whatsapp-ai/config`, and `src/lib/whatsapp-ai.ts` provide FAQ/personality settings and automated tool-backed replies.
22. Social AI content — `/dashboard/social`, `/api/ai/generate-post`, and `src/lib/ai-content.ts` cover social post generation, post history, and publishing suggestions.
23. Notifications and push delivery — `/dashboard/notifications`, `/api/notifications`, `/api/push`, `src/lib/notifications.ts`, and `src/lib/notification-orchestrator.ts` implement activity feeds, unread counts, push registration, and routing rules.
24. Campaign, email, and NPS intelligence — `src/lib/campaign-builder.ts`, `src/lib/email.ts`, `src/lib/email-i18n.ts`, and `src/lib/nps-survey.ts` provide backend-only audience selection, localized email delivery, and NPS trend analysis.
25. AI advisor insights — `/dashboard/advisor`, `/api/insights`, `src/lib/ai-advisor.ts`, and related insights modules surface generated business recommendations.

### Automation, Analytics & Platform Intelligence
26. Automation flows — `/dashboard/automations`, `/api/automations`, `src/lib/event-bus.ts`, and `src/lib/event-router.ts` define triggers, actions, seeded templates, and execution histories.
27. Background jobs — `/dashboard/jobs`, `/api/jobs`, and `src/lib/job-scheduler.ts` track scheduled jobs, retries, and execution status.
28. Merchant analytics — `/dashboard/analytics`, `src/lib/merchant-analytics.ts`, and booking/review aggregations calculate booking growth, channel mix, rankings, and peak-hour data.
29. Platform analytics and admin dashboard — `/admin`, `/api/admin/analytics`, and `src/lib/platform-analytics.ts` aggregate MRR, cohorts, feature adoption, and platform events.
30. Business health scoring — `src/lib/platform-analytics.ts#calculateHealthScore`, `BusinessHealthScore` in Prisma, and `/admin` at-risk sections model churn risk and health tiers.
31. Realtime events — `/api/events/stream`, `src/lib/realtime.ts`, and `src/components/useRealtimeEvents.ts` support SSE updates for live dashboard surfaces.

### Web Presence, Directory & Marketplace
32. Website builder and publishing — `/dashboard/website`, `/api/website/publish`, `src/lib/business-templates.ts`, and website editor components manage templates, publishing state, and public storefront data.
33. Public directory and short links — `/directory`, `/s/[slug]`, `/c/[slug]`, `/api/directory`, and `/api/regions` expose the public discovery layer for businesses.
34. Marketplace and partner network — `/marketplace`, `/dashboard/network`, `/api/marketplace`, `/api/partnerships`, and `src/lib/marketplace.ts` cover listings, cross-promo data, vouchers, and partner discovery.
35. Association portal — `/association/[slug]`, `/api/associations`, and `src/lib/association-portal.ts` support association landing pages, bulk onboarding, and membership operations.
36. Developer portal — `/developers`, `/developers/api`, and `/api/openapi` expose API docs and integration guidance.
37. SEO and platform metadata — `/api/sitemap`, `/api/robots`, `src/app/layout.tsx`, `public/manifest.json`, and `src/lib/seo.ts` power discoverability, structured metadata, and PWA install behavior.
38. Moonshot and experimental surfaces — `/dashboard/moonshot`, `/experiences`, `/passports/[passportId]`, `/api/moonshot`, and `src/lib/moonshot-lab.ts` expose experimental product concepts.

### Compliance, Media & Observability
39. GDPR and privacy operations — `/dashboard/privacy`, `/api/gdpr`, and `src/lib/gdpr.ts` implement export/erase workflows, consents, and audit logging support.
40. Media library and storage quotas — `/dashboard/media`, `/api/media`, and `src/lib/media.ts` handle uploads, quota checks, and media URL generation.
41. Health and observability — `/admin/health`, `/api/health`, and `src/lib/observability.ts` provide service health, integration readiness, and environment checks.
42. Business capability controls — Prisma `Business` flags (`websitePublished`, `queueEnabled`, `loyaltyEnabled`, `onlineBookingEnabled`, `crossPromoEnabled`, `whatsappAiEnabled`, `catalogEnabled`, `depositsEnabled`) gate runtime behavior across APIs and pages, but there is no dedicated operator-facing control surface today.

## Phase 2 — UI Coverage Mapping

| # | Feature | Domain | UI Status | Notes |
| --- | --- | --- | --- | --- |
| 1 | Session authentication | Auth & Access | [COVERED] | Login, register, reset, and authenticated session checks all have surfaced UI entry points. |
| 2 | Customer self-auth | Auth & Access | [PARTIAL] | Public customer auth exists in API form, but the entry flow is embedded inside loyalty/self-service pages rather than a reusable surface. |
| 3 | Route protection and CSRF | Auth & Access | [HIDDEN] | Intentional infrastructure in `src/proxy.ts`; no direct UI required. |
| 4 | Developer access management | Auth & Access | [COVERED] | `/dashboard/settings/api` exposes API-key and webhook workflows with docs links. |
| 5 | Booking agenda CRUD | Booking, CRM & Daily Operations | [COVERED] | `/dashboard/bookings` uses a dedicated manager component backed by CRUD APIs. |
| 6 | Public booking widget | Booking, CRM & Daily Operations | [COVERED] | Public booking route and availability APIs are surfaced to end users. |
| 7 | Customer CRM | Booking, CRM & Daily Operations | [COVERED] | `/dashboard/customers` has a full client manager and backend CRUD. |
| 8 | Walk-in queue management | Booking, CRM & Daily Operations | [PARTIAL] | Queue dashboard and public entry exist, but queue enablement and service-time tuning are not surfaced in settings. |
| 9 | Staff operations | Booking, CRM & Daily Operations | [PARTIAL] | Staff stats pages exist, but create/edit/schedule assignment workflows are missing from the UI. |
| 10 | Onboarding checklist | Booking, CRM & Daily Operations | [COVERED] | `/dashboard/onboarding` reflects completion across core setup steps. |
| 11 | Daily briefing | Booking, CRM & Daily Operations | [COVERED] | Dashboard overview prominently surfaces the generated day summary. |
| 12 | Product catalog storefront | Commerce, Catalog & Payments | [PARTIAL] | Public catalog exists, but the merchant dashboard only shows KPIs and recent orders, not product CRUD. |
| 13 | Order intake and fulfillment | Commerce, Catalog & Payments | [PARTIAL] | Orders are visible in the products area, but there is no dedicated fulfillment or status-update UI. |
| 14 | Payments and deposits | Commerce, Catalog & Payments | [PARTIAL] | Payment KPIs and transaction history exist, yet onboarding and deposit controls are thin. |
| 15 | Stripe billing and customer portal | Commerce, Catalog & Payments | [COVERED] | Billing page exposes plan management and portal actions. |
| 16 | Invoicing and accountant exports | Commerce, Catalog & Payments | [PARTIAL] | Invoice screens exist, but accountant invitation/export affordances are fragmented across specialized areas. |
| 17 | Gift cards | Commerce, Catalog & Payments | [PARTIAL] | Backend and payment flows exist; merchant-facing campaign activation remains sparse. |
| 18 | Loyalty program and public card | Marketing, Loyalty & Messaging | [COVERED] | Loyalty dashboard includes settings, redemption, and public-link distribution. |
| 19 | Review sync and response assistance | Marketing, Loyalty & Messaging | [COVERED] | Reviews page surfaces rating data and suggested response copy. |
| 20 | WhatsApp Business messaging | Marketing, Loyalty & Messaging | [PARTIAL] | Message history is visible, but compose, template, and setup actions are limited. |
| 21 | WhatsApp AI concierge | Marketing, Loyalty & Messaging | [COVERED] | Dedicated AI settings page exposes enablement, personality, FAQs, and capability visibility. |
| 22 | Social AI content | Marketing, Loyalty & Messaging | [PARTIAL] | Social page shows history and suggestions, but the generation workflow is not surfaced directly in-page. |
| 23 | Notifications and push delivery | Marketing, Loyalty & Messaging | [PARTIAL] | The activity feed is visible, but mark-as-read and preference controls are absent. |
| 24 | Campaign, email, and NPS intelligence | Marketing, Loyalty & Messaging | [HIDDEN] | Rich backend modules exist without a dedicated merchant workspace. |
| 25 | AI advisor insights | Marketing, Loyalty & Messaging | [COVERED] | `/dashboard/advisor` renders generated recommendations and supporting metrics. |
| 26 | Automation flows | Automation, Analytics & Platform Intelligence | [PARTIAL] | Read-only server page ships today even though a richer client editor already exists in the codebase. |
| 27 | Background jobs | Automation, Analytics & Platform Intelligence | [COVERED] | `/dashboard/jobs` surfaces job counts, history, and failure messages. |
| 28 | Merchant analytics | Automation, Analytics & Platform Intelligence | [PARTIAL] | Current dashboard covers top-line metrics but omits deeper service ranking and peak-hour insights already computed in lib code. |
| 29 | Platform analytics and admin dashboard | Automation, Analytics & Platform Intelligence | [PARTIAL] | Admin KPIs are visible, but authorization is too coarse and the page lacks stronger guardrails. |
| 30 | Business health scoring | Automation, Analytics & Platform Intelligence | [COVERED] | Health distribution and at-risk cohorts are surfaced in `/admin`. |
| 31 | Realtime events | Automation, Analytics & Platform Intelligence | [HIDDEN] | SSE plumbing exists behind the scenes rather than as a standalone UI surface. |
| 32 | Website builder and publishing | Web Presence, Directory & Marketplace | [COVERED] | Website editor supports templates, publishing, and preview flows. |
| 33 | Public directory and short links | Web Presence, Directory & Marketplace | [COVERED] | Directory, short links, and regional search are visible publicly. |
| 34 | Marketplace and partner network | Web Presence, Directory & Marketplace | [PARTIAL] | Network insights and marketplace views exist, but action-oriented partner workflows are limited. |
| 35 | Association portal | Web Presence, Directory & Marketplace | [PARTIAL] | Association pages exist, but member/admin management remains thin in the UI. |
| 36 | Developer portal | Web Presence, Directory & Marketplace | [COVERED] | Developer landing pages and live API docs are available. |
| 37 | SEO and platform metadata | Web Presence, Directory & Marketplace | [HIDDEN] | Manifest, robots, sitemap, and metadata are implementation infrastructure. |
| 38 | Moonshot and experimental surfaces | Web Presence, Directory & Marketplace | [HIDDEN] | Experimental pages are intentionally separate from mainstream workflows. |
| 39 | GDPR and privacy operations | Compliance, Media & Observability | [PARTIAL] | Privacy page exists, but guided export/erase feedback and progression remain limited. |
| 40 | Media library and storage quotas | Compliance, Media & Observability | [COVERED] | Media manager includes quota visibility and file management. |
| 41 | Health and observability | Compliance, Media & Observability | [COVERED] | `/admin/health` and `/api/health` surface environment and integration readiness. |
| 42 | Business capability controls | Compliance, Media & Observability | [MISSING] | Runtime feature flags are present in Prisma and APIs, but no dedicated UI lets operators review or change them holistically. |

## Phase 3 — UX Quality Assessment

**#2 — Customer self-auth** `[MINOR]`
- Criterion violated: Discoverability.
- Specific problem: Customer-side access is embedded in loyalty/public flows, so there is no reusable or clearly explained self-service entry point for returning customers.
- Location in codebase: `src/app/loyalty/[businessId]/page.tsx`, `src/app/api/customer-auth/route.ts`, `src/lib/customer-auth.ts`.

**#8 — Walk-in queue management** `[MAJOR]`
- Criterion violated: Discoverability, Edge cases.
- Specific problem: Operators can process a queue once it exists, but they cannot see or edit queue capability state (`queueEnabled`) or average service time from a dedicated settings surface, which makes disabled queues feel broken.
- Location in codebase: `src/app/dashboard/queue/queue-dashboard-client.tsx`, `src/app/dashboard/settings/page.tsx`, `prisma/schema.prisma` (`queueEnabled`, `avgServiceMinutes`), `src/app/api/queue/route.ts`.

**#9 — Staff operations** `[MAJOR]`
- Criterion violated: Feedback, Edge cases.
- Specific problem: Staff screens summarize team members but do not expose create/edit flows, role changes, working-hours editing, or service assignment despite backend support.
- Location in codebase: `src/app/dashboard/staff/page.tsx`, `src/app/api/staff/route.ts`, `src/lib/staff-mobile.ts`, `prisma/schema.prisma` (`StaffProfile`).

**#12 — Product catalog storefront** `[CRITICAL]`
- Criterion violated: Discoverability, Feedback.
- Specific problem: Merchants are told they can manage products and stock, but `/dashboard/products` only shows KPIs and recent orders; product CRUD is backend-only.
- Location in codebase: `src/app/dashboard/products/page.tsx`, `src/app/api/products/route.ts`, `src/app/api/products/[id]/route.ts`, `src/lib/product-catalog.ts`.

**#13 — Order intake and fulfillment** `[MAJOR]`
- Criterion violated: Consistency, Feedback.
- Specific problem: Orders appear as read-only history inside the products dashboard with no explicit fulfillment actions, progress controls, or empty-state CTA for merchants handling commerce orders.
- Location in codebase: `src/app/dashboard/products/page.tsx`, `src/app/api/orders/route.ts`, `src/app/api/orders/[id]/route.ts`, `src/lib/product-catalog.ts`.

**#14 — Payments and deposits** `[MAJOR]`
- Criterion violated: Discoverability, Feedback.
- Specific problem: The payments page reports configuration state and transactions but gives no guided CTA to start Stripe Connect onboarding or adjust deposit-related business settings from the page itself.
- Location in codebase: `src/app/dashboard/payments/page.tsx`, `src/lib/payments.ts`, `prisma/schema.prisma` (`stripeConnectAccountId`, `depositsEnabled`, `depositPercentage`).

**#20 — WhatsApp Business messaging** `[MAJOR]`
- Criterion violated: Discoverability, Edge cases.
- Specific problem: Merchants can review message history, but there is no direct compose/send workspace, no setup completion checklist, and limited recovery guidance when WhatsApp is not configured.
- Location in codebase: `src/app/dashboard/whatsapp/page.tsx`, `src/app/api/whatsapp/send/route.ts`, `src/lib/whatsapp.ts`.

**#23 — Notifications and push delivery** `[MAJOR]`
- Criterion violated: Feedback, Consistency.
- Specific problem: The UI shows unread badges but offers no mark-as-read or “mark all as read” controls even though the API supports both actions, leaving the feed permanently noisy.
- Location in codebase: `src/app/dashboard/notifications/page.tsx`, `src/app/api/notifications/route.ts`, `src/lib/notifications.ts`.

**#24 — Campaign, email, and NPS intelligence** `[MAJOR]`
- Criterion violated: Discoverability.
- Specific problem: There is meaningful backend value in campaigns, localized email, and NPS analytics, but merchants have no routed workspace to access these capabilities.
- Location in codebase: `src/lib/campaign-builder.ts`, `src/lib/email.ts`, `src/lib/email-i18n.ts`, `src/lib/nps-survey.ts`.

**#26 — Automation flows** `[CRITICAL]`
- Criterion violated: Consistency, Feedback.
- Specific problem: The shipped page is read-only while an existing `AutomationsClient` already supports create/edit/toggle/delete interactions; the API is also missing the DELETE handler that the client expects.
- Location in codebase: `src/app/dashboard/automations/page.tsx`, `src/app/dashboard/automations/automations-client.tsx`, `src/app/api/automations/route.ts`.

**#28 — Merchant analytics** `[MAJOR]`
- Criterion violated: Edge cases, Discoverability.
- Specific problem: The analytics page stops at high-level counts even though deeper service rankings, peak hours, and channel breakdown logic already exists; this leaves actionable insights hidden.
- Location in codebase: `src/app/dashboard/analytics/page.tsx`, `src/lib/merchant-analytics.ts`.

**#29 — Platform analytics and admin dashboard** `[MAJOR]`
- Criterion violated: Permission denied, Consistency.
- Specific problem: Admin analytics is presented as an admin-only surface, but the API currently allows any authenticated business owner because no explicit platform-admin policy is enforced.
- Location in codebase: `src/app/api/admin/analytics/route.ts`, `src/lib/auth.ts`, `prisma/schema.prisma` (`User.role`).

**#34 — Marketplace and partner network** `[MAJOR]`
- Criterion violated: Discoverability, Feedback.
- Specific problem: The network page surfaces partnership and voucher data, but merchants cannot initiate, accept, or manage partnerships from the same workspace.
- Location in codebase: `src/app/dashboard/network/page.tsx`, `src/app/api/partnerships/route.ts`, `src/lib/marketplace.ts`.

**#35 — Association portal** `[MINOR]`
- Criterion violated: Edge cases.
- Specific problem: Association UI exists, but member-centric actions and admin affordances are not obvious beyond the landing experience.
- Location in codebase: `src/app/association/[slug]/page.tsx`, `src/app/api/associations/route.ts`, `src/lib/association-portal.ts`.

**#39 — GDPR and privacy operations** `[MAJOR]`
- Criterion violated: Feedback, Accessibility.
- Specific problem: Privacy workflows exist, but users do not get strong in-flow progress, completion, or denial states for export/erasure tasks, which are sensitive actions.
- Location in codebase: `src/app/dashboard/privacy/page.tsx`, `src/app/api/gdpr/route.ts`, `src/lib/gdpr.ts`.

**#42 — Business capability controls** `[CRITICAL]`
- Criterion violated: Discoverability, Consistency.
- Specific problem: Core business flags drive whether queue, catalog, booking, deposits, website publishing, cross-promo, loyalty, and WhatsApp AI actually work, but there is no single place in the UI to inspect or change them.
- Location in codebase: `prisma/schema.prisma` (`Business` flags), `src/app/dashboard/settings/page.tsx`, `src/app/api/queue/route.ts`, `src/app/api/booking-public/route.ts`, `src/app/api/loyalty/route.ts`, `src/app/api/whatsapp-ai/config/route.ts`.

## Phase 4 — Remediation Plan

1. **Add a capability control center** — Fix feature discoverability for queue, booking, catalog, website, loyalty, deposits, WhatsApp AI, and cross-promo. **Where:** new settings workspace plus a protected route handler for business capability updates (`src/app/dashboard/settings/*`, new `/api/...` handler, `src/proxy.ts`). **Recommended pattern:** server-render current business flags, then use a small client panel with optimistic toggles, status chips, and public-link copy actions. **Effort:** `[S]`
2. **Restore the interactive automations workspace** — Replace the read-only automations page with the existing client editor and complete the missing API delete path. **Where:** `src/app/dashboard/automations/page.tsx`, `src/app/dashboard/automations/automations-client.tsx`, `src/app/api/automations/route.ts`. **Recommended pattern:** pass server-fetched flows/templates into the client component and keep all mutation feedback in toast + inline error states. **Effort:** `[S]`
3. **Add merchant-side product CRUD** — Let merchants create, edit, archive, and review catalog items directly from `/dashboard/products`. **Where:** `src/app/dashboard/products/*`, `src/app/api/products/*`. **Recommended pattern:** dedicated client manager with a create/edit form, optimistic list updates, empty-state CTA, and per-row availability/stock controls. **Effort:** `[M]`
4. **Add order fulfillment controls** — Surface status progression, notes, and empty-state guidance for recent orders. **Where:** `src/app/dashboard/products/*`, `src/app/api/orders/*`, `src/lib/product-catalog.ts`. **Recommended pattern:** colocate an order board with clear status chips, next-step buttons, and aria-live success/error feedback. **Effort:** `[S]`
5. **Add notification read-state actions** — Expose “mark as read” and “mark all as read” flows so unread counts reflect user intent. **Where:** `src/app/dashboard/notifications/*`, `src/app/api/notifications/route.ts`. **Recommended pattern:** hydrate a client list from the server page, then patch local state after successful POST actions while preserving keyboard focus. **Effort:** `[S]`
6. **Add payment onboarding and deposit CTAs** — Give merchants clear next steps when Stripe or deposits are not configured. **Where:** `src/app/dashboard/payments/page.tsx`, supporting billing links and capability settings surface. **Recommended pattern:** contextual callouts with direct links/actions and readiness badges sourced from business/account state. **Effort:** `[XS]`
7. **Add queue configuration controls** — Expose queue enablement and average service minutes from the dashboard. **Where:** queue page or the new capabilities workspace (`src/app/dashboard/queue/*`, new capability update route). **Recommended pattern:** lightweight settings card with numeric input, public-link utilities, and instant save confirmation. **Effort:** `[S]`
8. **Expand analytics depth** — Bring service ranking, peak hours, and actionable summaries from `merchant-analytics.ts` into the analytics UI. **Where:** `src/app/dashboard/analytics/page.tsx`, `src/lib/merchant-analytics.ts`. **Recommended pattern:** reusable summary cards and lightweight chart blocks that degrade to textual explanations for accessibility. **Effort:** `[M]`
9. **Harden admin authorization** — Replace implicit “any authenticated owner” access with an explicit platform-admin policy. **Where:** `src/app/api/admin/analytics/route.ts`, `src/lib/auth.ts`, and possibly the user model / admin allowlist strategy. **Recommended pattern:** central authorization helper returning a clear forbidden state for non-admins. **Effort:** `[M]`
10. **Create a campaign / NPS workspace** — Surface backend-only campaign segmentation, NPS, and email orchestration in a routed dashboard area. **Where:** new dashboard route(s) using `src/lib/campaign-builder.ts`, `src/lib/nps-survey.ts`, `src/lib/email*.ts`. **Recommended pattern:** guided wizard with previews, audience estimates, and empty-state education. **Effort:** `[L]`
11. **Add partnership actions to the network page** — Let merchants invite, accept, or decline partnerships from the same workspace that lists network data. **Where:** `src/app/dashboard/network/page.tsx`, `src/app/api/partnerships/route.ts`. **Recommended pattern:** action cards with status filters, invitation CTA, and success toasts. **Effort:** `[M]`
12. **Guide GDPR export and erasure flows** — Make privacy actions explicit, safe, and stateful. **Where:** `src/app/dashboard/privacy/page.tsx`, `src/app/api/gdpr/route.ts`, `src/lib/gdpr.ts`. **Recommended pattern:** confirmation steps, progress states, and visible completion/error messaging with audit-log references. **Effort:** `[M]`
13. **Add staff management editing flows** — Extend the staff dashboard from read-only reporting to creation and assignment workflows. **Where:** `src/app/dashboard/staff/page.tsx`, `src/app/api/staff/route.ts`, `src/lib/staff-mobile.ts`. **Recommended pattern:** split-view manager with member form, role picker, schedule editor, and per-member save feedback. **Effort:** `[L]`
14. **Add association and accountant invitation affordances** — Improve discoverability for partner operational roles. **Where:** `src/app/dashboard/settings/page.tsx`, `/commercialista/*`, `/association/[slug]`, related APIs. **Recommended pattern:** settings cards with invite actions, benefit copy, and role-specific landing links. **Effort:** `[M]`
15. **Surface seasonal gift-card campaigns** — Turn the backend gift-card logic into a merchant-facing seasonal revenue tool. **Where:** payments/marketplace surfaces and supporting campaign modules. **Recommended pattern:** campaign presets with one-click activation, bonus controls, and projected impact messaging. **Effort:** `[M]`

## Phase 5 — Priority Stack Rank

The following stack rank is sorted by estimated impact × severity (descending), with effort used as the tie-breaker. Items **1–6** are the most pragmatic candidates for this autonomous remediation run.

| Rank | Remediation | Severity | Impact | Effort | Why it ranks here |
| --- | --- | --- | --- | --- | --- |
| 1 | Add a capability control center | CRITICAL | Very High | S | One missing control surface currently makes several existing features appear broken or undiscoverable. |
| 2 | Restore the interactive automations workspace | CRITICAL | Very High | S | The codebase already contains most of the UI; wiring it up unlocks immediate value quickly. |
| 3 | Add merchant-side product CRUD | CRITICAL | Very High | M | Commerce is a core workflow and the current dashboard promise is stronger than the shipped experience. |
| 4 | Add order fulfillment controls | MAJOR | High | S | Merchants can see orders but cannot operationalize them, which blocks commerce follow-through. |
| 5 | Add notification read-state actions | MAJOR | High | S | The API already supports it; closing the loop improves daily usability with low implementation cost. |
| 6 | Add payment onboarding and deposit CTAs | MAJOR | High | XS | Clear next-step affordances reduce dead ends for a monetization-critical workflow. |
| 7 | Add queue configuration controls | MAJOR | High | S | Queue UX exists end-to-end, but setup friction prevents reliable activation. |
| 8 | Harden admin authorization | MAJOR | High | M | The current authorization model is weaker than the UI copy implies. |
| 9 | Expand analytics depth | MAJOR | Medium | M | High-value analytics logic is already computed but not surfaced to merchants. |
| 10 | Add partnership actions to the network page | MAJOR | Medium | M | Marketplace/network value is constrained by the lack of action-oriented controls. |
| 11 | Guide GDPR export and erasure flows | MAJOR | Medium | M | Sensitive privacy actions need better state and completion handling. |
| 12 | Create a campaign / NPS workspace | MAJOR | Medium | L | Strong backend value exists, but surfacing it requires a new routed experience. |
| 13 | Add staff management editing flows | MAJOR | Medium | L | Staff data is present, but turning reporting into workflow management is a larger build. |
| 14 | Add association and accountant invitation affordances | MINOR | Medium | M | Useful operational polish, but not as urgent as core merchant workflows. |
| 15 | Surface seasonal gift-card campaigns | MINOR | Medium | M | Revenue upside exists, but the current gap is less blocking than the operational issues above. |

### Top 5 Quick Wins

| Rank | Quick Win | Severity | Effort | Why now |
| --- | --- | --- | --- | --- |
| 1 | Restore the interactive automations workspace | CRITICAL | S | Existing client code and missing API support make this the fastest high-severity win. |
| 2 | Add a capability control center | CRITICAL | S | Consolidates runtime flags and removes multiple broken-feeling flows at once. |
| 3 | Add notification read-state actions | MAJOR | S | Supported server-side already; the UI gap is low-friction to close. |
| 4 | Add payment onboarding and deposit CTAs | MAJOR | XS | Small copy/action changes can unblock merchants immediately. |
| 5 | Add queue configuration controls | MAJOR | S | Builds directly on an otherwise functional queue experience and improves adoption. |

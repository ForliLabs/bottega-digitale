# UX Audit — Bottega Digitale

## Scope
Full product UX review across public acquisition flows, booking, customer portal, dashboard, staff, accountant, marketplace, queue, and developer surfaces.

## Critical

### 1. Dashboard navigation broke on mobile
- **Problem:** the main dashboard shell effectively disappeared on smaller screens, leaving users without reliable navigation.
- **Impact:** owners could not reach core areas from mobile, making day-to-day management frustrating.
- **Fix priority:** P0
- **Status:** fixed with a mobile dashboard header, menu, shortcuts, and better navigation states.

### 2. Staff mobile navigation pointed to dead ends
- **Problem:** staff bottom navigation and quick actions linked to missing routes or placeholder destinations.
- **Impact:** core staff flows felt broken and untrustworthy.
- **Fix priority:** P0
- **Status:** fixed by adding real staff destinations for customers, notifications, and profile, and wiring actions to working routes.

### 3. Commercialista login was a dead-end form
- **Problem:** the accountant portal exposed a login form with no working authenticated flow.
- **Impact:** a supposedly available feature was not usable.
- **Fix priority:** P0
- **Status:** fixed with a working login flow, cookie-backed session, optional invite claim on login, and protected dashboard access.

## High-impact

### 4. Public pages linked users into admin-only/dashboard-only destinations
- `/s/[slug]`
- `/passports/[passportId]`
- `/experiences`
- **Impact:** public visitors hit confusing routes that did not match intent.
- **Fix priority:** P0
- **Status:** fixed with public-safe CTAs that route to booking, shop, or contact paths.

### 5. Footer legal/contact links were missing
- **Impact:** public trust, compliance, and support discovery were weak.
- **Fix priority:** P1
- **Status:** fixed with public `privacy`, `terms`, and `contact` pages.

### 6. Register and onboarding flows overpromised completion
- **Problem:** weak validation, low feedback, and no persistence made setup feel fragile.
- **Impact:** users could progress without confidence that setup was really saved.
- **Fix priority:** P1
- **Status:** improved with validation, progress persistence, confirmation gating, and success feedback.

### 7. Dashboard onboarding cards looked actionable but were passive
- **Impact:** setup felt like a checklist instead of a guided flow.
- **Fix priority:** P1
- **Status:** fixed by adding explicit actions/links per onboarding step.

### 8. Booking flow had weak loading/error/empty states
- **Problem:** service selection, availability, and submission states were easy to misread.
- **Impact:** avoidable abandonment and duplicated attempts.
- **Fix priority:** P0
- **Status:** fixed with skeletons, inline feedback, better validation, success states, and clearer next actions.

### 9. Customer portal handled expired sessions poorly
- **Problem:** sessions silently failed and dumped users out without explanation.
- **Impact:** returning customers lost confidence in the portal.
- **Fix priority:** P1
- **Status:** fixed with explicit expired-session messaging, resend-code UX, loading states, and better OTP feedback.

### 10. Marketplace filtering and CTAs felt shallow
- **Problem:** category filtering and purchase actions were inconsistent or fake.
- **Impact:** low trust and poor conversion.
- **Fix priority:** P1
- **Status:** fixed with URL-driven filters, active states, better CTA destinations, and non-dead gift-card actions.

### 11. Sold-out shop items still encouraged ordering
- **Impact:** users tried actions that could not succeed.
- **Fix priority:** P1
- **Status:** fixed by swapping sold-out CTAs to availability/contact messaging.

### 12. Dashboard quick-action labels did not match destinations
- **Impact:** navigation felt misleading.
- **Fix priority:** P1
- **Status:** fixed.

### 13. API settings page was instructional, not operational
- **Impact:** developers had to infer actions instead of performing them.
- **Fix priority:** P1
- **Status:** fixed with interactive API key and webhook management UI.

### 14. CRM/customer zero-states were weak
- **Impact:** empty businesses saw confusing or broken-looking screens.
- **Fix priority:** P1
- **Status:** fixed on customer dashboard pages with explicit empty states and safer metrics.

### 15. Route-level loading/error/not-found handling was missing
- **Impact:** failures and transitions felt abrupt and unbranded.
- **Fix priority:** P1
- **Status:** fixed with shared loading, error, and not-found surfaces.

### 16. Media area was too API-centric
- **Problem:** media management told users to use an API rather than letting them act.
- **Impact:** non-technical operators were blocked.
- **Fix priority:** P1
- **Status:** fixed with a direct upload/delete media manager in dashboard.

## Polish

### 17. Navbar accessibility and focus behavior were weak
- **Status:** improved active state, focus, and ARIA behavior.

### 18. Directory filters were passive
- **Status:** fixed with search and category filters driven by `searchParams`.

### 19. Queue flow messaging was weak
- **Status:** fixed with skeletons, join feedback, validation, polling copy, and toast feedback.

### 20. OTP UX was awkward on mobile
- **Status:** fixed with better numeric input, resend flow, and clearer feedback.

### 21. Developers API explorer had weak async states
- **Status:** fixed with skeletons, retry handling, and better routing from the developers landing page.

## Overall verdict
Before remediation, the product had strong breadth but several credibility-breaking UX gaps where visible actions were placeholders or state handling was too thin. After remediation, the main user journeys are materially stronger, especially on mobile navigation, booking, customer access, API setup, media management, and accountant access.

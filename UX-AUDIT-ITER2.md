# UX Audit — Iteration 2

## Scope
Focused review of booking, website builder, WhatsApp AI, loyalty, queue, e-invoicing, and association portal flows.

## Critical

### 1. Booking flow kept stale state after service changes/back navigation
- **Problem:** changing service or stepping back could leave date/time/details state out of sync.
- **Impact:** wrong slots or confusing confirmations.
- **Fix priority:** P0
- **Status:** fixed with downstream state resets, clearer confirmation messaging, improved slot grid, and better accessibility feedback.

### 2. Booking confirmation overpromised WhatsApp reminders
- **Problem:** success UI implied reminders even when no phone/reminder existed.
- **Impact:** trust loss right after conversion.
- **Fix priority:** P0
- **Status:** fixed by making reminder copy conditional on actual reminder state and customer phone presence.

### 3. Invoicing dashboard was a dead-end
- **Problem:** fiscal setup and invoice generation were not operational from the UI.
- **Impact:** e-invoicing breadth without real usability.
- **Fix priority:** P0
- **Status:** fixed with fiscal-profile setup, invoice generation from completed bookings, invoice listing, and status controls.

### 4. Website builder was a static mockup
- **Problem:** owners could not really edit hero/contact/template content.
- **Impact:** credibility break in a core selling feature.
- **Fix priority:** P0
- **Status:** fixed with a working website editor, save/publish controls, preview, and persisted content fields.

## High-impact

### 5. WhatsApp AI dashboard exposed stats but no controls
- **Impact:** feature looked read-only and unfinished.
- **Fix priority:** P1
- **Status:** fixed with assistant enable/disable, personality selection, FAQ editing, and module readiness indicators.

### 6. Queue dashboard was read-only
- **Impact:** staff still had to manage the queue mentally or elsewhere.
- **Fix priority:** P1
- **Status:** fixed with call / in-service / complete / remove actions and clearer public queue link sharing.

### 7. Loyalty dashboard lacked management actions
- **Impact:** points and rewards were visible but not operable.
- **Fix priority:** P1
- **Status:** fixed with editable loyalty settings, reward-threshold configuration, redeem-from-dashboard flow, and a useful public loyalty link.

### 8. Association portal bulk import was text-only
- **Impact:** admins could not realistically onboard many businesses.
- **Fix priority:** P1
- **Status:** fixed with CSV file upload, text paste fallback, preview, import execution, and result feedback.

### 9. Public queue flow lacked an exit path
- **Impact:** customers could join but not self-cancel.
- **Fix priority:** P1
- **Status:** fixed with a public “Lascia la coda” action.

### 10. Public loyalty flow lacked sharing/contact affordances
- **Impact:** digital pass value was under-explained and hard to use.
- **Fix priority:** P1
- **Status:** fixed with sharing, contact CTA, storefront return path, and recent redemption history.

### 11. Public storefront CTA fallback was too generic
- **Impact:** users could hit weak or mismatched contact paths.
- **Fix priority:** P1
- **Status:** fixed with business-specific tel/mail behavior and safer public destinations.

## Polish

### 12. Duplicate JSON-LD on `/s/[slug]`
- **Status:** fixed.

### 13. Accountant dashboard export/referral affordances were placeholder-grade
- **Status:** improved with real download behavior and actual referral code usage.

## Overall verdict
Iteration 2 materially improved feature credibility. The biggest wins were turning previously passive areas into real operator workflows: website editing, invoice handling, WhatsApp AI controls, queue operations, loyalty actions, and association CSV onboarding.

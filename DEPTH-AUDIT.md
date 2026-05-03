# Feature Depth Audit — Bottega Digitale

## Method
Deep review of whether shipped features were truly operational versus stubbed, shallow, or solid. Classification kept in three buckets:
- 🔴 Stub / unsafe / misleading
- 🟡 Shallow / partially real
- 🟢 Solid / meaningfully implemented

## 🔴 P0 — Must fix

### 1. Accountant API trusted caller-supplied `accountantId`
- **Problem:** dashboard and detail access could be requested with an arbitrary accountant identifier.
- **Risk:** unauthorized financial data exposure.
- **Status:** fixed by moving accountant access to cookie-backed authenticated sessions and removing caller-controlled identity from read flows.

### 2. Demo fallback leaked privileged protected APIs
- **Problem:** authenticated business APIs could silently fall back to demo business context.
- **Risk:** protected data mutation/read surfaces were reachable without real auth.
- **Status:** fixed on sensitive routes by introducing and using `requireBusinessContext()`.

### 3. Password hashing used fixed-salt SHA-256
- **Risk:** weak password storage and trivial offline attack amplification.
- **Status:** fixed with per-password random-salt `scrypt` and timing-safe verification.

### 4. Deposit creation trusted client-provided amount and booking data
- **Risk:** tampering with payable amount or customer data.
- **Status:** fixed by deriving booking, customer, and amount server-side from the authoritative booking record.

### 5. Stripe webhook verification was a stub
- **Risk:** forged webhook acceptance.
- **Status:** fixed with HMAC signature validation, tolerance checks, and safer event parsing.

### 6. Public booking flow lacked serious abuse/conflict controls
- **Risk:** spam, race conditions, and invalid time-slot booking.
- **Status:** fixed with validation, future-date checks, rate limiting, business-scoped service lookup, and interval-based conflict detection.

## 🟡 P1 — Important shallow implementations

### 7. Customer OTP auth was partially real but shallow
- **Problem:** OTP generation/delivery/session cleanup were weak.
- **Status:** improved with secure randomness, phone normalization, rate limiting, stale-session cleanup, and better session-expiry UX.

### 8. WhatsApp event-bus actions marked messages as sent without transport certainty
- **Status:** improved to mark messages as `queued` when WhatsApp is not configured, but a real delivery integration is still needed.

### 9. Accountant portal UI depended on demo data and placeholder affordances
- **Status:** partially fixed with real authenticated dashboard access and actual client detail/export flow; further expansion is still possible.

### 10. Register/onboarding product depth was shallow
- **Problem:** low persistence and guidance reduced real completion confidence.
- **Status:** improved with validation, progress persistence, and stronger completion gating.

### 11. Media pipeline had a shallow UX despite a usable backend route
- **Problem:** only API instructions were exposed to users.
- **Status:** improved with a working dashboard media manager, but presigned-upload infrastructure remains placeholder-grade.

### 12. External API wrappers needed stronger failure handling
- **Status:** improved in Stripe wrappers with `res.ok` handling; remaining third-party integrations should continue following the same pattern.

## 🟡 P2 — Still shallow / not fully closed

### 13. Presigned media upload generation is still placeholder logic
- **Problem:** generated URL logic is not backed by a real cloud SDK signing flow.
- **Status:** not fully fixed.

### 14. Some owner/staff/accountant experiences still rely on seeded/demo assumptions
- **Problem:** parts of the app still prioritize showcase breadth over operational depth.
- **Status:** partially reduced, not eliminated.

### 15. Commercialista self-service registration and studio lifecycle are still incomplete
- **Problem:** login now works, but the broader onboarding/administration model is still light.
- **Status:** partially fixed.

## 🟢 Solid / good foundations

### 16. Health and operational surfaces
- Health route and operational scaffolding are meaningful.

### 17. Developer/API area
- API explorer, webhook/API key direction, and documentation surfaces are real enough to extend.

### 18. Realtime/streaming direction
- SSE/event-stream pieces provide a meaningful base.

### 19. Security helpers and validation direction
- Centralized helpers exist and were strong leverage points for hardening.

## Validation notes
- Earlier audit baseline reported `npm run test` passing and `npx tsc --noEmit` failing on `db.test.ts` generic bounds.
- The generic bound issue was fixed by updating `DbRecord` and the related test typing.
- Auth tests were also updated for salted password hashes.

## Overall verdict
The codebase had impressive feature breadth but several areas where the last 20% of real operational depth was missing. The most serious trust and security gaps have been materially reduced, but the media presign path, some demo-dependent surfaces, and the broader accountant lifecycle still need another pass to reach fully production-grade depth.

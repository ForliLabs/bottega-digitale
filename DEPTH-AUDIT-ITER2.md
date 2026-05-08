# Feature Depth Audit — Iteration 2

## Method
Focused audit on API consistency, test/build confidence, security, and performance for the newly expanded operational surfaces.

## 🔴 P0 — Must fix

### 1. Protected business APIs still risked demo fallback access
- **Problem:** sensitive routes could rely on fallback business context instead of real auth.
- **Risk:** unauthorized reads or mutations.
- **Status:** fixed by moving audited protected routes to `requireBusinessContext()` and returning explicit 401s.

### 2. Mutating APIs lacked consistent same-origin protection
- **Risk:** shallow CSRF posture on dashboard mutations.
- **Status:** fixed on the audited mutation routes with shared same-origin enforcement.

### 3. Queue, push, partnership, staff, notifications, orders, invoices, and related writes needed tenant scoping
- **Risk:** cross-tenant updates / IDOR-style mistakes.
- **Status:** fixed by scoping mutations to the authenticated business and using guarded `updateMany` patterns where appropriate.

### 4. Invoice APIs accepted weak status and fiscal-profile inputs
- **Risk:** invalid e-invoice state and broken fiscal data.
- **Status:** fixed with invoice status allowlists, fiscal profile validation, and business-scoped invoice generation.

### 5. Random identifiers/codes used weak generation in several paths
- **Risk:** predictable voucher, gift-card, and request identifiers.
- **Status:** fixed with `crypto.randomUUID()` / `randomInt()`-based generation in the audited paths.

## 🟡 P1 — Important depth fixes

### 6. Job scheduler had claim-race and fragile dedupe behavior
- **Status:** fixed with atomic claim flow and `referenceKey`-based deduplication.

### 7. Staff API had N+1 aggregation behavior
- **Status:** fixed by replacing per-staff booking aggregation with batched `groupBy` queries.

### 8. Association import API had weak request validation
- **Status:** improved with same-origin checks, required association validation, empty-CSV rejection, and standardized API responses.

### 9. API responses across audited routes were inconsistent
- **Status:** improved with shared `apiJson` / `apiError` helpers across the hardened endpoints.

### 10. Availability logic had timezone-sensitive day handling
- **Status:** fixed with local-date normalization and more robust day parsing.

## Test / validation confidence
- Baseline before changes: `npm test` passed, `npm run build` passed, `npm run lint` passed with warnings only.
- After iteration 2 changes: `npm test`, `npm run build`, and `npm run lint` all pass again.
- Prisma client was regenerated after schema updates to keep runtime types aligned.

## Overall verdict
Iteration 2 substantially reduced the gap between feature breadth and production readiness. The main progress areas were auth/tenant correctness, safer mutations, consistent API responses, scheduler robustness, stronger invoice validation, and validated build/test confidence after the changes.

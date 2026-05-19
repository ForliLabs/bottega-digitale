---
sidebar_position: 1
title: API reference
description: All 48 REST endpoints under /api, grouped by capability.
---

# API reference

All endpoints are **Next.js Route Handlers** under `src/app/api/`. The base URL is `http://localhost:3000/api` in dev or your deployed origin in production.

## Conventions

- **Format**: JSON in, JSON out. `Content-Type: application/json` is required for `POST`/`PUT`/`PATCH`.
- **Auth**: session cookie (`bd_session`) for browser flows, `Authorization: Bearer <api-key>` for server-to-server.
- **Errors**: `{"error": {"code": "RATE_LIMITED", "message": "..."}}` with the appropriate HTTP status.
- **Idempotency**: `Idempotency-Key` header is honoured on every `POST` that creates money or external state.
- **Rate limits**: 60 req/min/IP for public endpoints, 600 req/min for authenticated endpoints. Limits are returned in `X-RateLimit-*` headers.

The full machine-readable spec is served live at:

```text
GET /api/openapi
```

## Authentication

### `POST /api/auth/register`

Register a user and create their business.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "marco@barberia.it",
    "password": "tantissimaPassword",
    "name": "Marco Rossi",
    "businessName": "Barberia Da Marco",
    "businessCategory": "barbiere",
    "businessCity": "Forlì"
  }'
```

`201 Created` → `{user, business, token}`.

### `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -d '{"email": "...", "password": "..."}'
```

`200 OK` → `{token, user}`. Sets the `bd_session` cookie.

### `POST /api/auth/logout`

Invalidates the current session.

### `POST /api/customer-auth/otp`

Sends a 6-digit OTP via WhatsApp/SMS to a customer phone.

```bash
curl -X POST http://localhost:3000/api/customer-auth/otp \
  -d '{"phone": "+39 333 1234567"}'
```

### `POST /api/customer-auth/verify`

Trades an OTP for a customer session token.

## Bookings

### `GET /api/bookings`

List bookings for the active business. Query params: `from`, `to`, `status`, `staffId`, `customerId`, `page`, `pageSize`.

### `POST /api/bookings`

Create a booking from the dashboard. See [Online booking guide](../guides/online-booking).

### `GET /api/bookings/[id]`

### `PATCH /api/bookings/[id]`

Update status, time, staff or notes.

### `DELETE /api/bookings/[id]`

Cancels and emits `booking.cancelled`.

### `POST /api/booking-public`

Public booking — no auth required, the slug authorises the tenant.

### `GET /api/availability`

Compute available slots. Required: `businessSlug`, `serviceId`. Optional: `staffId`, `from`, `to`.

## Customers

### `GET /api/customers`

Paginated list. Supports `q` for fuzzy search across name, phone, email.

### `POST /api/customers`

Create a customer. Phone must be E.164 format.

### `GET /api/customers/[id]`

Includes visit history, loyalty balance, recent invoices.

### `PATCH /api/customers/[id]`

### `POST /api/customers/[id]/note`

Append a free-text note to the customer record.

## Products & orders

### `GET /api/products` / `POST /api/products`

### `GET /api/products/[id]` / `PATCH` / `DELETE`

### `GET /api/products/categories` / `POST /api/products/categories`

### `GET /api/orders` / `POST /api/orders`

### `GET /api/orders/[id]` / `PATCH`

`PATCH` accepts `status` transitions: `PENDING` → `PREPARING` → `READY` → `DELIVERED` / `CANCELLED`.

## Payments & billing

### `POST /api/payments/checkout`

Creates a Stripe Checkout Session for the active business. Returns `{url, sessionId}`.

### `POST /api/payments/intent`

Creates a `PaymentIntent` for in-page card collection.

### `POST /api/payments/refund`

Body: `{paymentId, amountCents?, reason?}`.

### `POST /api/stripe/webhook`

Stripe webhook receiver. Validates signature, routes events to `lib/payments.ts`.

### `POST /api/stripe/connect/onboard`

Starts the Express onboarding flow for the active merchant.

### `GET /api/gift-cards` / `POST /api/gift-cards`

### `POST /api/gift-cards/redeem`

## Invoicing

### `POST /api/invoices`

Issues an invoice for an order or booking. See [FatturaPA guide](../guides/fattura-pa).

### `GET /api/invoices` / `GET /api/invoices/[id]`

### `GET /api/invoices/[id]/pdf` / `GET /api/invoices/[id]/xml`

### `POST /api/invoices/[id]/void`

### `POST /api/invoices/fiscal-profile`

## Loyalty

### `GET /api/loyalty/programs` / `POST`

### `GET /api/loyalty/cards` / `GET /api/loyalty/cards/[id]`

### `POST /api/loyalty/award` / `POST /api/loyalty/redeem`

## Queue management

### `GET /api/queue` / `POST /api/queue`

### `POST /api/queue/[id]/call`

Marks an entry as "now serving". Triggers a WhatsApp notification.

### `POST /api/queue/[id]/done`

## Staff

### `GET /api/staff` / `POST /api/staff`

### `GET /api/staff/[id]/schedule` / `POST`

### `POST /api/staff/[id]/blackouts`

## Notifications

### `GET /api/notifications`

The merchant's notification inbox.

### `POST /api/notifications/test`

Sends a test notification through the configured channels.

### `POST /api/notifications/[id]/read`

## WhatsApp

### `POST /api/whatsapp/webhook`

Meta Cloud API webhook receiver. Validates `X-Hub-Signature-256`.

### `POST /api/whatsapp/send`

Sends a free-form message inside the 24-hour session window.

### `POST /api/whatsapp/templates`

Submits a template for Meta approval.

### `POST /api/whatsapp-ai/draft`

Generates an AI draft reply for an inbound message (requires `OPENAI_API_KEY`).

## AI features

### `POST /api/ai/social-post`

Multipart: `image` + `productId` + `tone`. Returns `{caption, hashtags, altText}`.

### `POST /api/ai/briefing`

Forces immediate generation of the daily briefing for the active merchant.

### `POST /api/insights/ask`

Free-form Q&A over the merchant's own data. Read-only — never mutates.

## Media

### `POST /api/media/upload`

Returns a presigned S3-compatible URL. Quota enforced per business.

### `GET /api/media` / `DELETE /api/media/[id]`

## Automation

### `GET /api/automations` / `POST /api/automations`

### `GET /api/events` (SSE)

Server-Sent Events stream of all events scoped to the active business — used by the dashboard for live updates.

## Marketplace & partnerships

### `GET /api/marketplace` / `GET /api/marketplace/[slug]`

### `POST /api/partnerships` / `GET /api/partnerships`

### `POST /api/partnerships/[id]/accept`

## Associations

### `GET /api/associations/[slug]/members`

### `POST /api/associations/[slug]/invite`

Bulk-invites businesses by partita IVA list.

## Accountant

### `GET /api/accountant/clients`

### `GET /api/accountant/clients/[id]/invoices`

### `GET /api/accountant/exports/[period]`

Returns a signed URL to a ZIP of invoices + corrispettivi for a fiscal period.

## GDPR & privacy

### `GET /api/gdpr/export`

Returns a signed download URL for the customer's full data export.

### `POST /api/gdpr/erase`

Anonymises a customer per Article 17.

### `GET /api/gdpr/audit-log`

Read-only access to the audit log; merchant scope.

## Developer API

### `POST /api/api-keys` / `GET /api/api-keys` / `DELETE /api/api-keys/[id]`

Manage API keys with scoped permissions.

### `GET /api/webhooks` / `POST /api/webhooks`

Register an outbound webhook endpoint. See [webhooks reference](./webhooks).

### `GET /api/openapi`

OpenAPI 3.1 spec served live.

## Platform admin

### `GET /api/admin/businesses`

### `POST /api/admin/businesses/[id]/suspend`

### `GET /api/admin/metrics`

Platform-wide MRR, active merchants, churn.

## Infrastructure

### `GET /api/health`

Liveness probe. Returns 200 with `{ok: true, db: 'connected', version: '...'}`.

### `POST /api/jobs`

Runs pending jobs. Protected by `CRON_SECRET`. Triggered every 15 minutes by Vercel cron.

### `GET /api/sitemap` / `GET /api/robots`

Dynamic sitemap and robots.txt.

## See also

- [Configuration reference](./configuration) for required env vars
- [Webhook reference](./webhooks) for outbound webhooks
- [CLI & scripts](./cli-and-scripts) for the npm scripts you'll run

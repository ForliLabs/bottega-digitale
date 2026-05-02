# API Reference

> All endpoints are Next.js Route Handlers under `src/app/api/`.
> Base URL: `http://localhost:3000/api` (dev) or your deployed domain.

## Table of Contents

- [Authentication](#authentication)
- [Bookings](#bookings)
- [Customers](#customers)
- [Products & Orders](#products--orders)
- [Payments & Billing](#payments--billing)
- [Invoicing](#invoicing)
- [Loyalty](#loyalty)
- [Queue Management](#queue-management)
- [Staff](#staff)
- [Notifications](#notifications)
- [WhatsApp](#whatsapp)
- [AI Features](#ai-features)
- [Media](#media)
- [Automation](#automation)
- [Marketplace & Partnerships](#marketplace--partnerships)
- [Associations](#associations)
- [Accountant](#accountant)
- [GDPR & Privacy](#gdpr--privacy)
- [Developer API](#developer-api)
- [Platform Admin](#platform-admin)
- [Infrastructure](#infrastructure)

---

## Authentication

### `POST /api/auth/register`

Register a new user and create their business.

**Request Body:**
```json
{
  "email": "marco@barberia.it",
  "password": "securepassword",
  "name": "Marco Rossi",
  "businessName": "Barberia Da Marco",
  "businessCategory": "barbiere",
  "businessCity": "Forlì",
  "businessAddress": "Via Roma 42",
  "businessPhone": "+39 0543 12345"
}
```

**Response:** `201 Created`
```json
{
  "user": { "id": "...", "email": "marco@barberia.it", "name": "Marco Rossi" },
  "business": { "id": "...", "name": "Barberia Da Marco", "slug": "barberia-da-marco" },
  "token": "session_token_hex"
}
```

### `POST /api/auth/login`

Authenticate and receive a session cookie.

**Request Body:**
```json
{
  "email": "marco@barberia.it",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "session_token_hex",
  "user": { "id": "...", "email": "marco@barberia.it", "name": "Marco Rossi" }
}
```

### `POST /api/auth/logout`

Clear the session cookie.

**Response:** `200 OK`

### `GET /api/auth/session`

Get the current authenticated user and business context.

**Response:** `200 OK`
```json
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "business": { "id": "...", "name": "...", "slug": "..." }
}
```

---

## Bookings

### `GET /api/bookings`

List bookings for the authenticated business.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 20) |

**Response:** `200 OK` — Paginated list of `BookingResponse`

### `POST /api/bookings`

Create a new booking (authenticated business owners).

**Request Body:**
```json
{
  "customerName": "Luca Bianchi",
  "customerPhone": "+39 333 1234567",
  "service": "Taglio uomo",
  "serviceId": "svc_...",
  "staffId": "staff_...",
  "startsAt": "2025-01-15T10:00:00Z",
  "durationMinutes": 30,
  "notes": "Preferisce il taglio corto",
  "channel": "dashboard"
}
```

**Response:** `201 Created` — `BookingResponse`

### `POST /api/booking-public`

Public booking endpoint (no authentication required, rate-limited).

**Request Body:** Same as `POST /api/bookings` plus `businessId`.

---

## Availability

### `GET /api/availability`

Get available time slots for a business.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `businessId` | string | Business ID |
| `daysAhead` | number | Number of days to check (default: 7) |
| `serviceDuration` | number | Service duration in minutes |

**Response:** `200 OK`
```json
[
  {
    "date": "2025-01-15",
    "dayName": "Mercoledì",
    "slots": [
      { "start": "09:00", "end": "09:30", "available": true },
      { "start": "09:30", "end": "10:00", "available": false }
    ]
  }
]
```

---

## Customers

### `GET /api/customers`

List customers for the authenticated business.

**Response:** `200 OK` — List of `CustomerResponse`

### `POST /api/customers`

Create a new customer.

**Request Body:**
```json
{
  "name": "Maria Verdi",
  "phone": "+39 333 9876543",
  "email": "maria@example.com",
  "birthday": "1990-05-15"
}
```

---

## Customer Authentication

### `POST /api/customer-auth`

Request OTP for customer self-service.

**Request Body:**
```json
{
  "businessId": "biz_...",
  "phone": "+39 333 1234567",
  "action": "request_otp"
}
```

### `GET /api/customer-auth`

Verify OTP and get customer session token.

---

## Products & Orders

### `GET /api/products`

List products for the authenticated business.

**Response:** `200 OK` — List of `ProductResponse`

### `POST /api/products`

Create a product.

**Request Body:**
```json
{
  "name": "Olio Extra Vergine 500ml",
  "description": "Olio biologico delle colline romagnole",
  "priceEuro": 12.50,
  "categoryId": "cat_...",
  "stock": 50
}
```

### `GET /api/orders`

List orders for the authenticated business.

**Response:** `200 OK` — Paginated list of `OrderResponse`

### `POST /api/orders`

Create a new order.

**Request Body:**
```json
{
  "customerName": "Paolo Neri",
  "customerPhone": "+39 333 1111222",
  "items": [
    { "productId": "prod_...", "quantity": 2 }
  ],
  "notes": "Consegna pomeriggio"
}
```

---

## Payments & Billing

### `GET /api/payments`

Get payment transactions and stats for the authenticated business.

### `POST /api/payments`

Create a payment (deposit or gift card).

**Request Body:**
```json
{
  "type": "deposit",
  "businessId": "biz_...",
  "bookingId": "book_...",
  "amountEuro": 25.00,
  "customerName": "Luca Bianchi"
}
```

### `POST /api/gift-cards`

Purchase a gift card.

**Request Body:**
```json
{
  "amountEuro": 50,
  "purchaserName": "Anna",
  "recipientName": "Marco",
  "message": "Buon compleanno!"
}
```

### `POST /api/stripe/checkout`

Create a Stripe Checkout session for subscription billing.

**Request Body:**
```json
{
  "tier": "professionale",
  "successUrl": "https://...",
  "cancelUrl": "https://..."
}
```

### `POST /api/stripe/webhook`

Stripe webhook handler (signature-verified).

---

## Invoicing

### `GET /api/invoices`

List invoices and stats for the authenticated business.

### `POST /api/invoices`

Generate an invoice from a booking.

**Request Body:**
```json
{
  "bookingId": "book_..."
}
```

**Response:** `201 Created` — Invoice ID and FatturaPA XML

---

## Loyalty

### `GET /api/loyalty`

Get loyalty cards and stats for the authenticated business.

### `POST /api/loyalty/checkin`

Award loyalty points to a customer.

**Request Body:**
```json
{
  "customerId": "cust_...",
  "points": 10
}
```

---

## Queue Management

### `GET /api/queue`

Get active queue for a business.

### `POST /api/queue`

Add a customer to the queue.

**Request Body:**
```json
{
  "businessId": "biz_...",
  "customerName": "Paolo",
  "customerId": "cust_..."
}
```

---

## Staff

### `GET /api/staff`

List staff profiles for the authenticated business.

### `POST /api/staff`

Create a staff profile.

### `PATCH /api/staff`

Update a staff profile (working hours, services, active status).

---

## Notifications

### `GET /api/notifications`

Get notification feed for the authenticated business (grouped by day).

### `POST /api/notifications`

Mark notifications as read.

**Request Body:**
```json
{
  "action": "markAllRead"
}
```

### `POST /api/push`

Register a push notification subscription (VAPID/Web Push).

### `DELETE /api/push`

Unregister a push subscription.

---

## WhatsApp

### `POST /api/whatsapp/send`

Send a WhatsApp message via the Business API.

**Request Body:**
```json
{
  "phone": "+39 333 1234567",
  "message": "La tua prenotazione è confermata!",
  "templateName": "booking_confirmation",
  "params": ["Luca", "15 Gennaio", "10:00"]
}
```

### `GET /api/whatsapp/webhook`

WhatsApp webhook verification (challenge response).

### `POST /api/whatsapp/webhook`

Inbound WhatsApp message handler.

### `GET /api/whatsapp-ai`

Get AI conversation stats.

### `POST /api/whatsapp-ai`

Process an inbound message through AI (intent detection, tool use, fallback).

---

## AI Features

### `POST /api/ai/generate-post`

Generate social media content using OpenAI.

**Request Body:**
```json
{
  "businessCategory": "barbiere",
  "businessName": "Barberia Da Marco",
  "tone": "friendly",
  "topic": "promozione estate"
}
```

### `GET /api/insights`

Get AI-generated business insights.

### `POST /api/insights`

Trigger insight generation for a business.

### `GET /api/moonshot`

Get experimental "moonshot" features (Artisan Twin, District Graph, etc.).

---

## Media

### `GET /api/media`

List media assets for the authenticated business.

### `POST /api/media`

Upload a media asset (with storage quota check).

### `DELETE /api/media`

Delete a media asset.

---

## Automation

### `GET /api/automations`

List automation flows for the authenticated business.

### `POST /api/automations`

Create a new automation flow.

**Request Body:**
```json
{
  "name": "Conferma prenotazione",
  "triggerEvent": "booking.created",
  "actions": [
    { "type": "whatsapp.send_template", "params": { "templateId": "booking_confirmation" } },
    { "type": "loyalty.award_points", "params": { "points": 10 } }
  ]
}
```

### `PATCH /api/automations`

Toggle or update an automation flow.

---

## Marketplace & Partnerships

### `GET /api/marketplace`

Search marketplace listings with filters.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `city` | string | Filter by city |
| `query` | string | Search query |

### `GET /api/partnerships`

List partnerships for the authenticated business.

### `POST /api/partnerships`

Create a partnership between two businesses.

---

## Associations

### `GET /api/associations`

List trade associations.

### `POST /api/associations`

Create an association or bulk-onboard businesses.

---

## Accountant

### `GET /api/accountant`

Get accountant dashboard and client data.

### `POST /api/accountant`

Register an accountant or claim an invite code.

---

## GDPR & Privacy

### `GET /api/gdpr`

Export customer data (Article 20 — Data Portability).

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `customerId` | string | Customer ID |
| `format` | `json` \| `csv` | Export format (default: json) |

### `DELETE /api/gdpr`

Erase customer data (Article 17 — Right to Erasure).

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `customerId` | string | Customer to erase |

---

## Developer API

### `GET /api/api-keys`

List API keys for the authenticated business.

### `POST /api/api-keys`

Create a new API key.

**Request Body:**
```json
{
  "name": "POS Integration",
  "scopes": "bookings:read,customers:read,orders:write",
  "rateLimit": 1000
}
```

**Response:** `201 Created`
```json
{
  "id": "key_...",
  "key": "bd_live_abc123...",
  "prefix": "bd_live_abc",
  "name": "POS Integration"
}
```

> ⚠️ The full key is only returned once at creation time.

### `DELETE /api/api-keys`

Revoke an API key.

### `GET /api/webhooks`

List webhook endpoints.

### `POST /api/webhooks`

Register a webhook endpoint.

**Request Body:**
```json
{
  "url": "https://your-server.com/webhook",
  "events": "booking.created,payment.received"
}
```

### `GET /api/openapi`

Get the full OpenAPI specification (auto-generated).

---

## Platform Admin

### `GET /api/admin/analytics`

Platform-wide analytics (MRR, churn, health scores).

### `GET /api/directory`

Public business directory with search.

### `GET /api/regions`

Get available regions and their configuration.

---

## Infrastructure

### `GET /api/health`

Health check endpoint.

**Query Parameters:**
| Param | Type | Description |
|---|---|---|
| `verbose` | boolean | Include memory and uptime info |

**Response:** `200 OK` / `503 Degraded`
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00Z",
  "responseTimeMs": 12,
  "version": "0.1.0",
  "environment": "production",
  "checks": {
    "database": { "ok": true, "latencyMs": 5 },
    "environment": { "ok": true, "missing": [] },
    "integrations": {
      "stripe": true,
      "whatsapp": true,
      "openai": false,
      "email": true
    }
  }
}
```

### `GET /api/jobs`

Get job scheduler stats.

### `POST /api/jobs`

Trigger job processing (called by Vercel cron every 15 minutes).

### `GET /api/events/stream`

Server-Sent Events (SSE) stream for real-time updates.

### `GET /api/sitemap`

Dynamic sitemap.xml generation.

### `GET /api/robots`

Dynamic robots.txt generation.

### `POST /api/google/sync`

Sync business data with Google Business Profile.

---

## Common Response Types

### Error Response

All errors follow a consistent format:

```json
{
  "error": "error_code",
  "message": "Human-readable description in Italian",
  "statusCode": 400,
  "requestId": "req_..."
}
```

### Pagination

Paginated endpoints return:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

## Rate Limits

| Category | Limit | Window |
|---|---|---|
| Login | 5 attempts | 15 minutes |
| Register | 3 attempts | 1 hour |
| OTP | 5 attempts | 10 minutes |
| General API | 100 requests | 1 minute |
| Booking (public) | 10 requests | 1 hour |
| API Key-based | Configurable per key | Sliding window |

Rate limit headers are included in API responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-15T10:01:00Z
```

---

## Webhook Events

When registered, webhooks deliver signed payloads for these events:

| Event | Description |
|---|---|
| `booking.created` | New booking created |
| `booking.updated` | Booking status changed |
| `booking.cancelled` | Booking cancelled |
| `payment.received` | Payment completed |
| `customer.created` | New customer added |
| `order.created` | New order placed |
| `review.received` | New review posted |

**Webhook Payload:**
```json
{
  "event": "booking.created",
  "data": { "bookingId": "...", "customerName": "..." },
  "timestamp": "2025-01-15T10:00:00Z",
  "businessId": "biz_..."
}
```

**Verification:** Verify the `X-Webhook-Signature` header using HMAC-SHA256 with your webhook secret.

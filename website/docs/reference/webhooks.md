---
sidebar_position: 3
title: Webhooks
description: Send outbound HTTP for every event in your business.
---

# Webhooks

Outbound webhooks let you receive a signed HTTP POST every time something happens in a Bottega Digitale tenant. Use them to integrate with your own ERP, accountancy software, BI tools or anything else.

## Register an endpoint

```bash
curl -X POST http://localhost:3000/api/webhooks \
  -H 'Authorization: Bearer bd_live_...' \
  -d '{
    "url": "https://my-erp.example.com/hooks/bottega",
    "events": ["booking.created", "order.paid", "invoice.issued"],
    "secret": "whsec_...",
    "active": true
  }'
```

If you do not provide a `secret`, one is generated and returned once.

## Event payload

Every webhook is sent as a `POST` with this envelope:

```json
{
  "id": "evt_01J...",
  "type": "order.paid",
  "createdAt": "2026-04-12T09:30:11Z",
  "businessId": "biz_...",
  "data": {
    "orderId": "ord_...",
    "amountCents": 4200,
    "paymentId": "pay_..."
  }
}
```

## Signature verification

We sign every payload with HMAC-SHA256 using your endpoint secret. The signature is in:

```http
Bottega-Signature: t=1712909411,v1=63d31e2f...
```

Verify on your side:

```ts
import crypto from 'node:crypto';

function verify(signatureHeader: string, rawBody: string, secret: string): boolean {
  const [tPart, v1Part] = signatureHeader.split(',');
  const t = tPart.replace('t=', '');
  const v1 = v1Part.replace('v1=', '');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex');
  // Constant-time compare and ≤5min freshness
  return (
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)) &&
    Math.abs(Date.now() / 1000 - Number(t)) < 300
  );
}
```

Always use the raw request body, not a parsed JSON re-stringification.

## Delivery semantics

- **At-least-once** delivery. Use the `id` field to de-duplicate.
- **Retries** with exponential backoff: 1m, 5m, 15m, 1h, 6h, 24h. Six attempts total.
- **Dead-lettering** after the final failure. Surfaces in `/dashboard/developers/webhooks/failures`.
- **Timeouts** — your endpoint should respond within 5 seconds with `2xx`. Any non-2xx is treated as failure.

## Subscribable events

Every event on the [event bus](../concepts/event-bus#the-full-event-catalog) can be subscribed to over webhooks. Most common:

- `booking.created`, `booking.cancelled`, `booking.completed`
- `order.placed`, `order.paid`, `order.refunded`
- `invoice.issued`, `invoice.voided`
- `customer.created`, `customer.consent.changed`, `customer.erased`
- `loyalty.points.awarded`, `loyalty.redeemed`
- `whatsapp.message.received`
- `business.created`, `business.subscription.changed`

Subscribe to `*` to receive every event (not recommended for high-volume merchants).

## Inspecting deliveries

The dashboard's **Developers → Webhooks** page shows recent deliveries with status, latency and the response body returned by your endpoint. You can re-send any single delivery from there.

```bash
GET /api/webhooks/[id]/deliveries
POST /api/webhooks/deliveries/[id]/replay
```

## Local development

Use a tunnel:

```bash
ngrok http 3000
# or
cloudflared tunnel --url http://localhost:3000
```

Then register a webhook pointing at the tunnel URL. Bottega Digitale's webhooks work the same way locally as in production.

## See also

- [Event bus](../concepts/event-bus) — the source of truth for what fires when
- [API reference — webhooks](./api#developer-api)

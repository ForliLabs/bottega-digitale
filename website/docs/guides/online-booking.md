---
sidebar_position: 1
title: Online booking
description: Configure services, staff availability and the public booking widget.
---

# Online booking

This guide takes a business from "no bookings" to "live booking widget on a custom domain" in five steps.

## 1. Define your services

From the dashboard go to **Catalog → Services** or call the API:

```bash
curl -X POST http://localhost:3000/api/services \
  -H 'Content-Type: application/json' \
  -H 'Cookie: bd_session=...' \
  -d '{
    "name": "Taglio + Barba",
    "durationMinutes": 45,
    "priceCents": 2500,
    "bufferAfterMinutes": 10,
    "depositCents": 0,
    "requiresStaff": true
  }'
```

Each service has a duration, optional buffer (cleanup time) and an optional deposit. The deposit, if non-zero, is collected via Stripe before the slot is held.

## 2. Set staff working hours

Working hours live on `StaffSchedule`, which is the per-day availability for each staff user.

```bash
curl -X POST http://localhost:3000/api/staff/staff_marco/schedule \
  -H 'Content-Type: application/json' \
  -d '{
    "weekday": "MON",
    "blocks": [
      {"start": "09:00", "end": "13:00"},
      {"start": "15:00", "end": "19:30"}
    ]
  }'
```

Repeat for each weekday. Special closures (holidays, off-days) go on `Blackout`:

```bash
curl -X POST http://localhost:3000/api/staff/staff_marco/blackouts \
  -d '{"startsAt": "2026-08-10T00:00:00Z", "endsAt": "2026-08-25T23:59:59Z", "reason": "Ferie agosto"}'
```

## 3. Test availability

Availability is computed live in `lib/availability.ts`. Probe it directly:

```bash
curl "http://localhost:3000/api/availability?\
businessSlug=barberia-da-marco&\
serviceId=svc_taglio_barba&\
staffId=staff_marco&\
from=2026-04-12&to=2026-04-19"
```

Response:

```json
{
  "slots": [
    {"start": "2026-04-12T09:00:00+02:00", "staffId": "staff_marco"},
    {"start": "2026-04-12T09:55:00+02:00", "staffId": "staff_marco"}
  ]
}
```

Slots respect: working hours, existing bookings, buffer time, queue entries, blackouts, and the merchant's timezone (`Business.timezone`).

## 4. Embed the widget

The hosted widget lives at `https://<your-domain>/book/<slug>`. To embed it on an external site, drop in this iframe:

```html
<iframe
  src="https://bottegadigitale.it/book/barberia-da-marco?embed=1"
  width="100%"
  height="780"
  style="border:0;border-radius:12px"
  loading="lazy"
></iframe>
```

The `embed=1` query strips the header/footer chrome.

## 5. Send confirmations over WhatsApp (optional)

If `WHATSAPP_TOKEN` is set, confirmations and reminders go out automatically. The merchant configures templates from **Settings → Notifications**:

| Trigger | Default template |
| --- | --- |
| `booking.created` | `bd_confirmation_it` |
| `booking.reminder` (T-24h) | `bd_reminder_it` |
| `booking.cancelled` | `bd_cancellation_it` |

See the [WhatsApp automation guide](./whatsapp-automation) for template approval and language fallbacks.

## Common configurations

### Round-robin staff assignment

When a customer doesn't pick a specific staff member, the widget shows slots for any staff who can perform the service. The least-loaded staff for that day is selected at booking time (`lib/availability.ts → assignStaff()`).

### Deposit-only services

Set `depositCents` to a non-zero value. The customer is redirected to Stripe Checkout; the slot is held for 15 minutes and confirmed once Stripe webhook fires `checkout.session.completed`.

### Group classes (1 slot, many customers)

Set `Service.capacity` > 1. The slot remains bookable until `capacity` customers have signed up.

## Troubleshooting

- **Slots not appearing?** Run `npm run dev` with `DEBUG=bd:availability` to see the slot computation.
- **Wrong timezone?** Update `Business.timezone` to a valid IANA zone (e.g. `Europe/Rome`).
- **Double-booking under load?** The `assertSlotAvailable()` helper uses a row-level lock; see `lib/availability.ts`.

## See also

- [WhatsApp automation](./whatsapp-automation)
- [Payments with Stripe](./payments-stripe)
- [API reference — bookings](../reference/api#bookings)

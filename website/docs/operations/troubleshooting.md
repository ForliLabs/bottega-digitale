---
sidebar_position: 3
title: Troubleshooting
description: Symptoms, causes and fixes for the most common problems.
---

# Troubleshooting

## The dev server won't start

### `Error: Cannot find module '.prisma/client'`

You skipped `prisma generate` and Next.js can't find the generated client.

```bash
npx prisma generate
npm run dev
```

### `EADDRINUSE: address already in use :::3000`

Another process is on port 3000.

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill <PID>
# or
PORT=3001 npm run dev
```

## The database is broken

### `SqliteError: no such table: Business`

The schema was never pushed.

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### `Unique constraint failed on the fields: (slug)`

You ran the seed twice, or you tried to create a business whose slug already exists. The seed is idempotent for the demo set, but custom data can collide. Either:

- Use a different slug, or
- Wipe and re-seed:
  ```bash
  rm prisma/dev.db
  npx prisma db push
  npx tsx prisma/seed.ts
  ```

## Bookings show "no availability"

Most common causes:

1. **No staff schedule.** Set working hours for at least one staff member — see [Online booking](../guides/online-booking#2-set-staff-working-hours).
2. **Service requires staff but none is assigned.** Set `Service.requiresStaff = false` for self-service options.
3. **Timezone mismatch.** `Business.timezone` must be a valid IANA zone (`Europe/Rome`).

Enable debug logging:

```bash
DEBUG=bd:availability npm run dev
```

## WhatsApp messages aren't sending

### Webhook signature failure

Your `WHATSAPP_VERIFY_TOKEN` in `.env` doesn't match what you entered in the Meta console.

### Template not approved

Free-form messages are only allowed inside the 24-hour session window. For first-contact messages, the template must be approved by Meta.

### Phone number not E.164

Phones must be stored as `+393331234567` (with `+`, no spaces). The booking widget normalises on submit; programmatic creators must format manually.

## Stripe payments fail silently

### Webhook signature is wrong

Stripe sends from multiple regional IPs; behind a proxy you may receive a re-stringified body. Always use the **raw** body when verifying:

```ts
const body = await req.text();    // not req.json()
stripe.webhooks.constructEvent(body, signature, env.STRIPE_WEBHOOK_SECRET);
```

### Test mode keys in production

Make sure you swapped to `sk_live_…` and `pk_live_…` keys before going live. Test webhook IDs and live webhook IDs are different — re-create the endpoint.

## Invoices fail SDI submission

### Error TR202 — Numero IVA destinatario non valido

The customer's `partitaIva` is malformed. The validator in `lib/e-invoice.ts → validateClient()` runs locally — re-run it and fix the customer.

### Error 0301 — Numerazione documento non sequenziale

Numbering was edited manually. Restore monotonic ordering — see `prisma/scripts/repair-invoice-sequence.ts`.

## Tests fail locally but pass in CI

Most likely: leftover state from a previous run.

```bash
rm -rf .next coverage prisma/test-*.db
npm test
```

## Production stack overflowing memory

Likely culprit: image processing on the upload endpoint when `MEDIA_STORAGE_*` is unset. The fallback writes to `/public/uploads/` which is fine for dev but unsuitable in production. Configure S3-compatible storage — see [Configuration](../reference/configuration#media-storage).

## My question isn't here

- Search the [GitHub issues](https://github.com/ForliLabs/bottega-digitale/issues).
- Open a [Discussion](https://github.com/ForliLabs/bottega-digitale/discussions).
- Read the [FAQ](./faq).

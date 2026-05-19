---
sidebar_position: 2
title: Configuration
description: Every environment variable, what it unlocks and what happens when it's missing.
---

# Configuration

Bottega Digitale is configured entirely through environment variables. Copy `.env.example` to `.env` and edit. **Every integration degrades gracefully** when its variables are absent — local development needs nothing.

## Database

| Variable | Default | Notes |
| --- | --- | --- |
| `DATABASE_URL` | `file:prisma/dev.db` | Local SQLite. Used by the Prisma client. |
| `TURSO_DATABASE_URL` | _(empty)_ | Production Turso LibSQL URL — `libsql://...turso.io` |
| `TURSO_AUTH_TOKEN` | _(empty)_ | Turso JWT |

When `TURSO_*` are set, the Prisma client switches to the LibSQL adapter and `DATABASE_URL` is ignored.

## Application

| Variable | Default | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_URL` | `http://localhost:3000` | Public origin; used in links and OG cards |
| `SESSION_SECRET` | _(generated)_ | 32-byte hex; rotates invalidate all sessions |
| `CRON_SECRET` | _(generated)_ | Required by `/api/jobs` |
| `WEBHOOK_SIGNING_SECRET` | _(generated)_ | Used to sign outbound webhooks |

In production, generate strong values:

```bash
openssl rand -hex 32
```

## Payments — Stripe

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | All payments | Payments stub to `DEV` mode |
| `STRIPE_WEBHOOK_SECRET` | Receiving webhooks | `/api/stripe/webhook` returns 503 |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client SDK | In-page Stripe Elements disabled |
| `STRIPE_PLATFORM_FEE_BPS` | Application fees | 0 — no platform fee |

## WhatsApp

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `WHATSAPP_TOKEN` | Sending | Messages logged to stdout |
| `WHATSAPP_PHONE_NUMBER_ID` | Sending | Same |
| `WHATSAPP_VERIFY_TOKEN` | Webhook verification | Webhook handler returns 403 |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Template management | Template UI hidden |

## Email — Resend

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `RESEND_API_KEY` | Sending email | Emails logged to stdout |
| `EMAIL_FROM` | Sending email | Falls back to `noreply@bottegadigitale.it` |

## AI — OpenAI

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `OPENAI_API_KEY` | All AI features | AI buttons hidden in the UI |
| `OPENAI_MODEL_FAST` | Reply drafts | Defaults to `gpt-4o-mini` |
| `OPENAI_MODEL_BRIEFING` | Daily briefing | Defaults to `gpt-4o` |
| `OPENAI_MONTHLY_BUDGET_CENTS` | Cost cap per merchant | No cap |

## Google

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | OAuth login + Business Profile sync | Feature hidden |
| `GOOGLE_CLIENT_SECRET` | Same | Same |
| `GOOGLE_REDIRECT_URI` | OAuth callback | Defaults to `<NEXT_PUBLIC_URL>/api/google/callback` |

## Push notifications

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `VAPID_PUBLIC_KEY` | Web push | Push channel disabled |
| `VAPID_PRIVATE_KEY` | Web push | Same |
| `VAPID_SUBJECT` | Web push | Defaults to `mailto:admin@bottegadigitale.it` |

Generate VAPID keys once:

```bash
npx web-push generate-vapid-keys
```

## Media storage

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `MEDIA_STORAGE_ENDPOINT` | Production media | Falls back to `/public/uploads/` (dev only) |
| `MEDIA_STORAGE_KEY` | Same | Same |
| `MEDIA_STORAGE_SECRET` | Same | Same |
| `MEDIA_STORAGE_BUCKET` | Same | Defaults to `bottega-media` |
| `MEDIA_CDN_URL` | Public asset URLs | Falls back to storage endpoint |

Any S3-compatible provider works (Backblaze B2, Cloudflare R2, MinIO, Wasabi).

## E-invoicing intermediaries

| Variable | Required for | Effect when missing |
| --- | --- | --- |
| `FATTURE_IN_CLOUD_TOKEN` | SDI submission via Fatture in Cloud | Invoices marked `PENDING_SUBMIT` |
| `ARUBA_PEC_USERNAME` | Direct SDI via PEC | Same |
| `ARUBA_PEC_PASSWORD` | Same | Same |

A merchant chooses one provider in **Settings → Fatturazione**.

## Per-business configuration

A few settings live on the `Business` row, not in env:

| Field | Default | Purpose |
| --- | --- | --- |
| `timezone` | `Europe/Rome` | Display timezone — IANA |
| `locale` | `it` | UI language for staff dashboard |
| `customerLocale` | `it` | Default customer language |
| `currency` | `EUR` | Display currency |
| `customDomain` | _null_ | Optional custom domain |
| `einvoiceProvider` | `MANUAL` | One of `MANUAL`, `FATTURE_IN_CLOUD`, `ARUBA`, `DIRECT_SDI` |

## Accountant portal

Each `Business` may have a `commercialistaId` pointing to a `User` with role `COMMERCIALISTA`. That user gets read-only access to the assigned businesses' invoices through `/commercialista/...`.

## Verifying the configuration

Run:

```bash
npx tsx scripts/check-env.ts
```

This prints a table of every integration, whether it's configured, and what would happen in production with the current `.env`.

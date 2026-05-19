---
sidebar_position: 2
title: Quickstart
description: Run Bottega Digitale on your machine in under five minutes.
---

# Quickstart

By the end of this page you will have Bottega Digitale running on `http://localhost:3000`, seeded with three demo businesses, ready to accept a booking.

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | ≥ 20 | Check with `node --version` |
| npm | ≥ 9 | Ships with Node 20 |
| Git | any | To clone the repo |

No database server, no Docker, no API keys are required for local development.

## 1. Clone and install

```bash
git clone https://github.com/ForliLabs/bottega-digitale.git
cd bottega-digitale
npm install
```

The install is self-contained — Prisma will download the LibSQL adapter and Next.js will set up Turbopack on first run.

## 2. Configure the environment

```bash
cp .env.example .env
```

The defaults point at a local SQLite file and leave every external integration empty. That is fine: every integration **degrades gracefully** when its keys are missing — you get an in-memory queue instead of WhatsApp, console logs instead of emails, and Stripe payments are stubbed.

See the [environment reference](../reference/configuration) for the full list.

## 3. Initialise the database

```bash
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts
```

The seed script writes three demo businesses into `prisma/dev.db`:

| Business | Type | Demo data |
| --- | --- | --- |
| 🪒 Barberia Da Marco | Barbershop | 6 services, 50 customers, 200 bookings, 15 reviews, 20 loyalty cards |
| 🍝 Trattoria Nonna Rosa | Restaurant | 12 products, 80 orders, 8 reviews |
| 🌻 Fiorista Girasole | Florist | 8 products, 30 orders |

## 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the marketing landing page. Sign in with one of the seeded merchant accounts (printed by the seed script) or register a new business.

```text
✓ Compiled / in 1.2s
- Local:        http://localhost:3000
- Network:      http://192.168.1.42:3000
```

## 5. Verify the install

Run the test suite to make sure your environment is healthy:

```bash
npm test
```

You should see **~780 tests pass** in under a minute. If any tests fail, jump to [Troubleshooting](../operations/troubleshooting).

## What's next?

- **Take your first booking** → [First booking walkthrough](./first-booking).
- **Understand the architecture** → [Core concepts](../concepts/overview).
- **Wire up a real integration** → [Stripe](../guides/payments-stripe), [WhatsApp](../guides/whatsapp-automation), [FatturaPA](../guides/fattura-pa).

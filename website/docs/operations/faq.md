---
sidebar_position: 4
title: FAQ
description: Frequently asked questions about Bottega Digitale.
---

# FAQ

## Product

### Is Bottega Digitale free?

The **self-hosted** version is free — you host it, you own it. The **hosted** offering is freemium: a *Vetrina* tier at €0/month, paid tiers from €29/month. See the pricing page on the marketing site.

### What language is the platform in?

UI in Italian and English. Customer-facing widgets respect the customer's `Accept-Language` (defaults to Italian). The developer surfaces (dashboard, API errors) are bilingual.

### Can I use it outside Italy?

Yes for everything except FatturaPA — which is Italy-specific. Outside Italy you'd disable the e-invoicing module and use plain receipts. Currency formatting and date locales work for any locale.

### Is there a mobile app?

Not a native app. The dashboard and staff surfaces are a **PWA** — `Add to home screen` from Safari or Chrome and it behaves like an app.

### Can customers pay each other?

No. Bottega Digitale is **B2C** for the merchant. Stripe Connect routes money customer → merchant; the platform never holds funds.

## Tech

### Why Next.js and not a separate API + SPA?

For a solo founder or small team operating multi-tenant Italian SME software, a monolith wins on every axis except "vendor lock-in" — and Next.js is portable. App Router gives us route co-location for the dashboard and route handlers for the API in one repo.

### Why SQLite in production?

Two reasons. (1) **Operational simplicity** — Turso gives us a managed LibSQL with edge replicas, no DBA needed. (2) **Latency** — for an Italian merchant in Forlì served from `cdg1`, reads land in single-digit milliseconds. We benchmark monthly; when Turso isn't enough we'll move to Postgres without rewriting any domain code (Prisma adapter swap).

### Can I swap Prisma for Drizzle/Kysely?

You can, but it's a multi-week project. Prisma is the spine — schema-as-code, migrations, type generation. The domain modules talk to the `PrismaClient` directly. Drizzle would require rewriting the `scoped()` helper and re-generating types.

### Is the codebase actually production-grade?

Yes: 780 tests, 60% coverage threshold on the domain layer, multi-tenancy regression tests, signed webhooks, rate-limited endpoints, GDPR audit logs, CSRF middleware. See `docs/ARCHITECTURE.md` in the repo for the deep dive.

### Why no microservices?

We tried. The honest answer: at our scale (≤ 500 merchants per instance) the operational cost of microservices exceeds the benefit. The event bus gives us decoupling without the YAML.

## Business

### How do I distribute this to real merchants?

Through trusted intermediaries. Italian SMEs adopt software via their **commercialista**, their **trade association** (CNA, Confartigianato, Confcommercio), or word-of-mouth. Cold sales rarely work. The platform has an association portal precisely for this — see the [association portal](../reference/configuration#per-business-configuration).

### Can I white-label it?

Yes. The marketing site is in `src/app/(marketing)/`, the logo and primary colour live in `tailwind.config.ts` and `Business.brandPalette`. Replace and rebuild.

### Is there a hosted "demo" I can show customers?

Not yet — the demo is the seed data on your local machine. Spin up the quickstart, click around, then deploy to Vercel with the same seed for your prospects.

## Compliance

### Are you GDPR compliant?

Yes — see the [GDPR guide](../guides/gdpr). But "GDPR compliance" is not just a feature: it requires your DPA with subprocessors, your privacy notice, and a DPO if you process at scale. The platform gives you the technical primitives; the policy work is yours.

### What about Garante e-cookie?

The customer-facing widget uses only **technical cookies** (session + CSRF), which do not require consent. Analytics on the marketing site uses Plausible (cookieless). Merchant-side cookies are first-party only.

### What about the 10-year fiscal retention requirement?

`Invoice`, `Payment` and `Corrispettivo` rows are never hard-deleted. GDPR erasure anonymises customer PII but preserves the rows — see [GDPR](../guides/gdpr#article-17--erasure).

## Roadmap

### Will you add `<feature>`?

Probably! Check the [roadmap](./roadmap) and the [GitHub Discussions](https://github.com/ForliLabs/bottega-digitale/discussions). The shortest path to a feature being prioritised is a real merchant asking for it.

### How often do you release?

Continuously to `main`. The hosted product follows the main branch with a 24-hour soak. Self-hosters can pin a release tag — see the [changelog](./changelog).

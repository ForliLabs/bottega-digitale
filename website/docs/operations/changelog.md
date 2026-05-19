---
sidebar_position: 8
title: Changelog
description: Notable changes to Bottega Digitale.
---

# Changelog

This page summarises notable changes. The authoritative log is the repository's `CHANGELOG.md` and the [GitHub Releases](https://github.com/ForliLabs/bottega-digitale/releases) page.

We follow date-based versioning for hosted releases (`2026.04`, `2026.04.1`) and SemVer for the public TypeScript SDK.

## 2026.04 — current

### Added
- **Trade association portal** with bulk invite by partita IVA.
- **Daily briefing** delivered via WhatsApp / push.
- **Marketplace** for cross-business partnerships and vouchers.
- **Customer self-service** at `/c/[code]` with OTP login.
- **JSON-LD** structured data on every storefront page.
- **Italian holidays calendar** affecting availability.

### Changed
- Bookings now support **per-service buffer time** independent of duration.
- Stripe Connect onboarding uses Express accounts (was Standard).
- WhatsApp templates now versioned per locale.

### Fixed
- Timezone bug when merchant's `Business.timezone` was unset.
- Duplicate `loyalty.points.awarded` event on rapid checkouts.
- Wrong IVA code on intra-EU customers with no codice fiscale.

## 2026.03

### Added
- **AI reply drafts** for inbound WhatsApp messages.
- **Accountant portal** with read-only invoice access per assigned merchant.
- **Webhook deliveries** dashboard with replay.

### Changed
- Migrated from Prisma 6 to **Prisma 7** with LibSQL adapter.
- Switched the default model for daily briefings to `gpt-4o`.

## 2026.02

### Added
- **FatturaPA XML 1.2.2** generation with regimes RF01 and RF19.
- **Walk-in queue** with QR-code checkin.
- **GDPR Article 17** erasure with audit log.
- **Stripe Connect** initial support.

## 2026.01 — first public release

The initial public release. Bookings, customers, products, orders, basic invoicing, WhatsApp template sending, multi-tenant dashboard, demo seed.

## Upgrade notes

### Upgrading from 2026.03 → 2026.04

Run database migrations:

```bash
git pull
npm install
npx prisma db push
```

New environment variables (all optional):

```bash
ASSOCIATION_PORTAL_ENABLED="true"
GOOGLE_PLACES_API_KEY=""    # for the marketplace map
```

### Upgrading from 2026.02 → 2026.03

This release changes Prisma from 6 to 7. Re-generate the client and review your custom queries (any direct use of `prisma.X.findMany` outside `scoped()` should be flagged by lint).

```bash
npx prisma generate
npm run lint
```

If you wrote custom raw SQL using `$queryRaw`, double-check the new adapter's quoting rules.

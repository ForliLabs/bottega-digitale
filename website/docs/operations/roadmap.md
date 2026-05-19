---
sidebar_position: 7
title: Roadmap
description: What we're building next and how to influence it.
---

# Roadmap

Bottega Digitale is built by an open team for real merchants. The roadmap reflects what we've heard from artisans, accountants and trade associations in Romagna. It's a guide, not a contract — issues and discussions can reorder it.

:::tip Want to vote on something?
Drop a 👍 on the matching GitHub Discussion. Items with the most reactions move up.
:::

## Now — currently shipping

| Item | Status |
| --- | --- |
| Group-class bookings (capacity > 1) | 🟢 In review |
| Gift card PDF generation | 🟢 In review |
| Italian holidays calendar | 🟢 Shipped to `main` |
| Daily briefing v2 (richer context) | 🟡 In progress |
| Marketplace cross-promotions | 🟡 In progress |

## Next — Q3 2026

| Item | Why |
| --- | --- |
| **SDI direct submission** | Reduce reliance on intermediaries — €0/mo per merchant savings |
| **POS hardware integration** | Cash drawer + receipt printer for shops with foot traffic |
| **Inventory tracking** | Multi-location stock, low-stock alerts |
| **Multi-staff calendar view** | Currently single-staff per day; merchants want a week-overview |
| **Customer reviews collection** | First-party reviews to reduce dependence on Google |

## Later — H2 2026

| Item | Why |
| --- | --- |
| Membership subscriptions | Recurring monthly fees for gyms, classes, beauty memberships |
| Multi-language (FR, ES) | Other Southern European SME markets |
| Web push v2 with rich actions | Faster than WhatsApp for inbound staff alerts |
| Native iOS/Android app | Currently PWA-only; some staff want a real app |
| AI advisor v2 — proactive | Surface anomalies (e.g. "Tuesday afternoons are unusually empty") |
| Partita IVA real-time validation via Agenzia delle Entrate | Reduce SDI rejections |

## Considering — open for discussion

| Item | Status |
| --- | --- |
| Crypto payments | 🤔 Probably not — too little merchant demand |
| Embedded e-commerce SDK | 🤔 Open question — would require a real JS SDK |
| Marketplace billing (we collect, then payout) | 🚫 No — Stripe Connect direct is the right model |
| Federation of associations across the EU | 💭 Long-term — needs partnership |

## What's *not* on the roadmap

Some things look obvious but we've chosen not to build:

- A **drag-and-drop website builder**. Templates are faster and beat builders for non-tech users.
- A **separate POS app**. The staff PWA already does the job for most segments.
- A **proprietary e-invoicing intermediary**. The market is mature; integrate, don't replicate.

## Versioning

We use date-based versioning (`2026.04` etc.) for hosted releases and semantic versioning for the npm SDK. The platform has no breaking API changes without a minimum 6-month deprecation window.

## See also

- [Changelog](./changelog) — what already shipped
- [Contributing](./contributing) — how to ship a roadmap item yourself

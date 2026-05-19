---
sidebar_position: 1
title: Introduction
description: What Bottega Digitale is, who it's for, and why it exists.
slug: /
---

# Bottega Digitale

> **Il bancone digitale per ogni bottega italiana.**
> The digital shop counter for every artisan, shop and micro-business in Italy.

Bottega Digitale is an **open, full-stack platform** that bundles the software an Italian SME needs to operate online into a single Next.js app:

- 📅 online booking and walk-in queue
- 👥 a customer book (CRM) with loyalty cards
- 💳 payments via Stripe Connect
- 🧾 **FatturaPA** electronic invoicing
- 📱 WhatsApp Business messaging and automation
- 🏪 a public storefront and product catalog
- 🤖 AI helpers for content and replies
- 🏛️ multi-tenant portals for trade associations and accountants

Everything is in one repository, written in TypeScript, and runs locally with **zero API keys**.

## Who this is for

| You are… | Bottega Digitale gives you… |
| --- | --- |
| A **solo founder** building a vertical SaaS for Italian SMEs | A production-ready monolith you can fork and ship in a week. |
| A **dev team** evaluating SME platforms | A reference implementation of multi-tenant Italian commerce, with 780+ tests. |
| A **trade association** (CNA, Confartigianato, Confcommercio) | A white-label portal for onboarding members in bulk. |
| A **commercialista** | An accountant dashboard with invoice exports for every client. |
| A **micro-business owner** | A self-hosted, in-Italian alternative to Wix + Treatwell + Fatture in Cloud. |

## How the docs are organised

These docs follow the same structure regardless of who you are:

1. **[Getting started](./getting-started/quickstart)** — install and run the app, take your first booking.
2. **[Core concepts](./concepts/overview)** — the mental model: data, events, multi-tenancy.
3. **[Guides](./guides/online-booking)** — task-shaped recipes for the most common features.
4. **[Reference](./reference/api)** — full API, configuration and webhook reference.
5. **[Operations](./operations/deployment)** — deploy, test, troubleshoot, contribute.

## Where to go next

- **In a hurry?** Jump to the [Quickstart](./getting-started/quickstart).
- **Want the big picture?** Read [Why Bottega Digitale](./concepts/why).
- **Comparing options?** See [Bottega Digitale vs. alternatives](./concepts/comparison).

:::tip Source available
Bottega Digitale lives at [github.com/ForliLabs/bottega-digitale](https://github.com/ForliLabs/bottega-digitale).
The source is publicly available; a final OSS license is being selected — see the [contributing guide](./operations/contributing).
:::

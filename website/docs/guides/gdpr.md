---
sidebar_position: 8
title: GDPR & data rights
description: Article 17 erasure, Article 20 portability, consent management and audit logs.
---

# GDPR & data rights

GDPR isn't a feature, it's a floor. Bottega Digitale implements the user-facing data rights end-to-end.

## What's implemented

| Right | Article | Where |
| --- | --- | --- |
| Information | Art. 13–14 | Auto-generated privacy notice per business |
| Access | Art. 15 | Self-service via `/c/<code>/privacy` |
| Rectification | Art. 16 | Customer can edit profile fields |
| **Erasure** | Art. 17 | Self-service + commercialista override |
| Restriction | Art. 18 | Marks customer as "do not process" |
| **Portability** | Art. 20 | JSON or CSV export of all PII |
| Object | Art. 21 | Per-channel consent toggles |
| Consent withdrawal | Art. 7(3) | One-click in every WhatsApp/email |

All of the above produce a `GdprAuditLog` row that retains for 10 years.

## Consent at creation

Every customer-creating endpoint (`/api/booking-public`, `/api/customer-auth/signup`) requires explicit consent:

```json
{
  "customer": {
    "name": "...",
    "gdprConsent": true,
    "marketingConsent": false,
    "consentText": "Accetto l'informativa privacy v3 del 2026-04-01"
  }
}
```

The exact consent text and version are persisted on `CustomerConsent`, so you can prove what the user agreed to.

## Article 20 — portability

From the customer portal:

```bash
GET /api/gdpr/export?customerId=cus_...&format=json
```

Returns a single JSON document with every row that references the customer: bookings, orders, invoices, loyalty transactions, messages, notes. The download is signed and expires after 24 hours.

CSV variant for human consumption is available with `format=csv` (one zip with one CSV per table).

## Article 17 — erasure

```bash
POST /api/gdpr/erase
{"customerId": "cus_..."}
```

`lib/gdpr.ts → eraseCustomer()`:

1. **Anonymises** PII columns: `name → "Cliente cancellato"`, `phone → "+390000000000"`, `email → "erased+<hash>@bottega"`.
2. **Removes** free-text fields (`notes`, `description`).
3. **Preserves** fiscal records (`Invoice`, `Payment`) — required by Art. 2220 c.c. for 10 years.
4. **Writes** a `GdprAuditLog` entry with the actor, the timestamp and the affected row IDs.
5. **Fires** `customer.erased` so subscribers (loyalty, notifications, marketplace) can purge their own derived state.

The function is **idempotent**: calling it twice does nothing the second time.

## Audit log

Every privacy-sensitive action lands in `GdprAuditLog`:

| Action | Actor | Subject |
| --- | --- | --- |
| `EXPORT` | customer (self) or merchant | the customer |
| `ERASE` | customer or merchant | the customer |
| `CONSENT_CHANGE` | customer | the customer |
| `DATA_BREACH_NOTIFIED` | platform admin | affected customers |
| `DPA_SIGNED` | merchant | the business |

The log is append-only — even platform admins cannot delete entries.

## Data Processing Agreement (DPA)

Each merchant signs a DPA with the platform on first login. Pre-rendered template lives in `src/messages/it/dpa.md` and is presented in the merchant onboarding flow. The signed PDF is stored as a `Document` row.

## Commercialista access

Accountants get a **read-only** view of their assigned merchants' fiscal data via the commercialista portal. They cannot see customer PII unless explicitly granted. See [Accountant portal](../reference/configuration#accountant-portal).

## Data residency

By default, Bottega Digitale runs on Vercel `cdg1` (Paris) and Turso EU regions. The Docker image runs anywhere — you choose. Stripe data stays in Stripe's EU jurisdiction. OpenAI calls are billed via OpenAI Ireland.

## Breach notification (Art. 33)

If a data breach is detected (e.g. by a platform admin or anomalous webhook signature failures), the admin triggers:

```bash
POST /api/admin/incidents/notify
```

This:

- Drafts the 72-hour notification to the Garante via the official template.
- Notifies every affected merchant with the standard disclosure script.
- Writes `DATA_BREACH_NOTIFIED` for each affected customer.

## See also

- [Configuration](../reference/configuration) — privacy-related env vars
- [API reference — GDPR](../reference/api#gdpr--privacy)

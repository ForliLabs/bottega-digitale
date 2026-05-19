---
sidebar_position: 4
title: FatturaPA & e-invoicing
description: Italian electronic invoicing — IVA, codice fiscale, SDI submission.
---

# FatturaPA & e-invoicing

Italian law requires every B2B and B2C transaction (above thresholds) to be issued as an **electronic invoice** in the FatturaPA XML format, submitted via the **SDI** (Sistema di Interscambio). Bottega Digitale ships this natively.

:::warning This is a fiscal feature
The FatturaPA implementation is correct for common cases (sales of goods, services, IVA at 4/10/22%, codice fiscale, partita IVA). Edge cases — split-payment, reverse-charge intra-EU, autofatture — require validation by your commercialista before going live.
:::

## What you get

- ✅ FatturaPA XML 1.2.2 generation
- ✅ IVA rates: standard 22%, reduced 10%, super-reduced 4%, exempt
- ✅ Codice fiscale and partita IVA on every invoice
- ✅ SDI submission via your chosen intermediary (Aruba, Fatture in Cloud, etc.) or direct via a registered channel
- ✅ Sequential numbering per business per fiscal year
- ✅ 10-year retention (`Invoice` rows are never hard-deleted)
- ✅ PDF copy generated for the customer

## 1. Configure the fiscal profile

Each merchant has exactly one active `FiscalProfile` per fiscal year:

```bash
curl -X POST http://localhost:3000/api/invoices/fiscal-profile \
  -H 'Content-Type: application/json' \
  -d '{
    "ragioneSociale": "Barberia Da Marco SAS",
    "partitaIva": "IT01234567890",
    "codiceFiscale": "RSSMRC80A01H294X",
    "regimeFiscale": "RF01",
    "indirizzo": "Via Roma 42",
    "cap": "47121",
    "comune": "Forlì",
    "provincia": "FC",
    "nazione": "IT",
    "sdiCodice": "0000000",
    "pec": "barberiadamarco@pec.it"
  }'
```

`regimeFiscale` follows the standard codes (`RF01` ordinario, `RF19` forfettario, etc.).

## 2. Issue an invoice

The simplest way is from a paid order or completed booking:

```ts
import {issueInvoice} from '@/lib/e-invoice';

const invoice = await issueInvoice({
  businessId,
  orderId: order.id,            // or bookingId
  customer: {
    name: 'Luca Bianchi',
    codiceFiscale: 'BNCLCU85M01H294K',
    address: {street: 'Via Cavour 10', cap: '47121', comune: 'Forlì', provincia: 'FC'},
  },
  lines: [
    {description: 'Taglio + Barba', quantity: 1, unitPriceCents: 2049, ivaRate: 22},
  ],
  paymentMethod: 'MP08',         // carta di credito
});

console.log(invoice.number);      // → "2026/0042"
console.log(invoice.xml);         // FatturaPA XML string
console.log(invoice.pdf);         // Buffer
```

Prices are stored **net** in cents; IVA is computed on the line.

## 3. Submit to SDI

You have two options:

### Option A — Use an intermediary (recommended)

Connect a provider like Fatture in Cloud or Aruba:

```bash
FATTURE_IN_CLOUD_TOKEN="..."
```

Set `Business.einvoiceProvider = 'FATTURE_IN_CLOUD'`. `lib/e-invoice.ts → submitToSdi()` will push the XML via their REST API and poll for `RC` (ricevuta di consegna) or `NS` (notifica di scarto).

### Option B — Direct SDI (advanced)

Bottega Digitale can sign and upload directly via PEC or SDICoop. This requires a CAdES signing certificate. See `lib/e-invoice.ts → submitDirect()`.

## 4. Handle SDI rejections

If SDI rejects an invoice (typically code 0000 — XML well-formed but rejected), the event `invoice.rejected` fires and the merchant gets a dashboard notification with the SDI error code. The merchant fixes the issue (often a wrong codice fiscale) and reissues — the failed invoice is voided, not edited.

## 5. Corrispettivi telematici (optional)

For cash-register-style daily summaries (typical for bars, bakeries, food trucks), use `Corrispettivo` instead of `Invoice`. The daily total is submitted as a single XML to the Agenzia delle Entrate.

## Accountant export

Every invoice is queryable from the [accountant portal](./gdpr#commercialista-access). Standard exports:

| Format | Use |
| --- | --- |
| `csv` | Quick import into commercialista software |
| `zip` | XML + PDF of all invoices for a date range |
| `xml-aggregated` | SDI-compatible bundle for monthly submission |

## Sequence numbering

Invoice numbers are assigned in a transaction:

```ts
const number = await prisma.$transaction(async (tx) => {
  const last = await tx.invoice.findFirst({
    where: {businessId, fiscalYear: year},
    orderBy: {sequence: 'desc'},
  });
  const next = (last?.sequence ?? 0) + 1;
  return {sequence: next, display: `${year}/${String(next).padStart(4, '0')}`};
});
```

Gaps are not allowed by Italian law; once issued, an invoice can be voided but not deleted.

## See also

- [Payments with Stripe](./payments-stripe) — what gets billed
- [GDPR & data rights](./gdpr) — fiscal data is exempt from Article 17 erasure (2220 c.c.)
- [API reference — invoicing](../reference/api#invoicing)

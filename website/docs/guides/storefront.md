---
sidebar_position: 6
title: Storefront & products
description: Publish a product catalog and accept orders without an external store.
---

# Storefront & products

The storefront is the public face of a business at `/shop/<slug>`. It is not a Shopify replacement — it is a *menu-style* catalog optimised for low-friction WhatsApp ordering.

## When to use it

- ✅ Restaurants with takeaway menus
- ✅ Florists with seasonal arrangements
- ✅ Bakeries with daily specials
- ❌ Multi-SKU fashion stores (use Shopify)
- ❌ B2B catalogs with negotiated price lists

## 1. Add products

From **Dashboard → Catalog → Products** or via the API:

```bash
curl -X POST http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Cappelletti al ragù",
    "description": "Fatti a mano, ricetta della nonna",
    "priceCents": 1200,
    "ivaRate": 10,
    "category": "primi",
    "imageUrl": "https://...",
    "available": true,
    "stockTracking": false
  }'
```

For seasonal or limited-stock products, set `stockTracking: true` and `stockQuantity`.

## 2. Organise with categories

`ProductCategory` is a flat list per business. Categories appear as tabs on the storefront and reorder is drag-and-drop in the dashboard.

```bash
curl -X POST http://localhost:3000/api/products/categories \
  -d '{"name": "Antipasti", "position": 1}'
```

## 3. Variants

For products with size/topping variations:

```json
{
  "name": "Pizza Margherita",
  "priceCents": 800,
  "variants": [
    {"name": "Normale (33cm)", "priceDeltaCents": 0},
    {"name": "Grande (40cm)", "priceDeltaCents": 400},
    {"name": "Senza glutine", "priceDeltaCents": 200}
  ]
}
```

The storefront renders variants as radio buttons.

## 4. Order modes

A business chooses how orders are placed in **Settings → Storefront → Order mode**:

| Mode | Behaviour |
| --- | --- |
| `WHATSAPP` | "Order on WhatsApp" button — pre-fills a wa.me link with the cart |
| `PICKUP` | Customer pays online (Stripe Checkout) and picks up at a chosen time slot |
| `DELIVERY` | Pickup + delivery address and zone-based fee |
| `TABLE` | QR-code-per-table for restaurants — order goes to kitchen, paid on exit |

`WHATSAPP` is the default because it requires no merchant onboarding beyond a phone number.

## 5. Public URLs

| URL | What it is |
| --- | --- |
| `/shop/<slug>` | Full catalog |
| `/shop/<slug>/<product-slug>` | Single product page with JSON-LD structured data |
| `/s/<slug>` | Short link (redirects to `/shop/<slug>`) |
| `/shop/<slug>/qr` | QR poster (PDF) the merchant prints out |

## 6. SEO

Each storefront has automatic SEO:

- `<title>` and `<meta description>` built from product/category data
- JSON-LD `Restaurant`, `Store` or `LocalBusiness` schemas (`lib/seo.ts`)
- Dynamic sitemap at `/sitemap.xml`
- Open Graph image (the storefront cover photo)

Run Lighthouse on a seeded storefront — the **Best Practices** and **SEO** scores should be ≥ 95.

## 7. Inventory webhook

If you need to sync stock from an external source (e.g. a POS or a spreadsheet), set up a webhook on `product.updated` — see the [webhooks reference](../reference/webhooks).

## See also

- [Payments with Stripe](./payments-stripe) — checkout configuration
- [FatturaPA](./fattura-pa) — issuing invoices for orders
- [AI content](./ai-content) — auto-generating product descriptions

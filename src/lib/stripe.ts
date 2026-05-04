// Stripe Billing Service
// Configure with STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars

import { createHmac, timingSafeEqual } from "node:crypto";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WEBHOOK_TOLERANCE_SECONDS = 300;

export const PRICING_TIERS = {
  vetrina: { name: "Vetrina", priceMonthly: 0, stripePriceId: process.env.STRIPE_PRICE_VETRINA },
  bottega: { name: "Bottega", priceMonthly: 29, stripePriceId: process.env.STRIPE_PRICE_BOTTEGA },
  maestro: { name: "Maestro", priceMonthly: 59, stripePriceId: process.env.STRIPE_PRICE_MAESTRO },
} as const;

export type TierKey = keyof typeof PRICING_TIERS;

async function stripeRequest(endpoint: string, options: RequestInit = {}) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY non configurata");
  }
  const res = await fetch(`https://api.stripe.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
      ...options.headers,
    },
  });
  const payload = await res.json();

  if (!res.ok) {
    const message = typeof payload?.error?.message === "string"
      ? payload.error.message
      : "Errore Stripe";
    throw new Error(message);
  }

  return payload;
}

export async function createCheckoutSession(params: {
  businessId: string;
  tier: TierKey;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId = PRICING_TIERS[params.tier].stripePriceId;
  if (!priceId) throw new Error(`Stripe Price ID non configurato per il piano ${params.tier}`);

  const body = new URLSearchParams({
    "mode": "subscription",
    "customer_email": params.customerEmail,
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    "success_url": params.successUrl,
    "cancel_url": params.cancelUrl,
    "metadata[businessId]": params.businessId,
    "metadata[tier]": params.tier,
  });

  return stripeRequest("/checkout/sessions", {
    method: "POST",
    body: body.toString(),
  });
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const body = new URLSearchParams({
    customer: customerId,
    return_url: returnUrl,
  });

  return stripeRequest("/billing_portal/sessions", {
    method: "POST",
    body: body.toString(),
  });
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  if (!STRIPE_WEBHOOK_SECRET) return false;

  const parts = Object.fromEntries(
    signature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = Number(parts.t);
  const providedSignature = parts.v1;

  if (!timestamp || !providedSignature) {
    return false;
  }

  const ageInSeconds = Math.abs(Date.now() / 1000 - timestamp);
  if (ageInSeconds > WEBHOOK_TOLERANCE_SECONDS) {
    return false;
  }

  const expectedSignature = createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${timestamp}.${payload}`)
    .digest("hex");

  const providedBuffer = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

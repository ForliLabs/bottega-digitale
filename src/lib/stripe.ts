// Stripe Billing Service
// Configure with STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET env vars

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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
  return res.json();
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
  // In production, use Stripe SDK for proper signature verification
  // This is a placeholder that checks the signature header exists
  return signature.includes("t=") && signature.includes("v1=");
}

export function isStripeConfigured(): boolean {
  return !!STRIPE_SECRET_KEY;
}

import { getAuthContext } from "@/lib/auth";
import { createCheckoutSession, isStripeConfigured, type TierKey } from "@/lib/stripe";

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return Response.json({ error: "Stripe non configurato. Imposta STRIPE_SECRET_KEY." }, { status: 503 });
  }

  try {
    const { tier } = await request.json();
    if (!["vetrina", "bottega", "maestro"].includes(tier)) {
      return Response.json({ error: "Piano non valido." }, { status: 400 });
    }

    const origin = new URL(request.url).origin;
    const session = await createCheckoutSession({
      businessId: auth.business.id,
      tier: tier as TierKey,
      customerEmail: auth.user.email,
      successUrl: `${origin}/dashboard/billing?success=true`,
      cancelUrl: `${origin}/dashboard/billing?cancelled=true`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore Stripe";
    return Response.json({ error: message }, { status: 500 });
  }
}

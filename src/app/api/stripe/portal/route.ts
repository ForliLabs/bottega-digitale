import { getAuthContext } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/api-response";
import { createCustomerPortalSession, isStripeConfigured } from "@/lib/stripe";

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  const auth = await getAuthContext();
  if (!auth) {
    return Response.json({ error: "Non autenticato." }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return Response.json({ error: "Stripe non configurato." }, { status: 503 });
  }

  const customerId = auth.business.stripeCustomerId;
  if (!customerId) {
    return Response.json(
      { error: "Nessun cliente Stripe associato. Sottoscrivi un piano prima." },
      { status: 400 },
    );
  }

  try {
    const origin = new URL(request.url).origin;
    const session = await createCustomerPortalSession(
      customerId,
      `${origin}/dashboard/billing`,
    );

    return Response.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore Stripe";
    return Response.json({ error: message }, { status: 500 });
  }
}

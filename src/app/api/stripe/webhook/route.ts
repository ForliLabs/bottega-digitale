import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Firma mancante." }, { status: 400 });
  }

  const payload = await request.text();
  if (!verifyWebhookSignature(payload, signature)) {
    return Response.json({ error: "Firma non valida." }, { status: 400 });
  }

  try {
    const event = JSON.parse(payload);

    // Deduplicate events
    const existing = await prisma.stripeEvent.findUnique({
      where: { stripeEventId: event.id },
    });
    if (existing) {
      return Response.json({ received: true });
    }

    await prisma.stripeEvent.create({
      data: {
        stripeEventId: event.id,
        type: event.type,
        data: JSON.stringify(event.data),
      },
    });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const businessId = session.metadata?.businessId;
        const tier = session.metadata?.tier;
        if (businessId && tier) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionTier: tier,
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: { subscriptionTier: "vetrina", stripeSubscriptionId: null },
          });
        }
        break;
      }
    }

    return Response.json({ received: true });
  } catch {
    return Response.json({ error: "Errore webhook." }, { status: 500 });
  }
}

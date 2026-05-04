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
    const event = JSON.parse(payload) as {
      id?: string;
      type?: string;
      data?: { object?: Record<string, unknown> };
    };

    if (!event.id || !event.type || !event.data?.object) {
      return Response.json({ error: "Payload webhook non valido." }, { status: 400 });
    }

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
        const metadata = typeof session.metadata === "object" && session.metadata !== null
          ? session.metadata as Record<string, unknown>
          : {};
        const businessId = typeof metadata.businessId === "string" ? metadata.businessId : null;
        const tier = typeof metadata.tier === "string" ? metadata.tier : null;
        if (businessId && tier) {
          await prisma.business.update({
            where: { id: businessId },
            data: {
              subscriptionTier: tier,
              stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
              stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = typeof subscription.id === "string" ? subscription.id : null;
        if (!subscriptionId) break;

        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
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

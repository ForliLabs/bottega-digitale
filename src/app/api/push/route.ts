import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Register a push subscription
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { endpoint, keys, userType, userId, customerId } = payload;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return Response.json({ error: "Dati sottoscrizione incompleti" }, { status: 400 });
    }

    const business = await getBusinessContext();

    // Upsert subscription
    const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (existing) {
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          businessId: business?.id || null,
          userType: userType || "owner",
        },
      });
      return Response.json({ message: "Sottoscrizione aggiornata" });
    }

    await prisma.pushSubscription.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        businessId: business?.id || null,
        userType: userType || "owner",
        userId: userId || null,
        customerId: customerId || null,
      },
    });

    return Response.json({ message: "Sottoscrizione push registrata" }, { status: 201 });
  } catch {
    return Response.json({ error: "Errore nella registrazione push" }, { status: 500 });
  }
}

// DELETE: Unsubscribe
export async function DELETE(request: Request) {
  try {
    const { endpoint } = await request.json();
    if (!endpoint) {
      return Response.json({ error: "Endpoint mancante" }, { status: 400 });
    }

    await prisma.pushSubscription.deleteMany({ where: { endpoint } });
    return Response.json({ message: "Sottoscrizione rimossa" });
  } catch {
    return Response.json({ error: "Errore nella rimozione" }, { status: 500 });
  }
}

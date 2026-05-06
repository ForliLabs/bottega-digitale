import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export const dynamic = "force-dynamic";

// Register a push subscription
export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();
    const { endpoint, keys, userType, userId, customerId } = payload;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return apiError("Dati sottoscrizione incompleti", 400, "invalid_subscription");
    }

    const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } });
    if (existing) {
      if (existing.businessId && existing.businessId !== business.id) {
        return apiError("Sottoscrizione già registrata da un'altra attività", 409, "subscription_conflict");
      }

      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
          businessId: business.id,
          userType: userType || "owner",
          userId: userId || null,
          customerId: customerId || null,
        },
      });
      return apiJson({ message: "Sottoscrizione aggiornata" });
    }

    await prisma.pushSubscription.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        businessId: business.id,
        userType: userType || "owner",
        userId: userId || null,
        customerId: customerId || null,
      },
    });

    return apiJson({ message: "Sottoscrizione push registrata" }, { status: 201 });
  } catch {
    return apiError("Errore nella registrazione push", 500, "push_registration_failed");
  }
}

export async function DELETE(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const { endpoint } = await request.json();
    if (!endpoint) {
      return apiError("Endpoint mancante", 400, "missing_endpoint");
    }

    const deleted = await prisma.pushSubscription.deleteMany({ where: { endpoint, businessId: business.id } });
    if (deleted.count === 0) {
      return apiError("Sottoscrizione non trovata", 404, "subscription_not_found");
    }
    return apiJson({ message: "Sottoscrizione rimossa" });
  } catch {
    return apiError("Errore nella rimozione", 500, "push_delete_failed");
  }
}

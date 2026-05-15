import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

// Loyalty check-in API: scan QR code at counter (staff/business-owned action)

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

    if (!business.loyaltyEnabled) {
      return apiError("Programma fedeltà non attivo.", 404, "loyalty_disabled");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Corpo richiesta non valido.", 400, "invalid_body");
    }

    const { customerId, customerPhone } = body as Record<string, unknown>;

    // Validate that at least one identifier is provided and is a string
    if (!customerId && !customerPhone) {
      return apiError("customerId o customerPhone richiesto.", 400, "missing_identifier");
    }
    if (customerId && typeof customerId !== "string") {
      return apiError("customerId deve essere una stringa.", 400, "invalid_input");
    }
    if (customerPhone && typeof customerPhone !== "string") {
      return apiError("customerPhone deve essere una stringa.", 400, "invalid_input");
    }

    // Find customer scoped to the authenticated business
    const customer = customerId
      ? await prisma.customer.findFirst({ where: { id: customerId, businessId: business.id } })
      : customerPhone
        ? await prisma.customer.findFirst({ where: { phone: customerPhone, businessId: business.id } })
        : null;

    if (!customer) {
      return apiError("Cliente non trovato.", 404, "customer_not_found");
    }

    const pointsToAdd = business.loyaltyPointsPerVisit;

    // Update or create loyalty card + update customer in a transaction
    const result = await prisma.$transaction(async (tx) => {
      let card = await tx.loyaltyCard.findUnique({
        where: { businessId_customerId: { businessId: business.id, customerId: customer.id } },
      });

      if (card) {
        card = await tx.loyaltyCard.update({
          where: { id: card.id },
          data: {
            points: { increment: pointsToAdd },
            totalEarned: { increment: pointsToAdd },
          },
        });
      } else {
        card = await tx.loyaltyCard.create({
          data: {
            businessId: business.id,
            customerId: customer.id,
            points: pointsToAdd,
            totalEarned: pointsToAdd,
          },
        });
      }

      await tx.customer.update({
        where: { id: customer.id },
        data: {
          loyaltyPoints: { increment: pointsToAdd },
          totalVisits: { increment: 1 },
          lastVisit: new Date(),
        },
      });

      return card;
    });

    const rewardAvailable = result.points >= business.loyaltyRewardThreshold;

    return apiJson({
      points: result.points,
      totalEarned: result.totalEarned,
      pointsAdded: pointsToAdd,
      threshold: business.loyaltyRewardThreshold,
      rewardName: business.loyaltyRewardName,
      rewardAvailable,
    });
  } catch {
    return apiError("Errore check-in fedeltà.", 500, "checkin_failed");
  }
}

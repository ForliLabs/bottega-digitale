import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

// Public loyalty card API: view card status (no auth needed)

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const customerId = url.searchParams.get("customerId");

  if (!businessId || !customerId) {
    return apiError("businessId e customerId richiesti.", 400, "missing_loyalty_identifier");
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || !business.loyaltyEnabled) {
    return apiError("Programma fedeltà non attivo.", 404, "loyalty_not_enabled");
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { businessId_customerId: { businessId, customerId } },
    include: {
      customer: { select: { name: true, totalVisits: true } },
      redemptions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!card) {
    return apiError("Carta fedeltà non trovata.", 404, "loyalty_card_not_found");
  }

  return apiJson({
    businessName: business.name,
    businessSlug: business.slug,
    businessPhone: business.phone,
    points: card.points,
    customerName: card.customer.name,
    totalEarned: card.totalEarned,
    totalVisits: card.customer.totalVisits,
    threshold: business.loyaltyRewardThreshold,
    rewardName: business.loyaltyRewardName,
    rewardAvailable: card.points >= business.loyaltyRewardThreshold,
    recentRedemptions: card.redemptions,
  });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const payload = await request.json();
  if (payload.action !== "redeem" || !payload.cardId) {
    return apiError("Azione fedeltà non valida", 400, "invalid_loyalty_action");
  }

  const card = await prisma.loyaltyCard.findFirst({
    where: { id: payload.cardId, businessId: business.id },
    include: { customer: true },
  });

  if (!card) {
    return apiError("Carta fedeltà non trovata", 404, "loyalty_card_not_found");
  }

  if (card.points < business.loyaltyRewardThreshold) {
    return apiError("Il cliente non ha ancora raggiunto la soglia premio", 400, "reward_not_available");
  }

  const updatedCard = await prisma.$transaction(async (tx) => {
    await tx.loyaltyRedemption.create({
      data: {
        businessId: business.id,
        cardId: card.id,
        points: business.loyaltyRewardThreshold,
        reward: business.loyaltyRewardName,
      },
    });

    const nextCard = await tx.loyaltyCard.update({
      where: { id: card.id },
      data: {
        points: { decrement: business.loyaltyRewardThreshold },
      },
    });

    await tx.customer.update({
      where: { id: card.customerId },
      data: {
        loyaltyPoints: { decrement: business.loyaltyRewardThreshold },
      },
    });

    return nextCard;
  });

  return apiJson({
    success: true,
    points: updatedCard.points,
    rewardName: business.loyaltyRewardName,
  });
}

export async function PATCH(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const payload = await request.json();
  const pointsPerVisit = Number(payload.pointsPerVisit);
  const rewardThreshold = Number(payload.rewardThreshold);
  const rewardName = typeof payload.rewardName === "string" ? payload.rewardName.trim() : "";

  if (!Number.isFinite(pointsPerVisit) || pointsPerVisit <= 0 || !Number.isFinite(rewardThreshold) || rewardThreshold <= 0 || !rewardName) {
    return apiError("Configura valori fedeltà validi", 400, "invalid_loyalty_settings");
  }

  await prisma.business.update({
    where: { id: business.id },
    data: {
      loyaltyEnabled: payload.enabled !== false,
      loyaltyPointsPerVisit: Math.round(pointsPerVisit),
      loyaltyRewardThreshold: Math.round(rewardThreshold),
      loyaltyRewardName: rewardName,
    },
  });

  return apiJson({ success: true });
}

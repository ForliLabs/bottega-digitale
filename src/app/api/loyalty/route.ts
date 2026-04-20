import { prisma } from "@/lib/prisma";

// Public loyalty card API: view card status (no auth needed)

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const customerId = url.searchParams.get("customerId");

  if (!businessId || !customerId) {
    return Response.json({ error: "businessId e customerId richiesti." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || !business.loyaltyEnabled) {
    return Response.json({ error: "Programma fedeltà non attivo." }, { status: 404 });
  }

  const card = await prisma.loyaltyCard.findUnique({
    where: { businessId_customerId: { businessId, customerId } },
    include: {
      customer: { select: { name: true, totalVisits: true } },
      redemptions: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  if (!card) {
    return Response.json({ error: "Carta fedeltà non trovata." }, { status: 404 });
  }

  return Response.json({
    businessName: business.name,
    customerName: card.customer.name,
    points: card.points,
    totalEarned: card.totalEarned,
    totalVisits: card.customer.totalVisits,
    threshold: business.loyaltyRewardThreshold,
    rewardName: business.loyaltyRewardName,
    rewardAvailable: card.points >= business.loyaltyRewardThreshold,
    recentRedemptions: card.redemptions,
  });
}

import { prisma } from "@/lib/prisma";

// Loyalty check-in API: scan QR code at counter

export async function POST(request: Request) {
  try {
    const { businessId, customerId, customerPhone } = await request.json();

    if (!businessId) {
      return Response.json({ error: "businessId richiesto." }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.loyaltyEnabled) {
      return Response.json({ error: "Programma fedeltà non attivo." }, { status: 404 });
    }

    // Find customer by ID or phone
    const customer = customerId
      ? await prisma.customer.findFirst({ where: { id: customerId, businessId } })
      : customerPhone
        ? await prisma.customer.findFirst({ where: { phone: customerPhone, businessId } })
        : null;

    if (!customer) {
      return Response.json({ error: "Cliente non trovato." }, { status: 404 });
    }

    // Add loyalty points
    const pointsToAdd = business.loyaltyPointsPerVisit;

    // Update or create loyalty card
    let card = await prisma.loyaltyCard.findUnique({
      where: { businessId_customerId: { businessId, customerId: customer.id } },
    });

    if (card) {
      card = await prisma.loyaltyCard.update({
        where: { id: card.id },
        data: {
          points: { increment: pointsToAdd },
          totalEarned: { increment: pointsToAdd },
        },
      });
    } else {
      card = await prisma.loyaltyCard.create({
        data: {
          businessId,
          customerId: customer.id,
          points: pointsToAdd,
          totalEarned: pointsToAdd,
        },
      });
    }

    // Update customer record
    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        loyaltyPoints: { increment: pointsToAdd },
        totalVisits: { increment: 1 },
        lastVisit: new Date(),
      },
    });

    // Check if reward threshold reached
    const rewardAvailable = card.points >= business.loyaltyRewardThreshold;

    return Response.json({
      points: card.points,
      totalEarned: card.totalEarned,
      pointsAdded: pointsToAdd,
      threshold: business.loyaltyRewardThreshold,
      rewardName: business.loyaltyRewardName,
      rewardAvailable,
    });
  } catch {
    return Response.json({ error: "Errore check-in fedeltà." }, { status: 500 });
  }
}

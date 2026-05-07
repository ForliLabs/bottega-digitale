export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { LoyaltyDashboardClient } from "./loyalty-dashboard-client";

export default async function LoyaltyPage() {
  const business = await getBusinessContext();

  if (!business) {
    return null;
  }

  const cards = await prisma.loyaltyCard.findMany({
    where: { businessId: business.id },
    include: { customer: { select: { name: true, phone: true, totalVisits: true } } },
    orderBy: { points: "desc" },
  });

  const totalPoints = cards.reduce((sum, card) => sum + card.points, 0);
  const totalRedeemed = await prisma.loyaltyRedemption.count({ where: { businessId: business.id } });

  return (
    <LoyaltyDashboardClient
      business={{
        id: business.id,
        loyaltyEnabled: business.loyaltyEnabled,
        loyaltyPointsPerVisit: business.loyaltyPointsPerVisit,
        loyaltyRewardThreshold: business.loyaltyRewardThreshold,
        loyaltyRewardName: business.loyaltyRewardName,
      }}
      cards={cards.map((card) => ({
        id: card.id,
        customerName: card.customer.name,
        customerPhone: card.customer.phone,
        totalVisits: card.customer.totalVisits,
        points: card.points,
      }))}
      totalPoints={totalPoints}
      totalRedeemed={totalRedeemed}
    />
  );
}

import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ partnerships: [], promotions: [], vouchers: [] });
  }

  const [partnershipsA, partnershipsB, promotionsSent, promotionsReceived, vouchers] = await Promise.all([
    prisma.partnership.findMany({
      where: { businessAId: business.id },
      include: { businessB: { select: { id: true, name: true, category: true, slug: true } } },
    }),
    prisma.partnership.findMany({
      where: { businessBId: business.id },
      include: { businessA: { select: { id: true, name: true, category: true, slug: true } } },
    }),
    prisma.crossPromotion.findMany({
      where: { fromBusinessId: business.id },
      include: { toBusiness: { select: { name: true } } },
    }),
    prisma.crossPromotion.findMany({
      where: { toBusinessId: business.id },
      include: { fromBusiness: { select: { name: true } } },
    }),
    prisma.voucher.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const partnerships = [
    ...partnershipsA.map((p) => ({ ...p, partner: p.businessB, direction: "initiated" as const })),
    ...partnershipsB.map((p) => ({ ...p, partner: p.businessA, direction: "received" as const })),
  ];

  return Response.json({
    partnerships,
    promotions: [...promotionsSent, ...promotionsReceived],
    vouchers,
  });
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const action = payload.action || "invite";

    if (action === "invite") {
      const partnerSlug = payload.partnerSlug;
      const partner = await prisma.business.findUnique({ where: { slug: partnerSlug } });
      if (!partner) {
        return Response.json({ error: "Attività partner non trovata" }, { status: 404 });
      }

      const existing = await prisma.partnership.findFirst({
        where: {
          OR: [
            { businessAId: business.id, businessBId: partner.id },
            { businessAId: partner.id, businessBId: business.id },
          ],
        },
      });

      if (existing) {
        return Response.json({ error: "Partnership già esistente" }, { status: 409 });
      }

      const partnership = await prisma.partnership.create({
        data: {
          businessAId: business.id,
          businessBId: partner.id,
          type: payload.type || "sconto_reciproco",
          status: "pending",
        },
      });

      return Response.json(partnership, { status: 201 });
    }

    if (action === "respond") {
      const { partnershipId, accept } = payload;
      await prisma.partnership.update({
        where: { id: partnershipId },
        data: { status: accept ? "active" : "declined" },
      });
      return Response.json({ message: accept ? "Partnership accettata" : "Partnership rifiutata" });
    }

    if (action === "create-promo") {
      const { partnershipId, discountPercent, description } = payload;
      const partnership = await prisma.partnership.findUnique({ where: { id: partnershipId } });
      if (!partnership || partnership.status !== "active") {
        return Response.json({ error: "Partnership non attiva" }, { status: 400 });
      }

      const toBusinessId = partnership.businessAId === business.id
        ? partnership.businessBId
        : partnership.businessAId;

      const promo = await prisma.crossPromotion.create({
        data: {
          partnershipId,
          fromBusinessId: business.id,
          toBusinessId,
          discountPercent: discountPercent || 10,
          description: description || "Sconto partner",
        },
      });

      return Response.json(promo, { status: 201 });
    }

    if (action === "generate-voucher") {
      const { crossPromotionId, customerPhone } = payload;
      const promo = await prisma.crossPromotion.findUnique({ where: { id: crossPromotionId } });
      if (!promo) {
        return Response.json({ error: "Promozione non trovata" }, { status: 404 });
      }

      const code = generateVoucherCode();
      const voucher = await prisma.voucher.create({
        data: {
          businessId: promo.toBusinessId,
          crossPromotionId: promo.id,
          code,
          discountPercent: promo.discountPercent,
          description: promo.description,
          customerPhone: customerPhone || null,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return Response.json(voucher, { status: 201 });
    }

    return Response.json({ error: "Azione non supportata" }, { status: 400 });
  } catch {
    return Response.json({ error: "Errore nella gestione partnership" }, { status: 500 });
  }
}

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BD-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

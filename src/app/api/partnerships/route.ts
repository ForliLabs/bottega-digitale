import { randomInt } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
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

  return apiJson({
    partnerships,
    promotions: [...promotionsSent, ...promotionsReceived],
    vouchers,
  });
}

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
    const action = payload.action || "invite";

    if (action === "invite") {
      const partnerSlug = payload.partnerSlug;
      const partner = await prisma.business.findUnique({ where: { slug: partnerSlug } });
      if (!partner) {
        return apiError("Attività partner non trovata", 404, "partner_not_found");
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
        return apiError("Partnership già esistente", 409, "partnership_exists");
      }

      const partnership = await prisma.partnership.create({
        data: {
          businessAId: business.id,
          businessBId: partner.id,
          type: payload.type || "sconto_reciproco",
          status: "pending",
        },
      });

      return apiJson(partnership, { status: 201 });
    }

    if (action === "respond") {
      const { partnershipId, accept } = payload;
      const updated = await prisma.partnership.updateMany({
        where: {
          id: partnershipId,
          OR: [{ businessAId: business.id }, { businessBId: business.id }],
        },
        data: { status: accept ? "active" : "declined" },
      });
      if (updated.count === 0) {
        return apiError("Partnership non trovata", 404, "partnership_not_found");
      }
      return apiJson({ message: accept ? "Partnership accettata" : "Partnership rifiutata" });
    }

    if (action === "create-promo") {
      const { partnershipId, discountPercent, description } = payload;
      const partnership = await prisma.partnership.findFirst({
        where: {
          id: partnershipId,
          status: "active",
          OR: [{ businessAId: business.id }, { businessBId: business.id }],
        },
      });
      if (!partnership) {
        return apiError("Partnership non attiva", 400, "partnership_inactive");
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

      return apiJson(promo, { status: 201 });
    }

    if (action === "generate-voucher") {
      const { crossPromotionId, customerPhone } = payload;
      const promo = await prisma.crossPromotion.findFirst({
        where: {
          id: crossPromotionId,
          partnership: {
            OR: [{ businessAId: business.id }, { businessBId: business.id }],
          },
        },
      });
      if (!promo) {
        return apiError("Promozione non trovata", 404, "promotion_not_found");
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

      return apiJson(voucher, { status: 201 });
    }

    return apiError("Azione non supportata", 400, "invalid_action");
  } catch {
    return apiError("Errore nella gestione partnership", 500, "partnership_failed");
  }
}

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BD-";
  for (let i = 0; i < 6; i++) {
    code += chars[randomInt(chars.length)];
  }
  return code;
}

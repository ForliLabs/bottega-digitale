import { requireBusinessContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { updateBusinessCapabilitiesSchema } from "@/lib/validations/business-capabilities";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();

  return apiJson({
    id: business.id,
    slug: business.slug,
    websitePublished: business.websitePublished,
    queueEnabled: business.queueEnabled,
    avgServiceMinutes: business.avgServiceMinutes,
    loyaltyEnabled: business.loyaltyEnabled,
    onlineBookingEnabled: business.onlineBookingEnabled,
    crossPromoEnabled: business.crossPromoEnabled,
    whatsappAiEnabled: business.whatsappAiEnabled,
    catalogEnabled: business.catalogEnabled,
    depositsEnabled: business.depositsEnabled,
    depositPercentage: business.depositPercentage,
    stripeConnectAccountId: business.stripeConnectAccountId,
  });
}

export async function PATCH(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    const payload = await request.json();
    const result = updateBusinessCapabilitiesSchema.safeParse(payload);
    if (!result.success) {
      return apiError("Impostazioni non valide", 400, "validation_error");
    }

    const data = result.data;
    if (Object.keys(data).length === 0) {
      return apiError("Nessuna modifica ricevuta", 400, "validation_error");
    }

    const updated = await prisma.business.update({
      where: { id: business.id },
      data,
      select: {
        id: true,
        slug: true,
        websitePublished: true,
        queueEnabled: true,
        avgServiceMinutes: true,
        loyaltyEnabled: true,
        onlineBookingEnabled: true,
        crossPromoEnabled: true,
        whatsappAiEnabled: true,
        catalogEnabled: true,
        depositsEnabled: true,
        depositPercentage: true,
        stripeConnectAccountId: true,
      },
    });

    return apiJson(updated);
  } catch {
    return apiError("Errore nel salvataggio dei moduli attivi", 500, "business_capabilities_update_failed");
  }
}

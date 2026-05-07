import { prisma } from "@/lib/prisma";
import { getAssociationStats, bulkOnboardBusinesses, parseCSVBusinesses } from "@/lib/association-portal";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const associationId = searchParams.get("associationId");

  if (!associationId) {
    const associations = await prisma.association.findMany({
      include: { _count: { select: { memberships: true } } },
    });
    return apiJson(associations);
  }

  const stats = await getAssociationStats(associationId);
  return apiJson(stats);
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const payload = await request.json();

    if (payload.action === "bulk_onboard") {
      if (!payload.associationId) {
        return apiError("Associazione richiesta per l'importazione", 400, "association_required");
      }
      const rows = parseCSVBusinesses(payload.csvData || "");
      if (rows.length === 0) {
        return apiError("Il CSV non contiene righe valide da importare", 400, "empty_csv_import");
      }
      const result = await bulkOnboardBusinesses(payload.associationId, rows);
      return apiJson(result);
    }

    if (!payload.name) {
      return apiError("Nome associazione obbligatorio", 400, "association_name_required");
    }

    const association = await prisma.association.create({
      data: {
        name: payload.name,
        slug: payload.slug || payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        type: payload.type || "CNA",
        city: payload.city || "Forlì",
        contactEmail: payload.contactEmail,
        contactPhone: payload.contactPhone,
        logoUrl: payload.logoUrl,
        primaryColor: payload.primaryColor || "#1E40AF",
      },
    });

    return apiJson(association, { status: 201 });
  } catch {
    return apiError("Errore nella gestione dell'associazione.", 400, "association_request_failed");
  }
}

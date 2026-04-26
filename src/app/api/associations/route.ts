import { prisma } from "@/lib/prisma";
import { getAssociationStats, bulkOnboardBusinesses, parseCSVBusinesses } from "@/lib/association-portal";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const associationId = searchParams.get("associationId");

  if (!associationId) {
    const associations = await prisma.association.findMany({
      include: { _count: { select: { memberships: true } } },
    });
    return Response.json(associations);
  }

  const stats = await getAssociationStats(associationId);
  return Response.json(stats);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    if (payload.action === "bulk_onboard") {
      const rows = parseCSVBusinesses(payload.csvData || "");
      const result = await bulkOnboardBusinesses(payload.associationId, rows);
      return Response.json(result);
    }

    // Create new association
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

    return Response.json(association, { status: 201 });
  } catch {
    return Response.json(
      { error: "Errore nella gestione dell'associazione." },
      { status: 400 }
    );
  }
}

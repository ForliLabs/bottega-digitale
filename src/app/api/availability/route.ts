import { getAvailability } from "@/lib/availability";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get("businessId");
  const slug = searchParams.get("slug");
  const serviceDuration = parseInt(searchParams.get("duration") || "30", 10);

  let resolvedBusinessId = businessId;

  if (!resolvedBusinessId && slug) {
    const business = await prisma.business.findUnique({ where: { slug } });
    if (business) resolvedBusinessId = business.id;
  }

  if (!resolvedBusinessId) {
    return Response.json({ error: "businessId o slug richiesto" }, { status: 400 });
  }

  const availability = await getAvailability(resolvedBusinessId, 14, serviceDuration);
  return Response.json({ availability });
}

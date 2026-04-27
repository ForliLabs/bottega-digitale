import { prisma } from "@/lib/prisma";
import { REGIONS } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city");

  if (city) {
    // Get specific region
    const region = await prisma.regionConfig.findUnique({ where: { city } });
    if (region) return Response.json(region);
    // Fallback to static config
    const staticRegion = REGIONS.find((r) => r.city.toLowerCase() === city.toLowerCase());
    if (staticRegion) return Response.json(staticRegion);
    return Response.json({ error: "Regione non trovata" }, { status: 404 });
  }

  // List all regions
  const dbRegions = await prisma.regionConfig.findMany({
    where: { active: true },
    orderBy: { city: "asc" },
  });

  // Merge with static regions
  const allRegions = [...REGIONS];
  for (const dbRegion of dbRegions) {
    if (!allRegions.find((r) => r.city === dbRegion.city)) {
      allRegions.push({
        city: dbRegion.city,
        region: dbRegion.region,
        defaultVatRate: dbRegion.defaultVatRate,
        associations: JSON.parse(dbRegion.associations),
        defaultCategories: JSON.parse(dbRegion.categories),
      });
    }
  }

  return Response.json(allRegions);
}

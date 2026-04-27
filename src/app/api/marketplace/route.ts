import { searchMarketplace } from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = {
    category: searchParams.get("category") || undefined,
    city: searchParams.get("city") || undefined,
    type: (searchParams.get("type") as "service" | "product") || undefined,
    query: searchParams.get("q") || undefined,
    priceMin: searchParams.get("priceMin") ? Number(searchParams.get("priceMin")) : undefined,
    priceMax: searchParams.get("priceMax") ? Number(searchParams.get("priceMax")) : undefined,
    featured: searchParams.get("featured") === "true" ? true : undefined,
  };

  const results = await searchMarketplace(filters);
  return Response.json(results);
}

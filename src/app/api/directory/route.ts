import { prisma } from "@/lib/prisma";

// Public directory API: browse businesses

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const city = url.searchParams.get("city") || "Forlì";
  const query = url.searchParams.get("q");
  const slug = url.searchParams.get("slug");

  if (slug) {
    const business = await prisma.business.findUnique({
      where: { slug },
      include: {
        services: {
          orderBy: { priceEuro: "asc" },
          select: {
            id: true,
            name: true,
            priceEuro: true,
            durationMinutes: true,
          },
        },
      },
    });

    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    return Response.json({
      id: business.id,
      name: business.name,
      slug: business.slug,
      category: business.category,
      services: business.services,
    });
  }

  const where: Record<string, unknown> = {
    websitePublished: true,
    city: { contains: city },
  };

  if (category) {
    where.category = { contains: category };
  }

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { category: { contains: query } },
    ];
  }

  const businesses = await prisma.business.findMany({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      city: true,
      address: true,
      phone: true,
      description: true,
      websiteTemplate: true,
      _count: { select: { reviews: true, services: true } },
    },
    orderBy: { name: "asc" },
  });

  // Get average ratings
  const businessesWithRatings = await Promise.all(
    businesses.map(async (biz) => {
      const avgRating = await prisma.review.aggregate({
        where: { businessId: biz.id },
        _avg: { rating: true },
      });
      return { ...biz, avgRating: avgRating._avg.rating || 0 };
    })
  );

  // Get unique categories for filter
  const categories = await prisma.business.findMany({
    where: { websitePublished: true, city: { contains: city } },
    select: { category: true },
    distinct: ["category"],
  });

  return Response.json({
    businesses: businessesWithRatings,
    categories: categories.map((c) => c.category),
    total: businesses.length,
  });
}

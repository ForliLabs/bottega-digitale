import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ error: "Attività non trovata" }, { status: 404 });
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return Response.json(products);
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: payload.name,
        description: payload.description || "",
        priceEuro: payload.priceEuro || 0,
        categoryId: payload.categoryId || null,
        imageUrl: payload.imageUrl || null,
        stock: payload.stock ?? -1,
        isAvailable: payload.isAvailable ?? true,
      },
    });

    return Response.json(product, { status: 201 });
  } catch {
    return Response.json(
      { error: "Errore nella creazione del prodotto." },
      { status: 400 }
    );
  }
}

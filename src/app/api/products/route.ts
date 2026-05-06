import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const products = await prisma.product.findMany({
    where: { businessId: business.id },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return apiJson(products);
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

    return apiJson(product, { status: 201 });
  } catch {
    return apiError("Errore nella creazione del prodotto.", 500, "product_create_failed");
  }
}

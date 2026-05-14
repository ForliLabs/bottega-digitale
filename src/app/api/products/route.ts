import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { createProductSchema } from "@/lib/validations/products";

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
    const result = createProductSchema.safeParse(payload);
    if (!result.success) {
      return apiError("Dati non validi", 400, "validation_error");
    }

    const data = result.data;
    const product = await prisma.product.create({
      data: {
        businessId: business.id,
        name: data.name,
        description: data.description,
        priceEuro: data.priceEuro,
        categoryId: data.categoryId ?? null,
        imageUrl: data.imageUrl ?? null,
        stock: data.stock,
        isAvailable: data.isAvailable,
      },
    });

    return apiJson(product, { status: 201 });
  } catch {
    return apiError("Errore nella creazione del prodotto.", 500, "product_create_failed");
  }
}

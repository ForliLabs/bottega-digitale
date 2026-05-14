import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { updateProductSchema } from "@/lib/validations/products";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const product = await prisma.product.findFirst({
    where: { id, businessId: business.id },
    include: { category: true },
  });

  if (!product) {
    return apiError("Prodotto non trovato", 404, "not_found");
  }

  return apiJson(product);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const existing = await prisma.product.findFirst({
      where: { id, businessId: business.id },
    });
    if (!existing) {
      return apiError("Prodotto non trovato", 404, "not_found");
    }

    const payload = await request.json();
    const result = updateProductSchema.safeParse(payload);
    if (!result.success) {
      return apiError("Dati non validi", 400, "validation_error");
    }

    const data = result.data;
    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priceEuro !== undefined && { priceEuro: data.priceEuro }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
        ...(data.stock !== undefined && { stock: data.stock }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      },
    });

    return apiJson(updated);
  } catch {
    return apiError("Errore nell'aggiornamento del prodotto.", 500, "product_update_failed");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const existing = await prisma.product.findFirst({
      where: { id, businessId: business.id },
    });
    if (!existing) {
      return apiError("Prodotto non trovato", 404, "not_found");
    }

    await prisma.product.delete({ where: { id } });

    return apiJson({ success: true });
  } catch {
    return apiError("Errore nella cancellazione del prodotto.", 500, "product_delete_failed");
  }
}

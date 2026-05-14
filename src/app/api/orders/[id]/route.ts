import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { updateOrderStatusSchema } from "@/lib/validations/orders";

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

  const order = await prisma.order.findFirst({
    where: { id, businessId: business.id },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return apiError("Ordine non trovato", 404, "not_found");
  }

  return apiJson(order);
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

    const existing = await prisma.order.findFirst({
      where: { id, businessId: business.id },
    });
    if (!existing) {
      return apiError("Ordine non trovato", 404, "not_found");
    }

    const payload = await request.json();
    const result = updateOrderStatusSchema.safeParse(payload);
    if (!result.success) {
      return apiError("Stato non valido", 400, "validation_error");
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: result.data.status },
      include: { items: { include: { product: true } } },
    });

    return apiJson(updated);
  } catch {
    return apiError("Errore nell'aggiornamento dell'ordine.", 500, "order_update_failed");
  }
}

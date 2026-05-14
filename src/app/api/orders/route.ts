import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { createOrder } from "@/lib/product-catalog";
import { createOrderSchema } from "@/lib/validations/orders";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const orders = await prisma.order.findMany({
    where: { businessId: business.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return apiJson(orders);
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
    const result = createOrderSchema.safeParse(payload);
    if (!result.success) {
      return apiError("Dati non validi", 400, "validation_error");
    }

    const data = result.data;
    const order = await createOrder({
      businessId: business.id,
      customerName: data.customerName,
      customerPhone: data.customerPhone ?? undefined,
      channel: data.channel,
      items: data.items,
      notes: data.notes ?? undefined,
    });

    return apiJson(order, { status: 201 });
  } catch {
    return apiError("Errore nella creazione dell'ordine.", 500, "order_create_failed");
  }
}

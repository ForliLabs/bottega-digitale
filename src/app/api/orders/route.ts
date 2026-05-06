import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { createOrder } from "@/lib/product-catalog";

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
    const order = await createOrder({
      businessId: business.id,
      customerName: payload.customerName || "Cliente",
      customerPhone: payload.customerPhone,
      channel: payload.channel || "online",
      items: payload.items || [],
      notes: payload.notes,
    });

    return apiJson(order, { status: 201 });
  } catch {
    return apiError("Errore nella creazione dell'ordine.", 500, "order_create_failed");
  }
}

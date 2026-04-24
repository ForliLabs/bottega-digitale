import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { createOrder } from "@/lib/product-catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ error: "Attività non trovata" }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { businessId: business.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return Response.json(orders);
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
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

    return Response.json(order, { status: 201 });
  } catch {
    return Response.json(
      { error: "Errore nella creazione dell'ordine." },
      { status: 400 }
    );
  }
}

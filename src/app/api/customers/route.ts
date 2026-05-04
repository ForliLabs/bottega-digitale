import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();

  if (!business) {
    return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const customers = await prisma.customer.findMany({
    where: { businessId: business.id },
    orderBy: { lastVisit: "desc" },
  });
  return Response.json(customers);
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const business = await requireBusinessContext();

    if (!business) {
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: payload.name ?? "Nuovo cliente",
        phone: payload.phone ?? "+39 0543 000000",
        lastVisit: new Date(payload.lastVisit ?? new Date()),
        totalVisits: payload.totalVisits ?? 1,
        loyaltyPoints: payload.loyaltyPoints ?? 10,
      },
    });

    return Response.json(customer, { status: 201 });
  } catch {
    return Response.json(
      { error: "Richiesta non valida per la creazione del cliente." },
      { status: 400 }
    );
  }
}

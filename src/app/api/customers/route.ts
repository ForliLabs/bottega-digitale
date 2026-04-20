import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();

  if (!business) {
    const { customersStore } = await import("@/lib/data");
    const customers = await customersStore.findAll();
    return Response.json(customers);
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
    const business = await getBusinessContext();

    if (!business) {
      const { customersStore, createDemoId } = await import("@/lib/data");
      const customer = {
        id: payload.id ?? createDemoId("customer"),
        name: payload.name ?? "Nuovo cliente",
        phone: payload.phone ?? "+39 0543 000000",
        lastVisit: payload.lastVisit ?? new Date().toISOString(),
        totalVisits: payload.totalVisits ?? 1,
        loyaltyPoints: payload.loyaltyPoints ?? 10,
      };
      const created = await customersStore.create(customer);
      return Response.json(created, { status: 201 });
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

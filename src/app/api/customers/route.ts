import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/api-response";
import { createCustomerSchema } from "@/lib/validations/customers";

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
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  try {
    const payload = await request.json();
    const business = await requireBusinessContext();

    if (!business) {
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const result = createCustomerSchema.safeParse(payload);
    if (!result.success) {
      return Response.json(
        { error: "Dati non validi", details: result.error.issues },
        { status: 400 },
      );
    }

    const data = result.data;
    const customer = await prisma.customer.create({
      data: {
        businessId: business.id,
        name: data.name,
        phone: data.phone,
        email: data.email ?? null,
        birthday: data.birthday ? new Date(data.birthday) : null,
        lastVisit: new Date(),
        totalVisits: data.totalVisits,
        loyaltyPoints: data.loyaltyPoints,
        notifyWhatsApp: data.notifyWhatsApp,
        notifyPush: data.notifyPush,
      },
    });

    return Response.json(customer, { status: 201 });
  } catch {
    return Response.json(
      { error: "Richiesta non valida per la creazione del cliente." },
      { status: 400 },
    );
  }
}

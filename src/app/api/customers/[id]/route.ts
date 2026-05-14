import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/api-response";
import { updateCustomerSchema } from "@/lib/validations/customers";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const business = await requireBusinessContext();

  if (!business) {
    return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const customer = await prisma.customer.findFirst({
    where: { id, businessId: business.id },
  });

  if (!customer) {
    return Response.json({ error: "Cliente non trovato" }, { status: 404 });
  }

  return Response.json(customer);
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
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const existing = await prisma.customer.findFirst({
      where: { id, businessId: business.id },
    });

    if (!existing) {
      return Response.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    const payload = await request.json();
    const result = updateCustomerSchema.safeParse(payload);
    if (!result.success) {
      return Response.json(
        { error: "Dati non validi", details: result.error.issues },
        { status: 400 },
      );
    }

    const data = result.data;
    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.birthday !== undefined && {
          birthday: data.birthday ? new Date(data.birthday) : null,
        }),
        ...(data.totalVisits !== undefined && { totalVisits: data.totalVisits }),
        ...(data.loyaltyPoints !== undefined && { loyaltyPoints: data.loyaltyPoints }),
        ...(data.notifyWhatsApp !== undefined && { notifyWhatsApp: data.notifyWhatsApp }),
        ...(data.notifyPush !== undefined && { notifyPush: data.notifyPush }),
      },
    });

    return Response.json(updated);
  } catch {
    return Response.json(
      { error: "Errore nell'aggiornamento del cliente." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrfError = ensureSameOrigin(_request);
  if (csrfError) return csrfError;

  try {
    const { id } = await params;
    const business = await requireBusinessContext();

    if (!business) {
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const existing = await prisma.customer.findFirst({
      where: { id, businessId: business.id },
    });

    if (!existing) {
      return Response.json({ error: "Cliente non trovato" }, { status: 404 });
    }

    await prisma.customer.delete({ where: { id } });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Errore nella cancellazione del cliente." },
      { status: 500 },
    );
  }
}

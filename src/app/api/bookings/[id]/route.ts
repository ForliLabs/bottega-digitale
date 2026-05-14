import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/api-response";
import { updateBookingSchema } from "@/lib/validations/bookings";

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

  const booking = await prisma.booking.findFirst({
    where: { id, businessId: business.id },
  });

  if (!booking) {
    return Response.json({ error: "Prenotazione non trovata" }, { status: 404 });
  }

  return Response.json(booking);
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

    const existing = await prisma.booking.findFirst({
      where: { id, businessId: business.id },
    });

    if (!existing) {
      return Response.json({ error: "Prenotazione non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const result = updateBookingSchema.safeParse(payload);
    if (!result.success) {
      return Response.json(
        { error: "Dati non validi", details: result.error.issues },
        { status: 400 },
      );
    }

    const data = result.data;
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(data.customerName !== undefined && { customerName: data.customerName }),
        ...(data.service !== undefined && { service: data.service }),
        ...(data.startsAt !== undefined && { startsAt: new Date(data.startsAt) }),
        ...(data.durationMinutes !== undefined && { durationMinutes: data.durationMinutes }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.channel !== undefined && { channel: data.channel }),
        ...(data.priceEuro !== undefined && { priceEuro: data.priceEuro }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.customerId !== undefined && { customerId: data.customerId }),
      },
    });

    return Response.json(updated);
  } catch {
    return Response.json(
      { error: "Errore nell'aggiornamento della prenotazione." },
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

    const existing = await prisma.booking.findFirst({
      where: { id, businessId: business.id },
    });

    if (!existing) {
      return Response.json({ error: "Prenotazione non trovata" }, { status: 404 });
    }

    await prisma.booking.delete({ where: { id } });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Errore nella cancellazione della prenotazione." },
      { status: 500 },
    );
  }
}

import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { ensureSameOrigin } from "@/lib/api-response";
import { createBookingSchema } from "@/lib/validations/bookings";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();

  if (!business) {
    return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { businessId: business.id },
    orderBy: { startsAt: "asc" },
  });
  return Response.json(bookings);
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

    const result = createBookingSchema.safeParse(payload);
    if (!result.success) {
      return Response.json(
        { error: "Dati non validi", details: result.error.issues },
        { status: 400 },
      );
    }

    const data = result.data;
    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        customerName: data.customerName,
        service: data.service,
        startsAt: new Date(data.startsAt),
        durationMinutes: data.durationMinutes,
        status: data.status,
        channel: data.channel,
        priceEuro: data.priceEuro,
        notes: data.notes ?? null,
        customerId: data.customerId ?? null,
      },
    });

    return Response.json(booking, { status: 201 });
  } catch {
    return Response.json(
      { error: "Richiesta non valida per la creazione della prenotazione." },
      { status: 400 },
    );
  }
}

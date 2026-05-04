import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";

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
  try {
    const payload = await request.json();
    const business = await requireBusinessContext();

    if (!business) {
      return Response.json({ error: "Autenticazione richiesta" }, { status: 401 });
    }

    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        customerName: payload.customerName ?? "Cliente senza nome",
        service: payload.service ?? "Taglio classico",
        startsAt: new Date(payload.startsAt ?? new Date()),
        durationMinutes: payload.durationMinutes ?? 30,
        status: payload.status ?? "Confermata",
        channel: payload.channel ?? "Sito web",
        priceEuro: payload.priceEuro ?? 22,
        notes: payload.notes ?? null,
        customerId: payload.customerId ?? null,
      },
    });

    return Response.json(booking, { status: 201 });
  } catch {
    return Response.json(
      { error: "Richiesta non valida per la creazione della prenotazione." },
      { status: 400 }
    );
  }
}

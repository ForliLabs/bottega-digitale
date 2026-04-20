import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();

  // Fallback to in-memory store if no database business exists
  if (!business) {
    const { bookingsStore } = await import("@/lib/data");
    const bookings = await bookingsStore.findAll();
    return Response.json(bookings);
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
    const business = await getBusinessContext();

    if (!business) {
      // Fallback to in-memory store
      const { bookingsStore, createDemoId } = await import("@/lib/data");
      const booking = {
        id: payload.id ?? createDemoId("booking"),
        customerName: payload.customerName ?? "Cliente senza nome",
        service: payload.service ?? "Taglio classico",
        startsAt: payload.startsAt ?? new Date().toISOString(),
        durationMinutes: payload.durationMinutes ?? 30,
        status: payload.status ?? "Confermata",
        channel: payload.channel ?? "Sito web",
        priceEuro: payload.priceEuro ?? 22,
        notes: payload.notes,
      };
      const created = await bookingsStore.create(booking);
      return Response.json(created, { status: 201 });
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

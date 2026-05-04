import { prisma } from "@/lib/prisma";
import { emitEvent } from "@/lib/event-bus";
import { checkRateLimit, validateInput } from "@/lib/security";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

// Public booking creation endpoint — no auth required
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { businessId, slug, serviceId, serviceName, startsAt, customerName, customerPhone, notes } = payload;
    const normalizedPhone = customerPhone ? normalizePhoneNumber(customerPhone) : undefined;

    const errors = validateInput(
      {
        customerName,
        startsAt,
        customerPhone: normalizedPhone,
      },
      [
        { field: "customerName", type: "string", required: true, minLength: 2, maxLength: 80 },
        { field: "startsAt", type: "date", required: true },
        { field: "customerPhone", type: "phone" },
      ],
    );

    if (errors.length > 0) {
      return Response.json({ error: errors[0].message }, { status: 400 });
    }

    if (normalizedPhone && !isValidPhoneNumber(normalizedPhone)) {
      return Response.json({ error: "Numero di telefono non valido" }, { status: 400 });
    }

    // Resolve business
    let business;
    if (businessId) {
      business = await prisma.business.findUnique({ where: { id: businessId } });
    } else if (slug) {
      business = await prisma.business.findUnique({ where: { slug } });
    }

    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    if (!business.onlineBookingEnabled) {
      return Response.json({ error: "Prenotazioni online non attive per questa attività" }, { status: 403 });
    }

    const rateLimitKey = normalizedPhone || request.headers.get("x-forwarded-for") || "anonymous";
    const rateLimit = await checkRateLimit("booking", `${business.id}:${rateLimitKey}`);
    if (!rateLimit.allowed) {
      return Response.json({ error: "Troppi tentativi di prenotazione. Riprova più tardi." }, { status: 429 });
    }

    // Resolve service
    let resolvedServiceName = serviceName || "Servizio generico";
    let durationMinutes = 30;
    let priceEuro = 0;

    if (serviceId) {
      const service = await prisma.service.findFirst({ where: { id: serviceId, businessId: business.id } });
      if (!service) {
        return Response.json({ error: "Servizio non disponibile" }, { status: 404 });
      }
      resolvedServiceName = service.name;
      durationMinutes = service.durationMinutes;
      priceEuro = service.priceEuro;
    }

    const bookingStart = new Date(startsAt);
    if (Number.isNaN(bookingStart.getTime()) || bookingStart <= new Date()) {
      return Response.json({ error: "Seleziona un orario futuro valido" }, { status: 400 });
    }

    const bookingEnd = new Date(bookingStart.getTime() + durationMinutes * 60 * 1000);

    const activeBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: { in: ["Confermata", "In attesa"] },
        startsAt: {
          gte: new Date(bookingStart.getTime() - 24 * 60 * 60 * 1000),
          lte: new Date(bookingEnd.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: { startsAt: true, durationMinutes: true },
    });

    const conflicts = activeBookings.some((booking) => {
      const existingStart = new Date(booking.startsAt);
      const existingEnd = new Date(existingStart.getTime() + booking.durationMinutes * 60 * 1000);
      return bookingStart < existingEnd && bookingEnd > existingStart;
    });

    if (conflicts) {
      return Response.json({ error: "Questo orario non è più disponibile. Scegli un altro slot." }, { status: 409 });
    }

    // Find or create customer
    let customerId: string | null = null;
    if (normalizedPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { businessId: business.id, phone: normalizedPhone },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
        await prisma.customer.update({
          where: { id: existingCustomer.id },
          data: { lastVisit: new Date(), totalVisits: { increment: 1 } },
        });
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            businessId: business.id,
            name: customerName,
            phone: normalizedPhone,
            lastVisit: new Date(),
          },
        });
        customerId = newCustomer.id;

        await emitEvent({
          type: "customer.created",
          businessId: business.id,
          data: { customerId: newCustomer.id, customerName, customerPhone: normalizedPhone },
          timestamp: new Date(),
        });
      }
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        businessId: business.id,
        customerId,
        serviceId: serviceId || null,
        customerName,
        customerPhone: normalizedPhone || null,
        service: resolvedServiceName,
        startsAt: bookingStart,
        durationMinutes,
        status: "Confermata",
        channel: "Online",
        priceEuro,
        notes: notes || null,
      },
    });

    // Emit booking.created event for automation engine
    await emitEvent({
      type: "booking.created",
      businessId: business.id,
      data: {
        bookingId: booking.id,
        customerId,
        customerName,
        customerPhone: normalizedPhone,
        service: resolvedServiceName,
        startsAt: bookingStart.toISOString(),
      },
      timestamp: new Date(),
    });

    return Response.json({
      booking: {
        id: booking.id,
        customerName: booking.customerName,
        service: booking.service,
        startsAt: booking.startsAt,
        status: booking.status,
      },
      message: "Prenotazione confermata! Ti aspettiamo.",
    }, { status: 201 });
  } catch {
    return Response.json({ error: "Errore nella creazione della prenotazione" }, { status: 400 });
  }
}

import { prisma } from "@/lib/prisma";
import { emitEvent } from "@/lib/event-bus";

export const dynamic = "force-dynamic";

// Public booking creation endpoint — no auth required
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { businessId, slug, serviceId, serviceName, startsAt, customerName, customerPhone, notes } = payload;

    if (!customerName || !startsAt) {
      return Response.json({ error: "Nome e orario sono obbligatori" }, { status: 400 });
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

    // Resolve service
    let resolvedServiceName = serviceName || "Servizio generico";
    let durationMinutes = 30;
    let priceEuro = 0;

    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (service) {
        resolvedServiceName = service.name;
        durationMinutes = service.durationMinutes;
        priceEuro = service.priceEuro;
      }
    }

    // Check for double-booking (optimistic locking)
    const bookingStart = new Date(startsAt);
    const bookingEnd = new Date(bookingStart.getTime() + durationMinutes * 60 * 1000);

    const conflicts = await prisma.booking.count({
      where: {
        businessId: business.id,
        status: { in: ["Confermata", "In attesa"] },
        startsAt: { lt: bookingEnd },
        AND: {
          startsAt: {
            gte: new Date(bookingStart.getTime() - durationMinutes * 60 * 1000),
          },
        },
      },
    });

    if (conflicts > 0) {
      return Response.json({ error: "Questo orario non è più disponibile. Scegli un altro slot." }, { status: 409 });
    }

    // Find or create customer
    let customerId: string | null = null;
    if (customerPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { businessId: business.id, phone: customerPhone },
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
            phone: customerPhone,
            lastVisit: new Date(),
          },
        });
        customerId = newCustomer.id;

        // Emit customer.created event
        await emitEvent({
          type: "customer.created",
          businessId: business.id,
          data: { customerId: newCustomer.id, customerName, customerPhone },
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
        customerPhone: customerPhone || null,
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
        customerPhone,
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

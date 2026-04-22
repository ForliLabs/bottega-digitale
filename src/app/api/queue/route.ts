import { prisma } from "@/lib/prisma";

// Public queue API: join queue + check status (no auth required for customers)

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const entryId = url.searchParams.get("entryId");

  if (!businessId) {
    return Response.json({ error: "businessId richiesto." }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || !business.queueEnabled) {
    return Response.json({ error: "Coda non attiva per questa attività." }, { status: 404 });
  }

  const waitingEntries = await prisma.queueEntry.findMany({
    where: { businessId, status: { in: ["waiting", "called"] } },
    orderBy: { position: "asc" },
  });

  if (entryId) {
    const entry = waitingEntries.find((e) => e.id === entryId);
    return Response.json({
      businessName: business.name,
      entry: entry || null,
      position: entry ? waitingEntries.findIndex((e) => e.id === entryId) + 1 : null,
      totalWaiting: waitingEntries.length,
      estimatedWaitMin: entry
        ? waitingEntries.findIndex((e) => e.id === entryId) * business.avgServiceMinutes
        : null,
    });
  }

  return Response.json({
    businessName: business.name,
    totalWaiting: waitingEntries.length,
    estimatedWaitMin: waitingEntries.length * business.avgServiceMinutes,
    entries: waitingEntries.map((e, i) => ({
      id: e.id,
      name: e.customerName,
      position: i + 1,
      status: e.status,
      estimatedWaitMin: i * business.avgServiceMinutes,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const { businessId, customerName, customerPhone } = await request.json();

    if (!businessId || !customerName) {
      return Response.json({ error: "businessId e nome sono obbligatori." }, { status: 400 });
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.queueEnabled) {
      return Response.json({ error: "Coda non attiva." }, { status: 404 });
    }

    const lastEntry = await prisma.queueEntry.findFirst({
      where: { businessId, status: { in: ["waiting", "called"] } },
      orderBy: { position: "desc" },
    });

    const position = (lastEntry?.position || 0) + 1;

    const entry = await prisma.queueEntry.create({
      data: {
        businessId,
        customerName,
        customerPhone: customerPhone || null,
        position,
        estimatedWaitMin: (position - 1) * business.avgServiceMinutes,
      },
    });

    // Auto-create CRM entry if phone provided
    if (customerPhone) {
      const existingCustomer = await prisma.customer.findFirst({
        where: { businessId, phone: customerPhone },
      });
      if (!existingCustomer) {
        await prisma.customer.create({
          data: {
            businessId,
            name: customerName,
            phone: customerPhone,
            lastVisit: new Date(),
            totalVisits: 1,
            loyaltyPoints: 0,
          },
        });
      }
    }

    return Response.json(
      { id: entry.id, position, estimatedWaitMin: entry.estimatedWaitMin },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Errore aggiunta alla coda." }, { status: 500 });
  }
}

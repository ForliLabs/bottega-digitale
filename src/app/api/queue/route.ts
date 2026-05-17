import { getBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const ACTIVE_QUEUE_STATUSES = ["waiting", "called", "serving"] as const;
const MANAGEABLE_QUEUE_STATUSES = ["called", "serving", "completed", "cancelled"] as const;

async function rebalanceQueuePositions(businessId: string, avgServiceMinutes: number) {
  const activeEntries = await prisma.queueEntry.findMany({
    where: { businessId, status: { in: [...ACTIVE_QUEUE_STATUSES] } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  await Promise.all(
    activeEntries.map((entry, index) =>
      prisma.queueEntry.update({
        where: { id: entry.id },
        data: {
          position: index + 1,
          estimatedWaitMin: index * avgServiceMinutes,
        },
      })
    )
  );
}

// Public queue API: join queue + check status (no auth required for customers)
// When called without `businessId`, falls back to the authenticated dashboard view.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const businessId = url.searchParams.get("businessId");
  const entryId = url.searchParams.get("entryId");

  // ── Authenticated dashboard mode (no businessId query param) ──────────────
  if (!businessId) {
    const business = await getBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }
    const entries = await prisma.queueEntry.findMany({
      where: { businessId: business.id, status: { in: [...ACTIVE_QUEUE_STATUSES] } },
      orderBy: { position: "asc" },
    });
    const todayCompleted = await prisma.queueEntry.count({
      where: {
        businessId: business.id,
        status: "completed",
        completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    return apiJson({
      entries: entries.map((e) => ({
        id: e.id,
        customerName: e.customerName,
        customerPhone: e.customerPhone ?? null,
        position: e.position,
        status: e.status,
      })),
      todayCompleted,
    });
  }

  // ── Public mode (businessId provided, no auth needed) ────────────────────
  const business = await prisma.business.findUnique({ where: { id: businessId } });
  if (!business || !business.queueEnabled) {
    return apiError("Coda non attiva per questa attività.", 404, "queue_not_enabled");
  }

  const waitingEntries = await prisma.queueEntry.findMany({
    where: { businessId, status: { in: ["waiting", "called"] } },
    orderBy: { position: "asc" },
  });

  if (entryId) {
    const entry = waitingEntries.find((e) => e.id === entryId);
    return apiJson({
      businessName: business.name,
      entry: entry || null,
      position: entry ? waitingEntries.findIndex((e) => e.id === entryId) + 1 : null,
      totalWaiting: waitingEntries.length,
      estimatedWaitMin: entry
        ? waitingEntries.findIndex((e) => e.id === entryId) * business.avgServiceMinutes
        : null,
    });
  }

  return apiJson({
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
      return apiError("businessId e nome sono obbligatori.", 400, "missing_queue_fields");
    }

    const business = await prisma.business.findUnique({ where: { id: businessId } });
    if (!business || !business.queueEnabled) {
      return apiError("Coda non attiva.", 404, "queue_not_enabled");
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

    return apiJson(
      { id: entry.id, position, estimatedWaitMin: entry.estimatedWaitMin },
      { status: 201 }
    );
  } catch {
    return apiError("Errore aggiunta alla coda.", 500, "queue_join_failed");
  }
}

export async function PATCH(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await getBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  const { entryId, status } = await request.json();
  if (!entryId || !MANAGEABLE_QUEUE_STATUSES.includes(status)) {
    return apiError("Aggiornamento coda non valido", 400, "invalid_queue_update");
  }

  const data: Record<string, Date | string | null> = { status };
  if (status === "called") {
    data.calledAt = new Date();
  }
  if (status === "completed" || status === "cancelled") {
    data.completedAt = new Date();
  }

  const updated = await prisma.queueEntry.updateMany({
    where: { id: entryId, businessId: business.id },
    data,
  });
  if (updated.count === 0) {
    return apiError("Voce coda non trovata", 404, "queue_entry_not_found");
  }

  await rebalanceQueuePositions(business.id, business.avgServiceMinutes);
  return apiJson({ success: true });
}

export async function DELETE(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  const business = await getBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
  }

  try {
    const { entryId } = await request.json();

    if (!entryId) {
      return apiError("entryId richiesto.", 400, "missing_queue_identifier");
    }

    if (!business.queueEnabled) {
      return apiError("Coda non attiva.", 404, "queue_not_enabled");
    }

    const updated = await prisma.queueEntry.updateMany({
      where: {
        id: entryId,
        businessId: business.id,
        status: { in: [...ACTIVE_QUEUE_STATUSES] },
      },
      data: {
        status: "cancelled",
        completedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return apiError("Voce coda non trovata", 404, "queue_entry_not_found");
    }

    await rebalanceQueuePositions(business.id, business.avgServiceMinutes);
    return apiJson({ success: true });
  } catch {
    return apiError("Errore nella cancellazione della coda.", 500, "queue_delete_failed");
  }
}

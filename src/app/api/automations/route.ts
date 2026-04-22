import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { seedDefaultFlows, FLOW_TEMPLATES } from "@/lib/event-bus";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await getBusinessContext();
  if (!business) {
    return Response.json({ flows: [], templates: FLOW_TEMPLATES });
  }

  // Seed defaults if none exist
  const count = await prisma.automationFlow.count({ where: { businessId: business.id } });
  if (count === 0) {
    await seedDefaultFlows(business.id);
  }

  const flows = await prisma.automationFlow.findMany({
    where: { businessId: business.id },
    include: { executions: { orderBy: { startedAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "asc" },
  });

  return Response.json({ flows, templates: FLOW_TEMPLATES });
}

export async function POST(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const flow = await prisma.automationFlow.create({
      data: {
        businessId: business.id,
        name: payload.name || "Nuovo flusso",
        description: payload.description || null,
        triggerEvent: payload.triggerEvent || "booking.created",
        actions: JSON.stringify(payload.actions || []),
        enabled: payload.enabled ?? false,
      },
    });

    return Response.json(flow, { status: 201 });
  } catch {
    return Response.json({ error: "Errore nella creazione del flusso" }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const business = await getBusinessContext();
    if (!business) {
      return Response.json({ error: "Attività non trovata" }, { status: 404 });
    }

    const payload = await request.json();
    const { id, ...updates } = payload;

    if (updates.actions && typeof updates.actions !== "string") {
      updates.actions = JSON.stringify(updates.actions);
    }

    const flow = await prisma.automationFlow.update({
      where: { id },
      data: updates,
    });

    return Response.json(flow);
  } catch {
    return Response.json({ error: "Errore nell'aggiornamento del flusso" }, { status: 400 });
  }
}

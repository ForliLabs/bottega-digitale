import { prisma } from "@/lib/prisma";
import { requireBusinessContext } from "@/lib/auth";
import { apiError, apiJson, ensureSameOrigin } from "@/lib/api-response";
import { seedDefaultFlows, FLOW_TEMPLATES } from "@/lib/event-bus";

export const dynamic = "force-dynamic";

export async function GET() {
  const business = await requireBusinessContext();
  if (!business) {
    return apiError("Autenticazione richiesta", 401, "unauthorized");
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

  return apiJson({ flows, templates: FLOW_TEMPLATES });
}

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
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

    return apiJson(flow, { status: 201 });
  } catch {
    return apiError("Errore nella creazione del flusso", 500, "automation_create_failed");
  }
}

export async function PATCH(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) {
    return csrfError;
  }

  try {
    const business = await requireBusinessContext();
    if (!business) {
      return apiError("Autenticazione richiesta", 401, "unauthorized");
    }

    const payload = await request.json();
    const { id, ...updates } = payload;

    if (updates.actions && typeof updates.actions !== "string") {
      updates.actions = JSON.stringify(updates.actions);
    }

    const updated = await prisma.automationFlow.updateMany({
      where: { id, businessId: business.id },
      data: updates,
    });

    if (updated.count === 0) {
      return apiError("Flusso non trovato", 404, "automation_not_found");
    }

    const flow = await prisma.automationFlow.findFirst({ where: { id, businessId: business.id } });
    return apiJson(flow);
  } catch {
    return apiError("Errore nell'aggiornamento del flusso", 500, "automation_update_failed");
  }
}

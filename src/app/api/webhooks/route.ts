// Webhook Endpoints Management
import { getAuthContext } from "@/lib/auth";
import { createWebhookEndpoint, WEBHOOK_EVENTS } from "@/lib/webhook-api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { businessId: auth.business.id },
    include: {
      deliveries: { take: 5, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ endpoints, availableEvents: WEBHOOK_EVENTS });
}

export async function POST(request: Request) {
  const auth = await getAuthContext();
  if (!auth) return Response.json({ error: "Non autorizzato" }, { status: 401 });

  const body = await request.json();
  if (!body.url) {
    return Response.json({ error: "URL endpoint obbligatorio" }, { status: 400 });
  }

  try {
    new URL(body.url);
  } catch {
    return Response.json({ error: "URL non valido" }, { status: 400 });
  }

  const endpoint = await createWebhookEndpoint({
    businessId: auth.business.id,
    url: body.url,
    events: body.events || "*",
  });

  return Response.json(endpoint, { status: 201 });
}

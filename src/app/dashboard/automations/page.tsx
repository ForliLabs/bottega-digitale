export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { FLOW_TEMPLATES, seedDefaultFlows } from "@/lib/event-bus";
import { AutomationsClient } from "./automations-client";

export default async function AutomationsPage() {
  const business = await getBusinessContext();

  if (!business) {
    return null;
  }

  const count = await prisma.automationFlow.count({ where: { businessId: business.id } });
  if (count === 0) {
    await seedDefaultFlows(business.id);
  }

  const flows = await prisma.automationFlow.findMany({
    where: { businessId: business.id },
    include: { executions: { orderBy: { startedAt: "desc" }, take: 5 } },
    orderBy: { createdAt: "asc" },
  });

  return <AutomationsClient initialFlows={flows.map((flow) => ({
    ...flow,
    executions: flow.executions.map((execution) => ({
      id: execution.id,
      status: execution.status,
      startedAt: execution.startedAt.toISOString(),
    })),
  }))} templates={FLOW_TEMPLATES} />;
}

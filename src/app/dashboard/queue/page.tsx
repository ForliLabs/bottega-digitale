export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { QueueDashboardClient } from "./queue-dashboard-client";

export default async function QueuePage() {
  const business = await getBusinessContext();

  const entries = business
    ? await prisma.queueEntry.findMany({
        where: { businessId: business.id, status: { in: ["waiting", "called", "serving"] } },
        orderBy: { position: "asc" },
      })
    : [];

  const todayCompleted = business
    ? await prisma.queueEntry.count({
        where: {
          businessId: business.id,
          status: "completed",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      })
    : 0;

  return <QueueDashboardClient business={business ? { id: business.id, avgServiceMinutes: business.avgServiceMinutes } : null} initialEntries={entries} todayCompleted={todayCompleted} />;
}

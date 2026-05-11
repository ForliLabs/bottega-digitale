export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireBusinessContext } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/feedback";
import { StaffNotificationsClient } from "./staff-notifications-client";

export default async function StaffNotificationsPage() {
  const business = await requireBusinessContext();
  if (!business) {
    return (
      <EmptyState
        icon="🔐"
        title="Accedi per vedere le notifiche del team"
        description="Le notifiche staff sono disponibili solo con una sessione attiva collegata alla tua bottega."
        action={<Link href="/login" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Accedi</Link>}
      />
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      actionUrl: true,
      read: true,
      priority: true,
      type: true,
    },
  });

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon="🔔"
        title="Nessuna notifica da mostrare"
        description="Promemoria, richieste clienti e alert operativi appariranno qui appena disponibili."
        action={<Link href="/dashboard/notifications" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apri pannello notifiche</Link>}
      />
    );
  }

  return (
    <StaffNotificationsClient
      initialNotifications={notifications.map((notification) => ({
        ...notification,
        createdAt: notification.createdAt.toISOString(),
      }))}
    />
  );
}

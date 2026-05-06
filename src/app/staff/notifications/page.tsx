export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/feedback";

export default async function StaffNotificationsPage() {
  const business = await prisma.business.findFirst();
  const notifications = business
    ? await prisma.notification.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 10,
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Centro notifiche</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Aggiornamenti staff</h1>
      </div>
      {notifications.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Nessuna notifica da mostrare"
          description="Promemoria, richieste clienti e alert operativi appariranno qui appena disponibili."
          action={<Link href="/dashboard/notifications" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apri pannello notifiche</Link>}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <span className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleDateString("it-IT")}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{notification.body}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

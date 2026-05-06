export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function StaffProfilePage() {
  const business = await prisma.business.findFirst();
  const stats = business
    ? await prisma.booking.count({
        where: { businessId: business.id, startsAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      })
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Profilo staff</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Stato del turno</h1>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Attività corrente</p>
        <p className="mt-2 text-xl font-semibold text-slate-900">Disponibile al banco</p>
        <p className="mt-2 text-sm text-slate-600">Oggi ci sono {stats} appuntamenti pianificati. Usa la dashboard per aggiornare disponibilità e notifiche.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Link href="/staff" className="rounded-2xl border border-slate-200 bg-white p-4 text-center text-sm font-semibold text-slate-700 shadow-sm">Torna a oggi</Link>
        <Link href="/dashboard/staff" className="rounded-2xl bg-slate-900 p-4 text-center text-sm font-semibold text-white shadow-sm">Apri gestione team</Link>
      </div>
    </div>
  );
}

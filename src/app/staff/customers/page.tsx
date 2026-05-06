export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/feedback";

export default async function StaffCustomersPage() {
  const business = await prisma.business.findFirst();
  const customers = business
    ? await prisma.customer.findMany({
        where: { businessId: business.id },
        orderBy: { lastVisit: "desc" },
        take: 12,
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">Rubrica rapida</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Clienti recenti</h1>
      </div>
      {customers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="Nessun cliente disponibile"
          description="Appena arrivano nuovi clienti li vedrai qui con telefono e ultime visite."
          action={<Link href="/dashboard/customers" className="inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apri CRM completo</Link>}
        />
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{customer.name}</p>
                  <p className="text-sm text-slate-500">{customer.phone}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                  {customer.loyaltyPoints} punti
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ultima visita {new Date(customer.lastVisit).toLocaleDateString("it-IT")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

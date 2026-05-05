export const dynamic = "force-dynamic";
import Link from "next/link";
import { customersStore } from "@/lib/data";
import { EmptyState } from "@/components/ui/feedback";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function CustomersPage() {
  const customers = (await customersStore.findAll()).sort(
    (left, right) => Date.parse(right.lastVisit) - Date.parse(left.lastVisit)
  );

  const averageVisits = customers.length > 0
    ? (
        customers.reduce((total, customer) => total + customer.totalVisits, 0) / customers.length
      ).toFixed(1)
    : "0.0";
  const totalPoints = customers.reduce(
    (total, customer) => total + customer.loyaltyPoints,
    0
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Rubrica clienti
        </p>
        <h1 className="text-3xl font-bold text-slate-900">CRM della bottega</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Numeri di telefono, ultime visite e punti fedeltà sempre in ordine, pronti per richiamare i clienti migliori.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Clienti salvati</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{customers.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Visite medie</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{averageVisits}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Punti fedeltà totali</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalPoints}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Elenco clienti</h2>
          <p className="text-sm text-slate-500">Contatti pronti per promemoria, offerte e campagne fedeltà.</p>
        </div>
        {customers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon="👥"
              title="Il CRM è ancora vuoto"
              description="Aggiungi il primo cliente o importa la tua rubrica per attivare promemoria, loyalty e campagne."
              action={(
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/dashboard/bookings" className="inline-flex rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600">
                    Crea una prenotazione
                  </Link>
                  <Link href="/dashboard/loyalty" className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Configura loyalty
                  </Link>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Nome</th>
                  <th className="px-6 py-3 font-medium">Telefono</th>
                  <th className="px-6 py-3 font-medium">Ultima visita</th>
                  <th className="px-6 py-3 font-medium">Visite totali</th>
                  <th className="px-6 py-3 font-medium">Punti fedeltà</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4">{dateFormatter.format(new Date(customer.lastVisit))}</td>
                    <td className="px-6 py-4">{customer.totalVisits}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        {customer.loyaltyPoints} punti
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getDashboardCustomers } from "@/lib/dashboard-data";
import { CustomersManager } from "./customers-manager";

export default async function CustomersPage() {
  const { data: allCustomers } = await getDashboardCustomers();
  const customers = [...allCustomers].sort(
    (left, right) => Date.parse(right.lastVisit) - Date.parse(left.lastVisit)
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

      <CustomersManager initialCustomers={customers} />
    </div>
  );
}

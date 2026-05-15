export const dynamic = "force-dynamic";
import { getDashboardBookings, getDashboardBusinessProfile } from "@/lib/dashboard-data";
import { BookingsManager } from "./bookings-manager";

export default async function BookingsPage() {
  const { data: businessProfile } = await getDashboardBusinessProfile();
  const { data: allBookings } = await getDashboardBookings();
  const bookings = [...allBookings].sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)
  );

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Agenda prenotazioni
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Calendario appuntamenti</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Tutte le prossime prenotazioni di {businessProfile.name}, con gestione completa.
        </p>
      </section>

      <BookingsManager initialBookings={bookings} />
    </div>
  );
}

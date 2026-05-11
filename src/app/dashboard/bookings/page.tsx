export const dynamic = "force-dynamic";
import { bookingsStore, businessProfile } from "@/lib/data";
import { StatusBadge } from "@/components/ui/status-badge";

const dayFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

const timeFormatter = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

function sameCalendarDay(left: Date, right: Date) {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
}

export default async function BookingsPage() {
  const bookings = (await bookingsStore.findAll()).sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt)
  );

  const calendarDays = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);

    const items = bookings.filter((booking) =>
      sameCalendarDay(new Date(booking.startsAt), date)
    );

    return { date, items };
  });

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Agenda prenotazioni
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Calendario appuntamenti</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Tutte le prossime prenotazioni di {businessProfile.name}, con vista rapida per i prossimi sei giorni.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {calendarDays.map(({ date, items }) => (
          <div key={date.toISOString()} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{dayFormatter.format(date)}</p>
                <p className="text-xs text-slate-500">{items.length} slot occupati</p>
              </div>
              <StatusBadge
                tone={items.length > 0 ? "warning" : "neutral"}
                label={items.length > 0 ? "Attivo" : "Libero"}
                srLabel={items.length > 0 ? "Stato giorno: attivo" : "Stato giorno: libero"}
              />
            </div>
            <div className="mt-4 space-y-3">
              {items.length > 0 ? (
                items.map((booking) => (
                  <div key={booking.id} className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">{timeFormatter.format(new Date(booking.startsAt))} · {booking.customerName}</p>
                    <p>{booking.service}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                  Nessun appuntamento in agenda.
                </div>
              )}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Prossimi appuntamenti</h2>
          <p className="text-sm text-slate-500">Vista elenco per il team in bottega.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Servizio</th>
                <th className="px-6 py-3 font-medium">Quando</th>
                <th className="px-6 py-3 font-medium">Canale</th>
                <th className="px-6 py-3 font-medium">Stato</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 font-medium text-slate-900">{booking.customerName}</td>
                  <td className="px-6 py-4">{booking.service}</td>
                  <td className="px-6 py-4">
                    {dayFormatter.format(new Date(booking.startsAt))} · {timeFormatter.format(new Date(booking.startsAt))}
                  </td>
                  <td className="px-6 py-4">{booking.channel}</td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      tone={booking.status === "Confermata" ? "success" : "warning"}
                      label={booking.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

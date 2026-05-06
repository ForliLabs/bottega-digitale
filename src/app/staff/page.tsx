// Staff "Today" View — Mobile-optimized booking list
export const dynamic = "force-dynamic";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function StaffTodayPage() {
  // In production, get staff from session. For now, show demo view.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Get first business's bookings for today (demo mode)
  const business = await prisma.business.findFirst();
  const bookings = business
    ? await prisma.booking.findMany({
        where: {
          businessId: business.id,
          startsAt: { gte: today, lt: tomorrow },
        },
        orderBy: { startsAt: "asc" },
        take: 20,
      })
    : [];

  const now = new Date();
  const completedCount = bookings.filter((b) => b.status === "Completata").length;
  const nextBooking = bookings.find((b) => new Date(b.startsAt) > now && b.status !== "Cancellata");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm text-slate-500">
          {today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">I miei appuntamenti</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-blue-50 p-3 text-center">
          <p className="text-xl font-bold text-blue-700">{bookings.length}</p>
          <p className="text-[10px] text-blue-600">Totale oggi</p>
        </div>
        <div className="rounded-xl bg-green-50 p-3 text-center">
          <p className="text-xl font-bold text-green-700">{completedCount}</p>
          <p className="text-[10px] text-green-600">Completati</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3 text-center">
          <p className="text-xl font-bold text-amber-700">{bookings.length - completedCount}</p>
          <p className="text-[10px] text-amber-600">Rimanenti</p>
        </div>
      </div>

      {/* Next Client Alert */}
      {nextBooking && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase text-blue-600">Prossimo cliente</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{nextBooking.customerName}</p>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-sm text-slate-600">
              {new Date(nextBooking.startsAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
            </span>
            <span className="text-sm text-slate-600">·</span>
            <span className="text-sm text-slate-600">{nextBooking.service}</span>
          </div>
          {nextBooking.customerPhone && (
            <a
              href={`tel:${nextBooking.customerPhone}`}
              className="mt-3 inline-flex items-center gap-1 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white"
            >
              📞 Chiama cliente
            </a>
          )}
        </div>
      )}

      {/* Booking List */}
      {bookings.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center">
          <p className="text-3xl">🎉</p>
          <p className="mt-2 text-sm font-semibold text-slate-900">Nessun appuntamento oggi</p>
          <p className="mt-1 text-xs text-slate-500">Goditi la giornata libera!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const time = new Date(booking.startsAt).toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isPast = new Date(booking.startsAt) < now;
            const isCompleted = booking.status === "Completata";

            return (
              <div
                key={booking.id}
                className={`rounded-xl border bg-white p-4 ${
                  isCompleted
                    ? "border-green-200 opacity-60"
                    : isPast
                      ? "border-amber-200"
                      : "border-slate-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{time}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isCompleted
                          ? "bg-green-100 text-green-700"
                          : booking.status === "In attesa"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-slate-900">{booking.customerName}</p>
                    <p className="text-xs text-slate-500">{booking.service} · {booking.durationMinutes} min</p>
                  </div>
                  <div className="flex gap-1">
                    {booking.customerPhone && (
                      <a
                        href={`tel:${booking.customerPhone}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm"
                        title="Chiama"
                      >
                        📞
                      </a>
                    )}
                  </div>
                </div>
                {booking.notes && (
                  <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-600">
                    📝 {booking.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase text-slate-500">Azioni rapide</h3>
        <div className="grid grid-cols-2 gap-2">
          <Link href="/dashboard/queue" className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <span className="text-lg" aria-hidden="true">🎟️</span>
            <p className="mt-1 text-xs font-medium text-slate-700">Apri coda</p>
          </Link>
          <Link href="/staff/profile" className="rounded-xl border border-slate-200 bg-white p-3 text-center">
            <span className="text-lg" aria-hidden="true">☕</span>
            <p className="mt-1 text-xs font-medium text-slate-700">Gestisci stato</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

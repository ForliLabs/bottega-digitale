export const dynamic = "force-dynamic";
import Link from "next/link";
import { StatCard } from "@/components/dashboard";
import {
  bookingsStore,
  businessProfile,
  calculateDashboardMetrics,
  customersStore,
  sampleReviews,
} from "@/lib/data";

const numberFormatter = new Intl.NumberFormat("it-IT");
const dateTimeFormatter = new Intl.DateTimeFormat("it-IT", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function DashboardPage() {
  const bookings = await bookingsStore.findAll();
  const customers = await customersStore.findAll();
  const metrics = calculateDashboardMetrics(bookings, customers, sampleReviews);
  const recentBookings = [...bookings]
    .sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt))
    .slice(0, 5);

  const quickActions = [
    {
      title: "Apri agenda prenotazioni",
      description: "Controlla appuntamenti, disponibilità e conferme della giornata.",
      href: "/dashboard/bookings",
      accent: "bg-amber-100 text-amber-900",
    },
    {
      title: "Modifica sito",
      description: "Aggiorna copertina, servizi e pulsanti del sito generato.",
      href: "/dashboard/website",
      accent: "bg-emerald-100 text-emerald-900",
    },
    {
      title: "Leggi recensioni",
      description: "Rispondi ai feedback e scopri come stanno parlando della tua attività.",
      href: "/dashboard/reviews",
      accent: "bg-sky-100 text-sky-900",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Demo negozio di Forlì
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              {businessProfile.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {businessProfile.description} Gestisci prenotazioni, clienti e reputazione da un unico pannello.
            </p>
          </div>
          <div className="rounded-2xl border border-white/80 bg-white/90 p-4 text-sm text-slate-600 shadow-sm">
            <p className="font-semibold text-slate-900">{businessProfile.address}</p>
            <p>{businessProfile.phone} · {businessProfile.email}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Visite sito"
          value={numberFormatter.format(metrics.websiteVisits)}
          change="+18% rispetto al mese scorso"
          trend="up"
        />
        <StatCard
          label="Prenotazioni oggi"
          value={String(metrics.bookingsToday)}
          change="Agenda quasi piena"
          trend="up"
        />
        <StatCard
          label="Nuovi clienti"
          value={String(metrics.newCustomersThisMonth)}
          change="Questo mese"
          trend="neutral"
        />
        <StatCard
          label="Recensioni"
          value={`${metrics.averageRating.toLocaleString("it-IT", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })} ★`}
          change={`${metrics.reviewsCount} recensioni pubblicate`}
          trend="up"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${action.accent}`}>
              Azione rapida
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">{action.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Prenotazioni recenti</h2>
            <p className="text-sm text-slate-500">Le prossime visite confermate o in attesa.</p>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium text-slate-900">{booking.customerName}</p>
                  <p className="text-sm text-slate-500">
                    {booking.service} · {dateTimeFormatter.format(new Date(booking.startsAt))}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                    {booking.channel}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-medium ${
                      booking.status === "Confermata"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Bottega in sintesi</h2>
          <dl className="mt-5 space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between gap-4">
              <dt>Categoria</dt>
              <dd className="font-medium text-slate-900">{businessProfile.category}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Tempo medio di anticipo</dt>
              <dd className="font-medium text-slate-900">{businessProfile.bookingLeadTime}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt>Servizi online</dt>
              <dd className="font-medium text-slate-900">{businessProfile.services.length}</dd>
            </div>
          </dl>
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-900">Orari pubblicati</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              {businessProfile.openingHours.map((openingHour) => (
                <li key={openingHour}>{openingHour}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

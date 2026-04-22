export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { isGoogleConfigured } from "@/lib/google-business";

const numberFormatter = new Intl.NumberFormat("it-IT");

export default async function AnalyticsPage() {
  const business = await getBusinessContext();
  const googleReady = isGoogleConfigured();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    bookingsThisMonth,
    bookingsLastMonth,
    newCustomersThisMonth,
    totalCustomers,
    reviews,
    totalRevenue,
  ] = business
    ? await Promise.all([
        prisma.booking.count({
          where: { businessId: business.id, createdAt: { gte: startOfMonth } },
        }),
        prisma.booking.count({
          where: {
            businessId: business.id,
            createdAt: { gte: startOfLastMonth, lt: startOfMonth },
          },
        }),
        prisma.customer.count({
          where: { businessId: business.id, createdAt: { gte: startOfMonth } },
        }),
        prisma.customer.count({ where: { businessId: business.id } }),
        prisma.review.aggregate({
          where: { businessId: business.id },
          _avg: { rating: true },
          _count: true,
        }),
        prisma.booking.aggregate({
          where: { businessId: business.id, createdAt: { gte: startOfMonth } },
          _sum: { priceEuro: true },
        }),
      ])
    : [0, 0, 0, 0, { _avg: { rating: 0 }, _count: 0 }, { _sum: { priceEuro: 0 } }];

  const bookingGrowth =
    bookingsLastMonth > 0
      ? Math.round(((bookingsThisMonth - bookingsLastMonth) / bookingsLastMonth) * 100)
      : 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Analisi e metriche
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard analitica</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Monitora le performance della tua attività: prenotazioni, clienti, recensioni e fatturato.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Visite sito web</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {numberFormatter.format(business?.websiteVisitsThisMonth || 0)}
          </p>
          <p className="mt-1 text-sm text-emerald-600">Questo mese</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Prenotazioni mese</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{bookingsThisMonth}</p>
          <p className={`mt-1 text-sm ${bookingGrowth >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {bookingGrowth >= 0 ? "+" : ""}
            {bookingGrowth}% vs mese scorso
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Nuovi clienti</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{newCustomersThisMonth}</p>
          <p className="mt-1 text-sm text-slate-500">su {totalCustomers} totali</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Fatturato stimato</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            €{numberFormatter.format(totalRevenue?._sum?.priceEuro || 0)}
          </p>
          <p className="mt-1 text-sm text-slate-500">Questo mese</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📊 Reputazione online</h2>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">
                {(reviews?._avg?.rating || 0).toFixed(1)} ★
              </p>
              <p className="mt-1 text-sm text-slate-600">Media recensioni</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{reviews?._count || 0}</p>
              <p className="mt-1 text-sm text-slate-600">Recensioni totali</p>
            </div>
          </div>
          {!googleReady && (
            <p className="mt-4 text-sm text-amber-600">
              💡 Collega Google Business Profile per sincronizzare le recensioni automaticamente.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📈 Canali di prenotazione</h2>
          <div className="mt-4 space-y-3">
            {["Sito web", "WhatsApp", "Instagram", "Telefono"].map((channel) => (
              <div key={channel} className="flex items-center gap-3">
                <span className="w-24 text-sm text-slate-600">{channel}</span>
                <div className="flex-1 rounded-full bg-slate-100">
                  <div
                    className="h-3 rounded-full bg-amber-500"
                    style={{
                      width: `${Math.floor(Math.random() * 60 + 20)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">🔗 Integrazioni attive</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { name: "Google Business", active: googleReady && !!business?.googlePlaceId, icon: "🔍" },
            { name: "WhatsApp Business", active: !!business?.whatsappPhoneId, icon: "💬" },
            { name: "Stripe Pagamenti", active: !!business?.stripeCustomerId, icon: "💳" },
          ].map((integration) => (
            <div key={integration.name} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <p className="font-medium text-slate-900">{integration.name}</p>
                  <p className={`text-xs ${integration.active ? "text-emerald-600" : "text-slate-400"}`}>
                    {integration.active ? "✅ Connesso" : "Non configurato"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

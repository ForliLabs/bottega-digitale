export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";

export default async function LoyaltyPage() {
  const business = await getBusinessContext();

  const cards = business
    ? await prisma.loyaltyCard.findMany({
        where: { businessId: business.id },
        include: { customer: { select: { name: true, phone: true, totalVisits: true } } },
        orderBy: { points: "desc" },
      })
    : [];

  const totalPoints = cards.reduce((sum, c) => sum + c.points, 0);
  const totalRedeemed = business
    ? await prisma.loyaltyRedemption.count({ where: { businessId: business.id } })
    : 0;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Carta Fedeltà Digitale
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Programma fedeltà</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Fidelizza i clienti con punti automatici ad ogni visita. Niente tessere fisiche — tutto digitale
          con QR code.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Carte attive</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{cards.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Punti in circolazione</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{totalPoints}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Premi riscattati</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{totalRedeemed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Soglia premio</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {business?.loyaltyRewardThreshold || 100}
          </p>
          <p className="text-xs text-slate-500">{business?.loyaltyRewardName || "Premio"}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Classifica clienti fedeli</h2>
            <p className="text-sm text-slate-500">I clienti con più punti fedeltà.</p>
          </div>
          {cards.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {cards.map((card, i) => (
                <div key={card.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{card.customer.name}</p>
                      <p className="text-xs text-slate-500">
                        {card.customer.totalVisits} visite · {card.customer.phone}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                      {card.points} punti
                    </span>
                    {card.points >= (business?.loyaltyRewardThreshold || 100) && (
                      <p className="mt-1 text-xs text-emerald-600">🎁 Premio disponibile!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Nessuna carta fedeltà attiva. I clienti riceveranno punti automaticamente al check-in.
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">⚙️ Impostazioni</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Punti per visita</dt>
                <dd className="font-medium text-slate-900">{business?.loyaltyPointsPerVisit || 10}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Soglia premio</dt>
                <dd className="font-medium text-slate-900">{business?.loyaltyRewardThreshold || 100} punti</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Premio</dt>
                <dd className="font-medium text-slate-900">{business?.loyaltyRewardName || "Servizio gratuito"}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">📱 Check-in QR</h2>
            <p className="mt-2 text-sm text-slate-600">
              Posiziona il QR code al bancone. I clienti lo scansionano per accumulare punti fedeltà
              automaticamente.
            </p>
            <div className="mt-4 flex h-32 items-center justify-center rounded-2xl bg-slate-50">
              <span className="text-4xl">🏷️</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

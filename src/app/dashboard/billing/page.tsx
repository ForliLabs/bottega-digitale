export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { PRICING_TIERS, isStripeConfigured } from "@/lib/stripe";

export default async function BillingPage() {
  const business = await getBusinessContext();
  const tier = (business?.subscriptionTier || "vetrina") as keyof typeof PRICING_TIERS;
  const currentPlan = PRICING_TIERS[tier] || PRICING_TIERS.vetrina;
  const stripeReady = isStripeConfigured();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Abbonamento e fatturazione
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Piano e pagamenti</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Gestisci il tuo abbonamento, visualizza le fatture e passa a un piano superiore.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Piano attuale</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="rounded-2xl bg-amber-50 px-6 py-4">
            <p className="text-2xl font-bold text-amber-700">{currentPlan.name}</p>
            <p className="text-sm text-slate-600">
              {currentPlan.priceMonthly === 0 ? "Gratuito" : `€${currentPlan.priceMonthly}/mese`}
            </p>
          </div>
          {business?.stripeSubscriptionId && (
            <div className="text-sm text-slate-600">
              <p>ID Abbonamento: {business.stripeSubscriptionId}</p>
              <p>Cliente Stripe: {business.stripeCustomerId}</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {(Object.entries(PRICING_TIERS) as [string, (typeof PRICING_TIERS)[keyof typeof PRICING_TIERS]][]).map(
          ([key, plan]) => (
            <div
              key={key}
              className={`rounded-2xl border p-6 shadow-sm ${
                key === tier
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                  : "border-slate-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {plan.priceMonthly === 0 ? "Gratis" : `€${plan.priceMonthly}`}
                {plan.priceMonthly > 0 && <span className="text-sm text-slate-500">/mese</span>}
              </p>
              {key === tier ? (
                <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Piano attuale
                </span>
              ) : (
                <button
                  disabled={!stripeReady}
                  className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {stripeReady ? `Passa a ${plan.name}` : "Stripe non configurato"}
                </button>
              )}
            </div>
          )
        )}
      </section>

      {!stripeReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-800">⚠️ Stripe non configurato</h3>
          <p className="mt-2 text-sm text-amber-700">
            Per attivare i pagamenti, configura le variabili d&apos;ambiente STRIPE_SECRET_KEY,
            STRIPE_PRICE_BOTTEGA e STRIPE_PRICE_MAESTRO.
          </p>
        </div>
      )}
    </div>
  );
}

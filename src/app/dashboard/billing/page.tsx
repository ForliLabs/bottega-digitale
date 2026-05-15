export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { PRICING_TIERS, isStripeConfigured } from "@/lib/stripe";
import { BillingActions } from "./billing-actions";

export default async function BillingPage() {
  const business = await getBusinessContext();
  const tier = (business?.subscriptionTier || "vetrina") as keyof typeof PRICING_TIERS;
  const stripeReady = isStripeConfigured();

  // Serialize tier data for client component (strip stripePriceId)
  const tiers: Record<string, { name: string; priceMonthly: number }> = {};
  for (const [key, plan] of Object.entries(PRICING_TIERS)) {
    tiers[key] = { name: plan.name, priceMonthly: plan.priceMonthly };
  }

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

      <BillingActions
        tiers={tiers}
        currentTier={tier}
        stripeReady={stripeReady}
        hasStripeCustomer={!!business?.stripeCustomerId}
        hasSubscription={!!business?.stripeSubscriptionId}
        stripeSubscriptionId={business?.stripeSubscriptionId}
        stripeCustomerId={business?.stripeCustomerId}
      />
    </div>
  );
}

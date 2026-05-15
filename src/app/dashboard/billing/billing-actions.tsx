"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

type TierInfo = {
  name: string;
  priceMonthly: number;
};

type BillingActionsProps = {
  tiers: Record<string, TierInfo>;
  currentTier: string;
  stripeReady: boolean;
  hasStripeCustomer: boolean;
  hasSubscription: boolean;
  stripeSubscriptionId?: string | null;
  stripeCustomerId?: string | null;
};

function redirectTo(url: string) {
  window.location.assign(url);
}

export function BillingActions({
  tiers,
  currentTier,
  stripeReady,
  hasStripeCustomer,
  hasSubscription,
  stripeSubscriptionId,
  stripeCustomerId,
}: BillingActionsProps) {
  const { notify } = useToast();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(tier: string) {
    if (!stripeReady) {
      notify({
        tone: "error",
        title: "Stripe non configurato",
        description: "Configura le variabili d'ambiente Stripe prima di procedere.",
      });
      return;
    }

    setLoadingTier(tier);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ tone: "error", title: "Errore", description: data.error });
        return;
      }

      if (data.url) {
        redirectTo(data.url);
      }
    } catch {
      notify({ tone: "error", title: "Errore di rete", description: "Riprova più tardi." });
    } finally {
      setLoadingTier(null);
    }
  }

  async function handlePortal() {
    if (!stripeReady || !hasStripeCustomer) return;

    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (!res.ok) {
        notify({ tone: "error", title: "Errore", description: data.error });
        return;
      }

      if (data.url) {
        redirectTo(data.url);
      }
    } catch {
      notify({ tone: "error", title: "Errore di rete", description: "Riprova più tardi." });
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <>
      {/* Current plan info + portal link */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Piano attuale</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="rounded-2xl bg-amber-50 px-6 py-4">
            <p className="text-2xl font-bold text-amber-700">
              {tiers[currentTier]?.name ?? currentTier}
            </p>
            <p className="text-sm text-slate-600">
              {(tiers[currentTier]?.priceMonthly ?? 0) === 0
                ? "Gratuito"
                : `€${tiers[currentTier]?.priceMonthly}/mese`}
            </p>
          </div>
          {hasSubscription && (
            <div className="text-sm text-slate-600 space-y-1">
              {stripeSubscriptionId && <p>ID Abbonamento: {stripeSubscriptionId}</p>}
              {stripeCustomerId && <p>Cliente Stripe: {stripeCustomerId}</p>}
            </div>
          )}
        </div>
        {hasStripeCustomer && stripeReady && (
          <div className="mt-4">
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {portalLoading ? "Apertura portale..." : "Gestisci abbonamento e fatture →"}
            </button>
          </div>
        )}
      </section>

      {/* Tier cards */}
      <section className="grid gap-4 lg:grid-cols-3">
        {Object.entries(tiers).map(([key, plan]) => (
          <div
            key={key}
            className={`rounded-2xl border p-6 shadow-sm ${
              key === currentTier
                ? "border-amber-500 bg-amber-50 ring-2 ring-amber-500"
                : "border-slate-200 bg-white"
            }`}
          >
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {plan.priceMonthly === 0 ? "Gratis" : `€${plan.priceMonthly}`}
              {plan.priceMonthly > 0 && (
                <span className="text-sm text-slate-500">/mese</span>
              )}
            </p>
            {key === currentTier ? (
              <span className="mt-4 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Piano attuale
              </span>
            ) : (
              <button
                disabled={!stripeReady || loadingTier === key}
                onClick={() => handleUpgrade(key)}
                className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingTier === key
                  ? "Reindirizzamento..."
                  : stripeReady
                    ? `Passa a ${plan.name}`
                    : "Stripe non configurato"}
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Stripe not configured warning */}
      {!stripeReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-800">⚠️ Stripe non configurato</h3>
          <p className="mt-2 text-sm text-amber-700">
            Per attivare i pagamenti, configura le variabili d&apos;ambiente STRIPE_SECRET_KEY,
            STRIPE_PRICE_BOTTEGA e STRIPE_PRICE_MAESTRO.
          </p>
        </div>
      )}
    </>
  );
}

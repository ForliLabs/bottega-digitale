"use client";

import { useState } from "react";
import Link from "next/link";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

export function ConnectOnboardingCard({ stripeReady }: { stripeReady: boolean }) {
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startOnboarding() {
    if (!stripeReady) {
      notify({
        tone: "info",
        title: "Stripe non configurato in ambiente",
        description: "Apri la billing dashboard o configura STRIPE_SECRET_KEY per completare l'onboarding.",
      });
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "connect_onboarding" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Impossibile avviare l'onboarding Stripe");
      }

      if (!data.onboardingUrl) {
        throw new Error("Stripe non ha restituito un link di onboarding.");
      }

      notify({ tone: "success", title: "Reindirizzamento a Stripe" });
      window.location.href = data.onboardingUrl;
    } catch (onboardingError) {
      setError(onboardingError instanceof Error ? onboardingError.message : "Impossibile avviare l'onboarding Stripe");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {error ? <InlineMessage tone="error" title={error} silent /> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void startOnboarding()}
          disabled={loading}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Apertura Stripe..." : "Avvia onboarding Stripe"}
        </button>
        <Link
          href="/dashboard/settings/features"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Apri moduli attivi
        </Link>
        <Link
          href="/dashboard/billing"
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Vai al piano
        </Link>
      </div>
    </div>
  );
}

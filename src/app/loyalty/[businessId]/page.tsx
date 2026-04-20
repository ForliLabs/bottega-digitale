"use client";

import { useState, useEffect, use } from "react";

interface LoyaltyData {
  businessName: string;
  customerName: string;
  points: number;
  totalEarned: number;
  totalVisits: number;
  threshold: number;
  rewardName: string;
  rewardAvailable: boolean;
}

export default function LoyaltyPublicPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get customerId from URL search params
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const customerId = search.get("c");
    if (!customerId) {
      setError("Link non valido. Chiedi al negozio il tuo link personale.");
      setLoading(false);
      return;
    }

    fetch(`/api/loyalty?businessId=${businessId}&customerId=${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Errore di connessione."))
      .finally(() => setLoading(false));
  }, [businessId]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <p className="text-slate-500">Caricamento...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="text-center">
          <span className="text-4xl">🏷️</span>
          <p className="mt-4 text-lg font-medium text-slate-700">{error}</p>
        </div>
      </div>
    );
  }

  const progressPercent = Math.min((data.points / data.threshold) * 100, 100);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl">🏷️</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">{data.businessName}</h1>
            <p className="mt-1 text-sm text-slate-600">Carta Fedeltà Digitale</p>
          </div>

          <div className="mt-8 rounded-2xl bg-amber-50 p-6 text-center">
            <p className="text-sm font-semibold text-amber-700">Ciao, {data.customerName}!</p>
            <p className="mt-3 text-5xl font-bold text-amber-600">{data.points}</p>
            <p className="mt-1 text-sm text-slate-600">
              punti su {data.threshold} per il premio
            </p>

            {/* Progress bar */}
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {data.rewardAvailable && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                <p className="text-sm font-bold text-emerald-700">
                  🎁 Hai raggiunto il premio!
                </p>
                <p className="text-xs text-emerald-600">{data.rewardName}</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-slate-900">{data.totalVisits}</p>
              <p className="text-xs text-slate-500">Visite totali</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-2xl font-bold text-slate-900">{data.totalEarned}</p>
              <p className="text-xs text-slate-500">Punti guadagnati</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

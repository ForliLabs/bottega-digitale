"use client";

import { useState, useEffect, use } from "react";

interface LoyaltyData {
  businessName: string;
  businessSlug: string;
  businessPhone: string;
  customerName: string;
  points: number;
  totalEarned: number;
  totalVisits: number;
  threshold: number;
  rewardName: string;
  rewardAvailable: boolean;
  recentRedemptions?: Array<{ id: string; reward: string; createdAt: string }>;
}

export default function LoyaltyPublicPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = use(params);
  const [customerId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("c") || "";
  });
  const [data, setData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(() => customerId.length > 0);
  const [error, setError] = useState(() =>
    customerId ? "" : "Link non valido. Chiedi al negozio il tuo link personale.",
  );

  useEffect(() => {
    if (!customerId) return;

    fetch(`/api/loyalty?businessId=${businessId}&customerId=${customerId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Errore di connessione."))
      .finally(() => setLoading(false));
  }, [businessId, customerId]);

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

  const loyaltyData = data;
  const progressPercent = Math.min((loyaltyData.points / loyaltyData.threshold) * 100, 100);

  async function shareCard() {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: `${loyaltyData.businessName} — Carta fedeltà`,
        text: `${loyaltyData.customerName} ha ${loyaltyData.points} punti sulla carta fedeltà di ${loyaltyData.businessName}`,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    alert("Link copiato negli appunti");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl">🏷️</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">{loyaltyData.businessName}</h1>
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
                <p className="mt-2 text-xs text-emerald-700">Mostra questa schermata al bancone per riscattarlo.</p>
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={shareCard}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Condividi carta
            </button>
            <a
              href={`tel:${data.businessPhone}`}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Chiama il negozio
            </a>
            <a
              href={`/s/${data.businessSlug}`}
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800 sm:col-span-2"
            >
              Torna alla vetrina
            </a>
          </div>

          {data.recentRedemptions && data.recentRedemptions.length > 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="text-sm font-semibold text-slate-900">Ultimi riscatti</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {data.recentRedemptions.map((item) => (
                  <li key={item.id}>
                    • {item.reward} · {new Date(item.createdAt).toLocaleDateString("it-IT")}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

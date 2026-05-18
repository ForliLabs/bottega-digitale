"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useToast } from "@/components/ui/toast-provider";

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

function CodeEntryForm({ businessId }: { businessId: string }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) {
      setError("Inserisci il codice della tua carta fedeltà.");
      return;
    }
    window.location.href = `/loyalty/${businessId}?c=${encodeURIComponent(trimmed)}`;
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🏷️</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Carta Fedeltà</h1>
            <p className="mt-2 text-sm text-slate-600">
              Inserisci il codice ricevuto dal negozio per visualizzare i tuoi punti.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="loyalty-code" className="mb-1 block text-sm font-medium text-slate-700">
                Codice cliente
              </label>
              <input
                id="loyalty-code"
                value={code}
                onChange={(e) => { setCode(e.target.value); setError(""); }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Es. abc123"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-red-600" role="alert">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Vedi i miei punti
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-400">
            Non hai un codice? Chiedi al negozio il tuo link personale.
          </p>
        </div>
      </div>
    </div>
  );
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
  const [error, setError] = useState("");
  const [showCodeEntry, setShowCodeEntry] = useState(() => !customerId);
  const { notify } = useToast();

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

  const shareCard = useCallback(async () => {
    if (!data) return;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.businessName} — Carta fedeltà`,
          text: `${data.customerName} ha ${data.points} punti sulla carta fedeltà di ${data.businessName}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled share — no action needed
      }
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    notify({ title: "Link copiato negli appunti", tone: "success" });
  }, [data, notify]);

  if (showCodeEntry) {
    return <CodeEntryForm businessId={businessId} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            {/* Header skeleton */}
            <div className="flex flex-col items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" aria-hidden="true" />
              <div className="h-7 w-40 animate-pulse rounded-xl bg-slate-200" aria-hidden="true" />
              <div className="h-4 w-32 animate-pulse rounded-lg bg-slate-200" aria-hidden="true" />
            </div>
            {/* Points area skeleton */}
            <div className="mt-8 rounded-2xl bg-amber-50 p-6">
              <div className="mx-auto h-4 w-24 animate-pulse rounded-lg bg-amber-200" aria-hidden="true" />
              <div className="mx-auto mt-3 h-12 w-20 animate-pulse rounded-xl bg-amber-200" aria-hidden="true" />
              <div className="mx-auto mt-1 h-3 w-32 animate-pulse rounded-lg bg-amber-200" aria-hidden="true" />
              <div className="mt-4 h-4 w-full animate-pulse rounded-full bg-amber-200" aria-hidden="true" />
            </div>
            {/* Stats skeleton */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
              <div className="h-20 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
            </div>
            {/* Buttons skeleton */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
              <div className="h-12 animate-pulse rounded-xl bg-slate-100" aria-hidden="true" />
            </div>
            <span className="sr-only">Caricamento carta fedeltà in corso…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <span className="text-4xl" aria-hidden="true">🏷️</span>
          <p className="mt-4 text-lg font-medium text-slate-700">{error || "Impossibile caricare la carta."}</p>
          <button
            type="button"
            onClick={() => setShowCodeEntry(true)}
            className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Inserisci un altro codice
          </button>
        </div>
      </div>
    );
  }

  const loyaltyData = data;
  const progressPercent = Math.min((loyaltyData.points / loyaltyData.threshold) * 100, 100);

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🏷️</span>
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
            <div
              className="mt-4 h-4 overflow-hidden rounded-full bg-amber-200"
              role="progressbar"
              aria-valuenow={data.points}
              aria-valuemin={0}
              aria-valuemax={data.threshold}
              aria-label={`${data.points} punti su ${data.threshold} per il premio`}
            >
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {data.rewardAvailable && (
              <div className="mt-4 rounded-xl bg-emerald-50 p-3">
                <p className="text-sm font-bold text-emerald-700">
                  <span aria-hidden="true">🎁 </span>Hai raggiunto il premio!
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
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Condividi carta
            </button>
            <a
              href={`tel:${data.businessPhone}`}
              aria-label={`Chiama il negozio: ${data.businessPhone}`}
              className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Chiama il negozio
            </a>
            <a
              href={`/s/${data.businessSlug}`}
              className="rounded-xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 sm:col-span-2"
            >
              Torna alla vetrina
            </a>
          </div>

          {data.recentRedemptions && data.recentRedemptions.length > 0 ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-left">
              <p className="text-sm font-semibold text-slate-900">Ultimi riscatti</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc list-inside">
                {data.recentRedemptions.map((item) => (
                  <li key={item.id}>
                    {item.reward} · {new Date(item.createdAt).toLocaleDateString("it-IT")}
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

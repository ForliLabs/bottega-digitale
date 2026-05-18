"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { CopyLinkButton } from "@/components/ui/copy-link-button";

interface LoyaltyCardItem {
  id: string;
  customerName: string;
  customerPhone: string | null;
  totalVisits: number;
  points: number;
}

export function LoyaltyDashboardClient({
  business,
  cards,
  totalPoints,
  totalRedeemed,
}: {
  business: {
    id: string;
    loyaltyEnabled: boolean;
    loyaltyPointsPerVisit: number;
    loyaltyRewardThreshold: number;
    loyaltyRewardName: string;
  };
  cards: LoyaltyCardItem[];
  totalPoints: number;
  totalRedeemed: number;
}) {
  const { notify } = useToast();
  const [enabled, setEnabled] = useState(business.loyaltyEnabled);
  const [pointsPerVisit, setPointsPerVisit] = useState(String(business.loyaltyPointsPerVisit));
  const [rewardThreshold, setRewardThreshold] = useState(String(business.loyaltyRewardThreshold));
  const [rewardName, setRewardName] = useState(business.loyaltyRewardName);
  const [selectedCardId, setSelectedCardId] = useState(cards.find((card) => card.points >= business.loyaltyRewardThreshold)?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Track the last-saved settings snapshot to detect unsaved changes.
  const [savedSnapshot, setSavedSnapshot] = useState({
    enabled: business.loyaltyEnabled,
    pointsPerVisit: String(business.loyaltyPointsPerVisit),
    rewardThreshold: String(business.loyaltyRewardThreshold),
    rewardName: business.loyaltyRewardName,
  });
  const isDirty = useMemo(
    () =>
      enabled !== savedSnapshot.enabled ||
      pointsPerVisit !== savedSnapshot.pointsPerVisit ||
      rewardThreshold !== savedSnapshot.rewardThreshold ||
      rewardName !== savedSnapshot.rewardName,
    [enabled, pointsPerVisit, rewardThreshold, rewardName, savedSnapshot],
  );

  // Warn browser when navigating away with unsaved loyalty settings.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const publicLink = useMemo(() => `/loyalty/${business.id}`, [business.id]);
  const eligibleCards = cards.filter((card) => card.points >= Number(rewardThreshold || business.loyaltyRewardThreshold));

  async function saveSettings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/loyalty", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          pointsPerVisit: Number(pointsPerVisit) || 1,
          rewardThreshold: Number(rewardThreshold) || 1,
          rewardName,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare le impostazioni loyalty");
      }
      notify({ tone: "success", title: "Impostazioni loyalty aggiornate" });
      setSavedSnapshot({ enabled, pointsPerVisit, rewardThreshold, rewardName });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare le impostazioni loyalty");
    } finally {
      setLoading(false);
    }
  }

  async function redeemReward() {
    if (!selectedCardId) {
      setError("Seleziona una carta con punti sufficienti");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "redeem", cardId: selectedCardId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile registrare il riscatto");
      }
      notify({ tone: "success", title: `Premio ${data.rewardName || rewardName} riscattato` });
    } catch (redeemError) {
      setError(redeemError instanceof Error ? redeemError.message : "Impossibile registrare il riscatto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 via-white to-rose-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-700">Carta Fedeltà Digitale</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Programma fedeltà</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Gestisci i punti per visita, decidi la soglia premio e riscatta in cassa senza usare tessere fisiche.
        </p>
      </section>

      {/* Always-mounted assertive live region — single, reliable SR error announcement */}
      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {/* silent: parent live-region above already announces; this is visual only */}
      {error ? <InlineMessage tone="error" title={error} silent /> : null}

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
          <p className="text-sm text-slate-500">Portale pubblico</p>
          <p className="mt-2 break-all text-xs font-mono text-slate-600">{publicLink}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <CopyLinkButton
              url={publicLink}
              label="Copia link"
              aria-label="Copia link del portale fedeltà"
            />
            <a
              href={publicLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-1"
            >
              Anteprima ↗
            </a>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-slate-900">Impostazioni loyalty</h2>
              {isDirty && (
                <span
                  role="status"
                  aria-label="Hai modifiche non salvate"
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                  Modifiche non salvate
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">Aggiorna i parametri del programma senza passaggi manuali.</p>
          </div>
          <label htmlFor="loyalty-enabled" className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
            <input id="loyalty-enabled" type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4" />
            {enabled ? "Programma attivo" : "Programma disattivato"}
          </label>
          <label htmlFor="loyalty-points-per-visit" className="block text-sm font-medium text-slate-700">
            Punti per visita
            <input id="loyalty-points-per-visit" type="number" min="1" step="1" value={pointsPerVisit} onChange={(event) => setPointsPerVisit(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label htmlFor="loyalty-reward-threshold" className="block text-sm font-medium text-slate-700">
            Soglia premio
            <input id="loyalty-reward-threshold" type="number" min="1" step="1" value={rewardThreshold} onChange={(event) => setRewardThreshold(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" />
          </label>
          <label htmlFor="loyalty-reward-name" className="block text-sm font-medium text-slate-700">
            Nome premio
            <input id="loyalty-reward-name" value={rewardName} onChange={(event) => setRewardName(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="Servizio gratuito" />
          </label>
          <div className="flex items-center gap-3">
            <button type="button" onClick={saveSettings} disabled={loading || !rewardName.trim()} className="rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50">
              {loading ? "Salvataggio..." : "Salva impostazioni"}
            </button>
            {!isDirty && !loading && (
              <span className="text-xs text-slate-400">Tutto salvato ✓</span>
            )}
          </div>
        </div>

        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Riscatta un premio</h2>
            <p className="mt-1 text-sm text-slate-500">Seleziona una carta che ha già raggiunto la soglia e registra il premio dal banco.</p>
          </div>
          <label htmlFor="loyalty-redeem-card" className="block text-sm font-medium text-slate-700">
            Carta fedeltà idonea
            <select id="loyalty-redeem-card" value={selectedCardId} onChange={(event) => setSelectedCardId(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">
              <option value="">Seleziona una carta</option>
              {eligibleCards.map((card) => (
                <option key={card.id} value={card.id}>{card.customerName} · {card.points} punti</option>
              ))}
            </select>
          </label>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Premio attuale: <span className="font-semibold text-slate-900">{rewardName}</span>
          </div>
          <button type="button" onClick={redeemReward} disabled={loading || !selectedCardId} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
            {loading ? "Registrazione..." : "Registra riscatto"}
          </button>
          <div className="rounded-2xl border border-fuchsia-100 bg-fuchsia-50 p-4">
            <p className="text-sm font-semibold text-fuchsia-800">Link check-in clienti</p>
            <p className="mt-1 break-all text-xs font-mono text-fuchsia-700">{publicLink}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyLinkButton
                url={publicLink}
                label="Copia link"
                copiedLabel="Copiato!"
                aria-label="Copia link pubblico della carta fedeltà"
                className="rounded-xl border border-fuchsia-200 bg-white px-3 py-2 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-1"
              />
              <a
                href={publicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-fuchsia-200 bg-white px-3 py-2 text-xs font-semibold text-fuchsia-700 hover:bg-fuchsia-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 focus-visible:ring-offset-1"
              >
                Anteprima ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Classifica clienti fedeli</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {cards.length > 0 ? cards.map((card, index) => (
            <div key={card.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">{index + 1}</div>
                <div>
                  <p className="font-medium text-slate-900">{card.customerName}</p>
                  <p className="text-sm text-slate-500">{card.totalVisits} visite · {card.customerPhone || "telefono non disponibile"}</p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold text-slate-900">{card.points} punti</p>
                {card.points >= Number(rewardThreshold || business.loyaltyRewardThreshold) ? <p className="text-emerald-600">Premio disponibile</p> : null}
              </div>
            </div>
          )) : <EmptyState icon="🏷️" title="Nessuna carta attiva" description="I clienti vedranno la loro carta digitale dopo il primo check-in." />}
        </div>
      </section>
    </div>
  );
}

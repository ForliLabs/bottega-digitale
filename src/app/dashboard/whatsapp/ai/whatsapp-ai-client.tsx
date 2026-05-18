"use client";

import { useEffect, useMemo, useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface Stats {
  totalMessages: number;
  aiResponses: number;
  activeConversations: number;
}

export function WhatsAppAIClient({
  initialSettings,
  stats,
}: {
  initialSettings: {
    enabled: boolean;
    personality: string;
    faqLines: string[];
    capabilities: Array<{ label: string; active: boolean; description: string }>;
  };
  stats: Stats | null;
}) {
  const { notify } = useToast();
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [personality, setPersonality] = useState(initialSettings.personality);
  const [faqText, setFaqText] = useState(initialSettings.faqLines.join("\n"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Track the last-saved state to detect unsaved changes
  const [savedSnapshot, setSavedSnapshot] = useState(() => ({
    enabled: initialSettings.enabled,
    personality: initialSettings.personality,
    faqText: initialSettings.faqLines.join("\n"),
  }));

  const isDirty = useMemo(
    () =>
      enabled !== savedSnapshot.enabled ||
      personality !== savedSnapshot.personality ||
      faqText !== savedSnapshot.faqText,
    [enabled, personality, faqText, savedSnapshot]
  );

  // Warn when leaving with unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function saveSettings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/whatsapp-ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled,
          personality,
          faqLines: faqText.split(/\r?\n/).filter(Boolean),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare la configurazione");
      }
      setSavedSnapshot({ enabled, personality, faqText });
      notify({ tone: "success", title: "Configurazione WhatsApp AI aggiornata" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare la configurazione");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Assistente Virtuale</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">WhatsApp AI</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Attiva il chatbot, scegli il tono di voce e prepara le risposte automatiche più utili per prenotazioni, fedeltà e coda.
        </p>
      </section>

      {error ? <InlineMessage tone="error" title={error} /> : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stato Assistente</h2>
            <p className="mt-1 text-sm text-slate-500">Accendi o spegni l&apos;assistente e salva le modifiche quando hai finito.</p>
          </div>
          <label className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} className="h-4 w-4" />
            {enabled ? "Assistente attivo" : "Assistente disattivato"}
          </label>
        </div>
      </div>

      {stats ? (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalMessages}</p>
            <p className="text-xs text-slate-500">Messaggi ricevuti</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.aiResponses}</p>
            <p className="text-xs text-slate-500">Risposte AI</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.activeConversations}</p>
            <p className="text-xs text-slate-500">Conversazioni attive</p>
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Configurazione</h2>
            {/* Unsaved-changes indicator */}
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
          <div className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Personalità
              <select value={personality} onChange={(event) => setPersonality(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm">
                <option value="amichevole">Amichevole</option>
                <option value="formale">Formale</option>
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-700">
              FAQ rapide (una per riga, formato domanda|risposta)
              <textarea value={faqText} onChange={(event) => setFaqText(event.target.value)} rows={8} className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm" placeholder="Parcheggio?|Sì, dietro il negozio trovi 6 posti" />
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={saveSettings}
                disabled={loading || !isDirty}
                className="rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : "Salva configurazione"}
              </button>
              {!isDirty && !loading && (
                <span className="text-xs text-slate-400">Tutto salvato ✓</span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Funzioni pronte all&apos;uso</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {initialSettings.capabilities.map((capability) => (
                <li key={capability.label} className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-slate-900">{capability.label}</p>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${capability.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {capability.active ? "Attiva" : "Configura modulo"}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-600">{capability.description}</p>
                </li>
              ))}
            </ul>
          </div>

          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-900">Sicurezza e controlli</h3>
            <ul className="mt-3 space-y-2 text-sm text-amber-800">
              <li>• Rate limiting: massimo 30 messaggi/ora per numero</li>
              <li>• Escalation automatica al titolare per messaggi non compresi</li>
              <li>• Tutte le conversazioni sono registrate e visibili nella dashboard</li>
              <li>• L&apos;AI verifica sempre la disponibilità reale prima di confermare</li>
            </ul>
          </section>
        </div>
      </section>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface QueueEntryItem {
  id: string;
  customerName: string;
  customerPhone: string | null;
  position: number;
  status: string;
}

export function QueueDashboardClient({
  business,
  initialEntries,
  todayCompleted,
}: {
  business: { id: string; avgServiceMinutes: number } | null;
  initialEntries: QueueEntryItem[];
  todayCompleted: number;
}) {
  const { notify } = useToast();
  const [entries, setEntries] = useState(initialEntries);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const waitingCount = useMemo(() => entries.filter((entry) => entry.status === "waiting").length, [entries]);
  const servingCount = useMemo(() => entries.filter((entry) => entry.status === "serving").length, [entries]);

  async function updateEntry(entryId: string, status: string, remove = false) {
    setLoadingId(entryId);
    setError("");
    try {
      const response = await fetch("/api/queue", {
        method: remove ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(remove ? { entryId } : { entryId, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare la coda");
      }

      if (remove || status === "completed" || status === "cancelled") {
        setEntries((current) => current.filter((entry) => entry.id !== entryId).map((entry, index) => ({ ...entry, position: index + 1 })));
      } else {
        setEntries((current) => current.map((entry) => entry.id === entryId ? { ...entry, status } : entry));
      }
      notify({ tone: "success", title: "Coda aggiornata" });
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Impossibile aggiornare la coda");
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Gestione coda</p>
        <h1 className="text-3xl font-bold text-slate-900">Coda walk-in</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Chiama il prossimo cliente, mettilo in servizio o chiudi il turno senza uscire dalla dashboard.
        </p>
      </section>

      {error ? <InlineMessage tone="error" title={error} /> : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">In coda ora</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{waitingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">In servizio</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{servingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Serviti oggi</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{todayCompleted}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Attesa stimata</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{waitingCount * (business?.avgServiceMinutes || 30)} min</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Coda attuale</h2>
          </div>
          {entries.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${entry.status === "serving" ? "bg-emerald-100 text-emerald-700" : entry.status === "called" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {entry.position}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{entry.customerName}</p>
                      <p className="text-xs text-slate-500">{entry.customerPhone || "Telefono non fornito"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {entry.status === "waiting" ? (
                      <button type="button" onClick={() => updateEntry(entry.id, "called")} disabled={loadingId === entry.id} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50">Chiama</button>
                    ) : null}
                    {entry.status !== "serving" ? (
                      <button type="button" onClick={() => updateEntry(entry.id, "serving")} disabled={loadingId === entry.id} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50">In servizio</button>
                    ) : null}
                    <button type="button" onClick={() => updateEntry(entry.id, "completed")} disabled={loadingId === entry.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Completato</button>
                    <button type="button" onClick={() => updateEntry(entry.id, "cancelled", true)} disabled={loadingId === entry.id} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50">Rimuovi</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="🎟️" title="Nessuno in coda" description="I clienti possono unirsi scansionando il link pubblico o il QR code all'ingresso." />
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Link pubblico coda</h2>
            <p className="mt-2 text-sm text-slate-600">Condividi questo link o trasformalo in QR code dal browser per far entrare i clienti in autonomia.</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
              {business ? `/queue/${business.id}` : "/queue/demo"}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h3 className="font-semibold text-amber-800">Come usarla al banco</h3>
            <ol className="mt-3 space-y-2 text-sm text-amber-700">
              <li>1. Chiama il prossimo cliente quando il banco si libera</li>
              <li>2. Passa a “In servizio” mentre stai lavorando</li>
              <li>3. Segna “Completato” per aggiornare tempi e posizioni successive</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

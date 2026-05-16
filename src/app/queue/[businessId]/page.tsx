"use client";

import { useState, useEffect, use } from "react";
import { InlineMessage, Skeleton } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";
import { isValidPhoneNumber } from "@/lib/utils";

interface QueueStatus {
  businessName: string;
  entry: { id: string; status: string } | null;
  position: number | null;
  totalWaiting: number;
  estimatedWaitMin: number | null;
}

export default function QueuePublicPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = use(params);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [entryId, setEntryId] = useState<string | null>(null);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const { notify } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessLoading, setBusinessLoading] = useState(true);
  const [pollStatus, setPollStatus] = useState("In attesa di aggiornamenti...");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBusinessLoading(true);
      fetch(`/api/queue?businessId=${businessId}`)
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Impossibile caricare la coda");
          }
          setBusinessName(data.businessName || "Coda digitale");
        })
        .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Impossibile caricare la coda"))
        .finally(() => setBusinessLoading(false));
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [businessId]);

  useEffect(() => {
    if (!entryId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/queue?businessId=${businessId}&entryId=${entryId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Aggiornamento coda non disponibile");
        }
        setStatus(data);
        setPollStatus(data.entry?.status === "called" ? "" : "Ultimo aggiornamento ricevuto");
      } catch {
        setPollStatus("Connessione persa, nuovo tentativo tra pochi secondi...");
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [businessId, entryId]);

  async function joinQueue(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !isValidPhoneNumber(phone)) {
      setError("Inserisci un numero WhatsApp valido oppure lascia il campo vuoto.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, customerName: name, customerPhone: phone || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setEntryId(data.id);
      setStatus({
        businessName,
        entry: { id: data.id, status: "waiting" },
        position: data.position,
        totalWaiting: data.position,
        estimatedWaitMin: data.estimatedWaitMin,
      });
      setPollStatus("Sei in coda: aggiorniamo automaticamente la posizione.");
      notify({ tone: "success", title: "Ingresso in coda confermato", description: "Ti aggiorneremo automaticamente sul tuo turno." });
    } catch {
      setError("Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  async function leaveQueue() {
    if (!entryId) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/queue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, entryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Impossibile lasciare la coda");
      }

      setEntryId(null);
      setStatus(null);
      setPollStatus("Hai lasciato la coda.");
      notify({ tone: "success", title: "Hai lasciato la coda" });
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : "Errore di connessione.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl" aria-hidden="true">🎟️</span>
            {/* Accessible loading/resolution live region */}
            <p
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {businessLoading
                ? "Caricamento coda in corso..."
                : businessName
                  ? `Coda caricata: ${businessName}`
                  : ""}
            </p>
            {/* Dedicated assertive live region for action errors (join, leave,
                poll failures). Always mounted so content changes are reliably
                picked up by screen readers regardless of when they occur. */}
            <p
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              className="sr-only"
            >
              {error}
            </p>
            {businessLoading ? (
              <div className="mt-3 space-y-2">
                <Skeleton className="mx-auto h-8 w-48" />
                <Skeleton className="mx-auto h-4 w-56" />
              </div>
            ) : (
              <>
                <h1 className="mt-3 text-2xl font-bold text-slate-900">{businessName || "Coda digitale"}</h1>
                <p className="mt-1 text-sm text-slate-600">Mettiti in fila senza aspettare in negozio</p>
              </>
            )}
          </div>

          {!entryId && !businessLoading && error && !businessName ? (
            <div className="mt-8 space-y-4 text-center">
              <InlineMessage tone="error" title={error} silent />
              <p className="text-xs text-slate-500">
                Potrebbe essere un problema temporaneo. Controlla la connessione e riprova.
              </p>
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setBusinessLoading(true);
                  fetch(`/api/queue?businessId=${businessId}`)
                    .then(async (response) => {
                      const data = await response.json();
                      if (!response.ok) {
                        throw new Error(data.error || "Impossibile caricare la coda");
                      }
                      setBusinessName(data.businessName || "Coda digitale");
                    })
                    .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Impossibile caricare la coda"))
                    .finally(() => setBusinessLoading(false));
                }}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Riprova
              </button>
            </div>
          ) : !entryId ? (
            <form onSubmit={joinQueue} className="mt-8 space-y-4">
              <div>
                <label htmlFor="queue-name" className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
                <input
                  id="queue-name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Il tuo nome"
                  autoComplete="given-name"
                />
              </div>
              <div>
                <label htmlFor="queue-phone" className="mb-1 block text-sm font-medium text-slate-700">
                  Telefono (per notifica WhatsApp)
                </label>
                <input
                  id="queue-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="+39 333 1234567"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              {error ? (
                <div className="space-y-3">
                  <InlineMessage tone="error" title={error} silent />
                  <p className="text-xs text-slate-500">
                    Potrebbe essere un problema temporaneo di connessione. Controlla la rete e riprova.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setError(""); }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancella errore e riprova
                  </button>
                </div>
              ) : null}
              <button
                type="submit"
                disabled={loading || businessLoading}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "Inserimento in coda..." : "Mettiti in coda"}
              </button>
            </form>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="rounded-2xl bg-amber-50 p-6 text-center">
                <p className="text-sm font-semibold text-amber-700">La tua posizione</p>
                <p className="mt-2 text-5xl font-bold text-amber-600">{status?.position || "..."}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Tempo stimato: ~{status?.estimatedWaitMin ?? "..."} min
                </p>
              </div>
              <div className="text-center text-sm text-slate-500">
                <p>Totale in coda: {status?.totalWaiting || 0} persone</p>
                {/* Live region for polling status updates */}
                <p aria-live="polite" aria-atomic="true" className="mt-2 text-xs text-slate-400">{pollStatus}</p>
                {status?.entry?.status === "called" && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="mt-4 rounded-2xl bg-emerald-50 p-4"
                  >
                    <p className="text-lg font-bold text-emerald-700">
                      <span aria-hidden="true">🔔 </span>È il tuo turno!
                    </p>
                    <p className="text-sm text-emerald-600">Presentati al banco.</p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={leaveQueue}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Uscita in corso..." : "Lascia la coda"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

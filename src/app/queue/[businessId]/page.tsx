"use client";

import { useState, useEffect, use } from "react";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");

  useEffect(() => {
    fetch(`/api/queue?businessId=${businessId}`)
      .then((r) => r.json())
      .then((data) => setBusinessName(data.businessName || ""))
      .catch(() => {});
  }, [businessId]);

  useEffect(() => {
    if (!entryId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/queue?businessId=${businessId}&entryId=${entryId}`);
      const data = await res.json();
      setStatus(data);
    }, 5000);
    return () => clearInterval(interval);
  }, [businessId, entryId]);

  async function joinQueue(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId, customerName: name, customerPhone: phone || null }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEntryId(data.id);
      setStatus({
        businessName,
        entry: { id: data.id, status: "waiting" },
        position: data.position,
        totalWaiting: data.position,
        estimatedWaitMin: data.estimatedWaitMin,
      });
    } catch { setError("Errore di connessione."); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-amber-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <span className="text-4xl">🎟️</span>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">
              {businessName || "Coda digitale"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Mettiti in fila senza aspettare in negozio
            </p>
          </div>

          {!entryId ? (
            <form onSubmit={joinQueue} className="mt-8 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Nome *</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="Il tuo nome"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Telefono (per notifica WhatsApp)
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  placeholder="+39 333 1234567"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {loading ? "..." : "Mettiti in coda"}
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
                {status?.entry?.status === "called" && (
                  <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
                    <p className="text-lg font-bold text-emerald-700">🔔 È il tuo turno!</p>
                    <p className="text-sm text-emerald-600">Presentati al banco.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

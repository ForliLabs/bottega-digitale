"use client";

import { useMemo, useState } from "react";
import { InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

interface PurchaseResult {
  id: string;
  code: string;
}

export function GiftCardPurchasePanel({ amounts }: { amounts: number[] }) {
  const { notify } = useToast();
  const [selectedAmount, setSelectedAmount] = useState(amounts[0] || 25);
  const [form, setForm] = useState({
    purchaserName: "",
    purchaserPhone: "",
    recipientName: "",
    recipientPhone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [purchase, setPurchase] = useState<PurchaseResult | null>(null);

  const summary = useMemo(
    () => `Buono regalo da €${selectedAmount} da condividere subito con ${form.recipientName.trim() || "il destinatario"}.`,
    [form.recipientName, selectedAmount],
  );

  async function submitPurchase(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "marketplace_purchase",
          amountEuro: selectedAmount,
          ...form,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile creare il buono regalo.");
      }
      setPurchase({ id: data.id, code: data.code });
      notify({
        tone: "success",
        title: "Buono regalo creato",
        description: "Copia il codice e condividilo con il destinatario.",
      });
    } catch (purchaseError) {
      setPurchase(null);
      setError(purchaseError instanceof Error ? purchaseError.message : "Impossibile creare il buono regalo.");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!purchase) return;
    await navigator.clipboard.writeText(purchase.code);
    notify({ tone: "success", title: "Codice copiato" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {amounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setSelectedAmount(amount)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                selectedAmount === amount
                  ? "border-amber-500 bg-amber-500 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:bg-amber-50"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-80">Bottega Credit</p>
              <p className="mt-2 text-2xl font-bold">€{amount}</p>
              <p className="mt-1 text-xs opacity-80">Valido in tutte le attività aderenti</p>
            </button>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-white/80 p-5">
          <p className="text-sm font-semibold text-slate-900">Come funziona</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• scegli il taglio del buono e inserisci i dati del regalo</li>
            <li>• ricevi subito un codice digitale pronto da inoltrare</li>
            <li>• il destinatario lo usa online o in bottega fino a esaurimento saldo</li>
          </ul>
          <p className="mt-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm font-medium text-amber-900">{summary}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">Checkout regalo</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">Acquista in pochi secondi</h3>
          <p className="mt-2 text-sm text-slate-500">Compila il regalo e condividi il codice appena generato.</p>
        </div>

        {error ? <div className="mt-4"><InlineMessage tone="error" title={error} /></div> : null}

        <form className="mt-5 space-y-4" onSubmit={submitPurchase}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Chi acquista
              <input
                value={form.purchaserName}
                onChange={(event) => setForm((current) => ({ ...current, purchaserName: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Nome e cognome"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Telefono (opzionale)
              <input
                value={form.purchaserPhone}
                onChange={(event) => setForm((current) => ({ ...current, purchaserPhone: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="+39 333 1234567"
                inputMode="tel"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Destinatario
              <input
                value={form.recipientName}
                onChange={(event) => setForm((current) => ({ ...current, recipientName: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="A chi vuoi regalarlo?"
                required
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Telefono destinatario (opzionale)
              <input
                value={form.recipientPhone}
                onChange={(event) => setForm((current) => ({ ...current, recipientPhone: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                placeholder="Per invio rapido su WhatsApp"
                inputMode="tel"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Messaggio regalo
            <textarea
              value={form.message}
              onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              placeholder="Un messaggio personale da allegare al buono"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creazione in corso..." : `Genera buono da €${selectedAmount}`}
          </button>
        </form>

        {purchase ? (
          <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <InlineMessage
              tone="success"
              title="Buono pronto da condividere"
              description="Il codice è attivo subito. Salvalo ora e inoltralo al destinatario."
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                {purchase.code}
              </code>
              <button
                type="button"
                onClick={() => void copyCode()}
                className="rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-emerald-700"
              >
                Copia codice
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

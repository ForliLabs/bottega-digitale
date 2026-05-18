"use client";

import { useState } from "react";
import { EmptyState, InlineMessage } from "@/components/ui/feedback";
import { useToast } from "@/components/ui/toast-provider";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount);
}

const STATUS_STYLES: Record<string, string> = {
  bozza: "bg-slate-100 text-slate-600",
  inviata: "bg-blue-100 text-blue-700",
  consegnata: "bg-emerald-100 text-emerald-700",
  rifiutata: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  bozza: "Bozza",
  inviata: "Inviata SDI",
  consegnata: "Consegnata",
  rifiutata: "Rifiutata",
};

interface BookingOption {
  id: string;
  customerName: string;
  service: string;
  startsAt: string | Date;
  priceEuro: number;
}

interface FiscalProfile {
  ragioneSociale: string;
  partitaIva: string;
  codiceFiscale: string;
  indirizzo: string;
  cap: string;
  citta: string;
  provincia: string;
  codiceDestinatario: string;
  pecDestinatario: string | null;
  regimeFiscale: string;
}

interface InvoiceItem {
  id: string;
  progressiveNumber: number;
  fiscalYear: number;
  customerName: string;
  issuedAt: string | Date;
  totalGross: number;
  status: string;
}

interface InvoiceStats {
  fiscalProfile: FiscalProfile;
  invoices: InvoiceItem[];
  totals: { net: number; vat: number; gross: number };
  count: number;
  currentYear: number;
}

export function InvoicesClient({
  initialStats,
  completedBookings,
  businessDefaults,
}: {
  initialStats: InvoiceStats | null;
  completedBookings: BookingOption[];
  businessDefaults: FiscalProfile;
}) {
  const { notify } = useToast();
  const [stats, setStats] = useState(initialStats);
  const [fiscalForm, setFiscalForm] = useState<FiscalProfile>(initialStats?.fiscalProfile || businessDefaults);
  const [selectedBookingId, setSelectedBookingId] = useState(completedBookings[0]?.id || "");
  const [loadingAction, setLoadingAction] = useState<"fiscal" | "generate" | string | null>(null);
  const [error, setError] = useState("");

  async function submitFiscalProfile() {
    setLoadingAction("fiscal");
    setError("");
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup-fiscal", ...fiscalForm }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile salvare il profilo fiscale");
      }
      // Update local stats in-place instead of triggering a full-page reload.
      setStats((current) => ({
        invoices: current?.invoices ?? [],
        totals: current?.totals ?? { net: 0, vat: 0, gross: 0 },
        count: current?.count ?? 0,
        currentYear: current?.currentYear ?? new Date().getFullYear(),
        fiscalProfile: fiscalForm,
      }));
      notify({ tone: "success", title: "Profilo fiscale salvato" });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Impossibile salvare il profilo fiscale");
    } finally {
      setLoadingAction(null);
    }
  }

  async function generateInvoice() {
    if (!selectedBookingId) {
      setError("Seleziona una prenotazione completata per generare la fattura.");
      return;
    }

    setLoadingAction("generate");
    setError("");
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", bookingId: selectedBookingId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile generare la fattura");
      }
      // Re-fetch updated stats so the invoice list reflects the new entry
      // without a full-page reload.
      const statsResponse = await fetch("/api/invoices");
      if (statsResponse.ok) {
        const updatedStats = await statsResponse.json();
        setStats(updatedStats);
        notify({ tone: "success", title: "Fattura generata" });
      } else {
        // Generation succeeded but the list refresh failed — surface a clear warning
        // so the user knows to reload rather than seeing stale data silently.
        notify({
          tone: "success",
          title: "Fattura generata",
          description: "Aggiorna la pagina per vedere la nuova fattura nell'elenco.",
        });
      }
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Impossibile generare la fattura");
    } finally {
      setLoadingAction(null);
    }
  }

  async function updateStatus(invoiceId: string, status: string) {
    setLoadingAction(invoiceId);
    setError("");
    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-status", invoiceId, status }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || data.error || "Impossibile aggiornare lo stato");
      }
      setStats((current) => current ? {
        ...current,
        invoices: current.invoices.map((invoice) => invoice.id === invoiceId ? { ...invoice, status } : invoice),
      } : current);
      notify({ tone: "success", title: "Stato fattura aggiornato" });
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : "Impossibile aggiornare lo stato");
    } finally {
      setLoadingAction(null);
    }
  }

  const invoiceStats = stats;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">Fatturazione</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Fatturazione Elettronica</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Configura il profilo fiscale, genera fatture dalle prenotazioni completate e aggiorna lo stato di invio SDI senza uscire dalla dashboard.
        </p>
      </section>

      {/* Always-mounted assertive live region — single, reliable SR error announcement */}
      <p role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">{error}</p>
      {/* silent: parent live-region above already announces; this is visual only */}
      {error ? <InlineMessage tone="error" title={error} silent /> : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profilo fiscale</h2>
              <p className="mt-1 text-sm text-slate-500">Inserisci i dati necessari per creare il tracciato FatturaPA.</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${invoiceStats ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {invoiceStats ? "Configurato" : "Da configurare"}
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              ["ragioneSociale", "Ragione sociale"],
              ["partitaIva", "Partita IVA"],
              ["codiceFiscale", "Codice fiscale"],
              ["indirizzo", "Indirizzo"],
              ["cap", "CAP"],
              ["citta", "Città"],
              ["provincia", "Provincia"],
              ["codiceDestinatario", "Codice destinatario"],
              ["pecDestinatario", "PEC destinatario"],
            ].map(([field, label]) => (
              <label key={field} htmlFor={`fiscal-${field}`} className="block text-sm font-medium text-slate-700">
                {label}
                <input
                  id={`fiscal-${field}`}
                  value={String(fiscalForm[field as keyof FiscalProfile] || "")}
                  onChange={(event) => setFiscalForm((current) => ({ ...current, [field]: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                />
              </label>
            ))}
            <label htmlFor="fiscal-regimeFiscale" className="block text-sm font-medium text-slate-700">
              Regime fiscale
              <select
                id="fiscal-regimeFiscale"
                value={fiscalForm.regimeFiscale}
                onChange={(event) => setFiscalForm((current) => ({ ...current, regimeFiscale: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="RF01">Ordinario</option>
                <option value="RF19">Forfettario</option>
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={submitFiscalProfile}
            disabled={loadingAction === "fiscal"}
            className="mt-6 rounded-xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {loadingAction === "fiscal" ? "Salvataggio..." : invoiceStats ? "Aggiorna profilo fiscale" : "Configura profilo fiscale"}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Genera da prenotazione completata</h2>
          <p className="mt-1 text-sm text-slate-500">Seleziona un appuntamento completato e crea subito la fattura elettronica.</p>
          {completedBookings.length > 0 ? (
            <>
              <label className="mt-6 block text-sm font-medium text-slate-700">
                Prenotazione
                <select
                  value={selectedBookingId}
                  onChange={(event) => setSelectedBookingId(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
                >
                  {completedBookings.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.customerName} · {booking.service} · {new Date(booking.startsAt).toLocaleDateString("it-IT")} · {formatEuro(booking.priceEuro)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={generateInvoice}
                disabled={!invoiceStats || loadingAction === "generate"}
                className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {loadingAction === "generate" ? "Generazione..." : "Genera fattura"}
              </button>
              {!invoiceStats ? <p className="mt-3 text-xs text-amber-700">Prima configura il profilo fiscale per abilitare la generazione.</p> : null}
            </>
          ) : (
            <EmptyState icon="🗂️" title="Nessuna prenotazione completata" description="Completa una prenotazione per generare la prima fattura elettronica." />
          )}
        </div>
      </section>

      {invoiceStats ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{invoiceStats.count}</p>
              <p className="text-xs text-slate-500">Fatture {invoiceStats.currentYear}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{formatEuro(invoiceStats.totals.net)}</p>
              <p className="text-xs text-slate-500">Imponibile</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{formatEuro(invoiceStats.totals.vat)}</p>
              <p className="text-xs text-slate-500">IVA</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{formatEuro(invoiceStats.totals.gross)}</p>
              <p className="text-xs text-slate-500">Totale lordo</p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Fatture emesse</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {invoiceStats.invoices.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Nessuna fattura emessa. Genera la prima fattura da una prenotazione completata.
                </div>
              ) : invoiceStats.invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Fattura {invoice.fiscalYear}-{String(invoice.progressiveNumber).padStart(5, "0")}</p>
                    <p className="text-sm text-slate-500">{invoice.customerName} · {new Date(invoice.issuedAt).toLocaleDateString("it-IT")}</p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <span className="font-semibold text-slate-900">{formatEuro(invoice.totalGross)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[invoice.status] || "bg-slate-100 text-slate-600"}`}>
                      {STATUS_LABELS[invoice.status] || invoice.status}
                    </span>
                    <select
                      id={`invoice-status-${invoice.id}`}
                      aria-label={`Aggiorna stato fattura ${invoice.fiscalYear}-${String(invoice.progressiveNumber).padStart(5, "0")} (${invoice.customerName})`}
                      value={invoice.status}
                      onChange={(event) => updateStatus(invoice.id, event.target.value)}
                      disabled={loadingAction === invoice.id}
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getInvoiceStats, formatEuro } from "@/lib/e-invoice";

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

export default async function InvoicesPage() {
  const business = await getBusinessContext();
  const stats = business ? await getInvoiceStats(business.id) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-700">
          Fatturazione
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Fatturazione Elettronica
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Genera fatture elettroniche in formato FatturaPA (XML) conformi al Sistema di Interscambio (SDI).
          Automatizza la fatturazione dalle prenotazioni completate.
        </p>
      </section>

      {!stats && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">🧾</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Profilo fiscale non configurato</h3>
          <p className="mt-2 text-sm text-slate-500">
            Configura la tua Partita IVA, Codice Fiscale e dati fiscali per iniziare a generare fatture elettroniche.
          </p>
        </div>
      )}

      {stats && (
        <>
          {/* Fiscal profile summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Profilo Fiscale</h2>
            <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
              <div>
                <span className="text-slate-500">Ragione sociale:</span>{" "}
                <span className="font-medium text-slate-900">{stats.fiscalProfile.ragioneSociale}</span>
              </div>
              <div>
                <span className="text-slate-500">P.IVA:</span>{" "}
                <span className="font-medium text-slate-900">{stats.fiscalProfile.partitaIva}</span>
              </div>
              <div>
                <span className="text-slate-500">Codice Fiscale:</span>{" "}
                <span className="font-medium text-slate-900">{stats.fiscalProfile.codiceFiscale}</span>
              </div>
              <div>
                <span className="text-slate-500">Regime:</span>{" "}
                <span className="font-medium text-slate-900">
                  {stats.fiscalProfile.regimeFiscale === "RF19" ? "Forfettario" : "Ordinario"}
                </span>
              </div>
            </div>
          </div>

          {/* Totals */}
          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{stats.count}</p>
              <p className="text-xs text-slate-500">Fatture {stats.currentYear}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{formatEuro(stats.totals.net)}</p>
              <p className="text-xs text-slate-500">Imponibile</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-slate-900">{formatEuro(stats.totals.vat)}</p>
              <p className="text-xs text-slate-500">IVA</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700">{formatEuro(stats.totals.gross)}</p>
              <p className="text-xs text-slate-500">Totale lordo</p>
            </div>
          </section>

          {/* Invoice list */}
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Fatture emesse</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {stats.invoices.map((inv) => (
                <div key={inv.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">
                      Fattura {inv.fiscalYear}-{String(inv.progressiveNumber).padStart(5, "0")}
                    </p>
                    <p className="text-sm text-slate-500">
                      {inv.customerName} · {new Date(inv.issuedAt).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-slate-900">{formatEuro(inv.totalGross)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[inv.status] || "bg-slate-100"}`}>
                      {STATUS_LABELS[inv.status] || inv.status}
                    </span>
                  </div>
                </div>
              ))}
              {stats.invoices.length === 0 && (
                <div className="px-6 py-12 text-center text-sm text-slate-400">
                  Nessuna fattura emessa. Genera la prima fattura da una prenotazione completata.
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

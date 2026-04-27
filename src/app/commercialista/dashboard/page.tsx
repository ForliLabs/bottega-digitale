export const dynamic = "force-dynamic";
import { formatEuro } from "@/lib/e-invoice";

// Demo accountant dashboard — in production, accountant auth would gate this
export default async function AccountantDashboard() {
  // In production: get accountant from session, then getAccountantDashboard(accountant.id)
  const demoClients = [
    { businessName: "Barbiere Marco", category: "Barbiere", invoiceCount: 12 },
    { businessName: "Forno della Piazza", category: "Panetteria", invoiceCount: 8 },
    { businessName: "Fiorista Elena", category: "Fiorista", invoiceCount: 5 },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Portale Commercialista
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            I tuoi clienti
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Accedi alle fatture, dati IVA e riepiloghi finanziari dei tuoi clienti su Bottega Digitale.
            Scarica le fatture XML (FatturaPA) o esporta in formato CSV per il tuo gestionale.
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{demoClients.length}</p>
            <p className="text-xs text-slate-500">Clienti collegati</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {demoClients.reduce((s, c) => s + c.invoiceCount, 0)}
            </p>
            <p className="text-xs text-slate-500">Fatture totali</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{formatEuro(0)}</p>
            <p className="text-xs text-slate-500">IVA trimestre corrente</p>
          </div>
        </section>

        {/* Client list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Clienti</h2>
            <p className="text-sm text-slate-500">Seleziona un cliente per visualizzare i dati finanziari</p>
          </div>
          <div className="divide-y divide-slate-100">
            {demoClients.map((client) => (
              <div
                key={client.businessName}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{client.businessName}</p>
                  <p className="text-sm text-slate-500">{client.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{client.invoiceCount} fatture</span>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                    Vedi dettagli
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Export options */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Esportazioni</h2>
          <p className="mt-2 text-sm text-slate-500">
            Scarica i dati nei formati compatibili con i principali gestionali.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="font-medium text-slate-900">📄 FatturaPA XML</p>
              <p className="mt-1 text-xs text-slate-500">Download massivo per SDI</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="font-medium text-slate-900">📊 CSV / XLSX</p>
              <p className="mt-1 text-xs text-slate-500">TeamSystem, Zucchetti, Datev</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="font-medium text-slate-900">📋 Riepilogo IVA</p>
              <p className="mt-1 text-xs text-slate-500">Liquidazione trimestrale</p>
            </div>
          </div>
        </section>

        {/* Referral */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h3 className="font-semibold text-emerald-900">Programma referral</h3>
          <p className="mt-2 text-sm text-emerald-800">
            Invita i tuoi clienti a usare Bottega Digitale con il tuo codice referral.
            Per ogni cliente attivo, ricevi un mese gratuito del tuo piano.
          </p>
          <div className="mt-3 inline-flex rounded-lg bg-white px-4 py-2 font-mono text-sm font-bold text-emerald-700">
            COM-XXXXXXXX
          </div>
        </section>
      </div>
    </div>
  );
}

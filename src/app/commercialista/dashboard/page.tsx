import Link from "next/link";
import { redirect } from "next/navigation";
import { formatEuro } from "@/lib/e-invoice";
import { getAccountantDashboard, getAuthenticatedAccountant, getClientFinancialData } from "@/lib/accountant-portal";

export const dynamic = "force-dynamic";

export default async function AccountantDashboard({
  searchParams,
}: {
  searchParams: Promise<{ businessId?: string }>;
}) {
  const accountant = await getAuthenticatedAccountant();
  if (!accountant) {
    redirect("/commercialista/login?next=/commercialista/dashboard");
  }

  const dashboard = await getAccountantDashboard(accountant.id);
  const clients = dashboard.clients;
  const { businessId } = await searchParams;
  const selectedClient = businessId ? await getClientFinancialData(accountant.id, businessId) : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Portale Commercialista
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">I tuoi clienti</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Accedi alle fatture, dati IVA e riepiloghi finanziari dei tuoi clienti su Bottega Digitale.
            Scarica le fatture XML (FatturaPA) o esporta in formato CSV per il tuo gestionale.
          </p>
          <p className="mt-3 text-sm font-medium text-blue-700">
            Accesso come {accountant.name}{accountant.studio ? ` · ${accountant.studio}` : ""}
          </p>
        </section>

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{dashboard.totalClients}</p>
            <p className="text-xs text-slate-500">Clienti collegati</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{dashboard.totalInvoices}</p>
            <p className="text-xs text-slate-500">Fatture totali</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{dashboard.referralCount}</p>
            <p className="text-xs text-slate-500">Clienti collegati / referral</p>
          </div>
        </section>

        {/* Client list */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Clienti</h2>
            <p className="text-sm text-slate-500">Seleziona un cliente per visualizzare i dati finanziari</p>
          </div>
          <div className="divide-y divide-slate-100">
            {clients.length === 0 ? (
              <div className="px-6 py-10 text-sm text-slate-500">
                Nessun cliente collegato ancora. Chiedi ai tuoi clienti il codice invito dalla loro dashboard.
              </div>
            ) : clients.map((client) => (
              <div
                key={client.businessId}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-slate-50"
              >
                <div>
                  <p className="font-medium text-slate-900">{client.businessName}</p>
                  <p className="text-sm text-slate-500">{client.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">{client.invoiceCount} fatture</span>
                  <Link
                    href={`/commercialista/dashboard?businessId=${client.businessId}`}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    Vedi dettagli
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {selectedClient ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Dettaglio cliente</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Ultime fatture e totali annuali del cliente selezionato.
                </p>
              </div>
              <a
                href={`/api/accountant?businessId=${businessId}&export=csv`}
                download
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Esporta CSV
              </a>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Imponibile anno</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatEuro(selectedClient.yearTotals.net)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">IVA anno</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatEuro(selectedClient.yearTotals.vat)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Totale anno</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formatEuro(selectedClient.yearTotals.gross)}</p>
              </div>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-2">Numero</th>
                    <th className="pb-2">Cliente</th>
                    <th className="pb-2">Data</th>
                    <th className="pb-2">Totale</th>
                    <th className="pb-2">Stato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {selectedClient.invoices.slice(0, 8).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3">{invoice.progressiveNumber}/{invoice.fiscalYear}</td>
                      <td className="py-3">{invoice.customerName}</td>
                      <td className="py-3">{new Date(invoice.issuedAt).toLocaleDateString("it-IT")}</td>
                      <td className="py-3">{formatEuro(invoice.totalGross)}</td>
                      <td className="py-3">{invoice.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

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
            {accountant.referralCode}
          </div>
        </section>
      </div>
    </div>
  );
}

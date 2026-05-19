export const dynamic = "force-dynamic";
import Link from "next/link";
import { getBusinessContext } from "@/lib/auth";
import { getPaymentStats, formatEuro } from "@/lib/payments";
import { isStripeConfigured } from "@/lib/stripe";
import { ConnectOnboardingCard } from "./connect-onboarding-card";

const TYPE_LABELS: Record<string, string> = {
  deposit: "Acconto",
  full_payment: "Pagamento",
  gift_card_purchase: "Buono venduto",
  gift_card_redemption: "Buono riscattato",
};

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  refunded: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

export default async function PaymentsPage() {
  const business = await getBusinessContext();
  const stats = business ? await getPaymentStats(business.id) : null;
  const stripeReady = isStripeConfigured();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Pagamenti
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Pagamenti Clienti
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Raccogli acconti sulle prenotazioni, vendi buoni regalo e gestisci i pagamenti dei clienti
          direttamente dalla piattaforma con Stripe Connect.
        </p>
      </section>

      {!business?.stripeConnectAccountId ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">💳</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Configura Stripe Connect</h3>
          <p className="mt-2 text-sm text-slate-500">
            Collega il tuo conto bancario per iniziare a ricevere pagamenti dai clienti.
            Onboarding guidato con Partita IVA e IBAN italiano.
          </p>
          <div className="mt-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <strong>Come funziona:</strong> I pagamenti vengono versati settimanalmente via SEPA.
            Commissione piattaforma: 2.5%.
          </div>
          <ConnectOnboardingCard stripeReady={stripeReady} />
        </div>
      ) : (
        <>
          {stats && (
            <>
              <section className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-700">{formatEuro(stats.dailyTotal)}</p>
                  <p className="text-xs text-slate-500">Incasso oggi</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.depositsCount}</p>
                  <p className="text-xs text-slate-500">Acconti raccolti</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{stats.giftCardsSold}</p>
                  <p className="text-xs text-slate-500">Buoni venduti</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900">{formatEuro(stats.totalRevenue)}</p>
                  <p className="text-xs text-slate-500">Ricavi netti totali</p>
                </div>
              </section>

              <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-900">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">Imposta rapidamente moduli e incassi</p>
                    <p className="mt-1 text-sky-800/80">
                      Gestisci depositi, percentuali e moduli commerciali senza uscire dal flusso operativo.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/dashboard/settings/features" className="rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-100">
                      Apri moduli attivi
                    </Link>
                    <Link href="/dashboard/billing" className="rounded-xl border border-sky-200 bg-white px-4 py-2 font-semibold text-sky-700 hover:bg-sky-100">
                      Vai al piano
                    </Link>
                  </div>
                </div>
              </div>

              {/* Deposit config */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Configurazione acconti</h2>
                    <p className="mt-1 text-sm text-slate-500">Rivedi collegamento Stripe, percentuale e disponibilità del modulo depositi.</p>
                  </div>
                  <Link href="/dashboard/settings/features" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Modifica impostazioni
                  </Link>
                </div>
                <div className="mt-3 grid gap-4 text-sm md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">Acconti attivi</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {business.depositsEnabled ? "✅ Sì" : "❌ No"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">Percentuale acconto</p>
                    <p className="mt-1 font-medium text-slate-900">{business.depositPercentage}%</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-slate-500">Buoni regalo attivi</p>
                    <p className="mt-1 font-medium text-slate-900">{stats.giftCardsActive}</p>
                  </div>
                </div>
              </div>

              {/* Transaction list */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">Transazioni recenti</h2>
                </div>
                <div className="divide-y divide-slate-100">
                  {stats.transactions.map((tx) => (
                    <div key={tx.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {TYPE_LABELS[tx.type] || tx.type}
                          {tx.customerName && ` — ${tx.customerName}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString("it-IT", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="font-semibold text-slate-900">{formatEuro(tx.amountEuro)}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[tx.status] || "bg-slate-100"}`}>
                          {tx.status === "completed" ? "Completato" : tx.status === "pending" ? "In attesa" : tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.transactions.length === 0 && (
                    <div className="px-6 py-12 text-center text-sm text-slate-400">
                      Nessuna transazione. I pagamenti appariranno qui.
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}

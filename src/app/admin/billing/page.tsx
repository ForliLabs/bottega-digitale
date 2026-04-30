export const dynamic = "force-dynamic";
import { calculateMRR, getPaymentStats, getBusinessMetrics, checkRevenueAlerts, getARRProjection } from "@/lib/billing-analytics";
import Link from "next/link";

export default async function AdminBillingPage() {
  const [mrr, payments, bizMetrics, alerts, arr] = await Promise.all([
    calculateMRR(),
    getPaymentStats(30),
    getBusinessMetrics(),
    checkRevenueAlerts(),
    getARRProjection(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Intelligenza Finanziaria
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                Dashboard Ricavi 💰
              </h1>
            </div>
            <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
          </div>
        </section>

        {/* Revenue Alerts */}
        {alerts.length > 0 && (
          <section className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-xl p-4 text-sm font-medium ${
                  alert.severity === "critical"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {alert.severity === "critical" ? "🚨" : "⚠️"} {alert.message}
              </div>
            ))}
          </section>
        )}

        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <RevenueCard
            label="MRR"
            value={`€${mrr.total.toLocaleString("it-IT")}`}
            subtitle="Ricavi mensili ricorrenti"
            icon="📊"
          />
          <RevenueCard
            label="ARR Proiettato"
            value={`€${Math.round(arr.currentARR).toLocaleString("it-IT")}`}
            subtitle={`Crescita ${(arr.monthlyGrowthRate * 100).toFixed(1)}%/mese`}
            icon="📈"
          />
          <RevenueCard
            label="Nuovo MRR"
            value={`€${mrr.newMRR.toLocaleString("it-IT")}`}
            subtitle="Ultimi 30 giorni"
            icon="🆕"
          />
          <RevenueCard
            label="Ricavi Transazioni"
            value={`€${payments.totalRevenue.toLocaleString("it-IT", { minimumFractionDigits: 2 })}`}
            subtitle={`${payments.transactionCount} transazioni`}
            icon="💳"
          />
        </div>

        {/* Business & Plan Metrics */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Distribuzione Piani</h2>
            <div className="space-y-4">
              {Object.entries(mrr.byTier).map(([tier, data]) => {
                const totalBiz = Object.values(mrr.byTier).reduce((s, t) => s + t.count, 0);
                const pct = totalBiz > 0 ? (data.count / totalBiz * 100) : 0;
                return (
                  <div key={tier}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700">{tier}</span>
                      <span className="text-slate-500">{data.count} attività · €{data.mrr}/mese</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {Object.keys(mrr.byTier).length === 0 && (
                <p className="text-sm text-slate-500">Nessuna attività registrata ancora.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Metriche Attività</h2>
            <div className="space-y-3">
              <MetricRow label="Attività totali" value={String(bizMetrics.totalBusinesses)} />
              <MetricRow label="Attive (7gg)" value={String(bizMetrics.activeBusinesses)} />
              <MetricRow label="Nuove (30gg)" value={String(bizMetrics.newBusinesses30d)} />
              <MetricRow
                label="Ricavo medio/attività"
                value={`€${bizMetrics.averageRevenuePerBusiness.toFixed(2)}/mese`}
              />
            </div>
          </section>
        </div>

        {/* Payment Breakdown */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Dettaglio Pagamenti (30gg)</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniMetric label="Acconti" value={`€${payments.depositVolume.toFixed(2)}`} />
            <MiniMetric label="Buoni regalo" value={`€${payments.giftCardVolume.toFixed(2)}`} />
            <MiniMetric label="Media transazione" value={`€${payments.averageTransaction.toFixed(2)}`} />
            <MiniMetric
              label="Tasso fallimento"
              value={`${(payments.failureRate * 100).toFixed(1)}%`}
              alert={payments.failureRate > 0.05}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function RevenueCard({ label, value, subtitle, icon }: { label: string; value: string; subtitle: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-700">{label}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function MiniMetric({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl p-4 ${alert ? "bg-red-50" : "bg-slate-50"}`}>
      <p className={`text-lg font-bold ${alert ? "text-red-700" : "text-slate-900"}`}>{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

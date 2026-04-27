export const dynamic = "force-dynamic";
import { getPlatformStats, getAtRiskBusinesses, getCohortData } from "@/lib/platform-analytics";
import { formatEuro } from "@/lib/e-invoice";

const RISK_STYLES: Record<string, string> = {
  healthy: "bg-green-100 text-green-700",
  at_risk: "bg-amber-100 text-amber-700",
  churning: "bg-red-100 text-red-700",
};

const RISK_LABELS: Record<string, string> = {
  healthy: "Sano",
  at_risk: "A rischio",
  churning: "In abbandono",
};

export default async function AdminDashboard() {
  const [stats, atRisk, cohorts] = await Promise.all([
    getPlatformStats(),
    getAtRiskBusinesses(),
    getCohortData(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-gray-50 p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Intelligenza Piattaforma
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Analytics interne di Bottega Digitale: metriche SaaS, salute delle attività,
            adozione funzionalità e prevenzione abbandono.
          </p>
        </section>

        {/* KPIs */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">MRR</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{formatEuro(stats.mrr)}</p>
            <p className="mt-1 text-xs text-slate-400">
              ARR: {formatEuro(stats.arr)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Attività totali</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalBusinesses}</p>
            <p className="mt-1 text-xs text-slate-400">
              {stats.activeBusinesses} con sito online
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Prenotazioni totali</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stats.totalBookings}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Eventi (24h)</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{stats.recentEvents}</p>
          </div>
        </section>

        {/* Subscription tiers */}
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Distribuzione piani</h2>
            <div className="mt-4 space-y-3">
              {stats.tierCounts.map((tc) => (
                <div key={tc.tier} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize text-slate-900">{tc.tier}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-500"
                        style={{
                          width: `${stats.totalBusinesses > 0 ? (tc.count / stats.totalBusinesses) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{tc.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Health distribution */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Salute attività</h2>
            <div className="mt-4 space-y-3">
              {stats.healthDistribution.length > 0 ? (
                stats.healthDistribution.map((h) => (
                  <div key={h.tier} className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${RISK_STYLES[h.tier] || "bg-slate-100"}`}>
                      {RISK_LABELS[h.tier] || h.tier}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{h.count} attività</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">Nessun punteggio di salute calcolato ancora.</p>
              )}
            </div>
          </section>
        </div>

        {/* Feature adoption heatmap */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Adozione funzionalità</h2>
          <p className="mt-1 text-sm text-slate-500">
            Percentuale di attività che usano ciascun modulo
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {stats.featureAdoption.map((f) => (
              <div key={f.name} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{f.name}</span>
                  <span className="text-sm font-bold text-slate-900">{f.percentage}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${f.percentage > 50 ? "bg-green-500" : f.percentage > 20 ? "bg-amber-500" : "bg-red-400"}`}
                    style={{ width: `${f.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-400">{f.count} attività</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cohort chart (simplified) */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Crescita (ultimi 12 mesi)</h2>
          <div className="mt-4 flex items-end gap-2" style={{ height: 150 }}>
            {cohorts.map((c) => {
              const maxVal = Math.max(...cohorts.map((x) => x.newBusinesses), 1);
              const height = (c.newBusinesses / maxVal) * 100;
              return (
                <div key={c.label} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-xs font-medium text-slate-900">{c.newBusinesses}</span>
                  <div
                    className="w-full rounded-t bg-amber-400"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-[10px] text-slate-400">{c.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* At-risk businesses */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900">🚨 Attività a rischio</h2>
            <p className="text-sm text-slate-500">Intervieni proattivamente per ridurre il churn</p>
          </div>
          <div className="divide-y divide-slate-100">
            {atRisk.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{item.business.name}</p>
                  <p className="text-sm text-slate-500">
                    {item.business.category} · {item.business.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Score: {item.score}/100</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${RISK_STYLES[item.riskTier]}`}>
                    {RISK_LABELS[item.riskTier]}
                  </span>
                </div>
              </div>
            ))}
            {atRisk.length === 0 && (
              <div className="px-6 py-12 text-center text-sm text-slate-400">
                Nessuna attività a rischio. Ottimo lavoro! 🎉
              </div>
            )}
          </div>
        </section>

        {/* City distribution */}
        {stats.cityDistribution.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Distribuzione geografica</h2>
            <div className="mt-4 space-y-2">
              {stats.cityDistribution.map((c) => (
                <div key={c.city} className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">{c.city}</span>
                  <span className="text-sm font-semibold text-slate-900">{c.count} attività</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

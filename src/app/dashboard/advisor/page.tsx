export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getLatestInsights, generateBusinessMetrics, generateInsights, saveInsights } from "@/lib/ai-advisor";

const CATEGORY_STYLES: Record<string, { bg: string; icon: string; label: string }> = {
  revenue: { bg: "bg-emerald-50 border-emerald-200", icon: "💰", label: "Ricavi" },
  schedule: { bg: "bg-blue-50 border-blue-200", icon: "📅", label: "Agenda" },
  retention: { bg: "bg-purple-50 border-purple-200", icon: "🔄", label: "Fidelizzazione" },
  reputation: { bg: "bg-amber-50 border-amber-200", icon: "⭐", label: "Reputazione" },
  benchmark: { bg: "bg-sky-50 border-sky-200", icon: "📊", label: "Confronto" },
};

export default async function AdvisorPage() {
  const business = await getBusinessContext();

  let insights: { id: string; category: string; title: string; body: string; actionLabel: string | null; createdAt: Date }[] = [];
  let metrics = null;

  if (business) {
    // Auto-generate insights if none exist
    const existing = await getLatestInsights(business.id, 10);
    if (existing.length === 0) {
      const generated = await generateInsights(business.id);
      await saveInsights(business.id, generated);
      insights = await getLatestInsights(business.id, 10);
    } else {
      insights = existing;
    }
    metrics = await generateBusinessMetrics(business.id);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
          Consigliere AI
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Insight per la tua Bottega
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Analisi intelligente dei tuoi dati con consigli azionabili per far crescere la tua attività.
        </p>
      </section>

      {/* Metrics summary */}
      {metrics && (
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{metrics.totalBookings}</p>
            <p className="text-xs text-slate-500">Prenotazioni (30gg)</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">
              {metrics.averageRating > 0 ? `${metrics.averageRating.toFixed(1)} ★` : "—"}
            </p>
            <p className="text-xs text-slate-500">Media recensioni</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{metrics.repeatCustomers}</p>
            <p className="text-xs text-slate-500">Clienti ritornanti</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{metrics.onlineBookingPercentage.toFixed(0)}%</p>
            <p className="text-xs text-slate-500">Prenotazioni online</p>
          </div>
        </section>
      )}

      {/* Insights */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">💡 Consigli per te</h2>
        {insights.map((insight) => {
          const style = CATEGORY_STYLES[insight.category] || CATEGORY_STYLES.revenue;
          return (
            <div key={insight.id} className={`rounded-2xl border p-6 ${style.bg}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{style.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {style.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(insight.createdAt).toLocaleDateString("it-IT")}
                    </span>
                  </div>
                  <h3 className="mt-2 text-base font-semibold text-slate-900">{insight.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">{insight.body}</p>
                  {insight.actionLabel && (
                    <button className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                      {insight.actionLabel} →
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {insights.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-3xl">🤖</p>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessun insight disponibile</h3>
            <p className="mt-2 text-sm text-slate-500">
              Quando avrai abbastanza dati (prenotazioni, recensioni, clienti), il Consigliere AI genererà
              suggerimenti personalizzati per la tua attività.
            </p>
          </div>
        )}
      </section>

      {/* Booking distribution chart (text-based) */}
      {metrics && metrics.totalBookings > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">📊 Distribuzione prenotazioni per giorno</h2>
          <div className="mt-4 space-y-2">
            {Object.entries(metrics.bookingsByDay).map(([day, count]) => {
              const max = Math.max(...Object.values(metrics.bookingsByDay), 1);
              const pct = (count / max) * 100;
              return (
                <div key={day} className="flex items-center gap-3 text-sm">
                  <span className="w-24 text-slate-600">{day}</span>
                  <div className="flex-1">
                    <div className="h-6 rounded-full bg-slate-100">
                      <div
                        className="h-6 rounded-full bg-indigo-400 transition-all"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-8 text-right font-medium text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

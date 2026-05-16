export const dynamic = "force-dynamic";
import { getJobStats } from "@/lib/job-scheduler";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  running: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const TYPE_LABELS: Record<string, string> = {
  "booking-reminder": "📅 Promemoria prenotazione",
  "google-review-sync": "🔄 Sync recensioni Google",
  "social-publisher": "📸 Pubblicazione social",
  "loyalty-birthday": "🎂 Auguri compleanno",
  "subscription-warning": "⚠️ Avviso abbonamento",
  "insight-generator": "💡 Generazione insight",
  "automation-trigger": "⚡ Automazione",
};

export default async function JobsPage() {
  const stats = await getJobStats();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-sky-200 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-700">
          Attività programmate
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Attività in Background
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Promemoria automatici, sincronizzazioni, pubblicazioni programmate e altre attività in background.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
          <p className="text-sm text-yellow-600">In coda</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.running}</p>
          <p className="text-sm text-blue-600">In esecuzione</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-700">{stats.completed}</p>
          <p className="text-sm text-emerald-600">Completati</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
          <p className="text-sm text-red-600">Falliti</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Attività recenti</h2>
          <p className="text-sm text-slate-500">Ultime 20 attività eseguite o programmate.</p>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentJobs.map((job) => (
            <div key={job.id} className="flex flex-col gap-2 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-900">
                  {TYPE_LABELS[job.type] || job.type}
                </p>
                <p className="text-sm text-slate-500">
                  Programmato: {new Date(job.scheduledAt).toLocaleString("it-IT")}
                  {job.completedAt && ` · Completato: ${new Date(job.completedAt).toLocaleString("it-IT")}`}
                </p>
                {job.error && (
                  <p className="mt-1 text-xs text-red-500">Errore: {job.error}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {job.retryCount > 0 && (
                  <span className="text-xs text-slate-400">
                    Tentativi: {job.retryCount}/{job.maxRetries}
                  </span>
                )}
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status] || "bg-slate-100 text-slate-500"}`}>
                  {job.status}
                </span>
              </div>
            </div>
          ))}
          {stats.recentJobs.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-400">
              Nessuna attività in background ancora. Le attività verranno create automaticamente
              dalle automazioni e dalle funzionalità programmate.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export const dynamic = "force-dynamic";
import { getSystemHealth } from "@/lib/observability";
import { getDatabaseInfo } from "@/lib/prisma";
import { broadcaster } from "@/lib/realtime";
import { rateLimiter } from "@/lib/rate-limiter";
import { getEventRouterStats } from "@/lib/event-router";
import Link from "next/link";

export default function AdminHealthPage() {
  const health = getSystemHealth();
  const dbInfo = getDatabaseInfo();
  const sseConnections = broadcaster.getConnectionCount();
  const rateLimitStats = rateLimiter.getStats();
  const eventRouterStats = getEventRouterStats();

  const statusColor = health.status === "healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-gray-50 p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                Osservabilità Sistema
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
                Dashboard Salute ❤️‍🩹
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-4 py-1 text-sm font-semibold ${statusColor}`}>
                {health.status === "healthy" ? "✅ Sano" : "⚠️ Degradato"}
              </span>
              <Link href="/admin" className="text-sm text-blue-600 hover:underline">← Admin</Link>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Uptime" value={health.uptime.formatted} icon="⏱️" />
          <MetricCard label="Errori (1h)" value={String(health.errors.count)} icon="🐛" color={health.errors.count > 0 ? "red" : "green"} />
          <MetricCard label="Connessioni SSE" value={String(sseConnections)} icon="📡" />
          <MetricCard label="Memoria (MB)" value={`${health.memory.heapUsed}/${health.memory.rss}`} icon="💾" />
        </div>

        {/* System Info */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Database</h2>
            <div className="space-y-3">
              <InfoRow label="Provider" value={dbInfo.provider} />
              <InfoRow label="URL" value={dbInfo.url} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Event Router</h2>
            <div className="space-y-3">
              <InfoRow label="Eventi supportati" value={String(eventRouterStats.supportedEvents)} />
              <InfoRow label="Business connessi (SSE)" value={String(eventRouterStats.connectedBusinesses)} />
              <InfoRow label="Rate limit tracciati" value={String(rateLimitStats.trackedKeys)} />
            </div>
          </section>
        </div>

        {/* Route Performance */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Prestazioni Rotte (ultima ora)</h2>
          {Object.keys(health.routes).length === 0 ? (
            <p className="text-sm text-slate-500">Nessuna metrica raccolta ancora. Le metriche appariranno dopo le prime richieste API.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="pb-2 pr-4">Rotta</th>
                    <th className="pb-2 pr-4">Richieste</th>
                    <th className="pb-2 pr-4">p50</th>
                    <th className="pb-2 pr-4">p95</th>
                    <th className="pb-2 pr-4">Errori</th>
                    <th className="pb-2">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(health.routes).map(([route, stats]) => (
                    <tr key={route} className="border-b border-slate-100">
                      <td className="py-2 pr-4 font-mono text-xs">{route}</td>
                      <td className="py-2 pr-4">{(stats as Record<string, number>).count}</td>
                      <td className="py-2 pr-4">{(stats as Record<string, number>).p50}ms</td>
                      <td className="py-2 pr-4">{(stats as Record<string, number>).p95}ms</td>
                      <td className="py-2 pr-4">{((stats as Record<string, number>).errorRate * 100).toFixed(1)}%</td>
                      <td className="py-2">{(stats as Record<string, number>).avgMs}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Errors */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Errori Recenti</h2>
          {health.errors.recent.length === 0 ? (
            <p className="text-sm text-slate-500">🎉 Nessun errore nell&apos;ultima ora!</p>
          ) : (
            <div className="space-y-2">
              {health.errors.recent.map((err, i) => (
                <div key={i} className="rounded-lg bg-red-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-red-800">{err.message}</span>
                    <span className="text-xs text-red-500">{err.timestamp}</span>
                  </div>
                  {err.route && <p className="mt-1 text-xs text-red-600">Rotta: {err.route}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color?: string }) {
  const bg = color === "red" ? "bg-red-50" : color === "green" ? "bg-green-50" : "bg-slate-50";
  return (
    <div className={`rounded-2xl border border-slate-200 ${bg} p-4 shadow-sm`}>
      <p className="text-2xl">{icon}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

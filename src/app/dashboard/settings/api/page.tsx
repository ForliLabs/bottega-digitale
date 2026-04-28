export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { listApiKeys, WEBHOOK_EVENTS } from "@/lib/webhook-api";
import { prisma } from "@/lib/prisma";

export default async function ApiSettingsPage() {
  const business = await getBusinessContext();
  const apiKeys = business ? await listApiKeys(business.id) : [];
  const webhookEndpoints = business
    ? await prisma.webhookEndpoint.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-700">
          API Aperta
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          API & Webhook
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Gestisci le chiavi API e configura webhook per integrare la tua attività con sistemi esterni.
          Documentazione completa su <code className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-xs">/api/openapi</code>.
        </p>
      </section>

      {/* API Keys */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Chiavi API</h3>
          <span className="text-xs text-slate-400">{apiKeys.length} chiavi</span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-2xl">🔑</p>
            <h4 className="mt-3 text-sm font-semibold text-slate-900">Nessuna chiave API</h4>
            <p className="mt-1 text-xs text-slate-500">
              Crea una chiave API per integrare i tuoi sistemi. Usa <code className="rounded bg-slate-100 px-1 font-mono text-xs">POST /api/api-keys</code>.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{key.name}</p>
                  <p className="font-mono text-xs text-slate-400">{key.keyPrefix}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400">
                    {key.scopes}
                  </span>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    key.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {key.active ? "Attiva" : "Revocata"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Webhook Endpoints */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Webhook Endpoints</h3>
          <span className="text-xs text-slate-400">{webhookEndpoints.length} endpoint</span>
        </div>

        {webhookEndpoints.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-2xl">🔗</p>
            <h4 className="mt-3 text-sm font-semibold text-slate-900">Nessun webhook configurato</h4>
            <p className="mt-1 text-xs text-slate-500">
              Registra un endpoint per ricevere notifiche in tempo reale.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {webhookEndpoints.map((ep) => (
              <div key={ep.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-700">{ep.url}</p>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    ep.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}>
                    {ep.active ? "Attivo" : "Disabilitato"}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">Eventi: {ep.events === "*" ? "Tutti" : ep.events}</span>
                  {ep.failCount > 0 && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] text-red-600">
                      {ep.failCount} errori
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Available Events */}
      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700">Eventi disponibili</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEBHOOK_EVENTS.map((event) => (
            <div key={event.type} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-mono text-xs font-medium text-indigo-600">{event.type}</p>
              <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

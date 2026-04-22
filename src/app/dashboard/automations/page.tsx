export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { seedDefaultFlows } from "@/lib/event-bus";

const EVENT_LABELS: Record<string, string> = {
  "booking.created": "📅 Prenotazione creata",
  "booking.completed": "✅ Prenotazione completata",
  "booking.cancelled": "❌ Prenotazione cancellata",
  "customer.created": "👤 Nuovo cliente",
  "review.received": "⭐ Recensione ricevuta",
  "loyalty.threshold_reached": "🎁 Soglia fedeltà raggiunta",
  "queue.turn_approaching": "🔔 Turno in arrivo",
};

const ACTION_LABELS: Record<string, string> = {
  "whatsapp.send_message": "💬 Invia WhatsApp",
  "whatsapp.send_template": "📨 Invia template WhatsApp",
  "loyalty.award_points": "⭐ Assegna punti fedeltà",
  "crm.update_customer": "👥 Aggiorna CRM",
  "social.generate_post": "📸 Genera post social",
  "insight.log": "📝 Registra evento",
};

interface ActionConfig {
  type: string;
  params: Record<string, unknown>;
}

export default async function AutomationsPage() {
  const business = await getBusinessContext();

  let flows: { id: string; name: string; description: string | null; triggerEvent: string; actions: string; enabled: boolean; executions: { id: string; status: string; startedAt: Date }[] }[] = [];

  if (business) {
    const count = await prisma.automationFlow.count({ where: { businessId: business.id } });
    if (count === 0) {
      await seedDefaultFlows(business.id);
    }
    flows = await prisma.automationFlow.findMany({
      where: { businessId: business.id },
      include: { executions: { orderBy: { startedAt: "desc" }, take: 3 } },
      orderBy: { createdAt: "asc" },
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-700">
          Automazioni
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Flussi Automatici
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Collega prenotazioni, fedeltà, WhatsApp e CRM in flussi automatici.
          Configura le regole e lascia che Bottega Digitale lavori per te.
        </p>
      </section>

      <div className="grid gap-6">
        {flows.map((flow) => {
          const actions: ActionConfig[] = JSON.parse(flow.actions);
          const totalExecutions = flow.executions.length;

          return (
            <div key={flow.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{flow.name}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      flow.enabled
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {flow.enabled ? "Attivo" : "Disattivato"}
                    </span>
                  </div>
                  {flow.description && (
                    <p className="mt-1 text-sm text-slate-500">{flow.description}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-medium text-blue-700">
                  Quando: {EVENT_LABELS[flow.triggerEvent] || flow.triggerEvent}
                </span>
                <span className="text-slate-400">→</span>
                {actions.map((action, i) => (
                  <span key={i} className="rounded-lg bg-amber-50 px-3 py-1.5 font-medium text-amber-700">
                    {ACTION_LABELS[action.type] || action.type}
                  </span>
                ))}
              </div>

              {totalExecutions > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-medium text-slate-500">Ultime esecuzioni:</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {flow.executions.map((exec) => (
                      <span key={exec.id} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        exec.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : exec.status === "failed"
                          ? "bg-red-50 text-red-600"
                          : "bg-yellow-50 text-yellow-600"
                      }`}>
                        {exec.status === "completed" ? "✓" : exec.status === "failed" ? "✗" : "◌"}
                        {new Date(exec.startedAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {flows.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-3xl">⚡</p>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Nessun flusso configurato</h3>
          <p className="mt-2 text-sm text-slate-500">
            Configura il tuo primo flusso automatico per collegare le funzioni della tua bottega.
          </p>
        </div>
      )}
    </div>
  );
}

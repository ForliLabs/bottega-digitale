export const dynamic = "force-dynamic";
import { getBusinessContext } from "@/lib/auth";
import { getConversationStats } from "@/lib/whatsapp-ai";

export default async function WhatsAppAIPage() {
  const business = await getBusinessContext();
  const stats = business ? await getConversationStats(business.id) : null;

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          Assistente Virtuale
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          WhatsApp AI
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Chatbot intelligente che risponde automaticamente ai messaggi WhatsApp dei clienti.
          Gestisce prenotazioni, punti fedeltà, stato coda e domande frequenti.
        </p>
      </section>

      {/* AI Status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Stato Assistente</h2>
            <p className="mt-1 text-sm text-slate-500">
              {business?.whatsappAiEnabled
                ? "L'assistente è attivo e risponde ai messaggi"
                : "L'assistente è disattivato"}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
              business?.whatsappAiEnabled
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                business?.whatsappAiEnabled ? "bg-green-500" : "bg-slate-400"
              }`}
            />
            {business?.whatsappAiEnabled ? "Attivo" : "Disattivo"}
          </span>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.totalMessages}</p>
            <p className="text-xs text-slate-500">Messaggi ricevuti</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.aiResponses}</p>
            <p className="text-xs text-slate-500">Risposte AI</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.activeConversations}</p>
            <p className="text-xs text-slate-500">Conversazioni attive</p>
          </div>
        </section>
      )}

      {/* Configuration */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Configurazione</h2>
        </div>
        <div className="space-y-4 p-6">
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-medium text-slate-900">Personalità</h3>
            <p className="mt-1 text-sm text-slate-500">
              Attuale: <span className="font-medium capitalize">{business?.whatsappAiPersonality || "amichevole"}</span>
            </p>
            <p className="mt-2 text-xs text-slate-400">
              &quot;Amichevole&quot; usa il tu, &quot;Formale&quot; usa il Lei
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-medium text-slate-900">Funzionalità supportate</h3>
            <ul className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Prenotazioni automatiche
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Saldo punti fedeltà
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Stato coda
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Orari di apertura
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> Cancellazione prenotazioni
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span> FAQ personalizzate
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Safety Info */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="font-semibold text-amber-900">Sicurezza e controlli</h3>
        <ul className="mt-3 space-y-2 text-sm text-amber-800">
          <li>• Rate limiting: massimo 30 messaggi/ora per numero</li>
          <li>• Escalation automatica al titolare per messaggi non compresi</li>
          <li>• Tutte le conversazioni sono registrate e visibili nella dashboard</li>
          <li>• L&apos;AI verifica sempre la disponibilità reale prima di confermare</li>
          <li>• Budget mensile configurabile per costi OpenAI</li>
        </ul>
      </section>
    </div>
  );
}

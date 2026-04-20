export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/auth";
import { isWhatsAppConfigured } from "@/lib/whatsapp";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function WhatsAppPage() {
  const business = await getBusinessContext();
  const whatsappReady = isWhatsAppConfigured();

  const messages = business
    ? await prisma.whatsappMessage.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const inbound = messages.filter((m) => m.direction === "inbound");
  const outbound = messages.filter((m) => m.direction === "outbound");

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
          Messaggistica WhatsApp
        </p>
        <h1 className="text-3xl font-bold text-slate-900">WhatsApp Business</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600">
          Invia conferme, promemoria e messaggi ai clienti direttamente tramite WhatsApp.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Messaggi inviati</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{outbound.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Messaggi ricevuti</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{inbound.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Stato connessione</p>
          <p className="mt-2 text-lg font-bold">
            {whatsappReady ? (
              <span className="text-emerald-600">✅ Connesso</span>
            ) : (
              <span className="text-amber-600">⚠️ Non configurato</span>
            )}
          </p>
        </div>
      </section>

      {!whatsappReady && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-amber-800">Configura WhatsApp Business</h3>
          <p className="mt-2 text-sm text-amber-700">
            Per attivare WhatsApp, imposta WHATSAPP_TOKEN e configura il WhatsApp Phone ID nelle
            impostazioni dell&apos;attività. Supportiamo Twilio e la Cloud API ufficiale di Meta.
          </p>
          <div className="mt-4 space-y-2 text-sm text-amber-700">
            <p>📋 <strong>Template disponibili:</strong></p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Conferma prenotazione</li>
              <li>Promemoria appuntamento (24h e 2h prima)</li>
              <li>Richiesta recensione post-visita</li>
              <li>Notifica turno in coda</li>
              <li>Aggiornamento punti fedeltà</li>
            </ul>
          </div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">Messaggi recenti</h2>
          <p className="text-sm text-slate-500">Conversazioni con i clienti via WhatsApp.</p>
        </div>
        {messages.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-4 px-6 py-4">
                <span
                  className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    msg.direction === "inbound"
                      ? "bg-sky-100 text-sky-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {msg.direction === "inbound" ? "↓ Ricevuto" : "↑ Inviato"}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{msg.phone}</p>
                  <p className="mt-1 text-sm text-slate-600">{msg.body}</p>
                </div>
                <span className="text-xs text-slate-400">
                  {dateFormatter.format(new Date(msg.createdAt))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Nessun messaggio ancora. I messaggi appariranno qui una volta configurato WhatsApp.
          </div>
        )}
      </section>
    </div>
  );
}
